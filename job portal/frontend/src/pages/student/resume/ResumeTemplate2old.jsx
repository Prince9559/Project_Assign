// // src/components/ResumeTemplate2.jsx
// import React,{useState, useEffect} from 'react';
// import { userData } from './userData';
// import MainLayout from "../../../components/layout/MainLayout";
// import FeedRightSidebar from "../feed/FeedRightSidebar";

// const ResumeTemplate2 = () => {
//   const {
//     firstName,
//     lastName,
//     profilePic,
//     phone,
//     email,
//     address,
//     objective,
//     skills,
//     education,
//     workHistory,
//     certifications,
//   } = userData;

//   const [isDownloading, setIsDownloading] = useState(false);
//   const [isEditing, setIsEditing] = useState(true); // Controls visibility of edit UI
  

  
//   // ----FOr  pdf download
//   const handleDownload = async () => {
//     setIsDownloading(true);
//     setIsEditing(false); // Hide edit controls

//     // Small delay to let React re-render without edit UI
//     setTimeout(async () => {
//       try {
//         const html2pdf = (await import("html2pdf.js")).default;
//         const element = document.getElementById("resume");

//         // Inject print-optimized CSS
//         const style = document.createElement("style");
//         style.innerHTML = `
//           @media print {
//             body { -webkit-print-color-adjust: exact; }
//             .no-print { display: none !important; }
//             .avoid-page-break { page-break-inside: avoid; break-inside: avoid; }
//             .skills-grid, .languages-grid {
//               column-count: 2;
//               column-gap: 20px;
//             }
//             .skills-grid li, .languages-grid li {
//               break-inside: avoid;
//             }
//           }
//           @page {
//             size: A4;
//             margin: 2mm;
//           }
//         `;
//         document.head.appendChild(style);

//         await html2pdf()
//           .from(element)
//           .set({
//             margin: 10,
//             filename: "temp2.pdf",
//             // filename: `${resumeData.personal.firstName}_${resumeData.personal.lastName}_Resume.pdf`,
//             html2canvas: {
//               scale: 4,
//               useCORS: true,
//               dpi:192
//             },
//             jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
//           })
//           .save();

//         document.head.removeChild(style);
//       } catch (error) {
//         console.error("PDF failed:", error);
//         alert("PDF generation failed. Try again.");
//       } finally {
//         setIsEditing(true);
//         setIsDownloading(false);
//       }
//     }, 100);
//   };

//   return (
//     <MainLayout>
//       <div
//         id="resume"
//         className="max-w-5xl p-6 mx-auto bg-white border border-gray-200 shadow-lg"
//       >
//         {/* Header */}
//         <div className="p-4 text-center text-white bg-orange-500">
//           <h1 className="text-3xl font-bold">
//             {firstName} {lastName}
//           </h1>
//         </div>

//         <div className="flex flex-col mt-6 md:flex-row">
//           {/* Left Column */}
//           <div className="p-4 space-y-6 md:w-1/2">
//             <div>
//               <h2 className="text-lg font-bold tracking-wide text-gray-800 uppercase">
//                 Resume Objective
//               </h2>
//               <p className="mt-2 leading-relaxed text-gray-700">{objective}</p>
//             </div>

//             <div>
//               <h2 className="text-lg font-bold tracking-wide text-gray-800 uppercase">
//                 Professional Skills
//               </h2>
//               <div className="mt-2 space-y-3">
//                 {skills.map((skill, idx) => (
//                   <div key={idx}>
//                     <strong>{skill}</strong>
//                     <ul className="ml-2 text-gray-700 list-disc list-inside">
//                       <li>Developed full redesigns of existing websites...</li>
//                       <li>Designed, implemented and monitored web pages...</li>
//                     </ul>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <h2 className="text-lg font-bold tracking-wide text-gray-800 uppercase">
//                 Certifications
//               </h2>
//               <ul className="mt-2 text-gray-700 list-disc list-inside">
//                 {certifications.map((cert, idx) => (
//                   <li key={idx}>{cert}</li>
//                 ))}
//               </ul>
//             </div>
//           </div>

//           {/* Right Column */}
//           <div className="p-4 space-y-6 md:w-1/2">
//             <div>
//               <h2 className="text-lg font-bold tracking-wide text-gray-800 uppercase">
//                 Contact
//               </h2>
//               <div className="mt-2 space-y-1 text-gray-700">
//                 <p>
//                   <strong>Address:</strong> {address}
//                 </p>
//                 <p>
//                   <strong>Phone:</strong> {phone}
//                 </p>
//                 <p>
//                   <strong>Email:</strong> {email}
//                 </p>
//               </div>
//             </div>

