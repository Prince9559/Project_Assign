/**
 * Pathway Controller
 * Handles all pathway-related HTTP requests
 */


const pathwayGenerationServiceV3 = require("../services/pathwayGenerationServiceV3");
const pathwayGenerationServiceV2 = require("../services/pathwayGenerationServiceV2");
const pathwayGenerationService = require("../services/pathwayGenerationService");
const pathwayPersistenceService = require("../services/pathwayPersistenceService");
const preferenceUtils = require("../utils/preferenceUtils");
const { AppError } = require("../middleware/errorHandler");
const pathwayConfig = require("../config/pathwayConfig");

const { LearningResource, ResourceSkill, Skill } = require("../models");


/**
 * Generate pathways for user
 * POST /api/pathways/generate
 */
const generatePathways = async (req, res, next) => {
  console.log("\n========================================");
  console.log("[PathwayController] POST /api/pathways/generate");
  console.log("========================================");

  const userId = req.user?.id; // Assuming auth middleware sets req.user
  console.log(`[PathwayController] User ID: ${userId}`);
  console.log(
    `[PathwayController] Request body:`,
    JSON.stringify(req.body, null, 2)
  );

  try {
    if (!userId) {
      console.log("[PathwayController] User ID not found in request");
    }

    const request = {
      strategy_type: req.body.strategy_type,
      target_job_id: req.body.target_job_id,
      target_company_id: req.body.target_company_id,
      target_domains: req.body.target_domains,
      preferences: req.body.preferences,
    };

    console.log("[PathwayController] Calling pathway generation service");

    const result = await pathwayGenerationService.generatePathways(
      userId,
      request
    );

    console.log(
      `[PathwayController] Generation complete. Success: ${result.success}`
    );

    if (!result.success) {
      console.log(`[PathwayController] Generation failed: ${result.message}`);
      return res.status(200).json(result);
    }

    console.log(
      `[PathwayController] Generated ${result.pathways.length} pathways`
    );
    console.log("[PathwayController] Sending success response\n");

    res.status(200).json(result);
  } catch (error) {
    console.error(
      "[PathwayController] Error in generatePathways:",
      error.message
    );
    next(error);
  }
};

/**
 * Get all pathways for user
 * GET /api/pathways
 */
const getPathways = async (req, res, next) => {
  console.log("\n========================================");
  console.log("[PathwayController] GET /api/pathways");
  console.log("========================================");

  const userId = req.user?.id;
  console.log(`[PathwayController] User ID: ${userId}`);
  console.log(`[PathwayController] Query params:`, req.query);

  try {
 
    const filters = {
      status: req.query.status,
      strategy_type: req.query.strategy_type,
    };

    console.log("[PathwayController] Loading pathways with filters:", filters);

    const pathways = await pathwayPersistenceService.loadPathways(
      userId,
      filters
    );

    console.log(`[PathwayController] Found ${pathways.length} pathways`);
    console.log(pathways);

    // Format response
    const formatted = pathways.map((pathway) => ({
      pathway_id: pathway.pathway_id,
      strategy_type: pathway.strategy_type,
      rank: pathway.pathway_rank,
      status: pathway.status,
      total_duration_days: parseFloat(pathway.total_duration),
      total_duration_weeks: parseFloat((pathway.total_duration / 7).toFixed(1)),
      skills_covered: pathway.total_skills_covered,
      coverage_percent: parseFloat(pathway.skill_coverage_percent),
      score: parseFloat(pathway.pathway_score),
      composition: {
        internships: pathway.total_internships,
        projects: pathway.total_projects,
        courses: pathway.total_courses,
        jobs:pathway.total_jobs,
      },
      steps_count: pathway.steps?.length || 0,
      created_at: pathway.created_at,
      selected_at: pathway.selected_at,
      started_at: pathway.started_at,
      completed_at: pathway.completed_at,
    }));

    console.log("[PathwayController] Sending response\n");

    res.status(200).json({
      success: true,
      count: formatted.length,
      pathways: formatted,
    });
  } catch (error) {
    console.error("[PathwayController] Error in getPathways:", error.message);
    next(error);
  }
};

