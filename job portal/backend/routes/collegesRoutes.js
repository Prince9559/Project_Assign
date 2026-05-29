const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const collegesController = require("../controllers/collegesController");

router.get("/search", collegesController.searchApprovedColleges);
router.post("/", authMiddleware, collegesController.createCollegeRequest);

module.exports = router;
