

// import React, { useState, useEffect } from "react";
// import { FaEnvelope, FaPencilAlt } from "react-icons/fa";
// import axios from "axios";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { verifyOtpAndLogin } from "../../redux/feature/authSlice";
// import { Link } from "../../components/ui";
// import AuthLayout from "../../components/layout/AuthLayout";
// import AuthLayoutSimple from "../../components/layout/AuthLayoutSimple";

// const BASE_URL = import.meta.env.VITE_BASE_URL;

// export default function SignUpVerifyOtpEmail() {

//   const [loading, setLoading] = useState(false);
//   const [otpError, setOtpError] = useState("");
//   const [resendTimer, setResendTimer] = useState(0);
//   const [resendLoading, setResendLoading] = useState(false);


//   const navigate = useNavigate();
//   const location = useLocation();
//   const dispatch = useDispatch();

//   const email = location.state?.email || null;

//   // Timer countdown
//   useEffect(() => {
//     if (resendTimer <= 0) return;
//     const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
//     return () => clearInterval(interval);
//   }, [resendTimer]);

//   const submitOtp = async (otp) => {
//     setLoading(true);
//     setOtpError("");
//     try {
//       await dispatch(verifyOtpAndLogin({ email, otp })).unwrap();
//       navigate("/login", { replace: true });
//     } catch (error) {
//       setOtpError(
//         typeof error === "string" ? error : "Verification failed. Please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleChange = (index, e) => {
    
//   };

//   const handleKeyDown = (index, e) => {
//     if (e.key === "Backspace") {
     
//     }
//     if (e.key === "ArrowLeft" && index > 0) refs[index - 1].current?.focus();
//     if (e.key === "ArrowRight" && index < 3) refs[index + 1].current?.focus();
//   };

//   const handlePaste = (e) => {
//     e.preventDefault();
  
   
//   };

//   const handleManualSubmit = (e) => {
//     e.preventDefault();
//     const otp = digits.join("");
//     if (otp.length !== 4) {
//       setOtpError("Please enter all 4 digits.");
//       return;
//     }
//     submitOtp(otp);
//   };

//   const handleResend = async () => {
//     if (!email) { setOtpError("Email not found. Go back and try again."); return; }
//     setResendLoading(true);
//     setOtpError("");
//     try {
//       await axios.post(`${BASE_URL}/otp/send-otp`, { email });
//       setResendTimer(15);
//     } catch (error) {
//       const msg = error?.response?.data?.message || "";
//       const timeMatch = msg.match(/(\d+)\s*seconds?/i);
//       if (timeMatch) setResendTimer(parseInt(timeMatch[1]));
//       else setOtpError(msg || "Failed to resend OTP. Please try again.");
//     } finally {
//       setResendLoading(false);
//     }
//   };

//   const otp = digits.join("");

//   return (
//     // <AuthLayoutSimple
//     //   heading="Verify Your Email"
//     //   subheading="Create an account to continue!"
//     //   hideMobileIllustration={true}
//     // >
//       <div className="flex justify-center flex-1 w-full mt-6 md:mt-0">
//         <form
//           onSubmit={handleManualSubmit}
//           className="w-full max-w-full p-4 bg-white rounded-lg shadow-sm sm:shadow-md sm:p-6 sm:max-w-sm md:max-w-md"
//         >
//           {/* Email info */}
//           <div className="mb-4">
//             <p className="text-xs text-gray-600">
//               OTP sent to{" "}
//               <span className="font-bold text-blue-500">{email || "your email"}</span>
//               <button
//                 type="button"
//                 onClick={() =>
//                   navigate("/signup", {
//                     state: {
//                       prefilledData: {
//                         first_name: location.state?.first_name || "",
//                         last_name: location.state?.last_name || "",
//                         phone: location.state?.phone || "",
//                         email: location.state?.email || "",
//                         password: location.state?.password || "",
//                         user_role: location.state?.user_role || "STUDENT",
//                       },
//                       selectedRole: location.state?.user_role || "STUDENT",
//                     },
//                   })
//                 }
//                 className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
//                 aria-label="Edit email"
//               >
//                 <FaPencilAlt size={12} />
//               </button>
//             </p>
//           </div>

//           {/* Label + Resend row */}
//           <div className="flex items-center justify-between mb-3">
//             <label className="text-sm font-medium text-gray-700">
//               Enter OTP
//             </label>
//             <div>
//               {resendTimer > 0 ? (
//                 <p className="text-xs text-gray-500">
//                   Resend in <span className="font-medium text-gray-700">{resendTimer}s</span>
//                 </p>
//               ) : (
//                 <button
//                   type="button"
//                   onClick={handleResend}
//                   disabled={resendLoading}
//                   className="text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-60"
//                 >
//                   {resendLoading ? "Sending..." : "Resend OTP"}
//                 </button>
//               )}
//             </div>
//           </div>

