import React from "react";

export default function SkillMatchBar({
  percentage = 0,
  className = "",
  label = "Match",
}) {
  const pct = Math.min(100, Math.max(0, Number(percentage) || 0));

  const barClass =
    pct >= 70 ? "bg-[#9BC87C]" : pct >= 40 ? "bg-gray-400" : "bg-gray-300";

  return (
    <div className={["w-full", className].join(" ")}>
      <div className="flex justify-between mb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        <span>{label}</span>
        <span className="text-[#1e1e2d]">{pct}%</span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className={["h-full rounded-full transition-all duration-300", barClass].join(" ")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}