// import React from "react";

// export default function OpportunitiesCount({ count = 0, className = "" }) {
//   return (
//     <div className={`text-sm font-medium text-gray-600 ${className}`}>
//       {count} opportunities
//     </div>
//   );
// }

import React from "react";

export default function OpportunitiesCount({ count = 0, className = "" }) {
  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-[#9BC87C]/10 border-[#00C950]/40 text-[#1e1e2d] text-sm font-semibold ${className}`}
    >
      <span className="w-2 h-2 rounded-full bg-[#00C950]" />
      <span>{count} opportunities</span>
    </div>
  );
}