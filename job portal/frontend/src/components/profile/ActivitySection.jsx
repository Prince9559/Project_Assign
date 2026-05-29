// // src/components/profile/ActivitySection.jsx
// import React, { useState, useEffect } from "react";
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import PostCard from "./PostCard";
// import CreatePostModal from "./CreatePostModal";
// import { getImageUrl } from "../../../utils";
// import feedApi from "../../api/feedApi";

// const ActivitySection = ({ userActivity = [], onPostCreated, isPublicView=false, profileUserId }) => {
//   const { user, token } = useSelector((state) => state.auth);
//   const navigate = useNavigate();

//   const [localPosts, setLocalPosts] = useState([]);

//   // Sync when userActivity changes (e.g., on mount or refetch)
//   useEffect(() => {
//     setLocalPosts(userActivity);
//   }, [userActivity]);

//   const handleLike = async (postId) => {
//     if (!token || !user?.id) return;

//     try {
//       // Call API
//       const response = await feedApi.postLike(
//         postId,
//         { user_id: user.id },
//         token
//       );

//       setLocalPosts((prev) =>
//         prev.map((post) =>
//           post.id === postId
//             ? {
//                 ...post,
//                 isLiked: response.isLiked,
//                 like_count: response.like_count,
//               }
//             : post
//         )
//       );
//     } catch (error) {
//       console.error("Like failed:", error);
//       alert("Failed to update like. Please try again.");
//     }
//   };

//   // Local state for comments (scoped to this section)
//   const [commentInputs, setCommentInputs] = useState({});
//   const [openComments, setOpenComments] = useState({});
//   const [openReplies, setOpenReplies] = useState({});
//   const [replyInputs, setReplyInputs] = useState({});
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

//   const displayedPosts = isPublicView 
//   ? localPosts.slice(0, 6) 
//   : localPosts.slice(0, 5);

//   const handleComment = (post) => {
//     if (!post?.slug) return;
//     navigate(`/feed-post/${post.slug}`);
//   };

//   const handleShare = (post) => {
//     if (!post?.id) return;
//     const postUrl = `${window.location.origin}/feed-post/${post.slug}`;
//     const shareText = post.content?.slice(0, 120) || "Check out this post!";

//     try {
//       if (navigator.share) {
//         navigator.share({
//           title: "Check this out!",
//           text: shareText,
//           url: postUrl,
//         });
//       } else {
//         navigator.clipboard.writeText(`${shareText}\n\n${postUrl}`);
//         alert("Post link copied to clipboard!");
//       }
//     } catch (err) {
//       console.error("Error sharing:", err);
//       prompt("Copy to share:", `${shareText}\n\n${postUrl}`);
//     }
//   };

//   const handleCreatePost = () => {
//     setIsCreateModalOpen(true);
//   };

//   const handlePostCreated = (newPost) => {
//     setIsCreateModalOpen(false);
//     // Add new post to the top of localPosts
//     setLocalPosts((prev) => [newPost, ...prev]);
//     if (onPostCreated) onPostCreated(newPost); // still notify parent
//   };

//   const handleShowAllPosts = () => {
//   if (!profileUserId) {
//     console.warn("profileUserId is missing!");
//     return;
//   }
//   navigate("/feed-user-activity", { 
//     state: { userId: profileUserId } 
//   });
//   console.log("profileUserId:", profileUserId);
// };

//   // const handlePostCreated = (newPostFromModal) => {
//   //   setIsCreateModalOpen(false);

//   //   // Enrich with known user info (optional, but consistent)
//   //   const enrichedPost = {
//   //     ...newPostFromModal,
//   //     user: {
//   //       first_name: user.first_name || "You",
//   //       last_name: user.last_name || "",
//   //       profileImage: getImageUrl(user.user_profile_pic),
//   //       user_type: user.user_role || "User",
//   //     },
//   //   };

//   //   setLocalPosts((prev) => [enrichedPost, ...prev]);
//   //   if (onPostCreated) onPostCreated(enrichedPost);
//   // };
//   return (
//     <div className="mb-6">
//       <div className="flex items-center justify-between mb-3">
//         <h3 className="text-lg font-semibold text-gray-900">Activity</h3>
//         {userActivity.length > (isPublicView ? 6 : 5) && (
//           <button
//             onClick={handleShowAllPosts}
//             className="text-sm text-blue-600 hover:text-blue-800"
//           >
//             Show all posts →
//           </button>
//         )}
//       </div>

