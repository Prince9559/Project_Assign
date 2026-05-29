// services/pathwayGeneration/skillAnalyzer.js

const { aggregateUserSkills, calculateSkillCoverage } = require("./helpers");

/**
 * Analyze skill gaps between user's current skills and target requirements
 */
async function analyzeSkillGap(userSkills, targetRequirements) {
  const { must_have_skills, preferred_skills } = targetRequirements;

  // Aggregate user's skills (SUM experience across multiple entries)
  const aggregatedSkills = aggregateUserSkills(userSkills);

  // Create a map for quick lookup
  const userSkillMap = {};
  aggregatedSkills.forEach((skill) => {
    userSkillMap[skill.skill_id] = skill.total_experience_months;
  });

  // Analyze must-have skills
  const missingMustHave = [];
  const insufficientExpMustHave = [];
  const satisfiedMustHave = [];

  must_have_skills.forEach((req) => {
    const userExp = userSkillMap[req.skill_id] || 0;

    if (userExp === 0) {
      missingMustHave.push({
        skill_id: req.skill_id,
        skill_name: req.skill_name,
        required_experience_months: req.min_experience_months,
        current_experience_months: 0,
        gap_months: req.min_experience_months,
      });
    } else if (userExp < req.min_experience_months) {
      insufficientExpMustHave.push({
        skill_id: req.skill_id,
        skill_name: req.skill_name,
        required_experience_months: req.min_experience_months,
        current_experience_months: userExp,
        gap_months: req.min_experience_months - userExp,
      });
    } else {
      satisfiedMustHave.push({
        skill_id: req.skill_id,
        skill_name: req.skill_name,
        required_experience_months: req.min_experience_months,
        current_experience_months: userExp,
      });
    }
  });

  // Analyze preferred skills
  const missingPreferred = [];
  const insufficientExpPreferred = [];
  const satisfiedPreferred = [];

  preferred_skills.forEach((req) => {
    const userExp = userSkillMap[req.skill_id] || 0;

    if (userExp === 0) {
      missingPreferred.push({
        skill_id: req.skill_id,
        skill_name: req.skill_name,
        required_experience_months: req.min_experience_months,
        current_experience_months: 0,
        gap_months: req.min_experience_months,
      });
    } else if (userExp < req.min_experience_months) {
      insufficientExpPreferred.push({
        skill_id: req.skill_id,
        skill_name: req.skill_name,
        required_experience_months: req.min_experience_months,
        current_experience_months: userExp,
        gap_months: req.min_experience_months - userExp,
      });
    } else {
      satisfiedPreferred.push({
        skill_id: req.skill_id,
        skill_name: req.skill_name,
        required_experience_months: req.min_experience_months,
        current_experience_months: userExp,
      });
    }
  });

  // Calculate coverage
  const currentState = {
    skills: userSkillMap,
  };

  const coverage = calculateSkillCoverage(currentState, targetRequirements);

  return {
    must_have: {
      missing: missingMustHave,
      insufficient_experience: insufficientExpMustHave,
      satisfied: satisfiedMustHave,
    },
    preferred: {
      missing: missingPreferred,
      insufficient_experience: insufficientExpPreferred,
      satisfied: satisfiedPreferred,
    },
    coverage,
    user_skill_map: userSkillMap,
  };
}

module.exports = {
  analyzeSkillGap,
};
