import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout.jsx";
import addMediaIcon from "../../../assets/add-media.png";
import { BiCommentDetail, BiLike } from "react-icons/bi";
import { FaEllipsisH } from "react-icons/fa";
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
import Textarea from "../../../components/ui/Textarea.jsx";

export default function FeedPage() {
    const { token, user } = useSelector((state) => state.auth);

    const [caption, setCaption] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [postingFeed, setPostingFeed] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);

    // Comments states
    const [commentInputs, setCommentInputs] = useState({});
    const [openComments, setOpenComments] = useState({});
    const [openPostOptions, setOpenPostOptions] = useState({});
    const [openCommentOptions, setOpenCommentOptions] = useState({});
    const [editingPost, setEditingPost] = useState(null);

    // Emoji picker states
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [activeInputKey, setActiveInputKey] = useState(null);
    const [emojiPickerPosition, setEmojiPickerPosition] = useState('bottom');

    // Feed hook
    const {
        posts,
        loading,
        error,
        hasMore,
        isInitialLoad,
        fetchFeed,
        refreshFeed,
        loadMore,
        handleFollowToggle,
        postFeed,
        setPosts,
        handleLike,
        deletePost,
        editPost,
    } = useFeedApi();

    // Intersection Observer for infinite scroll
    const observerTarget = useRef(null);

    // Initial load
    useEffect(() => {
        if (token && isInitialLoad) {
            fetchFeed(true);
        }
    }, [token, isInitialLoad, fetchFeed]);

    // Infinite scroll with Intersection Observer (more reliable than scroll events)
    useEffect(() => {
        if (isInitialLoad || !hasMore || loading) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            {
                root: null,
                rootMargin: '200px', // Trigger 200px before reaching the target
                threshold: 0.1,
            }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [isInitialLoad, hasMore, loading, loadMore]);

    // Emoji picker positioning
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

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = () => {
            setOpenPostOptions({});
            setOpenCommentOptions({});
            setShowEmojiPicker(false);
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    // const handleImageChange = async (e) => {
    //     const file = e.target.files[0];
    //     setImageFile(file);
    //     if (file) {
    //         setImagePreview(URL.createObjectURL(file));
    //     } else {
    //         setImagePreview(null);
    //     }
    // };
    const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const maxSize = 5 * 1024 * 1024; // 5MB

  if (file.size > maxSize) {
    alert("Image size must be less than or equal to 5 MB");
    e.target.value = ""; // reset input
    return;
  }

  const previewUrl = URL.createObjectURL(file);
  setImagePreview(previewUrl);
  setImageFile(file); // agar backend ke liye store kar rahe ho
};


    const handleFeedPost = async () => {
        if (!token || !user) {
            alert("User not logged in");
            return;
        }

        if (!caption.trim() && !imageFile) {
            alert("Please add a caption or image");
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

    const closeEditModal = () => {
        setEditingPost(null);
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
                { comment: commentText },
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
            const response = await feedApi.deleteComment(commentId, token);

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
                {/* Left spacer */}
                <div className="hidden xl:block flex-grow max-w-[200px]"></div>

                {/* Main content */}
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
                            <Textarea
                                type="text"
                                size="large"
                                placeholder="Share something...                                                        "
                                className="flex-1 h-120 w-120 border border-gray-400 rounded px-3 sm:px-4 w-[500px]"
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

<p className="pl-12 text-xs text-gray-400 sm:pl-14">
  Maximum file size: 5 MB (images only)
</p>

                        <Button
                            className="px-3 py-2 ml-auto text-sm text-white transition-colors bg-blue-600 rounded-lg sm:px-4 hover:bg-blue-700 sm:text-base"
                            size="small"
                            onClick={handleFeedPost}
                            disabled={uploadingImage || postingFeed}
                        >
                            {uploadingImage ? "Uploading..." : postingFeed ? "Posting..." : "Post"}
                        </Button>
                    </div>

                    {/* Initial loading state */}
                    {isInitialLoad && loading && (
                        <div className="flex justify-center py-12">
                            <div className="w-8 h-8 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                    )}

                    {/* Error state */}
                    {error && (
                        <div className="px-4 py-8 text-center">
                            <p className="mb-4 text-red-500">{error}</p>
                            <button
                                onClick={refreshFeed}
                                className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && !error && posts.length === 0 && !isInitialLoad && (
                        <div className="px-4 py-8 text-center">
                            <p className="mb-4 text-gray-500">No posts yet. Be the first to share something!</p>
                            <button
                                onClick={refreshFeed}
                                className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                            >
                                Refresh
                            </button>
                        </div>
                    )}

                    {/* Posts list */}
                    {posts.map((post) => (
                        <article
                            key={`${post.feed_type}-${post.id}`}
                            className="p-3 mb-4 bg-white border rounded-lg shadow-sm sm:p-4"
                        >
                            <header className="flex items-center gap-2 mb-3 sm:gap-3">
                                <img
                                    src={
                                        post.User?.profile_pic
                                            ? getImageUrl(post.User.profile_pic)
                                            : dummyProfile3
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
                                                {post.User?.first_name} {post.User?.last_name || "Unknown User"}
                                            </span>
                                        )}

                                        {/* Follow button */}
                                        {post.User.id !== user.id && (
                                            <button
                                                onClick={() =>
                                                    handleFollowToggle(post.User.id, post.User.isFollowing)
                                                }
                                                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${post.User.isFollowing
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

                                    {/* Show badge for jobs */}
                                    {post.feed_type === 'job' && (
                                        <span className="inline-block px-2 py-0.5 mt-1 text-xs font-medium text-blue-700 bg-blue-100 rounded">
                                            Job Opportunity
                                        </span>
                                    )}
                                </div>

                                {/* Options menu */}
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

                                    {openPostOptions[post.id] && (
                                        <div className="absolute right-0 z-10 w-40 mt-1 bg-white border rounded-md shadow-lg">
                                            {post.user_id === user?.id && post.feed_type === 'post' && (
                                                <>
                                                    <button
                                                        className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditPost(post);
                                                            setOpenPostOptions({});
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
                                                            setOpenPostOptions({});
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
                                                    setOpenPostOptions({});
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
                                    src={post.image ? getImageUrl(post.image) : imageUnavailable}
                                    alt="Post"
                                    className="object-cover w-full mb-3 rounded-lg h-80 sm:h-64"
                                />
                            )}

                            {/* Post caption */}
                            <p className="mb-3 text-sm leading-relaxed text-gray-700 break-words">
                                {post.caption}
                            </p>

                            {/* Job details (if applicable) */}
                            {post.feed_type === 'job' && post.job && (
                                <div className="p-3 mb-3 border border-blue-200 rounded-lg bg-blue-50">
                                    <h4 className="mb-1 text-sm font-semibold text-blue-900">
                                        {post.job.opportunity_type || 'Job Opening'}
                                    </h4>
                                    {/* {(post.job.stipend_min || post.job.stipend_max) && (
                                        <p className="text-xs text-blue-700">
                                            💰 ₹{post.job.stipend_min?.toLocaleString()} - ₹{post.job.stipend_max?.toLocaleString()}
                                        </p>
                                    )} */}
                                </div>
                            )}

                            {/* Post actions */}
                            {post.feed_type === 'post' && (
                                <footer className="flex items-center justify-between py-2 text-sm text-gray-500 border-t">
                                    <div
                                        className={`flex flex-col items-center cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors ${post.isLiked ? "text-blue-600" : ""
                                            }`}
                                        onClick={() => handleLike(post.id, user?.id)}
                                    >
                                        <BiLike className="text-lg sm:text-xl" />
                                        <span className="mt-1 text-xs sm:text-sm">
                                            Like ({post.like_count || 0})
                                        </span>
                                    </div>
                                    <div
                                        className="flex flex-col items-center p-2 transition-colors rounded-lg cursor-pointer hover:bg-gray-50"
                                        onClick={() => toggleComments(post.id)}
                                    >
                                        <BiCommentDetail className="text-lg sm:text-xl" />
                                        <span className="mt-1 text-xs sm:text-sm">
                                            Comment ({post.comment_count || 0})
                                        </span>
                                    </div>
                                    <div
                                        className="flex flex-col items-center p-2 transition-colors rounded-lg cursor-pointer hover:bg-gray-50"
                                        onClick={() => handleShare(post)}
                                    >
                                        <LiaShareSolid className="text-lg sm:text-xl" />
                                        <span className="mt-1 text-xs sm:text-sm">Share</span>
                                    </div>
                                </footer>
                            )}

                            {/* Comments section */}
                            {openComments[post.id] && post.feed_type === 'post' && (
                                <div className="pt-3 mt-3 border-t">
                                    {/* Comment input */}
                                    <div className="relative mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="relative flex items-center flex-1 min-w-0 gap-2 px-3 py-0.5 text-sm bg-white border rounded-full focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500">
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
                                                    onKeyPress={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleComment(post.id);
                                                        }
                                                    }}
                                                />
                                                <button
                                                    type="button"
                                                    className="flex-shrink-0 text-gray-500 h-fit hover:text-gray-700"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        const key = `comment-${post.id}`;
                                                        setActiveInputKey(key);
                                                        setShowEmojiPicker(
                                                            showEmojiPicker && activeInputKey === key ? false : true
                                                        );
                                                    }}
                                                >
                                                    😊
                                                </button>
                                            </div>

                                            <button
                                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-700 whitespace-nowrap"
                                                onClick={() => handleComment(post.id)}
                                            >
                                                Comment
                                            </button>
                                        </div>

                                        {/* Emoji Picker */}
                                        {showEmojiPicker && activeInputKey === `comment-${post.id}` && (
                                            <div
                                                className={`absolute z-10 w-full max-w-xs ${emojiPickerPosition === "top"
                                                        ? "bottom-full mb-1"
                                                        : "top-full mt-1"
                                                    }`}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <div className="relative overflow-hidden bg-white border rounded-lg shadow-lg">
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
                                                        height={300}
                                                        width="100%"
                                                    />
                                                    <button
                                                        onClick={() => setShowEmojiPicker(false)}
                                                        className="absolute p-1 text-gray-500 rounded-full top-2 right-2 hover:text-gray-800 bg-white/80"
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
                                                <div key={comment.id} className="flex items-start gap-2">
                                                    <img
                                                        src={
                                                            comment.profile_pic
                                                                ? getImageUrl(comment.profile_pic)
                                                                : dummyProfile3
                                                        }
                                                        alt=""
                                                        className="flex-shrink-0 object-cover w-6 h-6 mt-1 rounded-full"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    {comment.uuid ? (
                                                                        <Link
                                                                            to={`/public-profile/${comment.uuid}`}
                                                                            className="text-xs font-semibold text-gray-900 hover:underline"
                                                                        >
                                                                            {comment.first_name} {comment.last_name}
                                                                        </Link>
                                                                    ) : (
                                                                        <span className="text-xs font-semibold text-gray-900">
                                                                            {comment.first_name} {comment.last_name}
                                                                        </span>
                                                                    )}
                                                                    <span className="text-xs text-gray-400">
                                                                        {new Date(comment.created_at).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-700 break-words">{comment.comment}</p>
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
                                                                    >
                                                                        <FaEllipsisH className="text-sm" />
                                                                    </button>

                                                                    {openCommentOptions[comment.id] && (
                                                                        <div className="absolute right-0 z-10 w-32 mt-1 bg-white border rounded-md shadow-lg">
                                                                            <button
                                                                                className="block w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleDeleteComment(post.id, comment.id);
                                                                                    setOpenCommentOptions({});
                                                                                }}
                                                                            >
                                                                                Delete
                                                                            </button>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-2 text-xs text-center text-gray-400">
                                            No comments yet. Be the first to comment!
                                        </div>
                                    )}
                                </div>
                            )}
                        </article>
                    ))}

                    {/* Infinite scroll trigger */}
                    <div ref={observerTarget} className="h-10" />

                    {/* Loading more indicator */}
                    {!isInitialLoad && loading && hasMore && (
                        <div className="flex justify-center py-4">
                            <div className="w-6 h-6 border-2 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                    )}

                    {/* End of feed */}
                    {!hasMore && posts.length > 0 && (
                        <div className="py-6 text-sm text-center text-gray-500">
                            <p>🎉 You've reached the end!</p>
                            <button
                                onClick={refreshFeed}
                                className="px-4 py-2 mt-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                            >
                                Refresh Feed
                            </button>
                        </div>
                    )}
                </section>

                {/* Right sidebar */}
                <aside className="hidden xl:block w-full max-w-[350px] p-2 sticky top-4 h-fit">
                    <FeedRightSidebar />
                </aside>

                {/* Right spacer */}
                <div className="hidden xl:block flex-grow max-w-[200px]"></div>
            </div>

            {/* Edit modal */}
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