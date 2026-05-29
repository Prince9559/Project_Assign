// import React from "react";
// import { useNavigate } from "react-router-dom";
// import dummyProfile1 from "../../../assets/dummyProfile1.jpg";
// import dummyProfile2 from "../../../assets/dummyProfile2.jpg";
// import dummyProfile3 from "../../../assets/dummyProfile3.jpg";

// const RecruiterRightSidebar = () => {
//     const navigate = useNavigate();

//     const profileVisitors = [
//         { name: "Olivia Rhye", img: dummyProfile1 },
//         { name: "Phoenix Baker", img: dummyProfile2 },
//         { name: "Lana Steiner", img: dummyProfile3 },
//         { name: "Milo Thorne", img: dummyProfile1 },
//         { name: "Olivia Rhye", img: dummyProfile1 },
//         { name: "Lana Steiner", img: dummyProfile3 },
//         { name: "Milo Thorne", img: dummyProfile1 },
//         { name: "Phoenix Baker", img: dummyProfile2 },
//     ];

//     const stats = [
//         { value: "367", label: "Views today" },
//         { value: "15", label: "Post views" },
//         { value: "09", label: "Search appearance" },
//     ];

//     return (
       
//             <div className="bg-white flex flex-col w-[375px] min-h-[553.42px] rounded-[10px] p-[20px_10px] gap-[30px] relative opacity-100 top-[5px]">
//                 {/* Post a Job Button */}
//                 <button
//                     onClick={() => navigate("/recruiter-post-opportunity-selector")}
//                     className="w-full py-2 text-lg font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
//                 >
//                     Post a Job
//                 </button>

//                 {/* Profile Visitors */}
//                 <div>
//                     <h2 className="text-lg font-semibold">Profile Visitors</h2>
//                     <div className="grid grid-cols-4 gap-3 mt-3">
//                         {profileVisitors.map((visitor, index) => (
//                             <div key={index} className="flex flex-col items-center">
//                                 <img
//                                     src={visitor.img}
//                                     alt={visitor.name}
//                                     className="object-cover rounded-md w-14 h-14"
//                                 />
//                                 <p className="mt-1 text-xs text-center text-gray-700">
//                                     {visitor.name}
//                                 </p>
//                             </div>
//                         ))}
//                     </div>
//                     <button
//                         onClick={() => navigate("/recruiter-see-more-visitors")}
//                         className="block mt-2 text-sm text-center text-blue-500 hover:underline"
//                     >
//                         See more
//                     </button>
//                 </div>

//                 {/* Divider */}
//                 <hr />

//                 {/* Dashboard Stats */}
//                 <div>
//                     <h2 className="text-lg font-semibold">Your Dashboard</h2>
//                     <div className="grid grid-cols-3 mt-3 text-center">
//                         {stats.map((stat, idx) => (
//                             <div key={idx}>
//                                 <p className="text-2xl font-bold text-yellow-600">
//                                     {stat.value}
//                                 </p>
//                                 <p className="text-xs text-gray-600">{stat.label}</p>
//                             </div>
//                         ))}
//                     </div>
//                     <button
//                         onClick={() => navigate("/recruiter-see-more-dashboard-stats")}
//                         className="block mt-2 text-sm text-center text-blue-500 hover:underline"
//                     >
//                         See more
//                     </button>
//                 </div>
//             </div>
      
//     );
// };

// export default RecruiterRightSidebar;


























// src/components/RecruiterRightSidebar.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import dummyProfile3 from "../../../assets/dummyProfile3.jpg";
import { FaUserFriends } from "react-icons/fa";
import feedApi from "../../../api/feedApi";
import { getProfileViews } from "../../../api/analyticsApi";
import { getImageUrl } from "../../../../utils";

// Reuse helpers
const getAvatar = (viewItem) => {
    const { viewer, viewer_profile } = viewItem;
    if (viewer_profile?.profile_pic) return getImageUrl(viewer_profile.profile_pic);
    if (viewer?.user_profile_pic) return getImageUrl(viewer.user_profile_pic);
    return dummyProfile3;
};

const getDisplayName = (user, roleProfile) => {
    if (!user) return "Anonymous";
    const name = `${user.first_name} ${user.last_name}`.trim();
    if (user.user_role === "COMPANY" && roleProfile?.company_name) {
        return `${name} (${roleProfile.company_name})`;
    }
    if (user.user_role === "UNIVERSITY" && roleProfile?.college_name) {
        return `${name} (${roleProfile.college_name})`;
    }
    return name;
};

import ProfileVisitorsModal from "../../../components/modals/ProfileVisitorsModal";

