

// import React, { useState, useRef } from "react";
// import { useForm, Controller } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { recruiterApi } from "../../api/recruiterApi";
// import { useNavigate } from "react-router-dom";
// import { Input, Textarea, Button, Checkbox } from "../../components/ui";
// import SignUpLayout from "../../components/layout/SignUpLayout";
// import { useDispatch, useSelector } from "react-redux";
// import Select from "react-select";
// import useUploadImageApi from "../../hooks/useUploadImageApi";
// import { getImageUrl } from "../../../utils.js";
// import { updateUser } from "../../redux/feature/authSlice.js";
// import MainLayout from "../../components/layout/MainLayout.jsx";
// import { showSuccessAlert, showErrorAlert } from "../../utils/alertService";
// import axios from "axios";
// import CreatableSelectField from "../../components/ui/CreatableSelectField";
// import CreatableSelect from "react-select/creatable";
// import { completeCompanyProfile } from "../../redux/feature/authSlice";
// import ReactSelectDropdown from "../../components/ui/ReactSelectDropdown.jsx";
// const BASE_URL = import.meta.env.VITE_BASE_URL;
// const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2 MB
// const MAX_PROFILE_PIC_SIZE = 1 * 1024 * 1024; // 1 MB

// const formatFileSize = (bytes) => {
//   if (bytes < 1024) return bytes + " B";
//   else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
//   else return (bytes / (1024 * 1024)).toFixed(1) + " MB";
// };

// const ALLOW_CUSTOM_INDUSTRY = true;

// const formSchema = z
//   .object({
//     designation_id: z.string().nullable(),
//     other_designation_name: z.string().optional(),
//     company_name: z.string().optional(),
//     company_id: z.string().nullable().optional(),
//     industry_id: z.string().nullable().optional(),
//     custom_industry_name: z.string().optional(),
//     //  FIXED: Location ID = City ID only (Integer as string for form)
//     company_location_id: z.string().min(1, { message: "City is required" }),
//     //  NEW: Address Line Fields
//     address_line_1: z.string().min(1, { message: "Address Line 1 is required" }),
//     address_line_2: z.string().optional(),
//     //  Separate fields for State, Country, Pincode
//     state: z.string().min(1, { message: "State is required" }),
//     country: z.string().min(1, { message: "Country is required" }),
//     pincode: z.string().min(1, { message: "Pincode is required" }),
//     about: z
//       .string()
//       .min(10, { message: "About section must be at least 10 characters" })
//       .max(1000, { message: "About section must not exceed 1000 characters (~250 words)" }),
//     logo_url: z.string().min(1, "Logo is required").max(500),
//     profile_pic: z.string().min(1, "Profile picture is required").max(500),
//     language_ids: z.array(z.string()).optional(),
//     is_email_verified: z.boolean().default(true),
//     is_phone_verified: z.boolean().default(false),
//     is_gst_verified: z.boolean().default(false),
//     gst_number: z.string().optional(),
//     company_address: z.string().optional(),
//   })
//   .superRefine((data, ctx) => {
//     const hasValidDesignation = data.designation_id !== null && data.designation_id.trim() !== "";
//     const hasCustomDesignation = data.other_designation_name?.trim() !== "";
//     if (!hasValidDesignation && !hasCustomDesignation) {
//       ctx.addIssue({
//         path: ["designation_id"],
//         code: z.ZodIssueCode.custom,
//         message: "Designation is required",
//       });
//       ctx.addIssue({
//         path: ["other_designation_name"],
//         code: z.ZodIssueCode.custom,
//         message: "Designation is required",
//       });
//     }

//     const hasIndustryId = data.industry_id && data.industry_id.trim() !== "";
//     const hasCustomIndustry = ALLOW_CUSTOM_INDUSTRY && data.custom_industry_name && data.custom_industry_name.trim() !== "";
//     if (!hasIndustryId && !hasCustomIndustry) {
//       ctx.addIssue({
//         path: ["industry_id"],
//         code: z.ZodIssueCode.custom,
//         message: "Industry is required (Select one or type a new one)",
//       });
//     }
//   });

// export default function CompanyRecruiterProfile() {
//   const dispatch = useDispatch();
//   const [logoPreview, setLogoPreview] = useState(null);
//   const [profilePicPreview, setProfilePicPreview] = useState(null);
//   const { token, user } = useSelector((state) => state.auth);
//   const navigate = useNavigate();
//   const { uploadImage } = useUploadImageApi();
//   const [uploadingLogo, setUploadingLogo] = useState(false);
//   const [uploadingProfile, setUploadingProfile] = useState(false);
//   const [industryOptions, setIndustryOptions] = useState([]);
//   const [industryLoading, setIndustryLoading] = useState(false);
//   const industryDebounceRef = useRef(null);
//   const latestIndustryQueryRef = useRef("");
  
//   // Location State
//   const [locationOptions, setLocationOptions] = useState([]);
//   const [locationLoading, setLocationLoading] = useState(false);
//   const locationDebounceRef = useRef(null);
//   const latestLocationQueryRef = useRef("");

//   const [languageOptions, setLanguageOptions] = useState([]);
//   const [languageLoading, setLanguageLoading] = useState(false);
//   const languageDebounceRef = useRef(null);
//   const latestLanguageQueryRef = useRef("");
//   const [jobRoleOptions, setJobRoleOptions] = useState([]);
//   const [jobRoleLoading, setJobRoleLoading] = useState(false);
//   const jobRoleDebounceRef = useRef(null);
//   const latestJobRoleQueryRef = useRef("");
//   const [companyOptions, setCompanyOptions] = useState([]);
//   const [companyLoading, setCompanyLoading] = useState(false);
//   const companyDebounceRef = useRef(null);
//   const latestCompanyQueryRef = useRef("");

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//     reset,
//     control,
//     watch,
//     setValue,
//   } = useForm({
//     resolver: zodResolver(formSchema),
//     mode: "onTouched",
//     defaultValues: {
//       designation_id: "",
//       other_designation_name: "",
//       company_name: "",
//       company_id: "",
//       industry_id: "",
//       custom_industry_name: "",
//       company_location_id: "",
//       //  NEW: Default values for address lines
//       address_line_1: "",
//       address_line_2: "",
//       state: "",
//       country: "",
//       pincode: "",
//       about: "",
//       logo_url: "",
//       profile_pic: "",
//       language_ids: [],
//       is_email_verified: true,
//       is_phone_verified: false,
//       is_gst_verified: false,
//       gst_number: "",
//       company_address: "",
//     },
//   });

//   const fetchCompanies = async (query) => {
//     try {
//       setCompanyLoading(true);
//       const res = await fetch(`${BASE_URL}/master/companies/search?search=${query}`);
//       const json = await res.json();
//       if (latestCompanyQueryRef.current !== query) return;
//       setCompanyOptions(
//         (json.data || []).map((c) => ({
//           value: String(c.id),
//           label: c.company_name,
//           isExisting: true,
//         }))
//       );
//     } catch (error) {
//       console.error("Company search failed", error);
//       setCompanyOptions([]);
//     } finally {
//       setCompanyLoading(false);
//     }
//   };

//   const handleCompanySearch = (inputValue, actionMeta) => {
//     if (actionMeta.action !== "input-change") return inputValue;
//     const query = inputValue.trim();
//     latestCompanyQueryRef.current = query;
//     if (companyDebounceRef.current) clearTimeout(companyDebounceRef.current);
//     if (query.length === 0 || query.length < 3) {
//       setCompanyOptions([]);
//       return inputValue;
//     }
//     companyDebounceRef.current = setTimeout(() => {
//       fetchCompanies(query);
//     }, 300);
//     return inputValue;
//   };

