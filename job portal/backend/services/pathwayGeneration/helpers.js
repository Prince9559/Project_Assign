// services/pathwayGeneration/helpers.js

const crypto = require("crypto");

/**
 * Calculate total experience for a user across all skills
 */
function calculateUserTotalExperience(userSkills) {
  if (!userSkills || userSkills.length === 0) return 0;

  // Sum all experience_months
  const total = userSkills.reduce((sum, skill) => {
    return sum + (skill.experience_months || 0);
  }, 0);

  return total;
}

/**
 * Aggregate user skills by skill_id (SUM experience from multiple sources)
 */
function aggregateUserSkills(userSkills) {
  const skillMap = {};

  userSkills.forEach((us) => {
    const skillId = us.skill_id;
    const expMonths = us.experience_months || 0;

    if (!skillMap[skillId]) {
      skillMap[skillId] = {
        skill_id: skillId,
        skill_name: us.Skill?.skill_name || us.skill || "Unknown",
        total_experience_months: 0,
      };
    }

    skillMap[skillId].total_experience_months += expMonths;
  });

  return Object.values(skillMap);
}

/**
 * Determine experience bucket for eligibility rules
 */
function getExperienceBucket(totalExperienceMonths) {
  if (totalExperienceMonths <= 6) return "0-6";
  if (totalExperienceMonths <= 12) return "6-12";
  if (totalExperienceMonths <= 18) return "12-18";
  return "18+";
}

/**
 * Generate unique hash for a state (skill profile)
 */
function generateStateHash(skillsObj) {
  const sorted = Object.keys(skillsObj)
    .sort()
    .map((k) => `${k}:${skillsObj[k]}`)
    .join("|");
  return crypto.createHash("md5").update(sorted).digest("hex");
}

/**
 * Check if state satisfies target requirements
 */
function stateSatisfiesTarget(state, targetRequirements) {
  const { must_have_skills, preferred_skills } = targetRequirements;

  // Check all must-have skills
  for (const req of must_have_skills) {
    const userExp = state.skills[req.skill_id] || 0;
    if (userExp < req.min_experience_months) {
      return false; // Must-have not satisfied
    }
  }

   // ALSO check ALL preferred skills (we want user fully ready)
  for (const req of preferred_skills) {
    const userExp = state.skills[req.skill_id] || 0;
    if (userExp < req.min_experience_months) {
      return false; // Preferred not satisfied
    }
  }

  // Optionally check preferred (for 100% coverage goal)
  // For now, just checking must-haves is enough to consider it a "goal state"
  return true;
}

/**
 * Calculate skill coverage percentage
 */
function calculateSkillCoverage(state, targetRequirements) {
  const { must_have_skills, preferred_skills } = targetRequirements;

  let mustHaveSatisfied = 0;
  let preferredSatisfied = 0;

  must_have_skills.forEach((req) => {
    const userExp = state.skills[req.skill_id] || 0;
    if (userExp >= req.min_experience_months) {
      mustHaveSatisfied++;
    }
  });

  preferred_skills.forEach((req) => {
    const userExp = state.skills[req.skill_id] || 0;
    if (userExp >= req.min_experience_months) {
      preferredSatisfied++;
    }
  });

  const mustHaveCoverage =
    must_have_skills.length > 0
      ? (mustHaveSatisfied / must_have_skills.length) * 100
      : 100;

  const preferredCoverage =
    preferred_skills.length > 0
      ? (preferredSatisfied / preferred_skills.length) * 100
      : 100;

  // Weighted overall coverage
  const overallCoverage = mustHaveCoverage * 0.7 + preferredCoverage * 0.3;

  return {
    must_have_coverage: mustHaveCoverage,
    preferred_coverage: preferredCoverage,
    overall_coverage: overallCoverage,
  };
}

/**
 * Deep clone an object
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

module.exports = {
  calculateUserTotalExperience,
  aggregateUserSkills,
  getExperienceBucket,
  generateStateHash,
  stateSatisfiesTarget,
  calculateSkillCoverage,
  deepClone,
};
