/**
 * Eligibility Utilities
 * Check if student can apply to job/internship opportunities
 */

const db = require("../models");
const { UserSkill, JobPostSkill } = db;

/**
 * Calculate skill match percentage between user and job
 * @param {Array} userSkillIds - Array of skill IDs user has
 * @param {Array} jobSkills - Array of { skill_id, type: 'must_have'/'preferred' }
 * @returns {Object} - { canApply, matchPercentage, missingMustHaves }
 */
function calculateSkillMatch(userSkillIds, jobSkills) {
  console.log("[EligibilityUtils] Calculating skill match");

  const userSkillSet = new Set(userSkillIds);

  // Separate must-have and preferred
  const mustHaves = jobSkills.filter((s) => s.type === "must_have");
  const preferred = jobSkills.filter((s) => s.type === "preferred");

  console.log(`[EligibilityUtils] Must-haves: ${mustHaves.length}, Preferred: ${preferred.length}`);

  // Check must-haves
  const hasMustHaves = mustHaves.filter((s) => userSkillSet.has(s.skill_id));
  const missingMustHaves = mustHaves.filter((s) => !userSkillSet.has(s.skill_id));

  const allMustHavesCovered = missingMustHaves.length === 0;

  console.log(`[EligibilityUtils] User has ${hasMustHaves.length}/${mustHaves.length} must-haves`);

  // If doesn't have all must-haves, can't apply
  if (!allMustHavesCovered) {
    console.log("[EligibilityUtils] Missing must-haves. Cannot apply.");
    return {
      canApply: false,
      matchPercentage: 0,
      missingMustHaves: missingMustHaves.map((s) => s.skill_id),
      hasAllMustHaves: false,
    };
  }

  // Calculate match percentage on preferred skills
  let matchPercentage = 100; // Already has all must-haves
  let hasPreferred;

  if (preferred.length > 0) {
     hasPreferred = preferred.filter((s) => userSkillSet.has(s.skill_id));
    const preferredMatchPercent = (hasPreferred.length / preferred.length) * 100;

    // Final match: 100% for must-haves already satisfied, then add preferred percentage
    // Formula can be adjusted based on client requirements
    matchPercentage = preferredMatchPercent; // Simple approach: just preferred match

    console.log(
      `[EligibilityUtils] Preferred skills: ${hasPreferred.length}/${preferred.length} (${preferredMatchPercent.toFixed(1)}%)`
    );
  }

  return {
    canApply: true,
    matchPercentage: parseFloat(matchPercentage.toFixed(2)),
    missingMustHaves: [],
    hasAllMustHaves: true,
    preferredMatch: preferred.length > 0 ? hasPreferred.length : null,
    preferredTotal: preferred.length > 0 ? preferred.length : null,
  };
}

/**
 * Check if student is eligible for a job/internship opportunity
 * @param {Number} userId
 * @param {Object} jobPost - JobPost object with skills
 * @param {Number} minMatchPercentage - Minimum match % required (optional)
 * @returns {Object} - { eligible, matchPercentage, reason }
 */
async function checkEligibility(userId, jobPost, minMatchPercentage = null) {
  console.log(`[EligibilityUtils] Checking eligibility for job ${jobPost.job_id}`);

  try {
    // Get user's skills
    const userSkills = await UserSkill.findAll({
      where: { user_id: userId },
      attributes: ["skill_id"],
    });

    const userSkillIds = userSkills.map((us) => us.skill_id);

    console.log(`[EligibilityUtils] User has ${userSkillIds.length} skills`);

    // Get job's required skills
    const jobSkills = await JobPostSkill.findAll({
      where: { job_post_id: jobPost.job_id },
      attributes: ["skill_id", "type"],
    });

    console.log(`[EligibilityUtils] Job requires ${jobSkills.length} skills`);

    if (jobSkills.length === 0) {
      // No skills required - anyone can apply
      console.log("[EligibilityUtils] No skills required. Eligible.");
      return {
        eligible: true,
        matchPercentage: 100,
        reason: "No specific skills required",
      };
    }

    // Calculate match
    const match = calculateSkillMatch(userSkillIds, jobSkills);

    console.log(`[EligibilityUtils] Match result:`, match);

    // Check if meets minimum percentage (if specified)
    if (minMatchPercentage !== null && match.canApply) {
      if (match.matchPercentage < minMatchPercentage) {
        console.log(
          `[EligibilityUtils] Match ${match.matchPercentage}% below minimum ${minMatchPercentage}%`
        );
        return {
          eligible: false,
          matchPercentage: match.matchPercentage,
          reason: `Match percentage ${match.matchPercentage}% below required ${minMatchPercentage}%`,
        };
      }
    }

    // Check job-specific min_skill_match_required
    const jobMinMatch = jobPost.min_skill_match_required || 0;
    if (jobMinMatch > 0 && match.matchPercentage < jobMinMatch) {
      console.log(
        `[EligibilityUtils] Match ${match.matchPercentage}% below job requirement ${jobMinMatch}%`
      );
      return {
        eligible: false,
        matchPercentage: match.matchPercentage,
        reason: `Match percentage ${match.matchPercentage}% below job requirement ${jobMinMatch}%`,
      };
    }

    // If has all must-haves, eligible
    if (match.hasAllMustHaves) {
      console.log("[EligibilityUtils] Eligible!");
      return {
        eligible: true,
        matchPercentage: match.matchPercentage,
        reason: "Has all must-have skills",
      };
    }

    // Missing must-haves
    console.log("[EligibilityUtils] Not eligible - missing must-haves");
    return {
      eligible: false,
      matchPercentage: 0,
      reason: "Missing required must-have skills",
      missingSkills: match.missingMustHaves,
    };
  } catch (error) {
    console.error("[EligibilityUtils] Error checking eligibility:", error);
    throw error;
  }
}

