import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useFormContext, useWatch, Controller } from "react-hook-form";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import ReactSelectDropdown from "../../../components/ui/ReactSelectDropdown";
import { Label , Input } from "../../../components/ui";
import { Button } from "../../../components/ui";
import GreenCreatableSelect from "../../../components/StudentPannel/CreatableSelect";
import AddButton from "../../../components/StudentPannel/AddButton";
import {
  FaTimes,
  FaPlus,
  FaFileAlt,
  FaBuilding,
  FaTrash,
  FaSearch,
  FaSpinner,
  FaInfoCircle,
} from "react-icons/fa";
import useUploadImageApi from "../../../hooks/useUploadImageApi";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const THEME = {
  light: "#9BC87C",
  bright: "#00C950",
  dark: "#1DB32F",
  text: "#1e1e2d",
};

// Consistent input height & styling (match Personal/Education green UI)
const inputClass =
  "w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:ring-1 focus:ring-[#9BC87C] focus:border-[#1DB32F] outline-none bg-white";
const labelClass = "block text-sm font-medium text-slate-700 mb-1.5";

// Unified select styles
const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "44px",
    borderColor: state.isFocused ? THEME.dark : "#cbd5e1",
    boxShadow: state.isFocused
      ? `0 0 0 3px ${THEME.light}33`
      : "none",
    borderRadius: "8px",
    fontSize: "14px",
    backgroundColor: "white",
    "&:hover": { borderColor: "#94a3b8" },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#94a3b8",
    fontWeight: 400,
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#1e293b",
    fontWeight: 500,
  }),
  menu: (provided) => ({
    ...provided,
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  }),
  option: (provided, state) => ({
    ...provided,
    padding: "10px 14px",
    backgroundColor: state.isSelected
      ? `${THEME.light}33`
      : state.isFocused
      ? `${THEME.light}1F`
      : "white",
    color: THEME.text,
  }),
};

// Generate a stable unique ID
const generateId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return (
    "id-" + Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
  );
};

// Match domain rows to an authority card (string-safe ids)
const domainMatchesAuthority = (domain, authorityId, organizationName) => {
  const isOther = authorityId === "other";
  if (isOther) {
    return (
      (domain.authority_id == null || domain.authority_id === "other") &&
      (domain.organization_name || "").trim() === (organizationName || "").trim()
    );
  }
  return String(domain.authority_id) === String(authorityId);
};

// Helper to validate date range
const isValidDateRange = (start, end, userDob) => {
  if (!start) return true;
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : null;
  const dobDate = userDob ? new Date(userDob) : null;
  if (dobDate && startDate < dobDate) {
    return "Start date cannot be before your date of birth";
  }
  if (endDate && startDate > endDate) {
    return "Start date cannot be after end date";
  }
  return true;
};

// Calculate total months between two dates
const calculateTotalMonths = (start, end) => {
  if (!start) return 0;
  const startDate = new Date(start + "-01");
  const endDate = end ? new Date(end + "-01") : new Date();
  let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
  months -= startDate.getMonth();
  months += endDate.getMonth();
  return Math.max(0, months);
};

