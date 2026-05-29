// controllers/subscriptionController.js
const { razorpay } = require("../config/razorpay");
const {
  Plan,
  CompanyRecruiterProfile,
  User,
  CompanySubscription,
  PaymentOrder,
  JobPost,
} = require("../models");

const { Op } = require("sequelize");

// ─── 1. LIST AVAILABLE PLANS ────────────────────────────────────────
exports.getPlans = async (req, res) => {
  const allowedPlanTypes = ["active", "future", "both"];
  try {
    const plans = await Plan.findAll({
      where: {
        is_active: true,
        is_visible: true,
        plan_type: allowedPlanTypes // dont allow college oro college_credits
        
      },
      attributes: [
        "plan_id",
        "plan_name",
        "plan_slug",
        "plan_type",
        "description",
        "monthly_price",
        "yearly_price",
        "monthly_credits",
        "yearly_credits",
        "features",
        "is_featured",
        "display_order",
      ],
      order: [["display_order", "ASC"]],
    });

    const formattedPlans = plans.map((p) => {
      const features = p.features || {};

      if (p.plan_type === "college_credits") {
        return {
          id: p.plan_id,
          name: p.plan_name,
          slug: p.plan_slug,
          type: "college_credits",
          description: p.description,
          credits: p.yearly_credits,
          price: parseFloat(p.yearly_price),
          tax_included: false,
          expiry_days: p.features?.expiry_days || 180,
          is_featured: p.is_featured,
          display_order: p.display_order,
        };
      }
      
      return {
        id: p.plan_id,
        name: p.plan_name,
        slug: p.plan_slug,
        type: p.plan_type, // "active", "future", "both"
        description: p.description,
        features: {
          support: features.support || "standard",
          auto_renew: features.auto_renew !== false,
          analytics: !!features.analytics,
          custom_dates: !!features.custom_dates,
          reminders: !!features.reminders,
          api_access: !!features.api_access,
        },
        monthly: p.monthly_price
          ? {
              price: parseFloat(p.monthly_price),
              credits: p.monthly_credits,
              savings: p.yearly_price
                ? parseFloat(
                    (1 - p.monthly_price * 12 / p.yearly_price) * 100
                  ).toFixed(1)
                : null,
            }
          : null,
        yearly: p.yearly_price
          ? {
              price: parseFloat(p.yearly_price),
              credits: p.yearly_credits,
              savings: p.monthly_price
                ? parseFloat(
                    (1 - p.yearly_price / (p.monthly_price * 12)) * 100
                  ).toFixed(1)
                : null,
            }
          : null,
        is_featured: p.is_featured,
      };
    });

    res.status(200).json({
      success: true,
      plans: formattedPlans,
    });
  } catch (error) {
    console.error("Plan fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch plans",
      error: error.message,
    });
  }
};

