// import React, { useState, useEffect, useMemo, useRef } from "react";
// import Header from "../../../components/shared/Header";
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
// import { Link, useSearchParams } from "react-router-dom";
// import { useGetJobApi } from "../../../hooks/useGetJobApi";
// import { useMasterData } from "../../../hooks/master/useMasterData";
// import { Input, Button, Loader, Checkbox, Badge } from "../../../components/ui";
// import { getImageUrl } from "../../../../utils.js";
// import Select from "react-select";
// import axios from "axios";
// const BASE_URL=import.meta.env.VITE_BASE_URL

// // Helper to safely parse integers
// const safeInt = (val, fallback = undefined) => {
//   const num = parseInt(val, 10);
//   return isNaN(num) ? fallback : num;
// };

// const getCityFromLocation = (fullLocation) => {
//   return fullLocation ? fullLocation.split(",")[0].trim() : "";
// };

// export default function AllJobs() {
//   const { allJobs,  error, refetch, pagination } = useGetJobApi();
//   const {
//     companies,
//     jobRoles,
//     locations,
//     isLoading: isMasterDataLoading,
//   } = useMasterData();

//   const [isFiltersOpen, setIsFiltersOpen] = useState(false);
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [showBackToTop, setShowBackToTop] = useState(false);
//   // 🔍 Location search (API based)
// // const [locationOptionsApi, setLocationOptionsApi] = useState([]);
// // const [locationSearchText, setLocationSearchText] = useState("");
// // const [isLocationLoading, setIsLocationLoading] = useState(false);
// // const locationSearchTimeoutRef = useRef(null);

//  const [locationSearchText, setLocationSearchText] = useState("");
//   const [locationOptions, setLocationOptions] = useState([]);
//   const [selectedLocations, setSelectedLocations] = useState([]);
//   const [isLocationLoading, setIsLocationLoading] = useState(false);
// // 🔍 Job Role search (API based)
// const [jobRoleOptionsApi, setJobRoleOptionsApi] = useState([]);
// const [jobRoleSearchText, setJobRoleSearchText] = useState("");
// const [isJobRoleLoading, setIsJobRoleLoading] = useState(false);
// const [selectedJobProfiles, setSelectedJobProfiles] = useState([]);
// const jobRoleSearchTimeoutRef = useRef(null);

// const [searchText, setSearchText] = useState("");
//   const [companyOptions, setCompanyOptions] = useState([]);
//   const [selectedCompanies, setSelectedCompanies] = useState([]);
//   const [loading, setLoading] = useState(false);

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

//   useEffect(() => {
//     if (locationSearchText.length < 3) {
//       setLocationOptions([]);
//       return;
//     }

//     const fetchLocations = async () => {
//       setIsLocationLoading(true);
//       try {
//         const res = await axios.get(
//           `${BASE_URL}/master/location/search?search=${locationSearchText}`
//         );
//         const options = res.data.data.map((l) => ({
//           value: l.name,
//           label: l.name,
//         }));
//         setLocationOptions(options);
//       } catch (err) {

//         console.error(err);
//         setLocationOptions([]);
//       }
//       setIsLocationLoading(false);
//     };

//     fetchLocations();
//   }, [locationSearchText]);

// //profile serach
// useEffect(() => {
//   if (jobRoleSearchTimeoutRef.current) {
//     clearTimeout(jobRoleSearchTimeoutRef.current);
//   }

//   if (!jobRoleSearchText || jobRoleSearchText.length < 3) {
//     setJobRoleOptionsApi([]);
//     return;
//   }

//   jobRoleSearchTimeoutRef.current = setTimeout(async () => {
//     try {
//       setIsJobRoleLoading(true);

//       const res = await axios.get(
//         `${BASE_URL}/master/job-roles/search?search=${jobRoleSearchText}`
//       );

//       const data = res.data?.data || [];

//       setJobRoleOptionsApi(
//         data.map((role) => ({
//           label: role.title,
//           value: role.title,
//         }))
//       );
//     } catch (err) {
//       console.error("Job role search failed", err);
//       setJobRoleOptionsApi([]);
//     } finally {
//       setIsJobRoleLoading(false);
//     }
//   }, 400); // debounce

//   return () => clearTimeout(jobRoleSearchTimeoutRef.current);
// }, [jobRoleSearchText]);

// //company search
// useEffect(() => {
//     if (searchText.length < 3) {
//       setCompanyOptions([]);
//       return;
//     }

//     const fetchCompanies = async () => {
//       setLoading(true);
//       try {
//         const res = await axios.get(
//           `${BASE_URL}/master/companies/search?search=${searchText}`
//         );
//         const options = res.data.data.map((c) => ({
//           value: c.company_name,
//           label: c.company_name,
//         }));
//         setCompanyOptions(options);
//       } catch (err) {
//         console.error(err);
//         setCompanyOptions([]);
//       }
//       setLoading(false);
//     };

//     fetchCompanies();
//   }, [searchText]);

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

//   const handleLocationChange = (options) => {
//   if (!options) {
//     setSelectedLocations([]);
//     setFilters((prev) => ({ ...prev, location: [] }));
//     return;
//   }

//   if (options.length <= 3) {
//     setSelectedLocations(options);
//     setFilters((prev) => ({
//       ...prev,
//       location: options.map((o) => getCityFromLocation(o.value)),
//     }));
//   }
// };

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
// const handleChange = (options) => {
//     if (options.length <= 3) {
//       setSelectedCompanies(options);
//       setFilters({ ...filters, company: options.map((o) => o.value) });
//     }
//   };

//   const handleJobProfileChange = (options) => {
//   if (!options) {
//     setSelectedJobProfiles([]);
//     setFilters((prev) => ({ ...prev, jobProfile: [] }));
//     return;
//   }

