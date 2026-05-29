// src/pages/recruiter/settings/TeamOverviewPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import { RoleBadge } from "../../../components/ui/RoleBadge";
import {
    getTeamMembers,
    getRoles,
    updateMemberRole,
    removeTeamMember,
    addTeamMemberSync, 
    toggleMemberStatus,
} from "../../../api/teamApi";

import { useNavigate } from "react-router-dom";


import {
    FaUserPlus,
    FaPen,
    FaTrash,
    FaLock,
    FaCheckCircle,
    FaTimes,
} from "react-icons/fa";

// Modal Component (inline for simplicity)
const AddMemberModal = ({ isOpen, onClose, roles, onAdd }) => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        roleId: roles.length > 0 ? roles.find((r) => !r.isSystem)?.id || roles[0].id : "",
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const validate = () => {
        const err = {};
        if (!formData.firstName.trim()) err.firstName = "First name is required";
        if (!formData.lastName.trim()) err.lastName = "Last name is required";
        if (!/\S+@\S+\.\S+/.test(formData.email)) err.email = "Valid email is required";
        if (formData.password.length < 6) err.password = "Password must be at least 6 characters";
        if (!formData.roleId) err.roleId = "Role is required";
        setErrors(err);
        return Object.keys(err).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setSaving(true);
            await addTeamMemberSync(formData);
            toast.success(` ${formData.firstName} added to the team`);
            onAdd();
            onClose();
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to add member";
            if (msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("exists")) {
                setErrors({ email: "User with this email already exists" });
            } else {
                toast.error(msg);
            }
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-md bg-white rounded-lg">
                <div className="flex items-center justify-between p-4 border-b">
                    <h3 className="text-lg font-bold">Add Team Member</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block mb-1 text-sm font-medium">First Name *</label>
                            <input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md ${errors.firstName ? "border-red-500" : ""
                                    }`}
                                placeholder="John"
                            />
                            {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium">Last Name *</label>
                            <input
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md ${errors.lastName ? "border-red-500" : ""
                                    }`}
                                placeholder="Doe"
                            />
                            {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium">Email *</label>
                        <input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md ${errors.email ? "border-red-500" : ""
                                }`}
                            placeholder="john@example.com"
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium">Phone (optional)</label>
                        <input
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="+91 98765 43210"
                        />
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium">Password *</label>
                        <input
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-md ${errors.password ? "border-red-500" : ""
                                }`}
                            placeholder="••••••••"
                        />
                        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium">Role *</label>
                        <select
                            name="roleId"
                            value={formData.roleId}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border rounded-md"
                        >
                            {roles.map((role) => (
                                <option key={role.id} value={role.id} disabled={role.isSystem && role.name === "Owner"}>
                                    {role.name} {role.isSystem ? "(System)" : ""}
                                </option>
                            ))}
                        </select>
                        {errors.roleId && <p className="mt-1 text-xs text-red-500">{errors.roleId}</p>}
                    </div>

                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
                        >
                            {saving ? "Adding..." : "Add Member"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main Page
const TeamOverviewPage = () => {
    const user = useSelector((state) => state.auth.user);
    const token = useSelector((state) => state.auth.token);
    const navigate = useNavigate(); 
    const [members, setMembers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    const canInvite = useMemo(
        () => user?.permissions?.includes("user.invite"),
        [user?.permissions]
    );
    const canManageRoles = useMemo(
        () => user?.permissions?.includes("user.manage.roles"),
        [user?.permissions]
    );
    const canRemove = useMemo(
        () => user?.permissions?.includes("user.remove"),
        [user?.permissions]
    );

    // Fetch
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [membersRes, rolesRes] = await Promise.all([getTeamMembers(), getRoles()]);
                setMembers((membersRes.data.members || []).map(m => ({
                    ...m,
                    roleUpdating: false,  // tracks if role change is in progress
                    actionLocked: false,  // tracks if any action button is disabled
                    statusUpdating: false // tracks if status toggle is in progress
                })));
                setRoles(rolesRes.data.roles || []);
            } catch (err) {
                toast.error("Failed to load team");
            } finally {
                setLoading(false);
            }
        };
        if (token) loadData();
    }, [token]);

    // Actions
    const handleAddSuccess = async () => {
        const res = await getTeamMembers();
        setMembers(res.data.members || []);
    };

    const handleChangeRole = async (membershipId, newRoleId) => {
        try {
            await updateMemberRole(membershipId, newRoleId);
            setMembers((prev) =>
                prev.map((m) =>
                    m.id === membershipId
                        ? { ...m, roleId: newRoleId, roleName: roles.find((r) => r.id === newRoleId)?.name }
                        : m
                )
            );
            toast.success("Role updated");
        } catch (err) {
            toast.error("Failed to update role");
        }
    };

    const handleRemove = async (membershipId, name) => {
        if (!confirm(`Remove ${name} from the team? This cannot be undone.`)) return;

        try {
            await removeTeamMember(membershipId);
            setMembers((prev) => prev.filter((m) => m.id !== membershipId));
            toast.success(`${name} removed`);
        } catch (err) {
            toast.error("Failed to remove member");
        }
    };

    if (loading) {
        return (
            <SettingsLayout>
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Loading team...</p>
                </div>
            </SettingsLayout>
        );
    }

    return (
        <SettingsLayout>
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Team Members</h1>
                        <p className="text-gray-500">Add, manage, and assign roles to your team.</p>
                    </div>

                    {canInvite && (
    <button
        onClick={() => navigate("/recruiter/settings/team/add")}
        className="flex items-center gap-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
    >
        <FaUserPlus /> Add Member
    </button>
)}
                </div>

                {/* Team Table */}
                <div className="overflow-x-auto border rounded-lg">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 font-medium text-left">Name</th>
                                <th className="p-3 font-medium text-left">Email</th>
                                <th className="p-3 font-medium text-left">Role</th>
                                 <th className="p-3 font-medium text-left">Status</th>
                                <th className="p-3 font-medium text-left">Joined</th>
                                {canManageRoles && <th className="p-3 font-medium text-left">Actions</th>}
                            </tr>
                        </thead>
                        {/* <tbody>
                            {members.length === 0 ? (
                                <tr>
                                    <td colSpan={canManageRoles ? 5 : 4} className="py-12 text-center text-gray-400">
                                        No team members yet.
                                    </td>
                                </tr>
                            ) : (
                                members.map((m) => (
                                    <tr key={m.id} className="border-b hover:bg-gray-50">
                                        <td className="p-3 font-medium">{m.name}</td>
                                        <td className="p-3 text-gray-600">{m.email}</td>
                                        <td className="p-3">
                                            <RoleBadge roleName={m.roleName} isOwner={m.isOwner} />
                                            {m.isOwner && <span className="ml-2 text-xs text-red-600">Owner</span>}
                                        </td>
                                        <td className="p-3 text-gray-500">
                                            {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : "–"}
                                        </td>
                                        {canManageRoles && (
                                            <td className="p-3">
                                                {!m.isOwner ? (
                                                    <div className="flex items-center gap-2">
                                                        <select
                                                            value={m.roleId}
                                                            onChange={(e) => handleChangeRole(m.id, Number(e.target.value))}
                                                            className="text-sm border rounded px-2 py-1 max-w-[140px]"
                                                            disabled={m.isOwner}
                                                        >
                                                            {roles.map((r) => (
                                                                <option key={r.id} value={r.id}>
                                                                    {r.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {canRemove && (
                                                            <button
                                                                onClick={() => handleRemove(m.id, m.name)}
                                                                className="p-1 text-red-500 hover:text-red-700"
                                                                title="Remove"
                                                            >
                                                                <FaTrash size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">Owner</span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody> */}


                        <tbody>
                            {members.length === 0 ? (
                                <tr>
                                    <td colSpan={canManageRoles ? 6 : 5} className="py-12 text-center text-gray-400">
                                        No team members yet.
                                    </td>
                                </tr>
                            ) : (
                                members.map((m) => (
                                    <tr key={m.id} className="border-b hover:bg-gray-50">
                                        {/* Name - clickable to go to detail page */}
                                        <td className="p-3">
                                            <button
                                                onClick={() => navigate(`/recruiter/settings/team/${m.id}`)}
                                                className="font-medium text-left text-blue-600 hover:text-blue-800 hover:underline"
                                            >
                                                {m.name}
                                            </button>
                                        </td>
                                        <td className="p-3 text-gray-600">{m.email}</td>
                                        <td className="p-3">
                                            <RoleBadge roleName={m.roleName} isOwner={m.isOwner} />
                                            {m.isOwner && <span className="ml-2 text-xs text-red-600">Owner</span>}
                                        </td>

                                        {/* Status column with toggle */}
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs px-2 py-1 rounded-full ${m.status === 'active' ? 'bg-green-100 text-green-800' :
                                                        m.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                                            m.status === 'invited' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                                                </span>
                                                {!m.isOwner && canManageRoles && (
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                       <input
    type="checkbox"
    checked={m.status === 'active'}
    onChange={async (e) => {
        const newStatus = e.target.checked ? 'active' : 'suspended';
        
        // Lock toggle immediately to prevent double-clicks
        setMembers(prev => prev.map(member => 
            member.id === m.id ? { ...member, statusUpdating: true } : member
        ));
        
        try {
            await toggleMemberStatus(m.id, newStatus);
            setMembers(prev => prev.map(member => 
                member.id === m.id ? { ...member, status: newStatus, statusUpdating: false } : member
            ));
            toast.success(`Status updated to ${newStatus}`);
        } catch (err) {
            // Revert toggle visually on error
            e.target.checked = !e.target.checked;
            setMembers(prev => prev.map(member => 
                member.id === m.id ? { ...member, statusUpdating: false } : member
            ));
            toast.error("Failed to update status");
        }
    }}
    className="sr-only peer"
    disabled={m.isOwner || m.statusUpdating} // Disable while updating
/>
                                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-600"></div>
                                                    </label>
                                                )}
                                            </div>
                                        </td>

                                        <td className="p-3 text-gray-500">
                                            {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : "–"}
                                        </td>

                                        {/* Actions column */}
                                        {canManageRoles && (
                                            <td className="p-3">
                                                {!m.isOwner ? (
                                                    <div className="flex flex-col gap-2">
                                                        {/* Role Select */}
                                                        <select
                                                            value={m.roleId}
                                                            onChange={async (e) => {
                                                                const newRoleId = Number(e.target.value);
                                                                // Optimistic update: disable select while saving
                                                                setMembers(prev => prev.map(member =>
                                                                    member.id === m.id ? { ...member, roleId: newRoleId, roleUpdating: true } : member
                                                                ));
                                                                try {
                                                                    await updateMemberRole(m.id, newRoleId);
                                                                    setMembers(prev => prev.map(member =>
                                                                        member.id === m.id ? { ...member, roleName: roles.find(r => r.id === newRoleId)?.name, roleUpdating: false } : member
                                                                    ));
                                                                    toast.success("Role updated");
                                                                } catch (err) {
                                                                    // Revert on error
                                                                    setMembers(prev => prev.map(member =>
                                                                        member.id === m.id ? { ...member, roleId: m.roleId, roleUpdating: false } : member
                                                                    ));
                                                                    toast.error("Failed to update role");
                                                                }
                                                            }}
                                                            className="text-sm border rounded px-2 py-1 max-w-[140px] disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                            disabled={m.isOwner || m.roleUpdating}
                                                        >
                                                            {roles.map((r) => (
                                                                <option key={r.id} value={r.id}>
                                                                    {r.name}
                                                                </option>
                                                            ))}
                                                        </select>

                                                        {/* Action buttons row */}
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => navigate(`/recruiter/settings/team/${m.id}`)}
                                                                className="p-1 text-blue-500 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                title="Edit details"
                                                                disabled={m.actionLocked}
                                                            >
                                                                <FaPen size={14} />
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    const newPassword = prompt("Enter new password (min 8 characters):");
                                                                    if (!newPassword || newPassword.length < 8) {
                                                                        if (newPassword) toast.error("Password must be at least 8 characters");
                                                                        return;
                                                                    }
                                                                    // Lock actions during request
                                                                    setMembers(prev => prev.map(member =>
                                                                        member.id === m.id ? { ...member, actionLocked: true } : member
                                                                    ));
                                                                    try {
                                                                        await changeMemberPassword(m.id, newPassword);
                                                                        toast.success("Password updated");
                                                                    } catch (err) {
                                                                        toast.error(err.response?.data?.message || "Failed to update password");
                                                                    } finally {
                                                                        setMembers(prev => prev.map(member =>
                                                                            member.id === m.id ? { ...member, actionLocked: false } : member
                                                                        ));
                                                                    }
                                                                }}
                                                                className="p-1 text-purple-500 hover:text-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                title="Change password"
                                                                disabled={m.isOwner || m.actionLocked}
                                                            >
                                                                <FaLock size={14} />
                                                            </button>
                                                            {canRemove && (
                                                                <button
                                                                    onClick={() => handleRemove(m.id, m.name)}
                                                                    className="p-1 text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    title="Remove"
                                                                    disabled={m.isOwner || m.actionLocked}
                                                                >
                                                                    <FaTrash size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">Owner</span>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                    💡 New members receive login credentials via email. Click a member name to edit details.
                </div>

            </div>
        </SettingsLayout>
    );
};

export default TeamOverviewPage;