

const express = require('express');
const router = express.Router();
const otpController = require('../controllers/otpcontrollermobile');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/sendotp',authMiddleware, otpController.sendOtp);
router.post('/verifyotp',authMiddleware, otpController.verifyOtp);

module.exports = router;
