import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const CreditPurchaseSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const credits = parseInt(searchParams.get('credits') || '0');
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (credits > 0) {
      // Optional: refresh credit balance in context/store
      // e.g., dispatch(fetchCreditBalance());
    }
  }, [credits]);

  return (
    <div className="max-w-md p-6 mx-auto mt-16 text-center">
      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>

      <h1 className="mb-2 text-2xl font-bold text-gray-800"> Payment Successful!</h1>
      <p className="mb-6 text-gray-600">
        You’ve unlocked <span className="font-semibold">{credits} college credits</span>.
        They’re now ready to use for job postings.
      </p>

      <div className="space-y-3">
        <button
          onClick={() => navigate('/recruiter-post-job-opportunity-selector')}
          className="block w-full px-4 py-3 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Post a Job Now
        </button>
        <button
          onClick={() => navigate('/recruiter/credits/pricing')}
          className="block w-full px-4 py-3 font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          View All Credit Packs
        </button>
      </div>

      <p className="mt-6 text-xs text-gray-500">
        Order ID: {orderId} • Credits valid for 6 months
      </p>
    </div>
  );
};

export default CreditPurchaseSuccess;