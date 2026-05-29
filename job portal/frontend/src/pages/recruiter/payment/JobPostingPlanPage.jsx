import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import {jobPostApi} from "../../../api/jobPostApi";

import { useSelector } from "react-redux";
import axios from "axios";


const BASE_URL=import.meta.env.VITE_BASE_URL;

const JobPostingPlanPage = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId");
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [context, setContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jobId) {
      setError("Job ID missing");
      setLoading(false);
      return;
    }

    const fetchPlanData = async () => {
      try {
        // Get job details
        const response = await axios.get(
                    `${BASE_URL}/opportunities/recruiter/${jobId}`,
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
        const jobData = response.data;
        setJob(jobData);

        // Get posting context (subscription + pricing)
        const previewRes = await jobPostApi.getJobPostingPreview("active", "Internship",token); // adjust opportunity_type if needed
        setContext(previewRes);

      } catch (err) {
        setError("Failed to load options");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlanData();
  }, [jobId, token]);

  const handleSelectPlan = async (planType) => {
    try {
      const result = await jobPostApi.selectJobPostingPlan(jobId, { plan: planType },token);

      if (result.success) {
        if (result.action === "proceed_to_payment") {
          // Go to checkout with payment data
          navigate("/recruiter/checkout", {
            state: {
              job_id: jobId,
              razorpay_order_id: result.razorpay_order_id,
              amount: result.amount,
              post_type: "active",
            },
          });
        } else {
          // Free or subscription: go to success
          navigate("/recruiter/job-post-success", {
            state: {
              job_id: jobId,
              post_type: "active",
              payment_type: result.payment_type,
              subscription: result.subscription,
            },
          });
        }
      }
    } catch (err) {
      alert("Failed to select plan: " + err.message);
    }
  };

  if (loading) return <MainLayout><div className="p-6">Loading...</div></MainLayout>;
  if (error) return <MainLayout><div className="p-6 text-red-500">{error}</div></MainLayout>;

  return (
    <MainLayout>
      <div className="max-w-4xl px-4 py-8 mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Choose How to Post Your Job</h1>
          <p className="mt-2 text-gray-600">Select the best option for your hiring needs</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Option 1: Free */}
          <div className="flex flex-col px-4 py-3 border border-gray-200 file:transition rounded-xl hover:shadow-md">
            <h3 className="mb-3 text-lg font-bold text-green-700">🟢 Post for Free</h3>
            <ul className="mb-4 space-y-2 text-sm text-gray-600">
              <li>✓ Appears in standard listings</li>
              <li>✓ Visible for 30 days</li>
              <li>✗ No priority placement</li>
              <li>✗ No sponsored badge</li>
            </ul>
            <button
              onClick={() => handleSelectPlan("free")}
              className="w-full py-2 mt-4 mt-auto font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              Post for ₹0
            </button>
          </div>

          {/* Option 2: Subscription */}
          {/* {context?.subscription && context.subscription.remaining_credits > 0 ? (
            <div className="p-6 transition border border-gray-200 rounded-xl hover:shadow-md">
              <h3 className="mb-3 text-lg font-bold text-purple-700">🔑 Use Subscription</h3>
              <div className="mb-4 space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Plan:</span> {context.subscription.plan_name}</p>
                <p><span className="font-medium">Credits left:</span> {context.subscription.remaining_credits}</p>
                <ul className="mt-2 space-y-1">
                  <li>✓ Top of feed</li>
                  <li>✓ Sponsored badge</li>
                  <li>✓ Full visibility</li>
                </ul>
              </div>
              <button
                onClick={() => handleSelectPlan("subscription")}
                className="w-full py-2 mt-4 font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
              >
                Use Credit (Free)
              </button>
            </div>
          ) : (
            <div className="p-6 border border-gray-200 rounded-xl opacity-60">
              <h3 className="mb-3 text-lg font-bold text-gray-500">🔑 Subscription</h3>
              <p className="mb-4 text-sm text-gray-500">No active credits available</p>
              <button
                disabled
                className="w-full py-2 mt-4 font-medium text-gray-500 bg-gray-300 rounded-lg cursor-not-allowed"
              >
                No Credits
              </button>
            </div>
          )} */}

          {/* Option 3: One-Time */}
          <div className="flex flex-col px-4 py-3 border border-gray-200 tr-ansition fp-6 rounded-xl hover:shadow-md">
            <h3 className="mb-3 text-lg font-bold text-blue-700">💎 Sponsor Job</h3>
            <div className="mb-4 space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Price:</span> ₹{context?.eligibility?.one_time_price?.toLocaleString("en-IN") || "499"}</p>
              <ul className="mt-2 space-y-1">
                <li>✓ Top of feed</li>
                <li>✓ Sponsored badge</li>
                <li>✓ Priority applicant reach</li>
                <li>✓ Enhanced analytics</li>
              </ul>
            </div>
            <button
              onClick={() => handleSelectPlan("one_time")}
              className="w-full py-2 mt-4 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Pay Now – ₹{context?.eligibility?.one_time_price?.toLocaleString("en-IN") || "499"}
            </button>
          </div>
        </div>

        <div className="mt-6 mt-auto text-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default JobPostingPlanPage;