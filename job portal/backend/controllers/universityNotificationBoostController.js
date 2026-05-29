const { Op, QueryTypes } = require("sequelize");
const nodemailer = require("nodemailer");
const { razorpay } = require("../config/razorpay");
const NotificationService = require("../services/notificationService");
const {
  sequelize,
  UniversityDetail,
  Course,
  Industry,
  CompanyRecruiterProfile,
  User,
  UniversityNotificationCredit,
  UniversityNotificationRequest,
  UniversityNotificationCourse,
  UniversityNotificationLog,
  UniversityNotificationPayment,
} = require("../models");

const DEFAULT_CREDITS = 1000;
const GST_RATE = 0.18;

function isMissingMappingTableError(err) {
  const code = err?.original?.code || err?.parent?.code || err?.code;
  if (code === "ER_NO_SUCH_TABLE") return true;
  const msg = String(err?.message || err?.original?.sqlMessage || "");
  return /company_industries/i.test(msg) && /doesn't exist|Unknown table/i.test(msg);
}

/** Coerce react-select / string values to positive integer industry ids */
function normalizeIndustryIds(raw) {
  if (raw == null) return [];
  const arr = Array.isArray(raw) ? raw : [raw];
  const out = [];
  for (const x of arr) {
    const n =
      typeof x === "object" && x !== null && "id" in x
        ? Number(x.id)
        : typeof x === "object" && x !== null && "value" in x
        ? Number(x.value)
        : Number(x);
    if (Number.isFinite(n) && n > 0) out.push(Math.floor(n));
  }
  return [...new Set(out)];
}

const CREDIT_PACKS = [
  { credits: 500, base_inr: 4999 },
  { credits: 1000, base_inr: 8999 },
  { credits: 5000, base_inr: 39999 },
];

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function assertUniversity(req, res) {
  if (req.user?.role !== "UNIVERSITY") {
    res.status(403).json({ error: "University access only" });
    return false;
  }
  return true;
}

async function getUniversityFromReq(req) {
  return UniversityDetail.findOne({
    where: { user_id: req.user.id },
    attributes: ["id", "college_name"],
  });
}

async function ensureNotificationCredits(universityId, transaction) {
  const opts = { where: { university_id: universityId } };
  if (transaction) opts.transaction = transaction;
  let row = await UniversityNotificationCredit.findOne(opts);
  if (!row) {
    row = await UniversityNotificationCredit.create(
      {
        university_id: universityId,
        total_credits: DEFAULT_CREDITS,
        used_credits: 0,
        remaining_credits: DEFAULT_CREDITS,
      },
      transaction ? { transaction } : {}
    );
  }
  return row;
}

function formatCoursesSummary(courseRows, collegeName) {
  if (!courseRows?.length) return `${collegeName} is inviting applications.`;
  const parts = courseRows.map((r) => {
    let s = r.course_name || "Course";
    if (r.is_hiring) s += " (hiring)";
    if (r.start_date) s += ` — starts ${r.start_date}`;
    if (r.intake != null) s += ` — intake ${r.intake}`;
    return s;
  });
  return parts.join("; ");
}

/**
 * Active company profiles that can receive notifications.
 * Matches primary industry on company_recruiter_profiles OR optional company_industries mapping.
 * Does NOT require admin verification (is_verified) so real-world data still matches.
 */
async function countEligibleCompanies(industryIds) {
  const ids = normalizeIndustryIds(industryIds);
  if (!ids.length) return 0;

  try {
    const [row] = await sequelize.query(
      `SELECT COUNT(DISTINCT crp.id) AS c
       FROM company_recruiter_profiles crp
       WHERE crp.status = 1
         AND crp.user_id IS NOT NULL
         AND (
           crp.industry_id IN (:inds)
           OR EXISTS (
             SELECT 1 FROM company_industries ci
             WHERE ci.company_id = crp.id AND ci.industry_id IN (:inds)
           )
         )`,
      { replacements: { inds: ids }, type: QueryTypes.SELECT }
    );
    return Number(row?.c || 0);
  } catch (err) {
    if (isMissingMappingTableError(err)) {
      return CompanyRecruiterProfile.count({
        where: {
          industry_id: { [Op.in]: ids },
          status: 1,
          user_id: { [Op.ne]: null },
        },
      });
    }
    throw err;
  }
}

