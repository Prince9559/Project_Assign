
const { User,InterviewInvitation, Application, JobPost, JobRole, UserDetail, CompanyRecruiterProfile } = require('../models');
const { Op } = require('sequelize');

const { hasJobAccess } = require("../utils/jobAccessService");

const sendInterviewInvitation = async (req, res) => {
  try {
    const {
      message,
      interview_type,
      interview_date,
      start_time,
      end_time,
      video_link,
    } = req.body;

    const { application_id } = req.params;

    // Validate required fields
    if (!application_id || !message || !interview_type || !interview_date || !start_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if application exists
    const application = await Application.findByPk(application_id, {
      include: [
        {
          model: UserDetail,
          as: "user",
          attributes: ['first_name', 'last_name']
        }
      ]
    });
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const fullName =`${ application.user.dataValues.first_name } ${ application.user.dataValues.last_name || ''}`.trim();
  // Create interview invitation
  const interviewInvitation = await InterviewInvitation.create({
    application_id,
    name: fullName,
    message,
    interview_type,
    interview_date,
    start_time,
    end_time,
    video_link,
  });
  await application.update({ status: 'Interview' });

  // Prepare response including name (first_name) from application
  const response = {
    id: interviewInvitation.id,
    application_id: application.application_id,
    name: interviewInvitation.name, // using full name as first_name
    job_id: application.job_post_id,
    message: interviewInvitation.message,
    interview_type: interviewInvitation.interview_type,
    interview_date: interviewInvitation.interview_date,
    start_time: interviewInvitation.start_time,
    end_time: interviewInvitation.end_time,
    video_link: interviewInvitation.video_link,
    created_at: interviewInvitation.created_at,
    updated_at: interviewInvitation.updated_at,
  };

  return res.status(201).json(response);
} catch (error) {
  console.error('Error sending interview invitation:', error);
  return res.status(500).json({ error: 'Internal server error' });
}
};


const fetchUpcomingInterviews = async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res
        .status(401)
        .json({ error: "Unauthorized. User ID not found." });
    }

    // Ensure user is recruiter
    const user = await User.findOne({
      where: { id: user_id, user_role: "COMPANY" },
    });
    if (!user) {
      return res
        .status(403)
        .json({ error: "Unauthorized. User is not a recruiter." });
    }

    // Recruiter profile
    const companyRecruiterProfile = await CompanyRecruiterProfile.findOne({
      where: { user_id },
    });
    if (!companyRecruiterProfile) {
      return res
        .status(404)
        .json({ error: "Company recruiter profile not found." });
    }

    // Fetch job posts by this recruiter
    const jobPosts = await JobPost.findAll({
      where: { company_recruiter_profile_id: companyRecruiterProfile.id },
      attributes: ["job_id"],
    });

    const job_post_ids = jobPosts.map((job) => job.job_id);
    if (job_post_ids.length === 0) {
      return res.status(200).json([]); // No jobs → no interviews
    }

    // --- Original date filtering logic ---
    const filterType = req.params.filterType;
    const { start_date, end_date } = req.query;
    const today = new Date();
    let dateFilter = {};

    if (filterType === "today") {
      const todayStr = today.toISOString().split("T")[0];
      dateFilter = {
        interview_date: todayStr,
      };
    } else if (filterType === "thisWeek") {
      const dayOfWeek = today.getDay();
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = new Date(today);
      monday.setDate(today.getDate() - diffToMonday);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);

      const mondayStr = monday.toISOString().split("T")[0];
      const sundayStr = sunday.toISOString().split("T")[0];

      dateFilter = {
        interview_date: {
          [Op.between]: [mondayStr, sundayStr],
        },
      };
    } else if (filterType === "custom" && start_date && end_date) {
      dateFilter = {
        interview_date: {
          [Op.between]: [start_date, end_date],
        },
      };
    } else {
      const todayStr = today.toISOString().split("T")[0];
      dateFilter = {
        interview_date: {
          [Op.gte]: todayStr,
        },
      };
    }

    // --- Fetch interviews only for this recruiter's job posts ---
    const interviews = await InterviewInvitation.findAll({
      where: dateFilter,
      include: [
        {
          model: Application,
          attributes: ["id", "job_post_id"], // <-- added job_post_id
          required: true, // <-- ensure only interviews with valid applications
          where: { job_post_id: { [Op.in]: job_post_ids } }, // <-- filter by recruiter's jobs
          include: [
            {
              model: JobPost,
              as: "jobPost",
              attributes: ["job_id", "job_role_id"],
              include: [
                {
                  model: JobRole,
                  attributes: ["title"],
                },
              ],
            },
          ],
        },
      ],
      attributes: [
        "id",
        "application_id",
        "name",
        "interview_type",
        "start_time",
        "end_time",
        "interview_date",
        "office_address",
        "phone_number",
        "status"
      ],
      order: [
        ["interview_date", "ASC"],
        ["start_time", "ASC"],
      ],
    });

    const result = interviews.map((interview) => ({
      id:interview.id,
      interview_type: interview.interview_type,
      start_time: interview.start_time,
      end_time: interview.end_time,
      interview_date: interview.interview_date,
      name: interview.name,
      status:interview.status,
      jobProfile:
        interview.Application && interview.Application.jobPost
          ? interview.Application.jobPost.JobRole?.title
          : null,
      job_id: interview.Application?.job_post_id, // <-- ADDED
      application_id: interview.application_id, // <-- already in attributes, just expose
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching upcoming interviews:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


const updateInterviewStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  // Only COMPANY users can update
  if (userRole !== "COMPANY") {
    return res.status(403).json({ success: false, message: "Unauthorized" });
  }

  // Minimal allowed statuses
  const allowedStatuses = ["Scheduled", "Completed", "Cancelled", "No-show"];
  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Allowed: ${allowedStatuses.join(", ")}`,
    });
  }

  try {
    // Verify ownership/access (e.g., interview belongs to their job)
    const interview = await InterviewInvitation.findByPk(id, {
      include: [
        {
          model: Application,
          include: [
            {
              model: JobPost,
              as: "jobPost",
              attributes: ["job_id"],
            },
          ],
        },
      ],
    });

    if (!interview) {
      return res
        .status(404)
        .json({ success: false, message: "Interview not found" });
    }

    // Optional access check (reuse existing `hasJobAccess`)
    const access = await hasJobAccess(
      userId,
      interview.Application.job_post_id
    );
    if (!access.hasAccess) {
      return res
        .status(403)
        .json({ success: false, message: "You do not have access to this job" });
    }

    // Update status
    await interview.update({ status });

    // Optional: Sync application status (e.g., if all interviews done → consider next step)
    // For now, keep it simple — no auto app status change.

    return res.json({
      success: true,
      data: { id: interview.id, status: interview.status },
    });
  } catch (error) {
    console.error("Error updating interview status:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  sendInterviewInvitation,
  fetchUpcomingInterviews,
  updateInterviewStatus
};