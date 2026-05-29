// File Path: /client/src/api/analyticsApi.js

import axios from 'axios';

import {store} from '../redux/store';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Create axios instance with default config
const analyticsApi = axios.create({
  baseURL: `${BASE_URL}/analytics`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
analyticsApi.interceptors.request.use(
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
analyticsApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ==================== API METHODS ====================

// GEt profile views for logged in user
export const getProfileViews = async (token) => {
  try {
    const response = await analyticsApi.get("/profile/views/me");
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};


export default analyticsApi;