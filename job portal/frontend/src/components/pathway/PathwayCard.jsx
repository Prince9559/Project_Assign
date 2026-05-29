// import React, { useState } from 'react';
// import { FiChevronDown, FiChevronUp, FiEye, FiCheck } from 'react-icons/fi';
// import Badge from '../../components/ui/Badge';
// import Button from '../../components/ui/Button';
// import PathwayStepItem from './PathwayStepItem';

// const STRATEGY_LABELS = {
//   preference_heavy: '🎯 Preference-Heavy',
//   fastest: '⚡ Fastest',
//   balanced: '⚖️ Balanced',
// };

// const STRATEGY_COLORS = {
//   preference_heavy: '#6EB5DD',
//   fastest: '#E8AC6E',
//   balanced: '#888CE4',
// };

// const PathwayCard = ({ pathway, onExpand, isExpanded, onSelect }) => {
//   const color = STRATEGY_COLORS[pathway.strategy] || '#6EB5DD';
//   const strategyLabel = STRATEGY_LABELS[pathway.strategy] || pathway.strategy;

//   const totalDurationWeeks = (pathway.total_duration_days / 7).toFixed(1);
//   const composition = [];
//   if (pathway.composition.internships > 0)
//     composition.push(`${pathway.composition.internships} Internship${pathway.composition.internships > 1 ? 's' : ''}`);
//   if (pathway.composition.projects > 0)
//     composition.push(`${pathway.composition.projects} Project${pathway.composition.projects > 1 ? 's' : ''}`);
//   if (pathway.composition.courses > 0)
//     composition.push(`${pathway.composition.courses} Course${pathway.composition.courses > 1 ? 's' : ''}`);
//   if (pathway.composition.jobs > 0)
//     composition.push(`${pathway.composition.jobs} Job${pathway.composition.jobs > 1 ? 's' : ''}`);

//   return (
//     <div className="overflow-hidden border border-gray-200 shadow-sm rounded-xl">
//       {/* Header */}
//       <div
//         className="px-6 pt-6 pb-4 cursor-pointer"
//         style={{ backgroundColor: color }}
//         onClick={() => onExpand(pathway.pathway_id)}
//       >
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-white/30">
//               <FiEye className="w-8 h-8 text-white" />
//             </div>
//             <div>
//               <h2 className="text-2xl font-bold text-white">Pathway {pathway.rank}</h2>
//               {/* <p className="font-medium text-white/90">{strategyLabel}</p> */}
//               <div className="flex flex-wrap items-center gap-2 mt-2">
//                 <Badge
//                   color="bg-white/20 text-white border border-white/40"
//                   text={`${composition.join(', ')}`}
//                 />
//                 <Badge
//                   color="bg-white/20 text-white border border-white/40"
//                   text={`${totalDurationWeeks} weeks`}
//                 />
//               </div>
//             </div>
//           </div>
//           <div className="flex flex-col items-end">
//             <Badge
//               color="bg-white text-gray-900 border border-gray-300"
//               text={
//                 <div className="flex items-center space-x-1">
//                   <FiCheck className="w-4 h-4" />
//                   <span>{pathway.skills_covered} / {pathway.gap_analysis?.total_gap || '?'} Skills</span>
//                 </div>
//               }
//             />
//             <div className="flex items-center mt-2 text-sm text-white/80">
//               <span>Score: {pathway.score?.toFixed(0) || '—'}</span>
//               {isExpanded ? (
//                 <FiChevronUp className="w-4 h-4 ml-2" />
//               ) : (
//                 <FiChevronDown className="w-4 h-4 ml-2" />
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Steps (expandable) */}
//       {isExpanded && pathway.steps && (
//         <div className="p-4 space-y-3 bg-white border-t border-gray-100">
//           {pathway.steps.map((step, idx) => (
//             <PathwayStepItem key={step.step_id || idx} step={step} index={idx} />
//           ))}
//         </div>
//       )}

//       {/* CTA */}
//       <div className="flex justify-end px-6 py-4 bg-gray-50">
//         <Button
//           variant="primary"
//           size="small"
//           onClick={(e) => {
//             e.stopPropagation();
//             onSelect(pathway.pathway_id);
//           }}
//           className="text-white bg-blue-600 hover:bg-blue-700"
//         >
//           Select This Pathway
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default PathwayCard;


















// // src/components/pathway/PathwayCard.jsx
// import React from 'react';
// import { FiChevronDown, FiChevronUp, FiCheck } from 'react-icons/fi';
// import Badge from '../ui/Badge';
// import Button from '../ui/Button';
// import PathwayStepItem from './PathwayStepItem';

// const PathwayCard = ({ pathway, onExpand, isExpanded, onSelect }) => {
//   // Calculate total duration in weeks
//   const totalDurationWeeks = (pathway.total_duration_days / 7).toFixed(1);

//   // Build composition string
//   const composition = [];
//   if (pathway.composition?.internships > 0)
//     composition.push(`${pathway.composition.internships} Internship${pathway.composition.internships > 1 ? 's' : ''}`);
//   if (pathway.composition?.projects > 0)
//     composition.push(`${pathway.composition.projects} Project${pathway.composition.projects > 1 ? 's' : ''}`);
//   if (pathway.composition?.courses > 0)
//     composition.push(`${pathway.composition.courses} Course${pathway.composition.courses > 1 ? 's' : ''}`);
//   if (pathway.composition?.jobs > 0)
//     composition.push(`${pathway.composition.jobs} Job${pathway.composition.jobs > 1 ? 's' : ''}`);

