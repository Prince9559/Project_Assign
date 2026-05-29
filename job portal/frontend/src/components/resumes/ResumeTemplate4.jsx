// src/components/ResumeTemplate4.jsx
import React from 'react';
import { userData } from './userData';

const ResumeTemplate4 = () => {
  const {
    firstName,
    lastName,
    profilePic,
    phone,
    email,
    address,
    website,
    profileSummary,
    skills,
    education,
    workHistory,
    languages,
    references,
  } = userData;

  return (
    <div
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
              src={profilePic}
              alt={`${firstName} ${lastName}`}
              className="object-cover w-32 h-32 border-4 border-white rounded-full"
            />
          </div>

          {/* Contact */}
          <div>
            <h2 className="mb-3 text-xl font-bold tracking-wide uppercase">Contact</h2>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.041 11.041 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C9.083 18 3.917 18 3 17V3.001c0-.55.45-.999 1-.999h2z" />
                </svg>
                <span>{phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8a2 2 0 11-4 0 2 2 0 014 0zM11 15a2 2 0 100-4 2 2 0 000 4z" />
                </svg>
                <span>{email}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" />
                </svg>
                <span>{website}</span>
              </div>
            </div>
          </div>

          {/* Education */}
          <div>
            <h2 className="mb-3 text-xl font-bold tracking-wide uppercase">Education</h2>
            {education.map((edu, idx) => (
              <div key={idx} className="mb-4">
                <div className="font-medium">{edu.year}</div>
                <div className="text-sm text-gray-300">{edu.degree}</div>
                <div className="text-sm text-gray-300">{edu.school}</div>
                <ul className="mt-1 text-sm text-gray-300 list-disc list-inside">
                  {edu.description && edu.description.map((desc, i) => (
                    <li key={i}>{desc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div>
            <h2 className="mb-3 text-xl font-bold tracking-wide uppercase">Skills</h2>
            <ul className="space-y-1 text-gray-300 list-disc list-inside">
              {skills.map((skill, idx) => (
                <li key={idx}>{skill}</li>
              ))}
            </ul>
          </div>

          {/* Languages */}
          <div>
            <h2 className="mb-3 text-xl font-bold tracking-wide uppercase">Languages</h2>
            <ul className="space-y-1 text-gray-300 list-disc list-inside">
              {languages.map((lang, idx) => (
                <li key={idx}>
                  {lang.name} ({lang.level})
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full p-8 space-y-8 md:w-2/3">
          {/* Name & Title */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{firstName} {lastName}</h1>
            <p className="mt-1 text-xl text-gray-600">{profileSummary}</p>
            <div className="w-16 h-0.5 bg-slate-800 mt-2"></div>
          </div>

          {/* Profile */}
          <div>
            <h2 className="mb-3 text-xl font-bold tracking-wide uppercase text-slate-800">Profile</h2>
            <p className="leading-relaxed text-gray-700">{profileSummary}</p>
          </div>

          {/* Work Experience */}
          <div>
            <h2 className="mb-3 text-xl font-bold tracking-wide uppercase text-slate-800">Work Experience</h2>
            <div className="relative pl-6 space-y-6 border-l-2 border-slate-300">
              {workHistory.map((job, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute left-0 w-2 h-2 rounded-full top-2 bg-slate-800"></div>
                  <div className="ml-2">
                    <div className="flex justify-between">
                      <h3 className="font-semibold text-gray-800">{job.title}</h3>
                      <span className="text-sm text-gray-500">{job.period}</span>
                    </div>
                    <p className="text-sm text-gray-600">{job.company}</p>
                    <ul className="mt-2 space-y-1 text-gray-700 list-disc list-inside">
                      {job.description.map((desc, i) => (
                        <li key={i}>{desc}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* References */}
          <div>
            <h2 className="mb-3 text-xl font-bold tracking-wide uppercase text-slate-800">Reference</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {references.map((ref, idx) => (
                <div key={idx} className="space-y-1 text-gray-700">
                  <p className="font-medium">{ref.name}</p>
                  <p className="text-sm">{ref.position}</p>
                  <p className="text-xs">Phone: {ref.phone}</p>
                  <p className="text-xs">Email: {ref.email}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeTemplate4;