// controllers/collegeCreditController.js
const { razorpay } = require("../config/razorpay");
const {
    sequelize,
  Plan,
  CompanyRecruiterProfile,
  User,
  PaymentOrder,
  CompanySubscription,
  JobPost,
  SchoolCollege
} = require("../models");
const { Op } = require("sequelize");

// ─── CREATE CREDIT PACK ORDER (for checkout) ───────────────────────
exports.createCollegeCreditOrder = async (req, res) => {
  const { plan_id } = req.body; // e.g., 5 (college-5 pack ID)
  const user_id = req.user?.id;

  if (!user_id) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. User ID missing.",
    });
  }

  try {
    // 1. Validate user & company
    const user = await User.findOne({
      where: { id: user_id, user_role: "COMPANY" },
    });
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Only recruiters can buy college credits.",
      });
    }

    const companyProfile = await CompanyRecruiterProfile.findOne({
      where: { user_id },
    });
    if (!companyProfile) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found.",
      });
    }
    const company_id = companyProfile.id;

    // 2. Fetch college credit plan
    const plan = await Plan.findOne({
      where: {
        plan_id,
        is_active: true,
        plan_type: "college_credits",
      },
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "College credit plan not found or inactive.",
      });
    }

    // 3. Extract pricing (use yearly_* as one-time values)
    const baseAmount = parseFloat(plan.yearly_price);
    const credits = plan.yearly_credits;
    const expiryDays = plan.features?.expiry_days || 180; // fallback 180 days

    if (!baseAmount || !credits) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan configuration: missing price or credits.",
      });
    }

    // 4. Calculate GST (18%) — as per your preference
    const taxAmount = parseFloat((baseAmount * 0.18).toFixed(2));
    const totalAmount = parseFloat((baseAmount + taxAmount).toFixed(2));

    // 5. Create Razorpay Order (one-time)
    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // paise
      currency: "INR",
      receipt: `credits_${plan.plan_slug}_${Date.now()}`,
      notes: {
        company_id,
        plan_id: plan.plan_id,
        credits,
        type: "college_credits",
      },
    });

    // 6. Save PaymentOrder (for webhook reconciliation)
    const paymentOrder = await PaymentOrder.create({
      company_id,
      purchase_type: "one_time_post", // still one-time purchase
      plan_id: plan.plan_id,
      post_type: "college", // signals college-related
      amount: baseAmount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      razorpay_order_id: rzpOrder.id,
      status: "created",
      expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 mins
      metadata: {
        credits,
        expiry_days: expiryDays,
        plan_slug: plan.plan_slug,
      },
    });

    // 7. Respond to frontend
    return res.status(200).json({
      success: true,
      order_id: paymentOrder.order_id,
      razorpay_order_id: rzpOrder.id,
      amount: baseAmount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      credits,
      plan_name: plan.plan_name,
      message: "Proceed to payment to unlock college credits.",
    });
  } catch (error) {
    console.error(" createCollegeCreditOrder error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create credit order",
      error: error.message,
    });
  }
};

// ─── GET AVAILABLE CREDIT PLANS (for pricing page dropdown) ─────────
exports.getCollegeCreditPlans = async (req, res) => {
  try {
    const plans = await Plan.findAll({
      where: {
        is_active: true,
        is_visible: true,
        plan_type: "college_credits",
      },
      attributes: [
        "plan_id",
        "plan_name",
        "plan_slug",
        "yearly_price", // = one-time price
        "yearly_credits", // = credits granted
        "features",
        "display_order",
      ],
      order: [
        ["yearly_credits", "ASC"],
        ["display_order", "ASC"],
        ["plan_id", "ASC"],
      ],
    });

    const formatted = plans.map((p) => ({
      id: p.plan_id,
      name: p.plan_name,
      slug: p.plan_slug,
      credits: p.yearly_credits,
      price: parseFloat(p.yearly_price),
      tax_included: false, // frontend adds GST
      expiry_days: p.features?.expiry_days || 180,
    }));

    return res.status(200).json({
      success: true,
      plans: formatted,
    });
  } catch (error) {
    console.error(" getCollegeCreditPlans error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch credit plans",
    });
  }
};


