// import React from "react";

// const OPEN_TO_OPTIONS = [
//   { value: "", label: "All" },
//   { value: "open_to_all", label: "Open to all" },
//   { value: "open_to_freshers", label: "Open to freshers" },
//   { value: "open_to_experienced", label: "Open to experienced" },
// ];

// export default function OpenToFilter({ value = "", onChange, className = "" }) {
//   return (
//     <div className={`flex flex-wrap items-center gap-2 ${className}`}>
//       <label htmlFor="open-to-filter" className="text-sm font-medium text-gray-700">
//         Open to:
//       </label>

//       <select
//         id="open-to-filter"
//         value={value}
//         onChange={(e) => onChange?.(e.target.value)}
//         className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#9bc87c] focus:border-[#9bc87c]"
//       >
//         {OPEN_TO_OPTIONS.map((opt) => (
//           <option key={opt.value || "all"} value={opt.value}>
//             {opt.label}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }








import React from "react";
import Select from "react-select";

const OPEN_TO_OPTIONS = [
  { value: "", label: "All" },
  { value: "open_to_all", label: "Open to all" },
  { value: "open_to_freshers", label: "Open to freshers" },
  { value: "open_to_experienced", label: "Open to experienced" },
];

const openToStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "36px",
    borderRadius: "6px",
    borderColor: state.isFocused ? "#9bc87c" : "#d1d5db",
    boxShadow: state.isFocused ? "0 0 0 1px #9bc87c" : "none",
    "&:hover": {
      borderColor: "#9bc87c",
    },
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
  indicatorSeparator: () => ({
    display: "none",
  }),
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

export default function OpenToFilter({ value = "", onChange, className = "" }) {
  const selected = OPEN_TO_OPTIONS.find((opt) => opt.value === value) || OPEN_TO_OPTIONS[0];

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      <label htmlFor="open-to-filter" className="text-sm font-medium text-gray-700">
        Open to:
      </label>

      <div className="min-w-[190px]">
        <Select
          inputId="open-to-filter"
          options={OPEN_TO_OPTIONS}
          value={selected}
          onChange={(opt) => onChange?.(opt?.value || "")}
          styles={openToStyles}
          isSearchable={false}
          classNamePrefix="open-to"
        />
      </div>
    </div>
  );
}