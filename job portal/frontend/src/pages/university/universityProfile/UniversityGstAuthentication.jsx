import React, { useState, useEffect } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaPhoneAlt, FaCheckCircle } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { Input, Button, Label } from "../../../components/ui";
import { useSelector, useDispatch } from "react-redux";
import { Loader2 } from "lucide-react";
import { updateUser } from "../../../redux/feature/authSlice";
import { universityApi } from "../../../api/university/universityApi";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const UniversityGstAuthentication = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  // Email state
  const [email, setEmail] = useState(user?.email || "");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailTimer, setEmailTimer] = useState(60);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailVerified, setEmailVerified] = useState(() => Boolean(user?.is_email_verified));

  // Phone state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneSent, setPhoneSent] = useState(false);
  const [phoneTimer, setPhoneTimer] = useState(60);
  const [phoneSending, setPhoneSending] = useState(false);
  const [phoneVerifying, setPhoneVerifying] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(() => Boolean(user?.is_phone_verified));

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token || !user?.id) return;
      try {
        const p = await universityApi.getUniversityDetailsById(user.id, token);
        if (cancelled) return;
        // `universityApi` returns the axios body (which wraps the real object as `data`)
        const payload = p?.data || p || {};
        setEmailVerified(!!payload?.email_id_verified);
        setPhoneVerified(!!payload?.phone_verified);
        if (payload?.User?.email) setEmail(payload.User.email);
        if (payload?.User?.phone || payload?.phone) {
          const digits = String(payload?.User?.phone || payload?.phone).replace(/\D/g, "");
          setPhoneNumber(digits.length > 10 ? digits.slice(-10) : digits);
        }
        dispatch(
          updateUser({
            is_email_verified: !!payload?.email_id_verified,
            is_phone_verified: !!payload?.phone_verified,
          })
        );
      } catch (e) {
        console.warn("[UniversityAuthentication] hydrate failed:", e?.message || e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, user?.id, dispatch]);

  useEffect(() => {
    if (emailSent && emailTimer > 0) {
      const interval = setInterval(() => setEmailTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [emailSent, emailTimer]);

  useEffect(() => {
    if (phoneSent && phoneTimer > 0) {
      const interval = setInterval(() => setPhoneTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [phoneSent, phoneTimer]);

  const flashSuccess = (msg) => {
    setSuccessMessage(msg);
    setError("");
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Email handlers
  const handleSendEmailOtp = async () => {
    if (emailVerified) return;
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setEmailLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/otp/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || data.error || "Failed to send OTP");
      setEmailSent(true);
      setEmailTimer(60);
      flashSuccess(data.message || "Email OTP sent.");
    } catch (err) {
      console.error("[University Email OTP] Send failed:", err);
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (emailVerified) return;
    if (!emailOtp.trim() || emailOtp.length !== 4) {
      setError("Please enter a valid 4-digit OTP.");
      return;
    }
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/otp/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: emailOtp.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || data.error || "Invalid OTP");
      setEmailVerified(true);
      setEmailSent(false);
      setEmailOtp("");
      dispatch(updateUser({ is_email_verified: true }));
      flashSuccess(data.message || "Email verified successfully!");
    } catch (err) {
      console.error("[University Email OTP] Verify failed:", err);
      setError(err.message || "Verification failed. Please try again.");
    }
  };

  // Phone handlers
  const handleSendPhoneOtp = async () => {
    if (phoneVerified) return;
    if (!phoneNumber.trim() || phoneNumber.trim().length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!token) {
      setError("You must be logged in to verify your phone.");
      return;
    }
    setError("");
    setPhoneSending(true);
    try {
      const res = await fetch(`${BASE_URL}/mobileotp/sendotp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phoneNumber: phoneNumber.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || data.error || "Failed to send OTP");
      setPhoneSent(true);
      setPhoneTimer(60);
      flashSuccess(data.message || "OTP sent. If SMS is not configured, check server logs for the code.");
    } catch (err) {
      console.error("[University Phone OTP] Send failed:", err);
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setPhoneSending(false);
    }
  };

  const handleVerifyPhone = async () => {
    if (phoneVerified) return;
    if (!token) {
      setError("You must be logged in to verify your phone.");
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.trim().length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!phoneOtp.trim() || phoneOtp.length !== 4) {
      setError("Please enter a valid 4-digit OTP.");
      return;
    }
    setError("");
    setPhoneVerifying(true);
    try {
      const res = await fetch(`${BASE_URL}/mobileotp/verifyotp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phoneNumber: phoneNumber.trim(), otp: String(phoneOtp.trim()) }),
      });
      const data = await res.json().catch(() => ({}));
      console.log('[University Phone OTP] verify response:', data);
      if (!res.ok) throw new Error(data.message || data.error || "Verification failed");
      setPhoneVerified(true);
      setPhoneSent(false);
      setPhoneOtp("");
      dispatch(updateUser({ is_phone_verified: true }));
      // Notify other pages (public profile) to refetch profile/completion
      try {
        window.dispatchEvent(new Event('profileVerificationChanged'));
      } catch (e) {
        /* ignore */
      }
      flashSuccess(data.message || "Phone verified successfully!");
    } catch (err) {
      console.error("[University Phone OTP] Verify failed:", err);
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setPhoneVerifying(false);
    }
  };

  const inputCls = "w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9bc87c] focus:border-transparent transition";

  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <section className="w-full px-4 py-6 mx-auto max-w-7xl">

          {successMessage && (
            <div className="mb-4 px-4 py-3 rounded-xl border border-[#9bc87c] bg-[#e6f4dc] text-[#3f5a26] text-sm font-semibold text-center shadow-sm" role="status">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm font-semibold text-center shadow-sm" role="alert">
              {error}
            </div>
          )}

          <div className="w-full mx-auto bg-white rounded-2xl shadow-sm border border-gray-100">

            {/* Header */}
            <div className="flex flex-col items-center p-6 bg-gradient-to-b from-white to-gray-50 border-b border-gray-200 rounded-t-2xl">
              <div className="flex items-center self-start w-full gap-3 mb-2">
                <button type="button" onClick={() => navigate(-1)} className="p-2 transition-colors rounded-full hover:bg-gray-100" title="Go back">
                  <IoIosArrowBack className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-xl font-extrabold text-[#1e1e2d] sm:text-2xl">Account Verification</h1>
              </div>
              <p className="self-start ml-12 text-sm text-gray-500">Verify your email and phone to complete your university profile.</p>
            </div>

            <div className="p-4 sm:p-6 space-y-4">

              {/* EMAIL VERIFICATION */}
              <div className="overflow-hidden bg-white shadow-sm rounded-xl border border-gray-100 transition-all">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#e6f4dc]"><FaEnvelope className="text-[#5a7d3d]" size={14} /></div>
                    <h3 className="text-lg font-extrabold text-[#1e1e2d]">Email Verification</h3>
                  </div>
                  {emailVerified && (<span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-[#e6f4dc] text-[#1DB32F] border border-[#9bc87c]"><FaCheckCircle size={12} /> Verified</span>)}
                </div>

                <div className="p-4 bg-gray-50/30">
                  <Label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1.5">Email Address</Label>
                  <div className="flex flex-col gap-2 mb-3 sm:flex-row">
                    <div className="flex-1">
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" disabled={emailSent || emailVerified} className={inputCls} />
                    </div>
                    <Button type="button" variant="secondary" size="small" className="px-5 h-10 text-white !bg-[#9bc87c] hover:!bg-[#8ab76b] disabled:!bg-gray-300 font-bold rounded-lg transition" onClick={handleSendEmailOtp} disabled={emailLoading || emailSent || emailVerified || !email.trim()}>
                      {emailLoading ? (<span className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</span>) : emailSent ? "Sent!" : "Send OTP"}
                    </Button>
                  </div>

                  {emailSent && !emailVerified && (
                    <div className="pt-3 mt-3 border-t border-gray-200">
                      <Label htmlFor="emailOtp" className="block text-sm font-bold text-gray-700 mb-1.5">Enter OTP</Label>
                      <Input id="emailOtp" value={emailOtp} onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))} placeholder="4-Digit Code" maxLength={4} className={`${inputCls} mb-3 tracking-widest text-center font-mono`} />
                      <Button type="button" variant="primary" size="default" className="w-full mb-2 !bg-[#9bc87c] hover:!bg-[#8ab76b] !text-white font-bold rounded-lg" onClick={handleVerifyEmail} disabled={!emailOtp.trim() || emailOtp.length !== 4}>Verify Email</Button>
                      <p className="text-xs text-center text-gray-500">{emailTimer > 0 ? (<span>Resend code in <span className="font-bold text-[#5a7d3d]">{emailTimer}s</span></span>) : (<button type="button" className="font-bold text-[#9bc87c] hover:text-[#8ab76b] hover:underline" onClick={() => { handleSendEmailOtp(); setEmailTimer(60); }}>Resend OTP</button>)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* PHONE VERIFICATION */}
              <div className="overflow-hidden bg-white shadow-sm rounded-xl border border-gray-100 transition-all">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#e6f4dc]"><FaPhoneAlt className="text-[#5a7d3d]" size={14} /></div>
                    <h3 className="text-lg font-extrabold text-[#1e1e2d]">Phone Verification</h3>
                  </div>
                  {phoneVerified && (<span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-[#e6f4dc] text-[#1DB32F] border border-[#9bc87c]"><FaCheckCircle size={12} /> Verified</span>)}
                </div>

                <div className="p-4 bg-gray-50/30">
                  <Label htmlFor="phoneNumber" className="block text-sm font-bold text-gray-700 mb-1.5">Phone Number</Label>
                  <div className="flex flex-col gap-2 mb-3 sm:flex-row">
                    <div className="flex-1">
                      <Input id="phoneNumber" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))} placeholder="+91 XXXXXXXXXX" maxLength={10} disabled={phoneSent || phoneVerified} className={inputCls} />
                    </div>
                    <Button type="button" variant="secondary" size="small" className="px-5 h-10 text-white !bg-[#9bc87c] hover:!bg-[#8ab76b] disabled:!bg-gray-300 font-bold rounded-lg transition" onClick={handleSendPhoneOtp} disabled={phoneSending || phoneSent || phoneVerified || !phoneNumber.trim()}>
                      {phoneSending ? (<span className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</span>) : phoneVerified ? "Verified" : phoneSent ? "Sent!" : "Send OTP"}
                    </Button>
                  </div>

                  {phoneSent && !phoneVerified && (
                    <div className="pt-3 mt-3 border-t border-gray-200">
                      <Label htmlFor="phoneOtp" className="block text-sm font-bold text-gray-700 mb-1.5">Enter OTP</Label>
                      <Input id="phoneOtp" value={phoneOtp} onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ""))} placeholder="4-Digit Code" maxLength={4} className={`${inputCls} mb-3 tracking-widest text-center font-mono`} />
                      <Button type="button" variant="primary" size="default" className="w-full mb-2 !bg-[#9bc87c] hover:!bg-[#8ab76b] !text-white font-bold rounded-lg" onClick={handleVerifyPhone} disabled={phoneVerifying || !phoneOtp.trim() || phoneOtp.length !== 4}>Verify Phone Number</Button>
                      <p className="text-xs text-center text-gray-500">{phoneTimer > 0 ? (<span>Resend code in <span className="font-bold text-[#5a7d3d]">{phoneTimer}s</span></span>) : (<button type="button" className="font-bold text-[#9bc87c] hover:text-[#8ab76b] hover:underline" onClick={() => { handleSendPhoneOtp(); setPhoneTimer(60); }}>Resend OTP</button>)}</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default UniversityGstAuthentication;
