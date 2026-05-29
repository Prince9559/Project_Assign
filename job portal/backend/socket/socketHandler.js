// File Path: /server/socket/socketHandler.js

const jwt = require('jsonwebtoken');
const { Message, Conversation, ConversationParticipant, User, Notification } = require('../models');
const { Op } = require('sequelize');

// Store active users: { userId: socketId }
const activeUsers = new Map();

//  In-memory unread counters (optional, but fast)
const unreadCounters = new Map(); // { userId: count }



let ioInstance = null;

const setIO = (io) => {
  ioInstance = io;
};

const notifyUser = (userId, event, payload) => {
    if (!ioInstance) {
    console.warn("[Socket] io not initialized yet. Skipping emit.");
    return;
  }

  console.log(` Emitting "${event}" to room user_${userId}`);
  console.log(`   Payload:`, { id: payload.id, title: payload.title });

  ioInstance.to(`user_${userId}`).emit(event, payload);
};

const incrementUnreadCount = (userId) => {
  // If unreadCounters not initialized, skip (e.g., during tests)
  if (typeof unreadCounters === "undefined") return 0;
  const current = unreadCounters.get(userId) || 0;
  const newCount = current + 1;
  unreadCounters.set(userId, newCount);
  return newCount;
};

const getUnreadCount = (userId) => {
  return unreadCounters?.get(userId) || 0;
};


