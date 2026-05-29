import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Input, Button, ErrorMessage } from "../../../components/ui";
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
// --- Zod Schema (matches StudentFillDetail) ---
const SCHOOL_STANDARDS = ["Class X or below", "Class XI", "Class XII"];
const BASE_URL=import.meta.env.VITE_BASE_URL


const educationEntrySchema = z.object({
  level: z.enum(["school", "diploma", "bachelors", "masters", "phd", "other"]),
  school_college_id: z.number().nullable(),
  other_institution_name: z.string().optional(),
  standard_or_grade: z.string().optional(),
  course_id: z.number().nullable().optional(),
  other_course_name: z.string().optional(),
  specialization_id: z.number().nullable().optional(),
  other_specialization_name: z.string().optional(),
  start_date: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Invalid date format (YYYY-MM)").optional(),
  end_date: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Invalid date format (YYYY-MM)").optional().nullable(),
  education_certificate: z.string().optional().or(z.literal("")),
}).superRefine((data, ctx) => {
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
  // 🔹 NEW: Course validation
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

  // 🔹 NEW: Specialization validation (only if applicable)
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

const getStatusBgColor = (status) => {
  switch (status?.toLowerCase()) {
    case "approved": return "bg-green-100";
    case "rejected": return "bg-red-100";
    default: return "bg-orange-100";
  }
};

const OTHER_OPTION = { id: "other", name: "Other (not listed)" };

const EDUCATION_LEVELS = [
  { value: "school", label: "School (up to Class XII)" },
  // { value: "diploma", label: "Diploma / Polytechnic" },
  { value: "bachelors", label: "Bachelor’s Degree" },
  { value: "masters", label: "Master’s Degree" },
  // { value: "phd", label: "PhD / Doctorate" },
  // { value: "other", label: "Other Certification" },
];

const FeedYourEducation = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);
  const { uploadImage, loading: uploadLoading } = useUploadImageApi();

const [specializationSearch, setSpecializationSearch] = useState("");
const [specializations, setSpecializations] = useState([]);
const [specializationLoading, setSpecializationLoading] = useState(false);

  const [educationEntries, setEducationEntries] = useState([]);
  const [errors, setErrors] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [loading, setLoading] = useState(true);

  const [institutionSearch, setInstitutionSearch] = useState("");
const [institutionOptions, setInstitutionOptions] = useState([]);
const [institutionLoading, setInstitutionLoading] = useState(false);

const [courseSearch, setCourseSearch] = useState("");
const [courses, setCourses] = useState([]);
const [courseLoading, setCourseLoading] = useState(false);




  

  const {
    
    //schoolColleges,
   //getSpecializationsForCourse,
    isLoading: isMasterDataLoading,
  } = useMasterData();

  // Fetch profile
  useEffect(() => {
    if (!isAuthenticated || !token || !user?.id) {
      setLoading(false);
      setEducationEntries([createEmptyEntry()]);
      return;
    }

    const fetchProfile = async () => {
      try {
        const result = await userDetailsApi.getUserPublicProfile(user.id, token);
        if (result.success) {
          const educations = result.data?.educations || [];
          const mapped = educations.map((edu) => ({
            id: edu.id,
            level: edu.level || "school",
            school_college_id: edu.school_college_id,
            other_institution_name: edu.other_institution_name || "",
            standard_or_grade: edu.standard_or_grade || "Class XII",
            course_id: edu.course_id,
            specialization_id: edu.specialization_id,
            start_date: normalizeToYearMonth(edu.start_date),
            end_date: normalizeToYearMonth(edu.end_date),
            education_certificate: edu.education_certificate || "",
            status: edu.status || "pending",
          }));
          setEducationEntries(mapped.length ? mapped : [createEmptyEntry()]);
        } else {
          setEducationEntries([createEmptyEntry()]);
        }
      } catch (err) {
        console.error(err);
        setEducationEntries([createEmptyEntry()]);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, token, user?.id]);

  const createEmptyEntry = () => ({
  id: Date.now(),
  level: "school",
  school_college_id: null,
  other_institution_name: "",
  standard_or_grade: "Class XII",
  course_id: null,
  other_course_name: "",
  specialization_id: null,
  other_specialization_name: "",
  start_date: "",
  end_date: "",
  education_certificate: "",
  status: "pending",
});

//for college
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
        }
      );

      if (res.data?.success) {
        setInstitutionOptions(
          res.data.data.map((inst) => ({
            value: inst.id,
            label: inst.name,
          }))
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
}, [institutionSearch]);

//for  courses
useEffect(() => {
  if (!courseSearch || courseSearch.length < 2) {
    setCourses([]);
    return;
  }

  const timer = setTimeout(async () => {
    try {
      setCourseLoading(true);

      const res = await axios.get(
        `${BASE_URL}/master/courses/search`,
        {
          params: { search: courseSearch },
        }
      );

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
  }, 400); // debounce

  return () => clearTimeout(timer);
}, [courseSearch]);

//for specialization
useEffect(() => {
  const timers = Object.keys(specializationSearch).map((entryId) => {
    const search = specializationSearch[entryId];
    const courseId = educationEntries.find(e => e.id === Number(entryId))?.course_id;

    if (!search || search.length < 2 || !courseId) return null;

    return setTimeout(async () => {
      try {
        setSpecializationLoading(prev => ({ ...prev, [entryId]: true }));

        const res = await axios.get(
          `${BASE_URL}/master/specialization/search`,
          {
            params: {
              search,
              course_id: courseId,
            },
          }
        );

        setSpecializations(prev => ({
          ...prev,
          [entryId]: res.data?.success ? res.data.data : [],
        }));
      } catch {
        setSpecializations(prev => ({ ...prev, [entryId]: [] }));
      } finally {
        setSpecializationLoading(prev => ({ ...prev, [entryId]: false }));
      }
    }, 400);
  });

  return () => timers.forEach(t => t && clearTimeout(t));
}, [specializationSearch, educationEntries]);



  // --- Handlers ---
  const handleInputChange = (id, field, value) => {
    setEducationEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
    // Clear error on change
    setErrors((prev) => {
      const newErrors = { ...prev };
      if (newErrors[id]?.[field]) delete newErrors[id][field];
      if (Object.keys(newErrors[id] || {}).length === 0) delete newErrors[id];
      return newErrors;
    });
  };

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
            course_id: null,
            other_course_name: "",
            specialization_id: null,
            other_specialization_name: "",
            standard_or_grade: level === "school" ? "Class XII" : "",
          }
        : e
    )
  );
};

