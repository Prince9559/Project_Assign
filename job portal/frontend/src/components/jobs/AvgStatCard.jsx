import React from "react";

const tones = {
  green: {
    iconWrap: "bg-[#9BC87C]/12 text-[#9BC87C] border-[#9BC87C]/25",
    accent: "text-[#9BC87C]",
  },
  dark: {
    iconWrap: "bg-[#1e1e2d]/5 text-[#1e1e2d] border-[#1e1e2d]/10",
    accent: "text-[#1e1e2d]",
  },
  gray: {
    iconWrap: "bg-gray-100 text-gray-600 border-gray-200",
    accent: "text-gray-700",
  },
};

export default function AvgStatCard({
  icon,
  label,
  value,
  suffix, // e.g. "%", "months"
  tone = "green",
  className = "",
}) {
  const t = tones[tone] || tones.green;

  return (
    <div
      className={[
        "p-6 bg-white border border-gray-100 shadow-sm rounded-xl",
        "hover:shadow-md transition-shadow",
        className,
      ].join(" ")}
    >
      <div className="flex items-center gap-4">
        <div
          className={[
            "p-3 rounded-lg border",
            t.iconWrap,
          ].join(" ")}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-500 mb-0.5">{label}</p>

          <p className="text-2xl font-extrabold text-[#1e1e2d]">
            {value}
            {suffix ? (
              <span className="ml-1 text-base font-semibold text-gray-500">
                {suffix}
              </span>
            ) : null}
          </p>
        </div>
      </div>
    </div>
  );
}