// import { NavLink, useNavigate, useLocation } from "react-router-dom";
// import { FaSearch, FaBell, FaUser, FaBars, FaTimes } from "react-icons/fa";
// import { FiMessageCircle } from "react-icons/fi";
// import { useState, useEffect } from "react";
// import websiteLogo from "../../assets/WebsiteLogo.svg";
// import { useSelector } from "react-redux";
// import { showProfileIncompleteAlert } from "../../utils/alertService";
// import { userDetailsApi } from "../../api/userDetailsApi";
// import NotificationBell from "../notifications/NotificationBell"

// export default function Header() {
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isSearchExpanded, setIsSearchExpanded] = useState(false);
//   const navigate = useNavigate();

//   const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
//   const toggleSearch = () => setIsSearchExpanded(!isSearchExpanded);
//   const { token, user } = useSelector((state) => state.auth);
//   const userRole = user?.user_role?.toLowerCase();

//   const [profileCompletion, setProfileCompletion] = useState(null);
//   const [loadingCompletion, setLoadingCompletion] = useState(true);

//   const location = useLocation();
//   const isStudentFillPage =
//     location.pathname === "/student-fill-account-details";

//   // const isPostJobActive =
//   //   location.pathname === "/recruiter-post-opportunity-selector" ||
//   //   location.pathname === "/recruiter-post-job-intern-details";

//   const isAnyPostingPage = [
//   "/recruiter-post-opportunity-selector",
//   "/recruiter-post-job-intern-details"
// ].includes(location.pathname);

//   const [isProfileOpen, setIsProfileOpen] = useState(false);


//   //  Helper to detect current posting type from URL/state
// const getCurrentPostingType = () => {
//   const pathname = location.pathname;
  
//   // Case 1: On dashboard with query param ?type=active|future|college
//   if (pathname === "/recruiter-dashboard") {
//     const params = new URLSearchParams(location.search);
//     const type = params.get("type");
//     if (type && ["active", "future", "college"].includes(type)) {
//       return type;
//     }
//   }
  
//   // Case 2: On opportunity selector with preselected type in state
//   if (pathname === "/recruiter-post-opportunity-selector") {
//     const preselected = location.state?.preselectedPostingType;
//     if (preselected && ["active", "future", "college"].includes(preselected)) {
//       return preselected;
//     }
//   }
  
//   // Case 3: On job details page - try to read from state (passed through)
//   if (pathname === "/recruiter-post-job-intern-details") {
//     const jobStatus = location.state?.jobStatus || location.state?.postingType;
//     if (jobStatus && ["active", "future", "college"].includes(jobStatus)) {
//       return jobStatus;
//     }
//   }
  
//   return null; // No specific posting type detected
// };

// const currentPostingType = getCurrentPostingType(); //  Compute once per render


//   useEffect(() => {
//     const fetchProfileCompletion = async () => {
//       if (!token) {
//         setLoadingCompletion(false);
//         return;
//       }

//       setLoadingCompletion(true);
//       try {

//         const response = await userDetailsApi.getProfileCompletion(
//           token,
//           false
//         );

//         // Extract correctly:
//         const pct = response?.data?.profile_completion_percentage;

//         if (typeof pct === "number") {
//           setProfileCompletion(Math.min(100, Math.max(0, pct)));
//         } else {
//           setProfileCompletion(0);
//         }
//       } catch (err) {
//         console.warn("Profile completion fetch failed:", err);
//         setProfileCompletion(0);
//       } finally {
//         setLoadingCompletion(false);
//       }
//     };

//     fetchProfileCompletion();
//   }, [token]);

//   // Guarded navigation handler for NavLink (receives event)
//   const handleNavClick = (path, event) => {
//     if (user?.profile_status === 1) {
//       const protectedPaths = [
//         "/feed",
//         "/all-jobs",
//         "/university/jobs",
//         "/ai-prediction",
//         "/student-profile",
//         "/recruiter-dashboard",
//         "/recruiter-profile",
//         "/recruiter-post-job-intern-details",
//         "/recruiter-post-opportunity-selector",
//         "/student-analytics",
//         "/university-profile",
//         "/feed-notifications",
//         "/chat",
//         "/chat-home",
//         "/feed-ticket",
//         "/recruiter-ticket",
//         "/university-ticket",
//         "/university/credits/dashboard",
//         "/university/credits/pricing",
//         "/feed-view",
//         "/pricing",
//         "/notifications",
//       ];

//       if (protectedPaths.some((p) => path.startsWith(p))) {
//         event.preventDefault(); // Stop NavLink from navigating
//         showProfileIncompleteAlert(user.user_role).then((result) => {
//           if (result.isConfirmed) {
//             const setupPath =
//               userRole === "student"
//                 ? "/student-fill-account-details"
//                 : userRole === "company"
//                   ? "/recruiter-fill-account-details"
//                   : userRole === "university"
//                     ? "/university-fill-account-details"
//                     : "/student-fill-account-details";
//             navigate(setupPath);
//           }
//         });
//       }
//     }
//     // If profile_status !== 1, do nothing — let NavLink handle navigation normally
//   };

//   // For icon clicks (no event needed)
//   const handleIconNav = (path) => {
//     if (user?.profile_status === 1) {
//       const protectedPaths = [
//         "/feed",
//         "/all-jobs",
//         "/university/jobs",
//         "/ai-prediction",
//         "/student-profile",
//         "/recruiter-dashboard",
//         "/recruiter-profile",
//         "/recruiter-post-job-intern-details",
//         "/recruiter-post-opportunity-selector",
//         "/student-analytics",
//         "/university-profile",
//         "/feed-notifications",
//         "/chat",
//         "chat-home",
//         "/feed-ticket",
//         "/recruiter-ticket",
//         "/university-ticket",
//         "/university/credits/dashboard",
//         "/university/credits/pricing",
//         "/feed-view",
//         "/pricing",
//         "/notifications",
//       ];

//       if (protectedPaths.some((p) => path.startsWith(p))) {
//         showProfileIncompleteAlert(user.user_role).then((result) => {
//           if (result.isConfirmed) {
//             const setupPath =
//               userRole === "student"
//                 ? "/student-fill-account-details"
//                 : userRole === "company"
//                   ? "/recruiter-fill-account-details"
//                   : userRole === "university"
//                     ? "/university-fill-account-details"
//                     : "/student-fill-account-details";
//             navigate(setupPath);
//           }
//         });
//         return;
//       }
//     }
//     navigate(path);
//   };



//   return (
//     <div
//       className="sticky top-0 z-50 flex items-center justify-between w-full px-2 py-1 bg-white shadow-sm sm:px-3 md:px-4 h-14"
//       style={{
//         background: "linear-gradient(90deg, #f5f6f7 60%, #ffe9b3 100%)",
//       }}
//     >
//       {/* Logo */}
//       <div className="flex items-center">
//         <p className="text-base font-bold sm:text-lg md:text-xl">
//           <img src={websiteLogo} alt="Logo" className="w-8 h-8" />
//         </p>
//       </div>

//       {/* Desktop Nav Tabs - centered */}
//       <div className="absolute z-10 hidden gap-1 px-1 py-1 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-sm lg:flex left-1/2 top-1/2">
//         {/* Always shown */}
//         {/* <NavLink
//           to="/feed"
//           onClick={(e) => handleNavClick("/feed", e)}
//           className={({ isActive }) =>
//             isActive
//               ? "bg-[#00194A] text-white rounded-full px-2 md:px-3 lg:px-4 py-1.5 font-medium shadow text-xs md:text-sm"
//               : "text-[#00194A] px-2 md:px-3 lg:px-4 py-1.5 rounded-full font-medium hover:bg-gray-100 text-xs md:text-sm"
//           }
//         >
//           Feed
//         </NavLink> */}

//         {/* Shown for student */}
//         {(userRole === "student") && (
//           <NavLink
//             to="/all-jobs?opportunityType=Job"
//             onClick={(e) => handleNavClick("/all-jobs", e)}
//             className={({ isActive }) =>
//               isActive
//                 ? "bg-[#00194A] text-white rounded-full px-2 md:px-3 lg:px-4 py-1.5 font-medium shadow text-xs md:text-sm"
//                 : "text-[#00194A] px-2 md:px-3 lg:px-4 py-1.5 rounded-full font-medium hover:bg-gray-100 text-xs md:text-sm"
//             }
//           >
//             Jobs
//           </NavLink>
//         )}

//         {/* Shown for student */}
//         {(userRole === "student") && (
//           <NavLink
//             to="/all-jobs?opportunityType=Internship"
//             onClick={(e) => handleNavClick("/all-jobs", e)}
//             className={({ isActive }) =>
//               isActive
//                 ? "bg-[#00194A] text-white rounded-full px-2 md:px-3 lg:px-4 py-1.5 font-medium shadow text-xs md:text-sm"
//                 : "text-[#00194A] px-2 md:px-3 lg:px-4 py-1.5 rounded-full font-medium hover:bg-gray-100 text-xs md:text-sm"
//             }
//           >
//             Internships
//           </NavLink>
//         )}

//         {/* Shown for student */}
//         {(userRole === "student") && (
//           <NavLink
//             to="/all-jobs?opportunityType=project"
//             onClick={(e) => handleNavClick("/all-jobs", e)}
//             className={({ isActive }) =>
//               isActive
//                 ? "bg-[#00194A] text-white rounded-full px-2 md:px-3 lg:px-4 py-1.5 font-medium shadow text-xs md:text-sm"
//                 : "text-[#00194A] px-2 md:px-3 lg:px-4 py-1.5 rounded-full font-medium hover:bg-gray-100 text-xs md:text-sm"
//             }
//           >
//             Projects
//           </NavLink>
//         )}

//         {/* Shown for university */}
//         {(userRole === "university") && (
//           <NavLink
//             to="/university/jobs"
//             onClick={(e) => handleNavClick("/university/jobs", e)}
//             className={({ isActive }) =>
//               isActive
//                 ? "bg-[#00194A] text-white rounded-full px-2 md:px-3 lg:px-4 py-1.5 font-medium shadow text-xs md:text-sm"
//                 : "text-[#00194A] px-2 md:px-3 lg:px-4 py-1.5 rounded-full font-medium hover:bg-gray-100 text-xs md:text-sm"
//             }
//           >
//             Jobs
//           </NavLink>
//         )}

//         {/* Shown for company */}
//         {userRole === "company" && (
//           <NavLink
//             to="/recruiter-dashboard"
//             onClick={(e) => handleNavClick("/recruiter-dashboard", e)}
//             className={({ isActive }) =>{
//               const isDashboardOverview = !currentPostingType && location.pathname === "/recruiter-dashboard";
    
//           return isDashboardOverview
//                 ? "bg-[#00194A] text-white rounded-full px-2 md:px-3 lg:px-4 py-1.5 font-medium shadow text-xs md:text-sm"
//                 : "text-[#00194A] px-2 md:px-3 lg:px-4 py-1.5 rounded-full font-medium hover:bg-gray-100 text-xs md:text-sm"
//             }}
//           >
//             Dashboard
//           </NavLink>
//         )}

//         {/* Shown for student */}
//         {userRole === "student" && (
//           <NavLink
//             to="/ai-prediction"
//             onClick={(e) => handleNavClick("/ai-prediction", e)}
//             className={({ isActive }) =>
//               isActive
//                 ? "bg-[#00194A] text-white rounded-full px-2 md:px-3 lg:px-4 py-1.5 font-medium shadow text-xs md:text-sm"
//                 : "text-[#00194A] px-2 md:px-3 lg:px-4 py-1.5 rounded-full font-medium hover:bg-gray-100 text-xs md:text-sm"
//             }
//           >
//             AI Prediction
//           </NavLink>
//         )}

//         {/* Company only */}

