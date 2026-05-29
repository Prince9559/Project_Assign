import React from "react";

export default function GreenFileUploadButton({
  htmlFor,
  loading = false,
  children = "Upload",
  className = "",
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`inline-flex items-center px-3 py-1.5 text-sm font-medium text-white rounded shadow-sm cursor-pointer focus:outline-none ${
        loading
          ? "bg-gray-400 cursor-not-allowed"
          : "bg-[#9bc87c] hover:bg-[#8ab76b]"
      } ${className}`}
    >
      {children}
    </label>
  );
}