// // utils/subscriptionHelper.js
// const { CompanySubscription, Plan,SubscriptionCreditLog } = require("../models");
// const { calculatePrice } = require("./pricingHelper");
// const {Op} =require("sequelize");

// /**
//  * Returns the best (earliest-expiring, eligible) subscription for a given post_type.
//  * Returns null if none eligible.
//  * now supports college type
//  */
// exports.findBestEligibleSubscription = async (
//   company_id,
//   post_type,
//   transaction = null
// ) => {
//   if (post_type === "college") {
//     // Phase 1: college = one-time only
//     return null;
//   }

//   // Fetch all *active* subscriptions (ignore 'pending' for safety)
//   const subscriptions = await CompanySubscription.findAll({
//     where: {
//       company_id,
//       status: "active",
//     },
//     include: [{ model: Plan, as: "plan" }],
//     order: [["current_period_end", "ASC"]], // Soonest expiry first!
//     transaction,
//   });

//   for (const sub of subscriptions) {
//     const plan = sub.plan;
//     if (!plan) continue;

//     const planType = plan.plan_type;
//     if (!planType) continue;

//     // Eligibility rules
//     const isEligible =
//       planType === "both" ||
//       (planType === "active" && post_type === "active") ||
//       (planType === "future" && post_type === "future");

//     if (isEligible && sub.remaining_credits > 0) {
//       return sub; //  First (earliest) eligible one!
//     }
//   }

//   return null; // none eligible
// };

// /**
//  * Full eligibility context for frontend
//  */
// exports.getPostingContext = async (
//   company_id,
//   post_type,
//   opportunity_type,
//   transaction = null
// ) => {
//   const subscription = await exports.findBestEligibleSubscription(
//     company_id,
//     post_type,
//     transaction
//   );

//   let isEligible = !!subscription;
//   let hasCredits = isEligible && subscription?.remaining_credits > 0;
//   let reason = null;

//   if (post_type === "college") {
//     reason = "college_one_time_only";
//   } else if (!subscription) {
//     // Check: are there *any* active subs? (for better error)
//     const anyActive = await CompanySubscription.findOne({
//       where: { company_id, status: "active" },
//       transaction,
//     });
//     reason = anyActive ? "no_credits_or_plan_mismatch" : "no_active_plan";
//   }

//   // One-time price (always available fallback)
//   const { totalAmount } = calculatePrice(post_type);

//   return {
//     post_type,
//     opportunity_type,
//     subscription: subscription
//       ? {
//           id: subscription.subscription_id,
//           plan_name: subscription.plan.plan_name,
//           plan_type: subscription.plan.plan_type,
//           remaining_credits: subscription.remaining_credits,
//           current_period_end: subscription.current_period_end,
//           is_active: true,
//         }
//       : null,
//     eligibility: {
//       is_eligible: isEligible,
//       has_credits: hasCredits,
//       reason,
//       // Actions
//       can_upgrade: true,
//       can_pay_one_time: true,
//       one_time_price: totalAmount,
//     },
//   };
// };

// // utils/subscriptionHelper.js
// exports.useSubscriptionForJob = async ({ job, company_id, post_type, transaction }) => {
//   // 1. Find best (earliest expiring) eligible subscription
//   const subscription = await CompanySubscription.findOne({
//     where: {
//       company_id,
//       status: "active",
//       remaining_credits: { [Op.gt]: 0 },
//     },
//     include: [{ model: Plan, as: "plan" }],
//     order: [["current_period_end", "ASC"]], //  Soonest first!
//     transaction,
//   });

//   if (!subscription) {
//     return null;
//   }

//   const planType = subscription.plan?.plan_type;
//   const isEligible =
//     planType === "both" ||
//     (planType === "active" && post_type === "active") ||
//     (planType === "future" && post_type === "future");

//   if (!isEligible) return null;

//   // 2. Deduct credit atomically
//   const oldCredits = subscription.remaining_credits;
//   const newCredits = oldCredits - 1;

//   await subscription.update(
//     {
//       remaining_credits: newCredits,
//       used_credits: (subscription.used_credits || 0) + 1,
//     },
//     { transaction }
//   );

//   // 3. Log
//   await SubscriptionCreditLog.create(
//     {
//       subscription_id: subscription.subscription_id,
//       company_id: subscription.company_id,
//       action_type: "used",
//       credits_before: oldCredits,
//       credits_changed: -1,
//       credits_after: newCredits,
//       job_id: job.job_id,
//       description: `Job draft created: ${job.job_id} ${post_type}`,
//     },
//     { transaction }
//   );

