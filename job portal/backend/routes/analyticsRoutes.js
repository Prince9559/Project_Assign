
const express = require("express");
const authMiddleware = require('../middleware/authMiddleware');
const { getMyProfileViews } = require("../controllers/analyticsController");

const router = express.Router();

// mounted on api/analytics
router.get("/profile/views/me", authMiddleware, getMyProfileViews);

module.exports = router;
