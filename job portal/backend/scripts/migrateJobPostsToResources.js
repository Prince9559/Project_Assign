const db = require("../models");
const { JobPost, LearningResource, ResourceSkill, FilterOption, Skill,JobRole } = db;


// to run command node scripts/migrateJobPostsToResources.js

async function migrateJobPostsToLearningResources() {
  console.log(" Starting migration: JobPosts → LearningResources");

  try {
    // Fetch all active and future also internships and projects
    const jobPosts = await JobPost.findAll({
      where: {
        opportunity_type: ["Internship", "Project"],
        active_status: 1, // Active only
      },
      include: [
        { model: JobRole, foreignKey: "job_role_id" },
        { model: Skill, as: "skills", through: { attributes: ["type"] } },
        {
          model: FilterOption,
          where: { category: "duration" },
          required: false,
          attributes: ["id", "value"], // only what we need
        },
      ],
    });

    console.log(`Found ${jobPosts.length} job posts to migrate`);

    let migratedCount = 0;

    for (const job of jobPosts) {
      // Check if already migrated
      const existing = await LearningResource.findOne({
        where: { job_post_id: job.job_id },
      });

      if (existing) {
        console.log(`Skipping job_id ${job.job_id} - already migrated`);
        continue;
      }

      // Calculate duration
      const durationDays = calculateDuration(job);

      // Create learning resource
      const resource = await LearningResource.create({
        resource_type: job.opportunity_type.toLowerCase(),
        source_type: "internal",
        job_post_id: job.job_id,
        title: job.JobRole
          ? job.JobRole.title
          : `${job.opportunity_type} Opportunity`,
        description: job.job_description,
        difficulty_level: "intermediate",
        total_duration: durationDays,
        is_active: job.active_status === 1,
        start_date: job.internship_start_date || job.project_start_date,
        end_date: job.internship_to_date || job.project_end_date,
      });

      // Create resource_skills entries
      if (job.skills && job.skills.length > 0) {
        for (const skill of job.skills) {
          await ResourceSkill.create({
            resource_id: resource.resource_id,
            skill_id: skill.skill_id,
            skill_importance: "primary",
            skill_learning_duration: null, // No granularity for internships/projects
            skill_type: "outcome",
          });
        }
      }

      migratedCount++;
      console.log(
        ` Migrated job_id ${job.job_id} → resource_id ${resource.resource_id}`
      );
    }

    console.log(`\n Migration complete! Migrated ${migratedCount} resources`);
  } catch (error) {
    console.error(" Migration failed:", error);
    throw error;
  }
}



function calculateDuration(job) {
  const MONTH_TO_DAYS = 30; // standard assumption

  if (job.opportunity_type === "Internship") {
    // 1. Try FilterOption.value (e.g., "1 Month", "3 Months", "6 Month/s")
    if (job.FilterOption && job.FilterOption.value) {
      const val = job.FilterOption.value.trim();
      const match = val.match(/^(\d+)\s*Month/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > 0) {
          return num * MONTH_TO_DAYS;
        }
      }
    }

    // 2. Fallback: use date range
    if (job.internship_start_date && job.internship_to_date) {
      const start = new Date(job.internship_start_date);
      const end = new Date(job.internship_to_date);
      const diffMs = end - start;
      const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
      return diffDays > 0 ? diffDays : MONTH_TO_DAYS;
    }

    return MONTH_TO_DAYS; // default 30 days
  }

  if (job.opportunity_type === "Project") {
    if (job.project_start_date && job.project_end_date) {
      const start = new Date(job.project_start_date);
      const end = new Date(job.project_end_date);
      const diffMs = end - start;
      const diffDays = Math.ceil(diffMs / (24 * 60 * 60 * 1000));
      return diffDays > 0 ? diffDays : 30;
    }

    return 30; // default
  }

  return 30; // safe fallback
}

// Run migration
migrateJobPostsToLearningResources()
  .then(() => {
    console.log("All job posts to resources done!");
    process.exit(0);
  })
  .catch((err) => {
    console.error(" Error:", err);
    process.exit(1);
  });
