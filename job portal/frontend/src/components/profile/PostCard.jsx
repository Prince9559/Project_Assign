// src/components/profile/PostCard.jsx
import React from "react";
import { BiCommentDetail, BiLike } from "react-icons/bi";
import { FaEllipsisH } from "react-icons/fa";
import { LiaShareSolid } from "react-icons/lia";
import dummyProfile3 from "../../assets/dummyProfile3.jpg";
import imageUnavailable from "../../assets/image_not_available.jpg";
import { getImageUrl } from "../../../utils.js";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import feedApi from "../../api/feedApi";
import useFeedApi from "../../hooks/useFeedApi";
import { useSelector } from "react-redux";
import { Link,useNavigate } from "react-router-dom";


const PostCard = ({
  post,
  onLike,
  onComment,
  onShare,
  commentInputs,
  setCommentInputs,
  openComments,
  setOpenComments,
  openReplies,
  setOpenReplies,
  replyInputs,
  setReplyInputs,
  token,
}) => {
  const toggleComments = () => {
    setOpenComments((prev) => ({ ...prev, [post.id]: !prev[post.id] }));
  };

  const { user } = useSelector((state) => state.auth);

  const handleCommentSubmit = async () => {
    const text = commentInputs[post.id]?.trim();
    if (!text) return;

    try {
      // Call real API
      const response = await feedApi.postComment(
        post.id,
        {
          //   user_id: Number(post.user?.id || post.User?.id),
          user_id: user.id,
          comment: text,
        },
        token
      );

      // Update local state if needed
      setCommentInputs((prev) => ({ ...prev, [post.id]: "" }));
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment");
    }
  };

  const toggleReplies = (commentId) => {
    setOpenReplies((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const handleReplySubmit = async (commentId) => {
    const text = replyInputs[commentId]?.trim();
    if (!text) return;

    try {
      // You can enhance this with real reply logic
      console.log("Reply to comment:", commentId, text);
      setReplyInputs((prev) => ({ ...prev, [commentId]: "" }));
    } catch (error) {
      console.error("Error replying:", error);
    }
  };

  return (
    <div className="p-3 bg-white border rounded-lg shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <img
          src={
            post.user?.profileImage
              ? getImageUrl(post.user.profileImage)
              : post.User?.profile_pic
              ? getImageUrl(post.User.profile_pic)
              : post.User?.UserDetail?.user_profile_pic
              ? getImageUrl(post.User.UserDetail.user_profile_pic)
              : post.User?.CompanyRecruiterProfile?.logo_url
              ? getImageUrl(post.User.CompanyRecruiterProfile.logo_url)
              : dummyProfile3
          }
          alt={post.user?.first_name || post.User?.first_name || "User"}
          className="object-cover w-8 h-8 rounded-full"
        />
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-0.5">
            {post.user?.uuid ? (
              <Link
                to={`/public-profile/${post.user.uuid}`}
                className="text-sm font-semibold text-gray-900 truncate cursor-pointer hover:underline hover:text-gray-700"
              >
                {post.user.first_name} {post.user.last_name}
              </Link>
            ) : (
              <span className="text-sm font-semibold text-gray-900 truncate">
                {post.user?.first_name || post.User?.first_name}{" "}
                {post.user?.last_name || post.User?.last_name || "Unknown User"}
              </span>
            )}
            <span className="text-xs text-gray-500">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>
        {/* <FaEllipsisH className="text-gray-400" /> */}
      </div>

      {/* Caption */}
      <p className="mb-2 text-sm text-gray-700 line-clamp-2">
        {post.content || post.caption}
      </p>

      {/* Image */}
      {post.image && (
        <img
          src={getImageUrl(post.image)}
          alt="Post"
          onError={(e) => (e.target.src = imageUnavailable)}
          className="object-cover w-full h-32 mb-2 rounded"
        />
      )}

      {/* Actions */}
      <div className="flex items-center justify-between py-1 text-xs text-gray-500 border-t">
        <button
          className={`flex flex-col items-center p-1 transition-colors rounded hover:bg-gray-50 ${
            // post.likedBy &&
            // post.likedBy.includes(post.user?.id || post.User?.id)
            post.isLiked ? "text-blue-600" : ""
          }`}
          onClick={() => onLike(post.id, user?.id)}
        >
          <BiLike className="text-base" />
          <span>Like ({post.like_count || 0})</span>
        </button>
        <button
          className="flex flex-col items-center p-1 transition-colors rounded hover:bg-gray-50"
          // onClick={toggleComments}
          onClick={() => onComment(post)}
        >
          <BiCommentDetail className="text-base" />
          <span>Comment ({post.comment_count || 0})</span>
        </button>
        <button
          className="flex flex-col items-center p-1 transition-colors rounded hover:bg-gray-50"
          onClick={() => onShare(post)}
        >
          <LiaShareSolid className="text-base" />
          <span>Share</span>
        </button>
      </div>

      {/* Comments */}
      {openComments[post.id] && (
        <div className="pt-2 mt-2 border-t">
          <div className="flex gap-1 mb-2">
            <Input
              type="text"
              size="small"
              placeholder="Write a comment..."
              className="flex-1 px-2 py-1 text-xs border rounded"
              value={commentInputs[post.id] || ""}
              onChange={(e) =>
                setCommentInputs({
                  ...commentInputs,
                  [post.id]: e.target.value,
                })
              }
            />
            <Button
              size="small"
              className="px-2 py-1 text-xs"
              onClick={handleCommentSubmit}
            >
              Post
            </Button>
          </div>

          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-2">
              {post.comments.map((comment) => (
                <div key={comment.id} className="text-xs">
                  <div className="flex gap-2">
                    <img
                      src={
                        comment.profile_pic
                          ? getImageUrl(comment.profile_pic)
                          : dummyProfile3
                      }
                      alt=""
                      className="object-cover w-5 h-5 rounded-full"
                    />
                    <div className="flex-1">
                      <div className="font-semibold">{comment.userName}</div>
                      <p className="text-gray-700">{comment.comment}</p>
                      <button
                        className="mt-1 text-blue-600"
                        onClick={() => toggleReplies(comment.id)}
                      >
                        Reply
                      </button>

                      {openReplies[comment.id] && (
                        <div className="flex gap-1 mt-1 ml-4">
                          <Input
                            type="text"
                            size="small"
                            placeholder="Reply..."
                            className="flex-1 px-2 py-1 text-xs border rounded"
                            value={replyInputs[comment.id] || ""}
                            onChange={(e) =>
                              setReplyInputs({
                                ...replyInputs,
                                [comment.id]: e.target.value,
                              })
                            }
                          />
                          <Button
                            size="small"
                            className="px-2 py-1 text-xs"
                            onClick={() => handleReplySubmit(comment.id)}
                          >
                            Reply
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-500">No comments yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PostCard;
