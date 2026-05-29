/**
 * Testing Console for Pathway Generation System
 * Interactive CLI for testing utilities and services
 */

const readline = require("readline");
const db = require("../models");
const skillGapService = require("../services/skillGapService");
const resourceService = require("../services/resourceService");
const preferenceUtils = require("../utils/preferenceUtils");
const pathwayUtils = require("../utils/pathwayUtils");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Color codes for console
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  red: "\x1b[31m",
};

function log(message, color = "reset") {
  console.log(colors[color] + message + colors.reset);
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(colors.cyan + prompt + colors.reset, (answer) => {
      resolve(answer);
    });
  });
}

// Main menu
async function showMainMenu() {
  log("\n========================================", "bright");
  log("   PATHWAY GENERATION TEST CONSOLE", "bright");
  log("========================================\n", "bright");

  log("1. Test Skill Gap Service", "green");
  log("2. Test Resource Service", "green");
  log("3. Test Preference Utils", "green");
  log("4. Test Pathway Utils (Scoring)", "green");
  log("5. View Database Statistics", "green");
  log("6. Quick End-to-End Test", "green");
  log("7. FULL PATHWAY GENERATION", "bright");
  log("8. Generate from Skill IDs (TESTING)", "bright"); // NEW
  log("0. Exit\n", "red");

  const choice = await question("Select an option: ");
  return choice;
}

// Test Skill Gap Service
async function testSkillGapService() {
  log("\n--- Test Skill Gap Service ---\n", "yellow");

  const strategyChoice = await question(
    "Strategy (1=job_specific, 2=company_target, 3=direct_upskilling): "
  );

  const userId = parseInt(await question("Enter User ID: "));

  let targetData = {};
  let strategyType;

  switch (strategyChoice) {
    case "1":
      strategyType = "job_specific";
      targetData.jobPostId = parseInt(await question("Enter Job Post ID: "));
      break;
    case "2":
      strategyType = "company_target";
      targetData.companyId = parseInt(
        await question("Enter Company Recruiter Profile ID: ")
      );
      break;
    case "3":
      strategyType = "direct_upskilling";
      const domainIdsStr = await question("Enter Domain IDs (comma-separated): ");
      targetData.domainIds = domainIdsStr.split(",").map((id) => parseInt(id.trim()));
      break;
    default:
      log("Invalid choice", "red");
      return;
  }

  try {
    log("\n⏳ Calculating skill gap...\n", "yellow");

    const result = await skillGapService.getSkillGap(userId, strategyType, targetData);

    log(" Skill Gap Analysis Complete!\n", "green");

    log(` Required Skills: ${result.requiredSkills.length}`, "blue");
    log(` User Has: ${result.userSkillIds.length} skills`, "blue");
    log(` Must-Have Gap: ${result.gap.mustHaveGap.length} skills`, "red");
    log(`  Preferred Gap: ${result.gap.preferredGap.length} skills`, "yellow");
    log(` Total Gap: ${result.gap.totalGapCount} skills\n`, "cyan");

    if (result.gap.mustHaveGap.length > 0) {
      log("Must-Have Skills Needed:", "red");
      result.gap.mustHaveGap.forEach((skill) => {
        log(`  - ${skill.skill_name} (${skill.domain_name})`, "reset");
      });
    }

    if (result.gap.preferredGap.length > 0) {
      log("\nPreferred Skills Needed:", "yellow");
      result.gap.preferredGap.forEach((skill) => {
        log(`  - ${skill.skill_name} (${skill.domain_name})`, "reset");
      });
    }
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, "red");
    console.error(error);
  }
}

