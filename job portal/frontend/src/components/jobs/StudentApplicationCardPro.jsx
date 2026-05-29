
import React from "react";

import AppliedDateChip from "../../components/jobs/AppliedDateChip";
import OpeningsChip from "../../components/jobs/OpeningsChip";
import ApplicantsChip from "../../components/jobs/ApplicantsChip";
import ApplicationStatusBadge from "../../components/jobs/ApplicationStatusBadge";
import SkillMatchBar from "../../components/jobs/SkillMatchBar";
import ViewDetailsButton from "../../components/jobs/ViewDetailsButton";
import InterviewToggleChip from "../../components/jobs/InterviewToggleChip";
import AssignmentToggleChip from "../../components/jobs/AssignmentToggleChip";
import InterviewsPanel from "../../components/jobs/InterviewsPanel";
import AssignmentsPanel from "../../components/jobs/AssignmentsPanel";

export default function StudentApplicationCardPro({
  job,
  getImageUrl,
  onViewDetails,

  // expand state (controlled by parent)
  expandedInterviews = false,
  expandedAssignments = false,
  onToggleInterviews,
  onToggleAssignments,

  className = "",
}) {
  const companyLogoSrc = job?.company_logo
    ? getImageUrl
      ? getImageUrl(job.company_logo)
      : job.company_logo
    : null;

  const roleTitle = job?.jobRole || "Job Role Not Specified";
  const companyName = job?.company_name || "Company";

  return (
    <article
      className={[
        "p-4 sm:p-6 rounded-2xl",
        "bg-white border border-gray-100",
        "shadow-sm hover:shadow-md",
        "transition-all duration-300",
        "hover:border-[#9bc87c]/30",
        className,
      ].join(" ")}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {/* Logo */}
        <div className="flex items-center justify-center flex-shrink-0 w-16 h-16 overflow-hidden bg-gray-50 border border-gray-100 rounded-xl p-1">
          {companyLogoSrc ? (
            <img
              src={companyLogoSrc}
              alt={companyName}
              className="object-contain w-full h-full"
            />
          ) : (
            <div className="text-2xl font-extrabold text-gray-300">
              {companyName?.charAt(0) || "C"}
            </div>
          )}
        </div>

        {/* Middle */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-extrabold text-[#1e1e2d] truncate">
            {roleTitle}
          </h3>
          <p className="text-sm font-semibold text-gray-500 mt-0.5 truncate">
            {companyName}
          </p>

          {/* Chips row */}
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <AppliedDateChip appliedDate={job?.applied_date} />
            <OpeningsChip count={job?.number_of_openings} />
            <ApplicantsChip count={job?.applicantCount || 0} />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-2 mt-3">
            {job?.has_interview_invitation ? (
              <InterviewToggleChip
                count={job?.interviews?.length || 0}
                expanded={expandedInterviews}
                onClick={onToggleInterviews}
              />
            ) : null}

            {job?.has_assignment ? (
              <AssignmentToggleChip
                count={job?.assignments?.length || 0}
                expanded={expandedAssignments}
                onClick={onToggleAssignments}
              />
            ) : null}
          </div>

          {/* Panels */}
          {job?.has_interview_invitation && expandedInterviews ? (
            <InterviewsPanel interviews={job?.interviews || []} />
          ) : null}

          {job?.has_assignment && expandedAssignments ? (
            <AssignmentsPanel
              assignments={job?.assignments || []}
              upcomingAssignmentId={job?.upcoming_assignment?.id || null}
            />
          ) : null}
        </div>

        {/* Right */}
        <div className="flex flex-col items-end gap-3 w-full sm:w-[150px] mt-2 sm:mt-0">
          <ApplicationStatusBadge status={job?.status || "Applied"} />

          <SkillMatchBar percentage={job?.skill_match_percentage || 0} />

          <ViewDetailsButton
            onClick={(e) => onViewDetails?.(e, job?.job_post_id)}
          />
        </div>
      </div>
    </article>
  );
}