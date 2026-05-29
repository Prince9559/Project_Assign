import React from "react";
import { FiPlay } from "react-icons/fi";

export default function StartPathwayButton({
  onClick,
  children = "Start",
  className = "",
  disabled = false,
  showIcon = true,
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "flex-1 flex items-center justify-center",
        "px-4 py-2",
        "text-sm font-extrabold",
        "text-white bg-[#9BC87C]",
        "rounded-lg shadow-sm",
        "hover:bg-[#8ab76b] transition-colors",
        "active:scale-[0.99]",
        "focus:outline-none focus:ring-2 focus:ring-[#9BC87C] focus:ring-offset-2",
        disabled ? "opacity-50 cursor-not-allowed" : "",
        className,
      ].join(" ")}
    >
      {showIcon ? <FiPlay className="mr-2" /> : null}
      {children}
    </button>
  );
}