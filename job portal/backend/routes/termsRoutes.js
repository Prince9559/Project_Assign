const express = require("express");
const router = express.Router();

const {
  createTerms,
  getTerms,
  updateTerms,
  deleteTerms,
} = require("../controllers/termsController");

// Create Terms
router.post("/terms-post", createTerms);

// Get All Terms
router.get("/terms-get", getTerms);

// Update Terms by ID
router.put("/:id", updateTerms);

// Delete Terms by ID
router.delete("/:id", deleteTerms);

module.exports = router;
