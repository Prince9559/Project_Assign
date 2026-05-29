// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { useSelector } from "react-redux";
// import { Input, Button, ErrorMessage } from "../../../components/ui";
// import MainLayout from "../../../components/layout/MainLayout";
// import FeedRightSidebar from "../feed/FeedRightSidebar";
// import { IoIosArrowBack } from "react-icons/io";
// import { useMasterData } from "../../../hooks/master/useMasterData";
// import { userDetailsApi } from "../../../api/userDetailsApi";
// import useUploadImageApi from "../../../hooks/useUploadImageApi";
// import Select from "react-select";
// import { z } from "zod";
// import CreatableSelect from "react-select/creatable";
// import axios from "axios";
// // --- Zod Schema (matches StudentFillDetail) ---
// const SCHOOL_STANDARDS = ["Class X or below", "Class XI", "Class XII"];
// const BASE_URL = import.meta.env.VITE_BASE_URL

// const educationEntrySchema = z.object({
//   level: z.enum(["school", "diploma", "bachelors", "masters", "phd", "other"]),
//   school_college_id: z.number().nullable(),
//   other_institution_name: z.string().optional(),
//   standard_or_grade: z.string().optional(),
//   course_id: z.number().nullable().optional(),
//   other_course_name: z.string().optional(),
//   specialization_id: z.number().nullable().optional(),
//   other_specialization_name: z.string().optional(),
//   start_date: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Invalid date format (YYYY-MM)").optional(),
//   end_date: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Invalid date format (YYYY-MM)").optional().nullable(),
//   education_certificate: z.string().optional().or(z.literal("")),
// }).superRefine((data, ctx) => {
//   if (!data.school_college_id && !data.other_institution_name?.trim()) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       message: "Please select an institution or enter a name",
//       path: ["school_college_id"],
//     });
//   }
//   if (data.start_date && data.end_date) {
//     if (new Date(data.end_date) < new Date(data.start_date)) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "End date cannot be before start date",
//         path: ["end_date"],
//       });
//     }
//   }
//   if (
//     data.level === "school" &&
//     !SCHOOL_STANDARDS.includes(data.standard_or_grade)
//   ) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       message: "Invalid standard selection",
//       path: ["standard_or_grade"],
//     });
//   }
//   // 🔹 NEW: Course validation
//   if (data.level !== "school") {
//     if (data.course_id == null && !data.other_course_name?.trim()) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "Please select or enter a course",
//         path: ["course_id"],
//       });
//     }
//     if (data.course_id != null && data.other_course_name?.trim()) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "Cannot specify both a predefined and custom course",
//         path: ["other_course_name"],
//       });
//     }
//   }

//   // 🔹 NEW: Specialization validation (only if applicable)
//   const hasCourse = data.course_id != null || data.other_course_name?.trim();
//   if (hasCourse && !["diploma", "other"].includes(data.level)) {
//     if (
//       data.specialization_id == null &&
//       !data.other_specialization_name?.trim()
//     ) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "Please select or enter a specialization",
//         path: ["specialization_id"],
//       });
//     }
//     if (
//       data.specialization_id != null &&
//       data.other_specialization_name?.trim()
//     ) {
//       ctx.addIssue({
//         code: z.ZodIssueCode.custom,
//         message: "Cannot specify both a predefined and custom specialization",
//         path: ["other_specialization_name"],
//       });
//     }
//   }
// });

// // --- Helpers ---
// const normalizeToYearMonth = (dateStr) => {
//   if (!dateStr) return "";
//   if (/^\d{4}-\d{2}$/.test(dateStr)) return dateStr;
//   if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr.substring(0, 7);
//   const date = new Date(dateStr);
//   if (!isNaN(date.getTime())) {
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     return `${year}-${month}`;
//   }
//   return "";
// };

// const getStatusBgColor = (status) => {
//   switch (status?.toLowerCase()) {
//     case "approved": return "bg-green-100";
//     case "rejected": return "bg-red-100";
//     default: return "bg-orange-100";
//   }
// };

// const OTHER_OPTION = { id: "other", name: "Other (not listed)" };

// const EDUCATION_LEVELS = [
//   { value: "school", label: "School (up to Class XII)" },
//   // { value: "diploma", label: "Diploma / Polytechnic" },
//   { value: "bachelors", label: "Bachelor’s Degree" },
//   { value: "masters", label: "Master’s Degree" },
//   // { value: "phd", label: "PhD / Doctorate" },
//   // { value: "other", label: "Other Certification" },
// ];

// const FeedYourEducation = () => {
//   const navigate = useNavigate();
//   const { user, token, isAuthenticated } = useSelector((state) => state.auth);
//   const { uploadImage, loading: uploadLoading } = useUploadImageApi();

//   const [specializationSearch, setSpecializationSearch] = useState("");
//   const [specializations, setSpecializations] = useState([]);
//   const [specializationLoading, setSpecializationLoading] = useState(false);

//   const [educationEntries, setEducationEntries] = useState([]);
//   const [errors, setErrors] = useState({});
//   const [uploadProgress, setUploadProgress] = useState({});
//   const [loading, setLoading] = useState(true);

//   const [institutionSearch, setInstitutionSearch] = useState("");
//   const [institutionOptions, setInstitutionOptions] = useState([]);
//   const [institutionLoading, setInstitutionLoading] = useState(false);

//   const [courseSearch, setCourseSearch] = useState("");
//   const [courses, setCourses] = useState([]);
//   const [courseLoading, setCourseLoading] = useState(false);

//   const {

//     //schoolColleges,
//     //getSpecializationsForCourse,
//     isLoading: isMasterDataLoading,
//   } = useMasterData();

//   // Fetch profile
//   useEffect(() => {
//     if (!isAuthenticated || !token || !user?.id) {
//       setLoading(false);
//       setEducationEntries([createEmptyEntry()]);
//       return;
//     }

//     const fetchProfile = async () => {
//       try {
//         const result = await userDetailsApi.getUserPublicProfile(user.id, token);
//         if (result.success) {
//           const educations = result.data?.educations || [];
//           const mapped = educations.map((edu) => ({
//             id: edu.id,
//             level: edu.level || "school",
//             school_college_id: edu.school_college_id,
//             other_institution_name: edu.other_institution_name || "",
//             standard_or_grade: edu.standard_or_grade || "Class XII",
//             course_id: edu.course_id,
//             specialization_id: edu.specialization_id,
//             start_date: normalizeToYearMonth(edu.start_date),
//             end_date: normalizeToYearMonth(edu.end_date),
//             education_certificate: edu.education_certificate || "",
//             status: edu.status || "pending",
//           }));
//           setEducationEntries(mapped.length ? mapped : [createEmptyEntry()]);
//         } else {
//           setEducationEntries([createEmptyEntry()]);
//         }
//       } catch (err) {
//         console.error(err);
//         setEducationEntries([createEmptyEntry()]);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProfile();
//   }, [isAuthenticated, token, user?.id]);

//   const createEmptyEntry = () => ({
//     id: Date.now(),
//     level: "school",
//     school_college_id: null,
//     other_institution_name: "",
//     standard_or_grade: "Class XII",
//     course_id: null,
//     other_course_name: "",
//     specialization_id: null,
//     other_specialization_name: "",
//     start_date: "",
//     end_date: "",
//     education_certificate: "",
//     status: "pending",
//   });

