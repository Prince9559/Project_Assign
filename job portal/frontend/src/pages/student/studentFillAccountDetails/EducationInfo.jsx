// import React from "react";
// import { useFieldArray, useFormContext, Controller } from "react-hook-form";
// import axios from "axios";
// import { useRef, useState, useEffect } from "react";


// import Select from "react-select";
// import CreatableSelect from "react-select/creatable";
// import { FaTrash } from "react-icons/fa";
// import { useMasterData } from "../../../hooks/master/useMasterData";
// import { Loader, Input, Label, ErrorMessage } from "../../../components/ui";
// import CreatableField from "../../../components/ui/CreatableField";
// import AddButton from "../../../components/StudentPannel/AddButton";
// import FileUploadButton from "../../../components/StudentPannel/FileUploadButton";
// import RadioGroup from "../../../components/StudentPannel/RadioGroup";
// import CreateableSelect from "../../../components/StudentPannel/CreatableSelect";
// import ReactSelect from "../../../components/StudentPannel/ReactSelect";

// import useUploadImageApi from "../../../hooks/useUploadImageApi";
// const BASE_URL=import.meta.env.VITE_BASE_URL
// const EDUCATION_LEVELS = [
//   { value: "school", label: "School (up to Class XII)" },
//   // { value: "diploma", label: "Diploma / Polytechnic" },
//   { value: "bachelors", label: "Bachelor’s Degree" },
//   { value: "masters", label: "Master’s Degree" },
//   // { value: "phd", label: "PhD / Doctorate" },
//   // { value: "other", label: "Other Certification" },
// ];

// const SCHOOL_STANDARDS = ["Class X or below", "Class XI", "Class XII"];

// const OTHER_OPTION = { id: "other", name: "Other (not listed)" };

// export default function EducationInfo() {
//   const {
//     control,
//     watch,
//     register,
//     formState: { errors },
//     setValue,
//     clearErrors
//   } = useFormContext();
//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "educations",
//   });

//   const {
//     courses,
//     schoolColleges,
//     loading,
//     error,
//     refetch,
//     getSpecializationsForCourse,
//   } = useMasterData();

//   const { uploadImage, loading: uploadLoading } = useUploadImageApi();

//   const CustomErrorMessage = ({ message }) => (
//     <div className="w-full p-3 text-xs text-red-500 border rounded bg-red-50">
//       <div className="flex items-center justify-between">
//         <span>{message}</span>
//         <button
//           onClick={refetch}
//           className="px-2 py-1 ml-2 text-xs text-white bg-red-500 rounded hover:bg-red-600"
//         >
//           Retry
//         </button>
//       </div>
//     </div>
//   );

//   const handleAdd = () => {
//     append({
//       level: null, // Start with no level selected
//       school_college_id: null,
//       // other_institution_name: "",
//       standard_or_grade: "Class XII",
//       course_id: null,
//       other_course_name: "", // add this
//       specialization_id: null,
//       other_specialization_name: "",
//       start_date: "",
//       end_date: "",
//       education_certificate: "",
//     });
//   };


//   // Add this after: const { uploadImage, ... } = useUploadImageApi();
//   React.useEffect(() => {
//     // Ensure at least one blank education entry is present for UX
//     if (fields.length === 0) {
//       append({
//         level: null,
//         school_college_id: null,
//         standard_or_grade: "Class XII",
//         course_id: null,
//         other_course_name: "",
//         specialization_id: null,
//         other_specialization_name: "",
//         start_date: "",
//         end_date: "",
//         education_certificate: "",
//       });
//     }
//   }, [fields.length, append]);

//   const institutionOptions = React.useMemo(() => {
//     return schoolColleges ? [OTHER_OPTION, ...schoolColleges] : [OTHER_OPTION];
//   }, [schoolColleges]);



// const [schoolCollegeOptions, setSchoolCollegeOptions] = useState([]);
// const [schoolCollegeSearch, setSchoolCollegeSearch] = useState("");
// const [isSchoolCollegeLoading, setIsSchoolCollegeLoading] = useState(false);
// const schoolCollegeTimeoutRef = useRef(null);


// const [specSearch, setSpecSearch] = useState("");
// const [specOptions, setSpecOptions] = useState([]);
// const [isSpecLoading, setIsSpecLoading] = useState(false);


// const [courseOptions, setCourseOptions] = useState([]);
// const [courseSearch, setCourseSearch] = useState("");
// const [isCourseLoading, setIsCourseLoading] = useState(false);
// const courseTimeoutRef = useRef(null);

// useEffect(() => {
//   if (schoolCollegeTimeoutRef.current) clearTimeout(schoolCollegeTimeoutRef.current);

//   if (!schoolCollegeSearch || schoolCollegeSearch.length < 3) {
//     setSchoolCollegeOptions([]);
//     return;
//   }

//   schoolCollegeTimeoutRef.current = setTimeout(async () => {
//     try {
//       setIsSchoolCollegeLoading(true);
//       const res = await axios.get(
//         `${BASE_URL}/master/school-college/search?search=${schoolCollegeSearch}`
//       );

//       const data = res.data?.data || [];
//       setSchoolCollegeOptions(
//         data.map((c) => ({
//           value: c.id,
//           label: c.name,
//         }))
//       );
//     } catch (err) {
//       console.error("School/College search failed", err);
//       setSchoolCollegeOptions([]);
//     } finally {
//       setIsSchoolCollegeLoading(false);
//     }
//   }, 400);

//   return () => clearTimeout(schoolCollegeTimeoutRef.current);
// }, [schoolCollegeSearch]);

// useEffect(() => {
//   if (courseTimeoutRef.current) clearTimeout(courseTimeoutRef.current);

//   if (!courseSearch || courseSearch.length < 3) {
//     setCourseOptions([]);
//     return;
//   }

//   courseTimeoutRef.current = setTimeout(async () => {
//     try {
//       setIsCourseLoading(true);
//       const res = await axios.get(
//         `${BASE_URL}/master/courses/search?search=${courseSearch}`
//       );
//       const data = res.data?.data || [];
//       setCourseOptions(
//         data.map((c) => ({ value: c.id, label: c.name }))
//       );
//     } catch (err) {
//       console.error("Course search failed:", err);
//       setCourseOptions([]);
//     } finally {
//       setIsCourseLoading(false);
//     }
//   }, 400);

//   return () => clearTimeout(courseTimeoutRef.current);
// }, [courseSearch]);


// useEffect(() => {
//   if (specSearch.length < 3) {
//     setSpecOptions([]);
//     return;
//   }

//   const timer = setTimeout(async () => {
//     try {
//       setIsSpecLoading(true);
//       const res = await fetch(
//         `${BASE_URL}/master/specialization/search?search=${specSearch}`
//       );
//       const data = await res.json();

//       setSpecOptions(
//         data?.data?.map((s) => ({
//           value: s.id,
//           label: s.name,
//         })) || []
//       );
//     } catch (err) {
//       console.error("Specialization fetch error", err);
//       setSpecOptions([]);
//     } finally {
//       setIsSpecLoading(false);
//     }
//   }, 400); 

//   return () => clearTimeout(timer);
// }, [specSearch]);

//   return (
//     <div className="space-y-6">
//       {fields.map((field, index) => {
//         const level = watch(`educations.${index}.level`);
//         const schoolCollegeId = watch(`educations.${index}.school_college_id`);
//         const courseId = watch(`educations.${index}.course_id`);

//         // If level not selected yet, only show level selector
//         if (!level) {
//           return (
//             <div
//               key={field.id}
//               className="p-4 border border-gray-200 rounded-lg"
//             >
//               <div className="mb-3">
//                 <Label>Education Level</Label>
//                 <Controller
//                   name={`educations.${index}.level`}
//                   control={control}
//                   render={({ field: { onChange, value } }) => (
//                     // <Select
//                     //   options={EDUCATION_LEVELS}
//                     //   value={
//                     //     EDUCATION_LEVELS.find((opt) => opt.value === value) ||
//                     //     null
//                     //   }
//                     //   onChange={(opt) => {
//                     //     onChange(opt?.value || null);
//                     //     setValue(`educations.${index}.course_id`, null);
//                     //     setValue(`educations.${index}.specialization_id`, null);
//                     //     setValue(
//                     //       `educations.${index}.standard_or_grade`,
//                     //       "Class XII"
//                     //     );
//                     //     clearErrors(`educations.${index}.level`);
//                     //   }}
//                     //   isSearchable={false}
//                     //   placeholder="Select education level..."
//                     //   className="w-full text-sm"
//                     //   classNamePrefix="select"
//                     // />

