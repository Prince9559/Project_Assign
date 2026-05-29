import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { userDetailsApi } from "../api/userDetailsApi";
import { formatDate, calculateTimeSpan } from "../../utils";

export const useUserDetailsApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileStats, setProfileStats] = useState(null);
  const [userActivity, setUserActivity] = useState([]);
  const [workExperiences, setWorkExperiences] = useState([]);
  const [educationData, setEducationData] = useState([]);
  const [skillsData, setSkillsData] = useState([]);
  const { token } = useSelector((state) => state.auth);

  // Create user details
  const createUserDetails = useCallback(
    async (userData) => {
      if (!token) return;
      try {
        setLoading(true);
        setError(null);
        const response = await userDetailsApi.createUserDetails(
          userData,
          token
        );
        return response;
      } catch (err) {
        console.error("Error creating user details:", err);
        setError("Failed to create user details. Please try again.");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Get user details by user_id
  const getUserDetails = useCallback(async (user_id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await userDetailsApi.getUserDetails(user_id);
      return response;
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError("Failed to fetch user details. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get public user profile by ID
  const getUserPublicProfileById = useCallback(async (user_id) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching public profile for user_id:", user_id);
      const response = await userDetailsApi.getUserPublicProfileById(user_id);
      return response;
    } catch (err) {
      console.error("Error fetching public user profile:", err);
      setError("Failed to fetch public user profile. Please try again.");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserPublicProfile = useCallback(
    async (user_id, userToken, dataType = "all") => {
      try {
        setLoading(true);
        setError(null);
        const response = await userDetailsApi.getUserPublicProfile(
          user_id,
          userToken,
          dataType
        );

        if (response.success && response.data) {
          const data = response.data;
          console.log("Raw user profile data:", data);
          // Set profile data
          setProfile(data.publicProfile || data);

          // Initialize formatted data variables
          let formattedActivity = [];
          let formattedExperiences = [];
          let formattedEducation = [];
          let formattedSkills = [];

          // Format and set activity data
          if (data.activity?.length) {
            formattedActivity = data.activity.map((activity, index) => ({
              id: activity.id || index + 1,
              content: activity.caption || "",
              image: activity.image,
              like_count: activity.like_count || 0,
              comment_count: activity.comment_count || 0,
              created_at: activity.created_at,
              slug: activity.slug,
              isLiked: activity.isLiked || false,
              // For simplicity, not parsing comments here
              // comments: activity.comments || [],
              user: {
                uuid: activity?.User?.uuid || null,
                first_name: activity?.User?.first_name || "User",
                last_name: activity?.User?.last_name || "",
                profileImage:
                  activity?.User?.UserDetail?.user_profile_pic || null,
                user_type: activity?.User?.user_role || "User",
                followers_count: activity?.User?.followersCount || 0,
              },
            }));
            setUserActivity(formattedActivity);
          } else {
            setUserActivity([]);
          }

          // Format and set experiences data
          if (data.experiences?.length) {
            formattedExperiences = data.experiences.map((exp, index) => ({
              id: exp.id || index + 1,
              logo: exp.company_logo || "/src/assets/WebsiteLogo.svg",
              company: exp.company_name || "Unknown Company",
              position: exp.job_role_title || "Unknown Position",
              duration: `${formatDate(exp.start_date)} - ${formatDate(
                exp.end_date
              )}`,
              timeSpan: calculateTimeSpan(exp.start_date, exp.end_date),
              description: `Worked as ${exp.job_role_title || "employee"} at ${
                exp.company_name || "company"
              }. Status: ${exp.status || "unknown"}`,
              status: exp.status,
            }));
            setWorkExperiences(formattedExperiences);
          } else {
            setWorkExperiences([]);
          }

          // // Format and set education data
          // if (data.educations?.length) {
          //   formattedEducation = data.educations.map((edu, index) => ({
          //     id: edu.id || index + 1,
          //     logo: edu.schoolCollegeEducations?.logo_pic,
          //     institution:
          //       edu.schoolCollegeEducations?.name || edu.other_institution_name ||  "Unknown Institution",
          //     degree: `${edu.level || ""}${
          //       edu.educationCourse?.name ? `${edu.educationCourse?.name}` : ""
          //     }${
          //       edu.educationSpecialization?.name
          //         ? ` - ${edu.educationSpecialization.name}`
          //         : ""
          //     }`,
          //     duration: `${formatDate(edu.start_date)} - ${formatDate(
          //       edu.end_date
          //     )}`,
          //     description: `Studied at ${
          //       edu.schoolCollegeEducations?.name || "institution"
          //     } under ${edu.board_or_university || "board"}. ${
          //       edu.percentage_or_cgpa
          //         ? `Achieved ${edu.percentage_or_cgpa}%`
          //         : ""
          //     }`,
          //     percentage: edu.percentage_or_cgpa,
          //     board: edu.board_or_university,
          //   }));
          //   setEducationData(formattedEducation);
          // } else {
          //   setEducationData([]);
          // }

          // Format and set education data
          if (data.educations?.length) {
            const formattedEducation = data.educations.map((edu, index) => {
              const institutionName =
                edu.schoolCollegeEducations?.name ||
                edu.other_institution_name ||
                "Unknown Institution";
              const courseName = edu.educationCourse?.name || "";
              const specializationName =
                edu.educationSpecialization?.name || "";
              const board = edu.board_or_university || "";
              const percentage = edu.percentage_or_cgpa;

              // Build degree string safely
              let degree = edu.level || "";
              if (courseName) {
                degree = courseName;
                if (specializationName) {
                  degree += ` - ${specializationName}`;
                }
              } else if (edu.level) {
                // Fallback to level if no course (e.g., for school)
                const levelLabel =
                  {
                    school: "School",
                    diploma: "Diploma",
                    bachelors: "Bachelor’s Degree",
                    masters: "Master’s Degree",
                    phd: "PhD",
                    other: "Certification",
                  }[edu.level] || edu.level;
                degree = levelLabel;
              }

              // Build description dynamically
              let descriptionParts = [];

              if (edu.level === "school") {
                if (board) {
                  descriptionParts.push(`Board: ${board}`);
                }
                if (edu.standard_or_grade) {
                  descriptionParts.push(`Standard: ${edu.standard_or_grade}`);
                }
              } else {
                if (courseName) {
                  descriptionParts.push(`Course: ${courseName}`);
                }
                if (specializationName) {
                  descriptionParts.push(
                    `Specialization: ${specializationName}`
                  );
                }
                if (board) {
                  descriptionParts.push(`University/Board: ${board}`);
                }
              }

              if (percentage) {
                descriptionParts.push(`Score: ${percentage}%`);
              }

              const description = descriptionParts.length
                ? descriptionParts.join(" | ")
                : `Studied at ${institutionName}`;

              return {
                id: edu.id || index + 1,
                logo: edu.schoolCollegeEducations?.logo_pic || null,
                institution: institutionName,
                degree: degree,
                duration: `${formatDate(edu.start_date)} - ${formatDate(
                  edu.end_date
                )}`,
                description: description,
                percentage: percentage,
                board: board,
              };
            });
            setEducationData(formattedEducation);
          } else {
            setEducationData([]);
          }

          // Format and set skills data
          if (data.skills?.length) {
            // Step 1: Group by authority_id
            const authorityMap = {};

            data.skills.forEach((entry) => {
              const authId = entry.authority_id || "self"; // use 'self' for self-taught
              if (!authorityMap[authId]) {
                // Initialize group
                authorityMap[authId] = {
                  authority_id: entry.authority_id,
                  authority: entry.authority,
                  start_date: entry.start_date,
                  end_date: entry.end_date,
                  allSkills: [],
                  certificates: [],
                };
              }

              const group = authorityMap[authId];

              // Merge skills
              if (entry.subSkills && Array.isArray(entry.subSkills)) {
                group.allSkills.push(...entry.subSkills);
              }

              // Collect certificates
              if (entry.certificate_image && entry.certificate_image.length) {
                group.certificates.push(...entry.certificate_image);
              }

              // Update date range to min/max
              if (entry.start_date) {
                if (!group.start_date || entry.start_date < group.start_date) {
                  group.start_date = entry.start_date;
                }
              }
              if (entry.end_date) {
                if (!group.end_date || entry.end_date > group.end_date) {
                  group.end_date = entry.end_date;
                }
              }
            });

            // Step 2: Deduplicate & format
            const formattedSkills = Object.values(authorityMap).map((group) => {
              const uniqueSkills = [...new Set(group.allSkills)]; // dedupe
              const uniqueCerts = [...new Set(group.certificates)];

              return {
                id: group.authority_id || "self",
                logo: group.authority?.logo_url || null,
                organization: group.authority?.name || "Self-taught",
                start_date: group.start_date,
                end_date: group.end_date,
                skills: uniqueSkills.join(", "),
                hasCertificate: uniqueCerts.length > 0,
                certificateUrl: uniqueCerts[0] || null, // or store all
              };
            });

            setSkillsData(formattedSkills);
          } else {
            setSkillsData([]);
          }

          return {
            profile: data.publicProfile || data,
            activity: formattedActivity,
            experiences: formattedExperiences,
            education: formattedEducation,
            skills: formattedSkills,
          };
        } else {
          setError(response.error || "Failed to fetch user details.");
          setProfile(null);
          setUserActivity([]);
          setWorkExperiences([]);
          setEducationData([]);
          setSkillsData([]);
          return null;
        }
      } catch (err) {
        console.error("Error fetching public user profile:", err);
        setError("Failed to fetch public user profile. Please try again.");
        setProfile(null);
        setUserActivity([]);
        setWorkExperiences([]);
        setEducationData([]);
        setSkillsData([]);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  //by uuid get details but can think of logic where both can be handled easily..or just merge both of them using uuid

  const getUserPublicProfileByUUID = useCallback(
    async (uuid, userToken, dataType = "all") => {
      try {
        setLoading(true);
        setError(null);
        const response = await userDetailsApi.getUserPublicProfileByUUID(
          uuid,
          userToken,
          dataType
        );

        if (response.success && response.data) {
          const data = response.data;
          console.log("Raw user profile data:", data);
          // Set profile data
          setProfile(data.publicProfile || data);
          setProfileStats(data.profileStats);

          // Initialize formatted data variables
          let formattedActivity = [];
          let formattedExperiences = [];
          let formattedEducation = [];
          let formattedSkills = [];

          // Format and set activity data
          if (data.activity?.length) {
            formattedActivity = data.activity.map((activity, index) => ({
              id: activity.id || index + 1,
              content: activity.caption || "",
              image: activity.image,
              like_count: activity.like_count || 0,
              comment_count: activity.comment_count || 0,
              created_at: activity.created_at,
              slug: activity.slug,
              isLiked: activity.isLiked || false,
              // For simplicity, not parsing comments here
              // comments: activity.comments || [],
              user: {
                uuid: activity?.User?.uuid || null,
                first_name: activity?.User?.first_name || "User",
                last_name: activity?.User?.last_name || "",
                profileImage:
                  activity?.User?.UserDetail?.user_profile_pic || null,
                user_type: activity?.User?.user_role || "User",
                followers_count: activity?.User?.followersCount || 0,
              },
            }));
            setUserActivity(formattedActivity);
          } else {
            setUserActivity([]);
          }

          // Format and set experiences data
          if (data.experiences?.length) {
            formattedExperiences = data.experiences.map((exp, index) => ({
              id: exp.id || index + 1,
              logo: exp.company_logo || "/src/assets/WebsiteLogo.svg",
              company: exp.company_name || "Unknown Company",
              position: exp.job_role_title || "Unknown Position",
              duration: `${formatDate(exp.start_date)} - ${formatDate(
                exp.end_date
              )}`,
              timeSpan: calculateTimeSpan(exp.start_date, exp.end_date),
              description: `Worked as ${exp.job_role_title || "employee"} at ${
                exp.company_name || "company"
              }. Status: ${exp.status || "unknown"}`,
              status: exp.status,
            }));
            setWorkExperiences(formattedExperiences);
          } else {
            setWorkExperiences([]);
          }

          if (data.educations?.length) {
            const formattedEducation = data.educations.map((edu, index) => {
              const institutionName =
                edu.schoolCollegeEducations?.name ||
                edu.other_institution_name ||
                "Unknown Institution";
              const courseName = edu.educationCourse?.name || "";
              const specializationName =
                edu.educationSpecialization?.name || "";
              const board = edu.board_or_university || "";
              const percentage = edu.percentage_or_cgpa;

              // Build degree string safely
              let degree = edu.level || "";
              if (courseName) {
                degree = courseName;
                if (specializationName) {
                  degree += ` - ${specializationName}`;
                }
              } else if (edu.level) {
                // Fallback to level if no course (e.g., for school)
                const levelLabel =
                  {
                    school: "School",
                    diploma: "Diploma",
                    bachelors: "Bachelor’s Degree",
                    masters: "Master’s Degree",
                    phd: "PhD",
                    other: "Certification",
                  }[edu.level] || edu.level;
                degree = levelLabel;
              }

              // Build description dynamically
              let descriptionParts = [];

              if (edu.level === "school") {
                if (board) {
                  descriptionParts.push(`Board: ${board}`);
                }
                if (edu.standard_or_grade) {
                  descriptionParts.push(`Standard: ${edu.standard_or_grade}`);
                }
              } else {
                if (courseName) {
                  descriptionParts.push(`Course: ${courseName}`);
                }
                if (specializationName) {
                  descriptionParts.push(
                    `Specialization: ${specializationName}`
                  );
                }
                if (board) {
                  descriptionParts.push(`University/Board: ${board}`);
                }
              }

              if (percentage) {
                descriptionParts.push(`Score: ${percentage}%`);
              }

              const description = descriptionParts.length
                ? descriptionParts.join(" | ")
                : `Studied at ${institutionName}`;

              return {
                id: edu.id || index + 1,
                logo: edu.schoolCollegeEducations?.logo_pic || null,
                institution: institutionName,
                degree: degree,
                duration: `${formatDate(edu.start_date)} - ${formatDate(
                  edu.end_date
                )}`,
                description: description,
                percentage: percentage,
                board: board,
              };
            });
            setEducationData(formattedEducation);
          } else {
            setEducationData([]);
          }

          // Format and set skills data
          if (data.skills?.length) {
            // Step 1: Group by authority_id
            const authorityMap = {};

            data.skills.forEach((entry) => {
              const authId = entry.authority_id || "self"; // use 'self' for self-taught
              if (!authorityMap[authId]) {
                // Initialize group
                authorityMap[authId] = {
                  authority_id: entry.authority_id,
                  authority: entry.authority,
                  start_date: entry.start_date,
                  end_date: entry.end_date,
                  allSkills: [],
                  certificates: [],
                };
              }

              const group = authorityMap[authId];

              // Merge skills
              if (entry.subSkills && Array.isArray(entry.subSkills)) {
                group.allSkills.push(...entry.subSkills);
              }

              // Collect certificates
              if (entry.certificate_image && entry.certificate_image.length) {
                group.certificates.push(...entry.certificate_image);
              }

              // Update date range to min/max
              if (entry.start_date) {
                if (!group.start_date || entry.start_date < group.start_date) {
                  group.start_date = entry.start_date;
                }
              }
              if (entry.end_date) {
                if (!group.end_date || entry.end_date > group.end_date) {
                  group.end_date = entry.end_date;
                }
              }
            });

            // Step 2: Deduplicate & format
            const formattedSkills = Object.values(authorityMap).map((group) => {
              const uniqueSkills = [...new Set(group.allSkills)]; // dedupe
              const uniqueCerts = [...new Set(group.certificates)];

              return {
                id: group.authority_id || "self",
                logo: group.authority?.logo_url || null,
                organization: group.authority?.name || "Self-taught",
                start_date: group.start_date,
                end_date: group.end_date,
                skills: uniqueSkills.join(", "),
                hasCertificate: uniqueCerts.length > 0,
                certificateUrl: uniqueCerts[0] || null, // or store all
              };
            });

            setSkillsData(formattedSkills);
          } else {
            setSkillsData([]);
          }

          return {
            profile: data.publicProfile || data,
            profileStats: data.profileStats,
            activity: formattedActivity,
            experiences: formattedExperiences,
            education: formattedEducation,
            skills: formattedSkills,
          };
        } else {
          setError(response.error || "Failed to fetch user details.");
          setProfile(null);
          setProfileStats(null);
          setUserActivity([]);
          setWorkExperiences([]);
          setEducationData([]);
          setSkillsData([]);
          return null;
        }
      } catch (err) {
        console.error("Error fetching public user profile:", err);
        setError("Failed to fetch public user profile. Please try again.");
        setProfile(null);
        setProfileStats(null);
        setUserActivity([]);
        setWorkExperiences([]);
        setEducationData([]);
        setSkillsData([]);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    loading,
    error,
    profile,
    profileStats,
    userActivity,
    workExperiences,
    educationData,
    skillsData,
    createUserDetails,
    getUserDetails,
    getUserPublicProfileById,
    getUserPublicProfile,
    getUserPublicProfileByUUID,
    setError,
  };
};