//   // 4. Link job
//   await job.update(
//     {
//       payment_type: "subscription",
//       subscription_id: subscription.subscription_id,
//     },
//     { transaction }
//   );

//   return {
//     success: true,
//     subscription_id: subscription.subscription_id,
//     plan_name: subscription.plan.plan_name,
//     credits_before: oldCredits,
//     credits_after: newCredits,
//     remaining_credits: newCredits,
//   };
// };























// utils/subscriptionHelper.js
const { sequelize,CompanySubscription, Plan,SubscriptionCreditLog } = require("../models");
const { calculatePrice } = require("./pricingHelper");
const {Op, literal} =require("sequelize");

/**
 * Returns the best (earliest-expiring, eligible) subscription for a given post_type.
 * Returns null if none eligible.
 * now supports college type
 */
exports.findBestEligibleSubscription = async (
  company_id,
  post_type,
  transaction = null
) => {

  // Fetch all *active* subscriptions (ignore 'pending' for safety)
  // Fetch active & non-expired subscriptions
  const subscriptions = await CompanySubscription.findAll({
    where: {
      company_id,
      status: "active",
      current_period_end: { [Op.gte]: new Date().toISOString().split("T")[0] },
    },
    include: [{ model: Plan, as: "plan" }],
    order: [
      ["billing_cycle", "ASC"], // 'one_time' first
      ["current_period_end", "ASC"],
    ],
    transaction,
  });

  for (const sub of subscriptions) {
    const plan = sub.plan;
    if (!plan) continue;

    const planType = plan.plan_type;
    if (!planType) continue;

    //  College posts: only college_credits plans
    if (post_type === "college") {
      if (planType === "college_credits" && sub.remaining_credits > 0) {
        return sub;
      }
      continue;
    }

    // Eligibility rules  Regular posts: active/future/both
    const isEligible =
      planType === "both" ||
      (planType === "active" && post_type === "active") ||
      (planType === "future" && post_type === "future");

    if (isEligible && sub.remaining_credits > 0) {
      return sub; //  First (earliest) eligible one!
    }
  }

  return null; // none eligible
};



/**
 * Deduct college credits for a college-specific job (atomic + safe).
 * Returns { success, credits_used, ... } or null if insufficient.
 */
exports.useCollegeCreditsForJob = async ({
  job,
  company_id,
  college_count,
  transaction,
}) => {
  if (college_count <= 0) return null;

  //  STEP 1: Fetch & validate total available credits
  const creditSubs = await CompanySubscription.findAll({
    where: {
      company_id,
      status: ["active", "paused"],
      plan_id: {
        [Op.in]: sequelize.literal(
          `(SELECT plan_id FROM plans WHERE plan_type = 'college_credits' AND is_active = 1)`
        ),
      },
      current_period_end: { [Op.gte]: new Date().toISOString().split("T")[0] },
      remaining_credits: { [Op.gt]: 0 },
    },
    include: [{ model: Plan, as: "plan" }],
    order: [["created_at", "ASC"], ["current_period_end", "ASC"]],
    transaction,
  });

  const totalAvailable = creditSubs.reduce(
    (sum, s) => sum + s.remaining_credits,
    0
  );

  if (totalAvailable < college_count) {
    return null; //  fail early — no DB writes
  }

  //  STEP 2: Deduct credits across subscriptions
  let remaining = college_count;
  const usedSubs = [];

  for (const sub of creditSubs) {
    if (remaining <= 0) break;
    const usable = Math.min(sub.remaining_credits, remaining);

    const newRemaining = sub.remaining_credits - usable;
    const newUsed = (sub.used_credits || 0) + usable;

    await sub.update(
      {
        remaining_credits: newRemaining,
        used_credits: newUsed,
        status: newRemaining === 0 ? "completed" : sub.status,
      },
      { transaction }
    );

    await SubscriptionCreditLog.create(
      {
        subscription_id: sub.subscription_id,
        company_id: sub.company_id,
        action_type: "used",
        credits_before: sub.remaining_credits + usable,
        credits_changed: -usable,
        credits_after: newRemaining,
        job_id: job.job_id,
        description: `College job posted: ${college_count} colleges, used ${usable} credits`,
      },
      { transaction }
    );

    usedSubs.push({
      subscription_id: sub.subscription_id,
      plan_name: sub.plan?.plan_name,
      credits_used: usable,
      remaining_after: newRemaining,
    });

    remaining -= usable;
  }

  //  STEP 3: Link job to first subscription
  const firstSubId = usedSubs[0]?.subscription_id;
  if (firstSubId) {
    await job.update(
      { payment_type: "subscription", subscription_id: firstSubId ,is_college_specific: job.post_type === "college",
        active_status: 1
      },
      { transaction }
    );
  }

  return {
    success: true,
    credits_used: college_count,
    remaining_credits_total: totalAvailable - college_count,
    subscriptions_used: usedSubs,
  };
};



