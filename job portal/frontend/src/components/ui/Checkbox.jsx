import React from "react";

const Checkbox = ({
    label,
    name,
    checked,
    onChange,
    error,
    className = "",
    ...props
}) => {
    const baseStyles = "flex items-center gap-2 p-2 border border-gray-300 rounded-lg bg-white";
    const errorStyles = error ? "border-red-300" : "";
    const containerStyles = `${baseStyles} ${errorStyles} ${className}`;

    return (
        <div>
            <div className={containerStyles}>
                <input
                    type="checkbox"
                    name={name}
                    checked={checked}
                    onChange={onChange}
                    className="w-3 h-3 text-[#9bc87c] border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[rgba(155,200,124,0.3)] focus:border-[#9bc87c]"
                    {...props}
                />
                <label className="text-xs font-semibold text-gray-700 cursor-pointer">
                    {label}
                </label>
            </div>
            {error && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
        </div>
    );
};

export default Checkbox; 