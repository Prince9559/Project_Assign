// File Path: /client/src/api/chatAPI.js

import axios from 'axios';

import {store} from '../redux/store';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Create axios instance with default config
const chatAPI = axios.create({
  baseURL: `${BASE_URL}/chat`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
chatAPI.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
chatAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ==================== API METHODS ====================

// Create or get conversation
export const createConversation = async ( jobApplicationId) => {
  try {
    const response = await chatAPI.post('/conversations', {
     
      jobApplicationId,
      type: 'job_application'
    });
    console.log("conversation created ", response.data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get user's conversations
export const getConversations = async (page = 1, limit = 20) => {
  try {
    const response = await chatAPI.get('/conversations', {
      params: { page, limit }
    });
    console.log("user all conversations",response.data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


// Get messages for a conversation
export const getMessages = async (conversationId, page = 1, limit = 50) => {
  try {
    const response = await chatAPI.get(`/conversations/${conversationId}/messages`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Send message (REST backup)
export const sendMessage = async (conversationId, content, messageType = 'text', metadata = null) => {
  try {
    const response = await chatAPI.post('/messages', {
      conversationId,
      content,
      messageType,
      metadata
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


// Upload file
export const uploadFile = async (conversationId, file, messageType = 'document') => {
  try {
    const formData = new FormData();
    formData.append('chatFile', file); // 
    formData.append('conversationId', conversationId);
    formData.append("messageType", messageType);
    
    const response = await chatAPI.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data' // axios auto-sets boundary — safe to omit
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Mark conversation as read
export const markAsRead = async (conversationId) => {
  try {
    console.log("marking as read conversationId:", conversationId);
    const response = await chatAPI.patch(`/conversations/${conversationId}/read`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get unread count
export const getUnreadCount = async () => {
  try {
    const response = await chatAPI.get('/unread-count');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Delete message
export const deleteMessage = async (messageId) => {
  try {
    const response = await chatAPI.delete(`/messages/${messageId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default chatAPI;