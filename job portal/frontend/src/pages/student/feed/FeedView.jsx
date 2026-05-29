
// import React, { useState, useEffect, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaCamera, FaLink, FaCog, FaChevronDown, FaChevronUp, FaCheckCircle } from "react-icons/fa";
// import MainLayout from "../../../components/layout/MainLayout";
// import { useSelector, useDispatch } from "react-redux";
// import uploadImageApi from "../../../api/uploadImageApi";
// import { userDetailsApi } from "../../../api/userDetailsApi";
// import { getImageUrl } from "../../../../utils.js";
// import dummyProfile3 from "../../../assets/dummyProfile3.jpg";
// import { updateUser } from "../../../redux/feature/authSlice";
// import { useUserDetailsApi } from "../../../hooks/useUserDetailsApi";
// import useFeedApi from "../../../hooks/useFeedApi";
// import websiteLogo from "../../../assets/WebsiteLogo.svg";
// import { useProfileCompletion } from "../../../hooks/useProfileCompletion";

// //  Reusable CollapsibleSection
// const CollapsibleSection = ({ title, weight, score, children, isExpanded, onToggle, showEditControls, onEditClick, onSaveClick, onCancelClick, isEditing, isSaving }) => {
//   const percentage = Math.min(100, Math.round((score / weight) * 100));
//   const isComplete = percentage === 100;
//   return (
//     <div className="overflow-hidden bg-white shadow-sm rounded-xl">
//       <div
//         className="flex items-center justify-between p-4 transition-colors cursor-pointer hover:bg-gray-50"
//         onClick={onToggle}
//       >
//         <div className="flex items-center gap-3">
//           <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
//           {isComplete && <FaCheckCircle className="text-green-500" size={18} />}
//         </div>
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-2">
//             <div className={`w-24 h-2 rounded-full ${isComplete ? 'bg-green-200' : 'bg-yellow-200'}`}>
//               <div
//                 className={`h-full rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-yellow-500'}`}
//                 style={{ width: `${percentage}%` }}
//               />
//             </div>
//             <span className={`text-sm font-medium ${isComplete ? 'text-green-600' : 'text-yellow-600'}`}>
//               {percentage}%
//             </span>
//           </div>
//           <div className="flex items-center gap-2">
//             {showEditControls && (
//               isEditing ? (
//                 <>
//                   <button
//                     onClick={(e) => { e.stopPropagation(); onSaveClick(); }}
//                     className="text-sm font-medium text-green-600 hover:text-green-800 disabled:opacity-50"
//                     disabled={isSaving}
//                   >
//                     {isSaving ? "Saving..." : "Save"}
//                   </button>
//                   <button
//                     onClick={(e) => { e.stopPropagation(); onCancelClick(); }}
//                     className="text-sm font-medium text-gray-500 hover:text-gray-700"
//                   >
//                     Cancel
//                   </button>
//                 </>
//               ) : (
//                 <button
//                   onClick={(e) => { e.stopPropagation(); onEditClick(); }}
//                   className="text-sm font-medium text-blue-600 hover:text-blue-800"
//                 >
//                   Edit
//                 </button>
//               )
//             )}
//             <button className="p-1 transition-colors rounded hover:bg-gray-200">
//               {isExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
//             </button>
//           </div>
//         </div>
//       </div>
//       {isExpanded && (
//         <div className="px-4 pb-4 border-t border-gray-200">
//           {children}
//         </div>
//       )}
//     </div>
//   );
// };

// //  Reusable FieldRow
// const FieldRow = ({ label, value, isVerified = false, isEditable = false, editValue, onChange, type = "text", placeholder = "", rows = 1, children, isTagList = false }) => {
//   return (
//     <div className="py-3 border-b border-gray-200 last:border-0">
//       <div className="flex items-start justify-between">
//         <div className="flex-1">
//           <div className="flex items-center gap-2 mb-1">
//             <span className="text-sm font-medium text-gray-700">{label}</span>
//             {isVerified && <FaCheckCircle className="text-green-500" size={14} />}
//           </div>
//           {isEditable ? (
//             isTagList ? (
//               <input
//                 type="text"
//                 value={editValue || ""}
//                 onChange={(e) => onChange(e.target.value)}
//                 className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder={placeholder}
//               />
//             ) : type === "textarea" ? (
//               <textarea
//                 value={editValue || ""}
//                 onChange={(e) => onChange(e.target.value)}
//                 className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 rows={rows}
//                 placeholder={placeholder}
//               />
//             ) : (
//               <input
//                 type={type}
//                 value={editValue || ""}
//                 onChange={(e) => onChange(e.target.value)}
//                 className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder={placeholder}
//               />
//             )
//           ) : isTagList && value ? (
//             <div className="flex flex-wrap gap-2">
//               {value.split(",").map((tag, i) => (
//                 <span key={i} className="flex items-center gap-1 text-sm text-gray-700">
//                   <span className="w-2 h-2 bg-green-500 rounded-full"></span>
//                   {tag.trim()}
//                 </span>
//               ))}
//             </div>
//           ) : (
//             <p className="text-sm text-gray-600 whitespace-pre-wrap">
//               {value || <span className="text-gray-400">Not provided</span>}
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// /** Map server breakdown (weighted scores) to 0–100% per feed section bar */
// function breakdownToFeedSectionPct(breakdown) {
//   if (!breakdown || typeof breakdown !== "object") return {};
//   const pct = (name) => {
//     const s = breakdown[name];
//     if (!s || s.not_applicable || !s.weight) return undefined;
//     return Math.min(100, Math.round((s.score / s.weight) * 100));
//   };
//   const out = {
//     education: pct("education"),
//     skills: pct("skills"),
//     resume: pct("resume"),
//     work_experience: pct("experience"),
//     languages: pct("languages"),
//   };
//   const v = breakdown.verification;
//   const d = breakdown.document_verification;
//   let num = 0;
//   let den = 0;
//   if (v?.weight) {
//     num += v.score;
//     den += v.weight;
//   }
//   if (d?.weight && !d.not_applicable) {
//     num += d.score;
//     den += d.weight;
//   }
//   if (den > 0) out.authentication = Math.round((num / den) * 100);
//   return out;
// }

// const FeedView = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { user, token } = useSelector((state) => state.auth);

//   // Upload states
//   const [profileImage, setProfileImage] = useState(null);
//   const [resumeUrl, setResumeUrl] = useState(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadStatus, setUploadStatus] = useState(null);

//   // Edit states
//   const [editingField, setEditingField] = useState(null);
//   const [editValue, setEditValue] = useState("");
//   const [isSaving, setIsSaving] = useState(false);

//   // Section expand/edit states
//   const [expandedSections, setExpandedSections] = useState({
//     about: false,
//     career_objective: false,
//     skills: false,
//     work_experience: false,
//     education: false,
//     languages: false,
//     authentication: false,
//     activity: false,
//     resume: false
//   });
//   const [editingSections, setEditingSections] = useState({});

//   // Hook data
//   const {
//     profile,
//     userActivity,
//     workExperiences,
//     educationData,
//     skillsData,
//     loading: hookLoading,
//     error: hookError,
//     getUserPublicProfile,
//   } = useUserDetailsApi();

//   const {
//     percentage: completionPercentage,
//     breakdown: completionBreakdown,
//     loading: completionLoading,
//     error: completionError,
//     refetch: refetchCompletion,
//   } = useProfileCompletion(true);

//   const apiSectionPct = useMemo(
//     () => breakdownToFeedSectionPct(completionBreakdown),
//     [completionBreakdown]
//   );

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const publicProfileUrl = profile?.uuid
//     ? `${window.location.origin}/public-profile/${profile.uuid}`
//     : "";

//   //  Helper: Calculate section score based on field value (REAL-TIME)
//   const calculateFieldScore = (field, value, sectionData = null) => {
//     const trimmedValue = value?.toString().trim();
//     const hasValue = trimmedValue && trimmedValue.length > 0;
    
//     switch(field) {
//       case 'about_us':
//       case 'career_objective':
//       case 'language':
//         return hasValue ? 100 : 0;
//       case 'skills':
//         return (sectionData?.length > 0) ? 100 : 0;
//       case 'work_experience':
//       case 'education':
//         return (sectionData?.length > 0) ? 100 : 0;
//       case 'resume':
//         return hasValue ? 100 : 0;
//       case 'authentication':
//         let score = 0;
//         if (profile?.is_email_verified) score += 33;
//         if (profile?.is_phone_verified) score += 33;
//         if (profile?.is_aadhaar_verified) score += 34;
//         return score;
//       default:
//         return hasValue ? 100 : 0;
//     }
//   };

//   /** CollapsibleSection state keys (UI) ↔ save field names (API) */
//   const fieldToUiSection = {
//     about_us: "about",
//     career_objective: "career_objective",
//     language: "languages",
//   };

//   // Sync profile image & resume from hook
//   useEffect(() => {
//     if (profile) {
//       setProfileImage(profile.user_profile_pic || null);
//       setResumeUrl(profile.resume || null);
//     }
//   }, [profile]);

//   // Fetch profile
//   useEffect(() => {
//     if (!token || !user?.id) return;
//     const fetchProfile = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         await getUserPublicProfile(user.id, token);
//       } catch (err) {
//         setError("Failed to load profile.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProfile();
//   }, [token, user?.id, getUserPublicProfile]);

//   // Helpers
//   const formatDateRange = (start, end) => {
//     const format = (dateStr) => {
//       if (!dateStr) return "Present";
//       const [year, month] = dateStr.split("-");
//       const date = new Date(year, month - 1);
//       return date.toLocaleString("default", {
//         month: "short",
//         year: "numeric",
//       });
//     };
//     return `${format(start)} – ${format(end || null)}`;
//   };

//   const getFileNameFromUrl = (url) => {
//     if (!url) return "resume.pdf";
//     try {
//       return (
//         new URL(url).pathname.split("/").pop().split("?")[0] || "resume.pdf"
//       );
//     } catch {
//       return url.split("/").pop().split("?")[0] || "resume.pdf";
//     }
//   };

//   // Toggle section expand
//   const toggleSection = (section) => {
//     setExpandedSections(prev => ({
//       ...prev,
//       [section]: !prev[section]
//     }));
//   };

//   /** Open one inline-edit section (shared editValue) and preload from profile */
//   const beginSectionEdit = (uiKey, field, currentValue) => {
//     setEditingSections((prev) => ({
//       ...prev,
//       about: false,
//       career_objective: false,
//       languages: false,
//       [uiKey]: true,
//     }));
//     setEditingField(field);
//     setEditValue(currentValue ?? "");
//   };

//   // Edit handlers
//   const startEditing = (field, currentValue) => {
//     setEditingField(field);
//     setEditValue(currentValue || "");
//     setEditingSections(prev => ({ ...prev, [field]: true }));
//   };

//   const cancelEdit = (field) => {
//     setEditingField(null);
//     setEditValue("");
//     const uiKey = fieldToUiSection[field] ?? field;
//     setEditingSections((prev) => ({ ...prev, [uiKey]: false }));
//   };

//   const { handleLike: apiHandleLike } = useFeedApi();

//   const handleLike = async (postId, userId) => {
//     await apiHandleLike(postId, userId);
//     if (user?.id && token) {
//       await getUserPublicProfile(user.id, token);
//     }
//   };

//   //  Updated saveEdit with Optimistic UI Updates + Real-time percentage
//   const saveEdit = async (field) => {
//     if (!user?.id || !token) return;

//     setIsSaving(true);

//     try {
//       let payload = {};

//       switch (field) {
//         case "name":
//           const parts = editValue.split(" ");
//           payload = {
//             first_name: parts[0] || "",
//             last_name: parts.slice(1).join(" ") || "",
//           };
//           break;
//         case "about_us":
//           payload = { about_us: editValue };
//           break;
//         case "career_objective":
//           payload = { career_objective: editValue };
//           break;
//         case "language":
//           payload = { language: editValue };
//           break;
//         default:
//           payload = { [field]: editValue };
//       }

//       // Update Redux store immediately for name changes
//       if (field === "name") {
//         dispatch(updateUser(payload));
//       }

//       const result = await userDetailsApi.updateUserDetails(user.id, payload, token);

//       if (result.success || result.message?.includes("updated")) {
//         await getUserPublicProfile(user.id, token);
//         await refetchCompletion?.();

//         setUploadStatus({ type: "success", message: " Updated successfully!" });
//       } else {
//         throw new Error("Update failed");
//       }

