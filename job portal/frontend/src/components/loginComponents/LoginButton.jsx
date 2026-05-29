import React from "react";

export const LoginButton = ({
  loading = false,
  children = "Log In",
  className = "",
  ...props
}) => {
  return (
    <button
      type="submit"
      disabled={loading}
      className={`w-full mb-4 bg-[#9bc87c] hover:bg-[#8ab76b] text-white font-semibold rounded-lg transition-colors duration-200 py-2.5 px-4 ${
        loading ? "opacity-70 cursor-not-allowed" : ""
      } ${className}`}
      {...props}
    >
      {loading ? "Logging in..." : children}
    </button>
  );
};

