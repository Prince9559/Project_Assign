const express = require('express');
const router = express.Router();

const { upload, handleUploadError, enforceAuthorizationLetterFileSize } = require('../utils/upload');
const { uploadImage } = require('../controllers/imageUploadController');
const authMiddleware = require('../middleware/authMiddleware');


//POST api/upload-image
router.post('/upload-image', authMiddleware, upload, handleUploadError, enforceAuthorizationLetterFileSize, uploadImage);


module.exports = router;