// src/pages/recruiter/settings/SecuritySettingsPage.jsx
import React, { useState } from "react";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import { FaLock, FaShieldAlt, FaClock, FaSignOutAlt } from "react-icons/fa";
import { toast } from "react-toastify";

const SecuritySettingsPage = () => {
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handlePasswordChange = (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }
        if (password.length < 8) {
            return toast.error("Password must be at least 8 characters");
        }
        toast.success("Password updated (mock)");
        setPassword("");
        setConfirmPassword("");
    };

    const handleLogoutAll = () => {
        if (confirm("Log out from all other devices?")) {
            toast.info("Logged out from other sessions (mock)");
        }
    };

    return (
        <SettingsLayout>
            <div>
                <h1 className="mb-1 text-2xl font-bold">Security</h1>
                <p className="mb-6 text-gray-500">Manage your account security settings.</p>

                <div className="max-w-2xl space-y-6">
                    {/* Change Password */}
                    <div className="p-4 border rounded-lg">
                        <h3 className="flex items-center gap-2 mb-3 font-medium">
                            <FaLock /> Change Password
                        </h3>
                        <form onSubmit={handlePasswordChange} className="space-y-3">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="New password"
                                className="w-full px-3 py-2 border rounded-md"
                            />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm new password"
                                className="w-full px-3 py-2 border rounded-md"
                            />
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md"
                            >
                                Update Password
                            </button>
                        </form>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="flex items-center gap-2 font-medium">
                                    <FaShieldAlt /> Two-Factor Authentication
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Add an extra layer of security with SMS or authenticator app.
                                </p>
                            </div>
                            <button
                                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${twoFactorEnabled ? "bg-green-500" : "bg-gray-300"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${twoFactorEnabled ? "translate-x-6" : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div>
                        {!twoFactorEnabled && (
                            <p className="mt-2 text-sm text-blue-600">
                                🔒 Recommended for all team members.
                            </p>
                        )}
                    </div>

                    {/* Active Sessions */}
                    <div className="p-4 border rounded-lg">
                        <h3 className="flex items-center gap-2 mb-3 font-medium">
                            <FaClock /> Active Sessions
                        </h3>
                        <div className="text-sm">
                            <div className="flex justify-between py-2 border-b">
                                <span>Current device (Chrome, Windows)</span>
                                <span className="text-green-600">Active now</span>
                            </div>
                            <div className="flex justify-between py-2 border-b">
                                <span>Mobile (Safari, iOS)</span>
                                <span>2 hours ago</span>
                            </div>
                            <button
                                onClick={handleLogoutAll}
                                className="flex items-center gap-1 mt-3 text-red-600 hover:text-red-800"
                            >
                                <FaSignOutAlt /> Log out from all other devices
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </SettingsLayout>
    );
};

export default SecuritySettingsPage;