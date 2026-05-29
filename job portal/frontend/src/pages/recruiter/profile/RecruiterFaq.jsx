import React, { useState, useEffect } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { faqApi } from "../../../api/faqApi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useUploadImageApi from "../../../hooks/useUploadImageApi";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const categories = [
  "Getting Started",
  "Account",
  "Opportunities Posted",
  "Application Received",
  "Candidates Selected",
  "Payment & Refunds",
  "Need Assistance",
];

const FAQSection = () => {
  const [faqs, setFaqs] = useState([]);
  const [openIndexes, setOpenIndexes] = useState([]);
  const [activeCategory, setActiveCategory] = useState("Account");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // NEED ASSISTANCE STATES
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachment, setAttachment] = useState("");
  const [sending, setSending] = useState(false);

  const { uploadImage } = useUploadImageApi();

  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const toggleFAQ = (index) => {
    if (openIndexes.includes(index)) {
      setOpenIndexes(openIndexes.filter((i) => i !== index));
    } else {
      setOpenIndexes([...openIndexes, index]);
    }
  };

  // FETCH FAQ
  useEffect(() => {
    const fetchFaqs = async () => {
      if (!token) {
        setErrorMsg("Authentication required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await faqApi.getFaqsByRole(user.user_role, token);

        if (response.data?.data) {
          setFaqs(response.data.data);
        } else {
          setFaqs([]);
        }
      } catch (error) {
        setErrorMsg("Failed to load FAQs");
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, [token]);

  // FILE UPLOAD
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const url = await uploadImage(file, "needAssistance");
      setAttachment(url);
    } catch (err) {
      console.error("Upload failed", err);
      alert("File upload failed");
    }
  };

  // SUBMIT TICKET
  const handleSubmitTicket = async () => {
    if (!subject || !message) {
      alert("Subject and message are required");
      return;
    }

    try {
      setSending(true);

      const payload = {
        user_id: user?.id,
        subject,
        message,
        attachment,
      };

      const res = await axios.post(
        `${BASE_URL}/need-assistance`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("Ticket created successfully");

      setSubject("");
      setMessage("");
      setAttachment("");

    } catch (error) {
      console.error(error);
      alert("Failed to create ticket");
    } finally {
      setSending(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-100 py-6">
        <div className="max-w-6xl mx-auto flex">

          {/* LEFT SIDEBAR */}
          <div className="w-[220px] pr-6 border-r border-gray-200">
            {categories.map((cat, index) => (
              <div
                key={index}
                onClick={() => setActiveCategory(cat)}
                className={`cursor-pointer py-3 text-sm font-medium transition-all
                  ${activeCategory === cat
                    ? "text-blue-600 border-l-2 border-blue-600 pl-3"
                    : "text-gray-600 pl-4 hover:text-blue-500"
                  }`}
              >
                {cat}
              </div>
            ))}
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1 px-8 flex justify-center">

            {/* NEED ASSISTANCE FORM */}
            {activeCategory === "Need Assistance" ? (
              <div className="bg-white p-6 rounded-lg shadow-sm w-full max-w-2xl">

                <h2 className="text-lg font-semibold mb-4">
                  Hi {user?.first_name || "User"}, submit your query below
                </h2>

                {/* SUBJECT */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">
                    Subject
                  </label>

                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full border rounded-md p-2 text-sm"
                  >
                    <option value="">Choose subject</option>
                    <option value="Account Issue">Account Issue</option>
                    <option value="Payment Issue">Payment Issue</option>
                    <option value="Bug Report">Bug Report</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* MESSAGE */}
                <div className="mb-2">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please type your query here"
                    className="w-full border rounded-md p-3 h-40 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                {/* FILE UPLOAD */}
                <div className="mb-4">
                  <label className="text-blue-500 text-sm cursor-pointer flex items-center gap-2">
                    📎 Add attachment
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>

                  {attachment && (
                    <p className="text-xs text-green-600 mt-1">
                      File uploaded successfully
                    </p>
                  )}
                </div>

                {/* SEND BUTTON */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitTicket}
                    disabled={sending}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
                  >
                    {sending ? "Sending..." : "Send"}
                  </button>
                </div>

                {/* FOOTER */}
                <div className="mt-6 text-sm text-gray-500">
                  <p>We will get back to you within 48 hours.</p>
                  <p>Email: hello@scilienttech.com</p>
                    <p>Working hours: 10 AM - 6 PM</p>
                  {/* <div className="mt-3">
                    <p>Email: hello@scilienttech.com</p>
                    <p>Working hours: 10 AM - 6 PM</p>
                  </div> */}
                </div>
              </div>
            ) : loading ? (
              <p className="text-gray-500 text-center mt-10">
                Loading FAQs...
              </p>
            ) : errorMsg ? (
              <p className="text-red-500 text-center mt-10">{errorMsg}</p>
            ) : faqs.length === 0 ? (
              <p className="text-gray-500 text-center mt-10">
                No FAQs found
              </p>
            ) : (
              <div className="w-full max-w-3xl">
                {faqs.map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 py-5">
                    <div
                      onClick={() => toggleFAQ(index)}
                      className="flex justify-between items-center cursor-pointer"
                    >
                      <p className="text-gray-800 text-[15px] font-medium">
                        Q. {faq.question}
                      </p>

                      <span className="text-blue-500 text-2xl font-light">
                        {openIndexes.includes(index) ? "−" : "+"}
                      </span>
                    </div>

                    {openIndexes.includes(index) && (
                      <div className="mt-3 text-gray-600 text-sm">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default FAQSection;