// Test Resource Service
async function testResourceService() {
  log("\n--- Test Resource Service ---\n", "yellow");

  const testChoice = await question(
    "Test (1=Fetch by skills, 2=Get by type, 3=Search, 4=Statistics): "
  );

  try {
    switch (testChoice) {
      case "1":
        const skillIdsStr = await question("Enter Skill IDs (comma-separated): ");
        const skillIds = skillIdsStr.split(",").map((id) => parseInt(id.trim()));

        const maxDays = await question("Max duration in days (or press Enter for no limit): ");
        const constraints = maxDays ? { maxDays: parseInt(maxDays) } : {};

        log("\n⏳ Fetching resources...\n", "yellow");

        const resources = await resourceService.fetchResourcesForSkills(
          skillIds,
          constraints
        );

        log(` Found ${resources.length} resources\n`, "green");

        resources.forEach((resource, index) => {
          log(`${index + 1}. ${resource.title}`, "bright");
          log(`   Type: ${resource.resource_type} | Duration: ${resource.total_duration} days`, "cyan");
          log(`   Skills: ${resource.resourceSkills.length}`, "blue");
        });
        break;

      case "2":
        const type = await question("Resource type (course/project/internship): ");
        const resourcesByType = await resourceService.getResourcesByType(type);

        log(`\n Found ${resourcesByType.length} ${type}s\n`, "green");

        resourcesByType.slice(0, 10).forEach((resource, index) => {
          log(`${index + 1}. ${resource.title}`, "bright");
          log(`   Duration: ${resource.total_duration} days | Skills: ${resource.resourceSkills.length}`, "cyan");
        });
        break;

      case "3":
        const searchQuery = await question("Search query: ");
        const searchResults = await resourceService.searchResources(searchQuery);

        log(`\n Found ${searchResults.length} results\n`, "green");

        searchResults.forEach((resource, index) => {
          log(`${index + 1}. ${resource.title}`, "bright");
          log(`   ${resource.description?.substring(0, 100)}...`, "reset");
        });
        break;

      case "4":
        const stats = await resourceService.getResourceStatistics();

        log("\n Resource Statistics\n", "green");
        log(`Total Resources: ${stats.total}`, "bright");

        Object.entries(stats.by_type).forEach(([type, data]) => {
          log(`\n${type.toUpperCase()}:`, "yellow");
          log(`  Count: ${data.count}`, "cyan");
          log(`  Avg Duration: ${data.avg_duration_days} days`, "cyan");
        });
        break;

      default:
        log("Invalid choice", "red");
    }
  } catch (error) {
    log(`\n Error: ${error.message}`, "red");
    console.error(error);
  }
}

// Test Preference Utils
async function testPreferenceUtils() {
  log("\n--- Test Preference Utils ---\n", "yellow");

  const userId = parseInt(await question("Enter User ID: "));

  try {
    log("\n⏳ Fetching user preferences...\n", "yellow");

    const prefs = await preferenceUtils.getUserPreferences(userId);

    log(" User Preferences:\n", "green");
    log(`Resource Priority: ${JSON.stringify(prefs.resource_priority)}`, "cyan");
    log(`Max Timeline: ${prefs.max_timeline} days (${(prefs.max_timeline / 7).toFixed(1)} weeks)`, "cyan");
    log(`Min Timeline: ${prefs.min_timeline} days (${(prefs.min_timeline / 7).toFixed(1)} weeks)\n`, "cyan");

    const update = await question("Update preferences? (y/n): ");

    if (update.toLowerCase() === "y") {
      const priorityStr = await question(
        "New resource priority (e.g., internship,project,course): "
      );
      const maxDays = await question("New max timeline (days): ");

      const updates = {
        resource_priority: priorityStr.split(",").map((s) => s.trim()),
        max_timeline: parseInt(maxDays),
      };

      const validation = preferenceUtils.validatePreferences(updates);

      if (!validation.valid) {
        log("\n Validation errors:", "red");
        validation.errors.forEach((err) => log(`  - ${err}`, "red"));
        return;
      }

      const updated = await preferenceUtils.updateUserPreferences(userId, updates);
      log("\n Preferences updated successfully!", "green");
      log(`New Priority: ${JSON.stringify(updated.resource_priority)}`, "cyan");
      log(`New Max Timeline: ${updated.max_timeline} days`, "cyan");
    }
  } catch (error) {
    log(`\n Error: ${error.message}`, "red");
    console.error(error);
  }
}

