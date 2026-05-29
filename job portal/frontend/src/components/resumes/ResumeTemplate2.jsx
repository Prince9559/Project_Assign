// src/components/ResumeTemplate2.jsx
import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { userData } from './userData';

const ResumeTemplate2 = forwardRef(({ resumeData = {} }, ref) => {
  const {
    firstName,
    lastName,
    profilePic,
    phone,
    email,
    address,
    objective,
    skills,
    education,
    workHistory,
    certifications,
  } = userData;

  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditing, setIsEditing] = useState(true); // Controls visibility of edit UI
  
  const resumeRef = useRef(null);
  
  // ----FOr  pdf download
    const handleDownload = async () => {
    setIsDownloading(true);

    // Small delay to allow UI to settle (e.g., hide buttons if needed)
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
        `;
        document.head.appendChild(style);

        await html2pdf()
          .from(element)
          .set({
            margin: 10,
            filename: `${firstName}_${lastName}_Resume.pdf`,
            html2canvas: { scale: 3, useCORS: true },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          })
          .save();

        document.head.removeChild(style);
      } catch (error) {
        console.error("PDF failed:", error);
        alert("PDF generation failed. Try again.");
      } finally {
        setIsDownloading(false);
      }
    }, 100);
  };

  // Expose handleDownload to parent
  useImperativeHandle(ref, () => ({
    download: handleDownload,
  }));

  return (
    <>
      <div
        ref={resumeRef}
        id="resume"
        className="max-w-5xl p-6 mx-auto bg-white border border-gray-200 shadow-lg"
      >

      {/* <div
      ref={resumeRef}
      id="resume"
      className="max-w-5xl p-4 mx-auto bg-white border border-gray-200 shadow-sm"
      style={{ transform: "scale(0.7)", transformOrigin: "top left", width: "142%" }}
    > */}
        {/* Header */}
        <div className="p-4 text-center text-white bg-orange-500">
          <h1 className="text-3xl font-bold">
            {firstName} {lastName}
          </h1>
        </div>

        <div className="flex flex-col mt-6 md:flex-row">
          {/* Left Column */}
          <div className="p-4 space-y-6 md:w-1/2">
            <div>
              <h2 className="text-lg font-bold tracking-wide text-gray-800 uppercase">
                Resume Objective
              </h2>
              <p className="mt-2 leading-relaxed text-gray-700">{objective}</p>
            </div>

            <div>
              <h2 className="text-lg font-bold tracking-wide text-gray-800 uppercase">
                Professional Skills
              </h2>
              <div className="mt-2 space-y-3">
                {skills.map((skill, idx) => (
                  <div key={idx}>
                    <strong>{skill}</strong>
                    <ul className="ml-2 text-gray-700 list-disc list-inside">
                      <li>Developed full redesigns of existing websites...</li>
                      <li>Designed, implemented and monitored web pages...</li>
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold tracking-wide text-gray-800 uppercase">
                Certifications
              </h2>
              <ul className="mt-2 text-gray-700 list-disc list-inside">
                {certifications.map((cert, idx) => (
                  <li key={idx}>{cert}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div className="p-4 space-y-6 md:w-1/2">
            <div>
              <h2 className="text-lg font-bold tracking-wide text-gray-800 uppercase">
                Contact
              </h2>
              <div className="mt-2 space-y-1 text-gray-700">
                <p>
                  <strong>Address:</strong> {address}
                </p>
                <p>
                  <strong>Phone:</strong> {phone}
                </p>
                <p>
                  <strong>Email:</strong> {email}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold tracking-wide text-gray-800 uppercase">
                Skills
              </h2>
              <ul className="mt-2 space-y-1 text-gray-700 list-disc list-inside">
                <li>Usability testing</li>
                <li>Visual design</li>
                <li>Problem-solving</li>
                <li>Communication</li>
                <li>Time management</li>
                <li>Adobe PhotoShop & Illustrator</li>
                <li>Sketch</li>
                <li>HTML5 & CSS3</li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg font-bold tracking-wide text-gray-800 uppercase">
                Education
              </h2>
              <div className="mt-2 space-y-3">
                {education.map((edu, idx) => (
                  <div key={idx}>
                    <p className="font-medium">{edu.degree}</p>
                    <p className="text-sm text-gray-600">
                      {edu.school} – {edu.location}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold tracking-wide text-gray-800 uppercase">
                Work History
              </h2>
              <div className="mt-2 space-y-4">
                {workHistory.map((job, idx) => (
                  <div key={idx}>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-gray-600">
                      {job.company} – {job.location}
                    </p>
                    <p className="text-xs text-gray-500">{job.period}</p>
                    <p className="mt-1 text-gray-700">{job.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className={`w-full flex items-center justify-center gap-2 px-4 py-3 mt-4 font-medium text-white rounded-lg shadow ${
          isDownloading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isDownloading ? "Generating..." : "📄 Download PDF"}
      </button>
    </>
  )
}
)

export default ResumeTemplate2;