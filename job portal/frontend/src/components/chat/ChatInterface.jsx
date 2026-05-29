
//  ChatInterface.jsx - Fixed Socket Listeners


import React, { useState, useEffect, useRef } from "react";
import { FaPaperPlane, FaPaperclip, FaUser } from "react-icons/fa";
import { useSelector } from "react-redux";
import { getMessages, createConversation, uploadFile } from "../../api/chatApi";
import useSocket from "../../hooks/useSocket";
import AssignmentForm from "../assignments/AssignmentForm";
import InterviewForm from "../interview/InterviewForm";
import AssignmentSubmissionForm from "../assignments/AssignmentSubmissionForm";

const formatTime = (dateString) => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const parseMetadata = (metadata) => {
  if (!metadata) return null;
  if (typeof metadata === "object") return metadata;
  if (typeof metadata === "string") {
    try {
      return JSON.parse(metadata);
    } catch (e) {
      console.warn("Failed to parse metadata:", metadata);
      return null;
    }
  }
  return null;
};

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ChatInterface = ({ jobApplicationId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [otherParticipantName, setOtherParticipantName] = useState("");

  const [expandedImage, setExpandedImage] = useState(null);


  // Inside ChatInterface component
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null); // { id, title, deadline }

  const { user } = useSelector((state) => state.auth);


  // ==================== INITIALIZE CONVERSATION ====================
  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        console.log(" Initializing chat for application:", jobApplicationId);

        const response = await createConversation(jobApplicationId);
        console.log(" Conversation response:", response);

        const convId = response.conversation.id;
        setConversationId(convId);

        const messagesRes = await getMessages(convId, 1, 100);
        console.log("the messages pai", messagesRes);
        console.log(" Loaded messages:", messagesRes.messages?.length);
        setMessages(messagesRes.messages || []);

        console.log("the messages from api stgored", messages);

        const otherParticipant = response.conversation.participants.find(
          (p) => p.user_id !== user.id
        );
        setOtherParticipantName(
          `${otherParticipant?.user?.first_name || ""} ${otherParticipant?.user?.last_name || ""
            }`.trim()
        );

        setLoading(false);
      } catch (error) {
        console.error(" Error initializing chat:", error);
        setLoading(false);
      }
    };

    if (jobApplicationId) {
      initializeChat();
    } else {
      setLoading(false);
    }
  }, [jobApplicationId, user.id]);
  const socket = useSocket(conversationId);

  console.log("ChatInterface - conversationId:", conversationId);
  console.log("Socket connected:", socket.isConnected());

  // ==================== SOCKET SETUP - Join & Mark as Read ====================
  useEffect(() => {
    if (!conversationId || !socket.isConnected()) {
      console.log(" Waiting for socket/conversation...", {
        conversationId,
        connected: socket.isConnected()
      });
      return;
    }

    console.log(" Joining conversation room:", conversationId);
    socket.joinConversation(conversationId);

    // Mark as read when entering chat
    socket.markAsRead(conversationId);

    return () => {
      console.log("Leaving conversation room:", conversationId);
      socket.leaveConversation(conversationId);
    };
  }, [conversationId, socket]);

  // ==================== SOCKET LISTENERS ====================


  useEffect(() => {
    if (!socket || !conversationId) {
      console.log(" Socket listeners not ready", {
        socket: !!socket,
        conversationId
      });
      return;
    }

    console.log(" Attaching chat listeners for conversation:", conversationId);

    //  Handler for new messages - uses functional update
    const handleNewMessage = (msg) => {
      console.log("New message received:", msg);

      // Only add if it's for this conversation
      if (msg.conversation_id !== conversationId && msg.conversationId !== conversationId) {
        console.log(" Message for different conversation, ignoring");
        return;
      }

      console.log("Addding message in the chat, msg");
      setMessages((prevMessages) => {
        // Prevent duplicates
        const exists = prevMessages.some(m => m.id === msg.id);
        if (exists) {
          console.log(" Message already exists, skipping:", msg.id);
          return prevMessages;
        }
        return [...prevMessages, msg];
      });

      console.log("prv mesgs", messages);

      // Mark as read automatically if user is viewing this chat
      socket.markAsRead(conversationId);
    };

    const handleUserTyping = ({ userId }) => {
      console.log(" User typing:", userId);
      if (userId !== user.id) {
        setIsTyping(true);
      }
    };

    const handleUserStopTyping = ({ userId }) => {
      console.log("User stopped typing:", userId);
      if (userId !== user.id) {
        setIsTyping(false);
      }
    };

    const handleMessageDeleted = ({ messageId }) => {
      console.log("Message deleted:", messageId);
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId
            ? { ...msg, is_deleted: true, content: "This message was deleted" }
            : msg
        )
      );
    };

    // Attach listeners
    socket.onNewMessage(handleNewMessage);
    socket.onUserTyping(handleUserTyping);
    socket.onUserStopTyping(handleUserStopTyping);
    socket.onMessageDeleted(handleMessageDeleted);

    console.log(" Chat listeners attached");

    // Cleanup with same function references
    return () => {
      console.log(" Removing chat listeners");
      // socket.off("new_message", handleNewMessage);
      // socket.off("user_typing", handleUserTyping);
      // socket.off("user_stop_typing", handleUserStopTyping);
      // socket.off("message_deleted", handleMessageDeleted);
    };
  }, [socket, conversationId, user.id]); // Only re-run when these change

  // ==================== SEND MESSAGE ====================
  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!newMessage.trim()) {
      console.log(" Empty message, ignoring");
      return;
    }

    if (!conversationId) {
      console.error(" No conversationId");
      return;
    }

    if (!socket.isConnected()) {
      console.error(" Socket not connected");
      alert("Connection lost. Please refresh the page.");
      return;
    }

    console.log(" Sending message:", {
      conversationId,
      content: newMessage.trim().substring(0, 50) + "..."
    });

    socket.sendMessage(conversationId, newMessage.trim(), "text");
    setNewMessage("");
    socket.stopTyping(conversationId);
  };

  // ==================== TYPING HANDLER ====================
  const handleTyping = (e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (!conversationId || !socket.isConnected()) return;

    // Start typing indicator
    socket.startTyping(conversationId);

    // Clear existing timeout and set new one
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      socket.stopTyping(conversationId);
    }, 2000);
  };

  // ==================== FILE UPLOAD ====================
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !conversationId) return;

    setIsUploading(true);
    console.log(" Uploading file:", file.name);

    try {
      const messageType = file.type.startsWith("image/") ? "image" : "document";
      const response = await uploadFile(conversationId, file, messageType);
      console.log(" File uploaded:", response);

      // File message will come via socket listener, no need to add manually

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } catch (err) {
      console.error(" File upload failed:", err);
      alert("Failed to upload file.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  // ==================== AUTO SCROLL ====================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ==================== RENDER ====================
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-600">
        <div className="w-8 h-8 mb-2 border-2 border-gray-200 rounded-full border-t-blue-500 animate-spin"></div>
        <p>Loading chat...</p>
      </div>
    );
  }

  if (!jobApplicationId) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600">
        <p>Invalid chat parameters.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-10 h-10 font-bold text-white bg-blue-500 rounded-full">
            {otherParticipantName.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <h3 className="text-base font-semibold text-gray-800">
              {otherParticipantName || "Chat"}
            </h3>
            <p className="text-xs text-gray-500">
              Application #{jobApplicationId}
            </p>
          </div>
        </div>

        {/* Connection Status Indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${socket.isConnected() ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-xs text-gray-500">
            {socket.isConnected() ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {user.user_role === "COMPANY" && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsAssignmentModalOpen(true)}
              className="text-xs px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition"
            >
              📝 Send Assignment
            </button>
            <button
              onClick={() => setIsInterviewModalOpen(true)}
              className="text-xs px-2.5 py-1 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition"
            >
              📅 Schedule Interview
            </button>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
        {messages.map((msg) => {
          const isSent = msg.sender?.id === user.id || msg.sender_id === user.id;

          const Timestamp = () => (
            <div
              className={`text-[10px] mt-1 ${isSent ? "text-blue-100" : "text-gray-400"
                }`}
            >
              {formatTime(msg.created_at)}
            </div>
          );

          const renderContent = () => {
            if (msg.is_deleted) {
              return (
                <em className="text-sm italic text-gray-500">
                  This message was deleted
                </em>
              );
            }

            switch (msg.message_type) {
              case "assignment": {
                const meta = parseMetadata(msg.metadata);
                return (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 text-sm font-medium text-blue-700">
                      📄 Assignment Assigned
                    </div>
                    <p className="text-sm">{msg.content}</p>
                    {meta?.assignment_url && meta?.file_name && (
                      <a
                        href={`${BASE_URL}/${meta.assignment_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs text-blue-700 bg-blue-100 rounded hover:bg-blue-200"
                      >
                        📥 {meta.file_name}
                      </a>
                    )}
                    {meta?.deadline && (
                      <div className="text-xs text-gray-600">
                        📅 Deadline:{" "}
                        {new Date(meta.deadline).toLocaleDateString("en-IN")}
                      </div>
                    )}


                    {/*  Show Submit button only for students */}
                    {user.user_role === "STUDENT" && (
                      <button
                        onClick={() => {
                          setSelectedAssignment({
                            id: meta?.assignment_id,
                            title: msg.content?.substring(0, 30) + (msg.content?.length > 30 ? "..." : ""),
                            deadline: meta?.deadline,
                          });
                          setIsSubmissionModalOpen(true);
                        }}
                        disabled={!meta?.assignment_id}
                        className="mt-2 text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-full hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                      >
                        Submit Assignment
                      </button>
                    )}
                  </div>
                );
              }
              case "interview_invite": {
                const meta = parseMetadata(msg.metadata);
                return (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 text-sm font-medium text-green-700">
                      🎤 Interview Scheduled
                    </div>
                    <p className="text-sm">{msg.content}</p>
                    <div className="text-xs space-y-0.5 text-gray-700 bg-green-50 p-2 rounded border border-green-100">
                      <div>
                        📆 Date:{" "}
                        {new Date(meta.interview_date).toLocaleDateString(
                          "en-IN"
                        )}
                      </div>
                      <div>
                        🕗 Time: {meta.start_time}
                        {meta.end_time ? ` – ${meta.end_time}` : ""}
                      </div>
                      <div>📍 Type: {meta.interview_type}</div>
                      {meta.video_link && (
                        <a
                          href={meta.video_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-green-600 hover:underline"
                        >
                          🔗 Join Interview
                        </a>
                      )}
                    </div>
                  </div>
                );
              }

              case "assignment_submission": {
                const meta = parseMetadata(msg.metadata);
                return (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1 text-sm font-medium text-purple-700">
                      📤 Assignment Submitted
                    </div>
                    {msg.content && msg.content !== 'Submitted assignment.' && (
                      <p className="text-sm">{msg.content}</p>
                    )}
                    {meta?.file_url && meta?.file_name && (
                      <a
                        href={`${BASE_URL}${meta.file_url.startsWith('/') ? '' : '/'}${meta.file_url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs text-purple-700 bg-purple-100 rounded hover:bg-purple-200"
                      >
                        📥 {meta.file_name}
                      </a>
                    )}
                    {meta?.submission_id && (
                      <div className="text-xs text-gray-500">
                        Submission ID: #{meta.submission_id}
                      </div>
                    )}
                  </div>
                );
              }
              case "document":
              case "image":
                if (msg.attachments?.[0]) {
                  const att = msg.attachments[0];
                  const isImg = att.file_type.startsWith("image/");
                  const imageUrl = `${BASE_URL}/${att.file_path.replace(/\\/g, "/")}`;
                  return (
                    <div className="space-y-1">
                      {isImg ? (
                        <img
                          src={`${BASE_URL}/${att.file_path.replace(
                            /\\/g,
                            "/"
                          )}`}
                          alt="Attachment"
                          className="max-w-[300px] max-h-[300px] rounded-lg object-contain border"
                          onClick={() => setExpandedImage(imageUrl)}
                        />
                      ) : (
                        <a
                          href={`${BASE_URL}/${att.file_path.replace(
                            /\\/g,
                            "/"
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline"
                        >
                          📎 {att.file_name}
                        </a>
                      )}
                    </div>
                  );
                }
                return <p className="text-sm">{msg.content || "Attachment"}</p>;
              default:
                return (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                );
            }
          };

          return (
            <div
              key={msg.id}
              className={`flex ${isSent ? "justify-end" : "justify-start"}`}
            >
              {!isSent && (
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mr-2 text-xs text-white bg-gray-300 rounded-full">
                  <FaUser size={12} />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${isSent
                  ? "bg-blue-500 text-white rounded-tr-none"
                  : "bg-white text-gray-800 rounded-tl-none border border-gray-200"
                  }`}
              >
                {!isSent && msg.sender && (
                  <div className="text-[11px] font-medium mb-0.5 text-gray-700">
                    {msg.sender.first_name} {msg.sender.last_name}
                  </div>
                )}
                {renderContent()}
                <Timestamp />
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex justify-start">
            <div className="px-3 py-2 text-sm text-gray-600 bg-gray-200 rounded-xl">
              Typing...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-3 bg-white border-t border-gray-200"
      >
        <div className="flex items-center">
          <label
            htmlFor="chat-file"
            className="mr-2 text-gray-500 cursor-pointer hover:text-gray-700"
          >
            {isUploading ? "📤" : <FaPaperclip size={18} />}
            <input
              id="chat-file"
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
              disabled={isUploading}
            />
          </label>
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-400"
            disabled={!socket.isConnected()}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !socket.isConnected()}
            className={`ml-2 w-9 h-9 rounded-full flex items-center justify-center ${!newMessage.trim() || !socket.isConnected()
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
          >
            <FaPaperPlane size={16} />
          </button>
        </div>
      </form>

      {/* Modals - keeping your existing modal code */}
      {isAssignmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl w-[650px] max-w-[95vw] max-h-[90vh] overflow-auto p-5 relative">
            <button
              onClick={() => setIsAssignmentModalOpen(false)}
              className="absolute text-gray-500 top-3 right-3 hover:text-gray-800"
            >
              ✕
            </button>
            <AssignmentForm
              applicationId={jobApplicationId}
              applicantName={otherParticipantName}
              onSuccess={() => setIsAssignmentModalOpen(false)}
              onCancel={() => setIsAssignmentModalOpen(false)}
            />
          </div>
        </div>
      )}

      {isInterviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl w-[600px] max-w-[95vw] max-h-[90vh] overflow-auto p-5 relative">
            <button
              onClick={() => setIsInterviewModalOpen(false)}
              className="absolute text-gray-500 top-3 right-3 hover:text-gray-800"
            >
              ✕
            </button>
            <h2 className="mb-4 text-lg font-bold">Schedule Interview</h2>
            <InterviewForm
              applicationId={jobApplicationId}
              applicantName={otherParticipantName}
              onSuccess={() => setIsInterviewModalOpen(false)}
              onCancel={() => setIsInterviewModalOpen(false)}
            />
          </div>
        </div>
      )}


      {/* Assignment Submission Modal */}
      {isSubmissionModalOpen && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-xl w-[650px] max-w-[95vw] max-h-[90vh] overflow-auto p-5 relative">
            <button
              onClick={() => {
                setIsSubmissionModalOpen(false);
                setSelectedAssignment(null);
              }}
              className="absolute text-gray-500 top-3 right-3 hover:text-gray-800"
            >
              ✕
            </button>
            <AssignmentSubmissionForm
              assignmentId={selectedAssignment.id}
              assignmentTitle={selectedAssignment.title}
              deadline={selectedAssignment.deadline}
              onSuccess={() => {
                setIsSubmissionModalOpen(false);
                setSelectedAssignment(null);
              }}
              onCancel={() => {
                setIsSubmissionModalOpen(false);
                setSelectedAssignment(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Expanded Image Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={() => setExpandedImage(null)} // Close on backdrop click
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <button
              className="absolute z-10 flex items-center justify-center w-8 h-8 text-white bg-black bg-opacity-50 rounded-full top-4 right-4 hover:bg-opacity-75"
              onClick={(e) => {
                e.stopPropagation(); // Prevent closing parent
                setExpandedImage(null);
              }}
            >
              ✕
            </button>
            <img
              src={expandedImage}
              alt="Expanded"
              className="max-w-[90vw] max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
