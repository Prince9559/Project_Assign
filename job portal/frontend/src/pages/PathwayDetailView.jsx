// // // src/pages/PathwayDetailView.js
// // import React, { useState, useEffect } from 'react';
// // import { FiArrowLeft, FiCheckCircle, FiClock, FiPlay, FiBookOpen, FiBriefcase, FiFolder } from 'react-icons/fi';
// // import MainLayout from '../components/layout/MainLayout';
// // import Button from '../components/ui/Button';
// // import { pathwaysApi } from '../api/pathwaysApi';
// // import {useNavigate} from "react-router-dom";

// // const RESOURCE_ICONS = {
// //     course: FiBookOpen,
// //     internship: FiBriefcase,
// //     project: FiFolder,
// // };

// // const RESOURCE_COLORS = {
// //     course: 'text-blue-600',
// //     internship: 'text-orange-600',
// //     project: 'text-purple-600',
// // };

// // const PathwayDetailView = () => {
// //     const navigate=useNavigate();
// //     const pathwayId = new URLSearchParams(window.location.search).get('id') ||
// //         window.location.pathname.split('/').pop();

// //     const [pathway, setPathway] = useState(null);
// //     const [loading, setLoading] = useState(true);
// //     const [error, setError] = useState(null);

// //     useEffect(() => {
// //         loadPathway();
// //     }, [pathwayId]);

// //     const loadPathway = async () => {
// //         try {
// //             setLoading(true);
// //             const res = await pathwaysApi.getPathwayById(pathwayId);
// //             if (res.success) {
// //                 setPathway(res.pathway);
// //             } else {
// //                 setError('Pathway not found.');
// //             }
// //         } catch (err) {
// //             console.error('Failed to load pathway:', err);
// //             setError('Failed to load pathway details.');
// //         } finally {
// //             setLoading(false);
// //         }
// //     };

// //     const handleMarkStepComplete = async (stepId) => {
// //         // Note: Your backend doesn’t yet support updating step status.
// //         // You’ll need to add PATCH /api/pathways/:id/steps/:stepId
// //         // For now, simulate UI update:
// //         setPathway(prev => {
// //             if (!prev) return prev;
// //             return {
// //                 ...prev,
// //                 steps: prev.steps.map(step =>
// //                     step.step_id === stepId
// //                         ? { ...step, status: 'completed', completion_percentage: 100 }
// //                         : step
// //                 ),
// //             };
// //         });
// //         alert('Step marked as complete!');
// //     };

// //     const handleStartLearning = () => {
// //         const nextStep = pathway.steps.find(step => step.status === 'pending');
// //         if (nextStep) {
// //             alert(`Starting: ${nextStep.resource.title}`);
// //             // Redirect to resource URL if external, or internal learning page
// //             if (nextStep.resource.external_url) {
// //                 window.open(nextStep.resource.external_url, '_blank');
// //             } else {
// //                 // Redirect to internal learning module (future)
// //                 // window.location.href = `/learn/${nextStep.resource.resource_id}`;
// //             }
// //         }
// //     };

// //     if (loading) {
// //         return (
// //             <MainLayout>
// //                 <div className="max-w-4xl p-6 mx-auto">
// //                     <div className="space-y-6 animate-pulse">
// //                         <div className="w-1/3 h-8 bg-gray-200 rounded"></div>
// //                         <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
// //                         <div className="space-y-4">
// //                             {[1, 2, 3].map(i => (
// //                                 <div key={i} className="flex items-center space-x-4">
// //                                     <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
// //                                     <div className="flex-1">
// //                                         <div className="w-3/4 h-4 mb-2 bg-gray-200 rounded"></div>
// //                                         <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
// //                                     </div>
// //                                 </div>
// //                             ))}
// //                         </div>
// //                     </div>
// //                 </div>
// //             </MainLayout>
// //         );
// //     }

// //     if (error || !pathway) {
// //         return (
// //             <MainLayout>
// //                 <div className="max-w-2xl p-6 mx-auto text-center">
// //                     <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
// //                         <FiCheckCircle className="w-8 h-8 text-red-600" />
// //                     </div>
// //                     <h2 className="mb-2 text-xl font-bold text-gray-900">Oops!</h2>
// //                     <p className="mb-4 text-gray-600">{error || 'Pathway not found.'}</p>
// //                     <Button onClick={() => window.history.back()}>← Go Back</Button>
// //                 </div>
// //             </MainLayout>
// //         );
// //     }

