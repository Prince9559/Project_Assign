import React from "react";

export default function UserIdentityBadge({
  roleLabel = "TEST STUDENT",
  handle = "@girigon777",
  className = "",
}) {
  return (
    <div
      className={[
        "inline-flex items-center gap-2",
        "px-3 py-1.5 rounded-full",
        "bg-[#9BC87C]/15 border border-[#9BC87C]/40",
        "text-[#1e1e2d]",
        "shadow-sm",
        className,
      ].join(" ")}
    >
      <span className="text-[11px] font-extrabold tracking-wider uppercase">
        {roleLabel}
      </span>

      <span className="w-1 h-1 rounded-full bg-[#00C950]" />

      <span className="text-[12px] font-bold text-[#1e1e2d]/80">
        {handle}
      </span>
    </div>
  );
}
