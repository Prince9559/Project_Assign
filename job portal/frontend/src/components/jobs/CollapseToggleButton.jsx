import React from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

export default function CollapseToggleButton({
  expanded = false,
  onClick,
  className = "",
  size = 16,
  ariaLabel,
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel || (expanded ? "Collapse section" : "Expand section")}
      onClick={onClick}
      className={[
        "group inline-flex items-center justify-center",
        "w-9 h-9 rounded-full",
        "bg-white border border-gray-200",
        "shadow-sm",
        "hover:border-[#9BC87C]/60 hover:bg-[#9BC87C]/10 hover:shadow-md",
        "transition-all duration-200",
        "active:scale-[0.97]",
        "focus:outline-none focus:ring-2 focus:ring-[#9BC87C] focus:ring-offset-2",
        className,
      ].join(" ")}
    >
      <span className="relative flex items-center justify-center">
        {expanded ? (
          <FaChevronUp
            size={size}
            className="text-[#1e1e2d] transition-transform duration-200 group-hover:-translate-y-[1px]"
          />
        ) : (
          <FaChevronDown
            size={size}
            className="text-[#1e1e2d] transition-transform duration-200 group-hover:translate-y-[1px]"
          />
        )}

        {/* subtle glow ring */}
        <span className="pointer-events-none absolute -inset-2 rounded-full opacity-0 blur-md bg-[#9BC87C]/25 transition-opacity group-hover:opacity-100" />
      </span>
    </button>
  );
}