//                     <ReactSelect
//   options={EDUCATION_LEVELS}
//   value={EDUCATION_LEVELS.find((opt) => opt.value === value) || null}
//   onChange={(opt) => {
//     onChange(opt?.value || null);
//     setValue(`educations.${index}.course_id`, null);
//     setValue(`educations.${index}.specialization_id`, null);
//     setValue(`educations.${index}.standard_or_grade`, "Class XII");
//     clearErrors?.(`educations.${index}.level`);
//   }}
//   isSearchable={false}
//   placeholder="Select education level..."
// />
//                   )}
//                 />
//                 {errors.educations?.[index]?.level && (
//                   <ErrorMessage>
//                     {errors.educations[index].level.message}
//                   </ErrorMessage>
//                 )}
//               </div>

//               {index > 0 && (
//                 <button
//                   type="button"
//                   onClick={() => remove(index)}
//                   className="mt-2 text-sm text-red-600 hover:underline"
//                 >
//                   Remove
//                 </button>
//               )}
//             </div>
//           );
//         }

//         // Compute specializations
//         let specializations = [];
//         if (courseId && level !== "school" && courses) {
//           const course = courses.find((c) => c.id === courseId);
//           if (course) {
//             specializations = getSpecializationsForCourse(course.id) || [];
//           }
//         }

//         return (
//           <div
//             key={field.id}
//             className="relative p-4 border border-gray-200 rounded-lg"
//           >
//             {/* {index > 0 && (
//               <button
//                 type="button"
//                 onClick={() => remove(index)}
//                 className="absolute p-1 text-red-500 rounded top-2 right-2 hover:bg-red-100"
//                 aria-label="Remove education"
//               >
//                 <FaTrash size={14} />
//               </button>
//             )} */}


//             <button
//               type="button"
//               onClick={() => remove(index)}
//               className="absolute p-1 text-red-500 rounded top-2 right-2 hover:bg-red-100"
//               aria-label="Remove education"
//             >
//               <FaTrash size={14} />
//             </button>

//             {/* Level (now read-only after selection)
//             <div className="mb-3">
//               <Label>Education Level</Label>
//               <Controller
//                 name={`educations.${index}.level`}
//                 control={control}
//                 render={({ field: { value } }) => (
//                   <div className="px-3 py-2 text-sm bg-gray-100 border rounded">
//                     {EDUCATION_LEVELS.find(opt => opt.value === value)?.label || value}
//                   </div>
//                 )}
//               />
//             </div> */}

//             {/* Level */}
//             <div className="mb-3">
//               <Label>Education Level</Label>
//               <Controller
//                 name={`educations.${index}.level`}
//                 control={control}
//                 render={({ field: { onChange, value } }) => (
//                   <Select
//                     options={EDUCATION_LEVELS}
//                     value={
//                       EDUCATION_LEVELS.find((opt) => opt.value === value) ||
//                       null
//                     }
//                     onChange={(opt) => {
//                       onChange(opt?.value || null);
//                       setValue(`educations.${index}.course_id`, null);
//                       setValue(`educations.${index}.specialization_id`, null);
//                       setValue(
//                         `educations.${index}.standard_or_grade`,
//                         "Class XII"
//                       );
//                     }}
//                     isSearchable={false}
//                     className="w-full text-sm"
//                     classNamePrefix="select"
//                   />
//                 )}
//               />
//               {errors.educations?.[index]?.level && (
//                 <ErrorMessage>
//                   {errors.educations[index].level.message}
//                 </ErrorMessage>
//               )}
//             </div>

//             {/* Institution */}
//             <div className="mb-3">
//               <Label>Institution</Label>
//               {loading ? (
//                 <Loader message="Loading..." />
//               ) : error ? (
//                 <CustomErrorMessage message={error} />
//               ) : (
//                 <>
//                   <Controller
//   name={`educations.${index}.school_college_id`}
//   control={control}
//   render={({ field: { onChange, value } }) => {
//     const otherInstitutionName =
//       watch(`educations.${index}.other_institution_name`) || "";
//     const isCustom = value == null && otherInstitutionName;

//     const selectedOption = isCustom
//       ? {
//           value: otherInstitutionName,
//           label: otherInstitutionName,
//           __isNew__: true,
//         }
//       : schoolCollegeOptions.find((inst) => inst.value === value) || 
//         (value
//           ? { value: value, label: "Selected Institution" } // fallback if not in current options
//           : null
//         );

//     return (
//       <CreatableSelect
//         options={schoolCollegeOptions}
//         value={selectedOption}
//         onChange={(opt) => {
//           if (!opt) {
//             onChange(null);
//             setValue(`educations.${index}.other_institution_name`, "");
//             return;
//           }

//           if (opt.__isNew__) {
//             onChange(null);
//             setValue(`educations.${index}.other_institution_name`, opt.value);
//           } else {
//             onChange(opt.value);
//             setValue(`educations.${index}.other_institution_name`, "");
//           }
//         }}
//         onInputChange={(inputValue, { action }) => {
//           if (action === "input-change") setSchoolCollegeSearch(inputValue);
//         }}
//         placeholder="Search or type your School/College/University"
//         isClearable
//         isSearchable
//         isLoading={isSchoolCollegeLoading}
//         noOptionsMessage={() =>
//           schoolCollegeSearch.length < 3
//             ? "Type at least 3 characters"
//             : "No institution found"
//         }
//         className="w-full text-sm"
//         classNamePrefix="select"
//       />
//     );
//   }}
// />


//                   <p className="mt-1 text-xs text-gray-500">
//                     If your school/college/university is not listed, please type the full name without abbreviations.
//                   </p>

//                   {/* {watch(`educations.${index}.school_college_id`) === null && (
//                     <Input
//                       placeholder="Enter full institution name (e.g., St. Xavier's College, Mumbai)"
//                       className="mt-2"
//                       {...register(
//                         `educations.${index}.other_institution_name`
//                       )}
//                     />
//                   )} */}
//                 </>
//               )}
//               {errors.educations?.[index]?.school_college_id && (
//                 <ErrorMessage>
//                   {errors.educations[index].school_college_id.message}
//                 </ErrorMessage>
//               )}
//             </div>

//             {/* Conditional Fields */}
//             {level === "school" ? (
//               <div className="mb-3">
//                 <Label>Standard</Label>
//                 <div className="flex flex-wrap gap-2">
//                   {SCHOOL_STANDARDS.map((std) => (
//                     <label
//                       key={std}
//                       className={`px-2 py-1.5 rounded-md border cursor-pointer text-xs ${
//                         watch(`educations.${index}.standard_or_grade`) === std
//                           ? "bg-blue-500 text-white border-blue-500"
//                           : "bg-gray-100 border-gray-300 hover:border-gray-400"
//                       }`}
//                     >
//                       <input
//                         type="radio"
//                         value={std}
//                         {...register(`educations.${index}.standard_or_grade`)}
//                         className="hidden"
//                       />
//                       {std}
//                     </label>
//                   ))}
//                 </div>
//                 {errors.educations?.[index]?.standard_or_grade && (
//                   <ErrorMessage>
//                     {errors.educations[index].standard_or_grade.message}
//                   </ErrorMessage>
//                 )}
//               </div>
//             ) : (
//               <>
//                 <div className="mb-3">
//                   <Label>Course</Label>
//                   {loading ? (
//                     <Loader message="Loading courses..." />
//                   ) : error ? (
//                     <CustomErrorMessage message={error} />
//                   ) : (
//                     <Controller
//   name={`educations.${index}.course_id`}
//   control={control}
//   render={({ field: { onChange, value } }) => {
//     const otherCourseName = watch(`educations.${index}.other_course_name`) || "";
//     const isCustom = value == null && otherCourseName;

//     const selectedOption = isCustom
//       ? { value: otherCourseName, label: otherCourseName, __isNew__: true }
//       : courseOptions.find((c) => c.value === value) ||
//         (value ? { value, label: "Selected Course" } : null);

