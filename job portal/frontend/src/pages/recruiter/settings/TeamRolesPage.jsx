// src/pages/recruiter/settings/TeamRolesPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import { RoleBadge } from "../../../components/ui/RoleBadge";
import {
  getRoles,
  createRole,
  getPermissions,
  deleteRole, // added
} from "../../../api/teamApi";
import {
  FaCog,
  FaPlus,
  FaTrash,
  FaSearch,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import {useNavigate} from "react-router-dom";

const TeamRolesPage = () => {
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [search, setSearch] = useState("");

  const [newRole, setNewRole] = useState({
    name: "",
    description: "",
    permissionKeys: [],
  });

  const [expandedRoles, setExpandedRoles] = useState({});
  
  const toggleRolePermissions = (roleId) => {
    setExpandedRoles((prev) => ({
      ...prev,
      [roleId]: !prev[roleId],
    }));
  };

  const canManageRoles = useMemo(
    () => user?.permissions?.includes("user.manage.roles"),
    [user?.permissions]
  );
  const navigate=useNavigate();

  // Fetch
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [rolesRes, permsRes] = await Promise.all([getRoles(), getPermissions()]);
        setRoles(rolesRes.data.roles || []);
        setPermissions(permsRes.data.permissions || {});
      } catch (err) {
        toast.error("Failed to load roles & permissions", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) loadData();
  }, [token]);

  // Filter roles by search
  const filteredRoles = useMemo(() => {
    if (!search.trim()) return roles;
    const term = search.toLowerCase();
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(term) ||
        r.description?.toLowerCase().includes(term)
    );
  }, [roles, search]);

  // Permission toggle
  const handlePermissionToggle = (key) => {
    setNewRole((prev) => ({
      ...prev,
      permissionKeys: prev.permissionKeys.includes(key)
        ? prev.permissionKeys.filter((k) => k !== key)
        : [...prev.permissionKeys, key],
    }));
  };


  // Check if all permissions in a module are selected
  const areAllModulePermissionsSelected = (modulePerms) => {
    return modulePerms.every((p) => newRole.permissionKeys.includes(p.key));
  };

  // Check if some (but not all) permissions in a module are selected
  const isSomeModulePermissionsSelected = (modulePerms) => {
    return modulePerms.some((p) => newRole.permissionKeys.includes(p.key)) &&
      !areAllModulePermissionsSelected(modulePerms);
  };

  // Toggle all permissions in a module
  const handleModuleToggle = (modulePerms) => {
    const allSelected = areAllModulePermissionsSelected(modulePerms);
    const moduleKeys = modulePerms.map((p) => p.key);

    setNewRole((prev) => ({
      ...prev,
      permissionKeys: allSelected
        ? prev.permissionKeys.filter((k) => !moduleKeys.includes(k))
        : [...new Set([...prev.permissionKeys, ...moduleKeys])],
    }));
  };

  // Create role
  const handleCreateRole = async (e) => {
    e.preventDefault();
    if (!newRole.name.trim()) return toast.error("Role name is required");

    try {
      setCreating(true);
      const payload = {
        name: newRole.name.trim(),
        description: newRole.description.trim(),
        permissionKeys: newRole.permissionKeys,
      };
      const res = await createRole(payload);
      setRoles((prev) => [...prev, res.data.role]);
      setNewRole({ name: "", description: "", permissionKeys: [] });
      toast.success("Role created successfully");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create role";
      toast.error(msg);
    } finally {
      setCreating(false);
    }
  };

  // Delete role
  const handleDeleteRole = async (roleId, roleName) => {
    if (
      !confirm(
        `⚠️ Delete role "${roleName}"?\n\nThis cannot be undone. Ensure no members are assigned to it.`
      )
    )
      return;

    setDeletingId(roleId);
    try {
      await deleteRole(roleId);
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
      toast.success(`🗑️ Role "${roleName}" deleted`);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete role";
      if (msg.includes("in use") || msg.includes("assigned")) {
        toast.error(
          <div>
            <div className="font-medium">❌ Role is in use</div>
            <div className="mt-1 text-sm">
              Assign members to another role first, or contact support.
            </div>
          </div>
        );
      } else {
        toast.error(msg);
      }
    } finally {
      setDeletingId(null);
    }
  };

  // Reset form
  const resetForm = () => {
    setNewRole({ name: "", description: "", permissionKeys: [] });
  };

  if (loading) {
    return (
      <SettingsLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading roles...</p>
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <div>
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Roles & Permissions</h1>
            <p className="text-gray-500">
              Create and manage custom roles. System roles (Owner, Admin) cannot be edited or deleted.
            </p>
          </div>


          {canManageRoles && (
            <button
              onClick={() => navigate("/recruiter/settings/roles/create")}
              className="flex items-center gap-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 whitespace-nowrap"
            >
              <FaPlus /> Create Role
            </button>
          )}
        </div>

        {/* Search */}
        <div className="max-w-full mb-6">
          <div className="relative">
            <FaSearch className="absolute text-gray-400 left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles..."
              className="w-full py-2 pl-10 pr-4 border rounded-md"
            />
          </div>
        </div>

        {/* Role List */}
        {filteredRoles.length === 0 ? (
          <div className="py-12 text-center">
            <p className="mb-4 text-gray-500">
              {search ? "No roles match your search." : "No custom roles created yet."}
            </p>
            {canManageRoles && !search && (
              <button
                onClick={() => navigate("/recruiter/settings/roles/create")}
                className="flex items-center gap-1 mx-auto font-medium text-blue-600 hover:text-blue-800"
              >
                <FaPlus size={14} /> Create your first role
              </button>
            )}
          </div>
        ) : (
          <div className="mb-8 space-y-4">
              {filteredRoles.map((role) => {
                const isExpanded = expandedRoles[role.id] || false;

                return (
                  <div
                    key={role.id}
                    className={`p-4 border rounded-lg ${role.isSystem
                      ? "bg-gray-50 border-gray-300"
                      : "border-blue-200 hover:shadow-sm"
                      }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold">{role.name}</h3>
                          {role.isSystem && (
                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded flex items-center gap-1">
                              <FaCog size={10} /> System
                            </span>
                          )}
                        </div>
                        <p className="max-w-2xl mt-1 text-sm text-gray-600">{role.description || "–"}</p>
                      </div>

                      <div className="flex gap-2">
                        {/* 🔧 ADD: Edit Button (only for custom roles + permission) */}
                        {!role.isSystem && canManageRoles && (
                          <button
                            onClick={() => navigate(`/recruiter/settings/roles/${role.id}/edit`)}
                            className="text-blue-500 hover:text-blue-700 p-1.5 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                            title="Edit role"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}

                        {/* Expand/Collapse button  */}
                        <button
                          onClick={() => toggleRolePermissions(role.id)}
                          className="text-gray-500 hover:text-blue-600 p-1.5 border border-gray-200 rounded hover:bg-gray-50"
                          title={isExpanded ? "Collapse" : "Expand"}
                        >
                          {isExpanded ? '▲' : '▼'}
                        </button>

                        {/* Delete button */}
                        {!role.isSystem && canManageRoles && (
                          <button
                            onClick={() => handleDeleteRole(role.id, role.name)}
                            disabled={deletingId === role.id}
                            className="text-red-500 hover:text-red-700 p-1.5 border border-red-200 rounded hover:bg-red-50 disabled:opacity-50"
                            title="Delete role"
                          >
                            {deletingId === role.id ? '...' : <FaTrash size={14} />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/*  UPDATE: Conditionally Render Permissions */}
                    {isExpanded && (
                      <div className="pt-4 mt-4 border-t border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-sm font-medium text-gray-700">Permissions</h4>
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                            {role.permissions.length}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {role.permissions.map((perm) => (
                            <span
                              key={perm}
                              className="px-2.5 py-1 bg-gray-100 text-xs rounded border text-gray-600"
                            >
                              {perm}
                            </span>
                          ))}
                          {/* {role.permissions.length > 8 && (
                            <span className="px-2.5 py-1 bg-gray-200 text-xs rounded text-gray-600">
                              +{role.permissions.length - 8} more
                            </span>
                          )} */}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}


        {/* Safety Note */}
        <div className="p-4 mt-8 border border-yellow-200 rounded-lg bg-yellow-50">
          <div className="flex gap-2">
            <FaExclamationTriangle className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-800">Role Deletion Policy</h4>
              <p className="mt-1 text-sm text-yellow-700">
                ⚠️ You can only delete custom roles that are <strong>not assigned to any team member</strong>.
                If a role is in use, reassign members first. System roles (Owner, Admin) cannot be deleted.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default TeamRolesPage;