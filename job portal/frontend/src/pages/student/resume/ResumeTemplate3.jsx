// // src/components/ResumeTemplate3.jsx
// import React, {useState,forwardRef,useImperativeHandle,useRef} from 'react';
// import { userData } from './userData';
// import MainLayout from "../../../components/layout/MainLayout";
// import FeedRightSidebar from "../feed/FeedRightSidebar";
// import { getImageUrl } from '../../../../utils';



// const ResumeTemplate3 = forwardRef(({resumeData={}},ref) => {
//   const { 
//     firstName, lastName, 
//     profilePic, 
//     phone, email, 
//     linkedin, 
//     jobTitle,
//     skills,
//     // languages,
//     education,
//     workHistory,
//     profileSummary
//   } = userData;


//   // Mock languages
//   const languages = [
//     { name: "English", level: "Native" },
//     { name: "Spanish", level: "Intermediate" },
//     { name: "French", level: "Beginner" }
//   ];


//     const [isDownloading, setIsDownloading] = useState(false);
//     const resumeRef = useRef(null);
  
//     // ---- PDF Download Logic
//     const handleDownload = async () => {
//       setIsDownloading(true);
//       setTimeout(async () => {
//         try {
//           const html2pdf = (await import("html2pdf.js")).default;
//           const element = resumeRef.current;
  
//           const style = document.createElement("style");
//           style.innerHTML = `
//             @media print {
//               body { -webkit-print-color-adjust: exact; }
//               .no-print { display: none !important; }
//               .avoid-page-break { page-break-inside: avoid; break-inside: avoid; }
//             }
//             @page {
//               size: A4;
//               margin: 10mm;
//             }
            
//           `;
//           document.head.appendChild(style);
  
//           await html2pdf()
//             .from(element)
//             .set({
//               margin: 5,
//               filename: `${firstName || "Resume"}_${lastName || ""}.pdf`,
//               html2canvas: { scale: 3, useCORS: true },
//               jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
//             })
//             .save();
  
//           document.head.removeChild(style);
//         } catch (error) {
//           console.error("PDF generation failed:", error);
//           alert("Failed to generate PDF. Please try again.");
//         } finally {
//           setIsDownloading(false);
//         }
//       }, 100);
//     };

//   useImperativeHandle(ref, () => ({
//       download: handleDownload,
//     }));

//   return (
//     <>
//     <div ref={resumeRef}
//       id="resume"
//       className="max-w-5xl mx-auto bg-white border border-gray-200 shadow-lg"
//     >
//       {/* Header */}
//       <div className="p-4 text-white bg-teal-600">
//         <div className="flex items-center gap-4">
//           <img
//             src={profilePic}
//             alt={`${firstName} ${lastName}`}
//             className="object-cover w-20 h-20 border-4 border-white rounded-full"
//           />
//           <div>
//             <h1 className="text-3xl font-bold">{firstName} {lastName}</h1>
//             <p className="text-teal-100">{jobTitle}</p>
//           </div>
//         </div>
//       </div>

//       <div className="flex flex-col md:flex-row">
//         {/* Left Column */}
//         <div className="p-6 space-y-6 md:w-1/3 bg-gray-50">
//           <div>
//             <h2 className="pb-1 text-lg font-bold text-gray-800 border-b border-teal-600">CONTACT</h2>
//             <div className="mt-3 space-y-2 text-gray-700">
//               <div className="flex items-center gap-2">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
//                   <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                   <path d="M18 8a2 2 0 11-4 0 2 2 0 014 0zM11 15a2 2 0 100-4 2 2 0 000 4zm5-7a2 2 0 11-4 0 2 2 0 014 0z" />
//                 </svg>
//                 <span>{email}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
//                   <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.041 11.041 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C9.083 18 3.917 18 3 17V3.001c0-.55.45-.999 1-.999h2z" />
//                 </svg>
//                 <span>{phone}</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
//                   <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
//                 </svg>
//                 <span>N.Y., USA</span>
//               </div>
//               <div className="flex items-center gap-2">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
//                   <path d="M13.586 3.586a2 2 0 112.828 2.828l-.707.707A1 1 0 0015 6.586V10a1 1 0 001 1h1a1 1 0 011 1v2a1 1 0 01-1 1h-1a1 1 0 00-1 1v1a1 1 0 01-1 1H8a1 1 0 01-1-1v-1a1 1 0 00-1-1H5a1 1 0 01-1-1v-2a1 1 0 011-1h1a1 1 0 001-1V6.586a1 1 0 00-.293-.707l-.707-.707a2 2 0 012.828-2.828zM10 9.5a1 1 0 000 2h2a1 1 0 000-2h-2z" />
//                 </svg>
//                 <span>{linkedin}</span>
//               </div>
//             </div>
//           </div>

