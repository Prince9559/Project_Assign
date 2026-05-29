

// import React, { useEffect, useMemo, useState } from "react";
// import { useNavigate } from "react-router-dom";
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
// import UniversityRightSide from "./UniversityRightSide";
// import FeedRightSidebar from "../../student/feed/FeedRightSidebar";
// import MainLayout from "../../../components/layout/MainLayout";
// import { useDispatch, useSelector } from "react-redux";
// import { logout } from "../../../redux/feature/authSlice";
// import {userDetailsApi} from "../../../api/userDetailsApi";
// import feedApi from "../../../api/userDetailsApi";
// import {getImageUrl} from "../../../../utils"
// import dummyProfile3 from "../../../assets/dummyProfile3.jpg";
// import { universityApi } from "../../../api/university/universityApi";
// import Select from "react-select";
// import { useMasterData } from "../../../hooks/master/useMasterData";

// const UniversityProfile = () => {
//   const [activeDropdown, setActiveDropdown] = useState(null);
//   const [universityDetail, setUniversityDetail] = useState(null);
//   const [offeredCourses, setOfferedCourses] = useState([]);
//   const [isEditingCourses, setIsEditingCourses] = useState(false);
//   const [selectedCourseIds, setSelectedCourseIds] = useState([]);
//   const [coursesSaveStatus, setCoursesSaveStatus] = useState({
//     saving: false,
//     error: "",
//   });
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { user, token } = useSelector((state) => state.auth);
//   const { courses } = useMasterData();
//   const universityAccountStatus =
//     user?.accountStatus || user?.verification_status || "not_verified";
//   const isUniversityVerified = universityAccountStatus === "verified";

//   const BASE_URL = import.meta.env.VITE_BASE_URL;

//   const toggleDropdown = (id) => {
//     setActiveDropdown(activeDropdown === id ? null : id);
//   };
  

//   useEffect(() => {
//     const userData = async () => {
//       try {
//         if (user?.id) {
//           const res = await userDetailsApi.getMiniUserDetails(user.id, token);
//           setUniversityDetail(res.data.user);
//         }
//       } catch (error) {
//         console.error("Error fetching user data:", error);
//       }
//     };
//     userData();
//   }, [user,token]);

//   useEffect(() => {
//     const loadUniversityCourses = async () => {
//       if (!user?.id || !token) {
//         setOfferedCourses([]);
//         return;
//       }
//       try {
//         const res = await universityApi.getUniversityDetailsById(user.id, token);
//         const list = res?.data?.courses;
//         setOfferedCourses(Array.isArray(list) ? list : []);
//       } catch (error) {
//         console.error("Error fetching university courses:", error);
//         setOfferedCourses([]);
//       }
//     };
//     loadUniversityCourses();
//   }, [user?.id, token]);

//   const offeredCourseOptions = useMemo(() => {
//     const allowed = [
//       "B.Tech",
//       "M.Tech",
//       "BCA",
//       "MCA",
//       "BBA",
//       "MBA",
//       "B.Com",
//       "M.Com",
//       "BA",
//       "MA",
//       "B.Sc",
//       "M.Sc",
//       "B.Ed",
//       "M.Ed",
//       "LLB",
//       "LLM",
//       "B.Pharm",
//       "M.Pharm",
//       "Diploma",
//       "Polytechnic",
//       "ITI",
//       "PhD",
//     ];
//     const allowedSet = new Set(allowed.map((n) => n.toLowerCase().trim()));
//     const source = Array.isArray(courses) ? courses : [];

//     // Build map from master courses (id is required for saving)
//     const masterByName = new Map();
//     source.forEach((c) => {
//       const name = String(c?.name || "").toLowerCase().trim();
//       if (!c?.id || !name) return;
//       if (!allowedSet.has(name)) return;
//       if (!masterByName.has(name)) {
//         masterByName.set(name, { value: c.id, label: c.name });
//       }
//     });

