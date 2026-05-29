//    backend/middleware/pathwayValidation.js
/**
 * Pathway Request Validation Middleware
 */

const { body, param, query, validationResult } = require("express-validator");
const pathwayConfig = require("../config/pathwayConfig");
const { AppError } = require("./errorHandler");

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log("[PathwayValidation] Validation failed:", errors.array());

    const errorMessages = errors.array().map((err) => err.msg);

    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: errorMessages,
    });
  }

  console.log("[PathwayValidation] Validation passed");
  next();
};

/**
 * Validate pathway generation request
 */
const validateGeneratePathway = [
  body("strategy_type")
    .notEmpty()
    .withMessage("strategy_type is required")
    .isIn(pathwayConfig.VALID_STRATEGY_TYPES)
    .withMessage(
      `strategy_type must be one of: ${pathwayConfig.VALID_STRATEGY_TYPES.join(
        ", "
      )}`
    ),

  body("target_job_id")
    .if(body("strategy_type").equals("job_specific"))
    .notEmpty()
    .withMessage("target_job_id is required for job_specific strategy")
    .isInt({ min: 1 })
    .withMessage("target_job_id must be a positive integer"),

  body("target_company_id")
    .if(body("strategy_type").equals("company_target"))
    .notEmpty()
    .withMessage("target_company_id is required for company_target strategy")
    .isInt({ min: 1 })
    .withMessage("target_company_id must be a positive integer"),

  body("target_domains")
    .if(body("strategy_type").equals("direct_upskilling"))
    .notEmpty()
    .withMessage("target_domains is required for direct_upskilling strategy")
    .isArray({ min: 1 })
    .withMessage("target_domains must be a non-empty array")
    .custom((value) => {
      if (!value.every((id) => Number.isInteger(id) && id > 0)) {
        throw new Error("All domain IDs must be positive integers");
      }
      return true;
    }),

  body("preferences.resource_priority")
    .optional()
    .isArray({ min: 1, max: 3 })
    .withMessage("resource_priority must be an array with 1-3 elements")
    .custom((value) => {
      const validTypes = pathwayConfig.VALID_RESOURCE_TYPES;
      if (!value.every((type) => validTypes.includes(type))) {
        throw new Error(
          `resource_priority items must be one of: ${validTypes.join(", ")}`
        );
      }
      return true;
    }),

  body("preferences.max_timeline")
    .optional()
    .isInt({
      min: pathwayConfig.MIN_TIMELINE_DAYS,
      max: pathwayConfig.MAX_TIMELINE_DAYS,
    })
    .withMessage(
      `max_timeline must be between ${pathwayConfig.MIN_TIMELINE_DAYS} and ${pathwayConfig.MAX_TIMELINE_DAYS} days`
    ),

  body("preferences.min_timeline")
    .optional()
    .isInt({ min: 1 })
    .withMessage("min_timeline must be at least 1 day")
    .custom((value, { req }) => {
      if (
        req.body.preferences?.max_timeline &&
        value >= req.body.preferences.max_timeline
      ) {
        throw new Error("min_timeline must be less than max_timeline");
      }
      return true;
    }),

  handleValidationErrors,
];

/**
 * Validate pathway ID parameter
 */
const validatePathwayId = [
  param("pathwayId")
    .notEmpty()
    .withMessage("pathwayId is required")
    .isInt({ min: 1 })
    .withMessage("pathwayId must be a positive integer"),

  handleValidationErrors,
];

/**
 * Validate update pathway status request
 */
const validateUpdateStatus = [
  param("pathwayId")
    .notEmpty()
    .withMessage("pathwayId is required")
    .isInt({ min: 1 })
    .withMessage("pathwayId must be a positive integer"),

  body("status")
    .notEmpty()
    .withMessage("status is required")
    .isIn(pathwayConfig.VALID_PATHWAY_STATUSES)
    .withMessage(
      `status must be one of: ${pathwayConfig.VALID_PATHWAY_STATUSES.join(
        ", "
      )}`
    ),

  handleValidationErrors,
];

/**
 * Validate get pathways query parameters
 */
const validateGetPathways = [
  query("status")
    .optional()
    .isIn(pathwayConfig.VALID_PATHWAY_STATUSES)
    .withMessage(
      `status must be one of: ${pathwayConfig.VALID_PATHWAY_STATUSES.join(
        ", "
      )}`
    ),

  query("strategy_type")
    .optional()
    .isIn(pathwayConfig.VALID_STRATEGY_TYPES)
    .withMessage(
      `strategy_type must be one of: ${pathwayConfig.VALID_STRATEGY_TYPES.join(
        ", "
      )}`
    ),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("limit must be between 1 and 100"),

  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("offset must be a non-negative integer"),

  handleValidationErrors,
];

/**
 * Validate delete pathways request
 */
const validateDeletePathways = [
  query("strategy_type")
    .optional()
    .isIn(pathwayConfig.VALID_STRATEGY_TYPES)
    .withMessage(
      `strategy_type must be one of: ${pathwayConfig.VALID_STRATEGY_TYPES.join(
        ", "
      )}`
    ),

  query("status")
    .optional()
    .isIn(pathwayConfig.VALID_PATHWAY_STATUSES)
    .withMessage(
      `status must be one of: ${pathwayConfig.VALID_PATHWAY_STATUSES.join(
        ", "
      )}`
    ),

  handleValidationErrors,
];

/**
 * Validate user preferences update
 */