//         {userRole === "company" && (
//           <>
//             <NavLink
//               to="/recruiter-dashboard?type=active"
//               // to="/recruiter-post-opportunity-selector"
//               // state={{ preselectedPostingType: 'active' }}
//               onClick={(e) =>
//                 handleNavClick("/recruiter-dashboard", e)
//               }
//               className={({ isActive }) =>{
//                 const isThisTypeActive = currentPostingType === 'active' ;
//                 return (isThisTypeActive )
//                   ? "bg-[#00194A] text-white rounded-full px-2 md:px-3 lg:px-4 py-1.5 font-medium shadow text-xs md:text-sm"
//                   : "text-[#00194A] px-2 md:px-3 lg:px-4 py-1.5 rounded-full font-medium hover:bg-gray-100 text-xs md:text-sm"
//               }}
//             >
//               Post Job
//             </NavLink>

//             <NavLink
//               // to="/recruiter-post-opportunity-selector"
//               // state={{ preselectedPostingType: 'future' }}
//               to="/recruiter-dashboard?type=future"
//               onClick={(e) =>
//                 handleNavClick("/recruiter-dashboard", e)
//               }
//               className={({ isActive }) =>{
//                 const isThisTypeActive = currentPostingType === 'future' ;
//                 return (isThisTypeActive )
//                   ? "bg-[#00194A] text-white rounded-full px-2 md:px-3 lg:px-4 py-1.5 font-medium shadow text-xs md:text-sm"
//                   : "text-[#00194A] px-2 md:px-3 lg:px-4 py-1.5 rounded-full font-medium hover:bg-gray-100 text-xs md:text-sm"
//               }}
//             >
//               Future Job
//             </NavLink>

//             <NavLink
//               to="/recruiter/employees"
//               onClick={(e) => handleNavClick("/recruiter/employees", e)}
//               className={() => {
//                 const isEmployeesActive =
//                   location.pathname === "/recruiter/employees";
//                 return isEmployeesActive
//                   ? "bg-[#00194A] text-white rounded-full px-2 md:px-3 lg:px-4 py-1.5 font-medium shadow text-xs md:text-sm"
//                   : "text-[#00194A] px-2 md:px-3 lg:px-4 py-1.5 rounded-full font-medium hover:bg-gray-100 text-xs md:text-sm";
//               }}
//             >
//               Employees
//             </NavLink>

//             <NavLink
//               // to="/recruiter-post-opportunity-selector"
//               // state={{ preselectedPostingType: 'college' }}
//               to="/recruiter-dashboard?type=college"
//               onClick={(e) =>
//                 handleNavClick("/recruiter-dashboard", e)
//               }
//               className={({ isActive }) =>{
//                 const isThisTypeActive = currentPostingType === 'college' ;
//                 return (isThisTypeActive )
//                   ? "bg-[#00194A] text-white rounded-full px-2 md:px-3 lg:px-4 py-1.5 font-medium shadow text-xs md:text-sm"
//                   : "text-[#00194A] px-2 md:px-3 lg:px-4 py-1.5 rounded-full font-medium hover:bg-gray-100 text-xs md:text-sm"
//               }}
//             >
//               Campus Hiring
//             </NavLink>

//             {/* pricing page */}
//             <NavLink
//               to="/pricing"
//               onClick={(e) => handleNavClick("/pricing", e)}
//               className={({ isActive }) =>
//                 isActive
//                   ? "bg-[#00194A] text-white rounded-full px-2 md:px-3 lg:px-4 py-1.5 font-medium shadow text-xs md:text-sm"
//                   : "text-[#00194A] px-2 md:px-3 lg:px-4 py-1.5 rounded-full font-medium hover:bg-gray-100 text-xs md:text-sm"
//               }
//             >
//               Plans & Pricing
//             </NavLink>
//           </>
//         )}

//         {/* University only */}
//         {userRole === "university" && (
//           <>
//             <NavLink
//               to="/university/credits/dashboard"
//               onClick={(e) => handleNavClick("/university/credits/dashboard", e)}
//               className={({ isActive }) =>
//                 isActive
//                   ? "bg-[#00194A] text-white rounded-full px-2 md:px-3 lg:px-4 py-1.5 font-medium shadow text-xs md:text-sm"
//                   : "text-[#00194A] px-2 md:px-3 lg:px-4 py-1.5 rounded-full font-medium hover:bg-gray-100 text-xs md:text-sm"
//               }
//             >
//               Dashboard
//             </NavLink>

//             <NavLink
//               to="/university/credits/pricing"
//               onClick={(e) => handleNavClick("/university/credits/pricing", e)}
//               className={({ isActive }) =>
//                 isActive
//                   ? "bg-[#00194A] text-white rounded-full px-2 md:px-3 lg:px-4 py-1.5 font-medium shadow text-xs md:text-sm"
//                   : "text-[#00194A] px-2 md:px-3 lg:px-4 py-1.5 rounded-full font-medium hover:bg-gray-100 text-xs md:text-sm"
//               }
//             >
//               Plans & Pricing
//             </NavLink>
//           </>
//         )}
//       </div>

//       {/* Search Bar and Right Icons */}
//       <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3">
//         {/* {isStudentFillPage && (
//   <button
//     onClick={() => {
//       // Clear everything (redux-persist included)
//       localStorage.clear();
//       sessionStorage.clear();

//       //Hard redirect (no guards, no redux)
//       window.location.replace("/login");
//     }}
//     className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-full shadow hover:bg-red-600"
//   >
//     Logout
//   </button>
// )} */}


//         {/* Desktop Search Bar */}
//         {/* <div className="hidden md:flex bg-white items-center rounded-full px-2 md:px-3 py-1.5 w-[180px] lg:w-[250px] xl:w-[300px] shadow-inner">
//           <input
//             type="text"
//             placeholder="Search"
//             className="bg-transparent outline-none flex-1 text-[#00194A] placeholder-[#00194A] text-xs md:text-sm"
//           />
//           <FaSearch className="text-[#00194A] text-sm md:text-base" />
//         </div> */}

//         {/* Mobile Search Icon */}
//         {/* <div
//           className="flex items-center justify-center bg-white rounded-full shadow cursor-pointer md:hidden w-7 h-7 md:w-8 md:h-8"
//           onClick={toggleSearch}
//         >
//           <FaSearch className="text-[#00194A] text-sm md:text-base" />
//         </div> */}

//         {/* Right Icons */}
//         <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3">
//           {/* Desktop Icons (now clickable) */}
//           <div className="hidden md:flex items-center gap-1.5 md:gap-2 lg:gap-3">
//             {/* Always shown */}
//             <div
//               onClick={() =>
//                 handleIconNav("/chat-home")
//               }
//               className="flex items-center justify-center transition bg-white rounded-full shadow cursor-pointer w-7 h-7 md:w-8 md:h-8 hover:bg-gray-100 active:bg-gray-200"
//             >
//               <FiMessageCircle className="text-[#00194A] text-sm md:text-base" />
//             </div>

//             <div
//               onClick={() => handleIconNav("/notifications")}
//               className="flex items-center justify-center transition bg-white rounded-full shadow cursor-pointer w-7 h-7 md:w-8 md:h-8 hover:bg-gray-100 active:bg-gray-200"
//             >
//               {/* <FaBell className="text-[#00194A] text-sm md:text-base" /> */}
//               <NotificationBell className="text-[#00194A] text-sm md:text-base w-7 h-7" />
//             </div>

//             {/* Profile Completion Indicator with User Icon */}
//             <div className="relative flex flex-col items-center">
//               {/* Percentage label above */}
//               {/* {!loadingCompletion &&
//                 profileCompletion !== null &&
//                 profileCompletion > 0 && (
//                   <span className="absolute z-50 top-6 text-[16px] font-medium text-gray-700 whitespace-nowrap">
//                     {profileCompletion}%
//                   </span>
//                 )} */}

//               {/* Clickable wrapper */}
//               <div className="relative">
//                 <div
//                   onClick={() => setIsProfileOpen((prev) => !prev)}
//                   className="flex items-center justify-center w-8 h-8 transition bg-white rounded-full shadow cursor-pointer md:w-10 md:h-10 hover:bg-gray-100"
//                 >

//                   <FaUser className="text-[#00194A] text-xs md:text-sm" />
//                 </div>

//                 {/* DROPDOWN */}
//                 {isProfileOpen && (
//                   <div className="absolute right-0 z-50 w-40 mt-2 bg-white border rounded-lg shadow-lg">

//                     <button
//                       onClick={() => {
//                         setIsProfileOpen(false);
//                         handleIconNav(
//                           userRole === "student"
//                             ? "/student-profile"
//                             : userRole === "company"
//                               ? "/recruiter-profile"
//                               : "/university-profile"
//                         );
//                       }}
//                       className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
//                     >
//                       Settings
//                     </button>

//                     <button
//                       onClick={() => {
//                         localStorage.clear();
//                         sessionStorage.clear();
//                         window.location.replace("/login");
//                       }}
//                       className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
//                     >
//                       Logout
//                     </button>
//                   </div>
//                 )}
//               </div>

//             </div>
//           </div>

//           {/* Mobile Menu Button */}
//           <div
//             className="flex items-center justify-center bg-white rounded-full shadow cursor-pointer md:hidden w-7 h-7 md:w-8 md:h-8"
//             onClick={toggleMobileMenu}
//           >
//             {isMobileMenuOpen ? (
//               <FaTimes className="text-[#00194A] text-sm md:text-base" />
//             ) : (
//               <FaBars className="text-[#00194A] text-sm md:text-base" />
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Mobile Search Bar */}
//       {/* {isSearchExpanded && (
//         <div className="absolute left-0 right-0 z-50 p-2 bg-white shadow-lg top-full md:p-3 md:hidden">
//           <div className="flex items-center rounded-full px-2 md:px-3 py-1.5 border border-gray-200">
//             <input
//               type="text"
//               placeholder="Search"
//               className="bg-transparent outline-none flex-1 text-[#00194A] placeholder-[#00194A] text-xs md:text-sm"
//               autoFocus
//             />
//             <FaSearch className="text-[#00194A] text-sm md:text-base" />
//           </div>
//         </div>
//       )} */}

//       {/* Mobile Navigation Menu */}
//       {isMobileMenuOpen && (
//         <div className="absolute left-0 right-0 z-50 bg-white shadow-lg top-full md:hidden">
//           <div className="flex flex-col p-2 space-y-2 md:p-3 md:space-y-3">
//             {/* Mobile Nav Links */}
//             <div className="flex flex-col space-y-1.5 md:space-y-2">
//               {/* Always shown */}
//               {/* <NavLink
//                 to="/feed"
//                 onClick={(e) => {
//                   handleNavClick("/feed", e);
//                   setIsMobileMenuOpen(false);
//                 }}
//                 className={({ isActive }) =>
//                   isActive
//                     ? "bg-[#00194A] text-white rounded-lg px-2 md:px-3 py-1.5 md:py-2 font-medium text-xs md:text-sm"
//                     : "text-[#00194A] px-2 md:px-3 py-1.5 md:py-2 rounded-lg font-medium hover:bg-gray-100 text-xs md:text-sm"
//                 }
//               >
//                 Feed
//               </NavLink> */}

//               {/* Shown for student, company, university */}
//               {(userRole === "student") && (
//                 <NavLink
//                   to="/all-jobs"
//                   onClick={(e) => {
//                     handleNavClick("/all-jobs", e);
//                     setIsMobileMenuOpen(false);
//                   }}
//                   className={({ isActive }) =>
//                     isActive
//                       ? "bg-[#00194A] text-white rounded-lg px-2 md:px-3 py-1.5 md:py-2 font-medium text-xs md:text-sm"
//                       : "text-[#00194A] px-2 md:px-3 py-1.5 md:py-2 rounded-lg font-medium hover:bg-gray-100 text-xs md:text-sm"
//                   }
//                 >
//                   Jobs
//                 </NavLink>
//               )}

