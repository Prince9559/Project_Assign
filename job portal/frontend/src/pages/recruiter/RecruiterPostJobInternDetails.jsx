
// import React, {
//   useState,
//   useEffect,
//   useRef,
//   useCallback,
//   useMemo,
// } from "react";
// import {
//   useForm,
//   FormProvider,
//   useFormContext,
//   Controller,
// } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useNavigate, useLocation } from "react-router-dom";
// import { FaTimes, FaInfoCircle } from "react-icons/fa";
// import { useAIGeneration } from "../../hooks/useAIGeneration";
// import { jobPostApi } from "../../api/jobPostApi";
// import axios from "axios";
// import { showErrorAlert } from "../../utils/alertService";
// import Swal from 'sweetalert2';
// import DomainSkillsSelector, { extractSkillArrays } from "./DomainSkillsSelector";
// import CreatableSelect from "react-select/creatable";
// import GreenAsyncCreatableMultiSelect from "../../components/jobs/GreenAsyncCreatableMultiSelect";

// import {
//   Input,
//   Button,
//   Textarea,
//   Select,
//   SuccessMessage,
//   ErrorMessage,
//   Label,
// } from "../../components/ui";
// import MainLayout from "../../components/layout/MainLayout";
// import JobPostingHeaderBanner from "../../components/JobPostingHeaderBanner";
// import { useSelector } from "react-redux";
// import { getPricingRules } from "../../api/recruiterPaymentApi";
// import { useSearchParams } from "react-router-dom";

// const BASE_URL = import.meta.env.VITE_BASE_URL

// // Education Levels (static enum-like)
// const EDUCATION_LEVELS = [
//   { id: "10th", name: "10th / Matriculation" },
//   { id: "12th", name: "12th / Higher Secondary" },
//   { id: "diploma", name: "Diploma" },
//   { id: "bachelors", name: "Bachelor's Degree" },
//   { id: "masters", name: "Master's Degree" },
//   { id: "phd", name: "PhD / Doctorate" },
// ];

// // Experience Types
// const EXPERIENCE_TYPES = [
//   { id: "full_time", name: "Full-time Job" },
//   { id: "internship", name: "Internship" },
//   { id: "freelance", name: "Freelance / Contract" },
//   { id: "research", name: "Research / Academic" },
//   { id: "volunteer", name: "Volunteering" },
// ];

// // ==================== ZOD VALIDATION SCHEMAS ====================
// const jobPostSchema = z
//   .object({
//     opportunity_type: z.enum(["Internship", "Job", "Project"]),
//     // === Job Role ===
//     job_role_id: z.union([z.number().positive(), z.null()]).optional(),
//     other_job_role: z.string().optional(),
//     // === Skills ===
//     skill_ids: z.array(z.number()).optional(),
//     other_skills: z
//       .array(
//         z.object({
//           domain: z.string().min(1, "Domain name is required"),
//           skill: z.string().min(1, "Skill name is required"),
//         })
//       )
//       .optional(),
//     // === Locations ===
//     eligiblecity_ids: z.array(z.number()).optional(),
//     other_eligible_city_names: z.array(z.string()).optional(),
//     // === Colleges & Courses ===
//     eligiblecollege_ids: z.array(z.number()).optional(),
//     other_eligible_college_names: z.array(z.string()).optional(),
//     eligiblecourse_ids: z.array(z.number()).optional(),
//     other_eligible_course_names: z.array(z.string()).optional(),
//     // === Duration (Internship only) ===
//     duration_id: z.union([z.number().positive(), z.null()]).optional(),
//     other_duration: z.string().optional(),
//     // === Rest of fields ===
//     job_type: z.enum(["In office", "Hybrid", "Remote"]),
//     job_time: z.enum(["Day Shift", "Night Shift", "Part-time"]),
//     number_of_openings: z.coerce
//       .number({ invalid_type_error: "Please enter a valid number" })
//       .positive("Number of openings must be at least 1"),
//     job_description: z
//       .string()
//       .min(10, "Description is required (minimum 10 characters)"),
//     candidate_preferences: z.string().optional(),
//     women_preferred: z.boolean().optional(),
//     stipend_type: z.enum(["Paid", "Unpaid", "Fixed", "Variable"]).optional(),
//     incentive_per_year: z.string().optional(),
//     perks: z.array(z.string()).optional(),
//     screening_questions: z.array(
//       z.string().trim().min(1, "Question cannot be empty").max(200, "Max 200 characters per question")
//     ).max(5, "You can add up to 5 screening questions").optional().default([]),
//     phone_contact: z
//       .string()
//       .regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number"),
//     alternate_phone_number: z
//       .string()
//       .optional()
//       .nullable()
//       .refine(
//         (val) => val === "" || val === null || val === undefined || /^\d{10}$/.test(val),
//         "Please enter a valid 10-digit mobile number"
//       ),
//     job_status: z.boolean().default(true),
//     stipend_min: z.coerce.number().nullable().optional(),
//     stipend_max: z.coerce.number().nullable().optional(),
//     days_in_office: z.coerce.number().nullable().optional(),
//     minSkillMatchRequired: z.coerce
//       .number({ invalid_type_error: "Please enter a whole number (0–100)" })
//       .int()
//       .min(0, "Minimum must be ≥ 0")
//       .max(100, "Maximum must be ≤ 100")
//       .nullable()
//       .refine(val => val !== null && val !== undefined, {
//         message: "Skill match percentage is required",
//       }),
//     // === Education & Experience ===
//     eligible_education_levels: z.array(z.string()).optional(),
//     eligible_specialization_ids: z.array(z.number()).optional(),
//     other_eligible_specializations: z.array(z.string()).optional(),
//     include_pursuing_students: z.boolean().optional().default(false),
//     // Experience
//     experience_required: z.boolean().optional().default(false),
//     experience_min: z.coerce.number().min(0).nullable().optional(),
//     experience_max: z.coerce.number().min(0).nullable().optional(),
//     experience_types: z.array(z.string()).optional(),
//     // Internship-specific dates
//     internship_start_date: z.string().optional(),
//     internship_from_date: z.string().optional(),
//     internship_to_date: z.string().optional(),
//     is_custom_internship_date: z.boolean().optional(),
//     // Project Specific dates
//     project_start_date: z.string().optional(),
//     project_end_date: z.string().optional(),
//   })
//   .superRefine((data, ctx) => {
//     // ========== JOB ROLE ==========
//     if (data.job_role_id === null && !data.other_job_role?.trim()) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "Please specify the job role",
//         path: ["other_job_role"],
//       });
//     }
//     if (
//       data.job_role_id != null &&
//       (!data.job_role_id || data.job_role_id <= 0)
//     ) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "Please select a job role",
//         path: ["job_role_id"],
//       });
//     }

//     // ========== LOCATIONS ==========
//     const hasSelectedCities =
//       Array.isArray(data.eligiblecity_ids) && data.eligiblecity_ids.length > 0;
//     const hasOtherCities =
//       Array.isArray(data.other_eligible_city_names) &&
//       data.other_eligible_city_names.some((c) => c.trim());
//     if (!hasSelectedCities && !hasOtherCities) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "Please select at least one city or add a custom city",
//         path: ["eligiblecity_ids"],
//       });
//     }

//     // ========== DURATION (Internship) ==========
//     if (data.opportunity_type === "Internship") {
//       if (data.duration_id === null && !data.other_duration?.trim()) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: "Please specify the custom internship duration",
//           path: ["other_duration"],
//         });
//       }
//       if (
//         data.duration_id != null &&
//         (!data.duration_id || data.duration_id <= 0)
//       ) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: "Please select an internship duration",
//           path: ["duration_id"],
//         });
//       }
//       // Date validation
//       if (data.is_custom_internship_date) {
//         if (!data.internship_from_date) {
//           ctx.addIssue({
//             code: z.ZodIssueCode.custom,
//             message: "Start date is required",
//             path: ["internship_from_date"],
//           });
//         }
//         if (!data.internship_to_date) {
//           ctx.addIssue({
//             code: z.ZodIssueCode.custom,
//             message: "End date is required",
//             path: ["internship_to_date"],
//           });
//         }
//         if (data.internship_from_date && data.internship_to_date) {
//           const from = new Date(data.internship_from_date);
//           const to = new Date(data.internship_to_date);
//           if (from > to) {
//             ctx.addIssue({
//               code: z.ZodIssueCode.custom,
//               message: "End date must be after start date",
//               path: ["internship_to_date"],
//             });
//           }
//         }
//       }
//     }

//     // ========== DURATION (Project) ==========
//     if (data.opportunity_type === "Project") {
//       if (!data.project_start_date) {
//         ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Start date is required", path: ["project_start_date"] });
//       }
//       if (!data.project_end_date) {
//         ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End date is required", path: ["project_end_date"] });
//       }
//       if (data.project_start_date && data.project_end_date) {
//         const start = new Date(data.project_start_date);
//         const end = new Date(data.project_end_date);
//         if (start > end) {
//           ctx.addIssue({ code: z.ZodIssueCode.custom, message: "End date must be after start date", path: ["project_end_date"] });
//         }
//       }
//     }

//     // ========== EXPERIENCE ==========
//     if (data.experience_required) {
//       if (data.experience_min == null || data.experience_min < 0) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: "Minimum experience is required (0 or more years)",
//           path: ["experience_min"],
//         });
//       }
//       if (data.experience_max != null && data.experience_max < (data.experience_min || 0)) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: "Maximum experience must be ≥ minimum",
//           path: ["experience_max"],
//         });
//       }
//     }

//     // ========== STIPEND ==========
//     const isProject = data.opportunity_type === "Project";
//     const isFixed = data.stipend_type === "Fixed";
//     const showSingleBox = isProject && isFixed;
//     if (showSingleBox) {
//       if (data.stipend_min == null || data.stipend_min < 0) {
//         ctx.addIssue({
//           code: z.ZodIssueCode.custom,
//           message: "Please enter the total project budget",
//           path: ["stipend_min"],
//         });
//       }
//     } else {
//       const needsStipend =
//         (data.opportunity_type === "Internship" && data.stipend_type === "Paid") ||
//         (data.opportunity_type === "Job" && ["Fixed", "Variable"].includes(data.stipend_type)) ||
//         (isProject && !isFixed);
//       if (needsStipend) {
//         if (data.stipend_min == null || data.stipend_max == null) {
//           const label = isProject ? "budget" : data.opportunity_type === "Internship" ? "stipend" : "salary";
//           ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Please enter both minimum and maximum ${label}`, path: ["stipend_min"] });
//           ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Please enter both minimum and maximum ${label}`, path: ["stipend_max"] });
//         } else if (data.stipend_min > data.stipend_max) {
//           ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Maximum must be ≥ minimum", path: ["stipend_max"] });
//         }
//       }
//     }

//     // ========== HYBRID DAYS ==========
//     if (
//       data.job_type === "Hybrid" &&
//       (!data.days_in_office || data.days_in_office <= 0)
//     ) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "Please select the number of in-office days per week",
//         path: ["days_in_office"],
//       });
//     }
//   });

// const REQUIRED_FIELDS = [
//   "opportunity_type",
//   "job_role_id",
//   "skill_ids",
//   "job_type",
//   "job_time",
//   "number_of_openings",
//   "job_description",
//   "phone_contact",
//   "eligiblecity_ids",
//   "stipend_type",
//   "duration_id",
//   "internship_start_date",
//   "minSkillMatchRequired"
// ];

// // ==================== REUSABLE COMPONENTS ====================
// const SearchableSelect = ({
//   options = [],
//   value = null,
//   onChange,
//   placeholder = "",
//   error,
//   isMulti = false,
//   isCreatable = false,
//   getOptionLabel = (opt) => opt.name || opt.title || String(opt),
//   getOptionValue = (opt) => opt.id,
//   renderOption,
//   inputValue: externalInputValue,
//   onInputChange,
//   isLoading = false,
//   noOptionsMessage,
//   maxDropdownOptions = 10,
// }) => {
//   const [internalInputValue, setInternalInputValue] = useState("");
//   const [isOpen, setIsOpen] = useState(false);
//   const containerRef = useRef(null);
//   const inputValue =
//     externalInputValue !== undefined ? externalInputValue : internalInputValue;

//   const handleInputChange = (val) => {
//     if (onInputChange) {
//       onInputChange(val);
//     } else {
//       setInternalInputValue(val);
//     }
//     if (val) setIsOpen(true);
//   };

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (containerRef.current && !containerRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };
//     if (isOpen) {
//       document.addEventListener("mousedown", handleClickOutside);
//     }
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, [isOpen]);

//   const filteredOptions = options.filter((opt) =>
//     getOptionLabel(opt).toLowerCase().includes(inputValue.toLowerCase())
//   );

//   const showCreateOption =
//     isCreatable &&
//     inputValue.trim() !== "" &&
//     !filteredOptions.some(
//       (opt) => getOptionLabel(opt).toLowerCase() === inputValue.toLowerCase()
//     );

//   const handleSelect = (item) => {
//     if (item.__create) {
//       if (isMulti) {
//         const current = Array.isArray(value) ? value : [];
//         const customItem = { __custom: item.value.trim() };
//         const exists = current.some(
//           (v) =>
//             (typeof v === "object" && v.__custom === customItem.__custom) ||
//             (typeof v === "number" &&
//               options.some(
//                 (opt) =>
//                   getOptionValue(opt) === v &&
//                   getOptionLabel(opt).toLowerCase() ===
//                   customItem.__custom.toLowerCase()
//               ))
//         );
//         if (!exists) {
//           onChange([...current, customItem]);
//         }
//       } else {
//         onChange({ __create: true, value: item.value.trim() });
//       }
//     } else {
//       const val = getOptionValue(item);
//       if (isMulti) {
//         const current = Array.isArray(value) ? value : [];
//         if (!current.includes(val)) {
//           onChange([...current, val]);
//         }
//       } else {
//         onChange(val);
//       }
//     }
//     handleInputChange("");
//     setIsOpen(false);
//   };

//   const handleRemove = (itemToRemove) => {
//     if (isMulti) {
//       onChange(
//         value.filter((item) =>
//           typeof item === "object"
//             ? item.__custom !== itemToRemove.__custom
//             : item !== itemToRemove
//         )
//       );
//     } else {
//       onChange(null);
//       handleInputChange("");
//     }
//   };

//   const renderTags = () => {
//     if (!isMulti || !Array.isArray(value)) return null;
//     return value.map((item, idx) => {
//       let label, key;
//       if (typeof item === "object" && item.__custom) {
//         label = item.__custom;
//         key = `custom-${idx}`;
//       } else {
//         const found = options.find((opt) => getOptionValue(opt) === item);
//         label = found ? getOptionLabel(found) : String(item);
//         key = item;
//       }
//       return (
//         <span
//           key={key}
//           className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-900 bg-[#eaf4e3] rounded-full"
//         >
//           {label}
//           <button
//             type="button"
//             className="mr-1 text-green-700 hover:text-green-900"
//             onClick={() => handleRemove(item)}
//           >
//             <FaTimes className="w-2 h-2" />
//           </button>
//         </span>
//       );
//     });
//   };

//   const getDisplayLabel = () => {
//     if (value == null) return "";
//     if (typeof value === "object" && value.__create) {
//       return value.value;
//     }
//     const opt = options.find((o) => getOptionValue(o) === value);
//     return opt ? getOptionLabel(opt) : String(value);
//   };

//   const displayLabel = getDisplayLabel();

//   return (
//     <div className="relative" ref={containerRef}>
//       <div
//         className={`flex flex-wrap items-center gap-1 px-2 py-2 min-h-[40px] transition-all duration-200 border rounded-md cursor-text focus-within:border-transparent
//           ${error ? "border-[#ef4444]" : "border-gray-300 hover:border-[#9bc87c]"}
//           focus-within:ring-2 ${error ? "focus-within:ring-[rgba(239,68,68,0.25)]" : "focus-within:ring-[rgba(155,200,124,0.3)]"}`}
//         onClick={() => setIsOpen(true)}
//       >
//         {isMulti && renderTags()}
//         {!isMulti && value != null && inputValue === "" && !isOpen && (
//           <span className="absolute left-2 top-2.5 text-sm text-gray-700 pointer-events-none">
//             {displayLabel}
//           </span>
//         )}
//         <input
//           type="text"
//           className="flex-1 text-sm outline-none min-w-[80px] bg-transparent"
//           value={inputValue}
//           onChange={(e) => handleInputChange(e.target.value)}
//           onFocus={() => setIsOpen(true)}
//           placeholder={
//             (!value || (isMulti && value.length === 0)) && inputValue === ""
//               ? placeholder
//               : ""
//           }
//         />
//         {!isMulti && (value != null || inputValue !== "") && (
//           <button
//             type="button"
//             className="w-5 h-5 ml-1 text-green-700 hover:text-green-900"
//             onClick={(e) => {
//               e.stopPropagation();
//               if (inputValue !== "") {
//                 handleInputChange("");
//               } else {
//                 onChange(null);
//                 handleInputChange("");
//               }
//               setIsOpen(false);
//             }}
//             aria-label="Clear selection"
//           >
//             <FaTimes className="w-2.5 h-2.5" />
//           </button>
//         )}
//       </div>
//       {isOpen && (filteredOptions.length > 0 || showCreateOption) && (
//         <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg max-h-48">
//           {filteredOptions.slice(0, maxDropdownOptions).map((option) => {
//             const optionValue = getOptionValue(option);
//             const isSelected = isMulti
//               ? Array.isArray(value) && value.includes(optionValue)
//               : value === optionValue;
//             return (
//               <button
//                 key={optionValue}
//                 type="button"
//                 className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-[#f3f9ee] hover:text-green-900 ${isSelected ? "bg-[#eaf4e3] text-green-900" : ""
//                   }`}
//                 onClick={() => handleSelect(option)}
//               >
//                 {renderOption ? renderOption(option) : getOptionLabel(option)}
//                 {isSelected && (
//                   <span className="float-right text-green-700">✓</span>
//                 )}
//               </button>
//             );
//           })}
//           {showCreateOption && (
//             <button
//               type="button"
//               className="w-full px-3 py-2 text-sm text-left text-green-700 hover:bg-[#f3f9ee]"
//               onClick={() =>
//                 handleSelect({ __create: true, value: inputValue.trim() })
//               }
//             >
//               + Create: "{inputValue.trim()}"
//             </button>
//           )}
//         </div>
//       )}
//       {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
//     </div>
//   );
// };

// // ==================== PRICING HELPERS ====================
// const calculatePrice = (post_type, rules, collegeCount = 0) => {
//   if (!rules)
//     return { baseAmount: 0, gstAmount: 0, totalAmount: 0, tier: null };
//   let baseAmount = 0;
//   if (post_type === "active") {
//     baseAmount = rules.base || 0;
//   } else if (post_type === "future") {
//     baseAmount = rules.base || 0;
//   } else if (post_type === "college") {
//     if (collegeCount <= 0)
//       return { baseAmount: 0, gstAmount: 0, totalAmount: 0, tier: null };
//     const tier = rules.tiers.find(
//       (t) => collegeCount >= t.min && (t.max === null || collegeCount <= t.max)
//     );
//     if (!tier)
//       return { baseAmount: 0, gstAmount: 0, totalAmount: 0, tier: null };
//     if (tier.flat_rate !== undefined) {
//       baseAmount = tier.flat_rate;
//     } else if (tier.base && tier.increment_per_college) {
//       const extra = Math.max(0, collegeCount - tier.min);
//       baseAmount = tier.base + extra * tier.increment_per_college;
//     } else {
//       baseAmount = collegeCount * 2000;
//     }
//   }
//   const gstAmount = Math.round((baseAmount * (rules.gst_percent || 18)) / 100);
//   const totalAmount = baseAmount + gstAmount;
//   let nextTierHint = null;
//   if (post_type === "college") {
//     const nextTier = rules.tiers.find((t) => t.min > collegeCount);
//     if (nextTier && nextTier.flat_rate) {
//       const needed = nextTier.min - collegeCount;
//       const nextBase = nextTier.flat_rate;
//       const nextTotal =
//         nextBase + Math.round((nextBase * (rules.gst_percent || 18)) / 100);
//       const currentTotal = totalAmount;
//       const listPrice = collegeCount * 2000;
//       const nextListPrice = nextTier.min * 2000;
//       const savings = listPrice + needed * 2000 - nextTotal;
//       if (savings > 0) {
//         nextTierHint = {
//           extraNeeded: needed,
//           newTotal: nextTotal,
//           savings: savings,
//           label: nextTier.label,
//         };
//       }
//     }
//   }
//   return {
//     baseAmount,
//     gstAmount,
//     totalAmount,
//     tier: rules.tiers?.find(
//       (t) =>
//         post_type === "college" &&
//         collegeCount >= t.min &&
//         (t.max === null || collegeCount <= t.max)
//     ),
//     savings:
//       post_type === "college"
//         ? Math.max(0, collegeCount * 2000 - baseAmount)
//         : 0,
//     nextTierHint,
//   };
// };

// // ==================== MAIN COMPONENT ====================
// export default function RecruiterPostJobInternDetails() {
//   const [jobRoleSearch, setJobRoleSearch] = useState("");
//   const [jobRoleOptions, setJobRoleOptions] = useState([]);
//   const [isJobRoleLoading, setIsJobRoleLoading] = useState(false);
//   const [jobRoleError, setJobRoleError] = useState(null);
//   const [cachedJobRole, setCachedJobRole] = useState(null);
//   const [locationSearchText, setLocationSearchText] = useState("");
//   const [locationOptions, setLocationOptions] = useState([]);
//   const [isLocationLoading, setIsLocationLoading] = useState(false);
//   const [locationError, setLocationError] = useState(null);
//   const [cachedLocations, setCachedLocations] = useState([]);
//   const [courseSearch, setCourseSearch] = useState("");
//   const [searchedCourses, setSearchedCourses] = useState([]);
//   const [isCourseLoading, setIsCourseLoading] = useState(false);
//   const [courseError, setCourseError] = useState(null);
//   const [cachedCourses, setCachedCourses] = useState([]);
//   const [collegeSearchText, setCollegeSearchText] = useState("");
//   const [tieUpCollegesList, setTieUpCollegesList] = useState([]);
//   const [isCollegeListLoading, setIsCollegeListLoading] = useState(false);
//   const [collegeListError, setCollegeListError] = useState(null);
//   const [cachedColleges, setCachedColleges] = useState([]);
//   const [durations, setDurations] = useState([{ id: 31, value: "1 Month" }, { id: 32, value: "2 Months" }, { id: 33, value: "3 Months" }, { id: 34, value: "4 Months" }, { id: 35, value: "6 Months" }, { id: 36, value: "12 Months" }]);
//   const { token,user } = useSelector((state) => state.auth);
//   console.log("the user",user);
//   const [showConfirmationModal, setShowConfirmationModal] = useState(false);
//   const [showPreviewModal, setShowPreviewModal] = useState(false);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [searchParams] = useSearchParams();

//   const postingType = location.state?.postingType;
//   const opportunityTypeFromState = location.state?.opportunityType;
//   // const resolvedPostingType =  postingType;
//   // const resolvedOpportunityType =  opportunityTypeFromState;
//   const [resolvedPostingType, setResolvedPostingType] = useState(postingType);
//   const [resolvedOpportunityType, setResolvedOpportunityType] = useState(opportunityTypeFromState);
//   const [campusHiringUniversityId, setCampusHiringUniversityId] = useState(null);
//   const [isAiGenerating, setIsAiGenerating] = useState(false);
//   const [aiSuggestions, setAiSuggestions] = useState({ description: null, candidatePreferences: null, screeningQuestions: null });

//     // Add after existing state declarations
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [editJobId, setEditJobId] = useState(null);
//   const [editModeType, setEditModeType] = useState(null); // "draft" | "duplicate" | "convert"
//   const [isEditLoading, setIsEditLoading] = useState(false);


//   useEffect(() => {
//     const uid = searchParams.get("university_id");
//     if (uid) {
//       setCampusHiringUniversityId(uid);
//       setResolvedPostingType((prev) => prev || "college");
//     }
//   }, [searchParams]);

//   // -----------------------------API INTEGRATION---------------------
//   useEffect(() => {
//     if (jobRoleSearch.length < 3) {
//       setJobRoleOptions([]);
//       setJobRoleError(null);
//       return;
//     }
//     const timer = setTimeout(async () => {
//       setIsJobRoleLoading(true);
//       setJobRoleError(null);
//       try {
//         const res = await axios.get(
//           `${BASE_URL}/master/job-roles/search`,
//           {
//             params: { search: jobRoleSearch.trim() },
//             timeout: 5000
//           }
//         );
//         const normalized = (res.data.data || [])
//           .filter(role => role.id && role.title)
//           .map(role => ({
//             id: typeof role.id === 'string' ? parseInt(role.id, 10) : Number(role.id),
//             title: role.title.trim()
//           }))
//           .filter(role => !isNaN(role.id));
//         setJobRoleOptions(normalized);
//       } catch (err) {
//         console.error("Job role search failed:", err);
//         setJobRoleError("Failed to load job profiles. Please try again.");
//         setJobRoleOptions([]);
//       } finally {
//         setIsJobRoleLoading(false);
//       }
//     }, 400);
//     return () => clearTimeout(timer);
//   }, [jobRoleSearch]);

//   useEffect(() => {
//     if (courseSearch.length < 2) {
//       setSearchedCourses([]);
//       setCourseError(null);
//       return;
//     }
//     const timer = setTimeout(async () => {
//       setIsCourseLoading(true);
//       setCourseError(null);
//       try {
//         const res = await axios.get(
//           `${BASE_URL}/master/courses/search`,
//           {
//             params: { search: courseSearch.trim() },
//             timeout: 5000
//           }
//         );
//         const normalized = (res.data.data || [])
//           .filter(c => c.id && c.name)
//           .map(c => ({ id: c.id, name: c.name }));
//         const unique = Array.from(
//           new Map(normalized.map(item => [item.id, item])).values()
//         );
//         setSearchedCourses(unique);
//       } catch (err) {
//         console.error("Course search failed:", err);
//         setCourseError("Failed to load courses. Please try again.");
//         setSearchedCourses([]);
//       } finally {
//         setIsCourseLoading(false);
//       }
//     }, 400);
//     return () => clearTimeout(timer);
//   }, [courseSearch]);

//   useEffect(() => {
//     if (locationSearchText.length < 3) {
//       setLocationOptions([]);
//       setLocationError(null);
//       return;
//     }
//     const timer = setTimeout(async () => {
//       setIsLocationLoading(true);
//       setLocationError(null);
//       try {
//         const res = await axios.get(
//           `${BASE_URL}/master/location/search`,
//           {
//             params: { search: locationSearchText.trim() },
//             timeout: 5000
//           }
//         );
//         const normalized = (res.data.data || []).map(loc => ({
//           id: loc.id || loc.location_id,
//           name: loc.name || loc.city_name || loc.value
//         }));
//         setLocationOptions(normalized);
//       } catch (err) {
//         console.error("Location search failed:", err);
//         setLocationError("Failed to load locations. Please try again.");
//         setLocationOptions([]);
//       } finally {
//         setIsLocationLoading(false);
//       }
//     }, 400);
//     return () => clearTimeout(timer);
//   }, [locationSearchText]);

//   useEffect(() => {
//     if (resolvedPostingType !== "college" || !token) {
//       setTieUpCollegesList([]);
//       setCollegeListError(null);
//       return;
//     }
//     let cancelled = false;
//     (async () => {
//       setIsCollegeListLoading(true);
//       setCollegeListError(null);
//       try {
//         const res = await axios.get(
//           `${BASE_URL}/company-recruiter/campus-hiring/tie-up-colleges`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//             timeout: 15000,
//           }
//         );
//         if (cancelled) return;
//         const rows = res.data?.data || [];
//         const normalized = rows
//           .filter((c) => c.id != null)
//           .map((c) => ({
//             id: typeof c.id === "string" ? parseInt(c.id, 10) : Number(c.id),
//             name: c.college_name || c.name,
//           }))
//           .filter((c) => !Number.isNaN(c.id));
//         setTieUpCollegesList(normalized);
//       } catch (err) {
//         if (!cancelled) {
//           console.error("Campus hiring tie-up colleges failed:", err);
//           setCollegeListError("Failed to load tie-up colleges. Please try again.");
//           setTieUpCollegesList([]);
//         }
//       } finally {
//         if (!cancelled) setIsCollegeListLoading(false);
//       }
//     })();
//     return () => {
//       cancelled = true;
//     };
//   }, [resolvedPostingType, token]);






//   const [deletedQuestion, setDeletedQuestion] = useState({ index: -1, text: "" });
//   const [undoTimeout, setUndoTimeout] = useState(null);

