
//notificationapi.js
import axios from 'axios';
import {store} from '../redux/store';

const BASE_URL = import.meta.env.VITE_BASE_URL;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


const getAuthHeader = () => {
  const token = store.getState().auth.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};


api.interceptors.request.use((config) => {
  config.headers = { ...config.headers, ...getAuthHeader() };
  return config;
});

export const getNotifications = (params = {}) => {
  return api.get('/notifications', { params }).then(res => res.data);
};

export const markAsReadNotification = (id) => {
  return api.patch(`/notifications/${id}/read`).then(res => res.data);
};

export const markAllAsReadNotification = () => {
  return api.patch('/notifications/mark-all-read').then(res => res.data);
};

export const getUnreadCount = () => {
  return api.get('/notifications/unread-count').then(res => res.data);
};