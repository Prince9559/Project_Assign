// src/components/ui/CreatableSelectField.jsx
import React from "react";
import CreatableSelect from "react-select/creatable";
import { Controller } from "react-hook-form";

const CreatableSelectField = React.forwardRef(
  (
    {
      name,
      control,
      setValue, // ← add this
      label,
      error,
      options = [],
      placeholder = "Select or create...",
      className = "",
      allowCreate = true,
      otherValueName, // e.g., "other_designation_name"
      isClearable = true,
      isSearchable = true,
      ...props
    },
    ref
  ) => {
    const selectOptions = options.map((opt) =>
      typeof opt === "string" ? { value: opt, label: opt } : opt
    );

    return (
      <div className={`mb-3 ${className}`}>
        {label && (
          <label className="block mb-1 text-xs font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500"> *</span>}
          </label>
        )}

        <Controller
          name={name}
          control={control}
          render={({ field }) => {
            const isCustomValue = field.value && !selectOptions.some(opt => String(opt.value) === String(field.value));

            return (
              <CreatableSelect
                {...field}
                ref={ref}
                value={
                  field.value
                    ? {
                        value: field.value,
                        label: isCustomValue
                          ? field.value
                          : selectOptions.find(opt => String(opt.value) === String(field.value))?.label ||
                            field.value,
                      }
                    : null
                }
                onChange={(selectedOption) => {
                  if (!selectedOption) {
                    field.onChange("");
                    if (otherValueName && setValue) {
                      setValue(otherValueName, "");
                    }
                    return;
                  }

                  const { value, __isNew__ } = selectedOption;

                  if (__isNew__ && allowCreate) {
                    field.onChange("other");
                    if (otherValueName && setValue) {
                      setValue(otherValueName, value);
                    }
                  } else {
                    field.onChange(String(value));
                    if (otherValueName && setValue) {
                      setValue(otherValueName, "");
                    }
                  }
                }}
                options={selectOptions}
                placeholder={placeholder}
                isClearable={isClearable}
                isSearchable={isSearchable}
                isValidNewOption={() => allowCreate}
                menuPlacement="auto"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    minHeight: "36px",
                    fontSize: "0.875rem",
                    borderColor: error ? "#ef4444" : state.isFocused ? "#3b82f6" : "#d1d5db",
                    boxShadow: state.isFocused ? "0 0 0 3px rgba(59, 130, 246, 0.1)" : "none",
                    "&:hover": {
                      borderColor: error ? "#ef4444" : "#9ca3af",
                    },
                  }),
                  menu: (base) => ({ ...base, zIndex: 100 }),
                }}
              />
            );
          }}
        />

        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

CreatableSelectField.displayName = "CreatableSelectField";

export default CreatableSelectField;