// Test Pathway Utils (Scoring)
async function testPathwayUtils() {
  log("\n--- Test Pathway Utils (Scoring) ---\n", "yellow");

  try {
    // Example gap skills
    const gapSkills = {
      mustHaveGap: [
        { skill_id: 1, type: "must_have" },
        { skill_id: 2, type: "must_have" },
        { skill_id: 3, type: "must_have" },
      ],
      preferredGap: [
        { skill_id: 4, type: "preferred" },
        { skill_id: 5, type: "preferred" },
      ],
      allGapSkillIds: [1, 2, 3, 4, 5],
    };

    const userPreferences = {
      resource_priority: ["internship", "project", "course"],
      max_timeline: 365,
    };

    log("Mock Gap Skills:", "blue");
    log(`  Must-have: ${gapSkills.mustHaveGap.length}`, "cyan");
    log(`  Preferred: ${gapSkills.preferredGap.length}`, "cyan");

    // Fetch sample resources
    const resources = await resourceService.fetchResourcesForSkills(
      gapSkills.allGapSkillIds.slice(0, 3)
    );

    if (resources.length === 0) {
      log("\n  No resources found for testing", "yellow");
      return;
    }

    log(`\n Testing with ${resources.length} resources\n`, "green");

    resources.slice(0, 5).forEach((resource) => {
      const score = pathwayUtils.scoreResource(resource, gapSkills, userPreferences);
      const skillsCovered = pathwayUtils.getSkillsCoveredByResource(
        resource,
        gapSkills.allGapSkillIds
      );

      log(`${resource.title}`, "bright");
      log(`  Type: ${resource.resource_type} | Duration: ${resource.total_duration} days`, "cyan");
      log(`  Skills Covered: ${skillsCovered.length}`, "blue");
      log(`  Score: ${score.toFixed(2)}`, "green");
      log("");
    });

    // Test timeline calculation
    const sampleStep = {
      resource: resources[0],
      skillsCovered: [1, 2],
      personalizedDuration: pathwayUtils.calculatePersonalizedDuration(
        resources[0],
        [1, 2]
      ),
    };

    log("Personalized Duration Test:", "yellow");
    log(`  Resource: ${resources[0].title}`, "cyan");
    log(`  Total Duration: ${resources[0].total_duration} days`, "cyan");
    log(`  Personalized: ${sampleStep.personalizedDuration} days`, "green");
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, "red");
    console.error(error);
  }
}

// View Database Statistics
async function viewDatabaseStats() {
  log("\n--- Database Statistics ---\n", "yellow");

  try {
    // Count resources
    const resourceCount = await db.LearningResource.count({
      where: { is_active: true },
    });

    // Count by type
    const courseCount = await db.LearningResource.count({
      where: { resource_type: "course", is_active: true },
    });

    const projectCount = await db.LearningResource.count({
      where: { resource_type: "project", is_active: true },
    });

    const internshipCount = await db.LearningResource.count({
      where: { resource_type: "internship", is_active: true },
    });

    // Count skills
    const skillCount = await db.Skill.count();

    // Count domains
    const domainCount = await db.Domain.count();

    // Count users with preferences
    const userPrefCount = await db.UserPathwayPreference.count();

    log("📊 System Statistics\n", "green");
    log(`Total Active Resources: ${resourceCount}`, "bright");
    log(`  - Courses: ${courseCount}`, "cyan");
    log(`  - Projects: ${projectCount}`, "cyan");
    log(`  - Internships: ${internshipCount}`, "cyan");
    log(`\nTotal Skills: ${skillCount}`, "bright");
    log(`Total Domains: ${domainCount}`, "bright");
    log(`Users with Preferences: ${userPrefCount}`, "bright");
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, "red");
    console.error(error);
  }
}

// Quick End-to-End Test
async function quickE2ETest() {
  log("\n--- Quick End-to-End Test ---\n", "yellow");

  try {
    const userId = parseInt(await question("Enter User ID: "));
    const jobPostId = parseInt(await question("Enter Job Post ID: "));

    log("\n⏳ Running complete flow...\n", "yellow");

    // Step 1: Get preferences
    log("1️⃣  Getting user preferences...", "blue");
    const prefs = await preferenceUtils.getUserPreferences(userId);
    log(`    Priority: ${prefs.resource_priority.join(" > ")}`, "green");

    // Step 2: Calculate skill gap
    log("\n2️⃣  Calculating skill gap...", "blue");
    const gapResult = await skillGapService.getSkillGap(userId, "job_specific", {
      jobPostId,
    });
    log(`    Gap: ${gapResult.gap.totalGapCount} skills`, "green");

    // Step 3: Fetch resources
    log("\n3️⃣  Fetching candidate resources...", "blue");
    const resources = await resourceService.fetchResourcesForSkills(
      gapResult.gap.allGapSkillIds,
      { maxDays: prefs.max_timeline }
    );
    log(`    Found: ${resources.length} resources`, "green");

    // Step 4: Score resources
    log("\n4️⃣  Scoring resources...", "blue");
    const scored = resourceService.scoreAndRankResources(
      resources,
      gapResult.gap,
      prefs
    );
    log(`    Top resource: ${scored[0]?.title} (score: ${scored[0]?.calculatedScore.toFixed(2)})`, "green");

    log("\n🎉 End-to-end test complete!\n", "bright");
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, "red");
    console.error(error);
  }
}

