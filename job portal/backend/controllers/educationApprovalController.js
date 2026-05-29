const {
  Education,
  UserDetail,
  User,
  Course,
  UniversityDetail,
  SchoolCollege,
} = require("../models");
const { sendEmail } = require("../services/emailService");

const currentYear = () => new Date().getFullYear();
const getYearFromDate = (dateValue) => {
  if (!dateValue) return null;
  const str = String(dateValue);
  const year = Number(str.slice(0, 4));
  return Number.isFinite(year) ? year : null;
};

const getUniversityCollegeId = async (userId) => {
  const detail = await UniversityDetail.findOne({
    where: { user_id: userId },
    attributes: ["school_college_id"],
  });
  return detail?.school_college_id || null;
};

const mapStudentRow = (education) => {
  const firstName = education.userDetail?.first_name || education.userDetail?.user?.first_name || "";
  const lastName = education.userDetail?.last_name || education.userDetail?.user?.last_name || "";
  const endYear = getYearFromDate(education.end_date);
  return {
    id: education.id,
    student_name: `${firstName} ${lastName}`.trim() || "Unknown Student",
    student_email: education.userDetail?.email || education.userDetail?.user?.email || null,
    course: education.educationCourse?.name || education.other_course_name || "N/A",
    start_year: getYearFromDate(education.start_date),
    end_year: endYear,
    status: endYear !== null && endYear < currentYear() ? "Alumni" : "Current Student",
    approval_status: education.approval_status,
    removed_by_university: education.removed_by_university,
    removal_reason: education.removal_reason,
    proof_document: education.proof_document,
    reapproval_requested: education.reapproval_requested,
  };
};

exports.getUniversityStudents = async (req, res) => {
  try {
    if (req.user?.role !== "UNIVERSITY") {
      return res.status(403).json({ success: false, message: "Only university users are allowed." });
    }

    const collegeId = await getUniversityCollegeId(req.user.id);
    if (!collegeId) {
      return res.status(404).json({ success: false, message: "University profile is not linked to any college." });
    }

    const rows = await Education.findAll({
      where: { school_college_id: collegeId },
      include: [
        { model: Course, as: "educationCourse", attributes: ["id", "name"] },
        {
          model: UserDetail,
          as: "userDetail",
          attributes: ["id", "first_name", "last_name", "email"],
          include: [{ model: User, attributes: ["id", "email"] }],
        },
      ],
      order: [["updated_at", "DESC"]],
    });

    return res.json({ success: true, data: rows.map(mapStudentRow) });
  } catch (error) {
    console.error("getUniversityStudents error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch students." });
  }
};

exports.removeStudentEducation = async (req, res) => {
  try {
    if (req.user?.role !== "UNIVERSITY") {
      return res.status(403).json({ success: false, message: "Only university users are allowed." });
    }
    const { education_id, removal_reason } = req.body;
    if (!education_id || !removal_reason || !String(removal_reason).trim()) {
      return res.status(400).json({ success: false, message: "education_id and removal_reason are required." });
    }

    const collegeId = await getUniversityCollegeId(req.user.id);
    const education = await Education.findOne({
      where: { id: education_id, school_college_id: collegeId },
      include: [{ model: UserDetail, as: "userDetail", include: [{ model: User, attributes: ["email"] }] }],
    });
    if (!education) return res.status(404).json({ success: false, message: "Education record not found." });

    await education.update({
      approval_status: "rejected",
      removed_by_university: true,
      removal_reason: String(removal_reason).trim(),
      reapproval_requested: false,
      approved_by_university_id: req.user.id,
    });

    const studentEmail = education.userDetail?.email || education.userDetail?.user?.email;
    if (studentEmail) {
      await sendEmail({
        to: studentEmail,
        subject: "Education Entry Rejected",
        html: "<p>Your education entry has been rejected by the university.</p>",
      }).catch(() => null);
    }

    return res.json({ success: true, message: "Student education has been rejected." });
  } catch (error) {
    console.error("removeStudentEducation error:", error);
    return res.status(500).json({ success: false, message: "Failed to remove student." });
  }
};

