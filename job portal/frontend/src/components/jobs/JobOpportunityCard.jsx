import React from "react";
import { Link } from "react-router-dom";
import { FaUserTie } from "react-icons/fa";

import ForYourCollegeBadge from "./ForYourCollegeBadge";
import HiringStatusBadge from "./HiringStatusBadge";
import MustHaveSkillsBadge from "./MustHaveSkillsBadge";
import PreferredSkillsBadge from "./PreferredSkillsBadge";
import AddressPill from "./AddressPill";
import SalaryPill from "./SalaryPill";
import CompanyLogo from "./CompanyLogo";
import JobTitleBlock from "./JobTitleBlock";
import PostedDaysBadge from "./PostedDaysBadge";

export default function JobOpportunityCard({ job }) {
  if (!job) return null;

  return (
    <Link to={`/jobs/${job.job_id}`} className="no-underline group">
      <article
        className={`relative flex flex-col gap-3 p-4 bg-white border border-gray-100 shadow-sm cursor-pointer
        rounded-xl transition-all duration-300 hover:shadow-md hover:scale-[1.005]
        sm:flex-row sm:items-start sm:gap-4 lg:gap-6
        ${job.is_targeted_to_user_college ? "ring-2 ring-[#9bc87c]" : ""}`}
        aria-label={`Job: ${job.jobRole} at ${job.company_name}`}
      >
        {/* Top-right badge (desktop) */}
        {job.is_targeted_to_user_college && (
          <div className="absolute z-10 -top-3 right-4 hidden sm:block">
            <ForYourCollegeBadge className="text-xs font-bold" />
          </div>
        )}

        {/* Mobile badges row */}
        <div className="flex flex-wrap items-center justify-between gap-2 sm:hidden">
          {job.is_targeted_to_user_college && (
            <ForYourCollegeBadge className="text-[10px] font-bold" />
          )}
        </div>

        {/* Logo */}
        <div className="flex-shrink-0">
          <CompanyLogo
            logoUrl={job.logo_url}
            alt={`${job.company_name} logo`}
            className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16"
          />
        </div>

        {/* Left content */}
        <div className="flex-1 min-w-0 space-y-3">
          <JobTitleBlock title={job.jobRole} company={job.company_name} />

          <div className="flex flex-wrap items-center gap-2">
            <AddressPill text={job.company_location} />
            <SalaryPill salary={job.salary} />
          </div>
        </div>

        {/* Right meta */}
        <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0 mt-2 sm:mt-0">
          <HiringStatusBadge status={job.hiring_status || "Actively Hiring"} />
          <PostedDaysBadge text={job.posted_days_ago} />

          <div className="flex flex-col items-start w-full gap-2 mt-1 sm:items-end">
            <MustHaveSkillsBadge met={!!job.mandatorySkillsMet} />
            <PreferredSkillsBadge match={job.preferredSkillMatch} />
          </div>

          {/* Optional CTA (if you want) */}
          {job.require_login_to_apply && (
            <button
              type="button"
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg
              bg-[#9BC87C]/20 border border-[#00C950]/40 text-[#1e1e2d] hover:bg-[#9BC87C]/30 transition"
              onClick={(e) => e.preventDefault()}
            >
              <FaUserTie />
              Login to Apply
            </button>
          )}
        </div>
      </article>
    </Link>
  );
}
