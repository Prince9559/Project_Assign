const { Op } = require("sequelize");
const nodemailer = require("nodemailer");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { User, UserDetail, OTP } = require("../models");

const { generateAuthToken } = require("../utils/jwtHelpers");
const { getRBACContext } = require('../utils/rbacContext');

// Nodemailer config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendOtp = async (req, res) => {
  const { email, purpose = "email_verification" } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = OTP.generateOTP();

    await OTP.create({
      user_id: user.id,
      otp,
      purpose,
      expires_at: new Date(Date.now() + 3 * 60 * 1000), // 3 min expiry
    });

    const mailOptions = {
      from: `"Job Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      html: `
        <h2>Your Verification Code</h2>
        <p>Hello ${user.first_name || "User"},</p>
        <p>Your OTP for ${purpose.replace(/_/g, " ")} is:</p>
        <div style="background:#f5f5f5;padding:20px;text-align:center;margin:20px 0;">
          <h1 style="color:#007bff;letter-spacing:5px;">${otp}</h1>
        </div>
        <p>This OTP will expire in 3 minutes.</p>
      `,
    };

    console.log("OTP for testing is ", otp)

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      message: "Failed to send OTP",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// exports.verifyOtp = async (req, res) => {
//   const { email, otp, purpose = "email_verification" } = req.body;
//   console.log("email, otp, purpose from verifyOtp", email, otp, purpose);
//   if (!email || !otp) {
//     return res.status(400).json({ message: "Email and OTP are required" });
//   }

//   try {
//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     const otpInstance = await OTP.findOne({
//       where: {
//         user_id: user.id,
//         purpose,
//         is_used: false,
//         expires_at: { [Op.gt]: new Date() },
//       },
//       order: [["created_at", "DESC"]],
//     });

//     if (!otpInstance) {
//       return res
//         .status(400)
//         .json({ message: "No valid OTP found. Please request a new one." });
//     }

//     if (otpInstance.isExpired()) {
//       return res
//         .status(400)
//         .json({ message: "OTP expired. Please request a new one." });
//     }

//     if (!otpInstance.isValid()) {
//       return res
//         .status(400)
//         .json({ message: "OTP is no longer valid. Please request a new one." });
//     }

//     const isMatch = await otpInstance.verifyOTP(otp);
//     if (!isMatch) {
//       await otpInstance.incrementAttempts();
//       const remaining = 3 - otpInstance.verification_attempts;
//       return res.status(400).json({
//         message:
//           remaining > 0
//             ? `Invalid OTP. ${remaining} attempts remaining.`
//             : "Maximum attempts reached. Please request a new OTP.",
//       });
//     }

//     await otpInstance.markAsUsed();

//     if (purpose === "email_verification") {
//       let userDetail = await UserDetail.findOne({
//         where: { user_id: user.id },
//       });

//       if (userDetail) {
//         userDetail.is_email_verified = true;
//         await userDetail.save();
//       }
      
//     }

//     if(user.status === 0) await User.update({ status: 1 }, { where: { id: user.id } });

//     let rbac = { scopeId: null, permissions: [], isOwner: false };
//     if (user.status === 2) {
//       rbac = await getRBACContext(user.id);
//     }

//     const token = await generateAuthToken(user);
    

//     // Re-fetch user to get updated status
//     const updatedUser = await User.findByPk(user.id);
    

//     res.status(200).json({
//       success: true,
//       message: `${purpose.replace(/_/g, " ")} successful`,
//       token,
//       user: {
//         id: updatedUser.id,
//         first_name: updatedUser.first_name,
//         last_name: updatedUser.last_name,
//         email: updatedUser.email,
//         phone: updatedUser.phone,
//         user_role: updatedUser.user_role,
//         profile_status: updatedUser.status, // Now reflects updated status
//         scopeId: rbac.scopeId, 
//         permissions: rbac.permissions,
//         isOwner: rbac.isOwner,
//       },
//       verified: true,
//     });

//       if(updatedUser.status===1){
//         //Sending user successful signup email
//         const mailOptions = {
//           from: `"Job Portal" <${process.env.EMAIL_USER}>`,
//           to: email,
//           subject: `Signup successful`,
//           html: `
//             <h2>Thank You </h2>
//             <p>Hello ${user.first_name || "User"},</p>
//             <div style="background:#f5f5f5;padding:20px;text-align:center;margin:20px 0;">
//               <h1 style="color:#007bff;letter-spacing:5px;"></h1>
//             </div>
//             <p>Thank you for signing up.</p>
//           `,
//         };

//         await transporter.sendMail(mailOptions);
//       }

//   } catch (error) {
//     console.error("Verify OTP error:", error);
//     res.status(500).json({
//       message: "Failed to verify OTP",
//       error: process.env.NODE_ENV === "development" ? error.message : undefined,
//     });
//   }
// };



exports.verifyOtp = async (req, res) => {
  const { email, otp, purpose = "email_verification" } = req.body;
  console.log("[OTP/email verify] payload:", {
    email,
    otp: otp ? "****" : null,
    purpose,
  });

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otpInstance = await OTP.findOne({
      where: {
        user_id: user.id,
        purpose,
        is_used: false,
        expires_at: { [Op.gt]: new Date() },
      },
      order: [["created_at", "DESC"]],
    });

    if (!otpInstance) {
      return res
        .status(400)
        .json({ message: "No valid OTP found. Please request a new one." });
    }
    if (otpInstance.isExpired()) {
      return res
        .status(400)
        .json({ message: "OTP expired. Please request a new one." });
    }
    if (!otpInstance.isValid()) {
      return res
        .status(400)
        .json({ message: "OTP is no longer valid. Please request a new one." });
    }

    const isMatch = await otpInstance.verifyOTP(otp);
    if (!isMatch) {
      await otpInstance.incrementAttempts();
      const remaining = 3 - otpInstance.verification_attempts;
      return res.status(400).json({
        message:
          remaining > 0
            ? `Invalid OTP. ${remaining} attempts remaining.`
            : "Maximum attempts reached. Please request a new OTP.",
      });
    }

    await otpInstance.markAsUsed();

    if (purpose === "email_verification") {
      // 1) UserDetail flag
      const userDetail = await UserDetail.findOne({
        where: { user_id: user.id },
      });
      if (userDetail) {
        userDetail.is_email_verified = true;
        await userDetail.save();
      }

      // 2) Keep CompanyRecruiterProfile in sync so /api/company-recruiter/profile shows Verified
      try {
        const { CompanyRecruiterProfile } = require("../models");
        if (CompanyRecruiterProfile) {
          await CompanyRecruiterProfile.update(
            { is_email_verified: true },
            { where: { user_id: user.id } }
          );
        }
      } catch (syncErr) {
        console.error(
          "[OTP/email verify] CompanyRecruiterProfile sync failed:",
          syncErr.message
        );
      }
    }

    if (user.status === 0) {
      await User.update({ status: 1 }, { where: { id: user.id } });
    }

    let rbac = { scopeId: null, permissions: [], isOwner: false };
    if (user.status === 2) {
      rbac = await getRBACContext(user.id);
    }

    const token = await generateAuthToken(user);
    const updatedUser = await User.findByPk(user.id);

    res.status(200).json({
      success: true,
      message: `${purpose.replace(/_/g, " ")} successful`,
      token,
      user: {
        id: updatedUser.id,
        first_name: updatedUser.first_name,
        last_name: updatedUser.last_name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        user_role: updatedUser.user_role,
        profile_status: updatedUser.status,
        scopeId: rbac.scopeId,
        permissions: rbac.permissions,
        isOwner: rbac.isOwner,
        ...(purpose === "email_verification" ? { is_email_verified: true } : {}),
      },
      verified: true,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      message: "Failed to verify OTP",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};