//           {/* OTP boxes */}
//           <div className="flex justify-center gap-2 mb-3" onPaste={handlePaste}>
//            {/* 4 boxes for otp digit enter */}
//               <input
                
//                 className={`w-full h-12 text-center text-lg font-semibold border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${otpError ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
//                   }`}
//               />
           
//           </div>

//           {/* Errors */}
//           {otpError && (
//             <p className="mb-2 text-xs text-center text-red-500">{otpError}</p>
//           )}
//           {!otpError && (
//             <p className="mb-2 text-xs text-center text-gray-500">
//               Enter the 4-digit verification code
//             </p>
//           )}

//           {/* Submit */}
//           <button
//             type="submit"
//             disabled={loading || otp.length !== 4}
//             className="w-full py-2 mb-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
//           >
//             {loading ? "Verifying..." : "Verify Email"}
//           </button>

//           {/* Help */}
//           <div className="p-2 mb-3 rounded-md bg-gray-50">
//             <p className="text-xs text-center text-gray-600">
//               <FaEnvelope className="inline mr-1 text-gray-400" />
//               Can't find our email? Check spam or promotions tab.
//             </p>
//           </div>

//           {/* Login link */}
//           <div className="pt-2 text-center border-t border-gray-200">
//             <p className="text-xs text-gray-500">
//               Already have an account?{" "}
//               <Link to="/login" variant="primary">Login</Link>
//             </p>
//           </div>
//         </form>
//       {/* </AuthLayoutSimple> */}
//       </div>
   
//   );
// }










































import React, { useState, useRef, useEffect } from "react";
import { FaEnvelope, FaPencilAlt } from "react-icons/fa";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { verifyOtpAndLogin } from "../../redux/feature/authSlice";
import { API_BASE_URL } from "../../config/api";
import { Link } from "../../components/ui";
import AuthLayout from "../../components/layout/AuthLayout";
import AuthLayoutSimple from "../../components/layout/AuthLayoutSimple";
import { LoginButton } from "../../components/loginComponents/LoginButton";

const BASE_URL = API_BASE_URL;

function routeAfterAuth(user) {
  switch (user?.user_role) {
    case "STUDENT":
      return "/student-fill-account-details";
    case "COMPANY":
      return "/recruiter-fill-account-details";
    case "UNIVERSITY":
      return "/university-fill-account-details";
    default:
      return "/dashboard";
  }
}

