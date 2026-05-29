// // import React, { useState, useEffect, useMemo } from "react";
// // import { Link, useParams } from "react-router-dom";
// // import { FaLink, FaChevronDown, FaChevronUp, FaCheckCircle } from "react-icons/fa";
// // import MainLayout from "../../../components/layout/MainLayout";
// // import { useSelector } from "react-redux";
// // import { getImageUrl } from "../../../../utils.js";
// // import dummyProfile3 from "../../../assets/dummyProfile3.jpg";
// // import usePublicProfile from "../../../hooks/usePublicProfile";
// // import feedApi from "../../../api/feedApi";
// // import { Loader2 } from "lucide-react";

// // // ===== REUSABLE UI COMPONENTS (Read-Only Versions) =====

// // const CollapsibleSection = ({ title, children, isExpanded, onToggle }) => {
// //   return (
// //     <div className="overflow-hidden bg-white shadow-sm rounded-xl">
// //       <div
// //         className="flex items-center justify-between p-4 transition-colors cursor-pointer hover:bg-gray-50"
// //         onClick={onToggle}
// //       >
// //         <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
// //         <button className="p-1 transition-colors rounded hover:bg-gray-200">
// //           {isExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
// //         </button>
// //       </div>
// //       {isExpanded && (
// //         <div className="px-4 pb-4 border-t border-gray-100 pt-4">
// //           {children}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // const FieldRow = ({ label, value, isVerified = false, children }) => {
// //   return (
// //     <div className="py-3 border-b border-gray-100 last:border-0">
// //       <div className="flex items-center gap-2 mb-1">
// //         <span className="text-sm font-medium text-gray-700">{label}</span>
// //         {isVerified && <FaCheckCircle className="text-green-500" size={14} />}
// //       </div>
// //       {children ? (
// //         <div className="mt-1">{children}</div>
// //       ) : (
// //         <p className="text-sm text-gray-600 whitespace-pre-wrap">
// //           {value || <span className="text-gray-400">Not provided</span>}
// //         </p>
// //       )}
// //     </div>
// //   );
// // };

// // // ===== MAIN COMPONENT =====

// // const FeedPublicProfilePage = () => {
// //   const { uuid } = useParams();
// //   const { token } = useSelector((state) => state.auth);

// //   const {
// //     profile,
// //     profileStats,
// //     workExperiences,
// //     educationData,
// //     skillsData,
// //     details,
// //     loading,
// //     error,
// //     getUserPublicProfileByUUID,
// //   } = usePublicProfile();

// //   const [isFollowing, setIsFollowing] = useState(false);
// //   const [followersCount, setFollowersCount] = useState(0);
// //   const [followingCount, setFollowingCount] = useState(0);

// //   // UI State for sections
// //   const [expandedSections, setExpandedSections] = useState({
// //     about: true,
// //     professional: true,
// //     verification: true,
// //   });

// //   const toggleSection = (section) => {
// //     setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
// //   };

// //   const publicProfileUrl = profile?.uuid
// //     ? `${window.location.origin}/public_profile/${profile.uuid}`
// //     : "";

// //   const copyToClipboard = (text) => {
// //     if (text) {
// //       navigator.clipboard.writeText(text).then(() => {
// //         alert("Profile link copied!");
// //       });
// //     }
// //   };

// //   useEffect(() => {
// //     if (uuid) {
// //       getUserPublicProfileByUUID(uuid, token);
// //     }
// //   }, [uuid, token]);

// //   useEffect(() => {
// //     if (profileStats) {
// //       setIsFollowing(profileStats.is_following);
// //       setFollowersCount(profileStats.followers_count || 0);
// //       setFollowingCount(profileStats.following_count || 0);
// //     }
// //   }, [profileStats]);

// //   const handleToggleFollow = async () => {
// //     if (!token) {
// //       window.location.href = "/login";
// //       return;
// //     }
// //     try {
// //       setIsFollowing(!isFollowing);
// //       setFollowersCount((prev) =>
// //         !isFollowing ? prev + 1 : Math.max(0, prev - 1)
// //       );
// //       await feedApi.followUnfollowUser(profile.id, token);
// //     } catch (err) {
// //       alert("Failed to update follow status.");
// //       setIsFollowing(isFollowing);
// //     }
// //   };

// //   const unifiedExperiences = useMemo(() => {
// //     if (profile?.user_role !== "STUDENT") return [];

// //     const expMap = new Map();

// //     workExperiences.forEach((exp) => {
// //       const key = `${exp.company || "Unknown"}|${exp.start_date || ""}`;
// //       expMap.set(key, {
// //         organization: exp.company,
// //         logo: exp.logo,
// //         jobRole: exp.position,
// //         startDate: exp.start_date,
// //         endDate: exp.end_date,
// //         duration: exp.duration,
// //         skills: [],
// //         certificateUrl: exp.certificateUrl,
// //       });
// //     });

// //     skillsData.forEach((skillGroup) => {
// //       const orgName = skillGroup.organization || "Other";
// //       let matched = false;
// //       for (let [key, exp] of expMap.entries()) {
// //         if (exp.organization === orgName) {
// //           if (!exp.skills.includes(skillGroup.skills)) {
// //             exp.skills.push(skillGroup.skills);
// //           }
// //           if (skillGroup.hasCertificate && skillGroup.certificateUrl) {
// //             exp.certificateUrl = skillGroup.certificateUrl; 
// //           }
// //           matched = true;
// //           break;
// //         }
// //       }

// //       if (!matched) {
// //         const key = `${orgName}|skills-only`;
// //         if (!expMap.has(key)) {
// //           expMap.set(key, {
// //             organization: orgName,
// //             logo: skillGroup.logo,
// //             jobRole: null,
// //             startDate: skillGroup.startDate,
// //             endDate: skillGroup.endDate,
// //             duration: skillGroup.duration
// //               ? skillGroup.duration
// //               : skillGroup.startDate
// //               ? `${formatDatePart(skillGroup.startDate)} – ${
// //                   skillGroup.endDate ? formatDatePart(skillGroup.endDate) : "Present"
// //                 }`
// //               : "Dates not specified",
// //             skills: [skillGroup.skills],
// //             certificateUrl: skillGroup.hasCertificate ? skillGroup.certificateUrl : null,
// //           });
// //         } else {
// //           expMap.get(key).skills.push(skillGroup.skills);
// //         }
// //       }
// //     });

// //     return Array.from(expMap.values()).sort((a, b) => {
// //       if (!a.startDate && !b.startDate) return 0;
// //       if (!a.startDate) return 1;
// //       if (!b.startDate) return -1;
// //       return new Date(b.startDate) - new Date(a.startDate);
// //     });
// //   }, [profile?.user_role, workExperiences, skillsData]);

// //   function formatDatePart(dateStr) {
// //     if (!dateStr) return "";
// //     const d = new Date(dateStr);
// //     return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
// //   }

// //   if (loading) {
// //     return (
// //       <MainLayout>
// //         <div className="flex items-center justify-center min-h-screen">
// //           <div className="flex flex-col items-center gap-4">
// //             <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
// //             <p className="text-gray-600">Loading public profile...</p>
// //           </div>
// //         </div>
// //       </MainLayout>
// //     );
// //   }

// //   if (error || !profile) {
// //     return (
// //       <MainLayout>
// //         <div className="flex justify-center min-h-screen px-2 bg-gray-100 lg:px-8">
// //           <p className="flex items-center text-red-500">{error || "Profile not found."}</p>
// //         </div>
// //       </MainLayout>
// //     );
// //   }

// //   return (
// //     <MainLayout>
// //       <div className="flex flex-col w-full gap-6 p-4 mx-auto lg:flex-row max-w-7xl">
// //         <div className="flex-grow hidden lg:block"></div>

// //         <div className="w-full max-w-[729px] space-y-6 mx-auto mt-2 mb-10">
          
// //           {/* ===== HEADER SECTION ===== */}
// //           <div className="flex flex-col items-center justify-center p-8 bg-white shadow-sm rounded-xl">
// //             <div className="relative mb-4">
// //               <img
// //                 src={profile.avatar_url ? getImageUrl(profile.avatar_url) : dummyProfile3}
// //                 alt={`${profile.name || "User"}'s profile`}
// //                 className="object-cover w-24 h-24 border-2 border-gray-200 rounded-full shadow-sm"
// //               />
// //               {publicProfileUrl && (
// //                 <button
// //                   onClick={() => copyToClipboard(publicProfileUrl)}
// //                   className="absolute bottom-0 right-0 p-2 text-white transition-colors bg-blue-600 rounded-full shadow-md hover:bg-blue-700"
// //                   title="Copy public profile link"
// //                 >
// //                   <FaLink size={12} />
// //                 </button>
// //               )}
// //             </div>

// //             <div className="text-center">
// //               <h1 className="text-2xl font-bold text-gray-900">
// //                 {profile.name}
// //               </h1>
// //               <p className="mt-1 text-sm text-gray-500">
// //                 @{profile.email?.split("@")[0] || "user"}
// //               </p>

// //               {token && !profileStats?.is_own_profile && (
// //                 <div className="mt-4">
// //                   <button
// //                     onClick={handleToggleFollow}
// //                     className={`px-6 py-2 text-sm font-medium rounded-full transition-colors ${
// //                       isFollowing
// //                         ? "bg-gray-100 text-gray-800 hover:bg-gray-200"
// //                         : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
// //                     }`}
// //                   >
// //                     {isFollowing ? "Following" : "Follow"}
// //                   </button>
// //                 </div>
// //               )}

// //               <div className="flex justify-center gap-6 mt-6 text-sm text-gray-600">
// //                 <span className="flex flex-col items-center">
// //                   <strong className="text-lg text-gray-900">{followersCount}</strong>
// //                   <span>Followers</span>
// //                 </span>
// //                 <span className="flex flex-col items-center">
// //                   <strong className="text-lg text-gray-900">{followingCount}</strong>
// //                   <span>Following</span>
// //                 </span>
// //               </div>
// //             </div>
// //           </div>

// //           {/* ===== ABOUT SECTION ===== */}
// //           <CollapsibleSection
// //             title="About"
// //             isExpanded={expandedSections.about}
// //             onToggle={() => toggleSection("about")}
// //           >
// //             <p className="text-sm text-gray-700 leading-relaxed">
// //               {profile.about || "No about information provided."}
// //             </p>
// //           </CollapsibleSection>

// //           {/* ===== ROLE-SPECIFIC SECTIONS ===== */}
          
// //           {/* COMPANY: Recent Jobs */}
// //           {profile.user_role === "COMPANY" && details?.recent_jobs && (
// //             <CollapsibleSection
// //               title="Recent Job Openings"
// //               isExpanded={expandedSections.professional}
// //               onToggle={() => toggleSection("professional")}
// //             >
// //               <div className="space-y-4">
// //                 {details.recent_jobs.slice(0, 3).map((job) => (
// //                   <div key={job.id} className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition-shadow">
// //                     <h4 className="font-semibold text-gray-900">{job.title}</h4>
// //                     <p className="text-sm text-gray-600 mt-1">
// //                       {job.type} • {job.stipend_range || "Stipend not disclosed"}
// //                     </p>
// //                     <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
// //                       <span>Starts: {job.start_date}</span>
// //                       {job.skills && job.skills.length > 0 && (
// //                         <>
// //                           <span>•</span>
// //                           <span>{job.skills.join(", ")}</span>
// //                         </>
// //                       )}
// //                     </div>
// //                   </div>
// //                 ))}
// //                 {details.recent_jobs.length > 3 && (
// //                   <Link
// //                     to={`/all-jobs?company=${profile.name}`}
// //                     className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
// //                   >
// //                     View all {details.recent_jobs.length} jobs →
// //                   </Link>
// //                 )}
// //               </div>
// //             </CollapsibleSection>
// //           )}

// //           {/* UNIVERSITY: Academic Programs */}
// //           {profile.user_role === "UNIVERSITY" && (
// //             <CollapsibleSection
// //               title="Academic Details"
// //               isExpanded={expandedSections.professional}
// //               onToggle={() => toggleSection("professional")}
// //             >
// //               <FieldRow label="Programs Offered">
// //                 {details?.courses?.length > 0 ? (
// //                   <div className="flex flex-wrap gap-2 mt-2">
// //                     {details.courses.map((course, i) => (
// //                       <span key={i} className="px-3 py-1.5 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-full">
// //                         {course}
// //                       </span>
// //                     ))}
// //                   </div>
// //                 ) : (
// //                   <span className="text-sm text-gray-500">No programs listed.</span>
// //                 )}
// //               </FieldRow>
              
// //               {details?.website && (
// //                 <FieldRow label="Official Website">
// //                   <a
// //                     href={details.website}
// //                     target="_blank"
// //                     rel="noopener noreferrer"
// //                     className="text-sm text-blue-600 hover:underline flex items-center gap-1"
// //                   >
// //                     {details.website}
// //                   </a>
// //                 </FieldRow>
// //               )}
// //             </CollapsibleSection>
// //           )}

// //           {/* STUDENT: Experience & Education */}
// //           {(!profile.user_role || profile.user_role === "STUDENT") && (
// //             <CollapsibleSection
// //               title="Professional Details"
// //               isExpanded={expandedSections.professional}
// //               onToggle={() => toggleSection("professional")}
// //             >
// //               {profile.career_objective && (
// //                 <FieldRow label="Career Objective" value={profile.career_objective} />
// //               )}

// //               <FieldRow label="Experience">
// //                 {unifiedExperiences.length > 0 ? (
// //                   <div className="space-y-4 mt-2">
// //                     {unifiedExperiences.map((exp, idx) => (
// //                       <div key={idx} className="flex gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50">
// //                         <div className="flex-shrink-0 w-12 h-12 overflow-hidden bg-white border border-gray-200 rounded-full flex items-center justify-center">
// //                           {exp.logo ? (
// //                             <img src={getImageUrl(exp.logo)} alt={exp.organization} className="object-contain w-full h-full" />
// //                           ) : (
// //                             <span className="text-sm font-medium text-gray-500">{exp.organization?.charAt(0) || "?"}</span>
// //                           )}
// //                         </div>
// //                         <div className="flex-1 min-w-0">
// //                           <h4 className="font-semibold text-gray-900">{exp.organization || "Organization not specified"}</h4>
// //                           {exp.jobRole && <p className="text-sm font-medium text-gray-700">{exp.jobRole}</p>}
// //                           <p className="text-sm text-gray-500 mt-0.5">{exp.duration}</p>
                          
// //                           {exp.skills.length > 0 && (
// //                             <div className="flex flex-wrap gap-1.5 mt-3">
// //                               {exp.skills.map((skillStr, i) => (
// //                                 <span key={i} className="px-2 py-1 text-xs text-gray-700 bg-white border border-gray-200 rounded">
// //                                   {skillStr}
// //                                 </span>
// //                               ))}
// //                             </div>
// //                           )}
                          
// //                           {exp.certificateUrl && (
// //                             <a href={getImageUrl(exp.certificateUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-3 text-sm text-blue-600 hover:underline">
// //                               📄 View Certificate
// //                             </a>
// //                           )}
// //                         </div>
// //                       </div>
// //                     ))}
// //                   </div>
// //                 ) : (
// //                   <span className="text-sm text-gray-500">No experience listed.</span>
// //                 )}
// //               </FieldRow>

// //               <FieldRow label="Education">
// //                 {educationData.length > 0 ? (
// //                   <div className="space-y-4 mt-2">
// //                     {educationData.map((edu) => (
// //                       <div key={edu.id} className="flex gap-4 p-4 border border-gray-100 rounded-lg bg-gray-50">
// //                         <div className="flex-shrink-0 w-12 h-12 overflow-hidden bg-white border border-gray-200 rounded-full flex items-center justify-center">
// //                           {edu.logo ? (
// //                             <img src={getImageUrl(edu.logo)} alt={edu.institution} className="object-contain w-8 h-8" />
// //                           ) : (
// //                             <span className="text-sm font-medium text-gray-500">{edu.institution.charAt(0)}</span>
// //                           )}
// //                         </div>
// //                         <div className="flex-1 min-w-0">
// //                           <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
// //                           <p className="text-sm text-gray-700 mt-0.5">{edu.institution}</p>
// //                           <p className="text-sm text-gray-500">{edu.duration}</p>
// //                         </div>
// //                       </div>
// //                     ))}
// //                   </div>
// //                 ) : (
// //                   <span className="text-sm text-gray-500">No education details listed.</span>
// //                 )}
// //               </FieldRow>

// //               {profile.language && (
// //                 <FieldRow label="Languages">
// //                   <div className="flex flex-wrap gap-3 mt-1">
// //                     {profile.language.split(",").map((lang, i) => (
// //                       <span key={i} className="flex items-center gap-1.5 text-sm text-gray-700 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
// //                         <span className="w-2 h-2 bg-green-500 rounded-full"></span>
// //                         {lang.trim()}
// //                       </span>
// //                     ))}
// //                   </div>
// //                 </FieldRow>
// //               )}
// //             </CollapsibleSection>
// //           )}

// //           {/* ===== VERIFICATION BADGES ===== */}
// //           <CollapsibleSection
// //             title="Verification Status"
// //             isExpanded={expandedSections.verification}
// //             onToggle={() => toggleSection("verification")}
// //           >
// //             <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
// //               <FieldRow 
// //                 label="Email Verification" 
// //                 value={profile?.verified_badges?.email ? "Verified" : "Not Verified"} 
// //                 isVerified={profile?.verified_badges?.email} 
// //               />
// //               <FieldRow 
// //                 label="Phone Verification" 
// //                 value={profile?.verified_badges?.phone ? "Verified" : "Not Verified"} 
// //                 isVerified={profile?.verified_badges?.phone} 
// //               />
              
// //               {profile?.user_role === "COMPANY" && (
// //                 <FieldRow 
// //                   label="GST Verification" 
// //                   value={profile?.verified_badges?.gst ? "Verified" : "Not Verified"} 
// //                   isVerified={profile?.verified_badges?.gst} 
// //                 />
// //               )}
              
