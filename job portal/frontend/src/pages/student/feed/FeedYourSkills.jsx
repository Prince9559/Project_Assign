// import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "../../../components/ui";
// import MainLayout from "../../../components/layout/MainLayout";
// import { IoIosArrowBack } from "react-icons/io";
// import { RxCross2 } from "react-icons/rx";
// import { FaTrash, FaPlus, FaFileAlt, FaCheckCircle, FaExclamationCircle, FaSpinner, FaSearch, FaBuilding, FaInfoCircle } from "react-icons/fa";
// import { useSelector } from "react-redux";
// import useUploadImageApi from "../../../hooks/useUploadImageApi";
// import { userDetailsApi } from "../../../api/userDetailsApi";
// import { z } from "zod";
// import { getImageUrl } from "../../../../utils.js";
// import CreatableSelect from "react-select/creatable";
// import axios from "axios";

// const BASE_URL = import.meta.env.VITE_BASE_URL;

// // Generate stable unique ID
// const generateId = () => {
//   if (typeof crypto !== "undefined" && crypto.randomUUID) {
//     return crypto.randomUUID();
//   }
//   return "id-" + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
// };

// // Zod Schema for validation
// const domainsSchema = z.object({
//   domains: z.array(
//     z.object({
//       authority_id: z.union([z.string(), z.number(), z.null()]).optional(),
//       organization_name: z.string().optional(),
//       authority_type: z.enum(["COMPANY", "UNIVERSITY"]).optional(),
//       domain_id: z.number().nullable().optional(),
//       other_domain_name: z.string().optional(),
//       job_role_id: z.number().nullable().optional(),
//       other_job_role: z.string().optional(),
//       skills: z.array(
//         z.object({
//           skill_id: z.number().nullable().optional(),
//           skill_name: z.string().optional(),
//           other_skill_name: z.string().optional(),
//           experience_months: z.number().nullable().optional(),
//         })
//       ).min(1, "At least one skill is required"),
//       certificate: z.array(z.string()).optional(),
//       start_date: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Invalid start date format (YYYY-MM)").optional(),
//       end_date: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Invalid end date format (YYYY-MM)").optional().nullable(),
//     })
//   ).min(1, "At least one experience entry is required"),
// });

// // Unified select styles
// const selectStyles = {
//   control: (base, state) => ({
//     ...base,
//     minHeight: "44px",
//     borderColor: state.isFocused ? "#3b82f6" : "#cbd5e1",
//     boxShadow: state.isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : "none",
//     borderRadius: "8px",
//     fontSize: "14px",
//     backgroundColor: "white",
//     "&:hover": { borderColor: "#94a3b8" },
//   }),
//   placeholder: (provided) => ({
//     ...provided,
//     color: "#94a3b8",
//     fontWeight: 400,
//   }),
//   singleValue: (provided) => ({
//     ...provided,
//     color: "#1e293b",
//     fontWeight: 500,
//   }),
//   menu: (provided) => ({
//     ...provided,
//     borderRadius: "8px",
//     boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
//   }),
//   option: (provided, state) => ({
//     ...provided,
//     padding: "10px 14px",
//     backgroundColor: state.isFocused ? "#f1f5f9" : "white",
//     color: "#1e293b",
//   }),
// };

// // Input class
// const inputClass = "w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 outline-none bg-white";
// const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

// // Debounce hook
// function useDebounce(value, delay = 300) {
//   const [debouncedValue, setDebouncedValue] = useState(value);
//   useEffect(() => {
//     const handler = setTimeout(() => setDebouncedValue(value), delay);
//     return () => clearTimeout(handler);
//   }, [value, delay]);
//   return debouncedValue;
// }

// // Validate date range
// const isValidDateRange = (start, end, dob) => {
//   if (!start) return true;
//   const startDate = new Date(start);
//   const endDate = end ? new Date(end) : null;
//   const dobDate = dob ? new Date(dob) : null;
//   if (dobDate && startDate < dobDate) {
//     return "Start date cannot be before your date of birth";
//   }
//   if (endDate && startDate > endDate) {
//     return "Start date cannot be after end date";
//   }
//   return true;
// };

// // Calculate total months between two dates
// const calculateTotalMonths = (start, end) => {
//   if (!start) return 0;
//   const startDate = new Date(start + "-01");
//   const endDate = end ? new Date(end + "-01") : new Date();
//   let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
//   months -= startDate.getMonth();
//   months += endDate.getMonth();
//   return Math.max(0, months);
// };

// // ============================================================================
// // SUB-COMPONENT: SubSkill Search Input
// // ============================================================================
// function SubSkillSearchInput({
//   cardId,
//   domainId,
//   isCustomDomain,
//   existingSkills,
//   onAddSkill,
//   onRemoveSkill,
//   onToggleSkill,
//   onExperienceChange,
//   subSkillSearchMap,
//   setSubSkillSearchMap,
//   activeSubSkillCardId,
//   setActiveSubSkillCardId,
//   subSkillOptions,
//   isSubSkillLoading,
//   cachedSubSkills,
//   fetchSuggestedSubSkillsForCard,
//   subSkillError,
// }) {
//   const localSearch = subSkillSearchMap[cardId] || "";
//   const isSearching = activeSubSkillCardId === cardId;

//   useEffect(() => {
//     if (domainId && !isCustomDomain && !cachedSubSkills[cardId]) {
//       console.log("[SubSkillSearchInput] Fetching suggested sub-skills for card:", cardId, "domain:", domainId);
//       fetchSuggestedSubSkillsForCard(cardId, domainId);
//     }
//   }, [cardId, domainId, isCustomDomain, cachedSubSkills, fetchSuggestedSubSkillsForCard]);

//   const suggestedSubSkills = cachedSubSkills[cardId] || [];
//   const isSubSkillsLoading = isSubSkillLoading && activeSubSkillCardId === cardId;

//   const handleSearchChange = useCallback((e) => {
//     const val = e.target.value;
//     console.log("[SubSkillSearchInput] Input changed for card:", cardId, "value:", val);
//     setActiveSubSkillCardId(cardId);
//     setSubSkillSearchMap((prev) => ({ ...prev, [cardId]: val }));
//   }, [cardId, setActiveSubSkillCardId, setSubSkillSearchMap]);

//   const handleKeyDown = useCallback((e) => {
//     if (e.key === "Enter" && localSearch.trim()) {
//       e.preventDefault();
//       if (!isCustomDomain) {
//         const matched = subSkillOptions.find(
//           (s) => s.name.toLowerCase() === localSearch.toLowerCase()
//         );
//         if (matched) {
//           onAddSkill(cardId, localSearch, matched);
//         } else {
//           onAddSkill(cardId, localSearch);
//         }
//       } else {
//         onAddSkill(cardId, localSearch);
//       }
//     } else if (e.key === "Escape") {
//       setSubSkillSearchMap((prev) => ({ ...prev, [cardId]: "" }));
//       setActiveSubSkillCardId(null);
//     }
//   }, [cardId, localSearch, isCustomDomain, subSkillOptions, onAddSkill, setSubSkillSearchMap, setActiveSubSkillCardId]);

//   return (
//     <div className="space-y-3">
//       <div className="relative">
//         <FaSearch className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
//         <input
//           key={`skill - input - ${ cardId } `}
//           type="text"
//           className="w-full py-2 pr-3 text-sm transition-shadow border border-gray-300 rounded-md outline-none pl-9 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
//           placeholder={isCustomDomain ? "Type a skill..." : "Search skills... [Min 2 chars]"}
//           value={isSearching ? localSearch : ""}
//           onChange={handleSearchChange}
//           onKeyDown={handleKeyDown}
//           onFocus={() => setActiveSubSkillCardId(cardId)}
//           autoComplete="off"
//         />
//         {isSearching && localSearch.length >= 2 && (isSubSkillLoading || subSkillOptions.length > 0) && (
//           <div className="absolute z-20 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-48">
//             {isSubSkillLoading ? (
//               <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>
//             ) : subSkillOptions.length === 0 ? (
//               <div className="px-3 py-2 text-sm text-gray-500">
//                 No skills found. Press Enter to add "{localSearch}" as custom.
//               </div>
//             ) : (
//               subSkillOptions.map((skill) => {
//                 const isSelected = existingSkills?.some(
//                   (s) => s.skill_id === skill.id || s.other_skill_name?.toLowerCase() === skill.name.toLowerCase()
//                 );
//                 return (
//                   <button
//                     key={skill.id}
//                     type="button"
//                     disabled={isSelected}
//                     className={`w - full text - left px - 3 py - 2 text - sm hover: bg - blue - 50 transition - colors ${
//   isSelected ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "text-gray-700"
// } `}
//                     onClick={() => onAddSkill(cardId, skill.name, skill)}
//                   >
//                     <div className="flex items-center justify-between">
//                       <span>{skill.name}</span>
//                       {isSelected && <span className="text-xs font-medium text-green-600">Added</span>}
//                     </div>
//                   </button>
//                 );
//               })
//             )}
//           </div>
//         )}
//       </div>

//       {isSearching && localSearch.length >= 2 && subSkillOptions.length === 0 && !isSubSkillLoading && (
//         <div
//           className="mt-1 text-xs text-blue-600 cursor-pointer hover:underline"
//           onClick={() => onAddSkill(cardId, localSearch)}
//         >
//           + Add "{localSearch}" as custom skill
//         </div>
//       )}

//       {existingSkills && existingSkills.length > 0 && (
//         <div className="flex flex-wrap gap-2">
//           {existingSkills.map((skill, idx) => {
//             const skillName = skill.other_skill_name || skill.skill_name;
//             const skillId = skill.skill_id;
//             return (
//               <div
//                 key={`${ cardId } -skill - ${ idx } `}
//                 className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-sm bg-blue-50 border-blue-200 text-blue-800"
//               >
//                 <span className="font-medium">{skillName}</span>
//                 <div className="flex items-center gap-1 pl-2 border-l border-blue-300">
//                   <input
//                     type="number"
//                     min="0"
//                     max="360"
//                     value={skill.experience_months ?? ""}
//                     onChange={(e) =>
//                       onExperienceChange(cardId, skillId, skillName, e.target.value)
//                     }
//                     placeholder="mo"
//                     className="w-12 px-1 py-0.5 text-xs border border-blue-300 rounded focus:ring-1 focus:ring-blue-300 outline-none"
//                   />
//                   <span className="text-xs text-blue-600">mo</span>
//                 </div>
//                 <button
//                   type="button"
//                   onClick={() =>
//                     skill.other_skill_name
//                       ? onRemoveSkill(cardId, skill.other_skill_name)
//                       : onToggleSkill(cardId, { id: skill.skill_id, name: skill.skill_name })
//                   }
//                   className="text-blue-400 hover:text-red-600 p-0.5"
//                 >
//                   <RxCross2 className="w-3 h-3" />
//                 </button>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {!isCustomDomain && suggestedSubSkills.length > 0 && (
//         <div className="pt-2 border-t border-gray-100">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
//               Suggested Sub Skills
//             </span>
//             {isSubSkillsLoading && suggestedSubSkills.length === 0 && (
//               <FaSpinner className="text-xs text-gray-400 animate-spin" />
//             )}
//           </div>
//           <div className="flex flex-wrap gap-2">
//             {suggestedSubSkills.map((skill) => {
//               const isSelected = existingSkills?.some(
//                 (s) => s.skill_id === skill.id || s.other_skill_name?.toLowerCase() === skill.name.toLowerCase()
//               );
//               if (isSelected) return null;
//               return (
//                 <button
//                   key={skill.id}
//                   type="button"
//                   onClick={() => onAddSkill(cardId, skill.name, skill)}
//                   className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all flex items-center gap-1"
//                 >
//                   {skill.name}
//                   <FaPlus className="w-2.5 h-2.5 opacity-60" />
//                 </button>
//               );
//             })}
//           </div>
//         </div>
//       )}

//       {subSkillError && (
//         <p className="text-xs text-red-500">{subSkillError}</p>
//       )}
//     </div>
//   );
// }

// // ============================================================================
// // MAIN COMPONENT
// // ============================================================================
// const FeedYourSkills = () => {
//   const navigate = useNavigate();
//   const { user, token } = useSelector((state) => state.auth);
//   const { uploadImage, loading: uploadLoading } = useUploadImageApi();
//   const dob = user?.dob;

//   // Search states
//   const [companySearch, setCompanySearch] = useState("");
//   const [companyOptions, setCompanyOptions] = useState([]);
//   const [isCompanyLoading, setIsCompanyLoading] = useState(false);
//   const [companyError, setCompanyError] = useState(null);
//   const [cachedCompanies, setCachedCompanies] = useState([]);

//   const [jobRoleSearch, setJobRoleSearch] = useState("");
//   const [jobRoleOptions, setJobRoleOptions] = useState([]);
//   const [isJobRoleLoading, setIsJobRoleLoading] = useState(false);
//   const [jobRoleError, setJobRoleError] = useState(null);
//   const [cachedJobRoles, setCachedJobRoles] = useState([]);

//   const [domainSearch, setDomainSearch] = useState("");
//   const [domainOptions, setDomainOptions] = useState([]);
//   const [isDomainLoading, setIsDomainLoading] = useState(false);
//   const [domainError, setDomainError] = useState(null);
//   const [cachedDomains, setCachedDomains] = useState([]);

//   const [subSkillSearchMap, setSubSkillSearchMap] = useState({});
//   const [subSkillOptions, setSubSkillOptions] = useState([]);
//   const [isSubSkillLoading, setIsSubSkillLoading] = useState(false);
//   const [subSkillError, setSubSkillError] = useState(null);
//   const [activeSubSkillCardId, setActiveSubSkillCardId] = useState(null);
//   const [cachedSubSkills, setCachedSubSkills] = useState({});

//   const [suggestedDomainsMap, setSuggestedDomainsMap] = useState({});
//   const [suggestedDomainsLoadingMap, setSuggestedDomainsLoadingMap] = useState({});
//   const [fetchedJobRoleMap, setFetchedJobRoleMap] = useState({});

//   // Form states
//   const [authorityCards, setAuthorityCards] = useState([]);
//   const [originalCards, setOriginalCards] = useState([]);
//   const [errors, setErrors] = useState({});
//   const [saving, setSaving] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [toast, setToast] = useState(null);

//   const debounceTimeouts = useRef({});

//   // Show toast notification
//   const showToast = (message, type = "success") => {
//     console.log("[Toast]", type, message);
//     setToast({ message, type });
//     setTimeout(() => setToast(null), 3000);
//   };

//   // Cleanup timeouts on unmount
//   useEffect(() => {
//     return () => {
//       Object.values(debounceTimeouts.current).forEach(clearTimeout);
//     };
//   }, []);

//   // ============================================================================
//   // API SEARCH FUNCTIONS
//   // ============================================================================

