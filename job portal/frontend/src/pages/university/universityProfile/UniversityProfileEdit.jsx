import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FaCamera, FaChevronDown, FaChevronUp, FaCheckCircle } from "react-icons/fa";
import MainLayout from "../../../components/layout/MainLayout";
import dummyProfile3 from "../../../assets/dummyProfile3.jpg";
import { useMasterData } from "../../../hooks/master/useMasterData";
import useUploadImageApi from "../../../hooks/useUploadImageApi";
import Select from "react-select";
import axios from "axios";
import { getImageUrl } from "../../../../utils";
import { Loader2 } from "lucide-react";
import { universityApi } from "../../../api/university/universityApi";
import { updateUser } from "../../../redux/feature/authSlice";
import { useProfileCompletion } from "../../../hooks/useProfileCompletion";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ===== REUSABLE UI COMPONENTS (Copied from CompanyProfileEdit) =====

const VerificationBadge = ({ isVerified, onClick }) => {
  if (isVerified) return null;
  return (
    <div
      className="absolute cursor-pointer -top-1 -right-1 group"
      onClick={onClick}
      title="Account not fully verified. Complete email and phone verification."
      aria-label="Verification required"
    >
      <div className="flex items-center justify-center w-6 h-6 transition-colors bg-yellow-500 rounded-full shadow-lg group-hover:bg-yellow-600">
        <span className="text-xs font-bold text-white">!</span>
      </div>
      <div className="absolute right-0 z-10 w-48 px-3 py-2 mt-2 text-xs text-white whitespace-normal transition-opacity bg-gray-900 rounded opacity-0 pointer-events-none top-full group-hover:opacity-100">
        <p>Verification incomplete</p>
        <p className="mt-1">Email or phone not verified.</p>
        <p className="mt-1 text-blue-300 underline">Tap to verify</p>
      </div>
    </div>
  );
};

