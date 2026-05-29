import React from "react";

const RadioGroup = ({
    label,
    name,
    value,
    onChange,
    options = [],
    error,
    className = "",
    ...props
}) => {
    const baseStyles = "flex gap-3 p-2 border border-gray-300 rounded-lg bg-white";
    const errorStyles = error ? "border-red-300" : "";
    const containerStyles = `${baseStyles} ${errorStyles} ${className}`;

    return (
        <div>
            {label && (
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {label}
                </label>
            )}
            <div className={containerStyles}>
                {options.map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={value === option.value}
                            onChange={onChange}
                            className="w-3 h-3 text-[#9bc87c] border-gray-300 focus:outline-none focus:ring-2 focus:ring-[rgba(155,200,124,0.3)] focus:border-[#9bc87c]"
                        />
                        <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                ))}
            </div>
            {error && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
        </div>
    );
};

export default RadioGroup; 