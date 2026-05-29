import React from "react";

export default function OpeningsChip({
  count,
  className = "",
  label = "Openings",
}) {
  const safe =
    count === null || count === undefined || count === ""
      ? null
      : Number.isFinite(Number(count))
      ? Number(count)
      : null;

  return (
    <span
      className={[
        "flex items-center bg-gray-50 px-2 py-1 rounded-md border border-gray-100",
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
          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M12 12h.01M16 12h.01M20 12h.01"
        />
      </svg>

      <span className="text-[#1e1e2d]">{safe ?? "N/A"}</span>
      <span className="ml-1">{label}</span>
    </span>
  );
}