//   const methods = useForm({
//     mode: "onSubmit",
//     resolver: zodResolver(jobPostSchema),
//     defaultValues: {
//       opportunity_type: resolvedOpportunityType ? resolvedOpportunityType : "Job",
//       job_status: resolvedPostingType !== "future",
//       job_role_id: null,
//       other_job_role: "",
//       other_skills: [],
//       other_eligible_city_names: [],
//       other_eligible_college_names: [],
//       other_eligible_course_names: [],
//       duration_id: null,
//       other_duration: "",
//       skill_ids: [],
//       job_type: "In office",
//       days_in_office: null,
//       job_time: "Day Shift",
//       number_of_openings: "",
//       job_description: "",
//       candidate_preferences: "",
//       women_preferred: false,
//       stipend_type: "Paid",
//       stipend_min: null,
//       stipend_max: null,
//       incentive_per_year: "",
//       perks: [],
//       screening_questions: [],
//       phone_contact: user?.phone?.replace(/\D/g, "").slice(0, 10) || "",
//       alternate_phone_number: "",
//       eligiblecity_ids: [],
//       internship_start_date: "",
//       internship_from_date: "",
//       internship_to_date: "",
//       is_custom_internship_date: false,
//       eligiblecollege_ids: [],
//       eligiblecourse_ids: [],
//       minSkillMatchRequired: null,
//       project_start_date: "",
//       project_end_date: "",
//       eligible_education_levels: [],
//       eligible_specialization_ids: [],
//       other_eligible_specializations: [],
//       include_pursuing_students: false,
//       experience_required: false,
//       experience_min: null,
//       experience_max: null,
//       experience_types: [],
//     },
//   });



//     // Fetch job data for edit/duplicate/convert flows
// useEffect(() => {
//   const jobId = searchParams.get("jobId");
//   const mode = searchParams.get("mode") ; // "draft" | "duplicate" | "convert"
  
//   // Only fetch if we have jobId and mode params
//   if (jobId && mode) {
//     const fetchJobForEdit = async () => {
//       try {
//         setIsEditMode(true);
//         setEditJobId(jobId);
//         setEditModeType(mode);
//         setIsEditLoading(true);
        
//         const response = await axios.get(`${BASE_URL}/jobs/${jobId}/edit`, {
//           params: { mode },
//           headers: { Authorization: `Bearer ${token}` }
//         });
        
//         if (response.data.success) {
//           const jobData = response.data.data;

//            setResolvedOpportunityType(jobData.opportunity_type || "Job");
    
//           if (mode === "convert") {
//               // Convert mode: Force posting type to 'active' regardless of original status
//               setResolvedPostingType("active");
//           } else {
//               // Draft/Duplicate: Keep original posting type
//               setResolvedPostingType(jobData.post_type || "active");
//           }
          
//           // Map domain_skills to selectedDomainSkills state
//           if (jobData.domain_skills) {
//             setSelectedDomainSkills(jobData.domain_skills);
//           }
          
//           // Cache searchable select options for display
//           if (jobData.eligible_cities?.length) {
//             setCachedLocations(jobData.eligible_cities);
//           }
//           if (jobData.eligible_colleges?.length) {
//             setCachedColleges(jobData.eligible_colleges);
//           }
//           if (jobData.eligible_courses?.length) {
//             setCachedCourses(jobData.eligible_courses);
//           }
//           if (jobData.job_role) {
//             setCachedJobRole(jobData.job_role);
//           }
          
//           // Reset form with fetched data
//           const formValues = {
//             opportunity_type: jobData.opportunity_type || "Job",
//             job_status: jobData.job_status !== undefined ? jobData.job_status : true,
//             job_role_id: jobData.opportunity_type === "Project" ? null : (jobData.job_role?.id ?? null),
//             other_job_role: jobData.other_job_role || (jobData.opportunity_type === "Project" && jobData.job_role?.title ? jobData.job_role.title : ""),
//             skill_ids: jobData.skill_ids || [],
//             other_skills: jobData.other_skills || [],
//             eligiblecity_ids: jobData.eligible_cities?.map(c => c.id) || [],
//             other_eligible_city_names: jobData.other_eligible_city_names || [],
//             eligiblecollege_ids: jobData.eligible_colleges?.map(c => c.id) || [],
//             other_eligible_college_names: jobData.other_eligible_college_names || [],
//             eligiblecourse_ids: jobData.eligible_courses?.map(c => c.id) || [],
//             other_eligible_course_names: jobData.other_eligible_course_names || [],
//             duration_id: jobData.duration?.id ?? null,
//             other_duration: jobData.other_duration || "",
//             job_type: jobData.job_type || "In office",
//             job_time: jobData.job_time || "Day Shift",
//             days_in_office: jobData.days_in_office ?? null,
//             number_of_openings: jobData.number_of_openings ?? 1,
//             job_description: jobData.job_description || "",
//             candidate_preferences: jobData.candidate_preferences || "",
//             women_preferred: jobData.women_preferred || false,
//             stipend_type: jobData.stipend_type || "Paid",
//             stipend_min: jobData.stipend_min ?? null,
//             stipend_max: jobData.stipend_max ?? null,
//             incentive_per_year: jobData.incentive_per_year || "",
//             perks: jobData.perks || [],
//             screening_questions: jobData.screening_questions || [],
//             phone_contact: jobData.phone_contact || "",
//             alternate_phone_number: jobData.alternate_phone_number || "",
//             internship_start_date: jobData.internship_start_date || "",
//             internship_from_date: jobData.internship_from_date || "",
//             internship_to_date: jobData.internship_to_date || "",
//             is_custom_internship_date: jobData.is_custom_internship_date || false,
//             minSkillMatchRequired: jobData.minSkillMatchRequired ?? null,
//             project_start_date: jobData.project_start_date || "",
//             project_end_date: jobData.project_end_date || "",
//             eligible_education_levels: jobData.eligible_education_levels || [],
//             eligible_specialization_ids: jobData.eligible_specializations?.map(s => s.id) || [],
//             other_eligible_specializations: jobData.other_eligible_specializations || [],
//             include_pursuing_students: jobData.include_pursuing_students || false,
//             experience_required: jobData.experience_required || false,
//             experience_min: jobData.experience_min ?? null,
//             experience_max: jobData.experience_max ?? null,
//             experience_types: jobData.experience_types || [],
//           };
          
//           methods.reset(formValues);
//         }
//       } catch (error) {
//         console.error("Failed to fetch job for edit:", error);
//         showErrorAlert("Failed to load job details. Please try again.");
//         setIsEditMode(false);
//         setEditJobId(null);
//         setEditModeType(null);
//       } finally {
//         setIsEditLoading(false);
//       }
//     };
    
//     fetchJobForEdit();
//   }
// }, [searchParams, token, methods]);

//   const userPlan = useSelector((state) => state.user?.plan || "pro");



//   const enrichedDurations = durations.map(d => ({
//     ...d,
//     is_recommended: d.value.toLowerCase().includes('3 month')
//   }));


//   const {
//     generateContent,
//     isGenerating: isAIGenerating,
//     error: aiError,
//   } = useAIGeneration();

//   const prepareAIInput = () => {
//     const formData = methods.getValues();
//     let jobRoleTitle = "";
//     if (formData.job_role_id && cachedJobRole) {
//       jobRoleTitle = cachedJobRole.title.trim();
//     }
//     if (!jobRoleTitle && formData.other_job_role?.trim()) {
//       jobRoleTitle = formData.other_job_role.trim();
//     }
//     const { skills: existingSkills, other_skills: customSkills } = extractSkillArrays(selectedDomainSkills);
//     const skillNamesFromExisting = existingSkills.map((skillItem) => {
//       return skillItem.skill_name;
//     }).filter(Boolean);
//     const skillNamesFromCustom = customSkills.map(s => s.skill);
//     const skillNames = [...skillNamesFromExisting, ...skillNamesFromCustom];

//     let durationValue = undefined;
//     if (formData.opportunity_type === "Internship") {
//       if (formData.duration_id && durations?.length) {
//         const dur = durations.find(d => d.id === formData.duration_id);
//         if (dur?.value) durationValue = dur.value;
//       } else if (formData.other_duration?.trim()) {
//         durationValue = formData.other_duration.trim();
//       }
//     }
//     return {
//       opportunityType: formData.opportunity_type || "Job",
//       title: jobRoleTitle,
//       skills: skillNames,
//       workType: formData.job_type || undefined,
//       workSchedule: formData.job_time || undefined,
//       duration: durationValue
//     };
//   };

//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [successMessage, setSuccessMessage] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const [pricingRules, setPricingRules] = useState(null);
//   const [eligibility, setEligibility] = useState({
//     is_eligible: true,
//     reason: "subscription",
//     can_pay_one_time: true,
//     one_time_price: null,
//     can_upgrade: false,
//     upgrade_suggestion: null,
//   });
//   const [selectedDomainSkills, setSelectedDomainSkills] = useState([]);

//   const handleDomainSkillsChange = useCallback((updatedDomainSkills) => {
//     setSelectedDomainSkills(updatedDomainSkills);
//     const { skills, other_skills } = extractSkillArrays(updatedDomainSkills);
//     methods.setValue("skill_ids", skills.map(s => s.skill_id), { shouldValidate: false });
//     methods.setValue("other_skills", other_skills, { shouldValidate: false });
//   }, [methods]);

//   useEffect(() => {
//     if (["active", "future", "college"].includes(resolvedPostingType)) {
//       const loadPricingRules = async () => {
//         try {
//           const rules = await getPricingRules(resolvedPostingType);
//           setPricingRules(rules);
//         } catch (err) {
//           console.error("Failed to load pricing rules", err);
//         }
//       };
//       loadPricingRules();
//     }
//   }, [resolvedPostingType]);

//   const selectedCollegesCount = useMemo(
//     () =>
//       (methods.watch("eligiblecollege_ids")?.length || 0) +
//       (methods.watch("other_eligible_college_names")?.filter((n) => n.trim())
//         .length || 0),
//     [
//       methods.watch("eligiblecollege_ids"),
//       methods.watch("other_eligible_college_names"),
//     ]
//   );

//   const pricingResult = useMemo(() => {
//     if (!pricingRules) return null;
//     return calculatePrice(
//       resolvedPostingType,
//       pricingRules,
//       selectedCollegesCount
//     );
//   }, [resolvedPostingType, pricingRules, selectedCollegesCount]);

//   const handleEligibilityChange = useCallback((eligibilityData) => {
//     setEligibility(eligibilityData);
//   }, []);

//   // Watch form values
//   const opportunity_type = resolvedOpportunityType ? resolvedOpportunityType : "Job";
//   const job_type = methods.watch("job_type");
//   const stipend_type = methods.watch("stipend_type");
//   const is_custom_internship_date = methods.watch("is_custom_internship_date");
//   const current_skill_ids = methods.watch("skill_ids");

//   // ==================== FORM VISIBILITY CONFIG (CONTROL CENTER) ====================
//   const formConfig = useMemo(() => {
//     const isInternship = opportunity_type === "Internship";
//     const isProject = opportunity_type === "Project"  || opportunity_type === "project";
//     const isJob = opportunity_type === "Job" || opportunity_type === "job";
//     const isCollegePosting = resolvedPostingType === "college";
//     const isFuturePosting = resolvedPostingType === "future"; 
//     const isActivePosting = resolvedPostingType === "active";

//     return {
//       // 1. Opportunity Specific Fields
//       showDuration: isInternship,
//       showInternshipDates: isInternship,
//       showProjectDates: isProject,
//       showExperience: !(isCollegePosting || isInternship || isFuturePosting), // Jobs & Projects need experience
//       showScreeningQuestions: !(isFuturePosting),
//       showBenefits: !(isProject || isFuturePosting),
//       showAlternateContact : !(isFuturePosting),
//       showMinExperienceInputInSkills: !(isCollegePosting),
//       showMustHaveToggleInSkills: true,

//       // 2. Posting Type Specific Fields
//       showCollegeSelector: isCollegePosting,

//       // 3. Labels & Text
//       roleLabel: isInternship ? "Internship Profile" : isProject ? "Project Title" : "Job Title",
//       descLabel: isInternship ? "Intern's responsibility" : isProject ? "Project description" : "Job description",
//       stipendLabel: isProject ? "Project Budget" : isInternship ? "Stipend" : "Salary",
//       perksLabel: isInternship ? "Perks" : "Benefits",

//       // 4. API Logic Helpers
//       needsDuration: isInternship,
//       needsExperience: !(isCollegePosting || isInternship),
//     };
//   }, [opportunity_type, resolvedPostingType]);
//   // ================================================================================

//   const collegeDropdownOptions = useMemo(() => {
//     const byId = new Map();
//     tieUpCollegesList.forEach((c) => {
//       if (c?.id != null && !Number.isNaN(Number(c.id))) {
//         byId.set(Number(c.id), c);
//       }
//     });
//     (cachedColleges || []).forEach((c) => {
//       const id = c?.id != null ? Number(c.id) : NaN;
//       if (!Number.isNaN(id) && !byId.has(id)) {
//         byId.set(id, c);
//       }
//     });
//     return Array.from(byId.values());
//   }, [tieUpCollegesList, cachedColleges]);

//   const handleOpportunityTypeChange = (newType) => {
//     methods.reset({
//       opportunity_type: newType,
//       job_role_id: null,
//       other_job_role: "",
//       skill_ids: [],
//       other_skills: [],
//       eligiblecity_ids: [],
//       other_eligible_city_names: [],
//       eligiblecollege_ids: [],
//       other_eligible_college_names: [],
//       eligiblecourse_ids: [],
//       other_eligible_course_names: [],
//       other_duration: "",
//       job_type: "In office",
//       days_in_office: null,
//       job_time: "Day Shift",
//       number_of_openings: "",
//       job_description: "",
//       candidate_preferences: "",
//       women_preferred: false,
//       stipend_type: newType === "Internship" ? "Paid" : "Fixed",
//       stipend_min: null,
//       stipend_max: null,
//       incentive_per_year: "",
//       perks: [],
//       screening_questions: [],
//       phone_contact: user?.phone?.replace(/\D/g, "").slice(0, 10) || "",
//       alternate_phone_number: "",
//       duration_id: newType === "Internship" ? null : undefined,
//       internship_start_date: "",
//       internship_from_date: "",
//       internship_to_date: "",
//       is_custom_internship_date: false,
//       minSkillMatchRequired: null,
//       project_start_date: "",
//       project_end_date: "",
//       eligible_education_levels: [],
//       eligible_specialization_ids: [],
//       other_eligible_specializations: [],
//       include_pursuing_students: false,
//       experience_required: false,
//       experience_min: null,
//       experience_max: null,
//       experience_types: [],
//     });
//     setSelectedDomainSkills([]);
//     setSuccessMessage("");
//     setErrorMessage("");
//   };

//   const transformFormDataToAPI = (formData) => {
//     // Recalculate flags for safety in API transformation
//     const isInternship = formData.opportunity_type === "Internship";
//     const isProject = formData.opportunity_type === "Project";
   

  
//     // Include job_id only for edit flows (backend handles update vs create)
//     const isEditFlow = isEditMode && editJobId;
//     const isDraft= editModeType==="draft";
   

//     const apiData = {
//        ...(isDraft && { job_id: editJobId }), //for other edits mode duplicate and convert we dont need job_id
//       opportunity_type: formData.opportunity_type,
//       post_type:  resolvedPostingType,
//       // Job Role
//       job_role_id: formData.job_role_id,
//       other_job_role:
//         formData.job_role_id === null ? formData.other_job_role : null,
//       // Skills
//       skill_ids: Array.isArray(formData.skill_ids) ? formData.skill_ids : [],
//       other_skills: Array.isArray(formData.other_skills)
//         ? formData.other_skills.map((s) => ({
//           domain: s.domain,
//           skill: s.skill,
//         }))
//         : [],
//       // Locations
//       eligiblecity_ids: Array.isArray(formData.eligiblecity_ids)
//         ? formData.eligiblecity_ids
//         : [],
//       other_eligible_city_names: Array.isArray(
//         formData.other_eligible_city_names
//       )
//         ? formData.other_eligible_city_names
//         : [],
//       // Colleges
//       eligiblecollege_ids: Array.isArray(formData.eligiblecollege_ids)
//         ? formData.eligiblecollege_ids
//         : [],
//       other_eligible_college_names: Array.isArray(
//         formData.other_eligible_college_names
//       )
//         ? formData.other_eligible_college_names
//         : [],
//       // Courses
//       eligiblecourse_ids: Array.isArray(formData.eligiblecourse_ids)
//         ? formData.eligiblecourse_ids
//         : [],
//       other_eligible_course_names: Array.isArray(
//         formData.other_eligible_course_names
//       )
//         ? formData.other_eligible_course_names
//         : [],
//       // Work & Schedule
//       job_type:
//         formData.eligiblecity_ids.length === 0 ? "Remote" : formData.job_type,
//       days_in_office:
//         formData.job_type === "Remote" ? null : formData.days_in_office,
//       job_time: formData.job_time,
//       // Openings & Description
//       number_of_openings: formData.number_of_openings,
//       job_description: formData.job_description,
//       candidate_preferences: formData.candidate_preferences || null,
//       women_preferred: formData.women_preferred,
//       // Stipend / Pay
//       stipend_type:
//         formData.opportunity_type === "Job" ? "Fixed" : formData.stipend_type,
//       stipend_min:
//         formData.stipend_type === "Unpaid" ? null : formData.stipend_min,
//       stipend_max:
//         formData.stipend_type === "Unpaid" ? null : formData.stipend_max,
//       incentive_per_year: formData.incentive_per_year || null,
//       // Perks & Screening
//       perks: Array.isArray(formData.perks) ? formData.perks : [],
//       screening_questions: Array.isArray(formData.screening_questions) ? formData.screening_questions :
//         formData.screening_questions.split("\n").filter((q) => q.trim()) ? formData.screening_questions.split("\n").filter((q) => q.trim())
//           : [],
//       // Contact Info
//       phone_contact: formData.phone_contact,
//       alternate_phone_number: formData.alternate_phone_number || null,
//       // Matching
//       minSkillMatchRequired: formData.minSkillMatchRequired || null,
//       job_status: formData.job_status,
//       // Internship-specific
//       ...(isInternship && {
//         duration_id: formData.duration_id,
//         other_duration:
//           formData.duration_id === null ? formData.other_duration : null,
//         is_custom_internship_date: formData.is_custom_internship_date,
//         internship_start_date: formData.is_custom_internship_date
//           ? null
//           : new Date().toISOString().split("T")[0],
//         internship_from_date: formData.is_custom_internship_date
//           ? formData.internship_from_date
//           : null,
//         internship_to_date: formData.is_custom_internship_date
//           ? formData.internship_to_date
//           : null,
//       }),
//       // Job or Project
//       ...(!isInternship && {
//         internship_start_date: formData.is_custom_internship_date
//           ? formData.internship_from_date
//           : new Date().toISOString().split("T")[0],
//       }),
//       ...(isProject && {
//         project_start_date: formData.project_start_date,
//         project_end_date: formData.project_end_date,
//       }),
//       // Education and experience
//       eligible_education_levels: Array.isArray(formData.eligible_education_levels)
//         ? formData.eligible_education_levels
//         : [],
//       eligible_specialization_ids: Array.isArray(formData.eligible_specialization_ids)
//         ? formData.eligible_specialization_ids
//         : [],
//       other_eligible_specializations: Array.isArray(formData.other_eligible_specializations)
//         ? formData.other_eligible_specializations
//         : [],
//       include_pursuing_students: formData.include_pursuing_students || false,
//       // Experience
//       experience_required: formData.experience_required || false,
//       experience_min: formData.experience_required ? formData.experience_min : null,
//       experience_max: formData.experience_required ? formData.experience_max : null,
//       experience_types: Array.isArray(formData.experience_types)
//         ? formData.experience_types
//         : [],
//     };

//     // Merge custom domain-skill pairs
//     const customDomainSkills = selectedDomainSkills
//       .filter(domain => domain.isCustom)
//       .flatMap(domain =>
//         (domain.selectedSkills || [])
//           .filter(skill => skill.isCustom)
//           .map(skill => ({
//             domain: domain.name,
//             skill: skill.skill_name,
//           }))
//       );

//     const customSkillsInExistingDomains = selectedDomainSkills
//       .filter(domain => !domain.isCustom)
//       .flatMap(domain =>
//         (domain.selectedSkills || [])
//           .filter(skill => skill.isCustom)
//           .map(skill => ({
//             domain: domain.name,
//             skill: skill.skill_name,
//           }))
//       );

//     const mergedOtherSkills = [
//       ...(Array.isArray(formData.other_skills) ? formData.other_skills : []),
//       ...customDomainSkills,
//       ...customSkillsInExistingDomains,
//     ];

//     const { skills, other_skills } = extractSkillArrays(selectedDomainSkills);
//     apiData.skills = skills;
//     apiData.other_skills = other_skills;
//     delete apiData.skill_ids;

//     return apiData;
//   };

//   const onSubmit = async (data) => {
//     setIsSubmitting(true);
//     setErrorMessage("");
//     setSuccessMessage("");
//     try {
//       const jobPostData = transformFormDataToAPI(data);
//       if (!token) {
//         throw new Error("Authentication token not found. Please log in again.");
//       }
//       const response = await jobPostApi.createJobPost(jobPostData, token);
//       const { data: jobData, subscription, payment } = response;

//       if (resolvedPostingType === "active") {
//         navigate(`/recruiter/job-posting/plan?jobId=${jobData.job_id}`);
//         return;
//       }

//       if (subscription && subscription.action === "used_subscription") {
//         setSuccessMessage(
//           `${data.opportunity_type} posted successfully using subscription!`
//         );
//         setTimeout(() => {
//           navigate("/recruiter/job-post-success", {
//             state: {
//               job_id: jobData.job_id,
//               post_type: resolvedPostingType,
//               subscription: {
//                 plan_name: subscription.plan_name,
//                 credits_before: subscription.credits_before,
//                 credits_after: subscription.credits_after,
//                 remaining_credits: subscription.remaining_credits,
//               },
//             },
//           });
//         }, 2000);
//       } else if (subscription && subscription.action === "used_college_credits") {
//         setSuccessMessage(
//           `${data.opportunity_type} posted using ${subscription.credits_used} college credits!`
//         );
//         setTimeout(() => {
//           navigate("/recruiter/job-post-success", {
//             state: {
//               job_id: jobData.job_id,
//               post_type: resolvedPostingType,
//               subscription: {
//                 action: "used_college_credits",
//                 credits_used: subscription.credits_used,
//                 remaining_credits_total: subscription.remaining_credits_total,
//               },
//             },
//           });
//         }, 2000);
//       } else if (response.status === "inactive_free_promo") {
//         setSuccessMessage(
//           ` ${data.opportunity_type} saved successfully `
//         );
//         setTimeout(() => {
//           navigate("/recruiter/job-post-success", {
//             state: {
//               job_id: jobData.job_id,
//               post_type: resolvedPostingType,
//               status: "inactive_free_promo",
//               activation_url: response.activation_url,
//             },
//           });
//         }, 2000);
//       } else if (payment && payment.action === "redirect_to_one_time") {
//         setSuccessMessage(
//           `${data.opportunity_type} saved. Redirecting to payment...`
//         );
//         setTimeout(() => {
//           if (resolvedPostingType === "college") {
//             // navigate("/recruiter/checkout", {
//             //   state: {
//             //     job_id: payment.job_id,
//             //     post_type: payment.post_type,
//             //     amount: payment.amount,
//             //     isOneTime: true,
//             //   },
//             // });

//             // Redirect to new college-specific checkout
//             navigate("/recruiter/checkout/college-specific", {
//               state: {
//                 job_id: payment.job_id,
//                 post_type: payment.post_type,
//                 initial_colleges: data.eligiblecollege_ids || [],
//               }
//             });
//           } else {
//             navigate("/recruiter/checkout", {
//               state: {
//                 job_id: payment.job_id,
//                 post_type: payment.post_type,
//                 amount: payment.amount,
//               },
//             });
//           }
//         }, 2000);
//       } else {
//         setErrorMessage("Unexpected response from server. Please try again.");
//       }
//     } catch (error) {
//       console.error("Job post error:", error);
//       if (
//         error.response?.status === 402 &&
//         error.response?.data?.message?.includes("credits")
//       ) {
//         const missing = error.response.data.missing_credits || 1;
//         if (confirm(`Need ${missing} more college credits. Buy now?`)) {
//           navigate(`/recruiter/credits/pricing?need=${missing}`);
//           return;
//         }
//       }
//       const errorMsg = error.response?.data?.message || error.message || "Failed to post.";
//       setErrorMessage(errorMsg);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const onSaveDraft = async (data) => {
//     setIsSubmitting(true);
//     setErrorMessage("");
//     setSuccessMessage("");
//     try {
//       let jobPostData = transformFormDataToAPI(data);
//       jobPostData.active_status = 0;
//       if (!token) {
//         throw new Error("Authentication token not found. Please log in again.");
//       }
//       const response = await jobPostApi.createJobPost(jobPostData, token);
//       setSuccessMessage(`${data.opportunity_type} draft saved successfully!`);
//       setSelectedDomainSkills([]);
//       methods.reset();
//       setTimeout(() => {
//         navigate("/recruiter-dashboard");
//       }, 2000);
//     } catch (error) {
//       console.log("=== API ERROR ===");
//       const errorMsg =
//         error.response?.data?.message ||
//         error.message ||
//         "Failed to save draft. Please try again.";
//       setErrorMessage(errorMsg);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Field mappings for error messages
//   const FIELD_LABELS = {
//     job_role_id: formConfig.roleLabel,
//     skill_ids: "Skills",
//     eligiblecity_ids: "City/Cities",
//     number_of_openings: "Number of Openings",
//     job_description: formConfig.descLabel,
//     phone_contact: "Primary Phone Number",
//     minSkillMatchRequired: "Minimum Skill Match Percentage",
//     stipend_min: formConfig.stipendLabel,
//     stipend_max: formConfig.stipendLabel,
//     duration_id: "Internship Duration",
//     other_duration: "Custom Internship Duration",
//     internship_from_date: "Internship Start Date",
//     internship_to_date: "Internship End Date",
//     project_start_date: "Project Start Date",
//     project_end_date: "Project End Date",
//     days_in_office: "In-Office Days per Week",
//     experience_min: "Minimum Experience (Years)",
//   };

//   const getMissingFieldLabels = (errors, labelMap) => {
//     const missing = [];
//     for (const field in errors) {
//       if (errors[field]) {
//         const label = labelMap[field] || field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
//         if (!missing.includes(label)) {
//           missing.push(label);
//         }
//       }
//     }
//     return missing;
//   };

// const radioStyles =
//   "w-3 h-3 text-[#9bc87c] border-gray-300 focus:outline-none focus:ring-0";
// const checkboxStyles =
//   "w-3 h-3 text-[#9bc87c] border-gray-300 rounded focus:outline-none focus:ring-0";
//   const radioContainerStyles =
//     "flex gap-3 p-2 border border-gray-300 rounded-lg bg-white";

//   return (
//     <MainLayout
//       heading="Post Internship/Job"
//       subheading="Post your internship/job to attract the best candidates."
//       hideMobileIllustration={true}
//     >
//       <div className="relative bg-[#f5f6f7] flex w-full min-h-screen overflow-hidden md:items-center md:justify-center">
//         <div className="flex justify-center flex-1 w-full mt-6 md:mt-0">
//           <div className="w-full max-w-full p-6 mt-4 bg-white shadow-none rounded-xl sm:shadow-xl sm:max-w-2xl sm:p-8">
//             {campusHiringUniversityId && (
//               <div className="mb-4 rounded-lg border border-[#9bc87c] bg-[#f3f9ee] px-4 py-3 text-sm text-green-900">
//                 <strong>Campus hiring:</strong> Continue with college-specific
//                 posting. University reference:{" "}
//                 <span className="font-mono">{campusHiringUniversityId}</span>.
//               </div>
//             )}
//             {postingType === "college" && userPlan === "free" ? (
//               <div className="p-6 text-center">
//                 <div className="inline-block p-3 mb-4 bg-red-100 rounded-full">
//                   <FaTimes className="w-6 h-6 text-red-600" />
//                 </div>
//                 <h3 className="text-lg font-medium text-gray-900">
//                   Upgrade to Post College Jobs
//                 </h3>
//                 <p className="mt-2 text-sm text-gray-600">
//                   College-Specific targeting is only available on paid plans.
//                 </p>
//               </div>
//             )  : (isEditLoading ? (
//                   <div className="flex flex-col items-center justify-center py-12">
//                     <div className="w-8 h-8 border-2 border-[#9bc87c] rounded-full border-t-transparent animate-spin"></div>
//                     <p className="mt-4 text-gray-600">Loading job details...</p>
//                   </div>
//                 ) : (
//               <FormProvider {...methods}>
//                 <form
//                   onSubmit={(e) => {
//                     methods.handleSubmit(
//                       (data) => {
//                         onSubmit(data);
//                       },
//                       (errors) => {
//                         console.log(" Validation failed:");
//                         console.log("Errors:", errors);
//                       }
//                     )(e);
//                   }}
//                   className="space-y-4"
//                 >
//                   {/* === BANNERS === */}
//                   {resolvedPostingType === "future" && (
//                     <div className="p-3 mb-4 border border-green-200 rounded-md bg-green-50">
//                       <p className="text-sm text-gray-700">
//                         <span className="font-medium">Future Job</span> – Post
//                         an opportunity for future. The status will be marked as
//                         inactive and wil not be visible to others.
//                       </p>
//                     </div>
//                   )}
//                   {resolvedPostingType === "college" && userPlan === "free" && (
//                     <div className="p-3 mb-4 border border-red-200 rounded-md bg-red-50">
//                       <p className="text-sm text-red-700">
//                         🔒 College-Specific Jobs require a paid plan.
//                         <button
//                           type="button"
//                           onClick={() => navigate("/recruiter-pricing")}
//                           className="ml-1 text-green-700 underline"
//                         >
//                           View Pricing
//                         </button>
//                       </p>
//                     </div>
//                   )}

