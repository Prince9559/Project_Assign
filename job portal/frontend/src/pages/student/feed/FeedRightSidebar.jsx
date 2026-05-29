// import { useSelector } from "react-redux";
// import cover from "../../../assets/cover.png";
// import dummyProfile3 from "../../../assets/dummyProfile3.jpg";
// import dummyProfile1 from "../../../assets/dummyProfile1.jpg";
// import dummyProfile2 from "../../../assets/dummyProfile2.jpg";
// import { FaCamera } from "react-icons/fa6";
// import { useEffect, useState } from "react";
// import feedApi from "../../../api/feedApi.js";
// import { getImageUrl } from "../../../../utils.js";

 

// const visitors = [
//   { name: "Olivia Rhye", img: dummyProfile1 },
//   { name: "Phoenix Baker", img: dummyProfile2 },
//   { name: "Lana Steiner", img: dummyProfile3 },
//   { name: "Milo Thorne", img: dummyProfile1 },
//   { name: "Olivia Rhye", img: dummyProfile1 },
//   { name: "Lana Steiner", img: dummyProfile3 },
//   { name: "Milo Thorne", img: dummyProfile1 },
//   { name: "Phoenix Baker", img: dummyProfile2 },
// ];

// export default function FeedRightSidebar() {
  
//   const [followers, setFollowers] = useState([]);
//   const [followersCount, setFollowersCount] = useState(0);
//   const [following, setFollowing] = useState([]); // Added for following
//   const [followingCount, setFollowingCount] = useState(0); // Added for following count
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const { token, user } = useSelector((state) => state.auth);

 

//   useEffect(() => {
//     async function fetchFollowersAndFollowing() {
//       if (!token) return;
//       setLoading(true);
//       setError(null);
//       try {
//         const { count: followersCount, followers } = await feedApi.getFollowers(
//           token,user.id
//         );
//         setFollowers(followers);
//         setFollowersCount(followersCount);

//         const { count: followingCount, following } = await feedApi.getFollowing(
//           token,user.id
//         );
//         setFollowing(following);
//         setFollowingCount(followingCount);
//       } catch (err) {
//         setError("Failed to load followers/following");
//       } finally {
//         setLoading(false);
//       }
//     }
//     if (token) {
//       fetchFollowersAndFollowing();
//     }
//   }, [user.id,token]);

//   return (
//     <div>
//       <div className="p-4 bg-white border rounded shadow">
//         {/* Cover + Profile */}
//         <div className="relative h-20 mb-12">
//           <div
//             className="w-full h-20 bg-center bg-cover rounded-t"
//             style={{ backgroundImage: `url(${cover})` }}
//           ></div>
//           {/* <div className="absolute flex items-center justify-center w-6 h-6 bg-blue-600 border rounded-full top-2 right-2">
//                         <FaCamera className='w-3 h-3 text-white' />
//                     </div> */}
//           <div className="absolute w-24 h-24 left-2 top-10">
//             <img
//               src={ user?.user_profile_pic? getImageUrl(user.user_profile_pic): dummyProfile3}
//               alt="Profile"
//               className="object-cover w-full h-full border-4 border-white rounded-full"
//             />
//           </div>
//         </div>
        
//         {/* Profile Info */}
//         <div className="pt-4">
//           {loading ? (
//             <div>Loading profile...</div>
//           ) : error ? (
//             <div className="mt-1 text-xs text-red-500">{error}</div>
//           ) : token ? (
//             <>
//               <h2 className="text-lg font-bold text-gray-800">
//                 {user.first_name} {user.last_name}
//               </h2>
//               <p className="text-sm text-gray-500">{user?.email}</p>

//               <p className="mt-1 text-sm font-semibold text-gray-700">
//                 {user.organization_name? user.organization_name :user.user_role}
//               </p>
//               <p className="mt-2 text-sm text-gray-600">{user.about_us}</p>
//             </>
//           ) : null}
//           <div className="flex gap-2 mt-4">
//             <button className="px-3 py-1 text-sm text-blue-600 bg-gray-100 rounded">
//               {loading ? "Loading..." : `${followersCount} followers`}
//             </button>
//             <button className="px-3 py-1 text-sm text-blue-600 bg-gray-100 rounded">
//               {loading ? "Loading..." : `${followingCount} following`}
//             </button>
//           </div>
//           {/* error already shown above */}
//         </div>

//         {/* Dashboard */}
//         <div className="mt-4">
//           <h3 className="pt-4 font-semibold text-gray-800 border-t">
//             Your Dashboard
//           </h3>
//           <div className="flex justify-between mt-2 text-lg font-bold text-yellow-500">
//             <div>
//               <p className="text-2xl">367</p>
//               <p className="text-xs text-gray-500">Views today</p>
//             </div>
//             <div>
//               <p className="text-2xl">15</p>
//               <p className="text-xs text-gray-500">Post views</p>
//             </div>
//             <div>
//               <p className="text-2xl">09</p>
//               <p className="text-xs text-gray-500">Search appearance</p>
//             </div>
//           </div>
//           <p className="mt-2 text-sm text-center text-blue-600 cursor-pointer">
//             See more
//           </p>
//         </div>
//         {/* Profile Visitors */}
//         <div className="mt-4">
//           <h3 className="pt-4 font-semibold text-gray-800 border-t">
//             Profile Visitors
//           </h3>
//           <div className="grid grid-cols-4 gap-2 mt-2">
//             {visitors.map((visitor, index) => (
//               <div key={index} className="text-center">
//                 <img
//                   src={visitor.img}
//                   alt={visitor.name}
//                   className="object-cover w-12 h-12 mx-auto rounded"
//                 />
//                 <p className="mt-1 text-xs text-gray-600">{visitor.name}</p>
//               </div>
//             ))}
//           </div>
//           <p className="mt-2 text-sm text-center text-blue-600 cursor-pointer">
//             See more {}
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }












//with new design =======================================

// import { useSelector } from "react-redux";
// import cover from "../../../assets/cover.png";
// import dummyProfile3 from "../../../assets/dummyProfile3.jpg";
// import { FaEye, FaUserFriends } from "react-icons/fa";
// import { useEffect, useState } from "react";
// import feedApi from "../../../api/feedApi";
// import {getProfileViews} from "../../../api/analyticsApi";
// import { getImageUrl } from "../../../../utils";

// // Helper: get avatar from user or role profile
// const getAvatar = (viewItem) => {
//   // viewItem = one entry from `profileViews`
//   const { viewer, viewer_profile } = viewItem;

//   // 1. Try role-specific profile pic
//   if (viewer_profile?.profile_pic) {
//     return getImageUrl(viewer_profile.profile_pic);
//   }

//   // 2. Fallback to user-level profile pic (if any)
//   if (viewer?.user_profile_pic) {
//     return getImageUrl(viewer.user_profile_pic);
//   }

//   // 3. Final fallback
//   return dummyProfile3;
// };

// // Helper: get display name
// const getDisplayName = (user, roleProfile) => {
//   if (!user) return "Anonymous";
//   const name = `${user.first_name} ${user.last_name}`.trim();
//   if (user.user_role === "COMPANY" && roleProfile?.company_name) {
//     return `${name} (${roleProfile.company_name})`;
//   }
//   if (user.user_role === "UNIVERSITY" && roleProfile?.college_name) {
//     return `${name} (${roleProfile.college_name})`;
//   }
//   return name;
// };

// export default function FeedRightSidebar() {
//   const { token, user: currentUser } = useSelector((state) => state.auth);

//   // State
//   const [followers, setFollowers] = useState([]);
//   const [followersCount, setFollowersCount] = useState(0);
//   const [following, setFollowing] = useState([]);
//   const [followingCount, setFollowingCount] = useState(0);
//   const [profileViews, setProfileViews] = useState([]);
//   const [totalViews, setTotalViews] = useState(0);
//   const [uniqueViewers, setUniqueViewers] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (!token || !currentUser?.id) return;

//     const fetchData = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         // Parallel API calls — no waterfall delay
//         const [
//           followersRes,
//           followingRes,
//           viewsRes
//         ] = await Promise.all([
//           feedApi.getFollowers(token, currentUser.id).catch(() => ({ count: 0, followers: [] })),
//           feedApi.getFollowing(token, currentUser.id).catch(() => ({ count: 0, following: [] })),
//           getProfileViews(token).catch(() => ({ meta: { total_views: 0, unique_viewers: 0 }, views: [] })),
//         ]);

//         // Followers
//         setFollowers(followersRes.followers || []);
//         setFollowersCount(followersRes.count || 0);

//         // Following
//         setFollowing(followingRes.following || []);
//         setFollowingCount(followingRes.count || 0);

//         // Profile Views
//         const viewsData = viewsRes.views || [];
//         console.log("the views data",viewsData);
//         setProfileViews(viewsData); // top 8 for sidebar
//         setTotalViews(viewsRes.meta?.total_views || 0);
//         setUniqueViewers(viewsRes.meta?.unique_viewers || 0);

//         console.log("profileViews", profileViews);
//       } catch (err) {
//         console.error("Sidebar data fetch error:", err);
//         setError("Failed to load dashboard data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // --- Render Helpers ---
//   const renderDashboardItem = (value, label, icon) => (
//     <div className="flex flex-col items-center">
//       <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50">
//         {icon}
//       </div>
//       <p className="mt-1 text-xl font-bold text-gray-800">{value}</p>
//       <p className="text-xs text-gray-500">{label}</p>
//     </div>
//   );

//   return (
//     <div>
//       <div className="p-4 bg-white border rounded shadow">
//         {/* Cover + Profile */}
//         <div className="relative h-20 mb-12">
//           <div
//             className="w-full h-20 bg-center bg-cover rounded-t"
//             style={{ backgroundImage: `url(${cover})` }}
//           />
//           <div className="absolute w-24 h-24 left-2 top-10">
//             <img
//               src={currentUser?.user_profile_pic ? getImageUrl(currentUser.user_profile_pic) : dummyProfile3}
//               alt="Profile"
//               className="object-cover w-full h-full border-4 border-white rounded-full"
//             />
//           </div>
//         </div>

//         {/* Profile Info */}
//         <div className="pt-4">
//           {token ? (
//             <>
//               <h2 className="text-lg font-bold text-gray-800">
//                 {currentUser?.first_name} {currentUser?.last_name}
//               </h2>
//               <p className="text-sm text-gray-500">{currentUser?.email}</p>
//               <p className="mt-1 text-sm font-semibold text-gray-700">
//                 {currentUser?.user_role === "COMPANY"
//                   ? "Company Recruiter"
//                   : currentUser?.user_role === "UNIVERSITY"
//                   ? "University"
//                   : "Student"}
//               </p>
//               <p className="mt-2 text-sm text-gray-600 line-clamp-2">
//                 {currentUser?.about_us || "No bio yet."}
//               </p>
//             </>
//           ) : (
//             <div className="text-sm text-gray-500">Not logged in</div>
//           )}

//           <div className="flex gap-2 mt-4">
//             <button className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 bg-gray-100 rounded">
//               <FaUserFriends className="text-xs" />
//               {loading ? "..." : followersCount} followers
//             </button>
//             <button className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 bg-gray-100 rounded">
//               <FaUserFriends className="text-xs rotate-180" />
//               {loading ? "..." : followingCount} following
//             </button>
//           </div>
//         </div>

//         {/* Dashboard Stats */}
//         <div className="mt-4">
//           <h3 className="pt-4 font-semibold text-gray-800 border-t">Your Dashboard</h3>
//           <div className="grid grid-cols-3 gap-3 mt-3">
//             {renderDashboardItem(
//               loading ? "..." : totalViews,
//               "Profile views",
//               <FaEye className="w-5 h-5 text-blue-600" />
//             )}
//             {renderDashboardItem(
//               loading ? "..." : followersCount,
//               "Followers",
//               <FaUserFriends className="w-5 h-5 text-green-600" />
//             )}
//             {renderDashboardItem(
//               loading ? "..." : followingCount,
//               "Following",
//               <FaUserFriends className="w-5 h-5 text-purple-600 rotate-180" />
//             )}
//           </div>
//           <p className="mt-2 text-sm text-center text-blue-600 cursor-pointer hover:underline">
//             See full analytics →
//           </p>
//         </div>

