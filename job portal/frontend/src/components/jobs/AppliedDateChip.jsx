import React from "react";

export default function AppliedDateChip({
  appliedDate,
  className = "",
  label = "Applied",
}) {
  if (!appliedDate) return null;

  const dateText = new Date(appliedDate).toLocaleDateString();

  return (
    <span
      className={[
        "flex items-center",
        "bg-gray-50 px-2 py-1 rounded-md border border-gray-100",
        "text-xs font-semibold text-gray-500",
        className,
      ].join(" ")}
    >
      <svg
        className="w-3.5 h-3.5 mr-1.5 text-[#1e1e2d]"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>

      <span className="text-[#1e1e2d]">{label}:</span>
      <span className="ml-1">{dateText}</span>
    </span>
  );
}