// //     const completedSteps = pathway.steps.filter(s => s.status === 'completed').length;
// //     const progress = (completedSteps / pathway.steps.length) * 100;

// //     return (
// //         <MainLayout>
// //             <div className="max-w-5xl p-4 mx-auto md:p-6">
// //                 <Button
// //                     variant="ghost"
// //                     onClick={() => window.history.back()}
// //                     className="flex items-center mb-6 text-gray-700 hover:text-gray-900"
// //                 >
// //                     <FiArrowLeft className="mr-2" /> Back to Dashboard
// //                 </Button>

// //                 {/* Header */}
// //                 <div className="p-6 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl">
// //                     <div className="flex flex-col md:flex-row md:items-center md:justify-between">
// //                         <div>
// //                             <h1 className="text-2xl font-bold text-gray-900">
// //                                 Pathway {pathway.rank}
// //                                 {pathway.strategy_type && (
// //                                     <span className="ml-2 text-base font-normal text-gray-600">
// //                                         ({pathway.strategy_type.replace('_', ' ')})
// //                                     </span>
// //                                 )}
// //                             </h1>
// //                             <div className="flex items-center mt-2 space-x-4 text-sm text-gray-600">
// //                                 <span>🗓️ {pathway.total_duration_weeks} weeks</span>
// //                                 <span>🎯 {pathway.skills_covered} skills</span>
// //                                 <span>📊 {pathway.coverage_percent}% coverage</span>
// //                             </div>
// //                         </div>
// //                         <div className="mt-4 md:mt-0">
// //                             <span className={`px-3 py-1 rounded-full text-sm font-medium ${pathway.status === 'completed'
// //                                     ? 'bg-green-100 text-green-800'
// //                                     : pathway.status === 'in_progress'
// //                                         ? 'bg-yellow-100 text-yellow-800'
// //                                         : 'bg-blue-100 text-blue-800'
// //                                 }`}>
// //                                 {pathway.status.replace('_', ' ').toUpperCase()}
// //                             </span>
// //                         </div>
// //                     </div>

// //                     {/* Progress Bar */}
// //                     <div className="mt-4">
// //                         <div className="flex justify-between mb-1 text-sm text-gray-600">
// //                             <span>Progress</span>
// //                             <span>{Math.round(progress)}% • {completedSteps} of {pathway.steps.length} steps</span>
// //                         </div>
// //                         <div className="w-full bg-gray-200 rounded-full h-2.5">
// //                             <div
// //                                 className={`h-2.5 rounded-full ${pathway.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
// //                                     }`}
// //                                 style={{ width: `${progress}%` }}
// //                             ></div>
// //                         </div>
// //                     </div>

// //                     {/* CTA */}
// //                     {pathway.status !== 'completed' && (
// //                         <div className="mt-6">
// //                             <Button
// //                                 variant="primary"
// //                                 size="large"
// //                                 onClick={handleStartLearning}
// //                                 className="flex items-center"
// //                             >
// //                                 <FiPlay className="mr-2" />
// //                                 {completedSteps === 0 ? 'Start Pathway' : 'Resume Learning'}
// //                             </Button>
// //                         </div>
// //                     )}
// //                 </div>

// //                 {/* Steps */}
// //                 <div className="space-y-5">
// //                     <h2 className="text-xl font-semibold text-gray-900">Learning Steps</h2>
// //                     {pathway.steps.map((step, index) => {
// //                         const Icon = RESOURCE_ICONS[step.resource.type] || FiBookOpen;
// //                         const colorClass = RESOURCE_COLORS[step.resource.type] || 'text-gray-600';

// //                         return (
// //                             <div
// //                                 key={step.step_id}
// //                                 className={`bg-white rounded-xl border p-5 ${step.status === 'completed'
// //                                         ? 'border-green-200 bg-green-50'
// //                                         : step.status === 'in_progress'
// //                                             ? 'border-yellow-200 bg-yellow-50'
// //                                             : 'border-gray-200'
// //                                     }`}
// //                             >
// //                                 <div className="flex">
// //                                     {/* Step Number */}
// //                                     <div className="flex-shrink-0 mr-4">
// //                                         <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step.status === 'completed'
// //                                                 ? 'bg-green-500 text-white'
// //                                                 : step.status === 'in_progress'
// //                                                     ? 'bg-yellow-500 text-white'
// //                                                     : 'bg-gray-200 text-gray-700'
// //                                             }`}>
// //                                             {step.status === 'completed' ? <FiCheckCircle className="w-4 h-4" /> : index + 1}
// //                                         </div>
// //                                     </div>

