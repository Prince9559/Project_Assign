/**
 * Pathway Generation Service V3
 * Includes eligibility filtering for jobs/internships
 */

const skillGapService = require("./skillGapService");
const resourceService = require("./resourceService");
const preferenceUtils = require("../utils/preferenceUtils");
const pathwayPersistenceService = require("./pathwayPersistenceService");
const eligibilityUtils = require("../utils/eligibilityUtils");
const {
  calculatePersonalizedDuration,
  scorePathway,
  calculateCoveragePercent,
} = require("../utils/pathwayUtils");
const { groupResourcesByType } = require("../utils/resourceUtils");
const pathwayOptimizerService = require("./pathwayOptimizerService");
const { getSkillGapForCompaniesAndRoles } = require("./pathwayGenerationServiceV2");

/**
 * Get top 3 resources of each type (from eligible resources only)
 */
function selectTop3PerType(resources, gapSkillIds) {
  console.log("[PathwayV3] Selecting top 3 resources per type");

  const grouped = groupResourcesByType(resources);
  const gapSet = new Set(gapSkillIds);

  const result = {
    courses: [],
    projects: [],
    internships: [],
    jobs: [], // NEW
  };

  // For each type
  for (const type of ["course", "project", "internship", "job"]) {
    const resourcesOfType = grouped[type] || [];

    console.log(`[PathwayV3] Processing ${resourcesOfType.length} ${type}s`);

    // Score each resource
    const scored = resourcesOfType.map((resource) => {
      const skillsCovered = resource.resourceSkills.filter((rs) =>
        gapSet.has(rs.skill_id)
      );

      return {
        resource,
        skillsCoveredCount: skillsCovered.length,
        skillsCoveredIds: skillsCovered.map((rs) => rs.skill_id),
        duration: parseFloat(resource.total_duration || 0),
        matchPercentage: resource.eligibility?.matchPercentage || null,
      };
    });

    // Sort by: match percentage DESC (for jobs/internships), skill coverage DESC, then duration ASC
    scored.sort((a, b) => {
      // For jobs/internships with match percentage, prioritize higher match
      if (a.matchPercentage !== null && b.matchPercentage !== null) {
        if (Math.abs(a.matchPercentage - b.matchPercentage) > 1) {
          return b.matchPercentage - a.matchPercentage;
        }
      }

      // Then by skill coverage
      if (a.skillsCoveredCount !== b.skillsCoveredCount) {
        return b.skillsCoveredCount - a.skillsCoveredCount;
      }

      // Then by duration
      return a.duration - b.duration;
    });

    // Take top 3
    const top3 = scored.slice(0, 3).filter((s) => s.skillsCoveredCount > 0);

    result[type + "s"] = top3;

    console.log(`[PathwayV3] Selected ${top3.length} ${type}s`);
    top3.forEach((item, idx) => {
      const matchInfo =
        item.matchPercentage !== null ? `, Match: ${item.matchPercentage}%` : "";
      console.log(
        `[PathwayV3]   ${idx + 1}. ${item.resource.title} - ${item.skillsCoveredCount} skills, ${item.duration} days${matchInfo}`
      );
    });
  }

  return result;
}

/**
 * Generate all possible pathway combinations
 */
