const express = require('express');
const passport= require('passport');
const router = express.Router();
const userController = require('../controllers/userAuthController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/getUserData', authMiddleware, userController.getMiniUserDetailsById);

router.post('/changeEmail', authMiddleware, userController.changeEmail);
router.post('/changePassword', authMiddleware, userController.changePassword);
router.post('/softDeleteAccount', authMiddleware, userController.softDeleteAccount);

router.post('/forgotPassword', userController.forgotPassword);
router.post('/resetPasswordWithOtp', userController.resetPasswordWithOtp);


router.get(
  "/google",
  (req, res, next) => {
    console.log("=== /google ROUTE HIT ===");
    console.log("Incoming state from frontend:", req.query.state);
    if (req.query.state) {
      req.session.googleOAuthState = req.query.state;
    }
    next();
  },
  passport.authenticate("google", {
    scope: ["profile", "email"],
    state: true, // Preserve state
  })
);

router.get(
  "/google/callback",
  (req, res, next) => {
    if (req.query.error) {
      if (req.query.state?.startsWith("signup_")) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/signup?error=google_cancelled`
        );
      }
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=google_failed`
      );
    }

    if (req.query.state?.startsWith("signup_")) {
      req.isSignupFlow = true;
      req.signupRole = req.query.state.replace("signup_", "");
    } else {
      req.isSignupFlow = false;
    }

    next();
  },
//   passport.authenticate("google", {
//     failureRedirect: "/api/users/google/failure",
//     session: true,
//   }),


(req, res, next) => {
    // Custom authenticate — no failureRedirect
    passport.authenticate("google", { session: true }, (err, user, info) => {
      if (err) {
        console.error("Auth error:", err);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
      }

      if (!user && info?.message === "no_account") {
        const safeEmail = encodeURIComponent(info.email || "");
        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=no_account&email=${safeEmail}`
        );
      }

      // Other failures (e.g., no email, Google cancel)
      if (!user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`);
      }

      // Success: log user in manually, then proceed
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
        }
        next(); // → handleGoogleCallback
      });
    })(req, res, next);
  },
  userController.handleGoogleCallback
);

//  Define failure route WITH FULL PATH in router
router.get("/google/failure", (req, res) => {
  // Check referer or assume login
  const referer = req.headers.referer || "";
  if (referer.includes("state=signup_")) {
    return res.redirect(
      `${process.env.FRONTEND_URL}/signup?error=google_signup_failed`
    );
  }
  res.redirect(`${process.env.FRONTEND_URL}/login?error=google_failed`);
});

//For app signin
router.post('/google-signin', userController.googleSignIn);

module.exports = router;
