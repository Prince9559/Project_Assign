// src/pages/University/CreditsPricingPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useRazorpay from "../../../hooks/useRazorpay";
import {
  getCreditPackages,
  createCreditOrder,
  getCreditStatus,
} from "../../../api/university/universityPayment";

import MainLayout from "../../../components/layout/MainLayout";
import GreenPrimaryButton from "../../../components/jobs/GreenPrimaryButton";
export default function CreditsPricingPage() {
  const [packages, setPackages] = useState([]);
  const [creditStatus, setCreditStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [buyingPackageId, setBuyingPackageId] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const { isLoaded, error: rzpError, openRazorpay } = useRazorpay();

  // Fetch data on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [pkgRes, statusRes] = await Promise.all([
          getCreditPackages(),
          getCreditStatus(),
        ]);
        setPackages(pkgRes.data);
        setCreditStatus(statusRes.data);
      } catch (err) {
        console.error("Failed to load data", err);
        alert("Failed to load credit packages. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Handle Buy
  const handleBuy = async (pkg) => {
    if (!isLoaded) {
      alert("Payment system is loading… please wait a moment.");
      return;
    }
    if (buyingPackageId) return;

    setBuyingPackageId(pkg.package_id);

    try {
      // 1. Create order
      const orderRes = await createCreditOrder(pkg.package_id);
      const order = orderRes.data;

      // 2. Open Razorpay
      const options = {
        key: import.meta.env.VITE_RAZORPAY_API_KEY || "rzp_test_xxxxxxxxxxxx",
        amount: Math.round(order.amount_inr * 100), // paise
        currency: "INR",
        name: "CampusHire",
        description: `Buy ${pkg.credits} credits`,
        order_id: order.razorpay_order_id,
        handler: function (response) {
          navigate("/university/credits/success", {
            state: {
              order_id: order.order_id,
              credits: pkg.credits,
              amount: order.amount_inr,
              expiry_days: pkg.validity_days,
            },
          });
        },
        prefill: {},
        theme: { color: "#2563eb" },
        modal: {
          ondismiss: () => {
            alert("Payment cancelled. No credits were added.");
            setBuyingPackageId(null);
          },
        },
      };

      openRazorpay(options);

    } catch (err) {
      console.error("Order creation failed:", err);
      const msg = err.response?.data?.error || "Failed to start payment. Please try again.";
      alert("⚠️ " + msg);
      setBuyingPackageId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500">Loading credit packages...</div>
      </div>
    );
  }

  if (rzpError) {
    return (
      <div className="max-w-3xl p-6 mx-auto">
        <div className="p-4 text-red-700 rounded-lg bg-red-50">
          {rzpError}
        </div>
      </div>
    );
  }

  // Success banner flag (if redirected back after success)
  const showSuccessBanner = location.state?.justPurchased;

  return (
    <MainLayout>
    <div className="min-h-screen px-4 py-8 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Success Banner */}
        {showSuccessBanner && (
          <div className="p-4 mb-6 text-center text-green-700 border border-green-200 rounded-lg bg-green-50">
            ✅ Credits added successfully! You can now unlock recruiter contacts.
          </div>
        )}

        {/* Header
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Buy Contact Credits</h1>
          <p className="mt-2 text-gray-600">
            Unlock recruiter contact details to invite them to campus drives.
          </p>
        </div> */}
        <div className="mb-8 text-center">
  <h1 className="text-3xl font-bold text-gray-900">
    Buy Contact <span className="text-[#9bc87c]">Credits</span>
  </h1>
  <p className="mt-2 text-gray-600">
    Unlock recruiter contact details to invite them to campus drives.
  </p>
</div>

        {/* Expiry Warning (inline) */}
        {creditStatus?.batch_expiry_warning && (
          <div className="p-4 mb-6 text-orange-700 border-l-4 border-orange-500 rounded bg-orange-50">
            <div className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span><strong>Expiring soon!</strong> {creditStatus.batch_expiry_warning.message}</span>
            </div>
          </div>
        )}

        {/* Credit Balance */}
        {creditStatus && (
          <div className="p-5 mb-8 text-center bg-white border rounded-lg shadow-sm">
            <span className="text-gray-700">
              Current balance:{" "}
              <span className="text-lg font-bold text-[#9bc87c]">
                {creditStatus.remaining_credits}
              </span>{" "}
              credit{creditStatus.remaining_credits !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Packages Grid — inline, no components */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => {
            const isBestValue = pkg.badge_text === "Best Value" || pkg.is_recommended;
            const pricePerCredit = (pkg.price_inr / pkg.credits).toFixed(2);
            const validityDisplay = pkg.validity_days
              ? `${pkg.validity_days} day${pkg.validity_days !== 1 ? "s" : ""}`
              : "Never";

            return (
              <div
                key={pkg.package_id}
                className={`rounded-xl border bg-white shadow-sm overflow-hidden transition-all ${
                  isBestValue ? "ring-2 ring-blue-500 border-blue-500" : "border-gray-200"
                }`}
              >
                {isBestValue && (
                  <div className="bg-blue-600 text-white text-center py-1.5 text-sm font-medium">
                    {pkg.badge_text || "Best Value"}
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
                  <p className="mt-2 text-sm text-gray-600">{pkg.description}</p>

                  <div className="mt-4">
                    <span className="text-2xl font-bold text-gray-900">
                      ₹{Math.round(pkg.price_inr).toLocaleString("en-IN")}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      ({pricePerCredit}/credit)
                    </span>
                  </div>

                  <div className="mt-2 text-sm text-gray-500">
                    {validityDisplay} validity
                  </div>

                  {/* <button
                    type="button"
                    disabled={buyingPackageId === pkg.package_id}
                    onClick={() => handleBuy(pkg)}
                    className={`mt-6 w-full py-3 px-4 rounded-lg font-medium transition ${
                      isBestValue
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-800 hover:bg-gray-900 text-white"
                    } ${
                      buyingPackageId === pkg.package_id
                        ? "opacity-75 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {buyingPackageId === pkg.package_id ? "Processing…" : "Buy Now"}
                  </button> */}
                  <GreenPrimaryButton
  type="button"
  disabled={buyingPackageId === pkg.package_id}
  onClick={() => handleBuy(pkg)}
  className={`mt-6 w-full py-3 px-4 text-base rounded-lg ${
    buyingPackageId === pkg.package_id
      ? "opacity-75 cursor-not-allowed"
      : ""
  }`}
>
  {buyingPackageId === pkg.package_id ? "Processing…" : "Buy Now"}
</GreenPrimaryButton>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-10 text-sm text-center text-gray-500">
          All prices include 18% GST. Credits expire after the validity period.
        </div>
      </div>
    </div>
    </MainLayout>
  );
}