// GET api/subscriptions/credits/balance — returns active, non-expired college credits
exports.getCollegeCreditBalance = async (req, res) => {
  const user_id = req.user?.id;

  if (!user_id) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    // Get company ID
    const companyProfile = await CompanyRecruiterProfile.findOne({
      where: { user_id },
      attributes: ["id"],
    });

    if (!companyProfile) {
      return res.status(404).json({
        success: false,
        message: "Company profile not found",
      });
    }
    const company_id = companyProfile.id;

    // Get active college credit subscriptions (non-expired, non-zero balance)
    const creditSubs = await CompanySubscription.findAll({
      where: {
        company_id,
        status: ["active", "paused"], // allow paused (e.g., admin paused)
        plan_id: {
          [Op.in]: sequelize.literal(
            `(SELECT plan_id FROM plans WHERE plan_type = 'college_credits' AND is_active = 1)`
          ),
        },
      },
      include: [
        {
          model: Plan,
          as: "plan",
          attributes: ["plan_name", "plan_slug"],
        },
      ],
      attributes: [
        "subscription_id",
        "total_credits",
        "used_credits",
        "remaining_credits",
        "current_period_end",
        "created_at",
        "metadata",
      ],
      order: [["created_at", "ASC"]], // oldest first (FIFO usage)
    });

    // Total active credits
    const totalCredits = creditSubs.reduce(
      (sum, sub) => sum + sub.remaining_credits,
      0
    );

    // Format for frontend
    const formatted = creditSubs.map((sub) => ({
      id: sub.subscription_id,
      plan_name: sub.plan?.plan_name || "College Credits",
      plan_slug: sub.plan?.plan_slug,
      total: sub.total_credits,
      used: sub.used_credits,
      remaining: sub.remaining_credits,
      expiry_date: sub.current_period_end, // DATEONLY string (YYYY-MM-DD)
      is_expired: !sub.isActive(), 
      purchased_at: sub.created_at,
    }));

    return res.status(200).json({
      success: true,
      total_credits: totalCredits,
      has_credits: totalCredits > 0,
      subscriptions: formatted,
    });
  } catch (error) {
    console.error(" getCollegeCreditBalance error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch credit balance",
    });
  }
};



// ─── GET: Checkout Preview for College Job ─────────────────────
exports.getCollegeCheckoutPreview = async (req, res) => {
  try {
    const { job_id } = req.params;
    const user_id = req.user.id;
console.log("\n=== 🚀 BACKEND DEBUG: STARTING CHECKOUT PREVIEW ===");
    console.log(`Job ID: ${job_id} | User ID: ${user_id}`);
    // Validate job ownership & draft status
    const job = await JobPost.findOne({
      where: {
        job_id,
        company_recruiter_profile_id: { 
          [Op.in]: sequelize.literal(`(SELECT id FROM company_recruiter_profiles WHERE user_id = ${user_id})`) 
        },
        active_status: 2,
        post_type: "college"
      },
      include: [{ 
        model: SchoolCollege, 
        as: "eligibleColleges", 
        attributes: ["id", "name"], 
        through: { attributes: [] } 
      }]
    });

    if (!job) {
      console.log("❌ DEBUG: Job not found or not in draft state");
      return res.status(404).json({ error: "Job not found or not in draft state" });
    }

    const company_id = job.company_recruiter_profile_id;

    // Get UNUSED college credit bundles (active, non-expired, has remaining credits)
    const availableBundles = await CompanySubscription.findAll({
      where: {
        company_id,
        status: { [Op.in]: ["active", "pending"] },
        remaining_credits: { [Op.gt]: 0 },
        plan_id: { 
          [Op.in]: sequelize.literal(`(SELECT plan_id FROM plans WHERE plan_type = 'college_credits' AND is_active = 1)`) 
        }
      },
      include: [{ 
        model: Plan, 
        as: "plan", 
        attributes: ["plan_name", "yearly_credits", "features"] 
      }],
      attributes: ["subscription_id", "total_credits", "remaining_credits", "current_period_end", "metadata"]
    });

    const collegeCount = job.eligibleColleges?.length || 0;
    
    // Format bundles with waste warning
    const formattedBundles = availableBundles.map(b => {
      const isExpired = b.current_period_end && new Date(b.current_period_end) < new Date();
      return {
        id: b.subscription_id,
        name: b.plan?.plan_name || "College Credits",
        total: b.total_credits,
        remaining: b.remaining_credits,
        expiry: b.current_period_end,
        is_expired: isExpired,
        waste_warning: b.remaining_credits > collegeCount ? b.remaining_credits - collegeCount : 0
      };
    }).filter(b => !b.is_expired); // Exclude expired

    // Get available plans to buy (smaller / cheaper packs first via display_order, then credits)
    const availablePlans = await Plan.findAll({
      where: { 
        plan_type: "college_credits", 
        is_active: true, 
        is_visible: true 
      },
      attributes: ["plan_id", "plan_name", "yearly_price", "yearly_credits", "features", "display_order"],
      order: [
        ["yearly_credits", "ASC"],
        ["display_order", "ASC"],
        ["plan_id", "ASC"],
      ],
    });

    return res.json({
      job_id: job.job_id,
      college_count: collegeCount,
      colleges: job.eligibleColleges || [],
      bundles: formattedBundles,
      plans: availablePlans,
      gst_percent: 18
    });

  } catch (err) {
    console.error("checkout preview error:", err);
    require('fs').writeFileSync('debug_college.json', JSON.stringify({error: err.message, stack: err.stack}));
    return res.status(500).json({ error: "Failed to load checkout data" });
  }
};