//   const handleLogoUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     if (file.size > MAX_LOGO_SIZE) {
//       showErrorAlert("File Too Large", `Logo must be less than ${formatFileSize(MAX_LOGO_SIZE)}`);
//       e.target.value = "";
//       return;
//     }
//     setLogoPreview(URL.createObjectURL(file));
//     try {
//       setUploadingLogo(true);
//       const url = await uploadImage(file, "logoUrl");
//       setValue("logo_url", url, { shouldValidate: true });
//     } catch (err) {
//       console.error("Logo upload failed", err);
//       showErrorAlert("Upload Failed", "Failed to upload logo. Please try again.");
//     } finally {
//       setUploadingLogo(false);
//     }
//   };

//   const handleProfilePicUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     if (file.size > MAX_PROFILE_PIC_SIZE) {
//       showErrorAlert("File Too Large", `Profile picture must be less than ${formatFileSize(MAX_PROFILE_PIC_SIZE)}`);
//       e.target.value = "";
//       return;
//     }
//     setProfilePicPreview(URL.createObjectURL(file));
//     try {
//       setUploadingProfile(true);
//       const url = await uploadImage(file, "profilePic");
//       setValue("profile_pic", url, { shouldValidate: true });
//     } catch (err) {
//       console.error("Profile pic upload failed", err);
//       showErrorAlert("Upload Failed", "Failed to upload profile picture. Please try again.");
//     } finally {
//       setUploadingProfile(false);
//     }
//   };

//   const [industryInput, setIndustryInput] = useState("");
//   const fetchAllIndustries = async () => {
//     try {
//       setIndustryLoading(true);
//       const res = await fetch(`${BASE_URL}/master/industries`);
//       const json = await res.json();
//       setIndustryOptions(
//         (json.data || []).map((i) => ({
//           value: String(i.id),
//           label: i.name,
//         }))
//       );
//     } catch (error) {
//       console.error("Fetching all industries failed", error);
//       setIndustryOptions([]);
//     } finally {
//       setIndustryLoading(false);
//     }
//   };

//   const fetchIndustries = async (query) => {
//     try {
//       setIndustryLoading(true);
//       const res = await fetch(`${BASE_URL}/master/industries/search?search=${query}`);
//       const json = await res.json();
//       setIndustryOptions(
//         (json.data || []).map((i) => ({
//           value: String(i.id),
//           label: i.name,
//         }))
//       );
//     } catch (error) {
//       console.error("Industry search failed", error);
//       setIndustryOptions([]);
//     } finally {
//       setIndustryLoading(false);
//     }
//   };

//   const handleIndustrySearch = (inputValue, actionMeta) => {
//     if (actionMeta.action !== "input-change") return inputValue;
//     setIndustryInput(inputValue);
//     const query = inputValue.trim();
//     latestIndustryQueryRef.current = query;
//     if (industryDebounceRef.current) {
//       clearTimeout(industryDebounceRef.current);
//     }
//     if (query.length === 0) {
//       fetchAllIndustries();
//       return inputValue;
//     }
//     industryDebounceRef.current = setTimeout(() => {
//       fetchIndustries(query);
//     }, 300);
//     return inputValue;
//   };

//   // Location Search Functions
//   const fetchLocations = async (query) => {
//     try {
//       setLocationLoading(true);
//       const res = await fetch(`${BASE_URL}/master/location/search?search=${query}`);
//       const json = await res.json();
//       if (latestLocationQueryRef.current !== query) return;
//       setLocationOptions(
//         (json.data || []).map((l) => ({
//           value: String(l.id),
//           label: l.name,
//         }))
//       );
//     } catch (error) {
//       console.error("Location search failed", error);
//       setLocationOptions([]);
//     } finally {
//       setLocationLoading(false);
//     }
//   };

//   const handleLocationSearch = (inputValue, actionMeta) => {
//     if (actionMeta.action !== "input-change") return inputValue;
//     const query = inputValue.trim();
//     latestLocationQueryRef.current = query;
//     if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current);
//     if (query.length < 3 || query.length > 50) {
//       setLocationOptions([]);
//       return inputValue;
//     }
//     locationDebounceRef.current = setTimeout(() => {
//       fetchLocations(query);
//     }, 300);
//     return inputValue;
//   };

//   const fetchLanguages = async (query) => {
//     try {
//       setLanguageLoading(true);
//       const res = await fetch(`${BASE_URL}/master/languages/search?search=${query}`);
//       const json = await res.json();
//       if (latestLanguageQueryRef.current !== query) return;
//       setLanguageOptions(
//         (json.data || []).map((l) => ({
//           value: String(l.id),
//           label: l.name,
//         }))
//       );
//     } catch (error) {
//       console.error("Language search failed", error);
//       setLanguageOptions([]);
//     } finally {
//       setLanguageLoading(false);
//     }
//   };

//   const handleLanguageSearch = (inputValue, actionMeta) => {
//     if (actionMeta.action !== "input-change") {
//       return inputValue;
//     }
//     const query = inputValue.trim();
//     latestLanguageQueryRef.current = query;
//     if (languageDebounceRef.current) {
//       clearTimeout(languageDebounceRef.current);
//     }
//     if (query.length < 3 || query.length > 50) {
//       setLanguageOptions([]);
//       return inputValue;
//     }
//     languageDebounceRef.current = setTimeout(() => {
//       fetchLanguages(query);
//     }, 300);
//     return inputValue;
//   };

//   const fetchJobRoles = async (query) => {
//     try {
//       setJobRoleLoading(true);
//       const res = await fetch(`${BASE_URL}/master/job-roles/search?search=${query}`);
//       const json = await res.json();
//       if (latestJobRoleQueryRef.current !== query) return;
//       setJobRoleOptions(
//         (json.data || []).map((j) => ({
//           value: String(j.id),
//           label: j.title,
//         }))
//       );
//     } catch (error) {
//       console.error("Job role search failed", error);
//       setJobRoleOptions([]);
//     } finally {
//       setJobRoleLoading(false);
//     }
//   };

//   const handleJobRoleSearch = (inputValue, actionMeta) => {
//     if (actionMeta.action !== "input-change") return inputValue;
//     const query = inputValue.trim();
//     latestJobRoleQueryRef.current = query;
//     if (jobRoleDebounceRef.current) clearTimeout(jobRoleDebounceRef.current);
//     if (query.length < 3 || query.length > 50) {
//       setJobRoleOptions([]);
//       return inputValue;
//     }
//     jobRoleDebounceRef.current = setTimeout(() => {
//       fetchJobRoles(query);
//     }, 300);
//     return inputValue;
//   };

//   //  FIXED: onSubmit function - Send data correctly to backend
//   const onSubmit = async (data) => {
//     const apiData = {
//       ...data,
//       gst_number: data.gst_number || "",
//       company_address: data.company_address || "",
      
//       // Company ID as Integer
//       company_id: data.company_id ? parseInt(data.company_id, 10) : null,
//       company_name: data.company_name || undefined,
      
//       // Designation logic
//       ...(data.designation_id
//         ? {
//             designation_id: parseInt(data.designation_id, 10),
//             other_designation_name: undefined,
//           }
//         : {
//             designation_id: null,
//             other_designation_name: data.other_designation_name?.trim() || "",
//           }),
      
//       // Industry logic
//       industry_id: data.industry_id ? parseInt(data.industry_id, 10) : null,
//       custom_industry_name: data.custom_industry_name?.trim() || undefined,
      
//       //  FIXED: company_location_id = City ID ONLY (Integer for FK)
//       company_location_id: data.company_location_id ? parseInt(data.company_location_id, 10) : null,
      
//       //  NEW: Address Lines
//       address_line_1: data.address_line_1 || null,
//       address_line_2: data.address_line_2 || null,
      
//       //  Separate fields for State, Country, Pincode
//       state: data.state || null,
//       country: data.country || null,
//       pincode: data.pincode || null,
      
//       language_ids: data.language_ids?.map((id) => parseInt(id, 10)) || [],
//     };

//     try {
//       await dispatch(completeCompanyProfile(apiData)).unwrap();
//       await showSuccessAlert("Profile Created", "Your company profile is now active!");
//       navigate("/recruiter-dashboard");
//     } catch (error) {
//       await showErrorAlert(
//         "Profile Creation Failed",
//         typeof error === "string" ? error : "Please check your inputs and try again."
//       );
//     }
//   };