//   // Company Search API
//   const debouncedCompanySearch = useDebounce(companySearch, 300);
//   useEffect(() => {
//     console.log("[Company Search] debounced value:", debouncedCompanySearch);
//     if (debouncedCompanySearch.length < 3) {
//       setCompanyOptions([]);
//       setCompanyError(null);
//       return;
//     }
//     const fetchCompanies = async () => {
//       console.log("[Company Search] Fetching from API...");
//       setIsCompanyLoading(true);
//       setCompanyError(null);
//       try {
//         const res = await axios.get(`${BASE_URL}/master/companies/search`, {
//           params: { search: debouncedCompanySearch.trim(), limit: 10 },
//           timeout: 5000,
//           headers: { Authorization: `Bearer ${ token } ` },
//         });
//         console.log("[Company Search] API response:", res.data);
//         if (res.data?.success) {
//           const normalized = (res.data.data || []).map((c) => ({
//             value: String(c.id),
//             label: c.company_name,
//             id: c.id,
//             name: c.company_name,
//             type: "COMPANY",
//           }));
//           setCompanyOptions(normalized);
//           console.log("[Company Search] Normalized options:", normalized.length);
//           setCachedCompanies((prev) => {
//             const existing = new Map(prev.map((a) => [a.value, a]));
//             normalized.forEach((n) => existing.set(n.value, n));
//             return Array.from(existing.values());
//           });
//         }
//       } catch (err) {
//         console.error("[Company Search] Failed:", err);
//         setCompanyError("Failed to load companies. Please try again.");
//         setCompanyOptions([]);
//       } finally {
//         setIsCompanyLoading(false);
//       }
//     };
//     fetchCompanies();
//   }, [debouncedCompanySearch, token]);

//   // Job Role Search API
//   const debouncedJobRoleSearch = useDebounce(jobRoleSearch, 300);
//   useEffect(() => {
//     console.log("[JobRole Search] debounced value:", debouncedJobRoleSearch);
//     if (debouncedJobRoleSearch.length < 3) {
//       setJobRoleOptions([]);
//       setJobRoleError(null);
//       return;
//     }
//     const fetchJobRoles = async () => {
//       console.log("[JobRole Search] Fetching from API...");
//       setIsJobRoleLoading(true);
//       setJobRoleError(null);
//       try {
//         const res = await axios.get(`${ BASE_URL}/master/job-roles/search`, {
//           params: { search: debouncedJobRoleSearch.trim(), limit: 10 },
//           timeout: 5000,
//           headers: { Authorization: `Bearer ${ token } ` },
//         });
//         console.log("[JobRole Search] API response:", res.data);
//         if (res.data?.success) {
//           const normalized = (res.data.data || [])
//             .filter((role) => role.id && role.title)
//             .map((role) => ({
//               id: typeof role.id === "string" ? parseInt(role.id, 10) : Number(role.id),
//               title: role.title.trim(),
//             }))
//             .filter((role) => !isNaN(role.id));
//           setJobRoleOptions(normalized);
//           console.log("[JobRole Search] Normalized options:", normalized.length);
//           setCachedJobRoles((prev) => {
//             const existing = new Map(prev.map((j) => [j.id, j]));
//             normalized.forEach((n) => existing.set(n.id, n));
//             return Array.from(existing.values());
//           });
//         }
//       } catch (err) {
//         console.error("[JobRole Search] Failed:", err);
//         setJobRoleError("Failed to load job profiles. Please try again.");
//         setJobRoleOptions([]);
//       } finally {
//         setIsJobRoleLoading(false);
//       }
//     };
//     fetchJobRoles();
//   }, [debouncedJobRoleSearch, token]);

//   // Domain Search API
//   const debouncedDomainSearch = useDebounce(domainSearch, 300);
//   useEffect(() => {
//     console.log("[Domain Search] debounced value:", debouncedDomainSearch);
//     if (debouncedDomainSearch.length < 3) {
//       setDomainOptions([]);
//       setDomainError(null);
//       return;
//     }
//     const fetchDomains = async () => {
//       console.log("[Domain Search] Fetching from API...");
//       setIsDomainLoading(true);
//       setDomainError(null);
//       try {
//         const res = await axios.get(`${BASE_URL}/master/domains/search`, {
//           params: { search: debouncedDomainSearch.trim(), limit: 10 },
//           timeout: 5000,
//           headers: { Authorization: `Bearer ${ token } ` },
//         });
//         console.log("[Domain Search] API response:", res.data);
//         if (res.data?.success) {
//           const normalized = (res.data.data || []).map((d) => ({
//             id: d.domain_id || d.id,
//             name: d.domain_name || d.name,
//           }));
//           setDomainOptions(normalized);
//           console.log("[Domain Search] Normalized options:", normalized.length);
//           setCachedDomains((prev) => {
//             const existing = new Map(prev.map((d) => [d.id, d]));
//             normalized.forEach((n) => existing.set(n.id, n));
//             return Array.from(existing.values());
//           });
//         }
//       } catch (err) {
//         console.error("[Domain Search] Failed:", err);
//         setDomainError("Failed to load domains. Please try again.");
//         setDomainOptions([]);
//       } finally {
//         setIsDomainLoading(false);
//       }
//     };
//     fetchDomains();
//   }, [debouncedDomainSearch, token]);

//   // Sub-Skill Search API (scoped to domain)
//   const activeSubSkillSearch = subSkillSearchMap[activeSubSkillCardId] || "";
//   const debouncedSubSkillSearch = useDebounce(activeSubSkillSearch, 300);
//   useEffect(() => {
//     console.log("[SubSkill Search] activeCardId:", activeSubSkillCardId, "search:", debouncedSubSkillSearch);
//     if (!debouncedSubSkillSearch || debouncedSubSkillSearch.length < 2 || !activeSubSkillCardId) {
//       setSubSkillOptions([]);
//       setSubSkillError(null);
//       return;
//     }
//     const card = authorityCards.find((c) => {
//       return c.domains?.some((d) => d._tempId === activeSubSkillCardId);
//     });
//     const domain = card?.domains?.find((d) => d._tempId === activeSubSkillCardId);
//     const domainId = domain?.domainId;
//     const isCustomDomain = domain?.isCustomDomain;
//     console.log("[SubSkill Search] Found domain:", { domainId, isCustomDomain });
//     if (!domainId && !isCustomDomain) {
//       setSubSkillOptions([]);
//       return;
//     }
//     const fetchSubSkills = async () => {
//       console.log("[SubSkill Search] Fetching from API...");
//       setIsSubSkillLoading(true);
//       setSubSkillError(null);
//       try {
//         if (isCustomDomain) {
//           console.log("[SubSkill Search] Custom domain - no predefined skills");
//           setSubSkillOptions([]);
//         } else {
//           const res = await axios.get(`${ BASE_URL}/master/domains/${domainId}/sub-skills`, {
// params: { search: debouncedSubSkillSearch, limit: 15 },
// timeout: 5000,
//   headers: { Authorization: `Bearer ${token}` },
//           });
// console.log("[SubSkill Search] API response:", res.data);
// if (res.data?.success) {
//   const normalized = (res.data.data || []).map((s) => ({
//     id: s.skill_id,
//     name: s.skill_name,
//   }));
//   setSubSkillOptions(normalized);
//   console.log("[SubSkill Search] Normalized options:", normalized.length);
// }
//         }
//       } catch (err) {
//   console.error("[SubSkill Search] Failed:", err);
//   setSubSkillError("Failed to load skills. Please try again.");
//   setSubSkillOptions([]);
// } finally {
//   setIsSubSkillLoading(false);
// }
//     };
// fetchSubSkills();
//   }, [debouncedSubSkillSearch, activeSubSkillCardId, authorityCards, token]);

