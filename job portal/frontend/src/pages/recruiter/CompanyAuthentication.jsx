// // src/pages/CompanyAuthentication.jsx
// import React, { useState, useEffect } from "react";
// import { Button, Input, Label } from "../../components/ui";
// import MainLayout from "../../components/layout/MainLayout";
// import RecruiterRightSidebarWithJobPost from "../recruiter/profile/RecruiterRightSidebarWithJobPost";
// import RecruiterRightSidebar from "../recruiter/dashboard/RecruiterRightSidebar";


// const BASE_URL = import.meta.env.VITE_BASE_URL;


// const CompanyAuthentication = () => {
//   // Phone verification state
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [phoneOtp, setPhoneOtp] = useState("");

//   // GST verification state
//   const [gstNumber, setGstNumber] = useState("");
//   const [captchaText, setCaptchaText] = useState("");
//   const [captchaImage, setCaptchaImage] = useState("");
//   const [sessionId, setSessionId] = useState("");
//   const [loadingCaptcha, setLoadingCaptcha] = useState(false);
//   const [verifying, setVerifying] = useState(false);
//   const [gstDetails, setGstDetails] = useState(null);
//   const [error, setError] = useState("");

//   // Fetch CAPTCHA only when user starts typing GSTIN
//   useEffect(() => {
//     if (gstNumber.trim().length > 0 && !captchaImage) {
//       fetchCaptcha();
//     }
//   }, [gstNumber]);

//   const fetchCaptcha = async () => {
//     setLoadingCaptcha(true);
//     setError("");
//     try {
//       const res = await fetch(`${BASE_URL}/gst/captcha`);
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Failed to load CAPTCHA");
//       setCaptchaImage(data.image);
//       setSessionId(data.sessionId);
//       setCaptchaText(""); // reset CAPTCHA input
//     } catch (err) {
//       setError("Unable to load CAPTCHA. Please try again.");
//       console.error("CAPTCHA Error:", err);
//     } finally {
//       setLoadingCaptcha(false);
//     }
//   };

//   const handleVerifyGST = async () => {
//     if (!gstNumber.trim() || !captchaText.trim()) {
//       setError("Please enter GST number and CAPTCHA.");
//       return;
//     }

//     setVerifying(true);
//     setError("");
//     try {
//       const res = await fetch(`${BASE_URL}/gst/details`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           sessionId,
//           GSTIN: gstNumber.trim().toUpperCase(),
//           captcha: captchaText.trim(),
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         throw new Error(data.error || data.message || "Invalid CAPTCHA or GSTIN");
//       }

//       // Success: store and show details
//       setGstDetails(data);
//       setError("");
//     } catch (err) {
//       setError(err.message || "Verification failed. Please try again.");
//       // Refresh CAPTCHA on error
//       fetchCaptcha();
//     } finally {
//       setVerifying(false);
//     }
//   };

//   const refreshCaptcha = () => {
//     if (gstNumber.trim()) {
//       fetchCaptcha();
//     }
//   };

//   // Format address from GST response
//   const formatAddress = (addr) => {
//     if (!addr) return "—";
//     const parts = [
//       addr.addr_bno,
//       addr.addr_bname,
//       addr.addr_flno,
//       addr.addr_st,
//       addr.addr_loc,
//       addr.addr_district,
//       addr.addr_state,
//       addr.addr_pncd,
//     ].filter(Boolean);
//     return parts.join(", ");
//   };

//   return (
//     <MainLayout>
//       <div className="flex items-start justify-center min-h-screen px-2 bg-gray-100 lg:px-8">
//         {/* Left Spacer */}
//         <div className="flex-grow hidden lg:block"></div>

//         <section className="bg-white rounded-[10px] p-5 shadow-lg mt-2 w-full max-h-screen overflow-y-auto opacity-100 gap-[10px]">
//           {/* Phone Number Verification */}
//           <h1 className="mb-6 text-2xl font-bold text-black">Authentication</h1>
//           <div className="p-4 mb-6 border border-orange-200 rounded-lg bg-orange-50">
//             <div className="flex items-center gap-2 mb-3">
//               <Label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-700">
//                 Phone Number
//               </Label>
//             </div>
//             <div className="flex gap-2 mb-3">
//               <div className="flex-1">
//                 <Input
//                   id="phoneNumber"
//                   value={phoneNumber}
//                   onChange={(e) => setPhoneNumber(e.target.value)}
//                   placeholder="+91 XXXXXXXXXX"
//                 />
//               </div>
//               <Button
//                 variant="secondary"
//                 size="small"
//                 className="px-4 text-white bg-orange-500 h-9 hover:bg-orange-600"
//               >
//                 Send OTP
//               </Button>
//             </div>

//             <div className="mb-3">
//               <Label htmlFor="phoneOtp" className="text-sm font-semibold text-gray-700">
//                 OTP
//               </Label>
//               <Input
//                 id="phoneOtp"
//                 value={phoneOtp}
//                 onChange={(e) => setPhoneOtp(e.target.value)}
//                 placeholder="6 Digit Number"
//                 maxLength={6}
//               />
//             </div>

//             <Button variant="danger" size="default" className="w-full mb-2">
//               Verify Phone number
//             </Button>
//             <p className="text-xs text-center text-gray-600">Resend code in 60 seconds</p>
//           </div>

//           {/* GST Authentication */}
//           <h1 className="mb-6 text-2xl font-bold text-black">GST Authentication</h1>
//           <div className="p-4 mb-6 border border-orange-200 rounded-lg bg-orange-50">
//             <div className="flex items-center gap-2 mb-3">
//               <Label htmlFor="gstNumber" className="text-sm font-semibold text-gray-700">
//                 GST Number
//               </Label>
//             </div>
//             <div className="flex gap-2 mb-3">
//               <div className="flex-1">
//                 <Input
//                   id="gstNumber"
//                   value={gstNumber}
//                   onChange={(e) => setGstNumber(e.target.value)}
//                   placeholder="Enter GST Number (e.g. 27AAECC8852H1Z5)"
//                   maxLength={15}
//                 />
//               </div>
//               <Button
//                 variant="secondary"
//                 size="small"
//                 className="px-4 text-white bg-orange-500 h-9 hover:bg-orange-600"
//                 onClick={handleVerifyGST}
//                 disabled={verifying || !gstNumber.trim() || !captchaImage}
//               >
//                 {verifying ? "Verifying..." : "Verify"}
//               </Button>
//             </div>

//             {/* CAPTCHA Section (only show when GSTIN is entered) */}
//             {gstNumber.trim() && (
//               <div className="mt-4">
//                 <div className="flex items-center justify-between mb-2">
//                   <Label className="text-sm font-semibold text-gray-700">CAPTCHA</Label>
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="small"
//                     className="text-xs text-blue-600 hover:text-blue-800"
//                     onClick={refreshCaptcha}
//                     disabled={loadingCaptcha}
//                   >
//                     {loadingCaptcha ? "Loading..." : "Refresh CAPTCHA"}
//                   </Button>
//                 </div>

//                 {loadingCaptcha ? (
//                   <div className="flex items-center justify-center h-12 text-gray-500">
//                     Loading CAPTCHA...
//                   </div>
//                 ) : captchaImage ? (
//                   <>
//                     <img
//                       src={captchaImage}
//                       alt="CAPTCHA"
//                       className="mb-2 border rounded max-h-12"
//                     />
//                     <Input
//                       value={captchaText}
//                       onChange={(e) => setCaptchaText(e.target.value)}
//                       placeholder="Enter CAPTCHA text"
//                       className="mb-3"
//                       maxLength={6}
//                     />
//                   </>
//                 ) : null}

//                 {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
//               </div>
//             )}

//             {/* GST Details - Success View */}
//             {gstDetails && (
//               <div className="p-4 mt-6 border border-green-200 rounded-lg bg-green-50">
//                 <div className="flex items-center gap-2 mb-3">
//                   <span className="w-3 h-3 bg-green-500 rounded-full"></span>
//                   <h3 className="text-lg font-bold text-green-800">GST Verified Successfully!</h3>
//                 </div>

//                 <div className="space-y-3 text-sm">
//                   <DetailRow label="Legal Name of Business" value={gstDetails.lgnm || "—"} />
//                   <DetailRow label="Trade Name" value={gstDetails.tradeNam || "—"} />
//                   <DetailRow
//                     label="Effective Date of Registration"
//                     value={gstDetails.rgdt ? new Date(gstDetails.rgdt).toLocaleDateString("en-GB") : "—"}
//                   />
//                   <DetailRow label="Constitution of Business" value={gstDetails.ctb || "—"} />
//                   <DetailRow label="GSTIN / UIN Status" value={gstDetails.sts || "—"} />
//                   <DetailRow label="Taxpayer Type" value={gstDetails.typ || "—"} />
//                   <DetailRow
//                     label="Principal Place of Business"
//                     value={formatAddress(gstDetails.pradr?.adr)}
//                   />
//                 </div>
//               </div>
//             )}
//           </div>
//         </section>