async function pickRandomCompanies(industryIds, limit) {
  const ids = normalizeIndustryIds(industryIds);
  if (!ids.length || limit <= 0) return [];

  try {
    return sequelize.query(
      `SELECT id, company_name, user_id FROM (
         SELECT crp.id AS id, crp.company_name AS company_name, crp.user_id AS user_id
         FROM company_recruiter_profiles crp
         WHERE crp.status = 1
           AND crp.user_id IS NOT NULL
           AND (
             crp.industry_id IN (:inds)
             OR EXISTS (
               SELECT 1 FROM company_industries ci
               WHERE ci.company_id = crp.id AND ci.industry_id IN (:inds)
             )
           )
       ) t
       ORDER BY RAND()
       LIMIT :lim`,
      { replacements: { inds: ids, lim: limit }, type: QueryTypes.SELECT }
    );
  } catch (err) {
    if (isMissingMappingTableError(err)) {
      return sequelize.query(
        `SELECT id AS id, company_name AS company_name, user_id AS user_id
         FROM company_recruiter_profiles
         WHERE status = 1
           AND user_id IS NOT NULL
           AND industry_id IN (:inds)
         ORDER BY RAND()
         LIMIT :lim`,
        { replacements: { inds: ids, lim: limit }, type: QueryTypes.SELECT }
      );
    }
    throw err;
  }
}

