const express = require('express');
const router = express.Router();
const { createProfile, getProfile, updateProfile, getJobPostsByRecruiter, incrementViewCount, updateExperienceStatus, upload, handleUploadError , getPipelineCandidates, getDashboardStats, getAlertSettings, updateAlertSettings, getTiedUpColleges, getCampusHiringTieUpColleges} = require('../controllers/companyRecruiterProfileController');
const authMiddleware = require('../middleware/authMiddleware');
const { requirePermission } = require("../middleware/rbac");

// Create recruiter profile with file upload support (new)
router.post('/profile/upload', authMiddleware, upload, handleUploadError, createProfile);

// Create recruiter profile without file upload (backward compatibility)
router.post('/profile', authMiddleware, createProfile);

// Get recruiter profile
router.get('/profile', authMiddleware, getProfile);

// Update recruiter profile with file upload support (new)
router.put(
  "/profile/upload",
  authMiddleware,
  requirePermission("profile.edit.company"),
  upload,
  handleUploadError,
  updateProfile
);

// Update recruiter profile without file upload (backward compatibility)
router.put(
  "/profile",
  authMiddleware,
  requirePermission("profile.edit.company"),
  updateProfile
);

// New route to get detailed list of job posts by recruiter
router.get('/jobpost/list', authMiddleware, getJobPostsByRecruiter);

// incremnt views
router.post('/jobpost/:job_id/increment-view', incrementViewCount);

// New route to update experience status by company recruiter
router.put('/experience/:experienceId/status', authMiddleware, updateExperienceStatus);

//get pipeline candidates
router.get("/candidates", authMiddleware, getPipelineCandidates);

router.get("/dashboardStats", authMiddleware, getDashboardStats);

//for email alerts frequency 

// GET current alert settings
router.get("/email-alert-settings", authMiddleware, getAlertSettings);

// PATCH update alert settings
router.patch("/email-alert-settings", authMiddleware, updateAlertSettings);

// GET tied-up colleges
router.get("/tiedup-colleges", authMiddleware, getTiedUpColleges);

// Campus hiring: registered (approved) colleges with active company tie-up only
router.get("/campus-hiring/tie-up-colleges", authMiddleware, getCampusHiringTieUpColleges);

module.exports = router;
