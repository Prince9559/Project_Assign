import React from "react";
import { FaBuilding } from "react-icons/fa"; // Icon for extra polish

export default function JobTitleBlock({ title, company, className = "" }) {
  return (
    <div className={`flex flex-col ${className}`}>
      {/* Title with hover effect (uses parent's 'group' class) */}
      <h3 
        className="text-base font-extrabold text-[#1e1e2d] truncate sm:text-lg lg:text-xl transition-colors duration-200 "
        title={title} // Tooltip to show full text if truncated
      >
        {title}
      </h3>
      
      {/* Company Name with a muted color and icon */}
      {/* <div className="flex items-center mt-1 text-sm font-medium text-gray-500"> */}
      <div className="flex items-center mt-1 text-sm font-medium text-gray-700">
  
        <FaBuilding className="mr-1 text-gray-400 text-[10px] sm:text-xs" />
        <span className="truncate" title={company}>
          {company}
        </span>
      </div>
    </div>
  );
}