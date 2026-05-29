import React from "react";
import { FaMapMarkerAlt } from "react-icons/fa";

export default function AddressPill({ text = "", className = "" }) {
  if (!text) return null;

  return (
    <span
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border bg-gray-100 text-gray-700 border-gray-200 ${className}`}
      title={text}
    >
      <FaMapMarkerAlt className="text-gray-500" />
      <span className="truncate max-w-[200px]">{text}</span>
    </span>
  );
}