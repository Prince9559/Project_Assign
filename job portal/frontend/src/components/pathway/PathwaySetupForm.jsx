// import React, { useState, useEffect } from "react";
// import {
//   FiTarget,
//   FiBriefcase,
//   FiLayers,
//   FiClock,
//   FiChevronDown,
// } from "react-icons/fi";

// import { useMasterData } from '../../hooks/master/useMasterData';
// import {Link} from "react-router-dom";
// import Select from 'react-select';

// const STRATEGIES = [
//   { id: "job_specific", label: "🎯 Target a Job", icon: FiTarget },
//   // { id: "company_target", label: "🏢 Target a Company", icon: FiBriefcase },
//   { id: "direct_upskilling", label: "🚀 Upskill in Domains", icon: FiLayers },
//   { id: "company_role_target", label: "👥 Target Companies & Roles", icon: FiBriefcase }, // ← Updated
// ];

// const RESOURCE_TYPES = [
//   { id: "internship", label: "Internship" },
//   { id: "project", label: "Project" },
//   { id: "course", label: "Course" },
// ];

// const PathwaySetupForm = ({ onSubmit, initialValues }) => {

//   const {
//     companies,
//     jobRoles,
//     domains: masterDomains,
//     isLoading: isMasterDataLoading,
//   } = useMasterData();


//   // For company_role_target: multi-select
// const [targetCompanyIds, setTargetCompanyIds] = useState(
//   Array.isArray(initialValues.target_company_ids)
//     ? initialValues.target_company_ids.map(String)
//     : []
// );

// const [targetRoleIds, setTargetRoleIds] = useState(
//   Array.isArray(initialValues.target_role_ids)
//     ? initialValues.target_role_ids.map(String)
//     : []
// );

// // Derive job role options (grouped by company? or flat)
// const jobRoleOptions = React.useMemo(() => {
//   return jobRoles.map(j => ({
//     label: `${j.title} @ ${j.company_name}`,
//     value: j.id,
//     companyId: j.company_id,
//   }));
// }, [jobRoles]);


//   // Derived options 
//   const companyOptions = React.useMemo(
//     () => companies.map(c => ({ label: c.company_name, value: c.id })),
//     [companies]
//   );

//   const domainOptions = React.useMemo(
//     () => masterDomains.map(d => ({ label: d.domain_name, value: d.domain_id })),
//     [masterDomains]
//   );


//   const toggleCompany = (companyId) => {
//   const idStr = String(companyId);
//   setTargetCompanyIds(prev =>
//     prev.includes(idStr)
//       ? prev.filter(id => id !== idStr)
//       : [...prev, idStr]
//   );
// };

// const toggleRole = (roleId) => {
//   const idStr = String(roleId);
//   setTargetRoleIds(prev =>
//     prev.includes(idStr)
//       ? prev.filter(id => id !== idStr)
//       : [...prev, idStr]
//   );
// };
  

//   const [resourcePriority, setResourcePriority] = useState(
//     initialValues.resource_priority || ["internship", "project", "course"]
//   );
//   const [maxTimeline, setMaxTimeline] = useState(
//     initialValues.max_timeline || 365
//   );
//   const [minTimeline, setMinTimeline] = useState(
//     initialValues.min_timeline || 1
//   );


//   const [strategy, setStrategy] = useState(initialValues.strategy || "job_specific");

//   const [includeResources, setIncludeResources] = useState({
//     course: initialValues.include_resources?.course ?? true,
//     project: initialValues.include_resources?.project ?? true,
//     internship: initialValues.include_resources?.internship ?? true,
//     job: initialValues.include_resources?.job ?? true,
//   });

//   // For job-specific: support non-editable job display
//   const [targetJobId, setTargetJobId] = useState(initialValues.target_job_id || "");
//   const [targetJobTitle, setTargetJobTitle] = useState(initialValues.target_job_title || "");
//   const [targetCompanyName, setTargetCompanyName] = useState(initialValues.target_company_name || "");

//   // For company strategy
//   const [targetCompanyId, setTargetCompanyId] = useState(initialValues.target_company_id || "");

//   // For domains
//   const [targetDomains, setTargetDomains] = useState(
//     Array.isArray(initialValues.target_domains)
//       ? initialValues.target_domains.map(String) // ensure string for DOM value
//       : []
//   );


//   const toggleResourceType = (type) => {
//     setIncludeResources(prev => ({
//       ...prev,
//       [type]: !prev[type]
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();


//     // Validate at least one resource selected
//     if (Object.values(includeResources).every(v => !v)) {
//       alert("Please select at least one resource type to include.");
//       return;
//     }

//     const payload = {
//       strategy_type: strategy,

//       // NEW: include_types
//       include_types: Object.keys(includeResources).filter(type => includeResources[type]),