//               {(userRole === "company") && (
//                 <NavLink
//                   to="/recruiter-dashboard"
//                   onClick={(e) => {
//                     handleNavClick("/recruiter-dashboard", e);
//                     setIsMobileMenuOpen(false);
//                   }}
//                   className={({ isActive }) =>{
//                     const isDashboardOverview = !currentPostingType && location.pathname === "/recruiter-dashboard";
    
//     return isDashboardOverview
//                       ? "bg-[#00194A] text-white rounded-lg px-2 md:px-3 py-1.5 md:py-2 font-medium text-xs md:text-sm"
//                       : "text-[#00194A] px-2 md:px-3 py-1.5 md:py-2 rounded-lg font-medium hover:bg-gray-100 text-xs md:text-sm"
//                   }}
//                 >
//                   Dashboard
//                 </NavLink>
//               )}

//               {(userRole === "university") && (
//                 <NavLink
//                   to="/university/jobs"
//                   onClick={(e) => {
//                     handleNavClick("/university/jobs", e);
//                     setIsMobileMenuOpen(false);
//                   }}
//                   className={({ isActive }) =>
//                     isActive
//                       ? "bg-[#00194A] text-white rounded-lg px-2 md:px-3 py-1.5 md:py-2 font-medium text-xs md:text-sm"
//                       : "text-[#00194A] px-2 md:px-3 py-1.5 md:py-2 rounded-lg font-medium hover:bg-gray-100 text-xs md:text-sm"
//                   }
//                 >
//                   Jobs
//                 </NavLink>
//               )}


//               {userRole === "student" && (
//                 <NavLink
//                   to="/ai-prediction"
//                   onClick={(e) => {
//                     handleNavClick("/ai-prediction", e);
//                     setIsMobileMenuOpen(false);
//                   }}
//                   className={({ isActive }) =>
//                     isActive
//                       ? "bg-[#00194A] text-white rounded-lg px-2 md:px-3 py-1.5 md:py-2 font-medium text-xs md:text-sm"
//                       : "text-[#00194A] px-2 md:px-3 py-1.5 md:py-2 rounded-lg font-medium hover:bg-gray-100 text-xs md:text-sm"
//                   }
//                 >
//                   AI Prediction
//                 </NavLink>
//               )}

//               {/* Company only */}
//               {userRole === "company" && (
//                 <>
//                   <NavLink
//                     // to="/recruiter-post-opportunity-selector"
//                     // state={{ preselectedPostingType: 'active' }}
//                      to="/recruiter-dashboard?type=active"
//                     onClick={(e) => {
//                       handleNavClick("/recruiter-dashboard", e);
//                       setIsMobileMenuOpen(false);
//                     }}
//                     className={({ isActive }) =>{
//                       const isThisTypeActive = currentPostingType === 'active' ;
//                       return (isThisTypeActive )
//                         ? "bg-[#00194A] text-white rounded-lg px-2 md:px-3 py-1.5 md:py-2 font-medium text-xs md:text-sm"
//                         : "text-[#00194A] px-2 md:px-3 py-1.5 md:py-2 rounded-lg font-medium hover:bg-gray-100 text-xs md:text-sm"
//                     }}
//                   >
//                     Post Job
//                   </NavLink>


//                   <NavLink
//                     // to="/recruiter-post-opportunity-selector"
//                     // state={{ preselectedPostingType: 'future' }}
//                      to="/recruiter-dashboard?type=future"
//                     onClick={(e) => {
//                       handleNavClick("/recruiter-dashboard", e);
//                       setIsMobileMenuOpen(false);
//                     }}
//                     className={({ isActive }) =>{
//                       const isThisTypeActive = currentPostingType === 'future' ;
//                        return (isThisTypeActive )
//                         ? "bg-[#00194A] text-white rounded-lg px-2 md:px-3 py-1.5 md:py-2 font-medium text-xs md:text-sm"
//                         : "text-[#00194A] px-2 md:px-3 py-1.5 md:py-2 rounded-lg font-medium hover:bg-gray-100 text-xs md:text-sm"
//                     }}
//                   >
//                     Future Job
//                   </NavLink>

//                   <NavLink
//                     to="/recruiter/employees"
//                     onClick={(e) => {
//                       handleNavClick("/recruiter/employees", e);
//                       setIsMobileMenuOpen(false);
//                     }}
//                     className={() => {
//                       const isEmployeesActive =
//                         location.pathname === "/recruiter/employees";
//                       return isEmployeesActive
//                         ? "bg-[#00194A] text-white rounded-lg px-2 md:px-3 py-1.5 md:py-2 font-medium text-xs md:text-sm"
//                         : "text-[#00194A] px-2 md:px-3 py-1.5 md:py-2 rounded-lg font-medium hover:bg-gray-100 text-xs md:text-sm";
//                     }}
//                   >
//                     Employees
//                   </NavLink>

//                   <NavLink
//                     // to="/recruiter-post-opportunity-selector"
//                     // state={{ preselectedPostingType: 'college' }}
//                      to="/recruiter-dashboard?type=college"
//                     onClick={(e) => {
//                       handleNavClick("/recruiter-dashboard", e);
//                       setIsMobileMenuOpen(false);
//                     }}
//                     className={({ isActive }) =>{
//                       const isThisTypeActive = currentPostingType === 'college' ;
//                       return (isThisTypeActive )
//                         ? "bg-[#00194A] text-white rounded-lg px-2 md:px-3 py-1.5 md:py-2 font-medium text-xs md:text-sm"
//                         : "text-[#00194A] px-2 md:px-3 py-1.5 md:py-2 rounded-lg font-medium hover:bg-gray-100 text-xs md:text-sm"
//                     }}
//                   >
//                     Campus Hiring
//                   </NavLink>

//                   <NavLink
//                     to="/pricing"
//                     onClick={(e) => handleNavClick("/pricing", e)}
//                     className={({ isActive }) =>
//                       isActive
//                         ? "bg-[#00194A] text-white rounded-full px-2 md:px-3 lg:px-4 py-1.5 font-medium shadow text-xs md:text-sm"
//                         : "text-[#00194A] px-2 md:px-3 lg:px-4 py-1.5 rounded-full font-medium hover:bg-gray-100 text-xs md:text-sm"
//                     }
//                   >
//                     Plans & Pricing
//                   </NavLink>
//                 </>
//               )}

//               {/* University only */}
//               {userRole === "university" && (
//                 <>
//                   <NavLink
//                     to="/university/credits/dashboard"
//                     onClick={(e) => {
//                       handleNavClick("/university/credits/dashboard", e);
//                       setIsMobileMenuOpen(false);
//                     }}
//                     className={({ isActive }) =>
//                       isActive
//                         ? "bg-[#00194A] text-white rounded-lg px-2 md:px-3 py-1.5 md:py-2 font-medium text-xs md:text-sm"
//                         : "text-[#00194A] px-2 md:px-3 py-1.5 md:py-2 rounded-lg font-medium hover:bg-gray-100 text-xs md:text-sm"
//                     }
//                   >
//                     Dashboard
//                   </NavLink>

//                   <NavLink
//                     to="/university/credits/pricing"
//                     onClick={(e) => {
//                       handleNavClick("/university/credits/pricing", e);
//                       setIsMobileMenuOpen(false);
//                     }}
//                     className={({ isActive }) =>
//                       isActive
//                         ? "bg-[#00194A] text-white rounded-lg px-2 md:px-3 py-1.5 md:py-2 font-medium text-xs md:text-sm"
//                         : "text-[#00194A] px-2 md:px-3 py-1.5 md:py-2 rounded-lg font-medium hover:bg-gray-100 text-xs md:text-sm"
//                     }
//                   >
//                     Plans & Pricing
//                   </NavLink>

//                 </>
//               )}
//             </div>

//             {/* Mobile Action Icons */}
//             <div className="flex items-center justify-around pt-2 border-t border-gray-200 md:pt-3">
//               {/* Always shown */}
//               <div
//                 onClick={() => {
//                   handleIconNav("/chat-home");
//                   setIsMobileMenuOpen(false);
//                 }}
//                 className="flex items-center justify-center w-8 h-8 transition bg-gray-100 rounded-full cursor-pointer md:w-10 md:h-10 hover:bg-gray-200 active:bg-gray-300"
//               >
//                 <FiMessageCircle className="text-[#00194A] text-sm md:text-base" />
//               </div>

//               <div
//                 onClick={() => {
//                   handleIconNav("/notifications");
//                   setIsMobileMenuOpen(false);
//                 }}
//                 className="flex items-center justify-center w-8 h-8 transition bg-gray-100 rounded-full cursor-pointer md:w-10 md:h-10 hover:bg-gray-200 active:bg-gray-300"
//               >
//                 {/* <FaBell className="text-[#00194A] text-sm md:text-base" /> */}
//                 <NotificationBell className="text-[#00194A] text-sm md:text-base" />
//               </div>

//               {/* Profile Completion Indicator with User Icon */}
//               <div className="relative flex flex-col items-center">
//                 {/* Percentage label above */}
//                 {/* {!loadingCompletion &&
//                   profileCompletion !== null &&
//                   profileCompletion > 0 && (
//                     <span className="absolute -top-6 text-[10px] font-medium text-gray-700 whitespace-nowrap">
//                       {profileCompletion}% Complete
//                     </span>
//                   )} */}

//                 {/* Clickable wrapper */}
//                 <div
//                   onClick={() => {
//                     handleIconNav(
//                       userRole === "student"
//                         ? "/student-profile"
//                         : userRole === "company"
//                           ? "/recruiter-profile"
//                           : userRole === "university"
//                             ? "/university-profile"
//                             : "/feed-my-profile"
//                     );
//                     // Close mobile menu if open
//                     setIsMobileMenuOpen(false);
//                   }}
//                   className="flex items-center justify-center w-8 h-8 transition bg-white rounded-full shadow cursor-pointer md:w-10 md:h-10 hover:bg-gray-100 active:bg-gray-200"
//                 >
//                   {loadingCompletion ? (
//                     // Loading state: pulsing icon
//                     <FaUser className="text-[#00194A] text-xs md:text-sm animate-pulse" />
//                   ) : profileCompletion === null || profileCompletion <= 0 ? (
//                     // No data or 0%: plain icon
//                     <FaUser className="text-[#00194A] text-xs md:text-sm" />
//                   ) : (
//                     // Show circular progress + icon
//                     <div className="relative w-8 h-8 md:w-10 md:h-10">
//                       <svg className="w-full h-full" viewBox="0 0 36 36">
//                         {/* Background circle */}
//                         <circle
//                           cx="18"
//                           cy="18"
//                           r="15.9155"
//                           fill="none"
//                           stroke="#e5e7eb"
//                           pathLength="100"
//                           strokeWidth="3"
//                         />

//                         {/* Progress arc */}
//                         <circle
//                           cx="18"
//                           cy="18"
//                           r="15.9155"
//                           fill="none"
//                           stroke={
//                             profileCompletion >= 100 ? "#4ade80" : "#3b82f6"
//                           }
//                           strokeWidth="3"
//                           strokeDasharray={`${profileCompletion} 100`}
//                           strokeLinecap="round"
//                           transform="rotate(-90 18 18)"
//                         />

//                         {/* Percentage text at top-right */}
//                         {profileCompletion !== null &&
//                           profileCompletion > 0 && (
//                             <text
//                               x="28"
//                               y="8"
//                               fontSize="6"
//                               fontWeight="bold"
//                               fill="#3b82f6"
//                               textAnchor="end"
//                               dominantBaseline="middle"
//                               style={{ fontFamily: "Arial, sans-serif" }}
//                             >
//                               {profileCompletion}%
//                             </text>
//                           )}
//                       </svg>

//                       {/* User icon on top */}
//                       <div className="absolute inset-0 flex items-center justify-center">
//                         <FaUser className="text-[#00194A] text-[10px] md:text-xs" />
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }








