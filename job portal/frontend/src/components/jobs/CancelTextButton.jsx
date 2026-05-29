import React from "react";

export default function CancelTextButton({
  onClick,
  children = "Cancel",
  className = "",
  disabled = false,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "text-sm font-extrabold",
        "text-gray-500 hover:text-gray-700",
        "transition-colors",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}