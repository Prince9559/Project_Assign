import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// API service functions for job posting
export const jobPostApi = {
  // Create a new job post
  createJobPost: async (jobPostData, token) => {

    if (!token) {
      throw new Error('No auth token provided');
    }
    const response = await axios.post(`${BASE_URL}/jobpost/create`, jobPostData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;

  },


  // Get job posts by recruiter
  getJobPostsByRecruiter: async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/company-recruiter-profile/jobpost/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },


  // Get job posts by recruiter
  getJobDraft: async (job_id,token) => {
      const response = await axios.get(`${BASE_URL}/jobpost/getDraft/${job_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log("the draft data coming fomr api", response.data);
      return response.data;
  },

  // Get total job posts count by recruiter
  getTotalJobPostsCount: async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/jobpost/totalcount`, {
        headers: {
          'content-type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
 

  getPendingTasks: async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/pendingtask/grouped`, {
        headers: {
          Authorization: `Bearer ${token}`, // add if required
          "Content-Type": "application/json",
        },
      });

      return response.data; // { resumeReview: { count }, interviewToSchedule: { count }, offerLetterPending: { count } }
    } catch (error) {
      console.error("Error fetching pending tasks:", error);
      throw error;
    }
  },


  getJobPostingPreview: async (post_type,opportunity_type,token) => {
    try {
      const res = await axios.get(`${BASE_URL}/jobs/preview`, {
        params: { post_type, opportunity_type },
        headers: { Authorization: `Bearer ${token} ` },
      });

      return res.data; // { resumeReview: { count }, interviewToSchedule: { count }, offerLetterPending: { count } }
    } catch (error) {
      console.error("Error in getting job post preview:", error);
      throw error;
    }
  },



  selectJobPostingPlan: async (job_id, planData, token) => {
    try {
      const res = await axios.post(`${BASE_URL}/jobs/${job_id}/select-plan`,planData,{
        headers: { Authorization: `Bearer ${token} ` },
    })

      return res.data; 
    } catch (error) {
      console.error("Error in getting job select-plan:", error);
      throw error;
    }
  },

  

};