const validateUpdatePreferences = [
  body("resource_priority")
    .optional()
    .isArray({ min: 1, max: 3 })
    .withMessage("resource_priority must be an array with 1-3 elements")
    .custom((value) => {
      const validTypes = pathwayConfig.VALID_RESOURCE_TYPES;
      if (!value.every((type) => validTypes.includes(type))) {
        throw new Error(
          `resource_priority items must be one of: ${validTypes.join(", ")}`
        );
      }
      return true;
    }),

  body("max_timeline")
    .optional()
    .isInt({
      min: pathwayConfig.MIN_TIMELINE_DAYS,
      max: pathwayConfig.MAX_TIMELINE_DAYS,
    })
    .withMessage(
      `max_timeline must be between ${pathwayConfig.MIN_TIMELINE_DAYS} and ${pathwayConfig.MAX_TIMELINE_DAYS} days`
    ),

  body("min_timeline")
    .optional()
    .isInt({ min: 1 })
    .withMessage("min_timeline must be at least 1 day")
    .custom((value, { req }) => {
      if (req.body.max_timeline && value >= req.body.max_timeline) {
        throw new Error("min_timeline must be less than max_timeline");
      }
      return true;
    }),

  handleValidationErrors,
];



/**
 * Validate pathway generation V2 request
 */
const validateGeneratePathwayV2 = [
  body("strategy_type")
    .notEmpty()
    .withMessage("strategy_type is required")
    .isIn([...pathwayConfig.VALID_STRATEGY_TYPES, "company_role_target"]) // Add new strategy
    .withMessage(
      `strategy_type must be one of: ${[...pathwayConfig.VALID_STRATEGY_TYPES, "company_role_target"].join(", ")}`
    ),

  body("target_job_id")
    .if(body("strategy_type").equals("job_specific"))
    .notEmpty()
    .withMessage("target_job_id is required for job_specific strategy")
    .isInt({ min: 1 })
    .withMessage("target_job_id must be a positive integer"),

  // NEW: Company and role target validation
  body("target_company_ids")
    .if(body("strategy_type").equals("company_role_target"))
    .optional()
    .isArray({ min: 1 })
    .withMessage("target_company_ids must be a non-empty array")
    .custom((value) => {
      if (!value.every((id) => Number.isInteger(id) && id > 0)) {
        throw new Error("All company IDs must be positive integers");
      }
      return true;
    }),

  body("target_role_ids")
    .if(body("strategy_type").equals("company_role_target"))
    .optional()
    .isArray({ min: 1 })
    .withMessage("target_role_ids must be a non-empty array")
    .custom((value) => {
      if (!value.every((id) => Number.isInteger(id) && id > 0)) {
        throw new Error("All role IDs must be positive integers");
      }
      return true;
    }),

  // At least one of company_ids or role_ids must be provided for company_role_target
  body()
    .if(body("strategy_type").equals("company_role_target"))
    .custom((value) => {
      if (
        (!value.target_company_ids || value.target_company_ids.length === 0) &&
        (!value.target_role_ids || value.target_role_ids.length === 0)
      ) {
        throw new Error(
          "At least one of target_company_ids or target_role_ids must be provided for company_role_target strategy"
        );
      }
      return true;
    }),

  body("target_domains")
    .if(body("strategy_type").equals("direct_upskilling"))
    .notEmpty()
    .withMessage("target_domains is required for direct_upskilling strategy")
    .isArray({ min: 1 })
    .withMessage("target_domains must be a non-empty array")
    .custom((value) => {
      if (!value.every((id) => Number.isInteger(id) && id > 0)) {
        throw new Error("All domain IDs must be positive integers");
      }
      return true;
    }),

  body("preferences.resource_priority")
    .optional()
    .isArray({ min: 1, max: 3 })
    .withMessage("resource_priority must be an array with 1-3 elements")
    .custom((value) => {
      const validTypes = pathwayConfig.VALID_RESOURCE_TYPES;
      if (!value.every((type) => validTypes.includes(type))) {
        throw new Error(
          `resource_priority items must be one of: ${validTypes.join(", ")}`
        );
      }
      return true;
    }),

  body("preferences.max_timeline")
    .optional()
    .isInt({ min: pathwayConfig.MIN_TIMELINE_DAYS, max: pathwayConfig.MAX_TIMELINE_DAYS })
    .withMessage(
      `max_timeline must be between ${pathwayConfig.MIN_TIMELINE_DAYS} and ${pathwayConfig.MAX_TIMELINE_DAYS} days`
    ),

  handleValidationErrors,
];

const validateGeneratePathwayV3 = [
  // All previous validations from V2
  ...validateGeneratePathwayV2,

  // NEW: include_types validation
  body("include_types")
    .optional()
    .isArray({ min: 1 })
    .withMessage("include_types must be a non-empty array")
    .custom((value) => {
      const validTypes = ["course", "project", "internship", "job"];
      if (!value.every((type) => validTypes.includes(type))) {
        throw new Error(
          `include_types must contain only: ${validTypes.join(", ")}`
        );
      }
      return true;
    }),

  // NEW: eligibility_options validation
  body("eligibility_options")
    .optional()
    .isObject()
    .withMessage("eligibility_options must be an object"),

  body("eligibility_options.check_internships")
    .optional()
    .isBoolean()
    .withMessage("check_internships must be a boolean"),

  body("eligibility_options.check_jobs")
    .optional()
    .isBoolean()
    .withMessage("check_jobs must be a boolean"),

  body("eligibility_options.check_projects")
    .optional()
    .isBoolean()
    .withMessage("check_projects must be a boolean"),

  body("eligibility_options.min_match_percentage")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("min_match_percentage must be between 0 and 100"),

  handleValidationErrors,
];




module.exports = {
  validateGeneratePathway,
  validateGeneratePathwayV2,
  validateGeneratePathwayV3,
  validatePathwayId,
  validateUpdateStatus,
  validateGetPathways,
  validateDeletePathways,
  validateUpdatePreferences,
};
