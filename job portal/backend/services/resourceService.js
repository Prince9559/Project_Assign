/**
 * Resource Management Service
 * Fetches and manages learning resources
 */

const db = require("../models");
const { LearningResource, ResourceSkill, Skill, Domain } = db;
const { Op } = require("sequelize");
const {
  filterResourcesByConstraints,
  deduplicateResources,
  sortResourcesByScore,
} = require("../utils/resourceUtils");
const { scoreResource } = require("../utils/pathwayUtils");

/**
 * Fetch resources that teach specific skills
 * @param {Array} skillIds - Array of skill IDs
 * @param {Object} constraints - { maxDays, minDays }
 * @returns {Array} - Learning resources
 */
async function fetchResourcesForSkills(skillIds, constraints = {}) {
  try {
    const resources = await LearningResource.findAll({
      where: {
        is_active: true,
      },
      include: [
        {
          model: ResourceSkill,
          as: "resourceSkills",
          where: {
            skill_id: { [Op.in]: skillIds },
          },
          include: [
            {
              model: Skill,
              as: "skill",
              include: [{ model: Domain, as: "domain" }],
            },
          ],
        },
      ],
      distinct: true,
    });

    // Apply constraints
    const filtered = filterResourcesByConstraints(resources, constraints);

    // Deduplicate
    const deduplicated = deduplicateResources(filtered);

    return deduplicated;
  } catch (error) {
    console.error("Error in fetchResourcesForSkills:", error);
    throw error;
  }
}

/**
 * Fetch all resources with their skills
 * @param {Object} filters - { resource_type, difficulty_level, is_active }
 * @returns {Array}
 */
async function fetchAllResources(filters = {}) {
  try {
    const where = {};

    if (filters.resource_type) {
      where.resource_type = filters.resource_type;
    }

    if (filters.difficulty_level) {
      where.difficulty_level = filters.difficulty_level;
    }

    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active;
    } else {
      where.is_active = true; // Default to active only
    }

    const resources = await LearningResource.findAll({
      where,
      include: [
        {
          model: ResourceSkill,
          as: "resourceSkills",
          include: [
            {
              model: Skill,
              as: "skill",
              include: [{ model: Domain, as: "domain" }],
            },
          ],
        },
      ],
    });

    return resources;
  } catch (error) {
    console.error("Error in fetchAllResources:", error);
    throw error;
  }
}

/**
 * Score and rank resources based on gap skills and preferences
 * @param {Array} resources - Learning resources
 * @param {Object} gapSkills - Skill gap object
 * @param {Object} userPreferences - User preferences
 * @returns {Array} - Scored and sorted resources
 */
function scoreAndRankResources(resources, gapSkills, userPreferences) {
  // Score each resource
  const scoredResources = resources.map((resource) => {
    const score = scoreResource(resource, gapSkills, userPreferences);
    return {
      ...resource.toJSON(),
      calculatedScore: score,
    };
  });

  // Sort by score
  return sortResourcesByScore(scoredResources);
}

/**
 * Get resource by ID with all details
 * @param {Number} resourceId
 * @returns {Object}
 */
async function getResourceById(resourceId) {
  try {
    const resource = await LearningResource.findByPk(resourceId, {
      include: [
        {
          model: ResourceSkill,
          as: "resourceSkills",
          include: [
            {
              model: Skill,
              as: "skill",
              include: [{ model: Domain, as: "domain" }],
            },
          ],
        },
      ],
    });

    if (!resource) {
      throw new Error(`Resource with ID ${resourceId} not found`);
    }

    return resource;
  } catch (error) {
    console.error("Error in getResourceById:", error);
    throw error;
  }
}

/**
 * Get resources by type
 * @param {String} resourceType - 'course', 'project', 'internship'
 * @param {Object} options - { limit, offset }
 * @returns {Array}
 */
async function getResourcesByType(resourceType, options = {}) {
  try {
    const { limit = 50, offset = 0 } = options;

    const resources = await LearningResource.findAll({
      where: {
        resource_type: resourceType,
        is_active: true,
      },
      include: [
        {
          model: ResourceSkill,
          as: "resourceSkills",
          include: [
            {
              model: Skill,
              as: "skill",
              include: [{ model: Domain, as: "domain" }],
            },
          ],
        },
      ],
      limit,
      offset,
      order: [["created_at", "DESC"]],
    });

    return resources;
  } catch (error) {
    console.error("Error in getResourcesByType:", error);
    throw error;
  }
}

/**
 * Get resource statistics
 * @returns {Object}
 */
async function getResourceStatistics() {
  try {
    const stats = await LearningResource.findAll({
      attributes: [
        "resource_type",
        [db.sequelize.fn("COUNT", db.sequelize.col("resource_id")), "count"],
        [db.sequelize.fn("AVG", db.sequelize.col("total_duration")), "avg_duration"],
      ],
      where: { is_active: true },
      group: ["resource_type"],
      raw: true,
    });

    const formatted = {
      total: 0,
      by_type: {},
    };

    stats.forEach((stat) => {
      formatted.by_type[stat.resource_type] = {
        count: parseInt(stat.count),
        avg_duration_days: parseFloat(stat.avg_duration).toFixed(2),
      };
      formatted.total += parseInt(stat.count);
    });

    return formatted;
  } catch (error) {
    console.error("Error in getResourceStatistics:", error);
    throw error;
  }
}

/**
 * Search resources by title or description
 * @param {String} query - Search query
 * @param {Object} filters - Additional filters
 * @returns {Array}
 */
async function searchResources(query, filters = {}) {
  try {
    const where = {
      is_active: true,
      [Op.or]: [
        { title: { [Op.like]: `%${query}%` } },
        { description: { [Op.like]: `%${query}%` } },
      ],
    };

    if (filters.resource_type) {
      where.resource_type = filters.resource_type;
    }

    if (filters.difficulty_level) {
      where.difficulty_level = filters.difficulty_level;
    }

    const resources = await LearningResource.findAll({
      where,
      include: [
        {
          model: ResourceSkill,
          as: "resourceSkills",
          include: [
            {
              model: Skill,
              as: "skill",
              include: [{ model: Domain, as: "domain" }],
            },
          ],
        },
      ],
      limit: 20,
    });

    return resources;
  } catch (error) {
    console.error("Error in searchResources:", error);
    throw error;
  }
}

module.exports = {
  fetchResourcesForSkills,
  fetchAllResources,
  scoreAndRankResources,
  getResourceById,
  getResourcesByType,
  getResourceStatistics,
  searchResources,
};