async function testPathwayGenerationFromSkills() {
  log("\n--- Test Pathway Generation from Skills ---\n", "yellow");

  try {
    const userId = parseInt(await question("Enter User ID: "));
    const skillIdsStr = await question(
      "Enter Skill IDs to learn (comma-separated): "
    );
    const skillIds = skillIdsStr.split(",").map((id) => parseInt(id.trim()));

    log(`\n Generating pathways for ${skillIds.length} skills...\n`, "yellow");

    const pathwayGenerationService = require("../services/pathwayGenerationService");
    const result = await pathwayGenerationService.generatePathwaysFromSkills(
      userId,
      skillIds
    );

    if (!result.success) {
      log(`\n ${result.message}`, "red");
      return;
    }

    log(`\n SUCCESS! Generated ${result.pathways.length} pathways\n`, "green");

    log("GAP ANALYSIS:", "blue");
    log(`  Skills to learn: ${result.gap_analysis.total_gap}`, "cyan");
    log(
      `  Skill IDs: ${result.gap_analysis.skills_to_learn.join(", ")}\n`,
      "cyan"
    );

    result.pathways.forEach((pathway, index) => {
      log(
        `\nPATHWAY ${index + 1}: ${pathway.strategy.toUpperCase()}`,
        "bright"
      );
      log(
        `  Duration: ${pathway.total_duration_weeks} weeks (${pathway.total_duration_days} days)`,
        "cyan"
      );
      log(`  Coverage: ${pathway.coverage_percent.toFixed(2)}%`, "cyan");
      log(`  Score: ${pathway.score.toFixed(2)}`, "cyan");
      log(
        `  Resources: ${pathway.resource_count} (${pathway.composition.internships}I + ${pathway.composition.projects}P + ${pathway.composition.courses}C)`,
        "cyan"
      );
      log(
        `  Complete: ${pathway.validation.isComplete ? "YES" : "NO"}`,
        pathway.validation.isComplete ? "green" : "red"
      );

      log(`\n  STEPS:`, "yellow");
      pathway.steps.forEach((step) => {
        log(
          `    ${step.step_order}. [${step.resource_type.toUpperCase()}] ${
            step.title
          }`,
          "bright"
        );
        log(
          `       Skills: ${step.skills_covered}, Duration: ${step.duration_weeks}w (${step.duration_days}d)`,
          "cyan"
        );
      });
    });

    log(
      "\n\n Compare the 3 pathways above - they should be DIFFERENT!",
      "bright"
    );
    log(
      "  - Strategy 1 (Preference-Heavy): Follows user's preferred resource types",
      "yellow"
    );
    log("  - Strategy 2 (Fastest): Optimizes for shortest timeline", "yellow");
    log(
      "  - Strategy 3 (Balanced): Maximizes skill coverage per resource\n",
      "yellow"
    );
  } catch (error) {
    log(`\n Error: ${error.message}`, "red");
    console.error(error);
  }
}