// // Fetch Suggested Domains Per Authority Card (on job role change)
// useEffect(() => {
//   authorityCards.forEach((card) => {
//     const jobRoleId = card.job_role_id;
//     const cardId = card.id;
//     if (!jobRoleId || isNaN(jobRoleId)) {
//       if (suggestedDomainsMap[cardId]?.length > 0) {
//         setSuggestedDomainsMap((prev) => ({ ...prev, [cardId]: [] }));
//       }
//       return;
//     }
//     const lastFetchedRoleId = fetchedJobRoleMap[cardId];
//     if (lastFetchedRoleId === jobRoleId) {
//       return;
//     }
//     console.log("[Suggested Domains] Job role changed for card:", cardId, "from:", lastFetchedRoleId, "to:", jobRoleId);
//     const fetchSuggested = async () => {
//       setSuggestedDomainsLoadingMap((prev) => ({ ...prev, [cardId]: true }));
//       try {
//         const response = await axios.get(
//           `${BASE_URL}/master/job-roles/${jobRoleId}/suggested-domains`,
//           {
//             params: { limit: 10 },
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         if (response.data?.success) {
//           const normalized = (response.data.data || []).map((d) => ({
//             id: d.domain_id,
//             name: d.domain_name,
//           }));
//           setSuggestedDomainsMap((prev) => ({
//             ...prev,
//             [cardId]: normalized,
//           }));
//           setFetchedJobRoleMap((prev) => ({
//             ...prev,
//             [cardId]: jobRoleId,
//           }));
//           console.log("[Suggested Domains] Fetched:", normalized.length, "domains for job role:", jobRoleId);
//         }
//       } catch (err) {
//         console.error("[Suggested Domains] Failed:", err);
//         setSuggestedDomainsMap((prev) => ({ ...prev, [cardId]: [] }));
//       } finally {
//         setSuggestedDomainsLoadingMap((prev) => ({ ...prev, [cardId]: false }));
//       }
//     };
//     fetchSuggested();
//   });
// }, [authorityCards, fetchedJobRoleMap, token]);

// // Fetch Suggested Sub-Skills For A Domain Card
// const fetchSuggestedSubSkillsForCard = useCallback(async (cardId, domainId) => {
//   if (!domainId) {
//     console.log("[Suggested SubSkills] No domainId for card:", cardId);
//     return;
//   }
//   if (cachedSubSkills[cardId]) {
//     console.log("[Suggested SubSkills] Already cached for card:", cardId);
//     return;
//   }
//   console.log("[Suggested SubSkills] Fetching for card:", cardId, "domain:", domainId);
//   try {
//     const res = await axios.get(`${BASE_URL}/master/domains/${domainId}/sub-skills`, {
//       params: { limit: 10 },
//       headers: { Authorization: `Bearer ${token}` },
//     });
//     if (res.data?.success) {
//       const normalized = (res.data.data || []).map((s) => ({
//         id: s.skill_id,
//         name: s.skill_name,
//       }));
//       setCachedSubSkills((prev) => ({
//         ...prev,
//         [cardId]: normalized,
//       }));
//       console.log("[Suggested SubSkills] Cached:", normalized.length, "skills");
//     }
//   } catch (err) {
//     console.error("[Suggested SubSkills] Failed:", err);
//   }
// }, [cachedSubSkills, token]);

// // ============================================================================
// // INITIALIZATION FROM API DATA
// // ============================================================================

// const createEmptyCard = () => ({
//   id: generateId(),
//   selectedAuthorityId: null,
//   selectedAuthorityType: null,
//   organization_name: "",
//   companyLabel: null,
//   job_role_id: null,
//   other_job_role: "",
//   jobRoleLabel: null,
//   start_date: "",
//   end_date: "",
//   domains: [],
// });

// // Extract and normalize API response for form display
// const extractApiDataForForm = useCallback(async (fetchedSkills) => {
//   console.log("[ExtractApiData] Processing fetched skills:", fetchedSkills?.length);
//   const authorityMap = {};

//   // Group skills by authority
//   fetchedSkills.forEach((item) => {
//     console.log("the datata--------------------", item)


//     const isOther = item.authority_id == null;
//     const orgName = item.authority?.name || item.organization?.name || item.organization_name || "";
//     const key = isOther
//       ? `other-${orgName || ""}`
//       : `id-${item.authority?.authority_id || item.authority_id}`;

//       console.log("the organizatino name",orgName);

//     if (!authorityMap[key]) {
//       authorityMap[key] = {
//         authority_id: item.authority?.authority_id || item.authority_id,
//         authority_type: item.authority_type || item.authority?.type || "COMPANY",
//         // organization_name: isOther ? orgName : "",
//         organization_name: orgName,
//         job_role_id: item.job_role_id || null,
//         job_role_name: item.job_role_name,
//         other_job_role: item.other_job_role || "",
//         start_date: item.start_date || "",
//         end_date: item.end_date || "",
//         domains: {},
//       };
//     }

//     const domainName = item.domain?.trim() || item.domain_name?.trim() || null;
//     if (domainName && !authorityMap[key].domains[domainName]) {
//       authorityMap[key].domains[domainName] = {
//         domainName,
//         domainId: item.domain_id || null,
//         other_domain_name: item.other_domain_name || "",
//         isCustomDomain: item.domain_id == null,
//         subSkills: [],
//         certificate: Array.isArray(item.certificate_image)
//           ? item.certificate_image
//           : item.certificate_image
//             ? [item.certificate_image]
//             : [],
//         certificateName: item.certificate_name || "",
//       };
//     }

//     // Handle subSkills - can be array of strings or objects
//     const skillsArray = item.subSkills || item.skills || [];
//     skillsArray.forEach((skillItem) => {
//       const skillName = typeof skillItem === "string" ? skillItem : skillItem.skill_name || skillItem.other_skill_name;
//       const skillId = typeof skillItem === "object" ? skillItem.skill_id : null;
//       const experienceMonths = typeof skillItem === "object" ? skillItem.experience_months : null;

//       if (skillName?.trim() && domainName && authorityMap[key].domains[domainName]) {
//         const existingSkill = authorityMap[key].domains[domainName].subSkills.find(
//           (s) => (s.skill_id === skillId) || (s.other_skill_name === skillName) || (s.skill_name === skillName)
//         );
//         if (!existingSkill) {
//           authorityMap[key].domains[domainName].subSkills.push({
//             skill_id: skillId,
//             skill_name: skillName,
//             other_skill_name: skillId ? null : skillName,
//             experience_months: experienceMonths,
//           });
//         }
//       }
//     });
//   });

//   console.log("-----[ExtractApiData] Authority map created:", authorityMap);

//   // Convert to cards
//   const cards = Object.entries(authorityMap).map(([key, data]) => {

//     console.log("the data to be convert ot card", data);
//     let companyLabel = null;
//     if (data.authority_id) {
//       const stringId = String(data.authority_id);
//       companyLabel = { value: stringId, label: data.organization_name || `Company ${stringId}` };
//       //  Cache it so combinedAuthorityOptions can find it
//       setCachedCompanies((prev) => {
//         const exists = prev.find((c) => c.value === stringId);
//         if (!exists) {
//           return [...prev, companyLabel];
//         }
//         return prev;
//       });
//     } else if (data.organization_name) {
//       companyLabel = { value: "other", label: data.organization_name };
//     }

//     let jobRoleLabel = null;
//     if (data.job_role_id) {
//       if (data.job_role_name) {
//         jobRoleLabel = { value: String(data.job_role_id), label: data.job_role_name };
//       } else {
//         jobRoleLabel = { value: String(data.job_role_id), label: `Role ${data.job_role_id}` };
//       }
//     }

//     const domains = Object.entries(data.domains).map(([domainName, domainData]) => {
//       const domainLabel = domainData.domainId
//         ? { value: String(domainData.domainId), label: domainData.domainName }
//         : null;

//       return {
//         id: generateId(),
//         _tempId: generateId(),
//         domainName: domainData.domainName,
//         domainId: domainData.domainId,
//         domainLabel,
//         other_domain_name: domainData.other_domain_name,
//         isCustomDomain: domainData.isCustomDomain,
//         skills: domainData.subSkills,
//         certificate: domainData.certificate,
//         certificateName: domainData.certificateName,
//         status: "pending",
//       };
//     });

//     return {
//       id: generateId(),
//       selectedAuthorityId: data.authority_id == null ? "other" : String(data.authority_id),
//       selectedAuthorityType: data.authority_type,
//       organization_name: data.organization_name,
//       companyLabel,
//       job_role_id: data.job_role_id ? String(data.job_role_id) : null,
//       other_job_role: data.other_job_role,
//       jobRoleLabel,
//       start_date: data.start_date,
//       end_date: data.end_date,
//       domains,
//     };
//   });

//   console.log("[ExtractApiData] Cards created:", cards.length);
//   return cards.length > 0 ? cards : [createEmptyCard()];
// }, []);

// // Fetch profile and pre-fill form
// useEffect(() => {
//   const fetchProfile = async () => {
//     console.log("[FetchProfile] Starting fetch for user:", user?.id);
//     if (!user?.id || !token) {
//       console.log("[FetchProfile] No user or token, creating empty card");
//       setLoading(false);
//       const empty = createEmptyCard();
//       setAuthorityCards([empty]);
//       setOriginalCards([empty]);
//       return;
//     }
//     try {
//       setLoading(true);
//       const result = await userDetailsApi.getUserDetails(user.id);
//       console.log("[FetchProfile] API result:", result);
//       if (result.success) {
//         const skillsData = result.data?.skills || result.data?.domains || [];
//         console.log("[FetchProfile] Skills data:", skillsData);
//         const cards = await extractApiDataForForm(skillsData);
//         setAuthorityCards(cards);
//         setOriginalCards(JSON.parse(JSON.stringify(cards)));
//       } else {
//         const empty = createEmptyCard();
//         setAuthorityCards([empty]);
//         setOriginalCards([empty]);
//       }
//     } catch (err) {
//       console.error("[FetchProfile] Failed:", err);
//       const empty = createEmptyCard();
//       setAuthorityCards([empty]);
//       setOriginalCards([empty]);
//     } finally {
//       setLoading(false);
//     }
//   };
//   fetchProfile();
// }, [user?.id, token, extractApiDataForForm]);

// // ============================================================================
// // HANDLERS
// // ============================================================================

// const handleCompanyChange = useCallback((cardId, opt) => {
//   console.log("[HandleCompanyChange] cardId:", cardId, "opt:", opt);
//   if (!opt) {
//     setAuthorityCards((prev) =>
//       prev.map((c) =>
//         c.id === cardId
//           ? { ...c, selectedAuthorityId: null, selectedAuthorityType: null, organization_name: "", companyLabel: null, job_role_id: null, other_job_role: "", jobRoleLabel: null }
//           : c
//       )
//     );
//   } else if (opt.__isNew__) {
//     setAuthorityCards((prev) =>
//       prev.map((c) =>
//         c.id === cardId
//           ? {
//             ...c,
//             selectedAuthorityId: "other",
//             selectedAuthorityType: "COMPANY",
//             organization_name: opt.label,
//             companyLabel: { value: opt.label, label: opt.label },
//             job_role_id: null,
//             other_job_role: "",
//             jobRoleLabel: null,
//           }
//           : c
//       )
//     );
//   } else {
//     setAuthorityCards((prev) =>
//       prev.map((c) =>
//         c.id === cardId
//           ? {
//             ...c,
//             selectedAuthorityId: opt.value,
//             selectedAuthorityType: opt.type || "COMPANY",
//             organization_name: "",
//             companyLabel: { value: opt.value, label: opt.label },
//             job_role_id: null,
//             other_job_role: "",
//             jobRoleLabel: null,
//           }
//           : c
//       )
//     );
//   }
//   setErrors((prev) => {
//     const newErrors = { ...prev };
//     if (newErrors[cardId]?.selectedAuthorityId) {
//       delete newErrors[cardId].selectedAuthorityId;
//       if (Object.keys(newErrors[cardId] || {}).length === 0) delete newErrors[cardId];
//     }
//     return newErrors;
//   });
// }, []);

// const handleJobRoleChange = useCallback((cardId, opt) => {
//   console.log("[HandleJobRoleChange] cardId:", cardId, "opt:", opt);
//   if (!opt) {
//     setAuthorityCards((prev) =>
//       prev.map((c) =>
//         c.id === cardId ? { ...c, job_role_id: null, other_job_role: "", jobRoleLabel: null } : c
//       )
//     );
//   } else if (opt.__isNew__) {
//     setAuthorityCards((prev) =>
//       prev.map((c) =>
//         c.id === cardId
//           ? {
//             ...c,
//             job_role_id: null,
//             other_job_role: opt.label,
//             jobRoleLabel: { value: opt.label, label: opt.label },
//           }
//           : c
//       )
//     );
//   } else {
//     setAuthorityCards((prev) =>
//       prev.map((c) =>
//         c.id === cardId
//           ? {
//             ...c,
//             job_role_id: String(opt.id),
//             other_job_role: "",
//             jobRoleLabel: { value: String(opt.id), label: opt.title },
//           }
//           : c
//       )
//     );
//   }
//   setErrors((prev) => {
//     const newErrors = { ...prev };
//     if (newErrors[cardId]?.job_role_id) {
//       delete newErrors[cardId].job_role_id;
//       if (Object.keys(newErrors[cardId] || {}).length === 0) delete newErrors[cardId];
//     }
//     return newErrors;
//   });
// }, []);

// const handleAddDomainToAuthority = useCallback((cardId, domainData, start_date, end_date, job_role_id, other_job_role, organization_name = "") => {
//   console.log("[HandleAddDomain] cardId:", cardId, "domainData:", domainData);
//   const isNew = domainData.__isNew__;
//   const isCustomDomain = isNew || domainData.id == null;
//   const newDomainId = isCustomDomain ? null : typeof domainData.id === "string" ? parseInt(domainData.id, 10) : domainData.id;
//   const newOtherDomainName = isCustomDomain ? domainData.name : "";
//   const domainName = isCustomDomain ? newOtherDomainName : domainData.name;

//   setAuthorityCards((prev) =>
//     prev.map((card) => {
//       if (card.id !== cardId) return card;
//       const exists = card.domains.some(
//         (d) => d.domainId === newDomainId || d.domainName?.toLowerCase() === domainName?.toLowerCase()
//       );
//       if (exists) {
//         console.warn("[HandleAddDomain] Domain already exists");
//         return card;
//       }
//       return {
//         ...card,
//         domains: [
//           ...card.domains,
//           {
//             id: generateId(),
//             _tempId: generateId(),
//             domainName: domainName,
//             domainId: newDomainId,
//             domainLabel: isNew ? null : { value: String(newDomainId), label: domainName },
//             other_domain_name: newOtherDomainName,
//             isCustomDomain,
//             skills: [],
//             certificate: [],
//             certificateName: "",
//             status: "pending",
//           },
//         ],
//       };
//     })
//   );

//   if (!isCustomDomain && newDomainId) {
//     const newTempId = Date.now() + Math.random();
//     fetchSuggestedSubSkillsForCard(newTempId, newDomainId);
//   }
// }, [fetchSuggestedSubSkillsForCard]);

// const handleRemoveDomain = useCallback((cardId, domainTempId) => {
//   console.log("[HandleRemoveDomain] cardId:", cardId, "domainTempId:", domainTempId);
//   setAuthorityCards((prev) =>
//     prev.map((c) =>
//       c.id === cardId ? { ...c, domains: c.domains.filter((d) => d._tempId !== domainTempId) } : c
//     )
//   );
// }, []);

// const handleAddCustomSubSkill = useCallback((tempId, rawSkillName, skillObj = null) => {
//   const skillName = rawSkillName.trim();
//   console.log("[HandleAddCustomSubSkill] tempId:", tempId, "skillName:", skillName, "skillObj:", skillObj);
//   if (!skillName) return;

//   setAuthorityCards((prev) =>
//     prev.map((card) => {
//       const domain = card.domains?.find((d) => d._tempId === tempId);
//       if (!domain) return card;
//       const isDuplicate = domain.skills.some((s) => {
//         if (skillObj?.id && s.skill_id === skillObj.id) return true;
//         if (
//           skillName &&
//           (s.other_skill_name?.toLowerCase() === skillName.toLowerCase() ||
//             s.skill_name?.toLowerCase() === skillName.toLowerCase())
//         )
//           return true;
//         return false;
//       });
//       if (isDuplicate) {
//         console.warn("[HandleAddCustomSubSkill] Skill already added");
//         return card;
//       }
//       const newSkill = skillObj
//         ? {
//           skill_id: skillObj.id,
//           skill_name: skillObj.name,
//           experience_months: null,
//         }
//         : {
//           other_skill_name: skillName,
//           experience_months: null,
//         };
//       const totalMonths = calculateTotalMonths(card.start_date, card.end_date);
//       const currentCount = domain.skills.length + 1;
//       const defaultMonths = totalMonths > 0 ? Math.max(1, Math.floor(totalMonths / currentCount)) : null;
//       newSkill.experience_months = defaultMonths;
//       return {
//         ...card,
//         domains: card.domains.map((d) =>
//           d._tempId === tempId ? { ...d, skills: [...d.skills, newSkill] } : d
//         ),
//       };
//     })
//   );
//   setSubSkillSearchMap((prev) => ({ ...prev, [tempId]: "" }));
//   setSubSkillOptions([]);
//   setActiveSubSkillCardId(null);
// }, []);

// const handleRemoveCustomSubSkill = useCallback((tempId, skillName) => {
//   console.log("[HandleRemoveCustomSubSkill] tempId:", tempId, "skillName:", skillName);
//   setAuthorityCards((prev) =>
//     prev.map((card) => {
//       const domain = card.domains?.find((d) => d._tempId === tempId);
//       if (!domain) return card;
//       return {
//         ...card,
//         domains: card.domains.map((d) =>
//           d._tempId === tempId
//             ? {
//               ...d,
//               skills: d.skills.filter(
//                 (s) => s.other_skill_name !== skillName && s.skill_name !== skillName
//               ),
//             }
//             : d
//         ),
//       };
//     })
//   );
// }, []);

// const handleToggleSubSkill = useCallback((tempId, skill) => {
//   console.log("[HandleToggleSubSkill] tempId:", tempId, "skill:", skill);
//   setAuthorityCards((prev) =>
//     prev.map((card) => {
//       const domain = card.domains?.find((d) => d._tempId === tempId);
//       if (!domain) return card;
//       const isAlreadySelected = domain.skills.some((s) => s.skill_id === skill.id);
//       if (isAlreadySelected) {
//         return {
//           ...card,
//           domains: card.domains.map((d) =>
//             d._tempId === tempId
//               ? { ...d, skills: d.skills.filter((s) => s.skill_id !== skill.id) }
//               : d
//           ),
//         };
//       } else {
//         const totalMonths = calculateTotalMonths(card.start_date, card.end_date);
//         const currentCount = domain.skills.length + 1;
//         const defaultMonths = totalMonths > 0 ? Math.max(1, Math.floor(totalMonths / currentCount)) : null;
//         return {
//           ...card,
//           domains: card.domains.map((d) =>
//             d._tempId === tempId
//               ? {
//                 ...d,
//                 skills: [
//                   ...d.skills,
//                   {
//                     skill_id: skill.id,
//                     skill_name: skill.name,
//                     experience_months: defaultMonths,
//                   },
//                 ],
//               }
//               : d
//           ),
//         };
//       }
//     })
//   );
// }, []);

// const handleExperienceChange = useCallback((tempId, skillId, skillName, value) => {
//   const numValue = value === "" ? null : Number(value);
//   if (isNaN(numValue) && value !== "") return;
//   console.log("[HandleExperienceChange] tempId:", tempId, "skillId:", skillId, "value:", numValue);
//   setAuthorityCards((prev) =>
//     prev.map((card) => {
//       const domain = card.domains?.find((d) => d._tempId === tempId);
//       if (!domain) return card;
//       return {
//         ...card,
//         domains: card.domains.map((d) =>
//           d._tempId === tempId
//             ? {
//               ...d,
//               skills: d.skills.map((s) => {
//                 const match =
//                   (skillId && s.skill_id === skillId) ||
//                   (skillName &&
//                     (s.other_skill_name === skillName || s.skill_name === skillName));
//                 if (match) {
//                   return { ...s, experience_months: numValue };
//                 }
//                 return s;
//               }),
//             }
//             : d
//         ),
//       };
//     })
//   );
// }, []);

// const handleCertificateUpload = async (tempId, file) => {
//   console.log("[HandleCertificateUpload] tempId:", tempId, "file:", file?.name);
//   if (!file) {
//     setAuthorityCards((prev) =>
//       prev.map((card) => ({
//         ...card,
//         domains: card.domains.map((d) =>
//           d._tempId === tempId ? { ...d, certificate: [], certificateName: "" } : d
//         ),
//       }))
//     );
//     return;
//   }
//   try {
//     const url = await uploadImage(file, "certificate", token);
//     if (url) {
//       setAuthorityCards((prev) =>
//         prev.map((card) => ({
//           ...card,
//           domains: card.domains.map((d) =>
//             d._tempId === tempId ? { ...d, certificate: [url], certificateName: file.name } : d
//           ),
//         }))
//       );
//       console.log("[HandleCertificateUpload] Success:", url);
//     }
//   } catch (err) {
//     console.error("[HandleCertificateUpload] Failed:", err);
//   }
// };

// const handleRemoveCertificate = useCallback((tempId) => {
//   console.log("[HandleRemoveCertificate] tempId:", tempId);
//   setAuthorityCards((prev) =>
//     prev.map((card) => ({
//       ...card,
//       domains: card.domains.map((d) =>
//         d._tempId === tempId ? { ...d, certificate: [], certificateName: "" } : d
//       ),
//     }))
//   );
// }, []);

// const handleAddCard = useCallback(() => {
//   console.log("[HandleAddCard] Creating new card");
//   setAuthorityCards((prev) => [...prev, createEmptyCard()]);
// }, []);

// const handleRemoveCard = useCallback((cardId) => {
//   if (window.confirm("Are you sure you want to remove this experience entry?")) {
//     console.log("[HandleRemoveCard] cardId:", cardId);
//     setAuthorityCards((prev) => prev.filter((c) => c.id !== cardId));
//     setErrors((prev) => {
//       const newErrors = { ...prev };
//       delete newErrors[cardId];
//       return newErrors;
//     });
//   }
// }, []);

// // Validate entries
// const validateEntries = useCallback(() => {
//   console.log("[ValidateEntries] Validating...");
//   const newErrors = {};
//   let isValid = true;
//   authorityCards.forEach((card) => {
//     const cardErrors = {};
//     const isOther = card.selectedAuthorityId === "other";
//     const authId = isOther ? null : parseInt(card.selectedAuthorityId, 10);
//     if (!authId && !card.organization_name?.trim()) {
//       cardErrors.selectedAuthorityId = "Please select an organization or enter a name";
//       isValid = false;
//     }
//     card.domains.forEach((domain) => {
//       const domainErrors = {};
//       if (!domain.domainId && !domain.other_domain_name?.trim()) {
//         domainErrors.domain_id = "Please select or enter a domain";
//         isValid = false;
//       }
//       if (domain.skills.length === 0) {
//         domainErrors.skills = "Please select or add at least one skill";
//         isValid = false;
//       }
//       if (Object.keys(domainErrors).length > 0) {
//         cardErrors.domains = { ...cardErrors.domains, [domain._tempId]: domainErrors };
//       }
//     });
//     if (Object.keys(cardErrors).length > 0) {
//       newErrors[card.id] = cardErrors;
//     }
//   });
//   console.log("[ValidateEntries] Errors:", newErrors, "Valid:", isValid);
//   setErrors(newErrors);
//   return isValid;
// }, [authorityCards]);

// // Save changes
// const handleSaveChanges = async () => {
//   console.log("[HandleSaveChanges] Starting save...");
//   if (!validateEntries()) {
//     showToast("Please fix validation errors before saving.", "error");
//     return;
//   }
//   if (!user?.id || !token) {
//     showToast("Not authenticated", "error");
//     return;
//   }
//   setSaving(true);
//   const previousCards = JSON.parse(JSON.stringify(authorityCards));
//   try {
//     const domainsToValidate = [];
//     authorityCards.forEach((card) => {
//       const isOther = card.selectedAuthorityId === "other";
//       const authId = isOther ? null : parseInt(card.selectedAuthorityId, 10);
//       card.domains.forEach((domain) => {
//         if (domain.skills.length > 0) {
//           domainsToValidate.push({
//             authority_id: authId,
//             authority_type: card.selectedAuthorityType || (isOther ? "COMPANY" : "UNIVERSITY"),
//             ...(isOther && { organization_name: card.organization_name }),
//             job_role_id: card.job_role_id ? parseInt(card.job_role_id, 10) : null,
//             other_job_role: card.other_job_role || undefined,
//             domain_id: domain.domainId,
//             other_domain_name: domain.other_domain_name || undefined,
//             skills: domain.skills.map((s) => ({
//               skill_id: s.skill_id != null ? s.skill_id : undefined,
//               skill_name: s.skill_name,
//               other_skill_name: s.other_skill_name,
//               experience_months: s.experience_months,
//             })),
//             certificate: domain.certificate || [],
//             start_date: card.start_date,
//             end_date: card.end_date || null,
//           });
//         }
//       });
//     });
//     console.log("[HandleSaveChanges] Payload domains:", domainsToValidate);
//     domainsSchema.parse({ domains: domainsToValidate });
//     setOriginalCards(JSON.parse(JSON.stringify(authorityCards)));
//     const payload = { domains: domainsToValidate };
//     const result = await userDetailsApi.updateUserDetails(user.id, payload, token);
//     console.log("[HandleSaveChanges] API result:", result);
//     if (result.success || result.message?.includes("successfully")) {
//       showToast("Skills updated successfully!", "success");
//       setTimeout(() => navigate("/feed-view"), 1500);
//     } else {
//       setAuthorityCards(previousCards);
//       throw new Error(result.message || "Update failed");
//     }
//   } catch (err) {
//     console.error("[HandleSaveChanges] Save error:", err);
//     showToast("Failed to save. Please try again.", "error");
//   } finally {
//     setSaving(false);
//   }
// };

// const handleGoBack = () => {
//   console.log("[HandleGoBack] Navigating back");
//   navigate("/feed-view");
// };

// // Get select value helper
// const getSelectValue = (options, cachedValue, currentValue, displayLabel) => {
//   if (currentValue && displayLabel) return displayLabel;
//   if (currentValue) {
//     const found = options.find((opt) => opt.value === currentValue || opt.id === currentValue);
//     if (found) return found;
//     if (cachedValue) return cachedValue;
//   }
//   return null;
// };

// // Combined authority options
// const combinedAuthorityOptions = useMemo(() => {
//   const allOptions = [...cachedCompanies, ...companyOptions];
//   const seen = new Map();
//   allOptions.forEach((opt) => {
//     if (!seen.has(opt.value)) {
//       seen.set(opt.value, opt);
//     }
//   });
//   return Array.from(seen.values());
// }, [cachedCompanies, companyOptions]);

// // Combined job role options
// const combinedJobRoleOptions = useMemo(() => {
//   const allOptions = [...cachedJobRoles, ...jobRoleOptions].map((jr) => ({
//     id: jr.id,
//     title: jr.title,
//     value: jr.id,
//     label: jr.title,
//   }));
//   return allOptions;
// }, [cachedJobRoles, jobRoleOptions]);

// // Combined domain options
// const combinedDomainOptions = useMemo(() => {
//   const allOptions = [...cachedDomains, ...domainOptions].map((d) => ({
//     id: d.id,
//     name: d.name,
//     value: String(d.id),
//     label: d.name,
//   }));
//   return allOptions;
// }, [cachedDomains, domainOptions]);

// // Loading State
// if (loading) {
//   return (
//     <MainLayout>
//       <div className="flex items-center justify-center h-screen bg-gray-100">
//         <div className="flex flex-col items-center gap-3">
//           <div className="w-12 h-12 border-b-2 border-blue-500 rounded-full animate-spin"></div>
//           <p className="text-gray-600">Loading your skills...</p>
//         </div>
//       </div>
//     </MainLayout>
//   );
// }

// return (
//   <MainLayout>
//     <div className="flex justify-center min-h-screen px-2 bg-gray-100 lg:px-8">
//       <div className="flex-grow hidden lg:block"></div>
//       <section className="w-full max-w-[95vw] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] h-auto p-3 sm:p-4 md:p-5 lg:p-6 rounded-[5px] bg-white flex flex-col shadow-lg gap-3 sm:gap-4 mt-2 mx-auto">
//         {/* Header */}
//         <div className="mb-6 sm:mb-8">
//           <div className="flex items-center gap-3 mb-4 sm:mb-6">
//             <button onClick={handleGoBack} className="p-2 transition-colors rounded-full hover:bg-gray-100">
//               <IoIosArrowBack className="w-5 h-5 text-gray-600" />
//             </button>
//             <h1 className="text-xl font-bold text-gray-800 sm:text-2xl lg:text-3xl">Manage Your Experience/Skills</h1>
//           </div>
//         </div>

//         {/* Toast Notification */}
//         {toast && (
//           <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
//             }`}>
//             {toast.type === "success" ? <FaCheckCircle /> : <FaExclamationCircle />}
//             <span className="text-sm font-medium">{toast.message}</span>
//           </div>
//         )}

//         {/* Authority Cards */}
//         <div className="space-y-5">
//           {authorityCards.map((card) => {
//             const {
//               id: cardId,
//               selectedAuthorityId,
//               selectedAuthorityType,
//               organization_name,
//               job_role_id,
//               other_job_role,
//               start_date,
//               end_date,
//               companyLabel,
//               jobRoleLabel,
//             } = card;
//             const dateError = isValidDateRange(start_date, end_date, dob);
//             const isOtherSelected = selectedAuthorityId === "other";
//             const authorityDomains = card.domains || [];



//             console.log("[Authority Card] Rendering card:", cardId, "domains:", authorityDomains.length);
//             // console.log("cachedCompanies",cachedCompanies);
//             // console.log("the label", companyLabel);
//             return (
//               <div
//                 key={cardId}
//                 className="p-5 bg-white border shadow-sm border-slate-200 rounded-xl"
//               >
//                 {/* Authority Selection */}
//                 <div className="flex items-start justify-between mb-4">
//                   <div className="flex-1 min-w-0">
//                     <label className={labelClass}>Company Name</label>
//                     <CreatableSelect
//                       value={(() => {
//                         //  Priority 1: If it's "other" type, use organization_name directly
//                         if (selectedAuthorityId === "other" && organization_name) {
//                           return { value: "other", label: organization_name };
//                         }

//                         //  Priority 2: Use card.companyLabel (already populated from API)
//                         if (card.companyLabel) {
//                           return card.companyLabel;
//                         }

//                         //  Priority 3: Fallback to search in combinedAuthorityOptions
//                         if (selectedAuthorityId) {
//                           return combinedAuthorityOptions.find(
//                             (opt) => opt.value === String(selectedAuthorityId)
//                           ) || null;
//                         }

//                         return null;
//                       })()}
//                       onChange={(opt) => handleCompanyChange(cardId, opt)}
//                       options={combinedAuthorityOptions}
//                       inputValue={companySearch}
//                       onInputChange={(val) => {
//                         setCompanySearch(val);
//                         if (val.length < 3) setCompanyOptions([]);
//                       }}
//                       placeholder="Search or type company [Min 3 chars]"
//                       isClearable
//                       styles={{ ...selectStyles, control: (base) => ({ ...base, borderColor: errors[cardId]?.selectedAuthorityId ? "red" : base.borderColor }) }}
//                       components={{ IndicatorSeparator: () => null }}
//                       isLoading={isCompanyLoading}
//                     />
//                     <p className="mt-1 text-xs text-slate-500">
//                       If not listed above, enter the full official name without abbreviations.
//                     </p>
//                     {errors[cardId]?.selectedAuthorityId && (
//                       <p className="mt-1 text-xs text-red-500">{errors[cardId].selectedAuthorityId}</p>
//                     )}
//                     {companyError && (
//                       <p className="mt-1 text-xs text-red-500">{companyError}</p>
//                     )}
//                   </div>
//                   {selectedAuthorityId && authorityCards.length > 1 && (
//                     <button
//                       type="button"
//                       onClick={() => handleRemoveCard(cardId)}
//                       className="flex items-center justify-center flex-shrink-0 ml-3 text-red-500 transition rounded-lg hover:text-red-700 hover:bg-red-50"
//                       aria-label="Remove authority"
//                     >
//                       <FaTrash size={14} />
//                     </button>
//                   )}
//                 </div>

//                 {/* Date Inputs */}
//                 {selectedAuthorityId && (
//                   <>
//                     <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2">
//                       <div>
//                         <label className={labelClass}>From</label>
//                         <input
//                           type="month"
//                           value={start_date}
//                           onChange={(e) => {
//                             const val = e.target.value;
//                             setAuthorityCards((prev) =>
//                               prev.map((c) =>
//                                 c.id === cardId ? { ...c, start_date: val } : c
//                               )
//                             );
//                           }}
//                           className={inputClass}
//                           placeholder="Month/Year"
//                         />
//                         <p className="mt-1 text-xs text-slate-500">e.g., June 2023</p>
//                       </div>
//                       <div>
//                         <label className={labelClass}>To</label>
//                         <input
//                           type="month"
//                           value={end_date || ""}
//                           onChange={(e) => {
//                             const val = e.target.value;
//                             setAuthorityCards((prev) =>
//                               prev.map((c) =>
//                                 c.id === cardId ? { ...c, end_date: val || null } : c
//                               )
//                             );
//                           }}
//                           className={inputClass}
//                           placeholder="Month/Year"
//                         />
//                         <p className="mt-1 text-xs text-slate-500">
//                           e.g., Jan 2024 or leave blank for "Present"
//                         </p>
//                       </div>
//                       {dateError !== true && (
//                         <p className="col-span-2 mt-1 text-xs text-red-500">
//                           {dateError}
//                         </p>
//                       )}
//                     </div>

//                     {/* Job Role Dropdown */}
//                     <div className="mb-4">
//                       <label className={labelClass}>Job Roles</label>
//                       <CreatableSelect
//                         value={
//                           job_role_id != null
//                             ? combinedJobRoleOptions.find(
//                               (opt) => String(opt.id) === String(job_role_id)
//                             ) || jobRoleLabel
//                             : other_job_role
//                               ? {
//                                 value: other_job_role,
//                                 label: other_job_role,
//                                 __isNew__: true,
//                               }
//                               : null
//                         }
//                         onChange={(opt) => handleJobRoleChange(cardId, opt)}
//                         options={combinedJobRoleOptions}
//                         inputValue={jobRoleSearch}
//                         onInputChange={(val) => {
//                           setJobRoleSearch(val);
//                           if (val.length < 3) setJobRoleOptions([]);
//                         }}
//                         placeholder="Search or type your role... [Min 3 chars]"
//                         isClearable
//                         styles={{ ...selectStyles, control: (base) => ({ ...base, borderColor: errors[cardId]?.job_role_id ? "red" : base.borderColor }) }}
//                         components={{ IndicatorSeparator: () => null }}
//                         isLoading={isJobRoleLoading}
//                       />
//                       {errors[cardId]?.job_role_id && (
//                         <p className="mt-1 text-xs text-red-500">{errors[cardId].job_role_id}</p>
//                       )}
//                       {jobRoleError && (
//                         <p className="mt-1 text-xs text-red-500">{jobRoleError}</p>
//                       )}
//                     </div>

                   

//                     {/* Tip */}
//                     {/* <p className="p-3 mb-3 text-sm rounded-lg text-slate-600 bg-blue-50">
//                       <FaInfoCircle className="inline mr-1" />
//                       <strong>Tip:</strong> Choose a <em>broad domain</em> like{" "}
//                       <strong>Web Development</strong> or{" "}
//                       <strong>Data Analysis</strong>, not specific skills like
//                       "HTML" or "Python". You will add specific skills next.
//                     </p> */}

//                     {/* Domain Cards */}
//                     <div className="mt-4 space-y-4">
//                       {authorityDomains.map((domain) => {
//                         const isCustomDomain = domain.isCustomDomain;
//                         const domainName = domain.domainName || (isCustomDomain
//                           ? domain.other_domain_name
//                           : domain.domainId
//                             ? cachedDomains.find(d => d.id === domain.domainId)?.name || `Domain ${domain.domainId}`
//                             : "Unknown Domain");
//                         const skills = domain.skills || [];

//                         console.log("[Domain Card] Rendering:", domainName, "skills:", skills.length);

//                         return (
//                           <div key={domain._tempId} className="p-4 border rounded-lg bg-slate-50 border-slate-200">
//                             {/* Domain Header */}
//                             <div className="flex items-start justify-between">
//                               <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-medium">
//                                 {domainName}
//                               </span>
//                               <button type="button" onClick={() => handleRemoveDomain(cardId, domain._tempId)} className="text-slate-400 hover:text-red-500">
//                                 <RxCross2 size={12} />
//                               </button>
//                             </div>

//                             {/* Certificate Upload */}
//                             <div className="mt-3">
//                               <input id={`cert-${domain._tempId}`} type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleCertificateUpload(domain._tempId, e.target.files[0])} />
//                               <label htmlFor={`cert-${domain._tempId}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 border text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-100 cursor-pointer">
//                                 <FaFileAlt size={12} />
//                                 {domain.certificateName ? "Change Certificate" : "Upload Certificate"}
//                               </label>
//                             </div>
//                             {domain.certificateName && (
//                               <div className="flex items-center justify-between p-2 mt-2 text-xs bg-white border rounded">
//                                 <span className="max-w-[120px] text-green-600 truncate">{domain.certificateName || "Uploaded file"}</span>
//                                 <button type="button" onClick={() => handleRemoveCertificate(domain._tempId)} className="text-red-500 hover:text-red-700">Remove</button>
//                               </div>
//                             )}

//                             {/* Sub-skill Search & Suggestions */}
//                             <div className="mt-4">
//                               <label className="block text-sm font-medium text-slate-700 mb-1.5">Add Sub Skills</label>
//                               <SubSkillSearchInput
//                                 cardId={domain._tempId}
//                                 domainId={domain.domainId}
//                                 isCustomDomain={isCustomDomain}
//                                 existingSkills={skills}
//                                 onAddSkill={handleAddCustomSubSkill}
//                                 onRemoveSkill={handleRemoveCustomSubSkill}
//                                 onToggleSkill={handleToggleSubSkill}
//                                 onExperienceChange={handleExperienceChange}
//                                 subSkillSearchMap={subSkillSearchMap}
//                                 setSubSkillSearchMap={setSubSkillSearchMap}
//                                 activeSubSkillCardId={activeSubSkillCardId}
//                                 setActiveSubSkillCardId={setActiveSubSkillCardId}
//                                 subSkillOptions={subSkillOptions}
//                                 isSubSkillLoading={isSubSkillLoading}
//                                 cachedSubSkills={cachedSubSkills}
//                                 fetchSuggestedSubSkillsForCard={fetchSuggestedSubSkillsForCard}
//                                 subSkillError={subSkillError}
//                               />
//                             </div>
//                             {skills.length === 0 && <p className="mt-2 text-xs text-red-500">Please add at least one sub skill.</p>}
//                           </div>
//                         );
//                       })}
//                     </div>

//                     {/* Add Domain Button */}
//                     <div className="mt-4 text-left">
//                       <CreatableSelect
//                         options={combinedDomainOptions}
//                         isLoading={isDomainLoading}
//                         onInputChange={(val) => {
//                           setDomainSearch(val);
//                           if (val.length < 3) setDomainOptions([]);
//                         }}
//                         onChange={(opt) => {
//                           if (opt) {
//                             handleAddDomainToAuthority(
//                               cardId,
//                               { id: opt.id, name: opt.label, __isNew__: opt.__isNew__ },
//                               start_date,
//                               end_date,
//                               job_role_id,
//                               other_job_role,
//                               organization_name
//                             );
//                           }
//                         }}
//                         placeholder="Search or add a skill..."
//                         isClearable
//                         styles={selectStyles}
//                         components={{ IndicatorSeparator: () => null }}
//                         value={null}
//                       />
//                       {domainError && (
//                         <p className="mt-1 text-xs text-red-500">{domainError}</p>
//                       )}
//                     </div>

//                     {/* Suggested Domains Chips (based on Job Role) */}
//                     {job_role_id && (suggestedDomainsLoadingMap[cardId] || (suggestedDomainsMap[cardId] && suggestedDomainsMap[cardId].length > 0)) && (
//                       <div className="p-3 mt-3 mb-4 border border-gray-200 rounded-md bg-gray-50">
//                         <div className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
//                           {suggestedDomainsLoadingMap[cardId] ? "Loading suggestions..." : "Suggested Skills"}
//                         </div>
//                         <div className="flex flex-wrap gap-2">
//                           {(suggestedDomainsMap[cardId] || []).map((domain) => {
//                             const isAlreadyAdded = authorityDomains.some(
//                               (d) => d.domainId === domain.id
//                             );
//                             if (isAlreadyAdded) return null;
//                             return (
//                               <button
//                                 key={`${cardId}-suggested-domain-${domain.id}`}
//                                 type="button"
//                                 onClick={() => {
//                                   console.log("[Suggested Domain] Clicked:", domain);
//                                   handleAddDomainToAuthority(
//                                     cardId,
//                                     { id: domain.id, name: domain.name },
//                                     start_date,
//                                     end_date,
//                                     job_role_id,
//                                     other_job_role,
//                                     organization_name
//                                   );
//                                 }}
//                                 className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-full hover:bg-blue-50 hover:border-blue-400 transition-colors shadow-sm"
//                               >
//                                 <span>{domain.name}</span>
//                                 <FaPlus className="w-3 h-3" />
//                               </button>
//                             );
//                           })}
//                           {(suggestedDomainsMap[cardId] || []).length === 0 && !suggestedDomainsLoadingMap[cardId] && (
//                             <span className="text-sm italic text-gray-400">
//                               No specific suggestions for this role. Search below.
//                             </span>
//                           )}
//                         </div>
//                       </div>
//                     )}
//                   </>
//                 )}

//                 {!selectedAuthorityId && (
//                   <div className="py-4 text-sm text-center rounded-lg text-slate-500 bg-slate-50">
//                     <FaBuilding className="mx-auto mb-2 text-slate-400" size={20} />
//                     Select a company to add experience, dates, and skills.
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>

//         {/* Add New Authority Button */}
//         <div className="pt-2 text-center">
//           <button
//             type="button"
//             onClick={handleAddCard}
//             className="inline-flex items-center gap-2 px-4 py-2.5 text-blue-600 font-medium rounded-lg hover:bg-blue-50 border border-blue-200 transition"
//           >
//             <FaPlus size={14} />
//             Add a Company
//           </button>
//         </div>

//         {/* Save Button */}
//         <div className="flex justify-center mt-6 sm:mt-8">
//           <Button onClick={handleSaveChanges} disabled={saving} className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold text-sm transition-colors duration-200 disabled:opacity-50">
//             {saving ? (
//               <div className="flex items-center justify-center">
//                 <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
//                 Saving...
//               </div>
//             ) : (
//               "Save Changes"
//             )}
//           </Button>
//         </div>
//       </section>
//       <div className="flex-grow hidden lg:block"></div>
//     </div>

//     {/* CSS for toast animation */}
//     <style>{`
//         @keyframes slideIn {
//           from { transform: translateX(100%); opacity: 0; }
//           to { transform: translateX(0); opacity: 1; }
//         }
//         .animate-slide-in { animation: slideIn 0.3s ease-out; }
//       `}</style>
//   </MainLayout>
// );
// };

// export default FeedYourSkills;














import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/ui";
import MainLayout from "../../../components/layout/MainLayout";
import { IoIosArrowBack } from "react-icons/io";
import { RxCross2 } from "react-icons/rx";
import { FaTrash, FaPlus, FaFileAlt, FaCheckCircle, FaExclamationCircle, FaSpinner, FaSearch, FaBuilding, FaInfoCircle } from "react-icons/fa";
import { useSelector } from "react-redux";
import useUploadImageApi from "../../../hooks/useUploadImageApi";
import { userDetailsApi } from "../../../api/userDetailsApi";
import { z } from "zod";
import { getImageUrl } from "../../../../utils.js";
import CreatableSelect from "react-select/creatable";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// --- Edu Green Theme (matches Feed Your Education page) ---
const EDU_GREEN = "#9bc87c";
const EDU_GREEN_DARK = "#88b86a";
const EDU_GREEN_TEXT = "#3f5a26";
const EDU_GREEN_TEXT_SOFT = "#5a7d3d";
const EDU_OPTION_HOVER = "#e6f4dc";
const EDU_ERROR = "#ef4444";

// Generate stable unique ID
const generateId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "id-" + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// Zod Schema for validation
const domainsSchema = z.object({
  domains: z.array(
    z.object({
      authority_id: z.union([z.string(), z.number(), z.null()]).optional(),
      organization_name: z.string().optional(),
      authority_type: z.enum(["COMPANY", "UNIVERSITY"]).optional(),
      domain_id: z.number().nullable().optional(),
      other_domain_name: z.string().optional(),
      job_role_id: z.number().nullable().optional(),
      other_job_role: z.string().optional(),
      skills: z.array(
        z.object({
          skill_id: z.number().nullable().optional(),
          skill_name: z.string().optional(),
          other_skill_name: z.string().optional(),
          experience_months: z.number().nullable().optional(),
        })
      ).min(1, "At least one skill is required"),
      certificate: z.array(z.string()).optional(),
      start_date: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Invalid start date format (YYYY-MM)").optional(),
      end_date: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Invalid end date format (YYYY-MM)").optional().nullable(),
    })
  ).min(1, "At least one experience entry is required"),
});

// Unified select styles (Edu green theme)
const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "44px",
    borderColor: state.isFocused ? EDU_GREEN : "#cbd5e1",
    boxShadow: state.isFocused ? "0 0 0 2px rgba(155, 200, 124, 0.3)" : "none",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "white",
    "&:hover": { borderColor: EDU_GREEN },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#9ca3af",
    fontWeight: 400,
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#1f2937",
    fontWeight: 500,
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    overflow: "hidden",
    zIndex: 20,
  }),
  option: (provided, state) => ({
    ...provided,
    padding: "10px 14px",
    cursor: "pointer",
    backgroundColor: state.isSelected
      ? EDU_GREEN
      : state.isFocused
        ? EDU_OPTION_HOVER
        : "white",
    color: state.isSelected ? "white" : "#1f2937",
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? EDU_GREEN : "#94a3b8",
    "&:hover": { color: EDU_GREEN },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "#94a3b8",
    "&:hover": { color: EDU_GREEN },
  }),
  loadingIndicator: (base) => ({
    ...base,
    color: EDU_GREEN,
  }),
  indicatorSeparator: () => ({ display: "none" }),
};

