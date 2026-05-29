/**
 * Pathway Generation Service V2
 * NEW logic as per client requirements
 */

const skillGapService = require("./skillGapService");
const resourceService = require("./resourceService");
const preferenceUtils = require("../utils/preferenceUtils");
const pathwayPersistenceService = require("./pathwayPersistenceService");
const {
  calculatePersonalizedDuration,
  scorePathway,
  calculateCoveragePercent,
} = require("../utils/pathwayUtils");
const { groupResourcesByType } = require("../utils/resourceUtils");
const pathwayOptimizerService = require("./pathwayOptimizerService");

/**
 * Get top 3 resources of each type covering most skills
 * @param {Array} resources - All available resources
 * @param {Array} gapSkillIds - Skills needed
 * @returns {Object} - { courses: [], projects: [], internships: [] }
 */
function selectTop3PerType(resources, gapSkillIds) {
  console.log("[PathwayV2] Selecting top 3 resources per type");

  const grouped = groupResourcesByType(resources);
  const gapSet = new Set(gapSkillIds);

  const result = {
    courses: [],
    projects: [],
    internships: [],
  };

  // For each type, find top 3 by skill coverage
  for (const type of ["course", "project", "internship"]) {
    const resourcesOfType = grouped[type] || [];

    console.log(`[PathwayV2] Processing ${resourcesOfType.length} ${type}s`);

    // Score each resource by number of gap skills it covers
    const scored = resourcesOfType.map((resource) => {
      const skillsCovered = resource.resourceSkills.filter((rs) =>
        gapSet.has(rs.skill_id)
      );

      return {
        resource,
        skillsCoveredCount: skillsCovered.length,
        skillsCoveredIds: skillsCovered.map((rs) => rs.skill_id),
        duration: parseFloat(resource.total_duration),
      };
    });

    // Sort by: skill coverage DESC, then duration ASC
    scored.sort((a, b) => {
      if (a.skillsCoveredCount !== b.skillsCoveredCount) {
        return b.skillsCoveredCount - a.skillsCoveredCount;
      }
      return a.duration - b.duration;
    });

    // Take top 3
    const top3 = scored.slice(0, 3).filter((s) => s.skillsCoveredCount > 0);

    result[type + "s"] = top3;

    console.log(`[PathwayV2] Selected ${top3.length} ${type}s`);
    top3.forEach((item, idx) => {
      console.log(
        `[PathwayV2]   ${idx + 1}. ${item.resource.title} - ${
          item.skillsCoveredCount
        } skills, ${item.duration} days`
      );
    });
  }

  return result;
}

/**
 * Generate all possible pathway combinations
 * @param {Object} top3PerType - { courses: [], projects: [], internships: [] }
 * @param {Array} gapSkillIds - Skills needed
 * @returns {Array} - Array of pathway combinations
 */