// Debounce hook for API calls
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ============================================================================
// SUB-COMPONENT: SubSkill Search (MOVED OUTSIDE to prevent focus loss)
// ============================================================================
function SubSkillSearchInput({
  cardId,
  domainId,
  isCustomDomain,
  existingSkills,
  onAddSkill,
  onRemoveSkill,
  onToggleSkill,
  onExperienceChange,
  subSkillSearchMap,
  setSubSkillSearchMap,
  activeSubSkillCardId,
  setActiveSubSkillCardId,
  subSkillOptions,
  isSubSkillLoading,
  cachedSubSkills,
  fetchSuggestedSubSkillsForCard,
  subSkillError,
}) {
  const localSearch = subSkillSearchMap[cardId] || "";
  const isSearching = activeSubSkillCardId === cardId;

  // Fetch suggested sub-skills when component mounts for this card
  useEffect(() => {
    if (domainId && !isCustomDomain && !cachedSubSkills[cardId]) {
      console.log("[SubSkillSearchInput] Fetching suggested sub-skills for card:", cardId, "domain:", domainId);
      fetchSuggestedSubSkillsForCard(cardId, domainId);
    }
  }, [cardId, domainId, isCustomDomain, cachedSubSkills, fetchSuggestedSubSkillsForCard]);

  const suggestedSubSkills = cachedSubSkills[cardId] || [];
  const isSubSkillsLoading = isSubSkillLoading && activeSubSkillCardId === cardId;

  const handleSearchChange = useCallback((e) => {
    const val = e.target.value;
    console.log("[SubSkillSearchInput] Input changed for card:", cardId, "value:", val);
    setActiveSubSkillCardId(cardId);
    setSubSkillSearchMap((prev) => ({ ...prev, [cardId]: val }));
  }, [cardId, setActiveSubSkillCardId, setSubSkillSearchMap]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" && localSearch.trim()) {
      e.preventDefault();
      if (!isCustomDomain) {
        const matched = subSkillOptions.find(
          (s) => s.name.toLowerCase() === localSearch.toLowerCase()
        );
        if (matched) {
          onAddSkill(cardId, localSearch, matched);
        } else {
          onAddSkill(cardId, localSearch);
        }
      } else {
        onAddSkill(cardId, localSearch);
      }
    } else if (e.key === "Escape") {
      setSubSkillSearchMap((prev) => ({ ...prev, [cardId]: "" }));
      setActiveSubSkillCardId(null);
    }
  }, [cardId, localSearch, isCustomDomain, subSkillOptions, onAddSkill, setSubSkillSearchMap, setActiveSubSkillCardId]);

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <FaSearch className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
        <input
          key={`skill-input-${cardId}`}
          type="text"
          className="w-full py-2 pr-3 text-sm transition-shadow border border-gray-300 rounded-md outline-none pl-9 focus:ring-1 focus:ring-[#9BC87C] focus:border-[#1DB32F]"
          placeholder={isCustomDomain ? "Type a skill and press Enter or Add" : "Type a skill (min 2 chars) or pick below"}
          value={localSearch}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setActiveSubSkillCardId(cardId)}
          autoComplete="off"
        />
        {localSearch.trim().length > 0 && (
          <button
            type="button"
            className="absolute right-2 top-1.5 px-2 py-1 text-xs font-medium text-white bg-[#1DB32F] rounded hover:bg-[#00C950]"
            onClick={() => {
              const term = localSearch.trim();
              if (!term) return;
              const matched = subSkillOptions.find(
                (s) => s.name.toLowerCase() === term.toLowerCase()
              );
              onAddSkill(cardId, term, matched || undefined);
              setSubSkillSearchMap((prev) => ({ ...prev, [cardId]: "" }));
              setActiveSubSkillCardId(null);
            }}
          >
            Add
          </button>
        )}
        {isSearching && localSearch.length >= 2 && (isSubSkillLoading || subSkillOptions.length > 0) && (
          <div className="absolute z-20 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-48">
            {isSubSkillLoading ? (
              <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>
            ) : subSkillOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                No skills found. Press Enter to add "{localSearch}" as custom.
              </div>
            ) : (
              subSkillOptions.map((skill) => {
                const isSelected = existingSkills?.some(
                  (s) => s.skill_id === skill.id || s.other_skill_name?.toLowerCase() === skill.name.toLowerCase()
                );
                return (
                  <button
                    key={skill.id}
                    type="button"
                    disabled={isSelected}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-[#9BC87C]/10 transition-colors ${isSelected ? "bg-gray-50 text-gray-400 cursor-not-allowed" : "text-gray-700"
                      }`}
                    onClick={() => onAddSkill(cardId, skill.name, skill)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{skill.name}</span>
                      {isSelected && <span className="text-xs font-medium text-green-600">Added</span>}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Quick add hint for custom */}
      {isSearching && localSearch.length >= 2 && subSkillOptions.length === 0 && !isSubSkillLoading && (
        <div
          className="mt-1 text-xs text-[#1DB32F] cursor-pointer hover:underline"
          onClick={() => onAddSkill(cardId, localSearch)}
        >
          + Add "{localSearch}" as custom skill
        </div>
      )}

      {/* Selected Skills as Chips */}
      {existingSkills && existingSkills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {existingSkills.map((skill, idx) => {
            const skillName = skill.other_skill_name || skill.skill_name;
            const skillId = skill.skill_id;
            return (
              <div
                key={`${cardId}-skill-${idx}`}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-sm bg-[#9BC87C]/10 border-[#9BC87C]/40 text-[#1e1e2d]"
              >
                <span className="font-medium">{skillName}</span>
                <div className="flex items-center gap-1 pl-2 border-l border-[#9BC87C]/60">
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={skill.experience_months ?? ""}
                    onChange={(e) =>
                      onExperienceChange(cardId, skillId, skillName, e.target.value)
                    }
                    placeholder="mo"
                    className="w-12 px-1 py-0.5 text-xs border border-[#9BC87C]/60 rounded focus:ring-1 focus:ring-[#9BC87C] outline-none"
                  />
                  <span className="text-xs text-[#1DB32F]">mo</span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    skill.other_skill_name
                      ? onRemoveSkill(cardId, skill.other_skill_name)
                      : onToggleSkill(cardId, { id: skill.skill_id, name: skill.skill_name })
                  }
                  className="text-[#1DB32F] hover:text-red-600 p-0.5"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Suggested Sub-skills Chips (only for predefined domains) */}
      {!isCustomDomain && suggestedSubSkills.length > 0 && (
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Suggested Sub Skills
            </span>
            {isSubSkillsLoading && suggestedSubSkills.length === 0 && (
              <FaSpinner className="text-xs text-gray-400 animate-spin" />
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedSubSkills.map((skill) => {
              const isSelected = existingSkills?.some(
                (s) => s.skill_id === skill.id || s.other_skill_name?.toLowerCase() === skill.name.toLowerCase()
              );
              if (isSelected) return null;
              return (
                <button
                  key={skill.id}
                  type="button"
                  onClick={() => onAddSkill(cardId, skill.name, skill)}
                  className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all flex items-center gap-1"
                >
                  {skill.name}
                  <FaPlus className="w-2.5 h-2.5 opacity-60" />
                </button>
              );
            })}
          </div>
        </div>
      )}

      {subSkillError && (
        <p className="text-xs text-red-500">{subSkillError}</p>
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENT: Domain Search with Creatable (MOVED OUTSIDE)
// ============================================================================
function DomainSearchCreatable({
  selectedAuthorityId,
  selectedAuthorityType,
  organization_name,
  start_date,
  end_date,
  job_role_id,
  other_job_role,
  onAdd,
  domainOptions,
  isDomainLoading,
  domainError,
  domainSearch,
  setDomainSearch,
}) {
  const [inputValue, setInputValue] = useState("");

  const predefinedDomainOptions = useMemo(() => {
    const opts = (domainOptions || [])
      .filter((d) => d.id != null)
      .map((d) => ({
        value: String(d.id),
        label: d.name,
      }));
    return opts;
  }, [domainOptions]);

  const addDomainFromInput = useCallback(
    (rawName) => {
      const name = (rawName || "").trim();
      if (!name) return;
      const match = predefinedDomainOptions.find(
        (o) => o.label.toLowerCase() === name.toLowerCase()
      );
      const domainData = match
        ? { id: parseInt(match.value, 10), name: match.label, __isNew__: false }
        : { id: null, name, __isNew__: true };
      onAdd(
        selectedAuthorityId,
        selectedAuthorityType,
        domainData,
        start_date,
        end_date,
        job_role_id,
        other_job_role,
        organization_name
      );
      setInputValue("");
      setDomainSearch("");
    },
    [
      onAdd,
      predefinedDomainOptions,
      selectedAuthorityId,
      selectedAuthorityType,
      start_date,
      end_date,
      job_role_id,
      other_job_role,
      organization_name,
      setDomainSearch,
    ]
  );

  const handleCreateOrSelect = useCallback(
    (opt) => {
      if (!opt) return;
      if (opt.__isNew__) {
        addDomainFromInput(opt.value || opt.label);
        return;
      }
      addDomainFromInput(opt.label);
    },
    [addDomainFromInput]
  );

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-600">
        Skill area / domain (e.g. Web Development)
      </label>
      <CreatableSelect
        inputValue={inputValue}
        onInputChange={(val, meta) => {
          if (meta.action === "input-change") {
            setInputValue(val);
            setDomainSearch(val);
          }
          return val;
        }}
        formatCreateLabel={(input) => `Add "${input}"`}
        isSearchable
        filterOption={() => true}
        onChange={handleCreateOrSelect}
        onCreateOption={(input) => addDomainFromInput(input)}
        options={predefinedDomainOptions}
        placeholder="Type area name, press Enter or pick Add..."
        isClearable
        styles={selectStyles}
        components={{ IndicatorSeparator: () => null }}
        isLoading={isDomainLoading}
      />
      {inputValue.trim().length > 0 && (
        <button
          type="button"
          className="text-xs font-medium text-[#1DB32F] hover:underline"
          onClick={() => addDomainFromInput(inputValue)}
        >
          + Add area &quot;{inputValue.trim()}&quot;
        </button>
      )}
      {domainError && (
        <p className="text-xs text-red-500">{domainError}</p>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function SkillsForm() {
  const {
    setValue,
    control,
    formState: { errors },
  } = useFormContext();
  const domains = useWatch({ control, name: "domains" }) || [];
  const dob = useWatch({ control, name: "dob" });
  const educations = useWatch({ control, name: "educations" }) || [];
  const { uploadImage } = useUploadImageApi();
  const debounceTimeouts = useRef({});

  console.log("[SkillsForm] Render started, domains count:", domains.length);

  // ========== SEARCH & CACHE STATE (4 variables per entity) ==========
  // Job Roles
  const [jobRoleSearch, setJobRoleSearch] = useState("");
  const [jobRoleOptions, setJobRoleOptions] = useState([]);
  const [isJobRoleLoading, setIsJobRoleLoading] = useState(false);
  const [jobRoleError, setJobRoleError] = useState(null);
  const [cachedJobRoles, setCachedJobRoles] = useState([]);

  // Authority (Companies)
  const [authoritySearch, setAuthoritySearch] = useState("");
  const [authorityOptions, setAuthorityOptions] = useState([]);
  const [isAuthorityLoading, setIsAuthorityLoading] = useState(false);
  const [authorityError, setAuthorityError] = useState(null);
  const [cachedAuthorities, setCachedAuthorities] = useState([]);

  // Domains
  const [domainSearch, setDomainSearch] = useState("");
  const [domainOptions, setDomainOptions] = useState([]);
  const [isDomainLoading, setIsDomainLoading] = useState(false);
  const [domainError, setDomainError] = useState(null);
  const [cachedDomains, setCachedDomains] = useState([]);

  // Sub-skills (scoped per domain card)
  const [subSkillSearchMap, setSubSkillSearchMap] = useState({});
  const [subSkillOptions, setSubSkillOptions] = useState([]);
  const [isSubSkillLoading, setIsSubSkillLoading] = useState(false);
  const [subSkillError, setSubSkillError] = useState(null);
  const [activeSubSkillCardId, setActiveSubSkillCardId] = useState(null);
  const [cachedSubSkills, setCachedSubSkills] = useState({});

  // Suggested Domains (per authority card based on job role)
  const [suggestedDomainsMap, setSuggestedDomainsMap] = useState({});
  const [suggestedDomainsLoadingMap, setSuggestedDomainsLoadingMap] = useState({});

  // Local state for authority cards and extra domain rows
  const [authorityCards, setAuthorityCards] = useState([]);
  const [extraDomainRows, setExtraDomainRows] = useState({});

  // Track which jobRoleId was last fetched for each card
  const [fetchedJobRoleMap, setFetchedJobRoleMap] = useState({});

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimeouts.current).forEach(clearTimeout);
    };
  }, []);

  // ========== AUTHORITY OPTIONS (from user's education history) ==========
  const flatAuthorityOptions = useMemo(() => {
    console.log("[flatAuthorityOptions] Building options, educations:", educations?.length);
    const options = [];
    const seenLabels = new Set();

    (educations || []).forEach((edu) => {
      let label = "";
      let value = null;
      let type = "UNIVERSITY";

      if (edu.school_college_id) {
        const inst = { id: edu.school_college_id, name: edu.other_institution_name || `Institution ${edu.school_college_id}` };
        if (inst.name && !seenLabels.has(inst.name)) {
          label = inst.name;
          value = String(inst.id);
          seenLabels.add(label);
        }
      } else if (edu.other_institution_name?.trim()) {
        label = edu.other_institution_name.trim();
        value = `custom-edu-${label}`;
        seenLabels.add(label);
      }

      if (label && value) {
        options.push({
          value,
          label,
          type,
          __isCustomEducation: edu.other_institution_name?.trim() ? true : false,
        });
      }
    });

    console.log("[flatAuthorityOptions] Final options count:", options.length);
    return options;
  }, [educations]);



  // ========== COMBINED AUTHORITY OPTIONS (DEDUPLICATED BY ID) ==========
  const combinedAuthorityOptions = useMemo(() => {
    console.log("[combinedAuthorityOptions] Building combined options...");
    const allOptions = [
      // ...flatAuthorityOptions,
      ...cachedAuthorities,
      ...authorityOptions,
    ];

    // Deduplicate by value (ID)
    const seen = new Map();
    allOptions.forEach((opt) => {
      if (!seen.has(opt.value)) {
        seen.set(opt.value, opt);
      }
    });

    const unique = Array.from(seen.values());
    console.log("[combinedAuthorityOptions] Total:", allOptions.length, "Unique:", unique.length);
    return unique;
  }, [flatAuthorityOptions, cachedAuthorities, authorityOptions]);

  // ========== JOB ROLE SEARCH API ==========
  const debouncedJobRoleSearch = useDebounce(jobRoleSearch, 300);
  useEffect(() => {
    console.log("[JobRole Search] debounced value:", debouncedJobRoleSearch);
    if (debouncedJobRoleSearch.length < 3) {
      setJobRoleOptions([]);
      setJobRoleError(null);
      return;
    }
    const fetchJobRoles = async () => {
      console.log("[JobRole Search] Fetching from API...");
      setIsJobRoleLoading(true);
      setJobRoleError(null);
      try {
        const res = await axios.get(`${BASE_URL}/master/job-roles/search`, {
          params: { search: debouncedJobRoleSearch.trim(), limit: 10 },
          timeout: 5000,
        });
        console.log("[JobRole Search] API response:", res.data);
        if (res.data?.success) {
          const normalized = (res.data.data || [])
            .filter((role) => role.id && role.title)
            .map((role) => ({
              id: typeof role.id === "string" ? parseInt(role.id, 10) : Number(role.id),
              title: role.title.trim(),
            }))
            .filter((role) => !isNaN(role.id));
          setJobRoleOptions(normalized);
          console.log("[JobRole Search] Normalized options:", normalized.length);
        }
      } catch (err) {
        console.error("[JobRole Search] Failed:", err);
        setJobRoleError("Failed to load job profiles. Please try again.");
        setJobRoleOptions([]);
      } finally {
        setIsJobRoleLoading(false);
      }
    };
    fetchJobRoles();
  }, [debouncedJobRoleSearch]);

  // ========== AUTHORITY SEARCH API (Companies) ==========
  const debouncedAuthoritySearch = useDebounce(authoritySearch, 300);
  useEffect(() => {
    console.log("[Authority Search] debounced value:", debouncedAuthoritySearch);
    const fetchAuthorities = async () => {
      console.log("[Authority Search] Fetching companies from API...");
      setIsAuthorityLoading(true);
      setAuthorityError(null);
      try {
        const res = await axios.get(`${BASE_URL}/master/companies/search`, {
          // allow empty search to return a small default list; backend limits results
          params: { search: debouncedAuthoritySearch.trim(), limit: 10 },
          timeout: 5000,
        });
        console.log("[Authority Search] API response:", res.data);
        if (res.data?.success) {
          const normalized = (res.data.data || []).map((c) => ({
            value: String(c.id),
            label: c.company_name,
            id: c.id,
            name: c.company_name,
            type: "COMPANY",
          }));
          setAuthorityOptions(normalized);
          console.log("[Authority Search] Normalized options:", normalized.length);
          setCachedAuthorities((prev) => {
            const existing = new Map(prev.map((a) => [a.value, a]));
            normalized.forEach((n) => existing.set(n.value, n));
            return Array.from(existing.values());
          });
        }
      } catch (err) {
        console.error("[Authority Search] Failed:", err);
        setAuthorityError("Failed to load companies. Please try again.");
        setAuthorityOptions([]);
      } finally {
        setIsAuthorityLoading(false);
      }
    };

    // Always attempt to fetch (including when search is empty) so menu shows on focus/click
    fetchAuthorities();
  }, [debouncedAuthoritySearch]);

  // ========== DOMAIN SEARCH API ==========
  const debouncedDomainSearch = useDebounce(domainSearch, 300);
  useEffect(() => {
    console.log("[Domain Search] debounced value:", debouncedDomainSearch);
    if (debouncedDomainSearch.length < 3) {
      setDomainOptions([]);
      setDomainError(null);
      return;
    }
    const fetchDomains = async () => {
      console.log("[Domain Search] Fetching from API...");
      setIsDomainLoading(true);
      setDomainError(null);
      try {
        const res = await axios.get(`${BASE_URL}/master/domains/search`, {
          params: { search: debouncedDomainSearch.trim(), limit: 10 },
          timeout: 5000,
        });
        console.log("[Domain Search] API response:", res.data);
        if (res.data?.success) {
          const normalized = (res.data.data || []).map((d) => ({
            id: d.domain_id || d.id,
            name: d.domain_name || d.name,
          }));
          setDomainOptions(normalized);
          console.log("[Domain Search] Normalized options:", normalized.length);
          setCachedDomains((prev) => {
            const existing = new Map(prev.map((d) => [d.id, d]));
            normalized.forEach((n) => existing.set(n.id, n));
            return Array.from(existing.values());
          });
        }
      } catch (err) {
        console.error("[Domain Search] Failed:", err);
        setDomainError("Failed to load domains. Please try again.");
        setDomainOptions([]);
      } finally {
        setIsDomainLoading(false);
      }
    };
    fetchDomains();
  }, [debouncedDomainSearch]);

  // ========== SUB-SKILL SEARCH API (scoped to domain) ==========
  const activeSubSkillSearch = subSkillSearchMap[activeSubSkillCardId] || "";
  const debouncedSubSkillSearch = useDebounce(activeSubSkillSearch, 300);

  useEffect(() => {
    console.log("[SubSkill Search] activeCardId:", activeSubSkillCardId, "search:", debouncedSubSkillSearch);
    if (!debouncedSubSkillSearch || debouncedSubSkillSearch.length < 2 || !activeSubSkillCardId) {
      setSubSkillOptions([]);
      setSubSkillError(null);
      return;
    }
    const card = domains.find((d) => d._tempId === activeSubSkillCardId);
    const domainId = card?.domain_id;
    const isCustomDomain = card?.is_custom_domain;

    console.log("[SubSkill Search] Found domain:", { domainId, isCustomDomain });

    if (!domainId && !isCustomDomain) {
      setSubSkillOptions([]);
      return;
    }

    const fetchSubSkills = async () => {
      console.log("[SubSkill Search] Fetching from API...");
      setIsSubSkillLoading(true);
      setSubSkillError(null);
      try {
        if (isCustomDomain) {
          console.log("[SubSkill Search] Custom domain - no predefined skills");
          setSubSkillOptions([]);
        } else {
          const res = await axios.get(`${BASE_URL}/master/domains/${domainId}/sub-skills`, {
            params: { search: debouncedSubSkillSearch, limit: 15 },
            timeout: 5000,
          });
          console.log("[SubSkill Search] API response:", res.data);
          if (res.data?.success) {
            const normalized = (res.data.data || []).map((s) => ({
              id: s.skill_id,
              name: s.skill_name,
            }));
            setSubSkillOptions(normalized);
            console.log("[SubSkill Search] Normalized options:", normalized.length);
          }
        }
      } catch (err) {
        console.error("[SubSkill Search] Failed:", err);
        setSubSkillError("Failed to load skills. Please try again.");
        setSubSkillOptions([]);
      } finally {
        setIsSubSkillLoading(false);
      }
    };
    fetchSubSkills();
  }, [debouncedSubSkillSearch, activeSubSkillCardId, domains]);

  // ========== FETCH SUGGESTED DOMAINS PER AUTHORITY CARD (ONLY ON JOB ROLE CHANGE) ==========
  useEffect(() => {
    authorityCards.forEach((card) => {
      const jobRoleId = card.job_role_id;
      const cardId = card.id;

      // No job role - clear suggestions
      if (!jobRoleId || isNaN(jobRoleId)) {
        if (suggestedDomainsMap[cardId]?.length > 0) {
          setSuggestedDomainsMap((prev) => ({ ...prev, [cardId]: [] }));
        }
        return;
      }

      // Check if job role changed for this card
      const lastFetchedRoleId = fetchedJobRoleMap[cardId];
      if (lastFetchedRoleId === jobRoleId) {
        // Same job role - skip fetch (already loaded or loading)
        return;
      }

      // Job role changed - fetch new suggestions
      console.log("[Suggested Domains] Job role changed for card:", cardId, "from:", lastFetchedRoleId, "to:", jobRoleId);

      const fetchSuggested = async () => {
        setSuggestedDomainsLoadingMap((prev) => ({ ...prev, [cardId]: true }));
        try {
          const response = await axios.get(
            `${BASE_URL}/master/job-roles/${jobRoleId}/suggested-domains`,
            { params: { limit: 10 } }
          );
          if (response.data?.success) {
            const normalized = (response.data.data || []).map((d) => ({
              id: d.domain_id,
              name: d.domain_name,
            }));
            setSuggestedDomainsMap((prev) => ({
              ...prev,
              [cardId]: normalized,
            }));
            // Mark this job role as fetched for this card
            setFetchedJobRoleMap((prev) => ({
              ...prev,
              [cardId]: jobRoleId,
            }));
            console.log("[Suggested Domains] Fetched:", normalized.length, "domains for job role:", jobRoleId);
          }
        } catch (err) {
          console.error("[Suggested Domains] Failed:", err);
          setSuggestedDomainsMap((prev) => ({ ...prev, [cardId]: [] }));
        } finally {
          setSuggestedDomainsLoadingMap((prev) => ({ ...prev, [cardId]: false }));
        }
      };
      fetchSuggested();
    });
  }, [authorityCards, fetchedJobRoleMap]);


  // ========== FETCH SUGGESTED SUB-SKILLS FOR A DOMAIN CARD ==========
  const fetchSuggestedSubSkillsForCard = useCallback(async (cardId, domainId) => {
    if (!domainId) {
      console.log("[Suggested SubSkills] No domainId for card:", cardId);
      return;
    }
    if (cachedSubSkills[cardId]) {
      console.log("[Suggested SubSkills] Already cached for card:", cardId);
      return;
    }
    console.log("[Suggested SubSkills] Fetching for card:", cardId, "domain:", domainId);
    try {
      const res = await axios.get(`${BASE_URL}/master/domains/${domainId}/sub-skills`, {
        params: { limit: 10 },
      });
      if (res.data?.success) {
        const normalized = (res.data.data || []).map((s) => ({
          id: s.skill_id,
          name: s.skill_name,
        }));
        setCachedSubSkills((prev) => ({
          ...prev,
          [cardId]: normalized,
        }));
        console.log("[Suggested SubSkills] Cached:", normalized.length, "skills");
      }
    } catch (err) {
      console.error("[Suggested SubSkills] Failed:", err);
    }
  }, [cachedSubSkills]);

  // ========== INITIALIZE AUTHORITY CARDS FROM EXISTING DOMAINS ==========
  useEffect(() => {
    console.log("[Init Authority Cards] domains:", domains.length);
    const cardMap = new Map();
    domains.forEach((d) => {
      const key =
        d.authority_id !== null && d.authority_id !== undefined
          ? String(d.authority_id)
          : `other|${d.organization_name || ""}`;
      if (!cardMap.has(key)) {
        cardMap.set(key, {
          id: generateId(),
          selectedAuthorityId:
            d.authority_id != null ? d.authority_id : "other",
          selectedAuthorityType: d.authority_type || "COMPANY",
          organization_name:
            d.authority_id == null ? d.organization_name || "" : "",
          job_role_id: d.job_role_id || null,
          other_job_role: d.other_job_role || "",
          start_date: d.start_date || "",
          end_date: d.end_date || "",
        });
      }
    });
    const newCards = Array.from(cardMap.values());
    if (newCards.length === 0) {
      newCards.push({
        id: generateId(),
        selectedAuthorityId: null,
        selectedAuthorityType: null,
        organization_name: "",
        job_role_id: null,
        other_job_role: "",
        start_date: "",
        end_date: "",
      });
    }
    console.log("[Init Authority Cards] Created cards:", newCards.length);
    setAuthorityCards(newCards);
  }, []);

  // Sync authority cards with domains changes
  useEffect(() => {
    console.log("[Sync Authority Cards] domains changed:", domains.length);
    const domainAuthorityMap = new Map();
    domains.forEach((d) => {
      const key = d.authority_id != null ? d.authority_id : d.organization_name;
      if (key) {
        domainAuthorityMap.set(key, {
          start_date: d.start_date || "",
          end_date: d.end_date || "",
          authority_type: d.authority_type || null,
          job_role_id: d.job_role_id || null,
          other_job_role: d.other_job_role || "",
        });
      }
    });
    setAuthorityCards((prevCards) =>
      prevCards.map((card) => {
        const key =
          card.selectedAuthorityId === "other"
            ? card.organization_name
            : card.selectedAuthorityId;
        if (key && domainAuthorityMap.has(key)) {
          const data = domainAuthorityMap.get(key);
          return {
            ...card,
            start_date: data.start_date,
            end_date: data.end_date,
            selectedAuthorityType: data.authority_type,
            job_role_id: data.job_role_id,
            other_job_role: data.other_job_role,
          };
        }
        return card;
      })
    );
  }, [domains]);

  // ========== HELPER: GET AUTHORITY KEY FOR DEDUPLICATION ==========
  const getAuthorityKey = useCallback((card) => {
    return card.selectedAuthorityId === "other"
      ? `other|${card.organization_name?.trim() || ""}`
      : `auth|${card.selectedAuthorityId}`;
  }, []);

  // ========== ADD DOMAIN TO AUTHORITY ==========
  const handleAddDomainToAuthority = useCallback(
    (
      authorityId,
      authorityType,
      domainData,
      start_date,
      end_date,
      job_role_id,
      other_job_role,
      organization_name = ""
    ) => {
      console.log("[Add Domain] Called with:", {
        authorityId,
        authorityType,
        domainData,
        start_date,
        end_date,
        job_role_id,
      });

      const isNew = domainData.__isNew__;
      const isCustomDomain = isNew || domainData.id == null;
      const newDomainId = isCustomDomain
        ? null
        : typeof domainData.id === "string"
          ? parseInt(domainData.id, 10)
          : domainData.id;
      const newOtherDomainName = isCustomDomain ? domainData.name : "";

      const domainKey = isCustomDomain
        ? `custom|${newOtherDomainName.toLowerCase().trim()}`
        : `predefined|${newDomainId}`;
      const authorityKey =
        authorityId === "other"
          ? `other|${organization_name.toLowerCase().trim()}`
          : `auth|${authorityId}`;

      const alreadyExists = domains.some((d) => {
        const dAuthorityKey =
          d.authority_id === null
            ? `other|${(d.organization_name || "").toLowerCase().trim()}`
            : `auth|${d.authority_id}`;
        const dDomainKey =
          d.domain_id == null
            ? `custom|${(d.other_domain_name || "").toLowerCase().trim()}`
            : `predefined|${d.domain_id}`;
        return dAuthorityKey === authorityKey && dDomainKey === domainKey;
      });

      if (alreadyExists) {
        console.warn("[Add Domain] Domain already exists for this authority");
        return;
      }

      const newDomain = {
        domain_id: newDomainId,
        other_domain_name: newOtherDomainName,
        authority_id: authorityId === "other" ? null : authorityId,
        authority_type: authorityType,
        ...(authorityId === "other" && { organization_name }),
        job_role_id,
        other_job_role,
        certificate: [],
        certificateName: "",
        skills: [],
        start_date,
        end_date,
        _tempId: Date.now() + Math.random(),
        is_custom_domain: isCustomDomain,
        _tempDomainName: isCustomDomain ? newOtherDomainName : domainData.name,
      };

      console.log("[Add Domain] Creating new domain:", newDomain);
      setValue("domains", [...domains, newDomain], {
        shouldValidate: true,
        shouldDirty: true,
      });

      if (!isCustomDomain && newDomainId) {
        fetchSuggestedSubSkillsForCard(newDomain._tempId, newDomainId);
      }
    },
    [domains, setValue, fetchSuggestedSubSkillsForCard]
  );

  // ========== REMOVE AUTHORITY ==========
  const handleRemoveAuthority = useCallback(
    (authorityId) => {
      console.log("[Remove Authority] authorityId:", authorityId);
      const newDomains = domains.filter((d) => d.authority_id !== authorityId);
      setValue("domains", newDomains, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setAuthorityCards((prev) => {
        const newCards = prev.filter((card) => card.selectedAuthorityId !== authorityId);
        // Also clear fetched job role map for removed cards
        setFetchedJobRoleMap((prevMap) => {
          const newMap = { ...prevMap };
          prev.filter((card) => card.selectedAuthorityId === authorityId).forEach(card => {
            delete newMap[card.id];
          });
          return newMap;
        });
        return newCards;
      });
    },
    [domains, setValue]
  );

  // ========== REMOVE DOMAIN ==========
  const handleRemoveDomain = useCallback(
    (tempId) => {
      console.log("[Remove Domain] tempId:", tempId);
      setValue(
        "domains",
        domains.filter((d) => d._tempId !== tempId),
        { shouldValidate: true, shouldDirty: true }
      );
    },
    [domains, setValue]
  );

  // ========== CERTIFICATE UPLOAD ==========
  const handleCertificateChange = async (tempId, file) => {
    console.log("[Certificate Upload] tempId:", tempId, "file:", file?.name);
    if (!file) {
      setValue(
        "domains",
        domains.map((d) =>
          d._tempId === tempId
            ? { ...d, certificate: [], certificateName: "" }
            : d
        )
      );
      return;
    }
    try {
      const url = await uploadImage(file, "certificateImage");
      if (url) {
        setValue(
          "domains",
          domains.map((d) =>
            d._tempId === tempId
              ? { ...d, certificate: [url], certificateName: file.name }
              : d
          )
        );
        console.log("[Certificate Upload] Success:", url);
      }
    } catch (err) {
      console.error("[Certificate Upload] Failed:", err);
    }
  };

  // ========== ADD CUSTOM SUB-SKILL ==========
  const handleAddCustomSubSkill = useCallback(
    (tempId, rawSkillName, skillObj = null) => {
      const skillName = rawSkillName.trim();
      console.log("[Add SubSkill] tempId:", tempId, "skillName:", skillName, "skillObj:", skillObj);
      if (!skillName) return;

      setValue(
        "domains",
        domains.map((d) => {
          if (d._tempId !== tempId) return d;

          const isDuplicate = d.skills.some((s) => {
            if (skillObj?.id && s.skill_id === skillObj.id) return true;
            if (
              skillName &&
              (s.other_skill_name?.toLowerCase() === skillName.toLowerCase() ||
                s.skill_name?.toLowerCase() === skillName.toLowerCase())
            )
              return true;
            return false;
          });

          if (isDuplicate) {
            console.warn("[Add SubSkill] Skill already added");
            return d;
          }

          const newSkill = skillObj
            ? {
              skill_id:
                typeof skillObj.id === "string"
                  ? parseInt(skillObj.id, 10)
                  : Number(skillObj.id),
              skill_name: skillObj.name,
              experience_months: null,
            }
            : {
              other_skill_name: skillName,
              experience_months: null,
            };

          const totalMonths = calculateTotalMonths(d.start_date, d.end_date);
          const currentCount = d.skills.length + 1;
          const defaultMonths =
            totalMonths > 0 ? Math.max(1, Math.floor(totalMonths / currentCount)) : null;
          newSkill.experience_months = defaultMonths;

          console.log("[Add SubSkill] New skill:", newSkill);
          return {
            ...d,
            skills: [...d.skills, newSkill],
          };
        }),
        { shouldValidate: true, shouldDirty: true }
      );

      setSubSkillSearchMap((prev) => ({ ...prev, [tempId]: "" }));
      setSubSkillOptions([]);
      setActiveSubSkillCardId(null);
    },
    [domains, setValue]
  );

  // ========== REMOVE CUSTOM SUB-SKILL ==========
  const handleRemoveCustomSubSkill = useCallback(
    (tempId, skillName) => {
      console.log("[Remove SubSkill] tempId:", tempId, "skillName:", skillName);
      setValue(
        "domains",
        domains.map((d) => {
          if (d._tempId !== tempId) return d;
          return {
            ...d,
            skills: d.skills.filter(
              (s) => s.other_skill_name !== skillName && s.skill_name !== skillName
            ),
          };
        }),
        { shouldValidate: true, shouldDirty: true }
      );
    },
    [domains, setValue]
  );

  // ========== TOGGLE PREDEFINED SUB-SKILL ==========
  const handleToggleSubSkill = useCallback(
    (tempId, skill) => {
      console.log("[Toggle SubSkill] tempId:", tempId, "skill:", skill);
      setValue(
        "domains",
        domains.map((d) => {
          if (d._tempId !== tempId) return d;
          const isAlreadySelected = d.skills.some(
            (s) => s.skill_id === skill.id
          );
          if (isAlreadySelected) {
            return {
              ...d,
              skills: d.skills.filter((s) => s.skill_id !== skill.id),
            };
          } else {
            const totalMonths = calculateTotalMonths(d.start_date, d.end_date);
            const currentCount = d.skills.length + 1;
            const defaultMonths =
              totalMonths > 0 ? Math.max(1, Math.floor(totalMonths / currentCount)) : null;
            return {
              ...d,
              skills: [
                ...d.skills,
                {
                  skill_id:
                    typeof skill.id === "string"
                      ? parseInt(skill.id, 10)
                      : Number(skill.id),
                  skill_name: skill.name,
                  experience_months: defaultMonths,
                },
              ],
            };
          }
        }),
        { shouldValidate: true, shouldDirty: true }
      );
    },
    [domains, setValue]
  );

  // ========== UPDATE EXPERIENCE MONTHS FOR A SKILL ==========
  const handleExperienceChange = useCallback(
    (tempId, skillId, skillName, value) => {
      const numValue = value === "" ? null : Number(value);
      if (isNaN(numValue) && value !== "") return;
      console.log("[Experience Change] tempId:", tempId, "skillId:", skillId, "value:", numValue);

      setValue(
        "domains",
        domains.map((d) => {
          if (d._tempId !== tempId) return d;
          return {
            ...d,
            skills: d.skills.map((s) => {
              const match =
                (skillId && s.skill_id === skillId) ||
                (skillName &&
                  (s.other_skill_name === skillName || s.skill_name === skillName));
              if (match) {
                return { ...s, experience_months: numValue };
              }
              return s;
            }),
          };
        }),
        { shouldValidate: true, shouldDirty: true }
      );
    },
    [domains, setValue]
  );

  // ========== UPDATE AUTHORITY DATES ==========
  const updateCompanyDates = useCallback(
    (authorityId, start_date, end_date, job_role_id, other_job_role, organization_name) => {
      console.log("[Update Dates] authorityId:", authorityId, "dates:", { start_date, end_date });
      const newDomains = domains.map((d) => {
        if (domainMatchesAuthority(d, authorityId, organization_name)) {
          return { ...d, start_date, end_date, job_role_id, other_job_role };
        }
        return d;
      });
      setValue("domains", newDomains, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [domains, setValue]
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="text-center">
        <Label className="text-xl font-bold text-slate-800">
          Experience Info
        </Label>
        <p className="mt-2 text-sm text-slate-600">
          Add companies/institutes where you learned, the period, your role, and
          your skills.
        </p>
        <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          1) Company + dates + role → 2) Click <strong>Add skill area</strong> →
          3) Type each skill → click <strong>Add</strong> or Enter → 4) Next
        </p>
      </div>

      {errors.domains && (
        <div className="p-3 text-sm text-red-700 border border-red-200 rounded-lg bg-red-50">
          {errors.domains.message ||
            errors.domains.root?.message ||
            "Complete each experience: company, domain, and at least one skill."}
        </div>
      )}

      <div className="space-y-5">
        {authorityCards.map((card) => {
          const {
            id: cardId,
            selectedAuthorityId,
            selectedAuthorityType,
            organization_name,
            job_role_id,
            other_job_role,
            start_date,
            end_date,
          } = card;
          const dateError = isValidDateRange(start_date, end_date, dob);
          const isOtherSelected = selectedAuthorityId === "other";

          const authorityDomains = domains.filter((d) =>
            domainMatchesAuthority(d, selectedAuthorityId, organization_name)
          );

          console.log("[Authority Card] Rendering card:", cardId, "domains:", authorityDomains.length);

          return (
            <div
              key={cardId}
              className="p-5 bg-white border shadow-sm border-slate-200 rounded-xl"
            >
              {/* Authority Selection */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  {/* <label className={labelClass}>Company Name</label> */}
                  {/* <CreatableSelect
                    value={
                      selectedAuthorityId
                        ? [...flatAuthorityOptions, ...cachedAuthorities, ...authorityOptions].find(
                          (opt) => opt.value === String(selectedAuthorityId)
                        ) || (selectedAuthorityId === "other" ? { value: organization_name, label: organization_name, __isNew__: true } : null)
                        : null
                    }
                    onChange={(opt) => {
                      console.log("[Authority Select] Changed:", opt);
                      if (!opt) {
                        setAuthorityCards((prev) =>
                          prev.map((c) =>
                            c.id === cardId
                              ? { ...c, selectedAuthorityId: null, organization_name: "", job_role_id: null, other_job_role: "" }
                              : c
                          )
                        );
                        return;
                      }
                      const isNew = opt.__isNew__;
                      let newAuthorityId, newAuthorityType, newOrgName;
                      if (isNew) {
                        newAuthorityId = "other";
                        newAuthorityType = "COMPANY";
                        newOrgName = opt.label;
                      } else {
                        newAuthorityId = opt.value;
                        newAuthorityType = opt.type || "COMPANY";
                        newOrgName = opt.__isCustomEducation ? opt.label : "";
                        if (opt.__isCustomEducation) {
                          newAuthorityId = "other";
                        }
                      }
                      setAuthorityCards((prev) =>
                        prev.map((c) =>
                          c.id === cardId
                            ? { ...c, selectedAuthorityId: newAuthorityId, selectedAuthorityType: newAuthorityType, organization_name: newOrgName, job_role_id: null, other_job_role: "" }
                            : c
                        )
                      );
                    }}
                    options={combinedAuthorityOptions}
                    inputValue={authoritySearch}
                    onInputChange={(val) => {
                      setAuthoritySearch(val);
                      if (val.length < 3) setAuthorityOptions([]);
                    }}
                    placeholder="Search or type company / institute... [Min 3 chars]"
                    isClearable
                    styles={selectStyles}
                    components={{ IndicatorSeparator: () => null }}
                    isLoading={isAuthorityLoading}
                  /> */}
                  <ReactSelectDropdown
  label="Company Name"
  placeholder="Search or type company / institute..."
  isLoading={isAuthorityLoading}
  openMenuOnFocus
  openMenuOnClick
  options={[
    ...combinedAuthorityOptions,
    ...(authoritySearch.trim().length > 0 &&
    !combinedAuthorityOptions.some(
      (opt) =>
        opt.label.toLowerCase() === authoritySearch.toLowerCase()
    )
      ? [
          {
            value: authoritySearch,
            label: `Create "${authoritySearch}"`,
            __isNew__: true,
          },
        ]
      : []),
  ]}
  value={
    selectedAuthorityId
      ? [...flatAuthorityOptions, ...cachedAuthorities, ...authorityOptions].find(
          (opt) => opt.value === String(selectedAuthorityId)
        ) || (selectedAuthorityId === "other"
          ? {
              value: organization_name,
              label: organization_name,
              __isNew__: true,
            }
          : null)
      : null
  }
  onChange={(opt) => {
    console.log("[Authority Select] Changed:", opt);

    if (!opt) {
      setAuthorityCards((prev) =>
        prev.map((c) =>
          c.id === cardId
            ? {
                ...c,
                selectedAuthorityId: null,
                organization_name: "",
                job_role_id: null,
                other_job_role: "",
              }
            : c
        )
      );
      return;
    }

    let newAuthorityId, newAuthorityType, newOrgName;

    if (opt.__isNew__) {
      // ✅ manually handle new option
      newAuthorityId = "other";
      newAuthorityType = "COMPANY";
      newOrgName = authoritySearch;
    } else {
      newAuthorityId = opt.value;
      newAuthorityType = opt.type || "COMPANY";
      newOrgName = opt.__isCustomEducation ? opt.label : "";

      if (opt.__isCustomEducation) {
        newAuthorityId = "other";
      }
    }

    setAuthorityCards((prev) =>
      prev.map((c) =>
        c.id === cardId
          ? {
              ...c,
              selectedAuthorityId: newAuthorityId,
              selectedAuthorityType: newAuthorityType,
              organization_name: newOrgName,
              job_role_id: null,
              other_job_role: "",
            }
          : c
      )
    );
    if (newAuthorityId) {
      const key =
        newAuthorityId === "other"
          ? `other|${(newOrgName || "").trim()}`
          : `auth|${newAuthorityId}`;
      setExtraDomainRows((prev) => ({
        ...prev,
        [key]: Math.max(prev[key] || 0, 1),
      }));
    }
  }}
  onInputChange={(val, meta) => {
    if (meta?.action === "input-change") {
      setAuthoritySearch(val);
      if (val.length < 3) setAuthorityOptions([]);
    }
    return val;
  }}
  isClearable
  isSearchable
  filterOption={() => true}
  error={authorityError}
/>
                  <p className="mt-1 text-xs text-slate-500">
                    If not listed above, enter the full official name without
                    abbreviations.
                  </p>
                  {authorityError && (
                    <p className="mt-1 text-xs text-red-500">{authorityError}</p>
                  )}
                </div>
                {selectedAuthorityId && (
                  <button
                    type="button"
                    onClick={() => handleRemoveAuthority(selectedAuthorityId)}
                    className="flex items-center justify-center flex-shrink-0 ml-3 text-red-500 transition rounded-lg hover:text-red-700 hover:bg-red-50"
                    aria-label="Remove authority"
                  >
                    <FaTrash size={14} />
                  </button>
                )}
              </div>


              {/* Date Inputs
              <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>From</label>
                  <Input
                    type="month"
                    value={start_date}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAuthorityCards((prev) =>
                        prev.map((c) =>
                          c.id === cardId ? { ...c, start_date: val } : c
                        )
                      );
                      updateCompanyDates(
                        selectedAuthorityId,
                        val,
                        end_date,
                        job_role_id
                      );
                    }}
                    className={inputClass}
                    placeholder="Month/Year"
                  />
                  <p className="mt-1 text-xs text-slate-500">e.g., June 2023</p>
                </div>
                <div>
                  <label className={labelClass}>To</label>
                  <Input
                    type="month"
                    value={end_date}
                    onChange={(e) => {
                      const val = e.target.value;
                      setAuthorityCards((prev) =>
                        prev.map((c) =>
                          c.id === cardId ? { ...c, end_date: val } : c
                        )
                      );
                      updateCompanyDates(
                        selectedAuthorityId,
                        start_date,
                        val,
                        job_role_id
                      );
                    }}
                    className={inputClass}
                    placeholder="Month/Year"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    e.g., Jan 2024 or leave blank for "Present"
                  </p>
                </div>
                {dateError !== true && (
                  <p className="col-span-2 mt-1 text-xs text-red-500">
                    {dateError}
                  </p>
                )}
              </div> */}


              <div className="grid grid-cols-1 gap-4 mb-4 sm:grid-cols-2">
  <div>
    <Label>From</Label>
    <Input
      type="month"
      value={start_date}
      onChange={(e) => {
        const val = e.target.value;
        setAuthorityCards((prev) =>
          prev.map((c) =>
            c.id === cardId ? { ...c, start_date: val } : c
          )
        );
        updateCompanyDates(
          selectedAuthorityId,
          val,
          end_date,
          job_role_id,
          other_job_role,
          organization_name
        );
      }}
    />
    <p className="mt-1 text-xs text-slate-500">e.g., June 2023</p>
  </div>

  <div>
    <Label>To</Label>
    <Input
      type="month"
      value={end_date}
      onChange={(e) => {
        const val = e.target.value;
        setAuthorityCards((prev) =>
          prev.map((c) =>
            c.id === cardId ? { ...c, end_date: val } : c
          )
        );
        updateCompanyDates(
          selectedAuthorityId,
          start_date,
          val,
          job_role_id,
          other_job_role,
          organization_name
        );
      }}
    />
    <p className="mt-1 text-xs text-slate-500">
      e.g., Jan 2024 or leave blank for "Present"
    </p>
  </div>

  {dateError !== true && (
    <p className="col-span-2 mt-1 text-xs text-red-500">
      {dateError}
    </p>
  )}
</div>
              {selectedAuthorityId && (
                <>
                  {/* Job Role Dropdown */}
                  {/* <div className="mb-4">
                    <label className={labelClass}>Job Roles</label>
                    <CreatableSelect
                      value={
                        job_role_id != null
                          ? [...jobRoleOptions, ...cachedJobRoles].find(
                            (opt) => opt.id === job_role_id
                          ) || null
                          : other_job_role
                            ? {
                              value: other_job_role,
                              label: other_job_role,
                              __isNew__: true,
                            }
                            : null
                      }
                      onChange={(opt) => {
                        console.log("[Job Role Select] Changed:", opt);
                        if (!opt) {
                          setAuthorityCards((prev) =>
                            prev.map((c) =>
                              c.id === cardId
                                ? {
                                  ...c,
                                  job_role_id: null,
                                  other_job_role: "",
                                }
                                : c
                            )
                          );
                          updateCompanyDates(
                            selectedAuthorityId,
                            start_date,
                            end_date,
                            null,
                            ""
                          );
                          return;
                        }
                        if (!opt.__isNew__) {
                          const roleId = opt.id;
                          setAuthorityCards((prev) =>
                            prev.map((c) =>
                              c.id === cardId
                                ? {
                                  ...c,
                                  job_role_id: roleId,
                                  other_job_role: "",
                                }
                                : c
                            )
                          );
                          if (!cachedJobRoles.some((j) => j.id === roleId)) {
                            setCachedJobRoles((prev) => [...prev, opt]);
                          }
                          updateCompanyDates(
                            selectedAuthorityId,
                            start_date,
                            end_date,
                            roleId,
                            ""
                          );
                        } else {
                          const customRole = opt.value;
                          setAuthorityCards((prev) =>
                            prev.map((c) =>
                              c.id === cardId
                                ? {
                                  ...c,
                                  job_role_id: null,
                                  other_job_role: customRole,
                                }
                                : c
                            )
                          );
                          updateCompanyDates(
                            selectedAuthorityId,
                            start_date,
                            end_date,
                            null,
                            customRole
                          );
                        }
                      }}
                      options={[...jobRoleOptions, ...cachedJobRoles].map((jr) => ({
                        id: jr.id,
                        title: jr.title,
                        value: jr.id,
                        label: jr.title,
                      }))}
                      inputValue={jobRoleSearch}
                      onInputChange={(val) => {
                        setJobRoleSearch(val);
                        if (val.length < 3) setJobRoleOptions([]);
                      }}
                      placeholder="Search or type your role... [Min 3 chars]"
                      isClearable
                      styles={selectStyles}
                      components={{ IndicatorSeparator: () => null }}
                      isLoading={isJobRoleLoading}
                    />
                    {jobRoleError && (
                      <p className="mt-1 text-xs text-red-500">{jobRoleError}</p>
                    )}
                  </div> */}


                  <GreenCreatableSelect
  label="Job Roles"
  value={
    job_role_id != null
      ? [...jobRoleOptions, ...cachedJobRoles].find((opt) => opt.id === job_role_id) || null
      : other_job_role
        ? { value: other_job_role, label: other_job_role, __isNew__: true }
        : null
  }
  onChange={(opt) => {
    console.log("[Job Role Select] Changed:", opt);

    if (!opt) {
      setAuthorityCards((prev) =>
        prev.map((c) =>
          c.id === cardId ? { ...c, job_role_id: null, other_job_role: "" } : c
        )
      );
      updateCompanyDates(
        selectedAuthorityId,
        start_date,
        end_date,
        null,
        "",
        organization_name
      );
      return;
    }

    if (!opt.__isNew__) {
      const roleId = opt.id;
      setAuthorityCards((prev) =>
        prev.map((c) =>
          c.id === cardId ? { ...c, job_role_id: roleId, other_job_role: "" } : c
        )
      );
      if (!cachedJobRoles.some((j) => j.id === roleId)) {
        setCachedJobRoles((prev) => [...prev, opt]);
      }
      updateCompanyDates(
        selectedAuthorityId,
        start_date,
        end_date,
        roleId,
        "",
        organization_name
      );
    } else {
      const customRole = opt.value;
      setAuthorityCards((prev) =>
        prev.map((c) =>
          c.id === cardId ? { ...c, job_role_id: null, other_job_role: customRole } : c
        )
      );
      updateCompanyDates(
        selectedAuthorityId,
        start_date,
        end_date,
        null,
        customRole,
        organization_name
      );
    }
  }}
  options={[...jobRoleOptions, ...cachedJobRoles].map((jr) => ({
    id: jr.id,
    title: jr.title,
    value: jr.id,
    label: jr.title,
  }))}
  onInputChange={(val, meta) => {
    if (meta?.action === "input-change") {
      setJobRoleSearch(val);
      if (val.length < 3) setJobRoleOptions([]);
    }
    return val;
  }}
  placeholder="Search or type your role... [Min 3 chars]"
  filterOption={() => true}
  isClearable
  components={{ IndicatorSeparator: () => null }}
  isLoading={isJobRoleLoading}
/>

                  {/* Suggested Domains Chips (based on Job Role) */}
                  {/* {job_role_id && (suggestedDomainsLoadingMap[cardId] || (suggestedDomainsMap[cardId] && suggestedDomainsMap[cardId].length > 0)) && (
                    <div className="p-3 mb-4 border border-gray-200 rounded-md bg-gray-50">
                      <div className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        {suggestedDomainsLoadingMap[cardId] ? "Loading suggestions..." : "Suggested Domains"}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(suggestedDomainsMap[cardId] || []).map((domain) => {
                          const isAlreadyAdded = authorityDomains.some(
                            (d) => d.domain_id === domain.id
                          );
                          if (isAlreadyAdded) return null;
                          return (
                            <button
                              key={`${cardId}-suggested-domain-${domain.id}`}
                              type="button"
                              onClick={() => {
                                console.log("[Suggested Domain] Clicked:", domain);
                                handleAddDomainToAuthority(
                                  selectedAuthorityId,
                                  selectedAuthorityType,
                                  { id: domain.id, name: domain.name },
                                  start_date,
                                  end_date,
                                  job_role_id,
                                  other_job_role,
                                  organization_name
                                );
                              }}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-full hover:bg-blue-50 hover:border-blue-400 transition-colors shadow-sm"
                            >
                              <span>{domain.name}</span>
                              <FaPlus className="w-3 h-3" />
                            </button>
                          );
                        })}
                        {(suggestedDomainsMap[cardId] || []).length === 0 && !suggestedDomainsLoadingMap[cardId] && (
                          <span className="text-sm italic text-gray-400">
                            No specific suggestions for this role. Search below.
                          </span>
                        )}
                      </div>
                    </div>
                  )} */}



                  {/* Tip */}
                  <p className="p-3 mb-3 text-sm rounded-lg text-slate-700 bg-[#9BC87C]/10 border border-[#9BC87C]/30">
                    <FaInfoCircle className="inline mr-1" />
                    <strong>Tip:</strong> Choose a <em>broad domain</em> like{" "}
                    <strong>Web Development</strong> or{" "}
                    <strong>Data Analysis</strong>, not specific skills like
                    "HTML" or "Python". You'll add specific skills next.
                  </p>

             
                

{/* Domain Cards */}
<div className="mt-4 space-y-4">
  {authorityDomains.map((domain) => {
    const isCustomDomain = domain.is_custom_domain;
    const domainName = domain._tempDomainName || (isCustomDomain
      ? domain.other_domain_name
      : domain.domain_id
      ? cachedDomains.find(d => d.id === domain.domain_id)?.name || `Domain ${domain.domain_id}`
      : "Unknown Domain");
    const skills = domain.skills || [];
    console.log("[Domain Card] Rendering:", domainName, "skills:", skills.length);
    return (
      <div key={domain._tempId} className="p-4 border rounded-lg bg-slate-50 border-slate-200">
        {/* Domain Header */}
        <div className="flex items-start justify-between">
          <span className="bg-[#9BC87C]/20 text-[#1e1e2d] border border-[#9BC87C]/40 px-2.5 py-1 rounded-full text-xs font-medium">
            {domainName}
          </span>
          <button type="button" onClick={() => handleRemoveDomain(domain._tempId)} className="text-slate-400 hover:text-red-500">
            <FaTimes size={12} />
          </button>
        </div>
        {/* Certificate Upload */}
        <div className="mt-3">
          <input id={`cert-${domain._tempId}`} type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleCertificateChange(domain._tempId, e.target.files[0])} />
          <label htmlFor={`cert-${domain._tempId}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 border text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-100 cursor-pointer">
            <FaFileAlt size={12} />
            {domain.certificateName ? "Change Certificate" : "Upload Certificate"}
          </label>
        </div>
        {domain.certificateName && (
          <div className="flex items-center justify-between p-2 mt-2 text-xs bg-white border rounded">
            <span className="max-w-[120px] text-green-600 truncate">{domain.certificateName || "Uploaded file"}</span>
            <button type="button" onClick={() => handleCertificateChange(domain._tempId, null)} className="text-red-500 hover:text-red-700">Remove</button>
          </div>
        )}
        {/* Sub-skill Search & Suggestions */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Add Sub Skills</label>
          <SubSkillSearchInput
            cardId={domain._tempId}
            domainId={domain.domain_id}
            isCustomDomain={isCustomDomain}
            existingSkills={skills}
            onAddSkill={handleAddCustomSubSkill}
            onRemoveSkill={handleRemoveCustomSubSkill}
            onToggleSkill={handleToggleSubSkill}
            onExperienceChange={handleExperienceChange}
            subSkillSearchMap={subSkillSearchMap}
            setSubSkillSearchMap={setSubSkillSearchMap}
            activeSubSkillCardId={activeSubSkillCardId}
            setActiveSubSkillCardId={setActiveSubSkillCardId}
            subSkillOptions={subSkillOptions}
            isSubSkillLoading={isSubSkillLoading}
            cachedSubSkills={cachedSubSkills}
            fetchSuggestedSubSkillsForCard={fetchSuggestedSubSkillsForCard}
            subSkillError={subSkillError}
          />
        </div>
        {skills.length === 0 && <p className="mt-2 text-xs text-red-500">Please add at least one sub skill.</p>}
      </div>
    );
  })}

  {/* Extra Domain Rows */}
  {Array.from({ length: extraDomainRows[getAuthorityKey(card)] || 0 }).map((_, idx) => (
    <div key={`extra-${idx}`} className="p-3 duration-200 border border-[#9BC87C]/40 rounded-lg bg-[#9BC87C]/10 animate-in fade-in zoom-in">
      <DomainSearchCreatable
        selectedAuthorityId={selectedAuthorityId}
        selectedAuthorityType={selectedAuthorityType}
        organization_name={organization_name}
        start_date={start_date}
        end_date={end_date}
        job_role_id={job_role_id}
        other_job_role={other_job_role}
        onAdd={(...args) => {
          handleAddDomainToAuthority(...args);
          setExtraDomainRows((prev) => {
            const key = getAuthorityKey(card);
            return { ...prev, [key]: Math.max(0, (prev[key] || 0) - 1) };
          });
        }}
        domainOptions={domainOptions}
        isDomainLoading={isDomainLoading}
        domainError={domainError}
        domainSearch={domainSearch}
        setDomainSearch={setDomainSearch}
      />
    </div>
  ))}

 

  {/*  MOVED: Suggested Domains Chips - Now below "Add a Skill" button */}
  {job_role_id && (suggestedDomainsLoadingMap[cardId] || (suggestedDomainsMap[cardId] && suggestedDomainsMap[cardId].length > 0)) && (
    <div className="p-3 mt-4 border border-gray-200 rounded-md bg-gray-50">
      <div className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
        {suggestedDomainsLoadingMap[cardId] ? "Loading suggestions..." : "Suggested Skills"}
      </div>
      <div className="flex flex-wrap gap-2">
        {(suggestedDomainsMap[cardId] || []).map((domain) => {
          const isAlreadyAdded = authorityDomains.some((d) => d.domain_id === domain.id);
          if (isAlreadyAdded) return null;
          return (
            <button
              key={`${cardId}-suggested-domain-${domain.id}`}
              type="button"
              onClick={() => {
                console.log("[Suggested Domain] Clicked:", domain);
                handleAddDomainToAuthority(
                  selectedAuthorityId,
                  selectedAuthorityType,
                  { id: domain.id, name: domain.name },
                  start_date,
                  end_date,
                  job_role_id,
                  other_job_role,
                  organization_name
                );
              }}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-[#1DB32F] bg-white border border-[#9BC87C]/60 rounded-full hover:bg-[#9BC87C]/10 hover:border-[#1DB32F]/40 transition-colors shadow-sm"
            >
              <span>{domain.name}</span>
              <FaPlus className="w-3 h-3" />
            </button>
          );
        })}
        {(suggestedDomainsMap[cardId] || []).length === 0 && !suggestedDomainsLoadingMap[cardId] && (
          <span className="text-sm italic text-gray-400">No specific suggestions for this role. Search above.</span>
        )}
      </div>
    </div>
  )}
</div>
 {/* Add Domain Button */}
  {selectedAuthorityId && (
    <div className="mt-4 text-center">
      {/* <button
        type="button"
        onClick={() => {
          const key = getAuthorityKey(card);
          setExtraDomainRows((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
        }}
        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 border border-blue-200 transition"
      >
        <FaPlus size={14} />
        Add a Skill
      </button> */}
      <Button
        type="button"
        variant="primary"
        onClick={() => {
          if (authorityDomains.length === 0) {
            const areaName =
              other_job_role?.trim() ||
              (job_role_id
                ? [...jobRoleOptions, ...cachedJobRoles].find((j) => j.id === job_role_id)
                    ?.title
                : null) ||
              "General Skills";
            handleAddDomainToAuthority(
              selectedAuthorityId,
              selectedAuthorityType,
              { id: null, name: areaName, __isNew__: true },
              start_date,
              end_date,
              job_role_id,
              other_job_role,
              organization_name
            );
            return;
          }
          const key = getAuthorityKey(card);
          setExtraDomainRows((prev) => ({
            ...prev,
            [key]: (prev[key] || 0) + 1,
          }));
        }}
        className="w-full sm:w-auto"
      >
        {authorityDomains.length === 0 ? "Add skill area" : "Add another area"}
      </Button>

    </div>
  )}

{/* Tip - Moved above suggested domains for better flow */}
{/* <p className="p-3 mb-3 text-sm rounded-lg text-slate-600 bg-blue-50">
  <FaInfoCircle className="inline mr-1" />
  <strong>Tip:</strong> Choose a <em>broad domain</em> like <strong>Web Development</strong> or <strong>Data Analysis</strong>, not specific skills like "HTML" or "Python". You'll add specific skills next.
</p> */}

                </>
              )}

              {!selectedAuthorityId && (
                <div className="py-4 text-sm text-center rounded-lg text-slate-500 bg-slate-50">
                  <FaBuilding className="mx-auto mb-2 text-slate-400" size={20} />
                  Select a company or institute to add experience, dates, and
                  skills.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add New Authority Button */}
      {/* <div className="pt-2 text-center">
        <GreenAddButton
          type="button"
          onClick={() => {
            console.log("[Add Authority Card] Creating new card");
            setAuthorityCards((prev) => [
              ...prev,
              {
                id: generateId(),
                selectedAuthorityId: null,
                selectedAuthorityType: null,
                organization_name: "",
                job_role_id: null,
                start_date: "",
                end_date: "",
              },
            ]);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-blue-600 font-medium rounded-lg hover:bg-blue-50 border border-blue-200 transition"
        >
          <FaPlus size={14} />
          Add a Company 
        </GreenAddButton> */}

        <div className="pt-2 text-center">
  <AddButton
    type="button"
    onClick={() => {
      console.log("[Add Authority Card] Creating new card");
      setAuthorityCards((prev) => [
        ...prev,
        {
          id: generateId(),
          selectedAuthorityId: null,
          selectedAuthorityType: null,
          organization_name: "",
          job_role_id: null,
          start_date: "",
          end_date: "",
        },
      ]);
    }}
    className="inline-flex items-center gap-2 px-4 py-2.5 text-green-700 font-medium rounded-lg "
  >
    <FaPlus size={14} />
    Add a Company
  </AddButton>
</div>
      {/* </div> */}
    </div>
  );
}
