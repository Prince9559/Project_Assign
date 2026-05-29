const {
  JobPost,
  UserSkill,
  User,
  CompanyRecruiterProfile,
  JobRole,
  Skill,
  Domain,
  sequelize,
  Location,
  SchoolCollege,
  Course,
  Industry,
  FilterOption,
  UserDetail,
  Education,
  OneTimePurchase,
  PaymentOrder,
  UniversityDetail,
  Application,
  ContactUnlock,
  JobPostSkill
} = require("../models");
const { Op, fn, col, literal } = require("sequelize");

const { getDetailedSkillMatch } = require('../utils/skillMatch');


//for students to get job details
exports.getJobDetails = async (req, res) => {
  try {
    const job_id = req.params.job_id;
    const user_id = req.user.id;

    if (!job_id) {
      return res.status(400).json({ message: "Job ID is required." });
    }

    const job = await JobPost.findOne({
      where: { job_id: job_id },
      include: [
        {
          model: JobRole,
          attributes: ["id", "title"],
        },
        {
          model: CompanyRecruiterProfile,
          include: [
            {
              model: Industry,
              as: "industry",
              attributes: ["id", "name"],
              required: false,
            },
            {
              model: Location,
              as: "companyLocation",
              attributes: ["id", "name"],
              required: false,
            },
            {
              model: User,
              as: "user",
              attributes: ["first_name", "last_name", "email"],
              required: false,
            },
            {
              model: JobRole,
              as: "designation",
              attributes: ["id", "title"],
              required: false,
            },
          ],
          attributes: [
            "company_name",
            "logo_url",
            "about",
            "hiring_preferences",
            "is_email_verified",
            "is_phone_verified",
            "is_gst_verified",
            "profile_pic",
            "designation_id",
          ],
          required: false,
        },
        // Eligible Cities
        {
          model: Location,
          as: "eligibleCities",
          attributes: ["id", "name"],
          through: { attributes: [] },
          required: false,
        },
        // Eligible Colleges
        {
          model: SchoolCollege,
          as: "eligibleColleges",
          attributes: ["id", "name"],
          through: { attributes: [] },
          required: false,
        },
        // Eligible Courses
        {
          model: Course,
          as: "eligibleCourses",
          attributes: ["id", "name"],
          through: { attributes: [] },
          required: false,
        },
        // Skills
        {
          model: Skill,
          as: "skills",
          attributes: ["skill_id", "skill_name"],
          through: { attributes: [] },
          required: false,
        },
      ],
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    //  Fetch job skills WITH type (must-have / preferred)
    // const jobSkillRelations = await JobPostSkill.findAll({
    //   where: { job_post_id: parseInt(job_id, 10) },
    //   include: [{ model: Skill, as: "Skill", attributes: ["skill_name"] }],
    //   attributes: ["type"],
    // });

    const jobSkillRelations = await JobPostSkill.findAll({
      where: { job_post_id: parseInt(job_id, 10) },
      include: [
        {
          model: Skill,
          as: "Skill",
          attributes: ["skill_id", "skill_name"],
        },
      ],
      attributes: ["type"],
    });

    // Applications count
    const numberOfApplicants = await Application.count({
      where: { job_post_id: job_id },
    });

    // Check if current user has applied
    const userApplication = await Application.findOne({
      where: {
        user_id: user_id,
        job_post_id: job_id,
      },
    });
    const has_applied = !!userApplication;

    //check user and job post skills matching
    

    //  Compute detailed skill match (strict: must-have mandatory)
    let matchPercentage = 0;
    let matchedSkills = [];
    let missingSkills = [];
    let passedMustHave = false;
    let mustHaveDetails = { required: [], missing: [] };
    let preferredDetails = { required: [], missing: [] };

    let mandatorySkillsMet = false;
    let preferredMatchPercentage = 0;
    let preferredSkillMatch=0;

    if (user_id) {
      const userSkillsData = await UserSkill.findAll({
        where: { user_id },
        include: [{ model: Skill, as: "Skill", attributes: ["skill_name"] }],
      });

      const matchDetails = getDetailedSkillMatch(
        jobSkillRelations,
        userSkillsData
      );


      // Compute preferred % (0–100)
      const { preferred } = matchDetails;
      preferredMatchPercentage =
        preferred.count.required === 0
          ? 100
          : Math.round(
              (preferred.count.matched / preferred.count.required) * 100
            );

      matchPercentage = matchDetails.matchPercentage;
      passedMustHave = matchDetails.passedMustHave;
      matchedSkills = matchDetails.overall.matched;
      missingSkills = matchDetails.overall.missing;
      mustHaveDetails = matchDetails.mustHave;
      preferredDetails = matchDetails.preferred;

      mandatorySkillsMet = matchDetails.passedMustHave;
      preferredSkillMatch= matchDetails.preferredMatchPercentage;

      
    }

    const currentDate = new Date();

    // Hiring Status
    const hiringStatus =
      job.number_of_openings > 0 ? "Actively Hiring" : "Closed";

    // Posted Days Ago
    const postedDate = job.created_at;
    const diffTime = Math.abs(currentDate - postedDate);
    let postedDaysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (postedDaysAgo === 0) {
      postedDaysAgo = "Today";
    } else if (postedDaysAgo === 1) {
      postedDaysAgo = "1 day ago";
    } else {
      postedDaysAgo = `${postedDaysAgo} days ago`;
    }

    // Associations Processing
    const jobCities =
      job.eligibleCities?.map((city) => ({ id: city.id, name: city.name })) ||
      [];
    const jobColleges =
      job.eligibleColleges?.map((college) => ({
        id: college.id,
        name: college.name,
      })) || [];
    const jobCourses =
      job.eligibleCourses?.map((course) => ({
        id: course.id,
        name: course.name,
      })) || [];
    const jobSkills =
      job.skills?.map((skill) => ({
        id: skill.skill_id,
        name: skill.skill_name,
      })) || [];

    // Skills Fallback
    const skillsRequired =
      jobSkills.length > 0
        ? jobSkills.map((skill) => skill.name)
        : job.skillsRequired
        ? job.skillsRequired.split(",").map((s) => s.trim())
        : [];

    // Salary
    const salary =
      job.stipend_min && job.stipend_max
        ? `${job.stipend_min} - ${job.stipend_max}`
        : "";
    const stipend_type = job.stipend_type || "";
    const incentive_per_year = job.incentive_per_year || "";

    // Internship Dates
    const internship_start_date = job.internship_start_date || "";
    const internship_from_date = job.internship_from_date || "";
    const internship_to_date = job.internship_to_date || "";
    const is_custom_internship_date = job.is_custom_internship_date || false;

    // Perks
    const perks = Array.isArray(job.perks) ? job.perks : [];

    // Screening Questions
    const screening_questions = job.screening_questions
      ? job.screening_questions.filter((q) => q.trim())
      : [];

    // Duration
    const duration = await FilterOption.findOne({
      where: {
        id: job.duration_id,
        category: "duration",
      },
      attributes: ["id", "value"],
    });

    return res.status(200).json({
      // Basic Job Information
      job_id: job.job_id,
      opportunity_type: job.opportunity_type,
      job_type: job.job_type,
      jobProfile: job.jobProfile,
      job_description: job.job_description,
      job_time: job.job_time,
      days_in_office: job.days_in_office,
      has_applied: has_applied,
      recruiterDesignationName:
        job.CompanyRecruiterProfile?.designation?.title || null,

      // Location
      job_location: job.jobLocation,
      eligible_cities: jobCities,
      eligible_colleges: jobColleges,
      eligible_courses: jobCourses,

      // Requirements
      skillsRequired: skillsRequired,
      skill_required_note: job.skill_required_note,
      candidate_preferences: job.candidate_preferences,
      women_preferred: job.women_preferred,
      minSkillMatchRequired: job.min_skill_match_required || 0, //minimum percentage of skills that should match

      skillMatch: {
        percentage: matchPercentage,
        passedMustHave,
        mustHave: {
          required: mustHaveDetails.required,
          missing: mustHaveDetails.missing,
          count: mustHaveDetails.count,
        },
        preferred: {
          required: preferredDetails.required,
          missing: preferredDetails.missing,
          count: preferredDetails.count,
        },
      },

      // Keep legacy fields for backward compatibility (optional)
      matchPercentage, // same as skillMatch.percentage
      matchedSkills, // same as skillMatch.overall.matched
      missingSkills, // same as skillMatch.overall.missing
      passedMustHave, // new boolean
      mandatorySkillsMet ,
      preferredSkillMatch,



      // Company Info
      company_name: job.CompanyRecruiterProfile?.company_name || "",
      logo_url: job.CompanyRecruiterProfile?.logo_url || "",
      aboutCompany: job.CompanyRecruiterProfile?.about || "",
      companyIndustry: job.CompanyRecruiterProfile?.industry?.name || "",
      companyLocation: job.CompanyRecruiterProfile?.companyLocation?.name || "",

      // Recruiter Info
      recruiterDesignation: job.CompanyRecruiterProfile?.designation_id || "",
      recruiterDesignationName:
        job.CompanyRecruiterProfile?.designation?.title || "",
      recruiter_profile_pic: job.CompanyRecruiterProfile?.profile_pic || "",
      recruiter_full_name: `${job.CompanyRecruiterProfile?.user?.first_name} ${job.CompanyRecruiterProfile?.user?.last_name}`,
      recruiter_email: job.CompanyRecruiterProfile?.user?.email,
      recruiter_phone: job.CompanyRecruiterProfile?.user?.phone,

      // Company Verification
      is_email_verified:
        job.CompanyRecruiterProfile?.is_email_verified || false,
      is_phone_verified:
        job.CompanyRecruiterProfile?.is_phone_verified || false,
      is_gst_verified: job.CompanyRecruiterProfile?.is_gst_verified || false,

      // Hiring
      number_of_openings: job.number_of_openings,
      hiringStatus: hiringStatus,
      hiring_preferences: job.CompanyRecruiterProfile?.hiring_preferences || "",
      languages_known: job.CompanyRecruiterProfile?.languages_known || "",

      // Compensation
      salary: salary,
      stipend_type: stipend_type,
      incentive_per_year: incentive_per_year,
      perks: perks,

      // Internship
      internshipDuration: duration ? duration.value : "",
      internshipDurationId: job.duration_id || null,
      internship_start_date: internship_start_date,
      internship_from_date: internship_from_date,
      internship_to_date: internship_to_date,
      is_custom_internship_date: is_custom_internship_date,

      // Academic
      college_name: job.college_name,
      course: job.course,

      // Contact
      phone_contact: job.phone_contact,
      alternate_phone_number: job.alternate_phone_number,

      // Application Process
      screening_questions: screening_questions,

      // Statistics
      number_of_applicants: (() => {
        if (numberOfApplicants <= 50) return "Early applicant";
        if (numberOfApplicants <= 100) return "50+ applicants";
        if (numberOfApplicants <= 500) return "100+ applicants";
        return "500+ applicants";
      })(),
      posted_days_ago: postedDaysAgo,

      // Job Role
      job_role: job.JobRole ? job.JobRole.title : "",
    });
  } catch (error) {
    console.error("Error fetching job details:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

exports.showCompanyWiseJobPosts = async (req, res) => {
  try {
    const company_nameQuery = req.query.company_name;

    if (!company_nameQuery) {
      return res
        .status(400)
        .json({ message: "company_name query parameter is required." });
    }

    // Find company recruiter profiles matching the company name (case-insensitive, partial match)
    // Use Sequelize.fn and Op.like for case-insensitive search in MySQL
    const matchingCompanies = await CompanyRecruiterProfile.findAll({
      where: sequelize.where(
        sequelize.fn("LOWER", sequelize.col("company_name")),
        {
          [Op.like]: `%${company_nameQuery.toLowerCase()}%`,
        }
      ),
      attributes: ["id", "company_name", "logo_url"],
    });

    if (matchingCompanies.length === 0) {
      return res
        .status(404)
        .json({ message: "No companies found matching the given name." });
    }

    const companyIds = matchingCompanies.map((company) => company.id);

    // Fetch job posts for the matching companies
    const jobPosts = await JobPost.findAll({
      where: {
        company_recruiter_profile_id: {
          [Op.in]: companyIds,
        },
      },
      include: [
        {
          model: JobRole,
          attributes: ["id", "title"],
        },
        {
          model: CompanyRecruiterProfile,
          include: [
            {
              model: Industry,
              as: "industry",
              attributes: ["id", "name"],
              required: false,
            },
            {
              model: Location,
              as: "companyLocation",
              attributes: ["id", "name"],
              required: false,
            },
          ],
          attributes: [
            "company_name",
            "logo_url",
            "about",
            "hiring_preferences",
            "is_email_verified",
            "is_phone_verified",
            "is_gst_verified",
            "profile_pic",
          ],
          required: false,
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const currentDate = new Date();

    // Format the response data
    const responseData = jobPosts.map((job) => {
      // Calculate postedDaysAgo
      const postedDate = job.created_at;
      const diffTime = Math.abs(currentDate - postedDate);
      let postedDaysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (postedDaysAgo === 0) {
        postedDaysAgo = "Today";
      } else {
        postedDaysAgo = `${postedDaysAgo} days ago`;
      }

      // Hiring status
      const hiringStatus =
        job.number_of_openings > 0 ? "Actively Hiring" : "Closed";

      // Salary range
      const salary =
        job.stipend_min && job.stipend_max
          ? `${job.stipend_min} - ${job.stipend_max}`
          : "";

      return {
        company_name: job.CompanyRecruiterProfile
          ? job.CompanyRecruiterProfile.company_name
          : "",
        logo_url: job.CompanyRecruiterProfile
          ? job.CompanyRecruiterProfile.logo_url
          : "",
        jobRole: job.JobRole ? job.JobRole.title : "",
        experience: job.candidate_preferences || "",
        city: job.cityChoice || "",
        salary,
        postedDaysAgo,
        hiringStatus,
      };
    });

    return res.status(200).json({ data: responseData });
  } catch (error) {
    console.error("Error fetching company-wise job posts:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};


const parseMultiFilter = (input) => {
  // Handle undefined/null/empty
  if (!input) return null;

  let values = [];

  if (Array.isArray(input)) {
    // e.g., ["job", "internship"]
    values = input;
  } else if (typeof input === 'string') {
    // e.g., "job,internship" or "job"
    values = input.split(",").map(s => s.trim()).filter(s => s.length > 0);
  } else {
    // Unexpected type (number, boolean, object) → ignore
    return null;
  }

  return values.map(s => s.toLowerCase());
};

//get oppotunitites for student
exports.getOpportunities = async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res
        .status(401)
        .json({ message: "Unauthorized. User ID not found." });
    }

    // --- FETCH USER'S COLLEGES ---
    let userCollegeIds = [];
    let userCollegeNames = [];

    const userDetail = await UserDetail.findOne({
      where: { user_id },
      attributes: ["id"],
    });

    if (userDetail) {
      const educations = await Education.findAll({
        where: { user_detail_id: userDetail.id },
        attributes: ["school_college_id", "other_institution_name"],
      });

      educations.forEach((edu) => {
        if (edu.school_college_id) {
          userCollegeIds.push(edu.school_college_id);
        } else if (edu.other_institution_name?.trim()) {
          userCollegeNames.push(
            edu.other_institution_name.trim().toLowerCase()
          );
        }
      });
    }

    // --- PRECOMPUTE TARGETED JOB IDs FOR USER (for relevance & filtering) ---
    let userTargetedJobIds = new Set();
    if (userCollegeIds.length > 0) {
      const targetedJobRows = await sequelize.query(
        `
          SELECT DISTINCT jpc.job_post_id
          FROM job_post_colleges jpc
          WHERE jpc.college_id IN (${userCollegeIds.map(() => "?").join(",")})
        `,
        {
          replacements: userCollegeIds,
          type: sequelize.QueryTypes.SELECT,
        }
      );
      userTargetedJobIds = new Set(
        targetedJobRows.map((row) => row.job_post_id)
      );
    }

    // --- PARSE QUERY PARAMS ---
    const {
      jobProfile,
      location,
      jobType,
      company,
      opportunityType,
      audienceType,
      minSalary,
      maxSalary,
      page,
      limit,
      offset,
      sortBy,
      sortOrder,
      targetedOnly, // NEW: e.g., targetedOnly=1
    } = req.query;

    const pageSize = Math.min(parseInt(limit) || 20, 100);
    let offsetValue = 0;

    if (offset !== undefined) {
      offsetValue = parseInt(offset) || 0;
    } else {
      const pageNum = parseInt(page) || 1;
      offsetValue = (pageNum - 1) * pageSize;
    }

    // Default sort = relevance (targeted first)
    const effectiveSortBy = sortBy || "relevance";
    const effectiveSortOrder =
      (sortOrder || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
    const shouldFilterTargetedOnly = targetedOnly === "1";

    // --- PARSE FILTERS ---
    const jobProfiles = parseMultiFilter(jobProfile);
    const jobTypes = parseMultiFilter(jobType);
    const companies = parseMultiFilter(company);
    const opportunityTypes = parseMultiFilter(opportunityType);
    const audienceTypes = parseMultiFilter(audienceType);
    const locationTerms = parseMultiFilter(location);

    // --- BUILD BASE WHERE ---
    const whereConditions = { active_status: 1 };

    // Job Type
    if (jobTypes) {
      whereConditions.job_type = {
        [Op.or]: jobTypes.map((term) => ({ [Op.like]: `%${term}%` })),
      };
    }

    // Opportunity Type
    if (opportunityTypes) {
      whereConditions.opportunity_type = {
        [Op.or]: opportunityTypes.map((term) => ({ [Op.like]: `%${term}%` })),
      };
    }

    // Salary
    if (minSalary || maxSalary) {
      const min = parseInt(minSalary) || 0;
      const max = parseInt(maxSalary) || Number.MAX_SAFE_INTEGER;
      whereConditions[Op.and] = [
        { stipend_max: { [Op.gte]: min } },
        { stipend_min: { [Op.lte]: max } },
      ];
    }

    // Audience filters from job posting data
    if (audienceTypes && audienceTypes.length > 0) {
      const audienceConditions = [];
      if (audienceTypes.includes("open_to_all")) {
        audienceConditions.push({ is_college_specific: 0 });
      }
      if (audienceTypes.includes("open_to_freshers")) {
        audienceConditions.push(
          literal(
            "(experience_required = 0 OR experience_min IS NULL OR experience_min = 0)"
          )
        );
      }
      if (audienceTypes.includes("open_to_experienced")) {
        audienceConditions.push(
          literal(
            "(experience_required = 1 AND IFNULL(experience_max, 0) >= 1)"
          )
        );
      }
      if (audienceConditions.length > 0) {
        baseWhere[Op.and] = [...(baseWhere[Op.and] || []), { [Op.or]: audienceConditions }];
      }
    }

    // --- LOCATION FILTER (city-based) ---
    let locationFilteredJobIds = null;
    if (locationTerms) {
      const cityMatches = await sequelize.query(
        `
          SELECT DISTINCT jp.job_id
          FROM job_posts jp
          INNER JOIN job_post_cities jpc ON jp.job_id = jpc.job_post_id
          INNER JOIN locations AS eligible_loc ON jpc.city_id = eligible_loc.id
          WHERE ${locationTerms
            .map(() => "LOWER(eligible_loc.name) LIKE ?")
            .join(" OR ")}
        `,
        {
          replacements: locationTerms.map((term) => `%${term}%`),
          type: sequelize.QueryTypes.SELECT,
        }
      );
      locationFilteredJobIds = cityMatches.map((row) => row.job_id);
      if (locationFilteredJobIds.length === 0) {
        return res.status(200).json({
          data: [],
          pagination: {
            total: 0,
            page: parseInt(page) || 1,
            limit: pageSize,
            hasNext: false,
            hasPrev: false,
            totalPages: 0,
          },
        });
      }
    }

    // Apply location filter
    if (locationFilteredJobIds) {
      whereConditions.job_id = {
        [Op.in]: locationFilteredJobIds,
      };
    }

    // --- APPLY TARGETED-ONLY FILTER (if requested) ---
    if (shouldFilterTargetedOnly) {
      if (userTargetedJobIds.size > 0) {
        // AND with existing job_id condition (if location already applied)
        if (whereConditions.job_id) {
          const existingIds = Array.isArray(whereConditions.job_id[Op.in])
            ? whereConditions.job_id[Op.in]
            : [whereConditions.job_id];
          const intersection = existingIds.filter((id) =>
            userTargetedJobIds.has(id)
          );
          whereConditions.job_id = { [Op.in]: intersection };
        } else {
          whereConditions.job_id = { [Op.in]: Array.from(userTargetedJobIds) };
        }
      } else {
        // No targeted jobs possible → empty result
        whereConditions.job_id = { [Op.in]: [] };
      }
    }

    // --- FETCH USER SKILLS ---
    const userSkillsData = await UserSkill.findAll({
      where: { user_id },
      include: [{ model: Skill, as: "Skill", attributes: ["skill_name"] }],
    });
    const userSkills = userSkillsData.map((us) =>
      us.Skill.skill_name.toLowerCase()
    );

    // --- INCLUDE MODELS ---
    const include = [
      {
        model: JobRole,
        attributes: ["title"],
        where: jobProfiles
          ? {
              [Op.or]: jobProfiles.map((term) => ({
                title: { [Op.like]: `%${term}%` },
              })),
            }
          : undefined,
        required: !!jobProfiles,
      },
      {
        model: CompanyRecruiterProfile,
        attributes: [
          "company_name",
          "logo_url",
          "about",
          "hiring_preferences",
          "is_email_verified",
          "is_phone_verified",
          "is_gst_verified",
          "profile_pic",
          "company_location_id",
        ],
        where: companies
          ? {
              [Op.or]: companies.map((term) => ({
                company_name: { [Op.like]: `%${term}%` },
              })),
            }
          : undefined,
        required: !!companies,
      },
      {
        model: Skill,
        as: "skills",
        attributes: ["skill_id", "skill_name"],
        through: {
          model: JobPostSkill,
          attributes: ["type"], // ← crucial!
          as: "jobPostSkill",
        },
      },
    ];

    // --- COUNT LOGIC ---
    let total = 0;
    let totalTargeted = 0;
    let totalNonTargeted = 0;

    if (effectiveSortBy === "relevance" && !shouldFilterTargetedOnly) {
      // Count targeted & non-targeted separately
      const targetedWhere = {
        ...whereConditions,
        job_id:
          userTargetedJobIds.size > 0
            ? { [Op.in]: Array.from(userTargetedJobIds) }
            : { [Op.in]: [] },
      };
      const nonTargetedWhere = {
        ...whereConditions,
        job_id:
          userTargetedJobIds.size > 0
            ? { [Op.notIn]: Array.from(userTargetedJobIds) }
            : { [Op.ne]: null },
      };

      totalTargeted = await JobPost.count({ where: targetedWhere });
      totalNonTargeted = await JobPost.count({ where: nonTargetedWhere });
      total = totalTargeted + totalNonTargeted;
    } else {
      total = await JobPost.count({ where: whereConditions });
    }

    // --- FETCH RAW JOBS ---
    let rawJobPosts = [];

    if (effectiveSortBy === "relevance" && !shouldFilterTargetedOnly) {
      // Fetch targeted jobs first (up to page size)
      const targetedWhere = {
        ...whereConditions,
        job_id:
          userTargetedJobIds.size > 0
            ? { [Op.in]: Array.from(userTargetedJobIds) }
            : { [Op.in]: [] },
      };

      const targetedJobs = await JobPost.findAll({
        where: targetedWhere,
        include,
        order: [["created_at", "DESC"]],
        limit: pageSize,
        offset: offsetValue,
      });

      if (targetedJobs.length >= pageSize) {
        rawJobPosts = targetedJobs;
      } else {
        // Fill remainder with non-targeted jobs
        const remaining = pageSize - targetedJobs.length;
        const nonTargetedOffset = Math.max(0, offsetValue - totalTargeted);

        const nonTargetedWhere = {
          ...whereConditions,
          job_id:
            userTargetedJobIds.size > 0
              ? { [Op.notIn]: Array.from(userTargetedJobIds) }
              : { [Op.ne]: null },
        };

        const nonTargetedJobs = await JobPost.findAll({
          where: nonTargetedWhere,
          include,
          order: [["created_at", "DESC"]],
          limit: remaining,
          offset: nonTargetedOffset,
        });

        rawJobPosts = [...targetedJobs, ...nonTargetedJobs];
      }
    } else {
      // Normal fetch (postedAt, matchPercentage, or targetedOnly mode)
      let order = [["job_id", "DESC"]];
      if (effectiveSortBy === "postedAt") {
        order = [["created_at", effectiveSortOrder]];
      } else if (effectiveSortBy === "matchPercentage") {
        // Will sort in JS later; fetch all (with warning for large sets)
        if (total > 1000) {
          return res.status(400).json({
            error:
              "Too many jobs to sort by skill match. Please add filters like location or job type.",
          });
        }
        // No pagination here — handled after fetch
      }

      rawJobPosts = await JobPost.findAll({
        where: whereConditions,
        include,
        order,
        limit: effectiveSortBy === "matchPercentage" ? undefined : pageSize,
        offset: effectiveSortBy === "matchPercentage" ? undefined : offsetValue,
      });
    }

    // --- FETCH COMPANY LOCATIONS ---
    const companyLocationIds = [
      ...new Set(
        rawJobPosts
          .map((job) => job.CompanyRecruiterProfile?.company_location_id)
          .filter((id) => id != null)
      ),
    ];

    let locationMap = {};
    if (companyLocationIds.length > 0) {
      const locations = await Location.findAll({
        where: { id: companyLocationIds },
        attributes: ["id", "name"],
      });
      locationMap = Object.fromEntries(
        locations.map((loc) => [loc.id, loc.name])
      );
    }

    // --- TRANSFORM RESULTS ---
    const currentDate = new Date();
    let opportunities = rawJobPosts.map((job) => {
      const hiringStatus =
        job.number_of_openings > 0 ? "Actively Hiring" : "Closed";
      const postedDate = job.created_at;
      const diffTime = Math.abs(currentDate - postedDate);
      let postedDaysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (postedDaysAgo === 0) postedDaysAgo = "Today";
      else if (postedDaysAgo === 1) postedDaysAgo = "1 day ago";
      else postedDaysAgo = `${postedDaysAgo} days ago`;

      // Efficient college targeting check
      const is_targeted_to_user_college = userTargetedJobIds.has(job.job_id);

      // const matchPercentage =
      //   job.skills?.length > 0
      //     ? Math.round(
      //         (job.skills.filter((skill) =>
      //           userSkills.includes(skill.skill_name.toLowerCase())
      //         ).length /
      //           job.skills.length) *
      //           100
      //       )
      //     : 0;

      // Prepare job skills input for matcher
const jobSkillsInput = job.skills?.map(s => ({
  name: s.skill_name,
  type: s.jobPostSkill?.type || 'preferred',
})) || [];

const detailedMatch = getDetailedSkillMatch(jobSkillsInput, userSkills);
const matchPercentage = detailedMatch.matchPercentage;
const mandatorySkillsMet= detailedMatch.mandatorySkillsMet;
const passedMustHave= detailedMatch.passedMustHave;
const preferredMatchPercentage= detailedMatch.preferredMatchPercentage;

      return {
        job_id: job.job_id,
        company_name: job.CompanyRecruiterProfile?.company_name || "",
        logo_url: job.CompanyRecruiterProfile?.logo_url || "",
        jobRole: job.JobRole?.title || "",
        skills: job.skills || [],
        matchPercentage,
        mandatorySkillsMet,
        preferredSkillMatch:preferredMatchPercentage,
        passedMustHave,
        detailedMatch,
        skill_missing: matchPercentage < 50 ,
        experience: job.candidate_preferences || "",
        salary:
          job.stipend_min && job.stipend_max
            ? `${job.stipend_min} - ${job.stipend_max}`
            : "",
        company_location:
          locationMap[job.CompanyRecruiterProfile?.company_location_id] || "",
        posted_days_ago: postedDaysAgo,
        hiring_status: hiringStatus,
        is_targeted_to_user_college,
      };
    });

    // --- IN-MEMORY SORT FOR matchPercentage (if needed) ---
    if (effectiveSortBy === "matchPercentage") {
      opportunities.sort((a, b) => {
        const diff = b.matchPercentage - a.matchPercentage;
        return effectiveSortOrder === "ASC" ? -diff : diff;
      });
      // Re-apply pagination
      opportunities = opportunities.slice(offsetValue, offsetValue + pageSize);
    }

    // --- PAGINATION METADATA ---
    const currentPage =
      offset !== undefined
        ? Math.floor(offsetValue / pageSize) + 1
        : parseInt(page) || 1;

    const hasNext = offsetValue + pageSize < total;
    const hasPrev = offsetValue > 0;

    return res.status(200).json({
      data: opportunities,
      pagination: {
        total,
        page: currentPage,
        limit: pageSize,
        offset: offsetValue,
        hasNext,
        hasPrev,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching opportunities:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

exports.getJobDetailsForRecruiter = async (req, res) => {
  try {
    const job_id = req.params.job_id;
    const user_id = req.user.id;

    if (!job_id) {
      return res.status(400).json({ message: "Job ID is required." });
    }

    const job = await JobPost.findOne({
      where: { job_id: job_id },
      include: [
        {
          model: JobRole,
          attributes: ["id", "title"],
        },
        {
          model: CompanyRecruiterProfile,
          include: [
            {
              model: Industry,
              as: "industry",
              attributes: ["id", "name"],
              required: false,
            },
            {
              model: Location,
              as: "companyLocation",
              attributes: ["id", "name"],
              required: false,
            },
            {
              model: User,
              as: "user",
              attributes: ["first_name", "last_name", "email"],
              required: false,
            },
            {
              model: JobRole,
              as: "designation",
              attributes: ["id", "title"],
              required: false,
            },
          ],
          attributes: [
            "company_name",
            "logo_url",
            "about",
            "hiring_preferences",
            "is_email_verified",
            "is_phone_verified",
            "is_gst_verified",
            "profile_pic",
            "designation_id",
          ],
          required: false,
        },
        // Eligible Cities
        {
          model: Location,
          as: "eligibleCities",
          attributes: ["id", "name"],
          through: { attributes: [] },
          required: false,
        },
        // Eligible Colleges
        {
          model: SchoolCollege,
          as: "eligibleColleges",
          attributes: ["id", "name"],
          through: { attributes: [] },
          required: false,
        },
        // Eligible Courses
        {
          model: Course,
          as: "eligibleCourses",
          attributes: ["id", "name"],
          through: { attributes: [] },
          required: false,
        },
        // Skills
        {
          model: Skill,
          as: "skills",
          attributes: ["skill_id", "skill_name"],
          through: { attributes: [] },
          required: false,
        },

        {
          model: OneTimePurchase,
          as: "oneTimePurchase",
          attributes: [
            "purchase_id",
            "post_type",
            "college_ids",
            "college_count",
            "amount_paid",
            "payment_status",
          ],
          required: false,
        },
        {
          model: PaymentOrder,
          as: "paymentOrder", // Must match association
          attributes: [
            "order_id",
            "amount",
            "tax_amount",
            "total_amount",
            "razorpay_order_id",
            "status",
          ],
          required: false,
        },
      ],
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

    // Applications count
    const { Application } = require("../models");
    const numberOfApplicants = await Application.count({
      where: { job_post_id: job_id },
    });

    const currentDate = new Date();

    // Hiring Status
    const hiringStatus =
      job.number_of_openings > 0 ? "Actively Hiring" : "Closed";

    // Posted Days Ago
    const postedDate = job.created_at;
    const diffTime = Math.abs(currentDate - postedDate);
    let postedDaysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (postedDaysAgo === 0) {
      postedDaysAgo = "Today";
    } else if (postedDaysAgo === 1) {
      postedDaysAgo = "1 day ago";
    } else {
      postedDaysAgo = `${postedDaysAgo} days ago`;
    }

    // Associations Processing
    const jobCities =
      job.eligibleCities?.map((city) => ({ id: city.id, name: city.name })) ||
      [];
    const jobColleges =
      job.eligibleColleges?.map((college) => ({
        id: college.id,
        name: college.name,
      })) || [];
    const jobCourses =
      job.eligibleCourses?.map((course) => ({
        id: course.id,
        name: course.name,
      })) || [];
    const jobSkills =
      job.skills?.map((skill) => ({
        id: skill.skill_id,
        name: skill.skill_name,
      })) || [];

    // Skills Fallback
    const skillsRequired =
      jobSkills.length > 0
        ? jobSkills.map((skill) => skill.name)
        : job.skillsRequired
        ? job.skillsRequired.split(",").map((s) => s.trim())
        : [];

    // Salary
    const salary =
      job.stipend_min && job.stipend_max
        ? `${job.stipend_min} - ${job.stipend_max}`
        : "";
    const stipend_type = job.stipend_type || "";
    const incentive_per_year = job.incentive_per_year || "";

    // Internship Dates
    const internship_start_date = job.internship_start_date || "";
    const internship_from_date = job.internship_from_date || "";
    const internship_to_date = job.internship_to_date || "";
    const is_custom_internship_date = job.is_custom_internship_date || false;

    // Perks
    const perks = Array.isArray(job.perks) ? job.perks : [];

    // Screening Questions
    const screening_questions = job.screening_questions
      ? job.screening_questions.filter((q) => q.trim())
      : [];

    // Duration
    const duration = await FilterOption.findOne({
      where: {
        id: job.duration_id,
        category: "duration",
      },
      attributes: ["id", "value"],
    });

    //  PAYMENT INFO
    let paymentInfo = {
      payment_type: job.payment_type || "free",
      amount_paid: null,
      post_type: null,
      is_college_specific: job.is_college_specific || false,
      college_ids: job.college_ids || null,
      order_id: null,
      razorpay_order_id: null,
      payment_status: null,
    };

    if (job.payment_type === "one_time" && job.oneTimePurchase) {
      paymentInfo = {
        ...paymentInfo,
        amount_paid: job.oneTimePurchase.amount_paid,
        post_type: job.oneTimePurchase.post_type,
        college_ids: job.oneTimePurchase.college_ids,
        college_count: job.oneTimePurchase.college_count,
        payment_status: job.oneTimePurchase.payment_status,
        order_id: job.paymentOrder?.order_id || null,
        razorpay_order_id: job.paymentOrder?.razorpay_order_id || null,
      };
    }

    return res.status(200).json({
      // Basic Job Information
      job_id: job.job_id,
      opportunity_type: job.opportunity_type,
      job_type: job.job_type,
      jobProfile: job.jobProfile,
      job_description: job.job_description,
      job_time: job.job_time,
      days_in_office: job.days_in_office,
      has_applied: false,
      recruiterDesignationName:
        job.CompanyRecruiterProfile?.designation?.title || null,

      // Location
      job_location: job.jobLocation,
      eligible_cities: jobCities,
      eligible_colleges: jobColleges,
      eligible_courses: jobCourses,

      // Requirements
      skillsRequired: skillsRequired,
      skill_required_note: job.skill_required_note,
      candidate_preferences: job.candidate_preferences,
      women_preferred: job.women_preferred,

      // Company Info
      company_name: job.CompanyRecruiterProfile?.company_name || "",
      logo_url: job.CompanyRecruiterProfile?.logo_url || "",
      aboutCompany: job.CompanyRecruiterProfile?.about || "",
      companyIndustry: job.CompanyRecruiterProfile?.industry?.name || "",
      companyLocation: job.CompanyRecruiterProfile?.companyLocation?.name || "",

      // Recruiter Info
      recruiterDesignation: job.CompanyRecruiterProfile?.designation_id || "",
      recruiterDesignationName:
        job.CompanyRecruiterProfile?.designation?.title || "",
      recruiter_profile_pic: job.CompanyRecruiterProfile?.profile_pic || "",
      recruiter_full_name: `${job.CompanyRecruiterProfile?.user?.first_name} ${job.CompanyRecruiterProfile?.user?.last_name}`,
      recruiter_email: job.CompanyRecruiterProfile?.user?.email,
      recruiter_phone: job.CompanyRecruiterProfile?.user?.phone,

      // Company Verification
      is_email_verified:
        job.CompanyRecruiterProfile?.is_email_verified || false,
      is_phone_verified:
        job.CompanyRecruiterProfile?.is_phone_verified || false,
      is_gst_verified: job.CompanyRecruiterProfile?.is_gst_verified || false,

      // Hiring
      number_of_openings: job.number_of_openings,
      hiringStatus: hiringStatus,
      hiring_preferences: job.CompanyRecruiterProfile?.hiring_preferences || "",
      languages_known: job.CompanyRecruiterProfile?.languages_known || "",

      // Compensation
      salary: salary,
      stipend_type: stipend_type,
      incentive_per_year: incentive_per_year,
      perks: perks,

      // Internship
      internshipDuration: duration ? duration.value : "",
      internshipDurationId: job.duration_id || null,
      internship_start_date: internship_start_date,
      internship_from_date: internship_from_date,
      internship_to_date: internship_to_date,
      is_custom_internship_date: is_custom_internship_date,

      // Academic
      college_name: job.college_name,
      course: job.course,

      // Contact
      phone_contact: job.phone_contact,
      alternate_phone_number: job.alternate_phone_number,

      // Application Process
      screening_questions: screening_questions,

      // Statistics
      number_of_applicants: numberOfApplicants,
      posted_days_ago: postedDaysAgo,

      // Job Role
      job_role: job.JobRole ? job.JobRole.title : "",

      //Payment Info
      payment_info: paymentInfo,
    });
  } catch (error) {
    console.error("Error fetching job details:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};


// exports.getDraftOpportunity = async (req, res) => {
//   try {
//     const job_id = req.params.job_id;
//     const user_id = req.user?.id;

//     if (!job_id) {
//       return res.status(400).json({ message: "Job ID is required." });
//     }
//     if (!user_id) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized. User ID not found.",
//       });
//     }

//     // Check if user is COMPANY (recruiter)
//     const user = await User.findOne({
//       where: { id: user_id, user_role: "COMPANY" },
//     });
//     if (!user) {
//       return res.status(403).json({
//         success: false,
//         message: "Unauthorized. User is not a recruiter.",
//       });
//     }

//     // Get company profile
//     const companyProfile = await CompanyRecruiterProfile.findOne({
//       where: { user_id },
//       attributes: ["id"],
//     });
//     if (!companyProfile) {
//       return res.status(404).json({
//         success: false,
//         message: "Company recruiter profile not found.",
//       });
//     }

//     // Fetch draft job (active_status = 0 = draft)
//     const job = await JobPost.findOne({
//       where: {
//         job_id,
//         company_recruiter_profile_id: companyProfile.id,
//         active_status: 0,
//       },
//       include: [
//         {
//           model: JobRole,
//           attributes: ["id", "title"],
//           required: false,
//         },
//         {
//           model: Location,
//           as: "eligibleCities",
//           attributes: ["id", "name"],
//           through: { attributes: [] },
//           required: false,
//         },
//         {
//           model: SchoolCollege,
//           as: "eligibleColleges",
//           attributes: ["id", "name"],
//           through: { attributes: [] },
//           required: false,
//         },
//         {
//           model: Course,
//           as: "eligibleCourses",
//           attributes: ["id", "name"],
//           through: { attributes: [] },
//           required: false,
//         },
//         {
//           model: Skill,
//           as: "skills",
//           attributes: ["skill_id", "skill_name", "domain_id"],
//           through: { attributes: [] },
//           required: false,
//           include: [
//             {
//               model: Domain,
//               as: "domain",
//               attributes: ["domain_id", "domain_name"],
//               required: false,
//             },
//           ],
//         },
//       ],
//       attributes: {
//         // Include only needed raw fields — exclude timestamps
//         include: [
//           "post_type",
//           "opportunity_type",
//           // "job_status", ← not in model — omit
//           "job_role_id",
//           // "other_job_role", ← not in model — will be null/"" in frontend
//           "job_type",
//           "job_time",
//           "days_in_office",
//           "number_of_openings",
//           "job_description",
//           "candidate_preferences",
//           "women_preferred",
//           "stipend_type",
//           "stipend_min",
//           "stipend_max",
//           "incentive_per_year",
//           "perks", // uses getter
//           "screening_questions", // uses getter
//           "phone_contact",
//           "alternate_phone_number",
//           "is_custom_internship_date",
//           "internship_start_date",
//           "internship_from_date",
//           "internship_to_date",
//           "min_skill_match_required",
//           "duration_id",
//           // "other_duration", ← not in model — frontend handles fallback
//         ],
//         exclude: ["created_at", "updated_at", "deleted_at"],
//       },
//     });

//     if (!job) {
//       return res.status(404).json({
//         message: "Draft job not found or not owned by you.",
//       });
//     }

//     // --- Helper: extract IDs safely ---
//     const extractIds = (items, idField) =>
//       (items || [])
//         .map((item) => item[idField])
//         .filter((id) => Number.isInteger(id));

//     // --- Extract associations ---
//     const eligiblecity_ids = extractIds(job.eligibleCities, "id");
//     const eligiblecollege_ids = extractIds(job.eligibleColleges, "id");
//     const eligiblecourse_ids = extractIds(job.eligibleCourses, "id");
//     const skill_ids = extractIds(job.skills, "skill_id");

//     // --- Group skills by domain for domain_skill_map (optional — frontend can derive from skills list too)
//     const domainSkillMap = {};
//     (job.skills || []).forEach((skill) => {
//       const domainId = skill.domain_id;
//       if (!domainSkillMap[domainId]) domainSkillMap[domainId] = [];
//       domainSkillMap[domainId].push({
//         skill_id: skill.skill_id,
//         skill_name: skill.skill_name,
//       });
//     });

//     const domain_skill_map = Object.entries(domainSkillMap).map(
//       ([domain_id, skills]) => ({
//         domain_id: parseInt(domain_id, 10),
//         skill_ids: skills.map((s) => s.skill_id),
//       })
//     );

//     // --- Safe fallbacks for optional string/number fields ---
//     const safeString = (val) => (typeof val === "string" ? val : "");
//     const safeNumber = (val) => (typeof val === "number" ? val : null);

//     // ✅ Final payload: exactly what `mapDraftToFormValues` expects
//     const draftPayload = {
//       // Core
//       post_type: job.post_type,
//       opportunity_type: safeString(job.opportunity_type),
//       job_status: true, // frontend uses this for draft editing — set to true by default

//       // Job Role (job_role_id may be null → frontend shows "Other")
//       job_role_id: safeNumber(job.job_role_id),
//       other_job_role: "", // not persisted — frontend will use empty string

//       // Skills
//       skill_ids,
//       other_skills: [], // not persisted in this version — can extend later
//       domain_skill_map, // for UI reconstruction (if needed)

//       // Locations (IDs only — frontend handles "Other" via input)
//       eligiblecity_ids,
//       other_eligible_city_names: [], // not persisted — frontend uses empty array

//       // Colleges
//       eligiblecollege_ids,
//       other_eligible_college_names: [],

//       // Courses
//       eligiblecourse_ids,
//       other_eligible_course_names: [],

//       // Duration (ID only)
//       duration_id: safeNumber(job.duration_id),
//       other_duration: "", // not persisted

//       // Work Setup
//       job_type: ["In office", "Hybrid", "Remote"].includes(job.job_type)
//         ? job.job_type
//         : "In office",
//       job_time: ["Day Shift", "Night Shift", "Part-time"].includes(job.job_time)
//         ? job.job_time
//         : "Day Shift",
//       days_in_office: safeNumber(job.days_in_office),

//       // Numbers & Strings
//       number_of_openings: safeNumber(job.number_of_openings) ?? "",
//       job_description: safeString(job.job_description),
//       candidate_preferences: safeString(job.candidate_preferences),
//       women_preferred: Boolean(job.women_preferred),

//       // Stipend
//       stipend_type:
//         safeString(job.stipend_type) ||
//         (job.opportunity_type === "internship" ? "Paid" : "Fixed"),
//       stipend_min: safeNumber(job.stipend_min),
//       stipend_max: safeNumber(job.stipend_max),
//       incentive_per_year: safeString(job.incentive_per_year),

//       // Perks & Screening
//       perks: Array.isArray(job.perks) ? job.perks : [],
//       screening_questions: Array.isArray(job.screening_questions)
//         ? job.screening_questions.join("\n")
//         : typeof job.screening_questions === "string"
//         ? job.screening_questions
//         : "",

//       // Contact
//       phone_contact: safeString(job.phone_contact),
//       alternate_phone_number: safeString(job.alternate_phone_number),

//       // Internship Dates
//       is_custom_internship_date: Boolean(job.is_custom_internship_date),
//       internship_start_date: job.internship_start_date || "",
//       internship_from_date: job.internship_from_date || "",
//       internship_to_date: job.internship_to_date || "",

//       // Matching
//       minSkillMatchRequired: safeNumber(job.min_skill_match_required),
//     };

//     return res.status(200).json(draftPayload);
//   } catch (error) {
//     console.error("Error fetching job draft:", error);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };










exports.getJobsUniversityView = async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const uniDetail = await UniversityDetail.findOne({
      where: { user_id },
      attributes: ["school_college_id", "is_verified"],
    });

    if (!uniDetail) {
      return res.status(403).json({ message: "University profile not found" });
    }

    const { school_college_id, is_verified } = uniDetail;

    // Tie-up-only counts (jobs + projects) for this university
    // Assumption: company_university_tieups.university_id references school_colleges.id (same as school_college_id)
    let tieupCounts = { job_count: 0, internship_count: 0, project_count: 0 };
    if (school_college_id) {
      try {
        const rows = await sequelize.query(
          `
            SELECT
              SUM(CASE WHEN LOWER(jp.opportunity_type) = 'job' THEN 1 ELSE 0 END) AS job_count,
              SUM(CASE WHEN LOWER(jp.opportunity_type) = 'internship' THEN 1 ELSE 0 END) AS internship_count,
              SUM(CASE WHEN LOWER(jp.opportunity_type) = 'project' THEN 1 ELSE 0 END) AS project_count
            FROM (
              SELECT DISTINCT jp.job_id, jp.opportunity_type
              FROM job_posts jp
              INNER JOIN job_post_colleges jpc
                ON jpc.job_post_id = jp.job_id
               AND jpc.college_id = :collegeId
              INNER JOIN company_recruiter_profiles crp
                ON crp.id = jp.company_recruiter_profile_id
              INNER JOIN company_university_tieups cut
                ON cut.company_id = crp.id
               AND cut.university_id = :collegeId
               AND cut.status = 'active'
              WHERE jp.active_status = 1
            ) jp
          `,
          {
            replacements: { collegeId: school_college_id },
            type: sequelize.QueryTypes.SELECT,
          }
        );
        if (rows && rows[0]) {
          tieupCounts = {
            job_count: Number(rows[0].job_count || 0),
            internship_count: Number(rows[0].internship_count || 0),
            project_count: Number(rows[0].project_count || 0),
          };
        }
      } catch (e) {
        console.warn("getJobsUniversityView tie-up counts failed:", e.message || e);
      }
    }

    // --- PARSE QUERY PARAMS (mirroring student controller) ---
    const {
      jobProfile,
      location,
      jobType,
      company,
      opportunityType,
      minSalary,
      maxSalary,
      page,
      limit,
      offset,
      sortBy,
      sortOrder,
      targetedOnly, // e.g., '1' → only jobs targeting THIS university
    } = req.query;

    const pageSize = Math.min(parseInt(limit) || 20, 100);
    let offsetValue = 0;

    if (offset !== undefined) {
      offsetValue = parseInt(offset) || 0;
    } else {
      const pageNum = parseInt(page) || 1;
      offsetValue = (pageNum - 1) * pageSize;
    }

    const effectiveSortBy = sortBy || "relevance"; // 'relevance' = targeted first
    const effectiveSortOrder =
      (sortOrder || "desc").toLowerCase() === "asc" ? "ASC" : "DESC";
    const shouldFilterTargetedOnly = targetedOnly === "1";

    // --- PARSE FILTERS ---
    const jobProfiles = parseMultiFilter(jobProfile);
    const jobTypes = parseMultiFilter(jobType);
    const companies = parseMultiFilter(company);
    const opportunityTypes = parseMultiFilter(opportunityType);
    const locationTerms = parseMultiFilter(location);

    // --- BASE WHERE (shared across queries) ---
    const baseWhere = { active_status: 1 };

    // Job Type
    if (jobTypes) {
      baseWhere.job_type = {
        [Op.or]: jobTypes.map((term) => ({ [Op.like]: `%${term}%` })),
      };
    }

    // Opportunity Type
    if (opportunityTypes) {
      baseWhere.opportunity_type = {
        [Op.or]: opportunityTypes.map((term) => ({ [Op.like]: `%${term}%` })),
      };
    }

    // Salary
    if (minSalary || maxSalary) {
      const min = parseInt(minSalary) || 0;
      const max = parseInt(maxSalary) || Number.MAX_SAFE_INTEGER;
      baseWhere[Op.and] = [
        { stipend_max: { [Op.gte]: min } },
        { stipend_min: { [Op.lte]: max } },
      ];
    }

    // --- LOCATION FILTER (city-based) ---
    let locationFilteredJobIds = null;
    if (locationTerms && locationTerms.length > 0) {
      const cityMatches = await sequelize.query(
        `
          SELECT DISTINCT jp.job_id
          FROM job_posts jp
          INNER JOIN job_post_cities jpc ON jp.job_id = jpc.job_post_id
          INNER JOIN locations AS loc ON jpc.city_id = loc.id
          WHERE ${locationTerms
            .map(() => "LOWER(loc.name) LIKE ?")
            .join(" OR ")}
        `,
        {
          replacements: locationTerms.map((term) => `%${term}%`),
          type: sequelize.QueryTypes.SELECT,
        }
      );
      locationFilteredJobIds = cityMatches.map((row) => row.job_id);
      if (locationFilteredJobIds.length === 0) {
        return res.status(200).json({
          data:[],
          pagination: {
            total: 0,
            page: parseInt(page) || 1,
            limit: pageSize,
            hasNext: false,
            hasPrev: false,
            totalPages: 0,
          },
        });
      }
    }

    // --- BUILD TARGETED JOBS SUBQUERY (for this university) ---
    const isTargetedSubquery = school_college_id && is_verified
      ? `EXISTS (
          SELECT 1 FROM job_post_colleges jpc
          WHERE jpc.job_post_id = JobPost.job_id
            AND jpc.college_id = ${sequelize.escape(school_college_id)}
        )`
      : "FALSE";

    // --- APPLY TARGETED-ONLY FILTER (if requested) ---
    let whereConditions = { ...baseWhere };
    if (locationFilteredJobIds) {
      whereConditions.job_id = { [Op.in]: locationFilteredJobIds };
    }

    if (shouldFilterTargetedOnly) {
      if (!school_college_id || !is_verified) {
        // Cannot target → no results
        whereConditions.job_id = { [Op.in]: [] };
      } else {
        // AND with targeted subquery
        whereConditions[Op.and] = [
          ...(whereConditions[Op.and] || []),
          literal(isTargetedSubquery),
        ];
      }
    }

    // --- FETCH JOBS WITH INCLUDES (DRY: define once) ---
    const jobInclude = [
      {
        model: JobRole,
        attributes: ["title"],
        where: jobProfiles
          ? {
              [Op.or]: jobProfiles.map((term) => ({
                title: { [Op.like]: `%${term}%` },
              })),
            }
          : undefined,
        required: !!jobProfiles,
      },
      {
        model: CompanyRecruiterProfile,
        attributes: [
          "company_name",
          "logo_url",
          "company_location_id",
          "is_email_verified",
          "is_phone_verified",
          "is_gst_verified",
        ],
        where: companies
          ? {
              [Op.or]: companies.map((term) => ({
                company_name: { [Op.like]: `%${term}%` },
              })),
            }
          : undefined,
        required: !!companies,
        include: [
          {
            model: Location,
            as: "companyLocation",
            attributes: ["name"],
            required: false,
          },
        ],
      },
      {
        model: SchoolCollege,
        as: "eligibleColleges",
        attributes: ["id", "name"], 
        through: { attributes: [] },
        required: false,
      },
      {
        model: Skill,
        as: "skills",
        attributes: ["skill_name"],
        through: { attributes: [] },
        required: false,
      },
    ];

    // --- COUNT LOGIC ---
    const total = await JobPost.count({ where: whereConditions });

    // --- FETCH RAW JOBS ---
    let rawJobPosts = [];

    if (effectiveSortBy === "relevance" && !shouldFilterTargetedOnly) {
      // Default priority: target this university -> target other colleges -> open to all
      const tierOrderExpr =
        school_college_id && is_verified
          ? literal(`CASE
            WHEN EXISTS (
              SELECT 1 FROM job_post_colleges jpc
              WHERE jpc.job_post_id = JobPost.job_id
                AND jpc.college_id = ${sequelize.escape(school_college_id)}
            ) THEN 0
            WHEN EXISTS (
              SELECT 1 FROM job_post_colleges jpc2
              WHERE jpc2.job_post_id = JobPost.job_id
            ) THEN 1
            ELSE 2
          END`)
          : literal(`CASE
            WHEN EXISTS (
              SELECT 1 FROM job_post_colleges jpc2
              WHERE jpc2.job_post_id = JobPost.job_id
            ) THEN 1
            ELSE 2
          END`);

      rawJobPosts = await JobPost.findAll({
        where: whereConditions,
        include: jobInclude,
        order: [[tierOrderExpr, "ASC"], ["created_at", "DESC"]],
        limit: pageSize,
        offset: offsetValue,
      });
    } else {
      // Normal fetch: created_at or targetedOnly mode
      let order = [["created_at", effectiveSortOrder]];
      if (effectiveSortBy !== "created_at" && effectiveSortBy !== "relevance") {
        order = [["created_at", "DESC"]];
      }

      rawJobPosts = await JobPost.findAll({
        where: whereConditions,
        include: jobInclude,
        order,
        limit: pageSize,
        offset: offsetValue,
      });
    }

    // --- TRANSFORM ---
    const now = new Date();
    const opportunities = rawJobPosts.map((job) => {
      const postedDate = new Date(job.created_at);
      const diffDays = Math.floor((now - postedDate) / (1000 * 60 * 60 * 24));
      let postedLabel = "Today";
      if (diffDays === 1) postedLabel = "1 day ago";
      else if (diffDays > 1) postedLabel = `${diffDays} days ago`;

      // Targeting this university?
      const targetingOurCollege =
        school_college_id &&
        is_verified &&
        !!job.eligibleColleges?.some((c) => c.id === school_college_id);
      const targetingOtherCollege =
        (job.eligibleColleges?.length || 0) > 0 && !targetingOurCollege;

      const experienceRange = (() => {
        const minExp = Number.isFinite(job.experience_min) ? job.experience_min : null;
        const maxExp = Number.isFinite(job.experience_max) ? job.experience_max : null;
        if (minExp === null && maxExp === null) return "Open to freshers";
        if (minExp !== null && maxExp !== null) return `${minExp} to ${maxExp} years`;
        if (minExp !== null) return `${minExp}+ years`;
        return `Up to ${maxExp} years`;
      })();

      return {
        job_id: job.job_id,
        company_name: job.CompanyRecruiterProfile?.company_name || "",
        company_location:
          job.CompanyRecruiterProfile?.companyLocation?.name || "",
        logo_url: job.CompanyRecruiterProfile?.logo_url || "",
        jobRole: job.JobRole?.title || "",
        skills: job.skills?.map((s) => s.skill_name) || [],
        stipend_range:
          job.stipend_min && job.stipend_max
            ? `₹${job.stipend_min} – ₹${job.stipend_max}`
            : "",
        posted_days_ago: postedLabel,
        hiring_status: job.number_of_openings > 0 ? "Actively Hiring" : "Closed",
        is_college_specific: (job.eligibleColleges?.length || 0) > 0,
        targeting_our_college: targetingOurCollege,
        targeting_other_college: targetingOtherCollege,
        experience_range: experienceRange,
      };
    });

    let summary = {
      targeted_counts: { opportunities: 0, jobs: 0, internships: 0, projects: 0 },
      companies_by_type: { opportunities: [], jobs: [], internships: [], projects: [] },
    };
    if (school_college_id && is_verified) {
      const targetedCountsRows = await sequelize.query(
        `
          SELECT LOWER(jp.opportunity_type) AS opportunity_type, COUNT(*) AS total
          FROM job_posts jp
          WHERE jp.active_status = 1
            AND EXISTS (
              SELECT 1
              FROM job_post_colleges jpc
              WHERE jpc.job_post_id = jp.job_id
                AND jpc.college_id = :collegeId
            )
          GROUP BY LOWER(jp.opportunity_type)
        `,
        {
          replacements: { collegeId: school_college_id },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      const companyRows = await sequelize.query(
        `
          SELECT
            LOWER(jp.opportunity_type) AS opportunity_type,
            crp.id AS company_id,
            crp.company_name,
            crp.logo_url,
            COUNT(*) AS jobs_count
          FROM job_posts jp
          INNER JOIN company_recruiter_profiles crp
            ON crp.id = jp.company_recruiter_profile_id
          WHERE jp.active_status = 1
            AND EXISTS (
              SELECT 1
              FROM job_post_colleges jpc
              WHERE jpc.job_post_id = jp.job_id
                AND jpc.college_id = :collegeId
            )
          GROUP BY LOWER(jp.opportunity_type), crp.id, crp.company_name, crp.logo_url
          ORDER BY jobs_count DESC, crp.company_name ASC
        `,
        {
          replacements: { collegeId: school_college_id },
          type: sequelize.QueryTypes.SELECT,
        }
      );

      const counts = { opportunities: 0, jobs: 0, internships: 0, projects: 0 };
      targetedCountsRows.forEach((row) => {
        const type = row.opportunity_type;
        const n = Number(row.total) || 0;
        counts.opportunities += n;
        if (type === "job") counts.jobs = n;
        if (type === "internship") counts.internships = n;
        if (type === "project") counts.projects = n;
      });

      const companiesByType = { opportunities: [], jobs: [], internships: [], projects: [] };
      const allCompanyMap = new Map();
      companyRows.forEach((row) => {
        const company = {
          company_id: row.company_id,
          company_name: row.company_name,
          logo_url: row.logo_url,
          jobs_count: Number(row.jobs_count) || 0,
        };
        const type = row.opportunity_type;
        if (type === "job") companiesByType.jobs.push(company);
        if (type === "internship") companiesByType.internships.push(company);
        if (type === "project") companiesByType.projects.push(company);
        const prev = allCompanyMap.get(company.company_id);
        allCompanyMap.set(
          company.company_id,
          prev ? { ...prev, jobs_count: prev.jobs_count + company.jobs_count } : company
        );
      });
      companiesByType.opportunities = Array.from(allCompanyMap.values()).sort(
        (a, b) => b.jobs_count - a.jobs_count
      );

      summary = { targeted_counts: counts, companies_by_type: companiesByType };
    }

    // --- PAGINATION ---
    const currentPage =
      offset !== undefined
        ? Math.floor(offsetValue / pageSize) + 1
        : parseInt(page) || 1;

    const hasNext = offsetValue + pageSize < total;
    const hasPrev = offsetValue > 0;

    return res.status(200).json({
      data: opportunities,
      summary: {
        ...summary,
        job_count: tieupCounts.job_count,
        internship_count: tieupCounts.internship_count,
        project_count: tieupCounts.project_count,
      },
      pagination: {
        total,
        page: currentPage,
        limit: pageSize,
        offset: offsetValue,
        hasNext,
        hasPrev,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error("Error in getJobsUniversityView:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Masking utils (same as before)
const maskString = (str, visibleStart = 1, visibleEnd = 1, maskChar = "*") => {
  if (!str || typeof str !== "string") return "";
  const len = str.length;
  if (len <= visibleStart + visibleEnd) return str.replace(/./g, maskChar);
  return (
    str.substring(0, visibleStart) +
    maskChar.repeat(len - visibleStart - visibleEnd) +
    str.substring(len - visibleEnd)
  );
};
const maskEmail = (email) => {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const [domainName, tld] = domain.split(".");
  return `${maskString(local, 1, 0)}@${maskString(domainName, 1, 0)}.${tld}`;
};
const maskPhone = (phone) => {
  const cleaned = (phone || "").replace(/\D/g, "");
  return cleaned.length === 10
    ? `${cleaned.slice(0, 2)}***${cleaned.slice(6)}`
    : maskString(phone, 2, 4);
};
const maskName = (name) =>
  name
    ? name
        .split(" ")
        .map((p) => maskString(p, 1, 0))
        .join(" ")
    : "";

exports.getJobDetailsUniversity = async (req, res) => {
  try {
    const { job_id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    if (!job_id) {
      return res.status(400).json({ message: "Job ID is required." });
    }

    //  Get college context
    const uniDetail = await UniversityDetail.findOne({
      where: { user_id },
      attributes: ["school_college_id", "is_verified", "id"],
    });

    if (!uniDetail) {
      return res.status(403).json({ message: "University profile not found" });
    }

    const { school_college_id, is_verified } = uniDetail;

    //  Fetch job — same robust include as student version
    const job = await JobPost.findOne({
      where: { job_id },
      include: [
        { model: JobRole, attributes: ["id", "title"] },
        {
          model: CompanyRecruiterProfile,
          include: [
            { model: Industry, as: "industry", attributes: ["name"] },
            { model: Location, as: "companyLocation", attributes: ["name"] },
            {
              model: User,
              as: "user",
              attributes: ["first_name", "last_name", "email", "phone", "id"],
            },
            { model: JobRole, as: "designation", attributes: ["title"] },
          ],
          attributes: [
            "company_name",
            "logo_url",
            "about",
            "hiring_preferences",
            "is_email_verified",
            "is_phone_verified",
            "is_gst_verified",
            "profile_pic",
          ],
        },
        { model: Location, as: "eligibleCities", attributes: ["name"] },
        {
          model: SchoolCollege,
          as: "eligibleColleges",
          attributes: ["id", "name"],
        },
        { model: Course, as: "eligibleCourses", attributes: ["name"] },
        { model: Skill, as: "skills", attributes: ["skill_name"] },
      ],
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found." });
    }

   

    //  Check if this job targets the logged-in college
    const targetingOurCollege =
      is_verified && school_college_id
        ? job.eligibleColleges?.some(
            (college) => college.id === school_college_id
          ) || false
        : false;

    //  Stats
    const numberOfApplicants = await Application.count({
      where: { job_post_id: job_id },
    });
    const postedDaysAgo = (() => {
      const diff = Math.floor((new Date() - new Date(job.created_at)) / 864e5);
      return diff === 0
        ? "Today"
        : diff === 1
        ? "1 day ago"
        : `${diff} days ago`;
    })();

    //  Stipend
    const salary =
      job.stipend_min && job.stipend_max
        ? `${job.stipend_min} - ${job.stipend_max}`
        : "";

    //  Duration
    const duration = await FilterOption.findOne({
      where: { id: job.duration_id, category: "duration" },
      attributes: ["value"],
    });

    //  Build response
    // Recruiter info — masked unless paid (future extensible)
    const recruiter = job.CompanyRecruiterProfile?.user || {};
    const full_name = `${recruiter.first_name || ""} ${
      recruiter.last_name || ""
    }`.trim();
    let canViewRecruiter = false;
    let recruiterUserId = null;

    if (recruiter && recruiter.id) {
      recruiterUserId = recruiter.id;

      //  Check if this university has already unlocked this recruiter
      const existingUnlock = await ContactUnlock.findOne({
        where: {
          university_id: uniDetail.id, // ← university_details.id (PK)
          recruiter_user_id: recruiter.id, // ← user.id of recruiter
          // job_id can also shift the scope to job
        },
      });

      canViewRecruiter = !!existingUnlock;
    }

    const response = {
      //  Core
      job_id,
      opportunity_type: job.opportunity_type,
      job_type: job.job_type,
      jobRole: job.JobRole?.title || "",
      jobProfile: job.jobProfile,
      job_description: job.job_description,
      posted_days_ago: postedDaysAgo,

      //  Targeting context (critical for college!)
      targeting_our_college: targetingOurCollege,
      is_college_specific: job.eligibleColleges?.length > 0,

      //  Location & Eligibility
      job_location: job.jobLocation,
      eligible_colleges: job.eligibleColleges?.map((c) => c.name) || [],
      eligible_courses: job.eligibleCourses?.map((c) => c.name) || [],
      eligible_cities: job.eligibleCities?.map((c) => c.name) || [],
      skillsRequired: job.skills?.map((s) => s.skill_name) || [],
      skill_required_note: job.skill_required_note,
      candidate_preferences: job.candidate_preferences,
      women_preferred: job.women_preferred,

      //  Company
      company_name: job.CompanyRecruiterProfile?.company_name || "",
      logo_url: job.CompanyRecruiterProfile?.logo_url || "",
      aboutCompany: job.CompanyRecruiterProfile?.about || "",
      companyIndustry: job.CompanyRecruiterProfile?.industry?.name || "",
      companyLocation: job.CompanyRecruiterProfile?.companyLocation?.name || "",

      //  Recruiter (MASKED)
      recruiter: {
        full_name: canViewRecruiter ? full_name : maskName(full_name),
        email: canViewRecruiter ? recruiter.email : maskEmail(recruiter.email),
        phone: canViewRecruiter ? recruiter.phone : maskPhone(recruiter.phone),
        designation: job.CompanyRecruiterProfile?.designation?.title || "",
        profile_pic: job.CompanyRecruiterProfile?.profile_pic || "",
      },
      can_view_recruiter_info: canViewRecruiter, // frontend uses this

      //  Hiring
      number_of_openings: job.number_of_openings,
      hiringStatus: job.number_of_openings > 0 ? "Actively Hiring" : "Closed",
      number_of_applicants: numberOfApplicants,

      //  Compensation
      salary,
      stipend_type: job.stipend_type || "",
      incentive_per_year: job.incentive_per_year || "",
      perks: Array.isArray(job.perks) ? job.perks : [],

      //  Internship
      internshipDuration: duration?.value || "",
      internship_start_date: job.internship_start_date,
      internship_from_date: job.internship_from_date,
      internship_to_date: job.internship_to_date,
      is_custom_internship_date: job.is_custom_internship_date,

      recruiter_user_id: recruiterUserId, //will remove later on and shift to directly extracting from job_id
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in getUniversityJobDetails:", error);
    return res.status(500).json({ message: "Server error" });
  }
};






// exports.getHomepageOpportunities = async (req, res) => {
//   try {
//     const user_id = req.user?.id;

//     const {
//       limit = "20",      // default 6 (2 per category × 3)
//       offset = "0",
//     } = req.query;

//     const parsedLimit = Math.min(parseInt(limit) || 6, 20);
//     const parsedOffset = parseInt(offset) || 0;

//     // --- Fetch user skills (only if logged in) ---
//     let userSkillSet = new Set();
//     if (user_id) {
//       const userSkills = await sequelize.query(
//         `SELECT LOWER(s.skill_name) AS name FROM user_skills us JOIN skills s ON us.skill_id = s.skill_id WHERE us.user_id = ?`,
//         { replacements: [user_id], type: sequelize.QueryTypes.SELECT }
//       );
//       userSkillSet = new Set(userSkills.map(s => s.name));
//     }

//     // --- MAIN QUERY: Jobs + minimal includes + cities ---
//     const jobs = await JobPost.findAll({
//       where: { active_status: 1 },
//       include: [
//         {
//           model: JobRole,
//           as: "JobRole",
//           attributes: ["title"],
//         },
//         {
//           model: CompanyRecruiterProfile,
//           as: "CompanyRecruiterProfile",
//           attributes: ["company_name", "logo_url"],
//         },
//         // Only skills if user logged in
//         ...(user_id
//           ? [
//               {
//                 model: Skill,
//                 as: "skills",
//                 attributes: ["skill_name"],
//                 through: { attributes: [] },
//               },
//             ]
//           : []),
//         // Locations for display
//         {
//           model: Location,
//           as: "eligibleCities",
//           attributes: ["name"],
//           through: { attributes: [] },
//         },
//       ],
//       attributes: [
//         "job_id",
//         "opportunity_type", // "Job", "Internship", "Project"
//         "job_type",         // "in-office", "remote", "hybrid"
//         "candidate_preferences",
//         "stipend_min",
//         "stipend_max",
//         "stipend_type",
//         "number_of_openings",
//         "created_at",
//       ],
//       order: [["created_at", "DESC"]],
//       limit: parsedLimit,
//       offset: parsedOffset,
//     });

//     // --- Transform ---
//     const now = new Date();
//     const result = jobs.map((job) => {
//       // === Location ===
//       let displayLocation = "Hybrid";
//       const cities = job.eligibleCities || [];
//       if (job.job_type === "remote") {
//         displayLocation = "Remote";
//       } else if (job.job_type === "in-office" || job.job_type === "hybrid") {
//         if (cities.length === 1) {
//           displayLocation = cities[0].name || "Location";
//         } else if (cities.length > 1) {
//           displayLocation = "Multiple";
//         } else {
//           displayLocation = job.job_type === "hybrid" ? "Hybrid" : "In-office";
//         }
//       }

//       // === Salary ===
//       let salary = "—";
//       if (job.stipend_type === "negotiable") {
//         salary = "Negotiable";
//       } else if (job.stipend_min || job.stipend_max) {
//         const min = job.stipend_min || 0;
//         const max = job.stipend_max || min;
//         if (min === max) {
//           salary = `₹${min.toLocaleString("en-IN")}`;
//         } else {
//           salary = `₹${min.toLocaleString("en-IN")} – ₹${max.toLocaleString("en-IN")}`;
//         }
//       }

//       // === Posted ===
//       const postedAt = new Date(job.created_at);
//       const diffDays = Math.floor((now - postedAt) / (864e5)); // 1000*60*60*24
//       let posted = diffDays === 0 ? "Today" : diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;

//       // === Match % (only if logged in) ===
//       let match = null;
//       let skillsMissing = null;
//       if (user_id) {
//         const jobSkills = job.skills?.map(s => s.skill_name.toLowerCase()) || [];
//         if (jobSkills.length > 0) {
//           const matched = jobSkills.filter(s => userSkillSet.has(s)).length;
//           match = Math.round((matched / jobSkills.length) * 100);
//           skillsMissing = match < 50;
//         } else {
//           match = 0;
//           skillsMissing = true;
//         }
//       }

//       return {
//         job_id: job.job_id,
//         title: job.JobRole?.title || "—",
//         company: job.CompanyRecruiterProfile?.company_name || "—",
//         logo_url: job.CompanyRecruiterProfile?.logo_url || "/placeholder-logo.png",
//         location: displayLocation,
//         exp: job.candidate_preferences || "—",
//         salary,
//         posted,
//         hiring: job.number_of_openings > 0,
//         match, // e.g. 92 → frontend shows "92%"
//         skillsMissing, // boolean or null
//         category: job.opportunity_type || "Job", // for frontend grouping
//       };
//     });

//     // ✅ Optional: Group by category in backend (reduces frontend work)
//     const grouped = {
//       Job: [],
//       Internship: [],
//       Project: [],
//     };

//     result.forEach(item => {
//       if (grouped[item.category]) {
//         grouped[item.category].push(item);
//       } else {
//         // fallback to Jobs
//         grouped.Jobs.push(item);
//       }
//     });

//     res.json({
//       success: true,
//        grouped,
//       pagination: {
//         limit: parsedLimit,
//         offset: parsedOffset,
//         total: null, // frontend can stop "Load More" when < limit items returned
//       },
//     });
//   } catch (error) {
//     console.error("Homepage opportunities error:", error);
//     res.status(500).json({ error: "Failed to load opportunities" });
//   }
// };



exports.getHomepageOpportunities = async (req, res) => {
  try {
    const user_id = req.user?.id;

    // Parse limit — now *per category*
    const limitParam = req.query.limit || "8"; // default 8 per category
    const limit = Math.min(parseInt(limitParam) || 8, 15); // cap at 15

    // Fetch user skills only once (if logged in)
    let userSkillSet = new Set();
    if (user_id) {
      const userSkills = await sequelize.query(
        `SELECT LOWER(s.skill_name) AS name FROM user_skills us 
         INNER JOIN skills s ON us.skill_id = s.skill_id 
         WHERE us.user_id = ?`,
        { replacements: [user_id], type: sequelize.QueryTypes.SELECT }
      );
      userSkillSet = new Set(userSkills.map((s) => s.name));
    }

    // Helper: transform one job row into frontend shape
    const transformJob = (job, userSkillSet, isUserLoggedIn) => {
      // --- Location ---
      let displayLocation = "Hybrid";
      const cities = job.eligibleCities || [];
      if (job.job_type === "Remote") {
        displayLocation = "Remote";
      } else if (job.job_type === "In office" || job.job_type === "Hybrid") {
        if (cities.length === 1) {
          displayLocation = cities[0].name || "Location";
        } else if (cities.length > 1) {
          displayLocation = "Multiple";
        } else {
          displayLocation = job.job_type === "Hybrid" ? "Hybrid" : "In-office";
        }
      }

      // --- Salary ---
      let salary = "—";
      if (job.stipend_type === "negotiable") {
        salary = "Negotiable";
      } else if (job.stipend_min || job.stipend_max) {
        const min = job.stipend_min || 0;
        const max = job.stipend_max || min;
        if (min === max) {
          salary = `₹${min.toLocaleString("en-IN")}`;
        } else {
          salary = `₹${min.toLocaleString("en-IN")} – ₹${max.toLocaleString(
            "en-IN"
          )}`;
        }
      }

      // --- Posted ---
      const now = new Date();
      const postedAt = new Date(job.created_at);
      const diffDays = Math.floor((now - postedAt) / (1000 * 60 * 60 * 24));
      let posted =
        diffDays === 0
          ? "Today"
          : diffDays === 1
          ? "1 day ago"
          : `${diffDays} days ago`;

      // --- Match % & skills missing (only if logged in) ---
      let match = null;
      let skillsMissing = null;
      if (isUserLoggedIn) {
        const jobSkills =
          job.skills?.map((s) => s.skill_name.toLowerCase()) || [];
        if (jobSkills.length > 0) {
          const matched = jobSkills.filter((s) => userSkillSet.has(s)).length;
          match = Math.round((matched / jobSkills.length) * 100);
          skillsMissing = match < 50;
        } else {
          match = 0;
          skillsMissing = true;
        }
      }

      return {
        job_id: job.job_id,
        title: job.JobRole?.title || "—",
        company: job.CompanyRecruiterProfile?.company_name || "—",
        logo_url:
          job.CompanyRecruiterProfile?.logo_url || "/placeholder-logo.png",
        location: displayLocation,
        exp: job.candidate_preferences || "—",
        salary: salary,
        posted: posted,
        hiring: job.number_of_openings > 0,
        match: match,
        skillsMissing: skillsMissing,
        category: job.opportunity_type, // e.g. "Job", not "Jobs"
      };
    };

    // --- Fetch per category (parallel) ---
    const categories = ["Job", "Internship", "Project"]; // singular, as in DB

    const fetchCategory = async (type) => {
      const jobs = await JobPost.findAll({
        where: {
          active_status: 1,
          opportunity_type: type, // exact match
        },
        include: [
          {
            model: JobRole,
            as: "JobRole",
            attributes: ["title"],
          },
          {
            model: CompanyRecruiterProfile,
            as: "CompanyRecruiterProfile",
            attributes: ["company_name", "logo_url"],
          },
          ...(user_id
            ? [
                {
                  model: Skill,
                  as: "skills",
                  attributes: ["skill_name"],
                  through: { attributes: [] },
                },
              ]
            : []),
          {
            model: Location,
            as: "eligibleCities",
            attributes: ["name"],
            through: { attributes: [] },
          },
        ],
        attributes: [
          "job_id",
          "opportunity_type",
          "job_type",
          "candidate_preferences",
          "stipend_min",
          "stipend_max",
          "stipend_type",
          "number_of_openings",
          "created_at",
        ],
        order: [["created_at", "DESC"]],
        limit: limit,
      });

      return jobs.map((job) => transformJob(job, userSkillSet, !!user_id));
    };

    // Run all 3 in parallel
    const [jobItems, internshipItems, projectItems] = await Promise.all([
      fetchCategory("Job"),
      fetchCategory("Internship"),
      fetchCategory("Project"),
    ]);

    // Return in expected grouped format (plural keys for frontend)
    const result = {
      Jobs: jobItems,
      Internships: internshipItems,
      Projects: projectItems,
    };

    res.status(200).json({
      success: true,
      data: result,
      pagination: {
        limit: limit,
        hasMore: false, // frontend can still "Load More" by increasing limit later
      },
    });
  } catch (error) {
    console.error("Homepage opportunities error:", error);
    res.status(500).json({ error: "Failed to load opportunities" });
  }
};














































// const { Op } = require("sequelize");

// // Utility: normalize value to number or null
// const toNumberOrNull = (val) => {
//   if (val == null) return null;
//   const num = Number(val);
//   return isNaN(num) ? null : num;
// };

// // Utility: safe string fallback
// const toString = (val) => (typeof val === "string" ? val.trim() : "");

// // Shared transformer — used by both draft & repost
// const transformJobToDraftPayload = async (job, models) => {
//   // 1. Fetch all required associations in parallel
//   const [
//     eligibleCities,
//     eligibleColleges,
//     eligibleCourses,
//     jobPostSkills,
//     jobRole,
//   ] = await Promise.all([
//     job.getEligibleCities({ attributes: ["id", "name"] }),
//     job.getEligibleColleges({ attributes: ["id", "name"] }),
//     job.getEligibleCourses({ attributes: ["id", "name"] }),
//     job.getSkills({
//       through: { attributes: ["type", "min_experience_months"] },
//       include: [
//         {
//           model: models.Domain,
//           as: "domain",
//           attributes: ["domain_id", "domain_name"],
//         },
//       ],
//     }),
//     job.getJobRole({ attributes: ["id", "title"] }),
//   ]);

//   // 2. Build selectedDomainSkills (matches frontend state shape)
//   const domainMap = {};
//   for (const skill of jobPostSkills) {
//     const domainId = skill.domain?.domain_id || `custom_${Date.now()}`;
//     const domainKey = `${domainId}`;

//     if (!domainMap[domainKey]) {
//       domainMap[domainKey] = {
//         id: `card-${domainKey}-${Date.now()}`,
//         domain: skill.domain
//           ? { id: skill.domain.domain_id, name: skill.domain.domain_name }
//           : { __custom: "Custom Domain" },
//         skills: [],
//       };
//     }

//     domainMap[domainKey].skills.push({
//       skill_id: skill.skill_id,
//       skill_name: skill.skill_name,
//       mustHave: skill.JobPostSkill?.type === "must_have",
//       min_experience_months: toNumberOrNull(
//         skill.JobPostSkill?.min_experience_months
//       ),
//     });
//   }

//   // 3. Resolve specializations (domains used as specializations)
//   let specializationDomains = [];
//   if (Array.isArray(job.eligible_specialization_ids) && job.eligible_specialization_ids.length > 0) {
//     specializationDomains = await models.Domain.findAll({
//       where: { domain_id: job.eligible_specialization_ids },
//       attributes: ["domain_id", "domain_name"],
//     });
//   }
//   const specializationMap = Object.fromEntries(
//     specializationDomains.map(d => [d.domain_id, d.domain_name])
//   );

//   const eligible_specializations = [
//     ...(job.eligible_specialization_ids || []).map(id => ({
//       id,
//       name: specializationMap[id] || `Specialization ${id}`,
//     })),
//     ...(job.other_eligible_specializations || []).map(name => ({
//       id: null,
//       name: toString(name),
//     })),
//   ];

//   // 4. Build final payload
//   return {
//     // Core
//     post_type: job.post_type,
//     opportunity_type: job.opportunity_type,
//     job_status: job.active_status !== 0, // true = not draft

//     // Job Role
//     job_role_id: toNumberOrNull(job.job_role_id),
//     other_job_role: jobRole?.title || "",

//     // Skills → DIRECT STATE INJECTION
//     selectedDomainSkills: Object.values(domainMap),

//     // Locations
//     eligible_cities: eligibleCities.map(c => ({ id: c.id, name: c.name })),

//     // Colleges
//     eligible_colleges: eligibleColleges.map(c => ({ id: c.id, name: c.name })),

//     // Courses
//     eligible_courses: eligibleCourses.map(c => ({ id: c.id, name: c.name })),

//     // Duration
//     duration_id: toNumberOrNull(job.duration_id),
//     other_duration: "", // Not stored separately; use duration_id lookup if needed

//     // Work Setup
//     job_type: ["In office", "Hybrid", "Remote"].includes(job.job_type)
//       ? job.job_type
//       : "In office",
//     job_time: ["Day Shift", "Night Shift", "Part-time"].includes(job.job_time)
//       ? job.job_time
//       : "Day Shift",
//     days_in_office: toNumberOrNull(job.days_in_office),

//     // Numbers & Strings
//     number_of_openings: toNumberOrNull(job.number_of_openings) ?? 1,
//     job_description: toString(job.job_description),
//     candidate_preferences: toString(job.candidate_preferences),
//     women_preferred: Boolean(job.women_preferred),

//     // Stipend
//     stipend_type: toString(job.stipend_type) || (job.opportunity_type === "Internship" ? "Paid" : "Fixed"),
//     stipend_min: toNumberOrNull(job.stipend_min),
//     stipend_max: toNumberOrNull(job.stipend_max),
//     incentive_per_year: toString(job.incentive_per_year),

//     // Perks & Screening
//     perks: Array.isArray(job.perks) ? job.perks : [],
//     screening_questions: Array.isArray(job.screening_questions)
//       ? job.screening_questions
//       : [],

//     // Contact
//     phone_contact: toString(job.phone_contact),
//     alternate_phone_number: toString(job.alternate_phone_number),

//     // Internship Dates
//     is_custom_internship_date: Boolean(job.is_custom_internship_date),
//     internship_start_date: job.internship_start_date || "",
//     internship_from_date: job.internship_from_date || "",
//     internship_to_date: job.internship_to_date || "",

//     // Project Dates
//     project_start_date: job.project_start_date || "",
//     project_end_date: job.project_end_date || "",

//     // Matching
//     minSkillMatchRequired: toNumberOrNull(job.min_skill_match_required),

//     // Education
//     eligible_education_levels: Array.isArray(job.eligible_education_levels)
//       ? job.eligible_education_levels
//       : [],
//     eligible_specializations,
//     include_pursuing_students: Boolean(job.include_pursuing_students),

//     // Experience
//     experience_required: Boolean(job.experience_required),
//     experience_min: toNumberOrNull(job.experience_min),
//     experience_max: toNumberOrNull(job.experience_max),
//     experience_types: Array.isArray(job.experience_types)
//       ? job.experience_types
//       : [],
//   };
// };

// // ====== GET DRAFT ======
// exports.getDraftOpportunity = async (req, res) => {
//   try {
//     const { job_id } = req.params;
//     const user_id = req.user?.id;

//     if (!job_id || !user_id) {
//       return res.status(400).json({ message: "Job ID and user ID are required." });
//     }

//     // Auth checks (same as before)
//     const user = await req.db.User.findOne({
//       where: { id: user_id, user_role: "COMPANY" },
//     });
//     if (!user) {
//       return res.status(403).json({ message: "Unauthorized." });
//     }

//     const companyProfile = await req.db.CompanyRecruiterProfile.findOne({
//       where: { user_id },
//     });
//     if (!companyProfile) {
//       return res.status(404).json({ message: "Company profile not found." });
//     }

//     // Fetch DRAFT only (active_status = 0)
//     const job = await req.db.JobPost.findOne({
//       where: {
//         job_id,
//         company_recruiter_profile_id: companyProfile.id,
//         active_status: 0,
//       },
//     });

//     if (!job) {
//       return res.status(404).json({ message: "Draft not found." });
//     }

//     const payload = await transformJobToDraftPayload(job, req.db);
//     return res.status(200).json(payload);
//   } catch (error) {
//     console.error("Error in getDraftOpportunity:", error);
//     return res.status(500).json({ message: "Server error.", error: error.message });
//   }
// };

// // ====== GET REPOST DATA ======
// exports.getJobForRepost = async (req, res) => {
//   try {
//     const { job_id } = req.params;
//     const user_id = req.user?.id;

//     if (!job_id || !user_id) {
//       return res.status(400).json({ message: "Job ID and user ID are required." });
//     }

//     const user = await req.db.User.findOne({
//       where: { id: user_id, user_role: "COMPANY" },
//     });
//     if (!user) {
//       return res.status(403).json({ message: "Unauthorized." });
//     }

//     const companyProfile = await req.db.CompanyRecruiterProfile.findOne({
//       where: { user_id },
//     });
//     if (!companyProfile) {
//       return res.status(404).json({ message: "Company profile not found." });
//     }

//     // Fetch ACTIVE or INACTIVE jobs (NOT drafts)
//     const job = await req.db.JobPost.findOne({
//       where: {
//         job_id,
//         company_recruiter_profile_id: companyProfile.id,
//         active_status: { [Op.ne]: 0 }, // exclude drafts
//       },
//     });

//     if (!job) {
//       return res.status(404).json({ message: "Job not found or not eligible for repost." });
//     }

//     const payload = await transformJobToDraftPayload(job, req.db);

//     // Adjust for repost flow:
//     payload.job_status = true;           // reset to active
//     payload.active_status = 0;           // will be saved as draft
//     payload.post_type = "active";        // default to active

//     // Clear time-sensitive fields
//     if (payload.opportunity_type === "Internship") {
//       payload.is_custom_internship_date = false;
//       payload.internship_from_date = "";
//       payload.internship_to_date = "";
//     }
//     if (payload.opportunity_type === "Project") {
//       payload.project_start_date = "";
//       payload.project_end_date = "";
//     }

//     return res.status(200).json(payload);
//   } catch (error) {
//     console.error("Error in getJobForRepost:", error);
//     return res.status(500).json({ message: "Server error.", error: error.message });
//   }
// };





























































// ====== SHARED TRANSFORMER ======
const transformJobToDraftPayload = async (job, models) => {
  // Fetch associations in parallel
  const [
    eligibleCities,
    eligibleColleges,
    eligibleCourses,
    jobRole,
    jobPostSkillsWithMetadata,
  ] = await Promise.all([
    job.getEligibleCities({ attributes: ["id", "name"] }),
    job.getEligibleColleges({ attributes: ["id", "name"] }),
    job.getEligibleCourses({ attributes: ["id", "name"] }),
    job.getJobRole({ attributes: ["id", "title"] }),
    models.JobPostSkill.findAll({
      where: { job_post_id: job.job_id },
      include: [
        {
          model: models.Skill,
          as: "Skill",
          attributes: ["skill_id", "skill_name", "domain_id"],
          include: [
            {
              model: models.Domain,
              as: "domain",
              attributes: ["domain_id", "domain_name"],
            },
          ],
        },
      ],
      attributes: ["type", "min_experience_months"],
    }),
  ]);

  // Build selectedDomainSkills (matches frontend state EXACTLY)
  const domainGroup = {};
  jobPostSkillsWithMetadata.forEach((jps) => {
    const skill = jps.Skill;
    if (!skill) return;

    const domainId = skill.domain?.domain_id || null;
    const domainName = skill.domain?.domain_name || "Uncategorized";
    const domainKey = domainId ? `d_${domainId}` : `custom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    if (!domainGroup[domainKey]) {
      domainGroup[domainKey] = {
        id: `card-${domainKey}`,
        domain: domainId
          ? { id: domainId, name: domainName }
          : { __custom: domainName },
        skills: [],
      };
    }

    domainGroup[domainKey].skills.push({
      skill_id: skill.skill_id,
      skill_name: skill.skill_name,
      mustHave: jps.type === "must_have",
      min_experience_months: jps.min_experience_months || null,
    });
  });

  const selectedDomainSkills = Object.values(domainGroup);

  // Resolve specializations (domains used as specializations)
  let specializationDomains = [];
  if (Array.isArray(job.eligible_specialization_ids) && job.eligible_specialization_ids.length > 0) {
    specializationDomains = await models.Domain.findAll({
      where: { domain_id: job.eligible_specialization_ids },
      attributes: ["domain_id", "domain_name"],
    });
  }
  const specializationMap = Object.fromEntries(
    specializationDomains.map(d => [d.domain_id, d.domain_name])
  );

  const eligible_specializations = [
    ...(job.eligible_specialization_ids || []).map(id => ({
      id,
      name: specializationMap[id] || `Specialization ${id}`,
    })),
    ...(job.other_eligible_specializations || []).map(name => ({
      id: null,
      name: typeof name === 'string' ? name.trim() : String(name),
    })),
  ];

  // Helper: safe number conversion
  const toNumberOrNull = (val) => {
    if (val == null) return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
  };

  const toString = (val) => (typeof val === "string" ? val.trim() : "");

  return {
    // Core
    post_type: job.post_type,
    opportunity_type: job.opportunity_type,
    job_status: job.active_status !== 0,

    // Job Role
    job_role_id: toNumberOrNull(job.job_role_id),
    other_job_role: jobRole?.title || "",

    //  SKILLS: FULL STATE FOR FRONTEND
    selectedDomainSkills,

    // Associations (ID + name pairs)
    eligible_cities: eligibleCities.map(c => ({ id: c.id, name: c.name })),
    eligible_colleges: eligibleColleges.map(c => ({ id: c.id, name: c.name })),
    eligible_courses: eligibleCourses.map(c => ({ id: c.id, name: c.name })),

    // Duration
    duration_id: toNumberOrNull(job.duration_id),
    other_duration: "",

    // Work Setup
    job_type: ["In office", "Hybrid", "Remote"].includes(job.job_type) ? job.job_type : "In office",
    job_time: ["Day Shift", "Night Shift", "Part-time"].includes(job.job_time) ? job.job_time : "Day Shift",
    days_in_office: toNumberOrNull(job.days_in_office),

    // Numbers & Strings
    number_of_openings: toNumberOrNull(job.number_of_openings) ?? 1,
    job_description: toString(job.job_description),
    candidate_preferences: toString(job.candidate_preferences),
    women_preferred: Boolean(job.women_preferred),

    // Stipend
    stipend_type: toString(job.stipend_type) || (job.opportunity_type === "Internship" ? "Paid" : "Fixed"),
    stipend_min: toNumberOrNull(job.stipend_min),
    stipend_max: toNumberOrNull(job.stipend_max),
    incentive_per_year: toString(job.incentive_per_year),

    // Perks & Screening
    perks: Array.isArray(job.perks) ? job.perks : [],
    screening_questions: Array.isArray(job.screening_questions) ? job.screening_questions : [],

    // Contact
    phone_contact: toString(job.phone_contact),
    alternate_phone_number: toString(job.alternate_phone_number),

    // Dates
    is_custom_internship_date: Boolean(job.is_custom_internship_date),
    internship_start_date: job.internship_start_date || "",
    internship_from_date: job.internship_from_date || "",
    internship_to_date: job.internship_to_date || "",
    project_start_date: job.project_start_date || "",
    project_end_date: job.project_end_date || "",

    // Matching
    minSkillMatchRequired: toNumberOrNull(job.min_skill_match_required),

    // Education
    eligible_education_levels: Array.isArray(job.eligible_education_levels) ? job.eligible_education_levels : [],
    eligible_specializations,
    include_pursuing_students: Boolean(job.include_pursuing_students),

    // Experience
    experience_required: Boolean(job.experience_required),
    experience_min: toNumberOrNull(job.experience_min),
    experience_max: toNumberOrNull(job.experience_max),
    experience_types: Array.isArray(job.experience_types) ? job.experience_types : [],
  };
};

// ====== GET DRAFT ======
exports.getDraftOpportunity = async (req, res) => {
  try {
    const { job_id } = req.params;
    const user_id = req.user?.id;

    if (!job_id || !user_id) {
      return res.status(400).json({ message: "Job ID and user ID are required." });
    }

    const user = await req.db.User.findOne({ where: { id: user_id, user_role: "COMPANY" } });
    if (!user) return res.status(403).json({ message: "Unauthorized." });

    const companyProfile = await req.db.CompanyRecruiterProfile.findOne({ where: { user_id } });
    if (!companyProfile) return res.status(404).json({ message: "Company profile not found." });

    const job = await req.db.JobPost.findOne({
      where: {
        job_id,
        company_recruiter_profile_id: companyProfile.id,
        active_status: 0, // draft only
      },
    });

    if (!job) return res.status(404).json({ message: "Draft not found." });

    const payload = await transformJobToDraftPayload(job, req.db);
    return res.status(200).json(payload);
  } catch (error) {
    console.error("Error in getDraftOpportunity:", error);
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};

// ====== GET REPOST DATA ======
exports.getJobForRepost = async (req, res) => {
  try {
    const { job_id } = req.params;
    const user_id = req.user?.id;

    if (!job_id || !user_id) {
      return res.status(400).json({ message: "Job ID and user ID are required." });
    }

    const user = await req.db.User.findOne({ where: { id: user_id, user_role: "COMPANY" } });
    if (!user) return res.status(403).json({ message: "Unauthorized." });

    const companyProfile = await req.db.CompanyRecruiterProfile.findOne({ where: { user_id } });
    if (!companyProfile) return res.status(404).json({ message: "Company profile not found." });

    const job = await req.db.JobPost.findOne({
      where: {
        job_id,
        company_recruiter_profile_id: companyProfile.id,
        active_status: { [Op.ne]: 0 }, // NOT draft
      },
    });

    if (!job) return res.status(404).json({ message: "Job not found or not eligible for repost." });

    const payload = await transformJobToDraftPayload(job, req.db);

    // Adjust for repost flow
    payload.job_status = true;
    payload.active_status = 0; // will be saved as draft
    payload.post_type = "active";

    // Clear time-sensitive fields
    if (payload.opportunity_type === "Internship") {
      payload.is_custom_internship_date = false;
      payload.internship_from_date = "";
      payload.internship_to_date = "";
    }
    if (payload.opportunity_type === "Project") {
      payload.project_start_date = "";
      payload.project_end_date = "";
    }

    return res.status(200).json(payload);
  } catch (error) {
    console.error("Error in getJobForRepost:", error);
    return res.status(500).json({ message: "Server error.", error: error.message });
  }
};