// import { NavLink, useNavigate, useLocation } from "react-router-dom";
// import { FaSearch, FaBell, FaUser, FaBars, FaTimes } from "react-icons/fa";
// import { FiMessageCircle } from "react-icons/fi";
// import { useState, useEffect } from "react";
// import websiteLogo from "../../assets/WebsiteLogo.svg";
// import { useSelector } from "react-redux";
// import { showProfileIncompleteAlert } from "../../utils/alertService";
// import { userDetailsApi } from "../../api/userDetailsApi";
// import NotificationBell from "../notifications/NotificationBell"

// export default function Header() {
//   const TAB_ACTIVE =
//   "bg-[#9bc87c] text-white rounded-full px-3 lg:px-5 py-1.5 font-bold shadow text-xs md:text-sm transition-colors";
// const TAB_INACTIVE =
//   "text-[#1e1e2d] px-3 lg:px-5 py-1.5 rounded-full font-bold hover:bg-[#eaf4e3] hover:text-[#1e1e2d] text-xs md:text-sm transition-colors";

// const MOBILE_TAB_ACTIVE =
//   "bg-[#9bc87c] text-white rounded-xl px-4 py-2.5 font-bold text-sm";
// const MOBILE_TAB_INACTIVE =
//   "text-[#1e1e2d] px-4 py-2.5 rounded-xl font-bold hover:bg-[#eaf4e3] text-sm";
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [isSearchExpanded, setIsSearchExpanded] = useState(false);
//   const navigate = useNavigate();

//   const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
//   const toggleSearch = () => setIsSearchExpanded(!isSearchExpanded);
//   const { token, user } = useSelector((state) => state.auth);
//   const userRole = user?.user_role?.toLowerCase();

//   const [profileCompletion, setProfileCompletion] = useState(null);
//   const [loadingCompletion, setLoadingCompletion] = useState(true);

//   const location = useLocation();
//   const isStudentFillPage =
//     location.pathname === "/student-fill-account-details";

//   // const isPostJobActive =
//   //   location.pathname === "/recruiter-post-opportunity-selector" ||
//   //   location.pathname === "/recruiter-post-job-intern-details";

//   const isAnyPostingPage = [
//   "/recruiter-post-opportunity-selector",
//   "/recruiter-post-job-intern-details"
// ].includes(location.pathname);

//   const [isProfileOpen, setIsProfileOpen] = useState(false);


//   //  Helper to detect current posting type from URL/state
// const getCurrentPostingType = () => {
//   const pathname = location.pathname;
  
//   // Case 1: On dashboard with query param ?type=active|future|college
//   if (pathname === "/recruiter-dashboard") {
//     const params = new URLSearchParams(location.search);
//     const type = params.get("type");
//     if (type && ["active", "future", "college"].includes(type)) {
//       return type;
//     }
//   }
  
//   // Case 2: On opportunity selector with preselected type in state
//   if (pathname === "/recruiter-post-opportunity-selector") {
//     const preselected = location.state?.preselectedPostingType;
//     if (preselected && ["active", "future", "college"].includes(preselected)) {
//       return preselected;
//     }
//   }
  
//   // Case 3: On job details page - try to read from state (passed through)
//   if (pathname === "/recruiter-post-job-intern-details") {
//     const jobStatus = location.state?.jobStatus || location.state?.postingType;
//     if (jobStatus && ["active", "future", "college"].includes(jobStatus)) {
//       return jobStatus;
//     }
//   }
  
//   return null; // No specific posting type detected
// };

// const currentPostingType = getCurrentPostingType(); //  Compute once per render


//   useEffect(() => {
//     const fetchProfileCompletion = async () => {
//       if (!token) {
//         setLoadingCompletion(false);
//         return;
//       }

//       setLoadingCompletion(true);
//       try {

//         const response = await userDetailsApi.getProfileCompletion(
//           token,
//           false
//         );

//         // Extract correctly:
//         const pct = response?.data?.profile_completion_percentage;

//         if (typeof pct === "number") {
//           setProfileCompletion(Math.min(100, Math.max(0, pct)));
//         } else {
//           setProfileCompletion(0);
//         }
//       } catch (err) {
//         console.warn("Profile completion fetch failed:", err);
//         setProfileCompletion(0);
//       } finally {
//         setLoadingCompletion(false);
//       }
//     };

//     fetchProfileCompletion();
//   }, [token]);

//   // Guarded navigation handler for NavLink (receives event)
//   const handleNavClick = (path, event) => {
//     if (user?.profile_status === 1) {
//       const protectedPaths = [
//         "/feed",
//         "/all-jobs",
//         "/university/jobs",
//         "/ai-prediction",
//         "/student-profile",
//         "/recruiter-dashboard",
//         "/recruiter-profile",
//         "/recruiter-post-job-intern-details",
//         "/recruiter-post-opportunity-selector",
//         "/student-analytics",
//         "/university-profile",
//         "/feed-notifications",
//         "/chat",
//         "/chat-home",
//         "/feed-ticket",
//         "/recruiter-ticket",
//         "/university-ticket",
//         "/university/credits/dashboard",
//         "/university/credits/pricing",
//         "/feed-view",
//         "/pricing",
//         "/notifications",
//       ];

//       if (protectedPaths.some((p) => path.startsWith(p))) {
//         event.preventDefault(); // Stop NavLink from navigating
//         showProfileIncompleteAlert(user.user_role).then((result) => {
//           if (result.isConfirmed) {
//             const setupPath =
//               userRole === "student"
//                 ? "/student-fill-account-details"
//                 : userRole === "company"
//                   ? "/recruiter-fill-account-details"
//                   : userRole === "university"
//                     ? "/university-fill-account-details"
//                     : "/student-fill-account-details";
//             navigate(setupPath);
//           }
//         });
//       }
//     }
//     // If profile_status !== 1, do nothing — let NavLink handle navigation normally
//   };

//   // For icon clicks (no event needed)
//   const handleIconNav = (path) => {
//     if (user?.profile_status === 1) {
//       const protectedPaths = [
//         "/feed",
//         "/all-jobs",
//         "/university/jobs",
//         "/ai-prediction",
//         "/student-profile",
//         "/recruiter-dashboard",
//         "/recruiter-profile",
//         "/recruiter-post-job-intern-details",
//         "/recruiter-post-opportunity-selector",
//         "/student-analytics",
//         "/university-profile",
//         "/feed-notifications",
//         "/chat",
//         "chat-home",
//         "/feed-ticket",
//         "/recruiter-ticket",
//         "/university-ticket",
//         "/university/credits/dashboard",
//         "/university/credits/pricing",
//         "/feed-view",
//         "/pricing",
//         "/notifications",
//       ];

//       if (protectedPaths.some((p) => path.startsWith(p))) {
//         showProfileIncompleteAlert(user.user_role).then((result) => {
//           if (result.isConfirmed) {
//             const setupPath =
//               userRole === "student"
//                 ? "/student-fill-account-details"
//                 : userRole === "company"
//                   ? "/recruiter-fill-account-details"
//                   : userRole === "university"
//                     ? "/university-fill-account-details"
//                     : "/student-fill-account-details";
//             navigate(setupPath);
//           }
//         });
//         return;
//       }
//     }
//     navigate(path);
//   };



//   return (
//     <div
//       className="sticky top-0 z-50 flex items-center justify-between w-full px-4 py-2 bg-white border-b border-gray-100 shadow-sm h-16"
//     >
//       {/* Logo */}
//       <div className="flex items-center">
//         <p className="text-base font-bold sm:text-lg md:text-xl cursor-pointer" onClick={() => navigate('/')}>
//           <img src={websiteLogo} alt="Logo" className="w-8 h-8" />
//         </p>
//       </div>

//       {/* Desktop Nav Tabs - centered */}
//       {/* <div className="absolute z-10 hidden gap-1.5 px-1.5 py-1.5 -translate-x-1/2 -translate-y-1/2 bg-gray-50 border border-gray-100 rounded-full shadow-sm lg:flex left-1/2 top-1/2"> */}
//       <div className="absolute z-10 hidden gap-1.5 px-1.5 py-1.5 -translate-x-1/2 -translate-y-1/2 bg-[#f3f9ee] border border-[#d9ebcd] rounded-full shadow-sm lg:flex left-1/2 top-1/2">
//         {/* Always shown */}
//         {/* <NavLink
//           to="/feed"
//           onClick={(e) => handleNavClick("/feed", e)}
//           className={({ isActive }) =>
//             isActive
//               ? "bg-[#1e1e2d] text-white rounded-full px-2 md:px-3 lg:px-4 py-1.5 font-bold shadow text-xs md:text-sm transition-colors"
//               : "text-gray-600 px-2 md:px-3 lg:px-4 py-1.5 rounded-full font-bold hover:bg-white hover:text-[#1e1e2d] text-xs md:text-sm transition-colors"
//           }
//         >
//           Feed
//         </NavLink> */}

//         {/* Shown for student */}
//         {(userRole === "student") && (
//           // <NavLink
//           //   to="/all-jobs?opportunityType=Job"
//           //   onClick={(e) => handleNavClick("/all-jobs", e)}
//           //   className={({ isActive }) =>
//           //     isActive
//           //       ? "bg-[#1e1e2d] text-white rounded-full px-3 lg:px-5 py-1.5 font-bold shadow text-xs md:text-sm transition-colors"
//           //       : "text-gray-600 px-3 lg:px-5 py-1.5 rounded-full font-bold hover:bg-white hover:text-[#1e1e2d] text-xs md:text-sm transition-colors"
//           //   }
//           // >
//           //   Jobs
//           // </NavLink>
//           <NavLink
//   to="/all-jobs?opportunityType=Job"
//   onClick={(e) => handleNavClick("/all-jobs", e)}
//   className={({ isActive }) => (isActive ? TAB_ACTIVE : TAB_INACTIVE)}
// >
//   Jobs
// </NavLink>
//         )}

//         {/* Shown for student */}
//         {(userRole === "student") && (
//           <NavLink
//             to="/all-jobs?opportunityType=Internship"
//             onClick={(e) => handleNavClick("/all-jobs", e)}
//             // className={({ isActive }) =>
//             //   isActive
//             //     ? "bg-[#1e1e2d] text-white rounded-full px-3 lg:px-5 py-1.5 font-bold shadow text-xs md:text-sm transition-colors"
//             //     : "text-gray-600 px-3 lg:px-5 py-1.5 rounded-full font-bold hover:bg-white hover:text-[#1e1e2d] text-xs md:text-sm transition-colors"
//             // }
//             className={({ isActive }) => (isActive ? TAB_ACTIVE : TAB_INACTIVE)}
//           >
//             Internships
//           </NavLink>
//         )}

//         {/* Shown for student */}
//         {(userRole === "student") && (
//           <NavLink
//             to="/all-jobs?opportunityType=project"
//             onClick={(e) => handleNavClick("/all-jobs", e)}
//             // className={({ isActive }) =>
//             //   isActive
//             //     ? "bg-[#1e1e2d] text-white rounded-full px-3 lg:px-5 py-1.5 font-bold shadow text-xs md:text-sm transition-colors"
//             //     : "text-gray-600 px-3 lg:px-5 py-1.5 rounded-full font-bold hover:bg-white hover:text-[#1e1e2d] text-xs md:text-sm transition-colors"
//             // }
//             className={({ isActive }) => (isActive ? TAB_ACTIVE : TAB_INACTIVE)}
//           >
//             Projects
//           </NavLink>
//         )}

//         {/* Shown for university */}
//         {(userRole === "university") && (
//           <NavLink
//             to="/university/jobs"
//             onClick={(e) => handleNavClick("/university/jobs", e)}
//             className={({ isActive }) =>
//               isActive
//                 ? "bg-[#1e1e2d] text-white rounded-full px-3 lg:px-5 py-1.5 font-bold shadow text-xs md:text-sm transition-colors"
//                 : "text-gray-600 px-3 lg:px-5 py-1.5 rounded-full font-bold hover:bg-white hover:text-[#1e1e2d] text-xs md:text-sm transition-colors"
//             }
//           >
//             Jobs
//           </NavLink>
//         )}

