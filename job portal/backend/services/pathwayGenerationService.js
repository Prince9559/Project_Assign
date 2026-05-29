
/**
 * Main Pathway Generation Service
 * Orchestrates the entire pathway generation process
 */

const skillGapService = require("./skillGapService");
const resourceService = require("./resourceService");
const preferenceUtils = require("../utils/preferenceUtils");
const pathwayBuilderService = require("./pathwayBuilderService");
const pathwayOptimizerService = require("./pathwayOptimizerService");
const pathwayPersistenceService = require("./pathwayPersistenceService");
const { scorePathway, calculateCoveragePercent } = require("../utils/pathwayUtils");

/**
 * Generate pathways for a user
 * Main entry point for pathway generation
 * @param {Number} userId
 * @param {Object} request - { strategy_type, target_job_id, target_company_id, target_domains, preferences }
 * @returns {Object} - Generated pathways
 */
async function generatePathways(userId, request) {
  console.log("========================================");
  console.log("PATHWAY GENERATION STARTED");
  console.log("========================================");
  console.log(`User ID: ${userId}`);
  console.log(`Strategy: ${request.strategy_type}`);
  console.log(`Request:`, JSON.stringify(request, null, 2));

  try {
    // Step 1: Get/Update user preferences
    console.log("\n--- STEP 1: USER PREFERENCES ---");
    let userPreferences;

    if (request.preferences) {
      console.log("Updating user preferences with provided data");
      userPreferences = await preferenceUtils.updateUserPreferences(
        userId,
        request.preferences
      );
    } else {
      console.log("Loading existing user preferences");
      userPreferences = await preferenceUtils.getUserPreferences(userId);
    }

    console.log("User Preferences:");
    console.log(`  Priority: ${userPreferences.resource_priority.join(" > ")}`);
    console.log(`  Max Timeline: ${userPreferences.max_timeline} days`);
    console.log(`  Min Timeline: ${userPreferences.min_timeline} days`);

    // Step 2: Calculate skill gap
    console.log("\n--- STEP 2: SKILL GAP ANALYSIS ---");

    const targetData = {
      jobPostId: request.target_job_id,
      companyId: request.target_company_id,
      domainIds: request.target_domains,
    };

    const gapResult = await skillGapService.getSkillGap(
      userId,
      request.strategy_type,
      targetData
    );

    console.log("Skill Gap Results:");
    console.log(`  Must-Have Gap: ${gapResult.gap.mustHaveGap.length} skills`);
    console.log(`  Preferred Gap: ${gapResult.gap.preferredGap.length} skills`);
    console.log(`  Total Gap: ${gapResult.gap.totalGapCount} skills`);

    if (gapResult.gap.totalGapCount === 0) {
      console.log("\nNo skill gap found. User already has all required skills!");
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
      {
        maxDays: userPreferences.max_timeline,
      }
    );

    console.log(`Found ${resources.length} candidate resources`);

    if (resources.length === 0) {
      console.log("\nNo resources available to cover required skills!");
      return {
        success: false,
        message: "No learning resources available for required skills",
        pathways: [],
        gapAnalysis: gapResult,
      };
    }

    // Step 4: Score resources
    console.log("\n--- STEP 4: SCORING RESOURCES ---");

    const scoredResources = resourceService.scoreAndRankResources(
      resources,
      gapResult.gap,
      userPreferences
    );

    console.log(`Scored and ranked ${scoredResources.length} resources`);
    console.log(`Top resource: ${scoredResources[0].title} (score: ${scoredResources[0].calculatedScore.toFixed(2)})`);

    // Step 5: Build 3 different pathways
    console.log("\n--- STEP 5: BUILDING PATHWAYS ---");

    const rawPathways = [];

    console.log("\nBuilding Pathway 1: Preference-Heavy");
    const pathway1 = pathwayBuilderService.buildPreferenceHeavyPathway(
      scoredResources,
      gapResult.gap,
      userPreferences
    );
    rawPathways.push({ strategy: "preference_heavy", steps: pathway1 });

    console.log("\nBuilding Pathway 2: Fastest Timeline");
    const pathway2 = pathwayBuilderService.buildFastestPathway(
      scoredResources,
      gapResult.gap,
      userPreferences
    );
    rawPathways.push({ strategy: "fastest", steps: pathway2 });

    console.log("\nBuilding Pathway 3: Balanced");
    const pathway3 = pathwayBuilderService.buildBalancedPathway(
      scoredResources,
      gapResult.gap,
      userPreferences
    );
    rawPathways.push({ strategy: "balanced", steps: pathway3 });

    // Step 6: Optimize pathways
    console.log("\n--- STEP 6: OPTIMIZING PATHWAYS ---");

    const optimizedPathways = [];

    for (let i = 0; i < rawPathways.length; i++) {
      console.log(`\nOptimizing Pathway ${i + 1} (${rawPathways[i].strategy})`);

      const optimized = pathwayOptimizerService.optimizePathway(
        rawPathways[i].steps,
        gapResult.gap,
        userPreferences
      );

      // Validate completeness
      const validation = pathwayOptimizerService.validatePathwayCompleteness(
        optimized,
        gapResult.gap
      );

      console.log(`Pathway ${i + 1} validation:`, validation);

      // Calculate metrics
      const coveragePercent = calculateCoveragePercent(optimized, gapResult.gap);
      const score = scorePathway(optimized, gapResult.gap, userPreferences);

      optimizedPathways.push({
        strategy: rawPathways[i].strategy,
        steps: optimized,
        validation,
        coveragePercent,
        score,
      });

      console.log(`Pathway ${i + 1} - Coverage: ${coveragePercent.toFixed(2)}%, Score: ${score.toFixed(2)}`);
    }

    // Step 7: Rank pathways
    console.log("\n--- STEP 7: RANKING PATHWAYS ---");

    optimizedPathways.sort((a, b) => b.score - a.score);

    optimizedPathways.forEach((pathway, index) => {
      console.log(`Rank ${index + 1}: ${pathway.strategy} - Score: ${pathway.score.toFixed(2)}`);
    });

    // Step 8: Save to database
    console.log("\n--- STEP 8: SAVING TO DATABASE ---");

    // Delete old suggested pathways for this strategy
    await pathwayPersistenceService.deletePathways(userId, {
      strategy_type: request.strategy_type,
      status: "suggested",
    });

    console.log("Deleted old suggested pathways");

    const savedPathways = await pathwayPersistenceService.savePathways(
      userId,
      optimizedPathways,
      {
        strategy_type: request.strategy_type,
        target_job_id: request.target_job_id,
        target_company_id: request.target_company_id,
        target_domains: request.target_domains,
      }
    );

    console.log(`Saved ${savedPathways.length} pathways to database`);

    // Step 9: Format response
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
        total_duration_weeks: parseFloat((pathway.total_duration / 7).toFixed(1)),
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
    console.log("PATHWAY GENERATION COMPLETED");
    console.log("========================================\n");

    return response;
  } catch (error) {
    console.error("\n========================================");
    console.error("PATHWAY GENERATION FAILED");
    console.error("========================================");
    console.error("Error:", error);
    console.error("Stack:", error.stack);

    throw error;
  }
}

