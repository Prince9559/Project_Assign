// // src/components/ResumeTemplate4.jsx
// import React from 'react';
// import { userData } from './userData';
// import MainLayout from "../../../components/layout/MainLayout";
// import FeedRightSidebar from "../feed/FeedRightSidebar";

// const ResumeTemplate4 = () => {
//   // Destructure with safe defaults
//   const {
//     firstName = '',
//     lastName = '',
//     profilePic = 'https://via.placeholder.com/150',
//     phone = '',
//     email = '',
//     address = '',
//     website = '',
//     // Support both 'profileSummary' and fallback to 'objective'
//     profileSummary = userData.objective || '',
//     skills = [],
//     education = [],
//     workHistory = [],
//     languages = [],
//     references = [],
//   } = userData;

//   // Helper: normalize description to array
//   const normalizeDescription = (desc) => {
//     if (!desc) return [];
//     if (Array.isArray(desc)) return desc;
//     if (typeof desc === 'string') return [desc];
//     return [];
//   };

//   return (
//     <MainLayout>
//     <div
//       id="resume"
//       className="max-w-5xl mx-auto overflow-hidden bg-white border border-gray-200 shadow-lg"
//     >
//       {/* Header */}
//       <div className="flex flex-col md:flex-row">
//         {/* Sidebar */}
//         <div className="w-full p-6 space-y-8 text-white md:w-1/3 bg-slate-800">
//           {/* Profile Picture */}
//           <div className="flex justify-center mb-6">
//             <img
//               src={profilePic.trim()} // trim in case of accidental spaces
//               alt={`${firstName} ${lastName}`}
//               className="object-cover w-32 h-32 border-4 border-white rounded-full"
//               onError={(e) => {
//                 e.target.src = 'https://via.placeholder.com/150';
//               }}
//             />
//           </div>

//           {/* Contact */}
//           {(phone || email || address || website) && (
//             <div>
//               <h2 className="mb-3 text-xl font-bold tracking-wide uppercase">Contact</h2>
//               <div className="space-y-3 text-gray-300">
//                 {phone && (
//                   <div className="flex items-center gap-2">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
//                       <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.041 11.041 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C9.083 18 3.917 18 3 17V3.001c0-.55.45-.999 1-.999h2z" />
//                     </svg>
//                     <span>{phone}</span>
//                   </div>
//                 )}
//                 {email && (
//                   <div className="flex items-center gap-2">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
//                       <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                       <path d="M18 8a2 2 0 11-4 0 2 2 0 014 0zM11 15a2 2 0 100-4 2 2 0 000 4z" />
//                     </svg>
//                     <span>{email}</span>
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
//                 {website && (
//                   <div className="flex items-center gap-2">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
//                       <path d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" />
//                     </svg>
//                     <span>{website}</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Education */}
//           {education.length > 0 && (
//             <div>
//               <h2 className="mb-3 text-xl font-bold tracking-wide uppercase">Education</h2>
//               {education.map((edu, idx) => (
//                 <div key={idx} className="mb-4">
//                   <div className="font-medium">{edu.year || ''}</div>
//                   <div className="text-sm text-gray-300">{edu.degree || ''}</div>
//                   <div className="text-sm text-gray-300">{edu.school || ''}</div>
//                   <ul className="mt-1 text-sm text-gray-300 list-disc list-inside">
//                     {normalizeDescription(edu.description).map((desc, i) => (
//                       <li key={i}>{desc}</li>
//                     ))}
//                   </ul>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Skills */}
//           {skills.length > 0 && (
//             <div>
//               <h2 className="mb-3 text-xl font-bold tracking-wide uppercase">Skills</h2>
//               <ul className="space-y-1 text-gray-300 list-disc list-inside">
//                 {skills.map((skill, idx) => (
//                   <li key={idx}>{skill}</li>
//                 ))}
//               </ul>
//             </div>
//           )}

