// src/components/resumes/ResumeTemplate2.jsx
import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { getImageUrl } from '../../../../utils';

// FULL DEFAULT RESUME DATA 
const DEFAULT_RESUME_DATA = {
  personal: {
    firstName: "John",
    lastName: "Doe",
    jobTitle: "Software Engineer",
    profilePic: "",
    phone: "(123) 456-7890",
    email: "john.doe@example.com",
    address: "San Francisco, CA",
    website: "https://johndoe.dev",
    linkedin: "linkedin.com/in/johndoe",
    profileSummary: "Detail-oriented software engineer with 5+ years of experience building scalable web applications. Passionate about clean code, user experience, and continuous learning."
  },
  skills: [
    "JavaScript", "React", "Node.js", "Python", "REST APIs", 
    "Git", "Docker", "AWS", "SQL", "Problem Solving"
  ],
  languages: ["English (Fluent)", "Spanish (Intermediate)"],
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      school: "Stanford University",
      location: "Stanford, CA",
      year: "2018 – 2022",
      description: [
        "Graduated with honors",
        "Relevant coursework: Algorithms, Data Structures, Web Development"
      ]
    }
  ],
  workHistory: [
    {
      title: "Senior Frontend Developer",
      company: "Tech Innovations Inc.",
      location: "Remote",
      period: "2022 – Present",
      description: [
        "Led development of a customer-facing dashboard used by 10k+ users",
        "Reduced page load time by 40% through code splitting and caching",
        "Mentored 3 junior developers and conducted code reviews"
      ]
    },
    {
      title: "Junior Web Developer",
      company: "StartupXYZ",
      location: "San Francisco, CA",
      period: "2020 – 2022",
      description: [
        "Built and maintained responsive UI components using React",
        "Collaborated with UX team to implement design system"
      ]
    }
  ],
  certifications: [
    "AWS Certified Developer – Associate",
    "Google UX Design Professional Certificate"
  ],
  references: []
};

const ResumeTemplate2 = forwardRef(({ resumeData = {} }, ref) => {
  // 🔹 Normalize input: handle both { resumeData: { ... } } and flat { ... }
  let normalizedData = resumeData;
  if (resumeData && typeof resumeData === 'object' && resumeData.resumeData) {
    normalizedData = resumeData.resumeData;
  }

  // 🔹 Merge with full defaults — deep safe fallback
  const data = {
    personal: {
      ...DEFAULT_RESUME_DATA.personal,
      ...(normalizedData?.personal || {})
    },
    skills: Array.isArray(normalizedData?.skills) ? normalizedData.skills : DEFAULT_RESUME_DATA.skills,
    languages: Array.isArray(normalizedData?.languages) ? normalizedData.languages : DEFAULT_RESUME_DATA.languages,
    education: Array.isArray(normalizedData?.education) ? normalizedData.education : DEFAULT_RESUME_DATA.education,
    workHistory: Array.isArray(normalizedData?.workHistory) ? normalizedData.workHistory : DEFAULT_RESUME_DATA.workHistory,
    certifications: Array.isArray(normalizedData?.certifications) ? normalizedData.certifications : DEFAULT_RESUME_DATA.certifications,
    references: Array.isArray(normalizedData?.references) ? normalizedData.references : DEFAULT_RESUME_DATA.references,
  };

  const {
    personal,
    skills,
    education,
    workHistory,
    certifications
  } = data;

  const {
    firstName,
    lastName,
    jobTitle,
    profilePic,
    phone,
    email,
    address,
    website,
    linkedin,
    profileSummary
  } = personal;

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
            filename: `${firstName || "Resume"}_${lastName || ""}.pdf`,
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

  return (
    <>
      <div ref={resumeRef} className="resume-container">
        {/* Header */}
        <div className="flex items-start justify-between p-4 text-white bg-orange-500">
          <div>
            <h1 className="text-3xl font-bold">{firstName} {lastName}</h1>
            {jobTitle && <p className="mt-1 text-lg opacity-90">{jobTitle}</p>}
          </div>
          {profilePic && (
            <img
              src={getImageUrl(profilePic)}
              alt={`${firstName} ${lastName}`}
              className="object-cover w-20 h-20 border-2 border-white rounded-full"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
        </div>

        <div className="flex flex-col gap-6 mt-6 md:flex-row">
          {/* Left Column */}
          <div className="space-y-6 md:w-2/3">
            <section>
              <h2 className="pb-1 mb-2 text-lg font-bold tracking-wide text-gray-800 uppercase border-b-2 border-orange-400">
                Profile Summary
              </h2>
              <p className="leading-relaxed text-gray-700">{profileSummary}</p>
            </section>

            <section>
              <h2 className="pb-1 mb-2 text-lg font-bold tracking-wide text-gray-800 uppercase border-b-2 border-orange-400">
                Certifications
              </h2>
              <ul className="ml-4 text-gray-700 list-disc">
                {certifications.length > 0 ? (
                  certifications.map((cert, idx) => (
                    <li key={idx}>
                      {typeof cert === 'string' ? cert : JSON.stringify(cert)}
                    </li>
                  ))
                ) : (
                  <li className="italic text-gray-500">None listed</li>
                )}
              </ul>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-6 md:w-1/3">
            <section>
              <h2 className="pb-1 mb-2 text-lg font-bold tracking-wide text-gray-800 uppercase border-b-2 border-orange-400">
                Contact
              </h2>
              <div className="space-y-1 text-gray-700">
                {address && <p><strong>Address:</strong> {address}</p>}
                {phone && <p><strong>Phone:</strong> {phone}</p>}
                {email && <p><strong>Email:</strong> {email}</p>}
                {website && <p><strong>Website:</strong> {website}</p>}
                {linkedin && <p><strong>LinkedIn:</strong> {linkedin}</p>}
                {!address && !phone && !email && !website && !linkedin && (
                  <p className="italic text-gray-500">No contact info provided</p>
                )}
              </div>
            </section>

            <section>
              <h2 className="pb-1 mb-2 text-lg font-bold tracking-wide text-gray-800 uppercase border-b-2 border-orange-400">
                Skills
              </h2>
              <ul className="ml-4 text-gray-700 list-disc">
                {skills.map((skill, idx) => <li key={idx}>{skill}</li>)}
              </ul>
            </section>

            <section>
              <h2 className="pb-1 mb-2 text-lg font-bold tracking-wide text-gray-800 uppercase border-b-2 border-orange-400">
                Education
              </h2>
              <div className="space-y-3">
                {education.map((edu, idx) => (
                  <div key={idx}>
                    <p className="font-medium">{edu.degree}</p>
                    <p className="text-sm text-gray-600">{edu.school} – {edu.location}</p>
                    <p className="text-xs text-gray-500">{edu.year}</p>
                    {Array.isArray(edu.description) && edu.description.length > 0 && (
                      <ul className="mt-1 ml-4 text-gray-700 list-disc">
                        {edu.description.map((desc, i) => <li key={i}>{desc}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="pb-1 mb-2 text-lg font-bold tracking-wide text-gray-800 uppercase border-b-2 border-orange-400">
                Work History
              </h2>
              <div className="space-y-4">
                {workHistory.map((job, idx) => (
                  <div key={idx}>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-sm text-gray-600">{job.company} – {job.location}</p>
                    <p className="text-xs text-gray-500">{job.period}</p>
                    {Array.isArray(job.description) && job.description.length > 0 && (
                      <ul className="mt-1 ml-4 text-gray-700 list-disc">
                        {job.description.map((desc, i) => <li key={i}>{desc}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

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

export default ResumeTemplate2;