// src/api/universityPayment.js
import axios from "axios";
import { store } from "../../redux/store";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Helper: get token from Redux state
const getToken = () => {
  return store.getState().auth?.token;
};

// Create axios instance with dynamic token
const api = axios.create({
  baseURL: BASE_URL,
});

// Add request interceptor to attach token on every call
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Export API functions
export const getCreditPackages = () => {
  return api.get("/university/credit-packages");
};

export const createCreditOrder = (packageId) => {
  return api.post("/university/credit-orders", { package_id: packageId });
};

export const getCreditStatus = () => {
  return api.get("/university/credit-status");
};

export const getCreditDashboard = () => {
  return api.get("/university/credit-dashboard");
};

export const getCreditTransactions = () => {
  return api.get("/university/credit-transactions");
};