//       setEditingField(null);
//       setEditValue("");
//       const uiKey = fieldToUiSection[field] ?? field;
//       setEditingSections((prev) => ({ ...prev, [uiKey]: false }));
//     } catch (err) {
//       console.error("Save error:", err);
//       setUploadStatus({
//         type: "error",
//         message: "❌ Failed to update. Please try again.",
//       });
//     } finally {
//       setIsSaving(false);
//       setTimeout(() => setUploadStatus(null), 3000);
//     }
//   };

//   // Upload handlers
//   const handleProfileImageUpload = async () => {
//     const input = document.createElement("input");
//     input.type = "file";
//     input.accept = "image/*";
//     input.onchange = async (e) => {
//       const file = e.target.files?.[0];
//       if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return;
//       setIsUploading(true);
//       try {
//         const url = await uploadImageApi.uploadImage(file, "profile", token);
//         if (url) {
//           const res = await userDetailsApi.updateUserDetails(user.id, { user_profile_pic: url }, token);
//           if (res.message?.includes("updated")) {
//             setProfileImage(`${url}?t=${Date.now()}`);
//             await getUserPublicProfile(user.id, token);
//             dispatch(updateUser({ user_profile_pic: url }));
//             setUploadStatus({ type: "success", message: "Profile picture updated!" });
//             await refetchCompletion?.();
//           }
//         }
//       } catch (err) {
//         setUploadStatus({ type: "error", message: "Upload failed." });
//       } finally {
//         setIsUploading(false);
//         setTimeout(() => setUploadStatus(null), 3000);
//       }
//     };
//     input.click();
//   };

//   const handleUploadResume = async () => {
//     const input = document.createElement("input");
//     input.type = "file";
//     input.accept = ".pdf";
//     input.onchange = async (e) => {
//       const file = e.target.files?.[0];
//       if (!file || file.type !== "application/pdf" || file.size > 10 * 1024 * 1024) return;
//       setIsUploading(true);
//       try {
//         const url = await uploadImageApi.uploadImage(file, "resume", token);
//         if (url) {
//           const res = await userDetailsApi.updateUserDetails(user.id, { resume: url }, token);
//           if (res.message?.includes("updated")) {
//             setResumeUrl(`${url}?t=${Date.now()}`);
//             await getUserPublicProfile(user.id, token);
//             setUploadStatus({ type: "success", message: "Resume uploaded!" });
//             await refetchCompletion?.();
//           }
//         }
//       } catch (err) {
//         setUploadStatus({ type: "error", message: "Upload failed." });
//       } finally {
//         setIsUploading(false);
//         setTimeout(() => setUploadStatus(null), 3000);
//       }
//     };
//     input.click();
//   };

//   const handleEditSection = (section) => {
//     if (section === "Skills") navigate("/feed-your-skills");
//     if (section === "Work Experience") navigate("/feed-your-experience");
//     if (section === "Education") navigate("/feed-your-education");
//   };

//   const isFieldComplete = (value) => value && String(value).trim() !== "";

//   const displayCompletionPct = Math.min(
//     100,
//     Math.max(0, Math.round(Number(completionPercentage) || 0))
//   );

//   // Loading / Error
//   if (loading || hookLoading) {
//     return (
//       <MainLayout>
//         <div className="flex justify-center min-h-screen px-4 bg-gray-100">
//           <p className="flex items-center justify-center w-full">Loading...</p>
//         </div>
//       </MainLayout>
//     );
//   }

//   if (error || hookError) {
//     return (
//       <MainLayout>
//         <div className="flex justify-center min-h-screen px-4 bg-gray-100">
//           <p className="text-red-500">Error: {error || hookError}</p>
//         </div>
//       </MainLayout>
//     );
//   }

//   return (
//     <MainLayout>
//       {/*  FULL WIDTH CONTAINER */}
//       <div className="flex flex-col min-h-screen bg-gray-100">

//         {/* Main Content - Full Width */}
//         <section className="w-full px-4 py-6 mx-auto">
//           <div className="w-full mx-auto bg-white rounded-[10px] shadow-lg">

//             {/* Settings Icon */}
//             <FaCog
//               onClick={() => navigate("/student-profile")}
//               className="absolute z-10 w-5 h-5 text-gray-500 cursor-pointer top-5 right-5 hover:text-blue-600"
//               title="Settings"
//             />

//             {/* Profile Header - Full Width */}
//             <div className="flex flex-col items-center p-6 bg-gradient-to-b from-white to-gray-50 border-b border-gray-200 rounded-t-[10px]">
//               <div className="relative group">
//                 <div className="w-20 h-20 overflow-hidden transition-shadow border-4 border-gray-200 rounded-full sm:w-24 sm:h-24 hover:shadow-lg">
//                   <img
//                     src={profileImage ? getImageUrl(profileImage) : dummyProfile3}
//                     alt="Profile"
//                     className="object-cover w-full h-full"
//                   />
//                 </div>
//                 <FaCamera
//                   onClick={handleProfileImageUpload}
//                   className="absolute w-5 h-5 p-1 text-blue-600 transition-opacity bg-white rounded-full shadow-md opacity-0 cursor-pointer group-hover:opacity-100"
//                   style={{ bottom: "2px", right: "2px" }}
//                   title="Change profile picture"
//                 />
//                 <FaLink
//                   onClick={() => copyToClipboard(publicProfileUrl)}
//                   className="absolute w-4 h-4 p-1 text-blue-600 transition-opacity bg-white rounded-full opacity-0 cursor-pointer hover:text-blue-800 group-hover:opacity-100"
//                   style={{ bottom: "2px", left: "2px" }}
//                   title="Copy public profile link"
//                 />
//               </div>

//               {editingField === "name" ? (
//                 <div className="flex flex-col items-center mt-4">
//                   <input
//                     type="text"
//                     value={editValue}
//                     onChange={(e) => setEditValue(e.target.value)}
//                     className="text-xl font-bold text-center text-gray-900 border-b border-gray-300 sm:text-2xl focus:outline-none focus:border-blue-500"
//                     autoFocus
//                   />
//                   <div className="flex gap-2 mt-2">
//                     <button
//                       className="text-sm font-medium text-green-600 hover:text-green-800 disabled:opacity-50"
//                       onClick={() => saveEdit("name")}
//                       disabled={isSaving}
//                     >
//                       {isSaving ? "Saving..." : "Save"}
//                     </button>
//                     <button
//                       className="text-sm font-medium text-gray-500 hover:text-gray-700"
//                       onClick={() => cancelEdit("name")}
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex flex-col items-center">
//                   <h1
//                     className="mt-4 text-xl font-bold text-gray-900 transition-colors cursor-pointer sm:text-2xl hover:text-blue-600"
//                     onClick={() =>
//                       startEditing("name", `${profile?.first_name || ""} ${profile?.last_name || ""}`)
//                     }
//                     title="Click to edit name"
//                   >
//                     {profile?.first_name} {profile?.last_name}
//                   </h1>
//                   <p className="text-sm text-gray-500">@{profile?.email?.split("@")[0] || "user"}</p>
//                 </div>
//               )}

//               {/*  Overall Profile Completion - Full Width Bar (Enhanced) */}
//               <div className="w-full pt-4 mt-5 border-t border-gray-100">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-sm font-medium text-gray-700">Profile Completion</span>
//                   <span className="text-sm font-semibold text-blue-600">
//                     {completionLoading ? "…" : `${displayCompletionPct}%`}
//                   </span>
//                 </div>
//                 <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
//                   <div
//                     className={`h-full rounded-full transition-all duration-500 ease-out ${
//                       displayCompletionPct === 100
//                         ? 'bg-gradient-to-r from-green-400 to-green-500' 
//                         : 'bg-gradient-to-r from-blue-500 to-blue-600'
//                     }`}
//                     style={{ width: `${completionLoading ? 0 : displayCompletionPct}%` }}
//                   />
//                 </div>
//                 {!completionLoading && displayCompletionPct < 100 && (
//                   <p className="flex items-center gap-1 mt-2 text-xs text-gray-500">
//                     <span className="inline-block w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse"></span>
//                     Complete your profile to stand out!
//                   </p>
//                 )}
//                 {!completionLoading && displayCompletionPct === 100 && (
//                   <p className="flex items-center gap-1 mt-2 text-xs font-medium text-green-600">
//                     <FaCheckCircle size={12} /> Profile complete! 🎉
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/*  Upload Status Toast - Enhanced with auto-dismiss */}
//             {uploadStatus && (
//               <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in ${
//                 uploadStatus.type === "success" 
//                   ? "bg-green-500 text-white" 
//                   : "bg-red-500 text-white"
//               }`}>
//                 {uploadStatus.type === "success" ? <FaCheckCircle /> : <span>⚠️</span>}
//                 <span className="text-sm font-medium">{uploadStatus.message}</span>
//               </div>
//             )}

//             {/* ===== SECTIONS CONTAINER - Full Width ===== */}
//             <div className="p-4 space-y-4">

//               {/* ABOUT */}
//               <CollapsibleSection
//                 title="About"
//                 weight={100}
//                 score={
//                   editingSections.about
//                     ? calculateFieldScore("about_us", editValue)
//                     : calculateFieldScore("about_us", profile?.about_us)
//                 }
//                 isExpanded={expandedSections.about}
//                 onToggle={() => toggleSection('about')}
//                 showEditControls={true}
//                 isEditing={editingSections.about}
//                 onEditClick={() =>
//                   beginSectionEdit("about", "about_us", profile?.about_us)
//                 }
//                 onSaveClick={() => saveEdit("about_us")}
//                 onCancelClick={() => cancelEdit("about_us")}
//                 isSaving={isSaving && editingField === "about_us"}
//               >
//                 <FieldRow
//                   label="About Me"
//                   value={profile?.about_us}
//                   isVerified={isFieldComplete(profile?.about_us)}
//                   isEditable={editingSections.about}
//                   editValue={editValue}
//                   onChange={(val) => setEditValue(val)}
//                   type="textarea"
//                   rows={4}
//                   placeholder="Tell us about yourself..."
//                 />
//               </CollapsibleSection>

//               {/* CAREER OBJECTIVE */}
//               <CollapsibleSection
//                 title="Career Objective"
//                 weight={100}
//                 score={
//                   editingSections.career_objective
//                     ? calculateFieldScore("career_objective", editValue)
//                     : calculateFieldScore("career_objective", profile?.career_objective)
//                 }
//                 isExpanded={expandedSections.career_objective}
//                 onToggle={() => toggleSection('career_objective')}
//                 showEditControls={true}
//                 isEditing={editingSections.career_objective}
//                 onEditClick={() =>
//                   beginSectionEdit(
//                     "career_objective",
//                     "career_objective",
//                     profile?.career_objective
//                   )
//                 }
//                 onSaveClick={() => saveEdit("career_objective")}
//                 onCancelClick={() => cancelEdit("career_objective")}
//                 isSaving={isSaving && editingField === "career_objective"}
//               >
//                 <FieldRow
//                   label="Career Objective"
//                   value={profile?.career_objective}
//                   isVerified={isFieldComplete(profile?.career_objective)}
//                   isEditable={editingSections.career_objective}
//                   editValue={editValue}
//                   onChange={(val) => setEditValue(val)}
//                   type="textarea"
//                   rows={3}
//                   placeholder="What are your career goals?"
//                 />
//               </CollapsibleSection>

//               {/* RESUME */}
//               <CollapsibleSection
//                 title="Resume"
//                 weight={100}
//                 score={
//                   apiSectionPct.resume ??
//                   (resumeUrl || profile?.resume
//                     ? 100
//                     : calculateFieldScore("resume", profile?.resume))
//                 }
//                 isExpanded={expandedSections.resume}
//                 onToggle={() => toggleSection('resume')}
//                 showEditControls={false}
//               >
//                 <div className="py-3">
//                   <div className="flex items-center gap-2 mb-2">
//                     <span className="text-sm font-medium text-gray-700">Resume File</span>
//                     {resumeUrl && <FaCheckCircle className="text-green-500" size={14} />}
//                   </div>
//                   {resumeUrl ? (
//                     <div className="flex flex-wrap items-center gap-3">
//                       <span className="text-sm text-gray-600 truncate max-w-[200px]">{getFileNameFromUrl(resumeUrl)}</span>
//                       <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-green-600 hover:text-green-800">View</a>
//                       <button className="text-sm text-blue-600 hover:text-blue-800" onClick={handleUploadResume} disabled={isUploading}>Replace</button>
//                     </div>
//                   ) : (
//                     <div>
//                       <p className="mb-2 text-sm text-gray-500">No resume uploaded yet</p>
//                       <button className="text-sm text-blue-600 hover:text-blue-800" onClick={handleUploadResume} disabled={isUploading}>
//                         {isUploading ? "Uploading..." : "Upload Resume"}
//                       </button>
//                     </div>
//                   )}
//                   <div className="mt-3">
//                     <button className="text-sm text-blue-600 hover:text-blue-800" onClick={() => navigate("/resume-template-selector")}>
//                       Manage Resume Templates →
//                     </button>
//                   </div>
//                 </div>
//               </CollapsibleSection>

