import React, { useState, useEffect } from "react";
import EditableField from "../../../components/resumes/EditableField";

const ResumeTemplate1 = ({ resumeData, onChange }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditing, setIsEditing] = useState(true); // Controls visibility of edit UI

  // ======================
  // Image Upload
  // ======================
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange("personal.profilePic", event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ======================
  //  PDF Download — Hide Edit UI During Export
  // ======================
  const handleDownload = async () => {
    setIsDownloading(true);
    setIsEditing(false); // Hide edit controls

    // Small delay to let React re-render without edit UI
    setTimeout(async () => {
      try {
        const html2pdf = (await import("html2pdf.js")).default;
        const element = document.getElementById("resume");

        // Inject print-optimized CSS
        const style = document.createElement("style");
        style.innerHTML = `
          @media print {
            body { -webkit-print-color-adjust: exact; }
            .no-print { display: none !important; }
            .avoid-page-break { page-break-inside: avoid; break-inside: avoid; }
            .skills-grid, .languages-grid {
              column-count: 2;
              column-gap: 20px;
            }
            .skills-grid li, .languages-grid li {
              break-inside: avoid;
            }
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
            margin: 10,
            filename: `${resumeData.personal.firstName}_${resumeData.personal.lastName}_Resume.pdf`,
            html2canvas: {
              scale: 0.75,
              useCORS: true,
            },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          })
          .save();

        document.head.removeChild(style);
      } catch (error) {
        console.error("PDF failed:", error);
        alert("PDF generation failed. Try again.");
      } finally {
        setIsEditing(true);
        setIsDownloading(false);
      }
    }, 100);
  };

  // ======================
  // Array-Safe Update Helpers
  // ======================

  // --- Work History ---
  const addWorkHistory = () => {
    const newItem = {
      period: "Start – End",
      company: "Company Name",
      title: "Job Title",
      description: ["Describe your key responsibility..."],
    };
    const current = Array.isArray(resumeData.workHistory)
      ? resumeData.workHistory
      : [];
    onChange("workHistory", [...current, newItem]);
  };

  const removeWorkHistory = (index) => {
    const current = Array.isArray(resumeData.workHistory)
      ? resumeData.workHistory
      : [];
    const updated = current.filter((_, i) => i !== index);
    onChange("workHistory", updated);
  };

  const updateWorkHistoryField = (index, field, value) => {
    const current = Array.isArray(resumeData.workHistory)
      ? resumeData.workHistory
      : [];
    const updated = current.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange("workHistory", updated);
  };

  const addWorkDescription = (expIndex) => {
    const current = Array.isArray(resumeData.workHistory)
      ? resumeData.workHistory
      : [];
    const updated = current.map((exp, i) =>
      i === expIndex
        ? {
            ...exp,
            description: [
              ...(Array.isArray(exp.description) ? exp.description : []),
              "New responsibility...",
            ],
          }
        : exp
    );
    onChange("workHistory", updated);
  };

  const removeWorkDescription = (expIndex, descIndex) => {
    const current = Array.isArray(resumeData.workHistory)
      ? resumeData.workHistory
      : [];
    const updated = current.map((exp, i) =>
      i === expIndex
        ? {
            ...exp,
            description: (Array.isArray(exp.description)
              ? exp.description
              : []
            ).filter((_, j) => j !== descIndex),
          }
        : exp
    );
    onChange("workHistory", updated);
  };

  // --- Education ---
  const addEducation = () => {
    const newItem = {
      degree: "Degree Name",
      school: "School Name",
      year: "2020 – 2024",
    };
    const current = Array.isArray(resumeData.education)
      ? resumeData.education
      : [];
    onChange("education", [...current, newItem]);
  };

  const removeEducation = (index) => {
    const current = Array.isArray(resumeData.education)
      ? resumeData.education
      : [];
    const updated = current.filter((_, i) => i !== index);
    onChange("education", updated);
  };

  const updateEducationField = (index, field, value) => {
    const current = Array.isArray(resumeData.education)
      ? resumeData.education
      : [];
    const updated = current.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange("education", updated);
  };

  // --- Skills ---
  const addSkill = () => {
    const current = Array.isArray(resumeData.skills) ? resumeData.skills : [];
    onChange("skills", [...current, "New Skill"]);
  };

  const removeSkill = (index) => {
    const current = Array.isArray(resumeData.skills) ? resumeData.skills : [];
    const updated = current.filter((_, i) => i !== index);
    onChange("skills", updated);
  };

  const updateSkill = (index, value) => {
    const current = Array.isArray(resumeData.skills) ? resumeData.skills : [];
    const updated = current.map((skill, i) => (i === index ? value : skill));
    onChange("skills", updated);
  };

  // --- Languages ---
  const addLanguage = () => {
    const newItem = { name: "Language", level: "Beginner" };
    const current = Array.isArray(resumeData.languages)
      ? resumeData.languages
      : [];
    onChange("languages", [...current, newItem]);
  };

  const removeLanguage = (index) => {
    const current = Array.isArray(resumeData.languages)
      ? resumeData.languages
      : [];
    const updated = current.filter((_, i) => i !== index);
    onChange("languages", updated);
  };

  const updateLanguageField = (index, field, value) => {
    const current = Array.isArray(resumeData.languages)
      ? resumeData.languages
      : [];
    const updated = current.map((lang, i) =>
      i === index ? { ...lang, [field]: value } : lang
    );
    onChange("languages", updated);
  };

  // --- References ---
  const addReference = () => {
    const newItem = {
      name: "Reference Name",
      position: "Position, Company",
      phone: "+123-456-7890",
      email: "email@example.com",
    };
    const current = Array.isArray(resumeData.references)
      ? resumeData.references
      : [];
    onChange("references", [...current, newItem]);
  };

  const removeReference = (index) => {
    const current = Array.isArray(resumeData.references)
      ? resumeData.references
      : [];
    const updated = current.filter((_, i) => i !== index);
    onChange("references", updated);
  };

  const updateReferenceField = (index, field, value) => {
    const current = Array.isArray(resumeData.references)
      ? resumeData.references
      : [];
    const updated = current.map((ref, i) =>
      i === index ? { ...ref, [field]: value } : ref
    );
    onChange("references", updated);
  };

  // ======================
  // 📝 Render Safe Arrays
  // ======================
  const workHistory = Array.isArray(resumeData.workHistory)
    ? resumeData.workHistory
    : [];
  const education = Array.isArray(resumeData.education)
    ? resumeData.education
    : [];
  const skills = Array.isArray(resumeData.skills) ? resumeData.skills : [];
  const languages = Array.isArray(resumeData.languages)
    ? resumeData.languages
    : [];
  const references = Array.isArray(resumeData.references)
    ? resumeData.references
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex flex-1">
        {/* Sidebar — HIDDEN IN PDF */}
        {isEditing && (
          <div className="w-64 p-6 bg-white shadow-md no-print">
            <h3 className="mb-4 font-bold text-gray-800">Resume Controls</h3>
            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Profile Picture
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
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
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div
            id="resume"
            className="max-w-5xl mx-auto bg-white shadow-lg"
            style={{ fontFamily: "Arial, sans-serif" }} // Better PDF font
          >
            {/* Header */}
            {/* Resume Header */}
            <div className="flex items-center gap-6 p-6 border-b border-gray-200 md:p-8 bg-gradient-to-r from-blue-50 to-indigo-50">
              <img
                src={
                  resumeData.personal?.profilePic ||
                  "https://via.placeholder.com/150"
                }
                alt="Profile"
                className="object-cover w-24 h-24 border-4 border-white rounded-full shadow-md md:w-32 md:h-32"
                onClick={() =>
                  isEditing &&
                  document.getElementById("profilePicInput")?.click()
                }
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                  {isEditing ? (
                    <EditableField
                      value={`${resumeData.personal?.firstName || ""} ${
                        resumeData.personal?.lastName || ""
                      }`.trim()}
                      onChange={(v) => {
                        const parts = v.trim().split(" ");
                        onChange("personal.firstName", parts[0] || "");
                        onChange(
                          "personal.lastName",
                          parts.slice(1).join(" ") || ""
                        );
                      }}
                      className="text-2xl font-bold text-gray-800 md:text-3xl"
                      tag="span"
                    />
                  ) : (
                    `${resumeData.personal?.firstName || ""} ${
                      resumeData.personal?.lastName || ""
                    }`
                  )}
                </h1>
                <p className="mt-1 text-base text-gray-600 md:text-lg">
                  {isEditing ? (
                    <EditableField
                      value={resumeData.personal?.jobTitle || ""}
                      onChange={(v) => onChange("personal.jobTitle", v)}
                      placeholder="Job Title"
                      className="text-base text-gray-600 md:text-lg"
                      tag="span"
                    />
                  ) : (
                    resumeData.personal?.jobTitle
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row">
              {/* Left Column */}
              <div className="w-full p-6 border-r border-gray-200 md:w-2/5 bg-gray-50">
                {/* Contact */}
                <div className="mb-5">
                  <h3 className="pb-2 mb-2 text-base font-semibold text-gray-800 border-b border-gray-300">
                    Contact
                  </h3>
                  <div className="space-y-1.5 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <span>📞</span>
                      {isEditing ? (
                        <EditableField
                          value={resumeData.personal?.phone || ""}
                          onChange={(v) => onChange("personal.phone", v)}
                          placeholder="+123-456-7890"
                          className="text-sm text-gray-700"
                        />
                      ) : (
                        resumeData.personal?.phone
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span>✉️</span>
                      {isEditing ? (
                        <EditableField
                          value={resumeData.personal?.email || ""}
                          onChange={(v) => onChange("personal.email", v)}
                          placeholder="email@example.com"
                          className="text-sm text-gray-700"
                        />
                      ) : (
                        resumeData.personal?.email
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🌐</span>
                      {isEditing ? (
                        <EditableField
                          value={resumeData.personal?.website || ""}
                          onChange={(v) => onChange("personal.website", v)}
                          placeholder="www.yoursite.com"
                          className="text-sm text-gray-700"
                        />
                      ) : (
                        resumeData.personal?.website
                      )}
                    </div>
                    <div className="flex items-start gap-2">
                      <span>📍</span>
                      {isEditing ? (
                        <EditableField
                          value={resumeData.personal?.address || ""}
                          onChange={(v) => onChange("personal.address", v)}
                          placeholder="123 Street, City"
                          className="text-xs text-gray-700"
                        />
                      ) : (
                        resumeData.personal?.address
                      )}
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div className="mb-5">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-300">
                    <h3 className="text-base font-semibold text-gray-800">
                      Education
                    </h3>
                    {isEditing && (
                      <button
                        onClick={addEducation}
                        className="text-xs text-blue-600 hover:underline no-print"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                  <div className="space-y-2.5">
                    {(Array.isArray(resumeData.education)
                      ? resumeData.education
                      : []
                    ).map((edu, idx) => (
                      <div
                        key={idx}
                        className="relative p-2 text-sm bg-white border rounded"
                      >
                        {isEditing && (
                          <button
                            onClick={() => removeEducation(idx)}
                            className="absolute text-xs text-red-500 top-1 right-1 hover:text-red-700 no-print"
                          >
                            🗑️
                          </button>
                        )}
                        <div className="font-medium">
                          {isEditing ? (
                            <EditableField
                              value={edu.degree}
                              onChange={(v) =>
                                updateEducationField(idx, "degree", v)
                              }
                              placeholder="Degree"
                            />
                          ) : (
                            edu.degree
                          )}
                        </div>
                        <div className="text-gray-600">
                          {isEditing ? (
                            <EditableField
                              value={edu.school}
                              onChange={(v) =>
                                updateEducationField(idx, "school", v)
                              }
                              placeholder="School"
                            />
                          ) : (
                            edu.school
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {isEditing ? (
                            <EditableField
                              value={edu.year}
                              onChange={(v) =>
                                updateEducationField(idx, "year", v)
                              }
                              placeholder="2020 – 2024"
                            />
                          ) : (
                            edu.year
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-5">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-300">
                    <h3 className="text-base font-semibold text-gray-800">
                      Skills
                    </h3>
                    {isEditing && (
                      <button
                        onClick={addSkill}
                        className="text-xs text-blue-600 hover:underline no-print"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                  <ul
                    className={`space-y-1 text-sm text-gray-700 list-disc list-inside ${
                      skills.length > 6 ? "columns-2 gap-4" : ""
                    }`}
                  >
                    {(Array.isArray(resumeData.skills)
                      ? resumeData.skills
                      : []
                    ).map((skill, idx) => (
                      <li key={idx} className="relative break-inside-avoid">
                        {isEditing ? (
                          <>
                            <EditableField
                              value={skill}
                              onChange={(v) => updateSkill(idx, v)}
                              placeholder="Skill"
                            />
                            <button
                              onClick={() => removeSkill(idx)}
                              className="ml-2 text-xs text-red-500 hover:text-red-700 no-print"
                            >
                              🗑️
                            </button>
                          </>
                        ) : (
                          skill
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Languages */}
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-300">
                    <h3 className="text-base font-semibold text-gray-800">
                      Languages
                    </h3>
                    {isEditing && (
                      <button
                        onClick={addLanguage}
                        className="text-xs text-blue-600 hover:underline no-print"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                  <ul className="space-y-1 text-sm text-gray-700 list-disc list-inside">
                    {(Array.isArray(resumeData.languages)
                      ? resumeData.languages
                      : []
                    ).map((lang, idx) => (
                      <li key={idx} className="relative">
                        {isEditing ? (
                          <>
                            <EditableField
                              value={`${lang.name} (${lang.level})`}
                              onChange={(v) => {
                                const parts = v.split("(");
                                const name = (parts[0] || "").trim();
                                const level = (
                                  parts[1]?.replace(")", "") || ""
                                ).trim();
                                updateLanguageField(idx, "name", name);
                                updateLanguageField(idx, "level", level);
                              }}
                              placeholder="English (Native)"
                            />
                            <button
                              onClick={() => removeLanguage(idx)}
                              className="ml-2 text-xs text-red-500 hover:text-red-700 no-print"
                            >
                              🗑️
                            </button>
                          </>
                        ) : (
                          `${lang.name} (${lang.level})`
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column */}
              <div className="w-full p-6 md:w-3/5">
                {/* Profile */}
                <div className="mb-5">
                  <h3 className="pb-2 mb-2 text-base font-semibold text-gray-800 border-b border-gray-300">
                    Profile
                  </h3>
                  {isEditing ? (
                    <EditableField
                      value={resumeData.personal?.profileSummary || ""}
                      onChange={(v) => onChange("personal.profileSummary", v)}
                      placeholder="Tell us about yourself..."
                      isTextArea={true}
                      rows={3}
                      className="w-full text-sm leading-relaxed text-gray-700"
                    />
                  ) : (
                    <p className="text-sm leading-relaxed text-gray-700">
                      {resumeData.personal?.profileSummary}
                    </p>
                  )}
                </div>

                {/* Work Experience */}
                <div className="mb-5">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-300">
                    <h3 className="text-base font-semibold text-gray-800">
                      Work Experience
                    </h3>
                    {isEditing && (
                      <button
                        onClick={addWorkHistory}
                        className="text-xs text-blue-600 hover:underline no-print"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {(Array.isArray(resumeData.workHistory)
                      ? resumeData.workHistory
                      : []
                    ).map((exp, idx) => (
                      <div
                        key={idx}
                        className="relative py-2 pl-3 text-sm border-l-4 border-blue-500"
                      >
                        {isEditing && (
                          <button
                            onClick={() => removeWorkHistory(idx)}
                            className="absolute top-0 right-0 text-xs text-red-500 hover:text-red-700 no-print"
                          >
                            🗑️
                          </button>
                        )}
                        <div className="font-semibold text-gray-600">
                          {isEditing ? (
                            <EditableField
                              value={exp.period}
                              onChange={(v) =>
                                updateWorkHistoryField(idx, "period", v)
                              }
                              placeholder="2020 – 2023"
                            />
                          ) : (
                            exp.period
                          )}
                        </div>
                        <div className="font-medium text-gray-800">
                          {isEditing ? (
                            <EditableField
                              value={exp.company}
                              onChange={(v) =>
                                updateWorkHistoryField(idx, "company", v)
                              }
                              placeholder="Company"
                            />
                          ) : (
                            exp.company
                          )}
                        </div>
                        <div className="mb-1.5 italic text-gray-600">
                          {isEditing ? (
                            <EditableField
                              value={exp.title}
                              onChange={(v) =>
                                updateWorkHistoryField(idx, "title", v)
                              }
                              placeholder="Job Title"
                            />
                          ) : (
                            exp.title
                          )}
                        </div>
                        <ul className="ml-3 space-y-1 text-gray-700 list-disc list-inside">
                          {(Array.isArray(exp.description)
                            ? exp.description
                            : []
                          ).map((bullet, i) => (
                            <li key={i} className="relative">
                              {isEditing ? (
                                <>
                                  <EditableField
                                    value={bullet}
                                    onChange={(v) => {
                                      const desc = [...(exp.description || [])];
                                      desc[i] = v;
                                      updateWorkHistoryField(
                                        idx,
                                        "description",
                                        desc
                                      );
                                    }}
                                    placeholder="Responsibility..."
                                  />
                                  <button
                                    onClick={() =>
                                      removeWorkDescription(idx, i)
                                    }
                                    className="ml-2 text-xs text-red-500 hover:text-red-700 no-print"
                                  >
                                    🗑️
                                  </button>
                                </>
                              ) : (
                                bullet
                              )}
                            </li>
                          ))}
                          {isEditing && (
                            <li>
                              <button
                                onClick={() => addWorkDescription(idx)}
                                className="text-xs text-blue-600 hover:underline no-print"
                              >
                                + Add Bullet
                              </button>
                            </li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* References */}
                <div>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-300">
                    <h3 className="text-base font-semibold text-gray-800">
                      References
                    </h3>
                    {isEditing && (
                      <button
                        onClick={addReference}
                        className="text-xs text-blue-600 hover:underline no-print"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                  <div className="space-y-3">
                    {(Array.isArray(resumeData.references)
                      ? resumeData.references
                      : []
                    ).map((ref, idx) => (
                      <div
                        key={idx}
                        className="relative p-2 text-sm border border-gray-200 rounded bg-gray-50"
                      >
                        {isEditing && (
                          <button
                            onClick={() => removeReference(idx)}
                            className="absolute text-xs text-red-500 top-1 right-1 hover:text-red-700 no-print"
                          >
                            🗑️
                          </button>
                        )}
                        <div className="font-medium text-gray-800">
                          {isEditing ? (
                            <EditableField
                              value={ref.name}
                              onChange={(v) =>
                                updateReferenceField(idx, "name", v)
                              }
                              placeholder="Name"
                            />
                          ) : (
                            ref.name
                          )}
                        </div>
                        <div className="text-gray-600">
                          {isEditing ? (
                            <EditableField
                              value={ref.position}
                              onChange={(v) =>
                                updateReferenceField(idx, "position", v)
                              }
                              placeholder="Position"
                            />
                          ) : (
                            ref.position
                          )}
                        </div>
                        <div className="text-gray-700">
                          Phone:{" "}
                          {isEditing ? (
                            <EditableField
                              value={ref.phone}
                              onChange={(v) =>
                                updateReferenceField(idx, "phone", v)
                              }
                              placeholder="+123-456-7890"
                            />
                          ) : (
                            ref.phone
                          )}
                        </div>
                        <div className="text-gray-700">
                          Email:{" "}
                          {isEditing ? (
                            <EditableField
                              value={ref.email}
                              onChange={(v) =>
                                updateReferenceField(idx, "email", v)
                              }
                              placeholder="email@example.com"
                            />
                          ) : (
                            ref.email
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ResumeTemplate1;