//       // NEW: eligibility_options (default — can be extended later)
//       eligibility_options: {
//         check_internships: includeResources.internship,
//         check_jobs: includeResources.job,
//         check_projects: false, 
//         min_match_percentage: 0,
//       },
//       preferences: {
//         resource_priority: resourcePriority,
//         max_timeline: parseInt(maxTimeline),
//         min_timeline: parseInt(minTimeline),
//       },
//     };


//     if (strategy === "job_specific") {
//       // Ensure jobId is number when sent
//       payload.target_job_id = Number(targetJobId);
//     }else if (strategy === "company_role_target") {
//       payload.target_company_ids = targetCompanyIds.map(Number);
//       payload.target_role_ids = targetRoleIds.map(Number);
//     } else if (strategy === "company_target") {
//       payload.target_company_id = Number(targetCompanyId);
//     } else if (strategy === "direct_upskilling") {
//       payload.target_domains = targetDomains.map(Number);
//     }

//     onSubmit(payload);
//   };

  

//   const handlePrioritySwap = (index, direction) => {
//     const newPriority = [...resourcePriority];
//     const otherIndex = direction === "up" ? index - 1 : index + 1;
//     if (otherIndex >= 0 && otherIndex < newPriority.length) {
//       [newPriority[index], newPriority[otherIndex]] = [
//         newPriority[otherIndex],
//         newPriority[index],
//       ];
//       setResourcePriority(newPriority);
//     }
//   };

//   // const toggleDomain = (domainId) => {
//   //   setTargetDomains((prev) =>
//   //     prev.includes(domainId)
//   //       ? prev.filter((id) => id !== domainId)
//   //       : [...prev, domainId]
//   //   );
//   // };


//   const toggleDomain = (domainId) => {
//     const idStr = String(domainId);
//     setTargetDomains((prev) =>
//       prev.includes(idStr)
//         ? prev.filter((id) => id !== idStr)
//         : [...prev, idStr]
//     );
//   };

//   return (
//     <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
//       <h2 className="mb-6 text-2xl font-bold text-gray-800">
//         Build Your Pathway
//       </h2>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Strategy Selection */}
//         <div>
//           <label className="block mb-3 text-sm font-medium text-gray-700">
//             What’s your goal?
//           </label>
//           <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
//             {STRATEGIES.map((item) => {
//               const Icon = item.icon;
//               return (
//                 <button
//                   key={item.id}
//                   type="button"
//                   onClick={() => setStrategy(item.id)}
//                   className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${
//                     strategy === item.id
//                       ? "border-blue-500 bg-blue-50 text-blue-700"
//                       : "border-gray-300 hover:border-gray-400 text-gray-600"
//                   }`}
//                 >
//                   <Icon className="w-6 h-6 mb-2" />
//                   <span className="text-sm font-medium">{item.label}</span>
//                 </button>
//               );
//             })}
//           </div>
//         </div>



//         {/* Target Input */}
//         <div>
//           {/* {strategy === "job_specific" && (
//             <div>
//               <label className="block mb-2 text-sm font-medium text-gray-700">
//                 Target Job
//               </label>
//               {targetJobId ? (
//                 <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
//                   <p className="font-medium text-gray-900">{targetJobTitle || "—"} </p>
//                   <p className="text-sm text-gray-600">
//                     @ {targetCompanyName || "—"}
//                   </p>
//                   <input type="hidden" name="target_job_id" value={targetJobId} />
//                 </div>
//               ) : (
//                 <select
//                   value={targetJobId}
//                   onChange={(e) => {
//                     const selected = jobRoles.find(j => j.id === Number(e.target.value));
//                     setTargetJobId(e.target.value);
//                     setTargetJobTitle(selected?.title || "");
//                     setTargetCompanyName(selected?.company_name || "");
//                   }}
//                   className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                   required
//                 >
//                   <option value="">Choose a job...</option>
//                   {jobRoles.map((job) => (
//                     <option key={job.id} value={job.id}>
//                       {job.title} @ {job.company_name}
//                     </option>
//                   ))}
//                 </select>
//               )}
//             </div>
//           )} */}


//           {strategy === "job_specific" && (
//   <div>
//     <label className="block mb-2 text-sm font-medium text-gray-700">
//       Target Job
//     </label>

//     {targetJobId ? (
//       //  Job provided via location.state → show fixed info
//       <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
//         <p className="font-medium text-gray-900">{targetJobTitle || "—"} </p>
//         <p className="text-sm text-gray-600">@ {targetCompanyName || "—"} </p>
//         <input type="hidden" name="target_job_id" value={targetJobId} />
//       </div>
//     ) : (
//       // No job provided → show CTA
//       <div className="p-4 text-center border border-blue-200 rounded-lg bg-blue-50">
//         <p className="mb-3 text-gray-700">
//           🔍 <strong>Select a job</strong> to build a targeted pathway.
//           <br />
//           See skills, match, and recommendations.
//           On Job Card click on Skills Required ? to select the job
//         </p>
//         <Link
//           to="/all-jobs"
//           className="inline-block px-4 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//         >
//           Browse Jobs →
//         </Link>
//       </div>
//     )}
//   </div>
// )}

