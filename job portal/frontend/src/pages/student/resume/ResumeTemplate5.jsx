// import React from "react";

// const PROFILE_IMG = "https://cdn.builder.io/api/v1/image/assets%2F06f124fc220842cea9e89b59c61cf57b%2Fac81c58a15bf4e418424e7db0c118189?format=webp&width=800";

// export default function Index() {
//   // Dummy data object
//   const resumeData = {
//     personal: {
//       name: "OLIVIA WILSON",
//       title: "Graphics Designer",
//       photo: PROFILE_IMG,
//       phone: "+123-456-7890",
//       email: "hello@reallygreatsite.com",
//       website: "www.reallygreatsite.com",
//       address: "123 Anywhere St., Any City, ST 12345"
//     },
//     profile: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
//     education: [
//       {
//         degree: "Bachelor of Design",
//         institution: "Wardiere University",
//         period: "2006 - 2008"
//       },
//       {
//         degree: "Bachelor of Design",
//         institution: "Wardiere University", 
//         period: "2006 - 2008"
//       }
//     ],
//     expertise: [
//       "Digital Marketing",
//       "Branding",
//       "Copywriting",
//       "SEO"
//     ],
//     languages: [
//       "English",
//       "French"
//     ],
//     workExperience: [
//       {
//         period: "2020 - 2023",
//         company: "Ginyard International Co.",
//         position: "Product Design Manager",
//         responsibilities: [
//           "Working with the wider development team.",
//           "Manage website design, content, and SEO Marketing, Branding and Logo Design"
//         ]
//       },
//       {
//         period: "2019 - 2020",
//         company: "Arowwai Industries",
//         position: "Product Design Manager",
//         responsibilities: [
//           "Working with the wider development team.",
//           "Manage website design, content, and SEO Marketing, Branding and Logo Design"
//         ]
//       },
//       {
//         period: "2017 - 2019",
//         company: "Ginyard International Co.",
//         position: "Product Design Manager",
//         responsibilities: [
//           "Working with the wider development team.",
//           "Manage website design, content, and SEO Marketing, Branding and Logo Design"
//         ]
//       },
//       {
//         period: "2017 - 2019",
//         company: "Arowwai Industries",
//         position: "Product Design Manager",
//         responsibilities: [
//           "Working with the wider development team.",
//           "Manage website design, content, and SEO Marketing, Branding and Logo Design"
//         ]
//       }
//     ],
//     references: [
//       {
//         name: "Bailey Dupont",
//         company: "Wardiere Inc.",
//         position: "CEO",
//         phone: "123-456-7890",
//         email: "hello@reallygreatsite.com"
//       },
//       {
//         name: "Harumi Kobayashi",
//         company: "Wardiere Inc.",
//         position: "CEO", 
//         phone: "123-456-7890",
//         email: "hello@reallygreatsite.com"
//       }
//     ]
//   };

//   return (
//     <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4">
//       {/* Main Resume Container */}
//       <div className="w-full max-w-4xl bg-white shadow-2xl">
//         <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] min-h-screen">

//           {/* Left Sidebar */}
//           <aside className="flex flex-col gap-6 p-6 ">
            
//             {/* Profile Photo */}
//             <div className="flex justify-center">
//               <div className="w-48 h-56 p-1 bg-white border-2 border-gray-400">
//                 <img 
//                   src={resumeData.personal.photo} 
//                   alt="Profile" 
//                   className="object-cover w-full h-full"
//                 />
//               </div>
//             </div>

