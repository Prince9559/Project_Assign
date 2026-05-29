// src/components/chat/ConversationSidebar.jsx
import React, { useEffect, useState, useCallback } from "react";
import { getConversations } from "../../api/chatApi";
import { useSelector } from "react-redux";
import { User, MessageSquare, Clock } from "lucide-react";

const ConversationSidebar = ({
  onConversationSelect, // Callback: (conversation) => void
  selectedConversationId = null,
  maxConversations = 20,
  compact = false, // if true, smaller height & no header
}) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentUser = useSelector((state) => state.auth.user);
  const isStudent = currentUser?.role === "STUDENT";
  const isRecruiter = currentUser?.role === "COMPANY";
  // Later: isUniversity = currentUser?.role === "UNIVERSITY";

  const fetchConversations = useCallback(async () => {
    if (!currentUser?.id) {
      setLoading(false);
      return;
    }

    try {
      const data = await getConversations(1, maxConversations);
      setConversations(data.conversations || []);
    } catch (err) {
      console.error("Failed to load conversations:", err);
      setError("Unable to load chats.");
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, maxConversations]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const getOtherParticipant = (participants) => {
    return participants.find((p) => p.user_id !== currentUser.id)?.user || {};
  };

  const getDisplayName = (conv) => {
    // If enhanced context exists
    if (conv.context?.otherParticipant?.name) {
      return conv.context.otherParticipant.name;
    }

    // Fallback
    const other = conv.participants.find((p) => p.user_id !== currentUser.id);
    return other?.user
      ? `${other.user.first_name} ${other.user.last_name}`
      : "Unknown";
  };

  const getSubtitle = (conv) => {
    if (conv.context?.jobRoleTitle) {
      return conv.context.jobRoleTitle;
    }
    return `Application #${conv.job_application_id}`;
  };

  const getJobInfo = (conv) => {
    // Try to get job role from enriched context (if backend sends it)
    if (conv.context?.jobRoleTitle) {
      return conv.context.jobRoleTitle;
    }
    // Fallback to job post title
    if (conv.application?.jobPost?.title) {
      return conv.application.jobPost.title;
    }
    // Last fallback
    return `Application #${conv.job_application_id}`;
  };

  const getConversationTitle = (conv) => {
    const { context, participants } = conv;
    const { otherParticipant, jobRoleTitle, companyName, applicationStatus } =
      context;

    // Fallback if context incomplete
    if (!otherParticipant || !jobRoleTitle) {
      return "Chat";
    }

    const name = otherParticipant.name || "Applicant";
    const roleTitle = jobRoleTitle;
    const company = companyName || "Company";

    if (isStudent) {
      // Student sees: "Priya Mehta — Alpha Corp — Frontend Intern"
      return `${name} — ${company} — ${roleTitle}`;
    }

    if (isRecruiter) {
      // Recruiter sees: "Rahul Sharma — Frontend Intern"
      return `${name} — ${roleTitle}`;
    }

    // Future: University staff
    // return `${name} (${otherParticipant.university || '?'}) — ${company} — ${roleTitle}`;
    return `${name} — ${roleTitle} — ${company}`;
  };

  const getStatusBadge = (status) => {
    const config = {
      Applied: { text: "Applied", color: "bg-blue-100 text-blue-800" },
      Screening: { text: "Screening", color: "bg-purple-100 text-purple-800" },
      Interviewing: {
        text: "Interview",
        color: "bg-yellow-100 text-yellow-800",
      },
      Offered: { text: "Offer", color: "bg-orange-100 text-orange-800" },
      Hired: { text: "Hired", color: "bg-green-100 text-green-800" },
      Rejected: { text: "Rejected", color: "bg-gray-100 text-gray-700" },
    };
    const { text, color } = config[status] || config.Applied;
    return { text, color };
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

  if (error) {
    return (
      <div className="p-4 text-xs text-center text-gray-500">
        <MessageSquare size={16} className="mx-auto mb-1" />
        {error}
      </div>
    );
  }

  return (
    <div
      className={`${
        compact ? "" : "p-2 border-r border-gray-200"
      } h-full overflow-y-auto`}
    >
      {!compact && (
        <div className="px-3 py-2 mb-2">
          <h3 className="font-semibold text-gray-800">Chats</h3>
        </div>
      )}

      {conversations.length === 0 ? (
        <div className="px-3 py-6 text-xs text-center text-gray-500">
          <MessageSquare size={18} className="mx-auto mb-2 text-gray-400" />
          No conversations yet
        </div>
      ) : (
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
                className={`flex items-center p-2.5 rounded-lg cursor-pointer transition ${
                  isSelected
                    ? "bg-blue-100 border border-blue-200"
                    : "hover:bg-gray-50"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium ${
                    otherUser.first_name ? "bg-blue-500" : "bg-gray-400"
                  }`}
                >
                  {otherUser.first_name ? (
                    otherUser.first_name.charAt(0).toUpperCase()
                  ) : (
                    <User size={12} />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 ml-3">
                  <div className="flex items-baseline justify-between">
                    <p
                      className={`text-sm font-medium truncate ${
                        unread ? "text-gray-900" : "text-gray-700"
                      }`}
                    >
                      {otherUser.first_name || otherUser.last_name
                        ? `${otherUser.first_name || ""} ${
                            otherUser.last_name || ""
                          }`.trim()
                        : "User"}
                    </p>
                    {lastMessage?.created_at && (
                      <span className="ml-1 text-xs text-gray-400">
                        {formatTime(lastMessage.created_at)}
                      </span>
                    )}
                  </div>

                  {/* Job Info — always visible below name */}
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {isRecruiter ? "Job Role-" : "Applied for-"}
                    {getJobInfo(conv)}
                  </p>

                  {/* Preview */}
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
                    {/* Optional: add role badge */}
                    {conv.context?.otherParticipantType === "STUDENT" && (
                      <span className="ml-2 text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                        Student
                      </span>
                    )}
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
      )}
    </div>
  );
};


export default ConversationSidebar;
