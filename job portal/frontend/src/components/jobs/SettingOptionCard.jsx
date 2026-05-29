import React from "react";
import { ChevronRight } from "lucide-react";

export default function SettingsOptionCard({
  icon,
  title,
  subtitle,
  onClick,
  right = null,
  showChevron = true,
  className = "",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "group w-full text-left",
        "flex items-center justify-between gap-4",
        "p-4 sm:p-5 rounded-2xl",
        "bg-white border-2 border-[#9BC87C]/40",
        "shadow-sm hover:shadow-md",
        "hover:border-[#00C950]",
        "transition-all duration-200",
        "active:scale-[0.99]",
        "focus:outline-none focus:ring-2 focus:ring-[#9BC87C] focus:ring-offset-2",
        className,
      ].join(" ")}
    >
      {/* Left */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="relative shrink-0">
          <div className="h-11 w-11 rounded-2xl bg-[#9BC87C]/15 border border-[#9BC87C]/35 flex items-center justify-center transition-colors group-hover:bg-[#9BC87C]/25 group-hover:border-[#00C950]/60">
            <div className="text-[#1e1e2d] transition-colors group-hover:text-[#1DB32F]">
              {icon}
            </div>
          </div>
          <div className="pointer-events-none absolute -inset-1 rounded-[18px] opacity-0 blur-md bg-[#9BC87C]/35 transition-opacity group-hover:opacity-100" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15px] sm:text-base font-extrabold text-[#1e1e2d]">
              {title}
            </h3>
          </div>

          {subtitle ? (
            <p className="mt-1 truncate text-xs sm:text-sm font-semibold text-gray-500">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 shrink-0">
        {right}
        {showChevron ? (
          <div className="h-9 w-9 rounded-full border border-gray-200 bg-white flex items-center justify-center transition-all group-hover:border-[#9BC87C]/60 group-hover:bg-[#9BC87C]/10">
            <ChevronRight className="h-5 w-5 text-[#9BC87C]" />
          </div>
        ) : null}
      </div>
    </button>
  );
}