import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { applicationApi } from "../api/applicationApi";

// Helper: format applied date
const formatAppliedDate = (dateStr) => {
  if (!dateStr) return "Unknown";
  const appliedDate = new Date(dateStr);
  const now = new Date();
  const diffMs = now - appliedDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
};

// Helper: build query string from filters object
const buildQueryString = (filters) => {
  const params = new URLSearchParams();

  if (filters.status) params.append("status", filters.status);
  if (filters.location) params.append("location", filters.location);
  if (filters.skills) params.append("skills", filters.skills);
  if (filters.matchMin != null) params.append("matchMin", filters.matchMin);
  if (filters.matchMax != null) params.append("matchMax", filters.matchMax);
  if (filters.gender) params.append("gender", filters.gender);
  if (filters.gradYears) params.append("gradYears", filters.gradYears);
  if (filters.educationBackground) {
    params.append("educationBackground", filters.educationBackground);
  }
  if (filters.assignmentStatus) {
    params.append("assignmentStatus", filters.assignmentStatus);
  }
  if (filters.interviewStatus) {
    params.append("interviewStatus", filters.interviewStatus);
  }

  return params.toString();
};

export const useApplications = (job_id, filters = {}) => {
  const { token } = useSelector((state) => state.auth);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!job_id || !token) {
      setLoading(false);
      return;
    }

    const fetchApplications = async () => {
      setLoading(true);
      setError(null);

      try {
        const queryString = buildQueryString(filters);
        const res = await applicationApi.getAllApplicantsByJob(
          job_id,
          queryString,
          token
        );

        const formatted = (res.applicants || []).map((app) => {
          let match = "Low";
          let matchColor = "bg-red-100 text-red-600";
          if (app.skillMatchPercentage >= 70) {
            match = "High";
            matchColor = "bg-green-100 text-green-600";
          } else if (app.skillMatchPercentage >= 40) {
            match = "Moderate";
            matchColor = "bg-orange-100 text-orange-600";
          }

          return {
            application_id: app.application_id,
            applicant_user_id: app.user_id,
            applicant_uuid: app.uuid,
            name: app.name,
            location: app.currentLocation || "Not specified",
            experience: app.totalExperience
              ? `${app.totalExperience} years`
              : "Not specified",
            applied: formatAppliedDate(app.appliedDate),
            match,
            matchColor,
            status: app.status,
            mandatorySkillsMet: app.mandatorySkillsMet,
            preferredSkillMatch:app.preferredSkillMatch,
          };
        });

        setApplications(formatted);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch applicants"
        );
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [job_id, token, JSON.stringify(filters)]); // re-run when filters change

  return { applications, loading, error };
};

export const useApplicantDetail = (job_id, application_id) => {
  const { token } = useSelector((state) => state.auth);
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!application_id) return;

    const fetchApplicantDetail = async () => {
      setLoading(true);
      try {
        if (!token) {
          setError("You must be logged in to view this applicant");
          setLoading(false);
          return;
        }

        const res = await applicationApi.getApplicationById(
          job_id,
          application_id,
          token
        );

        setApplicant({
          application_id: res.application_id,
          user_id: res.user_id,
          job_post_id: res.job_post_id,
          status: res.status,
          name: res.name,
          email: res.email,
          phone: res.phone,
          location: res.currentLocation || "Not specified",
          experience: res.experience || [],
          experienceDetails: res.experienceDetails || [],
          totalExperience: res.totalExperience
            ? `${res.totalExperience} years`
            : "Not specified",
          appliedDate: res.appliedDate,
          skills: res.skills || [],
          resumeUrl: res.resumeUrl || null,
          education: res.education || [],
          projects: res.projects || [],
          certifications: res.certifications || [],
          screeningQuestions: res.screeningQuestions || [],
          skillMatchPercentage: res.skillMatchPercentage || 0,
          skillMatchDetails: res.skillMatchDetails || {},
          applicationDetails: res.applicationDetails || null,
          mandatorySkillsMet: res.mandatorySkillsMet,
          preferredSkillMatch: res.matchPercentage,
        });


        // setApplicant({
        //   application_id: res.application_id,
        //   user_id: res.user_id,
        //   job_post_id: res.job_post_id,
        //   status: res.status,

        //   //  All these are inside res.applicationDetails
        //   name: res.applicationDetails.name || "—",
        //   email: res.applicationDetails.email || "—",
        //   phone: res.applicationDetails.phone || "—",
        //   location:
        //     res.applicationDetails.currentLocation?.name || "Not specified",

        //   //  Skills & match are directly in applicationDetails
        //   skills: res.applicationDetails.skills || [],
        //   skillMatch: res.applicationDetails.skillMatch || {
        //     overallPercentage: 0,
        //     passedMustHave: false,
        //     mustHave: { required: [], matched: [], missing: [] },
        //     preferred: { required: [], matched: [], missing: [] },
        //     suggestions: { missingMustHave: [], missingPreferred: [] },
        //   },

        //   //  Experience — use the clean version
        //   experienceDetails: res.applicationDetails.experienceDetails || [],

        //   // Education
        //   education: res.applicationDetails.education || [],

        //   // Application-specific answers
        //   whyShouldWeHireYou:
        //     res.applicationDetails.why_should_we_hire_you || "",
        //   confirmAvailability:
        //     res.applicationDetails.confirm_availability || false,
        //   githubLink: res.applicationDetails.github_link || "",
        //   portfolioLink: res.applicationDetails.portfolio_link || "",
        //   project: res.applicationDetails.project || "",

        //   // Resume
        //   resumeUrl: res.applicationDetails.resume || null,

        //   // For future: if you add appliedDate in backend, great — else compute from application.createdAt
        // });

        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch applicant");
      } finally {
        setLoading(false);
      }
    };

    fetchApplicantDetail();
  }, [job_id, application_id, token]);

  return { applicant, loading, error };
};


export const useScheduleInterview = () => {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const scheduleInterview = async (application_id, formData) => {
    console.log("schedule",application_id);
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!token) {
        setError("You must be logged in to schedule an interview");
        setLoading(false);
        return;
      }
      const res = await applicationApi.scheduleInterview(
        application_id,
        formData,
        token
      );

      setSuccess(res.message || "Interview scheduled successfully");
      return res;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to schedule interview");
    } finally {
      setLoading(false);
    }
  };

  return { scheduleInterview, loading, error, success };
};

export const useUpdateApplicationStatus = () => {
  const { token, user } = useSelector((state) => state.auth); // recruiter info
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [updatedApplication, setUpdatedApplication] = useState(null);

  const updateStatus = useCallback(
    async (application_id, job_post_id, status) => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      setUpdatedApplication(null);

      try {
        if (!token || !user?.id) {
          setError("You must be logged in as recruiter to update status");
          setLoading(false);
          return;
        }

        const res = await applicationApi.updateApplicationStatus(
          application_id,
          job_post_id,
          user.id, //  recruiter id
          status,
          token
        );

        setSuccess(res.message || "Application status updated");
        setUpdatedApplication(res.data || null); // backend sends updated app in res.data
        return res;
      } catch (err) {
        setError(err.message || "Failed to update application status");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token, user?.id]
  );

  return { updateStatus, loading, error, success, updatedApplication };
};

export const useGetStudentApplications = () => {
  const { token } = useSelector((state) => state.auth);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const res = await applicationApi.getStudentApplications(token);
        setApplications(res);
      } catch (err) {
        setError(err.message || "Failed to fetch applications");
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [token]);
  return { applications, loading, error };
};