// ─── PUT: Update Colleges on Draft Job ─────────────────────
exports.updateJobColleges = async (req, res) => {
  try {
    const { job_id } = req.params;
    const { college_ids = [] } = req.body;
    const user_id = req.user.id;

    // Validate job
    const job = await JobPost.findOne({
      where: {
        job_id,
        active_status: 2,
        post_type: "college",
        company_recruiter_profile_id: {
          [Op.in]: sequelize.literal(`(SELECT id FROM company_recruiter_profiles WHERE user_id = ${user_id})`)
        }
      }
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found or not editable" });
    }

    // Update college associations
    await job.setEligibleColleges(college_ids);
    
    // Update snapshot in college_ids field
    await job.update({ college_ids });

    return res.json({
      success: true,
      message: "Colleges updated",
      college_count: college_ids.length
    });

  } catch (err) {
    console.error("update colleges error:", err);
    return res.status(500).json({ error: "Failed to update colleges" });
  }
};

// ─── POST: Publish College Job with Bundle ─────────────────────
exports.publishCollegeJob = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { job_id } = req.params;
    const { bundle_id, college_ids } = req.body;
    const user_id = req.user.id;

    // Validate job
    const job = await JobPost.findOne({
      where: { 
        job_id, 
        active_status: 2, 
        post_type: "college" 
      },
      transaction: t
    });
    if (!job) {
      await t.rollback();
      return res.status(404).json({ error: "Job not found" });
    }

    // Get final college list (from request or DB)
    const finalCollegeIds = college_ids || (await job.getEligibleColleges({ raw: true, transaction: t })).map(c => c.id);
    const collegeCount = finalCollegeIds.length;
    
    if (collegeCount === 0) {
      await t.rollback();
      return res.status(400).json({ error: "At least one college required" });
    }

    // Validate bundle
    const bundle = await CompanySubscription.findByPk(bundle_id, { transaction: t });
    if (!bundle) {
      await t.rollback();
      return res.status(404).json({ error: "Selected bundle not found" });
    }

    if (bundle.remaining_credits < collegeCount) {
      await t.rollback();
      return res.status(402).json({ 
        error: "Insufficient credits", 
        required: collegeCount, 
        available: bundle.remaining_credits 
      });
    }

    // Consume EXACTLY collegeCount credits, waste the rest
    const creditsWasted = bundle.remaining_credits - collegeCount;
    
    await bundle.update({
      used_credits: bundle.used_credits + collegeCount,
      remaining_credits: bundle.remaining_credits - collegeCount,
      // Mark as consumed - no further use allowed
      status: "consumed",
      metadata: { 
        ...bundle.metadata, 
        used_for_job_id: job_id, 
        used_at: new Date().toISOString(),
        credits_wasted: creditsWasted
      }
    }, { transaction: t });

    // Update job to active/published
    await job.update({
      active_status: 1,
      payment_type: "subscription",
      subscription_id: bundle_id,
      college_ids: finalCollegeIds,
      is_college_specific: true
    }, { transaction: t });

    await t.commit();

    return res.json({
      success: true,
      message: "Opportunity published successfully",
      job_id: job.job_id,
      credits_used: collegeCount,
      credits_wasted: creditsWasted,
      bundle_id: bundle_id
    });

  } catch (err) {
    await t.rollback();
    console.error("publish college error:", err);
    return res.status(500).json({ error: "Failed to publish job" });
  }
};



