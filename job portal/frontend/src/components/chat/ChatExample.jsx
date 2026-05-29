// File Path: /client/src/components/Chat/ChatExample.jsx
// This is a basic example showing how to use the socket service

import React, { useState, useEffect, useRef } from 'react';
import useSocket from '../../hooks/useSocket';
import { getMessages, createConversation, uploadFile } from '../../api/chatApi';
import { useSelector } from "react-redux";
const BASE_URL = import.meta.env.VITE_BASE_URL;

const ChatExample = ({ recipientId, recipientType, jobApplicationId = null }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Get token from your auth context/localStorage
  const { token,user } = useSelector((state) => state.auth);
  
  // Initialize socket
  const socket = useSocket(conversationId);

  // ==================== INITIALIZE CONVERSATION ====================
  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Create or get existing conversation
        const response = await createConversation(recipientId, recipientType, jobApplicationId);
        setConversationId(response.conversation.id);
        
        // Fetch initial messages
        const messagesResponse = await getMessages(response.conversation.id);
        setMessages(messagesResponse.messages);
        
        setLoading(false);
      } catch (error) {
        console.error('Error initializing chat:', error);
        setLoading(false);
      }
    };

    initializeChat();
  }, [recipientId, recipientType, jobApplicationId]);

  // ==================== JOIN CONVERSATION ====================
  useEffect(() => {
    if (conversationId && socket.isConnected()) {
      socket.joinConversation(conversationId);

      // Mark as read when opening chat
      socket.markAsRead(conversationId);
    }

    return () => {
      if (conversationId) {
        socket.leaveConversation(conversationId);
      }
    };
  }, [conversationId, socket]);

  // ==================== SOCKET EVENT LISTENERS ====================
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    const handleNewMessage = (message) => {
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    };

    // Listen for typing indicator
    const handleUserTyping = ({ userId }) => {
      setIsTyping(true);
    };

    const handleUserStopTyping = ({ userId }) => {
      setIsTyping(false);
    };

    // Listen for message deletion
    const handleMessageDeleted = ({ messageId }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, is_deleted: true, content: 'This message was deleted' }
          : msg
      ));
    };

    socket.onNewMessage(handleNewMessage);
    socket.onUserTyping(handleUserTyping);
    socket.onUserStopTyping(handleUserStopTyping);
    socket.onMessageDeleted(handleMessageDeleted);

    // Cleanup listeners
    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
      socket.off('message_deleted', handleMessageDeleted);
    };
  }, [socket, conversationId]);

  // ==================== SEND MESSAGE ====================
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !conversationId) return;

    // Send via socket
    socket.sendMessage(conversationId, newMessage.trim());
    
    // Clear input
    setNewMessage('');
    socket.stopTyping(conversationId);
  };

  // ==================== TYPING INDICATOR ====================
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (conversationId) {
      socket.startTyping(conversationId);
      
      // Stop typing after 2 seconds of no activity
      clearTimeout(window.typingTimeout);
      window.typingTimeout = setTimeout(() => {
        socket.stopTyping(conversationId);
      }, 2000);
    }
  };

  // ==================== FILE UPLOAD ====================
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !conversationId) return;

    try {
      const messageType = file.type.startsWith('image/') ? 'image' : 'document';
      await uploadFile(conversationId, file, messageType);
      // Message will be received via socket event
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file');
    }
  };

  // ==================== SCROLL TO BOTTOM ====================
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ==================== RENDER ====================
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading chat...</div>;
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white bg-blue-600">
        <h2 className="text-xl font-semibold">Chat</h2>
        <span
          className={`text-sm ${
            socket.isConnected() ? "text-green-300" : "text-red-300"
          }`}
        >
          {socket.isConnected() ? "● Online" : "○ Offline"}
        </span>
      </div>

      {/* Messages Container */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.senderId === parseInt(user.id)
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.senderId === parseInt(user.id)
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-800 border border-gray-200"
              }`}
            >
              {/* Sender name (for received messages) */}
              {msg.senderId !== parseInt(user.id) && (
                <p className="mb-1 text-xs text-gray-500">{msg.sender?.name || (msg.sender?.first_name + " " + msg.sender?.last_name) }</p>
              )}

              {/* Message content */}
              <p className={msg.is_deleted ? "italic text-gray-400" : ""}>
                {msg.content}
              </p>

              {/* File attachment */}
              {msg.metadata?.fileName && (
                <a
                  href={`${BASE_URL}/${msg.metadata.filePath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 text-xs underline"
                >
                  📎 {msg.metadata.fileName}
                </a>
              )}

              {/* Timestamp */}
              <p className="mt-1 text-xs opacity-75">
                {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="px-4 py-2 bg-gray-200 rounded-lg">
              <span className="text-sm text-gray-600">Typing...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center space-x-2"
        >
          {/* File upload */}
          <label className="text-gray-500 cursor-pointer hover:text-blue-600">
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            />
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </label>

          {/* Text input */}
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500"
          />

          {/* Send button */}
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="p-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatExample;

/* 
USAGE IN YOUR APPLICATION:

import ChatExample from './components/Chat/ChatExample';

// For student-recruiter chat from job application
<ChatExample 
  recipientId={recruiterId} 
  recipientType="recruiter"
  jobApplicationId={123}
/>

// For general chat
<ChatExample 
  recipientId={userId} 
  recipientType="student"
/>
*/