// src/components/assignments/AssignmentSubmissionForm.jsx

import React, { useState } from "react";
import { useSelector } from "react-redux";
import useUploadImageApi from "../../hooks/useUploadImageApi";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function AssignmentSubmissionForm({
  assignmentId,
  assignmentTitle = "Assignment",
  deadline,
  onCancel,
  onSuccess,
}) {
  const [textResponse, setTextResponse] = useState("");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { token, user } = useSelector((state) => state.auth);
  const { uploadImage } = useUploadImageApi();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB!");
      return;
    }
    setFile(selectedFile);
  };

  const uploadSubmissionFile = async (selectedFile) => {
    try {
      const url = await uploadImage(selectedFile, "submissionFile");
      if (!url) throw new Error("Failed to upload file");
      return url;
    } catch (error) {
      console.error("Submission upload failed:", error);
      throw new Error(error.message || "Upload failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);

    let fileUrl = null;
    let fileName = null;
    let fileType = null;
    let fileSize = null;

    try {
      // Upload file if provided
      if (file) {
        fileUrl = await uploadSubmissionFile(file);
        fileName = file.name;
        fileType = file.type;
        fileSize = file.size;
      }

      // Prepare payload (matching backend expectations)
      const payload = {
        assignment_id: assignmentId,
        text_response: textResponse.trim() || null,
      };

      // Attach file metadata only if file uploaded
      if (fileUrl) {
        payload.file_url = fileUrl;
        payload.file_name = fileName;
        payload.file_type = fileType;
        payload.file_size = fileSize;
      }

      // Submit to backend
      const response = await axios.post(
        `${BASE_URL}/chat/submit-assignment`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        alert("Assignment submitted successfully!");
        onSuccess?.(response.data);
      } else {
        throw new Error(response.data.message || "Submission failed");
      }

    } catch (error) {
      console.error("Submission error:", error);
      alert(" Failed to submit assignment: " + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center min-h-screen gap-6 px-4 py-6 bg-gray-100">
      <div className="flex flex-col gap-5 bg-white rounded-lg shadow-md w-[729px] p-6">
        <h2 className="text-2xl font-bold">Submit Assignment</h2>

        {/* Assignment Info */}
        <div className="p-4 border border-blue-200 rounded-lg bg-blue-50">
          <h3 className="font-semibold text-blue-800">📄 {assignmentTitle}</h3>
          {deadline && (
            <p className="mt-1 text-sm text-gray-600">
              📅 Deadline: {new Date(deadline).toLocaleDateString("en-IN")}
            </p>
          )}
        </div>

        {/* Response */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Your Response (Optional)
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none min-h-[120px]"
            value={textResponse}
            onChange={(e) => setTextResponse(e.target.value)}
            placeholder="Explain your approach, challenges, or key learnings..."
            disabled={isSubmitting}
          />
        </div>

        {/* File Upload */}
        <div>
          <label
            htmlFor="submission-file-upload"
            className="text-blue-600 cursor-pointer hover:underline"
          >
            + Attach File (Optional)
          </label>
          <input
            id="submission-file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".jpeg,.jpg,.png,.gif,.bmp,.pdf,.zip,.xls,.doc,.docx"
            disabled={isSubmitting}
          />
          <p className="mt-1 text-sm text-gray-500">
            Maximum file size: 5 MB <br />
            Allowed: PDF, DOC, DOCX, ZIP, JPG, PNG, etc.
          </p>
          {file && (
            <p className="mt-1 text-sm text-green-600">Selected: {file.name}</p>
          )}
        </div>

        {/* Note */}
        <div className="p-3 text-xs text-gray-500 bg-gray-100 rounded">
          🔹 You can submit text only, file only, or both.<br />
          🔹 After submission, the recruiter will be notified instantly.
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-full hover:bg-gray-300"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`px-6 py-2 text-white rounded-full ${
              isSubmitting ? "bg-green-400" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {isSubmitting ? "Submitting..." : "Submit Assignment"}
          </button>
        </div>
      </div>
    </div>
  );
}