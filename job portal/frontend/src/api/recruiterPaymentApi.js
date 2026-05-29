// src/api/recruiterPaymentApi.js
import axios from "axios";
import {store} from '../redux/store';


const BASE_URL = import.meta.env.VITE_BASE_URL;

const getToken = () => {
  return store.getState().auth.token;
};

const recruiterPaymentApi = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

//  Add token to every request
recruiterPaymentApi.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ======================
// API FUNCTIONS
// ======================

//Fetch payment quote
export const getPaymentQuote = async ({
  job_id,
  post_type,
  college_ids = [],
}) => {
  try {
    const params = new URLSearchParams();
    params.append("job_id", job_id);
    params.append("post_type", post_type);
    if (college_ids.length > 0) {
      params.append("college_ids", JSON.stringify(college_ids));
    }

    const response = await recruiterPaymentApi.get(
      `/payments/quote?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch quote");
  }
};

// Create payment order
export const createOneTimePaymentOrder = async ({
  job_id,
  post_type,
  college_ids = [],
}) => {
  try {
    const response = await recruiterPaymentApi.post(
      "/payments/one-time/create-order",
      {
        job_id,
        post_type,
        college_ids,
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to create order");
  }
};

/**
 * Get job by ID
 */
export const getJobById = async (job_id) => {
  try {
    const response = await recruiterPaymentApi.get(
      `${BASE_URL}/jobs/${job_id}`
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to fetch job");
  }
};


export const getPricingRules = async (post_type) => {
  const response = await axios.get(`${BASE_URL}/pricing/rules`, {
    params: { post_type },
  });
  return response.data;
};





// ======================
// Billing & Subscription Management
// ======================


// GET /api/billing/dashboard?page=1&limit=10
export const getBillingDashboard = async (page = 1, limit = 10) => {
  try {
    const response = await recruiterPaymentApi.get("payments/billing/dashboard", {
      params: { page, limit } 
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      error.response?.data?.error || 
      "Failed to fetch billing dashboard"
    );
  }
};

// GET billing txn detail by id
export const getTransactionById = async (id) => {
  if (!id) {
    throw new Error("Transaction ID is required");
  }

  try {
    const response = await recruiterPaymentApi.get(`payments/billing/transaction/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 
      error.response?.data?.error || 
      `Failed to fetch transaction #${id}`
    );
  }
};

export const downloadInvoice = async (orderId) => {
  try {
    const response = await recruiterPaymentApi.get(
      `payments/billing/invoice/${orderId}/download`,
      {
        responseType: 'blob', // Important: tells axios to handle binary PDF data
      }
    );

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    // Extract filename from headers or fallback
    const fileName =
      response.headers['content-disposition']
        ?.split('filename=')[1]
        ?.replace(/"/g, '')
      || `Invoice_${orderId}_${new Date().toISOString().split('T')[0]}.pdf`;

    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();

    // Cleanup
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true, fileName };
  } catch (error) {
    // Handle error response (blob error might be JSON)
    if (error.response?.headers?.['content-type']?.includes('application/json')) {
      const errorText = await error.response.data.text();
      const errorJson = JSON.parse(errorText);
      throw new Error(errorJson.message || 'Failed to download invoice');
    }
    throw error;
  }
};





// ======================
// Subscription Management
// ======================

// PATCH /api/subscription/auto-renew
export const toggleAutoRenew = async (isEnabled) => {
  try {
    const response = await recruiterPaymentApi.patch("/subscription/auto-renew", { 
      auto_renew: isEnabled 
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Failed to update auto-renew setting");
  }
};



// POST /api/subscriptions/pause
export const pauseSubscription = async (razorpaySubscriptionId) => {
  try {
    const response = await recruiterPaymentApi.post("/subscriptions/pause", {
      razorpaySubscriptionId,
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.response?.data?.error || "Failed to pause subscription"
    );
  }
};

// POST /api/subscriptions/resume
export const resumeSubscription = async (razorpaySubscriptionId) => {
  try {
    const response = await recruiterPaymentApi.post("/subscriptions/resume", {
      razorpaySubscriptionId, 
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.response?.data?.error || "Failed to resume subscription" 
    );
  }
};

// POST /api/subscriptions/cancel
export const cancelSubscription = async (razorpaySubscriptionId) => {
  try {
    const response = await recruiterPaymentApi.post("/subscriptions/cancel", {
      razorpaySubscriptionId, 
    });
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || error.response?.data?.error || "Failed to cancel subscription" 
    );
  }
};




export const getCollegeCheckoutPreview = async (job_id, token) => {
  const response = await axios.get(
    `${BASE_URL}/subscriptions/jobs/${job_id}/college-checkout`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const updateJobColleges = async (job_id, college_ids, token) => {
  const response = await axios.put(
    `${BASE_URL}/subscriptions/jobs/${job_id}/colleges`,
    { college_ids },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const publishWithBundle = async (job_id, bundle_id, college_ids, token) => {
  const response = await axios.post(
    `${BASE_URL}/subscriptions/jobs/${job_id}/publish-college`,
    { bundle_id, college_ids },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const createCollegeCheckoutPayment = async (job_id, bundle_id, college_ids, token) => {
  const response = await axios.post(
    `${BASE_URL}/subscriptions/jobs/${job_id}/college-checkout-pay`,
    { bundle_id, college_ids },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};