//     // Always show ALL allowed options; disable those missing in master data.
//     return allowed.map((name) => {
//       const key = name.toLowerCase().trim();
//       const opt = masterByName.get(key);
//       if (opt) return opt;
//       return {
//         value: `missing:${name}`,
//         label: name,
//         isDisabled: true,
//       };
//     });
//   }, [courses]);

//   const startEditCourses = () => {
//     setCoursesSaveStatus({ saving: false, error: "" });
//     setSelectedCourseIds(
//       Array.isArray(offeredCourses) ? offeredCourses.map((c) => c.id) : []
//     );
//     setIsEditingCourses(true);
//   };

//   const cancelEditCourses = () => {
//     setCoursesSaveStatus({ saving: false, error: "" });
//     setSelectedCourseIds([]);
//     setIsEditingCourses(false);
//   };

//   const saveCourses = async () => {
//     if (!token) return;
//     try {
//       setCoursesSaveStatus({ saving: true, error: "" });
//       const res = await universityApi.updateUniversityDetails(
//         { course_ids: selectedCourseIds },
//         token
//       );
//       if (!res?.success) {
//         throw new Error(res?.message || "Failed to update courses");
//       }

//       // Update display immediately using master option labels
//       const map = new Map(offeredCourseOptions.map((o) => [o.value, o.label]));
//       const next = (selectedCourseIds || [])
//         .map((id) => {
//           const name = map.get(id);
//           return name ? { id, name } : null;
//         })
//         .filter(Boolean);
//       setOfferedCourses(next);

//       setIsEditingCourses(false);
//       setCoursesSaveStatus({ saving: false, error: "" });
//     } catch (e) {
//       console.error("Error saving offered courses:", e);
//       setCoursesSaveStatus({
//         saving: false,
//         error:
//           e?.response?.data?.message ||
//           e?.message ||
//           "Failed to save courses.",
//       });
//     }
//   };

//   const handleDeleteAccount = async () => {
//     try {
//       if (!window.confirm("Are you sure you want to delete your account?"))
//         return;
//       const response = await feedApi.softDeleteAccount(
//         {
//           user_id: user.id,
//         },
//         token
//       );

//       if (response) {
//         alert("Account deleted successfully!");
//         dispatch(logout());
//         navigate("/login");
//       } else {
//         alert(response?.message || "Failed to delete account.");
//       }
//     } catch (error) {
//       console.error("Failed to delete account", error);
//       throw error;
//     }
//   };

//   const profileOptions = [
//     {
//       id: "profile",
//       icon: <User size={20} />,
//       title: "My Profile",
//       subtitle: "Make changes to your profile",
//       hasChevron: true,
//       action: () => navigate("/university-profile-edit"),
//     },
//     // {
//     //   id: "activity",
//     //   icon: <FileText size={20} />,
//     //   title: "Activity Feed",
//     //   subtitle: "Your recent activity",
//     //   hasChevron: true,
//     //   action: () => navigate("/feed-user-activity"),
//     // },
//     // {
//     //   id: "terms",
//     //   icon: <Bell size={20} />,
//     //   title: "Terms & Conditions",
//     //   hasChevron: true,
//     //   action: () => navigate("/university-terms"),
//     // },
//     // {
//     //   id: "Permission",
//     //   icon: <Shield size={20} />,
//     //   title: "Terms & Permission",
//     //   hasChevron: true,
//     //   action: () => navigate("/university-terms"),
//     // },
//     {
//       id: "help",
//       icon: <HelpCircle size={20} />,
//       title: "Help & Support",
//       hasChevron: true,
//       action: () => toggleDropdown("help"),
//     },
//     {
//       id: "all-students",
//       icon: <FileText size={20} />,
//       title: "All Students",
//       subtitle: "Manage students from your university",
//       hasChevron: true,
//       action: () => navigate("/university/all-students"),
//     },
//     {
//       id: "pending-approvals",
//       icon: <Shield size={20} />,
//       title: "Pending Student Approvals",
//       subtitle: "Review re-approval requests",
//       hasChevron: true,
//       action: () => navigate("/university/pending-approvals"),
//     },
//     {
//       id: "manage",
//       icon: <Settings size={20} />,
//       title: "Manage Account",
//       hasChevron: true,
//       action: () => toggleDropdown("manage"),
//     },
//     {
//       id: "logout",
//       icon: <LogOut size={20} />,
//       title: "Log out",
//       subtitle: "Further secure your account for safety",
//       hasChevron: true,
//       action: () => {
//         dispatch(logout());
//         navigate("/login");
//       },
//     },
//   ].filter((option) => {
//     // Hide university edit/setup actions once account is activated (verified).
//     if (isUniversityVerified && option.id === "profile") return false;
//     return true;
//   });

