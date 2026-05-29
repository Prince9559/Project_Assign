/**
 * Migration: Add Jobs to Learning Resources
 * Adds job opportunities as learning resources
 */

const db = require("../models");
const { JobPost, LearningResource, ResourceSkill } = db;

async function migrateJobsToResources() {
  console.log("Starting migration: Jobs -> LearningResources");

  try {
    // Fetch all active jobs (not internships or projects)
    const jobs = await JobPost.findAll({
      where: {
        opportunity_type: "Job",
        active_status: 1,
      },
      include: [
        { model: db.JobRole, foreignKey: "job_role_id" },
        { model: db.Skill, as: "skills", through: { attributes: ["type"] } },
      ],
    });

    console.log(`Found ${jobs.length} job posts to migrate`);

    let migratedCount = 0;

    for (const job of jobs) {
      // Check if already migrated
      const existing = await LearningResource.findOne({
        where: { job_post_id: job.job_id, resource_type: "job" },
      });

      if (existing) {
        console.log(`Skipping job_id ${job.job_id} - already migrated`);
        continue;
      }

      // Create learning resource for job
      const resource = await LearningResource.create({
        resource_type: "job",
        source_type: "internal",
        job_post_id: job.job_id,
        title: job.JobRole ? job.JobRole.title : "Job Opportunity",
        description: job.job_description || "Description of the job",
        difficulty_level: "intermediate",
        total_duration: 180, // Jobs don't have a "learning duration"
        is_active: job.active_status === 1,
        start_date: job.internship_start_date,
        end_date: null,
      });

      // Create resource_skills entries
      if (job.skills && job.skills.length > 0) {
        for (const skill of job.skills) {
          await ResourceSkill.create({
            resource_id: resource.resource_id,
            skill_id: skill.skill_id,
            skill_importance: "primary",
            skill_learning_duration: null, // Jobs don't teach skills, they require them
            skill_type: "outcome", // Skills can be prerequisites for jobs but making outcome here 
          });
        }
      }

      migratedCount++;
      console.log(`Migrated job_id ${job.job_id} -> resource_id ${resource.resource_id}`);
    }

    console.log(`\nMigration complete! Migrated ${migratedCount} jobs`);
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run migration
migrateJobsToResources()
  .then(() => {
    console.log("All done!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });