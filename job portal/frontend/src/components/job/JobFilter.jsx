import React, { useMemo } from "react";
import Select from "react-select";
import { Button, Checkbox, Input } from "../ui";
import FilterMultiSelect from "../jobs/FilterMultiSelect";

const THEME = {
  light: "#9BC87C",
  bright: "#00C950",
  dark: "#1DB32F",
  text: "#1e1e2d",
};

const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    borderColor: state.isFocused ? THEME.dark : "#e5e7eb",
    boxShadow: state.isFocused ? `0 0 0 1px ${THEME.light}` : "none",
    "&:hover": { borderColor: THEME.light },
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? `${THEME.light}33`
      : state.isFocused
      ? `${THEME.light}1F`
      : "white",
    color: THEME.text,
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: `${THEME.light}33`,
    border: `1px solid ${THEME.light}66`,
  }),
  multiValueLabel: (base) => ({ ...base, color: THEME.text, fontWeight: 600 }),
  multiValueRemove: (base) => ({
    ...base,
    color: THEME.dark,
    ":hover": { backgroundColor: `${THEME.light}33`, color: THEME.bright },
  }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

function Chip({ label, onRemove }) {
  return (
    <span
      className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border"
      style={{ borderColor: `${THEME.light}80`, background: `${THEME.light}1A`, color: THEME.text }}
    >
      {label}
      <button type="button" onClick={onRemove} className="text-xs font-bold" style={{ color: THEME.dark }}>
        ×
      </button>
    </span>
  );
}

/**
 * Props expectation (match your AllJObs logic)
 * filters: { jobProfile:[], location:[], company:[], minSalary:"", maxSalary:"", opportunityType:[], jobType:[], targetedOnly:boolean, sortBy, sortOrder }
 * options: { jobProfiles:[{label,value}], locations:[{label,value}], companies:[{label,value}] }
 */
export default function JobFiltersPanel({
  title = "Job Filters",
  subtitle = "Help us match you with the best career opportunities",
  isOpen = true,
  onClose,
  filters,
  setFilters,
  options,
  loading = {},
  search = {},
  onApply,
  onClear,
}) {
  const activeChips = useMemo(() => {
    const chips = [];
    (filters.opportunityType || []).forEach((x) => chips.push({ key: `opp:${x}`, label: x }));
    (filters.jobType || []).forEach((x) => chips.push({ key: `jobtype:${x}`, label: x }));
    (filters.jobProfile || []).forEach((x) => chips.push({ key: `profile:${x}`, label: x }));
    (filters.location || []).forEach((x) => chips.push({ key: `loc:${x}`, label: x }));
    (filters.company || []).forEach((x) => chips.push({ key: `comp:${x}`, label: x }));
    if (filters.minSalary) chips.push({ key: "minSalary", label: `Min ₹${filters.minSalary}` });
    if (filters.maxSalary) chips.push({ key: "maxSalary", label: `Max ₹${filters.maxSalary}` });
    if (filters.targetedOnly) chips.push({ key: "targetedOnly", label: "College only" });
    return chips;
  }, [filters]);

  if (!isOpen) return null;

  return (
    <aside className="bg-white rounded-2xl shadow-sm border-2 border-[#00C950] pt-4 px-4 pb-3 sm:pt-5 sm:px-5 sm:pb-4 lg:pt-6 lg:px-6 lg:pb-4 flex flex-col gap-4 self-start h-fit">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-extrabold" style={{ color: THEME.text }}>
            {title}
          </h2>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
      </div>

      {/* Active chips */}
      {activeChips.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {activeChips.map((c) => (
            <Chip
              key={c.key}
              label={c.label}
              onRemove={() => {
                // minimal chip remove behavior
                if (c.key.startsWith("opp:")) {
                  const v = c.key.slice(4);
                  setFilters((p) => ({ ...p, opportunityType: (p.opportunityType || []).filter((x) => x !== v) }));
                } else if (c.key.startsWith("jobtype:")) {
                  const v = c.key.slice(8);
                  setFilters((p) => ({ ...p, jobType: (p.jobType || []).filter((x) => x !== v) }));
                } else if (c.key.startsWith("profile:")) {
                  const v = c.key.slice(8);
                  setFilters((p) => ({ ...p, jobProfile: (p.jobProfile || []).filter((x) => x !== v) }));
                } else if (c.key.startsWith("loc:")) {
                  const v = c.key.slice(4);
                  setFilters((p) => ({ ...p, location: (p.location || []).filter((x) => x !== v) }));
                } else if (c.key.startsWith("comp:")) {
                  const v = c.key.slice(5);
                  setFilters((p) => ({ ...p, company: (p.company || []).filter((x) => x !== v) }));
                } else if (c.key === "minSalary") setFilters((p) => ({ ...p, minSalary: "" }));
                else if (c.key === "maxSalary") setFilters((p) => ({ ...p, maxSalary: "" }));
                else if (c.key === "targetedOnly") setFilters((p) => ({ ...p, targetedOnly: false }));
              }}
            />
          ))}
        </div>
      ) : null}

      {/* Opportunity type */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold" style={{ color: THEME.text }}>
          Opportunity Type
        </label>
        <div className="flex flex-wrap gap-3">
          {["internship", "job", "project"].map((t) => (
            <Checkbox
              key={t}
              checked={(filters.opportunityType || []).includes(t)}
              onChange={() =>
                setFilters((p) => {
                  const cur = p.opportunityType || [];
                  return cur.includes(t)
                    ? { ...p, opportunityType: cur.filter((x) => x !== t) }
                    : { ...p, opportunityType: [...cur, t] };
                })
              }
              label={t[0].toUpperCase() + t.slice(1)}
              className="accent-[#9BC87C]"
            />
          ))}
        </div>
      </div>

      {/* Profile */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold" style={{ color: THEME.text }}>
          Profile
        </label>
        <FilterMultiSelect
          debugLabel="jobProfile"
          options={options.jobProfiles || []}
          value={filters.jobProfile || []}
          onChange={(opts) =>
            setFilters((p) => ({ ...p, jobProfile: (opts || []).map((o) => o.value) }))
          }
          onInputChange={(value, meta) => {
            if (meta?.action === "input-change") {
              search.setJobRoleSearchText?.(value);
            }
          }}
          isLoading={!!loading.jobProfiles}
          // placeholder="Search job profiles (min 3 chars)..."
          placeholder="Search job profiles..."
          styles={selectStyles}
          menuPortalTarget={typeof document !== "undefined" ? document.body : null}
          menuPosition="fixed"
          // noOptionsMessage={() => {
          //   const q = search.jobRoleSearchText || "";
          //   if ((options.jobProfiles || []).length === 0) {
          //     return q.length < 3 ? "Type at least 3 characters" : "No options available";
          //   }
          //   return "No options available";
          // }}
          noOptionsMessage={() => "No options available"}
        />
      </div>

      {/* Location */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold" style={{ color: THEME.text }}>
          Location
        </label>
        <FilterMultiSelect
          debugLabel="location"
          options={options.locations || []}
          value={filters.location || []}
          onChange={(opts) =>
            setFilters((p) => ({ ...p, location: (opts || []).map((o) => o.value) }))
          }
          onInputChange={(value, meta) => {
            if (meta?.action === "input-change") {
              search.setLocationSearchText?.(value);
            }
          }}
          isLoading={!!loading.locations}
          // placeholder="Search locations (min 3 chars)..."
          placeholder="Search locations..."
          styles={selectStyles}
          menuPortalTarget={typeof document !== "undefined" ? document.body : null}
          menuPosition="fixed"
          // noOptionsMessage={() => {
          //   const q = search.locationSearchText || "";
          //   if ((options.locations || []).length === 0) {
          //     return q.length < 3 ? "Type at least 3 characters" : "No options available";
          //   }
          //   return "No options available";
          // }}
          noOptionsMessage={() => "No options available"}
        />
      </div>

      {/* Company */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold" style={{ color: THEME.text }}>
          Company
        </label>
        <FilterMultiSelect
          debugLabel="company"
          options={options.companies || []}
          value={filters.company || []}
          onChange={(opts) =>
            setFilters((p) => ({ ...p, company: (opts || []).map((o) => o.value) }))
          }
          onInputChange={(value, meta) => {
            if (meta?.action === "input-change") {
              search.setCompanySearchText?.(value);
            }
          }}
          isLoading={!!loading.companies}
          // placeholder="Type 3+ chars to search companies..."
          placeholder="Search companies..."
          styles={selectStyles}
          menuPortalTarget={typeof document !== "undefined" ? document.body : null}
          menuPosition="fixed"
          // noOptionsMessage={() => {
          //   const q = search.companySearchText || "";
          //   if ((options.companies || []).length === 0) {
          //     return q.length < 3 ? "Type at least 3 characters" : "No options available";
          //   }
          //   return "No options available";
          // }}
          noOptionsMessage={() => "No options available"}
        />
      </div>

      {/* Salary */}
      <div className="grid grid-cols-1 gap-3">
        <label className="text-sm font-semibold" style={{ color: THEME.text }}>
          Annual Salary (INR)
        </label>
        <Input
          type="number"
          placeholder="Min (e.g. 300000)"
          value={filters.minSalary || ""}
          onChange={(e) => setFilters((p) => ({ ...p, minSalary: e.target.value }))}
        />
        <Input
          type="number"
          placeholder="Max (e.g. 1200000)"
          value={filters.maxSalary || ""}
          onChange={(e) => setFilters((p) => ({ ...p, maxSalary: e.target.value }))}
        />
      </div>

      {/* Targeted */}
      <div className="flex items-center gap-2">
        <Checkbox
          checked={!!filters.targetedOnly}
          onChange={(e) => setFilters((p) => ({ ...p, targetedOnly: e.target.checked }))}
          label="Only jobs for your college"
          className="accent-[#9BC87C]"
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100">
        <button
          type="button"
          onClick={onClear}
          className="w-full sm:w-auto text-sm font-semibold text-gray-500 hover:text-[#1e1e2d]"
        >
          Clear all
        </button>
        <Button type="button" variant="primary" size="small" className="w-full sm:w-auto" onClick={onApply}>
          Apply
        </Button>
      </div>
    </aside>
  );
}