//               {/* SKILLS */}
//               <CollapsibleSection
//                 title="Experience-Skills"
//                 weight={100}
//                 score={
//                   apiSectionPct.skills ??
//                   calculateFieldScore("skills", null, skillsData)
//                 }
//                 isExpanded={expandedSections.skills}
//                 onToggle={() => toggleSection('skills')}
//                 showEditControls={true}
//                 isEditing={false}
//                 onEditClick={() => handleEditSection("Skills")}
//               >
//                 {skillsData?.length > 0 ? (
//                   <div className="grid gap-3 md:grid-cols-2">
//                     {skillsData.map((org) => (
//                       <div key={org.id} className="flex gap-3 p-3 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50">
//                         <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 overflow-hidden bg-gray-100 rounded-full">
//                           {org.logo ? (
//                             <img src={getImageUrl(org.logo) || websiteLogo} alt={org.organization} className="object-contain w-8 h-8" />
//                           ) : (
//                             <span className="text-xs font-medium text-gray-500">{org.organization.charAt(0)}</span>
//                           )}
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <h4 className="font-medium text-gray-900">{org.organization}</h4>
//                           <p className="mb-1 text-sm text-gray-500">{formatDateRange(org.start_date, org.end_date)}</p>
//                           <p className="text-sm text-gray-700">{org.skills}</p>
//                           {org.hasCertificate && org.certificateUrl && (
//                             <a href={getImageUrl(org.certificateUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-1 text-sm text-blue-600 hover:underline">
//                               📄 View Certificate
//                             </a>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="py-2 text-sm text-gray-500">No skills added yet</p>
//                 )}
//               </CollapsibleSection>

//               {/* WORK EXPERIENCE */}
//               {/* {profile?.user_type !== "School Student" && profile?.user_type !== "College Student" && (
//                 <CollapsibleSection
//                   title="Work Experience"
//                   weight={100}
//                   score={localSectionCompletion?.work_experience ?? sectionCompletion?.work_experience ?? calculateFieldScore('work_experience', null, workExperiences)}
//                   isExpanded={expandedSections.work_experience}
//                   onToggle={() => toggleSection('work_experience')}
//                   showEditControls={true}
//                   isEditing={false}
//                   onEditClick={() => handleEditSection("Work Experience")}
//                 >
//                   {workExperiences?.length > 0 ? (
//                     <div className="grid gap-3 md:grid-cols-2">
//                       {workExperiences.map((exp) => (
//                         <div key={exp.id} className="flex gap-3 p-3 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50">
//                           <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 overflow-hidden bg-gray-100 rounded-full">
//                             {exp.logo ? (
//                               <img src={getImageUrl(exp.logo) || websiteLogo} alt={exp.company} className="object-contain w-8 h-8" />
//                             ) : (
//                               <span className="text-xs font-medium text-gray-500">{exp.company.charAt(0)}</span>
//                             )}
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <h4 className="font-medium text-gray-900">{exp.position}</h4>
//                             <p className="text-sm text-gray-600">{exp.company}</p>
//                             <p className="text-sm text-gray-500">{exp.duration}</p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <p className="py-2 text-sm text-gray-500">No work experience added yet</p>
//                   )}
//                 </CollapsibleSection>
//               )} */}

//               {/* EDUCATION */}
//               <CollapsibleSection
//                 title="Education"
//                 weight={100}
//                 score={
//                   apiSectionPct.education ??
//                   calculateFieldScore("education", null, educationData)
//                 }
//                 isExpanded={expandedSections.education}
//                 onToggle={() => toggleSection('education')}
//                 showEditControls={true}
//                 isEditing={false}
//                 onEditClick={() => handleEditSection("Education")}
//               >
//                 {educationData?.length > 0 ? (
//                   <div className="grid gap-3 md:grid-cols-2">
//                     {educationData.map((edu) => (
//                       <div key={edu.id} className="flex gap-3 p-3 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50">
//                         <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 overflow-hidden bg-gray-100 rounded-full">
//                           {edu.logo ? (
//                             <img src={getImageUrl(edu.logo) || websiteLogo} alt={edu.institution} className="object-contain w-8 h-8" />
//                           ) : (
//                             <span className="text-xs font-medium text-gray-500">{edu.institution.charAt(0)}</span>
//                           )}
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <h4 className="font-medium text-gray-900">{edu.degree}</h4>
//                           <p className="text-sm text-gray-600">{edu.institution}</p>
//                           <p className="text-sm text-gray-500">{edu.duration}</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="py-2 text-sm text-gray-500">No education details added yet</p>
//                 )}
//               </CollapsibleSection>

//               {/* LANGUAGES */}
//               <CollapsibleSection
//                 title="Languages you know"
//                 weight={100}
//                 score={
//                   editingSections.languages
//                     ? calculateFieldScore("language", editValue)
//                     : apiSectionPct.languages ??
//                       calculateFieldScore("language", profile?.language)
//                 }
//                 isExpanded={expandedSections.languages}
//                 onToggle={() => toggleSection('languages')}
//                 showEditControls={true}
//                 isEditing={editingSections.languages}
//                 onEditClick={() =>
//                   beginSectionEdit("languages", "language", profile?.language)
//                 }
//                 onSaveClick={() => saveEdit("language")}
//                 onCancelClick={() => cancelEdit("language")}
//                 isSaving={isSaving && editingField === "language"}
//               >
//                 <FieldRow
//                   label="Languages"
//                   value={profile?.language}
//                   isVerified={isFieldComplete(profile?.language)}
//                   isEditable={editingSections.languages}
//                   editValue={editValue}
//                   onChange={(val) => setEditValue(val)}
//                   isTagList={true}
//                   placeholder="e.g., English, Hindi, Spanish"
//                 />
//               </CollapsibleSection>

//               {/* AUTHENTICATION */}
//               <CollapsibleSection
//                 title="Authentication"
//                 weight={100}
//                 score={
//                   apiSectionPct.authentication ??
//                   (profile?.is_email_verified ? 33 : 0) +
//                     (profile?.is_phone_verified ? 33 : 0) +
//                     (profile?.is_aadhaar_verified ? 34 : 0)
//                 }
//                 isExpanded={expandedSections.authentication}
//                 onToggle={() => toggleSection('authentication')}
//                 showEditControls={false}
//               >
//                 <div className="space-y-1">
//                   <FieldRow label="Email Verification" value={profile?.is_email_verified ? "Verified" : "Not Verified"} isVerified={profile?.is_email_verified} isEditable={false} />
//                   <FieldRow label="Phone Verification" value={profile?.is_phone_verified ? "Verified" : "Not Verified"} isVerified={profile?.is_phone_verified} isEditable={false} />
//                   <FieldRow label="Aadhaar Verification" value={profile?.is_aadhaar_verified ? "Verified" : "Not Verified"} isVerified={profile?.is_aadhaar_verified} isEditable={false} />
//                   <div className="p-3 mt-2 text-sm text-gray-500 rounded bg-gray-50">
//                     <p>Complete verification to unlock all features and increase your profile visibility.</p>
//                     <button className="mt-2 font-medium text-blue-600 hover:text-blue-800">Get Verified →</button>
//                   </div>
//                 </div>
//               </CollapsibleSection>

//             </div>
//           </div>
//         </section>

//       </div>
      
//       {/*  CSS Animation for Toast */}
//       <style>{`
//         @keyframes slideIn {
//           from {
//             transform: translateX(100%);
//             opacity: 0;
//           }
//           to {
//             transform: translateX(0);
//             opacity: 1;
//           }
//         }
//         .animate-slide-in {
//           animation: slideIn 0.3s ease-out;
//         }
//       `}</style>
//     </MainLayout>
//   );
// };

// export default FeedView;



















// import React, { useState, useEffect, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
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
//   FaCog,
//   FaCheckCircle,
//   FaChevronUp,
//   FaChevronDown,
//   FaCamera,
//   FaLink
// } from "react-icons/fa";
// import {
//   ChevronRight,
//   User,
//   FileText,
//   Bell,
//   Settings,
//   LogOut,
//   Mail,
//   Lock,
//   Trash2,
//   HelpCircle,
//   Shield,
// } from "lucide-react";
// import { HiOutlineEye } from "react-icons/hi";
// import FeedRightSidebar from "../feed/FeedRightSidebar";
// import MainLayout from "../../../components/layout/MainLayout";
// import { useDispatch, useSelector } from "react-redux";
// import { logout } from "../../../redux/feature/authSlice";
// import softDeleteAccount from "../../../api/feedApi";
// import { userDetailsApi } from "../../../api/userDetailsApi";
// import { getImageUrl } from "../../../../utils.js";
// import dummyProfile3 from "../../../assets/dummyProfile3.jpg";
// import { updateUser } from "../../../redux/feature/authSlice";
// import { useUserDetailsApi } from "../../../hooks/useUserDetailsApi";
// import useFeedApi from "../../../hooks/useFeedApi";
// import websiteLogo from "../../../assets/WebsiteLogo.svg";
// import { useProfileCompletion } from "../../../hooks/useProfileCompletion";
// import UserIdentityBadge from "../../../components/jobs/UserIdentityBadge.jsx"; 
// import ProfileName from "../../../components/jobs/ProfileName.jsx"
// import SaveTextButton from "../../../components/jobs/SaveTextButton.jsx"; 
// import EditTextButton from "../../../components/jobs/EditTextButton.jsx"; 
// import CancelTextButton from "../../../components/jobs/CancelTextButton.jsx"; 
// import CollapseToggleButton from "../../../components/jobs/CollapseToggleButton.jsx";
// import CollapsibleSectionHeader from "../../../components/jobs/CollapsibleSectionHeader.jsx";

// //  Reusable CollapsibleSection
// const CollapsibleSection = ({ title, weight, score, children, isExpanded, onToggle, showEditControls, onEditClick, onSaveClick, onCancelClick, isEditing, isSaving }) => {
//   const percentage = Math.min(100, Math.round((score / weight) * 100));
//   const isComplete = percentage === 100;
//   return (
//     <div className="overflow-hidden bg-white shadow-sm rounded-xl">
//       <div
//         className="flex items-center justify-between p-4 transition-colors cursor-pointer hover:bg-gray-50"
//         onClick={onToggle}
//       >
//         <div className="flex items-center gap-3">
//           <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
//           {isComplete && <FaCheckCircle className="text-[#1DB32F]" size={18} />}
//         </div>
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-2">
//             <div className={`w-24 h-2 rounded-full ${isComplete ? 'bg-[#1DB32F]/20' : 'bg-[#9bc87c]/20'}`}>
//               <div
//                 className={`h-full rounded-full transition-all ${isComplete ? 'bg-[#1DB32F]' : 'bg-[#9bc87c]'}`}
//                 style={{ width: `${percentage}%` }}
//               />
//             </div>
//             <span className={`text-sm font-medium ${isComplete ? 'text-[#1DB32F]' : 'text-[#9bc87c]'}`}>
//               {percentage}%
//             </span>
//           </div>
//           <div className="flex items-center gap-2">
//             {showEditControls && (
//               isEditing ? (
//                 <>
                  
//                   <SaveTextButton
//   onClick={(e) => { 
//     e.stopPropagation(); 
//     onSaveClick(); 
//   }}
//   loading={isSaving}
// />
//                   {/* <button
//                     onClick={(e) => { e.stopPropagation(); onCancelClick(); }}
//                     className="text-sm font-medium text-gray-500 hover:text-gray-700"
//                   >
//                     Cancel
//                   </button> */}

//                   <CancelTextButton
//   onClick={(e) => { 
//     e.stopPropagation(); 
//     onCancelClick(); 
//   }}
// />
//                 </>
//               ) : (
//                 // <button
//                 //   onClick={(e) => { e.stopPropagation(); onEditClick(); }}
//                 //   className="text-sm font-medium text-[#9bc87c] hover:text-[#8ab76b]"
//                 // >
//                 //   Edit
//                 // </button>
//                 <EditTextButton
//   onClick={(e) => { 
//     e.stopPropagation(); 
//     onEditClick(); 
//   }}
// />
//               )
//             )}
          
