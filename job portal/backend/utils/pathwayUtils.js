// /backend/utils/pathwayUtils.js

const pathwayConfig= require("../config/pathwayConfig");

/**
 * Pathway Generation Utility Functions
 * Handles skill gaps, scoring, timeline calculations
 */

/**
 * Calculate skill gap between required and user's current skills
 * @param {Array} requiredSkills - Array of { skill_id, type: 'must_have'/'preferred' }
 * @param {Array} userSkillIds - Array of skill_ids user already has
 * @returns {Object} - { mustHaveGap, preferredGap, allGapSkillIds }
 */
function calculateSkillGap(requiredSkills, userSkillIds) {
  const userSkillSet = new Set(userSkillIds);

  const mustHaveGap = requiredSkills.filter(
    (skill) => skill.type === "must_have" && !userSkillSet.has(skill.skill_id)
  );

  const preferredGap = requiredSkills.filter(
    (skill) => skill.type === "preferred" && !userSkillSet.has(skill.skill_id)
  );

  const allGapSkillIds = [...mustHaveGap, ...preferredGap].map(
    (s) => s.skill_id
  );


  return {
    mustHaveGap,
    preferredGap,
    allGapSkillIds,
    totalGapCount: allGapSkillIds.length,
  };
}


/**
 * Calculate personalized duration for a resource based on skills user needs to learn
 * @param {Object} resource - LearningResource with resourceSkills
 * @param {Array} skillsToLearn - Array of skill_ids user needs to learn from this resource
 * @returns {Number} - Duration in days
 */

function calculatePersonalizedDuration(resource, skillsToLearn) {
  const skillsToLearnSet = new Set(skillsToLearn);

  // For internships/projects: ALWAYS full duration (no granularity allowed)
  if (resource.resource_type === "internship" || resource.resource_type === "project") {
    console.log(`[PathwayUtils] ${resource.resource_type} - Full duration: ${resource.total_duration} days (no granularity)`);
    return parseFloat(resource.total_duration);
  }

  // For courses: Calculate based on skills user needs to learn
  let totalDays = 0;
  let hasGranularDurations = false;
  let skillsWithDuration = 0;
  let skillsWithoutDuration = 0;

  console.log(`[PathwayUtils] Course: ${resource.title}`);
  console.log(`[PathwayUtils]   Total duration: ${resource.total_duration} days`);
  console.log(`[PathwayUtils]   Skills to learn: ${skillsToLearn.length}`);

  for (const resourceSkill of resource.resourceSkills) {
    if (skillsToLearnSet.has(resourceSkill.skill_id)) {
      if (resourceSkill.skill_learning_duration !== null && resourceSkill.skill_learning_duration > 0) {
        totalDays += parseFloat(resourceSkill.skill_learning_duration);
        hasGranularDurations = true;
        skillsWithDuration++;
        console.log(`[PathwayUtils]     Skill ${resourceSkill.skill_id}: ${resourceSkill.skill_learning_duration} days`);
      } else {
        skillsWithoutDuration++;
      }
    }
  }

  console.log(`[PathwayUtils]   Skills with duration: ${skillsWithDuration}, without: ${skillsWithoutDuration}`);

  // If no granular durations OR mixed scenario, use proportional calculation
  if (!hasGranularDurations || skillsWithoutDuration > 0) {
    const totalSkillsInResource = resource.resourceSkills.length;
    const proportionalDuration = (skillsToLearn.length / totalSkillsInResource) * parseFloat(resource.total_duration);
    
    console.log(`[PathwayUtils]   Using proportional: ${proportionalDuration.toFixed(2)} days`);
    return parseFloat(proportionalDuration.toFixed(2));
  }

  // All skills have granular durations
  console.log(`[PathwayUtils]   Using granular total: ${totalDays} days`);
  return totalDays;
}






/**
 * Score a resource based on skill coverage, preferences, efficiency
 * @param {Object} resource - LearningResource with resourceSkills
 * @param {Object} gapSkills - { mustHaveGap, preferredGap, allGapSkillIds }
 * @param {Object} userPreferences - User's pathway preferences
 * @returns {Number} - Score for the resource
 */
function scoreResource(resource, gapSkills, userPreferences) {
  let score = 0;

  // Extract skill IDs from resource
  const resourceSkillIds = resource.resourceSkills.map((rs) => rs.skill_id);

  // 1. Skill coverage (base score)
  const mustHavesCovered = gapSkills.mustHaveGap.filter((gap) =>
    resourceSkillIds.includes(gap.skill_id)
  );

  const preferredCovered = gapSkills.preferredGap.filter((gap) =>
    resourceSkillIds.includes(gap.skill_id)
  );

  const totalSkillsCovered = mustHavesCovered.length + preferredCovered.length;

  // Must-have skills are worth more
  score += mustHavesCovered.length * 30; // 30 points per must-have
  score += preferredCovered.length * 15; // 15 points per preferred

  // 2. Timeline efficiency (skills covered per day)
  if (resource.total_duration > 0) {
    const efficiency = totalSkillsCovered / parseFloat(resource.total_duration);
    score += efficiency * 50; // Efficiency bonus
  }

  // 3. User preference bonus (higher priority = more points)
  const resourcePriority = userPreferences.resource_priority; 
  const priorityIndex = resourcePriority.indexOf(resource.resource_type);

  if (priorityIndex !== -1) {
    // First preference gets 30 points, second gets 20, third gets 10
    const priorityBonus = (resourcePriority.length - priorityIndex) * 10;
    score += priorityBonus;
  }

  // 4. Rating bonus
  if (resource.rating) {
    score += parseFloat(resource.rating) * 5; // Up to 25 points for 5-star rating
  }

  // 5. Difficulty appropriateness (can be enhanced with user skill level later)
  if (resource.difficulty_level === "intermediate") {
    score += 5; // Slight bonus for intermediate (most common level)
  }

  return parseFloat(score.toFixed(2));
}

