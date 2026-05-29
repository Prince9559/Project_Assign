// File Path: /server/routes/chatRoutes.js

const express = require("express");
const router = express.Router();

// Import controllers
const {
  createOrGetConversation,
  getUserConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
  uploadChatFile,
  sendAssignmentViaChat,
  sendInterviewViaChat,
  submitAssignment
} = require("../controllers/chatController");
const authMiddleware = require('../middleware/authMiddleware');

const { upload, handleUploadError } = require('../utils/upload');


// ==================== ROUTES ====================

// Create or get conversation
router.post("/conversations", authMiddleware, createOrGetConversation);

// Get all user's conversations
router.get("/conversations", authMiddleware, getUserConversations);

// Get messages for a conversation
router.get(
  "/conversations/:conversationId/messages",
  authMiddleware,
  getMessages
);

// Send message (REST API - backup for socket)
router.post("/messages", authMiddleware, sendMessage);

// Mark conversation as read
router.patch("/conversations/:conversationId/read", authMiddleware, markAsRead);

// Get total unread count
router.get("/unread-count", authMiddleware, getUnreadCount);


router.post(
  "/upload",
  authMiddleware,
  upload,
  handleUploadError,
  uploadChatFile 
);

//send assignment
router.post('/send-assignment', authMiddleware, sendAssignmentViaChat);

router.post('/submit-assignment',authMiddleware, submitAssignment); 

router.post("/send-interview", authMiddleware, sendInterviewViaChat);

// Delete message
router.delete("/messages/:messageId", authMiddleware, async (req, res) => {
  try {
    const { Message } = require("../models");
    const { messageId } = req.params;
    const userId = req.user.id;

    const message = await Message.findOne({
      where: {
        id: messageId,
        sender_id: userId,
      },
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found or unauthorized",
      });
    }

    await Message.update(
      { is_deleted: true, content: "This message was deleted" },
      { where: { id: messageId } }
    );

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete message",
      error: error.message,
    });
  }
});


module.exports = router;