//   return (
//     <MainLayout>
//       <div className="flex justify-center min-h-screen px-2 bg-gray-100 lg:px-8">
//         {/* Left Spacer */}
//         <div className="flex-grow hidden lg:block "></div>

//         {/* Profile Section */}
//         <section className="w-full max-w-[95vw] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] h-auto p-3 sm:p-4 md:p-5 lg:p-6 rounded-[5px] bg-white flex flex-col shadow-lg gap-3 sm:gap-4 mt-2 mx-auto">
//           {/* Profile Header */}
//           <div className="bg-[#002B6B] text-white p-3 sm:p-4 lg:p-4 flex flex-col sm:flex-row sm:items-center justify-between rounded-[5px] gap-3 sm:gap-4">
//             <div className="flex items-center flex-1 min-w-0 gap-3 sm:gap-4">
//               <img
//                 src={ 
//                   user.user_profile_pic? getImageUrl(user.user_profile_pic) : dummyProfile3
//                 }
//                 alt="avatar"
//                 className="flex-shrink-0 object-cover w-12 h-12 rounded-full sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18"
//               />
//               <div className="flex-1 min-w-0">
//                 <h1 className="text-base font-semibold truncate sm:text-lg md:text-xl lg:text-2xl">
//                   {user?.organization_name || "Unknown University"}
//                 </h1>
//                 <p className="text-xs text-gray-200 truncate sm:text-sm">
//                   {user?.email}
//                 </p>
//                 <p className="text-xs text-gray-200 truncate sm:text-sm">
//                   {user?.user_role}
//                 </p>
//               </div>
//             </div>
            
//             <button
//               className="border border-white rounded-full bg-white px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-[#002B6B] transition-colors flex items-center gap-1.5 sm:gap-2 self-start sm:self-auto whitespace-nowrap min-h-[44px] sm:min-h-[40px]"
//               onClick={() => navigate(`/public-profile/${universityDetail.uuid?universityDetail.uuid: null}`)}
//             >
//               <HiOutlineEye size={14} className="sm:w-4 sm:h-4" />
//               <span className="hidden xs:inline">Profile</span>
//               <span className="xs:hidden">View</span>
//             </button>
//           </div>

