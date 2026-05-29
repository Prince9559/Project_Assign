// src/pages/recruiter/settings/EmailAlertSettingsPage.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import { recruiterApi } from "../../../api/recruiterApi";
import { Calendar } from "lucide-react";




const EmailAlertSettingsPage = () => {
  
    const { token } = useSelector((state) => state.auth);
    const [selectedFrequency, setSelectedFrequency] = useState("weekly");
    const [lastSent, setLastSent] = useState(null);
    const [nextScheduled, setNextScheduled] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Fetch current settings on load
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoading(true);
                const data = await recruiterApi.getRecruiterAlertSettings(token);
                if (data.success) {
                    setSelectedFrequency(data.data.email_alert_frequency);
                    setLastSent(data.data.last_alert_sent_at);

                    setNextScheduled(calculateNextScheduled(data.data.email_alert_frequency, data.data.last_alert_sent_at));
                }
            } catch (err) {
                toast.error("Failed to load alert settings");
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchSettings();
        }
    }, [token]);


    // Helper to calculate next scheduled date
    const calculateNextScheduled = (frequency, lastSent) => {
        if (frequency === "off") return "Disabled";

        const now = new Date();

        // If no lastSent, assume "today" as baseline
        const baseDate = lastSent ? new Date(lastSent) : now;

        let nextDate = new Date(baseDate);

        if (frequency === "daily") {
            nextDate.setDate(baseDate.getDate() + 1);
        } else if (frequency === "weekly") {
            nextDate.setDate(baseDate.getDate() + 7);
        } else if (frequency === "monthly") {
            nextDate.setMonth(baseDate.getMonth() + 1);
        }

        // If calculated date is in past, use today + interval
        if (nextDate <= now) {
            nextDate = new Date(now);
            if (frequency === "daily") nextDate.setDate(now.getDate() + 1);
            else if (frequency === "weekly") nextDate.setDate(now.getDate() + 7);
            else if (frequency === "monthly") nextDate.setMonth(now.getMonth() + 1);
        }

        return nextDate.toISOString().split("T")[0]; // "YYYY-MM-DD"
    };

    const frequencies = [
        { value: "off", label: "Off" },
        { value: "daily", label: "Daily" },
        { value: "weekly", label: "Weekly" },
        { value: "monthly", label: "Monthly" },
    ];

    const handleSave = async () => {
        try {
            setSaving(true);
            const data = await recruiterApi.updateRecruiterAlertSettings(token, selectedFrequency);
            if (data.success) {
                toast.success("Email alert settings saved!");
                setLastSent(null); // reset
                setNextScheduled(calculateNextScheduled(selectedFrequency, null));
            }
        } catch (error) {
            toast.error("Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <SettingsLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <p>Loading settings...</p>
                </div>
            </SettingsLayout>
        );
    }

    return (
        <SettingsLayout>
            <div>
                <h1 className="mb-1 text-2xl font-bold">Email Alert Settings</h1>
                <p className="mb-6 text-gray-500">
                    Choose how often you want to receive email notifications for new job applications.
                </p>

                {/* Your existing form UI (no height fix — let it flow) */}
                <div className="max-w-2xl">
                    
                    {/* Frequency Options */}
                    <div className="flex flex-wrap gap-3 mb-8">
                        {frequencies.map((freq) => (
                            <button
                                key={freq.value}
                                onClick={() => setSelectedFrequency(freq.value)}
                                className={`px-6 py-3 text-sm font-medium rounded-full transition ${selectedFrequency === freq.value
                                        ? "bg-red-500 text-white"
                                        : "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200"
                                    }`}
                                disabled={saving}
                            >
                                {freq.label}
                            </button>
                        ))}
                    </div>

                    {/* Alert Info Section */}
                    <div className="p-4 mb-6 rounded-lg bg-gray-50">
                        <h3 className="mb-3 text-sm font-semibold text-gray-700">Alert Schedule</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Calendar size={16} />
                                <span>
                                    <strong>Last Sent:</strong> {lastSent ? new Date(lastSent).toLocaleDateString() : "Never"}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar size={16} />
                                <span>
                                    <strong>Next Scheduled:</strong>{" "}
                                    {selectedFrequency === "off"
                                        ? "Disabled"
                                        : nextScheduled || "Calculating..."}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`px-6 py-2 text-white rounded-md transition ${saving
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-red-500 hover:bg-red-600"
                            }`}
                    >
                        {saving ? "Saving..." : "Save Preferences"}
                    </button>
                </div>
            </div>
        </SettingsLayout>
    );
};

export default EmailAlertSettingsPage;