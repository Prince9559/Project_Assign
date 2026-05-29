import React, { useMemo } from "react";
import Select from "react-select";

const DEFAULT_NO_OPTIONS = "No options available";

export default function FilterMultiSelect({
  options = [],
  value = [],
  onChange,
  onInputChange,
  isLoading = false,
  placeholder = "Select...",
  noOptionsMessage,
  isClearable = true,
  isSearchable = true,
  menuPortalTarget,
  menuPosition = "fixed",
  className = "w-full text-sm",
  classNamePrefix = "select",
  styles,
  debugLabel,
}) {
  const normalizedOptions = useMemo(() => {
    const safe = Array.isArray(options) ? options : [];
    // Ensure { value, label }
    return safe
      .map((opt) => {
        if (!opt) return null;
        if (typeof opt === "string" || typeof opt === "number") {
          return { value: opt, label: String(opt) };
        }
        const value = opt.value ?? opt.id ?? opt.key ?? opt.name ?? opt.title;
        const label = opt.label ?? opt.name ?? opt.title ?? String(value ?? "");
        if (value == null || label == null) return null;
        return { ...opt, value, label };
      })
      .filter(Boolean);
  }, [options]);

  const normalizedValue = useMemo(() => {
    const safe = Array.isArray(value) ? value : value ? [value] : [];
    return safe
      .map((v) => {
        if (!v) return null;
        if (typeof v === "string" || typeof v === "number") {
          const match = normalizedOptions.find((o) => String(o.value) === String(v));
          return match || { value: v, label: String(v) };
        }
        const vValue = v.value ?? v.id ?? v.key ?? v.name ?? v.title;
        const match = normalizedOptions.find((o) => String(o.value) === String(vValue));
        return match || { ...v, value: vValue, label: v.label ?? v.name ?? v.title ?? String(vValue) };
      })
      .filter(Boolean);
  }, [value, normalizedOptions]);

  // Temporary debug logs (as requested)
  // eslint-disable-next-line no-console
  console.log(`[FilterMultiSelect:${debugLabel || "select"}] options`, normalizedOptions);
  // eslint-disable-next-line no-console
  console.log(`[FilterMultiSelect:${debugLabel || "select"}] selected value`, normalizedValue);

  return (
    <Select
      isMulti
      options={normalizedOptions}
      value={normalizedValue}
      onChange={(selected) => onChange?.(selected || [])}
      onInputChange={(inputValue, meta) => onInputChange?.(inputValue, meta)}
      isLoading={isLoading}
      placeholder={placeholder}
      className={className}
      classNamePrefix={classNamePrefix}
      styles={styles}
      menuPortalTarget={menuPortalTarget}
      menuPosition={menuPosition}
      isClearable={isClearable}
      isSearchable={isSearchable}
      noOptionsMessage={() =>
        typeof noOptionsMessage === "function"
          ? noOptionsMessage()
          : noOptionsMessage || DEFAULT_NO_OPTIONS
      }
    />
  );
}

