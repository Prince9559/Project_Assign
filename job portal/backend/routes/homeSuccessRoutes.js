// routes/homeSuccessRoutes.js

const express = require("express");
const router = express.Router();

const {
  createHomeSuccess,
  getAllHomeSuccess,
  getHomeSuccessById,
  updateHomeSuccess,
  deleteHomeSuccess,
} = require("../controllers/homeSuccessController");

router.post("/home-success-create", createHomeSuccess);
router.get("/home-success-get", getAllHomeSuccess);
router.get("/home-success-get/:id", getHomeSuccessById);
router.put("/home-success-update/:id", updateHomeSuccess);
router.delete("/home-success-delete/:id", deleteHomeSuccess);

module.exports = router;
