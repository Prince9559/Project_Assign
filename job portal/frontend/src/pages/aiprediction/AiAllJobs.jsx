// import React, { useState, useEffect, useMemo, useRef } from "react";
// import Header from "../../components/shared/Header";
// import {
//   FaSearch,
//   FaBuilding,
//   FaMapMarkerAlt,
//   FaUserTie,
//   FaMoneyBillWave,
//   FaBriefcase,
//   FaFilter,
//   FaTimes,
//   FaArrowUp,
//   FaGraduationCap,
// } from "react-icons/fa";
// import { Link, useSearchParams, useNavigate } from "react-router-dom";
// import { useGetJobApi } from "../../hooks/useGetJobApi";
// import { useMasterData } from "../../hooks/master/useMasterData";
// import { Input, Button, Loader, Checkbox, Badge } from "../../components/ui";
// import { getImageUrl } from "../../../utils.js";
// import Select from "react-select";


// // Helper to safely parse integers
// const safeInt = (val, fallback = undefined) => {
//   const num = parseInt(val, 10);
//   return isNaN(num) ? fallback : num;
// };

// const getCityFromLocation = (fullLocation) => {
//   return fullLocation ? fullLocation.split(",")[0].trim() : "";
// };

// export default function AiAllJobs() {
//   const { allJobs, loading, error, refetch, pagination } = useGetJobApi();
//   const {
//     companies,
//     jobRoles,
//     locations,
//     isLoading: isMasterDataLoading,
//   } = useMasterData();

//   const [isFiltersOpen, setIsFiltersOpen] = useState(false);
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [showBackToTop, setShowBackToTop] = useState(false);

//   const navigate = useNavigate();

//   const handleJobSelectForAI = (jobId) => {
//     navigate("/ai-learning", {
//       state: {
//         strategy: "job",
//         jobId: jobId,
//       },
//     });
//   };

//   // Back to top scroll listener
//   useEffect(() => {
//     const handleScroll = () => {
//       setShowBackToTop(window.scrollY > 400);
//     };
//     window.addEventListener("scroll", handleScroll);
//     return () => window.removeEventListener("scroll", handleScroll);
//   }, []);

//   // Initialize filters from URL
//   const initFiltersFromUrl = () => {
//     const jobProfile = searchParams.get("jobProfile") || "";
//     const location = searchParams.get("location") || "";
//     const company = searchParams.get("company") || "";
//     const minSalary = searchParams.get("minSalary") || "";
//     const maxSalary = searchParams.get("maxSalary") || "";
//     const opportunityType = searchParams.getAll("opportunityType");
//     const jobType = searchParams.getAll("jobType");
//     const sortBy = searchParams.get("sortBy") || "relevance"; // default
//     const sortOrder = searchParams.get("sortOrder") || "desc";
//     const offset = safeInt(searchParams.get("offset"), 0);
//     const targetedOnly = searchParams.get("targetedOnly") === "1";

//     return {
//       jobProfile: jobProfile ? jobProfile.split(",").filter(Boolean) : [],
//       location: location ? location.split(",").filter(Boolean) : [],
//       company: company ? company.split(",").filter(Boolean) : [],
//       minSalary,
//       maxSalary,
//       opportunityType,
//       jobType,
//       targetedOnly,
//       sortBy,
//       sortOrder,
//       offset,
//     };
//   };

//   const [filters, setFilters] = useState(initFiltersFromUrl);

//   // Apply filters → update URL
//   const applyFilters = () => {
//     const nextParams = new URLSearchParams();

//     if (filters.jobProfile.length > 0)
//       nextParams.set("jobProfile", filters.jobProfile.join(","));
//     if (filters.location.length > 0)
//       nextParams.set("location", filters.location.join(","));
//     if (filters.company.length > 0)
//       nextParams.set("company", filters.company.join(","));
//     if (filters.minSalary) nextParams.set("minSalary", filters.minSalary);
//     if (filters.maxSalary) nextParams.set("maxSalary", filters.maxSalary);
//     if (filters.targetedOnly) nextParams.set("targetedOnly", "1");


//     filters.opportunityType.forEach((type) =>
//       nextParams.append("opportunityType", type)
//     );
//     filters.jobType.forEach((type) => nextParams.append("jobType", type));

//     //nextParams.set("page", "1"); // reset to page 1 removed the pagination logic

//     nextParams.set("sortBy", filters.sortBy);
//     nextParams.set("sortOrder", filters.sortOrder);
//     nextParams.set("offset", "0"); // reset scroll when filters change

//     setSearchParams(nextParams);
//   };

//   const clearFilters = () => {
//     setFilters({
//       jobProfile: [],
//       location: [],
//       company: [],
//       minSalary: "",
//       maxSalary: "",
//       opportunityType: [],
//       jobType: [],
//     });
//     setSearchParams({}, { replace: true });
//   };

//   // Fetch jobs when URL changes
//   useEffect(() => {
//     const currentFilters = initFiltersFromUrl();
//     setFilters(currentFilters);

//     const selectedFullLocations = currentFilters.location
//       .map((city) => {
//         return locations.find(
//           (loc) =>
//             loc.name.startsWith(city) || getCityFromLocation(loc.name) === city
//         )?.name;
//       })
//       .filter(Boolean);

//     const apiFilters = {
//       jobProfile:
//         currentFilters.jobProfile.length > 0
//           ? currentFilters.jobProfile.join(",")
//           : undefined,
//       location:
//         selectedFullLocations.length > 0
//           ? selectedFullLocations.join(",")
//           : undefined,
//       company:
//         currentFilters.company.length > 0
//           ? currentFilters.company.join(",")
//           : undefined,
//       minSalary: safeInt(currentFilters.minSalary),
//       maxSalary: safeInt(currentFilters.maxSalary),
//       opportunityType:
//         currentFilters.opportunityType.length > 0
//           ? currentFilters.opportunityType.join(",")
//           : undefined,
//       jobType:
//         currentFilters.jobType.length > 0
//           ? currentFilters.jobType.join(",")
//           : undefined,
//       targetedOnly: filters.targetedOnly ? "1" : undefined,
//       sortBy: currentFilters.sortBy,
//       sortOrder: currentFilters.sortOrder,
//       offset: currentFilters.offset,
//       limit: 20,
//     };

//     refetch(apiFilters);
//   }, [searchParams]); // ← this triggers on offset/sort/filter changes

//   const toggleFilters = () => {
//     setIsFiltersOpen(!isFiltersOpen);
//   };

//   const handleInputChange = (field, value) => {
//     setFilters((prev) => ({ ...prev, [field]: value }));
//   };

//   const handleMultiChange = (field, selectedOptions) => {
//     const values = selectedOptions
//       ? selectedOptions.map((opt) => opt.value)
//       : [];
//     setFilters((prev) => ({ ...prev, [field]: values }));
//   };

//   const handleLocationChange = (selectedOptions) => {
//     const cities = selectedOptions
//       ? selectedOptions.map((opt) => getCityFromLocation(opt.value))
//       : [];
//     setFilters((prev) => ({ ...prev, location: cities }));
//   };

