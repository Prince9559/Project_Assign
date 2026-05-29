import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout.jsx";
import addMediaIcon from "../../../assets/add-media.png";
import { BiCommentDetail, BiLike } from "react-icons/bi";
import { FaEllipsisH } from "react-icons/fa";
import { TbSend } from "react-icons/tb";
import { LiaShareSolid } from "react-icons/lia";
import dummyProfile3 from "../../../assets/dummyProfile3.jpg";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import FeedRightSidebar from "./FeedRightSidebar.jsx";
import feedApi from "../../../api/feedApi";
import uploadImageApi from "../../../api/uploadImageApi";
import useFeedApi from "../../../hooks/useFeedApi";
import { getImageUrl } from "../../../../utils.js";
import imageUnavailable from "../../../assets/image_not_available.jpg";
import EditPostModal from "../../../components/modals/EditPostModal.jsx";
import EmojiPicker from "emoji-picker-react";

export default function FeedPage() {
  const { token, user } = useSelector((state) => state.auth);

  const [caption, setCaption] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [postingFeed, setPostingFeed] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // comments states
  const [commentInputs, setCommentInputs] = useState({});
  const [openComments, setOpenComments] = useState({});
  const [openReplies, setOpenReplies] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [openPostOptions, setOpenPostOptions] = useState({}); // tracks which post's menu is open
  const [openCommentOptions, setOpenCommentOptions] = useState({}); // { commentId: boolean }
  const [editingPost, setEditingPost] = useState(null); // stores the post being edited

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeInputKey, setActiveInputKey] = useState(null); // e.g., `post-${postId}` or `reply-${commentId}`
  const [emojiPickerPosition, setEmojiPickerPosition] = useState('bottom');


  const {

     posts,
  loading,
  error,
  hasMore,
  isInitialLoad,
  fetchFeed,
  refreshFeed,
  loadMore,
    

    page,
    totalPages,
    handleFollowToggle,
    postFeed,
    setPosts,
    handleLike,
    setLoading,
    setError,
    deletePost,
    editPost
  } = useFeedApi();

  // ADD this near top (inside component, before useEffect)
const hasFetchedInitialRef = useRef(false);

