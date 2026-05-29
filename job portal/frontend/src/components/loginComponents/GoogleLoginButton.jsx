import React from "react";
import { FcGoogle } from "react-icons/fc";

export const GoogleLoginButton = ({
  loading = false,
  baseUrl = import.meta.env.VITE_BASE_URL,
  children = "Continue with Google",
  className = "",
  onClick,
  ...props
}) => {
  const handleClick = (e) => {
    if (onClick) return onClick(e);
    window.location.href = `${baseUrl}/users/google`;
  };

  return (
    <button
      type="button"
      disabled={loading}
      onClick={handleClick}
      className={`flex items-center justify-center w-full mb-3 
bg-white border border-[#9bc87c] hover:bg-[#f6fbf3] 
text-[#1e1e2d] rounded-lg shadow-sm transition-colors duration-200 py-2.5 
${loading ? "opacity-70 cursor-not-allowed" : ""} ${className}`}
      {...props}
    >
      <FcGoogle size={18} className="mr-2" />
      <span className="text-sm font-medium">{children}</span>
    </button>
  );
};