//         {/* Profile Visitors */}
//         <div className="mt-4">
//           <h3 className="pt-4 font-semibold text-gray-800 border-t">Recent Profile Visitors</h3>
//           {loading ? (
//             <div className="grid grid-cols-4 gap-2 mt-2">
//               {[...Array(8)].map((_, i) => (
//                 <div key={i} className="flex flex-col items-center">
//                   <div className="w-12 h-12 bg-gray-200 rounded animate-pulse" />
//                   <div className="w-16 h-3 mt-1 bg-gray-200 rounded animate-pulse" />
//                 </div>
//               ))}
//             </div>
//           ) : profileViews.length > 0 ? (
//             <div className="grid grid-cols-4 gap-2 mt-2">
//                 {profileViews.map((view, index) => (
//                   <div key={index} className="text-center group">
//                     <img
//                       src={getAvatar(view)} // ← pass entire `view` object
//                       alt={view.name}
//                       className="object-cover w-12 h-12 mx-auto transition border rounded group-hover:ring-2 ring-blue-300"
//                       onError={(e) => (e.currentTarget.src = dummyProfile3)}
//                     />
//                     <p className="mt-1 text-xs text-gray-600 line-clamp-1">
//                       {view.name}
//                     </p>
//                     <p className="text-[10px] text-gray-400">
//                       {new Date(view.viewed_at).toLocaleDateString()}
//                     </p>
//                   </div>
//                 ))}
//             </div>
//           ) : (
//             <p className="mt-2 text-sm text-gray-500">No visitors yet.</p>
//           )}

//           <p className="mt-2 text-sm text-center text-blue-600 cursor-pointer hover:underline">
//             See all visitors ({uniqueViewers})
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

































// import { useSelector } from "react-redux";
// import cover from "../../../assets/cover.png";
// import dummyProfile3 from "../../../assets/dummyProfile3.jpg";
// import { FaEye, FaUserFriends } from "react-icons/fa";
// import { useEffect, useState } from "react";
// import feedApi from "../../../api/feedApi";
// import { getProfileViews } from "../../../api/analyticsApi";
// import { getImageUrl } from "../../../../utils";
// import {useNavigate} from "react-router-dom";

// // ─── Helpers ────────────────────────────────────────────────────────────────

// const getAvatar = (viewItem) => {
//   const { viewer, viewer_profile } = viewItem;

//   if (viewer_profile?.profile_pic) {
//     return getImageUrl(viewer_profile.profile_pic);
//   }
//   if (viewer?.user_profile_pic) {
//     return getImageUrl(viewer.user_profile_pic);
//   }
//   return dummyProfile3;
// };

// const getDisplayName = (user, roleProfile) => {
//   if (!user) return "Anonymous";
//   const name = `${user.first_name} ${user.last_name}`.trim();
//   if (user.user_role === "COMPANY" && roleProfile?.company_name) {
//     return `${name} (${roleProfile.company_name})`;
//   }
//   if (user.user_role === "UNIVERSITY" && roleProfile?.college_name) {
//     return `${name} (${roleProfile.college_name})`;
//   }
//   return name;
// };

// // ─── Component ──────────────────────────────────────────────────────────────

// export default function FeedRightSidebar() {
//   const { token, user: currentUser } = useSelector((state) => state.auth);
//   const [showVisitorsModal, setShowVisitorsModal] = useState(false);

//   const [followersCount, setFollowersCount] = useState(0);
//   const [followingCount, setFollowingCount] = useState(0);
//   const [profileViews, setProfileViews] = useState([]);
//   const [totalViews, setTotalViews] = useState(0);
//   const [uniqueViewers, setUniqueViewers] = useState(0);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const navigate= useNavigate();

//   useEffect(() => {
//     if (!token || !currentUser?.id) {
//       setLoading(false);
//       return;
//     }

//     const fetchData = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         const [
//           followersRes,
//           followingRes,
//           viewsRes,
//         ] = await Promise.all([
//           feedApi.getFollowers(token, currentUser.id).catch(() => ({ count: 0, followers: [] })),
//           feedApi.getFollowing(token, currentUser.id).catch(() => ({ count: 0, following: [] })),
//           getProfileViews(token).catch(() => ({ meta: { total_views: 0, unique_viewers: 0 }, views: [] })),
//         ]);

//         setFollowersCount(followersRes.count || 0);
//         setFollowingCount(followingRes.count || 0);

//         const viewsData = viewsRes.views || [];
//         setProfileViews(viewsData.slice(0, 8)); // Top 8 for sidebar
//         setTotalViews(viewsRes.meta?.total_views || 0);
//         setUniqueViewers(viewsRes.meta?.unique_viewers || 0);
//       } catch (err) {
//         console.error("Sidebar data fetch error:", err);
//         setError("Failed to load dashboard data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [token, currentUser?.id]);

