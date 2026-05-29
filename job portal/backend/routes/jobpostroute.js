const express = require('express');
const router = express.Router();
const jobPostController = require('../controllers/jobpostController');
const { getOpportunities, getJobDetails, showCompanyWiseJobPosts, getJobDetailsForRecruiter, getDraftOpportunity, getJobsUniversityView, getJobDetailsUniversity, getHomepageOpportunities } = require('../controllers/jobpostOpportunityControllerV4');
const authMiddleware = require('../middleware/authMiddleware');
const {requirePermission} = require("../middleware/rbac");

router.post('/api/jobpost/create', authMiddleware,requirePermission('job.create'), jobPostController.createJobPost);
router.post('/api/jobpost/apply/:job_post_id', authMiddleware, jobPostController.applyForJob);
router.get("/api/application/last", authMiddleware, jobPostController.getLastApplication);
router.post('/api/jobs/:jobId/select-plan',authMiddleware,jobPostController.selectJobPostingPlan);

router.patch(
  "/api/jobpost/:job_post_id/stop-hiring",
  authMiddleware,
  jobPostController.stopHiringForJob
);

router.get(
  "/api/jobpost/getDraft/:job_id",
  authMiddleware,
  getDraftOpportunity
);



// Edit/Duplicate/Convert flow - single endpoint handles all cases
router.get("/api/jobs/:job_id/edit", authMiddleware, jobPostController.getJobForEdit);

// Optional: Explicit duplicate endpoint (can also use edit endpoint with mode param)
// router.post("/api/jobs/:job_id/duplicate",authMiddleware,jobPostController.duplicateJob);








router.get(
  "/api/opportunities/homepage",
  getHomepageOpportunities
);
router.get('/api/opportunities/university', authMiddleware, getJobsUniversityView);
router.get('/api/opportunities/university/:job_id', authMiddleware, getJobDetailsUniversity);
router.get('/api/opportunities/recruiter/:job_id', authMiddleware, getJobDetailsForRecruiter);


router.get('/api/opportunities', authMiddleware, getOpportunities);
router.get('/api/jobdetails/:job_id', authMiddleware, getJobDetails);
router.get('/api/jobposts/companysearch', showCompanyWiseJobPosts);

// GET /api/jobs/preview?post_type=active&opportunity_type=internship
router.get('/api/jobs/preview', authMiddleware, jobPostController.getJobPostingPreview);

//get detail job data with payment info
router.get('/api/jobs/:job_id', authMiddleware, getJobDetailsForRecruiter);


// New route to get all applications of the authenticated user
router.get('/api/user/applications', authMiddleware, jobPostController.getUserApplications);

// New route to get total job posts count by recruiter
router.get('/api/jobpost/totalcount', authMiddleware, jobPostController.getTotalJobPostsByRecruiter);

// get the all aplicant detail whcih apply for specific job it for recuriter
router.get('/api/jobpost/:job_post_id/allapplicant', authMiddleware, jobPostController.getApplicantsForJob);

// get the all aplicant (fulldetail) whcih apply for specific job it for recuriter
router.get('/api/jobpost/:job_post_id/applicant/:application_id', authMiddleware, jobPostController.getApplicantDetailsById);

//get the no of applicants count applied for a particular job
router.get('/api/jobpost/:job_post_id/applicantCount', authMiddleware, jobPostController.getNoOfApplicantsForParticularJob);

// New route to update application status by recruiter
router.post('/api/application/status', authMiddleware, jobPostController.updateApplicationStatus);

// New route to get candidates by application status
router.get('/api/applications/status/:status', authMiddleware, jobPostController.getCandidatesByStatus);

// api for pending count
router.get('/api/pendingtask/grouped', authMiddleware, jobPostController.getPendingTasksgroupbystatus);
// api for pending view
router.get('/api/pendingtask/:status', authMiddleware, jobPostController.getviewPendingTasksgroupbystatus);

// Routes for filter APIs
router.get('/api/jobpost/filter', authMiddleware, jobPostController.getAllJobFilterOptions);
router.get('/api/jobpost/filtering', authMiddleware, jobPostController.filterJobPosts);


// domaintable
router.get('/api/domain/all', authMiddleware, jobPostController.getAllDomains);

module.exports = router;