// REPLACE your current useEffect with:
useEffect(() => {
  if (token && !hasFetchedInitialRef.current) {
    hasFetchedInitialRef.current = true;
    fetchFeed(true); // initial load
  }
}, [token]);

  useEffect(() => {
    if (token) {
      fetchFeed(true); // replace = true for first load
    }
  }, [token]);


  //  Infinite scroll
  // useEffect(() => {
  //   const handleScroll = () => {
  //     if (loading || !hasMore) return;

  //     const scrollY = window.scrollY;
  //     const windowHeight = window.innerHeight;
  //     const documentHeight = document.documentElement.scrollHeight;

  //     // Trigger when 200px from bottom
  //     if (scrollY + windowHeight >= documentHeight - 200) {
  //       loadMore();
  //     }
  //   };

  //   window.addEventListener("scroll", handleScroll, { passive: true });
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, [loading, hasMore, loadMore]);


  useEffect(() => {
    // Only enable infinite scroll after initial load
    if (isInitialLoad) return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 400;

       if (isNearBottom && hasMore && !loading && posts.length > 0  ) {
  loadMore();
}

        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isInitialLoad, hasMore, loading, posts.length, loadMore]);

  //  Pull-to-refresh (optional on web)
  const handleRefresh = () => {
    if (!loading) refreshFeed();
  };


  useEffect(() => {
  if (!showEmojiPicker || !activeInputKey?.startsWith('comment-')) return;

  const inputElement = document.querySelector(`input[placeholder="Write a comment..."]`);
  if (inputElement) {
    const rect = inputElement.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    setEmojiPickerPosition(spaceBelow < 350 && spaceAbove > 350 ? 'top' : 'bottom');
  }
}, [showEmojiPicker, activeInputKey]);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenPostOptions({});
      setOpenCommentOptions({});
      setShowEmojiPicker(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleFeedPost = async () => {
    if (!token || !user) {
      alert("User not logged in");
      return;
    }

    setPostingFeed(true);
    let imageUrl = "";

    try {
      if (imageFile) {
        setUploadingImage(true);
        const imageUrlResult = await uploadImageApi.uploadImage(
          imageFile,
          "feedImage",
          token
        );
        if (typeof imageUrlResult === "string" && imageUrlResult.length > 0) {
          imageUrl = imageUrlResult;
        } else if (
          imageUrlResult &&
          imageUrlResult.url &&
          imageUrlResult.url.length > 0
        ) {
          imageUrl = imageUrlResult.url[0];
        }
        setUploadingImage(false);
      }

      const payload = {
        user_id: user.id,
        image: imageUrl,
        caption,
      };

      await postFeed(payload);
      setCaption("");
      setImageFile(null);
      setImagePreview(null);
    } catch (err) {
      console.log("Error while posting feed", err);
      alert("Failed to post feed. Please try again.");
    } finally {
      setPostingFeed(false);
      setUploadingImage(false);
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
  };

  // Close modal
const closeEditModal = () => {
  setEditingPost(null);
};

  const handlePageChange = (pageNum) => {
    if (pageNum !== page && pageNum >= 1 && pageNum <= totalPages) {
      fetchFeed(pageNum, true);
    }
  };

  const handleComment = async (post_id) => {
    if (!token || !user) {
      alert("User not logged in");
      return;
    }
    const commentText = commentInputs[post_id]?.trim();
    if (!commentText) return;
    try {
      const response = await feedApi.postComment(
        post_id,
        {
          comment: commentText,
        },
        token
      );
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === post_id
            ? {
                ...post,
                comments: response.comments,
                comment_count: response.comment_count,
              }
            : post
        )
      );
      setCommentInputs((prev) => ({ ...prev, [post_id]: "" }));
    } catch (error) {
      alert("Failed to post comment");
      console.error("Error posting comment:", error);
    }
  };

  const handleDeleteComment = async (postId, commentId) => {
    if (!token || !user) {
      alert("You must be logged in to delete a comment.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      // Call API
      const response = await feedApi.deleteComment(commentId, token);

      // Optimistically update UI: remove comment from post
      if (response.success) {
        setPosts((prevPosts) =>
          prevPosts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                comments: post.comments.filter(
                  (comment) => comment.id !== commentId
                ),
                comment_count: Math.max(0, (post.comment_count || 0) - 1),
              };
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert(error.message || "Failed to delete comment. Please try again.");
    }
  };

  const toggleComments = (post_id) => {
    setOpenComments((prev) => ({ ...prev, [post_id]: !prev[post_id] }));
  };

  const toggleReplies = (commentId) => {
    setOpenReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const handleShare = async (post) => {
    if (!post?.slug) {
      alert("This post cannot be shared.");
      return;
    }

    const postUrl = `${window.location.origin}/feed-post/${post.slug}`;
    const shareText = post.caption?.slice(0, 120) || "Check out this post!";

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Check this out!",
          text: shareText,
          url: postUrl,
        });
      } else {
        await navigator.clipboard.writeText(`${shareText}\n\n${postUrl}`);
        alert("Post link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
      prompt("Copy to share:", `${shareText}\n\n${postUrl}`);
    }
  };

  return (
    <MainLayout>
      <div className="flex justify-center min-h-screen px-2 bg-gray-100 sm:px-4 md:px-6 lg:px-8">
        {/* Left spacer - hidden on mobile, visible on large screens */}
        <div className="hidden xl:block flex-grow max-w-[200px]"></div>

        {/* Main content section */}
        <section className="w-full max-w-[750px] p-2 mx-auto">
          {/* Create post card */}
          <div className="flex flex-col gap-3 p-3 mb-4 bg-white rounded-lg shadow-sm sm:p-4">
            <div className="flex items-center w-full gap-2">
              <img
                src={
                  user.user_profile_pic
                    ? getImageUrl(user.user_profile_pic)
                    : dummyProfile3
                }
                alt="Profile"
                className="flex-shrink-0 w-10 h-10 rounded-full sm:w-12 sm:h-12"
              />
              <Input
                type="text"
                size="large"
                placeholder="Share something..."
                className="flex-1 h-12 border border-gray-400 rounded px-3 sm:px-4 w-full sm:min-w-[300px] md:min-w-[400px] lg:min-w-[500px] xl:min-w-[600px]"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 pl-12 sm:gap-3 sm:pl-14">
              <label className="flex items-center gap-2 p-1 transition-colors rounded cursor-pointer hover:bg-gray-50">
                <img src={addMediaIcon} alt="Add media" className="w-4 h-4" />
                <span className="text-xs text-gray-500 sm:text-sm">
                  Add media
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>

              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="object-cover w-12 h-12 ml-2 rounded-lg sm:w-16 sm:h-16"
                />
              )}
            </div>
            <Button
              className="px-3 py-2 ml-auto text-sm text-white transition-colors bg-blue-600 rounded-lg sm:px-4 hover:bg-blue-700 sm:text-base"
              size="small"
              onClick={handleFeedPost}
              disabled={uploadingImage}
            >
              {uploadingImage ? "Posting..." : "Post"}
            </Button>
          </div>

          {/* Loading and error states */}
          {loading && (
            <div className="py-8 text-center text-gray-600">Loading...</div>
          )}
          {error && (
            <div className="px-4 py-8 text-center text-red-500">{error}</div>
          )}
          {!loading && !error && posts.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-500">
              No posts found.
            </div>
          )}

          {/* Posts list */}
          {!loading &&
            !error &&
            posts.map((post) => (
              <article
                key={post.id}
                className="p-3 mb-4 bg-white border rounded-lg shadow-sm sm:p-4"
              >
                <header className="flex items-center gap-2 mb-3 sm:gap-3">
                  {/* Profile Picture */}
                  <img
                    src={
                      post.User?.profile_pic
                        ? getImageUrl(post.User.profile_pic)
                        : dummyProfile3 // fallback image
                    }
                    alt={post.User?.first_name || "User"}
                    className="flex-shrink-0 object-cover w-8 h-8 rounded-full sm:w-10 sm:h-10"
                  />

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                      {post.User?.uuid ? (
                        <Link
                          to={`/public-profile/${post.User.uuid}`}
                          className="text-sm font-semibold text-gray-900 truncate cursor-pointer hover:underline hover:text-gray-700"
                        >
                          {post.User.first_name} {post.User.last_name}
                        </Link>
                      ) : (
                        <span className="text-sm font-semibold text-gray-900 truncate">
                          {post.User?.first_name}{" "}
                          {post.User?.last_name || "Unknown User"}
                        </span>
                      )}
                      {post.User.id !== user.id && (
                        <button
                          onClick={() =>
                            handleFollowToggle(
                              post.User.id,
                              post.User.isFollowing
                            )
                          }
                          disabled={loading} // optional: disable during API calls if you track per-button loading
                          className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                            post.User.isFollowing
                              ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                              : "bg-blue-600 text-white hover:bg-blue-700"
                          }`}
                        >
                          {post.User.isFollowing ? "Following" : "Follow"}
                        </button>
                      )}
                      <span className="text-xs text-gray-400">
                        • {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {post.user_role}
                    </div>
                  </div>

                  {/* Options Button */}
                  <div className="relative">
                    <button
                      className="p-1 text-gray-500 rounded cursor-pointer hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenPostOptions((prev) => ({
                          ...prev,
                          [post.id]: !prev[post.id],
                        }));
                      }}
                      aria-label="Post options"
                    >
                      <FaEllipsisH />
                    </button>

                    {/* Dropdown Menu */}
                    {openPostOptions[post.id] && (
                      <div className="absolute right-0 z-10 w-40 mt-1 bg-white border rounded-md shadow-lg">
                        {post.user_id === user?.id && (
                          <>
                            <button
                              className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditPost(post);
                                setOpenPostOptions((prev) => ({
                                  ...prev,
                                  [post.id]: false,
                                }));
                              }}
                            >
                              Edit post
                            </button>
                            <button
                              className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (
                                  window.confirm(
                                    "Are you sure you want to delete this post?"
                                  )
                                ) {
                                  deletePost(post.id);
                                }
                                setOpenPostOptions((prev) => ({
                                  ...prev,
                                  [post.id]: false,
                                }));
                              }}
                            >
                              Delete post
                            </button>
                          </>
                        )}
                        <button
                          className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleShare(post);
                            setOpenPostOptions((prev) => ({
                              ...prev,
                              [post.id]: false,
                            }));
                          }}
                        >
                          Share post
                        </button>
                      </div>
                    )}
                  </div>
                </header>

                {/* Post image */}
                {post.image && (
                  <img
                    src={
                      post.image ? getImageUrl(post.image) : imageUnavailable
                    }
                    alt="Post"
                    className="rounded-lg  object-cover w-[100%] h-80 sm:h-64 mb-3"
                  />
                )}

                {/* Post caption */}
                <p className="mb-3 text-sm leading-relaxed text-gray-700">
                  {post.caption}
                </p>

                {/* Post actions footer */}
                <footer className="flex items-center justify-between py-2 text-sm text-gray-500 border-t">
                  <div
                    className={`flex flex-col items-center cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors ${
                      // post.likedBy && post.likedBy.includes(user?.id)
                      post.isLiked ? "text-blue-600" : ""
                    }`}
                    onClick={() => handleLike(post.id, user?.id)}
                  >
                    <BiLike className="text-lg sm:text-xl" />
                    <span className="mt-1 text-xs sm:text-sm">
                      Like ({post.like_count})
                    </span>
                  </div>
                  <div
                    className="flex flex-col items-center p-2 transition-colors rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => toggleComments(post.id)}
                  >
                    <BiCommentDetail className="text-lg sm:text-xl" />
                    <span className="mt-1 text-xs sm:text-sm">
                      Comment ({post.comment_count})
                    </span>
                  </div>
                  <div
                    className="flex flex-col items-center p-2 transition-colors rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => handleShare(post)}
                  >
                    <LiaShareSolid className="text-lg sm:text-xl" />
                    <span className="mt-1 text-xs sm:text-sm">Share</span>
                  </div>

                  {/* <div className="flex flex-col items-center p-2 transition-colors rounded-lg cursor-pointer hover:bg-gray-50">
                    <TbSend className="text-lg sm:text-xl" />
                     <span className="mt-1 text-xs sm:text-sm">Send</span>
                   </div> */}
                </footer>

                {/* Comments section */}
                {openComments[post.id] && (
                  <div className="pt-3 mt-3 border-t">
                    {/* Comment input */}
                    {/* Comment input with emoji support */}
                    <div className="relative mb-3">
                      <div className="flex items-end gap-2">
                        {/* Input + Emoji Button */}
                        <div className="relative flex-1 flex items-center gap-2 px-3 py-1 text-sm border rounded-full focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 bg-white">
                          <input
                            type="text"
                            placeholder="Write a comment..."
                            className="flex-1 min-w-0 outline-none text-sm"
                            value={commentInputs[post.id] || ""}
                            onChange={(e) =>
                              setCommentInputs((prev) => ({
                                ...prev,
                                [post.id]: e.target.value,
                              }))
                            }
                            onFocus={() =>
                              setActiveInputKey(`comment-${post.id}`)
                            }
                          />
                          <button
                            type="button"
                            className="flex-shrink-0 h-fit text-gray-500 hover:text-gray-700 "
                            onClick={(e) => {
                              e.stopPropagation();
                              const key = `comment-${post.id}`;
                              setActiveInputKey(key);
                              setShowEmojiPicker(
                                showEmojiPicker && activeInputKey === key
                                  ? false
                                  : true
                              );
                            }}
                            aria-label="Add emoji"
                          >
                            😊
                          </button>
                        </div>

                        <button
                          className=" relative flex  items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 whitespace-nowrap"
                          onClick={() => handleComment(post.id)}
                        >
                          Comment
                        </button>
                      </div>

                      {/* Emoji Picker */}
                      {showEmojiPicker &&
                        activeInputKey === `comment-${post.id}` && (
                          <div
                            className={`absolute z-10 w-full max-w-xs ${
                              emojiPickerPosition === "top"
                                ? "bottom-full mb-1"
                                : "top-full mt-1"
                            }`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="relative overflow-hidden bg-white border rounded-lg shadow-lg border-x">
                              <EmojiPicker
                                onEmojiClick={(emojiData) => {
                                  const newText =
                                    (commentInputs[post.id] || "") +
                                    emojiData.emoji;
                                  setCommentInputs((prev) => ({
                                    ...prev,
                                    [post.id]: newText,
                                  }));
                                  setShowEmojiPicker(false);
                                }}
                                height={300}
                                width="100%"
                                theme="light"
                                searchDisabled={false}
                                previewConfig={{ showPreview: false }}
                                skinTonesDisabled={true}
                                emojiStyle="native"
                              />
                              <button
                                onClick={() => setShowEmojiPicker(false)}
                                className="absolute top-2 right-2 z-10 p-1 text-gray-500 hover:text-gray-800 rounded-full bg-white/80 backdrop-blur-sm"
                                aria-label="Close emoji picker"
                                style={{ fontSize: "14px" }}
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        )}
                    </div>

                    {/* Comments list */}
                    {post.comments && post.comments.length > 0 ? (
                      <div className="space-y-3">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="mb-3">
                            <div className="flex items-start gap-2">
                              <img
                                src={
                                  comment.profile_pic
                                    ? getImageUrl(comment.profile_pic)
                                    : dummyProfile3
                                }
                                alt=""
                                className="flex-shrink-0 object-cover w-6 h-6 mt-1 rounded-full sm:w-7 sm:h-7"
                              />
                              <div className="relative flex-1 min-w-0">
                                <div className="flex justify-between">
                                  <div className="flex-1 min-w-0">
                                    {/* User name & date */}
                                    <div className="flex flex-col gap-1 mb-1 sm:flex-row sm:items-center">
                                      {comment.uuid ? (
                                        <Link
                                          to={`/public-profile/${comment.uuid}`}
                                          className="text-xs font-semibold text-gray-900 sm:text-sm hover:underline hover:text-gray-700"
                                        >
                                          {comment.first_name}{" "}
                                          {comment.last_name}
                                        </Link>
                                      ) : (
                                        <span className="text-xs font-semibold text-gray-900 sm:text-sm">
                                          {comment.first_name}{" "}
                                          {comment.last_name || "User"}
                                        </span>
                                      )}
                                      <span className="text-xs text-gray-400">
                                        {new Date(
                                          comment.created_at
                                        ).toLocaleDateString()}
                                      </span>
                                    </div>

                                    {/* Comment text */}
                                    <p className="mb-2 text-sm text-gray-700">
                                      {comment.comment}
                                    </p>
                                  </div>

                                  {/*  3-dot menu for comment owner */}
                                  {comment.user_id === user?.id && (
                                    <div className="relative ml-2">
                                      <button
                                        className="p-1 text-gray-500 rounded hover:bg-gray-100"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenCommentOptions((prev) => ({
                                            ...prev,
                                            [comment.id]: !prev[comment.id],
                                          }));
                                        }}
                                        aria-label="Comment options"
                                      >
                                        <FaEllipsisH className="text-sm" />
                                      </button>

                                      {openCommentOptions[comment.id] && (
                                        <div className="absolute right-0 z-10 w-32 mt-1 bg-white border rounded-md shadow-lg">
                                          <button
                                            className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteComment(
                                                post.id,
                                                comment.id
                                              );
                                              setOpenCommentOptions((prev) => ({
                                                ...prev,
                                                [comment.id]: false,
                                              }));
                                            }}
                                          >
                                            Delete
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>

                                {/* Reply button and replies (unchanged) */}
                                <button
                                  className="px-3 py-1 text-xs text-blue-500 transition-colors bg-white border rounded-lg hover:text-blue-600"
                                  onClick={() => toggleReplies(comment.id)}
                                >
                                  Reply
                                </button>

                                {/* ... rest of reply logic */}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-2 text-xs text-center text-gray-400">
                        No comments yet.
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))}


          {/* Infinite scroll loader */}
          {hasMore && (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* End of feed */}
          {!hasMore && posts.length > 0 && (
            <div className="py-4 text-center text-sm text-gray-500">
              🎉 You’ve seen all posts!
            </div>
          )}

          {/* Manual refresh button (optional) */}
          {!hasMore && posts.length === 0 && !loading && (
            <div className="py-8 text-center">
              <p className="mb-4 text-gray-500">No posts yet.</p>
              <button
                onClick={refreshFeed}
                className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
              >
                Try Again
              </button>
            </div>
          )}

          
        </section>

        {/* Right sidebar - hidden on mobile and tablet, visible on large screens */}
        <aside className="hidden xl:block w-full max-w-[350px] p-2 sticky top-4 h-fit">
          <FeedRightSidebar />
        </aside>

        {/* Right spacer - hidden on mobile, visible on large screens */}
        <div className="hidden xl:block flex-grow max-w-[200px]"></div>
      </div>
      {editingPost && (
        <EditPostModal
          post={editingPost}
          onSave={editPost}
          onClose={closeEditModal}
          token={token}
        />
      )}
    </MainLayout>
  );
}
