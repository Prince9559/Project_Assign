const jwt = require('jsonwebtoken');
const { User, UserDetail, OTP, CompanyRecruiterProfile,UniversityDetail} = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');
const otpController = require('./otpController');
const nodemailer = require("nodemailer");

const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.APP_GOOGLE_CLIENT_ID);

const { getRBACContext } = require('../utils/rbacContext');

const { generateAuthToken } = require("../utils/jwtHelpers");





const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.googleSignIn = async (req, res) => {
  console.log("\n=== GOOGLE SIGN-IN REQUEST RECEIVED ===");
  console.log("Request Body:", req.body);

  try {
    const { idToken, user_role } = req.body;

    //  STEP 1: Validate idToken
    if (!idToken) {
      console.warn(" ERROR: idToken missing in request body");
      return res.status(400).json({
        success: false,
        error: "Google ID token is required. Please send 'idToken' in request body.",
      });
    }

    console.log(" idToken received. Length:", idToken.length);

    // STEP 2: Verify token with Google
    console.log(" Verifying token with Google using Client ID:", process.env.APP_GOOGLE_CLIENT_ID);

    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.APP_GOOGLE_CLIENT_ID, // Must match exactly
      });
    } catch (verifyError) {
      console.error(" GOOGLE TOKEN VERIFICATION FAILED:", verifyError.message);
      return res.status(401).json({
        success: false,
        error: "Invalid or expired Google ID token. Please sign in again.",
        details: verifyError.message,
      });
    }


    const payload = ticket.getPayload();
    console.log(" Google token verified. Payload:", payload);

    const googleId = payload.sub;
    const email = payload.email;
    const firstName = payload.given_name || "Unknown";
    const lastName = payload.family_name || "";

    // STEP 3: Validate email
    if (!email) {
      console.warn(" ERROR: Google account has no email");
      return res.status(400).json({
        success: false,
        error: "Google account must have a verified email address.",
      });
    }

    console.log(` User email: ${email}, Google ID: ${googleId}`);

    //  STEP 4: Find existing user
    let user = await User.findOne({
      where: {
        [Op.or]: [{ google_id: googleId }, { email: email }],
      },
    });

    if (user) {
      console.log(`Existing user found: ID ${user.id}, Email: ${user.email}`);

      // Update google_id if missing
      if (!user.google_id) {
        console.log(" Updating user.google_id");
        user.google_id = googleId;
      }

      // Mark as verified
      if (user.status === 0) {
        console.log(" Updating user.status to 1 (verified)");
        user.status = 1;

        if (updatedUser.status === 1) {
          //Sending user successful signup email
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
        }
      }

      await user.save();
      console.log(" User record updated");

      //  Generate JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.user_role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY }
      );

      console.log(" JWT generated");
      // SET SSO TOKEN COOKIE
      res.cookie('sso_token', token, {
        domain: '.scilienttech.com',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      //  Fetch extra details based on role
      let extraDetails = {};
      try {
        if (user.user_role === "STUDENT") {
          const userDetail = await UserDetail.findOne({
            where: { user_id: user.id },
            attributes: ["user_profile_pic", "about_us", "career_objective"],
          });
          extraDetails = {
            user_profile_pic: userDetail?.user_profile_pic || null,
            about_us: userDetail?.about_us || null,
            career_objective: userDetail?.career_objective || null,
          };
        } else if (user.user_role === "COMPANY") {
          const profile = await CompanyRecruiterProfile.findOne({
            where: { user_id: user.id },
            attributes: ["profile_pic", "about", "company_name", "logo_url"],
          });
          extraDetails = {
            user_profile_pic: profile?.profile_pic || null,
            about_us: profile?.about || null,
            organization_name: profile?.company_name || null,
            organization_logo: profile?.logo_url || null,
          };
        } else if (user.user_role === "UNIVERSITY") {
          const profile = await UniversityDetail.findOne({
            where: { user_id: user.id },
            attributes: ["profile_pic", "about", "college_name", "university_logo_url"],
          });
          extraDetails = {
            user_profile_pic: profile?.profile_pic || null,
            about_us: profile?.about || null,
            organization_name: profile?.college_name || null,
            organization_logo: profile?.university_logo_url || null,
          };
        }
      } catch (detailError) {
        console.warn(" Failed to load extra details:", detailError.message);
      }

      console.log(" Responding with user data");
      return res.json({
        success: true,
        token,
        user: {
          id: user.id,
          uuid: user.uuid,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          user_role: user.user_role,
          profile_status: user.status,
          ...extraDetails,
        },
      });
    }

    // STEP 5: Handle NEW USER
    console.log(" No existing user found. Creating new account...");

    if (!user_role) {
      console.warn(" ERROR: user_role missing for new user");
      return res.status(400).json({
        success: false,
        error: "User not found. Please provide 'user_role' (STUDENT, COMPANY, UNIVERSITY) to create new account.",
      });
    }

    if (!["STUDENT", "COMPANY", "UNIVERSITY"].includes(user_role)) {
      console.warn("ERROR: Invalid user_role:", user_role);
      return res.status(400).json({
        success: false,
        error: "Invalid user_role. Allowed values: STUDENT, COMPANY, UNIVERSITY",
      });
    }

    //  Create new user
    const salt = await bcrypt.genSalt(10);
    const dummyPassword = await bcrypt.hash("google_oauth_dummy", salt);

    user = await User.create({
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: "9999999999", // Temporary — prompt user to update later
      password: dummyPassword,
      user_role: user_role,
      google_id: googleId,
      status: 1, // Google = verified
    });

    console.log(" New user created with ID:", user.id);

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.user_role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );
    // SET SSO TOKEN COOKIE
    res.cookie('sso_token', token, {
      domain: '.scilienttech.com',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

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

    console.log("JWT generated for new user");

    console.log("SUCCESS: Responding with new user data");
    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        user_role: user.user_role,
        profile_status: user.status,
      },
    });

  } catch (err) {
    console.error(" UNEXPECTED ERROR in googleSignIn:", err);
    console.error("Stack:", err.stack);

    return res.status(500).json({
      success: false,
      error: "Internal server error during Google sign-in. Please try again later.",
      debug: err.message,
    });
  }
};

