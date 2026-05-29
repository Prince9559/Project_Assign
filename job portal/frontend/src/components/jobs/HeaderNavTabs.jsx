import React from "react";
import { NavLink } from "react-router-dom";

export default function HeaderNavTabs({ tabs = [], onNavigate }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map((t) => (
        <NavLink
          key={t.to}
          to={t.to}
          onClick={(e) => onNavigate?.(t.to, e)}
          className={({ isActive }) =>
            [
              "px-4 py-2 rounded-full text-sm font-semibold transition",
              "border",
              isActive
                ? "bg-[#1DB32F] text-white border-[#1DB32F] shadow-sm"
                : "bg-white text-[#1e1e2d] border-[#00C950]/40 hover:bg-[#9BC87C]/10",
            ].join(" ")
          }
        >
          {t.label}
        </NavLink>
      ))}
    </div>
  );
}