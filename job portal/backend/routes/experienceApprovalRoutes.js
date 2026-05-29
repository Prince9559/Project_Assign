const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const { storage } = require("../utils/upload");
const experienceApprovalController = require("../controllers/experienceApprovalController");

const router = express.Router();
const upload = multer({ storage });

router.get(
  "/company/employees",
  authMiddleware,
  experienceApprovalController.getCompanyEmployees
);
router.post(
  "/company/remove-employee",
  authMiddleware,
  experienceApprovalController.removeEmployee
);
router.get(
  "/company/pending-approvals",
  authMiddleware,
  experienceApprovalController.getPendingApprovals
);
router.post(
  "/company/approve-employee",
  authMiddleware,
  experienceApprovalController.approveEmployee
);
router.post(
  "/company/reject-employee",
  authMiddleware,
  experienceApprovalController.rejectEmployee
);

router.post(
  "/employee/upload-experience-proof",
  authMiddleware,
  upload.single("proof_document"),
  experienceApprovalController.uploadExperienceProof
);

module.exports = router;
