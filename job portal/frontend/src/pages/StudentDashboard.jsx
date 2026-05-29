// // // // src/pages/StudentDashboard.js
// // // import React, { useState, useEffect } from 'react';
// // // import { FiEye, FiPlay, FiTrash2, FiRefreshCw, FiCheckCircle, FiClock, FiTarget, FiBriefcase, FiLayers } from 'react-icons/fi';
// // // import MainLayout from '../components/layout/MainLayout';
// // // import Button from '../components/ui/Button';
// // // import { pathwaysApi } from '../api/pathwaysApi';
// // // import {useNavigate} from "react-router-dom";

// // // const STRATEGY_ICONS = {
// // //     job_specific: FiTarget,
// // //     company_target: FiBriefcase,
// // //     direct_upskilling: FiLayers,
// // // };

// // // const STRATEGY_LABELS = {
// // //     job_specific: 'Job Target',
// // //     company_target: 'Company Target',
// // //     direct_upskilling: 'Upskilling',
// // // };

// // // const STATUS_COLORS = {
// // //     suggested: 'bg-gray-100 text-gray-700',
// // //     selected: 'bg-blue-100 text-blue-700',
// // //     in_progress: 'bg-yellow-100 text-yellow-800',
// // //     completed: 'bg-green-100 text-green-800',
// // //     abandoned: 'bg-gray-200 text-gray-600',
// // // };

// // // const STATUS_LABELS = {
// // //     suggested: 'Suggested',
// // //     selected: 'Selected',
// // //     in_progress: 'In Progress',
// // //     completed: 'Completed',
// // //     abandoned: 'Abandoned',
// // // };

// // // const StudentDashboard = () => {

// // //     const navigate=useNavigate();
// // //     const [pathways, setPathways] = useState([]);
// // //     const [loading, setLoading] = useState(true);
// // //     const [error, setError] = useState(null);

// // //     useEffect(() => {
// // //         loadPathways();
// // //     }, []);

// // //     const loadPathways = async () => {
// // //         try {
// // //             setLoading(true);
// // //             const res = await pathwaysApi.getPathways(); // GET /api/pathways
// // //             setPathways(res.pathways);
// // //             setError(null);
// // //         } catch (err) {
// // //             console.error('Failed to load pathways:', err);
// // //             setError('Failed to load your pathways. Please refresh.');
// // //         } finally {
// // //             setLoading(false);
// // //         }
// // //     };

// // //     const handleDelete = async (pathwayId) => {
// // //         if (!window.confirm('Are you sure you want to delete this pathway?')) return;
// // //         try {
// // //             await pathwaysApi.deletePathways(null, { pathwayId }); // Need to adjust API: add DELETE /api/pathways/:id
// // //             // For now, simulate:
// // //             setPathways(prev => prev.filter(p => p.pathway_id !== pathwayId));
// // //         } catch (err) {
// // //             alert('Failed to delete pathway.');
// // //         }
// // //     };

// // //     const handleResume = async (pathwayId) => {
// // //         try {
// // //             await pathwaysApi.updatePathwayStatus(pathwayId, 'in_progress');
// // //             // Redirect to detailed view
// // //             navigate(`/pathways/${pathwayId}`);
// // //         } catch (err) {
// // //             alert('Failed to resume pathway.');
// // //         }
// // //     };

// // //     if (loading) {
// // //         return (
// // //             <MainLayout>
// // //                 <div className="max-w-4xl p-4 mx-auto">
// // //                     <div className="space-y-4 animate-pulse">
// // //                         {[1, 2, 3].map(i => (
// // //                             <div key={i} className="p-6 bg-white shadow-sm rounded-xl">
// // //                                 <div className="w-1/4 h-6 mb-4 bg-gray-200 rounded"></div>
// // //                                 <div className="w-3/4 h-4 mb-2 bg-gray-200 rounded"></div>
// // //                                 <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
// // //                             </div>
// // //                         ))}
// // //                     </div>
// // //                 </div>
// // //             </MainLayout>
// // //         );
// // //     }

// // //     return (
// // //         <MainLayout>
// // //             <div className="max-w-5xl p-4 mx-auto md:p-6">
// // //                 <div className="mb-8">
// // //                     <div className="flex flex-col md:flex-row md:items-center md:justify-between">
// // //                         <div>
// // //                             <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">My Learning Pathways</h1>
// // //                             <p className="mt-1 text-gray-600">
// // //                                 {pathways.length > 0
// // //                                     ? `You have ${pathways.length} pathway${pathways.length !== 1 ? 's' : ''}.`
// // //                                     : 'No pathways yet. Get started by building your first one!'
// // //                                 }
// // //                             </p>
// // //                         </div>
// // //                         <Button
// // //                             variant="primary"
// // //                             onClick={() => navigate('/mypathway')}
// // //                             className="flex items-center mt-4 md:mt-0"
// // //                         >
// // //                             <FiRefreshCw className="mr-2" /> Build New Pathway
// // //                         </Button>
// // //                     </div>
// // //                 </div>

// // //                 {error && (
// // //                     <div className="p-4 mb-6 text-red-700 rounded-lg bg-red-50">
// // //                         {error}
// // //                     </div>
// // //                 )}

// // //                 {pathways.length === 0 ? (
// // //                     <div className="p-12 text-center bg-white border-2 border-gray-300 border-dashed rounded-xl">
// // //                         <FiTarget className="w-12 h-12 mx-auto mb-4 text-gray-400" />
// // //                         <h3 className="mb-2 text-lg font-medium text-gray-900">No pathways yet</h3>
// // //                         <p className="mb-6 text-gray-600">Build your first personalized learning roadmap in under a minute.</p>
// // //                         <Button
// // //                             variant="primary"
// // //                             size="large"
// // //                             onClick={() => navigate('/mypathway')}
// // //                         >
// // //                             Create Your First Pathway
// // //                         </Button>
// // //                     </div>
// // //                 ) : (
// // //                     <div className="space-y-5">
// // //                         {pathways.map((pathway) => {
// // //                             const progress = pathway.skills_covered > 0
// // //                                 ? ((pathway.completed_steps || 0) / pathway.steps_count) * 100
// // //                                 : 0;

