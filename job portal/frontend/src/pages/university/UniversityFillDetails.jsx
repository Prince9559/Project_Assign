// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { useForm, Controller } from "react-hook-form";
// import SignUpLayout from "../../components/layout/SignUpLayout";
// import MainLayout from "../../components/layout/MainLayout";
// import { Input, Textarea, Button, ErrorMessage } from "../../components/ui";
// import { useMasterData } from "../../hooks/master/useMasterData";
// import useUploadImageApi from "../../hooks/useUploadImageApi";
// import Select from "react-select";
// import { useSelector, useDispatch } from "react-redux";
// import { universityApi } from "../../api/university/universityApi";
// import { updateUser } from "../../redux/feature/authSlice";

// export default function UniversityFillDetails() {
//   const [isSmallDevice, setIsSmallDevice] = useState(false);
//   const [logoPreview, setLogoPreview] = useState(null);
//   const [profilePicPreview, setProfilePicPreview] = useState(null);
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);
//   const { token, user } = useSelector((state) => state.auth);
//   const navigate = useNavigate();
//   const { courses } = useMasterData();
//   const { uploadImage } = useUploadImageApi();
//   const dispatch = useDispatch();

//   const [authLetterFileName, setAuthLetterFileName] = useState("");
//   const [uploadingLogo, setUploadingLogo] = useState(false);
//   const [uploadingProfile, setUploadingProfile] = useState(false);
//   const [uploadingAuthLetter, setUploadingAuthLetter] = useState(false);
//   const [logoFileName, setLogoFileName] = useState("");
//   const [profilePicFileName, setProfilePicFileName] = useState("");

//   //  useForm setup
//   const {
//     register,
//     handleSubmit,
//     control,
//     setValue,
//     reset,
//     formState: { errors },
//   } = useForm({
//     defaultValues: {
//       college_name: "",
//       affiliated_university: "",
//       course_ids: [],
//       profile_pic: null,
//       university_logo_url: null,
//       authorization_letter_url: null,
//       address: "",
//       pincode: "",
//       website_link: "",
//       about: "",
//       social_media_link: "",
//     },
//   });

//   // Detect screen size
//   useEffect(() => {
//     const checkDeviceSize = () => setIsSmallDevice(window.innerWidth < 1024);
//     checkDeviceSize();
//     window.addEventListener("resize", checkDeviceSize);
//     return () => window.removeEventListener("resize", checkDeviceSize);
//   }, []);

//   const courseOptions = Array.isArray(courses) ? courses : [];

//   //  File upload handlers
//   const handleLogoUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setLogoFileName(file.name); // ← ADD THIS
//       const previewUrl = URL.createObjectURL(file);
//       setLogoPreview(previewUrl);
//       try {
//         setUploadingLogo(true);
//         const url = await uploadImage(file, "logoUrl");
//         setValue("university_logo_url", url, { shouldValidate: true });
//       } catch (err) {
//         console.error("Logo upload failed", err);
//         setLogoFileName(""); // ← reset on error
//       } finally {
//         setUploadingLogo(false);
//       }
//     }
//   };

//   const handleProfilePicUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setProfilePicFileName(file.name); // ← ADD THIS
//       const previewUrl = URL.createObjectURL(file);
//       setProfilePicPreview(previewUrl);
//       try {
//         setUploadingProfile(true);
//         const url = await uploadImage(file, "profilePic");
//         setValue("profile_pic", url, { shouldValidate: true });
//       } catch (err) {
//         console.error("Profile pic upload failed", err);
//         setProfilePicFileName(""); // ← reset on error
//       } finally {
//         setUploadingProfile(false);
//       }
//     }
//   };

//   const handleAuthLetterUpload = async (e) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       setAuthLetterFileName(file.name);
//       try {
//         setUploadingAuthLetter(true);
//         const url = await uploadImage(file, "certificate"); // or "authLetter"
//         setValue("authorization_letter_url", url, { shouldValidate: true });
//       } catch (err) {
//         console.error("Authorization letter upload failed", err);
//         setAuthLetterFileName("");
//       } finally {
//         setUploadingAuthLetter(false);
//       }
//     }
//   };

//   // Submit
//   const onSubmit = async (data) => {
//     setLoading(true);
//     setError("");
//     try {
//       console.log("=== FORM DATA ===", JSON.stringify(data, null, 2));

//       const response = await universityApi.createUniversityProfile(data, token);
//       console.log("the api response", response);
//       if (response.success) {
//         alert(response.message);
//         //update the redux storing certain basic details
//         dispatch(
//           updateUser({
//             user_profile_pic: response.data.profile_pic || null,
//             about_us: response.data.about || null,
//             organization_name: response.data.college_name || null,
//             organization_logo: response.data.university_logo_url || null,
//             email: response.data.User?.email,
//             phone: response.data.User?.phone,
//             profile_status: 2,
//           })
//         );
//         navigate("/university-profile");
//       }
//       console.log("Server response:", response.data);

