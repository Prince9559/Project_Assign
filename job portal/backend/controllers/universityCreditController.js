// controllers/universityCreditController.js
const {
  sequelize,
  UniversityCreditPackage,
  UniversityCreditOrder,
  UniversityCreditBatch,
  UniversityDetail,
  User,
  CompanyRecruiterProfile,
  JobPost,
  ContactUnlock,
  JobRole,
  CreditLog
} = require("../models");

const {
  getUniversityCredits,
  unlockContact,
} = require("../services/creditService");
const { razorpay } = require("../config/razorpay");

const DEFAULT_BROADCAST_CREDITS = 1000;

const ensureDefaultCredits = async (universityId) => {
  const current = await getUniversityCredits(universityId);
  if (current.remaining_credits > 0) return current;

  const existingGrant = await CreditLog.findOne({
    where: {
      university_id: universityId,
      reference_type: "default_broadcast_grant",
    },
  });
  if (existingGrant) return getUniversityCredits(universityId);

  const fallbackPackage = await UniversityCreditPackage.findOne({
    where: { is_active: true },
    order: [["display_order", "ASC"]],
  });
  if (!fallbackPackage) return current;

  return sequelize.transaction(async (t) => {
    const order = await UniversityCreditOrder.create(
      {
        university_id: universityId,
        package_id: fallbackPackage.package_id,
        credits_purchased: DEFAULT_BROADCAST_CREDITS,
        amount: 0,
        base_amount: 0,
        tax_amount: 0,
        total_amount: 0,
        tax_rate_percent: 0,
        validity_days: null,
        status: "paid",
        paid_at: new Date(),
        expires_at: null,
        razorpay_order_id: null,
      },
      { transaction: t }
    );

    await UniversityCreditBatch.create(
      {
        university_id: universityId,
        order_id: order.order_id,
        credits_added: DEFAULT_BROADCAST_CREDITS,
        credits_used: 0,
        expires_at: null,
      },
      { transaction: t }
    );

    await CreditLog.create(
      {
        university_id: universityId,
        action_type: "admin",
        credits_before: 0,
        credits_changed: DEFAULT_BROADCAST_CREDITS,
        credits_after: DEFAULT_BROADCAST_CREDITS,
        reference_type: "default_broadcast_grant",
        reference_id: order.order_id,
        description: "Initial 1000 broadcast credits granted by system",
      },
      { transaction: t }
    );

    return getUniversityCredits(universityId);
  });
};

//all apis are mounted on /api/university/ then the follwing
// GET /api/credit-packages
exports.getCreditPackages = async (req, res) => {
  try {
    const packages = await UniversityCreditPackage.findAll({
      where: { is_active: true },
      attributes: [
        "package_id",
        "name",
        "credits",
        "price_inr",
        "validity_days",
        "description",
        "tax_rate_percent",
        "display_order",
      ],
      order: [["display_order", "ASC"]],
    });

    // Enrich for frontend (no DB change needed)
    const enriched = packages.map((pkg) => {
      const taxRate = parseFloat(pkg.tax_rate_percent) || 18.0;
      const price = parseFloat(pkg.price_inr);
      const base = price / (1 + taxRate / 100);
      const tax = price - base;

      return {
        ...pkg.get({ plain: true }),
        price_formatted: `₹${Math.round(price).toLocaleString("en-IN")}`,
        base_amount: parseFloat(base.toFixed(2)),
        tax_amount: parseFloat(tax.toFixed(2)),
        // Optional: show validity as "30 days" or "Never"
        validity_display: pkg.validity_days
          ? `${pkg.validity_days} day${pkg.validity_days !== 1 ? "s" : ""}`
          : "Never",
      };
    });

    res.json(enriched);
  } catch (error) {
    console.error("Error fetching packages:", error);
    res.status(500).json({ error: "Failed to load packages" });
  }
};

