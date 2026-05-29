import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

// Importing existing components
import MainLayout from '../../../components/layout/MainLayout';
import CreditSummaryCard from '../../../components/payments/billing/university/CreditSummaryCard';
import ExpiryBreakdown from "../../../components/payments/billing/university/ExpiryBreakdown";
import TransactionTable from "../../../components/payments/billing/university/TransactionTable";
import CreditStatsCard from "../../../components/payments/billing/university/StatsRow";

const BASE_URL=import.meta.env.VITE_BASE_URL;


const UniversityCreditDashboard = () => {
  // Core state
  const [dashboardData, setDashboardData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {token}= useSelector((state)=> (state.auth));

  // Pagination state for lazy-load
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observer = useRef();

  // Fetch initial dashboard (summary + first 20 txns)
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(
        `${BASE_URL}/university/credit-dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDashboardData(res.data);
      setTransactions(res.data.recent_transactions); // initial set
      setPage(1);
      setHasMore(res.data.recent_transactions.length === 20); // assume more if full page
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError('Unable to load credit dashboard. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch more transactions (lazy-load)
  const fetchMoreTransactions = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const res = await axios.get(`${BASE_URL}/university/credit-transactions`, {
        params: {
          page: nextPage,
          limit: 20
        }
      },{
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
    );

      const newTxs = res.data.transactions;
      setTransactions(prev => [...prev, ...newTxs]);
      setPage(nextPage);
      setHasMore(newTxs.length === 20);
    } catch (err) {
      console.error('Failed to load more transactions:', err);
      setError('Failed to load more activity.');
    } finally {
      setLoadingMore(false);
    }
  }, [page, hasMore, loadingMore, token]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!hasMore || loadingMore) return;

    const currentObserver = observer.current;
    const callback = (entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        fetchMoreTransactions();
      }
    };

    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    };

    const io = new IntersectionObserver(callback, options);
    if (observer.current) io.observe(observer.current);

    return () => {
      if (io) io.disconnect();
      if (currentObserver) io.unobserve(currentObserver);
    };
  }, [fetchMoreTransactions, hasMore, loadingMore]);

  // Initial load
  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Retry handler
  const handleRetry = () => {
    setError(null);
    fetchDashboard();
  };

  // --- Render ---
  if (loading && !dashboardData) {
    return (
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6">
        <div className="space-y-6 animate-pulse">
          <div className="w-1/3 h-8 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="h-32 col-span-2 bg-gray-200 rounded-xl"></div>
            <div className="h-32 bg-gray-200 rounded-xl"></div>
          </div>
          <div className="h-48 bg-gray-200 rounded-xl"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl px-4 py-12 mx-auto text-center">
        <div className="p-6 text-red-700 border border-red-200 rounded-lg bg-red-50">
          <p className="mb-4 text-lg font-medium">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // return (
  //   <MainLayout>
  //   <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6">
  //     <div className="flex flex-col mb-6 md:flex-row md:items-center md:justify-between">
  //       <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
  //         🎓 University Credit Dashboard
  //       </h1>
  //       {/* Optional: Add "Buy Credits" CTA later */}
  //       <button className="px-4 py-2 mt-4 text-white bg-blue-600 rounded-lg md:mt-0 hover:bg-blue-700">
  //         + Buy Credits
  //       </button>
  //     </div>

  //     {/* Summary + Stats */}
  //     <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-3">
  //       <div className="lg:col-span-2">
  //         <CreditSummaryCard 
  //           summary={dashboardData.summary} 
  //           stats={dashboardData.stats} 
  //         />
  //       </div>
  //       <StatsRow stats={dashboardData.stats} />
  //     </div>

  //     {/* Expiry Breakdown */}
  //     <div className="mb-8">
  //       <ExpiryBreakdown expiry_breakdown={dashboardData.expiry_breakdown} />
  //     </div>

  //     {/* Transactions */}
  //     <div>
  //       <div className="mb-6 bg-white shadow rounded-xl">
  //         <div className="px-6 py-4 border-b border-gray-200">
  //           <h2 className="text-lg font-semibold text-gray-800">
  //             📜 Credit Activity History
  //           </h2>
  //           <p className="mt-1 text-sm text-gray-500">
  //             All purchases, unlocks, and expiries — newest first.
  //           </p>
  //         </div>
  //       </div>

  //       <TransactionTable transactions={transactions} />

  //       {/* Lazy-load trigger */}
  //       {hasMore && (
  //         <div 
  //           ref={observer}
  //           className="flex items-center justify-center h-10 text-gray-500"
  //         >
  //           {loadingMore ? (
  //             <span className="flex items-center">
  //               <svg className="w-4 h-4 mr-2 -ml-1 text-blue-600 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
  //                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
  //                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  //               </svg>
  //               Loading more...
  //             </span>
  //           ) : (
  //             'Scroll to load more'
  //           )}
  //         </div>
  //       )}

  //       {!hasMore && transactions.length > 0 && (
  //         <div className="py-4 text-sm text-center text-gray-500">
  //            End of transaction history
  //         </div>
  //       )}
  //     </div>
  //   </div>
  //   </MainLayout>
  // );









  return (
    <MainLayout>
      <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">University Credit Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track your available credits, expiry schedule, and usage history.
            </p>
          </div>
          <button className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition">
            + Buy Credits
          </button>
        </div>

        {/* Summary & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <CreditSummaryCard summary={dashboardData.summary} stats={dashboardData.stats} />
          </div>
          <CreditStatsCard stats={dashboardData.stats} />
        </div>

        {/* Expiry Breakdown */}
        <div className="mb-8">
          <ExpiryBreakdown expiry_breakdown={dashboardData.expiry_breakdown} />
        </div>

        {/* Transactions */}
        <div>
          <TransactionTable transactions={transactions} />

          {/* Infinite scroll loader */}
          {hasMore && (
            <div ref={observer} className="mt-6 flex justify-center">
              <div className="flex items-center text-gray-500">
                {loadingMore ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading more activity...
                  </>
                ) : (
                  'Scroll or wait to load more'
                )}
              </div>
            </div>
          )}

          {!hasMore && transactions.length > 0 && (
            <div className="mt-6 text-center text-sm text-gray-500 py-3">
              You’ve reached the end of your transaction history.
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );

};

export default UniversityCreditDashboard;