// <CollapseToggleButton 
//   expanded={isExpanded} 
  
// />
//           </div>
//         </div>
//       </div>
//       {isExpanded && (
//         <div className="px-4 pb-4 border-t border-gray-200">
//           {children}
//         </div>
//       )}
//     </div>
//   );
// };

// //  Reusable FieldRow
// const FieldRow = ({ label, value, isVerified = false, isEditable = false, editValue, onChange, type = "text", placeholder = "", rows = 1, children, isTagList = false }) => {
//   return (
//     <div className="py-3 border-b border-gray-200 last:border-0">
//       <div className="flex items-start justify-between">
//         <div className="flex-1">
//           <div className="flex items-center gap-2 mb-1">
//             <span className="text-sm font-medium text-gray-700">{label}</span>
//             {isVerified && <FaCheckCircle className="text-[#1DB32F]" size={14} />}
//           </div>
//           {isEditable ? (
//             isTagList ? (
//               <input
//                 type="text"
//                 value={editValue || ""}
//                 onChange={(e) => onChange(e.target.value)}
//                 className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#9bc87c]"
//                 placeholder={placeholder}
//               />
//             ) : type === "textarea" ? (
//               <textarea
//                 value={editValue || ""}
//                 onChange={(e) => onChange(e.target.value)}
//                 className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#9bc87c]"
//                 rows={rows}
//                 placeholder={placeholder}
//               />
//             ) : (
//               <input
//                 type={type}
//                 value={editValue || ""}
//                 onChange={(e) => onChange(e.target.value)}
//                 className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#9bc87c]"
//                 placeholder={placeholder}
//               />
//             )
//           ) : isTagList && value ? (
//             <div className="flex flex-wrap gap-2">
//               {value.split(",").map((tag, i) => (
//                 <span key={i} className="flex items-center gap-1 text-sm text-gray-700">
//                   <span className="w-2 h-2 bg-[#1DB32F] rounded-full"></span>
//                   {tag.trim()}
//                 </span>
//               ))}
//             </div>
//           ) : (
//             <p className="text-sm text-gray-600 whitespace-pre-wrap">
//               {value || <span className="text-gray-400">Not provided</span>}
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// /** Map server breakdown (weighted scores) to 0–100% per feed section bar */
// function breakdownToFeedSectionPct(breakdown) {
//   if (!breakdown || typeof breakdown !== "object") return {};
//   const pct = (name) => {
//     const s = breakdown[name];
//     if (!s || s.not_applicable || !s.weight) return undefined;
//     return Math.min(100, Math.round((s.score / s.weight) * 100));
//   };
//   const out = {
//     education: pct("education"),
//     skills: pct("skills"),
//     resume: pct("resume"),
//     work_experience: pct("experience"),
//     languages: pct("languages"),
//   };
//   const v = breakdown.verification;
//   const d = breakdown.document_verification;
//   let num = 0;
//   let den = 0;
//   if (v?.weight) {
//     num += v.score;
//     den += v.weight;
//   }
//   if (d?.weight && !d.not_applicable) {
//     num += d.score;
//     den += d.weight;
//   }
//   if (den > 0) out.authentication = Math.round((num / den) * 100);
//   return out;
// }

// const FeedView = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { user, token } = useSelector((state) => state.auth);

//   // Upload states
//   const [profileImage, setProfileImage] = useState(null);
//   const [resumeUrl, setResumeUrl] = useState(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadStatus, setUploadStatus] = useState(null);

//   // Edit states
//   const [editingField, setEditingField] = useState(null);
//   const [editValue, setEditValue] = useState("");
//   const [isSaving, setIsSaving] = useState(false);

//   // Section expand/edit states
//   const [expandedSections, setExpandedSections] = useState({
//     about: false,
//     career_objective: false,
//     skills: false,
//     work_experience: false,
//     education: false,
//     languages: false,
//     authentication: false,
//     activity: false,
//     resume: false
//   });
//   const [editingSections, setEditingSections] = useState({});

//   // Hook data
//   const {
//     profile,
//     userActivity,
//     workExperiences,
//     educationData,
//     skillsData,
//     loading: hookLoading,
//     error: hookError,
//     getUserPublicProfile,
//   } = useUserDetailsApi();

//   const {
//     percentage: completionPercentage,
//     breakdown: completionBreakdown,
//     loading: completionLoading,
//     error: completionError,
//     refetch: refetchCompletion,
//   } = useProfileCompletion(true);

//   const apiSectionPct = useMemo(
//     () => breakdownToFeedSectionPct(completionBreakdown),
//     [completionBreakdown]
//   );

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const publicProfileUrl = profile?.uuid
//     ? `${window.location.origin}/public-profile/${profile.uuid}`
//     : "";

//   //  Helper: Calculate section score based on field value (REAL-TIME)
//   const calculateFieldScore = (field, value, sectionData = null) => {
//     const trimmedValue = value?.toString().trim();
//     const hasValue = trimmedValue && trimmedValue.length > 0;
    
//     switch(field) {
//       case 'about_us':
//       case 'career_objective':
//       case 'language':
//         return hasValue ? 100 : 0;
//       case 'skills':
//         return (sectionData?.length > 0) ? 100 : 0;
//       case 'work_experience':
//       case 'education':
//         return (sectionData?.length > 0) ? 100 : 0;
//       case 'resume':
//         return hasValue ? 100 : 0;
//       case 'authentication':
//         let score = 0;
//         if (profile?.is_email_verified) score += 33;
//         if (profile?.is_phone_verified) score += 33;
//         if (profile?.is_aadhaar_verified) score += 34;
//         return score;
//       default:
//         return hasValue ? 100 : 0;
//     }
//   };

//   /** CollapsibleSection state keys (UI) ↔ save field names (API) */
//   const fieldToUiSection = {
//     about_us: "about",
//     career_objective: "career_objective",
//     language: "languages",
//   };

//   // Sync profile image & resume from hook
//   useEffect(() => {
//     if (profile) {
//       setProfileImage(profile.user_profile_pic || null);
//       setResumeUrl(profile.resume || null);
//     }
//   }, [profile]);

//   // Fetch profile
//   useEffect(() => {
//     if (!token || !user?.id) return;
//     const fetchProfile = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         await getUserPublicProfile(user.id, token);
//       } catch (err) {
//         setError("Failed to load profile.");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchProfile();
//   }, [token, user?.id, getUserPublicProfile]);

//   // Helpers
//   const formatDateRange = (start, end) => {
//     const format = (dateStr) => {
//       if (!dateStr) return "Present";
//       const [year, month] = dateStr.split("-");
//       const date = new Date(year, month - 1);
//       return date.toLocaleString("default", {
//         month: "short",
//         year: "numeric",
//       });
//     };
//     return `${format(start)} – ${format(end || null)}`;
//   };

//   const getFileNameFromUrl = (url) => {
//     if (!url) return "resume.pdf";
//     try {
//       return (
//         new URL(url).pathname.split("/").pop().split("?")[0] || "resume.pdf"
//       );
//     } catch {
//       return url.split("/").pop().split("?")[0] || "resume.pdf";
//     }
//   };

//   // Toggle section expand
//   const toggleSection = (section) => {
//     setExpandedSections(prev => ({
//       ...prev,
//       [section]: !prev[section]
//     }));
//   };

//   /** Open one inline-edit section (shared editValue) and preload from profile */
//   const beginSectionEdit = (uiKey, field, currentValue) => {
//     setEditingSections((prev) => ({
//       ...prev,
//       about: false,
//       career_objective: false,
//       languages: false,
//       [uiKey]: true,
//     }));
//     setEditingField(field);
//     setEditValue(currentValue ?? "");
//   };

//   // Edit handlers
//   const startEditing = (field, currentValue) => {
//     setEditingField(field);
//     setEditValue(currentValue || "");
//     setEditingSections(prev => ({ ...prev, [field]: true }));
//   };

//   const cancelEdit = (field) => {
//     setEditingField(null);
//     setEditValue("");
//     const uiKey = fieldToUiSection[field] ?? field;
//     setEditingSections((prev) => ({ ...prev, [uiKey]: false }));
//   };

//   const { handleLike: apiHandleLike } = useFeedApi();

//   const handleLike = async (postId, userId) => {
//     await apiHandleLike(postId, userId);
//     if (user?.id && token) {
//       await getUserPublicProfile(user.id, token);
//     }
//   };

//   //  Updated saveEdit with Optimistic UI Updates + Real-time percentage
//   const saveEdit = async (field) => {
//     if (!user?.id || !token) return;

//     setIsSaving(true);

//     try {
//       let payload = {};

//       switch (field) {
//         case "name":
//           const parts = editValue.split(" ");
//           payload = {
//             first_name: parts[0] || "",
//             last_name: parts.slice(1).join(" ") || "",
//           };
//           break;
//         case "about_us":
//           payload = { about_us: editValue };
//           break;
//         case "career_objective":
//           payload = { career_objective: editValue };
//           break;
//         case "language":
//           payload = { language: editValue };
//           break;
//         default:
//           payload = { [field]: editValue };
//       }

//       // Update Redux store immediately for name changes
//       if (field === "name") {
//         dispatch(updateUser(payload));
//       }

//       const result = await userDetailsApi.updateUserDetails(user.id, payload, token);

//       if (result.success || result.message?.includes("updated")) {
//         await getUserPublicProfile(user.id, token);
//         await refetchCompletion?.();

//         setUploadStatus({ type: "success", message: " Updated successfully!" });
//       } else {
//         throw new Error("Update failed");
//       }

//       setEditingField(null);
//       setEditValue("");
//       const uiKey = fieldToUiSection[field] ?? field;
//       setEditingSections((prev) => ({ ...prev, [uiKey]: false }));
//     } catch (err) {
//       console.error("Save error:", err);
//       setUploadStatus({
//         type: "error",
//         message: "❌ Failed to update. Please try again.",
//       });
//     } finally {
//       setIsSaving(false);
//       setTimeout(() => setUploadStatus(null), 3000);
//     }
//   };

//   // Upload handlers
//   const handleProfileImageUpload = async () => {
//     const input = document.createElement("input");
//     input.type = "file";
//     input.accept = "image/*";
//     input.onchange = async (e) => {
//       const file = e.target.files?.[0];
//       if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return;
//       setIsUploading(true);
//       try {
//         const url = await uploadImageApi.uploadImage(file, "profile", token);
//         if (url) {
//           const res = await userDetailsApi.updateUserDetails(user.id, { user_profile_pic: url }, token);
//           if (res.message?.includes("updated")) {
//             setProfileImage(`${url}?t=${Date.now()}`);
//             await getUserPublicProfile(user.id, token);
//             dispatch(updateUser({ user_profile_pic: url }));
//             setUploadStatus({ type: "success", message: "Profile picture updated!" });
//             await refetchCompletion?.();
//           }
//         }
//       } catch (err) {
//         setUploadStatus({ type: "error", message: "Upload failed." });
//       } finally {
//         setIsUploading(false);
//         setTimeout(() => setUploadStatus(null), 3000);
//       }
//     };
//     input.click();
//   };

//   const handleUploadResume = async () => {
//     const input = document.createElement("input");
//     input.type = "file";
//     input.accept = ".pdf";
//     input.onchange = async (e) => {
//       const file = e.target.files?.[0];
//       if (!file || file.type !== "application/pdf" || file.size > 10 * 1024 * 1024) return;
//       setIsUploading(true);
//       try {
//         const url = await uploadImageApi.uploadImage(file, "resume", token);
//         if (url) {
//           const res = await userDetailsApi.updateUserDetails(user.id, { resume: url }, token);
//           if (res.message?.includes("updated")) {
//             setResumeUrl(`${url}?t=${Date.now()}`);
//             await getUserPublicProfile(user.id, token);
//             setUploadStatus({ type: "success", message: "Resume uploaded!" });
//             await refetchCompletion?.();
//           }
//         }
//       } catch (err) {
//         setUploadStatus({ type: "error", message: "Upload failed." });
//       } finally {
//         setIsUploading(false);
//         setTimeout(() => setUploadStatus(null), 3000);
//       }
//     };
//     input.click();
//   };

//   const handleEditSection = (section) => {
//     if (section === "Skills") navigate("/feed-your-skills");
//     if (section === "Work Experience") navigate("/feed-your-experience");
//     if (section === "Education") navigate("/feed-your-education");
//   };