//             {/* Contact Information */}
//             <div className="space-y-3">
//               <div className="flex items-center gap-3">
//                 <div className="flex items-center justify-center w-5 h-5 bg-gray-600 rounded-full">
//                   <span className="text-xs text-white">📞</span>
//                 </div>
//                 <span className="text-sm text-gray-800">{resumeData.personal.phone}</span>
//               </div>
//               <div className="flex items-center gap-3">
//                 <div className="flex items-center justify-center w-5 h-5 bg-gray-600 rounded-full">
//                   <span className="text-xs text-white">✉️</span>
//                 </div>
//                 <span className="text-sm text-gray-800">{resumeData.personal.email}</span>
//               </div>
//               <div className="flex items-center gap-3">
//                 <div className="flex items-center justify-center w-5 h-5 bg-gray-600 rounded-full">
//                   <span className="text-xs text-white">🌐</span>
//                 </div>
//                 <span className="text-sm text-gray-800">{resumeData.personal.website}</span>
//               </div>
//               <div className="flex items-center gap-3">
//                 <div className="flex items-center justify-center w-5 h-5 bg-gray-600 rounded-full">
//                   <span className="text-xs text-white">📍</span>
//                 </div>
//                 <span className="text-sm leading-tight text-gray-800">{resumeData.personal.address}</span>
//               </div>
//             </div>

//             {/* Education Section */}
//             <div>
//               <h3 className="text-base font-bold text-black mb-4 bg-[#d0d0d0] py-2 px-3 -mx-3">Education</h3>
//               <div className="space-y-4">
//                 {resumeData.education.map((edu, index) => (
//                   <div key={index}>
//                     <h4 className="mb-1 text-sm font-bold text-black">{edu.degree}</h4>
//                     <p className="text-sm text-gray-800">{edu.institution}</p>
//                     <p className="text-xs text-gray-600">{edu.period}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Expertise Section */}
//             <div>
//               <h3 className="text-base font-bold text-black mb-4 bg-[#d0d0d0] py-2 px-3 -mx-3">Expertise</h3>
//               <div className="space-y-2">
//                 {resumeData.expertise.map((skill, index) => (
//                   <p key={index} className="text-sm text-gray-800">{skill}</p>
//                 ))}
//               </div>
//             </div>

//             {/* Language Section */}
//             <div>
//               <h3 className="text-base font-bold text-black mb-4 bg-[#d0d0d0] py-2 px-3 -mx-3">Language</h3>
//               <div className="space-y-2">
//                 {resumeData.languages.map((language, index) => (
//                   <p key={index} className="text-sm text-gray-800">{language}</p>
//                 ))}
//               </div>
//             </div>
//           </aside>

//           {/* Right Content */}
//           <main className="bg-white">
//             {/* Header with beige background */}
//             <div className="bg-[#efe6e3] px-8 py-6 mb-0">
//               <h1 className="mb-2 text-4xl font-black tracking-wider text-black">
//                 {resumeData.personal.name}
//               </h1>
//               <h2 className="text-lg tracking-wide text-gray-700">
//                 {resumeData.personal.title}
//               </h2>
//             </div>

//             <div className="px-8 py-6">
//               {/* Profile Section */}
//               <div className="mb-6">
//                 <div className="flex items-center mb-3">
//                   <div className="flex items-center justify-center w-5 h-5 mr-3 ounded-full">
//                     <span className="text-xs text-white">👤</span>
//                   </div>
//                   <h3 className="text-lg font-bold text-black">Profile</h3>
//                 </div>
//                 <p className="pl-8 text-sm leading-relaxed text-gray-700">
//                   {resumeData.profile}
//                 </p>
//               </div>

//               {/* Work Experience Section */}
//               <div className="mb-6">
//                 <div className="flex items-center mb-4">
//                   <div className="flex items-center justify-center w-5 h-5 mr-3 bg-gray-700 rounded-full">
//                     <span className="text-xs text-white">💼</span>
//                   </div>
//                   <h3 className="text-lg font-bold text-black">Work Experience</h3>
//                 </div>

