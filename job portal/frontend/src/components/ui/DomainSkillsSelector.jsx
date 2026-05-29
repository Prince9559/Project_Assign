import React, {useState} from "react";
import {
  Input,
  Button,
  Textarea,
  Select,
  SuccessMessage,
  ErrorMessage,
  Label,
} from "../ui";

import { FaTimes, FaInfoCircle } from "react-icons/fa";
const REQUIRED_FIELDS = [
  "opportunity_type",
  "job_role_id",
  "skill_ids",
  "job_type",
  "job_time",
  "number_of_openings",
  "job_description",
  "phone_contact",
  "eligiblecity_ids",

  // logic/condition based mandatory
  "stipend_type",
  "duration",
  "duration_id",
  "internship_start_date",
];

export const DomainSkillsSelector = ({
  domains = [],
  getSkillsForDomain,
  onSkillsChange,
  error,
  selectedDomainSkills = [], // Controlled by parent
  onDomainSkillsChange, // Update parent state
}) => {
  const [searchInput, setSearchInput] = useState("");
  const [domainSkillsCache, setDomainSkillsCache] = useState({});

  // Filter domains based on search
  const filteredDomains = domains.filter((domain) =>
    (domain.domain_name || domain.name || "")
      .toLowerCase()
      .includes(searchInput.toLowerCase())
  );

  // Add domain
  const handleAddDomain = (domain) => {
    // console.log("🔵 handleAddDomain called with:", domain);

    const domainId = domain.domain_id || domain.id;
    const domainName =
      domain.domain_name || domain.name || `Domain ${domainId}`;

    // console.log("🔵 Processing - domainId:", domainId, "domainName:", domainName);

    // Check if already selected
    if (!selectedDomainSkills.find((d) => (d.domain_id || d.id) === domainId)) {
      // console.log("🔵 Domain not found in selected, adding...");

      // Get skills for this domain (cache them)
      const skills = getSkillsForDomain(domainId) || [];
      // console.log("🔵 Got skills for domain:", skills.length, "skills");

      const newDomainSkills = [
        ...selectedDomainSkills,
        { ...domain, id: domainId, name: domainName, selectedSkills: [] },
      ];
      onDomainSkillsChange(newDomainSkills);
      setDomainSkillsCache((prev) => ({ ...prev, [domainId]: skills }));

      // console.log("🔵 Domain added successfully");
    } else {
      // console.log("🔵 Domain already exists in selected domains");
    }

    setSearchInput("");
  };

  // Remove domain
  const handleRemoveDomain = (domainId) => {
    // console.log("🟡 Removing domain:", domainId);

    const remainingDomains = selectedDomainSkills.filter(
      (d) => (d.domain_id || d.id) !== domainId
    );
    onDomainSkillsChange(remainingDomains);

    setDomainSkillsCache((prev) => {
      const newCache = { ...prev };
      delete newCache[domainId];
      return newCache;
    });

    // Notify parent with remaining skills
    const allSkills = remainingDomains
      .flatMap((d) => d.selectedSkills || [])
      .map((s) => s.skill_id);
    onSkillsChange(allSkills);
  };

  // Toggle skill for a domain
  const toggleSkill = (domainId, skill) => {
    // console.log("🔴 Toggling skill:", skill.skill_name, "for domain:", domainId);

    const updatedDomains = selectedDomainSkills.map((domain) => {
      const currentDomainId = domain.domain_id || domain.id;

      if (currentDomainId === domainId) {
        const currentSkills = domain.selectedSkills || [];
        const skillExists = currentSkills.some(
          (s) => s.skill_id === skill.skill_id
        );

        const updatedSkills = skillExists
          ? currentSkills.filter((s) => s.skill_id !== skill.skill_id)
          : [
              ...currentSkills,
              { skill_id: skill.skill_id, skill_name: skill.skill_name },
            ];

        const updatedDomain = { ...domain, selectedSkills: updatedSkills };
        // console.log("Updated domain with skills:", updatedDomain);

        return updatedDomain;
      }
      return domain;
    });

    // Update parent state and notify
    onDomainSkillsChange(updatedDomains);

    // Notify parent of skill changes
    const allSkills = updatedDomains
      .flatMap((d) => d.selectedSkills || [])
      .map((s) => s.skill_id);
    onSkillsChange(allSkills);
  };

  return (
    <div>
      <Label htmlFor="skills">
        Skills Required
        {REQUIRED_FIELDS.includes("skill_ids") && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </Label>

      {/* Domain Search */}
      <div className="flex items-center px-2 py-2 mb-2 transition-all duration-200 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-[rgba(155,200,124,0.3)] focus-within:border-[#9bc87c] hover:border-[#9bc87c]">
        <input
          type="text"
          className="flex-1 text-sm outline-none"
          placeholder="Search and add domains..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      {/* Matched Domains */}
      {searchInput.trim() && filteredDomains.length > 0 && (
        <div className="mb-3">
          <div className="mb-2 text-xs text-gray-500">Matched domains</div>
          <div className="flex flex-wrap gap-2">
            {filteredDomains.slice(0, 8).map((domain) => {
              const domainId = domain.domain_id || domain.id;
              const domainName =
                domain.domain_name || domain.name || `Domain ${domainId}`;
              return (
                <button
                  key={domainId}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    // console.log("🔵 Domain button clicked:", domain);
                    handleAddDomain(domain);
                  }}
                  className="px-2 py-1 text-xs text-green-800 transition-all duration-200 bg-[#eaf4e3] border border-[#9bc87c] rounded-md hover:border-[#88b86a]"
                >
                  {domainName} +
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Domains + Skills */}
      <div className="space-y-3">
        {selectedDomainSkills.map((domain) => {
          const domainId = domain.domain_id || domain.id;
          const domainName =
            domain.domain_name || domain.name || `Domain ${domainId}`;

          // Get skills for this domain - fetch directly without causing re-renders
          const skills =
            domainSkillsCache[domainId] || getSkillsForDomain(domainId) || [];
          const selectedSkills = domain.selectedSkills || [];

          return (
            <div
              key={domainId}
              className="flex flex-col gap-2 p-3 border rounded-md"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-1 text-xs font-medium text-white bg-[#9bc87c] rounded-md">
                  {domainName}
                </span>
                <button
                  type="button"
                  className="text-xs text-red-500 hover:text-red-700"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveDomain(domainId);
                  }}
                >
                  Remove
                </button>
              </div>

              {/* Skills for this domain */}
              {skills.length > 0 && (
                <div>
                  <div className="mb-2 text-xs text-gray-500">
                    Select skills for {domainName}:
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {skills.map((skill) => {
                      const isSelected = selectedSkills.some(
                        (s) => s.skill_id === skill.skill_id
                      );
                      return (
                        <button
                          key={skill.skill_id}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            toggleSkill(domainId, skill);
                          }}
                          className={`rounded-md px-2 py-1 text-xs border transition-all duration-200 ${
                            isSelected
                              ? "bg-[#9bc87c] text-white border-[#9bc87c]"
                              : "bg-gray-100 text-gray-800 border-gray-300 hover:border-[#9bc87c]"
                          }`}
                        >
                          {skill.skill_name}
                        </button>
                      );
                    })}
                  </div>

                  {selectedSkills.length > 0 && (
                    <div className="mt-2 text-xs text-green-600">
                      Selected: {selectedSkills.length} skill(s)
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};