// POST /api/credit-orders
exports.createCreditOrder = async (req, res) => {
  const { package_id } = req.body;

  // Authenticate & authorize
  if (!req.user || req.user.role !== "UNIVERSITY") {
    return res
      .status(403)
      .json({ error: "Unauthorized: UNIVERSITY role required" });
  }

  let university;
  try {
    university = await UniversityDetail.findOne({
      where: { user_id: req.user.id },
      attributes: ["id"],
    });
  } catch (err) {
    console.error("University lookup failed:", err);
    return res
      .status(500)
      .json({ error: "Failed to verify university profile" });
  }

  if (!university) {
    return res.status(404).json({ error: "University profile not found" });
  }

  const universityId = university.id;

  if (!package_id) {
    return res.status(400).json({ error: "package_id is required" });
  }

  const t = await sequelize.transaction();
  try {
    // 1. Fetch active package
    const pkg = await UniversityCreditPackage.findByPk(package_id, {
      where: { is_active: true },
      transaction: t,
    });

    if (!pkg) {
      await t.rollback();
      return res.status(404).json({ error: "Package not found or inactive" });
    }

    // 2. Validate required tax field
    if (pkg.tax_rate_percent == null || pkg.tax_rate_percent < 0) {
      await t.rollback();
      return res
        .status(500)
        .json({ error: "Invalid tax configuration for package" });
    }
    console.log("packahge", pkg);

    // 3. Compute tax breakdown

    const priceInr = parseFloat(pkg.price_inr);
    if (isNaN(priceInr) || priceInr < 0) {
      await t.rollback();
      return res.status(500).json({ error: "Invalid package price" });
    }

    const taxRate = parseFloat(pkg.tax_rate_percent) / 100; // also guard tax_rate_percent
    if (isNaN(taxRate) || taxRate < 0) {
      await t.rollback();
      return res.status(500).json({ error: "Invalid tax rate for package" });
    }

    // Now safe to compute:
    const baseAmount = parseFloat((priceInr / (1 + taxRate)).toFixed(2));
    const taxAmount = parseFloat((priceInr - baseAmount).toFixed(2));
    const totalAmount = parseFloat(priceInr.toFixed(2)); // now priceInr is a number → .toFixed works// ensure consistent precision

    // Sanity check: base + tax ≈ total (within rounding tolerance)
    if (Math.abs(baseAmount + taxAmount - totalAmount) > 0.02) {
      console.warn(`Minor rounding diff in tax calc for pkg ${package_id}:`, {
        baseAmount,
        taxAmount,
        totalAmount,
      });
    }

    // 4. Create order with tax-aware fields
    const order = await UniversityCreditOrder.create(
      {
        university_id: universityId,
        package_id: pkg.package_id,
        credits_purchased: pkg.credits,
        // Legacy field (optional, for backward compat)
        amount: totalAmount,
        // New explicit fields
        base_amount: baseAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        tax_rate_percent: pkg.tax_rate_percent,
        validity_days: pkg.validity_days,
        status: "created",
        expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 mins
      },
      { transaction: t }
    );

    // 5. Create Razorpay order (charge full total amount, incl. tax)
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // in paise (e.g., ₹118 → 11800)
      currency: "INR",
      receipt: `ucord-${order.order_id}`,
      notes: {
        university_id: universityId,
        order_id: order.order_id,
        package_id: pkg.package_id,
      },
    });

    // 6. Persist Razorpay ID
    await order.update({ razorpay_order_id: rzpOrder.id }, { transaction: t });

    await t.commit();

    // Respond with tax-inclusive details
    res.status(201).json({
      order_id: order.order_id,
      razorpay_order_id: rzpOrder.id,
      amount_inr: totalAmount,
      base_amount: baseAmount,
      tax_amount: taxAmount,
      tax_rate_percent: pkg.tax_rate_percent,
      receipt: rzpOrder.receipt,
    });
  } catch (error) {
    await t.rollback();
    console.error("Order creation failed:", error);
    res.status(500).json({ error: "Failed to create credit order" });
  }
};


