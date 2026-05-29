// // src/pages/university/UniversityJobs.js
// import React, { useState, useMemo, useCallback, useEffect } from "react";
// import { Link, useNavigate ,useSearchParams} from "react-router-dom";
// import {
//   FaSearch,
//   FaBuilding,
//   FaMapMarkerAlt,
//   FaUserTie,
//   FaMoneyBillWave,
//   FaBriefcase,
//   FaFilter,
//   FaTimes,
//   FaGraduationCap,
// } from "react-icons/fa";
// import Header from "../../../components/shared/Header";
// import { useUniversityJobs } from "../../../hooks/university/useUniversityJobs";
// import { useMasterData } from "../../../hooks/master/useMasterData";
// import { getImageUrl } from "../../../../utils";
// import { Input, Button, Loader, Checkbox, Badge } from "../../../components/ui";
// import JobFiltersPanel from "../../../components/job/JobFilter.jsx";
// import Select from "react-select";
// import axios from "axios";

// const BASE_URL=import.meta.env.VITE_BASE_URL


// const UniversityJobs = () => {



//   const [searchParams, setSearchParams] = useSearchParams();
// const navigate = useNavigate();

// // 🔁 Deserialize params → filters
// const initialFilters = useMemo(() => {
//   const params = Object.fromEntries([...searchParams]);
//   return {
//     jobProfile: params.jobProfile ? params.jobProfile.split(",") : [],
//     location: params.location ? params.location.split(",") : [],
//     company: params.company ? params.company.split(",") : [],
//     minSalary: params.minSalary || "",
//     opportunityType: params.opportunityType ? params.opportunityType.split(",") : [],
//     audienceType: params.audienceType ? params.audienceType.split(",") : [],
//     jobType: params.jobType ? params.jobType.split(",") : [],
//     targetedOnly: false,
//     sortBy: params.sortBy || "relevance",
//     sortOrder: params.sortOrder || "desc",
//   };
// }, [searchParams]);

// const [filters, setFilters] = useState(initialFilters);

// // 🔁 Serialize filters → URL (debounced or on apply)
// const updateURL = useCallback((newFilters) => {
//   const params = new URLSearchParams();
  
//   // Add non-empty, non-default filters
//   if (newFilters.jobProfile.length) params.set("jobProfile", newFilters.jobProfile.join(","));
//   if (newFilters.location.length) params.set("location", newFilters.location.join(","));
//   if (newFilters.company.length) params.set("company", newFilters.company.join(","));
//   if (newFilters.minSalary) params.set("minSalary", newFilters.minSalary);
//   if (newFilters.opportunityType.length) params.set("opportunityType", newFilters.opportunityType.join(","));
//   if (newFilters.audienceType.length) params.set("audienceType", newFilters.audienceType.join(","));
//   if (newFilters.jobType.length) params.set("jobType", newFilters.jobType.join(","));
  
//   // Sort
//   if (newFilters.sortBy !== "relevance") params.set("sortBy", newFilters.sortBy);
//   if (newFilters.sortOrder !== "desc") params.set("sortOrder", newFilters.sortOrder);

//   // Update URL without navigation
//   setSearchParams(params, { replace: true });
// }, [setSearchParams]);


//    const [isFiltersOpen, setIsFiltersOpen] = useState(false);
//   // const [filters, setFilters] = useState({
//   //   jobProfile: [],
//   //   location: [],
//   //   company: [],
//   //   minSalary: "",
//   //   opportunityType: [],
//   //   jobType: [],
//   //   targetedOnly: false,
//   // });
//   const {
//     jobs,
//     targetedSummary,
//     loading,
//     loadingMore,
//     error,
//     hasMore,
//     refetch,
//     lastJobRef,
//   } = useUniversityJobs(filters);
//   const {
//     companies,
//     jobRoles,
//     locations,
//     isLoading: isMasterDataLoading,
//   } = useMasterData();

// //Job Role Search State
// const [jobRoleOptions, setJobRoleOptions] = useState([]);
// const [jobRoleSearch, setJobRoleSearch] = useState("");
// const [isJobRoleLoading, setIsJobRoleLoading] = useState(false);
// const jobRoleTimeoutRef = React.useRef(null);

// //Location Search State
// const [locationOptions, setLocationOptions] = useState([]);
// const [locationSearch, setLocationSearch] = useState("");
// const [isLocationLoading, setIsLocationLoading] = useState(false);
// const locationTimeoutRef = React.useRef(null);

// // Company Search State
// const [companyOptions, setCompanyOptions] = useState([]);
// const [companySearch, setCompanySearch] = useState("");
// const [isCompanyLoading, setIsCompanyLoading] = useState(false);
// const companyTimeoutRef = React.useRef(null);
// const [selectedCompanyType, setSelectedCompanyType] = useState(null);




//   // Add inside UniversityJobs component
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       const params = new URLSearchParams();

//       // All multi-filters as comma-separated (matches backend parseMultiFilter)
//       if (filters.jobProfile.length) params.set("jobProfile", filters.jobProfile.join(","));
//       if (filters.location.length) params.set("location", filters.location.join(","));
//       if (filters.company.length) params.set("company", filters.company.join(","));
//       if (filters.opportunityType.length) params.set("opportunityType", filters.opportunityType.join(","));
//       if (filters.audienceType.length) params.set("audienceType", filters.audienceType.join(","));
//       if (filters.jobType.length) params.set("jobType", filters.jobType.join(","));

//       if (filters.minSalary) params.set("minSalary", filters.minSalary);

//       // Sort
//       if (filters.sortBy !== "relevance") params.set("sortBy", filters.sortBy);
//       if (filters.sortOrder !== "desc") params.set("sortOrder", filters.sortOrder);

//       // Reset offset on filter change
//       params.set("offset", "0");

//       setSearchParams(params, { replace: true });
//     }, 300);

//     return () => clearTimeout(timer);
//   }, [filters]);

//   useEffect(() => {
//   if (jobRoleTimeoutRef.current) {
//     clearTimeout(jobRoleTimeoutRef.current);
//   }

//   if (!jobRoleSearch || jobRoleSearch.length < 3) {
//     setJobRoleOptions([]);
//     return;
//   }

//   jobRoleTimeoutRef.current = setTimeout(async () => {
//     try {
//       setIsJobRoleLoading(true);