exports.registerUser = async (req, res) => {

  //signup scren enter detail  (check status)---> go to email verification for otp enter screen..-> then signed up
  const {
    first_name,
    last_name,
    email,
    phone,
    password,
    user_role,
    accepted_terms,
  } = req.body;
  // console.log(first_name, last_name, email, phone, password, user_role);
  try {
    const existing = await User.findOne({ where: { email } });

    if(existing){
      if(existing.status === 0){
        //signed up but email not verified and trying to update then just update the details and let the normal signup flow work

        await existing.update({
          first_name,
          last_name,
          phone,
          password, 
          user_role,
          accepted_terms_at: accepted_terms ? new Date() : existing.accepted_terms_at,
        });

      
        // Return same response as new registration
        return res.status(201).json({
          message: 'User registered',
          user: {
            id: existing.id,
            first_name: existing.first_name,
            last_name: existing.last_name,
            phone: existing.phone,
            email: existing.email,
            user_role: existing.user_role,
          },
        });
      }

      // Status 1 or 2 → account is active or complete → reject
      return res.status(409).json({ message: 'Account already exists' });

      }
    
    //new useer registration
    if (user_role === 'COMPANY') {
      const emailDomain = email.split('@')[1];
      const allowedDomains = ['.com', '.org', '.net', '.co', '.io', '.tech', '.in'];

      const isValidDomain = allowedDomains.some(domain => emailDomain.endsWith(domain));

      if (!isValidDomain) {
        return res.status(400).json({ message: 'Please provide a professional email address for the company role.' });
      }
    }

    // Encrypt password before saving

    const user = await User.create({
      first_name,
      last_name,
      email,
      phone,
      password: password,
      user_role,
      accepted_terms_at: accepted_terms ? new Date() : new Date(),
    });

  

    res
      .status(201)
      .json({
        message: "User registered",
        user: {
          id: user.id,
          uuid: user.uuid,
          first_name: user.first_name,
          last_name: user.last_name,
          phone: user.phone,
          email: user.email,
          user_role: user.user_role,
        },
      });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  // const { email, password } = req.body;
const { email, password, redirect: redirectUrl } = req.body;
  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    //  Compare password with hashed password in DB
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const normalizedRole = (user.user_role || "").toUpperCase();

    //check whether the status of the user is 1..that is email has been already verified or not
    //if 0 don't return the token
    if(user.status === 0){
      return res.status(200).json({
        success: true,
        message: "Email not verified",
        // profile_status:user.status,
        email: user.email,
        user_role: user.user_role,
        user: {
          id: user.id,
          uuid: user.uuid,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          phone: user.phone,
          user_role: user.user_role,
          profile_status: user.status,
        },
      });
    }

    // Security gate: enforce approval only after role onboarding is completed.
    // status 1 users must be allowed to log in so they can finish fill-details.
    if ((normalizedRole === "COMPANY" || normalizedRole === "UNIVERSITY") && user.status === 2) {
      if (user.is_deleted) {
        return res.status(403).json({
          success: false,
          message: "Account is inactive. Please contact support.",
        });
      }

      if (normalizedRole === "COMPANY") {
        const companyProfile = await CompanyRecruiterProfile.findOne({
          where: { user_id: user.id },
          attributes: ["status", "is_verified"],
        });

        if (!companyProfile) {
          return res.status(403).json({
            success: false,
            message: "Company profile not found. Please complete onboarding.",
          });
        }

        if (companyProfile.status !== 1) {
          return res.status(403).json({
            success: false,
            message: "Company account is inactive or blocked. Please contact support.",
          });
        }
      } else {
        const universityProfile = await UniversityDetail.findOne({
          where: { user_id: user.id },
          attributes: ["is_verified"],
        });

        if (!universityProfile) {
          return res.status(403).json({
            success: false,
            message: "University profile not found. Please complete onboarding.",
          });
        }

        // Do not block login when admin approval is pending.
        // Frontend routes unverified universities to /account-not-verified.
      }
    }
  
    //Proceed if status is 1 or 2

    let rbacContext = {
      scopeId: null,
      permissions: [],
      isOwner: false,
      roleName: null,
    };

    if (user.user_role === "COMPANY" && user.status === 2) {
      rbacContext = await getRBACContext(user.id);
    }



    //  Generate JWT token
    const token= await generateAuthToken(user);

    // Find extra profile details role-wise
    let extraDetails = {};

    if (user.user_role === "STUDENT") {
      const userDetail = await UserDetail.findOne({
        where: { user_id: user.id },
        attributes: ["user_profile_pic", "about_us", "career_objective"],
      });

      extraDetails = {
        user_profile_pic: userDetail?.dataValues.user_profile_pic || null,
        about_us: userDetail?.dataValues.about_us || null,
        career_objective: userDetail?.dataValues.career_objective || null,
      };
    } else if (user.user_role === "COMPANY") {
      const profile = await CompanyRecruiterProfile.findOne({
        where: { user_id: user.id },
        attributes: [
          "profile_pic",
          "about",
          "company_name",
          "logo_url",
          "is_verified",
          "status",
          "is_email_verified",
          "is_phone_verified",
          "is_gst_verified",
          "gst_number",
        ],
      });

      extraDetails = {
        user_profile_pic: profile?.dataValues.profile_pic || null,
        about_us: profile?.dataValues.about || null,
        organization_name:profile?.dataValues.company_name || null,
        organization_logo:profile?.dataValues.logo_url || null,
        verification_status: profile?.dataValues.is_verified ? "verified" : "not_verified",
        accountStatus: profile?.dataValues.is_verified ? "verified" : "not_verified",
        company_status: profile?.dataValues.status ?? null,
        is_email_verified: !!profile?.dataValues.is_email_verified,
        is_phone_verified: !!profile?.dataValues.is_phone_verified,
        is_gst_verified: !!profile?.dataValues.is_gst_verified,
        gst_number: profile?.dataValues.gst_number || null,
      };
    } else if (user.user_role === "UNIVERSITY") {
      const profile = await UniversityDetail.findOne({
        where: { user_id: user.id },
        attributes: ["profile_pic", "about", "college_name", "university_logo_url", "is_verified"],
      });

      extraDetails = {
        user_profile_pic: profile?.dataValues.profile_pic || null,
        about_us: profile?.dataValues.about || null,
        organization_name: profile?.dataValues.college_name || null,
        organization_logo: profile?.dataValues.university_logo_url || null,
        verification_status: profile?.dataValues.is_verified ? "verified" : "not_verified",
        accountStatus: profile?.dataValues.is_verified ? "verified" : "not_verified",
      };
    }

    
// SET SSO TOKEN COOKIE
    res.cookie('sso_token', token, {
      domain: '.scilienttech.com',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      
      token,
      redirectUrl: redirectUrl ? `${redirectUrl}?token=${token}` : null, 
      // profile_status:user.status,
      user: {
        id: user.id,
        uuid: user.uuid,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        user_role: user.user_role,
        profile_status: user.status,
        ...extraDetails,
        ...rbacContext
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
}

// get user 
exports.getMiniUserDetailsById = async (req, res) => {
  const { id } = req.user;
  console.log("id", id);
  try {
    const user = await User.findOne({
      where: { id },
      include: [
        {
          model: UserDetail,
          as: 'UserDetail',
          attributes: ['about_us', 'career_objective', 'user_type', 'user_profile_pic']
        }
      ],

    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Safely access user_profile_pic from UserDetail

    res.status(200).json({
      message: "User details fetched successfully",
      user: {
        id: user.id,
        uuid: user.uuid,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        user_role: user.user_role,
        about_us: user.UserDetail?.about_us || null,
        user_profile_pic: user.UserDetail?.user_profile_pic || null,
        career_objective: user.UserDetail?.career_objective || null,
        user_type: user.UserDetail?.user_type || null,
      },
    });
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
// Change Email API
exports.changeEmail = async (req, res) => {
  //added password because password also needs to be compared
  const { user_id, newEmail, password } = req.body;

  if (!user_id || !newEmail || !password) {
    return res.status(400).json({ message: 'User ID, new email and password  are required.' });
  }

  try {
    const user = await User.findByPk(user_id);
    if (!user || user.is_deleted) {
      return res
        .status(404)
        .json({ message: "User not found or account deleted." });
    }

    // Verify password
    const isMatch = await user.isValidPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password is incorrect." });
    }
    
    if (user.email === newEmail) {
      return res
        .status(400)
        .json({ message: "New email is the same as the current email." });
    }

    const emailExists = await User.findOne({
      where: { email: newEmail, id: { [Op.ne]: user_id } },
    });
    if (emailExists) {
      return res
        .status(409)
        .json({ message: "Email is already in use by another user." });
    }

    user.email = newEmail;
    await user.save();

    res
      .status(200)
      .json({ message: "Email updated successfully.", email: newEmail });
  } catch (error) {
    console.error('Change email error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
// Change Password API
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  


  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: 'User ID, old password, and new password are required.' });
  }
  const user_id = req.user.id
  
  try {
    const user = await User.findByPk(user_id);
    if (!user || user.is_deleted) {
      return res
        .status(404)
        .json({ message: "User not found or account deleted." });
    }

    // using the already made instance method in user model 
    const isMatch = await user.isValidPassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Old password is incorrect." });
    }
    // Cannot reuse the same password
    const isSameAsOld = await user.isValidPassword(newPassword);
    if (isSameAsOld) {
      return res
        .status(400)
        .json({ message: "New password must be different from old password." });
    }
    user.password = newPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
// Soft Delete Account API
exports.softDeleteAccount = async (req, res) => {
  const { user_id } = req.body;

  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required.' });
  }

  try {
    const user = await User.findByPk(user_id);
    if (!user || user.is_deleted) {
      return res.status(404).json({ message: 'User not found or already deleted.' });
    }

    user.is_deleted = true;
    await user.save();

    // === MINIMAL ADDITION: Update CompanyRecruiterProfile status if user is COMPANY ===
    if (user.user_role === 'COMPANY') {
      await CompanyRecruiterProfile.update(
        { status: 4 },  // Set to Deleted
        { where: { user_id: user_id } }
      );
    }

    res.status(200).json({ message: 'Account soft deleted successfully.' });
  } catch (error) {
    console.error('Soft delete error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
// Forgot Password - send OTP to email
exports.forgotPassword = async (req, res) => {
  const { email, purpose = 'password_reset' } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  try {
    // Check if user exists
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Call otpController.sendOtp to send OTP email
    // We simulate calling sendOtp function here by invoking it directly
    // Since sendOtp expects req and res, we create mock objects

    const mockReq = { body: { email, purpose } };
    const mockRes = {
      status: (code) => ({
        json: (obj) => ({ code, obj }),
      }),
      json: (obj) => ({ code: 200, obj }),
    };

    await otpController.sendOtp(mockReq, mockRes);

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Utility function to verify OTP without HTTP response
const verifyOtpUtility = async (email, otp, purpose = 'email_verification') => {
  // Find user by email
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new Error("User not found");
  }

  // Find the most recent valid OTP for this user
  const otpRecord = await OTP.findOne({
    where: {
      user_id: user.id,
      purpose,
      is_used: false,
      expires_at: { [Op.gt]: new Date() },
    },
    order: [["created_at", "DESC"]],
  });
  console.log("otpRecord", otpRecord);
  if (!otpRecord) {
    throw new Error("No valid OTP found. Please request a new one.");
  }

  if (otpRecord.isExpired()) {
    throw new Error("OTP has expired. Please request a new one.");
  }
  console.log("otpRecord", otpRecord);
  const isMatch = await otpRecord.verifyOTP(otp);
  console.log("isMatch", isMatch);
  if (!isMatch) {
    throw new Error("Invalid OTP");
  }

  // Mark OTP as used
  await otpRecord.update({ is_used: true });

  // Find user detail by user_id
  let userDetail = await UserDetail.findOne({ where: { user_id: user.id } });
  if(userDetail){
    userDetail.is_email_verified= true;
    await userDetail.save();
  }

  // Not required as user details will be created on a diff page
  // If UserDetail doesn't exist, create a basic one
  // if (!userDetail) {
  //   userDetail = await UserDetail.create({
  //     user_id: user.id,
  //     first_name: user.first_name,
  //     last_name: user.last_name,
  //     email: user.email,
  //     phone: user.phone,
  //     dob: "1900-01-01",
  //     gender: "Not Specified",
  //     user_type: user.user_role,
  //     is_email_verified: true,
  //     is_phone_verified: false,
  //     is_gst_verified: false,
  //     terms_and_condition: false,
  //   });
  // } else {
  //   userDetail.is_email_verified = true;
  //   await userDetail.save();
  // }

  return {
    success: true,
    message: "OTP verified successfully",
    user_id: user.id,
    emailVerified: true,
    user_role: user.user_role,
    
  };
};

// Reset Password with OTP verification
exports.resetPasswordWithOtp = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: 'Email, OTP and new password are required' });
  }


  // Verify OTP using utility function

  await verifyOtpUtility(email, otp, 'password_reset');
  // OTP verified, update password
  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.password = newPassword;
  await user.save();

  res.status(200).json({ message: 'Password reset successfully' });

};


exports.handleGoogleCallback = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.user_role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRY }
    );
 // SET SSO TOKEN COOKIE
    res.cookie('sso_token', token, {
      domain: '.scilienttech.com',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    let extraDetails = {};
    if (user.user_role === "STUDENT") {
      const userDetail = await UserDetail.findOne({
        where: { user_id: user.id },
        attributes: ["user_profile_pic", "about_us", "career_objective"],
      });
      extraDetails = {
        user_profile_pic: userDetail?.user_profile_pic || null,
        about_us: userDetail?.about_us || null,
        career_objective: userDetail?.career_objective || null,
      };
    } else if (user.user_role === "COMPANY") {
      const profile = await CompanyRecruiterProfile.findOne({
        where: { user_id: user.id },
        attributes: ["profile_pic", "about", "company_name", "logo_url"],
      });
      extraDetails = {
        user_profile_pic: profile?.profile_pic || null,
        about_us: profile?.about || null,
        organization_name: profile?.company_name || null,
        organization_logo: profile?.logo_url || null,
      };
    } else if (user.user_role === "UNIVERSITY") {
      const profile = await UniversityDetail.findOne({
        where: { user_id: user.id },
        attributes: [
          "profile_pic",
          "about",
          "college_name",
          "university_logo_url",
        ],
      });
      extraDetails = {
        user_profile_pic: profile?.profile_pic || null,
        about_us: profile?.about || null,
        organization_name: profile?.college_name || null,
        organization_logo: profile?.university_logo_url || null,
      };
    }

    req.logout((err) => {
      if (err) console.error("Session logout error:", err);
    });

    if (req.session?.googleOAuthState) {
      delete req.session.googleOAuthState;
    }


    // Redirect to frontend with token + user
    const redirectUrl = `${
      process.env.FRONTEND_URL
    }/login?google_token=${encodeURIComponent(
      token
    )}&google_user=${encodeURIComponent(
      JSON.stringify({
        id: user.id,
        uuid: user.uuid,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone: user.phone,
        user_role: user.user_role,
        profile_status: user.status,
        ...extraDetails,
      })
    )}`;

    res.redirect(redirectUrl);
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
  }
};
