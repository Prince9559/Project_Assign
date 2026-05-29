// src/components/assignments/AssignmentForm.jsx
import React, { useState } from "react";
import { useSelector } from "react-redux";
import useUploadImageApi from "../../hooks/useUploadImageApi";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export default function AssignmentForm({
  applicationId,
  applicantName,
  onSuccess,
  onCancel
}) {
  const [message, setMessage] = useState("Thank you for your interest...");
  const [file, setFile] = useState(null);
  const [deadline, setDeadline] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token } = useSelector((state) => state.auth);
  const { uploadImage } = useUploadImageApi();

  const handleFileChange = (e) => { /* same as before */ };
  const uploadAssignmentFile = async (file) => { /* same */ };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ... validation ...

    try {
      setIsSubmitting(true);
      const fileUrl = await uploadAssignmentFile(file);

      // NEW: Call the new endpoint that sends assignment + posts to chat
      const response = await axios.post(
        `${BASE_URL}/chat/send-assignment`,
        {
          application_id: applicationId,
          message,
          deadline,
          assignment_url: fileUrl,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onSuccess?.(response.data);
      setMessage("");
      setDeadline("");
      setFile(null);
    } catch (error) {
      // ... handle error ...
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="...">
      {/* Same JSX as SendAssignment form, but without MainLayout */}
      {/* Replace "applicant.name" with {applicantName} */}
    </form>
  );
}