/**
 * Get pathway details by ID
 * GET /api/pathways/:pathwayId
 */
const getPathwayById = async (req, res, next) => {
  console.log("\n========================================");
  console.log(`[PathwayController] GET /api/pathways/${req.params.pathwayId}`);
  console.log("========================================");

  const userId = req.user?.id;
  const pathwayId = parseInt(req.params.pathwayId);

  console.log(`[PathwayController] User ID: ${userId}`);
  console.log(`[PathwayController] Pathway ID: ${pathwayId}`);

  try {
       console.log("[PathwayController] Fetching pathway details");

    const pathway = await pathwayGenerationService.getPathwayDetails(pathwayId);

    if (!pathway) {
      console.log(`[PathwayController] Pathway ${pathwayId} not found`);
      throw new AppError(pathwayConfig.MESSAGES.PATHWAY_NOT_FOUND, 404);
    }

    // Verify ownership
    if (pathway.user_id !== userId) {
      console.log(
        `[PathwayController] User ${userId} does not own pathway ${pathwayId}`
      );
      throw new AppError("Unauthorized access to pathway", 403);
    }

    console.log(
      `[PathwayController] Retrieved pathway with ${pathway.steps.length} steps`
    );
    console.log("[PathwayController] Sending response\n");

    res.status(200).json({
      success: true,
      pathway: {
      ...pathway, 
      target_company_ids: pathway.target_company_ids, 
      target_role_ids: pathway.target_role_ids, 
    },
    });
  } catch (error) {
    console.error(
      "[PathwayController] Error in getPathwayById:",
      error.message
    );
    next(error);
  }
};

/**
 * Update pathway status
 * PATCH /api/pathways/:pathwayId/status
 */
const updatePathwayStatus = async (req, res, next) => {
  console.log("\n========================================");
  console.log(
    `[PathwayController] PATCH /api/pathways/${req.params.pathwayId}/status`
  );
  console.log("========================================");

  const userId = req.user?.id;
  const pathwayId = parseInt(req.params.pathwayId);
  const newStatus = req.body.status;

  console.log(`[PathwayController] User ID: ${userId}`);
  console.log(`[PathwayController] Pathway ID: ${pathwayId}`);
  console.log(`[PathwayController] New status: ${newStatus}`);

  try {
    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    // Verify pathway exists and belongs to user
    const pathway = await pathwayPersistenceService.getPathwayById(pathwayId);

    if (!pathway) {
      console.log(`[PathwayController] Pathway ${pathwayId} not found`);
      throw new AppError(pathwayConfig.MESSAGES.PATHWAY_NOT_FOUND, 404);
    }

    if (pathway.user_id !== userId) {
      console.log(
        `[PathwayController] User ${userId} does not own pathway ${pathwayId}`
      );
      throw new AppError("Unauthorized access to pathway", 403);
    }

    console.log(`[PathwayController] Current status: ${pathway.status}`);
    console.log("[PathwayController] Updating status");

    const updated = await pathwayPersistenceService.updatePathwayStatus(
      pathwayId,
      newStatus
    );

    console.log("[PathwayController] Status updated successfully");
    console.log("[PathwayController] Sending response\n");

    res.status(200).json({
      success: true,
      message: pathwayConfig.MESSAGES.UPDATE_SUCCESS,
      pathway: {
        pathway_id: updated.pathway_id,
        status: updated.status,
        selected_at: updated.selected_at,
        started_at: updated.started_at,
        completed_at: updated.completed_at,
      },
    });
  } catch (error) {
    console.error(
      "[PathwayController] Error in updatePathwayStatus:",
      error.message
    );
    next(error);
  }
};

/**
 * Delete pathways
 * DELETE /api/pathways
 */
