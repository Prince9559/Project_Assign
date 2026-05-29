import React from "react";

export default function PostedDaysBadge({ text, className = "" }) {
  if (!text) return null;
  return (
    <span className={`text-[11px] bg-gray-50 text-gray-600 px-3 py-1 rounded-full border whitespace-nowrap ${className}`}>
      {text}
    </span>
  );
}