//       // Reset form after successful submission
//       reset({
//         college_name: "",
//         affiliated_university:"",
//         course_ids: [],
//         profile_pic: null,
//         university_logo_url: null,
//         authorization_letter_url:null,
//         address: "",
//         pincode: "",
//         website_link: "",
//         about: "",
//         social_media_link: "",
//       });

//       // Clear previews and file names
//       setLogoPreview(null);
//       setProfilePicPreview(null);
//       setLogoFileName("");
//       setProfilePicFileName("");
//       setAuthLetterFileName("");
//     } catch (err) {
//       console.error("Error saving:", err);
//       setError("Failed to save university details. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const FormContent = () => (
//     <div className="p-6 bg-white rounded-lg shadow-md">
//       {error && (
//         <ErrorMessage onClose={() => setError("")}>{error}</ErrorMessage>
//       )}

//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
//         {/* ===== UNIVERSITY DETAILS ===== */}
//         <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
//           <h2 className="mb-4 text-lg font-semibold text-center text-gray-800">
//             University Details
//           </h2>

//           <Input
//             label="College Name"
//             placeholder="Enter college name"
//             error={errors.college_name?.message}
//             {...register("college_name", {
//               required: "College name is required",
//             })}
//           />

//           <Input
//             label="Affiliated University"
//             placeholder="Enter affiliated university name"
//             error={errors.affiliated_university?.message}
//             {...register("affiliated_university", {
//               required: "Affiliated university is required",
//             })}
//           />

//           <Textarea
//             label="Address"
//             placeholder="Enter complete address"
//             error={errors.address?.message}
//             {...register("address", { required: "Address is required" })}
//           />

//           <Input
//             label="Pincode"
//             placeholder="Enter 6-digit pincode"
//             maxLength={6}
//             error={errors.pincode?.message}
//             {...register("pincode", {
//               required: "Pincode is required",
//               pattern: {
//                 value: /^\d{6}$/,
//                 message: "Enter valid 6-digit pincode",
//               },
//             })}
//           />

//           <Input
//             label="Website Link"
//             placeholder="https://www.youruniversity.edu"
//             error={errors.website_link?.message}
//             {...register("website_link", {
//               required: "Website link is required",
//               pattern: {
//                 value: /^https?:\/\//i,
//                 message: "Must start with http:// or https://",
//               },
//             })}
//           />

//           <Textarea
//             label="About University"
//             placeholder="Tell us about your university..."
//             error={errors.about?.message}
//             {...register("about", { required: "About is required" })}
//           />

//           {/* University Logo */}
//           <div className="space-y-2">
//             <label className="block text-xs font-medium text-gray-700">
//               University Logo
//             </label>
//             <div className="flex items-center justify-between p-2 border border-gray-200 rounded">
//               <div>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleLogoUpload}
//                   className="hidden text-sm"
//                   id="logo-upload"
//                 />
//                 <label
//                   htmlFor="logo-upload"
//                   className="px-3 py-1 text-sm text-blue-600 bg-white border border-blue-300 rounded cursor-pointer hover:bg-blue-50"
//                 >
//                   {logoFileName || "Choose Image"}
//                 </label>
//                 {uploadingLogo && (
//                   <span className="ml-2 text-xs text-blue-500">
//                     Uploading...
//                   </span>
//                 )}
//               </div>
//               <div>
//                 {logoPreview && (
//                   <img
//                     src={logoPreview}
//                     alt="University Logo"
//                     className="object-cover w-10 h-10 rounded"
//                   />
//                 )}
//               </div>
//             </div>
//           </div>

//           <Input
//             label="Social Media Link"
//             placeholder="https://linkedin.com/youruniversity"
//             error={errors.social_media_link?.message}
//             {...register("social_media_link", {
//               pattern: {
//                 value: /^https?:\/\//i,
//                 message: "Must start with http:// or https://",
//               },
//             })}
//           />
//         </div>