//         {/* Shown for company */}
//         {userRole === "company" && (
//           <NavLink
//             to="/recruiter-dashboard"
//             onClick={(e) => handleNavClick("/recruiter-dashboard", e)}
//             className={({ isActive }) =>{
//               const isDashboardOverview = !currentPostingType && location.pathname === "/recruiter-dashboard";
    
//           return isDashboardOverview
//                 ? "bg-[#1e1e2d] text-white rounded-full px-3 lg:px-5 py-1.5 font-bold shadow text-xs md:text-sm transition-colors"
//                 : "text-gray-600 px-3 lg:px-5 py-1.5 rounded-full font-bold hover:bg-white hover:text-[#1e1e2d] text-xs md:text-sm transition-colors"
//             }}
//           >
//             Dashboard
//           </NavLink>
//         )}

//         {/* Shown for student */}
//         {userRole === "student" && (
//           <NavLink
//             to="/ai-prediction"
//             onClick={(e) => handleNavClick("/ai-prediction", e)}
//             // className={({ isActive }) =>
//             //   isActive
//             //     ? "bg-[#1e1e2d] text-white rounded-full px-3 lg:px-5 py-1.5 font-bold shadow text-xs md:text-sm transition-colors"
//             //     : "text-gray-600 px-3 lg:px-5 py-1.5 rounded-full font-bold hover:bg-white hover:text-[#1e1e2d] text-xs md:text-sm transition-colors"
//             // }
//             className={({ isActive }) => (isActive ? TAB_ACTIVE : TAB_INACTIVE)}
//           >
//             AI Prediction
//           </NavLink>
//         )}

//         {/* Company only */}

//         {userRole === "company" && (
//           <>
//             <NavLink
//               to="/recruiter-dashboard?type=active"
//               // to="/recruiter-post-opportunity-selector"
//               // state={{ preselectedPostingType: 'active' }}
//               onClick={(e) =>
//                 handleNavClick("/recruiter-dashboard", e)
//               }
//               className={({ isActive }) =>{
//                 const isThisTypeActive = currentPostingType === 'active' ;
//                 return (isThisTypeActive )
//                   ? "bg-[#1e1e2d] text-white rounded-full px-3 lg:px-5 py-1.5 font-bold shadow text-xs md:text-sm transition-colors"
//                   : "text-gray-600 px-3 lg:px-5 py-1.5 rounded-full font-bold hover:bg-white hover:text-[#1e1e2d] text-xs md:text-sm transition-colors"
//               }}
//             >
//               Post Job
//             </NavLink>

//             <NavLink
//               // to="/recruiter-post-opportunity-selector"
//               // state={{ preselectedPostingType: 'future' }}
//               to="/recruiter-dashboard?type=future"
//               onClick={(e) =>
//                 handleNavClick("/recruiter-dashboard", e)
//               }
//               className={({ isActive }) =>{
//                 const isThisTypeActive = currentPostingType === 'future' ;
//                 return (isThisTypeActive )
//                   ? "bg-[#1e1e2d] text-white rounded-full px-3 lg:px-5 py-1.5 font-bold shadow text-xs md:text-sm transition-colors"
//                   : "text-gray-600 px-3 lg:px-5 py-1.5 rounded-full font-bold hover:bg-white hover:text-[#1e1e2d] text-xs md:text-sm transition-colors"
//               }}
//             >
//               Future Job
//             </NavLink>

//             <NavLink
//               to="/recruiter/employees"
//               onClick={(e) => handleNavClick("/recruiter/employees", e)}
//               className={() => {
//                 const isEmployeesActive =
//                   location.pathname === "/recruiter/employees";
//                 return isEmployeesActive
//                   ? "bg-[#1e1e2d] text-white rounded-full px-3 lg:px-5 py-1.5 font-bold shadow text-xs md:text-sm transition-colors"
//                   : "text-gray-600 px-3 lg:px-5 py-1.5 rounded-full font-bold hover:bg-white hover:text-[#1e1e2d] text-xs md:text-sm transition-colors";
//               }}
//             >
//               Employees
//             </NavLink>

//             <NavLink
//               // to="/recruiter-post-opportunity-selector"
//               // state={{ preselectedPostingType: 'college' }}
//               to="/recruiter-dashboard?type=college"
//               onClick={(e) =>
//                 handleNavClick("/recruiter-dashboard", e)
//               }
//               className={({ isActive }) =>{
//                 const isThisTypeActive = currentPostingType === 'college' ;
//                 return (isThisTypeActive )
//                   ? "bg-[#1e1e2d] text-white rounded-full px-3 lg:px-5 py-1.5 font-bold shadow text-xs md:text-sm transition-colors"
//                   : "text-gray-600 px-3 lg:px-5 py-1.5 rounded-full font-bold hover:bg-white hover:text-[#1e1e2d] text-xs md:text-sm transition-colors"
//               }}
//             >
//               Campus Hiring
//             </NavLink>

//             {/* pricing page */}
//             <NavLink
//               to="/pricing"
//               onClick={(e) => handleNavClick("/pricing", e)}
//               className={({ isActive }) =>
//                 isActive
//                   ? "bg-[#1e1e2d] text-white rounded-full px-3 lg:px-5 py-1.5 font-bold shadow text-xs md:text-sm transition-colors"
//                   : "text-gray-600 px-3 lg:px-5 py-1.5 rounded-full font-bold hover:bg-white hover:text-[#1e1e2d] text-xs md:text-sm transition-colors"
//               }
//             >
//               Plans & Pricing
//             </NavLink>
//           </>
//         )}

//         {/* University only */}
//         {userRole === "university" && (
//           <>
//             <NavLink
//               to="/university/credits/dashboard"
//               onClick={(e) => handleNavClick("/university/credits/dashboard", e)}
//               className={({ isActive }) =>
//                 isActive
//                   ? "bg-[#1e1e2d] text-white rounded-full px-3 lg:px-5 py-1.5 font-bold shadow text-xs md:text-sm transition-colors"
//                   : "text-gray-600 px-3 lg:px-5 py-1.5 rounded-full font-bold hover:bg-white hover:text-[#1e1e2d] text-xs md:text-sm transition-colors"
//               }
//             >
//               Dashboard
//             </NavLink>

//             <NavLink
//               to="/university/credits/pricing"
//               onClick={(e) => handleNavClick("/university/credits/pricing", e)}
//               className={({ isActive }) =>
//                 isActive
//                   ? "bg-[#1e1e2d] text-white rounded-full px-3 lg:px-5 py-1.5 font-bold shadow text-xs md:text-sm transition-colors"
//                   : "text-gray-600 px-3 lg:px-5 py-1.5 rounded-full font-bold hover:bg-white hover:text-[#1e1e2d] text-xs md:text-sm transition-colors"
//               }
//             >
//               Plans & Pricing
//             </NavLink>
//           </>
//         )}
//       </div>

//       {/* Search Bar and Right Icons */}
//       <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
//         {/* {isStudentFillPage && (
//   <button
//     onClick={() => {
//       // Clear everything (redux-persist included)
//       localStorage.clear();
//       sessionStorage.clear();

//       //Hard redirect (no guards, no redux)
//       window.location.replace("/login");
//     }}
//     className="px-3 py-1.5 text-xs font-medium text-white bg-red-500 rounded-full shadow hover:bg-red-600"
//   >
//     Logout
//   </button>
// )} */}


//         {/* Desktop Search Bar */}
//         {/* <div className="hidden md:flex bg-white items-center rounded-full px-2 md:px-3 py-1.5 w-[180px] lg:w-[250px] xl:w-[300px] shadow-inner">
//           <input
//             type="text"
//             placeholder="Search"
//             className="bg-transparent outline-none flex-1 text-[#1e1e2d] placeholder-[#1e1e2d] text-xs md:text-sm"
//           />
//           <FaSearch className="text-[#1e1e2d] text-sm md:text-base" />
//         </div> */}

//         {/* Mobile Search Icon */}
//         {/* <div
//           className="flex items-center justify-center bg-white rounded-full shadow cursor-pointer md:hidden w-7 h-7 md:w-8 md:h-8"
//           onClick={toggleSearch}
//         >
//           <FaSearch className="text-[#1e1e2d] text-sm md:text-base" />
//         </div> */}

//         {/* Right Icons */}
//         <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
//           {/* Desktop Icons (now clickable) */}
//           <div className="hidden md:flex items-center gap-2 md:gap-3 lg:gap-4">
//             {/* Always shown */}
//             <div
//               onClick={() =>
//                 handleIconNav("/chat-home")
//               }
//               className="flex items-center justify-center transition bg-white border border-gray-200 rounded-full shadow-sm cursor-pointer w-9 h-9 md:w-10 md:h-10 hover:bg-gray-50 active:bg-gray-100"
//             >
//               <FiMessageCircle className="text-[#1e1e2d] text-base md:text-lg" />
//             </div>

//             <div
//               onClick={() => handleIconNav("/notifications")}
//               className="flex items-center justify-center transition bg-white border border-gray-200 rounded-full shadow-sm cursor-pointer w-9 h-9 md:w-10 md:h-10 hover:bg-gray-50 active:bg-gray-100"
//             >
//               {/* <FaBell className="text-[#1e1e2d] text-sm md:text-base" /> */}
//               <NotificationBell className="text-[#1e1e2d] text-base md:text-lg w-5 h-5" />
//             </div>

//             {/* Profile Completion Indicator with User Icon */}
//             <div className="relative flex flex-col items-center">
//               {/* Percentage label above */}
//               {/* {!loadingCompletion &&
//                 profileCompletion !== null &&
//                 profileCompletion > 0 && (
//                   <span className="absolute z-50 top-6 text-[16px] font-medium text-gray-700 whitespace-nowrap">
//                     {profileCompletion}%
//                   </span>
//                 )} */}

//               {/* Clickable wrapper */}
//               <div className="relative">
//                 <div
//                   onClick={() => setIsProfileOpen((prev) => !prev)}
//                   className="flex items-center justify-center w-9 h-9 transition bg-white border border-gray-200 rounded-full shadow-sm cursor-pointer md:w-10 md:h-10 hover:bg-gray-50"
//                 >

//                   <FaUser className="text-[#1e1e2d] text-sm md:text-base" />
//                 </div>

//                 {/* DROPDOWN */}
//                 {isProfileOpen && (
//                   <div className="absolute right-0 z-50 w-48 mt-3 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">

//                     <button
//                       onClick={() => {
//                         setIsProfileOpen(false);
//                         handleIconNav(
//                           userRole === "student"
//                             ? "/student-profile"
//                             : userRole === "company"
//                               ? "/recruiter-profile"
//                               : "/university-profile"
//                         );
//                       }}
//                       className="w-full px-5 py-3 text-sm font-bold text-left text-[#1e1e2d] hover:bg-gray-50 transition-colors"
//                     >
//                       Settings
//                     </button>

//                     <button
//                       onClick={() => {
//                         localStorage.clear();
//                         sessionStorage.clear();
//                         window.location.replace("/login");
//                       }}
//                       className="w-full px-5 py-3 text-sm font-bold text-left text-red-600 hover:bg-red-50 border-t border-gray-50 transition-colors"
//                     >
//                       Logout
//                     </button>
//                   </div>
//                 )}
//               </div>

//             </div>
//           </div>

