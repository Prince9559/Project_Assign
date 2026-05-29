// import React, { useState, useEffect } from 'react';
// import { userDetailsApi } from '../../../api/userDetailsApi';
// import preview_resume1 from '../../../assets/resume1Preview.png';
// import Header from "../../../components/shared/Header"

// import ResumeTemplate1 from './ResumeTemplate1'; // Modern Professional
// import ResumeTemplate2 from './ResumeTemplate2'; // Clean & Minimal
// import ResumeTemplate3 from './ResumeTemplate3'; // Corporate Blue
// import ResumeTemplate4 from './ResumeTemplate4'; // Professional Marketing

// const TemplateSelector = () => {
//   const [resumeData, setResumeData] = useState(null);
//   const [selectedTemplateId, setSelectedTemplateId] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Replace with actual user ID (from JWT, route, or context)
//   const userId = 104; // ← TEMPORARY — replace with real user ID
//   const token = localStorage.getItem('authToken'); // ← or from context

//   // Fetch resume data on mount
//   useEffect(() => {
//     const fetchResumeData = async () => {
//       try {
//         setLoading(true);
//         const data = await userDetailsApi.getResumeData(userId, token);

//         // CLEAN & NORMALIZE DATA — handle nulls, fallbacks
//         const cleanedData = {
//           personal: {
//             firstName: data.personal?.firstName || "First Name",
//             lastName: data.personal?.lastName || "Last Name",
//             jobTitle: data.personal?.jobTitle || "Job Title",
//             profilePic: data.personal?.profilePic || "https://via.placeholder.com/150",
//             phone: data.personal?.phone || "+000-000-0000",
//             email: data.personal?.email || "email@example.com",
//             address: data.personal?.address || "City, Country",
//             website: data.personal?.website || "",
//             linkedin: data.personal?.linkedin || "",
//             profileSummary: data.personal?.profileSummary || "Passionate professional seeking new opportunities."
//           },
//           skills: Array.isArray(data.skills) ? data.skills.filter(Boolean) : [],
//           languages: Array.isArray(data.languages)
//             ? data.languages.map(lang => ({
//                 name: lang.name || "Unknown",
//                 level: lang.level || "Intermediate"
//               }))
//             : [{ name: "English", level: "Native" }],
//           education: Array.isArray(data.education)
//             ? data.education.map(edu => ({
//                 degree: edu.degree || "Degree",
//                 school: edu.school || "School Name",
//                 location: edu.location || "N/A",
//                 year: edu.year || "Year",
//                 description: Array.isArray(edu.description) ? edu.description : []
//               }))
//             : [],
//           workHistory: Array.isArray(data.workHistory)
//             ? data.workHistory.map(job => ({
//                 title: job.title || "Job Title",
//                 company: job.company || "Company Name",
//                 location: job.location || "Remote",
//                 period: job.period || "Start – End",
//                 description: Array.isArray(job.description) ? job.description : [
//                   "Contributed to key projects and delivered results.",
//                   "Collaborated with cross-functional teams."
//                 ]
//               }))
//             : [],
//           certifications: Array.isArray(data.certifications) ? data.certifications.filter(Boolean) : [],
//           references: Array.isArray(data.references) ? data.references : []
//         };

//         setResumeData(cleanedData);
//       } catch (err) {
//         console.error("Failed to load resume data:", err);
//         setError("Could not load your resume data. Please try again later.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchResumeData();
//   }, [userId, token]);

//   // Template config
//   const templates = [
//     {
//       id: 1,
//       name: "Modern Professional",
//       component: ResumeTemplate1,
//       preview: preview_resume1,
//       color: "bg-blue-50"
//     },
//     {
//       id: 2,
//       name: "Clean & Minimal",
//       component: ResumeTemplate2,
//       preview: "https://via.placeholder.com/300x400?text=Template+2",
//       color: "bg-orange-50"
//     },
//     {
//       id: 3,
//       name: "Corporate Blue",
//       component: ResumeTemplate3,
//       preview: "https://via.placeholder.com/300x400?text=Template+3",
//       color: "bg-teal-50"
//     },
//     {
//       id: 4,
//       name: "Professional Marketing",
//       component: ResumeTemplate4,
//       preview: "https://via",
//       color: "bg-slate-50"
//     },
//   ];

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="p-8 text-center">
//           <div className="w-12 h-12 mx-auto mb-4 border-4 border-gray-300 rounded-full border-t-blue-500 animate-spin"></div>
//           <p className="text-gray-600">Loading your resume data...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="p-6 text-center text-red-600 rounded-lg bg-red-50">
//           <p>{error}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="px-4 py-2 mt-4 text-white bg-red-600 rounded hover:bg-red-700"
//           >
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const SelectedTemplateComponent = templates.find(t => t.id === selectedTemplateId)?.component;

//   return (
//     <div className="flex flex-col min-h-screen bg-gray-50">
//       {/* Header (if needed later) */}
//       <Header/>

//       <div className="flex flex-1">
//         {/* Sidebar (if needed later) */}
//         {/* <Sidebar /> */}

