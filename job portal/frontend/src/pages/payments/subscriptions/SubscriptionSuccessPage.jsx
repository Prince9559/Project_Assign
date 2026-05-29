
// src/pages/SubscriptionSuccessPage.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BASE_URL =import.meta.env.VITE_BASE_URL;

const SubscriptionSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const status = searchParams.get('status');
  const razorpaySubId = searchParams.get('sub_id');
  const razorpayPaymentId = searchParams.get('payment_id');
  const errorMsg = searchParams.get('message');

  const [subscription, setSubscription] = useState(null);
  const [isLoading, setIsLoading] = useState(status === 'success');
  const [activationFailed, setActivationFailed] = useState(false);

  //  Optimistic activation check — only for UX polish, not gatekeeping
  useEffect(() => {
    if (status !== 'success' || !razorpaySubId) return;

    const timer = setTimeout(() => {
      axios
        .get(`${BASE_URL}/subscriptions/status/${razorpaySubId}`)
        .then((res) => {
          if (res.data.success && res.data.subscription?.status === 'active') {
            setSubscription(res.data.subscription);
          }
        })
        .catch(() => {
          // silent fail — do not show error to user unless critical
        })
        .finally(() => setIsLoading(false));
    }, 800); // slight delay for smoother UX

    return () => clearTimeout(timer);
  }, [status, razorpaySubId]);

  const handleGoHome = () => navigate('/');
  const handleViewDashboard = () => navigate('/recruiter-dashboard');
  const handleViewReceipt = () => {
    if (razorpayPaymentId) {
      window.open(`https://rzp.io/p/${razorpayPaymentId}`, '_blank');
    }
  };

  const renderSuccessContent = () => {
    if (isLoading) {
      return (
        <>
          <div className="mb-4 text-5xl animate-bounce">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Received!</h2>
          <p className="max-w-md mx-auto mt-3 text-gray-600">
            Your payment has been processed successfully. Your subscription is being activated — this usually takes less than a minute.
          </p>
          <div className="mt-2">
            <div className="inline-block h-1.5 w-32 bg-gray-200 rounded-full overflow-hidden">
              <div className="w-3/4 h-full bg-green-500 animate-pulse"></div>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            You may proceed — your plan will be active shortly.
          </p>
        </>
      );
    }

    if (subscription) {
      return (
        <>
          <div className="mb-4 text-5xl text-green-500">✅</div>
          <h2 className="text-2xl font-bold text-gray-900">Welcome to {subscription.plan_name}!</h2>
          <p className="mt-2 text-gray-600">
            Your subscription is now active. You can start posting jobs right away.
          </p>

          <div className="p-4 mt-5 space-y-2 text-sm text-left text-gray-700 rounded-lg bg-gray-50">
            <div>
              <span className="font-medium">Plan:</span> {subscription.plan_name}
            </div>
            <div>
              <span className="font-medium">Credits:</span> {subscription.remaining_credits} / {subscription.total_credits}
            </div>
            <div>
              <span className="font-medium">Next billing:</span> {new Date(subscription.next_billing_at).toLocaleDateString('en-IN')}
            </div>
            <div>
              <span className="font-medium">Auto-renewal:</span> {subscription.auto_renew ? 'Enabled' : 'Disabled'}
            </div>
          </div>

          <div className="flex flex-col justify-center gap-3 mt-8 sm:flex-row">
            <button
              onClick={handleViewDashboard}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Go to Dashboard
            </button>
            <button
              onClick={handleViewReceipt}
              className="px-5 py-2.5 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              View Receipt
            </button>
          </div>
        </>
      );
    }

    // Optimistic success: Razorpay confirmed payment, but backend not synced yet
    return (
      <>
        <div className="mb-4 text-5xl text-green-500">✅</div>
        <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
        <p className="mt-2 text-gray-600">
          Your subscription is being activated. You’ll receive a confirmation email shortly.
        </p>

        {razorpayPaymentId && (
          <p className="mt-3 text-sm text-gray-500">
            <span className="px-2 py-1 font-mono bg-gray-100 rounded">
              Payment ID: {razorpayPaymentId}
            </span>
          </p>
        )}

        <div className="mt-6 space-y-1 text-sm text-gray-600">
          <p>✔️ No further action needed — your plan will be active within a few minutes.</p>
          <p>📩 Check your inbox for a receipt and onboarding guide.</p>
        </div>

        <div className="flex flex-col justify-center gap-3 mt-8 sm:flex-row">
          <button
            onClick={handleViewDashboard}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium shadow-sm"
          >
            Go to Dashboard
          </button>
          <button
            onClick={handleViewReceipt}
            className="px-5 py-2.5 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 font-medium"
          >
            View Receipt
          </button>
        </div>
      </>
    );
  };

  const renderErrorContent = () => {
    const decodedMsg = errorMsg ? decodeURIComponent(errorMsg).replace(/\+/g, ' ') : '';

    return (
      <>
        <div className="mb-4 text-5xl text-red-500">❗</div>
        <h2 className="text-2xl font-bold text-gray-900">We couldn’t complete your subscription</h2>
        <p className="mt-2 text-gray-600">
          {decodedMsg || 'An unexpected error occurred during payment processing.'}
        </p>
        <div className="mt-6 text-sm text-gray-500">
          <p>✅ Your card was not charged.</p>
          <p>💡 Try again, or contact support if the issue persists.</p>
        </div>
        <div className="mt-8">
          <button
            onClick={() => navigate('/pricing')}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            Try Again
          </button>
        </div>
      </>
    );
  };

  const renderCancelContent = () => (
    <>
      <div className="mb-4 text-5xl text-gray-400">🚫</div>
      <h2 className="text-2xl font-bold text-gray-900">Payment Cancelled</h2>
      <p className="mt-2 text-gray-600">
        No charges were made. You can restart your subscription anytime.
      </p>
      <div className="mt-6">
        <button
          onClick={() => navigate('/pricing')}
          className="px-5 py-2.5 bg-gray-800 text-white rounded-md hover:bg-gray-900 font-medium"
        >
          Choose a Plan
        </button>
      </div>
    </>
  );

  const renderContent = () => {
    if (status === 'success') return renderSuccessContent();
    if (status === 'canceled') return renderCancelContent();
    return renderErrorContent(); // covers 'error' and unknown
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="w-full max-w-md text-center bg-white border border-gray-200 shadow-lg rounded-xl p-7">
        {renderContent()}

        <div className="pt-6 mt-10 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Need help? <a href="mailto:support@yourjobportal.com" className="text-blue-600 hover:underline">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;