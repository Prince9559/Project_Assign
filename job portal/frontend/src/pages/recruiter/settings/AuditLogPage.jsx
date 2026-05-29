// src/pages/recruiter/settings/AuditLogPage.jsx
import React, { useState } from "react";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import { FaHistory, FaUser, FaKey, FaCheckCircle } from "react-icons/fa";

const mockLogs = [
    { id: 1, user: "Rahul Verma", action: "Created role 'HR Manager'", time: "2 hours ago", ip: "103.25.67.89" },
    { id: 2, user: "Priya Sharma", action: "Changed role of Raj to 'Interviewer'", time: "1 day ago", ip: "103.25.67.92" },
    { id: 3, user: "System", action: "Invitation sent to raj@techcorp.com", time: "1 day ago", ip: "–" },
    { id: 4, user: "Rahul Verma", action: "Updated company GSTIN", time: "3 days ago", ip: "103.25.67.89" },
];

const AuditLogPage = () => {
    const [filter, setFilter] = useState("all");

    return (
        <SettingsLayout>
            <div>
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Audit Log</h1>
                        <p className="text-gray-500">Track important changes in your workspace.</p>
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-1 text-sm border rounded"
                    >
                        <option value="all">All Events</option>
                        <option value="role">Role Changes</option>
                        <option value="member">Member Changes</option>
                        <option value="company">Company Updates</option>
                    </select>
                </div>

                <div className="overflow-hidden border rounded-lg">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-3 font-medium text-left">Action</th>
                                <th className="p-3 font-medium text-left">User</th>
                                <th className="p-3 font-medium text-left">Time</th>
                                <th className="p-3 font-medium text-left">IP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {mockLogs.map((log) => (
                                <tr key={log.id} className="border-b hover:bg-gray-50">
                                    <td className="p-3">
                                        <div className="flex items-start gap-2">
                                            <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
                                            <span>{log.action}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 font-medium">{log.user}</td>
                                    <td className="p-3 text-gray-500">{log.time}</td>
                                    <td className="p-3 font-mono text-gray-500">{log.ip}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <p className="mt-4 text-xs text-gray-500">
                    Logs are retained for 90 days. Export available on request.
                </p>
            </div>
        </SettingsLayout>
    );
};

export default AuditLogPage;