const initializeSocket = (io) => {

   ioInstance = io;
  
  // ==================== MIDDLEWARE: Authentication ====================
  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user info to socket
      socket.userId = decoded.id || decoded.userId;
      socket.userType = decoded.userType || decoded.role;

      // JOIN PRIVATE USER ROOM
      socket.join(`user_${socket.userId}`);
      // Mark user as online
      activeUsers.set(socket.userId, socket.id);

      // Load unread count for this user (for initial badge)
      const unreadCount = await Notification.count({
        where: { user_id: socket.userId, is_read: false, is_archived: false },
      });
      unreadCounters.set(socket.userId, unreadCount);

      next();
    } catch (error) {
      console.error('Socket authentication error:', error.message);
      next(new Error('Authentication failed'));
    }
  });

  // ==================== CONNECTION ====================
  io.on('connection', (socket) => {
    console.log(
      `User connected: ${socket.userId} (${socket.userType}) [Room: user_${socket.userId}]`
    );

    //  console.log("🔌 New socket connection attempt");
    //  console.log("   Transport:", socket.conn.transport.name); // 'websocket' or 'polling'
    //  console.log("   Request headers:", {
    //    upgrade: socket.handshake.headers.upgrade,
    //    connection: socket.handshake.headers.connection,
    //  });


    // ==================== NOTIFICATION EVENTS ====================

    // Optional: Acknowledge notification (mark as read)
    socket.on("notification:read", async (data) => {
      try {
        const { notification_id } = data;
        console.log("notification_id",notification_id, socket.userId);
        const [updated] = await Notification.update(
          { is_read: true },
          { where: { id: notification_id, user_id: socket.userId } }
        );

        if (updated) {
          // Decrement counter
          const current = unreadCounters.get(socket.userId) || 0;
          unreadCounters.set(socket.userId, Math.max(0, current - 1));

          // Notify only this user (for UI sync)
          socket.emit("notification:read:ack", { id: notification_id });
        }
      } catch (err) {
        console.error("Failed to mark notification read:", err);
      }
    });

    // Optional: Mark all as read
    socket.on("notification:mark_all_read", async () => {
      try {
        await Notification.update(
          { is_read: true },
          { where: { user_id: socket.userId, is_read: false } }
        );
        unreadCounters.set(socket.userId, 0);
        socket.emit("notification:all_read:ack");
      } catch (err) {
        console.error("Failed to mark all notifications read:", err);
      }
    });

    // ==================== JOIN CONVERSATION ====================
    socket.on("join_conversation", async ({ conversationId }) => {
      try {
        // Verify user is participant
        const participant = await ConversationParticipant.findOne({
          where: {
            conversation_id: conversationId,
            user_id: socket.userId,
            is_active: true,
          },
        });

        if (!participant) {
          socket.emit("error", {
            message: "Not authorized to join this conversation",
          });
          return;
        }

        // Join the room
        socket.join(`conversation_${conversationId}`);
        console.log(
          `User ${socket.userId} joined conversation ${conversationId}`
        );

        // Notify others that user is online
        socket.to(`conversation_${conversationId}`).emit("user_online", {
          userId: socket.userId,
          conversationId,
        });
      } catch (error) {
        console.error("Error joining conversation:", error);
        socket.emit("error", { message: "Failed to join conversation" });
      }
    });

    // ==================== LEAVE CONVERSATION ====================
    socket.on("leave_conversation", ({ conversationId }) => {
      socket.leave(`conversation_${conversationId}`);
      socket.to(`conversation_${conversationId}`).emit("user_offline", {
        userId: socket.userId,
        conversationId,
      });
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });

    // ==================== SEND MESSAGE ====================
    socket.on("send_message", async (data) => {
      try {
        const {
          conversationId,
          content,
          messageType = "text",
          metadata = null,
        } = data;

        // Verify participant
        const participant = await ConversationParticipant.findOne({
          where: {
            conversation_id: conversationId,
            user_id: socket.userId,
          },
        });

        if (!participant) {
          socket.emit("error", { message: "Not authorized to send message" });
          return;
        }

        // Create message
        const message = await Message.create({
          conversation_id: conversationId,
          sender_id: socket.userId,
          sender_type: socket.userType,
          message_type: messageType,
          content: content,
          metadata: metadata,
        });

        // Update conversation last_message_at
        await Conversation.update(
          { last_message_at: new Date() },
          { where: { id: conversationId } }
        );

        // Fetch sender details
        const sender = await User.findByPk(socket.userId, {
          attributes: ["id", "first_name", "last_name", "email"], // Adjust based on your User model
        });

        // Prepare message payload
        const messagePayload = {
          id: message.id,
          conversationId: message.conversation_id,
          senderId: message.sender_id,
          senderType: message.sender_type,
          messageType: message.message_type,
          content: message.content,
          metadata: message.metadata,
          createdAt: message.created_at,



          conversation_id: message.conversation_id,
          sender_id: message.sender_id,
          sender_type: message.sender_type,
          message_type: message.message_type,
          content: message.content,
          metadata: message.metadata,
          created_at: message.created_at,


          sender: {
            id: sender.id,
            // name: sender.first_name + " " + sender.last_name,
            // firstName: sender.first_name,
            // lastName: sender.last_name,
            email: sender.email,
            first_name: sender.first_name,
            last_name: sender.last_name,
          },
        };

        // Emit to all participants in the conversation room
        io.to(`conversation_${conversationId}`).emit(
          "new_message",
          messagePayload
        );

        console.log(
          `Message sent in conversation ${conversationId} by user ${socket.userId}`,
          messagePayload
        );
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // ==================== TYPING INDICATOR ====================
    socket.on("typing", ({ conversationId }) => {
      socket.to(`conversation_${conversationId}`).emit("user_typing", {
        userId: socket.userId,
        conversationId,
      });
    });

    socket.on("stop_typing", ({ conversationId }) => {
      socket.to(`conversation_${conversationId}`).emit("user_stop_typing", {
        userId: socket.userId,
        conversationId,
      });
    });

    // ==================== MARK AS READ ====================
    socket.on("mark_as_read", async ({ conversationId }) => {
      try {
        await ConversationParticipant.update(
          { last_read_at: new Date() },
          {
            where: {
              conversation_id: conversationId,
              user_id: socket.userId,
            },
          }
        );

        socket.to(`conversation_${conversationId}`).emit("messages_read", {
          userId: socket.userId,
          conversationId,
          readAt: new Date(),
        });
      } catch (error) {
        console.error("Error marking as read:", error);
      }
    });

    // ==================== DELETE MESSAGE ====================
    socket.on("delete_message", async ({ messageId, conversationId }) => {
      try {
        const message = await Message.findOne({
          where: {
            id: messageId,
            sender_id: socket.userId,
          },
        });

        if (!message) {
          socket.emit("error", {
            message: "Message not found or unauthorized",
          });
          return;
        }

        await Message.update(
          { is_deleted: true, content: "This message was deleted" },
          { where: { id: messageId } }
        );

        io.to(`conversation_${conversationId}`).emit("message_deleted", {
          messageId,
          conversationId,
        });
      } catch (error) {
        console.error("Error deleting message:", error);
        socket.emit("error", { message: "Failed to delete message" });
      }
    });

    // ==================== DISCONNECT ====================
    socket.on("disconnect", () => {
      console.log(` User disconnected: ${socket.userId}`);
      activeUsers.delete(socket.userId);

      //  LEAVE PRIVATE ROOM
      socket.leave(`user_${socket.userId}`);
      unreadCounters.delete(socket.userId);

      // Notify all rooms this user was in
      socket.rooms.forEach((room) => {
        if (room.startsWith("conversation_")) {
          socket.to(room).emit("user_offline", {
            userId: socket.userId,
          });
        }
      });
    });
  });

  return io;
};

// Helper function to check if user is online
const isUserOnline = (userId) => {
  return activeUsers.has(userId);
};

// Helper function to get online users
const getOnlineUsers = () => {
  return Array.from(activeUsers.keys());
};


module.exports = {
  initializeSocket,
  isUserOnline,
  getOnlineUsers,
  notifyUser,
  getUnreadCount,
  incrementUnreadCount,
  activeUsers,
};