/**
 * Use standard (active/future) subscription for job.
 */
exports.useSubscriptionForJob = async ({
  job,
  company_id,
  post_type,
  transaction,
}) => {
  const subscription = await exports.findBestEligibleSubscription(
    company_id,
    post_type,
    transaction
  );

  if (!subscription) return null;

  const oldCredits = subscription.remaining_credits;
  const newCredits = oldCredits - 1;

  await subscription.update(
    {
      remaining_credits: newCredits,
      used_credits: (subscription.used_credits || 0) + 1,
    },
    { transaction }
  );

  await SubscriptionCreditLog.create(
    {
      subscription_id: subscription.subscription_id,
      company_id: subscription.company_id,
      action_type: "used",
      credits_before: oldCredits,
      credits_changed: -1,
      credits_after: newCredits,
      job_id: job.job_id,
      description: `Job draft created: ${job.job_id} ${post_type}`,
    },
    { transaction }
  );

  await job.update(
    {
      payment_type: "subscription",
      subscription_id: subscription.subscription_id,
      active_status: post_type !== "future" ? 1 : 2,
    },
    { transaction }
  );

  return {
    success: true,
    subscription_id: subscription.subscription_id,
    plan_name: subscription.plan.plan_name,
    credits_before: oldCredits,
    credits_after: newCredits,
    remaining_credits: newCredits,
  };
};


/**
 * Full eligibility context (for frontend).
 */
exports.getPostingContext = async (
  company_id,
  post_type,
  opportunity_type,
  transaction = null
) => {
  // For college: check credit balance
  if (post_type === "college") {
    const creditSubs = await CompanySubscription.findAll({
      where: {
        company_id,
        status: ["active", "paused"],
        plan_id: {
          [Op.in]: sequelize.literal(
            `(SELECT plan_id FROM plans WHERE plan_type = 'college_credits' AND is_active = 1)`
          ),
        },
        current_period_end: {
          [Op.gte]: new Date().toISOString().split("T")[0],
        },
      },
      transaction,
    });

    const totalCredits = creditSubs.reduce(
      (sum, s) => sum + s.remaining_credits,
      0
    );

    return {
      post_type,
      opportunity_type,
      subscription: null,
      eligibility: {
        is_eligible: true, // college always allowed
        has_credits: totalCredits > 0,
        reason: totalCredits > 0 ? null : "no_college_credits",
        can_upgrade: true,
        can_pay_one_time: true,
        one_time_price: 0, // will be calculated per college count
      },
      college_credits_available: totalCredits,
    };
  }

  // For active/future: existing logic
  const subscription = await exports.findBestEligibleSubscription(
    company_id,
    post_type,
    transaction
  );

  // const { totalAmount } = calculatePrice(post_type);

  // For active/future: existing logic — updated to include promo
  const pricing = calculatePrice(post_type); // now returns promo fields
  console.log("the pricing");

  return {
    post_type,
    opportunity_type,
    subscription: subscription
      ? {
          id: subscription.subscription_id,
          plan_name: subscription.plan.plan_name,
          plan_type: subscription.plan.plan_type,
          remaining_credits: subscription.remaining_credits,
          current_period_end: subscription.current_period_end,
          is_active: true,
        }
      : null,
    eligibility: {
      is_eligible: !!subscription,
      has_credits: !!subscription && subscription.remaining_credits > 0,
      reason: !subscription
        ? "no_active_plan"
        : subscription.remaining_credits === 0
        ? "no_credits"
        : null,
      can_upgrade: true,
      can_pay_one_time: true,
      one_time_price: pricing.totalAmount,
      // promo metadata for UI
      is_promo_active: pricing.promo_active || false,
      original_one_time_price: pricing.originalBaseAmount || null,
      promo_reason: pricing.promo_reason || null,
    },
  };
};