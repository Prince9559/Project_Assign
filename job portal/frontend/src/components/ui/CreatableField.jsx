// import React from "react";
// import { Controller } from "react-hook-form";
// import CreatableSelect from "react-select/creatable";
// import { ErrorMessage } from "../ui"; 

// /**
//  * Generic creatable dropdown for any field that supports:
//  * - Predefined options (with id/value)
//  * - Custom user input ("Other")
//  *
//  * @param {Object} props
//  * @param {Object} props.control - React Hook Form control
//  * @param {Function} props.watch - React Hook Form watch
//  * @param {Function} props.setValue - React Hook Form setValue
//  * @param {Object} props.errors - React Hook Form errors
//  * @param {string} props.namePrefix - e.g., "educations.0", "authorities.2"
//  * @param {string} props.idField - e.g., "school_college_id", "job_role_id"
//  * @param {string} props.otherField - e.g., "other_institution_name", "other_job_role"
//  * @param {Array} props.options - Array like [{ id: 1, name: "ABC" }, ...]
//  * @param {string} props.label - Field label (optional)
//  * @param {string} props.placeholder - Placeholder text
//  * @param {boolean} props.isClearable - Allow clearing selection
//  * @param {boolean} props.isDisabled - Disable input
//  */
// export default function CreatableField({
//   control,
//   watch,
//   setValue,
//   errors,
//   namePrefix,
//   idField,
//   otherField,
//   options = [],
//   label,
//   placeholder = "Search or type...",
//   isClearable = true,
//   isDisabled = false,
// }) {
//   const idPath = `${namePrefix}.${idField}`;
//   const otherPath = `${namePrefix}.${otherField}`;

//   const selectedId = watch(idPath);
//   const otherValue = watch(otherPath) || "";

//   // Map options to { value, label } format for react-select
//   const selectOptions = options.map(opt => ({
//     value: opt.id ?? opt.value,
//     label: opt.name ?? opt.label,
//   }));

//   // Determine current selection for CreatableSelect
//   let value = null;
//   if (selectedId != null) {
//     const matched = selectOptions.find(opt => opt.value === selectedId);
//     if (matched) value = matched;
//   } else if (otherValue) {
//     value = { value: otherValue, label: otherValue, __isNew__: true };
//   }

//   return (
//     <div className="mb-3">
//       {label && <label className="block mb-1 text-sm font-medium text-gray-700">{label}</label>}
      
//       <Controller
//         control={control}
//         name={idPath} // We render based on idField, but manage both fields
//         render={() => (
//           <CreatableSelect
//             value={value}
//             options={selectOptions}
//             onChange={(opt) => {
//               if (!opt) {
//                 // Cleared
//                 setValue(idPath, null);
//                 setValue(otherPath, "");
//                 return;
//               }

//               if (opt.__isNew__) {
//                 // User typed a new value
//                 setValue(idPath, null);
//                 setValue(otherPath, opt.value);
//               } else {
//                 // Selected from list
//                 setValue(idPath, opt.value);
//                 setValue(otherPath, "");
//               }
//             }}
//             placeholder={placeholder}
//             isClearable={isClearable}
//             isSearchable
//             isDisabled={isDisabled}
//             className="w-full text-sm"
//             classNamePrefix="select"
//           />
//         )}
//       />

//       {/* Show errors for both fields if they exist */}
//       {errors?.[idField] && (
//         <ErrorMessage>{errors[idField].message}</ErrorMessage>
//       )}
//       {errors?.[otherField] && (
//         <ErrorMessage>{errors[otherField].message}</ErrorMessage>
//       )}
//     </div>
//   );
// }




import React from "react";
import CreatableSelect from "react-select/creatable";

const defaultStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "44px",
    borderColor: state.isFocused ? "#3b82f6" : "#cbd5e1",
    boxShadow: state.isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : "none",
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
    backgroundColor: state.isFocused ? "#f1f5f9" : "white",
    color: "#1e293b",
  }),
};

export default function CreatableField({
  value, // current selected option (for display)
  onChange, // (option) => void
  options = [],
  placeholder = "Start typing...",
  isDisabled = false,
  allowCustom = true,
  styles = defaultStyles,
  ...props
}) {
  return (
    <CreatableSelect
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      isDisabled={isDisabled}
      isClearable
      isSearchable
      styles={styles}
      components={{ IndicatorSeparator: () => null }}
      isValidNewOption={() => allowCustom}
      formatCreateLabel={(input) => `Add "${input}"`}
      {...props}
    />
  );
}