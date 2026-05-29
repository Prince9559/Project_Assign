import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import MainLayout from "../../../components/layout/MainLayout";

const BASE_URL = import.meta.env.VITE_BASE_URL;

/** Display order for broadcast checkboxes (matched to API names, case-insensitive). */
const TARGET_COURSE_LABELS = [
    "Arts",
    "Bachelor of Technology (B.Tech.)",
    "Bca",
    "Biotechnology",
    "Business",
    "Business Administration",
    "Chemical Engineering",
    "Civil Engineering",
    "Commerce",
    "Computer Science",
    "Electrical Engineering",
    "Electronics & Communication",
    "Electronics & Telecommunication",
    "Information Technology",
    "Instrumentation Engineering",
    "Mechanical Engineering",
    "Science",
];

const TARGET_INDUSTRY_LABELS = [
    "Agriculture & Food Processing",
    "Construction & Real Estate",
    "Education & Training",
    "Energy & Utilities",
    "Finance & Banking",
    "Government & Public Sector",
    "Healthcare",
    "Hospitality & Tourism",
    "Information Technology (IT)",
    "Legal & Consulting",
    "Logistics & Transportation",
    "Manufacturing",
    "Media & Entertainment",
    "Retail & E-commerce",
    "Telecommunications",
];

function looseNorm(s) {
    return String(s || "")
        .trim()
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/\s+/g, " ");
}

/**
 * Order and filter API items to match label list (best-effort name match).
 */
function buildOrderedOptions(apiItems, labelOrder) {
    const pool = Array.isArray(apiItems) ? [...apiItems] : [];
    const out = [];
    for (const label of labelOrder) {
        const L = looseNorm(label);
        let idx = pool.findIndex((it) => looseNorm(it.name) === L);
        if (idx < 0) {
            idx = pool.findIndex(
                (it) =>
                    looseNorm(it.name).includes(L) ||
                    L.includes(looseNorm(it.name))
            );
        }
        if (idx >= 0) {
            out.push(pool.splice(idx, 1)[0]);
        }
    }
    return out;
}