//   const isFieldComplete = (value) => value && String(value).trim() !== "";

//   const displayCompletionPct = Math.min(
//     100,
//     Math.max(0, Math.round(Number(completionPercentage) || 0))
//   );

//   // Loading / Error
//   if (loading || hookLoading) {
//     return (
//       <MainLayout>
//         <div className="flex justify-center min-h-screen px-4 bg-gray-100">
//           <p className="flex items-center justify-center w-full">Loading...</p>
//         </div>
//       </MainLayout>
//     );
//   }

//   if (error || hookError) {
//     return (
//       <MainLayout>
//         <div className="flex justify-center min-h-screen px-4 bg-gray-100">
//           <p className="text-red-500">Error: {error || hookError}</p>
//         </div>
//       </MainLayout>
//     );
//   }

//   return (
//     <MainLayout>
//       {/* FULL WIDTH CONTAINER */}
//       <div className="flex flex-col min-h-screen bg-gray-100">

//         {/* Main Content - Full Width */}
//         <section className="w-full px-4 py-6 mx-auto">
//           <div className="w-full mx-auto bg-white rounded-[10px] shadow-lg">

//             {/* Settings Icon */}
//             <FaCog
//               onClick={() => navigate("/student-profile")}
//               className="absolute z-10 w-5 h-5 text-gray-500 cursor-pointer top-5 right-5 hover:text-[#9bc87c]"
//               title="Settings"
//             />

//             {/* Profile Header - Full Width */}
//             <div className="flex flex-col items-center p-6 bg-gradient-to-b from-white to-gray-50 border-b border-gray-200 rounded-t-[10px]">
//               <div className="relative group">
//                 <div className="w-20 h-20 overflow-hidden transition-shadow border-4 border-gray-200 rounded-full sm:w-24 sm:h-24 hover:shadow-lg">
//                   <img
//                     src={profileImage ? getImageUrl(profileImage) : dummyProfile3}
//                     alt="Profile"
//                     className="object-cover w-full h-full"
//                   />
//                 </div>
//                 <FaCamera
//                   onClick={handleProfileImageUpload}
//                   className="absolute w-5 h-5 p-1 text-[#9bc87c] transition-opacity bg-white rounded-full shadow-md opacity-0 cursor-pointer group-hover:opacity-100"
//                   style={{ bottom: "2px", right: "2px" }}
//                   title="Change profile picture"
//                 />
//                 <FaLink
//                   onClick={() => copyToClipboard(publicProfileUrl)}
//                   className="absolute w-4 h-4 p-1 text-[#9bc87c] transition-opacity bg-white rounded-full opacity-0 cursor-pointer hover:text-[#8ab76b] group-hover:opacity-100"
//                   style={{ bottom: "2px", left: "2px" }}
//                   title="Copy public profile link"
//                 />
//               </div>

//               {editingField === "name" ? (
//                 <div className="flex flex-col items-center mt-4">
//                   <input
//                     type="text"
//                     value={editValue}
//                     onChange={(e) => setEditValue(e.target.value)}
//                     className="text-xl font-bold text-center text-gray-900 border-b border-gray-300 sm:text-2xl focus:outline-none focus:border-[#9bc87c]"
//                     autoFocus
//                   />
//                   <div className="flex gap-2 mt-2">
//                     <button
//                       className="text-sm font-medium text-[#1DB32F] hover:text-[#189b27] disabled:opacity-50"
//                       onClick={() => saveEdit("name")}
//                       disabled={isSaving}
//                     >
//                       {isSaving ? "Saving..." : "Save"}
//                     </button>
//                     <button
//                       className="text-sm font-medium text-gray-500 hover:text-gray-700"
//                       onClick={() => cancelEdit("name")}
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex flex-col items-center">
//                   {/* <h1
//                     className="mt-4 text-xl font-bold text-gray-900 transition-colors cursor-pointer sm:text-2xl hover:text-[#9bc87c]"
//                     onClick={() =>
//                       startEditing("name", `${profile?.first_name || ""} ${profile?.last_name || ""}`)
//                     }
//                     title="Click to edit name"
//                   >
//                     {profile?.first_name} {profile?.last_name}
//                   </h1> */}

//                   <div 
//   onClick={() => startEditing("name", `${profile?.first_name || ""} ${profile?.last_name || ""}`)}
//   title="Click to edit name"
//   className="mt-4 cursor-pointer transition-opacity hover:opacity-80"
// >
//   <ProfileName 
//     name={`${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "User Name"} 
//   />
// </div>
//                   {/* <p className="text-sm text-gray-500">@{profile?.email?.split("@")[0] || "user"}</p> */}
//                   <UserIdentityBadge 
//   roleLabel={user?.user_role || "STUDENT"} 
//   handle={`@${profile?.email?.split("@")[0] || "user"}`}
//   className="mt-2"
// />
//                 </div>
//               )}

//               {/* Overall Profile Completion - Full Width Bar (Enhanced) */}
//               <div className="w-full pt-4 mt-5 border-t border-gray-100">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="text-sm font-medium text-gray-700">Profile Completion</span>
//                   <span className="text-sm font-semibold text-[#9bc87c]">
//                     {completionLoading ? "…" : `${displayCompletionPct}%`}
//                   </span>
//                 </div>
//                 <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
//                   <div
//                     className={`h-full rounded-full transition-all duration-500 ease-out ${
//                       displayCompletionPct === 100
//                         ? 'bg-gradient-to-r from-[#1DB32F] to-[#189b27]' 
//                         : 'bg-gradient-to-r from-[#9bc87c] to-[#8ab76b]'
//                     }`}
//                     style={{ width: `${completionLoading ? 0 : displayCompletionPct}%` }}
//                   />
//                 </div>
//                 {!completionLoading && displayCompletionPct < 100 && (
//                   <p className="flex items-center gap-1 mt-2 text-xs text-gray-500">
//                     <span className="inline-block w-1.5 h-1.5 bg-[#9bc87c] rounded-full animate-pulse"></span>
//                     Complete your profile to stand out!
//                   </p>
//                 )}
//                 {!completionLoading && displayCompletionPct === 100 && (
//                   <p className="flex items-center gap-1 mt-2 text-xs font-medium text-[#1DB32F]">
//                     <FaCheckCircle size={12} /> Profile complete! 🎉
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* Upload Status Toast - Enhanced with auto-dismiss */}
//             {uploadStatus && (
//               <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in ${
//                 uploadStatus.type === "success" 
//                   ? "bg-[#1DB32F] text-white" 
//                   : "bg-red-500 text-white"
//               }`}>
//                 {uploadStatus.type === "success" ? <FaCheckCircle /> : <span>⚠️</span>}
//                 <span className="text-sm font-medium">{uploadStatus.message}</span>
//               </div>
//             )}

//             {/* ===== SECTIONS CONTAINER - Full Width ===== */}
//             <div className="p-4 space-y-4">

//               {/* ABOUT */}
//               <CollapsibleSection
//                 title="About"
//                 weight={100}
//                 score={
//                   editingSections.about
//                     ? calculateFieldScore("about_us", editValue)
//                     : calculateFieldScore("about_us", profile?.about_us)
//                 }
//                 isExpanded={expandedSections.about}
//                 onToggle={() => toggleSection('about')}
//                 showEditControls={true}
//                 isEditing={editingSections.about}
//                 onEditClick={() =>
//                   beginSectionEdit("about", "about_us", profile?.about_us)
//                 }
//                 onSaveClick={() => saveEdit("about_us")}
//                 onCancelClick={() => cancelEdit("about_us")}
//                 isSaving={isSaving && editingField === "about_us"}
//               >
//                 <FieldRow
//                   label="About Me"
//                   value={profile?.about_us}
//                   isVerified={isFieldComplete(profile?.about_us)}
//                   isEditable={editingSections.about}
//                   editValue={editValue}
//                   onChange={(val) => setEditValue(val)}
//                   type="textarea"
//                   rows={4}
//                   placeholder="Tell us about yourself..."
//                 />
//               </CollapsibleSection>

//               {/* CAREER OBJECTIVE */}
//               <CollapsibleSection
//                 title="Career Objective"
//                 weight={100}
//                 score={
//                   editingSections.career_objective
//                     ? calculateFieldScore("career_objective", editValue)
//                     : calculateFieldScore("career_objective", profile?.career_objective)
//                 }
//                 isExpanded={expandedSections.career_objective}
//                 onToggle={() => toggleSection('career_objective')}
//                 showEditControls={true}
//                 isEditing={editingSections.career_objective}
//                 onEditClick={() =>
//                   beginSectionEdit(
//                     "career_objective",
//                     "career_objective",
//                     profile?.career_objective
//                   )
//                 }
//                 onSaveClick={() => saveEdit("career_objective")}
//                 onCancelClick={() => cancelEdit("career_objective")}
//                 isSaving={isSaving && editingField === "career_objective"}
//               >
//                 <FieldRow
//                   label="Career Objective"
//                   value={profile?.career_objective}
//                   isVerified={isFieldComplete(profile?.career_objective)}
//                   isEditable={editingSections.career_objective}
//                   editValue={editValue}
//                   onChange={(val) => setEditValue(val)}
//                   type="textarea"
//                   rows={3}
//                   placeholder="What are your career goals?"
//                 />
//               </CollapsibleSection>

//               {/* RESUME */}
//               <CollapsibleSection
//                 title="Resume"
//                 weight={100}
//                 score={
//                   apiSectionPct.resume ??
//                   (resumeUrl || profile?.resume
//                     ? 100
//                     : calculateFieldScore("resume", profile?.resume))
//                 }
//                 isExpanded={expandedSections.resume}
//                 onToggle={() => toggleSection('resume')}
//                 showEditControls={false}
//               >
//                 <div className="py-3">
//                   <div className="flex items-center gap-2 mb-2">
//                     <span className="text-sm font-medium text-gray-700">Resume File</span>
//                     {resumeUrl && <FaCheckCircle className="text-[#1DB32F]" size={14} />}
//                   </div>
//                   {resumeUrl ? (
//                     <div className="flex flex-wrap items-center gap-3">
//                       <span className="text-sm text-gray-600 truncate max-w-[200px]">{getFileNameFromUrl(resumeUrl)}</span>
//                       <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#9bc87c] hover:text-[#8ab76b]">View</a>
//                       <button className="text-sm text-[#9bc87c] hover:text-[#8ab76b]" onClick={handleUploadResume} disabled={isUploading}>Replace</button>
//                     </div>
//                   ) : (
//                     <div>
//                       <p className="mb-2 text-sm text-gray-500">No resume uploaded yet</p>
//                       <button className="text-sm text-[#9bc87c] hover:text-[#8ab76b]" onClick={handleUploadResume} disabled={isUploading}>
//                         {isUploading ? "Uploading..." : "Upload Resume"}
//                       </button>
//                     </div>
//                   )}
//                   <div className="mt-3">
//                     <button className="text-sm text-[#9bc87c] hover:text-[#8ab76b]" onClick={() => navigate("/resume-template-selector")}>
//                       Manage Resume Templates →
//                     </button>
//                   </div>
//                 </div>
//               </CollapsibleSection>

//               {/* SKILLS */}
//               <CollapsibleSection
//                 title="Experience-Skills"
//                 weight={100}
//                 score={
//                   apiSectionPct.skills ??
//                   calculateFieldScore("skills", null, skillsData)
//                 }
//                 isExpanded={expandedSections.skills}
//                 onToggle={() => toggleSection('skills')}
//                 showEditControls={true}
//                 isEditing={false}
//                 onEditClick={() => handleEditSection("Skills")}
//               >
//                 {skillsData?.length > 0 ? (
//                   <div className="grid gap-3 md:grid-cols-2">
//                     {skillsData.map((org) => (
//                       <div key={org.id} className="flex gap-3 p-3 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50">
//                         <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 overflow-hidden bg-gray-100 rounded-full">
//                           {org.logo ? (
//                             <img src={getImageUrl(org.logo) || websiteLogo} alt={org.organization} className="object-contain w-8 h-8" />
//                           ) : (
//                             <span className="text-xs font-medium text-gray-500">{org.organization.charAt(0)}</span>
//                           )}
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <h4 className="font-medium text-gray-900">{org.organization}</h4>
//                           <p className="mb-1 text-sm text-gray-500">{formatDateRange(org.start_date, org.end_date)}</p>
//                           <p className="text-sm text-gray-700">{org.skills}</p>
//                           {org.hasCertificate && org.certificateUrl && (
//                             <a href={getImageUrl(org.certificateUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-1 text-sm text-[#9bc87c] hover:underline">
//                               📄 View Certificate
//                             </a>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="py-2 text-sm text-gray-500">No skills added yet</p>
//                 )}
//               </CollapsibleSection>

