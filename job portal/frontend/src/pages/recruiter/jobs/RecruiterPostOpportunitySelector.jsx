// // src/pages/recruiter/RecruiterPostOpportunitySelector.jsx
// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   Briefcase,
//   Calendar,
//   GraduationCap,
//   ChevronRight,
//   Info,
// } from "lucide-react";
// import MainLayout from "../../../components/layout/MainLayout";


// const RecruiterPostOpportunitySelector = () => {
//   const navigate = useNavigate();

//   const location = useLocation();

//   // Extract preselected type from navigation state, fallback to 'active'
//   const initialPostingType =
//     location.state?.preselectedPostingType &&
//       ["active", "future", "college"].includes(location.state.preselectedPostingType)
//       ? location.state.preselectedPostingType
//       : "active";

//   const [selectedPostingType, setSelectedPostingType] = useState(initialPostingType);
//   const [selectedOpportunityType, setSelectedOpportunityType] = useState(null);

//   // Posting Types with icons and colors
//   const postingTypes = [
//     {
//       id: "active",
//       label: "Active ",
//       icon: <Briefcase size={20} />,
//       color: "bg-blue-500",
//       description:
//         "Post jobs that are open now. Candidates can apply immediately. Ideal for urgent hiring needs.",
//     },
//     {
//       id: "future",
//       label: "Future ",
//       icon: <Calendar size={20} />,
//       color: "bg-purple-500",
//       description:
//         "Schedule job postings to go live on a future date. Great for planning ahead (e.g., internships starting next semester).",
//     },
//     {
//       id: "college",
//       label: "College Specific Posting",
//       icon: <GraduationCap size={20} />,
//       color: "bg-emerald-500",
//       description:
//         "Target students from specific colleges only. Pricing is tiered — more colleges may unlock discounts. Helps in campus recruitment drives.",
//     },
//   ];

//   // Opportunity Types with styling
//   const opportunityTypes = [
//     {
//       id: "job",
//       label: "Job",
//       icon: <Briefcase size={40} className="text-blue-600" />,
//       bgColor: "bg-blue-50",
//       borderColor: "border-blue-200",
//       textColor: "text-blue-800",
//     },
//     {
//       id: "internship",
//       label: "Internship",
//       icon: <GraduationCap size={40} className="text-purple-600" />,
//       bgColor: "bg-purple-50",
//       borderColor: "border-purple-200",
//       textColor: "text-purple-800",
//     },
//     {
//       id: "project",
//       label: "Project",
//       icon: <Briefcase size={40} className="text-emerald-600" />,
//       bgColor: "bg-emerald-50",
//       borderColor: "border-emerald-200",
//       textColor: "text-emerald-800",
//     },
//   ];

//   // Filter out 'project' when posting type is 'future'
//   const filteredOpportunities = opportunityTypes.filter(
//     (opp) => !(selectedPostingType === "future" && opp.id === "project")
//   );

//   // Dynamic description based on selected posting type
//   const getDescription = (opportunityId) => {
//     switch (selectedPostingType) {
//       case "active":
//         return "Start hiring immediately";
//       case "future":
//         return "Schedule for later";
//       case "college":
//         return opportunityId === "internship"
//           ? "Target college students for internships"
//           : opportunityId === "job"
//           ? "Post roles for campus hiring"
//           : "Assign academic or research projects";
//       default:
//         return "Create a new opportunity";
//     }
//   };

//   const handleSelectOpportunity = (type) => {
//     setSelectedOpportunityType(type);
//     navigate("/recruiter-post-job-intern-details", {
//       state: {
//         jobStatus: selectedPostingType,
//         opportunityType: type,
//         postingType: selectedPostingType,
//       },
//     });
//   };


//   useEffect(() => {
//   setSelectedOpportunityType(null);
//   }, [selectedPostingType]); 

//   return (
//     <MainLayout>
//       <div className="min-h-screen px-4 py-6 bg-gray-50 sm:px-6 lg:px-8">
//         <div className="max-w-2xl mx-auto">
//           {/* Header */}
//           <div className="mb-8 text-center">
//             <h1 className="text-3xl font-extrabold text-gray-800">
//               Post a New Opportunity
//             </h1>
//             <p className="mt-2 text-lg text-gray-600">
//               Choose your posting type and opportunity category to get started.
//             </p>
//           </div>

//           {/* Step 1: Posting Type Tabs */}
//           <div className="p-5 mb-8 bg-white shadow rounded-xl">
//             <h2 className="mb-4 font-semibold text-gray-700">
//               Step 1: Choose the type of posting?
//             </h2>
//             <div className="flex flex-wrap gap-4">
//               {/* {postingTypes.map((type) => (
//                 <button
//                   key={type.id}
//                   onClick={() => setSelectedPostingType(type.id)}
//                   title={type.description}
//                   className={`group flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
//                     selectedPostingType === type.id
//                       ? `${type.color} text-white shadow-sm`
//                       : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                   }`}
//                 >
//                   {type.icon}
//                   <span>{type.label}</span>
      