//   //for college
//   useEffect(() => {
//     if (!institutionSearch || institutionSearch.length < 2) {
//       setInstitutionOptions([]);
//       return;
//     }

//     const timer = setTimeout(async () => {
//       try {
//         setInstitutionLoading(true);

//         const res = await axios.get(
//           `${BASE_URL}/master/school-college/search`,
//           {
//             params: { search: institutionSearch },
//           }
//         );

//         if (res.data?.success) {
//           setInstitutionOptions(
//             res.data.data.map((inst) => ({
//               value: inst.id,
//               label: inst.name,
//             }))
//           );
//         } else {
//           setInstitutionOptions([]);
//         }
//       } catch (err) {
//         console.error("Institution API error", err);
//         setInstitutionOptions([]);
//       } finally {
//         setInstitutionLoading(false);
//       }
//     }, 400);

//     return () => clearTimeout(timer);
//   }, [institutionSearch]);

//   //for  courses
//   useEffect(() => {
//     if (!courseSearch || courseSearch.length < 2) {
//       setCourses([]);
//       return;
//     }

//     const timer = setTimeout(async () => {
//       try {
//         setCourseLoading(true);

//         const res = await axios.get(
//           `${BASE_URL}/master/courses/search`,
//           {
//             params: { search: courseSearch },
//           }
//         );

//         if (res.data?.success) {
//           setCourses(res.data.data);
//         } else {
//           setCourses([]);
//         }
//       } catch (error) {
//         setCourses([]);
//       } finally {
//         setCourseLoading(false);
//       }
//     }, 400); // debounce

//     return () => clearTimeout(timer);
//   }, [courseSearch]);

//   //for specialization
//   useEffect(() => {
//     const timers = Object.keys(specializationSearch).map((entryId) => {
//       const search = specializationSearch[entryId];
//       const courseId = educationEntries.find(e => e.id === Number(entryId))?.course_id;

//       if (!search || search.length < 2 || !courseId) return null;

//       return setTimeout(async () => {
//         try {
//           setSpecializationLoading(prev => ({ ...prev, [entryId]: true }));

//           const res = await axios.get(
//             `${BASE_URL}/master/specialization/search`,
//             {
//               params: {
//                 search,
//                 course_id: courseId,
//               },
//             }
//           );

//           setSpecializations(prev => ({
//             ...prev,
//             [entryId]: res.data?.success ? res.data.data : [],
//           }));
//         } catch {
//           setSpecializations(prev => ({ ...prev, [entryId]: [] }));
//         } finally {
//           setSpecializationLoading(prev => ({ ...prev, [entryId]: false }));
//         }
//       }, 400);
//     });

//     return () => timers.forEach(t => t && clearTimeout(t));
//   }, [specializationSearch, educationEntries]);

//   // --- Handlers ---
//   const handleInputChange = (id, field, value) => {
//     setEducationEntries((prev) =>
//       prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
//     );
//     // Clear error on change
//     setErrors((prev) => {
//       const newErrors = { ...prev };
//       if (newErrors[id]?.[field]) delete newErrors[id][field];
//       if (Object.keys(newErrors[id] || {}).length === 0) delete newErrors[id];
//       return newErrors;
//     });
//   };

//   const handleLevelChange = (id, opt) => {
//     const level = opt?.value || "school";
//     setEducationEntries((prev) =>
//       prev.map((e) =>
//         e.id === id
//           ? {
//             ...e,
//             level,
//             school_college_id: null,
//             other_institution_name: "",
//             course_id: null,
//             other_course_name: "",
//             specialization_id: null,
//             other_specialization_name: "",
//             standard_or_grade: level === "school" ? "Class XII" : "",
//           }
//           : e
//       )
//     );
//   };

//   //   const institutionOptions = React.useMemo(() => {
//   //   return schoolColleges || [];
//   // }, [schoolColleges]);

//   const handleInstitutionChange = (id, opt) => {
//     const isOther = opt?.id === "other";
//     handleInputChange(id, "school_college_id", isOther ? null : opt?.id || null);
//     if (isOther) handleInputChange(id, "other_institution_name", "");
//   };

//   const handleCourseChange = (id, opt) => {
//     handleInputChange(id, "course_id", opt?.id || null);
//     if (opt) handleInputChange(id, "specialization_id", null);
//   };

//   const handleSpecializationChange = (id, opt) => {
//     handleInputChange(id, "specialization_id", opt?.id || null);
//   };

//   const handleAddEducation = () => {
//     setEducationEntries((prev) => [...prev, createEmptyEntry()]);
//   };

//   const handleRemoveEducation = (id) => {
//     if (window.confirm("Are you sure you want to remove this education entry?")) {
//       setEducationEntries((prev) => prev.filter((e) => e.id !== id));
//       setErrors((prev) => {
//         const newErrors = { ...prev };
//         delete newErrors[id];
//         return newErrors;
//       });
//     }
//   };

//   const handleFileUpload = async (id, e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setUploadProgress((prev) => ({ ...prev, [id]: 0 }));
//     let progress = 0;
//     const interval = setInterval(() => {
//       progress += 10;
//       setUploadProgress((prev) => ({ ...prev, [id]: progress }));
//       if (progress >= 100) clearInterval(interval);
//     }, 100);

//     try {
//       const url = await uploadImage(file, "certificateImage");
//       if (url) {
//         handleInputChange(id, "education_certificate", url); // relative path
//       }
//     } catch (err) {
//       console.error("Upload failed", err);
//     } finally {
//       setUploadProgress((prev) => ({ ...prev, [id]: undefined }));
//     }
//   };

//   // --- Validation & Save ---
//   const validateEntries = () => {
//     const newErrors = {};
//     let isValid = true;

//     for (const entry of educationEntries) {
//       try {
//         educationEntrySchema.parse(entry);
//       } catch (err) {
//         isValid = false;
//         if (err instanceof z.ZodError) {
//           newErrors[entry.id] = {};
//           err.issues.forEach((issue) => {
//             const path = issue.path[0];
//             newErrors[entry.id][path] = issue.message;
//           });
//         }
//       }
//     }

//     setErrors(newErrors);
//     return isValid;
//   };

//   const handleSaveChanges = async () => {
//     if (!validateEntries()) {
//       alert("Please fix validation errors before saving.");
//       return;
//     }

//     if (!isAuthenticated || !token || !user?.id) {
//       alert("Not authenticated");
//       return;
//     }

//     const payload = {
//       educations: educationEntries.map((e) => ({
//         id: typeof e.id === "number" && e.id > 1e12 ? undefined : e.id,
//         level: e.level,
//         school_college_id: e.school_college_id,
//         other_institution_name: e.other_institution_name?.trim() || null,
//         standard_or_grade: e.level === "school" ? e.standard_or_grade : null,
//         course_id: e.course_id,
//         other_course_name: e.other_course_name?.trim() || null,
//         specialization_id: e.specialization_id,
//         other_specialization_name: e.other_specialization_name?.trim() || null,
//         start_date: e.start_date,
//         end_date: e.end_date || null,
//         education_certificate: e.education_certificate || null,
//       })),
//     };