//   if (options.length <= 3) {
//     setSelectedJobProfiles(options);
//     setFilters((prev) => ({
//       ...prev,
//       jobProfile: options.map((o) => o.value),
//     }));
//   }
// };

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

//   const jobRoleOptions = useMemo(
//     () => jobRoles.map((r) => ({ label: r.title, value: r.title })),
//     [jobRoles]
//   );
//   // const locationOptions = useMemo(
//   //   () => locations.map((l) => ({ label: l.name, value: l.name })),
//   //   [locations]
//   // );

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
//                <Select
//   isMulti
//   options={jobRoleOptionsApi}
//   value={selectedJobProfiles}   //  controlled value
//   onChange={handleJobProfileChange}
//   onInputChange={(value, { action }) => {
//     if (action === "input-change") {
//       setJobRoleSearchText(value);
//     }
//   }}
//   isLoading={isJobRoleLoading}
//   placeholder="Search job profiles (min 3 chars)..."
//   className="w-full text-sm"
//   classNamePrefix="select"
//   styles={selectStyles}
//   isClearable
//   isSearchable
//   noOptionsMessage={() =>
//     jobRoleSearchText.length < 3
//       ? "Type at least 3 characters"
//       : "No job roles found"
//   }
// />

//                 )}
//               </div>

// {/*location*/}
//               <div className="flex flex-col gap-2">
//       <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//         <FaMapMarkerAlt className="text-gray-400" /> Location
//       </label>

//       <Select
//         isMulti
//         options={locationOptions}
//         value={selectedLocations} // Use selected state
//         onChange={handleLocationChange}
//         onInputChange={(value) => setLocationSearchText(value)}
//         isLoading={isLocationLoading}
//         placeholder="Search locations (min 3 chars)..."
//         className="w-full text-sm"
//         classNamePrefix="select"
//         isClearable
//         isSearchable
//         noOptionsMessage={() =>
//           locationSearchText.length < 3
//             ? "Type at least 3 characters"
//             : "No locations found"
//         }
//       />

//       <div className="flex flex-wrap gap-2 mt-2">
//         <Checkbox
//           checked={filters.jobType.includes("remote")}
//           onChange={() => toggleJobType("remote")}
//           label="Remote"
//           className="flex items-center gap-2 p-0 text-sm font-medium bg-transparent border-0"
//         />
//         <Checkbox
//           checked={filters.jobType.includes("hybrid")}
//           onChange={() => toggleJobType("hybrid")}
//           label="Hybrid"
//           className="flex items-center gap-2 p-0 text-sm font-medium bg-transparent border-0"
//         />
//         <Checkbox
//           checked={filters.jobType.includes("in office")}
//           onChange={() => toggleJobType("in office")}
//           label="In Office"
//           className="flex items-center gap-2 p-0 text-sm font-medium bg-transparent border-0"
//         />
//       </div>
//     </div>

//             <div className="flex flex-col gap-2">
//       <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
//         <FaBuilding className="text-gray-400" /> Company
//       </label>

//       <Select
//         isMulti
//         options={companyOptions}
//         value={selectedCompanies}
//         onChange={handleChange}
//         onInputChange={(value) => setSearchText(value)}
//         placeholder="Type 3+ characters to search companies..."
//         className="w-full text-sm"
//         classNamePrefix="select"
//         isClearable
//         isSearchable
//         isLoading={loading}
//       />
//       <p className="mt-1 text-xs text-gray-500">
//         You can select up to 3 companies
//       </p>
//     </div>

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

//             </header>

//             {/* Sort Controls */}
//             <div className="flex flex-wrap items-center justify-between mb-4">
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

//                     // Minimal change: apply filters immediately + reset offset
//                     const newParams = new URLSearchParams(searchParams);
//                     newParams.set("sortBy", sortBy);
//                     newParams.set("sortOrder", sortOrder);
//                     newParams.set("offset", "0"); // reset scroll offset on sort change
//                     setSearchParams(newParams);
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
//                   <Link
//                     key={job.job_id}
//                     to={`/jobs/${job.job_id}`}
//                     className="no-underline"
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

//                       {/* Top badges container - moved inside card */}
//                       {/* <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
//                         {job.skill_missing && (
//                           <Link
//                             to="/mypathway"
//                             state={{
//                               jobId: job.job_id,
//                               jobTitle: job.jobRole,
//                               companyName: job.company_name,
//                             }}
//                             className="inline-block"
//                             onClick={(e) => e.stopPropagation()}
//                           >
//                             <Badge
//                               color="bg-blue-600 text-white hover:bg-blue-700"
//                               text="skills required ?"
//                               className="text-xs font-semibold border border-blue-700 shadow-lg cursor-pointer"
//                             />
//                           </Link>
//                         )}

//                         {job.is_targeted_to_user_college && (
//                           <span
//                             className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-blue-600 rounded-full shadow-md animate-college-badge"
//                             title="This job is specifically posted for students from your college."
//                           >
//                             <FaGraduationCap className="text-white" size={12} />
//                             For Your College
//                           </span>
//                         )}
//                       </div> */}

//                       {/* {job.skill_missing && (
//                         <div className="absolute z-10 -top-2 sm:-top-3 left-4">
//                           <Link
//                             to="/mypathway"
//                             state={{
//                               jobId: job.job_id,
//                               jobTitle: job.jobRole,
//                               companyName: job.company_name,
//                               // companyId: job.company_id,
//                             }}
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
//                       )} */}