//                   {/* Success/Error Messages */}
//                   {successMessage && (
//                     <div className="relative">
//                       <SuccessMessage size="large">
//                         {successMessage}
//                       </SuccessMessage>
//                       <button
//                         type="button"
//                         onClick={() => setSuccessMessage("")}
//                         className="absolute text-green-600 top-2 right-2 hover:text-green-800 focus:outline-none"
//                       >
//                         <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
//                           <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//                         </svg>
//                       </button>
//                     </div>
//                   )}
//                   {errorMessage && (
//                     <div className="relative">
//                       <ErrorMessage size="large">{errorMessage}</ErrorMessage>
//                       <button
//                         type="button"
//                         onClick={() => setErrorMessage("")}
//                         className="absolute text-red-600 top-2 right-2 hover:text-red-800 focus:outline-none"
//                       >
//                         <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
//                           <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
//                         </svg>
//                       </button>
//                     </div>
//                   )}

//                   {/* Status Info */}
//                   <div className="p-3 mb-4 border border-[#9bc87c] rounded-md bg-[#f3f9ee]">
//                     <p className="text-sm text-gray-700">
//                       <span className="font-medium">Opportunity Type:</span>{" "}
//                       {resolvedOpportunityType ? resolvedOpportunityType : "Job"}
//                     </p>
//                     <p className="text-sm text-gray-700">
//                       <span className="font-medium">Active Status:</span>{" "}
//                       {resolvedPostingType === "future" ? "Inactive" : "Active"}
//                     </p>
//                   </div>

//                   {/* === SECTION 1: BASIC INFO (Always Visible) === */}
//                   <div className="space-y-4">
//                     <div>
//   <Label htmlFor={opportunity_type === "Project" ? "other_job_role" : "job_role_id"}>
//     {formConfig.roleLabel}
//     <span className="ml-1 text-red-500">*</span>
//   </Label>
//   {jobRoleError && <p className="mb-1 text-xs text-red-500">{jobRoleError}</p>}
  
//   {opportunity_type === "Project" ? (
//     // --- PROJECT MODE: Simple Text Input ---
//     <Input
//       type="text"
//       placeholder="e.g., Semiconductor Research, AI Model Dev..."
//       value={methods.watch("other_job_role") || ""}
//       onChange={(e) => {
//         methods.setValue("other_job_role", e.target.value, { shouldValidate: true });
//         methods.setValue("job_role_id", null); // Ensure ID is cleared for Projects
//       }}
//       error={methods.formState.errors.other_job_role?.message}
//     />
//   // ) : (
//   //   // --- JOB/INTERNSHIP MODE: Searchable Select ---
//   //   <SearchableSelect
//   //     options={[...jobRoleOptions, ...(cachedJobRole && !jobRoleOptions.some(o => o.id === cachedJobRole.id) ? [cachedJobRole] : [])]}
//   //     inputValue={jobRoleSearch}
//   //     onInputChange={(val) => { setJobRoleSearch(val); if (val.length < 2) setJobRoleOptions([]); }}
//   //     isLoading={isJobRoleLoading}
//   //     value={(() => {
//   //       const jobId = methods.watch("job_role_id");
//   //       const otherRole = methods.watch("other_job_role");
//   //       if (jobId) return jobId;
//   //       if (otherRole?.trim()) return { __create: true, value: otherRole.trim() };
//   //       return null;
//   //     })()}
//   //     onChange={(val) => {
//   //       if (typeof val === 'number') {
//   //         methods.setValue("job_role_id", val, { shouldValidate: true });
//   //         methods.setValue("other_job_role", "");
//   //         const found = jobRoleOptions.find(o => o.id === val);
//   //         if (found) setCachedJobRole(found);
//   //       } else if (val?.__create) {
//   //         methods.setValue("job_role_id", null);
//   //         methods.setValue("other_job_role", val.value);
//   //         setCachedJobRole(null);
//   //       } else {
//   //         methods.setValue("job_role_id", null);
//   //         setCachedJobRole(null);
//   //       }
//   //     }}
//   //     placeholder="Search job titles... [Min 3 chars]"
//   //     isCreatable
//   //     getOptionLabel={(o) => o.title}
//   //     getOptionValue={(o) => o.id}
//   //   />
//   // )}

//   ) : (
//   // --- JOB/INTERNSHIP MODE: Creatable Select ---
//   <Controller
//     name="job_role_id"
//     control={methods.control}
//     render={({ field }) => (
//       <CreatableSelect
//         {...field}
//         value={
//           field.value
//             ? {
//                 value: String(field.value),
//                 label:
//                   jobRoleOptions.find((o) => String(o.id) === String(field.value))?.title ||
//                   (cachedJobRole && String(cachedJobRole.id) === String(field.value) ? cachedJobRole.title : "") ||
//                   methods.watch("other_job_role") ||
//                   "",
//               }
//             : methods.watch("other_job_role")
//             ? { value: "__custom__", label: methods.watch("other_job_role") }
//             : null
//         }
//         onInputChange={(val, actionMeta) => {
//           if (actionMeta.action === "input-change") {
//             setJobRoleSearch(val);
//             if (val.length < 2) setJobRoleOptions([]);
//           }
//         }}
//         options={[
//           ...jobRoleOptions,
//           ...(cachedJobRole && !jobRoleOptions.some((o) => o.id === cachedJobRole.id) ? [cachedJobRole] : []),
//         ].map((r) => ({ value: String(r.id), label: r.title }))}
//         isLoading={isJobRoleLoading}
//         filterOption={null}
//         onChange={(opt) => {
//           if (opt && opt.__isNew__) {
//             methods.setValue("other_job_role", opt.label.trim(), { shouldValidate: true });
//             field.onChange(null);
//             setCachedJobRole(null);
//           } else {
//             methods.setValue("other_job_role", "", { shouldValidate: true });
//             const selectedId = opt ? Number(opt.value) : null;
//             field.onChange(selectedId);
//             if (selectedId) {
//               const found = jobRoleOptions.find((o) => o.id === selectedId);
//               if (found) setCachedJobRole(found);
//             } else {
//               setCachedJobRole(null);
//             }
//           }
//         }}
//         placeholder="Search job titles... [Min 3 chars]"
//         isClearable
//         isSearchable
//         className="text-sm"
//         noOptionsMessage={({ inputValue }) => {
//           if (!inputValue) return "Start typing...";
//           if (inputValue.length < 3) return "Type min 3 chars to search";
//           return "No matches found";
//         }}
//         formatCreateLabel={(inputValue) => `+ Create: "${inputValue}"`}
//         styles={{
//           control: (base, state) => ({
//             ...base,
//             borderColor: (methods.formState.errors.job_role_id || methods.formState.errors.other_job_role) ? "#ef4444" : state.isFocused ? "#9bc87c" : base.borderColor,
//             boxShadow: state.isFocused ? `0 0 0 1px #9bc87c` : "none",
//             "&:hover": { borderColor: (methods.formState.errors.job_role_id || methods.formState.errors.other_job_role) ? "#ef4444" : "#9bc87c" },
//             minHeight: 40,
//           }),
//           option: (base, state) => ({
//             ...base,
//             backgroundColor: state.isSelected
//               ? "#9bc87c"
//               : state.isFocused
//               ? "#e6f4dc"
//               : "white",
//             color: state.isSelected ? "white" : "#1f2937",
//           }),
//           multiValue: (base) => ({
//             ...base,
//             backgroundColor: "#9bc87c",
//             color: "white",
//           }),
//           multiValueLabel: (base) => ({
//             ...base,
//             color: "white",
//           }),
//           multiValueRemove: (base) => ({
//             ...base,
//             color: "white",
//             ":hover": {
//               backgroundColor: "#88b86a",
//               color: "white",
//             },
//           }),
//         }}
//       />
//     )}
//   />
// )}
// </div>

//                     <div className="pt-6 border-t">
//                       <DomainSkillsSelector
//                         jobRoleId={methods.watch("job_role_id")}
//                         selectedDomainSkills={selectedDomainSkills}
//                         onDomainSkillsChange={handleDomainSkillsChange}
//                         error={methods.formState.errors.skill_ids?.message}
//                         showMustHaveToggle={formConfig.showMustHaveToggleInSkills}      
//                         showExperienceInput={formConfig.showMinExperienceInputInSkills} 
//                       />
//                     </div>

//                           <div>
//                             <Label htmlFor="minSkillMatchRequired">
//                               Minimum Percentage of Skill Match Required
//                               <span className="ml-1 text-red-500">*</span>
//                             </Label>
//                             <Input
//                               type="number"
//                               placeholder="e.g. 70"
//                               min="0"
//                               max="100"
//                               {...methods.register("minSkillMatchRequired", {
//                                 valueAsNumber: true,
//                               })}
//                               error={
//                                 methods.formState.errors.minSkillMatchRequired?.message
//                               }
//                             />
//                           </div>
//                   </div>

//                         {/* === SECTION 5: POSTING TYPE SPECIFIC (College) === */}
//                         {formConfig.showCollegeSelector && (
//                           <div className="mt-6 ">
//                             <div className="flex items-center mb-2">
//                               <Label htmlFor="eligiblecollege_ids">
//                                 College Name
//                               </Label>
//                             </div>
//                             <SearchableSelect
//                               options={collegeDropdownOptions}
//                               value={(() => {
//                                 const ids =
//                                   methods.watch("eligiblecollege_ids") || [];
//                                 const customs = (
//                                   methods.watch("other_eligible_college_names") ||
//                                   []
//                                 ).map((name) => ({ __custom: name }));
//                                 return [...ids, ...customs];
//                               })()}
//                               onChange={(mixedValues) => {
//                                 const ids = mixedValues.filter(v => typeof v === 'number');
//                                 const customNames = mixedValues.filter(v => typeof v === 'object' && v.__custom).map(v => v.__custom);
//                                 methods.setValue("eligiblecollege_ids", ids, { shouldValidate: true });
//                                 methods.setValue("other_eligible_college_names", customNames, { shouldValidate: true });
//                                 const newCache = [];
//                                 ids.forEach((id) => {
//                                   const found =
//                                     collegeDropdownOptions.find(
//                                       (c) => Number(c.id) === Number(id)
//                                     ) ||
//                                     cachedColleges.find(
//                                       (c) => Number(c.id) === Number(id)
//                                     );
//                                   if (found) newCache.push(found);
//                                 });
//                                 setCachedColleges(newCache);
//                               }}
//                               placeholder="Search tie-up colleges..."
//                               isMulti={true}
//                               isCreatable={true}
//                               getOptionLabel={(opt) => opt.name}
//                               getOptionValue={(opt) => opt.id}
//                               inputValue={collegeSearchText}
//                               onInputChange={(val) => setCollegeSearchText(val)}
//                               isLoading={isCollegeListLoading}
//                               maxDropdownOptions={200}
//                             />
//                             {collegeListError && (
//                               <p className="mt-1 text-sm text-red-600">{collegeListError}</p>
//                             )}
//                             {isCollegeListLoading && !collegeListError && (
//                               <p className="mt-1 text-sm text-gray-500">Loading tie-up colleges...</p>
//                             )}
//                             {!isCollegeListLoading && !collegeListError && tieUpCollegesList.length === 0 && (
//                               <p className="mt-1 text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded px-2 py-1.5">
//                                 No tie-up colleges available.
//                               </p>
//                             )}
//                           </div>
//                         )}

//                   {/* === SECTION 2: OPPORTUNITY SPECIFIC (Conditional) === */}
                  
//                   {/* Internship Only */}
//                   {formConfig.showDuration && (
//                       <div className="space-y-4">
//                         <div>
//                           <Label htmlFor="duration_id">
//                             Internship duration
//                             <span className="ml-1 text-red-500">*</span>
//                           </Label>
//                           <SearchableSelect
//                             options={enrichedDurations || []}
//                             value={
//                               methods.watch("duration_id") !== null
//                                 ? methods.watch("duration_id")
//                                 : methods.watch("other_duration")
//                                   ? {
//                                     __create: true,
//                                     value: methods.watch("other_duration"),
//                                   }
//                                   : null
//                             }
//                             displayValue={
//                               methods.watch("duration_id") === null
//                                 ? methods.watch("other_duration") || null
//                                 : null
//                             }
//                             onChange={(value) => {
//                               if (value?.__create) {
//                                 methods.setValue("other_duration", value.value, {
//                                   shouldValidate: true,
//                                 });
//                                 methods.setValue("duration_id", null, {
//                                   shouldValidate: true,
//                                 });
//                               } else {
//                                 methods.setValue("duration_id", value, {
//                                   shouldValidate: true,
//                                 });
//                                 methods.setValue("other_duration", "", {
//                                   shouldValidate: false,
//                                 });
//                               }
//                             }}
//                             placeholder="Select or create duration..."
//                             error={
//                               methods.formState.errors.duration_id?.message ||
//                               methods.formState.errors.other_duration?.message
//                             }
//                             getOptionLabel={(opt) => opt.value}
//                             getOptionValue={(opt) => opt.id}
//                             renderOption={(opt) => (
//                               <span className="flex items-center">
//                                 {opt.value}
//                                 {opt.is_recommended && (
//                                   <span className="ml-2 text-xs font-medium text-green-600 bg-green-100 px-1.5 py-0.5 rounded whitespace-nowrap">
//                                     (Recommended)
//                                   </span>
//                                 )}
//                               </span>
//                             )}
//                             isCreatable
//                           />
//                         </div>
//                         <div>
//                           <Label htmlFor="internship_start_date">
//                             Internship start date
//                           </Label>
//                           <div className={radioContainerStyles}>
//                             <label className="flex items-center gap-2 cursor-pointer">
//                               <input
//                                 type="radio"
//                                 value="false"
//                                 className={radioStyles}
//                                 checked={!is_custom_internship_date}
//                                 onChange={() =>
//                                   methods.setValue(
//                                     "is_custom_internship_date",
//                                     false
//                                   )
//                                 }
//                               />
//                               <span className="text-sm text-gray-700">
//                                 Immediately (within 30 days)
//                               </span>
//                             </label>
//                             <label className="flex items-center gap-2 cursor-pointer">
//                               <input
//                                 type="radio"
//                                 value="true"
//                                 className={radioStyles}
//                                 checked={is_custom_internship_date}
//                                 onChange={() =>
//                                   methods.setValue(
//                                     "is_custom_internship_date",
//                                     true
//                                   )
//                                 }
//                               />
//                               <span className="text-sm text-gray-700">
//                                 Custom
//                               </span>
//                             </label>
//                           </div>
//                         </div>
//                         {is_custom_internship_date && (
//                           <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
//                             <div className="flex-1">
//                               <Label>From Date</Label>
//                               <Input
//                                 type="date"
//                                 {...methods.register("internship_from_date")}
//                                 error={
//                                   methods.formState.errors.internship_from_date
//                                     ?.message
//                                 }
//                               />
//                             </div>
//                             <div className="flex-1">
//                               <Label>To Date</Label>
//                               <Input
//                                 type="date"
//                                 {...methods.register("internship_to_date")}
//                                 error={
//                                   methods.formState.errors.internship_to_date
//                                     ?.message
//                                 }
//                               />
//                             </div>
//                           </div>
//                         )}
//                       </div>
              
//                   )}

//                   {/* Project Only */}
//                   {formConfig.showProjectDates && (
//                     <div className="p-4 mt-4 border rounded-lg bg-gray-50">
//                       <h3 className="mb-3 font-bold">Project Timeline</h3>
//                       <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
//                         <div className="flex-1">
//                           <Label>Project Start</Label>
//                           <Input
//                             type="date"
//                             {...methods.register("project_start_date")}
//                             error={methods.formState.errors.project_start_date?.message}
//                           />
//                         </div>
//                         <div className="flex-1">
//                           <Label>Project End</Label>
//                           <Input
//                             type="date"
//                             {...methods.register("project_end_date")}
//                             error={methods.formState.errors.project_end_date?.message}
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   )}

                 

//                   {/* === SECTION 3: COMMON WORK DETAILS === */}
//                   <div className="space-y-4">
//                     <div>
//                       <Label htmlFor="job_type">
//                         {opportunity_type === "Internship"
//                           ? "Internship Type"
//                           : opportunity_type === "Job"
//                             ? "Job Type"
//                             : "Project Type"}
//                         <span className="ml-1 text-red-500">*</span>
//                       </Label>
//                       <div className={radioContainerStyles}>
//                         {["In office", "Hybrid", "Remote"].map((type) => (
//                           <label
//                             key={type}
//                             className="flex items-center gap-2 cursor-pointer"
//                           >
//                             <input
//                               type="radio"
//                               value={type}
//                               className={radioStyles}
//                               {...methods.register("job_type")}
//                             />
//                             <span className="text-sm text-gray-700">{type}</span>
//                           </label>
//                         ))}
//                       </div>
//                     </div>

//                     {job_type === "Hybrid" && (
//                       <div className="my-3">
//                         <Label htmlFor="days_in_office">
//                           No. of in-office days in a week:
//                         </Label>
//                         <div className="flex gap-1 sm:gap-3 md:gap-8">
//                           {[1, 2, 3, 4, 5].map((day) => (
//                             <button
//                               key={day}
//                               type="button"
//                               className={`w-10 h-10 rounded-full border text-sm font-semibold flex items-center justify-center transition
//                                 ${methods.getValues("days_in_office") === day
//                                   ? "bg-[#9bc87c] text-white border-[#9bc87c]"
//                                   : "bg-white text-gray-700 border-gray-300"
//                                 }
//                                 hover:border-[#9bc87c]`}
//                               onClick={() =>
//                                 methods.setValue("days_in_office", day, {
//                                   shouldValidate: true,
//                                 })
//                               }
//                             >
//                               {day}
//                             </button>
//                           ))}
//                         </div>
//                         {methods.formState.errors.days_in_office?.message && (
//                           <p className="mt-1 text-sm text-red-600">
//                             {methods.formState.errors.days_in_office?.message}
//                           </p>
//                         )}
//                       </div>
//                     )}

//                     <div>
//                       <Label htmlFor="job_time">
//                         Work Schedule
//                         <span className="ml-1 text-red-500">*</span>
//                       </Label>
//                       <div className={radioContainerStyles}>
//                         {["Day Shift", "Night Shift", "Part-time"].map(
//                           (schedule) => (
//                             <label
//                               key={schedule}
//                               className="flex items-center gap-2 cursor-pointer"
//                             >
//                               <input
//                                 type="radio"
//                                 value={schedule}
//                                 className={radioStyles}
//                                 {...methods.register("job_time")}
//                               />
//                               <span className="text-sm text-gray-700">
//                                 {schedule}
//                               </span>
//                             </label>
//                           )
//                         )}
//                       </div>
//                     </div>

//                     <div>
//                       <Label htmlFor="number_of_openings">
//                         Number of openings
//                         <span className="ml-1 text-red-500">*</span>
//                       </Label>
//                       <Input
//                         type="number"
//                         placeholder="e.g. 4"
//                         min="1"
//                         {...methods.register("number_of_openings", {
//                           valueAsNumber: true,
//                         })}
//                         error={
//                           methods.formState.errors.number_of_openings?.message
//                         }
//                       />
//                     </div>
//                   </div>

//                   {/* === SECTION 4: EDUCATION === */}
//                   <div className="mt-6">
//                     <Label htmlFor="eligible_education_levels">
//                       Eligible Education Levels
//                     </Label>
//                     <SearchableSelect
//                       options={EDUCATION_LEVELS}
//                       value={(() => {
//                         const levels = methods.watch("eligible_education_levels") || [];
//                         const customs = levels
//                           .filter((l) => !EDUCATION_LEVELS.some((opt) => opt.id === l))
//                           .map((l) => ({ __custom: l }));
//                         const selected = levels.filter((l) =>
//                           EDUCATION_LEVELS.some((opt) => opt.id === l)
//                         );
//                         return [...selected, ...customs];
//                       })()}
//                       onChange={(mixedValues) => {
//                         const ids = mixedValues.filter((v) => typeof v === "string");
//                         methods.setValue("eligible_education_levels", ids, {
//                           shouldValidate: true,
//                         });
//                       }}
//                       placeholder="Select levels (e.g., Bachelor's, Master's)"
//                       isMulti
//                       isCreatable
//                       getOptionLabel={(opt) => opt.name}
//                       getOptionValue={(opt) => opt.id}
//                     />
//                     <div className="mt-4">
//                       <Label htmlFor="eligiblecourse_ids">
//                         Courses (e.g., B.Tech, MBA, B.Sc)
//                       </Label>
//                       {courseError && (
//                         <div className="p-2 mb-2 text-xs text-red-700 rounded-md bg-red-50">
//                           {courseError}
//                         </div>
//                       )}
//                       {(() => {
//                         const selectedIds = methods.watch("eligiblecourse_ids") || [];
//                         const optionsPool = [...searchedCourses];
//                         cachedCourses.forEach(cached => {
//                           if (!optionsPool.some(opt => opt.id === cached.id)) {
//                             optionsPool.push(cached);
//                           }
//                         });
//                         return (
//                           <SearchableSelect
//                             options={optionsPool}
//                             inputValue={courseSearch}
//                             onInputChange={(val) => {
//                               setCourseSearch(val);
//                               if (val.length < 2) setSearchedCourses([]);
//                             }}
//                             isLoading={isCourseLoading}
//                             value={(() => {
//                               const ids = methods.watch("eligiblecourse_ids") || [];
//                               const customs = (methods.watch("other_eligible_course_names") || [])
//                                 .filter(n => n.trim())
//                                 .map(name => ({ __custom: name }));
//                               return [...ids, ...customs];
//                             })()}
//                             onChange={(mixedValues) => {
//                               const ids = mixedValues.filter(v => typeof v === 'number');
//                               const customNames = mixedValues
//                                 .filter(v => typeof v === 'object' && v.__custom)
//                                 .map(v => v.__custom.trim());
//                               methods.setValue("eligiblecourse_ids", ids, { shouldValidate: true });
//                               methods.setValue("other_eligible_course_names", customNames, { shouldValidate: true });
//                               const newCache = [];
//                               ids.forEach(id => {
//                                 const foundInSearch = searchedCourses.find(c => c.id === id);
//                                 const foundInCache = cachedCourses.find(c => c.id === id);
//                                 if (foundInSearch) newCache.push(foundInSearch);
//                                 else if (foundInCache) newCache.push(foundInCache);
//                               });
//                               setCachedCourses(newCache);
//                               if (mixedValues.length > (methods.watch("eligiblecourse_ids")?.length || 0)) {
//                                 setCourseSearch("");
//                                 setSearchedCourses([]);
//                               }
//                             }}
//                             placeholder="Search courses... [Min 3 chars]"
//                             isMulti
//                             isCreatable
//                             getOptionLabel={(opt) => opt.name}
//                             getOptionValue={(opt) => opt.id}
//                             noOptionsMessage={() =>
//                               courseSearch.length < 2
//                                 ? "Type at least 3 characters to search"
//                                 : courseError
//                                   ? "Search failed. Check connection."
//                                   : "No courses found"
//                             }
//                           />
//                         );
//                       })()}
//                     </div>
//                     {resolvedOpportunityType === "Internship" && 
//                           <div className="flex items-center gap-2 p-3 mt-3 rounded-lg bg-gray-50">
//                             <input
//                               type="checkbox"
//                               className={checkboxStyles}
//                               {...methods.register("include_pursuing_students")}
//                             />
//                             <span className="text-sm text-gray-700">
//                               Include students currently pursuing the above qualifications
//                             </span>
//                           </div>
//                     }
//                   </div>


//                         {/* Job & Project Only (Hide for Internship) */}
//                         {formConfig.showExperience && (
//                           <div className="mt-4 ">
//                             {/* <h3 className="mb-3 font-bold">Experience Requirements</h3> */}
//                             <Label htmlFor="experience_required">Experience Required?</Label>
//                             <div className={radioContainerStyles}>
//                               <label className="flex items-center gap-2 cursor-pointer">
//                                 <input
//                                   type="radio"
//                                   className={radioStyles}
//                                   checked={!methods.watch("experience_required")}
//                                   onChange={() => methods.setValue("experience_required", false)}
//                                 />
//                                 <span className="text-sm text-gray-700">No / Freshers allowed</span>
//                               </label>
//                               <label className="flex items-center gap-2 cursor-pointer">
//                                 <input
//                                   type="radio"
//                                   className={radioStyles}
//                                   checked={!!methods.watch("experience_required")}
//                                   onChange={() => methods.setValue("experience_required", true)}
//                                 />
//                                 <span className="text-sm text-gray-700">Yes</span>
//                               </label>
//                             </div>
//                             {methods.watch("experience_required") && (
//                               <div className="mt-4 space-y-4">
//                                 <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
//                                   <div className="flex-1">
//                                     <Label>Min Experience (years)</Label>
//                                     <Input
//                                       type="number"
//                                       min="0"
//                                       placeholder="e.g., 2"
//                                       {...methods.register("experience_min", { valueAsNumber: true })}
//                                       error={methods.formState.errors.experience_min?.message}
//                                     />
//                                   </div>
//                                   <div className="flex-1">
//                                     <Label>Max Experience (years) — Optional</Label>
//                                     <Input
//                                       type="number"
//                                       min="0"
//                                       placeholder="e.g., 5"
//                                       {...methods.register("experience_max", { valueAsNumber: true })}
//                                       error={methods.formState.errors.experience_max?.message}
//                                     />
//                                   </div>
//                                 </div>
//                               </div>
//                             )}
//                           </div>
//                         )}

                  

//                   {/* === SECTION 6: COMPENSATION === */}
//                   <div className="space-y-4">
//                     <div>
//                       <Label htmlFor="stipend_type">
//                         {opportunity_type === "Internship"
//                           ? "Stipend"
//                           : opportunity_type === "Job"
//                             ? "Fixed Pay"
//                             : "Project Budget"}
//                         <span className="ml-1 text-red-500">*</span>
//                       </Label>
//                       <div className={radioContainerStyles}>
//                         {(opportunity_type === "Internship"
//                           ? ["Paid", "Unpaid"]
//                           : opportunity_type === "Job" ?["Fixed", "Variable"]
//                           : ["Variable"]
//                         ).map((type) => (
//                           <label
//                             key={type}
//                             className="flex items-center gap-2 cursor-pointer"
//                           >
//                             <input
//                               type="radio"
//                               value={type}
//                               className={radioStyles}
//                               {...methods.register("stipend_type")}
//                             />
//                             <span className="text-sm text-gray-700">{type}</span>
//                           </label>
//                         ))}
//                       </div>
//                     </div>

//                     {(() => {
//                       const isProject = opportunity_type === "Project";
//                       const isFixed = stipend_type === "Fixed";
//                       const showSingle = isProject && isFixed;
//                       const shouldShow =
//                         (opportunity_type === "Internship" && stipend_type === "Paid") ||
//                         (opportunity_type === "Job" && ["Fixed", "Variable"].includes(stipend_type)) ||
//                         opportunity_type === "Project";
//                       if (!shouldShow) return null;
//                       return (
//                         <div>
//                           <Label htmlFor={showSingle ? "stipend_fixed" : "stipend_range"}>
//                             {isProject
//                               ? "Project Budget Range"
//                               : opportunity_type === "Internship" ? "Stipend Range" : `${stipend_type} Pay Range`}
//                           </Label>
//                           {showSingle ? (
//                             <Input
//                               type="number"
//                               placeholder="₹ Total amount"
//                               min="0"
//                               {...methods.register("stipend_min", { valueAsNumber: true })}
//                               error={methods.formState.errors.stipend_min?.message}
//                             />
//                           ) : (
//                             <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
//                               <Input
//                                 type="number"
//                                 placeholder="₹ Min"
//                                 min="0"
//                                 {...methods.register("stipend_min", { valueAsNumber: true })}
//                                 error={methods.formState.errors.stipend_min?.message}
//                               />
//                               <Input
//                                 type="number"
//                                 placeholder="₹ Max"
//                                 min="0"
//                                 {...methods.register("stipend_max", { valueAsNumber: true })}
//                                 error={methods.formState.errors.stipend_max?.message}
//                               />
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })()}

//                     {opportunity_type === "Internship" &&
//                       stipend_type === "Paid" && (
//                         <div>
//                           <Label htmlFor="incentive_per_year">
//                             Incentives
//                           </Label>
//                           <Input
//                             type="text"
//                             placeholder="e.g. Performance based, ₹5000-10000"
//                             {...methods.register("incentive_per_year")}
//                           />
//                         </div>
//                       )}
//                   </div>

//                   {/* === SECTION 7: DETAILS & CONTACT === */}
//                   <div className="space-y-4">

