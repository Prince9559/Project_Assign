// ///hooks/useNotifications

// import { useState, useEffect, useCallback } from "react";
// import socketService from "../services/socketService";
// import {getNotifications, getUnreadCount,markAsReadNotification, markAllAsReadNotification } from "../api/notificationApi"; 


// export const useNotifications = (userId) => {
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [isLoading, setIsLoading] = useState(true);


//   //  Fetch initial data
//   const fetchInitialData = useCallback(async () => {
//     if (!userId) return;

//     try {
//       const [notifRes, countRes] = await Promise.all([
//         getNotifications({ limit: 50 }),
//         getUnreadCount(),
//       ]);

//       console.log("in the hook", notifRes,countRes);
//       setNotifications(notifRes.notifications || []);
//       setUnreadCount(countRes.count || 0);
//     } catch (err) {
//       console.error("Failed to load notifications", err);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [userId]);

//   //  Setup real-time listeners
//   useEffect(() => {

//     console.log("entering usenotification hook with user id ", userId);
//     if (!userId) return;

//     // Handler for new notifications
//     const handleNewNotification = (notif) => {

//       console.log("this sioccket", this.socket);

//       if (!this.socket) {
//         console.error(
//           "❌ CRITICAL: socket is null/undefined in onNotification!"
//         );
//         return;
//       }
//        console.log("🔔 Real-time notification:", notif); 
//       setNotifications((prev) => [notif, ...prev.slice(0, 49)]);
//       setUnreadCount((c) => c + 1);
//     };

//     // Handlers for read sync
//     const handleReadAck = ({ id }) => {
//       setNotifications((n) =>
//         n.map((n) => (n.id === id ? { ...n, is_read: true } : n))
//       );
//       setUnreadCount((c) => Math.max(0, c - 1));
//     };

//     const handleAllReadAck = () => {
//       setNotifications((n) => n.map((n) => ({ ...n, is_read: true })));
//       setUnreadCount(0);
//     };

//     // Attach listeners
//     socketService.onNotification(handleNewNotification);
//     socketService.onNotificationRead(handleReadAck);
//     socketService.onAllNotificationsRead(handleAllReadAck);

//     // Initial fetch
//     fetchInitialData();

//     return () => {
//       socketService.off("notification:new", handleNewNotification);
//       socketService.off("notification:read:ack", handleReadAck);
//       socketService.off("notification:all_read:ack", handleAllReadAck);
//     };
//   }, [ userId, fetchInitialData]);

//   //  Mark as read (optimistic)
//   const markAsRead = async (id) => {
//     // Optimistic UI update
//     setNotifications((n) =>
//       n.map((n) => (n.id === id ? { ...n, is_read: true } : n))
//     );
//     setUnreadCount((c) => Math.max(0, c - 1));

//     try {
//       await markAsReadNotification(id);
//       socketService.markNotificationRead(id); // sync across tabs
//     } catch (err) {
//       console.log("error in use notifications",err)
//       // Revert on error
//       setNotifications((n) =>
//         n.map((n) => (n.id === id ? { ...n, is_read: false } : n))
//       );
//       setUnreadCount((c) => c + 1);
//     }
//   };

//   const markAllAsRead = async () => {
//     setNotifications((n) => n.map((n) => ({ ...n, is_read: true })));
//     setUnreadCount(0);

//     try {
//       await markAllAsReadNotification();
//       socketService.markAllNotificationsRead();
//     } catch (err) {
//       // Keep optimistic (user won’t notice)
//       console.log("unable to mark notifications as read", err);
//     }
//   };

//   return {
//     notifications,
//     unreadCount,
//     isLoading,
//     markAsRead,
//     markAllAsRead,
//     refetch: fetchInitialData,
//   };
// };














// import { useState, useEffect, useCallback } from "react";
// import socketService from "../services/socketService";
// import {
//   getNotifications,
//   getUnreadCount,
//   markAsReadNotification,
//   markAllAsReadNotification,
// } from "../api/notificationApi";

// export const useNotifications = (userId) => {
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [isLoading, setIsLoading] = useState(true);

//   // Fetch initial data
//   const fetchInitialData = useCallback(async () => {
//     if (!userId) return;

//     try {
//       const [notifRes, countRes] = await Promise.all([
//         getNotifications({ limit: 50 }),
//         getUnreadCount(),
//       ]);

//       console.log("📩 Initial notifications loaded:", notifRes, countRes);
//       setNotifications(notifRes.notifications || []);
//       setUnreadCount(countRes.count || 0);
//     } catch (err) {
//       console.error("Failed to load notifications", err);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [userId]);

