// controllers/paymentController.js
const { razorpay, crypto } = require("../config/razorpay");
const {
  sequelize,
  JobPost,
  PaymentOrder,
  OneTimePurchase,
  PaymentTransaction,
  User,
  CompanyRecruiterProfile,
  SchoolCollege,
  CompanySubscription,
  Plan,
  SubscriptionCreditLog,
  JobRole,
  UniversityDetail,
  UniversityCreditOrder,
  UniversityCreditBatch,
  CreditLog,
  UniversityNotificationPayment,
  UniversityNotificationCredit,
} = require("../models");

const { Op } = require("sequelize");

const { calculatePrice } = require("../utils/pricingHelper");
const { generateInvoicePDF } = require('../utils/invoiceGenerator');

// ─── 1. CREATE PAYMENT ORDER (for checkout page) ───────────────────────
exports.createOneTimePaymentOrder = async (req, res) => {
  try {
    const { job_id, post_type, college_ids = [] } = req.body;
    const user_id = req.user.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User ID not found. Kindly log in again.",
        data: null,
      });
    }

    // Check if user role is COMPANY (recruiter)
    const user = await User.findOne({
      where: { id: user_id, user_role: "COMPANY" },
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. User is not a recruiter.",
        data: null,
      });
    }

    // Get company profile
    const companyProfile = await CompanyRecruiterProfile.findOne({
      where: { user_id },
      attributes: ["id"],
    });

    if (!companyProfile) {
      return res.status(404).json({
        success: false,
        message: "Company recruiter profile not found.",
        data: null,
      });
    }

    const company_id = companyProfile.id;

    // Validate job ownership & status
    const job = await JobPost.findOne({
      where: {
        job_id,
        company_recruiter_profile_id: company_id,
        // payment_type: "free",
      },
      include: [
        {
          model: SchoolCollege,
          as: "eligibleColleges",
          attributes: ["id"],
          through: { attributes: [] },
          required: false,
        },
      ],
    });
    if (!job) {
      return res.status(404).json({ error: "Job not found or already paid" });
    }

    let collegeCount = 0;
    let resolvedCollegeIds = null;

    if (post_type === "college") {
      collegeCount = job.eligibleColleges?.length || 0;
      if (collegeCount === 0) {
        return res.status(400).json({
          error:
            "Job has no colleges selected. Cannot create college-specific post.",
        });
      }
      resolvedCollegeIds = job.eligibleColleges.map((c) => c.id);
    }

    //  Using helper
    const { baseAmount, taxAmount, totalAmount } = calculatePrice(
      post_type,
      collegeCount
    );

    //  Create Razorpay order (amount in paise)
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // INR to paise
      currency: "INR",
      receipt: `job_${job_id}_order_${Date.now()}`,
      notes: {
        job_id,
        company_id,
        post_type,
        college_count: collegeCount,
        user_id,
      },
    });

    //  Save payment order in DB
    const paymentOrder = await PaymentOrder.create({
      company_id,
      purchase_type: "one_time_post",
      post_type,
      job_id,
      college_ids: collegeCount > 0 ? resolvedCollegeIds : null,
      amount: baseAmount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      razorpay_order_id: razorpayOrder.id,
      status: "created",
      expires_at: new Date(Date.now() + 30 * 60 * 1000), // 30 mins
    });

    //  Response for checkout page
    return res.status(200).json({
      order_id: paymentOrder.order_id,
      razorpay_order_id: razorpayOrder.id,
      amount: baseAmount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      currency: "INR",
      job_id,
      post_type,
      college_ids: collegeCount > 0 ? resolvedCollegeIds : null,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({ error: "Failed to create payment order" });
  }
};



//to get payment quote for one time purchases
exports.getPaymentQuote = async (req, res) => {
  try {
    const { job_id, post_type, college_ids } = req.query;
    const user_id = req.user.id;

    if (!user_id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. User ID not found. Kindly log in again.",
        data: null,
      });
    }

    // Check if user role is COMPANY (recruiter)
    const user = await User.findOne({
      where: { id: user_id, user_role: "COMPANY" },
    });

    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. User is not a recruiter.",
        data: null,
      });
    }

    // Get company profile
    const companyProfile = await CompanyRecruiterProfile.findOne({
      where: { user_id },
      attributes: ["id"],
    });

    if (!companyProfile) {
      return res.status(404).json({
        success: false,
        message: "Company recruiter profile not found.",
        data: null,
      });
    }

    const company_id = companyProfile.id;

    // Validate and fetch the ACTUAL job (with its real colleges/courses)
    const job = await JobPost.findOne({
      where: {
        job_id,
        company_recruiter_profile_id: company_id,
        // payment_type: "free",
      },
      include: [
        {
          model: SchoolCollege,
          as: "eligibleColleges",
          attributes: ["id", "name"],
          through: { attributes: [] },
          required: false,
        },
      ],
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found or already paid" });
    }

    console.log("job data", job);

    // let baseAmount = 0;
    // const taxRate = 0.18;
    // let collegeCount = 0;
    // let collegeNames = [];
    // let resolvedPostType = post_type; // but validate against job

    // Validate post_type against actual job configuration
    // if (post_type === 'college') {
    //   collegeCount = job.eligibleColleges?.length || 0;
    //   if (collegeCount === 0) {
    //     return res.status(400).json({ error: 'Opportunity has no colleges selected' });
    //   }
    //   collegeNames = job.eligibleColleges.map(c => c.name);
    //   baseAmount = 999 + (collegeCount * 200);
    // } else if (post_type === 'active') {
    //   baseAmount = 499;
    // } else if (post_type === 'future') {
    //   baseAmount = 799;
    // } else {
    //   return res.status(400).json({ error: 'Invalid post_type' });
    // }

    // const taxAmount = parseFloat((baseAmount * taxRate).toFixed(2));
    // const totalAmount = parseFloat((baseAmount + taxAmount).toFixed(2));

    //USING HELPER TO CALUCATE PRICE
    let collegeCount = 0;
    let collegeNames = [];

    if (job.post_type === "college") {
      collegeCount = job.eligibleColleges?.length || 0;
      if (collegeCount === 0) {
        return res
          .status(400)
          .json({ error: "Opportunity has no colleges selected" });
      }
      collegeNames = job.eligibleColleges.map((c) => c.name);
    }

    // const { baseAmount, taxAmount, totalAmount } = calculatePrice(
    //   job.post_type,
    //   collegeCount
    // );


    const {
      baseAmount,
      taxAmount,
      totalAmount,
      originalBaseAmount,
      promo_active,
      promo_reason,
    } = calculatePrice(job.post_type, collegeCount);

    return res.json({
      mode: "one_time",
      post_type: job.post_type,
      job_id,
      baseAmount,
      taxAmount,
      totalAmount,
      originalBaseAmount, 
      promo_active,
      promo_reason,
      collegeCount,
      collegeNames,
      currency: "INR",
      description:
        job.post_type === "college"
          ? `College-Specific Job Posting (${collegeCount} colleges)`
          : `${
              job.post_type.charAt(0).toUpperCase() + job.post_type.slice(1)
            } Job Posting`,
    });
  } catch (error) {
    console.error("Quote error:", error);
    return res.status(500).json({ error: "Failed to generate quote" });
  }
};



