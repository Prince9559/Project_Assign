import React from "react";

export default function OpportunityHubHeader({
  title = "The Opportunity Hub",
  subtitle = "Discover jobs, internships, and projects tailored to your skills and career goals.",
  rightSlot = null, // e.g. <MyApplicationsButton />
  className = "",
}) {
  return (
    <header className={`mb-5 sm:mb-6 ${className}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[#1e1e2d] sm:text-2xl lg:text-3xl">
            {title}
          </h2>
          <p className="mt-1 text-sm text-gray-500 sm:text-base">{subtitle}</p>
        </div>

        {rightSlot ? <div className="flex-shrink-0">{rightSlot}</div> : null}
      </div>
    </header>
  );
}