//           <div>
//             <h2 className="pb-1 text-lg font-bold text-gray-800 border-b border-teal-600">PROFILE SUMMARY</h2>
//             <p className="mt-2 leading-relaxed text-gray-700">{profileSummary}</p>
//           </div>

//           <div>
//             <h2 className="pb-1 text-lg font-bold text-gray-800 border-b border-teal-600">SKILLS</h2>
//             <ul className="mt-2 space-y-2 text-gray-700">
//               {skills.map((skill, idx) => (
//                 <li key={idx} className="flex items-center gap-2">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                   </svg>
//                   {skill}
//                 </li>
//               ))}
//             </ul>
//           </div>

//           <div>
//             <h2 className="pb-1 text-lg font-bold text-gray-800 border-b border-teal-600">LANGUAGES</h2>
//             <ul className="mt-2 space-y-2 text-gray-700">
//               {languages.map((lang, idx) => (
//                 <li key={idx} className="flex items-center gap-2">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                   </svg>
//                   {lang.name}: {lang.level}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>

//         {/* Right Column */}
//         <div className="p-6 space-y-6 md:w-2/3">
//           <div>
//             <h2 className="pb-1 text-lg font-bold text-gray-800 border-b border-teal-600">PROFESSIONAL EXPERIENCE</h2>
//             <div className="mt-4 space-y-6">
//               {workHistory.map((job, idx) => (
//                 <div key={idx}>
//                   <p className="font-bold">{job.title}</p>
//                   <p className="text-sm text-gray-600">{job.company}</p>
//                   <p className="text-xs text-gray-500">{job.location} | {job.period}</p>
//                   <ul className="mt-2 space-y-1 text-gray-700 list-disc list-inside">
//                     <li>Developed and executed a comprehensive sales strategy...</li>
//                     <li>Identified and pursued new business opportunities...</li>
//                   </ul>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div>
//             <h2 className="pb-1 text-lg font-bold text-gray-800 border-b border-teal-600">EDUCATION</h2>
//             <div className="mt-4 space-y-4">
//               {education.map((edu, idx) => (
//                 <div key={idx}>
//                   <p className="font-bold">{edu.degree}</p>
//                   <p className="text-sm text-gray-600">{edu.school}</p>
//                   <p className="text-xs text-gray-500">{edu.location} | {edu.year}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//     <div className="flex justify-center mt-6 no-print">
//         <button
//           onClick={handleDownload}
//           disabled={isDownloading}
//           className={`px-6 py-3 font-medium text-white rounded-lg shadow transition ${
//             isDownloading
//               ? "bg-gray-500 cursor-not-allowed"
//               : "bg-blue-600 hover:bg-blue-700"
//           }`}
//         >
//           {isDownloading ? "Generating..." : "📄 Download PDF"}
//         </button>
//       </div>
//     </>
//   );
// });

// export default ResumeTemplate3;


























// // src/components/ResumeTemplate3.jsx
// import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
// // import MainLayout from "../../../components/layout/MainLayout";
// import FeedRightSidebar from "../feed/FeedRightSidebar";
// import { getImageUrl } from '../../../../utils';

// // Default fallback data (matches your structure)
// const DEFAULT_RESUME_DATA = {
//   personal: {
//     firstName: "First",
//     lastName: "Last",
//     jobTitle: "Job Title",
//     profilePic: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png",
//     phone: "",
//     email: "",
//     address: "",
//     website: "",
//     linkedin: "",
//     profileSummary: "Profile summary not provided."
//   },
//   skills: [],
//   languages: [],
//   education: [],
//   workHistory: [],
//   certifications: [],
//   references: []
// };

// const ResumeTemplate3 = forwardRef(({ resumeData = {} }, ref) => {
//   // Merge with defaults to avoid undefined errors
//   const data = { ...DEFAULT_RESUME_DATA, ...resumeData };
//   const {
//     personal: {
//       firstName,
//       lastName,
//       jobTitle,
//       profilePic,
//       phone,
//       email,
//       address,
//       linkedin,
//       profileSummary
//     },
//     skills = [],
//     languages = [],
//     education = [],
//     workHistory = []
//   } = data;