// controllers/billingController.js
exports.getBillingDashboard = async (req, res) => {
  const user_id = req.user.id;
  const { page = 1, limit = 10 } = req.query;

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const offset = (pageNum - 1) * limitNum;

  try {
    // 1. Get company
    const companyProfile = await CompanyRecruiterProfile.findOne({
      where: { user_id },
      attributes: ["id", "company_name"],
    });
    if (!companyProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    }

    // 2. Get current subscription (active)
    const subscription = await CompanySubscription.findOne({
      where: {
        company_id: companyProfile.id,
        status: ["active", "paused"],
      },
      include: [
        {
          model: Plan,
          as: "plan",
          attributes: ["plan_name", "plan_slug"],
          where: {
            plan_type: ["active", "future","both"],
          },
        },
      ],
      order: [["created_at", "DESC"]],
    });

    let currentPlanData = null;
    if (subscription) {
      // Resolve college names
      let collegeNames = [];
      if (subscription.college_ids && subscription.college_ids.length > 0) {
        const colleges = await SchoolCollege.findAll({
          where: { id: subscription.college_ids },
          attributes: ["name"],
        });
        collegeNames = colleges.map((c) => c.name);
      }

      currentPlanData = {
        subscription_id: subscription.subscription_id,
        razorpay_subscription_id: subscription.razorpay_subscription_id,
        plan_id: subscription.plan_id,
        plan_name: subscription.plan.plan_name,
        plan_slug: subscription.plan.plan_slug,
        billing_cycle: subscription.billing_cycle,
        status: subscription.status,
        auto_renew: subscription.auto_renew,
        start_date: subscription.start_date || subscription.created_at,
        next_billing_date: subscription.next_billing_date,
        amount_per_cycle: parseFloat(subscription.amount_per_cycle),
        total_credits: subscription.total_credits,
        used_credits: subscription.used_credits,
        remaining_credits: subscription.remaining_credits,
        college_count: subscription.college_count,
        college_names: collegeNames,
        can_upgrade: true, // add logic: e.g., !pending
        can_cancel:
          subscription.status === "active" || subscription.status === "paused",
        can_pause: subscription.status === "active",
        can_resume: subscription.status === "paused",
        actions: {
          upgrade_url: `/plans?current=${subscription.plan.plan_slug}`,
          cancel_url: "/billing/subscription/cancel",
          pause_url: "/billing/subscription/pause",
          add_colleges_url: "/jobs/create?mode=upgrade-plan",
        },
      };
    }

    // 3. Get recent transactions (last 10)
    const { count, rows: transactions } = await PaymentOrder.findAndCountAll({
      where: {
        company_id: companyProfile.id,
      },
      include: [
        {
          model: JobPost,
          as: "job",
          attributes: ["job_id", "post_type"],
          include: [
            {
              model: SchoolCollege,
              as: "eligibleColleges",
              attributes: ["name"],
              through: { attributes: [] },
            },
            {
              model: JobRole,
              attributes: ["title"],
            },
          ],
          required: false,
        },
      ],
      attributes: [
        "order_id",
        "purchase_type",
        "amount",
        "tax_amount",
        "total_amount",
        "status",
        "created_at",
        "job_id",
        "razorpay_order_id",
        "billing_cycle",
      ],
      order: [["created_at", "DESC"]],
      limit: limitNum,
      offset: offset,
      distinct: true,
    });

    const formattedTransactions = transactions.map((t) => {
      const colleges = t.job?.eligibleColleges || [];
      const collegeNames = colleges.map((c) => c.name);
      const collegeCount = collegeNames.length;

      let description = "";
      if (t.purchase_type === "subscription") {
        description = `${currentPlanData?.plan_name || "Plan"} (${
          t.billing_cycle
        })`;
      } else if (t.purchase_type === "one_time_post") {
        const jobTitle = t.job?.JobRole?.title || "Job Posting";
        description = `${jobTitle}${
          collegeCount > 0 ? ` (${collegeCount} colleges)` : ""
        }`;
      }

      return {
        id: t.order_id,
        date: t.created_at,
        type: t.purchase_type,
        description,
        amount: parseFloat(t.amount),
        tax_amount: parseFloat(t.tax_amount),
        total_amount: parseFloat(t.total_amount),
        status: t.status,
        payment_id: t.razorpay_payment_id,
        job_id: t.job_id,
        college_count: collegeCount,
        college_names: collegeNames,
        details_url: `/billing/transaction/${t.order_id}`,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        current_plan: currentPlanData,
        transactions: formattedTransactions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count,
          has_more: offset + limitNum < count,
        },
      },
    });
  } catch (error) {
    console.error("Billing dashboard error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to load dashboard" });
  }
};