//           {/* Mobile Menu Button */}
//           <div
//             className="flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm cursor-pointer md:hidden w-9 h-9"
//             onClick={toggleMobileMenu}
//           >
//             {isMobileMenuOpen ? (
//               <FaTimes className="text-[#1e1e2d] text-base" />
//             ) : (
//               <FaBars className="text-[#1e1e2d] text-base" />
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Mobile Search Bar */}
//       {/* {isSearchExpanded && (
//         <div className="absolute left-0 right-0 z-50 p-2 bg-white shadow-lg top-full md:p-3 md:hidden">
//           <div className="flex items-center rounded-full px-2 md:px-3 py-1.5 border border-gray-200">
//             <input
//               type="text"
//               placeholder="Search"
//               className="bg-transparent outline-none flex-1 text-[#1e1e2d] placeholder-[#1e1e2d] text-xs md:text-sm"
//               autoFocus
//             />
//             <FaSearch className="text-[#1e1e2d] text-sm md:text-base" />
//           </div>
//         </div>
//       )} */}

//       {/* Mobile Navigation Menu */}
//       {isMobileMenuOpen && (
//         <div className="absolute left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-lg top-full md:hidden">
//           <div className="flex flex-col p-3 space-y-3">
//             {/* Mobile Nav Links */}
//             <div className="flex flex-col space-y-2">
//               {/* Always shown */}
//               {/* <NavLink
//                 to="/feed"
//                 onClick={(e) => {
//                   handleNavClick("/feed", e);
//                   setIsMobileMenuOpen(false);
//                 }}
//                 className={({ isActive }) =>
//                   isActive
//                     ? "bg-[#1e1e2d] text-white rounded-xl px-4 py-2.5 font-bold text-sm"
//                     : "text-gray-600 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 text-sm"
//                 }
//               >
//                 Feed
//               </NavLink> */}

//               {/* Shown for student, company, university */}
//               {(userRole === "student") && (
//                 <NavLink
//                   to="/all-jobs"
//                   onClick={(e) => {
//                     handleNavClick("/all-jobs", e);
//                     setIsMobileMenuOpen(false);
//                   }}
//                   className={({ isActive }) =>
//                     isActive
//                       ? "bg-[#1e1e2d] text-white rounded-xl px-4 py-2.5 font-bold text-sm"
//                       : "text-gray-600 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 text-sm"
//                   }
//                 >
//                   Jobs
//                 </NavLink>
//               )}

//               {(userRole === "company") && (
//                 <NavLink
//                   to="/recruiter-dashboard"
//                   onClick={(e) => {
//                     handleNavClick("/recruiter-dashboard", e);
//                     setIsMobileMenuOpen(false);
//                   }}
//                   className={({ isActive }) =>{
//                     const isDashboardOverview = !currentPostingType && location.pathname === "/recruiter-dashboard";
    
//     return isDashboardOverview
//                       ? "bg-[#1e1e2d] text-white rounded-xl px-4 py-2.5 font-bold text-sm"
//                       : "text-gray-600 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 text-sm"
//                   }}
//                 >
//                   Dashboard
//                 </NavLink>
//               )}

//               {(userRole === "university") && (
//                 <NavLink
//                   to="/university/jobs"
//                   onClick={(e) => {
//                     handleNavClick("/university/jobs", e);
//                     setIsMobileMenuOpen(false);
//                   }}
//                   className={({ isActive }) =>
//                     isActive
//                       ? "bg-[#1e1e2d] text-white rounded-xl px-4 py-2.5 font-bold text-sm"
//                       : "text-gray-600 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 text-sm"
//                   }
//                 >
//                   Jobs
//                 </NavLink>
//               )}


//               {userRole === "student" && (
//                 <NavLink
//                   to="/ai-prediction"
//                   onClick={(e) => {
//                     handleNavClick("/ai-prediction", e);
//                     setIsMobileMenuOpen(false);
//                   }}
//                   className={({ isActive }) =>
//                     isActive
//                       ? "bg-[#1e1e2d] text-white rounded-xl px-4 py-2.5 font-bold text-sm"
//                       : "text-gray-600 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 text-sm"
//                   }
//                 >
//                   AI Prediction
//                 </NavLink>
//               )}

//               {/* Company only */}
//               {userRole === "company" && (
//                 <>
//                   <NavLink
//                     // to="/recruiter-post-opportunity-selector"
//                     // state={{ preselectedPostingType: 'active' }}
//                      to="/recruiter-dashboard?type=active"
//                     onClick={(e) => {
//                       handleNavClick("/recruiter-dashboard", e);
//                       setIsMobileMenuOpen(false);
//                     }}
//                     className={({ isActive }) =>{
//                       const isThisTypeActive = currentPostingType === 'active' ;
//                       return (isThisTypeActive )
//                         ? "bg-[#1e1e2d] text-white rounded-xl px-4 py-2.5 font-bold text-sm"
//                         : "text-gray-600 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 text-sm"
//                     }}
//                   >
//                     Post Job
//                   </NavLink>


//                   <NavLink
//                     // to="/recruiter-post-opportunity-selector"
//                     // state={{ preselectedPostingType: 'future' }}
//                      to="/recruiter-dashboard?type=future"
//                     onClick={(e) => {
//                       handleNavClick("/recruiter-dashboard", e);
//                       setIsMobileMenuOpen(false);
//                     }}
//                     className={({ isActive }) =>{
//                       const isThisTypeActive = currentPostingType === 'future' ;
//                        return (isThisTypeActive )
//                         ? "bg-[#1e1e2d] text-white rounded-xl px-4 py-2.5 font-bold text-sm"
//                         : "text-gray-600 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 text-sm"
//                     }}
//                   >
//                     Future Job
//                   </NavLink>

//                   <NavLink
//                     to="/recruiter/employees"
//                     onClick={(e) => {
//                       handleNavClick("/recruiter/employees", e);
//                       setIsMobileMenuOpen(false);
//                     }}
//                     className={() => {
//                       const isEmployeesActive =
//                         location.pathname === "/recruiter/employees";
//                       return isEmployeesActive
//                         ? "bg-[#1e1e2d] text-white rounded-xl px-4 py-2.5 font-bold text-sm"
//                         : "text-gray-600 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 text-sm";
//                     }}
//                   >
//                     Employees
//                   </NavLink>

//                   <NavLink
//                     // to="/recruiter-post-opportunity-selector"
//                     // state={{ preselectedPostingType: 'college' }}
//                     to="/recruiter-dashboard?type=college"
//                     onClick={(e) => {
//                       handleNavClick("/recruiter-dashboard", e);
//                       setIsMobileMenuOpen(false);
//                     }}
//                     className={({ isActive }) =>{
//                       const isThisTypeActive = currentPostingType === 'college' ;
//                       return (isThisTypeActive )
//                         ? "bg-[#1e1e2d] text-white rounded-xl px-4 py-2.5 font-bold text-sm"
//                         : "text-gray-600 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 text-sm"
//                     }}
//                   >
//                     Campus Hiring
//                   </NavLink>

//                   <NavLink
//                     to="/pricing"
//                     onClick={(e) => handleNavClick("/pricing", e)}
//                     className={({ isActive }) =>
//                       isActive
//                         ? "bg-[#1e1e2d] text-white rounded-xl px-4 py-2.5 font-bold text-sm"
//                         : "text-gray-600 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 text-sm"
//                     }
//                   >
//                     Plans & Pricing
//                   </NavLink>
//                 </>
//               )}

//               {/* University only */}
//               {userRole === "university" && (
//                 <>
//                   <NavLink
//                     to="/university/credits/dashboard"
//                     onClick={(e) => {
//                       handleNavClick("/university/credits/dashboard", e);
//                       setIsMobileMenuOpen(false);
//                     }}
//                     className={({ isActive }) =>
//                       isActive
//                         ? "bg-[#1e1e2d] text-white rounded-xl px-4 py-2.5 font-bold text-sm"
//                         : "text-gray-600 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 text-sm"
//                     }
//                   >
//                     Dashboard
//                   </NavLink>

//                   <NavLink
//                     to="/university/credits/pricing"
//                     onClick={(e) => {
//                       handleNavClick("/university/credits/pricing", e);
//                       setIsMobileMenuOpen(false);
//                     }}
//                     className={({ isActive }) =>
//                       isActive
//                         ? "bg-[#1e1e2d] text-white rounded-xl px-4 py-2.5 font-bold text-sm"
//                         : "text-gray-600 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-50 text-sm"
//                     }
//                   >
//                     Plans & Pricing
//                   </NavLink>

//                 </>
//               )}
//             </div>

//             {/* Mobile Action Icons */}
//             <div className="flex items-center justify-around pt-3 border-t border-gray-100">
//               {/* Always shown */}
//               <div
//                 onClick={() => {
//                   handleIconNav("/chat-home");
//                   setIsMobileMenuOpen(false);
//                 }}
//                 className="flex items-center justify-center w-10 h-10 transition bg-gray-50 border border-gray-200 rounded-full cursor-pointer hover:bg-gray-100 active:bg-gray-200"
//               >
//                 <FiMessageCircle className="text-[#1e1e2d] text-base" />
//               </div>

//               <div
//                 onClick={() => {
//                   handleIconNav("/notifications");
//                   setIsMobileMenuOpen(false);
//                 }}
//                 className="flex items-center justify-center w-10 h-10 transition bg-gray-50 border border-gray-200 rounded-full cursor-pointer hover:bg-gray-100 active:bg-gray-200"
//               >
//                 {/* <FaBell className="text-[#1e1e2d] text-sm md:text-base" /> */}
//                 <NotificationBell className="text-[#1e1e2d] text-base" />
//               </div>

//               {/* Profile Completion Indicator with User Icon */}
//               <div className="relative flex flex-col items-center">
//                 {/* Percentage label above */}
//                 {/* {!loadingCompletion &&
//                   profileCompletion !== null &&
//                   profileCompletion > 0 && (
//                     <span className="absolute -top-6 text-[10px] font-medium text-gray-700 whitespace-nowrap">
//                       {profileCompletion}% Complete
//                     </span>
//                   )} */}

//                 {/* Clickable wrapper */}
//                 <div
//                   onClick={() => {
//                     handleIconNav(
//                       userRole === "student"
//                         ? "/student-profile"
//                         : userRole === "company"
//                           ? "/recruiter-profile"
//                           : userRole === "university"
//                             ? "/university-profile"
//                             : "/feed-my-profile"
//                     );
//                     // Close mobile menu if open
//                     setIsMobileMenuOpen(false);
//                   }}
//                   className="flex items-center justify-center w-10 h-10 transition bg-gray-50 border border-gray-200 rounded-full shadow-sm cursor-pointer hover:bg-gray-100 active:bg-gray-200"
//                 >
//                   {loadingCompletion ? (
//                     // Loading state: pulsing icon
//                     <FaUser className="text-[#1e1e2d] text-sm animate-pulse" />
//                   ) : profileCompletion === null || profileCompletion <= 0 ? (
//                     // No data or 0%: plain icon
//                     <FaUser className="text-[#1e1e2d] text-sm" />
//                   ) : (
//                     // Show circular progress + icon
//                     <div className="relative w-10 h-10">
//                       <svg className="w-full h-full" viewBox="0 0 36 36">
//                         {/* Background circle */}
//                         <circle
//                           cx="18"
//                           cy="18"
//                           r="15.9155"
//                           fill="none"
//                           stroke="#e5e7eb"
//                           pathLength="100"
//                           strokeWidth="3"
//                         />

//                         {/* Progress arc */}
//                         <circle
//                           cx="18"
//                           cy="18"
//                           r="15.9155"
//                           fill="none"
//                           stroke={
//                             profileCompletion >= 100 ? "#1DB32F" : "#9bc87c"
//                           }
//                           strokeWidth="3"
//                           strokeDasharray={`${profileCompletion} 100`}
//                           strokeLinecap="round"
//                           transform="rotate(-90 18 18)"
//                         />

//                         {/* Percentage text at top-right */}
//                         {profileCompletion !== null &&
//                           profileCompletion > 0 && (
//                             <text
//                               x="28"
//                               y="8"
//                               fontSize="6"
//                               fontWeight="bold"
//                               fill="#1e1e2d"
//                               textAnchor="end"
//                               dominantBaseline="middle"
//                               style={{ fontFamily: "Arial, sans-serif" }}
//                             >
//                               {profileCompletion}%
//                             </text>
//                           )}
//                       </svg>