//                 <div className="pl-8 space-y-5">
//                   {resumeData.workExperience.map((job, index) => (
//                     <div key={index} className="flex">
//                       <div className="flex-shrink-0 w-20">
//                         <div className="pr-4 mr-4 text-xs font-semibold text-gray-600 border-r border-gray-400">
//                           {job.period}
//                         </div>
//                       </div>
//                       <div className="flex-1">
//                         <h4 className="mb-1 text-base font-bold text-black">{job.company}</h4>
//                         <p className="mb-2 text-sm text-gray-600">{job.position}</p>
//                         <ul className="space-y-1">
//                           {job.responsibilities.map((resp, respIndex) => (
//                             <li key={respIndex} className="flex items-start text-xs text-gray-700">
//                               <span className="mt-1 mr-2 text-gray-600">•</span>
//                               <span>{resp}</span>
//                             </li>
//                           ))}
//                         </ul>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* References Section */}
//               <div>
//                 <div className="flex items-center mb-4">
//                   <div className="flex items-center justify-center w-5 h-5 mr-3 bg-gray-700 rounded-full">
//                     <span className="text-xs text-white">📋</span>
//                   </div>
//                   <h3 className="text-lg font-bold text-black">References</h3>
//                 </div>

//                 <div className="grid grid-cols-1 gap-6 pl-8 md:grid-cols-2">
//                   {resumeData.references.map((ref, index) => (
//                     <div key={index}>
//                       <h4 className="mb-1 text-base font-bold text-black">{ref.name}</h4>
//                       <p className="mb-2 text-sm text-gray-600">{ref.company} / {ref.position}</p>
//                       <div className="space-y-1">
//                         <div className="text-xs text-gray-700">
//                           <span className="font-semibold">Phone:</span> {ref.phone}
//                         </div>
//                         <div className="text-xs text-gray-700">
//                           <span className="font-semibold">Email:</span> {ref.email}
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </main>
//         </div>
//       </div>
//     </div>
//   );
// }




























// // src/components/ResumeTemplate5.jsx
// import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
// import { getImageUrl } from '../../../../utils';

// //  FULL default resume data — matches your structure exactly
// const DEFAULT_RESUME_DATA = {
//   personal: {
//     name: "OLIVIA WILSON",
//     title: "Graphics Designer",
//     photo: "https://cdn.builder.io/api/v1/image/assets%2F06f124fc220842cea9e89b59c61cf57b%2Fac81c58a15bf4e418424e7db0c118189?format=webp&width=800",
//     phone: "+123-456-7890",
//     email: "hello@reallygreatsite.com",
//     website: "www.reallygreatsite.com",
//     address: "123 Anywhere St., Any City, ST 12345"
//   },
//   profile: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
//   education: [
//     {
//       degree: "Bachelor of Design",
//       institution: "Wardiere University",
//       period: "2006 - 2008"
//     },
//     {
//       degree: "Master of Visual Arts",
//       institution: "Royal College of Art",
//       period: "2008 - 2010"
//     }
//   ],
//   expertise: [
//     "Digital Marketing",
//     "Branding",
//     "Copywriting",
//     "SEO",
//     "UI/UX Design",
//     "Adobe Creative Suite"
//   ],
//   languages: ["English", "French", "Spanish"],
//   workExperience: [
//     {
//       period: "2020 - 2023",
//       company: "Ginyard International Co.",
//       position: "Product Design Manager",
//       responsibilities: [
//         "Led a team of 8 designers to deliver brand-consistent digital experiences.",
//         "Managed website design, content, and SEO Marketing, Branding and Logo Design."
//       ]
//     },
//     {
//       period: "2019 - 2020",
//       company: "Arowwai Industries",
//       position: "Senior Graphic Designer",
//       responsibilities: [
//         "Created visual identities for 15+ startup clients.",
//         "Collaborated with marketing to increase engagement by 40%."
//       ]
//     }
//   ],
//   references: [
//     {
//       name: "Bailey Dupont",
//       company: "Wardiere Inc.",
//       position: "CEO",
//       phone: "123-456-7890",
//       email: "bailey.dupont@wardiere.com"
//     },
//     {
//       name: "Harumi Kobayashi",
//       company: "Tokyo Creative Labs",
//       position: "Art Director",
//       phone: "987-654-3210",
//       email: "h.kobayashi@tokyocreative.jp"
//     }
//   ]
// };

// // 🔒 Safety helpers
// const safeGet = (value, fallback = "") => {
//   if (value === null || value === undefined || value === "") return fallback;
//   return String(value).trim();
// };

// const safeArray = (arr) => {
//   if (!Array.isArray(arr)) return [];
//   return arr;
// };