//           {/* Languages */}
//           {languages.length > 0 && (
//             <div>
//               <h2 className="mb-3 text-xl font-bold tracking-wide uppercase">Languages</h2>
//               <ul className="space-y-1 text-gray-300 list-disc list-inside">
//                 {languages.map((lang, idx) => (
//                   <li key={idx}>
//                     {lang.name} ({lang.level || 'N/A'})
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>

//         {/* Main Content */}
//         <div className="w-full p-8 space-y-8 md:w-2/3">
//           {/* Name & Title */}
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800">
//               {firstName} {lastName}
//             </h1>
//             {profileSummary && (
//               <p className="mt-1 text-xl text-gray-600">{profileSummary}</p>
//             )}
//             <div className="w-16 h-0.5 bg-slate-800 mt-2"></div>
//           </div>

//           {/* Profile */}
//           {profileSummary && (
//             <div>
//               <h2 className="mb-3 text-xl font-bold tracking-wide uppercase text-slate-800">Profile</h2>
//               <p className="leading-relaxed text-gray-700">{profileSummary}</p>
//             </div>
//           )}

//           {/* Work Experience */}
//           {workHistory.length > 0 && (
//             <div>
//               <h2 className="mb-3 text-xl font-bold tracking-wide uppercase text-slate-800">Work Experience</h2>
//               <div className="relative pl-6 space-y-6 border-l-2 border-slate-300">
//                 {workHistory.map((job, idx) => (
//                   <div key={idx} className="relative">
//                     <div className="absolute left-0 w-2 h-2 rounded-full top-2 bg-slate-800"></div>
//                     <div className="ml-2">
//                       <div className="flex justify-between">
//                         <h3 className="font-semibold text-gray-800">{job.title || ''}</h3>
//                         <span className="text-sm text-gray-500">{job.period || ''}</span>
//                       </div>
//                       <p className="text-sm text-gray-600">{job.company || ''}</p>
//                       <ul className="mt-2 space-y-1 text-gray-700 list-disc list-inside">
//                         {normalizeDescription(job.description).map((desc, i) => (
//                           <li key={i}>{desc}</li>
//                         ))}
//                       </ul>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* References */}
//           {references.length > 0 && (
//             <div>
//               <h2 className="mb-3 text-xl font-bold tracking-wide uppercase text-slate-800">Reference</h2>
//               <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                 {references.map((ref, idx) => (
//                   <div key={idx} className="space-y-1 text-gray-700">
//                     <p className="font-medium">{ref.name || ''}</p>
//                     <p className="text-sm">{ref.position || ''}</p>
//                     {ref.phone && <p className="text-xs">Phone: {ref.phone}</p>}
//                     {ref.email && <p className="text-xs">Email: {ref.email}</p>}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//     </MainLayout>
//   );
// };

// export default ResumeTemplate4;


// import React from 'react';
// import { userData } from './userData';
// import MainLayout from "../../../components/layout/MainLayout";
// import FeedRightSidebar from "../feed/FeedRightSidebar";

// const ResumeTemplate4 = () => {
//   // Destructure with safe defaults
//   const {
//     firstName = '',
//     lastName = '',
//     profilePic = 'https://via.placeholder.com/150',
//     phone = '',
//     email = '',
//     address = '',
//     website = '',
//     // Support both 'profileSummary' and fallback to 'objective'
//     profileSummary = userData.objective || '',
//     skills = [],
//     education = [],
//     workHistory = [],
//     languages = [],
//     references = [],
//   } = userData;

//   // Helper: normalize description to array
//   const normalizeDescription = (desc) => {
//     if (!desc) return [];
//     if (Array.isArray(desc)) return desc;
//     if (typeof desc === 'string') return [desc];
//     return [];
//   };