//   const toggleOpportunityType = (type) => {
//     setFilters((prev) => {
//       const current = prev.opportunityType || [];
//       if (current.includes(type)) {
//         return { ...prev, opportunityType: current.filter((t) => t !== type) };
//       } else {
//         return { ...prev, opportunityType: [...current, type] };
//       }
//     });
//   };

//   const toggleJobType = (type) => {
//     setFilters((prev) => {
//       const current = prev.jobType || [];
//       if (current.includes(type)) {
//         return { ...prev, jobType: current.filter((t) => t !== type) };
//       } else {
//         return { ...prev, jobType: [...current, type] };
//       }
//     });
//   };

//   const sentinelRef = useRef(null);

//   // Fetch more when sentinel is in view
//   useEffect(() => {
//     if (loading || !pagination || allJobs.length >= pagination.total) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting) {
//           // Load next batch
//           const nextOffset = allJobs.length;
//           const newParams = new URLSearchParams(searchParams);
//           newParams.set("offset", nextOffset);
//           setSearchParams(newParams, { replace: true });
//         }
//       },
//       { threshold: 1.0 }
//     );

//     if (sentinelRef.current) {
//       observer.observe(sentinelRef.current);
//     }

//     return () => {
//       if (sentinelRef.current) {
//         observer.unobserve(sentinelRef.current);
//       }
//     };
//   }, [loading, pagination, allJobs.length, searchParams]);

//   // // Pagination
//   // const currentPage = safeInt(searchParams.get("page"), 1);
//   // const totalPages = pagination ? Math.ceil(pagination.total / 20) : 1;

//   // const goToPage = (page) => {
//   //   if (page < 1 || page > totalPages) return;
//   //   const newParams = new URLSearchParams(searchParams);
//   //   newParams.set("page", page);
//   //   setSearchParams(newParams);
//   // };

//   // Master data options
//   const companyOptions = useMemo(
//     () =>
//       companies.map((c) => ({ label: c.company_name, value: c.company_name })),
//     [companies]
//   );
//   const jobRoleOptions = useMemo(
//     () => jobRoles.map((r) => ({ label: r.title, value: r.title })),
//     [jobRoles]
//   );
//   const locationOptions = useMemo(
//     () => locations.map((l) => ({ label: l.name, value: l.name })),
//     [locations]
//   );

//   // react-select styles (smaller height)
//   const selectStyles = {
//     control: (base) => ({
//       ...base,
//       minHeight: "36px",
//       fontSize: "0.875rem",
//     }),
//     input: (base) => ({ ...base, fontSize: "0.875rem" }),
//     option: (base) => ({ ...base, fontSize: "0.875rem" }),
//     multiValue: (base) => ({ ...base, fontSize: "0.875rem" }),
//   };

//   return (
//     <div className="bg-[#f5f6f7] min-h-screen relative">
//       <Header />
//       <div className="px-3 pt-2 pb-4 mx-auto max-w-7xl sm:pt-3 md:pt-4 lg:pt-6 sm:pb-6 sm:px-4 md:px-6 lg:px-8">
//         {/* Mobile Filter Toggle */}
//         <div className="mb-3 lg:hidden sm:mb-4">
//           <Button
//             onClick={toggleFilters}
//             variant="outline"
//             size="default"
//             className="flex items-center justify-center w-full gap-2 px-4 py-3 transition-colors bg-white border border-gray-200 shadow rounded-xl hover:bg-gray-50"
//           >
//             {isFiltersOpen ? (
//               <>
//                 <FaTimes className="text-sm text-gray-600" />
//                 <span className="text-sm font-medium">Close Filters</span>
//               </>
//             ) : (
//               <>
//                 <FaFilter className="text-sm text-gray-600" />
//                 <span className="text-sm font-medium">Show Filters</span>
//               </>
//             )}
//           </Button>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-3 sm:gap-4 lg:gap-2 mx-2 sm:mx-4">
//           {/* Left: Job Filters */}
//           <aside
//             className={`bg-white rounded-2xl shadow border border-gray-100 p-4 sm:p-5 lg:p-6 flex flex-col gap-1 sm:gap-5 self-start ${
//               isFiltersOpen ? "block" : "hidden lg:flex"
//             } lg:min-h-[calc(100vh-120px)]`}
//           >
//             <div>
//               <h2 className="mb-2 text-lg font-extrabold text-gray-900 sm:text-xl lg:text-2xl">
//                 Job Filters
//               </h2>
//               <p className="text-sm text-gray-500">
//                 Help us match you with the best career opportunities
//               </p>
//             </div>

//             <div className="flex flex-col flex-1 gap-4">
//               {/* Opportunity type */}
//               <div className="flex flex-col gap-2">
//                 <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//                   Opportunity Type
//                 </label>
//                 <div className="flex flex-wrap gap-2">
//                   <Checkbox
//                     checked={filters.opportunityType.includes("internship")}
//                     onChange={() => toggleOpportunityType("internship")}
//                     label="Internship"
//                     className="flex items-center gap-2 p-0 text-sm font-medium bg-transparent border-0"
//                   />
//                   <Checkbox
//                     checked={filters.opportunityType.includes("job")}
//                     onChange={() => toggleOpportunityType("job")}
//                     label="Job"
//                     className="flex items-center gap-2 p-0 text-sm font-medium bg-transparent border-0"
//                   />
//                   <Checkbox
//                     checked={filters.opportunityType.includes("project")}
//                     onChange={() => toggleOpportunityType("project")}
//                     label="Project"
//                     className="flex items-center gap-2 p-0 text-sm font-medium bg-transparent border-0"
//                   />
//                 </div>
//               </div>

//               {/* Profile */}
//               <div className="flex flex-col gap-2">
//                 <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//                   <FaBriefcase className="text-gray-400" /> Profile
//                 </label>
//                 {isMasterDataLoading ? (
//                   <Loader message="Loading..." />
//                 ) : (
//                   <Select
//                     isMulti
//                     options={jobRoleOptions}
//                     value={jobRoleOptions.filter((opt) =>
//                       filters.jobProfile.includes(opt.value)
//                     )}
//                     onChange={(opts) => handleMultiChange("jobProfile", opts)}
//                     placeholder="Search job profiles..."
//                     className="w-full text-sm"
//                     classNamePrefix="select"
//                     styles={selectStyles}
//                     isClearable
//                     isSearchable
//                   />
//                 )}
//               </div>
              