//             <div>
//               <h2 className="text-lg font-bold tracking-wide text-gray-800 uppercase">
//                 Skills
//               </h2>
//               <ul className="mt-2 space-y-1 text-gray-700 list-disc list-inside">
//                 <li>Usability testing</li>
//                 <li>Visual design</li>
//                 <li>Problem-solving</li>
//                 <li>Communication</li>
//                 <li>Time management</li>
//                 <li>Adobe PhotoShop & Illustrator</li>
//                 <li>Sketch</li>
//                 <li>HTML5 & CSS3</li>
//               </ul>
//             </div>

//             <div>
//               <h2 className="text-lg font-bold tracking-wide text-gray-800 uppercase">
//                 Education
//               </h2>
//               <div className="mt-2 space-y-3">
//                 {education.map((edu, idx) => (
//                   <div key={idx}>
//                     <p className="font-medium">{edu.degree}</p>
//                     <p className="text-sm text-gray-600">
//                       {edu.school} – {edu.location}
//                     </p>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div>
//               <h2 className="text-lg font-bold tracking-wide text-gray-800 uppercase">
//                 Work History
//               </h2>
//               <div className="mt-2 space-y-4">
//                 {workHistory.map((job, idx) => (
//                   <div key={idx}>
//                     <p className="font-medium">{job.title}</p>
//                     <p className="text-sm text-gray-600">
//                       {job.company} – {job.location}
//                     </p>
//                     <p className="text-xs text-gray-500">{job.period}</p>
//                     <p className="mt-1 text-gray-700">{job.description}</p>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <button
//         onClick={handleDownload}
//         disabled={isDownloading}
//         className={`w-full flex items-center justify-center gap-2 px-4 py-3 mt-4 font-medium text-white rounded-lg shadow ${
//           isDownloading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
//         }`}
//       >
//         {isDownloading ? "Generating..." : "📄 Download PDF"}
//       </button>
//     </MainLayout>
//   );
// };

// export default ResumeTemplate2;



// src/components/ResumeTemplate2.jsx
import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import {getImageUrl} from "../../../../utils"

// Default fallback data (in case API returns incomplete object)
const DEFAULT_RESUME_DATA = {
  firstName: "John",
  lastName: "Doe",
  profilePic: "uploads/profile_unknown_1757554881418.jpeg",
  phone: "(123) 456-7890",
  email: "john.doe@example.com",
  address: "123 Main St, Anytown, ST 12345",
  objective: "Collaborative junior UX designer specializing in front-end development. Experienced with all stages of the development cycle for dynamic web projects.",
  skills: [
    { name: "Design", details: ["Developed collateral such as display, marketing and packaging materials to support product branding strategies.", "Completed full redesigns of existing websites to improve navigation and enhance visuals increasing search engine rankings by 30%."] },
    { name: "Problem-solving", details: ["Analyzed user feedback to influence future design updates...", "Created and updated trend boards..."] },
    { name: "Project Management", details: ["Owned more than 100 projects per year...", "Coordinated, created and scheduled content..."] }
  ],
  education: [
    { degree: "Bachelor of Arts, Graphic Design", school: "The Art Institute", location: "Dallas, TX" }
  ],
  workHistory: [
    { title: "Junior UX Designer", company: "GowraTech, LLC", location: "Dallas, TX", period: "02/2023 - Current", description: "Worked on wireframes and prototypes for client projects." },
    { title: "Graphic Designer Intern", company: "Paladin", location: "Dallas, TX", period: "02/2022 - 02/2023", description: "Assisted senior designers with layout and asset preparation." }
  ],
  certifications: [
    "UX & UI Design Certificate - Noble Desktop's Online Bootcamp - 2023"
  ]
};

