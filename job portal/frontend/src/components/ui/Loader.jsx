// import React from "react";

// export default function Loader({ message = "Loading..." }) {
//     return (
//         <div className="w-full p-2 border rounded bg-gray-100 text-gray-500 flex items-center justify-center">
//             <div className="flex items-center space-x-2">
//                 <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
//                 <span className="text-sm">{message}</span>
//             </div>
//         </div>
//     );
// } 


import React from "react";

export default function Loader({
  message = "Loading...",
  size = "sm",        // sm | md | lg
  variant = "light",  // light | dark
  fullWidth = true,
}) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-3",
  };

  const variantClasses = {
    light: "bg-gray-100 text-gray-500 border-gray-300",
    dark: "bg-gray-800 text-white border-gray-600",
  };

  return (
    <div
      className={`
        ${fullWidth ? "w-full" : "inline-flex"}
        p-2 rounded flex items-center justify-center
        ${variantClasses[variant]}
      `}
    >
      <div className="flex items-center gap-2">
        <div
          className={`
            animate-spin rounded-full
            border-b-transparent
            ${sizeClasses[size]}
            border-current
          `}
        ></div>

        {message && <span className="text-sm">{message}</span>}
      </div>
    </div>
  );
}