//         <div className="flex-1 p-6">
//           <h1 className="mb-6 text-2xl font-bold text-gray-800">Choose Your Resume Template</h1>

//           {/* Show selected template preview if any */}
//           {selectedTemplateId && SelectedTemplateComponent && (
//             <div className="p-6 mb-8 bg-white rounded-lg shadow-lg">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-xl font-semibold">
//                   Preview: {templates.find(t => t.id === selectedTemplateId)?.name}
//                 </h2>
//                 <button
//                   onClick={() => setSelectedTemplateId(null)}
//                   className="px-4 py-2 text-sm text-blue-600 hover:underline"
//                 >
//                   ← Back to Templates
//                 </button>
//               </div>
//               <div className="pt-4 border-t">
//                 <SelectedTemplateComponent resumeData={resumeData} />
//               </div>
//             </div>
//           )}

//           {/* Template Grid */}
//           {!selectedTemplateId && (
//             <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
//               {templates.map((template) => (
//                 <div
//                   key={template.id}
//                   className={`rounded-lg shadow-md overflow-hidden border ${template.color} transition-transform hover:scale-105 cursor-pointer`}
//                 >
//                   <img
//                     src={template.preview}
//                     alt={template.name}
//                     className="object-cover w-full h-64"
//                   />
//                   <div className="p-4">
//                     <h3 className="font-semibold text-gray-800">{template.name}</h3>
//                     <button
//                       onClick={() => setSelectedTemplateId(template.id)}
//                       className="w-full px-4 py-2 mt-2 text-white transition bg-blue-600 rounded hover:bg-blue-700"
//                     >
//                       Select
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TemplateSelector;









// -------------------the good one

// src/pages/TemplateSelectorPage.jsx
// import React from "react";
// import { Link } from "react-router-dom";
// import resume1Preview from "../../../assets/Resume1.png";
// import resume2Preview from "../../../assets/Resume2.png";
// import resume3Preview from "../../../assets/Resume3.png";
// import resume4Preview from "../../../assets/Resume4.png";
// import resume1going from "../../../assets/Resume1going.png";
// import MainLayout from "../../../components/layout/MainLayout";
// import FeedRightSidebar from "../feed/FeedRightSidebar";

// //Template data
// const templates = [
//   {
//     id: "1",
//     name: "Modern Professional",
//     preview: resume1going,
//     color: "bg-blue-50",
//     to: "/resume-builder/1",
//     canDownload: true,
//   },
//   {
//     id: "2",
//     name: "Clean & Minimal",
//     preview: resume2Preview,
//     color: "bg-orange-50",
//     to: "/resume-template2",
//     canDownload: true,
//   },
//   {
//     id: "3",
//     name: "Corporate Blue",
//     preview: resume3Preview,
//     color: "bg-teal-50",
//     to: "/resume-template3",
//     canDownload: true,
//   },
//   {
//     id: "4",
//     name: "Professional Marketing",
//     preview: resume4Preview,
//     color: "bg-slate-50",
//     to: "/resume-template4",
//     canDownload: false,
//   },
// ];

// const TemplateSelector = () => {
//   return (
//     <MainLayout>
//       <div className="flex justify-center min-h-screen px-2 bg-gray-100 lg:px-8">
//         <div className="flex-grow hidden lg:block"></div>

//         <div className="min-h-screen p-6 bg-gray-50">
//           <div className="mx-auto max-w-7xl">
//             <h1 className="mb-8 text-3xl font-bold text-gray-800">
//               Choose Your Resume Template
//             </h1>

//             <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
//               {templates.map((template) => (
//                 <Link
//                   key={template.id}
//                   to={template.to}
//                   className={`block rounded-xl shadow-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all duration-200 ${template.color}`}
//                 >
//                   <div className="flex items-center justify-center h-64 bg-white">
//                     <img
//                       src={template.preview}
//                       alt={template.name}
//                       className="object-contain w-full h-full p-4"
//                     />
//                   </div>
//                   <div className="p-5 bg-white">
//                     <h3 className="text-lg font-semibold text-gray-800">
//                       {template.name}
//                     </h3>
//                     <button className="w-full py-2 mt-3 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700">
//                       Use This Template
//                     </button>
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           </div>
//         </div>
//         <aside className="hidden lg:block w-full max-w-[350px] p-2 sticky top-4 h-fit">
//           <FeedRightSidebar />
//         </aside>
//         <div className="flex-grow hidden lg:block"></div>
//       </div>
//     </MainLayout>
//   );
// };

// export default TemplateSelector;








import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import resume1Preview from "../../../assets/Resume1.png";
import resume2Preview from "../../../assets/Resume2.png";
import resume3Preview from "../../../assets/Resume3.png";
import resume4Preview from "../../../assets/Resume4.png";
import resume5Preview from "../../../assets/Resume5.png";
import resume1going from "../../../assets/Resume1going.png";
import MainLayout from "../../../components/layout/MainLayout";
import FeedRightSidebar from "../feed/FeedRightSidebar";

import useResumeData from "../../../hooks/useResumeData"

