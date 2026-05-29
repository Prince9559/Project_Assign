// import React from "react";

// const THEME = {
//   light: "#9BC87C",
//   bright: "#00C950",
//   dark: "#1DB32F",
//   borderDark: "#1e1e2d",
// };

// export default function RoleOptionCard({ role, selected, onSelect }) {
//   const isSelected = selected;

//   const accent = role?.accent || THEME.dark; // allow override per role

//   return (
//     <button
//       type="button"
//       onClick={onSelect}
//       className={[
//         "w-full text-left rounded-2xl px-5 py-4 transition-all duration-200 border",
//         "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
//         isSelected
//           ? "bg-white shadow-sm"
//           : "bg-white hover:shadow-sm hover:bg-gray-50",
//       ].join(" ")}
//       style={{
//         borderColor: isSelected ? THEME.borderDark : "#e5e7eb",
//         boxShadow: isSelected ? `0 0 0 2px ${THEME.dark}` : "none",
//       }}
//     >
//       <div className="flex items-start justify-between gap-3">
//         <div className="min-w-0">
//           <div className="flex items-center gap-2">
//             <span
//               className="inline-block w-2.5 h-2.5 rounded-full"
//               style={{ backgroundColor: THEME.bright }}
//             />
//             <h3
//               className="text-sm font-extrabold truncate"
//               style={{ color: THEME.borderDark }}
//             >
//               {role.label}
//             </h3>

//             {isSelected ? (
//               <span
//                 className="ml-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
//                 style={{
//                   backgroundColor: `${THEME.light}33`,
//                   color: THEME.dark,
//                   border: `1px solid ${THEME.light}`,
//                 }}
//               >
//                 Selected
//               </span>
//             ) : null}
//           </div>

//           <p className="mt-1 text-xs font-medium text-gray-600">
//             {role.description}
//           </p>

//           {role.features?.length ? (
//             <div className="mt-3 flex flex-wrap gap-2">
//               {role.features.slice(0, 3).map((f) => (
//                 <span
//                   key={f}
//                   className="text-[11px] font-semibold px-2 py-1 rounded-full"
//                   style={{
//                     border: `1px solid ${THEME.light}`,
//                     backgroundColor: `${THEME.light}1F`,
//                     color: THEME.borderDark,
//                   }}
//                 >
//                   {f}
//                 </span>
//               ))}
//             </div>
//           ) : null}
//         </div>

//         <div className="flex-shrink-0">
//           <div
//             className="w-6 h-6 rounded-full border flex items-center justify-center"
//             style={{
//               borderColor: isSelected ? THEME.dark : "#d1d5db",
//               backgroundColor: isSelected ? THEME.dark : "transparent",
//             }}
//           >
//             <span className="text-white text-sm leading-none">
//               {isSelected ? "✓" : ""}
//             </span>
//           </div>
//         </div>
//       </div>
//     </button>
//   );
// }








import React from "react";

const THEME = {
  light: "#9BC87C",
  bright: "#00C950",
  dark: "#1DB32F",
  borderDark: "#1e1e2d",
};

export default function RoleOptionCard({ role, selected, onSelect }) {
  const isSelected = selected;
  const accent = role?.accent || THEME.dark;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "w-full text-left rounded-2xl px-5 py-4 transition-all duration-200 border",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        isSelected
          ? "bg-white shadow-md"
          : "bg-white hover:shadow-md hover:bg-gray-50",
      ].join(" ")}
      style={{
        borderColor: isSelected ? accent : "#e5e7eb",
        boxShadow: isSelected ? `0 0 0 2px ${accent}33` : "none",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {/* Title Row */}
          <div className="flex items-center gap-2">
            <span
              className="inline-block w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: accent }}
            />

            <h3 className="text-sm font-semibold text-gray-800 tracking-wide">
              {role.label}
            </h3>

            {isSelected && (
              <span
                className="ml-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  background: `linear-gradient(135deg, ${THEME.light}, #d9f99d)`,
                  color: "#166534",
                  border: `1px solid ${THEME.light}`,
                }}
              >
                Selected
              </span>
            )}
          </div>

          {/* Description */}
          <p className="mt-1 text-xs text-gray-500 leading-relaxed">
            {role.description}
          </p>

          {/* Features */}
          {role.features?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {role.features.slice(0, 3).map((f) => (
                <span
                  key={f}
                  className="text-[11px] font-medium px-2 py-1 rounded-full transition"
                  style={{
                    border: `1px solid ${THEME.light}`,
                    backgroundColor: `${THEME.light}20`,
                    color: "#374151",
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        {/* Checkbox */}
        <div className="flex-shrink-0">
          <div
            className="w-6 h-6 rounded-full border flex items-center justify-center transition-all"
            style={{
              borderColor: isSelected ? accent : "#d1d5db",
              background: isSelected
                ? `linear-gradient(135deg, ${accent}, ${THEME.bright})`
                : "transparent",
            }}
          >
            <span className="text-white text-sm leading-none">
              {isSelected ? "✓" : ""}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}