// //               {profile?.user_role === "UNIVERSITY" && (
// //                 <FieldRow 
// //                   label="Aadhaar Verification" 
// //                   value={profile?.verified_badges?.aadhar ? "Verified" : "Not Verified"} 
// //                   isVerified={profile?.verified_badges?.aadhar} 
// //                 />
// //               )}
// //             </div>
// //           </CollapsibleSection>

// //         </div>
// //         <div className="flex-grow hidden lg:block"></div>
// //       </div>
// //     </MainLayout>
// //   );
// // };

// // export default FeedPublicProfilePage;


// import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
// import { Link, useParams } from "react-router-dom";
// import { FaLink, FaChevronDown, FaChevronUp, FaCheckCircle } from "react-icons/fa";
// import MainLayout from "../../../components/layout/MainLayout";
// import { useSelector, useDispatch } from "react-redux";
// import { getImageUrl } from "../../../../utils.js";
// import dummyProfile3 from "../../../assets/dummyProfile3.jpg";
// import usePublicProfile from "../../../hooks/usePublicProfile";
// import { useProfileCompletion } from "../../../hooks/useProfileCompletion";
// import feedApi from "../../../api/feedApi";
// import { Loader2 } from "lucide-react";
// import axios from "axios";
// import Select from "react-select";
// import { universityApi } from "../../../api/university/universityApi";
// import { updateUser } from "../../../redux/feature/authSlice";
// import { useMasterData } from "../../../hooks/master/useMasterData";

// const BASE_URL = import.meta.env.VITE_BASE_URL;

// function aboutSectionBar(aboutText) {
//   const ok = !!(aboutText && String(aboutText).trim());
//   return { weight: 5, score: ok ? 5 : 0 };
// }

// function highlightsSectionBar(f) {
//   let w = 0;
//   let s = 0;
//   const hit = (v, wt) => {
//     w += wt;
//     if (v && String(v).trim()) s += wt;
//   };
//   hit(f.address, 5);
//   hit(f.pincode, 5);
//   hit(f.website_link, 5);
//   hit(f.social_media_link, 2.5);
//   return { weight: w, score: s };
// }

// function coursesSectionBar(courseCount, breakdownSlice) {
//   if (
//     breakdownSlice &&
//     !breakdownSlice.not_applicable &&
//     typeof breakdownSlice.weight === "number" &&
//     breakdownSlice.weight > 0
//   ) {
//     return {
//       weight: breakdownSlice.weight,
//       score: Math.min(
//         breakdownSlice.weight,
//         typeof breakdownSlice.score === "number" ? breakdownSlice.score : 0
//       ),
//     };
//   }
//   const n = courseCount || 0;
//   const score = Math.min(20, (n / 3) * 20);
//   return { weight: 20, score };
// }

// function verificationSectionBar(breakdownSlice, verifiedBadges) {
//   if (
//     breakdownSlice &&
//     !breakdownSlice.not_applicable &&
//     typeof breakdownSlice.weight === "number" &&
//     breakdownSlice.weight > 0
//   ) {
//     return {
//       weight: breakdownSlice.weight,
//       score: Math.min(
//         breakdownSlice.weight,
//         typeof breakdownSlice.score === "number" ? breakdownSlice.score : 0
//       ),
//     };
//   }
//   let s = 0;
//   if (verifiedBadges?.email) s += 5;
//   if (verifiedBadges?.phone) s += 5;
//   if (verifiedBadges?.aadhar) s += 5;
//   return { weight: 20, score: Math.min(20, s) };
// }

// // ===== REUSABLE UI (FeedView parity: optional progress + Edit / Save / Cancel) =====

// const CollapsibleSection = ({
//   title,
//   children,
//   isExpanded,
//   onToggle,
//   weight,
//   score,
//   showEditControls = false,
//   onEditClick,
//   onSaveClick,
//   onCancelClick,
//   isEditing,
//   isSaving,
// }) => {
//   const showProgress = typeof weight === "number" && weight > 0;
//   const safeWeight = showProgress ? weight : 1;
//   const cappedScore = showProgress ? Math.min(score || 0, weight) : 0;
//   const percentage = showProgress
//     ? Math.min(100, Math.round((cappedScore / safeWeight) * 100))
//     : 0;
//   const isComplete = showProgress && percentage === 100;
//   const richHeader = showProgress || showEditControls;

//   return (
//     <div className="overflow-hidden bg-white shadow-sm rounded-xl">
//       <div
//         className={`flex items-center justify-between p-4 transition-colors ${
//           richHeader ? "cursor-pointer hover:bg-gray-50" : "cursor-pointer hover:bg-gray-50"
//         }`}
//         onClick={onToggle}
//       >
//         <div className="flex items-center gap-3">
//           <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
//           {isComplete && <FaCheckCircle className="text-green-500" size={18} />}
//         </div>
//         <div className="flex items-center gap-4">
//           {showProgress && (
//             <div className="flex items-center gap-2">
//               <div
//                 className={`w-24 h-2 rounded-full ${
//                   isComplete ? "bg-green-200" : "bg-yellow-200"
//                 }`}
//               >
//                 <div
//                   className={`h-full rounded-full transition-all ${
//                     isComplete ? "bg-green-500" : "bg-yellow-500"
//                   }`}
//                   style={{ width: `${percentage}%` }}
//                 />
//               </div>
//               <span
//                 className={`text-sm font-medium min-w-[2.5rem] text-right ${
//                   isComplete ? "text-green-600" : "text-yellow-600"
//                 }`}
//               >
//                 {percentage}%
//               </span>
//             </div>
//           )}
//           {showEditControls && (
//             <div className="flex items-center gap-2">
//               {isEditing ? (
//                 <>
//                   <button
//                     type="button"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onSaveClick?.();
//                     }}
//                     className="text-sm font-medium text-green-600 hover:text-green-800 disabled:opacity-50"
//                     disabled={isSaving}
//                   >
//                     {isSaving ? "Saving…" : "Save"}
//                   </button>
//                   <button
//                     type="button"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onCancelClick?.();
//                     }}
//                     className="text-sm font-medium text-gray-500 hover:text-gray-700"
//                   >
//                     Cancel
//                   </button>
//                 </>
//               ) : (
//                 <button
//                   type="button"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onEditClick?.();
//                   }}
//                   className="text-sm font-medium text-blue-600 hover:text-blue-800"
//                 >
//                   Edit
//                 </button>
//               )}
//             </div>
//           )}
//           <button type="button" className="p-1 transition-colors rounded hover:bg-gray-200">
//             {isExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
//           </button>
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

// const FieldRow = ({
//   label,
//   value,
//   isVerified = false,
//   children,
//   isEditable = false,
//   editValue,
//   onChange,
//   type = "text",
//   placeholder = "",
//   rows = 3,
// }) => {
//   return (
//     <div className="py-3 border-b border-gray-200 last:border-0">
//       <div className="flex items-start justify-between">
//         <div className="flex-1">
//           <div className="flex items-center gap-2 mb-1">
//             <span className="text-sm font-medium text-gray-700">{label}</span>
//             {isVerified && <FaCheckCircle className="text-green-500" size={14} />}
//           </div>
//           {isEditable ? (
//             type === "custom" ? (
//               <div className="w-full">{children}</div>
//             ) : type === "textarea" ? (
//               <textarea
//                 value={editValue ?? ""}
//                 onChange={(e) => onChange?.(e.target.value)}
//                 className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 rows={rows}
//                 placeholder={placeholder}
//               />
//             ) : (
//               <input
//                 type={type}
//                 value={editValue ?? ""}
//                 onChange={(e) => onChange?.(e.target.value)}
//                 className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder={placeholder}
//               />
//             )
//           ) : children ? (
//             <div className="mt-1">{children}</div>
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

// // ===== MAIN COMPONENT =====

// const FeedPublicProfilePage = () => {
//   const { uuid } = useParams();
//   const dispatch = useDispatch();
//   const { token, user } = useSelector((state) => state.auth);
//   const { courses: masterCourses } = useMasterData();

//   const {
//     profile,
//     profileStats,
//     workExperiences,
//     educationData,
//     skillsData,
//     details,
//     userActivity,
//     loading,
//     error,
//     getUserPublicProfileByUUID,
//   } = usePublicProfile();

//   const {
//     percentage: completionPercentage,
//     breakdown: completionBreakdown,
//     loading: completionLoading,
//     refetch: refetchCompletion,
//   } = useProfileCompletion(true);

//   const [isFollowing, setIsFollowing] = useState(false);
//   const [followersCount, setFollowersCount] = useState(0);
//   const [followingCount, setFollowingCount] = useState(0);
//   const [toastMessage, setToastMessage] = useState(null);

//   /** Full university row for PUT /universitydetail (own profile edit on public page). */
//   const [uniForm, setUniForm] = useState(null);
//   const [uniFormReady, setUniFormReady] = useState(false);
//   const [editingUni, setEditingUni] = useState({
//     about: false,
//     highlights: false,
//     university_courses: false,
//   });
//   const [savingUniSection, setSavingUniSection] = useState(null);
//   const [courseOptions, setCourseOptions] = useState([]);
//   const [courseSearch, setCourseSearch] = useState("");
//   const [isCourseLoading, setIsCourseLoading] = useState(false);
//   const courseTimeoutRef = useRef(null);

//   // UI State for sections - same as FeedView expanded state structure
//   const [expandedSections, setExpandedSections] = useState({
//     about: false,
//     career_objective: false,
//     skills: false,
//     work_experience: false,
//     education: false,
//     languages: false,
//     authentication: false,
//     activity: false,
//     resume: false,
//     professional: false,
//     verification: false,
//     highlights: false,
//     university_courses: false,
//     feed_activity: false,
//   });

//   const toggleSection = (section) => {
//     setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
//   };

//   const isUniversityOwn =
//     Boolean(token) &&
//     profile?.user_role === "UNIVERSITY" &&
//     Boolean(profileStats?.is_own_profile);

//   const loadUniForm = useCallback(async () => {
//     if (!token || !user?.id) return;
//     try {
//       const response = await universityApi.getUniversityDetailsById(user.id, token);
//       const data = response.data;
//       setUniForm({
//         college_name: data.college_name || "",
//         affiliated_university: data.affiliated_university || "",
//         authorization_letter_url: data.authorization_letter_url || "",
//         about: data.about || "",
//         course_ids: data.courses?.map((c) => c.id) || [],
//         pincode: data.pincode || "",
//         website_link: data.website_link || "",
//         address: data.address || "",
//         phone: data.User?.phone || data.phone || "",
//         email: data.User?.email || data.email || "",
//         social_media_link: data.social_media_link || "",
//         profile_pic: data.profile_pic || "",
//         university_logo_url: data.university_logo_url || "",
//       });
//       setUniFormReady(true);
//     } catch (e) {
//       console.error("Failed to load university edit form", e);
//       setUniFormReady(false);
//     }
//   }, [token, user?.id]);

//   useEffect(() => {
//     if (!isUniversityOwn) {
//       setUniForm(null);
//       setUniFormReady(false);
//       setEditingUni({ about: false, highlights: false, university_courses: false });
//       return;
//     }
//     loadUniForm();
//   }, [isUniversityOwn, loadUniForm]);

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
//           `${BASE_URL}/master/courses/search?search=${encodeURIComponent(courseSearch)}`
//         );
//         const data = res.data?.data || [];
//         setCourseOptions(
//           data.map((c) => ({
//             value: c.id,
//             label: c.name,
//           }))
//         );
//       } catch {
//         setCourseOptions([]);
//       } finally {
//         setIsCourseLoading(false);
//       }
//     }, 400);
//     return () => {
//       if (courseTimeoutRef.current) clearTimeout(courseTimeoutRef.current);
//     };
//   }, [courseSearch]);

//   const reconstructUniversityData = (rawData) => ({
//     ...rawData,
//     courses: rawData.courses || [],
//   });

//   const isFieldComplete = (v) => {
//     if (Array.isArray(v)) return v.length > 0;
//     return !!(v && String(v).trim());
//   };

//   const getSelectedCourses = () => {
//     if (!uniForm?.course_ids?.length) return [];
//     return uniForm.course_ids
//       .map((id) => {
//         const course = masterCourses?.find((c) => c.id === id);
//         return course ? { value: course.id, label: course.name } : null;
//       })
//       .filter(Boolean);
//   };

//   const startUniSectionEdit = (key) => {
//     setEditingUni((prev) => ({ ...prev, [key]: true }));
//     setExpandedSections((prev) => ({ ...prev, [key]: true }));
//   };

//   const stopUniSectionEdit = (key) => {
//     setEditingUni((prev) => ({ ...prev, [key]: false }));
//   };

//   const cancelUniSection = async (key) => {
//     await loadUniForm();
//     stopUniSectionEdit(key);
//   };

//   const handleUniFormChange = (field, value) => {
//     setUniForm((prev) => (prev ? { ...prev, [field]: value } : prev));
//   };

//   const saveUniSection = async (key) => {
//     if (!token || !uniForm) return;
//     setSavingUniSection(key);
//     try {
//       const response = await universityApi.updateUniversityDetails(uniForm, token);
//       if (!response.success) throw new Error(response.message || "Update failed");
//       const updatedData = reconstructUniversityData(response.data);
//       setUniForm({
//         college_name: updatedData.college_name || "",
//         affiliated_university: updatedData.affiliated_university || "",
//         authorization_letter_url: updatedData.authorization_letter_url || "",
//         about: updatedData.about || "",
//         course_ids: updatedData.courses?.map((c) => c.id) || [],
//         pincode: updatedData.pincode || "",
//         website_link: updatedData.website_link?.trim() || "",
//         address: updatedData.address || "",
//         phone: updatedData.phone || "",
//         email: updatedData.email || "",
//         social_media_link: updatedData.social_media_link?.trim() || "",
//         profile_pic: updatedData.profile_pic?.trim() || "",
//         university_logo_url: updatedData.university_logo_url?.trim() || "",
//       });
//       dispatch(
//         updateUser({
//           user_profile_pic: updatedData.profile_pic || null,
//           about_us: updatedData.about || null,
//           organization_name: updatedData.college_name || null,
//           organization_logo: updatedData.university_logo_url || null,
//           email: updatedData.email || uniForm.email,
//           phone: updatedData.phone || uniForm.phone,
//         })
//       );
//       await getUserPublicProfileByUUID(uuid, token);
//       await refetchCompletion?.();
//       setToastMessage({ type: "success", text: "Profile updated." });
//       setTimeout(() => setToastMessage(null), 3000);
//       stopUniSectionEdit(key);
//     } catch (err) {
//       console.error(err);
//       setToastMessage({ type: "error", text: "Could not save. Try again." });
//       setTimeout(() => setToastMessage(null), 3000);
//     } finally {
//       setSavingUniSection(null);
//     }
//   };

//   const uniSectionBars = useMemo(() => {
//     if (!isUniversityOwn || !profile) return null;
//     const b = completionBreakdown;
//     const aboutText = uniForm?.about ?? profile?.about ?? "";
//     const highlights = highlightsSectionBar({
//       address: uniForm?.address ?? details?.address ?? "",
//       pincode: uniForm?.pincode ?? details?.pincode ?? "",
//       website_link: uniForm?.website_link ?? details?.website ?? "",
//       social_media_link: uniForm?.social_media_link ?? details?.social_link ?? "",
//     });
//     const courseCount =
//       uniForm?.course_ids != null
//         ? uniForm.course_ids.length
//         : details?.courses?.length ?? 0;
//     const courses = coursesSectionBar(courseCount, b?.courses_offered);
//     const verification = verificationSectionBar(b?.verification, profile?.verified_badges);
//     return {
//       about: aboutSectionBar(aboutText),
//       highlights,
//       courses,
//       verification,
//     };
//   }, [
//     isUniversityOwn,
//     profile,
//     details,
//     completionBreakdown,
//     uniForm?.about,
//     uniForm?.address,
//     uniForm?.pincode,
//     uniForm?.website_link,
//     uniForm?.social_media_link,
//     uniForm?.course_ids,
//   ]);

//   const publicProfileUrl = profile?.uuid
//     ? `${window.location.origin}/public-profile/${profile.uuid}`
//     : "";

//   const copyToClipboard = (text) => {
//     if (text) {
//       navigator.clipboard.writeText(text).then(() => {
//         setToastMessage({ type: "success", text: "Profile link copied!" });
//         setTimeout(() => setToastMessage(null), 3000);
//       });
//     }
//   };

//   useEffect(() => {
//     if (uuid) {
//       getUserPublicProfileByUUID(uuid, token);
//     }
//   }, [uuid, token]);

//   useEffect(() => {
//     if (
//       token &&
//       profile?.user_role === "UNIVERSITY" &&
//       profileStats?.is_own_profile
//     ) {
//       refetchCompletion?.();
//     }
//   }, [
//     token,
//     profile?.user_role,
//     profileStats?.is_own_profile,
//     uuid,
//     refetchCompletion,
//   ]);

//   useEffect(() => {
//     if (profileStats) {
//       setIsFollowing(profileStats.is_following);
//       setFollowersCount(profileStats.followers_count || 0);
//       setFollowingCount(profileStats.following_count || 0);
//     }
//   }, [profileStats]);

//   const handleToggleFollow = async () => {
//     if (!token) {
//       window.location.href = "/login";
//       return;
//     }
//     try {
//       setIsFollowing(!isFollowing);
//       setFollowersCount((prev) =>
//         !isFollowing ? prev + 1 : Math.max(0, prev - 1)
//       );
//       await feedApi.followUnfollowUser(profile.id, token);
//       setToastMessage({ type: "success", text: isFollowing ? "Unfollowed user" : "Following user!" });
//       setTimeout(() => setToastMessage(null), 3000);
//     } catch (err) {
//       setToastMessage({ type: "error", text: "Failed to update follow status." });
//       setTimeout(() => setToastMessage(null), 3000);
//       setIsFollowing(isFollowing);
//     }
//   };

//   // Helper to format date ranges like FeedView
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

