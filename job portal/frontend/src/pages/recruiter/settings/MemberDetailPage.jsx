import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import { getMember, updateMemberDetails, toggleMemberStatus, changeMemberPassword, getRoles, updateMemberRole } from "../../../api/teamApi";
import { FaArrowLeft, FaLock, FaSave, FaTimes, FaUser, FaEnvelope, FaPhone } from "react-icons/fa";

const MemberDetailPage = () => {
    const { membershipId } = useParams();
    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token);
    
    const [member, setMember] = useState(null);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Loading states for async actions
    const [savingDetails, setSavingDetails] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);
    const [updatingRole, setUpdatingRole] = useState(false);
    
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
    });
    const [passwordData, setPasswordData] = useState({ newPassword: "", sendEmail: true });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [memberRes, rolesRes] = await Promise.all([
                    getMember(membershipId),
                    getRoles()
                ]);
                const m = memberRes.data.member;
                setMember(m);
                
                // Parse name into first/last
                const nameParts = (m.name || "").trim().split(" ");
                setFormData({
                    firstName: nameParts[0] || "",
                    lastName: nameParts.slice(1).join(" ") || "",
                    email: m.email || "",
                    phone: m.phone || "",
                });
                setRoles(rolesRes.data.roles || []);
            } catch (err) {
                console.error("Failed to load member:", err);
                toast.error("Failed to load member details");
                navigate("/recruiter/settings/team");
            } finally {
                setLoading(false);
            }
        };
        if (token && membershipId) loadData();
    }, [token, membershipId, navigate]);

    const validateDetails = () => {
        const err = {};
        if (!formData.firstName.trim()) err.firstName = "First name is required";
        if (!formData.lastName.trim()) err.lastName = "Last name is required";
        // email change not allowed
        // if (!/\S+@\S+\.\S+/.test(formData.email)) err.email = "Valid email is required";
        setErrors(err);
        return Object.keys(err).length === 0;
    };

    const handleDetailsChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const handleSaveDetails = async (e) => {
        e.preventDefault();
        if (!validateDetails()) return;

        try {
            setSavingDetails(true);
            await updateMemberDetails(membershipId, formData);
            toast.success("Member details updated");
            
            // Refresh member data to reflect changes
            const res = await getMember(membershipId);
            const updated = res.data.member;
            setMember(updated);
            
            // Update form with fresh data
            const nameParts = (updated.name || "").trim().split(" ");
            setFormData({
                firstName: nameParts[0] || "",
                lastName: nameParts.slice(1).join(" ") || "",
                // email: updated.email || "",
                phone: updated.phone || "",
            });
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to update details";
            if (msg.toLowerCase().includes("email") && msg.toLowerCase().includes("exists")) {
                setErrors({ email: "This email is already in use by another account" });
            } else {
                toast.error(msg);
            }
        } finally {
            setSavingDetails(false);
        }
    };

    const handleToggleStatus = async (newStatus) => {
        if (updatingStatus || member?.isOwner) return;
        
        try {
            setUpdatingStatus(true);
            await toggleMemberStatus(membershipId, newStatus);
            setMember((prev) => ({ ...prev, status: newStatus }));
            toast.success(`Status updated to ${newStatus}`);
        } catch (err) {
            console.error("Failed to update status:", err);
            toast.error("Failed to update status");
        } finally {
            setUpdatingStatus(false);
        }
    };

    const handleChangeRole = async (newRoleId) => {
        if (updatingRole || member?.isOwner) return;
        
        const oldRoleId = member?.roleId;
        
        try {
            setUpdatingRole(true);
            // Optimistic update
            setMember((prev) => ({ 
                ...prev, 
                roleId: newRoleId,
                roleName: roles.find(r => r.id === newRoleId)?.name || prev.roleName
            }));
            
            await updateMemberRole(membershipId, newRoleId);
            toast.success("Role updated");
        } catch (err) {
            console.error("Failed to update role:", err);
            // Revert on error
            setMember((prev) => ({ 
                ...prev, 
                roleId: oldRoleId,
                roleName: roles.find(r => r.id === oldRoleId)?.name || prev.roleName
            }));
            toast.error("Failed to update role");
        } finally {
            setUpdatingRole(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (savingPassword) return;
        
        if (passwordData.newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        try {
            setSavingPassword(true);
            await changeMemberPassword(membershipId, passwordData.newPassword, {
                sendEmail: passwordData.sendEmail
            });
            toast.success("Password updated");
            setShowPasswordForm(false);
            setPasswordData({ newPassword: "", sendEmail: true });
        } catch (err) {
            console.error("Failed to change password:", err);
            toast.error(err.response?.data?.message || "Failed to update password");
        } finally {
            setSavingPassword(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'suspended': return 'bg-red-100 text-red-800';
            case 'invited': return 'bg-yellow-100 text-yellow-800';
            case 'left': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status) => {
        if (!status) return 'Unknown';
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    if (loading) {
        return (
            <SettingsLayout>
                <div className="flex items-center justify-center h-64">
                    <p className="text-gray-500">Loading member details...</p>
                </div>
            </SettingsLayout>
        );
    }

    if (!member) {
        return (
            <SettingsLayout>
                <div className="py-12 text-center">
                    <p className="text-gray-500">Member not found</p>
                    <button
                        onClick={() => navigate("/recruiter/settings/team")}
                        className="mt-4 text-blue-600 hover:underline"
                    >
                        Back to Team
                    </button>
                </div>
            </SettingsLayout>
        );
    }

    return (
        <SettingsLayout>
            <div className="max-w-3xl">
                {/* Back button */}
                <button
                    onClick={() => navigate("/recruiter/settings/team")}
                    className="flex items-center gap-2 mb-6 text-gray-600 hover:text-gray-900"
                    disabled={savingDetails || savingPassword || updatingStatus || updatingRole}
                >
                    <FaArrowLeft /> Back to Team
                </button>

                {/* Header */}
                <div className="pb-4 mb-6 border-b">
                    <h1 className="text-2xl font-bold">{member.name}</h1>
                    <p className="text-gray-500">{member.email}</p>
                    <div className="flex items-center gap-3 mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(member.status)}`}>
                            {getStatusLabel(member.status)}
                        </span>
                        {member.isOwner && (
                            <span className="px-2 py-1 text-xs text-red-800 bg-red-100 rounded-full">
                                Owner
                            </span>
                        )}
                    </div>
                </div>

                {/* Status and Role Section */}
                <div className="p-4 mb-6 border rounded-lg">
                    <h3 className="mb-4 font-medium">Account Settings</h3>
                    
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Status Toggle */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Account Status</label>
                            <div className="flex items-center gap-3">
                                <select
                                    value={member.status}
                                    onChange={(e) => handleToggleStatus(e.target.value)}
                                    className="px-3 py-2 text-sm border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    disabled={member.isOwner || updatingStatus}
                                >
                                    <option value="active">Active</option>
                                    <option value="suspended">Suspended</option>
                                    <option value="invited">Invited</option>
                                    <option value="left">Left</option>
                                </select>
                                {updatingStatus && (
                                    <span className="text-xs text-gray-400">updating...</span>
                                )}
                            </div>
                        </div>

                        {/* Role Select */}
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-700">Assigned Role</label>
                            <div className="flex items-center gap-3">
                                <select
                                    value={member.roleId || ""}
                                    onChange={(e) => handleChangeRole(Number(e.target.value))}
                                    className="px-3 py-2 text-sm border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    disabled={member.isOwner || updatingRole || roles.length === 0}
                                >
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.id} disabled={role.isSystem && role.name === "Owner"}>
                                            {role.name} {role.isSystem ? "(System)" : ""}
                                        </option>
                                    ))}
                                </select>
                                {updatingRole && (
                                    <span className="text-xs text-gray-400">updating...</span>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {member.isOwner && (
                        <p className="mt-3 text-xs text-gray-500">
                            Owner account settings cannot be modified.
                        </p>
                    )}
                </div>

                {/* Edit Details Form */}
                <form onSubmit={handleSaveDetails} className="p-4 mb-6 border rounded-lg">
                    <h3 className="mb-4 font-medium">Personal Details</h3>
                    
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">First Name *</label>
                            <div className="relative">
                                <FaUser className="absolute text-gray-400 left-3 top-3" size={14} />
                                <input
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleDetailsChange}
                                    className={`w-full py-2 pl-10 pr-3 border rounded-md disabled:bg-gray-50 ${errors.firstName ? "border-red-500" : ""}`}
                                    disabled={savingDetails || member.isOwner}
                                />
                            </div>
                            {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium text-gray-700">Last Name *</label>
                            <div className="relative">
                                <FaUser className="absolute text-gray-400 left-3 top-3" size={14} />
                                <input
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleDetailsChange}
                                    className={`w-full py-2 pl-10 pr-3 border rounded-md disabled:bg-gray-50 ${errors.lastName ? "border-red-500" : ""}`}
                                    disabled={savingDetails || member.isOwner}
                                />
                            </div>
                            {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
                        </div>
                    </div>

                    {/* <div className="mt-4">
                        <label className="block mb-1 text-sm font-medium text-gray-700">Email *</label>
                        <div className="relative">
                            <FaEnvelope className="absolute text-gray-400 left-3 top-3" size={14} />
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleDetailsChange}
                                className={`w-full py-2 pl-10 pr-3 border rounded-md disabled:bg-gray-50 ${errors.email ? "border-red-500" : ""}`}
                                disabled={savingDetails || member.isOwner}
                            />
                        </div>
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                        <p className="mt-1 text-xs text-gray-500">If email is changed, member must use new email to log in.</p>
                    </div> */}

                    {/* now email changing not allowed */}
                    <div className="mt-4">
                        <label className="block mb-1 text-sm font-medium text-gray-700">Email *</label>
                        <div className="relative">
                            <FaEnvelope className="absolute text-gray-400 left-3 top-3" size={14} />
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleDetailsChange} // Keep onChange to allow copying, but it won't save
                                className="w-full py-2 pl-10 pr-3 border rounded-md cursor-not-allowed bg-gray-50"
                                disabled={true} // Force disabled
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Email cannot be changed. Contact support if correction is needed.</p>
                    </div>

                    <div className="mt-4">
                        <label className="block mb-1 text-sm font-medium text-gray-700">Phone (optional)</label>
                        <div className="relative">
                            <FaPhone className="absolute text-gray-400 left-3 top-3" size={14} />
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={handleDetailsChange}
                                className="w-full py-2 pl-10 pr-3 border rounded-md disabled:bg-gray-50"
                                placeholder="+91 98765 43210"
                                disabled={savingDetails || member.isOwner}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="submit"
                            disabled={savingDetails || member.isOwner}
                            className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaSave /> {savingDetails ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                // Reset form to original values
                                const nameParts = (member.name || "").trim().split(" ");
                                setFormData({
                                    firstName: nameParts[0] || "",
                                    lastName: nameParts.slice(1).join(" ") || "",
                                    email: member.email || "",
                                    phone: member.phone || "",
                                });
                                setErrors({});
                            }}
                            disabled={savingDetails || member.isOwner}
                            className="flex items-center gap-2 px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <FaTimes /> Cancel
                        </button>
                    </div>
                </form>

                {/* Change Password Section */}
                <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">Change Password</h3>
                        {!showPasswordForm && !member.isOwner && (
                            <button
                                onClick={() => setShowPasswordForm(true)}
                                className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 disabled:opacity-50"
                                disabled={savingPassword || savingDetails || updatingStatus}
                            >
                                <FaLock /> Change Password
                            </button>
                        )}
                    </div>

                    {member.isOwner && (
                        <p className="mb-3 text-xs text-gray-500">
                            Owner password must be changed from the owner account settings.
                        </p>
                    )}

                    {showPasswordForm && !member.isOwner && (
                        <form onSubmit={handleChangePassword} className="space-y-3">
                            <div>
                                <label className="block mb-1 text-sm font-medium text-gray-700">New Password *</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                                    className="w-full px-3 py-2 border rounded-md disabled:bg-gray-50"
                                    placeholder="Minimum 8 characters"
                                    minLength={8}
                                    disabled={savingPassword}
                                />
                            </div>
                            
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={passwordData.sendEmail}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, sendEmail: e.target.checked }))}
                                    disabled={savingPassword}
                                />
                                <span className="text-sm text-gray-600">Send email notification with new password</span>
                            </label>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={savingPassword}
                                    className="px-4 py-2 text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {savingPassword ? "Updating..." : "Update Password"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordForm(false);
                                        setPasswordData({ newPassword: "", sendEmail: true });
                                    }}
                                    disabled={savingPassword}
                                    className="px-4 py-2 text-gray-700 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Read-only info */}
                <div className="p-4 mt-6 text-sm text-gray-600 rounded-lg bg-gray-50">
                    <p className="mb-1"><strong>Member ID:</strong> {member.userId}</p>
                    <p className="mb-1"><strong>Role:</strong> {member.roleName}</p>
                    <p className="mb-1"><strong>Status:</strong> {getStatusLabel(member.status)}</p>
                    <p><strong>Member Since:</strong> {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString("en-IN") : "N/A"}</p>
                    {member.isOwner && (
                        <p className="mt-3 font-medium text-red-600">
                            This is the primary owner account. Some actions are restricted for security.
                        </p>
                    )}
                </div>
            </div>
        </SettingsLayout>
    );
};

export default MemberDetailPage;