//                     {formConfig.showBenefits && (
//                             <div>
//                               <Label htmlFor="perks">
//                                 {formConfig.perksLabel} (Select all that apply)
//                               </Label>
//                               <div className="grid grid-cols-1 gap-2 p-3 rounded-lg sm:grid-cols-2 sm:gap-3 bg-gray-50">
//                                 {(opportunity_type === "Internship"
//                                   ? [
//                                     "Certificate of completion",
//                                     "Letter of recommendation",
//                                     "Flexible work hours",
//                                     "5 days a week",
//                                     "Informal dress code",
//                                     "Free snacks & beverages",
//                                   ]
//                                   : [
//                                     "5 days a week",
//                                     "Health Insurance",
//                                     "Life Insurance",
//                                     "Flexible work hours",
//                                   ]
//                                 ).map((perk) => (
//                                   <label
//                                     key={perk}
//                                     className="flex items-center gap-2 cursor-pointer"
//                                   >
//                                     <input
//                                       type="checkbox"
//                                       value={perk}
//                                       className={checkboxStyles}
//                                       {...methods.register("perks")}
//                                     />
//                                     <span className="text-sm text-gray-700">{perk}</span>
//                                   </label>
//                                 ))}
//                               </div>
//                             </div>
//                     ) }
                    

//                     {/* Screening Questions */}
//                     {formConfig.showScreeningQuestions && (
//                       <div className="mb-6">
//                       <div className="flex items-center justify-between mb-2">
//                         <div className="flex items-center gap-1.5">
//                           <label className="text-sm font-medium text-gray-700">Screening Questions</label>
//                           <div className="relative group">
//                             <FaInfoCircle className="text-sm text-[#9bc87c] cursor-pointer" />
//                             <div className="absolute left-0 z-10 hidden p-3 mb-2 text-xs bg-white border border-gray-200 rounded-md shadow-lg w-80 bottom-full group-hover:block">
//                               <p className="font-medium">💡 Good screening questions:</p>
//                               <ul className="pl-4 mt-1 space-y-1 text-gray-700 list-disc">
//                                 <li>Are specific and actionable</li>
//                                 <li>Ask about availability, tools, or key experience</li>
//                                 <li>Fit in 1–2 lines (≤200 chars)</li>
//                               </ul>
//                             </div>
//                           </div>
//                         </div>
//                         <button
//                           type="button"
//                           onClick={async () => {
//                             const input = prepareAIInput();
//                             if (!input.title || input.skills.length === 0) {
//                               alert("Please select a job role and at least one skill first.");
//                               return;
//                             }
//                             setIsAiGenerating(true);
//                             try {
//                               const result = await generateContent(input);
//                               if (result && Array.isArray(result.screeningQuestions)) {
//                                 const current = methods.getValues("screening_questions") || [];
//                                 if (current.length === 0) {
//                                   methods.setValue("screening_questions", result.screeningQuestions.slice(0, 5), { shouldValidate: true });
//                                 } else {
//                                   const merged = [...current, ...result.screeningQuestions].slice(0, 5);
//                                   methods.setValue("screening_questions", merged, { shouldValidate: true });
//                                 }
//                               }
//                             } finally {
//                               setIsAiGenerating(false);
//                             }
//                           }}
//                           disabled={isAiGenerating}
//                           className="px-2 py-1 text-xs font-medium text-green-800 bg-[#eaf4e3] rounded hover:bg-[#d8ecc7] disabled:opacity-50"
//                         >
//                           {isAiGenerating ? "Generating..." : "AI Suggest"}
//                         </button>
//                       </div>
//                       <Controller
//                         name="screening_questions"
//                         control={methods.control}
//                         render={({ field: { value = [], onChange } }) => {
//                           const handleAddQuestion = () => {
//                             const newVal = [...value, ""];
//                             onChange(newVal);
//                             setTimeout(() => {
//                               const inputs = document.querySelectorAll('input[name^="screening_questions"]');
//                               inputs[inputs.length - 1]?.focus();
//                             }, 10);
//                           };
//                           const handleRemove = (index, text) => {
//                             if (undoTimeout) clearTimeout(undoTimeout);
//                             setDeletedQuestion({ index, text });
//                             const newVal = value.filter((_, i) => i !== index);
//                             onChange(newVal);
//                             const timeout = setTimeout(() => {
//                               setDeletedQuestion({ index: -1, text: "" });
//                             }, 5000);
//                             setUndoTimeout(timeout);
//                           };
//                           const handleUndo = () => {
//                             if (deletedQuestion.index !== -1) {
//                               const newVal = [...value];
//                               newVal.splice(deletedQuestion.index, 0, deletedQuestion.text);
//                               onChange(newVal.slice(0, 5));
//                               setDeletedQuestion({ index: -1, text: "" });
//                               if (undoTimeout) clearTimeout(undoTimeout);
//                             }
//                           };
//                           return (
//                             <div className="space-y-3">
//                               {value && value.map((q, idx) => (
//                                 <div
//                                   key={idx}
//                                   className="flex flex-col gap-1 p-3 border border-gray-200 rounded-lg bg-gray-50 group"
//                                 >
//                                   <input
//                                     type="text"
//                                     value={q}
//                                     onChange={(e) => {
//                                       const newVal = [...value];
//                                       newVal[idx] = e.target.value;
//                                       onChange(newVal);
//                                     }}
//                                     onBlur={(e) => {
//                                       const trimmed = e.target.value.slice(0, 200);
//                                       if (trimmed !== e.target.value) {
//                                         const newVal = [...value];
//                                         newVal[idx] = trimmed;
//                                         onChange(newVal);
//                                       }
//                                     }}
//                                     onKeyDown={(e) => {
//                                       if (e.key === 'Enter' && !e.shiftKey && value.length < 5) {
//                                         e.preventDefault();
//                                         handleAddQuestion();
//                                       }
//                                     }}
//                                     placeholder={`Question ${idx + 1} (e.g., "Are you available for full-time remote work?")`}
//                                     className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgba(155,200,124,0.3)] focus:border-[#9bc87c]"
//                                     maxLength={200}
//                                   />
//                                   <div className="flex items-center justify-between">
//                                     <span className={`text-xs ${q.length > 180 ? 'text-orange-600 font-medium' : 'text-gray-500'}`}>
//                                       {q.length}/200
//                                     </span>
//                                     <button
//                                       type="button"
//                                       onClick={() => handleRemove(idx, q)}
//                                       className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800"
//                                       aria-label="Remove question"
//                                     >
//                                       <FaTimes className="w-3 h-3" /> Remove
//                                     </button>
//                                   </div>
//                                 </div>
//                               ))}
//                               {value.length < 5 && (
//                                 <button
//                                   type="button"
//                                   onClick={handleAddQuestion}
//                                   className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-green-700 transition-colors border-2 border-[#9bc87c] border-dashed rounded-lg hover:bg-[#f3f9ee]"
//                                 >
//                                   <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                                   </svg>
//                                   Add another question ({value.length}/5)
//                                 </button>
//                               )}
//                               {value.length === 5 && (
//                                 <p className="text-xs italic text-gray-500">✅ Maximum of 5 questions reached.</p>
//                               )}
//                               {deletedQuestion.index !== -1 && (
//                                 <div className="flex items-center justify-between p-2 text-sm border border-[#9bc87c] rounded-md bg-[#f3f9ee]">
//                                   <span className="text-green-900">
//                                     Removed a question. <button onClick={handleUndo} className="underline">Undo?</button>
//                                   </span>
//                                   <button
//                                     onClick={() => {
//                                       setDeletedQuestion({ index: -1, text: "" });
//                                       if (undoTimeout) clearTimeout(undoTimeout);
//                                     }}
//                                     className="text-green-700 hover:text-green-900"
//                                   >
//                                     <FaTimes className="w-3 h-3" />
//                                   </button>
//                                 </div>
//                               )}
//                               {methods.formState.errors.screening_questions && (
//                                 <p className="mt-2 text-sm text-red-600">
//                                   {Array.isArray(methods.formState.errors.screening_questions)
//                                     ? methods.formState.errors.screening_questions[0]?.message
//                                     : methods.formState.errors.screening_questions.message}
//                                 </p>
//                               )}
//                             </div>
//                           );
//                         }}
//                       />
//                     </div>
//                     )}
                    

//                     {/* Location */}
//                     {/* <div>
//                       <Label htmlFor="eligiblecity_ids">
//                         City/Cities
//                         <span className="ml-1 text-red-500">*</span>
//                       </Label>
//                       {locationError && (
//                         <div className="p-2 mb-2 text-xs text-red-700 rounded-md bg-red-50">
//                           {locationError}
//                         </div>
//                       )}
//                       {(() => {
//                         const selectedIds = methods.watch("eligiblecity_ids") || [];
//                         return (
//                           <SearchableSelect
//                             options={[...locationOptions, ...cachedLocations]}
//                             inputValue={locationSearchText}
//                             onInputChange={(val) => {
//                               setLocationSearchText(val);
//                               if (val.length < 3) setLocationOptions([]);
//                             }}
//                             isLoading={isLocationLoading}
//                             value={methods.watch("eligiblecity_ids") || []}
//                             onChange={(selectedIds) => {
//                               methods.setValue("eligiblecity_ids", selectedIds, { shouldValidate: true });
//                               methods.setValue("other_eligible_city_names", [], { shouldValidate: false });
//                               const newCache = [];
//                               selectedIds.forEach(id => {
//                                 const found = locationOptions.find(l => l.id === id) || cachedLocations.find(l => l.id === id);
//                                 if (found) newCache.push(found);
//                               });
//                               setCachedLocations(newCache);
//                               if (selectedIds.length > (methods.watch("eligiblecity_ids")?.length || 0)) {
//                                 setLocationSearchText("");
//                                 setLocationOptions([]);
//                               }
//                             }}
//                             placeholder="Search cities... [Min 3 chars]"
//                             error={methods.formState.errors.eligiblecity_ids?.message}
//                             isMulti={true}
//                             getOptionLabel={(opt) => opt.name}
//                             getOptionValue={(opt) => opt.id}
//                             noOptionsMessage={() =>
//                               locationSearchText.length < 3
//                                 ? "Type at least 3 characters to search"
//                                 : locationError
//                                   ? "Search failed. Check connection."
//                                   : "No cities found"
//                             }
//                           />
//                         );
//                       })()}
//                     </div> */}
//                     {/* Location */}
// <div>
//   <Label htmlFor="eligiblecity_ids">
//     City/Cities
//     <span className="ml-1 text-red-500">*</span>
//   </Label>
//   <Controller
//     name="eligiblecity_ids"
//     control={methods.control}
//     render={({ field }) => (
//       <GreenAsyncCreatableMultiSelect
//         placeholder="Search cities... [Min 3 chars]"
//         error={methods.formState.errors.eligiblecity_ids?.message}
//         value={(() => {
//           const ids = field.value || [];
//           const customNames = methods.watch("other_eligible_city_names") || [];
//           // Ab yahan real naam dikhega!
//           const mappedIds = ids.map(id => {
//             const found = cachedLocations.find(l => Number(l.id) === Number(id));
//             return { value: String(id), label: found ? found.name : `City ${id}` };
//           }); 
//           const mappedCustoms = customNames.map(name => ({ value: "__custom__", label: name }));
//           return [...mappedIds, ...mappedCustoms];
//         })()}
//         onChange={(selectedOptions) => {
//           const arr = selectedOptions || [];
//           const ids = arr.filter(o => o.value !== "__custom__").map(o => Number(o.value));
//           const customs = arr.filter(o => o.value === "__custom__").map(o => o.label);
          
//           field.onChange(ids);
//           methods.setValue("other_eligible_city_names", customs, { shouldValidate: true });

//           // Selected city ka naam cache mein save karo
//           const newCache = [...cachedLocations];
//           arr.forEach(opt => {
//             if (opt.value !== "__custom__" && !newCache.some(c => Number(c.id) === Number(opt.value))) {
//               newCache.push({ id: opt.value, name: opt.label });
//             }
//           });
//           setCachedLocations(newCache);
//         }}
//         loadOptions={async (query) => {
//           const res = await axios.get(`${BASE_URL}/master/location/search`, { params: { search: query } });
//           return (res.data?.data || []).map(loc => ({
//             value: String(loc.id || loc.location_id),
//             label: loc.name || loc.city_name || loc.value,
//           }));
//         }}
//       />
//     )}
//   />
// </div>

//                     {/* Phone */}
//                     <div>
//                       <Label htmlFor="phone_contact">
//                         Primary phone number
//                         <span className="ml-1 text-red-500">*</span>
//                       </Label>
//                       <div className="flex">
//                         <span className="inline-flex items-center px-2 py-2 text-sm text-gray-600 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50">
//                           <img src="https://flagcdn.com/in.svg" alt="IN" className="w-4 h-4 mr-1" />
//                           +91
//                         </span>
//                         <input
//                           type="tel"
//                           placeholder="9812345678"
//                           maxLength="10"
//                           onInput={(e) => {
//                             e.target.value = e.target.value.replace(/\D/g, "");
//                           }}
//                           className="flex-1 px-3 py-2 text-sm border border-l-0 border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[rgba(155,200,124,0.3)] focus:border-transparent"
//                           {...methods.register("phone_contact", {
//                             onChange: (e) => {
//                               const val = e.target.value.replace(/\D/g, "").slice(0, 10);
//                               e.target.value = val;
//                               methods.setValue("phone_contact", val, { shouldValidate: true });
//                             },
//                           })}
//                         />
//                       </div>
//                       {methods.formState.errors.phone_contact?.message && (
//                         <p className="mt-1 text-sm text-red-600">
//                           {methods.formState.errors.phone_contact?.message}
//                         </p>
//                       )}
//                     </div>


//                       {formConfig.showAlternateContact && (
//                             <div>
//                               <Label htmlFor="alternate_phone_number">
//                                 Alternate phone number for this listing (Optional)
//                               </Label>
//                               <div className="flex">
//                                 <span className="inline-flex items-center px-2 py-2 text-sm text-gray-600 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50">
//                                   <img src="https://flagcdn.com/in.svg" alt="IN" className="w-4 h-4 mr-1" />
//                                   +91
//                                 </span>
//                                 <input
//                                   type="tel"
//                                   placeholder="9876543210"
//                                   maxLength="10"
//                                   onInput={(e) => {
//                                     e.target.value = e.target.value.replace(/\D/g, "");
//                                   }}
//                                   className="flex-1 px-3 py-2 text-sm border border-l-0 border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[rgba(155,200,124,0.3)] focus:border-transparent"
//                                   {...methods.register("alternate_phone_number")}
//                                 />
//                               </div>
//                             </div>
//                       )}
                    

                    

//                     {/* Description */}
//                     <div>
//                       <div className="flex items-center justify-between">
//                         <Label htmlFor="job_description">
//                           {formConfig.descLabel}
//                           <span className="ml-1 text-red-500">*</span>
//                         </Label>
//                         <button
//                           type="button"
//                           onClick={async () => {
//                             const input = prepareAIInput();
//                             if (!input.title) {
//                               alert(" Please select or enter a job/internship/project title first.");
//                               return;
//                             }
//                             setIsAiGenerating(true);
//                             try {
//                               const result = await generateContent(input);
//                               if (result?.description) {
//                                 setAiSuggestions(prev => ({ ...prev, description: result.description }));
//                               }
//                             } finally {
//                               setIsAiGenerating(false);
//                             }
//                           }}
//                           disabled={!!methods.getValues("job_description") || isAiGenerating}
//                           className={`ml-2 text-xs px-2 py-1 rounded ${methods.getValues("job_description") ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#eaf4e3] text-green-800 hover:bg-[#d8ecc7]"}`}
//                         >
//                           {isAiGenerating ? "Generating..." : "AI Suggest"}
//                         </button>
//                       </div>
//                       <Textarea
//                         rows={6}
//                         placeholder={
//                           opportunity_type === "Internship"
//                             ? "Selected intern day-to-day responsibilities include..."
//                             : opportunity_type === "Job"
//                               ? "Key responsibilities:\n1.\n2.\n3."
//                               : "Project requirements:\n1.\n2.\n3."
//                         }
//                         {...methods.register("job_description", {
//                           onChange: () => {
//                             if (aiSuggestions.description) {
//                               setAiSuggestions((prev) => ({
//                                 ...prev,
//                                 description: null,
//                               }));
//                             }
//                           },
//                         })}
//                         error={methods.formState.errors.job_description?.message}
//                       />
//                       {/* {aiSuggestions.description && (
//                         <div className="relative mt-2 overflow-hidden border border-[#9bc87c] rounded-md bg-[#f3f9ee]">
//                           <div className="p-3 overflow-y-auto text-sm text-gray-700 whitespace-pre-wrap max-h-48">
//                             {aiSuggestions.description}
//                           </div>
//                           <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[#eaf4e3] border-t border-[#9bc87c]">
//                             <button
//                               type="button"
//                               onClick={() => setAiSuggestions((prev) => ({ ...prev, description: null }))}
//                               className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800"
//                             >
//                               <FaTimes className="w-3 h-3" />
//                               Dismiss
//                             </button>
//                             <button
//                               type="button"
//                               onClick={() => {
//                                 methods.setValue("job_description", aiSuggestions.description || "", {
//                                   shouldValidate: true,
//                                 });
//                                 setAiSuggestions((prev) => ({ ...prev, description: null }));
//                               }}
//                               className="text-xs font-medium text-green-800 hover:text-green-900 bg-white px-3 py-1.5 rounded-md shadow-sm border border-[#9bc87c] hover:bg-[#f3f9ee] transition"
//                             >
//                               ✅ Use this
//                             </button>
//                           </div>
//                         </div>
//                       )} */}




//                       {aiSuggestions.description && (
//                         <div className="relative mt-2 overflow-hidden border border-[#9bc87c] rounded-md bg-[#f3f9ee]">
                          
//                           <div className="p-3 overflow-y-auto text-sm text-gray-700 max-h-48">
//                             <ul className="pl-5 space-y-1 list-disc">
//                               {aiSuggestions.description
//                                 ?.split(/\.|\n/)
//                                 .filter((point) => point.trim() !== "")
//                                 .map((point, index) => (
//                                   <li key={index}>{point.trim()}</li>
//                                 ))}
//                             </ul>
//                           </div>

//                           {/* SAME BUTTONS (no change) */}
//                           <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[#eaf4e3] border-t border-[#9bc87c]">
//                             <button
//                               type="button"
//                               onClick={() => setAiSuggestions((prev) => ({ ...prev, description: null }))}
//                               className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800"
//                             >
//                               <FaTimes className="w-3 h-3" />
//                               Dismiss
//                             </button>

                          
//                             <button
//                         type="button"
//                         onClick={() => {
//                           const formattedText = aiSuggestions.description
//                             ?.split(/\.|\n/)
//                             .filter((point) => point.trim() !== "")
//                             .map((point) => `• ${point.trim()}`)
//                             .join("\n");

//                           methods.setValue("job_description", formattedText || "", {
//                             shouldValidate: true,
//                           });

//                           setAiSuggestions((prev) => ({ ...prev, description: null }));
//                         }}
//                         className="text-xs font-medium text-green-800 hover:text-green-900 bg-white px-3 py-1.5 rounded-md shadow-sm border border-[#9bc87c] hover:bg-[#f3f9ee] transition"
//                       >
//                         ✅ Use this
//                       </button>
//                           </div>
//                         </div>
//                       )}



//                       {aiError && (
//                         <p className="mt-1 text-xs text-red-600">{aiError}</p>
//                       )}
//                     </div>
//                   </div>