//     return (
//       <CreatableSelect
//         options={courseOptions}
//         value={selectedOption}
//         onChange={(opt) => {
//           if (!opt) {
//             onChange(null);
//             setValue(`educations.${index}.other_course_name`, "");
//             setValue(`educations.${index}.specialization_id`, null);
//             setValue(`educations.${index}.other_specialization_name`, "");
//             return;
//           }

//           if (opt.__isNew__) {
//             // User typed a new course
//             onChange(null);
//             setValue(`educations.${index}.other_course_name`, opt.value);
//             setValue(`educations.${index}.specialization_id`, null);
//             setValue(`educations.${index}.other_specialization_name`, "");
//           } else {
//             // Selected from API
//             onChange(opt.value);
//             setValue(`educations.${index}.other_course_name`, "");
//             setValue(`educations.${index}.specialization_id`, null);
//             setValue(`educations.${index}.other_specialization_name`, "");
//           }
//         }}
//         onInputChange={(inputValue, { action }) => {
//           if (action === "input-change") setCourseSearch(inputValue);
//         }}
//         placeholder="Search or type your course..."
//         isClearable
//         isSearchable
//         isLoading={isCourseLoading}
//         noOptionsMessage={() =>
//           courseSearch.length < 3
//             ? "Type at least 3 characters"
//             : "No course found"
//         }
//         className="w-full text-sm"
//         classNamePrefix="select"
//       />
//     );
//   }}
// />

//                   )}
//                   {errors.educations?.[index]?.course_id && (
//                     <ErrorMessage>
//                       {errors.educations[index].course_id.message}
//                     </ErrorMessage>
//                   )}
//                   {errors.educations?.[index]?.other_course_name && (
//                     <ErrorMessage>
//                       {errors.educations[index].other_course_name.message}
//                     </ErrorMessage>
//                   )}
//                 </div>

//                 {!["diploma", "other"].includes(level) &&
//                   (courseId ||
//                     watch(`educations.${index}.other_course_name`)) && (
//                     <div className="mb-3">
//                       <Label>Specialization</Label>
//                       <Controller
//                         name={`educations.${index}.specialization_id`}
//                         control={control}
//                         render={({ field: { onChange, value } }) => {
//                           const otherSpecName =
//                             watch(
//                               `educations.${index}.other_specialization_name`
//                             ) || "";
//                           const isCustom = value == null && otherSpecName;
//                           const selectedOption = isCustom
//   ? {
//       value: otherSpecName,
//       label: otherSpecName,
//       __isNew__: true,
//     }
//   : specOptions.find((opt) => opt.value === value) ||
//     (value
//       ? {
//           value,
//           label:
//             specializations.find((s) => s.id === value)?.name || "",
//         }
//       : null);


//   const finalSpecOptions = React.useMemo(() => {
//   if (selectedOption && !selectedOption.__isNew__) {
//     const exists = specOptions.some(
//       (opt) => opt.value === selectedOption.value
//     );
//     if (!exists) {
//       return [selectedOption, ...specOptions];
//     }
//   }
//   return specOptions;
// }, [specOptions, selectedOption]);


//                           return (
//                        <CreatableSelect
//   value={selectedOption}
//   options={finalSpecOptions}   // 👈 THIS IS THE KEY
//   isLoading={isSpecLoading}
//   isClearable
//   isSearchable
//   placeholder="Type at least 3 characters"

//   onInputChange={(inputValue, { action }) => {
//     if (action === "input-change") {
//       setSpecSearch(inputValue);
//     }
//   }}

// onChange={(opt) => {
//   if (!opt) {
//     onChange(null);
//     setValue(`educations.${index}.other_specialization_name`, "");
//     return;
//   }

//   if (opt.__isNew__) {
//     onChange(null);
//     setValue(
//       `educations.${index}.other_specialization_name`,
//       opt.value   // 🔥 label nahi, value
//     );
//   } else {
//     onChange(opt.value);
//     setValue(`educations.${index}.other_specialization_name`, "");
//   }
// }}


//   noOptionsMessage={() =>
//     specSearch.length < 3
//       ? "Type at least 3 characters"
//       : "No specialization found"
//   }

//   isDisabled={
//     !courseId &&
//     !watch(`educations.${index}.other_course_name`)
//   }
// />



//                           );
//                         }}
//                       />
//                       {errors.educations?.[index]?.specialization_id && (
//                         <ErrorMessage>
//                           {errors.educations[index].specialization_id.message}
//                         </ErrorMessage>
//                       )}
//                       {errors.educations?.[index]
//                         ?.other_specialization_name && (
//                         <ErrorMessage>
//                           {
//                             errors.educations[index].other_specialization_name
//                               .message
//                           }
//                         </ErrorMessage>
//                       )}
//                     </div>
//                   )}
//               </>
//             )}

//             {/* Dates */}
//             <div className="grid grid-cols-1 gap-3 mb-3 sm:grid-cols-2">
//               <div>
//                 <Label>Start Date</Label>
//                 <Input
//                   type="month"
//                   {...register(`educations.${index}.start_date`)}
//                 />
//                 {errors.educations?.[index]?.start_date && (
//                   <ErrorMessage>
//                     {errors.educations[index].start_date.message}
//                   </ErrorMessage>
//                 )}
//               </div>
//               <div>
//                 <Label>End Date</Label>
//                 <Input
//                   type="month"
//                   {...register(`educations.${index}.end_date`)}
//                 />
//                 {errors.educations?.[index]?.end_date && (
//                   <ErrorMessage>
//                     {errors.educations[index].end_date.message}
//                   </ErrorMessage>
//                 )}
//               </div>
//             </div>

//             {/* Certificate Upload */}
//             {/* <div className="mb-3">
//               <Label>Certificate (Optional)</Label>
//               <div className="flex items-center gap-2">
//                 <input
//                   type="file"
//                   accept="image/*,.pdf"
//                   onChange={async (e) => {
//                     const file = e.target.files?.[0];
//                     if (!file) return;
//                     const url = await uploadImage(file, "certificateImage");
//                     if (url) {
//                       setValue(
//                         `educations.${index}.education_certificate`,
//                         url
//                       );
//                     }
//                     e.target.value = "";
//                   }}
//                   className="hidden"
//                   id={`cert-upload-${field.id}`}
//                 />
//                 <label
//                   htmlFor={`cert-upload-${field.id}`}
//                   className={`px-3 py-1.5 text-sm text-white rounded cursor-pointer ${
//                     uploadLoading
//                       ? "bg-gray-400 cursor-not-allowed"
//                       : "bg-blue-600 hover:bg-blue-700"
//                   }`}
//                 >
//                   {uploadLoading ? "Uploading..." : "Upload Certificate"}
//                 </label>

//                 {watch(`educations.${index}.education_certificate`) && (
//                   <span className="text-sm text-gray-600 truncate max-w-[200px]">
//                     {watch(`educations.${index}.education_certificate`)
//                       .split("/")
//                       .pop() || "Uploaded"}
//                   </span>
//                 )}
//               </div>

//               {errors.educations?.[index]?.education_certificate && (
//                 <ErrorMessage>
//                   {errors.educations[index].education_certificate.message}
//                 </ErrorMessage>
//               )}
//             </div> */}


//             {/* Certificate Upload */}
//             <div className="mb-3">
//               <Label>Certificate (Optional)</Label>
//               <div className="flex flex-wrap items-center gap-3">
//                 <input
//                   type="file"
//                   accept="image/*,.pdf"
//                   onChange={async (e) => {
//                     const file = e.target.files?.[0];
//                     if (!file) return;
//                     const url = await uploadImage(file, "certificateImage");
//                     if (url) {
//                       setValue(`educations.${index}.education_certificate`, url);
//                     }
//                     e.target.value = "";
//                   }}
//                   className="hidden"
//                   id={`cert-upload-${field.id}`}
//                 />
//                 <label
//                   htmlFor={`cert-upload-${field.id}`}
//                   className={`inline-flex items-center px-3 py-1.5 text-sm font-medium text-white rounded shadow-sm cursor-pointer ${uploadLoading
//                       ? "bg-gray-400 cursor-not-allowed"
//                       : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     }`}
//                 >
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="w-4 h-4 mr-1"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
//                     />
//                   </svg>
//                   {uploadLoading ? "Uploading..." : "Upload"}
//                 </label>

