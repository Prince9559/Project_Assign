import React from "react";

export default function ProfileName({
  name = "TEST STUDENT",
  className = "",
  subtitle = null,
}) {
  return (
    <div className={`text-center ${className}`}>
      <h2 className="text-xl sm:text-2xl font-extrabold tracking-wide text-[#1e1e2d]">
        {name}
      </h2>
      {subtitle ? (
        <p className="mt-1 text-sm font-medium text-gray-500">{subtitle}</p>
      ) : null}
    </div>
  );
}