//                       {/* Top badges - Absolute positioning on desktop, flex on mobile */}
//                       {/* Desktop view - Absolute positioning (original) */}
//                       {job.skill_missing && (
//                         <div className="absolute z-10 hidden sm:block -top-2 sm:-top-3 left-4">
//                           <Link
//                             to="/mypathway"
//                             state={{
//                               jobId: job.job_id,
//                               jobTitle: job.jobRole,
//                               companyName: job.company_name,
//                             }}
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
//                         <div className="absolute z-10 hidden sm:block -top-2 sm:-top-3 right-4">
//                           <span
//                             className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-blue-600 rounded-full shadow-md animate-college-badge"
//                             title="This job is specifically posted for students from your college."
//                           >
//                             <FaGraduationCap className="text-white" size={12} />
//                             For Your College
//                           </span>
//                         </div>
//                       )}

//                       {/* Mobile view - Flex layout (keep as is) */}
//                       <div className="flex flex-wrap items-center justify-between gap-2 mb-2 sm:hidden">
//                         {job.skill_missing && (
//                           <Link
//                             to="/mypathway"
//                             state={{
//                               jobId: job.job_id,
//                               jobTitle: job.jobRole,
//                               companyName: job.company_name,
//                             }}
//                             className="inline-block"
//                             onClick={(e) => e.stopPropagation()}
//                           >
//                             <Badge
//                               color="bg-blue-600 text-white hover:bg-blue-700"
//                               text="skills required ?"
//                               className="text-xs font-semibold border border-blue-700 shadow-lg cursor-pointer"
//                             />
//                           </Link>
//                         )}

//                         {job.is_targeted_to_user_college && (
//                           <span
//                             className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-white bg-blue-600 rounded-full shadow-md animate-college-badge"
//                             title="This job is specifically posted for students from your college."
//                           >
//                             <FaGraduationCap className="text-white" size={12} />
//                             For Your College
//                           </span>
//                         )}
//                       </div>

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
// {/* === MANDATORY & PREFERRED SKILL BADGES === */}
// {/* === MANDATORY & PREFERRED SKILL BADGES === */}
// <div className="flex flex-col items-start w-full gap-2 sm:items-end">
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
//     {/* Tooltip - positioned above */}
//     <div className="absolute z-10 hidden px-2 py-1 text-xs text-white bg-gray-800 rounded shadow -top-8 right-0 group-hover:block max-w-[200px] text-center sm:max-w-xs">
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
//       {/* Tooltip - positioned below to avoid overlap */}
//       <div className="absolute z-10 hidden px-2 py-1 text-xs text-white bg-gray-800 rounded shadow top-full mt-1 right-0 group-hover:block max-w-[200px] text-center sm:max-w-xs">
//         Match on preferred (nice-to-have) skills
//       </div>
//     </div>
//   )}
// </div>

//                       </div>
//                     </article>
//                   </Link>
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

// import React, { useState, useEffect, useMemo, useRef } from "react";
// import Header from "../../../components/shared/Header";
// import JobFiltersPanel from "../../../components/job/JobFilter.jsx";
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
//   FaCheckCircle,
// } from "react-icons/fa";
// import { Link, useSearchParams } from "react-router-dom";
// import { useGetJobApi } from "../../../hooks/useGetJobApi";
// import { useMasterData } from "../../../hooks/master/useMasterData";
// import { Input, Button, Loader, Checkbox, Badge } from "../../../components/ui";
// import ForYourCollegeBadge from "../../../components/jobs/ForYourCollegeBadge";
// import MustHaveSkillsBadge from "../../../components/jobs/MustHaveSkillsBadge";
// import { getImageUrl } from "../../../../utils.js";
// import Select from "react-select";
// import axios from "axios";
// const BASE_URL = import.meta.env.VITE_BASE_URL;

// // Helper to safely parse integers
// const safeInt = (val, fallback = undefined) => {
//   const num = parseInt(val, 10);
//   return isNaN(num) ? fallback : num;
// };

// const getCityFromLocation = (fullLocation) => {
//   return fullLocation ? fullLocation.split(",")[0].trim() : "";
// };

// export default function AllJobs() {
//   const { allJobs, error, refetch, pagination } = useGetJobApi();
//   const {
//     companies,
//     jobRoles,
//     locations,
//     isLoading: isMasterDataLoading,
//   } = useMasterData();

//   const [isFiltersOpen, setIsFiltersOpen] = useState(false);
//   const [searchParams, setSearchParams] = useSearchParams();
//   const [showBackToTop, setShowBackToTop] = useState(false);

//   const [locationSearchText, setLocationSearchText] = useState("");
//   const [locationOptions, setLocationOptions] = useState([]);
//   const [selectedLocations, setSelectedLocations] = useState([]);
//   const [isLocationLoading, setIsLocationLoading] = useState(false);

//   // 🔍 Job Role search (API based)
//   const [jobRoleOptionsApi, setJobRoleOptionsApi] = useState([]);
//   const [jobRoleSearchText, setJobRoleSearchText] = useState("");
//   const [isJobRoleLoading, setIsJobRoleLoading] = useState(false);
//   const [selectedJobProfiles, setSelectedJobProfiles] = useState([]);
//   const jobRoleSearchTimeoutRef = useRef(null);

//   const [searchText, setSearchText] = useState("");
//   const [companyOptions, setCompanyOptions] = useState([]);
//   const [selectedCompanies, setSelectedCompanies] = useState([]);
//   const [loading, setLoading] = useState(false);

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

//   useEffect(() => {
//     if (locationSearchText.length < 3) {
//       setLocationOptions([]);
//       return;
//     }

//     const fetchLocations = async () => {
//       setIsLocationLoading(true);
//       try {
//         const res = await axios.get(
//           `${BASE_URL}/master/location/search?search=${locationSearchText}`
//         );
//         const options = res.data.data.map((l) => ({
//           value: l.name,
//           label: l.name,
//         }));
//         setLocationOptions(options);
//       } catch (err) {
//         console.error(err);
//         setLocationOptions([]);
//       }
//       setIsLocationLoading(false);
//     };

