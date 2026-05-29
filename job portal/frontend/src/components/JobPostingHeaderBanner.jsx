import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const BANNER_STYLES = {
  info: "bg-blue-50 border-l-4 border-blue-500",
  warning: "bg-yellow-50 border-l-4 border-yellow-500",
  success: "bg-green-50 border-l-4 border-green-500",
  error: "bg-red-50 border-l-4 border-red-500",
  promo: "bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-600", // 🎯 NEW: promo style
};

// 🔹 Helper: Format INR with ₹ symbol & comma
const formatINR = (num) => `₹${Math.round(num).toLocaleString("en-IN")}`;

const JobPostingHeaderBanner = ({
  post_type = "active",
  opportunity_type = "Internship",
  onEligibilityChange = () => { },
  className = "",
}) => {
  const { token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch preview data
  const fetchPreview = useCallback(async () => {
    if (!token || post_type === "college") return;

    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BASE_URL}/jobs/preview`, {
        params: { post_type, opportunity_type },
        headers: { Authorization: `Bearer ${token}` },
      });

      setPreviewData(res.data);
      onEligibilityChange(res.data.eligibility);
    } catch (err) {
      console.error("Failed to load plan status:", err);
      setError("Unable to load plan info. Please refresh.");
      onEligibilityChange({ is_eligible: false, reason: "fetch_failed" });
    } finally {
      setLoading(false);
    }
  }, [post_type, opportunity_type, token, onEligibilityChange]);

  useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  // 🔹 Helper: Render price display — with promo strikethrough
  const renderPriceDisplay = (eligibility) => {
    const {
      is_promo_active,
      original_one_time_price, // pre-GST
      one_time_price, // post-GST (0 during promo)
      promo_reason,
    } = eligibility;

    if (!eligibility.can_pay_one_time) return null;

    // Promo: Show strikethrough + Free/₹0
    if (is_promo_active && original_one_time_price) {
      const originalWithGST = original_one_time_price * 1.18; // base → total
      return (
        <div className="text-right">
          <div className="flex flex-wrap items-center justify-end gap-2">
            {/* Strikethrough old price */}
            <span className="text-sm font-medium text-gray-500 line-through">
              {formatINR(originalWithGST)}
            </span>
            {/* Free badge */}
            <span className="px-3 py-1 text-sm font-bold text-white bg-green-600 rounded-full">
              Free
            </span>
          </div>
          {/* Promo subtitle */}
          <p className="mt-1 text-xs font-medium text-green-700">
            {promo_reason || "Free for 1 year"}
          </p>
        </div>
      );
    }

    // Regular: Show normal price
    return (
      <span className="font-bold text-gray-800">
        {formatINR(one_time_price)}
      </span>
    );
  };

  const subscription = previewData?.subscription;
  const eligibility = previewData?.eligibility || {};
  const isExpiringSoon = subscription?.current_period_end
    ? new Date(subscription.current_period_end) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    : false;

  const handleUpgrade = () => {
    const params = new URLSearchParams();
    if (eligibility.upgrade_suggestion) {
      params.set("recommended", eligibility.upgrade_suggestion);
    }
    navigate(`/pricing?${params.toString()}`);
  };

  const handleOneTime = () => {
    if (!eligibility.can_pay_one_time) return;
    // Let parent handle submission (e.g., auto-submit or show modal)
    // You can emit an event or navigate if needed
  };

  // 🎓 College-specific handling (unchanged)
  if (post_type === "college") {
    const [collegeCredits, setCollegeCredits] = useState(null);

    useEffect(() => {
      if (!token) return;
      const fetchCollegeCredits = async () => {
        try {
          const res = await axios.get(`${BASE_URL}/subscriptions/credits/balance`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data.success) {
            setCollegeCredits(res.data);
            const hasCredits = res.data.total_credits > 0;
            onEligibilityChange({
              is_eligible: hasCredits,
              reason: hasCredits ? "subscription" : "no_credits",
              can_upgrade: true,
              can_pay_one_time: true,
              one_time_price: null,
              upgrade_suggestion: "college_credits",
            });
          } else {
            throw new Error(res.data.message);
          }
        } catch (err) {
          console.error("Failed to load college credits:", err);
          onEligibilityChange({
            is_eligible: false,
            reason: "fetch_failed",
            can_upgrade: true,
            can_pay_one_time: true,
            one_time_price: null,
            upgrade_suggestion: "college_credits",
          });
          setError("Unable to load college credits. Try again.");
        } finally {
          setLoading(false);
        }
      };
      fetchCollegeCredits();
    }, [token, onEligibilityChange]);

    if (loading) {
      return (
        <div className={`${BANNER_STYLES.info} p-4 mb-6 rounded ${className}`}>
          <p className="text-blue-700">Loading college credits...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className={`${BANNER_STYLES.error} p-4 mb-6 rounded ${className}`}>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              (async () => {
                try {
                  const res = await axios.get(`${BASE_URL}/subscriptions/credits/balance`, {
                    headers: { Authorization: `Bearer ${token}` },
                  });
                  if (res.data.success) setCollegeCredits(res.data);
                } catch { }
                setLoading(false);
              })();
            }}
            className="mt-2 text-sm text-red-600 underline"
          >
            Try again
          </button>
        </div>
      );
    }

    const total = collegeCredits?.total_credits || 0;
    const hasCredits = collegeCredits?.has_credits && total > 0;

    return (
      <div className={`${hasCredits ? BANNER_STYLES.success : BANNER_STYLES.warning} p-4 mb-6 rounded ${className}`}>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              <span className="text-lg">{hasCredits ? "✅" : "⚠️"}</span>
              <h3 className="ml-2 font-medium text-gray-800">
                🎓 College Credits • {total} credit{total !== 1 ? "s" : ""}
              </h3>
            </div>
            {!hasCredits && (
              <p className="mt-1 text-sm text-yellow-700">
                No active credits — you can still post via one-time payment.
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={handleUpgrade}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded hover:bg-gray-900 whitespace-nowrap"
            >
              {hasCredits ? "Buy More Credits" : "Get College Credits"}
            </button>

            {eligibility.can_pay_one_time && (
              <button
                onClick={handleOneTime}
                className="px-4 py-2 text-sm font-medium text-blue-800 border border-blue-600 rounded bg-blue-50 hover:bg-blue-100 whitespace-nowrap"
              >
                Post Now
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className={`${BANNER_STYLES.info} p-4 mb-6 rounded ${className}`}>
        <p className="text-blue-700">Loading plan details...</p>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className={`${BANNER_STYLES.error} p-4 mb-6 rounded ${className}`}>
        <p className="text-red-700">{error}</p>
        <button
          onClick={fetchPreview}
          className="mt-2 text-sm text-red-600 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  // 🔹 PROMO ACTIVE? → Use special banner style!
  const isPromoBanner = eligibility.is_promo_active;

  // No subscription or not eligible
  if (!subscription || !eligibility.is_eligible) {
    return (
      <div className={`${isPromoBanner ? BANNER_STYLES.promo : BANNER_STYLES.warning} p-4 mb-6 rounded ${className}`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">
                {isPromoBanner ? "🎉" : "🔑"}
              </span>
              <h3 className="font-semibold text-gray-800">
                {isPromoBanner
                  ? "🚀 Future Job Posting – Free for AI Training!"
                  : "🔑 Subscription Required"}
              </h3>
            </div>
            <p className={`mt-1 text-sm ${isPromoBanner ? "text-green-700" : "text-yellow-700"}`}>
              {isPromoBanner
                ? "Help us build smarter AI — your future job post is free for 1 year. It will remain inactive until you activate it."
                : "Post jobs for free using credits — or pay one-time."
              }
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleUpgrade}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded hover:bg-gray-900 whitespace-nowrap"
            >
              {isPromoBanner ? "See All Plans" : "Buy Plan"}
            </button>

            {eligibility.can_pay_one_time && (
              <button
                onClick={handleOneTime}
                className={`px-4 py-2 text-sm font-bold rounded whitespace-nowrap transition ${isPromoBanner
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "border border-gray-800 text-gray-800 hover:bg-gray-50"
                  }`}
              >
                {isPromoBanner ? (
                  <span className="flex items-center gap-1">
                    🎁 Post Free
                  </span>
                ) : (
                  <span>Post {renderPriceDisplay(eligibility)}</span>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Has subscription
  const planName = subscription.plan_name || "Pro Plan";
  const credits = subscription.remaining_credits;
  const expiry = new Date(subscription.current_period_end).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const isMismatch =
    eligibility.reason === "plan_mismatch" ||
    (subscription.plan_type !== "both" && subscription.plan_type !== post_type);

  const bannerStyle = isPromoBanner
    ? BANNER_STYLES.promo
    : isExpiringSoon || isMismatch
      ? BANNER_STYLES.warning
      : BANNER_STYLES.success;

  return (
    <div className={`${bannerStyle} p-4 mb-6 rounded ${className}`}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        {/* Left: Plan Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">
              {isPromoBanner
                ? "🎉"
                : isExpiringSoon
                  ? "⚠️"
                  : isMismatch
                    ? "❗"
                    : "✅"}
            </span>
            <h3 className="font-semibold">
              {isPromoBanner ? "🎁 Free Future Job (AI Training)" : `${planName} • ${credits} credit${credits !== 1 ? "s" : ""} left`}
            </h3>
          </div>
          {!isPromoBanner && <p className="mt-1 text-sm">Expires on {expiry}</p>}

          {isPromoBanner && (
            <div className="p-3 mt-2 bg-white border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                This job will be <strong>inactive</strong> until you choose to activate it.
                <br />
                🔒 All data is anonymized for AI training to improve job matching.
              </p>
            </div>
          )}

          {isMismatch && !isPromoBanner && (
            <div className="p-2 mt-2 text-sm text-yellow-800 bg-yellow-100 rounded">
              Your plan only allows <strong>{subscription.plan_type}</strong> jobs.
              <br />
              <button
                onClick={handleUpgrade}
                className="inline-block mt-1 font-medium underline"
              >
                Upgrade to post {post_type} jobs
              </button>
            </div>
          )}

          {isExpiringSoon && !isMismatch && !isPromoBanner && (
            <div className="p-2 mt-2 text-sm text-yellow-800 bg-yellow-100 rounded">
              ⏳ Your plan expires in less than 7 days.{" "}
              <button onClick={handleUpgrade} className="font-medium underline">
                Renew now
              </button>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col gap-2 sm:flex-row">
          {eligibility.can_upgrade && (
            <button
              onClick={handleUpgrade}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded hover:bg-gray-900 whitespace-nowrap"
            >
              {isExpiringSoon ? "Renew Plan" : "Change Plan"}
            </button>
          )}
          {eligibility.can_pay_one_time && (
            <button
              onClick={handleOneTime}
              className={`px-4 py-2 text-sm font-bold rounded whitespace-nowrap transition ${isPromoBanner
                  ? "bg-green-600 text-white hover:bg-green-700 shadow-md"
                  : "border border-gray-800 text-gray-800 hover:bg-gray-50"
                }`}
            >
              {isPromoBanner ? (
                <span className="flex items-center gap-1">
                   Post Free
                </span>
              ) : (
                <span>Post {renderPriceDisplay(eligibility)}</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobPostingHeaderBanner;