// // //                             return (
// // //                                 <div
// // //                                     key={pathway.pathway_id}
// // //                                     className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl"
// // //                                 >
// // //                                     <div className="px-6 py-5">
// // //                                         <div className="flex flex-col md:flex-row md:items-center md:justify-between">
// // //                                             {/* Left: Info */}
// // //                                             <div className="flex-1 min-w-0">
// // //                                                 <div className="flex items-center mb-2 space-x-3">
// // //                                                     <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[pathway.status]}`}>
// // //                                                         {STATUS_LABELS[pathway.status]}
// // //                                                     </span>
// // //                                                     <span className="text-sm text-gray-500">
// // //                                                         Created {new Date(pathway.created_at).toLocaleDateString()}
// // //                                                     </span>
// // //                                                 </div>

// // //                                                 <h2 className="text-xl font-semibold text-gray-900 truncate">
// // //                                                     Pathway {pathway.rank}
// // //                                                     {pathway.strategy_type && (
// // //                                                         <span className="ml-2 text-sm font-normal text-gray-500">
// // //                                                             ({STRATEGY_LABELS[pathway.strategy_type]})
// // //                                                         </span>
// // //                                                     )}
// // //                                                 </h2>

// // //                                                 <div className="grid grid-cols-2 gap-4 mt-3 text-sm md:grid-cols-4">
// // //                                                     <div>
// // //                                                         <span className="text-gray-500">Duration</span>
// // //                                                         <p className="font-medium">{pathway.total_duration_weeks} weeks</p>
// // //                                                     </div>
// // //                                                     <div>
// // //                                                         <span className="text-gray-500">Skills</span>
// // //                                                         <p className="font-medium">
// // //                                                             {pathway.skills_covered} / {pathway.skills_covered}
// // //                                                             <span className="ml-1 text-green-600">✓</span>
// // //                                                         </p>
// // //                                                     </div>
// // //                                                     <div>
// // //                                                         <span className="text-gray-500">Coverage</span>
// // //                                                         <p className="font-medium">{pathway.coverage_percent}%</p>
// // //                                                     </div>
// // //                                                     <div>
// // //                                                         <span className="text-gray-500">Resources</span>
// // //                                                         <p className="font-medium">
// // //                                                             {pathway.composition.courses}C + {pathway.composition.projects}P + {pathway.composition.internships}I + {pathway.composition.jobs}J
// // //                                                         </p>
// // //                                                     </div>
// // //                                                 </div>
// // //                                             </div>

// // //                                             {/* Right: Actions */}
// // //                                             <div className="flex mt-4 space-x-3 md:mt-0">
// // //                                                 <Button
// // //                                                     variant="outline"
// // //                                                     size="small"
// // //                                                     onClick={() =>  navigate(`/pathways/${pathway.pathway_id}`) }
// // //                                                     className="flex items-center"
// // //                                                 >
// // //                                                     <FiEye className="mr-1" /> View
// // //                                                 </Button>

// // //                                                 {pathway.status === 'selected' && (
// // //                                                     <Button
// // //                                                         variant="primary"
// // //                                                         size="small"
// // //                                                         onClick={() => handleResume(pathway.pathway_id)}
// // //                                                         className="flex items-center"
// // //                                                     >
// // //                                                         <FiPlay className="mr-1" /> Start
// // //                                                     </Button>
// // //                                                 )}

// // //                                                 {['in_progress', 'selected'].includes(pathway.status) && (
// // //                                                     <Button
// // //                                                         variant="outline"
// // //                                                         size="small"
// // //                                                         onClick={() => handleResume(pathway.pathway_id)}
// // //                                                         className="flex items-center"
// // //                                                     >
// // //                                                         <FiPlay className="mr-1" /> Resume
// // //                                                     </Button>
// // //                                                 )}

// // //                                                 {pathway.status !== 'completed' && (
// // //                                                     <Button
// // //                                                         variant="danger"
// // //                                                         size="small"
// // //                                                         onClick={() => handleDelete(pathway.pathway_id)}
// // //                                                         className="flex items-center"
// // //                                                     >
// // //                                                         <FiTrash2 className="mr-1" /> Delete
// // //                                                     </Button>
// // //                                                 )}
// // //                                             </div>
// // //                                         </div>

// // //                                         {/* Progress bar (for in-progress) */}
// // //                                         {pathway.status === 'in_progress' && (
// // //                                             <div className="mt-4">
// // //                                                 <div className="flex justify-between mb-1 text-xs text-gray-600">
// // //                                                     <span>Progress</span>
// // //                                                     <span>{Math.round(progress)}%</span>
// // //                                                 </div>
// // //                                                 <div className="w-full h-2 bg-gray-200 rounded-full">
// // //                                                     <div
// // //                                                         className="h-2 bg-blue-500 rounded-full"
// // //                                                         style={{ width: `${progress}%` }}
// // //                                                     ></div>
// // //                                                 </div>
// // //                                             </div>
// // //                                         )}
// // //                                     </div>
// // //                                 </div>
// // //                             );
// // //                         })}
// // //                     </div>
// // //                 )}

// // //                 {/* Stats Summary */}
// // //                 {pathways.length > 0 && (
// // //                     <div className="grid grid-cols-1 gap-4 mt-10 md:grid-cols-3">
// // //                         <div className="p-4 bg-white border rounded-lg">
// // //                             <div className="flex items-center">
// // //                                 <div className="p-2 bg-blue-100 rounded-lg">
// // //                                     <FiCheckCircle className="w-5 h-5 text-blue-600" />
// // //                                 </div>
// // //                                 <div className="ml-3">
// // //                                     <p className="text-sm text-gray-500">Total Skills Covered</p>
// // //                                     <p className="text-xl font-bold">
// // //                                         {pathways.reduce((sum, p) => sum + p.skills_covered, 0)}
// // //                                     </p>
// // //                                 </div>
// // //                             </div>
// // //                         </div>