//               <div className="flex flex-col gap-2">
//                 <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//                   <FaMapMarkerAlt className="text-gray-400" /> Location
//                 </label>
//                 {isMasterDataLoading ? (
//                   <Loader message="Loading..." />
//                 ) : (
//                   <Select
//                     isMulti
//                     options={locationOptions}
//                     value={locationOptions.filter((opt) =>
//                       filters.location.includes(getCityFromLocation(opt.value))
//                     )}
//                     onChange={handleLocationChange} // ← changed
//                     placeholder="Search locations..."
//                     className="w-full text-sm"
//                     classNamePrefix="select"
//                     styles={selectStyles}
//                     isClearable
//                     isSearchable
//                   />
//                 )}
//                 <div className="flex flex-wrap gap-2 mt-2">
//                   <Checkbox
//                     checked={filters.jobType.includes("remote")}
//                     onChange={() => toggleJobType("remote")}
//                     label="Remote"
//                     className="flex items-center gap-2 p-0 text-sm font-medium bg-transparent border-0"
//                   />
//                   <Checkbox
//                     checked={filters.jobType.includes("hybrid")}
//                     onChange={() => toggleJobType("hybrid")}
//                     label="Hybrid"
//                     className="flex items-center gap-2 p-0 text-sm font-medium bg-transparent border-0"
//                   />
//                   <Checkbox
//                     checked={filters.jobType.includes("in office")}
//                     onChange={() => toggleJobType("in office")}
//                     label="In Office"
//                     className="flex items-center gap-2 p-0 text-sm font-medium bg-transparent border-0"
//                   />
//                 </div>
//               </div>

//               {/* Years of experience — kept as requested */}
//               {/* 
//               <div className="flex flex-col gap-2">
//                 <Input
//                   label={
//                     <span className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//                       <FaUserTie className="text-gray-400" /> Years of experience
//                     </span>
//                   }
//                   placeholder="Total experience"
//                   aria-label="Years of experience"
//                   size="small"
//                   className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
//                 />
//               </div>
//               */}

//               <div className="flex flex-col gap-2">
//                 <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//                   <FaBuilding className="text-gray-400" /> Company
//                 </label>
//                 {isMasterDataLoading ? (
//                   <Loader message="Loading..." />
//                 ) : (
//                   <Select
//                     isMulti
//                     options={companyOptions}
//                     value={companyOptions.filter((opt) =>
//                       filters.company.includes(opt.value)
//                     )}
//                     onChange={(opts) => handleMultiChange("company", opts)}
//                     placeholder="Search companies..."
//                     className="w-full text-sm"
//                     classNamePrefix="select"
//                     styles={selectStyles}
//                     isClearable
//                     isSearchable
//                   />
//                 )}
//               </div>

//               {/* Salary */}
//               <div className="flex flex-col gap-2">
//                 <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//                   <FaMoneyBillWave className="text-gray-400" /> Annual Salary
//                   (in lakhs)
//                 </label>
//                 <Input
//                   placeholder="Min (e.g. 300000)"
//                   value={filters.minSalary}
//                   onChange={(e) =>
//                     handleInputChange("minSalary", e.target.value)
//                   }
//                   type="number"
//                   aria-label="Min Salary"
//                   size="small"
//                   className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
//                 />
//                 {/* <Input
//                   placeholder="Max (e.g. 800000)"
//                   value={filters.maxSalary}
//                   onChange={(e) => handleInputChange("maxSalary", e.target.value)}
//                   type="number"
//                   aria-label="Max Salary"
//                   size="small"
//                   className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
//                 /> */}
//               </div>

//               {/* College-targeted filter */}
//               <div className="flex items-center gap-2 pt-1">
//                 <Checkbox
//                   checked={filters.targetedOnly}
//                   onChange={(e) =>
//                     setFilters((prev) => ({
//                       ...prev,
//                       targetedOnly: e.target.checked,
//                     }))
//                   }
//                   label={
//                     <span className="flex items-center gap-1">
//                       <FaGraduationCap className="text-blue-500" size={18} />
//                       Only jobs for your college
//                     </span>
//                   }
//                   className="flex items-center gap-2 p-0 font-medium bg-transparent border-0 text-m"
//                 />
//                 <span
//                   className="text-gray-500 text-s cursor-help"
//                   title="Jobs where your college is explicitly selected by the recruiter."
//                 >
//                   ⓘ
//                 </span>
//               </div>
//             </div>

//             <div className="flex flex-col items-center justify-between gap-3 pt-2 mt-4 border-t border-gray-100 sm:flex-row">
//               <button
//                 onClick={clearFilters}
//                 className="w-full text-sm font-semibold text-center text-blue-500 transition-colors hover:underline sm:w-auto"
//                 aria-label="Clear all filters"
//               >
//                 Clear all
//               </button>
//               <Button
//                 onClick={applyFilters}
//                 variant="primary"
//                 size="small"
//                 className="bg-[#ff4d3d] hover:bg-[#e63c2a] transition-colors text-white rounded-full px-6 py-2.5 font-semibold text-sm shadow focus:ring-2 focus:ring-red-200 w-full sm:w-auto"
//                 aria-label="Apply filters"
//               >
//                 Apply
//               </Button>
//             </div>
//           </aside>

//           {/* Right: Jobs List */}
//           <main className="bg-white rounded-2xl shadow border border-gray-100 p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col min-h-[80vh]">
//             <header className="mb-5 sm:mb-6">
//               <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//                 <div>
//                   <h2 className="text-xl font-extrabold text-gray-900 sm:text-2xl lg:text-3xl">
//                     Jobs
//                   </h2>
//                   <p className="mt-1 text-sm text-gray-500 sm:text-base">
//                     Start applying to the latest job vacancies at the leading companies in India.
//                   </p>
//                 </div>

//                 {/* HIGH-VISIBILITY "My Applications" BUTTON — always visible, prominent */}
//                 <Link
//                   to="/student-applications"
//                   className="flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
//                   aria-label="View your job applications"
//                 >
//                   <FaUserTie className="text-white" />
//                   <span>My Applications</span>
//                 </Link>
//               </div>

//               {/* Optional: subtle note (only if space allows) */}
//               {/* <p className="mt-2 text-xs text-gray-400">
//     Check application status, interview schedule & offers
//   </p> */}
//             </header>

//             {/* Sort Controls */}
//             <div className="flex items-center justify-between mb-4">
//               <div className="text-sm text-gray-600">
//                 {pagination?.total} opportunities
//               </div>
//               <div className="flex items-center gap-2">
//                 <label
//                   htmlFor="sort-by"
//                   className="text-sm font-medium text-gray-700"
//                 >
//                   Sort by:
//                 </label>
//                 <select
//                   id="sort-by"
//                   value={`${filters.sortBy}-${filters.sortOrder}`}
//                   onChange={(e) => {
//                     const [sortBy, sortOrder] = e.target.value.split("-");
//                     setFilters((prev) => ({
//                       ...prev,
//                       sortBy,
//                       sortOrder,
//                     }));
//                   }}
//                   className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   <option value="relevance-desc">
//                     Relevance (Targeted first)
//                   </option>
//                   <option value="postedAt-desc">Posted Date (Newest)</option>
//                   <option value="postedAt-asc">Posted Date (Oldest)</option>
//                   <option value="matchPercentage-desc">
//                     Match % (High to Low)
//                   </option>
//                   <option value="matchPercentage-asc">
//                     Match % (Low to High)
//                   </option>
//                 </select>
//               </div>
//             </div>

