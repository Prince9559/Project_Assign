import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { Button } from "../../components/ui";

export default function PaymentViaSubscriptionSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.job_id) {
    return (
      <MainLayout>
        <div className="p-6 text-center">
          <h2 className="text-lg font-medium text-red-600">Invalid State</h2>
          <p className="mt-2">No job data found.</p>
          <Button onClick={() => navigate("/recruiter-dashboard")} className="mt-4">
            Go to Dashboard
          </Button>
        </div>
      </MainLayout>
    );
  }

  const { post_type, subscription } = state;

  return (
    <MainLayout
      heading="🎉 Job Posted Successfully!"
      subheading="Your opportunity is now live (or scheduled)."
    >
      <div className="max-w-2xl p-6 mx-auto bg-white shadow rounded-xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-green-100 rounded-full">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>

          <h3 className="text-xl font-semibold text-gray-900">
            {post_type === "college" ? "College-Specific Job" : post_type === "active" ? "Active Job" : "Future Job"} Posted!
          </h3>

          {subscription && (
            <div className="p-4 mt-4 border border-blue-200 rounded-lg bg-blue-50">
              <p className="text-sm text-gray-700">
                ✅ Used subscription: <span className="font-medium">{subscription.plan_name}</span>
              </p>
              <p className="mt-1 text-sm text-gray-700">
                🎟️ Credits: {subscription.credits_before} → <span className="font-medium">{subscription.credits_after}</span> remaining
              </p>
            </div>
          )}

          <div className="mt-6 space-x-3">
            <Button onClick={() => navigate(`/recruiter/jobs/${state.job_id}`)}>
              View Job
            </Button>
            <Button variant="outline" onClick={() => navigate("/recruiter-dashboard")}>
              Dashboard
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}