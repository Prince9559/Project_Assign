// src/pages/BillingDashboard.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { FaCheckCircle, FaExclamationCircle, FaEye, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import GreenPrimaryButton from '../../../components/jobs/GreenPrimaryButton';

import { 
  getBillingDashboard, 
  getTransactionById,
  toggleAutoRenew,
  cancelSubscription,
  pauseSubscription,
  resumeSubscription,
  downloadInvoice,

} from '../../../api/recruiterPaymentApi';
import PlanCard from '../../../components/payments/billing/PlanCard';
import TransactionTable from '../../../components/payments/billing/TransactionTable';
import MainLayout from '../../../components/layout/MainLayout';




//  Modal Component
const TransactionDetailModal = ({ transaction, isOpen, onClose, onDownloadInvoice }) => {
  console.log("recieved transaction data", transaction);
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
          onClick={onClose}
        />
        <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-blue-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                <FaEye className="w-6 h-6 text-blue-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg font-medium text-gray-900">Payment Details</h3>
              </div>
            </div>

<div className="mt-4 space-y-4 text-sm">
  {/* IDs */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-4">
    <div><span className="text-gray-500">Order ID:</span></div>
    <div className="px-2 py-1 font-mono text-sm bg-gray-100 rounded">{transaction.order_id}</div>

    {transaction.razorpay?.payment_id && (
      <>
        <div><span className="text-gray-500">Payment ID:</span></div>
        <div className="px-2 py-1 font-mono text-sm bg-gray-100 rounded">
          {transaction.razorpay.payment_id}
          <button
            onClick={() => navigator.clipboard.writeText(transaction.razorpay.payment_id)}
            className="ml-2 text-xs text-blue-600 hover:underline"
          >
            Copy
          </button>
        </div>
      </>
    )}

    {transaction.subscription_id && (
      <>
        <div><span className="text-gray-500">Subscription ID:</span></div>
        <div className="px-2 py-1 font-mono text-sm bg-gray-100 rounded">
          {transaction.subscription_id}
        </div>
      </>
    )}
  </div>

  {/* Status & Timing */}
  <div className="pt-3 border-t border-gray-200">
    <div className="grid grid-cols-2 gap-y-2">
      <div><span className="text-gray-500">Order Status:</span></div>
      <div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          transaction.order_status === 'paid' 
            ? 'bg-green-100 text-green-800'
            : transaction.order_status === 'created'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {transaction.order_status}
        </span>
      </div>

      <div><span className="text-gray-500">Payment Status:</span></div>
      <div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          transaction.payment_status === 'success'
            ? 'bg-green-100 text-green-800'
            : transaction.payment_status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {transaction.payment_status}
        </span>
      </div>

      <div><span className="text-gray-500">Created:</span></div>
      <div>{new Date(transaction.created_at).toLocaleString('en-IN')}</div>

      {transaction.paid_at && (
        <>
          <div><span className="text-gray-500">Paid At:</span></div>
          <div>{new Date(transaction.paid_at).toLocaleString('en-IN')}</div>
        </>
      )}

      <div><span className="text-gray-500">Method:</span></div>
      <div>{transaction.payment_method || '—'}</div>
    </div>
  </div>

  {/* Amounts */}
  <div className="pt-3 border-t border-gray-200">
    <h4 className="font-medium text-gray-900">Amount Breakup</h4>
    <div className="grid grid-cols-2 mt-2 text-sm gap-y-1">
      <div>Base Amount</div>
      <div className="font-medium text-right">₹{transaction?.amount_breakup?.base.toLocaleString('en-IN')}</div>
      
      <div>GST (18%)</div>
      <div className="text-right">₹{transaction.amount_breakup?.tax.toLocaleString('en-IN')}</div>
      
      <div className="pt-1 font-semibold">Total Paid</div>
      <div className="pt-1 text-lg font-bold text-right">₹{transaction.amount_breakup?.total.toLocaleString('en-IN')}</div>
    </div>
  </div>

  {/* Context */}
  {transaction.type === 'subscription' && transaction.plan && (
    <div className="pt-3 border-t border-gray-200">
      <h4 className="font-medium text-gray-900">Subscription</h4>
      <p className="mt-1">
        <span className="font-medium">{transaction.plan.name}</span> ({transaction.plan.billing_cycle})
      </p>
      {transaction.subscription && (
        <p className="mt-1 text-sm text-gray-600">
          Next billing: {transaction.subscription.next_billing_date || '—'}
        </p>
      )}
    </div>
  )}

  {transaction.type === 'one_time_post' && transaction.job && (
    <div className="pt-3 border-t border-gray-200">
      <h4 className="font-medium text-gray-900">Job Posting</h4>
      <p className="mt-1">{transaction.job.title}</p>
      <p className="text-sm text-gray-600 capitalize">
        Type: {transaction.job.post_type}
      </p>
      
      {transaction.college_count > 0 && (
        <div className="mt-2">
          <p className="text-sm text-gray-600">
            Colleges ({transaction.college_count}):
          </p>
          <ul className="mt-1 overflow-y-auto text-sm text-gray-700 list-disc list-inside max-h-32">
            {transaction.college_names.map((name, i) => (
              <li key={i} className="truncate">{name}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )}

  {/* Razorpay IDs (for support) */}
  {transaction.razorpay && (
    <div className="pt-3 text-xs text-gray-500 border-t border-gray-200">
      <p>Razorpay Order ID: <code className="px-1 bg-gray-100 rounded">{transaction.razorpay.order_id || '—'}</code></p>
      {transaction.razorpay.subscription_id && (
        <p>Razorpay Sub ID: <code className="px-1 bg-gray-100 rounded">{transaction.razorpay.subscription_id}</code></p>
      )}
    </div>
  )}
</div>
          </div>

          <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse sm:justify-between">
            <button
              onClick={onClose}
              className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>

            {/* Left: Download Invoice (only for paid/success) */}
            {(transaction.order_status === 'paid' || transaction.payment_status === 'success') && (
              <button
                onClick={() => onDownloadInvoice?.(transaction.order_id)}
                className="mt-3 sm:mt-0 inline-flex items-center justify-center w-full px-4 py-2 text-base font-medium text-green-700 bg-green-100 border border-green-200 rounded-md shadow-sm hover:bg-green-200 focus:outline-none sm:w-auto sm:text-sm transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download Invoice
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
    
  );
};

const BillingDashboard = () => {
  const user = useSelector((state) => state.auth.user);

  //  State
  const [dashboard, setDashboard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedTxn, setSelectedTxn] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txnLoading, setTxnLoading] = useState(false);

  const [selectedTxnDetail, setSelectedTxnDetail] = useState(null);

  const observerRef = useRef();

  //  Fetch initial dashboard (page 1)
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getBillingDashboard(1, 10);
      setDashboard(res.data);
      setTransactions(res.data.transactions || []);
      setHasMore(res.data.pagination?.has_more || false);
      setCurrentPage(1);
    } catch (err) {
      console.error("Failed to load dashboard", err);
      setError("Failed to load billing data. Please try again.");
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  //  Load more transactions
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      setLoading(true);
      const nextPage = currentPage + 1;
      const res = await getBillingDashboard(nextPage, 10);

      setTransactions((prev) => [...prev, ...(res.data.transactions || [])]);
      setHasMore(res.data.pagination?.has_more || false);
      setCurrentPage(nextPage);
    } catch (err) {
      toast.error("Failed to load more transactions");
    } finally {
      setLoading(false);
    }
  }, [hasMore, currentPage, loading]);

  //  Fetch single transaction
  const fetchTransaction = useCallback(async (id) => {
    try {
      setTxnLoading(true);
      const txn = await getTransactionById(id);
      setSelectedTxn(txn.transaction);
      setIsModalOpen(true);
    } catch (err) {
      toast.error("Failed to load transaction details");
    } finally {
      setTxnLoading(false);
    }
  }, []);

  const currentPlan = dashboard?.current_plan;

  //  Mutations
  const handleToggleAutoRenew = async (isEnabled) => {
    try {
      await toggleAutoRenew(isEnabled);
      toast.success("Auto-renew updated");
      fetchDashboard(); // refresh
    } catch (err) {
      toast.error("Failed to update auto-renew");
    }
  };

//   const handleCancel = async (cancelImmediately = false) => {
//   if (!currentPlan?.razorpay_subscription_id) return toast.error('Subscription ID missing');

//   const verb = cancelImmediately ? 'immediately' : 'at the end of this billing cycle';
//   const endText = currentPlan.current_period_end 
//     ? ` on ${new Date(currentPlan.current_period_end).toLocaleDateString('en-IN')}`
//     : '';

//   if (!window.confirm(
//     `Cancel subscription ${verb}${endText}?\n` +
//     (cancelImmediately 
//       ? '⚠️ Access will stop immediately.\n'
//       : ' Full access continues until then.\n') +
//     'This action cannot be undone.'
//   )) return;

//   try {
//     await cancelSubscription(currentPlan.razorpay_subscription_id, cancelImmediately);
//     toast.success(`Subscription ${cancelImmediately ? 'cancelled' : 'scheduled for cancellation'}`);
//     fetchDashboard();
//   } catch (err) {
//     toast.error(err.message);
//   }
// };

//   const handlePause = async () => {
//     if (!currentPlan?.razorpay_subscription_id) {
//       toast.error("No active subscription ID found");
//       return;
//     }

//     try {
//       await pauseSubscription(currentPlan.razorpay_subscription_id);
//       toast.success("Subscription paused");
//       fetchDashboard(); 
//     } catch (err) {
//       toast.error(err.message || "Failed to resume subscription");
//     }
//   };

  
//   const handleResume = async () => {
//     if (!currentPlan?.razorpay_subscription_id) {
//       toast.error("No active subscription ID found");
//       return;
//     }

//     try {
//       await resumeSubscription(currentPlan.razorpay_subscription_id);
//       toast.success("Subscription resumed");
//       fetchDashboard(); 
//     } catch (err) {
//       toast.error(err.message || "Failed to resume subscription");
//     }
//   };



//  Optimistic UI Handlers (no full reload on success)
const handlePause = async () => {
  if (!currentPlan?.razorpay_subscription_id) {
    return toast.error('Subscription ID missing. Please refresh.');
  }

  const confirmed = window.confirm(
    `Pause subscription?\nYou’ll keep full access until ${new Date(currentPlan.current_period_end).toLocaleDateString('en-IN')}.` +
    `\nNo charge will be attempted on ${new Date(currentPlan.next_billing_date).toLocaleDateString('en-IN')}.`
  );
  if (!confirmed) return;

  //  Optimistically update local state
  const prevPlan = { ...currentPlan };
  setDashboard(prev => ({
    ...prev,
    current_plan: {
      ...prev.current_plan,
      status: 'paused',
      // Keep existing dates — they don’t change on pause
    }
  }));

  try {
    const res = await pauseSubscription(currentPlan.razorpay_subscription_id);
    toast.success(res.message || ' Subscription paused');
    // No full reload needed — state is already updated
  } catch (err) {
    //  Revert on error
    setDashboard(prev => ({
      ...prev,
      current_plan: prevPlan
    }));
    toast.error(err.message || ' Failed to pause subscription');
  }
};

const handleResume = async () => {
  if (!currentPlan?.razorpay_subscription_id) {
    return toast.error('Subscription ID missing. Please refresh.');
  }

  //  Optimistic update
  const prevPlan = { ...currentPlan };
  setDashboard(prev => ({
    ...prev,
    current_plan: {
      ...prev.current_plan,
      status: 'active',
      cancel_at: null // clear if was cancelling
    }
  }));

  try {
    const res = await resumeSubscription(currentPlan.razorpay_subscription_id);
    toast.success(res.message || ' Subscription resumed');
  } catch (err) {
    //  Revert
    setDashboard(prev => ({
      ...prev,
      current_plan: prevPlan
    }));
    toast.error(err.message || 'Failed to resume subscription');
  }
};

const handleCancel = async (cancelImmediately = false) => {
  if (!currentPlan?.razorpay_subscription_id) {
    return toast.error('Subscription ID missing.');
  }

  const verb = cancelImmediately ? 'immediately' : 'at cycle end';
  const endDate = new Date(currentPlan.current_period_end).toLocaleDateString('en-IN');
  
  const confirmed = window.confirm(
    `Cancel subscription ${verb}?\nAccess ends on ${endDate}.\nThis cannot be undone.`
  );
  if (!confirmed) return;

  //  Optimistic update
  const prevPlan = { ...currentPlan };
  setDashboard(prev => ({
    ...prev,
    current_plan: {
      ...prev.current_plan,
      status: cancelImmediately ? 'cancelled' : 'cancelling',
      cancel_at: currentPlan.current_period_end //  show end date immediately
    }
  }));

  try {
    const res = await cancelSubscription(currentPlan.razorpay_subscription_id, cancelImmediately);
    toast.success(res.message || `Subscription ${cancelImmediately ? 'cancelled' : 'scheduled'}`);
  } catch (err) {
    // ❌ Revert
    setDashboard(prev => ({
      ...prev,
      current_plan: prevPlan
    }));
    toast.error(err.message || 'Failed to cancel subscription');
  }
};

  //  Effects
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadMore]);

  //  Handlers
  const handlePlanAction = (action) => {
    switch (action) {
      case "upgrade":
        window.location.href = "/pricing";
        break;
      case "add_colleges":
        window.location.href = "/jobs/create?mode=upgrade-plan";
        break;
      case "cancel":
        handleCancel();
        break;
      case "pause":
        handlePause();
        break;
      case "resume":
        handleResume();
        break;
      default:
        break;
    }
  };

  const handleViewTransaction = (id) => {
    fetchTransaction(id);
  };

  // Add this handler function inside BillingDashboard component
  const handleDownloadInvoice = async (orderId) => {
    try {
      await downloadInvoice(orderId);
      toast.success('Invoice downloaded successfully');
    } catch (err) {
      console.error('Download error:', err);
      toast.error(err.message || 'Failed to download invoice');
    }
  };

  //  Render
  if (loading && currentPage === 1) {
    return (
      <div className="py-12">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="space-y-6 animate-pulse">
            <div className="h-32 bg-gray-200 rounded-xl"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12">
        <div className="px-4 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
          <FaExclamationCircle className="w-12 h-12 mx-auto text-red-500" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">{error}</h3>
          <button
            onClick={fetchDashboard}
            className="inline-flex items-center px-4 py-2 mt-4 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  

  return (
    <MainLayout>
      <div className="py-8">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Billing & Plans
            </h1>
            {user.company_name && (
              <p className="mt-1 text-sm text-gray-500">
                <span className="font-medium">{user.company_name}</span>
                <span className="mx-2">•</span>
                <span>{user?.email}</span>
              </p>
            )}
          </div>

          {/* Plan Card */}
          <div className="mb-10">
            <PlanCard plan={currentPlan} onAction={handlePlanAction} />
          </div>

          {/* Transactions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Recent Transactions
                {dashboard?.pagination?.total > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                    {dashboard.pagination.total} total
                  </span>
                )}
              </h2>
              {/* <div className="flex items-center space-x-2">
                <button className="text-sm text-gray-500 hover:text-gray-700">
                  Filters
                </button>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                  Export
                </button>
              </div> */}
            </div>

            <TransactionTable
              transactions={transactions}
              onView={handleViewTransaction}
            />

            {transactions.length === 0 && !loading && (
              <div className="py-12 text-center">
                <FaExclamationCircle className="w-12 h-12 mx-auto text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No transactions yet
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Payments will appear here once processed.
                </p>
              </div>
            )}

            {/* Load More */}
            {(hasMore || loading) && (
              <div className="mt-6 text-center" ref={observerRef}>
                <button
                  onClick={loadMore}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <FaSpinner className="w-4 h-4 mr-2 -ml-1 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More Transactions"
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Help Section */}
          {/* <div className="p-6 mt-12 border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
            <h3 className="flex items-center text-lg font-semibold text-blue-900">
              <span className="flex items-center justify-center w-5 h-5 mr-2 text-xs font-bold text-white bg-blue-500 rounded-full">
                ?
              </span>
              Need help with billing?
            </h3>
            <p className="max-w-2xl mt-2 text-sm text-blue-700">
              Contact our support team for plan changes, refunds. Available
              Mon–Fri, 10 AM–6 PM IST.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <a
                href={`mailto:billing@yourjobportal.com?subject=Billing%20Query%20-%20${user?.company_name}`}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md shadow-sm hover:bg-blue-50"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Email Support : hello@scilienttech.com
              </a>
              <a
                href="/help/billing"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.5 3.29-3.5 4.5-2 1.21-4.5 1.5-6.5 1.5-2 0-4.5-.3-6.5-1.5-2-1.21-3.5-3.1-3.5-4.5 0-1.657 1.79-3 4-3 1.742 0 3.228.835 3.772 2z"
                  />
                </svg>
                Billing FAQ
              </a>
            </div>
          </div> */}

          <div className="p-6 mt-12 border border-[#9bc87c]/30 bg-gradient-to-r from-[#9bc87c]/10 to-green-50 rounded-xl">
  <h3 className="flex items-center text-lg font-semibold text-[#1e1e2d]">
    <span className="flex items-center justify-center w-5 h-5 mr-2 text-xs font-bold text-white bg-[#9bc87c] rounded-full">
      ?
    </span>
    Need help with billing?
  </h3>
  <p className="max-w-2xl mt-2 text-sm text-gray-700">
    Contact our support team for plan changes, refunds. Available
    Mon–Fri, 10 AM–6 PM IST.
  </p>
  <div className="flex flex-wrap gap-3 mt-4">
    <a
      href={`mailto:billing@yourjobportal.com?subject=Billing%20Query%20-%20${user?.company_name}`}
      className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#1e1e2d] bg-white border border-[#9bc87c] rounded-md shadow-sm hover:bg-[#9bc87c]/10 transition"
    >
      <svg
        className="w-4 h-4 mr-2 text-[#9bc87c]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        />
      </svg>
      Email Support : hello@scilienttech.com
    </a>
    <a
      href="/help/billing"
      className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#1e1e2d] bg-[#9bc87c] border border-transparent rounded-md hover:brightness-95 transition shadow-sm"
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.5 3.29-3.5 4.5-2 1.21-4.5 1.5-6.5 1.5-2 0-4.5-.3-6.5-1.5-2-1.21-3.5-3.1-3.5-4.5 0-1.657 1.79-3 4-3 1.742 0 3.228.835 3.772 2z"
        />
      </svg>
      Billing FAQ
    </a>
  </div>
</div>
        </div>

        {/* Modal */}
        <TransactionDetailModal
          transaction={selectedTxn}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onDownloadInvoice={handleDownloadInvoice}
        />

        {/* Global loading for modal */}
        {txnLoading && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-20">
            <div className="flex items-center p-6 bg-white rounded-lg shadow-lg">
              <FaSpinner className="w-5 h-5 mr-2 text-blue-600 animate-spin" />
              <span>Loading details...</span>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default BillingDashboard;