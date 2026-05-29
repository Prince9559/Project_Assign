const path = require("path");
const {
  UserDetail,
  CompanyRecruiterProfile,
  UniversityDetail,
} = require("../models");

function firstFileByField(req, fieldname) {
  const files = req.files;
  if (!files) return null;
  if (Array.isArray(files)) return files.find((f) => f.fieldname === fieldname) || null;
  if (typeof files === "object" && Array.isArray(files[fieldname])) return files[fieldname][0] || null;
  return null;
}

function storedUploadPath(file) {
  if (!file?.path) return null;
  const normalized = String(file.path).replace(/\\/g, "/");
  const idx = normalized.indexOf("uploads/");
  if (idx >= 0) return normalized.slice(idx);
  return `uploads/${path.basename(normalized)}`;
}

/**
 * POST /api/profile/upload-image
 * multipart field: profile_pic (image/*)
 * Updates the correct profile picture field based on req.user.role.
 */
exports.uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const f = firstFileByField(req, "profile_pic");
    if (!f) {
      return res.status(400).json({
        success: false,
        message: "No profile picture uploaded",
      });
    }

    const imageUrl = storedUploadPath(f);
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: "Upload failed (missing file path)",
      });
    }

    if (role === "STUDENT") {
      const ud = await UserDetail.findOne({ where: { user_id: userId } });
      if (!ud) {
        return res.status(404).json({ success: false, message: "User details not found" });
      }
      await ud.update({ user_profile_pic: imageUrl });
    } else if (role === "COMPANY") {
      const cp = await CompanyRecruiterProfile.findOne({ where: { user_id: userId } });
      if (!cp) {
        return res.status(404).json({ success: false, message: "Company profile not found" });
      }
      await cp.update({ profile_pic: imageUrl });
    } else if (role === "UNIVERSITY") {
      const uni = await UniversityDetail.findOne({ where: { user_id: userId } });
      if (!uni) {
        return res.status(404).json({ success: false, message: "University profile not found" });
      }
      await uni.update({ profile_pic: imageUrl });
    } else {
      return res.status(400).json({ success: false, message: "Unsupported user role" });
    }

    return res.json({ success: true, imageUrl });
  } catch (err) {
    console.error("uploadProfileImage:", err);
    return res.status(500).json({ success: false, message: "Failed to upload profile image" });
  }
};

