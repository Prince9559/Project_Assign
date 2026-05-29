import React, { useState, useEffect } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import uploadImageApi from "../../api/uploadImageApi";
import { getImageUrl } from "../../../utils";
import imageUnavailable from "../../assets/image_not_available.jpg";

const EditPostModal = ({ post, onSave, onClose, token }) => {
  const [caption, setCaption] = useState(post.caption || "");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(post.image || "");
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Reset when modal opens
    setCaption(post.caption || "");
    setCurrentImageUrl(post.image || "");
    setImageFile(null);
    setImagePreview(null);
  }, [post]);

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setCurrentImageUrl(""); // Clear current image if new file selected
  };

  const handleSave = async () => {
    if (!token) return;

    setIsSaving(true);
    let finalImageUrl = currentImageUrl;

    try {
      // Upload new image if selected
      if (imageFile) {
        setIsUploading(true);
        const uploadResult = await uploadImageApi.uploadImage(
          imageFile,
          "feedImage",
          token
        );
        finalImageUrl =
          typeof uploadResult === "string"
            ? uploadResult
            : uploadResult?.url?.[0] || "";
        setIsUploading(false);
      }

      // Only send fields that changed
      const updates = {};
      if (caption !== post.caption) updates.caption = caption;
      if (finalImageUrl !== post.image) updates.image = finalImageUrl;

      if (Object.keys(updates).length === 0) {
        onClose(); // Nothing to update
        return;
      }

      await onSave(post.id, updates);
      onClose();
    } catch (err) {
      console.error("Failed to save post:", err);
      alert("Failed to update post. Please try again.");
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div
        className="w-full max-w-md p-4 bg-white rounded-lg shadow-lg sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold">Edit Post</h2>

        {/* Caption */}
        <Input
          as="textarea"
          rows={3}
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />

        {/* Image preview or current image */}
        <div className="mb-4">
          {(imagePreview || currentImageUrl) && (
            <img
              src={imagePreview || getImageUrl(currentImageUrl)}
              alt="Post preview"
              className="object-cover w-full h-48 mb-2 rounded"
              onError={(e) => {
                e.target.src = imageUnavailable;
              }}
            />
          )}
        </div>

        {/* Image upload */}
        <label className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 transition-colors bg-white border border-blue-300 rounded cursor-pointer hover:bg-blue-50">
          {imageFile ? "Change image" : "Add/Change image"}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
        </label>

        {/* Buttons */}
        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSaving || isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || isUploading}
          >
            {isUploading ? "Uploading..." : isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;