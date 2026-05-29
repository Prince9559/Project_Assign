import React from "react";

export default function SettingsHeader({
  title = "Settings and Access Panel",
  className = "",
  rightAction = null,
}) {
  return (
    <div
      className={`bg-[#9BC87C] text-[#1e1e2d] p-4 lg:p-5 flex flex-col sm:flex-row sm:items-center justify-between rounded-xl gap-4 shadow-sm ${className}`}
    >
      <div className="flex items-center flex-1 min-w-0 gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-extrabold truncate sm:text-lg md:text-xl lg:text-2xl">
            {title}
          </h1>
        </div>
      </div>

      {rightAction}
    </div>
  );
}