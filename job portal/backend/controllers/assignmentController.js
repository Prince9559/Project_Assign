const { Assignment, Application, User, UserDetail, CompanyRecruiterProfile, JobPost } = require('../models');
const path = require('path');
const fs = require('fs');

const createAssignment = async (req, res) => {
  try {
    const { message, deadline, assignment_url } = req.body;
    const { application_id } = req.params;

    if (!application_id || !message || !assignment_url) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const application = await Application.findOne({
      where: { id: application_id },
    });
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    const job_post_id = application.job_post_id;
    const user_id = application.user_id;

    const user = await User.findOne({ where: { id: user_id } });
    if (!user) {
      return res.status(400).json({ error: "Invalid user associated with the application" });
    }

    const fullName = `${user.first_name} ${user.last_name || ""}`.trim();

    const assignment = await Assignment.create({
      user_id,
      job_post_id,
      application_id,
      message,
      deadline,
      name: fullName,
      assignment_url,
    });

    await application.update({ status: "Send Assignment" });

    return res.status(201).json({
      id: assignment.id,
      application_id: assignment.application_id,
      name: assignment.name,
      job_id: assignment.job_post_id,
      message: assignment.message,
      deadline: assignment.deadline,
      assignment_url: assignment.assignment_url,
      created_at: assignment.created_at,
      updated_at: assignment.updated_at
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

const getAssignmentsByRecruiter = async (req, res) => {
  try {
    const recruiter_user_id = req.user?.id; // user id of recruiter
    const { job_post_id } = req.query; // optional filter
    console.log(recruiter_user_id);

    // Step 1: Find recruiter user
    const recruiter = await CompanyRecruiterProfile.findOne({ where: { user_id: recruiter_user_id } });
    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter user not found" });
    }

    console.log("this is recruiter", recruiter);
    // Recruiter profile id
    const recruiterProfileId = recruiter.dataValues.id;
    if (!recruiterProfileId) {
      return res
        .status(400)
        .json({ error: "User is not linked to a recruiter profile" });
    }
    console.log("dfghj", recruiterProfileId);
    // Step 2: Fetch job posts linked to this recruiter profile
    const jobPosts = await JobPost.findAll({
      where: { company_recruiter_profile_id: recruiterProfileId },
      attributes: ["job_id"],
    });

    if (!jobPosts || jobPosts.length === 0) {
      return res
        .status(200)
        .json({
          message: "No job posts found for this recruiter",
          assignments: [],
        });
    }

    const jobPostIds = jobPosts.map((job) => job.job_id);

    // Step 3: Apply optional job_post_id filter
    const filterJobPostIds = job_post_id ? [job_post_id] : jobPostIds;

    // Step 4: Fetch assignments
    const assignments = await Assignment.findAll({
      where: { job_post_id: filterJobPostIds },
      include: [
        {
          model: Application,
          attributes: ["id", "status"],
          include: [
            {
              model: UserDetail,
              as: "user",
              attributes: ["id", "first_name", "last_name", "email"],
            },
          ],
        },
        {
          model: JobPost,
          attributes: ["job_id"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    return res.status(200).json(assignments);
  } catch (error) {
    console.error("Error fetching recruiter assignments:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { createAssignment, getAssignmentsByRecruiter };