const RecruiterRightSidebar = () => {
    const navigate = useNavigate();
    const { token, user: currentUser } = useSelector((state) => state.auth);

    // State
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [profileViews, setProfileViews] = useState([]);
    const [totalViews, setTotalViews] = useState(0);
    const [uniqueViewers, setUniqueViewers] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch data on mount
    useEffect(() => {
        if (!token || !currentUser?.id) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                const [
                    followersRes,
                    followingRes,
                    viewsRes,
                ] = await Promise.all([
                    feedApi.getFollowers(token, currentUser.id).catch(() => ({ count: 0 })),
                    feedApi.getFollowing(token, currentUser.id).catch(() => ({ count: 0 })),
                    getProfileViews(token).catch(() => ({ meta: { total_views: 0, unique_viewers: 0 }, views: [] })),
                ]);

                setFollowersCount(followersRes.count || 0);
                setFollowingCount(followingRes.count || 0);
                setProfileViews(viewsRes.views || []);
                setTotalViews(viewsRes.meta?.total_views || 0);
                setUniqueViewers(viewsRes.meta?.unique_viewers || 0);
            } catch (err) {
                console.error("Recruiter sidebar fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token, currentUser?.id]);

    // Stats (now dynamic)
    const stats = [
        { value: loading ? "..." : totalViews, label: "Profile views" },
        { value: loading ? "..." : followersCount, label: "Followers" },
        { value: loading ? "..." : followingCount, label: "Following" },
    ];

    return (
        <div className="bg-white flex flex-col w-[375px] min-h-[553.42px] rounded-[10px] p-[20px_10px] gap-[30px] relative opacity-100 top-[5px]">
            {/* Post a Job Button */}
           <button
                onClick={() => navigate("/recruiter-post-opportunity-selector")}
                className="w-full py-2 text-lg font-medium text-white bg-red-500 rounded-lg hover:bg-red-600"
            >
                Post a Job
            </button> 


            {/* Profile Visitors */}
            <div>
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Profile Visitors</h2>
                    <span className="text-xs text-gray-500">({uniqueViewers} unique)</span>
                </div>
                {loading ? (
                    <div className="grid grid-cols-4 gap-3 mt-3">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <div className="bg-gray-200 rounded-md w-14 h-14 animate-pulse" />
                                <div className="w-12 h-3 mt-1 bg-gray-200 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-3 mt-3">
                            {profileViews.slice(0, 8).map((view, index) => {
                                const displayName = getDisplayName(view.viewer, view.viewer_profile);
                                const uuid = view.viewer?.uuid; 

                                const handleViewClick = () => {
                                    if (uuid) {
                                        navigate(`/public-profile/${uuid}`);
                                    }
                                };

                                return (
                                    <div
                                        key={index}
                                        onClick={handleViewClick}
                                        className="flex flex-col items-center cursor-pointer group"
                                    >
                                        <img
                                            src={getAvatar(view)}
                                            alt={displayName}
                                            className="object-cover transition border rounded-md w-14 h-14 group-hover:ring-2 ring-blue-300"
                                            onError={(e) => (e.currentTarget.src = dummyProfile3)}
                                        />
                                        <p className="mt-1 text-[10px] text-center text-gray-700 line-clamp-1 w-14">
                                            {displayName}
                                        </p>
                                    </div>
                                );
                            })}
                    </div>
                )}


                

                <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={loading || profileViews.length === 0}
                    className={`block mt-2 text-sm text-center ${loading || profileViews.length === 0
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-blue-500 hover:underline cursor-pointer"
                        }`}
                >
                    See more
                </button>
            </div>

            {/* Divider */}
            <hr />

            {/* Dashboard Stats */}
            <div>
                <h2 className="text-lg font-semibold">Your Dashboard</h2>
                <div className="grid grid-cols-3 mt-3 text-center">
                    {stats.map((stat, idx) => (
                        <div key={idx}>
                            <p className="text-2xl font-bold text-blue-600">{stat.value}</p>
                            <p className="text-xs text-gray-600">{stat.label}</p>
                        </div>
                    ))}
                </div>
                {/* <button
                    onClick={() => navigate("/recruiter-analytics")} // ← Recommended route
                    className="block mt-2 text-sm text-center text-blue-500 hover:underline"
                >
                    See more
                </button> */}
            </div>

            {/* Modal */}
            <ProfileVisitorsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                visitors={profileViews}
                totalViews={totalViews}
                uniqueViewers={uniqueViewers}
            />
        </div>
    );
};

export default RecruiterRightSidebar;