// //                                     {/* Content */}
// //                                     <div className="flex-1">
// //                                         <div className="flex flex-col md:flex-row md:items-start md:justify-between">
// //                                             <div>
// //                                                 <div className="flex items-center mb-1 space-x-2">
// //                                                     <Icon className={`w-5 h-5 ${colorClass}`} />
// //                                                     <h3 className="font-semibold text-gray-900">{step.resource.title}</h3>
// //                                                 </div>
// //                                                 <p className="mb-2 text-sm text-gray-600">
// //                                                     {step.skills_to_learn.length} skill{step.skills_to_learn.length !== 1 ? 's' : ''} •{' '}
// //                                                     {step.expected_duration_weeks} weeks
// //                                                 </p>
// //                                                 <div className="flex flex-wrap gap-1">
// //                                                     <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
// //                                                         {step.resource.type.charAt(0).toUpperCase() + step.resource.type.slice(1)}
// //                                                     </span>
// //                                                     <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
// //                                                         {step.resource.difficulty || 'Intermediate'}
// //                                                     </span>
// //                                                 </div>
// //                                             </div>

// //                                             <div className="flex mt-2 space-x-2 md:mt-0">
// //                                                 {step.status !== 'completed' && (
// //                                                     <Button
// //                                                         size="small"
// //                                                         onClick={() => handleMarkStepComplete(step.step_id)}
// //                                                     >
// //                                                         Mark Complete
// //                                                     </Button>
// //                                                 )}
// //                                                 <Button
// //                                                     variant="outline"
// //                                                     size="small"
// //                                                     onClick={() => {
// //                                                         if (step.resource.external_url) {
// //                                                             window.open(step.resource.external_url, '_blank');
// //                                                         }else if(step.resource.resource_id){
// //                                                             navigate(`/pathways/resource/${step.resource.resource_id}`);
// //                                                         }
// //                                                     }}
// //                                                 >
// //                                                     View Resource
// //                                                 </Button>
// //                                             </div>
// //                                         </div>

// //                                         {/* Skills */}
// //                                         <div className="mt-3">
// //                                             <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">Skills Covered</p>
// //                                             <div className="flex flex-wrap gap-1 mt-1">
// //                                                 {step.skills_to_learn.map((skill, i) => (
// //                                                     <span
// //                                                         key={i}
// //                                                         className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded"
// //                                                     >
// //                                                         {skill.skill_name || `Skill ${skill}`}
// //                                                     </span>
// //                                                 ))}
// //                                             </div>
// //                                         </div>
// //                                     </div>
// //                                 </div>
// //                             </div>
// //                         );
// //                     })}
// //                 </div>

// //                 {/* Completion Message */}
// //                 {pathway.status === 'completed' && (
// //                     <div className="p-6 mt-8 text-center border border-green-200 bg-green-50 rounded-xl">
// //                         <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 bg-green-100 rounded-full">
// //                             <FiCheckCircle className="w-8 h-8 text-green-600" />
// //                         </div>
// //                         <h3 className="mb-2 text-xl font-bold text-green-800">Pathway Completed! 🎉</h3>
// //                         <p className="text-green-700">
// //                             You’ve covered {pathway.skills_covered} skills. Ready for your next challenge?
// //                         </p>
// //                         <div className="mt-4">
// //                             <Button
// //                                 variant="primary"
// //                                 onClick={() => window.location.href = '/mypathway'}
// //                             >
// //                                 Build Another Pathway
// //                             </Button>
// //                         </div>
// //                     </div>
// //                 )}
// //             </div>
// //         </MainLayout>
// //     );
// // };

// // export default PathwayDetailView;















































































// // src/pages/PathwayDetailView.jsx
// import React, { useState, useEffect } from 'react';
// import {
//   FiArrowLeft,
//   FiCheckCircle,
//   FiClock,
//   FiPlay,
//   FiBookOpen,
//   FiBriefcase,
//   FiFolder,
//   FiInfo,
// } from 'react-icons/fi';
// import MainLayout from '../components/layout/MainLayout';
// import { useNavigate, useParams } from 'react-router-dom';
// import { useSelector } from 'react-redux';

// const BASE_URL=import.meta.env.VITE_BASE_URL;

