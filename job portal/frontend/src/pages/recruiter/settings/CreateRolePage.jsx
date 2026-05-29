// src/pages/recruiter/settings/CreateRolePage.jsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import { createRole, getPermissions } from "../../../api/teamApi";
import { FaArrowLeft, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const CreateRolePage = () => {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissionKeys: [],
  });

  // Fetch permissions on mount
  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const res = await getPermissions();
        setPermissions(res.data.permissions || {});
      } catch (err) {
        toast.error("Failed to load permissions");
      } finally {
        setLoading(false);
      }
    };
    if (token) loadPermissions();
  }, [token]);

  // ─── Permission Helpers ──────────────────────────────
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
    
    if (!formData.name.trim()) {
      return toast.error("Role name is required");
    }
    if (formData.permissionKeys.length === 0) {
      return toast.error("Please select at least one permission");
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        permissionKeys: formData.permissionKeys,
      };
      
      await createRole(payload);
      toast.success(" Role created successfully!");
      navigate("/recruiter/settings/roles");
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create role";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <SettingsLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading permissions...</p>
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={handleCancel}
            className="p-2 text-gray-600 transition-colors rounded-lg hover:text-gray-900 hover:bg-gray-100"
            title="Go back"
          >
            <FaArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New Role</h1>
            <p className="text-sm text-gray-500">Define permissions for your custom role</p>
          </div>
        </div>

        {/* Form */}
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
                  className="w-full px-3.5 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  placeholder="e.g., Interview Coordinator"
                  maxLength={50}
                  required
                  autoFocus
                />
                <p className="mt-1 text-xs text-gray-400">Max 50 characters</p>
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Briefly describe this role's responsibilities"
                  maxLength={120}
                />
                <p className="mt-1 text-xs text-gray-400">Max 120 characters</p>
              </div>
            </div>
          </div>

          {/* Permissions Section */}
          <div className="min-h-0 p-5 bg-white border rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Permissions</h2>
              {formData.permissionKeys.length > 0 && (
                <span className="px-3 py-1 text-sm font-medium text-blue-600 rounded-full bg-blue-50">
                  {formData.permissionKeys.length} selected
                </span>
              )}
            </div>

            {/* Scrollable Permissions Container - FIXED WITH INLINE STYLES */}
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
                    {/* Module Header with Select All */}
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
                            ref={(el) => {
                              if (el) el.indeterminate = someSelected && !allSelected;
                            }}
                            onChange={() => handleModuleToggle(perms)}
                            className="sr-only peer"
                          />
                          <div className={`w-4.5 h-4.5 border-2 rounded transition-all flex items-center justify-center
                            ${allSelected 
                              ? 'bg-blue-600 border-blue-600' 
                              : someSelected 
                                ? 'bg-blue-100 border-blue-400' 
                                : 'border-gray-300 bg-white hover:border-blue-400'
                            }`}
                          >
                            {allSelected && (
                              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            {someSelected && !allSelected && (
                              <div className="w-2.5 h-2.5 bg-blue-500 rounded-sm"></div>
                            )}
                          </div>
                        </div>
                        <span className={`transition-colors ${allSelected ? 'text-blue-700 font-medium' : 'text-gray-600 group-hover:text-blue-600'}`}>
                          {allSelected ? 'Deselect All' : 'Select All'}
                        </span>
                      </label>
                    </div>
                    
                    {/* Permission Checkboxes Grid */}
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 pl-1">
                      {perms.map((p) => (
                        <label 
                          key={p.key} 
                          className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-white hover:shadow-sm cursor-pointer transition-all group border border-transparent hover:border-gray-200"
                        >
                          <input
                            type="checkbox"
                            checked={formData.permissionKeys.includes(p.key)}
                            onChange={() => handlePermissionToggle(p.key)}
                            className="mt-0.5 w-4.5 h-4.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-gray-800 transition-colors group-hover:text-blue-700">
                              {p.name}
                            </span>
                            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{p.description}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* Helper + Clear Button */}
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-gray-500">
                💡 Select permissions that define what this role can do
              </p>
              {formData.permissionKeys.length > 0 && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, permissionKeys: [] }))}
                  className="text-xs font-medium text-red-500 hover:text-red-700 hover:underline"
                >
                  Clear all selections
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {submitting ? (
                <>
                  <svg className="w-4 h-4 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  Create Role
                </>
              )}
            </button>
          </div>
        </form>

        {/* Safety Note */}
        <div className="p-4 mt-8 border border-yellow-200 rounded-lg bg-yellow-50">
          <div className="flex gap-2">
            <FaExclamationTriangle className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Best Practices</h4>
              <ul className="mt-1 space-y-1 text-sm text-yellow-700 list-disc list-inside">
                <li>Give roles descriptive names (e.g., "Junior Recruiter" vs "Recruiter")</li>
                <li>Start with minimal permissions; you can always add more later</li>
                <li>Avoid granting admin-level permissions unless absolutely necessary</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </SettingsLayout>
  );
};

export default CreateRolePage;