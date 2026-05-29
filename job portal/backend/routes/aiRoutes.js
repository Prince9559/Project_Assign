const express = require("express");
const router = express.Router();
const { generateOpportunityContent } = require( "../controllers/aiController.js");



// POST /api/ai/generate-opportunity
router.post("/generate-opportunity", generateOpportunityContent);

module.exports = router;