//           {/* {strategy === "company_target" && (
//             <div>
//               <label className="block mb-2 text-sm font-medium text-gray-700">
//                 Select a Company
//               </label>
//               <select
//                 value={targetCompanyId}
//                 onChange={(e) => setTargetCompanyId(e.target.value)}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 required
//               >
//                 <option value="">Choose a company...</option>
//                 {companyOptions.map((opt) => (
//                   <option key={opt.value} value={opt.value}>
//                     {opt.label}
//                   </option>
//                 ))}
//               </select>

//                 <label className="block mb-2 text-sm font-medium text-gray-700">
//                 Select a Job Role
//               </label>
//               <select
//                 value={targetJobTitle}
//                 onChange={(e) => {
//                   const selected = jobRoles.find(j => j.id === Number(e.target.value));
//                   setTargetJobTitle(selected?.title || "");
//                 }}
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 required
//               >
//                 <option value="">Choose a job role...</option>
//                 {jobRoles.map((job) => (
//                   <option key={job.id} value={job.id}>
//                     {job.title}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           )} */}

//           {strategy === "direct_upskilling" && (
//             <div>
//               <label className="block mb-2 text-sm font-medium text-gray-700">
//                 Select Domains to Upskill In (1+)
//               </label>
//               <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
//                 {domainOptions.map((domain) => (
//                   <button
//                     key={domain.value}
//                     type="button"
//                     onClick={() => toggleDomain(domain.value)}
//                     className={`p-3 rounded-lg text-sm font-medium border transition-colors ${targetDomains.includes(String(domain.value))
//                         ? "bg-blue-500 text-white border-blue-500"
//                         : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
//                       }`}
//                   >
//                     {domain.label}
//                   </button>
//                 ))}
//               </div>
//               {targetDomains.length === 0 && (
//                 <p className="mt-2 text-sm text-red-500">
//                   At least one domain required
//                 </p>
//               )}
//             </div>
//           )}



//          {strategy === "company_role_target" && (
//   <div className="space-y-5">
//     {/* Companies Multi-Select */}
//     <div>
//       <label className="block mb-2 text-sm font-medium text-gray-700">
//         Select Companies
//       </label>
//       <Select
//         isMulti
//         isSearchable
//         placeholder="Search & select companies..."
//         options={companyOptions}
//         value={companyOptions.filter(opt =>
//           targetCompanyIds.includes(String(opt.value))
//         )}
//         onChange={(selected) => {
//           setTargetCompanyIds(selected ? selected.map(opt => String(opt.value)) : []);
//         }}
//         className="react-select-container"
//         classNamePrefix="react-select"
//         required
//       />
//       {targetCompanyIds.length === 0 && (
//         <p className="mt-1 text-sm text-red-500">At least one company required</p>
//       )}
//     </div>

//     {/* Job Roles Multi-Select */}
//     <div>
//       <label className="block mb-2 text-sm font-medium text-gray-700">
//         Select Job Roles
//       </label>
//       <Select
//         isMulti
//         isSearchable
//         placeholder="Search & select job roles..."
//         options={jobRoles.map(j => ({
//           label: `${j.title}`,
//           value: j.id,
//         }))}
//         value={jobRoles
//           .filter(j => targetRoleIds.includes(String(j.id)))
//           .map(j => ({
//             label: `${j.title}`,
//             value: j.id,
//           }))}
//         onChange={(selected) => {
//           setTargetRoleIds(selected ? selected.map(opt => String(opt.value)) : []);
//         }}
//         className="react-select-container"
//         classNamePrefix="react-select"
//         required
//       />
//       {targetRoleIds.length === 0 && (
//         <p className="mt-1 text-sm text-red-500">At least one job role required</p>
//       )}
//     </div>
//   </div>
// )}
//         </div>
        

//         {/* Preferences */}
//         <div className="hidden pt-6 border-t">
//           <h3 className="mb-4 text-lg font-semibold text-gray-800">
//             Your Learning Style
//           </h3>

