import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";

import { getJobById } from '../../api/recruiterPaymentApi';


const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const state = location.state || {};
  const params = new URLSearchParams(location.search);

  const job_id = state.job_id || params.get("job_id");
  const payment_id = state.payment_id || params.get("payment_id");
  const order_id = state.order_id || params.get("order_id");
  const amount = state.amount || params.get("amount");

  useEffect(() => {
    if (!job_id) {
      setError("Job ID missing");
      setLoading(false);
      return;
    }

    const fetchJob = async () => {
      try {
        const job = await getJobById(job_id);
        setJobData(job);
      } catch (err) {
        setError("Failed to load job details");
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    // Poll until job is active (webhook may take 1-2s)
    const pollInterval = setInterval(fetchJob, 2000);
    fetchJob(); // immediate fetch

    return () => clearInterval(pollInterval);
  }, [job_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-lg text-gray-600">
          Activating your job posting...
        </div>
      </div>
    );
  }

  if (error || !jobData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md p-6 text-center bg-white rounded-lg shadow">
          <div className="mb-2 text-2xl text-red-500">❌</div>
          <h2 className="text-xl font-bold text-gray-800">Job Not Active</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => navigate("/recruiter/jobs")}
            className="px-4 py-2 mt-4 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            View My Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen px-4 py-12 bg-gray-50 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto overflow-hidden bg-white shadow-md rounded-xl">
          <div className="px-6 py-8 text-center bg-green-50">
            <div className="mb-4 text-5xl text-green-500">✅</div>
            <h1 className="text-2xl font-bold text-gray-900">
              Job Posted Successfully!
            </h1>
            <p className="mt-2 text-gray-600">
              Your "{jobData.title || jobData.job_role || "" } " {jobData.opportunity_type} is now live and visible to candidates.
            </p>
          </div>

          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {jobData.title}
                </h2>
                <p className="text-sm text-gray-500">
                  Job ID: {jobData.job_id}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  ₹{jobData?.payment_info?.amount_paid? Number(jobData.payment_info.amount_paid).toFixed(2) : ""}
                </p>
                <p className="text-sm text-gray-500">Paid today</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <h3 className="mb-3 font-medium text-gray-900">Next Steps:</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2 text-green-500">✓</span>
                <span className="text-gray-700">
                  Your job is now live on the portal
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-green-500">✓</span>
                <span className="text-gray-700">
                  Applicants will start applying soon
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-green-500">✓</span>
                <span className="text-gray-700">
                  Manage applications from your dashboard
                </span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col justify-center gap-3 px-6 pb-6 sm:flex-row">
            <button
              onClick={() => navigate(`/recruiter-view-applications/${jobData.job_id}`)}
              className="px-6 py-3 font-medium text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              View Job Details
            </button>
            <button
              onClick={() => navigate("/recruiter-dashboard")}
              className="px-6 py-3 font-medium text-gray-700 transition bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default PaymentSuccessPage;
