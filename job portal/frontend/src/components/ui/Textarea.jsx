import React from "react";

const Textarea = React.forwardRef(({
    label,
    error,
    className = "",
    size = "default", // "small", "default", "large"
    variant = "default", // "default", "error", "disabled"
    rows = 3,
    required=false,
    ...props
}, ref) => {
    const baseStyles = "w-full border rounded-md focus:outline-none transition-all duration-200 resize-vertical";

    const sizeStyles = {
        small: "px-1.5 sm:px-2 py-1 sm:py-1.5 text-xs",
        default: "px-3 py-2 text-sm",
        large: "px-4 py-3 text-base"
    };

    const variantStyles = {
        default:
            "border-gray-300 hover:border-[#9bc87c] focus:outline-none focus:ring-2 focus:ring-[rgba(155,200,124,0.3)] focus:border-[#9bc87c]",
        error:
            "border-red-500 bg-red-50 focus:outline-none focus:ring-2 focus:ring-[rgba(239,68,68,0.25)] focus:border-red-500",
        disabled: "border-gray-300 bg-gray-50 cursor-not-allowed"
    };

    const textareaClasses = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

    return (
        <div className="mb-2 sm:mb-3">
            {label && (
                <label className="block text-gray-700 text-xs font-semibold mb-0.5 sm:mb-1">
                    {label} {required ? <span className="text-red-500">*</span> : ""}
                </label>
            )}
            <textarea
                ref={ref}
                rows={rows}
                className={textareaClasses}
                {...props}
            />
            {error && (
                <span className="block mt-1 text-sm text-red-500">
                    {error}
                </span>
            )}
        </div>
    );
});

Textarea.displayName = "Textarea";

export default Textarea; 