// const ResumeTemplate5 = forwardRef(({ resumeData = {} }, ref) => {
//   // Merge with defaults safely
//   const personal = {
//     // ...DEFAULT_RESUME_DATA.personal,
//     ...(resumeData.personal || {})
//   };

//   const data = {
//     personal,
//     profile: safeGet(resumeData.profile, DEFAULT_RESUME_DATA.profile),
//     education: safeArray(resumeData.education).length > 0 
//       ? safeArray(resumeData.education) 
//       : DEFAULT_RESUME_DATA.education,
//     expertise: safeArray(resumeData.skills).length > 0 
//       ? safeArray(resumeData.skills) 
//       : DEFAULT_RESUME_DATA.expertise,
//     languages: safeArray(resumeData.languages).length > 0 
//       ? safeArray(resumeData.languages) 
//       : DEFAULT_RESUME_DATA.languages,
//     workExperience: safeArray(resumeData.workHistory).length > 0 
//       ? safeArray(resumeData.workHistory) 
//       : DEFAULT_RESUME_DATA.workExperience,
//     references: safeArray(resumeData.references).length > 0 
//       ? safeArray(resumeData.references) 
//       : []
//   };

//   const {
//     personal: {
//       name,
//       title,
//       photo,
//       phone,
//       email,
//       website,
//       address
//     },
//     profile,
//     education,
//     expertise,
//     languages,
//     workExperience,
//     references
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
//             .resume-container {
//             width: 210mm;
//             height: 297mm;
//             padding: 5mm;
//             box-sizing: border-box;
//           }
//         `;
//         document.head.appendChild(style);

//         await html2pdf()
//           .from(element)
//           .set({
//             margin: 0,
//             filename: `${safeGet(name, "Resume")}.pdf`,
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

//   const displayPhoto = photo && photo.trim() !== ""
//     ? getImageUrl(photo)
//     : DEFAULT_RESUME_DATA.personal.photo;

//   return (
//     <>
//       <div
//         ref={resumeRef}
//         className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4"
//       >
//         {/* Main Resume Container */}
//         <div className="w-full max-w-4xl bg-white shadow-2xl">
//           <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] min-h-screen">

//             {/* Left Sidebar */}
//             <aside className="flex flex-col gap-6 p-6">
//               {/* Profile Photo */}
//               <div className="flex justify-center">
//                 <div className="w-48 h-56 p-1 bg-white border-2 border-gray-400">
//                   <img
//                     src={displayPhoto}
//                     alt={safeGet(name)}
//                     className="object-cover w-full h-full"
//                     onError={(e) => {
//                       e.target.src = DEFAULT_RESUME_DATA.personal.photo;
//                     }}
//                   />
//                 </div>
//               </div>

//               {/* Contact Information */}
//               <div className="space-y-3">
//                 {phone && (
//                   <div className="flex items-center gap-3">
//                     <div className="flex items-center justify-center w-5 h-5 bg-gray-600 rounded-full">
//                       <span className="text-xs text-white">📞</span>
//                     </div>
//                     <span className="text-sm text-gray-800">{safeGet(phone)}</span>
//                   </div>
//                 )}
//                 {email && (
//                   <div className="flex items-center gap-3">
//                     <div className="flex items-center justify-center w-5 h-5 bg-gray-600 rounded-full">
//                       <span className="text-xs text-white">✉️</span>
//                     </div>
//                     <span className="text-sm text-gray-800">{safeGet(email)}</span>
//                   </div>
//                 )}
//                 {website && (
//                   <div className="flex items-center gap-3">
//                     <div className="flex items-center justify-center w-5 h-5 bg-gray-600 rounded-full">
//                       <span className="text-xs text-white">🌐</span>
//                     </div>
//                     <span className="text-sm text-gray-800">{safeGet(website)}</span>
//                   </div>
//                 )}
//                 {address && (
//                   <div className="flex items-center gap-3">
//                     <div className="flex items-center justify-center w-5 h-5 bg-gray-600 rounded-full">
//                       <span className="text-xs text-white">📍</span>
//                     </div>
//                     <span className="text-sm leading-tight text-gray-800">{safeGet(address)}</span>
//                   </div>
//                 )}
//               </div>

