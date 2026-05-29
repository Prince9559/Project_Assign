const {
  Experience,
  UserDetail,
  User,
  JobRole,
  CompanyRecruiterProfile,
  AccessScope,
} = require("../models");
const { Op } = require("sequelize");
const { sendEmail } = require("../services/emailService");

const currentYear = () => new Date().getFullYear();
const getYearFromDate = (dateValue) => {
  if (!dateValue) return null;
  const d = new Date(dateValue);
  return Number.isNaN(d.getTime()) ? null : d.getFullYear();
};

const isCompanyUser = (req) => req.user?.role === "COMPANY";
const isStudentUser = (req) => req.user?.role === "STUDENT";

const getCompanyProfileId = async (req) => {
  const scope = await AccessScope.findOne({
    where: {
      id: req.user.scopeId,
      scope_type: "COMPANY",
    },
    attributes: ["scope_id"],
  });
  if (scope?.scope_id) return scope.scope_id;

  const fallback = await CompanyRecruiterProfile.findOne({
    where: { user_id: req.user.id },
    attributes: ["id"],
  });
  return fallback?.id || null;
};

const mapEmployeeRow = (exp) => {
  const firstName = exp.UserDetail?.first_name || "";
  const lastName = exp.UserDetail?.last_name || "";
  const endYear = getYearFromDate(exp.end_date);
  return {
    id: exp.id,
    employee_name: `${firstName} ${lastName}`.trim() || "Unknown Employee",
    employee_email: exp.UserDetail?.email || exp.UserDetail?.User?.email || null,
    role: exp.jobRole?.title || "N/A",
    start_year: getYearFromDate(exp.start_date),
    end_year: endYear,
    status:
      endYear === null || endYear >= currentYear()
        ? "Current Employee"
        : "Past Employee",
    approval_status: exp.approval_status,
    removed_by_company: exp.removed_by_company,
    removal_reason: exp.removal_reason,
    proof_document: exp.proof_document,
    reapproval_requested: exp.reapproval_requested,
  };
};

exports.getCompanyEmployees = async (req, res) => {
  try {
    if (!isCompanyUser(req)) {
      return res
        .status(403)
        .json({ success: false, message: "Only company users are allowed." });
    }

    const companyProfileId = await getCompanyProfileId(req);
    if (!companyProfileId) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
      });
    }

    const rows = await Experience.findAll({
      where: {
        [Op.or]: [
          { company_id: companyProfileId },
          { company_recruiter_profile_id: companyProfileId },
        ],
      },
      include: [
        {
          model: UserDetail,
          as: "UserDetail",
          attributes: ["id", "first_name", "last_name", "email"],
          include: [{ model: User, attributes: ["id", "email"] }],
        },
        {
          model: JobRole,
          as: "jobRole",
          attributes: ["id", "title"],
          required: false,
        },
      ],
      order: [["updated_at", "DESC"]],
    });

    return res.json({
      success: true,
      data: rows.map(mapEmployeeRow),
      debug: { companyProfileId, found: rows.length, userScopeId: req.user?.scopeId || null },
    });
  } catch (error) {
    console.error("getCompanyEmployees error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch employees." });
  }
};

exports.removeEmployee = async (req, res) => {
  try {
    if (!isCompanyUser(req)) {
      return res
        .status(403)
        .json({ success: false, message: "Only company users are allowed." });
    }

    const { experience_id, removal_reason } = req.body;
    if (!experience_id || !String(removal_reason || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "experience_id and removal_reason are required.",
      });
    }

    const companyProfileId = await getCompanyProfileId(req);
    const experience = await Experience.findOne({
      where: {
        id: experience_id,
        [Op.or]: [
          { company_id: companyProfileId },
          { company_recruiter_profile_id: companyProfileId },
        ],
      },
      include: [
        {
          model: UserDetail,
          as: "UserDetail",
          attributes: ["email"],
          include: [{ model: User, attributes: ["email"] }],
        },
      ],
    });
    if (!experience) {
      return res
        .status(404)
        .json({ success: false, message: "Experience record not found." });
    }

    await experience.update({
      approval_status: "rejected",
      removed_by_company: true,
      removal_reason: String(removal_reason).trim(),
      reapproval_requested: false,
      approved_by_company_id: companyProfileId,
    });

    const userEmail = experience.UserDetail?.email || experience.UserDetail?.User?.email;
    if (userEmail) {
      await sendEmail({
        to: userEmail,
        subject: "Experience Rejected by Company",
        html: "<p>Your experience entry has been rejected by company.</p>",
      }).catch(() => null);
    }

    return res.json({
      success: true,
      message: "Employee experience has been rejected.",
    });
  } catch (error) {
    console.error("removeEmployee error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to remove employee." });
  }
};