//                 {watch(`educations.${index}.education_certificate`) && (
//                   <div className="flex items-center gap-1.5 px-2 py-1 text-xs bg-green-50 text-green-700 rounded">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="w-3.5 h-3.5"
//                       viewBox="0 0 20 20"
//                       fill="currentColor"
//                     >
//                       <path
//                         fillRule="evenodd"
//                         d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                         clipRule="evenodd"
//                       />
//                     </svg>
//                     Uploaded
//                   </div>
//                 )}
//               </div>
//               {errors.educations?.[index]?.education_certificate && (
//                 <ErrorMessage>
//                   {errors.educations[index].education_certificate.message}
//                 </ErrorMessage>
//               )}
//             </div>
//           </div>
//         );
//       })}

//       <div className="flex justify-center">
//         {/* <button
//           type="button"
//           onClick={handleAdd}
//           className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         >
//           + Add Education
//         </button> */}
//         <AddButton onClick={handleAdd}>+ Add Education</AddButton>
//       </div>
//     </div>
//   );
// }









// import React from "react";
// import { useFieldArray, useFormContext, Controller } from "react-hook-form";
// import axios from "axios";
// import { useRef, useState, useEffect } from "react";

// import Select from "react-select";
// import CreatableSelect from "react-select/creatable";
// import { FaTrash } from "react-icons/fa";
// import { useMasterData } from "../../../hooks/master/useMasterData";
// import { Loader, Input, Label, ErrorMessage } from "../../../components/ui";
// import CreatableField from "../../../components/ui/CreatableField";
// import AddButton from "../../../components/StudentPannel/AddButton";
// import FileUploadButton from "../../../components/StudentPannel/FileUploadButton";
// import RadioGroup from "../../../components/StudentPannel/RadioGroup";
// import CreateableSelect from "../../../components/StudentPannel/CreatableSelect";
// import ReactSelect from "../../../components/StudentPannel/ReactSelect";

// import useUploadImageApi from "../../../hooks/useUploadImageApi";

// const BASE_URL = import.meta.env.VITE_BASE_URL;

// // const EDUCATION_LEVELS = [
// //   { value: "school", label: "School (up to Class XII)" },
// //   { value: "bachelors", label: "Bachelor’s Degree" },
// //   { value: "masters", label: "Master’s Degree" },
// // ];

// const EDUCATION_LEVELS = [
//   { value: "school", label: "School (up to Class XII)" },
//   { value: "diploma", label: "Diploma" },
//   { value: "bachelors", label: "Bachelor’s Degree" },
//   { value: "masters", label: "Master’s Degree" },
//   { value: "phd", label: "PhD / Doctorate" },
// ].sort((a, b) => a.label.localeCompare(b.label));

// const SCHOOL_STANDARDS = ["Class X or below", "Class XI", "Class XII"];

// const OTHER_OPTION = { id: "other", name: "Other (not listed)" };

// export default function EducationInfo() {
//   const {
//     control,
//     watch,
//     register,
//     formState: { errors },
//     setValue,
//     clearErrors,
//   } = useFormContext();

//   const { fields, append, remove } = useFieldArray({
//     control,
//     name: "educations",
//   });

//   const {
//     courses,
//     schoolColleges,
//     loading,
//     error,
//     refetch,
//     getSpecializationsForCourse,
//   } = useMasterData();

//   const { uploadImage, loading: uploadLoading } = useUploadImageApi();

//   const CustomErrorMessage = ({ message }) => (
//     <div className="w-full p-3 text-xs text-red-500 border rounded bg-red-50">
//       <div className="flex items-center justify-between">
//         <span>{message}</span>
//         <button
//           onClick={refetch}
//           className="px-2 py-1 ml-2 text-xs text-white bg-red-500 rounded hover:bg-red-600"
//         >
//           Retry
//         </button>
//       </div>
//     </div>
//   );

//   const handleAdd = () => {
//     append({
//       level: null,
//       school_college_id: null,
//       standard_or_grade: "Class XII",
//       course_id: null,
//       other_course_name: "",
//       specialization_id: null,
//       other_specialization_name: "",
//       start_date: "",
//       end_date: "",
//       education_certificate: "",
//     });
//   };

//   React.useEffect(() => {
//     if (fields.length === 0) {
//       append({
//         level: null,
//         school_college_id: null,
//         standard_or_grade: "Class XII",
//         course_id: null,
//         other_course_name: "",
//         specialization_id: null,
//         other_specialization_name: "",
//         start_date: "",
//         end_date: "",
//         education_certificate: "",
//       });
//     }
//   }, [fields.length, append]);

//   const institutionOptions = React.useMemo(() => {
//     return schoolColleges ? [OTHER_OPTION, ...schoolColleges] : [OTHER_OPTION];
//   }, [schoolColleges]);

//   const [schoolCollegeOptions, setSchoolCollegeOptions] = useState([]);
//   const [schoolCollegeSearch, setSchoolCollegeSearch] = useState("");
//   const [isSchoolCollegeLoading, setIsSchoolCollegeLoading] = useState(false);
//   const schoolCollegeTimeoutRef = useRef(null);

//   const [specSearch, setSpecSearch] = useState("");
//   const [specOptions, setSpecOptions] = useState([]);
//   const [isSpecLoading, setIsSpecLoading] = useState(false);

//   const [courseOptions, setCourseOptions] = useState([]);
//   const [courseSearch, setCourseSearch] = useState("");
//   const [isCourseLoading, setIsCourseLoading] = useState(false);
//   const courseTimeoutRef = useRef(null);

//   useEffect(() => {
//     if (schoolCollegeTimeoutRef.current)
//       clearTimeout(schoolCollegeTimeoutRef.current);

//     if (!schoolCollegeSearch || schoolCollegeSearch.length < 3) {
//       setSchoolCollegeOptions([]);
//       return;
//     }

//     schoolCollegeTimeoutRef.current = setTimeout(async () => {
//       try {
//         setIsSchoolCollegeLoading(true);
//         const res = await axios.get(
//           `${BASE_URL}/master/school-college/search?search=${schoolCollegeSearch}`
//         );

//         const data = res.data?.data || [];
//         setSchoolCollegeOptions(
//           data.map((c) => ({
//             value: c.id,
//             label: c.name,
//           }))
//         );
//       } catch (err) {
//         console.error("School/College search failed", err);
//         setSchoolCollegeOptions([]);
//       } finally {
//         setIsSchoolCollegeLoading(false);
//       }
//     }, 400);

//     return () => clearTimeout(schoolCollegeTimeoutRef.current);
//   }, [schoolCollegeSearch]);

//   useEffect(() => {
//     if (courseTimeoutRef.current) clearTimeout(courseTimeoutRef.current);

//     if (!courseSearch || courseSearch.length < 3) {
//       setCourseOptions([]);
//       return;
//     }

//     courseTimeoutRef.current = setTimeout(async () => {
//       try {
//         setIsCourseLoading(true);
//         const res = await axios.get(
//           `${BASE_URL}/master/courses/search?search=${courseSearch}`
//         );
//         const data = res.data?.data || [];
//         setCourseOptions(data.map((c) => ({ value: c.id, label: c.name })));
//       } catch (err) {
//         console.error("Course search failed:", err);
//         setCourseOptions([]);
//       } finally {
//         setIsCourseLoading(false);
//       }
//     }, 400);

//     return () => clearTimeout(courseTimeoutRef.current);
//   }, [courseSearch]);

//   useEffect(() => {
//     if (specSearch.length < 3) {
//       setSpecOptions([]);
//       return;
//     }

//     const timer = setTimeout(async () => {
//       try {
//         setIsSpecLoading(true);
//         const res = await fetch(
//           `${BASE_URL}/master/specialization/search?search=${specSearch}`
//         );
//         const data = await res.json();

//         setSpecOptions(
//           data?.data?.map((s) => ({
//             value: s.id,
//             label: s.name,
//           })) || []
//         );
//       } catch (err) {
//         console.error("Specialization fetch error", err);
//         setSpecOptions([]);
//       } finally {
//         setIsSpecLoading(false);
//       }
//     }, 400);

