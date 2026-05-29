// src/pages/recruiter/settings/EditRolePage.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import { updateRole, getPermissions, getRoleById } from "../../../api/teamApi"; 
import { FaArrowLeft, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const EditRolePage = () => {
    const { roleId } = useParams();
    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token);

    const [permissions, setPermissions] = useState({});
    const [roleData, setRoleData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        permissionKeys: [],
    });

    // Load permissions + role data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [permsRes, roleRes] = await Promise.all([
                    getPermissions(),
                    getRoleById(roleId), // ← create this API call if missing
                ]);

                setPermissions(permsRes.data.permissions || {});

                const role = roleRes.data.role;
                setRoleData(role);
                setFormData({
                    name: role.name,
                    description: role.description || "",
                    permissionKeys: role.permissions.map((p) => p.key),
                });
            } catch (err) {
                toast.error(err.response?.data?.message || "Failed to load role");
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };
        if (token && roleId) loadData();
    }, [token, roleId, navigate]);

    // ─── Permission Helpers (same as CreateRolePage) ─────────
    const areAllModulePermissionsSelected = (modulePerms) => {
        return modulePerms.every((p) => formData.permissionKeys.includes(p.key));
    };

    const isSomeModulePermissionsSelected = (modulePerms) => {
        return modulePerms.some((p) => formData.permissionKeys.includes(p.key)) &&
            !areAllModulePermissionsSelected(modulePerms);
    };

    const handleModuleToggle = (modulePerms) => {
        const allSelected = areAllModulePermissionsSelected(modulePerms);
        const moduleKeys = modulePerms.map((p) => p.key);
        setFormData((prev) => ({
            ...prev,
            permissionKeys: allSelected
                ? prev.permissionKeys.filter((k) => !moduleKeys.includes(k))
                : [...new Set([...prev.permissionKeys, ...moduleKeys])],
        }));
    };

    const handlePermissionToggle = (key) => {
        setFormData((prev) => ({
            ...prev,
            permissionKeys: prev.permissionKeys.includes(key)
                ? prev.permissionKeys.filter((k) => k !== key)
                : [...prev.permissionKeys, key],
        }));
    };
    // ─────────────────────────────────────────────────────

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return toast.error("Role name is required");
        if (formData.permissionKeys.length === 0) return toast.error("Select at least one permission");

        try {
            setSubmitting(true);
            await updateRole(roleId, {
                name: formData.name.trim(),
                description: formData.description.trim(),
                permissionKeys: formData.permissionKeys,
            });
            toast.success(" Role updated successfully!");
            navigate("/recruiter/settings/roles");
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to update role";
            toast.error(msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => navigate(-1);

    if (loading) {
        return (
            <SettingsLayout>
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Loading role...</p>
                </div>
            </SettingsLayout>
        );
    }

    if (!roleData || roleData.isSystem) {
        return (
            <SettingsLayout>
                <div className="py-12 text-center">
                    <p className="mb-4 text-gray-500">
                        {roleData?.isSystem ? "System roles cannot be edited" : "Role not found"}
                    </p>
                    <button onClick={handleCancel} className="text-blue-600 hover:underline">← Go Back</button>
                </div>
            </SettingsLayout>
        );
    }

    return (
        <SettingsLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button onClick={handleCancel} className="p-2 text-gray-600 rounded-lg hover:text-gray-900 hover:bg-gray-100">
                        <FaArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit Role</h1>
                        <p className="text-sm text-gray-500">Updating: <span className="font-medium text-gray-700">{roleData.name}</span></p>
                    </div>
                </div>

                {/* Form - Same structure as CreateRolePage */}
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Basic Info */}
                    <div className="p-5 bg-white border rounded-lg shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold text-gray-800">Role Details</h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                                    Role Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3.5 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., Interview Coordinator"
                                    maxLength={50}
                                    required
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block mb-1.5 text-sm font-medium text-gray-700">Description</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3.5 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Brief description"
                                    maxLength={120}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Permissions Section - Same as CreateRolePage with inline scroll fix */}
                    <div className="min-h-0 p-5 bg-white border rounded-lg shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-800">Permissions</h2>
                            {formData.permissionKeys.length > 0 && (
                                <span className="px-3 py-1 text-sm font-medium text-blue-600 rounded-full bg-blue-50">
                                    {formData.permissionKeys.length} selected
                                </span>
                            )}
                        </div>

                        <div
                            className="flex-shrink-0 p-4 border border-gray-200 rounded-lg bg-gray-50"
                            style={{
                                maxHeight: '288px',
                                overflowY: 'auto',
                                overflowX: 'hidden',
                                WebkitOverflowScrolling: 'touch',
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#c1c1c1 #f1f1f1',
                            }}
                        >
                            {Object.entries(permissions).map(([module, perms]) => {
                                const allSelected = areAllModulePermissionsSelected(perms);
                                const someSelected = isSomeModulePermissionsSelected(perms);

                                return (
                                    <div key={module} className="pb-4 mb-5 border-b border-gray-200 last:mb-0 last:border-b-0">
                                        <div className="flex items-center justify-between mb-3">
                                            <h3 className="flex items-center gap-2 font-semibold text-gray-800 capitalize">
                                                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                {module}
                                            </h3>
                                            <label className="flex items-center gap-2 text-sm cursor-pointer select-none group">
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={allSelected}
                                                        ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                                                        onChange={() => handleModuleToggle(perms)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className={`w-4.5 h-4.5 border-2 rounded transition-all flex items-center justify-center
                            ${allSelected ? 'bg-blue-600 border-blue-600' : someSelected ? 'bg-blue-100 border-blue-400' : 'border-gray-300 bg-white hover:border-blue-400'}`}>
                                                        {allSelected && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                        {someSelected && !allSelected && <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></div>}
                                                    </div>
                                                </div>
                                                <span className={`transition-colors ${allSelected ? 'text-blue-700 font-medium' : 'text-gray-600 group-hover:text-blue-600'}`}>
                                                    {allSelected ? 'Deselect All' : 'Select All'}
                                                </span>
                                            </label>
                                        </div>
                                        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 pl-1">
                                            {perms.map((p) => (
                                                <label key={p.key} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white cursor-pointer">
                                                    <input type="checkbox" checked={formData.permissionKeys.includes(p.key)} onChange={() => handlePermissionToggle(p.key)} className="mt-0.5 w-4.5 h-4.5 text-blue-600 border-gray-300 rounded" />
                                                    <div>
                                                        <span className="text-sm font-medium text-gray-800">{p.name}</span>
                                                        <p className="text-xs text-gray-500">{p.description}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
                        <button type="button" onClick={handleCancel} disabled={submitting} className="px-5 py-2.5 text-gray-700 bg-white border rounded-lg hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={submitting} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2">
                            {submitting ? 'Updating...' : <><FaCheckCircle /> Update Role</>}
                        </button>
                    </div>
                </form>
            </div>
        </SettingsLayout>
    );
};

export default EditRolePage;