//                       {/* User icon on top */}
//                       <div className="absolute inset-0 flex items-center justify-center">
//                         <FaUser className="text-[#1e1e2d] text-xs" />
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

































import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { FaSearch, FaBell, FaUser, FaBars, FaTimes } from "react-icons/fa";
import { FiMessageCircle } from "react-icons/fi";
import { useState, useEffect } from "react";
import websiteLogo from "../../assets/WebsiteLogo.svg";
import { useSelector } from "react-redux";
import { showProfileIncompleteAlert } from "../../utils/alertService";
import { userDetailsApi } from "../../api/userDetailsApi";
import HeaderNavTabs from "../../components/jobs/HeaderNavTabs";
import NotificationBell from "../notifications/NotificationBell"
import ChatIconButton from "../../components/shared/ChatIconButton";

export default function Header() {
  const TAB_ACTIVE =
  "bg-[#9bc87c] text-white rounded-full px-3 lg:px-5 py-1.5 font-bold shadow text-xs md:text-sm transition-colors";
const TAB_INACTIVE =
  "text-[#1e1e2d] px-3 lg:px-5 py-1.5 rounded-full font-bold hover:bg-[#eaf4e3] hover:text-[#1e1e2d] text-xs md:text-sm transition-colors";

const MOBILE_TAB_ACTIVE =
  "bg-[#9bc87c] text-white rounded-xl px-4 py-2.5 font-bold text-sm";
const MOBILE_TAB_INACTIVE =
  "text-[#1e1e2d] px-4 py-2.5 rounded-xl font-bold hover:bg-[#eaf4e3] text-sm";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const navigate = useNavigate();

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const toggleSearch = () => setIsSearchExpanded(!isSearchExpanded);
  const { token, user } = useSelector((state) => state.auth);
  const userRole = user?.user_role?.toLowerCase();

  const [profileCompletion, setProfileCompletion] = useState(null);
  const [loadingCompletion, setLoadingCompletion] = useState(true);

  const location = useLocation();
  const isStudentFillPage =
    location.pathname === "/student-fill-account-details";

  const isAnyPostingPage = [
  "/recruiter-post-opportunity-selector",
  "/recruiter-post-job-intern-details"
].includes(location.pathname);

  const [isProfileOpen, setIsProfileOpen] = useState(false);


  //  Helper to detect current posting type from URL/state
const getCurrentPostingType = () => {
  const pathname = location.pathname;
  
  // Case 1: On dashboard with query param ?type=active|future|college
  if (pathname === "/recruiter-dashboard") {
    const params = new URLSearchParams(location.search);
    const type = params.get("type");
    if (type && ["active", "future", "college"].includes(type)) {
      return type;
    }
  }
  
  // Case 2: On opportunity selector with preselected type in state
  if (pathname === "/recruiter-post-opportunity-selector") {
    const preselected = location.state?.preselectedPostingType;
    if (preselected && ["active", "future", "college"].includes(preselected)) {
      return preselected;
    }
  }
  
  // Case 3: On job details page - try to read from state (passed through)
  if (pathname === "/recruiter-post-job-intern-details") {
    const jobStatus = location.state?.jobStatus || location.state?.postingType;
    if (jobStatus && ["active", "future", "college"].includes(jobStatus)) {
      return jobStatus;
    }
  }
  
  return null; // No specific posting type detected
};

const currentPostingType = getCurrentPostingType(); //  Compute once per render


  useEffect(() => {
    const fetchProfileCompletion = async () => {
      if (!token) {
        setLoadingCompletion(false);
        return;
      }

      setLoadingCompletion(true);
      try {

        const response = await userDetailsApi.getProfileCompletion(
          token,
          false
        );

        // Extract correctly:
        const pct = response?.data?.profile_completion_percentage;

        if (typeof pct === "number") {
          setProfileCompletion(Math.min(100, Math.max(0, pct)));
        } else {
          setProfileCompletion(0);
        }
      } catch (err) {
        console.warn("Profile completion fetch failed:", err);
        setProfileCompletion(0);
      } finally {
        setLoadingCompletion(false);
      }
    };

    fetchProfileCompletion();
  }, [token]);

  // Guarded navigation handler for NavLink (receives event)
  const handleNavClick = (path, event) => {
    if (user?.profile_status === 1) {
      const protectedPaths = [
        "/feed",
        "/all-jobs",
        "/university/jobs",
        "/ai-prediction",
        "/student-profile",
        "/recruiter-dashboard",
        "/recruiter-profile",
        "/recruiter-post-job-intern-details",
        "/recruiter-post-opportunity-selector",
        "/student-analytics",
        "/university-profile",
        "/feed-notifications",
        "/chat",
        "/chat-home",
        "/feed-ticket",
        "/recruiter-ticket",
        "/university-ticket",
        "/university/credits/dashboard",
        "/university/credits/pricing",
        "/feed-view",
        "/pricing",
        "/notifications",
      ];

      if (protectedPaths.some((p) => path.startsWith(p))) {
        event.preventDefault(); // Stop NavLink from navigating
        showProfileIncompleteAlert(user.user_role).then((result) => {
          if (result.isConfirmed) {
            const setupPath =
              userRole === "student"
                ? "/student-fill-account-details"
                : userRole === "company"
                  ? "/recruiter-fill-account-details"
                  : userRole === "university"
                    ? "/university-fill-account-details"
                    : "/student-fill-account-details";
            navigate(setupPath);
          }
        });
      }
    }
    // If profile_status !== 1, do nothing — let NavLink handle navigation normally
  };

  // For icon clicks (no event needed)
  const handleIconNav = (path) => {
    if (user?.profile_status === 1) {
      const protectedPaths = [
        "/feed",
        "/all-jobs",
        "/university/jobs",
        "/ai-prediction",
        "/student-profile",
        "/recruiter-dashboard",
        "/recruiter-profile",
        "/recruiter-post-job-intern-details",
        "/recruiter-post-opportunity-selector",
        "/student-analytics",
        "/university-profile",
        "/feed-notifications",
        "/chat",
        "chat-home",
        "/feed-ticket",
        "/recruiter-ticket",
        "/university-ticket",
        "/university/credits/dashboard",
        "/university/credits/pricing",
        "/feed-view",
        "/pricing",
        "/notifications",
      ];

      if (protectedPaths.some((p) => path.startsWith(p))) {
        showProfileIncompleteAlert(user.user_role).then((result) => {
          if (result.isConfirmed) {
            const setupPath =
              userRole === "student"
                ? "/student-fill-account-details"
                : userRole === "company"
                  ? "/recruiter-fill-account-details"
                  : userRole === "university"
                    ? "/university-fill-account-details"
                    : "/student-fill-account-details";
            navigate(setupPath);
          }
        });
        return;
      }
    }
    navigate(path);
  };

  return (
    <div
      className="sticky top-0 z-50 flex items-center justify-between w-full px-4 py-2 bg-white border-b border-gray-100 shadow-sm h-16"
    >
      {/* Logo */}
      <div className="flex items-center">
        <p className="text-base font-bold sm:text-lg md:text-xl cursor-pointer" onClick={() => navigate('/')}>
          <img src={websiteLogo} alt="Logo" className="w-8 h-8" />
        </p>
      </div>

      {/* Desktop Nav Tabs - centered */}
      <div className="absolute z-10 hidden gap-1.5 px-1.5 py-1.5 -translate-x-1/2 -translate-y-1/2 bg-[#f3f9ee] border border-[#d9ebcd] rounded-full shadow-sm lg:flex left-1/2 top-1/2">
        {/* Shown for student */}
        {(userRole === "student") && (
          <NavLink
            to="/all-jobs?opportunityType=Job"
            onClick={(e) => handleNavClick("/all-jobs", e)}
            className={({ isActive }) => (isActive ? TAB_ACTIVE : TAB_INACTIVE)}
          >
            Jobs
          </NavLink>
        )}

        {/* Shown for student */}
        {(userRole === "student") && (
          <NavLink
            to="/all-jobs?opportunityType=Internship"
            onClick={(e) => handleNavClick("/all-jobs", e)}
            className={({ isActive }) => (isActive ? TAB_ACTIVE : TAB_INACTIVE)}
          >
            Internships
          </NavLink>
        )}

        {/* Shown for student */}
        {(userRole === "student") && (
          <NavLink
            to="/all-jobs?opportunityType=project"
            onClick={(e) => handleNavClick("/all-jobs", e)}
            className={({ isActive }) => (isActive ? TAB_ACTIVE : TAB_INACTIVE)}
          >
            Projects
          </NavLink>
        )}

        {/* Shown for student */}
        {userRole === "student" && (
          <NavLink
            to="/ai-prediction"
            onClick={(e) => handleNavClick("/ai-prediction", e)}
            className={({ isActive }) => (isActive ? TAB_ACTIVE : TAB_INACTIVE)}
          >
            AI Prediction
          </NavLink>
        )}

        {/* Company only */}
        {userRole === "company" && (
          <>
            <NavLink
              to="/recruiter-dashboard?type=future"
              onClick={(e) => handleNavClick("/recruiter-dashboard", e)}
              className={({ isActive }) =>{
                const isThisTypeActive = currentPostingType === 'future' ;
                return (isThisTypeActive )
                  ? "bg-[#1e1e2d] text-white rounded-full px-3 lg:px-5 py-1.5 font-bold shadow text-xs md:text-sm transition-colors"
                  : "text-gray-600 px-3 lg:px-5 py-1.5 rounded-full font-bold hover:bg-white hover:text-[#1e1e2d] text-xs md:text-sm transition-colors"
              }}
            >
              Future Employees Pipeline
            </NavLink>

            <NavLink
              to="/recruiter-dashboard?type=active"
              onClick={(e) => handleNavClick("/recruiter-dashboard", e)}
              className={({ isActive }) =>{
                const isThisTypeActive = currentPostingType === 'active' ;
                return (isThisTypeActive )
                  ? "bg-[#1e1e2d] text-white rounded-full px-3 lg:px-5 py-1.5 font-bold shadow text-xs md:text-sm transition-colors"
                  : "text-gray-600 px-3 lg:px-5 py-1.5 rounded-full font-bold hover:bg-white hover:text-[#1e1e2d] text-xs md:text-sm transition-colors"
              }}
            >
              Post Job
            </NavLink>

            <NavLink
              to="/recruiter-dashboard?type=college"
              onClick={(e) => handleNavClick("/recruiter-dashboard", e)}
              className={({ isActive }) =>{
                const isThisTypeActive = currentPostingType === 'college' ;
                return (isThisTypeActive )
                  ? "bg-[#1e1e2d] text-white rounded-full px-3 lg:px-5 py-1.5 font-bold shadow text-xs md:text-sm transition-colors"
                  : "text-gray-600 px-3 lg:px-5 py-1.5 rounded-full font-bold hover:bg-white hover:text-[#1e1e2d] text-xs md:text-sm transition-colors"
              }}
            >
              Campus Hiring
            </NavLink>

            {/* pricing page */}
            <NavLink
              to="/pricing"
              onClick={(e) => handleNavClick("/pricing", e)}
              className={({ isActive }) =>
                isActive
                  ? "bg-[#1e1e2d] text-white rounded-full px-3 lg:px-5 py-1.5 font-bold shadow text-xs md:text-sm transition-colors"
                  : "text-gray-600 px-3 lg:px-5 py-1.5 rounded-full font-bold hover:bg-white hover:text-[#1e1e2d] text-xs md:text-sm transition-colors"
              }
            >
              Plans & Pricing
            </NavLink>
          </>
        )}

        {/* University only */}
        {userRole === "university" && (
          <>
            <NavLink
              to="/university/jobs"
              onClick={(e) => handleNavClick("/university/jobs", e)}
              className={({ isActive }) =>
                isActive
                  ? "bg-[#1e1e2d] text-white rounded-full px-3 lg:px-5 py-1.5 font-bold shadow text-xs md:text-sm transition-colors"
                  : "text-gray-600 px-3 lg:px-5 py-1.5 rounded-full font-bold hover:bg-white hover:text-[#1e1e2d] text-xs md:text-sm transition-colors"
              }
            >
              Future Employees Pipeline
            </NavLink>

            <NavLink
              to="/university/notification-boost"
              onClick={(e) => handleNavClick("/university/notification-boost", e)}
              className={({ isActive }) =>
                isActive
                  ? "bg-[#1e1e2d] text-white rounded-full px-3 lg:px-5 py-1.5 font-bold shadow text-xs md:text-sm transition-colors"
                  : "text-gray-600 px-3 lg:px-5 py-1.5 rounded-full font-bold hover:bg-white hover:text-[#1e1e2d] text-xs md:text-sm transition-colors"
              }
            >
              Post Job
            </NavLink>

            <NavLink
              to="/university/notifications"
              onClick={(e) => handleNavClick("/university/notifications", e)}
              className={({ isActive }) =>
                isActive
                  ? "bg-[#1e1e2d] text-white rounded-full px-3 lg:px-5 py-1.5 font-bold shadow text-xs md:text-sm transition-colors"
                  : "text-gray-600 px-3 lg:px-5 py-1.5 rounded-full font-bold hover:bg-white hover:text-[#1e1e2d] text-xs md:text-sm transition-colors"
              }
            >
              Campus Hiring
            </NavLink>

            <NavLink
              to="/university/credits/pricing"
              onClick={(e) => handleNavClick("/university/credits/pricing", e)}
              className={({ isActive }) =>
                isActive
                  ? "bg-[#1e1e2d] text-white rounded-full px-3 lg:px-5 py-1.5 font-bold shadow text-xs md:text-sm transition-colors"
                  : "text-gray-600 px-3 lg:px-5 py-1.5 rounded-full font-bold hover:bg-white hover:text-[#1e1e2d] text-xs md:text-sm transition-colors"
              }
            >
              Plans & Pricing
            </NavLink>
          </>
        )}
      </div>

      {/* Search Bar and Right Icons */}
      <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
        {/* Right Icons */}
        <div className="flex items-center gap-2 md:gap-3 lg:gap-4">
          {/* Desktop Icons (now clickable) */}
          <div className="hidden md:flex items-center gap-2 md:gap-3 lg:gap-4">
            <div
              onClick={() => handleIconNav("/chat-home")}
              className="flex items-center justify-center transition bg-white border border-gray-200 rounded-full shadow-sm cursor-pointer w-9 h-9 md:w-10 md:h-10 hover:bg-gray-50 active:bg-gray-100"
            >
              <FiMessageCircle className="text-[#1e1e2d] text-base md:text-lg" />
            </div>

            

            <div
              onClick={() => handleIconNav("/notifications")}
              className="flex items-center justify-center transition bg-white border border-gray-200 rounded-full shadow-sm cursor-pointer w-9 h-9 md:w-10 md:h-10 hover:bg-gray-50 active:bg-gray-100"
            >
              <NotificationBell className="text-[#1e1e2d] text-base md:text-lg w-5 h-5" />
            </div>

            {/* Profile Completion Indicator with User Icon */}
            <div className="relative flex flex-col items-center">
              {/* Clickable wrapper */}
              <div className="relative">
                <div
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="flex items-center justify-center w-9 h-9 transition bg-white border border-gray-200 rounded-full shadow-sm cursor-pointer md:w-10 md:h-10 hover:bg-gray-50"
                >
                  <FaUser className="text-[#1e1e2d] text-sm md:text-base" />
                </div>

                {/* DROPDOWN */}
                {isProfileOpen && (
                  <div className="absolute right-0 z-50 w-48 mt-3 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleIconNav(
                          userRole === "student"
                            ? "/student-profile"
                            : userRole === "company"
                              ? "/recruiter-profile"
                              : "/university-profile"
                        );
                      }}
                      className="w-full px-5 py-3 text-sm font-bold text-left text-[#1e1e2d] hover:bg-gray-50 transition-colors"
                    >
                      Settings
                    </button>

                    <button
                      onClick={() => {
                        localStorage.clear();
                        sessionStorage.clear();
                        window.location.replace("/login");
                      }}
                      className="w-full px-5 py-3 text-sm font-bold text-left text-red-600 hover:bg-red-50 border-t border-gray-50 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div
            className="flex items-center justify-center bg-white border border-gray-200 rounded-full shadow-sm cursor-pointer md:hidden w-9 h-9"
            onClick={toggleMobileMenu}
          >
            {isMobileMenuOpen ? (
              <FaTimes className="text-[#1e1e2d] text-base" />
            ) : (
              <FaBars className="text-[#1e1e2d] text-base" />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="absolute left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-lg top-full md:hidden">
          <div className="flex flex-col p-3 space-y-3">
            {/* Mobile Nav Links */}
            <div className="flex flex-col space-y-2">

              {/* Shown for student, company, university */}
              {(userRole === "student") && (
                <NavLink
                  to="/all-jobs"
                  onClick={(e) => {
                    handleNavClick("/all-jobs", e);
                    setIsMobileMenuOpen(false);
                  }}
                  className={({ isActive }) => (isActive ? MOBILE_TAB_ACTIVE : MOBILE_TAB_INACTIVE)}
                >
                  Jobs
                </NavLink>
              )}

              {userRole === "student" && (
                <NavLink
                  to="/ai-prediction"
                  onClick={(e) => {
                    handleNavClick("/ai-prediction", e);
                    setIsMobileMenuOpen(false);
                  }}
                  className={({ isActive }) => (isActive ? MOBILE_TAB_ACTIVE : MOBILE_TAB_INACTIVE)}
                >
                  AI Prediction
                </NavLink>
              )}

              {/* Company only */}
              {userRole === "company" && (
                <>
                  <NavLink
                     to="/recruiter-dashboard?type=future"
                    onClick={(e) => {
                      handleNavClick("/recruiter-dashboard", e);
                      setIsMobileMenuOpen(false);
                    }}
                    className={() =>{
                      const isThisTypeActive = currentPostingType === 'future';
                      return isThisTypeActive ? MOBILE_TAB_ACTIVE : MOBILE_TAB_INACTIVE;
                    }}
                  >
                    Future Employees Pipeline
                  </NavLink>

                  <NavLink
                     to="/recruiter-dashboard?type=active"
                    onClick={(e) => {
                      handleNavClick("/recruiter-dashboard", e);
                      setIsMobileMenuOpen(false);
                    }}
                    className={() =>{
                      const isThisTypeActive = currentPostingType === 'active';
                      return isThisTypeActive ? MOBILE_TAB_ACTIVE : MOBILE_TAB_INACTIVE;
                    }}
                  >
                    Post Job
                  </NavLink>

                  <NavLink
                    to="/recruiter-dashboard?type=college"
                    onClick={(e) => {
                      handleNavClick("/recruiter-dashboard", e);
                      setIsMobileMenuOpen(false);
                    }}
                    className={() =>{
                      const isThisTypeActive = currentPostingType === 'college';
                      return isThisTypeActive ? MOBILE_TAB_ACTIVE : MOBILE_TAB_INACTIVE;
                    }}
                  >
                    Campus Hiring
                  </NavLink>

                  <NavLink
                    to="/pricing"
                    onClick={(e) => {
                      handleNavClick("/pricing", e);
                      setIsMobileMenuOpen(false);
                    }}
                    className={({ isActive }) => (isActive ? MOBILE_TAB_ACTIVE : MOBILE_TAB_INACTIVE)}
                  >
                    Plans & Pricing
                  </NavLink>
                </>
              )}

              {/* University only */}
              {userRole === "university" && (
                <>
                  <NavLink
                    to="/university/jobs"
                    onClick={(e) => {
                      handleNavClick("/university/jobs", e);
                      setIsMobileMenuOpen(false);
                    }}
                    className={({ isActive }) => (isActive ? MOBILE_TAB_ACTIVE : MOBILE_TAB_INACTIVE)}
                  >
                    Future Employees Pipeline
                  </NavLink>

                  <NavLink
                    to="/university/notification-boost"
                    onClick={(e) => {
                      handleNavClick("/university/notification-boost", e);
                      setIsMobileMenuOpen(false);
                    }}
                    className={({ isActive }) => (isActive ? MOBILE_TAB_ACTIVE : MOBILE_TAB_INACTIVE)}
                  >
                    Post Job
                  </NavLink>

                  <NavLink
                    to="/university/notifications"
                    onClick={(e) => {
                      handleNavClick("/university/notifications", e);
                      setIsMobileMenuOpen(false);
                    }}
                    className={({ isActive }) => (isActive ? MOBILE_TAB_ACTIVE : MOBILE_TAB_INACTIVE)}
                  >
                    Campus Hiring
                  </NavLink>

                  <NavLink
                    to="/university/credits/pricing"
                    onClick={(e) => {
                      handleNavClick("/university/credits/pricing", e);
                      setIsMobileMenuOpen(false);
                    }}
                    className={({ isActive }) => (isActive ? MOBILE_TAB_ACTIVE : MOBILE_TAB_INACTIVE)}
                  >
                    Plans & Pricing
                  </NavLink>
                </>
              )}
            </div>

            {/* Mobile Action Icons */}
            <div className="flex items-center justify-around pt-3 border-t border-gray-100">
              {/* Always shown */}
              <div
                onClick={() => {
                  handleIconNav("/chat-home");
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center w-10 h-10 transition bg-gray-50 border border-gray-200 rounded-full cursor-pointer hover:bg-gray-100 active:bg-gray-200"
              >
             
                <FiMessageCircle className="text-[#1e1e2d] text-base" />
              </div>
             

              <div
                onClick={() => {
                  handleIconNav("/notifications");
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center justify-center w-10 h-10 transition bg-gray-50 border border-gray-200 rounded-full cursor-pointer hover:bg-gray-100 active:bg-gray-200"
              >
                <NotificationBell className="text-[#1e1e2d] text-base" />
              </div>

              {/* Profile Completion Indicator with User Icon */}
              <div className="relative flex flex-col items-center">
                {/* Clickable wrapper */}
                <div
                  onClick={() => {
                    handleIconNav(
                      userRole === "student"
                        ? "/student-profile"
                        : userRole === "company"
                          ? "/recruiter-profile"
                          : userRole === "university"
                            ? "/university-profile"
                            : "/feed-my-profile"
                    );
                    // Close mobile menu if open
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center w-10 h-10 transition bg-gray-50 border border-gray-200 rounded-full shadow-sm cursor-pointer hover:bg-gray-100 active:bg-gray-200"
                >
                  {loadingCompletion ? (
                    // Loading state: pulsing icon
                    <FaUser className="text-[#1e1e2d] text-sm animate-pulse" />
                  ) : profileCompletion === null || profileCompletion <= 0 ? (
                    // No data or 0%: plain icon
                    <FaUser className="text-[#1e1e2d] text-sm" />
                  ) : (
                    // Show circular progress + icon
                    <div className="relative w-10 h-10">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        {/* Background circle */}
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9155"
                          fill="none"
                          stroke="#e5e7eb"
                          pathLength="100"
                          strokeWidth="3"
                        />

                        {/* Progress arc */}
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9155"
                          fill="none"
                          stroke={
                            profileCompletion >= 100 ? "#1DB32F" : "#9bc87c"
                          }
                          strokeWidth="3"
                          strokeDasharray={`${profileCompletion} 100`}
                          strokeLinecap="round"
                          transform="rotate(-90 18 18)"
                        />
                      </svg>

                      {/* User icon on top */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FaUser className="text-[#1e1e2d] text-xs" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