// // //                         <div className="p-4 bg-white border rounded-lg">
// // //                             <div className="flex items-center">
// // //                                 <div className="p-2 bg-green-100 rounded-lg">
// // //                                     <FiClock className="w-5 h-5 text-green-600" />
// // //                                 </div>
// // //                                 <div className="ml-3">
// // //                                     <p className="text-sm text-gray-500">Avg. Duration</p>
// // //                                     <p className="text-xl font-bold">
// // //                                         {(pathways.reduce((sum, p) => sum + p.total_duration_weeks, 0) / pathways.length).toFixed(1)} weeks
// // //                                     </p>
// // //                                 </div>
// // //                             </div>
// // //                         </div>

// // //                         <div className="p-4 bg-white border rounded-lg">
// // //                             <div className="flex items-center">
// // //                                 <div className="p-2 bg-purple-100 rounded-lg">
// // //                                     <FiTarget className="w-5 h-5 text-purple-600" />
// // //                                 </div>
// // //                                 <div className="ml-3">
// // //                                     <p className="text-sm text-gray-500">Active Pathways</p>
// // //                                     <p className="text-xl font-bold">
// // //                                         {pathways.filter(p => ['selected', 'in_progress'].includes(p.status)).length}
// // //                                     </p>
// // //                                 </div>
// // //                             </div>
// // //                         </div>
// // //                     </div>
// // //                 )}
// // //             </div>
// // //         </MainLayout>
// // //     );
// // // };

// // // export default StudentDashboard;































































// // // src/pages/StudentDashboard.jsx
// // import React, { useState, useEffect } from 'react';
// // import { FiEye, FiPlay, FiTrash2, FiRefreshCw, FiCheckCircle, FiClock, FiTarget, FiBriefcase } from 'react-icons/fi';
// // import MainLayout from '../components/layout/MainLayout';
// // import { useNavigate } from 'react-router-dom';
// // import { useSelector } from 'react-redux';

// // import { pathwaysApi } from '../api/pathwaysApi';


// // const BASE_URL= import.meta.env.VITE_BASE_URL;
// // const StudentDashboard = () => {
// //   const navigate = useNavigate();
// //   const [pathways, setPathways] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState(null);

// //   // Get auth token from Redux store
// //   const { token, user } = useSelector((state) => state.auth);

// //   useEffect(() => {
// //     loadPathways();
// //   }, []);

// // //   const loadPathways = async () => {
// // //     try {
// // //       setLoading(true);
// // //       const res = await fetch(`${BASE_URL}/pathways/v4`, {
// // //         method: 'GET',
// // //         headers: {
// // //           'Content-Type': 'application/json',
// // //           Authorization: `Bearer ${token}`,
// // //         },
// // //       });

// // //       if (!res.ok) throw new Error('Failed to fetch pathways');
// // //       const data = await res.json();

