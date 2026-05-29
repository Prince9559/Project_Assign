/**
 * Pathway Routes
 * All pathway-related API endpoints
 */

const express = require("express");
const router = express.Router();
const pathwayController = require("../controllers/pathwayController");
const pathwayValidation = require("../middleware/pathwayValidation");
const { asyncHandler } = require("../middleware/errorHandler");
const auth = require("../middleware/authMiddleware");




router.get("/resource/:id", pathwayController.getResourceById);
router.use(auth);


/**
 * POST /api/pathways/generate-v3
 * Generate pathways with eligibility filtering (V3)
 */
router.post(
  "/generate-v3",
  pathwayValidation.validateGeneratePathwayV3,
  asyncHandler(pathwayController.generatePathwaysV3)
);

/**
 * POST /api/pathways/generate-v2
 * Generate pathways using NEW logic (V2)
 * Body: { strategy_type, target_job_id?, target_company_ids?, target_role_ids?, target_domains?, preferences? }
 */
router.post(
  "/generate-v2",
  pathwayValidation.validateGeneratePathwayV2,
  asyncHandler(pathwayController.generatePathwaysV2)
);

/**
 * POST /api/pathways/generate
 * Generate pathways for user based on strategy
 * Body: { strategy_type, target_job_id?, target_company_id?, target_domains?, preferences? }
 */
// router.post(
//   "/generate",
//   pathwayValidation.validateGeneratePathway,
//   asyncHandler(pathwayController.generatePathways)
// );

/**
 * GET /api/pathways
 * Get all pathways for authenticated user
 * Query params: status?, strategy_type?, limit?, offset?
 */
router.get(
  "/",
  pathwayValidation.validateGetPathways,
  asyncHandler(pathwayController.getPathways)
);

/**
 * GET /api/pathways/statistics
 * Get pathway statistics for user
 */
router.get("/statistics", asyncHandler(pathwayController.getPathwayStatistics));

/**
 * GET /api/pathways/preferences
 * Get user's pathway preferences
 */
router.get("/preferences", asyncHandler(pathwayController.getUserPreferences));

/**
 * PUT /api/pathways/preferences
 * Update user's pathway preferences
 * Body: { resource_priority?, max_timeline?, min_timeline? }
 */
router.put(
  "/preferences",
  pathwayValidation.validateUpdatePreferences,
  asyncHandler(pathwayController.updateUserPreferences)
);

/**
 * GET /api/pathways/:pathwayId
 * Get detailed pathway information by ID
 */
router.get(
  "/:pathwayId",
  pathwayValidation.validatePathwayId,
  asyncHandler(pathwayController.getPathwayById)
);

/**
 * PATCH /api/pathways/:pathwayId/status
 * Update pathway status
 * Body: { status }
 */
router.patch(
  "/:pathwayId/status",
  pathwayValidation.validateUpdateStatus,
  asyncHandler(pathwayController.updatePathwayStatus)
);

/**
 * DELETE /api/pathways
 * Delete pathways based on filters
 * Query params: strategy_type?, status?
 */
router.delete(
  "/",
  pathwayValidation.validateDeletePathways,
  asyncHandler(pathwayController.deletePathways)
);







module.exports = router;