const CollapsibleSection = ({ title, weight, score, children, isExpanded, onToggle, showEditControls, onEditClick, onSaveClick, onCancelClick, isEditing, isSaving }) => {
  const safeWeight = weight > 0 ? weight : 1;
  const percentage = Math.min(100, Math.round((score / safeWeight) * 100));
  const isComplete = percentage === 100;
  
  return (
    <div className="overflow-hidden bg-white shadow-sm rounded-xl">
      <div
        className="flex items-center justify-between p-4 transition-colors cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {isComplete && <FaCheckCircle className="text-green-500" size={18} />}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-24 h-2 rounded-full ${isComplete ? 'bg-green-200' : 'bg-yellow-200'}`}>
              <div
                className={`h-full rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-yellow-500'}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span className={`text-sm font-medium ${isComplete ? 'text-green-600' : 'text-yellow-600'}`}>
              {percentage}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            {showEditControls && (
              isEditing ? (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); onSaveClick(); }}
                    className="text-sm font-medium text-green-600 hover:text-green-800 disabled:opacity-50"
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onCancelClick(); }}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={(e) => { e.stopPropagation(); onEditClick(); }}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
              )
            )}
            <button className="p-1 transition-colors rounded hover:bg-gray-200">
              {isExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
            </button>
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};

const FieldRow = ({ label, value, isVerified = false, isEditable = false, editValue, onChange, type = "text", placeholder = "", rows = 1, children }) => {
  return (
    <div className="py-3 border-b border-gray-200 last:border-0">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            {isVerified && <FaCheckCircle className="text-green-500" size={14} />}
          </div>
          {isEditable ? (
            type === "custom" ? (
              <div className="w-full">{children}</div>
            ) : type === "textarea" ? (
              <textarea
                value={editValue || ""}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={rows}
                placeholder={placeholder}
              />
            ) : type === "select" ? (
              <select
                value={editValue || ""}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {children}
              </select>
            ) : (
              <input
                type={type}
                value={editValue || ""}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={placeholder}
              />
            )
          ) : (
            <div className="text-sm text-gray-600 whitespace-pre-wrap">
              {value ? value : <span className="text-gray-400">Not provided</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/** Map backend university profile-completion breakdown to 3 UI band groups (server weights sum to 100). */
function aggregateUniversitySectionBars(breakdown) {
  if (!breakdown || typeof breakdown !== "object") return null;
  const sumKeys = (keys) => {
    let w = 0;
    let s = 0;
    for (const k of keys) {
      const b = breakdown[k];
      if (b && !b.not_applicable && typeof b.weight === "number" && b.weight > 0) {
        w += b.weight;
        s += typeof b.score === "number" ? b.score : 0;
      }
    }
    return { weight: w, score: Math.min(s, w) };
  };
  return {
    basicAccount: sumKeys(["basic_info", "affiliation_and_links"]),
    universityBundle: sumKeys([
      "institution_info",
      "courses_offered",
      "logo_and_profile_pic",
      "authorization_letter",
    ]),
    verification: sumKeys(["verification"]),
  };
}

// ===== MAIN COMPONENT =====

const UniversityProfileEdit = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // UI State matching company / student profile (all collapsed by default)
  const [expandedSections, setExpandedSections] = useState({
    basic_info: false,
    university_info: false,
    verification: false,
  });
  
  const [editingSections, setEditingSections] = useState({
    basic_info: false,
    university_info: false
  });

  const [formValues, setFormValues] = useState({
    college_name: "",
    about: "",
    course_ids: [],
    pincode: "",
    website_link: "",
    address: "",
    phone: "",
    email: "",
    social_media_link: "",
    profile_pic: "",
    university_logo_url: "",
  });
  const [uploadStatus, setUploadStatus] = useState(null);
  const [uploading, setUploading] = useState({
    profilePic: false,
    logo: false,
  });

  const [courseOptions, setCourseOptions] = useState([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [isCourseLoading, setIsCourseLoading] = useState(false);
  const courseTimeoutRef = useRef(null);

  const { courses } = useMasterData();
  const { uploadImage } = useUploadImageApi();

  const {
    percentage: completionPercentage,
    breakdown: completionBreakdown,
    loading: completionLoading,
    refetch: refetchCompletion,
  } = useProfileCompletion(true);

  const [isSaving, setIsSaving] = useState(false);

  // FETCH UNIVERSITY DATA
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token || !user?.id) return;
      try {
        setLoading(true);
        setUploadStatus(null);
        const response = await universityApi.getUniversityDetailsById(user.id, token);
        const data = response.data;
        setUserData(data);
        setFormValues({
          college_name: data.college_name || "",
          about: data.about || "",
          course_ids: data.courses?.map((c) => c.id) || [],
          pincode: data.pincode || "",
          website_link: data.website_link || "",
          address: data.address || "",
          phone: data.User?.phone || "",
          email: data.User?.email || "",
          social_media_link: data.social_media_link || "",
          profile_pic: data.profile_pic || "",
          university_logo_url: data.university_logo_url || "",
        });
      } catch (err) {
        console.error("Failed to load university profile", err);
        setUploadStatus({ type: "error", message: "Failed to load profile." });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token, user?.id]);

  useEffect(() => {
    if (courseTimeoutRef.current) {
      clearTimeout(courseTimeoutRef.current);
    }

    // Allow searching for any length (including empty). Backend will handle empty search.
    courseTimeoutRef.current = setTimeout(async () => {
      try {
        setIsCourseLoading(true);
        const res = await axios.get(
          `${BASE_URL}/master/courses/search?search=${courseSearch}`
        );
        const data = res.data?.data || [];
        setCourseOptions(
          data.map((c) => ({
            value: c.id,
            label: c.name,
          }))
        );
      } catch (err) {
        console.error("Course search failed:", err);
        setCourseOptions([]);
      } finally {
        setIsCourseLoading(false);
      }
    }, 400);

    return () => clearTimeout(courseTimeoutRef.current);
  }, [courseSearch]);

  const reconstructUniversityData = (rawData) => {
    return {
      ...rawData,
      courses: rawData.courses || [], 
    };
  };

  // TOGGLE UI LOGIC
  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const startSectionEdit = (section) => {
    setEditingSections((prev) => ({ ...prev, [section]: true }));
    setExpandedSections((prev) => ({ ...prev, [section]: true }));
  };

  const stopSectionEdit = (section) => {
    setEditingSections((prev) => ({ ...prev, [section]: false }));
  };

  // SAVE SECTION 
  const handleSaveSection = async (section) => {
    if (!token) return;
    setIsSaving(true);
    try {
      const response = await universityApi.updateUniversityDetails(formValues, token);
      if (response.success) {
        const updatedData = reconstructUniversityData(response.data);

        let normalizedCourses = [];
        if (Array.isArray(formValues.course_ids) && courses) {
          normalizedCourses = formValues.course_ids
            .map((id) => courses.find((c) => c.id === id))
            .filter(Boolean);
        } else {
          normalizedCourses = updatedData.courses || [];
        }
        const normalizedData = {
          ...updatedData,
          courses: normalizedCourses,
          User: {
            email: updatedData.email,
            phone: updatedData.phone,
          },
          is_email_verified: updatedData.email_id_verified,
          is_phone_verified: updatedData.phone_verified,
        };

        setUserData(normalizedData);
        setFormValues({
          college_name: normalizedData.college_name || "",
          about: normalizedData.about || "",
          course_ids: normalizedData.courses?.map((c) => c.id) || [],
          pincode: normalizedData.pincode || "",
          website_link: normalizedData.website_link?.trim() || "",
          address: normalizedData.address || "",
          phone: normalizedData.phone || "",
          email: normalizedData.email || "",
          social_media_link: normalizedData.social_media_link?.trim() || "",
          profile_pic: normalizedData.profile_pic?.trim() || "",
          university_logo_url: normalizedData.university_logo_url?.trim() || "",
        });

        dispatch(
          updateUser({
            user_profile_pic: normalizedData.profile_pic || null,
            about_us: normalizedData.about || null,
            organization_name: normalizedData.college_name || null,
            organization_logo: normalizedData.university_logo_url || null,
            email: normalizedData.email || formValues.email,
            phone: normalizedData.phone || formValues.phone,
          })
        );

        setUploadStatus({ type: "success", message: "Updated successfully!" });
        stopSectionEdit(section);
        await refetchCompletion?.();
      } else {
        throw new Error(response.message || "Update failed");
      }
    } catch (err) {
      console.error("Save error:", err);
      setUploadStatus({
        type: "error",
        message: "Failed to update. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // IMAGE UPLOAD 
  const handleImageUpload = async (e, type = "profilePic") => {
    const file = e.target.files?.[0];
    if (!file || file.size > 5 * 1024 * 1024) {
      setUploadStatus({ type: "error", message: "File too large (max 5MB)." });
      return;
    }
    if (type === "logo" && file.type !== "image/png" && file.type !== "image/jpeg") {
      setUploadStatus({ type: "error", message: "Only JPG/PNG allowed for logo." });
      return;
    }

    setUploading((prev) => ({ ...prev, [type]: true }));
    try {
      const url = await uploadImage(file, type === "profilePic" ? "profile" : "logo");
      const field = type === "profilePic" ? "profile_pic" : "university_logo_url";
      const newFormValues = { ...formValues, [field]: url };
      setFormValues(newFormValues);

      const response = await universityApi.updateUniversityDetails(newFormValues, token);
      if (response.success) {
        const updated = reconstructUniversityData(response.data);
        setUserData(updated);
        setFormValues((prev) => ({
          ...prev,
          [field]: updated[field] || url,
        }));

        dispatch(
          updateUser(
            type === "profilePic"
              ? { user_profile_pic: updated.profile_pic || url }
              : { organization_logo: updated.university_logo_url || url }
          )
        );

        setUploadStatus({
          type: "success",
          message: type === "profilePic" ? "Profile picture updated!" : "Logo updated!",
        });
        await refetchCompletion?.();
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      setUploadStatus({ type: "error", message: "Upload failed. Please try again." });
    } finally {
      setUploading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const profile = userData;

  const getCoursesFromIds = () => {
    if (!formValues.course_ids || formValues.course_ids.length === 0) return [];
    return formValues.course_ids
      .map((id) => courses?.find((c) => c.id === id))
      .filter(Boolean);
  };

  const getSelectedCourses = () => {
    if (!formValues.course_ids || formValues.course_ids.length === 0) return [];
    return formValues.course_ids.map((id) => {
      const course = courses?.find((c) => c.id === id);
      return course ? { value: course.id, label: course.name } : null;
    }).filter(Boolean);
  };

  // Helper validation for the checkmarks and progress bars
  const isFieldComplete = (value) => {
    if (Array.isArray(value)) return value.length > 0;
    return value && String(value).trim() !== "";
  };

  // Local fallback bars when API breakdown is not yet loaded
  const basicInfoFields = [formValues.college_name, formValues.email, formValues.phone, formValues.website_link, formValues.social_media_link];
  const basicScore = basicInfoFields.filter(f => isFieldComplete(f)).length;
  
  const uniInfoFields = [formValues.about, formValues.course_ids, formValues.address, formValues.pincode, formValues.university_logo_url];
  const uniScore = uniInfoFields.filter(f => isFieldComplete(f)).length;

  // Prefer server profile verification flags, fall back to Redux user flags
  const verifEmail = profile?.is_email_verified ?? user?.is_email_verified;
  const verifPhone = profile?.is_phone_verified ?? user?.is_phone_verified;
  const verifFields = [verifEmail, verifPhone];
  const verifScore = verifFields.filter((f) => f).length;

  const sectionBars = useMemo(() => {
    const api = aggregateUniversitySectionBars(completionBreakdown);
    const basicW = Math.max(1, basicInfoFields.length);
    const uniW = Math.max(1, uniInfoFields.length);
    const verW = Math.max(1, verifFields.length);

    // For university profile UI we must ignore Aadhaar contributions
    // and compute verification band solely from Email + Phone.
    const verificationBand = { weight: verW, score: verifScore };

    // Use server weights for basicAccount and universityBundle when available,
    // but always use local verificationBand for universities to remove Aadhaar.
    const basicBand = api && api.basicAccount && api.basicAccount.weight > 0
      ? api.basicAccount
      : { weight: basicW, score: basicScore };

    const uniBand = api && api.universityBundle && api.universityBundle.weight > 0
      ? api.universityBundle
      : { weight: uniW, score: uniScore };

    return {
      basicAccount: basicBand,
      universityBundle: uniBand,
      verification: verificationBand,
    };
  }, [
    completionBreakdown,
    basicScore,
    uniScore,
    verifScore,
    basicInfoFields.length,
    uniInfoFields.length,
    profile?.is_email_verified,
    profile?.is_phone_verified,
    user?.is_email_verified,
    user?.is_phone_verified,
    formValues.college_name,
    formValues.email,
    formValues.phone,
    formValues.website_link,
    formValues.social_media_link,
    formValues.about,
    formValues.course_ids,
    formValues.address,
    formValues.pincode,
    formValues.university_logo_url,
  ]);

  const displayCompletionPct = Math.min(
    100,
    Math.max(0, (() => {
      const hasServerPct = completionPercentage !== null && completionPercentage !== undefined && completionPercentage !== "";
      // local calculation from sectionBars
      const bw = sectionBars.basicAccount.weight || 0;
      const bs = sectionBars.basicAccount.score || 0;
      const uw = sectionBars.universityBundle.weight || 0;
      const us = sectionBars.universityBundle.score || 0;
      const vw = sectionBars.verification.weight || 0;
      const vs = sectionBars.verification.score || 0;
      const localTotalW = bw + uw + vw || 1;
      const localTotalS = bs + us + vs;
      const localPct = Math.round((localTotalS / localTotalW) * 100);
      return Math.round(Number(hasServerPct ? completionPercentage : localPct) || 0);
    })())
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-gray-600">Loading university profile...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col w-full gap-6 p-4 mx-auto lg:flex-row max-w-7xl">
        <div className="w-full space-y-6">
          
          {uploadStatus && (
            <div className={`text-center p-3 rounded text-sm ${uploadStatus.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {uploadStatus.message}
            </div>
          )}

          {/* Profile Header Block */}
          <div className="flex flex-col items-center justify-center p-8 bg-white shadow-sm rounded-xl">
            <div className="relative mb-4 group">
              <img
                src={
                  formValues.profile_pic
                    ? `${getImageUrl(formValues.profile_pic)}?t=${Date.now()}`
                    : getImageUrl(profile?.profile_pic) || dummyProfile3
                }
                alt="University Profile"
                className="object-cover w-24 h-24 border-2 border-gray-200 rounded-full shadow-sm"
              />
              <label className="absolute p-2 text-white transition-colors bg-blue-600 rounded-full shadow-md cursor-pointer -bottom-1 -right-1 hover:bg-blue-700">
                <FaCamera size={14} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'profilePic')}
                  className="hidden"
                  disabled={uploading.profilePic}
                />
              </label>
              <VerificationBadge
                isVerified={profile?.is_email_verified && profile?.is_phone_verified}
                onClick={() => navigate("/university-authentication")}
              />
            </div>
            <h1 className="text-2xl font-bold text-center text-gray-900">
              {formValues.college_name || "Your University"}
            </h1>
            {/* Overall profile completion — same pattern as FeedView */}
            <div className="w-full max-w-md mx-auto mt-6 pt-5 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                <span className="text-sm font-semibold text-blue-600">
                  {completionLoading ? "…" : `${displayCompletionPct}%`}
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    displayCompletionPct === 100
                      ? "bg-gradient-to-r from-green-400 to-green-500"
                      : "bg-gradient-to-r from-blue-500 to-blue-600"
                  }`}
                  style={{ width: `${completionLoading ? 0 : displayCompletionPct}%` }}
                />
              </div>
              {!completionLoading && displayCompletionPct < 100 && (
                <p className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                  <span className="inline-block w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                  Complete your profile to stand out!
                </p>
              )}
              {!completionLoading && displayCompletionPct === 100 && (
                <p className="flex items-center gap-1 mt-2 text-xs font-medium text-green-600">
                  <FaCheckCircle size={12} /> Profile complete!
                </p>
              )}
            </div>
          </div>

          {/* ===== SECTION 1: BASIC INFO ===== */}
          <CollapsibleSection
            title="Basic Info"
            weight={sectionBars.basicAccount.weight}
            score={sectionBars.basicAccount.score}
            isExpanded={expandedSections.basic_info}
            onToggle={() => toggleSection('basic_info')}
            showEditControls={true}
            isEditing={editingSections.basic_info}
            onEditClick={() => startSectionEdit('basic_info')}
            onSaveClick={() => handleSaveSection('basic_info')}
            onCancelClick={() => stopSectionEdit('basic_info')}
            isSaving={isSaving && editingSections.basic_info}
          >
            <div className="space-y-1">
              <FieldRow label="University Name" value={formValues.college_name} isVerified={isFieldComplete(formValues.college_name)} isEditable={editingSections.basic_info} editValue={formValues.college_name} onChange={(val) => handleChange("college_name", val)} placeholder="Enter university name" />
              <FieldRow label="Email ID" value={formValues.email} isVerified={isFieldComplete(formValues.email)} isEditable={editingSections.basic_info} editValue={formValues.email} onChange={(val) => handleChange("email", val)} type="email" placeholder="Enter email" />
              <FieldRow label="Phone" value={formValues.phone} isVerified={isFieldComplete(formValues.phone)} isEditable={editingSections.basic_info} editValue={formValues.phone} onChange={(val) => handleChange("phone", val)} placeholder="Enter phone number" />
              <FieldRow label="Website Link" value={formValues.website_link} isVerified={isFieldComplete(formValues.website_link)} isEditable={editingSections.basic_info} editValue={formValues.website_link} onChange={(val) => handleChange("website_link", val)} placeholder="https://example.com" />
              <FieldRow label="Social Media Link" value={formValues.social_media_link} isVerified={isFieldComplete(formValues.social_media_link)} isEditable={editingSections.basic_info} editValue={formValues.social_media_link} onChange={(val) => handleChange("social_media_link", val)} placeholder="https://linkedin.com/..." />
            </div>
          </CollapsibleSection>

          {/* ===== SECTION 2: UNIVERSITY INFO ===== */}
          <CollapsibleSection
            title="University Info"
            weight={sectionBars.universityBundle.weight}
            score={sectionBars.universityBundle.score}
            isExpanded={expandedSections.university_info}
            onToggle={() => toggleSection('university_info')}
            showEditControls={true}
            isEditing={editingSections.university_info}
            onEditClick={() => startSectionEdit('university_info')}
            onSaveClick={() => handleSaveSection('university_info')}
            onCancelClick={() => stopSectionEdit('university_info')}
            isSaving={isSaving && editingSections.university_info}
          >
            <div className="space-y-1">
              <FieldRow label="About" value={formValues.about} isVerified={isFieldComplete(formValues.about)} isEditable={editingSections.university_info} editValue={formValues.about} onChange={(val) => handleChange("about", val)} type="textarea" rows={4} placeholder="Tell us about your university..." />
              
              <FieldRow label="Address" value={formValues.address} isVerified={isFieldComplete(formValues.address)} isEditable={editingSections.university_info} editValue={formValues.address} onChange={(val) => handleChange("address", val)} type="textarea" rows={2} placeholder="Enter full address..." />
              
              <FieldRow label="Pincode" value={formValues.pincode} isVerified={isFieldComplete(formValues.pincode)} isEditable={editingSections.university_info} editValue={formValues.pincode} onChange={(val) => handleChange("pincode", val)} placeholder="Enter pincode" />

              <FieldRow 
                label="Courses" 
                value={
                  <div className="flex flex-wrap gap-2 mt-1">
                    {getCoursesFromIds().length > 0 ? (
                      getCoursesFromIds().map((course, i) => (
                        <span key={i} className="flex items-center gap-1 px-2 py-1 text-sm text-gray-700 bg-gray-100 rounded">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          {course.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">No courses added</span>
                    )}
                  </div>
                } 
                isVerified={isFieldComplete(formValues.course_ids)} 
                isEditable={editingSections.university_info} 
                type="custom"
              >
                  <Select
                  isMulti
                  options={courseOptions}
                  value={getSelectedCourses()}
                  onChange={(selected) => {
                    const ids = selected ? selected.map((opt) => opt.value) : [];
                    handleChange("course_ids", ids);
                  }}
                  onInputChange={(inputValue, { action }) => {
                    if (action === "input-change") setCourseSearch(inputValue);
                  }}
                  placeholder="Search courses"
                  isLoading={isCourseLoading}
                  noOptionsMessage={() => ("No courses found")}
                  className="text-sm"
                />
              </FieldRow>

              <FieldRow 
                label="University Logo" 
                value={
                  formValues.university_logo_url ? (
                    <div className="flex items-center gap-3 mt-1">
                      <img
                        src={
                          formValues.university_logo_url.startsWith("http")
                            ? formValues.university_logo_url
                            : getImageUrl(formValues.university_logo_url)
                        }
                        alt="Logo"
                        className="object-contain w-12 h-12 border rounded shadow-sm"
                      />
                      <span className="text-sm text-green-600">Logo uploaded</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">No logo uploaded</span>
                  )
                } 
                isVerified={isFieldComplete(formValues.university_logo_url)} 
                isEditable={editingSections.university_info} 
                type="custom"
              >
                <div className="flex items-center gap-4">
                  {formValues.university_logo_url && (
                    <img
                      src={
                        formValues.university_logo_url.startsWith("http")
                          ? formValues.university_logo_url
                          : getImageUrl(formValues.university_logo_url)
                      }
                      alt="Logo Preview"
                      className="object-contain w-12 h-12 border rounded"
                    />
                  )}
                  <button
                    className="text-sm px-3 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                    onClick={() => document.getElementById("logo-input").click()}
                  >
                    {formValues.university_logo_url ? "Change Logo" : "Upload Logo"}
                  </button>
                  <input
                    id="logo-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "logo")}
                    className="hidden"
                    disabled={uploading.logo}
                  />
                </div>
              </FieldRow>
            </div>
          </CollapsibleSection>

          {/* ===== SECTION 3: VERIFICATION ===== */}
          <CollapsibleSection 
            title="Verification" 
            weight={sectionBars.verification.weight} 
            score={sectionBars.verification.score} 
            isExpanded={expandedSections.verification} 
            onToggle={() => toggleSection('verification')} 
            showEditControls={false}
          >
            <div className="space-y-1">
              <FieldRow label="Email Verification" value={profile?.is_email_verified ? "Verified" : "Not Verified"} isVerified={profile?.is_email_verified} isEditable={false} />
              <FieldRow label="Phone Verification" value={profile?.is_phone_verified ? "Verified" : "Not Verified"} isVerified={profile?.is_phone_verified} isEditable={false} />
              
              <div className="p-3 py-3 mt-4 text-sm text-gray-500 rounded bg-gray-50">
                <p>Verification status is managed by our admin team. Navigate to the authentication page to check or submit documents.</p>
                <button onClick={() => navigate("/university-authentication")} className="mt-2 font-medium text-blue-600 hover:text-blue-800">
                  Go to Authentication Settings
                </button>
              </div>
            </div>
          </CollapsibleSection>

        </div>
      </div>
    </MainLayout>
  );
};

export default UniversityProfileEdit;