// Add this new function at the end of collegeCreditController.js
exports.createCollegeCheckoutPayment = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { job_id } = req.params;
    const { bundle_id, college_ids } = req.body;
    const user_id = req.user.id;

    // 1. Validate job is draft and owned by user
    const job = await JobPost.findOne({
      where: {
        job_id,
        active_status: 2,
        post_type: "college",
        company_recruiter_profile_id: {
          [Op.in]: sequelize.literal(`(SELECT id FROM company_recruiter_profiles WHERE user_id = ${user_id})`)
        }
      },
      transaction: t
    });
    if (!job) {
      await t.rollback();
      return res.status(404).json({ error: "Job not found or not in draft state" });
    }

    // 2. Validate bundle
    const bundle = await CompanySubscription.findByPk(bundle_id, {
      include: [{ model: Plan, as: "plan" }],
      transaction: t
    });
    if (!bundle || !bundle.isActive?.()) {
      await t.rollback();
      return res.status(400).json({ error: "Invalid or expired bundle" });
    }

    const finalCollegeIds = college_ids || (await job.getEligibleColleges({ raw: true, transaction: t })).map(c => c.id);
    const collegeCount = finalCollegeIds.length;
    if (collegeCount === 0 || bundle.remaining_credits < collegeCount) {
      await t.rollback();
      return res.status(400).json({ error: "Insufficient credits for selected colleges" });
    }

    // 3. Create Razorpay order for the bundle price (one-time)
    const baseAmount = parseFloat(bundle.amount_per_cycle);
    const totalAmount = baseAmount * 1.18; // 18% GST

    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100),
      currency: "INR",
      receipt: `college_bundle_${bundle_id}_${Date.now()}`,
      notes: {
        job_id,
        bundle_id,
        company_id: bundle.company_id,
        college_count: collegeCount,
        type: "college_bundle_payment"
      }
    });

    // 4. Save PaymentOrder for webhook reconciliation
    await PaymentOrder.create({
      company_id: bundle.company_id,
      purchase_type: "one_time_post",
      plan_id: bundle.plan_id,
      post_type: "college",
      job_id,
      college_ids: finalCollegeIds,
      amount: baseAmount,
      tax_amount: baseAmount * 0.18,
      total_amount: totalAmount,
      razorpay_order_id: rzpOrder.id,
      status: "created",
      subscription_id: bundle_id,
      expires_at: new Date(Date.now() + 30 * 60 * 1000),
      metadata: {
        credits_to_consume: collegeCount,
        bundle_remaining_before: bundle.remaining_credits
      }
    }, { transaction: t });

    await t.commit();

    return res.json({
      success: true,
      razorpay_order_id: rzpOrder.id,
      amount: baseAmount,
      total_amount: totalAmount,
      currency: "INR",
      bundle_name: bundle.plan?.plan_name || "College Credits",
      credits_to_use: collegeCount
    });

  } catch (err) {
    await t.rollback();
    console.error("college checkout payment error:", err);
    return res.status(500).json({ error: "Failed to create payment order" });
  }
};