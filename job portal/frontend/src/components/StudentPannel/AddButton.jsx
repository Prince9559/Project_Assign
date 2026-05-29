import React from "react";

export default function GreenAddButton({
  onClick,
  disabled = false,
  children = "+ Add",
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 text-sm font-medium text-white rounded transition-colors focus:outline-none ${
        disabled
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-[#9bc87c] hover:bg-[#8ab76b]"
      } ${className}`}
    >
      {children}
    </button>
  );
}