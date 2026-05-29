import React from "react";
import Select from "react-select";

export default function GreenReactSelect({
  label,
  error,
  focusColor = "#9bc87c",
  className = "",
  classNamePrefix = "select",
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
        className="w-full text-sm"
        classNamePrefix={classNamePrefix}
        styles={{
          control: (base, state) => ({
            ...base,
            minHeight: 40,
            borderColor: error
              ? "#ef4444"
              : state.isFocused
              ? focusColor
              : base.borderColor,
            boxShadow: state.isFocused ? `0 0 0 1px ${focusColor}` : "none",
            "&:hover": { borderColor: error ? "#ef4444" : focusColor },
          }),
          option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
              ? "#eaf4e3"
              : state.isFocused
              ? "#f3f9ee"
              : "white",
            color: "#1e1e2d",
          }),
        }}
        {...props}
      />

      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}