exports.uploadExperienceProof = async (req, res) => {
  try {
    if (!isStudentUser(req)) {
      return res
        .status(403)
        .json({ success: false, message: "Only students are allowed." });
    }
    const { experience_id } = req.body;
    if (!experience_id) {
      return res
        .status(400)
        .json({ success: false, message: "experience_id is required." });
    }

    const userDetail = await UserDetail.findOne({
      where: { user_id: req.user.id },
      attributes: ["id"],
    });
    if (!userDetail) {
      return res
        .status(404)
        .json({ success: false, message: "Student detail not found." });
    }

    const experience = await Experience.findOne({
      where: { id: experience_id, user_detail_id: userDetail.id },
      include: [
        {
          model: CompanyRecruiterProfile,
          as: "companyRecruiterProfile",
          include: [{ model: User, as: "user", attributes: ["email"] }],
          required: false,
        },
      ],
    });
    if (!experience) {
      return res
        .status(404)
        .json({ success: false, message: "Experience record not found." });
    }

    const file = req.file;
    const relativePath = file ? file.path.replace(/\\/g, "/") : null;
    const proofPath = relativePath || experience.proof_document;
    if (!proofPath) {
      return res.status(400).json({
        success: false,
        message: "Please upload a proof document first.",
      });
    }

    await experience.update({
      proof_document: proofPath,
      approval_status: "pending",
      reapproval_requested: true,
    });

    let companyEmail = experience.companyRecruiterProfile?.user?.email || null;
    if (!companyEmail && experience.company_id) {
      const company = await CompanyRecruiterProfile.findByPk(experience.company_id, {
        include: [{ model: User, as: "user", attributes: ["email"] }],
      });
      companyEmail = company?.user?.email || null;
    }
    if (companyEmail) {
      await sendEmail({
        to: companyEmail,
        subject: "Employee Re-Approval Requested",
        html: "<p>An employee uploaded proof and requested experience re-approval.</p>",
      }).catch(() => null);
    }

    return res.json({
      success: true,
      message: "Proof uploaded and re-approval requested.",
      proof_document: proofPath,
    });
  } catch (error) {
    console.error("uploadExperienceProof error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to upload proof." });
  }
};

exports.getPendingApprovals = async (req, res) => {
  try {
    if (!isCompanyUser(req)) {
      return res
        .status(403)
        .json({ success: false, message: "Only company users are allowed." });
    }
    const companyProfileId = await getCompanyProfileId(req);
    const rows = await Experience.findAll({
      where: {
        [Op.or]: [
          { company_id: companyProfileId },
          { company_recruiter_profile_id: companyProfileId },
        ],
        approval_status: "pending",
        reapproval_requested: true,
      },
      include: [
        {
          model: UserDetail,
          as: "UserDetail",
          attributes: ["first_name", "last_name", "email"],
        },
        { model: JobRole, as: "jobRole", attributes: ["id", "title"], required: false },
      ],
      order: [["updated_at", "DESC"]],
    });
    return res.json({
      success: true,
      data: rows.map(mapEmployeeRow),
      debug: { companyProfileId, found: rows.length },
    });
  } catch (error) {
    console.error("getPendingApprovals error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending approvals.",
    });
  }
};

exports.approveEmployee = async (req, res) => {
  try {
    if (!isCompanyUser(req)) {
      return res
        .status(403)
        .json({ success: false, message: "Only company users are allowed." });
    }
    const { experience_id } = req.body;
    const companyProfileId = await getCompanyProfileId(req);
    const experience = await Experience.findOne({
      where: {
        id: experience_id,
        [Op.or]: [
          { company_id: companyProfileId },
          { company_recruiter_profile_id: companyProfileId },
        ],
      },
      include: [{ model: UserDetail, as: "UserDetail", attributes: ["email"] }],
    });
    if (!experience) {
      return res
        .status(404)
        .json({ success: false, message: "Experience record not found." });
    }

    await experience.update({
      approval_status: "approved",
      removed_by_company: false,
      reapproval_requested: false,
      removal_reason: null,
      approved_by_company_id: companyProfileId,
    });

    if (experience.UserDetail?.email) {
      await sendEmail({
        to: experience.UserDetail.email,
        subject: "Experience Approved",
        html: "<p>Your experience entry has been approved by company.</p>",
      }).catch(() => null);
    }

    return res.json({ success: true, message: "Employee experience approved." });
  } catch (error) {
    console.error("approveEmployee error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to approve employee." });
  }
};

exports.rejectEmployee = async (req, res) => {
  try {
    if (!isCompanyUser(req)) {
      return res
        .status(403)
        .json({ success: false, message: "Only company users are allowed." });
    }
    const { experience_id, removal_reason } = req.body;
    const companyProfileId = await getCompanyProfileId(req);
    const experience = await Experience.findOne({
      where: {
        id: experience_id,
        [Op.or]: [
          { company_id: companyProfileId },
          { company_recruiter_profile_id: companyProfileId },
        ],
      },
      include: [{ model: UserDetail, as: "UserDetail", attributes: ["email"] }],
    });
    if (!experience) {
      return res
        .status(404)
        .json({ success: false, message: "Experience record not found." });
    }

    await experience.update({
      approval_status: "rejected",
      removed_by_company: true,
      reapproval_requested: false,
      removal_reason:
        removal_reason || experience.removal_reason || "Rejected by company",
      approved_by_company_id: companyProfileId,
    });

    if (experience.UserDetail?.email) {
      await sendEmail({
        to: experience.UserDetail.email,
        subject: "Experience Rejected",
        html: "<p>Your experience entry has been rejected by company.</p>",
      }).catch(() => null);
    }

    return res.json({ success: true, message: "Employee experience rejected." });
  } catch (error) {
    console.error("rejectEmployee error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to reject employee." });
  }
};
