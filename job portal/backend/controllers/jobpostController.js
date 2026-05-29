const {
  User,
  JobPost,
  JobPostSkill,
  UserDetail,
  UserSkill,
  CompanyRecruiterProfile,
  Domain,
  JobRole,
  Skill,
  Application,
  Location,
  Experience,
  Assignment,
  InterviewInvitation,
  Education,
  SchoolCollege,
  Course,
  Specialization,
  FilterOption,
  CompanySubscription,
  Plan,
  SubscriptionCreditLog,
  Authority,
  JobAccess,
  AccessScope,
} = require("../models");
const { Sequelize } = require("../db");
const sequelize = require("../db");
const { Op, fn, col, literal, where } = require("sequelize");

const { calculatePrice } = require("../utils/pricingHelper");
const { getPostingContext } = require("../utils/subscriptionHelper");
const {
  useSubscriptionForJob,
  useCollegeCreditsForJob,
} = require("../utils/subscriptionHelper");
const NotificationService = require("../services/notificationService");

const { hasJobAccess } = require("../utils/jobAccessService");
const { calculateSkillMatch, getDetailedSkillMatch } = require('../utils/skillMatch');

// Define valid statuses (must match Application.status values in DB)
const VALID_STATUSES = [
  "Applied",
  "Screening",
  "Send Assignment",
  "Interview",
  "Offered",
  "Hired",
  "ShortList",
  "NotInterested",
];

const nodemailer = require("nodemailer");
require("dotenv").config();
// Nodemailer config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const toSentenceCase = (str) => {
  if (!str || typeof str !== "string") return "";
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