exports.uploadEducationProof = async (req, res) => {
  try {
    if (req.user?.role !== "STUDENT") {
      return res.status(403).json({ success: false, message: "Only students are allowed." });
    }
    const { education_id } = req.body;
    if (!education_id) return res.status(400).json({ success: false, message: "education_id is required." });

    const userDetail = await UserDetail.findOne({ where: { user_id: req.user.id }, attributes: ["id"] });
    if (!userDetail) return res.status(404).json({ success: false, message: "Student detail not found." });

    const education = await Education.findOne({
      where: { id: education_id, user_detail_id: userDetail.id },
      include: [{ model: SchoolCollege, as: "schoolCollegeEducations", attributes: ["name"] }],
    });
    if (!education) return res.status(404).json({ success: false, message: "Education record not found." });

    const file = req.file;
    const relativePath = file ? file.path.replace(/\\/g, "/") : null;
    const proofPath = relativePath || education.proof_document;
    if (!proofPath) {
      return res.status(400).json({ success: false, message: "Please upload a proof document first." });
    }

    await education.update({
      proof_document: proofPath,
      approval_status: "pending",
      reapproval_requested: true,
    });

    const university = await UniversityDetail.findOne({
      where: { school_college_id: education.school_college_id },
      include: [{ model: User, attributes: ["email"] }],
    });
    const universityEmail = university?.User?.email;
    if (universityEmail) {
      await sendEmail({
        to: universityEmail,
        subject: "Student Re-Approval Requested",
        html: "<p>A student uploaded proof and requested education re-approval.</p>",
      }).catch(() => null);
    }

    return res.json({ success: true, message: "Proof uploaded and re-approval requested.", proof_document: proofPath });
  } catch (error) {
    console.error("uploadEducationProof error:", error);
    return res.status(500).json({ success: false, message: "Failed to upload proof." });
  }
};

exports.getPendingApprovals = async (req, res) => {
  try {
    if (req.user?.role !== "UNIVERSITY") {
      return res.status(403).json({ success: false, message: "Only university users are allowed." });
    }
    const collegeId = await getUniversityCollegeId(req.user.id);
    const rows = await Education.findAll({
      where: {
        school_college_id: collegeId,
        approval_status: "pending",
        reapproval_requested: true,
      },
      include: [
        { model: Course, as: "educationCourse", attributes: ["name"] },
        {
          model: UserDetail,
          as: "userDetail",
          attributes: ["first_name", "last_name", "email"],
        },
      ],
      order: [["updated_at", "DESC"]],
    });
    return res.json({ success: true, data: rows.map(mapStudentRow) });
  } catch (error) {
    console.error("getPendingApprovals error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch pending approvals." });
  }
};

exports.approveStudent = async (req, res) => {
  try {
    if (req.user?.role !== "UNIVERSITY") {
      return res.status(403).json({ success: false, message: "Only university users are allowed." });
    }
    const { education_id } = req.body;
    const collegeId = await getUniversityCollegeId(req.user.id);
    const education = await Education.findOne({
      where: { id: education_id, school_college_id: collegeId },
      include: [{ model: UserDetail, as: "userDetail", attributes: ["email"] }],
    });
    if (!education) return res.status(404).json({ success: false, message: "Education record not found." });

    await education.update({
      approval_status: "approved",
      removed_by_university: false,
      reapproval_requested: false,
      removal_reason: null,
      approved_by_university_id: req.user.id,
    });

    if (education.userDetail?.email) {
      await sendEmail({
        to: education.userDetail.email,
        subject: "Education Approved",
        html: "<p>Your education entry has been approved by the university.</p>",
      }).catch(() => null);
    }

    return res.json({ success: true, message: "Student education approved." });
  } catch (error) {
    console.error("approveStudent error:", error);
    return res.status(500).json({ success: false, message: "Failed to approve student." });
  }
};

exports.rejectStudent = async (req, res) => {
  try {
    if (req.user?.role !== "UNIVERSITY") {
      return res.status(403).json({ success: false, message: "Only university users are allowed." });
    }
    const { education_id, removal_reason } = req.body;
    const collegeId = await getUniversityCollegeId(req.user.id);
    const education = await Education.findOne({
      where: { id: education_id, school_college_id: collegeId },
      include: [{ model: UserDetail, as: "userDetail", attributes: ["email"] }],
    });
    if (!education) return res.status(404).json({ success: false, message: "Education record not found." });

    await education.update({
      approval_status: "rejected",
      removed_by_university: true,
      reapproval_requested: false,
      removal_reason: removal_reason || education.removal_reason || "Rejected by university",
      approved_by_university_id: req.user.id,
    });

    if (education.userDetail?.email) {
      await sendEmail({
        to: education.userDetail.email,
        subject: "Education Rejected",
        html: "<p>Your education entry has been rejected by the university.</p>",
      }).catch(() => null);
    }

    return res.json({ success: true, message: "Student education rejected." });
  } catch (error) {
    console.error("rejectStudent error:", error);
    return res.status(500).json({ success: false, message: "Failed to reject student." });
  }
};

exports.getStudentEducations = async (req, res) => {
  try {
    if (req.user?.role !== "STUDENT") {
      return res.status(403).json({ success: false, message: "Only students are allowed." });
    }
    const userDetail = await UserDetail.findOne({ where: { user_id: req.user.id }, attributes: ["id"] });
    if (!userDetail) return res.status(404).json({ success: false, message: "Student detail not found." });

    const rows = await Education.findAll({
      where: { user_detail_id: userDetail.id },
      include: [{ model: Course, as: "educationCourse", attributes: ["name"] }],
      order: [["created_at", "DESC"]],
    });
    return res.json({ success: true, data: rows });
  } catch (error) {
    console.error("getStudentEducations error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch student educations." });
  }
};
