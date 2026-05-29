// utils/predictionUtils.js
const calculateSkillGap = (userSkillsSet, requiredSkills) => {
  const missing = requiredSkills.filter((s) => !userSkillsSet.has(s.skill_id));
  const mastered = requiredSkills.filter((s) => userSkillsSet.has(s.skill_id));
  const matchPercentage = requiredSkills.length
    ? Math.round((mastered.length / requiredSkills.length) * 100)
    : 0;

  return {
    mastered,
    missing,
    match_percentage: matchPercentage,
    total_required: requiredSkills.length,
    mastered_count: mastered.length,
    missing_count: missing.length,
  };
};