//   // Unified experiences combining workExperiences and skillsData (same as original)
//   const unifiedExperiences = useMemo(() => {
//     if (profile?.user_role !== "STUDENT") return [];

//     const expMap = new Map();

//     workExperiences.forEach((exp) => {
//       const key = `${exp.company || "Unknown"}|${exp.start_date || ""}`;
//       expMap.set(key, {
//         organization: exp.company,
//         logo: exp.logo,
//         jobRole: exp.position,
//         startDate: exp.start_date,
//         endDate: exp.end_date,
//         duration: exp.duration,
//         skills: [],
//         certificateUrl: exp.certificateUrl,
//       });
//     });

//     skillsData.forEach((skillGroup) => {
//       const orgName = skillGroup.organization || "Other";
//       let matched = false;
//       for (let [key, exp] of expMap.entries()) {
//         if (exp.organization === orgName) {
//           if (!exp.skills.includes(skillGroup.skills)) {
//             exp.skills.push(skillGroup.skills);
//           }
//           if (skillGroup.hasCertificate && skillGroup.certificateUrl) {
//             exp.certificateUrl = skillGroup.certificateUrl;
//           }
//           matched = true;
//           break;
//         }
//       }

//       if (!matched) {
//         const key = `${orgName}|skills-only`;
//         if (!expMap.has(key)) {
//           expMap.set(key, {
//             organization: orgName,
//             logo: skillGroup.logo,
//             jobRole: null,
//             startDate: skillGroup.startDate,
//             endDate: skillGroup.endDate,
//             duration: skillGroup.duration
//               ? skillGroup.duration
//               : skillGroup.startDate
//               ? `${formatDatePart(skillGroup.startDate)} – ${
//                   skillGroup.endDate ? formatDatePart(skillGroup.endDate) : "Present"
//                 }`
//               : "Dates not specified",
//             skills: [skillGroup.skills],
//             certificateUrl: skillGroup.hasCertificate ? skillGroup.certificateUrl : null,
//           });
//         } else {
//           expMap.get(key).skills.push(skillGroup.skills);
//         }
//       }
//     });

//     return Array.from(expMap.values()).sort((a, b) => {
//       if (!a.startDate && !b.startDate) return 0;
//       if (!a.startDate) return 1;
//       if (!b.startDate) return -1;
//       return new Date(b.startDate) - new Date(a.startDate);
//     });
//   }, [profile?.user_role, workExperiences, skillsData]);

//   function formatDatePart(dateStr) {
//     if (!dateStr) return "";
//     const d = new Date(dateStr);
//     return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
//   }

//   // Get file name from URL helper
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

//   const displayCompletionPct = Math.min(
//     100,
//     Math.max(0, Math.round(Number(completionPercentage) || 0))
//   );

//   if (loading) {
//     return (
//       <MainLayout>
//         <div className="flex justify-center min-h-screen px-4 bg-gray-100">
//           <div className="flex flex-col items-center justify-center w-full gap-4">
//             <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
//             <p className="text-gray-600">Loading public profile...</p>
//           </div>
//         </div>
//       </MainLayout>
//     );
//   }

//   if (error || !profile) {
//     return (
//       <MainLayout>
//         <div className="flex justify-center min-h-screen px-4 bg-gray-100">
//           <p className="flex items-center justify-center w-full text-red-500">
//             {error || "Profile not found."}
//           </p>
//         </div>
//       </MainLayout>
//     );
//   }

//   return (
//     <MainLayout>
//       {/* FULL WIDTH CONTAINER - same as FeedView */}
//       <div className="flex flex-col min-h-screen bg-gray-100">
//         {/* Main Content - Full Width */}
//         <section className="w-full px-4 py-6 mx-auto">
//           <div className="w-full mx-auto bg-white rounded-[10px] shadow-lg">
            
//             {/* Profile Header - Full Width (same as FeedView) */}
//             <div className="flex flex-col items-center p-6 bg-gradient-to-b from-white to-gray-50 border-b border-gray-200 rounded-t-[10px]">
//               <div className="relative group">
//                 <div className="w-20 h-20 overflow-hidden transition-shadow border-4 border-gray-200 rounded-full sm:w-24 sm:h-24 hover:shadow-lg">
//                   <img
//                     src={profile.avatar_url ? getImageUrl(profile.avatar_url) : dummyProfile3}
//                     alt="Profile"
//                     className="object-cover w-full h-full"
//                   />
//                 </div>
//                 <FaLink
//                   onClick={() => copyToClipboard(publicProfileUrl)}
//                   className="absolute w-4 h-4 p-1 text-blue-600 transition-opacity bg-white rounded-full opacity-0 cursor-pointer hover:text-blue-800 group-hover:opacity-100"
//                   style={{ bottom: "2px", left: "2px" }}
//                   title="Copy public profile link"
//                 />
//               </div>

//               <div className="flex flex-col items-center">
//                 <h1 className="mt-4 text-xl font-bold text-gray-900 sm:text-2xl">
//                   {profile.name}
//                 </h1>
//                 <p className="text-sm text-gray-500">
//                   @{profile.email?.split("@")[0] || "user"}
//                 </p>
//                 {profile.user_role === "UNIVERSITY" &&
//                   (details?.address || details?.pincode) && (
//                     <p className="mt-2 text-sm text-center text-gray-600 max-w-md px-2">
//                       {[details?.address, details?.pincode]
//                         .filter(Boolean)
//                         .join(" · ")}
//                     </p>
//                   )}
//               </div>

//               {/* Overall profile completion — same block as FeedView (university viewing own public profile) */}
//               {profile.user_role === "UNIVERSITY" &&
//                 profileStats?.is_own_profile &&
//                 token && (
//                   <div className="w-full pt-4 mt-5 border-t border-gray-100">
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="text-sm font-medium text-gray-700">
//                         Profile Completion
//                       </span>
//                       <span className="text-sm font-semibold text-blue-600">
//                         {completionLoading
//                           ? "…"
//                           : `${displayCompletionPct}% Complete`}
//                       </span>
//                     </div>
//                     <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
//                       <div
//                         className={`h-full rounded-full transition-all duration-500 ease-out ${
//                           displayCompletionPct === 100
//                             ? "bg-gradient-to-r from-green-400 to-green-500"
//                             : "bg-gradient-to-r from-blue-500 to-blue-600"
//                         }`}
//                         style={{
//                           width: `${completionLoading ? 0 : displayCompletionPct}%`,
//                         }}
//                       />
//                     </div>
//                     {!completionLoading && displayCompletionPct < 100 && (
//                       <p className="flex items-center gap-1 mt-2 text-xs text-gray-500">
//                         <span className="inline-block w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
//                         Complete your profile to stand out!
//                       </p>
//                     )}
//                     {!completionLoading && displayCompletionPct === 100 && (
//                       <p className="flex items-center gap-1 mt-2 text-xs font-medium text-green-600">
//                         <FaCheckCircle size={12} /> Profile complete!
//                       </p>
//                     )}
//                   </div>
//                 )}

//               {/* Follow Stats - similar to FeedView completion bar styling */}
//               <div className="w-full pt-4 mt-5 border-t border-gray-100">
//                 <div className="flex items-center justify-center gap-8 mb-2">
//                   <div className="flex flex-col items-center">
//                     <span className="text-lg font-bold text-gray-900">{followersCount}</span>
//                     <span className="text-sm text-gray-500">Followers</span>
//                   </div>
//                   <div className="flex flex-col items-center">
//                     <span className="text-lg font-bold text-gray-900">{followingCount}</span>
//                     <span className="text-sm text-gray-500">Following</span>
//                   </div>
//                 </div>
                
//                 {token && !profileStats?.is_own_profile && (
//                   <div className="flex justify-center mt-2">
//                     <button
//                       onClick={handleToggleFollow}
//                       className={`px-6 py-2 text-sm font-medium rounded-full transition-colors ${
//                         isFollowing
//                           ? "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300"
//                           : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
//                       }`}
//                     >
//                       {isFollowing ? "Following" : "Follow"}
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Toast Message - same as FeedView */}
//             {toastMessage && (
//               <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in ${
//                 toastMessage.type === "success" 
//                   ? "bg-green-500 text-white" 
//                   : "bg-red-500 text-white"
//               }`}>
//                 {toastMessage.type === "success" ? <FaCheckCircle /> : <span>⚠️</span>}
//                 <span className="text-sm font-medium">{toastMessage.text}</span>
//               </div>
//             )}

//             {/* ===== SECTIONS CONTAINER - Full Width ===== */}
//             <div className="p-4 space-y-4">

//               {/* ABOUT — university (own): FeedView-style bar + Edit/Save; others read-only */}
//               <CollapsibleSection
//                 title="About"
//                 isExpanded={expandedSections.about}
//                 onToggle={() => toggleSection("about")}
//                 {...(isUniversityOwn && uniSectionBars && uniFormReady
//                   ? {
//                       weight: uniSectionBars.about.weight,
//                       score: uniSectionBars.about.score,
//                       showEditControls: true,
//                       isEditing: editingUni.about,
//                       onEditClick: () => startUniSectionEdit("about"),
//                       onSaveClick: () => saveUniSection("about"),
//                       onCancelClick: () => cancelUniSection("about"),
//                       isSaving: savingUniSection === "about",
//                     }
//                   : {})}
//               >
//                 <FieldRow
//                   label="About Me"
//                   value={profile?.about}
//                   isVerified={
//                     isUniversityOwn
//                       ? isFieldComplete(uniForm?.about ?? profile?.about)
//                       : !!(profile?.about && profile.about.trim() !== "")
//                   }
//                   isEditable={Boolean(isUniversityOwn && uniFormReady && editingUni.about)}
//                   editValue={uniForm?.about ?? ""}
//                   onChange={(v) => handleUniFormChange("about", v)}
//                   type="textarea"
//                   rows={4}
//                   placeholder="Tell visitors about your institution…"
//                 />
//               </CollapsibleSection>

//               {/* UNIVERSITY: highlights, courses, activity */}
//               {profile.user_role === "UNIVERSITY" && (
//                 <>
//                   <CollapsibleSection
//                     title="Profile Highlights"
//                     isExpanded={expandedSections.highlights}
//                     onToggle={() => toggleSection("highlights")}
//                     {...(isUniversityOwn && uniSectionBars && uniFormReady
//                       ? {
//                           weight: uniSectionBars.highlights.weight,
//                           score: uniSectionBars.highlights.score,
//                           showEditControls: true,
//                           isEditing: editingUni.highlights,
//                           onEditClick: () => startUniSectionEdit("highlights"),
//                           onSaveClick: () => saveUniSection("highlights"),
//                           onCancelClick: () => cancelUniSection("highlights"),
//                           isSaving: savingUniSection === "highlights",
//                         }
//                       : {})}
//                   >
//                     <FieldRow
//                       label="Address"
//                       value={details?.address}
//                       isVerified={isFieldComplete(uniForm?.address ?? details?.address)}
//                       isEditable={Boolean(isUniversityOwn && uniFormReady && editingUni.highlights)}
//                       editValue={uniForm?.address ?? ""}
//                       onChange={(v) => handleUniFormChange("address", v)}
//                       type="textarea"
//                       rows={2}
//                       placeholder="Full address"
//                     />
//                     <FieldRow
//                       label="Pincode"
//                       value={details?.pincode}
//                       isVerified={isFieldComplete(uniForm?.pincode ?? details?.pincode)}
//                       isEditable={Boolean(isUniversityOwn && uniFormReady && editingUni.highlights)}
//                       editValue={uniForm?.pincode ?? ""}
//                       onChange={(v) => handleUniFormChange("pincode", v)}
//                       placeholder="Pincode"
//                     />
//                     <FieldRow
//                       label="Official Website"
//                       isVerified={isFieldComplete(uniForm?.website_link ?? details?.website)}
//                       isEditable={Boolean(isUniversityOwn && uniFormReady && editingUni.highlights)}
//                       editValue={uniForm?.website_link ?? ""}
//                       onChange={(v) => handleUniFormChange("website_link", v)}
//                       placeholder="https://…"
//                     >
//                       {!isUniversityOwn || !editingUni.highlights ? (
//                         details?.website ? (
//                           <a
//                             href={
//                               String(details.website).startsWith("http")
//                                 ? details.website
//                                 : `https://${details.website}`
//                             }
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="text-sm text-blue-600 hover:underline break-all"
//                           >
//                             {details.website}
//                           </a>
//                         ) : (
//                           <p className="text-sm text-gray-500">Not provided</p>
//                         )
//                       ) : null}
//                     </FieldRow>
//                     <FieldRow
//                       label="Social Media"
//                       isVerified={isFieldComplete(uniForm?.social_media_link ?? details?.social_link)}
//                       isEditable={Boolean(isUniversityOwn && uniFormReady && editingUni.highlights)}
//                       editValue={uniForm?.social_media_link ?? ""}
//                       onChange={(v) => handleUniFormChange("social_media_link", v)}
//                       placeholder="https://…"
//                     >
//                       {!isUniversityOwn || !editingUni.highlights ? (
//                         details?.social_link ? (
//                           <a
//                             href={
//                               String(details.social_link).startsWith("http")
//                                 ? details.social_link
//                                 : `https://${details.social_link}`
//                             }
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="text-sm text-blue-600 hover:underline break-all"
//                           >
//                             {details.social_link}
//                           </a>
//                         ) : (
//                           <p className="text-sm text-gray-500">Not provided</p>
//                         )
//                       ) : null}
//                     </FieldRow>
//                   </CollapsibleSection>

//                   <CollapsibleSection
//                     title="Programs & Courses"
//                     isExpanded={expandedSections.university_courses}
//                     onToggle={() => toggleSection("university_courses")}
//                     {...(isUniversityOwn && uniSectionBars && uniFormReady
//                       ? {
//                           weight: uniSectionBars.courses.weight,
//                           score: uniSectionBars.courses.score,
//                           showEditControls: true,
//                           isEditing: editingUni.university_courses,
//                           onEditClick: () => startUniSectionEdit("university_courses"),
//                           onSaveClick: () => saveUniSection("university_courses"),
//                           onCancelClick: () => cancelUniSection("university_courses"),
//                           isSaving: savingUniSection === "university_courses",
//                         }
//                       : {})}
//                   >
//                     <FieldRow
//                       label="Programs offered"
//                       isVerified={
//                         isUniversityOwn
//                           ? isFieldComplete(uniForm?.course_ids)
//                           : !!(details?.courses && details.courses.length > 0)
//                       }
//                       isEditable={Boolean(isUniversityOwn && uniFormReady && editingUni.university_courses)}
//                       type="custom"
//                     >
//                       {isUniversityOwn && editingUni.university_courses ? (
//                         <Select
//                           isMulti
//                           options={courseOptions}
//                           value={getSelectedCourses()}
//                           onChange={(selected) => {
//                             const ids = selected ? selected.map((opt) => opt.value) : [];
//                             handleUniFormChange("course_ids", ids);
//                           }}
//                           onInputChange={(inputValue, meta) => {
//                             if (meta.action === "input-change") setCourseSearch(inputValue);
//                           }}
//                           placeholder="Search courses (type 3+ letters)"
//                           isLoading={isCourseLoading}
//                           noOptionsMessage={() =>
//                             courseSearch.length < 3 ? "Type at least 3 letters to search" : "No courses found"
//                           }
//                           className="text-sm"
//                         />
//                       ) : details?.courses && details.courses.length > 0 ? (
//                         <div className="flex flex-wrap gap-2 mt-2">
//                           {details.courses.map((course, i) => (
//                             <span
//                               key={i}
//                               className="px-3 py-1.5 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-full"
//                             >
//                               {course}
//                             </span>
//                           ))}
//                         </div>
//                       ) : (
//                         <p className="text-sm text-gray-500">No programs listed yet.</p>
//                       )}
//                     </FieldRow>
//                   </CollapsibleSection>

//                   <CollapsibleSection
//                     title="Recent Activity"
//                     isExpanded={expandedSections.feed_activity}
//                     onToggle={() => toggleSection("feed_activity")}
//                   >
//                     {userActivity && userActivity.length > 0 ? (
//                       <div className="grid gap-3">
//                         {userActivity.map((post) => (
//                           <div
//                             key={post.id || post.slug || post.created_at}
//                             className="flex gap-3 p-3 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50"
//                           >
//                             <div className="flex-1 min-w-0">
//                               <p className="text-sm font-medium text-gray-900">
//                                 {post.caption || post.content || "Post"}
//                               </p>
//                               {post.created_at && (
//                                 <p className="mt-1 text-xs text-gray-500">
//                                   {new Date(post.created_at).toLocaleString()}
//                                 </p>
//                               )}
//                               {post.image && (
//                                 <img
//                                   src={getImageUrl(post.image)}
//                                   alt=""
//                                   className="object-cover w-full max-w-md mt-2 rounded-md border border-gray-100"
//                                 />
//                               )}
//                             </div>
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <p className="text-sm text-gray-500">No recent activity yet.</p>
//                     )}
//                   </CollapsibleSection>
//                 </>
//               )}

//               {/* CAREER OBJECTIVE - for students */}
//               {(profile?.user_role === "STUDENT" || !profile?.user_role) && profile?.career_objective && (
//                 <CollapsibleSection
//                   title="Career Objective"
//                   isExpanded={expandedSections.career_objective}
//                   onToggle={() => toggleSection('career_objective')}
//                 >
//                   <FieldRow
//                     label="Career Objective"
//                     value={profile?.career_objective}
//                     isVerified={profile?.career_objective && profile.career_objective.trim() !== ""}
//                   />
//                 </CollapsibleSection>
//               )}