//     return () => clearTimeout(timer);
//   }, [specSearch]);

//   return (
//     <div className="space-y-6">
//       {fields.map((field, index) => {
//         const level = watch(`educations.${index}.level`);
//         const schoolCollegeId = watch(`educations.${index}.school_college_id`);
//         const courseId = watch(`educations.${index}.course_id`);

//         if (!level) {
//           return (
//             <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
//               <div className="mb-3">
//                 <Label>Education Level</Label>
//                 <Controller
//                   name={`educations.${index}.level`}
//                   control={control}
//                   render={({ field: { onChange, value } }) => (
//                     <ReactSelect
//                       options={EDUCATION_LEVELS}
//                       value={
//                         EDUCATION_LEVELS.find((opt) => opt.value === value) ||
//                         null
//                       }
//                       onChange={(opt) => {
//                         onChange(opt?.value || null);
//                         setValue(`educations.${index}.course_id`, null);
//                         setValue(`educations.${index}.specialization_id`, null);
//                         setValue(
//                           `educations.${index}.standard_or_grade`,
//                           "Class XII"
//                         );
//                         clearErrors?.(`educations.${index}.level`);
//                       }}
//                       isSearchable={false}
//                       placeholder="Select education level..."
//                     />
//                   )}
//                 />
//                 {errors.educations?.[index]?.level && (
//                   <ErrorMessage>{errors.educations[index].level.message}</ErrorMessage>
//                 )}
//               </div>

//               {index > 0 && (
//                 <button
//                   type="button"
//                   onClick={() => remove(index)}
//                   className="mt-2 text-sm text-red-600 hover:underline"
//                 >
//                   Remove
//                 </button>
//               )}
//             </div>
//           );
//         }

//         let specializations = [];
//         if (courseId && level !== "school" && courses) {
//           const course = courses.find((c) => c.id === courseId);
//           if (course) {
//             specializations = getSpecializationsForCourse(course.id) || [];
//           }
//         }

//         return (
//           <div
//             key={field.id}
//             className="relative p-4 border border-gray-200 rounded-lg"
//           >
//             <button
//               type="button"
//               onClick={() => remove(index)}
//               className="absolute p-1 text-red-500 rounded top-2 right-2 hover:bg-red-100"
//               aria-label="Remove education"
//             >
//               <FaTrash size={14} />
//             </button>

//             <div className="mb-3">
//               <Label>Education Level</Label>
//               <Controller
//                 name={`educations.${index}.level`}
//                 control={control}
//                 render={({ field: { onChange, value } }) => (
//                   <ReactSelect
//                     options={EDUCATION_LEVELS}
//                     value={
//                       EDUCATION_LEVELS.find((opt) => opt.value === value) ||
//                       null
//                     }
//                     onChange={(opt) => {
//                       onChange(opt?.value || null);
//                       setValue(`educations.${index}.course_id`, null);
//                       setValue(`educations.${index}.specialization_id`, null);
//                       setValue(
//                         `educations.${index}.standard_or_grade`,
//                         "Class XII"
//                       );
//                     }}
//                     isSearchable={false}
//                     placeholder="Select education level..."
//                   />
//                 )}
//               />
//               {errors.educations?.[index]?.level && (
//                 <ErrorMessage>{errors.educations[index].level.message}</ErrorMessage>
//               )}
//             </div>

//             <div className="mb-3">
//               <Label>Institution</Label>
//               {loading ? (
//                 <Loader message="Loading..." />
//               ) : error ? (
//                 <CustomErrorMessage message={error} />
//               ) : (
//                 <>
//                   <Controller
//                     name={`educations.${index}.school_college_id`}
//                     control={control}
//                     render={({ field: { onChange, value } }) => {
//                       const otherInstitutionName =
//                         watch(`educations.${index}.other_institution_name`) ||
//                         "";
//                       const isCustom = value == null && otherInstitutionName;

//                       const selectedOption = isCustom
//                         ? {
//                             value: otherInstitutionName,
//                             label: otherInstitutionName,
//                             __isNew__: true,
//                           }
//                         : schoolCollegeOptions.find((inst) => inst.value === value) ||
//                           (value
//                             ? { value: value, label: "Selected Institution" }
//                             : null);

//                       return (
//                         <CreateableSelect
//                           options={schoolCollegeOptions}
//                           value={selectedOption}
//                           onChange={(opt) => {
//                             if (!opt) {
//                               onChange(null);
//                               setValue(
//                                 `educations.${index}.other_institution_name`,
//                                 ""
//                               );
//                               return;
//                             }

//                             if (opt.__isNew__) {
//                               onChange(null);
//                               setValue(
//                                 `educations.${index}.other_institution_name`,
//                                 opt.value
//                               );
//                             } else {
//                               onChange(opt.value);
//                               setValue(
//                                 `educations.${index}.other_institution_name`,
//                                 ""
//                               );
//                             }
//                           }}
//                           onInputChange={(inputValue, meta) => {
//                             if (meta?.action === "input-change")
//                               setSchoolCollegeSearch(inputValue);
//                           }}
//                           placeholder="Search or type your School/College/University"
//                           isClearable
//                           isSearchable
//                           isLoading={isSchoolCollegeLoading}
//                           noOptionsMessage={() =>
//                             schoolCollegeSearch.length < 3
//                               ? "Type at least 3 characters"
//                               : "No institution found"
//                           }
//                         />
//                       );
//                     }}
//                   />

//                   <p className="mt-1 text-xs text-gray-500">
//                     If your school/college/university is not listed, please type
//                     the full name without abbreviations.
//                   </p>
//                 </>
//               )}

//               {errors.educations?.[index]?.school_college_id && (
//                 <ErrorMessage>
//                   {errors.educations[index].school_college_id.message}
//                 </ErrorMessage>
//               )}
//             </div>

//             {level === "school" ? (
//               <div className="mb-3">
//                 <Label>Standard</Label>

//                 <RadioGroup
//                   options={SCHOOL_STANDARDS}
//                   value={watch(`educations.${index}.standard_or_grade`)}
//                   onChange={(val) =>
//                     setValue(`educations.${index}.standard_or_grade`, val, {
//                       shouldValidate: true,
//                     })
//                   }
//                 />

//                 {errors.educations?.[index]?.standard_or_grade && (
//                   <ErrorMessage>
//                     {errors.educations[index].standard_or_grade.message}
//                   </ErrorMessage>
//                 )}
//               </div>
//             ) : (
//               <>
//                 <div className="mb-3">
//                   <Label>Course</Label>
//                   {loading ? (
//                     <Loader message="Loading courses..." />
//                   ) : error ? (
//                     <CustomErrorMessage message={error} />
//                   ) : (
//                     <Controller
//                       name={`educations.${index}.course_id`}
//                       control={control}
//                       render={({ field: { onChange, value } }) => {
//                         const otherCourseName =
//                           watch(`educations.${index}.other_course_name`) || "";
//                         const isCustom = value == null && otherCourseName;

//                         const selectedOption = isCustom
//                           ? {
//                               value: otherCourseName,
//                               label: otherCourseName,
//                               __isNew__: true,
//                             }
//                           : courseOptions.find((c) => c.value === value) ||
//                             (value ? { value, label: "Selected Course" } : null);

//                         return (
//                           <CreateableSelect
//                             options={courseOptions}
//                             value={selectedOption}
//                             onChange={(opt) => {
//                               if (!opt) {
//                                 onChange(null);
//                                 setValue(
//                                   `educations.${index}.other_course_name`,
//                                   ""
//                                 );
//                                 setValue(
//                                   `educations.${index}.specialization_id`,
//                                   null
//                                 );
//                                 setValue(
//                                   `educations.${index}.other_specialization_name`,
//                                   ""
//                                 );
//                                 return;
//                               }