//             {/* Job Cards */}
//             <section className="flex flex-col gap-3 sm:gap-4 lg:gap-6">
//               {loading && (
//                 <div className="py-8 text-center sm:py-12">
//                   <Loader message="Loading jobs..." />
//                 </div>
//               )}

//               {error && (
//                 <div className="py-8 text-center sm:py-12">
//                   <p className="mb-4 text-sm text-red-500 sm:text-base">
//                     Error loading jobs: {error}
//                   </p>
//                   <Button
//                     onClick={() => refetch()}
//                     variant="secondary"
//                     size="small"
//                     className="px-4 py-2 text-sm text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
//                   >
//                     Try Again
//                   </Button>
//                 </div>
//               )}

//               {!loading &&
//                 !error &&
//                 allJobs &&
//                 allJobs.length > 0 &&
//                 allJobs.map((job) => (
//                   // <Link
//                   //   key={job.job_id}
//                   //   to={`/jobs/${job.job_id}`}
                    
//                   //   className="no-underline"
//                   // >

                  
//                   <div
//                     key={job.job_id}
//                     onClick={() => handleJobSelectForAI(job.job_id)}
//                     className="no-underline cursor-pointer"
//                     role="button"
//                     tabIndex={0}
//                     onKeyDown={(e) => e.key === 'Enter' && handleJobSelectForAI(job.job_id)}
//                   >
//                     <article
//                       className={`relative flex flex-col gap-3 p-4 transition-all duration-200 bg-white border shadow-sm cursor-pointer sm:flex-row sm:items-center sm:gap-4 lg:gap-6 rounded-xl sm:p-5 lg:p-6 hover:shadow-lg group
//     ${
//       job.is_targeted_to_user_college
//         ? "border-blue-300 hover:border-blue-400"
//         : "border-gray-200 hover:border-blue-200"
//     }`}
//                       tabIndex={0}
//                       aria-label={`Job: ${job.jobRole} at ${job.company_name}`}
//                     >
//                       {job.skill_missing && (
//                         <div className="absolute z-10 -top-2 sm:-top-3 left-4">
//                           <Link
//                             to="/ai-prediction"
//                             className="inline-block"
//                             onClick={(e) => e.stopPropagation()}
//                           >
//                             <Badge
//                               color="bg-blue-600 text-white hover:bg-blue-700"
//                               text="skills required ?"
//                               className="text-xs font-semibold border border-blue-700 shadow-lg cursor-pointer"
//                             />
//                           </Link>
//                         </div>
//                       )}

//                       {job.is_targeted_to_user_college && (
//                         <div className="absolute z-10 -top-2 sm:-top-3 right-4">
//                           <span
//                             className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-blue-600 rounded-full shadow-md animate-college-badge"
//                             title="This job is specifically posted for students from your college."
//                           >
//                             <FaGraduationCap className="text-white" size={12} />
//                             For Your College
//                           </span>
//                         </div>
//                       )}

//                       <div className="flex-shrink-0">
//                         <img
//                           src={getImageUrl(job.logo_url)}
//                           alt={`${job.company_name} logo`}
//                           className="object-contain w-12 h-12 bg-gray-100 border border-gray-200 rounded-lg sm:w-14 sm:h-14 lg:w-16 lg:h-16"
//                         />
//                       </div>

//                       <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
//                         <div>
//                           <h3 className="text-base font-bold leading-tight text-gray-900 transition-colors sm:text-lg lg:text-xl group-hover:text-blue-600">
//                             {job.jobRole}
//                           </h3>
//                           <p className="text-sm font-semibold">
//                             {job.company_name}
//                           </p>
//                         </div>

//                         <div className="flex flex-wrap gap-2 sm:gap-3">
//                           <Badge
//                             color="bg-gray-100 text-gray-700 hover:bg-gray-200"
//                             className="text-xs border border-gray-200"
//                           >
//                             <FaMapMarkerAlt className="text-xs text-gray-400" />
//                             <span className="truncate">
//                               {job.company_location}
//                             </span>
//                           </Badge>
//                           {job.experience && (
//                             <Badge
//                               color="bg-gray-100 text-gray-700 hover:bg-gray-200"
//                               className="text-xs border border-gray-200"
//                             >
//                               <FaUserTie className="flex-shrink-0 text-xs text-gray-400" />
//                               <span className="truncate">
//                                 {(() => {
//                                   const words = job.experience.split(" ");
//                                   return words.length > 4
//                                     ? words.slice(0, 4).join(" ") + "..."
//                                     : job.experience;
//                                 })()}
//                               </span>
//                             </Badge>
//                           )}

//                           {job.salary && (
//                             <Badge
//                               color="bg-gray-100 text-gray-700 hover:bg-gray-200"
//                               className="text-xs border border-gray-200"
//                             >
//                               <span className="truncate">
//                                 INR: {job.salary}
//                               </span>
//                             </Badge>
//                           )}
//                         </div>
//                       </div>

//                       <div className="flex flex-col items-start sm:items-end gap-2 sm:gap-3 min-w-[120px] sm:min-w-[140px] lg:min-w-[160px]">
//                         <Badge
//                           color={
//                             job.hiring_status === "Actively Hiring"
//                               ? "bg-red-500 text-white hover:bg-red-600"
//                               : "bg-green-500 text-white hover:bg-green-600"
//                           }
//                           text={job.hiring_status}
//                           className="text-sm font-semibold border border-gray-200 shadow-lg"
//                         />
//                         <Badge
//                           color="bg-gray-100 text-gray-700 hover:bg-gray-200"
//                           className="text-sm font-semibold border border-gray-200"
//                         >
//                           {job.posted_days_ago}
//                         </Badge>

//                         {/* === MANDATORY & PREFERRED SKILL BADGES === */}
// <div className="flex flex-col items-start w-full gap-1 sm:items-end">
//   {/* Mandatory Skills */}
//   <div className="relative group">
//     <span
//       className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
//         job.mandatorySkillsMet
//           ? "bg-green-100 text-green-800 border border-green-200"
//           : "bg-red-100 text-red-800 border border-red-200"
//       }`}
//     >
//       {job.mandatorySkillsMet ? "Must Have Skills ✅ Yes" : "Must Have Skills ❌ No"}
//     </span>
//     <div className="absolute z-10 hidden px-2 py-1 text-xs text-white transform -translate-x-1/2 bg-gray-800 rounded shadow -top-8 left-1/2 group-hover:block whitespace-nowrap">
//       All mandatory skills required for this job
//     </div>
//   </div>

//   {/* Preferred Skills Match */}
//   {typeof job.preferredSkillMatch === "number" && (
//     <div className="relative group">
//       <span
//         className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full border ${
//           job.preferredSkillMatch >= 80
//             ? "bg-blue-100 text-blue-800 border-blue-200"
//             : job.preferredSkillMatch >= 50
//             ? "bg-yellow-100 text-yellow-800 border-yellow-200"
//             : "bg-gray-100 text-gray-800 border-gray-200"
//         }`}
//       >
//         Preferred Skills Match :🎯 {Math.round(job.preferredSkillMatch)}%
//       </span>
//       <div className="absolute z-10 hidden px-2 py-1 text-xs text-white transform -translate-x-1/2 bg-gray-800 rounded shadow -top-8 left-1/2 group-hover:block whitespace-nowrap">
//         Match on preferred (nice-to-have) skills
//       </div>
//     </div>
//   )}
// </div>
                       