//   // Setup real-time listeners
//   useEffect(() => {
//     console.log("🔧 Setting up notification listeners for user:", userId);
//     if (!userId) return;

//     // FIXED: Remove the invalid `this.socket` check
//     const handleNewNotification = (notif) => {
//       console.log("🔔 Real-time notification received:", notif);
//       setNotifications((prev) => [notif, ...prev.slice(0, 49)]);
//       setUnreadCount((c) => c + 1);
//     };

//     const handleReadAck = ({ id }) => {
//       console.log("✅ Notification marked as read:", id);
//       setNotifications((prev) =>
//         prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
//       );
//       setUnreadCount((c) => Math.max(0, c - 1));
//     };

//     const handleAllReadAck = () => {
//       console.log("✅ All notifications marked as read");
//       setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
//       setUnreadCount(0);
//     };

//     // Wait for socket to be ready before attaching listeners
//     const setupListeners = () => {
//       if (!socketService.isConnected()) {
//         console.warn("⚠️ Socket not connected yet, waiting...");
//         setTimeout(setupListeners, 100); // Retry after 100ms
//         return;
//       }

//       console.log("🎧 Attaching notification listeners...");
//       socketService.onNotification(handleNewNotification);
//       socketService.onNotificationRead(handleReadAck);
//       socketService.onAllNotificationsRead(handleAllReadAck);
//     };

//     setupListeners();
//     fetchInitialData();

//     return () => {
//       console.log("🧹 Cleaning up notification listeners");
//       socketService.off("notification:new", handleNewNotification);
//       socketService.off("notification:read:ack", handleReadAck);
//       socketService.off("notification:all_read:ack", handleAllReadAck);
//     };
//   }, [userId, fetchInitialData]);

//   // Mark as read (optimistic)
//   const markAsRead = async (id) => {
//     setNotifications((prev) =>
//       prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
//     );
//     setUnreadCount((c) => Math.max(0, c - 1));

//     try {
//       await markAsReadNotification(id);
//       socketService.markNotificationRead(id);
//     } catch (err) {
//       console.error("❌ Error marking notification as read:", err);
//       // Revert on error
//       setNotifications((prev) =>
//         prev.map((n) => (n.id === id ? { ...n, is_read: false } : n))
//       );
//       setUnreadCount((c) => c + 1);
//     }
//   };

//   const markAllAsRead = async () => {
//     setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
//     setUnreadCount(0);

//     try {
//       await markAllAsReadNotification();
//       socketService.markAllNotificationsRead();
//     } catch (err) {
//       console.error("❌ Error marking all notifications as read:", err);
//     }
//   };

//   return {
//     notifications,
//     unreadCount,
//     isLoading,
//     markAsRead,
//     markAllAsRead,
//     refetch: fetchInitialData,
//   };
// };




// import { useState, useEffect, useCallback } from "react";
// import socketService from "../services/socketService";
// import {
//   getNotifications,
//   getUnreadCount,
//   markAsReadNotification,
//   markAllAsReadNotification,
// } from "../api/notificationApi";

// export const useNotifications = (userId) => {
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [isLoading, setIsLoading] = useState(true);

//   const fetchInitialData = useCallback(async () => {
//     if (!userId) return;

//     try {
//       const [notifRes, countRes] = await Promise.all([
//         getNotifications({ limit: 50 }),
//         getUnreadCount(),
//       ]);

//       console.log("📩 Initial notifications loaded:", notifRes, countRes);
//       setNotifications(notifRes.notifications || []);
//       setUnreadCount(countRes.count || 0);
//     } catch (err) {
//       console.error("Failed to load notifications", err);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [userId]);

//   useEffect(() => {
//     if (!userId) return;

//     console.log("🔧 Setting up notification listeners for user:", userId);

//     const handleNewNotification = (notif) => {
//       console.log("🔔 Real-time notification received:", notif);
//       setNotifications((prev) => [notif, ...prev.slice(0, 49)]);
//       setUnreadCount((c) => c + 1);
//     };

//     const handleReadAck = ({ id }) => {
//       console.log("✅ Notification marked as read:", id);
//       setNotifications((prev) =>
//         prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
//       );
//       setUnreadCount((c) => Math.max(0, c - 1));
//     };

//     const handleAllReadAck = () => {
//       console.log("✅ All notifications marked as read");
//       setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
//       setUnreadCount(0);
//     };

