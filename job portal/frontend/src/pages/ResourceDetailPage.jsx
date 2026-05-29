import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft, FiBookOpen, FiBriefcase, FiFolder, FiClock, FiCheck, FiX, FiExternalLink, FiStar } from 'react-icons/fi';
import MainLayout from '../components/layout/MainLayout';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

// Import API
import { pathwaysApi } from '../api/pathwaysApi';

// Resource type config
const RESOURCE_CONFIG = {
  course: {
    icon: FiBookOpen,
    color: 'bg-blue-500',
    label: 'Course',
  },
  project: {
    icon: FiFolder,
    color: 'bg-purple-500',
    label: 'Project',
  },
  internship: {
    icon: FiBriefcase,
    color: 'bg-orange-500',
    label: 'Internship',
  },
};

const DIFFICULTY_COLORS = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

const ResourceDetailPage = () => {
  const { id } = useParams(); // resource_id
  const navigate = useNavigate();
  const location = useLocation();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userSkills, setUserSkills] = useState(new Set());

  // Get back path — e.g., from pathway
  const backPath = location.state?.fromPathwayId 
    ? `/mypathway/${location.state.fromPathwayId}`
    : '/mypathway';

  // Fetch resource + user skills
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await pathwaysApi.getResourceById(id);
        if (res.success) {
          setResource(res.resource);
          // Assume user skills come from response or separate call
          // For now, mock — replace with real user skill fetch
          const mockUserSkillIds = [101, 103, 107]; // ← replace
          setUserSkills(new Set(mockUserSkillIds));
        } else {
          setError(res.message || 'Resource not found');
        }
      } catch (err) {
        console.error('Failed to load resource:', err);
        setError(err.response?.data?.error || 'Failed to load resource');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl px-4 py-8 mx-auto">
          <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="space-y-4 animate-pulse">
              <div className="w-1/3 h-8 bg-gray-200 rounded"></div>
              <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="max-w-2xl px-4 py-8 mx-auto">
          <div className="p-8 text-center bg-white border border-gray-200 shadow-sm rounded-xl">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
              <FiX className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-800">Oops!</h2>
            <p className="mb-6 text-gray-600">{error}</p>
            <Button
              variant="primary"
              onClick={() => navigate(backPath)}
              className="text-white bg-blue-600 hover:bg-blue-700"
            >
              ← Back to Pathway
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!resource) return null;

  const config = RESOURCE_CONFIG[resource.resource_type] || RESOURCE_CONFIG.course;
  const Icon = config.icon;

  // Group skills
  const prerequisites = resource.resourceSkills?.filter(rs => rs.skill_type === 'prerequisite') || [];
  const outcomes = resource.resourceSkills?.filter(rs => rs.skill_type === 'outcome') || [];

  // Skills user already has vs needs to learn (for this resource)
  const skillsToLearn = outcomes.filter(rs => !userSkills.has(rs.skill_id));
  const skillsAlreadyHave = outcomes.filter(rs => userSkills.has(rs.skill_id));

  return (
    <MainLayout>
      <div className="max-w-5xl px-4 py-6 mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="small"
          onClick={() => navigate(backPath)}
          className="flex items-center mb-6 text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="mr-2" /> Back to Pathway
        </Button>

        <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
          {/* Hero Banner */}
          <div className={`px-6 pt-6 pb-4 relative`} style={{ backgroundColor: config.color }}>
            <div className="flex flex-col justify-between md:flex-row md:items-center">
              <div className="flex items-center space-x-4">
                <div className={`w-16 h-16 rounded-lg ${config.color} flex items-center justify-center`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <span className="inline-block px-3 py-1 mb-1 text-xs font-medium text-white rounded-full bg-white/20">
                    {config.label}
                  </span>
                  <h1 className="text-2xl font-bold text-white md:text-3xl">{resource.title}</h1>
                  {resource.external_provider_name && (
                    <p className="mt-1 text-sm text-white/80">
                      by {resource.external_provider_name}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center mt-4 space-x-4 md:mt-0">
                {resource.rating && (
                  <div className="flex items-center text-white">
                    <FiStar className="w-5 h-5 mr-1 fill-current" />
                    <span className="font-medium">{resource.rating}</span>
                  </div>
                )}
                <Badge
                  color="bg-white/20 text-white border border-white/40"
                  text={`${parseFloat(resource.total_duration)} days`}
                />
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            {/* Description */}
            {resource.description && (
              <div className="mb-8">
                <h2 className="mb-3 text-lg font-semibold text-gray-800">About This {config.label}</h2>
                <p className="leading-relaxed text-gray-600 whitespace-pre-line">
                  {resource.description}
                </p>
              </div>
            )}

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-4 mb-8 md:grid-cols-4">
              <StatCard
                label="Duration"
                value={`${parseFloat(resource.total_duration)} days`}
                icon={FiClock}
              />
              <StatCard
                label="Difficulty"
                value={resource.difficulty_level?.replace('_', ' ')}
                icon={null}
                badgeColor={DIFFICULTY_COLORS[resource.difficulty_level] || 'bg-gray-100 text-gray-800'}
              />
              <StatCard
                label="Skills to Learn"
                value={skillsToLearn.length}
                icon={FiCheck}
                valueClass={skillsToLearn.length > 0 ? 'text-blue-600 font-bold' : 'text-gray-500'}
              />
              <StatCard
                label="You Already Know"
                value={skillsAlreadyHave.length}
                icon={FiCheck}
                valueClass="text-green-600 font-bold"
              />
            </div>

            {/* Skills Section */}
            <div className="mb-8 space-y-8">
              {/* Prerequisites */}
              {prerequisites.length > 0 && (
                <div>
                  <h3 className="flex items-center mb-3 text-lg font-semibold text-gray-800">
                    <FiCheck className="mr-2 text-gray-500" />
                    Prerequisites
                  </h3>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {prerequisites.map((rs) => (
                      <SkillBadge
                        key={rs.id || rs.skill_id}
                        skill={rs.skill}
                        type="prerequisite"
                        userHas={userSkills.has(rs.skill_id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Outcomes */}
              {outcomes.length > 0 && (
                <div>
                  <h3 className="flex items-center mb-3 text-lg font-semibold text-gray-800">
                    <FiCheck className="mr-2 text-blue-500" />
                    You Will Learn
                  </h3>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {outcomes.map((rs) => (
                      <SkillBadge
                        key={rs.id || rs.skill_id}
                        skill={rs.skill}
                        type="outcome"
                        userHas={userSkills.has(rs.skill_id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-4 pt-6 border-t sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-600">
                {resource.resource_type === 'job' ? (
                    <span>Apply now to the opportunity available.</span>
                ) : resource.resource_type === 'internship' ? (
                  <span>Apply now to secure your spot — limited seats available.</span>
                ) : resource.resource_type === 'project' ? (
                  <span>Start this project anytime — self-paced.</span>
                ) : (
                  <span>Enroll to begin your learning journey.</span>
                )}
              </div>
              <div className="flex space-x-3">
                {resource.external_url ? (
                  <Button
                    variant="primary"
                    onClick={() => window.open(resource.external_url, '_blank')}
                    className="text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FiExternalLink className="mr-2" /> Go to {config.label}
                  </Button>
                  ) : resource.job_post_id ? (
                                  <Button
                                      variant="primary"
                                      onClick={() => navigate(`/jobs/${resource.job_post_id}`)}
                                      className="text-white bg-blue-600 hover:bg-blue-700"
                                  >
                                      <FiExternalLink className="mr-2" /> Go to {resource.resource_type}
                                  </Button>
                              ):(
                  <Button
                    variant="primary"
                    className="text-white bg-blue-600 hover:bg-blue-700"
                    
                  >
                    {(resource.resource_type === 'internship' || resource.resource_type === 'job') ? 'Apply Now' : 'Start Learning'}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => navigate(backPath)}
                  className="text-gray-700 border-gray-300 hover:bg-gray-50"
                >
                  Later
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// Helper Components

const StatCard = ({ label, value, icon: Icon, valueClass = 'text-gray-900 font-bold', badgeColor }) => (
  <div className="p-4 rounded-lg bg-gray-50">
    <div className="mb-1 text-xs text-gray-500">{label}</div>
    {badgeColor ? (
      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${badgeColor}`}>
        {value}
      </span>
    ) : Icon ? (
      <div className="flex items-center">
        <Icon className="w-5 h-5 mr-2 text-gray-400" />
        <span className={valueClass}>{value}</span>
      </div>
    ) : (
      <span className={valueClass}>{value}</span>
    )}
  </div>
);

const SkillBadge = ({ skill, type, userHas }) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  let prefix = '';

  if (type === 'prerequisite') {
    bgColor = userHas ? 'bg-green-100' : 'bg-yellow-100';
    textColor = userHas ? 'text-green-800' : 'text-yellow-800';
    prefix = userHas ? '✓ ' : '⚠️ ';
  } else {
    bgColor = userHas ? 'bg-green-100' : 'bg-blue-100';
    textColor = userHas ? 'text-green-800' : 'text-blue-800';
    prefix = userHas ? '✓ ' : '';
  }

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {prefix}{skill?.skill_name || 'Unknown Skill'}
      {type === 'prerequisite' && !userHas && (
        <span className="ml-1 bg-yellow-200 text-yellow-800 px-1.5 py-0.5 rounded text-[10px] font-bold">
          Req
        </span>
      )}
    </span>
  );
};

export default ResourceDetailPage;