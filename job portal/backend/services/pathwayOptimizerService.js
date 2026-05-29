/**
 * Pathway Optimizer Service
 * Optimizes pathways by removing redundancy, sequencing, etc.
 */

const { calculatePathwayTimeline } = require("../utils/pathwayUtils");

/**
 * Optimize a pathway
 * @param {Array} pathway - Pathway steps
 * @param {Object} gapSkills - Gap skills
 * @param {Object} userPreferences - User preferences
 * @returns {Array} - Optimized pathway
 */
function optimizePathway(pathway, gapSkills, userPreferences) {
  console.log("[PathwayOptimizer] Starting pathway optimization");
  console.log(
    `[PathwayOptimizer] Initial pathway length: ${pathway.length} steps`
  );

  let optimized = [...pathway];

  // Step 1: Remove redundancy
  console.log("[PathwayOptimizer] Step 1: Removing redundant resources");
  optimized = removeRedundantResources(optimized);
  console.log(
    `[PathwayOptimizer]   After redundancy removal: ${optimized.length} steps`
  );

  // Step 2: Sequence by prerequisites and logical order
  console.log("[PathwayOptimizer] Step 2: Sequencing resources");
  optimized = sequenceResources(optimized);

  // Step 3: Move internships to end (need foundation first)
  console.log("[PathwayOptimizer] Step 3: Moving internships to end");
  optimized = moveInternshipsToEnd(optimized);

  // Step 4: Validate timeline constraint
  console.log("[PathwayOptimizer] Step 4: Validating timeline constraints");
  const totalDuration = calculatePathwayTimeline(optimized);
  const maxDuration = userPreferences.max_timeline || 365;

  console.log(`[PathwayOptimizer]   Total duration: ${totalDuration} days`);
  console.log(`[PathwayOptimizer]   Max allowed: ${maxDuration} days`);

  if (totalDuration > maxDuration) {
    console.log("[PathwayOptimizer]   WARNING: Pathway exceeds max timeline");
    // Could implement trimming logic here if needed
  }

  console.log(
    `[PathwayOptimizer] Optimization complete. Final length: ${optimized.length} steps`
  );

  return optimized;
}

/**
 * Remove redundant resources
 * If two resources cover same skills, keep better one
 * @param {Array} pathway
 * @returns {Array}
 */
function removeRedundantResources(pathway) {
  console.log("[PathwayOptimizer] Checking for redundant resources");

  const result = [];
  const coveredSkills = new Set();

  for (const step of pathway) {
    // Check if this step adds new skills
    const newSkills = step.skillsCovered.filter(
      (skillId) => !coveredSkills.has(skillId)
    );

    if (newSkills.length > 0) {
      // This resource adds value
      result.push(step);
      step.skillsCovered.forEach((skillId) => coveredSkills.add(skillId));

      console.log(
        `[PathwayOptimizer]   Keeping: ${step.resource.title} (adds ${newSkills.length} new skills)`
      );
    } else {
      console.log(
        `[PathwayOptimizer]   Removing redundant: ${step.resource.title}`
      );
    }
  }

  console.log(
    `[PathwayOptimizer] Removed ${
      pathway.length - result.length
    } redundant resources`
  );

  return result;
}

/**
 * Sequence resources in logical order
 * Shorter courses first, then projects, then internships
 * @param {Array} pathway
 * @returns {Array}
 */
function sequenceResources(pathway) {
  console.log("[PathwayOptimizer] Sequencing resources logically");

  const courses = pathway.filter(
    (step) => step.resource.resource_type === "course"
  );
  const projects = pathway.filter(
    (step) => step.resource.resource_type === "project"
  );
  const internships = pathway.filter(
    (step) => step.resource.resource_type === "internship"
  );

  console.log(`[PathwayOptimizer]   Courses: ${courses.length}`);
  console.log(`[PathwayOptimizer]   Projects: ${projects.length}`);
  console.log(`[PathwayOptimizer]   Internships: ${internships.length}`);

  // Sort courses by duration (shorter first)
  courses.sort((a, b) => a.personalizedDuration - b.personalizedDuration);

  // Sort projects by duration
  projects.sort((a, b) => a.personalizedDuration - b.personalizedDuration);

  // Sort internships by duration
  internships.sort((a, b) => a.personalizedDuration - b.personalizedDuration);

  // Combine: courses -> projects -> internships
  const sequenced = [...courses, ...projects, ...internships];

  console.log("[PathwayOptimizer] Resources sequenced successfully");

  return sequenced;
}

/**
 * Move internships to end of pathway
 * @param {Array} pathway
 * @returns {Array}
 */
function moveInternshipsToEnd(pathway) {
  console.log("[PathwayOptimizer] Moving internships to end");

  const nonInternships = pathway.filter(
    (step) => step.resource.resource_type !== "internship"
  );

  const internships = pathway.filter(
    (step) => step.resource.resource_type === "internship"
  );

  console.log(`[PathwayOptimizer]   Non-internships: ${nonInternships.length}`);
  console.log(`[PathwayOptimizer]   Internships: ${internships.length}`);

  return [...nonInternships, ...internships];
}

/**
 * Validate pathway completeness
 * @param {Array} pathway
 * @param {Object} gapSkills
 * @returns {Object} - { isComplete, missingSkills }
 */
function validatePathwayCompleteness(pathway, gapSkills) {
  console.log("[PathwayOptimizer] Validating pathway completeness");

  const coveredSkills = new Set();

  for (const step of pathway) {
    step.skillsCovered.forEach((skillId) => coveredSkills.add(skillId));
  }

  const mustHaveSkillIds = gapSkills.mustHaveGap.map((s) => s.skill_id);
  const missingMustHaves = mustHaveSkillIds.filter(
    (skillId) => !coveredSkills.has(skillId)
  );

  const allGapSkillIds = gapSkills.allGapSkillIds;
  const missingAll = allGapSkillIds.filter(
    (skillId) => !coveredSkills.has(skillId)
  );

  const isComplete = missingMustHaves.length === 0;

  console.log(
    `[PathwayOptimizer]   Total skills covered: ${coveredSkills.size}`
  );
  console.log(
    `[PathwayOptimizer]   Missing must-haves: ${missingMustHaves.length}`
  );
  console.log(`[PathwayOptimizer]   Missing overall: ${missingAll.length}`);
  console.log(`[PathwayOptimizer]   Pathway is complete: ${isComplete}`);

  return {
    isComplete,
    missingMustHaves,
    missingAll,
    coveredCount: coveredSkills.size,
  };
}

module.exports = {
  optimizePathway,
  removeRedundantResources,
  sequenceResources,
  moveInternshipsToEnd,
  validatePathwayCompleteness,
};