//                   <Info
//                     size={14}
//                     className="transition-opacity opacity-70 group-hover:opacity-100"
//                   />
//                 </button>
//               ))} */}


//               {postingTypes.map((type) => (
//   <div key={type.id} className="group relative">
//     <button
//       onClick={() => setSelectedPostingType(type.id)}
//       className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
//         selectedPostingType === type.id
//           ? `${type.color} text-white shadow-sm`
//           : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//       }`}
//     >
//       {type.icon}
//       <span>{type.label}</span>
//       <Info size={14} className="opacity-70" />
//     </button>

//     {/* Tooltip Popup */}
//     <div className="absolute left-1/2 bottom-full mb-2 z-10 w-64 -translate-x-1/2 px-3 py-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
//       {type.description}
//       <div className="absolute top-full left-1/2 w-2 h-2 -translate-x-1/2 -mt-1 bg-gray-800 rotate-45"></div>
//     </div>
//   </div>
// ))}
//             </div>
//           </div>

//           {/* Step 2: Opportunity Cards (Single Column) */}
//           <div className="space-y-5">
//             {filteredOpportunities.map((opportunity) => (
//               <div
//                 key={opportunity.id}
//                 onClick={() => handleSelectOpportunity(opportunity.label)}
//                 className={`cursor-pointer p-6 border rounded-xl shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
//                   selectedOpportunityType === opportunity.id
//                     ? `${opportunity.borderColor} ${opportunity.bgColor} border-2 ring-2 ring-offset-2 ring-blue-500`
//                     : `${opportunity.borderColor} ${opportunity.bgColor}`
//                 }`}
//               >
//                 <div className="flex items-start justify-between">
//                   <div className="flex items-start gap-4">
//                     <div className={`p-3 rounded-xl ${opportunity.bgColor}`}>
//                       {opportunity.icon}
//                     </div>
//                     <div>
//                       <h3
//                         className={`text-lg font-semibold ${opportunity.textColor}`}
//                       >
//                         {opportunity.label}
//                       </h3>
//                       <p
//                         className={`mt-1 text-sm ${opportunity.textColor} opacity-80`}
//                       >
//                         {getDescription(opportunity.id)}
//                       </p>
//                     </div>
//                   </div>
//                   <ChevronRight
//                     size={24}
//                     className="flex-shrink-0 mt-1 text-gray-400"
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Info Banner */}
//           <div className="p-5 mt-8 bg-white border-l-4 border-blue-500 rounded-lg shadow-sm">
//             <p className="text-sm text-gray-700">
//               <span className="font-medium text-blue-700">Tip:</span> Active
//               Jobs publish right away. Future Jobs can be scheduled. College
//               Specific Postings help you reach students directly through
//               academic channels.
//             </p>
//           </div>

//           {/* Subtle Footer */}
//           {/* <div className="mt-6 text-xs text-center text-gray-500">
//           All opportunities can be edited or paused anytime from your dashboard.
//         </div> */}
//         </div>
//       </div>
//     </MainLayout>
//   );
// };

// export default RecruiterPostOpportunitySelector;

















































// src/pages/recruiter/RecruiterPostOpportunitySelector.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Briefcase,
  Calendar,
  GraduationCap,
  ChevronRight,
  Info,
} from "lucide-react";
import MainLayout from "../../../components/layout/MainLayout";