//   return (
//     <div>
//       <div className="p-4 bg-white border rounded shadow">
//         {/* Cover + Profile */}
//         <div className="relative h-20 mb-12">
//           <div
//             className="w-full h-20 bg-center bg-cover rounded-t"
//             style={{ backgroundImage: `url(${cover})` }}
//           />
//           <div className="absolute w-24 h-24 left-2 top-10">
//             <img
//               src={currentUser?.user_profile_pic ? getImageUrl(currentUser.user_profile_pic) : dummyProfile3}
//               alt="Profile"
//               className="object-cover w-full h-full border-4 border-white rounded-full"
//             />
//           </div>
//         </div>

//         {/* Profile Info */}
//         <div className="pt-4">
//           {loading ? (
//             <div>Loading profile...</div>
//           ) : error ? (
//             <div className="mt-1 text-xs text-red-500">{error}</div>
//           ) : token ? (
//             <>
//               <h2 className="text-lg font-bold text-gray-800">
//                 {currentUser?.first_name} {currentUser?.last_name}
//               </h2>
//               <p className="text-sm text-gray-500">{currentUser?.email}</p>
//               <p className="mt-1 text-sm font-semibold text-gray-700">
//                 {currentUser?.user_role === "COMPANY"
//                   ? "Company Recruiter"
//                   : currentUser?.user_role === "UNIVERSITY"
//                     ? "University"
//                     : "Student"}
//               </p>
//               <p className="mt-2 text-sm text-gray-600 line-clamp-2">
//                 {currentUser?.about_us || "No bio yet."}
//               </p>
//             </>
//           ) : null}

//           <div className="flex gap-2 mt-4">
//             <button className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 bg-gray-100 rounded">
//               <FaUserFriends className="text-xs" />
//               {loading ? "..." : followersCount} followers
//             </button>
//             <button className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 bg-gray-100 rounded">
//               <FaUserFriends className="text-xs rotate-180" />
//               {loading ? "..." : followingCount} following
//             </button>
//           </div>
//         </div>

//         {/* Dashboard */}
//         <div className="mt-4">
//           <h3 className="pt-4 font-semibold text-gray-800 border-t">Your Dashboard</h3>
//           <div className="grid grid-cols-3 gap-3 mt-3">
//             <div className="flex flex-col items-center">
//               <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50">
//                 <FaEye className="w-5 h-5 text-blue-600" />
//               </div>
//               <p className="mt-1 text-xl font-bold text-gray-800">
//                 {loading ? "..." : totalViews}
//               </p>
//               <p className="text-xs text-gray-500">Profile views</p>
//             </div>
//             <div className="flex flex-col items-center">
//               <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-50">
//                 <FaUserFriends className="w-5 h-5 text-green-600" />
//               </div>
//               <p className="mt-1 text-xl font-bold text-gray-800">
//                 {loading ? "..." : followersCount}
//               </p>
//               <p className="text-xs text-gray-500">Followers</p>
//             </div>
//             <div className="flex flex-col items-center">
//               <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-50">
//                 <FaUserFriends className="w-5 h-5 text-purple-600 rotate-180" />
//               </div>
//               <p className="mt-1 text-xl font-bold text-gray-800">
//                 {loading ? "..." : followingCount}
//               </p>
//               <p className="text-xs text-gray-500">Following</p>
//             </div>
//           </div>
//           <p className="mt-2 text-sm text-center text-blue-600 cursor-pointer hover:underline">
//             See full analytics →
//           </p>
//         </div>

//         {/* Profile Visitors */}
//         <div className="mt-4">
//           <h3 className="pt-4 font-semibold text-gray-800 border-t">Recent Profile Visitors</h3>
//           {loading ? (
//             <div className="grid grid-cols-4 gap-2 mt-2">
//               {[...Array(8)].map((_, i) => (
//                 <div key={i} className="flex flex-col items-center">
//                   <div className="w-12 h-12 bg-gray-200 rounded animate-pulse" />
//                   <div className="w-16 h-3 mt-1 bg-gray-200 rounded animate-pulse" />
//                 </div>
//               ))}
//             </div>
//           ) : profileViews.length > 0 ? (
//             <div className="grid grid-cols-4 gap-2 mt-2">
//               {profileViews.map((view, index) => {
//                 const displayName = getDisplayName(view.viewer, view.viewer_profile);
//                 const uuid = view.viewer?.uuid;

