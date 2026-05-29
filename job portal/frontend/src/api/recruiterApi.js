import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// API service functions for company recruiter profile
export const recruiterApi = {
  // Create a new company recruiter profile
  createProfile: async (profileData, token) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/company-recruiter/profile`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get company recruiter profile
  getProfile: async (token) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/company-recruiter/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update company recruiter profile
  updateProfile: async (profileData, token) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/company-recruiter/profile`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getDashboardStats: async (token) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/company-recruiter/dashboardStats`,
        {
          headers: {
            "content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data; // { jobsPosted, pendingTasks, upcomingInterviews }
    } catch (error) {
      throw error;
    }
  },

  // Get job posts by recruiter
  getJobPostsByRecruiter: async (token) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/company-recruiter/jobpost/list`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  //To manage applications
  getPipelineCandidates: async (token) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/company-recruiter/candidates`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data; // returns { message, total, pipeline }
    } catch (error) {
      console.error("Error fetching pipeline candidates:", error);
      throw error;
    }
  },

  // Get AllUpcomingInterviews for the recruiter
  getAllUpcomingInterviews: async (token) => {
    if (!token) {
      throw new Error("No auth token provided");
    }

    try {
      const response = await axios.get(
        `${BASE_URL}/interview-invitations/upcoming/all`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        "Error fetching all upcoming interviews:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // recruiterApi.js
  updateInterviewStatus: async (token, interviewId, status) => {
    const response = await axios.patch(
      `${BASE_URL}/interview-invitations/${interviewId}/status`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  },

  //To get recruiter email alert settings
  getRecruiterAlertSettings: async (token) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/company-recruiter/email-alert-settings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching recruiter alert settings", error);
      throw error;
    }
  },

  //To update the alert settings
  updateRecruiterAlertSettings: async (token, frequency) => {
    try {
      const response = await axios.patch(
        `${BASE_URL}/company-recruiter/email-alert-settings`,
        { email_alert_frequency: frequency },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error updating recruiter alert settings", error);
      throw error;
    }
  },

  // Get company recruiter profile
  getProfileCompletion: async (token) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/user-details/profile-completion?detailed=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getAllEmployees: async (token) => {
    const response = await axios.get(`${BASE_URL}/company/employees`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  removeEmployee: async (payload, token) => {
    const response = await axios.post(`${BASE_URL}/company/remove-employee`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  getPendingEmployeeApprovals: async (token) => {
    const response = await axios.get(`${BASE_URL}/company/pending-approvals`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  approveEmployee: async (payload, token) => {
    const response = await axios.post(`${BASE_URL}/company/approve-employee`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  rejectEmployee: async (payload, token) => {
    const response = await axios.post(`${BASE_URL}/company/reject-employee`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },
};