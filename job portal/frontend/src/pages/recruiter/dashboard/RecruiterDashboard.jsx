// import React, { useEffect, useState } from "react";
// import { Search } from "lucide-react";
// import MainLayout from "../../../components/layout/MainLayout";
// import { recruiterApi } from "../../../api/recruiterApi";
// import { useSelector } from "react-redux";
// import RecruiterRightSidebar from "./RecruiterRightSidebar";
// import { useNavigate } from "react-router-dom";
// import { FaPlus, FaEye, FaLock, FaUniversity, FaClock, FaCheckCircle } from "react-icons/fa";
// import { Button } from "../../../components/ui";
// import FeedRightSidebar from "../../student/feed/FeedRightSidebar";




// import { FaYoutube, FaTimes } from "react-icons/fa";
// import { X, PlayCircle, HelpCircle } from "lucide-react";

// // Reusable dismissible floating help banner
// const FloatingHelpBanner = ({ videoUrl, onDismiss, isVisible }) => {
//   if (!isVisible) return null;
  
//   return (
//     <div className="fixed z-40 w-full max-w-md px-4 -translate-x-1/2 top-30 left-1/2">
//       <div className="flex items-start gap-3 p-3 bg-white border border-blue-200 rounded-lg shadow-lg animate-slide-down">
//         <div className="flex-shrink-0 mt-0.5">
//           <div className="p-1.5 rounded-full bg-red-50">
//             <FaYoutube className="w-4 h-4 text-red-500" />
//           </div>
//         </div>
//         <div className="flex-1 min-w-0">
//           <h4 className="text-sm font-semibold text-gray-900">New to posting jobs?</h4>
//           <p className="mt-0.5 text-xs text-gray-600">Watch our 2-min guide to attract better candidates.</p>
//           <a
//             href={videoUrl}
//             onClick={(e) => e.stopPropagation()}
//             className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-blue-600 hover:text-blue-800"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <PlayCircle className="w-3 h-3" />
//             Watch tutorial
//           </a>
//         </div>
//         <button
//           onClick={onDismiss}
//           className="flex-shrink-0 p-1 text-gray-400 transition-colors rounded-full hover:text-gray-600 hover:bg-gray-100"
//           aria-label="Dismiss help banner"
//         >
//           <X className="w-4 h-4" />
//         </button>
//       </div>
//     </div>
//   );
// };

// const RecruiterDashboard = () => {
//   // === Original dashboard stats ===
//   const [dashboardStats, setDashboardStats] = useState({
//     jobsPosted: 0,
//     pendingTasks: 0,
//     upcomingInterviews: 0,
//   });

//   const navigate = useNavigate();
//   const token = useSelector((state) => state.auth.token);
//   const user = useSelector((state) => state.auth.user);


//   const [isHelpBannerDismissed, setIsHelpBannerDismissed] = useState(() => {
//     // Check localStorage on initial load
//     if (typeof window !== "undefined") {
//       return localStorage.getItem("dismissedJobHelpBanner") === "true";
//     }
//     return false;
//   });

//   const handleDismissHelpBanner = () => {
//     setIsHelpBannerDismissed(true);
//     localStorage.setItem("dismissedJobHelpBanner", "true");
//     // Optional: Track dismissal for analytics
//     // analytics.track('help_banner_dismissed', { source: 'dashboard' });
//   };

//   const VIDEO_HELP_URL = "https://youtube.com/watch?v=YOUR_VIDEO_ID"; 

//   // === Fetch original dashboard stats ===
//   useEffect(() => {
//     if (!token) return;

//     const fetchDashboardStats = async () => {
//       try {
//         const data = await recruiterApi.getDashboardStats(token);
//         setDashboardStats(data);
//       } catch (error) {
//         console.error("Error fetching dashboard stats:", error);
//       }
//     };

//     fetchDashboardStats();
//   }, [token]);

  