//               {/* RESUME - for students */}
//               {(profile?.user_role === "STUDENT" || !profile?.user_role) && profile?.resume && (
//                 <CollapsibleSection
//                   title="Resume"
//                   isExpanded={expandedSections.resume}
//                   onToggle={() => toggleSection('resume')}
//                 >
//                   <div className="py-3">
//                     <div className="flex items-center gap-2 mb-2">
//                       <span className="text-sm font-medium text-gray-700">Resume File</span>
//                       <FaCheckCircle className="text-green-500" size={14} />
//                     </div>
//                     <div className="flex flex-wrap items-center gap-3">
//                       <span className="text-sm text-gray-600 truncate max-w-[200px]">{getFileNameFromUrl(profile.resume)}</span>
//                       <a href={getImageUrl(profile.resume)} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-green-600 hover:text-green-800">
//                         View
//                       </a>
//                     </div>
//                   </div>
//                 </CollapsibleSection>
//               )}

//               {/* SKILLS - for students */}
//               {(profile?.user_role === "STUDENT" || !profile?.user_role) && (
//                 <CollapsibleSection
//                   title="Experience-Skills"
//                   isExpanded={expandedSections.skills}
//                   onToggle={() => toggleSection('skills')}
//                 >
//                   {unifiedExperiences.length > 0 ? (
//                     <div className="grid gap-3 md:grid-cols-2">
//                       {unifiedExperiences.map((exp, idx) => (
//                         <div key={idx} className="flex gap-3 p-3 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50">
//                           <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 overflow-hidden bg-gray-100 rounded-full">
//                             {exp.logo ? (
//                               <img src={getImageUrl(exp.logo)} alt={exp.organization} className="object-contain w-8 h-8" />
//                             ) : (
//                               <span className="text-xs font-medium text-gray-500">{exp.organization?.charAt(0) || "?"}</span>
//                             )}
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <h4 className="font-medium text-gray-900">{exp.organization}</h4>
//                             {exp.jobRole && <p className="text-sm font-medium text-gray-700">{exp.jobRole}</p>}
//                             <p className="mb-1 text-sm text-gray-500">{exp.duration}</p>
//                             {exp.skills.length > 0 && (
//                               <p className="text-sm text-gray-700">{exp.skills.join(", ")}</p>
//                             )}
//                             {exp.certificateUrl && (
//                               <a href={getImageUrl(exp.certificateUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-1 text-sm text-blue-600 hover:underline">
//                                 📄 View Certificate
//                               </a>
//                             )}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <p className="py-2 text-sm text-gray-500">No skills added yet</p>
//                   )}
//                 </CollapsibleSection>
//               )}

//               {/* WORK EXPERIENCE - for non-students (commented out in original, but keeping pattern) */}
//               {/* COMPANY: Recent Jobs */}
//               {profile.user_role === "COMPANY" && details?.recent_jobs && details.recent_jobs.length > 0 && (
//                 <CollapsibleSection
//                   title="Recent Job Openings"
//                   isExpanded={expandedSections.work_experience}
//                   onToggle={() => toggleSection('work_experience')}
//                 >
//                   <div className="space-y-3">
//                     {details.recent_jobs.slice(0, 5).map((job) => (
//                       <div key={job.id} className="p-3 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50">
//                         <h4 className="font-medium text-gray-900">{job.title}</h4>
//                         <p className="text-sm text-gray-600">{job.type} • {job.stipend_range || "Stipend not disclosed"}</p>
//                         <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
//                           <span>Starts: {job.start_date}</span>
//                           {job.skills && job.skills.length > 0 && (
//                             <>
//                               <span>•</span>
//                               <span>{job.skills.join(", ")}</span>
//                             </>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                     {details.recent_jobs.length > 5 && (
//                       <Link
//                         to={`/all-jobs?company=${profile.name}`}
//                         className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
//                       >
//                         View all {details.recent_jobs.length} jobs →
//                       </Link>
//                     )}
//                   </div>
//                 </CollapsibleSection>
//               )}

//               {/* EDUCATION - for students */}
//               {(profile?.user_role === "STUDENT" || !profile?.user_role) && educationData.length > 0 && (
//                 <CollapsibleSection
//                   title="Education"
//                   isExpanded={expandedSections.education}
//                   onToggle={() => toggleSection('education')}
//                 >
//                   <div className="grid gap-3 md:grid-cols-2">
//                     {educationData.map((edu) => (
//                       <div key={edu.id} className="flex gap-3 p-3 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50">
//                         <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 overflow-hidden bg-gray-100 rounded-full">
//                           {edu.logo ? (
//                             <img src={getImageUrl(edu.logo)} alt={edu.institution} className="object-contain w-8 h-8" />
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
//                 </CollapsibleSection>
//               )}

//               {/* LANGUAGES - for students */}
//               {(profile?.user_role === "STUDENT" || !profile?.user_role) && profile?.language && (
//                 <CollapsibleSection
//                   title="Languages you know"
//                   isExpanded={expandedSections.languages}
//                   onToggle={() => toggleSection('languages')}
//                 >
//                   <FieldRow
//                     label="Languages"
//                     value={profile?.language}
//                     isVerified={profile?.language && profile.language.trim() !== ""}
//                   >
//                     <div className="flex flex-wrap gap-2 mt-1">
//                       {profile.language.split(",").map((lang, i) => (
//                         <span key={i} className="flex items-center gap-1 text-sm text-gray-700">
//                           <span className="w-2 h-2 bg-green-500 rounded-full"></span>
//                           {lang.trim()}
//                         </span>
//                       ))}
//                     </div>
//                   </FieldRow>
//                 </CollapsibleSection>
//               )}

//               {/* AUTHENTICATION */}
//               <CollapsibleSection
//                 title="Authentication"
//                 isExpanded={expandedSections.authentication}
//                 onToggle={() => toggleSection("authentication")}
//                 {...(isUniversityOwn && uniSectionBars
//                   ? {
//                       weight: uniSectionBars.verification.weight,
//                       score: uniSectionBars.verification.score,
//                     }
//                   : {})}
//               >
//                 <div className="space-y-1">
//                   <FieldRow 
//                     label="Email Verification" 
//                     value={profile?.verified_badges?.email ? "Verified" : "Not Verified"} 
//                     isVerified={profile?.verified_badges?.email} 
//                   />
//                   <FieldRow 
//                     label="Phone Verification" 
//                     value={profile?.verified_badges?.phone ? "Verified" : "Not Verified"} 
//                     isVerified={profile?.verified_badges?.phone} 
//                   />
//                   {profile?.user_role === "COMPANY" ? (
//                     <FieldRow 
//                       label="GST Verification" 
//                       value={profile?.verified_badges?.gst ? "Verified" : "Not Verified"} 
//                       isVerified={profile?.verified_badges?.gst} 
//                     />
//                   ) : (
//                     <FieldRow 
//                       label="Aadhaar Verification" 
//                       value={profile?.verified_badges?.aadhar ? "Verified" : "Not Verified"} 
//                       isVerified={profile?.verified_badges?.aadhar} 
//                     />
//                   )}
//                   <div className="p-3 mt-2 text-sm text-gray-500 rounded bg-gray-50">
//                     <p>Verified profiles get higher visibility and trust from employers.</p>
//                   </div>
//                 </div>
//               </CollapsibleSection>

//             </div>
//           </div>
//         </section>
//       </div>
      
//       {/* CSS Animation for Toast - same as FeedView */}
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

// export default FeedPublicProfilePage;









// import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
// import { Link, useParams } from "react-router-dom";
// import { FaLink, FaChevronDown, FaChevronUp, FaCheckCircle, FaCamera } from "react-icons/fa";
// import MainLayout from "../../../components/layout/MainLayout";
// import { useSelector, useDispatch } from "react-redux";
// import { getImageUrl } from "../../../../utils.js";
// import dummyProfile3 from "../../../assets/dummyProfile3.jpg";
// import usePublicProfile from "../../../hooks/usePublicProfile";
// import { useProfileCompletion } from "../../../hooks/useProfileCompletion";
// import feedApi from "../../../api/feedApi";
// import { Loader2 } from "lucide-react";
// import axios from "axios";
// import Select from "react-select";
// import { universityApi } from "../../../api/university/universityApi";
// import { updateUser } from "../../../redux/feature/authSlice";
// import { useMasterData } from "../../../hooks/master/useMasterData";

// const BASE_URL = import.meta.env.VITE_BASE_URL;

// function aboutSectionBar(aboutText) {
//   const ok = !!(aboutText && String(aboutText).trim());
//   return { weight: 5, score: ok ? 5 : 0 };
// }

// function highlightsSectionBar(f) {
//   let w = 0;
//   let s = 0;
//   const hit = (v, wt) => {
//     w += wt;
//     if (v && String(v).trim()) s += wt;
//   };
//   hit(f.address, 5);
//   hit(f.pincode, 5);
//   hit(f.website_link, 5);
//   hit(f.social_media_link, 2.5);
//   return { weight: w, score: s };
// }

// function coursesSectionBar(courseCount, breakdownSlice) {
//   if (
//     breakdownSlice &&
//     !breakdownSlice.not_applicable &&
//     typeof breakdownSlice.weight === "number" &&
//     breakdownSlice.weight > 0
//   ) {
//     return {
//       weight: breakdownSlice.weight,
//       score: Math.min(
//         breakdownSlice.weight,
//         typeof breakdownSlice.score === "number" ? breakdownSlice.score : 0
//       ),
//     };
//   }
//   const n = courseCount || 0;
//   const score = Math.min(20, (n / 3) * 20);
//   return { weight: 20, score };
// }

// function verificationSectionBar(breakdownSlice, verifiedBadges) {
//   if (
//     breakdownSlice &&
//     !breakdownSlice.not_applicable &&
//     typeof breakdownSlice.weight === "number" &&
//     breakdownSlice.weight > 0
//   ) {
//     return {
//       weight: breakdownSlice.weight,
//       score: Math.min(
//         breakdownSlice.weight,
//         typeof breakdownSlice.score === "number" ? breakdownSlice.score : 0
//       ),
//     };
//   }
//   let s = 0;
//   if (verifiedBadges?.email) s += 5;
//   if (verifiedBadges?.phone) s += 5;
//   if (verifiedBadges?.aadhar) s += 5;
//   return { weight: 20, score: Math.min(20, s) };
// }

// // ===== REUSABLE UI =====

// const CollapsibleSection = ({
//   title,
//   children,
//   isExpanded,
//   onToggle,
//   weight,
//   score,
//   showEditControls = false,
//   onEditClick,
//   onSaveClick,
//   onCancelClick,
//   isEditing,
//   isSaving,
// }) => {
//   const showProgress = typeof weight === "number" && weight > 0;
//   const safeWeight = showProgress ? weight : 1;
//   const cappedScore = showProgress ? Math.min(score || 0, weight) : 0;
//   const percentage = showProgress
//     ? Math.min(100, Math.round((cappedScore / safeWeight) * 100))
//     : 0;
//   const isComplete = showProgress && percentage === 100;
//   const richHeader = showProgress || showEditControls;

//   return (
//     <div className="overflow-hidden bg-white shadow-sm rounded-xl">
//       <div
//         className={`flex items-center justify-between p-4 transition-colors ${
//           richHeader ? "cursor-pointer hover:bg-gray-50" : "cursor-pointer hover:bg-gray-50"
//         }`}
//         onClick={onToggle}
//       >
//         <div className="flex items-center gap-3">
//           <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
//           {isComplete && <FaCheckCircle className="text-green-500" size={18} />}
//         </div>
//         <div className="flex items-center gap-4">
//           {showProgress && (
//             <div className="flex items-center gap-2">
//               <div
//                 className={`w-24 h-2 rounded-full ${
//                   isComplete ? "bg-green-200" : "bg-yellow-200"
//                 }`}
//               >
//                 <div
//                   className={`h-full rounded-full transition-all ${
//                     isComplete ? "bg-green-500" : "bg-yellow-500"
//                   }`}
//                   style={{ width: `${percentage}%` }}
//                 />
//               </div>
//               <span
//                 className={`text-sm font-medium min-w-[2.5rem] text-right ${
//                   isComplete ? "text-green-600" : "text-yellow-600"
//                 }`}
//               >
//                 {percentage}%
//               </span>
//             </div>
//           )}
//           {showEditControls && (
//             <div className="flex items-center gap-2">
//               {isEditing ? (
//                 <>
//                   <button
//                     type="button"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onSaveClick?.();
//                     }}
//                     className="text-sm font-medium text-green-600 hover:text-green-800 disabled:opacity-50"
//                     disabled={isSaving}
//                   >
//                     {isSaving ? "Saving…" : "Save"}
//                   </button>
//                   <button
//                     type="button"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       onCancelClick?.();
//                     }}
//                     className="text-sm font-medium text-gray-500 hover:text-gray-700"
//                   >
//                     Cancel
//                   </button>
//                 </>
//               ) : (
//                 <button
//                   type="button"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     onEditClick?.();
//                   }}
//                   className="text-sm font-medium text-blue-600 hover:text-blue-800"
//                 >
//                   Edit
//                 </button>
//               )}
//             </div>
//           )}
//           <button type="button" className="p-1 transition-colors rounded hover:bg-gray-200">
//             {isExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
//           </button>
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

// const FieldRow = ({
//   label,
//   value,
//   isVerified = false,
//   children,
//   isEditable = false,
//   editValue,
//   onChange,
//   type = "text",
//   placeholder = "",
//   rows = 3,
// }) => {
//   return (
//     <div className="py-3 border-b border-gray-200 last:border-0">
//       <div className="flex items-start justify-between">
//         <div className="flex-1">
//           <div className="flex items-center gap-2 mb-1">
//             <span className="text-sm font-medium text-gray-700">{label}</span>
//             {isVerified && <FaCheckCircle className="text-green-500" size={14} />}
//           </div>
//           {isEditable ? (
//             type === "custom" ? (
//               <div className="w-full">{children}</div>
//             ) : type === "textarea" ? (
//               <textarea
//                 value={editValue ?? ""}
//                 onChange={(e) => onChange?.(e.target.value)}
//                 className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 rows={rows}
//                 placeholder={placeholder}
//               />
//             ) : (
//               <input
//                 type={type}
//                 value={editValue ?? ""}
//                 onChange={(e) => onChange?.(e.target.value)}
//                 className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder={placeholder}
//               />
//             )
//           ) : children ? (
//             <div className="mt-1">{children}</div>
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

// // ===== MAIN COMPONENT =====

// const FeedPublicProfilePage = () => {
//   const { uuid } = useParams();
//   const dispatch = useDispatch();
//   const { token, user } = useSelector((state) => state.auth);
//   const { courses: masterCourses } = useMasterData();

//   const {
//     profile,
//     profileStats,
//     workExperiences,
//     educationData,
//     skillsData,
//     details,
//     loading,
//     error,
//     getUserPublicProfileByUUID,
//   } = usePublicProfile();

//   const {
//     percentage: completionPercentage,
//     breakdown: completionBreakdown,
//     loading: completionLoading,
//     refetch: refetchCompletion,
//   } = useProfileCompletion(true);

//   const [toastMessage, setToastMessage] = useState(null);

//   /** Full university row for PUT /universitydetail (own profile edit on public page). */
//   const [uniForm, setUniForm] = useState(null);
//   const [uniFormReady, setUniFormReady] = useState(false);
//   const [editingUni, setEditingUni] = useState({
//     about: false,
//     highlights: false,
//     university_courses: false,
//   });
//   const [savingUniSection, setSavingUniSection] = useState(null);
//   const [courseOptions, setCourseOptions] = useState([]);
//   const [courseSearch, setCourseSearch] = useState("");
//   const [isCourseLoading, setIsCourseLoading] = useState(false);
//   const [isUploadingPic, setIsUploadingPic] = useState(false);
//   const courseTimeoutRef = useRef(null);

//   // UI State for sections
//   const [expandedSections, setExpandedSections] = useState({
//     about: false,
//     career_objective: false,
//     skills: false,
//     work_experience: false,
//     education: false,
//     languages: false,
//     authentication: false,
//     resume: false,
//     professional: false,
//     verification: false,
//     highlights: false,
//     university_courses: false,
//   });

//   const toggleSection = (section) => {
//     setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
//   };

//   const isUniversityOwn =
//     Boolean(token) &&
//     profile?.user_role === "UNIVERSITY" &&
//     Boolean(profileStats?.is_own_profile);

//   const loadUniForm = useCallback(async () => {
//     if (!token || !user?.id) return;
//     try {
//       const response = await universityApi.getUniversityDetailsById(user.id, token);
//       const data = response.data;
//       setUniForm({
//         college_name: data.college_name || "",
//         affiliated_university: data.affiliated_university || "",
//         authorization_letter_url: data.authorization_letter_url || "",
//         about: data.about || "",
//         course_ids: data.courses?.map((c) => c.id) || [],
//         pincode: data.pincode || "",
//         website_link: data.website_link || "",
//         address: data.address || "",
//         phone: data.User?.phone || data.phone || "",
//         email: data.User?.email || data.email || "",
//         social_media_link: data.social_media_link || "",
//         profile_pic: data.profile_pic || "",
//         university_logo_url: data.university_logo_url || "",
//       });
//       setUniFormReady(true);
//     } catch (e) {
//       console.error("Failed to load university edit form", e);
//       setUniFormReady(false);
//     }
//   }, [token, user?.id]);

//   useEffect(() => {
//     if (!isUniversityOwn) {
//       setUniForm(null);
//       setUniFormReady(false);
//       setEditingUni({ about: false, highlights: false, university_courses: false });
//       return;
//     }
//     loadUniForm();
//   }, [isUniversityOwn, loadUniForm]);

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
//           `${BASE_URL}/master/courses/search?search=${encodeURIComponent(courseSearch)}`
//         );
//         const data = res.data?.data || [];
//         setCourseOptions(
//           data.map((c) => ({
//             value: c.id,
//             label: c.name,
//           }))
//         );
//       } catch {
//         setCourseOptions([]);
//       } finally {
//         setIsCourseLoading(false);
//       }
//     }, 400);
//     return () => {
//       if (courseTimeoutRef.current) clearTimeout(courseTimeoutRef.current);
//     };
//   }, [courseSearch]);

//   const reconstructUniversityData = (rawData) => ({
//     ...rawData,
//     courses: rawData.courses || [],
//   });