exports.unlockContact = async (req, res) => {
  const { recruiter_user_id, job_id } = req.body;

  // Determine unlock scope — defaults to 'recruiter' (current behavior)
  const unlockScope =
    process.env.UNLOCK_SCOPE?.trim().toLowerCase() || "recruiter";
  if (!["recruiter", "job"].includes(unlockScope)) {
    return res.status(500).json({ error: "Invalid UNLOCK_SCOPE config" });
  }

  let university;
  try {
    university = await UniversityDetail.findOne({
      where: { user_id: req.user.id },
      attributes: ["id"],
    });
  } catch (err) {
    console.error("University lookup failed:", err);
    return res
      .status(500)
      .json({ error: "Failed to verify university profile" });
  }

  if (!university) {
    return res.status(404).json({ error: "University profile not found" });
  }

  const universityId = university.id;

  // now required regardless of scope
  if (!job_id) {
    return res.status(400).json({ error: "job_id is required" });
  }

  if (!recruiter_user_id) {
    return res.status(400).json({ error: "recruiter_user_id is required" });
  }

  // Building uniqueness condition based on current scope
  const uniqueWhere =
    unlockScope === "recruiter"
      ? { university_id: universityId, recruiter_user_id }
      : { university_id: universityId, job_id };

  try {
    // Check if already unlocked
    const existingUnlock = await ContactUnlock.findOne({
      where: uniqueWhere,
    });

    // Helper: compute expiry warning
    const computeExpiryWarning = (credits) => {
      if (!credits.next_expiry || credits.remaining_credits <= 0) return null;
      const daysUntilExpiry = Math.ceil(
        (new Date(credits.next_expiry) - new Date()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilExpiry <= 7) {
        return {
          message: `${
            credits.remaining_credits
          } credit(s) expire in ${daysUntilExpiry} day${
            daysUntilExpiry !== 1 ? "s" : ""
          }`,
          credits_at_risk: credits.remaining_credits,
          expiry_date: credits.next_expiry,
        };
      }
      return null;
    };

    if (existingUnlock) {
      // Fetch full contact (safe — already unlocked)
      const recruiter = await User.findByPk(recruiter_user_id, {
        attributes: ["first_name", "last_name", "email", "phone"],
        include: [
          {
            model: CompanyRecruiterProfile,
            // as: "companyRecruiterProfile",
            attributes: ["company_name", "designation_id"],
            include: [
              {
                model: JobRole,
                as: "designation",
                attributes: ["title"],
              },
            ],
          },
        ],
      });
      if (!recruiter)
        return res.status(404).json({ error: "Recruiter not found" });

      const credits = await getUniversityCredits(universityId);
      const batchExpiryWarning = computeExpiryWarning(credits);

      return res.json({
        success: true,
        unlock_status: "reused",
        contact_unlock_id: existingUnlock.unlock_id,
        contact: {
          name: `${recruiter.first_name} ${recruiter.last_name}`,
          email: recruiter.email,
          phone: recruiter.phone,
          designation:
            recruiter.companyRecruiterProfile?.designation?.title ||
            "Recruiter",
          company_name: recruiter.companyRecruiterProfile?.company_name || "",
        },
        remaining_credits: credits.remaining_credits,
        batch_expiry_warning: batchExpiryWarning,
      });
    }

    // Consume credit
    const { unlock, remaining_credits, reused } = await unlockContact(
      universityId,
      recruiter_user_id,
      job_id,
      unlockScope
    );

    // Fetch full contact
    const recruiter = await User.findByPk(recruiter_user_id, {
      attributes: ["first_name", "last_name", "email", "phone"],
      include: [
        {
          model: CompanyRecruiterProfile,
          // as: "companyRecruiterProfile",
          attributes: ["company_name"],
          include: [
            {
              model: JobRole,
              as: "designation",
              attributes: ["title"],
            },
          ],
        },
      ],
    });
    if (!recruiter)
      return res.status(404).json({ error: "Recruiter not found" });

    const credits = await getUniversityCredits(universityId);
    const batchExpiryWarning = computeExpiryWarning(credits);

    res.json({
      success: true,
      unlock_status: "new",
      contact_unlock_id: unlock.unlock_id,
      contact: {
        name: `${recruiter.first_name} ${recruiter.last_name}`,
        email: recruiter.email,
        phone: recruiter.phone,
        designation:
          recruiter.companyRecruiterProfile?.designation?.title || "Recruiter",
        company_name: recruiter.companyRecruiterProfile?.company_name || "",
      },
      remaining_credits: credits.remaining_credits,
      batch_expiry_warning: batchExpiryWarning,
    });
  } catch (error) {
    if (error.message === "INSUFFICIENT_CREDITS") {
      const credits = await getUniversityCredits(universityId);
      const batchExpiryWarning =
        credits.next_expiry && credits.remaining_credits > 0
          ? {
              message: `${credits.remaining_credits} credit(s) expire soon — consider using them first!`,
              credits_at_risk: credits.remaining_credits,
              expiry_date: credits.next_expiry,
            }
          : null;

      return res.status(402).json({
        error: "INSUFFICIENT_CREDITS",
        remaining_credits: credits.remaining_credits,
        batch_expiry_warning: batchExpiryWarning,
      });
    }
    console.error("Unlock error:", error);
    res.status(500).json({ error: "Failed to unlock contact" });
  }
};

// GET /api/unlocked-contacts
exports.getUnlockedContacts = async (req, res) => {
  let university;
  try {
    university = await UniversityDetail.findOne({
      where: { user_id: req.user.id },
      attributes: ["id"],
    });
  } catch (err) {
    console.error("University lookup failed:", err);
    return res
      .status(500)
      .json({ error: "Failed to verify university profile" });
  }

  if (!university) {
    return res.status(404).json({ error: "University profile not found" });
  }

  const universityId = university.id;

  try {
    const unlocks = await ContactUnlock.findAll({
      where: { university_id: universityId },
      order: [["unlocked_at", "DESC"]],
      include: [
        {
          model: User,
          as: "recruiter",
          attributes: ["first_name", "last_name", "email", "phone", "id"],
          include: [
            {
              model: CompanyRecruiterProfile,
              attributes: ["company_name"],
            },
          ],
        },
        {
          model: JobPost,
          as: "job",
          attributes: ["job_id","job_role_id", "opportunity_type"],
          include: [
            {
              model: JobRole,
              
              attributes: ["title"],
            },
          ],
        },
      ],
    });


    const result = unlocks.map((u) => ({
      unlock_id: u.unlock_id,
      recruiter_name: `${u.recruiter.first_name} ${u.recruiter.last_name}`,
      company_name: u.recruiter.CompanyRecruiterProfile?.company_name || "",
      email: u.recruiter.email,
      phone: u.recruiter.phone,
      job_title: u.job?.JobRole?.title || "—",
      opportunity_type: u.job?.opportunity_type || "",
      unlocked_at: u.unlocked_at,
    }));

    res.json(result);
  } catch (error) {
    console.error("History fetch error:", error);
    res.status(500).json({ error: "Failed to load unlock history" });
  }
};

exports.getCreditStatus = async (req, res) => {
  try {
    const university = await UniversityDetail.findOne({
      where: { user_id: req.user.id },
    });
    if (!university)
      return res.status(404).json({ error: "University not found" });

    const credits = await ensureDefaultCredits(university.id);
    res.json(credits); // returns { remaining_credits, next_expiry }
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch credit status" });
  }
};

// GET /api/credit-dashboard
exports.getCreditDashboard = async (req, res) => {
  try {
    const university = await UniversityDetail.findOne({
      where: { user_id: req.user.id },
      attributes: ["id"],
    });
    if (!university) {
      return res.status(404).json({ error: "University not found" });
    }
    const universityId = university.id;

    // 1. Current credit status (remaining + next expiry)
    const credits = await getUniversityCredits(universityId);

    // 2. Expiring credit batches — group by expiry
    const batches = await sequelize.query(
      `
  SELECT 
    batch_id,
    credits_added,
    credits_used,
    (credits_added - credits_used) AS remaining_in_batch,
    expires_at,
    created_at,
    order_id
  FROM university_credit_batches
  WHERE 
    university_id = :universityId
    AND (expires_at IS NULL OR expires_at > NOW())
    AND credits_added > credits_used
  ORDER BY 
    expires_at IS NULL,   -- MySQL-compatible: non-NULL first
    expires_at ASC        -- then sort ascending
  `,
      {
        replacements: { universityId },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Group by expiry date (for UI clarity)
    const expiryGroups = {};
    let totalCredits = 0;

    batches.forEach((b) => {
      const remaining = parseInt(b.remaining_in_batch);
      if (remaining <= 0) return;

      totalCredits += remaining;
      const key = b.expires_at
        ? new Date(b.expires_at).toISOString().split("T")[0]
        : "never";

      if (!expiryGroups[key]) {
        expiryGroups[key] = {
          expiry_date: b.expires_at ? new Date(b.expires_at) : null,
          credits: 0,
          batches: [],
        };
      }
      expiryGroups[key].credits += remaining;
      expiryGroups[key].batches.push({
        batch_id: b.batch_id,
        credits_added: b.credits_added,
        credits_used: b.credits_used,
        remaining: remaining,
        created_at: b.created_at,
        order_id: b.order_id,
      });
    });

    // Convert to array, sort: soonest expiry first, then "never"
    const expiryList = Object.entries(expiryGroups)
      .map(([dateKey, data]) => ({
        expiry_date: data.expiry_date,
        expiry_date_display: data.expiry_date
          ? new Date(data.expiry_date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "Never Expires",
        credits: data.credits,
        batches: data.batches,
      }))
      .sort((a, b) => {
        if (!a.expiry_date) return 1;
        if (!b.expiry_date) return -1;
        return new Date(a.expiry_date) - new Date(b.expiry_date);
      });

    // 3. Recent transactions (last 20)
    const logs = await CreditLog.findAll({
      where: { university_id: universityId },
      order: [["created_at", "DESC"]],
      limit: 20,
      attributes: [
        "log_id",
        "action_type",
        "credits_before",
        "credits_changed",
        "credits_after",
        "reference_type",
        "reference_id",
        "description",
        "created_at",
      ],
    });

    // Enrich logs for frontend
    const enrichedLogs = logs.map((log) => {
      let actionLabel, icon, color;
      switch (log.action_type) {
        case "purchased":
          actionLabel = "Credits Purchased";
          icon = "💰";
          color = "text-green-700 bg-green-50";
          break;
        case "used":
          actionLabel = "Contact Unlocked";
          icon = "🔓";
          color = "text-blue-700 bg-blue-50";
          break;
        case "expired":
          actionLabel = "Credits Expired";
          icon = "⏰";
          color = "text-red-700 bg-red-50";
          break;
        case "admin":
          actionLabel = "Admin Adjustment";
          icon = "⚙️";
          color = "text-purple-700 bg-purple-50";
          break;
        default:
          actionLabel = log.action_type;
          icon = "ℹ️";
          color = "text-gray-700 bg-gray-50";
      }

      return {
        ...log.get({ plain: true }),
        action_label: actionLabel,
        icon,
        color_class: color,
        // Format timestamps
        created_at_relative: new Date(log.created_at).toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    });

    // 4. Stats
    const stats = {
      total_purchased:
        (await CreditLog.sum("credits_changed", {
          where: { university_id: universityId, action_type: "purchased" },
        })) || 0,
      total_used: Math.abs(
        (await CreditLog.sum("credits_changed", {
          where: { university_id: universityId, action_type: "used" },
        })) || 0
      ),
      total_expired: Math.abs(
        (await CreditLog.sum("credits_changed", {
          where: { university_id: universityId, action_type: "expired" },
        })) || 0
      ),
    };

    res.json({
      summary: {
        remaining_credits: credits.remaining_credits,
        total_credits: totalCredits, // sanity check (should match remaining_credits)
        next_expiry: credits.next_expiry
          ? new Date(credits.next_expiry).toISOString()
          : null,
      },
      expiry_breakdown: expiryList, // ← key for "X credits expire on Y"
      recent_transactions: enrichedLogs,
      stats,
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    res.status(500).json({ error: "Failed to load dashboard" });
  }
};

// GET /api/credit-transactions?page=1&limit=10&action_type=used
exports.getCreditTransactions = async (req, res) => {
  const { page = 1, limit = 10, action_type } = req.query;
  const offset = (page - 1) * limit;

  const university = await UniversityDetail.findOne({
    where: { user_id: req.user.id },
    attributes: ["id"],
  });
  if (!university) {
    return res.status(404).json({ error: "University not found" });
  }
  const universityId = university.id;

  const where = { university_id: universityId };
  if (action_type) where.action_type = action_type;

  try {
    const { rows, count } = await CreditLog.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: [
        "log_id",
        "action_type",
        "credits_before",
        "credits_changed",
        "credits_after",
        "reference_type",
        "reference_id",
        "description",
        "created_at",
      ],
    });

    res.json({
      transactions: rows.map((log) => ({
        ...log.get({ plain: true }),
        created_at_iso: log.created_at.toISOString(),
        created_at_display: new Date(log.created_at).toLocaleString("en-IN"),
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
};
