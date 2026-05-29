const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User, UserDetail } = require("../models");
const { Op } = require("sequelize");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

// Nodemailer config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      console.log("=== GOOGLE OAUTH CALLBACK ===");
      console.log("State from URL:", req.query.state);
      console.log("Google Profile Emails:", profile.emails);
      console.log("Extracted Email:", profile.emails?.[0]?.value);
      console.log("Is Signup Flow:", req.query.state?.startsWith("signup_"));
      try {
        const state = req.session?.googleOAuthState || req.query.state;
        console.log("=== GOOGLE CALLBACK ===");
        console.log("Final State (from session or query):", state);

        const isSignup = state?.startsWith("signup_");
        const userRole = isSignup ? state.replace("signup_", "") : null;
        console.log("the user role is ", userRole);

        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(null, false, { message: "No email from Google" });
        }

        let user = await User.findOne({
          where: {
            [Op.or]: [{ google_id: profile.id }, { email }],
          },
        });

        if (user) {
          if (!user.google_id) user.google_id = profile.id;
          if (user.status === 0) user.status = 1;
          await user.save();
          return done(null, user);
        }

        if (!isSignup) {
          return done(null, false, { message: "no_account",    email: email,  });
        }

        // CREATE USER
        const salt = await bcrypt.genSalt(10);
        const dummyPassword = await bcrypt.hash("google_oauth_dummy", salt);

        user = await User.create({
          first_name: profile.name?.givenName || "Unknown",
          last_name: profile.name?.familyName || "",
          email,
          phone: "9999999999",
          password: dummyPassword,
          user_role: userRole,
          google_id: profile.id,
          status: 1,
          accepted_terms_at: new Date(),
        });

        //send signup email fire and forget
        const mailOptions = {
            from: `"Job Portal" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: `Signup successful`,
            html: `
            <h2>Thank You </h2>
            <p>Hello ${user.first_name || "User"},</p>
            <div style="background:#f5f5f5;padding:20px;text-align:center;margin:20px 0;">
              <h1 style="color:#007bff;letter-spacing:5px;"></h1>
            </div>
            <p>Thank you for signing up.</p>
          `,
          };

          transporter.sendMail(mailOptions);

        return done(null, user);
      } catch (err) {
        console.error(" Strategy Error:", err.message);
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
