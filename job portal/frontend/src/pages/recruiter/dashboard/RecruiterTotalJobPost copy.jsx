import React, { useState, useEffect, useMemo } from "react";
import { Search, Eye } from "lucide-react";
import MainLayout from "../../../components/layout/MainLayout";
import RecruiterRightSidebar from "./RecruiterRightSidebar";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";


const BASE_URL = import.meta.env.VITE_BASE_URL;

const TotalJobPosts = () => {
  const [statusFilter, setStatusFilter] = useState("All"); // for active_status: 0,1,2
  const [postTypeFilter, setPostTypeFilter] = useState("All"); // for post_type
  const [search, setSearch] = useState("");
  const [jobPosts, setJobPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [applicantCounts, setApplicantCounts] = useState({});
  const location = useLocation(); 
const [opportunityTypeFilter, setOpportunityTypeFilter] = useState("All");

  //  Filter Tabs
  const statusTabs = [
    { label: "All", value: "All" },
    { label: "Draft", value: "0" },
    { label: "Active", value: "1" },
    { label: "Inactive", value: "2" },
  ];

  // Post Type Tabs — map to backend `post_type` values
   const postTypeTabs = [
    { label: "All", value: "All" },
    { label: "Future", value: "future" },
    { label: "College-specific", value: "college" },
    { label: "Active job", value: "active" },
  ];

  const opportunityTypeTabs = [
    { label: "All", value: "All" },
    { label: "Internship", value: "Internship" },
    { label: "Project", value: "Project" },
    { label: "Job", value: "Job" },
  ];


 
  useEffect(() => {
    // If navigating from a specific dashboard (active/future/college), auto-set post_type filter
    if (location.state?.post_type) {
      setPostTypeFilter(location.state.post_type);
    }
  }, [location.state?.post_type]);

  // Fetch applicant count
  const fetchApplicantCount = async (jobId) => {
    if (applicantCounts[jobId] !== undefined) return;
    try {
      const response = await axios.get(`${BASE_URL}/jobpost/${jobId}/applicantCount`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setApplicantCounts((prev) => ({ ...prev, [jobId]: response.data.data || 0 }));
      } else {
        setApplicantCounts((prev) => ({ ...prev, [jobId]: 0 }));
      }
    } catch (err) {
      console.error(`Error fetching applicant count for job ${jobId}:`, err);
      setApplicantCounts((prev) => ({ ...prev, [jobId]: 0 }));
    }
  };

  //  Fetch job posts with BOTH filters
  useEffect(() => {
    if (!token) return;

    const fetchJobPosts = async () => {
      try {
        setLoading(true);
        setError("");

        const params = {};
        if (statusFilter !== "All") params.status = statusFilter;

        if (opportunityTypeFilter !== "All") {
          params.opportunity_type = opportunityTypeFilter;
        }


        if (postTypeFilter !== "All") {
          if (Array.isArray(postTypeFilter)) {
            params.post_type = postTypeFilter.join(",");
          } else {
            params.post_type = postTypeFilter;
          }
        }
        
        const response = await axios.get(`${BASE_URL}/company-recruiter/jobpost/list`, {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });

        if (response.data.success) {
          const jobs = response.data.data || [];
          setJobPosts(jobs);
          jobs.forEach((job) => fetchApplicantCount(job.job_id));
        } else {
          setError("Failed to fetch job posts");
        }
      } catch (err) {
        console.error("Error fetching job posts:", err);
        setError("Something went wrong!");
      } finally {
        setLoading(false);
      }
    };

    fetchJobPosts();
  }, [token, statusFilter, postTypeFilter, opportunityTypeFilter]);

  //  Apply search on top of fetched jobs
  const filteredJobs = useMemo(() => {
    if (!search) return jobPosts;
    const term = search.toLowerCase();
    return jobPosts.filter(
      (job) =>
        (job.JobRole?.title && job.JobRole.title.toLowerCase().includes(term)) ||
        (job.skill_required_note && job.skill_required_note.toLowerCase().includes(term))
    );
  }, [jobPosts, search]);

  // Accurate counts: based on *current jobPosts* (already filtered by status+type)
  const tabCounts = useMemo(() => {
    return {
      All: jobPosts.length,
      0: jobPosts.filter((j) => j.active_status === 0).length,
      1: jobPosts.filter((j) => j.active_status === 1).length,
      2: jobPosts.filter((j) => j.active_status === 2).length,
    };
  }, [jobPosts]);

  //  Post-type tab counts (for UI only — optional display)
  const postTypeTabCounts = useMemo(() => {
    return {
      All: jobPosts.length,
      future: jobPosts.filter((j) => j.post_type === "future").length,
      college: jobPosts.filter((j) => j.post_type === "college").length,
      active: jobPosts.filter((j) => j.post_type === "active").length,
    };
  }, [jobPosts]);

  return (
    <MainLayout>
      <div className="flex items-start justify-center min-h-screen px-2 bg-gray-100 lg:px-8">
        <div className="flex-grow hidden lg:block"></div>

        <div className="w-full px-6 py-5 mt-6 overflow-y-auto bg-white rounded-lg shadow-md">
          {/* w-[729px] h-[800px] commented this height width */}
          <h1 className="text-2xl font-bold">Total Job Posts</h1>
          <p className="mb-4 text-gray-500">
            {loading ? "Loading job posts..." : `You have ${jobPosts.length} job post(s).`}
          </p>

          {/* Search Bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search by job role or skill..."
              className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Search className="absolute text-gray-400 -translate-y-1/2 right-3 top-1/2" size={20} />
          </div>

          {error && <p className="mb-4 text-red-500">{error}</p>}

          {/*  Status Filter Tabs (unchanged logic, but accurate counts) */}
          <div className="flex flex-wrap hidden gap-3 mb-4 text-sm">
            {statusTabs.map((tab) => {
              const count = tab.value === "All" ? tabCounts.All : tabCounts[tab.value] || 0;
              const isActive = statusFilter === (tab.value === "All" ? "All" : tab.value);
              return (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value === "All" ? "All" : tab.value)}
                  className={`px-3 py-1 rounded-full border whitespace-nowrap ${isActive
                      ? "bg-blue-100 text-blue-600 border-blue-400"
                      : "bg-gray-100 text-gray-500 border-gray-200"
                    }`}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>

          {/*  NEW: Post Type Filter Tabs */}
          <div className="flex flex-wrap hidden gap-3 mb-6 text-sm">
            {postTypeTabs.map((tab) => {
              const tabKey = Array.isArray(tab.value)
                ? "active_job"
                : tab.value === "All"
                  ? "All"
                  : tab.value;
              const count = postTypeTabCounts[tabKey] || 0;
              const isActive = Array.isArray(tab.value)
                ? Array.isArray(postTypeFilter) && JSON.stringify(postTypeFilter) === JSON.stringify(tab.value)
                : postTypeFilter === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() =>
                    setPostTypeFilter(Array.isArray(tab.value) ? tab.value : tab.value)
                  }
                  className={`px-3 py-1 rounded-full border whitespace-nowrap ${isActive
                      ? "bg-green-100 text-green-700 border-green-400"
                      : "bg-gray-100 text-gray-500 border-gray-200"
                    }`}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>


          
          <div className="flex flex-wrap gap-3 mb-6 text-sm">
            {opportunityTypeTabs.map((tab) => {
              const count = tab.value === "All"
                ? jobPosts.length
                : jobPosts.filter((j) => j.opportunity_type === tab.value).length;

              const isActive = opportunityTypeFilter === tab.value;

              return (
                <button
                  key={tab.value}
                  onClick={() => setOpportunityTypeFilter(tab.value)}
                  className={`px-3 py-1 rounded-full border whitespace-nowrap ${isActive
                    ? "bg-purple-100 text-purple-700 border-purple-400"
                    : "bg-gray-100 text-gray-500 border-gray-200"
                    }`}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>

          {/* Job List */}
          <div className="flex flex-col gap-5">
            {loading ? (
              <p>Loading jobs...</p>
            ) : filteredJobs.length === 0 ? (
              <div className="py-10 text-center">
  <p className="mb-4 text-lg text-gray-500">
    {search ? "No job posts match your search." : "No job posts found yet."}
  </p>
  
  {/* Only show 'Post Now' button if not searching */}
  {!search && (
    <button
      onClick={() => navigate("/recruiter-post-opportunity-selector")}
      className="inline-flex items-center gap-2 px-6 py-2 font-medium text-white transition-transform transform bg-blue-600 rounded-full shadow-md hover:bg-blue-700 hover:scale-105"
    >
      <span>➕</span> Post Your First Job
    </button>
  )}
</div>
            ) : (
              filteredJobs.map((job) => (
                <div
                  key={job.job_id}
                  className="flex flex-col gap-3 p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    {/* Job Info */}
                    <div className="flex-grow">
                      <h2 className="font-semibold">{job.JobRole?.title || "Untitled Job"}</h2>

                      <div className="mt-1 space-y-1">
                        {job.internship_start_date ? (
                          <p className="text-sm text-blue-500">Posted on  {job.internship_start_date}.</p>
                        ) : (
                          <p className="text-sm text-gray-400">No start date</p>
                        )}

                        <div className="flex flex-wrap items-center gap-2">
                          {job.opportunity_type && (
                            <span className="px-2 py-1 text-xs text-blue-700 bg-blue-100 rounded">
                              {job.opportunity_type}
                            </span>
                          )}
                          {/* {job.job_type && (
                            <span className="px-2 py-1 text-xs text-gray-700 bg-gray-100 rounded">
                              {job.job_type}
                            </span>
                          )} */}
                          {job.post_type && (
                            <span className="px-2 py-1 text-xs text-gray-700 bg-yellow-100 rounded">
                              {job.post_type}
                            </span>
                          )}
                          
                          {/* hide stipend  */}
                          {/* {job.stipendText && (
                            <span className="px-2 py-1 text-xs text-green-700 bg-green-100 rounded">
                              {job.stipendText}
                            </span>
                          )} */}
                          {job.collegeCount > 0 && (
                            <span className="px-2 py-1 text-xs text-purple-700 bg-purple-100 rounded">
                              🏫 {job.collegeCount} {job.collegeCount === 1 ? "college" : "colleges"}
                            </span>
                          )}
                          {job.payment_type && (
                            <span
                              className={`px-2 py-1 text-xs rounded ${job.payment_type === "free"
                                  ? "bg-gray-200 text-gray-700"
                                  : job.payment_type === "subscription"
                                    ? "bg-blue-200 text-blue-800"
                                    : "bg-orange-200 text-orange-800"
                                }`}
                            >
                              {job.payment_type === "free"
                                ? "🎟️ Free"
                                : job.payment_type === "subscription"
                                  ? "💳 Subscription"
                                  : "🛒 One-time"}
                            </span>
                          )}
                          {/* New: job_expires */}
                          {job.job_expires && (
                            <span className="px-2 py-1 text-xs text-orange-700 bg-orange-100 rounded">
                              {/*  Expires: {job.job_expires} */}
                              📅 Expires in 30 days from posted date
                            </span>
                          )}
                        </div>
                      </div>

                      {/* View Applications / Upgrade / Edit Draft / Publish */}
                      <div className="mt-2 space-y-2">
                        {job.post_type === "active" ? (
                          <>
                            {/* Case: Draft (active_status = 0) */}
                            {(job.active_status === 0  && job.payment_type==='free')&& (
                              <button
                                className="flex items-center justify-center gap-1 px-4 py-1 text-sm text-white transition bg-blue-500 rounded-md hover:bg-blue-600"
                                onClick={() =>
                                  navigate(`/recruiter-post-job-intern-details?draftId=${job.job_id}`, {
                                    state: {
                                      job_id: job.job_id,
                                      post_type: job.post_type,
                                      title: job.JobRole?.title || "Untitled Job",
                                      collegeCount: job.collegeCount || 0,
                                    },
                                  })
                                }
                              >
                                ✏️ Edit Draft
                              </button>
                            )}

                            {/* Case: Live Free Job (active_status = 1, payment_type = "free") */}
                            {job.active_status === 1 && job.payment_type === "free" && (
                              <>
                                {/* Button 1: View Applications */}
                                <button
                                  className="px-4 py-1 text-sm text-white transition bg-red-500 rounded-md hover:bg-red-600"
                                  onClick={() =>
                                    navigate(`/recruiter-view-applications/${job.job_id}`, { state: { job } })
                                  }
                                >
                                  View applications (
                                  {applicantCounts[job.job_id] !== undefined
                                    ? applicantCounts[job.job_id]
                                    : "..."}
                                  )
                                </button>

                                {/* Button 2: Upgrade to Paid */}
                                <button
                                  className="flex items-center justify-center gap-1 px-4 py-1 text-sm text-white transition bg-blue-500 rounded-md hover:bg-blue-600"
                                  onClick={() =>
                                    navigate("/recruiter/checkout", {
                                      state: {
                                        job_id: job.job_id,
                                        post_type: job.post_type,
                                        title: job.JobRole?.title || "Untitled Job",
                                        collegeCount: job.collegeCount || 0,
                                      },
                                    })
                                  }
                                >
                                  💳 Upgrade to Paid
                                </button>
                              </>
                            )}

                            {/* Case: Live Paid Job (active_status = 1, paid) */}
                            {job.active_status === 1 &&
                              (job.payment_type === "one_time" || job.payment_type === "subscription") && (
                                <button
                                  className="px-4 py-1 text-sm text-white transition bg-red-500 rounded-md hover:bg-red-600"
                                  onClick={() =>
                                    navigate(`/recruiter-view-applications/${job.job_id}`, { state: { job } })
                                  }
                                >
                                  View applications (
                                  {applicantCounts[job.job_id] !== undefined
                                    ? applicantCounts[job.job_id]
                                    : "..."}
                                  )
                                </button>
                              )}

                            {/* Case: Inactive Free Job (active_status = 2, payment_type = "free") */}
                            {((job.active_status === 2 || job.active_status === 0) && !job.payment_type)  && (
                              <button
                                className="flex items-center justify-center gap-1 px-4 py-1 text-sm text-white transition bg-green-500 rounded-md hover:bg-green-600"
                                onClick={() => {
                                  navigate(`/recruiter/job-posting/plan?jobId=${job.job_id}`);
                                }}
                              >
                                🚀 Publish Live
                              </button>
                            )}
                          </>
                        ) : (
                          //  Original logic for non-"active" jobs (future, college)
                          <>
                            {/* View Applications — only if NOT free */}
                            {(job.payment_type !== "free" && job.payment_type !== "free_promo") && (
                              <button
                                className="px-4 py-1 text-sm text-white transition bg-red-500 rounded-md hover:bg-red-600"
                                onClick={() =>
                                  navigate(`/recruiter-view-applications/${job.job_id}`, { state: { job } })
                                }
                              >
                                View applications (
                                {applicantCounts[job.job_id] !== undefined
                                  ? applicantCounts[job.job_id]
                                  : "..."}
                                )
                              </button>
                            )}

                            {/* Edit Draft — if draft */}
                            {job.active_status === 0 && (
                              <button
                                className="flex items-center justify-center gap-1 px-4 py-1 text-sm text-white transition bg-blue-500 rounded-md hover:bg-blue-600"
                                onClick={() =>
                                  navigate(`/recruiter-post-job-intern-details?draftId=${job.job_id}`, {
                                    state: {
                                      job_id: job.job_id,
                                      post_type: job.post_type,
                                      title: job.JobRole?.title || "Untitled Job",
                                      collegeCount: job.collegeCount || 0,
                                    },
                                  })
                                }
                              >
                                ✏️ Edit Draft
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/*  Replace status badge with "View Details" button */}
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => {
                          if (job.active_status === 0) {
                            navigate(`/recruiter-post-job-intern-details?draftId=${job.job_id}`, {
                              state: { job },
                            });
                          } else {
                            navigate(`/recruiter/jobs/${job.job_id}`, { state: { job } });
                          }
                        }}
                        className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 border border-blue-200 rounded-md bg-blue-50 hover:bg-blue-100"
                      >
                        <Eye size={16} /> View Details
                      </button>

                      {/* <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Eye size={16} /> {job.views?.toLocaleString() || 0} views
                      </div> */}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* <aside className="hidden lg:block w-[425px] max-w-[425px] p-2 sticky top-4 h-fit ml-4">
          <RecruiterRightSidebar />
        </aside> */}

        <div className="flex-grow hidden lg:block"></div>
      </div>
    </MainLayout>
  );
};

export default TotalJobPosts;