//         {/* ===== REPRESENTATIVE DETAILS (READ-ONLY) ===== */}
//         <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
//           <h2 className="mb-4 text-lg font-semibold text-center text-gray-800">
//             Representative Details
//           </h2>
//           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//             <div>
//               <label className="block text-xs font-medium text-gray-500">
//                 First Name
//               </label>
//               <p className="p-2 text-sm bg-gray-100 border rounded">
//                 {user?.first_name || "–"}
//               </p>
//             </div>
//             <div>
//               <label className="block text-xs font-medium text-gray-500">
//                 Last Name
//               </label>
//               <p className="p-2 text-sm bg-gray-100 border rounded">
//                 {user?.last_name || "–"}
//               </p>
//             </div>
//             <div>
//               <label className="block text-xs font-medium text-gray-500">
//                 Email
//               </label>
//               <p className="p-2 text-sm bg-gray-100 border rounded">
//                 {user?.email || "–"}
//               </p>
//             </div>
//             <div>
//               <label className="block text-xs font-medium text-gray-500">
//                 Phone
//               </label>
//               <p className="p-2 text-sm bg-gray-100 border rounded">
//                 {user?.phone || "–"}
//               </p>
//             </div>
//           </div>
//           {/* Profile Picture */}
//           <div className="space-y-2">
//             <label className="block text-xs font-medium text-gray-700">
//               Profile Picture
//             </label>
//             <div className="flex items-center justify-between p-2 border border-gray-200 rounded">
//               <div>
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleProfilePicUpload}
//                   className="hidden text-sm"
//                   id="profile-pic-upload"
//                 />
//                 <label
//                   htmlFor="profile-pic-upload"
//                   className="px-3 py-1 text-sm text-blue-600 bg-white border border-blue-300 rounded cursor-pointer hover:bg-blue-50"
//                 >
//                   {profilePicFileName || "Choose Image"}
//                 </label>
//                 {uploadingProfile && (
//                   <span className="ml-2 text-xs text-blue-500">
//                     Uploading...
//                   </span>
//                 )}
//               </div>
//               <div>
//                 {profilePicPreview && (
//                   <img
//                     src={profilePicPreview}
//                     alt="Profile Pic"
//                     className="object-cover w-10 h-10 border rounded"
//                   />
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Authorization Letter */}
//           <div className="space-y-2">
//             <label className="block text-xs font-medium text-gray-700">
//               Authorization Letter (PDF)
//             </label>
//             <div className="flex items-center justify-between p-2 border border-gray-200 rounded">
//               <div>
//                 <input
//                   type="file"
//                   accept=".pdf"
//                   onChange={handleAuthLetterUpload}
//                   className="hidden text-sm"
//                   id="auth-letter"
//                 />
//                 <label
//                   htmlFor="auth-letter"
//                   className="px-3 py-1 text-sm text-blue-600 bg-white border border-blue-300 rounded cursor-pointer hover:bg-blue-50"
//                 >
//                   {authLetterFileName || "Choose PDF"}
//                 </label>
//                 {uploadingAuthLetter && (
//                   <span className="ml-2 text-xs text-blue-500">
//                     Uploading...
//                   </span>
//                 )}
//               </div>
//               {authLetterFileName && (
//                 <span className="text-xs text-gray-600 truncate max-w-[120px]">
//                   {authLetterFileName}
//                 </span>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* ===== COURSES ===== */}
//         <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
//           <h2 className="mb-4 text-lg font-semibold text-center text-gray-800">
//             Offered Courses
//           </h2>
//           <div className="space-y-1">
//             <label className="block text-xs font-medium text-gray-700">
//               Select Courses *
//             </label>
//             <Controller
//               name="course_ids"
//               control={control}
//               rules={{
//                 validate: (v) =>
//                   v.length > 0 || "At least one course is required",
//               }}
//               render={({ field }) => (
//                 <Select
//                   {...field}
//                   isMulti
//                   options={courseOptions}
//                   getOptionLabel={(o) => o.name}
//                   getOptionValue={(o) => o.id}
//                   placeholder="Select Courses"
//                   isSearchable
//                   className="text-sm"
//                   classNamePrefix="select"
//                   onChange={(selected) =>
//                     field.onChange(selected.map((o) => o.id))
//                   }
//                   value={courseOptions.filter((o) =>
//                     field.value?.includes(o.id)
//                   )}
//                 />
//               )}
//             />
//             {errors.course_ids && (
//               <p className="text-xs text-red-500">
//                 {errors.course_ids.message}
//               </p>
//             )}
//           </div>
//         </div>

//         {/* Submit Button */}
//         <Button
//           variant="secondary"
//           loading={loading}
//           disabled={loading}
//           className="w-full"
//           type="submit"
//         >
//           {loading ? "Saving..." : "Save University Details"}
//         </Button>
//       </form>
//     </div>
//   );

//   return (
//     <MainLayout
//       heading="University Details"
//       subheading="Complete your university profile!"
//       hideMobileIllustration={isSmallDevice}
//       centerMobileContent={false}
//     >
//       <div className="bg-[#f5f6f7] min-h-screen">
//         <div className="relative flex w-full min-h-screen overflow-hidden shadow-md md:items-center md:justify-center">
//           <div className="flex justify-center flex-1 w-full md:mt-0">
//             <div className="w-full max-w-full p-6 shadow-md rounded-xl sm:shadow-xl sm:max-w-2xl sm:p-8">
//               <FormContent />
//             </div>
//           </div>
//         </div>
//       </div>
//     </MainLayout>
//   );
// }