//               {/* Education Section */}
//               {education.length > 0 && (
//                 <div>
//                   <h3 className="text-base font-bold text-black mb-4 bg-[#d0d0d0] py-2 px-3 -mx-3">Education</h3>
//                   <div className="space-y-4">
//                     {education.map((edu, index) => (
//                       <div key={index}>
//                         <h4 className="mb-1 text-sm font-bold text-black">{safeGet(edu.degree)}</h4>
//                         <p className="text-sm text-gray-800">{safeGet(edu.institution)}</p>
//                         <p className="text-xs text-gray-600">{safeGet(edu.period)}</p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Expertise Section */}
//               {expertise.length > 0 && (
//                 <div>
//                   <h3 className="text-base font-bold text-black mb-4 bg-[#d0d0d0] py-2 px-3 -mx-3">Expertise</h3>
//                   <div className="space-y-2">
//                     {expertise.map((skill, index) => (
//                       <p key={index} className="text-sm text-gray-800">{safeGet(skill)}</p>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Language Section */}
//               {languages.length > 0 && (
//                 <div>
//                   <h3 className="text-base font-bold text-black mb-4 bg-[#d0d0d0] py-2 px-3 -mx-3">Language</h3>
//                   <div className="space-y-2">
//                     {languages.map((language, index) => (
//                       <p key={index} className="text-sm text-gray-800">{safeGet(language)}</p>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </aside>

//             {/* Right Content */}
//             <main className="bg-white">
//               {/* Header with beige background */}
//               <div className="bg-[#efe6e3] px-8 py-6 mb-0">
//                 <h1 className="mb-2 text-4xl font-black tracking-wider text-black">
//                   {safeGet(name)}
//                 </h1>
//                 <h2 className="text-lg tracking-wide text-gray-700">
//                   {safeGet(title)}
//                 </h2>
//               </div>

//               <div className="px-8 py-6">
//                 {/* Profile Section */}
//                 {profile && (
//                   <div className="mb-6">
//                     <div className="flex items-center mb-3">
//                       <div className="flex items-center justify-center w-5 h-5 mr-3 bg-gray-700 rounded-full">
//                         <span className="text-xs text-white">👤</span>
//                       </div>
//                       <h3 className="text-lg font-bold text-black">Profile</h3>
//                     </div>
//                     <p className="pl-8 text-sm leading-relaxed text-gray-700">
//                       {safeGet(profile)}
//                     </p>
//                   </div>
//                 )}

//                 {/* Work Experience Section */}
//                 {workExperience.length > 0 && (
//                   <div className="mb-6">
//                     <div className="flex items-center mb-4">
//                       <div className="flex items-center justify-center w-5 h-5 mr-3 bg-gray-700 rounded-full">
//                         <span className="text-xs text-white">💼</span>
//                       </div>
//                       <h3 className="text-lg font-bold text-black">Work Experience</h3>
//                     </div>

//                     <div className="pl-8 space-y-5">
//                       {workExperience.map((job, index) => (
//                         <div key={index} className="flex">
//                           <div className="flex-shrink-0 w-20">
//                             <div className="pr-4 mr-4 text-xs font-semibold text-gray-600 border-r border-gray-400">
//                               {safeGet(job.period)}
//                             </div>
//                           </div>
//                           <div className="flex-1">
//                             <h4 className="mb-1 text-base font-bold text-black">{safeGet(job.company)}</h4>
//                             <p className="mb-2 text-sm text-gray-600">{safeGet(job.position)}</p>
//                             <ul className="space-y-1">
//                               {(safeArray(job.responsibilities).length > 0
//                                 ? safeArray(job.responsibilities)
//                                 : ["Responsibilities not specified."]
//                               ).map((resp, respIndex) => (
//                                 <li key={respIndex} className="flex items-start text-xs text-gray-700">
//                                   <span className="mt-1 mr-2 text-gray-600">•</span>
//                                   <span>{safeGet(resp)}</span>
//                                 </li>
//                               ))}
//                             </ul>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* References Section */}
//                 {references.length > 0 && (
//                   <div>
//                     <div className="flex items-center mb-4">
//                       <div className="flex items-center justify-center w-5 h-5 mr-3 bg-gray-700 rounded-full">
//                         <span className="text-xs text-white">📋</span>
//                       </div>
//                       <h3 className="text-lg font-bold text-black">References</h3>
//                     </div>

