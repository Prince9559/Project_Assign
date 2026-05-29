// File Path: /frontend/src/services/socketService.js

import { io } from 'socket.io-client';
const BASE_URL = import.meta.env.VITE_BASE_URL;

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.token = null;
  }

  // Initialize socket connection
  connect(token) {
    // if (this.socket && this.connected) {
    //   console.log("Socket already connected");
    //   return this.socket;
    // }

    //  Reuse existing socket if same token & connected
    if (this.socket && this.connected && this.token === token) {
      console.log(" Reusing existing socket");
      return this.socket;
    }

    // 🔌 Disconnect old socket
    this.disconnect();

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

    //   this.socket = io(SOCKET_URL, {
    //     auth: {
    //       token: token,
    //     },
    //     transports: ['websocket'], // ← disable polling fallback
    // upgrade: false,
    // rejectUnauthorized:false,
    //     // reconnection: true,
    //     // reconnectionDelay: 1000,
    //     // reconnectionDelayMax: 5000,
    //     // reconnectionAttempts: 5,
    //   });

    const newsocket = io(SOCKET_URL,{
      auth: {
        token: token,
      },
      // transports: ["websocket"], // ← disable polling fallback
      upgrade: true,
      rejectUnauthorized: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket = newsocket;
    this.token = token;
    this.connected = false;

    // Connection events
    this.socket.on("connect", () => {
      console.log(" Socket connected:", this.socket.id);
      this.connected = true;
      console.log(" Socket connected");
      console.log(" Transport:", this.socket.io.engine.transport.name); // 'websocket'?
      console.log(" ID:", this.socket.id);

      console.log(" Creating new socket instance:", Date.now());
    });

    this.socket.on("disconnect", (reason) => {
      console.log(" Socket disconnected:", reason);
      this.connected = false;
    });

    this.socket.on("connect_error", (err) => {
      console.error(" Socket connect_error:", {
        message: err.message,
        description: err.description,
        context: err.context,
        transports: this.socket.io.opts.transports,
      });
      this.connected = false;
    });

    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    return this.socket;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.token = null;
      console.log("Socket disconnected manually");
    }
  }

  // Join a conversation room
  joinConversation(conversationId) {
    if (this.socket && this.connected) {
      this.socket.emit("join_conversation", { conversationId });
      console.log(`Joined conversation: ${conversationId}`);
    }
  }

  // Leave a conversation room
  leaveConversation(conversationId) {
    if (this.socket && this.connected) {
      // this.socket.emit("leave_conversation", { conversationId });
      // console.log(`Left conversation: ${conversationId}`);
    }
  }

  // Send a message
  sendMessage(conversationId, content, messageType = "text", metadata = null) {
    if (this.socket && this.connected) {
      this.socket.emit("send_message", {
        conversationId,
        content,
        messageType,
        metadata,
      });

      console.log("SEnt a msg from doscket service frontend");
    } else {
      console.error("Socket not connected. Cannot send message.");
    }
  }

  // Typing indicator
  startTyping(conversationId) {
    if (this.socket && this.connected) {
      this.socket.emit("typing", { conversationId });
    }
  }

  stopTyping(conversationId) {
    if (this.socket && this.connected) {
      this.socket.emit("stop_typing", { conversationId });
    }
  }

  // Mark messages as read
  markAsRead(conversationId) {
    if (!conversationId) {
      console.warn(
        "Attempted to mark as read with invalid conversationId:",
        conversationId
      );
      return;
    }
    if (this.socket && this.connected) {
      this.socket.emit("mark_as_read", { conversationId });
    }
  }

  // Delete message
  deleteMessage(messageId, conversationId) {
    if (this.socket && this.connected) {
      this.socket.emit("delete_message", { messageId, conversationId });
    }
  }

  // Listen for new messages
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on("new_message", callback);
      console.log("got a new msg",this.socket);
    }
  }

  // Listen for typing indicator
  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on("user_typing", callback);
    }
  }

  onUserStopTyping(callback) {
    if (this.socket) {
      this.socket.on("user_stop_typing", callback);
    }
  }

  // Listen for user online/offline status
  onUserOnline(callback) {
    if (this.socket) {
      this.socket.on("user_online", callback);
    }
  }

  onUserOffline(callback) {
    if (this.socket) {
      this.socket.on("user_offline", callback);
    }
  }

  // Listen for messages read
  onMessagesRead(callback) {
    if (this.socket) {
      this.socket.on("messages_read", callback);
    }
  }

  // Listen for message deletion
  onMessageDeleted(callback) {
    if (this.socket) {
      this.socket.on("message_deleted", callback);
    }
  }

  // =============== NOTIFICATION METHODS ===============

  // Join user room (critical for 1:1 notifications)
  joinUserRoom(userId) {
    if (this.socket && this.connected) {
      // Your backend expects this event (from socketHandler.js)
      this.socket.emit("join-user-room", userId);
      console.log(`Joined user room: user_${userId}`);
    }
  }

  // Leave user room
  leaveUserRoom(userId) {
    if (this.socket && this.connected) {
      this.socket.emit("leave-user-room", userId);
      console.log(`Left user room: user_${userId}`);
    }
  }

  // Mark single notification as read
  markNotificationRead(notificationId) {
    if (this.socket && this.connected) {
      this.socket.emit("notification:read", { notification_id:notificationId });
    }
  }

  // Mark all notifications as read
  markAllNotificationsRead() {
    if (this.socket && this.connected) {
      this.socket.emit("notification:mark_all_read");
    }
  }

  // =============== LISTENERS ===============

  // Listen for new notifications
  onNotification(callback) {
    if (this.socket) {
      this.socket.on("notification:new", callback);
      console.log("new notification");
    }
  }

  // Listen for read acks (multi-tab sync)
  onNotificationRead(callback) {
    if (this.socket) {
      this.socket.on("notification:read:ack", callback);
    }
  }

  onAllNotificationsRead(callback) {
    if (this.socket) {
      this.socket.on("notification:all_read:ack", callback);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  on(event, callback) {
    if (!this.socket) {
      console.warn(` Cannot attach "${event}" — socket is null/undefined`);
      return;
    }
    console.log(
      ` Attaching "${event}" on socket ${this.socket.id || "unknown"}`
    );
    this.socket.on(event, callback);
  }

  // Remove specific listener
  off(eventName, callback) {
    if (this.socket) {
      this.socket.off(eventName, callback);
    }
  }

  // Get connection status
  isConnected() {
    return this.connected && this.socket?.connected;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;