// const RESOURCE_ICONS = {
//   course: FiBookOpen,
//   internship: FiBriefcase,
//   project: FiFolder,
//   job: FiBriefcase,
// };

// const RESOURCE_COLORS = {
//   course: 'text-blue-600',
//   internship: 'text-orange-600',
//   project: 'text-purple-600',
//   job: 'text-green-600',
// };

// const STATUS_COLORS = {
//   active: 'bg-blue-100 text-blue-800',
//   selected: 'bg-blue-100 text-blue-800',
//   in_progress: 'bg-yellow-100 text-yellow-800',
//   completed: 'bg-green-100 text-green-800',
//   outdated: 'bg-gray-100 text-gray-800',
// };

// const PathwayDetailView = () => {
//   const navigate = useNavigate();
//   const { id: pathwayId } = useParams();
//   const { token } = useSelector((state) => state.auth);

//   const [pathway, setPathway] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     if (pathwayId) {
//       loadPathway();
//     }
//   }, [pathwayId]);

//   const loadPathway = async () => {
//     try {
//       setLoading(true);
//       const res = await fetch(`${BASE_URL}/pathways/v4/${pathwayId}`, {
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (!res.ok) throw new Error('Failed to load pathway');
//       const data = await res.json();

//       if (data.success) {
//         setPathway(data.data);
//       } else {
//         setError(data.message || 'Pathway not found.');
//       }
//     } catch (err) {
//       console.error('Error loading pathway:', err);
//       setError('Failed to load pathway details.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStartLearning = () => {
//     const nextStep = pathway.steps.find((step) => step.status === 'pending');
//     if (nextStep) {
//       // For now, just navigate to resource detail
//       if (nextStep.resource_id) {
//         navigate(`/pathways/resource/${nextStep.resource_id}`);
//       } else {
//         alert('Resource details not available.');
//       }
//     }
//   };

//   const handleViewResource = (step) => {
//     if (step.resource_id) {
//       navigate(`/pathways/resource/${step.resource_id}`);
//     } else {
//       alert('Resource not available.');
//     }
//   };

//   if (loading) {
//     return (
//       <MainLayout>
//         <div className="max-w-5xl p-4 mx-auto md:p-6">
//           <div className="space-y-6 animate-pulse">
//             <div className="w-1/3 h-8 bg-gray-200 rounded"></div>
//             <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
//             <div className="p-6 bg-white border border-gray-200 rounded-xl">
//               <div className="flex space-x-4">
//                 <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
//                 <div className="flex-1">
//                   <div className="w-1/2 h-6 mb-2 bg-gray-200 rounded"></div>
//                   <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
//                 </div>
//               </div>
//             </div>
//             {[1, 2, 3].map((i) => (
//               <div key={i} className="p-5 bg-white border border-gray-200 rounded-xl">
//                 <div className="flex items-center space-x-4">
//                   <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
//                   <div className="flex-1">
//                     <div className="w-3/4 h-4 mb-2 bg-gray-200 rounded"></div>
//                     <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </MainLayout>
//     );
//   }

//   if (error || !pathway) {
//     return (
//       <MainLayout>
//         <div className="max-w-2xl p-6 mx-auto text-center">
//           <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
//             <FiCheckCircle className="w-8 h-8 text-red-600" />
//           </div>
//           <h2 className="mb-2 text-xl font-bold text-gray-900">Oops!</h2>
//           <p className="mb-4 text-gray-600">{error || 'Pathway not found.'}</p>
//           <button
//             onClick={() => navigate('/student-dashboard')}
//             className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
//           >
//             ← Go Back
//           </button>
//         </div>
//       </MainLayout>
//     );
//   }

//   // Determine target display
//   const targetDisplay =
//     pathway.target_type === 'job_specific'
//       ? pathway.targetJob?.job_role_id
//         ? `Job #${pathway.target_job_id}`
//         : 'Specific Job'
//       : pathway.target_role_name || 'Target Role';

//   const completedSteps = pathway.steps.filter((s) => s.status === 'completed').length;
//   const progress = pathway.steps.length > 0 ? (completedSteps / pathway.steps.length) * 100 : 0;

//   return (
//     <MainLayout>
//       <div className="max-w-5xl p-4 mx-auto md:p-6">
//         <button
//           onClick={() => navigate('/student-dashboard')}
//           className="flex items-center mb-6 text-gray-700 hover:text-gray-900"
//         >
//           <FiArrowLeft className="mr-2" /> Back to Dashboard
//         </button>