//     fetchLocations();
//   }, [locationSearchText]);

//   //profile serach
//   useEffect(() => {
//     if (jobRoleSearchTimeoutRef.current) {
//       clearTimeout(jobRoleSearchTimeoutRef.current);
//     }

//     if (!jobRoleSearchText || jobRoleSearchText.length < 3) {
//       setJobRoleOptionsApi([]);
//       return;
//     }

//     jobRoleSearchTimeoutRef.current = setTimeout(async () => {
//       try {
//         setIsJobRoleLoading(true);

//         const res = await axios.get(
//           `${BASE_URL}/master/job-roles/search?search=${jobRoleSearchText}`
//         );

//         const data = res.data?.data || [];

//         setJobRoleOptionsApi(
//           data.map((role) => ({
//             label: role.title,
//             value: role.title,
//           }))
//         );
//       } catch (err) {
//         console.error("Job role search failed", err);
//         setJobRoleOptionsApi([]);
//       } finally {
//         setIsJobRoleLoading(false);
//       }
//     }, 400); // debounce

//     return () => clearTimeout(jobRoleSearchTimeoutRef.current);
//   }, [jobRoleSearchText]);

//   //company search
//   useEffect(() => {
//     if (searchText.length < 3) {
//       setCompanyOptions([]);
//       return;
//     }

//     const fetchCompanies = async () => {
//       setLoading(true);
//       try {
//         const res = await axios.get(
//           `${BASE_URL}/master/companies/search?search=${searchText}`
//         );
//         const options = res.data.data.map((c) => ({
//           value: c.company_name,
//           label: c.company_name,
//         }));
//         setCompanyOptions(options);
//       } catch (err) {
//         console.error(err);
//         setCompanyOptions([]);
//       }
//       setLoading(false);
//     };

//     fetchCompanies();
//   }, [searchText]);

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
//   }, [searchParams]);

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

//   const handleLocationChange = (options) => {
//     if (!options) {
//       setSelectedLocations([]);
//       setFilters((prev) => ({ ...prev, location: [] }));
//       return;
//     }

//     if (options.length <= 3) {
//       setSelectedLocations(options);
//       setFilters((prev) => ({
//         ...prev,
//         location: options.map((o) => getCityFromLocation(o.value)),
//       }));
//     }
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

//   const handleChange = (options) => {
//     if (options.length <= 3) {
//       setSelectedCompanies(options);
//       setFilters({ ...filters, company: options.map((o) => o.value) });
//     }
//   };

//   const handleJobProfileChange = (options) => {
//     if (!options) {
//       setSelectedJobProfiles([]);
//       setFilters((prev) => ({ ...prev, jobProfile: [] }));
//       return;
//     }

//     if (options.length <= 3) {
//       setSelectedJobProfiles(options);
//       setFilters((prev) => ({
//         ...prev,
//         jobProfile: options.map((o) => o.value),
//       }));
//     }
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

//   const jobRoleOptions = useMemo(
//     () => jobRoles.map((r) => ({ label: r.title, value: r.title })),
//     [jobRoles]
//   );

//   const sortOptions = useMemo(
//     () => [
//       { value: "relevance-desc", label: "Relevance (Targeted first)" },
//       { value: "postedAt-desc", label: "Posted Date (Newest)" },
//       { value: "postedAt-asc", label: "Posted Date (Oldest)" },
//       { value: "matchPercentage-desc", label: "Match % (High to Low)" },
//       { value: "matchPercentage-asc", label: "Match % (Low to High)" },
//     ],
//     []
//   );

//   const menuPortalTarget = typeof document !== "undefined" ? document.body : null;

//   // react-select styles
//   const selectStyles = {
//     control: (base, state) => ({
//       ...base,
//       minHeight: "36px",
//       fontSize: "0.875rem",
//       borderColor: state.isFocused ? "#9bc87c" : "#e5e7eb",
//       boxShadow: state.isFocused ? "0 0 0 1px #9bc87c" : "none",
//       "&:hover": {
//         borderColor: state.isFocused ? "#9bc87c" : "#d1d5db",
//       },
//     }),
//     input: (base) => ({ ...base, fontSize: "0.875rem" }),
//     option: (base, state) => ({
//       ...base,
//       fontSize: "0.875rem",
//       backgroundColor: state.isSelected
//         ? "#9bc87c"
//         : state.isFocused
//         ? "#eaf5e1"
//         : "white",
//       color: state.isSelected ? "#1e1e2d" : base.color,
//     }),
//     multiValue: (base) => ({ ...base, fontSize: "0.875rem", backgroundColor: "#f3f4f6" }),
//     menu: (base) => ({ ...base, zIndex: 9999 }),
//     menuPortal: (base) => ({ ...base, zIndex: 9999 }),
//   };

//   return (
//     <div className="bg-gray-50 min-h-screen relative">
//       <Header />
//       <div className="px-3 pt-2 pb-4 mx-auto max-w-7xl sm:pt-3 md:pt-4 lg:pt-6 sm:pb-6 sm:px-4 md:px-6 lg:px-8">
//         {/* Mobile Filter Toggle */}
//         <div className="mb-3 lg:hidden sm:mb-4">
//           <Button
//             onClick={toggleFilters}
//             variant="outline"
//             size="default"
//             // className="flex items-center justify-center w-full gap-2 px-4 py-3 transition-colors bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-[#1e1e2d] shadow-none"