//           {/* Resource Priority */}
//           <div className="mb-5">
//             <label className="hidden block mb-2 text-sm font-medium text-gray-700">
//               Preferred Learning Order
//             </label>
//             <div className="space-y-2">
//               {resourcePriority.map((type, index) => {
//                 const item = RESOURCE_TYPES.find((t) => t.id === type);
//                 return (
//                   <div
//                     key={type}
//                     className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
//                   >
//                     <span className="font-medium text-gray-700">
//                       {item.label}
//                     </span>
//                     <div className="flex space-x-2">
//                       <button
//                         type="button"
//                         onClick={() => handlePrioritySwap(index, "up")}
//                         disabled={index === 0}
//                         className="p-1 text-gray-500 rounded hover:bg-gray-200 disabled:opacity-30"
//                       >
//                         <FiChevronDown className="w-4 h-4 rotate-180" />
//                       </button>
//                       <button
//                         type="button"
//                         onClick={() => handlePrioritySwap(index, "down")}
//                         disabled={index === resourcePriority.length - 1}
//                         className="p-1 text-gray-500 rounded hover:bg-gray-200 disabled:opacity-30"
//                       >
//                         <FiChevronDown className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Timeline */}
//           <div className="hidden grid grid-cols-1 gap-4 md:grid-cols-2">
//             <div>
//               <label className="block mb-2 text-sm font-medium text-gray-700">
//                 Max Timeline <span className="text-gray-500">(days)</span>
//               </label>
//               <div className="relative">
//                 <FiClock className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
//                 <input
//                   type="number"
//                   min="7"
//                   max="365"
//                   value={maxTimeline}
//                   onChange={(e) => setMaxTimeline(e.target.value)}
//                   className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>
//             <div>
//               <label className="block mb-2 text-sm font-medium text-gray-700">
//                 Min Timeline <span className="text-gray-500">(days)</span>
//               </label>
//               <div className="relative">
//                 <FiClock className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
//                 <input
//                   type="number"
//                   min="1"
//                   max={maxTimeline - 1}
//                   value={minTimeline}
//                   onChange={(e) => setMinTimeline(e.target.value)}
//                   className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                 />
//               </div>
//             </div>
//           </div>



          
//         </div>

//         {/* ==== REPLACED: Preferences Section ==== */}
//         {/* Only show resource inclusion toggles */}
//         <div className="pt-4 border-t">
//           <h3 className="mb-3 text-lg font-semibold text-gray-800">
//             What to include in your pathways?
//           </h3>
//           <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
//             {[
//               { id: "internship", label: "Internship", icon: "💼" },
//               { id: "job", label: "Job", icon: "👔" },
//               { id: "project", label: "Project", icon: "📁" },
//               { id: "course", label: "Course", icon: "🎓" },
//             ].map((item) => (
//               <button
//                 key={item.id}
//                 type="button"
//                 onClick={() => toggleResourceType(item.id)}
//                 className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors ${includeResources[item.id]
//                     ? "border-green-500 bg-green-50 text-green-700"
//                     : "border-gray-300 text-gray-600 hover:bg-gray-50"
//                   }`}
//               >
//                 <span className="text-lg mb-1">{item.icon}</span>
//                 <span className="text-xs font-medium">{item.label}</span>
//               </button>
//             ))}
//           </div>
//           {Object.values(includeResources).every(v => !v) && (
//             <p className="mt-2 text-sm text-red-500">At least one resource type must be selected</p>
//           )}
//         </div>

//         <button
//           type="submit"
//           className="w-full px-4 py-3 font-bold text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
//         >
//           Generate My Pathways
//         </button>
//       </form>
//     </div>
//   );
// };

// export default PathwaySetupForm;





























































// // src/components/pathway/PathwaySetupForm.jsx
// import React, { useState, useMemo } from "react";
// import { FiTarget, FiBriefcase, FiLayers } from "react-icons/fi";
// import { Link } from "react-router-dom";
// import Select from "react-select";

// const STRATEGIES = [
//   { id: "job_specific", label: "🎯 Target a Job", icon: FiTarget },
//   { id: "company_role_target", label: "👥 Target Companies & Roles", icon: FiBriefcase },
//   { id: "direct_upskilling", label: "🚀 Upskill in Domains", icon: FiLayers },
// ];

// const PathwaySetupForm = ({ onSubmit, initialValues }) => {
//   const [strategy, setStrategy] = useState(initialValues.strategy || "job_specific");

//   // For job-specific (from route state)
//   const [targetJobId] = useState(initialValues.target_job_id || "");
//   const [targetJobTitle] = useState(initialValues.target_job_title || "");
//   const [targetCompanyName] = useState(initialValues.target_company_name || "");

//   // For company-role targeting
//   const [targetCompanyIds, setTargetCompanyIds] = useState(
//     Array.isArray(initialValues.target_company_ids)
//       ? initialValues.target_company_ids.map(String)
//       : []
//   );
//   const [targetRoleIds, setTargetRoleIds] = useState(
//     Array.isArray(initialValues.target_role_ids)
//       ? initialValues.target_role_ids.map(String)
//       : []
//   );

//   // Resource inclusion toggles
//   const [includeResources, setIncludeResources] = useState({
//     course: initialValues.include_resources?.course ?? true,
//     project: initialValues.include_resources?.project ?? true,
//     internship: initialValues.include_resources?.internship ?? true,
//     job: initialValues.include_resources?.job ?? true,
//   });

