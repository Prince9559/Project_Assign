// src/api/universityy.js
import axios from "axios";

import {store} from "../redux/store";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const API = axios.create({
  baseURL: `${BASE_URL}`,
  timeout: 15000,
  paramsSerializer: {
    indexes: null, // ← prevents jobProfile[] → jobProfile
  },
});

// Add auth header if needed (e.g., JWT in localStorage)
API.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
  return config;
});

export const getUniversityJobs = async (params = {}) => {
    console.log("Calling api now");
  const res = await API.get("/opportunities/university", {
    params: {
      limit: 10,
      ...params,
    },
  });
  console.log("get jobs data universit",res.data);
  return res.data;
};

export const getUniversityJobDetailById = async (job_id) => {
    console.log("Calling api now");
  const res = await API.get(`/opportunities/university/${job_id}`);
  console.log("get jobs data universit",res.data);
  return res.data;
};

export const unlockContact = async (data={}) => {
    console.log("Calling unlock api now", data);
  const res = await API.post(`/university/unlock-contact`,
    data
  );
  console.log("unlock contact ",res.data);
  return res.data;
};
