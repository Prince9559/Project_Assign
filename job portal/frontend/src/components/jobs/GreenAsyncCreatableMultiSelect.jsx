import React, { useEffect, useMemo, useRef, useState } from "react";
import CreatableSelect from "react-select/creatable";

const FOCUS_GREEN = "#9bc87c";
const ERROR_RED = "#ef4444";

export default function GreenAsyncCreatableMultiSelect({
  value,
  onChange,
  loadOptions, // async (input) => [{ value: "123", label: "Name" }, ...]
  placeholder,
  error,

  minSearchChars = 0,
  resetBelowChars = 0,
  debounceMs = 400,

  isMulti = true,
  isClearable = true,
  isSearchable = true,
}) {
  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // cache selected options to prevent label mismatch
  const [cachedSelected, setCachedSelected] = useState([]);
  const lastReqId = useRef(0);

  const mergedOptions = useMemo(() => {
    const map = new Map();
    [...options, ...cachedSelected].forEach((o) => {
      if (o?.value != null) map.set(String(o.value), o);
    });
    return Array.from(map.values());
  }, [options, cachedSelected]);

  useEffect(() => {
    const q = inputValue?.trim() || "";

    // if (q.length < resetBelowChars) {
    //   setOptions([]);
    //   setIsLoading(false);
    //   return;
    // }
    // if (q.length < minSearchChars) {
    //   // don’t call API, just keep empty list (UX messages handle it)
    //   setOptions([]);
    //   setIsLoading(false);
    //   return;
    // }

    const reqId = ++lastReqId.current;
    const t = setTimeout(async () => {
      setIsLoading(true);
      try {
        const rows = await loadOptions(q);
        if (lastReqId.current !== reqId) return;
        setOptions(Array.isArray(rows) ? rows : []);
      } catch (e) {
        if (lastReqId.current !== reqId) return;
        setOptions([]);
      } finally {
        if (lastReqId.current === reqId) setIsLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(t);
  }, [inputValue, loadOptions, debounceMs, minSearchChars, resetBelowChars]);

  // keep cache updated with currently selected (only for non-custom)
  useEffect(() => {
    const arr = Array.isArray(value) ? value : value ? [value] : [];
    const apiSelected = arr.filter(
      (o) => o && o.value != null && String(o.value) !== "__custom__"
    );
    if (!apiSelected.length) return;

    setCachedSelected((prev) => {
      const map = new Map(prev.map((p) => [String(p.value), p]));
      apiSelected.forEach((o) => map.set(String(o.value), o));
      return Array.from(map.values());
    });
  }, [value]);

  return (
    <CreatableSelect
      isMulti={isMulti}
      isClearable={isClearable}
      isSearchable={isSearchable}
      filterOption={null}
      className="text-sm"
      value={value}
      options={mergedOptions}
      isLoading={isLoading}
      placeholder={placeholder}
      onMenuOpen={() => {
  setInputValue("");
}}

      onInputChange={(val, actionMeta) => {
        if (actionMeta.action === "input-change") {
          setInputValue(val);
        }
      }}
      onChange={(v) => {
        const arr = Array.isArray(v) ? v : v ? [v] : [];
        // normalize custom-created items to { value: "__custom__", label: inputValue }
        const normalized = arr.map((o) => {
          if (o && o.__isNew__) return { value: "__custom__", label: o.label };
          return o;
        });
        onChange(isMulti ? normalized : normalized[0] || null);
      }}
      // noOptionsMessage={({ inputValue }) => {
      //   const q = (inputValue || "").trim();
      //   if (!q) return "Start typing...";
      //   if (q.length < minSearchChars) return "Type min 3 chars to search";
      //   return "No matches found";
      // }}
      noOptionsMessage={({ inputValue }) => {
  const q = (inputValue || "").trim();

  if (!q) return "No options available";

  return "No matches found";
}}
      formatCreateLabel={(inputValue) => `+ Create: "${inputValue}"`}
      styles={{
        control: (base, state) => ({
          ...base,
          borderColor: error
            ? ERROR_RED
            : state.isFocused
            ? FOCUS_GREEN
            : base.borderColor,
          boxShadow: state.isFocused ? `0 0 0 1px ${FOCUS_GREEN}` : "none",
          "&:hover": { borderColor: error ? ERROR_RED : FOCUS_GREEN },
          minHeight: 40,
        }),
        option: (base, state) => ({
          ...base,
          backgroundColor: state.isSelected
            ? FOCUS_GREEN
            : state.isFocused
            ? "#e6f4dc"
            : "white",
          color: state.isSelected ? "white" : "#1f2937",
        }),
        multiValue: (base) => ({
          ...base,
          backgroundColor: FOCUS_GREEN,
          color: "white",
        }),
        multiValueLabel: (base) => ({
          ...base,
          color: "white",
        }),
        multiValueRemove: (base) => ({
          ...base,
          color: "white",
          ":hover": {
            backgroundColor: "#88b86a",
            color: "white",
          },
        }),
      }}
    />
  );
}