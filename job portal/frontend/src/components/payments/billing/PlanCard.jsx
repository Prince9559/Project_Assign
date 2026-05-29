// src/components/billing/PlanCard.jsx
import React from "react";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { StatusBadge } from "./StatusBadge";
import GreenPrimaryButton from "../../jobs/GreenPrimaryButton";
const PlanCard = ({ plan, onAction }) => {
  if (!plan) {
    return (
      <div className="p-6 text-center bg-white border border-gray-300 border-dashed rounded-xl">
        <FaExclamationCircle className="w-12 h-12 mx-auto text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">
          No Active Plan
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Choose a plan to start posting jobs.
        </p>
        {/* <button
          onClick={() => onAction("upgrade")}
          className="inline-flex items-center px-4 py-2 mt-4 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
        >
          Browse Plans
        </button> */}
        <GreenPrimaryButton
  onClick={() => onAction("upgrade")}
  className="inline-flex items-center mt-4"
>
  Browse Plans
</GreenPrimaryButton>
      </div>
    );
  }

  const isYearly = plan.billing_cycle === "yearly";
  const nextBilling = plan.next_billing_date
    ? new Date(plan.next_billing_date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  const startDate = plan.start_date
    ? new Date(plan.start_date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <div className="overflow-hidden bg-white shadow-sm ring-1 ring-gray-200 rounded-xl">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center text-xl font-bold text-gray-900">
              <span className="mr-2">🟢</span>
              {plan.plan_name} ({isYearly ? "Yearly" : "Monthly"})
            </h2>
            {/* <div className="flex items-center mt-1 space-x-3">
              <StatusBadge status={plan.status} />
              {plan.auto_renew && (
                <span className="inline-flex items-center text-sm text-gray-600">
                  <FaCheckCircle className="w-4 h-4 mr-1 text-green-500" />
                  Auto-renew: ON
                </span>
              )}
            </div> */}

            {/* In PlanCard.jsx — replace status section with this */}
<div className="flex items-center mt-1 space-x-3">
  <StatusBadge status={plan.status} />
  
  {/* Show effective end date for 'cancelling' */}
  {plan.status === 'cancelling' && plan.cancel_at && (
    <span className="text-sm font-medium text-yellow-700">
      Ends: {new Date(plan.cancel_at).toLocaleDateString('en-IN')}
    </span>
  )}

  {/*  Show pause end date */}
  {plan.status === 'paused' && plan.current_period_end && (
    <span className="text-sm font-medium text-yellow-700">
      Paused until: {new Date(plan.current_period_end).toLocaleDateString('en-IN')}
    </span>
  )}

  {plan.auto_renew && plan.status === 'active' && (
    <span className="inline-flex items-center text-sm text-gray-600">
      <FaCheckCircle className="w-4 h-4 mr-1 text-green-500" />
      Auto-renew: ON
    </span>
  )}
</div>
          </div>

          {/* Replace the button section with this */}
          <div className="flex space-x-2">
            {plan.can_upgrade && (
              <button
                onClick={() => onAction("upgrade")}
                className="px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200"
              >
                Upgrade
              </button>
            )}

            {/* Replace the 'cancelling' banner with this */}
{plan.status === 'cancelling' && plan.cancel_at && (
  <div className="p-3 mt-3 border-l-4 border-yellow-400 rounded bg-yellow-50">
    <div className="flex">
      <FaExclamationCircle className="mt-0.5 mr-2 text-yellow-600 flex-shrink-0" />
      <div className="text-sm text-yellow-800">
        <span className="font-medium">Scheduled for cancellation</span> on{' '}
        <span className="font-semibold">
          {new Date(plan.cancel_at).toLocaleDateString('en-IN')}
        </span>.
        {' '}You can <button 
          onClick={() => onAction("resume")} 
          className="ml-1 font-medium text-blue-600 underline hover:text-blue-800"
        >
          resume
        </button> anytime before then.
      </div>
    </div>
  </div>
)}

            {/*  Show Pause OR Resume based on status */}
            {plan.status === "active" && plan.can_pause && (
              <button
                onClick={() => onAction("pause")}
                className="px-3 py-1.5 text-sm font-medium text-yellow-700 bg-yellow-100 rounded-md hover:bg-yellow-200"
              >
                Pause
              </button>
            )}

            {plan.status === "paused" && (
              <button
                onClick={() => onAction("resume")}
                className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200"
              >
                Resume
              </button>
            )}

            {/* Show Cancel only if not already cancelled/halted */}
            {["active", "paused"].includes(plan.status) && plan.can_cancel && (
              <button
                onClick={() => onAction("cancel")}
                className="px-3 py-1.5 text-sm font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Amount</dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              ₹{plan.amount_per_cycle.toLocaleString("en-IN")}/
              {isYearly ? "year" : "month"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Next Billing</dt>
            <dd className="mt-1 text-lg font-medium text-gray-900">
              {nextBilling}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Started</dt>
            <dd className="mt-1 text-lg font-medium text-gray-900">
              {startDate}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Credits</dt>
            <dd className="mt-1 text-lg font-semibold text-gray-900">
              {plan.remaining_credits} / {plan.total_credits}
            </dd>
            <div className="h-2 mt-1 bg-gray-200 rounded-full">
              <div
                className="h-2 bg-blue-600 rounded-full"
                style={{
                  width: `${
                    (plan.remaining_credits / plan.total_credits) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="pt-5 mt-6 border-t border-gray-200">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v8a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanCard;
