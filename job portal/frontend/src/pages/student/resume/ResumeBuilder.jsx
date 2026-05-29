// src/pages/ResumeBuilderPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userDetailsApi } from '../../../api/userDetailsApi'; 
import EditableResumeTemplate from '../../../components/resumes/EditableResumeTemplate';

// Import all templates
import ResumeTemplate1 from '../../../components/resumes/ResumeTemplate1';
import ResumeTemplate2 from './ResumeTemplate2';
// import ResumeTemplate3 from '../components/resumes/ResumeTemplate3';
// import ResumeTemplate4 from '../components/resumes/ResumeTemplate4';

const templateMap = {
  '1': ResumeTemplate1,
  '2': ResumeTemplate2,
//   '3': ResumeTemplate3,
//   '4': ResumeTemplate4,
};

const defaultResumeData = {
  personal: {
    firstName: "First Name",
    lastName: "Last Name",
    jobTitle: "Job Title",
    profilePic: "https://via.placeholder.com/150",
    phone: "+123-456-7890",
    email: "email@example.com",
    address: "City, Country",
    website: "",
    profileSummary: "Tell us about yourself..."
  },
  skills: ["Skill 1", "Skill 2"],
  languages: [{ name: "English", level: "Native" }],
  education: [],
  workHistory: [],
  references: []
};

const ResumeBuilder = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState(defaultResumeData);
  const [loading, setLoading] = useState(true);

  // Validate template ID
  useEffect(() => {
    if (!templateMap[templateId]) {
      navigate('/resume-template-selector');
    }
  }, [templateId, navigate]);

  // Load resume data
  useEffect(() => {
    const loadResumeData = async () => {
      const userId = 104; // ← Replace with real user ID
      const token = localStorage.getItem('authToken');

      let data = defaultResumeData;

      if (userId && token) {
        try {
          const apiData = await userDetailsApi.getResumeData(userId, token);
          data = {
            personal: {
              firstName: apiData.personal?.firstName || "First Name",
              lastName: apiData.personal?.lastName || "Last Name",
              jobTitle: apiData.personal?.jobTitle || "Job Title",
              profilePic: apiData.personal?.profilePic || "https://via.placeholder.com/150",
              phone: apiData.personal?.phone || "+000-000-0000",
              email: apiData.personal?.email || "email@example.com",
              address: apiData.personal?.address || "City, Country",
              website: apiData.personal?.website || "",
              profileSummary: apiData.personal?.profileSummary || "Tell us about yourself..."
            },
            skills: Array.isArray(apiData.skills) ? apiData.skills.filter(Boolean) : ["Skill 1"],
            languages: Array.isArray(apiData.languages)
              ? apiData.languages.map(l => ({ name: l.name || "Language", level: l.level || "Level" }))
              : [{ name: "English", level: "Native" }],
            education: Array.isArray(apiData.education) ? apiData.education : [],
            workHistory: Array.isArray(apiData.workHistory) ? apiData.workHistory : [],
            references: Array.isArray(apiData.references) ? apiData.references : []
          };
        } catch (error) {
          console.warn("Using default resume data");
        }
      }

      setResumeData(data);
      setLoading(false);

      // Save selected template to localStorage
      localStorage.setItem('selectedTemplate', templateId);
    };

    loadResumeData();
  }, [templateId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto border-4 border-gray-300 rounded-full border-t-blue-500 animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading your resume...</p>
        </div>
      </div>
    );
  }

  const TemplateComponent = templateMap[templateId];

  return (
    <EditableResumeTemplate
      TemplateComponent={TemplateComponent}
      resumeData={resumeData}
      setResumeData={setResumeData}
    />
  );
};

export default ResumeBuilder;