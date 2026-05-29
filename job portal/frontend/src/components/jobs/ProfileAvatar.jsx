import React from "react";
import { FaCamera } from "react-icons/fa";

export default function ProfileAvatar({
  src,
  alt = "Profile",
  onChangePhoto,
  sizeClass = "w-24 h-24",
  className = "",
}) {
  return (
    <div className={`relative group ${className}`}>
      <div
        className={`${sizeClass} overflow-hidden rounded-full border-4 border-[#9BC87C]/40 bg-white shadow-sm transition-shadow group-hover:shadow-md`}
      >
        <img
          src={src}
          alt={alt}
          className="object-cover w-full h-full"
        />
      </div>

      {onChangePhoto ? (
        <button
          type="button"
          onClick={onChangePhoto}
          className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full bg-white border-2 border-[#00C950]
          flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition
          focus:outline-none focus:ring-2 focus:ring-[#9BC87C] focus:ring-offset-2"
          title="Change profile picture"
          aria-label="Change profile picture"
        >
          <FaCamera className="text-[#9BC87C]" size={14} />
        </button>
      ) : null}
    </div>
  );
}