function generateAllCombinations(top3PerType, gapSkillIds) {
  console.log("[PathwayV2] Generating all possible combinations");

  const combinations = [];
  const gapSet = new Set(gapSkillIds);

  // Get all resources in flat array
  const allResources = [
    ...top3PerType.courses,
    ...top3PerType.projects,
    ...top3PerType.internships,
  ];

  console.log(
    `[PathwayV2] Total resources available for combinations: ${allResources.length}`
  );

  // Generate combinations of different sizes (1 to 6 resources per pathway)
  for (let size = 1; size <= Math.min(6, allResources.length); size++) {
    const combos = getCombinations(allResources, size);
    combinations.push(...combos);
  }

  console.log(
    `[PathwayV2] Generated ${combinations.length} total combinations`
  );

  // Calculate metrics for each combination
  const evaluated = combinations.map((combo) => {
    const steps = combo.map((item) => {
      // Calculate which skills this resource covers from remaining gap
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

    // Calculate total skills covered (unique)
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
      courses: steps.filter((s) => s.resource.resource_type === "course")
        .length,
      projects: steps.filter((s) => s.resource.resource_type === "project")
        .length,
      internships: steps.filter(
        (s) => s.resource.resource_type === "internship"
      ).length,
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
 * Helper: Get all combinations of array of given size
 * @param {Array} arr
 * @param {Number} size
 * @returns {Array}
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
      result.push([first, ...combo]);
    });
  }

  return result;
}

/**
 * Sort and select top 3 pathways
 * @param {Array} pathways - All evaluated pathways
 * @param {Object} gapSkills - Gap skills object
 * @param {Object} userPreferences - User preferences
 * @returns {Array} - Top 3 pathways
 */
function selectTop3Pathways(pathways, gapSkills, userPreferences) {
  console.log("[PathwayV2] Sorting pathways");

  // Sort by:
  // 1. Coverage (DESC) - most important
  // 2. Duration (ASC) - secondary
  const sorted = pathways.sort((a, b) => {
    // Primary: Coverage percentage
    if (Math.abs(a.coveragePercent - b.coveragePercent) > 0.1) {
      return b.coveragePercent - a.coveragePercent;
    }

    // Secondary: Duration (shorter is better)
    return a.totalDuration - b.totalDuration;
  });

  console.log("[PathwayV2] Top 10 pathways by coverage and duration:");
  sorted.slice(0, 10).forEach((p, idx) => {
    console.log(
      `[PathwayV2]   ${idx + 1}. Coverage: ${p.coveragePercent.toFixed(
        1
      )}%, Duration: ${p.totalDuration.toFixed(1)} days, Resources: ${
        p.steps.length
      }`
    );
  });

  // Take top 3
  const top3 = sorted.slice(0, 3);

  // Score them for database storage
  const scored = top3.map((pathway, index) => ({
    ...pathway,
    strategy:
      index === 0 ? "best_coverage" : index === 1 ? "balanced" : "fastest",
    score: scorePathway(pathway.steps, gapSkills, userPreferences),
  }));

  return scored;
}

/**
 * Main function: Generate pathways V2
 * @param {Number} userId
 * @param {Object} request - { strategy_type, target_job_id, target_company_ids, target_role_ids, target_domains, preferences }
 * @returns {Object}
 */
async function generatePathwaysV2(userId, request) {
  console.log("\n========================================");
  console.log("PATHWAY GENERATION V2 STARTED");
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

    // Step 2: Calculate skill gap (NEW: supports multiple companies/roles)
    console.log("\n--- STEP 2: SKILL GAP ANALYSIS ---");

    let gapResult;

    if (request.strategy_type === "company_role_target") {
      // NEW STRATEGY: Multiple companies and roles
      gapResult = await getSkillGapForCompaniesAndRoles(
        userId,
        request.target_company_ids || [],
        request.target_role_ids || []
      );
    } else {
      // Existing strategies
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

    // Step 3: Fetch candidate resources
    console.log("\n--- STEP 3: FETCHING RESOURCES ---");

    const resources = await resourceService.fetchResourcesForSkills(
      gapResult.gap.allGapSkillIds,
      { maxDays: userPreferences.max_timeline }
    );

    console.log(`Found ${resources.length} candidate resources`);

    if (resources.length === 0) {
      return {
        success: false,
        message: "No learning resources available for required skills",
        pathways: [],
        gapAnalysis: gapResult,
      };
    }

    // Step 4: Select top 3 per type (NEW LOGIC)
    console.log("\n--- STEP 4: SELECTING TOP 3 PER TYPE ---");

    const top3PerType = selectTop3PerType(
      resources,
      gapResult.gap.allGapSkillIds
    );

    const totalSelected =
      top3PerType.courses.length +
      top3PerType.projects.length +
      top3PerType.internships.length;

    console.log(`Selected ${totalSelected} total resources (top 3 per type)`);

    if (totalSelected === 0) {
      return {
        success: false,
        message: "No suitable resources found",
        pathways: [],
        gapAnalysis: gapResult,
      };
    }

    // Step 5: Generate all combinations (NEW LOGIC)
    console.log("\n--- STEP 5: GENERATING COMBINATIONS ---");

    const allCombinations = generateAllCombinations(
      top3PerType,
      gapResult.gap.allGapSkillIds
    );

    console.log(`Generated ${allCombinations.length} combinations`);

    // Step 6: Select top 3 pathways (NEW LOGIC)
    console.log("\n--- STEP 6: SELECTING TOP 3 PATHWAYS ---");

    const top3Pathways = selectTop3Pathways(
      allCombinations,
      gapResult.gap,
      userPreferences
    );

    console.log(`Selected top 3 pathways`);

    // Step 7: Optimize pathways (light optimization)
    console.log("\n--- STEP 7: LIGHT OPTIMIZATION ---");

    const optimizedPathways = top3Pathways.map((pathway, index) => {
      console.log(`\nOptimizing pathway ${index + 1}`);

      // Only remove redundancy, don't reorder
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

    // Step 8: Save to database
    console.log("\n--- STEP 8: SAVING TO DATABASE ---");

    await pathwayPersistenceService.deletePathways(userId, {
      strategy_type: request.strategy_type,
      status: "suggested",
    });

    const savedPathways = await pathwayPersistenceService.savePathways(
      userId,
      optimizedPathways,
      {
        strategy_type: request.strategy_type,
        target_job_id: request.target_job_id,
        target_company_id: request.target_company_id,
         target_company_ids: request.target_company_ids, 
    target_role_ids: request.target_role_ids,
        target_domains: request.target_domains,
      }
    );

    console.log(`Saved ${savedPathways.length} pathways`);

    // Step 9: Format response (SAME STRUCTURE AS V1)
    console.log("\n--- STEP 9: FORMATTING RESPONSE ---");

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
        total_duration_weeks: parseFloat(
          (pathway.total_duration / 7).toFixed(1)
        ),
        skills_covered: pathway.total_skills_covered,
        coverage_percent: parseFloat(pathway.skill_coverage_percent),
        score: parseFloat(pathway.pathway_score),
        composition: {
          internships: pathway.total_internships,
          projects: pathway.total_projects,
          courses: pathway.total_courses,
        },
        validation: optimizedPathways[index].validation,
      })),
      preferences: {
        resource_priority: userPreferences.resource_priority,
        max_timeline_days: userPreferences.max_timeline,
      },
    };

    console.log("\n========================================");
    console.log("PATHWAY GENERATION V2 COMPLETED");
    console.log("========================================\n");

    return response;
  } catch (error) {
    console.error("\n========================================");
    console.error("PATHWAY GENERATION V2 FAILED");
    console.error("========================================");
    console.error("Error:", error);
    console.error("Stack:", error.stack);

    throw error;
  }
}