//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
//         {displayedPosts.map((post) => (
//           <PostCard
//             key={post.id}
//             post={post}
//             onLike={handleLike}
//             onComment={handleComment}
//             onShare={handleShare}
//             // ... other props (comments state)
//             commentInputs={commentInputs}
//             setCommentInputs={setCommentInputs}
//             openComments={openComments}
//             setOpenComments={setOpenComments}
//             openReplies={openReplies}
//             setOpenReplies={setOpenReplies}
//             replyInputs={replyInputs}
//             setReplyInputs={setReplyInputs}
//             token={token}
//           />
//         ))}

//         {/* Create Post Card */}
//         {!isPublicView && (
//           <div
//             onClick={() => setIsCreateModalOpen(true)}
//             className="flex flex-col items-center justify-center p-4 text-center transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
//           >
//             <div className="flex items-center justify-center w-10 h-10 mb-2 text-blue-600 bg-blue-100 rounded-full">
//               <svg
//                 className="w-6 h-6"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 4v16m8-8H4"
//                 />
//               </svg>
//             </div>
//             <span className="text-sm font-medium text-gray-700">
//               Start a post
//             </span>
//           </div>
//         )}
//       </div>

//       {userActivity.length > (isPublicView ? 6 : 5) && (
//         <button
//           onClick={handleShowAllPosts}
//           className="text-sm text-blue-600 hover:text-blue-800"
//         >
//           Show all posts →
//         </button>
//       )}

//       {isCreateModalOpen && (
//         <CreatePostModal
//           isOpen={isCreateModalOpen}
//           onClose={() => setIsCreateModalOpen(false)}
//           onPostCreated={onPostCreated}
//           token={token}
//           userId={user?.id}
//           userProfilePic={getImageUrl(user?.user_profile_pic)}
//         />
//       )}
//     </div>
//   );
// };

// export default ActivitySection;



















// src/components/profile/ActivitySection.jsx
import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PostCard from "./PostCard";
import CreatePostModal from "./CreatePostModal";
import { getImageUrl } from "../../../utils";
import feedApi from "../../api/feedApi";