//   // === Original navigation cards ===
//   const data = [
//     {
//       title: "Total Job Posts",
//       description: "Track and manage all your open roles in one place.",
//       button: `Manage postings (${dashboardStats.jobsPosted})`,
//       buttonAction: () => navigate("/recruiter/jobs"),
//     },
//     {
//       title: "Pipeline Candidates",
//       description: "Monitor every candidate’s journey through your hiring funnel.",
//       button: "Manage pipelines",
//       buttonAction: () => navigate("/recruiter-pipeline"),
//     },
//     {
//       title: "Upcoming Interviews",
//       description: `You have ${dashboardStats.upcomingInterviews} interviews scheduled.`,
//       button: `View details (${dashboardStats.upcomingInterviews})`,
//       buttonAction: () => navigate("/recruiter-upcoming-interview"),
//     },
//     // {
//     //   title: "Manage Plans & Billing",
//     //   description: `View your active plan and recent transactions history.`,
//     //   button: `Manage Plan`,
//     //   buttonAction: () => navigate("/recruiter/billing/dashboard"),
//     // },
//     // {
//     //   title: "Analytics and Reports",
//     //   description: "Track hiring progress and performance in real time.",
//     //   button: "View details",
//     //   buttonAction: () => navigate("/recruiter-view-analytics"),
//     // },
//     // {
//     //   title: "Settings and Access Panel",
//     //   description: "Manage your personal information and app preferences.",
//     //   button: "View details",
//     //   buttonAction: () => navigate("/recruiter-email-alert-settings"),
//     // },
//     // {
//     //   title: "Settings and Access Panel",
//     //   description: "Team, roles, company info, security & more.",
//     //   button: "Manage Settings",
//     //   buttonAction: () => navigate("/recruiter/settings/team"), 
//     // },
//   ];

//   return (
//     <MainLayout>

//       <FloatingHelpBanner
//         videoUrl={VIDEO_HELP_URL}
//         onDismiss={handleDismissHelpBanner}
//         isVisible={!isHelpBannerDismissed}
//       />
//       <div className="flex items-start justify-center min-h-screen px-3 bg-gray-100 sm:px-5 lg:px-8">
//         <div className="flex-grow hidden lg:block"></div>

//         <div className="flex flex-col w-full max-w-full gap-4 mt-5 lg:flex-row">
//           {/* Left Section: Original cards + New job table */}
//           <section className="w-full  rounded-[10px] p-5 bg-white shadow-md">
//             {/* Header */}
//             <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>

            


//             {/* --- NEW: Two Image-Based Job Posting Options (Fiverr-style) --- */}
//             <div className="grid grid-cols-1 gap-4 mt-5 sm:grid-cols-3">
//               {/* Option 1: Post a Job (Standard) */}
//               <div
//                 onClick={() => navigate("/recruiter-post-opportunity-selector")}
//                 className="relative overflow-hidden transition-transform rounded-lg shadow-md cursor-pointer group hover:scale-105"
//               >
//                 <div className="flex items-center justify-center p-4 aspect-video bg-gradient-to-br from-blue-50 to-indigo-100">
//                   <div className="text-center">
//                     <FaPlus className="mx-auto mb-2 text-4xl text-blue-600" />
//                     <h3 className="font-bold text-blue-800">Post a Job</h3>
//                     <p className="mt-1 text-sm text-gray-600">Start hiring now — post a job in under 2 minutes.</p>
//                   </div>
//                 </div>
//                 <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-blue-600 opacity-0 group-hover:opacity-100">
//                   <span className="font-medium text-white">Post Now →</span>
//                 </div>
//               </div>

//               {/* Option 2: Post Future Job */}
//               <div
//                 onClick={() =>
//                   navigate("/recruiter-post-opportunity-selector", {
//                     state: { preselectedPostingType: "future" },
//                   })
//                 }
//                 className="relative overflow-hidden transition-transform rounded-lg shadow-md cursor-pointer group hover:scale-105"
//               >
//                 <div className="flex items-center justify-center p-4 aspect-video bg-gradient-to-br from-green-50 to-emerald-100">
//                   <div className="text-center">
//                     <FaClock className="mx-auto mb-2 text-4xl text-green-600" />
//                     <h3 className="font-bold text-green-800">Schedule Future Job</h3>
//                     <p className="mt-1 text-sm text-gray-600">Plan ahead — schedule a job to be posted later.</p>
//                   </div>
//                 </div>
//                 <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-green-600 opacity-0 group-hover:opacity-100">
//                   <span className="font-medium text-white">Schedule →</span>
//                 </div>
//               </div>