//           {/* Offered Courses */}
//           <div className="px-3 sm:px-4">
//             <div className="p-3 sm:p-4 border border-gray-200 rounded-lg bg-gray-50">
//               <div className="flex items-start justify-between gap-2 mb-2">
//                 <h3 className="text-sm font-semibold text-gray-900 sm:text-base">
//                   Offered Courses
//                 </h3>
//                 <button
//                   type="button"
//                   className="flex-shrink-0 text-xs sm:text-sm text-blue-600 hover:text-blue-800"
//                   onClick={() => (isEditingCourses ? undefined : startEditCourses())}
//                   disabled={isEditingCourses}
//                 >
//                   Edit
//                 </button>
//               </div>
//               {isEditingCourses ? (
//                 <div className="mt-1">
//                   <Select
//                     isMulti
//                     options={offeredCourseOptions}
//                     value={selectedCourseIds
//                       .map((id) => offeredCourseOptions.find((o) => o.value === id))
//                       .filter(Boolean)}
//                     onChange={(selected) => {
//                       const ids = (selected || [])
//                         .map((o) => o.value)
//                         .filter((v) => typeof v === "number");
//                       setSelectedCourseIds(ids);
//                     }}
//                     placeholder="Select Courses"
//                     className="text-sm"
//                     classNamePrefix="select"
//                     isClearable
//                     isSearchable
//                     isOptionDisabled={(opt) => !!opt.isDisabled}
//                     noOptionsMessage={() => "No courses found"}
//                   />
//                   <p className="mt-2 text-[11px] text-gray-500">
//                     Note: Disabled options will become selectable once they are
//                     added in master courses.
//                   </p>
//                   {coursesSaveStatus.error && (
//                     <p className="mt-2 text-xs text-red-600">
//                       {coursesSaveStatus.error}
//                     </p>
//                   )}
//                   <div className="flex gap-2 mt-3">
//                     <button
//                       type="button"
//                       className="text-xs sm:text-sm text-green-600"
//                       onClick={saveCourses}
//                       disabled={coursesSaveStatus.saving}
//                     >
//                       {coursesSaveStatus.saving ? "Saving..." : "Save"}
//                     </button>
//                     <button
//                       type="button"
//                       className="text-xs sm:text-sm text-gray-600"
//                       onClick={cancelEditCourses}
//                       disabled={coursesSaveStatus.saving}
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex flex-wrap gap-2 mt-1">
//                   {offeredCourses.length > 0 ? (
//                     offeredCourses.map((course) => (
//                       <span
//                         key={course.id}
//                         className="inline-flex items-center gap-1 text-xs text-gray-700 sm:text-sm"
//                       >
//                         <span className="w-2 h-2 bg-green-500 rounded-full shrink-0" />
//                         {course.name}
//                       </span>
//                     ))
//                   ) : (
//                     <span className="text-xs text-gray-500 sm:text-sm">
//                       No courses added yet
//                     </span>
//                   )}
//                 </div>
//               )}
//             </div>
//           </div>

//           {/* Main Options */}
//           <div className="p-3 sm:p-4 lg:p-6 max-h-[calc(100vh-140px)] sm:max-h-[calc(100vh-160px)] md:max-h-[calc(100vh-180px)] lg:max-h-[calc(100vh-200px)] overflow-y-auto space-y-1 sm:space-y-2">
//             {profileOptions.map((option) => (
//               <div key={option.id}>
//                 <button
//                   onClick={option.action}
//                   className="w-full flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-lg bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors border border-transparent hover:border-gray-200 min-h-[60px] sm:min-h-[64px] md:min-h-[72px]"
//                 >
//                   <div className="flex items-center w-[641px] h-[40px] gap-[15px] opacity-100">
//                     <div className="w-[40px] h-[40px] bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
//                       {option.icon}
//                     </div>
//                     <div className="flex flex-col text-left">
//                       <span className="text-sm font-medium text-gray-900 sm:text-base">
//                         {option.title}
//                       </span>
//                       {option.subtitle && (
//                         <span className="text-xs text-gray-400 sm:text-sm">
//                           {option.subtitle}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                   {option.hasChevron && (
//                     <ChevronRight size={18} className="text-gray-400" />
//                   )}
//                 </button>

