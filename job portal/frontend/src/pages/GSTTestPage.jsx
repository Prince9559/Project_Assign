// src/pages/GSTTestPage.jsx
import React, { useState } from "react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const GSTTestPage = () => {
  const [sessionId, setSessionId] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [GSTIN, setGSTIN] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const handleGetCaptcha = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/gst/captcha`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch CAPTCHA");

      setSessionId(data.sessionId);
      setCaptchaImage(data.image);
    } catch (err) {
      setError(`CAPTCHA Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGetGSTDetails = async () => {
    if (!GSTIN.trim() || !captchaText.trim()) {
      setError("Please enter both GSTIN and CAPTCHA");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/gst/details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          GSTIN: GSTIN.trim().toUpperCase(),
          captcha: captchaText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid CAPTCHA or GSTIN");
      }

      setResult(data);
    } catch (err) {
      setError(`Request Failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "600px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >



{/* <ChatExample
        recipientId={190}
        recipientType="COMPANY"
        jobApplicationId={28}
      /> */}


       <h2>GST Taxpayer Details Checker</h2>
      <p>Fetch real GST details from the official portal (with CAPTCHA).</p>

      {!captchaImage ? (
        <button
          onClick={handleGetCaptcha}
          disabled={loading}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Loading CAPTCHA..." : "Get CAPTCHA"}
        </button>
      ) : (
        <div>
          <img
            src={captchaImage}
            alt="GST CAPTCHA"
            style={{
              border: "1px solid #ccc",
              padding: "6px",
              borderRadius: "4px",
              marginTop: "16px",
            }}
          />
          <br />
          <input
            type="text"
            placeholder="Enter GSTIN (e.g. 27AAECC8852H1Z5)"
            value={GSTIN}
            onChange={(e) => setGSTIN(e.target.value)}
            maxLength={15}
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "12px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          <br />
          <input
            type="text"
            placeholder="Enter CAPTCHA text"
            value={captchaText}
            onChange={(e) => setCaptchaText(e.target.value)}
            maxLength={6}
            style={{
              width: "150px",
              padding: "10px",
              marginTop: "12px",
              fontSize: "16px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
          <br />
          <button
            onClick={handleGetGSTDetails}
            disabled={loading}
            style={{
              marginTop: "16px",
              padding: "10px 20px",
              fontSize: "16px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Fetching Details..." : "Get GST Details"}
          </button>
        </div>
      )}

      {error && (
        <div
          style={{
            color: "red",
            marginTop: "16px",
            padding: "10px",
            backgroundColor: "#ffe6e6",
            borderRadius: "4px",
          }}
        >
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: "24px" }}>
          <h3>Result:</h3>
          <pre
            style={{
              backgroundColor: "#f8f9fa",
              padding: "16px",
              borderRadius: "4px",
              overflowX: "auto",
              fontSize: "14px",
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )} 
    </div>
  );
};

export default GSTTestPage;
