// src/components/interview/InterviewForm.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";

const InterviewForm = ({
  // Single mode
  applicationId,
  applicantName,

  // Bulk mode
  applicationIds = [],
  applicantNames = [],

  bulk = false,
  onSuccess,
  onCancel,
}) => {
  const isBulk = bulk && applicationIds.length > 0;


  const [isMessageEditedByUser, setIsMessageEditedByUser] = useState(false);

  // Add new state for recruiter phone & office address (from profile)
  const [recruiterData, setRecruiterData] = useState({
    phone: "9999999999",
    office_address: "",
  });

  const [formData, setFormData] = useState(() => {
    const now = new Date();
    now.setDate(now.getDate() + 2); // default to day after tomorrow
    const defaultDate = now.toISOString().split("T")[0];
    return {
      interview_type: "In-office",
      date: defaultDate,
      start_time: "11:00",
      end_time: "11:30",
      video_link: "",
      phone_number: "+91-9999111122",
      office_address: "123 Main Street, City, State",
      message: "", // will be set by useEffect
    };
  });

  const initialMessage = useCallback(() => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    const date = formData.date
      ? new Date(formData.date).toLocaleDateString("en-IN", options)
      : "[Date]";

    const time = formData.start_time && formData.end_time
      ? `${formData.start_time} – ${formData.end_time}`
      : "[Time]";

    let locationInfo = "";
    if (formData.interview_type === "Video call") {
      locationInfo = formData.video_link?.trim()
        ? `📍 Video Interview: ${formData.video_link}`
        : `📍 Video Interview link will be shared shortly.`;
    } else if (formData.interview_type === "Phone") {
      const phone = formData.phone_number?.trim() || recruiterData.phone;
      locationInfo = `📞 Phone Interview: We will call you from ${phone}. Please ensure you’re available and in a quiet place.`;
    } else if (formData.interview_type === "In-office") {
      const addr = formData.office_address?.trim() || recruiterData.office_address;
      locationInfo = addr
        ? `🏢 In-Office Interview: ${addr}`
        : `🏢 In-Office Interview: Location details to be confirmed.`;
    }

    const salutation = isBulk
      ? "Dear Candidates,"
      : `Dear ${applicantName || "Candidate"},`;

    return `${salutation}

We’re pleased to invite you for an interview on ${date} from ${time}.

${locationInfo}

 Kindly confirm your availability .

For any queries, feel free to reach us at ${recruiterData.phone}.

We look forward to speaking with you!

Best regards,  
Recruitment Team`;
  }, [
    formData.interview_type,
    formData.date,
    formData.start_time,
    formData.end_time,
    formData.video_link,
    formData.phone_number,
    formData.office_address,
    isBulk,
    applicantName,
    recruiterData.phone,
    recruiterData.office_address,
  ]);


  // Replace both old message-update useEffects with this one:
  useEffect(() => {
    if (!isMessageEditedByUser) {
      const newMessage = initialMessage();
      setFormData((prev) =>
        prev.message !== newMessage ? { ...prev, message: newMessage } : prev
      );
    }
  }, [
    formData.interview_type,
    formData.date,
    formData.start_time,
    formData.end_time,
    formData.video_link,
    formData.phone_number,
    formData.office_address,
    applicantName,
    isBulk,
    recruiterData.phone,
    recruiterData.office_address,
    isMessageEditedByUser,
    initialMessage, // safe to include since it’s memoized
  ]);

  // Fetch recruiter profile on mount (or get from Redux if already available)
  // useEffect(() => {
  //   const fetchRecruiterProfile = async () => {
  //     try {
  //       const res = await fetch(`${BASE_URL}/company-recruiter/profile`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
  //       if (res.ok) {
  //         const data = await res.json();
  //         setRecruiterData({
  //           phone: data.phone_contact || "+91-9999112233",
  //           office_address: data.office_address || "123 Main Street, City, State",
  //         });
  //       }
  //     } catch (err) {
  //       console.warn("Could not fetch recruiter profile:", err);
  //       setRecruiterData({
  //         phone:  "+91-9999111122",
  //         office_address:  "123 Main Street, City, State",
  //       });
  //     }
  //   };
  //   fetchRecruiterProfile();
  // }, [token, BASE_URL]);

  // Update initial message to be dynamic
  // Replace initialMessage function with:
  

  // Auto-update message when key fields change
  useEffect(() => {
    const msg = initialMessage();
    if (formData.message === initialMessage()) {
      // Only update if user hasn’t manually edited message
      setFormData((prev) => ({ ...prev, message: msg }));
    }
  }, [
    formData.interview_type,
    formData.date,
    formData.start_time,
    formData.end_time,
    formData.video_link,
    formData.phone_number,
    formData.office_address,
    isBulk,
    applicantName,
    recruiterData.phone,
    recruiterData.office_address,
  ]);

  //  Add this useEffect (after initialMessage useCallback)
  useEffect(() => {
    const msg = initialMessage();
    setFormData(prev => prev.message === initialMessage()
      ? { ...prev, message: msg }
      : prev
    );
  }, [initialMessage]);




  const [loading, setLoading] = useState(false);
  const [showFullList, setShowFullList] = useState(false);

  const { token } = useSelector((state) => state.auth);
  const BASE_URL = import.meta.env.VITE_BASE_URL;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "message") {
      setIsMessageEditedByUser(true);
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Do NOT auto-update message if user has edited it
      return updated;
    });
  };

  const handleInterviewType = (type) => {
    setFormData({ ...formData, interview_type: type });
  };

  const validate = () => {
    const { interview_type, date, start_time, end_time, video_link, phone_number, office_address } = formData;

    if (!date || !start_time || !end_time) return false;

    const start = new Date(`${date}T${start_time}`);
    const end = new Date(`${date}T${end_time}`);
    if (end <= start || start <= new Date()) return false;

    // Type-specific validation
    if (interview_type === "Video call" && !video_link.trim()) return false;
    if (interview_type === "Phone" && !phone_number?.trim()) return false;
    if (interview_type === "In-office" && !office_address?.trim()) return false;

    return true;
  };

  const sendSingleInterview = async (appId) => {
    const payload = {
      application_id: appId,
      message: formData.message,
      interview_type: formData.interview_type,
      interview_date: formData.date,
      start_time: formData.start_time,
      end_time: formData.end_time,
      ...(formData.interview_type === "Video call" && { video_link: formData.video_link }),
      ...(formData.interview_type === "Phone" && { phone_number: formData.phone_number }),
      ...(formData.interview_type === "In-office" && { office_address: formData.office_address }),
    };

    const res = await fetch(`${BASE_URL}/chat/send-interview`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to schedule");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      alert("Please select a valid future date and time (end after start).");
      return;
    }

    setLoading(true);
    const ids = isBulk ? applicationIds : [applicationId];
    const failed = [];
    const successes = [];

    for (const id of ids) {
      try {
        await sendSingleInterview(id);
        successes.push(id);
      } catch (err) {
        console.error(`Failed to schedule for ${id}:`, err);
        failed.push(id);
      }
    }

    if (failed.length > 0) {
      alert(
        `Interview scheduled for ${successes.length} candidate(s).\nFailed for ${failed.length} candidate(s).`
      );
    } else {
      alert(`Interview scheduled successfully for ${ids.length} candidate(s)!`);
    }

    onSuccess?.({ successes, failed });
    setLoading(false);
  };



  const getToPreview = () => {
    if (!isBulk) return applicantName || "Candidate";

    const visible = applicantNames.slice(0, 2);
    const others = applicantNames.length - 2;
    if (others <= 0) return visible.join(", ");
    return `${visible.join(", ")} + ${others} others`;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto p-4"
    >
      {/* To */}
      <div>
        <p className="text-sm text-gray-600">To:</p>
        <div className="mt-1">
          {!showFullList ? (
            <button
              type="button"
              onClick={() => setShowFullList(true)}
              className="px-3 py-1 text-sm text-blue-800 bg-blue-100 rounded-md hover:underline"
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
        name="message"
        value={formData.message}
        onChange={handleChange}
        rows="4"
        placeholder="Hi Candidate,\n\nWe invite you for an interview on [Date] from [Time].\n\n[Location details will appear here based on interview type]\n\nPlease confirm your availability..."
        className="w-full p-3 text-sm border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={loading}
        style={{ minHeight: '6rem' }}
      />

      {/* Interview Type */}
      <div>
        <p className="mb-2 text-sm text-gray-600">Interview type</p>
        {["Video call", "Phone", "In-office"].map((type) => (
          <label
            key={type}
            className={`flex items-center gap-2 px-3 py-2 mb-2 rounded-lg border cursor-pointer ${formData.interview_type === type
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300"
              }`}
          >
            <input
              type="radio"
              checked={formData.interview_type === type}
              onChange={() => handleInterviewType(type)}
              className="hidden"
            />
            <span>{type}</span>
          </label>
        ))}
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="mb-1 text-sm text-gray-600">Date</p>
          {/* Date input */}
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            min={new Date().toISOString().split("T")[0]} // prevents past dates
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="mb-1 text-sm text-gray-600">Start</p>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              disabled={loading}
            />
          </div>
          <div>
            <p className="mb-1 text-sm text-gray-600">End</p>
            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              disabled={loading}
            />
          </div>
        </div>
      </div>

      {/* Conditional Details */}
      {formData.interview_type === "Video call" && (
        <div>
          <p className="mb-1 text-sm text-gray-600">
            Video call link <span className="text-red-500">*</span>
          </p>
          <input
            type="url"
            name="video_link"
            value={formData.video_link}
            onChange={handleChange}
            placeholder="e.g. https://meet.google.com/abc-defg-hij"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
      )}

      {formData.interview_type === "Phone" && (
        <div>
          <p className="mb-1 text-sm text-gray-600">
            Phone number to call from <span className="text-red-500">*</span>
          </p>
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            placeholder="+91-XXXXXXXXXX"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
      )}

      {formData.interview_type === "In-office" && (
        <div>
          <p className="mb-1 text-sm text-gray-600">
            Office address <span className="text-red-500">*</span>
          </p>
          <textarea
            name="office_address"
            value={formData.office_address}
            onChange={handleChange}
            rows="2"
            placeholder="e.g. 123 Tech Park, Sector 5, Gurugram, Haryana"
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-100"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading
            ? "Scheduling..."
            : isBulk
              ? "Schedule for All"
              : "Schedule Interview"}
        </button>
      </div>
    </form>
  );
};

export default InterviewForm;