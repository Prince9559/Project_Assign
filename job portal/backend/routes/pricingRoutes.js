// routes/pricing.js
const express = require("express");
const { getPricingRules } = require("../controllers/pricingController");
const router = express.Router();

router.get("/rules", getPricingRules);

module.exports = router;