//   const toggleResourceType = (type) => {
//     setIncludeResources((prev) => ({
//       ...prev,
//       [type]: !prev[type],
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (Object.values(includeResources).every((v) => !v)) {
//       alert("Please select at least one resource type.");
//       return;
//     }

//     // Build payload for NEW API
//     const payload = {
//       strategy_type: strategy,
//       include_types: Object.keys(includeResources).filter((type) => includeResources[type]),
//       eligibility_options: {
//         check_internships: includeResources.internship,
//         check_jobs: includeResources.job,
//         check_projects: includeResources.project,
//         min_match_percentage: 0,
//       },
//     };

//     if (strategy === "job_specific") {
//       if (!targetJobId) {
//         alert("No job selected. Please choose a job first.");
//         return;
//       }
//       payload.target_job_id = Number(targetJobId);
//     } else if (strategy === "company_role_target") {
//       if (targetCompanyIds.length === 0 || targetRoleIds.length === 0) {
//         alert("Please select at least one company and one role.");
//         return;
//       }
//       payload.target_company_ids = targetCompanyIds.map(Number);
//       payload.target_role_ids = targetRoleIds.map(Number);
//     } else if (strategy === "direct_upskilling") {
//       alert("Domain-based upskilling is coming soon!");
//       return;
//     }

//     onSubmit(payload);
//   };

//   // Mock data for demo (replace with real master data hook if needed)
//   const companyOptions = [
//     { value: "1", label: "Google" },
//     { value: "2", label: "Microsoft" },
//     { value: "3", label: "Amazon" },
//   ];
//   const jobRoleOptions = [
//     { value: "101", label: "Frontend Developer" },
//     { value: "102", label: "Data Scientist" },
//     { value: "103", label: "Product Manager" },
//   ];

//   return (
//     <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
//       <h2 className="mb-6 text-2xl font-bold text-gray-800">Build Your Pathway</h2>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Strategy Selection */}
//         <div>
//           <label className="block mb-3 text-sm font-medium text-gray-700">What’s your goal?</label>
//           <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
//             {STRATEGIES.map((item) => {
//               const Icon = item.icon;
//               return (
//                 <button
//                   key={item.id}
//                   type="button"
//                   onClick={() => setStrategy(item.id)}
//                   className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${strategy === item.id
//                       ? "border-blue-500 bg-blue-50 text-blue-700"
//                       : "border-gray-300 hover:border-gray-400 text-gray-600"
//                     }`}
//                 >
//                   <Icon className="w-6 h-6 mb-2" />
//                   <span className="text-sm font-medium">{item.label}</span>
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Target Input */}
//         <div>
//           {strategy === "job_specific" && (
//             <div>
//               <label className="block mb-2 text-sm font-medium text-gray-700">Target Job</label>
//               {targetJobId ? (
//                 <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
//                   <p className="font-medium text-gray-900">{targetJobTitle || "—"} </p>
//                   <p className="text-sm text-gray-600">@ {targetCompanyName || "—"}</p>
//                 </div>
//               ) : (
//                 <div className="p-4 text-center border border-blue-200 rounded-lg bg-blue-50">
//                   <p className="mb-3 text-gray-700">
//                     🔍 <strong>Select a job</strong> to build a targeted pathway.
//                     <br />
//                     On any job card, click “Skills Required” to start.
//                   </p>
//                   <Link
//                     to="/all-jobs"
//                     className="inline-block px-4 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//                   >
//                     Browse Jobs →
//                   </Link>
//                 </div>
//               )}
//             </div>
//           )}

//           {strategy === "company_role_target" && (
//             <div className="space-y-5">
//               <div>
//                 <label className="block mb-2 text-sm font-medium text-gray-700">Select Companies</label>
//                 <Select
//                   isMulti
//                   options={companyOptions}
//                   value={companyOptions.filter((opt) => targetCompanyIds.includes(String(opt.value)))}
//                   onChange={(selected) =>
//                     setTargetCompanyIds(selected ? selected.map((opt) => String(opt.value)) : [])
//                   }
//                   placeholder="Search companies..."
//                   className="react-select-container"
//                   classNamePrefix="react-select"
//                 />
//               </div>
//               <div>
//                 <label className="block mb-2 text-sm font-medium text-gray-700">Select Job Roles</label>
//                 <Select
//                   isMulti
//                   options={jobRoleOptions}
//                   value={jobRoleOptions.filter((opt) => targetRoleIds.includes(String(opt.value)))}
//                   onChange={(selected) =>
//                     setTargetRoleIds(selected ? selected.map((opt) => String(opt.value)) : [])
//                   }
//                   placeholder="Search roles..."
//                   className="react-select-container"
//                   classNamePrefix="react-select"
//                 />
//               </div>
//             </div>
//           )}