exports.getBillingTransaction = async (req, res) => {
  const { id } = req.params; // order_id (PK of PaymentOrder)
  const user_id = req.user.id;

  try {
    // Get company
    const companyProfile = await CompanyRecruiterProfile.findOne({
      where: { user_id },
      attributes: ["id", "company_name"], //and toher fiels alo availble if needed
    });
    if (!companyProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    }

    //  Fetch PaymentOrder + ALL related data in one query
    const paymentOrder = await PaymentOrder.findOne({
      where: {
        order_id: id,
        company_id: companyProfile.id,
      },
      include: [
        // Plan (for subscription & plan name)
        {
          model: Plan,
          as: "plan",
          attributes: [
            "plan_name",
            "plan_slug",
            "monthly_price",
            "yearly_price",
          ],
        },
        // JobPost (for job title & post_type)
        {
          model: JobPost,
          as: "job",
          attributes: ["job_id", "post_type", "created_at"],
          include: [
            {
              model: SchoolCollege,
              as: "eligibleColleges",
              attributes: ["name"],
              through: { attributes: [] },
            },
            {
              model: JobRole,
              attributes: ["title"],
            },
          ],
        },
        // CompanySubscription (for subscription context)
        {
          model: CompanySubscription,
          as: "subscription",
          attributes: [
            "subscription_id",
            "razorpay_subscription_id",
            "billing_cycle",
            "status",
            "start_date",
            "next_billing_date",
          ],
        },
        //  PaymentTransaction (CRITICAL: for Razorpay payment details)
        {
          model: PaymentTransaction,
          as: "transactions",
          attributes: [
            "transaction_id",
            "razorpay_payment_id",
            "razorpay_order_id",
            "amount",
            "status",
            "payment_method",
            "payment_date",
          ],
          required: false, // optional (e.g., newly created)
          order: [["payment_date", "DESC"]], // latest first
          limit: 1, // only need latest transaction
        },
      ],
      attributes: [
        "order_id",
        "purchase_type",
        "plan_id",
        "billing_cycle",
        "post_type",
        "job_id",
        "college_ids",
        "amount", // base
        "tax_amount",
        "total_amount",
        "razorpay_order_id",
        "status", // order status: created/paid/failed
        "created_at",
        "updated_at",
        "subscription_id",
        "is_subscription_payment",
      ],
    });

    if (!paymentOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });
    }

    //  Extract latest transaction (if exists)
    const latestTxn = paymentOrder.transactions && paymentOrder.transactions[0];
    const paymentDetails = latestTxn
      ? {
          razorpay_payment_id: latestTxn.razorpay_payment_id,
          razorpay_order_id:
            latestTxn.razorpay_order_id || paymentOrder.razorpay_order_id,
          payment_method: latestTxn.payment_method,
          payment_date: latestTxn.payment_date,
          transaction_status: latestTxn.status, // "success", "failed", etc.
          transaction_id: latestTxn.transaction_id,
        }
      : {
          razorpay_order_id: paymentOrder.razorpay_order_id,
          payment_method: null,
          payment_date: null,
          transaction_status: null,
          transaction_id: null,
        };

    //  Resolve college names (from college_ids JSON in PaymentOrder)
    let collegeNames = [];
    let collegeCount = 0;
    if (paymentOrder.college_ids && Array.isArray(paymentOrder.college_ids)) {
      collegeCount = paymentOrder.college_ids.length;
      if (collegeCount > 0) {
        const colleges = await SchoolCollege.findAll({
          where: { id: paymentOrder.college_ids },
          attributes: ["name"],
        });
        collegeNames = colleges.map((c) => c.name);
      }
    }

    //  Build final response
    const transaction = {
      // Core identifiers
      order_id: paymentOrder.order_id,
      subscription_id: paymentOrder.subscription?.subscription_id || null,
      razorpay_subscription_id:
        paymentOrder.subscription?.razorpay_subscription_id || null,

      // Type & status
      type: paymentOrder.purchase_type, // "subscription" | "one_time_post"
      sub_type: paymentOrder.post_type || paymentOrder.billing_cycle || null, // "college", "monthly", etc.
      order_status: paymentOrder.status, // "created", "paid", etc.
      payment_status: paymentDetails.transaction_status || paymentOrder.status, // prefer txn status

      // Timestamps
      created_at: paymentOrder.created_at,
      paid_at: paymentDetails.payment_date || null,
      updated_at: paymentOrder.updated_at,

      // Amounts
      amount_breakup: {
        base: parseFloat(paymentOrder.amount),
        tax: parseFloat(paymentOrder.tax_amount),
        total: parseFloat(paymentOrder.total_amount),
      },

      // Razorpay IDs
      razorpay: {
        order_id: paymentDetails.razorpay_order_id,
        payment_id: paymentDetails.razorpay_payment_id,
        subscription_id: paymentOrder.subscription?.razorpay_subscription_id,
      },

      // Payment method
      payment_method: paymentDetails.payment_method || "—",

      // Job context (if one-time)
      job: paymentOrder.job
        ? {
            job_id: paymentOrder.job.job_id,
            title: paymentOrder.job.job_title,
            post_type: paymentOrder.job.post_type,
          }
        : null,

      // Plan context (if subscription)
      plan: paymentOrder.plan
        ? {
            plan_id: paymentOrder.plan_id,
            name: paymentOrder.plan.plan_name,
            slug: paymentOrder.plan.plan_slug,
            billing_cycle: paymentOrder.billing_cycle,
          }
        : null,

      // College data
      college_count: collegeCount,
      college_names: collegeNames,

      // Subscription details (if applicable)
      subscription: paymentOrder.subscription
        ? {
            id: paymentOrder.subscription.subscription_id,
            razorpay_id: paymentOrder.subscription.razorpay_subscription_id,
            status: paymentOrder.subscription.status,
            start_date: paymentOrder.subscription.start_date,
            next_billing_date: paymentOrder.subscription.next_billing_date,
            billing_cycle: paymentOrder.subscription.billing_cycle,
          }
        : null,
    };

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error("Get transaction error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transaction details",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};