//                   {/* Submit Buttons */}
//                   <div className="flex flex-row justify-between gap-2 pt-4 mt-6 border-t border-gray-200 sm:gap-4">
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={methods.handleSubmit(onSaveDraft, (errors) => {
//                         console.log("Draft save validation failed:", errors);
//                       })}
//                       disabled={isSubmitting}
//                     >
//                       {isSubmitting ? "Saving..." : "Save Draft"}
//                     </Button>
//                     <Button
//                       type="button"
//                       loading={isSubmitting}
//                       variant="primary"
//                       onClick={async () => {
//                         const isValid = await methods.trigger();
//                         if (isValid) {
//                           setShowPreviewModal(true);
//                         } else {
//                           const errors = methods.formState.errors;
//                           const missingLabels = getMissingFieldLabels(errors, FIELD_LABELS);
//                           if (missingLabels.length > 0) {
//                             Swal.fire({
//                               icon: 'warning',
//                               title: 'Missing Required Information',
//                               html: `
//                                 <p class="text-left mb-2">Please complete the following fields:</p>
//                                 <ul class="text-left text-gray-700" style="padding-left: 1.5rem; margin-top: 0.5rem;">
//                                   ${missingLabels.map(label => `<li>${label}</li>`).join('')}
//                                 </ul>
//                               `,
//                               confirmButtonText: 'Go Back',
//                               customClass: {
//                                 popup: 'swal2-border-radius',
//                                 confirmButton: 'swal2-confirm-btn',
//                               },
//                             });
//                           }
//                         }
//                       }}
//                     >
//                       {isSubmitting ? "Posting..." : `Post ${opportunity_type}`}
//                     </Button>
//                   </div>
//                 </form>
//               </FormProvider>
//             ))}

//             {/* Confirmation Modal */}
//             {showConfirmationModal && (
//               <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//                 <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
//                   <div className="flex items-start">
//                     <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-red-100 rounded-full">
//                       <FaInfoCircle className="w-6 h-6 text-red-600" />
//                     </div>
//                     <div className="ml-4">
//                       <h3 className="text-lg font-medium text-gray-900">
//                         Important Notice
//                       </h3>
//                       <div className="mt-2 text-sm text-gray-700">
//                         <p>
//                           ✅ Once submitted, the job/internship/project details <strong>cannot be edited</strong>.
//                         </p>
//                         <p className="mt-1">
//                           Please review all fields carefully before proceeding.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="flex justify-end mt-6 space-x-3">
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={() => setShowConfirmationModal(false)}
//                     >
//                       Cancel
//                     </Button>
//                     <Button
//                       type="button"
//                       variant="primary"
//                       onClick={() => {
//                         setShowConfirmationModal(false);
//                         methods.handleSubmit(onSubmit)();
//                       }}
//                     >
//                       I Understand — Post {opportunity_type}
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Preview Modal */}
//             {showPreviewModal && (
//               <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
//                 <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
//                   <div className="flex items-center justify-between p-4 border-b">
//                     <h3 className="text-lg font-semibold text-gray-900">
//                       ✅ Review Your {opportunity_type}
//                     </h3>
//                     <button
//                       type="button"
//                       onClick={() => setShowPreviewModal(false)}
//                       className="text-gray-500 hover:text-gray-700"
//                     >
//                       <FaTimes className="w-5 h-5" />
//                     </button>
//                   </div>
//                   <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
//                     <div>
//                       <h4 className="font-medium text-gray-700">Opportunity</h4>
//                       <p className="text-lg font-semibold text-green-800">
//                         {opportunity_type} •{" "}
//                         {methods.watch("job_role_id") !== null
//                           ? (cachedJobRole?.title || `Job #${methods.watch("job_role_id")}`)
//                           : methods.watch("other_job_role") || "—"}
//                       </p>
//                     </div>
//                     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//                       <div>
//                         <span className="text-xs font-medium text-gray-500">Work Type</span>
//                         <p className="font-medium">{methods.watch("job_type")}</p>
//                       </div>
//                       <div>
//                         <span className="text-xs font-medium text-gray-500">Schedule</span>
//                         <p className="font-medium">{methods.watch("job_time")}</p>
//                       </div>
//                       {job_type === "Hybrid" && (
//                         <div>
//                           <span className="text-xs font-medium text-gray-500">In-Office Days/Week</span>
//                           <p className="font-medium">{methods.watch("days_in_office")} days</p>
//                         </div>
//                       )}
//                       <div>
//                         <span className="text-xs font-medium text-gray-500">Openings</span>
//                         <p className="font-medium">{methods.watch("number_of_openings")}</p>
//                       </div>
//                       <div>
//                         <span className="text-xs font-medium text-gray-500">Status</span>
//                         <p className="font-medium">
//                           {resolvedPostingType === "future" ? "Inactive (Future)" : "Active"}
//                         </p>
//                       </div>
//                     </div>
//                     {(() => {
//                       const type = methods.watch("stipend_type");
//                       const min = methods.watch("stipend_min");
//                       const max = methods.watch("stipend_max");
//                       const isProject = opportunity_type === "Project";
//                       const isFixed = type === "Fixed";
//                       if (!min && !max) return null;
//                       let label, value;
//                       if (isProject) {
//                         label = "Project Budget";
//                         value = isFixed ? `₹${min?.toLocaleString()}` : `₹${min?.toLocaleString()} – ₹${max?.toLocaleString()}`;
//                       } else if (opportunity_type === "Internship") {
//                         label = type === "Unpaid" ? "Stipend" : "Stipend Range";
//                         value = type === "Unpaid" ? "Unpaid" : `₹${min?.toLocaleString()} – ₹${max?.toLocaleString()}`;
//                       } else {
//                         label = "Pay";
//                         value = `${type} • ₹${min?.toLocaleString()} – ₹${max?.toLocaleString()}`;
//                       }
//                       return (
//                         <div>
//                           <span className="text-xs font-medium text-gray-500">{label}</span>
//                           <p className="font-medium">{value}</p>
//                         </div>
//                       );
//                     })()}
//                     {opportunity_type === "Internship" && (
//                       <div>
//                         <span className="text-xs font-medium text-gray-500">Internship Start</span>
//                         <p className="font-medium">
//                           {methods.watch("is_custom_internship_date")
//                             ? `${methods.watch("internship_from_date")} to ${methods.watch("internship_to_date")}`
//                             : "Within 30 days"}
//                         </p>
//                       </div>
//                     )}
//                     {opportunity_type === "Project" && (
//                       <div>
//                         <span className="text-xs font-medium text-gray-500">Project Duration</span>
//                         <p className="font-medium">
//                           {methods.watch("project_start_date")} → {methods.watch("project_end_date")}
//                         </p>
//                       </div>
//                     )}
//                     {(
//                       (methods.watch("eligiblecity_ids")?.length || 0) +
//                       (methods.watch("other_eligible_city_names")?.filter(n => n.trim()).length || 0)
//                     ) > 0 && (
//                         <div>
//                           <span className="text-xs font-medium text-gray-500">Cities</span>
//                           <div className="flex flex-wrap gap-1 mt-1">
//                             {[
//                               ...(methods.watch("eligiblecity_ids") || []).map(id =>
//                                 cachedLocations.find(l => l.id === id)?.name || `City ${id}`
//                               ),
//                               ...(methods.watch("other_eligible_city_names") || []).filter(n => n.trim())
//                             ].map((city, i) => (
//                               <span key={i} className="px-2 py-1 text-xs bg-gray-100 rounded">{city}</span>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     {(
//                       (methods.watch("eligiblecollege_ids")?.length || 0) +
//                       (methods.watch("other_eligible_college_names")?.filter(n => n.trim()).length || 0)
//                     ) > 0 && (
//                         <div>
//                           <span className="text-xs font-medium text-gray-500">Colleges</span>
//                           <div className="flex flex-wrap gap-1 mt-1">
//                             {[
//                               ...(methods.watch("eligiblecollege_ids") || []).map(id =>
//                                 cachedColleges.find(c => c.id === id)?.name || `College ${id}`
//                               ),
//                               ...(methods.watch("other_eligible_college_names") || []).filter(n => n.trim())
//                             ].map((col, i) => (
//                               <span key={i} className="px-2 py-1 text-xs bg-[#eaf4e3] text-green-900 rounded">{col}</span>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     {(
//                       (methods.watch("eligiblecourse_ids")?.length || 0) +
//                       (methods.watch("other_eligible_course_names")?.filter(n => n.trim()).length || 0)
//                     ) > 0 && (
//                         <div>
//                           <span className="text-xs font-medium text-gray-500">Courses</span>
//                           <div className="flex flex-wrap gap-1 mt-1">
//                             {[
//                               ...(methods.watch("eligiblecourse_ids") || []).map(id => {
//                                 const cached = cachedCourses.find(c => c.id === id);
//                                 return cached?.name || `Course ${id}`;
//                               }),
//                               ...(methods.watch("other_eligible_course_names") || []).filter(n => n.trim())
//                             ].map((crs, i) => (
//                               <span key={i} className="px-2 py-1 text-xs bg-purple-100 rounded">{crs}</span>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     {(methods.watch("eligible_education_levels")?.length || 0) > 0 && (
//                       <div>
//                         <span className="text-xs font-medium text-gray-500">Education Levels</span>
//                         <div className="flex flex-wrap gap-1 mt-1">
//                           {(methods.watch("eligible_education_levels") || []).map((level, i) => (
//                             <span key={i} className="px-2 py-1 text-xs rounded bg-amber-100">
//                               {EDUCATION_LEVELS.find(e => e.id === level)?.name || level}
//                             </span>
//                           ))}
//                         </div>
//                       </div>
//                     )}
//                     <div>
//                       <span className="text-xs font-medium text-gray-500">Eligibility for Students</span>
//                       <p className="font-medium">
//                         {methods.watch("include_pursuing_students") ? "Includes currently pursuing students" : "Only completed qualifications"}
//                       </p>
//                     </div>
//                     {opportunity_type !== "Internship" && (
//                       <div>
//                         <span className="text-xs font-medium text-gray-500">Experience Required</span>
//                         {methods.watch("experience_required") ? (
//                           <p className="font-medium">
//                             {methods.watch("experience_min")} – {methods.watch("experience_max") || "∞"} years
//                           </p>
//                         ) : (
//                           <p className="font-medium">Freshers allowed</p>
//                         )}
//                       </div>
//                     )}
//                     {(selectedDomainSkills?.length || 0) > 0 && (
//                       <div>
//                         <span className="text-xs font-medium text-gray-500">Skills & Requirements</span>
//                         <div className="mt-2 space-y-3">
//                           {selectedDomainSkills.map((domainCard, domainIdx) => {
//                             const domainName = domainCard.domain?.__custom || domainCard.domain?.name || "Unknown Domain";
//                             const skills = domainCard.skills || [];
//                             if (skills.length === 0) return null;
//                             return (
//                               <div key={domainIdx} className="pl-3 border-l-2 border-gray-200">
//                                 <h4 className="font-medium text-gray-800">{domainName}</h4>
//                                 <ul className="mt-1.5 space-y-2">
//                                   {skills.map((skill, skillIdx) => {
//                                     const skillName = skill.skill_name || skill.__custom || "Unnamed Skill";
//                                     const isMustHave = skill.mustHave;
//                                     const minExp = skill.min_experience_months;
//                                     return (
//                                       <li key={skillIdx} className="flex items-start gap-3">
//                                         <span
//                                           className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${isMustHave
//                                               ? "bg-red-50 text-red-700 border border-red-200"
//                                               : "bg-green-50 text-green-700 border border-green-200"
//                                             }`}
//                                         >
//                                           {isMustHave ? "Must-have" : "Preferred"}
//                                         </span>
//                                         <span className="flex-1 text-sm font-medium text-gray-800">{skillName}</span>
//                                         {minExp != null && minExp > 0 && (
//                                           <span className="inline-flex items-center text-xs text-gray-600">
//                                             <span className="mr-1">•</span>
//                                             <span>≥{minExp} mo experience</span>
//                                           </span>
//                                         )}
//                                       </li>
//                                     );
//                                   })}
//                                 </ul>
//                               </div>
//                             );
//                           })}
//                         </div>
//                       </div>
//                     )}
//                     {(methods.watch("perks")?.length || 0) > 0 && (
//                       <div>
//                         <span className="text-xs font-medium text-gray-500">
//                           {formConfig.perksLabel}
//                         </span>
//                         <ul className="text-sm text-gray-700 list-disc list-inside">
//                           {methods.watch("perks")?.map((p, i) => <li key={i}>{p}</li>)}
//                         </ul>
//                       </div>
//                     )}
//                     {(methods.watch("screening_questions")?.filter(q => q.trim()).length || 0) > 0 && (
//                       <div>
//                         <span className="text-xs font-medium text-gray-500">Screening Questions</span>
//                         <ul className="space-y-1 text-sm text-gray-700 list-decimal list-inside">
//                           {methods.watch("screening_questions")?.filter(q => q.trim()).map((q, i) => <li key={i}>{q}</li>)}
//                         </ul>
//                       </div>
//                     )}
//                     {methods.watch("women_preferred") && (
//                       <div>
//                         <span className="text-xs font-medium text-gray-500">Diversity Preference</span>
//                         <p className="text-sm text-gray-700">Open to women restarting careers</p>
//                       </div>
//                     )}
//                     <div>
//                       <span className="text-xs font-medium text-gray-500">Contact</span>
//                       <p className="text-sm text-gray-700">
//                         Primary: +91 {methods.watch("phone_contact")}
//                         {methods.watch("alternate_phone_number") && ` • Alt: +91 ${methods.watch("alternate_phone_number")}`}
//                       </p>
//                     </div>
//                     {methods.watch("job_description") && (
//                       <div>
//                         <span className="text-xs font-medium text-gray-500">Description</span>
//                         <p className="text-sm text-gray-700 whitespace-pre-line">
//                           {methods.watch("job_description")}
//                         </p>
//                       </div>
//                     )}

//                     {resolvedOpportunityType === "Project" && (
//                       <div className="p-3 mt-4 border border-orange-200 rounded-md bg-orange-50">
//                         <label className="flex items-start gap-3 cursor-pointer">

//                           <span className="text-xs leading-relaxed text-orange-800">
//                             <strong>Important:</strong> By posting this project, you acknowledge that
//                             Scilienttech acts only as a connecting medium. The platform is
//                             <strong> not liable for payments, deliverables, or disputes</strong> between
//                             you and the candidate. All financial transactions and scope agreements must be
//                             handled directly between both parties.
//                           </span>
//                         </label>

//                       </div>
//                     )}

                    
//                     <div className="p-3 mt-2 text-sm border border-yellow-200 rounded-md bg-yellow-50">
//                       <div className="flex items-start">
//                         <FaInfoCircle className="flex-shrink-0 mt-0.5 text-yellow-600" />
//                         <p className="ml-2 text-yellow-800">
//                           <strong>Important:</strong> Once posted, job details (including education, skills, dates) <strong>cannot be edited</strong>. Only status and visibility can be updated later.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="flex justify-end gap-3 p-4 border-t">
//                     <Button
//                       type="button"
//                       variant="outline"
//                       onClick={() => setShowPreviewModal(false)}
//                     >
//                       Cancel
//                     </Button>
//                     <Button
//                       type="button"
//                       variant="primary"
//                       onClick={() => {
//                         setShowPreviewModal(false);
//                         methods.handleSubmit(onSubmit)();
//                       }}
//                     >
//                       ✅ Post {opportunity_type}
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </MainLayout>
//   );
// }



import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  useForm,
  FormProvider,
  useFormContext,
  Controller,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { FaTimes, FaInfoCircle } from "react-icons/fa";
import { useAIGeneration } from "../../hooks/useAIGeneration";
import { jobPostApi } from "../../api/jobPostApi";
import axios from "axios";
import { showErrorAlert } from "../../utils/alertService";
import Swal from "sweetalert2";
import DomainSkillsSelector, {
  extractSkillArrays,
} from "./DomainSkillsSelector";
import CreatableSelect from "react-select/creatable";
import GreenAsyncCreatableMultiSelect from "../../components/jobs/GreenAsyncCreatableMultiSelect";

import {
  Input,
  Button,
  Textarea,
  Select,
  SuccessMessage,
  ErrorMessage,
  Label,
} from "../../components/ui";
import MainLayout from "../../components/layout/MainLayout";
import JobPostingHeaderBanner from "../../components/JobPostingHeaderBanner";
import { useSelector } from "react-redux";
import { getPricingRules } from "../../api/recruiterPaymentApi";
import { useSearchParams } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Education Levels (static enum-like)
const EDUCATION_LEVELS = [
  { id: "10th", name: "10th / Matriculation" },
  { id: "12th", name: "12th / Higher Secondary" },
  { id: "diploma", name: "Diploma" },
  { id: "bachelors", name: "Bachelor's Degree" },
  { id: "masters", name: "Master's Degree" },
  { id: "phd", name: "PhD / Doctorate" },
];

// Experience Types
const EXPERIENCE_TYPES = [
  { id: "full_time", name: "Full-time Job" },
  { id: "internship", name: "Internship" },
  { id: "freelance", name: "Freelance / Contract" },
  { id: "research", name: "Research / Academic" },
  { id: "volunteer", name: "Volunteering" },
];

// ==================== ZOD VALIDATION SCHEMAS ====================
const jobPostSchema = z
  .object({
    opportunity_type: z.enum(["Internship", "Job", "Project"]),
    // === Job Role ===
    job_role_id: z.union([z.number().positive(), z.null()]).optional(),
    other_job_role: z.string().optional(),
    // === Skills ===
    skill_ids: z.array(z.number()).optional(),
    other_skills: z
      .array(
        z.object({
          domain: z.string().min(1, "Domain name is required"),
          skill: z.string().min(1, "Skill name is required"),
        }),
      )
      .optional(),
    // === Locations ===
    eligiblecity_ids: z.array(z.number()).optional(),
    other_eligible_city_names: z.array(z.string()).optional(),
    // === Colleges & Courses ===
    eligiblecollege_ids: z.array(z.number()).optional(),
    other_eligible_college_names: z.array(z.string()).optional(),
    eligiblecourse_ids: z.array(z.number()).optional(),
    other_eligible_course_names: z.array(z.string()).optional(),
    // === Duration (Internship only) ===
    duration_id: z.union([z.number().positive(), z.null()]).optional(),
    other_duration: z.string().optional(),
    // === Rest of fields ===
    job_type: z.enum(["In office", "Hybrid", "Remote"]),
    job_time: z.enum(["Day Shift", "Night Shift", "Part-time"]),
    number_of_openings: z.coerce
      .number({ invalid_type_error: "Please enter a valid number" })
      .positive("Number of openings must be at least 1"),
    job_description: z
      .string()
      .min(10, "Description is required (minimum 10 characters)"),
    candidate_preferences: z.string().optional(),
    women_preferred: z.boolean().optional(),
    stipend_type: z.enum(["Paid", "Unpaid", "Fixed", "Variable"]).optional(),
    incentive_per_year: z.string().optional(),
    perks: z.array(z.string()).optional(),
    screening_questions: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Question cannot be empty")
          .max(200, "Max 200 characters per question"),
      )
      .max(5, "You can add up to 5 screening questions")
      .optional()
      .default([]),
    phone_contact: z
      .string()
      .regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number"),
    alternate_phone_number: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) =>
          val === "" ||
          val === null ||
          val === undefined ||
          /^\d{10}$/.test(val),
        "Please enter a valid 10-digit mobile number",
      ),
    job_status: z.boolean().default(true),
    stipend_min: z.coerce.number().nullable().optional(),
    stipend_max: z.coerce.number().nullable().optional(),
    days_in_office: z.coerce.number().nullable().optional(),
    minSkillMatchRequired: z.coerce
      .number({ invalid_type_error: "Please enter a whole number (0–100)" })
      .int()
      .min(0, "Minimum must be ≥ 0")
      .max(100, "Maximum must be ≤ 100")
      .nullable()
      .refine((val) => val !== null && val !== undefined, {
        message: "Skill match percentage is required",
      }),
    // === Education & Experience ===
    eligible_education_levels: z.array(z.string()).optional(),
    eligible_specialization_ids: z.array(z.number()).optional(),
    other_eligible_specializations: z.array(z.string()).optional(),
    include_pursuing_students: z.boolean().optional().default(false),
    // Experience
    experience_required: z.boolean().optional().default(false),
    experience_min: z.coerce.number().min(0).nullable().optional(),
    experience_max: z.coerce.number().min(0).nullable().optional(),
    experience_types: z.array(z.string()).optional(),
    // Internship-specific dates
    internship_start_date: z.string().optional(),
    internship_from_date: z.string().optional(),
    internship_to_date: z.string().optional(),
    is_custom_internship_date: z.boolean().optional(),
    // Project Specific dates
    project_start_date: z.string().optional(),
    project_end_date: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    // ========== JOB ROLE ==========
    if (data.job_role_id === null && !data.other_job_role?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please specify the job role",
        path: ["other_job_role"],
      });
    }
    if (
      data.job_role_id != null &&
      (!data.job_role_id || data.job_role_id <= 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select a job role",
        path: ["job_role_id"],
      });
    }

    // ========== LOCATIONS ==========
    const hasSelectedCities =
      Array.isArray(data.eligiblecity_ids) && data.eligiblecity_ids.length > 0;
    const hasOtherCities =
      Array.isArray(data.other_eligible_city_names) &&
      data.other_eligible_city_names.some((c) => c.trim());
    if (!hasSelectedCities && !hasOtherCities) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select at least one city or add a custom city",
        path: ["eligiblecity_ids"],
      });
    }

    // ========== DURATION (Internship) ==========
    if (data.opportunity_type === "Internship") {
      if (data.duration_id === null && !data.other_duration?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please specify the custom internship duration",
          path: ["other_duration"],
        });
      }
      if (
        data.duration_id != null &&
        (!data.duration_id || data.duration_id <= 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select an internship duration",
          path: ["duration_id"],
        });
      }
      // Date validation
      if (data.is_custom_internship_date) {
        if (!data.internship_from_date) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Start date is required",
            path: ["internship_from_date"],
          });
        }
        if (!data.internship_to_date) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "End date is required",
            path: ["internship_to_date"],
          });
        }
        if (data.internship_from_date && data.internship_to_date) {
          const from = new Date(data.internship_from_date);
          const to = new Date(data.internship_to_date);
          if (from > to) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: "End date must be after start date",
              path: ["internship_to_date"],
            });
          }
        }
      }
    }

    // ========== DURATION (Project) ==========
    if (data.opportunity_type === "Project") {
      if (!data.project_start_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Start date is required",
          path: ["project_start_date"],
        });
      }
      if (!data.project_end_date) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date is required",
          path: ["project_end_date"],
        });
      }
      if (data.project_start_date && data.project_end_date) {
        const start = new Date(data.project_start_date);
        const end = new Date(data.project_end_date);
        if (start > end) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "End date must be after start date",
            path: ["project_end_date"],
          });
        }
      }
    }

    // ========== EXPERIENCE ==========
    if (data.experience_required) {
      if (data.experience_min == null || data.experience_min < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Minimum experience is required (0 or more years)",
          path: ["experience_min"],
        });
      }
      if (
        data.experience_max != null &&
        data.experience_max < (data.experience_min || 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Maximum experience must be ≥ minimum",
          path: ["experience_max"],
        });
      }
    }

    // ========== STIPEND ==========
    const isProject = data.opportunity_type === "Project";
    const isFixed = data.stipend_type === "Fixed";
    const showSingleBox = isProject && isFixed;
    if (showSingleBox) {
      if (data.stipend_min == null || data.stipend_min < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please enter the total project budget",
          path: ["stipend_min"],
        });
      }
    } else {
      const needsStipend =
        (data.opportunity_type === "Internship" &&
          data.stipend_type === "Paid") ||
        (data.opportunity_type === "Job" &&
          ["Fixed", "Variable"].includes(data.stipend_type)) ||
        (isProject && !isFixed);
      if (needsStipend) {
        if (data.stipend_min == null || data.stipend_max == null) {
          const label = isProject
            ? "budget"
            : data.opportunity_type === "Internship"
              ? "stipend"
              : "salary";
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Please enter both minimum and maximum ${label}`,
            path: ["stipend_min"],
          });
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Please enter both minimum and maximum ${label}`,
            path: ["stipend_max"],
          });
        } else if (data.stipend_min > data.stipend_max) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Maximum must be ≥ minimum",
            path: ["stipend_max"],
          });
        }
      }
    }

    // ========== HYBRID DAYS ==========
    if (
      data.job_type === "Hybrid" &&
      (!data.days_in_office || data.days_in_office <= 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select the number of in-office days per week",
        path: ["days_in_office"],
      });
    }
  });

const REQUIRED_FIELDS = [
  "opportunity_type",
  "job_role_id",
  "skill_ids",
  "job_type",
  "job_time",
  "number_of_openings",
  "job_description",
  "phone_contact",
  "eligiblecity_ids",
  "stipend_type",
  "duration_id",
  "internship_start_date",
  "minSkillMatchRequired",
];

