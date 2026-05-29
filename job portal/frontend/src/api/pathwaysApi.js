// import axios from "axios";
// import { store } from "../redux/store";

// const BASE_URL = import.meta.env.VITE_BASE_URL;
// const API_BASE_URL = `${BASE_URL}/pathways`;





// // Helper to get auth token (adjust as per your setup)
// const getAuthHeader = () => {
//   const token = store.getState().auth.token;
//   return token ? { Authorization: `Bearer ${token}` } : {};
// };

// export const pathwaysApi = {
//   // Get user preferences
//   async getUserPreferences() {
//     const res = await axios.get(`${API_BASE_URL}/preferences`, {
//       headers: getAuthHeader(),
//     });
//     return res.data;
//   },

//   // Update user preferences
//   async updateUserPreferences(preferences) {
//     const res = await axios.put(`${API_BASE_URL}/preferences`, preferences, {
//       headers: getAuthHeader(),
//     });
//     return res.data;
//   },

//   // Generate pathways
//   async generatePathways(payload) {
//     const res = await axios.post(`${API_BASE_URL}/generate-v3`, payload, {
//       headers: getAuthHeader(),
//     });
//     return res.data;
//   },

//   // Get pathway
//   async getPathways() {
//     const res = await axios.get(`${API_BASE_URL}/`, {
//       headers: getAuthHeader(),
//     });
//     return res.data;
//   },

//   // Get pathway by ID (for details)
//   async getPathwayById(pathwayId) {
//     const res = await axios.get(`${API_BASE_URL}/${pathwayId}`, {
//       headers: getAuthHeader(),
//     });
//     return res.data;
//   },

//   // Update pathway status (e.g., "selected")
//   async updatePathwayStatus(pathwayId, status) {
//     const res = await axios.patch(
//       `${API_BASE_URL}/${pathwayId}/status`,
//       { status },
//       { headers: getAuthHeader() }
//     );
//     return res.data;
//   },

//   // Get resource by ID (for detail page)
//   async getResourceById(resourceId) {
//     try {
//       const res = await axios.get(
//         `${API_BASE_URL}/resource/${resourceId}`,
//         {
//           headers: getAuthHeader(),
//         }
//       );
//       return res.data;
//     } catch (err) {
//       console.error("API error:", err);
//       return {
//         success: false,
//         message: err.response?.data?.error || "Resource not found",
//       };
//     }
//   },
// };

























// src/api/pathwaysApi.js
import { useSelector } from 'react-redux';

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_BASE = `${BASE_URL}/pathways/v4`;

// Helper to get auth token (use inside components, not here)
export const pathwaysApi = {
  // Get all pathways for user
  getUserPathways: async (userId, token) => {
    const res = await fetch(`${API_BASE}/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch pathways');
    return res.json();
  },

  // Delete a pathway
  deletePathway: async (pathwayId, token) => {
    const res = await fetch(`${API_BASE}/${pathwayId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to delete pathway');
    return res.json();
  },

  // Get single pathway
  getPathwayById: async (pathwayId, token) => {
    const res = await fetch(`${API_BASE}/${pathwayId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Failed to fetch pathway');
    return res.json();
  },

  // Select pathway
  selectPathway: async (pathwayId, token) => {
    const res = await fetch(`${API_BASE}/${pathwayId}/select`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });
    if (!res.ok) throw new Error('Failed to select pathway');
    return res.json();
  },

  // Generate new pathway
  generatePathway: async (payload, token) => {
    const res = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to generate pathway');
    return res.json();
  }
};