//                     <div className="grid grid-cols-1 gap-6 pl-8 md:grid-cols-2">
//                       {references.map((ref, index) => (
//                         <div key={index}>
//                           <h4 className="mb-1 text-base font-bold text-black">{safeGet(ref.name)}</h4>
//                           <p className="mb-2 text-sm text-gray-600">
//                             {safeGet(ref.company)} / {safeGet(ref.position)}
//                           </p>
//                           <div className="space-y-1">
//                             {ref.phone && (
//                               <div className="text-xs text-gray-700">
//                                 <span className="font-semibold">Phone:</span> {safeGet(ref.phone)}
//                               </div>
//                             )}
//                             {ref.email && (
//                               <div className="text-xs text-gray-700">
//                                 <span className="font-semibold">Email:</span> {safeGet(ref.email)}
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </main>
//           </div>
//         </div>
//       </div>

//       {/* Download Button */}
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

// export default ResumeTemplate5;


















// src/components/ResumeTemplate5.jsx
import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import {getImageUrl} from "../../../../utils"

// Converts any valid date string (e.g., "2023-06-15", "2023-06", "June 2023") → "YYYY-MM"
const normalizeToYearMonth = (dateStr) => {
  if (!dateStr) return "";

  // If already in YYYY-MM format, return as-is
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    return dateStr;
  }

  // If in YYYY-MM-DD format, extract YYYY-MM
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr.substring(0, 7); // "2023-06-15" → "2023-06"
  }

  // Try parsing with Date (fallback for other formats like "2023/06/15", "June 2023", etc.)
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // months are 0-indexed
    return `${year}-${month}`;
  }

  // If all fails, return empty
  return "";
};

// Full default data in API format (so we can map it the same way)
const DEFAULT_API_DATA = {
  personal: {
    firstName: "Olivia",
    lastName: "Wilson",
    jobTitle: "Graphics Designer",
    profilePic: "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_640.png",
    phone: "+123-456-7890",
    email: "hello@reallygreatsite.com",
    address: "123 Anywhere St., Any City, ST 12345",
    website: "www.reallygreatsite.com",
    linkedin: "",
    profileSummary: "Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
  },
  skills: ["Digital Marketing", "Branding", "Copywriting", "SEO", "UI/UX Design"],
  languages: ["English", "French", "Spanish"],
  education: [
    {
      degree: "Bachelor of Design",
      school: "Wardiere University",
      location: "Any City, ST",
      year: "2006 - 2008"
    },
    {
      degree: "Master of Visual Arts",
      school: "Royal College of Art",
      location: "London, UK",
      year: "2008 - 2010"
    }
  ],
  workHistory: [
    {
      title: "Product Design Manager",
      company: "Ginyard International Co.",
      location: "Remote",
      period: "2020 - 2023",
      description: [
        "Led a team of 8 designers to deliver brand-consistent digital experiences.",
        "Managed website design, content, and SEO Marketing, Branding and Logo Design."
      ]
    },
    {
      title: "Senior Graphic Designer",
      company: "Arowwai Industries",
      location: "New York, NY",
      period: "2019 - 2020",
      description: [
        "Created visual identities for 15+ startup clients.",
        "Collaborated with marketing to increase engagement by 40%."
      ]
    }
  ],
  certifications: [],
  references: [
    {
      name: "Bailey Dupont",
      position: "CEO",
      company: "Wardiere Inc.",
      phone: "123-456-7890",
      email: "bailey.dupont@wardiere.com"
    },
    {
      name: "Harumi Kobayashi",
      position: "Art Director",
      company: "Tokyo Creative Labs",
      phone: "987-654-3210",
      email: "h.kobayashi@tokyocreative.jp"
    }
  ]
};

