import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import MainLayout from "../../../components/layout/MainLayout.jsx";
import profile from "../../../assets/dummyProfile3.jpg";
import FeedRightSidebar from "../feed/FeedRightSidebar";
import { BiCommentDetail, BiLike } from "react-icons/bi";
import { FaEllipsisH } from "react-icons/fa";
import { LiaShareSolid } from "react-icons/lia";
import { TbSend } from "react-icons/tb";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import feedApi from "../../../api/feedApi.js";
import { getImageUrl } from "../../../../utils.js";
import { Link, useParams } from "react-router-dom";
import useFeedApi from "../../../hooks/useFeedApi";
import EditPostModal from "../../../components/modals/EditPostModal.jsx";
import EmojiPicker from "emoji-picker-react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function FeedPostDetail() {
  const { slug } = useParams();
  const { token, user } = useSelector((state) => state.auth);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Comments states
  const [commentInputs, setCommentInputs] = useState({});
  const [openComments, setOpenComments] = useState(false);
  const [openReplies, setOpenReplies] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  const [openPostOptions, setOpenPostOptions] = useState(false);
  const [openCommentOptions, setOpenCommentOptions] = useState({});

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeInputKey, setActiveInputKey] = useState(null); // e.g., `post-${postId}` or `reply-${commentId}`
  const [emojiPickerPosition, setEmojiPickerPosition] = useState("bottom");

  // Use the feed API hook for consistent like handling
  const {
    handleLike: handleFeedLike,
    handleFollowToggle,
    editPost,
  } = useFeedApi();

  // Fetch post by slug
  useEffect(() => {
    const fetchPost = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const response = await feedApi.getPostBySlug(slug, token);
        console.log("detail page", response);
        setPost(response);
      } catch (err) {
        setError("Post not found or failed to load.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, token]);

  useEffect(() => {
    const handleClickOutside = () => {
      setOpenPostOptions(false);
      setOpenCommentOptions({});
      setShowEmojiPicker(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!post || !showEmojiPicker || activeInputKey !== `post-${post.id}`) {
      return;
    }

    const inputElement = document.querySelector(
      'input[placeholder="Write a comment..."]'
    );
    if (inputElement) {
      const rect = inputElement.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      setEmojiPickerPosition(
        spaceBelow < 350 && spaceAbove > 350 ? "top" : "bottom"
      );
    }
  }, [showEmojiPicker, activeInputKey, post?.id]);

  // // Like handler - updated to use the feed API hook
  const handleLike = (postId, userId) => {
    if (!token) return;

    // Use the same handleLike function from useFeedApi
    handleFeedLike(postId, userId);

    // Also update local state for immediate UI feedback
    setPost((prev) => {
      if (!prev) return prev;

      // const isCurrentlyLiked = prev.likedBy && prev.likedBy.includes(userId);
      const isCurrentlyLiked = prev.isLiked;
      const newLikeCount = isCurrentlyLiked
        ? prev.like_count - 1
        : prev.like_count + 1;

      return {
        ...prev,
        like_count: newLikeCount,
        isLiked: !isCurrentlyLiked,
      };
    });
  };

  // Comment handler
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
      setPost((prev) => ({
        ...prev,
        comments: response.comments,
        comment_count: response.comment_count,
      }));
      setCommentInputs((prev) => ({ ...prev, [post_id]: "" }));
    } catch (error) {
      alert("Failed to post comment");
      console.error("Error posting comment:", error);
    }
  };

  const handleFollowToggleLocal = async (userId, isCurrentlyFollowing) => {
    if (!token) return;

    setPost((prev) => {
      if (!prev || !prev.User || prev.User.id !== userId) return prev;
      return {
        ...prev,
        User: {
          ...prev.User,
          isFollowing: !isCurrentlyFollowing,
        },
      };
    });

    try {
      await handleFollowToggle(userId, isCurrentlyFollowing);
    } catch (err) {
      // Revert on error
      setPost((prev) => {
        if (!prev || !prev.User || prev.User.id !== userId) return prev;
        return {
          ...prev,
          User: {
            ...prev.User,
            isFollowing: isCurrentlyFollowing,
          },
        };
      });
      alert("Failed to update follow status.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!token || !user) {
      alert("You must be logged in to delete a comment.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      await feedApi.deleteComment(commentId, token);

      // Optimistically update UI
      setPost((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: prev.comments.filter((c) => c.id !== commentId),
          comment_count: Math.max(0, (prev.comment_count || 0) - 1),
        };
      });
    } catch (error) {
      console.error("Failed to delete comment:", error);
      alert(error.message || "Failed to delete comment.");
    }
  };

  const handleDeletePost = async () => {
    if (!token || !user) return;

    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      await feedApi.deletePost(post.id, token);
      alert("Post deleted successfully.");
      window.history.back();
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert(error.message || "Failed to delete post.");
    }
  };

  // Toggle comments section
  const toggleComments = () => {
    setOpenComments(!openComments);
  };

  // Toggle replies for a comment
  const toggleReplies = (commentId) => {
    setOpenReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  // Share handler
  const handleShare = async () => {
    if (!post?.slug) {
      alert("This post cannot be shared.");
      return;
    }

    // Use the social preview endpoint
    const postUrl = `${BASE_URL}/feed/social-preview?slug=${post.slug}`;
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

  // //Add meta tags for improved sharing on various social apps
  // useEffect(() => {
  //   if (!post) return;

  //   // Set document title
  //   const originalTitle = document.title;
  //   document.title = post.caption?.slice(0, 60) || "Check out this post!";

  //   // Helper to create or update meta tags
  //   const setMetaTag = (property, content, type = 'property') => {
  //     // Select by og:property or twitter:name
  //     let selector = type === 'property'
  //       ? `meta[property="${property}"]`
  //       : `meta[name="${property}"]`;
  //     let element = document.querySelector(selector);

  //     if (!element) {
  //       element = document.createElement('meta');
  //       element.setAttribute(type, property);
  //       document.head.appendChild(element);
  //     }

  //     element.setAttribute('content', content);
  //   };

  //   // Set Open Graph Tags
  //   setMetaTag('og:title', post.caption?.slice(0, 60) || "Check out this post!", 'property');
  //   setMetaTag('og:description', post.caption?.slice(0, 160) || "A post shared from our platform.", 'property');
  //   setMetaTag('og:image', "https://hatrabbits.com/en/random-image/", 'property');
  //   setMetaTag('og:url', `${window.location.origin}/feed-post/${post.slug}`, 'property');
  //   setMetaTag('og:type', 'article', 'property');

  //   // Set Twitter Card Tags
  //   setMetaTag('twitter:card', 'summary_large_image', 'name');
  //   setMetaTag('twitter:title', post.caption?.slice(0, 60) || "Check out this post!", 'name');
  //   setMetaTag('twitter:description', post.caption?.slice(0, 160) || "A post shared from our platform.", 'name');
  //   setMetaTag('twitter:image', "https://hatrabbits.com/en/random-image", 'name');

  //   // Cleanup function — reverts title and removes dynamic meta tags (optional)
  //   return () => {
  //     document.title = originalTitle;

  //     // Optionally remove only the tags we added
  //     const metaTagsToRemove = [
  //       'og:title', 'og:description', 'og:image', 'og:url', 'og:type',
  //       'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'
  //     ];

  //     metaTagsToRemove.forEach(prop => {
  //       const element = document.querySelector(`meta[property="${prop}"], meta[name="${prop}"]`);
  //       if (element && element.parentElement) {
  //         element.parentElement.removeChild(element);
  //       }
  //     });
  //   };
  // }, [post]); // Re-run when post changes

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center min-h-screen p-4 bg-gray-100">
          <div className="w-full max-w-3xl p-6 bg-white rounded-lg shadow">
            <div className="py-8 text-center text-gray-600">
              Loading post...
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !post) {
    return (
      <MainLayout>
        <div className="flex justify-center min-h-screen p-4 bg-gray-100">
          <div className="w-full max-w-3xl p-6 bg-white rounded-lg shadow">
            <div className="px-4 py-8 text-center text-red-500">
              {error || "Post not found."}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex justify-center min-h-screen px-2 bg-gray-100 sm:px-4 md:px-6 lg:px-8">
        {/* Left spacer */}
        <div className="hidden xl:block flex-grow max-w-[200px]"></div>

        {/* Main content */}
        <section className="w-full max-w-[750px] p-2 mx-auto">
          <article className="p-3 mb-4 bg-white border rounded-lg shadow-sm sm:p-4">
            {/* Post header */}
            <header className="flex items-center gap-2 mb-3 sm:gap-3">
              <img
                src={
                  post.User?.profile_pic
                    ? getImageUrl(post.User.profile_pic)
                    : profile
                }
                alt={post.User?.first_name || "User"}
                className="flex-shrink-0 object-cover w-8 h-8 rounded-full sm:w-10 sm:h-10"
              />
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

                  {/* Follow / Following Button (only if not own post) */}
                  {post.user_id !== user?.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFollowToggleLocal(
                          post.User.id,
                          post.User.isFollowing
                        );
                      }}
                      disabled={!token}
                      className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
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
                <div className="text-xs text-gray-500">{post.user_role}</div>
              </div>
              {/* Post Options Menu */}
              <div className="relative">
                {post.user_id === user?.id && (
                  <button
                    className="p-1 text-gray-500 rounded cursor-pointer hover:bg-gray-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenPostOptions((prev) => !prev);
                    }}
                    aria-label="Post options"
                  >
                    <FaEllipsisH />
                  </button>
                )}

                {post.user_id === user?.id && openPostOptions && (
                  <div
                    className="absolute right-0 z-10 w-32 mt-1 bg-white border rounded-md shadow-lg"
                    onClick={(e) => e.stopPropagation()} // 👈 Prevent closing when clicking inside menu
                  >
                    {/* <button
                      className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditing(true);
                        setOpenPostOptions(false);
                      }}
                    >
                      Edit Post
                    </button> */}
                    <button
                      className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePost();
                        setOpenPostOptions(false);
                      }}
                    >
                      Delete Post
                    </button>
                  </div>
                )}
              </div>
            </header>

            {/* Post image */}
            {post.image && (
              <img
                src={getImageUrl(post.image)}
                alt="Post"
                className="object-cover w-full h-auto mb-3 rounded-lg max-h-96"
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
                onClick={toggleComments}
              >
                <BiCommentDetail className="text-lg sm:text-xl" />
                <span className="mt-1 text-xs sm:text-sm">
                  Comment ({post.comment_count})
                </span>
              </div>
              <div
                className="flex flex-col items-center p-2 transition-colors rounded-lg cursor-pointer hover:bg-gray-50"
                onClick={handleShare}
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
            {openComments && (
              <div className="pt-3 mt-3 border-t">
                <div className="relative mb-3">
                  <div className="flex items-end gap-2">
                    {/* Input + Emoji Button */}
                    <div className="relative flex items-center flex-1 gap-2 px-3 py-2 text-sm bg-white border rounded-full focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        className="flex-1 min-w-0 text-sm outline-none"
                        value={commentInputs[post.id] || ""}
                        onChange={(e) =>
                          setCommentInputs((prev) => ({
                            ...prev,
                            [post.id]: e.target.value,
                          }))
                        }
                        onFocus={() => setActiveInputKey(`post-${post.id}`)}
                      />
                      <button
                        type="button"
                        className="flex-shrink-0 text-gray-500 hover:text-gray-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          const key = `post-${post.id}`;
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

                    {/* Comment Button */}
                    <button
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 whitespace-nowrap"
                      onClick={() => handleComment(post.id)}
                    >
                      Comment
                    </button>
                  </div>

                  {/* Emoji Picker - Smart Positioning */}
                  {showEmojiPicker && activeInputKey === `post-${post.id}` && (
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
                              (commentInputs[post.id] || "") + emojiData.emoji;
                            setCommentInputs((prev) => ({
                              ...prev,
                              [post.id]: newText,
                            }));
                            setShowEmojiPicker(false);
                          }}
                          height={270}
                          width="100%"
                          theme="light"
                          searchDisabled={false}
                          previewConfig={{ showPreview: false }}
                          skinTonesDisabled={true}
                          emojiStyle="google"
                        />
                        {/* Floating close button */}
                        <button
                          onClick={() => setShowEmojiPicker(false)}
                          className="absolute z-10 p-1 text-gray-500 rounded-full top-2 right-2 hover:text-gray-800 bg-white/80 backdrop-blur-sm"
                          aria-label="Close emoji picker"
                          style={{ fontSize: "14px" }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {post.comments && post.comments.length > 0 ? (
                  <div className="space-y-3">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="mb-3">
                        <div className="flex items-start gap-2">
                          <img
                            src={
                              comment.profile_pic
                                ? getImageUrl(comment.profile_pic)
                                : profile
                            }
                            alt=""
                            className="flex-shrink-0 object-cover w-6 h-6 mt-1 rounded-full sm:w-7 sm:h-7"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col gap-1 mb-1 sm:flex-row sm:items-center">
                                  {comment.uuid ? (
                                    <Link
                                      to={`/public-profile/${comment.uuid}`}
                                      className="text-xs font-semibold text-gray-900 sm:text-sm hover:underline hover:text-gray-700"
                                    >
                                      {comment.first_name} {comment.last_name}
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
                                <p className="mb-2 text-sm text-gray-700">
                                  {comment.text || comment.comment}
                                </p>
                              </div>

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
                                          handleDeleteComment(comment.id);
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

                            <button
                              className="px-3 py-1 text-xs text-blue-500 transition-colors bg-white border rounded-lg hover:text-blue-600"
                              onClick={() => toggleReplies(comment.id)}
                            >
                              Reply
                            </button>
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
        </section>

        {/* Right sidebar */}
        <aside className="hidden xl:block w-full max-w-[350px] p-2 sticky top-4 h-fit">
          <FeedRightSidebar></FeedRightSidebar>
        </aside>

        {/* Right spacer */}
        <div className="hidden xl:block flex-grow max-w-[200px]"></div>
      </div>

      {isEditing && post && (
        <EditPostModal
          post={post}
          onSave={async (postId, updates) => {
            await editPost(postId, updates);
            // Optional: refetch or update local state
            // setPost((prev) => ({ ...prev, ...updates }));
            const updatedPost = await feedApi.getPostBySlug(post.slug, token);
            setPost(updatedPost);
          }}
          onClose={() => setIsEditing(false)}
          token={token}
        />
      )}
    </MainLayout>
  );
}