async function processBoostRequest(requestId) {
  let request;
  try {
    request = await UniversityNotificationRequest.findByPk(requestId);
    if (!request || request.status !== "pending") return;

    const university = await UniversityDetail.findByPk(request.university_id, {
      attributes: ["id", "college_name"],
    });
    if (!university) {
      await request.update({
        status: "failed",
        error_message: "University not found",
      });
      return;
    }

    await request.update({
      status: "processing",
      progress: {
        total: 0,
        notifications_sent: 0,
        emails_sent: 0,
        failed: 0,
      },
    });

    const industryIds = normalizeIndustryIds(request.industries || []);
    console.log("[notification-boost] processBoostRequest industries:", industryIds);

    const creditRow = await ensureNotificationCredits(request.university_id);
    const poolCount = await countEligibleCompanies(industryIds);
    console.log("[notification-boost] processBoostRequest poolCount:", poolCount);
    const sendLimit = Math.min(creditRow.remaining_credits, poolCount);

    if (sendLimit <= 0) {
      await request.update({
        status: "completed",
        companies_targeted: 0,
        credits_used: 0,
        progress: {
          total: 0,
          notifications_sent: 0,
          emails_sent: 0,
          failed: 0,
        },
      });
      return;
    }

    const companies = await pickRandomCompanies(industryIds, sendLimit);
    const courseRows = await UniversityNotificationCourse.findAll({
      where: { request_id: requestId },
    });

    const summary = formatCoursesSummary(
      courseRows.map((c) => c.toJSON()),
      university.college_name
    );
    const actionPath = `/recruiter/campus-hiring/create-job?university_id=${university.id}`;

    let notificationsSent = 0;
    let emailsSent = 0;
    let failed = 0;

    for (const co of companies) {
      const log = await UniversityNotificationLog.create({
        request_id: requestId,
        company_id: co.id,
        status: "processing",
      });

      try {
        await NotificationService.send(co.user_id, "COMPANY", "campus_hiring_open", {
          title: "Campus Hiring Open",
          body: `${university.college_name} — ${summary}${
            request.message ? ` — ${request.message}` : ""
          }`,
          actionUrl: actionPath,
          universityName: university.college_name,
          universityId: university.id,
          coursesSummary: summary,
        });
        notificationsSent += 1;
        await log.update({
          notification_sent: true,
          status: "notified",
        });
      } catch (e) {
        console.error("Notification boost in-app error:", e);
        failed += 1;
        await log.update({ status: "notification_failed" });
      }

      try {
        const user = await User.findByPk(co.user_id, {
          attributes: ["email", "first_name"],
        });
        if (user?.email && process.env.EMAIL_USER) {
          await transporter.sendMail({
            from: `"Job Portal" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: `Campus Hiring Open — ${university.college_name}`,
            html: `
              <h2>Campus Hiring Open</h2>
              <p>Hello ${user.first_name || "there"},</p>
              <p><strong>${university.college_name}</strong> shared hiring information with you.</p>
              <p><strong>Courses / details:</strong> ${summary}</p>
              ${
                request.message
                  ? `<p><strong>Message:</strong> ${request.message}</p>`
                  : ""
              }
              <p><a href="${process.env.FRONTEND_URL || "http://localhost:5173"}${actionPath}">Campus Hiring — post a job</a></p>
            `,
          });
          emailsSent += 1;
          await log.update({
            email_sent: true,
            status: log.status === "notified" ? "completed" : "email_only",
          });
        }
      } catch (e) {
        console.error("Notification boost email error:", e);
      }
    }

    const creditsUsed = notificationsSent;
    await sequelize.query(
      `UPDATE university_notification_credits
       SET used_credits = used_credits + :u,
           remaining_credits = remaining_credits - :u,
           updated_at = NOW()
       WHERE university_id = :univId`,
      { replacements: { u: creditsUsed, univId: request.university_id } }
    );

    await request.update({
      status: "completed",
      companies_targeted: companies.length,
      credits_used: creditsUsed,
      progress: {
        total: companies.length,
        notifications_sent: notificationsSent,
        emails_sent: emailsSent,
        failed,
        success_percent:
          companies.length > 0
            ? Math.round((notificationsSent / companies.length) * 100)
            : 0,
      },
    });
  } catch (err) {
    console.error("processBoostRequest:", err);
    if (request) {
      await request.update({
        status: "failed",
        error_message: err.message || "Processing failed",
      });
    }
  }
}

exports.getCreditPacks = async (req, res) => {
  if (!assertUniversity(req, res)) return;
  return res.json({
    packs: CREDIT_PACKS.map((p) => {
      const tax = parseFloat((p.base_inr * GST_RATE).toFixed(2));
      const total = parseFloat((p.base_inr + tax).toFixed(2));
      return {
        credits: p.credits,
        base_amount: p.base_inr,
        tax_amount: tax,
        total_amount: total,
      };
    }),
    gst_percent: GST_RATE * 100,
  });
};

exports.getCredits = async (req, res) => {
  try {
    if (!assertUniversity(req, res)) return;
    const university = await getUniversityFromReq(req);
    if (!university) {
      return res.status(404).json({ error: "University profile not found" });
    }
    const row = await ensureNotificationCredits(university.id);
    return res.json({
      total_credits: row.total_credits,
      used_credits: row.used_credits,
      remaining_credits: row.remaining_credits,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to load credits" });
  }
};

exports.getFormOptions = async (req, res) => {
  try {
    if (!assertUniversity(req, res)) return;
    const university = await UniversityDetail.findOne({
      where: { user_id: req.user.id },
      include: [
        {
          model: Course,
          as: "courses",
          attributes: ["id", "name"],
          through: { attributes: [] },
          required: false,
        },
      ],
    });
    if (!university) {
      return res.status(404).json({ error: "University profile not found" });
    }

    const fromM2m =
      university.courses?.map((c) => ({ id: c.id, name: c.name })) || [];

    let fromUniversityCourses = [];
    try {
      fromUniversityCourses = await sequelize.query(
        `SELECT c.id AS id, c.name AS name
         FROM university_courses uc
         INNER JOIN courses c ON c.id = uc.course_id
         WHERE uc.university_id = :uid
           AND (uc.is_active IS NULL OR uc.is_active = 1)`,
        {
          replacements: { uid: university.id },
          type: QueryTypes.SELECT,
        }
      );
    } catch (sqlErr) {
      console.warn("getFormOptions university_courses query:", sqlErr.message);
    }

    const byId = new Map();
    for (const row of [...fromM2m, ...fromUniversityCourses]) {
      if (row && row.id != null) {
        byId.set(Number(row.id), {
          id: Number(row.id),
          name: row.name,
        });
      }
    }
    const courses = [...byId.values()].sort((a, b) =>
      String(a.name).localeCompare(String(b.name), undefined, {
        sensitivity: "base",
      })
    );

    const industries = await Industry.findAll({
      where: { status: 1 },
      attributes: ["id", "name"],
      order: [["name", "ASC"]],
    });
    return res.json({ courses, industries });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to load form options" });
  }
};

exports.previewBoost = async (req, res) => {
  try {
    if (!assertUniversity(req, res)) return;
    const industry_ids = normalizeIndustryIds(req.body?.industry_ids);
    if (!industry_ids.length) {
      return res.status(400).json({
        success: false,
        message: "No industries selected",
      });
    }
    console.log("[notification-boost] preview industries:", industry_ids);

    const university = await getUniversityFromReq(req);
    if (!university) {
      return res.status(404).json({ error: "University profile not found" });
    }
    const creditRow = await ensureNotificationCredits(university.id);
    const poolCount = await countEligibleCompanies(industry_ids);
    console.log("[notification-boost] preview companies found:", poolCount);

    const companiesToTarget = Math.min(poolCount, creditRow.remaining_credits);
    const creditsToUse = companiesToTarget;

    // Provide a small sample of matched companies to help debug why pool may be zero
    let sampleCompanies = [];
    try {
      const sample = await pickRandomCompanies(
        industry_ids,
        Math.min(10, Math.max(poolCount, 0))
      );
      sampleCompanies = sample.map((s) => ({
        id: s.id,
        company_name: s.company_name,
        user_id: s.user_id,
      }));
    } catch (err) {
      console.warn("previewBoost: could not fetch sample companies", err.message || err);
    }

    return res.json({
      success: true,
      pool_count: poolCount,
      remaining_credits: creditRow.remaining_credits,
      companies_to_target: companiesToTarget,
      credits_to_use: creditsToUse,
      sample_companies: sampleCompanies,
      companies: sampleCompanies,
      message:
        poolCount === 0
          ? "No companies found for selected industries"
          : undefined,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Preview failed" });
  }
};

exports.submitBoost = async (req, res) => {
  try {
    if (!assertUniversity(req, res)) return;
    const { course_rows = [], message = "" } = req.body;
    const industry_ids = normalizeIndustryIds(req.body?.industry_ids);

    if (!Array.isArray(course_rows) || course_rows.length === 0) {
      return res.status(400).json({ error: "Add at least one course row" });
    }
    if (!industry_ids.length) {
      return res.status(400).json({
        success: false,
        message: "No industries selected",
      });
    }

    const university = await getUniversityFromReq(req);
    if (!university) {
      return res.status(404).json({ error: "University profile not found" });
    }

    const creditRow = await ensureNotificationCredits(university.id);
    const poolCount = await countEligibleCompanies(industry_ids);
    console.log("[notification-boost] submit industries:", industry_ids, "poolCount:", poolCount);

    if (creditRow.remaining_credits <= 0) {
      return res.status(400).json({
        success: false,
        message: "No notification credits remaining",
      });
    }

    if (poolCount <= 0) {
      return res.status(400).json({
        success: false,
        message: "No companies found for selected industries",
        companies: [],
      });
    }

    const sendLimit = Math.min(poolCount, creditRow.remaining_credits);

    const industries = await Industry.findAll({
      where: { id: { [Op.in]: industry_ids } },
      attributes: ["id", "name"],
    });
    const industriesSnap = industries.map((i) => ({
      id: i.id,
      name: i.name,
    }));

    const resolvedRows = [];
    for (const row of course_rows) {
      const courseId = row.course_id || row.courseId;
      let courseName = row.course_name || row.courseName || "";
      if (courseId && !courseName) {
        const c = await Course.findByPk(courseId, { attributes: ["name"] });
        courseName = c?.name || `Course #${courseId}`;
      }
      if (!courseName) {
        return res.status(400).json({ error: "Each row needs a course" });
      }
      resolvedRows.push({
        course_id: courseId || null,
        course_name: courseName,
        is_hiring: !!(row.is_hiring ?? row.isHiring),
        start_date: row.start_date || row.startDate || null,
        intake:
          row.intake != null && row.intake !== ""
            ? parseInt(row.intake, 10)
            : null,
      });
    }

    const coursesSnap = resolvedRows;

    const request = await UniversityNotificationRequest.create({
      university_id: university.id,
      courses: coursesSnap,
      industries: industriesSnap,
      message: message || null,
      companies_targeted: 0,
      credits_used: 0,
      status: "pending",
    });

    await UniversityNotificationCourse.bulkCreate(
      resolvedRows.map((r) => ({
        request_id: request.id,
        course_id: r.course_id,
        course_name: r.course_name,
        is_hiring: r.is_hiring,
        start_date: r.start_date,
        intake: r.intake,
      }))
    );

    setImmediate(() => {
      processBoostRequest(request.id).catch((err) =>
        console.error("Boost background error:", err)
      );
    });

    return res.status(202).json({
      success: true,
      request_id: request.id,
      message:
        "Notification boost queued. Status will update to completed shortly.",
      expected_companies: sendLimit,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to submit boost" });
  }
};

exports.getHistory = async (req, res) => {
  try {
    if (!assertUniversity(req, res)) return;
    const university = await getUniversityFromReq(req);
    if (!university) {
      return res.status(404).json({ error: "University profile not found" });
    }
    const rows = await UniversityNotificationRequest.findAll({
      where: { university_id: university.id },
      order: [["created_at", "DESC"]],
      limit: 100,
      attributes: [
        "id",
        "courses",
        "industries",
        "message",
        "companies_targeted",
        "credits_used",
        "status",
        "progress",
        "created_at",
      ],
    });
    return res.json(rows);
  } catch (e) {
    if (e?.original?.code === "ER_NO_SUCH_TABLE") {
      return res.json([]);
    }
    console.error(e);
    return res.status(500).json({ error: "Failed to load history" });
  }
};

exports.getRequestDetail = async (req, res) => {
  try {
    if (!assertUniversity(req, res)) return;
    const university = await getUniversityFromReq(req);
    if (!university) {
      return res.status(404).json({ error: "University profile not found" });
    }
    const request = await UniversityNotificationRequest.findOne({
      where: { id: req.params.id, university_id: university.id },
      include: [
        {
          model: UniversityNotificationCourse,
          as: "courseRows",
        },
      ],
    });
    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }
    const logs = await UniversityNotificationLog.findAll({
      where: { request_id: request.id },
      attributes: [
        "id",
        "company_id",
        "email_sent",
        "notification_sent",
        "status",
        "created_at",
      ],
    });
    return res.json({ request, logs });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Failed to load details" });
  }
};

exports.createBoostPaymentOrder = async (req, res) => {
  try {
    if (!assertUniversity(req, res)) return;
    const { credits } = req.body;
    const pack = CREDIT_PACKS.find((p) => p.credits === Number(credits));
    if (!pack) {
      return res.status(400).json({ error: "Invalid credit pack" });
    }
    const university = await getUniversityFromReq(req);
    if (!university) {
      return res.status(404).json({ error: "University profile not found" });
    }

    const baseAmount = pack.base_inr;
    const taxAmount = parseFloat((baseAmount * GST_RATE).toFixed(2));
    const totalAmount = parseFloat((baseAmount + taxAmount).toFixed(2));

    const paymentRow = await UniversityNotificationPayment.create({
      university_id: university.id,
      credits_added: pack.credits,
      amount: totalAmount,
      base_amount: baseAmount,
      tax_amount: taxAmount,
      status: "pending",
    });

    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `unobpay-${paymentRow.id}`,
      notes: {
        type: "university_notification_boost_payment",
        university_id: university.id,
        payment_row_id: paymentRow.id,
        credits: pack.credits,
      },
    });

    await paymentRow.update({ razorpay_order_id: rzpOrder.id });

    return res.json({
      success: true,
      razorpay_order_id: rzpOrder.id,
      amount: baseAmount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      credits: pack.credits,
      payment_id: paymentRow.id,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Could not create payment order" });
  }
};