function generateAllCombinations(top3PerType, gapSkillIds, includeTypes) {
  console.log("[PathwayV3] Generating all possible combinations");
  console.log(`[PathwayV3] Including types: ${includeTypes.join(", ")}`);

  const combinations = [];

  // Get all resources, filtered by includeTypes
  const allResources = [];

  if (includeTypes.includes("course")) {
    allResources.push(...top3PerType.courses);
  }
  if (includeTypes.includes("project")) {
    allResources.push(...top3PerType.projects);
  }
  if (includeTypes.includes("internship")) {
    allResources.push(...top3PerType.internships);
  }
  if (includeTypes.includes("job")) {
    allResources.push(...top3PerType.jobs);
  }

  console.log(`[PathwayV3] Total resources available: ${allResources.length}`);

  // Generate combinations of different sizes
  for (let size = 1; size <= Math.min(6, allResources.length); size++) {
    const combos = getCombinations(allResources, size);
    combinations.push(...combos);
  }

  console.log(`[PathwayV3] Generated ${combinations.length} total combinations`);

  // Calculate metrics for each combination
  const evaluated = combinations.map((combo) => {
    const steps = combo.map((item) => {
      const skillsCovered = item.skillsCoveredIds;

      return {
        resource: item.resource,
        skillsCovered,
        personalizedDuration: calculatePersonalizedDuration(
          item.resource,
          skillsCovered
        ),
      };
    });

    // Calculate total skills covered
    const allCoveredSkills = new Set();
    steps.forEach((step) => {
      step.skillsCovered.forEach((skillId) => allCoveredSkills.add(skillId));
    });

    // Calculate total duration
    const totalDuration = steps.reduce(
      (sum, step) => sum + step.personalizedDuration,
      0
    );

    // Calculate coverage percentage
    const coveragePercent = (allCoveredSkills.size / gapSkillIds.length) * 100;

    // Count resource types
    const composition = {
      courses: steps.filter((s) => s.resource.resource_type === "course").length,
      projects: steps.filter((s) => s.resource.resource_type === "project").length,
      internships: steps.filter((s) => s.resource.resource_type === "internship")
        .length,
      jobs: steps.filter((s) => s.resource.resource_type === "job").length,
    };

    return {
      steps,
      totalDuration,
      totalSkillsCovered: allCoveredSkills.size,
      coveragePercent,
      composition,
    };
  });

  return evaluated;
}

/**
 * Helper: Get combinations (prevent duplicates)
 */
function getCombinations(arr, size) {
  if (size === 1) {
    return arr.map((item) => [item]);
  }

  const result = [];

  for (let i = 0; i <= arr.length - size; i++) {
    const first = arr[i];
    const rest = arr.slice(i + 1);
    const smallerCombos = getCombinations(rest, size - 1);

    smallerCombos.forEach((combo) => {
      // Ensure no duplicate resource_ids
      const resourceIds = [
        first.resource.resource_id,
        ...combo.map((c) => c.resource.resource_id),
      ];
      const uniqueIds = new Set(resourceIds);

      if (uniqueIds.size === resourceIds.length) {
        result.push([first, ...combo]);
      }
    });
  }

  return result;
}

/**
 * Sort and select top 3 pathways
 */
function selectTop3Pathways(pathways, gapSkills, userPreferences) {
  console.log("[PathwayV3] Sorting pathways");

  // Sort by:
  // 1. Coverage (DESC)
  // 2. Duration (ASC)
  const sorted = pathways.sort((a, b) => {
    if (Math.abs(a.coveragePercent - b.coveragePercent) > 0.1) {
      return b.coveragePercent - a.coveragePercent;
    }
    return a.totalDuration - b.totalDuration;
  });

  console.log("[PathwayV3] Top 10 pathways:");
  sorted.slice(0, 10).forEach((p, idx) => {
    console.log(
      `[PathwayV3]   ${idx + 1}. Coverage: ${p.coveragePercent.toFixed(1)}%, Duration: ${p.totalDuration.toFixed(1)} days, Resources: ${p.steps.length}`
    );
  });

  const top3 = sorted.slice(0, 3);

  const scored = top3.map((pathway, index) => ({
    ...pathway,
    strategy:
      index === 0 ? "best_coverage" : index === 1 ? "balanced" : "fastest",
    score: scorePathway(pathway.steps, gapSkills, userPreferences),
  }));

  return scored;
}

/**
 * Main function: Generate pathways V3
 * @param {Number} userId
 * @param {Object} request - {
 *   strategy_type,
 *   target_job_id,
 *   target_company_ids,
 *   target_role_ids,
 *   target_domains,
 *   preferences,
 *   include_types: ['course', 'project', 'internship', 'job'], // NEW
 *   eligibility_options: { // NEW
 *     check_internships: true,
 *     check_jobs: true,
 *     check_projects: false,
 *     min_match_percentage: null
 *   }
 * }
 * @returns {Object}
 */
