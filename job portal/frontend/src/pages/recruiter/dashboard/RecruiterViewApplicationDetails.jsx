import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import RecruiterApplicationData from "./RecruiterApplicationData";
import { useApplicantDetail } from "../../../hooks/useApplications";
import { useUpdateApplicationStatus } from "../../../hooks/useApplications";
import { getImageUrl } from "../../../../utils";

// Status Actions Config
const STATUS_ACTIONS = {
  Applied: {
    primary: ["NotInterested", "ShortList"],
    dropdown: ["Send Assignment", "Schedule Interview", "Hire"],
  },
  Screening: {
    primary: ["NotInterested", "ShortList"],
    dropdown: ["Send Assignment", "Schedule Interview", "Hire"],
  },
  "Send Assignment": {
    primary: ["NotInterested"],
    dropdown: ["Schedule Interview", "Hire"],
  },
  Interview: {
    primary: ["NotInterested"],
    dropdown: ["Hire"],
  },
  Offered: {
    primary: [],
    dropdown: ["Hire"],
  },
  Hired: {
    primary: [],
    dropdown: [],
    message: "✅ Candidate Hired",
  },
  ShortList: {
    primary: ["NotInterested"],
    dropdown: ["Send Assignment", "Schedule Interview", "Hire"],
  },
  NotInterested: {
    primary: [],
    dropdown: [],
    message: "❌ Not Interested",
  },
};

// Helper: Safe get with fallback
const safeGet = (obj, path, fallback = "—") => {
  return path.split(".").reduce((o, key) => (o && o[key] !== undefined ? o[key] : fallback), obj);
};

// Helper: Format duration from start/end ISO dates
const formatDuration = (startDateStr, endDateStr) => {
  if (!startDateStr) return "";
  const start = new Date(startDateStr);
  const end = endDateStr ? new Date(endDateStr) : new Date();
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }

  const parts = [];
  if (years > 0) parts.push(`${years} yr${years !== 1 ? "s" : ""}`);
  if (months > 0) parts.push(`${months} mo`);
  return parts.join(" ") || "Less than a month";
};

// Helper: Format date (e.g., "Jan 2023")
const formatDateShort = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};