//Template data
const templates = [
  // {
  //   id: "1",
  //   name: "Modern Professional",
  //   preview: resume1going,
  //   color: "bg-blue-50",
  //   to: "/resume-builder/1",
  //   canDownload: true,
  // },
  {
    id: "2",
    name: "Clean & Minimal",
    preview: resume2Preview,
    color: "bg-orange-50",
    to: "/resume-template2",
    canDownload: false,
  },
  {
    id: "3",
    name: "Corporate Blue",
    preview: resume3Preview,
    color: "bg-teal-50",
    to: "/resume-template3",
    canDownload: false,
  },
  {
    id: "4",
    name: "Professional Marketing",
    preview: resume4Preview,
    color: "bg-slate-50",
    to: "/resume-template4",
    canDownload: false,
  },
  {
    id: "5",
    name: "Modern and Sleek",
    preview: resume5Preview,
    color: "bg-cyan-50",
    to: "/resume-template5",
    canDownload: false,
  },
];

import ResumeTemplate2 from './ResumeTemplate2';
import ResumeTemplate3 from "./ResumeTemplate3";
import ResumeTemplate4 from "./ResumeTemplate4";
import ResumeTemplate5 from "./ResumeTemplate5";

const TemplateSelector = () => {
  // Create refs for each non-downloadable template
  const template2Ref = React.useRef();
  const template3Ref = React.useRef();
  const template4Ref = React.useRef();
  const template5Ref = React.useRef();


  const { user, token } = useSelector((state) => state.auth);

  const { resumeData, loading, error } = useResumeData(user?.id, token);
  console.log("resume data loaded",resumeData);

  const handleUseTemplate = (templateId) => {
    if (templateId == "2") {
      template2Ref.current?.download();
    }

    if (templateId == "3") {
      template3Ref.current?.download();
    }

    if (templateId == "4") {
      template4Ref.current?.download();
    }

    if (templateId == "5") {
      template5Ref.current?.download();
    }
    // Add more cases as needed
  };

  // Show loader while fetching
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-lg text-gray-600">Loading your resume data...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    console.error("Resume load error:", error);
  }
  return (
    <MainLayout>
      <div className="flex justify-center min-h-screen px-2 bg-gray-100 lg:px-8">
        <div className="flex-grow hidden lg:block"></div>

        <div className="min-h-screen p-6 bg-gray-50">
          <div className="mx-auto max-w-7xl">
            <h1 className="mb-8 text-3xl font-bold text-gray-800">
              Choose Your Resume Template
            </h1>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-2">
              {templates.map((template) =>
                template.canDownload ? (
                  <Link
                    key={template.id}
                    to={template.to}
                    className={`block rounded-xl shadow-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all duration-200 ${template.color}`}
                  >
                    <div className="flex items-center justify-center h-64 bg-white">
                      <img
                        src={template.preview}
                        alt={template.name}
                        className="object-contain w-full h-full p-4"
                      />
                    </div>
                    <div className="p-5 bg-white">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {template.name}
                      </h3>
                      <button className="w-full py-2 mt-3 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700">
                        Use This Template
                      </button>
                    </div>
                  </Link>
                ) : (
                  <div
                    key={template.id}
                    className={`block rounded-xl shadow-lg overflow-hidden border-2 border-transparent hover:border-blue-500 transition-all duration-200 ${template.color}`}
                  >
                    {/* preview  */}

                    <div className="flex items-center justify-center h-64 p-2 bg-white">
                      <Link key={template.id} to={template.to}>
                        <div className="flex items-center justify-center h-64 bg-white">
                          <img
                            src={template.preview}
                            alt={template.name}
                            className="object-contain w-full h-full p-4"
                          />
                        </div>
                      </Link>
                      {/* Hidden actual component  */}
                      {template.id == 2 ? (
                        <div className="hidden">
                          <ResumeTemplate2
                            ref={template2Ref}
                            resumeData={resumeData}
                          />
                        </div>
                      ) : (
                        console.log("template 2")
                      )}

                      {template.id == 3 ? (
                        <div className="hidden">
                          <ResumeTemplate3
                            ref={template3Ref}
                            resumeData={resumeData}
                          />
                        </div>
                      ) : (
                        console.log("template 3")
                      )}

                      {template.id == 4 ? (
                        <div className="hidden">
                          <ResumeTemplate4
                            ref={template4Ref}
                            resumeData={resumeData}
                          />
                        </div>
                      ) : (
                        console.log("template 4")
                      )}

                      {template.id == 5 ? (
                        <div className="hidden">
                          <ResumeTemplate5
                            ref={template5Ref}
                            resumeData={resumeData}
                          />
                        </div>
                      ) : (
                        console.log("template 5")
                      )}
                    </div>
                    <div className="p-5 bg-white">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {template.name}
                      </h3>
                      <button
                        onClick={() => handleUseTemplate(template.id)}
                        className="w-full py-2 mt-3 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
                      >
                        Use This Template
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
        {/* <aside className="hidden lg:block w-full max-w-[350px] p-2 sticky top-4 h-fit">
          <FeedRightSidebar />
        </aside> */}
        <div className="flex-grow hidden lg:block"></div>
      </div>
    </MainLayout>
  );
};

export default TemplateSelector;