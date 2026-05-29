const {
  User,
  UserDetail,
  UserSkill,
  FeedPost,
  Experience,
  Skill,
  Domain,
  Education,
  SchoolCollege,
  Course,
  Specialization,
  Location,
  JobRole,
  CompanyRecruiterProfile,
  Follow,
  PostLikes,
  PostComments,
  Authority,
  Industry,
  Language,
  UniversityDetail,
  JobPost,
  UniversityCourse
} = require("../models");

const { Op } = require('sequelize');
const db = require('../models');
const sequelize = db.sequelize;


const logProfileView = require("../utils/logProfileView");


const SCHOOL_STANDARDS = ["Class X or below", "Class XI", "Class XII"];

function toSentenceCase(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .trim()
    .toLowerCase()
    .replace(/(?:^|\s)\w/g, (match) => match.toUpperCase());
}

// Helper to sanitize date fields
function sanitizeDate(date) {
  // Accepts null, undefined, or valid YYYY-MM-DD, else returns null
  if (!date || date === "0000-00-00" || isNaN(Date.parse(date))) return null;
  return date;
}

//Helper to parse dates properly
function parseMonthYearToDate(monthYearStr) {
  if (!monthYearStr) return null;

  // Normalize: "Mar-23" → "03-2023", "March 2023" → "03-2023", "2023-03" → "2023-03"
  let normalized = monthYearStr.trim();

  // Handle "MMM-YY" like "Mar-23"
  const shortMonthYear = normalized.match(/^([A-Za-z]{3})-(\d{2})$/);
  if (shortMonthYear) {
    const [, monthAbbr, yearShort] = shortMonthYear;
    const year = `20${yearShort}`;
    const monthNum = new Date(`${monthAbbr} 1, ${year}`).getMonth() + 1;
    const paddedMonth = String(monthNum).padStart(2, "0");
    return `${year}-${paddedMonth}-01`;
  }

  const fullMonthYear = normalized.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (fullMonthYear) {
    const [, monthName, year] = fullMonthYear;
    const monthNum = new Date(`${monthName} 1, ${year}`).getMonth() + 1;
    if (!isNaN(monthNum)) {
      const paddedMonth = String(monthNum).padStart(2, "0");
      return `${year}-${paddedMonth}-01`;
    }
  }

  // Handle "MM-YYYY" or "YYYY-MM"
  const mmYyyy = normalized.match(/^(\d{1,2})[-/](\d{4})$/);
  if (mmYyyy) {
    const [, mm, yyyy] = mmYyyy;
    const paddedMM = String(mm).padStart(2, "0");
    return `${yyyy}-${paddedMM}-01`;
  }

  // Handle "YYYY-MM"
  const yyyyMm = normalized.match(/^(\d{4})[-/](\d{1,2})$/);
  if (yyyyMm) {
    const [, yyyy, mm] = yyyyMm;
    const paddedMM = String(mm).padStart(2, "0");
    return `${yyyy}-${paddedMM}-01`;
  }

  // If already in YYYY-MM-DD format, return as-is (for safety)
  if (normalized.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return normalized;
  }

  // Invalid format → return null
  return null;
}

function processSkills(skills) {
  const groups = [];

  skills.forEach((entry) => {
    const domainId = entry.Skill?.domain?.domain_id || null;
    const domainName = entry.Skill?.domain?.domain_name || "Other";
    const skillName = entry.Skill?.skill_name || "Unknown Skill";

    // --- NEW: Extract experience-level data ---
    const experience_id = entry.experience_id || null;
    const job_role_id = entry.Experience?.job_role_id || null;
    const job_role_name = entry.Experience?.jobRole?.title || "Unknown Role";

    // Build organization info (consistent with processExperiences)
    let organization = {
      id: null,
      name: "Unknown Organization",
      logo_url: null,
      type: "OTHER",
    };

    if (entry.authority_type === "COMPANY") {
      organization.type = "COMPANY";
      organization.name =
        entry.Authority?.CompanyRecruiterProfile?.company_name || "Company";
      organization.logo_url =
        entry.Authority?.CompanyRecruiterProfile?.logo_url || null;
      organization.id = entry.Authority?.company_id || null;
    } else if (entry.authority_type === "UNIVERSITY") {
      organization.type = "UNIVERSITY";
      organization.name = entry.Authority?.SchoolCollege?.name || "University";
      organization.logo_url = entry.Authority?.SchoolCollege?.logo_pic || null;
      organization.id = entry.Authority?.school_college_id || null;
    } else if (!entry.authority_id && entry.Experience?.organization_name) {
      // Custom org from Experience
      organization.type = "OTHER";
      organization.name = entry.Experience.organization_name;
      organization.logo_url = null;
      organization.id = null;
    }

    // Group by authority_id + domain (same as before)
    let group = groups.find(
      (g) =>
        (g.authority.id === entry.authority_id ||
          (g.authority.id === null && !entry.authority_id)) &&
        g.domain === domainName
    );

    if (!group) {
      group = {
        // KEEP ALL EXISTING FIELDS (backward compatible)
        domain_id: domainId,
        domain: domainName,
        authority_id: entry.authority_id || null,
        authority_type: entry.authority_type || "OTHER",
        authority: {
          id: entry.authority_id || null,
          name: organization.name, // reuses logic above
          logo_url: organization.logo_url,
          type: entry.authority_type || "OTHER",
          authority_id:
            entry.authority_type === "COMPANY"
              ? entry.Authority?.company_id
              : entry.authority_type === "UNIVERSITY"
                ? entry.Authority?.school_college_id
                : null,
        },
        start_date: entry.start_date ? entry.start_date.substring(0, 7) : null,
        end_date: entry.end_date ? entry.end_date.substring(0, 7) : null,
        certificate_image: entry.certificate_image
          ? [entry.certificate_image]
          : [],

        experience_id,
        job_role_id,
        job_role_name,
        organization, // full org object (name, logo, type, id)

        subSkills: [],
      };
      groups.push(group);
    }

    if (skillName && !group.subSkills.includes(skillName)) {
      group.subSkills.push(skillName);
    }
  });

  return groups;
}

function processExperiences(experiences) {
  const processedExperiences = [];

  for (const exp of experiences) {
    const data = exp.toJSON();

    // --- Job Role (keep legacy shape) ---
    let jobRoleInfo = null;
    if (exp.jobRole) {
      jobRoleInfo = {
        id: exp.jobRole.id,
        title: exp.jobRole.title,
      };
    } else if (exp.job_role_id) {
      jobRoleInfo = {
        id: exp.job_role_id,
        title: "Unknown Role",
      };
    }

    // --- Organization: Unified logic (Authority OR custom) ---
    let organization = {
      id: null,
      name: "Unknown Organization",
      logo_url: null,
      type: "OTHER",
    };

    // Case 1: Linked to Authority (known org)
    if (exp.Authority) {
      organization.id = exp.Authority.id;
      organization.type = exp.Authority.authority_type;

      if (exp.Authority.authority_type === "COMPANY") {
        const comp = exp.Authority.CompanyRecruiterProfile;
        organization.name = comp?.company_name || "Company";
        organization.logo_url = comp?.logo_url || null;
      } else if (exp.Authority.authority_type === "UNIVERSITY") {
        const school = exp.Authority.SchoolCollege;
        organization.name = school?.name || "University";
        organization.logo_url = school?.logo_pic || null;
      }
    }
    // Case 2: Custom organization (no Authority)
    else if (exp.organization_name) {
      organization.name = exp.organization_name;
      organization.type = "CUSTOM";
    }

    // --- Build response ---
    processedExperiences.push({
      ...data,

      // Keep these for backward compatibility (frontend expects them)
      company:
        organization.type === "COMPANY"
          ? {
            id: organization.id,
            name: organization.name,
            logo_url: organization.logo_url,
          }
          : null,

      job_role: jobRoleInfo,

      //  Unified organization (safe to add)
      organization,
    });
  }

  return processedExperiences;
}

const getEnrichedFeedPosts = async (userId, loggedInUserId) => {
  const posts = await FeedPost.findAll({
    where: { user_id: userId },
    attributes: [
      "id",
      "caption",
      "image",
      "like_count",
      "comment_count",
      "created_at",
      "slug",
    ],
    include: [
      {
        model: User,
        attributes: ["id", "uuid", "user_role"],
        include: [
          {
            model: UserDetail,
            as: "UserDetail",
            attributes: ["user_profile_pic"],
          },
          {
            model: CompanyRecruiterProfile,
            as: "CompanyRecruiterProfile",
            attributes: ["logo_url"],
          },
        ],
      },
    ],
    order: [["created_at", "DESC"]],
    limit: 10,
  });

  return Promise.all(
    posts.map(async (post) => {
      const jsonPost = post.toJSON();
      jsonPost.isLiked = false;
      if (loggedInUserId) {
        const liked = await PostLikes.findOne({
          where: { post_id: post.id, user_id: loggedInUserId },
        });
        jsonPost.isLiked = !!liked;
      }
      return jsonPost;
    })
  );
};

const getEnrichedFeedPost = async (targetUserId, loggedInUserId) => {
  let feedPosts = await FeedPost.findAll({
    where: { user_id: targetUserId },
    attributes: [
      "id",
      "user_id",
      "caption",
      "image",
      "like_count",
      "comment_count",
      "created_at",
      "slug",
    ],
    include: [
      {
        model: User,
        attributes: ["id", "first_name", "last_name", "user_role", "uuid"],
        include: [
          {
            model: UserDetail,
            as: "UserDetail",
            attributes: ["user_profile_pic"],
          },
          {
            model: CompanyRecruiterProfile,
            as: "CompanyRecruiterProfile",
            attributes: ["logo_url"],
          },
        ],
      },
      {
        model: PostComments,
        as: "comments",
        attributes: [
          "id",
          "user_id",
          "comment",
          "created_at",
          "updated_at",
          "parent_comment_id",
        ],
      },
    ],
    order: [["created_at", "DESC"]],
  });

  // Enrich posts with like status and follower count (for post author)
  feedPosts = await Promise.all(
    feedPosts.map(async (post) => {
      const postData = post.toJSON();

      // Follower count of post author (not the profile owner, but post creator)
      const authorFollowers = await Follow.count({
        where: { followed_id: postData.User.id },
      });
      postData.User.followersCount = authorFollowers;

      // Like status for logged-in user
      postData.isLiked = false;
      if (loggedInUserId) {
        const liked = await PostLikes.findOne({
          where: { post_id: postData.id, user_id: loggedInUserId },
        });
        postData.isLiked = !!liked;
      }

      return postData;
    })
  );

  return feedPosts;
};

//----------------------------------Helper functions to insert values----------------
// Resolve or create a JobRole
async function resolveJobRole(jobRoleId, otherJobRoleName) {
  if (jobRoleId) {
    const jr = await JobRole.findByPk(jobRoleId);
    if (!jr) throw new Error(`JobRole ID ${jobRoleId} not found.`);
    return jobRoleId;
  }
  if (!otherJobRoleName?.trim()) return null;

  let jr = await JobRole.findOne({ where: { name: otherJobRoleName.trim() } });
  if (!jr) {
    jr = await JobRole.create({ name: otherJobRoleName.trim() });
  }
  return jr.id;
}

// Resolve or create a Course
async function resolveCourse(courseId, otherCourseName) {
  if (courseId) {
    const c = await Course.findByPk(courseId);
    if (!c) throw new Error(`Course ID ${courseId} not found.`);
    return courseId;
  }
  if (!otherCourseName?.trim()) return null;

  let c = await Course.findOne({ where: { name: otherCourseName.trim() } });
  if (!c) {
    c = await Course.create({ name: otherCourseName.trim() });
  }
  return c.id;
}

// Resolve or create a Specialization
async function resolveSpecializationWithCourse(
  courseId,
  specId,
  otherSpecName
) {
  if (specId != null) {
    const spec = await Specialization.findByPk(specId);
    if (!spec) throw new Error(`Specialization ID ${specId} not found.`);
    if (spec.course_id !== courseId) {
      throw new Error(
        `Specialization ID ${specId} does not belong to course ID ${courseId}.`
      );
    }
    return specId;
  }

  if (!otherSpecName?.trim()) return null;

  const specName = otherSpecName.trim();
  let spec = await Specialization.findOne({
    where: { course_id: courseId, name: specName },
  });

  if (!spec) {
    spec = await Specialization.create({
      course_id: courseId,
      name: specName,
    });
  }

  return spec.id;
}

// For current model: name is globally unique, course_id is required
async function resolveSpecializationForCurrentModel(
  courseId,
  specId,
  otherSpecName
) {
  if (specId != null) {
    const spec = await Specialization.findByPk(specId);
    if (!spec) throw new Error(`Specialization ID ${specId} not found.`);
    // Optional: verify it belongs to the expected course
    // But your schema doesn't enforce that logically, so skip if not needed
    return specId;
  }

  if (!otherSpecName?.trim()) {
    return null;
  }

  const specName = otherSpecName.trim();

  // Check if name already exists (global uniqueness)
  const existing = await Specialization.findOne({ where: { name: specName } });
  if (existing) {
    // Optionally: validate it belongs to the same course?
    // But per your model, it's globally unique → so just reuse
    return existing.id;
  }

  // Create new specialization with required course_id
  const newSpec = await Specialization.create({
    name: specName,
    course_id: courseId, // required
  });

  return newSpec.id;
}

// Resolve or create a Location (for current_location_id / other_current_location)
async function resolveLocation(locationId, otherLocationName) {
  if (locationId) {
    const loc = await Location.findByPk(locationId);
    if (!loc) throw new Error(`Location ID ${locationId} not found.`);
    return locationId;
  }
  if (!otherLocationName?.trim()) return null;

  let loc = await Location.findOne({
    where: { name: otherLocationName.trim() },
  });
  if (!loc) {
    loc = await Location.create({ name: otherLocationName.trim() });
  }
  return loc.id;
}

async function resolveOrCreate(model, id, otherName, fieldName = "name") {
  if (id != null) {
    const record = await model.findByPk(id);
    if (!record) throw new Error(`${model.name} ID ${id} not found.`);
    return id;
  }
  if (!otherName?.trim()) return null;

  const name = otherName.trim();
  let record = await model.findOne({ where: { [fieldName]: name } });
  if (!record) {
    record = await model.create({ [fieldName]: name });
  }
  return record.id;
}



