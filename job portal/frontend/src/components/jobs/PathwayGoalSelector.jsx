import React from "react";

export default function PathwayGoalSelector({
  label = "What’s your goal?",
  options = [],
  value,
  onChange,
  className = "",
}) {
  return (
    <div className={className}>
      <label className="block mb-3 text-sm font-extrabold text-[#1e1e2d]">
        {label}
      </label>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((opt) => {
          const selected = opt.id === value;
          const Icon = opt.icon;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange?.(opt.id)}
              className={[
                "flex items-center justify-center gap-3",
                "p-4 rounded-2xl border",
                "transition-all duration-200",
                selected
                  ? "border-[#9BC87C] bg-[#9BC87C]/10 ring-1 ring-[#9BC87C]"
                  : "border-gray-200 bg-white hover:bg-gray-50 hover:border-[#9BC87C]/40",
              ].join(" ")}
            >
              <div
                className={[
                  "w-12 h-12 rounded-2xl",
                  "flex items-center justify-center",
                  selected
                    ? "bg-[#9BC87C]/20 border border-[#9BC87C]/40"
                    : "bg-gray-50 border border-gray-100",
                ].join(" ")}
              >
                {Icon ? (
                  <Icon
                    className={[
                      "w-5 h-5",
                      selected ? "text-[#1e1e2d]" : "text-gray-400",
                    ].join(" ")}
                  />
                ) : (
                  <span className="text-lg">{opt.emoji || "🎯"}</span>
                )}
              </div>

              <div className="text-left">
                <div className="text-sm font-extrabold text-[#1e1e2d]">
                  {opt.title}
                </div>
                {opt.subtitle ? (
                  <div className="mt-0.5 text-xs font-semibold text-gray-500">
                    {opt.subtitle}
                  </div>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}