//                 {/* Dropdowns */}
//                 {activeDropdown === option.id && (
//                   <div className="mt-2 ml-10 space-y-2 sm:ml-12">
//                     {(option.id === "help"
//                       ? [
//                           {
//                             icon: <Settings size={16} />,
//                             label: "Raise a ticket",
//                             action: () => navigate("/university-ticket"),
//                           },
//                           {
//                             icon: <Settings size={16} />,
//                             label: "Chat with us!",
//                             action: () => navigate("/university-faq"),
//                           },
//                         ]
//                       : [
//                           {
//                             icon: <Mail size={16} />,
//                             label: "Change email",
//                             action: () => navigate("/university-change-email"),
//                           },
//                           {
//                             icon: <Lock size={16} />,
//                             label: "Change password",
//                             action: () => navigate("/university-change-password"),
//                           },
//                           {
//                             icon: <Trash2 size={16} />,
//                             label: "Delete my account",
//                             action: handleDeleteAccount,
//                           },
//                         ]
//                     ).map((item, i) => (
//                       <button
//                         key={i}
//                         onClick={item.action}
//                         className="flex items-center w-full gap-3 p-3 transition-colors rounded-lg sm:p-4 bg-gray-50 hover:bg-gray-100 active:bg-gray-200"
//                       >
//                         <div className="flex items-center justify-center w-8 h-8 text-gray-600 bg-gray-100 rounded-full">
//                           {item.icon}
//                         </div>
//                         <span className="text-sm font-medium text-gray-900 sm:text-base">
//                           {item.label}
//                         </span>
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Right Side */}
//         {/* <aside className="hidden lg:block w-full max-w-[350px] p-2 sticky top-4 h-fit">
//           <FeedRightSidebar />
//         </aside> */}

//         {/* Right Spacer */}
//         <div className="flex-grow hidden lg:block"></div>
//       </div>
//     </MainLayout>
//   );
// };

// export default UniversityProfile;


// import React, { useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   ChevronRight,
//   User,
//   FileText,
//   Settings,
//   LogOut,
//   Mail,
//   Lock,
//   Trash2,
//   HelpCircle,
//   Shield,
// } from "lucide-react";
// import MainLayout from "../../../components/layout/MainLayout";
// import { useDispatch, useSelector } from "react-redux";
// import { logout } from "../../../redux/feature/authSlice";
// import { userDetailsApi } from "../../../api/userDetailsApi";
// import feedApi from "../../../api/userDetailsApi";

// const UniversityProfile = () => {
//   const [activeDropdown, setActiveDropdown] = useState(null);
//   const [universityDetail, setUniversityDetail] = useState(null);
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { user, token } = useSelector((state) => state.auth);

//   const toggleDropdown = (id) => {
//     setActiveDropdown(activeDropdown === id ? null : id);
//   };

//   useEffect(() => {
//     const userData = async () => {
//       try {
//         if (user?.id) {
//           const res = await userDetailsApi.getMiniUserDetails(user.id, token);
//           setUniversityDetail(res.data.user);
//         }
//       } catch (error) {
//         console.error("Error fetching user data:", error);
//       }
//     };
//     userData();
//   }, [user, token]);

//   const handleDeleteAccount = async () => {
//     try {
//       if (!window.confirm("Are you sure you want to delete your account?"))
//         return;
//       const response = await feedApi.softDeleteAccount(
//         {
//           user_id: user.id,
//         },
//         token
//       );

//       if (response) {
//         alert("Account deleted successfully!");
//         dispatch(logout());
//         navigate("/login");
//       } else {
//         alert(response?.message || "Failed to delete account.");
//       }
//     } catch (error) {
//       console.error("Failed to delete account", error);
//       alert(
//         error.response?.data?.message ||
//           "Something went wrong while deleting account."
//       );
//     }
//   };