const NotificationUniversityPage = () => {
    const { token } = useSelector((state) => state.auth);

    // State Management
    const [credits, setCredits] = useState(0); 
    const [loading, setLoading] = useState(true);
    
    // Dynamic Options from DB
    const [availableCourses, setAvailableCourses] = useState([]);
    const [availableIndustries, setAvailableIndustries] = useState([]);
    
    // Form Selection
    const [selectedCourseIds, setSelectedCourseIds] = useState([]);
    const [selectedIndustryIds, setSelectedIndustryIds] = useState([]);

    // Hiring Timeline
    const [isUniversityHiring, setIsUniversityHiring] = useState(true);
    const [campusVisitStartDate, setCampusVisitStartDate] = useState('');

    // Actions & History
    const [isSending, setIsSending] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [broadcastHistory, setBroadcastHistory] = useState([]);
    const [fieldErrors, setFieldErrors] = useState({
        courses: "",
        industries: "",
    });

    // Fetch Initial Data
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                // Fetch Credits, Dropdown Options, and History independently so one failure does not block form data
                const [creditRes, optionsRes, historyRes] = await Promise.allSettled([
                    axios.get(`${BASE_URL}/university/credit-status`, config),
                    axios.get(`${BASE_URL}/university/broadcast/options`, config),
                    axios.get(`${BASE_URL}/university/broadcast/history`, config)
                ]);

                if (creditRes.status === 'fulfilled') {
                    setCredits(creditRes.value.data.remaining_credits || 1000);
                } else {
                    setCredits(1000);
                }

                if (optionsRes.status === 'fulfilled') {
                    setAvailableCourses(optionsRes.value.data.courses || []);
                    setAvailableIndustries(optionsRes.value.data.industries || []);
                } else {
                    setAvailableCourses([]);
                    setAvailableIndustries([]);
                }

                if (historyRes.status === 'fulfilled') {
                    setBroadcastHistory(historyRes.value.data || []);
                } else {
                    setBroadcastHistory([]);
                }
            } catch (err) {
                console.error('Failed to load broadcast data', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [token]);

    const orderedCourses = useMemo(
        () => buildOrderedOptions(availableCourses, TARGET_COURSE_LABELS),
        [availableCourses]
    );
    const orderedIndustries = useMemo(
        () => buildOrderedOptions(availableIndustries, TARGET_INDUSTRY_LABELS),
        [availableIndustries]
    );

    const displayCourses =
        orderedCourses.length > 0 ? orderedCourses : availableCourses;
    const displayIndustries =
        orderedIndustries.length > 0 ? orderedIndustries : availableIndustries;

    const selectedCoursesList = availableCourses.filter((course) =>
        selectedCourseIds.includes(course.id)
    );
    const selectedIndustriesList = availableIndustries.filter((industry) =>
        selectedIndustryIds.includes(industry.id)
    );

    const toggleCourseId = (id) => {
        setSelectedCourseIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
        setFieldErrors((e) => ({ ...e, courses: "" }));
    };

    const toggleIndustryId = (id) => {
        setSelectedIndustryIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
        setFieldErrors((e) => ({ ...e, industries: "" }));
    };

    // Calculate simulated estimates for UI
    const estimatedCompanies = Math.max(1, selectedCoursesList.length) * Math.max(1, selectedIndustriesList.length) * 12; 
    const estimatedCost = estimatedCompanies;

    // Validation
    const isFormValid = selectedCoursesList.length > 0 && selectedIndustriesList.length > 0 && (isUniversityHiring || campusVisitStartDate !== '');

    // Handle Send Invites (Submit to Backend)
    const handleSendInvites = async () => {
        setFieldErrors({ courses: "", industries: "" });
        if (selectedCourseIds.length === 0) {
            setFieldErrors({
                courses: "Please select at least one target course.",
                industries: "",
            });
            return;
        }
        if (selectedIndustryIds.length === 0) {
            setFieldErrors({
                courses: "",
                industries: "Please select at least one target industry.",
            });
            return;
        }
        if (!isUniversityHiring && !campusVisitStartDate) {
            setErrorMsg(
                "Please keep “University is currently hiring” checked, or select a campus visit start date."
            );
            setTimeout(() => setErrorMsg(""), 6000);
            return;
        }
        if (credits < estimatedCost) {
            setErrorMsg("Insufficient credits to run this broadcast!");
            setTimeout(() => setErrorMsg(''), 4000);
            return;
        }

        setIsSending(true);
        setErrorMsg('');

        try {
            const payload = {
                course_ids: selectedCoursesList.map(c => c.id),
                industry_ids: selectedIndustriesList.map(i => i.id),
                is_immediate: isUniversityHiring,
                start_date: isUniversityHiring ? null : campusVisitStartDate
            };

            const res = await axios.post(`${BASE_URL}/university/notifications/send`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update UI with response
            setCredits(prev => prev - res.data.broadcast.credits_used);
            setBroadcastHistory((prev) => [res.data.broadcast, ...prev]);
            
            // Reset Form
            setSelectedCourseIds([]);
            setSelectedIndustryIds([]);
            setIsUniversityHiring(true);
            setCampusVisitStartDate('');
            
            setSuccessMessage(res.data.message);
            setTimeout(() => setSuccessMessage(''), 5000);

        } catch (err) {
            setErrorMsg(err.response?.data?.error || 'Failed to send broadcast');
            setTimeout(() => setErrorMsg(''), 5000);
        } finally {
            setIsSending(false);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    
                    {/* Top Header & Navigation */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                            <Link to="/university/credits/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-purple-600 mb-2 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Dashboard
                            </Link>
                            <h1 className="text-3xl font-bold text-gray-800">Recruitment Broadcasts</h1>
                            <p className="mt-1 text-gray-600">Find companies hiring for specific courses and industries, and invite them.</p>
                            <Link
                                to="/university/notification-boost"
                                className="mt-2 inline-block text-sm font-medium text-blue-600 hover:underline"
                            >
                                Notification Boost — credits, email &amp; in-app alerts
                            </Link>
                        </motion.div>

                        {/* Credit Badge */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }} 
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4"
                        >
                            <div className="bg-purple-100 p-2.5 rounded-lg text-purple-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Available Credits</p>
                                <p className="text-2xl font-bold text-gray-900">{credits.toLocaleString()}</p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Alerts */}
                    <div className="space-y-3 mb-6">
                        <AnimatePresence>
                            {successMessage && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 shadow-sm"
                                >
                                    <svg className="h-6 w-6 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-green-800 font-medium">{successMessage}</p>
                                </motion.div>
                            )}
                            {errorMsg && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 shadow-sm"
                                >
                                    <svg className="h-6 w-6 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-red-800 font-medium">{errorMsg}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* LEFT: Broadcast Creation Tool */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: 0.1 }}
                            className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                    </svg>
                                    New Recruitment Invite
                                </h2>
                                <p className="text-blue-100 mt-1 text-sm">Target up to 1000 active companies by selected courses and industries.</p>
                            </div>

                            <div className="p-6 space-y-6">
                                
                                {/* Target Courses — checkbox multi-select */}
                                <div>
                                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                                        <label className="text-sm font-semibold text-gray-700">
                                            Target Courses <span className="text-red-500">*</span>
                                        </label>
                                        <span className="text-xs font-medium text-gray-500">
                                            {selectedCourseIds.length} selected
                                        </span>
                                    </div>
                                    <div
                                        className={`max-h-64 overflow-y-auto rounded-xl border bg-gray-50 p-4 ${
                                            fieldErrors.courses
                                                ? "border-red-300 ring-1 ring-red-200"
                                                : "border-gray-200"
                                        }`}
                                    >
                                        {displayCourses.length === 0 ? (
                                            <p className="text-sm text-gray-500">
                                                No courses available. Add courses to your university
                                                profile in the database (university_courses) or master
                                                catalog.
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
                                                {displayCourses.map((course) => (
                                                    <label
                                                        key={course.id}
                                                        className="flex items-start gap-2.5 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-white/80 transition"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            checked={selectedCourseIds.includes(
                                                                course.id
                                                            )}
                                                            onChange={() =>
                                                                toggleCourseId(course.id)
                                                            }
                                                        />
                                                        <span className="text-sm text-gray-800 leading-snug">
                                                            {course.name}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {fieldErrors.courses && (
                                        <p className="mt-1.5 text-sm text-red-600">
                                            {fieldErrors.courses}
                                        </p>
                                    )}
                                </div>

                                {/* Target Industries — checkbox multi-select */}
                                <div>
                                    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                                        <label className="text-sm font-semibold text-gray-700">
                                            Target Industries <span className="text-red-500">*</span>
                                        </label>
                                        <span className="text-xs font-medium text-gray-500">
                                            {selectedIndustryIds.length} selected
                                        </span>
                                    </div>
                                    <div
                                        className={`max-h-56 overflow-y-auto rounded-xl border bg-gray-50 p-4 ${
                                            fieldErrors.industries
                                                ? "border-red-300 ring-1 ring-red-200"
                                                : "border-gray-200"
                                        }`}
                                    >
                                        {displayIndustries.length === 0 ? (
                                            <p className="text-sm text-gray-500">
                                                No industries available. Check master data (approved
                                                industries).
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2">
                                                {displayIndustries.map((industry) => (
                                                    <label
                                                        key={industry.id}
                                                        className="flex items-start gap-2.5 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-white/80 transition"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                            checked={selectedIndustryIds.includes(
                                                                industry.id
                                                            )}
                                                            onChange={() =>
                                                                toggleIndustryId(industry.id)
                                                            }
                                                        />
                                                        <span className="text-sm text-gray-800 leading-snug">
                                                            {industry.name}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {fieldErrors.industries && (
                                        <p className="mt-1.5 text-sm text-red-600">
                                            {fieldErrors.industries}
                                        </p>
                                    )}
                                </div>

                                {/* Hiring Timeline */}
                                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Hiring Preference</label>
                                    
                                    <label className="inline-flex items-center cursor-pointer mb-4">
                                        <input 
                                            type="checkbox" 
                                            className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 transition duration-150 ease-in-out" 
                                            checked={isUniversityHiring}
                                            onChange={(e) => setIsUniversityHiring(e.target.checked)}
                                        />
                                        <span className="ml-3 text-gray-800 font-medium">University is currently hiring (target only active hiring companies)</span>
                                    </label>

                                    <div className="pt-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Campus Visit Start Date</label>
                                        <input
                                            type="date"
                                            value={campusVisitStartDate}
                                            min={new Date().toISOString().split('T')[0]}
                                            onChange={(e) => setCampusVisitStartDate(e.target.value)}
                                            className="w-full sm:w-auto bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 transition"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            {isUniversityHiring
                                                ? 'Optional when immediate hiring is enabled.'
                                                : 'Required when immediate hiring is unchecked.'}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Area */}
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex flex-col sm:flex-row justify-between items-center bg-blue-50 p-4 rounded-xl border border-blue-100 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">Estimated Target Reach</p>
                                            <p className="text-2xl font-bold text-gray-900 flex items-baseline gap-2">
                                                {selectedCoursesList.length === 0 || selectedIndustriesList.length === 0 ? 0 : `Up to ${estimatedCompanies}`} 
                                                <span className="text-sm font-medium text-gray-500">Companies</span>
                                            </p>
                                            <p className="text-xs text-blue-600 font-medium mt-1">Cost: {selectedCoursesList.length === 0 || selectedIndustriesList.length === 0 ? 0 : estimatedCost} Credits</p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleSendInvites}
                                            disabled={isSending}
                                            className={`relative inline-flex items-center justify-center px-8 py-3 font-semibold text-white rounded-xl transition-all shadow-md
                                                ${isSending
                                                    ? 'bg-gray-400 cursor-wait shadow-none'
                                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:-translate-y-0.5'
                                                }`}
                                        >
                                            {isSending ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Broadcasting...
                                                </>
                                            ) : (
                                                'Send Invites Now'
                                            )}
                                        </button>
                                    </div>
                                    {credits < estimatedCost && isFormValid && (
                                        <p className="text-red-500 text-sm mt-2 font-medium text-right">Not enough credits. Please recharge.</p>
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* RIGHT: Broadcast History List */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl shadow border border-gray-100 flex flex-col h-full max-h-[800px]"
                        >
                            <div className="p-5 border-b border-gray-100 bg-gray-50 rounded-t-2xl">
                                <h3 className="font-bold text-gray-800 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Recent Broadcasts
                                </h3>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-0">
                                {broadcastHistory.length > 0 ? (
                                    <ul className="divide-y divide-gray-100">
                                        {broadcastHistory.map((item) => (
                                            <li key={item.id} className="p-5 hover:bg-gray-50 transition">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
                                                        {item.status}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(item.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-semibold text-gray-800 mb-1">Invited {item.companies_reached} Companies</p>
                                                
                                                <div className="space-y-1.5">
                                                    <div className="text-xs text-gray-600 flex items-start gap-1">
                                                        <span className="font-medium">Courses:</span> 
                                                        <span className="line-clamp-1 flex-1">{Array.isArray(item.courses_selected) ? item.courses_selected.join(', ') : item.courses_selected}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-600 flex items-start gap-1">
                                                        <span className="font-medium">Industry:</span> 
                                                        <span className="line-clamp-1 flex-1">{Array.isArray(item.industries_selected) ? item.industries_selected.join(', ') : item.industries_selected}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-600">
                                                        <span className="font-medium">Timeline: </span> 
                                                        {item.is_immediate
                                                            ? 'Immediate Hiring'
                                                            : `Campus visit from ${new Date(item.start_date).toLocaleDateString('en-IN')}`}
                                                    </div>
                                                </div>

                                                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center text-xs font-medium">
                                                    <span className="text-red-500">- {item.credits_used} Credits</span>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="p-8 text-center">
                                        <p className="text-gray-500 text-sm">No broadcasts sent yet.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                    </div>
                </div>
            </div>
        </MainLayout>
    );
};

export default NotificationUniversityPage;