// import React from "react";
// import { getImageUrl } from "../../../utils.js"; // adjust path if needed

// export default function CompanyLogo({ logoUrl, alt = "Company logo", className = "" }) {
//   return (
//     <div className={`flex items-center justify-center bg-white border border-gray-100 rounded-lg ${className}`}>
//       <img
//         src={getImageUrl(logoUrl)}
//         alt={alt}
//         className="object-contain w-10 h-10 p-1 sm:w-12 sm:h-12 lg:w-14 lg:h-14"
//         onError={(e) => { e.currentTarget.style.display = "none"; }}
//       />
//     </div>
//   );
// }


import React from "react";
import { getImageUrl } from "../../../utils.js"; // adjust path if needed

export default function CompanyLogo({ logoUrl, alt = "Company logo" }) {
  return (
    <div className="flex-shrink-0">
      <div className="flex items-center justify-center w-12 h-12 bg-white border border-gray-100 rounded-lg sm:w-14 sm:h-14 lg:w-16 lg:h-16">
        <img
          src={getImageUrl(logoUrl)}
          alt={alt}
          className="object-contain w-10 h-10 p-1 sm:w-12 sm:h-12 lg:w-14 lg:h-14"
          onError={(e) => { 
            e.currentTarget.style.display = "none"; 
          }}
        />
      </div>
    </div>
  );
}