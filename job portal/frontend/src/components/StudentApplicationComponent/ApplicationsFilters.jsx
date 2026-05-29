// import React from "react";

// export default function ApplicationsFilters({
//   options = [],
//   active = "All",
//   onChange,
//   getLabel,
//   className = "",
// }) {
//   return (
//     <div className={`flex flex-wrap gap-2 sm:gap-3 ${className}`}>
//       {options.map((opt) => {
//         const isActive = active === opt;
//         const label = getLabel ? getLabel(opt) : opt;

//         return (
//           <button
//             key={opt}
//             type="button"
//             onClick={() => onChange?.(opt)}
//             className={[
//               "px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 rounded-full",
//               "text-xs sm:text-sm font-bold transition-all duration-200 border",
//               isActive
//                 ? "bg-[#1e1e2d] text-white border-[#1e1e2d] shadow-sm"
//                 : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-[#1e1e2d]",
//             ].join(" ")}
//           >
//             {label}
//           </button>
//         );
//       })}
//     </div>
//   );
// }


import React from "react";

export default function ApplicationsFilters({
  options = [],
  active = "All",
  onChange,
  getLabel,
  className = "",
}) {
  return (
    <div className={`flex flex-wrap gap-2 sm:gap-3 ${className}`}>
      {options.map((opt) => {
        const isActive = active === opt;
        const label = getLabel ? getLabel(opt) : opt;

        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange?.(opt)}
            className={[
              "px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 rounded-full",
              "text-xs sm:text-sm font-bold transition-all duration-200 border",
              isActive
               
                // ? "bg-gradient-to-r from-[#00C950] to-[#1DB32F] text-white border-transparent shadow-md"
                ? "bg-[#9BC87C] text-white border-[#9BC87C] shadow-md"
                // Inactive Tab: Smooth hover effect with your colors
                : "bg-white text-gray-600 border-gray-200 hover:bg-[#9BC87C]/15 hover:border-[#9BC87C] hover:text-[#1DB32F]",
            ].join(" ")}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}