//     const attachListeners = () => {
//       if (!socketService.socket) {
//         console.warn("⚠️ Socket not initialized, retrying...");
//         // setTimeout(attachListeners, 200);
//         return;
//       }

//       console.log("🎧 Attaching notification listeners...");
//       socketService.onNotification(handleNewNotification);
//       socketService.onNotificationRead(handleReadAck);
//       socketService.onAllNotificationsRead(handleAllReadAck);
//     };

//     attachListeners();
//     fetchInitialData();

//     return () => {
//       console.log("🧹 Cleaning up notification listeners");
//       socketService.off("notification:new", handleNewNotification);
//       socketService.off("notification:read:ack", handleReadAck);
//       socketService.off("notification:all_read:ack", handleAllReadAck);
//     };
//   }, [userId, fetchInitialData]);

//   const markAsRead = async (id) => {
//     setNotifications((prev) =>
//       prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
//     );
//     setUnreadCount((c) => Math.max(0, c - 1));

//     try {
//       await markAsReadNotification(id);
//       if (socketService.isConnected()) {
//         socketService.markNotificationRead(id);
//       }
//     } catch (err) {
//       console.error("❌ Error marking notification as read:", err);
//       setNotifications((prev) =>
//         prev.map((n) => (n.id === id ? { ...n, is_read: false } : n))
//       );
//       setUnreadCount((c) => c + 1);
//     }
//   };

//   const markAllAsRead = async () => {
//     setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
//     setUnreadCount(0);

//     try {
//       await markAllAsReadNotification();
//       if (socketService.isConnected()) {
//         socketService.markAllNotificationsRead();
//       }
//     } catch (err) {
//       console.error("❌ Error marking all notifications as read:", err);
//     }
//   };

//   return {
//     notifications,
//     unreadCount,
//     isLoading,
//     markAsRead,
//     markAllAsRead,
//     refetch: fetchInitialData,
//   };
// };





















// // hooks/useNotifications.js

// import { useState, useEffect, useCallback } from "react";
// import socketService from "../services/socketService";
// import {
//   getNotifications,
//   getUnreadCount,
//   markAsReadNotification,
//   markAllAsReadNotification
// } from "../api/notificationApi";

// export const useNotifications = (userId) => {
//   const [notifications, setNotifications] = useState([]);
//   const [unreadCount, setUnreadCount] = useState(0);
//   const [isLoading, setIsLoading] = useState(true);

//   // Fetch initial data
//   const fetchInitialData = useCallback(async () => {
//     if (!userId) return;

//     try {
//       const [notifRes, countRes] = await Promise.all([
//         getNotifications({ limit: 50 }),
//         getUnreadCount(),
//       ]);

//       console.log("in the hook", notifRes, countRes);
//       setNotifications(notifRes.notifications || []);
//       setUnreadCount(countRes.count || 0);
//     } catch (err) {
//       console.error("Failed to load notifications", err);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [userId]);

//   // Setup real-time listeners
//   useEffect(() => {
//     console.log("entering usenotification hook with user id ", userId);
//     if (!userId) return;

//     // Handler for new notifications - FIXED: Removed this.socket check
//     const handleNewNotification = (notif) => {
//       console.log("🔔 Real-time notification received:", notif);
      
//       setNotifications((prev) => [notif, ...prev.slice(0, 49)]);
//       setUnreadCount((c) => c + 1);
//     };

//     // Handlers for read sync
//     const handleReadAck = ({ id }) => {
//       setNotifications((notifs) =>
//         notifs.map((n) => (n.id === id ? { ...n, is_read: true } : n))
//       );
//       setUnreadCount((c) => Math.max(0, c - 1));
//     };

//     const handleAllReadAck = () => {
//       setNotifications((notifs) => notifs.map((n) => ({ ...n, is_read: true })));
//       setUnreadCount(0);
//     };

//     // Attach listeners
//     socketService.onNotification(handleNewNotification);
//     socketService.onNotificationRead(handleReadAck);
//     socketService.onAllNotificationsRead(handleAllReadAck);

//     // Initial fetch
//     fetchInitialData();

//     // Cleanup function
//     return () => {
//       socketService.off("notification:new", handleNewNotification);
//       socketService.off("notification:read:ack", handleReadAck);
//       socketService.off("notification:all_read:ack", handleAllReadAck);
//     };
//   }, [userId, fetchInitialData]);

//   // Mark as read (optimistic)
//   const markAsRead = async (id) => {
//     // Optimistic UI update
//     setNotifications((notifs) =>
//       notifs.map((n) => (n.id === id ? { ...n, is_read: true } : n))
//     );
//     setUnreadCount((c) => Math.max(0, c - 1));