// Helper: safe access
const safeGet = (value, fallback = "") => {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value).trim();
};

const safeArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr;
};

// Transform API data → resume template format
const transformToTemplateData = (apiData) => {
  const p = apiData.personal || {};

  return {
    personal: {
      name: `${safeGet(p.firstName)} ${safeGet(p.lastName)}`.trim() || "Full Name",
      title: safeGet(p.jobTitle),
      photo: safeGet(p.profilePic),
      phone: safeGet(p.phone),
      email: safeGet(p.email),
      website: safeGet(p.website),
      address: safeGet(p.address)
    },
    profile: safeGet(p.profileSummary),
    expertise: safeArray(apiData.skills),
    languages: safeArray(apiData.languages), // already array of strings
    education: safeArray(apiData.education).map(edu => ({
      degree: safeGet(edu.degree),
      institution: safeGet(edu.school), // ← school → institution
      period: safeGet(edu.year)         // ← year → period
    })),
    workExperience: safeArray(apiData.workHistory).map(job => ({
      period: safeGet(job.period),
      company: safeGet(job.company),
      position: safeGet(job.title),             // ← title → position
      responsibilities: safeArray(job.description) // ← description → responsibilities
    })),
    references: safeArray(apiData.references).map(ref => ({
      name: safeGet(ref.name),
      company: safeGet(ref.company),
      position: safeGet(ref.position),
      phone: safeGet(ref.phone),
      email: safeGet(ref.email)
    }))
  };
};

