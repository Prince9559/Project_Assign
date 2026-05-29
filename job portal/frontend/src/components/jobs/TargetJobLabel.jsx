import React from "react";
import { FiTarget } from "react-icons/fi";

export default function TargetJobLabel({
  jobId,
  title = null,          // optional: job title if you have it
  className = "",
}) {
  return (
    <div
      className={[
        "inline-flex items-center gap-2",
        "px-3 py-1.5 rounded-full",
        "bg-[#9BC87C]/12 border border-[#9BC87C]/35",
        "text-[#1e1e2d]",
        className,
      ].join(" ")}
    >
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white border border-gray-200">
        <FiTarget className="text-[#9BC87C]" size={14} />
      </span>

      <div className="leading-tight">
        <div className="text-[10px] font-extrabold tracking-wider uppercase text-gray-500">
          Target Job
        </div>
        <div className="text-sm font-extrabold">
          {title ? title : `${jobId}`}
        </div>
      </div>
    </div>
  );
}