//   const [isDownloading, setIsDownloading] = useState(false);
//   const resumeRef = useRef(null);

//   // ---- PDF Download Logic
//   const handleDownload = async () => {
//     setIsDownloading(true);
//     setTimeout(async () => {
//       try {
//         const html2pdf = (await import("html2pdf.js")).default;
//         const element = resumeRef.current;

//         const style = document.createElement("style");
//         style.innerHTML = `
//           @media print {
//             body { -webkit-print-color-adjust: exact; }
//             .no-print { display: none !important; }
//             .avoid-page-break { page-break-inside: avoid; break-inside: avoid; }
//           }
//           @page {
//             size: A4;
//             margin: 10mm;
//           }
//         `;
//         document.head.appendChild(style);

//         await html2pdf()
//           .from(element)
//           .set({
//             margin: 5,
//             filename: `${firstName || "Resume"}_${lastName || ""}.pdf`,
//             html2canvas: { scale: 3, useCORS: true },
//             jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
//           })
//           .save();

//         document.head.removeChild(style);
//       } catch (error) {
//         console.error("PDF generation failed:", error);
//         alert("Failed to generate PDF. Please try again.");
//       } finally {
//         setIsDownloading(false);
//       }
//     }, 100);
//   };

//   useImperativeHandle(ref, () => ({
//     download: handleDownload,
//   }));

//   return (
//     <>
//       <div
//         ref={resumeRef}
//         id="resume"
//         className="max-w-5xl mx-auto bg-white border border-gray-200 shadow-lg"
//       >
//         {/* Header */}
//         <div className="p-4 text-white bg-teal-600">
//           <div className="flex items-center gap-4">
//             <img
//               src={profilePic || DEFAULT_RESUME_DATA.personal.profilePic}
//               alt={`${firstName} ${lastName}`}
//               className="object-cover w-20 h-20 border-4 border-white rounded-full"
//               onError={(e) => {
//                 e.target.src = DEFAULT_RESUME_DATA.personal.profilePic;
//               }}
//             />
//             <div>
//               <h1 className="text-3xl font-bold">
//                 {firstName} {lastName}
//               </h1>
//               <p className="text-teal-100">{jobTitle}</p>
//             </div>
//           </div>
//         </div>

//         <div className="flex flex-col md:flex-row">
//           {/* Left Column */}
//           <div className="p-6 space-y-6 md:w-1/3 bg-gray-50">
//             <div>
//               <h2 className="pb-1 text-lg font-bold text-gray-800 border-b border-teal-600">
//                 CONTACT
//               </h2>
//               <div className="mt-3 space-y-2 text-gray-700">
//                 {email && (
//                   <div className="flex items-center gap-2">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
//                       <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                       <path d="M18 8a2 2 0 11-4 0 2 2 0 014 0zM11 15a2 2 0 100-4 2 2 0 000 4zm5-7a2 2 0 11-4 0 2 2 0 014 0z" />
//                     </svg>
//                     <span>{email}</span>
//                   </div>
//                 )}
//                 {phone && (
//                   <div className="flex items-center gap-2">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
//                       <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.041 11.041 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C9.083 18 3.917 18 3 17V3.001c0-.55.45-.999 1-.999h2z" />
//                     </svg>
//                     <span>{phone}</span>
//                   </div>
//                 )}
//                 {address && (
//                   <div className="flex items-center gap-2">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
//                       <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
//                     </svg>
//                     <span>{address}</span>
//                   </div>
//                 )}
//                 {linkedin && (
//                   <div className="flex items-center gap-2">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
//                       <path d="M13.586 3.586a2 2 0 112.828 2.828l-.707.707A1 1 0 0015 6.586V10a1 1 0 001 1h1a1 1 0 011 1v2a1 1 0 01-1 1h-1a1 1 0 00-1 1v1a1 1 0 01-1 1H8a1 1 0 01-1-1v-1a1 1 0 00-1-1H5a1 1 0 01-1-1v-2a1 1 0 011-1h1a1 1 0 001-1V6.586a1 1 0 00-.293-.707l-.707-.707a2 2 0 012.828-2.828zM10 9.5a1 1 0 000 2h2a1 1 0 000-2h-2z" />
//                     </svg>
//                     <span>{linkedin}</span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {profileSummary && (
//               <div>
//                 <h2 className="pb-1 text-lg font-bold text-gray-800 border-b border-teal-600">
//                   PROFILE SUMMARY
//                 </h2>
//                 <p className="mt-2 leading-relaxed text-gray-700">{profileSummary}</p>
//               </div>
//             )}