// Skill Match Card Component — FULLY NULL-SAFE
const SkillMatchCard = ({ skillMatch }) => {
  // Safe extraction with fallbacks
  const overallPercentage = skillMatch?.overallPercentage ?? 0;
  const passedMustHave = skillMatch?.passedMustHave ?? false;

  // Must-Have: fallback to empty structure if missing
  const mustHave = skillMatch?.mustHave ?? {
    required: [],
    matched: [],
    missing: [],
    count: { required: 0, matched: 0, missing: 0 },
  };

  // Preferred: fallback to empty structure if missing
  const preferred = skillMatch?.preferred ?? {
    required: [],
    matched: [],
    missing: [],
    count: { required: 0, matched: 0, missing: 0 },
  };

  // Color coding
  const matchColor =
    overallPercentage >= 80
      ? "text-green-600"
      : overallPercentage >= 50
        ? "text-yellow-600"
        : "text-red-600";
  const matchBg =
    overallPercentage >= 80
      ? "bg-green-50"
      : overallPercentage >= 50
        ? "bg-yellow-50"
        : "bg-red-50";

  // Ensure arrays are arrays (defensive)
  const mustHaveRequired = Array.isArray(mustHave.required) ? mustHave.required : [];
  const mustHaveMatched = Array.isArray(mustHave.matched) ? mustHave.matched : [];
  const mustHaveMissing = Array.isArray(mustHave.missing) ? mustHave.missing : [];
  const preferredRequired = Array.isArray(preferred.required) ? preferred.required : [];
  const preferredMatched = Array.isArray(preferred.matched) ? preferred.matched : [];
  const preferredMissing = Array.isArray(preferred.missing) ? preferred.missing : [];

  return (
    <div className="p-5 bg-white border rounded-lg shadow-sm">
      <div className="flex items-start justify-between">
        <h3 className="flex items-center font-semibold text-gray-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Skill Match
        </h3>
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${matchBg} ${matchColor}`}
        >
          {overallPercentage}% match
        </span>
      </div>

      {/* Must-Have Section */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-700">Must-Have Skills</span>
          <span className="text-sm text-gray-500">
            {mustHaveMatched.length}/{mustHaveRequired.length} matched
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {mustHaveRequired.length === 0 ? (
            <span className="text-sm italic text-gray-500">None specified</span>
          ) : (
            mustHaveRequired.map((skill, idx) => (
              <span
                key={idx}
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${mustHaveMatched.includes(skill)
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800 line-through"
                  }`}
              >
                {String(skill).trim() || "Unnamed Skill"}
              </span>
            ))
          )}
        </div>
        {!passedMustHave && mustHaveMissing.length > 0 && (
          <div className="p-3 mt-3 text-sm text-red-700 border border-red-200 rounded bg-red-50">
            <strong>⚠️ Action Required:</strong> Missing must-have skills:{" "}
            <span className="font-medium">{mustHaveMissing.map(String).join(", ")}</span>
          </div>
        )}
      </div>

      {/* Preferred Section */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium text-gray-700">Preferred Skills</span>
          <span className="text-sm text-gray-500">
            {preferredMatched.length}/{preferredRequired.length} matched
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {preferredRequired.length === 0 ? (
            <span className="text-sm italic text-gray-500">None specified</span>
          ) : (
            preferredRequired.map((skill, idx) => (
              <span
                key={idx}
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${preferredMatched.includes(skill)
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-600"
                  }`}
              >
                {String(skill).trim() || "Unnamed Skill"}
              </span>
            ))
          )}
        </div>
        {preferredMissing.length > 0 && (
          <p className="mt-2 text-sm text-gray-600">
            Suggested to learn: {preferredMissing.map(String).join(", ")}
          </p>
        )}
      </div>
    </div>
  );
};

// Experience Timeline Item — with smart logo/name fallback
const ExperienceItem = ({ exp }) => {
  const { organization, jobRole, startDate, endDate, isCurrent } = exp;
  const duration = formatDuration(startDate, endDate);

  // Safely get org name & first char
  const orgName = (organization?.name || "").trim();
  const firstChar = orgName ? orgName.charAt(0).toUpperCase() : "?";

  return (
    <div className="relative pb-6 pl-6 last:pb-0">
      {/* Timeline dot */}
      <div className="absolute left-0 w-3 h-3 bg-blue-500 border-4 border-white rounded-full shadow top-1"></div>

      {/* Org Logo / Initial Badge */}
      <div className="flex items-center mb-2">
        {organization?.logoUrl ? (
          <img
            src={getImageUrl(organization.logoUrl)}
            alt={orgName}
            className="object-cover w-8 h-8 mr-2 border border-gray-200 rounded"
            onError={(e) => {
              // Optional: fallback to initial if image fails to load
              e.target.style.display = 'none';
              const sibling = e.target.nextElementSibling;
              if (sibling) sibling.style.display = 'inline-block';
            }}
          />
        ) : null}
        {/* Fallback initial badge — only shown if no logo or logo fails */}
        {!organization?.logoUrl && (
          <span
            className="flex items-center justify-center flex-shrink-0 w-8 h-8 mr-2 text-sm font-semibold text-gray-700 bg-gray-200 rounded-full"
            title={orgName || "Organization"}
          >
            {firstChar}
          </span>
        )}

        <div className="flex-1 min-w-0">
          <span className="font-semibold text-gray-900 truncate">{orgName || "— Unknown Organization"}</span>
          <span className="hidden mx-2 text-gray-300 sm:inline">•</span>
          <span className="text-sm text-gray-500 capitalize whitespace-nowrap">
            {organization?.type ? organization.type.replace(/_/g, ' ').toLowerCase() : "other"}
          </span>
          {isCurrent && (
            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full whitespace-nowrap">
              Current
            </span>
          )}
        </div>
      </div>

      <p className="font-medium text-gray-800 truncate">{jobRole?.title || "—"}</p>
      <p className="text-sm text-gray-500">
        {formatDateShort(startDate)} – {isCurrent ? "Present" : formatDateShort(endDate)}
        {duration && <span> · {duration}</span>}
      </p>
      {exp.status && (
        <span
          className={`mt-1 inline-block px-2 py-0.5 text-xs rounded-full ${
            exp.status === "verified"
              ? "bg-green-100 text-green-800"
              : exp.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {exp.status.charAt(0).toUpperCase() + exp.status.slice(1)}
        </span>
      )}
    </div>
  );
};

// Education Item — with logo or initial fallback
const EducationItem = ({ edu }) => {
  const instName = (edu.institution || "").trim();
  const firstChar = instName ? instName.charAt(0).toUpperCase() : "?";
  const hasLogo = edu.logoUrl;

  return (
    <div className="relative pb-5 pl-6 last:pb-0">
      {/* Timeline dot */}
      <div className="absolute left-0 top-2 w-2.5 h-2.5 rounded-full bg-gray-400 border-4 border-white"></div>

      <div className="flex items-start">
        {hasLogo ? (
          <img
            src={getImageUrl(edu.logoUrl)}
            alt={instName}
            className="flex-shrink-0 object-cover mr-2 border border-gray-200 rounded h-7 w-7"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : null}

        {!hasLogo && (
          <span className="flex items-center justify-center flex-shrink-0 mr-2 text-xs font-semibold text-gray-700 bg-gray-200 rounded-full h-7 w-7">
            {firstChar}
          </span>
        )}

        <div className="min-w-0">
          <p className="font-medium text-gray-800">
            {edu.degree} {edu.fieldOfStudy && `· ${edu.fieldOfStudy}`}
          </p>
          <p className="text-sm text-gray-600 truncate">{instName || "— Unknown Institution"}</p>
          <p className="text-sm text-gray-500">
            {edu.startDate} – {edu.endDate}
            {edu.grade && ` · ${edu.grade}`}
          </p>
        </div>
      </div>
    </div>
  );
};

const ApplicationDetail = () => {
  const { job_id, application_id } = useParams();
  const { applicant: rawApplicant, loading, error } = useApplicantDetail(job_id, application_id);
  const [applicant, setApplicant] = useState(null);
  const navigate = useNavigate();
const [isSkillsExpanded, setIsSkillsExpanded] = useState(false);

  useEffect(() => {
    if (rawApplicant) {
      setApplicant({ ...rawApplicant });
    }
  }, [rawApplicant]);

  const { updateStatus, updating } = useUpdateApplicationStatus();

  const handleStatusChange = async (newStatus) => {
    setApplicant((prev) => ({ ...prev, status: newStatus }));
    try {
      await updateStatus(application_id, job_id, newStatus);
    } catch (err) {
      setApplicant((prev) => ({ ...prev, status: rawApplicant?.status || prev.status }));
      alert(err.message || "Failed to update status");
    }
  };

  const getActionButtons = () => {
    const config = STATUS_ACTIONS[applicant?.status] || { primary: [], dropdown: [] };
    const { primary = [], dropdown = [], message } = config;

    if (message) {
      return (
        <div className="w-full p-4 text-center rounded-lg bg-gray-50">
          <span className="text-sm font-medium text-gray-700">{message}</span>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-3">
        {primary.map((action) => (
          <button
            key={action}
            onClick={() => handleStatusChange(action)}
            disabled={updating}
            className={`px-4 py-2.5 text-sm font-medium rounded-lg flex-1 min-w-[140px] ${
              action === "NotInterested"
                ? "bg-red-500 hover:bg-red-600 text-white"
                : action === "ShortList"
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {updating ? "Updating..." : action === "NotInterested" ? "Not Interested" : action}
          </button>
        ))}

        {dropdown.includes("Send Assignment") && (
          <button
            onClick={() =>
              navigate(`/recruiter-send-assignment/${job_id}/${application_id}`, {
                state: { applicant },
              })
            }
            className="px-4 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 flex-1 min-w-[160px]"
          >
            Send Assignment
          </button>
        )}

        {dropdown.includes("Schedule Interview") && (
          <button
            onClick={() =>
              navigate(`/recruiter-schedule-interview/${job_id}/${application_id}`, {
                state: { applicationData: applicant },
              })
            }
            className="px-4 py-2.5 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 flex-1 min-w-[160px]"
          >
            Schedule Interview
          </button>
        )}

        {dropdown.includes("Hire") && (
          <button
            onClick={() => handleStatusChange("Hired")}
            disabled={updating}
            className="px-4 py-2.5 text-sm font-medium bg-green-500 hover:bg-green-600 text-white rounded-lg flex-1 min-w-[100px]"
          >
            {updating ? "Updating..." : "Hire"}
          </button>
        )}
      </div>
    );
  };

  // ====== DATA PREP (safe, fallbacks) ======
  const appDetails = applicant?.applicationDetails || {};
const skillMatch = appDetails.skillMatch || {
  overallPercentage: 0,
  passedMustHave: false,
  mustHave: {
    required: [],
    matched: [],
    missing: [],
    count: { required: 0, matched: 0, missing: 0 },
  },
  preferred: {
    required: [],
    matched: [],
    missing: [],
    count: { required: 0, matched: 0, missing: 0 },
  },
};
  const experiences = appDetails.experienceDetails || [];
  const education = appDetails.education || [];
  const skills = appDetails.skills || [];

  // Format education safely
  const formattedEducation = education.map((edu) => ({
    degree: safeGet(edu, "level") || safeGet(edu, "educationCourse.name") || "Degree",
    institution:
      safeGet(edu, "schoolCollegeEducations.name") ||
      edu.other_institution_name ||
      edu.board_or_university ||
      "Institution",
    startDate: edu.start_date ? new Date(edu.start_date).getFullYear() : "—",
    endDate: edu.end_date ? new Date(edu.end_date).getFullYear() : "Present",
    fieldOfStudy: safeGet(edu, "educationSpecialization.name") || safeGet(edu, "educationCourse.name"),
    grade: edu.percentage_or_cgpa,
  }));

  // Calculate total experience
  const totalExperience = experiences.length > 0 ? formatDuration(
    Math.min(...experiences.map(e => new Date(e.startDate).getTime())),
    experiences.find(e => e.isCurrent) ? null : Math.max(...experiences.map(e => new Date(e.endDate || e.startDate).getTime()))
  ) : "0 years";

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading applicant details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-md p-6 text-center border border-red-200 rounded-lg bg-red-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-3 text-lg font-medium text-red-800">Failed to load</h3>
            <p className="mt-1 text-red-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 mt-4 text-white bg-red-500 rounded hover:bg-red-600"
            >
              Retry
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!applicant) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-500">No applicant data found.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen gap-6 p-4 lg:flex-row lg:p-6 bg-gray-50">
        {/* Sidebar */}
        <aside className="lg:w-[320px] w-full lg:sticky lg:top-6 lg:h-fit rounded-lg bg-white shadow-sm p-5">
          <RecruiterApplicationData job_id={job_id} />
        </aside>

        {/* Main Content */}
        <div className="flex-1 w-full max-w-4xl">
          {/* Header Card */}
          <div className="p-6 mb-6 bg-white shadow-sm rounded-xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{appDetails.name || "Applicant Name"}</h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="inline-flex items-center px-3 py-1 text-sm text-gray-700 bg-gray-100 rounded-full">
                    📍 {appDetails.currentLocation?.name || "Location not specified"}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 text-sm text-blue-800 bg-blue-100 rounded-full">
                    ⏱️ {totalExperience}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      skillMatch.overallPercentage >= 80
                        ? "bg-green-100 text-green-800"
                        : skillMatch.overallPercentage >= 50
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    📊 {skillMatch.overallPercentage || 0}% Preferred Skills Match
                  </span>
                  {appDetails.confirm_availability && (
                    <span className="inline-flex items-center px-3 py-1 text-sm text-green-800 bg-green-100 rounded-full">
                      ✅ Availability Confirmed
                    </span>
                  )}
                </div>

                {/* Skills (Top 5) */}
                {/* === Skills Section (Expandable) === */}
<div className="mt-4">
  <h3 className="text-sm font-medium text-gray-600 mb-1.5">Skills</h3>
  <div className="flex flex-wrap gap-1.5">
    {skills.slice(0, 5).map((skill, idx) => (
      <span
        key={idx}
        className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium"
      >
        {skill.name || "Unnamed"}
      </span>
    ))}

    {/* Show "+X more" only if >5 */}
    {skills.length > 5 && (
      <button
        onClick={() => setIsSkillsExpanded(true)}
        className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition flex items-center"
      >
        +{skills.length - 5} more
        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
    )}

    {skills.length === 0 && (
      <span className="text-sm text-gray-400">— No skills listed</span>
    )}
  </div>
  
                </div>{/* === Skills Modal (Inline Expand) === */}
                {isSkillsExpanded && (
                  <div className="p-5 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl animate-fadeIn">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-800">All Skills ({skills.length})</h3>
                      <button
                        onClick={() => setIsSkillsExpanded(false)}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="Close"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 text-sm rounded-lg font-medium"
                        >
                          {skill.name || "Unnamed"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Status & Actions */}
              <div className="flex flex-col items-start w-full md:items-end md:w-auto">
                <span
                  className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                    applicant.status === "Hired"
                      ? "bg-green-100 text-green-800"
                      : applicant.status === "NotInterested"
                      ? "bg-red-100 text-red-800"
                      : applicant.status === "ShortList"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {applicant.status}
                </span>
                <p className="mt-2 text-xs text-gray-500">
                  Applied {applicant.appliedDate ? new Date(applicant.appliedDate).toLocaleDateString() : "recently"}
                </p>
                <div className="w-full mt-4 md:w-auto">{getActionButtons()}</div>
              </div>
            </div>
          </div>

          {/* Skill Match Card */}
          <SkillMatchCard skillMatch={skillMatch} />

          {/* Application Answers */}
          {(appDetails.why_should_we_hire_you ||
            appDetails.project ||
            appDetails.github_link ||
            appDetails.portfolio_link) && (
            <div className="p-6 mt-6 bg-white shadow-sm rounded-xl">
              <h2 className="mb-4 text-lg font-semibold text-gray-800">Application Highlights</h2>
              <div className="space-y-4">
                {appDetails.why_should_we_hire_you && (
                  <div>
                    <h3 className="mb-1 font-medium text-gray-700">Why hire them?</h3>
                    <p className="text-gray-600 whitespace-pre-line">{appDetails.why_should_we_hire_you}</p>
                  </div>
                )}

                {appDetails.project && (
                  <div>
                    <h3 className="mb-1 font-medium text-gray-700">Project Summary</h3>
                    <p className="text-gray-600 whitespace-pre-line">{appDetails.project}</p>
                  </div>
                )}

                {(appDetails.github_link || appDetails.portfolio_link) && (
                  <div className="flex flex-wrap gap-4">
                    {appDetails.github_link && (
                      <a
                        href={appDetails.github_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <svg className="h-4 w-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                        </svg>
                        GitHub
                      </a>
                    )}
                    {appDetails.portfolio_link && (
                      <a
                        href={appDetails.portfolio_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800"
                      >
                        <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Portfolio
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Experience Timeline */}
          {experiences.length > 0 && (
            <div className="p-6 mt-6 bg-white shadow-sm rounded-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Experience</h2>
                <span className="text-sm text-gray-500">{experiences.length} role{experiences.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="mt-4 space-y-4">
                {experiences.map((exp, idx) => (
                  <ExperienceItem key={idx} exp={exp} />
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {formattedEducation.length > 0 && (
            <div className="p-6 mt-6 bg-white shadow-sm rounded-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Education</h2>
                <span className="text-sm text-gray-500">{formattedEducation.length} degree{formattedEducation.length !== 1 ? "s" : ""}</span>
              </div>
              <div className="mt-4 space-y-4">
                {formattedEducation.map((edu, idx) => (
                  <EducationItem key={idx} edu={edu} />
                ))}
              </div>
            </div>
          )}

          {/* Resume & Contact */}
          <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
            {appDetails.resume && (
              <div className="p-6 bg-white shadow-sm rounded-xl">
                <h3 className="mb-3 font-semibold text-gray-800">Resume</h3>
                <a
                  href={getImageUrl(appDetails.resume)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center font-medium text-blue-600 hover:text-blue-800"
                >
                  <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download Resume
                </a>
              </div>
            )}

            <div className="p-6 bg-white shadow-sm rounded-xl">
              <h3 className="mb-3 font-semibold text-gray-800">Contact</h3>
              <div className="space-y-2 text-sm">
                {appDetails.email && (
                  <p>
                    <span className="font-medium text-gray-700">Email:</span>{" "}
                    <a href={`mailto:${appDetails.email}`} className="text-blue-600 hover:underline">
                      {appDetails.email}
                    </a>
                  </p>
                )}
                {appDetails.phone && (
                  <p>
                    <span className="font-medium text-gray-700">Phone:</span>{" "}
                    <a href={`tel:${appDetails.phone.replace(/\D/g, "")}`} className="text-blue-600 hover:underline">
                      {appDetails.phone}
                    </a>
                  </p>
                )}
                {appDetails.language && (
                  <p>
                    <span className="font-medium text-gray-700">Languages:</span>{" "}
                    <span className="text-gray-600">{appDetails.language}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ApplicationDetail;