// ==================== REUSABLE COMPONENTS ====================
const SearchableSelect = ({
  options = [],
  value = null,
  onChange,
  placeholder = "",
  error,
  isMulti = false,
  isCreatable = false,
  getOptionLabel = (opt) => opt.name || opt.title || String(opt),
  getOptionValue = (opt) => opt.id,
  renderOption,
  inputValue: externalInputValue,
  onInputChange,
  isLoading = false,
  noOptionsMessage,
  maxDropdownOptions = 10,
}) => {
  const [internalInputValue, setInternalInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const inputValue =
    externalInputValue !== undefined ? externalInputValue : internalInputValue;

  const handleInputChange = (val) => {
    if (onInputChange) {
      onInputChange(val);
    } else {
      setInternalInputValue(val);
    }
    if (val) setIsOpen(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const filteredOptions = options.filter((opt) =>
    getOptionLabel(opt).toLowerCase().includes(inputValue.toLowerCase()),
  );

  const showCreateOption =
    isCreatable &&
    inputValue.trim() !== "" &&
    !filteredOptions.some(
      (opt) => getOptionLabel(opt).toLowerCase() === inputValue.toLowerCase(),
    );

  const handleSelect = (item) => {
    if (item.__create) {
      if (isMulti) {
        const current = Array.isArray(value) ? value : [];
        const customItem = { __custom: item.value.trim() };
        const exists = current.some(
          (v) =>
            (typeof v === "object" && v.__custom === customItem.__custom) ||
            (typeof v === "number" &&
              options.some(
                (opt) =>
                  getOptionValue(opt) === v &&
                  getOptionLabel(opt).toLowerCase() ===
                    customItem.__custom.toLowerCase(),
              )),
        );
        if (!exists) {
          onChange([...current, customItem]);
        }
      } else {
        onChange({ __create: true, value: item.value.trim() });
      }
    } else {
      const val = getOptionValue(item);
      if (isMulti) {
        const current = Array.isArray(value) ? value : [];
        if (!current.includes(val)) {
          onChange([...current, val]);
        }
      } else {
        onChange(val);
      }
    }
    handleInputChange("");
    setIsOpen(false);
  };

  const handleRemove = (itemToRemove) => {
    if (isMulti) {
      onChange(
        value.filter((item) =>
          typeof item === "object"
            ? item.__custom !== itemToRemove.__custom
            : item !== itemToRemove,
        ),
      );
    } else {
      onChange(null);
      handleInputChange("");
    }
  };

  const renderTags = () => {
    if (!isMulti || !Array.isArray(value)) return null;
    return value.map((item, idx) => {
      let label, key;
      if (typeof item === "object" && item.__custom) {
        label = item.__custom;
        key = `custom-${idx}`;
      } else {
        const found = options.find((opt) => getOptionValue(opt) === item);
        label = found ? getOptionLabel(found) : String(item);
        key = item;
      }
      return (
        <span
          key={key}
          className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-900 bg-[#eaf4e3] rounded-full"
        >
          {label}
          <button
            type="button"
            className="mr-1 text-green-700 hover:text-green-900"
            onClick={() => handleRemove(item)}
          >
            <FaTimes className="w-2 h-2" />
          </button>
        </span>
      );
    });
  };

  const getDisplayLabel = () => {
    if (value == null) return "";
    if (typeof value === "object" && value.__create) {
      return value.value;
    }
    const opt = options.find((o) => getOptionValue(o) === value);
    return opt ? getOptionLabel(opt) : String(value);
  };

  const displayLabel = getDisplayLabel();

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={`flex flex-wrap items-center gap-1 px-2 py-2 min-h-[40px] transition-all duration-200 border rounded-md cursor-text focus-within:border-transparent
          ${error ? "border-[#ef4444]" : "border-gray-300 hover:border-[#9bc87c]"}
          focus-within:ring-2 ${error ? "focus-within:ring-[rgba(239,68,68,0.25)]" : "focus-within:ring-[rgba(155,200,124,0.3)]"}`}
        onClick={() => setIsOpen(true)}
      >
        {isMulti && renderTags()}
        {!isMulti && value != null && inputValue === "" && !isOpen && (
          <span className="absolute left-2 top-2.5 text-sm text-gray-700 pointer-events-none">
            {displayLabel}
          </span>
        )}
        <input
          type="text"
          className="flex-1 text-sm outline-none min-w-[80px] bg-transparent"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={
            (!value || (isMulti && value.length === 0)) && inputValue === ""
              ? placeholder
              : ""
          }
        />
        {!isMulti && (value != null || inputValue !== "") && (
          <button
            type="button"
            className="w-5 h-5 ml-1 text-green-700 hover:text-green-900"
            onClick={(e) => {
              e.stopPropagation();
              if (inputValue !== "") {
                handleInputChange("");
              } else {
                onChange(null);
                handleInputChange("");
              }
              setIsOpen(false);
            }}
            aria-label="Clear selection"
          >
            <FaTimes className="w-2.5 h-2.5" />
          </button>
        )}
      </div>
      {isOpen && (filteredOptions.length > 0 || showCreateOption) && (
        <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg max-h-48">
          {filteredOptions.slice(0, maxDropdownOptions).map((option) => {
            const optionValue = getOptionValue(option);
            const isSelected = isMulti
              ? Array.isArray(value) && value.includes(optionValue)
              : value === optionValue;
            return (
              <button
                key={optionValue}
                type="button"
                className={`w-full text-left px-3 py-2 text-sm transition-colors hover:bg-[#f3f9ee] hover:text-green-900 ${
                  isSelected ? "bg-[#eaf4e3] text-green-900" : ""
                }`}
                onClick={() => handleSelect(option)}
              >
                {renderOption ? renderOption(option) : getOptionLabel(option)}
                {isSelected && (
                  <span className="float-right text-green-700">✓</span>
                )}
              </button>
            );
          })}
          {showCreateOption && (
            <button
              type="button"
              className="w-full px-3 py-2 text-sm text-left text-green-700 hover:bg-[#f3f9ee]"
              onClick={() =>
                handleSelect({ __create: true, value: inputValue.trim() })
              }
            >
              + Create: "{inputValue.trim()}"
            </button>
          )}
        </div>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

// ==================== PRICING HELPERS ====================
const calculatePrice = (post_type, rules, collegeCount = 0) => {
  if (!rules)
    return { baseAmount: 0, gstAmount: 0, totalAmount: 0, tier: null };
  let baseAmount = 0;
  if (post_type === "active") {
    baseAmount = rules.base || 0;
  } else if (post_type === "future") {
    baseAmount = rules.base || 0;
  } else if (post_type === "college") {
    if (collegeCount <= 0)
      return { baseAmount: 0, gstAmount: 0, totalAmount: 0, tier: null };
    const tier = rules.tiers.find(
      (t) => collegeCount >= t.min && (t.max === null || collegeCount <= t.max),
    );
    if (!tier)
      return { baseAmount: 0, gstAmount: 0, totalAmount: 0, tier: null };
    if (tier.flat_rate !== undefined) {
      baseAmount = tier.flat_rate;
    } else if (tier.base && tier.increment_per_college) {
      const extra = Math.max(0, collegeCount - tier.min);
      baseAmount = tier.base + extra * tier.increment_per_college;
    } else {
      baseAmount = collegeCount * 2000;
    }
  }
  const gstAmount = Math.round((baseAmount * (rules.gst_percent || 18)) / 100);
  const totalAmount = baseAmount + gstAmount;
  let nextTierHint = null;
  if (post_type === "college") {
    const nextTier = rules.tiers.find((t) => t.min > collegeCount);
    if (nextTier && nextTier.flat_rate) {
      const needed = nextTier.min - collegeCount;
      const nextBase = nextTier.flat_rate;
      const nextTotal =
        nextBase + Math.round((nextBase * (rules.gst_percent || 18)) / 100);
      const currentTotal = totalAmount;
      const listPrice = collegeCount * 2000;
      const nextListPrice = nextTier.min * 2000;
      const savings = listPrice + needed * 2000 - nextTotal;
      if (savings > 0) {
        nextTierHint = {
          extraNeeded: needed,
          newTotal: nextTotal,
          savings: savings,
          label: nextTier.label,
        };
      }
    }
  }
  return {
    baseAmount,
    gstAmount,
    totalAmount,
    tier: rules.tiers?.find(
      (t) =>
        post_type === "college" &&
        collegeCount >= t.min &&
        (t.max === null || collegeCount <= t.max),
    ),
    savings:
      post_type === "college"
        ? Math.max(0, collegeCount * 2000 - baseAmount)
        : 0,
    nextTierHint,
  };
};

// ==================== MAIN COMPONENT ====================
export default function RecruiterPostJobInternDetails() {
  const [jobRoleSearch, setJobRoleSearch] = useState("");
  const [jobRoleOptions, setJobRoleOptions] = useState([]);
  const [isJobRoleLoading, setIsJobRoleLoading] = useState(false);
  const [jobRoleError, setJobRoleError] = useState(null);
  const [cachedJobRole, setCachedJobRole] = useState(null);
  const [locationSearchText, setLocationSearchText] = useState("");
  const [locationOptions, setLocationOptions] = useState([]);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [cachedLocations, setCachedLocations] = useState([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [searchedCourses, setSearchedCourses] = useState([]);
  const [isCourseLoading, setIsCourseLoading] = useState(false);
  const [courseError, setCourseError] = useState(null);
  const [cachedCourses, setCachedCourses] = useState([]);
  const [collegeSearchText, setCollegeSearchText] = useState("");
  const [tieUpCollegesList, setTieUpCollegesList] = useState([]);
  const [isCollegeListLoading, setIsCollegeListLoading] = useState(false);
  const [collegeListError, setCollegeListError] = useState(null);
  const [cachedColleges, setCachedColleges] = useState([]);
  const [durations, setDurations] = useState([
    { id: 31, value: "1 Month" },
    { id: 32, value: "2 Months" },
    { id: 33, value: "3 Months" },
    { id: 34, value: "4 Months" },
    { id: 35, value: "6 Months" },
    { id: 36, value: "12 Months" },
  ]);
  const { token, user } = useSelector((state) => state.auth);
  console.log("the user", user);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const postingType = location.state?.postingType;
  const opportunityTypeFromState = location.state?.opportunityType;
  // const resolvedPostingType =  postingType;
  // const resolvedOpportunityType =  opportunityTypeFromState;
  const [resolvedPostingType, setResolvedPostingType] = useState(postingType);
  const [resolvedOpportunityType, setResolvedOpportunityType] = useState(
    opportunityTypeFromState,
  );
  const [campusHiringUniversityId, setCampusHiringUniversityId] =
    useState(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState({
    description: null,
    candidatePreferences: null,
    screeningQuestions: null,
  });

  // Add after existing state declarations
  const [isEditMode, setIsEditMode] = useState(false);
  const [editJobId, setEditJobId] = useState(null);
  const [editModeType, setEditModeType] = useState(null); // "draft" | "duplicate" | "convert"
  const [isEditLoading, setIsEditLoading] = useState(false);

  useEffect(() => {
    const uid = searchParams.get("university_id");
    if (uid) {
      setCampusHiringUniversityId(uid);
      setResolvedPostingType((prev) => prev || "college");
    }
  }, [searchParams]);

  // -----------------------------API INTEGRATION---------------------
  useEffect(() => {
    // if (jobRoleSearch.length == 0) {
    //   setJobRoleOptions([]);
    //   setJobRoleError(null);
    //   return;
    // }
    const timer = setTimeout(async () => {
      setIsJobRoleLoading(true);
      setJobRoleError(null);
      try {
        const res = await axios.get(`${BASE_URL}/master/job-roles/search`, {
          params: { search: jobRoleSearch.trim() },
          timeout: 5000,
        });
        const normalized = (res.data.data || [])
          .filter((role) => role.id && role.title)
          .map((role) => ({
            id:
              typeof role.id === "string"
                ? parseInt(role.id, 10)
                : Number(role.id),
            title: role.title.trim(),
          }))
          .filter((role) => !isNaN(role.id));
        setJobRoleOptions(normalized);
      } catch (err) {
        console.error("Job role search failed:", err);
        setJobRoleError("Failed to load job profiles. Please try again.");
        setJobRoleOptions([]);
      } finally {
        setIsJobRoleLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [jobRoleSearch]);

  useEffect(() => {
    if (courseSearch.length == null) {
      setSearchedCourses([]);
      setCourseError(null);
      return;
    }
    const timer = setTimeout(async () => {
      setIsCourseLoading(true);
      setCourseError(null);
      try {
        const res = await axios.get(`${BASE_URL}/master/courses/search`, {
          params: { search: courseSearch.trim() },
          timeout: 5000,
        });
        const normalized = (res.data.data || [])
          .filter((c) => c.id && c.name)
          .map((c) => ({ id: c.id, name: c.name }));
        const unique = Array.from(
          new Map(normalized.map((item) => [item.id, item])).values(),
        );
        setSearchedCourses(unique);
      } catch (err) {
        console.error("Course search failed:", err);
        setCourseError("Failed to load courses. Please try again.");
        setSearchedCourses([]);
      } finally {
        setIsCourseLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [courseSearch]);

  useEffect(() => {
    // if (locationSearchText.length === 0) {
    //   setLocationOptions([]);
    //   setLocationError(null);
    //   return;
    // }
    setLocationError(null);
    const timer = setTimeout(async () => {
      setIsLocationLoading(true);
      setLocationError(null);
      try {
        const res = await axios.get(`${BASE_URL}/master/location/search`, {
          params: { search: locationSearchText.trim() },
          timeout: 5000,
        });
        const normalized = (res.data.data || []).map((loc) => ({
          id: loc.id || loc.location_id,
          name: loc.name || loc.city_name || loc.value,
        }));
        setLocationOptions(normalized);
      } catch (err) {
        console.error("Location search failed:", err);
        setLocationError("Failed to load locations. Please try again.");
        setLocationOptions([]);
      } finally {
        setIsLocationLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [locationSearchText]);

  useEffect(() => {
    if (resolvedPostingType !== "college" || !token) {
      setTieUpCollegesList([]);
      setCollegeListError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setIsCollegeListLoading(true);
      setCollegeListError(null);
      try {
        const res = await axios.get(
          `${BASE_URL}/company-recruiter/campus-hiring/tie-up-colleges`,
          {
            headers: { Authorization: `Bearer ${token}` },
            timeout: 15000,
          },
        );
        if (cancelled) return;
        const rows = res.data?.data || [];
        const normalized = rows
          .filter((c) => c.id != null)
          .map((c) => ({
            id: typeof c.id === "string" ? parseInt(c.id, 10) : Number(c.id),
            name: c.college_name || c.name,
          }))
          .filter((c) => !Number.isNaN(c.id));
        setTieUpCollegesList(normalized);
      } catch (err) {
        if (!cancelled) {
          console.error("Campus hiring tie-up colleges failed:", err);
          setCollegeListError(
            "Failed to load tie-up colleges. Please try again.",
          );
          setTieUpCollegesList([]);
        }
      } finally {
        if (!cancelled) setIsCollegeListLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [resolvedPostingType, token]);

  const [deletedQuestion, setDeletedQuestion] = useState({
    index: -1,
    text: "",
  });
  const [undoTimeout, setUndoTimeout] = useState(null);

  const methods = useForm({
    mode: "onSubmit",
    resolver: zodResolver(jobPostSchema),
    defaultValues: {
      opportunity_type: resolvedOpportunityType
        ? resolvedOpportunityType
        : "Job",
      job_status: resolvedPostingType !== "future",
      job_role_id: null,
      other_job_role: "",
      other_skills: [],
      other_eligible_city_names: [],
      other_eligible_college_names: [],
      other_eligible_course_names: [],
      duration_id: null,
      other_duration: "",
      skill_ids: [],
      job_type: "In office",
      days_in_office: null,
      job_time: "Day Shift",
      number_of_openings: "",
      job_description: "",
      candidate_preferences: "",
      women_preferred: false,
      stipend_type: "Paid",
      stipend_min: null,
      stipend_max: null,
      incentive_per_year: "",
      perks: [],
      screening_questions: [],
      phone_contact: user?.phone?.replace(/\D/g, "").slice(0, 10) || "",
      alternate_phone_number: "",
      eligiblecity_ids: [],
      internship_start_date: "",
      internship_from_date: "",
      internship_to_date: "",
      is_custom_internship_date: false,
      eligiblecollege_ids: [],
      eligiblecourse_ids: [],
      minSkillMatchRequired: null,
      project_start_date: "",
      project_end_date: "",
      eligible_education_levels: [],
      eligible_specialization_ids: [],
      other_eligible_specializations: [],
      include_pursuing_students: false,
      experience_required: false,
      experience_min: null,
      experience_max: null,
      experience_types: [],
    },
  });

  // Fetch job data for edit/duplicate/convert flows
  useEffect(() => {
    const jobId = searchParams.get("jobId");
    const mode = searchParams.get("mode"); // "draft" | "duplicate" | "convert"

    // Only fetch if we have jobId and mode params
    if (jobId && mode) {
      const fetchJobForEdit = async () => {
        try {
          setIsEditMode(true);
          setEditJobId(jobId);
          setEditModeType(mode);
          setIsEditLoading(true);

          const response = await axios.get(`${BASE_URL}/jobs/${jobId}/edit`, {
            params: { mode },
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.data.success) {
            const jobData = response.data.data;

            setResolvedOpportunityType(jobData.opportunity_type || "Job");

            if (mode === "convert") {
              // Convert mode: Force posting type to 'active' regardless of original status
              setResolvedPostingType("active");
            } else {
              // Draft/Duplicate: Keep original posting type
              setResolvedPostingType(jobData.post_type || "active");
            }

            // Map domain_skills to selectedDomainSkills state
            if (jobData.domain_skills) {
              setSelectedDomainSkills(jobData.domain_skills);
            }

            // Cache searchable select options for display
            if (jobData.eligible_cities?.length) {
              setCachedLocations(jobData.eligible_cities);
            }
            if (jobData.eligible_colleges?.length) {
              setCachedColleges(jobData.eligible_colleges);
            }
            if (jobData.eligible_courses?.length) {
              setCachedCourses(jobData.eligible_courses);
            }
            if (jobData.job_role) {
              setCachedJobRole(jobData.job_role);
            }

            // Reset form with fetched data
            const formValues = {
              opportunity_type: jobData.opportunity_type || "Job",
              job_status:
                jobData.job_status !== undefined ? jobData.job_status : true,
              job_role_id:
                jobData.opportunity_type === "Project"
                  ? null
                  : (jobData.job_role?.id ?? null),
              other_job_role:
                jobData.other_job_role ||
                (jobData.opportunity_type === "Project" &&
                jobData.job_role?.title
                  ? jobData.job_role.title
                  : ""),
              skill_ids: jobData.skill_ids || [],
              other_skills: jobData.other_skills || [],
              eligiblecity_ids: jobData.eligible_cities?.map((c) => c.id) || [],
              other_eligible_city_names:
                jobData.other_eligible_city_names || [],
              eligiblecollege_ids:
                jobData.eligible_colleges?.map((c) => c.id) || [],
              other_eligible_college_names:
                jobData.other_eligible_college_names || [],
              eligiblecourse_ids:
                jobData.eligible_courses?.map((c) => c.id) || [],
              other_eligible_course_names:
                jobData.other_eligible_course_names || [],
              duration_id: jobData.duration?.id ?? null,
              other_duration: jobData.other_duration || "",
              job_type: jobData.job_type || "In office",
              job_time: jobData.job_time || "Day Shift",
              days_in_office: jobData.days_in_office ?? null,
              number_of_openings: jobData.number_of_openings ?? 1,
              job_description: jobData.job_description || "",
              candidate_preferences: jobData.candidate_preferences || "",
              women_preferred: jobData.women_preferred || false,
              stipend_type: jobData.stipend_type || "Paid",
              stipend_min: jobData.stipend_min ?? null,
              stipend_max: jobData.stipend_max ?? null,
              incentive_per_year: jobData.incentive_per_year || "",
              perks: jobData.perks || [],
              screening_questions: jobData.screening_questions || [],
              phone_contact: jobData.phone_contact || "",
              alternate_phone_number: jobData.alternate_phone_number || "",
              internship_start_date: jobData.internship_start_date || "",
              internship_from_date: jobData.internship_from_date || "",
              internship_to_date: jobData.internship_to_date || "",
              is_custom_internship_date:
                jobData.is_custom_internship_date || false,
              minSkillMatchRequired: jobData.minSkillMatchRequired ?? null,
              project_start_date: jobData.project_start_date || "",
              project_end_date: jobData.project_end_date || "",
              eligible_education_levels:
                jobData.eligible_education_levels || [],
              eligible_specialization_ids:
                jobData.eligible_specializations?.map((s) => s.id) || [],
              other_eligible_specializations:
                jobData.other_eligible_specializations || [],
              include_pursuing_students:
                jobData.include_pursuing_students || false,
              experience_required: jobData.experience_required || false,
              experience_min: jobData.experience_min ?? null,
              experience_max: jobData.experience_max ?? null,
              experience_types: jobData.experience_types || [],
            };

            methods.reset(formValues);
          }
        } catch (error) {
          console.error("Failed to fetch job for edit:", error);
          showErrorAlert("Failed to load job details. Please try again.");
          setIsEditMode(false);
          setEditJobId(null);
          setEditModeType(null);
        } finally {
          setIsEditLoading(false);
        }
      };

      fetchJobForEdit();
    }
  }, [searchParams, token, methods]);

  const userPlan = useSelector((state) => state.user?.plan || "pro");

  const enrichedDurations = durations.map((d) => ({
    ...d,
    is_recommended: d.value.toLowerCase().includes("3 month"),
  }));

  const {
    generateContent,
    isGenerating: isAIGenerating,
    error: aiError,
  } = useAIGeneration();

  const prepareAIInput = () => {
    const formData = methods.getValues();
    let jobRoleTitle = "";
    if (formData.job_role_id && cachedJobRole) {
      jobRoleTitle = cachedJobRole.title.trim();
    }
    if (!jobRoleTitle && formData.other_job_role?.trim()) {
      jobRoleTitle = formData.other_job_role.trim();
    }
    const { skills: existingSkills, other_skills: customSkills } =
      extractSkillArrays(selectedDomainSkills);
    const skillNamesFromExisting = existingSkills
      .map((skillItem) => {
        return skillItem.skill_name;
      })
      .filter(Boolean);
    const skillNamesFromCustom = customSkills.map((s) => s.skill);
    const skillNames = [...skillNamesFromExisting, ...skillNamesFromCustom];

    let durationValue = undefined;
    if (formData.opportunity_type === "Internship") {
      if (formData.duration_id && durations?.length) {
        const dur = durations.find((d) => d.id === formData.duration_id);
        if (dur?.value) durationValue = dur.value;
      } else if (formData.other_duration?.trim()) {
        durationValue = formData.other_duration.trim();
      }
    }
    return {
      opportunityType: formData.opportunity_type || "Job",
      title: jobRoleTitle,
      skills: skillNames,
      workType: formData.job_type || undefined,
      workSchedule: formData.job_time || undefined,
      duration: durationValue,
    };
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [pricingRules, setPricingRules] = useState(null);
  const [eligibility, setEligibility] = useState({
    is_eligible: true,
    reason: "subscription",
    can_pay_one_time: true,
    one_time_price: null,
    can_upgrade: false,
    upgrade_suggestion: null,
  });
  const [selectedDomainSkills, setSelectedDomainSkills] = useState([]);

  const handleDomainSkillsChange = useCallback(
    (updatedDomainSkills) => {
      setSelectedDomainSkills(updatedDomainSkills);
      const { skills, other_skills } = extractSkillArrays(updatedDomainSkills);
      methods.setValue(
        "skill_ids",
        skills.map((s) => s.skill_id),
        { shouldValidate: false },
      );
      methods.setValue("other_skills", other_skills, { shouldValidate: false });
    },
    [methods],
  );

  useEffect(() => {
    if (["active", "future", "college"].includes(resolvedPostingType)) {
      const loadPricingRules = async () => {
        try {
          const rules = await getPricingRules(resolvedPostingType);
          setPricingRules(rules);
        } catch (err) {
          console.error("Failed to load pricing rules", err);
        }
      };
      loadPricingRules();
    }
  }, [resolvedPostingType]);

  const selectedCollegesCount = useMemo(
    () =>
      (methods.watch("eligiblecollege_ids")?.length || 0) +
      (methods.watch("other_eligible_college_names")?.filter((n) => n.trim())
        .length || 0),
    [
      methods.watch("eligiblecollege_ids"),
      methods.watch("other_eligible_college_names"),
    ],
  );

  const pricingResult = useMemo(() => {
    if (!pricingRules) return null;
    return calculatePrice(
      resolvedPostingType,
      pricingRules,
      selectedCollegesCount,
    );
  }, [resolvedPostingType, pricingRules, selectedCollegesCount]);

  const handleEligibilityChange = useCallback((eligibilityData) => {
    setEligibility(eligibilityData);
  }, []);

  // Watch form values
  const opportunity_type = resolvedOpportunityType
    ? resolvedOpportunityType
    : "Job";
  const job_type = methods.watch("job_type");
  const stipend_type = methods.watch("stipend_type");
  const is_custom_internship_date = methods.watch("is_custom_internship_date");
  const current_skill_ids = methods.watch("skill_ids");

  // ==================== FORM VISIBILITY CONFIG (CONTROL CENTER) ====================
  const formConfig = useMemo(() => {
    const isInternship = opportunity_type === "Internship";
    const isProject =
      opportunity_type === "Project" || opportunity_type === "project";
    const isJob = opportunity_type === "Job" || opportunity_type === "job";
    const isCollegePosting = resolvedPostingType === "college";
    const isFuturePosting = resolvedPostingType === "future";
    const isActivePosting = resolvedPostingType === "active";

    return {
      // 1. Opportunity Specific Fields
      showDuration: isInternship,
      showInternshipDates: isInternship,
      showProjectDates: isProject,
      showExperience: !(isCollegePosting || isInternship || isFuturePosting), // Jobs & Projects need experience
      showScreeningQuestions: !isFuturePosting,
      showBenefits: !(isProject || isFuturePosting),
      showAlternateContact: !isFuturePosting,
      showMinExperienceInputInSkills: !isCollegePosting,
      showMustHaveToggleInSkills: true,

      // 2. Posting Type Specific Fields
      showCollegeSelector: isCollegePosting,

      // 3. Labels & Text
      roleLabel: isInternship
        ? "Internship Profile"
        : isProject
          ? "Project Title"
          : "Job Title",
      descLabel: isInternship
        ? "Intern's responsibility"
        : isProject
          ? "Project description"
          : "Job description",
      stipendLabel: isProject
        ? "Project Budget"
        : isInternship
          ? "Stipend"
          : "Salary",
      perksLabel: isInternship ? "Perks" : "Benefits",

      // 4. API Logic Helpers
      needsDuration: isInternship,
      needsExperience: !(isCollegePosting || isInternship),
    };
  }, [opportunity_type, resolvedPostingType]);
  // ================================================================================

  const collegeDropdownOptions = useMemo(() => {
    const byId = new Map();
    tieUpCollegesList.forEach((c) => {
      if (c?.id != null && !Number.isNaN(Number(c.id))) {
        byId.set(Number(c.id), c);
      }
    });
    (cachedColleges || []).forEach((c) => {
      const id = c?.id != null ? Number(c.id) : NaN;
      if (!Number.isNaN(id) && !byId.has(id)) {
        byId.set(id, c);
      }
    });
    return Array.from(byId.values());
  }, [tieUpCollegesList, cachedColleges]);

  const handleOpportunityTypeChange = (newType) => {
    methods.reset({
      opportunity_type: newType,
      job_role_id: null,
      other_job_role: "",
      skill_ids: [],
      other_skills: [],
      eligiblecity_ids: [],
      other_eligible_city_names: [],
      eligiblecollege_ids: [],
      other_eligible_college_names: [],
      eligiblecourse_ids: [],
      other_eligible_course_names: [],
      other_duration: "",
      job_type: "In office",
      days_in_office: null,
      job_time: "Day Shift",
      number_of_openings: "",
      job_description: "",
      candidate_preferences: "",
      women_preferred: false,
      stipend_type: newType === "Internship" ? "Paid" : "Fixed",
      stipend_min: null,
      stipend_max: null,
      incentive_per_year: "",
      perks: [],
      screening_questions: [],
      phone_contact: user?.phone?.replace(/\D/g, "").slice(0, 10) || "",
      alternate_phone_number: "",
      duration_id: newType === "Internship" ? null : undefined,
      internship_start_date: "",
      internship_from_date: "",
      internship_to_date: "",
      is_custom_internship_date: false,
      minSkillMatchRequired: null,
      project_start_date: "",
      project_end_date: "",
      eligible_education_levels: [],
      eligible_specialization_ids: [],
      other_eligible_specializations: [],
      include_pursuing_students: false,
      experience_required: false,
      experience_min: null,
      experience_max: null,
      experience_types: [],
    });
    setSelectedDomainSkills([]);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const transformFormDataToAPI = (formData) => {
    // Recalculate flags for safety in API transformation
    const isInternship = formData.opportunity_type === "Internship";
    const isProject = formData.opportunity_type === "Project";

    // Include job_id only for edit flows (backend handles update vs create)
    const isEditFlow = isEditMode && editJobId;
    const isDraft = editModeType === "draft";

    const apiData = {
      ...(isDraft && { job_id: editJobId }), //for other edits mode duplicate and convert we dont need job_id
      opportunity_type: formData.opportunity_type,
      post_type: resolvedPostingType,
      // Job Role
      job_role_id: formData.job_role_id,
      other_job_role:
        formData.job_role_id === null ? formData.other_job_role : null,
      // Skills
      skill_ids: Array.isArray(formData.skill_ids) ? formData.skill_ids : [],
      other_skills: Array.isArray(formData.other_skills)
        ? formData.other_skills.map((s) => ({
            domain: s.domain,
            skill: s.skill,
          }))
        : [],
      // Locations
      eligiblecity_ids: Array.isArray(formData.eligiblecity_ids)
        ? formData.eligiblecity_ids
        : [],
      other_eligible_city_names: Array.isArray(
        formData.other_eligible_city_names,
      )
        ? formData.other_eligible_city_names
        : [],
      // Colleges
      eligiblecollege_ids: Array.isArray(formData.eligiblecollege_ids)
        ? formData.eligiblecollege_ids
        : [],
      other_eligible_college_names: Array.isArray(
        formData.other_eligible_college_names,
      )
        ? formData.other_eligible_college_names
        : [],
      // Courses
      eligiblecourse_ids: Array.isArray(formData.eligiblecourse_ids)
        ? formData.eligiblecourse_ids
        : [],
      other_eligible_course_names: Array.isArray(
        formData.other_eligible_course_names,
      )
        ? formData.other_eligible_course_names
        : [],
      // Work & Schedule
      job_type:
        formData.eligiblecity_ids.length === 0 ? "Remote" : formData.job_type,
      days_in_office:
        formData.job_type === "Remote" ? null : formData.days_in_office,
      job_time: formData.job_time,
      // Openings & Description
      number_of_openings: formData.number_of_openings,
      job_description: formData.job_description,
      candidate_preferences: formData.candidate_preferences || null,
      women_preferred: formData.women_preferred,
      // Stipend / Pay
      stipend_type:
        formData.opportunity_type === "Job" ? "Fixed" : formData.stipend_type,
      stipend_min:
        formData.stipend_type === "Unpaid" ? null : formData.stipend_min,
      stipend_max:
        formData.stipend_type === "Unpaid" ? null : formData.stipend_max,
      incentive_per_year: formData.incentive_per_year || null,
      // Perks & Screening
      perks: Array.isArray(formData.perks) ? formData.perks : [],
      screening_questions: Array.isArray(formData.screening_questions)
        ? formData.screening_questions
        : formData.screening_questions.split("\n").filter((q) => q.trim())
          ? formData.screening_questions.split("\n").filter((q) => q.trim())
          : [],
      // Contact Info
      phone_contact: formData.phone_contact,
      alternate_phone_number: formData.alternate_phone_number || null,
      // Matching
      minSkillMatchRequired: formData.minSkillMatchRequired || null,
      job_status: formData.job_status,
      // Internship-specific
      ...(isInternship && {
        duration_id: formData.duration_id,
        other_duration:
          formData.duration_id === null ? formData.other_duration : null,
        is_custom_internship_date: formData.is_custom_internship_date,
        internship_start_date: formData.is_custom_internship_date
          ? null
          : new Date().toISOString().split("T")[0],
        internship_from_date: formData.is_custom_internship_date
          ? formData.internship_from_date
          : null,
        internship_to_date: formData.is_custom_internship_date
          ? formData.internship_to_date
          : null,
      }),
      // Job or Project
      ...(!isInternship && {
        internship_start_date: formData.is_custom_internship_date
          ? formData.internship_from_date
          : new Date().toISOString().split("T")[0],
      }),
      ...(isProject && {
        project_start_date: formData.project_start_date,
        project_end_date: formData.project_end_date,
      }),
      // Education and experience
      eligible_education_levels: Array.isArray(
        formData.eligible_education_levels,
      )
        ? formData.eligible_education_levels
        : [],
      eligible_specialization_ids: Array.isArray(
        formData.eligible_specialization_ids,
      )
        ? formData.eligible_specialization_ids
        : [],
      other_eligible_specializations: Array.isArray(
        formData.other_eligible_specializations,
      )
        ? formData.other_eligible_specializations
        : [],
      include_pursuing_students: formData.include_pursuing_students || false,
      // Experience
      experience_required: formData.experience_required || false,
      experience_min: formData.experience_required
        ? formData.experience_min
        : null,
      experience_max: formData.experience_required
        ? formData.experience_max
        : null,
      experience_types: Array.isArray(formData.experience_types)
        ? formData.experience_types
        : [],
    };

    // Merge custom domain-skill pairs
    const customDomainSkills = selectedDomainSkills
      .filter((domain) => domain.isCustom)
      .flatMap((domain) =>
        (domain.selectedSkills || [])
          .filter((skill) => skill.isCustom)
          .map((skill) => ({
            domain: domain.name,
            skill: skill.skill_name,
          })),
      );

    const customSkillsInExistingDomains = selectedDomainSkills
      .filter((domain) => !domain.isCustom)
      .flatMap((domain) =>
        (domain.selectedSkills || [])
          .filter((skill) => skill.isCustom)
          .map((skill) => ({
            domain: domain.name,
            skill: skill.skill_name,
          })),
      );

    const mergedOtherSkills = [
      ...(Array.isArray(formData.other_skills) ? formData.other_skills : []),
      ...customDomainSkills,
      ...customSkillsInExistingDomains,
    ];

    const { skills, other_skills } = extractSkillArrays(selectedDomainSkills);
    apiData.skills = skills;
    apiData.other_skills = other_skills;
    delete apiData.skill_ids;

    return apiData;
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      const jobPostData = transformFormDataToAPI(data);
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }
      const response = await jobPostApi.createJobPost(jobPostData, token);
      const { data: jobData, subscription, payment } = response;

      if (resolvedPostingType === "active") {
        navigate(`/recruiter/job-posting/plan?jobId=${jobData.job_id}`);
        return;
      }

      if (subscription && subscription.action === "used_subscription") {
        setSuccessMessage(
          `${data.opportunity_type} posted successfully using subscription!`,
        );
        setTimeout(() => {
          navigate("/recruiter/job-post-success", {
            state: {
              job_id: jobData.job_id,
              post_type: resolvedPostingType,
              subscription: {
                plan_name: subscription.plan_name,
                credits_before: subscription.credits_before,
                credits_after: subscription.credits_after,
                remaining_credits: subscription.remaining_credits,
              },
            },
          });
        }, 2000);
      } else if (
        subscription &&
        subscription.action === "used_college_credits"
      ) {
        setSuccessMessage(
          `${data.opportunity_type} posted using ${subscription.credits_used} college credits!`,
        );
        setTimeout(() => {
          navigate("/recruiter/job-post-success", {
            state: {
              job_id: jobData.job_id,
              post_type: resolvedPostingType,
              subscription: {
                action: "used_college_credits",
                credits_used: subscription.credits_used,
                remaining_credits_total: subscription.remaining_credits_total,
              },
            },
          });
        }, 2000);
      } else if (response.status === "inactive_free_promo") {
        setSuccessMessage(` ${data.opportunity_type} saved successfully `);
        setTimeout(() => {
          navigate("/recruiter/job-post-success", {
            state: {
              job_id: jobData.job_id,
              post_type: resolvedPostingType,
              status: "inactive_free_promo",
              activation_url: response.activation_url,
            },
          });
        }, 2000);
      } else if (payment && payment.action === "redirect_to_one_time") {
        setSuccessMessage(
          `${data.opportunity_type} saved. Redirecting to payment...`,
        );
        setTimeout(() => {
          if (resolvedPostingType === "college") {
            // navigate("/recruiter/checkout", {
            //   state: {
            //     job_id: payment.job_id,
            //     post_type: payment.post_type,
            //     amount: payment.amount,
            //     isOneTime: true,
            //   },
            // });

            // Redirect to new college-specific checkout
            navigate("/recruiter/checkout/college-specific", {
              state: {
                job_id: payment.job_id,
                post_type: payment.post_type,
                initial_colleges: data.eligiblecollege_ids || [],
              },
            });
          } else {
            navigate("/recruiter/checkout", {
              state: {
                job_id: payment.job_id,
                post_type: payment.post_type,
                amount: payment.amount,
              },
            });
          }
        }, 2000);
      } else {
        setErrorMessage("Unexpected response from server. Please try again.");
      }
    } catch (error) {
      console.error("Job post error:", error);
      if (
        error.response?.status === 402 &&
        error.response?.data?.message?.includes("credits")
      ) {
        const missing = error.response.data.missing_credits || 1;
        if (confirm(`Need ${missing} more college credits. Buy now?`)) {
          navigate(`/recruiter/credits/pricing?need=${missing}`);
          return;
        }
      }
      const errorMsg =
        error.response?.data?.message || error.message || "Failed to post.";
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSaveDraft = async (data) => {
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      let jobPostData = transformFormDataToAPI(data);
      jobPostData.active_status = 0;
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }
      const response = await jobPostApi.createJobPost(jobPostData, token);
      setSuccessMessage(`${data.opportunity_type} draft saved successfully!`);
      setSelectedDomainSkills([]);
      methods.reset();
      setTimeout(() => {
        navigate("/recruiter-dashboard");
      }, 2000);
    } catch (error) {
      console.log("=== API ERROR ===");
      const errorMsg =
        error.response?.data?.message ||
        error.message ||
        "Failed to save draft. Please try again.";
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Field mappings for error messages
  const FIELD_LABELS = {
    job_role_id: formConfig.roleLabel,
    skill_ids: "Skills",
    eligiblecity_ids: "City/Cities",
    number_of_openings: "Number of Openings",
    job_description: formConfig.descLabel,
    phone_contact: "Primary Phone Number",
    minSkillMatchRequired: "Minimum Skill Match Percentage",
    stipend_min: formConfig.stipendLabel,
    stipend_max: formConfig.stipendLabel,
    duration_id: "Internship Duration",
    other_duration: "Custom Internship Duration",
    internship_from_date: "Internship Start Date",
    internship_to_date: "Internship End Date",
    project_start_date: "Project Start Date",
    project_end_date: "Project End Date",
    days_in_office: "In-Office Days per Week",
    experience_min: "Minimum Experience (Years)",
  };

  const getMissingFieldLabels = (errors, labelMap) => {
    const missing = [];
    for (const field in errors) {
      if (errors[field]) {
        const label =
          labelMap[field] ||
          field.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
        if (!missing.includes(label)) {
          missing.push(label);
        }
      }
    }
    return missing;
  };

  const radioStyles =
    "w-3 h-3 text-[#9bc87c] border-gray-300 focus:outline-none focus:ring-0";
  const checkboxStyles =
    "w-3 h-3 text-[#9bc87c] border-gray-300 rounded focus:outline-none focus:ring-0";
  const radioContainerStyles =
    "flex gap-3 p-2 border border-gray-300 rounded-lg bg-white";

  return (
    <MainLayout
      heading="Post Internship/Job"
      subheading="Post your internship/job to attract the best candidates."
      hideMobileIllustration={true}
    >
      <div className="relative bg-[#f5f6f7] flex w-full min-h-screen overflow-hidden md:items-center md:justify-center">
        <div className="flex justify-center flex-1 w-full mt-6 md:mt-0">
          <div className="w-full max-w-full p-6 mt-4 bg-white shadow-none rounded-xl sm:shadow-xl sm:max-w-2xl sm:p-8">
            {campusHiringUniversityId && (
              <div className="mb-4 rounded-lg border border-[#9bc87c] bg-[#f3f9ee] px-4 py-3 text-sm text-green-900">
                <strong>Campus hiring:</strong> Continue with college-specific
                posting. University reference:{" "}
                <span className="font-mono">{campusHiringUniversityId}</span>.
              </div>
            )}
            {postingType === "college" && userPlan === "free" ? (
              <div className="p-6 text-center">
                <div className="inline-block p-3 mb-4 bg-red-100 rounded-full">
                  <FaTimes className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  Upgrade to Post College Jobs
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  College-Specific targeting is only available on paid plans.
                </p>
              </div>
            ) : isEditLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-[#9bc87c] rounded-full border-t-transparent animate-spin"></div>
                <p className="mt-4 text-gray-600">Loading job details...</p>
              </div>
            ) : (
              <FormProvider {...methods}>
                <form
                  onSubmit={(e) => {
                    methods.handleSubmit(
                      (data) => {
                        onSubmit(data);
                      },
                      (errors) => {
                        console.log(" Validation failed:");
                        console.log("Errors:", errors);
                      },
                    )(e);
                  }}
                  className="space-y-4"
                >
                  {/* === BANNERS === */}
                  {resolvedPostingType === "future" && (
                    <div className="p-3 mb-4 border border-green-200 rounded-md bg-green-50">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Future Job</span> – Post
                        an opportunity for future. The status will be marked as
                        inactive and wil not be visible to others.
                      </p>
                    </div>
                  )}
                  {resolvedPostingType === "college" && userPlan === "free" && (
                    <div className="p-3 mb-4 border border-red-200 rounded-md bg-red-50">
                      <p className="text-sm text-red-700">
                        🔒 College-Specific Jobs require a paid plan.
                        <button
                          type="button"
                          onClick={() => navigate("/recruiter-pricing")}
                          className="ml-1 text-green-700 underline"
                        >
                          View Pricing
                        </button>
                      </p>
                    </div>
                  )}

                  {/* Success/Error Messages */}
                  {successMessage && (
                    <div className="relative">
                      <SuccessMessage size="large">
                        {successMessage}
                      </SuccessMessage>
                      <button
                        type="button"
                        onClick={() => setSuccessMessage("")}
                        className="absolute text-green-600 top-2 right-2 hover:text-green-800 focus:outline-none"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                  {errorMessage && (
                    <div className="relative">
                      <ErrorMessage size="large">{errorMessage}</ErrorMessage>
                      <button
                        type="button"
                        onClick={() => setErrorMessage("")}
                        className="absolute text-red-600 top-2 right-2 hover:text-red-800 focus:outline-none"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Status Info */}
                  <div className="p-3 mb-4 border border-[#9bc87c] rounded-md bg-[#f3f9ee]">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Opportunity Type:</span>{" "}
                      {resolvedOpportunityType
                        ? resolvedOpportunityType
                        : "Job"}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Active Status:</span>{" "}
                      {resolvedPostingType === "future" ? "Inactive" : "Active"}
                    </p>
                  </div>

                  {/* === SECTION 1: BASIC INFO (Always Visible) === */}
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor={
                          opportunity_type === "Project"
                            ? "other_job_role"
                            : "job_role_id"
                        }
                      >
                        {formConfig.roleLabel}
                        <span className="ml-1 text-red-500">*</span>
                      </Label>
                      {jobRoleError && (
                        <p className="mb-1 text-xs text-red-500">
                          {jobRoleError}
                        </p>
                      )}

                      {opportunity_type === "Project" ? (
                        // --- PROJECT MODE: Simple Text Input ---
                        <Input
                          type="text"
                          placeholder="e.g., Semiconductor Research, AI Model Dev..."
                          value={methods.watch("other_job_role") || ""}
                          onChange={(e) => {
                            methods.setValue("other_job_role", e.target.value, {
                              shouldValidate: true,
                            });
                            methods.setValue("job_role_id", null); // Ensure ID is cleared for Projects
                          }}
                          error={
                            methods.formState.errors.other_job_role?.message
                          }
                        />
                      ) : (
                        // ) : (
                        //   // --- JOB/INTERNSHIP MODE: Searchable Select ---
                        //   <SearchableSelect
                        //     options={[...jobRoleOptions, ...(cachedJobRole && !jobRoleOptions.some(o => o.id === cachedJobRole.id) ? [cachedJobRole] : [])]}
                        //     inputValue={jobRoleSearch}
                        //     onInputChange={(val) => { setJobRoleSearch(val); if (val.length < 2) setJobRoleOptions([]); }}
                        //     isLoading={isJobRoleLoading}
                        //     value={(() => {
                        //       const jobId = methods.watch("job_role_id");
                        //       const otherRole = methods.watch("other_job_role");
                        //       if (jobId) return jobId;
                        //       if (otherRole?.trim()) return { __create: true, value: otherRole.trim() };
                        //       return null;
                        //     })()}
                        //     onChange={(val) => {
                        //       if (typeof val === 'number') {
                        //         methods.setValue("job_role_id", val, { shouldValidate: true });
                        //         methods.setValue("other_job_role", "");
                        //         const found = jobRoleOptions.find(o => o.id === val);
                        //         if (found) setCachedJobRole(found);
                        //       } else if (val?.__create) {
                        //         methods.setValue("job_role_id", null);
                        //         methods.setValue("other_job_role", val.value);
                        //         setCachedJobRole(null);
                        //       } else {
                        //         methods.setValue("job_role_id", null);
                        //         setCachedJobRole(null);
                        //       }
                        //     }}
                        //     placeholder="Search job titles... [Min 3 chars]"
                        //     isCreatable
                        //     getOptionLabel={(o) => o.title}
                        //     getOptionValue={(o) => o.id}
                        //   />
                        // )}

                        // --- JOB/INTERNSHIP MODE: Creatable Select ---
                        <Controller
                          name="job_role_id"
                          control={methods.control}
                          render={({ field }) => (
                            <CreatableSelect
                              {...field}
                              value={
                                field.value
                                  ? {
                                      value: String(field.value),
                                      label:
                                        jobRoleOptions.find(
                                          (o) =>
                                            String(o.id) ===
                                            String(field.value),
                                        )?.title ||
                                        (cachedJobRole &&
                                        String(cachedJobRole.id) ===
                                          String(field.value)
                                          ? cachedJobRole.title
                                          : "") ||
                                        methods.watch("other_job_role") ||
                                        "",
                                    }
                                  : methods.watch("other_job_role")
                                    ? {
                                        value: "__custom__",
                                        label: methods.watch("other_job_role"),
                                      }
                                    : null
                              }
                              onMenuOpen={() => setJobRoleSearch("")}
                              onInputChange={(val, actionMeta) => {
                                if (actionMeta.action === "input-change") {
                                  setJobRoleSearch(val);
                                  // if (val.length < 2) setJobRoleOptions([]);
                                }
                              }}
                              options={[
                                ...jobRoleOptions,
                                ...(cachedJobRole &&
                                !jobRoleOptions.some(
                                  (o) => o.id === cachedJobRole.id,
                                )
                                  ? [cachedJobRole]
                                  : []),
                              ].map((r) => ({
                                value: String(r.id),
                                label: r.title,
                              }))}
                              isLoading={isJobRoleLoading}
                              filterOption={null}
                              onChange={(opt) => {
                                if (opt && opt.__isNew__) {
                                  methods.setValue(
                                    "other_job_role",
                                    opt.label.trim(),
                                    { shouldValidate: true },
                                  );
                                  field.onChange(null);
                                  setCachedJobRole(null);
                                } else {
                                  methods.setValue("other_job_role", "", {
                                    shouldValidate: true,
                                  });
                                  const selectedId = opt
                                    ? Number(opt.value)
                                    : null;
                                  field.onChange(selectedId);
                                  if (selectedId) {
                                    const found = jobRoleOptions.find(
                                      (o) => o.id === selectedId,
                                    );
                                    if (found) setCachedJobRole(found);
                                  } else {
                                    setCachedJobRole(null);
                                  }
                                }
                              }}
                              // placeholder="Search job titles... [Min 3 chars]"
                              placeholder="Search job titles..."
                              isClearable
                              isSearchable
                              className="text-sm"
                              // noOptionsMessage={({ inputValue }) => {
                              //   if (!inputValue) return "Start typing...";
                              //  if (inputValue.length < 3) return "Type min 3 chars to search";
                              //   return "No matches found";
                              // }}
                              noOptionsMessage={() => "No options available"}
                              formatCreateLabel={(inputValue) =>
                                `+ Create: "${inputValue}"`
                              }
                              styles={{
                                control: (base, state) => ({
                                  ...base,
                                  borderColor:
                                    methods.formState.errors.job_role_id ||
                                    methods.formState.errors.other_job_role
                                      ? "#ef4444"
                                      : state.isFocused
                                        ? "#9bc87c"
                                        : base.borderColor,
                                  boxShadow: state.isFocused
                                    ? `0 0 0 1px #9bc87c`
                                    : "none",
                                  "&:hover": {
                                    borderColor:
                                      methods.formState.errors.job_role_id ||
                                      methods.formState.errors.other_job_role
                                        ? "#ef4444"
                                        : "#9bc87c",
                                  },
                                  minHeight: 40,
                                }),
                                option: (base, state) => ({
                                  ...base,
                                  backgroundColor: state.isSelected
                                    ? "#9bc87c"
                                    : state.isFocused
                                      ? "#e6f4dc"
                                      : "white",
                                  color: state.isSelected ? "white" : "#1f2937",
                                }),
                                multiValue: (base) => ({
                                  ...base,
                                  backgroundColor: "#9bc87c",
                                  color: "white",
                                }),
                                multiValueLabel: (base) => ({
                                  ...base,
                                  color: "white",
                                }),
                                multiValueRemove: (base) => ({
                                  ...base,
                                  color: "white",
                                  ":hover": {
                                    backgroundColor: "#88b86a",
                                    color: "white",
                                  },
                                }),
                              }}
                            />
                          )}
                        />
                      )}
                    </div>

                    <div className="pt-6 border-t">
                      <DomainSkillsSelector
                        jobRoleId={methods.watch("job_role_id")}
                        selectedDomainSkills={selectedDomainSkills}
                        onDomainSkillsChange={handleDomainSkillsChange}
                        error={methods.formState.errors.skill_ids?.message}
                        showMustHaveToggle={
                          formConfig.showMustHaveToggleInSkills
                        }
                        showExperienceInput={
                          formConfig.showMinExperienceInputInSkills
                        }
                      />
                    </div>

                    <div>
                      <Label htmlFor="minSkillMatchRequired">
                        Minimum Percentage of Skill Match Required
                        <span className="ml-1 text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        placeholder="e.g. 70"
                        min="0"
                        max="100"
                        {...methods.register("minSkillMatchRequired", {
                          valueAsNumber: true,
                        })}
                        error={
                          methods.formState.errors.minSkillMatchRequired
                            ?.message
                        }
                      />
                    </div>
                  </div>

                  {/* === SECTION 5: POSTING TYPE SPECIFIC (College) === */}
                  {formConfig.showCollegeSelector && (
                    <div className="mt-6 ">
                      <div className="flex items-center mb-2">
                        <Label htmlFor="eligiblecollege_ids">
                          College Name
                        </Label>
                      </div>
                      <SearchableSelect
                        options={collegeDropdownOptions}
                        value={(() => {
                          const ids =
                            methods.watch("eligiblecollege_ids") || [];
                          const customs = (
                            methods.watch("other_eligible_college_names") || []
                          ).map((name) => ({ __custom: name }));
                          return [...ids, ...customs];
                        })()}
                        onChange={(mixedValues) => {
                          const ids = mixedValues.filter(
                            (v) => typeof v === "number",
                          );
                          const customNames = mixedValues
                            .filter((v) => typeof v === "object" && v.__custom)
                            .map((v) => v.__custom);
                          methods.setValue("eligiblecollege_ids", ids, {
                            shouldValidate: true,
                          });
                          methods.setValue(
                            "other_eligible_college_names",
                            customNames,
                            { shouldValidate: true },
                          );
                          const newCache = [];
                          ids.forEach((id) => {
                            const found =
                              collegeDropdownOptions.find(
                                (c) => Number(c.id) === Number(id),
                              ) ||
                              cachedColleges.find(
                                (c) => Number(c.id) === Number(id),
                              );
                            if (found) newCache.push(found);
                          });
                          setCachedColleges(newCache);
                        }}
                        placeholder="Search tie-up colleges..."
                        isMulti={true}
                        isCreatable={true}
                        getOptionLabel={(opt) => opt.name}
                        getOptionValue={(opt) => opt.id}
                        inputValue={collegeSearchText}
                        onInputChange={(val) => setCollegeSearchText(val)}
                        isLoading={isCollegeListLoading}
                        maxDropdownOptions={200}
                      />
                      {collegeListError && (
                        <p className="mt-1 text-sm text-red-600">
                          {collegeListError}
                        </p>
                      )}
                      {isCollegeListLoading && !collegeListError && (
                        <p className="mt-1 text-sm text-gray-500">
                          Loading tie-up colleges...
                        </p>
                      )}
                      {!isCollegeListLoading &&
                        !collegeListError &&
                        tieUpCollegesList.length === 0 && (
                          <p className="mt-1 text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded px-2 py-1.5">
                            No tie-up colleges available.
                          </p>
                        )}
                    </div>
                  )}

                  {/* === SECTION 2: OPPORTUNITY SPECIFIC (Conditional) === */}

                  {/* Internship Only */}
                  {formConfig.showDuration && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="duration_id">
                          Internship duration
                          <span className="ml-1 text-red-500">*</span>
                        </Label>
                        <SearchableSelect
                          options={enrichedDurations || []}
                          value={
                            methods.watch("duration_id") !== null
                              ? methods.watch("duration_id")
                              : methods.watch("other_duration")
                                ? {
                                    __create: true,
                                    value: methods.watch("other_duration"),
                                  }
                                : null
                          }
                          displayValue={
                            methods.watch("duration_id") === null
                              ? methods.watch("other_duration") || null
                              : null
                          }
                          onChange={(value) => {
                            if (value?.__create) {
                              methods.setValue("other_duration", value.value, {
                                shouldValidate: true,
                              });
                              methods.setValue("duration_id", null, {
                                shouldValidate: true,
                              });
                            } else {
                              methods.setValue("duration_id", value, {
                                shouldValidate: true,
                              });
                              methods.setValue("other_duration", "", {
                                shouldValidate: false,
                              });
                            }
                          }}
                          placeholder="Select or create duration..."
                          error={
                            methods.formState.errors.duration_id?.message ||
                            methods.formState.errors.other_duration?.message
                          }
                          getOptionLabel={(opt) => opt.value}
                          getOptionValue={(opt) => opt.id}
                          renderOption={(opt) => (
                            <span className="flex items-center">
                              {opt.value}
                              {opt.is_recommended && (
                                <span className="ml-2 text-xs font-medium text-green-600 bg-green-100 px-1.5 py-0.5 rounded whitespace-nowrap">
                                  (Recommended)
                                </span>
                              )}
                            </span>
                          )}
                          isCreatable
                        />
                      </div>
                      <div>
                        <Label htmlFor="internship_start_date">
                          Internship start date
                        </Label>
                        <div className={radioContainerStyles}>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="false"
                              className={radioStyles}
                              checked={!is_custom_internship_date}
                              onChange={() =>
                                methods.setValue(
                                  "is_custom_internship_date",
                                  false,
                                )
                              }
                            />
                            <span className="text-sm text-gray-700">
                              Immediately (within 30 days)
                            </span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="true"
                              className={radioStyles}
                              checked={is_custom_internship_date}
                              onChange={() =>
                                methods.setValue(
                                  "is_custom_internship_date",
                                  true,
                                )
                              }
                            />
                            <span className="text-sm text-gray-700">
                              Custom
                            </span>
                          </label>
                        </div>
                      </div>
                      {is_custom_internship_date && (
                        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                          <div className="flex-1">
                            <Label>From Date</Label>
                            <Input
                              type="date"
                              {...methods.register("internship_from_date")}
                              error={
                                methods.formState.errors.internship_from_date
                                  ?.message
                              }
                            />
                          </div>
                          <div className="flex-1">
                            <Label>To Date</Label>
                            <Input
                              type="date"
                              {...methods.register("internship_to_date")}
                              error={
                                methods.formState.errors.internship_to_date
                                  ?.message
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Project Only */}
                  {formConfig.showProjectDates && (
                    <div className="p-4 mt-4 border rounded-lg bg-gray-50">
                      <h3 className="mb-3 font-bold">Project Timeline</h3>
                      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                        <div className="flex-1">
                          <Label>Project Start</Label>
                          <Input
                            type="date"
                            {...methods.register("project_start_date")}
                            error={
                              methods.formState.errors.project_start_date
                                ?.message
                            }
                          />
                        </div>
                        <div className="flex-1">
                          <Label>Project End</Label>
                          <Input
                            type="date"
                            {...methods.register("project_end_date")}
                            error={
                              methods.formState.errors.project_end_date?.message
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* === SECTION 3: COMMON WORK DETAILS === */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="job_type">
                        {opportunity_type === "Internship"
                          ? "Internship Type"
                          : opportunity_type === "Job"
                            ? "Job Type"
                            : "Project Type"}
                        <span className="ml-1 text-red-500">*</span>
                      </Label>
                      <div className={radioContainerStyles}>
                        {["In office", "Hybrid", "Remote"].map((type) => (
                          <label
                            key={type}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="radio"
                              value={type}
                              className={radioStyles}
                              {...methods.register("job_type")}
                            />
                            <span className="text-sm text-gray-700">
                              {type}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {job_type === "Hybrid" && (
                      <div className="my-3">
                        <Label htmlFor="days_in_office">
                          No. of in-office days in a week:
                        </Label>
                        <div className="flex gap-1 sm:gap-3 md:gap-8">
                          {[1, 2, 3, 4, 5].map((day) => (
                            <button
                              key={day}
                              type="button"
                              className={`w-10 h-10 rounded-full border text-sm font-semibold flex items-center justify-center transition
                                ${
                                  methods.getValues("days_in_office") === day
                                    ? "bg-[#9bc87c] text-white border-[#9bc87c]"
                                    : "bg-white text-gray-700 border-gray-300"
                                }
                                hover:border-[#9bc87c]`}
                              onClick={() =>
                                methods.setValue("days_in_office", day, {
                                  shouldValidate: true,
                                })
                              }
                            >
                              {day}
                            </button>
                          ))}
                        </div>
                        {methods.formState.errors.days_in_office?.message && (
                          <p className="mt-1 text-sm text-red-600">
                            {methods.formState.errors.days_in_office?.message}
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <Label htmlFor="job_time">
                        Work Schedule
                        <span className="ml-1 text-red-500">*</span>
                      </Label>
                      <div className={radioContainerStyles}>
                        {["Day Shift", "Night Shift", "Part-time"].map(
                          (schedule) => (
                            <label
                              key={schedule}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="radio"
                                value={schedule}
                                className={radioStyles}
                                {...methods.register("job_time")}
                              />
                              <span className="text-sm text-gray-700">
                                {schedule}
                              </span>
                            </label>
                          ),
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="number_of_openings">
                        Number of openings
                        <span className="ml-1 text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        placeholder="e.g. 4"
                        min="1"
                        {...methods.register("number_of_openings", {
                          valueAsNumber: true,
                        })}
                        error={
                          methods.formState.errors.number_of_openings?.message
                        }
                      />
                    </div>
                  </div>

                  {/* === SECTION 4: EDUCATION === */}
                  <div className="mt-6">
                    <Label htmlFor="eligible_education_levels">
                      Eligible Education Levels
                    </Label>
                    <SearchableSelect
                      options={EDUCATION_LEVELS}
                      value={(() => {
                        const levels =
                          methods.watch("eligible_education_levels") || [];
                        const customs = levels
                          .filter(
                            (l) =>
                              !EDUCATION_LEVELS.some((opt) => opt.id === l),
                          )
                          .map((l) => ({ __custom: l }));
                        const selected = levels.filter((l) =>
                          EDUCATION_LEVELS.some((opt) => opt.id === l),
                        );
                        return [...selected, ...customs];
                      })()}
                      onChange={(mixedValues) => {
                        const ids = mixedValues.filter(
                          (v) => typeof v === "string",
                        );
                        methods.setValue("eligible_education_levels", ids, {
                          shouldValidate: true,
                        });
                      }}
                      placeholder="Select levels (e.g., Bachelor's, Master's)"
                      isMulti
                      isCreatable
                      getOptionLabel={(opt) => opt.name}
                      getOptionValue={(opt) => opt.id}
                    />
                    {/* <div className="mt-4">
                      <Label htmlFor="eligiblecourse_ids">
                        Courses (e.g., B.Tech, MBA, B.Sc)
                      </Label>
                      {courseError && (
                        <div className="p-2 mb-2 text-xs text-red-700 rounded-md bg-red-50">
                          {courseError}
                        </div>
                      )}
                      {(() => {
                        const selectedIds = methods.watch("eligiblecourse_ids") || [];
                        const optionsPool = [...searchedCourses];
                        cachedCourses.forEach(cached => {
                          if (!optionsPool.some(opt => opt.id === cached.id)) {
                            optionsPool.push(cached);
                          }
                        });
                        return (
                          <SearchableSelect
                            options={optionsPool}
                            inputValue={courseSearch}
                        
                            onInputChange={(val) => {
                              setCourseSearch(val);
                              if (val.length < 2) setSearchedCourses([]);
                            }}
                            isLoading={isCourseLoading}
                            value={(() => {
                              const ids = methods.watch("eligiblecourse_ids") || [];
                              const customs = (methods.watch("other_eligible_course_names") || [])
                                .filter(n => n.trim())
                                .map(name => ({ __custom: name }));
                              return [...ids, ...customs];
                            })()}
                            onChange={(mixedValues) => {
                              const ids = mixedValues.filter(v => typeof v === 'number');
                              const customNames = mixedValues
                                .filter(v => typeof v === 'object' && v.__custom)
                                .map(v => v.__custom.trim());
                              methods.setValue("eligiblecourse_ids", ids, { shouldValidate: true });
                              methods.setValue("other_eligible_course_names", customNames, { shouldValidate: true });
                              const newCache = [];
                              ids.forEach(id => {
                                const foundInSearch = searchedCourses.find(c => c.id === id);
                                const foundInCache = cachedCourses.find(c => c.id === id);
                                if (foundInSearch) newCache.push(foundInSearch);
                                else if (foundInCache) newCache.push(foundInCache);
                              });
                              setCachedCourses(newCache);
                              if (mixedValues.length > (methods.watch("eligiblecourse_ids")?.length || 0)) {
                                setCourseSearch("");
                                setSearchedCourses([]);
                              }
                            }}
                            placeholder="Search courses... [Min 3 chars]"
                            isMulti
                            isCreatable
                            getOptionLabel={(opt) => opt.name}
                            getOptionValue={(opt) => opt.id}
                            noOptionsMessage={() =>
                              courseSearch.length < 2
                                ? "Type at least 3 characters to search"
                                : courseError
                                  ? "Search failed. Check connection."
                                  : "No courses found"
                            }
                          />
                        );
                      })()}
                    </div> */}

                    <div className="mt-4">
                      <Label htmlFor="eligiblecourse_ids">
                        Courses (e.g., B.Tech, MBA, B.Sc)
                      </Label>

                      {courseError && (
                        <div className="p-2 mb-2 text-xs text-red-700 rounded-md bg-red-50">
                          {courseError}
                        </div>
                      )}

                      {(() => {
                        const selectedIds =
                          methods.watch("eligiblecourse_ids") || [];

                        const optionsPool = [...searchedCourses];

                        cachedCourses.forEach((cached) => {
                          if (
                            !optionsPool.some((opt) => opt.id === cached.id)
                          ) {
                            optionsPool.push(cached);
                          }
                        });

                        return (
                          <SearchableSelect
                            options={optionsPool}
                            inputValue={courseSearch}
                            onMenuOpen={() => setCourseSearch("")}
                            onInputChange={(val) => {
                              setCourseSearch(val);
                            }}
                            isLoading={isCourseLoading}
                            value={(() => {
                              const ids =
                                methods.watch("eligiblecourse_ids") || [];

                              const customs = (
                                methods.watch("other_eligible_course_names") ||
                                []
                              )
                                .filter((n) => n.trim())
                                .map((name) => ({
                                  __custom: name,
                                }));

                              return [...ids, ...customs];
                            })()}
                            onChange={(mixedValues) => {
                              const ids = mixedValues.filter(
                                (v) => typeof v === "number",
                              );

                              const customNames = mixedValues
                                .filter(
                                  (v) => typeof v === "object" && v.__custom,
                                )
                                .map((v) => v.__custom.trim());

                              methods.setValue("eligiblecourse_ids", ids, {
                                shouldValidate: true,
                              });

                              methods.setValue(
                                "other_eligible_course_names",
                                customNames,
                                { shouldValidate: true },
                              );

                              const newCache = [];

                              ids.forEach((id) => {
                                const foundInSearch = searchedCourses.find(
                                  (c) => c.id === id,
                                );

                                const foundInCache = cachedCourses.find(
                                  (c) => c.id === id,
                                );

                                if (foundInSearch) newCache.push(foundInSearch);
                                else if (foundInCache)
                                  newCache.push(foundInCache);
                              });

                              setCachedCourses(newCache);

                              if (
                                mixedValues.length >
                                (methods.watch("eligiblecourse_ids")?.length ||
                                  0)
                              ) {
                                setCourseSearch("");
                                setSearchedCourses([]);
                              }
                            }}
                            placeholder="Search courses..."
                            isMulti
                            isCreatable
                            getOptionLabel={(opt) => opt.name}
                            getOptionValue={(opt) => opt.id}
                            noOptionsMessage={() =>
                              courseError
                                ? "Search failed. Check connection."
                                : "No options available"
                            }
                          />
                        );
                      })()}
                    </div>
                    {resolvedOpportunityType === "Internship" && (
                      <div className="flex items-center gap-2 p-3 mt-3 rounded-lg bg-gray-50">
                        <input
                          type="checkbox"
                          className={checkboxStyles}
                          {...methods.register("include_pursuing_students")}
                        />
                        <span className="text-sm text-gray-700">
                          Include students currently pursuing the above
                          qualifications
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Job & Project Only (Hide for Internship) */}
                  {formConfig.showExperience && (
                    <div className="mt-4 ">
                      {/* <h3 className="mb-3 font-bold">Experience Requirements</h3> */}
                      <Label htmlFor="experience_required">
                        Experience Required?
                      </Label>
                      <div className={radioContainerStyles}>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            className={radioStyles}
                            checked={!methods.watch("experience_required")}
                            onChange={() =>
                              methods.setValue("experience_required", false)
                            }
                          />
                          <span className="text-sm text-gray-700">
                            No / Freshers allowed
                          </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            className={radioStyles}
                            checked={!!methods.watch("experience_required")}
                            onChange={() =>
                              methods.setValue("experience_required", true)
                            }
                          />
                          <span className="text-sm text-gray-700">Yes</span>
                        </label>
                      </div>
                      {methods.watch("experience_required") && (
                        <div className="mt-4 space-y-4">
                          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                            <div className="flex-1">
                              <Label>Min Experience (years)</Label>
                              <Input
                                type="number"
                                min="0"
                                placeholder="e.g., 2"
                                {...methods.register("experience_min", {
                                  valueAsNumber: true,
                                })}
                                error={
                                  methods.formState.errors.experience_min
                                    ?.message
                                }
                              />
                            </div>
                            <div className="flex-1">
                              <Label>Max Experience (years) — Optional</Label>
                              <Input
                                type="number"
                                min="0"
                                placeholder="e.g., 5"
                                {...methods.register("experience_max", {
                                  valueAsNumber: true,
                                })}
                                error={
                                  methods.formState.errors.experience_max
                                    ?.message
                                }
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* === SECTION 6: COMPENSATION === */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="stipend_type">
                        {opportunity_type === "Internship"
                          ? "Stipend"
                          : opportunity_type === "Job"
                            ? "Fixed Pay"
                            : "Project Budget"}
                        <span className="ml-1 text-red-500">*</span>
                      </Label>
                      <div className={radioContainerStyles}>
                        {(opportunity_type === "Internship"
                          ? ["Paid", "Unpaid"]
                          : opportunity_type === "Job"
                            ? ["Fixed", "Variable"]
                            : ["Variable"]
                        ).map((type) => (
                          <label
                            key={type}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="radio"
                              value={type}
                              className={radioStyles}
                              {...methods.register("stipend_type")}
                            />
                            <span className="text-sm text-gray-700">
                              {type}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {(() => {
                      const isProject = opportunity_type === "Project";
                      const isFixed = stipend_type === "Fixed";
                      const showSingle = isProject && isFixed;
                      const shouldShow =
                        (opportunity_type === "Internship" &&
                          stipend_type === "Paid") ||
                        (opportunity_type === "Job" &&
                          ["Fixed", "Variable"].includes(stipend_type)) ||
                        opportunity_type === "Project";
                      if (!shouldShow) return null;
                      return (
                        <div>
                          <Label
                            htmlFor={
                              showSingle ? "stipend_fixed" : "stipend_range"
                            }
                          >
                            {isProject
                              ? "Project Budget Range"
                              : opportunity_type === "Internship"
                                ? "Stipend Range"
                                : `${stipend_type} Pay Range`}
                          </Label>
                          {showSingle ? (
                            <Input
                              type="number"
                              placeholder="₹ Total amount"
                              min="0"
                              {...methods.register("stipend_min", {
                                valueAsNumber: true,
                              })}
                              error={
                                methods.formState.errors.stipend_min?.message
                              }
                            />
                          ) : (
                            <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                              <Input
                                type="number"
                                placeholder="₹ Min"
                                min="0"
                                {...methods.register("stipend_min", {
                                  valueAsNumber: true,
                                })}
                                error={
                                  methods.formState.errors.stipend_min?.message
                                }
                              />
                              <Input
                                type="number"
                                placeholder="₹ Max"
                                min="0"
                                {...methods.register("stipend_max", {
                                  valueAsNumber: true,
                                })}
                                error={
                                  methods.formState.errors.stipend_max?.message
                                }
                              />
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {opportunity_type === "Internship" &&
                      stipend_type === "Paid" && (
                        <div>
                          <Label htmlFor="incentive_per_year">Incentives</Label>
                          <Input
                            type="text"
                            placeholder="e.g. Performance based, ₹5000-10000"
                            {...methods.register("incentive_per_year")}
                          />
                        </div>
                      )}
                  </div>

                  {/* === SECTION 7: DETAILS & CONTACT === */}
                  <div className="space-y-4">
                    {formConfig.showBenefits && (
                      <div>
                        <Label htmlFor="perks">
                          {formConfig.perksLabel} (Select all that apply)
                        </Label>
                        <div className="grid grid-cols-1 gap-2 p-3 rounded-lg sm:grid-cols-2 sm:gap-3 bg-gray-50">
                          {(opportunity_type === "Internship"
                            ? [
                                "Certificate of completion",
                                "Letter of recommendation",
                                "Flexible work hours",
                                "5 days a week",
                                "Informal dress code",
                                "Free snacks & beverages",
                              ]
                            : [
                                "5 days a week",
                                "Health Insurance",
                                "Life Insurance",
                                "Flexible work hours",
                              ]
                          ).map((perk) => (
                            <label
                              key={perk}
                              className="flex items-center gap-2 cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                value={perk}
                                className={checkboxStyles}
                                {...methods.register("perks")}
                              />
                              <span className="text-sm text-gray-700">
                                {perk}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Screening Questions */}
                    {formConfig.showScreeningQuestions && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <label className="text-sm font-medium text-gray-700">
                              Screening Questions
                            </label>
                            <div className="relative group">
                              <FaInfoCircle className="text-sm text-[#9bc87c] cursor-pointer" />
                              <div className="absolute left-0 z-10 hidden p-3 mb-2 text-xs bg-white border border-gray-200 rounded-md shadow-lg w-80 bottom-full group-hover:block">
                                <p className="font-medium">
                                  💡 Good screening questions:
                                </p>
                                <ul className="pl-4 mt-1 space-y-1 text-gray-700 list-disc">
                                  <li>Are specific and actionable</li>
                                  <li>
                                    Ask about availability, tools, or key
                                    experience
                                  </li>
                                  <li>Fit in 1–2 lines (≤200 chars)</li>
                                </ul>
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              const input = prepareAIInput();
                              if (!input.title || input.skills.length === 0) {
                                alert(
                                  "Please select a job role and at least one skill first.",
                                );
                                return;
                              }
                              setIsAiGenerating(true);
                              try {
                                const result = await generateContent(input);
                                if (
                                  result &&
                                  Array.isArray(result.screeningQuestions)
                                ) {
                                  const current =
                                    methods.getValues("screening_questions") ||
                                    [];
                                  if (current.length === 0) {
                                    methods.setValue(
                                      "screening_questions",
                                      result.screeningQuestions.slice(0, 5),
                                      { shouldValidate: true },
                                    );
                                  } else {
                                    const merged = [
                                      ...current,
                                      ...result.screeningQuestions,
                                    ].slice(0, 5);
                                    methods.setValue(
                                      "screening_questions",
                                      merged,
                                      { shouldValidate: true },
                                    );
                                  }
                                }
                              } finally {
                                setIsAiGenerating(false);
                              }
                            }}
                            disabled={isAiGenerating}
                            className="px-2 py-1 text-xs font-medium text-green-800 bg-[#eaf4e3] rounded hover:bg-[#d8ecc7] disabled:opacity-50"
                          >
                            {isAiGenerating ? "Generating..." : "AI Suggest"}
                          </button>
                        </div>
                        <Controller
                          name="screening_questions"
                          control={methods.control}
                          render={({ field: { value = [], onChange } }) => {
                            const handleAddQuestion = () => {
                              const newVal = [...value, ""];
                              onChange(newVal);
                              setTimeout(() => {
                                const inputs = document.querySelectorAll(
                                  'input[name^="screening_questions"]',
                                );
                                inputs[inputs.length - 1]?.focus();
                              }, 10);
                            };
                            const handleRemove = (index, text) => {
                              if (undoTimeout) clearTimeout(undoTimeout);
                              setDeletedQuestion({ index, text });
                              const newVal = value.filter(
                                (_, i) => i !== index,
                              );
                              onChange(newVal);
                              const timeout = setTimeout(() => {
                                setDeletedQuestion({ index: -1, text: "" });
                              }, 5000);
                              setUndoTimeout(timeout);
                            };
                            const handleUndo = () => {
                              if (deletedQuestion.index !== -1) {
                                const newVal = [...value];
                                newVal.splice(
                                  deletedQuestion.index,
                                  0,
                                  deletedQuestion.text,
                                );
                                onChange(newVal.slice(0, 5));
                                setDeletedQuestion({ index: -1, text: "" });
                                if (undoTimeout) clearTimeout(undoTimeout);
                              }
                            };
                            return (
                              <div className="space-y-3">
                                {value &&
                                  value.map((q, idx) => (
                                    <div
                                      key={idx}
                                      className="flex flex-col gap-1 p-3 border border-gray-200 rounded-lg bg-gray-50 group"
                                    >
                                      <input
                                        type="text"
                                        value={q}
                                        onChange={(e) => {
                                          const newVal = [...value];
                                          newVal[idx] = e.target.value;
                                          onChange(newVal);
                                        }}
                                        onBlur={(e) => {
                                          const trimmed = e.target.value.slice(
                                            0,
                                            200,
                                          );
                                          if (trimmed !== e.target.value) {
                                            const newVal = [...value];
                                            newVal[idx] = trimmed;
                                            onChange(newVal);
                                          }
                                        }}
                                        onKeyDown={(e) => {
                                          if (
                                            e.key === "Enter" &&
                                            !e.shiftKey &&
                                            value.length < 5
                                          ) {
                                            e.preventDefault();
                                            handleAddQuestion();
                                          }
                                        }}
                                        placeholder={`Question ${idx + 1} (e.g., "Are you available for full-time remote work?")`}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[rgba(155,200,124,0.3)] focus:border-[#9bc87c]"
                                        maxLength={200}
                                      />
                                      <div className="flex items-center justify-between">
                                        <span
                                          className={`text-xs ${q.length > 180 ? "text-orange-600 font-medium" : "text-gray-500"}`}
                                        >
                                          {q.length}/200
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => handleRemove(idx, q)}
                                          className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800"
                                          aria-label="Remove question"
                                        >
                                          <FaTimes className="w-3 h-3" /> Remove
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                {value.length < 5 && (
                                  <button
                                    type="button"
                                    onClick={handleAddQuestion}
                                    className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-green-700 transition-colors border-2 border-[#9bc87c] border-dashed rounded-lg hover:bg-[#f3f9ee]"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="w-4 h-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                      />
                                    </svg>
                                    Add another question ({value.length}/5)
                                  </button>
                                )}
                                {value.length === 5 && (
                                  <p className="text-xs italic text-gray-500">
                                    ✅ Maximum of 5 questions reached.
                                  </p>
                                )}
                                {deletedQuestion.index !== -1 && (
                                  <div className="flex items-center justify-between p-2 text-sm border border-[#9bc87c] rounded-md bg-[#f3f9ee]">
                                    <span className="text-green-900">
                                      Removed a question.{" "}
                                      <button
                                        onClick={handleUndo}
                                        className="underline"
                                      >
                                        Undo?
                                      </button>
                                    </span>
                                    <button
                                      onClick={() => {
                                        setDeletedQuestion({
                                          index: -1,
                                          text: "",
                                        });
                                        if (undoTimeout)
                                          clearTimeout(undoTimeout);
                                      }}
                                      className="text-green-700 hover:text-green-900"
                                    >
                                      <FaTimes className="w-3 h-3" />
                                    </button>
                                  </div>
                                )}
                                {methods.formState.errors
                                  .screening_questions && (
                                  <p className="mt-2 text-sm text-red-600">
                                    {Array.isArray(
                                      methods.formState.errors
                                        .screening_questions,
                                    )
                                      ? methods.formState.errors
                                          .screening_questions[0]?.message
                                      : methods.formState.errors
                                          .screening_questions.message}
                                  </p>
                                )}
                              </div>
                            );
                          }}
                        />
                      </div>
                    )}

                    {/* Location */}
                    {/* <div>
                      <Label htmlFor="eligiblecity_ids">
                        City/Cities
                        <span className="ml-1 text-red-500">*</span>
                      </Label>
                      {locationError && (
                        <div className="p-2 mb-2 text-xs text-red-700 rounded-md bg-red-50">
                          {locationError}
                        </div>
                      )}
                      {(() => {
                        const selectedIds = methods.watch("eligiblecity_ids") || [];
                        return (
                          <SearchableSelect
                            options={[...locationOptions, ...cachedLocations]}
                            inputValue={locationSearchText}
                            onInputChange={(val) => {
                              setLocationSearchText(val);
                              if (val.length < 3) setLocationOptions([]);
                            }}
                            isLoading={isLocationLoading}
                            value={methods.watch("eligiblecity_ids") || []}
                            onChange={(selectedIds) => {
                              methods.setValue("eligiblecity_ids", selectedIds, { shouldValidate: true });
                              methods.setValue("other_eligible_city_names", [], { shouldValidate: false });
                              const newCache = [];
                              selectedIds.forEach(id => {
                                const found = locationOptions.find(l => l.id === id) || cachedLocations.find(l => l.id === id);
                                if (found) newCache.push(found);
                              });
                              setCachedLocations(newCache);
                              if (selectedIds.length > (methods.watch("eligiblecity_ids")?.length || 0)) {
                                setLocationSearchText("");
                                setLocationOptions([]);
                              }
                            }}
                            placeholder="Search cities... [Min 3 chars]"
                            error={methods.formState.errors.eligiblecity_ids?.message}
                            isMulti={true}
                            getOptionLabel={(opt) => opt.name}
                            getOptionValue={(opt) => opt.id}
                            noOptionsMessage={() =>
                              locationSearchText.length < 3
                                ? "Type at least 3 characters to search"
                                : locationError
                                  ? "Search failed. Check connection."
                                  : "No cities found"
                            }
                          />
                        );
                      })()}
                    </div> */}
                    {/* Location */}
                    <div>
                      <Label htmlFor="eligiblecity_ids">
                        City/Cities
                        <span className="ml-1 text-red-500">*</span>
                      </Label>
                      <Controller
                        name="eligiblecity_ids"
                        control={methods.control}
                        render={({ field }) => (
                          <GreenAsyncCreatableMultiSelect
                            placeholder="Search cities..."
                            error={
                              methods.formState.errors.eligiblecity_ids?.message
                            }
                            value={(() => {
                              const ids = field.value || [];
                              const customNames =
                                methods.watch("other_eligible_city_names") ||
                                [];
                              // Ab yahan real naam dikhega!
                              const mappedIds = ids.map((id) => {
                                const found = cachedLocations.find(
                                  (l) => Number(l.id) === Number(id),
                                );
                                return {
                                  value: String(id),
                                  label: found ? found.name : `City ${id}`,
                                };
                              });
                              const mappedCustoms = customNames.map((name) => ({
                                value: "__custom__",
                                label: name,
                              }));
                              return [...mappedIds, ...mappedCustoms];
                            })()}
                            onChange={(selectedOptions) => {
                              const arr = selectedOptions || [];
                              const ids = arr
                                .filter((o) => o.value !== "__custom__")
                                .map((o) => Number(o.value));
                              const customs = arr
                                .filter((o) => o.value === "__custom__")
                                .map((o) => o.label);

                              field.onChange(ids);
                              methods.setValue(
                                "other_eligible_city_names",
                                customs,
                                { shouldValidate: true },
                              );

                              
                              const newCache = [...cachedLocations];
                              arr.forEach((opt) => {
                                if (
                                  opt.value !== "__custom__" &&
                                  !newCache.some(
                                    (c) => Number(c.id) === Number(opt.value),
                                  )
                                ) {
                                  newCache.push({
                                    id: opt.value,
                                    name: opt.label,
                                  });
                                }
                              });
                              setCachedLocations(newCache);
                            }}
                            loadOptions={async (query) => {
                              const res = await axios.get(
                                `${BASE_URL}/master/location/search`,
                                { params: { search: query } },
                              );
                              return (res.data?.data || []).map((loc) => ({
                                value: String(loc.id || loc.location_id),
                                label: loc.name || loc.city_name || loc.value,
                              }));
                            }}
                          />
                        )}
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <Label htmlFor="phone_contact">
                        Primary phone number
                        <span className="ml-1 text-red-500">*</span>
                      </Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-2 py-2 text-sm text-gray-600 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50">
                          <img
                            src="https://flagcdn.com/in.svg"
                            alt="IN"
                            className="w-4 h-4 mr-1"
                          />
                          +91
                        </span>
                        <input
                          type="tel"
                          placeholder="9812345678"
                          maxLength="10"
                          onInput={(e) => {
                            e.target.value = e.target.value.replace(/\D/g, "");
                          }}
                          className="flex-1 px-3 py-2 text-sm border border-l-0 border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[rgba(155,200,124,0.3)] focus:border-transparent"
                          {...methods.register("phone_contact", {
                            onChange: (e) => {
                              const val = e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 10);
                              e.target.value = val;
                              methods.setValue("phone_contact", val, {
                                shouldValidate: true,
                              });
                            },
                          })}
                        />
                      </div>
                      {methods.formState.errors.phone_contact?.message && (
                        <p className="mt-1 text-sm text-red-600">
                          {methods.formState.errors.phone_contact?.message}
                        </p>
                      )}
                    </div>

                    {formConfig.showAlternateContact && (
                      <div>
                        <Label htmlFor="alternate_phone_number">
                          Alternate phone number for this listing (Optional)
                        </Label>
                        <div className="flex">
                          <span className="inline-flex items-center px-2 py-2 text-sm text-gray-600 border border-r-0 border-gray-300 rounded-l-lg bg-gray-50">
                            <img
                              src="https://flagcdn.com/in.svg"
                              alt="IN"
                              className="w-4 h-4 mr-1"
                            />
                            +91
                          </span>
                          <input
                            type="tel"
                            placeholder="9876543210"
                            maxLength="10"
                            onInput={(e) => {
                              e.target.value = e.target.value.replace(
                                /\D/g,
                                "",
                              );
                            }}
                            className="flex-1 px-3 py-2 text-sm border border-l-0 border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-[rgba(155,200,124,0.3)] focus:border-transparent"
                            {...methods.register("alternate_phone_number")}
                          />
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="job_description">
                          {formConfig.descLabel}
                          <span className="ml-1 text-red-500">*</span>
                        </Label>
                        <button
                          type="button"
                          onClick={async () => {
                            const input = prepareAIInput();
                            if (!input.title) {
                              alert(
                                " Please select or enter a job/internship/project title first.",
                              );
                              return;
                            }
                            setIsAiGenerating(true);
                            try {
                              const result = await generateContent(input);
                              if (result?.description) {
                                setAiSuggestions((prev) => ({
                                  ...prev,
                                  description: result.description,
                                }));
                              }
                            } finally {
                              setIsAiGenerating(false);
                            }
                          }}
                          disabled={
                            !!methods.getValues("job_description") ||
                            isAiGenerating
                          }
                          className={`ml-2 text-xs px-2 py-1 rounded ${methods.getValues("job_description") ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-[#eaf4e3] text-green-800 hover:bg-[#d8ecc7]"}`}
                        >
                          {isAiGenerating ? "Generating..." : "AI Suggest"}
                        </button>
                      </div>
                      <Textarea
                        rows={6}
                        placeholder={
                          opportunity_type === "Internship"
                            ? "Selected intern day-to-day responsibilities include..."
                            : opportunity_type === "Job"
                              ? "Key responsibilities:\n1.\n2.\n3."
                              : "Project requirements:\n1.\n2.\n3."
                        }
                        {...methods.register("job_description", {
                          onChange: () => {
                            if (aiSuggestions.description) {
                              setAiSuggestions((prev) => ({
                                ...prev,
                                description: null,
                              }));
                            }
                          },
                        })}
                        error={
                          methods.formState.errors.job_description?.message
                        }
                      />
                      {/* {aiSuggestions.description && (
                        <div className="relative mt-2 overflow-hidden border border-[#9bc87c] rounded-md bg-[#f3f9ee]">
                          <div className="p-3 overflow-y-auto text-sm text-gray-700 whitespace-pre-wrap max-h-48">
                            {aiSuggestions.description}
                          </div>
                          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[#eaf4e3] border-t border-[#9bc87c]">
                            <button
                              type="button"
                              onClick={() => setAiSuggestions((prev) => ({ ...prev, description: null }))}
                              className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800"
                            >
                              <FaTimes className="w-3 h-3" />
                              Dismiss
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                methods.setValue("job_description", aiSuggestions.description || "", {
                                  shouldValidate: true,
                                });
                                setAiSuggestions((prev) => ({ ...prev, description: null }));
                              }}
                              className="text-xs font-medium text-green-800 hover:text-green-900 bg-white px-3 py-1.5 rounded-md shadow-sm border border-[#9bc87c] hover:bg-[#f3f9ee] transition"
                            >
                              ✅ Use this
                            </button>
                          </div>
                        </div>
                      )} */}

                      {aiSuggestions.description && (
                        <div className="relative mt-2 overflow-hidden border border-[#9bc87c] rounded-md bg-[#f3f9ee]">
                          <div className="p-3 overflow-y-auto text-sm text-gray-700 max-h-48">
                            <ul className="pl-5 space-y-1 list-disc">
                              {aiSuggestions.description
                                ?.split(/\.|\n/)
                                .filter((point) => point.trim() !== "")
                                .map((point, index) => (
                                  <li key={index}>{point.trim()}</li>
                                ))}
                            </ul>
                          </div>

                          {/* SAME BUTTONS (no change) */}
                          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[#eaf4e3] border-t border-[#9bc87c]">
                            <button
                              type="button"
                              onClick={() =>
                                setAiSuggestions((prev) => ({
                                  ...prev,
                                  description: null,
                                }))
                              }
                              className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800"
                            >
                              <FaTimes className="w-3 h-3" />
                              Dismiss
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const formattedText = aiSuggestions.description
                                  ?.split(/\.|\n/)
                                  .filter((point) => point.trim() !== "")
                                  .map((point) => `• ${point.trim()}`)
                                  .join("\n");

                                methods.setValue(
                                  "job_description",
                                  formattedText || "",
                                  {
                                    shouldValidate: true,
                                  },
                                );

                                setAiSuggestions((prev) => ({
                                  ...prev,
                                  description: null,
                                }));
                              }}
                              className="text-xs font-medium text-green-800 hover:text-green-900 bg-white px-3 py-1.5 rounded-md shadow-sm border border-[#9bc87c] hover:bg-[#f3f9ee] transition"
                            >
                              ✅ Use this
                            </button>
                          </div>
                        </div>
                      )}

                      {aiError && (
                        <p className="mt-1 text-xs text-red-600">{aiError}</p>
                      )}
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex flex-row justify-between gap-2 pt-4 mt-6 border-t border-gray-200 sm:gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={methods.handleSubmit(onSaveDraft, (errors) => {
                        console.log("Draft save validation failed:", errors);
                      })}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save Draft"}
                    </Button>
                    <Button
                      type="button"
                      loading={isSubmitting}
                      variant="primary"
                      onClick={async () => {
                        const isValid = await methods.trigger();
                        if (isValid) {
                          setShowPreviewModal(true);
                        } else {
                          const errors = methods.formState.errors;
                          const missingLabels = getMissingFieldLabels(
                            errors,
                            FIELD_LABELS,
                          );
                          if (missingLabels.length > 0) {
                            Swal.fire({
                              icon: "warning",
                              title: "Missing Required Information",
                              html: `
                                <p class="text-left mb-2">Please complete the following fields:</p>
                                <ul class="text-left text-gray-700" style="padding-left: 1.5rem; margin-top: 0.5rem;">
                                  ${missingLabels.map((label) => `<li>${label}</li>`).join("")}
                                </ul>
                              `,
                              confirmButtonText: "Go Back",
                              customClass: {
                                popup: "swal2-border-radius",
                                confirmButton: "swal2-confirm-btn",
                              },
                            });
                          }
                        }
                      }}
                    >
                      {isSubmitting ? "Posting..." : `Post ${opportunity_type}`}
                    </Button>
                  </div>
                </form>
              </FormProvider>
            )}

            {/* Confirmation Modal */}
            {showConfirmationModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
                  <div className="flex items-start">
                    <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-red-100 rounded-full">
                      <FaInfoCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">
                        Important Notice
                      </h3>
                      <div className="mt-2 text-sm text-gray-700">
                        <p>
                          ✅ Once submitted, the job/internship/project details{" "}
                          <strong>cannot be edited</strong>.
                        </p>
                        <p className="mt-1">
                          Please review all fields carefully before proceeding.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end mt-6 space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowConfirmationModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => {
                        setShowConfirmationModal(false);
                        methods.handleSubmit(onSubmit)();
                      }}
                    >
                      I Understand — Post {opportunity_type}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Preview Modal */}
            {showPreviewModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
                <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
                  <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">
                      ✅ Review Your {opportunity_type}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowPreviewModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FaTimes className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                      <h4 className="font-medium text-gray-700">Opportunity</h4>
                      <p className="text-lg font-semibold text-green-800">
                        {opportunity_type} •{" "}
                        {methods.watch("job_role_id") !== null
                          ? cachedJobRole?.title ||
                            `Job #${methods.watch("job_role_id")}`
                          : methods.watch("other_job_role") || "—"}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Work Type
                        </span>
                        <p className="font-medium">
                          {methods.watch("job_type")}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Schedule
                        </span>
                        <p className="font-medium">
                          {methods.watch("job_time")}
                        </p>
                      </div>
                      {job_type === "Hybrid" && (
                        <div>
                          <span className="text-xs font-medium text-gray-500">
                            In-Office Days/Week
                          </span>
                          <p className="font-medium">
                            {methods.watch("days_in_office")} days
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Openings
                        </span>
                        <p className="font-medium">
                          {methods.watch("number_of_openings")}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Status
                        </span>
                        <p className="font-medium">
                          {resolvedPostingType === "future"
                            ? "Inactive (Future)"
                            : "Active"}
                        </p>
                      </div>
                    </div>
                    {(() => {
                      const type = methods.watch("stipend_type");
                      const min = methods.watch("stipend_min");
                      const max = methods.watch("stipend_max");
                      const isProject = opportunity_type === "Project";
                      const isFixed = type === "Fixed";
                      if (!min && !max) return null;
                      let label, value;
                      if (isProject) {
                        label = "Project Budget";
                        value = isFixed
                          ? `₹${min?.toLocaleString()}`
                          : `₹${min?.toLocaleString()} – ₹${max?.toLocaleString()}`;
                      } else if (opportunity_type === "Internship") {
                        label = type === "Unpaid" ? "Stipend" : "Stipend Range";
                        value =
                          type === "Unpaid"
                            ? "Unpaid"
                            : `₹${min?.toLocaleString()} – ₹${max?.toLocaleString()}`;
                      } else {
                        label = "Pay";
                        value = `${type} • ₹${min?.toLocaleString()} – ₹${max?.toLocaleString()}`;
                      }
                      return (
                        <div>
                          <span className="text-xs font-medium text-gray-500">
                            {label}
                          </span>
                          <p className="font-medium">{value}</p>
                        </div>
                      );
                    })()}
                    {opportunity_type === "Internship" && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Internship Start
                        </span>
                        <p className="font-medium">
                          {methods.watch("is_custom_internship_date")
                            ? `${methods.watch("internship_from_date")} to ${methods.watch("internship_to_date")}`
                            : "Within 30 days"}
                        </p>
                      </div>
                    )}
                    {opportunity_type === "Project" && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Project Duration
                        </span>
                        <p className="font-medium">
                          {methods.watch("project_start_date")} →{" "}
                          {methods.watch("project_end_date")}
                        </p>
                      </div>
                    )}
                    {(methods.watch("eligiblecity_ids")?.length || 0) +
                      (methods
                        .watch("other_eligible_city_names")
                        ?.filter((n) => n.trim()).length || 0) >
                      0 && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Cities
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {[
                            ...(methods.watch("eligiblecity_ids") || []).map(
                              (id) =>
                                cachedLocations.find((l) => l.id === id)
                                  ?.name || `City ${id}`,
                            ),
                            ...(
                              methods.watch("other_eligible_city_names") || []
                            ).filter((n) => n.trim()),
                          ].map((city, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 text-xs bg-gray-100 rounded"
                            >
                              {city}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {(methods.watch("eligiblecollege_ids")?.length || 0) +
                      (methods
                        .watch("other_eligible_college_names")
                        ?.filter((n) => n.trim()).length || 0) >
                      0 && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Colleges
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {[
                            ...(methods.watch("eligiblecollege_ids") || []).map(
                              (id) =>
                                cachedColleges.find((c) => c.id === id)?.name ||
                                `College ${id}`,
                            ),
                            ...(
                              methods.watch("other_eligible_college_names") ||
                              []
                            ).filter((n) => n.trim()),
                          ].map((col, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 text-xs bg-[#eaf4e3] text-green-900 rounded"
                            >
                              {col}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {(methods.watch("eligiblecourse_ids")?.length || 0) +
                      (methods
                        .watch("other_eligible_course_names")
                        ?.filter((n) => n.trim()).length || 0) >
                      0 && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Courses
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {[
                            ...(methods.watch("eligiblecourse_ids") || []).map(
                              (id) => {
                                const cached = cachedCourses.find(
                                  (c) => c.id === id,
                                );
                                return cached?.name || `Course ${id}`;
                              },
                            ),
                            ...(
                              methods.watch("other_eligible_course_names") || []
                            ).filter((n) => n.trim()),
                          ].map((crs, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 text-xs bg-purple-100 rounded"
                            >
                              {crs}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {(methods.watch("eligible_education_levels")?.length || 0) >
                      0 && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Education Levels
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(
                            methods.watch("eligible_education_levels") || []
                          ).map((level, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 text-xs rounded bg-amber-100"
                            >
                              {EDUCATION_LEVELS.find((e) => e.id === level)
                                ?.name || level}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-medium text-gray-500">
                        Eligibility for Students
                      </span>
                      <p className="font-medium">
                        {methods.watch("include_pursuing_students")
                          ? "Includes currently pursuing students"
                          : "Only completed qualifications"}
                      </p>
                    </div>
                    {opportunity_type !== "Internship" && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Experience Required
                        </span>
                        {methods.watch("experience_required") ? (
                          <p className="font-medium">
                            {methods.watch("experience_min")} –{" "}
                            {methods.watch("experience_max") || "∞"} years
                          </p>
                        ) : (
                          <p className="font-medium">Freshers allowed</p>
                        )}
                      </div>
                    )}
                    {(selectedDomainSkills?.length || 0) > 0 && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Skills & Requirements
                        </span>
                        <div className="mt-2 space-y-3">
                          {selectedDomainSkills.map((domainCard, domainIdx) => {
                            const domainName =
                              domainCard.domain?.__custom ||
                              domainCard.domain?.name ||
                              "Unknown Domain";
                            const skills = domainCard.skills || [];
                            if (skills.length === 0) return null;
                            return (
                              <div
                                key={domainIdx}
                                className="pl-3 border-l-2 border-gray-200"
                              >
                                <h4 className="font-medium text-gray-800">
                                  {domainName}
                                </h4>
                                <ul className="mt-1.5 space-y-2">
                                  {skills.map((skill, skillIdx) => {
                                    const skillName =
                                      skill.skill_name ||
                                      skill.__custom ||
                                      "Unnamed Skill";
                                    const isMustHave = skill.mustHave;
                                    const minExp = skill.min_experience_months;
                                    return (
                                      <li
                                        key={skillIdx}
                                        className="flex items-start gap-3"
                                      >
                                        <span
                                          className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                                            isMustHave
                                              ? "bg-red-50 text-red-700 border border-red-200"
                                              : "bg-green-50 text-green-700 border border-green-200"
                                          }`}
                                        >
                                          {isMustHave
                                            ? "Must-have"
                                            : "Preferred"}
                                        </span>
                                        <span className="flex-1 text-sm font-medium text-gray-800">
                                          {skillName}
                                        </span>
                                        {minExp != null && minExp > 0 && (
                                          <span className="inline-flex items-center text-xs text-gray-600">
                                            <span className="mr-1">•</span>
                                            <span>≥{minExp} mo experience</span>
                                          </span>
                                        )}
                                      </li>
                                    );
                                  })}
                                </ul>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {(methods.watch("perks")?.length || 0) > 0 && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          {formConfig.perksLabel}
                        </span>
                        <ul className="text-sm text-gray-700 list-disc list-inside">
                          {methods.watch("perks")?.map((p, i) => (
                            <li key={i}>{p}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {(methods
                      .watch("screening_questions")
                      ?.filter((q) => q.trim()).length || 0) > 0 && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Screening Questions
                        </span>
                        <ul className="space-y-1 text-sm text-gray-700 list-decimal list-inside">
                          {methods
                            .watch("screening_questions")
                            ?.filter((q) => q.trim())
                            .map((q, i) => (
                              <li key={i}>{q}</li>
                            ))}
                        </ul>
                      </div>
                    )}
                    {methods.watch("women_preferred") && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Diversity Preference
                        </span>
                        <p className="text-sm text-gray-700">
                          Open to women restarting careers
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-medium text-gray-500">
                        Contact
                      </span>
                      <p className="text-sm text-gray-700">
                        Primary: +91 {methods.watch("phone_contact")}
                        {methods.watch("alternate_phone_number") &&
                          ` • Alt: +91 ${methods.watch("alternate_phone_number")}`}
                      </p>
                    </div>
                    {methods.watch("job_description") && (
                      <div>
                        <span className="text-xs font-medium text-gray-500">
                          Description
                        </span>
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {methods.watch("job_description")}
                        </p>
                      </div>
                    )}

                    {resolvedOpportunityType === "Project" && (
                      <div className="p-3 mt-4 border border-orange-200 rounded-md bg-orange-50">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <span className="text-xs leading-relaxed text-orange-800">
                            <strong>Important:</strong> By posting this project,
                            you acknowledge that Scilienttech acts only as a
                            connecting medium. The platform is
                            <strong>
                              {" "}
                              not liable for payments, deliverables, or disputes
                            </strong>{" "}
                            between you and the candidate. All financial
                            transactions and scope agreements must be handled
                            directly between both parties.
                          </span>
                        </label>
                      </div>
                    )}

                    <div className="p-3 mt-2 text-sm border border-yellow-200 rounded-md bg-yellow-50">
                      <div className="flex items-start">
                        <FaInfoCircle className="flex-shrink-0 mt-0.5 text-yellow-600" />
                        <p className="ml-2 text-yellow-800">
                          <strong>Important:</strong> Once posted, job details
                          (including education, skills, dates){" "}
                          <strong>cannot be edited</strong>. Only status and
                          visibility can be updated later.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 p-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowPreviewModal(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => {
                        setShowPreviewModal(false);
                        methods.handleSubmit(onSubmit)();
                      }}
                    >
                      ✅ Post {opportunity_type}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
