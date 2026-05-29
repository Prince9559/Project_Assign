import React from "react";
import { FaCheckCircle } from "react-icons/fa";
import Badge from "../ui/Badge";

export default function HiringStatusBadge({ status = "Actively Hiring", className = "" }) {
  return (
    <Badge
      color="bg-[#1DB32F] text-white border-transparent"
      className={`text-[11px] px-3 py-1 whitespace-nowrap inline-flex items-center gap-1 ${className}`}
    >
      <FaCheckCircle className="mr-1" />
      {status}
    </Badge>
  );
}