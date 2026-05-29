import React from "react";
import Badge from "../ui/Badge";

export default function MustHaveSkillsBadge({
  met = false,
  className = "",
  yesText = "Must Have Skills ✅ Yes",
  noText = "Must Have Skills ❌ No",
}) {
  const label = met ? yesText : noText;

  return (
    <Badge
      color={
        met
          ? "bg-[#9bc87c]/15 text-[#1e1e2d] border-[#9bc87c]/50"
          : "bg-red-50 text-red-700 border-red-100"
      }
      className={`text-[10px] font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1 shadow-sm ${className}`}
      title="All mandatory skills required for this job"
    >
      {label}
    </Badge>
  );
}