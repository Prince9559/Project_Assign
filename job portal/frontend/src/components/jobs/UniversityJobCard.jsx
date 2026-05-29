import React from "react";
import { Link } from "react-router-dom";
import { FaMapMarkerAlt, FaGraduationCap } from "react-icons/fa";
import { Badge } from "../ui";
import { getImageUrl } from "../../../utils";

export default function JobOpportunityCard({
  job,
  to,
  lastRef = null,
  showCollegeSpecificBadge = true,
  useStudentTheme = true,
}) {
  const cardClass = useStudentTheme
    ? `relative flex flex-col gap-3 p-4 transition-all duration-300 bg-white border border-gray-100 shadow-sm cursor-pointer sm:flex-row sm:items-start sm:gap-4 lg:gap-6 rounded-xl hover:shadow-md hover:scale-[1.005]
       ${job?.is_targeted_to_user_college || job?.targeting_our_college ? "ring-2 ring-[#9bc87c]" : ""}`
    : `relative flex flex-col gap-3 p-4 transition-all duration-200 bg-white border shadow-sm cursor-pointer sm:flex-row sm:items-center sm:gap-4 lg:gap-6 rounded-xl sm:p-5 lg:p-6 hover:shadow-lg`;

  const isForCollege = job?.is_targeted_to_user_college || job?.targeting_our_college;

  return (
    <Link to={to} className="no-underline group">
      <article
        ref={lastRef}
        className={cardClass}
        tabIndex={0}
        aria-label={`Job: ${job?.jobRole} at ${job?.company_name}`}
      >
        {isForCollege && (
          <div className="absolute z-10 hidden sm:block -top-3 right-4">
            <span
              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-[#1e1e2d] bg-[#9bc87c] rounded-full shadow-sm"
              title="This job is specifically posted for students from your college."
            >
              <FaGraduationCap className="text-[#1e1e2d]" size={12} />
              For Your College
            </span>
          </div>
        )}

        {showCollegeSpecificBadge && job?.is_college_specific && !isForCollege && (
          <div className="absolute z-10 hidden sm:block -top-3 left-4">
            <Badge
              color="bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
              text="🎓 College-Specific"
              className="text-xs font-semibold border border-indigo-200 shadow"
            />
          </div>
        )}

        <div className="flex-shrink-0">
          {job?.logo_url ? (
            <img
              src={getImageUrl(job.logo_url)}
              alt={`${job?.company_name} logo`}
              className="object-contain w-12 h-12 bg-gray-100 border border-gray-200 rounded-lg sm:w-14 sm:h-14 lg:w-16 lg:h-16"
            />
          ) : (
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 border border-gray-200 rounded-lg sm:w-14 sm:h-14 lg:w-16 lg:h-16">
              <span className="text-sm font-semibold text-gray-500">
                {job?.company_name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
          <div>
            {/* <h3 className="text-base font-bold leading-tight text-gray-900 transition-colors sm:text-lg lg:text-xl group-hover:text-[#9bc87c]"> */}
            <h3 className="text-base font-bold leading-tight text-gray-900 sm:text-lg lg:text-xl">
              {job?.jobRole}
            </h3>
            <p className="text-sm font-semibold text-[#1e1e2d]">{job?.company_name}</p>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Badge color="bg-gray-100 text-gray-700 hover:bg-gray-200" className="text-xs border border-gray-200">
              <FaMapMarkerAlt className="text-xs text-gray-400" />
              <span className="truncate">{job?.company_location}</span>
            </Badge>

            {job?.audienceType && (
              <Badge color="bg-gray-100 text-gray-700 hover:bg-gray-200" className="text-xs border border-gray-200">
                {job.audienceType}
              </Badge>
            )}

            {job?.stipend_range && (
              <Badge color="bg-gray-100 text-gray-700 hover:bg-gray-200" className="text-xs border border-gray-200">
                ₹{job.stipend_range}
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-2 sm:gap-3 min-w-[120px] sm:min-w-[140px] lg:min-w-[160px]">
          {job?.hiring_status && (
            <Badge
              color={job.hiring_status === "Actively Hiring" ? "bg-[#1DB32F] text-white" : "bg-gray-500 text-white"}
              text={job.hiring_status}
              className="text-sm font-semibold border border-gray-200 shadow-sm"
            />
          )}

          {job?.posted_days_ago && (
            <Badge color="bg-gray-100 text-gray-700 hover:bg-gray-200" className="text-sm font-semibold border border-gray-200">
              {job.posted_days_ago}
            </Badge>
          )}
        </div>
      </article>
    </Link>
  );
}