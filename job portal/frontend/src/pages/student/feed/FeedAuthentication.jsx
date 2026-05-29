// import React, { useState } from "react";
// import { Button, Input, Label } from "../../../components/ui";
// import MainLayout from "../../../components/layout/MainLayout";
// import FeedRightSidebar from "../feed/FeedRightSidebar";
// import { sendOtp, verifyOtp, updateAadhaarDetails } from "../../../api/authenticationApi"; 
// import { useSelector } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import { FaEnvelope, FaPhoneAlt, FaCheckCircle, FaShieldAlt } from "react-icons/fa";
// import { IoIosArrowBack } from "react-icons/io";
// import { Loader2 } from "lucide-react";

// const FeedAuthentication = () => {
//   const navigate = useNavigate();
//   const [phoneNumber, setPhoneNumber] = useState("+91 XXXXXXXXXX");
//   const [phoneOtp, setPhoneOtp] = useState("");
//   const [aadhar_number, setAadharNumber] = useState("");
//   const [dateOfBirth, setDateOfBirth] = useState("");
//   const [linkedPhoneNumber, setLinkedPhoneNumber] = useState("+91 XXXXXXXXXX");
//   const [aadharOtp, setAadharOtp] = useState("");
//   const [aadhaarFile, setAadhaarFile] = useState(null);
//   const [email, setEmail] = useState("");
//   const [phoneResendTime, setPhoneResendTime] = useState(15);
//   const [aadharResendTime, setAadharResendTime] = useState(15);
//   const [isEditingEmail, setIsEditingEmail] = useState(false);

//   // get token from redux (assuming auth slice has it)
//   const token = useSelector((state) => state.auth?.token);

//   // ================= PHONE =================
//   const handleSendPhoneOtp = async () => {
//     try {
//       const res = await sendOtp(phoneNumber, token);
//       alert(res.message || "OTP sent!");
//     } catch (error) {
//       alert("Failed to send OTP");
//     }
//   };

//   const handleVerifyPhone = async () => {
//     try {
//       const res = await verifyOtp(phoneNumber, phoneOtp, token);
//       alert(res.message || "Phone verified!");
//     } catch (error) {
//       alert("Failed to verify phone");
//     }
//   };

//   // ================= AADHAAR =================
//   const handleFileUpload = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       setAadhaarFile(file);
//       console.log("File uploaded:", file.name);
//     }
//   };

//   const handleSendAadharOtp = async () => {
//     try {
//       const res = await sendOtp(linkedPhoneNumber, token); // reuse sendOtp API
//       alert(res.message || "Aadhaar OTP sent!");
//     } catch (error) {
//       alert("Failed to send Aadhaar OTP");
//     }
//   };

//   const handleVerifyAadhar = async () => {
//     try {
//       const res = await verifyOtp(linkedPhoneNumber, aadharOtp, token); // reuse verifyOtp API
//       alert(res.message || "Aadhaar phone verified!");
//     } catch (error) {
//       alert("Failed to verify Aadhaar");
//     }
//   };

//   const handleSaveChanges = async () => {
//     try {
//       const data = {
//         aadhaar_number: aadhar_number,
//         dob: dateOfBirth,
//         linkedPhoneNumber: linkedPhoneNumber,
//         aadharOtp: aadharOtp,
//         aadhaar_card_file: aadhaarFile
//       };
//       const res = await updateAadhaarDetails(data, token);
//       alert(res.message || "Aadhaar details updated!");
//     } catch (error) {
//       alert("Failed to update Aadhaar details");
//     }
//   };

//   // ================= EMAIL ============= ====
//   // const handleEditEmail = () => {
//   //   setIsEditingEmail(true);
//   // };

//   const handleSaveEmail = async () => {
//     try {
//       const res = await updateEmail(newEmail, token);
//       if (res.message) {
//         setEmail(newEmail);
//         setIsEditingEmail(false);
//         alert(res.message);
//       } else {
//         alert("Failed to update email");
//       }
//     } catch (error) {
//       alert("Error while updating email");
//     }
//   };

//   const handleCancelEmail = () => {
//     setNewEmail(email);
//     setIsEditingEmail(false);
//   };

//   const inputCls = "w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9bc87c] focus:border-transparent transition";

