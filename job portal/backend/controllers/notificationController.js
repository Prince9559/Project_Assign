//server/controllers/notificationController.js

const NotificationService = require("../services/notificationService");

exports.getNotifications = async (req, res) => {
  try {
    const { page, limit, status, type, role } = req.query;
    const result = await NotificationService.getForUser(req.user.id, {
      page,
      limit,
      status,
      type,
      role,
    });

    res.json({
      notifications: result.rows,
      pagination: {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        totalPages: result.totalPages,
        total: result.count,
      },
    });
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    console.log("params id",req.params.id);
    const [updated] = await NotificationService.markAsRead(
      req.params.id,
      req.user.id
    );
    if (updated === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Invalid request" });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await NotificationService.markAllAsRead(req.user.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark all as read" });
  }
};

exports.getUnreadCount = async (req, res) => {
  
  try {
    const count = await NotificationService.getUnreadCount(req.user.id);
    res.json({ count });
  } catch (err) {
    console.log("get unread count error", err);
    res.status(500).json({ count: 0 });
  }
}; 