//               {/* Option 3: Post College Job */}
//               <div
//                 onClick={() =>
//                   navigate("/recruiter-post-opportunity-selector", {
//                     state: { preselectedPostingType: "college" },
//                   })
//                 }
//                 className="relative overflow-hidden transition-transform rounded-lg shadow-md cursor-pointer group hover:scale-105"
//               >
//                 <div className="flex items-center justify-center p-4 aspect-video bg-gradient-to-br from-green-50 to-emerald-100">
//                   <div className="text-center">
//                     <FaClock className="mx-auto mb-2 text-4xl text-teal-600" />
//                     <h3 className="font-bold text-teal-800">Campus hiring</h3>
//                     <p className="mt-1 text-sm text-gray-600">Recruit Students directly from institutes</p>
//                   </div>
//                 </div>
//                 <div className="absolute inset-0 flex items-center justify-center transition-opacity bg-green-600 opacity-0 group-hover:opacity-100">
//                   <span className="font-medium text-white">Hire Now →</span>
//                 </div>
//               </div>
//             </div>



//             {/* Original action cards */}
//             <div className="grid grid-cols-1 gap-4 mt-5 sm:grid-cols-3">
//               {data.map((item, index) => (
//                 <div
//                   key={index}
//                   className="flex flex-col justify-between p-4 border border-gray-200 rounded-lg shadow-sm"
//                 >
//                   <div>
//                     <h2 className="text-base font-semibold sm:text-lg">{item.title}</h2>
//                     <p className="mt-1 text-sm text-blue-600">{item.description}</p>
//                   </div>
//                   <button
//                     onClick={item.buttonAction}
//                     className="bg-red-500 hover:bg-red-600 text-white py-1.5 px-3 rounded mt-3 text-sm font-medium"
//                   >
//                     {item.button}
//                   </button>
//                 </div>
//               ))}
//             </div>

            
//           </section>

//           {/* Right Sidebar */}
//           {/* <div className="w-full lg:w-[350px]">
//             <FeedRightSidebar />
//           </div> */}
//         </div>
//       </div>
//     </MainLayout>
//   );
// };

// export default RecruiterDashboard;



















































import React, { useEffect, useState } from "react";
import { Search, X, PlayCircle } from "lucide-react"; // Added X, PlayCircle
import MainLayout from "../../../components/layout/MainLayout";
import { recruiterApi } from "../../../api/recruiterApi";
import { useSelector } from "react-redux";
import RecruiterRightSidebar from "./RecruiterRightSidebar";
import { useNavigate, useLocation } from "react-router-dom"; // Added useLocation
import { FaPlus, FaEye, FaLock, FaUniversity, FaClock, FaCheckCircle, FaYoutube, FaGraduationCap, FaProjectDiagram } from "react-icons/fa";
import { Button } from "../../../components/ui";
import FeedRightSidebar from "../../student/feed/FeedRightSidebar";
import GreenPrimaryButton from "../../../components/jobs/GreenPrimaryButton";