//   const aboutValue = watch("about") || "";

//   return (
//     <MainLayout>
//       <div className="bg-[#f5f6f7] min-h-screen">
//         <div className="relative flex w-full min-h-screen overflow-hidden shadow-md md:items-center md:justify-center">
//           <div className="flex justify-center flex-1 w-full md:mt-0">
//             <div className="w-full max-w-full p-6 bg-white shadow-md rounded-xl sm:shadow-xl sm:max-w-2xl sm:p-8">
//               <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
//                 {/* ===== COMPANY DETAILS ===== */}
//                 <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
//                   <h2 className="mb-4 text-lg font-semibold text-center text-gray-800">
//                     Company Details
//                   </h2>

//                   {/* ===== Company Name ===== */} 
//                   <div className="mt-2 space-y-2">
//                     <label className="block text-xs font-medium text-gray-700">
//                       Company Name <span className="text-red-500">*</span>
//                     </label>
//                     <Controller
//                       name="company_id"
//                       control={control}
//                       render={({ field }) => (
//                         <CreatableSelect
//                           {...field}
//                           value={
//                             field.value
//                               ? {
//                                   value: String(field.value),
//                                   label:
//                                     companyOptions.find((o) => o.value === String(field.value))?.label ||
//                                     watch("company_name") ||
//                                     "",
//                                 }
//                               : watch("company_name")
//                               ? { value: "__custom__", label: watch("company_name") }
//                               : null
//                           }
//                           onInputChange={handleCompanySearch}
//                           options={companyOptions}
//                           isLoading={companyLoading}
//                           filterOption={null}
//                           onChange={(opt) => {
//                             if (opt && opt.__isNew__) {
//                               setValue("company_name", opt.label.trim(), { shouldValidate: true });
//                               field.onChange(null);
//                             } else {
//                               setValue("company_name", "", { shouldValidate: true });
//                               field.onChange(opt ? String(opt.value) : null);
//                             }
//                           }}
//                           placeholder="Search or type new company name [Min 3 chars]"
//                           isClearable
//                           isSearchable
//                           className="text-sm"
//                           maxMenuHeight={200}
//                           noOptionsMessage={({ inputValue }) => {
//                             if (!inputValue) return "Start typing...";
//                             if (inputValue.length < 3)
//                               return "Type min 3 chars to search, or Enter to create new";
//                             return `No matches found. Press Enter to create "${inputValue}"`;
//                           }}
//                           formatCreateLabel={(inputValue) => `+ Create: "${inputValue}"`}
//                           onKeyDown={(e) => {
//                             if (e.key === "Enter") {
//                               e.stopPropagation();
//                             }
//                           }}
//                         />
//                       )}
//                     />
//                     {(errors.company_name || errors.company_id) && (
//                       <p className="text-xs text-red-500">
//                         {errors.company_name?.message || errors.company_id?.message}
//                       </p>
//                     )}
//                   </div>

//                   {/* ===== Industry =====
//                   <div className="mt-2 space-y-2">
//                     <label className="block text-xs font-medium text-gray-700">
//                       Industry <span className="text-red-500">*</span>
//                     </label>
//                     <Controller
//                       name="industry_id"
//                       control={control}
//                       render={({ field }) => (
//                         <CreatableSelect
//                           {...field}
//                           value={
//                             field.value
//                               ? {
//                                   value: String(field.value),
//                                   label:
//                                     industryOptions.find((o) => o.value === String(field.value))?.label ||
//                                     watch("custom_industry_name") ||
//                                     "",
//                                 }
//                               : watch("custom_industry_name")
//                               ? {
//                                   value: "__custom__",
//                                   label: watch("custom_industry_name"),
//                                 }
//                               : null
//                           }
//                           onInputChange={handleIndustrySearch}
//                           options={industryOptions}
//                           isLoading={industryLoading}
//                           filterOption={null}
//                           onChange={(opt) => {
//                             if (opt && opt.__isNew__) {
//                               setValue("custom_industry_name", opt.label.trim());
//                               field.onChange(null);
//                             } else {
//                               setValue("custom_industry_name", "");
//                               field.onChange(opt ? String(opt.value) : null);
//                             }
//                           }}
//                           placeholder="Select or type new industry [Min 3 chars]"
//                           isClearable
//                           isSearchable
//                           className="text-sm"
//                           maxMenuHeight={200}
//                           noOptionsMessage={({ inputValue }) => {
//                             if (!inputValue) return "Type min 3 characters to search...";
//                             return `Press Enter to create: "${inputValue}"`;
//                           }}
//                           formatCreateLabel={(inputValue) => `+ Create: "${inputValue}"`}
//                           onKeyDown={(e) => {
//                             if (e.key === "Enter") {
//                               e.stopPropagation();
//                             }
//                           }}
//                         />
//                       )}
//                     />
//                     {(errors.industry_id || errors.custom_industry_name) && (
//                       <p className="text-xs text-red-500">
//                         {errors.industry_id?.message || errors.custom_industry_name?.message}
//                       </p>
//                     )}
//                   </div> */}

//                   {/* ===== Industry ===== */}
// <div className="mt-2 space-y-2">
//   <Controller
//     name="industry_id"
//     control={control}
//     render={({ field }) => (
//       <ReactSelectDropdown
//         creatable
//         label={
//           <>
//             Industry <span className="text-red-500">*</span>
//           </>
//         }
//         options={industryOptions}
//         value={
//           field.value
//             ? {
//                 value: String(field.value),
//                 label:
//                   industryOptions.find((o) => String(o.value) === String(field.value))?.label ||
//                   watch("custom_industry_name") ||
//                   "",
//               }
//             : watch("custom_industry_name")
//             ? { value: "__custom__", label: watch("custom_industry_name") }
//             : null
//         }
//         onInputChange={handleIndustrySearch}
//         isLoading={industryLoading}
//         filterOption={null}
//         onChange={(opt) => {
//           if (opt && opt.__isNew__) {
//             setValue("custom_industry_name", opt.label.trim(), { shouldValidate: true });
//             field.onChange(null);
//           } else {
//             setValue("custom_industry_name", "", { shouldValidate: true });
//             field.onChange(opt ? String(opt.value) : null);
//           }
//         }}
//         placeholder="Select or type new industry (Min 3 chars)"
//         isClearable
//         isSearchable
//         classNamePrefix="industry"
//         maxMenuHeight={200}
//         noOptionsMessage={({ inputValue }) => {
//           if (!inputValue) return "Type min 3 characters to search...";
//           return `Press Enter to create: "${inputValue}"`;
//         }}
//         formatCreateLabel={(inputValue) => `+ Create: "${inputValue}"`}
//         onKeyDown={(e) => {
//           if (e.key === "Enter") e.stopPropagation();
//         }}
//         error={errors.industry_id?.message || errors.custom_industry_name?.message}
//         focusColor="#9bc87c"
//         menuPortalTarget={document.body}
//         menuPosition="fixed"
//       />
//     )}
//   />

//   {(errors.industry_id || errors.custom_industry_name) && (
//     <p className="text-xs text-red-500">
//       {errors.industry_id?.message || errors.custom_industry_name?.message}
//     </p>
//   )}
// </div>