const deletePathways = async (req, res, next) => {
  console.log("\n========================================");
  console.log("[PathwayController] DELETE /api/pathways");
  console.log("========================================");

  const userId = req.user?.id;
  console.log(`[PathwayController] User ID: ${userId}`);
  console.log(`[PathwayController] Query params:`, req.query);

  try {
    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const filters = {
      strategy_type: req.query.strategy_type,
      status: req.query.status,
    };

    console.log("[PathwayController] Deleting pathways with filters:", filters);

    const deletedCount = await pathwayPersistenceService.deletePathways(
      userId,
      filters
    );

    console.log(`[PathwayController] Deleted ${deletedCount} pathways`);
    console.log("[PathwayController] Sending response\n");

    res.status(200).json({
      success: true,
      message: pathwayConfig.MESSAGES.DELETE_SUCCESS,
      deleted_count: deletedCount,
    });
  } catch (error) {
    console.error(
      "[PathwayController] Error in deletePathways:",
      error.message
    );
    next(error);
  }
};

/**
 * Get pathway statistics for user
 * GET /api/pathways/statistics
 */
const getPathwayStatistics = async (req, res, next) => {
  console.log("\n========================================");
  console.log("[PathwayController] GET /api/pathways/statistics");
  console.log("========================================");

  const userId = req.user?.id;
  console.log(`[PathwayController] User ID: ${userId}`);

  try {
    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    console.log("[PathwayController] Fetching statistics");

    const stats = await pathwayPersistenceService.getPathwayStatistics(userId);

    console.log("[PathwayController] Statistics retrieved:", stats);
    console.log("[PathwayController] Sending response\n");

    res.status(200).json({
      success: true,
      statistics: stats,
    });
  } catch (error) {
    console.error(
      "[PathwayController] Error in getPathwayStatistics:",
      error.message
    );
    next(error);
  }
};

/**
 * Get user preferences
 * GET /api/pathways/preferences
 */
const getUserPreferences = async (req, res, next) => {
  console.log("\n========================================");
  console.log("[PathwayController] GET /api/pathways/preferences");
  console.log("========================================");

  const userId = req.user?.id;
  console.log(`[PathwayController] User ID: ${userId}`);

  try {
    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    console.log("[PathwayController] Fetching user preferences");

    const preferences = await preferenceUtils.getUserPreferences(userId);

    console.log("[PathwayController] Preferences retrieved");
    console.log("[PathwayController] Sending response\n");

    res.status(200).json({
      success: true,
      preferences: {
        resource_priority: preferences.resource_priority,
        max_timeline_days: preferences.max_timeline,
        max_timeline_weeks: parseFloat(
          (preferences.max_timeline / 7).toFixed(1)
        ),
        min_timeline_days: preferences.min_timeline,
        min_timeline_weeks: parseFloat(
          (preferences.min_timeline / 7).toFixed(1)
        ),
      },
    });
  } catch (error) {
    console.error(
      "[PathwayController] Error in getUserPreferences:",
      error.message
    );
    next(error);
  }
};

/**
 * Update user preferences
 * PUT /api/pathways/preferences
 */
const updateUserPreferences = async (req, res, next) => {
  console.log("\n========================================");
  console.log("[PathwayController] PUT /api/pathways/preferences");
  console.log("========================================");

  const userId = req.user?.id;
  console.log(`[PathwayController] User ID: ${userId}`);
  console.log(
    `[PathwayController] Request body:`,
    JSON.stringify(req.body, null, 2)
  );

  try {
    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const updates = {
      resource_priority: req.body.resource_priority,
      max_timeline: req.body.max_timeline,
      min_timeline: req.body.min_timeline,
    };

    console.log("[PathwayController] Updating preferences");

    const preferences = await preferenceUtils.updateUserPreferences(
      userId,
      updates
    );

    console.log("[PathwayController] Preferences updated successfully");
    console.log("[PathwayController] Sending response\n");

    res.status(200).json({
      success: true,
      message: "Preferences updated successfully",
      preferences: {
        resource_priority: preferences.resource_priority,
        max_timeline_days: preferences.max_timeline,
        max_timeline_weeks: parseFloat(
          (preferences.max_timeline / 7).toFixed(1)
        ),
        min_timeline_days: preferences.min_timeline,
        min_timeline_weeks: parseFloat(
          (preferences.min_timeline / 7).toFixed(1)
        ),
      },
    });
  } catch (error) {
    console.error(
      "[PathwayController] Error in updateUserPreferences:",
      error.message
    );
    next(error);
  }
};





