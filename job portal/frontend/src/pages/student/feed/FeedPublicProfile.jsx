// src/pages/public/FeedPublicProfile.jsx
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { FaLink } from "react-icons/fa";
import MainLayout from "../../../components/layout/MainLayout";
import FeedRightSidebar from "../feed/FeedRightSidebar";
import { useSelector } from "react-redux";
import { getImageUrl } from "../../../../utils.js";
import dummyProfile3 from "../../../assets/dummyProfile3.jpg";
import { useUserDetailsApi } from "../../../hooks/useUserDetailsApi";
import ActivitySection from "../../../components/profile/ActivitySection";
import feedApi from "../../../api/feedApi";

const FeedPublicProfile = () => {
  const { uuid } = useParams(); // UUID from URL:
  const { token } = useSelector((state) => state.auth);

  const userUuid = uuid;

  const {
    profile,
    profileStats,
    userActivity,
    workExperiences,
    educationData,
    skillsData,
    loading: hookLoading,
    error: hookError,
    getUserPublicProfileByUUID,
  } = useUserDetailsApi();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Public profile URL (for sharing)
  const publicProfileUrl = profile?.uuid
    ? `${window.location.origin}/public-profile/${profile.uuid}`
    : "";

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard
      .writeText(text)
      .then(() => alert("Profile link copied!"))
      .catch(() => alert("Failed to copy link."));
  };

  // Fetch public profile by UUID (temporarily using existing API)
  useEffect(() => {
    if (!userUuid) {
      setError("Invalid profile link");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsFollowing(false);
        setFollowersCount(0);
        setFollowingCount(0);
        await getUserPublicProfileByUUID(userUuid, token, "all");
        // if (profileStats) {
        //   setIsFollowing(profileStats.is_following);
        //   setFollowersCount(profileStats.followers_count || 0);
        //   setFollowingCount(profileStats.following_count || 0);
        // }
      } catch (err) {
        console.error("Failed to load public profile:", err);
        setError("Failed to load public profile. It may not exist.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userUuid, token, getUserPublicProfileByUUID]);

  // // // Add this useEffect to sync profileStats
  useEffect(() => {
      
    if (profileStats) {
      setIsFollowing(profileStats.is_following);
      setFollowersCount(profileStats.followers_count || 0);
      setFollowingCount(profileStats.following_count || 0);
    }
  }, [profileStats]);
  console.log("profilestats",profileStats);

  const handleToggleFollow = async () => {
    if (!token) {
      // Redirect to login if not authenticated
      window.location.href = "/login";
      return;
    }

    try {
      const response = await feedApi.followUnfollowUser(profile.id, token);
      const is_following = response.is_following;

      // Optimistic UI update
      setIsFollowing(is_following);
      setFollowersCount((prev) =>
        is_following ? prev + 1 : Math.max(0, prev - 1)
      );
      console.log("updated the follow")
    } catch (err) {
      alert("Failed to update follow status. Please try again.");
    }
  };

  // Loading state
  if (loading || hookLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center min-h-screen px-2 bg-gray-100 lg:px-8">
          <p className="flex items-center justify-center w-full">
            Loading public profile...
          </p>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (error || hookError) {
    return (
      <MainLayout>
        <div className="flex justify-center min-h-screen px-2 bg-gray-100 lg:px-8">
          <p className="max-w-md text-center text-red-500">
            {error || hookError || "Profile not found."}
          </p>
        </div>
      </MainLayout>
    );
  }

  // Helper: Format date range (e.g., "Jan 2020 – Mar 2023")
  const formatDateRange = (start, end) => {
    const format = (dateStr) => {
      if (!dateStr) return "Present";
      const [year, month] = dateStr.split("-");
      const date = new Date(year, month - 1);
      return date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
    };
    return `${format(start)} – ${format(end || null)}`;
  };

  return (
    <MainLayout>
      <div className="flex justify-center min-h-screen px-2 bg-gray-100 lg:px-8">
        <div className="flex-grow hidden lg:block"></div>

        <section className="bg-white rounded-[10px] p-4 sm:p-6 shadow-lg mx-auto mt-2 w-full max-w-[729px] min-h-[1000px]">
          {/* Profile Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <div className="w-20 h-20 overflow-hidden border-4 border-gray-200 rounded-full sm:w-24 sm:h-24">
                <img
                  src={
                    profile?.user_profile_pic
                      ? getImageUrl(profile.user_profile_pic)
                      : dummyProfile3
                  }
                  alt={`${profile?.first_name || "User"}'s profile`}
                  className="object-cover w-full h-full"
                />
              </div>
              {/* Only show copy link icon (no camera) */}
              {publicProfileUrl && (
                <FaLink
                  onClick={() => copyToClipboard(publicProfileUrl)}
                  className="absolute w-4 h-4 text-blue-600 cursor-pointer hover:text-blue-800"
                  style={{ top: "5px", left: "100px" }}
                  title="Copy public profile link"
                />
              )}
            </div>

            <div className="mt-4 text-center">
              <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                {profile?.first_name} {profile?.last_name}
              </h1>
              <p className="text-sm text-gray-500">
                @{profile?.email?.split("@")[0] || "user"}
              </p>

              {/* Show Follow Button only if logged in AND not own profile */}
              {token && !profileStats?.is_own_profile && (
                <div className="flex flex-col items-center mt-3">
                  <button
                    onClick={handleToggleFollow}
                    className={`px-4 py-1.5 text-sm font-medium rounded-full mb-2 ${
                      isFollowing
                        ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                </div>
              )}

              {/* Follower / Following Counts (always visible) */}
              <div className="flex justify-center gap-6 mt-2 text-sm text-gray-600">
                <span>
                  <strong>{followersCount}</strong> followers
                </span>
                <span>
                  <strong>{followingCount}</strong> following
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* About */}
            <div>
              <h3 className="mb-2 font-semibold text-gray-900">About</h3>
              <p className="text-sm text-gray-700">
                {profile?.about_us || "No about provided."}
              </p>
            </div>

            {/* Career Objective */}
            {profile?.career_objective && (
              <div>
                <h3 className="mb-2 font-semibold text-gray-900">
                  Career Objective
                </h3>
                <p className="text-sm text-gray-700">
                  {profile.career_objective}
                </p>
              </div>
            )}

            {/* Activity */}
            <div>
              {/* <h3 className="mb-2 font-semibold text-gray-900">Activity</h3> */}
              <ActivitySection
                userActivity={userActivity}
                // No onPostCreated or onLike needed for public view (or make them no-ops)
                onPostCreated={() => {}}
                onLike={() => {}}
                isPublicView={true}
                profileUserId={profile?.user_id}
              />
            </div>

            {/* Skills */}
            <div>
              <h3 className="mb-2 font-semibold text-gray-900">Experience/Skills</h3>
              {skillsData?.length > 0 ? (
                <div className="space-y-3">
                  {skillsData.map((org) => (
                    <div
                      key={org.id}
                      className="flex gap-3 p-3 border rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 overflow-hidden bg-white border rounded-full">
                        {org.logo ? (
                          <img
                            src={getImageUrl(org.logo)}
                            alt={org.organization}
                            className="object-contain w-8 h-8"
                          />
                        ) : (
                          <span className="text-xs font-medium text-gray-600">
                            {org.organization.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900">
                          {org.organization}
                        </h4>
                        <p className="mb-1 text-xs text-gray-500">
                          {formatDateRange(org.start_date, org.end_date)}
                        </p>
                        <p className="text-sm text-gray-700">{org.skills}</p>
                        {org.hasCertificate && org.certificateUrl && (
                          <a
                            href={getImageUrl(org.certificateUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-1 text-sm text-blue-600 hover:underline"
                          >
                            📄 View Certificate
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No skills listed.</p>
              )}
            </div>

            {/* Work Experience */}
            {/* <div>
              <h3 className="mb-2 font-semibold text-gray-900">
                Work Experience
              </h3>
              {workExperiences?.length > 0 ? (
                <div className="space-y-3">
                  {workExperiences.map((exp) => (
                    <div key={exp.id} className="flex gap-3">
                      <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 overflow-hidden bg-white border rounded-full">
                        {exp.logo ? (
                          <img
                            src={getImageUrl(exp.logo)}
                            alt={exp.company}
                            className="object-contain w-8 h-8"
                          />
                        ) : (
                          <span className="text-xs font-medium text-gray-600">
                            {exp.company.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900">
                          {exp.position}
                        </h4>
                        <p className="text-sm text-gray-600">{exp.company}</p>
                        <p className="text-sm text-gray-500">{exp.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No work experience listed.
                </p>
              )}
            </div> */}
            

            {/* Education */}
            <div>
              <h3 className="mb-2 font-semibold text-gray-900">Education</h3>
              {educationData?.length > 0 ? (
                <div className="space-y-3">
                  {educationData.map((edu) => (
                    <div key={edu.id} className="flex gap-3">
                      <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 overflow-hidden bg-white border rounded-full">
                        {edu.logo ? (
                          <img
                            src={getImageUrl(edu.logo)}
                            alt={edu.institution}
                            className="object-contain w-8 h-8"
                          />
                        ) : (
                          <span className="text-xs font-medium text-gray-600">
                            {edu.institution.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900">
                          {edu.degree}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {edu.institution}
                        </p>
                        <p className="text-sm text-gray-500">{edu.duration}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No education details listed.
                </p>
              )}
            </div>

            {/* Languages */}
            {profile?.language && (
              <div>
                <h3 className="mb-2 font-semibold text-gray-900">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.language.split(",").map((lang, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1 text-sm text-gray-700"
                    >
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      {lang.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Authentication Badges */}
            <div>
              <h3 className="mb-2 font-semibold text-gray-900">Verification</h3>
              <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                <span
                  className={
                    profile?.is_email_verified
                      ? "text-green-600"
                      : "text-gray-500"
                  }
                >
                  Email (
                  {profile?.is_email_verified ? "Verified" : "Not verified"})
                </span>
                <span
                  className={
                    profile?.is_phone_verified
                      ? "text-green-600"
                      : "text-gray-500"
                  }
                >
                  Phone (
                  {profile?.is_phone_verified ? "Verified" : "Not verified"})
                </span>
                <span
                  className={
                    profile?.is_aadhaar_verified
                      ? "text-green-600"
                      : "text-gray-500"
                  }
                >
                  Aadhaar (
                  {profile?.is_aadhaar_verified ? "Verified" : "Not verified"})
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Sidebar (optional for public view) */}
        {/* <aside className="hidden lg:block w-full max-w-[350px] p-2 sticky top-4 h-fit">
          <FeedRightSidebar />
        </aside> */}
        <div className="flex-grow hidden lg:block"></div>
      </div>
    </MainLayout>
  );
};

export default FeedPublicProfile;
