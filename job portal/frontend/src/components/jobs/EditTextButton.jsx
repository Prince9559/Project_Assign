import React from "react";

export default function EditTextButton({
  onClick,
  children = "Edit",
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
        "text-[#9BC87C] hover:text-[#8ab76b]",
        "transition-colors",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}