/**
 * Generate pathways V2 (NEW LOGIC)
 * POST /api/pathways/generate-v2
 */
const generatePathwaysV2 = async (req, res, next) => {
  console.log("\n========================================");
  console.log("[PathwayController] POST /api/pathways/generate-v2");
  console.log("========================================");

  const userId = req.user?.id;
  console.log(`[PathwayController] User ID: ${userId}`);
  console.log(`[PathwayController] Request body:`, JSON.stringify(req.body, null, 2));

  try {
    if (!userId) {
      console.log("[PathwayController] User ID not found in request");
      throw new AppError("User authentication required", 401);
    }

    const request = {
      strategy_type: req.body.strategy_type,
      target_job_id: req.body.target_job_id,
      target_company_id: req.body.target_company_id,
      target_company_ids: req.body.target_company_ids, // NEW: Array
      target_role_ids: req.body.target_role_ids, // NEW: Array
      target_domains: req.body.target_domains,
      preferences: req.body.preferences,
    };

    console.log("[PathwayController] Calling pathway generation service V2");

    const result = await pathwayGenerationServiceV2.generatePathwaysV2(userId, request);

    console.log(`[PathwayController] Generation complete. Success: ${result.success}`);

    if (!result.success) {
      console.log(`[PathwayController] Generation failed: ${result.message}`);
      return res.status(200).json(result);
    }

    console.log(`[PathwayController] Generated ${result.pathways.length} pathways`);
    console.log("[PathwayController] Sending success response\n");

    res.status(200).json(result);
  } catch (error) {
    console.error("[PathwayController] Error in generatePathwaysV2:", error.message);
    next(error);
  }
};


/**
 * Generate pathways V3 (with eligibility filtering)
 * POST /api/pathways/generate-v3
 */
const generatePathwaysV3 = async (req, res, next) => {
  console.log("\n========================================");
  console.log("[PathwayController] POST /api/pathways/generate-v3");
  console.log("========================================");

  const userId = req.user?.id;
  console.log(`[PathwayController] User ID: ${userId}`);
  console.log(
    `[PathwayController] Request body:`,
    JSON.stringify(req.body, null, 2)
  );

  try {
    if (!userId) {
      throw new AppError("User authentication required", 401);
    }

    const request = {
      strategy_type: req.body.strategy_type,
      target_job_id: req.body.target_job_id,
      target_company_id: req.body.target_company_id,
      target_company_ids: req.body.target_company_ids,
      target_role_ids: req.body.target_role_ids,
      target_domains: req.body.target_domains,
      preferences: req.body.preferences,
      include_types: req.body.include_types, // NEW
      eligibility_options: req.body.eligibility_options, // NEW
    };

    console.log("[PathwayController] Calling pathway generation service V3");

    const result = await pathwayGenerationServiceV3.generatePathwaysV3(
      userId,
      request
    );

    console.log(`[PathwayController] Generation complete. Success: ${result.success}`);

    res.status(200).json(result);
  } catch (error) {
    console.error(
      "[PathwayController] Error in generatePathwaysV3:",
      error.message
    );
    next(error);
  }
};




const getResourceById = async (req, res, next) => {

  console.log("the api is called");
  console.log("the req param resource id is",req.params.id);

  const userId = req.user?.id;
  const resourceId=req.params.id;
  

  try {
    const resource = await LearningResource.findByPk(req.params.id, {
      include: [
        {
          model: ResourceSkill,
          as: "resourceSkills",
          include: [{ model: Skill, as: "skill" }],
        },
      ],
    });


    if (!resource)
      return res
        .status(404)
        .json({ success: false, message: "Resource not found" });


    return res.json({ success: true, resource });

  } catch (error) {
    console.error("get resource by id", error);
    return res.status(500).json({ error: "Failed to get resource" });
  }
};





module.exports = {
  generatePathways,
  generatePathwaysV2,
  generatePathwaysV3,
  getPathways,
  getPathwayById,
  updatePathwayStatus,
  deletePathways,
  getPathwayStatistics,
  getUserPreferences,
  updateUserPreferences,
  getResourceById
};