//       const res = await axios.get(
//         `${BASE_URL}/master/job-roles/search?search=${jobRoleSearch}`
//       );

//       const data = res.data?.data || [];

//       setJobRoleOptions(
//         data.map((r) => ({
//           value: r.title,
//           label: r.title,
//         }))
//       );
//     } catch (err) {
//       console.error("Job role search failed:", err);
//       setJobRoleOptions([]);
//     } finally {
//       setIsJobRoleLoading(false);
//     }
//   }, 400);

//   return () => clearTimeout(jobRoleTimeoutRef.current);
// }, [jobRoleSearch]);


// useEffect(() => {
//   if (locationTimeoutRef.current) {
//     clearTimeout(locationTimeoutRef.current);
//   }

//   if (!locationSearch || locationSearch.length < 3) {
//     setLocationOptions([]);
//     return;
//   }

//   locationTimeoutRef.current = setTimeout(async () => {
//     try {
//       setIsLocationLoading(true);

//       const res = await axios.get(
//         `${BASE_URL}/master/location/search?search=${locationSearch}`
//       );

//       const data = res.data?.data || [];

//       setLocationOptions(
//         data.map((l) => ({
//           value: l.name,
//           label: l.name,
//         }))
//       );
//     } catch (err) {
//       console.error("Location search failed:", err);
//       setLocationOptions([]);
//     } finally {
//       setIsLocationLoading(false);
//     }
//   }, 400);

//   return () => clearTimeout(locationTimeoutRef.current);
// }, [locationSearch]);

// useEffect(() => {
//   if (companyTimeoutRef.current) {
//     clearTimeout(companyTimeoutRef.current);
//   }

//   if (!companySearch || companySearch.length < 3) {
//     setCompanyOptions([]);
//     return;
//   }

//   companyTimeoutRef.current = setTimeout(async () => {
//     try {
//       setIsCompanyLoading(true);

//       const res = await axios.get(
//         `${BASE_URL}/master/companies/search?search=${companySearch}`
//       );

//       const data = res.data?.data || [];

//       setCompanyOptions(
//         data.map((c) => ({
//           value: c.company_name,
//           label: c.company_name,
//         }))
//       );
//     } catch (err) {
//       console.error("Company search failed:", err);
//       setCompanyOptions([]);
//     } finally {
//       setIsCompanyLoading(false);
//     }
//   }, 400);

//   return () => clearTimeout(companyTimeoutRef.current);
// }, [companySearch]);


//   // --- Filter handlers (no-op for now — UI only) ---
//   const handleMultiChange = (field, selectedOptions) => {
//     const values = selectedOptions ? selectedOptions.map((opt) => opt.value) : [];
//     setFilters((prev) => ({ ...prev, [field]: values }));
//   };

//   const toggleOpportunityType = (type) => {
//     setFilters((prev) => {
//       const current = prev.opportunityType || [];
//       return {
//         ...prev,
//         opportunityType: current.includes(type)
//           ? current.filter((t) => t !== type)
//           : [...current, type],
//       };
//     });
//   };

//   const toggleJobType = (type) => {
//     setFilters((prev) => {
//       const current = prev.jobType || [];
//       return {
//         ...prev,
//         jobType: current.includes(type)
//           ? current.filter((t) => t !== type)
//           : [...current, type],
//       };
//     });
//   };

//   const toggleAudienceType = (type) => {
//     setFilters((prev) => {
//       const current = prev.audienceType || [];
//       return {
//         ...prev,
//         audienceType: current.includes(type)
//           ? current.filter((t) => t !== type)
//           : [...current, type],
//       };
//     });
//   };

//   const clearFilters = () => {
//     setFilters({
//       jobProfile: [],
//       location: [],
//       company: [],
//       minSalary: "",
//       opportunityType: [],
//       audienceType: [],
//       jobType: [],
//       targetedOnly: false,
//       sortBy: "relevance",
//       sortOrder: "desc",
//     });
//     // URL will auto-update via useEffect above
//   };

//   const applyFilters = () => {
//     // No op — filters UI only for now.
//     // Later: pass to useUniversityJobs() or navigate with params
//     updateURL(filters);
//     if (window.innerWidth < 1024) {
//       setIsFiltersOpen(false);
//     }
//   };



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

//   // Format stipend like "5000 – 10000" → "₹5,000 – ₹10,000"
//   const formatStipend = (range) => {
//     if (!range) return "—";
//     return range
//       .split(" – ")
//       .map((val) => {
//         const num = parseInt(val.trim().replace(/,/g, ""));
//         if (isNaN(num)) return val;
//         return new Intl.NumberFormat("en-IN", {
//           style: "currency",
//           currency: "INR",
//           minimumFractionDigits: 0,
//         }).format(num);
//       })
//       .join(" – ");
//   };

//   return (
//     <div className="bg-[#f5f6f7] min-h-screen relative">
//       <Header />
//       <div className="px-3 pt-2 pb-4 mx-auto max-w-7xl sm:pt-3 md:pt-4 lg:pt-6 sm:pb-6 sm:px-4 md:px-6 lg:px-8">
//         {/* Mobile Filter Toggle */}
//         <div className="mb-3 lg:hidden sm:mb-4">
//           <Button
//             onClick={() => setIsFiltersOpen(!isFiltersOpen)}
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
//           {/* Left: Filters (UI only, no backend yet) */}
//           <aside
//             className={`bg-white rounded-2xl shadow border border-gray-100 p-4 sm:p-5 lg:p-6 flex flex-col gap-1 sm:gap-5 self-start ${
//               isFiltersOpen ? "block" : "hidden lg:flex"
//             } lg:min-h-[calc(100vh-120px)]`}
//           >
//             <div>
//               <h2 className="mb-2 text-lg font-extrabold text-gray-900 sm:text-xl lg:text-2xl">
//                 Filters
//               </h2>
//               <p className="text-sm text-gray-500">
//                 Narrow down jobs for your university
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

