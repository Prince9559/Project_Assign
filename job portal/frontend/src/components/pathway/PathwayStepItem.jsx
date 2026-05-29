// import React from 'react';
// import { FiBookOpen, FiBriefcase, FiFolder } from 'react-icons/fi';

// const RESOURCE_ICONS = {
//     course: FiBookOpen,
//     internship: FiBriefcase,
//     project: FiFolder,
// };

// const RESOURCE_COLORS = {
//     course: 'bg-blue-500',
//     internship: 'bg-orange-500',
//     project: 'bg-purple-500',
// };

// const PathwayStepItem = ({ step, index }) => {
//     const Icon = RESOURCE_ICONS[step.resource.type] || FiBookOpen;
//     const colorClass = RESOURCE_COLORS[step.resource.type] || 'bg-gray-500';

//     return (
//         <div className="flex items-center px-4 py-3 bg-white border border-gray-100 shadow-sm rounded-xl">
//             <div className="flex-shrink-0 mr-4">
//                 <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center`}>
//                     <Icon className="w-5 h-5 text-white" />
//                 </div>
//             </div>
//             <div className="flex-1 min-w-0">
//                 <h3 className="text-base font-semibold text-gray-900 truncate">{step.resource.title}</h3>
//                 <p className="text-sm text-gray-500">
//                     {step.skills_to_learn.length} skill{step.skills_to_learn.length !== 1 ? 's' : ''} •{' '}
//                     {step.expected_duration_days} day{step.expected_duration_days !== 1 ? 's' : ''}
//                 </p>
//                 <div className="flex items-center mt-1 space-x-2">
//                     <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
//                         {step.resource.type.charAt(0).toUpperCase() + step.resource.type.slice(1)}
//                     </span>
//                     <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
//                         {step.resource.difficulty || 'Intermediate'}
//                     </span>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default PathwayStepItem;

































// src/components/pathway/PathwayStepItem.jsx
import React from 'react';
import { FiBookOpen, FiBriefcase, FiFolder } from 'react-icons/fi';

const RESOURCE_ICONS = {
    course: FiBookOpen,
    internship: FiBriefcase,
    project: FiFolder,
    job: FiBriefcase,
};

const RESOURCE_COLORS = {
    course: 'bg-blue-500',
    internship: 'bg-orange-500',
    project: 'bg-purple-500',
    job: 'bg-green-500',
};

const PathwayStepItem = ({ step }) => {
    const type = step.resource?.type || 'course';
    const Icon = RESOURCE_ICONS[type] || FiBookOpen;
    const colorClass = RESOURCE_COLORS[type] || 'bg-gray-500';

    return (
        <div className="flex items-start px-4 py-3 bg-white border border-gray-100 shadow-sm rounded-xl">
            <div className="flex-shrink-0 mr-4 mt-1">
                <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900">{step.resource?.title || 'Untitled Resource'}</h3>
                <p className="text-sm text-gray-500">
                    {step.skills_to_learn?.length || 0} skill{step.skills_to_learn?.length !== 1 ? 's' : ''} •{' '}
                    {step.expected_duration_days || 0} day{step.expected_duration_days !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center mt-1 space-x-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {step.resource?.difficulty || 'Intermediate'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PathwayStepItem;