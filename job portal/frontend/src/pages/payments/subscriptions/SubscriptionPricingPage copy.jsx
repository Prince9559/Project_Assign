// src/pages/SubscriptionPricingPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  FaCheck,
  FaTimes,
  FaBolt,
  FaChartLine,
  FaCalendarAlt,
  FaUsers,
  FaLock,
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp,
  FaUniversity,
  FaRocket,
} from "react-icons/fa";
import MainLayout from "../../../components/layout/MainLayout";
import { getPricingRules } from "../../../api/recruiterPaymentApi";

import useRazorpay from "../../../hooks/useRazorpay";

const BASE_URL = import.meta.env.VITE_BASE_URL;


const SubscriptionPricingPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [billingCycle, setBillingCycle] = useState("yearly"); // Default to yearly (higher value)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const { token, user } = useSelector((state) => state.auth);

  const {
    isLoaded: razorpayLoaded,
    error: razorpayError,
    openRazorpay,
  } = useRazorpay();

  // College targeting state (per-post, not subscription)
  const [collegeCount, setCollegeCount] = useState(10);
  const [pricingRules, setPricingRules] = useState(null);
  const [pricingResult, setPricingResult] = useState(null);

  // Fetch pricing rules (for college per-post)
  useEffect(() => {
    const loadPricingRules = async () => {
      try {
        const rules = await getPricingRules("college");
        setPricingRules(rules);
      } catch (err) {
        console.error("Failed to load college pricing rules", err);
      }
    };
    loadPricingRules();
  }, []);

  // Fetch subscription plans (exclude 'college' type)
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/subscriptions/plans`);
        if (res.data.success) {
          // Sort by price (monthly or yearly), low → high
          const sorted = [...res.data.plans].sort((a, b) => {
            const priceA =
              billingCycle === "yearly" ? a.yearly?.price : a.monthly?.price;
            const priceB =
              billingCycle === "yearly" ? b.yearly?.price : b.monthly?.price;
            return (priceA || 0) - (priceB || 0);
          });
          setPlans(sorted);
        }
      } catch (err) {
        console.error("Failed to load plans", err);
        setError("Failed to load plans. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, [billingCycle]); // Re-sort when cycle changes

  // ======== CREDIT PACKS SECTION (NEW) ========
  const [creditPacks, setCreditPacks] = useState([]);
  const [creditLoading, setCreditLoading] = useState(true);
  const [isCreditProcessing, setIsCreditProcessing] = useState(false);

  // Fetch credit packs (same as CreditPacksPage)
  useEffect(() => {
    const fetchCreditPacks = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/subscriptions/credits/plans`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          // Sort low → high by price (matches your preference)
          const sorted = [...res.data.plans].sort((a, b) => a.price - b.price);
          setCreditPacks(sorted);
        }
      } catch (err) {
        console.error("Failed to load credit packs", err);
      } finally {
        setCreditLoading(false);
      }
    };
    if (token) fetchCreditPacks();
  }, [token]);

  // Recalculate pricing rules when college count changes
  useEffect(() => {
    if (!pricingRules) return;
    const { tiers, gst_percent = 18 } = pricingRules;
    const tier = tiers.find(
      (t) => collegeCount >= t.min && (t.max === null || collegeCount <= t.max)
    );
    if (!tier) return;

    let baseAmount;
    if (tier.flat_rate !== undefined) {
      baseAmount = tier.flat_rate;
    } else if (
      tier.base !== undefined &&
      tier.increment_per_college !== undefined
    ) {
      const extra = Math.max(0, collegeCount - tier.min);
      baseAmount = tier.base + extra * tier.increment_per_college;
    } else {
      baseAmount = collegeCount * 2000; // fallback
    }

    const gstAmount = Math.round((baseAmount * gst_percent) / 100);
    const totalAmount = baseAmount + gstAmount;
    const perCollege = Math.round(totalAmount / collegeCount);
    const listPriceTotal = collegeCount * 2000;
    const savings = listPriceTotal - baseAmount;

    setPricingResult({
      baseAmount,
      gstAmount,
      totalAmount,
      perCollege,
      savings,
      tier,
    });
  }, [collegeCount, pricingRules]);

  const handleSubscribe = (planId) => {
    navigate(`/checkout/subscription?plan=${planId}&cycle=${billingCycle}`);
  };

  const handlePostFreeJob = () => {
    navigate("/recruiter-post-opportunity-selector");
  };

  const handlePostTargetedJob = () => {
    navigate("/recruiter-post-opportunity-selector");
  };

  const {
    totalAmount = 0,
    perCollege = 0,
    savings = 0,
    tier = {},
  } = pricingResult || {};

  const buyCredits = async (pack) => {
    if (!razorpayLoaded) {
      alert("Payment system is loading...");
      return;
    }

    setIsCreditProcessing(true);

    try {
      // 1. Create order
      const orderRes = await fetch(`${BASE_URL}/subscriptions/credits/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan_id: pack.id }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success)
        throw new Error(orderData.message || "Order failed");

      // 2. Open Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_API_KEY,
        amount: orderData.total_amount * 100, // paise
        currency: "INR",
        name: "Job Portal",
        description: `Buy ${pack.credits} College Credits`,
        order_id: orderData.razorpay_order_id,
        handler: (response) => {
          console.log("Razorpay success", response);
          setIsCreditProcessing(false);
          //  Redirect to success OR just show toast & refresh balance
          alert(`✅ ${pack.credits} credits added to your account!`);
          // Optional: refetch credit balance or plans
        },
        prefill: {
          name: user?.name || localStorage.getItem("userName") || "",
          email: user?.email || localStorage.getItem("userEmail") || "",
        },
        theme: { color: "#3B82F6" },
        modal: {
          ondismiss: () => {
            setIsCreditProcessing(false);
            alert("Payment cancelled");
          },
        },
      };

      openRazorpay(options);
    } catch (err) {
      console.error("Payment failed:", err);
      alert(err.message || "Failed to initiate payment");
      setIsCreditProcessing(false);
    }
  };

  if (loading) {
    return (
      <MainLayout heading="Pricing" subheading="Loading plans...">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="text-gray-600">Fetching plans...</div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout heading="Pricing" subheading="Subscription Plans">
        <div className="max-w-4xl px-4 py-12 mx-auto text-center">
          <div className="p-4 mb-6 text-red-700 rounded-lg bg-red-50">
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </MainLayout>
    );
  }

  // Feature comparison data
  const featureRows = [
    {
      label: "Monthly Price",
      render: (p) => (p.monthly ? `₹${p.monthly.price.toLocaleString()}` : "—"),
      bold: true,
    },
    {
      label: "Yearly Price",
      render: (p) => (p.yearly ? `₹${p.yearly.price.toLocaleString()}` : "—"),
      bold: true,
    },
    {
      label: "Savings (Yearly)",
      render: (p) =>
        p.yearly?.savings
          ? `Save ₹${(
              p.monthly?.price * 12 -
              p.yearly.price
            ).toLocaleString()} (${p.yearly.savings}%)`
          : "—",
      color: "text-green-600",
    },
    {
      label: "Active Job Posts",
      render: (p) => {
        const limit = p.features.job_post_limits?.active;
        return limit ? limit : "Unlimited";
      },
    },
    {
      label: "Future Job Posts",
      render: (p) => {
        const limit = p.features.job_post_limits?.future;
        return limit !== undefined ? limit : "Unlimited";
      },
    },
    {
      label: "Credits/month",
      render: (p) => p[billingCycle]?.credits || "0",
      info: "For job posting, analytics, boosts",
    },
    {
      label: "Analytics Dashboard",
      render: (p) =>
        p.features.analytics ? (
          <FaCheck className="text-green-500" />
        ) : (
          <FaTimes className="text-gray-300" />
        ),
    },
    {
      label: "Custom Application Dates",
      render: (p) =>
        p.features.custom_dates ? (
          <FaCheck className="text-green-500" />
        ) : (
          <FaTimes className="text-gray-300" />
        ),
    },
    {
      label: "Email/App Reminders",
      render: (p) =>
        p.features.reminders ? (
          <FaCheck className="text-green-500" />
        ) : (
          <FaTimes className="text-gray-300" />
        ),
    },
    {
      label: "API Access",
      render: (p) =>
        p.features.api_access ? (
          <FaCheck className="text-green-500" />
        ) : (
          <FaTimes className="text-gray-300" />
        ),
    },
    {
      label: "Support",
      render: (p) => {
        const support = p.features.support;
        const time = p.features.support_response_time;
        return (
          <div>
            <span className="font-medium">
              {support === "dedicated"
                ? "Dedicated"
                : support === "priority"
                ? "Priority"
                : "Email"}
            </span>
            {time && (
              <span className="block text-xs text-gray-500">
                {time} response
              </span>
            )}
          </div>
        );
      },
    },
  ];

  const featureHighlights = [
    {
      icon: <FaUsers className="text-blue-600" />,
      title: "Unlimited Applicant Access",
      desc: "See every profile — not just the first 20. Filter, shortlist, and message instantly.",
    },
    {
      icon: <FaUniversity className="text-green-600" />,
      title: "Smart College Targeting",
      desc: "Your job appears only to students at selected colleges. University admins get notified to boost visibility.",
    },
    {
      icon: <FaChartLine className="text-purple-600" />,
      title: "Recruiter Analytics",
      desc: "Track views, applications, and manage them easily with detailed insights. Optimize your next post.",
    },
    {
      icon: <FaLock className="text-red-600" />,
      title: "Secure & Compliant",
      desc: "GDPR-ready. 99.9% uptime. Your data is always protected.",
    },
  ];

  const faqs = [
    {
      q: "Can I post for free forever?",
      a: "Yes! The Free plan never expires. You’ll just see only the first 20 applicants per job. Only 1 free job post allowed",
    },
    {
      q: "When do I pay for College Targeting?",
      a: "Only when you publish a college-specific job. Drafts are free.",
    },
    {
      q: "Do universities see my job?",
      a: "Yes! If you select their college, their admin dashboard shows your post for campus promotion.",
    },
  ];

  return (
    <MainLayout
      heading="Simple, Transparent Pricing"
      subheading="No setup fees. Cancel anytime. 18% GST applied separately."
      hideMobileIllustration={true}
    >
      <div className="bg-white">
        {/* Hero */}
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 md:text-4xl">
              Hire Students Faster — Without the Guesswork
            </h1>
            <p className="max-w-2xl mx-auto mt-4 text-lg text-gray-600">
              Post unlimited jobs. Target top colleges per campaign. Pay for
              what you need.
            </p>
            <div className="flex flex-col justify-center gap-4 mt-8 sm:flex-row">
              <button
                onClick={handlePostFreeJob}
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-blue-600 bg-white border border-blue-600 rounded-md shadow-sm hover:bg-blue-50"
              >
                🆓 Post Job
              </button>
              <button
                onClick={() => navigate("")}
                className="inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"
              >
                📞 Talk to Sales
              </button>
            </div>
          </div>
        </div>

        {/* Billing Toggle — Global */}
        <div className="px-4 mb-12 text-center">
          <div
            className="inline-flex p-1 bg-gray-100 rounded-md shadow-sm"
            role="group"
          >
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2.5 text-sm font-medium rounded-md ${
                billingCycle === "monthly"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2.5 text-sm font-medium rounded-md ${
                billingCycle === "yearly"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-700 hover:bg-gray-200"
              }`}
            >
              Yearly <span className="ml-1 text-xs">(Save up to 16.6%)</span>
            </button>
          </div>
          <p className="max-w-3xl mx-auto mt-3 text-sm text-gray-500">
            <FaInfoCircle className="inline mr-1 text-blue-500" />
            All plans include unlimited job posts* — credits unlock priority
            listing, and analytics.
            <br />
            <span className="text-xs">
              *Job post limits apply per active/future type (see details).
            </span>
          </p>
        </div>

        {/* Plans Grid */}
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => {
              const pricing = plan[billingCycle];
              if (!pricing) return null;

              const annualSavings =
                plan.yearly && plan.monthly
                  ? plan.monthly.price * 12 - plan.yearly.price
                  : 0;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-xl border p-6 transition-all flex flex-col ${
                    plan.is_featured
                      ? "ring-2 ring-blue-500 bg-gradient-to-b from-blue-50 to-white border-blue-200"
                      : "bg-white border-gray-200 hover:shadow-md"
                  }`}
                >
                  {plan.is_featured && (
                    <div className="absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white bg-blue-600 rounded-bl-lg">
                      MOST POPULAR
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-gray-900">
                    {plan.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {plan.description}
                  </p>

                  {/* Per-Card Billing Toggle */}
                  {/* <div className="flex justify-center mt-4">
                    <div className="inline-flex rounded-md shadow-sm bg-gray-100 p-0.5 text-xs">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBillingCycle("monthly");
                        }}
                        className={`px-2.5 py-1 rounded ${
                          billingCycle === "monthly" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"
                        }`}
                      >
                        Mo
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setBillingCycle("yearly");
                        }}
                        className={`px-2.5 py-1 rounded ${
                          billingCycle === "yearly" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"
                        }`}
                      >
                        Yr
                      </button>
                    </div>
                  </div> */}

                  {/* Price */}
                  <div className="mt-4">
                    <span className="text-3xl font-extrabold text-gray-900">
                      ₹{pricing.price.toLocaleString()}
                    </span>
                    <span className="ml-1 text-gray-600">
                      /{billingCycle === "yearly" ? "yr" : "mo"}
                    </span>
                    {billingCycle === "yearly" && plan.yearly?.savings && (
                      <div className="mt-1">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                          Save ₹{annualSavings.toLocaleString()} (
                          {plan.yearly.savings}%)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Job Limits */}
                  <div className="mt-3 text-sm">
                    <div className="flex items-center text-gray-700">
                      <span className="font-medium">
                        {plan?.features?.job_post_limits?.active || "Unlimited"}{" "}
                        active
                      </span>
                      <span className="mx-1 text-gray-400">•</span>
                      <span>
                        {plan?.features?.job_post_limits?.future || "Unlimited"}{" "}
                        future
                      </span>
                    </div>
                  </div>

                  {/* Credits */}
                  <div className="mt-3">
                    <div className="flex items-center">
                      <FaBolt className="flex-shrink-0 mr-2 text-yellow-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {pricing.credits} credits/
                        {billingCycle === "yearly" ? "yr" : "mo"}
                      </span>
                    </div>
                    {/* <p className="mt-1 text-xs text-gray-500">
                      Use for: college targeting (20/college), analytics, priority boosts.
                    </p> */}

                    <p className="mt-1 text-xs text-gray-500">
                      Use for: analytics, priority boosts.
                    </p>
                  </div>

                  {/* CTA */}
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    className={`w-full py-3 px-4 rounded-md font-medium mt-auto ${
                      plan.is_featured
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-800 hover:bg-gray-900 text-white"
                    }`}
                  >
                    Get Started
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Comparison Table Toggle */}
        <div className="px-4 mx-auto mt-12 max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <button
              onClick={() => setShowComparison(!showComparison)}
              className="inline-flex items-center font-medium text-blue-600 hover:text-blue-800"
            >
              {showComparison ? "Hide Comparison" : "Compare All Plans"}
              {showComparison ? (
                <FaChevronUp className="ml-1" />
              ) : (
                <FaChevronDown className="ml-1" />
              )}
            </button>
          </div>

          {showComparison && (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                    >
                      Feature
                    </th>
                    {plans.map((plan) => (
                      <th
                        key={plan.id}
                        scope="col"
                        className="px-6 py-3 text-xs font-medium tracking-wider text-center text-gray-500 uppercase"
                      >
                        {plan.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {featureRows.map((row, idx) => (
                    <tr key={idx} className={row.bold ? "bg-gray-50" : ""}>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm ${
                          row.bold ? "font-medium" : "text-gray-500"
                        }`}
                      >
                        {row.label}
                        {row.info && (
                          <div className="mt-1 text-xs text-gray-400">
                            {row.info}
                          </div>
                        )}
                      </td>
                      {plans.map((plan) => (
                        <td
                          key={`${plan.id}-${idx}`}
                          className="px-6 py-4 text-sm text-center whitespace-nowrap"
                        >
                          <div className={row.color || ""}>
                            {typeof row.render === "function"
                              ? row.render(plan)
                              : row.render}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* College Targeting Section — Per Post Only */}
        {/* <div className="py-12 mt-20 bg-gray-50">
          <div className="max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 text-blue-600 bg-blue-100 rounded-full">
                <FaUniversity className="text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                🎯 Target Specific Colleges — Per Job
              </h2>
              <p className="mt-2 text-gray-600">
                Want to reach students at select colleges? Pay per job — no subscription needed.
              </p>
            </div>

            <div className="p-6 bg-white shadow rounded-xl">
              <h3 className="text-lg font-semibold text-center text-gray-900">
                How many colleges do you want to target?
              </h3>

              <div className="flex justify-center mt-4 space-x-2">
                {[5, 10, 15, 20].map(n => (
                  <button
                    key={n}
                    onClick={() => setCollegeCount(n)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      collegeCount === n 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>

              <input
                type="range"
                min="1"
                max="30"
                value={collegeCount}
                onChange={(e) => setCollegeCount(Number(e.target.value))}
                className="w-full h-2 mt-4 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                aria-label="Number of colleges"
              />
              <div className="flex justify-between mt-1 text-sm text-gray-600">
                <span>1</span>
                <span>{collegeCount} colleges</span>
                <span>30+</span>
              </div>

              {pricingResult && (
                <div className="p-5 mt-6 border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-800">
                      ₹{totalAmount.toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm text-blue-700">
                      ₹{pricingResult.baseAmount.toLocaleString()} + ₹{pricingResult.gstAmount.toLocaleString()} GST
                    </p>
                    <p className="mt-2 text-xs text-gray-600">
                      Just ₹{perCollege.toLocaleString()} per college
                    </p>
                    {savings > 0 && (
                      <div className="inline-flex items-center px-3 py-1 mt-2 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                        <FaCheck className="mr-1" /> Save ₹{savings.toLocaleString()} vs. list price
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 text-center">
                <button
                  onClick={handlePostTargetedJob}
                  className="inline-flex items-center px-6 py-3 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Post Targeted Job
                </button>
                <p className="mt-3 text-sm text-gray-600">
                  {tier.label === "Best Value" 
                    ? "🔥 Best value for campus drives" 
                    : collegeCount < 10 
                    ? "💡 Tip: 10 colleges = flat ₹8,000 (best value)" 
                    : ""}
                </p>
              </div>
            </div>

            <div className="mt-6 text-sm text-center text-gray-600">
              {<p>
                🔹 <strong>Subscribers</strong>: Use credits from your plan (1 college = 20 credits).  
                <br />
                🔹 <strong>Non-subscribers</strong>: Pay per job (as above).  
                <br />
                🔹 Prices include 18% GST. Data collection for yearly college plans is ongoing.
              </p>}
            </div>
          </div>
        </div> */}

        {/* ======== CREDIT PACKS SECTION (NEW) ======== */}
        {!creditLoading && creditPacks.length > 0 && (
          <div className="px-4 py-12 mx-auto mt-16 max-w-7xl sm:px-6 lg:px-8 bg-gray-50">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 mb-4 text-blue-600 bg-blue-100 rounded-full">
                <FaUniversity className="text-2xl" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                🎯 Target Specific Colleges
              </h2>
              <p className="max-w-2xl mx-auto mt-2 text-gray-600">
                Need credits to post jobs at selected colleges? Buy packs
                anytime — no subscription required.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 mt-10 md:grid-cols-2 lg:grid-cols-4">
              {creditPacks.map((pack) => (
                <div
                  key={`credit-${pack.id}`}
                  className="p-6 transition bg-white border border-gray-200 shadow-sm rounded-xl hover:shadow-md"
                >
                  <div className="text-center">
                    <div className="mb-2 text-2xl font-bold text-blue-600">
                      {pack.credits}
                    </div>
                    <div className="mb-3 text-sm text-gray-500">Colleges</div>
                    <div className="mb-1 text-lg font-semibold text-gray-900">
                      ₹{pack.price.toLocaleString()}
                    </div>
                    <div className="mb-3 text-sm text-gray-500">
                      + ₹{(pack.price * 0.18).toFixed(0)} GST
                    </div>
                    <div className="mb-4 text-xs text-gray-400">
                      Valid for {pack.expiry_days} days
                    </div>
                    <button
                      disabled={isCreditProcessing}
                      onClick={() => buyCredits(pack)}
                      className={`w-full py-2 px-4 rounded-lg font-medium ${
                        isCreditProcessing
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {isCreditProcessing ? (
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
                      ) : (
                        "Buy Credits"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-sm text-center text-gray-600">
              <p>
                💡 <strong>Credits roll over</strong> and never expire as long
                as your account is active. Subscribers get monthly credits — buy
                extra for campus drives!
              </p>
            </div>
          </div>
        )}

        {/* Trust Badges */}
        {/* <div className="max-w-6xl px-4 py-12 mx-auto sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            {[
              { label: "500+", desc: "Colleges" },
              { label: "24h", desc: "Avg. to 50+ applicants" },
              { label: "4.9/5", desc: "Recruiter satisfaction" },
              { label: "SSL", desc: "Secure & GDPR-ready" },
            ].map((item, i) => (
              <div key={i} className="p-4">
                <div className="text-2xl font-bold text-gray-900">{item.label}</div>
                <div className="text-sm text-gray-500">{item.desc}</div>
              </div>
            ))}
          </div>
        </div> */}

        {/* Feature Highlights */}
        <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900">
            Why Recruiters Love Us
          </h2>
          <div className="grid grid-cols-1 gap-8 mt-12 sm:grid-cols-2 lg:grid-cols-4">
            {featureHighlights.map((feature, idx) => (
              <div key={idx} className="text-center">
                <div className="flex justify-center mb-4 text-3xl">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-3xl px-4 mx-auto text-center sm:px-6 lg:px-8">
            <p className="text-lg italic text-gray-700">
              “We hired 12 interns from IIT Delhi in 2 weeks using College
              Targeting. Worth every rupee!”
            </p>
            <p className="mt-4 font-medium text-gray-900">
              — Priya M., Talent Lead @ FinTech Startup
            </p>
            <div className="flex flex-wrap justify-center gap-8 mt-8 opacity-70">
              <span className="text-sm">
                Trusted by recruiters at IIT Startup • TechCorp • EduHire
              </span>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl px-4 py-16 mx-auto sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">{faq.q}</h3>
                <p className="mt-2 text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="py-12 text-white bg-gray-900">
          <div className="max-w-4xl px-4 mx-auto text-center">
            <h3 className="text-2xl font-bold">Ready to Hire Smarter?</h3>
            <p className="mt-3 text-gray-300">
              Join 5,000+ recruiters who trust us to find top talent.
            </p>
            <div className="flex flex-col justify-center gap-4 mt-6 sm:flex-row">
              <button
                onClick={handlePostFreeJob}
                className="inline-flex items-center justify-center px-6 py-3 font-medium text-gray-900 bg-white rounded-md hover:bg-gray-100"
              >
                <FaRocket className="mr-2" /> Post Job Now
              </button>
              <button
                onClick={() => navigate("")}
                className="inline-flex items-center justify-center px-6 py-3 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                📞 Talk to Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SubscriptionPricingPage;
