// routes/gstGovRoutes.js
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getCaptcha,
  getGSTDetails,
} = require("../controllers/gstGovController");

// CAPTCHA can be fetched without auth (no user-specific data)
router.get("/captcha", getCaptcha);

// Verify GST — requires auth so we can persist is_gst_verified on the recruiter profile
router.post("/details", authMiddleware, getGSTDetails);

module.exports = router;
