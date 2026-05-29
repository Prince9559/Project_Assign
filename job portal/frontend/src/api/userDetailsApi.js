import axios from "axios";
const BASE_URL = import.meta.env.VITE_BASE_URL;

// API service functions for user details
export const userDetailsApi = {
  // Create user details
  createUserDetails: async (userData, token) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/user-details/saveUserDetails`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error creating user details:", error);
      throw error;
    }
  },

  getUserDetails: async (user_id) => {
    if (!user_id) {
      return { success: false, error: "User ID is required." };
    }
    try {
      const response = await axios.get(
        `${BASE_URL}/user-details/detail/${user_id}`
      );
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching user details:", error);
      return {
        success: false,
        error:
          error?.response?.data?.message ||
          error.message ||
          "Unknown error occurred",
      };
    }
  },

  // Update user details by user_id
  updateUserDetails: async (user_id, userData, token) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/user-details/detail/${user_id}`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error updating user details:", error);
      throw error;
    }
  },

  // Unified method to fetch public user profile data
  getUserPublicProfile: async (user_id, token = null, dataType = "all") => {
    if (!user_id) {
      return { success: false, error: "User ID is required." };
    }
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(
        `${BASE_URL}/user-details/public-profile/${user_id}`,
        { headers }
      );

      if (!response.data) {
        return { success: true, data: null };
      }

      // Return specific data type if requested
      switch (dataType) {
        case "experiences":
          return {
            success: true,
            data: response.data.experiences || [],
          };
        case "education":
          return {
            success: true,
            data: response.data.educations || [],
          };
        case "skills":
          return {
            success: true,
            data: response.data.skills || [],
          };
        case "all":
        default:
          return {
            success: true,
            data: response.data,
          };
      }
    } catch (error) {
      console.error("Error fetching user public profile:", error);
      return {
        success: false,
        error:
          error?.response?.data?.message ||
          error.message ||
          "Unknown error occurred",
      };
    }
  },

  getMiniUserDetails: async (user_id, token) => {
    if (!user_id) {
      return { success: false, error: "User ID is required." };
    }
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`${BASE_URL}/users/getUserData`, {
        headers,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error("Error fetching user details:", error);
      return {
        success: false,
        error:
          error?.response?.data?.message ||
          error.message ||
          "Unknown error occurred",
      };
    }
  },

  getResumeData: async (user_id, token) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/user-details/resume/${user_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.resumeData;
    } catch (error) {
      console.error("Error fetching resume data:", error);
      throw error;
    }
  },

  getProfileCompletion: async (token,detailed = false) => {
      const response = await axios.get(
        `${BASE_URL}/user-details/profile-completion`,
        {
          params: { detailed: detailed },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },

  // Unified method to fetch public user profile data
  getUserPublicProfileByUUID: async (uuid, token = null, dataType = "all") => {
    if (!uuid) {
      return { success: false, error: "Unique User ID (UUID) is required." };
    }
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(
        `${BASE_URL}/user-details/public/${uuid}`,
        { headers }
      );

      if (!response.data) {
        return { success: true, data: null };
      }

      // Return specific data type if requested
      switch (dataType) {
        case "experiences":
          return {
            success: true,
            data: response.data.experiences || [],
          };
        case "education":
          return {
            success: true,
            data: response.data.educations || [],
          };
        case "skills":
          return {
            success: true,
            data: response.data.skills || [],
          };
        case "all":
        default:
          return {
            success: true,
            data: response.data,
          };
      }
    } catch (error) {
      console.error("Error fetching user public profile:", error);
      return {
        success: false,
        error:
          error?.response?.data?.message ||
          error.message ||
          "Unknown error occurred",
      };
    }
  },

  getStudentEducations: async (token) => {
    const response = await axios.get(`${BASE_URL}/student/educations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  uploadEducationProof: async (educationId, proofFile, token) => {
    const formData = new FormData();
    formData.append("education_id", educationId);
    if (proofFile) formData.append("proof_document", proofFile);

    const response = await axios.post(
      `${BASE_URL}/student/upload-education-proof`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  uploadExperienceProof: async (experienceId, proofFile, token) => {
    const formData = new FormData();
    formData.append("experience_id", experienceId);
    if (proofFile) formData.append("proof_document", proofFile);

    const response = await axios.post(
      `${BASE_URL}/employee/upload-experience-proof`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
};

export default userDetailsApi;

