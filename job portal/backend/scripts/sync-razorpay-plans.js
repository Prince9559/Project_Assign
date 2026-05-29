// // scripts/sync-razorpay-plans.js
const { Plan } = require("../models");
const { razorpay } = require("../config/razorpay");

async function createRazorpayPlan(
  planName,
  amount,
  period,
  description,
  notes
) {
  try {
    const plan = await razorpay.plans.create({
      period: period, // 'monthly' or 'yearly'
      interval: 1,

      item: {
        name: planName,
        description: description,
        amount: Math.round(amount * 100), // INR → paise
        currency: "INR",
      },
      notes: notes,
    });
    console.log(`Created Razorpay ${period} plan: ${plan.id} (${planName})`);
    return plan.id;
  } catch (err) {
    console.error(
      ` Failed to create ${period} plan for ${planName}:`,
      err.message
    );
    throw err;
  }
}

async function syncPlans() {
  console.log(" Fetching active plans...");
  const plans = await Plan.findAll({
    where: { is_active: true },
    attributes: [
      "plan_id",
      "plan_name",
      "plan_slug",
      "monthly_price",
      "yearly_price",
      "description",
    ],
  });

  for (const plan of plans) {
    let needsUpdate = false;
    let updates = {};

    // Monthly Plan
    if (plan.monthly_price && !plan.razorpay_plan_id_monthly) {
      console.log(`\n Creating monthly Razorpay plan for: ${plan.plan_name}`);
      const rzpId = await createRazorpayPlan(
        `${plan.plan_name} (Monthly)`,
        plan.monthly_price,
        "monthly",
        `Monthly subscription for ${plan.plan_name}`,
        {
          plan_slug: `${plan.plan_slug}-monthly`,
          internal_plan_id: plan.plan_id,
        }
      );
      updates.razorpay_plan_id_monthly = rzpId;
      needsUpdate = true;
    }

    // Yearly Plan
    if (plan.yearly_price && !plan.razorpay_plan_id_yearly) {
      console.log(` Creating yearly Razorpay plan for: ${plan.plan_name}`);
      const rzpId = await createRazorpayPlan(
        `${plan.plan_name} (Yearly)`,
        plan.yearly_price,
        "yearly",
        `Annual subscription for ${plan.plan_name}`,
        {
          plan_slug: `${plan.plan_slug}-yearly`,
          internal_plan_id: plan.plan_id,
        }
      );
      updates.razorpay_plan_id_yearly = rzpId;
      needsUpdate = true;
    }

    if (needsUpdate) {
      await plan.update(updates);
      console.log(` Updated plan: ${plan.plan_name}`);
    } else {
      console.log(` Plan already synced: ${plan.plan_name}`);
    }
  }

  console.log("\n All plans synced with Razorpay!");
  process.exit(0);
}

// Run if called directly
if (require.main === module) {
  syncPlans().catch((err) => {
    console.error(" Sync failed:", err);
    process.exit(1);
  });
}

module.exports = { syncPlans };




// // // Add this helper to update plan visibility (if needed)
// // async function ensurePlanIsPublic(planId) {
// //   try {
// //     const rzpPlan = await razorpay.plans.fetch(planId);
// //     if (!rzpPlan.public) {
// //       console.log(`  Plan ${planId} is private. Making it public...`);
// //       // Use edit to toggle visibility
// //       await razorpay.plans.edit(planId, { public: true });
// //       console.log(`   Plan ${planId} is now public.`);
// //     } else {
// //       console.log(`  Plan ${planId} is already public.`);
// //     }
// //   } catch (err) {
// //     console.warn(` Could not verify/update visibility for ${planId}:`, err.message);
// //   }
// // }

