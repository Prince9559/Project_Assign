import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams, Link } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const SubscriptionStatusPage = () => {
  const { subscriptionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("checking"); // checking | success | failed | canceled
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If status provided in URL (Razorpay redirect), show instantly
    const statusParam = searchParams.get("status");
    const paymentId = searchParams.get("payment_id");

    if (statusParam) {
      if (statusParam === "created") {
        setStatus("success");
        // We’ll fetch full details below
      } else if (statusParam === "cancelled") {
        setStatus("canceled");
        return;
      } else {
        setStatus("failed");
        return;
      }
    }

    // Always fetch latest status from backend (more reliable than URL params)
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/subscriptions/status/${subscriptionId}`);
        if (res.data.success) {
          const sub = res.data.subscription;
          setDetails(sub);
          if (sub.status === "active" || sub.status === "trialing") {
            setStatus("success");
          } else if (sub.status === "canceled" || sub.status === "halted") {
            setStatus("canceled");
          } else if (sub.status === "failed") {
            setStatus("failed");
          } else {
            setStatus("checking"); // e.g., "pending"
          }
        } else {
          setError("Failed to load subscription status");
        }
      } catch (err) {
        setError(err.message);
      }
    };

    if (subscriptionId) {
      fetchStatus();
    }
  }, [subscriptionId, searchParams]);

  const handleRetry = () => {
    // Re-initiate same plan + cycle
    if (details) {
      navigate(`/checkout/subscription?plan=${details.plan_id}&cycle=${details.billing_cycle}`);
    }
  };

  const handleDashboard = () => {
    navigate("/recruiter-dashboard");
  };

  let content;
  switch (status) {
    case "checking":
      content = (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <h3 className="text-xl font-medium text-gray-900">Verifying payment...</h3>
          <p className="mt-2 text-gray-600">This may take a few seconds.</p>
        </div>
      );
      break;

    case "success":
      content = (
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <svg className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Subscription Activated!</h3>
          <p className="mt-2 text-gray-600">
            Your <span className="font-medium">{details?.plan_name}</span> plan is now active.
          </p>
          <div className="mt-6 bg-gray-50 p-4 rounded-lg text-left">
            <h4 className="font-medium text-gray-900">Plan Summary</h4>
            <ul className="mt-2 text-sm text-gray-600 space-y-1">
              <li>• Credits: {details?.remaining_credits}/{details?.total_credits}</li>
              <li>• Next billing: {new Date(details?.next_billing_at).toLocaleDateString()}</li>
              <li>• Auto-renew: {details?.auto_renew ? "On" : "Off"}</li>
            </ul>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={handleDashboard}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate("/settings/billing")}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
            >
              View Billing Settings
            </button>
          </div>
        </div>
      );
      break;

    case "canceled":
      content = (
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
            <svg className="h-10 w-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Payment Canceled</h3>
          <p className="mt-2 text-gray-600">
            Your subscription was not activated. No charges were applied.
          </p>
          <div className="mt-6">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      );
      break;

    case "failed":
      content = (
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Payment Failed</h3>
          <p className="mt-2 text-gray-600">
            Something went wrong. Please try again or contact support.
          </p>
          <div className="mt-6">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 mr-3"
            >
              Retry Payment
            </button>
            <button
              onClick={() => navigate("/pricing")}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50"
            >
              Choose Another Plan
            </button>
          </div>
        </div>
      );
      break;

    default:
      content = <div>Error</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden p-6">
          {content}
        </div>

        {error && (
          <div className="mt-6 text-center text-red-600 text-sm">{error}</div>
        )}

        <div className="mt-8 text-center text-gray-500 text-sm">
          Need help? <Link to="/support" className="text-blue-600 hover:underline">Contact support</Link>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionStatusPage;