const express = require('express');
const router = express.Router();
const userDetailController = require('../controllers/userdetailController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

router.post('/detail', authMiddleware, userDetailController.createUserDetails);
router.post('/saveUserDetails', authMiddleware, userDetailController.saveUserDetails);
router.get('/detail/:user_id', userDetailController.getUserDetailsByuser_id);
router.put('/detail/:user_id', authMiddleware, userDetailController.updateUserDetailsByuser_id);
router.get('/profile-completion',authMiddleware,userDetailController.getProfileCompletion)

router.get('/public-profile/:user_id',authMiddleware, userDetailController.getPublicProfileByuser_id);
router.get('/public/:uuid',authMiddleware,userDetailController.getPublicProfileByUUID);
router.get(
  "/public_profile/:uuid",
  authMiddleware,
  userDetailController.getPublicProfile
);

router.get('/aadhaarVerificationStatus', authMiddleware, userDetailController.getAadhaarVerificationStatus);
router.put('/updateAadhaarDetails', authMiddleware, upload.single('aadhaar_card_file'), userDetailController.updateAadhaarDetails);

router.post('/updateterms_and_condition', authMiddleware, userDetailController.updateterms_and_condition);
router.get('/getterms_and_condition', userDetailController.getterms_and_condition);

// routes/resume.js
router.get('/resume/:user_id', userDetailController.getResumeDataByUserId);

module.exports = router;