//           {strategy === "direct_upskilling" && (
//             <div className="p-6 text-center bg-yellow-50 border border-yellow-200 rounded-lg">
//               <h3 className="text-lg font-semibold text-yellow-800">Coming Soon!</h3>
//               <p className="mt-2 text-yellow-700">
//                 Domain-based upskilling will be available in the next update.
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Resource Inclusion */}
//         <div className="pt-4 border-t">
//           <h3 className="mb-3 text-lg font-semibold text-gray-800">What to include?</h3>
//           <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
//             {[
//               { id: "internship", label: "Internship", icon: "💼" },
//               { id: "job", label: "Job", icon: "👔" },
//               { id: "project", label: "Project", icon: "📁" },
//               { id: "course", label: "Course", icon: "🎓" },
//             ].map((item) => (
//               <button
//                 key={item.id}
//                 type="button"
//                 onClick={() => toggleResourceType(item.id)}
//                 className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors ${includeResources[item.id]
//                     ? "border-green-500 bg-green-50 text-green-700"
//                     : "border-gray-300 text-gray-600 hover:bg-gray-50"
//                   }`}
//               >
//                 <span className="text-lg mb-1">{item.icon}</span>
//                 <span className="text-xs font-medium">{item.label}</span>
//               </button>
//             ))}
//           </div>
//           {Object.values(includeResources).every((v) => !v) && (
//             <p className="mt-2 text-sm text-red-500">At least one resource type must be selected</p>
//           )}
//         </div>

//         <button
//           type="submit"
//           className="w-full px-4 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//         >
//           Generate My Pathways
//         </button>
//       </form>
//     </div>
//   );
// };

// export default PathwaySetupForm;


















































































































// // src/components/pathway/PathwaySetupForm.jsx
// import React, { useState, useMemo } from "react";
// import { FiTarget, FiBriefcase, FiLayers } from "react-icons/fi";
// import { Link } from "react-router-dom";
// import Select from "react-select";

// const STRATEGIES = [
//   { id: "job_specific", label: "🎯 Target Job", icon: FiTarget },
//   { id: "role_specific", label: "💼 Upskill", icon: FiBriefcase },
//   // { id: "direct_upskilling", label: "🚀 Upskill in Domains", icon: FiLayers },
// ];

// const PathwaySetupForm = ({ onSubmit, initialValues, locationState }) => {
//   const [strategy, setStrategy] = useState(initialValues.strategy || "job_specific");

//   // For job-specific: from route state (non-editable)
//   const isJobPreselected = !!locationState?.jobId;
//   const targetJobId = locationState?.jobId || initialValues.target_job_id || "";
//   const targetJobTitle = locationState?.jobTitle || initialValues.target_job_title || "";
//   const targetCompanyName = locationState?.companyName || initialValues.target_company_name || "";

//   // For role-specific: editable text input
//   const [targetRole, setTargetRole] = useState(
//     locationState?.roleName || initialValues.target_role_name || ""
//   );

//   // Resource toggles
//   const [includeResources, setIncludeResources] = useState({
//     course: initialValues.include_resources?.course ?? true,
//     project: initialValues.include_resources?.project ?? true,
//     internship: initialValues.include_resources?.internship ?? true,
//     job: initialValues.include_resources?.job ?? true,
//   });

//   const toggleResourceType = (type) => {
//     setIncludeResources((prev) => ({
//       ...prev,
//       [type]: !prev[type],
//     }));
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (Object.values(includeResources).every((v) => !v)) {
//       alert("Please select at least one resource type.");
//       return;
//     }

//     let payload = {
//       strategy_type: strategy,
//       include_types: Object.keys(includeResources).filter((type) => includeResources[type]),
//     };

//     if (strategy === "job_specific") {
//       if (!targetJobId) {
//         alert("No job selected. Please choose a job first.");
//         return;
//       }
//       payload.target_job_id = Number(targetJobId);
//     } else if (strategy === "role_specific") {
//       if (!targetRole.trim()) {
//         alert("Please enter a job role (e.g., 'Frontend Developer').");
//         return;
//       }
//       payload.target_role = targetRole.trim();
//     } else if (strategy === "direct_upskilling") {
//       alert("Domain-based upskilling is coming soon!");
//       return;
//     }

//     onSubmit(payload);
//   };

//   return (
//     <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
//       <h2 className="mb-6 text-2xl font-bold text-gray-800">Build Your Pathway</h2>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Strategy Selection */}
//         <div>
//           <label className="block mb-3 text-sm font-medium text-gray-700">What’s your goal?</label>
//           <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
//             {STRATEGIES.map((item) => {
//               const Icon = item.icon;
//               return (
//                 <button
//                   key={item.id}
//                   type="button"
//                   onClick={() => setStrategy(item.id)}
//                   className={`flex flex-col items-center justify-center p-4 rounded-lg border transition-all ${strategy === item.id
//                       ? "border-blue-500 bg-blue-50 text-blue-700"
//                       : "border-gray-300 hover:border-gray-400 text-gray-600"
//                     }`}
//                 >
//                   <Icon className="w-6 h-6 mb-2" />
//                   <span className="text-sm font-medium">{item.label}</span>
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Target Input */}
//         <div>
//           {strategy === "job_specific" && (
//             <div>
//               <label className="block mb-2 text-sm font-medium text-gray-700">Target Job</label>
//               {isJobPreselected ? (
//                 <div className="p-3 border border-gray-300 rounded-lg bg-gray-50">
//                   <p className="font-medium text-gray-900">{targetJobTitle || "—"} </p>
//                   <p className="text-sm text-gray-600">@ {targetCompanyName || "—"}</p>
//                 </div>
//               ) : (
//                 <div className="p-4 text-center border border-blue-200 rounded-lg bg-blue-50">
//                   <p className="mb-3 text-gray-700">
//                     🔍 <strong>Select a job</strong> to build a targeted pathway.
//                     <br />
//                     On any job card, click “Skills Required” to start.
//                   </p>
//                   <Link
//                     to="/all-jobs"
//                     className="inline-block px-4 py-2 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//                   >
//                     Browse Jobs →
//                   </Link>
//                 </div>
//               )}
//             </div>
//           )}