// // async function createRazorpayPlan(
// //   planName,
// //   amount,
// //   period,
// //   description,
// //   notes
// // ) {
// //   try {
// //     // ✅ Add `public: true` here
// //     const plan = await razorpay.plans.create({
// //       period: period,
// //       interval: 1,
// //       public: true, // ← CRITICAL FIX
// //       item: {
// //         name: planName,
// //         description: description,
// //         amount: Math.round(amount * 100),
// //         currency: "INR",
// //       },
// //       notes: notes,
// //     });
// //     console.log(`✅ Created ${period} plan: ${plan.id}`);
// //     return plan.id;
// //   } catch (err) {
// //     console.error(`❌ Failed to create ${period} plan:`, err.message);
// //     throw err;
// //   }
// // }

// // // async function syncPlans() {
// // //   console.log(" Fetching active plans...");
// // //   const plans = await Plan.findAll({
// // //     where: { is_active: true },
// // //     attributes: [
// // //       "plan_id",
// // //       "plan_name",
// // //       "plan_slug",
// // //       "monthly_price",
// // //       "yearly_price",
// // //       "description",
// // //       "razorpay_plan_id_monthly",  // ← include existing IDs
// // //       "razorpay_plan_id_yearly",
// // //     ],
// // //   });

// // //   for (const plan of plans) {
// // //     let needsUpdate = false;
// // //     let updates = {};

// // //     // ✅ Retroactively fix existing plans: make them public
// // //     if (plan.razorpay_plan_id_monthly) {
// // //       console.log(`\n Checking monthly plan visibility for: ${plan.plan_name}`);
// // //       await ensurePlanIsPublic(plan.razorpay_plan_id_monthly);
// // //     }
// // //     if (plan.razorpay_plan_id_yearly) {
// // //       console.log(` Checking yearly plan visibility for: ${plan.plan_name}`);
// // //       await ensurePlanIsPublic(plan.razorpay_plan_id_yearly);
// // //     }

// // //     // Create missing plans (now with public: true)
// // //     if (plan.monthly_price && !plan.razorpay_plan_id_monthly) {
// // //       console.log(`\n Creating monthly plan for: ${plan.plan_name}`);
// // //       const rzpId = await createRazorpayPlan(
// // //         `${plan.plan_name} (Monthly)`,
// // //         plan.monthly_price,
// // //         "monthly",
// // //         `Monthly subscription for ${plan.plan_name}`,
// // //         {
// // //           plan_slug: `${plan.plan_slug}-monthly`,
// // //           internal_plan_id: plan.plan_id,
// // //         }
// // //       );
// // //       updates.razorpay_plan_id_monthly = rzpId;
// // //       needsUpdate = true;
// // //     }

// // //     if (plan.yearly_price && !plan.razorpay_plan_id_yearly) {
// // //       console.log(` Creating yearly plan for: ${plan.plan_name}`);
// // //       const rzpId = await createRazorpayPlan(
// // //         `${plan.plan_name} (Yearly)`,
// // //         plan.yearly_price,
// // //         "yearly",
// // //         `Annual subscription for ${plan.plan_name}`,
// // //         {
// // //           plan_slug: `${plan.plan_slug}-yearly`,
// // //           internal_plan_id: plan.plan_id,
// // //         }
// // //       );
// // //       updates.razorpay_plan_id_yearly = rzpId;
// // //       needsUpdate = true;
// // //     }

// // //     if (needsUpdate) {
// // //       await plan.update(updates);
// // //       console.log(` ✅ Updated DB: ${plan.plan_name}`);
// // //     } else {
// // //       console.log(` ℹ️ No DB update needed for: ${plan.plan_name}`);
// // //     }
// // //   }

// // //   console.log("\n 🎉 All plans synced and ensured PUBLIC!");
// // //   process.exit(0);
// // // }
// // // // Run if called directly
// // // if (require.main === module) {
// //   syncPlans().catch((err) => {
// //     console.error(" Sync failed:", err);
// //     process.exit(1);
// //   });
// // // }


