import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import useRazorpay from '../../../hooks/useRazorpay'; 
import { useCreditBalance } from '../../../hooks/recruiter/useCreditBalance';

const BASE_URL=import.meta.env.VITE_BASE_URL;

const CreditPacksPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const { token } = useSelector((state) => state.auth);
  const { isLoaded, error: razorpayError, openRazorpay } = useRazorpay(); // Destructure hook

  const { total_credits, loading:creditInfoLoading } = useCreditBalance();

  const selectedColleges=3;

  console.log("cresits", total_credits);
  

  // Fetch credit plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${BASE_URL}/subscriptions/credits/plans`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setPlans(data.plans);
        }
      } catch (err) {
        console.error('Failed to load plans', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchPlans();
  }, [token]);

  // Buy credits handler
  const buyCredits = async (plan) => {
    if (!isLoaded) {
      alert('Payment system is still initializing. Please wait...');
      return;
    }

    if (razorpayError) {
      alert(`Payment system error: ${razorpayError}`);
      return;
    }

    setIsProcessing(true);
    setSelectedPlan(plan);

    try {
      // 1. Create order
      const orderRes = await fetch(`${BASE_URL}/subscriptions/credits/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan_id: plan.id }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error(orderData.message || 'Order creation failed');

      // 2. Prepare Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_API_KEY,
        amount: orderData.total_amount * 100, // Convert to paise
        currency: 'INR',
        name: 'Your Portal Name',
        description: `Buy ${plan.credits} College Credits`,
        order_id: orderData.razorpay_order_id,
        handler: (response) => {
          console.log('Razorpay success response:', response);
          setIsProcessing(false);
          // Redirect to success page
          window.location.href = `/recruiter/credits/success?order_id=${orderData.order_id}&credits=${plan.credits}`;
        },
        prefill: {
          name: localStorage.getItem('userName') || '',
          email: localStorage.getItem('userEmail') || '',
        },
        theme: { color: '#3B82F6' },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            setSelectedPlan(null);
            alert('Payment cancelled');
          },
        },
      };

      // 3. Open Razorpay
      openRazorpay(options);

    } catch (err) {
      console.error('Payment initiation failed:', err);
      alert(err.message || 'Failed to initiate payment');
      setIsProcessing(false);
      setSelectedPlan(null);
    }
  };

  if (loading) return <div className="mt-10 text-center">Loading plans...</div>;

  return (
    <div className="max-w-5xl p-6 mx-auto">
      <h1 className="mb-2 text-3xl font-bold text-gray-800">🎓 College Posting Credits</h1>
      <p className="mb-6 text-gray-600">
        Buy credits to post jobs to specific colleges. Credits expire in 6 months.
      </p>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`border rounded-xl p-6 shadow-sm hover:shadow-md transition ${
              selectedPlan?.id === plan.id ? 'ring-2 ring-blue-500' : 'border-gray-200'
            }`}
          >
            <div className="text-center">
              <div className="mb-2 text-2xl font-bold text-blue-600">{plan.credits}</div>
              <div className="mb-3 text-sm text-gray-500">Colleges</div>
              <div className="mb-1 text-lg font-semibold text-gray-900">₹{plan.price.toFixed(0)}</div>
              <div className="mb-3 text-sm text-gray-500">
                + ₹{(plan.price * 0.18).toFixed(0)} GST
              </div>
              <div className="mb-4 text-xs text-gray-400">Valid for {plan.expiry_days} days</div>
              <button
                disabled={isProcessing || !isLoaded}
                onClick={() => buyCredits(plan)}
                className={`w-full py-2 px-4 rounded-lg font-medium ${
                  isProcessing && selectedPlan?.id === plan.id
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isProcessing && selectedPlan?.id === plan.id ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="w-4 h-4 mr-2 -ml-1 text-white animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                ) : isLoaded ? (
                  'Buy Now'
                ) : (
                  'Loading...'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-sm text-gray-500">
        <p>💡 Tip: Buy larger packs for better value. Credits roll over and can be used across multiple job posts.</p>
      </div>

      <div>
      
      </div>
    </div>
  );
};

export default CreditPacksPage;