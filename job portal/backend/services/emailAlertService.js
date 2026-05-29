//backend/services/emailAlertService.js

const {
  User,
  CompanyRecruiterProfile,
  JobPost,
  Application,
  UserDetail,
  JobRole,
} = require("../models");
const { sendDigestEmail } = require("./emailService");
const { Op } = require("sequelize");

exports.sendDigestEmailToRecruiters = async () => {
  try {
    const recruiters = await CompanyRecruiterProfile.findAll({
      where: {
        email_alert_frequency: { [Op.ne]: "off" },
      },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["email"],
        },
      ],
      attributes: ["id", "email_alert_frequency", "last_alert_sent_at"],
    });

    for (const recruiter of recruiters) {
      const cutoffDate = getCutoffDate(
        recruiter.email_alert_frequency,
        recruiter.last_alert_sent_at
      );

      // Get job posts for this recruiter
      const jobPosts = await JobPost.findAll({
        where: {
          company_recruiter_profile_id: recruiter.id,
        },
        attributes: ["job_id", "job_role_id"], 
      });

      if (jobPosts.length === 0) continue;
      const jobIds = jobPosts.map((j) => j.job_id);

      // Fetch NEW applications with student + job + job role details
      const applications = await Application.findAll({
        where: {
          job_post_id: jobIds,
          created_at: { [Op.gt]: cutoffDate },
        },
        include: [
          {
            model: JobPost,
            as: "jobPost",
            attributes: ["job_role_id"], 
            include: [
              {
                model: JobRole, 
                as: "JobRole", 
                attributes: ["title"], 
              },
            ],
          },
          {
            model: UserDetail,
            as: "user",
            attributes: ["first_name", "last_name", "email", "resume"],
          },
        ],
        order: [["created_at", "DESC"]],
        attributes: ["created_at"],
      });

      if (applications.length === 0) continue;

      // Group by Job
      const grouped = {};
      applications.forEach((app) => {
        const jobId = app.job_post_id;
        if (!grouped[jobId]) {
          grouped[jobId] = {
            jobTitle: app.jobPost?.JobRole?.title || "Untitled Job",
            applicants: [],
          };
        }
        grouped[jobId].applicants.push({
          name: `${app.user.first_name} ${app.user.last_name}`,
          email: app.user.email,
          resume_url: app.user.resume,
          appliedAt: app.created_at,
        });
      });

      // Send email
      await sendDigestEmail(
        recruiter.user.email,
        recruiter.email_alert_frequency,
        grouped,
        applications.length
      );

      // Update last_sent
      await recruiter.update({ last_alert_sent_at: new Date() });
    }
  } catch (error) {
    console.error("Error in sendDigestEmailToRecruiters:", error);
    throw error;
  }
};

// Helper: Calculate cutoff date (unchanged)
function getCutoffDate(frequency, lastSent) {
  const now = new Date();
  let cutoff = new Date();

  if (frequency === "daily") cutoff.setDate(now.getDate() - 1);
  else if (frequency === "weekly") cutoff.setDate(now.getDate() - 7);
  else if (frequency === "monthly") cutoff.setMonth(now.getMonth() - 1);

  if (lastSent && new Date(lastSent) > cutoff) {
    cutoff = new Date(lastSent);
  }

  const maxLookback = new Date();
  maxLookback.setDate(now.getDate() - 30);
  if (cutoff < maxLookback) {
    cutoff = maxLookback;
  }

  return cutoff;
}