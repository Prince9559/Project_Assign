
import React, { useEffect, useState } from 'react';
import MainLayout from "../../../components/layout/MainLayout";

const PaymentSuccessPage = () => {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock plan data — replace with real API response
  const mockPaymentResponse = {
    success: true,
    planType: "Pro",
    amount: 2499.0,
    transactionId: "txn_8a7b6c5d4e3f",
    message: "Your payment was successful! Your Pro plan is now active.",
    nextSteps: [
      "Post unlimited jobs",
      "Access all applicants",
      "Download resumes in PDF/CSV",
      "Enjoy priority listing"
    ]
  };

  useEffect(() => {
    // Simulate API call
    const fetchPaymentSuccess = async () => {
      try {
        // 🔁 Replace this with real API when ready:
        // const res = await fetch('/api/payment/success');
        // const data = await res.json();

        // For now, use mock
        await new Promise(resolve => setTimeout(resolve, 800)); // simulate network delay
        setPaymentData(mockPaymentResponse);
      } catch (err) {
        setError('Failed to load payment details.');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentSuccess();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Processing your payment...</div>
      </div>
    );
  }

  if (error || !paymentData?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 bg-white rounded-lg shadow max-w-md">
          <div className="text-red-500 text-2xl mb-2">❌</div>
          <h2 className="text-xl font-bold text-gray-800">Payment Failed</h2>
          <p className="mt-2 text-gray-600">{error || 'Something went wrong.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-green-50 px-6 py-8 text-center">
          <div className="text-green-500 text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Successful!</h1>
          <p className="mt-2 text-gray-600">{paymentData.message}</p>
        </div>

        {/* Plan Summary */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{paymentData.planType} Plan</h2>
              <p className="text-sm text-gray-500">Transaction ID: {paymentData.transactionId}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">₹{paymentData.amount.toFixed(2)}</p>
              <p className="text-sm text-gray-500">Paid today</p>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="p-6">
          <h3 className="font-medium text-gray-900 mb-3">What you can do now:</h3>
          <ul className="space-y-2">
            {paymentData.nextSteps.map((step, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Buttons */}
        <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => (window.location.href = '/recruiter-post-opportunity-selector')}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Post Job Now
          </button>
          <button
            onClick={() => (window.location.href = '/recruiter-dashboard')}
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        Need help? Contact support@yourjobportal.com
      </div>
    </div>
    </MainLayout>
  );
};

export default PaymentSuccessPage;