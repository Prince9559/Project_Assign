import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {Link, useNavigate} from "react-router-dom";
import axios from 'axios';
import { format, parseISO, differenceInDays } from 'date-fns';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import {useSelector} from "react-redux";
import {getImageUrl} from "../../../../utils";

import MainLayout from "../../../components/layout/MainLayout";

const BASE_URL= import.meta.env.VITE_BASE_URL;

// Helper: Credit health status
const getCreditHealth = (remaining, nextExpiry) => {
    if (remaining <= 0) return 'critical';
    if (remaining <= 3) return 'low';
    if (nextExpiry) {
        const days = differenceInDays(parseISO(nextExpiry), new Date());
        if (days <= 3) return 'urgent';
        if (days <= 7) return 'warning';
    }
    return 'healthy';
};



const CreditRing = ({ total = 100, used = 0, remaining = 0, health = 'healthy' }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? Math.min(1, used / total) : 0;
  const strokeDashoffset = circumference - progress * circumference;

  const getColor = () => {
    if (health === 'critical') return '#ef4444'; // red
    if (health === 'urgent' || health === 'low') return '#f97316'; // orange
    if (health === 'warning') return '#eab308'; // yellow
    return '#3b82f6'; // blue (healthy)
  };

  const strokeColor = getColor();

  return (
    <div className="relative flex items-center justify-center">
      <svg width="100" height="100" className="transform -rotate-90">
        {/* Background ring */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="6"
          fill="none"
        />
        {/* Progress ring */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={strokeColor}
          strokeWidth="6"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-lg font-bold text-gray-800">{remaining}</div>
        <div className="text-xs text-gray-500">left</div>
      </div>
    </div>
  );
};





















const CreditDashboardPage = () => {
    const navigate= useNavigate();
    const {token,user} = useSelector((state) => (state.auth));
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedBatchGroups, setExpandedBatchGroups] = useState({});
    const [exporting, setExporting] = useState(false);

    const organization=user;

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${BASE_URL}/university/credit-dashboard`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            setData(res.data);
        } catch (err) {
            console.error('Failed to load dashboard', err);
            setError('Unable to load dashboard. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const health = data
        ? getCreditHealth(data.summary.remaining_credits, data.summary.next_expiry)
        : 'healthy';

    // Smart CTA based on health
    const getCTA = () => {
        if (health === 'critical' || health === 'urgent') {
            return {
                title: '⚠️ Credits Running Out!',
                message: 'Unlock more recruiter contacts — renew before expiry.',
                action: 'Renew Now',
                href: '/university/credits/pricing?recommended=yearly',
                color: 'bg-[#9bc87c] hover:bg-[#86b36a]',
            };
        }
        if (health === 'low' || health === 'warning') {
            return {
                title: '🔔 Low Credits',
                message: 'Top up now and get 10% extra credits on yearly plans.',
                action: 'Get More Credits',
                href: '/university/credits/pricing?recommended=yearly',
                color: 'bg-[#9bc87c] hover:bg-[#86b36a]',
            };
        }
        return {
            title: '✨ Grow Your Reach',
            message: 'Unlock more recruiters details to connect with them',
            action: 'Unlock More Details',
            href: '/university/credits/pricing?recommended=yearly',
            color: 'bg-[#9bc87c] hover:bg-[#86b36a]',
        };
    };

    const cta = getCTA();

    // Export transactions
    const handleExportTransactions = async () => {
        if (!data || data.recent_transactions.length === 0) return;
        setExporting(true);

        try {
            // Fetch full transaction history (optional: paginate if needed)
            const fullRes = await axios.get(`${BASE_URL}/university/credit-transactions`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                } ,

                {
                params: { limit: 1000 }
                }
            );

            const transactions = fullRes.data.transactions;
            const rows = transactions.map((t) => ({
                'Date & Time': new Date(t.created_at).toLocaleString('en-IN'),
                'Action': t.action_label,
                'Credits': t.credits_changed,
                'Balance After': t.credits_after,
                'Description': t.description || '—',
                'Reference': t.reference_type ? `${t.reference_type}:${t.reference_id}` : '—',
            }));

            const ws = XLSX.utils.json_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Credit History');
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
            saveAs(blob, `credit_history_${new Date().toISOString().slice(0, 10)}.xlsx`);
        } catch (err) {
            alert('Export failed. Try again.');
        } finally {
            setExporting(false);
        }
    };


    // Skeleton loaders
    const SkeletonCard = ({ h = 'h-48' }) => (
        <div className={`bg-white rounded-2xl shadow p-6 animate-pulse ${h}`}>
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
        </div>
    );

    if (error) {
        return (
            <MainLayout>
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center max-w-md">
                    <div className="text-red-500 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-gray-700 mb-4">{error}</p>
                    <button
                        onClick={fetchData}
                        className="px-4 py-2 bg-[#9bc87c] text-white rounded-lg hover:bg-[#86b36a]"
                    >
                        Retry
                    </button>
                </div>
            </div>
            </MainLayout>
        );
    }

    return (

        <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">🎓 University Credit Dashboard</h1>
                    <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
                        Track your credit balance, expiry schedule, and usage history. Unlock recruiter contacts to boost campus placements.
                    </p>
                </motion.div>
<motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="rounded-2xl p-5 mb-8 bg-[#9bc87c] text-white shadow-lg"
                >
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            {/* <div className="bg-white/20 p-3 rounded-full hidden sm:block">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div> */}
                            <div>
                                <h3 className="text-xl font-bold">🔔 University Notifications</h3>
                                <p className="opacity-90 mt-1">Stay updated with your latest alerts, recruiter connections, and account activities.</p>
                            </div>
                        </div>
                        <Link
                            to="/university/notification-boost"
                            className="inline-block px-6 py-3 font-medium rounded-lg text-white bg-[#9bc87c] hover:bg-[#86b36a] transition shadow hover:shadow-lg whitespace-nowrap"
                        >
                            View Notifications
                        </Link>
                    </div>
                </motion.div>
                {/* Smart CTA Banner */}
                {data && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="rounded-2xl p-5 mb-8 text-white bg-[#9bc87c]"
                    >
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h3 className="text-xl font-bold">{cta.title}</h3>
                                <p className="opacity-90 mt-1">{cta.message}</p>
                            </div>
                            <Link
                                to={cta.href}
                                className={`inline-block px-6 py-3 font-medium rounded-lg text-white ${cta.color} transition shadow-lg hover:shadow-xl`}
                            >
                                {cta.action}
                            </Link>
                        </div>
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Credit Overview Card */}
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-2"
                    >
                        {loading ? (
                            <SkeletonCard h="h-80" />
                        ) : data ? (
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                                <div className="bg-[#9bc87c] p-6 text-white">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                {/* Left: Org Name + Logo */}
                                                <div className="flex items-center flex-wrap gap-3">
                                                    {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg> */}
                                                    <div className="flex items-center gap-3">
                                                        
                                                        {/* {user?.organization_logo ? (
                                                            <img
                                                                src={getImageUrl(user.organization_logo)}
                                                                alt={user.organization_name}
                                                                className="h-8 w-8 rounded-md object-contain bg-white/20"
                                                            />
                                                        ) : (
                                                            <div className="h-8 w-8 rounded-md bg-white/20 flex items-center justify-center font-bold text-sm">
                                                                {user?.organization_name
                                                                    ? user.organization_name
                                                                        .split(' ')
                                                                        .map(w => w[0])
                                                                        .join('')
                                                                        .substring(0, 2)
                                                                        .toUpperCase()
                                                                    : 'U'}
                                                            </div>
                                                        )} */}
                                                        <h2 className="text-xl font-bold">
                                                            {/* {organization?.name || 'Your University'}  */}
                                                            Your Credit Balance for Unlocking Details 
                                                        </h2>
                                                    </div>
                                                </div>

                                                {/* Right: Compact Stats (Purchased | Used | Expired) */}
                                                {/* {data && (
                                                    <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
                                                        <div className="text-center">
                                                            <div>₹{data.stats.total_purchased}</div>
                                                            <div className="opacity-80 text-xs">Purchased</div>
                                                        </div>
                                                        <div className="w-px h-6 bg-white/30"></div>
                                                        <div className="text-center">
                                                            <div className="text-blue-200">₹{data.stats.total_used}</div>
                                                            <div className="opacity-80 text-xs">Used</div>
                                                        </div>
                                                        <div className="w-px h-6 bg-white/30"></div>
                                                        <div className="text-center">
                                                            <div className="text-red-200">₹{data.stats.total_expired}</div>
                                                            <div className="opacity-80 text-xs">Expired</div>
                                                        </div>
                                                    </div>
                                                )} */}
                                            </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                        {/* Stats */}
                                        <div className="text-center md:text-left space-y-3">
                                            <div>
                                                <span className="text-xs text-gray-500">Remaining</span>
                                                <div className="text-4xl md:text-5xl font-bold text-gray-800">
                                                    {data.summary.remaining_credits}
                                                </div>
                                            </div>
                                            {/* <div>
                                                <span className="text-xs text-gray-500">Total Purchased</span>
                                                <div className="text-2xl font-semibold text-gray-700">
                                                    {data.summary.total_credits}
                                                </div>
                                            </div> */}
                                            {data.summary.next_expiry && (
                                                <div className="mt-2">
                                                    <span className="text-xs text-gray-500">Next Expiry</span>
                                                    <div className="text-lg font-medium text-orange-600">
                                                        {format(parseISO(data.summary.next_expiry), 'dd MMM yyyy')}
                                                    </div>
                                                </div>
                                            )}
                                        </div>


                                    </div>

                                            

                                    {/* Usage Stats Bar (Simplified) */}
                                    <div className="mt-6 pt-4 border-t border-gray-100">
                                        <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                            <div>
                                                <div className="text-lg font-bold text-green-600">{data.stats.total_purchased}</div>
                                                <div className="text-gray-600">Purchased</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold text-blue-600">{data.stats.total_used}</div>
                                                <div className="text-gray-600">Used</div>
                                            </div>
                                            <div>
                                                <div className="text-lg font-bold text-red-600">{data.stats.total_expired}</div>
                                                <div className="text-gray-600">Expired</div>
                                            </div>
                                        </div>
                                    </div>


                                </div>
                            </div>
                        ) : null}
                    </motion.div>

                    {/* Quick Stats */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        {loading ? (
                            <SkeletonCard />
                        ) : data ? (
                            <>
                            <div className="bg-white rounded-2xl shadow p-5">
                                <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Quick Stats
                                </h3>
                                <div className="space-y-4">
                                    <StatItem
                                        label="Unlocked Contacts"
                                        value={data.recent_transactions.filter(t => t.action_type === 'used').length}
                                        icon="👥"
                                        color="bg-blue-100 text-blue-700"
                                    />
                                    <StatItem
                                        label="Active Batches"
                                        value={data.expiry_breakdown.length}
                                        icon="📦"
                                        color="bg-purple-100 text-purple-700"
                                    />
                                    <StatItem
                                        label="Avg. Use/Week"
                                        value="~8"
                                        icon="📈"
                                        color="bg-green-100 text-green-700"
                                        tooltip="Based on last 4 weeks"
                                    />
                                </div>
                            </div>



                                        {/* === Standalone CTA: View Unlocked Contacts === */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 }}
                                            className="mt-6 text-center"
                                        >
                                            <Link
                                                to="/university/credits/unlocked-contacts"
                                                className="inline-flex items-center px-5 py-2.5 bg-[#9bc87c] border border-[#9bc87c] text-white font-medium rounded-lg hover:bg-[#86b36a] transition shadow-sm"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M12 18v-6" />
                                                </svg>
                                                View All Unlocked Recruiter Details
                                            </Link>
                                        </motion.div>

                            </>
                        ) : null}
                    </motion.div>




                       
                </div>

                

                {/* Expiry Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Credit Expiry Schedule
                        </h2>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[1, 2].map(i => <SkeletonCard key={i} />)}
                        </div>
                    ) : data && data.expiry_breakdown.length > 0 ? (
                        <div className="space-y-4">
                            {data.expiry_breakdown.map((group, idx) => {
                                const days = group.expiry_date
                                    ? differenceInDays(new Date(group.expiry_date), new Date())
                                    : Infinity;
                                const isUrgent = days <= 7 && days > 0;
                                const isExpired = days <= 0;

                                return (
                                    <div
                                        key={idx}
                                        className={`rounded-xl border ${isExpired
                                                ? 'border-red-200 bg-red-50'
                                                : isUrgent
                                                    ? 'border-orange-200 bg-orange-50'
                                                    : 'border-gray-200 bg-white'
                                            } shadow-sm`}
                                    >
                                        <div
                                            className={`p-5 cursor-pointer flex justify-between items-center ${expandedBatchGroups[idx] ? 'rounded-t-xl' : 'rounded-xl'
                                                }`}
                                            onClick={() =>
                                                setExpandedBatchGroups((prev) => ({
                                                    ...prev,
                                                    [idx]: !prev[idx],
                                                }))
                                            }
                                        >
                                            <div className="flex items-center">
                                                <div
                                                    className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${isExpired
                                                            ? 'bg-red-100 text-red-700'
                                                            : isUrgent
                                                                ? 'bg-orange-100 text-orange-700'
                                                                : 'bg-blue-100 text-blue-700'
                                                        }`}
                                                >
                                                    {isExpired ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-800">
                                                        {group.credits} credits
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        Expires {group.expiry_date_display}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                {!isExpired && (
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-bold ${isUrgent
                                                                ? 'bg-orange-200 text-orange-800'
                                                                : 'bg-green-200 text-green-800'
                                                            }`}
                                                    >
                                                        {days <= 0 ? 'Expired' : `${days} days left`}
                                                    </span>
                                                )}
                                                <svg
                                                    className={`h-5 w-5 text-gray-500 transition-transform ${expandedBatchGroups[idx] ? 'rotate-180' : ''
                                                        }`}
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {expandedBatchGroups[idx] && group.batches && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="px-5 pb-5 border-t border-gray-200"
                                                >
                                                    <p className="text-sm text-gray-600 mb-3">
                                                        {group.batches.length} batch{group.batches.length !== 1 ? 'es' : ''} in this expiry group:
                                                    </p>
                                                    <div className="space-y-3">
                                                        {group.batches.map((batch, bIdx) => (
                                                            <div
                                                                key={bIdx}
                                                                className="bg-white border border-gray-200 rounded-lg p-3 text-sm"
                                                            >
                                                                <div className="flex justify-between">
                                                                    <span className="font-mono text-gray-700">Batch #{batch.batch_id}</span>
                                                                    <span className="font-medium">
                                                                        +{batch.credits_added} → used {batch.credits_used}
                                                                    </span>
                                                                </div>
                                                                <div className="mt-1 text-right">
                                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                                                                        {batch.remaining} remaining
                                                                    </span>
                                                                </div>
                                                                {batch.order_id && (
                                                                    <div className="mt-2 text-gray-500 text-xs">
                                                                        Order: <span className="font-mono">{batch.order_id}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="mt-3 text-gray-600">No active credit batches.</p>
                            <Link
                                to="/university/credits/pricing"
                                className="mt-4 inline-block px-4 py-2 bg-[#9bc87c] text-white rounded-lg hover:bg-[#86b36a]"
                            >
                                Buy Credits
                            </Link>
                        </div>
                    )}
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Recent Activity
                        </h2>
                        <button
                            onClick={handleExportTransactions}
                            disabled={exporting || !data || data.recent_transactions.length === 0}
                            className={`flex items-center text-sm font-medium ${exporting || !data || data.recent_transactions.length === 0
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-blue-600 hover:text-blue-800'
                                }`}
                        >
                            {exporting ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Export CSV
                                </>
                            )}
                        </button>
                    </div>

                    {loading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => <SkeletonCard key={i} h="h-20" />)}
                        </div>
                    ) : data && data.recent_transactions.length > 0 ? (
                        <div className="bg-white rounded-xl shadow overflow-hidden">
                            <ul className="divide-y divide-gray-100">
                                {data.recent_transactions.map((tx, idx) => {
                                    const isPositive = tx.credits_changed > 0;
                                    const colorClass = isPositive
                                        ? 'text-green-700 bg-green-50'
                                        : tx.action_type === 'used'
                                            ? 'text-blue-700 bg-blue-50'
                                            : 'text-gray-700 bg-gray-50';

                                    return (
                                        <li key={idx} className="p-4 hover:bg-gray-50 transition">
                                            <div className="flex items-start">
                                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${colorClass} mr-3`}>
                                                    <span>{tx.icon || 'ℹ️'}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900">{tx.action_label}</p>
                                                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                                        {tx.description || '—'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(tx.created_at).toLocaleString('en-IN', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span
                                                        className={`font-bold ${isPositive ? 'text-green-600' : 'text-blue-600'
                                                            }`}
                                                    >
                                                        {isPositive ? '+' : ''}
                                                        {tx.credits_changed}
                                                    </span>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        → {tx.credits_after}
                                                    </div>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                            <div className="p-4 text-center border-t border-gray-100">
                                <Link
                                    to="/university/credits/transactions"
                                    className="text-purple-600 hover:text-purple-800 font-medium"
                                >
                                    View All Transactions →
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl p-8 text-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <p className="mt-3 text-gray-600">No recent activity.</p>
                        </div>
                    )}
                </motion.div>


                {/* === Recent Activity (with Pagination) === */}
                {/* <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Recent Activity
                        </h2>
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={handleExportTransactions}
                                disabled={exporting || transactionLoading || (transactions.length === 0 && !data)}
                                className={`flex items-center text-sm font-medium ${exporting || transactionLoading || (transactions.length === 0 && !data)
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-blue-600 hover:text-blue-800'
                                    }`}
                            >
                                {exporting ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Exporting...
                                    </>
                                ) : (
                                    <>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Export CSV
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <TransactionList
                        initialTransactions={data?.recent_transactions || []}
                        universityId={data?.university_id} // optional: pass if needed
                    />
                </motion.div> */}


                {/* === Recent Activity (with Pagination) === */}
            

                {/* Footer CTA */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 text-center"
                >
                    <p className="text-gray-600 mb-4">Need more credits to unlock recruiter contacts?</p>
                    <Link
                        to="/university/credits/pricing?recommended=yearly"
                        className="inline-block px-8 py-3 bg-[#9bc87c] text-white font-bold rounded-xl shadow-lg hover:bg-[#86b36a] hover:shadow-xl transition transform hover:-translate-y-0.5"
                    >
                         Buy Credits 
                    </Link>
                </motion.div>
            </div>
        </div>
        </MainLayout>
    );
};

// StatItem Reusable Component
const StatItem = ({ label, value, icon, color, tooltip }) => (
    <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color} mr-3`}>
            <span>{icon}</span>
        </div>
        <div>
            <div className="font-bold text-gray-800">{value}</div>
            <div className="text-xs text-gray-600">{label}</div>
            {tooltip && <div className="text-xs text-gray-500 mt-0.5">{tooltip}</div>}
        </div>
    </div>
);




// =============== CreditBreakdownRing Component ===============
const CreditBreakdownRing = ({ total, used, expired, remaining }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  // Normalize to proportions of total (handle zero safely)
  const totalCredits = Math.max(total, 1);
  const usedPct = (used / totalCredits);
  const expiredPct = (expired / totalCredits);
  const remainingPct = (remaining / totalCredits);

  // Stroke dash lengths (in order: used → expired → remaining)
  const usedDash = usedPct * circumference;
  const expiredDash = expiredPct * circumference;
  const remainingDash = remainingPct * circumference;

  return (
    <div className="flex flex-col items-center">
      {/* Ring */}
      <div className="relative w-48 h-48">
        <svg width="192" height="192" viewBox="0 0 200 200" className="transform -rotate-90">
          {/* Background */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="10"
            fill="none"
          />
          {/* Used (Blue) */}
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            stroke="#3b82f6" // blue-500
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - usedDash }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          {/* Expired (Red) — starts after used */}
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            stroke="#ef4444" // red-500
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ 
              strokeDashoffset: circumference - usedDash - expiredDash 
            }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          />
          {/* Remaining (Green) — starts after used+expired */}
          <motion.circle
            cx="100"
            cy="100"
            r={radius}
            stroke="#10b981" // emerald-500
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ 
              strokeDashoffset: circumference - usedDash - expiredDash - remainingDash 
            }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          />
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-800">₹</span>
            <span className="text-3xl font-bold text-gray-800 ml-0.5">{total}</span>
          </div>
          <div className="text-xs text-gray-600 mt-1">Total Purchased</div>
        </div>

        {/* Legend below ring */}
        <div className="absolute -bottom-8 left-0 right-0 flex justify-center gap-4">
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-full bg-blue-500 mr-1"></div>
            <span>Used ({used})</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
            <span>Expired ({expired})</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-full bg-emerald-500 mr-1"></div>
            <span>Remaining ({remaining})</span>
          </div>
        </div>
      </div>

      {/* Optional: Small insight below */}
      {remaining === 0 && used > 0 && (
        <div className="mt-4 text-center text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg max-w-xs">
          <strong>All credits used or expired.</strong> Renew to unlock more recruiters.
        </div>
      )}
      {remaining > 0 && expired > 0 && (
        <div className="mt-4 text-center text-sm text-gray-700">
          {expired} credits expired — consider faster usage or smaller batches.
        </div>
      )}
    </div>
  );
};

export default CreditDashboardPage;