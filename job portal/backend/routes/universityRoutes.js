// routes/universityRoutes.js
const express = require("express");
const router = express.Router();
const {
  createUniversity,
  getUniversity,
  getUniversityById,
  updateUniversity,
  deleteUniversity
} = require("../controllers/universityController");

router.post("/university-post", createUniversity);
router.get("/university-get", getUniversity);
router.get("/university-get-id/:id", getUniversityById);
router.put("/university-update/:id", updateUniversity);
router.delete("/university-delete/:id", deleteUniversity);

module.exports = router;