//               <div className="flex flex-col gap-2">
//                 <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//                   Open To
//                 </label>
//                 <div className="flex flex-wrap gap-2">
//                   <Checkbox
//                     checked={filters.audienceType.includes("open_to_all")}
//                     onChange={() => toggleAudienceType("open_to_all")}
//                     label="Open to all"
//                     className="flex items-center gap-2 p-0 text-sm font-medium bg-transparent border-0"
//                   />
//                   <Checkbox
//                     checked={filters.audienceType.includes("open_to_freshers")}
//                     onChange={() => toggleAudienceType("open_to_freshers")}
//                     label="Open to freshers"
//                     className="flex items-center gap-2 p-0 text-sm font-medium bg-transparent border-0"
//                   />
//                   <Checkbox
//                     checked={filters.audienceType.includes("open_to_experienced")}
//                     onChange={() => toggleAudienceType("open_to_experienced")}
//                     label="Open to experienced"
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
//   isMulti
//   options={jobRoleOptions}
//   inputValue={jobRoleSearch}
//   onInputChange={(inputValue) => {
//     setJobRoleSearch(inputValue);
//   }}
//     value={filters.jobProfile.map((val) => ({
//     value: val,
//     label: val,
//   }))}

//   onChange={(opts) => handleMultiChange("jobProfile", opts)}
//   placeholder="Search job profiles"
//   isLoading={isJobRoleLoading}
//   noOptionsMessage={() =>
//     jobRoleSearch.length < 3
//       ? "Search job profiles"
//       : "No job roles found"
//   }
//   className="w-full text-sm"
//   classNamePrefix="select"
//   styles={selectStyles}
//   isClearable
//   isSearchable
// />


//                 )}
//               </div>

//               {/* Location & Job Type */}
//               <div className="flex flex-col gap-2">
//                 <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//                   <FaMapMarkerAlt className="text-gray-400" /> Location
//                 </label>
//                 {isMasterDataLoading ? (
//                   <Loader message="Loading..." />
//                 ) : (
//                   <Select
//   isMulti
//   options={locationOptions}
//   inputValue={locationSearch}
//   onInputChange={(inputValue) => {
//     setLocationSearch(inputValue);
//   }}
//     value={filters.location.map((val) => ({
//     value: val,
//     label: val,
//   }))}

//   onChange={(opts) => handleMultiChange("location", opts)}
//   placeholder="Search location"
//   isLoading={isLocationLoading}
//   noOptionsMessage={() =>
//     locationSearch.length < 3
//       ? "Search location"
//       : "No locations found"
//   }
//   className="w-full text-sm"
//   classNamePrefix="select"
//   styles={selectStyles}
//   isClearable
//   isSearchable
// />


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

//               {/* Company */}
//               <div className="flex flex-col gap-2">
//                 <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//                   <FaBuilding className="text-gray-400" /> Company
//                 </label>
//                 {isMasterDataLoading ? (
//                   <Loader message="Loading..." />
//                 ) : (
//                   <Select
//   isMulti
//   options={companyOptions}
//   inputValue={companySearch}
//   onInputChange={(inputValue) => {
//     setCompanySearch(inputValue);
//   }}
//     value={filters.company.map((val) => ({
//     value: val,
//     label: val,
//   }))}
//   onChange={(opts) => handleMultiChange("company", opts)}
//   placeholder="Search companies"
//   isLoading={isCompanyLoading}
//   noOptionsMessage={() =>
//     companySearch.length < 3
//       ? "Search companies"
//       : "No companies found"
//   }
//   className="w-full text-sm"
//   classNamePrefix="select"
//   styles={selectStyles}
//   isClearable
//   isSearchable
// />

//                 )}
//               </div>

//               {/* Salary (Min only, like AllJobs) */}
//               <div className="flex flex-col gap-2">
//                 <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//                   <FaMoneyBillWave className="text-gray-400" /> Stipend / Salary
//                 </label>
//                 <Input
//                   placeholder="Min (e.g. 10000)"
//                   value={filters.minSalary}
//                   onChange={(e) =>
//                     setFilters((prev) => ({
//                       ...prev,
//                       minSalary: e.target.value,
//                     }))
//                   }
//                   type="number"
//                   aria-label="Min Stipend"
//                   size="small"
//                   className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
//                 />
//               </div>

//             </div>

            

//             <div className="flex flex-col items-center justify-between gap-3 pt-2 mt-4 border-t border-gray-100 sm:flex-row">
//               <button
//                 onClick={clearFilters}
//                 className="w-full text-sm font-semibold text-center text-blue-500 transition-colors hover:underline sm:w-auto"
//               >
//                 Clear all
//               </button>
//               <Button
//                 onClick={applyFilters}
//                 variant="primary"
//                 size="small"
//                 className="bg-[#ff4d3d] hover:bg-[#e63c2a] transition-colors text-white rounded-full px-6 py-2.5 font-semibold text-sm shadow focus:ring-2 focus:ring-red-200 w-full sm:w-auto"
//               >
//                 Apply
//               </Button>
//             </div>
//           </aside>

//           {/* Right: Jobs List */}
//           <main className="bg-white rounded-2xl shadow border border-gray-100 p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col min-h-[80vh]">
//             <header className="mb-4 sm:mb-6">
//               <h2 className="mb-2 text-xl font-extrabold text-gray-900 sm:text-2xl lg:text-3xl">
//                 University Jobs
//               </h2>
//               <p className="text-sm text-gray-500 sm:text-base">
//                 Jobs tied to your university appear first. Only viewable by university admins.
//               </p>
//               {/* {jobs.length > 0 && (
//                 <p className="mt-1 text-xs text-gray-400">
//                   Showing {jobs.length} of {jobs.length} (load more below)
//                 </p>
//               )} */}

//             </header>

//             <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-3">
//                 {[
//                   { key: "jobs", label: "Jobs", valueKey: "job_count" },
//                   { key: "internships", label: "Internships", valueKey: "internship_count" },
//                   { key: "projects", label: "Projects", valueKey: "project_count" },
//                 ].map((item) => (
//                   <button
//                     key={item.key}
//                     type="button"
//                     onClick={() => setSelectedCompanyType(item.key)}
//                     className="p-4 text-left transition border border-blue-100 rounded-xl bg-blue-50 hover:bg-blue-100"
//                   >
//                     <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">{item.label}</p>
//                     <p className="mt-1 text-2xl font-extrabold text-blue-900">
//                       {targetedSummary?.[item.valueKey] || 0}
//                     </p>
 
//                   </button>
//                 ))}
//             </div>