import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import CreatableSelect from "react-select/creatable";
import MainLayout from "../../components/layout/MainLayout";
import { Input, Textarea, Button, ErrorMessage } from "../../components/ui";
import useUploadImageApi from "../../hooks/useUploadImageApi";
import { useSelector, useDispatch } from "react-redux";
import { universityApi } from "../../api/university/universityApi";
import { updateUser } from "../../redux/feature/authSlice";
import { showSuccessAlert, showErrorAlert } from "../../utils/alertService";
import ReactSelectDropdown from "../../components/ui/ReactSelectDropdown";
const MAX_AUTH_LETTER_BYTES = 2 * 1024 * 1024;
const BASE_URL = import.meta.env.VITE_BASE_URL;

const collegeSelectStyles = {
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#2563eb"
      : state.isFocused
      ? "#dbeafe"
      : base.backgroundColor,
    color: state.isSelected ? "#fff" : base.color,
  }),
  control: (base) => ({
    ...base,
    fontSize: "0.875rem",
    minHeight: "38px",
  }),
};

function isAuthorizationLetterPdfFile(file) {
  if (!file) return false;
  const nameOk = /\.pdf$/i.test(file.name);
  const typeOk =
    file.type === "application/pdf" ||
    file.type === "application/x-pdf" ||
    file.type === "application/octet-stream" ||
    file.type === "";
  return nameOk && typeOk;
}

// Zod Schema
const universitySchema = z.object({
  college_name: z.string().min(1, "College name is required"),
  school_college_id: z
    .number({
      invalid_type_error: "Please search and select your college",
    })
    .int()
    .positive({ message: "Please search and select your college" }),
  affiliated_university: z.string().min(1, "Affiliated university is required"),
  profile_pic: z.string().nullable(),
  university_logo_url: z.string().nullable(),
  authorization_letter_url: z
    .union([z.string(), z.null()])
    .refine((val) => typeof val === "string" && val.trim().length > 0, {
      message: "Authorization letter is required",
    }),
  address: z.string().min(1, "Address is required"),
  pincode: z
    .string()
    .min(1, "Pincode is required")
    .regex(/^\d{6}$/, "Enter valid 6-digit pincode"),
  website_link: z
    .string()
    .min(1, "Website link is required")
    .regex(/^https?:\/\//i, "Must start with http:// or https://"),
  about: z.string().min(1, "About is required"),
  social_media_link: z
    .string()
    .optional()
    .refine((val) => !val || /^https?:\/\//i.test(val), {
      message: "Must start with http:// or https://",
    }),
});

