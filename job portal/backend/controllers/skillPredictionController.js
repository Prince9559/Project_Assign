const jwt = require('jsonwebtoken');
const { User, UserDetail, OTP, CompanyRecruiterProfile,UniversityDetail} = require('../models');
const { Op } = require('sequelize');






exports.recommendSkillsByJob = async (req, res) => {
  try {
    const user_id = req.user?.id;
    const job_post_id = req.params.job_post_id;

    // Early validation
    if (!user_id) {
      return res
        .status(401)
        .json({ message: "Unauthorized. User ID not found." });
    }
    if (req.user.role !== 'STUDENT') {
      return res
        .status(401)
        .json({ message: "Unauthorized. Only Students can access." });
    }
    if (!job_post_id) {
      return res.status(400).json({ message: "Job post ID is required." });
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

   

    //  Fetch job skills WITH type (must-have / preferred)
    const jobSkillRelations = await JobPostSkill.findAll({
      where: { job_post_id: job_post_id },
      include: [
        {
          model: Skill,
          as: "Skill",
          attributes: ["skill_id", "skill_name"],
        },
      ],
      attributes: ["type"],
    });

    const userSkillsData = await UserSkill.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Skill, as: "Skill", attributes: ["skill_name"] }],
    });

   
    


    

    return res
      .status(200)
      .json({ success:true, message: "Application successful.",});
  } catch (error) {

    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};