//         {/* Sidebar */}
//         {/* <aside className="hidden lg:block w-full max-w-[350px] p-2 sticky top-4 h-fit ml-4">
//           <RecruiterRightSidebar />
//         </aside> */}

//         <div className="flex-grow hidden lg:block"></div>
//       </div>
//     </MainLayout>
//   );
// };

// // Reusable detail row component
// const DetailRow = ({ label, value }) => (
//   <div>
//     <span className="font-semibold text-gray-700">{label}:</span>{" "}
//     <span className="text-gray-900">{value}</span>
//   </div>
// );

// export default CompanyAuthentication;

































// // src/pages/CompanyAuthentication.jsx
// import React, { useState, useEffect } from "react";
// import { Button, Input, Label } from "../../components/ui";
// import MainLayout from "../../components/layout/MainLayout";
// import RecruiterRightSidebarWithJobPost from "../recruiter/profile/RecruiterRightSidebarWithJobPost";
// import RecruiterRightSidebar from "../recruiter/dashboard/RecruiterRightSidebar";
// import {useSelector} from "react-redux";

// const BASE_URL = import.meta.env.VITE_BASE_URL;

// const CompanyAuthentication = () => {

//   const { user } = useSelector((state) => state.auth);
//   // Phone verification state
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [phoneOtp, setPhoneOtp] = useState("");
//   const [phoneSent, setPhoneSent] = useState(false);
//   const [phoneTimer, setPhoneTimer] = useState(60);

//   // Email verification state
//   const [email, setEmail] = useState(user.email || "");
//   const [emailOtp, setEmailOtp] = useState("");
//   const [emailSent, setEmailSent] = useState(false);
//   const [emailTimer, setEmailTimer] = useState(60);
//   const [emailLoading, setEmailLoading] = useState(false);
//   const [emailVerified, setEmailVerified] = useState(true);

//   // GST verification state
//   const [gstNumber, setGstNumber] = useState("");
//   const [captchaText, setCaptchaText] = useState("");
//   const [captchaImage, setCaptchaImage] = useState("");
//   const [sessionId, setSessionId] = useState("");
//   const [loadingCaptcha, setLoadingCaptcha] = useState(false);
//   const [verifying, setVerifying] = useState(false);
//   const [gstDetails, setGstDetails] = useState(null);
//   const [error, setError] = useState("");

//   // Countdown timer for phone OTP resend
//   useEffect(() => {
//     if (phoneSent && phoneTimer > 0) {
//       const interval = setInterval(() => setPhoneTimer((t) => t - 1), 1000);
//       return () => clearInterval(interval);
//     }
//   }, [phoneSent, phoneTimer]);

//   // Countdown timer for email OTP resend
//   useEffect(() => {
//     if (emailSent && emailTimer > 0) {
//       const interval = setInterval(() => setEmailTimer((t) => t - 1), 1000);
//       return () => clearInterval(interval);
//     }
//   }, [emailSent, emailTimer]);

//   // Fetch CAPTCHA only when user starts typing GSTIN
//   useEffect(() => {
//     if (gstNumber.trim().length > 0 && !captchaImage) {
//       fetchCaptcha();
//     }
//   }, [gstNumber]);

//   // Phone OTP Handlers
//   const handleSendPhoneOtp = async () => {
//     if (!phoneNumber.trim()) {
//       setError("Please enter a valid phone number.");
//       return;
//     }
//     setError("");
//     try {
//       const res = await fetch(`${BASE_URL}/auth/send-phone-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ phone: phoneNumber.trim() }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Failed to send OTP");
//       setPhoneSent(true);
//       setPhoneTimer(60);
//     } catch (err) {
//       setError(err.message || "Failed to send OTP. Please try again.");
//     }
//   };

//   const handleVerifyPhone = async () => {
//     if (!phoneOtp.trim() || phoneOtp.length !== 6) {
//       setError("Please enter a valid 6-digit OTP.");
//       return;
//     }
//     setError("");
//     try {
//       const res = await fetch(`${BASE_URL}/auth/verify-phone`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ phone: phoneNumber.trim(), otp: phoneOtp.trim() }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Invalid OTP");
//       alert("Phone verified successfully!");
//       // Optionally reset or mark as verified
//     } catch (err) {
//       setError(err.message || "Verification failed. Please try again.");
//     }
//   };

//   // Email OTP Handlers
//   const handleSendEmailOtp = async () => {
//     if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
//       setError("Please enter a valid email address.");
//       return;
//     }
//     setError("");
//     setEmailLoading(true);
//     try {
//       const res = await fetch(`${BASE_URL}/otp/send-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email: email.trim().toLowerCase() }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Failed to send OTP");
//       setEmailSent(true);
//       setEmailTimer(60);
//     } catch (err) {
//       setError(err.message || "Failed to send OTP. Please try again.");
//     } finally {
//       setEmailLoading(false);
//     }
//   };

//   const handleVerifyEmail = async () => {
//     if (!emailOtp.trim() || emailOtp.length !== 4) {
//       setError("Please enter a valid 4-digit OTP.");
//       return;
//     }
//     setError("");
//     try {
//       const res = await fetch(`${BASE_URL}/otp/verify-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email: email.trim().toLowerCase(), otp: emailOtp.trim() }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Invalid OTP");
//       setEmailVerified(true);
//       alert("Email verified successfully!");
//     } catch (err) {
//       setError(err.message || "Verification failed. Please try again.");
//     }
//   };

//   const fetchCaptcha = async () => {
//     setLoadingCaptcha(true);
//     setError("");
//     try {
//       const res = await fetch(`${BASE_URL}/gst/captcha`);
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Failed to load CAPTCHA");
//       setCaptchaImage(data.image);
//       setSessionId(data.sessionId);
//       setCaptchaText("");
//     } catch (err) {
//       setError("Unable to load CAPTCHA. Please try again.");
//       console.error("CAPTCHA Error:", err);
//     } finally {
//       setLoadingCaptcha(false);
//     }
//   };

//   const handleVerifyGST = async () => {
//     if (!gstNumber.trim() || !captchaText.trim()) {
//       setError("Please enter GST number and CAPTCHA.");
//       return;
//     }

//     setVerifying(true);
//     setError("");
//     try {
//       const res = await fetch(`${BASE_URL}/gst/details`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           sessionId,
//           GSTIN: gstNumber.trim().toUpperCase(),
//           captcha: captchaText.trim(),
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         throw new Error(data.error || data.message || "Invalid CAPTCHA or GSTIN");
//       }

//       setGstDetails(data);
//       setError("");
//     } catch (err) {
//       setError(err.message || "Verification failed. Please try again.");
//       fetchCaptcha();
//     } finally {
//       setVerifying(false);
//     }
//   };

//   const refreshCaptcha = () => {
//     if (gstNumber.trim()) {
//       fetchCaptcha();
//     }
//   };

//   const formatAddress = (addr) => {
//     if (!addr) return "—";
//     const parts = [
//       addr.addr_bno,
//       addr.addr_bname,
//       addr.addr_flno,
//       addr.addr_st,
//       addr.addr_loc,
//       addr.addr_district,
//       addr.addr_state,
//       addr.addr_pncd,
//     ].filter(Boolean);
//     return parts.join(", ");
//   };

//   return (
//     <MainLayout>
//       <div className="flex items-start justify-center min-h-screen px-2 bg-gray-100 lg:px-8">
//         <div className="flex-grow hidden lg:block"></div>

//         <section className="bg-white rounded-[10px] p-5 shadow-lg mt-2 w-full max-h-screen overflow-y-auto opacity-100 gap-[10px]">

//           {/* Email Verification */}
//           <h1 className="mb-6 text-2xl font-bold text-black">Authentication</h1>

//           <div className="p-4 mb-6 border border-blue-200 rounded-lg bg-blue-50">
//             <div className="flex items-center gap-2 mb-3">
//               <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
//                 Email Address
//               </Label>
//               {emailVerified && (
//                 <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
//                   ✓ Verified
//                 </span>
//               )}
//             </div>

//             <div className="flex gap-2 mb-3">
//               <div className="flex-1">
//                 <Input
//                   id="email"
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="your@email.com"
//                   disabled={emailSent || emailVerified}
//                 />
//               </div>
//               <Button
//                 variant="secondary"
//                 size="small"
//                 className="px-4 text-white bg-blue-500 h-9 hover:bg-blue-600 disabled:bg-gray-300"
//                 onClick={handleSendEmailOtp}
//                 disabled={emailLoading || emailSent || emailVerified || !email.trim()}
//               >
//                 {emailLoading ? "Sending..." : emailSent ? "Sent!" : "Send OTP"}
//               </Button>
//             </div>

//             {emailSent && !emailVerified && (
//               <>
//                 <div className="mb-3">
//                   <Label htmlFor="emailOtp" className="text-sm font-semibold text-gray-700">
//                     OTP
//                   </Label>
//                   <Input
//                     id="emailOtp"
//                     value={emailOtp}
//                     onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
//                     placeholder="6 Digit Number"
//                     maxLength={6}
//                     className="mb-2"
//                   />
//                 </div>

