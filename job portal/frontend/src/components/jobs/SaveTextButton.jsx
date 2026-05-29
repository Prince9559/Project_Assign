import React from "react";

export default function SaveTextButton({
  onClick,
  children = "Save",
  className = "",
  disabled = false,
  loading = false,
}) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={onClick}
      className={[
        "text-sm font-extrabold",
        "text-[#1DB32F] hover:text-[#189b27]",
        "transition-colors",
        (disabled || loading) ? "opacity-50 cursor-not-allowed" : "",
        className,
      ].join(" ")}
    >
      {loading ? "Saving..." : children}
    </button>
  );
}