import React from "react";
import Select from "react-select";

export default function ReactSelectDropdown({
  label,
  error,
  className = "",
  classNamePrefix = "select",
  focusColor = "#9bc87c", // 
  ...props
}) {
  return (
    <div className={`w-full ${className}`}>
      {label ? (
        <label className="block mb-1 text-sm font-medium text-gray-700">
          {label}
        </label>
      ) : null}

      <Select
        className="text-sm"
        classNamePrefix={classNamePrefix}
        styles={{
          control: (base, state) => ({
            ...base,
            borderColor: error
              ? "#ef4444"
              : state.isFocused
              ? focusColor
              : base.borderColor,
            boxShadow: state.isFocused
              ? `0 0 0 1px ${focusColor}`
              : base.boxShadow,
            "&:hover": {
              borderColor: error ? "#ef4444" : focusColor,
            },
            minHeight: 40,
          }),
        }}
        {...props}
      />

      {error ? (
        <p className="mt-1 text-xs text-red-500">{error}</p>
      ) : null}
    </div>
  );
}