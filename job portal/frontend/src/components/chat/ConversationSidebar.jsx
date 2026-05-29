// src/components/chat/ConversationSidebar.jsx
import React, { useEffect, useState, useCallback, useRef } from "react";
import { getConversations } from "../../api/chatApi";
import { useSelector } from "react-redux";
import { User, MessageSquare } from "lucide-react";
import useSocket from "../../hooks/useSocket";

const ConversationSidebar = ({
  onConversationSelect,
  selectedConversationId = null,
  maxConversations = 20,
  compact = false,
}) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = useSelector((state) => state.auth.user);
  const socket = useSocket();

  const isStudent = currentUser?.role === "STUDENT";
  const isRecruiter = currentUser?.role === "COMPANY";

  // Refs to avoid stale closures
  const conversationsRef = useRef(conversations);
  const currentUserRef = useRef(currentUser);

  useEffect(() => {
    conversationsRef.current = conversations;
    currentUserRef.current = currentUser;
  }, [conversations, currentUser]);

  // Fetch conversations and join rooms
  const fetchConversations = useCallback(async () => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    try {
      console.log("Fetching conversations...");
      const data = await getConversations(1, maxConversations);
      const convList = data.conversations || [];
      setConversations(convList);
      conversationsRef.current = convList;

      // Join conversation rooms with retry
      let attempts = 0;
      const maxAttempts = 10;
      const joinRooms = () => {
        if (socket?.isConnected() && convList.length > 0) {
          console.log(`Joining ${convList.length} conversation rooms...`);
          convList.forEach(conv => {
            socket.joinConversation(conv.id);
            console.log(`Joined room for conversation: ${conv.id}`);
          });
        } else if (attempts < maxAttempts) {
          attempts++;
          setTimeout(joinRooms, 300);
        } else {
          console.warn("Gave up joining conversation rooms after retries");
        }
      };
      joinRooms();
    } catch (err) {
      console.error("Failed to load conversations:", err);
      setError("Unable to load chats.");
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, maxConversations, socket]);

  // Optimistically reset unread count when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      console.log("Optimistically resetting unread count for:", selectedConversationId);
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );
    }
  }, [selectedConversationId]);

  // Socket real-time listeners
  useEffect(() => {
    if (!currentUser?.id || !socket) {
      console.log("Skipping socket setup: no user or socket");
      return;
    }

    // Wait for connection if needed
    if (!socket.isConnected()) {
      const tryAttach = () => {
        if (socket.isConnected()) {
          console.log("Socket connected - attaching listeners");
          attachListeners();
        } else {
          setTimeout(tryAttach, 300);
        }
      };
      tryAttach();
      return;
    }

    console.log("Attaching socket listeners immediately");
    attachListeners();

    function attachListeners() {
      const handleNewMessage = (message) => {
        const currentUserId = currentUserRef.current?.id;
        const convId = message.conversation_id;

        if (!currentUserId || !convId) {
          console.warn("Invalid message payload", { message });
          return;
        }

        console.log("Received new_message:", {
          conversation_id: convId,
          sender_id: message.sender_id,
          selectedConversationId,
          isFromOther: message.sender_id !== currentUserId,
        });

        setConversations(prev => {
          const idx = prev.findIndex(c => c.id === convId);
          if (idx === -1) {
            console.log("Message for unknown conversation, ignoring");
            return prev;
          }

          const isFromOther = message.sender_id !== currentUserId;
          const isActive = convId === selectedConversationId;
          const shouldIncrement = isFromOther && !isActive;

          console.log("Unread logic:", {
            isFromOther,
            isActive,
            shouldIncrement,
            currentUnread: prev[idx].unreadCount || 0,
          });

          const updatedConv = {
            ...prev[idx],
            last_message_at: message.created_at,
            messages: [message],
            unreadCount: shouldIncrement
              ? (prev[idx].unreadCount || 0) + 1
              : 0,
          };

          const updatedList = [...prev];
          updatedList[idx] = updatedConv;
          updatedList.sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));
          return updatedList;
        });
      };

      const handleMessageRead = ({ conversation_id, reader_id }) => {
        if (reader_id !== currentUserRef.current?.id) return;
        console.log("Marked as read by self, resetting unread:", conversation_id);
        setConversations(prev =>
          prev.map(c =>
            c.id === conversation_id ? { ...c, unreadCount: 0 } : c
          )
        );
      };

      const handleMessageDeleted = ({ conversation_id, messageId }) => {
        setConversations(prev =>
          prev.map(c =>
            c.id === conversation_id && c.messages?.[0]?.id === messageId
              ? {
                ...c,
                messages: [{
                  ...c.messages[0],
                  content: "This message was deleted",
                  is_deleted: true,
                }],
              }
              : c
          )
        );
      };

      // Attach listeners
      socket.on("new_message", handleNewMessage);
      socket.on("message_read", handleMessageRead);
      socket.on("message_deleted", handleMessageDeleted);

      return () => {
        console.log("Cleaning up socket listeners");
        socket.off("new_message", handleNewMessage);
        socket.off("message_read", handleMessageRead);
        socket.off("message_deleted", handleMessageDeleted);
      };
    }
  }, [currentUser?.id, socket, selectedConversationId]);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Helper functions
  const getOtherParticipant = (participants) => {
    return participants.find((p) => p.user_id !== currentUser.id)?.user || {};
  };

  const getJobInfo = (conv) => {
    if (conv.context?.jobRoleTitle) return conv.context.jobRoleTitle;
    if (conv.application?.jobPost?.title) return conv.application.jobPost.title;
    return `Application #${conv.job_application_id}`;
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // Render loading state
  if (loading) {
    return (
      <div className={`${compact ? "p-2" : "p-4"} space-y-3`}>
        {[...Array(compact ? 3 : 5)].map((_, i) => (
          <div key={i} className="flex items-center">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="flex-1 ml-3">
              <div className="w-3/4 h-3 mb-1 bg-gray-200 rounded"></div>
              <div className="w-1/2 h-2 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-4 text-xs text-center text-gray-500">
        <MessageSquare size={16} className="mx-auto mb-1" />
        {error}
      </div>
    );
  }

  // Render empty state
  if (conversations.length === 0) {
    return (
      <div className="px-3 py-6 text-xs text-center text-gray-500">
        <MessageSquare size={18} className="mx-auto mb-2 text-gray-400" />
        No conversations yet
      </div>
    );
  }

  // Render conversations list
  return (
    <div className={`${compact ? "" : "p-2 border-r border-gray-200"} h-full overflow-y-auto`}>
      {!compact && (
        <div className="px-3 py-2 mb-2">
          <h3 className="font-semibold text-gray-800">Chats</h3>
        </div>
      )}
      <div className="space-y-1">
        {conversations.map((conv) => {
          const otherUser = getOtherParticipant(conv.participants);
          const lastMessage = conv.messages?.[0];
          const isSelected = conv.id === selectedConversationId;
          const unread = conv.unreadCount > 0;

          return (
            <div
              key={conv.id}
              onClick={() => onConversationSelect?.(conv)}
              className={`flex items-center p-2.5 rounded-lg cursor-pointer transition ${isSelected ? "bg-blue-100 border border-blue-200" : "hover:bg-gray-50"
                }`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${otherUser.first_name ? "bg-blue-500" : "bg-gray-400"
                }`}>
                {otherUser.first_name ? (
                  otherUser.first_name.charAt(0).toUpperCase()
                ) : (
                  <User size={12} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 ml-3">
                <div className="flex items-baseline justify-between">
                  <p className={`text-sm font-medium truncate ${unread ? "text-gray-900" : "text-gray-700"}`}>
                    {otherUser.first_name || otherUser.last_name
                      ? `${otherUser.first_name || ""} ${otherUser.last_name || ""}`.trim()
                      : "User"}
                  </p>
                  {lastMessage?.created_at && (
                    <span className="ml-1 text-xs text-gray-400">
                      {formatTime(lastMessage.created_at)}
                    </span>
                  )}
                </div>

                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {isRecruiter ? "Job Role-" : "Applied for-"}
                  {getJobInfo(conv)}
                </p>

                <div className="flex items-center mt-0.5">
                  {unread && (
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-1"></span>
                  )}
                  <p className="text-xs text-gray-500 truncate">
                    {lastMessage
                      ? lastMessage.message_type === "file"
                        ? "📎 File"
                        : lastMessage.content
                      : getJobInfo(conv)}
                  </p>
                </div>
              </div>

              {/* Unread badge */}
              {unread && conv.unreadCount > 0 && (
                <span className="flex-shrink-0 ml-2 bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">
                  {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationSidebar;