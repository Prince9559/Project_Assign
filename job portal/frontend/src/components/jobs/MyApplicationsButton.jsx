import React from "react";
import { Link } from "react-router-dom";
import { FaUserTie } from "react-icons/fa";

export default function MyApplicationsButton({
  to = "/student-applications",
  children = "My Applications",
  className = "",
}) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3
      bg-[#1DB32F] hover:bg-[#00C950] text-white font-bold text-sm sm:text-base
      rounded-xl shadow-sm hover:shadow-md transition-all
      focus:outline-none focus:ring-2 focus:ring-[#9BC87C] focus:ring-offset-2 ${className}`}
      aria-label="View your job applications"
    >
      <FaUserTie className="text-white" />
      <span>{children}</span>
    </Link>
  );
}