//         {/* Header */}
//         <div className="p-6 mb-6 bg-white border border-gray-200 shadow-sm rounded-xl">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">
//                 Prepare for: <span className="text-indigo-600">{targetDisplay}</span>
//               </h1>
//               <div className="grid grid-cols-2 gap-4 mt-3 text-sm sm:grid-cols-4">
//                 <div>
//                   <span className="text-gray-500">Coverage</span>
//                   <p className="font-medium text-gray-900">{pathway.overall_skill_coverage_percent}%</p>
//                 </div>
//                 <div>
//                   <span className="text-gray-500">Duration</span>
//                   <p className="font-medium text-gray-900">{pathway.total_duration_months} months</p>
//                 </div>
//                 <div>
//                   <span className="text-gray-500">Skills</span>
//                   <p className="font-medium text-gray-900">
//                     {Object.keys(pathway.total_experience_gained || {}).length}
//                   </p>
//                 </div>
//                 <div>
//                   <span className="text-gray-500">Rank</span>
//                   <p className="font-medium text-gray-900">#{pathway.pathway_rank}</p>
//                 </div>
//               </div>
//             </div>
//             <div className="mt-4 md:mt-0">
//               <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[pathway.status]}`}>
//                 {pathway.status.replace('_', ' ').toUpperCase()}
//               </span>
//             </div>
//           </div>

//           {/* Progress Bar */}
//           <div className="mt-4">
//             <div className="flex justify-between mb-1 text-sm text-gray-600">
//               <span>Progress</span>
//               <span>
//                 {Math.round(progress)}% • {completedSteps} of {pathway.steps.length} steps
//               </span>
//             </div>
//             <div className="w-full bg-gray-200 rounded-full h-2.5">
//               <div
//                 className={`h-2.5 rounded-full ${
//                   pathway.status === 'completed' ? 'bg-green-500' : 'bg-indigo-500'
//                 }`}
//                 style={{ width: `${progress}%` }}
//               ></div>
//             </div>
//           </div>

//           {/* CTA */}
//           {pathway.status !== 'completed' && (
//             <div className="mt-6 flex flex-wrap gap-3">
//               <button
//                 onClick={handleStartLearning}
//                 className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
//               >
//                 <FiPlay className="mr-2" />
//                 {completedSteps === 0 ? 'Start Pathway' : 'Resume Learning'}
//               </button>
//               <button
//                 type="button"
//                 onClick={() => navigate(`/ai-prediction/manage-pathway/${pathwayId}`)}
//                 className="flex items-center px-4 py-2 text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100"
//               >
//                 Manage pathway
//               </button>
//             </div>
//           )}
//           {pathway.status === 'completed' && (
//             <div className="mt-6">
//               <button
//                 type="button"
//                 onClick={() => navigate(`/ai-prediction/manage-pathway/${pathwayId}`)}
//                 className="flex items-center px-4 py-2 text-indigo-700 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50"
//               >
//                 View pathway progress &amp; proofs
//               </button>
//             </div>
//           )}
//         </div>

//         {/* Steps */}
//         <div className="space-y-5">
//           <h2 className="text-xl font-semibold text-gray-900">Learning Steps</h2>
//           {pathway.steps.map((step, index) => {
//             const Icon = RESOURCE_ICONS[step.resource_type] || FiBookOpen;
//             const colorClass = RESOURCE_COLORS[step.resource_type] || 'text-gray-600';

//             return (
//               <div
//                 key={step.step_id}
//                 className={`bg-white rounded-xl border p-5 ${
//                   step.status === 'completed'
//                     ? 'border-green-200 bg-green-50'
//                     : step.status === 'in_progress'
//                     ? 'border-yellow-200 bg-yellow-50'
//                     : 'border-gray-200'
//                 }`}
//               >
//                 <div className="flex">
//                   {/* Step Number */}
//                   <div className="flex-shrink-0 mr-4">
//                     <div
//                       className={`w-8 h-8 rounded-full flex items-center justify-center ${
//                         step.status === 'completed'
//                           ? 'bg-green-500 text-white'
//                           : step.status === 'in_progress'
//                           ? 'bg-yellow-500 text-white'
//                           : 'bg-gray-200 text-gray-700'
//                       }`}
//                     >
//                       {step.status === 'completed' ? <FiCheckCircle className="w-4 h-4" /> : index + 1}
//                     </div>
//                   </div>