//                   {/* ===== Company Location + Address Fields ===== */}
//                   <div className="mt-2 space-y-3">
//                     <label className="block text-xs font-medium text-gray-700">
//                       Company Location (City) <span className="text-red-500">*</span>
//                     </label>
//                     <Controller
//                       name="company_location_id"
//                       control={control}
//                       render={({ field }) => (
//                         <Select
//                           {...field}
//                           value={
//                             field.value
//                               ? {
//                                   value: String(field.value),
//                                   label:
//                                     locationOptions.find(
//                                       (opt) => opt.value === String(field.value)
//                                     )?.label || "",
//                                 }
//                               : null
//                           }
//                           onInputChange={handleLocationSearch}
//                           options={locationOptions}
//                           filterOption={null}
//                           isLoading={locationLoading}
//                           onChange={(opt) => field.onChange(opt ? String(opt.value) : "")}
//                           placeholder="Select company location [Min 3 chars]"
//                           isClearable
//                           isSearchable
//                           className="text-sm"
//                           noOptionsMessage={({ inputValue }) => {
//                             if (!inputValue) return "Start typing city name...";
//                             if (inputValue.length < 3) return "Type min 3 chars to search";
//                             return "No cities found";
//                           }}
//                           onKeyDown={(e) => {
//                             if (e.key === "Enter") {
//                               e.stopPropagation();
//                             }
//                           }}
//                         />
//                       )}
//                     />
//                     {errors.company_location_id && (
//                       <p className="text-xs text-red-500">{errors.company_location_id.message}</p>
//                     )}

//                     {/*  NEW: Address Line 1 & 2 */}
//                     <div className="pt-2 space-y-2">
//                       <label className="block text-xs font-medium text-gray-700">
//                         Address Line 1 <span className="text-red-500">*</span>
//                       </label>
//                       <Input
//                         placeholder="Street, Building, Area"
//                         error={errors.address_line_1?.message}
//                         className="text-sm"
//                         {...register("address_line_1")}
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <label className="block text-xs font-medium text-gray-700">
//                         Address Line 2 <span className="text-gray-400">(Optional)</span>
//                       </label>
//                       <Input
//                         placeholder="Landmark, Locality, Sector"
//                         error={errors.address_line_2?.message}
//                         className="text-sm"
//                         {...register("address_line_2")}
//                       />
//                     </div>

//                     {/* State, Country, Pincode */}
//                     <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
//                       <div className="space-y-2">
//                         <label className="block text-xs font-medium text-gray-700">
//                           State <span className="text-red-500">*</span>
//                         </label>
//                         <Input
//                           placeholder="State"
//                           error={errors.state?.message}
//                           className="text-sm"
//                           {...register("state")}
//                         />
//                       </div>
//                       <div className="space-y-2">
//                         <label className="block text-xs font-medium text-gray-700">
//                           Country <span className="text-red-500">*</span>
//                         </label>
//                         <Input
//                           placeholder="Country"
//                           error={errors.country?.message}
//                           className="text-sm"
//                           {...register("country")}
//                         />
//                       </div>
//                       <div className="space-y-2">
//                         <label className="block text-xs font-medium text-gray-700">
//                           Pincode <span className="text-red-500">*</span>
//                         </label>
//                         <Input
//                           placeholder="Pincode"
//                           error={errors.pincode?.message}
//                           className="text-sm"
//                           {...register("pincode")}
//                         />
//                       </div>
//                     </div>
//                   </div>

//                   {/* ===== GST Number ===== */}
//                   <div className="mt-2 space-y-2">
//                     <Input
//                       label="GST Number"
//                       placeholder="e.g., 27AABCU9603R1ZM"
//                       error={errors.gst_number?.message}
//                       className="text-sm"
//                       {...register("gst_number")}
//                     />
//                   </div>

//                   {/* ===== Company Address ===== */}
//                   <div className="hidden mt-2 space-y-2">
//                     <label className="block text-xs font-medium text-gray-700">
//                       Company Address
//                     </label>
//                     <Textarea
//                       placeholder="Enter full company address..."
//                       error={errors.company_address?.message}
//                       className="text-sm"
//                       {...register("company_address")}
//                       rows={3}
//                     />
//                   </div>

//                   {/* ===== About Company ===== */}
//                   <div className="mt-2 space-y-2">
//                     <label className="block text-xs font-medium text-gray-700">
//                       About Company <span className="text-red-500">*</span>
//                     </label>
//                     <Textarea
//                       placeholder="Describe your company..."
//                       error={errors.about?.message}
//                       className="text-sm"
//                       {...register("about")}
//                       rows={4}
//                     />
//                     <div className="flex justify-between text-xs text-gray-500">
//                       <span>{aboutValue.length}/1000 characters</span>
//                       {aboutValue.length > 900 && (
//                         <span className="font-medium text-orange-600">
//                           {1000 - aboutValue.length} left
//                         </span>
//                       )}
//                     </div>
//                   </div>

//                   {/* ===== Company Logo ===== */}
//                   <div className="mt-4 space-y-2">
//                     <label className="block text-xs font-medium text-gray-700">
//                       Company Logo <span className="text-red-500">*</span>
//                     </label>
//                     <div className="flex items-center justify-between p-2 border border-gray-200 rounded">
//                       <div>
//                         <input
//                           type="file"
//                           accept="image/*"
//                           onChange={handleLogoUpload}
//                           className="text-sm"
//                           disabled={uploadingLogo}
//                         />
//                         {uploadingLogo && (
//                           <span className="ml-2 text-xs text-blue-500">Uploading...</span>
//                         )}
//                       </div>
//                       <div>
//                         {logoPreview && (
//                           <img
//                             src={logoPreview}
//                             alt="Company Logo"
//                             className="object-cover w-10 h-10 rounded"
//                           />
//                         )}
//                       </div>
//                     </div>
//                     <p className="text-xs text-gray-500">
//                       Max size: {formatFileSize(MAX_LOGO_SIZE)} • PNG, JPG, or JPEG recommended
//                     </p>
//                     {errors.logo_url && (
//                       <p className="text-xs text-red-500">{errors.logo_url.message}</p>
//                     )}
//                   </div>

//                   {/* ===== Languages ===== */}
//                   <div className="hidden mt-2 space-y-2">
//                     <label className="block text-xs font-medium text-gray-700">
//                       Languages (Optional)
//                     </label>
//                     <Controller
//                       name="language_ids"
//                       control={control}
//                       render={({ field }) => (
//                         <Select
//                           {...field}
//                           isMulti
//                           value={
//                             field.value
//                               ?.map((id) => languageOptions.find((o) => o.value === String(id)))
//                               .filter(Boolean) || []
//                           }
//                           onInputChange={handleLanguageSearch}
//                           options={languageOptions}
//                           filterOption={null}
//                           isLoading={languageLoading}
//                           onChange={(opts) => {
//                             const uniqueValues = opts
//                               ? Array.from(new Set(opts.map((o) => String(o.value))))
//                               : [];
//                             field.onChange(uniqueValues);
//                           }}
//                           placeholder="Select languages"
//                           isClearable
//                           isSearchable
//                           className="text-sm"
//                         />
//                       )}
//                     />
//                   </div>
//                 </div>

//                 {/* ===== RECRUITER DETAILS ===== */}
//                 <div className="p-4 mb-6 border border-gray-200 rounded-lg bg-gray-50">
//                   <h2 className="mb-4 text-lg font-semibold text-center text-gray-800">
//                     Recruiter Details
//                   </h2>
//                   <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2">
//                     <div>
//                       <label className="block text-xs font-medium text-gray-500">
//                         First Name <span className="text-red-500">*</span>
//                       </label>
//                       <p className="p-2 text-sm bg-gray-100 border rounded">
//                         {user?.first_name || "–"}
//                       </p>
//                     </div>
//                     <div>
//                       <label className="block text-xs font-medium text-gray-500">
//                         Last Name <span className="text-red-500">*</span>
//                       </label>
//                       <p className="p-2 text-sm bg-gray-100 border rounded">
//                         {user?.last_name || "–"}
//                       </p>
//                     </div>
//                     <div>
//                       <label className="block text-xs font-medium text-gray-500">
//                         Email <span className="text-red-500">*</span>
//                       </label>
//                       <p className="p-2 text-sm bg-gray-100 border rounded">
//                         {user?.email || "–"}
//                       </p>
//                     </div>
//                     <div>
//                       <label className="block text-xs font-medium text-gray-500">Phone</label>
//                       <p className="p-2 text-sm bg-gray-100 border rounded">
//                         {user?.phone || "–"}
//                       </p>
//                     </div>
//                   </div>

