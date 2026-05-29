// src/components/ui/RoleBadge.jsx
import React from "react";

const roleColors = {
    Owner: "bg-red-100 text-red-800 border-red-300",
    Admin: "bg-[#eaf4e3] text-green-800 border-[#9bc87c]",
    "HR Manager": "bg-green-100 text-green-800 border-green-300",
    default: "bg-gray-100 text-gray-700 border-gray-300",
};

export const RoleBadge = ({ roleName, isOwner = false }) => {
    const baseClasses = "px-2.5 py-0.5 text-xs font-medium rounded border whitespace-nowrap";
    const color = isOwner ? roleColors.Owner : roleColors[roleName] || roleColors.default;
    return <span className={`${baseClasses} ${color}`}>{roleName}</span>;
};