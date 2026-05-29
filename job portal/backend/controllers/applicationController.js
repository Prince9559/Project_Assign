const {
  User,
  JobPost,
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
  FilterOption
} = require("../models");
const { Sequelize } = require("../db");
const sequelize = require("../db");
const { Op, fn, col, literal, where } = require("sequelize");


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
      assignmentStatus, // 'sent' | 'not_sent'
      interviewStatus, // 'scheduled' | 'not_scheduled'
    } = req.query;

    // Validate job_post_id
    if (!job_post_id) {
      return res.status(400).json({ message: "Job post ID is required." });
    }

    // Fetch job post
    const jobPost = await JobPost.findOne({ where: { job_id: job_post_id } });
    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found." });
    }

    // Parse multi-value filters
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

    // Fetch all applications with required associations
    const applications = await Application.findAll({
      where: { job_post_id },
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
              attributes: ["first_name", "last_name", "email", "phone"],
              include: [
                {
                  model: UserSkill,
                  attributes: [],
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
    });

    // Early exit if no apps
    if (!applications.length) {
      return res.status(200).json({ applicants: [] });
    }

    // Pre-process job skills once
    const jobSkills = jobPost.skillsRequired
      ? jobPost.skillsRequired
          .split(",")
          .map((s) => s.trim().toLowerCase())
          .filter(Boolean)
      : [];

    // Filter and transform
    const filteredApplicants = applications
      .map((app) => {
        const userDetail = app.user;
        if (!userDetail || !userDetail.User) return null;

        const user = userDetail.User;
        const currentLocation = userDetail.currentLocation?.name || "";
        const genderVal = userDetail.gender;
        const experiences = userDetail.experiences || [];

        // Extract user skills
        const userSkills = (user.UserSkills || [])
          .map((us) => us.Skill?.skill_name?.toLowerCase())
          .filter(Boolean);

        // Compute skill match %
        const matchedCount = jobSkills.filter((js) =>
          userSkills.includes(js)
        ).length;
        const matchPercentage = jobSkills.length
          ? Math.round((matchedCount / jobSkills.length) * 100)
          : 0;

        // Graduation years
        const gradYearsList = (userDetail.userEducations || [])
          .map((edu) => {
            if (!edu.end_date) return null;
            return new Date(edu.end_date).getFullYear();
          })
          .filter(Boolean);

        // Education background strings
        const eduBackgrounds = (userDetail.userEducations || []).map((edu) => {
          const parts = [
            edu.level,
            edu.educationCourse?.name,
            edu.educationSpecialization?.name,
          ].filter(Boolean);
          return parts.join(" ").toLowerCase();
        });

        // Assignment & interview flags
        const hasAssignment = (app.assignments || []).length > 0;
        const hasInterview = (app.interviews || []).length > 0;

        // Apply filters
        if (location && !matchesPattern(currentLocation, location)) return null;
        if (gender && genderVal !== gender) return null;
        if (
          skillList.length &&
          !skillList.every((skill) => userSkills.includes(skill))
        )
          return null;
        if (matchPercentage < matchMin || matchPercentage > matchMax)
          return null;
        if (gradYearSet && !gradYearsList.some((y) => gradYearSet.has(y)))
          return null;
        if (
          eduBgPattern &&
          !eduBackgrounds.some((bg) => matchesPattern(bg, eduBgPattern))
        )
          return null;
        if (assignmentStatus === "sent" && !hasAssignment) return null;
        if (assignmentStatus === "not_sent" && hasAssignment) return null;
        if (interviewStatus === "scheduled" && !hasInterview) return null;
        if (interviewStatus === "not_scheduled" && hasInterview) return null;

        // Build final response object
        return {
          application_id: app.id,
          user_id: app.user_id,
          name: `${user.first_name} ${user.last_name}`.trim(),
          email: user.email,
          phone: user.phone,
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
          skills: userSkills.map((s) => s.charAt(0).toUpperCase() + s.slice(1)), // Capitalize
          skillMatchPercentage: matchPercentage,
          appliedDate: app.created_at
            ? app.created_at.toISOString().split("T")[0]
            : "Unknown",
          status: app.status,
        };
      })
      .filter(Boolean); // Remove nulls

    return res.status(200).json({ applicants: filteredApplicants });
  } catch (error) {
    console.error("[ERROR] getApplicantsForJob:", error);
    return res.status(500).json({
      message: "Failed to fetch applicants",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
