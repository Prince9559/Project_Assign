const express = require("express");
const multer = require("multer");
// const { verifyOfflineAadhaar } = require("../controllers/AadhaarKycController");

const router = express.Router();
const upload = multer({ dest: "temp/uploads/" });

// router.post(
//   "/verify-offline-aadhaar",
//   upload.single("aadhaarZip"),
//   verifyOfflineAadhaar
// );


// backend/src/routes/kyc.routes.js
const { testHardcodedKyc } = require('../controllers/AadhaarKycController');

router.get('/test-kyc', testHardcodedKyc); // ← temporary test
module.exports = router;