//     try {
//       await markAsReadNotification(id);
//       socketService.markNotificationRead(id); // sync across tabs
//     } catch (err) {
//       console.log("error in use notifications", err);
//       // Revert on error
//       setNotifications((notifs) =>
//         notifs.map((n) => (n.id === id ? { ...n, is_read: false } : n))
//       );
//       setUnreadCount((c) => c + 1);
//     }
//   };

//   const markAllAsRead = async () => {
//     setNotifications((notifs) => notifs.map((n) => ({ ...n, is_read: true })));
//     setUnreadCount(0);

//     try {
//       await markAllAsReadNotification();
//       socketService.markAllNotificationsRead();
//     } catch (err) {
//       // Keep optimistic (user won't notice)
//       console.log("unable to mark notifications as read", err);
//     }
//   };

//   return {
//     notifications,
//     unreadCount,
//     isLoading,
//     markAsRead,
//     markAllAsRead,
//     refetch: fetchInitialData,
//   };
// };





















// ============================================
// FIX 1: useNotifications.js - Use useRef to prevent stale closures
// ============================================

import { useState, useEffect, useCallback, useRef } from "react";
import socketService from "../services/socketService";
import {
  getNotifications,
  getUnreadCount,
  markAsReadNotification,
  markAllAsReadNotification
} from "../api/notificationApi";

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  //  Create refs to hold latest state
  const notificationsRef = useRef(notifications);
  const unreadCountRef = useRef(unreadCount);

  //  Update refs whenever state changes
  useEffect(() => {
    notificationsRef.current = notifications;
  }, [notifications]);

  useEffect(() => {
    unreadCountRef.current = unreadCount;
  }, [unreadCount]);

  const fetchInitialData = useCallback(async () => {
    if (!userId) return;

    try {
      const [notifRes, countRes] = await Promise.all([
        getNotifications({ limit: 50 }),
        getUnreadCount(),
      ]);

      console.log("📥 Fetched notifications:", notifRes, countRes);
      setNotifications(notifRes.notifications || []);
      setUnreadCount(countRes.count || 0);
    } catch (err) {
      console.error(" Failed to load notifications", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    console.log(" Setting up notification listeners for user:", userId);

    //  Handler uses functional updates - no stale closure
    const handleNewNotification = (notif) => {
      console.log(" Real-time notification received:", notif);
      
      // Use functional update to get latest state
      setNotifications((prev) => [notif, ...prev.slice(0, 49)]);
      setUnreadCount((c) => c + 1);
    };

    // ✅ Handlers use functional updates
    const handleReadAck = ({ id }) => {
      console.log("✅ Notification marked as read:", id);
      setNotifications((notifs) =>
        notifs.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    };

    const handleAllReadAck = () => {
      console.log("✅ All notifications marked as read");
      setNotifications((notifs) => notifs.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    };

    // Wait for socket to be ready
    const attachListeners = () => {
      if (!socketService.isConnected()) {
        console.warn("⚠️ Socket not connected yet, retrying in 500ms...");
        // setTimeout(attachListeners, 500);
        return;
      }

      console.log("✅ Attaching notification listeners");
      socketService.onNotification(handleNewNotification);
      socketService.onNotificationRead(handleReadAck);
      socketService.onAllNotificationsRead(handleAllReadAck);
      
      fetchInitialData();
    };

    attachListeners();

    // ✅ Cleanup - remove listeners with same function reference
    return () => {
      console.log("🧹 Cleaning up notification listeners");
      socketService.off("notification:new", handleNewNotification);
      socketService.off("notification:read:ack", handleReadAck);
      socketService.off("notification:all_read:ack", handleAllReadAck);
    };
  }, [userId, fetchInitialData]); // Only re-run if userId changes

  const markAsRead = async (id) => {
    setNotifications((notifs) =>
      notifs.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));

    try {
      await markAsReadNotification(id);
      socketService.markNotificationRead(id);
    } catch (err) {
      console.error("❌ Error marking notification as read:", err);
      setNotifications((notifs) =>
        notifs.map((n) => (n.id === id ? { ...n, is_read: false } : n))
      );
      setUnreadCount((c) => c + 1);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((notifs) => notifs.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      await markAllAsReadNotification();
      socketService.markAllNotificationsRead();
    } catch (err) {
      console.error("❌ Error marking all notifications as read:", err);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch: fetchInitialData,
  };
};