/**
 * Filter resources by eligibility
 * @param {Number} userId
 * @param {Array} resources - Learning resources with job_post_id
 * @param {Object} options - { minMatchPercentage, checkInternships, checkJobs, checkProjects }
 * @returns {Array} - Filtered resources with eligibility info
 */
async function filterResourcesByEligibility(userId, resources, options = {}) {
  console.log(`[EligibilityUtils] Filtering ${resources.length} resources by eligibility`);

  const {
    minMatchPercentage = null,
    checkInternships = true,
    checkJobs = true,
    checkProjects = false, // Optional for projects
  } = options;

  const db = require("../models");
  const { JobPost } = db;

  const eligibleResources = [];

  for (const resource of resources) {
    const shouldCheck =
      (resource.resource_type === "internship" && checkInternships) ||
      (resource.resource_type === "job" && checkJobs) ||
      (resource.resource_type === "project" && checkProjects);

    // Courses are always eligible (no job_post_id)
    if (resource.resource_type === "course") {
      console.log(`[EligibilityUtils] Course "${resource.title}" - Always eligible`);
      eligibleResources.push({
        ...resource.toJSON(),
        eligibility: {
          eligible: true,
          matchPercentage: 100,
          reason: "Courses are available to all",
        },
      });
      continue;
    }

    // If not checking eligibility for this type, include it
    if (!shouldCheck) {
      console.log(
        `[EligibilityUtils] ${resource.resource_type} "${resource.title}" - Not checking eligibility (as per options)`
      );
      eligibleResources.push({
        ...resource.toJSON(),
        eligibility: {
          eligible: true,
          matchPercentage: null,
          reason: "Eligibility check disabled",
        },
      });
      continue;
    }

    // Check eligibility for job/internship/project
    if (!resource.job_post_id) {
      console.log(
        `[EligibilityUtils] ${resource.resource_type} "${resource.title}" - No job_post_id, skipping eligibility check`
      );
      eligibleResources.push({
        ...resource.toJSON(),
        eligibility: {
          eligible: true,
          matchPercentage: null,
          reason: "No associated job post",
        },
      });
      continue;
    }

    // Fetch job post
    const jobPost = await JobPost.findByPk(resource.job_post_id);

    if (!jobPost) {
      console.log(
        `[EligibilityUtils] ${resource.resource_type} "${resource.title}" - Job post not found`
      );
      continue; // Skip this resource
    }

    // Check eligibility
    const eligibility = await checkEligibility(userId, jobPost, minMatchPercentage);

    console.log(
      `[EligibilityUtils] ${resource.resource_type} "${resource.title}" - Eligible: ${eligibility.eligible}, Match: ${eligibility.matchPercentage}%`
    );

    if (eligibility.eligible) {
      eligibleResources.push({
        ...resource.toJSON(),
        eligibility,
      });
    }
  }

  console.log(
    `[EligibilityUtils] Filtered to ${eligibleResources.length} eligible resources`
  );

  return eligibleResources;
}

module.exports = {
  calculateSkillMatch,
  checkEligibility,
  filterResourcesByEligibility,
};