//   const profileOptions = [
//     {
//       id: "profile",
//       icon: <User size={20} />,
//       title: "My Profile",
//       subtitle: "Make changes to your profile",
//       hasChevron: true,
//       action: () =>
//         navigate(
//           `/public-profile/${
//             universityDetail?.uuid ? universityDetail.uuid : ""
//           }`
//         ),
//     },
//     {
//       id: "help",
//       icon: <HelpCircle size={20} />,
//       title: "Help & Support",
//       hasChevron: true,
//       action: () => toggleDropdown("help"),
//     },
//     {
//       id: "all-students",
//       icon: <FileText size={20} />,
//       title: "All Students",
//       subtitle: "Manage students from your university",
//       hasChevron: true,
//       action: () => navigate("/university/all-students"),
//     },
//     {
//       id: "pending-approvals",
//       icon: <Shield size={20} />,
//       title: "Pending Student Approvals",
//       subtitle: "Review re-approval requests",
//       hasChevron: true,
//       action: () => navigate("/university/pending-approvals"),
//     },
//     {
//       id: "manage",
//       icon: <Settings size={20} />,
//       title: "Manage Account",
//       hasChevron: true,
//       action: () => toggleDropdown("manage"),
//     },
//     {
//       id: "logout",
//       icon: <LogOut size={20} />,
//       title: "Log out",
//       subtitle: "Further secure your account for safety",
//       hasChevron: true,
//       action: () => {
//         dispatch(logout());
//         navigate("/login");
//       },
//     },
//   ];

//   return (
//     <MainLayout>
//       <div className="flex justify-center min-h-screen px-2 bg-gray-100 lg:px-8">
//         {/* Left Spacer */}
//         <div className="flex-grow hidden lg:block "></div>

//         {/* Profile Section */}
//         <section className="w-full max-w-[95vw] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] h-auto p-3 sm:p-4 md:p-5 lg:p-6 rounded-[5px] bg-white flex flex-col shadow-lg gap-3 sm:gap-4 mt-2 mx-auto">
          
//           {/* Profile Header */}
//           <div className="bg-[#002B6B] text-white p-3 sm:p-4 lg:p-4 flex flex-col sm:flex-row sm:items-center justify-between rounded-[5px] gap-3 sm:gap-4">
//             <div className="flex items-center flex-1 min-w-0 gap-3 sm:gap-4">
//               <div className="flex-1 min-w-0">
//                 <h1 className="text-base font-semibold truncate sm:text-lg md:text-xl lg:text-2xl">
//                   Settings and Access Panel
//                 </h1>
//               </div>
//             </div>
//           </div>

//           {/* Main Content Options */}
//           <div className="p-3 sm:p-4 lg:p-6 max-h-[calc(100vh-140px)] sm:max-h-[calc(100vh-160px)] md:max-h-[calc(100vh-180px)] lg:max-h-[calc(100vh-200px)] overflow-y-auto space-y-1 sm:space-y-2">
//             {profileOptions.map((option) => (
//               <div key={option.id}>
//                 <button
//                   onClick={option.action}
//                   className="w-full flex items-center justify-between p-3 sm:p-4 md:p-5 rounded-lg bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors border border-transparent hover:border-gray-200 min-h-[60px] sm:min-h-[64px] md:min-h-[72px]"
//                 >
//                   <div className="flex items-center w-[641px] h-[40px] gap-[15px] opacity-100">
//                     <div className="w-[40px] h-[40px] opacity-100 bg-gray-100 rounded-full flex items-center justify-center">
//                       <div className="text-gray-600 w-[40px] h-[40px] flex items-center justify-center opacity-100">
//                         {option.icon}
//                       </div>
//                     </div>
//                     <div className="flex flex-col w-auto text-left opacity-100">
//                       <span className="text-sm font-medium text-gray-900 sm:text-base md:text-medium lg:text-medium">
//                         {option.title}
//                       </span>
//                       {option.subtitle && (
//                         <span className="text-xs text-gray-400 sm:text-sm md:text-base">
//                           {option.subtitle}
//                         </span>
//                       )}
//                     </div>
//                   </div>

//                   {option.hasChevron && (
//                     <ChevronRight
//                       size={18}
//                       className="flex-shrink-0 ml-2 text-gray-400 sm:ml-3"
//                     />
//                   )}
//                 </button>

