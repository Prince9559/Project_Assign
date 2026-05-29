// ============================================
// FIX 1: useSocket.js - Prevent double joining
// ============================================

import { useEffect } from "react";
import { useSelector } from "react-redux";
import socketService from "../services/socketService";

const useSocket = (conversationId = null) => {
  const { token, user } = useSelector((state) => state.auth);

  // EFFECT 1: Main socket connection (runs once per auth change)
  useEffect(() => {
    if (!token || !user?.id) {
      socketService.disconnect();
      return;
    }

    console.log("🔌 Connecting socket for user:", user.id);
    const socket = socketService.connect(token);

    const handleConnect = () => {
      console.log(" Socket connected, joining user room...");
      socketService.joinUserRoom(user.id);
    };

    if (socketService.isConnected()) {
      socketService.joinUserRoom(user.id);
    } else {
      socket.on("connect", handleConnect);
    }

    return () => {
      socket.off("connect", handleConnect);
    };
  }, [token, user?.id]); // Only auth dependencies

  // EFFECT 2: Join conversation room (runs when conversationId changes)
  useEffect(() => {
    if (!conversationId) return;
    
    // Wait for socket to be ready
    const waitForSocket = () => {
      if (!socketService.isConnected()) {
        console.log("⏳ Waiting for socket connection...");
        setTimeout(waitForSocket, 100);
        return;
      }

      console.log("🔌 Joining conversation:", conversationId);
      socketService.joinConversation(conversationId);
    };

    waitForSocket();

    return () => {
      if (socketService.isConnected()) {
        console.log("👋 Leaving conversation:", conversationId);
        socketService.leaveConversation(conversationId);
      }
    };
  }, [conversationId]); 

  return socketService;
};

export default useSocket;