//   return (
//     <div className="overflow-hidden border border-gray-200 shadow-sm rounded-xl">
//       {/* Header */}
//       <div
//         className="px-6 pt-6 pb-4 cursor-pointer bg-indigo-600"
//         onClick={() => onExpand(pathway.pathway_id)}
//       >
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-white/20">
//               <FiCheck className="w-8 h-8 text-white" />
//             </div>
//             <div>
//               <h2 className="text-2xl font-bold text-white">Pathway {pathway.rank}</h2>
//               <div className="flex flex-wrap items-center gap-2 mt-2">
//                 {composition.length > 0 && (
//                   <Badge
//                     color="bg-white/20 text-white border border-white/40"
//                     text={composition.join(', ')}
//                   />
//                 )}
//                 <Badge
//                   color="bg-white/20 text-white border border-white/40"
//                   text={`${totalDurationWeeks} weeks`}
//                 />
//               </div>
//             </div>
//           </div>
//           <div className="flex flex-col items-end">
//             <Badge
//               color="bg-white text-gray-900 border border-gray-300"
//               text={
//                 <div className="flex items-center space-x-1">
//                   <FiCheck className="w-4 h-4" />
//                   <span>
//                     {pathway.skills_covered || 0} / {pathway.gap_analysis?.total_gap || '?'} Skills
//                   </span>
//                 </div>
//               }
//             />
//             <div className="flex items-center mt-2 text-sm text-white/80">
//               {isExpanded ? (
//                 <FiChevronUp className="w-4 h-4 ml-2" />
//               ) : (
//                 <FiChevronDown className="w-4 h-4 ml-2" />
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Steps */}
//       {isExpanded && pathway.steps && (
//         <div className="p-4 space-y-3 bg-white border-t border-gray-100">
//           {pathway.steps.map((step, idx) => (
//             <PathwayStepItem key={step.step_id || idx} step={step} index={idx} />
//           ))}
//         </div>
//       )}

//       {/* CTA */}
//       <div className="flex justify-end px-6 py-4 bg-gray-50">
//         <Button
//           variant="primary"
//           size="small"
//           onClick={(e) => {
//             e.stopPropagation();
//             onSelect(pathway.pathway_id);
//           }}
//           className="text-white bg-blue-600 hover:bg-blue-700"
//         >
//           Select This Pathway
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default PathwayCard;









































// src/components/pathway/PathwayCard.jsx
import React from 'react';
import { FiCheck, FiClock, FiBookOpen, FiBriefcase, FiFolder } from 'react-icons/fi';

const RESOURCE_ICONS = {
  course: FiBookOpen,
  internship: FiBriefcase,
  project: FiFolder,
  job: FiBriefcase,
};

const RESOURCE_COLORS = {
  course: 'bg-blue-100 text-blue-800',
  internship: 'bg-orange-100 text-orange-800',
  project: 'bg-purple-100 text-purple-800',
  job: 'bg-green-100 text-green-800',
};

const PathwayCard = ({ pathway, isExpanded, onExpand, onSelect }) => {
  const composition = [];
  if (pathway.total_courses > 0) {
    composition.push(`${pathway.total_courses} Course${pathway.total_courses > 1 ? 's' : ''}`);
  }
  if (pathway.total_internships > 0) {
    composition.push(`${pathway.total_internships} Internship${pathway.total_internships > 1 ? 's' : ''}`);
  }
  if (pathway.total_projects > 0) {
    composition.push(`${pathway.total_projects} Project${pathway.total_projects > 1 ? 's' : ''}`);
  }
  if (pathway.total_jobs > 0) {
    composition.push(`${pathway.total_jobs} Job${pathway.total_jobs > 1 ? 's' : ''}`);
  }

  return (
    <div className="border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div
        className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 cursor-pointer"
        onClick={() => onExpand(pathway.pathway_id)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/20">
              <FiCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Pathway {pathway.pathway_rank}</h3>
              <p className="text-indigo-100 mt-1">
                {pathway.overall_skill_coverage_percent.toFixed(1)}% Skills Covered
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20 text-white">
              <FiClock className="w-4 h-4 mr-1" />
              {pathway.total_duration_months.toFixed(1)} months
            </span>
            <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-white text-gray-900">
              {composition.join(', ') || 'No resources'}
            </span>
          </div>
        </div>
      </div>

      {/* Steps (expandable) */}
      {isExpanded && (
        <div className="p-4 space-y-3 bg-white border-t border-gray-100">
          {pathway.steps.length > 0 ? (
            pathway.steps.map((step) => (
              <div key={step.step_order} className="flex items-start p-3 border border-gray-100 rounded-lg">
                <div className="flex-shrink-0 mr-4 mt-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${RESOURCE_COLORS[step.opportunity_type]}`}>
                    {React.createElement(RESOURCE_ICONS[step.opportunity_type], { className: "w-4 h-4" })}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{step.opportunity_title}</h4>
                      <p className="text-xs text-gray-500 capitalize mt-1">
                        {step.opportunity_type} • {step.duration_months.toFixed(1)} months
                      </p>
                    </div>
                    {step.skills_gained.length > 0 && (
                      <div className="ml-4 flex flex-wrap gap-1">
                        {step.skills_gained.slice(0, 3).map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            +{skill.experience_months}mo {skill.skill_name}
                          </span>
                        ))}
                        {step.skills_gained.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">
                            +{step.skills_gained.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {step.step_reasoning && (
                    <p className="text-xs text-gray-600 mt-2">{step.step_reasoning}</p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500">
              No steps in this pathway
            </div>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="flex justify-end px-6 py-4 bg-gray-50">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(pathway.pathway_id);
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
        >
          Select This Pathway
        </button>
      </div>
    </div>
  );
};

export default PathwayCard;