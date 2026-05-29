import React, { useMemo } from "react";
import ReactSelectDropdown from "./ReactSelectDropdown";

const MONTHS = [
  { value: "01", label: "Jan" },
  { value: "02", label: "Feb" },
  { value: "03", label: "Mar" },
  { value: "04", label: "Apr" },
  { value: "05", label: "May" },
  { value: "06", label: "Jun" },
  { value: "07", label: "Jul" },
  { value: "08", label: "Aug" },
  { value: "09", label: "Sep" },
  { value: "10", label: "Oct" },
  { value: "11", label: "Nov" },
  { value: "12", label: "Dec" },
];

function parseYM(ym) {
  if (!ym || typeof ym !== "string") return { year: "", month: "" };
  const [year, month] = ym.split("-");
  return { year: year || "", month: month || "" };
}

function buildYM(year, month) {
  if (!year || !month) return "";
  return `${year}-${month}`;
}

export default function MonthYearDropdown({
  label,
  value, // "YYYY-MM"
  onChange, // (nextYM: string) => void
  disabled = false,
  error,
  yearRange = 35,
  placeholderMonth = "Month",
  placeholderYear = "Year",
  focusColor = "#1DB32F",
}) {
  const { year, month } = parseYM(value);

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: yearRange }, (_, i) => {
      const y = String(currentYear - i);
      return { value: y, label: y };
    });
  }, [yearRange]);

  const monthValue = month ? MONTHS.find((m) => m.value === month) : null;
  const yearValue = year ? yearOptions.find((y) => y.value === year) : null;

  return (
    <div className="w-full">
      {label ? (
        <div className="block mb-1 text-sm font-medium text-gray-700">
          {label}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-2">
        <ReactSelectDropdown
          placeholder={placeholderMonth}
          options={MONTHS}
          value={monthValue}
          onChange={(opt) => onChange?.(buildYM(year, opt?.value || ""))}
          isClearable
          isSearchable={false}
          isDisabled={disabled}
          error={error}
          focusColor={focusColor}
        />

        <ReactSelectDropdown
          placeholder={placeholderYear}
          options={yearOptions}
          value={yearValue}
          onChange={(opt) => onChange?.(buildYM(opt?.value || "", month))}
          isClearable
          isSearchable={false}
          isDisabled={disabled}
          error={error}
          focusColor={focusColor}
        />
      </div>
    </div>
  );
}