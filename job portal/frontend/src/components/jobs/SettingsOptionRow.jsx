import React from "react";
import { ChevronRight } from "lucide-react";

export default function SettingsOptionRow({
  icon,
  title,
  subtitle,
  onClick,
  showChevron = true,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 sm:p-4 rounded-xl bg-white hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 border border-transparent hover:border-[#9bc87c]/50 hover:shadow-sm min-h-[64px] md:min-h-[72px] group"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-50 border border-gray-100 group-hover:border-[#9bc87c]/30 rounded-lg flex items-center justify-center transition-colors">
          <div className="text-[#1e1e2d] flex items-center justify-center group-hover:text-[#9bc87c] transition-colors">
            {icon}
          </div>
        </div>

        <div className="flex flex-col text-left">
          <span className="text-sm font-bold text-[#1e1e2d] sm:text-base">
            {title}
          </span>

          {subtitle ? (
            <span className="text-xs font-medium text-gray-500 mt-0.5 sm:text-sm">
              {subtitle}
            </span>
          ) : null}
        </div>
      </div>

      {showChevron ? (
        <ChevronRight
          size={18}
          className="flex-shrink-0 ml-2 text-gray-400 group-hover:text-[#9bc87c] transition-colors"
        />
      ) : null}
    </button>
  );
}