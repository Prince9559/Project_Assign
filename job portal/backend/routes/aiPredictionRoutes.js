// routes/aiPrediction.js
const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiPredictionController");
const authMiddleware = require("../middleware/authMiddleware"); 

// router.get("/ai-prediction", authMiddleware,aiController.getPredictions);

router.post("/ai-prediction",authMiddleware, aiController.postPredictions);

module.exports = router;