//                   {/* Content */}
//                   <div className="flex-1">
//                     <div className="flex flex-col md:flex-row md:items-start md:justify-between">
//                       <div>
//                         <div className="flex items-center mb-1 space-x-2">
//                           <Icon className={`w-5 h-5 ${colorClass}`} />
//                           <h3 className="font-semibold text-gray-900">{step.resource_title}</h3>
//                         </div>
//                         <p className="mb-2 text-sm text-gray-600">
//                           Duration: {step.duration_months} months
//                         </p>
//                         <div className="flex flex-wrap gap-1">
//                           <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
//                             {step.resource_type.charAt(0).toUpperCase() + step.resource_type.slice(1)}
//                           </span>
//                         </div>
//                       </div>

//                       <div className="flex mt-2 space-x-2 md:mt-0">
//                         <button
//                           onClick={() => handleViewResource(step)}
//                           className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
//                         >
//                           View Resource
//                         </button>
//                       </div>
//                     </div>

//                     {/* Skills */}
//                     <div className="mt-3">
//                       <div className="flex items-center mb-1">
//                         <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
//                           Skills Covered
//                         </p>
//                         {step.step_reasoning && (
//                           <div className="relative group ml-2">
//                             <FiInfo className="w-3 h-3 text-gray-400 cursor-help" />
//                             <div className="absolute z-10 hidden p-2 text-xs text-white bg-gray-800 rounded-md -top-8 left-0 group-hover:block w-64">
//                               {step.step_reasoning}
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                       <div className="flex flex-wrap gap-1 mt-1">
//                         {(Array.isArray(step.skills_gained) ? step.skills_gained : []).map((skill, i) => (
//                           <span
//                             key={i}
//                             className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded"
//                           >
//                             {skill.skill_name} (+{skill.experience_months}mo)
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* Completion Message */}
//         {pathway.status === 'completed' && (
//           <div className="p-6 mt-8 text-center border border-green-200 bg-green-50 rounded-xl">
//             <div className="flex items-center justify-center w-16 h-16 mx-auto mb-3 bg-green-100 rounded-full">
//               <FiCheckCircle className="w-8 h-8 text-green-600" />
//             </div>
//             <h3 className="mb-2 text-xl font-bold text-green-800">Pathway Completed! 🎉</h3>
//             <p className="text-green-700">
//               You’ve covered all required skills. Ready for your next challenge?
//             </p>
//             <div className="mt-4">
//               <button
//                 onClick={() => navigate('/mypathway')}
//                 className="px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
//               >
//                 Build Another Pathway
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
//     </MainLayout>
//   );
// };

// export default PathwayDetailView;














// src/pages/PathwayDetailView.jsx
import React, { useState, useEffect } from 'react';
import {
  FiArrowLeft,
  FiCheckCircle,
  FiClock,
  FiPlay,
  FiBookOpen,
  FiBriefcase,
  FiFolder,
  FiInfo,
} from 'react-icons/fi';
import MainLayout from '../components/layout/MainLayout';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import GreenPrimaryButton from '../components/jobs/GreenPrimaryButton';
const BASE_URL=import.meta.env.VITE_BASE_URL;

const RESOURCE_ICONS = {
  course: FiBookOpen,
  internship: FiBriefcase,
  project: FiFolder,
  job: FiBriefcase,
};

const RESOURCE_COLORS = {
  course: 'text-gray-700',
  internship: 'text-gray-700',
  project: 'text-gray-700',
  job: 'text-gray-700',
};

const STATUS_COLORS = {
  active: 'bg-gray-100 text-[#1e1e2d]',
  selected: 'bg-gray-100 text-[#1e1e2d]',
  in_progress: 'bg-[#9bc87c]/20 text-[#1e1e2d]',
  completed: 'bg-[#1DB32F]/10 text-[#1DB32F]',
  outdated: 'bg-gray-100 text-gray-500',
};

