import React from "react";

export default function ViewDetailsButton({
  onClick,
  className = "",
  children = "View Details",
  disabled = false,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "w-full px-3 py-1.5 mt-1",
        "bg-white border border-gray-200",
        "text-[#1e1e2d] rounded-md text-[11px] font-extrabold",
        "hover:bg-gray-50 hover:border-[#9bc87c]/50 transition-colors",
        "shadow-sm",
        "focus:outline-none focus:ring-2 focus:ring-[#9bc87c] focus:ring-offset-2",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}