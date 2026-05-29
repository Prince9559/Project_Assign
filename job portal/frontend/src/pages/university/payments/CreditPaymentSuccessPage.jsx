// src/pages/University/CreditPaymentSuccessPage.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";

export default function CreditPaymentSuccessPage() {
  const navigate = useNavigate();
  const { state } = useLocation();

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500">Invalid access.</div>
      </div>
    );
  }

  const { credits, amount, expiry_days } = state;

  return (
    <MainLayout>
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 text-center bg-white shadow-md rounded-xl">
        <div className="inline-flex items-center justify-center w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-8 h-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          Payment Successful!
        </h1>
        <p className="mt-3 text-gray-600">
          You’ve added <span className="font-semibold">{credits}</span> credits
          for <span className="font-semibold">₹{amount}</span>.
        </p>

        {expiry_days && (
          <p className="mt-1 text-gray-500">
            Valid for {expiry_days} day{expiry_days !== 1 ? "s" : ""}.
          </p>
        )}

        <div className="mt-8 space-y-3">
          <button
            onClick={() =>
              navigate("/university/jobs", { state: { justPurchased: true } })
            }
            className="w-full px-4 py-3 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Go Unlock Contacts
          </button>

          <button
            onClick={() =>
              navigate("/university/credits/pricing", {
                state: { justPurchased: true },
              })
            }
            className="w-full px-4 py-3 font-medium text-gray-700 border border-gray-300 rounded-lg"
          >
            Buy More Credits
          </button>
        </div>
      </div>
    </div>
    </MainLayout>
  );
}