const ResumeTemplate2 = forwardRef(({ resumeData = {} }, ref) => {
  // Merge with defaults to avoid undefined errors
  const data = { ...DEFAULT_RESUME_DATA, ...resumeData };

  const {
    firstName,
    lastName,
    profilePic,
    phone,
    email,
    address,
    objective,
    skills = [],
    education = [],
    workHistory = [],
    certifications = []
  } = data;

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
            margin: 2mm;
          }
          .resume-container {
            width: 210mm;
            height: 297mm;
            padding: 5mm;
            box-sizing: border-box;
          }
        `;
        document.head.appendChild(style);

        await html2pdf()
          .from(element)
          .set({
            margin: 0,
            filename: `${firstName}_${lastName}_Resume.pdf`,
            html2canvas: { scale: 3, useCORS: true },
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

  return (
    <>
      <div
        ref={resumeRef}
        className="relative max-w-5xl mx-auto bg-white shadow-lg resume-container"
        style={{
          fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
          lineHeight: 1.6,
          color: '#333',
          fontSize: '10pt'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 text-white bg-orange-500">
          <h1 className="text-3xl font-bold">{firstName} {lastName}</h1>
          {profilePic && (
            <img
              src={getImageUrl(profilePic)}
              alt={`${firstName} ${lastName}`}
              className="object-cover w-24 h-24 border-2 border-white rounded-full"
            />
          )}
        </div>

        <div className="flex flex-col gap-6 mt-6 md:flex-row">
          {/* Left Column */}
          <div className="space-y-6 md:w-2/3">
            {/* Resume Objective */}
            <section>
              <h2 className="pb-1 mb-2 text-lg font-bold tracking-wide text-gray-800 uppercase border-b-2 border-orange-400">Resume Objective</h2>
              <p className="leading-relaxed text-gray-700">{objective || "No objective provided."}</p>
            </section>

            {/* Professional Skills */}
            <section>
              <h2 className="pb-1 mb-2 text-lg font-bold tracking-wide text-gray-800 uppercase border-b-2 border-orange-400">Professional Skills</h2>
              <div className="space-y-4">
                {skills.length > 0 ? skills.map((skill, idx) => (
                  <div key={idx}>
                    <h3 className="font-semibold text-gray-800">{skill.name}</h3>
                    <ul className="mt-1 ml-4 text-gray-700 list-disc">
                      {(skill.details || []).map((detail, i) => (
                        <li key={i}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                )) : <p className="italic text-gray-500">No skills listed.</p>}
              </div>
            </section>

            {/* Certifications */}
            <section>
              <h2 className="pb-1 mb-2 text-lg font-bold tracking-wide text-gray-800 uppercase border-b-2 border-orange-400">Certifications</h2>
              <ul className="ml-4 text-gray-700 list-disc">
                {certifications.length > 0 ? certifications.map((cert, idx) => (
                  <li key={idx}>{cert}</li>
                )) : <li className="italic text-gray-500">None</li>}
              </ul>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-6 md:w-1/3">
            {/* Contact */}
            <section>
              <h2 className="pb-1 mb-2 text-lg font-bold tracking-wide text-gray-800 uppercase border-b-2 border-orange-400">Contact</h2>
              <div className="space-y-1 text-gray-700">
                <p><strong>Address:</strong> {address || "Not provided"}</p>
                <p><strong>Phone:</strong> {phone || "Not provided"}</p>
                <p><strong>Email:</strong> {email || "Not provided"}</p>
              </div>
            </section>

            {/* Skills (General) */}
            <section>
              <h2 className="pb-1 mb-2 text-lg font-bold tracking-wide text-gray-800 uppercase border-b-2 border-orange-400">Skills</h2>
              <ul className="ml-4 text-gray-700 list-disc">
                <li>Usability testing</li>
                <li>Visual design</li>
                <li>Problem-solving</li>
                <li>Communication</li>
                <li>Time management</li>
                <li>Adobe Photoshop & Illustrator</li>
                <li>Sketch</li>
                <li>HTML5 & CSS3</li>
              </ul>
            </section>

            {/* Education */}
            <section>
              <h2 className="pb-1 mb-2 text-lg font-bold tracking-wide text-gray-800 uppercase border-b-2 border-orange-400">Education</h2>
              <div className="space-y-3">
                {education.length > 0 ? education.map((edu, idx) => (
                  <div key={idx}>
                    <p className="font-medium">{edu.degree}</p>
                    <p className="text-sm text-gray-600">{edu.school} – {edu.location}</p>
                  </div>
                )) : <p className="italic text-gray-500">No education listed.</p>}
              </div>
            </section>

            {/* Work History */}
            <section>
              <h2 className="pb-1 mb-2 text-lg font-bold tracking-wide text-gray-800 uppercase border-b-2 border-orange-400">Work History</h2>
              <div className="space-y-4">
                {workHistory.length > 0 ? workHistory.map((job, idx) => (
                  <div key={idx}>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-gray-600">{job.company} – {job.location}</p>
                    <p className="text-xs text-gray-500">{job.period}</p>
                    <p className="mt-1 text-gray-700">{job.description || "No description available."}</p>
                  </div>
                )) : <p className="italic text-gray-500">No work history listed.</p>}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Centered Download Button */}
      <div className="flex justify-center mt-6">
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

export default ResumeTemplate2;