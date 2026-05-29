import React from "react";

const normalize = (s) => String(s || "").toLowerCase().trim();

export default function ApplicationStatusBadge({
  status,
  className = "",
}) {
  const s = normalize(status);

  const styles =
    s === "hired"
      ? "bg-[#1DB32F] text-white border-[#1DB32F]"
      : s === "rejected"
      ? "bg-red-50 text-red-600 border-red-100"
      : s === "interview"
      ? "bg-[#9BC87C]/15 text-[#1e1e2d] border-[#9BC87C]/35"
      : "bg-gray-100 text-[#1e1e2d] border-gray-200";

  const label = status ? String(status) : "Applied";

  return (
    <span
      className={[
        "px-3 py-1 rounded-md",
        "text-[10px] font-extrabold uppercase tracking-wider",
        "text-center w-full border",
        styles,
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}