//           {strategy === "role_specific" && (
//             <div>
//               <label className="block mb-2 text-sm font-medium text-gray-700">
//                 Enter Job Role (e.g., "Data Scientist", "Frontend Developer")
//               </label>
//               <input
//                 type="text"
//                 value={targetRole}
//                 onChange={(e) => setTargetRole(e.target.value)}
//                 placeholder="Job role name..."
//                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//                 required
//               />
//             </div>
//           )}

//           {strategy === "direct_upskilling" && (
//             <div className="p-6 text-center bg-yellow-50 border border-yellow-200 rounded-lg">
//               <h3 className="text-lg font-semibold text-yellow-800">Coming Soon!</h3>
//               <p className="mt-2 text-yellow-700">
//                 Domain-based upskilling will be available in the next update.
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Resource Inclusion */}
//         <div className="pt-4 border-t">
//           <h3 className="mb-3 text-lg font-semibold text-gray-800">What to include?</h3>
//           <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
//             {[
//               { id: "internship", label: "Internship", icon: "💼" },
//               { id: "job", label: "Job", icon: "👔" },
//               { id: "project", label: "Project", icon: "📁" },
//               { id: "course", label: "Course", icon: "🎓" },
//             ].map((item) => (
//               <button
//                 key={item.id}
//                 type="button"
//                 onClick={() => toggleResourceType(item.id)}
//                 className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors ${includeResources[item.id]
//                     ? "border-green-500 bg-green-50 text-green-700"
//                     : "border-gray-300 text-gray-600 hover:bg-gray-50"
//                   }`}
//               >
//                 <span className="text-lg mb-1">{item.icon}</span>
//                 <span className="text-xs font-medium">{item.label}</span>
//               </button>
//             ))}
//           </div>
//           {Object.values(includeResources).every((v) => !v) && (
//             <p className="mt-2 text-sm text-red-500">At least one resource type must be selected</p>
//           )}
//         </div>

//         <button
//           type="submit"
//           className="w-full px-4 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
//         >
//           Generate My Pathways
//         </button>
//       </form>
//     </div>
//   );
// };

// export default PathwaySetupForm;















import React, { useState } from "react";
import { FiTarget, FiBriefcase, FiLayers } from "react-icons/fi";
import { Link } from "react-router-dom";
import GreenPrimaryButton from "../jobs/GreenPrimaryButton";
const STRATEGIES = [
  { id: "job_specific", label: "🎯 Target Job", icon: FiTarget },
  { id: "role_specific", label: "💼 Upskill", icon: FiBriefcase },
  // { id: "direct_upskilling", label: "🚀 Upskill in Domains", icon: FiLayers },
];

