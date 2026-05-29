/**
 * Skill Gap Analysis Service
 * Calculates what skills a user needs to learn based on target
 */

const db = require("../models");
const { JobPost, Skill, UserSkill, JobPostSkill, Domain } = db;
const { calculateSkillGap } = require("../utils/pathwayUtils");

/**
 * Get skill gap for job-specific strategy
 * @param {Number} userId
 * @param {Number} jobPostId
 * @returns {Object} - Skill gap details
 */
async function getSkillGapForJob(userId, jobPostId) {
  try {
    // 1. Get required skills for the job
    const jobSkills = await JobPostSkill.findAll({
      where: { job_post_id: jobPostId },
      include: [
        {
          model: Skill,
          as: "Skill",
          include: [{ model: Domain, as: "domain" }],
        },
      ],
    });

    const requiredSkills = jobSkills.map((js) => ({
      skill_id: js.skill_id,
      type: js.type, // 'must_have' or 'preferred'
      skill_name: js.Skill.skill_name,
      domain_id: js.Skill.domain_id,
      domain_name: js.Skill.domain?.domain_name,
    }));

    // 2. Get user's current skills
    const userSkills = await UserSkill.findAll({
      where: { user_id: userId },
      attributes: ["skill_id"],
    });

    const userSkillIds = userSkills.map((us) => us.skill_id);

    // 3. Calculate gap
    const gap = calculateSkillGap(requiredSkills, userSkillIds);

    return {
      success: true,
      jobPostId,
      requiredSkills,
      userSkillIds,
      gap,
    };
  } catch (error) {
    console.error("Error in getSkillGapForJob:", error);
    throw error;
  }
}

/**
 * Get skill gap for company-target strategy
 * Aggregates skills from multiple job posts from the same company
 * @param {Number} userId
 * @param {Number} companyId
 * @returns {Object}
 */
async function getSkillGapForCompany(userId, companyId) {
  try {
    // 1. Get all active jobs from this company
    const jobPosts = await JobPost.findAll({
      where: {
        company_recruiter_profile_id: companyId,
        active_status: 1,
      },
      include: [
        {
          model: Skill,
          as: "skills",
          through: { attributes: ["type"] },
          include: [{ model: Domain, as: "domain" }],
        },
      ],
    });

    if (jobPosts.length === 0) {
      throw new Error("No active jobs found for this company");
    }

    // 2. Aggregate skills across all jobs (count frequency)
    const skillFrequency = {};

    for (const job of jobPosts) {
      for (const skill of job.skills) {
        const key = skill.skill_id;
        if (!skillFrequency[key]) {
          skillFrequency[key] = {
            skill_id: skill.skill_id,
            skill_name: skill.skill_name,
            domain_id: skill.domain_id,
            domain_name: skill.domain?.domain_name,
            count: 0,
            must_have_count: 0,
            preferred_count: 0,
          };
        }

        skillFrequency[key].count++;

        if (skill.JobPostSkill.type === "must_have") {
          skillFrequency[key].must_have_count++;
        } else {
          skillFrequency[key].preferred_count++;
        }
      }
    }

    // 3. Determine type based on frequency (if appears as must_have in >50% jobs, it's must_have)
    const totalJobs = jobPosts.length;
    const requiredSkills = Object.values(skillFrequency).map((skill) => ({
      skill_id: skill.skill_id,
      skill_name: skill.skill_name,
      domain_id: skill.domain_id,
      domain_name: skill.domain_name,
      type:
        skill.must_have_count / totalJobs >= 0.5 ? "must_have" : "preferred",
      frequency: skill.count,
    }));

    // 4. Get user's current skills
    const userSkills = await UserSkill.findAll({
      where: { user_id: userId },
      attributes: ["skill_id"],
    });

    const userSkillIds = userSkills.map((us) => us.skill_id);

    // 5. Calculate gap
    const gap = calculateSkillGap(requiredSkills, userSkillIds);

    return {
      success: true,
      companyId,
      totalJobsAnalyzed: totalJobs,
      requiredSkills,
      userSkillIds,
      gap,
    };
  } catch (error) {
    console.error("Error in getSkillGapForCompany:", error);
    throw error;
  }
}

/**
 * Get skill gap for direct upskilling strategy
 * @param {Number} userId
 * @param {Array} domainIds - Array of domain IDs user wants to learn
 * @param {Object} options - { includeTrending: boolean }
 * @returns {Object}
 */
async function getSkillGapForUpskilling(userId, domainIds, options = {}) {
  try {
    const { includeTrending = true } = options;

    // 1. Get all skills from selected domains
    const domainSkills = await Skill.findAll({
      where: { domain_id: domainIds },
      include: [{ model: Domain, as: "domain" }],
    });

    // 2. Get user's current skills
    const userSkills = await UserSkill.findAll({
      where: { user_id: userId },
      attributes: ["skill_id"],
    });

    const userSkillIds = userSkills.map((us) => us.skill_id);

    // 3. Filter skills user doesn't have
    const requiredSkills = domainSkills
      .filter((skill) => !userSkillIds.includes(skill.skill_id))
      .map((skill) => ({
        skill_id: skill.skill_id,
        skill_name: skill.skill_name,
        domain_id: skill.domain_id,
        domain_name: skill.domain?.domain_name,
        type: "must_have", // All are must_have in upskilling
      }));

    // 4. TODO: Add trending skills logic (can be based on job post frequency)
    // For now, treating all domain skills equally

    const gap = {
      mustHaveGap: requiredSkills,
      preferredGap: [],
      allGapSkillIds: requiredSkills.map((s) => s.skill_id),
      totalGapCount: requiredSkills.length,
    };

    return {
      success: true,
      domainIds,
      requiredSkills,
      userSkillIds,
      gap,
    };
  } catch (error) {
    console.error("Error in getSkillGapForUpskilling:", error);
    throw error;
  }
}

/**
 * Main function to get skill gap based on strategy
 * @param {Number} userId
 * @param {String} strategyType - 'job_specific', 'company_target', 'direct_upskilling'
 * @param {Object} targetData - { jobPostId, companyId, domainIds }
 * @returns {Object}
 */
async function getSkillGap(userId, strategyType, targetData) {
  switch (strategyType) {
    case "job_specific":
      if (!targetData.jobPostId) {
        throw new Error("jobPostId is required for job_specific strategy");
      }
      return await getSkillGapForJob(userId, targetData.jobPostId);

    case "company_target":
      if (!targetData.companyId) {
        throw new Error("companyId is required for company_target strategy");
      }
      return await getSkillGapForCompany(userId, targetData.companyId);

    case "direct_upskilling":
      if (!targetData.domainIds || targetData.domainIds.length === 0) {
        throw new Error(
          "domainIds array is required for direct_upskilling strategy"
        );
      }
      return await getSkillGapForUpskilling(userId, targetData.domainIds);

    default:
      throw new Error(`Invalid strategy type: ${strategyType}`);
  }
}

module.exports = {
  getSkillGap,
  getSkillGapForJob,
  getSkillGapForCompany,
  getSkillGapForUpskilling,
};
