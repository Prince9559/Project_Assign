//job posting for one time price calculator

//utils/pricingHelper.js

const PROMO_CONFIG = {
  future: {
    is_active: true, //  toggle to false after 1 year
    start_date: new Date("2025-12-10"), // today’s date
    end_date: new Date("2026-12-10"), // exactly 1 year
    original_base: 2500, //  real price — for strikethrough
    promo_base: 0, // ₹0 during promo
    reason: "Free for 1 year (AI training)",
  },
};

// Update calculatePrice()
// function calculatePrice(post_type, collegeCount = 0) {
//   const taxRate = 0.18;

//   //  Promo check for 'future'
//   let baseAmount, originalBaseAmount;
//   if (post_type === "future" && PROMO_CONFIG.future.is_active) {
//     const now = new Date();
//     const promo = PROMO_CONFIG.future;
//     if (now >= promo.start_date && now <= promo.end_date) {
//       baseAmount = promo.promo_base; // 0
//       originalBaseAmount = promo.original_base; // 2500
//     } else {
//       // Fallback: deactivate promo & use normal price
//       baseAmount = PRICING_CONFIG.future.base;
//       originalBaseAmount = null;
//     }
//   } else {
//     // Non-future or promo off → normal pricing
//     baseAmount = calculateBaseAmount(post_type, collegeCount);
//     originalBaseAmount = null; // no strikethrough
//   }

//   const taxAmount = parseFloat((baseAmount * taxRate).toFixed(2));
//   const totalAmount = parseFloat((baseAmount + taxAmount).toFixed(2));

//   return {
//     baseAmount,
//     taxAmount,
//     totalAmount,
//     originalBaseAmount, // for strikethrough UI
//     promo_active: originalBaseAmount !== null,
//     promo_reason: originalBaseAmount ? PROMO_CONFIG.future.reason : null,
//     collegeCount,
//     tierLabel: post_type === "college" ? getCollegeTier(collegeCount)?.label : null,
//   };
// }

function calculateJobPostPrice(post_type, collegeCount = 0) {
  const taxRate = 0.18; // 18% GST

  let baseAmount = 0;

  if (post_type === "active") {
    baseAmount = 499;
  } else if (post_type === "future") {
    baseAmount = 799;
  } else if (post_type === "college") {
    if (collegeCount <= 0) {
      throw new Error(
        "At least one college is required for college-specific posts."
      );
    }
    baseAmount = 999 + collegeCount * 200;
  } else {
    throw new Error(
      "Invalid post_type. Must be 'active', 'future', or 'college'."
    );
  }

  const taxAmount = parseFloat((baseAmount * taxRate).toFixed(2));
  const totalAmount = parseFloat((baseAmount + taxAmount).toFixed(2));

  return {
    baseAmount,
    taxAmount,
    totalAmount,
    collegeCount,
  };
}


module.exports = {
  calculateJobPostPrice,
};


const TAX_RATE = 0.18; // 18% GST — can be moved to env/config

//  PRICING CONFIG — move to DB later if needed
const PRICING_CONFIG = {
  active: {
    base: 2000,
  },
  future: {
    base: 2500,
  },
  college: {
    tiers: [
      { min: 1, max: 1, flat_rate: 2000, label: "Starter" },
      { min: 2, max: 4, flat_rate: 4500, label: "Popular" },
      { min: 5, max: 7, flat_rate: 7500, label: "Smart" },
      { min: 8, max: 10, flat_rate: 10000, label: "Best Value" },
      { 
        min: 11, 
        max: null, 
        base: 10000, 
        increment_per_college: 1500, 
        label: "Enterprise" 
      },
    ],
  },
};

// 🔹 Helper: Get tier for college count
function getCollegeTier(collegeCount, config = PRICING_CONFIG.college) {
  if (collegeCount <= 0) {
    throw new Error("At least 1 college required");
  }
  const tier = config.tiers.find(t => 
    collegeCount >= t.min && (t.max === null || collegeCount <= t.max)
  );
  if (!tier) {
    throw new Error(`No pricing tier defined for ${collegeCount} colleges`);
  }
  return tier;
}

//  Helper: Calculate base amount (pre-GST)
function calculateBaseAmount(post_type, collegeCount = 0) {
  switch (post_type) {
    case "active":
      return PRICING_CONFIG.active.base;
    case "future":
      return PRICING_CONFIG.future.base;
    case "college":
      const tier = getCollegeTier(collegeCount);
      if (tier.flat_rate !== undefined) {
        return tier.flat_rate;
      } else if (tier.base && tier.increment_per_college) {
        const extra = Math.max(0, collegeCount - tier.min);
        return tier.base + extra * tier.increment_per_college;
      } else {
        throw new Error("Invalid tier configuration");
      }
    default:
      throw new Error(`Unsupported post_type: ${post_type}`);
  }
}

//  MAIN EXPORT: Calculate full price (used everywhere in backend)
function calculatePrice(post_type, collegeCount = 0) {
  // let baseAmount = calculateBaseAmount(post_type, collegeCount);

  const taxRate = 0.18;

  // 🔹 Promo check for 'future'
  let baseAmount, originalBaseAmount;
  if (post_type === "future" && PROMO_CONFIG.future.is_active) {
    const now = new Date();
    const promo = PROMO_CONFIG.future;
    if (now >= promo.start_date && now <= promo.end_date) {
      baseAmount = promo.promo_base; // 0
      originalBaseAmount = promo.original_base; // 2500
    } else {
      // Fallback: deactivate promo & use normal price
      baseAmount = PRICING_CONFIG.future.base;
      originalBaseAmount = null;
    }
  } else {
    // Non-future or promo off → normal pricing
    baseAmount = calculateBaseAmount(post_type, collegeCount);
    originalBaseAmount = null; // no strikethrough
  }


  const taxAmount = parseFloat((baseAmount * TAX_RATE).toFixed(2));
  const totalAmount = parseFloat((baseAmount + taxAmount).toFixed(2));

  // Optional: Return tier info for logging/analytics
  let tier = null;
  if (post_type === "college") {
    tier = getCollegeTier(collegeCount);
  }

  return {
    baseAmount,
    taxAmount,
    totalAmount,
    originalBaseAmount, // for strikethrough Ui
    promo_active: originalBaseAmount !== null,
    promo_reason: originalBaseAmount ? PROMO_CONFIG.future.reason : null,
   
    collegeCount,
    tierLabel: tier?.label || null,
    tierDescription: tier?.flat_rate 
      ? `Flat ₹${tier.flat_rate.toLocaleString()}`
      : tier?.base 
      ? `₹${tier.base.toLocaleString()} + ₹${tier.increment_per_college}/extra`
      : null,
  };
}

//  Export for backend use
module.exports = {
  calculatePrice,
  PRICING_CONFIG, // for API rules endpoint
  PROMO_CONFIG
};