//                 {/* Dropdowns */}
//                 {activeDropdown === option.id && (
//                   <div className="mt-1 ml-10 space-y-1 sm:ml-12 md:ml-14 lg:ml-16 sm:mt-2 sm:space-y-2">
//                     {(option.id === "help"
//                       ? [
//                           {
//                             icon: <Settings size={16} />,
//                             label: "Raise a ticket",
//                             action: () => navigate("/university-ticket"),
//                           },
//                           {
//                             icon: <Settings size={16} />,
//                             label: "Chat with us!",
//                             action: () => navigate("/university-faq"),
//                           },
//                         ]
//                       : [
//                           {
//                             icon: <Mail size={16} />,
//                             label: "Change email",
//                             action: () => navigate("/university-change-email"),
//                           },
//                           {
//                             icon: <Lock size={16} />,
//                             label: "Change password",
//                             action: () => navigate("/university-change-password"),
//                           },
//                           {
//                             icon: <Trash2 size={16} />,
//                             label: "Delete my account",
//                             action: handleDeleteAccount,
//                           },
//                         ]
//                     ).map((item, i) => (
//                       <button
//                         key={i}
//                         onClick={item.action}
//                         className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-gray-50 hover:bg-gray-100 active:bg-gray-200 transition-colors min-h-[48px] sm:min-h-[52px]"
//                       >
//                         <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-gray-600 bg-gray-100 rounded-full sm:w-10 sm:h-10">
//                           <div className="flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5">
//                             {item.icon}
//                           </div>
//                         </div>
//                         <span className="text-sm font-medium text-gray-900 truncate sm:text-base md:text-lg">
//                           {item.label}
//                         </span>
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Right Spacer */}
//         <div className="flex-grow hidden lg:block"></div>
//       </div>
//     </MainLayout>
//   );
// };

// export default UniversityProfile;






import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  FileText,
  Settings,
  LogOut,
  Mail,
  Lock,
  Trash2,
  HelpCircle,
  Shield,
} from "lucide-react";
import MainLayout from "../../../components/layout/MainLayout";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../redux/feature/authSlice";
import { userDetailsApi } from "../../../api/userDetailsApi";
import feedApi from "../../../api/userDetailsApi";

// Using the same components as the student profile
import SettingsHeader from "../../../components/jobs/SettingsHeader.jsx";
import SettingsOptionCard from "../../../components/jobs/SettingOptionCard.jsx";