//   return (
//     <>
//     <div
//       id="resume"
//       className="max-w-5xl mx-auto overflow-hidden bg-white border border-gray-200 shadow-lg"
//     >
//       {/* Header */}
//       <div className="flex flex-col md:flex-row">
//         {/* Sidebar */}
//         <div className="w-full p-6 space-y-8 text-white md:w-1/3 bg-slate-800">
//           {/* Profile Picture */}
//           <div className="flex justify-center mb-6">
//             <img
//               src={profilePic.trim()} // trim in case of accidental spaces
//               alt={`${firstName} ${lastName}`}
//               className="object-cover w-32 h-32 border-4 border-white rounded-full"
//               onError={(e) => {
//                 e.target.src = 'https://via.placeholder.com/150';
//               }}
//             />
//           </div>

//           {/* Contact */}
//           {(phone || email || address || website) && (
//             <div>
//               <h2 className="mb-3 text-xl font-bold tracking-wide uppercase">Contact</h2>
//               <div className="space-y-3 text-gray-300">
//                 {phone && (
//                   <div className="flex items-center gap-2">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
//                       <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.041 11.041 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C9.083 18 3.917 18 3 17V3.001c0-.55.45-.999 1-.999h2z" />
//                     </svg>
//                     <span>{phone}</span>
//                   </div>
//                 )}
//                 {email && (
//                   <div className="flex items-center gap-2">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
//                       <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                       <path d="M18 8a2 2 0 11-4 0 2 2 0 014 0zM11 15a2 2 0 100-4 2 2 0 000 4z" />
//                     </svg>
//                     <span>{email}</span>
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
//                 {website && (
//                   <div className="flex items-center gap-2">
//                     <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
//                       <path d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" />
//                     </svg>
//                     <span>{website}</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}

//           {/* Education */}
//           {education.length > 0 && (
//             <div>
//               <h2 className="mb-3 text-xl font-bold tracking-wide uppercase">Education</h2>
//               {education.map((edu, idx) => (
//                 <div key={idx} className="mb-4">
//                   <div className="font-medium">{edu.year || ''}</div>
//                   <div className="text-sm text-gray-300">{edu.degree || ''}</div>
//                   <div className="text-sm text-gray-300">{edu.school || ''}</div>
//                   <ul className="mt-1 text-sm text-gray-300 list-disc list-inside">
//                     {normalizeDescription(edu.description).map((desc, i) => (
//                       <li key={i}>{desc}</li>
//                     ))}
//                   </ul>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Skills */}
//           {skills.length > 0 && (
//             <div>
//               <h2 className="mb-3 text-xl font-bold tracking-wide uppercase">Skills</h2>
//               <ul className="space-y-1 text-gray-300 list-disc list-inside">
//                 {skills.map((skill, idx) => (
//                   <li key={idx}>{skill}</li>
//                 ))}
//               </ul>
//             </div>
//           )}

//           {/* Languages */}
//           {languages.length > 0 && (
//             <div>
//               <h2 className="mb-3 text-xl font-bold tracking-wide uppercase">Languages</h2>
//               <ul className="space-y-1 text-gray-300 list-disc list-inside">
//                 {languages.map((lang, idx) => (
//                   <li key={idx}>
//                     {lang.name} ({lang.level || 'N/A'})
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>

//         {/* Main Content */}
//         <div className="w-full p-8 space-y-8 md:w-2/3">
//           {/* Name & Title */}
//           <div>
//             <h1 className="text-3xl font-bold text-gray-800">
//               {firstName} {lastName}
//             </h1>
//             {profileSummary && (
//               <p className="mt-1 text-xl text-gray-600">{profileSummary}</p>
//             )}
//             <div className="w-16 h-0.5 bg-slate-800 mt-2"></div>
//           </div>

//           {/* Profile */}
//           {profileSummary && (
//             <div>
//               <h2 className="mb-3 text-xl font-bold tracking-wide uppercase text-slate-800">Profile</h2>
//               <p className="leading-relaxed text-gray-700">{profileSummary}</p>
//             </div>
//           )}