//                 <Button
//                   variant="primary"
//                   size="default"
//                   className="w-full mb-2 bg-blue-600 hover:bg-blue-700"
//                   onClick={handleVerifyEmail}
//                 >
//                   Verify Email
//                 </Button>

//                 <p className="text-xs text-center text-gray-600">
//                   {emailTimer > 0
//                     ? `Resend code in ${emailTimer}s`
//                     : (
//                       <button
//                         type="button"
//                         className="text-blue-600 hover:underline"
//                         onClick={() => { handleSendEmailOtp(); setEmailTimer(60); }}
//                       >
//                         Resend OTP
//                       </button>
//                     )
//                   }
//                 </p>
//               </>
//             )}
//           </div>

//           {/* Phone Number Verification */}
//           <div className="p-4 mb-6 border border-orange-200 rounded-lg bg-orange-50">
//             <div className="flex items-center gap-2 mb-3">
//               <Label htmlFor="phoneNumber" className="text-sm font-semibold text-gray-700">
//                 Phone Number
//               </Label>
//             </div>
//             <div className="flex gap-2 mb-3">
//               <div className="flex-1">
//                 <Input
//                   id="phoneNumber"
//                   value={phoneNumber}
//                   onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
//                   placeholder="+91 XXXXXXXXXX"
//                   maxLength={10}
//                   disabled={phoneSent}
//                 />
//               </div>
//               <Button
//                 variant="secondary"
//                 size="small"
//                 className="px-4 text-white bg-orange-500 h-9 hover:bg-orange-600 disabled:bg-gray-300"
//                 onClick={handleSendPhoneOtp}
//                 disabled={phoneSent || !phoneNumber.trim()}
//               >
//                 Send OTP
//               </Button>
//             </div>

//             {phoneSent && (
//               <>
//                 <div className="mb-3">
//                   <Label htmlFor="phoneOtp" className="text-sm font-semibold text-gray-700">
//                     OTP
//                   </Label>
//                   <Input
//                     id="phoneOtp"
//                     value={phoneOtp}
//                     onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ""))}
//                     placeholder="6 Digit Number"
//                     maxLength={6}
//                   />
//                 </div>

//                 <Button
//                   variant="danger"
//                   size="default"
//                   className="w-full mb-2"
//                   onClick={handleVerifyPhone}
//                 >
//                   Verify Phone Number
//                 </Button>

//                 <p className="text-xs text-center text-gray-600">
//                   {phoneTimer > 0
//                     ? `Resend code in ${phoneTimer}s`
//                     : (
//                       <button
//                         type="button"
//                         className="text-orange-600 hover:underline"
//                         onClick={() => { handleSendPhoneOtp(); setPhoneTimer(60); }}
//                       >
//                         Resend OTP
//                       </button>
//                     )
//                   }
//                 </p>
//               </>
//             )}
//           </div>

//           {/* GST Authentication */}
//           <h2 className="mb-6 text-2xl font-bold text-black">GST Authentication</h2>
//           <div className="p-4 mb-6 border border-orange-200 rounded-lg bg-orange-50">
//             <div className="flex items-center gap-2 mb-3">
//               <Label htmlFor="gstNumber" className="text-sm font-semibold text-gray-700">
//                 GST Number
//               </Label>
//             </div>
//             <div className="flex gap-2 mb-3">
//               <div className="flex-1">
//                 <Input
//                   id="gstNumber"
//                   value={gstNumber}
//                   onChange={(e) => setGstNumber(e.target.value)}
//                   placeholder="Enter GST Number (e.g. 27AAECC8852H1Z5)"
//                   maxLength={15}
//                 />
//               </div>
//               <Button
//                 variant="secondary"
//                 size="small"
//                 className="px-4 text-white bg-orange-500 h-9 hover:bg-blue-600"
//                 onClick={handleVerifyGST}
//                 disabled={verifying || !gstNumber.trim() || !captchaImage}
//               >
//                 {verifying ? "Verifying..." : "Verify"}
//               </Button>
//             </div>

//             {gstNumber.trim() && (
//               <div className="mt-4">
//                 <div className="flex items-center justify-between mb-2">
//                   <Label className="text-sm font-semibold text-gray-700">CAPTCHA</Label>
//                   <Button
//                     type="button"
//                     variant="ghost"
//                     size="small"
//                     className="text-xs text-blue-600 hover:text-blue-800"
//                     onClick={refreshCaptcha}
//                     disabled={loadingCaptcha}
//                   >
//                     {loadingCaptcha ? "Loading..." : "Refresh CAPTCHA"}
//                   </Button>
//                 </div>

//                 {loadingCaptcha ? (
//                   <div className="flex items-center justify-center h-12 text-gray-500">
//                     Loading CAPTCHA...
//                   </div>
//                 ) : captchaImage ? (
//                   <>
//                     <img
//                       src={captchaImage}
//                       alt="CAPTCHA"
//                       className="mb-2 border rounded max-h-12"
//                     />
//                     <Input
//                       value={captchaText}
//                       onChange={(e) => setCaptchaText(e.target.value)}
//                       placeholder="Enter CAPTCHA text"
//                       className="mb-3"
//                       maxLength={6}
//                     />
//                   </>
//                 ) : null}

//                 {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
//               </div>
//             )}

//             {gstDetails && (
//               <div className="p-4 mt-6 border border-green-200 rounded-lg bg-green-50">
//                 <div className="flex items-center gap-2 mb-3">
//                   <span className="w-3 h-3 bg-green-500 rounded-full"></span>
//                   <h3 className="text-lg font-bold text-green-800">GST Verified Successfully!</h3>
//                 </div>

//                 <div className="space-y-3 text-sm">
//                   <DetailRow label="Legal Name of Business" value={gstDetails.lgnm || "—"} />
//                   <DetailRow label="Trade Name" value={gstDetails.tradeNam || "—"} />
//                   <DetailRow
//                     label="Effective Date of Registration"
//                     value={gstDetails.rgdt ? new Date(gstDetails.rgdt).toLocaleDateString("en-GB") : "—"}
//                   />
//                   <DetailRow label="Constitution of Business" value={gstDetails.ctb || "—"} />
//                   <DetailRow label="GSTIN / UIN Status" value={gstDetails.sts || "—"} />
//                   <DetailRow label="Taxpayer Type" value={gstDetails.typ || "—"} />
//                   <DetailRow
//                     label="Principal Place of Business"
//                     value={formatAddress(gstDetails.pradr?.adr)}
//                   />
//                 </div>
//               </div>
//             )}
//           </div>
//         </section>

//         <div className="flex-grow hidden lg:block"></div>
//       </div>
//     </MainLayout>
//   );
// };

// // Reusable detail row component
// const DetailRow = ({ label, value }) => (
//   <div>
//     <span className="font-semibold text-gray-700">{label}:</span>{" "}
//     <span className="text-gray-900">{value}</span>
//   </div>
// );

// export default CompanyAuthentication;



































// // src/pages/CompanyAuthentication.jsx
// import React, { useState, useEffect } from "react";
// import { Button, Input, Label } from "../../components/ui";
// import MainLayout from "../../components/layout/MainLayout";
// import RecruiterRightSidebarWithJobPost from "../recruiter/profile/RecruiterRightSidebarWithJobPost";
// import RecruiterRightSidebar from "../recruiter/dashboard/RecruiterRightSidebar";
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { IoIosArrowBack } from "react-icons/io";
// import { FaCheckCircle, FaEnvelope, FaPhoneAlt, FaShieldAlt } from "react-icons/fa";
// import { Loader2 } from "lucide-react";

// const BASE_URL = import.meta.env.VITE_BASE_URL;

// const CompanyAuthentication = () => {
//   const navigate = useNavigate();
//   // const { user } = useSelector((state) => state.auth);
//   const { user, token } = useSelector((state) => state.auth);

//   // Phone verification state
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [phoneOtp, setPhoneOtp] = useState("");
//   const [phoneSent, setPhoneSent] = useState(false);
//   const [phoneTimer, setPhoneTimer] = useState(60);

//   // Email verification state
//   const [email, setEmail] = useState(user.email || "");
//   const [emailOtp, setEmailOtp] = useState("");
//   const [emailSent, setEmailSent] = useState(false);
//   const [emailTimer, setEmailTimer] = useState(60);
//   const [emailLoading, setEmailLoading] = useState(false);
//   const [emailVerified, setEmailVerified] = useState(true);

