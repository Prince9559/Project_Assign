import React from "react";
import Badge from "../ui/Badge";

export default function PreferredSkillsBadge({
  match = null, // number (0-100)
  className = "",
}) {
  if (typeof match !== "number") return null;

  const pct = Math.round(match);

  // Color tiers
  const color =
    pct >= 80
      ? "bg-[#9bc87c]/15 text-[#1e1e2d] border-[#9bc87c]/50"
      : pct >= 50
      ? "bg-yellow-50 text-yellow-800 border-yellow-200"
      : "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <div className="relative group inline-block">
      <Badge
        color={color}
        className={`text-[10px] font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1 shadow-sm ${className}`}
      >
        Preferred Skills: 🎯 {pct}%
      </Badge>

      {/* Tooltip */}
      <div className="absolute z-10 hidden px-2 py-1 text-xs text-white bg-gray-800 rounded shadow top-full mt-1 right-0 group-hover:block max-w-[220px] text-center">
        Match on preferred (nice-to-have) skills
      </div>
    </div>
  );
}