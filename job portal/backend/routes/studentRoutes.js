const express = require("express");
const router = express.Router();

const {
  createStudents,
  getStudents,
  updateStudents,
  deleteStudents,
} = require("../controllers/studentsController");

// Create
router.post("/student-post", createStudents);

// Get All
router.get("/student-get", getStudents);

// Update by ID
router.put("/:id", updateStudents);

// Delete by ID
router.delete("/:id", deleteStudents);

module.exports = router;