//           {/* Work Experience */}
//           {workHistory.length > 0 && (
//             <div>
//               <h2 className="mb-3 text-xl font-bold tracking-wide uppercase text-slate-800">Work Experience</h2>
//               <div className="relative pl-6 space-y-6 border-l-2 border-slate-300">
//                 {workHistory.map((job, idx) => (
//                   <div key={idx} className="relative">
//                     <div className="absolute left-0 w-2 h-2 rounded-full top-2 bg-slate-800"></div>
//                     <div className="ml-2">
//                       <div className="flex justify-between">
//                         <h3 className="font-semibold text-gray-800">{job.title || ''}</h3>
//                         <span className="text-sm text-gray-500">{job.period || ''}</span>
//                       </div>
//                       <p className="text-sm text-gray-600">{job.company || ''}</p>
//                       <ul className="mt-2 space-y-1 text-gray-700 list-disc list-inside">
//                         {normalizeDescription(job.description).map((desc, i) => (
//                           <li key={i}>{desc}</li>
//                         ))}
//                       </ul>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* References */}
//           {references.length > 0 && (
//             <div>
//               <h2 className="mb-3 text-xl font-bold tracking-wide uppercase text-slate-800">Reference</h2>
//               <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
//                 {references.map((ref, idx) => (
//                   <div key={idx} className="space-y-1 text-gray-700">
//                     <p className="font-medium">{ref.name || ''}</p>
//                     <p className="text-sm">{ref.position || ''}</p>
//                     {ref.phone && <p className="text-xs">Phone: {ref.phone}</p>}
//                     {ref.email && <p className="text-xs">Email: {ref.email}</p>}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//     <button className="px-4 py-2 mt-4 text-white bg-blue-600 rounded hover:bg-blue-700"> Download</button>
//     </>
//   );
// };

// export default ResumeTemplate4;



















// src/components/ResumeTemplate4.jsx
import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import {getImageUrl} from "../../../../utils"

// FULL default resume data — complete with all possible fields
const DEFAULT_RESUME_DATA = {
  personal: {
    firstName: "Morgan",
    lastName: "Taylor",
    jobTitle: "Product Manager",
    profilePic: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png",
    phone: "+1 (415) 555-0198",
    email: "morgan.taylor@example.com",
    address: "Seattle, WA",
    website: "www.morgantaylor.io",
    linkedin: "linkedin.com/in/morgantaylor",
    profileSummary:
      "Strategic product leader with 6+ years of experience driving user-centered digital products from concept to scale. Passionate about agile methodologies, data-driven decisions, and cross-functional collaboration."
  },
  skills: [
    "Product Strategy",
    "User Research",
    "Agile & Scrum",
    "Figma",
    "SQL",
    "Jira",
    "Roadmapping",
    "A/B Testing"
  ],
  languages: [
    { name: "English", level: "Native" },
    { name: "German", level: "Conversational" }
  ],
  education: [
    {
      degree: "MBA, Technology Management",
      school: "University of Washington",
      location: "Seattle, WA",
      year: "2018",
      description: ["Specialized in digital product innovation and go-to-market strategy."]
    },
    {
      degree: "B.A. in Communications",
      school: "Portland State University",
      location: "Portland, OR",
      year: "2014",
      description: []
    }
  ],
  workHistory: [
    {
      title: "Senior Product Manager",
      company: "Nexus Labs",
      location: "Remote",
      period: "2021 – Present",
      description: [
        "Led product vision for SaaS analytics platform used by 500+ enterprise clients.",
        "Increased user retention by 35% through iterative UX improvements and feature prioritization.",
        "Collaborated with engineering, design, and sales to align roadmap with business goals."
      ]
    },
    {
      title: "Product Manager",
      company: "GrowthStack Inc.",
      location: "Seattle, WA",
      period: "2018 – 2021",
      description: [
        "Managed end-to-end lifecycle of mobile onboarding experience.",
        "Launched referral program that drove 20% MoM user growth.",
        "Conducted bi-weekly user interviews to inform backlog priorities."
      ]
    }
  ],
  certifications: [
    {
      name: "Certified Scrum Product Owner (CSPO)",
      issuer: "Scrum Alliance",
      date: "2020"
    },
    {
      name: "Google Analytics Certification",
      issuer: "Google",
      date: "2019"
    }
  ],
  references: [
    {
      name: "Dr. Lisa Chen",
      position: "VP of Product, TechGlobal",
      phone: "+1 (206) 555-0142",
      email: "l.chen@techglobal.com"
    },
    {
      name: "James Rivera",
      position: "Engineering Director, Nexus Labs",
      phone: "+1 (415) 555-0187",
      email: "j.rivera@nexuslabs.dev"
    }
  ]
};