//   const isFieldComplete = (v) => {
//     if (Array.isArray(v)) return v.length > 0;
//     return !!(v && String(v).trim());
//   };

//   const getSelectedCourses = () => {
//     if (!uniForm?.course_ids?.length) return [];
//     return uniForm.course_ids
//       .map((id) => {
//         const course = masterCourses?.find((c) => c.id === id);
//         return course ? { value: course.id, label: course.name } : null;
//       })
//       .filter(Boolean);
//   };

//   const startUniSectionEdit = (key) => {
//     setEditingUni((prev) => ({ ...prev, [key]: true }));
//     setExpandedSections((prev) => ({ ...prev, [key]: true }));
//   };

//   const stopUniSectionEdit = (key) => {
//     setEditingUni((prev) => ({ ...prev, [key]: false }));
//   };

//   const cancelUniSection = async (key) => {
//     await loadUniForm();
//     stopUniSectionEdit(key);
//   };

//   const handleUniFormChange = (field, value) => {
//     setUniForm((prev) => (prev ? { ...prev, [field]: value } : prev));
//   };

//   const saveUniSection = async (key) => {
//     if (!token || !uniForm) return;
//     setSavingUniSection(key);
//     try {
//       const response = await universityApi.updateUniversityDetails(uniForm, token);
//       if (!response.success) throw new Error(response.message || "Update failed");
//       const updatedData = reconstructUniversityData(response.data);
//       setUniForm({
//         college_name: updatedData.college_name || "",
//         affiliated_university: updatedData.affiliated_university || "",
//         authorization_letter_url: updatedData.authorization_letter_url || "",
//         about: updatedData.about || "",
//         course_ids: updatedData.courses?.map((c) => c.id) || [],
//         pincode: updatedData.pincode || "",
//         website_link: updatedData.website_link?.trim() || "",
//         address: updatedData.address || "",
//         phone: updatedData.phone || "",
//         email: updatedData.email || "",
//         social_media_link: updatedData.social_media_link?.trim() || "",
//         profile_pic: updatedData.profile_pic?.trim() || "",
//         university_logo_url: updatedData.university_logo_url?.trim() || "",
//       });
//       dispatch(
//         updateUser({
//           user_profile_pic: updatedData.profile_pic || null,
//           about_us: updatedData.about || null,
//           organization_name: updatedData.college_name || null,
//           organization_logo: updatedData.university_logo_url || null,
//           email: updatedData.email || uniForm.email,
//           phone: updatedData.phone || uniForm.phone,
//         })
//       );
//       await getUserPublicProfileByUUID(uuid, token);
//       await refetchCompletion?.();
//       setToastMessage({ type: "success", text: "Profile updated." });
//       setTimeout(() => setToastMessage(null), 3000);
//       stopUniSectionEdit(key);
//     } catch (err) {
//       console.error(err);
//       setToastMessage({ type: "error", text: "Could not save. Try again." });
//       setTimeout(() => setToastMessage(null), 3000);
//     } finally {
//       setSavingUniSection(null);
//     }
//   };

//   // ----- IMAGE UPLOAD HANDLER -----
//   const handleProfilePicChange = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setIsUploadingPic(true);
//     try {
//       const formData = new FormData();
//       formData.append("profile_pic", file);

//       // Upload + update server-side profile picture based on role
//       const uploadRes = await axios.post(`${BASE_URL}/profile/upload-image`, formData, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const newPicUrl = uploadRes.data?.imageUrl;

//       if (!newPicUrl) {
//         console.error("Upload Response JSON:", uploadRes.data);
//         throw new Error("Could not parse image URL from the server response.");
//       }

//       // Success
//       if (uniForm) {
//         setUniForm((prev) => (prev ? { ...prev, profile_pic: newPicUrl } : prev));
//       }
//       dispatch(updateUser({ user_profile_pic: newPicUrl }));
      
//       setToastMessage({ type: "success", text: "Profile picture updated successfully!" });
//       setTimeout(() => setToastMessage(null), 3000);
      
//       // Refresh public profile state
//       getUserPublicProfileByUUID(uuid, token);

//     } catch (err) {
//       console.error("Profile pic upload error:", err);
      
//       // Better Error Extraction
//       let errorMessage = "Failed to update profile picture.";
//       if (err.response?.data?.message) {
//         errorMessage = err.response.data.message;
//       } else if (err.response?.data?.error) {
//         errorMessage = err.response.data.error;
//       } else if (err.message) {
//         errorMessage = err.message;
//       }

//       setToastMessage({ type: "error", text: errorMessage });
//       setTimeout(() => setToastMessage(null), 4000);
//     } finally {
//       setIsUploadingPic(false);
//       // Reset input so user can select the same file again if needed
//       if (e.target) e.target.value = null; 
//     }
//   };

//   const uniSectionBars = useMemo(() => {
//     if (!isUniversityOwn || !profile) return null;
//     const b = completionBreakdown;
//     const aboutText = uniForm?.about ?? profile?.about ?? "";
//     const highlights = highlightsSectionBar({
//       address: uniForm?.address ?? details?.address ?? "",
//       pincode: uniForm?.pincode ?? details?.pincode ?? "",
//       website_link: uniForm?.website_link ?? details?.website ?? "",
//       social_media_link: uniForm?.social_media_link ?? details?.social_link ?? "",
//     });
//     const courseCount =
//       uniForm?.course_ids != null
//         ? uniForm.course_ids.length
//         : details?.courses?.length ?? 0;
//     const courses = coursesSectionBar(courseCount, b?.courses_offered);
//     const verification = verificationSectionBar(b?.verification, profile?.verified_badges);
//     return {
//       about: aboutSectionBar(aboutText),
//       highlights,
//       courses,
//       verification,
//     };
//   }, [
//     isUniversityOwn,
//     profile,
//     details,
//     completionBreakdown,
//     uniForm?.about,
//     uniForm?.address,
//     uniForm?.pincode,
//     uniForm?.website_link,
//     uniForm?.social_media_link,
//     uniForm?.course_ids,
//   ]);

//   const publicProfileUrl = profile?.uuid
//     ? `${window.location.origin}/public-profile/${profile.uuid}`
//     : "";

//   const copyToClipboard = (text) => {
//     if (text) {
//       navigator.clipboard.writeText(text).then(() => {
//         setToastMessage({ type: "success", text: "Profile link copied!" });
//         setTimeout(() => setToastMessage(null), 3000);
//       });
//     }
//   };

//   useEffect(() => {
//     if (uuid) {
//       getUserPublicProfileByUUID(uuid, token);
//     }
//   }, [uuid, token]);

//   useEffect(() => {
//     if (
//       token &&
//       profile?.user_role === "UNIVERSITY" &&
//       profileStats?.is_own_profile
//     ) {
//       refetchCompletion?.();
//     }
//   }, [
//     token,
//     profile?.user_role,
//     profileStats?.is_own_profile,
//     uuid,
//     refetchCompletion,
//   ]);

//   // Unified experiences combining workExperiences and skillsData
//   const unifiedExperiences = useMemo(() => {
//     if (profile?.user_role !== "STUDENT") return [];

//     const expMap = new Map();

//     workExperiences.forEach((exp) => {
//       const key = `${exp.company || "Unknown"}|${exp.start_date || ""}`;
//       expMap.set(key, {
//         organization: exp.company,
//         logo: exp.logo,
//         jobRole: exp.position,
//         startDate: exp.start_date,
//         endDate: exp.end_date,
//         duration: exp.duration,
//         skills: [],
//         certificateUrl: exp.certificateUrl,
//       });
//     });

//     skillsData.forEach((skillGroup) => {
//       const orgName = skillGroup.organization || "Other";
//       let matched = false;
//       for (let [key, exp] of expMap.entries()) {
//         if (exp.organization === orgName) {
//           if (!exp.skills.includes(skillGroup.skills)) {
//             exp.skills.push(skillGroup.skills);
//           }
//           if (skillGroup.hasCertificate && skillGroup.certificateUrl) {
//             exp.certificateUrl = skillGroup.certificateUrl;
//           }
//           matched = true;
//           break;
//         }
//       }

//       if (!matched) {
//         const key = `${orgName}|skills-only`;
//         if (!expMap.has(key)) {
//           expMap.set(key, {
//             organization: orgName,
//             logo: skillGroup.logo,
//             jobRole: null,
//             startDate: skillGroup.startDate,
//             endDate: skillGroup.endDate,
//             duration: skillGroup.duration
//               ? skillGroup.duration
//               : skillGroup.startDate
//               ? `${formatDatePart(skillGroup.startDate)} – ${
//                   skillGroup.endDate ? formatDatePart(skillGroup.endDate) : "Present"
//                 }`
//               : "Dates not specified",
//             skills: [skillGroup.skills],
//             certificateUrl: skillGroup.hasCertificate ? skillGroup.certificateUrl : null,
//           });
//         } else {
//           expMap.get(key).skills.push(skillGroup.skills);
//         }
//       }
//     });

//     return Array.from(expMap.values()).sort((a, b) => {
//       if (!a.startDate && !b.startDate) return 0;
//       if (!a.startDate) return 1;
//       if (!b.startDate) return -1;
//       return new Date(b.startDate) - new Date(a.startDate);
//     });
//   }, [profile?.user_role, workExperiences, skillsData]);

//   function formatDatePart(dateStr) {
//     if (!dateStr) return "";
//     const d = new Date(dateStr);
//     return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
//   }

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

//   const displayCompletionPct = Math.min(
//     100,
//     Math.max(0, Math.round(Number(completionPercentage) || 0))
//   );

//   if (loading) {
//     return (
//       <MainLayout>
//         <div className="flex justify-center min-h-screen px-4 bg-gray-100">
//           <div className="flex flex-col items-center justify-center w-full gap-4">
//             <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
//             <p className="text-gray-600">Loading public profile...</p>
//           </div>
//         </div>
//       </MainLayout>
//     );
//   }

//   if (error || !profile) {
//     return (
//       <MainLayout>
//         <div className="flex justify-center min-h-screen px-4 bg-gray-100">
//           <p className="flex items-center justify-center w-full text-red-500">
//             {error || "Profile not found."}
//           </p>
//         </div>
//       </MainLayout>
//     );
//   }

//   // Use uniForm pic if editing, otherwise fallback to profile
//   const displayAvatarUrl = uniForm?.profile_pic ? getImageUrl(uniForm.profile_pic) : (profile.avatar_url ? getImageUrl(profile.avatar_url) : dummyProfile3);

//   return (
//     <MainLayout>
//       <div className="flex flex-col min-h-screen bg-gray-100">
//         <section className="w-full px-4 py-6 mx-auto">
//           <div className="w-full mx-auto bg-white rounded-[10px] shadow-lg">
            
//             {/* Profile Header */}
//             <div className="flex flex-col items-center p-6 bg-gradient-to-b from-white to-gray-50 border-b border-gray-200 rounded-t-[10px]">
              
//               {/* IMAGE WRAPPER WITH EDIT */}
//               <div className="relative group">
//                 <div className="relative w-20 h-20 overflow-hidden transition-shadow border-4 border-gray-200 rounded-full sm:w-24 sm:h-24 hover:shadow-lg">
//                   <img
//                     src={displayAvatarUrl}
//                     alt="Profile"
//                     className={`object-cover w-full h-full transition-opacity ${
//                       isUploadingPic ? "opacity-50" : ""
//                     } ${profileStats?.is_own_profile ? "cursor-pointer" : ""}`}
//                     onClick={() => {
//                       if (!profileStats?.is_own_profile) return;
//                       const el = document.getElementById("public-profile-pic-input");
//                       if (el) el.click();
//                     }}
//                   />
                  
//                   {/* Upload control (only for own profile) */}
//                   {profileStats?.is_own_profile && (
//                     <label className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 opacity-0 cursor-pointer group-hover:opacity-100 transition-opacity">
//                       {isUploadingPic ? (
//                         <Loader2 className="w-6 h-6 text-white animate-spin" />
//                       ) : (
//                         <>
//                           <FaCamera className="text-white mb-1" size={18} />
//                           <span className="text-[10px] font-medium text-white">Edit</span>
//                         </>
//                       )}
//                       <input 
//                         id="public-profile-pic-input"
//                         type="file" 
//                         accept="image/*" 
//                         className="hidden" 
//                         onChange={handleProfilePicChange} 
//                         disabled={isUploadingPic} 
//                       />
//                     </label>
//                   )}
//                 </div>

//                 <FaLink
//                   onClick={() => copyToClipboard(publicProfileUrl)}
//                   className="absolute w-5 h-5 p-1 text-blue-600 transition-opacity bg-white rounded-full opacity-0 cursor-pointer shadow-sm hover:text-blue-800 group-hover:opacity-100"
//                   style={{ bottom: "0", right: "0" }}
//                   title="Copy public profile link"
//                 />
//               </div>

//               <div className="flex flex-col items-center">
//                 <h1 className="mt-4 text-xl font-bold text-gray-900 sm:text-2xl">
//                   {profile.name}
//                 </h1>
//                 <p className="text-sm text-gray-500">
//                   @{profile.email?.split("@")[0] || "user"}
//                 </p>
//                 {/* {profile.user_role === "UNIVERSITY" &&
//                   (details?.address || details?.pincode) && (
//                     <p className="mt-2 text-sm text-center text-gray-600 max-w-md px-2">
//                       {[details?.address, details?.pincode]
//                         .filter(Boolean)
//                         .join(" · ")}
//                     </p>
//                   )} */}
//                   <div className="flex flex-col items-center">
//                 {/* <h1 className="mt-4 text-xl font-bold text-gray-900 sm:text-2xl">
//                   {profile.name}
//                 </h1> */}
//                 {/* <p className="text-sm text-gray-500">
//                   @{profile.email?.split("@")[0] || "user"}
//                 </p> */}
//               </div>
//               </div>

//               {/* Overall profile completion */}
//               {profile.user_role === "UNIVERSITY" &&
//                 profileStats?.is_own_profile &&
//                 token && (
//                   <div className="w-full pt-4 mt-5 border-t border-gray-100">
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="text-sm font-medium text-gray-700">
//                         Profile Completion
//                       </span>
//                       <span className="text-sm font-semibold text-blue-600">
//                         {completionLoading
//                           ? "…"
//                           : `${displayCompletionPct}% Complete`}
//                       </span>
//                     </div>
//                     <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
//                       <div
//                         className={`h-full rounded-full transition-all duration-500 ease-out ${
//                           displayCompletionPct === 100
//                             ? "bg-gradient-to-r from-green-400 to-green-500"
//                             : "bg-gradient-to-r from-blue-500 to-blue-600"
//                         }`}
//                         style={{
//                           width: `${completionLoading ? 0 : displayCompletionPct}%`,
//                         }}
//                       />
//                     </div>
//                     {!completionLoading && displayCompletionPct < 100 && (
//                       <p className="flex items-center gap-1 mt-2 text-xs text-gray-500">
//                         <span className="inline-block w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
//                         Complete your profile to stand out!
//                       </p>
//                     )}
//                     {!completionLoading && displayCompletionPct === 100 && (
//                       <p className="flex items-center gap-1 mt-2 text-xs font-medium text-green-600">
//                         <FaCheckCircle size={12} /> Profile complete!
//                       </p>
//                     )}
//                   </div>
//                 )}
//             </div>

//             {/* Toast Message */}
//             {toastMessage && (
//               <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in ${
//                 toastMessage.type === "success" 
//                   ? "bg-green-500 text-white" 
//                   : "bg-red-500 text-white"
//               }`}>
//                 {toastMessage.type === "success" ? <FaCheckCircle /> : <span>⚠️</span>}
//                 <span className="text-sm font-medium">{toastMessage.text}</span>
//               </div>
//             )}

//             {/* ===== SECTIONS CONTAINER - Full Width ===== */}
//             <div className="p-4 space-y-4">

//               {/* ABOUT */}
//               <CollapsibleSection
//                 title="About"
//                 isExpanded={expandedSections.about}
//                 onToggle={() => toggleSection("about")}
//                 {...(isUniversityOwn && uniSectionBars && uniFormReady
//                   ? {
//                       weight: uniSectionBars.about.weight,
//                       score: uniSectionBars.about.score,
//                       showEditControls: true,
//                       isEditing: editingUni.about,
//                       onEditClick: () => startUniSectionEdit("about"),
//                       onSaveClick: () => saveUniSection("about"),
//                       onCancelClick: () => cancelUniSection("about"),
//                       isSaving: savingUniSection === "about",
//                     }
//                   : {})}
//               >
//                 <FieldRow
//                   label="About Me"
//                   value={profile?.about}
//                   isVerified={
//                     isUniversityOwn
//                       ? isFieldComplete(uniForm?.about ?? profile?.about)
//                       : !!(profile?.about && profile.about.trim() !== "")
//                   }
//                   isEditable={Boolean(isUniversityOwn && uniFormReady && editingUni.about)}
//                   editValue={uniForm?.about ?? ""}
//                   onChange={(v) => handleUniFormChange("about", v)}
//                   type="textarea"
//                   rows={4}
//                   placeholder="Tell visitors about your institution…"
//                 />
//               </CollapsibleSection>