//             {skills.length > 0 && (
//               <div>
//                 <h2 className="pb-1 text-lg font-bold text-gray-800 border-b border-teal-600">
//                   SKILLS
//                 </h2>
//                 <ul className="mt-2 space-y-2 text-gray-700">
//                   {skills.map((skill, idx) => (
//                     <li key={idx} className="flex items-center gap-2">
//                       <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                       </svg>
//                       {skill}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             {languages.length > 0 && (
//               <div>
//                 <h2 className="pb-1 text-lg font-bold text-gray-800 border-b border-teal-600">
//                   LANGUAGES
//                 </h2>
//                 <ul className="mt-2 space-y-2 text-gray-700">
//                   {languages.map((lang, idx) => (
//                     <li key={idx} className="flex items-center gap-2">
//                       <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                       </svg>
//                       {lang.name}: {lang.level}
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </div>

//           {/* Right Column */}
//           <div className="p-6 space-y-6 md:w-2/3">
//             {workHistory.length > 0 && (
//               <div>
//                 <h2 className="pb-1 text-lg font-bold text-gray-800 border-b border-teal-600">
//                   PROFESSIONAL EXPERIENCE
//                 </h2>
//                 <div className="mt-4 space-y-6">
//                   {workHistory.map((job, idx) => (
//                     <div key={idx}>
//                       <p className="font-bold">{job.title}</p>
//                       <p className="text-sm text-gray-600">{job.company}</p>
//                       <p className="text-xs text-gray-500">
//                         {job.location} | {job.period}
//                       </p>
//                       {job.description && job.description.length > 0 ? (
//                         <ul className="mt-2 space-y-1 text-gray-700 list-disc list-inside">
//                           {job.description.map((desc, i) => (
//                             <li key={i}>{desc}</li>
//                           ))}
//                         </ul>
//                       ) : (
//                         <p className="text-gray-500 italic">No description provided.</p>
//                       )}
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {education.length > 0 && (
//               <div>
//                 <h2 className="pb-1 text-lg font-bold text-gray-800 border-b border-teal-600">
//                   EDUCATION
//                 </h2>
//                 <div className="mt-4 space-y-4">
//                   {education.map((edu, idx) => (
//                     <div key={idx}>
//                       <p className="font-bold">{edu.degree}</p>
//                       <p className="text-sm text-gray-600">{edu.school}</p>
//                       <p className="text-xs text-gray-500">
//                         {edu.location} | {edu.year}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Download Button (not printed) */}
//       <div className="flex justify-center mt-6 no-print">
//         <button
//           onClick={handleDownload}
//           disabled={isDownloading}
//           className={`px-6 py-3 font-medium text-white rounded-lg shadow transition ${
//             isDownloading
//               ? "bg-gray-500 cursor-not-allowed"
//               : "bg-blue-600 hover:bg-blue-700"
//           }`}
//         >
//           {isDownloading ? "Generating..." : "📄 Download PDF"}
//         </button>
//       </div>
//     </>
//   );
// });

// export default ResumeTemplate3;


// src/components/ResumeTemplate3.jsx
import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { getImageUrl } from '../../../../utils';

// FULL default resume data — complete structure
const DEFAULT_RESUME_DATA = {
  personal: {
    firstName: "Alex",
    lastName: "Johnson",
    jobTitle: "Senior Software Engineer",
    profilePic: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png",
    phone: "+1 (555) 123-4567",
    email: "alex.johnson@example.com",
    address: "San Francisco, CA",
    website: "www.alexjohnson.dev",
    linkedin: "linkedin.com/in/alexjohnson",
    profileSummary:
      "Results-driven software engineer with 5+ years of experience building scalable web applications. Passionate about clean code, performance, and user-centered design."
  },
  skills: [
    "JavaScript",
    "React",
    "Node.js",
    "TypeScript",
    "PostgreSQL",
    "AWS",
    "Docker",
    "CI/CD"
  ],
  languages: [
    { name: "English", level: "Native" },
    { name: "Spanish", level: "Intermediate" },
    { name: "French", level: "Basic" }
  ],
  education: [
    {
      degree: "B.S. in Computer Science",
      school: "Stanford University",
      location: "Stanford, CA",
      year: "2018"
    },
    {
      degree: "Full-Stack Web Development Certification",
      school: "Dev Academy",
      location: "Online",
      year: "2019"
    }
  ],
  workHistory: [
    {
      title: "Senior Software Engineer",
      company: "Tech Innovations Inc.",
      location: "San Francisco, CA",
      period: "2021 – Present",
      description: [
        "Led development of a microservices architecture serving 2M+ users.",
        "Reduced API latency by 40% through query optimization and caching.",
        "Mentored 3 junior developers and established code review standards."
      ]
    },
    {
      title: "Software Engineer",
      company: "StartupXYZ",
      location: "Remote",
      period: "2019 – 2021",
      description: [
        "Built and maintained React frontend and Node.js backend services.",
        "Integrated third-party payment and analytics systems.",
        "Collaborated with product team to define MVP feature roadmap."
      ]
    }
  ],
  certifications: [],
  references: []
};

// Helper: safely get value or fallback
const safeGet = (value, fallback = "") => {
  if (value === null || value === undefined || value === "") return fallback;
  return value;
};

// Helper: ensure array
const safeArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr;
};

const ResumeTemplate3 = forwardRef(({ resumeData = {} }, ref) => {
  // Deep merge with defaults — but prefer passed data
  const mergedData = {
    personal: {
      ...DEFAULT_RESUME_DATA.personal,
      ...safeGet(resumeData.personal, {}),
    },
    skills: safeArray(resumeData.skills).length > 0 
      ? safeArray(resumeData.skills) 
      : DEFAULT_RESUME_DATA.skills,
    languages: safeArray(resumeData.languages).length > 0 
      ? safeArray(resumeData.languages) 
      : DEFAULT_RESUME_DATA.languages,
    education: safeArray(resumeData.education).length > 0 
      ? safeArray(resumeData.education) 
      : DEFAULT_RESUME_DATA.education,
    workHistory: safeArray(resumeData.workHistory).length > 0 
      ? safeArray(resumeData.workHistory) 
      : DEFAULT_RESUME_DATA.workHistory,
  };

  const {
    personal: {
      firstName,
      lastName,
      jobTitle,
      profilePic,
      phone,
      email,
      address,
      linkedin,
      profileSummary
    },
    skills,
    languages,
    education,
    workHistory
  } = mergedData;

  const [isDownloading, setIsDownloading] = useState(false);
  const resumeRef = useRef(null);

  // ---- PDF Download Logic
  const handleDownload = async () => {
    setIsDownloading(true);
    setTimeout(async () => {
      try {
        const html2pdf = (await import("html2pdf.js")).default;
        const element = resumeRef.current;

        const style = document.createElement("style");
        style.innerHTML = `
          @media print {
            body { -webkit-print-color-adjust: exact; }
            .no-print { display: none !important; }
            .avoid-page-break { page-break-inside: avoid; break-inside: avoid; }
          }
          @page {
            size: A4;
            margin: 10mm;
          }
        `;
        document.head.appendChild(style);

        await html2pdf()
          .from(element)
          .set({
            margin: 5,
            filename: `${safeGet(firstName, "Resume")}_${safeGet(lastName, "")}.pdf`,
            html2canvas: { scale: 5, useCORS: true },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          })
          .save();

        document.head.removeChild(style);
      } catch (error) {
        console.error("PDF generation failed:", error);
        alert("Failed to generate PDF. Please try again.");
      } finally {
        setIsDownloading(false);
      }
    }, 100);
  };

  useImperativeHandle(ref, () => ({
    download: handleDownload,
  }));

  // Ensure profilePic is valid
  const displayProfilePic = profilePic && profilePic.trim() !== "" 
    ? getImageUrl(profilePic) 
    : DEFAULT_RESUME_DATA.personal.profilePic;

  return (
    <>
      <div
        ref={resumeRef}
        id="resume"
        className="max-w-5xl mx-auto bg-white border border-gray-200 shadow-lg"
      >
        {/* Header */}
        <div className="p-4 text-white bg-teal-600">
          <div className="flex items-center gap-4">
            <img
              src={displayProfilePic}
              alt={`${safeGet(firstName)} ${safeGet(lastName)}`}
              className="object-cover w-20 h-20 border-4 border-white rounded-full"
              onError={(e) => {
                e.target.src = DEFAULT_RESUME_DATA.personal.profilePic;
              }}
            />
            <div>
              <h1 className="text-3xl font-bold">
                {safeGet(firstName)} {safeGet(lastName)}
              </h1>
              <p className="text-teal-100">{safeGet(jobTitle)}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Left Column */}
          <div className="p-6 space-y-6 md:w-1/3 bg-gray-50">
            <div>
              <h2 className="pb-1 text-lg font-bold text-gray-800 border-b border-teal-600">
                CONTACT
              </h2>
              <div className="mt-3 space-y-2 text-gray-700">
                {email && (
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8a2 2 0 11-4 0 2 2 0 014 0zM11 15a2 2 0 100-4 2 2 0 000 4zm5-7a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>{safeGet(email)}</span>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.041 11.041 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C9.083 18 3.917 18 3 17V3.001c0-.55.45-.999 1-.999h2z" />
                    </svg>
                    <span>{safeGet(phone)}</span>
                  </div>
                )}
                {address && (
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>{safeGet(address)}</span>
                  </div>
                )}
                {linkedin && (
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.707.707A1 1 0 0015 6.586V10a1 1 0 001 1h1a1 1 0 011 1v2a1 1 0 01-1 1h-1a1 1 0 00-1 1v1a1 1 0 01-1 1H8a1 1 0 01-1-1v-1a1 1 0 00-1-1H5a1 1 0 01-1-1v-2a1 1 0 011-1h1a1 1 0 001-1V6.586a1 1 0 00-.293-.707l-.707-.707a2 2 0 012.828-2.828zM10 9.5a1 1 0 000 2h2a1 1 0 000-2h-2z" />
                    </svg>
                    <span>{safeGet(linkedin)}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="pb-1 text-lg font-bold text-gray-800 border-b border-teal-600">
                PROFILE SUMMARY
              </h2>
              <p className="mt-2 leading-relaxed text-gray-700">
                {safeGet(profileSummary)}
              </p>
            </div>

            <div>
              <h2 className="pb-1 text-lg font-bold text-gray-800 border-b border-teal-600">
                SKILLS
              </h2>
              <ul className="mt-2 space-y-2 text-gray-700">
                {skills.map((skill, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {safeGet(skill)}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="pb-1 text-lg font-bold text-gray-800 border-b border-teal-600">
                LANGUAGES
              </h2>
              <ul className="mt-2 space-y-2 text-gray-700">
                {languages.map((lang, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-teal-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {safeGet(lang.name)}: {safeGet(lang.level)}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div className="p-6 space-y-6 md:w-2/3">
            <div>
              <h2 className="pb-1 text-lg font-bold text-gray-800 border-b border-teal-600">
                PROFESSIONAL EXPERIENCE
              </h2>
              <div className="mt-4 space-y-6">
                {workHistory.map((job, idx) => (
                  <div key={idx}>
                    <p className="font-bold">{safeGet(job.title)}</p>
                    <p className="text-sm text-gray-600">{safeGet(job.company)}</p>
                    <p className="text-xs text-gray-500">
                      {safeGet(job.location)} | {safeGet(job.period)}
                    </p>
                    <ul className="mt-2 space-y-1 text-gray-700 list-disc list-inside">
                      {(safeArray(job.description).length > 0
                        ? safeArray(job.description)
                        : ["Responsibilities and achievements not specified."]
                      ).map((desc, i) => (
                        <li key={i}>{safeGet(desc)}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="pb-1 text-lg font-bold text-gray-800 border-b border-teal-600">
                EDUCATION
              </h2>
              <div className="mt-4 space-y-4">
                {education.map((edu, idx) => (
                  <div key={idx}>
                    <p className="font-bold">{safeGet(edu.degree)}</p>
                    <p className="text-sm text-gray-600">{safeGet(edu.school)}</p>
                    <p className="text-xs text-gray-500">
                      {safeGet(edu.location)} | {safeGet(edu.year)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Download Button (not printed) */}
      <div className="flex justify-center mt-6 no-print">
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`px-6 py-3 font-medium text-white rounded-lg shadow transition ${
            isDownloading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isDownloading ? "Generating..." : "📄 Download PDF"}
        </button>
      </div>
    </>
  );
});

export default ResumeTemplate3;