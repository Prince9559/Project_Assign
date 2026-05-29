const otpStore = require('../utils/otpStore');
// Rate limiting middleware for OTP requests
exports.otpLimiter = (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const now = Date.now();
    const record = otpStore[email];

    // Check if there's a recent OTP request (within 2 minutes)
    if (record && (now - record.created_at) < 2 * 60 * 1000) {
        const remainingTime = Math.ceil((2 * 60 * 1000 - (now - record.created_at)) / 1000);
        return res.status(429).json({
            message: `Please wait ${remainingTime} seconds before requesting another OTP`
        });
    }

    next();
};