async function testFullPathwayGeneration() {
  log("\n--- Test Full Pathway Generation ---\n", "yellow");

  try {
    const userId = parseInt(await question("Enter User ID: "));

    const strategyChoice = await question(
      "Strategy (1=job_specific, 2=company_target, 3=direct_upskilling): "
    );

    let request = {
      preferences: {
        resource_priority: ["internship", "project", "course"],
        max_timeline: 365,
      },
    };

    switch (strategyChoice) {
      case "1":
        request.strategy_type = "job_specific";
        request.target_job_id = parseInt(await question("Enter Job Post ID: "));
        break;
      case "2":
        request.strategy_type = "company_target";
        request.target_company_id = parseInt(
          await question("Enter Company Recruiter Profile ID: ")
        );
        break;
      case "3":
        request.strategy_type = "direct_upskilling";
        const domainIdsStr = await question(
          "Enter Domain IDs (comma-separated): "
        );
        request.target_domains = domainIdsStr
          .split(",")
          .map((id) => parseInt(id.trim()));
        break;
      default:
        log("Invalid choice", "red");
        return;
    }

    log("\n GENERATING PATHWAYS...\n", "yellow");

    const pathwayGenerationService = require("../services/pathwayGenerationService");
    const result = await pathwayGenerationService.generatePathways(
      userId,
      request
    );

    if (!result.success) {
      log(`\n ${result.message}`, "red");
      return;
    }

    log(`\n SUCCESS! Generated ${result.pathways.length} pathways\n`, "green");

    log("GAP ANALYSIS:", "blue");
    log(`  Total Skills Needed: ${result.gap_analysis.total_gap}`, "cyan");
    log(`  Must-Have: ${result.gap_analysis.must_have_gap}`, "cyan");
    log(`  Preferred: ${result.gap_analysis.preferred_gap}\n`, "cyan");

    result.pathways.forEach((pathway, index) => {
      log(`PATHWAY ${index + 1} (${pathway.strategy})`, "bright");
      log(`  ID: ${pathway.pathway_id}`, "cyan");
      log(
        `  Duration: ${pathway.total_duration_weeks} weeks (${pathway.total_duration_days} days)`,
        "cyan"
      );
      log(`  Coverage: ${pathway.coverage_percent.toFixed(2)}%`, "cyan");
      log(`  Score: ${pathway.score.toFixed(2)}`, "cyan");
      log(
        `  Resources: ${pathway.composition.internships}I + ${pathway.composition.projects}P + ${pathway.composition.courses}C`,
        "cyan"
      );
      log(
        `  Complete: ${pathway.validation.isComplete ? "YES" : "NO"}`,
        pathway.validation.isComplete ? "green" : "red"
      );
      log("");
    });

    const viewDetails = await question(
      "View detailed steps for a pathway? (pathway number or n): "
    );

    if (viewDetails !== "n" && viewDetails !== "N") {
      const pathwayNum = parseInt(viewDetails);
      if (pathwayNum >= 1 && pathwayNum <= result.pathways.length) {
        const pathwayId = result.pathways[pathwayNum - 1].pathway_id;
        const details = await pathwayGenerationService.getPathwayDetails(
          pathwayId
        );

        log(`\nPATHWAY ${pathwayNum} DETAILED STEPS:\n`, "bright");

        details.steps.forEach((step, idx) => {
          log(`Step ${idx + 1}: ${step.resource.title}`, "bright");
          log(`  Type: ${step.resource.type}`, "cyan");
          log(
            `  Duration: ${step.expected_duration_weeks} weeks (${step.expected_duration_days} days)`,
            "cyan"
          );
          log(`  Skills: ${step.skills_to_learn.length}`, "blue");
          log(`  Difficulty: ${step.resource.difficulty}`, "yellow");
          log("");
        });
      }
    }
  } catch (error) {
    log(`\n Error: ${error.message}`, "red");
    console.error(error);
  }
}

// Main loop
async function main() {
  try {
    await db.sequelize.authenticate();
    log("\n Database connected successfully!", "green");

    let running = true;

    while (running) {
      const choice = await showMainMenu();

      
switch (choice) {
  case "1":
    await testSkillGapService();
    break;
  case "2":
    await testResourceService();
    break;
  case "3":
    await testPreferenceUtils();
    break;
  case "4":
    await testPathwayUtils();
    break;
  case "5":
    await viewDatabaseStats();
    break;
  case "6":
    await quickE2ETest();
    break;
  case "7":
    await testFullPathwayGeneration(); // NEW
    break;
  case "8":
    await testPathwayGenerationFromSkills(); // NEW
    break;
  case "0":
    running = false;
    log("\n Goodbye!\n", "green");
    break;
  default:
    log("\n Invalid option\n", "red");
}


      if (running) {
        await question("\nPress Enter to continue...");
      }
    }

    rl.close();
    process.exit(0);
  } catch (error) {
    log(`\n Fatal error: ${error.message}`, "red");
    console.error(error);
    rl.close();
    process.exit(1);
  }
}

// Run the console
main();