//     try {
//       const result = await userDetailsApi.updateUserDetails(user.id, payload, token);
//       if (result.success) {
//         alert("Education details saved successfully!");
//         navigate("/feed-view");
//       } else {
//         throw new Error(result.message || "Save failed");
//       }
//     } catch (err) {
//       console.error(err);
//       alert(err.message || "Failed to save.");
//     }
//   };

//   // --- Loading ---
//   if (loading || isMasterDataLoading) {
//     return (
//       <MainLayout>
//         <div className="flex items-center justify-center h-screen">
//           <div className="w-12 h-12 border-b-2 border-red-500 rounded-full animate-spin"></div>
//         </div>
//       </MainLayout>
//     );
//   }

//   return (
//     <MainLayout>
//       <div className="flex justify-center min-h-screen px-4 py-6 bg-gray-100">
//         <div className="w-full max-w-3xl space-y-6">

//           <h1 className="text-2xl font-bold text-gray-800">
//             Your Education
//           </h1>

//           {educationEntries.map((entry) => {
//             return (
//               <div
//                 key={entry.id}
//                 className="relative p-5 space-y-4 bg-white border shadow-sm rounded-xl"
//               >
//                 {/* DELETE BUTTON */}
//                 <button
//                   onClick={() => handleRemoveEducation(entry.id)}
//                   className="absolute p-1 text-red-500 rounded top-3 right-3 hover:bg-red-100"
//                 >
//                   ✕
//                 </button>

//                 {/* LEVEL */}
//                 <div>
//                   <label className="block mb-1 text-sm font-medium">
//                     Education Level
//                   </label>
//                   <Select
//                     options={EDUCATION_LEVELS}
//                     value={EDUCATION_LEVELS.find(
//                       (opt) => opt.value === entry.level
//                     )}
//                     onChange={(opt) => handleLevelChange(entry.id, opt)}
//                     classNamePrefix="select"
//                   />
//                 </div>

//                 {/* INSTITUTION */}
//                 <div>
//                   <label className="block mb-1 text-sm font-medium">
//                     Institution
//                   </label>

//                   <CreatableSelect
//                     options={institutionOptions}
//                     isLoading={institutionLoading}
//                     onInputChange={(val, meta) => {
//                       if (meta.action === "input-change") {
//                         setInstitutionSearch(val);
//                       }
//                     }}
//                     value={
//                       entry.school_college_id
//                         ? institutionOptions.find(
//                           (opt) =>
//                             opt.value === entry.school_college_id
//                         )
//                         : entry.other_institution_name
//                           ? {
//                             value: entry.other_institution_name,
//                             label: entry.other_institution_name,
//                             __isNew__: true,
//                           }
//                           : null
//                     }
//                     onChange={(opt) => {
//                       if (!opt) {
//                         handleInputChange(
//                           entry.id,
//                           "school_college_id",
//                           null
//                         );
//                         handleInputChange(
//                           entry.id,
//                           "other_institution_name",
//                           ""
//                         );
//                       } else if (opt.__isNew__) {
//                         handleInputChange(
//                           entry.id,
//                           "school_college_id",
//                           null
//                         );
//                         handleInputChange(
//                           entry.id,
//                           "other_institution_name",
//                           opt.value
//                         );
//                       } else {
//                         handleInputChange(
//                           entry.id,
//                           "school_college_id",
//                           opt.value
//                         );
//                         handleInputChange(
//                           entry.id,
//                           "other_institution_name",
//                           ""
//                         );
//                       }
//                     }}
//                     placeholder="Search or type institution..."
//                     isClearable
//                   />
//                 </div>

//                 {/* SCHOOL */}
//                 {entry.level === "school" ? (
//                   <div>
//                     <label className="block mb-1 text-sm font-medium">
//                       Standard
//                     </label>
//                     <div className="flex flex-wrap gap-2">
//                       {SCHOOL_STANDARDS.map((std) => (
//                         <button
//                           key={std}
//                           type="button"
//                           onClick={() =>
//                             handleInputChange(
//                               entry.id,
//                               "standard_or_grade",
//                               std
//                             )
//                           }
//                           className={`px-3 py-1 text-xs rounded border ${entry.standard_or_grade === std
//                               ? "bg-blue-600 text-white"
//                               : "bg-gray-100"
//                             }`}
//                         >
//                           {std}
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 ) : (
//                   <>
//                     {/* COURSE */}
//                     <div>
//                       <label className="block mb-1 text-sm font-medium">
//                         Course
//                       </label>

//                       <CreatableSelect
//                         options={courses.map((c) => ({
//                           value: c.id,
//                           label: c.name,
//                         }))}
//                         isLoading={courseLoading}
//                         onInputChange={(val, meta) => {
//                           if (meta.action === "input-change") {
//                             setCourseSearch(val);
//                           }
//                         }}
//                         value={
//                           entry.course_id
//                             ? {
//                               value: entry.course_id,
//                               label:
//                                 courses.find(
//                                   (c) =>
//                                     c.id === entry.course_id
//                                 )?.name || "Selected",
//                             }
//                             : entry.other_course_name
//                               ? {
//                                 value: entry.other_course_name,
//                                 label: entry.other_course_name,
//                                 __isNew__: true,
//                               }
//                               : null
//                         }
//                         onChange={(opt) => {
//                           if (!opt) {
//                             handleInputChange(
//                               entry.id,
//                               "course_id",
//                               null
//                             );
//                             handleInputChange(
//                               entry.id,
//                               "other_course_name",
//                               ""
//                             );
//                           } else if (opt.__isNew__) {
//                             handleInputChange(
//                               entry.id,
//                               "course_id",
//                               null
//                             );
//                             handleInputChange(
//                               entry.id,
//                               "other_course_name",
//                               opt.value
//                             );
//                           } else {
//                             handleInputChange(
//                               entry.id,
//                               "course_id",
//                               opt.value
//                             );
//                             handleInputChange(
//                               entry.id,
//                               "other_course_name",
//                               ""
//                             );
//                           }
//                         }}
//                         placeholder="Search or type course..."
//                         isClearable
//                       />
//                     </div>

//                     {/* SPECIALIZATION */}
//                     {(entry.course_id ||
//                       entry.other_course_name) && (
//                         <div>
//                           <label className="block mb-1 text-sm font-medium">
//                             Specialization
//                           </label>

//                           <CreatableSelect
//                             options={(
//                               specializations[entry.id] || []
//                             ).map((s) => ({
//                               value: s.id,
//                               label: s.name,
//                             }))}
//                             isLoading={
//                               specializationLoading[entry.id]
//                             }
//                             onInputChange={(val, meta) => {
//                               if (meta.action === "input-change") {
//                                 setSpecializationSearch((prev) => ({
//                                   ...prev,
//                                   [entry.id]: val,
//                                 }));
//                               }
//                             }}
//                             value={
//                               entry.specialization_id
//                                 ? {
//                                   value:
//                                     entry.specialization_id,
//                                   label: "Selected",
//                                 }
//                                 : entry.other_specialization_name
//                                   ? {
//                                     value:
//                                       entry.other_specialization_name,
//                                     label:
//                                       entry.other_specialization_name,
//                                     __isNew__: true,
//                                   }
//                                   : null
//                             }
//                             onChange={(opt) => {
//                               if (!opt) {
//                                 handleInputChange(
//                                   entry.id,
//                                   "specialization_id",
//                                   null
//                                 );
//                               } else if (opt.__isNew__) {
//                                 handleInputChange(
//                                   entry.id,
//                                   "other_specialization_name",
//                                   opt.value
//                                 );
//                               } else {
//                                 handleInputChange(
//                                   entry.id,
//                                   "specialization_id",
//                                   opt.value
//                                 );
//                               }
//                             }}
//                             placeholder="Search or type specialization..."
//                             isClearable
//                           />
//                         </div>
//                       )}
//                   </>
//                 )}

//                 {/* DATES */}
//                 <div className="grid grid-cols-2 gap-3">

//                   {/* START DATE */}
//                   <div className="flex flex-col">
//                     <label className="mb-1 text-sm font-medium">
//                       Start Date
//                     </label>
//                     <Input
//                       type="month"
//                       value={entry.start_date}
//                       onChange={(e) =>
//                         handleInputChange(
//                           entry.id,
//                           "start_date",
//                           e.target.value
//                         )
//                       }
//                     />
//                   </div>

//                   {/* END DATE */}
//                   <div className="flex flex-col">
//                     <label className="mb-1 text-sm font-medium">
//                       End Date
//                     </label>
//                     <Input
//                       type="month"
//                       value={entry.end_date}
//                       onChange={(e) =>
//                         handleInputChange(
//                           entry.id,
//                           "end_date",
//                           e.target.value
//                         )
//                       }
//                     />
//                   </div>

//                 </div>

//                 {/* UPLOAD */}
//                 <div>

//                   <label className="block mb-1 text-sm">
//                     Certificate
//                   </label>

//                   <input
//                     type="file"
//                     onChange={(e) =>
//                       handleFileUpload(entry.id, e)
//                     }
//                   />
//                 </div>
//               </div>
//             );
//           })}

//           <div className="flex flex-col items-center gap-3">

//             {/* ADD BUTTON */}
//             <button
//               onClick={handleAddEducation}
//               className="px-6 py-2 text-white bg-blue-600 rounded-lg w-fit"
//             >
//               + Add Education
//             </button>

//             {/* SAVE BUTTON */}
//             <button
//               onClick={handleSaveChanges}
//               className="px-8 py-3 font-semibold text-white bg-red-500 rounded-lg w-fit"
//             >
//               Save Changes
//             </button>

//           </div>
//         </div>
//       </div>
//     </MainLayout>
//   );
// };

// export default FeedYourEducation;

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Input, Button, ErrorMessage, Label } from "../../../components/ui";
import MainLayout from "../../../components/layout/MainLayout";
import FeedRightSidebar from "../feed/FeedRightSidebar";
import { IoIosArrowBack } from "react-icons/io";
import { useMasterData } from "../../../hooks/master/useMasterData";
import { userDetailsApi } from "../../../api/userDetailsApi";
import useUploadImageApi from "../../../hooks/useUploadImageApi";
import Select from "react-select";
import { z } from "zod";
import CreatableSelect from "react-select/creatable";
import axios from "axios";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

