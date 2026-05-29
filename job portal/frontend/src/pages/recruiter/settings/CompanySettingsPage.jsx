// src/pages/recruiter/settings/CompanySettingsPage.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import { FaBuilding, FaMapMarkerAlt, FaFileInvoice, FaGlobe } from "react-icons/fa";
import { toast } from "react-toastify";

const CompanySettingsPage = () => {
    const user = useSelector((state) => state.auth.user);
    const [formData, setFormData] = useState({
        name: "",
        website: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        gstin: "", // 🎯 You mentioned GST 18% — collect GSTIN!
        currency: "INR",
    });

    useEffect(() => {
        // 🔜 Future: fetch from /api/company
        if (user?.company) {
            setFormData({
                name: user.company.name || "",
                website: user.company.website || "",
                address: user.company.address || "",
                city: user.company.city || "",
                state: user.company.state || "",
                pincode: user.company.pincode || "",
                country: user.company.country || "India",
                gstin: user.company.gstin || "",
                currency: user.company.currency || "INR",
            });
        }
    }, [user]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // 🔜 call PATCH /api/company
        toast.success("Company info saved (mock)");
    };

    return (
        <SettingsLayout>
            <div>
                <h1 className="mb-1 text-2xl font-bold">Company Information</h1>
                <p className="mb-6 text-gray-500">
                    Update your company details for invoices, contracts, and tax compliance.
                </p>

                <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="block mb-1 text-sm font-medium">Company Name *</label>
                            <div className="relative">
                                <FaBuilding className="absolute text-gray-400 left-3 top-3" />
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full py-2 pl-10 pr-3 border rounded-md"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block mb-1 text-sm font-medium">Website</label>
                            <div className="relative">
                                <FaGlobe className="absolute text-gray-400 left-3 top-3" />
                                <input
                                    type="url"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    className="w-full py-2 pl-10 pr-3 border rounded-md"
                                    placeholder="https://example.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <label className="block mb-1 text-sm font-medium">Address</label>
                        <textarea
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className="w-full px-3 py-2 border rounded-md"
                            rows={2}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                        <input
                            type="text"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            placeholder="City"
                            className="px-3 py-2 border rounded-md"
                        />
                        <input
                            type="text"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            placeholder="State"
                            className="px-3 py-2 border rounded-md"
                        />
                        <input
                            type="text"
                            value={formData.pincode}
                            onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                            placeholder="PIN Code"
                            className="px-3 py-2 border rounded-md"
                            maxLength={6}
                        />
                        <select
                            value={formData.country}
                            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                            className="px-3 py-2 border rounded-md"
                        >
                            <option value="India">India</option>
                            {/* Add more if needed */}
                        </select>
                    </div>

                    {/* Tax & Legal */}
                    <div className="pt-4 border-t">
                        <h3 className="flex items-center gap-2 mb-3 font-medium">
                            <FaFileInvoice /> Tax & Invoicing
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div>
                                <label className="block mb-1 text-sm font-medium">
                                    GSTIN (for 18% GST invoices)
                                </label>
                                <input
                                    type="text"
                                    value={formData.gstin}
                                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                                    className="w-full px-3 py-2 font-mono border rounded-md"
                                    placeholder="22AAAAA0000A1Z5"
                                    maxLength={15}
                                />
                                <p className="mt-1 text-xs text-gray-500">
                                    Required for B2B invoices. Leave blank if not applicable.
                                </p>
                            </div>
                            <div>
                                <label className="block mb-1 text-sm font-medium">Currency</label>
                                <select
                                    value={formData.currency}
                                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                                    className="w-full px-3 py-2 border rounded-md"
                                >
                                    <option value="INR">₹ INR</option>
                                    <option value="USD">$ USD</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md"
                    >
                        Save Company Info
                    </button>
                </form>
            </div>
        </SettingsLayout>
    );
};

export default CompanySettingsPage;