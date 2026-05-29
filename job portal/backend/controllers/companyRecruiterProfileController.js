const multer = require('multer');
const path = require('path');
const {
  User,
  CompanyRecruiterProfile,
  JobPost,
  Skill,
  JobRole,
  FilterOption,
  SchoolCollege,
  Course,
  Application,
  UserDetail,
  Experience,
  InterviewInvitation,
  Language,
  Industry,
  Location,
  AccessScope
} = require('../models');
const sequelize = require('../db');
const { parseBoolean, parseJsonField, extractProfileFiles } = require('../utils/fieldParsers');
const { upload, handleUploadError } = require('../utils/upload');
const { Op } = require("sequelize");
const { bootstrapCompanyRBAC } = require("../utils/rbacBootstrap");
const { getRBACContext } = require('../utils/rbacContext');
const { getAccessibleJobIds } = require("../utils/jobAccessService");
const { generateAuthToken } = require("../utils/jwtHelpers");

const getTiedUpColleges = async (req, res) => {
  try {
    const user_id = req.user.id;
    // Find the company profile for the logged in user
    const profile = await CompanyRecruiterProfile.findOne({ where: { user_id } });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Company profile not found" });
    }

    const query = `
      SELECT sc.id as id, sc.name as name, sc.logo_pic as logo_pic, cut.status as status
      FROM school_colleges sc
      INNER JOIN company_university_tieups cut ON sc.id = cut.university_id
      WHERE cut.company_id = :companyId AND cut.status = 'active'
    `;

    const [colleges] = await sequelize.query(query, {
      replacements: { companyId: profile.id }
    });

    return res.status(200).json({
      success: true,
      data: colleges,
      message: "Tied-up colleges fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching tied-up colleges:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

/**
 * Campus hiring: colleges that are approved on the platform (school_colleges.status = 1)
 * and have an active tie-up with this company (company_university_tieups.status = 'active').
 * Optional query: search (min 3 chars) — same character rules as master school-college search.
 */
const getCampusHiringTieUpColleges = async (req, res) => {
  try {
    const user_id = req.user.id;
    const profile = await CompanyRecruiterProfile.findOne({ where: { user_id } });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Company profile not found" });
    }

    const rawSearch = (req.query.search || "").trim();
    let searchTerm = null;
    if (rawSearch.length > 0) {
      if (rawSearch.length < 3) {
        return res.status(400).json({
          success: false,
          message: "Please enter at least 3 characters to search",
        });
      }
      const safePattern = /^[a-zA-Z0-9\s\-_]+$/;
      if (!safePattern.test(rawSearch)) {
        return res.status(400).json({
          success: false,
          message: "Search input contains invalid characters.",
        });
      }
      searchTerm = rawSearch;
    }

    let query = `
      SELECT sc.id AS id,
             sc.name AS college_name,
             sc.logo_pic AS logo
      FROM school_colleges sc
      INNER JOIN company_university_tieups cut ON sc.id = cut.university_id
      WHERE cut.company_id = :companyId
        AND cut.status = 'active'
        AND sc.status = 1
    `;
    const replacements = { companyId: profile.id };

    if (searchTerm) {
      query += ` AND sc.name LIKE :likeSearch`;
      replacements.likeSearch = `%${searchTerm}%`;
    }

    query += ` ORDER BY sc.name ASC LIMIT 500`;

    const [rows] = await sequelize.query(query, { replacements });

    const data = rows.map((r) => ({
      id: r.id,
      college_name: r.college_name,
      slug: null,
      logo: r.logo ?? null,
    }));

    return res.status(200).json({
      success: true,
      data,
      message: "Campus hiring tie-up colleges fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching campus hiring tie-up colleges:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// Data sanitization utility
const sanitizeJobPost = (post) => {
  const plainPost = post.get({ plain: true });
  const jsonFields = ['perks', 'screening_questions'];
  jsonFields.forEach(field => {
    if (plainPost[field] && typeof plainPost[field] === 'string') {
      try {
        plainPost[field] = JSON.parse(plainPost[field].replace(/\\"/g, "'"));
      } catch (e) {
        console.error(`Error parsing ${field} for job post ${plainPost.job_id}`);
        plainPost[field] = [];
      }
    }
  });
  if (plainPost.internship_start_date && !(plainPost.internship_start_date instanceof Date)) {
    plainPost.internship_start_date = new Date(plainPost.internship_start_date);
  }
  return plainPost;
};

const createProfile = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user_id = req.user.id;

    // 1. Extract All Fields from Request (including new address fields)
    const {
      designation_id,
      other_designation_name,
      company_id,
      company_name,
      industry_id,
      custom_industry_name,
      company_location_id,
      about,
      logo_url,
      profile_pic,
      gst_number,
      company_address,
      hiring_preferences,
      language_ids = [],
      // ===== NEW ADDRESS FIELDS =====
      address_line_1,
      address_line_2,
      state,
      country,
      pincode,
      // ===== END NEW FIELDS =====
    } = req.body;

    // 2. Basic Validation
    if (!company_id && !company_name) {
      await transaction.rollback();
      return res.status(400).json({ message: "Company ID or Company Name is required." });
    }

    if (!industry_id && !custom_industry_name) {
      await transaction.rollback();
      return res.status(400).json({ message: "Industry ID or Custom Industry Name is required." });
    }

    let profile = null;
    let message = "";

    // 3. Handle Company Logic (Claim vs Create)
    if (company_id) {
      // --- CASE A: USER SELECTED EXISTING COMPANY (CLAIM) ---
      profile = await CompanyRecruiterProfile.findByPk(company_id, { transaction });
      if (!profile) {
        await transaction.rollback();
        return res.status(404).json({ message: "Selected company not found." });
      }
      if (profile.user_id && profile.user_id !== user_id) {
        await transaction.rollback();
        return res.status(409).json({
          message: "This company is already registered by another recruiter. Please contact support."
        });
      }
      // Update the existing record with all provided details (including new fields)
      await profile.update({
        user_id: user_id,
        status: 1,
        is_verified: false,
        industry_id: industry_id || profile.industry_id,
        company_location_id: company_location_id || profile.company_location_id,
        about: about || profile.about,
        logo_url: logo_url || profile.logo_url,
        profile_pic: profile_pic || profile.profile_pic,
        gst_number: gst_number || profile.gst_number,
        company_address: company_address || profile.company_address,
        hiring_preferences: hiring_preferences || profile.hiring_preferences,
        // ===== NEW FIELDS UPDATE =====
        address_line_1: address_line_1 || null,
        address_line_2: address_line_2 || null,
        state: state || null,
        country: country || null,
        pincode: pincode || null,
        // ===== END NEW FIELDS =====
      }, { transaction });
      message = "Company profile claimed successfully.";
    } else {
      // --- CASE B: USER TYPED A NEW COMPANY NAME (CREATE) ---
      const cleanName = company_name.trim();
      const existingCompany = await CompanyRecruiterProfile.findOne({
        where: {
          company_name: { [Op.like]: `%${cleanName}%` },
          status: { [Op.ne]: 2 }
        },
        transaction
      });
      if (existingCompany) {
        if (!existingCompany.user_id || existingCompany.user_id === user_id) {
          await existingCompany.update({
            user_id: user_id,
            status: 1,
            is_verified: false,
            industry_id,
            company_location_id,
            about,
            logo_url,
            profile_pic,
            gst_number,
            company_address,
            hiring_preferences,
            // ===== NEW FIELDS =====
            address_line_1: address_line_1 || null,
            address_line_2: address_line_2 || null,
            state: state || null,
            country: country || null,
            pincode: pincode || null,
            // ===== END NEW FIELDS =====
          }, { transaction });
          profile = existingCompany;
          message = "Existing company claimed successfully.";
        } else {
          await transaction.rollback();
          return res.status(409).json({
            message: "A company with this name already exists. Please search and select it from the dropdown.",
            existing_id: existingCompany.id
          });
        }
      } else {
        // Truly new company -> Create Row with ALL fields
        profile = await CompanyRecruiterProfile.create({
          user_id: user_id,
          company_name: cleanName,
          industry_id: null,
          company_location_id,
          about,
          logo_url,
          profile_pic,
          gst_number,
          company_address,
          hiring_preferences,
          status: 1,
          is_verified: false,
          designation_id: null,
          // ===== NEW FIELDS =====
          address_line_1: address_line_1 || null,
          address_line_2: address_line_2 || null,
          state: state || null,
          country: country || null,
          pincode: pincode || null,
          // ===== END NEW FIELDS =====
        }, { transaction });
        message = "New company created successfully.";
      }
    }

    // 4. Handle Designation
    let finalDesignationId = designation_id ? parseInt(designation_id, 10) : null;
    if (!finalDesignationId && other_designation_name && other_designation_name.trim()) {
      const [jobRole] = await JobRole.findOrCreate({
        where: { title: other_designation_name.trim() },
        defaults: { title: other_designation_name.trim() },
        transaction,
      });
      finalDesignationId = jobRole.id;
    }
    if (finalDesignationId) {
      await profile.update({ designation_id: finalDesignationId }, { transaction });
    }

    // 5. Handle Custom Industry
    let finalIndustryId = industry_id ? parseInt(industry_id, 10) : null;
    if (!finalIndustryId && custom_industry_name && custom_industry_name.trim()) {
      const [industry] = await Industry.findOrCreate({
        where: { name: custom_industry_name.trim() },
        defaults: { name: custom_industry_name.trim() },
        transaction,
      });
      finalIndustryId = industry.id;
    }
    if (finalIndustryId) {
      await profile.update({ industry_id: finalIndustryId }, { transaction });
    }

    // 6. Handle Languages
    if (Array.isArray(language_ids) && language_ids.length > 0) {
      await profile.setLanguages(language_ids, { transaction });
    }

    // 7. Update User Table Status
    await User.update(
      { status: 2 },
      { where: { id: user_id }, transaction }
    );

    await transaction.commit();

    // 8. Prepare Response
    await bootstrapCompanyRBAC(user_id, profile.id, profile.company_name);
    const rbac = await getRBACContext(user_id);
    const updatedUser = await User.findOne({
      where: { id: user_id },
      attributes: ['id', 'uuid', 'first_name', 'last_name', 'email', 'phone', 'user_role', 'status']
    });
    const token = await generateAuthToken(updatedUser);
    const createdProfile = await CompanyRecruiterProfile.findByPk(profile.id, {
      include: [
        {
          model: Language,
          as: "languages",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
    });

    const extraDetails = {
      user_profile_pic: createdProfile.profile_pic || null,
      about_us: createdProfile.about || null,
      organization_name: createdProfile.company_name || null,
      organization_logo: createdProfile.logo_url || null,
    };

    const fullUser = {
      id: updatedUser.id,
      uuid: updatedUser.uuid,
      first_name: updatedUser.first_name,
      last_name: updatedUser.last_name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      user_role: updatedUser.user_role,
      profile_status: updatedUser.status,
      ...extraDetails,
      ...rbac,
    };

    const responseProfile = {
      ...createdProfile.toJSON(),
      profile_picUrl: createdProfile.profile_pic,
      // ===== INCLUDE NEW ADDRESS FIELDS IN RESPONSE =====
      address_line_1: createdProfile.address_line_1,
      address_line_2: createdProfile.address_line_2,
      state: createdProfile.state,
      country: createdProfile.country,
      pincode: createdProfile.pincode,
      // ===== END NEW FIELDS =====
      ...rbac,
    };
    delete responseProfile.profile_pic;

    return res.status(201).json({
      message: message,
      profile: responseProfile,
      token: token,
      user: fullUser,
    });

  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    console.error("Error creating recruiter profile:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user_id = req.user.id;
    const scope = await AccessScope.findOne({
      where: {
        id: req.user.scopeId,
        scope_type: 'COMPANY'
      }
    });
    if (!scope) {
      return res.status(400).json({ message: 'No active company' });
    }
    const profile = await CompanyRecruiterProfile.findOne({
      where: { id: scope.scope_id },
      include: [
        {
          model: Language,
          as: 'languages',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        },
        {
          model: Industry,
          as: 'industry',
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: JobRole,
          as: 'designation',
          attributes: ['id', 'title'],
          required: false
        },
        {
          model: Location,
          as: 'companyLocation',
          attributes: ['id', 'name'],
          required: false
        },
        {
          model: User,
          as: 'user',
          attributes: ["uuid",'first_name', 'last_name', 'email', 'phone', 'dob', 'gender'],
          required: true
        }
      ]
    });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    if (profile?.status === 4) {
      return res.status(403).json({ 
        success: false, 
        message: "Company account has been deleted." 
      });
    }

    const user = profile.user;
    const response = {
      id: profile.id,
      user_id: profile.user_id,
      uuid: profile.uuid,
      // --- User-level fields ---
      first_name: user.first_name,
      last_name: user.last_name,
      name: `${user.first_name} ${user.last_name}`.trim(),
      email: user.email,
      mobile: user.phone,
      dob: user.dob,
      gender: user.gender,
      // --- Company-level fields ---
      company_name: profile.company_name,
      designation_id: profile.designation_id,
      designation_name: profile.designation?.title,
      industry_id: profile.industry_id,
      industry_name: profile.industry?.name,
      company_location_id: profile.company_location_id,
      location_name: profile.companyLocation?.name,
      about: profile.about,
      gst_number: profile.gst_number,
      company_address: profile.company_address,
      logo_url: profile.logo_url,
      hiring_preferences: profile.hiring_preferences,
      is_email_verified: profile.is_email_verified,
      is_phone_verified: profile.is_phone_verified,
      is_gst_verified: profile.is_gst_verified,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      languages: profile.languages || [],
      profile_picUrl: profile.profile_pic,
      // ===== NEW ADDRESS FIELDS IN RESPONSE =====
      address_line_1: profile.address_line_1,
      address_line_2: profile.address_line_2,
      state: profile.state,
      country: profile.country,
      pincode: profile.pincode,
      // ===== END NEW FIELDS =====
    };
    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching recruiter profile:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const updateProfile = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const user_id = req.user.id;
    if (!req.body) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Request body is missing' });
    }
    const scope = await AccessScope.findOne({
      where: {
        id: req.user.scopeId,
        scope_type: "COMPANY",
      },
    });
    if (!scope) {
      await transaction.rollback();
      return res.status(400).json({ message: "No active company" });
    }
    const profile = await CompanyRecruiterProfile.findOne({
      where: { id: scope.scope_id },
      include: [{ model: User, as: 'user' }],
      transaction
    });
    if (!profile) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Profile not found' });
    }

    const {
      // User fields
      first_name,
      last_name,
      email,
      phone,
      dob,
      gender,
      // Company fields
      designation_id,
      company_name,
      industry_id,
      company_location_id,
      about,
      gst_number,
      company_address,
      logo_url: logo_urlFromBody,
      profile_pic: profile_picFromBody,
      hiring_preferences,
      is_email_verified,
      is_phone_verified,
      is_gst_verified,
      language_ids = [],
      // ===== NEW ADDRESS FIELDS =====
      address_line_1,
      address_line_2,
      state,
      country,
      pincode,
      // ===== END NEW FIELDS =====
    } = req.body;

    const { profile_pic: extractedProfilePic, logo_url: extractedLogoUrl } = extractProfileFiles(req.files);
    const emailChanged = email !== undefined && email !== profile.user.email;
    const phoneChanged = phone !== undefined && phone !== profile.user.phone;

    // Update associated User
    await profile.user.update(
      {
        first_name: first_name !== undefined ? first_name : profile.user.first_name,
        last_name: last_name !== undefined ? last_name : profile.user.last_name,
        email: email !== undefined ? email : profile.user.email,
        phone: phone !== undefined ? phone : profile.user.phone,
        dob: dob !== undefined ? dob : profile.user.dob,
        gender: gender !== undefined ? gender : profile.user.gender
      },
      { transaction }
    );

    // Update CompanyRecruiterProfile (including new address fields)
    await profile.update(
      {
        designation_id: designation_id !== undefined ? designation_id : profile.designation_id,
        company_name: company_name || profile.company_name,
        industry_id: industry_id !== undefined ? industry_id : profile.industry_id,
        company_location_id: company_location_id !== undefined ? company_location_id : profile.company_location_id,
        about: about !== undefined ? about : profile.about,
        gst_number: gst_number !== undefined ? gst_number : profile.gst_number,
        company_address: company_address !== undefined ? company_address : profile.company_address,
        logo_url: extractedLogoUrl || logo_urlFromBody || profile.logo_url,
        profile_pic: extractedProfilePic || profile_picFromBody || profile.profile_pic,
        hiring_preferences: hiring_preferences !== undefined ? hiring_preferences : profile.hiring_preferences,
        is_email_verified: emailChanged ? false : is_email_verified !== undefined ? parseBoolean(is_email_verified) : profile.is_email_verified,
        is_phone_verified: phoneChanged ? false : is_phone_verified !== undefined ? parseBoolean(is_phone_verified) : profile.is_phone_verified,
        is_gst_verified: is_gst_verified !== undefined ? parseBoolean(is_gst_verified) : profile.is_gst_verified,
        // ===== NEW FIELDS UPDATE =====
        address_line_1: address_line_1 !== undefined ? address_line_1 : profile.address_line_1,
        address_line_2: address_line_2 !== undefined ? address_line_2 : profile.address_line_2,
        state: state !== undefined ? state : profile.state,
        country: country !== undefined ? country : profile.country,
        pincode: pincode !== undefined ? pincode : profile.pincode,
        // ===== END NEW FIELDS =====
      },
      { transaction }
    );

    if (Array.isArray(language_ids)) {
      await profile.setLanguages(language_ids, { transaction });
    }

    await transaction.commit();

    // Reload full profile with associations
    const updatedProfile = await CompanyRecruiterProfile.findByPk(profile.id, {
      include: [
        { model: Language, as: 'languages', attributes: ['id', 'name'], through: { attributes: [] } },
        { model: Industry, as: 'industry', attributes: ['id', 'name'], required: false },
        { model: JobRole, as: 'designation', attributes: ['id', 'title'], required: false },
        { model: Location, as: 'companyLocation', attributes: ['id', 'name'], required: false },
        { model: User, as: 'user', attributes: ['first_name', 'last_name', 'email', 'phone', 'dob', 'gender'] }
      ]
    });

    const user = updatedProfile.user;
    const response = {
      id: updatedProfile.id,
      user_id: updatedProfile.user_id,
      first_name: user.first_name,
      last_name: user.last_name,
      name: `${user.first_name} ${user.last_name}`.trim(),
      email: user.email,
      mobile: user.phone,
      dob: user.dob,
      gender: user.gender,
      company_name: updatedProfile.company_name,
      designation_id: updatedProfile.designation_id,
      designation_name: updatedProfile.designation?.title,
      industry_id: updatedProfile.industry_id,
      industry_name: updatedProfile.industry?.name,
      company_location_id: updatedProfile.company_location_id,
      location_name: updatedProfile.companyLocation?.name,
      about: updatedProfile.about,
      gst_number: updatedProfile.gst_number,
      company_address: updatedProfile.company_address,
      logo_url: updatedProfile.logo_url,
      hiring_preferences: updatedProfile.hiring_preferences,
      is_email_verified: updatedProfile.is_email_verified,
      is_phone_verified: updatedProfile.is_phone_verified,
      is_gst_verified: updatedProfile.is_gst_verified,
      created_at: updatedProfile.created_at,
      updated_at: updatedProfile.updated_at,
      languages: updatedProfile.languages || [],
      profile_picUrl: updatedProfile.profile_pic,
      // ===== NEW ADDRESS FIELDS IN RESPONSE =====
      address_line_1: updatedProfile.address_line_1,
      address_line_2: updatedProfile.address_line_2,
      state: updatedProfile.state,
      country: updatedProfile.country,
      pincode: updatedProfile.pincode,
      // ===== END NEW FIELDS =====
    };
    delete response.profile_pic;

    return res.status(200).json({
      message: 'Company recruiter profile updated successfully',
      profile: response
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }
    console.error('Error updating recruiter profile:', error);
    return res.status(500).json({
      message: 'Internal server error',
      error: error.message
    });
  }
};

// ... (baaki functions unchanged: incrementViewCount, updateExperienceStatus, getPipelineCandidates, etc.)

const incrementViewCount = async (req, res) => {
  try {
    const job_id = req.params.job_id;
    if (!job_id) {
      return res.status(400).json({ message: "Job ID is required." });
    }
    const jobPost = await JobPost.findOne({ where: { job_id } });
    if (!jobPost) {
      return res.status(404).json({ message: "Job post not found." });
    }
    jobPost.views = (jobPost.views || 0) + 1;
    await jobPost.save();
    return res.status(200).json({ message: "View count incremented.", views: jobPost.views });
  } catch (error) {
    console.error("Error incrementing view count:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

async function updateExperienceStatus(req, res) {
  try {
    const user_id = req.user.id;
    const { experienceId } = req.params;
    const { status } = req.body;
    if (!['approved', 'unapproved', 'pending', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }
    const companyRecruiterProfile = await require('../models').CompanyRecruiterProfile.findOne({ where: { user_id } });
    if (!companyRecruiterProfile) {
      return res.status(403).json({ message: 'Unauthorized: Company recruiter profile not found.' });
    }
    const experience = await Experience.findOne({
      where: {
        id: experienceId,
        company_recruiter_profile_id: companyRecruiterProfile.id,
      }
    });
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found for this company recruiter.' });
    }
    experience.status = status;
    await experience.save();
    return res.status(200).json({ message: 'Experience status updated successfully.', experience });
  } catch (error) {
    console.error('Error updating experience status:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

const getPipelineCandidates = async (req, res) => {
  try {
    const recruiter_id = req.user.id;
    const { status, job_id } = req.query;
    if (!recruiter_id) {
      return res.status(401).json({ message: "Unauthorized. User ID not found or token invalid" });
    }
    const recruiterProfile = await CompanyRecruiterProfile.findOne({
      where: { user_id: recruiter_id },
      attributes: ["id", "company_name", "logo_url"],
    });
    if (!recruiterProfile) {
      return res.status(404).json({ message: "Recruiter profile not found" });
    }
    const pipelineStatuses = ["Applied", "Screening", "Interview", "Offered", "ShortList", "Send Assignment", "Hired"];
    const pipeline = await Application.findAll({
      where: { status: pipelineStatuses },
      include: [
        {
          model: UserDetail,
          as: "user",
          attributes: ["id", "first_name", "last_name", "email", "user_profile_pic", "resume"],
          include: [{
            model: Experience,
            as: "experiences",
            attributes: ["id", "company_recruiter_profile_id", "start_date", "end_date"],
          }],
        },
        {
          model: JobPost,
          as: "jobPost",
          where: {
            company_recruiter_profile_id: recruiterProfile.id,
            ...(job_id ? { job_id } : {}),
          },
          attributes: ["job_id", "job_role_id", "created_at"],
          include: [
            { model: JobRole, attributes: ["id", "title"] },
            { model: CompanyRecruiterProfile, attributes: ["id", "company_name", "logo_url"] },
          ],
        },
      ],
      attributes: ["id", "status", "created_at"],
    });
    const calculateTotalExperience = (experiences) => {
      if (!experiences || experiences.length === 0) return 0;
      let totalMonths = 0;
      experiences.forEach((exp) => {
        const start = new Date(exp.start_date);
        const end = exp.end_date ? new Date(exp.end_date) : new Date();
        totalMonths += (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      });
      return (totalMonths / 12).toFixed(1);
    };
    const formattedPipeline = pipeline.map((app) => {
      const user = app.user?.dataValues || {};
      const experiences = app.user?.experiences || [];
      return {
        application_id: app.id,
        status: app.status,
        applied_date: app.created_at,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          profile_pic: user.user_profile_pic,
          resume: user.resume,
          total_experience: calculateTotalExperience(experiences),
          experiences,
        },
        job: app.jobPost,
      };
    });
    return res.status(200).json({
      message: "Pipeline candidates fetched successfully",
      total: formattedPipeline.length,
      pipeline: formattedPipeline,
    });
  } catch (error) {
    console.error("Error fetching recruiter pipeline:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      return res.status(401).json({ message: "Unauthorized. User ID not found." });
    }
    const user = await User.findOne({ where: { id: user_id, user_role: "COMPANY" } });
    if (!user) {
      return res.status(403).json({ message: "Unauthorized. User is not a recruiter." });
    }
    const companyRecruiterProfile = await CompanyRecruiterProfile.findOne({ where: { user_id } });
    if (!companyRecruiterProfile) {
      return res.status(404).json({ message: "Company recruiter profile not found." });
    }
    const jobPosts = await JobPost.findAll({
      where: { company_recruiter_profile_id: companyRecruiterProfile.id },
      attributes: ["job_id"],
    });
    const job_post_ids = jobPosts.map((job) => job.job_id);
    if (job_post_ids.length === 0) {
      return res.status(200).json({ jobsPosted: 0, pendingTasks: 0, upcomingInterviews: 0 });
    }
    const [jobsPosted, applications, upcomingInterviews] = await Promise.all([
      JobPost.count({ where: { company_recruiter_profile_id: companyRecruiterProfile.id } }),
      Application.findAll({ where: { job_post_id: { [Op.in]: job_post_ids } }, attributes: ["id", "status"] }),
      InterviewInvitation.count({
        where: { interview_date: { [Op.gte]: new Date().toISOString().split("T")[0] } },
        include: [{
          model: Application,
          required: true,
          attributes: [],
          where: { job_post_id: { [Op.in]: job_post_ids } },
        }],
      }),
    ]);
    let pendingTasks = 0;
    applications.forEach((app) => {
      const status = app.status?.trim();
      if (["Applied", "Screening", "ShortList"].includes(status)) {
        pendingTasks++;
      }
    });
    return res.status(200).json({ jobsPosted, pendingTasks, upcomingInterviews });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getAlertSettings = async (req, res) => {
  try {
    const profile = await CompanyRecruiterProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }
    res.status(200).json({
      success: true,
      data: {
        email_alert_frequency: profile.email_alert_frequency,
        last_alert_sent_at: profile.last_alert_sent_at,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const updateAlertSettings = async (req, res) => {
  const { email_alert_frequency } = req.body;
  const validFrequencies = ["off", "daily", "weekly", "monthly"];
  if (!validFrequencies.includes(email_alert_frequency)) {
    return res.status(400).json({ success: false, message: "Invalid frequency" });
  }
  try {
    const profile = await CompanyRecruiterProfile.findOne({ where: { user_id: req.user.id } });
    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }
    let updateData = { email_alert_frequency };
    if (profile.email_alert_frequency === "off" && email_alert_frequency !== "off") {
      updateData.last_alert_sent_at = null;
    }
    await profile.update(updateData);
    res.status(200).json({
      success: true,
      data: {
        email_alert_frequency: updateData.email_alert_frequency,
        last_alert_sent_at: updateData.last_alert_sent_at || profile.last_alert_sent_at,
      },
      message: "Email alert settings updated successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const getJobPostsByRecruiter = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { status, post_type, opportunity_type } = req.query;
    const accessibleJobIds = await getAccessibleJobIds(userId);
    if (accessibleJobIds.length === 0) {
      return res.status(200).json({ success: true, message: "No jobs accessible", data: [] });
    }
    let where = { job_id: { [Op.in]: accessibleJobIds } };
    if (status !== undefined && ["0", "1", "2"].includes(status)) {
      where.active_status = parseInt(status, 10);
    }
    if (post_type) {
      const types = post_type.split(",").map(t => t.trim());
      where.post_type = types.length === 1 ? types[0] : { [Op.in]: types };
    }
    if (opportunity_type && ["Internship", "Project", "Job"].includes(opportunity_type)) {
      where.opportunity_type = opportunity_type;
    }
    const jobPosts = await JobPost.findAll({
      where,
      include: [
        { model: Skill, as: "skills", through: { attributes: [] } },
        { model: JobRole, attributes: ["id", "title"] },
        { model: SchoolCollege, as: "eligibleColleges", attributes: ["id", "name"], through: { attributes: [] } },
        { model: Course, as: "eligibleCourses", attributes: ["id", "name"], through: { attributes: [] } },
      ],
      order: [["created_at", "DESC"]]
    });
    const enhancedData = jobPosts.map(post => {
      try {
        const safePost = sanitizeJobPost(post);
        const stipendText = (() => {
          if (safePost.stipend_min == null && safePost.stipend_max == null) return "Unpaid";
          if (safePost.stipend_min === safePost.stipend_max) return `₹${safePost.stipend_min}/${safePost.stipend_type || "mo"}`;
          return `₹${safePost.stipend_min}–${safePost.stipend_max}/${safePost.stipend_type || "mo"}`;
        })();
        const createdAt = new Date(safePost.created_at);
        const expires = new Date(createdAt);
        if (safePost.post_type === "future") {
          expires.setFullYear(expires.getFullYear() + 1);
        } else {
          expires.setMonth(expires.getMonth() + 1);
        }
        const job_expires = expires.toISOString().split("T")[0];
        return {
          ...safePost,
          opportunityType: safePost.opportunity_type || "—",
          jobType: safePost.post_type || "—",
          stipendText,
          collegeCount: post.eligibleColleges?.length || 0,
          paymentType: safePost.payment_type || "free",
          skillCount: post.skills?.length || 0,
          perks: safePost.perks || [],
          screening_questions: safePost.screening_questions || [],
          internship_start_date: safePost.internship_start_date ? safePost.internship_start_date.toISOString().split("T")[0] : null,
          job_expires,
        };
      } catch (e) {
        console.error("Error processing job post:", post.job_id, e);
        return null;
      }
    }).filter(Boolean);
    res.status(200).json({ success: true, message: "Job posts retrieved", data: enhancedData });
  } catch (error) {
    console.error("Error in getJobPostsByRecruiter:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  createProfile,
  getProfile,
  updateProfile,
  getJobPostsByRecruiter,
  incrementViewCount,
  updateExperienceStatus,
  upload,
  handleUploadError,
  sanitizeJobPost,
  getPipelineCandidates,
  getDashboardStats,
  getAlertSettings,
  updateAlertSettings,
  getTiedUpColleges,
  getCampusHiringTieUpColleges
};