//                   {/* ===== Designation ===== */}
//                   <div className="mt-2 space-y-2">
//                     <label className="block text-xs font-medium text-gray-700">
//                       Designation <span className="text-red-500">*</span>
//                     </label>
//                     <Controller
//                       name="designation_id"
//                       control={control}
//                       render={({ field }) => (
//                         <CreatableSelect
//                           {...field}
//                           value={
//                             field.value
//                               ? {
//                                   value: String(field.value),
//                                   label:
//                                     jobRoleOptions.find((o) => o.value === String(field.value))?.label ||
//                                     watch("other_designation_name") ||
//                                     "",
//                                 }
//                               : watch("other_designation_name")
//                               ? { value: "__custom__", label: watch("other_designation_name") }
//                               : null
//                           }
//                           onInputChange={handleJobRoleSearch}
//                           options={jobRoleOptions}
//                           isLoading={jobRoleLoading}
//                           filterOption={null}
//                           onChange={(opt) => {
//                             if (opt && opt.__isNew__) {
//                               setValue("other_designation_name", opt.label.trim());
//                               field.onChange(null);
//                             } else {
//                               setValue("other_designation_name", "");
//                               field.onChange(opt ? String(opt.value) : null);
//                             }
//                           }}
//                           placeholder="Select or type your designation [Min 3 chars]"
//                           isClearable
//                           isSearchable
//                           className="text-sm"
//                           noOptionsMessage={({ inputValue }) => {
//                             if (!inputValue) return "Start typing...";
//                             if (inputValue.length < 3)
//                               return "Type min 3 chars to search, or Enter to create new";
//                             return `No matches found. Press Enter to create "${inputValue}"`;
//                           }}
//                         />
//                       )}
//                     />
//                     {(errors.designation_id || errors.other_designation_name) && (
//                       <p className="text-xs text-red-500">
//                         {errors.designation_id?.message || errors.other_designation_name?.message}
//                       </p>
//                     )}
//                   </div>

//                   {/* ===== Profile Pic ===== */}
//                   <div className="mt-2 space-y-2">
//                     <label className="block text-xs font-medium text-gray-700">
//                       Profile Picture <span className="text-red-500">*</span>
//                     </label>
//                     <div className="flex items-center justify-between p-2 border border-gray-200 rounded">
//                       <div>
//                         <input
//                           type="file"
//                           accept="image/*"
//                           onChange={handleProfilePicUpload}
//                           className="text-sm"
//                           disabled={uploadingProfile}
//                         />
//                         {uploadingProfile && (
//                           <span className="ml-2 text-xs text-blue-500">Uploading...</span>
//                         )}
//                       </div>
//                       <div>
//                         {profilePicPreview && (
//                           <img
//                             src={profilePicPreview}
//                             alt="Profile Pic"
//                             className="object-cover w-10 h-10 border rounded"
//                           />
//                         )}
//                       </div>
//                     </div>
//                     <p className="text-xs text-gray-500">
//                       Max size: {formatFileSize(MAX_PROFILE_PIC_SIZE)} • Square image recommended
//                     </p>
//                     {errors.profile_pic && (
//                       <p className="text-xs text-red-500">{errors.profile_pic.message}</p>
//                     )}
//                   </div>
//                 </div>

//                 {/* ===== Submit Button ===== */}
//                 <div className="flex justify-end gap-4 pt-4 mt-6 border-t border-gray-200">
//                   <Button
//                     type="submit"
//                     loading={isSubmitting || uploadingLogo || uploadingProfile}
//                     disabled={isSubmitting || uploadingLogo || uploadingProfile}
//                   >
//                     {isSubmitting ? "Creating Profile..." : "Create Profile"}
//                   </Button>
//                 </div>
//               </form>
//             </div>
//           </div>
//         </div>
//       </div>
//     </MainLayout>
//   );
// }   




















