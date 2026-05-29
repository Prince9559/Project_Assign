import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import { getPaymentQuote, createOneTimePaymentOrder } from '../../api/recruiterPaymentApi';

const RecruiterCheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checkoutData, setCheckoutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get job_id from state (passed from job post page)
  const { job_id, post_type, college_ids } = location.state || {};

  useEffect(() => {
    if (!job_id || !post_type) {
      setError("Missing job details. Please go back and try again.");
      setLoading(false);
      return;
    }

    const fetchQuote = async () => {
      try {
        const params = new URLSearchParams();
        params.append('job_id', job_id);
        params.append('post_type', post_type);
        if (college_ids && college_ids.length > 0) {
          params.append('college_ids', JSON.stringify(college_ids));
        }

        const quote = await getPaymentQuote({ job_id, post_type, college_ids });
        console.log("the quote", quote);

        setCheckoutData(quote);
      } catch (err) {
        console.error('Quote fetch error:', err);
        setError(err.response?.data?.error || 'Failed to load pricing');
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [job_id, post_type, college_ids]);

  const createRazorpayOrder = async () => {
    const order = await createOneTimePaymentOrder({
      job_id,
      post_type,
      college_ids,
    });
    return order;
  };

  const handlePayment = async () => {
    if (!checkoutData) return;

    try {
      const order = await createRazorpayOrder();

      //  Dynamically load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;

        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () =>
            reject(new Error("Failed to load Razorpay SDK"));
          document.body.appendChild(script);
        });
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_API_KEY, // Add to .env
        amount: order.amount * 100, // Backend returns INR, convert to paise
        currency: "INR",
        name: "JobPortal",
        description: checkoutData.description,
        order_id: order.razorpay_order_id,
        // handler: (response) => {
        //   // Webhook will activate job; just show success
        //   window.location.href = `/recruiter/payment-success?job_id=${job_id}&payment_id=${response.razorpay_payment_id}`;
        // },

        handler: (response) => {
          navigate("/recruiter/payment-success", {
            state: {
              job_id: job_id,
              payment_id: response.razorpay_payment_id,
              order_id: order.order_id, // if backend returns this
              amount: checkoutData.totalAmount,
              description: checkoutData.description,
              justPurchased: true, // flag to show success banner
            },
          });
        },
        prefill: {
          // Get from user profile if available
          email: "test@gmail.com",
          contact: "9876543210",
        },
        theme: { color: "#3399cc" },
        modal: {
          ondismiss: () => {
            // User closed modal → stay on page
            alert("Payment was cancelled. You can try again.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Failed to start payment. Please try again.");
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
          <div className="w-full max-w-2xl p-6 bg-white shadow-sm rounded-xl animate-pulse">
            <div className="w-1/3 h-6 mb-6 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="w-full h-4 bg-gray-200 rounded"></div>
              <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
              <div className="h-10 mt-6 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
          <div className="w-full max-w-2xl p-8 text-center bg-white shadow-sm rounded-xl">
            <div className="mb-4 text-5xl text-red-500">⚠️</div>
            <h2 className="mb-2 text-xl font-semibold text-gray-800">Error</h2>
            <p className="mb-6 text-gray-600">{error}</p>
            <button
              onClick={() => navigate('/recruiter-post-opportunity-selector')}
              className="px-4 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen px-4 py-8 bg-gray-50 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Complete Your Payment
            </h1>
            <p className="mt-2 text-gray-600">
              Secure checkout • Powered by Razorpay
            </p>
          </div>

          <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="mb-4 text-lg font-semibold text-gray-800">Order Summary</h2>
              
              <div className="p-4 mb-4 rounded-lg bg-blue-50">
                <p className="font-medium text-blue-800">{checkoutData.description || "No Description Provided"}</p>
              </div>

              {checkoutData.mode === "one_time" && checkoutData?.post_type === "college" && (
                <div className="mt-4">
                  <p className="mb-2 font-medium text-gray-800">
                    Target Colleges ({checkoutData.collegeCount})
                  </p>
                  <ul className="grid grid-cols-1 gap-1 mb-4 text-sm text-gray-600 sm:grid-cols-2">
                    {checkoutData.collegeNames.map((name, i) => (
                      <li key={i} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
                        {name}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="space-y-3 text-gray-700">
                <div className="flex justify-between">
                  <span>Base Amount</span>
                  <span>₹{checkoutData.baseAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span>₹{checkoutData.taxAmount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between pt-3 text-lg font-bold text-gray-900 border-t border-gray-200">
                  <span>Total Payable</span>
                  <span>₹{checkoutData.totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
              >
                Pay Now – ₹{checkoutData.totalAmount.toLocaleString("en-IN")}
              </button>

              <p className="flex items-center justify-center gap-1 mt-4 text-xs text-center text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Secure • Encrypted • No card data stored
              </p>
            </div>
          </div>

          <div className="mt-6 text-sm text-center text-gray-500">
            Need help? Contact us at support@jobportal.com
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RecruiterCheckoutPage;