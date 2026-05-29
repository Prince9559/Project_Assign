const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const { sendInterviewInvitation, fetchUpcomingInterviews, updateInterviewStatus } = require('../controllers/interviewInvitationController');


// Use application_id as URL param and protect route with auth middleware
router.post('/:application_id', authMiddleware, sendInterviewInvitation);

router.get('/upcoming/:filterType', authMiddleware, fetchUpcomingInterviews);

router.patch("/:id/status", authMiddleware, updateInterviewStatus);

module.exports = router;
