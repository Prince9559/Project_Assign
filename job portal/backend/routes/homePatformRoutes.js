const express = require("express");
const router = express.Router();

const {
  createHomePlatform,
  getAllHomePlatforms,
  getHomePlatformById,
  updateHomePlatform,
  deleteHomePlatform,
} = require("../controllers/homeplatController");

router.post("/home-platform-post", createHomePlatform);
router.get("/home-platform-get", getAllHomePlatforms);
router.get("/home-platform-get/:id", getHomePlatformById);
router.put("/home-platform-update/:id", updateHomePlatform);
router.delete("/home-platform-delete/:id", deleteHomePlatform);

module.exports = router;