//             {/* Sort Controls */}
//             <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
//               <div className="text-sm text-gray-600">
//                 {jobs.length > 0 && (
//                   <p className="mt-1 text-xs text-gray-400">
//                     Showing {jobs.length} of {jobs.length} (load more below)
//                   </p>
//                 )}
//               </div>
//               <div className="flex flex-wrap items-center gap-2">
//                 <label className="text-sm font-medium text-gray-700">Open to:</label>
//                 <select
//                   value={filters.audienceType?.[0] || ""}
//                   onChange={(e) => {
//                     const val = e.target.value;
//                     setFilters((prev) => ({
//                       ...prev,
//                       audienceType: val ? [val] : [],
//                     }));
//                   }}
//                   className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   <option value="">All</option>
//                   <option value="open_to_all">Open to all</option>
//                   <option value="open_to_freshers">Open to freshers</option>
//                   <option value="open_to_experienced">Open to experienced</option>
//                 </select>
//                 <label
//                   htmlFor="sort"
//                   className="text-sm font-medium text-gray-700"
//                 >
//                   Sort by:
//                 </label>
//                 <select
//                   id="sort"
//                   value={`${filters.sortBy}-${filters.sortOrder}`}
//                   onChange={(e) => {
//                     const [sortBy, sortOrder] = e.target.value.split("-");
//                     setFilters((prev) => ({
//                       ...prev,
//                       sortBy,
//                       sortOrder,
//                     }));
//                     updateURL({ ...filters, sortBy, sortOrder });
//                   }}
//                   className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   <option value="relevance-desc">
//                     Relevance (My university first)
//                   </option>
//                   <option value="created_at-desc">Posted Date (Newest)</option>
//                   <option value="created_at-asc">Posted Date (Oldest)</option>
//                 </select>
//               </div>
//             </div>

//             {error && (
//               <div className="py-4 text-center">
//                 <Button
//                   onClick={refetch}
//                   variant="secondary"
//                   size="small"
//                   className="px-4 py-2 text-sm text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
//                 >
//                   Refresh Jobs
//                 </Button>
//               </div>
//             )}

