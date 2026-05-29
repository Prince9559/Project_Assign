const { UniversityDetail, User, FeedPost, Course, UniversityCourse, sequelize, SchoolCollege } = require('../models');
const universitydetail = require('../models/universitydetail');

function validateUniversityCreatePayload(body) {
  const messages = [];
  const str = (v) =>
    typeof v === 'string' ? v.trim() : v == null ? '' : String(v).trim();

  const {
    college_name,
    affiliated_university,
    address,
    pincode,
    website_link,
    about,
    authorization_letter_url,
  } = body;

  if (!str(college_name)) messages.push('College name is required');
  if (!str(affiliated_university)) messages.push('Affiliated university is required');
  if (!str(address)) messages.push('Address is required');

  const pc = str(pincode);
  if (!pc) messages.push('Pincode is required');
  else if (!/^\d{6}$/.test(pc)) messages.push('Enter valid 6-digit pincode');

  const web = str(website_link);
  if (!web) messages.push('Website link is required');
  else if (!/^https?:\/\//i.test(web)) messages.push('Website link must start with http:// or https://');

  if (!str(about)) messages.push('About is required');

  const auth = str(authorization_letter_url);
  if (!auth) messages.push('Authorization letter is required');
  else if (!/\.pdf($|\?|#)/i.test(auth)) {
    messages.push('Authorization letter must be a PDF file');
  }

  return messages;
}


const getUniversityDetailById = async (req, res) => {
  try {
    const universityId = req.params.id;
    const universityDetail = await UniversityDetail.findOne({
      where: { user_id: universityId },
      include: [
        {
          model: Course,
          as: 'courses',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        },
        {
          model: User,
          as: 'User',
          attributes: ['id', 'email', 'phone']
        }
      ]
    });
    if (!universityDetail) {
      return res.status(404).json({ message: 'University detail not found' });
    }
    try {
      console.log(`[universitydetail] fetched for user_id=${universityId}:`, universityDetail.get({ plain: true }));
    } catch (logErr) {
      console.warn('[universitydetail] could not stringify fetched detail', logErr);
    }
    return res.status(200).json({
      success: true,
      message: 'University detail retrieved successfully',
      data: universityDetail
    });
  } catch (error) {
    console.error('Error in getUniversityDetailById:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

const universityprofile = async (req, res) => {
  try {
    const { user_id } = req.params;
    if (!user_id) {
      return res.status(400).json({ message: "Missing user_id parameter" });
    }
    
    // First get the university details
    const universityDetail = await UniversityDetail.findOne({
      where: { user_id },
      include: [
        {
          model: User,
          as: 'User',
          attributes: ['first_name','last_name','email', 'phone','user_role']
        }
      ],
      attributes: [
        'id', 'university_logo_url', 'pincode','affiliated_university',
        'profile_pic', 'college_name', 'address', 'website_link', 'about', 'social_media_link'
      ]
    });

    if (!universityDetail) {
      return res.status(404).json({ message: "Profile not found" });
    }

    // Get courses separately to handle the many-to-many relationship
    const courses = await Course.findAll({
      include: [{
        model: UniversityDetail,
        as: 'universities',
        where: { id: universityDetail.id },
        attributes: [],
        through: { attributes: [] }
      }],
      attributes: ['id', 'name']
    });
    
    const universityData = universityDetail.get({ plain: true });
    universityData.courses = courses.map(course => course.get({ plain: true }));
    
    const feedPosts = await FeedPost.findAll({
      where: { user_id },
      attributes: ['caption', 'image', 'like_count', 'comment_count', 'created_at'],
      order: [['created_at', 'DESC']],
      raw: true
    });
    
    return res.status(200).json({
      publicProfile: universityData,
      activity: feedPosts
    });
  }
  catch (error) {
    console.error("Error fetching university profile:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


const createUniversityDetail = async (req, res) => {
  const startTime = Date.now();
  console.log('Starting university creation with transaction...');
  
  const transaction = await sequelize.transaction();
  const transactionStart = Date.now();
  console.log(`Transaction started: ${Date.now() - startTime}ms`);
  
  try {
    const user_id = req.user.id;
    const { course_ids = [], school_college_id: rawSchoolCollegeId, ...restBody } = req.body;
    let universityData = { ...restBody };

    const hasSchoolCollegeId =
      rawSchoolCollegeId != null &&
      rawSchoolCollegeId !== "" &&
      !Number.isNaN(Number(rawSchoolCollegeId));

    if (hasSchoolCollegeId) {
      const scId = Number(rawSchoolCollegeId);
      if (!Number.isInteger(scId) || scId < 1) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Invalid college selection",
        });
      }
      const schoolCollege = await SchoolCollege.findByPk(scId, { transaction });
      if (!schoolCollege) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: "Invalid college selection",
        });
      }
      universityData.college_name = schoolCollege.name;
      universityData.school_college_id = scId;
    } else {
      universityData.school_college_id = null;
    }
    
    // Combined validation queries within transaction
    const validationStart = Date.now();
    const [user, existingDetail] = await Promise.all([
      User.findOne({
        where: { id: user_id, user_role: 'UNIVERSITY' },
        attributes: ['id'],
        transaction
      }),
      UniversityDetail.findOne({
        where: { user_id },
        attributes: ['id'],
        transaction
      })
    ]);
    
    if (!user) {
      await transaction.rollback();
      return res.status(403).json({ 
        success: false,
        message: 'Unauthorized: Only university users can create university details' 
      });
    }
    
    if (existingDetail) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false,
        message: 'University detail already exists' 
      });
    }

    const validationMessages = validateUniversityCreatePayload({
      college_name: universityData.college_name,
      affiliated_university: universityData.affiliated_university,
      address: universityData.address,
      pincode: universityData.pincode,
      website_link: universityData.website_link,
      about: universityData.about,
      authorization_letter_url: universityData.authorization_letter_url,
    });
    if (validationMessages.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: validationMessages.join(' '),
      });
    }

    // All operations in parallel within transaction
    const operationsStart = Date.now();
    const promises = [
      UniversityDetail.create({
        user_id,
        email_id_verified: true,
        ...universityData
      }, { transaction }),
      User.update({ status: 2 }, { 
        where: { id: user_id }, 
        transaction 
      })
    ];

    // Add course creation to promises if needed
    if (course_ids.length > 0) {
      // We'll need the university ID first, so create it first
      const universityDetail = await promises[0];
      
      promises.push(
        UniversityCourse.bulkCreate(
          course_ids.map(courseId => ({
            university_id: universityDetail.id,
            course_id: courseId,
            is_active: true
          })),
          { transaction }
        )
      );
      
      await Promise.all([promises[1], promises[2]]); // user update + courses
      console.log(`All operations: ${Date.now() - operationsStart}ms`);
    } else {
      const [universityDetail] = await Promise.all(promises);
      console.log(`University create + user update: ${Date.now() - operationsStart}ms`);
    }

    // Get the university detail for response
    const universityDetail = await promises[0];

    // Commit transaction
    const commitStart = Date.now();
    await transaction.commit();
    console.log(`Transaction commit: ${Date.now() - commitStart}ms`);
    console.log(`Total time: ${Date.now() - startTime}ms`);
    
    return res.status(201).json({
      success: true,
      message: "University detail created successfully",
      data: {
        id: universityDetail.id,
        user_id: user_id,
        course_ids: course_ids,
        college_name: universityData.college_name,
        school_college_id: universityData.school_college_id ?? null,
        address: universityData.address,
        pincode: universityData.pincode,
        website_link: universityData.website_link,
        about: universityData.about,
        profile_pic: universityData.profile_pic,
        university_logo_url: universityData.university_logo_url,
        social_media_link: universityData.social_media_link,
        affiliated_university: universityData.affiliated_university,
        authorization_letter_url: universityData.authorization_letter_url,
        is_verified: universityDetail.is_verified,
      },
    });

  } catch (error) {
    const rollbackStart = Date.now();
    if (!transaction.finished) {
      await transaction.rollback();
    }
    console.log(`Transaction rollback: ${Date.now() - rollbackStart}ms`);
    console.error(`Error after ${Date.now() - startTime}ms:`, error);
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};