// ─── 2. INITIATE SUBSCRIPTION (Razorpay + DB) ───────────────────────
exports.initiateSubscription = async (req, res) => {
  const { plan_id, billing_cycle } = req.body; // e.g. { plan_id: 1, billing_cycle: "monthly" }
  const user_id = req.user.id;

  if (!user_id) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. User ID not found.",
    });
  }

  try {
    //  Validate user role
    const user = await User.findOne({
      where: { id: user_id, user_role: "COMPANY" },
    });
    if (!user) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized. Only companies can subscribe.",
      });
    }

    // Get company profile
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

    //  Fetch plan
    const plan = await Plan.findOne({
      where: { plan_id, is_active: true },
    });
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found or inactive.",
      });
    }

    //  Validate billing_cycle
    if (!["monthly", "yearly"].includes(billing_cycle)) {
      return res.status(400).json({
        success: false,
        message: "Invalid billing_cycle. Must be 'monthly' or 'yearly'.",
      });
    }

    //  Get price & credits
    const amount =
      billing_cycle === "monthly" ? plan.monthly_price : plan.yearly_price;
    const credits =
      billing_cycle === "monthly" ? plan.monthly_credits : plan.yearly_credits;
    const razorpayPlanId =
      billing_cycle === "monthly"
        ? plan.razorpay_plan_id_monthly
        : plan.razorpay_plan_id_yearly;

    if (!amount || !credits || !razorpayPlanId) {
      return res.status(400).json({
        success: false,
        message: `Plan does not support ${billing_cycle} billing.`,
      });
    }

    //  Prevent duplicate active subscription (optional safety)
    const existingActive = await CompanySubscription.findOne({
      where: {
        company_id,
        plan_id: plan.plan_id,
        billing_cycle,
        status: ["active"],
      },
    });
    if (existingActive) {
      return res.status(409).json({
        success: false,
        message:
          "You already have an active/pending subscription for this plan & cycle.",
        subscription_id: existingActive.subscription_id,
      });
    }

    //  Create Razorpay Customer (if first time)
    let razorpay_customer_id = companyProfile.razorpay_customer_id;
    if (!razorpay_customer_id) {
      const customer = await razorpay.customers.create({
        name:
          companyProfile.company_name || user.first_name + " " + user.last_name,
        email: user.email,
        contact: user.phone,
        fail_existing: 0, // don’t fail if duplicate email/phone
      });
      razorpay_customer_id = customer.id;

      // Save to profile (optional, for future use)
      await companyProfile.update({ razorpay_customer_id });
    }

    //  Create Razorpay Subscription

    //making it to 0  but now the new rzp api dows not allow 0 as we want to keep it recurring...0 not allowed now

    const rzpSubscription = await razorpay.subscriptions.create({
      plan_id: razorpayPlanId,
      customer_id: razorpay_customer_id,
      total_count: 100,
      customer_notify: true,
      // total_count: billing_cycle === "yearly" ? 1 : 12, // yearly = 1 charge; monthly = 12 cycles (auto-renews unless canceled)
      quantity: 1,
      notes: {
        company_id,
        plan_id: plan.plan_id,
        user_id,
        billing_cycle,
      },
    });

    console.log("rzpsubscription",rzpSubscription)

    // Create  subscription in DB
    const subscription = await CompanySubscription.create({
      company_id,
      plan_id: plan.plan_id,
      razorpay_subscription_id: rzpSubscription.id,
      razorpay_plan_id: razorpayPlanId,
      razorpay_customer_id,
      billing_cycle,
      status: "created",
      
      total_credits: credits,
      used_credits: 0,
      remaining_credits: credits,
      college_count: 0,
      college_ids: null,
      amount_per_cycle: amount,
      auto_renew: true,
      metadata: {
        plan_name: plan.plan_name,
        plan_slug: plan.plan_slug,
        billing_cycle,
        created_via: "web",
      },
    });

    //  Optional: Log initial payment intent in PaymentOrder (for audit)
    await PaymentOrder.create({
      company_id,
      purchase_type: "subscription",
      plan_id: plan.plan_id,
      billing_cycle,
      amount: amount,
      tax_amount: 0, // subscriptions are pre-tax; GST handled in first invoice
      total_amount: amount,
      razorpay_order_id: null, // not an order — it's a subscription
      subscription_id: subscription.subscription_id,
      is_subscription_payment: 1,
      status: "created", // will update to 'paid' on webhook
    });

    // Response for frontend checkout
    res.status(200).json({
      success: true,
      subscription_id: subscription.subscription_id,
      razorpay_subscription_id: rzpSubscription.id,
      short_url: rzpSubscription.short_url, // redirect user here
      plan: {
        id: plan.plan_id,
        name: plan.plan_name,
        type: plan.plan_type,
        billing_cycle,
        amount: parseFloat(amount),
        credits,
      },
      message:
        "Subscription initiated. Redirect user to short_url to complete payment.",
    });
  } catch (error) {
    console.error("Subscription initiation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initiate subscription",
      error: error.message,
    });
  }
};