const RecruiterPostOpportunitySelector = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialPostingType =
    location.state?.preselectedPostingType &&
    ["active", "future", "college"].includes(location.state.preselectedPostingType)
      ? location.state.preselectedPostingType
      : "active";

  const [selectedPostingType, setSelectedPostingType] = useState(initialPostingType);
  const [selectedOpportunityType, setSelectedOpportunityType] = useState(null);

    // Posting Types with icons and colors
  const postingTypes = [
    {
      id: "active",
      label: "Active ",
      icon: <Briefcase size={20} />,
      color: "bg-blue-500",
      description:
        "Post jobs that are open now. Candidates can apply immediately. Ideal for urgent hiring needs.",
    },
    {
      id: "future",
      label: "Future ",
      icon: <Calendar size={20} />,
      color: "bg-purple-500",
      description:
        "Schedule job postings to go live on a future date. Great for planning ahead (e.g., internships starting next semester).",
    },
    {
      id: "college",
      label: "College Specific Posting",
      icon: <GraduationCap size={20} />,
      color: "bg-emerald-500",
      description:
        "Target students from specific colleges only. Pricing is tiered — more colleges may unlock discounts. Helps in campus recruitment drives.",
    },
  ];

  // Opportunity Types with styling
  const opportunityTypes = [
    {
      id: "job",
      label: "Job",
      icon: <Briefcase size={40} className="text-blue-600" />,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
    },
    {
      id: "internship",
      label: "Internship",
      icon: <GraduationCap size={40} className="text-purple-600" />,
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-800",
    },
    {
      id: "project",
      label: "Project",
      icon: <Briefcase size={40} className="text-emerald-600" />,
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      textColor: "text-emerald-800",
    },
  ];

  //NEW: Check if posting type is preselected (from header/dashboard)
  const isPreselected = location.state?.preselectedPostingType !== undefined;

  const filteredOpportunities = opportunityTypes.filter(
    (opp) => !(selectedPostingType === "future" && opp.id === "project")
  );
  // Dynamic description based on selected posting type
  const getDescription = (opportunityId) => {
    switch (selectedPostingType) {
      case "active":
        return "Start hiring immediately";
      case "future":
        return "Schedule for later";
      case "college":
        return opportunityId === "internship"
          ? "Target college students for internships"
          : opportunityId === "job"
          ? "Post roles for campus hiring"
          : "Assign academic or research projects";
      default:
        return "Create a new opportunity";
    }
  };

  const handleSelectOpportunity = (type) => {
    setSelectedOpportunityType(type);
    navigate("/recruiter-post-job-intern-details", {
      state: {
        jobStatus: selectedPostingType,
        opportunityType: type,
        postingType: selectedPostingType,
      },
    });
  };

  useEffect(() => {
    setSelectedOpportunityType(null);
  }, [selectedPostingType]);

  return (
    <MainLayout>
      <div className="min-h-screen px-4 py-6 bg-gray-50 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-extrabold text-gray-800">
              Post a New Opportunity
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              {/*Dynamic subheading */}
              {isPreselected 
                ? `Posting as: ${selectedPostingType.toUpperCase()} • Choose opportunity type below`
                : "Choose your posting type and opportunity category to get started."
              }
            </p>
          </div>

          {/*CONDITIONAL: Hide posting type tabs on desktop if preselected */}
          {!isPreselected || window.innerWidth < 1024 ? (
            <div className="p-5 mb-8 bg-white shadow rounded-xl">
              <h2 className="mb-4 font-semibold text-gray-700">
                Step 1: Choose the type of posting?
              </h2>
              <div className="flex flex-wrap gap-4">
                {postingTypes.map((type) => (
                  <div key={type.id} className="group relative">
                    <button
                      onClick={() => setSelectedPostingType(type.id)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                        selectedPostingType === type.id
                          ? `${type.color} text-white shadow-sm`
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {type.icon}
                      <span>{type.label}</span>
                      <Info size={14} className="opacity-70" />
                    </button>
                    {/* Tooltip - unchanged */}
                    <div className="absolute left-1/2 bottom-full mb-2 z-10 w-64 -translate-x-1/2 px-3 py-2 text-xs text-white bg-gray-800 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
                      {type.description}
                      <div className="absolute top-full left-1/2 w-2 h-2 -translate-x-1/2 -mt-1 bg-gray-800 rotate-45"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            //Hidden on desktop when preselected, but keep in DOM for mobile
            <div className="hidden lg:block p-5 mb-8 bg-white shadow rounded-xl">
              <p className="text-sm text-gray-500">
                Posting type: <span className="font-medium capitalize">{selectedPostingType}</span>
              </p>
            </div>
          )}

          {/* Step 2: Opportunity Cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {filteredOpportunities.map((opportunity) => (
              <div
                key={opportunity.id}
                onClick={() => handleSelectOpportunity(opportunity.label)}
                className={`cursor-pointer p-6 border rounded-xl shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
                  selectedOpportunityType === opportunity.id
                    ? `${opportunity.borderColor} ${opportunity.bgColor} border-2 ring-2 ring-offset-2 ring-blue-500`
                    : `${opportunity.borderColor} ${opportunity.bgColor}`
                }`}
              >
                {/* ... content unchanged ... */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${opportunity.bgColor}`}>
                      {opportunity.icon}
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${opportunity.textColor}`}>
                        {opportunity.label}
                      </h3>
                      <p className={`mt-1 text-sm ${opportunity.textColor} opacity-80`}>
                        {getDescription(opportunity.id)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={24} className="flex-shrink-0 mt-1 text-gray-400" />
                </div>
              </div>
            ))}
          </div>

          {/* Info Banner - UNCHANGED */}
          <div className="p-5 mt-8 bg-white border-l-4 border-blue-500 rounded-lg shadow-sm">
            <p className="text-sm text-gray-700">
              <span className="font-medium text-blue-700">Tip:</span> Active
              Jobs publish right away. Future Jobs can be scheduled. College
              Specific Postings help you reach students directly through
              academic channels.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RecruiterPostOpportunitySelector;