import React, { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { recruiterApi } from "../../api/recruiterApi";
import { useNavigate } from "react-router-dom";
import { Input, Textarea, Button, Checkbox } from "../../components/ui";
import SignUpLayout from "../../components/layout/SignUpLayout";
import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";
import useUploadImageApi from "../../hooks/useUploadImageApi";
import { getImageUrl } from "../../../utils.js";
import { updateUser } from "../../redux/feature/authSlice.js";
import MainLayout from "../../components/layout/MainLayout.jsx";
import { showSuccessAlert, showErrorAlert } from "../../utils/alertService";
import axios from "axios";
import CreatableSelectField from "../../components/ui/CreatableSelectField";
import CreatableSelect from "react-select/creatable";
import { completeCompanyProfile } from "../../redux/feature/authSlice";
import ReactSelectDropdown from "../../components/ui/ReactSelectDropdown.jsx";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2 MB
const MAX_PROFILE_PIC_SIZE = 1 * 1024 * 1024; // 1 MB

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  else return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const ALLOW_CUSTOM_INDUSTRY = true;

const formSchema = z
  .object({
    designation_id: z.string().nullable(),
    other_designation_name: z.string().optional(),
    company_name: z.string().optional(),
    company_id: z.string().nullable().optional(),
    industry_id: z.string().nullable().optional(),
    custom_industry_name: z.string().optional(),
    company_location_id: z.string().min(1, { message: "City is required" }),
    address_line_1: z.string().min(1, { message: "Address Line 1 is required" }),
    address_line_2: z.string().optional(),
    state: z.string().min(1, { message: "State is required" }),
    country: z.string().min(1, { message: "Country is required" }),
    pincode: z.string().min(1, { message: "Pincode is required" }),
    about: z
      .string()
      .min(10, { message: "About section must be at least 10 characters" })
      .max(1000, { message: "About section must not exceed 1000 characters (~250 words)" }),
    logo_url: z.string().min(1, "Logo is required").max(500),
    profile_pic: z.string().min(1, "Profile picture is required").max(500),
    language_ids: z.array(z.string()).optional(),
    is_email_verified: z.boolean().default(true),
    is_phone_verified: z.boolean().default(false),
    is_gst_verified: z.boolean().default(false),
    gst_number: z.string().optional(),
    company_address: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const hasValidDesignation = data.designation_id !== null && data.designation_id.trim() !== "";
    const hasCustomDesignation = data.other_designation_name?.trim() !== "";
    if (!hasValidDesignation && !hasCustomDesignation) {
      ctx.addIssue({
        path: ["designation_id"],
        code: z.ZodIssueCode.custom,
        message: "Designation is required",
      });
      ctx.addIssue({
        path: ["other_designation_name"],
        code: z.ZodIssueCode.custom,
        message: "Designation is required",
      });
    }

    const hasIndustryId = data.industry_id && data.industry_id.trim() !== "";
    const hasCustomIndustry = ALLOW_CUSTOM_INDUSTRY && data.custom_industry_name && data.custom_industry_name.trim() !== "";
    if (!hasIndustryId && !hasCustomIndustry) {
      ctx.addIssue({
        path: ["industry_id"],
        code: z.ZodIssueCode.custom,
        message: "Industry is required (Select one or type a new one)",
      });
    }
  });

export default function CompanyRecruiterProfile() {
  const dispatch = useDispatch();
  const [logoPreview, setLogoPreview] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const { token, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { uploadImage } = useUploadImageApi();
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  
  const [industryOptions, setIndustryOptions] = useState([]);
  const [industryLoading, setIndustryLoading] = useState(false);
  const industryDebounceRef = useRef(null);
  const latestIndustryQueryRef = useRef("");
  
  const [locationOptions, setLocationOptions] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const locationDebounceRef = useRef(null);
  const latestLocationQueryRef = useRef("");

  const [languageOptions, setLanguageOptions] = useState([]);
  const [languageLoading, setLanguageLoading] = useState(false);
  const languageDebounceRef = useRef(null);
  const latestLanguageQueryRef = useRef("");
  
  const [jobRoleOptions, setJobRoleOptions] = useState([]);
  const [jobRoleLoading, setJobRoleLoading] = useState(false);
  const jobRoleDebounceRef = useRef(null);
  const latestJobRoleQueryRef = useRef("");
  
  const [companyOptions, setCompanyOptions] = useState([]);
  const [companyLoading, setCompanyLoading] = useState(false);
  const companyDebounceRef = useRef(null);
  const latestCompanyQueryRef = useRef("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      designation_id: "",
      other_designation_name: "",
      company_name: "",
      company_id: "",
      industry_id: "",
      custom_industry_name: "",
      company_location_id: "",
      address_line_1: "",
      address_line_2: "",
      state: "",
      country: "",
      pincode: "",
      about: "",
      logo_url: "",
      profile_pic: "",
      language_ids: [],
      is_email_verified: true,
      is_phone_verified: false,
      is_gst_verified: false,
      gst_number: "",
      company_address: "",
    },
  });

  const fetchCompanies = async (query) => {
    try {
      setCompanyLoading(true);
      const res = await fetch(`${BASE_URL}/master/companies/search?search=${query}`);
      const json = await res.json();
      if (latestCompanyQueryRef.current !== query) return;
      setCompanyOptions(
        (json.data || []).map((c) => ({
          value: String(c.id),
          label: c.company_name,
          isExisting: true,
        }))
      );
    } catch (error) {
      console.error("Company search failed", error);
      setCompanyOptions([]);
    } finally {
      setCompanyLoading(false);
    }
  };

  const handleCompanySearch = (inputValue, actionMeta) => {
    if (actionMeta.action !== "input-change") return inputValue;
    const query = inputValue.trim();
    latestCompanyQueryRef.current = query;
    if (companyDebounceRef.current) clearTimeout(companyDebounceRef.current);
    if (query.length === 0 ) {
      setCompanyOptions([]);
      return inputValue;
    }
    companyDebounceRef.current = setTimeout(() => {
      fetchCompanies(query);
    }, 300);
    return inputValue;
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_LOGO_SIZE) {
      showErrorAlert("File Too Large", `Logo must be less than ${formatFileSize(MAX_LOGO_SIZE)}`);
      e.target.value = "";
      return;
    }
    setLogoPreview(URL.createObjectURL(file));
    try {
      setUploadingLogo(true);
      const url = await uploadImage(file, "logoUrl");
      setValue("logo_url", url, { shouldValidate: true });
    } catch (err) {
      console.error("Logo upload failed", err);
      showErrorAlert("Upload Failed", "Failed to upload logo. Please try again.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_PROFILE_PIC_SIZE) {
      showErrorAlert("File Too Large", `Profile picture must be less than ${formatFileSize(MAX_PROFILE_PIC_SIZE)}`);
      e.target.value = "";
      return;
    }
    setProfilePicPreview(URL.createObjectURL(file));
    try {
      setUploadingProfile(true);
      const url = await uploadImage(file, "profilePic");
      setValue("profile_pic", url, { shouldValidate: true });
    } catch (err) {
      console.error("Profile pic upload failed", err);
      showErrorAlert("Upload Failed", "Failed to upload profile picture. Please try again.");
    } finally {
      setUploadingProfile(false);
    }
  };

  const [industryInput, setIndustryInput] = useState("");
  const fetchAllIndustries = async () => {
    try {
      setIndustryLoading(true);
      const res = await fetch(`${BASE_URL}/master/industries`);
      const json = await res.json();
      setIndustryOptions(
        (json.data || []).map((i) => ({
          value: String(i.id),
          label: i.name,
        }))
      );
    } catch (error) {
      console.error("Fetching all industries failed", error);
      setIndustryOptions([]);
    } finally {
      setIndustryLoading(false);
    }
  };

  const fetchIndustries = async (query) => {
    try {
      setIndustryLoading(true);
      const res = await fetch(`${BASE_URL}/master/industries/search?search=${query}`);
      const json = await res.json();
      setIndustryOptions(
        (json.data || []).map((i) => ({
          value: String(i.id),
          label: i.name,
        }))
      );
    } catch (error) {
      console.error("Industry search failed", error);
      setIndustryOptions([]);
    } finally {
      setIndustryLoading(false);
    }
  };

  const handleIndustrySearch = (inputValue, actionMeta) => {
    if (actionMeta.action !== "input-change") return inputValue;
    setIndustryInput(inputValue);
    const query = inputValue.trim();
    latestIndustryQueryRef.current = query;
    if (industryDebounceRef.current) {
      clearTimeout(industryDebounceRef.current);
    }
    if (query.length === 0) {
      fetchAllIndustries();
      return inputValue;
    }
    industryDebounceRef.current = setTimeout(() => {
      fetchIndustries(query);
    }, 300);
    return inputValue;
  };

  const fetchLocations = async (query) => {
    try {
      setLocationLoading(true);
      const res = await fetch(`${BASE_URL}/master/location/search?search=${query}`);
      const json = await res.json();
      if (latestLocationQueryRef.current !== query) return;
      setLocationOptions(
        (json.data || []).map((l) => ({
          value: String(l.id),
          label: l.name,
        }))
      );
    } catch (error) {
      console.error("Location search failed", error);
      setLocationOptions([]);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleLocationSearch = (inputValue, actionMeta) => {
    if (actionMeta.action !== "input-change") return inputValue;
    const query = inputValue.trim();
    latestLocationQueryRef.current = query;
    if (locationDebounceRef.current) clearTimeout(locationDebounceRef.current);
    if ( query.length > 50) {
      setLocationOptions([]);
      return inputValue;
    }
    locationDebounceRef.current = setTimeout(() => {
      fetchLocations(query);
    }, 300);
    return inputValue;
  };

  const fetchLanguages = async (query) => {
    try {
      setLanguageLoading(true);
      const res = await fetch(`${BASE_URL}/master/languages/search?search=${query}`);
      const json = await res.json();
      if (latestLanguageQueryRef.current !== query) return;
      setLanguageOptions(
        (json.data || []).map((l) => ({
          value: String(l.id),
          label: l.name,
        }))
      );
    } catch (error) {
      console.error("Language search failed", error);
      setLanguageOptions([]);
    } finally {
      setLanguageLoading(false);
    }
  };

  const handleLanguageSearch = (inputValue, actionMeta) => {
    if (actionMeta.action !== "input-change") return inputValue;
    const query = inputValue.trim();
    latestLanguageQueryRef.current = query;
    if (languageDebounceRef.current) clearTimeout(languageDebounceRef.current);
    if (query.length > 50) {
      setLanguageOptions([]);
      return inputValue;
    }
    languageDebounceRef.current = setTimeout(() => {
      fetchLanguages(query);
    }, 300);
    return inputValue;
  };

  const fetchJobRoles = async (query) => {
    try {
      setJobRoleLoading(true);
      const res = await fetch(`${BASE_URL}/master/job-roles/search?search=${query}`);
      const json = await res.json();
      if (latestJobRoleQueryRef.current !== query) return;
      setJobRoleOptions(
        (json.data || []).map((j) => ({
          value: String(j.id),
          label: j.title,
        }))
      );
    } catch (error) {
      console.error("Job role search failed", error);
      setJobRoleOptions([]);
    } finally {
      setJobRoleLoading(false);
    }
  };

  const handleJobRoleSearch = (inputValue, actionMeta) => {
    if (actionMeta.action !== "input-change") return inputValue;
    const query = inputValue.trim();
    latestJobRoleQueryRef.current = query;
    if (jobRoleDebounceRef.current) clearTimeout(jobRoleDebounceRef.current);
    if ( query.length > 50) {
      setJobRoleOptions([]);
      return inputValue;
    }
    jobRoleDebounceRef.current = setTimeout(() => {
      fetchJobRoles(query);
    }, 300);
    return inputValue;
  };

  const onSubmit = async (data) => {
    const apiData = {
      ...data,
      gst_number: data.gst_number || "",
      company_address: data.company_address || "",
      company_id: data.company_id ? parseInt(data.company_id, 10) : null,
      company_name: data.company_name || undefined,
      
      ...(data.designation_id
        ? {
            designation_id: parseInt(data.designation_id, 10),
            other_designation_name: undefined,
          }
        : {
            designation_id: null,
            other_designation_name: data.other_designation_name?.trim() || "",
          }),
      
      industry_id: data.industry_id ? parseInt(data.industry_id, 10) : null,
      custom_industry_name: data.custom_industry_name?.trim() || undefined,
      
      company_location_id: data.company_location_id ? parseInt(data.company_location_id, 10) : null,
      
      address_line_1: data.address_line_1 || null,
      address_line_2: data.address_line_2 || null,
      
      state: data.state || null,
      country: data.country || null,
      pincode: data.pincode || null,
      
      language_ids: data.language_ids?.map((id) => parseInt(id, 10)) || [],
    };

    try {
      await dispatch(completeCompanyProfile(apiData)).unwrap();
      await showSuccessAlert("Profile Created", "Your company profile is now active!");
      navigate("/recruiter-dashboard");
    } catch (error) {
      await showErrorAlert(
        "Profile Creation Failed",
        typeof error === "string" ? error : "Please check your inputs and try again."
      );
    }
  };

  const aboutValue = watch("about") || "";

  return (
    <MainLayout>
      <div className="bg-[#f5f6f7] min-h-screen">
        <div className="relative flex w-full min-h-screen overflow-hidden shadow-md md:items-center md:justify-center">
          <div className="flex justify-center flex-1 w-full md:mt-0">
            <div className="w-full max-w-full p-6 bg-white shadow-md rounded-xl sm:shadow-xl sm:max-w-2xl sm:p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                
                {/* ===== COMPANY DETAILS ===== */}
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h2 className="mb-4 text-lg font-semibold text-center text-gray-800">
                    Company Details
                  </h2>

                  {/* ===== Company Name ===== */} 
                  <div className="mt-2 space-y-2">
                    <label className="block text-xs font-medium text-gray-700">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="company_id"
                      control={control}
                      render={({ field }) => (
                        <CreatableSelect
                          {...field}
                          value={
                            field.value
                              ? {
                                  value: String(field.value),
                                  label:
                                    companyOptions.find((o) => o.value === String(field.value))?.label ||
                                    watch("company_name") ||
                                    "",
                                }
                              : watch("company_name")
                              ? { value: "__custom__", label: watch("company_name") }
                              : null
                          }
                          onMenuOpen={() => fetchCompanies("")}
                          onInputChange={handleCompanySearch}
                          options={companyOptions}
                          isLoading={companyLoading}
                          filterOption={null}
                          onChange={(opt) => {
                            if (opt && opt.__isNew__) {
                              setValue("company_name", opt.label.trim(), { shouldValidate: true });
                              field.onChange(null);
                            } else {
                              setValue("company_name", "", { shouldValidate: true });
                              field.onChange(opt ? String(opt.value) : null);
                            }
                          }}
                          // placeholder="Search or type new company name [Min 3 chars]"
                          placeholder="Search or type company name"
                          isClearable
                          isSearchable
                          className="text-sm"
                          maxMenuHeight={200}
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              borderColor: (errors.company_name || errors.company_id) ? "#ef4444" : state.isFocused ? "#9bc87c" : base.borderColor,
                              boxShadow: state.isFocused ? `0 0 0 1px #9bc87c` : base.boxShadow,
                              "&:hover": { borderColor: (errors.company_name || errors.company_id) ? "#ef4444" : "#9bc87c" },
                              minHeight: 40,
                            }),
                          }}
                        />
                      )}
                    />
                    {(errors.company_name || errors.company_id) && (
                      <p className="text-xs text-red-500">
                        {errors.company_name?.message || errors.company_id?.message}
                      </p>
                    )}
                  </div>

                  {/* ===== Industry ===== */}
                  <div className="mt-2 space-y-2">
                    <label className="block text-xs font-medium text-gray-700">
                      Industry <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="industry_id"
                      control={control}
                      render={({ field }) => (
                        <CreatableSelect
                          {...field}
                          value={
                            field.value
                              ? {
                                  value: String(field.value),
                                  label:
                                    industryOptions.find((o) => String(o.value) === String(field.value))?.label ||
                                    watch("custom_industry_name") ||
                                    "",
                                }
                              : watch("custom_industry_name")
                              ? { value: "__custom__", label: watch("custom_industry_name") }
                              : null
                          }
                          onMenuOpen={fetchAllIndustries}
                          onInputChange={handleIndustrySearch}
                          options={industryOptions}
                          isLoading={industryLoading}
                          filterOption={null}
                          onChange={(opt) => {
                            if (opt && opt.__isNew__) {
                              setValue("custom_industry_name", opt.label.trim(), { shouldValidate: true });
                              field.onChange(null);
                            } else {
                              setValue("custom_industry_name", "", { shouldValidate: true });
                              field.onChange(opt ? String(opt.value) : null);
                            }
                          }}
                          // placeholder="Select or type new industry (Min 3 chars)"
                          placeholder="Select or type industry"
                          isClearable
                          isSearchable
                          className="text-sm"
                          maxMenuHeight={200}
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              borderColor: (errors.industry_id || errors.custom_industry_name) ? "#ef4444" : state.isFocused ? "#9bc87c" : base.borderColor,
                              boxShadow: state.isFocused ? `0 0 0 1px #9bc87c` : base.boxShadow,
                              "&:hover": { borderColor: (errors.industry_id || errors.custom_industry_name) ? "#ef4444" : "#9bc87c" },
                              minHeight: 40,
                            }),
                          }}
                        />
                      )}
                    />
                    {(errors.industry_id || errors.custom_industry_name) && (
                      <p className="text-xs text-red-500">
                        {errors.industry_id?.message || errors.custom_industry_name?.message}
                      </p>
                    )}
                  </div>

                  {/* ===== Company Location + Address Fields ===== */}
                  <div className="mt-2 space-y-3">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-700">
                        Company Location (City) <span className="text-red-500">*</span>
                      </label>
                      <Controller
                        name="company_location_id"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            value={
                              field.value
                                ? {
                                    value: String(field.value),
                                    label: locationOptions.find((opt) => opt.value === String(field.value))?.label || "",
                                  }
                                : null
                            }
                            onMenuOpen={() => fetchLocations("")}
                            onInputChange={handleLocationSearch}
                            options={locationOptions}
                            filterOption={null}
                            isLoading={locationLoading}
                            onChange={(opt) => field.onChange(opt ? String(opt.value) : "")}
                            // placeholder="Select company location [Min 3 chars]"
                            placeholder="Select company location"
                            isClearable
                            isSearchable
                            className="text-sm"
                            styles={{
                              control: (base, state) => ({
                                ...base,
                                borderColor: errors.company_location_id ? "#ef4444" : state.isFocused ? "#9bc87c" : base.borderColor,
                                boxShadow: state.isFocused ? `0 0 0 1px #9bc87c` : base.boxShadow,
                                "&:hover": { borderColor: errors.company_location_id ? "#ef4444" : "#9bc87c" },
                                minHeight: 40,
                              }),
                            }}
                          />
                        )}
                      />
                      {errors.company_location_id && (
                        <p className="text-xs text-red-500">{errors.company_location_id.message}</p>
                      )}
                    </div>

                    {/* Address Line 1 & 2 */}
                    <div className="pt-2 space-y-2">
                      <label className="block text-xs font-medium text-gray-700">
                        Address Line 1 <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Street, Building, Area"
                        error={errors.address_line_1?.message}
                        className="text-sm"
                        {...register("address_line_1")}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-700">
                        Address Line 2 <span className="text-gray-400">(Optional)</span>
                      </label>
                      <Input
                        placeholder="Landmark, Locality, Sector"
                        error={errors.address_line_2?.message}
                        className="text-sm"
                        {...register("address_line_2")}
                      />
                    </div>

                    {/* State, Country, Pincode */}
                    <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-3">
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700">
                          State <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="State"
                          error={errors.state?.message}
                          className="text-sm"
                          {...register("state")}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700">
                          Country <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="Country"
                          error={errors.country?.message}
                          className="text-sm"
                          {...register("country")}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-gray-700">
                          Pincode <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="Pincode"
                          error={errors.pincode?.message}
                          className="text-sm"
                          {...register("pincode")}
                        />
                      </div>
                    </div>
                  </div>

                  {/* ===== GST Number ===== */}
                  <div className="mt-2 space-y-2">
                    <Input
                      label="GST Number"
                      placeholder="e.g., 27AABCU9603R1ZM"
                      error={errors.gst_number?.message}
                      className="text-sm"
                      {...register("gst_number")}
                    />
                  </div>

                  {/* ===== Company Address (Hidden as per original code) ===== */}
                  <div className="hidden mt-2 space-y-2">
                    <label className="block text-xs font-medium text-gray-700">
                      Company Address
                    </label>
                    <Textarea
                      placeholder="Enter full company address..."
                      error={errors.company_address?.message}
                      className="text-sm"
                      {...register("company_address")}
                      rows={3}
                    />
                  </div>

                  {/* ===== About Company ===== */}
                  <div className="mt-2 space-y-2">
                    <label className="block text-xs font-medium text-gray-700">
                      About Company <span className="text-red-500">*</span>
                    </label>
                    <Textarea
                      placeholder="Describe your company..."
                      error={errors.about?.message}
                      className="text-sm"
                      {...register("about")}
                      rows={4}
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{aboutValue.length}/1000 characters</span>
                      {aboutValue.length > 900 && (
                        <span className="font-medium text-orange-600">
                          {1000 - aboutValue.length} left
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ===== Company Logo ===== */}
                  <div className="mt-4 space-y-2">
                    <label className="block text-xs font-medium text-gray-700">
                      Company Logo <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center justify-between p-2 border border-gray-200 rounded">
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="text-sm"
                          disabled={uploadingLogo}
                        />
                        {uploadingLogo && (
                          <span className="ml-2 text-xs text-blue-500">Uploading...</span>
                        )}
                      </div>
                      <div>
                        {logoPreview && (
                          <img
                            src={logoPreview}
                            alt="Company Logo"
                            className="object-cover w-10 h-10 rounded"
                          />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Max size: {formatFileSize(MAX_LOGO_SIZE)} • PNG, JPG, or JPEG recommended
                    </p>
                    {errors.logo_url && (
                      <p className="text-xs text-red-500">{errors.logo_url.message}</p>
                    )}
                  </div>

                  {/* ===== Languages (Hidden) ===== */}
                  <div className="hidden mt-2 space-y-2">
                    <label className="block text-xs font-medium text-gray-700">
                      Languages (Optional)
                    </label>
                    <Controller
                      name="language_ids"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          isMulti
                          value={
                            field.value
                              ?.map((id) => languageOptions.find((o) => o.value === String(id)))
                              .filter(Boolean) || []
                          }
                          onMenuOpen={() => fetchLanguages("")}
                          onInputChange={handleLanguageSearch}
                          options={languageOptions}
                          filterOption={null}
                          isLoading={languageLoading}
                          onChange={(opts) => {
                            const uniqueValues = opts
                              ? Array.from(new Set(opts.map((o) => String(o.value))))
                              : [];
                            field.onChange(uniqueValues);
                          }}
                          placeholder="Select languages"
                          isClearable
                          isSearchable
                          className="text-sm"
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              borderColor: state.isFocused ? "#9bc87c" : base.borderColor,
                              boxShadow: state.isFocused ? `0 0 0 1px #9bc87c` : base.boxShadow,
                              "&:hover": { borderColor: "#9bc87c" },
                              minHeight: 40,
                            }),
                          }}
                        />
                      )}
                    />
                  </div>
                </div>

                {/* ===== RECRUITER DETAILS ===== */}
                <div className="p-4 mb-6 border border-gray-200 rounded-lg bg-gray-50">
                  <h2 className="mb-4 text-lg font-semibold text-center text-gray-800">
                    Recruiter Details
                  </h2>
                  <div className="grid grid-cols-1 gap-3 mb-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <p className="p-2 text-sm bg-gray-100 border rounded">
                        {user?.first_name || "–"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <p className="p-2 text-sm bg-gray-100 border rounded">
                        {user?.last_name || "–"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <p className="p-2 text-sm bg-gray-100 border rounded">
                        {user?.email || "–"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Phone</label>
                      <p className="p-2 text-sm bg-gray-100 border rounded">
                        {user?.phone || "–"}
                      </p>
                    </div>
                  </div>

                  {/* ===== Designation ===== */}
                  <div className="mt-2 space-y-2">
                    <label className="block text-xs font-medium text-gray-700">
                      Designation <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name="designation_id"
                      control={control}
                      render={({ field }) => (
                        <CreatableSelect
                          {...field}
                          value={
                            field.value
                              ? {
                                  value: String(field.value),
                                  label:
                                    jobRoleOptions.find((o) => o.value === String(field.value))?.label ||
                                    watch("other_designation_name") ||
                                    "",
                                }
                              : watch("other_designation_name")
                              ? { value: "__custom__", label: watch("other_designation_name") }
                              : null
                          }
                          onMenuOpen={() => fetchJobRoles("")}
                          onInputChange={handleJobRoleSearch}
                          options={jobRoleOptions}
                          isLoading={jobRoleLoading}
                          filterOption={null}
                          onChange={(opt) => {
                            if (opt && opt.__isNew__) {
                              setValue("other_designation_name", opt.label.trim());
                              field.onChange(null);
                            } else {
                              setValue("other_designation_name", "");
                              field.onChange(opt ? String(opt.value) : null);
                            }
                          }}
                          // placeholder="Select or type your designation [Min 3 chars]"
                          placeholder="Select your designation"
                          isClearable
                          isSearchable
                          className="text-sm"
                          styles={{
                            control: (base, state) => ({
                              ...base,
                              borderColor: (errors.designation_id || errors.other_designation_name) ? "#ef4444" : state.isFocused ? "#9bc87c" : base.borderColor,
                              boxShadow: state.isFocused ? `0 0 0 1px #9bc87c` : base.boxShadow,
                              "&:hover": { borderColor: (errors.designation_id || errors.other_designation_name) ? "#ef4444" : "#9bc87c" },
                              minHeight: 40,
                            }),
                          }}
                        />
                      )}
                    />
                    {(errors.designation_id || errors.other_designation_name) && (
                      <p className="text-xs text-red-500">
                        {errors.designation_id?.message || errors.other_designation_name?.message}
                      </p>
                    )}
                  </div>

                  {/* ===== Profile Pic ===== */}
                  <div className="mt-2 space-y-2">
                    <label className="block text-xs font-medium text-gray-700">
                      Profile Picture <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center justify-between p-2 border border-gray-200 rounded">
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePicUpload}
                          className="text-sm"
                          disabled={uploadingProfile}
                        />
                        {uploadingProfile && (
                          <span className="ml-2 text-xs text-blue-500">Uploading...</span>
                        )}
                      </div>
                      <div>
                        {profilePicPreview && (
                          <img
                            src={profilePicPreview}
                            alt="Profile Pic"
                            className="object-cover w-10 h-10 border rounded"
                          />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">
                      Max size: {formatFileSize(MAX_PROFILE_PIC_SIZE)} • Square image recommended
                    </p>
                    {errors.profile_pic && (
                      <p className="text-xs text-red-500">{errors.profile_pic.message}</p>
                    )}
                  </div>
                </div>

                {/* ===== Submit Button ===== */}
                <div className="flex justify-end gap-4 pt-4 mt-6 border-t border-gray-200">
                  <Button
                    type="submit"
                    loading={isSubmitting || uploadingLogo || uploadingProfile}
                    disabled={isSubmitting || uploadingLogo || uploadingProfile}
                  >
                    {isSubmitting ? "Creating Profile..." : "Create Profile"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}