const PathwayDetailView = () => {
  const navigate = useNavigate();
  const { id: pathwayId } = useParams();
  const { token } = useSelector((state) => state.auth);

  const [pathway, setPathway] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (pathwayId) {
      loadPathway();
    }
  }, [pathwayId]);

  const loadPathway = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/pathways/v4/${pathwayId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Failed to load pathway');
      const data = await res.json();

      if (data.success) {
        setPathway(data.data);
      } else {
        setError(data.message || 'Pathway not found.');
      }
    } catch (err) {
      console.error('Error loading pathway:', err);
      setError('Failed to load pathway details.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartLearning = () => {
    const nextStep = pathway.steps.find((step) => step.status === 'pending');
    if (nextStep) {
      // For now, just navigate to resource detail
      if (nextStep.resource_id) {
        navigate(`/pathways/resource/${nextStep.resource_id}`);
      } else {
        alert('Resource details not available.');
      }
    }
  };

  const handleViewResource = (step) => {
    if (step.resource_id) {
      navigate(`/pathways/resource/${step.resource_id}`);
    } else {
      alert('Resource not available.');
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-5xl p-4 mx-auto md:p-6">
          <div className="space-y-6 animate-pulse">
            <div className="w-1/3 h-8 bg-gray-200 rounded"></div>
            <div className="w-1/4 h-4 bg-gray-200 rounded"></div>
            <div className="p-6 bg-white border border-gray-100 rounded-xl">
              <div className="flex space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="w-1/2 h-6 mb-2 bg-gray-200 rounded"></div>
                  <div className="w-1/3 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-5 bg-white border border-gray-100 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="w-3/4 h-4 mb-2 bg-gray-200 rounded"></div>
                    <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !pathway) {
    return (
      <MainLayout>
        <div className="max-w-2xl p-6 mx-auto text-center">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full">
            <FiCheckCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-[#1e1e2d]">Oops!</h2>
          <p className="mb-4 text-gray-600">{error || 'Pathway not found.'}</p>
          <button
            onClick={() => navigate('/student-dashboard')}
            className="px-4 py-2 text-sm font-medium text-white bg-[#1e1e2d] rounded-lg hover:bg-[#2a2a3b]"
          >
            ← Go Back
          </button>
        </div>
      </MainLayout>
    );
  }

  // Determine target display
  const targetDisplay =
    pathway.target_type === 'job_specific'
      ? pathway.targetJob?.job_role_id
        ? `Job #${pathway.target_job_id}`
        : 'Specific Job'
      : pathway.target_role_name || 'Target Role';

  const completedSteps = pathway.steps.filter((s) => s.status === 'completed').length;
  const progress = pathway.steps.length > 0 ? (completedSteps / pathway.steps.length) * 100 : 0;

  return (
    <MainLayout>
      <div className="max-w-5xl p-4 mx-auto md:p-6">
        <button
          onClick={() => navigate('/student-dashboard')}
          className="flex items-center mb-6 text-gray-500 hover:text-[#1e1e2d] transition-colors"
        >
          <FiArrowLeft className="mr-2" /> Back to Dashboard
        </button>

        {/* Header */}
        <div className="p-6 mb-6 bg-white border border-gray-100 shadow-sm rounded-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1e1e2d]">
                Prepare for: <span className="text-[#9bc87c]">{targetDisplay}</span>
              </h1>
              <div className="grid grid-cols-2 gap-4 mt-3 text-sm sm:grid-cols-4">
                <div>
                  <span className="text-gray-500">Coverage</span>
                  <p className="font-medium text-[#1e1e2d]">{pathway.overall_skill_coverage_percent}%</p>
                </div>
                <div>
                  <span className="text-gray-500">Duration</span>
                  <p className="font-medium text-[#1e1e2d]">{pathway.total_duration_months} months</p>
                </div>
                <div>
                  <span className="text-gray-500">Skills</span>
                  <p className="font-medium text-[#1e1e2d]">
                    {Object.keys(pathway.total_experience_gained || {}).length}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Rank</span>
                  <p className="font-medium text-[#1e1e2d]">#{pathway.pathway_rank}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              <span className={`px-3 py-1 rounded-full text-sm font-bold ${STATUS_COLORS[pathway.status]}`}>
                {pathway.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between mb-1 text-sm text-gray-500">
              <span>Progress</span>
              <span className="font-medium text-[#1e1e2d]">
                {Math.round(progress)}% • {completedSteps} of {pathway.steps.length} steps
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${
                  pathway.status === 'completed' ? 'bg-[#1DB32F]' : 'bg-[#9bc87c]'
                }`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* CTA */}
          {pathway.status !== 'completed' && (
            <div className="mt-6 flex flex-wrap gap-3">
              {/* <button
                onClick={handleStartLearning}
                className="flex items-center px-4 py-2 text-white bg-[#1e1e2d] rounded-lg hover:bg-[#2a2a3b] transition-colors"
              >
                <FiPlay className="mr-2" />
                {completedSteps === 0 ? 'Start Pathway' : 'Resume Learning'}
              </button> */}

              <GreenPrimaryButton
                onClick={handleStartLearning}
                className="flex items-center"
              >
                <FiPlay className="mr-2" />
                {completedSteps === 0 ? 'Start Pathway' : 'Resume Learning'}
              </GreenPrimaryButton>
              {/* <button
                type="button"
                onClick={() => navigate(`/ai-prediction/manage-pathway/${pathwayId}`)}
                className="flex items-center px-4 py-2 text-[#1e1e2d] bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Manage pathway
              </button> */}

              <GreenPrimaryButton
                onClick={() => navigate(`/ai-prediction/manage-pathway/${pathwayId}`)}
                className="flex items-center"
              >
                Manage pathway
              </GreenPrimaryButton>
            </div>
          )}
          {pathway.status === 'completed' && (
            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigate(`/ai-prediction/manage-pathway/${pathwayId}`)}
                className="flex items-center px-4 py-2 text-[#1e1e2d] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View pathway progress &amp; proofs
              </button>
            </div>
          )}
        </div>

        {/* Steps */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-[#1e1e2d]">Learning Steps</h2>
          {pathway.steps.map((step, index) => {
            const Icon = RESOURCE_ICONS[step.resource_type] || FiBookOpen;
            const colorClass = RESOURCE_COLORS[step.resource_type] || 'text-gray-500';

            return (
              <div
                key={step.step_id}
                className={`bg-white rounded-xl border shadow-sm p-5 ${
                  step.status === 'completed'
                    ? 'border-[#1DB32F]/30 bg-[#1DB32F]/5'
                    : step.status === 'in_progress'
                    ? 'border-[#9bc87c]/50 bg-[#9bc87c]/5'
                    : 'border-gray-100'
                }`}
              >
                <div className="flex">
                  {/* Step Number */}
                  <div className="flex-shrink-0 mr-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        step.status === 'completed'
                          ? 'bg-[#1DB32F] text-white'
                          : step.status === 'in_progress'
                          ? 'bg-[#9bc87c] text-[#1e1e2d]'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {step.status === 'completed' ? <FiCheckCircle className="w-4 h-4" /> : index + 1}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex items-center mb-1 space-x-2">
                          <Icon className={`w-5 h-5 ${colorClass}`} />
                          <h3 className="font-bold text-[#1e1e2d]">{step.resource_title}</h3>
                        </div>
                        <p className="mb-2 text-sm text-gray-500 font-medium">
                          Duration: {step.duration_months} months
                        </p>
                        <div className="flex flex-wrap gap-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200">
                            {step.resource_type}
                          </span>
                        </div>
                      </div>

                      <div className="flex mt-3 space-x-2 md:mt-0">
                        <button
                          onClick={() => handleViewResource(step)}
                          className="px-4 py-1.5 text-sm font-semibold text-[#1e1e2d] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          View Resource
                        </button>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mt-4 pt-4 border-t border-gray-100/50">
                      <div className="flex items-center mb-2">
                        <p className="text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                          Skills Covered
                        </p>
                        {step.step_reasoning && (
                          <div className="relative group ml-2">
                            <FiInfo className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                            <div className="absolute z-10 hidden p-3 text-xs text-white bg-[#1e1e2d] rounded-lg -top-10 left-0 group-hover:block w-64 shadow-lg leading-relaxed">
                              {step.step_reasoning}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(Array.isArray(step.skills_gained) ? step.skills_gained : []).map((skill, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center px-2 py-1 text-xs font-semibold text-[#1e1e2d] bg-gray-100 border border-gray-200 rounded"
                          >
                            {skill.skill_name} <span className="text-gray-500 ml-1">(+{skill.experience_months}mo)</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Completion Message */}
        {pathway.status === 'completed' && (
          <div className="p-8 mt-8 text-center border border-[#1DB32F]/20 bg-[#1DB32F]/5 rounded-xl shadow-sm">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-[#1DB32F]/10 rounded-full">
              <FiCheckCircle className="w-8 h-8 text-[#1DB32F]" />
            </div>
            <h3 className="mb-2 text-xl font-extrabold text-[#1e1e2d]">Pathway Completed! 🎉</h3>
            <p className="text-gray-600 font-medium">
              You’ve covered all required skills. Ready for your next challenge?
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/mypathway')}
                className="px-6 py-2.5 font-bold text-white bg-[#9bc87c] rounded-lg hover:bg-[#8ab76b] transition-colors"
              >
                Build Another Pathway
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PathwayDetailView;