//               {/* WORK EXPERIENCE */}
//               {/* {profile?.user_type !== "School Student" && profile?.user_type !== "College Student" && (
//                 <CollapsibleSection
//                   title="Work Experience"
//                   weight={100}
//                   score={localSectionCompletion?.work_experience ?? sectionCompletion?.work_experience ?? calculateFieldScore('work_experience', null, workExperiences)}
//                   isExpanded={expandedSections.work_experience}
//                   onToggle={() => toggleSection('work_experience')}
//                   showEditControls={true}
//                   isEditing={false}
//                   onEditClick={() => handleEditSection("Work Experience")}
//                 >
//                   {workExperiences?.length > 0 ? (
//                     <div className="grid gap-3 md:grid-cols-2">
//                       {workExperiences.map((exp) => (
//                         <div key={exp.id} className="flex gap-3 p-3 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50">
//                           <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 overflow-hidden bg-gray-100 rounded-full">
//                             {exp.logo ? (
//                               <img src={getImageUrl(exp.logo) || websiteLogo} alt={exp.company} className="object-contain w-8 h-8" />
//                             ) : (
//                               <span className="text-xs font-medium text-gray-500">{exp.company.charAt(0)}</span>
//                             )}
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <h4 className="font-medium text-gray-900">{exp.position}</h4>
//                             <p className="text-sm text-gray-600">{exp.company}</p>
//                             <p className="text-sm text-gray-500">{exp.duration}</p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <p className="py-2 text-sm text-gray-500">No work experience added yet</p>
//                   )}
//                 </CollapsibleSection>
//               )} */}

//               {/* EDUCATION */}
//               <CollapsibleSection
//                 title="Education"
//                 weight={100}
//                 score={
//                   apiSectionPct.education ??
//                   calculateFieldScore("education", null, educationData)
//                 }
//                 isExpanded={expandedSections.education}
//                 onToggle={() => toggleSection('education')}
//                 showEditControls={true}
//                 isEditing={false}
//                 onEditClick={() => handleEditSection("Education")}
//               >
//                 {educationData?.length > 0 ? (
//                   <div className="grid gap-3 md:grid-cols-2">
//                     {educationData.map((edu) => (
//                       <div key={edu.id} className="flex gap-3 p-3 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50">
//                         <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 overflow-hidden bg-gray-100 rounded-full">
//                           {edu.logo ? (
//                             <img src={getImageUrl(edu.logo) || websiteLogo} alt={edu.institution} className="object-contain w-8 h-8" />
//                           ) : (
//                             <span className="text-xs font-medium text-gray-500">{edu.institution.charAt(0)}</span>
//                           )}
//                         </div>
//                         <div className="flex-1 min-w-0">
//                           <h4 className="font-medium text-gray-900">{edu.degree}</h4>
//                           <p className="text-sm text-gray-600">{edu.institution}</p>
//                           <p className="text-sm text-gray-500">{edu.duration}</p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="py-2 text-sm text-gray-500">No education details added yet</p>
//                 )}
//               </CollapsibleSection>

//               {/* LANGUAGES */}
//               <CollapsibleSection
//                 title="Languages you know"
//                 weight={100}
//                 score={
//                   editingSections.languages
//                     ? calculateFieldScore("language", editValue)
//                     : apiSectionPct.languages ??
//                       calculateFieldScore("language", profile?.language)
//                 }
//                 isExpanded={expandedSections.languages}
//                 onToggle={() => toggleSection('languages')}
//                 showEditControls={true}
//                 isEditing={editingSections.languages}
//                 onEditClick={() =>
//                   beginSectionEdit("languages", "language", profile?.language)
//                 }
//                 onSaveClick={() => saveEdit("language")}
//                 onCancelClick={() => cancelEdit("language")}
//                 isSaving={isSaving && editingField === "language"}
//               >
//                 <FieldRow
//                   label="Languages"
//                   value={profile?.language}
//                   isVerified={isFieldComplete(profile?.language)}
//                   isEditable={editingSections.languages}
//                   editValue={editValue}
//                   onChange={(val) => setEditValue(val)}
//                   isTagList={true}
//                   placeholder="e.g., English, Hindi, Spanish"
//                 />
//               </CollapsibleSection>

//               {/* AUTHENTICATION */}
//               <CollapsibleSection
//                 title="Authentication"
//                 weight={100}
//                 score={
//                   apiSectionPct.authentication ??
//                   (profile?.is_email_verified ? 33 : 0) +
//                     (profile?.is_phone_verified ? 33 : 0) +
//                     (profile?.is_aadhaar_verified ? 34 : 0)
//                 }
//                 isExpanded={expandedSections.authentication}
//                 onToggle={() => toggleSection('authentication')}
//                 showEditControls={false}
//               >
//                 <div className="space-y-1">
//                   <FieldRow label="Email Verification" value={profile?.is_email_verified ? "Verified" : "Not Verified"} isVerified={profile?.is_email_verified} isEditable={false} />
//                   <FieldRow label="Phone Verification" value={profile?.is_phone_verified ? "Verified" : "Not Verified"} isVerified={profile?.is_phone_verified} isEditable={false} />
//                   <FieldRow label="Aadhaar Verification" value={profile?.is_aadhaar_verified ? "Verified" : "Not Verified"} isVerified={profile?.is_aadhaar_verified} isEditable={false} />
//                   <div className="p-3 mt-2 text-sm text-gray-500 rounded bg-gray-50">
//                     <p>Complete verification to unlock all features and increase your profile visibility.</p>
//                     <button className="mt-2 font-medium text-[#9bc87c] hover:text-[#8ab76b]">Get Verified →</button>
//                   </div>
//                 </div>
//               </CollapsibleSection>

//             </div>
//           </div>
//         </section>

//       </div>
      
//       {/* CSS Animation for Toast */}
//       <style>{`
//         @keyframes slideIn {
//           from {
//             transform: translateX(100%);
//             opacity: 0;
//           }
//           to {
//             transform: translateX(0);
//             opacity: 1;
//           }
//         }
//         .animate-slide-in {
//           animation: slideIn 0.3s ease-out;
//         }
//       `}</style>
//     </MainLayout>
//   );
// };

// export default FeedView;



















import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaBuilding,
  FaMapMarkerAlt,
  FaUserTie,
  FaMoneyBillWave,
  FaBriefcase,
  FaFilter,
  FaTimes,
  FaArrowUp,
  FaGraduationCap,
  FaCog,
  FaCheckCircle,
  FaCamera,
  FaLink
} from "react-icons/fa";
import {
  ChevronRight,
  User,
  FileText,
  Bell,
  Settings,
  LogOut,
  Mail,
  Lock,
  Trash2,
  HelpCircle,
  Shield,
} from "lucide-react";
import { HiOutlineEye } from "react-icons/hi";
import FeedRightSidebar from "../feed/FeedRightSidebar";
import MainLayout from "../../../components/layout/MainLayout";
import { useDispatch, useSelector } from "react-redux";
import { logout, updateUser } from "../../../redux/feature/authSlice";
import softDeleteAccount from "../../../api/feedApi";
import { userDetailsApi } from "../../../api/userDetailsApi";
import { getImageUrl } from "../../../../utils.js";
import dummyProfile3 from "../../../assets/dummyProfile3.jpg";
import { useUserDetailsApi } from "../../../hooks/useUserDetailsApi";
import useFeedApi from "../../../hooks/useFeedApi";
import websiteLogo from "../../../assets/WebsiteLogo.svg";
import { useProfileCompletion } from "../../../hooks/useProfileCompletion";
import uploadImageApi from "../../../api/uploadImageApi.js";
import { FaFilePdf } from "react-icons/fa6";
// Naye Custom Components Imports
import UserIdentityBadge from "../../../components/jobs/UserIdentityBadge.jsx"; 
import ProfileName from "../../../components/jobs/ProfileName.jsx"
import CollapsibleSectionHeader from "../../../components/jobs/CollapsibleSectionHeader.jsx";

// ==========================================
// REUSABLE COLLAPSIBLE SECTION (UPDATED)
// ==========================================
const CollapsibleSection = ({ 
  title, weight, score, children, isExpanded, onToggle, 
  showEditControls, onEditClick, onSaveClick, onCancelClick, 
  isEditing, isSaving 
}) => {
  const percentage = Math.min(100, Math.round((score / weight) * 100));
  const isComplete = percentage === 100;

  return (
    <div className="overflow-hidden bg-white shadow-sm rounded-xl border border-gray-100 mb-4 transition-all">
      
      {/* Master Header Component */}
      <CollapsibleSectionHeader
        title={title}
        percentage={percentage}
        isComplete={isComplete}
        showEditControls={showEditControls}
        isEditing={isEditing}
        isSaving={isSaving}
        onEditClick={onEditClick}
        onSaveClick={onSaveClick}
        onCancelClick={onCancelClick}
        expanded={isExpanded}
        onToggle={onToggle}
      />

      {/* Expanded Content Area */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-2 bg-gray-50/30">
          {children}
        </div>
      )}
      
    </div>
  );
};

