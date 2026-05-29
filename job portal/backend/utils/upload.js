const multer = require("multer");
const path = require("path");
const fs = require("fs");

const MAX_AUTH_LETTER_BYTES = 2 * 1024 * 1024;
const AUTH_LETTER_SIZE_MESSAGE =
  "Please upload the authorization letter with a file size of 2 MB or less.";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = "uploads/";
    if (file.fieldname === "profile_pic") {
      uploadPath = "uploads/profile_pics/";
    } else if (file.fieldname === "logo_url") {
      uploadPath = "uploads/logos/";
    } else if (file.fieldname === "feedImage") {
      uploadPath = "uploads/feedImages/";
    } else if (file.fieldname === "certificateImage" || file.fieldname === "certificate") {
      uploadPath = "uploads/certificates/";
    } else if (file.fieldname === "resume") {
      uploadPath = "uploads/resumes/";
    } else if (file.fieldname === "schoolCollegeLogo") {
      uploadPath = "uploads/schoolCollegeLogos/";
    } else if (file.fieldname === "assignment") {
      uploadPath = "uploads/assignments/";
    } else if (file.fieldname === "chatFile") {
      // no req.body access here
      uploadPath = "uploads/chat/"; // Flat folder for all chat files
    } else if (file.fieldname === "pathwayProof") {
      uploadPath = "uploads/pathwayProofs/";
    }
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const timestamp = Date.now();
    const user_id = req.user ? req.user.id : "unknown";

    // Helper to sanitize extension
    const safeExt = (ext) => {
      const allowed = /\.(jpg|jpeg|png|gif|pdf|doc|docx|xls|xlsx)$/i;
      return allowed.test(ext) ? ext : ".bin";
    };

    let filename;
    if (file.fieldname === "profile_pic") {
      filename = `profile_${user_id}_${timestamp}${safeExt(ext)}`;
    } else if (file.fieldname === "logo_url") {
      filename = `logo_${user_id}_${timestamp}${safeExt(ext)}`;
    } else if (file.fieldname === "feedImage") {
      filename = `feed_${user_id}_${timestamp}${safeExt(ext)}`;
    } else if (file.fieldname === "certificateImage" || file.fieldname === "certificate") {
      filename = `cert_${user_id}_${timestamp}${safeExt(ext)}`;
    } else if (file.fieldname === "resume") {
      filename = `resume_${user_id}_${timestamp}${safeExt(ext)}`;
    } else if (file.fieldname === "schoolCollegeLogo") {
      filename = `schoolCollegeLogo_${user_id}_${timestamp}${safeExt(ext)}`;
    } else if (file.fieldname === "assignment") {
      filename = `assignment_${user_id}_${timestamp}${safeExt(ext)}`;
    } else if (file.fieldname === "chatFile") {
      filename = `chat_${user_id}_${timestamp}${safeExt(ext)}`;
    } else if (file.fieldname === "pathwayProof") {
      filename = `pathway_proof_${user_id}_${timestamp}${safeExt(ext)}`;
    } else {
      filename = `${file.fieldname}_${user_id}_${timestamp}${safeExt(ext)}`;
    }
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    const imageTypes = /jpeg|jpg|png|gif/i;
    const docTypes = /pdf|doc|docx|xls|xlsx/i;

    if (
      ["profile_pic", "logo_url", "schoolCollegeLogo"].includes(file.fieldname)
    ) {
      const isImage =
        imageTypes.test(path.extname(file.originalname)) &&
        imageTypes.test(file.mimetype);
      if (isImage) return cb(null, true);
      return cb(
        new Error("Only images (jpg, png, gif) allowed for this field")
      );
    }

    if (file.fieldname === "certificate") {
      const ext = path.extname(file.originalname).toLowerCase();
      if (ext !== ".pdf") {
        return cb(new Error("Authorization letter must be a PDF file"));
      }
      const okMime =
        !file.mimetype ||
        file.mimetype === "application/pdf" ||
        file.mimetype === "application/x-pdf" ||
        file.mimetype === "application/octet-stream";
      if (okMime) return cb(null, true);
      return cb(new Error("Authorization letter must be a PDF file"));
    }

    // if (
    //   ["resume", "certificateImage", "assignment", "chatFile", "pathwayProof"].includes(
    //     file.fieldname
    //   )
    // ) {
    //   const isImage = imageTypes.test(path.extname(file.originalname));
    //   const isDoc = docTypes.test(path.extname(file.originalname));
    //   if (isImage || isDoc) return cb(null, true);
    //   return cb(new Error("Only images, PDF, DOC, DOCX, XLS, XLSX allowed"));
    // }
    // Educational certificate (printed OR handwritten): images + PDF only
    if (file.fieldname === "certificateImage") {
      const ext = path.extname(file.originalname).toLowerCase();
      const allowedExt = [".jpg", ".jpeg", ".png", ".pdf"];
      const allowedMime = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
        "application/x-pdf",
        "application/octet-stream", // some browsers send this for pdf
      ];
      const extOk = allowedExt.includes(ext);
      const mimeOk =
        !file.mimetype || allowedMime.includes(file.mimetype.toLowerCase());
      if (extOk && mimeOk) return cb(null, true);
      return cb(
        new Error(
          "Only JPG, JPEG, PNG, or PDF certificates are allowed (printed or handwritten)."
        )
      );
    }

    // Other document fields keep their existing behaviour
    if (
      ["resume", "assignment", "chatFile", "pathwayProof"].includes(
        file.fieldname
      )
    ) {
      const isImage = imageTypes.test(path.extname(file.originalname));
      const isDoc = docTypes.test(path.extname(file.originalname));
      if (isImage || isDoc) return cb(null, true);
      return cb(new Error("Only images, PDF, DOC, DOCX, XLS, XLSX allowed"));
    }

    cb(null, true); // allow other fields
  },
}).any();

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // if (err.code === "LIMIT_FILE_SIZE") {
    //   const isAuthLetter = err.field === "certificate";
    //   return res.status(400).json({
    //     message: isAuthLetter ? AUTH_LETTER_SIZE_MESSAGE : "File too large. Max 5MB.",
    //   });
    // }
    // return res.status(400).json({ message: "Upload error: " + err.message });
    if (err.code === "LIMIT_FILE_SIZE") {
      if (err.field === "certificate") {
        return res.status(400).json({ message: AUTH_LETTER_SIZE_MESSAGE });
      }
      if (err.field === "certificateImage") {
        return res.status(400).json({
          message: "Certificate is too large. Maximum file size is 5 MB.",
        });
      }
      return res.status(400).json({ message: "File too large. Max 5MB." });
    }
  } else if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

/** Reject authorization letter (`certificate`) files over 2MB after multer writes them. */
const enforceAuthorizationLetterFileSize = (req, res, next) => {
  if (!req.files || !Array.isArray(req.files)) return next();
  for (const file of req.files) {
    if (file.fieldname !== "certificate") continue;
    if (file.size > MAX_AUTH_LETTER_BYTES) {
      if (file.path && fs.existsSync(file.path)) {
        try {
          fs.unlinkSync(file.path);
        } catch (_) { }
      }
      return res.status(400).json({ message: AUTH_LETTER_SIZE_MESSAGE });
    }
  }
  next();
};

module.exports = {
  storage,
  upload,
  handleUploadError,
  enforceAuthorizationLetterFileSize,
  MAX_AUTH_LETTER_BYTES,
  AUTH_LETTER_SIZE_MESSAGE,
};