const updateUniversityDetail = async (req, res) => {
  const startTime = Date.now();
  console.log('Starting university update with transaction...');
  
  const transaction = await sequelize.transaction();
  console.log(`Transaction started: ${Date.now() - startTime}ms`);
  
  try {
    const user_id = req.user.id;

    // Combined validation queries
    const validationStart = Date.now();
    const [user, universityDetail] = await Promise.all([
      User.findOne({
        where: { id: user_id, user_role: 'UNIVERSITY' },
        attributes: ['id', 'email', 'phone'],
        transaction
      }),
      UniversityDetail.findOne({
        where: { user_id },
        transaction
      })
    ]);
    console.log(`Validation queries: ${Date.now() - validationStart}ms`);

    if (!user) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only UNIVERSITY users can update profile.'
      });
    }

    if (!universityDetail) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'University profile not found'
      });
    }

    // --- University Change → Re-verification ---
    // If the university changes identity fields, force admin re-verification.
    const normalizeStr = (v) => (typeof v === "string" ? v.trim() : v);
    const didUniversityIdentityChange =
      (req.body.college_name !== undefined &&
        normalizeStr(universityDetail.college_name) !== normalizeStr(req.body.college_name)) ||
      (req.body.affiliated_university !== undefined &&
        normalizeStr(universityDetail.affiliated_university) !== normalizeStr(req.body.affiliated_university)) ||
      (req.body.school_college_id !== undefined &&
        universityDetail.school_college_id !== req.body.school_college_id);

    // Email validation if provided
    if (req.body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(req.body.email)) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }
    }

    // Prepare update data
    const updateData = {
      college_name: req.body.college_name ?? universityDetail.college_name,
      affiliated_university: req.body.affiliated_university ?? universityDetail.affiliated_university,
      address: req.body.address ?? universityDetail.address,
      pincode: req.body.pincode ?? universityDetail.pincode,
      website_link: req.body.website_link ?? universityDetail.website_link,
      about: req.body.about ?? universityDetail.about,
      profile_pic: req.body.profile_pic ?? universityDetail.profile_pic,
      university_logo_url: req.body.university_logo_url ?? universityDetail.university_logo_url,
      social_media_link: req.body.social_media_link ?? universityDetail.social_media_link,
      authorization_letter_url: req.body.authorization_letter_url ?? universityDetail.authorization_letter_url,
      email_id_verified: req.body.email_id_verified ?? universityDetail.email_id_verified,
      aadhar_verified: req.body.aadhar_verified ?? universityDetail.aadhar_verified,
      phone_verified: req.body.phone_verified ?? universityDetail.phone_verified,
      ...(didUniversityIdentityChange ? { is_verified: false } : {}),
    };

    // --- Mandatory field validation (do not allow blanking required fields) ---
    const requiredUpdateFields = [
      "college_name",
      "affiliated_university",
      "address",
      "pincode",
      "website_link",
      "about",
      "authorization_letter_url",
    ];
    const missingAfterMerge = requiredUpdateFields.filter((k) => {
      const v = updateData?.[k];
      return v === undefined || v === null || (typeof v === "string" && v.trim() === "");
    });
    if (missingAfterMerge.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingAfterMerge.join(", ")}`
      });
    }
    if (!/^\d{6}$/.test(String(updateData.pincode).trim())) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Enter valid 6-digit pincode"
      });
    }
    if (!/^https?:\/\//i.test(String(updateData.website_link).trim())) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Website link must start with http:// or https://"
      });
    }
    const authLetterUrl = String(updateData.authorization_letter_url).trim();
    if (!/\.pdf($|\?|#)/i.test(authLetterUrl)) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Authorization letter must be a PDF file",
      });
    }

    // Prepare user updates
    const userUpdates = {};
    if (req.body.phone) userUpdates.phone = req.body.phone;
    if (req.body.email) userUpdates.email = req.body.email;

    // Execute updates in parallel
    const updateStart = Date.now();
    const promises = [
      universityDetail.update(updateData, { transaction })
    ];

    if (Object.keys(userUpdates).length > 0) {
      promises.push(user.update(userUpdates, { transaction }));
    }

    // Handle courses update
    if (Array.isArray(req.body.course_ids)) {
      promises.push(universityDetail.setCourses(req.body.course_ids, { transaction }));
    }

    await Promise.all(promises);
    console.log(`All updates: ${Date.now() - updateStart}ms`);

    // Commit transaction
    const commitStart = Date.now();
    await transaction.commit();
    console.log(`Transaction commit: ${Date.now() - commitStart}ms`);

    // Return updated data from memory instead of fetching
    const responseData = {
      id: universityDetail.id,
      user_id: user_id,
      college_name: updateData.college_name,
      affiliated_university: updateData.affiliated_university,
      address: updateData.address,
      pincode: updateData.pincode,
      website_link: updateData.website_link,
      about: updateData.about,
      profile_pic: updateData.profile_pic,
      university_logo_url: updateData.university_logo_url,
      social_media_link: updateData.social_media_link,
      authorization_letter_url: updateData.authorization_letter_url,
      is_verified: updateData.is_verified ?? universityDetail.is_verified,
      email_id_verified: updateData.email_id_verified,
      aadhar_verified: updateData.aadhar_verified,
      phone_verified: updateData.phone_verified,
      email: userUpdates.email || user.email,
      phone: userUpdates.phone || user.phone,
      course_ids: req.body.course_ids || []
    };

    console.log(`Total time: ${Date.now() - startTime}ms`);

    return res.status(200).json({
      success: true,
      message: 'University profile updated successfully',
      data: responseData
    });

  } catch (error) {
    const rollbackStart = Date.now();
    if (!transaction.finished) {
      await transaction.rollback();
    }
    console.log(`Transaction rollback: ${Date.now() - rollbackStart}ms`);
    console.error(`Error after ${Date.now() - startTime}ms:`, error);
    
    return res.status(500).json({
      success: false,
      message: 'Failed to update university profile',
    });
  }
};


module.exports = {
  createUniversityDetail,
  updateUniversityDetail,
  getUniversityDetailById,
  universityprofile
};

