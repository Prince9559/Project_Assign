const otpStore = {}; 
const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString();
const db = require('../models');

exports.sendOtp = (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ message: 'Phone number is required' });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 2 * 60 * 1000; 

    otpStore[phoneNumber] = { otp, expiresAt };

    console.log(`Generated OTP for ${phoneNumber}: ${otp}`);

    res.status(200).json({
        message: 'OTP sent successfully',
        otp 
    });
};

exports.verifyOtp = async (req, res) => {
    try {
        const { phoneNumber, otp } = req.body;
        const user_id = req.user?.id;

        console.log('[OTP/mobile verify] payload:', {
            phoneNumber,
            user_id,
            otpLen: otp ? String(otp).length : 0,
        });

        if (!user_id) {
            return res.status(401).json({ message: 'Unauthorized: user not found in token' });
        }
        if (!phoneNumber || !otp) {
            return res.status(400).json({ message: 'Phone number and OTP are required' });
        }

        const stored = otpStore[phoneNumber];
        if (!stored) {
            return res.status(400).json({ message: 'OTP not found or expired. Please request again.' });
        }
        if (Date.now() > stored.expiresAt) {
            delete otpStore[phoneNumber];
            return res.status(400).json({ message: 'OTP expired. Please request again.' });
        }
        if (String(stored.otp) !== String(otp)) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        delete otpStore[phoneNumber];

        // 1) UserDetail flag (existing)
        if (db.UserDetail) {
            await db.UserDetail.update(
                { is_phone_verified: true },
                { where: { user_id } }
            );
            console.log(`[OTP] UserDetail.is_phone_verified set true for user_id=${user_id}`);
        }

        // 2) CompanyRecruiterProfile flag — this is what /api/company-recruiter/profile reads
        if (db.CompanyRecruiterProfile) {
            await db.CompanyRecruiterProfile.update(
                { is_phone_verified: true },
                { where: { user_id } }
            );
            console.log(`[OTP] CompanyRecruiterProfile.is_phone_verified set true for user_id=${user_id}`);
        }

        // 2b) UniversityDetail flag — some users are UNIVERSITY role and use `phone_verified`
        if (db.UniversityDetail) {
            try {
                // update phone_verified column used by university public profile
                const [updCount] = await db.UniversityDetail.update(
                    { phone_verified: true },
                    { where: { user_id } }
                );
                console.log(`[OTP] UniversityDetail.phone_verified update for user_id=${user_id}: affected=${updCount}`);

                if (updCount > 0) {
                    const uni = await db.UniversityDetail.findOne({ where: { user_id } });
                    console.log('[OTP] UniversityDetail after update:', uni ? uni.toJSON() : null);
                }
            } catch (uErr) {
                console.error('[OTP] Failed to update UniversityDetail.phone_verified:', uErr);
            }
        }

        // 3) Keep phone column on User in sync so profile.mobile is correct
        if (db.User) {
            await db.User.update(
                { phone: phoneNumber },
                { where: { id: user_id } }
            );
        }

        // Log final saved values for debugging
        try {
            if (db.User) {
                const u = await db.User.findByPk(user_id, { attributes: ['id','email','phone'] });
                console.log('[OTP] User after verify:', u ? u.toJSON() : null);
            }
            if (db.UserDetail) {
                const ud = await db.UserDetail.findOne({ where: { user_id }, attributes: ['id','is_phone_verified'] });
                console.log('[OTP] UserDetail after verify:', ud ? ud.toJSON() : null);
            }
        } catch (logErr) {
            console.error('[OTP] Error fetching post-update debug records:', logErr);
        }

        return res.status(200).json({
            message: 'Phone number verified successfully.',
            is_phone_verified: true,
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return res.status(500).json({ message: 'Error verifying phone number' });
    }
};