// --- Constants ---
const SCHOOL_STANDARDS = ["Class X or below", "Class XI", "Class XII"];
const BASE_URL = import.meta.env.VITE_BASE_URL;

// --- Certificate Upload Validation (handwritten + printed) ---
const ALLOWED_CERT_EXTENSIONS = [".jpg", ".jpeg", ".png", ".pdf"];
const ALLOWED_CERT_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];
const MAX_CERT_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const validateCertificateFile = (file) => {
  if (!file) return "Please choose a file to upload.";
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const hasValidExt = ALLOWED_CERT_EXTENSIONS.includes(`.${ext}`);
  const hasValidMime =
    !file.type || ALLOWED_CERT_MIME_TYPES.includes(file.type.toLowerCase());
  if (!hasValidExt || !hasValidMime) {
    return "Only JPG, JPEG, PNG, or PDF files are allowed (printed or handwritten certificates).";
  }
  if (file.size > MAX_CERT_SIZE_BYTES) {
    return "File is too large. Maximum size allowed is 5 MB.";
  }
  return null;
};

// --- Zod Schema ---
const educationEntrySchema = z
  .object({
    level: z.enum([
      "school",
      "diploma",
      "bachelors",
      "masters",
      "phd",
      "other",
    ]),
    school_college_id: z.number().nullable(),
    other_institution_name: z.string().optional(),
    standard_or_grade: z.string().optional(),
    course_id: z.number().nullable().optional(),
    other_course_name: z.string().optional(),
    specialization_id: z.number().nullable().optional(),
    other_specialization_name: z.string().optional(),
    start_date: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Invalid date format (YYYY-MM)")
      .optional(),
    end_date: z
      .string()
      .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Invalid date format (YYYY-MM)")
      .optional()
      .nullable(),
    education_certificate: z.string().optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (!data.school_college_id && !data.other_institution_name?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please select an institution or enter a name",
        path: ["school_college_id"],
      });
    }
    if (data.start_date && data.end_date) {
      if (new Date(data.end_date) < new Date(data.start_date)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date cannot be before start date",
          path: ["end_date"],
        });
      }
    }
    if (
      data.level === "school" &&
      !SCHOOL_STANDARDS.includes(data.standard_or_grade)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid standard selection",
        path: ["standard_or_grade"],
      });
    }
    if (data.level !== "school") {
      if (data.course_id == null && !data.other_course_name?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select or enter a course",
          path: ["course_id"],
        });
      }
      if (data.course_id != null && data.other_course_name?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Cannot specify both a predefined and custom course",
          path: ["other_course_name"],
        });
      }
    }
    const hasCourse = data.course_id != null || data.other_course_name?.trim();
    if (hasCourse && !["diploma", "other"].includes(data.level)) {
      if (
        data.specialization_id == null &&
        !data.other_specialization_name?.trim()
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select or enter a specialization",
          path: ["specialization_id"],
        });
      }
      if (
        data.specialization_id != null &&
        data.other_specialization_name?.trim()
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Cannot specify both a predefined and custom specialization",
          path: ["other_specialization_name"],
        });
      }
    }
  });

// --- Helpers ---
const normalizeToYearMonth = (dateStr) => {
  if (!dateStr) return "";
  if (/^\d{4}-\d{2}$/.test(dateStr)) return dateStr;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr.substring(0, 7);
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }
  return "";
};

const OTHER_OPTION = { id: "other", name: "Other (not listed)" };

const EDUCATION_LEVELS = [
  { value: "school", label: "School (up to Class XII)" },
  { value: "bachelors", label: "Bachelor's Degree" },
  { value: "masters", label: "Master's Degree" },
];

/** Green theme for react-select / creatable on this page only */
const EDU_GREEN = "#9bc87c";
const EDU_OPTION_HOVER = "#e6f4dc";
const EDU_ERROR = "#ef4444";

