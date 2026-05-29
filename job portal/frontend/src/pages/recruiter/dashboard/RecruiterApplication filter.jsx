// RecruiterApplication.jsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Lock, Crown, EyeOff, MessageSquare } from "lucide-react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import { useApplications } from "../../../hooks/useApplications";
import { useUpdateApplicationStatus } from "../../../hooks/useApplications";
import ApplicationFilterSidebar from "../applications/ApplicationFilterSidebar";
import SimpleApplicationSidebar from "../applications/SimpleApplicationLeftSidebar";

const getCurrentUserPlan = () => {
  return "free"; // Replace with real plan later
};

// Status options for top filter bar (must match DB statuses)
const STATUS_OPTIONS = [
  { label: "All", value: "All" },
  { label: "Applied", value: "Applied" },
  { label: "Shortlisted", value: "ShortList" },
  { label: "Assignment Sent", value: "Send Assignment" },
  { label: "Interview Scheduled", value: "Interview" },
  { label: "Hired", value: "Hired" },
  { label: "Not Interested", value: "NotInterested" },
];

const RecruiterApplication = () => {
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All"); // ← NEW
  const [filters, setFilters] = useState({
    locationText: "",
    skillsText: "",
    matchScore: [0, 100],
    gender: [],
    graduationYear: [],
    educationBackgroundText: "",
    assignmentSent: null,
    interviewScheduled: null,
  });
  const [openMenuId, setOpenMenuId] = useState(null);

  const navigate = useNavigate();
  const { job_id } = useParams();
  const location = useLocation();
  const job = location.state?.job;

  const userPlan = getCurrentUserPlan();
  const isFreeUser = userPlan === "free";
  const freeLimit = 20;

  // 🔹 Map frontend filters → backend query params
  const buildApiFilters = useCallback(() => {
    const apiFilters = {};

    // Status
    if (selectedStatus !== "All") {
      apiFilters.status = selectedStatus;
    }

    // Location & Skills (text)
    if (filters.locationText) apiFilters.location = filters.locationText;
    if (filters.skillsText) apiFilters.skills = filters.skillsText;

    // Match score
    const [min, max] = filters.matchScore || [0, 100];
    if (min > 0) apiFilters.matchMin = min;
    if (max < 100) apiFilters.matchMax = max;

    // Gender → backend only supports single value for now
    if (filters.gender.length === 1) {
      apiFilters.gender = filters.gender[0];
    }

    // Graduation years
    if (filters.graduationYear.length > 0) {
      apiFilters.gradYears = filters.graduationYear.join(",");
    }

    // Education
    if (filters.educationBackgroundText) {
      apiFilters.educationBackground = filters.educationBackgroundText;
    }

    // Assignment status
    if (filters.assignmentSent === true) apiFilters.assignmentStatus = "sent";
    else if (filters.assignmentSent === false)
      apiFilters.assignmentStatus = "not_sent";

    // Interview status
    if (filters.interviewScheduled === true)
      apiFilters.interviewStatus = "scheduled";
    else if (filters.interviewScheduled === false)
      apiFilters.interviewStatus = "not_scheduled";

    return apiFilters;
  }, [selectedStatus, filters]);

  const {
    applications: rawApplications,
    loading,
    error,
  } = useApplications(job_id, buildApiFilters());

  const [applications, setApplications] = useState([]);

  console.log("the applications from hook",applications);

  useEffect(() => {
    if (rawApplications) {
      setApplications([...rawApplications]);
    }
  }, [rawApplications]);

  const { updateStatus, updating } = useUpdateApplicationStatus();

  const handleStatusUpdate = async (application_id, newStatus) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.application_id === application_id
          ? { ...app, status: newStatus }
          : app
      )
    );

    try {
      await updateStatus(application_id, job_id, newStatus);
    } catch (err) {
      setApplications((prev) =>
        prev.map((app) =>
          app.application_id === application_id
            ? { ...app, status: app.status }
            : app
        )
      );
      alert(err.message || "Failed to update status");
    }
  };

  // 🔹 Status Action Config (keep as-is)
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
      message: "Candidate Hired",
    },
    ShortList: {
      primary: ["NotInterested"],
      dropdown: ["Send Assignment", "Schedule Interview", "Hire"],
    },
    NotInterested: {
      primary: [],
      dropdown: [],
      message: "Not Interested",
    },
  };

  const getActionButtons = (
    status,
    app,
    updating,
    handleStatusUpdate,
    navigate,
    job_id
  ) => {
    const config = STATUS_ACTIONS[status] || { primary: [], dropdown: [] };
    const { primary = [], dropdown = [], message } = config;

    if (message) {
      return (
        <span className="px-3 py-1 text-sm font-medium text-gray-500">
          {message}
        </span>
      );
    }

    return (
      <div className="flex gap-2">
        {primary.map((action) => (
          <button
            key={action}
            onClick={() => handleStatusUpdate(app.application_id, action)}
            disabled={updating}
            className={`px-3 py-1 text-sm text-white transition rounded-md ${
              action === "NotInterested"
                ? "bg-red-500 hover:bg-red-600"
                : action === "ShortList"
                ? "bg-green-500 hover:bg-green-600"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {action === "NotInterested" ? "Not Interested" : action}
          </button>
        ))}

        {dropdown.length > 0 && (
          <div className="relative">
            <button
              className="px-3 py-1 text-sm transition border border-gray-300 rounded-md hover:bg-gray-100"
              onClick={() =>
                setOpenMenuId((prev) =>
                  prev === app.application_id ? null : app.application_id
                )
              }
            >
              More →
            </button>

            {openMenuId === app.application_id && (
              <div className="absolute right-0 z-10 w-48 mt-1 bg-white border border-gray-200 rounded shadow-md">
                {dropdown.map((action) => {
                  if (action === "Send Assignment") {
                    return (
                      <button
                        key={action}
                        onClick={() =>
                          navigate(
                            `/recruiter-send-assignment/${job_id}/${app.application_id}`,
                            { state: { applicant: app } }
                          )
                        }
                        className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                      >
                        Send Assignment
                      </button>
                    );
                  }
                  if (action === "Schedule Interview") {
                    return (
                      <button
                        key={action}
                        onClick={() =>
                          navigate(
                            `/recruiter-schedule-interview/${job_id}/${app.application_id}`,
                            { state: { applicationData: app } }
                          )
                        }
                        className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                      >
                        Schedule Interview
                      </button>
                    );
                  }
                  if (action === "Hire") {
                    return (
                      <button
                        key={action}
                        onClick={() =>
                          handleStatusUpdate(app.application_id, "Hired")
                        }
                        disabled={updating}
                        className="block w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                      >
                        Hire
                      </button>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // 🔹 Client-side search (optional; remove if backend adds "search" param later)
  const filteredApps = useMemo(() => {
    if (!applications) return [];
    return applications.filter((app) =>
      app.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [applications, search]);

  const visibleApps = isFreeUser
    ? filteredApps.slice(0, freeLimit)
    : filteredApps;
  const hasHiddenApps = isFreeUser && filteredApps.length > freeLimit;

  // if (loading) {
  //   return (
  //     <MainLayout>
  //       <div className="flex items-center justify-center h-screen">
  //         <p className="text-lg text-gray-600">Loading applications...</p>
  //       </div>
  //     </MainLayout>
  //   );
  // }

  // if (error) {
  //   return (
  //     <MainLayout>
  //       <div className="flex items-center justify-center h-screen">
  //         <p className="text-lg text-red-500">{error}</p>
  //       </div>
  //     </MainLayout>
  //   );
  // }

  return (
    <MainLayout>
      <div className="flex items-start justify-center min-h-screen px-2 py-6 bg-gray-100 lg:px-8">
        <div className="flex-grow hidden lg:block"></div>
        <SimpleApplicationSidebar
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        {/* Center Content */}
        <div className="bg-white rounded-lg shadow-md w-full max-w-[725px] py-5 px-6 flex flex-col gap-5">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
            <p className="text-gray-600">{job?.JobRole?.title || ""}</p>
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search applicants by name..."
              className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search
              className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2"
              size={20}
            />
          </div>

          {/* 🔹 Status Filter Buttons (NEW) */}
          <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-200">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedStatus(option.value)}
                className={`px-3 py-1.5 text-sm rounded-full transition ${
                  selectedStatus === option.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Upgrade Banner */}
          {hasHiddenApps && (
            <div className="p-4 mb-4 border border-blue-200 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <Crown className="text-yellow-500" size={24} />
                </div>
                <div className="ml-3">
                  <h3 className="font-semibold text-gray-900">
                    Unlock all applicants!
                  </h3>
                  <p className="mt-1 text-sm text-gray-700">
                    You’re on the <span className="font-medium">Free Plan</span>
                    . Upgrade to Pro to view and manage all{" "}
                    {filteredApps.length} applicants.
                  </p>
                  <button
                    onClick={() => navigate("/recruiter-pricing-page")}
                    className="inline-flex items-center px-4 py-2 mt-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    Upgrade to Pro Plan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Applications List */}
          <div className="flex flex-col gap-4 pr-1 max-h-[600px] overflow-y-auto">
            {loading ? (
              //  Skeleton Loader
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="p-4 bg-white border border-gray-200 rounded-lg animate-pulse"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="w-3/4 h-4 mb-2 bg-gray-200 rounded"></div>
                        <div className="w-1/2 h-3 mb-2 bg-gray-200 rounded"></div>
                        <div className="w-2/3 h-3 mb-3 bg-gray-200 rounded"></div>
                        <div className="w-1/4 h-3 bg-gray-200 rounded"></div>
                      </div>
                      <div className="flex flex-col items-end ml-4">
                        <div className="w-16 h-5 mb-3 bg-gray-200 rounded"></div>
                        <div className="w-20 bg-gray-200 rounded h-7"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              //  Inline error message
              <div className="py-8 text-center">
                <p className="text-red-500">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-2 text-sm text-blue-600 hover:underline"
                >
                  Try again
                </button>
              </div>
            ) : visibleApps.length === 0 ? (
              <div className="py-8 text-center text-gray-500">
                No applications found.
              </div>
            ) : (
              visibleApps.map((app) => (
                <div
                  key={app.application_id}
                  className="flex items-start justify-between p-4 transition-shadow bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md"
                >
                  <div className="flex-1">
                    <h2 className="font-semibold text-gray-900">{app.name}</h2>
                    <p className="text-gray-600">{app.location}</p>
                    <p className="text-gray-600">
                      Experience: {app.experience}
                    </p>
                    <Link
                      to={`/recruiter-application-details/${job_id}/${app.application_id}`}
                      state={{ app }}
                      className="block mt-1 text-sm text-blue-600 hover:underline"
                    >
                      View full application
                    </Link>
                    <p className="mt-1 text-xs text-gray-500">
                      Applied {app.applied}
                    </p>

                    <span
                      className={`mt-2 inline-block px-2 py-1 text-xs font-medium rounded-full ${
                        app.status === "Hired"
                          ? "bg-green-100 text-green-800"
                          : app.status === "NotInterested"
                          ? "bg-red-100 text-red-800"
                          : app.status === "ShortList"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <div className="flex flex-col items-end ml-4">
                    <span
                      className={`px-2.5 py-1 mb-2 text-xs font-medium rounded-full ${
                        app.matchColor || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      Match: {app.match}
                    </span>
                    {getActionButtons(
                      app.status,
                      app,
                      updating,
                      handleStatusUpdate,
                      navigate,
                      job_id
                    )}

                    <button
                      onClick={() =>
                        navigate(
                          `/chat?jobApplicationId=${app.application_id}`,
                          {
                            state: {
                              participantId: app.applicant_user_id,
                              applicantName: app.name,
                            },
                          }
                        )
                      }
                      className="flex items-center gap-1 px-3 py-1 mt-2 text-sm text-blue-600 border border-blue-200 rounded hover:bg-blue-50"
                    >
                      <MessageSquare size={14} />
                      Message
                    </button>
                  </div>
                </div>
              ))
            )}

            {hasHiddenApps && (
              <div className="p-4 text-center border border-gray-300 border-dashed rounded-lg bg-gray-50">
                <EyeOff className="mx-auto text-gray-400" size={24} />
                <p className="mt-2 text-sm font-medium text-gray-700">
                  {filteredApps.length - freeLimit} more applicants hidden
                </p>
                <Link to="/recruiter-checkout-page?plan=pro">
                  <p className="mt-1 text-xs text-gray-500">
                    Upgrade to view and manage all applicants
                  </p>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="hidden lg:block w-[425px] max-w-[425px] p-2 sticky top-6 h-fit ml-4">
          <ApplicationFilterSidebar filters={filters} onChange={setFilters} />
        </aside>
        <div className="flex-grow hidden lg:block"></div>
      </div>
    </MainLayout>
  );
};

export default RecruiterApplication;
