const express = require('express');
const router = express.Router();
const { getNotifications, 
    markAsRead,
    markAllAsRead,
    getUnreadCount,
 } = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');


//these routes mounted (/api/notifications)
router.get("/",authMiddleware, getNotifications); // ?page=1&limit=10&status=unread&role=recruiter

router.patch("/:id/read",authMiddleware, markAsRead);
router.patch("/mark-all-read",authMiddleware, markAllAsRead);
router.get("/unread-count",authMiddleware, getUnreadCount);

module.exports = router;