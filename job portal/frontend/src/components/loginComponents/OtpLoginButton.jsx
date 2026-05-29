import React from "react";
import { Link } from "react-router-dom";

export const OtpLoginButton = ({
  loading = false,
  to = "/login-send-otp-email",
  children = "Login with OTP",
  className = "",
  ...props
}) => {
  return (
    <Link
      to={to}
      aria-disabled={loading}
      onClick={(e) => {
        if (loading) e.preventDefault();
      }}
      className={`flex items-center justify-center w-full mb-3 
bg-white border border-[#9bc87c] hover:bg-[#f6fbf3] 
text-[#1e1e2d] rounded-lg shadow-sm transition-colors duration-200 py-2.5 
${loading ? "opacity-70 cursor-not-allowed" : ""} ${className}`}
      {...props}
    >
      <span className="text-sm font-medium">{children}</span>
    </Link>
  );
};