//   // GST verification state
//   const [gstNumber, setGstNumber] = useState("");
//   const [captchaText, setCaptchaText] = useState("");
//   const [captchaImage, setCaptchaImage] = useState("");
//   const [sessionId, setSessionId] = useState("");
//   const [loadingCaptcha, setLoadingCaptcha] = useState(false);
//   const [verifying, setVerifying] = useState(false);
//   const [gstDetails, setGstDetails] = useState(null);
//   const [error, setError] = useState("");
// const [successMessage, setSuccessMessage] = useState(null);
//   // Countdown timer for phone OTP resend
//   useEffect(() => {
//     if (phoneSent && phoneTimer > 0) {
//       const interval = setInterval(() => setPhoneTimer((t) => t - 1), 1000);
//       return () => clearInterval(interval);
//     }
//   }, [phoneSent, phoneTimer]);

//   // Countdown timer for email OTP resend
//   useEffect(() => {
//     if (emailSent && emailTimer > 0) {
//       const interval = setInterval(() => setEmailTimer((t) => t - 1), 1000);
//       return () => clearInterval(interval);
//     }
//   }, [emailSent, emailTimer]);

//   // Fetch CAPTCHA only when user starts typing GSTIN
//   useEffect(() => {
//     if (gstNumber.trim().length > 0 && !captchaImage) {
//       fetchCaptcha();
//     }
//   }, [gstNumber]);

//   // Phone OTP Handlers
//   // const handleSendPhoneOtp = async () => {
//   //   if (!phoneNumber.trim()) {
//   //     setError("Please enter a valid phone number.");
//   //     return;
//   //   }
//   //   setError("");
//   //   try {
//   //     const res = await fetch(`${BASE_URL}/auth/send-phone-otp`, {
//   //       method: "POST",
//   //       headers: { "Content-Type": "application/json" },
//   //       body: JSON.stringify({ phone: phoneNumber.trim() }),
//   //     });
//   //     const data = await res.json();
//   //     if (!res.ok) throw new Error(data.error || "Failed to send OTP");
//   //     setPhoneSent(true);
//   //     setPhoneTimer(60);
//   //   } catch (err) {
//   //     setError(err.message || "Failed to send OTP. Please try again.");
//   //   }
//   // };


//   const handleSendPhoneOtp = async () => {
//   if (!phoneNumber.trim() || phoneNumber.trim().length !== 10) {
//     setError("Please enter a valid 10-digit phone number.");
//     return;
//   }
//   if (!token) {
//     setError("You must be logged in to verify your phone.");
//     return;
//   }
//   setError("");
//   console.log("[Phone OTP] Sending to /api/mobileotp/sendotp", { phoneNumber });
//   try {
//     const res = await fetch(`${BASE_URL}/mobileotp/sendotp`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ phoneNumber: phoneNumber.trim() }),
//     });
//     const data = await res.json().catch(() => ({}));
//     console.log("[Phone OTP] Send response", res.status, data);
//     if (!res.ok) {
//       throw new Error(data.message || data.error || "Failed to send OTP");
//     }
//     setPhoneSent(true);
//     setPhoneTimer(60);
//   } catch (err) {
//     console.error("[Phone OTP] Send failed:", err);
//     setError(err.message || "Failed to send OTP. Please try again.");
//   }
// };

//   const handleVerifyPhone = async () => {
//     if (!phoneOtp.trim() || phoneOtp.length !== 4) {
//       setError("Please enter a valid 4-digit OTP.");
//       return;
//     }
//     setError("");
//     try {
//       // const res = await fetch(`${BASE_URL}/auth/verify-phone`, {
//       const res = await fetch(`${BASE_URL}/mobileotp/verifyotp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//          },
//         // body: JSON.stringify({ phone: phoneNumber.trim(), otp: phoneOtp.trim() }),
//         body: JSON.stringify({ phoneNumber: phoneNumber.trim(), otp: phoneOtp.trim() }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Invalid OTP");
//       // alert("Phone verified successfully!");
//       setSuccessMessage("Phone verified successfully!");
// setError("");
// // Optional: 4 second baad message hata do
// setTimeout(() => setSuccessMessage(null), 4000);
//     } catch (err) {
//       setError(err.message || "Verification failed. Please try again.");
//     }
//   };

//   // Email OTP Handlers
//   const handleSendEmailOtp = async () => {
//     if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
//       setError("Please enter a valid email address.");
//       return;
//     }
//     setError("");
//     setEmailLoading(true);
//     try {
//       const res = await fetch(`${BASE_URL}/otp/send-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email: email.trim().toLowerCase() }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Failed to send OTP");
//       setEmailSent(true);
//       setEmailTimer(60);
//     } catch (err) {
//       setError(err.message || "Failed to send OTP. Please try again.");
//     } finally {
//       setEmailLoading(false);
//     }
//   };

//   const handleVerifyEmail = async () => {
//     if (!emailOtp.trim() || emailOtp.length !== 4) {
//       setError("Please enter a valid 4-digit OTP.");
//       return;
//     }
//     setError("");
//     try {
//       const res = await fetch(`${BASE_URL}/otp/verify-otp`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email: email.trim().toLowerCase(), otp: emailOtp.trim() }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Invalid OTP");
//       setEmailVerified(true);
//       alert("Email verified successfully!");
//     } catch (err) {
//       setError(err.message || "Verification failed. Please try again.");
//     }
//   };

//   const fetchCaptcha = async () => {
//     setLoadingCaptcha(true);
//     setError("");
//     try {
//       const res = await fetch(`${BASE_URL}/gst/captcha`);
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.error || "Failed to load CAPTCHA");
//       setCaptchaImage(data.image);
//       setSessionId(data.sessionId);
//       setCaptchaText("");
//     } catch (err) {
//       setError("Unable to load CAPTCHA. Please try again.");
//       console.error("CAPTCHA Error:", err);
//     } finally {
//       setLoadingCaptcha(false);
//     }
//   };

//   const handleVerifyGST = async () => {
//     if (!gstNumber.trim() || !captchaText.trim()) {
//       setError("Please enter GST number and CAPTCHA.");
//       return;
//     }

//     setVerifying(true);
//     setError("");
//     try {
//       const res = await fetch(`${BASE_URL}/gst/details`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           sessionId,
//           GSTIN: gstNumber.trim().toUpperCase(),
//           captcha: captchaText.trim(),
//         }),
//       });

//       const data = await res.json();
//       if (!res.ok) {
//         throw new Error(data.error || data.message || "Invalid CAPTCHA or GSTIN");
//       }

//       setGstDetails(data);
//       setError("");
//     } catch (err) {
//       setError(err.message || "Verification failed. Please try again.");
//       fetchCaptcha();
//     } finally {
//       setVerifying(false);
//     }
//   };

//   const refreshCaptcha = () => {
//     if (gstNumber.trim()) {
//       fetchCaptcha();
//     }
//   };

//   const formatAddress = (addr) => {
//     if (!addr) return "—";
//     const parts = [
//       addr.addr_bno,
//       addr.addr_bname,
//       addr.addr_flno,
//       addr.addr_st,
//       addr.addr_loc,
//       addr.addr_district,
//       addr.addr_state,
//       addr.addr_pncd,
//     ].filter(Boolean);
//     return parts.join(", ");
//   };

//   // Theme-matched input styling (matches CompanyProfileEdit)
//   const inputCls =
//     "w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9bc87c] focus:border-transparent transition";

//   return (
//     <MainLayout>
//       <div className="flex flex-col min-h-screen bg-gray-100">
//         <section className="w-full px-4 py-6 mx-auto max-w-7xl">
//           {successMessage && (
//   <div
//     className="mb-4 px-4 py-3 rounded-xl border border-[#9bc87c] bg-[#e6f4dc] text-[#3f5a26] text-sm font-semibold text-center shadow-sm"
//     role="status"
//   >
//     {successMessage}
//   </div>
// )}
//           <div className="w-full mx-auto bg-white rounded-2xl shadow-sm border border-gray-100">

//             {/* Header — matches CompanyProfileEdit gradient header */}
//             <div className="flex flex-col items-center p-6 bg-gradient-to-b from-white to-gray-50 border-b border-gray-200 rounded-t-2xl">
//               <div className="flex items-center self-start w-full gap-3 mb-2">
//                 <button
//                   type="button"
//                   onClick={() => navigate(-1)}
//                   className="p-2 transition-colors rounded-full hover:bg-gray-100"
//                   title="Go back"
//                 >
//                   <IoIosArrowBack className="w-5 h-5 text-gray-600" />
//                 </button>
//                 <h1 className="text-xl font-extrabold text-[#1e1e2d] sm:text-2xl">
//                   Account Verification
//                 </h1>
//               </div>
//               <p className="self-start ml-12 text-sm text-gray-500">
//                 Verify your email, phone and GST to complete your company profile.
//               </p>
//             </div>

//             <div className="p-4 sm:p-6 space-y-4">

