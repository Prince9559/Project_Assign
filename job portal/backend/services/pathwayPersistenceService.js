/**
 * Pathway Persistence Service
 * Saves and loads pathways from database
 */

const db = require("../models");
const { UserPathway, PathwayStep, LearningResource, ResourceSkill, Skill } = db;

/**
 * Save pathways to database
 * @param {Number} userId
 * @param {Array} pathways - Array of pathway objects
 * @param {Object} metadata - Strategy type, target info, etc.
 * @returns {Array} - Saved pathway records
 */
async function savePathways(userId, pathways, metadata) {
  console.log("[PathwayPersistence] Saving pathways to database");
  console.log(`[PathwayPersistence] User ID: ${userId}`);
  console.log(`[PathwayPersistence] Number of pathways: ${pathways.length}`);
  console.log(`[PathwayPersistence] Strategy: ${metadata.strategy_type}`);

  const savedPathways = [];

  try {
    // Start transaction
    const transaction = await db.sequelize.transaction();

    try {
      for (let i = 0; i < pathways.length; i++) {
        const pathway = pathways[i];

        console.log(
          `[PathwayPersistence] Saving pathway ${i + 1}/${pathways.length}`
        );

        // Calculate metadata
        const totalDuration = pathway.steps.reduce(
          (sum, step) => sum + step.personalizedDuration,
          0
        );

        const resourceCounts = {
          internships: pathway.steps.filter(
            (s) => s.resource.resource_type === "internship"
          ).length,
          projects: pathway.steps.filter(
            (s) => s.resource.resource_type === "project"
          ).length,
          courses: pathway.steps.filter(
            (s) => s.resource.resource_type === "course"
          ).length,
          jobs: pathway.steps.filter(
            (s) => s.resource.resource_type === "job"
          ).length,
        };

        console.log("the resource count", resourceCounts)

        const allCoveredSkills = new Set();
        pathway.steps.forEach((step) => {
          step.skillsCovered.forEach((skillId) =>
            allCoveredSkills.add(skillId)
          );
        });

        console.log(
          `[PathwayPersistence]   Total duration: ${totalDuration} days`
        );
        console.log(
          `[PathwayPersistence]   Resources: ${resourceCounts.internships}I + ${resourceCounts.projects}P + ${resourceCounts.courses}C + ${resourceCounts.jobs}J`
        );
        console.log(
          `[PathwayPersistence]   Skills covered: ${allCoveredSkills.size}`
        );

        // Create pathway record
        const pathwayRecord = await UserPathway.create(
          {
            user_id: userId,
            strategy_type: metadata.strategy_type,
            target_job_id: metadata.target_job_id || null,
            target_company_id: metadata.target_company_id || null,
            target_company_ids: metadata.target_company_ids || null,
            target_role_ids: metadata.target_role_ids || null,
            target_domains: metadata.target_domains || null,
            pathway_rank: i + 1,
            total_duration: totalDuration,
            total_skills_covered: allCoveredSkills.size,
            skill_coverage_percent: pathway.coveragePercent || 100.0,
            total_internships: resourceCounts.internships,
            total_projects: resourceCounts.projects,
            total_courses: resourceCounts.courses,
            total_jobs: resourceCounts.jobs,
            pathway_score: pathway.score || 0,
            status: "suggested",
          },
          { transaction }
        );

        console.log(
          `[PathwayPersistence]   Created pathway record ID: ${pathwayRecord.pathway_id}`
        );

        // Create pathway steps
        for (let j = 0; j < pathway.steps.length; j++) {
          const step = pathway.steps[j];

          console.log(
            `[PathwayPersistence]     Saving step ${j + 1}/${
              pathway.steps.length
            }: ${step.resource.title}`
          );

          await PathwayStep.create(
            {
              pathway_id: pathwayRecord.pathway_id,
              resource_id: step.resource.resource_id,
              step_order: j + 1,
              skills_to_learn: step.skillsCovered,
              expected_duration: step.personalizedDuration,
              status: "pending",
            },
            { transaction }
          );
        }

        console.log(
          `[PathwayPersistence]   Saved ${pathway.steps.length} steps`
        );

        savedPathways.push(pathwayRecord);
      }

      // Commit transaction
      await transaction.commit();

      console.log("[PathwayPersistence] All pathways saved successfully");

      return savedPathways;
    } catch (error) {
      // Rollback on error
      await transaction.rollback();
      console.error(
        "[PathwayPersistence] Error during save, transaction rolled back"
      );
      throw error;
    }
  } catch (error) {
    console.error("[PathwayPersistence] Failed to save pathways:", error);
    throw error;
  }
}

/**
 * Load pathways for a user
 * @param {Number} userId
 * @param {Object} filters - { status, strategy_type }
 * @returns {Array}
 */