//             className="flex items-center justify-center w-full gap-2 px-4 py-3 transition-colors bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-[#1e1e2d] shadow-none outline-none focus:outline-none focus:ring-0 active:outline-none"
//           >
//             {isFiltersOpen ? (
//               <>
//                 <FaTimes className="text-sm" />
//                 <span className="text-sm font-medium">Close Filters</span>
//               </>
//             ) : (
//               <>
//                 <FaFilter className="text-sm" />
//                 <span className="text-sm font-medium">Show Filters</span>
//               </>
//             )}
//           </Button>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] items-start gap-3 sm:gap-4 lg:gap-8 mx-2 sm:mx-4">
//           {/* Left: Job Filters */}
//          <JobFiltersPanel
//   isOpen={isFiltersOpen ? true : undefined} // panel will be controlled by your layout
//   onClose={() => setIsFiltersOpen(false)}
//   filters={filters}
//   setFilters={setFilters}
//   options={{
//     jobProfiles: jobRoleOptionsApi,
//     locations: locationOptions,
//     companies: companyOptions,
//   }}
//   loading={{
//     jobProfiles: isJobRoleLoading,
//     locations: isLocationLoading,
//     companies: loading,
//   }}
//   search={{
//     jobRoleSearchText,
//     setJobRoleSearchText,
//     locationSearchText,
//     setLocationSearchText,
//     companySearchText: searchText,
//     setCompanySearchText: setSearchText,
//   }}
//   onApply={applyFilters}
//   onClear={clearFilters}
// />

//           {/* Right: Jobs List */}
//           <main className="bg-white rounded-2xl shadow-sm border-2 border-[#00C950] p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col min-h-[80vh]">
//             <header className="mb-5 sm:mb-6">
//               <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//                 <div>
//                   <h2 className="text-xl font-extrabold text-[#1e1e2d] sm:text-2xl lg:text-3xl">
//                     The Opportunity Hub
//                   </h2>
//                   <p className="mt-1 text-sm text-gray-500 sm:text-base">
//                     Discover jobs, internships, and projects tailored to your skills and career goals.
//                   </p>
//                 </div>

//                 {/* <Link
//                   to="/student-applications"
//                   className="flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 bg-[#1e1e2d] hover:bg-[#2a2a3b] text-white font-semibold text-sm sm:text-base rounded-lg transition-colors"
//                   aria-label="View your job applications"
//                 >
//                   <FaUserTie className="text-[#9bc87c]" />
//                   <span>My Applications</span>
//                 </Link> */}

//                 <Link
//   to="/student-applications"
//   // className="flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 bg-[#1DB32F] hover:bg-[#18a728] text-white font-semibold text-sm sm:text-base rounded-lg transition-colors"
//   className="flex items-center justify-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 bg-[#1DB32F] hover:bg-[#18a728] text-white font-semibold text-sm sm:text-base rounded-lg transition-colors outline-none focus:outline-none focus:ring-0 active:outline-none"
//   aria-label="View your job applications"
// >
//   <FaUserTie className="text-white" />
//   <span>My Applications</span>
// </Link>
//               </div>
//             </header>

//             {/* Sort Controls */}
//             <div className="flex flex-wrap items-center justify-between mb-4">
//               <div className="text-sm font-medium text-gray-600">
//                 {pagination?.total || 0} opportunities
//               </div>
//               <div className="flex items-center gap-2">
//                 <span className="text-sm font-medium text-[#1e1e2d]">Sort by:</span>
//                 <div className="min-w-[220px]">
//                   <Select
//                     inputId="sort-by"
//                     isSearchable={false}
//                     options={sortOptions}
//                     value={sortOptions.find(
//                       (o) => o.value === `${filters.sortBy}-${filters.sortOrder}`
//                     )}
//                     onChange={(opt) => {
//                       if (!opt?.value) return;
//                       const [sortBy, sortOrder] = opt.value.split("-");

//                       setFilters((prev) => ({
//                         ...prev,
//                         sortBy,
//                         sortOrder,
//                       }));

//                       const newParams = new URLSearchParams(searchParams);
//                       newParams.set("sortBy", sortBy);
//                       newParams.set("sortOrder", sortOrder);
//                       newParams.set("offset", "0");
//                       setSearchParams(newParams);
//                     }}
//                     className="text-sm"
//                     classNamePrefix="select"
//                     styles={selectStyles}
//                     menuPortalTarget={menuPortalTarget}
//                     menuPosition="fixed"
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Job Cards */}
//             <section className="flex flex-col gap-3 sm:gap-4">
//               {loading && (
//                 <div className="py-8 text-center sm:py-12">
//                   <Loader message="Loading opportunities..." />
//                 </div>
//               )}

//               {error && (
//                 <div className="py-8 text-center sm:py-12">
//                   <p className="mb-4 text-sm text-red-600 sm:text-base">
//                     Error loading opportunities: {error}
//                   </p>
//                   <Button
//                     onClick={() => refetch()}
//                     variant="secondary"
//                     size="small"
//                     className="px-4 py-2 text-sm text-[#1e1e2d] bg-gray-100 transition-colors rounded-lg hover:bg-gray-200 shadow-none"
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
//                   <Link
//                     key={job.job_id}
//                     to={`/jobs/${job.job_id}`}
//                     className="no-underline group"
//                   >
//                     <article
//                       className={`relative flex flex-col gap-3 p-4 transition-all duration-300 bg-white border border-gray-100 shadow-sm cursor-pointer sm:flex-row sm:items-start sm:gap-4 lg:gap-6 rounded-xl hover:shadow-md hover:scale-[1.005]
//     ${job.is_targeted_to_user_college ? "ring-1 ring-[#9bc87c]" : ""}`}
//                       tabIndex={0}
//                       aria-label={`Job: ${job.jobRole} at ${job.company_name}`}
//                     >
//                       {/* Desktop Absolute Tags */}
//                       {job.skill_missing && (
//                         <div className="absolute z-10 hidden sm:block -top-3 left-4">
//                           <Link
//                             to="/mypathway"
//                             state={{
//                               jobId: job.job_id,
//                               jobTitle: job.jobRole,
//                               companyName: job.company_name,
//                             }}
//                             className="inline-block"
//                             onClick={(e) => e.stopPropagation()}
//                           >
//                             <Badge
//                               color="bg-white text-[#1e1e2d] hover:bg-gray-50"
//                               text="Skills required?"
//                               className="text-xs font-semibold border border-[#9bc87c] shadow-sm cursor-pointer"
//                             />
//                           </Link>
//                         </div>
//                       )}

