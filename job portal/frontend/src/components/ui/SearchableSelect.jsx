import React, {useState, useRef, useEffect} from "react";
import { FaTimes, FaInfoCircle } from "react-icons/fa";

export const SearchableSelect = ({
  options = [],
  value = null, // single: id or { __create: true, value: "..." }, multi: array of ids + { __custom: "..." }
  onChange,
  placeholder = "",
  error,
  isMulti = false,
  isCreatable = false,
  getOptionLabel = (opt) => opt.name || opt.title || String(opt),
  getOptionValue = (opt) => opt.id,
  displayValue = null,
  inputValue: controlledInputValue,
  setInputValue: controlledSetInputValue,
}) => {
  const [uncontrolledInputValue, setUncontrolledInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Use controlled props if provided, else fallback to internal state
  const inputValue = controlledInputValue !== undefined ? controlledInputValue : uncontrolledInputValue;
  const setInputValue = controlledSetInputValue !== undefined ? controlledSetInputValue : setUncontrolledInputValue;

  const containerRef = useRef(null); //track the whole component

  const effectivePlaceholder =
    (isMulti && (!value || value.length === 0) && inputValue === "") ||
    (!isMulti && value == null && inputValue === "" && displayValue === null)
      ? placeholder
      : "";

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const filteredOptions = options.filter((opt) =>
    getOptionLabel(opt).toLowerCase().includes(inputValue.toLowerCase())
  );

  const showCreateOption =
    isCreatable &&
    inputValue.trim() !== "" &&
    !filteredOptions.some(
      (opt) => getOptionLabel(opt).toLowerCase() === inputValue.toLowerCase()
    );

  const handleSelect = (item) => {
    if (item.__create) {
      if (isMulti) {
        const current = Array.isArray(value) ? value : [];
        const customItem = { __custom: item.value.trim() };
        const exists = current.some(
          (v) =>
            (typeof v === "object" && v.__custom === customItem.__custom) ||
            (typeof v === "number" &&
              options.some(
                (opt) =>
                  getOptionValue(opt) === v &&
                  getOptionLabel(opt).toLowerCase() ===
                    customItem.__custom.toLowerCase()
              ))
        );
        if (!exists) {
          onChange([...current, customItem]);
        }
      } else {
        onChange({ __create: true, value: item.value.trim() });
      }
    } else {
      const val = getOptionValue(item);
      if (isMulti) {
        const current = Array.isArray(value) ? value : [];
        if (!current.includes(val)) {
          onChange([...current, val]);
        }
      } else {
        onChange(val);
      }
    }
    setInputValue("");
    setIsOpen(false);
  };

  const handleRemove = (itemToRemove) => {
    if (isMulti) {
      onChange(
        value.filter((item) =>
          typeof item === "object"
            ? item.__custom !== itemToRemove.__custom
            : item !== itemToRemove
        )
      );
    } else {
      onChange(null);
      setInputValue("");
    }
  };

  const renderTags = () => {
    if (!isMulti || !Array.isArray(value)) return null;
    return value.map((item, idx) => {
      let label, key;
      if (typeof item === "object" && item.__custom) {
        label = item.__custom;
        key = `custom-${idx}`;
      } else {
        const found = options.find((opt) => getOptionValue(opt) === item);
        label = found ? getOptionLabel(found) : String(item);
        key = item;
      }
      return (
        <span
          key={key}
          className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-900 bg-[#eaf4e3] rounded-full"
        >
          {label}
          <button
            type="button"
            className="ml-1 text-green-700 hover:text-green-900"
            onClick={() => handleRemove(item)}
          >
            <FaTimes className="w-2 h-2" />
          </button>
        </span>
      );
    });
  };

  // For single-select: get display label when not editing
  const getSingleDisplayLabel = () => {
    if (value == null) return "";
    if (typeof value === "object" && value.__create) {
      return value.value;
    }
    const opt = options.find((o) => getOptionValue(o) === value);
    return opt ? getOptionLabel(opt) : String(value);
  };

  const getDisplayLabel = () => {
    if (displayValue !== null) return displayValue; // ← priority
    if (value == null) return "";
    if (typeof value === "object" && value.__create) {
      return value.value;
    }
    const opt = options.find((o) => getOptionValue(o) === value);
    return opt ? getOptionLabel(opt) : String(value);
  };

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={`flex flex-wrap items-center gap-1 px-2 py-2 min-h-[40px] transition-all duration-200 border rounded-md cursor-text focus-within:border-transparent
          ${error ? "border-[#ef4444]" : "border-gray-300 hover:border-[#9bc87c]"}
          focus-within:ring-2 ${error ? "focus-within:ring-[rgba(239,68,68,0.25)]" : "focus-within:ring-[rgba(155,200,124,0.3)]"}`}
        onClick={() => setIsOpen(true)}
      >
        {/* {isMulti && (!value || value.length === 0) && inputValue === "" && (
          <span className="text-sm text-gray-400">{placeholder}</span>
        )}
        {!isMulti &&
          value == null &&
          inputValue === "" &&
          displayValue === null && (
            <span className="text-sm text-gray-400">{placeholder}</span>
          )} */}

        {renderTags()}
        <input
          type="text"
          className="flex-1 text-sm outline-none min-w-[80px]"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (inputValue.trim()) {
                const matched = filteredOptions.find(
                  (opt) =>
                    getOptionLabel(opt).toLowerCase() ===
                    inputValue.toLowerCase()
                );
                if (matched) {
                  handleSelect(matched);
                } else if (isCreatable) {
                  handleSelect({ __create: true, value: inputValue.trim() });
                }
              }
            }
          }}
          onFocus={() => setIsOpen(true)}
          // onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          placeholder={effectivePlaceholder}
        />
        {/* Clear button for single-select */}
        {!isMulti && (value != null || inputValue !== "") && (
          <button
            type="button"
            className="w-5 h-5 ml-1 text-green-700 hover:text-green-900"
            // className="relative flex items-center justify-center w-5 h-5 ml-1 text-blue-600 transition-colors rounded-full hover:text-blue-800 focus:outline-none z-3"
            onClick={(e) => {
              e.stopPropagation(); // Prevent opening dropdown
              if (inputValue !== "") {
                setInputValue("");
              } else {
                onChange(null);
                setInputValue("");
              }
              setIsOpen(false);
            }}
            aria-label="Clear selection"
          >
            <FaTimes className="w-2.5 h-2.5" />
          </button>
        )}
        {/* Single-select visual label when not focused and not typing */}
        {!isMulti &&
          (value != null || displayValue !== null) &&
          inputValue === "" &&
          !isOpen && (
            <span className="absolute left-2 top-2.5 text-sm text-gray-700 pointer-events-none">
              {getDisplayLabel()}
            </span>
          )}
      </div>

      {/* Dropdown */}
      {isOpen && (filteredOptions.length > 0 || showCreateOption) && (
        <div className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg max-h-48">
          {filteredOptions.slice(0, 10).map((option) => {
            const optionValue = getOptionValue(option);
            const isSelected = isMulti
              ? Array.isArray(value) && value.includes(optionValue)
              : value === optionValue;
            return (
              <button
                key={optionValue}
                type="button"
                className={`w-full text-left px-3 py-2 text-sm hover:bg-[#f3f9ee] hover:text-green-900 transition-colors ${
                  isSelected ? "bg-[#eaf4e3] text-green-900" : ""
                }`}
                onClick={() => handleSelect(option)}
              >
                {getOptionLabel(option)}
                {isSelected && (
                  <span className="float-right text-green-700">✓</span>
                )}
              </button>
            );
          })}
          {showCreateOption && (
            <button
              type="button"
              className="w-full px-3 py-2 text-sm text-left text-green-700 hover:bg-[#f3f9ee]"
              onClick={() =>
                handleSelect({ __create: true, value: inputValue.trim() })
              }
            >
              + Create: "{inputValue.trim()}"
            </button>
          )}
        </div>
      )}

      {/* Selected item indicator for single-select */}
      {!isMulti &&
        (value != null || (typeof value === "object" && value?.__create)) && (
          <div className="mt-1 text-sm text-gray-600">
            Selected:{" "}
            <span className="font-medium">
              {typeof value === "object" && value.__create
                ? value.value
                : getOptionLabel(
                    options.find((opt) => getOptionValue(opt) === value) || {
                      name: String(value),
                    }
                  )}
            </span>
            <button
              type="button"
              className="ml-2 text-xs text-red-500 hover:text-red-700"
              onClick={(e) => {
                e.preventDefault();
                onChange(null);
                setInputValue("");
              }}
            >
              Remove
            </button>
          </div>
        )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};
