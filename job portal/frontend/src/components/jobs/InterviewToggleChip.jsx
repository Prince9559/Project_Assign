import React from "react";

export default function InterviewToggleChip({
  count = 0,
  expanded = false,
  onClick,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center px-3 py-1 rounded-md",
        "text-[11px] font-extrabold",
        "bg-[#9BC87C]/10 text-[#1e1e2d] border border-[#9BC87C]/30",
        "hover:bg-[#9BC87C]/20 transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-[#9BC87C] focus:ring-offset-2",
        className,
      ].join(" ")}
    >
      {count} Interview{count !== 1 ? "s" : ""}
      <svg
        className={`ml-1.5 w-3 h-3 transition-transform ${
          expanded ? "rotate-180" : ""
        }`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}