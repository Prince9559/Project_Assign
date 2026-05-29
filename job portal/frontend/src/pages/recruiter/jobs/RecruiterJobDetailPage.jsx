import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { Edit3, Eye, Building2, User, MapPin, IndianRupee, Calendar, CheckCircle, Award } from "lucide-react";
import MainLayout from "../../../components/layout/MainLayout";
import {getImageUrl} from "../../../../utils"

const BASE_URL=import.meta.env.VITE_BASE_URL;

const RecruiterJobDetailPage = () => {
  const { job_id } = useParams();
  const token = useSelector((state) => state.auth.token);
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!job_id || !token) return;

    const fetchJobDetails = async () => {
      try {
        const response = await axios.get(
            `${BASE_URL}/opportunities/recruiter/${job_id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const rawData = response.data;

        // Clean & structure data
        const cleaned = {
          // Basics
          jobId: rawData.job_id,
          opportunityType: rawData.opportunity_type || "Internship",
          jobType: rawData.job_type || "Full-time",
          jobProfile: rawData.jobProfile || "",
          jobDescription: rawData.job_description || "",
          jobTime: rawData.job_time || "",
          daysInOffice: rawData.days_in_office || "",

          // Location & Eligibility
          jobLocation: rawData.job_location || "",
          eligibleCities: rawData.eligible_cities || [],
          eligibleColleges: rawData.eligible_colleges || [],
          eligibleCourses: rawData.eligible_courses || [],

          // Requirements
          skillsRequired: rawData.skillsRequired || [],
          skillNote: rawData.skill_required_note || "",
          candidatePreferences: rawData.candidate_preferences || "",
          womenPreferred: rawData.women_preferred || false,

          // Company
          companyName: rawData.company_name || "N/A",
          logoUrl: rawData.logo_url || "",
          aboutCompany: rawData.aboutCompany || "",
          companyIndustry: rawData.companyIndustry || "",
          companyLocation: rawData.companyLocation || "",

          // Recruiter
          recruiterFullName: rawData.recruiter_full_name || "N/A",
          recruiterEmail: rawData.recruiter_email || "",
          recruiterPhone: rawData.recruiter_phone || "",
          recruiterDesignation: rawData.recruiterDesignationName || "",

          // Verification
          isVerified: {
            email: rawData.is_email_verified,
            phone: rawData.is_phone_verified,
            gst: rawData.is_gst_verified,
          },

          // Hiring & Stats
          numberOfOpenings: rawData.number_of_openings || 0,
          hiringStatus: rawData.hiringStatus || "Unknown",
          numberOfApplicants: rawData.number_of_applicants || 0,
          postedDaysAgo: rawData.posted_days_ago || "Unknown",

          // Compensation
          salaryRange: rawData.salary || "",
          stipendType: rawData.stipend_type || "",
          incentivePerYear: rawData.incentive_per_year || "",

          // Internship
          internshipDuration: rawData.internshipDuration || "",
          internshipStartDate: rawData.internship_start_date
            ? new Date(rawData.internship_start_date).toLocaleDateString("en-IN")
            : "",
          internshipFromDate: rawData.internship_from_date
            ? new Date(rawData.internship_from_date).toLocaleDateString("en-IN")
            : "",
          internshipToDate: rawData.internship_to_date
            ? new Date(rawData.internship_to_date).toLocaleDateString("en-IN")
            : "",
          isCustomInternshipDate: rawData.is_custom_internship_date,

          // Perks & Screening
          perks: Array.isArray(rawData.perks) ? rawData.perks : [],
          screeningQuestions: rawData.screening_questions || [],

          // Payment
          paymentInfo: rawData.payment_info || {},

          // Other
          jobRole: rawData.job_role || "",
          hiringPreferences: rawData.hiring_preferences || "",
        };

        setJobData(cleaned);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load job details.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobDetails();
  }, [job_id, token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl p-6 mx-auto">
        <div className="px-4 py-3 text-red-700 border border-red-200 rounded-md bg-red-50">
          <strong className="font-bold">Error!</strong> {error}
        </div>
        <button
          onClick={() => window.history.back()}
          className="mt-4 text-blue-600 hover:underline"
        >
          ← Go Back
        </button>
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="max-w-4xl p-6 mx-auto text-center text-gray-500">
        No job data found.
      </div>
    );
  }

  const fillRate = jobData.numberOfOpenings > 0
    ? Math.min(100, (jobData.numberOfApplicants / jobData.numberOfOpenings) * 100)
    : 100;

  return (
    <MainLayout>
    <div className="px-4 py-6 mx-auto max-w-7xl md:px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              {jobData.jobProfile}
            </h1>
            <div className="flex items-center gap-2 mt-1 text-gray-600">
              <Building2 size={16} />
              <span className="font-medium">{jobData.companyName}</span>
              <span>·</span>
              <span>{jobData.postedDaysAgo}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* <Link
              to={`/recruiter/jobs/${job_id}/edit`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
            >
              <Edit3 size={16} />
              Edit Job
            </Link> */}
            <Link
                to={`/recruiter-view-applications/${job_id}`}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white !bg-[#9bc87c] hover:!bg-[#8ab76b] rounded-md transition"
            >
              <Eye size={16} />
              View Applicants ({jobData.numberOfApplicants})
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
            jobData.hiringStatus === "Actively Hiring"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}>
            <CheckCircle size={12} className={
              jobData.hiringStatus === "Actively Hiring" ? "text-green-500" : ""
            } />
            {jobData.hiringStatus}
          </span>
          {/* <span className="text-sm text-gray-500">
            {jobData.numberOfOpenings} openings • {jobData.numberOfApplicants} applicants
          </span> */}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Job Overview */}
          <section className="p-5 bg-white border rounded-lg shadow-sm">
            <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold">
              <MapPin size={18} />
              Job Overview
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
              <div>
                <p className="text-gray-500">Opportunity</p>
                <p className="font-medium">{jobData.opportunityType}</p>
              </div>
              <div>
                <p className="text-gray-500">Type</p>
                <p className="font-medium">{jobData.jobType}</p>
              </div>
              <div>
                <p className="text-gray-500">Role</p>
                <p className="font-medium">{jobData.jobRole}</p>
              </div>
              <div>
                <p className="text-gray-500">Location</p>
                <p className="font-medium">{jobData.jobLocation || "Remote/Flexible"}</p>
              </div>
              <div>
                <p className="text-gray-500">Work Mode</p>
                <p className="font-medium">
                  {jobData.jobTime} {jobData.daysInOffice && `(${jobData.daysInOffice})`}
                </p>
              </div>
            </div>
          </section>

          {/* Description */}
          <section className="p-5 bg-white border rounded-lg shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">📝 Job Description</h2>
            <div className="prose-sm prose text-gray-700 whitespace-pre-line max-w-none">
              {jobData.jobDescription || "No description provided."}
            </div>
          </section>

          {/* Requirements */}
          <section className="p-5 bg-white border rounded-lg shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">🎯 Eligibility & Requirements</h2>

            <div className="mb-5">
              <h3 className="mb-2 font-medium">Skills Required</h3>
              {jobData.skillsRequired.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {jobData.skillsRequired.map((skill, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No specific skills required.</p>
              )}
              {jobData.skillNote && (
                <p className="mt-2 text-sm italic text-gray-600">Note: {jobData.skillNote}</p>
              )}
            </div>

            <div className="mb-5">
              <h3 className="mb-2 font-medium">Eligible Courses</h3>
              {jobData.eligibleCourses.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {jobData.eligibleCourses.map((c) => (
                    <span
                      key={c.id}
                      className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs rounded-md"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">All courses eligible.</p>
              )}
            </div>

            <div className="mb-5">
              <h3 className="mb-2 font-medium">Eligible Cities</h3>
              {jobData.eligibleCities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {jobData.eligibleCities.map((c) => (
                    <span
                      key={c.id}
                      className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-md"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">All locations eligible.</p>
              )}
            </div>

            {/* <div className="mb-5">
              <h3 className="mb-2 font-medium">Eligible Colleges</h3>
              {jobData.eligibleColleges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {jobData.eligibleColleges.map((c) => (
                    <span
                      key={c.id}
                      className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs rounded-md"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">All colleges eligible.</p>
              )}
            </div> */}

            {jobData.candidatePreferences && (
              <div>
                <h3 className="mb-2 font-medium">Candidate Preferences</h3>
                <p className="text-gray-700">{jobData.candidatePreferences}</p>
              </div>
            )}

            {jobData.womenPreferred && (
              <div className="mt-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-pink-100 text-pink-800 text-xs rounded-md">
                  👩 Women candidates preferred
                </span>
              </div>
            )}
          </section>

          {/* Screening Questions */}
          {jobData.screeningQuestions.length > 0 && (
            <section className="p-5 bg-white border rounded-lg shadow-sm">
              <h2 className="mb-3 text-lg font-semibold">❓ Screening Questions</h2>
              <ol className="space-y-2 list-decimal list-inside">
                {jobData.screeningQuestions.map((q, i) => (
                  <li key={i} className="text-gray-700">{q}</li>
                ))}
              </ol>
            </section>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Company */}
          <section className="p-5 bg-white border rounded-lg shadow-sm">
            <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold">
              <Building2 size={18} />
              About Company
            </h2>
            <div className="mb-4 text-center">
              {jobData.logoUrl ? (
                <img
                  src={getImageUrl(jobData.logoUrl)}
                  alt={jobData.companyName}
                  className="object-cover w-16 h-16 mx-auto bg-gray-100 rounded-full"
                />
              ) : (
                <div className="flex items-center justify-center w-16 h-16 mx-auto font-bold text-gray-500 bg-gray-200 rounded-full">
                  {jobData.companyName.charAt(0)}
                </div>
              )}
              <h3 className="mt-2 font-semibold">{jobData.companyName}</h3>
              <p className="text-sm text-gray-600">
                {jobData.companyIndustry} • {jobData.companyLocation}
              </p>
            </div>
            <p className="text-sm text-gray-700 whitespace-pre-line">
              {jobData.aboutCompany || "No description provided."}
            </p>

            <div className="flex flex-wrap gap-2 mt-4">
              {jobData.isVerified.email && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs text-green-800 bg-green-100 rounded">
                  <CheckCircle size={12} /> Email verified
                </span>
              )}
              {jobData.isVerified.phone && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs text-green-800 bg-green-100 rounded">
                  <CheckCircle size={12} /> Phone verified
                </span>
              )}
              {jobData.isVerified.gst && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs text-green-800 bg-green-100 rounded">
                  <CheckCircle size={12} /> GST verified
                </span>
              )}
            </div>
          </section>

          {/* Recruiter */}
          {/* <section className="p-5 bg-white border rounded-lg shadow-sm">
            <h2 className="flex items-center gap-2 mb-3 text-lg font-semibold">
              <User size={18} />
              Recruiter
            </h2>
            <p className="font-medium">{jobData.recruiterFullName}</p>
            <p className="text-sm text-gray-600">{jobData.recruiterDesignation}</p>
            <div className="mt-3 space-y-1 text-sm">
              <p className="flex items-center gap-1.5">
                <span className="text-gray-500">📧</span>
                {jobData.recruiterEmail}
              </p>
              <p className="flex items-center gap-1.5">
                <span className="text-gray-500">📞</span>
                {jobData.recruiterPhone}
              </p>
            </div>
          </section> */}

          {/* Stats */}
          <section className="p-5 bg-white border rounded-lg shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">📊 Hiring Progress</h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Openings</span>
                  <span className="font-medium">{jobData.numberOfOpenings}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Applicants</span>
                  <span className="font-medium">{jobData.numberOfApplicants}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Fill Rate</span>
                  <span className="font-medium">{fillRate.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-600 rounded-full"
                    style={{ width: `${fillRate}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </section>

          {/* Compensation */}
          <section className="p-5 bg-white border rounded-lg shadow-sm">
            <h2 className="flex items-center gap-2 mb-3 text-lg font-semibold">
              <IndianRupee size={18} />
              Compensation
            </h2>
            {jobData.salaryRange ? (
              <p className="font-medium">
                ₹{jobData.salaryRange} {jobData.stipendType && `(${jobData.stipendType})`}
              </p>
            ) : (
              <p className="text-gray-500">Not disclosed</p>
            )}

            {jobData.incentivePerYear && (
              <p className="mt-2 text-sm text-gray-600">
                💸 Incentive: ₹{jobData.incentivePerYear} per year
              </p>
            )}

            {jobData.perks.length > 0 && (
              <div className="mt-3">
                <h3 className="mb-1 font-medium">Perks & Benefits</h3>
                <div className="flex flex-wrap gap-2">
                  {jobData.perks.map((perk, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs rounded bg-emerald-50 text-emerald-700"
                    >
                      {perk}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Internship */}
          {(jobData.opportunityType === "Internship" || jobData.internshipDuration) && (
            <section className="p-5 bg-white border rounded-lg shadow-sm">
              <h2 className="flex items-center gap-2 mb-3 text-lg font-semibold">
                <Calendar size={18} />
                Internship Details
              </h2>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-500">Duration:</span>{" "}
                  <span className="font-medium">{jobData.internshipDuration || "N/A"}</span>
                </p>
                {jobData.isCustomInternshipDate ? (
                  <p>
                    <span className="text-gray-500">Dates:</span>{" "}
                    <span className="font-medium">
                      {jobData.internshipFromDate} to {jobData.internshipToDate}
                    </span>
                  </p>
                ) : (
                  <p>
                    <span className="text-gray-500">Starts:</span>{" "}
                    <span className="font-medium">
                      {jobData.internshipStartDate || "Flexible"}
                    </span>
                  </p>
                )}
              </div>
            </section>
          )}

          {/* Payment Info */}
          {/* <section className="p-5 bg-white border rounded-lg shadow-sm">
            <h2 className="flex items-center gap-2 mb-3 text-lg font-semibold">
              <Award size={18} />
              Job Posting Plan
            </h2>
            <div className="text-sm">
              <p>
                <span className="text-gray-500">Type:</span>{" "}
                <span className="font-medium">
                  {jobData.paymentInfo.payment_type === "free" ? "Free" : "Paid"}
                </span>
              </p>
              {jobData.paymentInfo.payment_type === "one_time" && (
                <>
                  <p className="mt-1">
                    <span className="text-gray-500">Amount Paid:</span>{" "}
                    <span className="font-medium">₹{jobData.paymentInfo.amount_paid}</span>
                  </p>
                  <p className="mt-1">
                    <span className="text-gray-500">Status:</span>{" "}
                    <span className={`font-medium ${
                      jobData.paymentInfo.payment_status === "completed"
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}>
                      {jobData.paymentInfo.payment_status === "completed"
                        ? "Completed"
                        : jobData.paymentInfo.payment_status || "Pending"}
                    </span>
                  </p>
                  {jobData.paymentInfo.post_type && (
                    <p className="mt-1">
                      <span className="text-gray-500">Post Type:</span>{" "}
                      <span className="font-medium">{jobData.paymentInfo.post_type}</span>
                    </p>
                  )}
                  {jobData.paymentInfo.is_college_specific && (
                    <p className="mt-1">
                      <span className="text-gray-500">Target Colleges:</span>{" "}
                      <span className="font-medium">{jobData.paymentInfo.college_count} selected</span>
                    </p>
                  )}
                </>
              )}
            </div>
          </section> */}
        </div>
      </div>
    </div>
    </MainLayout>
  );
};

export default RecruiterJobDetailPage;