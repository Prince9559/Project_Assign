// controllers/pricingController.js
const { PRICING_CONFIG, PROMO_CONFIG } = require("../utils/pricingHelper");

exports.getPricingRules = (req, res) => {
  const { post_type } = req.query;

  if (!post_type || !["active", "future", "college"].includes(post_type)) {
    return res.status(400).json({
      success: false,
      error: "Invalid or missing post_type. Must be 'active', 'future', or 'college'."
    });
  }

  const config = PRICING_CONFIG[post_type];
  if (!config) {
    return res.status(404).json({
      success: false,
      error: "Pricing rules not found for this post_type"
    });
  }

  res.json({
    success: true,
    post_type,
    ...config,
    promo:
      post_type === "future" && PROMO_CONFIG.future.is_active
        ? {
            active: true,
            original_price: PROMO_CONFIG.future.original_base,
            display_price: 0,
            reason: PROMO_CONFIG.future.reason,
            valid_until: PROMO_CONFIG.future.end_date.toISOString(),
          }
        : null,
   
    gst_percent: 18,
    currency: "INR",
    last_updated: new Date().toISOString(),
  });
};