// // //       if (data.success) {
// // //         setPathways(data.data.pathways || []);
// // //       } else {
// // //         setError(data.message || 'Failed to load pathways');
// // //       }
// // //     } catch (err) {
// // //       console.error('Error loading pathways:', err);
// // //       setError('Failed to load your pathways. Please refresh.');
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const handleDelete = async (pathwayId) => {
// // //     if (!window.confirm('Are you sure you want to delete this pathway?')) return;
// // //     try {
// // //       const res = await fetch(`/api/pathways/${pathwayId}`, {
// // //         method: 'DELETE',
// // //         headers: {
// // //           'Content-Type': 'application/json',
// // //           Authorization: `Bearer ${token}`,
// // //         },
// // //       });
// // //       if (res.ok) {
// // //         setPathways(prev => prev.filter(p => p.pathway_id !== pathwayId));
// // //       } else {
// // //         alert('Failed to delete pathway.');
// // //       }
// // //     } catch (err) {
// // //       alert('Failed to delete pathway.');
// // //     }
// // //   };












// // // Inside loadPathways()
// // const loadPathways = async () => {
// //   try {
// //     setLoading(true);
// //     const data = await pathwaysApi.getUserPathways(user.id, token);
// //     setPathways(data.data.pathways || []);
// //   } catch (err) {
// //     setError(err.message);
// //   } finally {
// //     setLoading(false);
// //   }
// // };

// // // Inside handleDelete()
// // const handleDelete = async (pathwayId) => {
// //   if (!window.confirm('Delete this pathway?')) return;
// //   try {
// //     await pathwaysApi.deletePathway(pathwayId, token);
// //     setPathways(prev => prev.filter(p => p.pathway_id !== pathwayId));
// //   } catch (err) {
// //     alert(err.message);
// //   }
// // };

// //   const handleView = (pathwayId) => {
// //     navigate(`/pathways/${pathwayId}`);
// //   };

// //   const handleStart = (pathwayId) => {
// //     // Update status to 'in_progress' (optional)
// //     // For now, just redirect
// //     navigate(`/pathways/${pathwayId}`);
// //   };

// //   if (loading) {
// //     return (
// //       <MainLayout>
// //         <div className="max-w-5xl p-4 mx-auto md:p-6">
// //           <div className="space-y-4 animate-pulse">
// //             {[1, 2, 3].map(i => (
// //               <div key={i} className="p-6 bg-white shadow-sm rounded-xl border border-gray-200">
// //                 <div className="flex justify-between">
// //                   <div>
// //                     <div className="w-1/3 h-5 mb-3 bg-gray-200 rounded"></div>
// //                     <div className="w-2/3 h-4 mb-2 bg-gray-200 rounded"></div>
// //                   </div>
// //                   <div className="w-24 h-8 bg-gray-200 rounded"></div>
// //                 </div>
// //                 <div className="flex space-x-4 mt-4">
// //                   <div className="w-16 h-6 bg-gray-200 rounded"></div>
// //                   <div className="w-16 h-6 bg-gray-200 rounded"></div>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </MainLayout>
// //     );
// //   }

// //   return (
// //     <MainLayout>
// //       <div className="max-w-5xl p-4 mx-auto md:p-6">
// //         {/* Header */}
// //         <div className="mb-8">
// //           <div className="flex flex-col md:flex-row md:items-center md:justify-between">
// //             <div>
// //               <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">My Learning Pathways</h1>
// //               <p className="mt-1 text-gray-600">
// //                 {pathways.length > 0
// //                   ? `You have ${pathways.length} personalized pathway${pathways.length !== 1 ? 's' : ''}.`
// //                   : 'No pathways yet. Build your first one to get started!'
// //                 }
// //               </p>
// //             </div>
// //             <button
// //               onClick={() => navigate('/mypathway')}
// //               className="flex items-center px-4 py-2 mt-4 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 md:mt-0"
// //             >
// //               <FiRefreshCw className="mr-2" /> Build New Pathway
// //             </button>
// //           </div>
// //         </div>

// //         {/* Error Message */}
// //         {error && (
// //           <div className="p-4 mb-6 text-red-700 bg-red-50 border border-red-200 rounded-lg">
// //             {error}
// //           </div>
// //         )}

// //         {/* Empty State */}
// //         {pathways.length === 0 && !loading && !error && (
// //           <div className="p-12 text-center bg-white border-2 border-gray-300 border-dashed rounded-xl">
// //             <FiTarget className="w-12 h-12 mx-auto mb-4 text-gray-400" />
// //             <h3 className="mb-2 text-lg font-medium text-gray-900">No pathways yet</h3>
// //             <p className="mb-6 text-gray-600">
// //               Create your first personalized learning roadmap to prepare for your dream job.
// //             </p>
// //             <button
// //               onClick={() => navigate('/mypathway')}
// //               className="px-6 py-3 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
// //             >
// //               Create Your First Pathway
// //             </button>
// //           </div>
// //         )}

// //         {/* Pathways List */}
// //         {pathways.length > 0 && (
// //           <div className="space-y-6">
// //             {pathways.map((pathway) => {
// //               // Determine target display
// //               let targetDisplay = 'Unknown Target';
// //               if (pathway.target_type === 'job_specific' && pathway.target_job_id) {
// //                 // You can enhance this by fetching job title from cache or including it in response
// //                 targetDisplay = `Job #${pathway.target_job_id}`;
// //               } else if (pathway.target_type === 'role_specific' && pathway.target_role_name) {
// //                 targetDisplay = pathway.target_role_name;
// //               }

// //               // Status badge
// //               const statusBadge = {
// //                 active: { text: 'Active', color: 'bg-green-100 text-green-800' },
// //                 selected: { text: 'Selected', color: 'bg-blue-100 text-blue-800' },
// //                 in_progress: { text: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
// //                 completed: { text: 'Completed', color: 'bg-purple-100 text-purple-800' },
// //                 outdated: { text: 'Outdated', color: 'bg-gray-100 text-gray-800' },
// //               }[pathway.status] || { text: 'Active', color: 'bg-green-100 text-green-800' };

// //               // Resource composition
// //               const resources = [];
// //               if (pathway.total_courses > 0) resources.push(`${pathway.total_courses} Course${pathway.total_courses > 1 ? 's' : ''}`);
// //               if (pathway.total_projects > 0) resources.push(`${pathway.total_projects} Project${pathway.total_projects > 1 ? 's' : ''}`);
// //               if (pathway.total_internships > 0) resources.push(`${pathway.total_internships} Internship${pathway.total_internships > 1 ? 's' : ''}`);
// //               if (pathway.total_jobs > 0) resources.push(`${pathway.total_jobs} Job${pathway.total_jobs > 1 ? 's' : ''}`);

// //               return (
// //                 <div
// //                   key={pathway.pathway_id}
// //                   className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl"
// //                 >
// //                   <div className="px-6 py-5">
// //                     <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
// //                       {/* Left: Info */}
// //                       <div className="flex-1 min-w-0">
// //                         <div className="flex flex-wrap items-center gap-2 mb-3">
// //                           <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.color}`}>
// //                             {statusBadge.text}
// //                           </span>
// //                           <span className="text-sm text-gray-500">
// //                             Created {new Date(pathway.created_at).toLocaleDateString()}
// //                           </span>
// //                         </div>

// //                         <h2 className="text-xl font-semibold text-gray-900">
// //                           Prepare for: <span className="text-indigo-600">{targetDisplay}</span>
// //                         </h2>

// //                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-sm">
// //                           <div>
// //                             <span className="text-gray-500">Coverage</span>
// //                             <p className="font-medium text-gray-900">{pathway.overall_skill_coverage_percent}%</p>
// //                           </div>
// //                           <div>
// //                             <span className="text-gray-500">Duration</span>
// //                             <p className="font-medium text-gray-900">{pathway.total_duration_months} months</p>
// //                           </div>
// //                           <div>
// //                             <span className="text-gray-500">Resources</span>
// //                             <p className="font-medium text-gray-900">{resources.join(', ') || 'None'}</p>
// //                           </div>
// //                           <div>
// //                             <span className="text-gray-500">Rank</span>
// //                             <p className="font-medium text-gray-900">Pathway #{pathway.pathway_rank}</p>
// //                           </div>
// //                         </div>
// //                       </div>

// //                       {/* Right: Actions */}
// //                       <div className="flex flex-wrap gap-2">
// //                         <button
// //                           onClick={() => handleView(pathway.pathway_id)}
// //                           className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
// //                         >
// //                           <FiEye className="mr-1" /> View
// //                         </button>

// //                         {(pathway.status === 'active' || pathway.status === 'selected') && (
// //                           <button
// //                             onClick={() => handleStart(pathway.pathway_id)}
// //                             className="flex items-center px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
// //                           >
// //                             <FiPlay className="mr-1" /> Start
// //                           </button>
// //                         )}

// //                         <button
// //                           onClick={() => handleDelete(pathway.pathway_id)}
// //                           className="flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200"
// //                         >
// //                           <FiTrash2 className="mr-1" /> Delete
// //                         </button>
// //                       </div>
// //                     </div>
// //                   </div>
// //                 </div>
// //               );
// //             })}
// //           </div>
// //         )}

// //         {/* Stats Summary */}
// //         {pathways.length > 0 && (
// //           <div className="grid grid-cols-1 gap-4 mt-10 sm:grid-cols-3">
// //             <div className="p-4 bg-white border rounded-lg">
// //               <div className="flex items-center">
// //                 <div className="p-2 bg-blue-100 rounded-lg">
// //                   <FiCheckCircle className="w-5 h-5 text-blue-600" />
// //                 </div>
// //                 <div className="ml-3">
// //                   <p className="text-sm text-gray-500">Avg. Skill Coverage</p>
// //                   <p className="text-xl font-bold">
// //                     {(
// //                       pathways.reduce((sum, p) => sum + parseFloat(p.overall_skill_coverage_percent), 0) /
// //                       pathways.length
// //                     ).toFixed(1)}%
// //                   </p>
// //                 </div>
// //               </div>
// //             </div>

// //             <div className="p-4 bg-white border rounded-lg">
// //               <div className="flex items-center">
// //                 <div className="p-2 bg-green-100 rounded-lg">
// //                   <FiClock className="w-5 h-5 text-green-600" />
// //                 </div>
// //                 <div className="ml-3">
// //                   <p className="text-sm text-gray-500">Avg. Duration</p>
// //                   <p className="text-xl font-bold">
// //                     {(
// //                       pathways.reduce((sum, p) => sum + parseFloat(p.total_duration_months), 0) /
// //                       pathways.length
// //                     ).toFixed(1)} months
// //                   </p>
// //                 </div>
// //               </div>
// //             </div>

// //             <div className="p-4 bg-white border rounded-lg">
// //               <div className="flex items-center">
// //                 <div className="p-2 bg-purple-100 rounded-lg">
// //                   <FiTarget className="w-5 h-5 text-purple-600" />
// //                 </div>
// //                 <div className="ml-3">
// //                   <p className="text-sm text-gray-500">Total Pathways</p>
// //                   <p className="text-xl font-bold">{pathways.length}</p>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </MainLayout>
// //   );
// // };

// // export default StudentDashboard;








// import React, { useState, useEffect } from 'react';
// import { FiEye, FiPlay, FiTrash2, FiRefreshCw, FiCheckCircle, FiClock, FiTarget, FiBriefcase, FiBarChart2 } from 'react-icons/fi';
// import MainLayout from '../components/layout/MainLayout';
// import { useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { pathwaysApi } from '../api/pathwaysApi';

// const BASE_URL = import.meta.env.VITE_BASE_URL;

// const StudentDashboard = () => {
//   const navigate = useNavigate();
//   const [pathways, setPathways] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Get auth token from Redux store
//   const { token, user } = useSelector((state) => state.auth);

//   useEffect(() => {
//     loadPathways();
//   }, []);

//   const loadPathways = async () => {
//     try {
//       setLoading(true);
//       const data = await pathwaysApi.getUserPathways(user.id, token);
//       setPathways(data.data.pathways || []);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (pathwayId) => {
//     if (!window.confirm('Delete this pathway?')) return;
//     try {
//       await pathwaysApi.deletePathway(pathwayId, token);
//       setPathways((prev) => prev.filter((p) => p.pathway_id !== pathwayId));
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   const handleView = (pathwayId) => {
//     navigate(`/pathways/${pathwayId}`);
//   };

//   const handleStart = (pathwayId) => {
//     navigate(`/pathways/${pathwayId}`);
//   };

//   if (loading) {
//     return (
//       <MainLayout>
//         <div className="max-w-7xl p-4 mx-auto md:p-8">
//           <div className="flex justify-between items-center mb-8 animate-pulse">
//             <div className="w-64 h-10 bg-gray-200 rounded-lg"></div>
//             <div className="w-40 h-10 bg-gray-200 rounded-lg"></div>
//           </div>
//           {/* Skeleton Stats */}
//           <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-3 animate-pulse">
//              {[1, 2, 3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl"></div>)}
//           </div>
//           {/* Skeleton Cards */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
//             {[1, 2, 3, 4].map((i) => (
//               <div key={i} className="h-72 bg-gray-50 border border-gray-100 rounded-3xl"></div>
//             ))}
//           </div>
//         </div>
//       </MainLayout>
//     );
//   }

//   return (
//     <MainLayout>
//       <div className="max-w-7xl p-4 mx-auto md:p-8">
        
//         {/* Header Section */}
//         <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
//           <div>
//             <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">
//               My Learning Pathways
//             </h1>
//             <p className="mt-2 text-gray-500 font-medium">
//               {pathways.length > 0
//                 ? `You're currently tracking ${pathways.length} personalized career roadmap${pathways.length !== 1 ? 's' : ''}.`
//                 : 'Your career journey starts here. Build your first roadmap!'}
//             </p>
//           </div>
//           <button
//             onClick={() => navigate('/mypathway')}
//             className="group flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 active:scale-95"
//           >
//             <FiRefreshCw className="mr-2 transition-transform group-hover:rotate-180" /> 
//             Build New Pathway
//           </button>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="p-4 mb-8 text-red-700 bg-red-50 border border-red-200 rounded-xl flex items-center">
//              <div className="w-2 h-full bg-red-500 rounded-full mr-3"></div>
//              {error}
//           </div>
//         )}

//         {/* Stats Summary - Moved to top for better Dashboard UX */}
//         {pathways.length > 0 && (
//           <div className="grid grid-cols-1 gap-4 mb-10 sm:grid-cols-3">
//             <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
//               <div className="flex items-center gap-4">
//                 <div className="p-3 bg-blue-50 text-blue-600 rounded-xl ring-4 ring-blue-50/50">
//                   <FiCheckCircle className="w-6 h-6" />
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-500 mb-0.5">Avg. Skill Coverage</p>
//                   <p className="text-2xl font-bold text-gray-900">
//                     {(
//                       pathways.reduce((sum, p) => sum + parseFloat(p.overall_skill_coverage_percent), 0) /
//                       pathways.length
//                     ).toFixed(1)}%
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
//               <div className="flex items-center gap-4">
//                 <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl ring-4 ring-emerald-50/50">
//                   <FiClock className="w-6 h-6" />
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-500 mb-0.5">Avg. Duration</p>
//                   <p className="text-2xl font-bold text-gray-900">
//                     {(
//                       pathways.reduce((sum, p) => sum + parseFloat(p.total_duration_months), 0) /
//                       pathways.length
//                     ).toFixed(1)} <span className="text-base font-medium text-gray-500">months</span>
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-2xl hover:shadow-md transition-shadow">
//               <div className="flex items-center gap-4">
//                 <div className="p-3 bg-purple-50 text-purple-600 rounded-xl ring-4 ring-purple-50/50">
//                   <FiTarget className="w-6 h-6" />
//                 </div>
//                 <div>
//                   <p className="text-sm font-medium text-gray-500 mb-0.5">Total Pathways</p>
//                   <p className="text-2xl font-bold text-gray-900">{pathways.length}</p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Empty State */}
//         {pathways.length === 0 && !loading && !error && (
//           <div className="flex flex-col items-center justify-center p-16 text-center bg-gray-50/50 border-2 border-gray-200 border-dashed rounded-3xl">
//             <div className="p-4 bg-white rounded-full shadow-sm mb-5">
//               <FiBriefcase className="w-10 h-10 text-indigo-300" />
//             </div>
//             <h3 className="mb-2 text-xl font-bold text-gray-900">No pathways created yet</h3>
//             <p className="max-w-md mb-8 text-gray-500">
//               Generate your first AI-driven personalized learning roadmap to systematically prepare for your dream role.
//             </p>
//             <button
//               onClick={() => navigate('/mypathway')}
//               className="px-8 py-3.5 text-sm font-semibold text-white transition-all bg-gray-900 rounded-full hover:bg-gray-800 hover:shadow-lg active:scale-95"
//             >
//               Generate First Pathway
//             </button>
//           </div>
//         )}

//         {/* Pathways Grid */}
//         {pathways.length > 0 && (
//           <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
//             {pathways.map((pathway) => {
              
//               // Determine target display
//               let targetDisplay = 'Unknown Target';
//               if (pathway.target_type === 'job_specific' && pathway.target_job_id) {
//                 targetDisplay = `Target Job ${pathway.target_job_id}`;
//               } else if (pathway.target_type === 'role_specific' && pathway.target_role_name) {
//                 targetDisplay = pathway.target_role_name;
//               }

//               // Status badge config
//               const statusBadge = {
//                 active: { text: 'Active', classes: 'bg-emerald-100/80 text-emerald-700 border-emerald-200' },
//                 selected: { text: 'Selected', classes: 'bg-blue-100/80 text-blue-700 border-blue-200' },
//                 in_progress: { text: 'In Progress', classes: 'bg-amber-100/80 text-amber-700 border-amber-200' },
//                 completed: { text: 'Completed', classes: 'bg-purple-100/80 text-purple-700 border-purple-200' },
//                 outdated: { text: 'Outdated', classes: 'bg-gray-100 text-gray-600 border-gray-200' },
//               }[pathway.status] || { text: 'Active', classes: 'bg-emerald-100/80 text-emerald-700 border-emerald-200' };

//               // Resource calculation
//               const hasResources = pathway.total_courses > 0 || pathway.total_projects > 0 || pathway.total_internships > 0 || pathway.total_jobs > 0;

//               return (
//                 <div
//                   key={pathway.pathway_id}
//                   className="group flex flex-col bg-white border border-gray-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1"
//                 >
//                   {/* Card Header */}
//                   <div className="p-6 pb-4">
//                     <div className="flex items-center justify-between mb-4">
//                       <span className={`px-3 py-1 border rounded-full text-xs font-semibold uppercase tracking-wider ${statusBadge.classes}`}>
//                         {statusBadge.text}
//                       </span>
//                       <span className="text-xs font-medium text-gray-400">
//                         {new Date(pathway.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
//                       </span>
//                     </div>

//                     <h2 className="text-xl font-bold text-gray-900 line-clamp-2 leading-tight mb-1">
//                       {targetDisplay}
//                     </h2>
//                     <p className="text-sm font-medium text-indigo-600 mb-6">
//                       Pathway Rank {pathway.pathway_rank}
//                     </p>

//                     {/* Progress Bar for Coverage */}
//                     <div className="mb-6">
//                       <div className="flex justify-between items-end mb-2">
//                         <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Skill Match</span>
//                         <span className="text-sm font-bold text-gray-900">{pathway.overall_skill_coverage_percent}%</span>
//                       </div>
//                       <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
//                         <div 
//                           className="bg-indigo-500 h-2 rounded-full transition-all duration-1000 ease-out relative"
//                           style={{ width: `${pathway.overall_skill_coverage_percent}%` }}
//                         >
//                           <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Resources section */}
//                     <div>
//                       <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">Resources Included</span>
//                       <div className="flex flex-wrap gap-2">
//                         {hasResources ? (
//                           <>
//                             {pathway.total_courses > 0 && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">{pathway.total_courses} Course{pathway.total_courses > 1 ? 's' : ''}</span>}
//                             {pathway.total_projects > 0 && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-orange-50 text-orange-700">{pathway.total_projects} Project{pathway.total_projects > 1 ? 's' : ''}</span>}
//                             {pathway.total_internships > 0 && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-teal-50 text-teal-700">{pathway.total_internships} Internship{pathway.total_internships > 1 ? 's' : ''}</span>}
//                             {pathway.total_jobs > 0 && <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-50 text-purple-700">{pathway.total_jobs} Job{pathway.total_jobs > 1 ? 's' : ''}</span>}
//                           </>
//                         ) : (
//                           <span className="text-sm text-gray-400 italic">No specific resources mapped</span>
//                         )}
//                       </div>
//                     </div>
//                   </div>

//                   <div className="mt-auto p-4 bg-gray-50 border-t border-gray-100">
//                     <div className="flex items-center justify-between gap-3">
//                       {/* View Button */}
//                       <button
//                         onClick={() => handleView(pathway.pathway_id)}
//                         className="flex-1 flex justify-center items-center px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors"
//                       >
//                         <FiEye className="mr-2" /> View
//                       </button>

//                       {/* Start Button */}
//                       {(pathway.status === 'active' || pathway.status === 'selected') && (
//                         <button
//                           onClick={() => handleStart(pathway.pathway_id)}
//                           className="flex-1 flex justify-center items-center px-4 py-2 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors shadow-sm"
//                         >
//                           <FiPlay className="mr-2" /> Start
//                         </button>
//                       )}

//                       {/* Delete Icon Button */}
//                       <button
//                         onClick={() => handleDelete(pathway.pathway_id)}
//                         title="Delete Pathway"
//                         className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
//                       >
//                         <FiTrash2 className="w-5 h-5" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}

//       </div>
//     </MainLayout>
//   );
// };

// export default StudentDashboard;
































import React, { useState, useEffect } from 'react';
import { FiEye, FiPlay, FiTrash2, FiRefreshCw, FiCheckCircle, FiClock, FiTarget, FiBriefcase, FiBarChart2 } from 'react-icons/fi';
import MainLayout from '../components/layout/MainLayout';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { pathwaysApi } from '../api/pathwaysApi';
import GreenPrimaryButton from '../components/jobs/GreenPrimaryButton';
import AvgStatCard from '../components/jobs/AvgStatCard';
import PathwayStatusBadge from '../components/jobs/PathwayStatusBadge';
import StartPathwayButton from '../components/jobs/StartPathwayButton'; 
import TargetJobLabel from '../components/jobs/TargetJobLabel';
const BASE_URL = import.meta.env.VITE_BASE_URL;

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [pathways, setPathways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get auth token from Redux store
  const { token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    loadPathways();
  }, []);

  const loadPathways = async () => {
    try {
      setLoading(true);
      const data = await pathwaysApi.getUserPathways(user.id, token);
      setPathways(data.data.pathways || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pathwayId) => {
    if (!window.confirm('Delete this pathway?')) return;
    try {
      await pathwaysApi.deletePathway(pathwayId, token);
      setPathways((prev) => prev.filter((p) => p.pathway_id !== pathwayId));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleView = (pathwayId) => {
    navigate(`/pathways/${pathwayId}`);
  };

  const handleStart = (pathwayId) => {
    navigate(`/pathways/${pathwayId}`);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-7xl p-4 mx-auto md:p-8">
          <div className="flex justify-between items-center mb-8 animate-pulse">
            <div className="w-64 h-10 bg-gray-200 rounded-lg"></div>
            <div className="w-40 h-10 bg-gray-200 rounded-lg"></div>
          </div>
          {/* Skeleton Stats */}
          <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-3 animate-pulse">
             {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white border border-gray-100 rounded-xl"></div>)}
          </div>
          {/* Skeleton Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 bg-white border border-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl p-4 mx-auto md:p-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-[#1e1e2d] tracking-tight">
              My Learning Pathways
            </h1>
            <p className="mt-2 text-gray-500 font-medium">
              {pathways.length > 0
                ? `You're currently tracking ${pathways.length} personalized career roadmap${pathways.length !== 1 ? 's' : ''}.`
                : 'Your career journey starts here. Build your first roadmap!'}
            </p>
          </div>
          {/* <button
            onClick={() => navigate('/mypathway')}
            className="group flex items-center justify-center px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 bg-[#9bc87c] rounded-lg hover:bg-[#8ab76b] shadow-sm active:scale-95"
          >
            <FiRefreshCw className="mr-2 transition-transform group-hover:rotate-180" /> 
            Build New Pathway
          </button> */}

          <GreenPrimaryButton
            onClick={() => navigate('/mypathway')}
            className="flex items-center justify-center group"
          >
            <FiRefreshCw className="mr-2 transition-transform group-hover:rotate-180" /> 
            Build New Pathway
          </GreenPrimaryButton>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 mb-8 text-red-600 bg-red-50 border border-red-100 rounded-xl flex items-center text-sm font-medium">
             <div className="w-1.5 h-full bg-red-500 rounded-full mr-3"></div>
             {error}
          </div>
        )}

        {/* Stats Summary - Moved to top for better Dashboard UX */}
        {/* {pathways.length > 0 && (
          <div className="grid grid-cols-1 gap-4 mb-10 sm:grid-cols-3">
            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#9bc87c]/10 text-[#9bc87c] rounded-lg">
                  <FiCheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-0.5">Avg. Skill Coverage</p>
                  <p className="text-2xl font-extrabold text-[#1e1e2d]">
                    {(
                      pathways.reduce((sum, p) => sum + parseFloat(p.overall_skill_coverage_percent), 0) /
                      pathways.length
                    ).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#1e1e2d]/5 text-[#1e1e2d] rounded-lg">
                  <FiClock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-0.5">Avg. Duration</p>
                  <p className="text-2xl font-extrabold text-[#1e1e2d]">
                    {(
                      pathways.reduce((sum, p) => sum + parseFloat(p.total_duration_months), 0) /
                      pathways.length
                    ).toFixed(1)} <span className="text-base font-semibold text-gray-500">months</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border border-gray-100 shadow-sm rounded-xl hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 text-gray-600 rounded-lg">
                  <FiTarget className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-0.5">Total Pathways</p>
                  <p className="text-2xl font-extrabold text-[#1e1e2d]">{pathways.length}</p>
                </div>
              </div>
            </div>
          </div>
        )} */}

        {/* Stats Summary - Moved to top for better Dashboard UX */}
        {pathways.length > 0 && (
          <div className="grid grid-cols-1 gap-4 mb-10 sm:grid-cols-3">
            <AvgStatCard
              icon={<FiCheckCircle className="w-6 h-6" />}
              label="Avg. Skill Coverage"
              value={(
                pathways.reduce((sum, p) => sum + parseFloat(p.overall_skill_coverage_percent), 0) /
                pathways.length
              ).toFixed(1)}
              suffix="%"
              tone="green"
            />

            <AvgStatCard
              icon={<FiClock className="w-6 h-6" />}
              label="Avg. Duration"
              value={(
                pathways.reduce((sum, p) => sum + parseFloat(p.total_duration_months), 0) /
                pathways.length
              ).toFixed(1)}
              suffix="months"
              tone="dark"
            />

            <AvgStatCard
              icon={<FiTarget className="w-6 h-6" />}
              label="Total Pathways"
              value={pathways.length}
              tone="gray"
            />
          </div>
        )}

        {/* Empty State */}
        {pathways.length === 0 && !loading && !error && (
          <div className="flex flex-col items-center justify-center p-16 text-center bg-white border border-gray-200 border-dashed rounded-2xl shadow-sm">
            <div className="p-4 bg-gray-50 rounded-full mb-5">
              <FiBriefcase className="w-10 h-10 text-[#9bc87c]" />
            </div>
            <h3 className="mb-2 text-xl font-extrabold text-[#1e1e2d]">No pathways created yet</h3>
            <p className="max-w-md mb-8 text-gray-500 font-medium">
              Generate your first AI-driven personalized learning roadmap to systematically prepare for your dream role.
            </p>
            {/* <button
              onClick={() => navigate('/mypathway')}
              className="px-8 py-3 text-sm font-bold text-white transition-all bg-[#9bc87c] rounded-lg hover:bg-[#8ab76b] shadow-sm active:scale-95"
            >
              Generate First Pathway
            </button> */}

            <GreenPrimaryButton
              onClick={() => navigate('/mypathway')}
              className="px-8 py-3 active:scale-95"
            >
              Generate First Pathway
            </GreenPrimaryButton>
          </div>
        )}

        {/* Pathways Grid */}
        {pathways.length > 0 && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pathways.map((pathway) => {
              
              // Determine target display
              // let targetDisplay = 'Unknown Target';
              // if (pathway.target_type === 'job_specific' && pathway.target_job_id) {
              //   targetDisplay = `Target Job ${pathway.target_job_id}`;
              // } else if (pathway.target_type === 'role_specific' && pathway.target_role_name) {
              //   targetDisplay = pathway.target_role_name;
              // }

              

              // Status badge config - Utilizing brand colors
              const statusBadge = {
                active: { text: 'Active', classes: 'bg-[#9bc87c]/10 text-[#1e1e2d] border-[#9bc87c]/30' },
                selected: { text: 'Selected', classes: 'bg-gray-100 text-[#1e1e2d] border-gray-200' },
                in_progress: { text: 'In Progress', classes: 'bg-[#1DB32F]/10 text-[#1DB32F] border-[#1DB32F]/30' },
                completed: { text: 'Completed', classes: 'bg-[#1e1e2d] text-white border-[#1e1e2d]' },
                outdated: { text: 'Outdated', classes: 'bg-gray-50 text-gray-500 border-gray-200' },
              }[pathway.status] || { text: 'Active', classes: 'bg-[#9bc87c]/10 text-[#1e1e2d] border-[#9bc87c]/30' };

              // Resource calculation
              const hasResources = pathway.total_courses > 0 || pathway.total_projects > 0 || pathway.total_internships > 0 || pathway.total_jobs > 0;

              return (
                <div
                  key={pathway.pathway_id}
                  className="group flex flex-col bg-white border border-gray-100 shadow-sm hover:shadow-md rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.005]"
                >
                  {/* Card Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 border rounded-full text-[10px] font-bold uppercase tracking-wider ${statusBadge.classes}`}>
                        {statusBadge.text}
                      </span>
                      <span className="text-[11px] font-medium text-gray-400">
                        {new Date(pathway.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {/* <h2 className="text-xl font-extrabold text-[#1e1e2d] line-clamp-2 leading-tight mb-1">
                      {targetDisplay}
                    </h2>
                    <p className="text-xs font-bold text-[#9bc87c] mb-6">
                      Pathway Rank {pathway.pathway_rank}
                    </p> */}
<h2 className="text-xl font-extrabold text-[#1e1e2d] line-clamp-2 leading-tight mb-2.5">
                      Pathway {pathway.pathway_rank}
                    </h2>
                    <div className="mb-6">
                      <TargetJobLabel 
                        jobId={pathway.target_job_id} 
                        title={pathway.target_role_name || null} 
                      />
                    </div>
                    {/* Progress Bar for Coverage */}
                    <div className="mb-6">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Skill Match</span>
                        <span className="text-sm font-extrabold text-[#1e1e2d]">{pathway.overall_skill_coverage_percent}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-[#9bc87c] h-full rounded-full transition-all duration-1000 ease-out relative"
                          style={{ width: `${pathway.overall_skill_coverage_percent}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                        </div>
                      </div>
                    </div>

                    {/* Resources section */}
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2">Resources Included</span>
                      <div className="flex flex-wrap gap-2">
                        {hasResources ? (
                          <>
                            {pathway.total_courses > 0 && <span className="inline-flex items-center px-2 py-1 border border-gray-100 rounded bg-gray-50 text-[11px] font-semibold text-gray-600">{pathway.total_courses} Course{pathway.total_courses > 1 ? 's' : ''}</span>}
                            {pathway.total_projects > 0 && <span className="inline-flex items-center px-2 py-1 border border-gray-100 rounded bg-gray-50 text-[11px] font-semibold text-gray-600">{pathway.total_projects} Project{pathway.total_projects > 1 ? 's' : ''}</span>}
                            {pathway.total_internships > 0 && <span className="inline-flex items-center px-2 py-1 border border-gray-100 rounded bg-gray-50 text-[11px] font-semibold text-gray-600">{pathway.total_internships} Internship{pathway.total_internships > 1 ? 's' : ''}</span>}
                            {pathway.total_jobs > 0 && <span className="inline-flex items-center px-2 py-1 border border-gray-100 rounded bg-gray-50 text-[11px] font-semibold text-gray-600">{pathway.total_jobs} Job{pathway.total_jobs > 1 ? 's' : ''}</span>}
                          </>
                        ) : (
                          <span className="text-xs text-gray-400 font-medium italic">No specific resources mapped</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto p-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex items-center justify-between gap-3">
                      {/* View Button */}
                      <button
                        onClick={() => handleView(pathway.pathway_id)}
                        className="flex-1 flex justify-center items-center px-4 py-2 text-sm font-bold text-[#1e1e2d] bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
                      >
                        <FiEye className="mr-2" /> View
                      </button>

                     

                      {/* Naya Start Button */}
{(pathway.status === 'active' || pathway.status === 'selected') && (
  <GreenPrimaryButton
    onClick={() => handleStart(pathway.pathway_id)}
    className="flex-1 flex items-center justify-center py-2 px-4"
  >
    <FiPlay className="mr-2" /> Start
  </GreenPrimaryButton>
)}
                      

                      {/* Delete Icon Button */}
                      <button
                        onClick={() => handleDelete(pathway.pathway_id)}
                        title="Delete Pathway"
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </MainLayout>
  );
};

export default StudentDashboard;