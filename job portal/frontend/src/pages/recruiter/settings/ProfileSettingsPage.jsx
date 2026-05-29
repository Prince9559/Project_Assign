// src/pages/recruiter/settings/ProfileSettingsPage.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import { FaUser, FaEnvelope, FaPhone, FaImage } from "react-icons/fa";

const ProfileSettingsPage = () => {
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
      setAvatarPreview(user.avatar_url || null);
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setAvatarPreview(URL.createObjectURL(file));
      // Upload logic would go here (e.g., to /api/profile/avatar)
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 🔜 Future: call PATCH /api/profile
    toast.success("Profile updated (mock)");
    setSaving(false);
  };

  return (
    <SettingsLayout>
      <div>
        <h1 className="mb-1 text-2xl font-bold">Profile Settings</h1>
        <p className="mb-6 text-gray-500">Update your personal information.</p>

        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="flex items-center justify-center w-20 h-20 overflow-hidden bg-gray-200 rounded-full">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" className="object-cover w-full h-full" />
                ) : (
                  <FaUser className="text-2xl text-gray-500" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-1 text-white bg-blue-600 rounded-full cursor-pointer">
                <FaImage size={14} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <p className="font-medium">Profile Photo</p>
              <p className="text-sm text-gray-500">PNG, JPG up to 2MB</p>
            </div>
          </div>

          {/* Name */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium">First Name</label>
              <div className="relative">
                <FaUser className="absolute text-gray-400 left-3 top-3" />
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full py-2 pl-10 pr-3 border rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Last Name</label>
              <div className="relative">
                <FaUser className="absolute text-gray-400 left-3 top-3" />
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full py-2 pl-10 pr-3 border rounded-md"
                />
              </div>
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium">Email</label>
              <div className="relative">
                <FaEnvelope className="absolute text-gray-400 left-3 top-3" />
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full py-2 pl-10 pr-3 text-gray-500 border rounded-md bg-gray-50"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Email cannot be changed. Contact support.</p>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Phone (optional)</label>
              <div className="relative">
                <FaPhone className="absolute text-gray-400 left-3 top-3" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full py-2 pl-10 pr-3 border rounded-md"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </SettingsLayout>
  );
};

export default ProfileSettingsPage;