const PathwaySetupForm = ({ onSubmit, initialValues, locationState }) => {
  const [strategy, setStrategy] = useState(initialValues.strategy || "job_specific");

  // For job-specific: from route state (non-editable)
  const isJobPreselected = !!locationState?.jobId;
  const targetJobId = locationState?.jobId || initialValues.target_job_id || "";
  const targetJobTitle = locationState?.jobTitle || initialValues.target_job_title || "";
  const targetCompanyName = locationState?.companyName || initialValues.target_company_name || "";

  // For role-specific: editable text input
  const [targetRole, setTargetRole] = useState(
    locationState?.roleName || initialValues.target_role_name || ""
  );

  // Resource toggles
  const [includeResources, setIncludeResources] = useState({
    course: initialValues.include_resources?.course ?? true,
    project: initialValues.include_resources?.project ?? true,
    internship: initialValues.include_resources?.internship ?? true,
    job: initialValues.include_resources?.job ?? true,
  });

  const toggleResourceType = (type) => {
    setIncludeResources((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (Object.values(includeResources).every((v) => !v)) {
      alert("Please select at least one resource type.");
      return;
    }

    let payload = {
      strategy_type: strategy,
      include_types: Object.keys(includeResources).filter((type) => includeResources[type]),
    };

    if (strategy === "job_specific") {
      if (!targetJobId) {
        alert("No job selected. Please choose a job first.");
        return;
      }
      payload.target_job_id = Number(targetJobId);
    } else if (strategy === "role_specific") {
      if (!targetRole.trim()) {
        alert("Please enter a job role (e.g., 'Frontend Developer').");
        return;
      }
      payload.target_role = targetRole.trim();
    } else if (strategy === "direct_upskilling") {
      alert("Domain-based upskilling is coming soon!");
      return;
    }

    onSubmit(payload);
  };

  return (
    <div className="p-6 sm:p-8 bg-white border border-gray-100 shadow-sm rounded-2xl">
      <h2 className="mb-6 text-2xl font-extrabold text-[#1e1e2d]">Build Your Pathway</h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Strategy Selection */}
        <div>
          <label className="block mb-3 text-sm font-bold text-[#1e1e2d]">What’s your goal?</label>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {STRATEGIES.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStrategy(item.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 ${
                    strategy === item.id
                      ? "border-[#9bc87c] bg-[#9bc87c]/10 text-[#1e1e2d] ring-1 ring-[#9bc87c]"
                      : "border-gray-200 hover:border-[#9bc87c]/50 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-6 h-6 mb-2" />
                  <span className="text-sm font-bold">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Target Input */}
        <div>
          {strategy === "job_specific" && (
            <div className="animate-fadeIn">
              <label className="block mb-3 text-sm font-bold text-[#1e1e2d]">Target Job</label>
              {isJobPreselected ? (
                <div className="p-4 border border-[#9bc87c]/50 rounded-xl bg-[#9bc87c]/5 shadow-sm">
                  <p className="font-bold text-[#1e1e2d] text-lg">{targetJobTitle || "—"} </p>
                  <p className="mt-1 text-sm font-medium text-gray-600">@ {targetCompanyName || "—"}</p>
                </div>
              ) : (
                <div className="p-6 text-center border border-gray-200 rounded-xl bg-gray-50">
                  <p className="mb-4 text-sm font-medium text-gray-600 leading-relaxed">
                    <span className="text-lg mr-1">🔍</span> 
                    <strong className="text-[#1e1e2d]">Select a job</strong> to build a targeted pathway.
                    <br className="hidden sm:block" />
                    On any job card, click “Skills Required” to start.
                  </p>
                  {/* <Link
                    to="/all-jobs"
                    className="inline-block px-5 py-2.5 font-bold text-white bg-[#1e1e2d] rounded-lg transition-colors hover:bg-[#2a2a3b] shadow-sm"
                  >
                    Browse Jobs &rarr;
                  </Link> */}

                  <Link
  to="/all-jobs"
  className="inline-block px-5 py-2.5 font-bold text-white bg-[#1DB32F] rounded-lg transition-colors hover:bg-[#18a728] shadow-sm"
>
  Browse Jobs &rarr;
</Link>
{/* <GreenPrimaryButton onClick={() => navigate('/all-jobs')}>
  Browse Jobs &rarr;
</GreenPrimaryButton> */}

                </div>
              )}
            </div>
          )}

          {strategy === "role_specific" && (
            <div className="animate-fadeIn">
              <label className="block mb-3 text-sm font-bold text-[#1e1e2d]">
                Enter Job Role (e.g., "Data Scientist", "Frontend Developer")
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                placeholder="Job role name..."
                className="w-full p-3.5 text-sm font-medium text-[#1e1e2d] border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#9bc87c] focus:border-[#9bc87c] outline-none transition-colors bg-gray-50 focus:bg-white"
                required
              />
            </div>
          )}

          {strategy === "direct_upskilling" && (
            <div className="p-6 text-center border border-gray-200 rounded-xl bg-gray-50 animate-fadeIn">
              <h3 className="text-lg font-bold text-[#1e1e2d]">Coming Soon!</h3>
              <p className="mt-2 text-sm font-medium text-gray-500">
                Domain-based upskilling will be available in the next update.
              </p>
            </div>
          )}
        </div>

        {/* Resource Inclusion */}
        <div className="pt-6 border-t border-gray-100">
          <h3 className="mb-4 text-lg font-bold text-[#1e1e2d]">What to include?</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { id: "internship", label: "Internship", icon: "💼" },
              { id: "job", label: "Job", icon: "👔" },
              { id: "project", label: "Project", icon: "📁" },
              { id: "course", label: "Course", icon: "🎓" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleResourceType(item.id)}
                className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all duration-200 ${
                  includeResources[item.id]
                    ? "border-[#9bc87c] bg-[#9bc87c]/10 text-[#1e1e2d]"
                    : "border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-600"
                }`}
              >
                <span className="text-xl mb-1.5 grayscale">{item.icon}</span>
                <span className={`text-xs font-bold ${includeResources[item.id] ? "text-[#1e1e2d]" : ""}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </div>
          {Object.values(includeResources).every((v) => !v) && (
            <p className="mt-3 text-sm font-semibold text-red-500">
              * At least one resource type must be selected
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full px-4 py-3.5 text-base font-bold text-white transition-colors bg-[#9bc87c] rounded-xl hover:bg-[#8ab76b] shadow-sm"
        >
          Generate My Pathways
        </button>
      </form>
    </div>
  );
};

export default PathwaySetupForm;