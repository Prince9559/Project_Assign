// src/hooks/usePublicProfile.js
import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const usePublicProfile = () => {
  const [profile, setProfile] = useState(null);
  const [profileStats, setProfileStats] = useState(null);
  const [details, setDetails] = useState(null); // raw API details
  const [userActivity, setUserActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ======================
  // STUDENT-DERIVED DATA
  // ======================
  const workExperiences = useMemo(() => {
    if (profile?.user_role !== "STUDENT" || !details?.experiences) return [];
    return details.experiences.map((exp) => ({
      id: exp.id,
      company: exp.company_name || exp.organization_name || "N/A",
      logo: exp.company_logo,
      position: exp.job_role_title || "Role not specified",
      duration: formatDuration(exp.start_date, exp.end_date),
      start_date: exp.start_date,
      end_date: exp.end_date,
    }));
  }, [profile?.user_role, details?.experiences]);

  const educationData = useMemo(() => {
    if (profile?.user_role !== "STUDENT" || !details?.educations) return [];
    return details.educations.map((edu) => ({
      id: edu.id,
      institution:
        edu.schoolCollegeEducations?.name ||
        edu.other_institution_name ||
        "Institution not specified",
      logo: edu.schoolCollegeEducations?.logo_pic || null,
      degree: edu.educationCourse?.name || edu.level || "Degree not specified",
      specialization: edu.educationSpecialization?.name || null,
      duration: formatDuration(edu.start_date, edu.end_date),
      start_date: edu.start_date,
      end_date: edu.end_date,
    }));
  }, [profile?.user_role, details?.educations]);

  const skillsData = useMemo(() => {
    if (profile?.user_role !== "STUDENT" || !details?.skills) return [];
    return details.skills.map((group) => ({
      id: group.authority.id || group.domain_id || Math.random(),
      organization: group.authority.name || "Other",
      logo: group.authority.logo_url,
      skills: group.subSkills.join(", "),
      hasCertificate: !!(
        group.certificate_image && group.certificate_image.length > 0
      ),
      certificateUrl: group.certificate_image?.[0],
      duration: formatDuration(group.start_date, group.end_date),
      start_date: group.start_date,
      end_date: group.end_date,
    }));
  }, [profile?.user_role, details?.skills]);

  // ======================
  // COMPANY-DERIVED DATA
  // ======================
  const recentJobs = useMemo(() => {
    if (profile?.user_role !== "COMPANY" || !details?.recent_jobs) return [];
    return details.recent_jobs.map((job) => ({
      id: job.id,
      title: job.title || "Job Title Not Available",
      type: job.type || "Not specified",
      stipend_range: job.stipend_range,
      start_date: job.start_date
        ? new Date(job.start_date).toLocaleDateString()
        : "N/A",
      skills: job.skills || [],
      views: job.views || 0,
    }));
  }, [profile?.user_role, details?.recent_jobs]);

  // ======================
  // UNIVERSITY-DERIVED DATA
  // ======================
  const academicCourses = useMemo(() => {
    if (profile?.user_role !== "UNIVERSITY" || !details?.courses) return [];
    return details.courses;
  }, [profile?.user_role, details?.courses]);

  const universityWebsite = useMemo(() => {
    return profile?.user_role === "UNIVERSITY"
      ? details?.website || null
      : null;
  }, [profile?.user_role, details?.website]);

  // ======================
  // FETCH FUNCTION
  // ======================
  const getUserPublicProfileByUUID = useCallback(async (uuid, token) => {
    if (!uuid) {
      setError("UUID is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : {};

      const response = await axios.get(`${BASE_URL}/user-details/public_profile/${uuid}`, config);
      console.log("the overall public data",response.data);

      const {
        profile: apiProfile,
        stats,
        details: apiDetails,
        activity,
      } = response.data;

      setProfile(apiProfile);
      setProfileStats(stats);
      setDetails(apiDetails);
      setUserActivity(activity || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load public profile"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Core data
    profile,
    profileStats,
    details, // <-- full raw role-specific data (for future use)
    userActivity,

    // Student data (empty for non-students)
    workExperiences,
    educationData,
    skillsData,

    // Company data (empty for non-companies)
    recentJobs,

    // University data (empty/falsy for non-universities)
    academicCourses,
    universityWebsite,

    // State
    loading,
    error,

    // Actions
    getUserPublicProfileByUUID,
  };
};

// Helper: Format "MMM YYYY – MMM YYYY" or "Present"
function formatDuration(startDate, endDate) {
  if (!startDate) return "Dates not specified";
  const start = formatDatePart(startDate);
  const end = endDate ? formatDatePart(endDate) : "Present";
  return `${start} – ${end}`;
}

function formatDatePart(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

export default usePublicProfile;