//   return (
//     <MainLayout>
//       <div className="flex flex-col min-h-screen bg-gray-100">
//         <section className="w-full px-4 py-6 mx-auto max-w-7xl">

//           <div className="w-full mx-auto bg-white rounded-2xl shadow-sm border border-gray-100">

//             {/* Header */}
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
//                 Verify your email, phone and Aadhaar to complete your student profile.
//               </p>
//             </div>

//             <div className="p-4 sm:p-6 space-y-4">

//               {/* ===== EMAIL ID DISPLAY SECTION ===== */}
//               <div className="overflow-hidden bg-white shadow-sm rounded-xl border border-gray-100 transition-all">
//                 <div className="flex items-center justify-between p-4 border-b border-gray-100">
//                   <div className="flex items-center gap-3">
//                     <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#e6f4dc]">
//                       <FaEnvelope className="text-[#5a7d3d]" size={14} />
//                     </div>
//                     <h3 className="text-lg font-extrabold text-[#1e1e2d]">Email ID</h3>
//                   </div>
//                 </div>

//                 <div className="p-4 bg-gray-50/30">
//                   <Label className="block text-sm font-bold text-gray-700 mb-1.5">
//                     Email Address
//                   </Label>
                  
//                   {isEditingEmail ? (
//                     <div className="flex flex-col gap-2 mb-3 sm:flex-row">
//                       <div className="flex-1">
//                         <Input
//                           type="email"
//                           value={newEmail}
//                           onChange={(e) => setNewEmail(e.target.value)}
//                           className={inputCls}
//                         />
//                       </div>
//                       <div className="flex gap-2">
//                         <Button
//                           variant="secondary"
//                           size="small"
//                           className="px-5 h-10 text-white !bg-[#9bc87c] hover:!bg-[#8ab76b] font-bold rounded-lg transition"
//                           onClick={handleSaveEmail}
//                         >
//                           Save
//                         </Button>
//                         <Button
//                           variant="secondary"
//                           size="small"
//                           className="px-5 h-10 text-white !bg-gray-400 hover:!bg-gray-500 font-bold rounded-lg transition"
//                           onClick={handleCancelEmail}
//                         >
//                           Cancel
//                         </Button>
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
//                       <p className="text-sm font-semibold text-gray-800">{email}</p>
//                       {/* <button
//                         onClick={() => setIsEditingEmail(true)}
//                         className="text-xs font-bold text-[#9bc87c] hover:text-[#8ab76b] hover:underline"
//                       >
//                         Edit/Change
//                       </button> */}
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
//                         onChange={(e) => setPhoneNumber(e.target.value)}
//                         placeholder="+91 XXXXXXXXXX"
//                         className={inputCls}
//                       />
//                     </div>
//                     <Button
//                       type="button"
//                       variant="secondary"
//                       size="small"
//                       className="px-5 h-10 text-white !bg-[#9bc87c] hover:!bg-[#8ab76b] font-bold rounded-lg transition"
//                       onClick={handleSendPhoneOtp}
//                     >
//                       Send OTP
//                     </Button>
//                   </div>

//                   <div className="pt-3 mt-3 border-t border-gray-200">
//                     <Label htmlFor="phoneOtp" className="block text-sm font-bold text-gray-700 mb-1.5">
//                       Enter OTP
//                     </Label>
//                     <Input
//                       id="phoneOtp"
//                       value={phoneOtp}
//                       onChange={(e) => setPhoneOtp(e.target.value)}
//                       placeholder="4 Digit Number"
//                       maxLength={4}
//                       className={`${inputCls} mb-3 tracking-widest text-center font-mono`}
//                     />
//                     <Button
//                       type="button"
//                       variant="primary"
//                       size="default"
//                       className="w-full mb-2 !bg-[#9bc87c] hover:!bg-[#8ab76b] !text-white font-bold rounded-lg"
//                       onClick={handleVerifyPhone}
//                     >
//                       Verify Phone Number
//                     </Button>
//                     <p className="text-xs text-center text-gray-500">
//                       Resend code in <span className="font-bold text-[#5a7d3d]">{phoneResendTime}s</span>
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* ===== AADHAAR CARD VERIFICATION ===== */}
//               <div className="overflow-hidden bg-white shadow-sm rounded-xl border border-gray-100 transition-all">
//                 <div className="flex items-center justify-between p-4 border-b border-gray-100">
//                   <div className="flex items-center gap-3">
//                     <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#e6f4dc]">
//                       <FaShieldAlt className="text-[#5a7d3d]" size={14} />
//                     </div>
//                     <h3 className="text-lg font-extrabold text-[#1e1e2d]">Aadhaar Verification</h3>
//                   </div>
//                 </div>

