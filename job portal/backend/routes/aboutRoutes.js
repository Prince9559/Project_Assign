const express = require("express");
const router = express.Router();
const {
  createAbout,
  getAbout,
  updateAbout,
  deleteAbout,
} = require("../controllers/aboutController");

router.post("/about-post", createAbout);
router.get("/about-get", getAbout);
router.put("/about-update/:id", updateAbout);
router.delete("/about-delete/:id", deleteAbout);

module.exports = router;