async function loadPathways(userId, filters = {}) {
  console.log("[PathwayPersistence] Loading pathways from database");
  console.log(`[PathwayPersistence] User ID: ${userId}`);
  console.log(`[PathwayPersistence] Filters:`, filters);

  try {
    const where = { user_id: userId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.strategy_type) {
      where.strategy_type = filters.strategy_type;
    }

    const pathways = await UserPathway.findAll({
      where,
      include: [
        {
          model: PathwayStep,
          as: "steps",
          include: [
            {
              model: LearningResource,
              as: "resource",
              include: [
                {
                  model: ResourceSkill,
                  as: "resourceSkills",
                  include: [
                    {
                      model: Skill,
                      as: "Skill",
                    },
                  ],
                },
              ],
            },
          ],
          order: [["step_order", "ASC"]],
        },
      ],
      order: [
        ["pathway_rank", "ASC"],
        ["created_at", "DESC"],
      ],
    });

    console.log(`[PathwayPersistence] Loaded ${pathways.length} pathways`);

    return pathways;
  } catch (error) {
    console.error("[PathwayPersistence] Failed to load pathways:", error);
    throw error;
  }
}

/**
 * Get pathway by ID
 * @param {Number} pathwayId
 * @returns {Object}
 */
async function getPathwayById(pathwayId) {
  console.log(`[PathwayPersistence] Loading pathway ID: ${pathwayId}`);

  try {
    const pathway = await UserPathway.findByPk(pathwayId, {
      include: [
        {
          model: PathwayStep,
          as: "steps",
          include: [
            {
              model: LearningResource,
              as: "resource",
              include: [
                {
                  model: ResourceSkill,
                  as: "resourceSkills",
                  include: [
                    {
                      model: Skill,
                      as: "Skill",
                    },
                  ],
                },
              ],
            },
          ],
          order: [["step_order", "ASC"]],
        },
      ],
    });

    if (!pathway) {
      console.log(`[PathwayPersistence] Pathway ${pathwayId} not found`);
      return null;
    }

    console.log(
      `[PathwayPersistence] Loaded pathway: ${pathway.strategy_type}`
    );
    console.log(`[PathwayPersistence]   Steps: ${pathway.steps.length}`);

    return pathway;
  } catch (error) {
    console.error("[PathwayPersistence] Failed to load pathway:", error);
    throw error;
  }
}

/**
 * Update pathway status
 * @param {Number} pathwayId
 * @param {String} status - 'selected', 'in_progress', 'completed', 'abandoned'
 * @returns {Object}
 */
async function updatePathwayStatus(pathwayId, status) {
  console.log(
    `[PathwayPersistence] Updating pathway ${pathwayId} status to: ${status}`
  );

  try {
    const pathway = await UserPathway.findByPk(pathwayId);

    if (!pathway) {
      throw new Error(`Pathway ${pathwayId} not found`);
    }

    const updates = { status };

    if (status === "selected" && !pathway.selected_at) {
      updates.selected_at = new Date();
      console.log("[PathwayPersistence]   Setting selected_at timestamp");
    }

    if (status === "in_progress" && !pathway.started_at) {
      updates.started_at = new Date();
      console.log("[PathwayPersistence]   Setting started_at timestamp");
    }

    if (status === "completed" && !pathway.completed_at) {
      updates.completed_at = new Date();
      console.log("[PathwayPersistence]   Setting completed_at timestamp");
    }

    await pathway.update(updates);

    console.log("[PathwayPersistence] Pathway status updated successfully");

    return pathway;
  } catch (error) {
    console.error(
      "[PathwayPersistence] Failed to update pathway status:",
      error
    );
    throw error;
  }
}

/**
 * Delete pathways for user (cleanup old suggestions)
 * @param {Number} userId
 * @param {Object} filters - { strategy_type, status }
 * @returns {Number} - Number of deleted pathways
 */
async function deletePathways(userId, filters = {}) {
  console.log("[PathwayPersistence] Deleting pathways");
  console.log(`[PathwayPersistence] User ID: ${userId}`);
  console.log(`[PathwayPersistence] Filters:`, filters);

  try {
    const where = { user_id: userId };

    if (filters.strategy_type) {
      where.strategy_type = filters.strategy_type;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    const deletedCount = await UserPathway.destroy({ where });

    console.log(`[PathwayPersistence] Deleted ${deletedCount} pathways`);

    return deletedCount;
  } catch (error) {
    console.error("[PathwayPersistence] Failed to delete pathways:", error);
    throw error;
  }
}

/**
 * Get pathway statistics for user
 * @param {Number} userId
 * @returns {Object}
 */
async function getPathwayStatistics(userId) {
  console.log(
    `[PathwayPersistence] Getting pathway statistics for user ${userId}`
  );

  try {
    const stats = {
      total: 0,
      by_status: {},
      by_strategy: {},
    };

    const pathways = await UserPathway.findAll({
      where: { user_id: userId },
      attributes: ["status", "strategy_type"],
    });

    stats.total = pathways.length;

    pathways.forEach((pathway) => {
      // Count by status
      if (!stats.by_status[pathway.status]) {
        stats.by_status[pathway.status] = 0;
      }
      stats.by_status[pathway.status]++;

      // Count by strategy
      if (!stats.by_strategy[pathway.strategy_type]) {
        stats.by_strategy[pathway.strategy_type] = 0;
      }
      stats.by_strategy[pathway.strategy_type]++;
    });
    console.log("[PathwayPersistence] Statistics:", stats);

    return stats;
  } catch (error) {
    console.error("[PathwayPersistence] Failed to get statistics:", error);
    throw error;
  }
}
module.exports = {
  savePathways,
  loadPathways,
  getPathwayById,
  updatePathwayStatus,
  deletePathways,
  getPathwayStatistics,
};
