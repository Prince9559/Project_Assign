// utils/jobAccessService.js
const { JobAccess, JobPost, UserAccessMembership,CompanyRecruiterProfile, AccessScope } = require("../models");
const { Op, where } = require("sequelize");

/**
 * Check if user has access to a job
 * @param {number} userId
 * @param {number} jobId
 * @returns {Promise<{ hasAccess: boolean, level: string | null }>}
 */
exports.hasJobAccess = async (userId, jobId) => {
  try {
    // 1. Check direct job_access
    const directAccess = await JobAccess.findOne({
      where: { user_id: userId, job_id: jobId },
    });

    if (directAccess) {
      return {
        hasAccess: true,
        level: directAccess.access_level,
      };
    }

    // 2. Check if user is Owner of the company (auto-access to all jobs)
    const job = await JobPost.findByPk(jobId, {
      attributes: ["company_recruiter_profile_id"],
    });

    console.log("checked job access for user:", userId, "job:", jobId);


    if (!job) return { hasAccess: false, level: null };
    console.log("checking membership");

    const scope = await AccessScope.findOne({
      where: {
        scope_id: job.company_recruiter_profile_id,
        scope_type: "COMPANY",
      },
    });

    const membership = await UserAccessMembership.findOne({
      where: {
        user_id: userId,
        scope_id: scope.id,
        is_primary: true,
        status: "active",
      },
    });

    console.log("the membership found:", membership);
    if (membership) {
      return { hasAccess: true, level: "manage" }; // Owner has full access
    }

    return { hasAccess: false, level: null };
  } catch (err) {
    console.error("Job access check error:", err);
    return { hasAccess: false, level: null };
  }
};

/**
 * Get all job IDs accessible to user
 * @param {number} userId
 * @param {string[]} levels - e.g., ['view', 'edit', 'manage']
 * @returns {Promise<number[]>}
 */
exports.getAccessibleJobIds = async (
  userId,
  levels = ["view", "edit", "manage"]
) => {
  try {
    // 1. Get jobs via job_access
    const directJobs = await JobAccess.findAll({
      where: {
        user_id: userId,
        access_level: { [Op.in]: levels },
      },
      attributes: ["job_id"],
    });

    const jobIds = directJobs.map((j) => j.job_id);

    // 2. Add all company jobs if user is Owner
    const ownerJobs = await JobPost.findAll({
      include: [
        {
          model: CompanyRecruiterProfile,
          as: "CompanyRecruiterProfile", 
          where:{user_id:userId},
          attributes: ["id"],
          required: true,
        },
      ],
      attributes: ["job_id"],
    });

    const ownerJobIds = ownerJobs.map((j) => j.job_id);

    // Merge and dedupe
    return [...new Set([...jobIds, ...ownerJobIds])];
  } catch (err) {
    console.error("Accessible job IDs error:", err);
    return [];
  }
};