//               {/* ===== EMAIL VERIFICATION ===== */}
//               <div className="overflow-hidden bg-white shadow-sm rounded-xl border border-gray-100 transition-all">
//                 <div className="flex items-center justify-between p-4 border-b border-gray-100">
//                   <div className="flex items-center gap-3">
//                     <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#e6f4dc]">
//                       <FaEnvelope className="text-[#5a7d3d]" size={14} />
//                     </div>
//                     <h3 className="text-lg font-extrabold text-[#1e1e2d]">Email Verification</h3>
//                   </div>
//                   {emailVerified && (
//                     <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-[#e6f4dc] text-[#1DB32F] border border-[#9bc87c]">
//                       <FaCheckCircle size={12} /> Verified
//                     </span>
//                   )}
//                 </div>

//                 <div className="p-4 bg-gray-50/30">
//                   <Label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1.5">
//                     Email Address
//                   </Label>
//                   <div className="flex flex-col gap-2 mb-3 sm:flex-row">
//                     <div className="flex-1">
//                       <Input
//                         id="email"
//                         type="email"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         placeholder="your@email.com"
//                         disabled={emailSent || emailVerified}
//                         className={inputCls}
//                       />
//                     </div>
//                     <Button
//                       variant="secondary"
//                       size="small"
//                       className="px-5 h-10 text-white !bg-[#9bc87c] hover:!bg-[#8ab76b] disabled:!bg-gray-300 font-bold rounded-lg transition"
//                       onClick={handleSendEmailOtp}
//                       disabled={emailLoading || emailSent || emailVerified || !email.trim()}
//                     >
//                       {emailLoading ? (
//                         <span className="flex items-center gap-1.5">
//                           <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...
//                         </span>
//                       ) : emailSent ? "Sent!" : "Send OTP"}
//                     </Button>
//                   </div>

//                   {emailSent && !emailVerified && (
//                     <div className="pt-3 mt-3 border-t border-gray-200">
//                       <Label htmlFor="emailOtp" className="block text-sm font-bold text-gray-700 mb-1.5">
//                         Enter OTP
//                       </Label>
//                       <Input
//                         id="emailOtp"
//                         value={emailOtp}
//                         onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
//                         placeholder="4-Digit Code"
//                         maxLength={4}
//                         className={`${inputCls} mb-3 tracking-widest text-center font-mono`}
//                       />
//                       <Button
//                         variant="primary"
//                         size="default"
//                         className="w-full mb-2 !bg-[#9bc87c] hover:!bg-[#8ab76b] !text-white font-bold rounded-lg"
//                         onClick={handleVerifyEmail}
//                       >
//                         Verify Email
//                       </Button>
//                       <p className="text-xs text-center text-gray-500">
//                         {emailTimer > 0 ? (
//                           <span>Resend code in <span className="font-bold text-[#5a7d3d]">{emailTimer}s</span></span>
//                         ) : (
//                           <button
//                             type="button"
//                             className="font-bold text-[#9bc87c] hover:text-[#8ab76b] hover:underline"
//                             onClick={() => { handleSendEmailOtp(); setEmailTimer(60); }}
//                           >
//                             Resend OTP
//                           </button>
//                         )}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* ===== PHONE VERIFICATION ===== */}
//               <div className="overflow-hidden bg-white shadow-sm rounded-xl border border-gray-100 transition-all">
//                 <div className="flex items-center justify-between p-4 border-b border-gray-100">
//                   <div className="flex items-center gap-3">
//                     <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#e6f4dc]">
//                       <FaPhoneAlt className="text-[#5a7d3d]" size={14} />
//                     </div>
//                     <h3 className="text-lg font-extrabold text-[#1e1e2d]">Phone Verification</h3>
//                   </div>
//                 </div>

//                 <div className="p-4 bg-gray-50/30">
//                   <Label htmlFor="phoneNumber" className="block text-sm font-bold text-gray-700 mb-1.5">
//                     Phone Number
//                   </Label>
//                   <div className="flex flex-col gap-2 mb-3 sm:flex-row">
//                     <div className="flex-1">
//                       <Input
//                         id="phoneNumber"
//                         value={phoneNumber}
//                         onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
//                         placeholder="+91 XXXXXXXXXX"
//                         maxLength={10}
//                         disabled={phoneSent}
//                         className={inputCls}
//                       />
//                     </div>
//                     <Button
//                       variant="secondary"
//                       size="small"
//                       className="px-5 h-10 text-white !bg-[#9bc87c] hover:!bg-[#8ab76b] disabled:!bg-gray-300 font-bold rounded-lg transition"
//                       onClick={handleSendPhoneOtp}
//                       disabled={phoneSent || !phoneNumber.trim()}
//                     >
//                       Send OTP
//                     </Button>
//                   </div>

//                   {phoneSent && (
//                     <div className="pt-3 mt-3 border-t border-gray-200">
//                       <Label htmlFor="phoneOtp" className="block text-sm font-bold text-gray-700 mb-1.5">
//                         Enter OTP
//                       </Label>
//                       <Input
//                         id="phoneOtp"
//                         value={phoneOtp}
//                         onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ""))}
//                         placeholder="4-Digit Code"
//                         maxLength={4}
//                         className={`${inputCls} mb-3 tracking-widest text-center font-mono`}
//                       />
//                       <Button
//                         variant="primary"
//                         size="default"
//                         className="w-full mb-2 !bg-[#9bc87c] hover:!bg-[#8ab76b] !text-white font-bold rounded-lg"
//                         onClick={handleVerifyPhone}
//                       >
//                         Verify Phone Number
//                       </Button>
//                       <p className="text-xs text-center text-gray-500">
//                         {phoneTimer > 0 ? (
//                           <span>Resend code in <span className="font-bold text-[#5a7d3d]">{phoneTimer}s</span></span>
//                         ) : (
//                           <button
//                             type="button"
//                             className="font-bold text-[#9bc87c] hover:text-[#8ab76b] hover:underline"
//                             onClick={() => { handleSendPhoneOtp(); setPhoneTimer(60); }}
//                           >
//                             Resend OTP
//                           </button>
//                         )}
//                       </p>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* ===== GST AUTHENTICATION ===== */}
//               <div className="overflow-hidden bg-white shadow-sm rounded-xl border border-gray-100 transition-all">
//                 <div className="flex items-center justify-between p-4 border-b border-gray-100">
//                   <div className="flex items-center gap-3">
//                     <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#e6f4dc]">
//                       <FaShieldAlt className="text-[#5a7d3d]" size={14} />
//                     </div>
//                     <h3 className="text-lg font-extrabold text-[#1e1e2d]">GST Authentication</h3>
//                   </div>
//                 </div>

//                 <div className="p-4 bg-gray-50/30">
//                   <Label htmlFor="gstNumber" className="block text-sm font-bold text-gray-700 mb-1.5">
//                     GST Number
//                   </Label>
//                   <div className="flex flex-col gap-2 mb-3 sm:flex-row">
//                     <div className="flex-1">
//                       <Input
//                         id="gstNumber"
//                         value={gstNumber}
//                         onChange={(e) => setGstNumber(e.target.value)}
//                         placeholder="Enter GST Number (e.g. 27AAECC8852H1Z5)"
//                         maxLength={15}
//                         className={`${inputCls} uppercase`}
//                       />
//                     </div>
//                     <Button
//                       variant="secondary"
//                       size="small"
//                       className="px-5 h-10 text-white !bg-[#9bc87c] hover:!bg-[#8ab76b] disabled:!bg-gray-300 font-bold rounded-lg transition"
//                       onClick={handleVerifyGST}
//                       disabled={verifying || !gstNumber.trim() || !captchaImage}
//                     >
//                       {verifying ? (
//                         <span className="flex items-center gap-1.5">
//                           <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
//                         </span>
//                       ) : "Verify"}
//                     </Button>
//                   </div>

//                   {gstNumber.trim() && (
//                     <div className="pt-3 mt-3 border-t border-gray-200">
//                       <div className="flex items-center justify-between mb-2">
//                         <Label className="text-sm font-bold text-gray-700">CAPTCHA</Label>
//                         <button
//                           type="button"
//                           className="text-xs font-bold text-[#9bc87c] hover:text-[#8ab76b] disabled:opacity-50 transition"
//                           onClick={refreshCaptcha}
//                           disabled={loadingCaptcha}
//                         >
//                           {loadingCaptcha ? "Loading..." : "↻ Refresh"}
//                         </button>
//                       </div>

//                       {loadingCaptcha ? (
//                         <div className="flex items-center justify-center h-12 text-sm text-gray-500 border border-gray-200 rounded-lg bg-white">
//                           <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#9bc87c]" />
//                           Loading CAPTCHA...
//                         </div>
//                       ) : captchaImage ? (
//                         <>
//                           <div className="flex items-center justify-center p-2 mb-2 bg-white border border-gray-200 rounded-lg">
//                             <img
//                               src={captchaImage}
//                               alt="CAPTCHA"
//                               className="rounded max-h-12"
//                             />
//                           </div>
//                           <Input
//                             value={captchaText}
//                             onChange={(e) => setCaptchaText(e.target.value)}
//                             placeholder="Enter CAPTCHA text"
//                             className={`${inputCls} mb-1`}
//                             maxLength={6}
//                           />
//                         </>
//                       ) : null}