// 🔒 Helper functions for safety
const safeGet = (value, fallback = "") => {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value).trim();
};

const safeArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr;
};

const normalizeDescription = (desc) => {
  if (!desc) return [];
  if (Array.isArray(desc)) return desc.map(d => safeGet(d));
  if (typeof desc === 'string') return [safeGet(desc)];
  return [];
};

// Main Component with forwardRef
const ResumeTemplate4 = forwardRef(({ resumeData = {} }, ref) => {
  // Merge with defaults deeply but safely
  const personal = {
    // ...DEFAULT_RESUME_DATA.personal,
    ...(resumeData.personal || {})
  };

  const data = {
    personal,
    skills: safeArray(resumeData.skills).length > 0 
      ? safeArray(resumeData.skills) 
      : DEFAULT_RESUME_DATA.skills,
    languages: safeArray(resumeData.languages).length > 0 
      ? safeArray(resumeData.languages) 
      : [],
    education: safeArray(resumeData.education).length > 0 
      ? safeArray(resumeData.education) 
      : DEFAULT_RESUME_DATA.education,
    workHistory: safeArray(resumeData.workHistory).length > 0 
      ? safeArray(resumeData.workHistory) 
      : DEFAULT_RESUME_DATA.workHistory,
    certifications: safeArray(resumeData.certifications).length > 0 
      ? safeArray(resumeData.certifications) 
      : [],
    references: safeArray(resumeData.references).length > 0 
      ? safeArray(resumeData.references) 
      : []
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
      website,
      profileSummary
    },
    skills,
    languages,
    education,
    workHistory,
    certifications,
    references
  } = data;

  const [isDownloading, setIsDownloading] = useState(false);
  const resumeRef = useRef(null);

  // ---- PDF Download Logic (same as Template 3)
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
            margin: 5mm;
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

  const displayProfilePic = profilePic && profilePic.trim() !== ""
    ? getImageUrl(profilePic)
    : DEFAULT_RESUME_DATA.personal.profilePic;

  return (
    <>
      <div
        ref={resumeRef}
        id="resume"
        className="max-w-5xl mx-auto overflow-hidden bg-white border border-gray-200 shadow-lg"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="w-full p-6 space-y-8 text-white md:w-1/3 bg-slate-800">
            {/* Profile Picture */}
            <div className="flex justify-center mb-6">
              <img
                src={displayProfilePic}
                alt={`${safeGet(firstName)} ${safeGet(lastName)}`}
                className="object-cover w-32 h-32 border-4 border-white rounded-full"
                onError={(e) => {
                  e.target.src = DEFAULT_RESUME_DATA.personal.profilePic;
                }}
              />
            </div>

            {/* Contact */}
            {(phone || email || address || website) && (
              <div>
                <h2 className="mb-3 text-xl font-bold tracking-wide uppercase">Contact</h2>
                <div className="space-y-3 text-gray-300">
                  {phone && (
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.041 11.041 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C9.083 18 3.917 18 3 17V3.001c0-.55.45-.999 1-.999h2z" />
                      </svg>
                      <span>{safeGet(phone)}</span>
                    </div>
                  )}
                  {email && (
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8a2 2 0 11-4 0 2 2 0 014 0zM11 15a2 2 0 100-4 2 2 0 000 4z" />
                      </svg>
                      <span>{safeGet(email)}</span>
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
                  {website && (
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" />
                      </svg>
                      <span>{safeGet(website)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div>
                <h2 className="mb-3 text-xl font-bold tracking-wide uppercase">Education</h2>
                {education.map((edu, idx) => (
                  <div key={idx} className="mb-4">
                    <div className="font-medium">{safeGet(edu.year)}</div>
                    <div className="text-sm text-gray-300">{safeGet(edu.degree)}</div>
                    <div className="text-sm text-gray-300">{safeGet(edu.school)}</div>
                    <ul className="mt-1 text-sm text-gray-300 list-disc list-inside">
                      {normalizeDescription(edu.description).map((desc, i) => (
                        <li key={i}>{desc}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div>
                <h2 className="mb-3 text-xl font-bold tracking-wide uppercase">Skills</h2>
                <ul className="space-y-1 text-gray-300 list-disc list-inside">
                  {skills.map((skill, idx) => (
                    <li key={idx}>{safeGet(skill)}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Languages */}
            {languages.length > 0 && (
              <div>
                <h2 className="mb-3 text-xl font-bold tracking-wide uppercase">Languages</h2>
                <ul className="space-y-1 text-gray-300 list-disc list-inside">
                  {languages.map((lang, idx) => (
                    <li key={idx}>
                      {safeGet(lang.name)} ({safeGet(lang.level, 'N/A')})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Certifications (future-ready) */}
            {certifications.length > 0 && (
              <div>
                <h2 className="mb-3 text-xl font-bold tracking-wide uppercase">Certifications</h2>
                <ul className="space-y-1 text-gray-300 list-disc list-inside">
                  {certifications.map((cert, idx) => (
                    <li key={idx}>
                      <span className="font-medium">{safeGet(cert.name)}</span> — {safeGet(cert.issuer)} ({safeGet(cert.date)})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="w-full p-8 space-y-8 md:w-2/3">
            {/* Name & Title */}
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                {safeGet(firstName)} {safeGet(lastName)}
              </h1>
              {jobTitle && (
                <p className="mt-1 text-xl text-gray-600">{safeGet(jobTitle)}</p>
              )}
              <div className="w-16 h-0.5 bg-slate-800 mt-2"></div>
            </div>

            {/* Profile Summary */}
            {profileSummary && (
              <div>
                <h2 className="mb-3 text-xl font-bold tracking-wide uppercase text-slate-800">Profile</h2>
                <p className="leading-relaxed text-gray-700">{safeGet(profileSummary)}</p>
              </div>
            )}

            {/* Work Experience */}
            {workHistory.length > 0 && (
              <div>
                <h2 className="mb-3 text-xl font-bold tracking-wide uppercase text-slate-800">Work Experience</h2>
                <div className="relative pl-6 space-y-6 border-l-2 border-slate-300">
                  {workHistory.map((job, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute left-0 w-2 h-2 rounded-full top-2 bg-slate-800"></div>
                      <div className="ml-2">
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-gray-800">{safeGet(job.title)}</h3>
                          <span className="text-sm text-gray-500">{safeGet(job.period)}</span>
                        </div>
                        <p className="text-sm text-gray-600">{safeGet(job.company)}</p>
                        <ul className="mt-2 space-y-1 text-gray-700 list-disc list-inside">
                          {normalizeDescription(job.description).map((desc, i) => (
                            <li key={i}>{desc}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* References */}
            {references.length > 0 && (
              <div>
                <h2 className="mb-3 text-xl font-bold tracking-wide uppercase text-slate-800">References</h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {references.map((ref, idx) => (
                    <div key={idx} className="space-y-1 text-gray-700">
                      <p className="font-medium">{safeGet(ref.name)}</p>
                      <p className="text-sm">{safeGet(ref.position)}</p>
                      {ref.phone && <p className="text-xs">Phone: {safeGet(ref.phone)}</p>}
                      {ref.email && <p className="text-xs">Email: {safeGet(ref.email)}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Download Button */}
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

export default ResumeTemplate4;