// GET /api/subscription/status/:subscription_id
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const { subscription_id } = req.params;
    const sub = await CompanySubscription.findOne({
      where: { razorpay_subscription_id:subscription_id },
      include: [{ model: Plan, as:"plan",  attributes: ["plan_name", "plan_slug"] }],
    });

    if (!sub) {
      return res.status(404).json({ success: false, message: "Subscription not found" });
    }

    res.json({
      success: true,
      subscription: {
        subscription_id: sub.subscription_id,
        status: sub.status,
        plan_id: sub.plan_id,
        plan_name: sub.Plan?.plan_name,
        billing_cycle: sub.billing_cycle,
        amount_per_cycle: sub.amount_per_cycle,
        total_credits: sub.total_credits,
        remaining_credits: sub.remaining_credits,
        auto_renew: sub.auto_renew,
        created_at: sub.created_at,
        activated_at: sub.activated_at,
        next_billing_at: sub.next_billing_at,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};



// Pause an active subscription
exports.pauseSubscription = async (req, res) => {
  const { razorpaySubscriptionId } = req.body; 
  const user_id = req.user.id;

  if (!razorpaySubscriptionId) {
    return res.status(400).json({
      success: false,
      message: "razorpaySubscriptionId is required",
    });
  }

  try {
    // Fetch subscription + company profile for auth & data
    const subscription = await CompanySubscription.findOne({
      where: {
        razorpay_subscription_id: razorpaySubscriptionId,
        status: "active", // only allow pause if active
      },
      include: [
        {
          model: CompanyRecruiterProfile,
          as: "company",
          attributes: ["id", "user_id"],
        },
      ],
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Active subscription not found, or already paused/cancelled",
      });
    }

    // Verify ownership
    if (subscription.company.user_id !== user_id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: Subscription does not belong to this user",
      });
    }

    // Calling Razorpay to pause (halt future billing)
    // Razorpay will fire `subscription.paused` webhook shortly
    await razorpay.subscriptions.pause(razorpaySubscriptionId);

    // not updating the db will update during webhook handling — wait for webhook for consistency
    // But we can optimistically return success

    return res.status(200).json({
      success: true,
      message:
        "Subscription pause requested. You'll retain access until the end of your current billing period.",
      data: {
        razorpay_subscription_id: razorpaySubscriptionId,
        status: "pending_pause", 
        current_period_end: subscription.current_period_end,
      },
    });
  } catch (error) {
    console.error(
      `Failed to pause subscription ${razorpaySubscriptionId}:`,
      error
    );

    // Handle common errors
    if (
      error.statusCode === 400 &&
      error.description?.includes("already paused")
    ) {
      return res.status(400).json({
        success: false,
        message: "Subscription is already paused or not in active state.",
      });
    }

    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: "Razorpay subscription not found. It may have been cancelled.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to pause subscription. Please try again or contact support.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Resume a paused subscription
exports.resumeSubscription = async (req, res) => {
  const { razorpaySubscriptionId } = req.body;
  const user_id = req.user.id;

  if (!razorpaySubscriptionId) {
    return res.status(400).json({
      success: false,
      message: "razorpaySubscriptionId is required",
    });
  }

  try {
    const subscription = await CompanySubscription.findOne({
      where: {
        razorpay_subscription_id: razorpaySubscriptionId,
        status: "paused", // only allow resume if manually paused
      },
      include: [
        {
          model: CompanyRecruiterProfile,
          as: "company",
          attributes: ["id", "user_id"],
        },
      ],
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message:
          "Paused subscription not found. It may already be active or cancelled.",
      });
    }

    if (subscription.company.user_id !== user_id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    //  Resume via Razorpay
    await razorpay.subscriptions.resume(razorpaySubscriptionId);

    return res.status(200).json({
      success: true,
      message:
        "Subscription resumed. Next billing cycle will be charged as scheduled.",
      data: {
        razorpay_subscription_id: razorpaySubscriptionId,
        status: "pending_resume", // wait for `subscription.resumed` webhook
        next_billing_date: subscription.next_billing_date,
      },
    });
  } catch (error) {
    console.error(
      ` Failed to resume subscription ${razorpaySubscriptionId}:`,
      error
    );

    if (
      error.statusCode === 400 &&
      error.description?.includes("already active")
    ) {
      return res.status(400).json({
        success: false,
        message: "Subscription is already active.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to resume subscription. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};


// controllers/subscriptionController.js
exports.cancelSubscription = async (req, res) => {
  const { 
    razorpaySubscriptionId,
    cancelImmediately = false // default: graceful (at cycle end)
  } = req.body;

  const user_id = req.user.id;

  if (!razorpaySubscriptionId) {
    return res.status(400).json({
      success: false,
      message: "razorpaySubscriptionId is required"
    });
  }

  try {
    // Fetch subscription + ownership
    const subscription = await CompanySubscription.findOne({
      where: { 
        razorpay_subscription_id: razorpaySubscriptionId,
        status: {
          [Op.in]: ['active', 'paused', 'halted', 'cancelling'] // allow cancel from these
        }
      },
      include: [{
        model: CompanyRecruiterProfile,
        as: 'company',
        attributes: ['id', 'user_id']
      }]
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found or already cancelled/completed"
      });
    }

    if (subscription.company.user_id !== user_id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized access"
      });
    }

    //  Prevent duplicate cancellation requests
    if (subscription.status === 'cancelling' && !cancelImmediately) {
      return res.status(400).json({
        success: false,
        message: `Already scheduled for cancellation on ${subscription.cancel_at || subscription.current_period_end}.`
      });
    }

    //  Determine effective end date
    const effectiveEnd = subscription.current_period_end 
      ? new Date(subscription.current_period_end)
      : new Date();

    //  Call Razorpay
    // cancel_at_cycle_end: true → charge stops after current period
    // cancel_at_cycle_end: false → immediate cancellation
    await razorpay.subscriptions.cancel(razorpaySubscriptionId, {
      cancel_at_cycle_end: !cancelImmediately
    });

    //  Update local DB
    if (cancelImmediately) {
      // Immediate cancellation: revoke access now
      await subscription.update({
        status: 'cancelled',
        cancelled_at: new Date(),
        cancel_at: effectiveEnd, // still record when it *would* have ended
        updated_at: new Date()
      });

      // Optional: Revoke active sessions / jobs
      // await JobPost.update({ active_status: 0 }, { where: { subscription_id: subscription.subscription_id } });

    } else {
      // Graceful cancellation: stay active until period end
      await subscription.update({
        status: 'cancelling',
        cancel_at: effectiveEnd,   //  Key: when access ends
        // cancelled_at remains NULL until webhook
        updated_at: new Date()
      });
    }

    //  Message for user
    const endDateStr = effectiveEnd.toLocaleDateString('en-IN');
    const message = cancelImmediately
      ? `Subscription cancelled immediately. Access revoked.`
      : `Subscription scheduled for cancellation on ${endDateStr}. You'll retain full access until then.`;

    return res.status(200).json({
      success: true,
      message,
      data: {
        razorpay_subscription_id: razorpaySubscriptionId,
        status: cancelImmediately ? 'cancelled' : 'cancelling',
        cancel_at: effectiveEnd.toISOString().split('T')[0], // YYYY-MM-DD
        ends_at: endDateStr
      }
    });

  } catch (error) {
    console.error(` Failed to cancel ${razorpaySubscriptionId}:`, error);

    // Handle known Razorpay errors
    const errMsg = error.description || error.message;
    if (errMsg?.includes('already cancelled')) {
      return res.status(400).json({
        success: false,
        message: "Subscription is already cancelled or completed."
      });
    }
    if (errMsg?.includes('cannot be cancelled')) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel this subscription (e.g., trial, completed)."
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to cancel subscription. Please try again or contact support.",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