//                               if (opt.__isNew__) {
//                                 onChange(null);
//                                 setValue(
//                                   `educations.${index}.other_course_name`,
//                                   opt.value
//                                 );
//                                 setValue(
//                                   `educations.${index}.specialization_id`,
//                                   null
//                                 );
//                                 setValue(
//                                   `educations.${index}.other_specialization_name`,
//                                   ""
//                                 );
//                               } else {
//                                 onChange(opt.value);
//                                 setValue(
//                                   `educations.${index}.other_course_name`,
//                                   ""
//                                 );
//                                 setValue(
//                                   `educations.${index}.specialization_id`,
//                                   null
//                                 );
//                                 setValue(
//                                   `educations.${index}.other_specialization_name`,
//                                   ""
//                                 );
//                               }
//                             }}
//                             onInputChange={(inputValue, meta) => {
//                               if (meta?.action === "input-change")
//                                 setCourseSearch(inputValue);
//                             }}
//                             placeholder="Search or type your course..."
//                             isClearable
//                             isSearchable
//                             isLoading={isCourseLoading}
//                             noOptionsMessage={() =>
//                               courseSearch.length < 3
//                                 ? "Type at least 3 characters"
//                                 : "No course found"
//                             }
//                           />
//                         );
//                       }}
//                     />
//                   )}

//                   {errors.educations?.[index]?.course_id && (
//                     <ErrorMessage>
//                       {errors.educations[index].course_id.message}
//                     </ErrorMessage>
//                   )}
//                   {errors.educations?.[index]?.other_course_name && (
//                     <ErrorMessage>
//                       {errors.educations[index].other_course_name.message}
//                     </ErrorMessage>
//                   )}
//                 </div>

//                 {!["diploma", "other"].includes(level) &&
//                   (courseId || watch(`educations.${index}.other_course_name`)) && (
//                     <div className="mb-3">
//                       <Label>Specialization</Label>

//                       <Controller
//                         name={`educations.${index}.specialization_id`}
//                         control={control}
//                         render={({ field: { onChange, value } }) => {
//                           const otherSpecName =
//                             watch(
//                               `educations.${index}.other_specialization_name`
//                             ) || "";
//                           const isCustom = value == null && otherSpecName;

//                           const selectedOption = isCustom
//                             ? {
//                                 value: otherSpecName,
//                                 label: otherSpecName,
//                                 __isNew__: true,
//                               }
//                             : specOptions.find((opt) => opt.value === value) ||
//                               (value
//                                 ? {
//                                     value,
//                                     label:
//                                       specializations.find((s) => s.id === value)
//                                         ?.name || "",
//                                   }
//                                 : null);

//                           const finalSpecOptions = React.useMemo(() => {
//                             if (selectedOption && !selectedOption.__isNew__) {
//                               const exists = specOptions.some(
//                                 (opt) => opt.value === selectedOption.value
//                               );
//                               if (!exists) return [selectedOption, ...specOptions];
//                             }
//                             return specOptions;
//                           }, [specOptions, selectedOption]);

//                           return (
//                             <CreateableSelect
//                               value={selectedOption}
//                               options={finalSpecOptions}
//                               isLoading={isSpecLoading}
//                               isClearable
//                               isSearchable
//                               placeholder="Type at least 3 characters"
//                               onInputChange={(inputValue, meta) => {
//                                 if (meta?.action === "input-change")
//                                   setSpecSearch(inputValue);
//                               }}
//                               onChange={(opt) => {
//                                 if (!opt) {
//                                   onChange(null);
//                                   setValue(
//                                     `educations.${index}.other_specialization_name`,
//                                     ""
//                                   );
//                                   return;
//                                 }

//                                 if (opt.__isNew__) {
//                                   onChange(null);
//                                   setValue(
//                                     `educations.${index}.other_specialization_name`,
//                                     opt.value
//                                   );
//                                 } else {
//                                   onChange(opt.value);
//                                   setValue(
//                                     `educations.${index}.other_specialization_name`,
//                                     ""
//                                   );
//                                 }
//                               }}
//                               noOptionsMessage={() =>
//                                 specSearch.length < 3
//                                   ? "Type at least 3 characters"
//                                   : "No specialization found"
//                               }
//                               isDisabled={
//                                 !courseId &&
//                                 !watch(`educations.${index}.other_course_name`)
//                               }
//                             />
//                           );
//                         }}
//                       />

//                       {errors.educations?.[index]?.specialization_id && (
//                         <ErrorMessage>
//                           {errors.educations[index].specialization_id.message}
//                         </ErrorMessage>
//                       )}
//                       {errors.educations?.[index]?.other_specialization_name && (
//                         <ErrorMessage>
//                           {
//                             errors.educations[index].other_specialization_name
//                               .message
//                           }
//                         </ErrorMessage>
//                       )}
//                     </div>
//                   )}
//               </>
//             )}

//             <div className="grid grid-cols-1 gap-3 mb-3 sm:grid-cols-2">
//               <div>
//                 <Label>Start Date</Label>
//                 <Input type="month" {...register(`educations.${index}.start_date`)} />
//                 {errors.educations?.[index]?.start_date && (
//                   <ErrorMessage>
//                     {errors.educations[index].start_date.message}
//                   </ErrorMessage>
//                 )}
//               </div>

//               <div>
//                 <Label>End Date</Label>
//                 <Input type="month" {...register(`educations.${index}.end_date`)} />
//                 {errors.educations?.[index]?.end_date && (
//                   <ErrorMessage>
//                     {errors.educations[index].end_date.message}
//                   </ErrorMessage>
//                 )}
//               </div>
//             </div>

//             <div className="mb-3">
//               <Label>Certificate (Optional)</Label>
//               <div className="flex flex-wrap items-center gap-3">
//                 <input
//                   type="file"
//                   accept="image/*,.pdf"
//                   onChange={async (e) => {
//                     const file = e.target.files?.[0];
//                     if (!file) return;
//                     const url = await uploadImage(file, "certificateImage");
//                     if (url) {
//                       setValue(`educations.${index}.education_certificate`, url);
//                     }
//                     e.target.value = "";
//                   }}
//                   className="hidden"
//                   id={`cert-upload-${field.id}`}
//                 />

//                 <FileUploadButton
//                   htmlFor={`cert-upload-${field.id}`}
//                   loading={uploadLoading}
//                 >
//                   {uploadLoading ? "Uploading..." : "Upload"}
//                 </FileUploadButton>

//                 {watch(`educations.${index}.education_certificate`) && (
//                   <div className="flex items-center gap-1.5 px-2 py-1 text-xs bg-green-50 text-green-700 rounded">
//                     <svg
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="w-3.5 h-3.5"
//                       viewBox="0 0 20 20"
//                       fill="currentColor"
//                     >
//                       <path
//                         fillRule="evenodd"
//                         d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                         clipRule="evenodd"
//                       />
//                     </svg>
//                     Uploaded
//                   </div>
//                 )}
//               </div>

//               {errors.educations?.[index]?.education_certificate && (
//                 <ErrorMessage>
//                   {errors.educations[index].education_certificate.message}
//                 </ErrorMessage>
//               )}
//             </div>
//           </div>
//         );
//       })}

//       <div className="flex justify-center">
//         <AddButton onClick={handleAdd}>+ Add Education</AddButton>
//       </div>
//     </div>
//   );
// }











import React from "react";
import { useFieldArray, useFormContext, Controller } from "react-hook-form";
import axios from "axios";
import { useRef, useState, useEffect } from "react";

import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { FaTrash } from "react-icons/fa";
import { useMasterData } from "../../../hooks/master/useMasterData";
import { Loader, Input, Label, ErrorMessage } from "../../../components/ui";
import CreatableField from "../../../components/ui/CreatableField";
import AddButton from "../../../components/StudentPannel/AddButton";
import FileUploadButton from "../../../components/StudentPannel/FileUploadButton";
import RadioGroup from "../../../components/StudentPannel/RadioGroup";
import CreateableSelect from "../../../components/StudentPannel/CreatableSelect";
import ReactSelect from "../../../components/StudentPannel/ReactSelect";

import useUploadImageApi from "../../../hooks/useUploadImageApi";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const EDUCATION_LEVELS = [
  { value: "school", label: "School (up to Class XII)" },
  { value: "diploma", label: "Diploma" },
  { value: "bachelors", label: "Bachelor’s Degree" },
  { value: "masters", label: "Master’s Degree" },
  { value: "phd", label: "PhD / Doctorate" },
];

const SCHOOL_STANDARDS = ["Class X or below", "Class XI", "Class XII"];

const OTHER_OPTION = { id: "other", name: "Other (not listed)" };