// // async function syncPlans() {
// //   console.log(" Fetching active plans...");
// //   const plans = await Plan.findAll({
// //     where: { is_active: true },
// //     attributes: [
// //       "plan_id",
// //       "plan_name",
// //       "plan_slug",
// //       "monthly_price",
// //       "yearly_price",
// //       "description",
// //       "razorpay_plan_id_monthly",
// //       "razorpay_plan_id_yearly",
// //     ],
// //   });

// //   for (const plan of plans) {
// //     let needsUpdate = false;
// //     let updates = {};

// //     // Helper: Recreate a plan as public (if private or missing)
// //     const recreatePlanIfNeeded = async (type, price, existingPlanId) => {
// //       if (!price) return null;

// //       let planId = existingPlanId;

// //       // Check if existing plan is private (or invalid)
// //       if (planId) {
// //         try {
// //           const rzpPlan = await razorpay.plans.fetch(planId);
// //           if (!rzpPlan.public) {
// //             console.log(
// //               `  ${type} plan is private. Recreating as public...`
// //             );
// //             // We cannot edit → delete & recreate
// //             try {
// //               await razorpay.plans.delete(planId); //  This method exists!
// //               console.log(` Deleted old private plan: ${planId}`);
// //             } catch (delErr) {
// //               console.warn(`   Could not delete ${planId}:`, delErr.message);
// //             }
// //             planId = null; // force recreate
// //           } else {
// //             console.log(`   ${type} plan is already public.`);
// //             return planId;
// //           }
// //         } catch (err) {
// //           console.warn(`  Could not fetch plan ${planId}:`, err.message);
// //           planId = null; // assume invalid → recreate
// //         }
// //       }

// //       // Recreate if needed
// //       if (!planId) {
// //         console.log(`  Creating new public ${type.toLowerCase()} plan...`);
// //         const newPlanId = await createRazorpayPlan(
// //           `${plan.plan_name} (${type})`,
// //           price,
// //           type.toLowerCase(), // 'monthly' or 'yearly'
// //           `${type} subscription for ${plan.plan_name}`,
// //           {
// //             plan_slug: `${plan.plan_slug}-${type.toLowerCase()}`,
// //             internal_plan_id: plan.plan_id,
// //           }
// //         );
// //         return newPlanId;
// //       }

// //       return planId;
// //     };

// //     // Process monthly
// //     if (plan.monthly_price) {
// //       console.log(`\n Checking monthly plan for: ${plan.plan_name}`);
// //       const newMonthlyId = await recreatePlanIfNeeded(
// //         "Monthly",
// //         plan.monthly_price,
// //         plan.razorpay_plan_id_monthly
// //       );
// //       if (newMonthlyId !== plan.razorpay_plan_id_monthly) {
// //         updates.razorpay_plan_id_monthly = newMonthlyId;
// //         needsUpdate = true;
// //       }
// //     }

// //     // Process yearly
// //     if (plan.yearly_price) {
// //       console.log(` Checking yearly plan for: ${plan.plan_name}`);
// //       const newYearlyId = await recreatePlanIfNeeded(
// //         "Yearly",
// //         plan.yearly_price,
// //         plan.razorpay_plan_id_yearly
// //       );
// //       if (newYearlyId !== plan.razorpay_plan_id_yearly) {
// //         updates.razorpay_plan_id_yearly = newYearlyId;
// //         needsUpdate = true;
// //       }
// //     }

// //     // Save updated IDs to DB
// //     if (needsUpdate) {
// //       await plan.update(updates);
// //       console.log(
// //         ` ✅ Updated DB with new public plan IDs for: ${plan.plan_name}`
// //       );
// //     } else {
// //       console.log(` ℹ️ No changes needed for: ${plan.plan_name}`);
// //     }
// //   }

// //   console.log("\n 🎉 All plans are now PUBLIC and synced!");
// //   process.exit(0);
// // }

// module.exports = { syncPlans };