// ... [FloatingHelpBanner component - UNCHANGED] ...
const FloatingHelpBanner = ({ videoUrl, onDismiss, isVisible }) => {
  if (!isVisible) return null;
  return (
    <div className="fixed z-40 w-full max-w-md px-4 -translate-x-1/2 top-30 left-1/2">
      <div className="flex items-start gap-3 p-3 bg-white border border-blue-200 rounded-lg shadow-lg animate-slide-down">
        <div className="flex-shrink-0 mt-0.5">
          <div className="p-1.5 rounded-full bg-red-50">
            <FaYoutube className="w-4 h-4 text-red-500" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900">New to posting jobs?</h4>
          <p className="mt-0.5 text-xs text-gray-600">Watch our 2-min guide to attract better candidates.</p>
          <a
            href={videoUrl}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 mt-1 text-[11px] font-medium text-blue-600 hover:text-blue-800"
            target="_blank"
            rel="noopener noreferrer"
          >
            <PlayCircle className="w-3 h-3" />
            Watch tutorial
          </a>
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 text-gray-400 transition-colors rounded-full hover:text-gray-600 hover:bg-gray-100"
          aria-label="Dismiss help banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

const RecruiterDashboard = () => {
  const [dashboardStats, setDashboardStats] = useState({
    jobsPosted: 0,
    pendingTasks: 0,
    upcomingInterviews: 0,
  });

  const navigate = useNavigate();
  const location = useLocation(); //  NEW: Get query params
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  //  NEW: Get posting type from query param (active/future/college)
  const urlParams = new URLSearchParams(location.search);
  const postingTypeFilter = urlParams.get("type"); // "active" | "future" | "college" | null

  const [isHelpBannerDismissed, setIsHelpBannerDismissed] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("dismissedJobHelpBanner") === "true";
    }
    return false;
  });

  const handleDismissHelpBanner = () => {
    setIsHelpBannerDismissed(true);
    localStorage.setItem("dismissedJobHelpBanner", "true");
  };

  const VIDEO_HELP_URL = "https://youtube.com/watch?v=YOUR_VIDEO_ID";

  useEffect(() => {
    if (!token) return;
    const fetchDashboardStats = async () => {
      try {
        const data = await recruiterApi.getDashboardStats(token);
        setDashboardStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };
    fetchDashboardStats();
  }, [token]);

  //  NEW: Filtered posting cards based on URL param
  const postingCards = [
    {
      id: "active",
      title: "Post a Job",
      description: "Start hiring now — post a job in under 2 minutes.",
      icon: <FaPlus className="mx-auto mb-2 text-4xl text-blue-600" />,
      gradient: "from-blue-50 to-indigo-100",
      hoverBg: "bg-blue-600",
      textColor: "text-blue-800",
      cta: "Post Now →",
      navigateTo: "/recruiter-post-opportunity-selector",
      state: { preselectedPostingType: "active" },
    },
    {
      id: "future",
      title: "Schedule Future Job",
      description: "Plan ahead — schedule a job to be posted later.",
      icon: <FaClock className="mx-auto mb-2 text-4xl text-green-600" />,
      gradient: "from-green-50 to-emerald-100",
      hoverBg: "bg-green-600",
      textColor: "text-green-800",
      cta: "Schedule →",
      navigateTo: "/recruiter-post-opportunity-selector",
      state: { preselectedPostingType: "future" },
    },
    {
      id: "college",
      title: "Campus Hiring",
      description: "Recruit Students directly from institutes",
      icon: <FaUniversity className="mx-auto mb-2 text-4xl text-teal-600" />,
      gradient: "from-teal-50 to-cyan-100",
      hoverBg: "bg-teal-600",
      textColor: "text-teal-800",
      cta: "Hire Now →",
      navigateTo: "/recruiter-post-opportunity-selector",
      state: { preselectedPostingType: "college" },
    },
    {
      id: "employees",
      title: "Employees",
      description: "Manage all employees and pending approvals in one place.",
      icon: <FaCheckCircle className="mx-auto mb-2 text-4xl text-purple-600" />,
      gradient: "from-purple-50 to-fuchsia-100",
      hoverBg: "bg-purple-600",
      textColor: "text-purple-800",
      cta: "Open Employees →",
      navigateTo: "/recruiter/employees",
      state: undefined,
    },
  ];

  const futureOpportunityCards = [
    {
      id: "future-job",
      title: "Job",
      description: "Schedule a future job opening for candidates.",
      icon: <FaClock className="mx-auto mb-2 text-4xl text-green-600" />,
      gradient: "from-green-50 to-emerald-100",
      hoverBg: "bg-green-600",
      textColor: "text-green-800",
      cta: "Schedule Job →",
      navigateTo: "/recruiter-post-job-intern-details",
      state: {
        jobStatus: "future",
        opportunityType: "Job",
        postingType: "future",
      },
    },
    {
      id: "future-internship",
      title: "Internship",
      description: "Schedule a future internship opportunity.",
      icon: <FaGraduationCap className="mx-auto mb-2 text-4xl text-purple-600" />,
      gradient: "from-purple-50 to-fuchsia-100",
      hoverBg: "bg-purple-600",
      textColor: "text-purple-800",
      cta: "Schedule Internship →",
      navigateTo: "/recruiter-post-job-intern-details",
      state: {
        jobStatus: "future",
        opportunityType: "Internship",
        postingType: "future",
      },
    },
  ];

  const activeOpportunityCards = [
    {
      id: "active-job",
      title: "Job",
      description: "Post a job that candidates can apply to immediately.",
      icon: <FaPlus className="mx-auto mb-2 text-4xl text-blue-600" />,
      gradient: "from-blue-50 to-indigo-100",
      hoverBg: "bg-blue-600",
      textColor: "text-blue-800",
      cta: "Post Job →",
      navigateTo: "/recruiter-post-job-intern-details",
      state: {
        jobStatus: "active",
        opportunityType: "Job",
        postingType: "active",
      },
    },
    {
      id: "active-internship",
      title: "Internship",
      description: "Post an internship opportunity for candidates.",
      icon: <FaGraduationCap className="mx-auto mb-2 text-4xl text-purple-600" />,
      gradient: "from-purple-50 to-fuchsia-100",
      hoverBg: "bg-purple-600",
      textColor: "text-purple-800",
      cta: "Post Internship →",
      navigateTo: "/recruiter-post-job-intern-details",
      state: {
        jobStatus: "active",
        opportunityType: "Internship",
        postingType: "active",
      },
    },
    {
      id: "active-project",
      title: "Project",
      description: "Post a project opportunity for candidates.",
      icon: <FaProjectDiagram className="mx-auto mb-2 text-4xl text-emerald-600" />,
      gradient: "from-emerald-50 to-green-100",
      hoverBg: "bg-emerald-600",
      textColor: "text-emerald-800",
      cta: "Post Project →",
      navigateTo: "/recruiter-post-job-intern-details",
      state: {
        jobStatus: "active",
        opportunityType: "Project",
        postingType: "active",
      },
    },
  ];

  const collegeOpportunityCards = [
    {
      id: "college-job",
      title: "Job",
      description: "Post a campus hiring job for selected colleges.",
      icon: <FaUniversity className="mx-auto mb-2 text-4xl text-teal-600" />,
      gradient: "from-teal-50 to-cyan-100",
      hoverBg: "bg-teal-600",
      textColor: "text-teal-800",
      cta: "Post Campus Job →",
      navigateTo: "/recruiter-post-job-intern-details",
      state: {
        jobStatus: "college",
        opportunityType: "Job",
        postingType: "college",
      },
    },
    {
      id: "college-internship",
      title: "Internship",
      description: "Post a campus internship for selected colleges.",
      icon: <FaGraduationCap className="mx-auto mb-2 text-4xl text-purple-600" />,
      gradient: "from-purple-50 to-fuchsia-100",
      hoverBg: "bg-purple-600",
      textColor: "text-purple-800",
      cta: "Post Campus Internship →",
      navigateTo: "/recruiter-post-job-intern-details",
      state: {
        jobStatus: "college",
        opportunityType: "Internship",
        postingType: "college",
      },
    },
    {
      id: "college-project",
      title: "Project",
      description: "Post a campus project opportunity for selected colleges.",
      icon: <FaProjectDiagram className="mx-auto mb-2 text-4xl text-emerald-600" />,
      gradient: "from-emerald-50 to-green-100",
      hoverBg: "bg-emerald-600",
      textColor: "text-emerald-800",
      cta: "Post Campus Project →",
      navigateTo: "/recruiter-post-job-intern-details",
      state: {
        jobStatus: "college",
        opportunityType: "Project",
        postingType: "college",
      },
    },
  ];

  //  Filter: if type param exists, show only that section; post/future/campus show direct opportunity cards.
  const visiblePostingCards =
    postingTypeFilter === "active"
      ? activeOpportunityCards
      : postingTypeFilter === "future"
      ? futureOpportunityCards
      : postingTypeFilter === "college"
        ? collegeOpportunityCards
      : postingTypeFilter
        ? postingCards.filter((card) => card.id === postingTypeFilter)
        : postingCards;

  const data = [
    {
      title: "Total Job Posts",
      description: "Track and manage all your open roles in one place.",
      button: `Manage postings (${dashboardStats.jobsPosted})`,
      buttonAction: () => {
      // Using existing 'postingTypeFilter' (from URL ?type=)
      const state = postingTypeFilter 
        ? { post_type: postingTypeFilter } 
        : undefined;
      
      navigate("/recruiter/jobs", { state });
    },
    },
    {
      title: "Pipeline Candidates",
      description: "Monitor every candidate's journey through your hiring funnel.",
      button: "Manage pipelines",
      buttonAction: () => navigate("/recruiter-pipeline"),
    },
    {
      title: "Upcoming Interviews",
      description: `You have ${dashboardStats.upcomingInterviews} interviews scheduled.`,
      button: `View details (${dashboardStats.upcomingInterviews})`,
      buttonAction: () => navigate("/recruiter-upcoming-interview"),
    },
    {
      title: "All Employees",
      description: "View and manage all employees mapped to your company experiences.",
      button: "Open employee tab",
      buttonAction: () => navigate("/recruiter/employees"),
    },
    {
      title: "Pending Employee Approvals",
      description: "Review proof uploads and approve or reject re-approval requests.",
      button: "Open employee tab",
      buttonAction: () => navigate("/recruiter/employees"),
    },
    // {
    //   title: "Manage Plans & Billing",
    //   description: `View your active plan and recent transactions history.`,
    //   button: `Manage Plan`,
    //   buttonAction: () => navigate("/recruiter/billing/dashboard"),
    // },
    // {
    //   title: "Analytics and Reports",
    //   description: "Track hiring progress and performance in real time.",
    //   button: "View details",
    //   buttonAction: () => navigate("/recruiter-view-analytics"),
    // },
    // {
    //   title: "Settings and Access Panel",
    //   description: "Manage your personal information and app preferences.",
    //   button: "View details",
    //   buttonAction: () => navigate("/recruiter-email-alert-settings"),
    // },
    // {
    //   title: "Settings and Access Panel",
    //   description: "Team, roles, company info, security & more.",
    //   button: "Manage Settings",
    //   buttonAction: () => navigate("/recruiter/settings/team"), 
    // },
  ];

  const visibleData =
    postingTypeFilter === "active"
      ? data.filter(
          (item) =>
            item.title !== "All Employees" &&
            item.title !== "Pending Employee Approvals"
        )
      : data;

  return (
    <MainLayout>
      <FloatingHelpBanner
        videoUrl={VIDEO_HELP_URL}
        onDismiss={handleDismissHelpBanner}
        isVisible={!isHelpBannerDismissed}
      />
      <div className="flex items-start justify-center min-h-screen px-3 bg-gray-100 sm:px-5 lg:px-8">
        <div className="flex-grow hidden lg:block"></div>

        <div className="flex flex-col w-full max-w-full gap-4 mt-5 lg:flex-row">
          <section className="w-full rounded-[10px] p-5 bg-white shadow-md">
            {/* Header */}
            <h1 className="text-2xl font-bold sm:text-3xl">Dashboard</h1>

            {/*  NEW: Dynamic Posting Cards */}
            <div className={`grid grid-cols-1 gap-4 mt-5 ${
              postingTypeFilter === "active"
                ? "sm:grid-cols-3"
                : postingTypeFilter === "future"
                  ? "sm:grid-cols-2"
                  : postingTypeFilter === "college"
                    ? "sm:grid-cols-3"
                  : "sm:grid-cols-1"
            }`}>
              {visiblePostingCards.map((card) => (
                <div
                  key={card.id}
                  onClick={() =>
                    navigate(card.navigateTo, { state: card.state })
                  }
                  className="relative overflow-hidden transition-transform rounded-lg shadow-md cursor-pointer group hover:scale-105"
                >
                  <div className={`flex items-center justify-center p-4  bg-gradient-to-br ${card.gradient}`}>
                    <div className="text-center">
                      {card.icon}
                      <h3 className={`font-bold ${card.textColor}`}>{card.title}</h3>
                      <p className="mt-1 text-sm text-gray-600">{card.description}</p>
                    </div>
                  </div>
                  <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${card.hoverBg} opacity-0 group-hover:opacity-100`}>
                    <span className="font-medium text-white">{card.cta}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Original action cards - UNCHANGED */}
            <div className="grid grid-cols-1 gap-4 mt-5 sm:grid-cols-3">
              {visibleData.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col justify-between p-4 border border-gray-200 rounded-lg shadow-sm"
                >
                  <div>
                    <h2 className="text-base font-semibold sm:text-lg">{item.title}</h2>
                    <p className="mt-1 text-sm text-blue-600">{item.description}</p>
                  </div>
                  {/* <button
                    onClick={item.buttonAction}
                    className="bg-red-500 hover:bg-red-600 text-white py-1.5 px-3 rounded mt-3 text-sm font-medium"
                  >
                    {item.button}
                  </button> */}
                  <GreenPrimaryButton
  onClick={item.buttonAction}
  className="mt-3 w-full"
>
  {item.button}
</GreenPrimaryButton>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default RecruiterDashboard;