//             {loading ? (
//               <div className="space-y-3">
//                 {[...Array(5)].map((_, i) => (
//                   <div
//                     key={i}
//                     className="p-4 border border-gray-200 bg-gray-50 rounded-xl animate-pulse"
//                   >
//                     <div className="flex items-start gap-4">
//                       <div className="w-12 h-12 bg-gray-200 rounded-lg" />
//                       <div className="flex-1 space-y-2">
//                         <div className="w-3/4 h-4 bg-gray-200 rounded" />
//                         <div className="w-1/2 h-3 bg-gray-200 rounded" />
//                         <div className="flex gap-2">
//                           <div className="w-20 h-5 bg-gray-200 rounded" />
//                           <div className="w-20 h-5 bg-gray-200 rounded" />
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : jobs.length === 0 ? (
//               <div className="py-12 text-center sm:py-16">
//                 <div className="mb-4 text-gray-400">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="w-16 h-16 mx-auto"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={1.5}
//                       d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
//                     />
//                   </svg>
//                 </div>
//                 <h3 className="text-lg font-medium text-gray-900">No jobs yet</h3>
//                 <p className="mt-1 text-gray-500">
//                   Check back soon — new jobs are posted daily.
//                 </p>
//               </div>
//             ) : (
//               <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6">
//                 {jobs.map((job, index) => {
//                   const isLast = index === jobs.length - 1;
//                   return (
//                     <Link
//                       key={job.job_id}
//                       to={`/university/jobs/${job.job_id}`}
//                       className="no-underline"
//                     >
//                       <article
//                         ref={isLast ? lastJobRef : null}
//                         className={`relative flex flex-col gap-3 p-4 transition-all duration-200 bg-white border shadow-sm cursor-pointer sm:flex-row sm:items-center sm:gap-4 lg:gap-6 rounded-xl sm:p-5 lg:p-6 hover:shadow-lg group ${
//                           job.targeting_our_college
//                             ? "border-blue-300 hover:border-blue-400"
//                             : "border-gray-200 hover:border-blue-200"
//                         }`}
//                         tabIndex={0}
//                         aria-label={`Job: ${job.jobRole} at ${job.company_name}`}
//                       >
//                         {/* For Your College Badge */}
//                         {job.targeting_our_college && (
//                           <div className="absolute z-10 -top-2 sm:-top-3 right-4">
//                             <span
//                               className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-blue-600 rounded-full shadow-md animate-college-badge"
//                               title="Posted specifically for students from your university"
//                             >
//                               <FaGraduationCap className="text-white" size={12} />
//                               For Your College
//                             </span>
//                           </div>
//                         )}

//                         {/* College-Specific Badge */}
//                         {job.is_college_specific && !job.targeting_our_college && (
//                           <div className="absolute z-10 -top-2 sm:-top-3 left-4">
//                             <Badge
//                               color="bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
//                               text="🎓 College-Specific"
//                               className="text-xs font-semibold border border-indigo-200 shadow"
//                             />
//                           </div>
//                         )}

//                         {/* Logo */}
//                         <div className="flex-shrink-0">
//                           {job.logo_url ? (
//                             <img
//                               src={getImageUrl(job.logo_url)}
//                               alt={`${job.company_name} logo`}
//                               className="object-contain w-12 h-12 bg-gray-100 border border-gray-200 rounded-lg sm:w-14 sm:h-14 lg:w-16 lg:h-16"
//                             />
//                           ) : (
//                             <div className="flex items-center justify-center w-12 h-12 bg-gray-100 border border-gray-200 rounded-lg sm:w-14 sm:h-14 lg:w-16 lg:h-16">
//                               <span className="text-sm font-semibold text-gray-500">
//                                 {job.company_name.charAt(0).toUpperCase()}
//                               </span>
//                             </div>
//                           )}
//                         </div>

//                         {/* Content */}
//                         <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
//                           <div>
//                             <h3 className="text-base font-bold leading-tight text-gray-900 transition-colors sm:text-lg lg:text-xl group-hover:text-blue-600">
//                               {job.jobRole}
//                             </h3>
//                             <p className="text-sm font-semibold">{job.company_name}</p>
//                           </div>

//                           <div className="flex flex-wrap gap-2 sm:gap-3">
//                             <Badge
//                               color="bg-gray-100 text-gray-700 hover:bg-gray-200"
//                               className="text-xs border border-gray-200"
//                             >
//                               <FaMapMarkerAlt className="text-xs text-gray-400" />
//                               <span className="truncate">{job.company_location}</span>
//                             </Badge>

//                             {job.job_type && (
//                               <Badge
//                                 color="bg-gray-100 text-gray-700 hover:bg-gray-200"
//                                 className="text-xs border border-gray-200"
//                               >
//                                 {job.job_type}
//                               </Badge>
//                             )}
//                             {job.experience_range && (
//                               <Badge
//                                 color="bg-gray-100 text-gray-700 hover:bg-gray-200"
//                                 className="text-xs border border-gray-200"
//                               >
//                                 {job.experience_range}
//                               </Badge>
//                             )}
//                             {job.stipend_range && (
//                               <Badge
//                                 color="bg-gray-100 text-gray-700 hover:bg-gray-200"
//                                 className="text-xs border border-gray-200"
//                               >
//                                 ₹{formatStipend(job.stipend_range)}
//                               </Badge>
//                             )}
//                           </div>
//                         </div>

//                         {/* Right Info */}
//                         <div className="flex flex-col items-start sm:items-end gap-2 sm:gap-3 min-w-[120px] sm:min-w-[140px] lg:min-w-[160px]">
//                           {job.posted_days_ago && (
//                             <Badge
//                               color="bg-gray-100 text-gray-700 hover:bg-gray-200"
//                               className="text-sm font-semibold border border-gray-200"
//                             >
//                               {job.posted_days_ago}
//                             </Badge>
//                           )}
//                         </div>
//                       </article>
//                     </Link>
//                   );
//                 })}

//                 {loadingMore && (
//                   <div className="py-3 text-center">
//                     <Loader message="Loading more jobs..." />
//                   </div>
//                 )}

//                 {!loadingMore && !hasMore && jobs.length > 0 && (
//                   <div className="py-3 mt-2 text-sm text-center text-gray-500 border-t border-gray-100">
//                     🎓 End of list — all jobs loaded.
//                   </div>
//                 )}
//               </div>
//             )}

//             {selectedCompanyType && (
//               <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
//                 <div className="w-full max-w-xl bg-white border border-gray-200 shadow-2xl rounded-2xl">
//                   <div className="flex items-center justify-between p-4 border-b border-gray-100">
//                     <h3 className="text-lg font-bold text-gray-900">
//                       Companies for {selectedCompanyType}
//                     </h3>
//                     <button
//                       type="button"
//                       onClick={() => setSelectedCompanyType(null)}
//                       className="px-2 py-1 text-sm text-gray-500 rounded hover:bg-gray-100"
//                     >
//                       Close
//                     </button>
//                   </div>
//                   <div className="max-h-[420px] overflow-y-auto p-4">
//                     {(targetedSummary?.companies_by_type?.[selectedCompanyType] || []).length === 0 ? (
//                       <p className="text-sm text-gray-500">No companies found.</p>
//                     ) : (
//                       <div className="space-y-3">
//                         {targetedSummary.companies_by_type[selectedCompanyType].map((company) => (
//                           <div
//                             key={`${selectedCompanyType}-${company.company_id}`}
//                             className="flex items-center justify-between p-3 border border-gray-100 rounded-xl"
//                           >
//                             <div className="flex items-center gap-3">
//                               <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
//                                 {company.logo_url ? (
//                                   <img
//                                     src={getImageUrl(company.logo_url)}
//                                     alt={company.company_name}
//                                     className="object-contain w-10 h-10 rounded-lg"
//                                   />
//                                 ) : (
//                                   <span className="text-sm font-semibold text-gray-600">
//                                     {company.company_name?.charAt(0)?.toUpperCase()}
//                                   </span>
//                                 )}
//                               </div>
//                               <p className="font-semibold text-gray-900">{company.company_name}</p>
//                             </div>
//                             <span className="text-xs font-semibold text-blue-700">
//                               {company.jobs_count} posting(s)
//                             </span>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UniversityJobs;















// src/pages/university/UniversityJobs.js
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  FaMapMarkerAlt,
  FaFilter,
  FaTimes,
  FaGraduationCap,
} from "react-icons/fa";
import Header from "../../../components/shared/Header";
import { useUniversityJobs } from "../../../hooks/university/useUniversityJobs";
import { useMasterData } from "../../../hooks/master/useMasterData";
import { getImageUrl } from "../../../../utils";
import { Button, Loader, Badge } from "../../../components/ui";
import JobFiltersPanel from "../../../components/job/JobFilter.jsx";
import OpportunityCountCards from "../../../components/jobs/OpportunityCountCards"; 
import UniversityJobCard from "../../../components/jobs/UniversityJobCard.jsx"; 
import OpenToFilter from "../../../components/jobs/OpenToFilter.jsx";
import UniversitySortBy from "../../../components/jobs/UniversitySortBy.jsx"
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const UniversityJobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // 🔁 Deserialize params → filters
  const initialFilters = useMemo(() => {
    const params = Object.fromEntries([...searchParams]);
    return {
      jobProfile: params.jobProfile ? params.jobProfile.split(",") : [],
      location: params.location ? params.location.split(",") : [],
      company: params.company ? params.company.split(",") : [],
      minSalary: params.minSalary || "",
      opportunityType: params.opportunityType ? params.opportunityType.split(",") : [],
      audienceType: params.audienceType ? params.audienceType.split(",") : [],
      jobType: params.jobType ? params.jobType.split(",") : [],
      targetedOnly: false,
      sortBy: params.sortBy || "relevance",
      sortOrder: params.sortOrder || "desc",
    };
  }, [searchParams]);

  const [filters, setFilters] = useState(initialFilters);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // 🔁 Serialize filters → URL (debounced or on apply)
  const updateURL = useCallback(
    (newFilters) => {
      const params = new URLSearchParams();

      // Add non-empty, non-default filters
      if (newFilters.jobProfile.length) params.set("jobProfile", newFilters.jobProfile.join(","));
      if (newFilters.location.length) params.set("location", newFilters.location.join(","));
      if (newFilters.company.length) params.set("company", newFilters.company.join(","));
      if (newFilters.minSalary) params.set("minSalary", newFilters.minSalary);
      if (newFilters.opportunityType.length) params.set("opportunityType", newFilters.opportunityType.join(","));
      if (newFilters.audienceType.length) params.set("audienceType", newFilters.audienceType.join(","));
      if (newFilters.jobType.length) params.set("jobType", newFilters.jobType.join(","));

      // Sort
      if (newFilters.sortBy !== "relevance") params.set("sortBy", newFilters.sortBy);
      if (newFilters.sortOrder !== "desc") params.set("sortOrder", newFilters.sortOrder);

      // Update URL without navigation
      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

  const {
    jobs,
    targetedSummary,
    loading,
    loadingMore,
    error,
    hasMore,
    refetch,
    lastJobRef,
  } = useUniversityJobs(filters);

  // Master data handles pre-fetching if needed, though search is separate
  const { isLoading: isMasterDataLoading } = useMasterData();

  // Job Role Search State
  const [jobRoleOptions, setJobRoleOptions] = useState([]);
  const [jobRoleSearch, setJobRoleSearch] = useState("");
  const [isJobRoleLoading, setIsJobRoleLoading] = useState(false);
  const jobRoleTimeoutRef = React.useRef(null);

  // Location Search State
  const [locationOptions, setLocationOptions] = useState([]);
  const [locationSearch, setLocationSearch] = useState("");
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const locationTimeoutRef = React.useRef(null);

  // Company Search State
  const [companyOptions, setCompanyOptions] = useState([]);
  const [companySearch, setCompanySearch] = useState("");
  const [isCompanyLoading, setIsCompanyLoading] = useState(false);
  const companyTimeoutRef = React.useRef(null);
  const [selectedCompanyType, setSelectedCompanyType] = useState(null);

  // Auto-update URL when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();

      if (filters.jobProfile.length) params.set("jobProfile", filters.jobProfile.join(","));
      if (filters.location.length) params.set("location", filters.location.join(","));
      if (filters.company.length) params.set("company", filters.company.join(","));
      if (filters.opportunityType.length) params.set("opportunityType", filters.opportunityType.join(","));
      if (filters.audienceType.length) params.set("audienceType", filters.audienceType.join(","));
      if (filters.jobType.length) params.set("jobType", filters.jobType.join(","));
      if (filters.minSalary) params.set("minSalary", filters.minSalary);

      // Sort
      if (filters.sortBy !== "relevance") params.set("sortBy", filters.sortBy);
      if (filters.sortOrder !== "desc") params.set("sortOrder", filters.sortOrder);

      // Reset offset on filter change
      params.set("offset", "0");

      setSearchParams(params, { replace: true });
    }, 300);

    return () => clearTimeout(timer);
  }, [filters]);

  // Debounced Job Role Search
  useEffect(() => {
    if (jobRoleTimeoutRef.current) clearTimeout(jobRoleTimeoutRef.current);

    // if (!jobRoleSearch || jobRoleSearch.length < 3) {
    //   setJobRoleOptions([]);
    //   return;
    // }

    jobRoleTimeoutRef.current = setTimeout(async () => {
      try {
        setIsJobRoleLoading(true);
        const res = await axios.get(`${BASE_URL}/master/job-roles/search?search=${jobRoleSearch}`);
        const data = res.data?.data || [];
        setJobRoleOptions(data.map((r) => ({ value: r.title, label: r.title })));
      } catch (err) {
        console.error("Job role search failed:", err);
        setJobRoleOptions([]);
      } finally {
        setIsJobRoleLoading(false);
      }
    }, 400);

    return () => clearTimeout(jobRoleTimeoutRef.current);
  }, [jobRoleSearch]);

  // Debounced Location Search
  useEffect(() => {
    if (locationTimeoutRef.current) clearTimeout(locationTimeoutRef.current);

    // if (!locationSearch || locationSearch.length < 3) {
    //   setLocationOptions([]);
    //   return;
    // }

    locationTimeoutRef.current = setTimeout(async () => {
      try {
        setIsLocationLoading(true);
        const res = await axios.get(`${BASE_URL}/master/location/search?search=${locationSearch}`);
        const data = res.data?.data || [];
        setLocationOptions(data.map((l) => ({ value: l.name, label: l.name })));
      } catch (err) {
        console.error("Location search failed:", err);
        setLocationOptions([]);
      } finally {
        setIsLocationLoading(false);
      }
    }, 400);

    return () => clearTimeout(locationTimeoutRef.current);
  }, [locationSearch]);

  // Debounced Company Search
  useEffect(() => {
    if (companyTimeoutRef.current) clearTimeout(companyTimeoutRef.current);

    // if (!companySearch || companySearch.length < 3) {
    //   setCompanyOptions([]);
    //   return;
    // }

    companyTimeoutRef.current = setTimeout(async () => {
      try {
        setIsCompanyLoading(true);
        const res = await axios.get(`${BASE_URL}/master/companies/search?search=${companySearch}`);
        const data = res.data?.data || [];
        setCompanyOptions(data.map((c) => ({ value: c.company_name, label: c.company_name })));
      } catch (err) {
        console.error("Company search failed:", err);
        setCompanyOptions([]);
      } finally {
        setIsCompanyLoading(false);
      }
    }, 400);

    return () => clearTimeout(companyTimeoutRef.current);
  }, [companySearch]);

  const clearFilters = () => {
    setFilters({
      jobProfile: [],
      location: [],
      company: [],
      minSalary: "",
      opportunityType: [],
      audienceType: [],
      jobType: [],
      targetedOnly: false,
      sortBy: "relevance",
      sortOrder: "desc",
    });
  };

  const applyFilters = () => {
    updateURL(filters);
    if (window.innerWidth < 1024) {
      setIsFiltersOpen(false);
    }
  };

  // Format stipend like "5000 – 10000" → "₹5,000 – ₹10,000"
  const formatStipend = (range) => {
    if (!range) return "—";
    return range
      .split(" – ")
      .map((val) => {
        const num = parseInt(val.trim().replace(/,/g, ""));
        if (isNaN(num)) return val;
        return new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 0,
        }).format(num);
      })
      .join(" – ");
  };

  return (
    <div className="bg-[#f5f6f7] min-h-screen relative">
      <Header />
      <div className="px-3 pt-2 pb-4 mx-auto max-w-7xl sm:pt-3 md:pt-4 lg:pt-6 sm:pb-6 sm:px-4 md:px-6 lg:px-8">
        
        {/* Mobile Filter Toggle */}
        <div className="mb-3 lg:hidden sm:mb-4">
          <Button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            variant="outline"
            size="default"
            className="flex items-center justify-center w-full gap-2 px-4 py-3 transition-colors bg-white border border-gray-200 shadow rounded-xl hover:bg-gray-50"
          >
            {isFiltersOpen ? (
              <>
                <FaTimes className="text-sm text-gray-600" />
                <span className="text-sm font-medium">Close Filters</span>
              </>
            ) : (
              <>
                <FaFilter className="text-sm text-gray-600" />
                <span className="text-sm font-medium">Show Filters</span>
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-3 sm:gap-4 lg:gap-2 mx-2 sm:mx-4">
          
          {/* Left: Job Filters Component */}
          <div className={`${isFiltersOpen ? "block" : "hidden lg:block"} lg:min-h-[calc(100vh-120px)]`}>
            <JobFiltersPanel
              isOpen={true} 
              onClose={() => setIsFiltersOpen(false)}
              filters={filters}
              setFilters={setFilters}
              options={{
                jobProfiles: jobRoleOptions,
                locations: locationOptions,
                companies: companyOptions,
              }}
              loading={{
                jobProfiles: isJobRoleLoading,
                locations: isLocationLoading,
                companies: isCompanyLoading,
              }}
              search={{
                jobRoleSearchText: jobRoleSearch,
                setJobRoleSearchText: setJobRoleSearch,
                locationSearchText: locationSearch,
                setLocationSearchText: setLocationSearch,
                companySearchText: companySearch,
                setCompanySearchText: setCompanySearch,
              }}
              onApply={applyFilters}
              onClear={clearFilters}
            />
          </div>

          {/* Right: Jobs List */}
          <main className="bg-white rounded-2xl shadow-sm border-2 border-[#00C950] p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col min-h-[80vh]">
            <header className="mb-4 sm:mb-6">
              <h2 className="mb-2 text-xl font-extrabold text-gray-900 sm:text-2xl lg:text-3xl">
                University Jobs
              </h2>
              <p className="text-sm text-gray-500 sm:text-base">
                Jobs tied to your university appear first. Only viewable by university admins.
              </p>
            </header>

            {/* Targeted Summary Blocks */}
            {/* <div className="grid grid-cols-1 gap-3 mb-6 sm:grid-cols-3">
              {[
                { key: "jobs", label: "Jobs", valueKey: "job_count" },
                { key: "internships", label: "Internships", valueKey: "internship_count" },
                { key: "projects", label: "Projects", valueKey: "project_count" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setSelectedCompanyType(item.key)}
                  className="p-4 text-left transition border border-blue-100 rounded-xl bg-blue-50 hover:bg-blue-100"
                >
                  <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase">{item.label}</p>
                  <p className="mt-1 text-2xl font-extrabold text-blue-900">
                    {targetedSummary?.[item.valueKey] || 0}
                  </p>
                </button>
              ))}
            </div> */}
            {/* Targeted Summary Blocks */}
            <OpportunityCountCards
              summary={targetedSummary}
              selectedType={selectedCompanyType}
              onSelectType={setSelectedCompanyType}
              className="mb-6"
            />

            {/* Sort Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-7">
              <div className="text-sm text-gray-600">
                {jobs.length > 0 && (
                  <p className="mt-1 text-xs text-gray-400">
                    Showing {jobs.length} of {jobs.length} (load more below)
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {/* <label className="text-sm font-medium text-gray-700">Open to:</label>
                <select
                  value={filters.audienceType?.[0] || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilters((prev) => ({
                      ...prev,
                      audienceType: val ? [val] : [],
                    }));
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All</option>
                  <option value="open_to_all">Open to all</option>
                  <option value="open_to_freshers">Open to freshers</option>
                  <option value="open_to_experienced">Open to experienced</option>
                </select> */}
                <OpenToFilter
                  value={filters.audienceType?.[0] || ""}
                  onChange={(val) => setFilters(prev => ({ ...prev, audienceType: val ? [val] : [] }))}
                />
                {/* <label
                  htmlFor="sort"
                  className="text-sm font-medium text-gray-700"
                >
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split("-");
                    setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
                    updateURL({ ...filters, sortBy, sortOrder });
                  }}
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="relevance-desc">Relevance (My university first)</option>
                  <option value="created_at-desc">Posted Date (Newest)</option>
                  <option value="created_at-asc">Posted Date (Oldest)</option>
                </select> */}

                <UniversitySortBy
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(val) => {
                    const [sortBy, sortOrder] = val.split("-");
                    setFilters(prev => ({ ...prev, sortBy, sortOrder }));
                    updateURL({ ...filters, sortBy, sortOrder });
                  }}
                />
              </div>
            </div>

            {error && (
              <div className="py-4 text-center">
                <Button
                  onClick={refetch}
                  variant="secondary"
                  size="small"
                  className="px-4 py-2 text-sm text-white transition-colors bg-blue-500 rounded-lg hover:bg-blue-600"
                >
                  Refresh Jobs
                </Button>
              </div>
            )}

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-4 border border-gray-200 bg-gray-50 rounded-xl animate-pulse">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="w-3/4 h-4 bg-gray-200 rounded" />
                        <div className="w-1/2 h-3 bg-gray-200 rounded" />
                        <div className="flex gap-2">
                          <div className="w-20 h-5 bg-gray-200 rounded" />
                          <div className="w-20 h-5 bg-gray-200 rounded" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="py-12 text-center sm:py-16">
                <div className="mb-4 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No jobs yet</h3>
                <p className="mt-1 text-gray-500">
                  Check back soon — new jobs are posted daily.
                </p>
              </div>
            ) : (
              // <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6">
              //   {jobs.map((job, index) => {
              //     const isLast = index === jobs.length - 1;
              //     return (
              //       <Link
              //         key={job.job_id}
              //         to={`/university/jobs/${job.job_id}`}
              //         className="no-underline"
              //       >
              //         <article
              //           ref={isLast ? lastJobRef : null}
              //           className={`relative flex flex-col gap-3 p-4 transition-all duration-200 bg-white border shadow-sm cursor-pointer sm:flex-row sm:items-center sm:gap-4 lg:gap-6 rounded-xl sm:p-5 lg:p-6 hover:shadow-lg group ${
              //             job.targeting_our_college
              //               ? "border-blue-300 hover:border-blue-400"
              //               : "border-gray-200 hover:border-blue-200"
              //           }`}
              //           tabIndex={0}
              //           aria-label={`Job: ${job.jobRole} at ${job.company_name}`}
              //         >
              //           {/* For Your College Badge */}
              //           {job.targeting_our_college && (
              //             <div className="absolute z-10 -top-2 sm:-top-3 right-4">
              //               <span
              //                 className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-blue-600 rounded-full shadow-md animate-college-badge"
              //                 title="Posted specifically for students from your university"
              //               >
              //                 <FaGraduationCap className="text-white" size={12} />
              //                 For Your College
              //               </span>
              //             </div>
              //           )}

              //           {/* College-Specific Badge */}
              //           {job.is_college_specific && !job.targeting_our_college && (
              //             <div className="absolute z-10 -top-2 sm:-top-3 left-4">
              //               <Badge
              //                 color="bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
              //                 text="🎓 College-Specific"
              //                 className="text-xs font-semibold border border-indigo-200 shadow"
              //               />
              //             </div>
              //           )}

              //           {/* Logo */}
              //           <div className="flex-shrink-0">
              //             {job.logo_url ? (
              //               <img
              //                 src={getImageUrl(job.logo_url)}
              //                 alt={`${job.company_name} logo`}
              //                 className="object-contain w-12 h-12 bg-gray-100 border border-gray-200 rounded-lg sm:w-14 sm:h-14 lg:w-16 lg:h-16"
              //               />
              //             ) : (
              //               <div className="flex items-center justify-center w-12 h-12 bg-gray-100 border border-gray-200 rounded-lg sm:w-14 sm:h-14 lg:w-16 lg:h-16">
              //                 <span className="text-sm font-semibold text-gray-500">
              //                   {job.company_name.charAt(0).toUpperCase()}
              //                 </span>
              //               </div>
              //             )}
              //           </div>

              //           {/* Content */}
              //           <div className="flex-1 min-w-0 space-y-2 sm:space-y-3">
              //             <div>
              //               <h3 className="text-base font-bold leading-tight text-gray-900 transition-colors sm:text-lg lg:text-xl group-hover:text-blue-600">
              //                 {job.jobRole}
              //               </h3>
              //               <p className="text-sm font-semibold">{job.company_name}</p>
              //             </div>

              //             <div className="flex flex-wrap gap-2 sm:gap-3">
              //               <Badge color="bg-gray-100 text-gray-700 hover:bg-gray-200" className="text-xs border border-gray-200">
              //                 <FaMapMarkerAlt className="text-xs text-gray-400" />
              //                 <span className="truncate">{job.company_location}</span>
              //               </Badge>

              //               {job.job_type && (
              //                 <Badge color="bg-gray-100 text-gray-700 hover:bg-gray-200" className="text-xs border border-gray-200">
              //                   {job.job_type}
              //                 </Badge>
              //               )}
              //               {job.experience_range && (
              //                 <Badge color="bg-gray-100 text-gray-700 hover:bg-gray-200" className="text-xs border border-gray-200">
              //                   {job.experience_range}
              //                 </Badge>
              //               )}
              //               {job.stipend_range && (
              //                 <Badge color="bg-gray-100 text-gray-700 hover:bg-gray-200" className="text-xs border border-gray-200">
              //                   ₹{formatStipend(job.stipend_range)}
              //                 </Badge>
              //               )}
              //             </div>
              //           </div>

              //           {/* Right Info */}
              //           <div className="flex flex-col items-start sm:items-end gap-2 sm:gap-3 min-w-[120px] sm:min-w-[140px] lg:min-w-[160px]">
              //             {job.posted_days_ago && (
              //               <Badge color="bg-gray-100 text-gray-700 hover:bg-gray-200" className="text-sm font-semibold border border-gray-200">
              //                 {job.posted_days_ago}
              //               </Badge>
              //             )}
              //           </div>
              //         </article>
              //       </Link>
              //     );
              //   })}
              <div className="flex flex-col gap-3 sm:gap-4 lg:gap-6">
                {jobs.map((job, index) => {
                  const isLast = index === jobs.length - 1;
                  return (
                    <UniversityJobCard
                      key={job.job_id}
                      job={job}
                      to={`/university/jobs/${job.job_id}`}
                      lastRef={isLast ? lastJobRef : null}
                      showCollegeSpecificBadge={true}
                      useStudentTheme={true}
                    />
                  );
                })}

                {loadingMore && (
                  <div className="py-3 text-center">
                    <Loader message="Loading more jobs..." />
                  </div>
                )}

                {!loadingMore && !hasMore && jobs.length > 0 && (
                  <div className="py-3 mt-2 text-sm text-center text-gray-500 border-t border-gray-100">
                    🎓 End of list — all jobs loaded.
                  </div>
                )}
              </div>
            )}

            {/* Modal for Selected Company Type */}
            {selectedCompanyType && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                <div className="w-full max-w-xl bg-white border border-gray-200 shadow-2xl rounded-2xl">
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">
                      Companies for {selectedCompanyType}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setSelectedCompanyType(null)}
                      className="px-2 py-1 text-sm text-gray-500 rounded hover:bg-gray-100"
                    >
                      Close
                    </button>
                  </div>
                  <div className="max-h-[420px] overflow-y-auto p-4">
                    {(targetedSummary?.companies_by_type?.[selectedCompanyType] || []).length === 0 ? (
                      <p className="text-sm text-gray-500">No companies found.</p>
                    ) : (
                      <div className="space-y-3">
                        {targetedSummary.companies_by_type[selectedCompanyType].map((company) => (
                          <div
                            key={`${selectedCompanyType}-${company.company_id}`}
                            className="flex items-center justify-between p-3 border border-gray-100 rounded-xl"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-lg">
                                {company.logo_url ? (
                                  <img
                                    src={getImageUrl(company.logo_url)}
                                    alt={company.company_name}
                                    className="object-contain w-10 h-10 rounded-lg"
                                  />
                                ) : (
                                  <span className="text-sm font-semibold text-gray-600">
                                    {company.company_name?.charAt(0)?.toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <p className="font-semibold text-gray-900">{company.company_name}</p>
                            </div>
                            <span className="text-xs font-semibold text-blue-700">
                              {company.jobs_count} posting(s)
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default UniversityJobs;