const express = require("express");
const router = express.Router();

const {
  createSupport,
  getSupport,
  updateSupport,
  deleteSupport,
} = require("../controllers/supportController");

// Create Support
router.post("/support-post", createSupport);

// Get All Support Data
router.get("/support-get", getSupport);

// Update Support by ID
router.put("support-update/:id", updateSupport);

// Delete Support by ID
router.delete("support-delete/:id", deleteSupport);

module.exports = router;
