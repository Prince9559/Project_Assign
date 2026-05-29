// src/components/settings/SettingsSidebar.jsx
import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  FaUsers,
  FaUserShield,
  FaBell,
  FaUser,
  FaLock,
  FaBuilding,
  FaHistory,
  FaKey,
} from "react-icons/fa";

const navItems = [
  { key: "team", label: "Team Members", icon: <FaUsers />, requiredPerm: "user.view.list" },
  { key: "roles", label: "Roles & Permissions", icon: <FaUserShield />, requiredPerm: "user.manage.roles" },
  { key: "email-alerts", label: "Email Alerts", icon: <FaBell />, requiredPerm: null }, // personal
  // { key: "profile", label: "Profile", icon: <FaUser />, requiredPerm: null },
  { key: "job-access", label: "Job Access", icon: <FaLock />, requiredPerm: "user.manage.roles" },
  // { key: "security", label: "Security", icon: <FaLock />, requiredPerm: null },
  // { key: "company", label: "Company Info", icon: <FaBuilding />, requiredPerm: "company.update.info" },
  { key: "audit", label: "Audit Log", icon: <FaHistory />, requiredPerm: "audit.view" },
];

const SettingsSidebar = () => {
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const permissions = useMemo(() => new Set(user?.permissions || []), [user]);

  // Filter items user can access
  const visibleItems = navItems.filter((item) => {
    if (!item.requiredPerm) return true;
    return permissions.has(item.requiredPerm);
  });

  // Extract current tab from path: `/recruiter/settings/team` → `team`
  const currentTab = location.pathname.split("/").pop() || "team";

  return (
    <div className="flex-shrink-0 w-64 bg-white border rounded-lg shadow-sm">
      <div className="p-4 border-b">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <FaKey /> Settings & Access
        </h2>
        <p className="mt-1 text-xs text-gray-500">Manage your workspace</p>
      </div>

      <nav className="py-2">
        {visibleItems.map((item) => {
          const isActive = currentTab === item.key;
          return (
            <Link
              key={item.key}
              to={`/recruiter/settings/${item.key}`}
              className={`flex items-center gap-3 px-4 py-3 text-sm transition ${
                isActive
                  ? "bg-blue-50 text-blue-700 border-r-2 border-blue-500 font-medium"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default SettingsSidebar;