//                       {job.is_targeted_to_user_college &&
//                       (
//                         <div className="absolute z-10 hidden sm:block -top-3 right-4">
//                           <span
//                             className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-[#1e1e2d] bg-[#9bc87c] rounded-full shadow-sm"
//                             title="This job is specifically posted for students from your college."
//                           >
//                             <FaGraduationCap className="text-[#1e1e2d]" size={12} />
//                             For Your College
//                           </span>
//                         </div>
//                       )}

//                       {/* Mobile Flex Tags */}
//                       <div className="flex flex-wrap items-center justify-between gap-2 mb-1 sm:hidden">
//                         {job.skill_missing && (
//                           <Link
//                             to="/mypathway"
//                             state={{
//                               jobId: job.job_id,
//                               jobTitle: job.jobRole,
//                               companyName: job.company_name,
//                             }}
//                             className="inline-block"
//                             onClick={(e) => e.stopPropagation()}
//                           >
//                             <Badge
//                               color="bg-white text-[#1e1e2d] hover:bg-gray-50"
//                               text="Skills required?"
//                               className="text-xs font-semibold border border-[#9bc87c] shadow-sm cursor-pointer"
//                             />
//                           </Link>
//                         )}
//                         {job.is_targeted_to_user_college && (
//                           <ForYourCollegeBadge className="text-[10px] font-bold" />
//                         )}
//                       </div>

//                       <div className="flex-shrink-0">
//                         <div className="flex items-center justify-center w-12 h-12 bg-white border border-gray-100 rounded-lg sm:w-14 sm:h-14 lg:w-16 lg:h-16">
//                           <img
//                             src={getImageUrl(job.logo_url)}
//                             alt={`${job.company_name} logo`}
//                             className="object-contain w-10 h-10 p-1 sm:w-12 sm:h-12 lg:w-14 lg:h-14"
//                             onError={(e) => { e.target.style.display = 'none'; }}
//                           />
//                         </div>
//                       </div>

//                       <div className="flex-1 min-w-0 space-y-3">
//                         <div>
//                           <h3 className="text-base font-bold text-[#1e1e2d] truncate sm:text-lg lg:text-xl">
//                             {job.jobRole}
//                           </h3>
//                           <p className="mt-1 text-sm text-[#1e1e2d]">
//                             {job.company_name}
//                           </p>
//                         </div>

//                         <div className="flex flex-wrap items-center gap-1.5 mt-3">
//                           <span className="px-3 py-1.5 text-gray-700 bg-gray-100 rounded-full text-xs">
//                             <FaMapMarkerAlt className="inline mr-1 text-gray-500" />
//                             {job.company_location}
//                           </span>

//                           {job.experience && (
//                             <span className="px-3 py-1.5 text-gray-700 bg-gray-100 rounded-full text-xs">
//                               <FaUserTie className="inline mr-1 text-gray-500" />
//                               {(() => {
//                                 const words = job.experience.split(" ");
//                                 return words.length > 4
//                                   ? words.slice(0, 4).join(" ") + "..."
//                                   : job.experience;
//                               })()}
//                             </span>
//                           )}

//                           {job.salary && (
//                             <span className="px-3 py-1.5 text-gray-700 bg-gray-100 rounded-full text-xs">
//                               <FaMoneyBillWave className="inline mr-1 text-gray-500" />
//                               {job.salary}
//                             </span>
//                           )}
//                         </div>
//                       </div>

//                       <div className="flex flex-col items-start sm:items-end gap-2 flex-shrink-0 mt-2 sm:mt-0">
//                         <span className="text-[11px] bg-[#1DB32F] text-white px-3 py-1 rounded-full whitespace-nowrap inline-flex items-center">
//                           <FaCheckCircle className="mr-1" /> {job.hiring_status || "Hiring"}
//                         </span>

//                         <span className="text-[11px] bg-gray-50 text-gray-600 px-3 py-1 rounded-full border whitespace-nowrap">
//                           {job.posted_days_ago}
//                         </span>

//                         <div className="flex flex-col items-start w-full gap-1.5 mt-2 sm:items-end">
//                           <div className="relative group">
//                             <span
//                               className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md border ${
//                                 job.mandatorySkillsMet
//                                   ? "bg-gray-50 text-gray-700 border-gray-200"
//                                   : "bg-red-50 text-red-700 border-red-100"
//                               }`}
//                             >
//                               {job.mandatorySkillsMet ? "Must Have Skills ✅ Yes" : "Must Have Skills ❌ No"}
//                             </span>
//                             <div className="absolute z-10 hidden px-2 py-1 text-xs text-white bg-gray-800 rounded shadow -top-8 right-0 group-hover:block max-w-[200px] text-center sm:max-w-xs">
//                               All mandatory skills required for this job
//                             </div>
//                           </div>