export default function UniversityFillDetails() {
  const [isSmallDevice, setIsSmallDevice] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [submitBannerError, setSubmitBannerError] = useState("");
  const [loading, setLoading] = useState(false);
  const { token, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const { uploadImage } = useUploadImageApi();
  const dispatch = useDispatch();

  const [authLetterFileName, setAuthLetterFileName] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingAuthLetter, setUploadingAuthLetter] = useState(false);
  const [logoFileName, setLogoFileName] = useState("");
  const [profilePicFileName, setProfilePicFileName] = useState("");

  const [collegeOptions, setCollegeOptions] = useState([]);
  const [collegeSearch, setCollegeSearch] = useState("");
  const [collegeSearchLoading, setCollegeSearchLoading] = useState(false);
  const [creatingCollege, setCreatingCollege] = useState(false);
  const collegeSearchTimeoutRef = useRef(null);

  // useForm with Zod resolver
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(universitySchema),
    mode: "onTouched", 
  reValidateMode: "onChange",
  shouldUnregister: false,
    defaultValues: {
      college_name: "",
      school_college_id: undefined,
      affiliated_university: "",
      profile_pic: null,
      university_logo_url: null,
      authorization_letter_url: null,
      address: "",
      pincode: "",
      website_link: "",
      about: "",
      social_media_link: "",
    },
  });

  // Detect screen size
  useEffect(() => {
    const checkDeviceSize = () => setIsSmallDevice(window.innerWidth < 1024);
    checkDeviceSize();
    window.addEventListener("resize", checkDeviceSize);
    return () => window.removeEventListener("resize", checkDeviceSize);
  }, []);

  useEffect(() => {
    if (collegeSearchTimeoutRef.current) clearTimeout(collegeSearchTimeoutRef.current);

    const q = collegeSearch.trim();
    if (q.length < 3) {
      setCollegeOptions([]);
      return;
    }

    collegeSearchTimeoutRef.current = setTimeout(async () => {
      try {
        setCollegeSearchLoading(true);
        const res = await axios.get(`${BASE_URL}/colleges/search`, {
          params: { query: q },
        });
        const rows = res.data?.data || [];
        setCollegeOptions(
          rows.map((c) => ({
            value: c.id,
            label: c.college_name || c.name,
          }))
        );
      } catch (err) {
        console.error("College search failed", err);
        setCollegeOptions([]);
      } finally {
        setCollegeSearchLoading(false);
      }
    }, 400);

    return () => {
      if (collegeSearchTimeoutRef.current) clearTimeout(collegeSearchTimeoutRef.current);
    };
  }, [collegeSearch]);

  const watchedSchoolCollegeId = watch("school_college_id");
  const watchedCollegeName = watch("college_name");
  const collegeSelectValue =
    watchedSchoolCollegeId != null
      ? {
          value: watchedSchoolCollegeId,
          label: watchedCollegeName || "Selected college",
        }
      : null;

  const handleCollegeSelectChange = async (opt, fieldOnChange) => {
    if (!opt) {
      fieldOnChange(undefined);
      setValue("college_name", "", { shouldValidate: true });
      clearErrors("school_college_id");
      return;
    }

    if (opt.__isNew__) {
      const raw =
        typeof opt.value === "string"
          ? opt.value.trim()
          : String(opt.label || "").trim();
      if (!raw) return;

      try {
        setCreatingCollege(true);
        const res = await axios.post(
          `${BASE_URL}/colleges`,
          { college_name: raw },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const payload = res.data?.data;
        if (!payload?.id) {
          await showErrorAlert("Error", "Could not create college. Please try again.");
          return;
        }
        const name = payload.college_name || payload.name || raw;
        fieldOnChange(Number(payload.id));
        setValue("college_name", name, { shouldValidate: true });
        clearErrors("school_college_id");
      } catch (e) {
        const apiMsg = e?.response?.data?.message;
        const msg =
          typeof apiMsg === "string"
            ? apiMsg
            : "Could not create college. Please try again.";
        await showErrorAlert("Error", msg);
      } finally {
        setCreatingCollege(false);
      }
      return;
    }

    fieldOnChange(Number(opt.value));
    setValue("college_name", opt.label || "", { shouldValidate: true });
    clearErrors("school_college_id");
  };

  // File upload handlers
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFileName(file.name);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);
      try {
        setUploadingLogo(true);
        const url = await uploadImage(file, "logoUrl");
        setValue("university_logo_url", url, { shouldValidate: true });
      } catch (err) {
        console.error("Logo upload failed", err);
        setLogoFileName("");
      } finally {
        setUploadingLogo(false);
      }
    }
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicFileName(file.name);
      const previewUrl = URL.createObjectURL(file);
      setProfilePicPreview(previewUrl);
      try {
        setUploadingProfile(true);
        const url = await uploadImage(file, "profilePic");
        setValue("profile_pic", url, { shouldValidate: true });
      } catch (err) {
        console.error("Profile pic upload failed", err);
        setProfilePicFileName("");
      } finally {
        setUploadingProfile(false);
      }
    }
  };

  const handleAuthLetterUpload = async (e) => {
    const input = e.target;
    const file = input.files?.[0];
    if (!file) return;

    if (!isAuthorizationLetterPdfFile(file)) {
      input.value = "";
      setAuthLetterFileName("");
      setValue("authorization_letter_url", null, { shouldValidate: true });
      setError("authorization_letter_url", {
        message: "Only PDF files are allowed for the authorization letter.",
      });
      return;
    }

    if (file.size > MAX_AUTH_LETTER_BYTES) {
      input.value = "";
      setAuthLetterFileName("");
      setValue("authorization_letter_url", null, { shouldValidate: true });
      setError("authorization_letter_url", {
        message:
          "Please upload the authorization letter with a file size of 2 MB or less.",
      });
      return;
    }

    setAuthLetterFileName(file.name);
    clearErrors("authorization_letter_url");
    try {
      setUploadingAuthLetter(true);
      const url = await uploadImage(file, "certificate");
      if (!url) {
        input.value = "";
        setAuthLetterFileName("");
        setValue("authorization_letter_url", null, { shouldValidate: true });
        setError("authorization_letter_url", {
          message: "Upload failed. Please try again.",
        });
        return;
      }
      setValue("authorization_letter_url", url, { shouldValidate: true });
    } catch (err) {
      console.error("Authorization letter upload failed", err);
      input.value = "";
      setAuthLetterFileName("");
      setValue("authorization_letter_url", null, { shouldValidate: true });
      const apiMsg = err?.response?.data?.message;
      setError("authorization_letter_url", {
        message:
          typeof apiMsg === "string"
            ? apiMsg
            : "Authorization letter upload failed.",
      });
    } finally {
      setUploadingAuthLetter(false);
    }
  };

  // Submit
  const onSubmit = async (data) => {
    setLoading(true);
    setSubmitBannerError("");
    try {
      console.log("=== FORM DATA ===", JSON.stringify(data, null, 2));

      const response = await universityApi.createUniversityProfile(
        { ...data, course_ids: [] },
        token
      );
      console.log("the api response", response);
      if (response.success) {
        await showSuccessAlert("Success!", "University details saved successfully.");
        dispatch(
          updateUser({
            user_profile_pic: response.data.profile_pic || null,
            about_us: response.data.about || null,
            organization_name: response.data.college_name || null,
            organization_logo: response.data.university_logo_url || null,
            email: response.data.User?.email,
            phone: response.data.User?.phone,
            profile_status: 2,
            verification_status: response.data.is_verified ? "verified" : "not_verified",
            accountStatus: response.data.is_verified ? "verified" : "not_verified",
          })
        );
        navigate("/university-profile");
      }

      reset({
        college_name: "",
        school_college_id: undefined,
        affiliated_university: "",
        profile_pic: null,
        university_logo_url: null,
        authorization_letter_url: null,
        address: "",
        pincode: "",
        website_link: "",
        about: "",
        social_media_link: "",
      });

      setLogoPreview(null);
      setProfilePicPreview(null);
      setLogoFileName("");
      setProfilePicFileName("");
      setAuthLetterFileName("");
    } catch (err) {
      console.error("Error saving:", err);
      const apiMsg = err?.response?.data?.message;
      const msg =
        typeof apiMsg === "string"
          ? apiMsg
          : "Failed to save university details. Please try again.";
      await showErrorAlert("Error", msg);
      setSubmitBannerError(msg);
    } finally {
      setLoading(false);
    }
  };

  const FormContent = () => (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {submitBannerError && (
        <ErrorMessage onClose={() => setSubmitBannerError("")}>{submitBannerError}</ErrorMessage>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* ===== UNIVERSITY DETAILS ===== */}
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h2 className="mb-4 text-lg font-semibold text-center text-gray-800">
            University Details
          </h2>

          <div className="mb-3 space-y-1">
            <label className="block text-xs font-medium text-gray-700">
               college name <span className="text-red-500">*</span>
            </label>
            <Controller
              name="school_college_id"
              control={control}
              render={({ field }) => (
                <CreatableSelect
                  inputId="university-college-select"
                  options={collegeOptions}
                  value={collegeSelectValue}
                  onChange={(opt) => handleCollegeSelectChange(opt, field.onChange)}
                  onInputChange={(inputValue, meta) => {
                    if (meta.action === "input-change") setCollegeSearch(inputValue);
                  }}
                  placeholder="Search..."
                  isClearable
                  isSearchable
                  isLoading={collegeSearchLoading || creatingCollege}
                  filterOption={() => true}
                  formatCreateLabel={(inputValue) =>
                    `➕ Create new college: ${inputValue}`
                  }
                  styles={collegeSelectStyles}
                  noOptionsMessage={({ inputValue }) => {
                    if (!inputValue) return "Start typing to search approved colleges";
                    return "No matching college — create new below or press Enter";
                  }}
                  className="w-full text-sm"
                  classNamePrefix="select"
                />
              )}
            />
            <input type="hidden" {...register("college_name")} />
            {(errors.school_college_id || errors.college_name) && (
              <p className="text-xs text-red-500">
                {errors.school_college_id?.message || errors.college_name?.message}
              </p>
            )}
          </div>

          <Input
            label="Affiliated University"
            placeholder="Enter affiliated university name"
            error={errors.affiliated_university?.message}
            {...register("affiliated_university")}
          />

          <Textarea
            label="Address"
            placeholder="Enter complete address"
            error={errors.address?.message}
            {...register("address")}
          />

          <Input
            label="Pincode"
            placeholder="Enter 6-digit pincode"
            maxLength={6}
            error={errors.pincode?.message}
            {...register("pincode")}
          />

          <Input
            label="Website Link"
            placeholder="https://www.youruniversity.edu"
            error={errors.website_link?.message}
            {...register("website_link")}
          />

          <Textarea
            label="About University"
            placeholder="Tell us about your university..."
            error={errors.about?.message}
            {...register("about")}
          />

          {/* University Logo */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              University Logo
            </label>
            <div className="flex items-center justify-between p-2 border border-gray-200 rounded">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden text-sm"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="px-3 py-1 text-sm text-blue-600 bg-white border border-blue-300 rounded cursor-pointer hover:bg-blue-50"
                >
                  {logoFileName || "Choose Image"}
                </label>
                {uploadingLogo && (
                  <span className="ml-2 text-xs text-blue-500">Uploading...</span>
                )}
              </div>
              <div>
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="University Logo"
                    className="object-cover w-10 h-10 rounded"
                  />
                )}
              </div>
            </div>
          </div>

          <Input
            label="Social Media Link"
            placeholder="https://linkedin.com/youruniversity"
            error={errors.social_media_link?.message}
            {...register("social_media_link")}
          />
        </div>

        {/* ===== REPRESENTATIVE DETAILS (READ-ONLY) ===== */}
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h2 className="mb-4 text-lg font-semibold text-center text-gray-800">
            Representative Details
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-500">
                First Name
              </label>
              <p className="p-2 text-sm bg-gray-100 border rounded">
                {user?.first_name || "–"}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Last Name
              </label>
              <p className="p-2 text-sm bg-gray-100 border rounded">
                {user?.last_name || "–"}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Email
              </label>
              <p className="p-2 text-sm bg-gray-100 border rounded">
                {user?.email || "–"}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Phone
              </label>
              <p className="p-2 text-sm bg-gray-100 border rounded">
                {user?.phone || "–"}
              </p>
            </div>
          </div>

          {/* Profile Picture */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              Profile Picture
            </label>
            <div className="flex items-center justify-between p-2 border border-gray-200 rounded">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicUpload}
                  className="hidden text-sm"
                  id="profile-pic-upload"
                />
                <label
                  htmlFor="profile-pic-upload"
                  className="px-3 py-1 text-sm text-blue-600 bg-white border border-blue-300 rounded cursor-pointer hover:bg-blue-50"
                >
                  {profilePicFileName || "Choose Image"}
                </label>
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
          </div>

          {/* Authorization Letter */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              Authorization Letter (PDF)
            </label>
            <div className="flex items-center justify-between p-2 border border-gray-200 rounded">
              <div>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleAuthLetterUpload}
                  className="hidden text-sm"
                  id="auth-letter"
                />
                <label
                  htmlFor="auth-letter"
                  className="px-3 py-1 text-sm text-blue-600 bg-white border border-blue-300 rounded cursor-pointer hover:bg-blue-50"
                >
                  {authLetterFileName || "Choose PDF"}
                </label>
                {uploadingAuthLetter && (
                  <span className="ml-2 text-xs text-blue-500">Uploading...</span>
                )}
              </div>
              {authLetterFileName && (
                <span className="text-xs text-gray-600 truncate max-w-[120px]">
                  {authLetterFileName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          variant="secondary"
          loading={loading}
          disabled={loading}
          className="w-full"
          type="submit"
        >
          {loading ? "Saving..." : "Save University Details"}
        </Button>
      </form>
    </div>
  );

  return (
    <MainLayout
      heading="University Details"
      subheading="Complete your university profile!"
      hideMobileIllustration={isSmallDevice}
      centerMobileContent={false}
    >
      <div className="bg-[#f5f6f7] min-h-screen">
        <div className="relative flex w-full min-h-screen overflow-hidden shadow-md md:items-center md:justify-center">
          <div className="flex justify-center flex-1 w-full md:mt-0">
            <div className="w-full max-w-full p-6 shadow-md rounded-xl sm:shadow-xl sm:max-w-2xl sm:p-8">
              {/* <FormContent /> */}
              <div className="p-6 bg-white rounded-lg shadow-md">
      {submitBannerError && (
        <ErrorMessage onClose={() => setSubmitBannerError("")}>{submitBannerError}</ErrorMessage>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* ===== UNIVERSITY DETAILS ===== */}
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h2 className="mb-4 text-lg font-semibold text-center text-gray-800">
            University Details
          </h2>

          <div className="mb-3 space-y-1">
            <label className="block text-xs font-medium text-gray-700">
              College name <span className="text-red-500">*</span>
            </label>
            <Controller
              name="school_college_id"
              control={control}
              render={({ field }) => (
                <CreatableSelect
                  inputId="university-college-select-main"
                  options={collegeOptions}
                  value={collegeSelectValue}
                  onChange={(opt) => handleCollegeSelectChange(opt, field.onChange)}
                  onInputChange={(inputValue, meta) => {
                    if (meta.action === "input-change") setCollegeSearch(inputValue);
                  }}
                  placeholder="Search..."
                  isClearable
                  isSearchable
                  isLoading={collegeSearchLoading || creatingCollege}
                  filterOption={() => true}
                  formatCreateLabel={(inputValue) =>
                    `➕ Create new college: ${inputValue}`
                  }
                  styles={collegeSelectStyles}
                  noOptionsMessage={({ inputValue }) => {
                    if (!inputValue) return "Start typing to search approved colleges";
                    if (inputValue.trim().length < 3) {
                      return "Start typing to search";
                    }
                    return "No matching college — create new below or press Enter";
                  }}
                  className="w-full text-sm"
                  classNamePrefix="select"
                />
              )}
            />
            <input type="hidden" {...register("college_name")} />
            {(errors.school_college_id || errors.college_name) && (
              <p className="text-xs text-red-500">
                {errors.school_college_id?.message || errors.college_name?.message}
              </p>
            )}
          </div>

          <Input
            label="Affiliated University *"
            placeholder="Enter affiliated university name"
            error={errors.affiliated_university?.message}
            {...register("affiliated_university")}
          />

          <Textarea
            label="Address *"
            placeholder="Enter complete address"
            error={errors.address?.message}
            {...register("address")}
          />

          <Input
            label="Pincode *"
            placeholder="Enter 6-digit pincode"
            maxLength={6}
            error={errors.pincode?.message}
            {...register("pincode")}
          />

          <Input
            label="Website Link *"
            placeholder="https://www.youruniversity.edu"
            error={errors.website_link?.message}
            {...register("website_link")}
          />

          <Textarea
            label="About University *"
            placeholder="Tell us about your university..."
            error={errors.about?.message}
            {...register("about")}
          />

          {/* University Logo */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              University Logo
            </label>
            <div className="flex items-center justify-between p-2 border border-gray-200 rounded">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden text-sm"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="px-3 py-1 text-sm text-blue-600 bg-white border border-blue-300 rounded cursor-pointer hover:bg-blue-50"
                >
                  {logoFileName || "Choose Image"}
                </label>
                {uploadingLogo && (
                  <span className="ml-2 text-xs text-blue-500">Uploading...</span>
                )}
              </div>
              <div>
                {logoPreview && (
                  <img
                    src={logoPreview}
                    alt="University Logo"
                    className="object-cover w-10 h-10 rounded"
                  />
                )}
              </div>
            </div>
          </div>

          <Input
            label="Social Media Link"
            placeholder="https://linkedin.com/youruniversity"
            error={errors.social_media_link?.message}
            {...register("social_media_link")}
          />
        </div>

        {/* ===== REPRESENTATIVE DETAILS (READ-ONLY) ===== */}
        <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h2 className="mb-4 text-lg font-semibold text-center text-gray-800">
            Representative Details
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-500">
                First Name
              </label>
              <p className="p-2 text-sm bg-gray-100 border rounded">
                {user?.first_name || "–"}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Last Name
              </label>
              <p className="p-2 text-sm bg-gray-100 border rounded">
                {user?.last_name || "–"}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Email
              </label>
              <p className="p-2 text-sm bg-gray-100 border rounded">
                {user?.email || "–"}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">
                Phone
              </label>
              <p className="p-2 text-sm bg-gray-100 border rounded">
                {user?.phone || "–"}
              </p>
            </div>
          </div>

          {/* Profile Picture */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              Profile Picture
            </label>
            <div className="flex items-center justify-between p-2 border border-gray-200 rounded">
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicUpload}
                  className="hidden text-sm"
                  id="profile-pic-upload"
                />
                <label
                  htmlFor="profile-pic-upload"
                  className="px-3 py-1 text-sm text-blue-600 bg-white border border-blue-300 rounded cursor-pointer hover:bg-blue-50"
                >
                  {profilePicFileName || "Choose Image"}
                </label>
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
          </div>

          {/* Authorization Letter */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-700">
              Authorization Letter (PDF) *
            </label>
            <p className="text-xs text-gray-500">PDF only, maximum 2 MB.</p>
            <div className="flex items-center justify-between p-2 border border-gray-200 rounded">
              <div>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleAuthLetterUpload}
                  className="hidden text-sm"
                  id="auth-letter"
                />
                <label
                  htmlFor="auth-letter"
                  className="px-3 py-1 text-sm text-blue-600 bg-white border border-blue-300 rounded cursor-pointer hover:bg-blue-50"
                >
                  {authLetterFileName || "Choose PDF"}
                </label>
                {uploadingAuthLetter && (
                  <span className="ml-2 text-xs text-blue-500">Uploading...</span>
                )}
              </div>
              {authLetterFileName && (
                <span className="text-xs text-gray-600 truncate max-w-[120px]">
                  {authLetterFileName}
                </span>
              )}
            </div>
            {errors.authorization_letter_url && (
              <p className="text-xs text-red-500">{errors.authorization_letter_url.message}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          variant="secondary"
          loading={loading}
          disabled={loading}
          className="w-full"
          type="submit"
        >
          {loading ? "Saving..." : "Save University Details"}
        </Button>
      </form>
    </div>
              
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