// ==========================================
// REUSABLE FIELD ROW
// ==========================================
const FieldRow = ({ label, value, isVerified = false, isEditable = false, editValue, onChange, type = "text", placeholder = "", rows = 1, children, isTagList = false }) => {
  return (
    <div className="py-3 border-b border-gray-200 last:border-0">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-gray-700">{label}</span>
            {isVerified && <FaCheckCircle className="text-[#1DB32F]" size={14} />}
          </div>
          {isEditable ? (
            isTagList ? (
              <input
                type="text"
                value={editValue || ""}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9bc87c]"
                placeholder={placeholder}
              />
            ) : type === "textarea" ? (
              <textarea
                value={editValue || ""}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9bc87c]"
                rows={rows}
                placeholder={placeholder}
              />
            ) : (
              <input
                type={type}
                value={editValue || ""}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9bc87c]"
                placeholder={placeholder}
              />
            )
          ) : isTagList && value ? (
            <div className="flex flex-wrap gap-2 mt-2">
              {value.split(",").map((tag, i) => (
                <span key={i} className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full border border-gray-200">
                  <span className="w-1.5 h-1.5 bg-[#1DB32F] rounded-full"></span>
                  {tag.trim()}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 whitespace-pre-wrap mt-1 leading-relaxed">
              {value || <span className="text-gray-400 italic">Not provided</span>}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

/** Map server breakdown (weighted scores) to 0–100% per feed section bar */
function breakdownToFeedSectionPct(breakdown) {
  if (!breakdown || typeof breakdown !== "object") return {};
  const pct = (name) => {
    const s = breakdown[name];
    if (!s || s.not_applicable || !s.weight) return undefined;
    return Math.min(100, Math.round((s.score / s.weight) * 100));
  };
  const out = {
    education: pct("education"),
    skills: pct("skills"),
    resume: pct("resume"),
    work_experience: pct("experience"),
    languages: pct("languages"),
  };
  const v = breakdown.verification;
  const d = breakdown.document_verification;
  let num = 0;
  let den = 0;
  if (v?.weight) {
    num += v.score;
    den += v.weight;
  }
  if (d?.weight && !d.not_applicable) {
    num += d.score;
    den += d.weight;
  }
  if (den > 0) out.authentication = Math.round((num / den) * 100);
  return out;
}

const FeedView = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  // Upload states
  const [profileImage, setProfileImage] = useState(null);
  const [resumeUrl, setResumeUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  // Edit states
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Section expand/edit states
  const [expandedSections, setExpandedSections] = useState({
    about: false,
    career_objective: false,
    skills: false,
    work_experience: false,
    education: false,
    languages: false,
    authentication: false,
    activity: false,
    resume: false
  });
  const [editingSections, setEditingSections] = useState({});

  // Hook data
  const {
    profile,
    userActivity,
    workExperiences,
    educationData,
    skillsData,
    loading: hookLoading,
    error: hookError,
    getUserPublicProfile,
  } = useUserDetailsApi();

  const {
    percentage: completionPercentage,
    breakdown: completionBreakdown,
    loading: completionLoading,
    error: completionError,
    refetch: refetchCompletion,
  } = useProfileCompletion(true);

  const apiSectionPct = useMemo(
    () => breakdownToFeedSectionPct(completionBreakdown),
    [completionBreakdown]
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const publicProfileUrl = profile?.uuid
    ? `${window.location.origin}/public-profile/${profile.uuid}`
    : "";

  // Helper: Calculate section score
  const calculateFieldScore = (field, value, sectionData = null) => {
    const trimmedValue = value?.toString().trim();
    const hasValue = trimmedValue && trimmedValue.length > 0;
    
    switch(field) {
      case 'about_us':
      case 'career_objective':
      case 'language':
        return hasValue ? 100 : 0;
      case 'skills':
        return (sectionData?.length > 0) ? 100 : 0;
      case 'work_experience':
      case 'education':
        return (sectionData?.length > 0) ? 100 : 0;
      case 'resume':
        return hasValue ? 100 : 0;
      case 'authentication':
        let score = 0;
        if (profile?.is_email_verified) score += 33;
        if (profile?.is_phone_verified) score += 33;
        if (profile?.is_aadhaar_verified) score += 34;
        return score;
      default:
        return hasValue ? 100 : 0;
    }
  };

  const fieldToUiSection = {
    about_us: "about",
    career_objective: "career_objective",
    language: "languages",
  };

  useEffect(() => {
    if (profile) {
      setProfileImage(profile.user_profile_pic || null);
      setResumeUrl(profile.resume || null);
    }
  }, [profile]);

  useEffect(() => {
    if (!token || !user?.id) return;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        await getUserPublicProfile(user.id, token);
      } catch (err) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token, user?.id, getUserPublicProfile]);

  const formatDateRange = (start, end) => {
    const format = (dateStr) => {
      if (!dateStr) return "Present";
      const [year, month] = dateStr.split("-");
      const date = new Date(year, month - 1);
      return date.toLocaleString("default", { month: "short", year: "numeric" });
    };
    return `${format(start)} – ${format(end || null)}`;
  };

  const getFileNameFromUrl = (url) => {
    if (!url) return "resume.pdf";
    try {
      return new URL(url).pathname.split("/").pop().split("?")[0] || "resume.pdf";
    } catch {
      return url.split("/").pop().split("?")[0] || "resume.pdf";
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const beginSectionEdit = (uiKey, field, currentValue) => {
    setEditingSections((prev) => ({
      ...prev,
      about: false,
      career_objective: false,
      languages: false,
      [uiKey]: true,
    }));
    setEditingField(field);
    setEditValue(currentValue ?? "");
  };

  const startEditing = (field, currentValue) => {
    setEditingField(field);
    setEditValue(currentValue || "");
    setEditingSections(prev => ({ ...prev, [field]: true }));
  };

  const cancelEdit = (field) => {
    setEditingField(null);
    setEditValue("");
    const uiKey = fieldToUiSection[field] ?? field;
    setEditingSections((prev) => ({ ...prev, [uiKey]: false }));
  };

  const { handleLike: apiHandleLike } = useFeedApi();

  const handleLike = async (postId, userId) => {
    await apiHandleLike(postId, userId);
    if (user?.id && token) {
      await getUserPublicProfile(user.id, token);
    }
  };

  const saveEdit = async (field) => {
    if (!user?.id || !token) return;
    setIsSaving(true);
    try {
      let payload = {};
      switch (field) {
        case "name":
          const parts = editValue.split(" ");
          payload = { first_name: parts[0] || "", last_name: parts.slice(1).join(" ") || "" };
          break;
        case "about_us":
          payload = { about_us: editValue };
          break;
        case "career_objective":
          payload = { career_objective: editValue };
          break;
        case "language":
          payload = { language: editValue };
          break;
        default:
          payload = { [field]: editValue };
      }

      if (field === "name") {
        dispatch(updateUser(payload));
      }

      const result = await userDetailsApi.updateUserDetails(user.id, payload, token);

      if (result.success || result.message?.includes("updated")) {
        await getUserPublicProfile(user.id, token);
        await refetchCompletion?.();
        setUploadStatus({ type: "success", message: " Updated successfully!" });
      } else {
        throw new Error("Update failed");
      }

      setEditingField(null);
      setEditValue("");
      const uiKey = fieldToUiSection[field] ?? field;
      setEditingSections((prev) => ({ ...prev, [uiKey]: false }));
    } catch (err) {
      console.error("Save error:", err);
      setUploadStatus({ type: "error", message: "❌ Failed to update. Please try again." });
    } finally {
      setIsSaving(false);
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  const handleProfileImageUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return;
      setIsUploading(true);
      try {
        const url = await uploadImageApi.uploadImage(file, "profile", token);
        if (url) {
          const res = await userDetailsApi.updateUserDetails(user.id, { user_profile_pic: url }, token);
          if (res.message?.includes("updated")) {
            setProfileImage(`${url}?t=${Date.now()}`);
            await getUserPublicProfile(user.id, token);
            dispatch(updateUser({ user_profile_pic: url }));
            setUploadStatus({ type: "success", message: "Profile picture updated!" });
            await refetchCompletion?.();
          }
        }
      } catch (err) {
        setUploadStatus({ type: "error", message: "Upload failed." });
      } finally {
        setIsUploading(false);
        setTimeout(() => setUploadStatus(null), 3000);
      }
    };
    input.click();
  };

//   const handleUploadResume = async () => {
//     const input = document.createElement("input");
//     input.type = "file";
//     input.accept = ".pdf";
//     input.onchange = async (e) => {
//       const file = e.target.files?.[0];
//       // if (!file || file.type !== "application/pdf" || file.size > 10 * 1024 * 1024) return;
//       const isPdf = file && file.name?.toLowerCase().endsWith(".pdf");
// if (!file || !isPdf || file.size > 10 * 1024 * 1024) {
//   setUploadStatus({ type: "error", message: "Please upload a PDF under 10MB." });
//   return;
// }
//       setIsUploading(true);
//       try {
//         const url = await uploadImageApi.uploadImage(file, "resume", token);
//         if (url) {
//           const res = await userDetailsApi.updateUserDetails(user.id, { resume: url }, token);
//           if (res.message?.includes("updated")) {
//             setResumeUrl(`${url}?t=${Date.now()}`);
//             await getUserPublicProfile(user.id, token);
//             setUploadStatus({ type: "success", message: "Resume uploaded!" });
//             await refetchCompletion?.();
//           }
//         }
//       } catch (err) {
//         setUploadStatus({ type: "error", message: "Upload failed." });
//       } finally {
//         setIsUploading(false);
//         setTimeout(() => setUploadStatus(null), 3000);
//       }
//     };
//     input.click();
//   };


const handleUploadResume = async () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".pdf";

  input.onchange = async (e) => {
    const file = e.target.files?.[0];

    const isPdf = !!file && file.name?.toLowerCase().endsWith(".pdf");
    if (!file || !isPdf || file.size > 10 * 1024 * 1024) {
      setUploadStatus({ type: "error", message: "Please upload a PDF under 10MB." });
      return;
    }

    // Optional: also warn about backend 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      setUploadStatus({ type: "error", message: "PDF must be under 5MB (server limit). Please compress and try again." });
      return;
    }

    setIsUploading(true);
    setUploadStatus(null);

    try {
      // 1) Upload file
      const url = await uploadImageApi.uploadImage(file, "resume", token);

      if (!url) {
        throw new Error("Upload succeeded but no URL returned from server.");
      }

      // 2) Save URL to profile
      const res = await userDetailsApi.updateUserDetails(user.id, { resume: url }, token);

      const ok = res?.success || res?.message?.toLowerCase?.().includes("updated");
      if (!ok) {
        throw new Error(res?.message || "Resume saved failed.");
      }

      setResumeUrl(`${url}?t=${Date.now()}`);
      await getUserPublicProfile(user.id, token);
      await refetchCompletion?.();

      setUploadStatus({ type: "success", message: "Resume uploaded!" });
    } catch (err) {
      // Show real backend error
      console.log("Resume upload error:", err);
      console.log("Status:", err?.response?.status);
      console.log("Response:", err?.response?.data);

      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Upload failed.";

      setUploadStatus({ type: "error", message: msg });
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatus(null), 5000);
    }
  };

  input.click();
};
  const handleEditSection = (section) => {
    if (section === "Skills") navigate("/feed-your-skills");
    if (section === "Work Experience") navigate("/feed-your-experience");
    if (section === "Education") navigate("/feed-your-education");
  };

  const isFieldComplete = (value) => value && String(value).trim() !== "";

  // Dynamically calculate the overall percentage to perfectly sync with the 7 visible sections
  const getDynamicCompletionPct = () => {
    let totalScore = 0;
    const sectionCount = 7; // About, Objective, Resume, Exp/Skills, Edu, Lang, Auth

    // 1. About
    totalScore += editingSections.about
      ? calculateFieldScore("about_us", editValue)
      : calculateFieldScore("about_us", profile?.about_us);

    // 2. Career Objective
    totalScore += editingSections.career_objective
      ? calculateFieldScore("career_objective", editValue)
      : calculateFieldScore("career_objective", profile?.career_objective);

    // 3. Resume
    totalScore += apiSectionPct.resume ??
      (resumeUrl || profile?.resume ? 100 : calculateFieldScore("resume", profile?.resume));

    // 4. Experience-Skills
    totalScore += apiSectionPct.skills ??
      calculateFieldScore("skills", null, skillsData);

    // 5. Education
    totalScore += apiSectionPct.education ??
      calculateFieldScore("education", null, educationData);

    // 6. Languages you know
    totalScore += editingSections.languages
      ? calculateFieldScore("language", editValue)
      : apiSectionPct.languages ?? calculateFieldScore("language", profile?.language);

    // 7. Authentication
    totalScore += apiSectionPct.authentication ??
      ((profile?.is_email_verified ? 33 : 0) +
      (profile?.is_phone_verified ? 33 : 0) +
      (profile?.is_aadhaar_verified ? 34 : 0));

    return Math.min(100, Math.max(0, Math.round(totalScore / sectionCount)));
  };

  const displayCompletionPct = getDynamicCompletionPct();

  if (loading || hookLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center min-h-screen px-4 bg-gray-100">
          <p className="flex items-center justify-center w-full">Loading...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || hookError) {
    return (
      <MainLayout>
        <div className="flex justify-center min-h-screen px-4 bg-gray-100">
          <p className="text-red-500">Error: {error || hookError}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen bg-gray-100">

        <section className="w-full px-4 py-6 mx-auto">
          <div className="w-full mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 relative">

            <button
              onClick={() => navigate("/student-profile")}
              className="absolute z-10 p-2 text-gray-400 transition-colors bg-white border border-gray-100 rounded-full shadow-sm top-4 right-4 hover:text-[#9bc87c] hover:border-[#9bc87c]/30"
              title="Settings"
            >
              <FaCog size={18} />
            </button>

            <div className="flex flex-col items-center p-6 bg-gradient-to-b from-white to-gray-50 border-b border-gray-200 rounded-t-2xl">
              <div className="relative group">
                <div className="w-20 h-20 overflow-hidden transition-shadow border-4 border-white rounded-full shadow-md sm:w-24 sm:h-24 hover:shadow-lg">
                  <img
                    src={profileImage ? getImageUrl(profileImage) : dummyProfile3}
                    alt="Profile"
                    className="object-cover w-full h-full"
                  />
                </div>
                <FaCamera
                  onClick={handleProfileImageUpload}
                  className="absolute w-7 h-7 p-1.5 text-white bg-[#9bc87c] transition-opacity rounded-full shadow-md opacity-0 cursor-pointer group-hover:opacity-100 border-2 border-white hover:bg-[#8ab76b]"
                  style={{ bottom: "2px", right: "2px" }}
                  title="Change profile picture"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(publicProfileUrl);
                    setUploadStatus({ type: "success", message: "Link copied!" });
                    setTimeout(() => setUploadStatus(null), 2000);
                  }}
                  className="absolute w-7 h-7 p-1.5 text-gray-600 bg-white transition-opacity rounded-full shadow-md opacity-0 cursor-pointer group-hover:opacity-100 border border-gray-200 hover:text-[#9bc87c] flex justify-center items-center"
                  style={{ bottom: "2px", left: "2px" }}
                  title="Copy public profile link"
                >
                  <FaLink size={12} />
                </button>
              </div>

              {editingField === "name" ? (
                <div className="flex flex-col items-center mt-4">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="text-xl font-extrabold text-center text-[#1e1e2d] border-b-2 border-[#9bc87c] sm:text-2xl focus:outline-none bg-transparent"
                    autoFocus
                  />
                  <div className="flex gap-2 mt-3">
                    <button
                      className="px-4 py-1 text-sm font-bold text-white bg-[#1DB32F] rounded-full hover:bg-[#189b27] disabled:opacity-50 transition"
                      onClick={() => saveEdit("name")}
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                    <button
                      className="px-4 py-1 text-sm font-bold text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                      onClick={() => cancelEdit("name")}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div 
                    onClick={() => startEditing("name", `${profile?.first_name || ""} ${profile?.last_name || ""}`)}
                    title="Click to edit name"
                    className="mt-4 cursor-pointer transition-opacity hover:opacity-80"
                  >
                    <ProfileName 
                      name={`${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "User Name"} 
                    />
                  </div>
                  <UserIdentityBadge 
                    roleLabel={user?.user_role || "STUDENT"} 
                    handle={`@${profile?.email?.split("@")[0] || "user"}`}
                    className="mt-2"
                  />
                </div>
              )}

              <div className="w-full max-w-2xl pt-4 mt-6 border-t border-gray-200/60">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-extrabold text-[#1e1e2d]">Profile Completion</span>
                  <span className="text-sm font-extrabold text-[#9bc87c]">
                    {completionLoading ? "…" : `${displayCompletionPct}%`}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      displayCompletionPct === 100
                        ? 'bg-gradient-to-r from-[#1DB32F] to-[#00C950]' 
                        : 'bg-gradient-to-r from-[#9bc87c] to-[#8ab76b]'
                    }`}
                    style={{ width: `${completionLoading ? 0 : displayCompletionPct}%` }}
                  />
                </div>
                {!completionLoading && displayCompletionPct < 100 && (
                  <p className="flex items-center gap-2 mt-2 text-xs font-semibold text-gray-500">
                    <span className="inline-block w-1.5 h-1.5 bg-[#9bc87c] rounded-full"></span>
                    Complete your profile to stand out!
                  </p>
                )}
                {!completionLoading && displayCompletionPct === 100 && (
                  <p className="flex items-center gap-1.5 mt-2 text-xs font-bold text-[#1DB32F]">
                    <FaCheckCircle size={12} /> Profile complete! 🎉
                  </p>
                )}
              </div>
            </div>

            {uploadStatus && (
              <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2 animate-slide-in ${
                uploadStatus.type === "success" 
                  ? "bg-[#1DB32F] border-[#00C950] text-white" 
                  : "bg-white border-red-200 text-red-500"
              }`}>
                {uploadStatus.type === "success" ? <FaCheckCircle /> : <span>⚠️</span>}
                <span className="text-sm font-bold">{uploadStatus.message}</span>
              </div>
            )}

            <div className="p-4 sm:p-6 space-y-4">

              {/* ABOUT */}
              <CollapsibleSection
                title="About"
                weight={100}
                score={
                  editingSections.about
                    ? calculateFieldScore("about_us", editValue)
                    : calculateFieldScore("about_us", profile?.about_us)
                }
                isExpanded={expandedSections.about}
                onToggle={() => toggleSection('about')}
                showEditControls={true}
                isEditing={editingSections.about}
                onEditClick={() =>
                  beginSectionEdit("about", "about_us", profile?.about_us)
                }
                onSaveClick={() => saveEdit("about_us")}
                onCancelClick={() => cancelEdit("about_us")}
                isSaving={isSaving && editingField === "about_us"}
              >
                <FieldRow
                  label="About Me"
                  value={profile?.about_us}
                  isVerified={isFieldComplete(profile?.about_us)}
                  isEditable={editingSections.about}
                  editValue={editValue}
                  onChange={(val) => setEditValue(val)}
                  type="textarea"
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
              </CollapsibleSection>

              {/* CAREER OBJECTIVE */}
              <CollapsibleSection
                title="Career Objective"
                weight={100}
                score={
                  editingSections.career_objective
                    ? calculateFieldScore("career_objective", editValue)
                    : calculateFieldScore("career_objective", profile?.career_objective)
                }
                isExpanded={expandedSections.career_objective}
                onToggle={() => toggleSection('career_objective')}
                showEditControls={true}
                isEditing={editingSections.career_objective}
                onEditClick={() =>
                  beginSectionEdit(
                    "career_objective",
                    "career_objective",
                    profile?.career_objective
                  )
                }
                onSaveClick={() => saveEdit("career_objective")}
                onCancelClick={() => cancelEdit("career_objective")}
                isSaving={isSaving && editingField === "career_objective"}
              >
                <FieldRow
                  label="Career Objective"
                  value={profile?.career_objective}
                  isVerified={isFieldComplete(profile?.career_objective)}
                  isEditable={editingSections.career_objective}
                  editValue={editValue}
                  onChange={(val) => setEditValue(val)}
                  type="textarea"
                  rows={3}
                  placeholder="What are your career goals?"
                />
              </CollapsibleSection>

              {/* RESUME */}
              <CollapsibleSection
                title="Resume"
                weight={100}
                score={
                  apiSectionPct.resume ??
                  (resumeUrl || profile?.resume
                    ? 100
                    : calculateFieldScore("resume", profile?.resume))
                }
                isExpanded={expandedSections.resume}
                onToggle={() => toggleSection('resume')}
                showEditControls={false}
              >
                <div className="py-2">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-bold text-gray-700">Resume File</span>
                    {resumeUrl && <FaCheckCircle className="text-[#1DB32F]" size={14} />}
                  </div>
                  {resumeUrl ? (
                    <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                      <FaFilePdf className="text-red-500" size={20} />
                      {(() => {
                        const stored = String(resumeUrl || "");
                        const storedPath = stored.split("?")[0]; // avoid breaking /api/uploads URL building
                        const href = storedPath.startsWith("http")
                          ? storedPath
                          : getImageUrl(storedPath);
                        return (
                          <>
                            <span className="text-sm font-semibold text-[#1e1e2d] truncate max-w-[200px]">
                              {getFileNameFromUrl(href)}
                            </span>
                            <div className="flex gap-2 ml-auto">
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 text-xs font-bold text-[#9bc87c] bg-[#9bc87c]/10 rounded-full hover:bg-[#9bc87c]/20 transition"
                              >
                                View
                              </a>
                              <button
                                className="px-3 py-1 text-xs font-bold text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                                onClick={handleUploadResume}
                                disabled={isUploading}
                              >
                                Replace
                              </button>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-dashed border-gray-300 p-4 rounded-xl text-center">
                      <p className="mb-2 text-sm font-medium text-gray-500">No resume uploaded yet</p>
                      <button className="px-4 py-1.5 text-sm font-bold text-white bg-[#9bc87c] rounded-full hover:bg-[#8ab76b] transition" onClick={handleUploadResume} disabled={isUploading}>
                        {isUploading ? "Uploading..." : "Upload Resume"}
                      </button>
                    </div>
                  )}
                  <div className="mt-4">
                    <button className="text-sm font-bold text-[#9bc87c] hover:text-[#8ab76b] transition" onClick={() => navigate("/resume-template-selector")}>
                      Manage Resume Templates →
                    </button>
                  </div>
                </div>
              </CollapsibleSection>

              {/* SKILLS */}
              <CollapsibleSection
                title="Experience-Skills"
                weight={100}
                score={
                  apiSectionPct.skills ??
                  calculateFieldScore("skills", null, skillsData)
                }
                isExpanded={expandedSections.skills}
                onToggle={() => toggleSection('skills')}
                showEditControls={true}
                isEditing={false}
                onEditClick={() => handleEditSection("Skills")}
              >
                {skillsData?.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {skillsData.map((org) => (
                      <div key={org.id} className="flex gap-3 p-4 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl overflow-hidden">
                          {org.logo ? (
                            <img src={getImageUrl(org.logo) || websiteLogo} alt={org.organization} className="object-contain w-8 h-8" />
                          ) : (
                            <span className="text-sm font-bold text-gray-400">{org.organization.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-[#1e1e2d]">{org.organization}</h4>
                          <p className="mb-2 text-xs font-semibold text-gray-400">{formatDateRange(org.start_date, org.end_date)}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {org.skills.split(',').map((s, i) => (
                              <span key={i} className="px-2 py-0.5 text-[10px] font-bold bg-[#9bc87c]/10 text-[#9bc87c] rounded">
                                {s.trim()}
                              </span>
                            ))}
                          </div>
                          {org.hasCertificate && org.certificateUrl && (
                            <a href={getImageUrl(org.certificateUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-3 text-xs font-bold text-[#1DB32F] hover:underline">
                              📄 View Certificate
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-2 text-sm italic text-gray-400">No skills added yet</p>
                )}
              </CollapsibleSection>

              {/* EDUCATION */}
              <CollapsibleSection
                title="Education"
                weight={100}
                score={
                  apiSectionPct.education ??
                  calculateFieldScore("education", null, educationData)
                }
                isExpanded={expandedSections.education}
                onToggle={() => toggleSection('education')}
                showEditControls={true}
                isEditing={false}
                onEditClick={() => handleEditSection("Education")}
              >
                {educationData?.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {educationData.map((edu) => (
                      <div key={edu.id} className="flex gap-3 p-4 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl overflow-hidden">
                          {edu.logo ? (
                            <img src={getImageUrl(edu.logo) || websiteLogo} alt={edu.institution} className="object-contain w-8 h-8" />
                          ) : (
                            <FaGraduationCap className="text-gray-300" size={20} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-extrabold text-[#1e1e2d]">{edu.degree}</h4>
                          <p className="text-sm font-semibold text-gray-600 mt-0.5">{edu.institution}</p>
                          <p className="text-xs font-medium text-gray-400 mt-1">{edu.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-2 text-sm italic text-gray-400">No education details added yet</p>
                )}
              </CollapsibleSection>

              {/* LANGUAGES */}
              <CollapsibleSection
                title="Languages you know"
                weight={100}
                score={
                  editingSections.languages
                    ? calculateFieldScore("language", editValue)
                    : apiSectionPct.languages ??
                      calculateFieldScore("language", profile?.language)
                }
                isExpanded={expandedSections.languages}
                onToggle={() => toggleSection('languages')}
                showEditControls={true}
                isEditing={editingSections.languages}
                onEditClick={() =>
                  beginSectionEdit("languages", "language", profile?.language)
                }
                onSaveClick={() => saveEdit("language")}
                onCancelClick={() => cancelEdit("language")}
                isSaving={isSaving && editingField === "language"}
              >
                <FieldRow
                  label="Languages"
                  value={profile?.language}
                  isVerified={isFieldComplete(profile?.language)}
                  isEditable={editingSections.languages}
                  editValue={editValue}
                  onChange={(val) => setEditValue(val)}
                  isTagList={true}
                  placeholder="e.g., English, Hindi, Spanish"
                />
              </CollapsibleSection>

              {/* AUTHENTICATION */}
              <CollapsibleSection
                title="Authentication"
                weight={100}
                score={
                  apiSectionPct.authentication ??
                  (profile?.is_email_verified ? 33 : 0) +
                    (profile?.is_phone_verified ? 33 : 0) +
                    (profile?.is_aadhaar_verified ? 34 : 0)
                }
                isExpanded={expandedSections.authentication}
                onToggle={() => toggleSection('authentication')}
                showEditControls={false}
              >
                <div className="space-y-1">
                  <FieldRow label="Email Verification" value={profile?.is_email_verified ? "Verified" : "Not Verified"} isVerified={profile?.is_email_verified} isEditable={false} />
                  <FieldRow label="Phone Verification" value={profile?.is_phone_verified ? "Verified" : "Not Verified"} isVerified={profile?.is_phone_verified} isEditable={false} />
                  <FieldRow label="Aadhaar Verification" value={profile?.is_aadhaar_verified ? "Verified" : "Not Verified"} isVerified={profile?.is_aadhaar_verified} isEditable={false} />
                  
                  {(!profile?.is_email_verified || !profile?.is_phone_verified || !profile?.is_aadhaar_verified) && (
                    <div className="p-4 mt-4 text-sm bg-blue-50/50 border border-blue-100 rounded-xl">
                      <div className="flex gap-3">
                        <Shield className="text-blue-500 shrink-0" size={20} />
                        <div>
                          <p className="font-semibold text-[#1e1e2d]">Complete your verification</p>
                          <p className="text-gray-500 mt-1">Unlock all platform features and build trust with recruiters by verifying your identity.</p>
                          <button onClick={() => navigate("/student-authentication")} className="mt-3 text-xs font-extrabold text-blue-600 hover:text-blue-700 transition">Start Verification →</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleSection>

            </div>
          </div>
        </section>

      </div>
      
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slideIn 0.3s ease-out; }
      `}</style>
    </MainLayout>
  );
};

export default FeedView;