async function generatePathwaysV3(userId, request) {
  console.log("\n========================================");
  console.log("PATHWAY GENERATION V3 STARTED");
  console.log("========================================");
  console.log(`User ID: ${userId}`);
  console.log(`Strategy: ${request.strategy_type}`);
  console.log(`Request:`, JSON.stringify(request, null, 2));

  try {
    // Step 1: Get user preferences
    console.log("\n--- STEP 1: USER PREFERENCES ---");
    let userPreferences;

    if (request.preferences) {
      userPreferences = await preferenceUtils.updateUserPreferences(
        userId,
        request.preferences
      );
    } else {
      userPreferences = await preferenceUtils.getUserPreferences(userId);
    }

    console.log("User Preferences:");
    console.log(`  Priority: ${userPreferences.resource_priority.join(" > ")}`);
    console.log(`  Max Timeline: ${userPreferences.max_timeline} days`);

    // Step 2: Determine which resource types to include
    console.log("\n--- STEP 2: RESOURCE TYPE SELECTION ---");

    const includeTypes = request.include_types || [
      "course",
      "project",
      "internship",
      "job",
    ];

    console.log(`Including resource types: ${includeTypes.join(", ")}`);

    // Step 3: Calculate skill gap
    console.log("\n--- STEP 3: SKILL GAP ANALYSIS ---");

    let gapResult;

    if (request.strategy_type === "company_role_target") {
      gapResult = await getSkillGapForCompaniesAndRoles(
        userId,
        request.target_company_ids || [],
        request.target_role_ids || []
      );
    } else {
      const targetData = {
        jobPostId: request.target_job_id,
        companyId: request.target_company_id,
        domainIds: request.target_domains,
      };

      gapResult = await skillGapService.getSkillGap(
        userId,
        request.strategy_type,
        targetData
      );
    }

    console.log("Skill Gap Results:");
    console.log(`  Must-Have Gap: ${gapResult.gap.mustHaveGap.length} skills`);
    console.log(`  Preferred Gap: ${gapResult.gap.preferredGap.length} skills`);
    console.log(`  Total Gap: ${gapResult.gap.totalGapCount} skills`);

    if (gapResult.gap.totalGapCount === 0) {
      console.log("\nNo skill gap found!");
      return {
        success: true,
        message: "No skill gap found. You already have all required skills!",
        pathways: [],
        gapAnalysis: gapResult,
      };
    }

    // Step 4: Fetch candidate resources
    console.log("\n--- STEP 4: FETCHING RESOURCES ---");

    const allResources = await resourceService.fetchResourcesForSkills(
      gapResult.gap.allGapSkillIds,
      { maxDays: userPreferences.max_timeline }
    );

    console.log(`Found ${allResources.length} candidate resources`);

    // Filter by include_types
    const filteredByType = allResources.filter((r) =>
      includeTypes.includes(r.resource_type)
    );

    console.log(
      `Filtered to ${filteredByType.length} resources based on include_types`
    );

    if (filteredByType.length === 0) {
      return {
        success: false,
        message: "No learning resources available for selected types",
        pathways: [],
        gapAnalysis: gapResult,
      };
    }

    // Step 5: Filter by eligibility (NEW)
    console.log("\n--- STEP 5: ELIGIBILITY FILTERING ---");

    const eligibilityOptions = request.eligibility_options || {
      check_internships: true,
      check_jobs: true,
      check_projects: false,
      min_match_percentage: null,
    };

    console.log("Eligibility options:", eligibilityOptions);

    const eligibleResources = await eligibilityUtils.filterResourcesByEligibility(
      userId,
      filteredByType,
      eligibilityOptions
    );

    console.log(`Filtered to ${eligibleResources.length} eligible resources`);

    if (eligibleResources.length === 0) {
      return {
        success: false,
        message:
          "No eligible resources found. You may not meet the requirements for available opportunities.",
        pathways: [],
        gapAnalysis: gapResult,
      };
    }

    // Step 6: Select top 3 per type
    console.log("\n--- STEP 6: SELECTING TOP 3 PER TYPE ---");

    const top3PerType = selectTop3PerType(
      eligibleResources,
      gapResult.gap.allGapSkillIds
    );

    const totalSelected =
      top3PerType.courses.length +
      top3PerType.projects.length +
      top3PerType.internships.length +
      top3PerType.jobs.length;

    console.log(`Selected ${totalSelected} total resources (top 3 per type)`);

    if (totalSelected === 0) {
      return {
        success: false,
        message: "No suitable resources found",
        pathways: [],
        gapAnalysis: gapResult,
      };
    }

    // Step 7: Generate all combinations
    console.log("\n--- STEP 7: GENERATING COMBINATIONS ---");

    const allCombinations = generateAllCombinations(
      top3PerType,
      gapResult.gap.allGapSkillIds,
      includeTypes
    );

    console.log(`Generated ${allCombinations.length} combinations`);

    if (allCombinations.length === 0) {
      return {
        success: false,
        message: "Unable to generate pathways with available resources",
        pathways: [],
        gapAnalysis: gapResult,
      };
    }

    // Step 8: Select top 3 pathways
    console.log("\n--- STEP 8: SELECTING TOP 3 PATHWAYS ---");

    const top3Pathways = selectTop3Pathways(
      allCombinations,
gapResult.gap,
userPreferences
);





      console.log(`Selected top 3 pathways`);

// Step 9: Light optimization
console.log("\n--- STEP 9: LIGHT OPTIMIZATION ---");

const optimizedPathways = top3Pathways.map((pathway, index) => {
  console.log(`\nOptimizing pathway ${index + 1}`);

  const optimized = pathwayOptimizerService.removeRedundantResources(
    pathway.steps
  );

  const validation = pathwayOptimizerService.validatePathwayCompleteness(
    optimized,
    gapResult.gap
  );

  console.log(`Pathway ${index + 1} validation:`, validation);

  return {
    ...pathway,
    steps: optimized,
    validation,
    totalDuration: optimized.reduce(
      (sum, s) => sum + s.personalizedDuration,
      0
    ),
  };
});

// Step 10: Save to database
console.log("\n--- STEP 10: SAVING TO DATABASE ---");

await pathwayPersistenceService.deletePathways(userId, {
  strategy_type: request.strategy_type,
  status: "suggested",
});

const savedPathways = await pathwayPersistenceService.savePathways(
  userId,
  optimizedPathways,
  {
    strategy_type: request.strategy_type,
    generation_version: "v3",
    target_job_id: request.target_job_id,
    target_company_id: request.target_company_id,
    target_company_ids: request.target_company_ids,
    target_role_ids: request.target_role_ids,
    target_domains: request.target_domains,
  }
);

console.log(`Saved ${savedPathways.length} pathways`);

// Step 11: Format response
console.log("\n--- STEP 11: FORMATTING RESPONSE ---");

const response = {
  success: true,
  message: `Successfully generated ${savedPathways.length} pathways`,
  user_id: userId,
  strategy_type: request.strategy_type,
  gap_analysis: {
    total_gap: gapResult.gap.totalGapCount,
    must_have_gap: gapResult.gap.mustHaveGap.length,
    preferred_gap: gapResult.gap.preferredGap.length,
    required_skills: gapResult.requiredSkills,
  },
  pathways: savedPathways.map((pathway, index) => ({
    pathway_id: pathway.pathway_id,
    rank: pathway.pathway_rank,
    strategy: optimizedPathways[index].strategy,
    total_duration_days: parseFloat(pathway.total_duration),
    total_duration_weeks: parseFloat((pathway.total_duration / 7).toFixed(1)),
    skills_covered: pathway.total_skills_covered,
    coverage_percent: parseFloat(pathway.skill_coverage_percent),
    score: parseFloat(pathway.pathway_score),
    composition: {
      internships: pathway.total_internships,
      projects: pathway.total_projects,
      courses: pathway.total_courses,
      jobs: optimizedPathways[index].composition.jobs || 0, // NEW
    },
    validation: optimizedPathways[index].validation,
  })),
  preferences: {
    resource_priority: userPreferences.resource_priority,
    max_timeline_days: userPreferences.max_timeline,
  },
  eligibility_info: {
    total_resources_found: allResources.length,
    eligible_resources: eligibleResources.length,
    filtered_by_eligibility:
      allResources.length - eligibleResources.length,
  },
};

console.log("\n========================================");
console.log("PATHWAY GENERATION V3 COMPLETED");
console.log("========================================\n");

return response;

} catch (error) {
console.error("\n========================================");
console.error("PATHWAY GENERATION V3 FAILED");
console.error("========================================");
console.error("Error:", error);
console.error("Stack:", error.stack);
throw error;
}
}
module.exports = {
generatePathwaysV3,
};