const UniversityProfile = () => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [universityDetail, setUniversityDetail] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  useEffect(() => {
    const userData = async () => {
      try {
        if (user?.id) {
          const res = await userDetailsApi.getMiniUserDetails(user.id, token);
          setUniversityDetail(res.data.user);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    userData();
  }, [user, token]);

  const handleDeleteAccount = async () => {
    try {
      if (!window.confirm("Are you sure you want to delete your account?"))
        return;
      const response = await feedApi.softDeleteAccount(
        {
          user_id: user.id,
        },
        token
      );

      if (response) {
        alert("Account deleted successfully!");
        dispatch(logout());
        navigate("/login");
      } else {
        alert(response?.message || "Failed to delete account.");
      }
    } catch (error) {
      console.error("Failed to delete account", error);
      alert(
        error.response?.data?.message ||
          "Something went wrong while deleting account."
      );
    }
  };

  const profileOptions = [
    {
      id: "profile",
      icon: <User size={20} />,
      title: "My Profile",
      subtitle: "Make changes to your profile",
      hasChevron: true,
      action: () =>
        navigate(
          `/public-profile/${
            universityDetail?.uuid ? universityDetail.uuid : ""
          }`
        ),
    },
    {
      id: "help",
      icon: <HelpCircle size={20} />,
      title: "Help & Support",
      hasChevron: true,
      action: () => toggleDropdown("help"),
    },
    {
      id: "all-students",
      icon: <FileText size={20} />,
      title: "All Students",
      subtitle: "Manage students from your university",
      hasChevron: true,
      action: () => navigate("/university/all-students"),
    },
    {
      id: "pending-approvals",
      icon: <Shield size={20} />,
      title: "Pending Student Approvals",
      subtitle: "Review re-approval requests",
      hasChevron: true,
      action: () => navigate("/university/pending-approvals"),
    },
    {
      id: "manage",
      icon: <Settings size={20} />,
      title: "Manage Account",
      hasChevron: true,
      action: () => toggleDropdown("manage"),
    },
    {
      id: "logout",
      icon: <LogOut size={20} />,
      title: "Log out",
      subtitle: "Further secure your account for safety",
      hasChevron: true,
      action: () => {
        dispatch(logout());
        navigate("/login");
      },
    },
  ];

  return (
    <MainLayout>
      <div className="flex justify-center min-h-screen px-2 bg-gray-50 lg:px-8">
        <div className="flex-grow hidden lg:block"></div>
        
        <section className="w-full max-w-[95vw] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] h-auto p-4 sm:p-5 lg:p-6 rounded-2xl border border-gray-100 bg-white flex flex-col shadow-sm gap-4 mt-4 mx-auto mb-10">
          
          <SettingsHeader title="Settings and Access Panel" />

          <div className="p-1 sm:p-2 overflow-y-auto space-y-4">
            {profileOptions.map((option) => (
              <div key={option.id}>
                
                {/* Replaced old buttons with SettingsOptionCard to match Feedprofile */}
                <SettingsOptionCard
                  icon={option.icon}
                  title={option.title}
                  subtitle={option.subtitle}
                  showChevron={option.hasChevron}
                  onClick={() => {
                    if (option.action) {
                      option.action();
                    }
                  }}
                />

                {/* Dropdowns Menu (Matching the exact styling from Feedprofile) */}
                {activeDropdown === option.id && (
                  <div className="mt-3 ml-4 sm:ml-16 pl-4 border-l-2 border-gray-100 space-y-2">
                    {(option.id === "help"
                      ? [
                          {
                            icon: <Settings size={16} />,
                            label: "Raise a ticket",
                            action: () => navigate("/university-ticket"),
                          },
                          {
                            icon: <Settings size={16} />,
                            label: "Chat with us!",
                            action: () => navigate("/university-faq"),
                          },
                        ]
                      : [
                          {
                            icon: <Mail size={16} />,
                            label: "Change email",
                            action: () => navigate("/university-change-email"),
                          },
                          {
                            icon: <Lock size={16} />,
                            label: "Change password",
                            action: () => navigate("/university-change-password"),
                          },
                          {
                            icon: <Trash2 size={16} />,
                            label: "Delete my account",
                            action: handleDeleteAccount,
                          },
                        ]
                    ).map((item, i) => (
                      <button
                        key={i}
                        onClick={item.action}
                        className="w-full flex items-center gap-3 sm:gap-4 p-3 rounded-xl bg-white border border-gray-100 hover:border-[#9bc87c]/50 hover:bg-[#9bc87c]/5 active:bg-gray-100 transition-colors min-h-[48px] sm:min-h-[52px] group shadow-sm"
                      >
                        <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-[#1e1e2d] bg-gray-50 border border-gray-100 group-hover:border-[#9bc87c]/50 group-hover:bg-white rounded-lg transition-colors">
                          <div
                            className={`flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                              item.label === "Delete my account"
                                ? "text-red-500"
                                : "group-hover:text-[#1DB32F]"
                            }`}
                          >
                            {item.icon}
                          </div>
                        </div>
                        <span
                          className={`text-sm font-bold truncate transition-colors ${
                            item.label === "Delete my account"
                              ? "text-red-500"
                              : "text-[#1e1e2d] group-hover:text-[#1DB32F]"
                          }`}
                        >
                          {item.label}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="flex-grow hidden lg:block"></div>
      </div>
    </MainLayout>
  );
};

export default UniversityProfile;