//                       </div>
//                     </article>
//                   </div>
//                 ))}

//               {!loading && !error && (!allJobs || allJobs.length === 0) && (
//                 <div className="py-12 text-center sm:py-16">
//                   <p className="text-lg text-gray-500">No jobs found.</p>
//                 </div>
//               )}
//               {/* Infinite scroll sentinel */}
//               {!loading &&
//                 allJobs?.length > 0 &&
//                 pagination &&
//                 allJobs.length < pagination.total && (
//                   <div className="py-4 text-center">
//                     <Loader message="Loading more jobs..." />
//                   </div>
//                 )}
//               <div
//                 ref={sentinelRef}
//                 style={{ height: "1px", margin: 0, padding: 0 }}
//               />
//             </section>

//             {/* Pagination
//             {pagination && totalPages > 1 && (
//               <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-100">
//                 <Button
//                   onClick={() => goToPage(currentPage - 1)}
//                   disabled={currentPage === 1}
//                   variant="outline"
//                   size="small"
//                   className="px-4 py-2"
//                 >
//                   Prev
//                 </Button>

//                 <div className="flex gap-1">
//                   {[...Array(Math.min(totalPages, 5))].map((_, i) => {
//                     const pageNum = i + 1;
//                     return (
//                       <button
//                         key={pageNum}
//                         onClick={() => goToPage(pageNum)}
//                         className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded ${
//                           currentPage === pageNum
//                             ? "bg-blue-500 text-white"
//                             : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                         }`}
//                       >
//                         {pageNum}
//                       </button>
//                     );
//                   })}
//                   {totalPages > 5 && (
//                     <span className="flex items-center justify-center w-8 h-8 text-sm text-gray-500">...</span>
//                   )}
//                 </div>

//                 <Button
//                   onClick={() => goToPage(currentPage + 1)}
//                   disabled={currentPage === totalPages}
//                   variant="outline"
//                   size="small"
//                   className="px-4 py-2"
//                 >
//                   Next
//                 </Button>
//               </div>
//             )} */}
//           </main>
//         </div>
//       </div>

//       {/* Back to Top Button */}
//       {showBackToTop && (
//         <button
//           onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
//           className="fixed z-10 p-2 text-white transition-colors bg-red-500 rounded-full shadow-lg bottom-6 right-6 hover:bg-red-600"
//           aria-label="Back to top"
//         >
//           <FaArrowUp />
//         </button>
//       )}
//     </div>
//   );
// }
















import React, { useState, useEffect, useMemo, useRef } from "react";
import Header from "../../components/shared/Header";
import {
  FaSearch,
  FaBuilding,
  FaMapMarkerAlt,
  FaUserTie,
  FaMoneyBillWave,
  FaBriefcase,
  FaFilter,
  FaTimes,
  FaArrowUp,
  FaGraduationCap,
} from "react-icons/fa";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useGetJobApi } from "../../hooks/useGetJobApi";
import { useMasterData } from "../../hooks/master/useMasterData";
import { Input, Button, Loader, Checkbox, Badge } from "../../components/ui";
import { getImageUrl } from "../../../utils.js";
import Select from "react-select";


// Helper to safely parse integers
const safeInt = (val, fallback = undefined) => {
  const num = parseInt(val, 10);
  return isNaN(num) ? fallback : num;
};

const getCityFromLocation = (fullLocation) => {
  return fullLocation ? fullLocation.split(",")[0].trim() : "";
};