export default function SignUpVerifyOtpEmail() {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  const refs = [useRef(), useRef(), useRef(), useRef()];
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const email = location.state?.email || null;

  // Timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const submitOtp = async (otp) => {
    setLoading(true);
    setOtpError("");
    try {
      const result = await dispatch(verifyOtpAndLogin({ email, otp })).unwrap();
      navigate(routeAfterAuth(result.user), { replace: true });
    } catch (error) {
      setOtpError(
        typeof error === "string" ? error : "Verification failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (index, e) => {
    const raw = e.target.value.replace(/\D/g, "");
    if (!raw && e.target.value !== "") return; // blocked non-digit

    const value = raw.slice(-1); // take last digit typed
    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);
    setOtpError("");

    if (value) {
      if (index < 3) {
        refs[index + 1].current?.focus();
      } else {
        // 4th digit filled — auto submit
        const otp = newDigits.join("");
        if (otp.length === 4) submitOtp(otp);
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const newDigits = [...digits];
        newDigits[index] = "";
        setDigits(newDigits);
      } else if (index > 0) {
        refs[index - 1].current?.focus();
      }
    }
    if (e.key === "ArrowLeft" && index > 0) refs[index - 1].current?.focus();
    if (e.key === "ArrowRight" && index < 3) refs[index + 1].current?.focus();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;
    const newDigits = ["", "", "", ""];
    pasted.split("").forEach((d, i) => { newDigits[i] = d; });
    setDigits(newDigits);
    const nextFocus = Math.min(pasted.length, 3);
    refs[nextFocus].current?.focus();
    if (pasted.length === 4) submitOtp(pasted);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length !== 4) {
      setOtpError("Please enter all 4 digits.");
      return;
    }
    submitOtp(otp);
  };

  const handleResend = async () => {
    if (!email) { setOtpError("Email not found. Go back and try again."); return; }
    setResendLoading(true);
    setOtpError("");
    try {
      await axios.post(`${BASE_URL}/otp/send-otp`, { email });
      setResendTimer(15);
    } catch (error) {
      const msg = error?.response?.data?.message || "";
      const timeMatch = msg.match(/(\d+)\s*seconds?/i);
      if (timeMatch) setResendTimer(parseInt(timeMatch[1]));
      else setOtpError(msg || "Failed to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const otp = digits.join("");

  return (
    <AuthLayout
      heading="Verify Your Email"
      subheading="Create an account to continue!"
      hideMobileIllustration={true}
    >
      <div className="flex justify-center flex-1 w-full mt-6 md:mt-0">
        {/* <form
          onSubmit={handleManualSubmit}
          className="w-full max-w-full p-4 bg-white rounded-lg shadow-sm sm:shadow-md sm:p-6 sm:max-w-sm md:max-w-md"
        > */}

        <form
  onSubmit={handleManualSubmit}
  className="w-full max-w-full p-4 bg-white rounded-lg shadow-sm border-2 border-[#00C950] sm:shadow-md sm:p-6 sm:max-w-sm md:max-w-md"
>
          {/* Email info */}
          <div className="mb-4">
            <p className="text-xs text-gray-600">
              OTP sent to{" "}
              {/* <span className="font-bold text-blue-500">{email || "your email"}</span> */}
              <span className="font-bold text-[#1DB32F]">{email || "your email"}</span>
              <button
                type="button"
                onClick={() =>
                  navigate("/signup", {
                    state: {
                      prefilledData: {
                        first_name: location.state?.first_name || "",
                        last_name: location.state?.last_name || "",
                        phone: location.state?.phone || "",
                        email: location.state?.email || "",
                        password: location.state?.password || "",
                        user_role: location.state?.user_role || "STUDENT",
                      },
                      selectedRole: location.state?.user_role || "STUDENT",
                    },
                  })
                }
                className="ml-2 text-blue-500 hover:text-blue-700 focus:outline-none"
                aria-label="Edit email"
              >
                <FaPencilAlt size={12} />
              </button>
            </p>
          </div>

          {/* Label + Resend row */}
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-700">
              Enter OTP
            </label>
            <div>
              {resendTimer > 0 ? (
                <p className="text-xs text-gray-500">
                  Resend in <span className="font-medium text-gray-700">{resendTimer}s</span>
                </p>
              ) : (
                // <button
                //   type="button"
                //   onClick={handleResend}
                //   disabled={resendLoading}
                //   className="text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-60"
                // >
                //   {resendLoading ? "Sending..." : "Resend OTP"}
                // </button>

                <button
  type="button"
  onClick={handleResend}
  disabled={resendLoading}
  className="text-xs font-medium text-[#1DB32F] hover:text-[#00C950] disabled:opacity-60"
>
  {resendLoading ? "Sending..." : "Resend OTP"}
</button>
              )}
            </div>
          </div>

          {/* OTP boxes */}
          <div className="flex justify-center gap-2 mb-3" onPaste={handlePaste}>
            {[0, 1, 2, 3].map((index) => (
              <input
                key={index}
                ref={refs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                autoComplete={index === 0 ? "one-time-code" : "off"}
                disabled={loading}
                value={digits[index]}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={(e) => e.target.select()}
                placeholder="0"
                // className={`w-full h-12 text-center text-lg font-semibold border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${otpError ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
                //   }`}
                className={`w-full h-12 text-center text-lg font-semibold border rounded-md focus:outline-none focus:ring-2 focus:ring-[#1DB32F] focus:border-[#1DB32F] ${
  otpError ? "border-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
}`}
              />
            ))}
          </div>

          {/* Errors */}
          {otpError && (
            <p className="mb-2 text-xs text-center text-red-500">{otpError}</p>
          )}
          {!otpError && (
            <p className="mb-2 text-xs text-center text-gray-500">
              Enter the 4-digit verification code
            </p>
          )}

          {/* Submit */}
          {/* <button
            type="submit"
            disabled={loading || otp.length !== 4}
            className="w-full py-2 mb-3 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button> */}
          
<LoginButton loading={loading} type="submit">
  Verify Email
</LoginButton>

          {/* Help */}
          <div className="p-2 mb-3 rounded-md bg-gray-50">
            <p className="text-xs text-center text-gray-600">
              <FaEnvelope className="inline mr-1 text-gray-400" />
              Can't find our email? Check spam or promotions tab.
            </p>
          </div>

          {/* Login link */}
          <div className="pt-2 text-center border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Already have an account?{" "}
              <Link to="/login" variant="primary">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}