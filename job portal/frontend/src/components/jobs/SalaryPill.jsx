import React from "react";
import { FaMoneyBillWave } from "react-icons/fa";

export default function SalaryPill({ salary, className = "" }) {
  if (!salary) return null;
  return (
    <span className={`px-3 py-1.5 text-gray-700 bg-gray-100 rounded-full text-xs inline-flex items-center gap-2 ${className}`}>
      <FaMoneyBillWave className="text-gray-500" />
      {salary}
    </span>
  );
}