//               {/* UNIVERSITY: highlights, courses */}
//               {profile.user_role === "UNIVERSITY" && (
//                 <>
//                   <CollapsibleSection
//                     title="Profile Highlights"
//                     isExpanded={expandedSections.highlights}
//                     onToggle={() => toggleSection("highlights")}
//                     {...(isUniversityOwn && uniSectionBars && uniFormReady
//                       ? {
//                           weight: uniSectionBars.highlights.weight,
//                           score: uniSectionBars.highlights.score,
//                           showEditControls: true,
//                           isEditing: editingUni.highlights,
//                           onEditClick: () => startUniSectionEdit("highlights"),
//                           onSaveClick: () => saveUniSection("highlights"),
//                           onCancelClick: () => cancelUniSection("highlights"),
//                           isSaving: savingUniSection === "highlights",
//                         }
//                       : {})}
//                   >
//                     <FieldRow
//                       label="Address"
//                       value={details?.address}
//                       isVerified={isFieldComplete(uniForm?.address ?? details?.address)}
//                       isEditable={Boolean(isUniversityOwn && uniFormReady && editingUni.highlights)}
//                       editValue={uniForm?.address ?? ""}
//                       onChange={(v) => handleUniFormChange("address", v)}
//                       type="textarea"
//                       rows={2}
//                       placeholder="Full address"
//                     />
//                     <FieldRow
//                       label="Pincode"
//                       value={details?.pincode}
//                       isVerified={isFieldComplete(uniForm?.pincode ?? details?.pincode)}
//                       isEditable={Boolean(isUniversityOwn && uniFormReady && editingUni.highlights)}
//                       editValue={uniForm?.pincode ?? ""}
//                       onChange={(v) => handleUniFormChange("pincode", v)}
//                       placeholder="Pincode"
//                     />
//                     <FieldRow
//                       label="Official Website"
//                       isVerified={isFieldComplete(uniForm?.website_link ?? details?.website)}
//                       isEditable={Boolean(isUniversityOwn && uniFormReady && editingUni.highlights)}
//                       editValue={uniForm?.website_link ?? ""}
//                       onChange={(v) => handleUniFormChange("website_link", v)}
//                       placeholder="https://…"
//                     >
//                       {!isUniversityOwn || !editingUni.highlights ? (
//                         details?.website ? (
//                           <a
//                             href={
//                               String(details.website).startsWith("http")
//                                 ? details.website
//                                 : `https://${details.website}`
//                             }
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="text-sm text-blue-600 hover:underline break-all"
//                           >
//                             {details.website}
//                           </a>
//                         ) : (
//                           <p className="text-sm text-gray-500">Not provided</p>
//                         )
//                       ) : null}
//                     </FieldRow>
//                     <FieldRow
//                       label="Social Media"
//                       isVerified={isFieldComplete(uniForm?.social_media_link ?? details?.social_link)}
//                       isEditable={Boolean(isUniversityOwn && uniFormReady && editingUni.highlights)}
//                       editValue={uniForm?.social_media_link ?? ""}
//                       onChange={(v) => handleUniFormChange("social_media_link", v)}
//                       placeholder="https://…"
//                     >
//                       {!isUniversityOwn || !editingUni.highlights ? (
//                         details?.social_link ? (
//                           <a
//                             href={
//                               String(details.social_link).startsWith("http")
//                                 ? details.social_link
//                                 : `https://${details.social_link}`
//                             }
//                             target="_blank"
//                             rel="noopener noreferrer"
//                             className="text-sm text-blue-600 hover:underline break-all"
//                           >
//                             {details.social_link}
//                           </a>
//                         ) : (
//                           <p className="text-sm text-gray-500">Not provided</p>
//                         )
//                       ) : null}
//                     </FieldRow>
//                   </CollapsibleSection>

//                   <CollapsibleSection
//                     title="Programs & Courses"
//                     isExpanded={expandedSections.university_courses}
//                     onToggle={() => toggleSection("university_courses")}
//                     {...(isUniversityOwn && uniSectionBars && uniFormReady
//                       ? {
//                           weight: uniSectionBars.courses.weight,
//                           score: uniSectionBars.courses.score,
//                           showEditControls: true,
//                           isEditing: editingUni.university_courses,
//                           onEditClick: () => startUniSectionEdit("university_courses"),
//                           onSaveClick: () => saveUniSection("university_courses"),
//                           onCancelClick: () => cancelUniSection("university_courses"),
//                           isSaving: savingUniSection === "university_courses",
//                         }
//                       : {})}
//                   >
//                     <FieldRow
//                       label="Programs offered"
//                       isVerified={
//                         isUniversityOwn
//                           ? isFieldComplete(uniForm?.course_ids)
//                           : !!(details?.courses && details.courses.length > 0)
//                       }
//                       isEditable={Boolean(isUniversityOwn && uniFormReady && editingUni.university_courses)}
//                       type="custom"
//                     >
//                       {isUniversityOwn && editingUni.university_courses ? (
//                         <Select
//                           isMulti
//                           options={courseOptions}
//                           value={getSelectedCourses()}
//                           onChange={(selected) => {
//                             const ids = selected ? selected.map((opt) => opt.value) : [];
//                             handleUniFormChange("course_ids", ids);
//                           }}
//                           onInputChange={(inputValue, meta) => {
//                             if (meta.action === "input-change") setCourseSearch(inputValue);
//                           }}
//                           placeholder="Search courses (type 3+ letters)"
//                           isLoading={isCourseLoading}
//                           noOptionsMessage={() =>
//                             courseSearch.length < 3 ? "Type at least 3 letters to search" : "No courses found"
//                           }
//                           className="text-sm"
//                         />
//                       ) : details?.courses && details.courses.length > 0 ? (
//                         <div className="flex flex-wrap gap-2 mt-2">
//                           {details.courses.map((course, i) => (
//                             <span
//                               key={i}
//                               className="px-3 py-1.5 text-sm text-blue-700 bg-blue-50 border border-blue-100 rounded-full"
//                             >
//                               {course}
//                             </span>
//                           ))}
//                         </div>
//                       ) : (
//                         <p className="text-sm text-gray-500">No programs listed yet.</p>
//                       )}
//                     </FieldRow>
//                   </CollapsibleSection>
//                 </>
//               )}

//               {/* CAREER OBJECTIVE - for students */}
//               {(profile?.user_role === "STUDENT" || !profile?.user_role) && profile?.career_objective && (
//                 <CollapsibleSection
//                   title="Career Objective"
//                   isExpanded={expandedSections.career_objective}
//                   onToggle={() => toggleSection('career_objective')}
//                 >
//                   <FieldRow
//                     label="Career Objective"
//                     value={profile?.career_objective}
//                     isVerified={profile?.career_objective && profile.career_objective.trim() !== ""}
//                   />
//                 </CollapsibleSection>
//               )}

//               {/* RESUME - for students */}
//               {(profile?.user_role === "STUDENT" || !profile?.user_role) && profile?.resume && (
//                 <CollapsibleSection
//                   title="Resume"
//                   isExpanded={expandedSections.resume}
//                   onToggle={() => toggleSection('resume')}
//                 >
//                   <div className="py-3">
//                     <div className="flex items-center gap-2 mb-2">
//                       <span className="text-sm font-medium text-gray-700">Resume File</span>
//                       <FaCheckCircle className="text-green-500" size={14} />
//                     </div>
//                     <div className="flex flex-wrap items-center gap-3">
//                       <span className="text-sm text-gray-600 truncate max-w-[200px]">{getFileNameFromUrl(profile.resume)}</span>
//                       <a href={getImageUrl(profile.resume)} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-green-600 hover:text-green-800">
//                         View
//                       </a>
//                     </div>
//                   </div>
//                 </CollapsibleSection>
//               )}

//               {/* SKILLS - for students */}
//               {(profile?.user_role === "STUDENT" || !profile?.user_role) && (
//                 <CollapsibleSection
//                   title="Experience-Skills"
//                   isExpanded={expandedSections.skills}
//                   onToggle={() => toggleSection('skills')}
//                 >
//                   {unifiedExperiences.length > 0 ? (
//                     <div className="grid gap-3 md:grid-cols-2">
//                       {unifiedExperiences.map((exp, idx) => (
//                         <div key={idx} className="flex gap-3 p-3 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50">
//                           <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 overflow-hidden bg-gray-100 rounded-full">
//                             {exp.logo ? (
//                               <img src={getImageUrl(exp.logo)} alt={exp.organization} className="object-contain w-8 h-8" />
//                             ) : (
//                               <span className="text-xs font-medium text-gray-500">{exp.organization?.charAt(0) || "?"}</span>
//                             )}
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <h4 className="font-medium text-gray-900">{exp.organization}</h4>
//                             {exp.jobRole && <p className="text-sm font-medium text-gray-700">{exp.jobRole}</p>}
//                             <p className="mb-1 text-sm text-gray-500">{exp.duration}</p>
//                             {exp.skills.length > 0 && (
//                               <p className="text-sm text-gray-700">{exp.skills.join(", ")}</p>
//                             )}
//                             {exp.certificateUrl && (
//                               <a href={getImageUrl(exp.certificateUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-1 text-sm text-blue-600 hover:underline">
//                                 📄 View Certificate
//                               </a>
//                             )}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   ) : (
//                     <p className="py-2 text-sm text-gray-500">No skills added yet</p>
//                   )}
//                 </CollapsibleSection>
//               )}

//               {/* COMPANY: Recent Jobs */}
//               {profile.user_role === "COMPANY" && details?.recent_jobs && details.recent_jobs.length > 0 && (
//                 <CollapsibleSection
//                   title="Recent Job Openings"
//                   isExpanded={expandedSections.work_experience}
//                   onToggle={() => toggleSection('work_experience')}
//                 >
//                   <div className="space-y-3">
//                     {details.recent_jobs.slice(0, 5).map((job) => (
//                       <div key={job.id} className="p-3 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50">
//                         <h4 className="font-medium text-gray-900">{job.title}</h4>
//                         <p className="text-sm text-gray-600">{job.type} • {job.stipend_range || "Stipend not disclosed"}</p>
//                         <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
//                           <span>Starts: {job.start_date}</span>
//                           {job.skills && job.skills.length > 0 && (
//                             <>
//                               <span>•</span>
//                               <span>{job.skills.join(", ")}</span>
//                             </>
//                           )}
//                         </div>
//                       </div>
//                     ))}
//                     {details.recent_jobs.length > 5 && (
//                       <Link
//                         to={`/all-jobs?company=${profile.name}`}
//                         className="inline-block mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
//                       >
//                         View all {details.recent_jobs.length} jobs →
//                       </Link>
//                     )}
//                   </div>
//                 </CollapsibleSection>
//               )}

//               {/* EDUCATION - for students */}
//               {(profile?.user_role === "STUDENT" || !profile?.user_role) && educationData.length > 0 && (
//                 <CollapsibleSection
//                   title="Education"
//                   isExpanded={expandedSections.education}
//                   onToggle={() => toggleSection('education')}
//                 >
//                   <div className="grid gap-3 md:grid-cols-2">
//                     {educationData.map((edu) => (
//                       <div key={edu.id} className="flex gap-3 p-3 transition-colors border border-gray-200 rounded-lg hover:bg-gray-50">
//                         <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 overflow-hidden bg-gray-100 rounded-full">
//                           {edu.logo ? (
//                             <img src={getImageUrl(edu.logo)} alt={edu.institution} className="object-contain w-8 h-8" />
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
//                 </CollapsibleSection>
//               )}

//               {/* LANGUAGES - for students */}
//               {(profile?.user_role === "STUDENT" || !profile?.user_role) && profile?.language && (
//                 <CollapsibleSection
//                   title="Languages you know"
//                   isExpanded={expandedSections.languages}
//                   onToggle={() => toggleSection('languages')}
//                 >
//                   <FieldRow
//                     label="Languages"
//                     value={profile?.language}
//                     isVerified={profile?.language && profile.language.trim() !== ""}
//                   >
//                     <div className="flex flex-wrap gap-2 mt-1">
//                       {profile.language.split(",").map((lang, i) => (
//                         <span key={i} className="flex items-center gap-1 text-sm text-gray-700">
//                           <span className="w-2 h-2 bg-green-500 rounded-full"></span>
//                           {lang.trim()}
//                         </span>
//                       ))}
//                     </div>
//                   </FieldRow>
//                 </CollapsibleSection>
//               )}

//               {/* AUTHENTICATION */}
//               <CollapsibleSection
//                 title="Authentication"
//                 isExpanded={expandedSections.authentication}
//                 onToggle={() => toggleSection("authentication")}
//                 {...(isUniversityOwn && uniSectionBars
//                   ? {
//                       weight: uniSectionBars.verification.weight,
//                       score: uniSectionBars.verification.score,
//                     }
//                   : {})}
//               >
//                 <div className="space-y-1">
//                   <FieldRow 
//                     label="Email Verification" 
//                     value={profile?.verified_badges?.email ? "Verified" : "Not Verified"} 
//                     isVerified={profile?.verified_badges?.email} 
//                   />
//                   <FieldRow 
//                     label="Phone Verification" 
//                     value={profile?.verified_badges?.phone ? "Verified" : "Not Verified"} 
//                     isVerified={profile?.verified_badges?.phone} 
//                   />
//                   {profile?.user_role === "COMPANY" ? (
//                     <FieldRow 
//                       label="GST Verification" 
//                       value={profile?.verified_badges?.gst ? "Verified" : "Not Verified"} 
//                       isVerified={profile?.verified_badges?.gst} 
//                     />
//                   ) : (
//                     <FieldRow 
//                       label="Aadhaar Verification" 
//                       value={profile?.verified_badges?.aadhar ? "Verified" : "Not Verified"} 
//                       isVerified={profile?.verified_badges?.aadhar} 
//                     />
//                   )}
//                   <div className="p-3 mt-2 text-sm text-gray-500 rounded bg-gray-50">
//                     <p>Verified profiles get higher visibility and trust from employers.</p>
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

// export default FeedPublicProfilePage;














import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  FaLink,
  FaCheckCircle,
  FaCamera,
  FaFilePdf,
  FaGraduationCap
} from "react-icons/fa";
import { Shield } from "lucide-react";
import MainLayout from "../../../components/layout/MainLayout";
import { useSelector, useDispatch } from "react-redux";
import { getImageUrl } from "../../../../utils.js";
import dummyProfile3 from "../../../assets/dummyProfile3.jpg";
import websiteLogo from "../../../assets/WebsiteLogo.svg";
import usePublicProfile from "../../../hooks/usePublicProfile";
import { useProfileCompletion } from "../../../hooks/useProfileCompletion";
import feedApi from "../../../api/feedApi";
import { Loader2 } from "lucide-react";
import axios from "axios";
import Select from "react-select";
import { universityApi } from "../../../api/university/universityApi";
import { updateUser } from "../../../redux/feature/authSlice";
import { useMasterData } from "../../../hooks/master/useMasterData";

// Custom Components
import UserIdentityBadge from "../../../components/jobs/UserIdentityBadge.jsx"; 
import ProfileName from "../../../components/jobs/ProfileName.jsx"
import CollapsibleSectionHeader from "../../../components/jobs/CollapsibleSectionHeader.jsx";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ==========================================
// HELPERS FOR COMPLETION BARS
// ==========================================
function aboutSectionBar(aboutText) {
  const ok = !!(aboutText && String(aboutText).trim());
  return { weight: 5, score: ok ? 5 : 0 };
}

function highlightsSectionBar(f) {
  let w = 0;
  let s = 0;
  const hit = (v, wt) => {
    w += wt;
    if (v && String(v).trim()) s += wt;
  };
  hit(f.address, 5);
  hit(f.pincode, 5);
  hit(f.website_link, 5);
  hit(f.social_media_link, 2.5);
  return { weight: w, score: s };
}

function coursesSectionBar(courseCount, breakdownSlice) {
  if (
    breakdownSlice &&
    !breakdownSlice.not_applicable &&
    typeof breakdownSlice.weight === "number" &&
    breakdownSlice.weight > 0
  ) {
    return {
      weight: breakdownSlice.weight,
      score: Math.min(
        breakdownSlice.weight,
        typeof breakdownSlice.score === "number" ? breakdownSlice.score : 0
      ),
    };
  }
  const n = courseCount || 0;
  const score = Math.min(20, (n / 3) * 20);
  return { weight: 20, score };
}

function verificationSectionBar(breakdownSlice, verifiedBadges) {
  if (
    breakdownSlice &&
    !breakdownSlice.not_applicable &&
    typeof breakdownSlice.weight === "number" &&
    breakdownSlice.weight > 0
  ) {
    return {
      weight: breakdownSlice.weight,
      score: Math.min(
        breakdownSlice.weight,
        typeof breakdownSlice.score === "number" ? breakdownSlice.score : 0
      ),
    };
  }
  let s = 0;
  if (verifiedBadges?.email) s += 5;
  if (verifiedBadges?.phone) s += 5;
  if (verifiedBadges?.aadhar || verifiedBadges?.gst) s += 5;
  return { weight: 20, score: Math.min(20, s) };
}

// ==========================================
// REUSABLE COLLAPSIBLE SECTION
// ==========================================
const CollapsibleSection = ({ 
  title, weight, score, children, isExpanded, onToggle, 
  showEditControls, onEditClick, onSaveClick, onCancelClick, 
  isEditing, isSaving 
}) => {
  // If no weight is provided, assume it's a structural section and set to 100% implicitly for styling
  const safeWeight = weight || 100;
  const safeScore = score !== undefined ? score : 100;
  const percentage = Math.min(100, Math.round((safeScore / safeWeight) * 100));
  const isComplete = percentage === 100;

  return (
    <div className="overflow-hidden bg-white shadow-sm rounded-xl border border-gray-100 mb-4 transition-all">
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
            type === "custom" ? (
              <div className="w-full mt-2">{children}</div>
            ) : isTagList ? (
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
          ) : children ? (
            <div className="mt-1">{children}</div>
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
            // <p className="text-sm text-gray-600 whitespace-pre-wrap mt-1 leading-relaxed">
            //   {value || <span className="text-gray-400 italic">Not providedsss</span>}
            // </p>
            <p className="text-sm text-gray-600 whitespace-pre-wrap mt-1 leading-relaxed">
  {value}
</p>
          )}
        </div>
      </div>
    </div>
  );
};


