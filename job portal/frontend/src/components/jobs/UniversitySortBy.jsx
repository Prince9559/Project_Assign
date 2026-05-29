import React from "react";
import Select from "react-select";

const SORT_OPTIONS = [
  { value: "relevance-desc", label: "Relevance (My university first)" },
  { value: "created_at-desc", label: "Posted Date (Newest)" },
  { value: "created_at-asc", label: "Posted Date (Oldest)" },
];

const sortStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "36px",
    borderRadius: "6px",
    borderColor: state.isFocused ? "#9bc87c" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 1px #9bc87c" : "none",
    "&:hover": { borderColor: "#9bc87c" },
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "0 8px",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#111827",
    fontSize: "0.95rem",
  }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#6b7280",
    "&:hover": { color: "#374151" },
  }),
  option: (base, state) => ({
    ...base,
    fontSize: "0.95rem",
    backgroundColor: state.isSelected
      ? "#9bc87c"
      : state.isFocused
      ? "#eaf5e1"
      : "#ffffff",
    color: "#1e1e2d",
    cursor: "pointer",
  }),
  menu: (base) => ({
    ...base,
    zIndex: 30,
  }),
};

export default function SortByFilter({
  value = "relevance-desc",
  onChange,
  className = "",
}) {
  const selected =
    SORT_OPTIONS.find((opt) => opt.value === value) || SORT_OPTIONS[0];

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <label htmlFor="sort-by-filter" className="text-sm font-medium text-gray-700">
        Sort by:
      </label>

      <div className="min-w-[260px]">
        <Select
          inputId="sort-by-filter"
          options={SORT_OPTIONS}
          value={selected}
          onChange={(opt) => onChange?.(opt?.value || "relevance-desc")}
          styles={sortStyles}
          isSearchable={false}
          classNamePrefix="sort-by"
        />
      </div>
    </div>
  );
}