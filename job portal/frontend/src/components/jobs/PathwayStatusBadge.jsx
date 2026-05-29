import React from "react";

const STYLE = {
  active: "bg-[#9BC87C]/10 text-[#1e1e2d] border-[#9BC87C]/30",
  selected: "bg-gray-100 text-[#1e1e2d] border-gray-200",
  in_progress: "bg-[#1DB32F]/10 text-[#1DB32F] border-[#1DB32F]/30",
  completed: "bg-[#1e1e2d] text-white border-[#1e1e2d]",
  outdated: "bg-gray-50 text-gray-500 border-gray-200",
};

const LABEL = {
  active: "Active",
  selected: "Selected",
  in_progress: "In Progress",
  completed: "Completed",
  outdated: "Outdated",
};

export default function PathwayStatusBadge({ status = "active", className = "" }) {
  const key = String(status || "active").toLowerCase();
  const classes = STYLE[key] || STYLE.active;
  const text = LABEL[key] || "Active";

  return (
    <span
      className={[
        "px-3 py-1 border rounded-full",
        "text-[10px] font-extrabold uppercase tracking-wider",
        classes,
        className,
      ].join(" ")}
    >
      {text}
    </span>
  );
}