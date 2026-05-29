
import React from "react";
import { FaGraduationCap } from "react-icons/fa";
import Badge from "../ui/Badge";

export default function ForYourCollegeBadge({ className = "", text = "For Your College" }) {
  return (
    <Badge
      color="bg-[#9bc87c] text-[#1e1e2d] border-transparent"
      className={`text-[11px] px-3 py-1 rounded-full inline-flex items-center gap-1 ${className}`}
    >
      <FaGraduationCap size={12} />
      {text}
    </Badge>
  );
}