// src/components/assignments/AssignmentForm.jsx

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import useUploadImageApi from "../../hooks/useUploadImageApi";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function AssignmentForm({
  // Single mode
  applicationId,
  applicantName,

  // Bulk mode
  applicationIds = [],
  applicantNames = [],

  bulk = false,
  onSuccess,
  onCancel,
}) {
  const isBulk = bulk && applicationIds.length > 0;

  const [message, setMessage] = useState("Thank you for your interest...");
  const [file, setFile] = useState(null);
  const [deadline, setDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFullList, setShowFullList] = useState(false);

  const { token } = useSelector((state) => state.auth);
  const { uploadImage } = useUploadImageApi();

  // Helper: format "To" preview
  const getToPreview = () => {
    if (!isBulk) return applicantName || "Applicant";

    const visible = applicantNames.slice(0, 2);
    const others = applicantNames.length - 2;
    if (others <= 0) return visible.join(", ");
    return `${visible.join(", ")} + ${others} others`;
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB!");
      return;
    }
    setFile(selectedFile);
  };

  const uploadAssignmentFile = async (selectedFile) => {
    try {
      const url = await uploadImage(selectedFile, "assignmentFile");
      if (!url) throw new Error("Failed to upload file");
      return url;
    } catch (error) {
      console.error("Assignment upload failed:", error);
      throw new Error(error.message || "Upload failed");
    }
  };

  const sendSingleAssignment = async (appId, fileUrl) => {
    const assignmentData = {
      application_id: appId,
      message,
      deadline,
      assignment_url: fileUrl,
      file_name: file?.name,
      file_type: file?.type,
      file_size: file?.size,
    };

    const response = await axios.post(
      `${BASE_URL}/chat/send-assignment`,
      assignmentData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!deadline) {
      alert("Please select a submission deadline");
      return;
    }
    if (!file) {
      alert("Please select a file");
      return;
    }

    setIsSubmitting(true);
    let fileUrl;

    try {
      // Upload file ONCE (shared across all assignments)
      fileUrl = await uploadAssignmentFile(file);
    } catch (error) {
      alert("Failed to upload assignment file: " + error.message);
      setIsSubmitting(false);
      return;
    }

    const ids = isBulk ? applicationIds : [applicationId];
    
    const failed = [];
    const successes = [];

    // Send assignment one by one
    for (const id of ids) {
      try {
        await sendSingleAssignment(id, fileUrl);
        successes.push(id);
      } catch (err) {
        console.error(`Failed to send assignment to ${id}:`, err);
        failed.push(id);
      }
    }

    // Handle result
    if (failed.length > 0) {
      const msg = `Assignment sent successfully to ${successes.length} applicant(s).`;
      const err = `Failed to send to ${failed.length} applicant(s).`;
      alert(`${msg}\n${err}`);
    } else {
      alert(`Assignment sent successfully to ${ids.length} applicant(s)!`);
    }

    onSuccess?.({ successes, failed });

    // Reset form
    setMessage("Thank you for your interest...");
    setDeadline("");
    setFile(null);
    setIsSubmitting(false);
  };

  // Auto-close full list when switching modes
  useEffect(() => {
    setShowFullList(false);
  }, [isBulk]);

  return (
    <div className="flex justify-center min-h-screen gap-6 px-4 py-6 bg-gray-100">
      <div className="flex flex-col gap-5 bg-white rounded-lg shadow-md w-[729px] p-6">
        <h2 className="text-2xl font-bold">Send Assignment</h2>

        {/* Recipient */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium text-gray-700">To:</span>
          <div className="flex flex-wrap items-center gap-1">
            {!showFullList ? (
              <button
                type="button"
                onClick={() => setShowFullList(true)}
                className="px-3 py-1 text-sm text-blue-800 bg-blue-100 rounded-full hover:underline"
              >
                {getToPreview()}
              </button>
            ) : (
              <div className="flex flex-wrap gap-1">
                {applicantNames.map((name, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 text-sm text-gray-700 bg-gray-100 rounded"
                  >
                    {name}
                  </span>
                ))}
                <button
                  type="button"
                  onClick={() => setShowFullList(false)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Show less
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Message */}
        <textarea
          className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none min-h-[120px]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={isSubmitting}
        />

        {/* File Upload */}
        <div>
          <label
            htmlFor="file-upload"
            className="text-blue-600 cursor-pointer hover:underline"
          >
            + Attachment
          </label>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".jpeg,.jpg,.png,.gif,.bmp,.pdf,.zip,.xls,.doc"
            disabled={isSubmitting}
          />
          <p className="mt-1 text-sm text-gray-500">
            Maximum file size: 5 MB <br />
            Allowed: jpeg, jpg, png, gif, bmp, pdf, zip, xls, doc
          </p>
          {file && (
            <p className="mt-1 text-sm text-green-600">Selected: {file.name}</p>
          )}
        </div>

        {/* Deadline */}
        <input
          type="date"
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          disabled={isSubmitting}
        />

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
              isSubmitting ? "bg-red-400" : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {isSubmitting ? "Sending..." : isBulk ? "Send to All" : "Send Assignment"}
          </button>
        </div>
      </div>
    </div>
  );
}