//                 const handleViewClick = () => {
//                   if (uuid) {
//                     navigate(`/public-profile/${uuid}`);
//                   }
//                 };
//                 return (
//                   <div key={index} onClick={handleViewClick} className="text-center group">
//                     {/* <div
//                       key={index}
//                       onClick={handleViewClick}
//                       className="flex flex-col items-center cursor-pointer group"
//                     > */}
//                     <img
//                       src={getAvatar(view)}
//                       alt={displayName}
//                       className="object-cover w-12 h-12 mx-auto transition border rounded group-hover:ring-2 ring-blue-300"
//                       onError={(e) => (e.currentTarget.src = dummyProfile3)}
//                     />
//                     <p className="mt-1 text-xs text-gray-600 line-clamp-1">
//                       {displayName}
//                     </p>
//                     <p className="text-[10px] text-gray-400">
//                       {new Date(view.viewed_at).toLocaleDateString()}
//                     </p>
//                   </div>
//                 );
//               })}
//             </div>
//           ) : (
//             <p className="mt-2 text-sm text-gray-500">No visitors yet.</p>
//           )}

//           <p
//             className="mt-2 text-sm text-center text-blue-600 cursor-pointer hover:underline"
//             onClick={() => setShowVisitorsModal(true)}
//           >
//             See all visitors ({uniqueViewers})
//           </p>
//         </div>

//         {/* Profile Visitors Modal */}
//       {showVisitorsModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//           <div className="w-full max-w-3xl p-6 bg-white rounded-lg shadow-xl max-h-[80vh] overflow-y-auto">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-xl font-bold text-gray-800">
//                 👀 Profile Visitors ({totalViews} views, {uniqueViewers} people)
//               </h2>
//               <button
//                 onClick={() => setShowVisitorsModal(false)}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 ✕
//               </button>
//             </div>

//             {profileViews.length === 0 ? (
//               <p className="text-gray-500">No visitors yet.</p>
//             ) : (
//               <div className="space-y-4">
//                 {profileViews.map((view, index) => (
//                   <div key={index} className="flex items-center p-3 border rounded hover:bg-gray-50">
//                     <img
//                       src={getAvatar(view)}
//                       alt={view.name}
//                       className="w-12 h-12 rounded-full"
//                       onError={(e) => (e.currentTarget.src = dummyProfile3)}
//                     />
//                     <div className="flex-1 ml-4">
//                       <h3 className="font-medium text-gray-800">{view.name}</h3>
//                       <p className="text-sm text-gray-600">
//                         {view.role === "COMPANY" && view.viewer_profile?.designation && (
//                           <span>{view.viewer_profile.designation} • </span>
//                         )}
//                         {view.viewer_profile?.name || view.role}
//                       </p>
//                       <p className="text-xs text-gray-500">
//                         Viewed on {new Date(view.viewed_at).toLocaleString()}
//                         {view.source && ` • via ${view.source}`}
//                       </p>
//                     </div>
//                     <div className="flex gap-2">
//                       {/* Action buttons (see suggestions below) */}
//                       <button className="px-3 py-1 text-sm text-blue-600 rounded bg-blue-50 hover:bg-blue-100">
//                         Message
//                       </button>
//                       {view.role === "COMPANY" && (
//                         <button className="px-3 py-1 text-sm text-green-600 rounded bg-green-50 hover:bg-green-100">
//                           View Jobs
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//       </div>
      
//     </div>
    
//   );
// }































import { useSelector } from "react-redux";
import cover from "../../../assets/cover.png";
import dummyProfile3 from "../../../assets/dummyProfile3.jpg";
import { FaEye, FaUserFriends } from "react-icons/fa";
import { useEffect, useState } from "react";
import feedApi from "../../../api/feedApi";
import { getProfileViews } from "../../../api/analyticsApi";
import { getImageUrl } from "../../../../utils";
import { useNavigate } from "react-router-dom";

// ─── Helpers ────────────────────────────────────────────────────────────────

