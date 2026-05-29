// import React from "react";
// import { FaBriefcase, FaUserGraduate, FaProjectDiagram } from "react-icons/fa";

// const CARD_CONFIG = [
//   { key: "jobs", label: "Jobs", valueKey: "job_count", icon: FaBriefcase, accent: "from-blue-500 to-indigo-600" },
//   { key: "internships", label: "Internships", valueKey: "internship_count", icon: FaUserGraduate, accent: "from-emerald-500 to-teal-600" },
//   { key: "projects", label: "Projects", valueKey: "project_count", icon: FaProjectDiagram, accent: "from-violet-500 to-fuchsia-600" },
// ];

// export default function OpportunityCountCards({
//   summary,
//   selectedType,
//   onSelectType,
//   className = "",
// }) {
//   return (
//     <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${className}`}>
//       {CARD_CONFIG.map((item) => {
//         const Icon = item.icon;
//         const isActive = selectedType === item.key;
//         const count = summary?.[item.valueKey] || 0;

//         return (
//           <button
//             key={item.key}
//             type="button"
//             onClick={() => onSelectType?.(item.key)}
//             className={[
//               "group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300",
//               "hover:-translate-y-0.5 hover:shadow-lg",
//               isActive
//                 ? "border-transparent bg-white shadow-lg ring-2 ring-blue-300"
//                 : "border-gray-200 bg-white hover:border-gray-300",
//             ].join(" ")}
//           >
//             <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${item.accent}`} />
//             <div className="flex items-start justify-between">
//               <div>
//                 <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">{item.label}</p>
//                 <p className="mt-2 text-3xl font-extrabold text-gray-900">{count}</p>
//               </div>
//               <span className={`rounded-xl bg-gradient-to-br ${item.accent} p-2.5 text-white shadow`}>
//                 <Icon size={14} />
//               </span>
//             </div>
//           </button>
//         );
//       })}
//     </div>
//   );
// }










import React from "react";
import { FaBriefcase, FaUserGraduate, FaProjectDiagram } from "react-icons/fa";

const CARD_CONFIG = [
  { key: "jobs", label: "Jobs", valueKey: "job_count", icon: FaBriefcase },
  { key: "internships", label: "Internships", valueKey: "internship_count", icon: FaUserGraduate },
  { key: "projects", label: "Projects", valueKey: "project_count", icon: FaProjectDiagram },
];

export default function OpportunityCountCards({
  summary,
  selectedType,
  onSelectType,
  className = "",
}) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${className}`}>
      {CARD_CONFIG.map((item) => {
        const Icon = item.icon;
        const isActive = selectedType === item.key;
        const count = summary?.[item.valueKey] || 0;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelectType?.(item.key)}
            className={[
              "group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300",
              "hover:-translate-y-0.5 hover:shadow-lg",
              isActive
                ? "border-[#9bc87c] bg-[#f6fbf2] shadow-lg ring-2 ring-[#9bc87c]/40"
                : "border-gray-200 bg-white hover:border-[#9bc87c]/60",
            ].join(" ")}
          >
            <div className="absolute inset-x-0 top-0 h-1 bg-[#9bc87c]" />
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">{item.label}</p>
                <p className="mt-2 text-3xl font-extrabold text-gray-900">{count}</p>
              </div>
              <span className="rounded-xl bg-[#9bc87c] p-2.5 text-white shadow">
                <Icon size={14} />
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}