const express = require("express");
const multer = require("multer");
const authMiddleware = require("../middleware/authMiddleware");
const { storage } = require("../utils/upload");
const educationApprovalController = require("../controllers/educationApprovalController");

const router = express.Router();
const upload = multer({ storage });

router.get("/university/students", authMiddleware, educationApprovalController.getUniversityStudents);
router.post("/university/remove-student", authMiddleware, educationApprovalController.removeStudentEducation);
router.get("/university/pending-approvals", authMiddleware, educationApprovalController.getPendingApprovals);
router.post("/university/approve-student", authMiddleware, educationApprovalController.approveStudent);
router.post("/university/reject-student", authMiddleware, educationApprovalController.rejectStudent);

router.post(
  "/student/upload-education-proof",
  authMiddleware,
  upload.single("proof_document"),
  educationApprovalController.uploadEducationProof
);
router.get("/student/educations", authMiddleware, educationApprovalController.getStudentEducations);

module.exports = router;