/**
 * Get pathway details with all steps
 * @param {Number} pathwayId
 * @returns {Object}
 */
async function getPathwayDetails(pathwayId) {
  console.log(`[PathwayGeneration] Getting details for pathway ${pathwayId}`);

  try {
    const pathway = await pathwayPersistenceService.getPathwayById(pathwayId);

    if (!pathway) {
      console.log(`[PathwayGeneration] Pathway ${pathwayId} not found`);
      return null;
    }



    // Format response
    const response = {
      pathway_id: pathway.pathway_id,
      user_id: pathway.user_id,
      strategy_type: pathway.strategy_type,
      rank: pathway.pathway_rank,
      status: pathway.status,
      total_duration_days: parseFloat(pathway.total_duration),
      total_duration_weeks: parseFloat((pathway.total_duration / 7).toFixed(1)),
      skills_covered: pathway.total_skills_covered,
      coverage_percent: parseFloat(pathway.skill_coverage_percent),
      score: parseFloat(pathway.pathway_score),
      composition: {
        internships: pathway.total_internships,
        projects: pathway.total_projects,
        courses: pathway.total_courses,
      },
      steps: pathway.steps.map((step) => ({
        step_id: step.step_id,
        step_order: step.step_order,
        resource: {
          resource_id: step.resource.resource_id,
          type: step.resource.resource_type,
          title: step.resource.title,
          description: step.resource.description,
          difficulty: step.resource.difficulty_level,
          total_duration_days: parseFloat(step.resource.total_duration),
          rating: step.resource.rating ? parseFloat(step.resource.rating) : null,
        },
        skills_to_learn: step.skills_to_learn,
        expected_duration_days: parseFloat(step.expected_duration),
        expected_duration_weeks: parseFloat((step.expected_duration / 7).toFixed(1)),
        status: step.status,
        completion_percentage: parseFloat(step.completion_percentage),
      })),
      created_at: pathway.created_at,
      selected_at: pathway.selected_at,
      started_at: pathway.started_at,
      completed_at: pathway.completed_at,
    };

    console.log(`[PathwayGeneration] Retrieved pathway with ${response.steps.length} steps`);

    return response;
  } catch (error) {
    console.error("[PathwayGeneration] Failed to get pathway details:", error);
    throw error;
  }
}