const getAvatar = (viewItem) => {
  const { viewer, viewer_profile } = viewItem;

  if (viewer_profile?.profile_pic) {
    return getImageUrl(viewer_profile.profile_pic);
  }
  if (viewer?.user_profile_pic) {
    return getImageUrl(viewer.user_profile_pic);
  }
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

// ─── Component ──────────────────────────────────────────────────────────────

export default function FeedRightSidebar() {
  const { token, user: currentUser } = useSelector((state) => state.auth);
  const [showVisitorsModal, setShowVisitorsModal] = useState(false);

  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [profileViews, setProfileViews] = useState([]);
  const [totalViews, setTotalViews] = useState(0);
  const [uniqueViewers, setUniqueViewers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !currentUser?.id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [
          followersRes,
          followingRes,
          viewsRes,
        ] = await Promise.all([
          feedApi.getFollowers(token, currentUser.id).catch(() => ({ count: 0, followers: [] })),
          feedApi.getFollowing(token, currentUser.id).catch(() => ({ count: 0, following: [] })),
          getProfileViews(token).catch(() => ({ meta: { total_views: 0, unique_viewers: 0 }, views: [] })),
        ]);

        setFollowersCount(followersRes.count || 0);
        setFollowingCount(followingRes.count || 0);

        const viewsData = viewsRes.views || [];
        setProfileViews(viewsData.slice(0, 8)); // Top 8 for sidebar
        setTotalViews(viewsRes.meta?.total_views || 0);
        setUniqueViewers(viewsRes.meta?.unique_viewers || 0);
      } catch (err) {
        console.error("Sidebar data fetch error:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, currentUser?.id]);

  return (
    <div>
      <div className="p-5 bg-white border border-gray-100 shadow-sm rounded-xl">
        {/* Cover + Profile */}
        <div className="relative h-24 mb-14">
          <div
            className="w-full h-24 bg-center bg-cover rounded-xl"
            style={{ backgroundImage: `url(${cover})` }}
          />
          <div className="absolute w-[84px] h-[84px] left-4 top-12">
            <img
              src={currentUser?.user_profile_pic ? getImageUrl(currentUser.user_profile_pic) : dummyProfile3}
              alt="Profile"
              className="object-cover w-full h-full bg-white border-4 border-white rounded-full shadow-sm"
              onError={(e) => (e.currentTarget.src = dummyProfile3)}
            />
          </div>
        </div>

        {/* Profile Info */}
        <div className="pt-2">
          {loading ? (
            <div className="text-sm text-gray-500 animate-pulse">Loading profile...</div>
          ) : error ? (
            <div className="mt-1 text-xs text-red-500">{error}</div>
          ) : token ? (
            <>
              <h2 className="text-lg font-extrabold text-[#1e1e2d]">
                {currentUser?.first_name} {currentUser?.last_name}
              </h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">{currentUser?.email}</p>
              <p className="mt-1.5 text-sm font-semibold text-[#9bc87c]">
                {currentUser?.user_role === "COMPANY"
                  ? "Company Recruiter"
                  : currentUser?.user_role === "UNIVERSITY"
                    ? "University"
                    : "Student"}
              </p>
              <p className="mt-3 text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {currentUser?.about_us || "No bio yet."}
              </p>
            </>
          ) : null}

          <div className="flex gap-2 mt-5">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
              <FaUserFriends className="text-[#9bc87c]" />
              {loading ? "..." : followersCount} followers
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
              <FaUserFriends className="text-[#9bc87c] rotate-180" />
              {loading ? "..." : followingCount} following
            </button>
          </div>
        </div>

        {/* Dashboard */}
        <div className="mt-6">
          <h3 className="pt-4 text-sm font-bold text-[#1e1e2d] border-t border-gray-100 uppercase tracking-wide">Your Dashboard</h3>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#9bc87c]/10">
                <FaEye className="w-5 h-5 text-[#9bc87c]" />
              </div>
              <p className="mt-2 text-lg font-extrabold text-[#1e1e2d]">
                {loading ? "..." : totalViews}
              </p>
              <p className="text-[10px] font-medium text-gray-500 uppercase text-center">Profile views</p>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 border border-gray-200">
                <FaUserFriends className="w-4 h-4 text-gray-500" />
              </div>
              <p className="mt-2 text-lg font-extrabold text-[#1e1e2d]">
                {loading ? "..." : followersCount}
              </p>
              <p className="text-[10px] font-medium text-gray-500 uppercase text-center">Followers</p>
            </div>
            <div className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 border border-gray-200">
                <FaUserFriends className="w-4 h-4 text-gray-500 rotate-180" />
              </div>
              <p className="mt-2 text-lg font-extrabold text-[#1e1e2d]">
                {loading ? "..." : followingCount}
              </p>
              <p className="text-[10px] font-medium text-gray-500 uppercase text-center">Following</p>
            </div>
          </div>
          <p className="mt-3 text-xs font-semibold text-center text-[#9bc87c] cursor-pointer hover:text-[#8ab76b] transition-colors">
            See full analytics &rarr;
          </p>
        </div>

        {/* Profile Visitors */}
        <div className="mt-4">
          <h3 className="pt-4 text-sm font-bold text-[#1e1e2d] border-t border-gray-100 uppercase tracking-wide">Recent Profile Visitors</h3>
          {loading ? (
            <div className="grid grid-cols-4 gap-3 mt-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="w-11 h-11 bg-gray-100 rounded-full animate-pulse" />
                  <div className="w-12 h-2 mt-2 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : profileViews.length > 0 ? (
            <div className="grid grid-cols-4 gap-3 mt-4">
              {profileViews.map((view, index) => {
                const displayName = getDisplayName(view.viewer, view.viewer_profile);
                const uuid = view.viewer?.uuid;

                const handleViewClick = () => {
                  if (uuid) {
                    navigate(`/public-profile/${uuid}`);
                  }
                };
                return (
                  <div key={index} onClick={handleViewClick} className="text-center group cursor-pointer">
                    <img
                      src={getAvatar(view)}
                      alt={displayName}
                      className="object-cover w-11 h-11 mx-auto transition-all border border-gray-200 rounded-full group-hover:ring-2 ring-[#9bc87c] ring-offset-1"
                      onError={(e) => (e.currentTarget.src = dummyProfile3)}
                    />
                    <p className="mt-1.5 text-[10px] font-semibold text-[#1e1e2d] line-clamp-1 group-hover:text-[#9bc87c] transition-colors">
                      {displayName}
                    </p>
                    <p className="text-[9px] text-gray-400 font-medium">
                      {new Date(view.viewed_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-xs font-medium text-gray-500">No visitors yet.</p>
          )}

          <button
            className="w-full mt-5 py-2 text-xs font-bold text-center text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setShowVisitorsModal(true)}
          >
            See all visitors ({uniqueViewers})
          </button>
        </div>

        {/* Profile Visitors Modal */}
        {showVisitorsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1e1e2d]/60 backdrop-blur-sm">
            <div className="w-full max-w-3xl p-6 bg-white rounded-2xl shadow-xl max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                <h2 className="text-xl font-extrabold text-[#1e1e2d]">
                  Profile Visitors <span className="text-[#9bc87c] text-base ml-2">({totalViews} views, {uniqueViewers} people)</span>
                </h2>
                <button
                  onClick={() => setShowVisitorsModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
                {profileViews.length === 0 ? (
                  <p className="text-gray-500 py-10 text-center">No visitors yet.</p>
                ) : (
                  <div className="space-y-3">
                    {profileViews.map((view, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center p-4 border border-gray-100 rounded-xl hover:border-[#9bc87c]/30 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center flex-1">
                          <img
                            src={getAvatar(view)}
                            alt={view.name}
                            className="w-12 h-12 rounded-full border border-gray-200 object-cover"
                            onError={(e) => (e.currentTarget.src = dummyProfile3)}
                          />
                          <div className="ml-4">
                            <h3 className="font-bold text-[#1e1e2d]">{view.name}</h3>
                            <p className="text-xs font-medium text-gray-600 mt-0.5">
                              {view.role === "COMPANY" && view.viewer_profile?.designation && (
                                <span>{view.viewer_profile.designation} • </span>
                              )}
                              {view.viewer_profile?.name || view.role}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium mt-1">
                              Viewed on {new Date(view.viewed_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                              {view.source && ` • via ${view.source}`}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 mt-4 sm:mt-0 ml-16 sm:ml-4">
                          <button className="px-4 py-1.5 text-xs font-bold text-[#1e1e2d] border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                            Message
                          </button>
                          {view.role === "COMPANY" && (
                            <button className="px-4 py-1.5 text-xs font-bold text-white bg-[#9bc87c] rounded-lg hover:bg-[#8ab76b] transition-colors">
                              View Jobs
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}