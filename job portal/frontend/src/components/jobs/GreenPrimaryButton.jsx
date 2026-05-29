import React from "react";

export default function GreenPrimaryButton({
  onClick,
  children,
  className = "",
  type = "button",
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={[
        "px-6 py-2.5 rounded-lg",
        "bg-[#9BC87C] text-[#1e1e2d]",
        "text-sm font-extrabold",
        "shadow-sm hover:brightness-95 transition",
        "focus:outline-none focus:ring-2 focus:ring-[#9BC87C] focus:ring-offset-2",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}