const ResumeTemplate5 = forwardRef(({ resumeData = {} }, ref) => {
  // Use passed data or default
  const apiData = Object.keys(resumeData).length > 0 ? resumeData : DEFAULT_API_DATA;
  
  // Transform once
  const templateData = transformToTemplateData(apiData);

  const {
    personal,
    profile,
    expertise,
    languages,
    education,
    workExperience,
    references
  } = templateData;

  const [isDownloading, setIsDownloading] = useState(false);
  const resumeRef = useRef(null);

  // PDF Download Logic
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
            margin: 0,
            filename: `${personal.name.replace(/\s+/g, '_') || "Resume"}.pdf`,
            html2canvas: { scale: 6, useCORS: true },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
            pagebreak: {mode:'avoid-all'}
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

  const displayPhoto = personal.photo? getImageUrl(personal.photo) : DEFAULT_API_DATA.personal.profilePic;

  return (
    <>
      <div
        ref={resumeRef}
        className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-4"
        // className="resume-container"
      >
        {/* Main Resume Container */}
        <div className="w-full max-w-4xl bg-white shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] min-h-screen">

            {/* Left Sidebar */}
            <aside className="flex flex-col gap-6 p-6">
              {/* Profile Photo */}
              <div className="flex justify-center">
                <div className="w-48 h-56 p-1 bg-white border-2 border-gray-400">
                  <img
                    src={displayPhoto}
                    alt={personal.name}
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      e.target.src = DEFAULT_API_DATA.personal.profilePic;
                    }}
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                {personal.phone && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full">
                      <span className="text-xs text-white">📞</span>
                    </div>
                    <span className="text-sm text-gray-800">{personal.phone}</span>
                  </div>
                )}
                {personal.email && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full">
                      <span className="text-xs text-white">✉️</span>
                    </div>
                    <span className="text-sm text-gray-800">{personal.email}</span>
                  </div>
                )}
                {personal.website && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full">
                      <span className="text-xs text-white">🌐</span>
                    </div>
                    <span className="text-sm text-gray-800">{personal.website}</span>
                  </div>
                )}
                {personal.address && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-5 h-5 rounded-full">
                      <span className="text-xs text-white">📍</span>
                    </div>
                    <span className="text-sm leading-tight text-gray-800">{personal.address}</span>
                  </div>
                )}
              </div>

              {/* Education Section */}
              {education.length > 0 && (
                <div>
                  <h3 className="text-base font-bold text-black mb-4 bg-[#d0d0d0] py-2 px-3 -mx-3">Education</h3>
                  <div className="space-y-4">
                    {education.map((edu, index) => (
                      <div key={index}>
                        <h4 className="mb-1 text-sm font-bold text-black">{edu.degree}</h4>
                        <p className="text-sm text-gray-800">{edu.institution}</p>
                        <p className="text-xs text-gray-600">{edu.period}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Expertise Section */}
              {expertise.length > 0 && (
                <div>
                  <h3 className="text-base font-bold text-black mb-4 bg-[#d0d0d0] py-2 px-3 -mx-3">Expertise</h3>
                  <div className="space-y-2">
                    {expertise.map((skill, index) => (
                      <p key={index} className="text-sm text-gray-800">{skill}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Language Section */}
              {languages.length > 0 && (
                <div>
                  <h3 className="text-base font-bold text-black mb-4 bg-[#d0d0d0] py-2 px-3 -mx-3">Language</h3>
                  <div className="space-y-2">
                    {languages.map((language, index) => (
                      <p key={index} className="text-sm text-gray-800">{language}</p>
                    ))}
                  </div>
                </div>
              )}
            </aside>

            {/* Right Content */}
            <main className="bg-white">
              {/* Header with beige background */}
              <div className="bg-[#efe6e3] px-8 py-6 mb-0">
                <h1 className="mb-2 text-4xl font-black tracking-wider text-black">
                  {personal.name}
                </h1>
                <h2 className="text-lg tracking-wide text-gray-700">
                  {personal.title}
                </h2>
              </div>

              <div className="px-8 py-6">
                {/* Profile Section */}
                {profile && (
                  <div className="mb-6">
                    <div className="flex items-center mb-3">
                      <div className="flex items-center justify-center w-5 h-5 mr-3 rounded-full">
                        <span className="text-xs text-white">👤</span>
                      </div>
                      <h3 className="text-lg font-bold text-black">Profile</h3>
                    </div>
                    <p className="pl-8 text-sm leading-relaxed text-gray-700">
                      {profile}
                    </p>
                  </div>
                )}

                {/* Work Experience Section */}
                {workExperience.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center justify-center w-5 h-5 mr-3 rounded-full">
                        <span className="text-xs text-white">💼</span>
                      </div>
                      <h3 className="text-lg font-bold text-black">Work Experience</h3>
                    </div>

                    <div className="pl-8 space-y-5">
                      {workExperience.map((job, index) => (
                        <div key={index} className="flex">
                          <div className="flex-shrink-0 w-20">
                            <div className="pr-4 mr-4 text-xs font-semibold text-gray-600 border-r border-gray-400">
                              {job.period}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="mb-1 text-base font-bold text-black">{job.company}</h4>
                            <p className="mb-2 text-sm text-gray-600">{job.position}</p>
                            <ul className="space-y-1">
                              {(job.responsibilities.length > 0
                                ? job.responsibilities
                                : ["Responsibilities not specified."]
                              ).map((resp, respIndex) => (
                                <li key={respIndex} className="flex items-start text-xs text-gray-700">
                                  <span className="mt-1 mr-2 text-gray-600">•</span>
                                  <span>{resp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* References Section */}
                {references.length > 0 && (
                  <div>
                    <div className="flex items-center mb-4">
                      <div className="flex items-center justify-center w-5 h-5 mr-3 rounded-full">
                        <span className="text-xs text-white">📋</span>
                      </div>
                      <h3 className="text-lg font-bold text-black">References</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-6 pl-8 md:grid-cols-2">
                      {references.map((ref, index) => (
                        <div key={index}>
                          <h4 className="mb-1 text-base font-bold text-black">{ref.name}</h4>
                          <p className="mb-2 text-sm text-gray-600">
                            {ref.company} / {ref.position}
                          </p>
                          <div className="space-y-1">
                            {ref.phone && (
                              <div className="text-xs text-gray-700">
                                <span className="font-semibold">Phone:</span> {ref.phone}
                              </div>
                            )}
                            {ref.email && (
                              <div className="text-xs text-gray-700">
                                <span className="font-semibold">Email:</span> {ref.email}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </main>
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

export default ResumeTemplate5;