//                 <div className="p-4 bg-gray-50/30">
//                   <Label htmlFor="aadhar_number" className="block text-sm font-bold text-gray-700 mb-1.5">
//                     Aadhaar Card Number
//                   </Label>
//                   <Input
//                     id="aadhar_number"
//                     value={aadhar_number}
//                     onChange={(e) => setAadharNumber(e.target.value)}
//                     placeholder="12 Digit Aadhaar Number"
//                     maxLength={12}
//                     className={`${inputCls} mb-4`}
//                   />

//                   <Label htmlFor="dateOfBirth" className="block text-sm font-bold text-gray-700 mb-1.5">
//                     Date of Birth
//                   </Label>
//                   <Input
//                     id="dateOfBirth"
//                     type="date"
//                     value={dateOfBirth}
//                     onChange={(e) => setDateOfBirth(e.target.value)}
//                     className={`${inputCls} mb-4`}
//                   />

//                   <Label htmlFor="fileUpload" className="block text-sm font-bold text-gray-700 mb-1.5">
//                     Upload Aadhaar Document
//                   </Label>
//                   <div className="border-2 border-dashed border-gray-300 bg-white rounded-xl p-6 text-center hover:border-[#9bc87c] transition-colors mb-4">
//                     <input
//                       id="fileUpload"
//                       type="file"
//                       onChange={handleFileUpload}
//                       className="hidden"
//                     />
//                     <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center">
//                       <svg
//                         className="w-8 h-8 text-gray-400 mb-2 group-hover:text-[#9bc87c]"
//                         fill="none"
//                         stroke="currentColor"
//                         viewBox="0 0 24 24"
//                       >
//                         <path
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth={2}
//                           d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
//                         />
//                       </svg>
//                       <span className="text-sm font-semibold text-gray-600">
//                         {aadhaarFile ? aadhaarFile.name : "Browse file to upload"}
//                       </span>
//                     </label>
//                   </div>

//                   <div className="pt-3 mt-3 border-t border-gray-200">
//                     <Label htmlFor="linkedPhoneNumber" className="block text-sm font-bold text-gray-700 mb-1.5">
//                       Linked Phone Number
//                     </Label>
//                     <div className="flex flex-col gap-2 mb-3 sm:flex-row">
//                       <div className="flex-1">
//                         <Input
//                           id="linkedPhoneNumber"
//                           value={linkedPhoneNumber}
//                           onChange={(e) => setLinkedPhoneNumber(e.target.value)}
//                           placeholder="+91 XXXXXXXXXX"
//                           className={inputCls}
//                         />
//                       </div>
//                       <Button
//                         type="button"
//                         variant="secondary"
//                         size="small"
//                         className="px-5 h-10 text-white !bg-[#9bc87c] hover:!bg-[#8ab76b] font-bold rounded-lg transition"
//                         onClick={handleSendAadharOtp}
//                       >
//                         Send OTP
//                       </Button>
//                     </div>

//                     <Label htmlFor="aadharOtp" className="block text-sm font-bold text-gray-700 mb-1.5 mt-3">
//                       Enter OTP
//                     </Label>
//                     <Input
//                       id="aadharOtp"
//                       value={aadharOtp}
//                       onChange={(e) => setAadharOtp(e.target.value)}
//                       placeholder="6 Digit Number"
//                       maxLength={6}
//                       className={`${inputCls} mb-3 tracking-widest text-center font-mono`}
//                     />
//                     <Button
//                       type="button"
//                       variant="primary"
//                       size="default"
//                       className="w-full mb-2 !bg-[#9bc87c] hover:!bg-[#8ab76b] !text-white font-bold rounded-lg"
//                       onClick={handleVerifyAadhar}
//                     >
//                       Verify Aadhaar Card
//                     </Button>
//                     <p className="text-xs text-center text-gray-500">
//                       Resend code in <span className="font-bold text-[#5a7d3d]">{aadharResendTime}s</span>
//                     </p>
//                   </div>