export default function EducationInfo() {
  const {
    control,
    watch,
    register,
    formState: { errors },
    setValue,
    clearErrors,
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "educations",
  });

  const {
    courses,
    schoolColleges,
    loading,
    error,
    refetch,
    getSpecializationsForCourse,
  } = useMasterData();

  const { uploadImage, loading: uploadLoading } = useUploadImageApi();

  const CustomErrorMessage = ({ message }) => (
    <div className="w-full p-3 text-xs text-red-500 border rounded bg-red-50">
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button
          onClick={refetch}
          className="px-2 py-1 ml-2 text-xs text-white bg-red-500 rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    </div>
  );

  const handleAdd = () => {
    append({
      flevel: null,
      school_college_id: null,
      standard_or_grade: "Class XII",
      course_id: null,
      other_course_name: "",
      specialization_id: null,
      other_specialization_name: "",
      start_date: "",
      end_date: "",
      education_certificate: "",
    });
  };

  React.useEffect(() => {
    if (fields.length === 0) {
      handleAdd();
    }
  }, [fields.length, append]);

  const institutionOptions = React.useMemo(() => {
    return schoolColleges ? [OTHER_OPTION, ...schoolColleges] : [OTHER_OPTION];
  }, [schoolColleges]);

  // --- Mapped Options for Course (New Logic) ---
  const mappedCourseOptions = React.useMemo(() => {
    if (!courses) return [];
    return courses.map((c) => ({ value: c.id, label: c.name }));
  }, [courses]);

  const [schoolCollegeOptions, setSchoolCollegeOptions] = useState([]);
  const [schoolCollegeSearch, setSchoolCollegeSearch] = useState("");
  const [isSchoolCollegeLoading, setIsSchoolCollegeLoading] = useState(false);
  const schoolCollegeTimeoutRef = useRef(null);

  const [specSearch, setSpecSearch] = useState("");
  const [specOptions, setSpecOptions] = useState([]);
  const [isSpecLoading, setIsSpecLoading] = useState(false);

  // NOTE: All courseSearch and isCourseLoading states have been removed from here.

  useEffect(() => {
    if (schoolCollegeTimeoutRef.current)
      clearTimeout(schoolCollegeTimeoutRef.current);

    // if (!schoolCollegeSearch || schoolCollegeSearch.length < 3) {
    //   setSchoolCollegeOptions([]);
    //   return;
    // }

    schoolCollegeTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSchoolCollegeLoading(true);
        const res = await axios.get(
          `${BASE_URL}/master/school-college/search?search=${schoolCollegeSearch}`
        );

        const data = res.data?.data || [];
        setSchoolCollegeOptions(
          data.map((c) => ({
            value: c.id,
            label: c.name,
          }))
        );
      } catch (err) {
        console.error("School/College search failed", err);
        setSchoolCollegeOptions([]);
      } finally {
        setIsSchoolCollegeLoading(false);
      }
    }, 400);

    return () => clearTimeout(schoolCollegeTimeoutRef.current);
  }, [schoolCollegeSearch]);

  // NOTE: The entire courseSearch useEffect has been deleted from here.

  useEffect(() => {
    // if (specSearch.length < 3) {
    //   setSpecOptions([]);
    //   return;
    // }

    const timer = setTimeout(async () => {
      try {
        setIsSpecLoading(true);
        const res = await fetch(
          `${BASE_URL}/master/specialization/search?search=${specSearch}`
        );
        const data = await res.json();

        setSpecOptions(
          data?.data?.map((s) => ({
            value: s.id,
            label: s.name,
          })) || []
        );
      } catch (err) {
        console.error("Specialization fetch error", err);
        setSpecOptions([]);
      } finally {
        setIsSpecLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [specSearch]);

  return (
    <div className="space-y-6">
      {fields.map((field, index) => {
        const level = watch(`educations.${index}.level`);
        const schoolCollegeId = watch(`educations.${index}.school_college_id`);
        const courseId = watch(`educations.${index}.course_id`);

        if (!level) {
          return (
            <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="mb-3">
                <Label>Education Level</Label>
                <Controller
                  name={`educations.${index}.level`}
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <ReactSelect
                      options={EDUCATION_LEVELS}
                      value={
                        EDUCATION_LEVELS.find((opt) => opt.value === value) ||
                        null
                      }
                      onChange={(opt) => {
                        onChange(opt?.value || null);
                        setValue(`educations.${index}.course_id`, null);
                        setValue(`educations.${index}.specialization_id`, null);
                        setValue(
                          `educations.${index}.standard_or_grade`,
                          "Class XII"
                        );
                        clearErrors?.(`educations.${index}.level`);
                      }}
                      isSearchable={false}
                      placeholder="Select education level..."
                    />
                  )}
                />
                {errors.educations?.[index]?.level && (
                  <ErrorMessage>{errors.educations[index].level.message}</ErrorMessage>
                )}
              </div>

              {index > 0 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="mt-2 text-sm text-red-600 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>
          );
        }

        let specializations = [];
        if (courseId && level !== "school" && courses) {
          const course = courses.find((c) => c.id === courseId);
          if (course) {
            specializations = getSpecializationsForCourse(course.id) || [];
          }
        }

        return (
          <div
            key={field.id}
            className="relative p-4 border border-gray-200 rounded-lg"
          >
            <button
              type="button"
              onClick={() => remove(index)}
              className="absolute p-1 text-red-500 rounded top-2 right-2 hover:bg-red-100"
              aria-label="Remove education"
            >
              <FaTrash size={14} />
            </button>

            <div className="mb-3">
              <Label>Education Level</Label>
              <Controller
                name={`educations.${index}.level`}
                control={control}
                render={({ field: { onChange, value } }) => (
                  <ReactSelect
                    options={EDUCATION_LEVELS}
                    value={
                      EDUCATION_LEVELS.find((opt) => opt.value === value) ||
                      null
                    }
                    onChange={(opt) => {
                      onChange(opt?.value || null);
                      setValue(`educations.${index}.course_id`, null);
                      setValue(`educations.${index}.specialization_id`, null);
                      setValue(
                        `educations.${index}.standard_or_grade`,
                        "Class XII"
                      );
                    }}
                    isSearchable={false}
                    placeholder="Select education level..."
                  />
                )}
              />
              {errors.educations?.[index]?.level && (
                <ErrorMessage>{errors.educations[index].level.message}</ErrorMessage>
              )}
            </div>

            <div className="mb-3">
              <Label>Institution</Label>
              {loading ? (
                <Loader message="Loading..." />
              ) : error ? (
                <CustomErrorMessage message={error} />
              ) : (
                <>
                  <Controller
                    name={`educations.${index}.school_college_id`}
                    control={control}
                    render={({ field: { onChange, value } }) => {
                      const otherInstitutionName =
                        watch(`educations.${index}.other_institution_name`) ||
                        "";
                      const isCustom = value == null && otherInstitutionName;

                      const selectedOption = isCustom
                        ? {
                            value: otherInstitutionName,
                            label: otherInstitutionName,
                            __isNew__: true,
                          }
                        : schoolCollegeOptions.find((inst) => inst.value === value) ||
                          (value
                            ? { value: value, label: "Selected Institution" }
                            : null);

                      return (
                        <CreateableSelect
                          options={schoolCollegeOptions}
                          value={selectedOption}
                          onChange={(opt) => {
                            if (!opt) {
                              onChange(null);
                              setValue(
                                `educations.${index}.other_institution_name`,
                                ""
                              );
                              return;
                            }

                            if (opt.__isNew__) {
                              onChange(null);
                              setValue(
                                `educations.${index}.other_institution_name`,
                                opt.value
                              );
                            } else {
                              onChange(opt.value);
                              setValue(
                                `educations.${index}.other_institution_name`,
                                ""
                              );
                            }
                          }}
                          onInputChange={(inputValue, meta) => {
                            if (meta?.action === "input-change")
                              setSchoolCollegeSearch(inputValue);
                          }}
                          placeholder="Search or type your School/College/University"
                          isClearable
                          isSearchable
                          isLoading={isSchoolCollegeLoading}
                          // noOptionsMessage={() =>
                          //   schoolCollegeSearch.length < 3
                          //     ? "Type at least 3 characters"
                          //     : "No institution found"
                          // }

                          noOptionsMessage={() => "No institution found"}
                        />
                      );
                    }}
                  />

                  <p className="mt-1 text-xs text-gray-500">
                    If your school/college/university is not listed, please type
                    the full name without abbreviations.
                  </p>
                </>
              )}

              {errors.educations?.[index]?.school_college_id && (
                <ErrorMessage>
                  {errors.educations[index].school_college_id.message}
                </ErrorMessage>
              )}
            </div>

            {level === "school" ? (
              <div className="mb-3">
                <Label>Standard</Label>

                <RadioGroup
                  options={SCHOOL_STANDARDS}
                  value={watch(`educations.${index}.standard_or_grade`)}
                  onChange={(val) =>
                    setValue(`educations.${index}.standard_or_grade`, val, {
                      shouldValidate: true,
                    })
                  }
                />

                {errors.educations?.[index]?.standard_or_grade && (
                  <ErrorMessage>
                    {errors.educations[index].standard_or_grade.message}
                  </ErrorMessage>
                )}
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <Label>Course</Label>
                  {loading ? (
                    <Loader message="Loading courses..." />
                  ) : error ? (
                    <CustomErrorMessage message={error} />
                  ) : (
                    <Controller
                      name={`educations.${index}.course_id`}
                      control={control}
                      render={({ field: { onChange, value } }) => {
                        const otherCourseName =
                          watch(`educations.${index}.other_course_name`) || "";
                        const isCustom = value == null && otherCourseName;

                        const selectedOption = isCustom
                          ? {
                              value: otherCourseName,
                              label: otherCourseName,
                              __isNew__: true,
                            }
                          : mappedCourseOptions.find((c) => c.value === value) ||
                            (value ? { value, label: "Selected Course" } : null);

                        return (
                          <CreateableSelect
                            options={mappedCourseOptions} // Hook data passed directly here
                            value={selectedOption}
                            onChange={(opt) => {
                              if (!opt) {
                                onChange(null);
                                setValue(
                                  `educations.${index}.other_course_name`,
                                  ""
                                );
                                setValue(
                                  `educations.${index}.specialization_id`,
                                  null
                                );
                                setValue(
                                  `educations.${index}.other_specialization_name`,
                                  ""
                                );
                                return;
                              }

                              if (opt.__isNew__) {
                                onChange(null);
                                setValue(
                                  `educations.${index}.other_course_name`,
                                  opt.value
                                );
                                setValue(
                                  `educations.${index}.specialization_id`,
                                  null
                                );
                                setValue(
                                  `educations.${index}.other_specialization_name`,
                                  ""
                                );
                              } else {
                                onChange(opt.value);
                                setValue(
                                  `educations.${index}.other_course_name`,
                                  ""
                                );
                                setValue(
                                  `educations.${index}.specialization_id`,
                                  null
                                );
                                setValue(
                                  `educations.${index}.other_specialization_name`,
                                  ""
                                );
                              }
                            }}
                            // Removed onInputChange, isLoading, and noOptionsMessage overrides
                            placeholder="Select your course..."
                            isClearable
                            isSearchable
                          />
                        );
                      }}
                    />
                  )}

                  {errors.educations?.[index]?.course_id && (
                    <ErrorMessage>
                      {errors.educations[index].course_id.message}
                    </ErrorMessage>
                  )}
                  {errors.educations?.[index]?.other_course_name && (
                    <ErrorMessage>
                      {errors.educations[index].other_course_name.message}
                    </ErrorMessage>
                  )}
                </div>

                {!["diploma", "other"].includes(level) &&
                  (courseId || watch(`educations.${index}.other_course_name`)) && (
                    <div className="mb-3">
                      <Label>Specialization</Label>

                      <Controller
                        name={`educations.${index}.specialization_id`}
                        control={control}
                        render={({ field: { onChange, value } }) => {
                          const otherSpecName =
                            watch(
                              `educations.${index}.other_specialization_name`
                            ) || "";
                          const isCustom = value == null && otherSpecName;

                          const selectedOption = isCustom
                            ? {
                                value: otherSpecName,
                                label: otherSpecName,
                                __isNew__: true,
                              }
                            : specOptions.find((opt) => opt.value === value) ||
                              (value
                                ? {
                                    value,
                                    label:
                                      specializations.find((s) => s.id === value)
                                        ?.name || "",
                                  }
                                : null);

                          const finalSpecOptions = React.useMemo(() => {
                            if (selectedOption && !selectedOption.__isNew__) {
                              const exists = specOptions.some(
                                (opt) => opt.value === selectedOption.value
                              );
                              if (!exists) return [selectedOption, ...specOptions];
                            }
                            return specOptions;
                          }, [specOptions, selectedOption]);

                          return (
                            <CreateableSelect
                              value={selectedOption}
                              options={finalSpecOptions}
                              isLoading={isSpecLoading}
                              isClearable
                              isSearchable
                              placeholder="Select Specialization..."
                              onInputChange={(inputValue, meta) => {
                                if (meta?.action === "input-change")
                                  setSpecSearch(inputValue);
                              }}
                              onChange={(opt) => {
                                if (!opt) {
                                  onChange(null);
                                  setValue(
                                    `educations.${index}.other_specialization_name`,
                                    ""
                                  );
                                  return;
                                }

                                if (opt.__isNew__) {
                                  onChange(null);
                                  setValue(
                                    `educations.${index}.other_specialization_name`,
                                    opt.value
                                  );
                                } else {
                                  onChange(opt.value);
                                  setValue(
                                    `educations.${index}.other_specialization_name`,
                                    ""
                                  );
                                }
                              }}
                              // noOptionsMessage={() =>
                              //   specSearch.length < 3
                              //     ? "Type at least 3 characters"
                              //     : "No specialization found"
                              // }
                              noOptionsMessage={() => "No specialization found"}
                              isDisabled={
                                !courseId &&
                                !watch(`educations.${index}.other_course_name`)
                              }
                            />
                          );
                        }}
                      />

                      {errors.educations?.[index]?.specialization_id && (
                        <ErrorMessage>
                          {errors.educations[index].specialization_id.message}
                        </ErrorMessage>
                      )}
                      {errors.educations?.[index]?.other_specialization_name && (
                        <ErrorMessage>
                          {
                            errors.educations[index].other_specialization_name
                              .message
                          }
                        </ErrorMessage>
                      )}
                    </div>
                  )}
              </>
            )}

            <div className="grid grid-cols-1 gap-3 mb-3 sm:grid-cols-2">
              <div>
                <Label>Start Date</Label>
                <Input type="month" {...register(`educations.${index}.start_date`)} />
                {errors.educations?.[index]?.start_date && (
                  <ErrorMessage>
                    {errors.educations[index].start_date.message}
                  </ErrorMessage>
                )}
              </div>

              <div>
                <Label>End Date</Label>
                <Input type="month" {...register(`educations.${index}.end_date`)} />
                {errors.educations?.[index]?.end_date && (
                  <ErrorMessage>
                    {errors.educations[index].end_date.message}
                  </ErrorMessage>
                )}
              </div>
            </div>

            <div className="mb-3">
              <Label>Certificate (Optional)</Label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadImage(file, "certificateImage");
                    if (url) {
                      setValue(`educations.${index}.education_certificate`, url);
                    }
                    e.target.value = "";
                  }}
                  className="hidden"
                  id={`cert-upload-${field.id}`}
                />

                <FileUploadButton
                  htmlFor={`cert-upload-${field.id}`}
                  loading={uploadLoading}
                >
                  {uploadLoading ? "Uploading..." : "Upload"}
                </FileUploadButton>

                {watch(`educations.${index}.education_certificate`) && (
                  <div className="flex items-center gap-1.5 px-2 py-1 text-xs bg-green-50 text-green-700 rounded">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3.5 h-3.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Uploaded
                  </div>
                )}
              </div>

              {errors.educations?.[index]?.education_certificate && (
                <ErrorMessage>
                  {errors.educations[index].education_certificate.message}
                </ErrorMessage>
              )}
            </div>
          </div>
        );
      })}

      <div className="flex justify-center">
        <AddButton onClick={handleAdd}>+ Add Education</AddButton>
      </div>
    </div>
  );
}