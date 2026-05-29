const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { upload, handleUploadError } = require("../utils/upload");
const ctrl = require("../controllers/aiPathwayLearningController");

router.use(authMiddleware);

router.get("/:pathwayId/dashboard", ctrl.getLearningDashboard);
router.patch("/:pathwayId/steps/:stepId/status", ctrl.patchStepStatus);
router.post(
  "/:pathwayId/steps/:stepId/complete",
  upload,
  handleUploadError,
  ctrl.completeStep
);

module.exports = router;
