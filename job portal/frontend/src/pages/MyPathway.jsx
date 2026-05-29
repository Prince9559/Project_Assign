import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import FeedRightSidebar from '../pages/student/feed/FeedRightSidebar';
import PathwaySetupForm from '../components/pathway/PathwaySetupForm';
import PathwayGenerationLoader from '../components/pathway/PathwayGenerationLoader';
import { useSelector } from "react-redux";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const MyPathway = () => {
  const [view, setView] = useState('setup');
  const [preferences, setPreferences] = useState(null);
  const [pathways, setPathways] = useState([]);
  const [expandedPathwayId, setExpandedPathwayId] = useState(null);
  const [selectedPathwayId, setSelectedPathwayId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobLoading, setJobLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const { user } = useSelector((state) => state.auth);

  // Load preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem('user_pathway_preferences');
      if (saved) {
        setPreferences(JSON.parse(saved));
      } else {
        const defaults = {
          include_courses: true,
          include_projects: true,
          include_internships: true,
          include_jobs: true,
        };
        setPreferences(defaults);
        localStorage.setItem('user_pathway_preferences', JSON.stringify(defaults));
      }
    } catch (err) {
      setPreferences({
        include_courses: true,
        include_projects: true,
        include_internships: true,
        include_jobs: true,
      });
    }
  }, []);

  // Initial form values
  const initialFormValues = React.useMemo(() => {
    const base = {
      resource_priority: ["internship", "project", "course"],
      max_timeline: 365,
      min_timeline: 1,
    };
    const includeDefaults = {
      course: true,
      project: true,
      internship: true,
      job: true,
    };
    if (state.jobId || state.jobTitle) {
      return {
        ...base,
        strategy: "job_specific",
        target_job_id: state.jobId,
        target_job_title: state.jobTitle,
        target_company_name: state.companyName,
        include_resources: includeDefaults,
      };
    }
    if (state.roleName) {
      return {
        ...base,
        strategy: "role_specific",
        target_role_name: state.roleName,
        include_resources: includeDefaults,
      };
    }
    return {
      ...base,
      strategy: "job_specific",
      include_resources: includeDefaults,
    };
  }, [state]);

  const handleGenerate = async (formValues) => {
    setView('generating');
    setError(null);
    
    if (!user?.id) {
      setError('User not logged in');
      setView('setup');
      return;
    }

    const apiPayload = {
      user_id: user.id,
      target_type: formValues.strategy_type,
      ...(formValues.strategy_type === 'job_specific' && {
        target_id: formValues.target_job_id,
      }),
      ...(formValues.strategy_type === 'role_specific' && {
        target_role: formValues.target_role,
      }),
      user_preferences: {
        include_courses: formValues.include_types.includes('course'),
        include_projects: formValues.include_types.includes('project'),
        include_internships: formValues.include_types.includes('internship'),
        include_jobs: formValues.include_types.includes('job'),
      },
    };

    try {
      const apiCall = fetch(`${BASE_URL}/pathways/v4/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
      }).then(res => res.json());

      const minLoadingTime = new Promise(resolve => {
        const delay = 7000 + Math.random() * 3000;
        setTimeout(resolve, delay);
      });

      const [data] = await Promise.all([apiCall, minLoadingTime]);

      if (data.success && Array.isArray(data.data?.pathways)) {
        const enriched = data.data.pathways.map((p, idx) => ({
          ...p,
          pathway_id: p.pathway_id || `pathway-${Date.now()}-${idx}`,
          rank: p.pathway_rank || idx + 1,
          total_duration: p.total_duration_months,
          steps: (p.steps || []).map((step, sIdx) => ({
            ...step,
            step_id: step.opportunity_id || `step-${Date.now()}-${idx}-${sIdx}`,
            title: step.opportunity_title,
            type: step.opportunity_type,
            duration: step.duration_months ? `${step.duration_months} months` : null,
            skills: step.skills_gained || [],
          })),
        }));
        setPathways(enriched);
        setView('results');
      } else {
        setError(data.message || 'Failed to generate pathways.');
        setView('setup');
      }
    } catch (err) {
      console.error('API Error:', err);
      setError('Network error. Please try again.');
      setView('setup');
    }
  };

  const handleStepClick = async (opportunityId, opportunityType) => {
    setJobLoading(true);
    setError(null);
    
    try {
      const type = opportunityType?.toLowerCase();
      const endpoint = `${BASE_URL}/pathways/v4/opportunities/${type}/${opportunityId}`;
      
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error(`Failed to fetch ${type}`);
      
      const responseData = await res.json();
      
      if (responseData?.success && responseData?.data) {
        const opportunity = responseData.data;
        
        if (type === 'course') {
          setSelectedJob({
            ...opportunity,
            opportunity_type: 'course',
            job_role: opportunity.title || opportunity.course_name || opportunity.name,
            company_name: opportunity.provider || opportunity.institution || opportunity.organization,
            job_description: opportunity.description || opportunity.details || opportunity.about_course,
            skillsRequired: opportunity.resourceSkills?.map(rs => rs.skill_name) || 
                           opportunity.skills?.map(s => s.skill_name) || [],
            duration: opportunity.duration || opportunity.course_duration,
            url: opportunity.url || opportunity.course_url || opportunity.link,
            logo_url: opportunity.logo || opportunity.image,
            salary: opportunity.fee || opportunity.price || 'Free',
            job_type: 'Course',
            job_time: opportunity.mode || 'Online',
            aboutCompany: opportunity.about_course || opportunity.provider_description,
            eligibility: opportunity.eligibility,
            curriculum: opportunity.curriculum,
          });
        } else {
          setSelectedJob({
            ...opportunity,
            opportunity_type: type,
            job_role: opportunity.job_role || opportunity.title || opportunity.job_title,
            company_name: opportunity.company_name || opportunity.companyName,
            job_description: opportunity.job_description || opportunity.description,
            skillsRequired: opportunity.skills?.map(s => 
              typeof s === 'object' ? s.skill_name : s
            ) || opportunity.Skills?.map(s => s.skill_name) || [],
            duration: opportunity.duration,
            url: opportunity.url || opportunity.apply_url,
            logo_url: opportunity.logo_url || opportunity.company_logo,
            salary: opportunity.salary || opportunity.ctc,
            job_type: opportunity.job_type || opportunity.employment_type,
            job_time: opportunity.job_time || opportunity.work_mode,
            hiringStatus: opportunity.hiring_status,
            aboutCompany: opportunity.about_company || opportunity.company_description,
            eligible_cities: opportunity.eligible_cities,
            eligible_colleges: opportunity.eligible_colleges,
            eligible_courses: opportunity.eligible_courses,
            number_of_openings: opportunity.openings,
            recruiter_full_name: opportunity.recruiter_name,
            recruiterDesignationName: opportunity.recruiter_designation,
            recruiter_profile_pic: opportunity.recruiter_image,
            companyIndustry: opportunity.industry,
            posted_days_ago: opportunity.posted_ago,
            number_of_applicants: opportunity.applicants_count,
          });
        }
      }
    } catch (err) {
      console.error(`Failed to fetch ${opportunityType} details:`, err);
      setError(`Failed to load ${opportunityType} details`);
    } finally {
      setJobLoading(false);
    }
  };

  const handleExpand = (id) => {
    setExpandedPathwayId(expandedPathwayId === id ? null : id);
  };

  const handleSelect = async (pathwayId) => {
    try {
      setSelectedPathwayId(pathwayId);
    } catch (err) {
      console.error('Failed to select pathway:', err);
    }
  };

  const handleBackToPathways = () => {
    setSelectedJob(null);
  };

  const getStepIcon = (type) => {
    const icons = {
      job: '💼',
      internship: '🎓',
      course: '📚',
      project: '📁',
    };
    return icons[type?.toLowerCase()] || '📌';
  };

  const formatDuration = (months) => {
    if (!months && months !== 0) return '';
    const totalMonths = Math.round(Number(months));
    if (totalMonths === 0) return '0 months';
    if (totalMonths < 12) return `${totalMonths} month${totalMonths > 1 ? 's' : ''}`;
    const years = Math.floor(totalMonths / 12);
    const remainingMonths = totalMonths % 12;
    if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years}yr ${remainingMonths}mo`;
  };

  //  Job/Course Details View - FULL SCREEN LAYOUT
  if (selectedJob) {
    return (
      <MainLayout>
        <div className="flex min-h-screen bg-gray-50">
          {/* Left Sidebar - Improved UI */}
          <aside className="sticky top-0 hidden h-screen overflow-y-auto bg-white border-r border-gray-200 shadow-lg lg:block w-96">
            <div className="p-6">
              <button
                onClick={handleBackToPathways}
                className="flex items-center gap-2 mb-6 text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
              >
                <span className="text-lg">←</span> Back to Pathways
              </button>
              
              <h2 className="mb-6 text-xl font-bold leading-tight text-gray-900">
                Your personalised pathway overview
              </h2>
              
              <div className="space-y-4">
                {pathways.slice(0, 3).map((pathway, index) => {
                  const colors = ["#6EB5DD", "#E8AC6E", "#888CE4"];
                  const isExpanded = expandedPathwayId === pathway.pathway_id;
                  
                  return (
                    <div
                      key={pathway.pathway_id}
                      style={{ backgroundColor: colors[index] }}
                      className={`text-white rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] ${isExpanded ? 'ring-2 ring-white ring-opacity-50' : ''}`}
                      onClick={() => handleExpand(pathway.pathway_id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-base font-bold">Pathway {pathway.rank}</p>
                          <p className="mt-1 text-sm opacity-90">
                            {formatDuration(pathway.total_duration_months)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-white/25 px-2.5 py-1 rounded-full font-medium">
                            {pathway.steps?.length || 0} steps
                          </span>
                          <span className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="mt-3 space-y-2 animate-fadeIn">
                          {pathway.steps?.slice(0, 3).map((step, i) => (
                            <div
                              key={i}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStepClick(step.opportunity_id, step.opportunity_type);
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-sm transition-colors rounded-lg cursor-pointer bg-white/15 hover:bg-white/25"
                            >
                              <span className="text-lg">{getStepIcon(step.opportunity_type)}</span>
                              <span className="flex-1 truncate">{step.opportunity_title}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              
              <button
                onClick={() => setView('setup')}
                className="w-full py-3 mt-6 text-sm font-semibold text-white transition-all shadow-lg bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:from-red-600 hover:to-red-700 hover:shadow-xl"
              >
                Get Started
              </button>
            </div>
          </aside>

          {/* Main Content - Full Width Job Details */}
          <main className="flex-1 p-6 overflow-y-auto lg:p-8">
            {jobLoading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
                  <p className="font-medium text-gray-600">Loading details...</p>
                </div>
              </div>
            ) : (
              <div className="max-w-6xl p-8 mx-auto bg-white shadow-xl rounded-2xl lg:p-10">
                {/* Header */}
                <div className="flex flex-col items-start gap-6 pb-8 mb-8 border-b border-gray-200 md:flex-row">
                  <div className="flex items-center justify-center flex-shrink-0 w-24 h-24 text-4xl font-bold text-gray-700 shadow-inner bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl">
                    {selectedJob.logo_url ? (
                      <img
                        src={`${BASE_URL}/${selectedJob.logo_url}`}
                        alt={selectedJob.company_name}
                        className="object-cover w-full h-full rounded-2xl"
                      />
                    ) : (
                      selectedJob.company_name?.charAt(0) || 
                      (selectedJob.opportunity_type === 'course' ? '📚' : '💼')
                    )}
                  </div>
                  <div className="flex-1">
                    <h1 className="mb-2 text-3xl font-bold leading-tight text-gray-900">
                      {selectedJob.job_role || selectedJob.title}
                    </h1>
                    <p className="mb-4 text-xl font-medium text-gray-600">{selectedJob.company_name}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold capitalize">
                        {selectedJob.opportunity_type || 'resource'}
                      </span>
                      {selectedJob.job_type && (
                        <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                          {selectedJob.job_type}
                        </span>
                      )}
                      {selectedJob.job_time && (
                        <span className="px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                          {selectedJob.job_time}
                        </span>
                      )}
                      {selectedJob.salary && (
                        <span className="px-4 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                          {selectedJob.salary}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Info Cards - Improved */}
                <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
                  <div className="p-6 border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                    <p className="mb-2 text-sm font-semibold text-blue-600">
                      {selectedJob.opportunity_type === 'course' ? 'Fee' : 'Salary'}
                    </p>
                    <p className="text-xl font-bold text-blue-900">
                      {selectedJob.salary || selectedJob.fee || 'Not disclosed'}
                    </p>
                  </div>
                  <div className="p-6 border border-green-200 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                    <p className="mb-2 text-sm font-semibold text-green-600">Location</p>
                    <p className="text-xl font-bold text-green-900">
                      {selectedJob.eligible_cities?.[0]?.name || 
                       selectedJob.location || 
                       selectedJob.mode || 
                       'Not specified'}
                    </p>
                  </div>
                  <div className="p-6 border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
                    <p className="mb-2 text-sm font-semibold text-purple-600">Duration</p>
                    <p className="text-xl font-bold text-purple-900">
                      {formatDuration(selectedJob.duration) || 
                       selectedJob.course_duration || 
                       'Not specified'}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                    <span className="w-1 h-8 bg-blue-500 rounded-full"></span>
                    {selectedJob.opportunity_type === 'course' ? 'About Course' : 
                     selectedJob.opportunity_type === 'project' ? 'Project Details' : 'Description'}
                  </h2>
                  <div className="p-6 border border-gray-200 bg-gray-50 rounded-xl">
                    <p className="text-base leading-relaxed text-gray-700 whitespace-pre-line">
                      {selectedJob.job_description || selectedJob.description || 'No description available'}
                    </p>
                  </div>
                </div>

                {/* Skills Required */}
                {selectedJob.skillsRequired && selectedJob.skillsRequired.length > 0 && (
                  <div className="mb-8">
                    <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                      <span className="w-1 h-8 bg-green-500 rounded-full"></span>
                      {selectedJob.opportunity_type === 'course' ? 'Skills You Will Learn' : 'Skills Required'}
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {selectedJob.skillsRequired.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 text-sm font-semibold text-green-700 transition-shadow border border-green-200 rounded-lg bg-gradient-to-r from-green-50 to-green-100 hover:shadow-md"
                        >
                          {typeof skill === 'object' ? skill.skill_name : skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* About Provider/Company */}
                {(selectedJob.aboutCompany || selectedJob.about_course || selectedJob.provider_description) && (
                  <div className="mb-8">
                    <h2 className="flex items-center gap-2 mb-4 text-2xl font-bold text-gray-900">
                      <span className="w-1 h-8 bg-purple-500 rounded-full"></span>
                      About {selectedJob.company_name}
                    </h2>
                    <div className="p-6 border border-gray-200 bg-gray-50 rounded-xl">
                      <p className="leading-relaxed text-gray-700">
                        {selectedJob.aboutCompany || selectedJob.about_course || selectedJob.provider_description}
                      </p>
                    </div>
                  </div>
                )}

                {/* Eligibility/Curriculum for Courses */}
                {selectedJob.opportunity_type === 'course' && (
                  <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
                    {selectedJob.eligibility && (
                      <div className="p-6 border border-blue-200 bg-blue-50 rounded-xl">
                        <h3 className="mb-3 text-lg font-bold text-blue-900">Eligibility</h3>
                        <p className="text-blue-800">{selectedJob.eligibility}</p>
                      </div>
                    )}
                    {selectedJob.curriculum && (
                      <div className="p-6 border border-purple-200 bg-purple-50 rounded-xl">
                        <h3 className="mb-3 text-lg font-bold text-purple-900">Curriculum</h3>
                        <p className="text-purple-800">{selectedJob.curriculum}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Apply/Enroll Button */}
                <div className="flex flex-col gap-4 pt-8 mt-10 border-t border-gray-200 sm:flex-row">
                  {selectedJob.url ? (
                    <a
                      href={selectedJob.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-4 text-lg font-bold text-center text-white transition-all shadow-lg bg-gradient-to-r from-red-500 to-red-600 rounded-xl hover:from-red-600 hover:to-red-700 hover:shadow-xl"
                    >
                      {selectedJob.opportunity_type === 'course' ? '🎓 Enroll Now' : 
                       selectedJob.opportunity_type === 'project' ? '📁 View Project' : '💼 Apply Now'}
                    </a>
                  ) : (
                    <button className="flex-1 py-4 text-lg font-bold text-gray-500 bg-gray-300 cursor-not-allowed rounded-xl">
                      Not Available
                    </button>
                  )}
                  <button className="px-8 py-4 text-lg font-bold text-gray-700 transition-all border-2 border-gray-300 rounded-xl hover:border-gray-400 hover:bg-gray-50">
                    💾 Save for Later
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </MainLayout>
    );
  }

  // ✅ Pathways Results View
  return (
    <MainLayout>
      <div className="flex items-start justify-center min-h-screen px-2 bg-gray-100 lg:px-8">
        <div className="w-full max-w-4xl mx-auto mt-4">
          {/* HEADER */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {view === 'results'
                ? 'Your personalised pathways'
                : 'Build Your Learning Pathway'}
            </h1>
            <div className="flex justify-end mt-3">
              <button
                onClick={() => navigate("/student-dashboard")}
                className="text-gray-600 hover:text-black"
              >
                Go To Dashboard
              </button>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="p-4 mb-4 text-red-700 bg-red-100 rounded">
              {error}
            </div>
          )}

          {/* SETUP */}
          {view === 'setup' && preferences && (
            <PathwaySetupForm
              onSubmit={handleGenerate}
              initialValues={initialFormValues}
              locationState={state}
            />
          )}

          {/* LOADING */}
          {view === 'generating' && <PathwayGenerationLoader />}

          {/* RESULTS UI */}
          {view === 'results' && (
            <div className="p-6 bg-white shadow-sm rounded-2xl">
              <div className="space-y-4">
                {pathways.length > 0 ? (
                  pathways.slice(0, 3).map((pathway, index) => {
                    const colors = ["#6EB5DD", "#E8AC6E", "#888CE4"];
                    const resourceTypes = [...new Set(
                      pathway.steps?.map(s => s.opportunity_type || s.type)
                    )].filter(Boolean);
                    const totalSkills = pathway.steps?.reduce((acc, step) =>
                      acc + (step.skills_gained?.length || 0), 0) || 0;
                    const isExpanded = expandedPathwayId === pathway.pathway_id;
                    
                    return (
                      <div key={pathway.pathway_id}>
                        {/* MAIN CARD */}
                        <div
                          style={{ backgroundColor: colors[index] || "#6EB5DD" }}
                          className="flex items-center justify-between p-4 text-white transition-all cursor-pointer rounded-xl hover:shadow-md"
                          onClick={() => handleExpand(pathway.pathway_id)}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src="/pathway.png"
                              alt="Pathway"
                              className="object-cover w-10 h-10 rounded-md bg-white/20"
                            />
                            <div>
                              <p className="font-semibold">
                                Pathway {pathway.rank || index + 1}
                              </p>
                              <div className="flex flex-wrap gap-2 mt-1 text-xs">
                                {resourceTypes.length > 0 ? (
                                  <span className="bg-white/20 px-2 py-0.5 rounded capitalize">
                                    {resourceTypes.join(', ')}
                                  </span>
                                ) : (
                                  <span className="bg-white/20 px-2 py-0.5 rounded">
                                    Internship, Course, Project
                                  </span>
                                )}
                                <span className="bg-white/20 px-2 py-0.5 rounded">
                                  {formatDuration(pathway.total_duration_months)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 text-xs text-gray-700 bg-white rounded-full">
                              {totalSkills} Skills
                            </span>
                            <span className={`text-white transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                              ▼
                            </span>
                          </div>
                        </div>

                        {/* EXPANDED DETAILS */}
                        {isExpanded && (
                          <div className="pl-4 mt-2 space-y-3">
                            {pathway.steps && pathway.steps.length > 0 ? (
                              pathway.steps.map((step, i) => {
                                const stepTitle = step.opportunity_title || step.title;
                                const stepType = step.opportunity_type || step.type;
                                const stepDuration = step.duration_months;
                                const skillsGained = step.skills_gained || [];
                                return (
                                  <div
                                    key={step.step_id || i}
                                    onClick={() => handleStepClick(step.opportunity_id, step.opportunity_type)}
                                    className="flex items-center gap-3 p-3 transition-colors rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                                  >
                                    <div className="flex items-center justify-center w-8 h-8 text-sm bg-gray-300 rounded">
                                      {getStepIcon(stepType)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {stepTitle || "Opportunity"}
                                      </p>
                                      <p className="flex flex-wrap gap-1 text-xs text-gray-500">
                                        <span className="capitalize">{stepType || 'resource'}</span>
                                        {stepDuration && (
                                          <>• {formatDuration(stepDuration)}</>
                                        )}
                                        {skillsGained.length > 0 && (
                                          <>• {skillsGained.length} skill{skillsGained.length > 1 ? 's' : ''}</>
                                        )}
                                      </p>
                                      {skillsGained.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1">
                                          {skillsGained.slice(0, 3).map((skill, idx) => (
                                            <span
                                              key={idx}
                                              className="text-[10px] bg-gray-200 px-1.5 py-0.5 rounded"
                                            >
                                              {skill.skill_name}
                                            </span>
                                          ))}
                                          {skillsGained.length > 3 && (
                                            <span className="text-[10px] text-gray-400">
                                              +{skillsGained.length - 3} more
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    {step.url && (
                                      <a
                                        href={step.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline whitespace-nowrap"
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        View
                                      </a>
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              <div className="py-4 text-center text-gray-500">
                                No steps available for this pathway
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 pl-4 mt-4">
                              {/* Buttons removed as per requirement */}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    No pathways generated. Please try again.
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setView('setup')}
                  className="px-6 py-2 mr-3 text-gray-700 bg-gray-200 rounded-full shadow hover:bg-gray-300"
                >
                  Generate New Pathways
                </button>
                {selectedPathwayId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedPathwayId(selectedPathwayId);
                    }}
                    className="px-6 py-2 text-white bg-green-500 rounded-full shadow hover:bg-green-600"
                  >
                    View Selected Pathway
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default MyPathway;


















// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import MainLayout from '../components/layout/MainLayout';
// import FeedRightSidebar from '../pages/student/feed/FeedRightSidebar';
// import PathwaySetupForm from '../components/pathway/PathwaySetupForm';
// import PathwayGenerationLoader from '../components/pathway/PathwayGenerationLoader';
// import PathwayPageHeader from '../components/jobs/PathwayPageHeader';
// import PathwayGoalSelector from '../components/jobs/PathwayGoalSelector';
// import { useSelector } from "react-redux";

// const BASE_URL = import.meta.env.VITE_BASE_URL;

// const MyPathway = () => {
//   const [view, setView] = useState('setup');
//   const [preferences, setPreferences] = useState(null);
//   const [pathways, setPathways] = useState([]);
//   const [expandedPathwayId, setExpandedPathwayId] = useState(null);
//   const [selectedPathwayId, setSelectedPathwayId] = useState(null);
//   const [selectedJob, setSelectedJob] = useState(null);
//   const [jobLoading, setJobLoading] = useState(false);
//   const [error, setError] = useState(null);
  
//   const navigate = useNavigate();
//   const location = useLocation();
//   const state = location.state || {};
//   const { user } = useSelector((state) => state.auth);

//   // Load preferences
//   useEffect(() => {
//     try {
//       const saved = localStorage.getItem('user_pathway_preferences');
//       if (saved) {
//         setPreferences(JSON.parse(saved));
//       } else {
//         const defaults = {
//           include_courses: true,
//           include_projects: true,
//           include_internships: true,
//           include_jobs: true,
//         };
//         setPreferences(defaults);
//         localStorage.setItem('user_pathway_preferences', JSON.stringify(defaults));
//       }
//     } catch (err) {
//       setPreferences({
//         include_courses: true,
//         include_projects: true,
//         include_internships: true,
//         include_jobs: true,
//       });
//     }
//   }, []);

//   // Initial form values
//   const initialFormValues = React.useMemo(() => {
//     const base = {
//       resource_priority: ["internship", "project", "course"],
//       max_timeline: 365,
//       min_timeline: 1,
//     };
//     const includeDefaults = {
//       course: true,
//       project: true,
//       internship: true,
//       job: true,
//     };
//     if (state.jobId || state.jobTitle) {
//       return {
//         ...base,
//         strategy: "job_specific",
//         target_job_id: state.jobId,
//         target_job_title: state.jobTitle,
//         target_company_name: state.companyName,
//         include_resources: includeDefaults,
//       };
//     }
//     if (state.roleName) {
//       return {
//         ...base,
//         strategy: "role_specific",
//         target_role_name: state.roleName,
//         include_resources: includeDefaults,
//       };
//     }
//     return {
//       ...base,
//       strategy: "job_specific",
//       include_resources: includeDefaults,
//     };
//   }, [state]);

//   const handleGenerate = async (formValues) => {
//     setView('generating');
//     setError(null);
    
//     if (!user?.id) {
//       setError('User not logged in');
//       setView('setup');
//       return;
//     }

//     const apiPayload = {
//       user_id: user.id,
//       target_type: formValues.strategy_type,
//       ...(formValues.strategy_type === 'job_specific' && {
//         target_id: formValues.target_job_id,
//       }),
//       ...(formValues.strategy_type === 'role_specific' && {
//         target_role: formValues.target_role,
//       }),
//       user_preferences: {
//         include_courses: formValues.include_types.includes('course'),
//         include_projects: formValues.include_types.includes('project'),
//         include_internships: formValues.include_types.includes('internship'),
//         include_jobs: formValues.include_types.includes('job'),
//       },
//     };

//     try {
//       const apiCall = fetch(`${BASE_URL}/pathways/v4/generate`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(apiPayload),
//       }).then(res => res.json());

//       const minLoadingTime = new Promise(resolve => {
//         const delay = 7000 + Math.random() * 3000;
//         setTimeout(resolve, delay);
//       });

//       const [data] = await Promise.all([apiCall, minLoadingTime]);

//       if (data.success && Array.isArray(data.data?.pathways)) {
//         const enriched = data.data.pathways.map((p, idx) => ({
//           ...p,
//           pathway_id: p.pathway_id || `pathway-${Date.now()}-${idx}`,
//           rank: p.pathway_rank || idx + 1,
//           total_duration: p.total_duration_months,
//           steps: (p.steps || []).map((step, sIdx) => ({
//             ...step,
//             step_id: step.opportunity_id || `step-${Date.now()}-${idx}-${sIdx}`,
//             title: step.opportunity_title,
//             type: step.opportunity_type,
//             duration: step.duration_months ? `${step.duration_months} months` : null,
//             skills: step.skills_gained || [],
//           })),
//         }));
//         setPathways(enriched);
//         setView('results');
//       } else {
//         setError(data.message || 'Failed to generate pathways.');
//         setView('setup');
//       }
//     } catch (err) {
//       console.error('API Error:', err);
//       setError('Network error. Please try again.');
//       setView('setup');
//     }
//   };

//   const handleStepClick = async (opportunityId, opportunityType) => {
//     setJobLoading(true);
//     setError(null);
    
//     try {
//       const type = opportunityType?.toLowerCase();
//       const endpoint = `${BASE_URL}/pathways/v4/opportunities/${type}/${opportunityId}`;
      
//       const res = await fetch(endpoint);
//       if (!res.ok) throw new Error(`Failed to fetch ${type}`);
      
//       const responseData = await res.json();
      
//       if (responseData?.success && responseData?.data) {
//         const opportunity = responseData.data;
        
//         if (type === 'course') {
//           setSelectedJob({
//             ...opportunity,
//             opportunity_type: 'course',
//             job_role: opportunity.title || opportunity.course_name || opportunity.name,
//             company_name: opportunity.provider || opportunity.institution || opportunity.organization,
//             job_description: opportunity.description || opportunity.details || opportunity.about_course,
//             skillsRequired: opportunity.resourceSkills?.map(rs => rs.skill_name) || 
//                             opportunity.skills?.map(s => s.skill_name) || [],
//             duration: opportunity.duration || opportunity.course_duration,
//             url: opportunity.url || opportunity.course_url || opportunity.link,
//             logo_url: opportunity.logo || opportunity.image,
//             salary: opportunity.fee || opportunity.price || 'Free',
//             job_type: 'Course',
//             job_time: opportunity.mode || 'Online',
//             aboutCompany: opportunity.about_course || opportunity.provider_description,
//             eligibility: opportunity.eligibility,
//             curriculum: opportunity.curriculum,
//           });
//         } else {
//           setSelectedJob({
//             ...opportunity,
//             opportunity_type: type,
//             job_role: opportunity.job_role || opportunity.title || opportunity.job_title,
//             company_name: opportunity.company_name || opportunity.companyName,
//             job_description: opportunity.job_description || opportunity.description,
//             skillsRequired: opportunity.skills?.map(s => 
//               typeof s === 'object' ? s.skill_name : s
//             ) || opportunity.Skills?.map(s => s.skill_name) || [],
//             duration: opportunity.duration,
//             url: opportunity.url || opportunity.apply_url,
//             logo_url: opportunity.logo_url || opportunity.company_logo,
//             salary: opportunity.salary || opportunity.ctc,
//             job_type: opportunity.job_type || opportunity.employment_type,
//             job_time: opportunity.job_time || opportunity.work_mode,
//             hiringStatus: opportunity.hiring_status,
//             aboutCompany: opportunity.about_company || opportunity.company_description,
//             eligible_cities: opportunity.eligible_cities,
//             eligible_colleges: opportunity.eligible_colleges,
//             eligible_courses: opportunity.eligible_courses,
//             number_of_openings: opportunity.openings,
//             recruiter_full_name: opportunity.recruiter_name,
//             recruiterDesignationName: opportunity.recruiter_designation,
//             recruiter_profile_pic: opportunity.recruiter_image,
//             companyIndustry: opportunity.industry,
//             posted_days_ago: opportunity.posted_ago,
//             number_of_applicants: opportunity.applicants_count,
//           });
//         }
//       }
//     } catch (err) {
//       console.error(`Failed to fetch ${opportunityType} details:`, err);
//       setError(`Failed to load ${opportunityType} details`);
//     } finally {
//       setJobLoading(false);
//     }
//   };

//   const handleExpand = (id) => {
//     setExpandedPathwayId(expandedPathwayId === id ? null : id);
//   };

//   const handleSelect = async (pathwayId) => {
//     try {
//       setSelectedPathwayId(pathwayId);
//     } catch (err) {
//       console.error('Failed to select pathway:', err);
//     }
//   };

//   const handleBackToPathways = () => {
//     setSelectedJob(null);
//   };

//   const getStepIcon = (type) => {
//     const icons = {
//       job: '💼',
//       internship: '🎓',
//       course: '📚',
//       project: '📁',
//     };
//     return icons[type?.toLowerCase()] || '📌';
//   };

//   const formatDuration = (months) => {
//     if (!months && months !== 0) return '';
//     const totalMonths = Math.round(Number(months));
//     if (totalMonths === 0) return '0 months';
//     if (totalMonths < 12) return `${totalMonths} month${totalMonths > 1 ? 's' : ''}`;
//     const years = Math.floor(totalMonths / 12);
//     const remainingMonths = totalMonths % 12;
//     if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`;
//     return `${years}yr ${remainingMonths}mo`;
//   };

//   // Job/Course Details View - FULL SCREEN LAYOUT
//   if (selectedJob) {
//     return (
//       <MainLayout>
//         <div className="flex min-h-screen bg-gray-50">
//           {/* Left Sidebar - Improved UI */}
//           <aside className="sticky top-0 hidden h-screen overflow-y-auto bg-white border-r border-gray-200 shadow-sm lg:block w-96">
//             <div className="p-6">
//               <button
//                 onClick={handleBackToPathways}
//                 className="flex items-center gap-2 mb-6 text-sm font-medium text-gray-500 transition-colors hover:text-[#1e1e2d]"
//               >
//                 <span className="text-lg">←</span> Back to Pathways
//               </button>
              
//               <h2 className="mb-6 text-xl font-bold leading-tight text-[#1e1e2d]">
//                 Your personalised pathway overview
//               </h2>
              
//               <div className="space-y-4">
//                 {pathways.slice(0, 3).map((pathway) => {
//                   const isExpanded = expandedPathwayId === pathway.pathway_id;
                  
//                   return (
//                     <div
//                       key={pathway.pathway_id}
//                       className={`bg-white border rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${isExpanded ? 'border-[#9bc87c] ring-1 ring-[#9bc87c]' : 'border-gray-200'}`}
//                       onClick={() => handleExpand(pathway.pathway_id)}
//                     >
//                       <div className="flex items-center justify-between mb-2">
//                         <div>
//                           <p className="text-base font-bold text-[#1e1e2d]">Pathway {pathway.rank}</p>
//                           <p className="mt-1 text-sm text-gray-500 font-medium">
//                             {formatDuration(pathway.total_duration_months)}
//                           </p>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
//                             {pathway.steps?.length || 0} steps
//                           </span>
//                           <span className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
//                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                             </svg>
//                           </span>
//                         </div>
//                       </div>
                      
//                       {isExpanded && (
//                         <div className="mt-3 space-y-2 animate-fadeIn pt-2 border-t border-gray-100">
//                           {pathway.steps?.slice(0, 3).map((step, i) => (
//                             <div
//                               key={i}
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleStepClick(step.opportunity_id, step.opportunity_type);
//                               }}
//                               className="flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-100"
//                             >
//                               <span className="text-lg">{getStepIcon(step.opportunity_type)}</span>
//                               <span className="flex-1 truncate font-medium text-[#1e1e2d]">{step.opportunity_title}</span>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
              
//               <button
//                 onClick={() => setView('setup')}
//                 className="w-full py-3 mt-6 text-sm font-semibold text-white transition-all bg-[#1e1e2d] rounded-xl hover:bg-[#2a2a3b] shadow-sm"
//               >
//                 Generate New Pathway
//               </button>
//             </div>
//           </aside>

//           {/* Main Content - Full Width Job Details */}
//           <main className="flex-1 p-6 overflow-y-auto lg:p-8">
//             {jobLoading ? (
//               <div className="flex items-center justify-center h-96">
//                 <div className="text-center">
//                   <div className="w-12 h-12 mx-auto mb-4 border-4 border-[#9bc87c] rounded-full animate-spin border-t-transparent"></div>
//                   <p className="font-medium text-gray-500">Loading details...</p>
//                 </div>
//               </div>
//             ) : (
//               <div className="max-w-5xl p-8 mx-auto bg-white border border-gray-100 shadow-sm rounded-2xl lg:p-10">
//                 {/* Header */}
//                 <div className="flex flex-col items-start gap-6 pb-8 mb-8 border-b border-gray-100 md:flex-row">
//                   <div className="flex items-center justify-center flex-shrink-0 w-24 h-24 text-4xl font-bold text-gray-400 bg-gray-50 border border-gray-100 rounded-2xl">
//                     {selectedJob.logo_url ? (
//                       <img
//                         src={`${BASE_URL}/${selectedJob.logo_url}`}
//                         alt={selectedJob.company_name}
//                         className="object-contain w-16 h-16"
//                         onError={(e) => { e.target.style.display = 'none'; }}
//                       />
//                     ) : (
//                       selectedJob.company_name?.charAt(0) || 
//                       (selectedJob.opportunity_type === 'course' ? '📚' : '💼')
//                     )}
//                   </div>
//                   <div className="flex-1">
//                     <h1 className="mb-2 text-2xl font-bold leading-tight text-[#1e1e2d] lg:text-3xl">
//                       {selectedJob.job_role || selectedJob.title}
//                     </h1>
//                     <p className="mb-4 text-lg font-medium text-gray-500">{selectedJob.company_name}</p>
//                     <div className="flex flex-wrap gap-2">
//                       <span className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-xs font-semibold capitalize">
//                         {selectedJob.opportunity_type || 'resource'}
//                       </span>
//                       {selectedJob.job_type && (
//                         <span className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-xs font-semibold">
//                           {selectedJob.job_type}
//                         </span>
//                       )}
//                       {selectedJob.job_time && (
//                         <span className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-xs font-semibold">
//                           {selectedJob.job_time}
//                         </span>
//                       )}
//                       {selectedJob.salary && (
//                         <span className="px-3 py-1 bg-[#9bc87c]/10 text-[#1e1e2d] border border-[#9bc87c]/30 rounded-full text-xs font-semibold">
//                           {selectedJob.salary}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Info Cards */}
//                 <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
//                   <div className="p-5 border border-gray-100 bg-white shadow-sm rounded-xl">
//                     <p className="mb-1 text-sm font-medium text-gray-500">
//                       {selectedJob.opportunity_type === 'course' ? 'Fee' : 'Salary'}
//                     </p>
//                     <p className="text-lg font-bold text-[#1e1e2d]">
//                       {selectedJob.salary || selectedJob.fee || 'Not disclosed'}
//                     </p>
//                   </div>
//                   <div className="p-5 border border-gray-100 bg-white shadow-sm rounded-xl">
//                     <p className="mb-1 text-sm font-medium text-gray-500">Location</p>
//                     <p className="text-lg font-bold text-[#1e1e2d]">
//                       {selectedJob.eligible_cities?.[0]?.name || 
//                        selectedJob.location || 
//                        selectedJob.mode || 
//                        'Not specified'}
//                     </p>
//                   </div>
//                   <div className="p-5 border border-gray-100 bg-white shadow-sm rounded-xl">
//                     <p className="mb-1 text-sm font-medium text-gray-500">Duration</p>
//                     <p className="text-lg font-bold text-[#1e1e2d]">
//                       {formatDuration(selectedJob.duration) || 
//                        selectedJob.course_duration || 
//                        'Not specified'}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Description */}
//                 <div className="mb-8">
//                   <h2 className="flex items-center gap-3 mb-4 text-xl font-bold text-[#1e1e2d]">
//                     <span className="w-1.5 h-6 bg-[#9bc87c] rounded-full"></span>
//                     {selectedJob.opportunity_type === 'course' ? 'About Course' : 
//                      selectedJob.opportunity_type === 'project' ? 'Project Details' : 'Description'}
//                   </h2>
//                   <div className="p-6 border border-gray-100 bg-gray-50 rounded-xl">
//                     <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line sm:text-base">
//                       {selectedJob.job_description || selectedJob.description || 'No description available'}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Skills Required */}
//                 {selectedJob.skillsRequired && selectedJob.skillsRequired.length > 0 && (
//                   <div className="mb-8">
//                     <h2 className="flex items-center gap-3 mb-4 text-xl font-bold text-[#1e1e2d]">
//                       <span className="w-1.5 h-6 bg-[#9bc87c] rounded-full"></span>
//                       {selectedJob.opportunity_type === 'course' ? 'Skills You Will Learn' : 'Skills Required'}
//                     </h2>
//                     <div className="flex flex-wrap gap-2.5">
//                       {selectedJob.skillsRequired.map((skill, idx) => (
//                         <span
//                           key={idx}
//                           className="px-4 py-2 text-xs font-semibold text-[#1e1e2d] transition-colors border border-gray-200 rounded-lg bg-white hover:border-[#9bc87c]"
//                         >
//                           {typeof skill === 'object' ? skill.skill_name : skill}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* About Provider/Company */}
//                 {(selectedJob.aboutCompany || selectedJob.about_course || selectedJob.provider_description) && (
//                   <div className="mb-8">
//                     <h2 className="flex items-center gap-3 mb-4 text-xl font-bold text-[#1e1e2d]">
//                       <span className="w-1.5 h-6 bg-[#1e1e2d] rounded-full"></span>
//                       About {selectedJob.company_name}
//                     </h2>
//                     <div className="p-6 border border-gray-100 bg-gray-50 rounded-xl">
//                       <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
//                         {selectedJob.aboutCompany || selectedJob.about_course || selectedJob.provider_description}
//                       </p>
//                     </div>
//                   </div>
//                 )}

//                 {/* Eligibility/Curriculum for Courses */}
//                 {selectedJob.opportunity_type === 'course' && (
//                   <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
//                     {selectedJob.eligibility && (
//                       <div className="p-6 border border-gray-100 bg-white shadow-sm rounded-xl">
//                         <h3 className="mb-3 text-base font-bold text-[#1e1e2d]">Eligibility</h3>
//                         <p className="text-sm text-gray-600">{selectedJob.eligibility}</p>
//                       </div>
//                     )}
//                     {selectedJob.curriculum && (
//                       <div className="p-6 border border-gray-100 bg-white shadow-sm rounded-xl">
//                         <h3 className="mb-3 text-base font-bold text-[#1e1e2d]">Curriculum</h3>
//                         <p className="text-sm text-gray-600">{selectedJob.curriculum}</p>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 {/* Apply/Enroll Button */}
//                 <div className="flex flex-col gap-4 pt-8 mt-10 border-t border-gray-100 sm:flex-row">
//                   {selectedJob.url ? (
//                     <a
//                       href={selectedJob.url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="flex-1 py-3.5 text-base font-bold text-center text-white transition-colors bg-[#9bc87c] rounded-xl hover:bg-[#8ab76b]"
//                     >
//                       {selectedJob.opportunity_type === 'course' ? '🎓 Enroll Now' : 
//                        selectedJob.opportunity_type === 'project' ? '📁 View Project' : '💼 Apply Now'}
//                     </a>
//                   ) : (
//                     <button className="flex-1 py-3.5 text-base font-bold text-gray-500 bg-gray-100 border border-gray-200 cursor-not-allowed rounded-xl">
//                       Not Available
//                     </button>
//                   )}
//                   <button className="px-8 py-3.5 text-base font-bold text-[#1e1e2d] transition-colors bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
//                     💾 Save for Later
//                   </button>
//                 </div>
//               </div>
//             )}
//           </main>
//         </div>
//       </MainLayout>
//     );
//   }

//   // Pathways Results View
//   return (
//     <MainLayout>
//       <div className="flex items-start justify-center min-h-screen px-4 py-8 bg-gray-50 lg:px-8">
//         <div className="w-full max-w-4xl mx-auto">
//           {/* HEADER */}
//           {/* <div className="mb-8">
//             <div className="flex items-center justify-between">
//               <h1 className="text-2xl font-extrabold text-[#1e1e2d] sm:text-3xl">
//                 {view === 'results'
//                   ? 'Your personalised pathways'
//                   : 'Build Your Learning Pathway'}
//               </h1>
//               <button
//                 onClick={() => navigate("/student-dashboard")}
//                 className="text-sm font-medium text-gray-500 transition-colors hover:text-[#9bc87c]"
//               >
//                 Go To Dashboard
//               </button>
//             </div>
//           </div> */}

//           {/* HEADER */}
//           <PathwayPageHeader
//             title={view === 'results' ? 'Your personalised pathways' : 'Build Your Learning Pathway'}
//             onGoDashboard={() => navigate("/student-dashboard")}
//           />

//           {/* ERROR */}
//           {error && (
//             <div className="p-4 mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
//               {error}
//             </div>
//           )}

//           {/* SETUP */}
//           {view === 'setup' && preferences && (
//             <PathwaySetupForm
//               onSubmit={handleGenerate}
//               initialValues={initialFormValues}
//               locationState={state}
//             />
//           )}

//           {/* LOADING */}
//           {view === 'generating' && <PathwayGenerationLoader />}

//           {/* RESULTS UI */}
//           {view === 'results' && (
//             <div className="p-6 bg-white border border-gray-100 shadow-sm sm:p-8 rounded-2xl">
//               <div className="space-y-4">
//                 {pathways.length > 0 ? (
//                   pathways.slice(0, 3).map((pathway, index) => {
//                     const resourceTypes = [...new Set(
//                       pathway.steps?.map(s => s.opportunity_type || s.type)
//                     )].filter(Boolean);
//                     const totalSkills = pathway.steps?.reduce((acc, step) =>
//                       acc + (step.skills_gained?.length || 0), 0) || 0;
//                     const isExpanded = expandedPathwayId === pathway.pathway_id;
                    
//                     return (
//                       <div key={pathway.pathway_id} className="transition-all duration-300">
//                         {/* MAIN CARD */}
//                         <div
//                           className={`flex items-center justify-between p-5 transition-all cursor-pointer rounded-xl bg-white border ${isExpanded ? 'border-[#9bc87c] ring-1 ring-[#9bc87c]' : 'border-gray-200 hover:border-[#9bc87c] hover:shadow-sm'}`}
//                           onClick={() => handleExpand(pathway.pathway_id)}
//                         >
//                           <div className="flex items-center gap-4">
//                             <div className="flex items-center justify-center w-12 h-12 bg-gray-50 border border-gray-100 rounded-lg">
//                               <span className="text-xl">🗺️</span>
//                             </div>
//                             <div>
//                               <p className="text-lg font-bold text-[#1e1e2d]">
//                                 Pathway {pathway.rank || index + 1}
//                               </p>
//                               <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-gray-500">
//                                 {resourceTypes.length > 0 ? (
//                                   <span className="bg-gray-100 px-2.5 py-1 rounded-md font-medium capitalize">
//                                     {resourceTypes.join(', ')}
//                                   </span>
//                                 ) : (
//                                   <span className="bg-gray-100 px-2.5 py-1 rounded-md font-medium">
//                                     Internship, Course, Project
//                                   </span>
//                                 )}
//                                 <span className="bg-gray-100 px-2.5 py-1 rounded-md font-medium">
//                                   {formatDuration(pathway.total_duration_months)}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>
//                           <div className="flex items-center gap-3">
//                             <span className="px-3 py-1 text-xs font-semibold text-[#1e1e2d] bg-[#9bc87c]/10 rounded-full">
//                               {totalSkills} Skills
//                             </span>
//                             <span className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
//                               ▼
//                             </span>
//                           </div>
//                         </div>

//                         {/* EXPANDED DETAILS */}
//                         {isExpanded && (
//                           <div className="pl-4 mt-3 mb-6 space-y-3">
//                             {pathway.steps && pathway.steps.length > 0 ? (
//                               pathway.steps.map((step, i) => {
//                                 const stepTitle = step.opportunity_title || step.title;
//                                 const stepType = step.opportunity_type || step.type;
//                                 const stepDuration = step.duration_months;
//                                 const skillsGained = step.skills_gained || [];
//                                 return (
//                                   <div
//                                     key={step.step_id || i}
//                                     onClick={() => handleStepClick(step.opportunity_id, step.opportunity_type)}
//                                     className="flex items-center gap-4 p-4 transition-colors bg-white border border-gray-100 rounded-xl cursor-pointer hover:border-[#9bc87c] hover:shadow-sm"
//                                   >
//                                     <div className="flex items-center justify-center w-10 h-10 text-lg bg-gray-50 border border-gray-100 rounded-lg">
//                                       {getStepIcon(stepType)}
//                                     </div>
//                                     <div className="flex-1 min-w-0">
//                                       <p className="text-sm font-bold text-[#1e1e2d] truncate sm:text-base">
//                                         {stepTitle || "Opportunity"}
//                                       </p>
//                                       <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500 font-medium">
//                                         <span className="capitalize">{stepType || 'resource'}</span>
//                                         {stepDuration && (
//                                           <>• <span>{formatDuration(stepDuration)}</span></>
//                                         )}
//                                         {skillsGained.length > 0 && (
//                                           <>• <span>{skillsGained.length} skill{skillsGained.length > 1 ? 's' : ''}</span></>
//                                         )}
//                                       </div>
//                                       {skillsGained.length > 0 && (
//                                         <div className="flex flex-wrap gap-1.5 mt-2">
//                                           {skillsGained.slice(0, 3).map((skill, idx) => (
//                                             <span
//                                               key={idx}
//                                               className="text-[10px] bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5 rounded"
//                                             >
//                                               {skill.skill_name}
//                                             </span>
//                                           ))}
//                                           {skillsGained.length > 3 && (
//                                             <span className="text-[10px] text-gray-400 font-medium px-1 flex items-center">
//                                               +{skillsGained.length - 3} more
//                                             </span>
//                                           )}
//                                         </div>
//                                       )}
//                                     </div>
//                                     {step.url && (
//                                       <a
//                                         href={step.url}
//                                         target="_blank"
//                                         rel="noopener noreferrer"
//                                         className="text-sm font-semibold text-[#9bc87c] hover:text-[#8ab76b] whitespace-nowrap px-3 py-1.5 bg-gray-50 rounded-lg border border-transparent hover:border-[#9bc87c]/30 transition-colors"
//                                         onClick={(e) => e.stopPropagation()}
//                                       >
//                                         View
//                                       </a>
//                                     )}
//                                   </div>
//                                 );
//                               })
//                             ) : (
//                               <div className="py-4 text-sm text-center text-gray-500">
//                                 No steps available for this pathway
//                               </div>
//                             )}
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })
//                 ) : (
//                   <div className="py-10 text-center text-gray-500 border border-gray-100 rounded-xl bg-gray-50">
//                     No pathways generated. Please try again.
//                   </div>
//                 )}
//               </div>

//               {/* CTA Buttons */}
//               <div className="flex flex-wrap justify-center gap-3 mt-8">
//                 <button
//                   onClick={() => setView('setup')}
//                   className="px-6 py-2.5 text-sm font-semibold text-[#1e1e2d] bg-white border border-gray-200 rounded-lg transition-colors hover:bg-gray-50"
//                 >
//                   Generate New Pathways
//                 </button>
//                 {selectedPathwayId && (
//                   <button
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setExpandedPathwayId(selectedPathwayId);
//                     }}
//                     className="px-6 py-2.5 text-sm font-semibold text-white bg-[#9bc87c] rounded-lg transition-colors hover:bg-[#8ab76b]"
//                   >
//                     View Selected Pathway
//                   </button>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </MainLayout>
//   );
// };

// export default MyPathway;
















// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import MainLayout from '../components/layout/MainLayout';
// import FeedRightSidebar from '../pages/student/feed/FeedRightSidebar';
// import PathwaySetupForm from '../components/pathway/PathwaySetupForm';
// import PathwayGenerationLoader from '../components/pathway/PathwayGenerationLoader';
// import PathwayPageHeader from '../components/jobs/PathwayPageHeader';

// // Naye Custom Buttons Imports
// // import GenerateNewPathwaysButton from '../components/jobs/GenerateNewPathwaysButton'; 
// import GreenPrimaryButton from '../components/jobs/GreenPrimaryButton'; 

// import { useSelector } from "react-redux";

// const BASE_URL = import.meta.env.VITE_BASE_URL;

// const MyPathway = () => {
//   const [view, setView] = useState('setup');
//   const [preferences, setPreferences] = useState(null);
//   const [pathways, setPathways] = useState([]);
//   const [expandedPathwayId, setExpandedPathwayId] = useState(null);
//   const [selectedPathwayId, setSelectedPathwayId] = useState(null);
//   const [selectedJob, setSelectedJob] = useState(null);
//   const [jobLoading, setJobLoading] = useState(false);
//   const [error, setError] = useState(null);
  
//   const navigate = useNavigate();
//   const location = useLocation();
//   const state = location.state || {};
//   const { user } = useSelector((state) => state.auth);

//   // Load preferences
//   useEffect(() => {
//     try {
//       const saved = localStorage.getItem('user_pathway_preferences');
//       if (saved) {
//         setPreferences(JSON.parse(saved));
//       } else {
//         const defaults = {
//           include_courses: true,
//           include_projects: true,
//           include_internships: true,
//           include_jobs: true,
//         };
//         setPreferences(defaults);
//         localStorage.setItem('user_pathway_preferences', JSON.stringify(defaults));
//       }
//     } catch (err) {
//       setPreferences({
//         include_courses: true,
//         include_projects: true,
//         include_internships: true,
//         include_jobs: true,
//       });
//     }
//   }, []);

//   // Initial form values
//   const initialFormValues = React.useMemo(() => {
//     const base = {
//       resource_priority: ["internship", "project", "course"],
//       max_timeline: 365,
//       min_timeline: 1,
//     };
//     const includeDefaults = {
//       course: true,
//       project: true,
//       internship: true,
//       job: true,
//     };
//     if (state.jobId || state.jobTitle) {
//       return {
//         ...base,
//         strategy: "job_specific",
//         target_job_id: state.jobId,
//         target_job_title: state.jobTitle,
//         target_company_name: state.companyName,
//         include_resources: includeDefaults,
//       };
//     }
//     if (state.roleName) {
//       return {
//         ...base,
//         strategy: "role_specific",
//         target_role_name: state.roleName,
//         include_resources: includeDefaults,
//       };
//     }
//     return {
//       ...base,
//       strategy: "job_specific",
//       include_resources: includeDefaults,
//     };
//   }, [state]);

//   const handleGenerate = async (formValues) => {
//     setView('generating');
//     setError(null);
    
//     if (!user?.id) {
//       setError('User not logged in');
//       setView('setup');
//       return;
//     }

//     const apiPayload = {
//       user_id: user.id,
//       target_type: formValues.strategy_type,
//       ...(formValues.strategy_type === 'job_specific' && {
//         target_id: formValues.target_job_id,
//       }),
//       ...(formValues.strategy_type === 'role_specific' && {
//         target_role: formValues.target_role,
//       }),
//       user_preferences: {
//         include_courses: formValues.include_types.includes('course'),
//         include_projects: formValues.include_types.includes('project'),
//         include_internships: formValues.include_types.includes('internship'),
//         include_jobs: formValues.include_types.includes('job'),
//       },
//     };

//     try {
//       const apiCall = fetch(`${BASE_URL}/pathways/v4/generate`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(apiPayload),
//       }).then(res => res.json());

//       const minLoadingTime = new Promise(resolve => {
//         const delay = 7000 + Math.random() * 3000;
//         setTimeout(resolve, delay);
//       });

//       const [data] = await Promise.all([apiCall, minLoadingTime]);

//       if (data.success && Array.isArray(data.data?.pathways)) {
//         const enriched = data.data.pathways.map((p, idx) => ({
//           ...p,
//           pathway_id: p.pathway_id || `pathway-${Date.now()}-${idx}`,
//           rank: p.pathway_rank || idx + 1,
//           total_duration: p.total_duration_months,
//           steps: (p.steps || []).map((step, sIdx) => ({
//             ...step,
//             step_id: step.opportunity_id || `step-${Date.now()}-${idx}-${sIdx}`,
//             title: step.opportunity_title,
//             type: step.opportunity_type,
//             duration: step.duration_months ? `${step.duration_months} months` : null,
//             skills: step.skills_gained || [],
//           })),
//         }));
//         setPathways(enriched);
//         setView('results');
//       } else {
//         setError(data.message || 'Failed to generate pathways.');
//         setView('setup');
//       }
//     } catch (err) {
//       console.error('API Error:', err);
//       setError('Network error. Please try again.');
//       setView('setup');
//     }
//   };

//   const handleStepClick = async (opportunityId, opportunityType) => {
//     setJobLoading(true);
//     setError(null);
    
//     try {
//       const type = opportunityType?.toLowerCase();
//       const endpoint = `${BASE_URL}/pathways/v4/opportunities/${type}/${opportunityId}`;
      
//       const res = await fetch(endpoint);
//       if (!res.ok) throw new Error(`Failed to fetch ${type}`);
      
//       const responseData = await res.json();
      
//       if (responseData?.success && responseData?.data) {
//         const opportunity = responseData.data;
        
//         if (type === 'course') {
//           setSelectedJob({
//             ...opportunity,
//             opportunity_type: 'course',
//             job_role: opportunity.title || opportunity.course_name || opportunity.name,
//             company_name: opportunity.provider || opportunity.institution || opportunity.organization,
//             job_description: opportunity.description || opportunity.details || opportunity.about_course,
//             skillsRequired: opportunity.resourceSkills?.map(rs => rs.skill_name) || 
//                             opportunity.skills?.map(s => s.skill_name) || [],
//             duration: opportunity.duration || opportunity.course_duration,
//             url: opportunity.url || opportunity.course_url || opportunity.link,
//             logo_url: opportunity.logo || opportunity.image,
//             salary: opportunity.fee || opportunity.price || 'Free',
//             job_type: 'Course',
//             job_time: opportunity.mode || 'Online',
//             aboutCompany: opportunity.about_course || opportunity.provider_description,
//             eligibility: opportunity.eligibility,
//             curriculum: opportunity.curriculum,
//           });
//         } else {
//           setSelectedJob({
//             ...opportunity,
//             opportunity_type: type,
//             job_role: opportunity.job_role || opportunity.title || opportunity.job_title,
//             company_name: opportunity.company_name || opportunity.companyName,
//             job_description: opportunity.job_description || opportunity.description,
//             skillsRequired: opportunity.skills?.map(s => 
//               typeof s === 'object' ? s.skill_name : s
//             ) || opportunity.Skills?.map(s => s.skill_name) || [],
//             duration: opportunity.duration,
//             url: opportunity.url || opportunity.apply_url,
//             logo_url: opportunity.logo_url || opportunity.company_logo,
//             salary: opportunity.salary || opportunity.ctc,
//             job_type: opportunity.job_type || opportunity.employment_type,
//             job_time: opportunity.job_time || opportunity.work_mode,
//             hiringStatus: opportunity.hiring_status,
//             aboutCompany: opportunity.about_company || opportunity.company_description,
//             eligible_cities: opportunity.eligible_cities,
//             eligible_colleges: opportunity.eligible_colleges,
//             eligible_courses: opportunity.eligible_courses,
//             number_of_openings: opportunity.openings,
//             recruiter_full_name: opportunity.recruiter_name,
//             recruiterDesignationName: opportunity.recruiter_designation,
//             recruiter_profile_pic: opportunity.recruiter_image,
//             companyIndustry: opportunity.industry,
//             posted_days_ago: opportunity.posted_ago,
//             number_of_applicants: opportunity.applicants_count,
//           });
//         }
//       }
//     } catch (err) {
//       console.error(`Failed to fetch ${opportunityType} details:`, err);
//       setError(`Failed to load ${opportunityType} details`);
//     } finally {
//       setJobLoading(false);
//     }
//   };

//   const handleExpand = (id) => {
//     setExpandedPathwayId(expandedPathwayId === id ? null : id);
//   };

//   const handleSelect = async (pathwayId) => {
//     try {
//       setSelectedPathwayId(pathwayId);
//     } catch (err) {
//       console.error('Failed to select pathway:', err);
//     }
//   };

//   const handleBackToPathways = () => {
//     setSelectedJob(null);
//   };

//   const getStepIcon = (type) => {
//     const icons = {
//       job: '💼',
//       internship: '🎓',
//       course: '📚',
//       project: '📁',
//     };
//     return icons[type?.toLowerCase()] || '📌';
//   };

//   const formatDuration = (months) => {
//     if (!months && months !== 0) return '';
//     const totalMonths = Math.round(Number(months));
//     if (totalMonths === 0) return '0 months';
//     if (totalMonths < 12) return `${totalMonths} month${totalMonths > 1 ? 's' : ''}`;
//     const years = Math.floor(totalMonths / 12);
//     const remainingMonths = totalMonths % 12;
//     if (remainingMonths === 0) return `${years} year${years > 1 ? 's' : ''}`;
//     return `${years}yr ${remainingMonths}mo`;
//   };

//   // Job/Course Details View - FULL SCREEN LAYOUT
//   if (selectedJob) {
//     return (
//       <MainLayout>
//         <div className="flex min-h-screen bg-gray-50">
//           <aside className="sticky top-0 hidden h-screen overflow-y-auto bg-white border-r border-gray-200 shadow-sm lg:block w-96">
//             <div className="p-6">
//               <button
//                 onClick={handleBackToPathways}
//                 className="flex items-center gap-2 mb-6 text-sm font-medium text-gray-500 transition-colors hover:text-[#1e1e2d]"
//               >
//                 <span className="text-lg">←</span> Back to Pathways
//               </button>
              
//               <h2 className="mb-6 text-xl font-bold leading-tight text-[#1e1e2d]">
//                 Your personalised pathway overview
//               </h2>
              
//               <div className="space-y-4">
//                 {pathways.slice(0, 3).map((pathway) => {
//                   const isExpanded = expandedPathwayId === pathway.pathway_id;
//                   return (
//                     <div
//                       key={pathway.pathway_id}
//                       className={`bg-white border rounded-xl p-4 cursor-pointer transition-all duration-300 hover:shadow-md hover:scale-[1.01] ${isExpanded ? 'border-[#9bc87c] ring-1 ring-[#9bc87c]' : 'border-gray-200'}`}
//                       onClick={() => handleExpand(pathway.pathway_id)}
//                     >
//                       <div className="flex items-center justify-between mb-2">
//                         <div>
//                           <p className="text-base font-bold text-[#1e1e2d]">Pathway {pathway.rank}</p>
//                           <p className="mt-1 text-sm text-gray-500 font-medium">
//                             {formatDuration(pathway.total_duration_months)}
//                           </p>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
//                             {pathway.steps?.length || 0} steps
//                           </span>
//                           <span className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
//                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                             </svg>
//                           </span>
//                         </div>
//                       </div>
                      
//                       {isExpanded && (
//                         <div className="mt-3 space-y-2 animate-fadeIn pt-2 border-t border-gray-100">
//                           {pathway.steps?.slice(0, 3).map((step, i) => (
//                             <div
//                               key={i}
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleStepClick(step.opportunity_id, step.opportunity_type);
//                               }}
//                               className="flex items-center gap-3 px-3 py-2.5 text-sm transition-colors rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border border-gray-100"
//                             >
//                               <span className="text-lg">{getStepIcon(step.opportunity_type)}</span>
//                               <span className="flex-1 truncate font-medium text-[#1e1e2d]">{step.opportunity_title}</span>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>
              
//               <button
//                 onClick={() => setView('setup')}
//                 className="w-full py-3 mt-6 text-sm font-semibold text-white transition-all bg-[#1e1e2d] rounded-xl hover:bg-[#2a2a3b] shadow-sm"
//               >
//                 Generate New Pathway
//               </button>
//             </div>
//           </aside>

//           <main className="flex-1 p-6 overflow-y-auto lg:p-8">
//             {jobLoading ? (
//               <div className="flex items-center justify-center h-96">
//                 <div className="text-center">
//                   <div className="w-12 h-12 mx-auto mb-4 border-4 border-[#9bc87c] rounded-full animate-spin border-t-transparent"></div>
//                   <p className="font-medium text-gray-500">Loading details...</p>
//                 </div>
//               </div>
//             ) : (
//               <div className="max-w-5xl p-8 mx-auto bg-white border border-gray-100 shadow-sm rounded-2xl lg:p-10">
//                 <div className="flex flex-col items-start gap-6 pb-8 mb-8 border-b border-gray-100 md:flex-row">
//                   <div className="flex items-center justify-center flex-shrink-0 w-24 h-24 text-4xl font-bold text-gray-400 bg-gray-50 border border-gray-100 rounded-2xl">
//                     {selectedJob.logo_url ? (
//                       <img
//                         src={`${BASE_URL}/${selectedJob.logo_url}`}
//                         alt={selectedJob.company_name}
//                         className="object-contain w-16 h-16"
//                         onError={(e) => { e.target.style.display = 'none'; }}
//                       />
//                     ) : (
//                       selectedJob.company_name?.charAt(0) || 
//                       (selectedJob.opportunity_type === 'course' ? '📚' : '💼')
//                     )}
//                   </div>
//                   <div className="flex-1">
//                     <h1 className="mb-2 text-2xl font-bold leading-tight text-[#1e1e2d] lg:text-3xl">
//                       {selectedJob.job_role || selectedJob.title}
//                     </h1>
//                     <p className="mb-4 text-lg font-medium text-gray-500">{selectedJob.company_name}</p>
//                     <div className="flex flex-wrap gap-2">
//                       <span className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-xs font-semibold capitalize">
//                         {selectedJob.opportunity_type || 'resource'}
//                       </span>
//                       {selectedJob.job_type && (
//                         <span className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-xs font-semibold">
//                           {selectedJob.job_type}
//                         </span>
//                       )}
//                       {selectedJob.job_time && (
//                         <span className="px-3 py-1 bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-xs font-semibold">
//                           {selectedJob.job_time}
//                         </span>
//                       )}
//                       {selectedJob.salary && (
//                         <span className="px-3 py-1 bg-[#9bc87c]/10 text-[#1e1e2d] border border-[#9bc87c]/30 rounded-full text-xs font-semibold">
//                           {selectedJob.salary}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
//                   <div className="p-5 border border-gray-100 bg-white shadow-sm rounded-xl">
//                     <p className="mb-1 text-sm font-medium text-gray-500">
//                       {selectedJob.opportunity_type === 'course' ? 'Fee' : 'Salary'}
//                     </p>
//                     <p className="text-lg font-bold text-[#1e1e2d]">
//                       {selectedJob.salary || selectedJob.fee || 'Not disclosed'}
//                     </p>
//                   </div>
//                   <div className="p-5 border border-gray-100 bg-white shadow-sm rounded-xl">
//                     <p className="mb-1 text-sm font-medium text-gray-500">Location</p>
//                     <p className="text-lg font-bold text-[#1e1e2d]">
//                       {selectedJob.eligible_cities?.[0]?.name || 
//                        selectedJob.location || 
//                        selectedJob.mode || 
//                        'Not specified'}
//                     </p>
//                   </div>
//                   <div className="p-5 border border-gray-100 bg-white shadow-sm rounded-xl">
//                     <p className="mb-1 text-sm font-medium text-gray-500">Duration</p>
//                     <p className="text-lg font-bold text-[#1e1e2d]">
//                       {formatDuration(selectedJob.duration) || 
//                        selectedJob.course_duration || 
//                        'Not specified'}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="mb-8">
//                   <h2 className="flex items-center gap-3 mb-4 text-xl font-bold text-[#1e1e2d]">
//                     <span className="w-1.5 h-6 bg-[#9bc87c] rounded-full"></span>
//                     {selectedJob.opportunity_type === 'course' ? 'About Course' : 
//                      selectedJob.opportunity_type === 'project' ? 'Project Details' : 'Description'}
//                   </h2>
//                   <div className="p-6 border border-gray-100 bg-gray-50 rounded-xl">
//                     <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line sm:text-base">
//                       {selectedJob.job_description || selectedJob.description || 'No description available'}
//                     </p>
//                   </div>
//                 </div>

//                 {selectedJob.skillsRequired && selectedJob.skillsRequired.length > 0 && (
//                   <div className="mb-8">
//                     <h2 className="flex items-center gap-3 mb-4 text-xl font-bold text-[#1e1e2d]">
//                       <span className="w-1.5 h-6 bg-[#9bc87c] rounded-full"></span>
//                       {selectedJob.opportunity_type === 'course' ? 'Skills You Will Learn' : 'Skills Required'}
//                     </h2>
//                     <div className="flex flex-wrap gap-2.5">
//                       {selectedJob.skillsRequired.map((skill, idx) => (
//                         <span
//                           key={idx}
//                           className="px-4 py-2 text-xs font-semibold text-[#1e1e2d] transition-colors border border-gray-200 rounded-lg bg-white hover:border-[#9bc87c]"
//                         >
//                           {typeof skill === 'object' ? skill.skill_name : skill}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {(selectedJob.aboutCompany || selectedJob.about_course || selectedJob.provider_description) && (
//                   <div className="mb-8">
//                     <h2 className="flex items-center gap-3 mb-4 text-xl font-bold text-[#1e1e2d]">
//                       <span className="w-1.5 h-6 bg-[#1e1e2d] rounded-full"></span>
//                       About {selectedJob.company_name}
//                     </h2>
//                     <div className="p-6 border border-gray-100 bg-gray-50 rounded-xl">
//                       <p className="text-sm leading-relaxed text-gray-700 sm:text-base">
//                         {selectedJob.aboutCompany || selectedJob.about_course || selectedJob.provider_description}
//                       </p>
//                     </div>
//                   </div>
//                 )}

//                 {selectedJob.opportunity_type === 'course' && (
//                   <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2">
//                     {selectedJob.eligibility && (
//                       <div className="p-6 border border-gray-100 bg-white shadow-sm rounded-xl">
//                         <h3 className="mb-3 text-base font-bold text-[#1e1e2d]">Eligibility</h3>
//                         <p className="text-sm text-gray-600">{selectedJob.eligibility}</p>
//                       </div>
//                     )}
//                     {selectedJob.curriculum && (
//                       <div className="p-6 border border-gray-100 bg-white shadow-sm rounded-xl">
//                         <h3 className="mb-3 text-base font-bold text-[#1e1e2d]">Curriculum</h3>
//                         <p className="text-sm text-gray-600">{selectedJob.curriculum}</p>
//                       </div>
//                     )}
//                   </div>
//                 )}

//                 <div className="flex flex-col gap-4 pt-8 mt-10 border-t border-gray-100 sm:flex-row">
//                   {selectedJob.url ? (
//                     <a
//                       href={selectedJob.url}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="flex-1 py-3.5 text-base font-bold text-center text-white transition-colors bg-[#9bc87c] rounded-xl hover:bg-[#8ab76b]"
//                     >
//                       {selectedJob.opportunity_type === 'course' ? '🎓 Enroll Now' : 
//                        selectedJob.opportunity_type === 'project' ? '📁 View Project' : '💼 Apply Now'}
//                     </a>
//                   ) : (
//                     <button className="flex-1 py-3.5 text-base font-bold text-gray-500 bg-gray-100 border border-gray-200 cursor-not-allowed rounded-xl">
//                       Not Available
//                     </button>
//                   )}
//                   <button className="px-8 py-3.5 text-base font-bold text-[#1e1e2d] transition-colors bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
//                     💾 Save for Later
//                   </button>
//                 </div>
//               </div>
//             )}
//           </main>
//         </div>
//       </MainLayout>
//     );
//   }

//   // Pathways Results View
//   return (
//     <MainLayout>
//       <div className="flex items-start justify-center min-h-screen px-4 py-8 bg-gray-50 lg:px-8">
//         <div className="w-full max-w-4xl mx-auto">

//           <PathwayPageHeader
//             title={view === 'results' ? 'Your personalised pathways' : 'Build Your Learning Pathway'}
//             onGoDashboard={() => navigate("/student-dashboard")}
//           />

//           {error && (
//             <div className="p-4 mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
//               {error}
//             </div>
//           )}

//           {view === 'setup' && preferences && (
//             <PathwaySetupForm
//               onSubmit={handleGenerate}
//               initialValues={initialFormValues}
//               locationState={state}
//             />
//           )}

//           {view === 'generating' && <PathwayGenerationLoader />}

//           {view === 'results' && (
//             <div className="p-6 bg-white border border-gray-100 shadow-sm sm:p-8 rounded-2xl">
//               <div className="space-y-4">
//                 {pathways.length > 0 ? (
//                   pathways.slice(0, 3).map((pathway, index) => {
//                     const resourceTypes = [...new Set(
//                       pathway.steps?.map(s => s.opportunity_type || s.type)
//                     )].filter(Boolean);
//                     const totalSkills = pathway.steps?.reduce((acc, step) =>
//                       acc + (step.skills_gained?.length || 0), 0) || 0;
//                     const isExpanded = expandedPathwayId === pathway.pathway_id;
                    
//                     return (
//                       <div key={pathway.pathway_id} className="transition-all duration-300">
//                         <div
//                           className={`flex items-center justify-between p-5 transition-all cursor-pointer rounded-xl bg-white border ${isExpanded ? 'border-[#9bc87c] ring-1 ring-[#9bc87c]' : 'border-gray-200 hover:border-[#9bc87c] hover:shadow-sm'}`}
//                           onClick={() => handleExpand(pathway.pathway_id)}
//                         >
//                           <div className="flex items-center gap-4">
//                             <div className="flex items-center justify-center w-12 h-12 bg-gray-50 border border-gray-100 rounded-lg">
//                               <span className="text-xl">🗺️</span>
//                             </div>
//                             <div>
//                               <p className="text-lg font-bold text-[#1e1e2d]">
//                                 Pathway {pathway.rank || index + 1}
//                               </p>
//                               <div className="flex flex-wrap gap-2 mt-1.5 text-xs text-gray-500">
//                                 {resourceTypes.length > 0 ? (
//                                   <span className="bg-gray-100 px-2.5 py-1 rounded-md font-medium capitalize">
//                                     {resourceTypes.join(', ')}
//                                   </span>
//                                 ) : (
//                                   <span className="bg-gray-100 px-2.5 py-1 rounded-md font-medium">
//                                     Internship, Course, Project
//                                   </span>
//                                 )}
//                                 <span className="bg-gray-100 px-2.5 py-1 rounded-md font-medium">
//                                   {formatDuration(pathway.total_duration_months)}
//                                 </span>
//                               </div>
//                             </div>
//                           </div>
//                           <div className="flex items-center gap-3">
//                             <span className="px-3 py-1 text-xs font-semibold text-[#1e1e2d] bg-[#9bc87c]/10 rounded-full">
//                               {totalSkills} Skills
//                             </span>
//                             <span className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
//                               ▼
//                             </span>
//                           </div>
//                         </div>

//                         {isExpanded && (
//                           <div className="pl-4 mt-3 mb-6 space-y-3">
//                             {pathway.steps && pathway.steps.length > 0 ? (
//                               pathway.steps.map((step, i) => {
//                                 const stepTitle = step.opportunity_title || step.title;
//                                 const stepType = step.opportunity_type || step.type;
//                                 const stepDuration = step.duration_months;
//                                 const skillsGained = step.skills_gained || [];
//                                 return (
//                                   <div
//                                     key={step.step_id || i}
//                                     onClick={() => handleStepClick(step.opportunity_id, step.opportunity_type)}
//                                     className="flex items-center gap-4 p-4 transition-colors bg-white border border-gray-100 rounded-xl cursor-pointer hover:border-[#9bc87c] hover:shadow-sm"
//                                   >
//                                     <div className="flex items-center justify-center w-10 h-10 text-lg bg-gray-50 border border-gray-100 rounded-lg">
//                                       {getStepIcon(stepType)}
//                                     </div>
//                                     <div className="flex-1 min-w-0">
//                                       <p className="text-sm font-bold text-[#1e1e2d] truncate sm:text-base">
//                                         {stepTitle || "Opportunity"}
//                                       </p>
//                                       <div className="flex flex-wrap gap-2 mt-1 text-xs text-gray-500 font-medium">
//                                         <span className="capitalize">{stepType || 'resource'}</span>
//                                         {stepDuration && (
//                                           <>• <span>{formatDuration(stepDuration)}</span></>
//                                         )}
//                                         {skillsGained.length > 0 && (
//                                           <>• <span>{skillsGained.length} skill{skillsGained.length > 1 ? 's' : ''}</span></>
//                                         )}
//                                       </div>
//                                       {skillsGained.length > 0 && (
//                                         <div className="flex flex-wrap gap-1.5 mt-2">
//                                           {skillsGained.slice(0, 3).map((skill, idx) => (
//                                             <span
//                                               key={idx}
//                                               className="text-[10px] bg-gray-50 border border-gray-200 text-gray-600 px-2 py-0.5 rounded"
//                                             >
//                                               {skill.skill_name}
//                                             </span>
//                                           ))}
//                                           {skillsGained.length > 3 && (
//                                             <span className="text-[10px] text-gray-400 font-medium px-1 flex items-center">
//                                               +{skillsGained.length - 3} more
//                                             </span>
//                                           )}
//                                         </div>
//                                       )}
//                                     </div>
//                                     {step.url && (
//                                       <a
//                                         href={step.url}
//                                         target="_blank"
//                                         rel="noopener noreferrer"
//                                         className="text-sm font-semibold text-[#9bc87c] hover:text-[#8ab76b] whitespace-nowrap px-3 py-1.5 bg-gray-50 rounded-lg border border-transparent hover:border-[#9bc87c]/30 transition-colors"
//                                         onClick={(e) => e.stopPropagation()}
//                                       >
//                                         View
//                                       </a>
//                                     )}
//                                   </div>
//                                 );
//                               })
//                             ) : (
//                               <div className="py-4 text-sm text-center text-gray-500">
//                                 No steps available for this pathway
//                               </div>
//                             )}
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })
//                 ) : (
//                   <div className="py-10 text-center text-gray-500 border border-gray-100 rounded-xl bg-gray-50">
//                     No pathways generated. Please try again.
//                   </div>
//                 )}
//               </div>

//               {/* NAYE CTA BUTTONS YAHAN HAIN */}
//               <div className="flex flex-wrap justify-center gap-3 mt-8">
//                 <GreenPrimaryButton onClick={() => setView('setup')} />
                
//                 {selectedPathwayId && (
//                   <GreenPrimaryButton
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setExpandedPathwayId(selectedPathwayId);
//                     }}
//                   >
//                     View Selected Pathway
//                   </GreenPrimaryButton>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </MainLayout>
//   );
// };

// export default MyPathway;