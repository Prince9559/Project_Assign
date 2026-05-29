const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { upload, handleUploadError } = require("../utils/upload");
const { uploadProfileImage } = require("../controllers/profileController");

router.post(
  "/upload-image",
  authMiddleware,
  upload,
  handleUploadError,
  uploadProfileImage
);

module.exports = router;