/**
 * NEW: Get skill gap for multiple companies and roles
 * @param {Number} userId
 * @param {Array} companyIds - Array of company_recruiter_profile_ids
 * @param {Array} roleIds - Array of job_role_ids
 * @returns {Object}
 */
async function getSkillGapForCompaniesAndRoles(userId, companyIds, roleIds) {
  console.log("[PathwayV2] Getting skill gap for multiple companies and roles");
  console.log(`[PathwayV2] Companies: ${companyIds.join(", ")}`);
  console.log(`[PathwayV2] Roles: ${roleIds.join(", ")}`);

  const db = require("../models");
  const { JobPost, Skill, UserSkill, JobPostSkill, Domain } = db;
  const { calculateSkillGap } = require("../utils/pathwayUtils");

  try {
    // Build where clause
    const where = { active_status: 1 };

    if (companyIds && companyIds.length > 0) {
      where.company_recruiter_profile_id = companyIds;
    }

    if (roleIds && roleIds.length > 0) {
      where.job_role_id = roleIds;
    }

    // Get all matching jobs
    const jobPosts = await JobPost.findAll({
      where,
      include: [
        {
          model: Skill,
          as: "skills",
          through: { attributes: ["type"] },
          include: [{ model: Domain, as: "domain" }],
        },
      ],
    });

    console.log(`[PathwayV2] Found ${jobPosts.length} matching job posts`);

    if (jobPosts.length === 0) {
      throw new Error("No active jobs found for selected companies/roles");
    }

    // Aggregate skills
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

    // Determine type based on frequency
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

    // Get user's skills
    const userSkills = await UserSkill.findAll({
      where: { user_id: userId },
      attributes: ["skill_id"],
    });

    const userSkillIds = userSkills.map((us) => us.skill_id);

    // Calculate gap
    const gap = calculateSkillGap(requiredSkills, userSkillIds);

    return {
      success: true,
      totalJobsAnalyzed: totalJobs,
      companyIds,
      roleIds,
      requiredSkills,
      userSkillIds,
      gap,
    };
  } catch (error) {
    console.error(
      "[PathwayV2] Error in getSkillGapForCompaniesAndRoles:",
      error
    );
    throw error;
  }
}

module.exports = {
  generatePathwaysV2,
  getSkillGapForCompaniesAndRoles,
};