export default function AiAllJobs() {
  const { allJobs, loading, error, refetch, pagination } = useGetJobApi();
  const {
    companies,
    jobRoles,
    locations,
    isLoading: isMasterDataLoading,
  } = useMasterData();

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showBackToTop, setShowBackToTop] = useState(false);

  const navigate = useNavigate();

  const handleJobSelectForAI = (jobId) => {
    navigate("/ai-learning", {
      state: {
        strategy: "job",
        jobId: jobId,
      },
    });
  };

  // Back to top scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initialize filters from URL
  const initFiltersFromUrl = () => {
    const jobProfile = searchParams.get("jobProfile") || "";
    const location = searchParams.get("location") || "";
    const company = searchParams.get("company") || "";
    const minSalary = searchParams.get("minSalary") || "";
    const maxSalary = searchParams.get("maxSalary") || "";
    const opportunityType = searchParams.getAll("opportunityType");
    const jobType = searchParams.getAll("jobType");
    const sortBy = searchParams.get("sortBy") || "relevance"; // default
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const offset = safeInt(searchParams.get("offset"), 0);
    const targetedOnly = searchParams.get("targetedOnly") === "1";

    return {
      jobProfile: jobProfile ? jobProfile.split(",").filter(Boolean) : [],
      location: location ? location.split(",").filter(Boolean) : [],
      company: company ? company.split(",").filter(Boolean) : [],
      minSalary,
      maxSalary,
      opportunityType,
      jobType,
      targetedOnly,
      sortBy,
      sortOrder,
      offset,
    };
  };

  const [filters, setFilters] = useState(initFiltersFromUrl);

  // Apply filters → update URL
  const applyFilters = () => {
    const nextParams = new URLSearchParams();

    if (filters.jobProfile.length > 0)
      nextParams.set("jobProfile", filters.jobProfile.join(","));
    if (filters.location.length > 0)
      nextParams.set("location", filters.location.join(","));
    if (filters.company.length > 0)
      nextParams.set("company", filters.company.join(","));
    if (filters.minSalary) nextParams.set("minSalary", filters.minSalary);
    if (filters.maxSalary) nextParams.set("maxSalary", filters.maxSalary);
    if (filters.targetedOnly) nextParams.set("targetedOnly", "1");


    filters.opportunityType.forEach((type) =>
      nextParams.append("opportunityType", type)
    );
    filters.jobType.forEach((type) => nextParams.append("jobType", type));

    //nextParams.set("page", "1"); // reset to page 1 removed the pagination logic

    nextParams.set("sortBy", filters.sortBy);
    nextParams.set("sortOrder", filters.sortOrder);
    nextParams.set("offset", "0"); // reset scroll when filters change

    setSearchParams(nextParams);
  };

  const clearFilters = () => {
    setFilters({
      jobProfile: [],
      location: [],
      company: [],
      minSalary: "",
      maxSalary: "",
      opportunityType: [],
      jobType: [],
    });
    setSearchParams({}, { replace: true });
  };

  // Fetch jobs when URL changes
  useEffect(() => {
    const currentFilters = initFiltersFromUrl();
    setFilters(currentFilters);

    const selectedFullLocations = currentFilters.location
      .map((city) => {
        return locations.find(
          (loc) =>
            loc.name.startsWith(city) || getCityFromLocation(loc.name) === city
        )?.name;
      })
      .filter(Boolean);

    const apiFilters = {
      jobProfile:
        currentFilters.jobProfile.length > 0
          ? currentFilters.jobProfile.join(",")
          : undefined,
      location:
        selectedFullLocations.length > 0
          ? selectedFullLocations.join(",")
          : undefined,
      company:
        currentFilters.company.length > 0
          ? currentFilters.company.join(",")
          : undefined,
      minSalary: safeInt(currentFilters.minSalary),
      maxSalary: safeInt(currentFilters.maxSalary),
      opportunityType:
        currentFilters.opportunityType.length > 0
          ? currentFilters.opportunityType.join(",")
          : undefined,
      jobType:
        currentFilters.jobType.length > 0
          ? currentFilters.jobType.join(",")
          : undefined,
      targetedOnly: filters.targetedOnly ? "1" : undefined,
      sortBy: currentFilters.sortBy,
      sortOrder: currentFilters.sortOrder,
      offset: currentFilters.offset,
      limit: 20,
    };

    refetch(apiFilters);
  }, [searchParams]); // ← this triggers on offset/sort/filter changes

  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };

  const handleInputChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleMultiChange = (field, selectedOptions) => {
    const values = selectedOptions
      ? selectedOptions.map((opt) => opt.value)
      : [];
    setFilters((prev) => ({ ...prev, [field]: values }));
  };

  const handleLocationChange = (selectedOptions) => {
    const cities = selectedOptions
      ? selectedOptions.map((opt) => getCityFromLocation(opt.value))
      : [];
    setFilters((prev) => ({ ...prev, location: cities }));
  };

  const toggleOpportunityType = (type) => {
    setFilters((prev) => {
      const current = prev.opportunityType || [];
      if (current.includes(type)) {
        return { ...prev, opportunityType: current.filter((t) => t !== type) };
      } else {
        return { ...prev, opportunityType: [...current, type] };
      }
    });
  };

  const toggleJobType = (type) => {
    setFilters((prev) => {
      const current = prev.jobType || [];
      if (current.includes(type)) {
        return { ...prev, jobType: current.filter((t) => t !== type) };
      } else {
        return { ...prev, jobType: [...current, type] };
      }
    });
  };

  const sentinelRef = useRef(null);

  // Fetch more when sentinel is in view
  useEffect(() => {
    if (loading || !pagination || allJobs.length >= pagination.total) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          // Load next batch
          const nextOffset = allJobs.length;
          const newParams = new URLSearchParams(searchParams);
          newParams.set("offset", nextOffset);
          setSearchParams(newParams, { replace: true });
        }
      },
      { threshold: 1.0 }
    );

    if (sentinelRef.current) {
      observer.observe(sentinelRef.current);
    }

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, [loading, pagination, allJobs.length, searchParams]);

  // Master data options
  const companyOptions = useMemo(
    () =>
      companies.map((c) => ({ label: c.company_name, value: c.company_name })),
    [companies]
  );
  const jobRoleOptions = useMemo(
    () => jobRoles.map((r) => ({ label: r.title, value: r.title })),
    [jobRoles]
  );
  const locationOptions = useMemo(
    () => locations.map((l) => ({ label: l.name, value: l.name })),
    [locations]
  );

  // react-select styles (smaller height, green brand focus)
  const selectStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "36px",
      fontSize: "0.875rem",
      borderColor: state.isFocused ? "#9bc87c" : "#e5e7eb",
      boxShadow: state.isFocused ? "0 0 0 1px #9bc87c" : "none",
      "&:hover": {
        borderColor: state.isFocused ? "#9bc87c" : "#d1d5db",
      },
    }),
    input: (base) => ({ ...base, fontSize: "0.875rem" }),
    option: (base, state) => ({
      ...base,
      fontSize: "0.875rem",
      backgroundColor: state.isSelected ? "#9bc87c" : state.isFocused ? "#f3f4f6" : "white",
    }),
    multiValue: (base) => ({ ...base, fontSize: "0.875rem", backgroundColor: "#f3f4f6" }),
  };

  return (
    <div className="bg-gray-50 min-h-screen relative">
      <Header />
      <div className="px-3 pt-2 pb-4 mx-auto max-w-7xl sm:pt-3 md:pt-4 lg:pt-6 sm:pb-6 sm:px-4 md:px-6 lg:px-8">
        {/* Mobile Filter Toggle */}
        <div className="mb-3 lg:hidden sm:mb-4">
          <Button
            onClick={toggleFilters}
            variant="outline"
            size="default"
            className="flex items-center justify-center w-full gap-2 px-4 py-3 transition-colors bg-white border border-gray-200 shadow-sm rounded-xl hover:bg-gray-50 text-[#1e1e2d]"
          >
            {isFiltersOpen ? (
              <>
                <FaTimes className="text-sm" />
                <span className="text-sm font-bold">Close Filters</span>
              </>
            ) : (
              <>
                <FaFilter className="text-sm" />
                <span className="text-sm font-bold">Show Filters</span>
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-3 sm:gap-4 lg:gap-6 mx-2 sm:mx-4">
          {/* Left: Job Filters */}
          <aside
            className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 lg:p-6 flex flex-col gap-1 sm:gap-5 self-start ${
              isFiltersOpen ? "block" : "hidden lg:flex"
            } lg:min-h-[calc(100vh-120px)]`}
          >
            <div>
              <h2 className="mb-2 text-lg font-extrabold text-[#1e1e2d] sm:text-xl lg:text-2xl">
                Job Filters
              </h2>
              <p className="text-sm font-medium text-gray-500">
                Help us match you with the best career opportunities
              </p>
            </div>

            <div className="flex flex-col flex-1 gap-4">
              {/* Opportunity type */}
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm font-bold text-[#1e1e2d]">
                  Opportunity Type
                </label>
                <div className="flex flex-wrap gap-2">
                  <Checkbox
                    checked={filters.opportunityType.includes("internship")}
                    onChange={() => toggleOpportunityType("internship")}
                    label="Internship"
                    className="flex items-center gap-2 p-0 text-sm font-medium bg-transparent border-0 accent-[#9bc87c]"
                  />
                  <Checkbox
                    checked={filters.opportunityType.includes("job")}
                    onChange={() => toggleOpportunityType("job")}
                    label="Job"
                    className="flex items-center gap-2 p-0 text-sm font-medium bg-transparent border-0 accent-[#9bc87c]"
                  />
                  <Checkbox
                    checked={filters.opportunityType.includes("project")}
                    onChange={() => toggleOpportunityType("project")}
                    label="Project"
                    className="flex items-center gap-2 p-0 text-sm font-medium bg-transparent border-0 accent-[#9bc87c]"
                  />
                </div>
              </div>

              {/* Profile */}
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm font-bold text-[#1e1e2d]">
                  <FaBriefcase className="text-gray-400" /> Profile
                </label>
                {isMasterDataLoading ? (
                  <Loader message="Loading..." />
                ) : (
                  <Select
                    isMulti
                    options={jobRoleOptions}
                    value={jobRoleOptions.filter((opt) =>
                      filters.jobProfile.includes(opt.value)
                    )}
                    onChange={(opts) => handleMultiChange("jobProfile", opts)}
                    placeholder="Search job profiles..."
                    className="w-full text-sm"
                    classNamePrefix="select"
                    styles={selectStyles}
                    isClearable
                    isSearchable
                  />
                )}
              </div>
              

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm font-bold text-[#1e1e2d]">
                  <FaMapMarkerAlt className="text-gray-400" /> Location
                </label>
                {isMasterDataLoading ? (
                  <Loader message="Loading..." />
                ) : (
                  <Select
                    isMulti
                    options={locationOptions}
                    value={locationOptions.filter((opt) =>
                      filters.location.includes(getCityFromLocation(opt.value))
                    )}
                    onChange={handleLocationChange} // ← changed
                    placeholder="Search locations..."
                    className="w-full text-sm"
                    classNamePrefix="select"
                    styles={selectStyles}
                    isClearable
                    isSearchable
                  />
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  <Checkbox
                    checked={filters.jobType.includes("remote")}
                    onChange={() => toggleJobType("remote")}
                    label="Remote"
                    className="flex items-center gap-2 p-0 text-sm font-medium bg-transparent border-0 accent-[#9bc87c]"
                  />
                  <Checkbox
                    checked={filters.jobType.includes("hybrid")}
                    onChange={() => toggleJobType("hybrid")}
                    label="Hybrid"
                    className="flex items-center gap-2 p-0 text-sm font-medium bg-transparent border-0 accent-[#9bc87c]"
                  />
                  <Checkbox
                    checked={filters.jobType.includes("in office")}
                    onChange={() => toggleJobType("in office")}
                    label="In Office"
                    className="flex items-center gap-2 p-0 text-sm font-medium bg-transparent border-0 accent-[#9bc87c]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm font-bold text-[#1e1e2d]">
                  <FaBuilding className="text-gray-400" /> Company
                </label>
                {isMasterDataLoading ? (
                  <Loader message="Loading..." />
                ) : (
                  <Select
                    isMulti
                    options={companyOptions}
                    value={companyOptions.filter((opt) =>
                      filters.company.includes(opt.value)
                    )}
                    onChange={(opts) => handleMultiChange("company", opts)}
                    placeholder="Search companies..."
                    className="w-full text-sm"
                    classNamePrefix="select"
                    styles={selectStyles}
                    isClearable
                    isSearchable
                  />
                )}
              </div>

              {/* Salary */}
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm font-bold text-[#1e1e2d]">
                  <FaMoneyBillWave className="text-gray-400" /> Annual Salary
                  (in lakhs)
                </label>
                <Input
                  placeholder="Min (e.g. 300000)"
                  value={filters.minSalary}
                  onChange={(e) =>
                    handleInputChange("minSalary", e.target.value)
                  }
                  type="number"
                  aria-label="Min Salary"
                  size="small"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-[#9bc87c] focus:border-[#9bc87c]"
                />
              </div>

              {/* College-targeted filter */}
              <div className="flex items-center gap-2 pt-1">
                <Checkbox
                  checked={filters.targetedOnly}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      targetedOnly: e.target.checked,
                    }))
                  }
                  label={
                    <span className="flex items-center gap-1 font-bold text-[#1e1e2d]">
                      <FaGraduationCap className="text-[#9bc87c]" size={18} />
                      Only jobs for your college
                    </span>
                  }
                  className="flex items-center gap-2 p-0 font-medium bg-transparent border-0 text-sm accent-[#9bc87c]"
                />
                <span
                  className="text-gray-500 text-xs cursor-help border border-gray-300 rounded-full w-4 h-4 flex items-center justify-center"
                  title="Jobs where your college is explicitly selected by the recruiter."
                >
                  i
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center justify-between gap-3 pt-4 mt-4 border-t border-gray-100 sm:flex-row">
              <button
                onClick={clearFilters}
                className="w-full text-sm font-bold text-center text-gray-500 transition-colors hover:text-[#1e1e2d] sm:w-auto"
                aria-label="Clear all filters"
              >
                Clear all
              </button>
              <Button
                onClick={applyFilters}
                // variant="primary"
                size="small"
                // className="bg-[#9bc87c] hover:bg-[#8ab76b] transition-colors text-white rounded-lg px-6 py-2.5 font-bold text-sm w-full sm:w-auto shadow-none"
                className="bg-[#1DB32F] hover:bg-[#18a728] transition-colors text-white rounded-lg px-6 py-2.5 font-bold text-sm w-full sm:w-auto shadow-none outline-none focus:outline-none focus:ring-0 active:outline-none"
                aria-label="Apply filters"
              >
                Apply
              </Button>
              
            </div>
          </aside>

          {/* Right: Jobs List */}
          <main className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col min-h-[80vh]">
            <header className="mb-5 sm:mb-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-[#1e1e2d] sm:text-2xl lg:text-3xl">
                    Generate Job Specific Pathway
                  </h2>
                  <p className="mt-1 text-sm font-medium text-gray-500 sm:text-base">
                    Select any job from the list below to let our AI build a custom learning roadmap tailored exactly to those requirements.
                  </p>
                </div>

              </div>

            </header>

            {/* Sort Controls */}
            <div className="flex flex-wrap items-center justify-between mb-4">
              <div className="text-sm font-bold text-gray-500">
                {pagination?.total || 0} opportunities
              </div>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="sort-by"
                  className="text-sm font-bold text-[#1e1e2d]"
                >
                  Sort by:
                </label>
                <select
                  id="sort-by"
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split("-");
                    setFilters((prev) => ({
                      ...prev,
                      sortBy,
                      sortOrder,
                    }));

                    const newParams = new URLSearchParams(searchParams);
                    newParams.set("sortBy", sortBy);
                    newParams.set("sortOrder", sortOrder);
                    newParams.set("offset", "0"); 
                    setSearchParams(newParams);
                  }}
                  className="px-3 py-1.5 text-sm font-medium border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#9bc87c] focus:border-[#9bc87c] bg-gray-50 cursor-pointer"
                  
                >
                  <option value="relevance-desc">Relevance (Targeted first)</option>
                  <option value="postedAt-desc">Posted Date (Newest)</option>
                  <option value="postedAt-asc">Posted Date (Oldest)</option>
                  <option value="matchPercentage-desc">Match % (High to Low)</option>
                  <option value="matchPercentage-asc">Match % (Low to High)</option>
                </select>
              </div>
            </div>

            {/* Job Cards */}
            <section className="flex flex-col gap-3 sm:gap-4 lg:gap-4">
              {loading && (
                <div className="py-8 text-center sm:py-12">
                  <Loader message="Loading opportunities..." />
                </div>
              )}

              {error && (
                <div className="py-8 text-center sm:py-12">
                  <p className="mb-4 text-sm font-medium text-red-500 sm:text-base">
                    Error loading jobs: {error}
                  </p>
                  <Button
                    onClick={() => refetch()}
                    variant="secondary"
                    size="small"
                    className="px-4 py-2 text-sm text-[#1e1e2d] bg-gray-100 transition-colors rounded-lg hover:bg-gray-200 shadow-none"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {!loading &&
                !error &&
                allJobs &&
                allJobs.length > 0 &&
                allJobs.map((job) => (
                  <div
                    key={job.job_id}
                    onClick={() => handleJobSelectForAI(job.job_id)}
                    className="no-underline cursor-pointer group"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleJobSelectForAI(job.job_id)}
                  >
                    <article
                      className={`relative flex flex-col gap-3 p-4 transition-all duration-300 bg-white border border-gray-100 shadow-sm sm:flex-row sm:items-start sm:gap-4 lg:gap-6 rounded-xl hover:shadow-md hover:scale-[1.005] hover:border-[#9bc87c]/50 ${
                        job.is_targeted_to_user_college ? "ring-1 ring-[#9bc87c]" : ""
                      }`}
                      tabIndex={0}
                      aria-label={`Job: ${job.jobRole} at ${job.company_name}`}
                    >
                      {/* Desktop Tags */}
                      {job.skill_missing && (
                        <div className="absolute z-10 hidden sm:block -top-3 left-4">
                          <Badge
                            color="bg-white text-[#1e1e2d]"
                            text="Select to Generate Pathway"
                            className="text-[10px] font-bold border border-[#9bc87c] shadow-sm uppercase tracking-wide px-3 py-1"
                          />
                        </div>
                      )}

                      {job.is_targeted_to_user_college && (
                        <div className="absolute z-10 hidden sm:block -top-3 right-4">
                          <span
                            className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold text-[#1e1e2d] bg-[#9bc87c] rounded-full shadow-sm"
                            title="This job is specifically posted for students from your college."
                          >
                            <FaGraduationCap className="text-[#1e1e2d]" size={12} />
                            For Your College
                          </span>
                        </div>
                      )}

                      {/* Mobile Flex Tags */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1 sm:hidden">
                        {job.skill_missing && (
                           <Badge
                             color="bg-white text-[#1e1e2d]"
                             text="Select to Generate Pathway"
                             className="text-[10px] font-bold border border-[#9bc87c] shadow-sm uppercase tracking-wide px-3 py-1"
                           />
                        )}
                        {job.is_targeted_to_user_college && (
                          <span
                            className="inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold text-[#1e1e2d] bg-[#9bc87c] rounded-full shadow-sm"
                            title="This job is specifically posted for students from your college."
                          >
                            <FaGraduationCap className="text-[#1e1e2d]" size={12} />
                            For Your College
                          </span>
                        )}
                      </div>

                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-12 h-12 bg-white border border-gray-100 rounded-lg sm:w-14 sm:h-14 lg:w-16 lg:h-16 overflow-hidden">
                          <img
                            src={getImageUrl(job.logo_url)}
                            alt={`${job.company_name} logo`}
                            className="object-contain w-10 h-10 p-1 sm:w-12 sm:h-12 lg:w-14 lg:h-14"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div>
                          <h3 className="text-base font-extrabold leading-tight text-[#1e1e2d] transition-colors sm:text-lg lg:text-xl truncate group-hover:text-[#9bc87c]">
                            {job.jobRole}
                          </h3>
                          <p className="mt-1 text-sm font-medium text-gray-500">
                            {job.company_name}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-3">
                          <span className="px-3 py-1.5 text-gray-700 bg-gray-50 border border-gray-100 rounded-lg text-xs font-semibold">
                            <FaMapMarkerAlt className="inline mr-1 text-gray-400" />
                            {job.company_location}
                          </span>
                          
                          {/* {job.experience && (
                            <span className="px-3 py-1.5 text-gray-700 bg-gray-50 border border-gray-100 rounded-lg text-xs font-semibold">
                              <FaUserTie className="inline mr-1 text-gray-400" />
                              {(() => {
                                const words = job.experience.split(" ");
                                return words.length > 4
                                  ? words.slice(0, 4).join(" ") + "..."
                                  : job.experience;
                              })()}
                            </span>
                          )} */}

                          {job.salary && (
                            <span className="px-3 py-1.5 text-[#1e1e2d] bg-[#9bc87c]/10 border border-[#9bc87c]/30 rounded-lg text-xs font-semibold">
                              <FaMoneyBillWave className="inline mr-1 text-[#9bc87c]" />
                              {job.salary}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0 mt-2 sm:mt-0">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wider whitespace-nowrap border ${
                          job.hiring_status === "Actively Hiring" 
                            ? "bg-[#1DB32F] text-white border-[#1DB32F]" 
                            : "bg-gray-50 text-gray-500 border-gray-200"
                        }`}>
                          {job.hiring_status}
                        </span>
                        
                        <span className="text-[11px] font-bold bg-gray-50 text-gray-500 border border-gray-200 px-3 py-1 rounded-md whitespace-nowrap">
                          {job.posted_days_ago}
                        </span>

                        <div className="flex flex-col items-start w-full gap-1.5 mt-2 sm:items-end">
                          <div className="relative group2">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-md border ${
                                job.mandatorySkillsMet
                                  ? "bg-gray-50 text-gray-700 border-gray-200"
                                  : "bg-red-50 text-red-600 border-red-100"
                              }`}
                            >
                              {job.mandatorySkillsMet ? "✅ Mandatory Met" : "❌ Mandatory Missing"}
                            </span>
                          </div>

                          {typeof job.preferredSkillMatch === "number" && (
                            <div className="relative group2">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold rounded-md border ${
                                  job.preferredSkillMatch >= 80
                                    ? "bg-[#9bc87c]/10 text-[#1e1e2d] border-[#9bc87c]/30"
                                    : job.preferredSkillMatch >= 50
                                    ? "bg-gray-50 text-gray-600 border-gray-200"
                                    : "bg-gray-50 text-gray-500 border-gray-200"
                                }`}
                              >
                                🎯 Preferred: {Math.round(job.preferredSkillMatch)}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  </div>
                ))}

              {!loading && !error && (!allJobs || allJobs.length === 0) && (
                <div className="py-12 text-center sm:py-16">
                  <p className="text-lg font-medium text-gray-500">No opportunities found.</p>
                </div>
              )}
              {/* Infinite scroll sentinel */}
              {!loading &&
                allJobs?.length > 0 &&
                pagination &&
                allJobs.length < pagination.total && (
                  <div className="py-4 text-center">
                    <Loader message="Loading more opportunities..." />
                  </div>
                )}
              <div
                ref={sentinelRef}
                style={{ height: "1px", margin: 0, padding: 0 }}
              />
            </section>
          </main>
        </div>
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed z-10 p-3 text-[#1e1e2d] transition-colors bg-[#9bc87c] rounded-full shadow-lg bottom-6 right-6 hover:bg-[#8ab76b]"
          aria-label="Back to top"
        >
          <FaArrowUp />
        </button>
      )}
    </div>
  );
}


