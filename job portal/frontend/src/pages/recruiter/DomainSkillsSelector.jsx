import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import CreatableSelect from "react-select/creatable";
import { FaTimes, FaPlus, FaTrash, FaInfoCircle, FaSearch, FaSpinner } from "react-icons/fa";
import { Label } from "../../components/ui";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// ========== DEBOUNCE HOOK ==========
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// ========== DOMAIN SKILLS SELECTOR ==========
const DomainSkillsSelector = ({
  jobRoleId,
  onSkillsChange,
  onDomainSkillsChange,
  error,
  selectedDomainSkills = [],
  showMustHaveToggle = true,      //  NEW PROP
  showExperienceInput = true,  
}) => {
  // ===== State =====
  const [domainSearchText, setDomainSearchText] = useState("");
  const [domainSearchResults, setDomainSearchResults] = useState([]);
  const [domainSearchLoading, setDomainSearchLoading] = useState(false);
  
  // Suggested Domains (Chips) based on Job Role
  const [suggestedDomains, setSuggestedDomains] = useState([]);
  const [suggestedLoading, setSuggestedLoading] = useState(false);

  const [skillSearchText, setSkillSearchText] = useState("");
  const [skillSearchResults, setSkillSearchResults] = useState([]);
  const [skillSearchLoading, setSkillSearchLoading] = useState(false);
  const [skillSearchCardId, setSkillSearchCardId] = useState(null);

  // NEW: State for suggested sub-skills (predefined) per card
  const [suggestedSubSkillsMap, setSuggestedSubSkillsMap] = useState({}); 
  // Format: { [cardId]: [{ skill_id, skill_name }, ...] }
  const [subSkillsLoadingMap, setSubSkillsLoadingMap] = useState({});

  // ===== Fetch Suggested Domains when Job Role Changes =====
  useEffect(() => {
    const fetchSuggested = async () => {
      if (!jobRoleId || isNaN(jobRoleId)) {
        setSuggestedDomains([]);
        return;
      }
      setSuggestedLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/master/job-roles/${jobRoleId}/suggested-domains`, {
          params: { limit: 10, includeSkills: false }
        });
        if (response.data?.success) {
          setSuggestedDomains(response.data.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch suggested domains:", err);
        setSuggestedDomains([]);
      } finally {
        setSuggestedLoading(false);
      }
    };
    fetchSuggested();
  }, [jobRoleId]);

  // ===== Domain Search API =====
  const debouncedDomainSearch = useDebounce(domainSearchText, 300);
  useEffect(() => {
    const searchDomains = async () => {
      // if (!debouncedDomainSearch || debouncedDomainSearch.length < 3) {
      //   setDomainSearchResults([]);
      //   return;
      // }
      if (debouncedDomainSearch === null || debouncedDomainSearch === undefined) {
  return;
}
      try {
        setDomainSearchLoading(true);
        const response = await axios.get(`${BASE_URL}/master/domains/search`, {
          params: { search: debouncedDomainSearch, limit: 10 },
        });
        if (response.data?.success) {
          setDomainSearchResults(response.data.data || []);
        }
      } catch (err) {
        console.error("Domain search failed:", err);
        setDomainSearchResults([]);
      } finally {
        setDomainSearchLoading(false);
      }
    };
    searchDomains();
  }, [debouncedDomainSearch]);

  // ===== Skill Search API (Typed in search box) =====
  const debouncedSkillSearch = useDebounce(skillSearchText, 300);
  useEffect(() => {
    const fetchSkills = async () => {
      // if (!debouncedSkillSearch || debouncedSkillSearch.length < 2 || !skillSearchCardId) {
      //   setSkillSearchResults([]);
      //   return;
      // }
      if (
  debouncedSkillSearch === null ||
  debouncedSkillSearch === undefined ||
  !skillSearchCardId
) {
  return;
}
      
      const card = selectedDomainSkills.find((c) => c.id === skillSearchCardId);
      const domainId = card?.domain?.id;

      if (!domainId) {
        setSkillSearchResults([]);
        return;
      }

      setSkillSearchLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/master/domains/${domainId}/sub-skills`, {
          params: { search: debouncedSkillSearch, limit: 15 }
        });
        if (response.data?.success) {
          setSkillSearchResults(response.data.data || []);
        }
      } catch (err) {
        console.error("Skill search failed:", err);
        setSkillSearchResults([]);
      } finally {
        setSkillSearchLoading(false);
      }
    };
    fetchSkills();
  }, [debouncedSkillSearch, skillSearchCardId, selectedDomainSkills]);

  // ===== NEW: Fetch Suggested Sub-Skills when a Domain Card is Added/Changed =====
  useEffect(() => {
    selectedDomainSkills.forEach(card => {
      const domainId = card.domain?.id;
      // Only fetch if it's a predefined domain (has ID) and we haven't fetched for this card yet
      if (domainId && !subSkillsLoadingMap[card.id] && !suggestedSubSkillsMap[card.id]) {
        fetchSuggestedSubSkillsForCard(card.id, domainId);
      }
    });
  }, [selectedDomainSkills]);

  const fetchSuggestedSubSkillsForCard = async (cardId, domainId) => {
    // Prevent duplicate calls
    if (subSkillsLoadingMap[cardId] || suggestedSubSkillsMap[cardId]) return;

    setSubSkillsLoadingMap(prev => ({ ...prev, [cardId]: true }));
    try {
      // Fetch top 10 skills without search term
      const response = await axios.get(`${BASE_URL}/master/domains/${domainId}/sub-skills`, {
        params: { limit: 10 } 
      });
      if (response.data?.success) {
        setSuggestedSubSkillsMap(prev => ({
          ...prev,
          [cardId]: response.data.data || []
        }));
      }
    } catch (err) {
      console.error("Failed to fetch suggested sub-skills:", err);
    } finally {
      setSubSkillsLoadingMap(prev => ({ ...prev, [cardId]: false }));
    }
  };

  // ===== Handlers =====
  const handleAddDomainCard = useCallback((domainObj) => {
    const isDuplicate = selectedDomainSkills.some(
      (card) =>
        (card.domain?.id && card.domain.id === domainObj.id) ||
        (card.domain?.__custom && card.domain.__custom === domainObj.__custom)
    );

    if (isDuplicate) {
      alert("This domain is already selected.");
      return;
    }

    const newCard = {
      id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      domain: domainObj,
      skills: [],
    };
    onDomainSkillsChange([...selectedDomainSkills, newCard]);
    
    // Trigger fetch for new card immediately
    if (domainObj.id) {
      fetchSuggestedSubSkillsForCard(newCard.id, domainObj.id);
    }
  }, [selectedDomainSkills, onDomainSkillsChange]);

  const handleRemoveCard = useCallback(
    (cardId) => {
      const updated = selectedDomainSkills.filter((card) => card.id !== cardId);
      onDomainSkillsChange(updated);
      
      // Cleanup maps
      setSuggestedSubSkillsMap(prev => {
        const next = { ...prev };
        delete next[cardId];
        return next;
      });
      setSubSkillsLoadingMap(prev => {
        const next = { ...prev };
        delete next[cardId];
        return next;
      });

      const newSkillIds = updated
        .flatMap((card) =>
          (card.skills || [])
            .filter((s) => s.skill_id != null)
            .map((s) => s.skill_id)
        );
      if (onSkillsChange) onSkillsChange(newSkillIds);
    },
    [selectedDomainSkills, onDomainSkillsChange, onSkillsChange]
  );

  const handleToggleSkill = useCallback(
    (cardId, skill) => {
      const updated = selectedDomainSkills.map((card) => {
        if (card.id !== cardId) return card;
        const isSelected = (card.skills || []).some((s) => s.skill_id === skill.skill_id);
        let newSkills;
        if (isSelected) {
          newSkills = (card.skills || []).filter((s) => s.skill_id !== skill.skill_id);
        } else {
          newSkills = [
            ...card.skills,
            { ...skill, mustHave: false, min_experience_months: null },
          ];
        }
        return { ...card, skills: newSkills };
      });
      onDomainSkillsChange(updated);
      
      const newSkillIds = updated
        .flatMap((card) =>
          (card.skills || [])
            .filter((s) => s.skill_id != null)
            .map((s) => s.skill_id)
        );
      if (onSkillsChange) onSkillsChange(newSkillIds);
    },
    [selectedDomainSkills, onDomainSkillsChange, onSkillsChange]
  );

  const handleToggleMustHave = useCallback(
    (cardId, skillKey, isCustom = false) => {
      const updated = selectedDomainSkills.map((card) => {
        if (card.id !== cardId) return card;
        const newSkills = (card.skills || []).map((s) => {
          if (isCustom ? s.__custom === skillKey : s.skill_id === skillKey) {
            return { ...s, mustHave: !s.mustHave };
          }
          return s;
        });
        return { ...card, skills: newSkills };
      });
      onDomainSkillsChange(updated);
    },
    [selectedDomainSkills, onDomainSkillsChange]
  );

  const handleExperienceChange = useCallback(
    (cardId, skillKey, value, isCustom = false) => {
      const numValue = value === "" ? null : Number(value);
      if (isNaN(numValue) && value !== "") return;
      const updated = selectedDomainSkills.map((card) => {
        if (card.id !== cardId) return card;
        const newSkills = (card.skills || []).map((s) => {
          const match = isCustom ? s.__custom === skillKey : s.skill_id === skillKey;
          if (match) {
            return { ...s, min_experience_months: numValue };
          }
          return s;
        });
        return { ...card, skills: newSkills };
      });
      onDomainSkillsChange(updated);
    },
    [selectedDomainSkills, onDomainSkillsChange]
  );

  const handleAddCustomSkill = useCallback(
    (cardId, rawSkillName, skillObj = null) => {
      const skillName = rawSkillName.trim();
      if (!skillName) return;
      const updated = selectedDomainSkills.map((card) => {
        if (card.id !== cardId) return card;
        const existingNames = (card.skills || []).map((s) =>
          (s.skill_name || s.__custom || "").toLowerCase()
        );
        if (existingNames.includes(skillName.toLowerCase())) return card;
        
        if (skillObj && skillObj.skill_id) {
          return {
            ...card,
            skills: [
              ...(card.skills || []),
              {
                skill_id: skillObj.skill_id,
                skill_name: skillObj.skill_name,
                mustHave: false,
                min_experience_months: null,
              },
            ],
          };
        } else {
          return {
            ...card,
            skills: [
              ...(card.skills || []),
              { __custom: skillName, mustHave: false, min_experience_months: null },
            ],
          };
        }
      });
      onDomainSkillsChange(updated);
      setSkillSearchText("");
      setSkillSearchResults([]);
      setSkillSearchCardId(null);
    },
    [selectedDomainSkills, onDomainSkillsChange]
  );

  const handleRemoveCustomSkill = useCallback(
    (cardId, skillName) => {
      const updated = selectedDomainSkills.map((card) => {
        if (card.id !== cardId) return card;
        return {
          ...card,
          skills: (card.skills || []).filter((s) => s.__custom !== skillName),
        };
      });
      onDomainSkillsChange(updated);
    },
    [selectedDomainSkills, onDomainSkillsChange]
  );

  // ===== Styles =====
  const selectStyles = useMemo(
    () => ({
      control: (base, state) => ({
        ...base,
        minHeight: "36px",
        borderColor: state.isFocused ? "#9bc87c" : "#d1d5db",
        boxShadow: state.isFocused
          ? "0 0 0 2px rgba(155,200,124,0.3)"
          : "none",
        borderRadius: "6px",
        fontSize: "14px",
        "&:hover": { borderColor: "#9bc87c" },
      }),
      placeholder: (provided) => ({ ...provided, color: "#9ca3af" }),
      singleValue: (provided) => ({ ...provided, color: "#1f2937" }),
      menu: (provided) => ({ ...provided, borderRadius: "6px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }),
      option: (provided, state) => ({
        ...provided,
        padding: "6px 12px",
        backgroundColor: state.isSelected
          ? "#9bc87c"
          : state.isFocused
          ? "#e6f4dc"
          : "white",
        color: state.isSelected ? "white" : "#1f2937",
      }),
    }),
    []
  );

  return (
    <div className="space-y-4">
      <Label htmlFor="skills">
        Skills Required
        <span className="ml-1 text-red-500">*</span>
      </Label>

      {/* Hint */}
      {selectedDomainSkills.some((card) => (card.skills || []).length > 0) && (
        <div className="flex items-start gap-1.5 mt-1 text-xs text-gray-700 bg-[#f3f9ee] p-2 rounded-md border border-[#9bc87c]">
          <FaInfoCircle className="mt-0.5 text-[#9bc87c] flex-shrink-0" />
          <span>
            <strong>Tip:</strong> Selected sub-skills are <em>preferred</em> by default.
            Check the box to make a sub-skill <strong>must-have</strong>. 
            Enter minimum experience (in months) if required.
          </span>
        </div>
      )}

     

      {/* 1. DOMAIN CARDS */}
      <div className="space-y-4">
        {selectedDomainSkills.map((card) => {
          const isCustomDomain = card.domain?.__custom != null;
          const domainName = isCustomDomain
            ? card.domain.__custom
            : card.domain?.name || "Select domain...";
          const domainId = isCustomDomain ? null : card.domain?.id;
          
          const isSearchingSkills = skillSearchCardId === card.id;
          const selectedPredefined = (card.skills || []).filter((s) => s.skill_id);
          
          // Get suggested sub-skills for this card
          const suggestedSubSkills = suggestedSubSkillsMap[card.id] || [];
          const isSubSkillsLoading = subSkillsLoadingMap[card.id];

          return (
            <div key={card.id} className="p-4 bg-white border border-gray-200 rounded-md shadow-sm">
              {/* Domain Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <span className="text-sm font-semibold text-gray-700">
                    {domainName}
                  </span>
                  {!card.domain && (
                     <span className="ml-2 text-xs text-gray-400">(Select a domain)</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveCard(card.id)}
                  className="p-1 text-gray-400 transition-colors hover:text-red-500"
                  title="Remove Domain"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>

              {/* Selected Skills as Bubbles */}
              {card.skills && card.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {card.skills.map((skill, idx) => {
                    const isCustom = skill.__custom != null;
                    const key = isCustom ? skill.__custom : skill.skill_id;
                    return (
                      <div
                        key={idx}
                        className={`flex items-center gap-2 px-2 py-1.5 rounded-md border text-sm ${
                          skill.mustHave
                            ? "bg-red-50 border-red-200 text-red-800"
                            : "bg-green-50 border-green-200 text-green-800"
                        }`}
                      >
                        <span className="font-medium">
                          {isCustom ? skill.__custom : skill.skill_name}
                        </span>
                        
                        


                        {showMustHaveToggle && (
                          <label className="flex items-center text-xs cursor-pointer select-none whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={skill.mustHave}
                              onChange={() => handleToggleMustHave(card.id, key, isCustom)}
                              className="w-3.5 h-3.5 rounded border-gray-300 text-[#9bc87c] focus:ring-[#9bc87c]"
                            />
                            <span className="ml-1 text-gray-600">Must</span>
                          </label>
                        )}

                        
                        {showExperienceInput && (
                          <div className="flex items-center gap-1 pl-2 border-l border-gray-300">
                            <input
                              type="number"
                              min="0"
                              max="360"
                              value={skill.min_experience_months ?? ""}
                              onChange={(e) =>
                                handleExperienceChange(card.id, key, e.target.value, isCustom)
                              }
                              placeholder="mo"
                              className="w-12 px-1 py-0.5 text-xs border border-gray-300 rounded outline-none focus:ring-2 focus:ring-[rgba(155,200,124,0.3)] focus:border-[#9bc87c]"
                            />
                            <span className="text-xs text-gray-500">mo</span>
                          </div>
                        )}
                        

                        <button
                          type="button"
                          onClick={() =>
                            isCustom
                              ? handleRemoveCustomSkill(card.id, skill.__custom)
                              : handleToggleSkill(card.id, skill)
                          }
                          className="text-gray-400 hover:text-red-600 p-0.5"
                        >
                          <FaTimes className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Sub-Skill Search Input */}
              <div className="relative mb-2">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    className="w-full py-2 pr-3 text-sm transition-shadow border border-gray-300 rounded-md outline-none pl-9 focus:ring-2 focus:ring-[rgba(155,200,124,0.3)] focus:border-[#9bc87c]"
                    // placeholder={isCustomDomain ? "Type a sub-skill (Custom Domain)" : "Search sub-skills... [Min 3 chars]"}
                    placeholder={
  isCustomDomain
    ? "Type a sub-skill (Custom Domain)"
    : "Search sub-skills..."
}
                    value={isSearchingSkills ? skillSearchText : ""}
                    onChange={(e) => {
                      setSkillSearchCardId(card.id);
                      setSkillSearchText(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && skillSearchText.trim()) {
                        e.preventDefault();
                        handleAddCustomSkill(card.id, skillSearchText);
                      } else if (e.key === "Escape") {
                        setSkillSearchText("");
                        setSkillSearchResults([]);
                        setSkillSearchCardId(null);
                      }
                    }}
                    // onFocus={() => setSkillSearchCardId(card.id)}
                    onFocus={() => {
  setSkillSearchCardId(card.id);
  setSkillSearchText("");
}}
                    autoComplete="off"
                  />
                </div>

                {/* Search Results Dropdown */}
                {isSearchingSkills && skillSearchText.length >= 2 && (skillSearchLoading || skillSearchResults.length > 0) && (
                  <div className="absolute z-20 w-full mt-1 overflow-y-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-48">
                    {skillSearchLoading ? (
                      <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>
                    ) : skillSearchResults.length === 0 ? (
                      <div className="px-3 py-2 text-sm text-gray-500">No sub-skills found. Press Enter to add "{skillSearchText}" as custom.</div>
                    ) : (
                      skillSearchResults.map((skill) => {
                        const isSelected = card.skills?.some(s => s.skill_id === skill.skill_id);
                        return (
                          <button
                            key={skill.skill_id}
                            type="button"
                            disabled={isSelected}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-[#f3f9ee] transition-colors ${isSelected ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'text-gray-700'}`}
                            onClick={() => handleAddCustomSkill(card.id, skill.skill_name, skill)}
                          >
                            <div className="flex items-center justify-between">
                              <span>{skill.skill_name}</span>
                              {isSelected && <span className="text-xs font-medium text-green-600">Added</span>}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
              
              {/* Quick Add Custom Skill Hint */}
              {isSearchingSkills && skillSearchText.length >= 2 && skillSearchResults.length === 0 && !skillSearchLoading && (
                 <div className="mt-1 text-xs text-green-700 cursor-pointer hover:underline" onClick={() => handleAddCustomSkill(card.id, skillSearchText)}>
                    + Add "{skillSearchText}" as custom sub-skill
                 </div>
              )}

              {/* NEW: SUGGESTED SUB-SKILLS (CHIPS) */}
              {!isCustomDomain && (
                <div className="pt-3 mt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                      Suggested Sub-skills
                    </span>
                    {isSubSkillsLoading && (
                      <FaSpinner className="text-xs text-gray-400 animate-spin" />
                    )}
                  </div>
                  
                  {isSubSkillsLoading && suggestedSubSkills.length === 0 ? (
                    <div className="text-xs italic text-gray-400">Loading suggestions...</div>
                  ) : suggestedSubSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {suggestedSubSkills.map((skill) => {
                        const isSelected = card.skills?.some(s => s.skill_id === skill.skill_id);
                        if (isSelected) return null; // Hide if already added
                        
                        return (
                          <button
                            key={skill.skill_id}
                            type="button"
                            onClick={() => handleAddCustomSkill(card.id, skill.skill_name, skill)}
                            className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 border border-gray-200 rounded-md hover:bg-[#f3f9ee] hover:text-green-800 hover:border-[#9bc87c] transition-all flex items-center gap-1"
                          >
                            {skill.skill_name}
                            <FaPlus className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-xs italic text-gray-400">No common sub-skills found for this domain.</div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add Another Domain Button */}
        <div className={`  ${jobRoleId && (suggestedLoading || suggestedDomains.length > 0) ? ' p-4 bg-white border border-gray-200 rounded-md shadow-sm ' : ''}`}>

        <div className="pt-2">
           <CreatableSelect
              value={null}
              onChange={(opt) => {
                if (!opt) return;
                if (opt.__isNew__) {
                  handleAddDomainCard({ __custom: opt.label.trim() });
                } else {
                  handleAddDomainCard({ id: parseInt(opt.value, 10), name: opt.label });
                }
              }}
              onMenuOpen={() => setDomainSearchText("")}
              onInputChange={(val) => setDomainSearchText(val)}
              options={domainSearchResults.map(d => ({
                value: d.domain_id,
                label: d.domain_name
              }))}
              isLoading={domainSearchLoading}
              // placeholder="Search or create a new Skill... [Min 3 chars]"
              placeholder="Search or create a new Skill..."
              isClearable={false}
              styles={selectStyles}
              components={{ IndicatorSeparator: () => null, DropdownIndicator: () => null }}
              formatCreateLabel={(input) => `Create Skill "${input}"`}
            />
        </div>
        {/* 2. SUGGESTED DOMAINS (CHIPS) */}
      {jobRoleId && (suggestedLoading || suggestedDomains.length > 0) && (
        <div className="p-3 mt-2 border border-gray-200 rounded-md bg-gray-50">
          <div className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            {suggestedLoading ? "Loading suggestions..." : "Suggested Skills "}
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedDomains.map((domain) => {
              const isAlreadyAdded = selectedDomainSkills.some(
                (card) => card.domain?.id === domain.domain_id
              );
              if (isAlreadyAdded) return null;

              return (
                <button
                  key={domain.domain_id}
                  type="button"
                  onClick={() => handleAddDomainCard({ id: domain.domain_id, name: domain.domain_name })}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-800 bg-white border border-[#9bc87c] rounded-full hover:bg-[#f3f9ee] hover:border-[#88b86a] transition-colors shadow-sm"
                >
                  <span>{domain.domain_name}</span>
                  <FaPlus className="w-3 h-3" />
                </button>
              );
            })}
            {suggestedDomains.length === 0 && !suggestedLoading && (
              <span className="text-sm italic text-gray-400">No specific suggestions for this role. Search below.</span>
            )}
          </div>
        </div>
      )}

        </div>
      </div>

       

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default DomainSkillsSelector;

// ========== UTILITY: extract skill arrays ==========
export const extractSkillArrays = (domainCards = []) => {
  const skills = [];
  const other_skills = [];
  domainCards.forEach((card) => {
    const domainName = card.domain?.__custom || card.domain?.name || "Unknown";
    const domain_id= card.domain?.id || null;
    (card.skills || []).forEach((skill) => {
      const type = skill.mustHave ? "must_have" : "preferred";
      if (skill.skill_id != null && typeof skill.skill_id === "number") {
        skills.push({
          domain_name: domainName,
          domain_id: domain_id,  
          skill_id: skill.skill_id,
          skill_name:skill.skill_name,
          type,
          min_experience_months: skill.min_experience_months,
        });
      } else if (skill.__custom) {
        other_skills.push({
          domain: domainName,
          skill: skill.__custom,
          type,
          min_experience_months: skill.min_experience_months,
        });
      }
    });
  });
  return { skills, other_skills };
};