import React from "react";

const SuccessMessage = ({
    children,
    className = "",
    size = "default",
    showIcon = true,
    color = "green", // NEW PROP
    ...props
}) => {
    const baseStyles =
        "text-center rounded-md flex items-center justify-center";

    const sizeStyles = {
        small: "text-xs p-1.5 sm:p-2",
        default: "text-xs p-2 sm:p-3",
        large: "text-sm p-3 sm:p-4",
    };

    //  Dynamic color styles
    const colorStyles = {
        green: "bg-green-50 text-green-600 border border-green-300",
        red: "bg-red-50 text-red-600 border border-red-300",
        blue: "bg-[#f3f9ee] text-green-700 border border-[#9bc87c]",
        yellow: "bg-yellow-50 text-yellow-600 border border-yellow-300",
    };

    const messageClasses = `${baseStyles} ${sizeStyles[size]} ${colorStyles[color] || colorStyles.green
        } ${className}`;

    return (
        <div className={messageClasses} {...props}>
            {showIcon && (
                <svg
                    className="w-3 h-3 mr-1.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                >
                    <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                    />
                </svg>
            )}
            {children}
        </div>
    );
};

export default SuccessMessage;