//                           {typeof job.preferredSkillMatch === "number" && (
//                             <div className="relative group">
//                               <span
//                                 className={`inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded-md border ${
//                                   job.preferredSkillMatch >= 80
//                                     ? "bg-[#9bc87c]/10 text-[#1e1e2d] border-[#9bc87c]/50"
//                                     : job.preferredSkillMatch >= 50
//                                     ? "bg-yellow-50 text-yellow-800 border-yellow-200"
//                                     : "bg-gray-50 text-gray-600 border-gray-200"
//                                 }`}
//                               >
//                                 Preferred Skills: 🎯 {Math.round(job.preferredSkillMatch)}%
//                               </span>
//                               <div className="absolute z-10 hidden px-2 py-1 text-xs text-white bg-gray-800 rounded shadow top-full mt-1 right-0 group-hover:block max-w-[200px] text-center sm:max-w-xs">
//                                 Match on preferred (nice-to-have) skills
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </article>
//                   </Link>
//                 ))}

//               {!loading && !error && (!allJobs || allJobs.length === 0) && (
//                 <div className="py-12 text-center sm:py-16">
//                   <p className="text-lg text-gray-500">No opportunities found.</p>
//                 </div>
//               )}

//               {!loading &&
//                 allJobs?.length > 0 &&
//                 pagination &&
//                 allJobs.length < pagination.total && (
//                   <div className="py-4 text-center">
//                     <Loader message="Loading more opportunities..." />
//                   </div>
//                 )}
//               <div
//                 ref={sentinelRef}
//                 style={{ height: "1px", margin: 0, padding: 0 }}
//               />
//             </section>
//           </main>
//         </div>
//       </div>

//       {/* Back to Top Button */}
//       {showBackToTop && (
//         <button
//           onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
//           // className="fixed z-10 p-3 text-[#1e1e2d] transition-colors bg-[#9bc87c] rounded-full shadow-lg bottom-6 right-6 hover:bg-[#8ab76b]"
//           className="fixed z-10 p-3 text-white transition-colors bg-[#1DB32F] rounded-full shadow-lg bottom-6 right-6 hover:bg-[#18a728] outline-none focus:ring-0 active:outline-none"
//           aria-label="Back to top"
//         >
//           <FaArrowUp />
//         </button>
//       )}
//     </div>
//   );
// }

import React, { useState, useEffect, useMemo, useRef } from "react";
import Header from "../../../components/shared/Header";
import JobFiltersPanel from "../../../components/job/JobFilter.jsx";
import { FaFilter, FaTimes, FaArrowUp } from "react-icons/fa";
import { useSearchParams } from "react-router-dom";
import { useGetJobApi } from "../../../hooks/useGetJobApi";
import { useMasterData } from "../../../hooks/master/useMasterData";
import { Button, Loader } from "../../../components/ui";
import axios from "axios";

// Imported Refactored Components
import OpportunitiesCount from "../../../components/jobs/OpportunitiesCount";
import MyApplicationsButton from "../../../components/jobs/MyApplicationsButton";
import SortBySelect from "../../../components/jobs/SortBySelect";
import JobOpportunityCard from "../../../components/jobs/JobOpportunityCard";
import OpportunityHubHeader from "../../../components/jobs/OpportunityHubHeader.jsx";
const BASE_URL = import.meta.env.VITE_BASE_URL;

// Helper to safely parse integers
const safeInt = (val, fallback = undefined) => {
  const num = parseInt(val, 10);
  return isNaN(num) ? fallback : num;
};

const getCityFromLocation = (fullLocation) => {
  return fullLocation ? fullLocation.split(",")[0].trim() : "";
};

