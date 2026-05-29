import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import { getRoles, addTeamMemberSync } from "../../../api/teamApi";
import { FaArrowLeft } from "react-icons/fa";

const AddMemberPage = () => {
    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        roleId: "",
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const loadRoles = async () => {
            try {
                const res = await getRoles();
                const availableRoles = res.data.roles || [];
                setRoles(availableRoles);
                if (availableRoles.length > 0) {
                    const defaultRole = availableRoles.find((r) => !r.isSystem) || availableRoles[0];
                    setFormData(prev => ({ ...prev, roleId: defaultRole.id }));
                }
            } catch (err) {
                toast.error("Failed to load roles");
            } finally {
                setLoading(false);
            }
        };
        if (token) loadRoles();
    }, [token]);

    const validate = () => {
        const err = {};
        if (!formData.firstName.trim()) err.firstName = "First name is required";
        if (!formData.lastName.trim()) err.lastName = "Last name is required";
        if (!/\S+@\S+\.\S+/.test(formData.email)) err.email = "Valid email is required";
        if (formData.password.length < 8) err.password = "Password must be at least 8 characters";
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
            toast.success(`${formData.firstName} added to team. Invitation email sent.`);
            navigate("/recruiter/settings/team");
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

    if (loading) {
        return (
            <SettingsLayout>
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </SettingsLayout>
        );
    }

    return (
        <SettingsLayout>
            <div className="max-w-2xl">
                <button
                    onClick={() => navigate("/recruiter/settings/team")}
                    className="flex items-center gap-2 mb-4 text-gray-600 hover:text-gray-900"
                >
                    <FaArrowLeft /> Back to Team
                </button>

                <h1 className="mb-1 text-2xl font-bold">Add Team Member</h1>
                <p className="mb-6 text-gray-500">Enter details to invite a new member. They will receive login credentials via email.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="block mb-1 text-sm font-medium">First Name *</label>
                            <input
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-md ${errors.firstName ? "border-red-500" : ""}`}
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
                                className={`w-full px-3 py-2 border rounded-md ${errors.lastName ? "border-red-500" : ""}`}
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
                            className={`w-full px-3 py-2 border rounded-md ${errors.email ? "border-red-500" : ""}`}
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
                            className={`w-full px-3 py-2 border rounded-md ${errors.password ? "border-red-500" : ""}`}
                            placeholder="••••••••"
                        />
                        <p className="mt-1 text-xs text-gray-500">Minimum 8 characters. This will be sent to the member via email.</p>
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

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate("/recruiter/settings/team")}
                            className="flex-1 px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                        >
                            {saving ? "Adding..." : "Add Member & Send Invitation"}
                        </button>
                    </div>
                </form>
            </div>
        </SettingsLayout>
    );
};

export default AddMemberPage;