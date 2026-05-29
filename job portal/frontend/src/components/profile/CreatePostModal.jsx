// src/components/profile/CreatePostModal.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import Modal from "react-modal";
import addMediaIcon from "../../assets/add-media.png";
import dummyProfile3 from "../../assets/dummyProfile3.jpg";

import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from  "../../components/ui/Textarea";
import uploadImageApi from "../../api/uploadImageApi";
import feedApi from "../../api/feedApi"; // Import your feed API

// Make sure to set appElement for accessibility
Modal.setAppElement("#root");

const CreatePostModal = ({
  isOpen,
  onClose,
  onPostCreated,
  token,
  userId,
  userProfilePic,
  prefilledCaption = "",
  visibilityScope = "global",     
  collegeIds = [],  
}) => {
  const [caption, setCaption] = useState(prefilledCaption);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [posting, setPosting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handlePost = async () => {
    if (!token || !userId) {
      alert("User not logged in");
      return;
    }

    setPosting(true);
    let imageUrl = "";

    try {
      if (imageFile) {
        setUploadingImage(true);
        const imageUrlResult = await uploadImageApi.uploadImage(
          imageFile,
          "feedImage",
          token
        );
        if (typeof imageUrlResult === "string") {
          imageUrl = imageUrlResult;
        } else if (imageUrlResult?.url) {
          imageUrl = imageUrlResult.url[0];
        }
        setUploadingImage(false);
      }

      const payload = {
        user_id: userId,
        image: imageUrl,
        caption,
      };

      // Call real API
      const response = await feedApi.postFeed(payload, token);

      if (
        response.success ||
        response.message === "Feed post created successfully"
      ) {
        const feedPost = response.feedPost;
        console.log(feedPost);
        // const newPost = {
        //   id: feedPost.id,
        //   content: feedPost.caption,
        //   image: feedPost.image,
        //   like_count: 0,
        //   comment_count: 0,
        //   created_at: new Date().toISOString(),
        //   User: {
        //     first_name: "User",
        //     last_name:  "",
        //     profileImage: feedPost?.profile_pic || dummyProfile3,
        //   },
        //   comments: [],
        //   slug:feedPost.slug,
        //   isLiked:false
        // };

        const newPost = {
          id: feedPost.id,
          content: feedPost.caption, //  use caption from backend
          image: feedPost.image,
          like_count: feedPost.like_count || 0,
          comment_count: feedPost.comment_count || 0,
          created_at: feedPost.created_at,
          slug: feedPost.slug,
          isLiked: false, // since it's your own post, you haven't liked it yet
          comments: [], // or parse if needed, but usually empty on create
          user: {
            first_name: "You", // or fetch real name if available
            last_name: "",
            profileImage: userProfilePic, // you already have this as prop!
            user_type: feedPost.user_role || "User",
          },
        };

        onPostCreated(newPost);
        onClose();
        setCaption("");
        setImageFile(null);
        setImagePreview(null);
      } else {
        throw new Error(response.message || "Failed to post");
      }
    } catch (err) {
      console.error("Error posting:", err);
      alert("Failed to post. Please try again.");
    } finally {
      setPosting(false);
      setUploadingImage(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      overlayClassName="fixed inset-0 z-50"
    >
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Create a post</h2>
        </div>

        <div className="p-4">
          {/* User info */}
          <div className="flex items-center gap-3 mb-4">
            <img
              src={userProfilePic || dummyProfile3}
              alt="Profile"
              className="object-cover w-10 h-10 rounded-full"
            />
            <div>
              <div className="font-semibold">You</div>
              <div className="text-xs text-gray-500">
                Anyone can see your post
              </div>
            </div>
          </div>

          {/* Caption */}
          {/* <Input
            as="textarea"
            placeholder="What do you want to talk about?"
            className="w-full p-3 mb-3 border rounded-lg resize-none"
            rows="3"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          /> */}

          <Textarea
            placeholder="What do you want to talk about?"
            className="mb-3"
            rows={5} //  5 rows by default
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
          />

          {/* Media preview */}
          {imagePreview && (
            <div className="mb-3">
              <img
                src={imagePreview}
                alt="Preview"
                className="object-cover w-full h-48 rounded-lg"
              />
            </div>
          )}

          {/* Add media */}
          <label className="flex items-center gap-2 p-2 text-sm text-gray-600 rounded-lg cursor-pointer hover:bg-gray-50">
            <img src={addMediaIcon} alt="Add media" className="w-4 h-4" />
            Add a photo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </label>
        </div>

        <div className="flex justify-between p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <Button
            onClick={handlePost}
            disabled={posting || uploadingImage || !caption.trim()}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            {uploadingImage ? "Uploading..." : posting ? "Posting..." : "Post"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CreatePostModal;
