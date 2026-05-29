import React from "react";

export default function GreenPillRadioGroup({
  name,
  options = [], // array of strings
  value,
  onChange, // (newValue) => void
  error,
}) {
  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`px-2 py-1.5 rounded-md border text-xs font-medium transition-colors ${
                selected
                  ? "bg-[#9bc87c] text-white border-[#9bc87c]"
                  : "bg-gray-100 border-gray-300 hover:border-[#9bc87c]"
              }`}
              aria-pressed={selected}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* keep name for form semantics if you want hidden input */}
      {name ? <input type="hidden" name={name} value={value || ""} /> : null}

      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </div>
  );
}