// ==========================================
// MAIN COMPONENT
// ==========================================
const FeedPublicProfilePage = () => {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const { courses: masterCourses } = useMasterData();

  const {
    profile,
    profileStats,
    workExperiences,
    educationData,
    skillsData,
    details,
    loading,
    error,
    getUserPublicProfileByUUID,
  } = usePublicProfile();

  const {
    percentage: completionPercentage,
    breakdown: completionBreakdown,
    loading: completionLoading,
    refetch: refetchCompletion,
  } = useProfileCompletion(true);

  const [toastMessage, setToastMessage] = useState(null);

  // University Form State
  const [uniForm, setUniForm] = useState(null);
  const [uniFormReady, setUniFormReady] = useState(false);
  const [editingUni, setEditingUni] = useState({
    about: false,
    highlights: false,
    university_courses: false,
  });
  const [savingUniSection, setSavingUniSection] = useState(null);
  const [courseOptions, setCourseOptions] = useState([]);
  const [courseSearch, setCourseSearch] = useState("");
  const [isCourseLoading, setIsCourseLoading] = useState(false);
  const [isUploadingPic, setIsUploadingPic] = useState(false);
  const courseTimeoutRef = useRef(null);

  // Expanded Sections State
  const [expandedSections, setExpandedSections] = useState({
    about: false,
    career_objective: false,
    skills: false,
    work_experience: false,
    education: false,
    languages: false,
    authentication: false,
    resume: false,
    professional: false,
    verification: false,
    highlights: false,
    university_courses: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const isUniversityOwn =
    Boolean(token) &&
    profile?.user_role === "UNIVERSITY" &&
    Boolean(profileStats?.is_own_profile);

  const loadUniForm = useCallback(async () => {
    if (!token || !user?.id) return;
    try {
      const response = await universityApi.getUniversityDetailsById(user.id, token);
      const data = response.data;
      setUniForm({
        college_name: data.college_name || "",
        affiliated_university: data.affiliated_university || "",
        authorization_letter_url: data.authorization_letter_url || "",
        about: data.about || "",
        course_ids: data.courses?.map((c) => c.id) || [],
        pincode: data.pincode || "",
        website_link: data.website_link || "",
        address: data.address || "",
        phone: data.User?.phone || data.phone || "",
        email: data.User?.email || data.email || "",
        social_media_link: data.social_media_link || "",
        profile_pic: data.profile_pic || "",
        university_logo_url: data.university_logo_url || "",
      });
      setUniFormReady(true);
    } catch (e) {
      console.error("Failed to load university edit form", e);
      setUniFormReady(false);
    }
  }, [token, user?.id]);

  useEffect(() => {
    if (!isUniversityOwn) {
      setUniForm(null);
      setUniFormReady(false);
      setEditingUni({ about: false, highlights: false, university_courses: false });
      return;
    }
    loadUniForm();
  }, [isUniversityOwn, loadUniForm]);

  useEffect(() => {
    if (courseTimeoutRef.current) clearTimeout(courseTimeoutRef.current);
    if (!courseSearch || courseSearch.length < 3) {
      setCourseOptions([]);
      return;
    }
    courseTimeoutRef.current = setTimeout(async () => {
      try {
        setIsCourseLoading(true);
        const res = await axios.get(
          `${BASE_URL}/master/courses/search?search=${encodeURIComponent(courseSearch)}`
        );
        const data = res.data?.data || [];
        setCourseOptions(
          data.map((c) => ({
            value: c.id,
            label: c.name,
          }))
        );
      } catch {
        setCourseOptions([]);
      } finally {
        setIsCourseLoading(false);
      }
    }, 400);
    return () => {
      if (courseTimeoutRef.current) clearTimeout(courseTimeoutRef.current);
    };
  }, [courseSearch]);

  const reconstructUniversityData = (rawData) => ({
    ...rawData,
    courses: rawData.courses || [],
  });

  const isFieldComplete = (v) => {
    if (Array.isArray(v)) return v.length > 0;
    return !!(v && String(v).trim());
  };

  const getSelectedCourses = () => {
    if (!uniForm?.course_ids?.length) return [];
    return uniForm.course_ids
      .map((id) => {
        const course = masterCourses?.find((c) => c.id === id);
        return course ? { value: course.id, label: course.name } : null;
      })
      .filter(Boolean);
  };

  const startUniSectionEdit = (key) => {
    setEditingUni((prev) => ({ ...prev, [key]: true }));
    setExpandedSections((prev) => ({ ...prev, [key]: true }));
  };

  const stopUniSectionEdit = (key) => {
    setEditingUni((prev) => ({ ...prev, [key]: false }));
  };

  const cancelUniSection = async (key) => {
    await loadUniForm();
    stopUniSectionEdit(key);
  };

  const handleUniFormChange = (field, value) => {
    setUniForm((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const saveUniSection = async (key) => {
    if (!token || !uniForm) return;
    setSavingUniSection(key);
    try {
      const response = await universityApi.updateUniversityDetails(uniForm, token);
      if (!response.success) throw new Error(response.message || "Update failed");
      const updatedData = reconstructUniversityData(response.data);
      setUniForm({
        ...uniForm,
        ...updatedData,
        course_ids: updatedData.courses?.map((c) => c.id) || [],
      });
      dispatch(
        updateUser({
          user_profile_pic: updatedData.profile_pic || null,
          about_us: updatedData.about || null,
          organization_name: updatedData.college_name || null,
          organization_logo: updatedData.university_logo_url || null,
          email: updatedData.email || uniForm.email,
          phone: updatedData.phone || uniForm.phone,
        })
      );
      await getUserPublicProfileByUUID(uuid, token);
      await refetchCompletion?.();
      setToastMessage({ type: "success", text: "Profile updated successfully." });
    } catch (err) {
      console.error(err);
      setToastMessage({ type: "error", text: "Could not save. Try again." });
    } finally {
      setSavingUniSection(null);
      stopUniSectionEdit(key);
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPic(true);
    try {
      const formData = new FormData();
      formData.append("profile_pic", file);

      const uploadRes = await axios.post(`${BASE_URL}/profile/upload-image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const newPicUrl = uploadRes.data?.imageUrl;
      if (!newPicUrl) throw new Error("Could not parse image URL from the server response.");

      if (uniForm) {
        setUniForm((prev) => (prev ? { ...prev, profile_pic: newPicUrl } : prev));
      }
      dispatch(updateUser({ user_profile_pic: newPicUrl }));
      
      setToastMessage({ type: "success", text: "Profile picture updated!" });
      getUserPublicProfileByUUID(uuid, token);
    } catch (err) {
      console.error("Profile pic upload error:", err);
      let errorMessage = "Failed to update profile picture.";
      if (err.response?.data?.message) errorMessage = err.response.data.message;
      else if (err.message) errorMessage = err.message;

      setToastMessage({ type: "error", text: errorMessage });
    } finally {
      setIsUploadingPic(false);
      if (e.target) e.target.value = null; 
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const uniSectionBars = useMemo(() => {
    if (!isUniversityOwn || !profile) return null;
    const b = completionBreakdown;
    const aboutText = uniForm?.about ?? profile?.about ?? "";
    const highlights = highlightsSectionBar({
      address: uniForm?.address ?? details?.address ?? "",
      pincode: uniForm?.pincode ?? details?.pincode ?? "",
      website_link: uniForm?.website_link ?? details?.website ?? "",
      social_media_link: uniForm?.social_media_link ?? details?.social_link ?? "",
    });
    const courseCount =
      uniForm?.course_ids != null
        ? uniForm.course_ids.length
        : details?.courses?.length ?? 0;
    const courses = coursesSectionBar(courseCount, b?.courses_offered);
    const verificationBadges =
      profile?.user_role === "UNIVERSITY"
        ? { email: profile?.verified_badges?.email, phone: profile?.verified_badges?.phone }
        : profile?.verified_badges;
    const verification = verificationSectionBar(b?.verification, verificationBadges);
    return {
      about: aboutSectionBar(aboutText),
      highlights,
      courses,
      verification,
    };
  }, [
    isUniversityOwn,
    profile,
    details,
    completionBreakdown,
    uniForm?.about,
    uniForm?.address,
    uniForm?.pincode,
    uniForm?.website_link,
    uniForm?.social_media_link,
    uniForm?.course_ids,
  ]);

  const publicProfileUrl = profile?.uuid
    ? `${window.location.origin}/public-profile/${profile.uuid}`
    : "";

  useEffect(() => {
    try {
      if (completionBreakdown) {
        console.log('[UI][profile-completion] completionBreakdown:', completionBreakdown);
        console.log('[UI][profile-completion] profile.verified_badges:', profile?.verified_badges);
        const v = completionBreakdown?.verification || completionBreakdown?.verification || null;
        if (v) console.log('[UI][profile-completion] verification slice:', v);
      }
    } catch (e) {
      console.warn('[UI] Error logging profile-completion debug info', e);
    }
  }, [completionBreakdown, profile]);

  // Listen for verification events (emitted after phone/email verification) and refresh data
  useEffect(() => {
    const handler = () => {
      try {
        if (uuid && token) {
          getUserPublicProfileByUUID(uuid, token);
        }
        refetchCompletion?.();
      } catch (e) {
        console.warn('[UI] Error handling profileVerificationChanged event', e);
      }
    };
    window.addEventListener('profileVerificationChanged', handler);
    return () => window.removeEventListener('profileVerificationChanged', handler);
  }, [uuid, token, getUserPublicProfileByUUID, refetchCompletion]);

  const copyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        setToastMessage({ type: "success", text: "Profile link copied!" });
        setTimeout(() => setToastMessage(null), 3000);
      });
    }
  };

  useEffect(() => {
    if (uuid) {
      getUserPublicProfileByUUID(uuid, token);
    }
  }, [uuid, token]);

  useEffect(() => {
    if (
      token &&
      profile?.user_role === "UNIVERSITY" &&
      profileStats?.is_own_profile
    ) {
      refetchCompletion?.();
    }
  }, [token, profile?.user_role, profileStats?.is_own_profile, uuid, refetchCompletion]);

  // Unified experiences combining workExperiences and skillsData
  const unifiedExperiences = useMemo(() => {
    if (profile?.user_role !== "STUDENT") return [];

    const expMap = new Map();

    workExperiences.forEach((exp) => {
      const key = `${exp.company || "Unknown"}|${exp.start_date || ""}`;
      expMap.set(key, {
        organization: exp.company,
        logo: exp.logo,
        jobRole: exp.position,
        startDate: exp.start_date,
        endDate: exp.end_date,
        duration: exp.duration,
        skills: [],
        certificateUrl: exp.certificateUrl,
      });
    });

    skillsData.forEach((skillGroup) => {
      const orgName = skillGroup.organization || "Other";
      let matched = false;
      for (let [key, exp] of expMap.entries()) {
        if (exp.organization === orgName) {
          if (!exp.skills.includes(skillGroup.skills)) {
            exp.skills.push(skillGroup.skills);
          }
          if (skillGroup.hasCertificate && skillGroup.certificateUrl) {
            exp.certificateUrl = skillGroup.certificateUrl;
          }
          matched = true;
          break;
        }
      }

      if (!matched) {
        const key = `${orgName}|skills-only`;
        if (!expMap.has(key)) {
          expMap.set(key, {
            organization: orgName,
            logo: skillGroup.logo,
            jobRole: null,
            startDate: skillGroup.startDate,
            endDate: skillGroup.endDate,
            duration: skillGroup.duration
              ? skillGroup.duration
              : skillGroup.startDate
              ? `${formatDatePart(skillGroup.startDate)} – ${
                  skillGroup.endDate ? formatDatePart(skillGroup.endDate) : "Present"
                }`
              : "Dates not specified",
            skills: [skillGroup.skills],
            certificateUrl: skillGroup.hasCertificate ? skillGroup.certificateUrl : null,
          });
        } else {
          expMap.get(key).skills.push(skillGroup.skills);
        }
      }
    });

    return Array.from(expMap.values()).sort((a, b) => {
      if (!a.startDate && !b.startDate) return 0;
      if (!a.startDate) return 1;
      if (!b.startDate) return -1;
      return new Date(b.startDate) - new Date(a.startDate);
    });
  }, [profile?.user_role, workExperiences, skillsData]);

  function formatDatePart(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  }

  const getFileNameFromUrl = (url) => {
    if (!url) return "resume.pdf";
    try {
      return new URL(url).pathname.split("/").pop().split("?")[0] || "resume.pdf";
    } catch {
      return url.split("/").pop().split("?")[0] || "resume.pdf";
    }
  };

  const displayCompletionPct = Math.min(
    100,
    Math.max(0, Math.round(Number(completionPercentage) || 0))
  );

  // For UNIVERSITY owners, compute a local completion percentage from uniForm/profile
  // to avoid showing stale server value when the UI shows all sections completed.
  const localUniversityCompletionPct = useMemo(() => {
    if (!isUniversityOwn || !uniFormReady) return null;

    const sections = [];

    // 1. Basic Info (10%) — user
    const hasBasic = user?.first_name && user?.last_name && user?.email && user?.phone;
    sections.push({ name: "basic_info", weight: 10, score: hasBasic ? 10 : 0 });

    // 2. Institution Info (25%) — college_name, address, pincode, about, website
    const hasCollegeName = !!(uniForm?.college_name || profile?.name);
    const hasAddress = !!(uniForm?.address || details?.address);
    const hasPincode = !!(uniForm?.pincode || details?.pincode);
    const hasAbout = !!(uniForm?.about || profile?.about);
    const hasWebsite = !!(uniForm?.website_link || details?.website);
    const instScore = (hasCollegeName ? 5 : 0) + (hasAddress ? 5 : 0) + (hasPincode ? 5 : 0) + (hasAbout ? 5 : 0) + (hasWebsite ? 5 : 0);
    sections.push({ name: "institution_info", weight: 25, score: instScore });

    // 3. Logo & Profile Pic (10%)
    const hasLogo = !!(uniForm?.university_logo_url || profile?.avatar_url);
    const hasProfilePic = !!(uniForm?.profile_pic || profile?.avatar_url);
    sections.push({ name: "logo_and_profile_pic", weight: 10, score: (hasLogo ? 5 : 0) + (hasProfilePic ? 5 : 0) });

    // 4. Verification (20%) — use profile.verified_badges when available
    const emailVerified = !!(profile?.verified_badges?.email || uniForm?.email_id_verified);
    const phoneVerified = !!(profile?.verified_badges?.phone || uniForm?.phone_verified);
    sections.push({ name: "verification", weight: 20, score: (emailVerified ? 10 : 0) + (phoneVerified ? 10 : 0) });

    // 5. Authorization Letter (10%)
    sections.push({ name: "authorization_letter", weight: 10, score: uniForm?.authorization_letter_url ? 10 : 0 });

    // 6. Affiliation & Links (5%)
    const hasAffiliation = !!(uniForm?.affiliated_university || details?.affiliated_university);
    const hasSocial = !!(uniForm?.social_media_link || details?.social_link);
    sections.push({ name: "affiliation_and_links", weight: 5, score: (hasAffiliation ? 2.5 : 0) + (hasSocial ? 2.5 : 0) });

    // 7. Courses Offered (20%)
    const courseCount = uniForm?.course_ids?.length ?? details?.courses?.length ?? 0;
    sections.push({ name: "courses_offered", weight: 20, score: courseCount > 0 ? 20 : 0 });

    const totalScore = sections.reduce((s, x) => s + (Number(x.score) || 0), 0);
    const totalWeight = sections.reduce((s, x) => s + (Number(x.weight) || 0), 0);

    // Debug logs
    try {
      console.log('[localUniversityCompletion] sections:', sections);
      console.log(`[localUniversityCompletion] totalScore=${totalScore} totalWeight=${totalWeight}`);
    } catch (e) {
      /* no-op */
    }

    const pct = totalWeight > 0 ? Math.min(100, Math.round((totalScore / totalWeight) * 100)) : null;
    return pct;
  }, [isUniversityOwn, uniFormReady, uniForm, profile, details, user]);

  // Final display pct: prefer local computed value for university owner when it indicates full completion
  const finalDisplayCompletionPct = (() => {
    if (isUniversityOwn && localUniversityCompletionPct != null) {
      // If local computation is 100, prefer it (fix stale server 95 case)
      if (localUniversityCompletionPct === 100) return 100;
      // Otherwise fall back to server percentage
      return displayCompletionPct;
    }
    return displayCompletionPct;
  })();

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center min-h-screen px-4 bg-gray-50">
          <div className="flex flex-col items-center justify-center w-full gap-4">
            <Loader2 className="w-12 h-12 text-[#9bc87c] animate-spin" />
            <p className="text-gray-600 font-medium">Loading public profile...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !profile) {
    return (
      <MainLayout>
        <div className="flex justify-center min-h-screen px-4 bg-gray-50">
          <p className="flex items-center justify-center w-full text-red-500 font-bold">
            {error || "Profile not found."}
          </p>
        </div>
      </MainLayout>
    );
  }

  const displayAvatarUrl = uniForm?.profile_pic ? getImageUrl(uniForm.profile_pic) : (profile.avatar_url ? getImageUrl(profile.avatar_url) : dummyProfile3);

  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen bg-gray-50">
        
        <section className="w-full px-4 py-6 mx-auto">
          <div className="w-full mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 relative">
            
            {/* Profile Header Block */}
            <div className="flex flex-col items-center p-6 bg-gradient-to-b from-white to-gray-50 border-b border-gray-200 rounded-t-2xl">
              
              <div className="relative group">
                <div className="relative w-20 h-20 overflow-hidden transition-shadow border-4 border-white rounded-full shadow-md sm:w-24 sm:h-24 hover:shadow-lg">
                  <img
                    src={displayAvatarUrl}
                    alt="Profile"
                    className={`object-cover w-full h-full transition-opacity ${
                      isUploadingPic ? "opacity-50" : ""
                    } ${profileStats?.is_own_profile ? "cursor-pointer" : ""}`}
                    onClick={() => {
                      if (!profileStats?.is_own_profile) return;
                      const el = document.getElementById("public-profile-pic-input");
                      if (el) el.click();
                    }}
                  />
                  
                  {profileStats?.is_own_profile && (
                    <label className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-40 opacity-0 cursor-pointer group-hover:opacity-100 transition-opacity">
                      {isUploadingPic ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <>
                          <FaCamera className="text-white mb-1" size={18} />
                          <span className="text-[10px] font-bold text-white tracking-wider">EDIT</span>
                        </>
                      )}
                      <input 
                        id="public-profile-pic-input"
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleProfilePicChange} 
                        disabled={isUploadingPic} 
                      />
                    </label>
                  )}
                </div>

                <button
                  onClick={() => copyToClipboard(publicProfileUrl)}
                  className="absolute w-7 h-7 p-1.5 text-gray-600 bg-white transition-opacity rounded-full shadow-md opacity-0 cursor-pointer group-hover:opacity-100 border border-gray-200 hover:text-[#9bc87c] flex justify-center items-center"
                  style={{ bottom: "2px", right: "-10px" }}
                  title="Copy public profile link"
                >
                  <FaLink size={12} />
                </button>
              </div>

              <div className="flex flex-col items-center mt-4">
                <ProfileName name={profile.name || "User Name"} />
                <UserIdentityBadge 
                  roleLabel={profile.user_role || "STUDENT"} 
                  handle={`@${profile.email?.split("@")[0] || "user"}`}
                  className="mt-2"
                />
              </div>

              {/* Profile Completion Bar (Only shown for own university profiles based on original logic) */}
              {profile.user_role === "UNIVERSITY" && profileStats?.is_own_profile && token && (
                <div className="w-full max-w-2xl pt-4 mt-6 border-t border-gray-200/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-extrabold text-[#1e1e2d]">Profile Completion</span>
                    <span className="text-sm font-extrabold text-[#9bc87c]">
                      {completionLoading ? "…" : `${finalDisplayCompletionPct}%`}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${
                        finalDisplayCompletionPct === 100
                          ? 'bg-gradient-to-r from-[#1DB32F] to-[#00C950]' 
                          : 'bg-gradient-to-r from-[#9bc87c] to-[#8ab76b]'
                      }`}
                      style={{ width: `${completionLoading ? 0 : finalDisplayCompletionPct}%` }}
                    />
                  </div>
                  {!completionLoading && finalDisplayCompletionPct < 100 && (
                    <p className="flex items-center gap-2 mt-2 text-xs font-semibold text-gray-500">
                      <span className="inline-block w-1.5 h-1.5 bg-[#9bc87c] rounded-full"></span>
                      Complete your profile to stand out!
                    </p>
                  )}
                  {!completionLoading && finalDisplayCompletionPct === 100 && (
                    <p className="flex items-center gap-1.5 mt-2 text-xs font-bold text-[#1DB32F]">
                      <FaCheckCircle size={12} /> Profile complete! 🎉
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Toast Message */}
            {toastMessage && (
              <div className={`fixed top-20 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2 animate-slide-in ${
                toastMessage.type === "success" 
                  ? "bg-[#1DB32F] border-[#00C950] text-white" 
                  : "bg-white border-red-200 text-red-500"
              }`}>
                {toastMessage.type === "success" ? <FaCheckCircle /> : <span>⚠️</span>}
                <span className="text-sm font-bold">{toastMessage.text}</span>
              </div>
            )}

            {/* Sections Container */}
            <div className="p-4 sm:p-6 space-y-4">

              {/* ABOUT */}
              <CollapsibleSection
                title="About"
                isExpanded={expandedSections.about}
                onToggle={() => toggleSection("about")}
                {...(isUniversityOwn && uniSectionBars && uniFormReady
                  ? {
                      weight: uniSectionBars.about.weight,
                      score: uniSectionBars.about.score,
                      showEditControls: true,
                      isEditing: editingUni.about,
                      onEditClick: () => startUniSectionEdit("about"),
                      onSaveClick: () => saveUniSection("about"),
                      onCancelClick: () => cancelUniSection("about"),
                      isSaving: savingUniSection === "about",
                    }
                  : { weight: 100, score: profile?.about ? 100 : 0 })}
              >
                <FieldRow
                  label="About Me"
                  value={profile?.about}
                  isVerified={
                    isUniversityOwn
                      ? isFieldComplete(uniForm?.about ?? profile?.about)
                      : !!(profile?.about && profile.about.trim() !== "")
                  }
                  isEditable={Boolean(isUniversityOwn && uniFormReady && editingUni.about)}
                  editValue={uniForm?.about ?? ""}
                  onChange={(v) => handleUniFormChange("about", v)}
                  type="textarea"
                  rows={4}
                  placeholder="Tell visitors about your institution…"
                />
              </CollapsibleSection>

              {/* UNIVERSITY: HIGHLIGHTS & COURSES */}
              {profile.user_role === "UNIVERSITY" && (
                <>
                  <CollapsibleSection
                    title="Profile Highlights"
                    isExpanded={expandedSections.highlights}
                    onToggle={() => toggleSection("highlights")}
                    {...(isUniversityOwn && uniSectionBars && uniFormReady
                      ? {
                          weight: uniSectionBars.highlights.weight,
                          score: uniSectionBars.highlights.score,
                          showEditControls: true,
                          isEditing: editingUni.highlights,
                          onEditClick: () => startUniSectionEdit("highlights"),
                          onSaveClick: () => saveUniSection("highlights"),
                          onCancelClick: () => cancelUniSection("highlights"),
                          isSaving: savingUniSection === "highlights",
                        }
                      : { weight: 100, score: (details?.address || details?.website) ? 100 : 0 })}
                  >
                    <FieldRow
                      label="Address"
                      value={details?.address}
                      isVerified={isFieldComplete(uniForm?.address ?? details?.address)}
                      isEditable={Boolean(isUniversityOwn && uniFormReady && editingUni.highlights)}
                      editValue={uniForm?.address ?? ""}
                      onChange={(v) => handleUniFormChange("address", v)}
                      type="textarea"
                      rows={2}
                      placeholder="Full address"
                    />
                    <FieldRow
                      label="Pincode"
                      value={details?.pincode}
                      isVerified={isFieldComplete(uniForm?.pincode ?? details?.pincode)}
                      isEditable={Boolean(isUniversityOwn && uniFormReady && editingUni.highlights)}
                      editValue={uniForm?.pincode ?? ""}
                      onChange={(v) => handleUniFormChange("pincode", v)}
                      placeholder="Pincode"
                    />
                    <FieldRow
                      label="Official Website"
                      isVerified={isFieldComplete(uniForm?.website_link ?? details?.website)}
                      isEditable={Boolean(isUniversityOwn && uniFormReady && editingUni.highlights)}
                      editValue={uniForm?.website_link ?? ""}
                      onChange={(v) => handleUniFormChange("website_link", v)}
                      placeholder="https://…"
                    >
                      {!isUniversityOwn || !editingUni.highlights ? (
                        details?.website ? (
                          <a
                            href={
                              String(details.website).startsWith("http")
                                ? details.website
                                : `https://${details.website}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-[#9bc87c] hover:underline break-all"
                          >
                            {details.website}
                          </a>
                        ) : (
                          <p className="text-sm italic text-gray-400">Not provided</p>
                        )
                      ) : null}
                    </FieldRow>
                    <FieldRow
                      label="Social Media"
                      isVerified={isFieldComplete(uniForm?.social_media_link ?? details?.social_link)}
                      isEditable={Boolean(isUniversityOwn && uniFormReady && editingUni.highlights)}
                      editValue={uniForm?.social_media_link ?? ""}
                      onChange={(v) => handleUniFormChange("social_media_link", v)}
                      placeholder="https://…"
                    >
                      {!isUniversityOwn || !editingUni.highlights ? (
                        details?.social_link ? (
                          <a
                            href={
                              String(details.social_link).startsWith("http")
                                ? details.social_link
                                : `https://${details.social_link}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-[#9bc87c] hover:underline break-all"
                          >
                            {details.social_link}
                          </a>
                        ) : (
                          <p className="text-sm italic text-gray-400">Not provided</p>
                        )
                      ) : null}
                    </FieldRow>
                  </CollapsibleSection>

                  <CollapsibleSection
                    title="Programs & Courses"
                    isExpanded={expandedSections.university_courses}
                    onToggle={() => toggleSection("university_courses")}
                    {...(isUniversityOwn && uniSectionBars && uniFormReady
                      ? {
                          weight: uniSectionBars.courses.weight,
                          score: uniSectionBars.courses.score,
                          showEditControls: true,
                          isEditing: editingUni.university_courses,
                          onEditClick: () => startUniSectionEdit("university_courses"),
                          onSaveClick: () => saveUniSection("university_courses"),
                          onCancelClick: () => cancelUniSection("university_courses"),
                          isSaving: savingUniSection === "university_courses",
                        }
                      : { weight: 100, score: details?.courses?.length ? 100 : 0 })}
                  >
                    <FieldRow
                      label="Programs offered"
                      isVerified={
                        isUniversityOwn
                          ? isFieldComplete(uniForm?.course_ids)
                          : !!(details?.courses && details.courses.length > 0)
                      }
                      isEditable={Boolean(isUniversityOwn && uniFormReady && editingUni.university_courses)}
                      type="custom"
                    >
                      {isUniversityOwn && editingUni.university_courses ? (
                        <Select
                          isMulti
                          options={courseOptions}
                          value={getSelectedCourses()}
                          onChange={(selected) => {
                            const ids = selected ? selected.map((opt) => opt.value) : [];
                            handleUniFormChange("course_ids", ids);
                          }}
                          onInputChange={(inputValue, meta) => {
                            if (meta.action === "input-change") setCourseSearch(inputValue);
                          }}
                          placeholder="Search courses (type 3+ letters)"
                          isLoading={isCourseLoading}
                          noOptionsMessage={() =>
                            courseSearch.length < 3 ? "Type at least 3 letters to search" : "No courses found"
                          }
                          className="text-sm font-medium"
                          menuPortalTarget={document.body}
                          menuPosition="fixed"
                          styles={{
                            control: (base) => ({
                              ...base,
                              borderColor: '#d1d5db',
                              borderRadius: '0.5rem',
                              '&:hover': { borderColor: '#9bc87c' }
                            }),
                            
                          }}
                        />
                      ) : details?.courses && details.courses.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {details.courses.map((course, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 text-xs font-bold text-[#1e1e2d] bg-gray-100 border border-gray-200 rounded-full"
                            >
                              {course}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm italic text-gray-400">No programs listed yet.</p>
                      )}
                    </FieldRow>
                  </CollapsibleSection>
                </>
              )}

              {/* CAREER OBJECTIVE - STUDENT */}
              {(profile?.user_role === "STUDENT" || !profile?.user_role) && profile?.career_objective && (
                <CollapsibleSection
                  title="Career Objective"
                  weight={100}
                  score={profile?.career_objective ? 100 : 0}
                  isExpanded={expandedSections.career_objective}
                  onToggle={() => toggleSection('career_objective')}
                >
                  <FieldRow
                    label="Career Objective"
                    value={profile?.career_objective}
                    isVerified={profile?.career_objective && profile.career_objective.trim() !== ""}
                  />
                </CollapsibleSection>
              )}

              {/* RESUME - STUDENT */}
              {(profile?.user_role === "STUDENT" || !profile?.user_role) && profile?.resume && (
                <CollapsibleSection
                  title="Resume"
                  weight={100}
                  score={profile?.resume ? 100 : 0}
                  isExpanded={expandedSections.resume}
                  onToggle={() => toggleSection('resume')}
                >
                  <div className="py-2">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-bold text-gray-700">Resume File</span>
                      <FaCheckCircle className="text-[#1DB32F]" size={14} />
                    </div>
                    <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                      <FaFilePdf className="text-red-500" size={20} />
                      <span className="text-sm font-semibold text-[#1e1e2d] truncate max-w-[200px]">{getFileNameFromUrl(profile.resume)}</span>
                      <div className="flex gap-2 ml-auto">
                        <a href={getImageUrl(profile.resume)} target="_blank" rel="noopener noreferrer" className="px-3 py-1 text-xs font-bold text-[#9bc87c] bg-[#9bc87c]/10 rounded-full hover:bg-[#9bc87c]/20 transition">View</a>
                      </div>
                    </div>
                  </div>
                </CollapsibleSection>
              )}

              {/* EXPERIENCE-SKILLS - STUDENT */}
              {(profile?.user_role === "STUDENT" || !profile?.user_role) && (
                <CollapsibleSection
                  title="Experience-Skills"
                  weight={100}
                  score={unifiedExperiences.length > 0 ? 100 : 0}
                  isExpanded={expandedSections.skills}
                  onToggle={() => toggleSection('skills')}
                >
                  {unifiedExperiences.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 mt-2">
                      {unifiedExperiences.map((exp, idx) => (
                        <div key={idx} className="flex gap-3 p-4 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl overflow-hidden">
                            {exp.logo ? (
                              <img src={getImageUrl(exp.logo) || websiteLogo} alt={exp.organization} className="object-contain w-8 h-8" />
                            ) : (
                              <span className="text-sm font-bold text-gray-400">{exp.organization?.charAt(0) || "?"}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-extrabold text-[#1e1e2d]">{exp.organization}</h4>
                            {exp.jobRole && <p className="text-sm font-semibold text-gray-600 mt-0.5">{exp.jobRole}</p>}
                            <p className="mb-2 text-xs font-semibold text-gray-400">{exp.duration}</p>
                            {exp.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {exp.skills.map((s, i) => (
                                  <span key={i} className="px-2 py-0.5 text-[10px] font-bold bg-[#9bc87c]/10 text-[#9bc87c] rounded">
                                    {s.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                            {exp.certificateUrl && (
                              <a href={getImageUrl(exp.certificateUrl)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center mt-3 text-xs font-bold text-[#1DB32F] hover:underline">
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
              )}

              {/* COMPANY: RECENT JOBS */}
              {profile.user_role === "COMPANY" && details?.recent_jobs && details.recent_jobs.length > 0 && (
                <CollapsibleSection
                  title="Recent Job Openings"
                  weight={100}
                  score={100}
                  isExpanded={expandedSections.work_experience}
                  onToggle={() => toggleSection('work_experience')}
                >
                  <div className="space-y-3 mt-2">
                    {details.recent_jobs.slice(0, 5).map((job) => (
                      <div key={job.id} className="p-4 transition-colors bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md">
                        <h4 className="font-extrabold text-[#1e1e2d]">{job.title}</h4>
                        <p className="text-sm font-semibold text-gray-600 mt-0.5">{job.type} • {job.stipend_range || "Stipend not disclosed"}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs font-medium text-gray-500">
                          <span>Starts: {job.start_date}</span>
                          {job.skills && job.skills.length > 0 && (
                            <>
                              <span>•</span>
                              <span className="truncate">{job.skills.join(", ")}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                    {details.recent_jobs.length > 5 && (
                      <Link
                        to={`/all-jobs?company=${profile.name}`}
                        className="inline-block mt-3 text-sm font-bold text-[#9bc87c] hover:text-[#8ab76b] transition"
                      >
                        View all {details.recent_jobs.length} jobs →
                      </Link>
                    )}
                  </div>
                </CollapsibleSection>
              )}

              {/* EDUCATION - STUDENT */}
              {(profile?.user_role === "STUDENT" || !profile?.user_role) && educationData.length > 0 && (
                <CollapsibleSection
                  title="Education"
                  weight={100}
                  score={educationData.length > 0 ? 100 : 0}
                  isExpanded={expandedSections.education}
                  onToggle={() => toggleSection('education')}
                >
                  <div className="grid gap-4 md:grid-cols-2 mt-2">
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
                </CollapsibleSection>
              )}

              {/* LANGUAGES - STUDENT */}
              {(profile?.user_role === "STUDENT" || !profile?.user_role) && profile?.language && (
                <CollapsibleSection
                  title="Languages you know"
                  weight={100}
                  score={profile?.language ? 100 : 0}
                  isExpanded={expandedSections.languages}
                  onToggle={() => toggleSection('languages')}
                >
                  <FieldRow
                    label="Languages"
                    value={profile?.language}
                    isVerified={profile?.language && profile.language.trim() !== ""}
                    isTagList={true}
                  />
                </CollapsibleSection>
              )}

              {/* AUTHENTICATION */}
              <CollapsibleSection
                title="Authentication"
                isExpanded={expandedSections.authentication}
                onToggle={() => toggleSection("authentication")}
                {...(isUniversityOwn && uniSectionBars
                  ? {
                      weight: uniSectionBars.verification.weight,
                      score: uniSectionBars.verification.score,
                    }
                  : { weight: 100, score: 100 })}
              >
                <div className="space-y-1">
                  <FieldRow 
                    label="Email Verification" 
                    value={profile?.verified_badges?.email ? "Verified" : "Not Verified"} 
                    isVerified={profile?.verified_badges?.email} 
                  />
                  <FieldRow 
                    label="Phone Verification" 
                    value={profile?.verified_badges?.phone ? "Verified" : "Not Verified"} 
                    isVerified={profile?.verified_badges?.phone} 
                  />
                  {profile?.user_role === "COMPANY" ? (
                    <FieldRow 
                      label="GST Verification" 
                      value={profile?.verified_badges?.gst ? "Verified" : "Not Verified"} 
                      isVerified={profile?.verified_badges?.gst} 
                    />
                  ) : (
                    <FieldRow 
                      // label="Aadhaar Verification" 
                      // value={profile?.verified_badges?.aadhar ? "Verified" : "Not Verified"} 
                      // isVerified={profile?.verified_badges?.aadhar} 
                    />
                  )}

                  {(!profile?.verified_badges?.email || !profile?.verified_badges?.phone || (!profile?.verified_badges?.aadhar && !profile?.verified_badges?.gst)) && (
                    <div className="p-4 mt-4 text-sm bg-blue-50/50 border border-blue-100 rounded-xl">
                      <div className="flex gap-3">
                        <Shield className="text-blue-500 shrink-0" size={20} />
                        <div>
                          <p className="font-semibold text-[#1e1e2d]">Complete your verification</p>
                          <p className="text-gray-500 mt-1">Unlock all platform features and build trust with recruiters by verifying your identity.</p>
                          {profileStats?.is_own_profile && (
                            <button onClick={() => navigate("/university-authentication")} className="mt-3 text-xs font-extrabold text-blue-600 hover:text-blue-700 transition">Start Verification →</button>
                          )}
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

export default FeedPublicProfilePage;