//   const institutionOptions = React.useMemo(() => {
//   return schoolColleges || [];
// }, [schoolColleges]);

  const handleInstitutionChange = (id, opt) => {
    const isOther = opt?.id === "other";
    handleInputChange(id, "school_college_id", isOther ? null : opt?.id || null);
    if (isOther) handleInputChange(id, "other_institution_name", "");
  };

  const handleCourseChange = (id, opt) => {
    handleInputChange(id, "course_id", opt?.id || null);
    if (opt) handleInputChange(id, "specialization_id", null);
  };

  const handleSpecializationChange = (id, opt) => {
    handleInputChange(id, "specialization_id", opt?.id || null);
  };

  const handleAddEducation = () => {
    setEducationEntries((prev) => [...prev, createEmptyEntry()]);
  };

  const handleRemoveEducation = (id) => {
    if (window.confirm("Are you sure you want to remove this education entry?")) {
      setEducationEntries((prev) => prev.filter((e) => e.id !== id));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleFileUpload = async (id, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadProgress((prev) => ({ ...prev, [id]: 0 }));
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress((prev) => ({ ...prev, [id]: progress }));
      if (progress >= 100) clearInterval(interval);
    }, 100);

    try {
      const url = await uploadImage(file, "certificateImage");
      if (url) {
        handleInputChange(id, "education_certificate", url); // relative path
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploadProgress((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  // --- Validation & Save ---
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

  const handleSaveChanges = async () => {
    if (!validateEntries()) {
      alert("Please fix validation errors before saving.");
      return;
    }

    if (!isAuthenticated || !token || !user?.id) {
      alert("Not authenticated");
      return;
    }

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
    other_specialization_name: e.other_specialization_name?.trim() || null,
    start_date: e.start_date,
    end_date: e.end_date || null,
    education_certificate: e.education_certificate || null,
  })),
};

    try {
      const result = await userDetailsApi.updateUserDetails(user.id, payload, token);
      if (result.success) {
        alert("Education details saved successfully!");
        navigate("/feed-view");
      } else {
        throw new Error(result.message || "Save failed");
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to save.");
    }
  };

  // --- Loading ---
  if (loading || isMasterDataLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="w-12 h-12 border-b-2 border-red-500 rounded-full animate-spin"></div>
        </div>
      </MainLayout>
    );
  }
 

  return (
    <MainLayout>
      <div className="flex items-start justify-center min-h-screen px-4 bg-gray-100 sm:px-6 lg:px-8">
        <div className="flex-grow hidden lg:block"></div>

        <section className="w-full max-w-[95vw] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] h-auto p-3 sm:p-4 md:p-5 lg:p-6 rounded-[5px] bg-white flex flex-col shadow-lg gap-3 sm:gap-4 mt-2 mx-auto">
          <div className="flex flex-col w-full bg-white rounded">
            <div className="px-4 pt-4 mb-4 sm:mb-6 sm:px-6 sm:pt-6">
              <div className="flex items-center gap-3 mb-3 sm:mb-4">
                <button onClick={() => navigate(-1)}>
                  <IoIosArrowBack className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-xl font-bold text-black sm:text-2xl lg:text-3xl">
                  Your Education
                </h1>
              </div>
            </div>

            <div className="px-4 pb-4 space-y-3 sm:space-y-4 sm:px-6 sm:pb-6">
              {educationEntries.map((entry) => {
               

                return (
                  <div
                    key={entry.id}
                    className={`${getStatusBgColor(entry.status)} border border-gray-200 rounded-lg p-4 relative`}
                  >
                    {/* Trash Icon */}
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(entry.id)}
                      className="absolute p-1 text-red-500 rounded top-2 right-2 hover:bg-red-100"
                      aria-label="Remove education"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                    {/* Level */}
                    <div className="mb-3">
                      <label className="block mb-1 text-sm font-medium text-gray-700">Education Level</label>
                      <Select
                        options={EDUCATION_LEVELS}
                        value={EDUCATION_LEVELS.find((opt) => opt.value === entry.level) || null}
                        onChange={(opt) => handleLevelChange(entry.id, opt)}
                        isSearchable={false}
                        className="text-sm"
                        classNamePrefix="select"
                      />
                      {errors[entry.id]?.level && <ErrorMessage>{errors[entry.id].level}</ErrorMessage>}
                    </div>

                    
                    {/* Institution */}
<div className="mb-3">
  <label className="block mb-1 text-sm font-medium text-gray-700">
    Institution
  </label>

  <CreatableSelect
    options={institutionOptions}
    isLoading={institutionLoading}
    onInputChange={(value, meta) => {
      if (meta.action === "input-change") {
        setInstitutionSearch(value);
      }
    }}
    value={
      entry.school_college_id
        ? institutionOptions.find(
            (opt) => opt.value === entry.school_college_id
          )
        : entry.other_institution_name
        ? {
            value: entry.other_institution_name,
            label: entry.other_institution_name,
            __isNew__: true,
          }
        : null
    }
    onChange={(opt) => {
      if (!opt) {
        handleInputChange(entry.id, "school_college_id", null);
        handleInputChange(entry.id, "other_institution_name", "");
      } else if (opt.__isNew__) {
        handleInputChange(entry.id, "school_college_id", null);
        handleInputChange(entry.id, "other_institution_name", opt.value);
      } else {
        handleInputChange(entry.id, "school_college_id", opt.value);
        handleInputChange(entry.id, "other_institution_name", "");
      }
    }}
    placeholder="Search or type your School/College/University..."
    isClearable
    className="text-sm"
    classNamePrefix="select"
  />

  {errors[entry.id]?.school_college_id && (
    <ErrorMessage>{errors[entry.id].school_college_id}</ErrorMessage>
  )}
  {errors[entry.id]?.other_institution_name && (
    <ErrorMessage>{errors[entry.id].other_institution_name}</ErrorMessage>
  )}
</div>


                    {/* Conditional Fields */}
                    {entry.level === "school" ? (
                      <div className="mb-3">
                        <label className="block mb-1 text-sm font-medium text-gray-700">Standard</label>
                        <div className="flex flex-wrap gap-2">
                          {SCHOOL_STANDARDS.map((std) => (
                            <label
                              key={std}
                              className={`px-2 py-1.5 rounded-md border cursor-pointer text-xs ${
                                entry.standard_or_grade === std
                                  ? "bg-blue-500 text-white border-blue-500"
                                  : "bg-gray-100 border-gray-300 hover:border-gray-400"
                              }`}
                            >
                              <input
                                type="radio"
                                checked={entry.standard_or_grade === std}
                                onChange={() => handleInputChange(entry.id, "standard_or_grade", std)}
                                className="hidden"
                              />
                              {std}
                            </label>
                          ))}
                        </div>
                        {errors[entry.id]?.standard_or_grade && (
                          <ErrorMessage>{errors[entry.id].standard_or_grade}</ErrorMessage>
                        )}
                      </div>
                    ) : (
                      <>
                        <div className="mb-3">
  <label className="block mb-1 text-sm font-medium text-gray-700">Course</label>
 <CreatableSelect
  options={courses.map((c) => ({
    value: c.id,
    label: c.name,
  }))}
  value={
    entry.course_id
      ? {
          value: entry.course_id,
          label: courses.find((c) => c.id === entry.course_id)?.name,
        }
      : entry.other_course_name
      ? {
          value: entry.other_course_name,
          label: entry.other_course_name,
          __isNew__: true,
        }
      : null
  }
  onInputChange={(value, meta) => {
    if (meta.action === "input-change") {
      setCourseSearch(value);
    }
  }}
  onChange={(opt) => {
    if (!opt) {
      handleInputChange(entry.id, "course_id", null);
      handleInputChange(entry.id, "other_course_name", "");
      handleInputChange(entry.id, "specialization_id", null);
      handleInputChange(entry.id, "other_specialization_name", "");
    } else if (opt.__isNew__) {
      handleInputChange(entry.id, "course_id", null);
      handleInputChange(entry.id, "other_course_name", opt.value);
      handleInputChange(entry.id, "specialization_id", null);
      handleInputChange(entry.id, "other_specialization_name", "");
    } else {
      handleInputChange(entry.id, "course_id", opt.value);
      handleInputChange(entry.id, "other_course_name", "");
      handleInputChange(entry.id, "specialization_id", null);
      handleInputChange(entry.id, "other_specialization_name", "");
    }
  }}
  isLoading={courseLoading}
  placeholder="Search or type your course..."
  isClearable
  isSearchable
  className="text-sm"
  classNamePrefix="select"
/>

  {errors[entry.id]?.course_id && (
    <ErrorMessage>{errors[entry.id].course_id}</ErrorMessage>
  )}
  {errors[entry.id]?.other_course_name && (
    <ErrorMessage>{errors[entry.id].other_course_name}</ErrorMessage>
  )}
</div>

                        {entry.level !== "school" &&
  !["diploma", "other"].includes(entry.level) &&
  (entry.course_id || entry.other_course_name) && (
    <div className="mb-3">
      <label className="block mb-1 text-sm font-medium text-gray-700">Specialization</label>
   <CreatableSelect
  options={(specializations[entry.id] || []).map((s) => ({
    value: s.id,
    label: s.name,
  }))}
  value={
    entry.specialization_id
      ? {
          value: entry.specialization_id,
          label: specializations[entry.id]?.find(
            (s) => s.id === entry.specialization_id
          )?.name,
        }
      : entry.other_specialization_name
      ? {
          value: entry.other_specialization_name,
          label: entry.other_specialization_name,
          __isNew__: true,
        }
      : null
  }
  onInputChange={(value, meta) => {
    if (meta.action === "input-change") {
      setSpecializationSearch(prev => ({
        ...prev,
        [entry.id]: value,
      }));
    }
  }}
  onChange={(opt) => {
    if (!opt) {
      handleInputChange(entry.id, "specialization_id", null);
      handleInputChange(entry.id, "other_specialization_name", "");
    } else if (opt.__isNew__) {
      handleInputChange(entry.id, "specialization_id", null);
      handleInputChange(entry.id, "other_specialization_name", opt.value);
    } else {
      handleInputChange(entry.id, "specialization_id", opt.value);
      handleInputChange(entry.id, "other_specialization_name", "");
    }
  }}
  isLoading={specializationLoading[entry.id]}
  isDisabled={!entry.course_id && !entry.other_course_name}
  placeholder="Search or type your specialization..."
  isClearable
/>


      {errors[entry.id]?.specialization_id && (
        <ErrorMessage>{errors[entry.id].specialization_id}</ErrorMessage>
      )}
      {errors[entry.id]?.other_specialization_name && (
        <ErrorMessage>{errors[entry.id].other_specialization_name}</ErrorMessage>
      )}
    </div>
  )}
                      </>
                    )}

                    {/* Dates */}
                    <div className="grid grid-cols-1 gap-3 mb-3 sm:grid-cols-2">
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">Start Date</label>
                        <Input
                          type="month"
                          value={entry.start_date}
                          onChange={(e) => handleInputChange(entry.id, "start_date", e.target.value)}
                        />
                        {errors[entry.id]?.start_date && (
                          <ErrorMessage>{errors[entry.id].start_date}</ErrorMessage>
                        )}
                      </div>
                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">End Date (Optional)</label>
                        <Input
                          type="month"
                          value={entry.end_date}
                          onChange={(e) => handleInputChange(entry.id, "end_date", e.target.value)}
                        />
                        {errors[entry.id]?.end_date && (
                          <ErrorMessage>{errors[entry.id].end_date}</ErrorMessage>
                        )}
                      </div>
                    </div>

                    {/* Certificate Upload */}
                    <div className="mb-3">
                      <label className="block mb-1 text-sm font-medium text-gray-700">Certificate (Optional)</label>
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor={`cert-upload-${entry.id}`}
                          className={`px-3 py-1.5 text-sm text-white rounded cursor-pointer ${
                            uploadLoading || uploadProgress[entry.id] !== undefined
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-blue-600 hover:bg-blue-700"
                          }`}
                        >
                          {uploadProgress[entry.id] !== undefined
                            ? `Uploading... ${uploadProgress[entry.id]}%`
                            : "Upload Certificate"}
                        </label>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={(e) => handleFileUpload(entry.id, e)}
                          className="hidden"
                          id={`cert-upload-${entry.id}`}
                        />
                        {entry.education_certificate && (
                          <span className="text-sm text-gray-600 truncate max-w-[200px]">
                            {entry.education_certificate.split('/').pop() || 'Uploaded'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add Education Button */}
            <div className="flex justify-center px-4 pb-4 mt-4 sm:mt-6 lg:mt-8 sm:px-6 sm:pb-6">
              <button
                type="button"
                onClick={handleAddEducation}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100 rounded hover:bg-blue-200"
              >
                + Add Education
              </button>
            </div>

            {/* Save Button */}
            <div className="flex justify-center px-4 pb-4 sm:px-6 sm:pb-6">
              <Button
                variant="primary"
                size="large"
                onClick={handleSaveChanges}
                className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold text-sm sm:text-base"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </section>

        {/* <aside className="hidden lg:block w-full max-w-[350px] p-2 sticky top-4 h-fit">
          <FeedRightSidebar />
        </aside> */}
        <div className="flex-grow hidden lg:block"></div>
      </div>
    </MainLayout>
  );
};

export default FeedYourEducation;