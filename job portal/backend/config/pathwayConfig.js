// backend/config/pathwayConfig.js

/**
 * Pathway Generation Configuration
 */

module.exports = {
  // Timeline constraints (in days)
  MIN_TIMELINE_DAYS: 7,
  MAX_TIMELINE_DAYS: 365,
  DEFAULT_MAX_TIMELINE_DAYS: 365, // 26 weeks
  DEFAULT_MIN_TIMELINE_DAYS: 28, // 4 weeks

  // Pathway constraints
  MAX_PATHWAYS_TO_GENERATE: 3,
  MAX_RESOURCES_PER_PATHWAY: 8,
  MIN_RESOURCES_PER_PATHWAY: 1,

  // Valid enum values
  VALID_RESOURCE_TYPES: ["internship", "project", "course", "job"],
  VALID_STRATEGY_TYPES: [
    "job_specific",
    "company_target",
    "company_role_target", // NEW
    "direct_upskilling",
  ],
  VALID_PATHWAY_STATUSES: [
    "suggested",
    "selected",
    "in_progress",
    "completed",
    "abandoned",
  ],
  VALID_DIFFICULTY_LEVELS: ["beginner", "intermediate", "advanced"],
  DEFAULT_RESOURCE_PRIORITY: ["internship", "project", "course"],

  // Scoring weights
  SCORE_MUST_HAVE_SKILL: 30,
  SCORE_PREFERRED_SKILL: 15,
  SCORE_EFFICIENCY_MULTIPLIER: 50,
  SCORE_PREFERENCE_BONUS: 10,
  SCORE_RATING_MULTIPLIER: 5,

  // Messages
  MESSAGES: {
    NO_SKILL_GAP: "You already have all required skills!",
    NO_RESOURCES_AVAILABLE:
      "No learning resources available for required skills",
    GENERATION_SUCCESS: "Pathways generated successfully",
    PATHWAY_NOT_FOUND: "Pathway not found",
    INVALID_STRATEGY: "Invalid strategy type",
    INVALID_STATUS: "Invalid pathway status",
    UPDATE_SUCCESS: "Pathway updated successfully",
    DELETE_SUCCESS: "Pathway deleted successfully",
  },
};
