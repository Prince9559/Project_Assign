// src/pages/SubscriptionCheckoutPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import GreenPrimaryButton from '../../../components/jobs/GreenPrimaryButton';
import axios from 'axios';
import {
  FaLock,
  FaShieldAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaChevronLeft,
  FaRedo,
} from 'react-icons/fa';
import MainLayout from "../../../components/layout/MainLayout"

const BASE_URL = import.meta.env.VITE_BASE_URL;

const SubscriptionCheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token, user } = useSelector((state) => state.auth);
  
  const planId = searchParams.get('plan');
  const cycle = searchParams.get('cycle') || 'monthly';

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const razorpayScriptLoaded = useRef(false);

  // 🔁 Fetch plan details
  useEffect(() => {
    if (!planId) {
      setError('No plan selected. Please return to pricing page.');
      setLoading(false);
      return;
    }

    const fetchPlan = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/subscriptions/plans`);
        // Fix: Backend returns `plan_id`, frontend uses `id` — ensure match
        const selected = res.data.plans.find(p => String(p.id) === String(planId));
        if (!selected) throw new Error('Plan not found');
        setPlan(selected);
      } catch (err) {
        console.error('Plan fetch error:', err);
        setError(err.response?.data?.message || 'Failed to load plan details.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [planId]);

  //  Safely load Razorpay script once
  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Razorpay SDK failed to load.'));
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async () => {
    if (!token) {
      alert('⚠️ Please sign in to continue.');
      navigate('/login');
      return;
    }

    if (!planId) {
      setError('Plan ID missing. Please go back and select a plan.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Initiate subscription on backend
      const initRes = await axios.post(
        `${BASE_URL}/subscriptions/initiate`,
        { plan_id: planId, billing_cycle: cycle },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("the subscription intiation response", initRes);

      const { razorpay_subscription_id, amount_due } = initRes.data;

      if (!razorpay_subscription_id) {
        throw new Error('Invalid subscription ID from server.');
      }

      // Step 2: Load Razorpay SDK
      await loadRazorpayScript();

      // Step 3: Open checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        subscription_id: razorpay_subscription_id,
        name: "Job Portal",
        description: `${plan.name} (${cycle === 'yearly' ? 'Annual' : 'Monthly'})`,
        handler: (response) => {
          //  Success: Redirect with IDs
          navigate(`/subscription/success?status=success&sub_id=${razorpay_subscription_id}&payment_id=${response.razorpay_payment_id}`);
        },
        modal: {
          ondismiss: () => {
            //  User closed modal
            navigate('/subscription/success?status=canceled');
          },
          escape: false,
        },
        theme: {
          color: "#2563eb", // Tailwind blue-600
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        notes: {
          plan_id: planId,
          cycle: cycle,
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error('Checkout error:', err);
      const msg = 
        err.response?.data?.message || 
        err.message || 
        'Payment initiation failed. Please try again.';
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="w-12 h-12 mb-4 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin"></div>
        <p className="text-gray-600">Loading your plan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="w-full max-w-md p-6 text-center bg-white shadow-lg rounded-xl">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
            <FaTimesCircle className="text-2xl text-red-600" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-gray-900">Oops!</h3>
          <p className="mb-4 text-gray-600">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            <FaChevronLeft className="mr-2" /> Back to Plans
          </button>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center px-4 py-2 mt-2 text-sm font-medium text-blue-600 bg-white border border-blue-600 rounded-md hover:bg-blue-50"
          >
            <FaRedo className="mr-2" /> Retry
          </button>
        </div>
      </div>
    );
  }

  const pricing = plan[cycle];
  if (!pricing) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="max-w-md p-6 text-center bg-white shadow rounded-xl">
          <FaTimesCircle className="mx-auto mb-2 text-2xl text-red-500" />
          <p className="text-gray-700">Pricing not available for this cycle.</p>
          <button 
            onClick={() => navigate('/pricing')}
            className="mt-4 font-medium text-blue-600 hover:underline"
          >
            ← Back to Pricing
          </button>
        </div>
      </div>
    );
  }

  // Calculate GST (18%) and breakdown
  const baseAmount = pricing.price;
  const gstAmount = Math.round(baseAmount * 0.18);
  const totalAmount = baseAmount + gstAmount;

  return (
    <MainLayout>
    <div className="min-h-screen px-4 py-8 bg-gray-50 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Secure Checkout</h1>
          <p className="mt-1 text-gray-600">Your subscription to <span className="font-medium">{plan.name}</span></p>
        </div>

        {/* Plan Card */}
        <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-2xl">
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                <p className="text-sm text-gray-600">
                  {cycle === 'yearly' ? 'Billed annually' : 'Billed monthly'} • {pricing.credits} credits included
                </p>
              </div>
              <div className="mt-2 text-right sm:mt-0">
                <div className="text-3xl font-bold text-gray-900">₹{baseAmount.toLocaleString()}</div>
                <div className="text-sm text-gray-500">+ ₹{gstAmount.toLocaleString()} GST</div>
                <div className="mt-1 text-lg font-semibold text-gray-900">₹{totalAmount.toLocaleString()} total</div>
              </div>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-2">
              {/* Features */}
              <div>
                <h4 className="flex items-center mb-3 font-medium text-gray-900">
                  <FaCheckCircle className="mr-2 text-green-500" />
                  What’s Included
                </h4>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>
                      <span className="font-medium">
                        {plan.features.job_post_limits?.active || 'Unlimited'} active jobs
                      </span>
                      {plan.features.job_post_limits?.future !== undefined && (
                        <span> • {plan.features.job_post_limits.future} future jobs</span>
                      )}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>{pricing.credits} credits/month for college targeting & analytics</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Auto-renewal (cancel anytime)</span>
                  </li>
                  <li className="flex items-start">
                    <FaCheckCircle className="text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                    <span>{plan.features.support === 'dedicated' ? 'Dedicated' : plan.features.support === 'priority' ? 'Priority' : 'Email'} support</span>
                  </li>
                </ul>
              </div>

              {/* Security */}
              <div className="p-4 rounded-lg bg-blue-50">
                <h4 className="flex items-center mb-3 font-medium text-gray-900">
                  <FaShieldAlt className="mr-2 text-blue-600" />
                  Payment Security
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <FaLock className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <span>Razorpay PCI-DSS Level 1 certified</span>
                  </li>
                  <li className="flex items-start">
                    <FaLock className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <span>256-bit SSL encryption</span>
                  </li>
                  <li className="flex items-start">
                    <FaInfoCircle className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                    <span>No card data stored on our servers</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* GST Notice */}
            <div className="p-4 mb-6 border-l-4 border-yellow-400 rounded-r-lg bg-yellow-50">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaInfoCircle className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    <span className="font-medium">GST (18%)</span> is applied as per Indian tax laws. 
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 sm:flex-row">
              <button
                onClick={() => navigate(-1)}
                disabled={isProcessing}
                className="flex items-center justify-center flex-1 px-4 py-3 font-medium text-gray-700 transition border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FaChevronLeft className="mr-2" /> Back
              </button>
              {/* <button
                onClick={handleSubscribe}
                disabled={isProcessing}
                autoFocus
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-white flex items-center justify-center transition ${
                  isProcessing 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow'
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  '✅ Pay ₹' + totalAmount.toLocaleString() + ' & Subscribe'
                )}
              </button> */}

              <GreenPrimaryButton
  onClick={handleSubscribe}
  disabled={isProcessing}
  className="flex-1 !py-3 flex items-center justify-center text-base"
>
  {isProcessing ? (
    <>
      <svg className="w-5 h-5 mr-3 -ml-1 text-current animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Processing...
    </>
  ) : (
    '✅ Pay ₹' + totalAmount.toLocaleString() + ' & Subscribe'
  )}
</GreenPrimaryButton>
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-6 text-xs text-center text-gray-500">
          <div className="flex justify-center space-x-6">
            <span className="flex items-center">
              <FaLock className="mr-1 text-gray-400" /> Secure Checkout
            </span>
            <span>•</span>
            <span>Cancel anytime</span>
            <span>•</span>
            <span>Instant activation</span>
          </div>
        </div>
      </div>
    </div>
    </MainLayout>
  );
};

export default SubscriptionCheckoutPage;