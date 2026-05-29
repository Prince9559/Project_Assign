// src/api/teamApi.js
import axios from "axios";
import {store} from '../redux/store';

const BASE_URL = import.meta.env.VITE_BASE_URL 

const teamApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach token
teamApi.interceptors.request.use((config) => {
  const token = store.getState().auth.token; 
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Error handler
teamApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      // Optionally redirect to /unauthorized
    }
    return Promise.reject(error);
  }
);

//  Public
export const getPermissions = () => teamApi.get("/team/permissions");

//  Authenticated
export const getRoles = () => teamApi.get("/team/roles");
export const createRole = (data) => teamApi.post("/team/roles", data);

export const getRoleById = (roleId) =>
  teamApi.get(`/team/roles/${roleId}`);

export const updateRole = async (roleId, payload) => {
  return await teamApi.put(`team/roles/${roleId}`, payload);
};


export const getTeamMembers = () => teamApi.get("/team/members");
export const addTeamMember = (data) => teamApi.post("/team/members", data);
export const updateMemberRole = (membershipId, roleId) =>
  teamApi.patch(`/team/members/${membershipId}/role`, { roleId });
export const removeTeamMember = (membershipId) =>
  teamApi.delete(`/team/members/${membershipId}`);

//  Add team member (synchronous — full user data)
export const addTeamMemberSync = (data) =>
  teamApi.post("/team/members", {
    first_name: data.firstName,
    last_name: data.lastName,
    email: data.email,
    phone: data.phone,
    password: data.password,
    roleId: data.roleId,
  });

export const deleteRole = (roleId) =>
  teamApi.delete(`/team/roles/${roleId}`);

//  Assign job access to a user
export const assignJobAccess = (jobId, userId, accessLevel) =>
  teamApi.post(`/team/jobs/${jobId}/assign`, {
    userId,
    accessLevel, // 'view' | 'edit' | 'manage'
  });

  //  Get active jobs for company
export const getCompanyJobs = () => teamApi.get("/team/jobs");

// Get current access for a job
export const getJobAccess = (jobId) => {
  return teamApi.get(`/team/jobs/${jobId}/access`);
};

// Update access level
export const updateJobAccess = (jobId, userId, accessLevel) => {
  return teamApi.put(`/team/jobs/${jobId}/access/${userId}`, { accessLevel });
};

// Revoke access
export const removeJobAccess = (jobId, userId) => {
  return teamApi.delete(`/team/jobs/${jobId}/access/${userId}`);
};





// Toggle member status: active | suspended
export const toggleMemberStatus = (membershipId, status, options = {}) =>
  teamApi.patch(`/team/members/${membershipId}/status`, {
    status,
    sendNotification: options.sendNotification !== false,
    reason: options.reason || null
  });

// Change member password (manager action)
export const changeMemberPassword = (membershipId, newPassword, options = {}) =>
  teamApi.patch(`/team/members/${membershipId}/password`, {
    newPassword,
    sendEmail: options.sendEmail !== false
  });

// Update member details (name, email, phone)
export const updateMemberDetails = (membershipId, details) =>
  teamApi.patch(`/team/members/${membershipId}/details`, {
    first_name: details.firstName,
    last_name: details.lastName,
    email: details.email,
    phone: details.phone
  });

// Get single member details
export const getMember = (membershipId) =>
  teamApi.get(`/team/members/${membershipId}`);