//                       {error && (
//                         <p className="px-3 py-2 mt-2 text-sm font-medium text-red-700 border border-red-200 rounded-lg bg-red-50">
//                           {error}
//                         </p>
//                       )}
//                     </div>
//                   )}

//                   {gstDetails && (
//                     <div className="p-4 mt-4 border rounded-xl bg-[#e6f4dc] border-[#9bc87c]">
//                       <div className="flex items-center gap-2 mb-3">
//                         <FaCheckCircle className="text-[#1DB32F]" size={18} />
//                         <h3 className="text-base font-extrabold text-[#1e1e2d]">
//                           GST Verified Successfully!
//                         </h3>
//                       </div>

//                       <div className="space-y-2 text-sm">
//                         <DetailRow label="Legal Name of Business" value={gstDetails.lgnm || "—"} />
//                         <DetailRow label="Trade Name" value={gstDetails.tradeNam || "—"} />
//                         <DetailRow
//                           label="Effective Date of Registration"
//                           value={gstDetails.rgdt ? new Date(gstDetails.rgdt).toLocaleDateString("en-GB") : "—"}
//                         />
//                         <DetailRow label="Constitution of Business" value={gstDetails.ctb || "—"} />
//                         <DetailRow label="GSTIN / UIN Status" value={gstDetails.sts || "—"} />
//                         <DetailRow label="Taxpayer Type" value={gstDetails.typ || "—"} />
//                         <DetailRow
//                           label="Principal Place of Business"
//                           value={formatAddress(gstDetails.pradr?.adr)}
//                         />
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>

//             </div>
//           </div>
//         </section>
//       </div>
//     </MainLayout>
//   );
// };

// // Reusable detail row component (theme-matched)
// const DetailRow = ({ label, value }) => (
//   <div className="flex flex-col gap-0.5 pb-2 border-b border-[#9bc87c]/30 last:border-0 last:pb-0">
//     <span className="text-xs font-bold text-[#5a7d3d] uppercase tracking-wide">{label}</span>
//     <span className="text-sm font-semibold text-[#1e1e2d]">{value}</span>
//   </div>
// );

// export default CompanyAuthentication;