export default function AllJobs() {
  const { allJobs, error, refetch, pagination } = useGetJobApi();
  const {
    companies,
    jobRoles,
    locations,
    isLoading: isMasterDataLoading,
  } = useMasterData();

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showBackToTop, setShowBackToTop] = useState(false);

  const [locationSearchText, setLocationSearchText] = useState("");
  const [locationOptions, setLocationOptions] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [isLocationLoading, setIsLocationLoading] = useState(false);

  // 🔍 Job Role search (API based)
  const [jobRoleOptionsApi, setJobRoleOptionsApi] = useState([]);
  const [jobRoleSearchText, setJobRoleSearchText] = useState("");
  const [isJobRoleLoading, setIsJobRoleLoading] = useState(false);
  const [selectedJobProfiles, setSelectedJobProfiles] = useState([]);
  const jobRoleSearchTimeoutRef = useRef(null);

  const [searchText, setSearchText] = useState("");
  const [companyOptions, setCompanyOptions] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    // if (locationSearchText.length < 3) {
    //   setLocationOptions([]);
    //   return;
    // }

    const fetchLocations = async () => {
      setIsLocationLoading(true);
      try {
        const res = await axios.get(
          `${BASE_URL}/master/location/search?search=${locationSearchText}`,
        );
        const options = res.data.data.map((l) => ({
          value: l.name,
          label: l.name,
        }));
        setLocationOptions(options);
      } catch (err) {
        console.error(err);
        setLocationOptions([]);
      }
      setIsLocationLoading(false);
    };

    fetchLocations();
  }, [locationSearchText]);

  //profile serach
  useEffect(() => {
    if (jobRoleSearchTimeoutRef.current) {
      clearTimeout(jobRoleSearchTimeoutRef.current);
    }

    // if (!jobRoleSearchText || jobRoleSearchText.length < 3) {
    //   setJobRoleOptionsApi([]);
    //   return;
    // }

    jobRoleSearchTimeoutRef.current = setTimeout(async () => {
      try {
        setIsJobRoleLoading(true);

        const res = await axios.get(
          `${BASE_URL}/master/job-roles/search?search=${jobRoleSearchText}`,
        );

        const data = res.data?.data || [];

        setJobRoleOptionsApi(
          data.map((role) => ({
            label: role.title,
            value: role.title,
          })),
        );
      } catch (err) {
        console.error("Job role search failed", err);
        setJobRoleOptionsApi([]);
      } finally {
        setIsJobRoleLoading(false);
      }
    }, 400); // debounce

    return () => clearTimeout(jobRoleSearchTimeoutRef.current);
  }, [jobRoleSearchText]);

  //company search
  useEffect(() => {
    // if (searchText.length < 3) {
    //   setCompanyOptions([]);
    //   return;
    // }

    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${BASE_URL}/master/companies/search?search=${searchText}`,
        );
        const options = res.data.data.map((c) => ({
          value: c.company_name,
          label: c.company_name,
        }));
        setCompanyOptions(options);
      } catch (err) {
        console.error(err);
        setCompanyOptions([]);
      }
      setLoading(false);
    };

    fetchCompanies();
  }, [searchText]);

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
      nextParams.append("opportunityType", type),
    );
    filters.jobType.forEach((type) => nextParams.append("jobType", type));

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
            loc.name.startsWith(city) || getCityFromLocation(loc.name) === city,
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
  }, [searchParams]);

  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
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
      { threshold: 1.0 },
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

  const sortOptions = useMemo(
    () => [
      { value: "relevance-desc", label: "Relevance (Targeted first)" },
      { value: "postedAt-desc", label: "Posted Date (Newest)" },
      { value: "postedAt-asc", label: "Posted Date (Oldest)" },
      { value: "matchPercentage-desc", label: "Match % (High to Low)" },
      { value: "matchPercentage-asc", label: "Match % (Low to High)" },
    ],
    [],
  );

  const menuPortalTarget =
    typeof document !== "undefined" ? document.body : null;

  // react-select styles for SortBySelect
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
      backgroundColor: state.isSelected
        ? "#9bc87c"
        : state.isFocused
          ? "#eaf5e1"
          : "white",
      color: state.isSelected ? "#1e1e2d" : base.color,
    }),
    multiValue: (base) => ({
      ...base,
      fontSize: "0.875rem",
      backgroundColor: "#f3f4f6",
    }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
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
            className="flex items-center justify-center w-full gap-2 px-4 py-3 transition-colors bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-[#1e1e2d] shadow-none outline-none focus:outline-none focus:ring-0 active:outline-none"
          >
            {isFiltersOpen ? (
              <>
                <FaTimes className="text-sm" />
                <span className="text-sm font-medium">Close Filters</span>
              </>
            ) : (
              <>
                <FaFilter className="text-sm" />
                <span className="text-sm font-medium">Show Filters</span>
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] items-start gap-3 sm:gap-4 lg:gap-8 mx-2 sm:mx-4">
          {/* Left: Job Filters */}
          <JobFiltersPanel
            isOpen={isFiltersOpen ? true : undefined}
            onClose={() => setIsFiltersOpen(false)}
            filters={filters}
            setFilters={setFilters}
            options={{
              jobProfiles: jobRoleOptionsApi,
              locations: locationOptions,
              companies: companyOptions,
            }}
            loading={{
              jobProfiles: isJobRoleLoading,
              locations: isLocationLoading,
              companies: loading,
            }}
            search={{
              jobRoleSearchText,
              setJobRoleSearchText,
              locationSearchText,
              setLocationSearchText,
              companySearchText: searchText,
              setCompanySearchText: setSearchText,
            }}
            onApply={applyFilters}
            onClear={clearFilters}
          />

          {/* Right: Jobs List */}
          <main className="bg-white rounded-2xl shadow-sm border-2 border-[#00C950] p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col min-h-[80vh]">
            <OpportunityHubHeader rightSlot={<MyApplicationsButton />} />
            {/* Sort Controls */}
            <div className="flex flex-wrap items-center justify-between mb-4">
              <OpportunitiesCount count={pagination?.total || 0} />

              <div className="flex items-center gap-2 mt-3 sm:mt-0">
                <span className="text-sm font-medium text-[#1e1e2d]">
                  Sort by:
                </span>
                <div className="min-w-[220px]">
                  <SortBySelect
                    options={sortOptions}
                    value={sortOptions.find(
                      (o) =>
                        o.value === `${filters.sortBy}-${filters.sortOrder}`,
                    )}
                    onChange={(opt) => {
                      if (!opt?.value) return;
                      const [sortBy, sortOrder] = opt.value.split("-");

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
                    styles={selectStyles}
                    menuPortalTarget={menuPortalTarget}
                  />
                </div>
              </div>
            </div>

            {/* Job Cards */}
            <section className="flex flex-col gap-3 sm:gap-4">
              {loading && (
                <div className="py-8 text-center sm:py-12">
                  <Loader message="Loading opportunities..." />
                </div>
              )}

              {error && (
                <div className="py-8 text-center sm:py-12">
                  <p className="mb-4 text-sm text-red-600 sm:text-base">
                    Error loading opportunities: {error}
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

              {/* ✅ Refactored Card List ✅ */}
              {!loading &&
                !error &&
                allJobs &&
                allJobs.length > 0 &&
                allJobs.map((job) => (
                  <JobOpportunityCard key={job.job_id} job={job} />
                ))}

              {!loading && !error && (!allJobs || allJobs.length === 0) && (
                <div className="py-12 text-center sm:py-16">
                  <p className="text-lg text-gray-500">
                    No opportunities found.
                  </p>
                </div>
              )}

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
          className="fixed z-10 p-3 text-white transition-colors bg-[#1DB32F] rounded-full shadow-lg bottom-6 right-6 hover:bg-[#18a728] outline-none focus:ring-0 active:outline-none"
          aria-label="Back to top"
        >
          <FaArrowUp />
        </button>
      )}
    </div>
  );
}
