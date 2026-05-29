// src/pages/university/UniversityJobDetail.js
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getUniversityJobDetailById,
  unlockContact,
} from "../../../api/universityy";
import { getImageUrl } from "../../../../utils";
import { useSelector } from "react-redux";

import MainLayout from "../../../components/layout/MainLayout";
import CreatePostModal from "../../../components/profile/CreatePostModal";
import GreenPrimaryButton from "../../../components/jobs/GreenPrimaryButton";

const UniversityJobDetail = () => {
  const { job_id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const { token, user } = useSelector((state) => state.auth);

  const [unlocking, setUnlocking] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [expiryWarning, setExpiryWarning] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await getUniversityJobDetailById(job_id);
        setJob(res);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load job");
      } finally {
        setLoading(false);
      }
    };
    if (job_id) fetchJob();
  }, [job_id]);

  const renderList = (items, fallback = "—") =>
    items?.length ? items.join(", ") : fallback;

  //  Unlock handler
  const handleUnlockRecruiter = async () => {
    if (unlocking) return;

    setUnlocking(true);
    try {
      const res = await unlockContact({
        recruiter_user_id: job.recruiter_user_id,
        job_id: Number(job.job_id),
      });

      const {
        success,
        contact,
        remaining_credits,
        batch_expiry_warning,
        unlock_status, // "new" or "reused"
      } = res;

      if (success) {
        //  Update local state
        setJob((prev) => ({
          ...prev,
          can_view_recruiter_info: true,
          recruiter: {
            ...prev.recruiter,
            full_name: contact.name,
            email: contact.email,
            phone: contact.phone,
            designation: contact.designation,
          },
        }));
        setExpiryWarning(batch_expiry_warning);

        // Show feedback
        if (unlock_status === "new") {
          alert(
            `Contact unlocked!\n1 credit used. Remaining: ${remaining_credits}`,
          );
        } else {
          alert(`Contact already unlocked! (No credit used)`);
        }
      }
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.error === "INSUFFICIENT_CREDITS") {
        setExpiryWarning(errorData.batch_expiry_warning);

        // 🚨 Smart redirect logic
        const msg =
          errorData.remaining_credits > 0
            ? `You have ${errorData.remaining_credits} credit(s) left — but none available for use (expiring or used up).\n\n💡 Tip: ${errorData.batch_expiry_warning?.message || "Buy more credits to continue."}\n\nWould you like to buy more now?`
            : "You have no credits left. Would you like to buy some?";

        if (window.confirm(msg)) {
          navigate("/university/credits/pricing");
        }
      } else {
        alert(
          "⚠️ " +
            (errorData?.error || "Failed to unlock contact. Please try again."),
        );
      }
    } finally {
      setUnlocking(false);
      setShowConfirm(false);
    }
  };

  // Generate a smart prefilled message
  const generatePrefilledCaption = () => {
    const jobUrl = `${window.location.origin}/jobs/${job.job_id}`; // or your public job slug if students see different route

    const stipend = job.salary
      ? `Stipend: ₹${job.salary} (${job.stipend_type || "Paid"})`
      : job.stipend_type === "Unpaid"
        ? "Unpaid Internship"
        : "Stipend: Not disclosed";

    const eligibleFor = [
      job.eligible_courses?.length &&
        `Courses: ${job.eligible_courses.join(", ")}`,
      job.eligible_colleges?.length &&
        `Colleges: ${job.eligible_colleges.join(", ")}`,
      job.eligible_cities?.length &&
        `Cities: ${job.eligible_cities.join(", ")}`,
    ]
      .filter(Boolean)
      .join(" | ");

    return `🎓 Exciting Opportunity!

🏢 ${job.company_name} is hiring for ${job.jobRole} (${job.opportunity_type})
📌 ${job.job_type} | ${stipend}
⏳ ${job.internshipDuration || "NA"}

🔗 Apply here: ${jobUrl}

${eligibleFor ? `${eligibleFor}\n\n` : ""}

👉 Share with eligible students!`;
  };

  const handleOpenPostModal = () => {
    setIsPostModalOpen(true);
  };

  const handlePostToFeed = (newPost) => {
    // Optional: show toast or increment local post count
    setIsPostModalOpen(false);
    alert("Posted to student feed!");
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-8 h-8 mb-2 border-4 border-blue-500 rounded-full animate-spin border-t-transparent" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="max-w-md p-6 text-center bg-white rounded-lg shadow">
          <div className="mb-3 text-red-500">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.172 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">{error}</h2>
          <button
            onClick={() => navigate("/university/jobs")}
            className="px-4 py-2 mt-4 text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            ← Back to Jobs
          </button>
        </div>
      </div>
    );

  if (!job) return null;

  return (
    <MainLayout>
      <div className="min-h-screen pb-16 bg-gray-50">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex items-center max-w-6xl px-4 py-4 mx-auto">
            {/* <button
              onClick={() => navigate("/university/jobs")}
              className="flex items-center text-blue-600 hover:underline"
            >
              <svg
                className="w-5 h-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Jobs
            </button> */}

            <GreenPrimaryButton
              onClick={() => navigate("/university/jobs")}
              className="flex items-center"
            >
              <svg
                className="w-5 h-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Back to Jobs
            </GreenPrimaryButton>
          </div>
        </header>

        <main className="max-w-6xl px-4 py-6 mx-auto">
          <div className="overflow-hidden bg-white rounded-lg shadow-sm">
            {/* Hero Banner */}
            <div
              className={`p-6 ${
                job.targeting_our_college
                  ? "bg-blue-50 border-b border-blue-200"
                  : "border-b"
              }`}
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                {/* Left */}
                <div className="flex-1">
                  <div className="flex items-start">
                    {job.logo_url ? (
                      <img
                        src={getImageUrl(job.logo_url)}
                        alt={job.company_name}
                        className="flex-shrink-0 object-contain w-16 h-16 mr-4 border rounded-lg"
                      />
                    ) : (
                      <div className="flex items-center justify-center flex-shrink-0 w-16 h-16 mr-4 bg-gray-200 rounded-lg">
                        <span className="text-lg font-bold text-gray-700">
                          {job.company_name?.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="flex flex-wrap items-baseline gap-2 mb-1">
                        <h1 className="text-2xl font-bold text-gray-900">
                          {job.jobProfile}
                        </h1>
                        {job.targeting_our_college && (
                          // <span className="flex items-center px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">
                          //   <svg
                          //     className="w-4 h-4 mr-1"
                          //     fill="currentColor"
                          //     viewBox="0 0 20 20"
                          //   >
                          //     <path
                          //       fillRule="evenodd"
                          //       d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          //     />
                          //   </svg>
                          //   For Your College
                          // </span>

                          <span className="flex items-center px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">
                            <svg
                              className="w-4 h-4 mr-1 text-green-600"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            For Your College
                          </span>
                        )}
                      </div>
                      <p className="text-lg text-gray-700">
                        {job.company_name}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-600">
                        <span>{job.posted_days_ago}</span>
                        <span>•</span>
                        <span> {job.opportunity_type || ""}</span>

                        {job.job_type && <span>• {job.job_type || ""}</span>}
                        {job.is_college_specific && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center">
                              <svg
                                className="w-4 h-4 mr-1 text-indigo-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              College-Specific
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Stats & Actions */}
                <div className="flex flex-col items-end">
                  <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                    <div>
                      <div className="font-bold text-gray-900">
                        {job.number_of_applicants || 0}
                      </div>
                      <div className="text-xs text-gray-500">Applicants</div>
                    </div>
                    <div>
                      <div
                        className={`font-bold ${
                          job.hiringStatus === "Actively Hiring"
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        ● {job.hiringStatus}
                      </div>
                      <div className="text-xs text-gray-500">Status</div>
                    </div>
                  </div>

                  {/* 🔑 College-Specific Actions */}
                  {/* {job.targeting_our_college && (
                  <div className="w-full max-w-xs space-y-3">
                    <button
                      disabled
                      className="w-full py-2.5 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium flex items-center justify-center opacity-80 cursor-not-allowed"
                      title="Coming soon: Post this job to your student feed"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                      Post to Student Feed
                    </button>
                    <p className="text-xs text-center text-blue-700">
                      Notify students instantly (coming soon)
                    </p>
                  </div>
                )} */}

                  {/* 🔑 College-Specific Actions */}
                  {/* {job.targeting_our_college && (
  <div className="w-full max-w-xs space-y-3">
    <button
      onClick={handleOpenPostModal}
      className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center justify-center hover:bg-blue-700 transition"
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
      Post to Student Feed
    </button>
    <p className="text-xs text-center text-gray-600">
      Notify  students instantly
    </p>
  </div>
)} */}

                  {job.targeting_our_college && (
                    <div className="w-full max-w-xs space-y-3">
                      <GreenPrimaryButton
                        onClick={handleOpenPostModal}
                        className="flex items-center justify-center w-full text-sm !py-2.5"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                          />
                        </svg>
                        Post to Student Feed
                      </GreenPrimaryButton>
                      <p className="text-xs text-center text-gray-600">
                        Notify students instantly
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-7">
                  {/* About Role */}
                  <section>
                    <h2 className="flex items-center mb-4 text-xl font-semibold text-gray-900">
                      <svg
                        className="w-5 h-5 mr-2 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      About the Role
                    </h2>
                    <div
                      className="prose text-gray-700 max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: job.job_description || "<p>No description.</p>",
                      }}
                    />
                  </section>

                  {/* Eligibility */}
                  <section>
                    <h2 className="flex items-center mb-4 text-xl font-semibold text-gray-900">
                      <svg
                        className="w-5 h-5 mr-2 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Eligibility Criteria
                    </h2>
                    <div className="space-y-3 text-gray-700">
                      <div>
                        <span className="font-medium text-gray-900">
                          Colleges:
                        </span>{" "}
                        {renderList(job.eligible_colleges)}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">
                          Courses:
                        </span>{" "}
                        {renderList(job.eligible_courses)}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">
                          Cities:
                        </span>{" "}
                        {renderList(job.eligible_cities)}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">
                          Skills:
                        </span>{" "}
                        {renderList(job.skillsRequired)}
                      </div>
                      {job.skill_required_note && (
                        <div className="text-sm italic text-gray-600">
                          <span className="font-medium">Note:</span>{" "}
                          {job.skill_required_note}
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Compensation */}
                  <section>
                    <h2 className="flex items-center mb-4 text-xl font-semibold text-gray-900">
                      <svg
                        className="w-5 h-5 mr-2 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Compensation & Perks
                    </h2>
                    <div className="space-y-2 text-gray-700">
                      <div>
                        <span className="font-medium text-gray-900">
                          Stipend:
                        </span>{" "}
                        {job.salary ? `₹${job.salary}` : "Not disclosed"}
                        {job.stipend_type && ` (${job.stipend_type})`}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">
                          Duration:
                        </span>{" "}
                        {job.internshipDuration || "—"}
                      </div>
                      {job.incentive_per_year && (
                        <div>
                          <span className="font-medium text-gray-900">
                            Incentives:
                          </span>{" "}
                          {job.incentive_per_year}
                        </div>
                      )}
                      {job.perks.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-900">
                            Perks:
                          </span>{" "}
                          {job.perks.join(", ")}
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Company */}
                  <section>
                    <h3 className="mb-3 text-lg font-medium text-gray-900">
                      About {job.company_name}
                    </h3>
                    <div className="p-4 rounded-lg bg-gray-50">
                      <p className="text-gray-700">
                        {job.aboutCompany || "No description."}
                      </p>
                      <div className="mt-3 space-y-1 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Industry:</span>{" "}
                          {job.companyIndustry || "—"}
                        </div>
                        <div>
                          <span className="font-medium">HQ:</span>{" "}
                          {job.companyLocation || "—"}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Recruiter (Masked) */}
                  {/* <section>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      Recruiter
                    </h3>
                    {!job.can_view_recruiter_info && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                        🔒 Locked
                      </span>
                    )}
                  </div>
                  <div className="p-4 space-y-2 text-gray-700 rounded-lg bg-gray-50">
                    <div>
                      <span className="font-medium text-gray-900">Name:</span>{" "}
                      {job.recruiter.full_name}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Email:</span>{" "}
                      {job.recruiter.email}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">Phone:</span>{" "}
                      {job.recruiter.phone}
                    </div>
                    <div>
                      <span className="font-medium text-gray-900">
                        Designation:
                      </span>{" "}
                      {job.recruiter.designation || "—"}
                    </div>
                  </div>
                  {!job.can_view_recruiter_info && (
                    <button
                      onClick={() =>
                        alert(
                          "🔔 Coming soon: Pay to unlock recruiter contact for direct outreach!"
                        )
                      }
                      className="flex items-center justify-center w-full py-2 mt-3 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      <svg
                        className="w-4 h-4 mr-1.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Unlock Contact Info
                    </button>
                  )}
                </section> */}

                  {/* Recruiter Info — Smart UI */}
                  <section>
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-900">
                        Recruiter
                      </h3>

                      {/* Status badges */}
                      <div className="flex gap-2">
                        {job.can_view_recruiter_info ? (
                          <span className="inline-flex items-center text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              />
                            </svg>
                            Unlocked
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Locked
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Expiry warning (if any) */}
                    {expiryWarning && (
                      <div className="p-3 mb-3 text-sm text-orange-700 border-l-4 border-orange-500 rounded bg-orange-50">
                        <strong>⚠️ {expiryWarning.message}</strong>
                      </div>
                    )}

                    {/* Contact Info */}
                    <div className="p-4 space-y-2 text-gray-700 rounded-lg bg-gray-50">
                      <div>
                        <span className="font-medium text-gray-900">Name:</span>{" "}
                        {job.recruiter.full_name}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">
                          Email:
                        </span>{" "}
                        {job.recruiter.email}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">
                          Phone:
                        </span>{" "}
                        {job.recruiter.phone}
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">
                          Designation:
                        </span>{" "}
                        {job.recruiter.designation || "—"}
                      </div>
                    </div>

                    {/* Action Button */}
                    {!job.can_view_recruiter_info && (
                      <>
                        {showConfirm ? (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm text-gray-700">
                              🔑 Unlock {job.recruiter.full_name}’s contact info
                              for <strong>1 credit</strong>?
                            </p>
                            <div className="flex gap-2">
                              {/* <button
                                onClick={handleUnlockRecruiter}
                                disabled={unlocking}
                                className="flex-1 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-75"
                              >
                                {unlocking ? "Unlocking…" : "Yes, Unlock"}
                              </button> */}
                              <GreenPrimaryButton
                                onClick={handleUnlockRecruiter}
                                disabled={unlocking}
                                className="flex-1 py-2 text-sm font-medium rounded-lg"
                              >
                                {unlocking ? "Unlocking…" : "Yes, Unlock"}
                              </GreenPrimaryButton>

                              <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 py-2 text-sm font-medium text-gray-800 bg-gray-200 rounded-lg hover:bg-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          // <button
                          //   onClick={() => setShowConfirm(true)}
                          //   className="flex items-center justify-center w-full py-2 mt-3 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                          // >
                          //   <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          //     <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          //   </svg>
                          //   Unlock Contact Info
                          // </button>
                          <GreenPrimaryButton
                            onClick={() => setShowConfirm(true)}
                            className="flex items-center justify-center w-full mt-3 !py-2 !text-white"
                          >
                            <svg
                              className="w-4 h-4 mr-1.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                            Unlock Contact Info
                          </GreenPrimaryButton>
                        )}
                      </>
                    )}
                  </section>

                  {/* Targeting Insight (only if relevant) */}
                  {job.targeting_our_college && (
                    <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
                      <div className="flex items-start">
                        <svg
                          className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          />
                        </svg>
                        <div>
                          <h4 className="font-medium text-blue-800">
                            🎯 This job targets your college!
                          </h4>
                          <p className="mt-1 text-sm text-blue-700">
                            Consider sharing it with eligible students or
                            contacting the recruiter for campus drive
                            opportunities.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <CreatePostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onPostCreated={handlePostToFeed}
        token={token}
        userId={user.id}
        userProfilePic={user.profile_pic}
        prefilledCaption={generatePrefilledCaption()}
        visibilityScope="college"
        // collegeIds={[job.university_college_id]} // ensure job includes this field
      />
    </MainLayout>
  );
};

export default UniversityJobDetail;