/**
 * Get skills covered by a resource that match the gap skills
 * @param {Object} resource - LearningResource
 * @param {Array} gapSkillIds - Array of skill_ids needed
 * @returns {Array} - Array of skill_ids this resource covers from the gap
 */

function getSkillsCoveredByResource(resource, gapSkillIds) {
  const gapSet = new Set(gapSkillIds);
  return resource.resourceSkills
    .filter((rs) => gapSet.has(rs.skill_id))
    .map((rs) => rs.skill_id);
}

/**
 * Calculate total timeline for a pathway
 * @param {Array} pathwaySteps - Array of { resource, skillsCovered, personalizedDuration }
 * @returns {Number} - Total duration in days
 */
function calculatePathwayTimeline(pathwaySteps) {
  return pathwaySteps.reduce((total, step) => {
    return total + (step.personalizedDuration || step.resource.total_duration);
  }, 0);
}

/**
 * Check if all must-have skills are covered by pathway
 * @param {Array} pathwaySteps - Pathway steps
 * @param {Array} mustHaveGap - Must-have skills needed
 * @returns {Boolean}
 */
function areAllMustHavesCovered(pathwaySteps, mustHaveGap) {
  const coveredSkills = new Set();

  for (const step of pathwaySteps) {
    step.skillsCovered.forEach((skillId) => coveredSkills.add(skillId));
  }

  return mustHaveGap.every((skill) => coveredSkills.has(skill.skill_id));
}

/**
 * Calculate coverage percentage
 * @param {Array} pathwaySteps - Pathway steps
 * @param {Object} gapSkills - Gap skills object
 * @returns {Number} - Coverage percentage
 */
function calculateCoveragePercent(pathwaySteps, gapSkills) {
  const coveredSkills = new Set();

  for (const step of pathwaySteps) {
    step.skillsCovered.forEach((skillId) => coveredSkills.add(skillId));
  }

  const totalRequired = gapSkills.allGapSkillIds.length;
  if (totalRequired === 0) return 100;

  const covered = gapSkills.allGapSkillIds.filter((id) =>
    coveredSkills.has(id)
  ).length;

  return parseFloat(((covered / totalRequired) * 100).toFixed(2));
}

/**
 * Score a complete pathway
 * @param {Array} pathwaySteps - Pathway steps
 * @param {Object} gapSkills - Gap skills
 * @param {Object} userPreferences - User preferences
 * @returns {Number} - Pathway score
 */
function scorePathway(pathwaySteps, gapSkills, userPreferences) {
  let score = 0;

  // 1. Completeness score (most important)
  const coveragePercent = calculateCoveragePercent(pathwaySteps, gapSkills);
  score += coveragePercent * 2; // Up to 200 points for 100% coverage

  // 2. Must-haves coverage (critical)
  const allMustHavesCovered = areAllMustHavesCovered(
    pathwaySteps,
    gapSkills.mustHaveGap
  );
  if (allMustHavesCovered) {
    score += 100; // Big bonus for covering all must-haves
  }

  // 3. Timeline efficiency
  const totalDays = calculatePathwayTimeline(pathwaySteps);
  const maxDays = userPreferences.max_timeline || pathwayConfig.DEFAULT_MAX_TIMELINE_DAYS; 

  if (totalDays <= maxDays) {
    const timelineScore = ((maxDays - totalDays) / maxDays) * 50;
    score += timelineScore; // Up to 50 points for being under timeline
  } else {
    // Penalty for exceeding timeline
    score -= (totalDays - maxDays) * 0.5;
  }

  // 4. Diversity bonus (variety of resource types)
  const uniqueTypes = new Set(
    pathwaySteps.map((s) => s.resource.resource_type)
  );
  score += uniqueTypes.size * 10; // 10 points per unique type

  // 5. Resource count penalty (prefer fewer resources)
  if (pathwaySteps.length <= 5) {
    score += 20; // Bonus for concise pathways
  } else if (pathwaySteps.length > 8) {
    score -= (pathwaySteps.length - 8) * 5; // Penalty for too many resources
  }

  return parseFloat(score.toFixed(2));
}

/**
 * Convert days to weeks (for display)
 * @param {Number} days
 * @returns {Number}
 */
function daysToWeeks(days) {
  return parseFloat((days / 7).toFixed(1));
}

/**
 * Convert weeks to days
 * @param {Number} weeks
 * @returns {Number}
 */
function weeksToDays(weeks) {
  return Math.ceil(weeks * 7);
}

module.exports = {
  calculateSkillGap,
  calculatePersonalizedDuration,
  scoreResource,
  getSkillsCoveredByResource,
  calculatePathwayTimeline,
  areAllMustHavesCovered,
  calculateCoveragePercent,
  scorePathway,
  daysToWeeks,
  weeksToDays,
};