const getEducationSelectStyles = (hasError) => ({
  control: (base, state) => ({
    ...base,
    minHeight: 44,
    borderColor: hasError
      ? EDU_ERROR
      : state.isFocused
        ? EDU_GREEN
        : base.borderColor,
    boxShadow: state.isFocused
      ? hasError
        ? "0 0 0 2px rgba(239, 68, 68, 0.25)"
        : "0 0 0 2px rgba(155, 200, 124, 0.3)"
      : "none",
    borderRadius: 8,
    "&:hover": { borderColor: hasError ? EDU_ERROR : EDU_GREEN },
  }),
  placeholder: (p) => ({ ...p, color: "#9ca3af" }),
  singleValue: (p) => ({ ...p, color: "#1f2937" }),
  menu: (p) => ({ ...p, borderRadius: 8, overflow: "hidden", zIndex: 20 }),
  option: (base, state) => ({
    ...base,
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
});

const FeedYourEducation = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);
  const { uploadImage, loading: uploadLoading } = useUploadImageApi();

  // State for form data
  const [educationEntries, setEducationEntries] = useState([]);
  const [originalEntries, setOriginalEntries] = useState([]); // For tracking changes
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [proofFiles, setProofFiles] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Search states
  const [institutionSearch, setInstitutionSearch] = useState("");
  const [institutionOptions, setInstitutionOptions] = useState([]);
  const [institutionLoading, setInstitutionLoading] = useState(false);

  const [courseSearch, setCourseSearch] = useState("");
  const [courses, setCourses] = useState([]);
  const [courseLoading, setCourseLoading] = useState(false);

  const [specializationSearch, setSpecializationSearch] = useState({});
  const [specializations, setSpecializations] = useState({});
  const [specializationLoading, setSpecializationLoading] = useState({});

  // Cached data for displaying saved values
  const [cachedInstitutions, setCachedInstitutions] = useState({});
  const [cachedCourses, setCachedCourses] = useState({});
  const [cachedSpecializations, setCachedSpecializations] = useState({});

  const { isLoading: isMasterDataLoading } = useMasterData();

  //  Show toast notification
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  //  Fetch institution/course/specialization details by ID for display
  const fetchDetailsById = useCallback(
    async (type, id, entryId = null) => {
      if (!id || !token) return null;
      try {
        let endpoint = "";
        switch (type) {
          case "institution":
            endpoint = `${BASE_URL}/master/school-college/${id}`;
            break;
          case "course":
            endpoint = `${BASE_URL}/master/courses/${id}`;
            break;
          case "specialization":
            endpoint = `${BASE_URL}/master/specialization/${id}`;
            break;
          default:
            return null;
        }
        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.success) {
          const data = res.data.data;
          switch (type) {
            case "institution":
              setCachedInstitutions((prev) => ({
                ...prev,
                [id]: { value: data.id, label: data.name },
              }));
              break;
            case "course":
              setCachedCourses((prev) => ({
                ...prev,
                [id]: { value: data.id, label: data.name },
              }));
              break;
            case "specialization":
              setCachedSpecializations((prev) => ({
                ...prev,
                [id]: { value: data.id, label: data.name },
              }));
              break;
          }
          return { value: data.id, label: data.name };
        }
      } catch (err) {
        console.error(`Failed to fetch ${type} details:`, err);
      }
      return null;
    },
    [token],
  );

  //  Fetch profile and pre-fill form
  useEffect(() => {
    if (!isAuthenticated || !token || !user?.id) {
      setLoading(false);
      const empty = createEmptyEntry();
      setEducationEntries([empty]);
      setOriginalEntries([empty]);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const result = await userDetailsApi.getStudentEducations(token);
        if (result.success) {
          const educations = result.data || [];
          const mapped = await Promise.all(
            educations.map(async (edu) => {
              // Pre-fetch details for Select display
              let institutionLabel = null;
              let courseLabel = null;
              let specializationLabel = null;

              if (edu.school_college_id) {
                institutionLabel = await fetchDetailsById(
                  "institution",
                  edu.school_college_id,
                );
              }
              if (edu.course_id) {
                courseLabel = await fetchDetailsById("course", edu.course_id);
              }
              if (edu.specialization_id) {
                specializationLabel = await fetchDetailsById(
                  "specialization",
                  edu.specialization_id,
                );
              }

              return {
                id: edu.id || Date.now() + Math.random(),
                level: edu.level || "school",
                school_college_id: edu.school_college_id,
                other_institution_name: edu.other_institution_name || "",
                institutionLabel,
                standard_or_grade: edu.standard_or_grade || "Class XII",
                course_id: edu.course_id,
                other_course_name: edu.other_course_name || "",
                courseLabel,
                specialization_id: edu.specialization_id,
                other_specialization_name: edu.other_specialization_name || "",
                specializationLabel,
                start_date: normalizeToYearMonth(edu.start_date),
                end_date: normalizeToYearMonth(edu.end_date),
                education_certificate: edu.education_certificate || "",
                approval_status: edu.approval_status || "approved",
                removed_by_university: !!edu.removed_by_university,
                removal_reason: edu.removal_reason || "",
                proof_document: edu.proof_document || "",
                reapproval_requested: !!edu.reapproval_requested,
                status: edu.status || "pending",
              };
            }),
          );

          const entries = mapped.length ? mapped : [createEmptyEntry()];
          setEducationEntries(entries);
          setOriginalEntries(JSON.parse(JSON.stringify(entries)));
        } else {
          const empty = createEmptyEntry();
          setEducationEntries([empty]);
          setOriginalEntries([empty]);
        }
      } catch (err) {
        console.error("Fetch profile error:", err);
        const empty = createEmptyEntry();
        setEducationEntries([empty]);
        setOriginalEntries([empty]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, token, user?.id, fetchDetailsById]);

  //  Create empty entry
  const createEmptyEntry = () => ({
    id: Date.now() + Math.random(),
    level: "school",
    school_college_id: null,
    other_institution_name: "",
    institutionLabel: null,
    standard_or_grade: "Class XII",
    course_id: null,
    other_course_name: "",
    courseLabel: null,
    specialization_id: null,
    other_specialization_name: "",
    specializationLabel: null,
    start_date: "",
    end_date: "",
    education_certificate: "",
    approval_status: "approved",
    removed_by_university: false,
    removal_reason: "",
    proof_document: "",
    reapproval_requested: false,
    status: "pending",
  });

  //  Institution search with debounce
  useEffect(() => {
    if (!institutionSearch || institutionSearch.length < 2) {
      setInstitutionOptions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setInstitutionLoading(true);
        const res = await axios.get(
          `${BASE_URL}/master/school-college/search`,
          {
            params: { search: institutionSearch },
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.data?.success) {
          setInstitutionOptions(
            res.data.data.map((inst) => ({ value: inst.id, label: inst.name })),
          );
        } else {
          setInstitutionOptions([]);
        }
      } catch (err) {
        console.error("Institution API error", err);
        setInstitutionOptions([]);
      } finally {
        setInstitutionLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [institutionSearch, token]);

  //  Course search with debounce
  useEffect(() => {
    if (!courseSearch || courseSearch.length < 2) {
      setCourses([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setCourseLoading(true);
        const res = await axios.get(`${BASE_URL}/master/courses/search`, {
          params: { search: courseSearch },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.success) {
          setCourses(res.data.data);
        } else {
          setCourses([]);
        }
      } catch (error) {
        setCourses([]);
      } finally {
        setCourseLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [courseSearch, token]);

  //  Specialization search with debounce
  useEffect(() => {
    const timers = Object.keys(specializationSearch).map((entryId) => {
      const search = specializationSearch[entryId];
      const entry = educationEntries.find(
        (e) => String(e.id) === String(entryId),
      );
      const courseId = entry?.course_id;

      if (!search || search.length < 2 || !courseId) return null;

      return setTimeout(async () => {
        try {
          setSpecializationLoading((prev) => ({ ...prev, [entryId]: true }));
          const res = await axios.get(
            `${BASE_URL}/master/specialization/search`,
            {
              params: { search, course_id: courseId },
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          setSpecializations((prev) => ({
            ...prev,
            [entryId]: res.data?.success ? res.data.data : [],
          }));
        } catch {
          setSpecializations((prev) => ({ ...prev, [entryId]: [] }));
        } finally {
          setSpecializationLoading((prev) => ({ ...prev, [entryId]: false }));
        }
      }, 400);
    });
    return () => timers.forEach((t) => t && clearTimeout(t));
  }, [specializationSearch, educationEntries, token]);

  //  Handle input changes
  const handleInputChange = (id, field, value) => {
    setEducationEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    );
    // Clear error on change
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (newErrors[id]?.[field]) {
        delete newErrors[id][field];
        if (Object.keys(newErrors[id] || {}).length === 0) delete newErrors[id];
      }
      return newErrors;
    });
  };

  const isRejectedEntry = (entry) => entry.approval_status === "rejected";

  //  Handle level change
  const handleLevelChange = (id, opt) => {
    const level = opt?.value || "school";
    setEducationEntries((prev) =>
      prev.map((e) =>
        e.id === id
          ? {
              ...e,
              level,
              school_college_id: null,
              other_institution_name: "",
              institutionLabel: null,
              course_id: null,
              other_course_name: "",
              courseLabel: null,
              specialization_id: null,
              other_specialization_name: "",
              specializationLabel: null,
              standard_or_grade: level === "school" ? "Class XII" : "",
            }
          : e,
      ),
    );
  };

  //  Handle institution change
  const handleInstitutionChange = (id, opt) => {
    if (!opt) {
      handleInputChange(id, "school_college_id", null);
      handleInputChange(id, "other_institution_name", "");
      handleInputChange(id, "institutionLabel", null);
    } else if (opt.__isNew__) {
      handleInputChange(id, "school_college_id", null);
      handleInputChange(id, "other_institution_name", opt.value);
      handleInputChange(id, "institutionLabel", {
        value: opt.value,
        label: opt.value,
      });
    } else {
      handleInputChange(id, "school_college_id", opt.value);
      handleInputChange(id, "other_institution_name", "");
      handleInputChange(id, "institutionLabel", {
        value: opt.value,
        label: opt.label,
      });
    }
  };

  //  Handle course change
  const handleCourseChange = (id, opt) => {
    if (!opt) {
      handleInputChange(id, "course_id", null);
      handleInputChange(id, "other_course_name", "");
      handleInputChange(id, "courseLabel", null);
      handleInputChange(id, "specialization_id", null);
      handleInputChange(id, "specializationLabel", null);
    } else if (opt.__isNew__) {
      handleInputChange(id, "course_id", null);
      handleInputChange(id, "other_course_name", opt.value);
      handleInputChange(id, "courseLabel", {
        value: opt.value,
        label: opt.value,
      });
      handleInputChange(id, "specialization_id", null);
      handleInputChange(id, "specializationLabel", null);
    } else {
      handleInputChange(id, "course_id", opt.value);
      handleInputChange(id, "other_course_name", "");
      handleInputChange(id, "courseLabel", {
        value: opt.value,
        label: opt.label,
      });
      handleInputChange(id, "specialization_id", null);
      handleInputChange(id, "specializationLabel", null);
    }
  };

  //  Handle specialization change
  const handleSpecializationChange = (id, opt) => {
    if (!opt) {
      handleInputChange(id, "specialization_id", null);
      handleInputChange(id, "other_specialization_name", "");
      handleInputChange(id, "specializationLabel", null);
    } else if (opt.__isNew__) {
      handleInputChange(id, "specialization_id", null);
      handleInputChange(id, "other_specialization_name", opt.value);
      handleInputChange(id, "specializationLabel", {
        value: opt.value,
        label: opt.value,
      });
    } else {
      handleInputChange(id, "specialization_id", opt.value);
      handleInputChange(id, "other_specialization_name", "");
      handleInputChange(id, "specializationLabel", {
        value: opt.value,
        label: opt.label,
      });
    }
  };

  //  Add new education entry
  const handleAddEducation = () => {
    setEducationEntries((prev) => [...prev, createEmptyEntry()]);
  };

  //  Remove education entry
  const handleRemoveEducation = (id) => {
    if (
      window.confirm("Are you sure you want to remove this education entry?")
    ) {
      setEducationEntries((prev) => prev.filter((e) => e.id !== id));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleUploadProof = async (entry) => {
    try {
      const response = await userDetailsApi.uploadEducationProof(
        entry.id,
        proofFiles[entry.id] || null,
        token,
      );
      if (response?.success) {
        showToast("Proof uploaded and re-approval requested.", "success");
        const latest = await userDetailsApi.getStudentEducations(token);
        if (latest?.success) {
          const updated = latest.data || [];
          setEducationEntries((prev) =>
            prev.map((item) => {
              const found = updated.find((u) => u.id === item.id);
              return found
                ? {
                    ...item,
                    approval_status: found.approval_status || "approved",
                    removed_by_university: !!found.removed_by_university,
                    removal_reason: found.removal_reason || "",
                    proof_document: found.proof_document || "",
                    reapproval_requested: !!found.reapproval_requested,
                  }
                : item;
            }),
          );
        }
      }
    } catch (error) {
      console.error("Proof upload failed:", error);
      showToast("Failed to upload proof.", "error");
    }
  };

  // //  Handle file upload
  // const handleFileUpload = async (id, e) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;

  //   setUploadProgress((prev) => ({ ...prev, [id]: 0 }));
  //   let progress = 0;
  //   const interval = setInterval(() => {
  //     progress += 10;
  //     setUploadProgress((prev) => ({ ...prev, [id]: Math.min(progress, 100) }));
  //     if (progress >= 100) clearInterval(interval);
  //   }, 100);

  //   try {
  //     const url = await uploadImage(file, "certificateImage");
  //     if (url) {
  //       handleInputChange(id, "education_certificate", url);
  //       showToast("Certificate uploaded!", "success");
  //     }
  //   } catch (err) {
  //     console.error("Upload failed", err);
  //     showToast("Upload failed. Please try again.", "error");
  //   } finally {
  //     setUploadProgress((prev) => ({ ...prev, [id]: undefined }));
  //   }
  // };

  //  Handle file upload (accepts handwritten & printed certificates)
  const handleFileUpload = async (id, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation: type + size only
    const validationError = validateCertificateFile(file);
    if (validationError) {
      showToast(validationError, "error");
      e.target.value = ""; // reset so user can re-pick same file
      return;
    }

    setUploadProgress((prev) => ({ ...prev, [id]: 0 }));
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress((prev) => ({ ...prev, [id]: Math.min(progress, 100) }));
      if (progress >= 100) clearInterval(interval);
    }, 100);

    try {
      const url = await uploadImage(file, "certificateImage");
      if (url) {
        handleInputChange(id, "education_certificate", url);
        showToast("Certificate uploaded!", "success");
      } else {
        showToast("Upload failed. Please try again.", "error");
      }
    } catch (err) {
      console.error("Upload failed", err);
      const msg =
        err?.response?.data?.message || "Upload failed. Please try again.";
      showToast(msg, "error");
    } finally {
      setUploadProgress((prev) => ({ ...prev, [id]: undefined }));
      e.target.value = "";
    }
  };

  //  Validate entries
  const validateEntries = () => {
    const newErrors = {};
    let isValid = true;

    for (const entry of educationEntries) {
      try {
        educationEntrySchema.parse(entry);
      } catch (err) {
        isValid = false;
        if (err instanceof z.ZodError) {
          newErrors[entry.id] = {};
          err.issues.forEach((issue) => {
            const path = issue.path[0];
            newErrors[entry.id][path] = issue.message;
          });
        }
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  //  Save changes with optimistic update
  const handleSaveChanges = async () => {
    if (!validateEntries()) {
      showToast("Please fix validation errors before saving.", "error");
      return;
    }

    if (!isAuthenticated || !token || !user?.id) {
      showToast("Not authenticated", "error");
      return;
    }

    setSaving(true);
    const previousEntries = JSON.parse(JSON.stringify(educationEntries));

    try {
      const payload = {
        educations: educationEntries.map((e) => ({
          id: typeof e.id === "number" && e.id > 1e12 ? undefined : e.id,
          level: e.level,
          school_college_id: e.school_college_id,
          other_institution_name: e.other_institution_name?.trim() || null,
          standard_or_grade: e.level === "school" ? e.standard_or_grade : null,
          course_id: e.course_id,
          other_course_name: e.other_course_name?.trim() || null,
          specialization_id: e.specialization_id,
          other_specialization_name:
            e.other_specialization_name?.trim() || null,
          start_date: e.start_date,
          end_date: e.end_date || null,
          education_certificate: e.education_certificate || null,
        })),
      };

      //  Optimistic update: Update local state first
      setOriginalEntries(JSON.parse(JSON.stringify(educationEntries)));

      const result = await userDetailsApi.updateUserDetails(
        user.id,
        payload,
        token,
      );

      if (result.success) {
        //  Refetch to ensure consistency
        await userDetailsApi.getUserPublicProfile(user.id, token);
        showToast(" Education details saved successfully!", "success");
        setTimeout(() => navigate("/feed-view"), 1500);
      } else {
        // Rollback on failure
        setEducationEntries(previousEntries);
        throw new Error(result.message || "Save failed");
      }
    } catch (err) {
      console.error("Save error:", err);
      showToast("❌ Failed to save. Please try again.", "error");
      // Optional: rollback
      // setEducationEntries(previousEntries);
    } finally {
      setSaving(false);
    }
  };

  //  Get value for Select components (handles cached + current options)
  const getSelectValue = (options, cachedValue, currentValue, displayLabel) => {
    if (currentValue && displayLabel) return displayLabel;
    if (currentValue) {
      const found = options.find((opt) => opt.value === currentValue);
      if (found) return found;
      // Check cached
      if (cachedValue) return cachedValue;
    }
    return null;
  };

  // --- Loading State ---
  if (loading || isMasterDataLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-b-2 border-[#9bc87c] rounded-full animate-spin"></div>
            <p className="text-gray-600">Loading your education...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex justify-center min-h-screen px-4 py-6 bg-gray-100">
        <div className="w-full max-w-3xl space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/feed-view")}
              className="p-2 transition-colors rounded-full hover:bg-gray-200"
              title="Go back"
            >
              <IoIosArrowBack size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Your Education</h1>
          </div>

          {/*  Toast Notification */}
          {toast && (
            <div
              className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in ${
                toast.type === "success"
                  ? "bg-green-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {toast.type === "success" ? (
                <FaCheckCircle />
              ) : (
                <FaExclamationCircle />
              )}
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
          )}

          {/* Education Entries */}
          {educationEntries.map((entry, index) => {
            const locked = isRejectedEntry(entry);
            return (
              <div
                key={entry.id}
                className={`relative p-5 space-y-4 border shadow-sm rounded-xl ${
                  locked ? "bg-red-50 border-red-200" : "bg-white"
                }`}
              >
                {/* Entry Header */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    Entry #{index + 1}
                  </span>
                  {educationEntries.length > 1 && !locked && (
                    <button
                      onClick={() => handleRemoveEducation(entry.id)}
                      className="p-2 text-red-500 transition-colors rounded-full hover:bg-red-100"
                      title="Remove this entry"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* LEVEL */}
                <div>
                  <Label className="mb-1">Education Level</Label>
                  <Select
                    options={EDUCATION_LEVELS}
                    value={EDUCATION_LEVELS.find(
                      (opt) => opt.value === entry.level,
                    )}
                    onChange={(opt) => handleLevelChange(entry.id, opt)}
                    isDisabled={locked}
                    classNamePrefix="select"
                    styles={getEducationSelectStyles(!!errors[entry.id]?.level)}
                  />
                  {errors[entry.id]?.level && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors[entry.id].level}
                    </p>
                  )}
                </div>

                {/* INSTITUTION */}
                <div>
                  <Label className="mb-1">Institution</Label>
                  <CreatableSelect
                    options={institutionOptions}
                    isLoading={institutionLoading}
                    onInputChange={(val, meta) => {
                      if (meta.action === "input-change")
                        setInstitutionSearch(val);
                    }}
                    value={getSelectValue(
                      institutionOptions,
                      cachedInstitutions[entry.school_college_id],
                      entry.school_college_id,
                      entry.institutionLabel,
                    )}
                    onChange={(opt) => handleInstitutionChange(entry.id, opt)}
                    isDisabled={locked}
                    placeholder="Search or type institution..."
                    isClearable
                    styles={getEducationSelectStyles(
                      !!errors[entry.id]?.school_college_id,
                    )}
                  />
                  {errors[entry.id]?.school_college_id && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors[entry.id].school_college_id}
                    </p>
                  )}
                </div>

                {/* SCHOOL STANDARD (if school level) */}
                {entry.level === "school" ? (
                  <div>
                    <Label className="mb-1">Standard</Label>
                    <div className="flex flex-wrap gap-2">
                      {SCHOOL_STANDARDS.map((std) => (
                        <button
                          key={std}
                          type="button"
                          onClick={() =>
                            handleInputChange(
                              entry.id,
                              "standard_or_grade",
                              std,
                            )
                          }
                          disabled={locked}
                          className={`px-3 py-1 text-xs rounded border transition-all duration-200 ${
                            entry.standard_or_grade === std
                              ? "bg-[#9bc87c] text-white border-[#9bc87c]"
                              : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-[#e6f4dc] hover:border-[#9bc87c]"
                          }`}
                        >
                          {std}
                        </button>
                      ))}
                    </div>
                    {errors[entry.id]?.standard_or_grade && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors[entry.id].standard_or_grade}
                      </p>
                    )}
                  </div>
                ) : (
                  <>
                    {/* COURSE */}
                    <div>
                      <Label className="mb-1">Course</Label>
                      <CreatableSelect
                        options={courses.map((c) => ({
                          value: c.id,
                          label: c.name,
                        }))}
                        isLoading={courseLoading}
                        onInputChange={(val, meta) => {
                          if (meta.action === "input-change")
                            setCourseSearch(val);
                        }}
                        value={getSelectValue(
                          courses.map((c) => ({ value: c.id, label: c.name })),
                          cachedCourses[entry.course_id],
                          entry.course_id,
                          entry.courseLabel,
                        )}
                        onChange={(opt) => handleCourseChange(entry.id, opt)}
                        isDisabled={locked}
                        placeholder="Search or type course..."
                        isClearable
                        styles={getEducationSelectStyles(
                          !!errors[entry.id]?.course_id,
                        )}
                      />
                      {errors[entry.id]?.course_id && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors[entry.id].course_id}
                        </p>
                      )}
                    </div>

                    {/* SPECIALIZATION */}
                    {(entry.course_id || entry.other_course_name) && (
                      <div>
                        <Label className="mb-1">Specialization</Label>
                        <CreatableSelect
                          options={(specializations[entry.id] || []).map(
                            (s) => ({
                              value: s.id,
                              label: s.name,
                            }),
                          )}
                          isLoading={specializationLoading[entry.id]}
                          onInputChange={(val, meta) => {
                            if (meta.action === "input-change") {
                              setSpecializationSearch((prev) => ({
                                ...prev,
                                [entry.id]: val,
                              }));
                            }
                          }}
                          value={getSelectValue(
                            (specializations[entry.id] || []).map((s) => ({
                              value: s.id,
                              label: s.name,
                            })),
                            cachedSpecializations[entry.specialization_id],
                            entry.specialization_id,
                            entry.specializationLabel,
                          )}
                          onChange={(opt) =>
                            handleSpecializationChange(entry.id, opt)
                          }
                          isDisabled={locked}
                          placeholder="Search or type specialization..."
                          isClearable
                          styles={getEducationSelectStyles(
                            !!errors[entry.id]?.specialization_id,
                          )}
                        />
                        {errors[entry.id]?.specialization_id && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors[entry.id].specialization_id}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* DATES */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col">
                    <Label className="mb-1">Start Date</Label>
                    <Input
                      type="month"
                      value={entry.start_date}
                      onChange={(e) =>
                        handleInputChange(
                          entry.id,
                          "start_date",
                          e.target.value,
                        )
                      }
                      disabled={locked}
                    />
                    {errors[entry.id]?.start_date && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors[entry.id].start_date}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <Label className="mb-1">End Date</Label>
                    <Input
                      type="month"
                      value={entry.end_date}
                      onChange={(e) =>
                        handleInputChange(entry.id, "end_date", e.target.value)
                      }
                      disabled={locked}
                    />
                    {errors[entry.id]?.end_date && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors[entry.id].end_date}
                      </p>
                    )}
                  </div>
                </div>

                {/* CERTIFICATE UPLOAD */}
                <div>
                  <Label className="mb-1">Certificate (Optional)</Label>
                  <p className="mb-2 text-xs text-gray-600">
                    Handwritten certificates are also accepted. Upload a clear
                    scan or photo of your certificate in{" "}
                    <strong>JPG, JPEG, PNG, or PDF</strong> format (max 5 MB).
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <label
                      htmlFor={`education-cert-${entry.id}`}
                      className={`inline-flex ${uploadLoading || locked ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
                    >
                      <input
                        id={`education-cert-${entry.id}`}
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(entry.id, e)}
                        disabled={uploadLoading || locked}
                        className="sr-only"
                      />
                      <Button
                        as="span"
                        variant="primary"
                        className="!text-white hover:!bg-[#88b86a] rounded-md text-sm px-4 py-2"
                      >
                        Choose File
                      </Button>
                    </label>
                    {uploadProgress[entry.id] !== undefined && (
                      <div className="w-24 h-2 overflow-hidden bg-gray-200 rounded-full">
                        <div
                          className="h-full transition-all duration-200 bg-[#9bc87c]"
                          style={{ width: `${uploadProgress[entry.id]}%` }}
                        />
                      </div>
                    )}
                    {entry.education_certificate && (
                      <a
                        href={entry.education_certificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-green-800 underline-offset-2 hover:underline"
                      >
                        View Certificate
                      </a>
                    )}
                  </div>
                </div>

                {locked && (
                  <div className="p-3 border border-red-200 bg-red-100 rounded">
                    <p className="text-sm font-semibold text-red-700 mb-1">
                      Rejected by University
                    </p>
                    <p className="text-sm text-red-700 mb-3">
                      Your education entry has been rejected by university.
                      Upload proof to request re-approval.
                    </p>
                    <div className="flex flex-wrap gap-2 items-center">
                      <label
                        htmlFor={`education-proof-${entry.id}`}
                        className="inline-flex cursor-pointer"
                      >
                        <input
                          id={`education-proof-${entry.id}`}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          // onChange={(e) =>
                          //   setProofFiles((prev) => ({ ...prev, [entry.id]: e.target.files?.[0] || null }))
                          // }
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            if (file) {
                              const err = validateCertificateFile(file);
                              if (err) {
                                showToast(err, "error");
                                e.target.value = "";
                                return;
                              }
                            }
                            setProofFiles((prev) => ({
                              ...prev,
                              [entry.id]: file,
                            }));
                          }}
                          className="sr-only"
                        />
                        <Button
                          as="span"
                          variant="primary"
                          className="!text-white hover:!bg-[#88b86a] rounded-md text-sm px-4 py-2"
                        >
                          Choose File
                        </Button>
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="small"
                        onClick={() => handleUploadProof(entry)}
                      >
                        Upload Proof
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="small"
                        className="!text-white hover:!bg-[#88b86a]"
                        onClick={() => handleUploadProof({ ...entry })}
                      >
                        Request Re-Approval
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Action Buttons */}
          <div className="flex flex-col items-center gap-3 pt-4">
            <Button
              type="button"
              onClick={handleAddEducation}
              variant="primary"
              className="w-fit !text-white hover:!bg-[#88b86a]"
            >
              + Add Another Education
            </Button>
            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className={`px-8 py-3 text-white rounded-lg font-semibold w-fit transition-colors ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></span>
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CSS for toast animation */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
        /* Native month pickers: accent (supported browsers) */
        input[type="month"] {
          accent-color: #9bc87c;
        }
      `}</style>
    </MainLayout>
  );
};

export default FeedYourEducation;
