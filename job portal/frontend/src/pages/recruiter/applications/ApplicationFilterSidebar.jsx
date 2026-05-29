import React, { useState, useEffect } from "react";

const ApplicationFilterSidebar = ({ filters, onChange }) => {
  // Local state mirrors `filters` prop for smooth UX (controlled component)
  const [localFilters, setLocalFilters] = useState(filters);

  // Sync external changes (e.g., reset from parent)
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleChange = (key, value) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onChange(updated); // Notify parent immediately
  };

  const handleMultiSelectToggle = (key, option) => {
    const current = localFilters[key] || [];
    const updated = current.includes(option)
      ? current.filter((item) => item !== option)
      : [...current, option];
    handleChange(key, updated);
  };

  const handleRangeChange = (key, bound, value) => {
    const current = localFilters[key] || [0, 100];
    const updated = [...current];
    updated[bound === "min" ? 0 : 1] = Number(value);
    handleChange(key, updated);
  };

  const clearAll = () => {
    onChange({
      location: [],
      skills: [],
      matchScore: [0, 100],
      gender: [],
      graduationYear: [],
      educationBackground: [],
      assignmentSent: null, // null = "All", true = "Sent", false = "Not Sent"
      interviewScheduled: null,
    });
  };

  return (
    <div className="w-full max-w-xs p-4 bg-white rounded-lg shadow h-fit">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
        <button
          onClick={clearAll}
          className="text-sm text-blue-600 hover:underline"
        >
          Clear all
        </button>
      </div>

      {/* Most Popular */}
      <div className="mb-6">
        <h3 className="mb-2 text-sm font-medium text-gray-700">Most Popular</h3>

        {/* Location */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Applicant Location
          </label>
          <input
            type="text"
            placeholder="e.g., Mumbai, Bangalore"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={localFilters?.locationText || ""}
            onChange={(e) => handleChange("locationText", e.target.value)}
          />
          {/* Optional: Use multi-select chips if you have location list from API */}
        </div>

        {/* Skills */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Skills
          </label>
          <input
            type="text"
            placeholder="e.g., React, Python"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={localFilters?.skillsText || ""}
            onChange={(e) => handleChange("skillsText", e.target.value)}
          />
        </div>

        {/* Resume Match */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Resume Match: {localFilters?.matchScore?.[0]}% –{" "}
            {localFilters?.matchScore?.[1]}%
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              max="100"
              value={localFilters?.matchScore?.[0] || 0}
              onChange={(e) =>
                handleRangeChange("matchScore", "min", e.target.value)
              }
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
            />
            <span className="text-gray-500">–</span>
            <input
              type="number"
              min="0"
              max="100"
              value={localFilters?.matchScore?.[1] || 100}
              onChange={(e) =>
                handleRangeChange("matchScore", "max", e.target.value)
              }
              className="w-16 px-2 py-1 text-sm border border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* Application Progress */}
      <div className="mb-6">
        <h3 className="mb-2 text-sm font-medium text-gray-700">
          Application Progress
        </h3>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="assignment"
              checked={localFilters?.assignmentSent === null}
              onChange={() => handleChange("assignmentSent", null)}
              className="mr-2 text-blue-600"
            />
            <span className="text-sm text-gray-700">All</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="assignment"
              checked={localFilters?.assignmentSent === false}
              onChange={() => handleChange("assignmentSent", false)}
              className="mr-2 text-blue-600"
            />
            <span className="text-sm text-gray-700">Assignment Not Sent</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="assignment"
              checked={localFilters?.assignmentSent === true}
              onChange={() => handleChange("assignmentSent", true)}
              className="mr-2 text-blue-600"
            />
            <span className="text-sm text-gray-700">Assignment Sent</span>
          </label>

          <label className="flex items-center mt-3">
            <input
              type="radio"
              name="interview"
              checked={localFilters?.interviewScheduled === null}
              onChange={() => handleChange("interviewScheduled", null)}
              className="mr-2 text-blue-600"
            />
            <span className="text-sm text-gray-700">All</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="interview"
              checked={localFilters?.interviewScheduled === false}
              onChange={() => handleChange("interviewScheduled", false)}
              className="mr-2 text-blue-600"
            />
            <span className="text-sm text-gray-700">
              Interview Not Scheduled
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="interview"
              checked={localFilters?.interviewScheduled === true}
              onChange={() => handleChange("interviewScheduled", true)}
              className="mr-2 text-blue-600"
            />
            <span className="text-sm text-gray-700">Interview Scheduled</span>
          </label>
        </div>
      </div>

      {/* Gender */}
      <div className="mb-6">
        <h3 className="mb-2 text-sm font-medium text-gray-700">Gender</h3>
        <div className="space-y-2">
          {["Male", "Female", "Others"].map((option) => (
            <label key={option} className="flex items-center">
              <input
                type="checkbox"
                checked={(localFilters?.gender || []).includes(option)}
                onChange={() => handleMultiSelectToggle("gender", option)}
                className="mr-2 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="mb-6">
        <h3 className="mb-2 text-sm font-medium text-gray-700">Education</h3>

        {/* Graduation Year */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Graduation Year
          </label>
          <div className="flex flex-wrap gap-2">
            {[2023, 2024, 2025, 2026].map((year) => (
              <button
                key={year}
                type="button"
                onClick={() => handleMultiSelectToggle("graduationYear", year)}
                className={`px-2.5 py-1 text-xs rounded-full border ${
                  (localFilters?.graduationYear || []).includes(year)
                    ? "bg-blue-100 border-blue-500 text-blue-700"
                    : "bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* Education Background */}
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Education Background
          </label>
          <input
            type="text"
            placeholder="e.g., MBA, B.Tech"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={localFilters?.educationBackgroundText || ""}
            onChange={(e) =>
              handleChange("educationBackgroundText", e.target.value)
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ApplicationFilterSidebar;