const ActivitySection = ({ userActivity = [], onPostCreated, isPublicView = false, profileUserId }) => {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const [localPosts, setLocalPosts] = useState([]);

  // Sync when userActivity changes (e.g., on mount or refetch)
  useEffect(() => {
    setLocalPosts(userActivity);
  }, [userActivity]);

  const handleLike = async (postId) => {
    if (!token || !user?.id) return;

    try {
      // Call API
      const response = await feedApi.postLike(
        postId,
        { user_id: user.id },
        token
      );

      setLocalPosts((prev) =>
        prev.map((post) =>
          post.id === postId
            ? {
              ...post,
              isLiked: response.isLiked,
              like_count: response.like_count,
            }
            : post
        )
      );
    } catch (error) {
      console.error("Like failed:", error);
      alert("Failed to update like. Please try again.");
    }
  };

  // Local state for comments (scoped to this section)
  const [commentInputs, setCommentInputs] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [openReplies, setOpenReplies] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);


  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const CARD_WIDTH = 320 + 16; // 320px card + 16px gap (from gap-4 = 1rem = 16px)

  const displayedPosts = isPublicView
    ? localPosts.slice(0, 6)
    : localPosts.slice(0, 5);

  useEffect(() => {
  const container = scrollContainerRef.current;
  if (!container) return;

  const handleScroll = () => {
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setShowLeftArrow(scrollLeft > 10); // some tolerance
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  container.addEventListener('scroll', handleScroll);
  handleScroll(); // initial check

  return () => container.removeEventListener('scroll', handleScroll);
}, [displayedPosts]); // re-run if posts change

const scrollLeft = () => {
  scrollContainerRef.current?.scrollBy({ left: -CARD_WIDTH, behavior: 'smooth' });
};

const scrollRight = () => {
  scrollContainerRef.current?.scrollBy({ left: CARD_WIDTH, behavior: 'smooth' });
};

  

  const handleComment = (post) => {
    if (!post?.slug) return;
    navigate(`/feed-post/${post.slug}`);
  };

  const handleShare = (post) => {
    if (!post?.id) return;
    const postUrl = `${window.location.origin}/feed-post/${post.slug}`;
    const shareText = post.content?.slice(0, 120) || "Check out this post!";

    try {
      if (navigator.share) {
        navigator.share({
          title: "Check this out!",
          text: shareText,
          url: postUrl,
        });
      } else {
        navigator.clipboard.writeText(`${shareText}\n\n${postUrl}`);
        alert("Post link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
      prompt("Copy to share:", `${shareText}\n\n${postUrl}`);
    }
  };

  const handleCreatePost = () => {
    setIsCreateModalOpen(true);
  };

  const handlePostCreated = (newPost) => {
    setIsCreateModalOpen(false);
    // Add new post to the top of localPosts
    setLocalPosts((prev) => [newPost, ...prev]);
    if (onPostCreated) onPostCreated(newPost); // still notify parent
  };

  const handleShowAllPosts = () => {
    if (!profileUserId) {
      console.warn("profileUserId is missing!");
      return;
    }
    navigate("/feed-user-activity", {
      state: { userId: profileUserId }
    });
    console.log("profileUserId:", profileUserId);
  };

  // const handlePostCreated = (newPostFromModal) => {
  //   setIsCreateModalOpen(false);

  //   // Enrich with known user info (optional, but consistent)
  //   const enrichedPost = {
  //     ...newPostFromModal,
  //     user: {
  //       first_name: user.first_name || "You",
  //       last_name: user.last_name || "",
  //       profileImage: getImageUrl(user.user_profile_pic),
  //       user_type: user.user_role || "User",
  //     },
  //   };

  //   setLocalPosts((prev) => [enrichedPost, ...prev]);
  //   if (onPostCreated) onPostCreated(enrichedPost);
  // };
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Activity</h3>
        {userActivity.length > (isPublicView ? 6 : 5) && (
          <button
            onClick={handleShowAllPosts}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Show all posts →
          </button>
        )}
      </div>

      
      {/* Horizontal Scroll Carousel */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 pb-2 overflow-x-auto hide-scrollbar snap-x snap-mandatory"
          style={{ scrollBehavior: 'smooth' }}
        >
          {displayedPosts.map((post) => (
            <div key={post.id} className="flex-shrink-0 w-[320px] snap-start">
              <PostCard
                key={post.id}
                post={post}
                onLike={handleLike}
                onComment={handleComment}
                onShare={handleShare}
                commentInputs={commentInputs}
                setCommentInputs={setCommentInputs}
                openComments={openComments}
                setOpenComments={setOpenComments}
                openReplies={openReplies}
                setOpenReplies={setOpenReplies}
                replyInputs={replyInputs}
                setReplyInputs={setReplyInputs}
                token={token}
              />
            </div>
          ))}

          {!isPublicView && (
            <div
              onClick={() => setIsCreateModalOpen(true)}
              className="flex-shrink-0 w-[320px] snap-start"
            >
              <div className="flex flex-col items-center justify-center h-full p-4 text-center transition-colors border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex items-center justify-center w-10 h-10 mb-2 text-blue-600 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  Start a post
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Left Arrow */}
        <button
          onClick={scrollLeft}
          className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 ${showLeftArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
            } transition-opacity`}
          aria-label="Scroll left"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Right Arrow */}
        <button
          onClick={scrollRight}
          className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full shadow-md p-2 ${showRightArrow ? 'opacity-100' : 'opacity-0 pointer-events-none'
            } transition-opacity`}
          aria-label="Scroll right"
        >
          <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {userActivity.length > (isPublicView ? 6 : 5) && (
        <button
          onClick={handleShowAllPosts}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Show all posts →
        </button>
      )}

      {isCreateModalOpen && (
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onPostCreated={onPostCreated}
          token={token}
          userId={user?.id}
          userProfilePic={getImageUrl(user?.user_profile_pic)}
        />
      )}
    </div>
  );
};

export default ActivitySection;