/**
 * Generate pathways from skill array (for testing)
 * Useful for quick testing without full strategy setup
 * @param {Number} userId
 * @param {Array} skillIds - Array of skill IDs to learn
 * @param {Object} options - { preferences?, maxPathways? }
 * @returns {Object}
 */
async function generatePathwaysFromSkills(userId, skillIds, options = {}) {
  console.log("\n========================================");
  console.log("PATHWAY GENERATION FROM SKILLS (Testing Mode)");
  console.log("========================================");
  console.log(`User ID: ${userId}`);
  console.log(`Skills to learn: ${skillIds.length}`);
  console.log(`Skills: ${skillIds.join(", ")}`);

  try {
    // Step 1: Get user preferences
    console.log("\n--- STEP 1: USER PREFERENCES ---");
    let userPreferences;

    if (options.preferences) {
      userPreferences = await preferenceUtils.updateUserPreferences(userId, options.preferences);
    } else {
      userPreferences = await preferenceUtils.getUserPreferences(userId);
    }

    console.log("User Preferences:");
    console.log(`  Priority: ${userPreferences.resource_priority.join(" > ")}`);
    console.log(`  Max Timeline: ${userPreferences.max_timeline} days`);

    // Step 2: Get user's current skills
    console.log("\n--- STEP 2: USER CURRENT SKILLS ---");
    const { UserSkill } = require("../models");
    const userSkills = await UserSkill.findAll({
      where: { user_id: userId },
      attributes: ["skill_id"],
    });

    const userSkillIds = userSkills.map((us) => us.skill_id);
    console.log(`User has ${userSkillIds.length} skills`);

    // Step 3: Create gap object
    console.log("\n--- STEP 3: CREATING SKILL GAP ---");
    const gapSkills = {
      mustHaveGap: skillIds
        .filter((id) => !userSkillIds.includes(id))
        .map((id) => ({ skill_id: id, type: "must_have" })),
      preferredGap: [],
      allGapSkillIds: skillIds.filter((id) => !userSkillIds.includes(id)),
    };

    console.log(`Gap: ${gapSkills.allGapSkillIds.length} skills`);

    if (gapSkills.allGapSkillIds.length === 0) {
      console.log("User already has all specified skills!");
      return {
        success: true,
        message: "You already have all specified skills!",
        pathways: [],
      };
    }

    // Step 4: Fetch resources
    console.log("\n--- STEP 4: FETCHING RESOURCES ---");
    const resources = await resourceService.fetchResourcesForSkills(
      gapSkills.allGapSkillIds,
      { maxDays: userPreferences.max_timeline }
    );

    console.log(`Found ${resources.length} candidate resources`);

    if (resources.length === 0) {
      return {
        success: false,
        message: "No resources available for these skills",
        pathways: [],
      };
    }

    // Step 5: Score resources
    console.log("\n--- STEP 5: SCORING RESOURCES ---");
    const scoredResources = resourceService.scoreAndRankResources(
      resources,
      gapSkills,
      userPreferences
    );

    // Step 6: Build pathways
    console.log("\n--- STEP 6: BUILDING PATHWAYS ---");
    const rawPathways = [];

    const pathway1 = pathwayBuilderService.buildPreferenceHeavyPathway(
      scoredResources,
      gapSkills,
      userPreferences
    );
    rawPathways.push({ strategy: "preference_heavy", steps: pathway1 });

    const pathway2 = pathwayBuilderService.buildFastestPathway(
      scoredResources,
      gapSkills,
      userPreferences
    );
    rawPathways.push({ strategy: "fastest", steps: pathway2 });

    const pathway3 = pathwayBuilderService.buildBalancedPathway(
      scoredResources,
      gapSkills,
      userPreferences
    );
    rawPathways.push({ strategy: "balanced", steps: pathway3 });

    // Step 7: Optimize pathways
    console.log("\n--- STEP 7: OPTIMIZING PATHWAYS ---");
    const optimizedPathways = [];

    for (let i = 0; i < rawPathways.length; i++) {
      const optimized = pathwayOptimizerService.optimizePathway(
        rawPathways[i].steps,
        gapSkills,
        userPreferences
      );

      const validation = pathwayOptimizerService.validatePathwayCompleteness(
        optimized,
        gapSkills
      );

      const coveragePercent = calculateCoveragePercent(optimized, gapSkills);
      const score = scorePathway(optimized, gapSkills, userPreferences);

      optimizedPathways.push({
        strategy: rawPathways[i].strategy,
        steps: optimized,
        validation,
        coveragePercent,
        score,
      });
    }

    // Step 8: Rank pathways
    optimizedPathways.sort((a, b) => b.score - a.score);

    // Step 9: Format response (don't save to DB in testing mode)
    const response = {
      success: true,
      message: "Pathways generated (testing mode - not saved)",
      user_id: userId,
      gap_analysis: {
        total_gap: gapSkills.allGapSkillIds.length,
        skills_to_learn: gapSkills.allGapSkillIds,
      },
      pathways: optimizedPathways.map((pathway, index) => ({
        rank: index + 1,
        strategy: pathway.strategy,
        total_duration_days: pathway.steps.reduce((sum, s) => sum + s.personalizedDuration, 0),
        total_duration_weeks: parseFloat(
          (pathway.steps.reduce((sum, s) => sum + s.personalizedDuration, 0) / 7).toFixed(1)
        ),
        skills_covered: pathway.validation.coveredCount,
        coverage_percent: pathway.coveragePercent,
        score: pathway.score,
        resource_count: pathway.steps.length,
        composition: {
          internships: pathway.steps.filter((s) => s.resource.resource_type === "internship")
            .length,
          projects: pathway.steps.filter((s) => s.resource.resource_type === "project").length,
          courses: pathway.steps.filter((s) => s.resource.resource_type === "course").length,
        },
        steps: pathway.steps.map((step, idx) => ({
          step_order: idx + 1,
          resource_id: step.resource.resource_id,
          resource_type: step.resource.resource_type,
          title: step.resource.title,
          skills_covered: step.skillsCovered.length,
          duration_days: step.personalizedDuration,
          duration_weeks: parseFloat((step.personalizedDuration / 7).toFixed(1)),
        })),
        validation: pathway.validation,
      })),
    };

    console.log("\n========================================");
    console.log("PATHWAY GENERATION COMPLETED (Testing Mode)");
    console.log("========================================\n");

    return response;
  } catch (error) {
    console.error("Error in generatePathwaysFromSkills:", error);
    throw error;
  }
}

// Export the new function
module.exports = {
  generatePathways,
  getPathwayDetails,
  generatePathwaysFromSkills, // NEW
};


``