exports.downloadInvoice = async (req, res) => {
  const { order_id } = req.params; // or req.query
  const user_id = req.user.id;

  try {
    // 1. Verify company ownership
    const companyProfile = await CompanyRecruiterProfile.findOne({
      where: { user_id },
      attributes: ['id', 'company_name'],
    });
    if (!companyProfile) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    // 2. Fetch transaction with all relations
    const paymentOrder = await PaymentOrder.findOne({
      where: {
        order_id,
        company_id: companyProfile.id,
      },
      include: [
        {
          model: Plan,
          as: 'plan',
          attributes: ['plan_name', 'plan_slug'],
        },
        {
          model: JobPost,
          as: 'job',
          attributes: ['job_id', 'post_type'],
          include: [
            { model: JobRole, attributes: ['title'] },
            { model: SchoolCollege, as: 'eligibleColleges', attributes: ['name'], through: { attributes: [] } }
          ],
        },
        {
          model: PaymentTransaction,
          as: 'transactions',
          attributes: ['razorpay_payment_id', 'payment_method', 'status', 'payment_date'],
          required: false,
          order: [['payment_date', 'DESC']],
          limit: 1,
        },
      ],
      attributes: [
        'order_id', 'purchase_type', 'post_type', 'billing_cycle',
        'amount', 'tax_amount', 'total_amount',
        'status', 'created_at', 'college_ids',
      ],
    });

    if (!paymentOrder) {
      return res.status(404).json({ success: false, message: 'Invoice not found or unauthorized' });
    }

    // 3. Prepare transaction data for invoice
    const latestTxn = paymentOrder.transactions?.[0];

    // Resolve college names
    let collegeNames = [];
    if (paymentOrder.college_ids?.length > 0) {
      const colleges = await SchoolCollege.findAll({
        where: { id: paymentOrder.college_ids },
        attributes: ['name'],
      });
      collegeNames = colleges.map(c => c.name);
    }

    const transactionData = {
      order_id: paymentOrder.order_id,
      type: paymentOrder.purchase_type,
      sub_type: paymentOrder.post_type || paymentOrder.billing_cycle,
      amount_breakup: {
        base: parseFloat(paymentOrder.amount),
        tax: parseFloat(paymentOrder.tax_amount),
        total: parseFloat(paymentOrder.total_amount),
      },
      created_at: paymentOrder.created_at,
      paid_at: latestTxn?.payment_date || null,
      payment_status: latestTxn?.status || paymentOrder.status,
      payment_method: latestTxn?.payment_method || null,
      razorpay: {
        payment_id: latestTxn?.razorpay_payment_id,
        order_id: paymentOrder.razorpay_order_id,
      },
      job: paymentOrder.job ? {
        title: paymentOrder.job.JobRole?.title || 'Job Posting',
        post_type: paymentOrder.job.post_type,
      } : null,
      plan: paymentOrder.plan ? {
        name: paymentOrder.plan.plan_name,
      } : null,
      college_count: collegeNames.length,
      college_names: collegeNames,
    };

    const companyData = {
      company_name: companyProfile.company_name,
      user_id,
      // Add more fields if stored in profile
    };

    // 4. Generate PDF
    const pdfBuffer = await generateInvoicePDF(transactionData, companyData);

    // 5. Send as downloadable file
    const fileName = `Invoice_${order_id}_${new Date().toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length);

    // Optional: Log download for audit
    // await InvoiceDownloadLog.create({ order_id, user_id, downloaded_at: new Date() });

    return res.send(pdfBuffer);

  } catch (error) {
    console.error('Invoice download error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate invoice',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};































// ───  VERIFY PAYMENT (after Razorpay success)[ now not required as handled by webhook] ───────────────────────
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      order_id,
    } = req.body;

    //  Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_API_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid payment signature" });
    }

    //  Fetch order
    const order = await PaymentOrder.findByPk(order_id, {
      include: [{ model: JobPost, as: "job" }],
    });
    if (!order || order.status !== "created") {
      return res
        .status(404)
        .json({ error: "Invalid or already processed order" });
    }
    if (!order.job) {
      return res.status(404).json({ error: "Associated job not found" });
    }

    //  Record transaction
    await PaymentTransaction.create({
      order_id: order.order_id,
      company_id: order.company_id,
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      amount: order.total_amount,
      status: "success",
      payment_method: "online", // or extract from Razorpay webhook
      payment_date: new Date(),
    });

    //  Mark order as paid
    await order.update({ status: "paid" });

    //  Create one-time purchase record
    const purchase = await OneTimePurchase.create({
      company_id: order.company_id,
      post_type: order.post_type,
      job_id: order.job_id,
      college_ids: order.college_ids,
      college_count: order.college_ids ? order.college_ids.length : 0,
      amount_paid: order.total_amount,
      payment_status: "paid",
    });

    //  Activate the job
    await order.job.update({
      payment_type: "one_time",
      purchase_id: purchase.purchase_id,
      is_college_specific: order.post_type === "college",
      college_ids: order.college_ids,
      // You may also set is_active = true, posted_at = now, etc.
    });

    return res.status(200).json({
      success: true,
      message: "Payment verified and job posted successfully!",
      job_id: order.job_id,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({ error: "Payment verification failed" });
  }
};







exports.handleRazorpayWebhook = async (req, res) => {
  const signature = req.headers["x-razorpay-signature"];
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return res.status(400).send("Missing signature or secret");
  }

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (signature !== expectedSignature) {
    console.warn("Invalid webhook signature");
    return res.status(400).send("Invalid signature");
  }

  const { event, payload } = req.body;

  try {
    if (event === "order.paid") {
      const orderEntity = payload.order.entity;
      const paymentEntity = payload.payment.entity;

      const razorpay_order_id = orderEntity.id;
      const razorpay_payment_id = paymentEntity.id;
      const amount = paymentEntity.amount; // paise
      const method = paymentEntity.method;
      const receipt = orderEntity.receipt; // guaranteed here

      // ───→ C. COLLEGE CREDIT PACK (handled via PaymentOrder with plan_id)
      const creditPackOrder = await PaymentOrder.findOne({
        where: {
          razorpay_order_id,
          status: "created",
          purchase_type: "one_time_post",
          post_type: "college",
          plan_id: { [Op.not]: null }, // college credits have plan_id
        },
        include: [{ model: Plan, as: "plan" }],
      });

      if (
        creditPackOrder &&
        creditPackOrder.plan?.plan_type === "college_credits"
      ) {
        console.log(
          ` Handling college credit pack purchase: ${razorpay_order_id}`
        );

        const credits =
          creditPackOrder.metadata?.credits ||
          creditPackOrder.plan.yearly_credits;
        const expiryDays =
          creditPackOrder.metadata?.expiry_days ||
          creditPackOrder.plan.features?.expiry_days ||
          180;

        const today = new Date();
        const expiryDate = new Date(today);
        // expiryDate.setDate(today.getDate() + expiryDays);
        expiryDate.setFullYear(today.getFullYear() + 1);

        // Create non-recurring subscription for credits
        await CompanySubscription.create({
          company_id: creditPackOrder.company_id,
          plan_id: creditPackOrder.plan_id,
          billing_cycle: "one_time",
          status: "active",
          razorpay_subscription_id: null,
          razorpay_plan_id: null,
          razorpay_customer_id: null,
          billing_cycle: "one_time",
          auto_renew: false,
          total_credits: credits,
          used_credits: 0,
          remaining_credits: credits,
          college_count: 0,
          college_ids: null,
          amount_per_cycle: creditPackOrder.amount,
          start_date: today.toISOString().split("T")[0],
          current_period_start: today.toISOString().split("T")[0],
          current_period_end: expiryDate.toISOString().split("T")[0],
          next_billing_date: null,
          meta: {
            plan_name: creditPackOrder.plan.plan_name,
            type: "college_credits",
            expiry_at: expiryDate.toISOString().split("T")[0],
            purchased_at: new Date().toISOString(),
          },
        });

        // Update payment order & transaction
        await PaymentTransaction.create({
          order_id: creditPackOrder.order_id,
          company_id: creditPackOrder.company_id,
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature: signature,
          amount: parseFloat((amount / 100).toFixed(2)),
          status: "success",
          payment_method: method,
          payment_date: new Date(),
        });

        await creditPackOrder.update({ status: "paid" });

        console.log(
          ` ${credits} college credits granted to company ${creditPackOrder.company_id}`
        );
        return res.status(200).send("OK");
      }



      // ───→ E. COLLEGE BUNDLE PAYMENT FOR SPECIFIC JOB (new flow)
      const collegeBundleOrder = await PaymentOrder.findOne({
        where: {
          razorpay_order_id,
          status: "created",
          metadata: { type: "college_bundle_payment" }
        },
        include: [
          { model: CompanySubscription, as: "subscription" },
          { model: JobPost, as: "job" }
        ],
      });

      if (collegeBundleOrder && collegeBundleOrder.subscription) {
        console.log(` Handling college bundle payment for job ${collegeBundleOrder.job_id}`);

        const bundle = collegeBundleOrder.subscription;
        const job = collegeBundleOrder.job;
        const collegeCount = collegeBundleOrder.metadata?.credits_to_consume || job?.eligibleColleges?.length || 0;

        if (bundle && job && collegeCount > 0) {
          // Consume credits and mark bundle as consumed
          await bundle.update({
            used_credits: bundle.used_credits + collegeCount,
            remaining_credits: bundle.remaining_credits - collegeCount,
            status: "paid",
            metadata: {
              ...bundle.metadata,
              used_for_job_id: job.job_id,
              used_at: new Date().toISOString(),
              credits_wasted: bundle.remaining_credits - collegeCount
            }
          }, { transaction: t });

          // Publish the job
          await job.update({
            active_status: 1,
            payment_type: "subscription",
            subscription_id: bundle.subscription_id,
            college_ids: collegeBundleOrder.college_ids
          }, { transaction: t });

          // Log transaction
          await PaymentTransaction.create({
            order_id: collegeBundleOrder.order_id,
            company_id: bundle.company_id,
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature: signature,
            amount: parseFloat((amount / 100).toFixed(2)),
            status: "success",
            payment_method: method,
            payment_date: new Date()
          }, { transaction: t });

          await collegeBundleOrder.update({ status: "paid" }, { transaction: t });

          console.log(` Job ${job.job_id} published via bundle payment`);
        }
        return res.status(200).send("OK");
      }

      // ───→ A. One-time job posting
      const oneTimeOrder = await PaymentOrder.findOne({
        where: {
          razorpay_order_id,
          status: "created",
          purchase_type: "one_time_post",
          plan_id: null,
        },
      });

      if (oneTimeOrder) {
        console.log(
          ` Handling one-time payment for order: ${razorpay_order_id}`
        );
        await PaymentTransaction.create({
          order_id: oneTimeOrder.order_id,
          company_id: oneTimeOrder.company_id,
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature: signature,
          amount: parseFloat((amount / 100).toFixed(2)),
          status: "success",
          payment_method: method,
          payment_date: new Date(),
        });

        await oneTimeOrder.update({ status: "paid" });

        const purchase = await OneTimePurchase.create({
          company_id: oneTimeOrder.company_id,
          post_type: oneTimeOrder.post_type,
          job_id: oneTimeOrder.job_id,
          college_ids: oneTimeOrder.college_ids,
          college_count: oneTimeOrder.college_ids
            ? oneTimeOrder.college_ids.length
            : 0,
          amount_paid: oneTimeOrder.total_amount,
          payment_status: "paid",
        });

        await JobPost.update(
          {
            payment_type: "one_time",
            purchase_id: purchase.purchase_id,
            is_college_specific: oneTimeOrder.post_type === "college",
            college_ids: oneTimeOrder.college_ids,
            active_status: oneTimeOrder.post_type === "future" ? 2 : 1,
          },
          { where: { job_id: oneTimeOrder.job_id } }
        );

        console.log(
          ` Job ${oneTimeOrder.job_id} activated via one-time payment`
        );
        return res.status(200).send("OK");
      }

      // ───→ B. UNIVERSITY CREDIT ORDER (ucord-*) — ONLY in order.paid
      if (
        receipt &&
        typeof receipt === "string" &&
        receipt.startsWith("ucord-")
      ) {
        const orderId = parseInt(receipt.split("-")[1], 10);
        if (!orderId || isNaN(orderId)) {
          console.warn(` Invalid ucord receipt: ${receipt}`);
          return res.status(200).send("OK");
        }

        const ucOrder = await UniversityCreditOrder.findByPk(orderId, {
          include: [{ model: UniversityDetail, as: "university" }],
        });

        if (!ucOrder) {
          console.warn(` UC order ${orderId} not found`);
          return res.status(200).send("OK");
        }

        if (ucOrder.status === "paid") {
          console.log(` UC order ${orderId} already processed`);
          return res.status(200).send("OK");
        }

        const expectedAmount = Math.round(ucOrder.total_amount * 100);
        if (amount !== expectedAmount) {
          console.warn(
            ` Amount mismatch: expected ₹${ucOrder.total_amount}, got ₹${
              amount / 100
            }`
          );
          return res.status(400).send("Invalid amount");
        }

        const t = await sequelize.transaction();
        try {
          // 1. Update order
          await ucOrder.update(
            {
              status: "paid",
              paid_at: new Date(),
              razorpay_payment_id,
            },
            { transaction: t }
          );

          //  2. Get active (non-expired) credit batches — SAFE alternative
          const activeBatches = await UniversityCreditBatch.findAll({
            where: {
              university_id: ucOrder.university_id,
              [Op.or]: [
                { expires_at: null },
                { expires_at: { [Op.gt]: new Date() } },
              ],
            },
            attributes: ["credits_added", "credits_used"],
            transaction: t,
            raw: true, // faster, no model overhead
          });

          const creditsBefore = activeBatches.reduce(
            (sum, b) => sum + (b.credits_added - b.credits_used),
            0
          );

          const creditsAfter = creditsBefore + ucOrder.credits_purchased;

          // 3. Create new batch
          const expiryDate = ucOrder.validity_days
            ? new Date(Date.now() + ucOrder.validity_days * 24 * 60 * 60 * 1000)
            : null;

          await UniversityCreditBatch.create(
            {
              university_id: ucOrder.university_id,
              order_id: ucOrder.order_id,
              credits_added: ucOrder.credits_purchased,
              credits_used: 0,
              expires_at: expiryDate,
            },
            { transaction: t }
          );

          // 4. Log with non-null integers 
          await CreditLog.create(
            {
              university_id: ucOrder.university_id,
              user_id: null,
              action_type: "purchased",
              credits_before: creditsBefore, //  now safe int
              credits_changed: ucOrder.credits_purchased,
              credits_after: creditsAfter, // 
              reference_type: "credit_order",
              reference_id: ucOrder.order_id,
              description: `Purchased ${ucOrder.credits_purchased} credits (₹${ucOrder.total_amount} incl. GST)`,
            },
            { transaction: t }
          );

          await t.commit();
          console.log(
            `✅ ${ucOrder.credits_purchased} credits added (total: ${creditsAfter}) for university ${ucOrder.university_id}`
          );
          return res.status(200).send("OK");
        } catch (err) {
          await t.rollback();
          console.error(`❌ UC order ${orderId} failed:`, err.message || err);
          return res.status(500).send("Internal Error");
        }
      }

      // ───→ C2. UNIVERSITY NOTIFICATION BOOST CREDITS (unobpay-*)
      if (
        receipt &&
        typeof receipt === "string" &&
        receipt.startsWith("unobpay-")
      ) {
        const payId = parseInt(receipt.split("-")[1], 10);
        if (!payId || Number.isNaN(payId)) {
          console.warn(` Invalid unobpay receipt: ${receipt}`);
          return res.status(200).send("OK");
        }

        const boostPay = await UniversityNotificationPayment.findByPk(payId);

        if (!boostPay) {
          console.warn(` Notification boost payment ${payId} not found`);
          return res.status(200).send("OK");
        }

        if (boostPay.status === "paid") {
          return res.status(200).send("OK");
        }

        const expectedAmount = Math.round(parseFloat(boostPay.amount) * 100);
        if (amount !== expectedAmount) {
          console.warn(
            ` Notification boost amount mismatch: expected ${expectedAmount}, got ${amount}`
          );
          return res.status(400).send("Invalid amount");
        }

        const t = await sequelize.transaction();
        try {
          await boostPay.update(
            {
              status: "paid",
              razorpay_payment_id,
            },
            { transaction: t }
          );

          let creditRow = await UniversityNotificationCredit.findOne({
            where: { university_id: boostPay.university_id },
            transaction: t,
            lock: t.LOCK.UPDATE,
          });

          if (!creditRow) {
            creditRow = await UniversityNotificationCredit.create(
              {
                university_id: boostPay.university_id,
                total_credits: 1000,
                used_credits: 0,
                remaining_credits: 1000,
              },
              { transaction: t }
            );
          }

          await creditRow.update(
            {
              total_credits: creditRow.total_credits + boostPay.credits_added,
              remaining_credits:
                creditRow.remaining_credits + boostPay.credits_added,
            },
            { transaction: t }
          );

          await t.commit();
          console.log(
            ` Notification boost: +${boostPay.credits_added} credits for university ${boostPay.university_id}`
          );
          return res.status(200).send("OK");
        } catch (err) {
          await t.rollback();
          console.error(" Notification boost webhook error:", err);
          return res.status(500).send("Internal Error");
        }
      }

      // D. Unrecognized order
      console.warn(`❓ Unhandled order.paid: receipt=${receipt}`);
      // return res.status(200).send("OK");
    }

    // ────────────────────────────────────────────────────────────────────
    //  2. payment.captured — ONLY for subscriptions (and fallback one-time)
    //     → NO university credits here (receipt not available)
    // ───────────────────────────────────────────────────────────────────────────────────────────────
    if (event === "payment.captured") {
      const paymentEntity = payload.payment.entity;
      const razorpay_payment_id = paymentEntity.id;
      const razorpay_order_id = paymentEntity.order_id;
      const amount = paymentEntity.amount; // paise
      const method = paymentEntity.method;

      // Try to find ONE-TIME order first (your existing flow)
      const oneTimeOrder = await PaymentOrder.findOne({
        where: {
          razorpay_order_id,
          status: "created",
          purchase_type: "one_time_post",
          plan_id: null,
        },
      });

      if (oneTimeOrder) {
        console.log(
          ` Handling one-time payment for order: ${razorpay_order_id}`
        );
        await PaymentTransaction.create({
          order_id: oneTimeOrder.order_id,
          company_id: oneTimeOrder.company_id,
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature: signature,
          amount: parseFloat((amount / 100).toFixed(2)),
          status: "success",
          payment_method: method,
          payment_date: new Date(),
        });

        await oneTimeOrder.update({ status: "paid" });

        const purchase = await OneTimePurchase.create({
          company_id: oneTimeOrder.company_id,
          post_type: oneTimeOrder.post_type,
          job_id: oneTimeOrder.job_id,
          college_ids: oneTimeOrder.college_ids,
          college_count: oneTimeOrder.college_ids
            ? oneTimeOrder.college_ids.length
            : 0,
          amount_paid: oneTimeOrder.total_amount,
          payment_status: "paid",
        });

        await JobPost.update(
          {
            payment_type: "one_time",
            purchase_id: purchase.purchase_id,
            is_college_specific: oneTimeOrder.post_type === "college",
            college_ids: oneTimeOrder.college_ids,
            active_status: oneTimeOrder.post_type === "future" ? 2 : 1,
          },
          { where: { job_id: oneTimeOrder.job_id } }
        );

        console.log(
          ` Job ${oneTimeOrder.job_id} activated via one-time payment`
        );
        return res.status(200).send("OK");
      }

      // ─── 2. SUBSCRIPTION PAYMENTS ───────────────────────────────────
      // If not one-time, check for subscription payment
      const subscriptionOrder = await PaymentOrder.findOne({
        where: {
          razorpay_order_id: null, // subscription payments don’t have razorpay_order_id
          subscription_id: { [Op.not]: null },
          status: "created",
        },
        include: [{ model: CompanySubscription, as: "subscription" }],
      });

      // But better: find via subscription_id in payload (if present)
      let subscriptionId = null;
      if (paymentEntity.notes?.subscription_id) {
        subscriptionId = parseInt(paymentEntity.notes.subscription_id);
      } else if (paymentEntity.description?.includes("Subscription")) {
        // Fallback: parse description (e.g., "Subscription Payment for sub_Rxxyz")
        const match = paymentEntity.description.match(/sub_[A-Za-z0-9]+/);
        if (match) {
          const sub = await CompanySubscription.findOne({
            where: { razorpay_subscription_id: match[0] },
          });
          subscriptionId = sub?.subscription_id;
        }
      }

      if (!subscriptionId && subscriptionOrder) {
        subscriptionId = subscriptionOrder.subscription_id;
      }

      if (subscriptionId) {
        const subscription = await CompanySubscription.findByPk(subscriptionId);
        if (
          subscription &&
          ["pending", "active"].includes(subscription.status)
        ) {
          console.log(
            ` Handling subscription payment for sub: ${subscriptionId}`
          );

          // Log transaction
          await PaymentTransaction.create({
            order_id: subscriptionOrder?.order_id || null,
            company_id: subscription.company_id,
            razorpay_payment_id,
            razorpay_order_id: null, // subscription payments don’t use orders
            razorpay_signature: signature,
            amount: parseFloat((amount / 100).toFixed(2)),
            status: "success",
            payment_method: method,
            payment_date: new Date(),
          });

          // Update payment order (if exists)
          if (subscriptionOrder) {
            await subscriptionOrder.update({
              status: "paid",
              razorpay_order_id: razorpay_payment_id, // reuse field to store payment ID
            });
          }

          // If first payment and subscription still pending → activate
          if (subscription.status === "pending") {
            // We'll handle full activation in `subscription.activated` (more reliable)
            // But log that first payment is done
            console.log(
              ` First payment received for subscription ${subscriptionId}; awaiting activation webhook`
            );
          }

          return res.status(200).send("OK");
        }
      }

      // ─── 4. UNKNOWN PAYMENT — log but don’t fail
      console.warn(
        ` Unrecognized payment.captured: id=${razorpay_payment_id}, order_id=${razorpay_order_id}`
      );
      return res.status(200).send("OK");
    }

    // ─── 3. SUBSCRIPTION EVENTS ─────────────────────────────────────────
    if (event === "subscription.activated") {
      const subscriptionEntity = payload.subscription.entity;
      const razorpay_subscription_id = subscriptionEntity.id; // e.g., 'sub_Rxxyz'

      const subscription = await CompanySubscription.findOne({
        where: { razorpay_subscription_id },
      });

      if (!subscription) {
        console.warn(
          ` Subscription ${razorpay_subscription_id} not found in DB`
        );
        return res.status(200).send("OK");
      }

      if (subscription.status === "active") {
        console.log(` Subscription ${razorpay_subscription_id} already active`);
        return res.status(200).send("OK");
      }

      //  Activate & set dates
      const now = new Date();
      const startDate = subscriptionEntity.start_at
        ? new Date(subscriptionEntity.start_at * 1000)
        : now;

      const currentPeriodStart = startDate;
      const currentPeriodEnd = new Date(startDate);
      const nextBillingDate = new Date(startDate);

      if (subscription.billing_cycle === "monthly") {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
      } else {
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
      }

      await subscription.update({
        status: "active",
        start_date: startDate,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        next_billing_date: nextBillingDate,
        razorpay_customer_id: subscriptionEntity.customer_id, // ensure saved
        updated_at: now,
      });

      console.log(
        ` Subscription ${razorpay_subscription_id} activated for company ${subscription.company_id}`
      );
      return res.status(200).send("OK");
    }

    if (event === "subscription.halted") {
      const { id } = payload.subscription.entity;
      const sub = await CompanySubscription.findOne({
        where: { razorpay_subscription_id: id },
      });
      if (sub) {
        // Set status = 'halted' → implies payment failure
        await sub.update({
          status: "halted",
          updated_at: new Date(),
        });
        console.warn(
          `Subscription ${id} halted due to payment failures. Invoices exist but no auto-charge.`
        );
        // Will Trigger email to user: "Your subscription is on hold — update payment method"
      }
      return res.status(200).send("OK");
    }

    if (event === "subscription.paused") {
      const { id } = payload.subscription.entity;
      const sub = await CompanySubscription.findOne({
        where: { razorpay_subscription_id: id },
      });
      if (sub) {
        // Set status = 'paused' (graceful: keep access till current_period_end)
        await sub.update({
          status: "paused",
          updated_at: new Date(),
        });
        console.log(
          ` Subscription ${id} manually paused. Service access continues until ${sub.current_period_end}`
        );
      }
      return res.status(200).send("OK");
    }

    if (event === "subscription.resumed") {
      const { id } = payload.subscription.entity;
      await CompanySubscription.update(
        { status: "active" },
        { where: { razorpay_subscription_id: id } }
      );
      console.log(` Subscription ${id} resumed`);
      return res.status(200).send("OK");
    }

    if (event === "subscription.cancelled") {
      const { id } = payload.subscription.entity;

      const subscription = await CompanySubscription.findOne({
        where: { razorpay_subscription_id: id },
      });

      if (!subscription) {
        console.warn(`Subscription ${id} not found on cancellation`);
        return res.status(200).send("OK");
      }

      // Use existing cancel_at if set (from graceful cancel), else fall back
      const effectiveCancelAt = subscription.cancel_at
        ? new Date(subscription.cancel_at)
        : subscription.current_period_end
        ? new Date(subscription.current_period_end)
        : new Date();

      await subscription.update({
        status: "cancelled",
        cancelled_at: new Date(),
        cancel_at: effectiveCancelAt,
        updated_at: new Date(),
      });

      console.log(
        `Subscription ${id} fully cancelled (effective: ${effectiveCancelAt.toDateString()})`
      );
      return res.status(200).send("OK");
    }

    if (event === "subscription.completed") {
      const { id } = payload.subscription.entity;
      await CompanySubscription.update(
        {
          status: "expired",
          cancelled_at: new Date(),
        },
        { where: { razorpay_subscription_id: id } }
      );
      console.log(` Subscription ${id} ${"completed"}`);
      return res.status(200).send("OK");
    }

    // ─── 4. UNSUPPORTED EVENTS ──────────────────────────────────────────
    console.log(` Unhandled Razorpay event: ${event}`);
    return res.status(200).send("OK");
  } catch (err) {
    console.error(` Webhook processing failed for event ${event}:`, err);
    return res.status(500).send("Internal Error");
  }
};