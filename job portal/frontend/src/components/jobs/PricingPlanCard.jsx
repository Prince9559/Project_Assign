import React from "react";
import { FaBolt } from "react-icons/fa";

export default function PricingPlanCard({ plan, billingCycle, onSubscribe }) {
  const pricing = plan?.[billingCycle];
  if (!pricing) return null;

  const annualSavings =
    plan.yearly && plan.monthly ? plan.monthly.price * 12 - plan.yearly.price : 0;

  const featured = !!plan.is_featured;

  return (
    <div
      className={`relative rounded-xl border p-6 transition-all flex flex-col ${
        featured
          ? "ring-2 bg-gradient-to-b from-[var(--brand-soft)] to-white"
          : "bg-white border-gray-200 hover:shadow-md"
      }`}
      style={
        featured
          ? {
              borderColor: "var(--brand-border)",
              boxShadow: "0 0 0 2px var(--brand)",
            }
          : undefined
      }
    >
      {featured && (
        <div className="absolute top-0 right-0 px-3 py-1 text-xs font-bold text-white bg-[var(--brand)] rounded-bl-lg">
          MOST POPULAR
        </div>
      )}

      <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
      <p className="mt-1 text-sm text-gray-600">{plan.description}</p>

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
              Save ₹{annualSavings.toLocaleString()} ({plan.yearly.savings}%)
            </span>
          </div>
        )}
      </div>

      <div className="mt-3 text-sm">
        <div className="flex items-center text-gray-700">
          <span className="font-medium">
            {plan?.features?.job_post_limits?.active || "Unlimited"} active
          </span>
          <span className="mx-1 text-gray-400">•</span>
          <span>
            {plan?.features?.job_post_limits?.future || "Unlimited"} future
          </span>
        </div>
      </div>

      <div className="mt-3 mb-3">
        <div className="flex items-center">
          <FaBolt className="flex-shrink-0 mr-2 text-yellow-500" />
          <span className="text-sm font-medium text-gray-700">
            {pricing.credits} credits/{billingCycle === "yearly" ? "yr" : "mo"}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-500">Use for: analytics, priority boosts.</p>
      </div>

      <button
        onClick={() => onSubscribe(plan.id)}
        className={`w-full py-3 px-4 rounded-md font-medium mt-auto text-white ${
          featured
            ? "bg-[var(--brand)] hover:bg-[var(--brand-hover)]"
            : "bg-gray-800 hover:bg-gray-900"
        }`}
      >
        Get Started
      </button>
    </div>
  );
}