// src/pages/recruiter/CompanyAuthentication.jsx
import React, { useState, useEffect } from "react";
import { Button, Input, Label } from "../../components/ui";
import MainLayout from "../../components/layout/MainLayout";
import RecruiterRightSidebarWithJobPost from "../recruiter/profile/RecruiterRightSidebarWithJobPost";
import RecruiterRightSidebar from "../recruiter/dashboard/RecruiterRightSidebar";
import { useSelector, useDispatch } from "react-redux";
import { updateUser } from "../../redux/feature/authSlice";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";
import { FaCheckCircle, FaEnvelope, FaPhoneAlt, FaShieldAlt } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import { recruiterApi } from "../../api/recruiterApi";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const CompanyAuthentication = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);

  // Phone verification state
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneSent, setPhoneSent] = useState(false);
  const [phoneTimer, setPhoneTimer] = useState(60);
  const [phoneVerified, setPhoneVerified] = useState(() => Boolean(user?.is_phone_verified));
  const [phoneVerifying, setPhoneVerifying] = useState(false);
  const [phoneSending, setPhoneSending] = useState(false);

  // Email verification state
  const [email, setEmail] = useState(user?.email || "");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailTimer, setEmailTimer] = useState(60);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [emailVerified, setEmailVerified] = useState(() => Boolean(user?.is_email_verified));

  // GST verification state
  const [gstVerified, setGstVerified] = useState(() => Boolean(user?.is_gst_verified));
  const [gstNumber, setGstNumber] = useState("");
  const [verifiedGstNumber, setVerifiedGstNumber] = useState(
    user?.gst_number ? String(user.gst_number).toUpperCase() : "",
  );
  const [isChangingGst, setIsChangingGst] = useState(false);
  const [captchaText, setCaptchaText] = useState("");
  const [captchaImage, setCaptchaImage] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [loadingCaptcha, setLoadingCaptcha] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [gstDetails, setGstDetails] = useState(null);

  // Shared feedback state
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(null);

  // Keep flags in sync if Redux user changes elsewhere
  useEffect(() => {
    if (user?.is_phone_verified) setPhoneVerified(true);
  }, [user?.is_phone_verified]);

  useEffect(() => {
    if (user?.is_email_verified) setEmailVerified(true);
  }, [user?.is_email_verified]);

  useEffect(() => {
    if (user?.is_gst_verified) setGstVerified(true);
  }, [user?.is_gst_verified]);

  // Hydrate from canonical recruiter profile (fixes stale localStorage / signup drift)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) return;
      try {
        const p = await recruiterApi.getProfile(token);
        if (cancelled) return;
        console.log("[CompanyAuthentication] recruiter profile hydrate:", {
          is_email_verified: p?.is_email_verified,
          is_phone_verified: p?.is_phone_verified,
          is_gst_verified: p?.is_gst_verified,
          gst_number: p?.gst_number,
          mobile: p?.mobile,
        });
        setEmailVerified(!!p?.is_email_verified);
        setPhoneVerified(!!p?.is_phone_verified);
        setGstVerified(!!p?.is_gst_verified);
        if (p?.email) setEmail(p.email);
        if (p?.mobile) {
          const digits = String(p.mobile).replace(/\D/g, "");
          setPhoneNumber(digits.length > 10 ? digits.slice(-10) : digits);
        }
        if (p?.gst_number) {
          const formattedGstin = String(p.gst_number).toUpperCase();
          setGstNumber(formattedGstin);
          setVerifiedGstNumber(formattedGstin);
        }
        dispatch(
          updateUser({
            is_email_verified: !!p?.is_email_verified,
            is_phone_verified: !!p?.is_phone_verified,
            is_gst_verified: !!p?.is_gst_verified,
            gst_number: p?.gst_number,
          }),
        );
      } catch (e) {
        console.warn("[CompanyAuthentication] profile hydrate failed:", e?.message || e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, dispatch]);

  // Countdown timer for phone OTP resend
  useEffect(() => {
    if (phoneSent && phoneTimer > 0) {
      const interval = setInterval(() => setPhoneTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [phoneSent, phoneTimer]);

  // Countdown timer for email OTP resend
  useEffect(() => {
    if (emailSent && emailTimer > 0) {
      const interval = setInterval(() => setEmailTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [emailSent, emailTimer]);

  // Fetch CAPTCHA only when user starts typing GSTIN (and GST not already verified)
  useEffect(() => {
    if (gstVerified && !isChangingGst) return;
    if (gstNumber.trim().length > 0 && !captchaImage) {
      fetchCaptcha();
    }
  }, [gstNumber, gstVerified, isChangingGst]);

  const flashSuccess = (msg) => {
    setSuccessMessage(msg);
    setError("");
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // ===== PHONE OTP =====
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
    setSuccessMessage(null);
    setPhoneSending(true);
    console.log("[Phone OTP] POST /mobileotp/sendotp", { phoneNumber: phoneNumber.trim() });
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
      console.log("[Phone OTP] Send response", res.status, data);
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to send OTP");
      }
      setPhoneSent(true);
      setPhoneTimer(60);
      flashSuccess(
        data.message
          ? `${data.message}. If SMS is not configured, check server logs for the code.`
          : "OTP sent. If SMS is not configured, check server logs for the code."
      );
    } catch (err) {
      console.error("[Phone OTP] Send failed:", err);
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
    setSuccessMessage(null);
    setPhoneVerifying(true);
    console.log("[Phone OTP] POST /mobileotp/verifyotp", {
      phoneNumber: phoneNumber.trim(),
      otpLen: phoneOtp.trim().length,
    });
    try {
      const res = await fetch(`${BASE_URL}/mobileotp/verifyotp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber.trim(),
          otp: String(phoneOtp.trim()),
        }),
      });
      const data = await res.json().catch(() => ({}));
      console.log("[Phone OTP] Verify response", res.status, data);
      if (!res.ok) {
        throw new Error(data.message || data.error || "Verification failed");
      }
      setPhoneVerified(true);
      setPhoneSent(false);
      setPhoneOtp("");
      dispatch(updateUser({ is_phone_verified: true }));
      flashSuccess(data.message || "Phone verified successfully!");
    } catch (err) {
      console.error("[Phone OTP] Verify failed:", err);
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setPhoneVerifying(false);
    }
  };

  // ===== EMAIL OTP =====
  const handleSendEmailOtp = async () => {
    if (emailVerified) return;
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSuccessMessage(null);
    setEmailLoading(true);
    console.log("[Email OTP] POST /otp/send-otp", { email: email.trim().toLowerCase() });
    try {
      const res = await fetch(`${BASE_URL}/otp/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json().catch(() => ({}));
      console.log("[Email OTP] Send response", res.status, data);
      if (!res.ok) throw new Error(data.message || data.error || "Failed to send OTP");
      setEmailSent(true);
      setEmailTimer(60);
      flashSuccess(data.message || "Email OTP sent.");
    } catch (err) {
      console.error("[Email OTP] Send failed:", err);
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
    setSuccessMessage(null);
    setEmailVerifying(true);
    console.log("[Email OTP] POST /otp/verify-otp", { email: email.trim().toLowerCase() });
    try {
      const res = await fetch(`${BASE_URL}/otp/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), otp: emailOtp.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      console.log("[Email OTP] Verify response", res.status, data);
      if (!res.ok) throw new Error(data.message || data.error || "Invalid OTP");
      setEmailVerified(true);
      setEmailSent(false);
      setEmailOtp("");
      dispatch(updateUser({ is_email_verified: true }));
      flashSuccess(data.message || "Email verified successfully!");
    } catch (err) {
      console.error("[Email OTP] Verify failed:", err);
      setError(err.message || "Verification failed. Please try again.");
    } finally {
      setEmailVerifying(false);
    }
  };

  // ===== GST =====
  const fetchCaptcha = async () => {
    setLoadingCaptcha(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/gst/captcha`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || data.error || "Failed to load CAPTCHA");
      setCaptchaImage(data.image);
      setSessionId(data.sessionId);
      setCaptchaText("");
    } catch (err) {
      console.error("CAPTCHA Error:", err);
      setError("Unable to load CAPTCHA. Please try again.");
    } finally {
      setLoadingCaptcha(false);
    }
  };

  const handleVerifyGST = async () => {
    const formattedGstin = gstNumber.trim().toUpperCase();
    const isSameVerifiedGstin =
      gstVerified && verifiedGstNumber && formattedGstin === verifiedGstNumber;

    if (gstVerified && !isChangingGst) {
      setError("GSTIN is already verified. Click Change GSTIN to verify a different number.");
      return;
    }
    if (!formattedGstin) {
      setError("Please enter GST number.");
      return;
    }
    if (!isSameVerifiedGstin && !captchaText.trim()) {
      setError("Please enter CAPTCHA to verify GST number.");
      return;
    }
    if (!token) {
      setError("You must be logged in to verify GST.");
      return;
    }
    setVerifying(true);
    setError("");
    console.log("[GST] POST /gst/details", { GSTIN: formattedGstin });
    try {
      const res = await fetch(`${BASE_URL}/gst/details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId,
          GSTIN: formattedGstin,
          captcha: captchaText.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      console.log("[GST] Verify response", res.status, data);
      if (!res.ok) {
        throw new Error(data.message || data.error || "Invalid CAPTCHA or GSTIN");
      }
      const portalVerified = !!data?.is_gst_verified;
      if (portalVerified) {
        setGstDetails(data);
        setGstVerified(true);
        setIsChangingGst(false);
        setVerifiedGstNumber(data.gstin || formattedGstin);
        setGstNumber(data.gstin || formattedGstin);
        setCaptchaText("");
        setCaptchaImage("");
        setSessionId("");
        dispatch(
          updateUser({
            is_gst_verified: true,
            gst_number: data.gstin || formattedGstin,
          }),
        );
        setError("");
        flashSuccess(data.already_verified ? "GSTIN is already verified." : "GST verified successfully!");
      } else {
        setGstDetails(null);
        setError("Could not confirm GST verification. Please try again.");
        fetchCaptcha();
      }
    } catch (err) {
      console.error("[GST] Verify failed:", err);
      setError(err.message || "Verification failed. Please try again.");
      fetchCaptcha();
    } finally {
      setVerifying(false);
    }
  };

  const refreshCaptcha = () => {
    if (gstNumber.trim()) fetchCaptcha();
  };

  const handleChangeGst = () => {
    if (
      gstVerified &&
      !window.confirm(
        "Changing GSTIN will require verification again. Continue?",
      )
    ) {
      return;
    }
    setIsChangingGst(true);
    setGstDetails(null);
    setCaptchaText("");
    setCaptchaImage("");
    setSessionId("");
    setError("");
    setSuccessMessage(null);
    fetchCaptcha();
  };

  const handleCancelGstChange = () => {
    setIsChangingGst(false);
    setGstNumber(verifiedGstNumber);
    setCaptchaText("");
    setCaptchaImage("");
    setSessionId("");
    setError("");
  };

  const formatAddress = (addr) => {
    if (!addr) return "—";
    const parts = [
      addr.addr_bno,
      addr.addr_bname,
      addr.addr_flno,
      addr.addr_st,
      addr.addr_loc,
      addr.addr_district,
      addr.addr_state,
      addr.addr_pncd,
    ].filter(Boolean);
    return parts.join(", ");
  };

  const inputCls =
    "w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9bc87c] focus:border-transparent transition";

  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <section className="w-full px-4 py-6 mx-auto max-w-7xl">

          {/* ===== GLOBAL SUCCESS BANNER ===== */}
          {successMessage && (
            <div
              className="mb-4 px-4 py-3 rounded-xl border border-[#9bc87c] bg-[#e6f4dc] text-[#3f5a26] text-sm font-semibold text-center shadow-sm"
              role="status"
            >
              {successMessage}
            </div>
          )}

          {/* ===== GLOBAL ERROR BANNER (visible for phone/email/GST) ===== */}
          {error && (
            <div
              className="mb-4 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm font-semibold text-center shadow-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          <div className="w-full mx-auto bg-white rounded-2xl shadow-sm border border-gray-100">

            {/* Header */}
            <div className="flex flex-col items-center p-6 bg-gradient-to-b from-white to-gray-50 border-b border-gray-200 rounded-t-2xl">
              <div className="flex items-center self-start w-full gap-3 mb-2">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="p-2 transition-colors rounded-full hover:bg-gray-100"
                  title="Go back"
                >
                  <IoIosArrowBack className="w-5 h-5 text-gray-600" />
                </button>
                <h1 className="text-xl font-extrabold text-[#1e1e2d] sm:text-2xl">
                  Account Verification
                </h1>
              </div>
              <p className="self-start ml-12 text-sm text-gray-500">
                Verify your email, phone and GST to complete your company profile.
              </p>
            </div>

            <div className="p-4 sm:p-6 space-y-4">

              {/* ===== EMAIL VERIFICATION ===== */}
              <div className="overflow-hidden bg-white shadow-sm rounded-xl border border-gray-100 transition-all">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#e6f4dc]">
                      <FaEnvelope className="text-[#5a7d3d]" size={14} />
                    </div>
                    <h3 className="text-lg font-extrabold text-[#1e1e2d]">Email Verification</h3>
                  </div>
                  {emailVerified && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-[#e6f4dc] text-[#1DB32F] border border-[#9bc87c]">
                      <FaCheckCircle size={12} /> Verified
                    </span>
                  )}
                </div>

                <div className="p-4 bg-gray-50/30">
                  <Label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-1.5">
                    Email Address
                  </Label>
                  <div className="flex flex-col gap-2 mb-3 sm:flex-row">
                    <div className="flex-1">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        disabled={emailSent || emailVerified}
                        className={inputCls}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      className="px-5 h-10 text-white !bg-[#9bc87c] hover:!bg-[#8ab76b] disabled:!bg-gray-300 font-bold rounded-lg transition"
                      onClick={handleSendEmailOtp}
                      disabled={emailLoading || emailSent || emailVerified || !email.trim()}
                    >
                      {emailLoading ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...
                        </span>
                      ) : emailSent ? "Sent!" : "Send OTP"}
                    </Button>
                  </div>

                  {emailSent && !emailVerified && (
                    <div className="pt-3 mt-3 border-t border-gray-200">
                      <Label htmlFor="emailOtp" className="block text-sm font-bold text-gray-700 mb-1.5">
                        Enter OTP
                      </Label>
                      <Input
                        id="emailOtp"
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="4-Digit Code"
                        maxLength={4}
                        className={`${inputCls} mb-3 tracking-widest text-center font-mono`}
                      />
                      <Button
                        type="button"
                        variant="primary"
                        size="default"
                        className="w-full mb-2 !bg-[#9bc87c] hover:!bg-[#8ab76b] !text-white font-bold rounded-lg"
                        onClick={handleVerifyEmail}
                        loading={emailVerifying}
                        disabled={emailVerifying || !emailOtp.trim() || emailOtp.length !== 4}
                      >
                        Verify Email
                      </Button>
                      <p className="text-xs text-center text-gray-500">
                        {emailTimer > 0 ? (
                          <span>Resend code in <span className="font-bold text-[#5a7d3d]">{emailTimer}s</span></span>
                        ) : (
                          <button
                            type="button"
                            className="font-bold text-[#9bc87c] hover:text-[#8ab76b] hover:underline"
                            onClick={() => { handleSendEmailOtp(); setEmailTimer(60); }}
                          >
                            Resend OTP
                          </button>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ===== PHONE VERIFICATION ===== */}
              <div className="overflow-hidden bg-white shadow-sm rounded-xl border border-gray-100 transition-all">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#e6f4dc]">
                      <FaPhoneAlt className="text-[#5a7d3d]" size={14} />
                    </div>
                    <h3 className="text-lg font-extrabold text-[#1e1e2d]">Phone Verification</h3>
                  </div>
                  {phoneVerified && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-[#e6f4dc] text-[#1DB32F] border border-[#9bc87c]">
                      <FaCheckCircle size={12} /> Verified
                    </span>
                  )}
                </div>

                <div className="p-4 bg-gray-50/30">
                  <Label htmlFor="phoneNumber" className="block text-sm font-bold text-gray-700 mb-1.5">
                    Phone Number
                  </Label>
                  <div className="flex flex-col gap-2 mb-3 sm:flex-row">
                    <div className="flex-1">
                      <Input
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="+91 XXXXXXXXXX"
                        maxLength={10}
                        disabled={phoneSent || phoneVerified}
                        className={inputCls}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      className="px-5 h-10 text-white !bg-[#9bc87c] hover:!bg-[#8ab76b] disabled:!bg-gray-300 font-bold rounded-lg transition"
                      onClick={handleSendPhoneOtp}
                      disabled={phoneSending || phoneSent || phoneVerified || !phoneNumber.trim()}
                    >
                      {phoneSending ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...
                        </span>
                      ) : phoneVerified ? "Verified" : phoneSent ? "Sent!" : "Send OTP"}
                    </Button>
                  </div>

                  {phoneSent && !phoneVerified && (
                    <div className="pt-3 mt-3 border-t border-gray-200">
                      <Label htmlFor="phoneOtp" className="block text-sm font-bold text-gray-700 mb-1.5">
                        Enter OTP
                      </Label>
                      <Input
                        id="phoneOtp"
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="4-Digit Code"
                        maxLength={4}
                        className={`${inputCls} mb-3 tracking-widest text-center font-mono`}
                      />
                      <Button
                        type="button"
                        variant="primary"
                        size="default"
                        className="w-full mb-2 !bg-[#9bc87c] hover:!bg-[#8ab76b] !text-white font-bold rounded-lg"
                        onClick={handleVerifyPhone}
                        loading={phoneVerifying}
                        disabled={phoneVerifying || !phoneOtp.trim() || phoneOtp.length !== 4}
                      >
                        Verify Phone Number
                      </Button>
                      <p className="text-xs text-center text-gray-500">
                        {phoneTimer > 0 ? (
                          <span>Resend code in <span className="font-bold text-[#5a7d3d]">{phoneTimer}s</span></span>
                        ) : (
                          <button
                            type="button"
                            className="font-bold text-[#9bc87c] hover:text-[#8ab76b] hover:underline"
                            onClick={() => { handleSendPhoneOtp(); setPhoneTimer(60); }}
                          >
                            Resend OTP
                          </button>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* ===== GST AUTHENTICATION ===== */}
              <div className="overflow-hidden bg-white shadow-sm rounded-xl border border-gray-100 transition-all">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#e6f4dc]">
                      <FaShieldAlt className="text-[#5a7d3d]" size={14} />
                    </div>
                    <h3 className="text-lg font-extrabold text-[#1e1e2d]">GST Authentication</h3>
                  </div>
                  {gstVerified && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-[#e6f4dc] text-[#1DB32F] border border-[#9bc87c]">
                      <FaCheckCircle size={12} /> Verified
                    </span>
                  )}
                </div>

                <div className="p-4 bg-gray-50/30">
                  <Label htmlFor="gstNumber" className="block text-sm font-bold text-gray-700 mb-1.5">
                    GST Number
                  </Label>
                  <div className="flex flex-col gap-2 mb-3 sm:flex-row">
                    <div className="flex-1">
                      <Input
                        id="gstNumber"
                        value={gstNumber}
                        onChange={(e) => {
                          setGstNumber(e.target.value.toUpperCase());
                          setCaptchaText("");
                        }}
                        placeholder="Enter GST Number (e.g. 27AAECC8852H1Z5)"
                        maxLength={15}
                        disabled={gstVerified && !isChangingGst}
                        className={`${inputCls} uppercase`}
                      />
                    </div>
                    {gstVerified && !isChangingGst ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="small"
                        className="px-5 h-10 font-bold rounded-lg"
                        onClick={handleChangeGst}
                      >
                        Change GSTIN
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      variant="secondary"
                      size="small"
                      className="px-5 h-10 text-white !bg-[#9bc87c] hover:!bg-[#8ab76b] disabled:!bg-gray-300 font-bold rounded-lg transition"
                      onClick={handleVerifyGST}
                      disabled={
                        verifying ||
                        !gstNumber.trim() ||
                        (!gstVerified && !captchaImage) ||
                        (isChangingGst && !captchaImage)
                      }
                    >
                      {verifying ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Verifying...
                        </span>
                      ) : gstVerified && !isChangingGst ? (
                        "Verified"
                      ) : (
                        "Verify"
                      )}
                    </Button>
                    {isChangingGst ? (
                      <Button
                        type="button"
                        variant="secondary"
                        size="small"
                        className="px-5 h-10 font-bold rounded-lg"
                        onClick={handleCancelGstChange}
                      >
                        Cancel
                      </Button>
                    ) : null}
                  </div>

                  {gstVerified && !isChangingGst && verifiedGstNumber && (
                    <p className="mb-3 text-xs font-semibold text-[#5a7d3d]">
                      Current verified GSTIN: <span className="font-mono">{verifiedGstNumber}</span>
                    </p>
                  )}

                  {gstNumber.trim() && (!gstVerified || isChangingGst) && (
                    <div className="pt-3 mt-3 border-t border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-sm font-bold text-gray-700">CAPTCHA</Label>
                        <button
                          type="button"
                          className="text-xs font-bold text-[#9bc87c] hover:text-[#8ab76b] disabled:opacity-50 transition"
                          onClick={refreshCaptcha}
                          disabled={loadingCaptcha}
                        >
                          {loadingCaptcha ? "Loading..." : "↻ Refresh"}
                        </button>
                      </div>

                      {loadingCaptcha ? (
                        <div className="flex items-center justify-center h-12 text-sm text-gray-500 border border-gray-200 rounded-lg bg-white">
                          <Loader2 className="w-4 h-4 mr-2 animate-spin text-[#9bc87c]" />
                          Loading CAPTCHA...
                        </div>
                      ) : captchaImage ? (
                        <>
                          <div className="flex items-center justify-center p-2 mb-2 bg-white border border-gray-200 rounded-lg">
                            <img src={captchaImage} alt="CAPTCHA" className="rounded max-h-12" />
                          </div>
                          <Input
                            value={captchaText}
                            onChange={(e) => setCaptchaText(e.target.value)}
                            placeholder="Enter CAPTCHA text"
                            className={`${inputCls} mb-1`}
                            maxLength={6}
                          />
                        </>
                      ) : null}
                    </div>
                  )}

                  {gstDetails && (
                    <div className="p-4 mt-4 border rounded-xl bg-[#e6f4dc] border-[#9bc87c]">
                      <div className="flex items-center gap-2 mb-3">
                        <FaCheckCircle className="text-[#1DB32F]" size={18} />
                        <h3 className="text-base font-extrabold text-[#1e1e2d]">
                          GST Verified Successfully!
                        </h3>
                      </div>

                      <div className="space-y-2 text-sm">
                        <DetailRow label="Legal Name of Business" value={gstDetails.lgnm || "—"} />
                        <DetailRow label="Trade Name" value={gstDetails.tradeNam || "—"} />
                        <DetailRow
                          label="Effective Date of Registration"
                          value={gstDetails.rgdt ? new Date(gstDetails.rgdt).toLocaleDateString("en-GB") : "—"}
                        />
                        <DetailRow label="Constitution of Business" value={gstDetails.ctb || "—"} />
                        <DetailRow label="GSTIN / UIN Status" value={gstDetails.sts || "—"} />
                        <DetailRow label="Taxpayer Type" value={gstDetails.typ || "—"} />
                        <DetailRow
                          label="Principal Place of Business"
                          value={formatAddress(gstDetails.pradr?.adr)}
                        />
                      </div>
                    </div>
                  )}

                  {gstVerified && !gstDetails && gstNumber.trim() && (
                    <div className="p-4 mt-4 text-sm font-semibold text-[#1e1e2d] border rounded-xl bg-[#e6f4dc] border-[#9bc87c]">
                      <FaCheckCircle className="inline mr-2 text-[#1DB32F]" size={16} />
                      GST verified for{" "}
                      <span className="font-mono tracking-wide">{gstNumber.trim().toUpperCase()}</span>.
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

// Reusable detail row component (theme-matched)
const DetailRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5 pb-2 border-b border-[#9bc87c]/30 last:border-0 last:pb-0">
    <span className="text-xs font-bold text-[#5a7d3d] uppercase tracking-wide">{label}</span>
    <span className="text-sm font-semibold text-[#1e1e2d]">{value}</span>
  </div>
);

export default CompanyAuthentication;