//                   <div className="pt-3 mt-4 border-t border-gray-200">
//                     <Button
//                       type="button"
//                       variant="danger"
//                       size="large"
//                       className="w-full !bg-[#1e1e2d] hover:!bg-black !text-white font-bold rounded-lg h-12"
//                       onClick={handleSaveChanges}
//                     >
//                       Save Aadhaar Details
//                     </Button>
//                   </div>
//                 </div>
//               </div>

//             </div>
//           </div>
//         </section>
//       </div>
//     </MainLayout>
//   );
// };

// export default FeedAuthentication;











// src/pages/feed/FeedAuthentication.jsx
import React, { useState, useEffect } from "react";
import { Button, Input, Label } from "../../../components/ui";
import MainLayout from "../../../components/layout/MainLayout";
import { sendOtp, verifyOtp, updateAadhaarDetails } from "../../../api/authenticationApi"; 
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaPhoneAlt, FaCheckCircle, FaShieldAlt } from "react-icons/fa";
import { IoIosArrowBack } from "react-icons/io";
import { Loader2 } from "lucide-react";

const FeedAuthentication = () => {
  const navigate = useNavigate();
  
  // Get user and token from redux
  const { user, token } = useSelector((state) => state.auth || {});

  // ===== Email verification state =====
  const [email, setEmail] = useState(user?.email || "");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailTimer, setEmailTimer] = useState(60);
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [emailVerified, setEmailVerified] = useState(() => Boolean(user?.is_email_verified));

  // ===== Phone verification state =====
  const [phoneNumber, setPhoneNumber] = useState(user?.mobile || "");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneSent, setPhoneSent] = useState(false);
  const [phoneTimer, setPhoneTimer] = useState(60);
  const [phoneVerified, setPhoneVerified] = useState(() => Boolean(user?.is_phone_verified));
  const [phoneVerifying, setPhoneVerifying] = useState(false);
  const [phoneSending, setPhoneSending] = useState(false);

  // ===== Aadhaar verification state =====
  const [aadhar_number, setAadharNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [linkedPhoneNumber, setLinkedPhoneNumber] = useState("");
  const [aadharOtp, setAadharOtp] = useState("");
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [aadharSent, setAadharSent] = useState(false);
  const [aadharTimer, setAadharTimer] = useState(60);
  const [aadharVerifying, setAadharVerifying] = useState(false);
  const [aadharVerified, setAadharVerified] = useState(false);

  // Keep flags in sync if Redux user changes elsewhere
  useEffect(() => {
    if (user?.is_phone_verified) setPhoneVerified(true);
  }, [user?.is_phone_verified]);

  useEffect(() => {
    if (user?.is_email_verified) setEmailVerified(true);
  }, [user?.is_email_verified]);

  // Timers
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

  useEffect(() => {
    if (aadharSent && aadharTimer > 0) {
      const interval = setInterval(() => setAadharTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [aadharSent, aadharTimer]);

  // ================= EMAIL HANDLERS =================
  const handleSendEmailOtp = async () => {
    setEmailLoading(true);
    try {
      // Add your actual email OTP send API call here
      // const res = await sendEmailOtp(email, token); 
      setEmailSent(true);
      setEmailTimer(60);
      alert("Email OTP sent!");
    } catch (error) {
      alert("Failed to send Email OTP");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setEmailVerifying(true);
    try {
      // Add your actual email OTP verify API call here
      // const res = await verifyEmailOtp(email, emailOtp, token);
      setEmailVerified(true);
      setEmailSent(false);
      alert("Email verified!");
    } catch (error) {
      alert("Failed to verify Email");
    } finally {
      setEmailVerifying(false);
    }
  };

  // ================= PHONE HANDLERS =================
  const handleSendPhoneOtp = async () => {
    setPhoneSending(true);
    try {
      const res = await sendOtp(phoneNumber, token);
      setPhoneSent(true);
      setPhoneTimer(60);
      alert(res.message || "OTP sent!");
    } catch (error) {
      alert("Failed to send OTP");
    } finally {
      setPhoneSending(false);
    }
  };

  const handleVerifyPhone = async () => {
    setPhoneVerifying(true);
    try {
      const res = await verifyOtp(phoneNumber, phoneOtp, token);
      setPhoneVerified(true);
      setPhoneSent(false);
      alert(res.message || "Phone verified!");
    } catch (error) {
      alert("Failed to verify phone");
    } finally {
      setPhoneVerifying(false);
    }
  };

  // ================= AADHAAR HANDLERS =================
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAadhaarFile(file);
    }
  };

  const handleSendAadharOtp = async () => {
    try {
      const res = await sendOtp(linkedPhoneNumber, token);
      setAadharSent(true);
      setAadharTimer(60);
      alert(res.message || "Aadhaar OTP sent!");
    } catch (error) {
      alert("Failed to send Aadhaar OTP");
    }
  };

  const handleVerifyAadhar = async () => {
    setAadharVerifying(true);
    try {
      const res = await verifyOtp(linkedPhoneNumber, aadharOtp, token);
      setAadharVerified(true);
      setAadharSent(false);
      alert(res.message || "Aadhaar phone verified!");
    } catch (error) {
      alert("Failed to verify Aadhaar");
    } finally {
      setAadharVerifying(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const data = {
        aadhaar_number: aadhar_number,
        dob: dateOfBirth,
        linkedPhoneNumber: linkedPhoneNumber,
        aadharOtp: aadharOtp,
        aadhaar_card_file: aadhaarFile
      };
      const res = await updateAadhaarDetails(data, token);
      alert(res.message || "Aadhaar details updated!");
    } catch (error) {
      alert("Failed to update Aadhaar details");
    }
  };

  const inputCls = "w-full p-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9bc87c] focus:border-transparent transition disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200";

  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <section className="w-full px-4 py-6 mx-auto max-w-7xl">
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
                Verify your email, phone and Aadhaar to complete your student profile.
              </p>
            </div>

            <div className="p-4 sm:p-6 space-y-4">

              {/* ===== EMAIL VERIFICATION SECTION ===== */}
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
                  <Label className="block text-sm font-bold text-gray-700 mb-1.5">
                    Email Address
                  </Label>
                  <div className="flex flex-col gap-2 mb-3 sm:flex-row">
                    <div className="flex-1">
                      <Input
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
                      ) : emailVerified ? "Verified" : emailSent ? "Sent!" : "Send OTP"}
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
                        className="w-full mb-2 !bg-[#9bc87c] hover:!bg-[#8ab76b] !text-white font-bold rounded-lg"
                        onClick={handleVerifyEmail}
                        disabled={emailVerifying || !emailOtp.trim() || emailOtp.length !== 4}
                      >
                        {emailVerifying ? (
                          <span className="flex items-center justify-center gap-1.5">
                            <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                          </span>
                        ) : (
                          "Verify Email"
                        )}
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
                        placeholder="10 Digit Number"
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
                        maxLength={4} // Note: Ensure this matches your API expectations
                        className={`${inputCls} mb-3 tracking-widest text-center font-mono`}
                      />
                      <Button
                        type="button"
                        variant="primary"
                        className="w-full mb-2 !bg-[#9bc87c] hover:!bg-[#8ab76b] !text-white font-bold rounded-lg"
                        onClick={handleVerifyPhone}
                        disabled={phoneVerifying || !phoneOtp.trim()}
                      >
                        {phoneVerifying ? (
                          <span className="flex items-center justify-center gap-1.5">
                            <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                          </span>
                        ) : (
                          "Verify Phone Number"
                        )}
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

              {/* ===== AADHAAR CARD VERIFICATION ===== */}
              <div className="overflow-hidden bg-white shadow-sm rounded-xl border border-gray-100 transition-all">
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#e6f4dc]">
                      <FaShieldAlt className="text-[#5a7d3d]" size={14} />
                    </div>
                    <h3 className="text-lg font-extrabold text-[#1e1e2d]">Aadhaar Verification</h3>
                  </div>
                  {aadharVerified && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full bg-[#e6f4dc] text-[#1DB32F] border border-[#9bc87c]">
                      <FaCheckCircle size={12} /> Verified
                    </span>
                  )}
                </div>

                <div className="p-4 bg-gray-50/30">
                  <Label htmlFor="aadhar_number" className="block text-sm font-bold text-gray-700 mb-1.5">
                    Aadhaar Card Number
                  </Label>
                  <Input
                    id="aadhar_number"
                    value={aadhar_number}
                    onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="12 Digit Aadhaar Number"
                    maxLength={12}
                    disabled={aadharVerified}
                    className={`${inputCls} mb-4`}
                  />

                  <Label htmlFor="dateOfBirth" className="block text-sm font-bold text-gray-700 mb-1.5">
                    Date of Birth
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    disabled={aadharVerified}
                    className={`${inputCls} mb-4`}
                  />

                  <Label htmlFor="fileUpload" className="block text-sm font-bold text-gray-700 mb-1.5">
                    Upload Aadhaar Document
                  </Label>
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors mb-4 ${aadharVerified ? 'opacity-60 bg-gray-100 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-300 hover:border-[#9bc87c]'}`}>
                    <input
                      id="fileUpload"
                      type="file"
                      onChange={handleFileUpload}
                      disabled={aadharVerified}
                      className="hidden"
                    />
                    <label htmlFor="fileUpload" className={`flex flex-col items-center ${aadharVerified ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                      <svg
                        className="w-8 h-8 text-gray-400 mb-2 group-hover:text-[#9bc87c]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span className="text-sm font-semibold text-gray-600">
                        {aadhaarFile ? aadhaarFile.name : "Browse file to upload"}
                      </span>
                    </label>
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-200">
                    <Label htmlFor="linkedPhoneNumber" className="block text-sm font-bold text-gray-700 mb-1.5">
                      Linked Phone Number
                    </Label>
                    <div className="flex flex-col gap-2 mb-3 sm:flex-row">
                      <div className="flex-1">
                        <Input
                          id="linkedPhoneNumber"
                          value={linkedPhoneNumber}
                          onChange={(e) => setLinkedPhoneNumber(e.target.value.replace(/\D/g, ""))}
                          placeholder="10 Digit Number"
                          maxLength={10}
                          disabled={aadharSent || aadharVerified}
                          className={inputCls}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="small"
                        className="px-5 h-10 text-white !bg-[#9bc87c] hover:!bg-[#8ab76b] disabled:!bg-gray-300 font-bold rounded-lg transition"
                        onClick={handleSendAadharOtp}
                        disabled={aadharSent || aadharVerified || !linkedPhoneNumber.trim()}
                      >
                        {aadharVerified ? "Verified" : aadharSent ? "Sent!" : "Send OTP"}
                      </Button>
                    </div>

                    {aadharSent && !aadharVerified && (
                      <div className="mt-3">
                        <Label htmlFor="aadharOtp" className="block text-sm font-bold text-gray-700 mb-1.5">
                          Enter OTP
                        </Label>
                        <Input
                          id="aadharOtp"
                          value={aadharOtp}
                          onChange={(e) => setAadharOtp(e.target.value.replace(/\D/g, ""))}
                          placeholder="6-Digit Code"
                          maxLength={6}
                          className={`${inputCls} mb-3 tracking-widest text-center font-mono`}
                        />
                        <Button
                          type="button"
                          variant="primary"
                          className="w-full mb-2 !bg-[#9bc87c] hover:!bg-[#8ab76b] !text-white font-bold rounded-lg"
                          onClick={handleVerifyAadhar}
                          disabled={aadharVerifying || !aadharOtp.trim()}
                        >
                          {aadharVerifying ? (
                            <span className="flex items-center justify-center gap-1.5">
                              <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                            </span>
                          ) : (
                            "Verify Aadhaar Card"
                          )}
                        </Button>
                        <p className="text-xs text-center text-gray-500">
                          {aadharTimer > 0 ? (
                            <span>Resend code in <span className="font-bold text-[#5a7d3d]">{aadharTimer}s</span></span>
                          ) : (
                            <button
                              type="button"
                              className="font-bold text-[#9bc87c] hover:text-[#8ab76b] hover:underline"
                              onClick={() => { handleSendAadharOtp(); setAadharTimer(60); }}
                            >
                              Resend OTP
                            </button>
                          )}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Save final details to Database */}
                  <div className="pt-3 mt-4 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="danger"
                      size="large"
                      className="w-full !bg-[#1e1e2d] hover:!bg-black !text-white font-bold rounded-lg h-12 disabled:!bg-gray-300"
                      onClick={handleSaveChanges}
                      disabled={!aadharVerified}
                    >
                      Save Verification Details
                    </Button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default FeedAuthentication;