exports.getAllDomains = async (req, res) => {
  try {
    const domains = await Domain.findAll({
      attributes: ["domain_id", "domain_name"],
    });
    const domainList = domains.map((domain) => ({
      id: domain.domain_id,
      name: domain.domain_name,
    }));
    return res.status(200).json({ domains: domainList });
  } catch (error) {
    console.error("Error fetching domains:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

//optimised controler for job apply
exports.applyForJob = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const job_post_id = req.params.job_post_id;
    const {
      why_should_we_hire_you,
      confirm_availability,
      project,
      github_link,
      portfolio_link,
      screening_answers,
    } = req.body;

    // Early validation
    if (!user_id) {
      return res
        .status(401)
        .json({ message: "Unauthorized. User ID not found." });
    }
    if (!job_post_id) {
      return res.status(400).json({ message: "Job post ID is required." });
    }

    if (!why_should_we_hire_you || !confirm_availability) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled." });
    }

    // Parallel fetch: user, userDetail, userSkills
    const [user, userDetail, userSkills] = await Promise.all([
      User.findOne({
        where: { id: user_id },
        attributes: ["id", "email", "phone"],
      }),
      UserDetail.findOne({ where: { user_id } }),
      UserSkill.findAll({ where: { user_id } }),
    ]);

    if (!userDetail) {
      return res.status(404).json({ message: "User details not found." });
    }

    // Check for duplicate application
    const existingApplication = await Application.findOne({
      where: { user_id, job_post_id },
    });
    if (existingApplication) {
      return res
        .status(400)
        .json({ message: "You have already applied for this job." });
    }

    // Fetch job post + related data in one go
    const jobPost = await JobPost.findOne({
      where: { job_id: job_post_id },
      include: [
        {
          model: JobRole,
          attributes: ["title"],
        },
        {
          model: CompanyRecruiterProfile,
          include: [
            {
              model: User,
              as: "user",
              attributes: ["id", "email", "first_name"],
            },
          ],
          attributes: ["id", "user_id", "company_name"],
        },
        {
          model: Skill,
          as: "skills",
          attributes: ["skill_id", "skill_name"],
          through: { attributes: [] },
          required: false,
        },
      ],
    });

    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found." });
    }

    const jobTitle = jobPost.JobRole?.title;
    const recruiterProfile = jobPost.CompanyRecruiterProfile;
    const recruiterUser = recruiterProfile?.user;

    if (!jobTitle || !recruiterUser) {
      return res
        .status(404)
        .json({ message: "Job role title or recruiter details not found." });
    }

    // Compute skill match percentage
    // const userSkillIds = new Set(userSkills.map((us) => us.skill_id));
    // const jobSkills = jobPost.skills || [];
    // const matchedSkillsCount = jobSkills.filter((skill) =>
    //   userSkillIds.has(skill.skill_id)
    // ).length;
    // const matchPercentage =
    //   jobSkills.length > 0
    //     ? Math.round((matchedSkillsCount / jobSkills.length) * 100)
    //     : 0;

    // if (matchPercentage < jobPost.min_skill_match_required) {
    //   return res.status(400).json({
    //     message: "You have not added enough skills required for this post.",
    //   });
    // }


    //  Fetch job skills WITH type (must-have / preferred)



    const jobSkillRelations = await JobPostSkill.findAll({
  where: { job_post_id: job_post_id },
  include: [
    {
      model: Skill,
      as: 'Skill',
      attributes: ['skill_id', 'skill_name'],
    }
  ],
  attributes: ['type'],
});

const userSkillsData = await UserSkill.findAll({
        where: { user_id:req.user.id },
        include: [{ model: Skill, as: "Skill", attributes: ["skill_name"] }],
      });

// Compute detailed match (strict: must-have mandatory)
const matchDetails = getDetailedSkillMatch(jobSkillRelations, userSkillsData);
const { matchPercentage, passedMustHave, mustHave } = matchDetails;

//  Block application if missing any must-have
if (!passedMustHave && mustHave.count.required > 0) {
  const missingList = mustHave.missing.map(s => `"${s}"`).join(', ');
  return res.status(400).json({
    message: `You are missing required skills. Please add them to apply.`,
    // missingMustHave: mustHave.missing,
  });
}

//  Block if match % < min required (applies to preferred skills only)
if (matchPercentage < jobPost.min_skill_match_required) {
  return res.status(400).json({
    message: `You need at least ${jobPost.min_skill_match_required}% skill match to apply.`,
    required: jobPost.min_skill_match_required,
    current: matchPercentage,
  });
}

    // Create application (minimal fields computed up front)
    const fullName = `${userDetail.first_name || ""} ${
      userDetail.last_name || ""
    }`.trim();
    const applicationData = {
      user_id,
      job_post_id,
      //new fields
      why_should_we_hire_you,
      confirm_availability,
      project: project || "",
      github_link: github_link || "",
      portfolio_link: portfolio_link || "",
      screening_answers: Array.isArray(screening_answers)
        ? screening_answers
        : [],

      //existing fields
      name: userDetail.first_name || "",
      location: userDetail.currentLocation || "",
      experience: "", // adjust if needed later
      skills: userSkills.map((us) => us.skill).join(", "),
      language: userDetail.language || "",
      resume: userDetail.resume || "",
      email: user.email || "",
      phoneNumber: user.phone || "",
      status: "Applied",
    };

    const application = await Application.create(applicationData);

    //  Fire-and-forget: notifications & emails (non-blocking, no await)
    // → Send notifications
    Promise.all([
      NotificationService.send(
        recruiterUser.id, //  use recruiterUser.id, not .user_id (already User instance)
        "COMPANY",
        "application_received",
        {
          jobId: jobPost.job_id,
          jobTitle,
          applicantName: fullName,
          applicantEmail: user.email,
        }
      ).catch((err) =>
        console.error("Notification to recruiter failed:", err.message)
      ),

      NotificationService.send(user.id, "STUDENT", "application_submitted", {
        jobId: jobPost.job_id,
        jobTitle,
        companyName: recruiterProfile.company_name,
        applicationId: application.id,
      }).catch((err) =>
        console.error("Notification to applicant failed:", err.message)
      ),
    ]).catch(console.error); // top-level catch for Promise.all, but won’t block response

    // → Send emails (also fire-and-forget)
    if (user.email) {
      transporter
        .sendMail({
          from: `"Job Portal" <${process.env.EMAIL_USER}>`,
          to: user.email,
          subject: `Application Submitted Successfully`,
          html: `
            <h2>Thank You for Applying!</h2>
            <p>Hello ${userDetail.first_name || "Applicant"},</p>
            <p>Your application for the position <strong>"${jobTitle}"</strong> has been successfully submitted.</p>
            <p>We will notify you once the recruiter reviews your profile.</p>
            <br/>
            <p>Best regards,<br/>Job Portal Team</p>
          `,
        })
        .catch((err) => console.error("Applicant email failed:", err.message));
    }

    if (recruiterUser.email) {
      transporter
        .sendMail({
          from: `"Job Portal" <${process.env.EMAIL_USER}>`,
          to: recruiterUser.email,
          subject: `New Application Received for "${jobTitle}"`,
          html: `
            <h2>New Job Application Received 🎉</h2>
            <p>Hello ${recruiterUser.first_name || "Recruiter"},</p>
            <p>You have received a new application for the job <strong>"${jobTitle}"</strong>.</p>
            <p><strong>Applicant Name:</strong> ${fullName}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p>Please login to your dashboard to review the full application.</p>
            <br/>
            <p>Best regards,<br/>Job Portal Team</p>
          `,
        })
        .catch((err) => console.error("Recruiter email failed:", err.message));
    }

    return res
      .status(200)
      .json({ message: "Application successful.", data: application });
  } catch (error) {
    console.error("Error applying for job:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};



exports.getLastApplication = async (req, res) => {
  try {

    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Last application (latest created)
    const lastApplication = await Application.findOne({
      where: { user_id },
      order: [["created_at", "DESC"]],
    });

    console.log("Last Application:", lastApplication);

    if (!lastApplication) {
      return res.status(404).json({
        message: "No previous application found",
      });
    }

   
    const prefillData = {
      why_should_we_hire_you: lastApplication.why_should_we_hire_you || "",
      confirm_availability: lastApplication.confirm_availability || false,
      project: lastApplication.project || "",
      github_link: lastApplication.github_link || "",
      portfolio_link: lastApplication.portfolio_link || "",
      screening_answers: Array.isArray(lastApplication.screening_answers)
        ? lastApplication.screening_answers
        : [],
    };

    console.log("Prefill Data:", prefillData);

    return res.status(200).json({
      success: true,
      data: prefillData,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};


// New method to update application status by recteamruiter
// exports.updateApplicationStatus = async (req, res) => {
//   try {
//     const user_id = req.user?.id;
//     console.log("Current user_id:", user_id);

//     const {
//       application_id,
//       job_post_id,
//       user_id: applicantuser_id,
//       status,
//     } = req.body;

//     // Validate user is recruiter
//     const recruiter = await User.findOne({
//       where: { id: user_id, user_role: "COMPANY" },
//     });
//     if (!recruiter) {
//       return res.status(403).json({
//         message: "Unauthorized. Only recruiters can update application status.",
//       });
//     }

//     // Validate status value
//     const allowedStatuses = [
//       "Applied",
//       "Screening",
//       "Interview",
//       "Offered",
//       "Hired",
//       "ShortList",
//       "NotInterested",
//       "Send Assignment",
//     ];
//     if (!allowedStatuses.includes(status)) {
//       return res.status(400).json({
//         message: `Invalid status value. Allowed values are: ${allowedStatuses.join(
//           ", "
//         )}`,
//       });
//     }

//     // Find application by application_id or by user_id and job_post_id
//     let application;
//     if (application_id) {
//       application = await Application.findOne({
//         where: { id: application_id },
//       });
//     } else if (job_post_id && applicantuser_id) {
//       application = await Application.findOne({
//         where: { job_post_id, user_id: applicantuser_id },
//       });
//     } else {
//       return res.status(400).json({
//         message:
//           "Provide either application_id or both job_post_id and user_id of the applicant.",
//       });
//     }

//     if (!application) {
//       return res.status(404).json({ message: "Application not found." });
//     }

//     // Update status
//     application.status = status;
//     await application.save();

//     if (status === "ShortList") {
//       Promise.all([
//         NotificationService.send(
//           application.user_id,
//           "STUDENT",
//           "application_shortlisted",
//           {
//             jobId: job_post_id,
//             jobTitle: "App Developer",
//             companyName: "Abcd Company",
//             applicationId: application.id,
//           }
//         ).catch((err) =>
//           console.error("Notification to applicant failed:", err.message)
//         ),
//       ]).catch(console.error); // top-level catch for Promise.all, but won’t block response
//     }

//     return res.status(200).json({
//       message: "Application status updated successfully.",
//       data: application,
//     });
//   } catch (error) {
//     console.error("Error updating application status:", error);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };




exports.updateApplicationStatus = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    if (!currentUserId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not authenticated." });
    }

    const {
      application_id,
      job_post_id,
      user_id: applicant_user_id, // renamed for clarity
      status,
    } = req.body;

    // 1. Validate required inputs
    if (!status) {
      return res.status(400).json({ message: "status is required." });
    }

    let application;
    if (application_id) {
      application = await Application.findByPk(application_id);
    } else if (job_post_id && applicant_user_id) {
      application = await Application.findOne({
        where: { job_post_id: job_post_id, user_id: applicant_user_id },
      });
    } else {
      return res.status(400).json({
        message:
          "Provide either application_id OR both job_post_id and applicant user_id.",
      });
    }

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    // 2. Verify current user is a COMPANY and has access to the job
    const jobPostId = application.job_post_id;

    // Check user role and access
    if (req.user.role !== "COMPANY") {
      return res.status(403).json({
        message:
          "Forbidden: Only company recruiters can update application status.",
      });
    }

    // Reuse your existing access control logic (assuming `hasJobAccess` returns { hasAccess, level })
    const access = await hasJobAccess(currentUserId, jobPostId);
    if (!access.hasAccess || !["edit", "manage"].includes(access.level)) {
      return res.status(403).json({
        message:
          "Forbidden: You do not have permission to manage this job application.",
      });
    }

    // 3. Enforce valid status transitions (forward-only, no illegal rollbacks)
    const validStatuses = [
      "Applied",
      "Screening",
      "ShortList",
      "Interview",
      "Send Assignment",
      "Offered",
      "Hired",
      "NotInterested",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Allowed: ${validStatuses.join(", ")}`,
      });
    }

    const currentStatus = application.status;
    const statusOrder = {
      "Applied": 0,
      "Screening": 1,
      "ShortList": 2,
      "Interview": 3,
      "Send Assignment": 4,
      "Offered": 5,
      "Hired": 6,
      "NotInterested": 99, // terminal state (can be reached from any, but no going back)
    };

    const currentOrder = statusOrder[currentStatus];
    const newOrder = statusOrder[status];

    // Allow transition to "NotInterested" from any state (explicit recruiter rejection)
    if (status === "NotInterested") {
      // OK — no order check
    }
    // Otherwise, enforce forward-only progression (or same state)
    else if (newOrder < currentOrder) {
      return res.status(400).json({
        message: `Invalid status transition: Cannot change from "${currentStatus}" to "${status}".`,
      });
    }

    // Additional guard: Once "Hired" or "NotInterested", only allow same or terminal states
    if (currentStatus === "Hired" && status !== "Hired") {
      return res.status(400).json({
        message:
          "Application is already Hired. Status cannot be reverted or changed.",
      });
    }

    if (currentStatus === "NotInterested" && status !== "NotInterested") {
      return res.status(400).json({
        message:
          "Application is marked NotInterested. Status cannot be changed.",
      });
    }

    // 4. Update application
    application.status = status;
    await application.save();

    // 5. Side effects (e.g., notifications)
    if (status === "ShortList" || status=== "Hired") {
      // Fetch actual job title & company name for notification
      const jobPost = await JobPost.findByPk(jobPostId, {
        include: [
          { model: JobRole, as: "JobRole", attributes: ["title"] },
          {
            model: CompanyRecruiterProfile,
            as: "CompanyRecruiterProfile",
            attributes: ["company_name"],
          },
        ],
      });

      const jobTitle = jobPost?.JobRole?.title || "the role";
      const companyName =
        jobPost?.CompanyRecruiterProfile?.company_name || "the company";

      NotificationService.send(
        application.user_id,
        "STUDENT",
        status=== "ShortList"? "application_shortlisted": "application_hired",
        {
          jobId: jobPostId,
          jobTitle,
          companyName,
          applicationId: application.id,
        }
      ).catch((err) =>
        console.error("Shortlist notification failed:", err.message)
      );
    }

    // we can add more side effects for "Interview", "Hired", etc. later

    return res.status(200).json({
      message: "Application status updated successfully.",
      data: { id: application.id, status: application.status },
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return res.status(500).json({
      message: "Server error while updating application status.",
      // error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// New method to get total job posts count by recruiter
exports.getTotalJobPostsByRecruiter = async (req, res) => {
  try {
    const user_id = req.user?.id;

    console.log("Current user_id:", user_id);

    if (!user_id) {
      return res
        .status(401)
        .json({ message: "Unauthorized. User ID not found." });
    }

    // Check if user role is COMPANY (recruiter)
    const user = await User.findOne({
      where: { id: user_id, user_role: "COMPANY" },
    });
    if (!user) {
      return res
        .status(403)
        .json({ message: "Unauthorized. User is not a recruiter." });
    }

    // Find company recruiter profile
    const companyRecruiterProfile = await CompanyRecruiterProfile.findOne({
      where: { user_id },
    });
    if (!companyRecruiterProfile) {
      return res
        .status(404)
        .json({ message: "Company recruiter profile not found." });
    }

    // Count job posts by company_recruiter_profile_id
    const totalJobPosts = await JobPost.count({
      where: { company_recruiter_profile_id: companyRecruiterProfile.id },
    });

    return res.status(200).json({ totalJobPosts });
  } catch (error) {
    console.error("Error fetching total job posts:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};



// New method to get candidates by application status
exports.getCandidatesByStatus = async (req, res) => {
  try {
    const status = req.params.status;

    // Validate status value
    const allowedStatuses = [
      "Applied",
      "Screening",
      "Interview",
      "Offered",
      "Hired",
      "ShortList",
      "NotInterested",
      "Send Assignment",
    ];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status value. Allowed values are: ${allowedStatuses.join(
          ", "
        )}`,
      });
    }

    // Fetch applications with the given status
    const applications = await Application.findAll({
      where: { status },
      include: [
        {
          model: JobPost,
          as: "jobPost",
          attributes: [
            "job_id",
            "job_role_id",
            "skill_required_note",
            "number_of_openings",
          ],
          include: [
            {
              model: JobRole,
              attributes: ["title"],
            },
            {
              model: CompanyRecruiterProfile,
              attributes: ["company_name"],
            },
          ],
        },
      ],
      order: [["id", "DESC"]],
    });

    // Format response data to include all application fields
    const responseData = applications.map((app) => ({
      application_id: app.id,
      user_id: app.user_id,
      job_post_id: app.job_post_id,
      status: app.status,
      name: app.name,
      experience: app.experience,
      jobProfile: app.jobPost.JobRole?.title,
    }));

    return res.status(200).json({ candidates: responseData });
  } catch (error) {
    console.error("Error fetching candidates by status:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

//get no of applicants count applied for a particular job
exports.getNoOfApplicantsForParticularJob = async (req, res) => {
  try {
    const { job_post_id } = req.params;
    console.log("job_post_id", job_post_id);
    if (!job_post_id) {
      return res.status(400).json({
        message: "job_post_id is required",
        success: false,
        data: null,
      });
    }
    const applicantsCount = await Application.count({ where: { job_post_id } });
    return res.status(200).json({
      message:
        "No of applicants count for a particular job fetched successfully",
      success: true,
      data: applicantsCount,
    });
  } catch (error) {
    console.log(
      "error while fetching no of applicants count applied for a particular job",
      error
    );
    return res.status(500).json({
      message: "Internal server error",
      success: false,
      data: null,
      error: error.message,
    });
  }
};


//  user application view
exports.getUserApplications = async (req, res) => {
  try {
    const user_id = req.user?.id;
    console.log("Current user_id:", user_id);

    if (!user_id) {
      return res
        .status(401)
        .json({ message: "Unauthorized. User ID not found." });
    }

    // Fetch all applications for the user with job post and company details
    const [applications, userSkills] = await Promise.all([
      Application.findAll({
        where: { user_id },
        include: [
          {
            model: JobPost,
            as: "jobPost",
            include: [
              {
                model: CompanyRecruiterProfile,
                attributes: ["company_name", "logo_url"],
              },
              {
                model: JobRole,
                attributes: ["title"],
              },
              {
                model: Skill,
                through: { attributes: [] },
                attributes: ["skill_id"],
                as: "skills",
              },
            ],
            attributes: ["job_id", "number_of_openings"],
          },
          {
            model: Assignment,
            as: "assignments",
            attributes: ["id", "message", "deadline", "assignment_url"],
          },
          {
            model: InterviewInvitation,
            as: "interviews",
            attributes: [
              "id",
              "name",
              "message",
              "status",
              "interview_type",
              "interview_date",
              "office_address",
              "phone_number",
              "start_time",
              "end_time",
              "video_link",
              "created_at",
              "updated_at",

            ],
            order: [
              ["interview_date", "ASC"],
              ["start_time", "ASC"],
            ],
          },
        ],
        order: [["id", "DESC"]],
      }),
      // Fetch user's skills
      UserSkill.findAll({
        where: { user_id },
        include: [
          {
            model: Skill,
            as: "Skill",
            attributes: ["skill_id", "skill_name"],
          },
        ],
        attributes: ["skill_id"],
      }),
    ]);

    // Create a map of job post IDs to their skills
    const jobPostSkillsMap = {};
    applications.forEach((app) => {
      if (app.jobPost && app.jobPost.skills) {
        jobPostSkillsMap[app.job_post_id] = app.jobPost.skills.map(
          (skill) => skill.skill_id
        );
      } else {
        jobPostSkillsMap[app.job_post_id] = [];
      }
    });

    // Get unique skill IDs from user skills
    const userSkillIds = [
      ...new Set(userSkills.map((us) => us.Skill?.skill_id).filter(Boolean)),
    ];

    // For each application, get the number of applicants for the job post
    const job_post_ids = applications.map((app) => app.job_post_id);
    const applicantCounts = await Application.findAll({
      where: { job_post_id: { [Op.in]: job_post_ids } },
      attributes: ["job_post_id", [fn("COUNT", col("id")), "applicantCount"]],
      group: ["job_post_id"],
    });

    // Map job_post_id to applicantCount
    const applicantCountMap = {};
    applicantCounts.forEach((item) => {
      applicantCountMap[item.job_post_id] = item.get("applicantCount");
    });

    // Format response data with skill match percentage and interview details
    const responseData = applications.map((app) => {
      const jobPostSkillIds = jobPostSkillsMap[app.job_post_id] || [];
      const matchedSkills = jobPostSkillIds.filter((skillId) =>
        userSkillIds.includes(skillId)
      ).length;

      const totalRequiredSkills = jobPostSkillIds.length || 1; // Avoid division by zero
      const matchPercentage = Math.round(
        (matchedSkills / totalRequiredSkills) * 100
      );

      // Format interview details if they exist
      const interviews = app.interviews
        ? app.interviews.map((interview) => ({
            id: interview.id,
            name: interview.name,
            message: interview.message,
            status:interview.status,
            location:interview.office_address,
            phone:interview.phone_number,
            type: interview.interview_type,
            date: interview.interview_date,
            startTime: interview.start_time,
            endTime: interview.end_time,
            videoLink: interview.video_link,
            createdAt: interview.created_at,
            updatedAt: interview.updated_at,
          }))
        : [];

      // Format assignment details if they exist
      const assignments = app.assignments
        ? app.assignments.map((assignment) => ({
            id: assignment.id,
            message: assignment.message,
            deadline: assignment.deadline,
            assignment_url: assignment.assignment_url,
            createdAt: assignment.created_at,
            updatedAt: assignment.updated_at,
            status: assignment.status || "pending", // Assuming there's a status field
          }))
        : [];

      return {
        application_id: app.id,
        job_post_id: app.job_post_id,
        company_name: app.jobPost.CompanyRecruiterProfile?.company_name || "",
        company_logo: app.jobPost.CompanyRecruiterProfile?.logo_url || "",
        jobRole: app.jobPost.JobRole?.title || "",
        skill_match_percentage: matchPercentage,
        number_of_openings: app.jobPost.number_of_openings,
        status: app.status || "application sent",
        applied_date: app.created_at
          ? app.created_at.toISOString().split("T")[0]
          : null,
        applicantCount: applicantCountMap[app.job_post_id] || 0,
        has_interview_invitation: interviews.length > 0,
        interviews: interviews,
        upcoming_interview: interviews.length > 0 ? interviews[0] : null, // Closest upcoming interview
        has_assignment: assignments.length > 0,
        assignments: assignments,
        upcoming_assignment: assignments.length > 0 ? assignments[0] : null, // Closest deadline assignment
      };
    });

    return res.status(200).json({ applications: responseData });
  } catch (error) {
    console.error("Error fetching user applications:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};


exports.getApplicantDetailsById = async (req, res) => {
  try {
    const { application_id } = req.params;

    if (!application_id) {
      return res.status(400).json({ message: "Application ID is required." });
    }

    const application = await Application.findOne({
      where: { id: application_id },
      include: [
        {
          model: UserDetail,
          as: "user",
          include: [
            {
              model: Location,
              as: "currentLocation",
              attributes: ["id", "name"],
            },
            {
              model: Experience,
              as: "experiences",
              attributes: [
                "id",
                "start_date",
                "end_date",
                "experience_certificate",
                "status",
                "company_id",
                "job_role_id",
                "organization_name",
                "authority_id",
              ],
              include: [
                {
                  model: JobRole,
                  as: "jobRole",
                  attributes: ["id", "title"],
                },
                {
                  model: CompanyRecruiterProfile,
                  as: "companyRecruiterProfile",
                  attributes: ["id", "company_name", "logo_url"],
                },
                {
                  model: Authority,
                  as: "Authority",
                  attributes: ["id", "authority_type"],
                  include: [
                    {
                      model: CompanyRecruiterProfile,
                      as: "CompanyRecruiterProfile",
                      attributes: ["id", "company_name", "logo_url"],
                    },
                    {
                      model: SchoolCollege,
                      as: "SchoolCollege",
                      attributes: ["id", "name", "logo_pic"],
                    },
                  ],
                },
              ],
            },
            {
              model: Education,
              as: "userEducations",
              attributes: [
                "id",
                "level",
                "school_college_id",
                "other_institution_name",
                "board_or_university",
                "standard_or_grade",
                "course_id",
                "specialization_id",
                "start_date",
                "end_date",
                "percentage_or_cgpa",
                "education_certificate",
              ],
              include: [
                {
                  model: SchoolCollege,
                  as: "schoolCollegeEducations",
                  attributes: ["id", "name", "logo_pic"],
                },
                {
                  model: Course,
                  as: "educationCourse",
                  attributes: ["id", "name"],
                },
                {
                  model: Specialization,
                  as: "educationSpecialization",
                  attributes: ["id", "name"],
                },
              ],
            },
            {
              model: User,
              include: [
                {
                  model: UserSkill,
                  include: [
                    {
                      model: Skill,
                      as: "Skill",
                      attributes: ["skill_name"],
                    },
                  ],
                  attributes: ["id", "skill"],
                },
              ],
            },
          ],
        },
        {
          model: Location,
          as: "location",
          attributes: ["id", "name"],
        },
      ],
    });

    if (!application) {
      return res.status(404).json({ message: "Application not found." });
    }

    if (req.user.role === "COMPANY") {
      const access = await hasJobAccess(req.user.id, application.job_post_id);
      if (!access.hasAccess || !["edit", "manage"].includes(access.level)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions to view applicant details.",
        });
      }
    }

    // Fetch job skills WITH type (must-have / preferred)
    const jobSkillRelations = await JobPostSkill.findAll({
      where: { job_post_id: application.job_post_id },
      include: [
        {
          model: Skill,
          as: "Skill",
          attributes: ["skill_id", "skill_name"],
        },
      ],
      attributes: ["type"],
    });

    const userDetail = application.user || {};
    const userAccount = userDetail.User || {};

    const skills =
      userAccount.UserSkills?.map((us) => ({
        id: us.id,
        name: us.Skill?.skill_name || "Unknown Skill",
      })) || [];

    // Extract raw user skills (UserSkill[] with Skill association)
    const userSkillsRaw = userAccount.UserSkills || [];

    // Compute detailed match
    const matchDetails = getDetailedSkillMatch(
      jobSkillRelations,
      userSkillsRaw
    );

    // Destructure for clarity
    const { matchPercentage, passedMustHave, mustHave, preferred, overall } =
      matchDetails;

    //  NEW: Clean experienceDetails (frontend-friendly)
    const experienceDetails = (userDetail.experiences || []).map((exp) => {
      // --- Job Role ---
      const jobRole = exp.jobRole
        ? {
            id: exp.jobRole.id,
            title: exp.jobRole.title,
          }
        : exp.job_role_id
        ? { id: exp.job_role_id, title: "Unknown Role" }
        : null;

      // --- Organization resolution ---
      let org = {
        id: null,
        name: "Unknown Organization",
        logoUrl: null,
        type: "OTHER", // "COMPANY" | "UNIVERSITY" | "CUSTOM" | "OTHER"
        authorityId: null,
      };

      if (exp.Authority) {
        const auth = exp.Authority;
        org.id = auth.id;
        org.authorityId = auth.id;
        org.type = auth.authority_type || "OTHER";

        if (auth.authority_type === "COMPANY") {
          const comp = auth.CompanyRecruiterProfile;
          org.name = comp?.company_name || "Company";
          org.logoUrl = comp?.logo_url || null;
        } else if (auth.authority_type === "UNIVERSITY") {
          const school = auth.SchoolCollege;
          org.name = school?.name || "University";
          org.logoUrl = school?.logo_pic || null;
        }
      } else if (exp.organization_name) {
        org.name = exp.organization_name;
        org.type = "CUSTOM";
      } else if (exp.companyRecruiterProfile) {
        const profile = exp.companyRecruiterProfile;
        org.id = profile.id;
        org.name = profile.company_name || "Company";
        org.logoUrl = profile.logo_url || null;
        org.type = "COMPANY";
      } else if (exp.company_id) {
        org.id = exp.company_id;
        org.name = "Company";
        org.type = "COMPANY";
      }

      // Dates
      const startDate = exp.start_date
        ? new Date(exp.start_date).toISOString().split("T")[0]
        : null;
      const endDate = exp.end_date
        ? new Date(exp.end_date).toISOString().split("T")[0]
        : null;

      return {
        id: exp.id,
        startDate,
        endDate,
        isCurrent: !exp.end_date,
        status: exp.status || "pending",
        experienceCertificate: exp.experience_certificate || null,
        jobRole,
        organization: org,
      };
    });

    // Legacy experiences — exact same logic as original controller (backward compatibility)
    const experiencesRaw = userDetail.experiences || [];

    const legacyExperiences = await Promise.all(
      experiencesRaw.map(async (exp) => {
        let companyProfile = exp.companyRecruiterProfile;

        // If no profile is loaded but company_id exists, fetch it (original fallback)
        if (!companyProfile && exp.company_id) {
          companyProfile = await CompanyRecruiterProfile.findByPk(
            exp.company_id,
            {
              attributes: ["id", "company_name", "logo_url"],
              include: [
                {
                  model: Location,
                  as: "companyLocation",
                  attributes: ["name"],
                },
              ],
            }
          );
        }

        return {
          ...exp.toJSON(),
          companyRecruiterProfile: companyProfile || null,
        };
      })
    );

    return res.status(200).json({
      application_id: application.id,
      user_id: application.user_id,
      job_post_id: application.job_post_id,
      status: application.status,
      applicationDetails: {
        why_should_we_hire_you: application.why_should_we_hire_you,
        confirm_availability: application.confirm_availability,
        project: application.project,
        github_link: application.github_link,
        portfolio_link: application.portfolio_link,
        education: userDetail.userEducations || [],
        name:
          `${userDetail.first_name || ""} ${
            userDetail.last_name || ""
          }`.trim() || null,
        location: application.location,
        currentLocation: userDetail.currentLocation || null,
        skills,
        skillMatchPercentage:matchPercentage,
        //  NEW: Skill Match Breakdown
    skillMatch: {
      overallPercentage: matchPercentage,
      passedMustHave,
      
      mustHave: {
        required: mustHave.required,
        matched: mustHave.matched,
        missing: mustHave.missing,
        count: mustHave.count,
      },
      
      preferred: {
        required: preferred.required,
        matched: preferred.matched,
        missing: preferred.missing,
        count: preferred.count,
      },
      
      // Optional: add suggestions
      suggestions: {
        missingMustHave: mustHave.missing,
        missingPreferred: preferred.missing,
      }
    },
        language: userDetail.language || [],
        resume: userDetail.resume || null,
        email: userAccount.email || null,
        phone: userAccount.phone || null,

        //  Primary field for frontend
        experienceDetails,

        // Uncomment only if frontend still needs old shape
        experiences: legacyExperiences,
      },
    });
  } catch (error) {
    console.error("Error fetching applicant details:", error);
    return res.status(500).json({
      message: "Server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// api for pending task  count

exports.getPendingTasksgroupbystatus = async (req, res) => {
  try {
    const user_id = req.user?.id;
    console.log("Current user_id:", user_id);

    console.log("getPendingTasksgroupbystatus - user_id:", user_id);
    if (!user_id) {
      return res
        .status(401)
        .json({ message: "Unauthorized. User ID not found." });
    }

    const companyRecruiterProfile = await CompanyRecruiterProfile.findOne({
      where: { user_id },
    });
    if (!companyRecruiterProfile) {
      return res
        .status(404)
        .json({ message: "Company recruiter profile not found." });
    }

    const jobPosts = await JobPost.findAll({
      where: { company_recruiter_profile_id: companyRecruiterProfile.id },
    });

    const job_post_ids = jobPosts.map((job) => job.job_id);

    if (job_post_ids.length === 0) {
      return res.status(200).json({
        resumeReview: [],
        interviewToSchedule: [],
        offerLetterPending: [],
      });
    }

    const applications = await Application.findAll({
      where: {
        job_post_id: { [Op.in]: job_post_ids },
      },
      order: [["id", "DESC"]],
    });

    const resumeReview = [];
    const interviewToSchedule = [];
    const offerLetterPending = [];

    applications.forEach((app) => {
      const statusTrimmed = app.status.trim();
      if (statusTrimmed === "Applied") {
        resumeReview.push(app);
      } else if (statusTrimmed === "Screening") {
        interviewToSchedule.push(app);
      } else if (statusTrimmed === "ShortList") {
        offerLetterPending.push(app);
      }
    });

    return res.status(200).json({
      resumeReview: {
        count: resumeReview.length,
      },
      interviewToSchedule: {
        count: interviewToSchedule.length,
      },
      offerLetterPending: {
        count: offerLetterPending.length,
      },
    });
  } catch (error) {
    console.error("Error fetching pending tasks grouped by status:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

//view pending task Applications by status
exports.getviewPendingTasksgroupbystatus = async (req, res) => {
  try {
    const user_id = req.user?.id;
    console.log("Current user_id:", user_id);

    const statusParam = req.params.status?.trim();

    const validStatuses = ["Applied", "Screening", "ShortList"];

    if (!user_id) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User ID not found" });
    }

    if (!validStatuses.includes(statusParam)) {
      return res.status(400).json({
        message: `Invalid status '${statusParam}'. Must be one of: ${validStatuses.join(
          ", "
        )}`,
      });
    }

    const recruiter = await CompanyRecruiterProfile.findOne({
      where: { user_id },
    });
    if (!recruiter) {
      return res.status(404).json({ message: "Recruiter profile not found" });
    }

    const jobPosts = await JobPost.findAll({
      where: { company_recruiter_profile_id: recruiter.id },
    });

    const job_post_ids = jobPosts.map((job) => job.job_id);

    if (job_post_ids.length === 0) {
      return res.status(200).json({ applications: [] });
    }

    const applications = await Application.findAll({
      where: {
        job_post_id: { [Op.in]: job_post_ids },
        status: statusParam,
      },
      order: [["id", "DESC"]],
    });

    return res.status(200).json({
      status: statusParam,
      count: applications.length,
      applications,
    });
  } catch (error) {
    console.error("Error in getviewPendingTasksgroupbystatus:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// api for filter
exports.getAllJobFilterOptions = async (req, res) => {
  try {
    const [
      jobProfiles,
      cityChoices,
      job_types,
      candidate_preferences,
      salaryRanges,
      company_names,
    ] = await Promise.all([
      JobRole.findAll({
        attributes: [
          [Sequelize.fn("DISTINCT", Sequelize.col("title")), "jobProfile"],
        ],
        where: { title: { [Op.ne]: null } },
        order: [["title", "ASC"]],
      }),
      Location.findAll({
        attributes: [
          [Sequelize.fn("DISTINCT", Sequelize.col("name")), "cityChoice"],
        ],
        where: { name: { [Op.ne]: null } },
        order: [["name", "ASC"]],
      }),
      JobPost.findAll({
        attributes: [
          [Sequelize.fn("DISTINCT", Sequelize.col("job_type")), "job_type"],
        ],
        where: { job_type: { [Op.ne]: null } },
        order: [["job_type", "ASC"]],
      }),
      JobPost.findAll({
        attributes: [
          [
            Sequelize.fn("DISTINCT", Sequelize.col("candidate_preferences")),
            "candidate_preferences",
          ],
        ],
        where: { candidate_preferences: { [Op.ne]: null } },
        order: [["candidate_preferences", "ASC"]],
      }),
      JobPost.findAll({
        attributes: [
          [Sequelize.fn("MIN", Sequelize.col("stipend_min")), "minSalary"],
          [Sequelize.fn("MAX", Sequelize.col("stipend_max")), "maxSalary"],
        ],
      }),
      CompanyRecruiterProfile.findAll({
        attributes: [
          [
            Sequelize.fn("DISTINCT", Sequelize.col("company_name")),
            "company_name",
          ],
        ],
        where: {
          company_name: {
            [Op.and]: [{ [Op.ne]: null }, { [Op.ne]: "" }],
          },
        },
        order: [["company_name", "ASC"]],
      }),
    ]);
    // console.log(jobProfiles);

    return res.status(200).json({
      jobProfiles: jobProfiles.map((jp) => jp.dataValues.jobProfile),
      cityChoices: cityChoices.map((c) => c.dataValues.cityChoice),
      job_types: job_types.map((jt) => jt.job_type),
      candidate_preferences: candidate_preferences.map(
        (cp) => cp.candidate_preferences
      ),
      salaryRanges: salaryRanges[0],
      company_names: company_names.map((cn) => cn.company_name),
    });
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// filter job post
const normalize = (str) =>
  typeof str === "string" ? str.trim().toLowerCase() : "";

exports.filterJobPosts = async (req, res) => {
  try {
    const {
      jobProfile,
      cityChoice,
      job_type,
      candidate_preferences,
      stipend_min,
      stipend_max,
      company_name,
      limit = 10,
      offset = 0,
    } = req.query;

    const whereConditions = {};

    // if (jobProfile) {
    //   whereConditions.jobProfile = where(
    //     fn('LOWER', col('jobProfile')),
    //     {
    //       [Op.like]: `%${normalize(jobProfile)}%`
    //     }
    //   );
    // }

    if (jobProfile) {
      whereConditions["$JobRole.title$"] = {
        [Op.like]: `%${normalize(jobProfile.toLowerCase())}%`,
      };
    }

    if (cityChoice) {
      whereConditions.cityChoice = where(fn("LOWER", col("cityChoice")), {
        [Op.like]: `%${normalize(cityChoice)}%`,
      });
    }

    if (job_type) {
      whereConditions.job_type = where(fn("LOWER", col("job_type")), {
        [Op.like]: `%${normalize(job_type)}%`,
      });
    }

    if (candidate_preferences) {
      whereConditions.candidate_preferences = where(
        fn("LOWER", col("candidate_preferences")),
        {
          [Op.like]: `%${normalize(candidate_preferences)}%`,
        }
      );
    }

    if (stipend_min && stipend_max) {
      whereConditions.stipend_min = { [Op.gte]: Number(stipend_min) };
      whereConditions.stipend_max = { [Op.lte]: Number(stipend_max) };
    } else if (stipend_min) {
      whereConditions.stipend_min = { [Op.gte]: Number(stipend_min) };
    } else if (stipend_max) {
      whereConditions.stipend_max = { [Op.lte]: Number(stipend_max) };
    }

    const companyInclude = {
      model: CompanyRecruiterProfile,
      attributes: ["company_name"],
    };

    if (company_name) {
      companyInclude.where = where(
        fn("LOWER", col("CompanyRecruiterProfile.company_name")),
        {
          [Op.like]: `%${normalize(company_name)}%`,
        }
      );
    }

    const jobPosts = await JobPost.findAll({
      where: whereConditions,
      include: [companyInclude],
      order: [["job_id", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const totalCount = await JobPost.count({
      where: whereConditions,
      include: company_name ? [companyInclude] : [],
    });

    return res.status(200).json({ jobPosts, totalCount });
  } catch (error) {
    console.error("Error filtering job posts:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Helper: Calculate total experience in years
const calculateTotalExperience = (experiences) => {
  if (!experiences || experiences.length === 0) return 0;

  let totalMonths = 0;
  experiences.forEach((exp) => {
    const start = new Date(exp.start_date);
    const end = exp.end_date ? new Date(exp.end_date) : new Date();
    totalMonths +=
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
  });
  return parseFloat((totalMonths / 12).toFixed(1));
};

// Helper: Safe string match
const matchesPattern = (text, pattern) => {
  if (!text || !pattern) return false;
  return text.toLowerCase().includes(pattern.toLowerCase());
};



exports.getApplicantsForJob = async (req, res) => {
  try {
    const { job_post_id } = req.params;
    const {
      location,
      skills,
      matchMin = 0,
      matchMax = 100,
      gender,
      gradYears,
      educationBackground,
      assignmentStatus,
      interviewStatus,
      status,
    } = req.query;

    if (!job_post_id) {
      return res.status(400).json({ message: "Job post ID is required." });
    }

    if (req.user.role === "COMPANY") {
      const access = await hasJobAccess(req.user.id, job_post_id);
      if (!access.hasAccess || !["edit", "manage"].includes(access.level)) {
        return res.status(403).json({
          success: false,
          message: "Insufficient permissions to view applicants for this job.",
        });
      }
    }

    const jobPost = await JobPost.findOne({ where: { job_id: job_post_id } });
    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found." });
    }

    // Determine company and GST verification status
    const scope = await AccessScope.findOne({
      where: {
        id: req.user.scopeId,
        scope_type: "COMPANY",
      },
    });

    if (!scope) {
      return res.status(400).json({ message: "No active company" });
    }

    const company = await CompanyRecruiterProfile.findOne({
      where: { id: scope.scope_id },
      attributes: ['is_gst_verified'],
    });

    if (!company) {
      return res.status(400).json({ message: "Company profile not found" });
    }

    // Check if job is paid
    const isPaidJob = jobPost.payment_type === 'one_time' || jobPost.payment_type === 'subscription';
    const isGstVerified = !!company.is_gst_verified;

    let maxApplicants = null;
    if (!isPaidJob) {
      maxApplicants = isGstVerified ? 15 : 5;
    }

    const jobSkillRelations = await JobPostSkill.findAll({
      where: { job_post_id: parseInt(job_post_id, 10) },
      include: [{ model: Skill, as: 'Skill' }],
      attributes: ['type'],
      raw: false,
    });

    let statusFilter = null;
    if (status) {
      const inputStatuses = status.split(",").map((s) => s.trim());
      const invalidStatuses = inputStatuses.filter((s) => !VALID_STATUSES.includes(s));
      if (invalidStatuses.length > 0) {
        return res.status(400).json({
          message: "Invalid application status(es) provided.",
          allowed_statuses: VALID_STATUSES,
          invalid_values: invalidStatuses,
        });
      }
      statusFilter = inputStatuses;
    }

    const skillList = skills
      ? skills
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
      : [];
    const gradYearSet = gradYears
      ? new Set(
        gradYears
          .split(",")
          .map((y) => {
            const num = parseInt(y.trim(), 10);
            return isNaN(num) ? null : num;
          })
          .filter(Boolean)
      )
      : null;
    const eduBgPattern = educationBackground
      ? educationBackground.trim()
      : null;

    const applications = await Application.findAll({
      where: {
        job_post_id,
        ...(statusFilter ? { status: { [Op.in]: statusFilter } } : {}),
      },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: UserDetail,
          as: "user",
          include: [
            { model: Location, as: "currentLocation", attributes: ["name"] },
            {
              model: Experience,
              as: "experiences",
              attributes: ["start_date", "end_date"],
            },
            {
              model: User,
              attributes: ["uuid", "first_name", "last_name", "email", "phone"],
              include: [
                {
                  model: UserSkill,
                  attributes: ["id", "skill"],
                  include: [
                    { model: Skill, as: "Skill", attributes: ["skill_name"] },
                  ],
                },
              ],
            },
            {
              model: Education,
              as: "userEducations",
              attributes: ["end_date", "level"],
              include: [
                { model: Course, as: "educationCourse", attributes: ["name"] },
                {
                  model: Specialization,
                  as: "educationSpecialization",
                  attributes: ["name"],
                },
              ],
            },
          ],
        },
        { model: Assignment, as: "assignments", attributes: ["id"] },
        { model: InterviewInvitation, as: "interviews", attributes: ["id"] },
      ],
      ...(maxApplicants !== null && { limit: maxApplicants }),
    });

    if (!applications.length) {
      return res.status(200).json({ applicants: [] });
    }

    const filteredApplicants = applications
      .map((app) => {
        const userDetail = app.user;
        if (!userDetail || !userDetail.User) return null;

        const user = userDetail.User;
        const currentLocation = userDetail.currentLocation?.name || "";
        const genderVal = userDetail.gender;
        const experiences = userDetail.experiences || [];

        const userSkillsRaw = user.UserSkills || [];
        const skillMatch = getDetailedSkillMatch(jobSkillRelations, userSkillsRaw);
        const matchPercentage = skillMatch.matchPercentage || 0;
        const mandatorySkillsMet = skillMatch.passedMustHave || false;

        if (matchPercentage < matchMin || matchPercentage > matchMax) {
          return null;
        }

        const gradYearsList = (userDetail.userEducations || [])
          .map((edu) => {
            if (!edu.end_date) return null;
            return new Date(edu.end_date).getFullYear();
          })
          .filter(Boolean);

        const eduBackgrounds = (userDetail.userEducations || []).map((edu) => {
          const parts = [
            edu.level,
            edu.educationCourse?.name,
            edu.educationSpecialization?.name,
          ].filter(Boolean);
          return parts.join(" ").toLowerCase();
        });

        const hasAssignment = (app.assignments || []).length > 0;
        const hasInterview = (app.interviews || []).length > 0;

        if (location && !matchesPattern(currentLocation, location)) return null;
        if (gender && genderVal !== gender) return null;
        if (
          skillList.length &&
          !skillList.every((skill) =>
            userSkillsRaw
              .map(us => us.Skill?.skill_name?.toLowerCase())
              .filter(Boolean)
              .includes(skill)
          )
        )
          return null;
        if (gradYearSet && !gradYearsList.some((y) => gradYearSet.has(y))) return null;
        if (
          eduBgPattern &&
          !eduBackgrounds.some((bg) => matchesPattern(bg, eduBgPattern))
        )
          return null;
        if (assignmentStatus === "sent" && !hasAssignment) return null;
        if (assignmentStatus === "not_sent" && hasAssignment) return null;
        if (interviewStatus === "scheduled" && !hasInterview) return null;
        if (interviewStatus === "not_scheduled" && hasInterview) return null;

        return {
          application_id: app.id,
          user_id: app.user_id,
          uuid: user.uuid,
          name: `${user.first_name} ${user.last_name}`.trim(),
          currentLocation,
          totalExperience: calculateTotalExperience(experiences),
          experiences: experiences.map((exp) => ({
            jobTitle: exp.jobRole?.name || "Not specified",
            company:
              exp.companyRecruiterProfile?.company_name ||
              exp.organization_name ||
              "Not specified",
            duration: `${exp.start_date} to ${exp.end_date || "Present"}`,
          })),
          skills: userSkillsRaw
            .map(us => us.Skill?.skill_name)
            .filter(Boolean)
            .map(s => s.charAt(0).toUpperCase() + s.slice(1)),
          skillMatchPercentage: matchPercentage,
          mandatorySkillsMet: mandatorySkillsMet,
          preferredSkillMatch: matchPercentage,
          appliedDate: app.created_at
            ? app.created_at.toISOString().split("T")[0]
            : "Unknown",
          status: app.status,
        };
      })
      .filter(Boolean);

    return res.status(200).json({ applicants: filteredApplicants });
  } catch (error) {
    console.error("[ERROR] getApplicantsForJob:", error);
    return res.status(500).json({
      message: "Failed to fetch applicants",
      error: error.message,
    });
  }
};

// GET /api/jobs/preview?post_type=active&opportunity_type=internship
exports.getJobPostingPreview = async (req, res) => {
  const { post_type, opportunity_type } = req.query;
  const user_id = req.user.id;

  // Validate post_type
  if (!["active", "future", "college"].includes(post_type)) {
    return res.status(400).json({ error: "Invalid post_type" });
  }

  const scope = await AccessScope.findOne({
    where: {
      id: req.user.scopeId,
      scope_type: "COMPANY",
    },
  });

  if (!scope) {
    return res.status(400).json({ message: "No active company" });
  }

  // Get company
  const company = await CompanyRecruiterProfile.findOne({
    where: { id: scope.scope_id },
    include: [
      {
        model: CompanySubscription,
        as: "subscriptions",
        where: { status: ["active"] },
        include: [{ model: Plan, as: "plan" }],
        order: [["created_at", "DESC"]],
        required: false,
      },
    ],
  });

  if (!company) {
    return res.status(404).json({ error: "Company profile not found" });
  }

  const context = await getPostingContext(
    company.id,
    post_type,
    opportunity_type
  );

  return res.status(200).json({ success: true, ...context });
};

exports.createJobPost = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      await t.rollback();
      return res
        .status(401)
        .json({ message: "Unauthorized. User ID not found." });
    }

    const scope = await AccessScope.findOne({
      where: {
        id: req.user.scopeId,
        scope_type: "COMPANY",
      },
    });

    if (!scope) {
      return res.status(400).json({ message: "No active company" });
    }

    const {
      opportunity_type,
      post_type,
      job_role_id,
      other_job_role,
      skill_ids = [],
      other_skills = [],
      eligiblecity_ids = [],
      other_eligible_city_names = [],
      eligiblecollege_ids = [],
      other_eligible_college_names = [],
      eligiblecourse_ids = [],
      other_eligible_course_names = [],
      duration_id,
      other_duration,
      job_type,
      days_in_office,
      job_time,
      number_of_openings,
      job_description,
      candidate_preferences,
      women_preferred,
      stipend_type,
      stipend_min,
      stipend_max,
      incentive_per_year,
      perks,
      screening_questions,
      phone_contact,
      alternate_phone_number,
      is_custom_internship_date,
      internship_from_date,
      internship_to_date,
      minSkillMatchRequired,
      job_status,
      active_status: providedActiveStatus,

      project_start_date,
      project_end_date,

      eligible_education_levels = [],
      eligible_specialization_ids = [],
      other_eligible_specializations = [],
      include_pursuing_students = false,
      experience_required = false,
      experience_min = null,
      experience_max = null,
      experience_types = [],
    } = req.body;

    if (!post_type || !["active", "future", "college"].includes(post_type)) {
      await t.rollback();
      return res.status(400).json({
        message: "post_type is required ('active' or 'future' or 'college')",
      });
    }

    //educcation and experince validation checks
    // ====== Validate Education & Experience ======
    if (experience_required) {
      if (experience_min == null || experience_min < 0) {
        await t.rollback();
        return res.status(400).json({
          message:
            "experience_min is required and must be ≥ 0 when experience is required.",
        });
      }
      if (experience_max != null && experience_max < experience_min) {
        await t.rollback();
        return res.status(400).json({
          message: "experience_max must be ≥ experience_min.",
        });
      }
    }

    // Optional: validate education levels against allowed list
    const ALLOWED_EDU_LEVELS = [
      "10th",
      "12th",
      "diploma",
      "bachelors",
      "masters",
      "phd",
      "other",
    ];
    const invalidLevels = eligible_education_levels.filter(
      (l) => !ALLOWED_EDU_LEVELS.includes(l)
    );
    if (invalidLevels.length > 0) {
      await t.rollback();
      return res.status(400).json({
        message: `Invalid education levels: ${invalidLevels.join(", ")}`,
        valid_levels: ALLOWED_EDU_LEVELS,
      });
    }

    // Optional: validate experience types
    const ALLOWED_EXP_TYPES = [
      "full_time",
      "internship",
      "freelance",
      "research",
      "volunteer",
    ];
    const invalidExpTypes = experience_types.filter(
      (t) => !ALLOWED_EXP_TYPES.includes(t)
    );
    if (invalidExpTypes.length > 0) {
      await t.rollback();
      return res.status(400).json({
        message: `Invalid experience types: ${invalidExpTypes.join(", ")}`,
        valid_types: ALLOWED_EXP_TYPES,
      });
    }

    //=================now resolve the active status based on payment and typeof post type
    //if draft post then value is 0 else jsut set to 2(inactive)
    let active_status_value = 2;

    const parsed = parseInt(providedActiveStatus, 10);
    if (parsed === 0) active_status_value = 0; //draft posted

    console.log("the actives status value", active_status_value);

    // ====== Validate critical fields ======
    if (!job_role_id && !other_job_role?.trim()) {
      await t.rollback();
      return res.status(400).json({ message: "Job role is required." });
    }

    // ====== Fetch recruiter profile ======
    const companyRecruiterProfile = await CompanyRecruiterProfile.findOne({
      where: { id: scope.scope_id },
      transaction: t,
    });
    if (!companyRecruiterProfile) {
      await t.rollback();
      return res
        .status(400)
        .json({ message: "Company recruiter profile not found." });
    }

    // ====== 1. Job Role ======
    let resolvedJobRoleId = job_role_id;
    if (job_role_id === null && other_job_role?.trim()) {
      const title = toSentenceCase(other_job_role.trim());

      // Set status: 2 for Projects, 1 (or default) for Jobs/Internships
      const defaults = { title };
      if (opportunity_type === "Project") {
        defaults.status = 2; // Mark as project title
      }
      const [jobRole] = await JobRole.findOrCreate({
        where: { title },
        defaults: { title },
        transaction: t,
      });
      resolvedJobRoleId = jobRole.id;
    } else if (job_role_id && job_role_id > 0) {
      const exists = await JobRole.findByPk(job_role_id, { transaction: t });
      if (!exists)
        throw new Error(`Job role ID ${job_role_id} does not exist.`);
    }

    // ====== 2. Duration (Internship only) ======
    let resolvedDurationId = duration_id;
    if (
      opportunity_type === "Internship" &&
      duration_id === null &&
      other_duration?.trim()
    ) {
      const value = toSentenceCase(other_duration.trim());
      const [filterOption] = await FilterOption.findOrCreate({
        where: { category: "duration", value },
        defaults: { category: "duration", value },
        transaction: t,
      });
      resolvedDurationId = filterOption.id;
    }

    // ====== 3. Cities ======
    const cityIdsSet = new Set(eligiblecity_ids);
    for (const name of other_eligible_city_names) {
      if (!name?.trim()) continue;
      const normalizedName = toSentenceCase(name.trim());
      const [city] = await Location.findOrCreate({
        where: { name: normalizedName },
        defaults: { name: normalizedName },
        transaction: t,
      });
      cityIdsSet.add(city.id);
    }
    const allCityIds = Array.from(cityIdsSet);

    // ====== 4. Colleges ======
    const collegeIdsSet = new Set(eligiblecollege_ids);
    for (const name of other_eligible_college_names) {
      if (!name?.trim()) continue;
      const normalizedName = toSentenceCase(name.trim());
      const [college] = await SchoolCollege.findOrCreate({
        where: { name: normalizedName },
        defaults: { name: normalizedName },
        transaction: t,
      });
      collegeIdsSet.add(college.id);
    }
    const allCollegeIds = Array.from(collegeIdsSet);

    // ====== 5. Courses ======
    const courseIdsSet = new Set(eligiblecourse_ids);
    for (const name of other_eligible_course_names) {
      if (!name?.trim()) continue;
      const normalizedName = toSentenceCase(name.trim());
      const [course] = await Course.findOrCreate({
        where: { name: normalizedName },
        defaults: { name: normalizedName },
        transaction: t,
      });
      courseIdsSet.add(course.id);
    }
    const allCourseIds = Array.from(courseIdsSet);

    // ====== 6. Skills (Domain-aware) ======
    // const skillIdsSet = new Set(skill_ids);
    // for (const entry of other_skills) {
    //   if (!entry?.domain?.trim() || !entry?.skill?.trim()) continue;

    //   const domainName = toSentenceCase(entry.domain.trim());
    //   const skillName = toSentenceCase(entry.skill.trim());

    //   // Create or find Domain
    //   const [domain] = await Domain.findOrCreate({
    //     where: { domain_name: domainName },
    //     defaults: { domain_name: domainName },
    //     transaction: t,
    //   });

    //   console.log("doain", domain);

    //   // Create or find Skill under domain
    //   const [skill] = await Skill.findOrCreate({
    //     where: { skill_name: skillName, domain_id: domain.domain_id },
    //     defaults: { skill_name: skillName, domain_id: domain.domain_id },
    //     transaction: t,
    //   });

    //   skillIdsSet.add(skill.skill_id);
    // }
    // const allSkillIds = Array.from(skillIdsSet);

    // ====== Validate Project-specific fields ======
    if (opportunity_type === "Project") {
      if (!project_start_date || !project_end_date) {
        await t.rollback();
        return res.status(400).json({
          message:
            "For Project-type posts, both project_start_date and project_end_date are required.",
        });
      }

      // Optional: validate date format & logic
      const startDate = new Date(project_start_date);
      const endDate = new Date(project_end_date);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: "Invalid date format. Use YYYY-MM-DD." });
      }

      if (startDate > endDate) {
        await t.rollback();
        return res.status(400).json({
          message: "project_start_date cannot be after project_end_date.",
        });
      }
    }



    // ====== HANDLE DRAFT UPDATE vs NEW CREATE ======
let isDraftUpdate = false;
let existingJobPost = null;

// If job_id is provided, check if it's a draft we should update
if (req.body.job_id) {
  const draftJob = await JobPost.findOne({
    where: {
      job_id: req.body.job_id,
      company_recruiter_profile_id: companyRecruiterProfile.id,
      active_status: 0, // Only allow updating drafts
    },
    transaction: t,
  });

  if (draftJob) {
    isDraftUpdate = true;
    existingJobPost = draftJob;
    console.log(`Updating draft job ${draftJob.job_id}`);
  } else {
    // job_id provided but not a draft - this is duplicate/convert flow
    // Ignore the job_id and create a new job
    console.log(`job_id ${req.body.job_id} is not a draft - creating new job for duplicate/convert flow`);
  }
}

    // ====== 7. Create JobPost ======
    // const jobPost = await JobPost.create(
    //   {
    //     company_recruiter_profile_id: companyRecruiterProfile.id,
    //     opportunity_type,
    //     post_type,
    //     job_role_id: resolvedJobRoleId,
    //     job_type: allCityIds.length === 0 ? "Remote" : job_type,
    //     days_in_office: job_type === "Remote" ? null : days_in_office,
    //     job_time,
    //     number_of_openings,
    //     job_description,
    //     candidate_preferences: candidate_preferences || null,
    //     women_preferred: women_preferred || false,
    //     stipend_type,
    //     stipend_min: stipend_type === "Unpaid" ? null : stipend_min,
    //     stipend_max: stipend_type === "Unpaid" ? null : stipend_max,
    //     incentive_per_year: incentive_per_year || null,
    //     perks: Array.isArray(perks)
    //       ? perks
    //       : perks?.split(",").map((p) => p.trim()) || [],
    //     screening_questions: Array.isArray(screening_questions)
    //       ? screening_questions
    //       : typeof screening_questions === "string"
    //       ? screening_questions
    //           .split("\n")
    //           .map((q) => q.trim())
    //           .filter(Boolean)
    //       : [],
    //     phone_contact,
    //     alternate_phone_number: alternate_phone_number || null,
    //     duration_id: resolvedDurationId,
    //     internship_start_date: is_custom_internship_date
    //       ? internship_from_date
    //       : new Date().toISOString().split("T")[0],
    //     internship_from_date: is_custom_internship_date
    //       ? internship_from_date
    //       : null,
    //     internship_to_date: is_custom_internship_date
    //       ? internship_to_date
    //       : null,
    //     is_custom_internship_date: !!is_custom_internship_date,
    //     active_status: active_status_value,
    //     min_skill_match_required: minSkillMatchRequired || 0,

    //     project_start_date:
    //       opportunity_type === "Project" ? project_start_date : null,
    //     project_end_date:
    //       opportunity_type === "Project" ? project_end_date : null,

    //     //education  and experince new

    //     eligible_education_levels: Array.isArray(eligible_education_levels)
    //       ? eligible_education_levels
    //       : [],
    //     eligible_specialization_ids: Array.isArray(eligible_specialization_ids)
    //       ? eligible_specialization_ids
    //       : [],
    //     other_eligible_specializations: Array.isArray(
    //       other_eligible_specializations
    //     )
    //       ? other_eligible_specializations
    //           .map((s) => toSentenceCase(s.trim()))
    //           .filter(Boolean)
    //       : [],
    //     include_pursuing_students: !!include_pursuing_students,
    //     experience_required: !!experience_required,
    //     experience_min: experience_required ? experience_min || 0 : null,
    //     experience_max:
    //       experience_required && experience_max != null ? experience_max : null,
    //     experience_types: Array.isArray(experience_types)
    //       ? experience_types
    //       : [],
    //   },
    //   { transaction: t }
    // );




    // ====== 7. Create or Update JobPost ======
const jobPost = isDraftUpdate 
  ? await existingJobPost.update({
      // Update all fields (same structure as create)
      // company_recruiter_profile_id: companyRecruiterProfile.id,
      opportunity_type,
      post_type,
      job_role_id: resolvedJobRoleId,
      job_type: allCityIds.length === 0 ? "Remote" : job_type,
      days_in_office: job_type === "Remote" ? null : days_in_office,
      job_time,
      number_of_openings,
      job_description,
      candidate_preferences: candidate_preferences || null,
      women_preferred: women_preferred || false,
      stipend_type,
      stipend_min: stipend_type === "Unpaid" ? null : stipend_min,
      stipend_max: stipend_type === "Unpaid" ? null : stipend_max,
      incentive_per_year: incentive_per_year || null,
      perks: Array.isArray(perks)
        ? perks
        : perks?.split(",").map((p) => p.trim()) || [],
      screening_questions: Array.isArray(screening_questions)
        ? screening_questions
        : typeof screening_questions === "string"
        ? screening_questions
            .split("\n")
            .map((q) => q.trim())
            .filter(Boolean)
        : [],
      phone_contact,
      alternate_phone_number: alternate_phone_number || null,
      duration_id: resolvedDurationId,
      internship_start_date: is_custom_internship_date
        ? internship_from_date
        : new Date().toISOString().split("T")[0],
      internship_from_date: is_custom_internship_date
        ? internship_from_date
        : null,
      internship_to_date: is_custom_internship_date
        ? internship_to_date
        : null,
      is_custom_internship_date: !!is_custom_internship_date,
      active_status: active_status_value,
      min_skill_match_required: minSkillMatchRequired || 0,
      project_start_date: opportunity_type === "Project" ? project_start_date : null,
      project_end_date: opportunity_type === "Project" ? project_end_date : null,
      eligible_education_levels: Array.isArray(eligible_education_levels)
        ? eligible_education_levels
        : [],
      eligible_specialization_ids: Array.isArray(eligible_specialization_ids)
        ? eligible_specialization_ids
        : [],
      other_eligible_specializations: Array.isArray(other_eligible_specializations)
        ? other_eligible_specializations
            .map((s) => toSentenceCase(s.trim()))
            .filter(Boolean)
        : [],
      include_pursuing_students: !!include_pursuing_students,
      experience_required: !!experience_required,
      experience_min: experience_required ? experience_min || 0 : null,
      experience_max: experience_required && experience_max != null ? experience_max : null,
      experience_types: Array.isArray(experience_types) ? experience_types : [],
    }, { transaction: t })
  : await JobPost.create({
      company_recruiter_profile_id: companyRecruiterProfile.id,
      // ... same fields as above for create
      opportunity_type,
      post_type,
      job_role_id: resolvedJobRoleId,
      job_type: allCityIds.length === 0 ? "Remote" : job_type,
      days_in_office: job_type === "Remote" ? null : days_in_office,
      job_time,
      number_of_openings,
      job_description,
      candidate_preferences: candidate_preferences || null,
      women_preferred: women_preferred || false,
      stipend_type,
      stipend_min: stipend_type === "Unpaid" ? null : stipend_min,
      stipend_max: stipend_type === "Unpaid" ? null : stipend_max,
      incentive_per_year: incentive_per_year || null,
      perks: Array.isArray(perks)
        ? perks
        : perks?.split(",").map((p) => p.trim()) || [],
      screening_questions: Array.isArray(screening_questions)
        ? screening_questions
        : typeof screening_questions === "string"
        ? screening_questions
            .split("\n")
            .map((q) => q.trim())
            .filter(Boolean)
        : [],
      phone_contact,
      alternate_phone_number: alternate_phone_number || null,
      duration_id: resolvedDurationId,
      internship_start_date: is_custom_internship_date
        ? internship_from_date
        : new Date().toISOString().split("T")[0],
      internship_from_date: is_custom_internship_date
        ? internship_from_date
        : null,
      internship_to_date: is_custom_internship_date
        ? internship_to_date
        : null,
      is_custom_internship_date: !!is_custom_internship_date,
      active_status: active_status_value,
      min_skill_match_required: minSkillMatchRequired || 0,
      project_start_date: opportunity_type === "Project" ? project_start_date : null,
      project_end_date: opportunity_type === "Project" ? project_end_date : null,
      eligible_education_levels: Array.isArray(eligible_education_levels)
        ? eligible_education_levels
        : [],
      eligible_specialization_ids: Array.isArray(eligible_specialization_ids)
        ? eligible_specialization_ids
        : [],
      other_eligible_specializations: Array.isArray(other_eligible_specializations)
        ? other_eligible_specializations
            .map((s) => toSentenceCase(s.trim()))
            .filter(Boolean)
        : [],
      include_pursuing_students: !!include_pursuing_students,
      experience_required: !!experience_required,
      experience_min: experience_required ? experience_min || 0 : null,
      experience_max: experience_required && experience_max != null ? experience_max : null,
      experience_types: Array.isArray(experience_types) ? experience_types : [],
    }, { transaction: t });

    // ====== 8. Attach associations ======
    // if (allSkillIds.length > 0) {
    //   await jobPost.addSkills(allSkillIds, { transaction: t });
    // }

    const jobPostSkillsToInsert = [];

    //  Legacy: plain skill_ids array (backward compat)
    for (const id of skill_ids) {
      if (Number.isInteger(id) && id > 0) {
        jobPostSkillsToInsert.push({
          job_post_id: jobPost.job_id,
          skill_id: id,
          type: "preferred",
          min_experience_months: null,
        });
      }
    }

    // B. Structured skills: { skill_id, type, min_experience_months }
    if (Array.isArray(req.body.skills)) {
      for (const item of req.body.skills) {
        if (
          item &&
          Number.isInteger(item.skill_id) &&
          item.skill_id > 0 &&
          ["must_have", "preferred"].includes(item.type)
        ) {

          // Validate min_experience_months
      let expMonths = null;
      if (item.min_experience_months != null) {
        const num = parseInt(item.min_experience_months, 10);
        if (!isNaN(num) && num >= 0 && num <= 360) {
          expMonths = num;
        }
      }
          jobPostSkillsToInsert.push({
            job_post_id: jobPost.job_id,
            skill_id: item.skill_id,
            type: item.type,
            min_experience_months:expMonths,
          });
        }
      }
    }

    //  C. other_skills (with domain + skill creation)
    for (const entry of other_skills) {
      if (!entry?.domain?.trim() || !entry?.skill?.trim()) continue;

      const domainName = toSentenceCase(entry.domain.trim());
      const skillName = toSentenceCase(entry.skill.trim());
      const type = ["must_have", "preferred"].includes(entry.type)
        ? entry.type
        : "preferred";

         // Validate min_experience_months
    let expMonths = null;
    if (entry.min_experience_months != null) {
      const num = parseInt(entry.min_experience_months, 10);
      if (!isNaN(num) && num >= 0 && num <= 360) {
        expMonths = num;
      }
    }

      // Create/fetch domain
      const [domain] = await Domain.findOrCreate({
        where: { domain_name: domainName },
        defaults: { domain_name: domainName },
        transaction: t,
      });

      // Create/fetch skill under domain
      const [skill] = await Skill.findOrCreate({
        where: { skill_name: skillName, domain_id: domain.domain_id },
        defaults: { skill_name: skillName, domain_id: domain.domain_id },
        transaction: t,
      });

      jobPostSkillsToInsert.push({
        job_post_id: jobPost.job_id,
        skill_id: skill.skill_id,
        type,
        min_experience_months: expMonths,
      });
    }

    //  D. Bulk insert — only if there are skills
    if (jobPostSkillsToInsert.length > 0) {
      await JobPostSkill.bulkCreate(jobPostSkillsToInsert, {
        transaction: t,
        // updateOnDuplicate not needed if PK is (job_post_id, skill_id)
        // unless you want to allow updating type on retry
      });
    }

    if (allCityIds.length > 0) {
      await jobPost.addEligibleCities(allCityIds, { transaction: t });
    }
    if (allCollegeIds.length > 0) {
      await jobPost.addEligibleColleges(allCollegeIds, { transaction: t });
    }
    if (allCourseIds.length > 0) {
      await jobPost.addEligibleCourses(allCourseIds, { transaction: t });
    }

    // Auto-assign owner full access
    await JobAccess.create(
      {
        job_id: jobPost.job_id,
        user_id: req.user.id,
        access_level: "manage",
        assigned_by: req.user.id,
      },
      { transaction: t }
    );
    //====================================================================================================

    // ====== 9. Get ACTUAL college count from DB (safe) ======
    let collegeCount = 0;
    if (post_type === "college") {
      const attachedColleges = await jobPost.getEligibleColleges({
        attributes: ["id"],
        transaction: t,
        raw: true,
      });
      console.log("Attached collges", attachedColleges);
      collegeCount = attachedColleges.length;

      if (collegeCount === 0) {
        throw new Error("College-specific job must have at least one college");
      }
    }

    // ======  Subscription Logic  only when draft is not being posted ======
    let subscriptionContext = null;

    if (post_type === "future") {
      await jobPost.update(
        {
          payment_type: "free_promo", // distinct from regular "free"
          active_status: 2, // remains inactive until activation
          // is_ai_training_eligible: true,
          // updated_at: new Date(),
        },
        { transaction: t }
      );

      //  Optional: log for analytics (no payment_order needed)
      console.log(
        `[PROMO] Free future job created: ${jobPost.job_id} for AI training`
      );
    } else {
      if (jobPost.active_status) {
        if (post_type === "college") {
          // const creditResult = await useCollegeCreditsForJob({
          //   job: jobPost,
          //   company_id: companyRecruiterProfile.id,
          //   college_count: collegeCount,
          //   transaction: t,
          // });

          // if (creditResult) {
          //   subscriptionContext = {
          //     ...creditResult,
          //     action: "used_college_credits",
          //   };
          // }



          // Save job as draft, do NOT deduct credits yet
          await jobPost.update({
            active_status: 2, // inactive until published from checkout
            payment_type: null,
            subscription_id: null,
            college_ids: allCollegeIds // store snapshot
          }, { transaction: t });

          // await t.commit();

          // const jobPostWithDetails = await JobPost.findByPk(jobPost.job_id, {
          //   include: [
          //     { model: SchoolCollege, as: "eligibleColleges", attributes: ["id", "name"], through: { attributes: [] } },
          //     { model: Course, as: "eligibleCourses", attributes: ["id", "name"], through: { attributes: [] } },
          //     { model: Location, as: "eligibleCities", attributes: ["id", "name"], through: { attributes: [] } },
          //   ],
          // });

          // return res.status(201).json({
          //   message: "Job saved. Proceed to college checkout.",
          //   data: jobPostWithDetails,
          //   checkout: {
          //     action: "redirect_to_one_time",
          //     job_id: jobPost.job_id,
          //     college_count: allCollegeIds.length,
          //     url: `/recruiter/checkout/college-specific?job_id=${jobPost.job_id}`
          //   }
          // });
  
          //else fallback to one time
        } else {
          //  Try to use subscription (deduct credits NOW)
          // const result = await useSubscriptionForJob({
          //   job: jobPost,
          //   company_id: companyRecruiterProfile.id,
          //   post_type,
          //   transaction: t,
          // });

          // if (result) {
          //   subscriptionContext = result;
          // }



          // Keep as draft until user selects plan
          await jobPost.update({
            active_status: 2,
            payment_type: null,
            subscription_id: null,
            purchase_id: null,
          }, { transaction: t });
        }
      }
    }
    await t.commit();

    // ====== 9. Respond ======
    const jobPostWithDetails = await JobPost.findByPk(jobPost.job_id, {
      include: [
        {
          model: SchoolCollege,
          as: "eligibleColleges",
          attributes: ["id", "name"],
          through: { attributes: [] },
          required: false,
        },
        {
          model: Course,
          as: "eligibleCourses",
          attributes: ["id", "name"],
          through: { attributes: [] },
          required: false,
        },
        {
          model: Location,
          as: "eligibleCities",
          attributes: ["id", "name"],
          through: { attributes: [] },
          required: false,
        },
        {
          association: "skills",
          attributes: ["skill_id"],
          through: { attributes: [] },
        },
      ],
      attributes: { exclude: ["user_id"] },
    });

    //  If FUTURE + PROMO → success with free status
    if (post_type === "future") {
      return res.status(201).json({
        message: "Future type posting saved  (free for 1 year)",
        data: jobPostWithDetails,
        status: "inactive_free_promo",
        activation_url: `/jobs/${jobPost.job_id}/activate`, // frontend can build this
      });
    }

    //  If used subscription: return job + credits remaining
    if (subscriptionContext) {
      return res.status(201).json({
        message: "Job Posted Successfully Subscription credit used.",
        data: jobPostWithDetails,
        subscription: {
          ...subscriptionContext,
          action: "used_subscription",
        },
      });
    }

    //  Else: return data to redirect to one-time
    const { totalAmount } = calculatePrice(
      post_type,
      post_type === "college" ? collegeCount : 0
    );

    return res.status(201).json({
      message: "Job saved (draft). Proceed to one-time payment.",
      data: jobPostWithDetails,
      payment: {
        action: "redirect_to_one_time",
        job_id: jobPost.job_id,
        post_type,
        amount: totalAmount,
        checkout_url: `/checkout/one-time?job_id=${jobPost.job_id}&post_type=${post_type}&amount=${totalAmount}`,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error("createJobPost error:", error);
    return res.status(500).json({
      message: "Failed to create job post.",
      error: error.message,
    });
  }
};

























// POST /api/jobs/:jobId/select-plan
exports.selectJobPostingPlan = async (req, res) => {
  const { jobId } = req.params;
  const { plan } = req.body; // "free" or "one_time"
  const userId = req.user.id;

  if (!["free", "one_time"].includes(plan)) {
    return res.status(400).json({ error: "Invalid plan. Use 'free' or 'one_time'." });
  }

  const t = await sequelize.transaction();
  try {
    const job = await JobPost.findOne({
      where: { job_id: jobId, post_type: "active" },
      include: [{ model: CompanyRecruiterProfile}]
    });

    if (!job) {
      await t.rollback();
      return res.status(400).json({ error: "Job not found " });
    }

    const company_id = job.company_recruiter_profile_id;

    if (plan === "free") {
      // Activate as free job
      await job.update({
        payment_type: "free",
        active_status: 1,
        payment_status: "free", // if you added this column
      }, { transaction: t });

      await t.commit();
      return res.json({ success: true, status: "active", payment_type: "free" });

    } else if (plan === "one_time") {
      // Calculate price
      const { totalAmount } = calculatePrice("active");

      // Update job to mark as one_time (pending payment)
      await job.update({
        payment_type: "free",
        active_status: 2, // remains draft until paid
        payment_status: "pending", // if using payment_status
      }, { transaction: t });

      await t.commit();

      return res.json({
        success: true,
        action: "proceed_to_payment",
        amount: totalAmount,
        currency: "INR",
        checkout_url: `/checkout?job_id=${jobId}&amount=${totalAmount}`
      });
    }

  } catch (err) {
    await t.rollback();
    console.error("selectJobPostingPlan error:", err);
    return res.status(500).json({ error: "Failed to select plan" });
  }
};





exports.stopHiringForJob = async (req, res) => {
  try {
    const { job_post_id } = req.params;

    if (!job_post_id) {
      return res.status(400).json({ message: "Job post ID is required." });
    }

    // Ensure user is authenticated and is a COMPANY role
    if (!req.user || req.user.role !== "COMPANY") {
      return res.status(403).json({
        success: false,
        message: "Only company recruiters can perform this action.",
      });
    }

    // Verify job access with manage or edit level
    const access = await hasJobAccess(req.user.id, job_post_id);
    if (!access.hasAccess || !["edit", "manage"].includes(access.level)) {
      return res.status(403).json({
        success: false,
        message: "Insufficient permissions to modify this job post.",
      });
    }

    // Fetch the job post
    const jobPost = await JobPost.findOne({
      where: { job_id: job_post_id },
    });

    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found." });
    }

    // Optional: Prevent modifying already closed or future posts
    if (jobPost.job_status === 3) {
      return res.status(400).json({
        message: "This job post is already closed.",
      });
    }

    // if (jobPost.post_type === "future") {
    //   return res.status(400).json({
    //     message: "Future job posts cannot be closed. Please activate first.",
    //   });
    // }

    // Update job status to 3 (closed)
    await jobPost.update({
      job_status: 3,
      updated_at: new Date(),
    });

    // Optional: Notify applicants about job closure
    // try {
    //   const applications = await Application.findAll({
    //     where: { job_post_id },
    //     attributes: ["user_id"],
    //     raw: true,
    //   });

    //   const userIds = [...new Set(applications.map((a) => a.user_id))];

    //   if (userIds.length > 0) {
    //     await NotificationService.bulkCreate({
    //       notifications: userIds.map((uid) => ({
    //         user_id: uid,
    //         type: "JOB_CLOSED",
    //         title: "Job Posting Closed",
    //         message: `The job "${jobPost.job_role_id || "Unknown"}" you applied to has been closed by the recruiter.`,
    //         related_entity_type: "JobPost",
    //         related_entity_id: jobPost.job_id,
    //       })),
    //     });
    //   }
    // } catch (notifyErr) {
    //   console.warn("[WARN] Failed to send job closure notifications:", notifyErr.message);
    // }

    return res.status(200).json({
      success: true,
      message: "Hiring stopped successfully. Job post marked as closed.",
      data: {
        job_id: jobPost.job_id,
        job_status: 3,
        status_label: "Closed",
        updated_at: jobPost.updated_at,
      },
    });
  } catch (error) {
    console.error("[ERROR] stopHiringForJob:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update job status.",
      error: error.message,
    });
  }
};






































































































































































// // controllers/jobPostController.js
// const {
//   JobPost,
//   JobPostSkill,
//   Skill,
//   Domain,
//   Location,
//   SchoolCollege,
//   Course,
//   JobRole,
//   Duration,
//   sequelize,
// } = require("../models");
// const { Op } = require("sequelize");

// ============================================================================
//  RESPONSE STRUCTURE GUIDE (FOR FRONTEND MAPPING)
// ============================================================================
/**
 * Expected Response Format for Edit/Duplicate/Convert flows:
 * 
 * {
 *   success: true,
 *   data: {
 *     // === CORE IDENTIFIERS ===
 *     job_id: number,                    // For API updates (new ID on duplicate)
 *     post_type: "active"|"future"|"college",  // Controls pricing/visibility
 *     opportunity_type: "Internship"|"Job"|"Project",
 *     
 *     // === JOB ROLE (SearchableSelect expects {id, title}) ===
 *     job_role: { id: number, title: string } | null,  // For display + re-selection
 *     other_job_role: string | null,     // Custom role name if no job_role_id
 *     
 *     // === SKILLS (CRITICAL: DomainSkillsSelector format) ===
 *     domain_skills: [                   // EXACT format component expects
 *       {
 *         card_id: string,               // Unique: `card-${timestamp}-${random}`
 *         domain: { 
 *           id: number, name: string     // Predefined domain
 *         } | { 
 *           __custom: string             // Custom domain (key MUST be __custom)
 *         },
 *         skills: [
 *           {
 *             skill_id: number,          // Predefined skill
 *             skill_name: string,
 *             mustHave: boolean,
 *             min_experience_months: number|null
 *           } | {
 *             __custom: string,          // Custom skill (key MUST be __custom)
 *             mustHave: boolean,
 *             min_experience_months: number|null
 *           }
 *         ]
 *       }
 *     ],
 *     // Flat arrays for simple form binding (backward compatible)
 *     skill_ids: number[],               // Just IDs for methods.setValue()
 *     other_skills: [                    // Custom skills flat format
 *       { domain: string, skill: string, type: "must_have"|"preferred", min_experience_months: number|null }
 *     ],
 *     
 *     // === LOCATIONS (SearchableSelect expects {id, name}) ===
 *     eligible_cities: [{ id: number, name: string }],  // For display + re-selection
 *     other_eligible_city_names: string[],              // Custom city names
 *     
 *     // === COLLEGES (same pattern) ===
 *     eligible_colleges: [{ id: number, name: string }],
 *     other_eligible_college_names: string[],
 *     
 *     // === COURSES (same pattern) ===
 *     eligible_courses: [{ id: number, name: string }],
 *     other_eligible_course_names: string[],
 *     
 *     // === DURATION (Internship only) ===
 *     duration: { id: number, value: string } | null,   // For display
 *     other_duration: string | null,                     // Custom duration
 *     
 *     // === WORK DETAILS ===
 *     job_type: "In office"|"Hybrid"|"Remote",
 *     job_time: "Day Shift"|"Night Shift"|"Part-time",
 *     days_in_office: number|null,       // Only for Hybrid
 *     number_of_openings: number,
 *     
 *     // === DESCRIPTION & PREFERENCES ===
 *     job_description: string,
 *     candidate_preferences: string|null,
 *     women_preferred: boolean,
 *     
 *     // === COMPENSATION ===
 *     stipend_type: "Paid"|"Unpaid"|"Fixed"|"Variable",
 *     stipend_min: number|null,
 *     stipend_max: number|null,
 *     incentive_per_year: string|null,
 *     perks: string[],                   // Array of perk strings
 *     
 *     // === SCREENING ===
 *     screening_questions: string[],     // Array of question strings
 *     
 *     // === CONTACT ===
 *     phone_contact: string,             // 10-digit string
 *     alternate_phone_number: string|null,
 *     
 *     // === DATES (YYYY-MM-DD format for <input type="date">) ===
 *     is_custom_internship_date: boolean,
 *     internship_start_date: string|null,    // "YYYY-MM-DD" or null
 *     internship_from_date: string|null,
 *     internship_to_date: string|null,
 *     project_start_date: string|null,
 *     project_end_date: string|null,
 *     
 *     // === MATCHING ===
 *     minSkillMatchRequired: number|null,    // 0-100
 *     
 *     // === EDUCATION ===
 *     eligible_education_levels: string[],   // ["bachelors", "masters"]
 *     eligible_specializations: [            // {id, name} for SearchableSelect
 *       { id: number, name: string }
 *     ],
 *     other_eligible_specializations: string[],  // Custom spec names
 *     include_pursuing_students: boolean,
 *     
 *     // === EXPERIENCE ===
 *     experience_required: boolean,
 *     experience_min: number|null,
 *     experience_max: number|null,
 *     experience_types: string[],        // ["full_time", "internship"]
 *     
 *     // === STATUS & METADATA ===
 *     job_status: boolean,               // active_status !== 0
 *     created_at: string,                // ISO string
 *     updated_at: string,
 *   }
 * }
 */

// ============================================================================
//  HELPER: Transform JobPost → Frontend Edit Payload
// ============================================================================


const parseArrayField = (fieldValue) => {
  if (!fieldValue) return [];
  if (Array.isArray(fieldValue)) return fieldValue;
  if (typeof fieldValue === 'string') {
    try {
      const parsed = JSON.parse(fieldValue);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (e) {
      // Try comma-separated
      return fieldValue.split(',').map(item => item.trim()).filter(item => item);
    }
  }
  return [fieldValue];
};


const transformJobToEditPayload = async (job, models) => {
  // Fetch all associations in parallel for performance
  const [
    eligibleCities,
    eligibleColleges,
    eligibleCourses,
    jobRole,
    duration,
    jobPostSkills,
    specializationDomains,
  ] = await Promise.all([
    // Locations with id+name for SearchableSelect display
    job.getEligibleCities?.({ attributes: ["id", "name"] }) || [],

    // Colleges with id+name
    job.getEligibleColleges?.({ attributes: ["id", "name"] }) || [],

    // Courses with id+name
    job.getEligibleCourses?.({ attributes: ["id", "name"] }) || [],

    // Job role with id+title
    job.getJobRole?.({ attributes: ["id", "title"] }) || null,

    // Duration with id+value
    // Duration comes from FilterOption table where category = 'duration'
job.duration_id 
  ? await FilterOption.findOne({
      where: { 
        id: job.duration_id, 
        category: 'duration' 
      },
      attributes: ['id', 'value'],
      transaction: t, // if transaction is available
    }) || null
  : null,

    // Skills with domain info + metadata (type, min_experience)
    JobPostSkill.findAll({
      where: { job_post_id: job.job_id },
      include: [
        {
          model: Skill,
          as: "Skill",
          attributes: ["skill_id", "skill_name", "domain_id"],
          include: [
            {
              model: Domain,
              as: "domain",
              attributes: ["domain_id", "domain_name"],
            },
          ],
        },
      ],
      attributes: ["type", "min_experience_months"],
      // order: [[ "ASC"]], // Preserve original order
    }),

    // Specialization domains (used as eligible_specializations)
    job.eligible_specialization_ids?.length > 0
      ? Domain.findAll({
        where: { domain_id: job.eligible_specialization_ids },
        attributes: ["domain_id", "domain_name"],
      })
      : [],
  ]);

  // --------------------------------------------------------------------------
  //  TRANSFORM SKILLS → domain_skills (EXACT DomainSkillsSelector format)
  // --------------------------------------------------------------------------
  const domainGroup = new Map(); // Use Map for stable ordering

  jobPostSkills.forEach((jps) => {
    const skill = jps.Skill;
    if (!skill) return;

    const domainId = skill.domain?.domain_id || null;
    const domainName = skill.domain?.domain_name || "Uncategorized";

    // Create stable domain key: predefined by ID, custom by name+timestamp
    const domainKey = domainId
      ? `predefined_${domainId}`
      : `custom_${domainName}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Initialize domain card if not exists
    if (!domainGroup.has(domainKey)) {
      domainGroup.set(domainKey, {
        // card_id format MUST match frontend: `card-${timestamp}-${random}`
        card_id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        domain: domainId
          ? { id: domainId, name: domainName }  // Predefined: {id, name}
          : { __custom: domainName },            // Custom: {__custom: string} KEY MUST BE __custom
        skills: [],
      });
    }

    // Add skill to domain card
    const card = domainGroup.get(domainKey);

    if (skill.skill_id) {
      // Predefined skill: include skill_id + skill_name
      card.skills.push({
        skill_id: skill.skill_id,
        skill_name: skill.skill_name,
        mustHave: jps.type === "must_have",
        min_experience_months: jps.min_experience_months ?? null,
      });
    } else if (skill.skill_name) {
      // Custom skill: use __custom key (MUST match frontend expectation)
      card.skills.push({
        __custom: skill.skill_name,  // KEY MUST BE __custom for custom skills
        mustHave: jps.type === "must_have",
        min_experience_months: jps.min_experience_months ?? null,
      });
    }
  });

  // Convert Map to array for response
  const domain_skills = Array.from(domainGroup.values());

  // --------------------------------------------------------------------------
  //  BUILD FLAT skill_ids + other_skills (for backward compatibility)
  // --------------------------------------------------------------------------
  const skill_ids = [];
  const other_skills = [];

  jobPostSkills.forEach((jps) => {
    const skill = jps.Skill;
    if (!skill) return;

    if (skill.skill_id) {
      skill_ids.push(skill.skill_id);
    } else if (skill.skill_name) {
      const domainName = skill.domain?.domain_name || "Uncategorized";
      other_skills.push({
        domain: domainName,
        skill: skill.skill_name,
        type: jps.type,  // "must_have" or "preferred"
        min_experience_months: jps.min_experience_months ?? null,
      });
    }
  });

  // --------------------------------------------------------------------------
  //  HELPER FUNCTIONS FOR SAFE TRANSFORMATION
  // --------------------------------------------------------------------------

  // Safe number conversion: returns null for invalid/empty values
  const toNumberOrNull = (val) => {
    if (val == null || val === "") return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  };

  // Safe string: trim + return empty string for null/undefined
  const toString = (val) => {
    if (val == null) return "";
    return typeof val === "string" ? val.trim() : String(val);
  };

  // Format date to YYYY-MM-DD for <input type="date"> compatibility
  const formatDate = (date) => {
    if (!date) return null;
    try {
      return new Date(date).toISOString().split("T")[0];
    } catch {
      return null;
    }
  };

  // --------------------------------------------------------------------------
  //  BUILD SPECIALIZATIONS ARRAY ({id, name} for SearchableSelect)
  // --------------------------------------------------------------------------
  const specMap = Object.fromEntries(
    (specializationDomains || []).map(d => [d.domain_id, d.domain_name])
  );

  const eligible_specializations = [
    // Predefined specializations with {id, name}
    ...(Array.isArray(job.eligible_specialization_ids)
      ? job.eligible_specialization_ids
      : (typeof job.eligible_specialization_ids === 'string'
        ? JSON.parse(job.eligible_specialization_ids)
        : [])
    ).map(id => ({
      id,
      name: specMap[id] || `Specialization ${id}`, // Fallback name if not found
    })),
    // Custom specializations with {id: null, name}
   ...(Array.isArray(job.other_eligible_specializations) 
    ? job.other_eligible_specializations 
    : (typeof job.other_eligible_specializations === 'string' 
        ? JSON.parse(job.other_eligible_specializations) 
        : [])
  ).map(name => ({
      id: null,  // Custom entries MUST have id: null
      name: typeof name === 'string' ? name.trim() : String(name),
    })),
  ];

  // --------------------------------------------------------------------------
  //  BUILD FINAL RESPONSE PAYLOAD
  // --------------------------------------------------------------------------
  return {
    // === CORE IDENTIFIERS ===
    job_id: job.job_id,  // Frontend: use for API updates (new ID on duplicate)
    post_type: job.post_type,  // "active"|"future"|"college" - controls pricing
    opportunity_type: job.opportunity_type,  // "Internship"|"Job"|"Project"

    // === JOB ROLE ===
    // Structure: {id, title} for SearchableSelect display + re-selection
    job_role: jobRole
      ? { id: jobRole.id, title: jobRole.title }
      : null,  // Return null (not undefined) for consistent frontend handling
    other_job_role: toString(job.other_job_role),  // Custom role name

    // === SKILLS (CRITICAL: DomainSkillsSelector format) ===
    domain_skills,  // EXACT nested format component expects (see guide above)
    skill_ids,      // Flat array for methods.setValue("skill_ids", [...])
    other_skills,   // Flat custom skills for backward compatibility

    // === LOCATIONS ===
    // Array of {id, name} for SearchableSelect display + re-selection
    eligible_cities: (eligibleCities || []).map(c => ({
      id: c.id,
      name: c.name
    })),
    other_eligible_city_names: Array.isArray(job.other_eligible_city_names)
      ? job.other_eligible_city_names.map(n => toString(n))  // Custom city names
      : [],  // Always return array, never null

    // === COLLEGES ===
    eligible_colleges: (eligibleColleges || []).map(c => ({
      id: c.id,
      name: c.name
    })),
    other_eligible_college_names: Array.isArray(job.other_eligible_college_names)
      ? job.other_eligible_college_names.map(n => toString(n))
      : [],

    // === COURSES ===
    eligible_courses: (eligibleCourses || []).map(c => ({
      id: c.id,
      name: c.name
    })),
    other_eligible_course_names: Array.isArray(job.other_eligible_course_names)
      ? job.other_eligible_course_names.map(n => toString(n))
      : [],

    // === DURATION (Internship only) ===
    // {id, value} for SearchableSelect display
    duration: duration
      ? { id: duration.id, value: duration.value }
      : null,
    other_duration: toString(job.other_duration),  // Custom duration

    // === WORK DETAILS ===
    job_type: ["In office", "Hybrid", "Remote"].includes(job.job_type)
      ? job.job_type
      : "In office",  // Fallback to default
    job_time: ["Day Shift", "Night Shift", "Part-time"].includes(job.job_time)
      ? job.job_time
      : "Day Shift",
    days_in_office: toNumberOrNull(job.days_in_office),  // Only for Hybrid
    number_of_openings: toNumberOrNull(job.number_of_openings) ?? 1,  // Default 1

    // === DESCRIPTION & PREFERENCES ===
    job_description: toString(job.job_description),
    candidate_preferences: job.candidate_preferences ? toString(job.candidate_preferences) : null,
    women_preferred: Boolean(job.women_preferred),

    // === COMPENSATION ===
    stipend_type: toString(job.stipend_type) || (job.opportunity_type === "Internship" ? "Paid" : "Fixed"),
    stipend_min: toNumberOrNull(job.stipend_min),
    stipend_max: toNumberOrNull(job.stipend_max),
    incentive_per_year: job.incentive_per_year ? toString(job.incentive_per_year) : null,
    perks: Array.isArray(job.perks) ? job.perks.map(p => toString(p)) : [],  // Always array

    // === SCREENING ===
    screening_questions: Array.isArray(job.screening_questions)
      ? job.screening_questions.map(q => toString(q))
      : [],  // Always array of strings

    // === CONTACT ===
    phone_contact: toString(job.phone_contact),  // 10-digit string
    alternate_phone_number: job.alternate_phone_number ? toString(job.alternate_phone_number) : null,

    // === DATES (YYYY-MM-DD format for <input type="date">) ===
    is_custom_internship_date: Boolean(job.is_custom_internship_date),
    internship_start_date: formatDate(job.internship_start_date),  // "YYYY-MM-DD" or null
    internship_from_date: formatDate(job.internship_from_date),
    internship_to_date: formatDate(job.internship_to_date),
    project_start_date: formatDate(job.project_start_date),
    project_end_date: formatDate(job.project_end_date),

    // === MATCHING ===
    minSkillMatchRequired: toNumberOrNull(job.min_skill_match_required),  // 0-100

    // === EDUCATION ===
    eligible_education_levels: Array.isArray(job.eligible_education_levels)
      ? job.eligible_education_levels
      : [],  // ["bachelors", "masters"]
    eligible_specializations,  // Array of {id, name} for SearchableSelect
    other_eligible_specializations: Array.isArray(job.other_eligible_specializations)
      ? job.other_eligible_specializations.map(n => toString(n))
      : [],  // Custom spec names
    include_pursuing_students: Boolean(job.include_pursuing_students),

    // === EXPERIENCE ===
    experience_required: Boolean(job.experience_required),
    experience_min: toNumberOrNull(job.experience_min),
    experience_max: toNumberOrNull(job.experience_max),
    experience_types: Array.isArray(job.experience_types)
      ? job.experience_types
      : [],  // ["full_time", "internship"]

    // === STATUS & METADATA ===
    job_status: job.active_status !== 0,  // true = active, false = inactive
    created_at: job.created_at?.toISOString?.() || null,
    updated_at: job.updated_at?.toISOString?.() || null,
  };
};

// ============================================================================
//  MAIN CONTROLLER: Get Job for Edit/Duplicate/Convert
// ============================================================================
/**
 * GET /api/jobs/:job_id/edit
 * 
 * Returns job data in frontend-ready format for:
 * - Editing a draft (active_status = 0)
 * - Duplicating a posted job (active_status = 1)
 * - Converting future → active (just change post_type before resubmit)
 * 
 * Query params:
 * - mode: "draft"|"duplicate"|"convert" (optional, for logging/analytics)
 */
exports.getJobForEdit = async (req, res) => {
  console.log("trying to reacrat job")
  try {
    const { job_id } = req.params;
    const { mode = "edit" } = req.query;  // "draft"|"duplicate"|"convert"
    const user_id = req.user?.id;

    // Validate required params
    if (!job_id) {
      return res.status(400).json({
        success: false,
        message: "Job ID is required"
      });
    }

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    // Verify user is a company recruiter
    const user = await User.findOne({
      where: { id: user_id, user_role: "COMPANY" },
      attributes: ["id", "user_role"]
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Company recruiter account required"
      });
    }

    // Get company profile for ownership check
    const companyProfile = await CompanyRecruiterProfile.findOne({
      where: { user_id },
      attributes: ["id"]
    });

    if (!companyProfile) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found"
      });
    }

    // Fetch job with ownership validation
    // Note: Allow both draft (active_status=0) and posted (active_status=1) jobs
    const job = await JobPost.findOne({
      where: {
        job_id,
        company_recruiter_profile_id: companyProfile.id,
        // Remove active_status filter to support edit/duplicate/convert flows
      },
      // Minimal attributes for base job (associations fetched separately)
      // attributes: [
      //   "job_id", "post_type", "opportunity_type", "active_status",
      //   "job_role_id", "other_job_role",
      //   "job_type", "job_time", "days_in_office", "number_of_openings",
      //   "job_description", "candidate_preferences", "women_preferred",
      //   "stipend_type", "stipend_min", "stipend_max", "incentive_per_year",
      //   "perks", "screening_questions",
      //   "phone_contact", "alternate_phone_number",
      //   "is_custom_internship_date", "internship_start_date",
      //   "internship_from_date", "internship_to_date",
      //   "project_start_date", "project_end_date",
      //   "min_skill_match_required",
      //   "eligible_education_levels", "eligible_specialization_ids",
      //   "other_eligible_specializations", "include_pursuing_students",
      //   "experience_required", "experience_min", "experience_max", "experience_types",
      //   "other_eligible_city_names", "other_eligible_college_names",
      //   "other_eligible_course_names", "other_duration",
      //   "duration_id", "createdAt", "updatedAt",
      // ],
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or access denied"
      });
    }

    // Transform to frontend-ready payload
    const payload = await transformJobToEditPayload(job, req.db);

    // Add mode info for frontend analytics/debugging (optional)
    payload.mode = mode;
    payload.is_draft = job.active_status === 0;
    payload.is_posted = job.active_status === 1;

    return res.status(200).json({
      success: true,
      data: payload
    });

  } catch (error) {
    console.error("Error in getJobForEdit:", error);

    // Log full error in production, send sanitized message to client
    if (process.env.NODE_ENV === "development") {
      console.error("Full error details:", {
        name: error.name,
        message: error.message,
        stack: error.stack,
        original: error.original?.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to load job details. Please try again.",
      // Only include error code in production for debugging
      error_code: error.code || "INTERNAL_SERVER_ERROR",
    });
  }
};
