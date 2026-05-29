import React from "react";

export default function PathwayPageHeader({
  title,
  onGoDashboard,
  actionLabel = "Go To Dashboard",
  className = "",
}) {
  return (
    <div className={["mb-8", className].join(" ")}>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-[#1e1e2d] sm:text-3xl">
          {title}
        </h1>

       <button
  type="button"
  onClick={onGoDashboard}
  className="px-6 py-2.5 rounded-lg bg-[#9BC87C] text-[#1e1e2d] text-sm font-extrabold
  shadow-sm hover:brightness-95 transition
  focus:outline-none focus:ring-2 focus:ring-[#9BC87C] focus:ring-offset-2"
>
  {actionLabel}
</button>
      </div>
    </div>
  );
}