async function createUserDetails(req, res) {
  try {
    const {
      email,
      first_name,
      last_name,
      phone,
      dob,
      current_location_id, // NEW: FK to locations
      job_location_id, // NEW: FK to locations
      gender,
      languages,
      user_type,
      about_us,
      career_objective,
      resume,
      language,
      is_email_verified,
      is_phone_verified,
      is_gst_verified,
      user_profile_pic,
      aadhaar_number,
      aadhaar_card_file,
      is_aadhaar_verified,
      experiences, // new field for multiple experiences
      salary_details,
      currently_looking_for,
      work_mode,
      educations, // <-- Accept educations array from req.body with IDs
    } = req.body;

    // console.log('Received user detail data:', req.body);

    const dobMissingCreate =
      dob === undefined ||
      dob === null ||
      (typeof dob === "string" && String(dob).trim() === "");
    if (dobMissingCreate) {
      return res.status(400).json({ message: "Date of Birth is required" });
    }

    if (
      !email ||
      !first_name ||
      !last_name ||
      !phone ||
      !user_type ||
      !gender
    ) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    // Get user ID from authenticated user (from authMiddleware)
    const user_id = req.user?.id;
    if (!user_id) {
      return res
        .status(401)
        .json({ message: "Unauthorized. User ID not found." });
    }

    // Get user email from the authenticated user
    const registeredUser = await User.findByPk(user_id);
    if (!registeredUser) {
      return res.status(400).json({ message: "User not found." });
    }

    const existingDetail = await UserDetail.findOne({ where: { user_id } });
    // if (existingDetail) {
    //   return res.status(409).json({ message: "User details already exist." });
    // }

    const emailExists = await UserDetail.findOne({
      where: {
        email,
        user_id: { [Op.ne]: user_id },
      },
    });

    if (emailExists) {
      return res
        .status(409)
        .json({ message: "Email is already in use by another user." });
    }

    // No more eduFields logic; all education is handled in the educations array/table

    const userDetail = existingDetail
      ? await existingDetail.update({
        first_name,
        last_name,
        email,
        phone,
        dob,
        current_location_id,
        job_location_id,
        gender,
        languages,
        user_type,
        about_us,
        career_objective,
        resume,
        language,
        is_email_verified,
        is_phone_verified,
        is_gst_verified,
        user_profile_pic,
        aadhaar_number,
        aadhaar_card_file,
        is_aadhaar_verified,
        salary_details,
        currently_looking_for,
        work_mode,
      })
      : await UserDetail.create({
        user_id,
        first_name,
        last_name,
        email,
        phone,
        dob,
        current_location_id,
        job_location_id,
        gender,
        languages,
        user_type,
        about_us,
        career_objective,
        resume,
        language,
        is_email_verified,
        is_phone_verified,
        is_gst_verified,
        user_profile_pic,
        aadhaar_number,
        aadhaar_card_file,
        is_aadhaar_verified,
        salary_details,
        currently_looking_for,
        work_mode,
      });

    // Handle multiple education records
    // Delete existing education records for this userDetail
    await Education.destroy({ where: { user_detail_id: userDetail.id } });
    // Create new education records if provided
    if (Array.isArray(educations) && educations.length > 0) {
      // Each education object should have: level, school_college_id, board_or_university, course_id, specialization_id, start_year, end_year, percentage_or_cgpa
      const educationRecords = educations.map((edu) => ({
        user_detail_id: userDetail.id,
        level: edu.level,
        school_college_id: edu.school_college_id,
        board_or_university: edu.board_or_university,
        course_id: edu.course_id,
        specialization_id: edu.specialization_id,
        start_year: edu.start_year,
        end_year: edu.end_year,
        percentage_or_cgpa: edu.percentage_or_cgpa,
        education_certificate: edu.education_certificate,
      }));
      await Education.bulkCreate(educationRecords);
    }

    // Fetch all educations for this userDetail to return in the response (with names/logos)
    const savedEducations = await Education.findAll({
      where: { user_detail_id: userDetail.id },
      include: [
        {
          model: SchoolCollege,
          as: "schoolCollegeEducations",
          attributes: ["name", "logo_pic"],
        },
        { model: Course, as: "educationCourse", attributes: ["name"] },
        {
          model: Specialization,
          as: "educationSpecialization",
          attributes: ["name"],
        },
      ],
      attributes: [
        "id",
        "level",
        "school_college_id",
        "board_or_university",
        "course_id",
        "specialization_id",
        "start_date",
        "end_date",
        "percentage_or_cgpa",
        "education_certificate",
      ],
      order: [["start_date", "ASC"]],
    });

    // If experiences array is provided, create associated Experience records
    if (Array.isArray(experiences) && experiences.length > 0) {
      for (const exp of experiences) {
        let company_recruiter_profile_id =
          exp.company_recruiter_profile_id || null;
        if (!company_recruiter_profile_id && exp.company_id) {
          // Fetch company_recruiter_profile_id by company_name
          const companyProfile =
            await require("../models").CompanyRecruiterProfile.findOne({
              where: { company_name: exp.company_id },
            });
          if (companyProfile) {
            company_recruiter_profile_id = companyProfile.id;
          }
        }
        // Delete existing experiences for the user (but keep locked ones)
        await Experience.destroy({
          where: {
            user_detail_id: userDetail.id,
            status: { [Op.ne]: "rejected" },
          },
        });

        // Create new experience records
        const sanitizedstart_date = sanitizeDate(exp.start_date);
        const sanitizedend_date = sanitizeDate(exp.end_date);
        if (!sanitizedstart_date) {
          return res.status(400).json({
            message:
              "start_date is required and must be a valid date (YYYY-MM-DD)",
          });
        }
        await Experience.create({
          user_detail_id: userDetail.id,
          company_recruiter_profile_id,
          company_id: exp.company_id || null,
          job_role_id: exp.job_role_id || null,
          status: exp.status || "pending",
          start_date: sanitizedstart_date,
          end_date: sanitizedend_date,
          experienceCertificate: exp.experienceCertificate || null,
        });
      }
    }

    await User.update({ status: 2 }, { where: { id: user_id } });

    return res.status(201).json({
      message: "User details and experiences added successfully.",
      userDetail,
      educations: savedEducations, // Return educations array with names/logos
    });
  } catch (error) {
    console.error("Error creating user details:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}

async function saveUserDetails(req, res) {
  console.log("Sequelize instance:", sequelize ? "OK" : "UNDEFINED");
  console.log("Sequelize type:", typeof sequelize);
  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      dob,
      gender,
      type,
      current_location_id,
      other_current_location, // NEW
      languages,
      about_us,
      career_objective,
      resume,
      language,
      is_phone_verified,
      is_gst_verified,
      user_profile_pic,
      aadhaar_number,
      aadhaar_card_file,
      is_aadhaar_verified,
      salary_details,
      currently_looking_for = [],
      work_mode = [],
      educations = [],
      domains = [],
    } = req.body;

    // --- Basic validation ---
    const dobMissing =
      dob === undefined ||
      dob === null ||
      (typeof dob === "string" && String(dob).trim() === "");
    if (dobMissing) {
      return res.status(400).json({ message: "Date of Birth is required" });
    }

    if (!email || !first_name || !last_name || !phone || !gender) {
      return res.status(400).json({ message: "Required fields are missing." });
    }

    const user_id = req.user?.id;
    if (!user_id) {
      return res
        .status(401)
        .json({ message: "Unauthorized. User ID not found." });
    }

    const registeredUser = await User.findByPk(user_id);
    if (!registeredUser) {
      return res.status(400).json({ message: "User not found." });
    }

    // --- Email uniqueness (exclude self) ---
    const emailExists = await UserDetail.findOne({
      where: { email, user_id: { [Op.ne]: user_id } },
    });
    if (emailExists) {
      return res
        .status(409)
        .json({ message: "Email is already in use by another user." });
    }

    // --- Resolve current location ---
    let resolvedCurrentLocationId;
    try {
      resolvedCurrentLocationId = await resolveOrCreate(
        Location,
        current_location_id,
        other_current_location
      );
    } catch (err) {
      return res
        .status(400)
        .json({ error: `Invalid location: ${err.message}` });
    }

    // --- Upsert UserDetail ---
    const userDetailData = {
      first_name,
      last_name,
      email,
      phone,
      dob,
      current_location_id: resolvedCurrentLocationId,
      gender,
      languages,
      user_type: type || "STUDENT",
      about_us,
      career_objective,
      resume,
      language,
      is_email_verified: true,
      is_phone_verified,
      is_gst_verified,
      user_profile_pic,
      aadhaar_number,
      aadhaar_card_file,
      is_aadhaar_verified,
      salary_details,
      currently_looking_for: Array.isArray(currently_looking_for)
        ? currently_looking_for.join(",")
        : "",
      work_mode: Array.isArray(work_mode) ? work_mode.join(",") : "",
    };

    let userDetail = await UserDetail.findOne({ where: { user_id } });
    if (userDetail) {
      userDetail = await userDetail.update(userDetailData);
    } else {
      userDetail = await UserDetail.create({ ...userDetailData, user_id });
    }

    // --- Handle Educations ---
    if (!Array.isArray(educations) || educations.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one education entry is required." });
    }

    await Education.destroy({ where: { user_detail_id: userDetail.id } });

    const parseDate = (ym) => (ym ? `${ym}-01` : null);
    const educationRecords = [];

    for (const edu of educations) {
      if (!edu.school_college_id && !edu.other_institution_name?.trim()) {
        return res
          .status(400)
          .json({ error: "Institution is required for each education entry." });
      }

      const startDate = parseDate(edu.start_date);
      const endDate = parseDate(edu.end_date);
      if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
        return res
          .status(400)
          .json({ error: "End date cannot be before start date." });
      }

      // Resolve course & specialization
      let resolvedCourseId = null;
      let resolvedSpecId = null;

      if (edu.level !== "school") {
        try {
          resolvedCourseId = await resolveOrCreate(
            Course,
            edu.course_id,
            edu.other_course_name
          );
        } catch (err) {
          return res
            .status(400)
            .json({ error: `Course error: ${err.message}` });
        }
      }


      const hasCourse =
        resolvedCourseId ||
        (edu.other_course_name?.trim() && edu.level !== "school");

      if (hasCourse && !["diploma", "other"].includes(edu.level)) {
        if (!resolvedCourseId) {
          return res
            .status(400)
            .json({ error: "Course is required to specify a specialization." });
        }

        try {
          resolvedSpecId = await resolveSpecializationForCurrentModel(
            resolvedCourseId,
            edu.specialization_id,
            edu.other_specialization_name
          );
        } catch (err) {
          return res
            .status(400)
            .json({ error: `Specialization error: ${err.message}` });
        }
      }

      // Validate school standard if needed
      if (
        edu.level === "school" &&
        !SCHOOL_STANDARDS.includes(edu.standard_or_grade)
      ) {
        return res
          .status(400)
          .json({ error: "Invalid standard selection for school level." });
      }

      educationRecords.push({
        user_detail_id: userDetail.id,
        level: edu.level,
        school_college_id: edu.school_college_id || null,
        other_institution_name: edu.other_institution_name?.trim() || null,
        standard_or_grade: edu.standard_or_grade || null,
        course_id: resolvedCourseId,
        specialization_id: resolvedSpecId,
        start_date: startDate,
        end_date: endDate,
        education_certificate: edu.education_certificate || null,
      });
    }

    await Education.bulkCreate(educationRecords);

    const savedEducations = await Education.findAll({
      where: { user_detail_id: userDetail.id },
      include: [
        {
          model: SchoolCollege,
          as: "schoolCollegeEducations",
          attributes: ["name", "logo_pic"],
        },
        { model: Course, as: "educationCourse", attributes: ["name"] },
        {
          model: Specialization,
          as: "educationSpecialization",
          attributes: ["name"],
        },
      ],
      order: [["start_date", "ASC"]],
    });

    // --- Handle Domains (Experience + Skills) ---
    // await Experience.destroy({ where: { user_detail_id: userDetail.id } });
    // await UserSkill.destroy({ where: { user_id } });

    // for (const domain of domains) {
    //   const {
    //     authority_type,
    //     authority_id: authId,
    //     organization_name,
    //     start_date,
    //     end_date,
    //     job_role_id,
    //     other_job_role,
    //     certificate: domainCert = [],
    //     skills = [],
    //   } = domain;

    //   if (!["COMPANY", "UNIVERSITY"].includes(authority_type)) {
    //     return res.status(400).json({ error: "authority_type must be 'COMPANY' or 'UNIVERSITY'." });
    //   }

    //   let authority = null;

    //   if (authId) {
    //     if (authority_type === "COMPANY") {
    //       const company = await CompanyRecruiterProfile.findByPk(authId);
    //       if (!company) {
    //         return res.status(400).json({ error: `Company ID ${authId} not found.` });
    //       }
    //       authority = await Authority.findOne({ where: { authority_type: "COMPANY", company_id: authId } });
    //       if (!authority) {
    //         authority = await Authority.create({ authority_type: "COMPANY", company_id: authId });
    //       }
    //     } else {
    //       const college = await SchoolCollege.findByPk(authId);
    //       if (!college) {
    //         return res.status(400).json({ error: `Institute ID ${authId} not found.` });
    //       }
    //       authority = await Authority.findOne({ where: { authority_type: "UNIVERSITY", school_college_id: authId } });
    //       if (!authority) {
    //         authority = await Authority.create({ authority_type: "UNIVERSITY", school_college_id: authId });
    //       }
    //     }
    //   } else if (!organization_name?.trim()) {
    //     return res.status(400).json({
    //       error: "Either authority_id or organization_name is required for each experience.",
    //     });
    //   }

    //   // Resolve job role
    //   let resolvedJobRoleId = null;
    //   if (job_role_id != null || other_job_role?.trim()) {
    //     try {
    //       resolvedJobRoleId = await resolveOrCreate(JobRole, job_role_id, other_job_role, "title");
    //     } catch (err) {
    //       return res.status(400).json({ error: `Job role error: ${err.message}` });
    //     }
    //   }

    //   const formattedStartDate = start_date ? `${start_date}-01` : null;
    //   const formattedEndDate = end_date ? `${end_date}-01` : null;

    //   const experience = await Experience.create({
    //     user_detail_id: userDetail.id,
    //     authority_id: authority?.id || null,
    //     organization_name: !authId && organization_name ? organization_name.trim() : null,
    //     job_role_id: resolvedJobRoleId,
    //     start_date: formattedStartDate,
    //     end_date: formattedEndDate,
    //     status: "pending",
    //     experience_certificate: domainCert[0]?.trim() || null,
    //   });

    //   // Save skills
    //   for (const skill of skills) {
    //     if (!skill.skill_id) {
    //       return res.status(400).json({ error: "skill_id is required for each skill." });
    //     }

    //     const cert = skill.certificate?.trim() || domainCert[0]?.trim() || null;
    //     await UserSkill.create({
    //       user_id: parseInt(user_id),
    //       skill_id: parseInt(skill.skill_id),
    //       authority_id: authority?.id || null,
    //       authority_type: authority?.authority_type || null,
    //       experience_id: experience.id,
    //       start_date: formattedStartDate,
    //       end_date: formattedEndDate,
    //       certificate_image: cert,
    //     });
    //   }
    // }

    // --- Handle Domains (Experience + Skills) ---
    await Experience.destroy({
      where: { user_detail_id: userDetail.id, status: { [Op.ne]: "rejected" } },
    });
    await UserSkill.destroy({ where: { user_id } });

    for (const domain of domains) {
      const {
        authority_type,
        authority_id: rawAuthId,
        organization_name,
        start_date,
        end_date,
        job_role_id: rawJobRoleId,
        other_job_role,
        domain_id: rawDomainId,
        other_domain_name,
        skills = [],
      } = domain;

      // Validate authority_type
      if (!["COMPANY", "UNIVERSITY"].includes(authority_type)) {
        return res
          .status(400)
          .json({ error: "authority_type must be 'COMPANY' or 'UNIVERSITY'." });
      }

      // Parse IDs safely (frontend may send strings)
      const authId = rawAuthId != null ? parseInt(rawAuthId, 10) : null;
      const jobRoleId =
        rawJobRoleId != null ? parseInt(rawJobRoleId, 10) : null;
      const domainId = rawDomainId != null ? parseInt(rawDomainId, 10) : null;

      // Resolve Authority (Company/University)
      let authority = null;
      if (authId) {
        if (authority_type === "COMPANY") {
          const company = await CompanyRecruiterProfile.findByPk(authId);
          if (!company) {
            return res
              .status(400)
              .json({ error: `Company ID ${authId} not found.` });
          }
          authority = await Authority.findOne({
            where: { authority_type: "COMPANY", company_id: authId },
          });
          if (!authority) {
            authority = await Authority.create({
              authority_type: "COMPANY",
              company_id: authId,
            });
          }
        } else {
          const college = await SchoolCollege.findByPk(authId);
          if (!college) {
            return res
              .status(400)
              .json({ error: `Institute ID ${authId} not found.` });
          }
          authority = await Authority.findOne({
            where: { authority_type: "UNIVERSITY", school_college_id: authId },
          });
          if (!authority) {
            authority = await Authority.create({
              authority_type: "UNIVERSITY",
              school_college_id: authId,
            });
          }
        }
      } else if (!organization_name?.trim()) {
        return res.status(400).json({
          error:
            "Either authority_id or organization_name is required for each experience.",
        });
      }

      // Resolve Job Role
      let resolvedJobRoleId = null;
      if (jobRoleId != null || (other_job_role && other_job_role.trim())) {
        try {
          resolvedJobRoleId = await resolveOrCreate(
            JobRole,
            jobRoleId,
            other_job_role,
            "title"
          );
        } catch (err) {
          return res
            .status(400)
            .json({ error: `Job role error: ${err.message}` });
        }
      }

      // --- Resolve Domain ---
      let resolvedDomainId = null;
      if (domainId != null) {
        const dbDomain = await Domain.findByPk(domainId);
        if (!dbDomain) {
          return res
            .status(400)
            .json({ error: `Domain ID ${domainId} not found.` });
        }
        resolvedDomainId = domainId;
      } else if (other_domain_name?.trim()) {
        const normalizedDomainName = toSentenceCase(other_domain_name);
        let existingDomain = await Domain.findOne({
          where: sequelize.where(
            sequelize.fn("LOWER", sequelize.col("domain_name")),
            sequelize.fn("LOWER", normalizedDomainName)
          ),
        });
        if (!existingDomain) {
          existingDomain = await Domain.create({
            domain_name: normalizedDomainName,
          });
        }
        resolvedDomainId = existingDomain.domain_id;
      } else {
        return res.status(400).json({
          error:
            "Each domain entry must include either domain_id or other_domain_name.",
        });
      }

      // Format dates
      const formattedStartDate = start_date ? `${start_date}-01` : null;
      const formattedEndDate = end_date ? `${end_date}-01` : null;

      // Create Experience
      const experience = await Experience.create({
        user_detail_id: userDetail.id,
        authority_id: authority?.id || null,
        organization_name:
          !authId && organization_name ? organization_name.trim() : null,
        job_role_id: resolvedJobRoleId,
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        status: "pending",
        experience_certificate:
          Array.isArray(domain.certificate) && domain.certificate.length > 0
            ? domain.certificate[0]?.trim() || null
            : null,
      });

      // --- Process Skills under this domain ---
      for (const skill of skills) {
        const rawSkillId = skill.skill_id;
        const otherSkillName = skill.other_skill_name;
        const skillId = rawSkillId != null ? parseInt(rawSkillId, 10) : null;

        let resolvedSkillId = null;

        if (skillId != null) {
          const dbSkill = await Skill.findByPk(skillId);
          if (!dbSkill) {
            return res
              .status(400)
              .json({ error: `Skill ID ${skillId} not found.` });
          }
          // Optional: validate that this skill belongs to the resolvedDomainId?
          // If your data model enforces domain-skill linkage, uncomment:
          // if (dbSkill.domain_id !== resolvedDomainId) {
          //   return res.status(400).json({ error: `Skill ID ${skillId} does not belong to the selected domain.` });
          // }
          resolvedSkillId = skillId;
        } else if (otherSkillName?.trim()) {
          const normalizedSkillName = toSentenceCase(otherSkillName);
          let existingSkill = await Skill.findOne({
            where: sequelize.and(
              { domain_id: resolvedDomainId },
              sequelize.where(
                sequelize.fn("LOWER", sequelize.col("skill_name")),
                normalizedSkillName.toLowerCase()
              )
            ),
          });
          if (!existingSkill) {
            existingSkill = await Skill.create({
              domain_id: resolvedDomainId,
              skill_name: normalizedSkillName,
            });
          }
          resolvedSkillId = existingSkill.skill_id;
        } else {
          return res.status(400).json({
            error:
              "Each skill must include either skill_id or other_skill_name.",
          });
        }

        const experienceMonths =
          skill.experience_months != null
            ? parseInt(skill.experience_months, 10)
            : null;

        if (
          experienceMonths != null &&
          (isNaN(experienceMonths) || experienceMonths < 0)
        ) {
          return res.status(400).json({
            error: "experience_months must be a non-negative integer.",
          });
        }

        // Save UserSkill
        const cert =
          skill.certificate?.trim() ||
          (Array.isArray(domain.certificate) &&
            domain.certificate[0]?.trim()) ||
          null;
        await UserSkill.create({
          user_id: parseInt(user_id, 10),
          skill_id: resolvedSkillId,
          authority_id: authority?.id || null,
          authority_type: authority?.authority_type || null,
          experience_id: experience.id,
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          certificate_image: cert,
          experience_months: experienceMonths,
        });
      }
    }

    // --- Finalize user status ---
    await User.update({ status: 2 }, { where: { id: user_id } });

    // --- Fetch processed skills ---
    const userSkillsRaw = await UserSkill.findAll({
      where: { user_id: userDetail.user_id },
      include: [
        {
          model: Skill,
          as: "Skill",
          include: [{ model: Domain, as: "domain" }],
        },
        {
          model: Authority,
          as: "Authority",
          include: [
            { model: CompanyRecruiterProfile, as: "CompanyRecruiterProfile" },
            { model: SchoolCollege, as: "SchoolCollege" },
          ],
        },
        {
          model: Experience,
          as: "Experience",
          attributes: [
            "id",
            "user_detail_id",
            "company_recruiter_profile_id",
            "organization_name",
            "start_date",
            "end_date",
            "job_role_id",
            "company_id",
            "status",
            "experienceCertificate",
            "authority_id",
            "created_at",
            "updated_at",
          ],
          include: [{ model: JobRole, as: "jobRole" }],
        },
      ],
    });

    // Assume `processSkills` is defined elsewhere
    const processedSkills =
      typeof processSkills === "function" ? processSkills(userSkillsRaw) : [];

    return res.status(201).json({
      success: true,
      message: "User details saved successfully.",
      userDetail,
      educations: savedEducations,
      skills: processedSkills,
    });
  } catch (error) {
    console.error("Error in saveUserDetails:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}

async function getUserDetailsByuser_id(req, res) {
  try {
    const { user_id } = req.params;

    // Step 1: Get user details with educations (including names/logos)
    const userDetail = await UserDetail.findOne({
      where: { user_id },
      include: [
        { model: Location, as: "currentLocation", attributes: ["name"] },
        { model: Location, as: "jobLocation", attributes: ["name"] },
        {
          model: Education,
          as: "userEducations",
          include: [
            {
              model: SchoolCollege,
              as: "schoolCollegeEducations",
              attributes: ["name", "logo_pic"],
            },
            { model: Course, as: "educationCourse", attributes: ["name"] },
            {
              model: Specialization,
              as: "educationSpecialization",
              attributes: ["name"],
            },
          ],
          attributes: [
            "id",
            "user_detail_id",
            "level",
            "school_college_id",
            "other_institution_name",
            "board_or_university",
            "course_id",
            "specialization_id",
            "standard_or_grade",
            "start_date",
            "end_date",
            "percentage_or_cgpa",
            "education_certificate",
          ],
        },
      ],
    });

    if (!userDetail) {
      if (res) {
        return res.status(404).json({ message: "User details not found." });
      }
      throw new Error("User details not found");
    }

    // Step 2: Get experiences with company and job role details in a single query (OPTIMIZED)
    const experiencesRaw = await Experience.findAll({
      where: { user_detail_id: userDetail.id },
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
      ],
      attributes: [
        "id",
        "user_detail_id",
        "company_recruiter_profile_id",
        "organization_name",
        "start_date",
        "end_date",
        "job_role_id",
        "company_id",
        "status",
        "approval_status",
        "removed_by_company",
        "removal_reason",
        "proof_document",
        "reapproval_requested",
        "approved_by_company_id",
        "experienceCertificate",
        "created_at",
        "updated_at",
      ],
      order: [["created_at", "DESC"]],
    });

    // Step 3: Process experiences efficiently (OPTIMIZED)
    const processedExperiences = await processExperiences(experiencesRaw);

    // Step 4: Get user skills, include Skill, Domain, and authority and school college CompanyRecruiterProfile models
    const userSkillsRaw = await UserSkill.findAll({
      where: { user_id: userDetail.user_id },
      include: [
        {
          model: Skill,
          as: "Skill",
          include: [{ model: Domain, as: "domain" }],
        },
        {
          model: Authority,
          as: "Authority",
          include: [
            { model: CompanyRecruiterProfile, as: "CompanyRecruiterProfile" },
            { model: SchoolCollege, as: "SchoolCollege" },
          ],
        },
        // Include Experience to get job_role info
        {
          model: Experience,
          as: "Experience",
          include: [{ model: JobRole, as: "jobRole" }],
        },
      ],
    });
    const processedSkills = processSkills(userSkillsRaw);

    // Step 6: Final response
    const result = {
      userDetail: {
        ...userDetail.toJSON(),
        experiences: processedExperiences,
      },
      skills: processedSkills,
    };

    if (res) {
      return res.status(200).json(result);
    }
    return result;
  } catch (error) {
    console.error("Error fetching user details:", error);
    if (res) {
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
    throw error;
  }
}


// async function updateUserDetailsByuser_id(req, res) {
//   try {
//     const { user_id } = req.params;
//     const updated_ata = req.body;
//     const experiences =
//       "experiences" in updated_ata ? updated_ata.experiences : undefined;
//     delete updated_ata.experiences;
//     //now domains array will be sent same as creating user details
//     const domains = "domains" in updated_ata ? updated_ata.domains : undefined;
//     delete updated_ata.domains;
//     // NEW: Support multiple educations
//     const educations =
//       "educations" in updated_ata ? updated_ata.educations : undefined;
//     delete updated_ata.educations;

//     // Remove education-related fields from allowedFields
//     const allowedFields = [
//       "first_name",
//       "last_name",
//       "phone",
//       "dob",
//       "current_location_id",
//       "job_location_id",
//       "gender",
//       "languages",
//       "user_type",
//       "about_us",
//       "career_objective",
//       "resume",
//       "language",
//       "is_email_verified",
//       "is_phone_verified",
//       "is_gst_verified",
//       "user_profile_pic",
//       "aadhaar_number",
//       "aadhaar_card_file",
//       "is_aadhaar_verified",
//       "salary_details",
//       "currently_looking_for",
//       "work_mode",
//       "terms_and_condition",
//     ];

//     const filteredupdated_ata = {};
//     allowedFields.forEach((field) => {
//       if (field in updated_ata) {
//         filteredupdated_ata[field] = updated_ata[field];
//       }
//     });

//     const userDetail = await UserDetail.findOne({ where: { user_id } });
//     if (!userDetail) {
//       throw new Error("User details not found.");
//     }

//     // Update userdetail fields
//     const updatedUser = await userDetail.update(filteredupdated_ata);

//     // Update experiences if provided
//     if (Array.isArray(experiences)) {
//       // Remove all existing experiences for this userDetail
//       await Experience.destroy({ where: { user_detail_id: userDetail.id } });
//       // Add new experiences if any
//       if (experiences.length > 0) {
//         const experienceRecords = experiences.map((exp) => ({
//           user_detail_id: userDetail.id,
//           company_id: exp.company_id || null,
//           job_role_id: exp.job_role_id || null,
//           start_date: sanitizeDate(exp.start_date),
//           end_date: sanitizeDate(exp.end_date),
//           status: exp.status || "pending",
//           experienceCertificate: exp.experienceCertificate || null,
//         }));
//         await Experience.bulkCreate(experienceRecords);
//       }
//     }

//     // Update education records for this userDetail only if provided

//     if (Array.isArray(educations)) {
//       // Handle educations array
//       if (!Array.isArray(educations) || educations.length === 0) {
//         return res
//           .status(400)
//           .json({ error: "At least one education entry is required." });
//       }

//       // Delete old records
//       await Education.destroy({ where: { user_detail_id: userDetail.id } });

//       // Helper to parse "YYYY-MM" → "YYYY-MM-DD"
//       const parseDate = (ym) => (ym ? `${ym}-01` : null);

//       // Validate and transform each education entry
//       const educationRecords = [];
//       for (const edu of educations) {
//         // Institution validation
//         if (!edu.school_college_id && !edu.other_institution_name?.trim()) {
//           return res
//             .status(400)
//             .json({
//               error: "Institution is required for each education entry.",
//             });
//         }

//         // Date parsing & validation
//         const startDate = parseDate(edu.start_date);
//         const endDate = parseDate(edu.end_date);
//         if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
//           return res
//             .status(400)
//             .json({ error: "End date cannot be before start date." });
//         }

//         //  Optional: Validate foreign keys (safe but adds queries)
//         if (edu.school_college_id) {
//           const inst = await SchoolCollege.findByPk(edu.school_college_id);
//           if (!inst) {
//             return res.status(400).json({
//               error: `Institution ID ${edu.school_college_id} not found.`,
//             });
//           }
//         }
//         if (edu.course_id) {
//           const course = await Course.findByPk(edu.course_id);
//           if (!course) {
//             return res
//               .status(400)
//               .json({ error: `Course ID ${edu.course_id} not found.` });
//           }
//         }
//         if (edu.specialization_id) {
//           const spec = await Specialization.findByPk(edu.specialization_id);
//           if (!spec) {
//             return res.status(400).json({
//               error: `Specialization ID ${edu.specialization_id} not found.`,
//             });
//           }
//         }

//         //  Build record
//         educationRecords.push({
//           user_detail_id: userDetail.id,
//           level: edu.level,
//           school_college_id: edu.school_college_id || null,
//           other_institution_name: edu.other_institution_name || null,
//           board_or_university: edu.board_or_university || null,
//           standard_or_grade: edu.standard_or_grade || null,
//           course_id: edu.course_id || null,
//           specialization_id: edu.specialization_id || null,
//           start_date: startDate,
//           end_date: endDate,
//           percentage_or_cgpa: edu.percentage_or_cgpa || null,
//           education_certificate: edu.education_certificate || null,
//         });
//       }

//       // Save all at once
//       await Education.bulkCreate(educationRecords);
//     }

//     //  Fetch saved records with relations
//     const savedEducations = await Education.findAll({
//       where: { user_detail_id: userDetail.id },
//       include: [
//         {
//           model: SchoolCollege,
//           as: "schoolCollegeEducations",
//           attributes: ["name", "logo_pic"],
//         },
//         { model: Course, as: "educationCourse", attributes: ["name"] },
//         {
//           model: Specialization,
//           as: "educationSpecialization",
//           attributes: ["name"],
//         },
//       ],
//       attributes: [
//         "id",
//         "level",
//         "school_college_id",
//         "other_institution_name",
//         "board_or_university",
//         "standard_or_grade",
//         "course_id",
//         "specialization_id",
//         "start_date",
//         "end_date",
//         "percentage_or_cgpa",
//         "education_certificate",
//       ],
//       order: [["start_date", "ASC"]],
//     });

//     // new way using the same approah like creating skill record
//     // Update skills if domains provided (same logic as create)
//     if (Array.isArray(domains)) {
//       // Validate domains
//       if (!Array.isArray(domains)) {
//         throw new Error("domains must be an array.");
//       }

//       const missingSkills = [];
//       for (let i = 0; i < domains.length; i++) {
//         const cat = domains[i];
//         if (!Array.isArray(cat.skills)) continue;
//         cat.skills.forEach((skill, j) => {
//           if (!skill.skill_id) {
//             missingSkills.push(`Missing skill_id in domain ${i}, skill ${j}`);
//           }
//         });
//       }
//       if (missingSkills.length) {
//         throw new Error(missingSkills.join(", "));
//       }

//       // Delete existing user skills
//       await UserSkill.destroy({ where: { user_id } });

//       // Re-create from domains
//       for (const domain of domains) {
//         const {
//           authority_type,
//           authority_id: authId, // This is company_id OR school_college_id
//           organization_name, // NEW: for "Other" orgs
//           start_date,
//           end_date,
//           job_role_id, // NEW: from frontend
//           certificate: domainCert,
//           skills,
//         } = domain;

//         // --- Validate authority_type ---
//         if (!["COMPANY", "UNIVERSITY"].includes(authority_type)) {
//           return res.status(400).json({
//             error: "authority_type must be 'COMPANY' or 'UNIVERSITY'.",
//           });
//         }

//         let authority = null;

//         // --- Case 1: Known organization (authority_id provided) ---
//         if (authId) {
//           if (authority_type === "COMPANY") {
//             const company = await CompanyRecruiterProfile.findByPk(authId);
//             if (!company) {
//               return res
//                 .status(400)
//                 .json({ error: `Company with ID ${authId} does not exist.` });
//             }
//             // Find or create Authority
//             authority = await Authority.findOne({
//               where: { authority_type: "COMPANY", company_id: authId },
//             });
//             if (!authority) {
//               authority = await Authority.create({
//                 authority_type: "COMPANY",
//                 company_id: authId,
//               });
//             }
//           } else if (authority_type === "UNIVERSITY") {
//             const college = await SchoolCollege.findByPk(authId);
//             if (!college) {
//               return res
//                 .status(400)
//                 .json({ error: `Institute with ID ${authId} does not exist.` });
//             }
//             authority = await Authority.findOne({
//               where: {
//                 authority_type: "UNIVERSITY",
//                 school_college_id: authId,
//               },
//             });
//             if (!authority) {
//               authority = await Authority.create({
//                 authority_type: "UNIVERSITY",
//                 school_college_id: authId,
//               });
//             }
//           }
//         }
//         // --- Case 2: Custom organization (no authority_id, but name provided) ---
//         else if (organization_name?.trim()) {
//           // Store as custom — no Authority record needed
//           // We'll store org name directly in Experience
//         }
//         // --- Invalid: neither authId nor org name ---
//         else {
//           return res.status(400).json({
//             error:
//               "Either authority_id or organization_name is required for each experience.",
//           });
//         }

//         // --- Format dates ---
//         const formattedStartDate = start_date ? `${start_date}-01` : null;
//         const formattedEndDate = end_date ? `${end_date}-01` : null;

//         // --- Create Experience ---
//         const experience = await Experience.create({
//           user_detail_id: userDetail.id,
//           authority_id: authority?.id || null,
//           organization_name:
//             !authId && organization_name ? organization_name.trim() : null,
//           job_role_id: job_role_id ? parseInt(job_role_id) : null,
//           start_date: formattedStartDate,
//           end_date: formattedEndDate,
//           status: "pending", // or "pending" if you prefer
//           experience_certificate: domainCert?.[0]?.trim() || null,
//         });

//         // --- Create Skills linked to this experience ---
//         for (const skill of skills) {
//           if (!skill.skill_id) {
//             return res
//               .status(400)
//               .json({ error: "skill_id is required for each skill." });
//           }

//           const certificate_image =
//             skill.certificate?.trim() || domainCert?.[0]?.trim() || null;

//           await UserSkill.create({
//             user_id: parseInt(user_id),
//             skill_id: parseInt(skill.skill_id),
//             authority_id: authority?.id || null,
//             authority_type: authority?.authority_type || null,
//             experience_id: experience.id, // Link to experience
//             start_date: formattedStartDate,
//             end_date: formattedEndDate,
//             certificate_image,
//           });
//         }
//       }
//     }

//     // Step 4: Get user skills, include Skill, Domain, and authority and school college CompanyRecruiterProfile models
//     const userSkillsRaw = await UserSkill.findAll({
//       where: { user_id: userDetail.user_id },
//       include: [
//         {
//           model: Skill,
//           as: "Skill",
//           include: [{ model: Domain, as: "domain" }],
//         },
//         {
//           model: Authority,
//           as: "Authority",
//           include: [
//             { model: CompanyRecruiterProfile, as: "CompanyRecruiterProfile" },
//             { model: SchoolCollege, as: "SchoolCollege" },
//           ],
//         },
//         // Include Experience to get job_role info
//         {
//           model: Experience,
//           as: "Experience",
//           include: [{ model: JobRole, as: "jobRole" }],
//         },
//       ],
//     });
//     const formattedSkills = processSkills(userSkillsRaw);

//     // Fetch updated experiences
//     const updatedExperiences = await Experience.findAll({
//       where: { user_detail_id: userDetail.id },
//       include: [
//         {
//           model: JobRole,
//           as: "jobRole",
//           attributes: ["id", "title"],
//         },
//         {
//           model: CompanyRecruiterProfile,
//           as: "companyRecruiterProfile",
//           attributes: ["id", "company_name", "logo_url"],
//         },
//       ],
//       attributes: [
//         "id",
//         "company_id",
//         "job_role_id",
//         "start_date",
//         "end_date",
//         "status",
//         "experienceCertificate",
//       ],
//       order: [["created_at", "DESC"]],
//     });

//     // // Fetch updated educations

//     // Process experiences to match getUserDetailsByuser_id structure
//     const processedExperiences = await processExperiences(updatedExperiences);

//     const result = {
//       userDetail: updatedUser.toJSON(),
//       experiences: processedExperiences,
//       educations: savedEducations,
//       skills: formattedSkills,
//       message: "User details updated successfully.",
//     };

//     // If res is provided, send API response
//     if (res) {
//       return res.status(200).json(result);
//     }
//     // Otherwise return data for programmatic use
//     return result;
//   } catch (error) {
//     console.error("Error updating user details:", error);
//     if (res) {
//       return res
//         .status(500)
//         .json({ message: "Server error", error: error.message });
//     }
//     throw error;
//   }
// }

async function updateUserDetailsByuser_id(req, res) {
  try {
    const { user_id } = req.params;
    const updatedData = req.body;

    // Extract nested arrays
    const domains = "domains" in updatedData ? updatedData.domains : undefined;
    delete updatedData.domains;

    const educations =
      "educations" in updatedData ? updatedData.educations : undefined;
    delete updatedData.educations;

    // Allowed top-level fields
    const allowedFields = [
      "first_name",
      "last_name",
      "phone",
      "dob",
      "current_location_id",
      "job_location_id",
      "gender",
      "languages",
      "user_type",
      "about_us",
      "career_objective",
      "resume",
      "language",
      "is_email_verified",
      "is_phone_verified",
      "is_gst_verified",
      "user_profile_pic",
      "aadhaar_number",
      "aadhaar_card_file",
      "is_aadhaar_verified",
      "salary_details",
      "currently_looking_for",
      "work_mode",
      "terms_and_condition",
    ];

    const filteredData = {};
    allowedFields.forEach((field) => {
      if (field in updatedData) {
        filteredData[field] = updatedData[field];
      }
    });

    const userDetail = await UserDetail.findOne({ where: { user_id } });
    if (!userDetail) {
      return res.status(404).json({ message: "User details not found." });
    }

    // Update basic info
    const updatedUser = await userDetail.update(filteredData);

    // ======================
    // Handle Educations
    // ======================
    if (Array.isArray(educations)) {
      if (educations.length === 0) {
        return res
          .status(400)
          .json({ error: "At least one education entry is required." });
      }

      await Education.destroy({ where: { user_detail_id: userDetail.id } });

      const parseDate = (ym) => (ym ? `${ym}-01` : null);
      const educationRecords = [];

      for (const edu of educations) {
        // Institution
        if (!edu.school_college_id && !edu.other_institution_name?.trim()) {
          return res
            .status(400)
            .json({
              error: "Institution is required for each education entry.",
            });
        }

        // Dates
        const startDate = parseDate(edu.start_date);
        const endDate = parseDate(edu.end_date);
        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
          return res
            .status(400)
            .json({ error: "End date cannot be before start date." });
        }

        // Resolve course
        let resolvedCourseId = null;
        if (edu.level !== "school") {
          const courseId =
            edu.course_id != null ? parseInt(edu.course_id, 10) : null;
          if (courseId) {
            const c = await Course.findByPk(courseId);
            if (!c)
              return res
                .status(400)
                .json({ error: `Course ID ${courseId} not found.` });
            resolvedCourseId = courseId;
          } else if (edu.other_course_name?.trim()) {
            const normName = toSentenceCase(edu.other_course_name);
            let c = await Course.findOne({ where: { name: normName } });
            if (!c) c = await Course.create({ name: normName });
            resolvedCourseId = c.id;
          } else {
            return res
              .status(400)
              .json({ error: "Course is required for non-school education." });
          }
        }

        // Resolve specialization (if applicable)
        let resolvedSpecId = null;
        const hasCourse =
          resolvedCourseId ||
          (edu.other_course_name?.trim() && edu.level !== "school");
        if (hasCourse && !["diploma", "other"].includes(edu.level)) {
          if (!resolvedCourseId) {
            return res
              .status(400)
              .json({
                error: "Course is required to specify a specialization.",
              });
          }

          const specId =
            edu.specialization_id != null
              ? parseInt(edu.specialization_id, 10)
              : null;
          if (specId) {
            const spec = await Specialization.findByPk(specId);
            if (!spec)
              return res
                .status(400)
                .json({ error: `Specialization ID ${specId} not found.` });
            // Optional: validate spec belongs to course (skip if global uniqueness)
            resolvedSpecId = specId;
          } else if (edu.other_specialization_name?.trim()) {
            const normName = toSentenceCase(edu.other_specialization_name);
            let spec = await Specialization.findOne({
              where: { name: normName },
            });
            if (!spec) {
              spec = await Specialization.create({
                name: normName,
                course_id: resolvedCourseId,
              });
            }
            resolvedSpecId = spec.id;
          } else {
            return res
              .status(400)
              .json({
                error: "Specialization is required for this education level.",
              });
          }
        }

        // Validate school standard
        if (
          edu.level === "school" &&
          !SCHOOL_STANDARDS.includes(edu.standard_or_grade)
        ) {
          return res
            .status(400)
            .json({ error: "Invalid standard selection for school level." });
        }

        educationRecords.push({
          user_detail_id: userDetail.id,
          level: edu.level,
          school_college_id: edu.school_college_id || null,
          other_institution_name: edu.other_institution_name?.trim() || null,
          standard_or_grade: edu.standard_or_grade || null,
          course_id: resolvedCourseId,
          specialization_id: resolvedSpecId,
          start_date: startDate,
          end_date: endDate,
          education_certificate: edu.education_certificate || null,
        });
      }

      await Education.bulkCreate(educationRecords);
    }

    // Fetch updated educations
    const savedEducations = await Education.findAll({
      where: { user_detail_id: userDetail.id },
      include: [
        {
          model: SchoolCollege,
          as: "schoolCollegeEducations",
          attributes: ["name", "logo_pic"],
        },
        { model: Course, as: "educationCourse", attributes: ["name"] },
        {
          model: Specialization,
          as: "educationSpecialization",
          attributes: ["name"],
        },
      ],
      order: [["start_date", "ASC"]],
    });

    // ======================
    // Handle Domains (Skills & Experience)
    // ======================
    if (Array.isArray(domains)) {
      await Experience.destroy({
        where: { user_detail_id: userDetail.id, status: { [Op.ne]: "rejected" } },
      });
      await UserSkill.destroy({ where: { user_id } });

      for (const domain of domains) {
        const {
          authority_type,
          authority_id: rawAuthId,
          organization_name,
          start_date,
          end_date,
          job_role_id: rawJobRoleId,
          other_job_role,
          domain_id: rawDomainId,
          other_domain_name,
          certificate: domainCert = [],
          skills = [],
        } = domain;

        // Validate authority_type
        if (!["COMPANY", "UNIVERSITY"].includes(authority_type)) {
          return res
            .status(400)
            .json({
              error: "authority_type must be 'COMPANY' or 'UNIVERSITY'.",
            });
        }

        // Parse IDs
        const authId = rawAuthId != null ? parseInt(rawAuthId, 10) : null;
        const jobRoleId =
          rawJobRoleId != null ? parseInt(rawJobRoleId, 10) : null;
        const domainId = rawDomainId != null ? parseInt(rawDomainId, 10) : null;

        // Resolve Authority
        let authority = null;
        if (authId) {
          if (authority_type === "COMPANY") {
            const company = await CompanyRecruiterProfile.findByPk(authId);
            if (!company)
              return res
                .status(400)
                .json({ error: `Company ID ${authId} not found.` });
            authority = await Authority.findOne({
              where: { authority_type: "COMPANY", company_id: authId },
            });
            if (!authority)
              authority = await Authority.create({
                authority_type: "COMPANY",
                company_id: authId,
              });
          } else {
            const college = await SchoolCollege.findByPk(authId);
            if (!college)
              return res
                .status(400)
                .json({ error: `Institute ID ${authId} not found.` });
            authority = await Authority.findOne({
              where: {
                authority_type: "UNIVERSITY",
                school_college_id: authId,
              },
            });
            if (!authority)
              authority = await Authority.create({
                authority_type: "UNIVERSITY",
                school_college_id: authId,
              });
          }
        } else if (!organization_name?.trim()) {
          return res
            .status(400)
            .json({
              error: "Either authority_id or organization_name is required.",
            });
        }

        // Resolve Job Role
        let resolvedJobRoleId = null;
        if (jobRoleId != null) {
          const jr = await JobRole.findByPk(jobRoleId);
          if (!jr)
            return res
              .status(400)
              .json({ error: `JobRole ID ${jobRoleId} not found.` });
          resolvedJobRoleId = jobRoleId;
        } else if (other_job_role?.trim()) {
          const normName = toSentenceCase(other_job_role);
          let jr = await JobRole.findOne({ where: { title: normName } });
          if (!jr) jr = await JobRole.create({ title: normName });
          resolvedJobRoleId = jr.id;
        }

        // Resolve Domain
        let resolvedDomainId = null;
        if (domainId != null) {
          const d = await Domain.findByPk(domainId);
          if (!d)
            return res
              .status(400)
              .json({ error: `Domain ID ${domainId} not found.` });
          resolvedDomainId = domainId;
        } else if (other_domain_name?.trim()) {
          const normName = toSentenceCase(other_domain_name);
          let d = await Domain.findOne({
            where: sequelize.where(
              sequelize.fn("LOWER", sequelize.col("domain_name")),
              normName.toLowerCase()
            ),
          });
          if (!d) d = await Domain.create({ domain_name: normName });
          resolvedDomainId = d.domain_id;
        } else {
          return res
            .status(400)
            .json({
              error: "Either domain_id or other_domain_name is required.",
            });
        }

        // Create Experience
        const exp = await Experience.create({
          user_detail_id: userDetail.id,
          authority_id: authority?.id || null,
          organization_name:
            !authId && organization_name ? organization_name.trim() : null,
          job_role_id: resolvedJobRoleId,
          start_date: start_date ? `${start_date}-01` : null,
          end_date: end_date ? `${end_date}-01` : null,
          status: "pending",
          experience_certificate:
            Array.isArray(domainCert) && domainCert.length > 0
              ? domainCert[0]?.trim() || null
              : null,
        });

        // Process Skills
        for (const skill of skills) {
          const rawSkillId = skill.skill_id;
          const otherSkillName = skill.other_skill_name;
          const skillId = rawSkillId != null ? parseInt(rawSkillId, 10) : null;

          let resolvedSkillId = null;
          if (skillId != null) {
            const s = await Skill.findByPk(skillId);
            if (!s)
              return res
                .status(400)
                .json({ error: `Skill ID ${skillId} not found.` });
            resolvedSkillId = skillId;
          } else if (otherSkillName?.trim()) {
            const normName = toSentenceCase(otherSkillName);
            let s = await Skill.findOne({
              where: sequelize.and(
                { domain_id: resolvedDomainId },
                sequelize.where(
                  sequelize.fn("LOWER", sequelize.col("skill_name")),
                  normName.toLowerCase()
                )
              ),
            });
            if (!s) {
              s = await Skill.create({
                domain_id: resolvedDomainId,
                skill_name: normName,
              });
            }
            resolvedSkillId = s.skill_id;
          } else {
            return res
              .status(400)
              .json({
                error: "Each skill must have skill_id or other_skill_name.",
              });
          }

          await UserSkill.create({
            user_id: parseInt(user_id, 10),
            skill_id: resolvedSkillId,
            authority_id: authority?.id || null,
            authority_type: authority?.authority_type || null,
            experience_id: exp.id,
            start_date: start_date ? `${start_date}-01` : null,
            end_date: end_date ? `${end_date}-01` : null,
            certificate_image:
              skill.certificate?.trim() ||
              (Array.isArray(domainCert) ? domainCert[0]?.trim() : null) ||
              null,
          });
        }
      }
    }

    // Fetch final data
    const userSkillsRaw = await UserSkill.findAll({
      where: { user_id: userDetail.user_id },
      include: [
        {
          model: Skill,
          as: "Skill",
          include: [{ model: Domain, as: "domain" }],
        },
        {
          model: Authority,
          as: "Authority",
          include: [
            { model: CompanyRecruiterProfile, as: "CompanyRecruiterProfile" },
            { model: SchoolCollege, as: "SchoolCollege" },
          ],
        },
        {
          model: Experience,
          as: "Experience",
          include: [{ model: JobRole, as: "jobRole" }],
        },
      ],
    });
    const formattedSkills =
      typeof processSkills === "function" ? processSkills(userSkillsRaw) : [];

    const updatedExperiences = await Experience.findAll({
      where: { user_detail_id: userDetail.id },
      include: [
        { model: JobRole, as: "jobRole", attributes: ["id", "title"] },
        {
          model: CompanyRecruiterProfile,
          as: "companyRecruiterProfile",
          attributes: ["id", "company_name", "logo_url"],
        },
      ],
      order: [["created_at", "DESC"]],
    });
    const processedExperiences =
      typeof processExperiences === "function"
        ? processExperiences(updatedExperiences)
        : updatedExperiences;

    return res.status(200).json({
      success: true,
      message: "User details updated successfully.",
      userDetail: updatedUser.toJSON(),
      educations: savedEducations,
      experiences: processedExperiences,
      skills: formattedSkills,
    });
  } catch (error) {
    console.error("Error updating user details:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}


async function updateterms_and_condition(req, res) {
  try {
    const { user_id, accepted } = req.body;
    if (typeof accepted !== "boolean" || !user_id) {
      return res
        .status(400)
        .json({ message: "User ID and accepted boolean are required." });
    }

    const userDetail = await UserDetail.findOne({ where: { user_id } });
    if (!userDetail) {
      return res.status(404).json({ message: "User details not found." });
    }

    userDetail.terms_and_condition = accepted;
    await userDetail.save();

    return res.status(200).json({
      message: "Terms and conditions updated successfully.",
      terms_and_condition: accepted,
    });
  } catch (error) {
    console.error("Error updating terms and conditions:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}


async function getterms_and_condition(req, res) {
  try {
    // For demonstration, returning static terms and conditions text
    const termsText =
      "These are the terms and conditions of the application...";
    return res.status(200).json({ terms_and_condition: termsText });
  } catch (error) {
    console.error("Error fetching terms and conditions:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}


async function getAadhaarVerificationStatus(req, res) {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res
        .status(401)
        .json({ message: "Unauthorized. User ID not found." });
    }
    const userDetail = await UserDetail.findOne({ where: { user_id } });
    if (!userDetail) {
      return res.status(404).json({ message: "User details not found." });
    }
    return res
      .status(200)
      .json({ is_aadhaar_verified: userDetail.is_aadhaar_verified });
  } catch (error) {
    console.error("Error fetching Aadhaar verification status:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}


async function updateAadhaarDetails(req, res) {
  try {
    const user_id = req.user?.id;
    const body = req.body || {};
    let { aadhaar_number, is_aadhaar_verified, dob, phone, otp } = body;
    let aadhaar_card_file = req.file ? req.file.path : body.aadhaar_card_file;

    if (!user_id) {
      return res
        .status(401)
        .json({ message: "Unauthorized. User ID not found." });
    }

    const userDetail = await UserDetail.findOne({ where: { user_id } });
    if (!userDetail) {
      return res.status(404).json({ message: "User details not found." });
    }

    // Automatically set is_aadhaar_verified to true if aadhaar_number and aadhaar_card_file are provided
    if (aadhaar_number && aadhaar_card_file) {
      is_aadhaar_verified = true;
    }

    // You can also add backend OTP verification logic here using 'otp' and 'phone' if required.

    await userDetail.update({
      aadhaar_number: aadhaar_number || userDetail.aadhaar_number,
      aadhaar_card_file: aadhaar_card_file || userDetail.aadhaar_card_file,
      is_aadhaar_verified,
      ...(dob && { dob }),
      ...(phone && { phone })
    });

    return res
      .status(200)
      .json({ message: "Aadhaar details updated successfully.", userDetail });
  } catch (error) {
    console.error("Error updating Aadhaar details:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}


const getPublicProfileByuser_id = async (req, res) => {
  try {
    const { user_id } = req.params;

    const user = await User.findOne({
      where: { id: user_id, is_deleted: false },
      attributes: ["uuid", "user_role", "status", "created_at"],
    });

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 1. Basic user detail
    const userDetailRaw = await UserDetail.findOne({
      where: { user_id },
      attributes: [
        "first_name",
        "last_name",
        "language",
        "user_type",
        "about_us",
        "career_objective",
        "user_profile_pic",
        "email",
        "resume",
        "is_email_verified",
        "is_phone_verified",
        "is_aadhaar_verified",
      ],
      raw: true,
    });

    if (!userDetailRaw) {
      return res.status(404).json({ message: "Public profile not found." });
    }

    // Remove null or empty fields from userDetail
    const userDetail = {};
    for (const key in userDetailRaw) {
      if (userDetailRaw[key] !== null && userDetailRaw[key] !== "") {
        userDetail[key] = userDetailRaw[key];
      }
    }

    const publicProfile = {
      id: user.id,
      uuid: user.uuid,
      user_role: user.user_role,
      status: user.status,
      created_at: user.created_at,
      ...userDetail, // Spread all userDetail fields
    };

    // Step 4: Get user skills, include Skill, Domain, and authority and school college CompanyRecruiterProfile models
    // Step 4: Get user skills, include Skill, Domain, and CompanyRecruiterProfile models
    const userSkillsRaw = await UserSkill.findAll({
      where: { user_id },
      include: [
        {
          model: Skill,
          as: "Skill",
          include: [{ model: Domain, as: "domain" }],
        },
        {
          model: Authority,
          as: "Authority",
          include: [
            { model: CompanyRecruiterProfile, as: "CompanyRecruiterProfile" },
            { model: SchoolCollege, as: "SchoolCollege" },
          ],
        },
        // Include Experience to get job_role info
        {
          model: Experience,
          as: "Experience",
          include: [{ model: JobRole, as: "jobRole" }],
        },
      ],
    });
    const skills = processSkills(userSkillsRaw);

    // 3. User activity (feed posts)
    let feedPosts = await FeedPost.findAll({
      where: { user_id },
      attributes: [
        "id",
        "user_id",
        "caption",
        "image",
        "like_count",
        "comment_count",
        "created_at",
        "slug",
      ],
      include: [
        {
          model: User,
          attributes: ["id", "first_name", "last_name", "user_role", "uuid"],
          include: [
            {
              model: UserDetail,
              as: "UserDetail",
              attributes: ["user_profile_pic"],
            },
            {
              model: CompanyRecruiterProfile,
              as: "CompanyRecruiterProfile",
              attributes: ["logo_url"],
            },
          ],
        },
        {
          model: PostComments,
          as: "comments",
          attributes: [
            "id",
            "user_id",
            "comment",
            "created_at",
            "updated_at",
            "parent_comment_id",
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });
    const loggedInuser_id = req.user?.id;
    feedPosts = await Promise.all(
      feedPosts.map(async (post) => {
        const postData = post.toJSON();

        // // Parse comments
        // postData.comments = postData.comments ? JSON.parse(postData.comments) : [];

        // // Collect commenter user_ids for batch fetching
        // postData._commenteruser_ids = postData.comments.map(c => parseInt(c.user_id)).filter(Boolean);

        // Get followers count
        const followersCount = await Follow.count({
          where: { followed_id: postData.User.id },
        });
        postData.User.followersCount = followersCount;

        // Check if logged-in user has liked this post
        const liked = await PostLikes.findOne({
          where: { post_id: postData.id, user_id: loggedInuser_id },
        });
        postData.isLiked = !!liked;

        return postData;
      })
    );

    // 4. User experiences - using same approach as getUserDetailsByuser_id
    const userDetailRecord = await UserDetail.findOne({ where: { user_id } });
    let experiences = [];
    let educations = [];
    if (userDetailRecord) {
      // Get experiences separately and process them
      const experiencesRaw = await Experience.findAll({
        where: { user_detail_id: userDetailRecord.id },
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
        ],
        attributes: [
          "id",
          "user_detail_id",
          "company_recruiter_profile_id",
          "organization_name",
          "start_date",
          "end_date",
          "job_role_id",
          "company_id",
          "status",
          "experienceCertificate",
          "created_at",
          "updated_at",
        ],
        order: [["created_at", "DESC"]],
      });
      // Process the experiences to include the related data
      // experiences = await Promise.all(
      //   experiencesRaw.map(async (exp) => {
      //     let companyName = null;
      //     let companyLogo = null;
      //     let companyProfile = exp.companyRecruiterProfile;

      //     // If no direct company profile is linked but company_id exists, try to fetch it
      //     if (!companyProfile && exp.company_id) {
      //       companyProfile = await CompanyRecruiterProfile.findByPk(
      //         exp.company_id,
      //         {
      //           attributes: ["id", "company_name", "logo_url"],
      //         }
      //       );
      //     }

      //     if (companyProfile) {
      //       companyName = companyProfile.company_name;
      //       companyLogo = companyProfile.logo_url;
      //     } else if (exp.company_id) {
      //       // Fallback to company_id if no profile is found
      //       companyName = `Company ${exp.company_id}`;
      //     }

      //     return {
      //       id: exp.id,
      //       user_detail_id: exp.user_detail_id,
      //       company_recruiter_profile_id: exp.company_recruiter_profile_id,
      //       start_date: exp.start_date,
      //       end_date: exp.end_date,
      //       job_role_id: exp.job_role_id,
      //       job_role_title: exp.jobRole ? exp.jobRole.title : null,
      //       company_id: exp.company_id,
      //       company_name: companyName,
      //       company_logo: companyLogo,
      //       status: exp.status,
      //       experience_certificate: exp.experienceCertificate,
      //       created_at: exp.created_at,
      //       updated_at: exp.updated_at,
      //     };
      //   })
      // );
      const rawExperiences = await Experience.findAll({
        where: { user_detail_id: userDetailRecord.id },
        include: [
          {
            model: Authority,
            as: "Authority",
            include: [
              { model: CompanyRecruiterProfile, as: "CompanyRecruiterProfile" },
              { model: SchoolCollege, as: "SchoolCollege" },
            ],
          },
          { model: JobRole, as: "jobRole" },
        ],
      });

      experiences = processExperiences(rawExperiences);

      // Fetch all educations for this userDetail with related models
      educations = await Education.findAll({
        where: { user_detail_id: userDetailRecord.id },
        include: [
          {
            model: SchoolCollege,
            as: "schoolCollegeEducations",
            attributes: ["name", "logo_pic"],
          },
          { model: Course, as: "educationCourse", attributes: ["name"] },
          {
            model: Specialization,
            as: "educationSpecialization",
            attributes: ["name"],
          },
        ],
        attributes: [
          "id",
          "level",
          "school_college_id",
          "board_or_university",
          "course_id",
          "specialization_id",
          "start_date",
          "end_date",
          "percentage_or_cgpa",
          "education_certificate",
          "other_institution_name",
          "standard_or_grade",
        ],
        order: [["start_date", "ASC"]],
      });
    }

    return res.status(200).json({
      publicProfile: publicProfile,
      skills,
      activity: feedPosts,
      experiences: experiences,
      educations: educations, // Return all educations as an array
    });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

const getResumeDataByUserId = async (req, res) => {
  try {
    const { user_id } = req.params;

    // 1. Fetch User + UserDetail
    const user = await User.findByPk(user_id, {
      attributes: ["first_name", "last_name", "email", "phone"],
    });

    const userDetail = await UserDetail.findOne({
      where: { user_id },
      attributes: [
        "id",
        "user_profile_pic",
        "career_objective",
        "about_us",
        "language",
        "current_location_id",
      ],
      include: [
        {
          model: Location,
          as: "currentLocation",
          attributes: ["name"],
        },
      ],
    });

    if (!user || !userDetail) {
      return res.status(404).json({ message: "User or profile not found." });
    }

    // 2. Fetch Skills
    const userSkills = await UserSkill.findAll({
      where: { user_id },
      include: [
        {
          model: Skill,
          as: "Skill",
          attributes: ["skill_name"],
        },
      ],
    });

    const skills = userSkills.map((us) => us.Skill?.skill_name).filter(Boolean);

    // 3. Parse Languages (assuming stored as comma-separated string like "English,Spanish")
    let languages = [];
    if (userDetail.language) {
      languages = userDetail.language.split(",").map((name) => ({
        name: name.trim(),
        level: "Intermediate", // ← default since DB doesn’t store level
      }));
    }

    // 4. Fetch Education
    const educations = await Education.findAll({
      where: { user_detail_id: userDetail.id },
      include: [
        {
          model: SchoolCollege,
          as: "schoolCollegeEducations",
          attributes: ["name"],
        },
        { model: Course, as: "educationCourse", attributes: ["name"] },
        {
          model: Specialization,
          as: "educationSpecialization",
          attributes: ["name"],
        },
      ],
      order: [["start_date", "ASC"]],
    });

    const education = educations.map((edu) => ({
      degree:
        [
          edu.level,
          edu.educationCourse?.name,
          edu.educationSpecialization?.name,
        ]
          .filter(Boolean)
          .join(" in ") || "Degree",
      school: edu.schoolCollegeEducations?.name || "Unknown School",
      location: "N/A", // ← not stored
      year: `${edu.start_date || ""} – ${edu.end_date || ""}`.trim(),
      description: [],
    }));

    // 5. Fetch Work Experience
    const experiences = await Experience.findAll({
      where: { user_detail_id: userDetail.id },
      include: [
        {
          model: JobRole,
          as: "jobRole",
          attributes: ["title"],
        },
        {
          model: CompanyRecruiterProfile,
          as: "companyRecruiterProfile",
          attributes: ["company_name"],
        },
      ],
      order: [["start_date", "DESC"]],
    });

    const workHistory = experiences.map((exp) => ({
      title: exp.jobRole?.title || "Job Title",
      company: exp.companyRecruiterProfile?.company_name || "Company Name",
      location: "Remote", // ← not stored
      period: `${exp.start_date} – ${exp.end_date || "Present"}`,
      description: [
        "Contributed to key projects and delivered results.",
        "Collaborated with cross-functional teams.",
      ], // ← mock since not stored
    }));

    // 6. Determine Job Title — use most recent job role
    const jobTitle =
      workHistory.length > 0 ? workHistory[0].title : "Job Seeker";

    // 7. Build ResumeData
    const resumeData = {
      personal: {
        firstName: user.first_name,
        lastName: user.last_name,
        jobTitle: jobTitle,
        profilePic:
          userDetail.user_profile_pic || "https://via.placeholder.com/150",
        phone: user.phone,
        email: user.email,
        address: userDetail.currentLocation?.name || "Not specified",
        website: "", // ← optional — add field later if needed
        linkedin: "", // ← optional
        profileSummary:
          userDetail.career_objective ||
          userDetail.about_us ||
          "Passionate professional seeking new opportunities.",
      },
      skills,
      languages,
      education,
      workHistory,
      certifications: [],
      references: [],
    };

    res.status(200).json({ resumeData });
  } catch (error) {
    console.error("Error generating resume data:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getPublicProfileByUUID = async (req, res) => {
  try {
    const { uuid } = req.params;
    const loggedInUserId = req.user?.id;

    // 1. Fetch user by UUID
    const user = await User.findOne({ where: { uuid } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const targetUserId = user.id;

    // 2. Prevent self-view logic (optional but useful for UI)
    const is_own_profile = loggedInUserId === targetUserId;

    // 3. Fetch basic user details
    const userDetailRaw = await UserDetail.findOne({
      where: { user_id: targetUserId },
      attributes: [
        "user_id",
        "first_name",
        "last_name",
        "language",
        "user_type",
        "about_us",
        "career_objective",
        "user_profile_pic",
        "email",
        "resume",
      ],
      raw: true,
    });

    if (!userDetailRaw) {
      return res.status(404).json({ message: "Public profile not found." });
    }

    // Clean null/empty fields
    const userDetail = {};
    for (const key in userDetailRaw) {
      if (userDetailRaw[key] !== null && userDetailRaw[key] !== "") {
        userDetail[key] = userDetailRaw[key];
      }
    }

    // 4. Fetch follower & following counts
    const [followersCount, followingCount] = await Promise.all([
      Follow.count({ where: { followed_id: targetUserId } }),
      Follow.count({ where: { follower_id: targetUserId } }),
    ]);

    // 5. Check if logged-in user is following this profile
    let is_following = false;
    if (loggedInUserId && !is_own_profile) {
      const existingFollow = await Follow.findOne({
        where: { follower_id: loggedInUserId, followed_id: targetUserId },
      });
      is_following = !!existingFollow;
    }

    // 6. Fetch skills (your existing logic)
    const userSkillsRaw = await UserSkill.findAll({
      where: { user_id: targetUserId },
      include: [
        {
          model: Skill,
          as: "Skill",
          include: [{ model: Domain, as: "domain" }],
        },
        {
          model: Authority,
          as: "Authority",
          include: [
            { model: CompanyRecruiterProfile, as: "CompanyRecruiterProfile" },
            { model: SchoolCollege, as: "SchoolCollege" },
          ],
        },
        // Include Experience to get job_role info
        {
          model: Experience,
          as: "Experience",
          include: [{ model: JobRole, as: "jobRole" }],
        },
      ],
    });
    const skills = processSkills(userSkillsRaw);

    // 7. Fetch feed posts (your existing logic, slightly optimized)
    let feedPosts = await FeedPost.findAll({
      where: { user_id: targetUserId },
      attributes: [
        "id",
        "user_id",
        "caption",
        "image",
        "like_count",
        "comment_count",
        "created_at",
        "slug",
      ],
      include: [
        {
          model: User,
          attributes: ["id", "first_name", "last_name", "user_role", "uuid"],
          include: [
            {
              model: UserDetail,
              as: "UserDetail",
              attributes: ["user_profile_pic"],
            },
            {
              model: CompanyRecruiterProfile,
              as: "CompanyRecruiterProfile",
              attributes: ["logo_url"],
            },
          ],
        },
        {
          model: PostComments,
          as: "comments",
          attributes: [
            "id",
            "user_id",
            "comment",
            "created_at",
            "updated_at",
            "parent_comment_id",
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // Enrich posts with like status and follower count (for post author)
    feedPosts = await Promise.all(
      feedPosts.map(async (post) => {
        const postData = post.toJSON();

        // Follower count of post author (not the profile owner, but post creator)
        const authorFollowers = await Follow.count({
          where: { followed_id: postData.User.id },
        });
        postData.User.followersCount = authorFollowers;

        // Like status for logged-in user
        postData.isLiked = false;
        if (loggedInUserId) {
          const liked = await PostLikes.findOne({
            where: { post_id: postData.id, user_id: loggedInUserId },
          });
          postData.isLiked = !!liked;
        }

        return postData;
      })
    );

    // 8. Fetch experiences & educations (your existing logic)
    const userDetailRecord = await UserDetail.findOne({
      where: { user_id: targetUserId },
    });

    let experiences = [];
    let educations = [];

    if (userDetailRecord) {
      const experiencesRaw = await Experience.findAll({
        where: { user_detail_id: userDetailRecord.id },
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
        ],
        attributes: [
          "id",
          "user_detail_id",
          "company_recruiter_profile_id",
          "start_date",
          "end_date",
          "job_role_id",
          "company_id",
          "status",
          "experienceCertificate",
          "created_at",
          "updated_at",
        ],
        order: [["created_at", "DESC"]],
      });

      experiences = await Promise.all(
        experiencesRaw.map(async (exp) => {
          let companyName = null;
          let companyLogo = null;
          let companyProfile = exp.companyRecruiterProfile;

          if (!companyProfile && exp.company_id) {
            companyProfile = await CompanyRecruiterProfile.findByPk(
              exp.company_id,
              { attributes: ["id", "company_name", "logo_url"] }
            );
          }

          if (companyProfile) {
            companyName = companyProfile.company_name;
            companyLogo = companyProfile.logo_url;
          } else if (exp.company_id) {
            companyName = `Company ${exp.company_id}`;
          }

          return {
            id: exp.id,
            user_detail_id: exp.user_detail_id,
            company_recruiter_profile_id: exp.company_recruiter_profile_id,
            start_date: exp.start_date,
            end_date: exp.end_date,
            job_role_id: exp.job_role_id,
            job_role_title: exp.jobRole ? exp.jobRole.title : null,
            company_id: exp.company_id,
            company_name: companyName,
            company_logo: companyLogo,
            status: exp.status,
            experience_certificate: exp.experienceCertificate,
            created_at: exp.created_at,
            updated_at: exp.updated_at,
          };
        })
      );

      educations = await Education.findAll({
        where: { user_detail_id: userDetailRecord.id },
        include: [
          {
            model: SchoolCollege,
            as: "schoolCollegeEducations",
            attributes: ["name", "logo_pic"],
          },
          { model: Course, as: "educationCourse", attributes: ["name"] },
          {
            model: Specialization,
            as: "educationSpecialization",
            attributes: ["name"],
          },
        ],
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
        order: [["start_date", "ASC"]],
      });
    }

    // 9. Final response
    return res.status(200).json({
      publicProfile: {
        ...userDetail,
        id: targetUserId,
        uuid: user.uuid,
        user_role: user.user_role,
      },
      profileStats: {
        followers_count: followersCount,
        following_count: followingCount,
        is_following: is_following,
        is_own_profile: is_own_profile,
      },
      skills,
      activity: feedPosts,
      experiences,
      educations,
    });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return res.status(500).json({
      message: "Server error",
      // error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getPublicProfile = async (req, res) => {
  try {
    const { uuid } = req.params;
    const loggedInUserId = req.user?.id;
    const viewerUserId = req.user?.id; // ID of the logged-in user viewing the profile

    // 1. Fetch user
    const user = await User.findOne({ where: { uuid } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const targetUserId = user.id;
    const isOwnProfile = loggedInUserId === targetUserId;
    const userRole = user.user_role;

    // 2. Log view (async, fire-and-forget — don’t block response)
    if (viewerUserId && viewerUserId !== user.id) {
      // Run in background (don’t await — keep response fast)
      setImmediate(() =>
        logProfileView(
          viewerUserId,
          user.id,
          req.query.source || "direct"
        ).catch(console.error)
      );
    }

    // 2. Basic stats (followers, following, is_following)
    const [followersCount, followingCount] = await Promise.all([
      Follow.count({ where: { followed_id: targetUserId } }),
      Follow.count({ where: { follower_id: targetUserId } }),
    ]);

    let isFollowing = false;
    if (loggedInUserId && !isOwnProfile) {
      const followExists = await Follow.findOne({
        where: { follower_id: loggedInUserId, followed_id: targetUserId },
      });
      isFollowing = !!followExists;
    }

    // 3. Fetch feed posts (common for all roles)
    const feedPosts = await getEnrichedFeedPost(targetUserId, loggedInUserId);

    // 4. Role-specific data
    let profileData, detailsData;

    if (userRole === "COMPANY") {
      const profile = await CompanyRecruiterProfile.findOne({
        where: { user_id: targetUserId },
        attributes: [
          "id",
          "company_name",
          "about",
          "logo_url",
          "profile_pic",
          "is_email_verified",
          "is_phone_verified",
          "is_gst_verified",
        ],
        include: [
          { model: Industry, as: "industry", attributes: ["name"] },
          { model: JobRole, as: "designation", attributes: ["title"] },
          { model: Location, as: "companyLocation", attributes: ["name"] },
          {
            model: Language,
            as: "languages",
            attributes: ["name"],
            through: { attributes: [] },
          },
        ],
      });

      if (!profile) {
        return res.status(404).json({ message: "Company profile not found." });
      }

      profileData = {
        id: targetUserId,
        uuid: user.uuid,
        user_role: "COMPANY",
        name: profile.company_name,
        avatar_url: profile.logo_url || profile.profile_pic,
        about: profile.about,
        verified_badges: {
          email: profile.is_email_verified,
          phone: profile.is_phone_verified,
          gst: profile.is_gst_verified,
        },
      };

      // Fetch recent active job posts (max 5)
      const recentJobs = await JobPost.findAll({
        where: {
          company_recruiter_profile_id: profile.id,
          active_status: 1, // only active
        },
        limit: 10,
        order: [["created_at", "DESC"]],
        attributes: [
          "job_id",
          "job_type",
          "stipend_min",
          "stipend_max",
          "internship_start_date",
          "created_at",
          "views",
        ],
        include: [
          {
            model: JobRole,
            attributes: ["title"],
          },
          {
            model: Skill,
            as: "skills",
            attributes: ["skill_name"],
            through: { attributes: [] },
          },
        ],
      });

      detailsData = {
        industry: profile.industry?.name || null,
        designation: profile.designation?.title || null,
        location: profile.companyLocation?.name || null,
        languages: profile.languages?.map((l) => l.name) || [],
        recent_jobs: recentJobs.map((job) => ({
          id: job.job_id,
          title: job.JobRole?.title || "N/A",
          type: job.job_type,
          stipend_range:
            job.stipend_min && job.stipend_max
              ? `${job.stipend_min} - ${job.stipend_max}`
              : null,
          start_date: job.internship_start_date,
          skills: job.skills?.map((s) => s.skill_name) || [],
          views: job.views,
          posted_at: job.created_at,
        })),
      };
    } else if (userRole === "UNIVERSITY") {
      const profile = await UniversityDetail.findOne({
        where: { user_id: targetUserId },
        attributes: [
          "college_name",
          "about",
          "university_logo_url",
          "profile_pic",
          "email_id_verified",
          "phone_verified",
          "aadhar_verified",
          "website_link",
          "social_media_link",
          "address",
          "pincode",
        ],
        include: [
          {
            model: Course,
            as: "courses",
            attributes: ["name"],
            through: { attributes: [] },
          },
        ],
      });

      if (!profile) {
        return res
          .status(404)
          .json({ message: "University profile not found." });
      }

      profileData = {
        id: targetUserId,
        uuid: user.uuid,
        user_role: "UNIVERSITY",
        name: profile.college_name,
        avatar_url: profile.university_logo_url || profile.profile_pic,
        about: profile.about,
        email: user.email || null,
        verified_badges: {
          email: profile.email_id_verified,
          phone: profile.phone_verified,
          aadhar: profile.aadhar_verified,
        },
      };

      try {
        console.log(`[public-profile][UNIVERSITY] verified_badges for user_id=${targetUserId}:`, profileData.verified_badges);
      } catch (logErr) {
        console.warn('[public-profile] could not log verified_badges', logErr);
      }

      detailsData = {
        website: profile.website_link,
        social_link: profile.social_media_link,
        courses: profile.courses?.map((c) => c.name) || [],
        address: profile.address || null,
        pincode: profile.pincode || null,
      };
    } else {
      // Default: STUDENT
      const userDetail = await UserDetail.findOne({
        where: { user_id: targetUserId },
        attributes: [
          "id",
          "first_name",
          "last_name",
          "about_us",
          "user_profile_pic",
          "career_objective",
        ],
      });

      if (!userDetail) {
        return res.status(404).json({ message: "Student profile not found." });
      }

      profileData = {
        id: targetUserId,
        uuid: user.uuid,
        user_role: "STUDENT",
        name: `${userDetail.first_name} ${userDetail.last_name}`.trim(),
        avatar_url: userDetail.user_profile_pic,
        about: userDetail.about_us,
        verified_badges: {}, // students may not have these yet
      };

      // Fetch skills, experiences, educations
      // const [skills, experiences, educations] = await Promise.all([
      //   getProcessedUserSkills(targetUserId),
      //   getProcessedExperiences(targetUserId),
      //   getProcessedEducations(targetUserId),
      // ]);

      // will make it clean

      let experiences = [];
      let educations = [];
      let skills = [];

      if (userDetail) {
        const experiencesRaw = await Experience.findAll({
          where: { user_detail_id: userDetail.id },
          include: [
            {
              model: JobRole,
              as: "jobRole",
              attributes: ["id", "title"],
            },
            {
              model: Authority,
              as: "Authority",
              include: [
                {
                  model: CompanyRecruiterProfile,
                  as: "CompanyRecruiterProfile",
                },
                { model: SchoolCollege, as: "SchoolCollege" },
              ],
            },
            {
              model: CompanyRecruiterProfile,
              as: "companyRecruiterProfile",
              attributes: ["id", "company_name", "logo_url"],
            },
          ],
          attributes: [
            "id",
            "user_detail_id",
            "authority_id",
            "company_recruiter_profile_id",
            "organization_name",
            "start_date",
            "end_date",
            "job_role_id",
            "company_id",
            "status",
            "experienceCertificate",
            "created_at",
            "updated_at",
          ],
          order: [["created_at", "DESC"]],
        });

        experiences = await Promise.all(
          experiencesRaw.map(async (exp) => {
            console.log("a raw expreince", exp);
            let companyName = null;
            let companyLogo = null;
            let companyProfile = exp.companyRecruiterProfile;

            if (!companyProfile && exp.company_id) {
              companyProfile = await CompanyRecruiterProfile.findByPk(
                exp.company_id,
                { attributes: ["id", "company_name", "logo_url"] }
              );
            }

            if (companyProfile) {
              companyName = companyProfile.company_name;
              companyLogo = companyProfile.logo_url;
            }
            // else if (exp.company_id) {
            //   companyName = `Company ${exp.company_id}`;
            // }
            else {
              companyName = exp.organization_name;
            }

            // //extracting organisation details
            // if(exp.authority){
            //   // is either a company or university
            //   if (exp.authority_type === "COMPANY") {
            //   organization.type = "COMPANY";
            //   organization.name =
            //     entry.Authority?.CompanyRecruiterProfile?.company_name ||
            //     "Company";
            //   organization.logo_url =
            //     entry.Authority?.CompanyRecruiterProfile?.logo_url || null;
            //   organization.id = entry.Authority?.company_id || null;
            //   }

            // }else {
            //     console.log("custom organization")
            // }



            // if (exp.authority_type === "COMPANY") {
            //   organization.type = "COMPANY";
            //   organization.name =
            //     entry.Authority?.CompanyRecruiterProfile?.company_name ||
            //     "Company";
            //   organization.logo_url =
            //     entry.Authority?.CompanyRecruiterProfile?.logo_url || null;
            //   organization.id = entry.Authority?.company_id || null;
            // } else if (entry.authority_type === "UNIVERSITY") {
            //   organization.type = "UNIVERSITY";
            //   organization.name =
            //     entry.Authority?.SchoolCollege?.name || "University";
            //   organization.logo_url =
            //     entry.Authority?.SchoolCollege?.logo_pic || null;
            //   organization.id = entry.Authority?.school_college_id || null;
            // } else if (
            //   !entry.authority_id &&
            //   entry.Experience?.organization_name
            // ) {
            //   // Custom org from Experience
            //   organization.type = "OTHER";
            //   organization.name = entry.Experience.organization_name;
            //   organization.logo_url = null;
            //   organization.id = null;
            // }

            return {
              id: exp.id,
              user_detail_id: exp.user_detail_id,
              company_recruiter_profile_id: exp.company_recruiter_profile_id,
              start_date: exp.start_date,
              end_date: exp.end_date,
              job_role_id: exp.job_role_id,
              job_role_title: exp.jobRole ? exp.jobRole.title : null,
              company_id: exp.company_id,
              company_name:
                exp.Authority?.CompanyRecruiterProfile?.company_name ||
                exp.Authority?.SchoolCollege?.name ||
                exp.companyRecruiterProfile?.company_name ||
                exp.organization_name ||
                companyName,
              company_logo:
                exp.Authority?.CompanyRecruiterProfile?.logo_url ||
                exp.Authority?.SchoolCollege?.logo_pic ||
                companyLogo ||
                exp.companyRecruiterProfile?.logo_url,
              status: exp.status,
              experience_certificate: exp.experienceCertificate,
              created_at: exp.created_at,
              updated_at: exp.updated_at,
            };
          })
        );

        educations = await Education.findAll({
          where: { user_detail_id: userDetail.id },
          include: [
            {
              model: SchoolCollege,
              as: "schoolCollegeEducations",
              attributes: ["name", "logo_pic"],
            },
            { model: Course, as: "educationCourse", attributes: ["name"] },
            {
              model: Specialization,
              as: "educationSpecialization",
              attributes: ["name"],
            },
          ],
          attributes: [
            "id",
            "level",
            "school_college_id",
            "other_institution_name",
            "board_or_university",
            "course_id",
            "specialization_id",
            "start_date",
            "end_date",
            "percentage_or_cgpa",
            "education_certificate",
          ],
          order: [["start_date", "ASC"]],
        });
        const userSkillsRaw = await UserSkill.findAll({
          where: { user_id: targetUserId },
          include: [
            {
              model: Skill,
              as: "Skill",
              include: [{ model: Domain, as: "domain" }],
            },
            {
              model: Authority,
              as: "Authority",
              include: [
                {
                  model: CompanyRecruiterProfile,
                  as: "CompanyRecruiterProfile",
                },
                { model: SchoolCollege, as: "SchoolCollege" },
              ],
            },
            // Include Experience to get job_role info
            {
              model: Experience,
              as: "Experience",
              include: [{ model: JobRole, as: "jobRole" }],
            },
          ],
        });
        skills = processSkills(userSkillsRaw);
      }

      detailsData = {
        career_objective: userDetail.career_objective,
        skills,
        experiences,
        educations,
      };
    }

    // 5. Final response
    return res.status(200).json({
      profile: profileData,
      stats: {
        followers_count: followersCount,
        following_count: followingCount,
        is_following: isFollowing,
        is_own_profile: isOwnProfile,
      },
      details: detailsData,
      activity: feedPosts,
    });
  } catch (error) {
    console.error("Error in getPublicProfile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Utility: Round to nearest integer
const round = (num) => Math.round(num);

// Query: ?detailed=true → includes section-wise breakdown
const getProfileCompletion = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { detailed = "false" } = req.query;
    const showDetailed = detailed.toLowerCase() === "true";

    // 1. Fetch user and user_detail
    const user = await User.findByPk(userId, {
      attributes: ["id", "first_name", "last_name", "email", "phone", "user_role", "status"],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    //  Branch: COMPANY vs STUDENT/UNIVERSITY lateer university also seprate
    if (user.user_role === "COMPANY") {
      // Fetch CompanyRecruiterProfile (with languages & jobPosts)
      const companyProfile = await CompanyRecruiterProfile.findOne({
        where: { user_id: userId },
        attributes: [
          "company_name",
          "industry_id",
          "company_location_id",
          "about",
          "logo_url",
          "designation_id",
          "is_email_verified",
          "is_phone_verified",
          "is_gst_verified",
          "profile_pic",
          "company_address",
          "gst_number",

        ],
      });

      // If no company profile yet → 0% with empty breakdown
      if (!companyProfile) {
        const baseResponse = { profile_completion_percentage: 0 };
        if (showDetailed) {
          baseResponse.breakdown = generateEmptyCompanyBreakdown();
        }
        return res.status(200).json({ success: true, data: baseResponse });
      }

      // Calculate for COMPANY
      const sections = calculateCompanyProfileSections({
        user,
        companyProfile,
      });
      const totalScore = sections.reduce((sum, s) => sum + s.score, 0);
      const percentage = Math.min(100, round(totalScore));

      const response = { profile_completion_percentage: percentage };
      if (showDetailed) {
        response.breakdown = sections.reduce((acc, s) => {
          acc[s.name] = {
            weight: s.weight,
            completed: s.score >= s.weight,
            score: round(s.score),
            ...(s.missing?.length && { missing: s.missing }),
            ...(s.current_count !== undefined && {
              current_count: s.current_count,
            }),
            ...(s.target_count !== undefined && {
              target_count: s.target_count,
            }),
          };
          return acc;
        }, {});
      }

      // Debug: log computed sections and overall percentage for university
      try {
        console.log(`[profile-completion][UNIVERSITY] user_id=${userId} totalScore=${totalScore} percentage=${percentage}`);
        console.log('[profile-completion][UNIVERSITY] sections:', sections);
      } catch (logErr) {
        console.warn('[profile-completion] failed to log university sections', logErr);
      }

      return res.status(200).json({ success: true, data: response });
    }

    // After COMPANY check, before default UserDetail path:
    if (user.user_role === "UNIVERSITY") {
      // Fetch UniversityDetail + associated Courses
      const universityDetail = await UniversityDetail.findOne({
        where: { user_id: userId },
        include: [{ model: Course, as: "courses", attributes: ["id", "name"] }],
        attributes: [
          "college_name",
          "affiliated_university",
          "address",
          "pincode",
          "website_link",
          "about",
          "profile_pic",
          "university_logo_url",
          "authorization_letter_url",
          "social_media_link",
          "email_id_verified",
          "phone_verified",
          "aadhar_verified",
          "is_verified",
        ],
      });

      if (!universityDetail) {
        const baseResponse = { profile_completion_percentage: 0 };
        if (showDetailed) {
          baseResponse.breakdown = generateEmptyUniversityBreakdown();
        }
        return res.status(200).json({ success: true, data: baseResponse });
      }

      const sections = calculateUniversityProfileSections({
        user,
        universityDetail,
      });

      const totalScore = sections.reduce((sum, s) => sum + s.score, 0);
      const percentage = Math.min(100, round(totalScore));

      const response = { profile_completion_percentage: percentage };
      if (showDetailed) {
        response.breakdown = sections.reduce((acc, s) => {
          acc[s.name] = {
            weight: s.weight,
            completed: s.score >= s.weight,
            score: round(s.score),
            ...(s.missing?.length && { missing: s.missing }),
            ...(s.current_count !== undefined && {
              current_count: s.current_count,
            }),
            ...(s.target_count !== undefined && {
              target_count: s.target_count,
            }),
          };
          return acc;
        }, {});
      }

      return res.status(200).json({ success: true, data: response });
    }

    const userDetail = await UserDetail.findOne({
      where: { user_id: userId },
      attributes: [
        "id",
        "first_name",
        "last_name",
        "email",
        "phone",
        "dob",
        "gender",
        "current_location_id",
        "job_location_id",
        "resume",
        "user_profile_pic",
        "is_email_verified",
        "is_phone_verified",
        "is_aadhaar_verified",
        "aadhaar_number",
        "user_type",
        "language",
      ],
    });

    // Handle case: User exists but has no UserDetail yet
    if (!userDetail) {
      const baseResponse = { profile_completion_percentage: 0 };
      if (showDetailed) {
        baseResponse.breakdown = generateEmptyBreakdown(user.user_role);
      }
      return res.status(200).json({ success: true, data: baseResponse });
    }

    // 2. Fetch related data in parallel
    const [educations, experiences, userSkills] = await Promise.all([
      Education.findAll({
        where: { user_detail_id: userDetail.id },
        attributes: [
          "id",
          "level",
          "school_college_id",
          "course_id",
          "specialization_id",
          "start_date",
          "end_date",
          "other_institution_name",
          "standard_or_grade",
          "education_certificate",
        ],
      }),
      Experience.findAll({
        where: { user_detail_id: userDetail.id },
        attributes: [
          "company_recruiter_profile_id",
          "job_role_id",
          "company_id",
          "start_date",
          "company_id",
        ],
      }),
      UserSkill.findAll({
        where: { user_id: userId },
        attributes: ["skill_id"],
      }),
    ]);

    // 3. Calculate profile sections
    const sections = calculateProfileSections({
      user,
      userDetail,
      educations,
      experiences,
      userSkills,
    });

    // 4. Compute total
    const totalScore = sections.reduce((sum, s) => sum + s.score, 0);
    const percentage = Math.min(100, round(totalScore));

    // 5. Build response
    const response = { profile_completion_percentage: percentage };

    if (showDetailed) {
      response.breakdown = sections.reduce((acc, s) => {
        acc[s.name] = {
          weight: s.weight,
          completed: s.score >= s.weight,
          score: round(s.score),
          ...(s.missing?.length && { missing: s.missing }),
          ...(s.current_count !== undefined && {
            current_count: s.current_count,
          }),
          ...(s.target_count !== undefined && { target_count: s.target_count }),
          ...(s.not_applicable !== undefined && {
            not_applicable: s.not_applicable,
          }),
        };
        return acc;
      }, {});
    }

    return res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error("Profile completion calculation failed:", error);
    next(error);
  }
};

// -------------------------------
// HELPER: Calculate weighted sections
// -------------------------------

// Not used by company 
function calculateProfileSections({
  user,
  userDetail,
  educations,
  experiences,
  userSkills,
  companyProfile,
}) {
  const userRole = user.user_role;

  if (userRole === "COMPANY") {
    const sections = [];

    // 1. Basic Info (10%): name, email, phone (from UserDetail)
    const hasBasic =
      user?.first_name &&
      user?.last_name &&
      user?.email &&
      user?.phone;
    sections.push({
      name: "basic_info",
      weight: 10,
      score: hasBasic ? 10 : 0,
      missing: hasBasic
        ? []
        : [
          ...(!user?.first_name ? ["first_name"] : []),
          ...(!user?.last_name ? ["last_name"] : []),
          ...(!user?.email ? ["email"] : []),
          ...(!user?.phone ? ["phone"] : []),
        ],
    });

    // 2. Company Info (30%)
    const hasCompanyName = !!companyProfile?.company_name?.trim();
    const hasIndustry = !!companyProfile?.industry_id;
    const hasLocation = !!companyProfile?.company_location_id;
    const hasAbout = !!companyProfile?.about?.trim();
    const hasLogo = !!companyProfile?.logo_url;

    const companyInfoScore =
      (hasCompanyName ? 6 : 0) +
      (hasIndustry ? 6 : 0) +
      (hasLocation ? 6 : 0) +
      (hasAbout ? 6 : 0) +
      (hasLogo ? 6 : 0);

    sections.push({
      name: "company_info",
      weight: 30,
      score: companyInfoScore,
      missing: [
        ...(hasCompanyName ? [] : ["company_name"]),
        ...(hasIndustry ? [] : ["industry"]),
        ...(hasLocation ? [] : ["company_location"]),
        ...(hasAbout ? [] : ["about"]),
        ...(hasLogo ? [] : ["logo"]),
      ],
    });

    // 3. Designation (5%)
    const hasDesignation = !!companyProfile?.designation_id;
    sections.push({
      name: "designation",
      weight: 5,
      score: hasDesignation ? 5 : 0,
      missing: hasDesignation ? [] : ["designation"],
    });

    // 4. Verification (15%)
    let verifScore = 0;
    const missingVerif = [];
    if (companyProfile?.is_email_verified) verifScore += 15;
    else missingVerif.push("email");
    if (companyProfile?.is_phone_verified) verifScore += 15;
    else missingVerif.push("phone");
    // GST placeholder — safe if field doesn't exist yet
    const hasGST = companyProfile?.is_gst_verified; // will be false/undefined if column missing
    if (hasGST) verifScore += 15;
    else missingVerif.push("gst_verification"); // shown only if applicable later

    sections.push({
      name: "verification",
      weight: 45,
      score: verifScore,
      missing: missingVerif,
    });

    // 5. Profile Photo (5%)
    sections.push({
      name: "profile_photo",
      weight: 5,
      score: companyProfile?.profile_pic ? 5 : 0,
      missing: companyProfile?.profile_pic ? [] : ["profile_photo"],
    });

    // // 6. Languages (10%) — only languages, no skills (now not to be used)
    // const languageCount = companyProfile?.languages?.length || 0;
    // const langScore = Math.min(10, (languageCount / 2) * 10); // target: 2 languages
    // sections.push({
    //   name: "languages",
    //   weight: 10,
    //   score: langScore,
    //   current_count: languageCount,
    //   target_count: 2,
    //   missing: languageCount >= 2 ? [] : ["add at least 2 languages"],
    // });

    // // 7. Job Posts (25%) — key recruiter activity (now not to be used)
    // const jobPostCount = companyProfile?.jobPosts?.length || 0;
    // const jobPostScore = jobPostCount > 0 ? 25 : 0; // binary: ≥1 = full credit
    // sections.push({
    //   name: "job_posts",
    //   weight: 25,
    //   score: jobPostScore,
    //   current_count: jobPostCount,
    //   target_count: 1,
    //   missing: jobPostCount > 0 ? [] : ["create at least one job post"],
    // });

    return sections;
  }
  const sections = [];

  // 1. Basic Info (15%)
  const hasBasic =
    userDetail.first_name &&
    userDetail.last_name &&
    userDetail.email &&
    userDetail.phone;
  sections.push({
    name: "basic_info",
    weight: 15,
    score: hasBasic ? 15 : 0,
    missing: hasBasic
      ? []
      : [
        ...(!userDetail.first_name ? ["first_name"] : []),
        ...(!userDetail.last_name ? ["last_name"] : []),
        ...(!userDetail.email ? ["email"] : []),
        ...(!userDetail.phone ? ["phone"] : []),
      ],
  });

  // 2. Verification (10%)
  let verifScore = 0;
  const missingVerif = [];
  if (userDetail.is_email_verified) verifScore += 5;
  else missingVerif.push("email");
  if (userDetail.is_phone_verified) verifScore += 5;
  else missingVerif.push("phone");
  sections.push({
    name: "verification",
    weight: 10,
    score: verifScore,
    missing: missingVerif,
  });

  // 3. Personal Details (10%)
  const hasPersonal =
    userDetail.dob &&
    userDetail.gender &&
    (userDetail.current_location_id || userDetail.job_location_id);
  sections.push({
    name: "personal_details",
    weight: 10,
    score: hasPersonal ? 10 : 0,
    missing: hasPersonal
      ? []
      : [
        ...(!userDetail.dob ? ["dob"] : []),
        ...(!userDetail.gender ? ["gender"] : []),
        ...(userDetail.current_location_id || userDetail.job_location_id
          ? []
          : ["location"]),
      ],
  });

  // 3b. Languages (5%) – STUDENT only (feed-view “Languages you know”); total score still capped at 100
  const langApplicable = userRole === "STUDENT";
  const languageStr = userDetail.language;
  const hasLanguages =
    languageStr &&
    String(languageStr)
      .split(",")
      .some((part) => part.trim().length > 0);
  sections.push({
    name: "languages",
    weight: langApplicable ? 5 : 0,
    score: langApplicable && hasLanguages ? 5 : 0,
    missing:
      langApplicable && !hasLanguages ? ["languages you know"] : [],
    not_applicable: !langApplicable,
  });

  // 4. Education (15%) – for STUDENT/UNIVERSITY
  //    12% for at least one valid entry; +3% if at least one valid entry has a certificate (feed-your-education upload)
  const eduApplicable = ["STUDENT", "UNIVERSITY"].includes(userRole);
  const validEdu = educations.filter(
    (e) =>
      e.level &&
      (e.school_college_id || e.other_institution_name) &&
      (e.start_date || e.end_date)
  );
  const hasEduCertificate = validEdu.some(
    (e) =>
      e.education_certificate &&
      String(e.education_certificate).trim() !== ""
  );
  let eduScore = 0;
  const eduMissing = [];
  if (eduApplicable) {
    if (validEdu.length === 0) {
      eduMissing.push("at least one education entry");
    } else {
      eduScore = 12;
      if (hasEduCertificate) {
        eduScore += 3;
      } else {
        eduMissing.push("upload education certificate for at least one entry");
      }
    }
  }
  sections.push({
    name: "education",
    weight: eduApplicable ? 15 : 0,
    score: eduScore,
    missing: eduMissing,
    not_applicable: !eduApplicable,
  });

  // 5. Experience (15%) – skip for UNIVERSITY
  const expApplicable = userRole !== "UNIVERSITY";
  const validExp = experiences.filter(
    (e) =>
      (e.company_recruiter_profile_id || e.company_id) &&
      e.job_role_id &&
      e.start_date
  );
  sections.push({
    name: "experience",
    weight: expApplicable ? 15 : 0,
    score: expApplicable && validExp.length > 0 ? 15 : 0,
    missing:
      expApplicable && validExp.length === 0
        ? ["at least one work experience"]
        : [],
    not_applicable: !expApplicable,
  });

  // 6. Skills (10%)
  const skillCount = userSkills.length;
  const skillScore = Math.min(10, (skillCount / 3) * 10); // 3 = target
  sections.push({
    name: "skills",
    weight: 10,
    score: skillScore,
    current_count: skillCount,
    target_count: 3,
  });

  // 7. Resume (10%)
  sections.push({
    name: "resume",
    weight: 10,
    score: userDetail.resume ? 10 : 0,
    missing: userDetail.resume ? [] : ["resume"],
  });

  // 8. Profile Photo (5%)
  sections.push({
    name: "profile_photo",
    weight: 5,
    score: userDetail.user_profile_pic ? 5 : 0,
    missing: userDetail.user_profile_pic ? [] : ["profile_photo"],
  });

  // 9. Document Verification (10%) – e.g., Aadhaar for STUDENT
  const docApplicable = userRole === "STUDENT";
  const hasAadhaar =
    userDetail.is_aadhaar_verified && userDetail.aadhaar_number;
  sections.push({
    name: "document_verification",
    weight: docApplicable ? 10 : 0,
    score: docApplicable && hasAadhaar ? 10 : 0,
    missing: docApplicable && !hasAadhaar ? ["aadhaar verification"] : [],
    not_applicable: !docApplicable,
  });

  return sections;
}

function calculateCompanyProfileSections({ user, companyProfile }) {
  const sections = [];

  // 1. Basic Info (25%) - 4 fields × 6.25%
  const basicFields = [user.first_name, user.last_name, user.email, user.phone];
  const basicScore = basicFields.filter((val) => val && String(val).trim() !== "").length * 6.25;

  sections.push({
    name: "basic_info",
    weight: 25,
    score: basicScore,
    missing: [
      ...(!user.first_name ? ["first_name"] : []),
      ...(!user.last_name ? ["last_name"] : []),
      ...(!user.email ? ["email"] : []),
      ...(!user.phone ? ["phone"] : []),
    ],
  });

  // 2. Company Info (45%) - 6 fields × 7.5%
  // Includes: name, industry, location, about, logo, AND gst_number
  const companyFields = [
    companyProfile?.company_name?.trim(),
    companyProfile?.industry_id,
    companyProfile?.company_location_id,
    companyProfile?.about?.trim(),
    companyProfile?.logo_url,
    companyProfile?.gst_number?.trim(), // User entered value counts here
  ];

  const companyScore = companyFields.filter((val) => val && String(val).trim() !== "").length * 7.5;

  sections.push({
    name: "company_info",
    weight: 45,
    score: companyScore,
    missing: [
      ...(!companyProfile?.company_name?.trim() ? ["company_name"] : []),
      ...(!companyProfile?.industry_id ? ["industry"] : []),
      ...(!companyProfile?.company_location_id ? ["company_location"] : []),
      ...(!companyProfile?.about?.trim() ? ["about"] : []),
      ...(!companyProfile?.logo_url ? ["logo_url"] : []),
      ...(!companyProfile?.gst_number?.trim() ? ["gst_number"] : []),
    ],
  });

  // 3. Verification (30%) - 3 booleans × 10%
  // Only counts when is_*_verified is TRUE
  const verifScore =
    (companyProfile?.is_email_verified ? 10 : 0) +
    (companyProfile?.is_phone_verified ? 10 : 0) +
    (companyProfile?.is_gst_verified ? 10 : 0);

  sections.push({
    name: "verification",
    weight: 30,
    score: verifScore,
    missing: [
      ...(companyProfile?.is_email_verified ? [] : ["email_verification"]),
      ...(companyProfile?.is_phone_verified ? [] : ["phone_verification"]),
      ...(companyProfile?.is_gst_verified ? [] : ["gst_verification"]),
    ],
  });

  return sections;
}

function calculateUniversityProfileSections({ user, universityDetail }) {
  const sections = [];

  // 1. Basic Info (10%) — from User (not UniversityDetail)
  const hasBasic =
    user.first_name && user.last_name && user.email && user.phone;
  sections.push({
    name: "basic_info",
    weight: 10,
    score: hasBasic ? 10 : 0,
    missing: hasBasic
      ? []
      : [
        ...(!user.first_name ? ["first_name"] : []),
        ...(!user.last_name ? ["last_name"] : []),
        ...(!user.email ? ["email"] : []),
        ...(!user.phone ? ["phone"] : []),
      ],
  });

  // 2. Institution Info (25%)
  const hasCollegeName = !!universityDetail.college_name?.trim();
  const hasAddress = !!universityDetail.address?.trim();
  const hasPincode = !!universityDetail.pincode?.trim();
  const hasAbout = !!universityDetail.about?.trim();
  const hasWebsite = !!universityDetail.website_link?.trim();

  // 5 fields × 5% = 25%
  const instInfoScore =
    (hasCollegeName ? 5 : 0) +
    (hasAddress ? 5 : 0) +
    (hasPincode ? 5 : 0) +
    (hasAbout ? 5 : 0) +
    (hasWebsite ? 5 : 0);

  sections.push({
    name: "institution_info",
    weight: 25,
    score: instInfoScore,
    missing: [
      ...(hasCollegeName ? [] : ["college_name"]),
      ...(hasAddress ? [] : ["address"]),
      ...(hasPincode ? [] : ["pincode"]),
      ...(hasAbout ? [] : ["about"]),
      ...(hasWebsite ? [] : ["website_link"]),
    ],
  });

  // 3. Logo & Profile Pic (10%)
  const hasLogo = !!universityDetail.university_logo_url;
  const hasProfilePic = !!universityDetail.profile_pic;
  const logoScore = (hasLogo ? 5 : 0) + (hasProfilePic ? 5 : 0);
  sections.push({
    name: "logo_and_profile_pic",
    weight: 10,
    score: logoScore,
    missing: [
      ...(hasLogo ? [] : ["university_logo"]),
      ...(hasProfilePic ? [] : ["profile_pic"]),
    ],
  });

  // 4. Verification (20%)
  // University verification should only depend on email + phone (per product requirement).
  // Old code included Aadhaar and admin approval which prevented verification reaching 100%.
  let verifScore = 0;
  const missingVerif = [];
  if (universityDetail.email_id_verified) verifScore += 10;
  else missingVerif.push("email");

  if (universityDetail.phone_verified) verifScore += 10;
  else missingVerif.push("phone");

  // Do NOT count Aadhaar or admin approval here — they are not part of the University Authentication score.
  sections.push({
    name: "verification",
    weight: 20,
    score: verifScore,
    missing: missingVerif,
  });

  // Debug: log verification fields and the computed verification score for university users
  try {
    console.log(
      `[profile-completion][UNIVERSITY] user_id=${user.id} verification fields: email_id_verified=${universityDetail.email_id_verified}, phone_verified=${universityDetail.phone_verified}, aadhar_verified=${universityDetail.aadhar_verified}, is_verified=${universityDetail.is_verified}; verifScore=${verifScore}`
    );
  } catch (logErr) {
    console.warn('[profile-completion] failed to log university verification debug info', logErr);
  }

  // 5. Authorization Letter (10%)
  sections.push({
    name: "authorization_letter",
    weight: 10,
    score: universityDetail.authorization_letter_url ? 10 : 0,
    missing: universityDetail.authorization_letter_url
      ? []
      : ["authorization_letter"],
  });

  // 6. Affiliation & Links (5%)
  const hasAffiliation = !!universityDetail.affiliated_university?.trim();
  const hasSocial = !!universityDetail.social_media_link?.trim();
  const affilScore = (hasAffiliation ? 2.5 : 0) + (hasSocial ? 2.5 : 0);
  sections.push({
    name: "affiliation_and_links",
    weight: 5,
    score: affilScore,
    missing: [
      ...(hasAffiliation ? [] : ["affiliated_university"]),
      ...(hasSocial ? [] : ["social_media_link"]),
    ],
  });

  // 7. Courses Offered (20%)
  const courseCount = universityDetail.courses?.length || 0;
  // Full credit if at least 1 course is offered
  const courseScore = courseCount > 0 ? 20 : 0;
  sections.push({
    name: "courses_offered",
    weight: 20,
    score: courseScore,
    current_count: courseCount,
    target_count: 1,
    missing: courseCount >= 1 ? [] : ["add at least 1 course"],
  });

  return sections;
}

// -------------------------------
// HELPER: Empty breakdown fallback
// -------------------------------
function generateEmptyBreakdown(userRole) {
  return {
    basic_info: {
      weight: 15,
      completed: false,
      score: 0,
      missing: ["first_name", "last_name", "email", "phone"],
    },
    verification: {
      weight: 10,
      completed: false,
      score: 0,
      missing: ["email", "phone"],
    },
    personal_details: {
      weight: 10,
      completed: false,
      score: 0,
      missing: ["dob", "gender", "location"],
    },
    languages: {
      weight: userRole === "STUDENT" ? 5 : 0,
      completed: false,
      score: 0,
      missing: ["languages you know"],
      not_applicable: userRole !== "STUDENT",
    },
    education: {
      weight: ["STUDENT", "UNIVERSITY"].includes(userRole) ? 15 : 0,
      completed: false,
      score: 0,
      not_applicable: !["STUDENT", "UNIVERSITY"].includes(userRole),
    },
    experience: {
      weight: userRole !== "UNIVERSITY" ? 15 : 0,
      completed: false,
      score: 0,
      not_applicable: userRole === "UNIVERSITY",
    },
    skills: {
      weight: 10,
      completed: false,
      score: 0,
      current_count: 0,
      target_count: 3,
    },
    resume: { weight: 10, completed: false, score: 0, missing: ["resume"] },
    profile_photo: {
      weight: 5,
      completed: false,
      score: 0,
      missing: ["profile_photo"],
    },
    document_verification: {
      weight: userRole === "STUDENT" ? 10 : 0,
      completed: false,
      score: 0,
      not_applicable: userRole !== "STUDENT",
    },
  };
}

// function generateEmptyCompanyBreakdown() {
//   return {
//     basic_info: {
//       weight: 10,
//       completed: false,
//       score: 0,
//       missing: ["first_name", "last_name", "email", "phone"],
//     },
//     company_info: {
//       weight: 30,
//       completed: false,
//       score: 0,
//       missing: [
//         "company_name",
//         "industry",
//         "company_location",
//         "about",
//         "logo",
//       ],
//     },
//     designation: {
//       weight: 5,
//       completed: false,
//       score: 0,
//       missing: ["designation"],
//     },
//     verification: {
//       weight: 45,
//       completed: false,
//       score: 0,
//       missing: ["email", "phone", "gst_verification"],
//     },
//     profile_photo: {
//       weight: 5,
//       completed: false,
//       score: 0,
//       missing: ["profile_photo"],
//     },
//     // languages: {
//     //   weight: 10,
//     //   completed: false,
//     //   score: 0,
//     //   current_count: 0,
//     //   target_count: 2,
//     //   missing: ["add at least 2 languages"],
//     // },
//     // job_posts: {
//     //   weight: 25,
//     //   completed: false,
//     //   score: 0,
//     //   current_count: 0,
//     //   target_count: 1,
//     //   missing: ["create at least one job post"],
//     // },
//   };
// }


function generateEmptyCompanyBreakdown() {
  return {
    basic_info: {
      weight: 25,
      completed: false,
      score: 0,
      missing: ["first_name", "last_name", "email", "phone"],
    },
    company_info: {
      weight: 45,
      completed: false,
      score: 0,
      missing: ["company_name", "industry", "company_location", "about", "logo_url", "gst_number"],
    },
    verification: {
      weight: 30,
      completed: false,
      score: 0,
      missing: ["email_verification", "phone_verification", "gst_verification"],
    },
  };
}

function generateEmptyUniversityBreakdown() {
  return {
    basic_info: {
      weight: 10,
      completed: false,
      score: 0,
      missing: ["first_name", "last_name", "email", "phone"],
    },
    institution_info: {
      weight: 25,
      completed: false,
      score: 0,
      missing: ["college_name", "address", "pincode", "about", "website_link"],
    },
    logo_and_profile_pic: {
      weight: 10,
      completed: false,
      score: 0,
      missing: ["university_logo", "profile_pic"],
    },
    verification: {
      weight: 20,
      completed: false,
      score: 0,
      missing: ["email", "phone", "aadhaar", "admin_approval"],
    },
    authorization_letter: {
      weight: 10,
      completed: false,
      score: 0,
      missing: ["authorization_letter"],
    },
    affiliation_and_links: {
      weight: 5,
      completed: false,
      score: 0,
      missing: ["affiliated_university", "social_media_link"],
    },
    courses_offered: {
      weight: 20,
      completed: false,
      score: 0,
      current_count: 0,
      target_count: 3,
      missing: ["add at least 3 courses"],
    },
  };
}

module.exports = {
  createUserDetails,
  saveUserDetails,
  getUserDetailsByuser_id,
  updateUserDetailsByuser_id,
  updateterms_and_condition,
  getterms_and_condition,
  getAadhaarVerificationStatus,
  updateAadhaarDetails,
  getPublicProfileByuser_id,
  getResumeDataByUserId,
  getPublicProfileByUUID,
  getProfileCompletion,
  getPublicProfile,
};