// Input class
const inputClass = "w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#9bc87c]/30 focus:border-[#9bc87c] outline-none bg-white";
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

// Debounce hook
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Validate date range
const isValidDateRange = (start, end, dob) => {
  if (!start) return true;
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : null;
  const dobDate = dob ? new Date(dob) : null;
  if (dobDate && startDate < dobDate) {
    return "Start date cannot be before your date of birth";
  }
  if (endDate && startDate > endDate) {
    return "Start date cannot be after end date";
  }
  return true;
};

// Calculate total months between two dates
const calculateTotalMonths = (start, end) => {
  if (!start) return 0;
  const startDate = new Date(start + "-01");
  const endDate = end ? new Date(end + "-01") : new Date();
  let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
  months -= startDate.getMonth();
  months += endDate.getMonth();
  return Math.max(0, months);
};

// ============================================================================
// SUB-COMPONENT: SubSkill Search Input
// ============================================================================
function SubSkillSearchInput({
  cardId,
  domainId,
  isCustomDomain,
  existingSkills,
  onAddSkill,
  onRemoveSkill,
  onToggleSkill,
  onExperienceChange,
  subSkillSearchMap,
  setSubSkillSearchMap,
  activeSubSkillCardId,
  setActiveSubSkillCardId,
  subSkillOptions,
  isSubSkillLoading,
  cachedSubSkills,
  fetchSuggestedSubSkillsForCard,
  subSkillError,
}) {
  const localSearch = subSkillSearchMap[cardId] || "";
  const isSearching = activeSubSkillCardId === cardId;

  useEffect(() => {
    if (domainId && !isCustomDomain && !cachedSubSkills[cardId]) {
      console.log("[SubSkillSearchInput] Fetching suggested sub-skills for card:", cardId, "domain:", domainId);
      fetchSuggestedSubSkillsForCard(cardId, domainId);
    }
  }, [cardId, domainId, isCustomDomain, cachedSubSkills, fetchSuggestedSubSkillsForCard]);

  const suggestedSubSkills = cachedSubSkills[cardId] || [];
  const isSubSkillsLoading = isSubSkillLoading && activeSubSkillCardId === cardId;

  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    console.log("[SubSkillSearchInput] Input changed for card:", cardId, "value:", val);
    setActiveSubSkillCardId(cardId);
    setSubSkillSearchMap((prev) => ({ ...prev, [cardId]: val }));
  }, [cardId, setActiveSubSkillCardId, setSubSkillSearchMap]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && localSearch.trim()) {
      e.preventDefault();
      if (!isCustomDomain) {
        const matched = subSkillOptions.find(
          (s) => s.name.toLowerCase() === localSearch.toLowerCase()
        );
        if (matched) {
          onAddSkill(cardId, localSearch, matched);
        } else {
          onAddSkill(cardId, localSearch);
        }
      } else {
        onAddSkill(cardId, localSearch);
      }
    } else if (e.key === "Escape") {
      setSubSkillSearchMap((prev) => ({ ...prev, [cardId]: "" }));
      setActiveSubSkillCardId(null);
    }
  }, [cardId, localSearch, isCustomDomain, subSkillOptions, onAddSkill, setSubSkillSearchMap, setActiveSubSkillCardId]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <FaSearch className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
        <input
          key={`skill-input-${cardId}`}
          type="text"
          className="w-full py-2 pr-3 text-sm transition-shadow border border-gray-300 rounded-md outline-none pl-9 focus:ring-1 focus:ring-[#9bc87c] focus:border-[#9bc87c]"
          placeholder={isCustomDomain ? "Type a skill..." : "Search skills... [Min 2 chars]"}
          value={isSearching ? localSearch : ""}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setActiveSubSkillCardId(cardId)}
          autoComplete="off"
        />
        {isSearching && localSearch.length >= 2 && (isSubSkillLoading || subSkillOptions.length > 0) && (
          <div className="absolute z-20 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-48">
            {isSubSkillLoading ? (
              <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>
            ) : subSkillOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                No skills found. Press Enter to add "{localSearch}" as custom.
              </div>
            ) : (
              subSkillOptions.map((skill) => {
                const isSelected = existingSkills?.some(
                  (s) => s.skill_id === skill.id || s.other_skill_name?.toLowerCase() === skill.name.toLowerCase()
                );
                return (
                  <button
                    key={skill.id}
                    type="button"
                    disabled={isSelected}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-[#e6f4dc] transition-colors ${
                      isSelected ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "text-gray-700"
                    }`}
                    onClick={() => onAddSkill(cardId, skill.name, skill)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{skill.name}</span>
                      {isSelected && <span className="text-xs font-medium text-green-700">Added</span>}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {isSearching && localSearch.length >= 2 && subSkillOptions.length === 0 && !isSubSkillLoading && (
        <div
          className="mt-1 text-xs text-[#5a7d3d] cursor-pointer hover:underline"
          onClick={() => onAddSkill(cardId, localSearch)}
        >
          + Add "{localSearch}" as custom skill
        </div>
      )}

      {existingSkills && existingSkills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {existingSkills.map((skill, idx) => {
            const skillName = skill.other_skill_name || skill.skill_name;
            const skillId = skill.skill_id;
            return (
              <div
                key={`${cardId}-skill-${idx}`}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-sm bg-[#e6f4dc] border-[#9bc87c] text-[#3f5a26]"
              >
                <span className="font-medium">{skillName}</span>
                <div className="flex items-center gap-1 pl-2 border-l border-[#9bc87c]">
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={skill.experience_months ?? ""}
                    onChange={(e) =>
                      onExperienceChange(cardId, skillId, skillName, e.target.value)
                    }
                    placeholder="mo"
                    className="w-12 px-1 py-0.5 text-xs border border-[#9bc87c] rounded focus:ring-1 focus:ring-[#9bc87c] outline-none"
                  />
                  <span className="text-xs text-[#5a7d3d]">mo</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    skill.other_skill_name
                      ? onRemoveSkill(cardId, skill.other_skill_name)
                      : onToggleSkill(cardId, { id: skill.skill_id, name: skill.skill_name })
                  }
                  className="text-[#5a7d3d] hover:text-red-600 p-0.5"
                >
                  <RxCross2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {!isCustomDomain && suggestedSubSkills.length > 0 && (
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Suggested Sub Skills
            </span>
            {isSubSkillsLoading && suggestedSubSkills.length === 0 && (
              <FaSpinner className="text-xs text-gray-400 animate-spin" />
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedSubSkills.map((skill) => {
              const isSelected = existingSkills?.some(
                (s) => s.skill_id === skill.id || s.other_skill_name?.toLowerCase() === skill.name.toLowerCase()
              );
              if (isSelected) return null;
              return (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => onAddSkill(cardId, skill.name, skill)}
                  className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-[#e6f4dc] hover:text-[#3f5a26] hover:border-[#9bc87c] transition-all flex items-center gap-1"
                >
                  {skill.name}
                  <FaPlus className="w-2.5 h-2.5 opacity-60" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {subSkillError && (
        <p className="text-xs text-red-500">{subSkillError}</p>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const FeedYourSkills = () => {
  const navigate = useNavigate();
  const { user, token } = useSelector((state) => state.auth);
  const { uploadImage, loading: uploadLoading } = useUploadImageApi();
  const dob = user?.dob;

  // Search states
  const [companySearch, setCompanySearch] = useState("");
  const [companyOptions, setCompanyOptions] = useState([]);
  const [isCompanyLoading, setIsCompanyLoading] = useState(false);
  const [companyError, setCompanyError] = useState(null);
  const [cachedCompanies, setCachedCompanies] = useState([]);

  const [jobRoleSearch, setJobRoleSearch] = useState("");
  const [jobRoleOptions, setJobRoleOptions] = useState([]);
  const [isJobRoleLoading, setIsJobRoleLoading] = useState(false);
  const [jobRoleError, setJobRoleError] = useState(null);
  const [cachedJobRoles, setCachedJobRoles] = useState([]);

  const [domainSearch, setDomainSearch] = useState("");
  const [domainOptions, setDomainOptions] = useState([]);
  const [isDomainLoading, setIsDomainLoading] = useState(false);
  const [domainError, setDomainError] = useState(null);
  const [cachedDomains, setCachedDomains] = useState([]);

  const [subSkillSearchMap, setSubSkillSearchMap] = useState({});
  const [subSkillOptions, setSubSkillOptions] = useState([]);
  const [isSubSkillLoading, setIsSubSkillLoading] = useState(false);
  const [subSkillError, setSubSkillError] = useState(null);
  const [activeSubSkillCardId, setActiveSubSkillCardId] = useState(null);
  const [cachedSubSkills, setCachedSubSkills] = useState({});

  const [suggestedDomainsMap, setSuggestedDomainsMap] = useState({});
  const [suggestedDomainsLoadingMap, setSuggestedDomainsLoadingMap] = useState({});
  const [fetchedJobRoleMap, setFetchedJobRoleMap] = useState({});

  // Form states
  const [authorityCards, setAuthorityCards] = useState([]);
  const [originalCards, setOriginalCards] = useState([]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const debounceTimeouts = useRef({});

  // Show toast notification
  const showToast = (message, type = "success") => {
    console.log("[Toast]", type, message);
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimeouts.current).forEach(clearTimeout);
    };
  }, []);

  // ============================================================================
  // API SEARCH FUNCTIONS
  // ============================================================================

  // Company Search API
  const debouncedCompanySearch = useDebounce(companySearch, 300);
  useEffect(() => {
    console.log("[Company Search] debounced value:", debouncedCompanySearch);
    if (debouncedCompanySearch.length < 3) {
      setCompanyOptions([]);
      setCompanyError(null);
      return;
    }
    const fetchCompanies = async () => {
      console.log("[Company Search] Fetching from API...");
      setIsCompanyLoading(true);
      setCompanyError(null);
      try {
        const res = await axios.get(`${BASE_URL}/master/companies/search`, {
          params: { search: debouncedCompanySearch.trim(), limit: 10 },
          timeout: 5000,
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("[Company Search] API response:", res.data);
        if (res.data?.success) {
          const normalized = (res.data.data || []).map((c) => ({
            value: String(c.id),
            label: c.company_name,
            id: c.id,
            name: c.company_name,
            type: "COMPANY",
          }));
          setCompanyOptions(normalized);
          console.log("[Company Search] Normalized options:", normalized.length);
          setCachedCompanies((prev) => {
            const existing = new Map(prev.map((a) => [a.value, a]));
            normalized.forEach((n) => existing.set(n.value, n));
            return Array.from(existing.values());
          });
        }
      } catch (err) {
        console.error("[Company Search] Failed:", err);
        setCompanyError("Failed to load companies. Please try again.");
        setCompanyOptions([]);
      } finally {
        setIsCompanyLoading(false);
      }
    };
    fetchCompanies();
  }, [debouncedCompanySearch, token]);

  // Job Role Search API
  const debouncedJobRoleSearch = useDebounce(jobRoleSearch, 300);
  useEffect(() => {
    console.log("[JobRole Search] debounced value:", debouncedJobRoleSearch);
    if (debouncedJobRoleSearch.length < 3) {
      setJobRoleOptions([]);
      setJobRoleError(null);
      return;
    }
    const fetchJobRoles = async () => {
      console.log("[JobRole Search] Fetching from API...");
      setIsJobRoleLoading(true);
      setJobRoleError(null);
      try {
        const res = await axios.get(`${BASE_URL}/master/job-roles/search`, {
          params: { search: debouncedJobRoleSearch.trim(), limit: 10 },
          timeout: 5000,
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("[JobRole Search] API response:", res.data);
        if (res.data?.success) {
          const normalized = (res.data.data || [])
            .filter((role) => role.id && role.title)
            .map((role) => ({
              id: typeof role.id === "string" ? parseInt(role.id, 10) : Number(role.id),
              title: role.title.trim(),
            }))
            .filter((role) => !isNaN(role.id));
          setJobRoleOptions(normalized);
          console.log("[JobRole Search] Normalized options:", normalized.length);
          setCachedJobRoles((prev) => {
            const existing = new Map(prev.map((j) => [j.id, j]));
            normalized.forEach((n) => existing.set(n.id, n));
            return Array.from(existing.values());
          });
        }
      } catch (err) {
        console.error("[JobRole Search] Failed:", err);
        setJobRoleError("Failed to load job profiles. Please try again.");
        setJobRoleOptions([]);
      } finally {
        setIsJobRoleLoading(false);
      }
    };
    fetchJobRoles();
  }, [debouncedJobRoleSearch, token]);

  // Domain Search API
  const debouncedDomainSearch = useDebounce(domainSearch, 300);
  useEffect(() => {
    console.log("[Domain Search] debounced value:", debouncedDomainSearch);
    if (debouncedDomainSearch.length < 3) {
      setDomainOptions([]);
      setDomainError(null);
      return;
    }
    const fetchDomains = async () => {
      console.log("[Domain Search] Fetching from API...");
      setIsDomainLoading(true);
      setDomainError(null);
      try {
        const res = await axios.get(`${BASE_URL}/master/domains/search`, {
          params: { search: debouncedDomainSearch.trim(), limit: 10 },
          timeout: 5000,
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("[Domain Search] API response:", res.data);
        if (res.data?.success) {
          const normalized = (res.data.data || []).map((d) => ({
            id: d.domain_id || d.id,
            name: d.domain_name || d.name,
          }));
          setDomainOptions(normalized);
          console.log("[Domain Search] Normalized options:", normalized.length);
          setCachedDomains((prev) => {
            const existing = new Map(prev.map((d) => [d.id, d]));
            normalized.forEach((n) => existing.set(n.id, n));
            return Array.from(existing.values());
          });
        }
      } catch (err) {
        console.error("[Domain Search] Failed:", err);
        setDomainError("Failed to load domains. Please try again.");
        setDomainOptions([]);
      } finally {
        setIsDomainLoading(false);
      }
    };
    fetchDomains();
  }, [debouncedDomainSearch, token]);

  // Sub-Skill Search API (scoped to domain)
  const activeSubSkillSearch = subSkillSearchMap[activeSubSkillCardId] || "";
  const debouncedSubSkillSearch = useDebounce(activeSubSkillSearch, 300);
  useEffect(() => {
    console.log("[SubSkill Search] activeCardId:", activeSubSkillCardId, "search:", debouncedSubSkillSearch);
    if (!debouncedSubSkillSearch || debouncedSubSkillSearch.length < 2 || !activeSubSkillCardId) {
      setSubSkillOptions([]);
      setSubSkillError(null);
      return;
    }
    const card = authorityCards.find((c) => {
      return c.domains?.some((d) => d._tempId === activeSubSkillCardId);
    });
    const domain = card?.domains?.find((d) => d._tempId === activeSubSkillCardId);
    const domainId = domain?.domainId;
    const isCustomDomain = domain?.isCustomDomain;
    console.log("[SubSkill Search] Found domain:", { domainId, isCustomDomain });
    if (!domainId && !isCustomDomain) {
      setSubSkillOptions([]);
      return;
    }
    const fetchSubSkills = async () => {
      console.log("[SubSkill Search] Fetching from API...");
      setIsSubSkillLoading(true);
      setSubSkillError(null);
      try {
        if (isCustomDomain) {
          console.log("[SubSkill Search] Custom domain - no predefined skills");
          setSubSkillOptions([]);
        } else {
          const res = await axios.get(`${BASE_URL}/master/domains/${domainId}/sub-skills`, {
            params: { search: debouncedSubSkillSearch, limit: 15 },
            timeout: 5000,
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log("[SubSkill Search] API response:", res.data);
          if (res.data?.success) {
            const normalized = (res.data.data || []).map((s) => ({
              id: s.skill_id,
              name: s.skill_name,
            }));
            setSubSkillOptions(normalized);
            console.log("[SubSkill Search] Normalized options:", normalized.length);
          }
        }
      } catch (err) {
        console.error("[SubSkill Search] Failed:", err);
        setSubSkillError("Failed to load skills. Please try again.");
        setSubSkillOptions([]);
      } finally {
        setIsSubSkillLoading(false);
      }
    };
    fetchSubSkills();
  }, [debouncedSubSkillSearch, activeSubSkillCardId, authorityCards, token]);

  // Fetch Suggested Domains Per Authority Card (on job role change)
  useEffect(() => {
    authorityCards.forEach((card) => {
      const jobRoleId = card.job_role_id;
      const cardId = card.id;
      if (!jobRoleId || isNaN(jobRoleId)) {
        if (suggestedDomainsMap[cardId]?.length > 0) {
          setSuggestedDomainsMap((prev) => ({ ...prev, [cardId]: [] }));
        }
        return;
      }
      const lastFetchedRoleId = fetchedJobRoleMap[cardId];
      if (lastFetchedRoleId === jobRoleId) {
        return;
      }
      console.log("[Suggested Domains] Job role changed for card:", cardId, "from:", lastFetchedRoleId, "to:", jobRoleId);
      const fetchSuggested = async () => {
        setSuggestedDomainsLoadingMap((prev) => ({ ...prev, [cardId]: true }));
        try {
          const response = await axios.get(
            `${BASE_URL}/master/job-roles/${jobRoleId}/suggested-domains`,
            {
              params: { limit: 10 },
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (response.data?.success) {
            const normalized = (response.data.data || []).map((d) => ({
              id: d.domain_id,
              name: d.domain_name,
            }));
            setSuggestedDomainsMap((prev) => ({
              ...prev,
              [cardId]: normalized,
            }));
            setFetchedJobRoleMap((prev) => ({
              ...prev,
              [cardId]: jobRoleId,
            }));
            console.log("[Suggested Domains] Fetched:", normalized.length, "domains for job role:", jobRoleId);
          }
        } catch (err) {
          console.error("[Suggested Domains] Failed:", err);
          setSuggestedDomainsMap((prev) => ({ ...prev, [cardId]: [] }));
        } finally {
          setSuggestedDomainsLoadingMap((prev) => ({ ...prev, [cardId]: false }));
        }
      };
      fetchSuggested();
    });
  }, [authorityCards, fetchedJobRoleMap, token]);

  // Fetch Suggested Sub-Skills For A Domain Card
  const fetchSuggestedSubSkillsForCard = useCallback(async (cardId, domainId) => {
    if (!domainId) {
      console.log("[Suggested SubSkills] No domainId for card:", cardId);
      return;
    }
    if (cachedSubSkills[cardId]) {
      console.log("[Suggested SubSkills] Already cached for card:", cardId);
      return;
    }
    console.log("[Suggested SubSkills] Fetching for card:", cardId, "domain:", domainId);
    try {
      const res = await axios.get(`${BASE_URL}/master/domains/${domainId}/sub-skills`, {
        params: { limit: 10 },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        const normalized = (res.data.data || []).map((s) => ({
          id: s.skill_id,
          name: s.skill_name,
        }));
        setCachedSubSkills((prev) => ({
          ...prev,
          [cardId]: normalized,
        }));
        console.log("[Suggested SubSkills] Cached:", normalized.length, "skills");
      }
    } catch (err) {
      console.error("[Suggested SubSkills] Failed:", err);
    }
  }, [cachedSubSkills, token]);

  // ============================================================================
  // INITIALIZATION FROM API DATA
  // ============================================================================

  const createEmptyCard = () => ({
    id: generateId(),
    selectedAuthorityId: null,
    selectedAuthorityType: null,
    organization_name: "",
    companyLabel: null,
    job_role_id: null,
    other_job_role: "",
    jobRoleLabel: null,
    start_date: "",
    end_date: "",
    domains: [],
  });

  // Extract and normalize API response for form display
  const extractApiDataForForm = useCallback(async (fetchedSkills) => {
    console.log("[ExtractApiData] Processing fetched skills:", fetchedSkills?.length);
    const authorityMap = {};

    fetchedSkills.forEach((item) => {
      console.log("the datata--------------------", item)

      const isOther = item.authority_id == null;
      const orgName = item.authority?.name || item.organization?.name || item.organization_name || "";
      const key = isOther
        ? `other-${orgName || ""}`
        : `id-${item.authority?.authority_id || item.authority_id}`;

      console.log("the organizatino name", orgName);

      if (!authorityMap[key]) {
        authorityMap[key] = {
          authority_id: item.authority?.authority_id || item.authority_id,
          authority_type: item.authority_type || item.authority?.type || "COMPANY",
          organization_name: orgName,
          job_role_id: item.job_role_id || null,
          job_role_name: item.job_role_name,
          other_job_role: item.other_job_role || "",
          start_date: item.start_date || "",
          end_date: item.end_date || "",
          domains: {},
        };
      }

      const domainName = item.domain?.trim() || item.domain_name?.trim() || null;
      if (domainName && !authorityMap[key].domains[domainName]) {
        authorityMap[key].domains[domainName] = {
          domainName,
          domainId: item.domain_id || null,
          other_domain_name: item.other_domain_name || "",
          isCustomDomain: item.domain_id == null,
          subSkills: [],
          certificate: Array.isArray(item.certificate_image)
            ? item.certificate_image
            : item.certificate_image
              ? [item.certificate_image]
              : [],
          certificateName: item.certificate_name || "",
        };
      }

      const skillsArray = item.subSkills || item.skills || [];
      skillsArray.forEach((skillItem) => {
        const skillName = typeof skillItem === "string" ? skillItem : skillItem.skill_name || skillItem.other_skill_name;
        const skillId = typeof skillItem === "object" ? skillItem.skill_id : null;
        const experienceMonths = typeof skillItem === "object" ? skillItem.experience_months : null;

        if (skillName?.trim() && domainName && authorityMap[key].domains[domainName]) {
          const existingSkill = authorityMap[key].domains[domainName].subSkills.find(
            (s) => (s.skill_id === skillId) || (s.other_skill_name === skillName) || (s.skill_name === skillName)
          );
          if (!existingSkill) {
            authorityMap[key].domains[domainName].subSkills.push({
              skill_id: skillId,
              skill_name: skillName,
              other_skill_name: skillId ? null : skillName,
              experience_months: experienceMonths,
            });
          }
        }
      });
    });

    console.log("-----[ExtractApiData] Authority map created:", authorityMap);

    const cards = Object.entries(authorityMap).map(([key, data]) => {
      console.log("the data to be convert ot card", data);
      let companyLabel = null;
      if (data.authority_id) {
        const stringId = String(data.authority_id);
        companyLabel = { value: stringId, label: data.organization_name || `Company ${stringId}` };
        setCachedCompanies((prev) => {
          const exists = prev.find((c) => c.value === stringId);
          if (!exists) {
            return [...prev, companyLabel];
          }
          return prev;
        });
      } else if (data.organization_name) {
        companyLabel = { value: "other", label: data.organization_name };
      }

      let jobRoleLabel = null;
      if (data.job_role_id) {
        if (data.job_role_name) {
          jobRoleLabel = { value: String(data.job_role_id), label: data.job_role_name };
        } else {
          jobRoleLabel = { value: String(data.job_role_id), label: `Role ${data.job_role_id}` };
        }
      }

      const domains = Object.entries(data.domains).map(([domainName, domainData]) => {
        const domainLabel = domainData.domainId
          ? { value: String(domainData.domainId), label: domainData.domainName }
          : null;

        return {
          id: generateId(),
          _tempId: generateId(),
          domainName: domainData.domainName,
          domainId: domainData.domainId,
          domainLabel,
          other_domain_name: domainData.other_domain_name,
          isCustomDomain: domainData.isCustomDomain,
          skills: domainData.subSkills,
          certificate: domainData.certificate,
          certificateName: domainData.certificateName,
          status: "pending",
        };
      });

      return {
        id: generateId(),
        selectedAuthorityId: data.authority_id == null ? "other" : String(data.authority_id),
        selectedAuthorityType: data.authority_type,
        organization_name: data.organization_name,
        companyLabel,
        job_role_id: data.job_role_id ? String(data.job_role_id) : null,
        other_job_role: data.other_job_role,
        jobRoleLabel,
        start_date: data.start_date,
        end_date: data.end_date,
        domains,
      };
    });

    console.log("[ExtractApiData] Cards created:", cards.length);
    return cards.length > 0 ? cards : [createEmptyCard()];
  }, []);

  // Fetch profile and pre-fill form
  useEffect(() => {
    const fetchProfile = async () => {
      console.log("[FetchProfile] Starting fetch for user:", user?.id);
      if (!user?.id || !token) {
        console.log("[FetchProfile] No user or token, creating empty card");
        setLoading(false);
        const empty = createEmptyCard();
        setAuthorityCards([empty]);
        setOriginalCards([empty]);
        return;
      }
      try {
        setLoading(true);
        const result = await userDetailsApi.getUserDetails(user.id);
        console.log("[FetchProfile] API result:", result);
        if (result.success) {
          const skillsData = result.data?.skills || result.data?.domains || [];
          console.log("[FetchProfile] Skills data:", skillsData);
          const cards = await extractApiDataForForm(skillsData);
          setAuthorityCards(cards);
          setOriginalCards(JSON.parse(JSON.stringify(cards)));
        } else {
          const empty = createEmptyCard();
          setAuthorityCards([empty]);
          setOriginalCards([empty]);
        }
      } catch (err) {
        console.error("[FetchProfile] Failed:", err);
        const empty = createEmptyCard();
        setAuthorityCards([empty]);
        setOriginalCards([empty]);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user?.id, token, extractApiDataForForm]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleCompanyChange = useCallback((cardId, opt) => {
    console.log("[HandleCompanyChange] cardId:", cardId, "opt:", opt);
    if (!opt) {
      setAuthorityCards((prev) =>
        prev.map((c) =>
          c.id === cardId
            ? { ...c, selectedAuthorityId: null, selectedAuthorityType: null, organization_name: "", companyLabel: null, job_role_id: null, other_job_role: "", jobRoleLabel: null }
            : c
        )
      );
    } else if (opt.__isNew__) {
      setAuthorityCards((prev) =>
        prev.map((c) =>
          c.id === cardId
            ? {
              ...c,
              selectedAuthorityId: "other",
              selectedAuthorityType: "COMPANY",
              organization_name: opt.label,
              companyLabel: { value: opt.label, label: opt.label },
              job_role_id: null,
              other_job_role: "",
              jobRoleLabel: null,
            }
            : c
        )
      );
    } else {
      setAuthorityCards((prev) =>
        prev.map((c) =>
          c.id === cardId
            ? {
              ...c,
              selectedAuthorityId: opt.value,
              selectedAuthorityType: opt.type || "COMPANY",
              organization_name: "",
              companyLabel: { value: opt.value, label: opt.label },
              job_role_id: null,
              other_job_role: "",
              jobRoleLabel: null,
            }
            : c
        )
      );
    }
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (newErrors[cardId]?.selectedAuthorityId) {
        delete newErrors[cardId].selectedAuthorityId;
        if (Object.keys(newErrors[cardId] || {}).length === 0) delete newErrors[cardId];
      }
      return newErrors;
    });
  }, []);

  const handleJobRoleChange = useCallback((cardId, opt) => {
    console.log("[HandleJobRoleChange] cardId:", cardId, "opt:", opt);
    if (!opt) {
      setAuthorityCards((prev) =>
        prev.map((c) =>
          c.id === cardId ? { ...c, job_role_id: null, other_job_role: "", jobRoleLabel: null } : c
        )
      );
    } else if (opt.__isNew__) {
      setAuthorityCards((prev) =>
        prev.map((c) =>
          c.id === cardId
            ? {
              ...c,
              job_role_id: null,
              other_job_role: opt.label,
              jobRoleLabel: { value: opt.label, label: opt.label },
            }
            : c
        )
      );
    } else {
      setAuthorityCards((prev) =>
        prev.map((c) =>
          c.id === cardId
            ? {
              ...c,
              job_role_id: String(opt.id),
              other_job_role: "",
              jobRoleLabel: { value: String(opt.id), label: opt.title },
            }
            : c
        )
      );
    }
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (newErrors[cardId]?.job_role_id) {
        delete newErrors[cardId].job_role_id;
        if (Object.keys(newErrors[cardId] || {}).length === 0) delete newErrors[cardId];
      }
      return newErrors;
    });
  }, []);

  const handleAddDomainToAuthority = useCallback((cardId, domainData, start_date, end_date, job_role_id, other_job_role, organization_name = "") => {
    console.log("[HandleAddDomain] cardId:", cardId, "domainData:", domainData);
    const isNew = domainData.__isNew__;
    const isCustomDomain = isNew || domainData.id == null;
    const newDomainId = isCustomDomain ? null : typeof domainData.id === "string" ? parseInt(domainData.id, 10) : domainData.id;
    const newOtherDomainName = isCustomDomain ? domainData.name : "";
    const domainName = isCustomDomain ? newOtherDomainName : domainData.name;

    setAuthorityCards((prev) =>
      prev.map((card) => {
        if (card.id !== cardId) return card;
        const exists = card.domains.some(
          (d) => d.domainId === newDomainId || d.domainName?.toLowerCase() === domainName?.toLowerCase()
        );
        if (exists) {
          console.warn("[HandleAddDomain] Domain already exists");
          return card;
        }
        return {
          ...card,
          domains: [
            ...card.domains,
            {
              id: generateId(),
              _tempId: generateId(),
              domainName: domainName,
              domainId: newDomainId,
              domainLabel: isNew ? null : { value: String(newDomainId), label: domainName },
              other_domain_name: newOtherDomainName,
              isCustomDomain,
              skills: [],
              certificate: [],
              certificateName: "",
              status: "pending",
            },
          ],
        };
      })
    );

    if (!isCustomDomain && newDomainId) {
      const newTempId = Date.now() + Math.random();
      fetchSuggestedSubSkillsForCard(newTempId, newDomainId);
    }
  }, [fetchSuggestedSubSkillsForCard]);

  const handleRemoveDomain = useCallback((cardId, domainTempId) => {
    console.log("[HandleRemoveDomain] cardId:", cardId, "domainTempId:", domainTempId);
    setAuthorityCards((prev) =>
      prev.map((c) =>
        c.id === cardId ? { ...c, domains: c.domains.filter((d) => d._tempId !== domainTempId) } : c
      )
    );
  }, []);

  const handleAddCustomSubSkill = useCallback((tempId, rawSkillName, skillObj = null) => {
    const skillName = rawSkillName.trim();
    console.log("[HandleAddCustomSubSkill] tempId:", tempId, "skillName:", skillName, "skillObj:", skillObj);
    if (!skillName) return;

    setAuthorityCards((prev) =>
      prev.map((card) => {
        const domain = card.domains?.find((d) => d._tempId === tempId);
        if (!domain) return card;
        const isDuplicate = domain.skills.some((s) => {
          if (skillObj?.id && s.skill_id === skillObj.id) return true;
          if (
            skillName &&
            (s.other_skill_name?.toLowerCase() === skillName.toLowerCase() ||
              s.skill_name?.toLowerCase() === skillName.toLowerCase())
          )
            return true;
          return false;
        });
        if (isDuplicate) {
          console.warn("[HandleAddCustomSubSkill] Skill already added");
          return card;
        }
        const newSkill = skillObj
          ? {
            skill_id: skillObj.id,
            skill_name: skillObj.name,
            experience_months: null,
          }
          : {
            other_skill_name: skillName,
            experience_months: null,
          };
        const totalMonths = calculateTotalMonths(card.start_date, card.end_date);
        const currentCount = domain.skills.length + 1;
        const defaultMonths = totalMonths > 0 ? Math.max(1, Math.floor(totalMonths / currentCount)) : null;
        newSkill.experience_months = defaultMonths;
        return {
          ...card,
          domains: card.domains.map((d) =>
            d._tempId === tempId ? { ...d, skills: [...d.skills, newSkill] } : d
          ),
        };
      })
    );
    setSubSkillSearchMap((prev) => ({ ...prev, [tempId]: "" }));
    setSubSkillOptions([]);
    setActiveSubSkillCardId(null);
  }, []);

  const handleRemoveCustomSubSkill = useCallback((tempId, skillName) => {
    console.log("[HandleRemoveCustomSubSkill] tempId:", tempId, "skillName:", skillName);
    setAuthorityCards((prev) =>
      prev.map((card) => {
        const domain = card.domains?.find((d) => d._tempId === tempId);
        if (!domain) return card;
        return {
          ...card,
          domains: card.domains.map((d) =>
            d._tempId === tempId
              ? {
                ...d,
                skills: d.skills.filter(
                  (s) => s.other_skill_name !== skillName && s.skill_name !== skillName
                ),
              }
              : d
          ),
        };
      })
    );
  }, []);

  const handleToggleSubSkill = useCallback((tempId, skill) => {
    console.log("[HandleToggleSubSkill] tempId:", tempId, "skill:", skill);
    setAuthorityCards((prev) =>
      prev.map((card) => {
        const domain = card.domains?.find((d) => d._tempId === tempId);
        if (!domain) return card;
        const isAlreadySelected = domain.skills.some((s) => s.skill_id === skill.id);
        if (isAlreadySelected) {
          return {
            ...card,
            domains: card.domains.map((d) =>
              d._tempId === tempId
                ? { ...d, skills: d.skills.filter((s) => s.skill_id !== skill.id) }
                : d
            ),
          };
        } else {
          const totalMonths = calculateTotalMonths(card.start_date, card.end_date);
          const currentCount = domain.skills.length + 1;
          const defaultMonths = totalMonths > 0 ? Math.max(1, Math.floor(totalMonths / currentCount)) : null;
          return {
            ...card,
            domains: card.domains.map((d) =>
              d._tempId === tempId
                ? {
                  ...d,
                  skills: [
                    ...d.skills,
                    {
                      skill_id: skill.id,
                      skill_name: skill.name,
                      experience_months: defaultMonths,
                    },
                  ],
                }
                : d
            ),
          };
        }
      })
    );
  }, []);

  const handleExperienceChange = useCallback((tempId, skillId, skillName, value) => {
    const numValue = value === "" ? null : Number(value);
    if (isNaN(numValue) && value !== "") return;
    console.log("[HandleExperienceChange] tempId:", tempId, "skillId:", skillId, "value:", numValue);
    setAuthorityCards((prev) =>
      prev.map((card) => {
        const domain = card.domains?.find((d) => d._tempId === tempId);
        if (!domain) return card;
        return {
          ...card,
          domains: card.domains.map((d) =>
            d._tempId === tempId
              ? {
                ...d,
                skills: d.skills.map((s) => {
                  const match =
                    (skillId && s.skill_id === skillId) ||
                    (skillName &&
                      (s.other_skill_name === skillName || s.skill_name === skillName));
                  if (match) {
                    return { ...s, experience_months: numValue };
                  }
                  return s;
                }),
              }
              : d
          ),
        };
      })
    );
  }, []);

  const handleCertificateUpload = async (tempId, file) => {
    console.log("[HandleCertificateUpload] tempId:", tempId, "file:", file?.name);
    if (!file) {
      setAuthorityCards((prev) =>
        prev.map((card) => ({
          ...card,
          domains: card.domains.map((d) =>
            d._tempId === tempId ? { ...d, certificate: [], certificateName: "" } : d
          ),
        }))
      );
      return;
    }
    try {
      const url = await uploadImage(file, "certificate", token);
      if (url) {
        setAuthorityCards((prev) =>
          prev.map((card) => ({
            ...card,
            domains: card.domains.map((d) =>
              d._tempId === tempId ? { ...d, certificate: [url], certificateName: file.name } : d
            ),
          }))
        );
        console.log("[HandleCertificateUpload] Success:", url);
      }
    } catch (err) {
      console.error("[HandleCertificateUpload] Failed:", err);
    }
  };

  const handleRemoveCertificate = useCallback((tempId) => {
    console.log("[HandleRemoveCertificate] tempId:", tempId);
    setAuthorityCards((prev) =>
      prev.map((card) => ({
        ...card,
        domains: card.domains.map((d) =>
          d._tempId === tempId ? { ...d, certificate: [], certificateName: "" } : d
        ),
      }))
    );
  }, []);

  const handleAddCard = useCallback(() => {
    console.log("[HandleAddCard] Creating new card");
    setAuthorityCards((prev) => [...prev, createEmptyCard()]);
  }, []);

  const handleRemoveCard = useCallback((cardId) => {
    if (window.confirm("Are you sure you want to remove this experience entry?")) {
      console.log("[HandleRemoveCard] cardId:", cardId);
      setAuthorityCards((prev) => prev.filter((c) => c.id !== cardId));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[cardId];
        return newErrors;
      });
    }
  }, []);

  // Validate entries
  const validateEntries = useCallback(() => {
    console.log("[ValidateEntries] Validating...");
    const newErrors = {};
    let isValid = true;
    authorityCards.forEach((card) => {
      const cardErrors = {};
      const isOther = card.selectedAuthorityId === "other";
      const authId = isOther ? null : parseInt(card.selectedAuthorityId, 10);
      if (!authId && !card.organization_name?.trim()) {
        cardErrors.selectedAuthorityId = "Please select an organization or enter a name";
        isValid = false;
      }
      card.domains.forEach((domain) => {
        const domainErrors = {};
        if (!domain.domainId && !domain.other_domain_name?.trim()) {
          domainErrors.domain_id = "Please select or enter a domain";
          isValid = false;
        }
        if (domain.skills.length === 0) {
          domainErrors.skills = "Please select or add at least one skill";
          isValid = false;
        }
        if (Object.keys(domainErrors).length > 0) {
          cardErrors.domains = { ...cardErrors.domains, [domain._tempId]: domainErrors };
        }
      });
      if (Object.keys(cardErrors).length > 0) {
        newErrors[card.id] = cardErrors;
      }
    });
    console.log("[ValidateEntries] Errors:", newErrors, "Valid:", isValid);
    setErrors(newErrors);
    return isValid;
  }, [authorityCards]);

  // Save changes
  const handleSaveChanges = async () => {
    console.log("[HandleSaveChanges] Starting save...");
    if (!validateEntries()) {
      showToast("Please fix validation errors before saving.", "error");
      return;
    }
    if (!user?.id || !token) {
      showToast("Not authenticated", "error");
      return;
    }
    setSaving(true);
    const previousCards = JSON.parse(JSON.stringify(authorityCards));
    try {
      const domainsToValidate = [];
      authorityCards.forEach((card) => {
        const isOther = card.selectedAuthorityId === "other";
        const authId = isOther ? null : parseInt(card.selectedAuthorityId, 10);
        card.domains.forEach((domain) => {
          if (domain.skills.length > 0) {
            domainsToValidate.push({
              authority_id: authId,
              authority_type: card.selectedAuthorityType || (isOther ? "COMPANY" : "UNIVERSITY"),
              ...(isOther && { organization_name: card.organization_name }),
              job_role_id: card.job_role_id ? parseInt(card.job_role_id, 10) : null,
              other_job_role: card.other_job_role || undefined,
              domain_id: domain.domainId,
              other_domain_name: domain.other_domain_name || undefined,
              skills: domain.skills.map((s) => ({
                skill_id: s.skill_id != null ? s.skill_id : undefined,
                skill_name: s.skill_name,
                other_skill_name: s.other_skill_name,
                experience_months: s.experience_months,
              })),
              certificate: domain.certificate || [],
              start_date: card.start_date,
              end_date: card.end_date || null,
            });
          }
        });
      });
      console.log("[HandleSaveChanges] Payload domains:", domainsToValidate);
      domainsSchema.parse({ domains: domainsToValidate });
      setOriginalCards(JSON.parse(JSON.stringify(authorityCards)));
      const payload = { domains: domainsToValidate };
      const result = await userDetailsApi.updateUserDetails(user.id, payload, token);
      console.log("[HandleSaveChanges] API result:", result);
      if (result.success || result.message?.includes("successfully")) {
        showToast("Skills updated successfully!", "success");
        setTimeout(() => navigate("/feed-view"), 1500);
      } else {
        setAuthorityCards(previousCards);
        throw new Error(result.message || "Update failed");
      }
    } catch (err) {
      console.error("[HandleSaveChanges] Save error:", err);
      showToast("Failed to save. Please try again.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleGoBack = () => {
    console.log("[HandleGoBack] Navigating back");
    navigate("/feed-view");
  };

  // Get select value helper
  const getSelectValue = (options, cachedValue, currentValue, displayLabel) => {
    if (currentValue && displayLabel) return displayLabel;
    if (currentValue) {
      const found = options.find((opt) => opt.value === currentValue || opt.id === currentValue);
      if (found) return found;
      if (cachedValue) return cachedValue;
    }
    return null;
  };

  // Combined authority options
  const combinedAuthorityOptions = useMemo(() => {
    const allOptions = [...cachedCompanies, ...companyOptions];
    const seen = new Map();
    allOptions.forEach((opt) => {
      if (!seen.has(opt.value)) {
        seen.set(opt.value, opt);
      }
    });
    return Array.from(seen.values());
  }, [cachedCompanies, companyOptions]);

  // Combined job role options
  const combinedJobRoleOptions = useMemo(() => {
    const allOptions = [...cachedJobRoles, ...jobRoleOptions].map((jr) => ({
      id: jr.id,
      title: jr.title,
      value: jr.id,
      label: jr.title,
    }));
    return allOptions;
  }, [cachedJobRoles, jobRoleOptions]);

  // Combined domain options
  const combinedDomainOptions = useMemo(() => {
    const allOptions = [...cachedDomains, ...domainOptions].map((d) => ({
      id: d.id,
      name: d.name,
      value: String(d.id),
      label: d.name,
    }));
    return allOptions;
  }, [cachedDomains, domainOptions]);

  // Loading State
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-b-2 border-[#9bc87c] rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading your skills...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex justify-center min-h-screen px-2 bg-gray-100 lg:px-8">
        <div className="flex-grow hidden lg:block"></div>
        <section className="w-full max-w-[95vw] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] h-auto p-3 sm:p-4 md:p-5 lg:p-6 rounded-[5px] bg-white flex flex-col shadow-lg gap-3 sm:gap-4 mt-2 mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-3 mb-4 sm:mb-6">
              <button onClick={handleGoBack} className="p-2 transition-colors rounded-full hover:bg-gray-100">
                <IoIosArrowBack className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-800 sm:text-2xl lg:text-3xl">Manage Your Experience/Skills</h1>
            </div>
          </div>

          {/* Toast Notification */}
          {toast && (
            <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in ${
              toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
            }`}>
              {toast.type === "success" ? <FaCheckCircle /> : <FaExclamationCircle />}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
          )}

          {/* Authority Cards */}
          <div className="space-y-5">
            {authorityCards.map((card) => {
              const {
                id: cardId,
                selectedAuthorityId,
                selectedAuthorityType,
                organization_name,
                job_role_id,
                other_job_role,
                start_date,
                end_date,
                companyLabel,
                jobRoleLabel,
              } = card;
              const dateError = isValidDateRange(start_date, end_date, dob);
              const isOtherSelected = selectedAuthorityId === "other";
              const authorityDomains = card.domains || [];

              console.log("[Authority Card] Rendering card:", cardId, "domains:", authorityDomains.length);

              return (
                <div
                  key={cardId}
                  className="p-5 bg-white border shadow-sm border-slate-200 rounded-xl"
                >
                  {/* Authority Selection */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <label className={labelClass}>Company Name</label>
                      <CreatableSelect
                        value={(() => {
                          if (selectedAuthorityId === "other" && organization_name) {
                            return { value: "other", label: organization_name };
                          }
                          if (card.companyLabel) {
                            return card.companyLabel;
                          }
                          if (selectedAuthorityId) {
                            return combinedAuthorityOptions.find(
                              (opt) => opt.value === String(selectedAuthorityId)
                            ) || null;
                          }
                          return null;
                        })()}
                        onChange={(opt) => handleCompanyChange(cardId, opt)}
                        options={combinedAuthorityOptions}
                        inputValue={companySearch}
                        onInputChange={(val) => {
                          setCompanySearch(val);
                          if (val.length < 3) setCompanyOptions([]);
                        }}
                        placeholder="Search or type company [Min 3 chars]"
                        isClearable
                        styles={{ ...selectStyles, control: (base, state) => ({ ...selectStyles.control(base, state), borderColor: errors[cardId]?.selectedAuthorityId ? EDU_ERROR : (state.isFocused ? EDU_GREEN : "#cbd5e1") }) }}
                        components={{ IndicatorSeparator: () => null }}
                        isLoading={isCompanyLoading}
                      />
                      <p className="mt-1 text-xs text-slate-500">
                        If not listed above, enter the full official name without abbreviations.
                      </p>
                      {errors[cardId]?.selectedAuthorityId && (
                        <p className="mt-1 text-xs text-red-500">{errors[cardId].selectedAuthorityId}</p>
                      )}
                      {companyError && (
                        <p className="mt-1 text-xs text-red-500">{companyError}</p>
                      )}
                    </div>
                    {selectedAuthorityId && authorityCards.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveCard(cardId)}
                        className="flex items-center justify-center flex-shrink-0 ml-3 text-red-500 transition rounded-lg hover:text-red-700 hover:bg-red-50"
                        aria-label="Remove authority"
                      >
                        <FaTrash size={14} />
                      </button>
                    )}
                  </div>

                  {/* Date Inputs */}
                  {selectedAuthorityId && (
                    <>
                      <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2">
                        <div>
                          <label className={labelClass}>From</label>
                          <input
                            type="month"
                            value={start_date}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAuthorityCards((prev) =>
                                prev.map((c) =>
                                  c.id === cardId ? { ...c, start_date: val } : c
                                )
                              );
                            }}
                            className={inputClass}
                            placeholder="Month/Year"
                          />
                          <p className="mt-1 text-xs text-slate-500">e.g., June 2023</p>
                        </div>
                        <div>
                          <label className={labelClass}>To</label>
                          <input
                            type="month"
                            value={end_date || ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              setAuthorityCards((prev) =>
                                prev.map((c) =>
                                  c.id === cardId ? { ...c, end_date: val || null } : c
                                )
                              );
                            }}
                            className={inputClass}
                            placeholder="Month/Year"
                          />
                          <p className="mt-1 text-xs text-slate-500">
                            e.g., Jan 2024 or leave blank for "Present"
                          </p>
                        </div>
                        {dateError !== true && (
                          <p className="col-span-2 mt-1 text-xs text-red-500">
                            {dateError}
                          </p>
                        )}
                      </div>

                      {/* Job Role Dropdown */}
                      <div className="mb-4">
                        <label className={labelClass}>Job Roles</label>
                        <CreatableSelect
                          value={
                            job_role_id != null
                              ? combinedJobRoleOptions.find(
                                (opt) => String(opt.id) === String(job_role_id)
                              ) || jobRoleLabel
                              : other_job_role
                                ? {
                                  value: other_job_role,
                                  label: other_job_role,
                                  __isNew__: true,
                                }
                                : null
                          }
                          onChange={(opt) => handleJobRoleChange(cardId, opt)}
                          options={combinedJobRoleOptions}
                          inputValue={jobRoleSearch}
                          onInputChange={(val) => {
                            setJobRoleSearch(val);
                            if (val.length < 3) setJobRoleOptions([]);
                          }}
                          placeholder="Search or type your role... [Min 3 chars]"
                          isClearable
                          styles={{ ...selectStyles, control: (base, state) => ({ ...selectStyles.control(base, state), borderColor: errors[cardId]?.job_role_id ? EDU_ERROR : (state.isFocused ? EDU_GREEN : "#cbd5e1") }) }}
                          components={{ IndicatorSeparator: () => null }}
                          isLoading={isJobRoleLoading}
                        />
                        {errors[cardId]?.job_role_id && (
                          <p className="mt-1 text-xs text-red-500">{errors[cardId].job_role_id}</p>
                        )}
                        {jobRoleError && (
                          <p className="mt-1 text-xs text-red-500">{jobRoleError}</p>
                        )}
                      </div>

                      {/* Domain Cards */}
                      <div className="mt-4 space-y-4">
                        {authorityDomains.map((domain) => {
                          const isCustomDomain = domain.isCustomDomain;
                          const domainName = domain.domainName || (isCustomDomain
                            ? domain.other_domain_name
                            : domain.domainId
                              ? cachedDomains.find(d => d.id === domain.domainId)?.name || `Domain ${domain.domainId}`
                              : "Unknown Domain");
                          const skills = domain.skills || [];

                          console.log("[Domain Card] Rendering:", domainName, "skills:", skills.length);

                          return (
                            <div key={domain._tempId} className="p-4 border rounded-lg bg-slate-50 border-slate-200">
                              {/* Domain Header */}
                              <div className="flex items-start justify-between">
                                <span className="bg-[#e6f4dc] text-[#3f5a26] border border-[#9bc87c] px-2.5 py-1 rounded-full text-xs font-medium">
                                  {domainName}
                                </span>
                                <button type="button" onClick={() => handleRemoveDomain(cardId, domain._tempId)} className="text-slate-400 hover:text-red-500">
                                  <RxCross2 size={12} />
                                </button>
                              </div>

                              {/* Certificate Upload */}
                              <div className="mt-3">
                                <input id={`cert-${domain._tempId}`} type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleCertificateUpload(domain._tempId, e.target.files[0])} />
                                <label htmlFor={`cert-${domain._tempId}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 border text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-[#e6f4dc] hover:border-[#9bc87c] cursor-pointer transition-colors">
                                  <FaFileAlt size={12} />
                                  {domain.certificateName ? "Change Certificate" : "Upload Certificate"}
                                </label>
                              </div>
                              {domain.certificateName && (
                                <div className="flex items-center justify-between p-2 mt-2 text-xs bg-white border rounded">
                                  <span className="max-w-[120px] text-[#3f5a26] truncate">{domain.certificateName || "Uploaded file"}</span>
                                  <button type="button" onClick={() => handleRemoveCertificate(domain._tempId)} className="text-red-500 hover:text-red-700">Remove</button>
                                </div>
                              )}

                              {/* Sub-skill Search & Suggestions */}
                              <div className="mt-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Add Sub Skills</label>
                                <SubSkillSearchInput
                                  cardId={domain._tempId}
                                  domainId={domain.domainId}
                                  isCustomDomain={isCustomDomain}
                                  existingSkills={skills}
                                  onAddSkill={handleAddCustomSubSkill}
                                  onRemoveSkill={handleRemoveCustomSubSkill}
                                  onToggleSkill={handleToggleSubSkill}
                                  onExperienceChange={handleExperienceChange}
                                  subSkillSearchMap={subSkillSearchMap}
                                  setSubSkillSearchMap={setSubSkillSearchMap}
                                  activeSubSkillCardId={activeSubSkillCardId}
                                  setActiveSubSkillCardId={setActiveSubSkillCardId}
                                  subSkillOptions={subSkillOptions}
                                  isSubSkillLoading={isSubSkillLoading}
                                  cachedSubSkills={cachedSubSkills}
                                  fetchSuggestedSubSkillsForCard={fetchSuggestedSubSkillsForCard}
                                  subSkillError={subSkillError}
                                />
                              </div>
                              {skills.length === 0 && <p className="mt-2 text-xs text-red-500">Please add at least one sub skill.</p>}
                            </div>
                          );
                        })}
                      </div>

                      {/* Add Domain Button */}
                      <div className="mt-4 text-left">
                        <CreatableSelect
                          options={combinedDomainOptions}
                          isLoading={isDomainLoading}
                          onInputChange={(val) => {
                            setDomainSearch(val);
                            if (val.length < 3) setDomainOptions([]);
                          }}
                          onChange={(opt) => {
                            if (opt) {
                              handleAddDomainToAuthority(
                                cardId,
                                { id: opt.id, name: opt.label, __isNew__: opt.__isNew__ },
                                start_date,
                                end_date,
                                job_role_id,
                                other_job_role,
                                organization_name
                              );
                            }
                          }}
                          placeholder="Search or add a skill..."
                          isClearable
                          styles={selectStyles}
                          components={{ IndicatorSeparator: () => null }}
                          value={null}
                        />
                        {domainError && (
                          <p className="mt-1 text-xs text-red-500">{domainError}</p>
                        )}
                      </div>

                      {/* Suggested Domains Chips (based on Job Role) */}
                      {job_role_id && (suggestedDomainsLoadingMap[cardId] || (suggestedDomainsMap[cardId] && suggestedDomainsMap[cardId].length > 0)) && (
                        <div className="p-3 mt-3 mb-4 border border-gray-200 rounded-md bg-gray-50">
                          <div className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                            {suggestedDomainsLoadingMap[cardId] ? "Loading suggestions..." : "Suggested Skills"}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(suggestedDomainsMap[cardId] || []).map((domain) => {
                              const isAlreadyAdded = authorityDomains.some(
                                (d) => d.domainId === domain.id
                              );
                              if (isAlreadyAdded) return null;
                              return (
                                <button
                                  key={`${cardId}-suggested-domain-${domain.id}`}
                                  type="button"
                                  onClick={() => {
                                    console.log("[Suggested Domain] Clicked:", domain);
                                    handleAddDomainToAuthority(
                                      cardId,
                                      { id: domain.id, name: domain.name },
                                      start_date,
                                      end_date,
                                      job_role_id,
                                      other_job_role,
                                      organization_name
                                    );
                                  }}
                                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#3f5a26] bg-white border border-[#9bc87c] rounded-full hover:bg-[#e6f4dc] hover:border-[#88b86a] transition-colors shadow-sm"
                                >
                                  <span>{domain.name}</span>
                                  <FaPlus className="w-3 h-3" />
                                </button>
                              );
                            })}
                            {(suggestedDomainsMap[cardId] || []).length === 0 && !suggestedDomainsLoadingMap[cardId] && (
                              <span className="text-sm italic text-gray-400">
                                No specific suggestions for this role. Search below.
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {!selectedAuthorityId && (
                    <div className="py-4 text-sm text-center rounded-lg text-slate-500 bg-slate-50">
                      <FaBuilding className="mx-auto mb-2 text-slate-400" size={20} />
                      Select a company to add experience, dates, and skills.
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add New Authority Button */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleAddCard}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-[#3f5a26] font-medium rounded-lg hover:bg-[#e6f4dc] border border-[#9bc87c] transition"
            >
              <FaPlus size={14} />
              Add a Company
            </button>
          </div>

          {/* Save Button */}
          <div className="flex justify-center mt-6 sm:mt-8">
            <Button
              onClick={handleSaveChanges}
              disabled={saving}
              className={`w-full sm:w-auto px-8 py-3 rounded-lg text-white font-semibold text-sm transition-colors duration-200 ${
                saving ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {saving ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </section>
        <div className="flex-grow hidden lg:block"></div>
      </div>

      {/* CSS for toast animation */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
        input[type="month"] {
          accent-color: #9bc87c;
        }
      `}</style>
    </MainLayout>
  );
};

export default FeedYourSkills;