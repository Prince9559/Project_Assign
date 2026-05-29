// // import React, { useState, useEffect } from 'react';
// // import MainLayout from '../components/layout/MainLayout';
// // import FeedRightSidebarForMyApplication from '../pages/student/feed/FeedRightSidebarForMyApplication';
// // import PathwaySetupForm from '../components/pathway/pathwaySetupForm';
// // import PathwayGenerationLoader from '../components/pathway/pathwayGenerationLoader';
// // import PathwayCard from '../components/pathway/pathwayCard';
// // import { pathwaysApi } from '../api/pathwaysApi';
// // import { useNavigate, useLocation } from 'react-router-dom';
// // import FeedRightSidebar from "../pages/student/feed/FeedRightSidebar";

// // const MyPathway = () => {
// //     const [view, setView] = useState('setup'); // 'setup' | 'generating' | 'results'
// //     const [preferences, setPreferences] = useState(null);
// //     const [pathways, setPathways] = useState([]);
// //     const [expandedPathwayId, setExpandedPathwayId] = useState(null);
// //     const [selectedPathwayId, setSelectedPathwayId] = useState(null);
// //     const [error, setError] = useState(null);

// //     const navigate= useNavigate();


// //     // Add this at top imports
   

// //     // Inside MyPathway component, after navigate declaration
// //     const location = useLocation();
// //     const state = location.state || {}; // { jobId, jobTitle, companyName, companyId?, domains? }
// //     console.log("the state data",state);

// //     // Compute initial values based on route state AND preferences
// //     const initialFormValues = React.useMemo(() => {
// //         const base = {
// //             resource_priority: preferences?.resource_priority || ["internship", "project", "course"],
// //             max_timeline: preferences?.max_timeline_days || 365,
// //             min_timeline: preferences?.min_timeline_days || 1,
// //         };

// //         // Add include_resources with defaults
// //         const includeDefaults = {
// //             course: true,
// //             project: true,
// //             internship: true,
// //             job: true,
// //         };

// //         // If job-specific params passed → set strategy & lock job
// //         if (state.jobId || state.jobTitle) {
// //             return {
// //                 ...base,
// //                 strategy: "job_specific",
// //                 target_job_id: state.jobId,
// //                 target_job_title: state.jobTitle,
// //                 target_company_name: state.companyName,
// //                 include_resources: includeDefaults,
// //                 // no editing allowed
// //             };
// //         }

// //         // If companyId passed (e.g., from company page)
// //         // if (state.companyId) {
// //         //     return {
// //         //         ...base,
// //         //         strategy: "company_target",
// //         //         target_company_id: Array.isArray(state.companyId) ? state.companyId[0] : state.companyId,
// //         //     };
// //         // }

// //         // With this enhanced version:
// // if (state.companyId || state.companyIds || state.roleIds || state.strategy==="company_role_target") {
// //   const companyIds = Array.isArray(state.companyId)
// //     ? state.companyId
// //     : state.companyIds || (state.companyId ? [state.companyId] : []);
// //   const roleIds = state.roleIds || [];

// //   return {
// //     ...base,
// //     strategy: "company_role_target",
// //     target_company_ids: companyIds.map(String),
// //     target_role_ids: roleIds.map(String),
// //       include_resources: includeDefaults,
// //   };
// // }

// //         // If domains passed
// //         if (state.domains && state.domains.length) {
// //             return {
// //                 ...base,
// //                 strategy: "direct_upskilling",
// //                 target_domains: state.domains.map(d => d.domain_id || d),
// //                 include_resources: includeDefaults,
// //             };
// //         }

// //         // fallback: use saved preferences or defaults
// //         return {
// //             ...base,
// //             strategy: preferences?.last_strategy || "job_specific",
// //             target_job_id: preferences?.target_job_id,
// //             target_company_id: preferences?.target_company_id,
// //             target_domains: preferences?.target_domains || [],
// //             include_resources: includeDefaults,
// //         };
// //     }, [preferences, state]);

    

// //     // Load preferences on mount
// //     useEffect(() => {
// //         const loadPreferences = async () => {
// //             try {
// //                 const res = await pathwaysApi.getUserPreferences();
// //                 setPreferences(res.preferences);
// //             } catch (err) {
// //                 console.error('Failed to load preferences:', err);
// //                 setError('Failed to load your preferences. Please refresh.');
// //             }
// //         };
// //         loadPreferences();
// //     }, []);

// //     // Handle form submission
// //     const handleGenerate = async (payload) => {
// //         setView('generating');
// //         setError(null);

// //         try {
// //             const res = await pathwaysApi.generatePathways(payload);
// //             if (res.success) {
// //                 // Enrich pathways with gap analysis for display
// //                 const enriched = res.pathways.map((p, idx) => ({
// //                     ...p,
// //                     gap_analysis: res.gap_analysis,
// //                     steps: [], // Will load on expand
// //                 }));
// //                 setPathways(enriched);
// //                 setView('results');
// //             } else {
// //                 setError(res.message || 'Generation failed. Please try again.');
// //                 setView('setup');
// //             }
// //         } catch (err) {
// //             console.error('Generation error:', err);
// //             setError(err.response?.data?.error || 'An error occurred. Please try again.');
// //             setView('setup');
// //         }
// //     };

// //     // Expand pathway and load steps
// //     const handleExpand = async (pathwayId) => {
// //         if (expandedPathwayId === pathwayId) {
// //             setExpandedPathwayId(null);
// //             return;
// //         }

// //         try {
// //             const res = await pathwaysApi.getPathwayById(pathwayId);
// //             if (res.success && res.pathway) {
// //                 setPathways((prev) =>
// //                     prev.map((p) =>
// //                         p.pathway_id === pathwayId ? { ...p, steps: res.pathway.steps } : p
// //                     )
// //                 );
// //                 setExpandedPathwayId(pathwayId);
// //             }
// //         } catch (err) {
// //             console.error('Failed to load pathway details:', err);
// //         }
// //     };

// //     // Select pathway
// //     const handleSelect = async (pathwayId) => {
// //         try {
// //             await pathwaysApi.updatePathwayStatus(pathwayId, 'selected');
// //             setSelectedPathwayId(pathwayId);
// //             // Optional: redirect to learning dashboard
// //             navigate(`/pathways/${pathwayId}`);
// //         } catch (err) {
// //             console.error('Failed to select pathway:', err);
// //             alert('Failed to select pathway. Please try again.');
// //         }
// //     };

// //     return (
// //         <MainLayout>
// //             <div className="flex items-start justify-center min-h-screen px-2 bg-gray-100 lg:px-8">
// //                 <div className="flex-grow hidden lg:block"></div>

// //                 <div className="max-w-3xl mx-auto mt-2">
// //                     <div className="mb-8">
// //                         <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
// //                             {view === 'results' ? 'Your Personalized Pathways' : 'Build Your Learning Pathway'}
// //                         </h1>
// //                         {view === 'results' && (
// //                             <p className="mt-2 text-gray-600">
// //                                 We've generated 3 unique pathways. Expand to see details, then select the best fit.
// //                             </p>
// //                         )}

// //                         <span className="justify-end ">
// //                             <button
// //                                 type="button"
// //                                 onClick={() => navigate("/student-dashboard")}
// //                                 className="px-6 py-2 font-medium text-gray-700 hover:text-gray-900"
// //                             >
// //                                 Go To Dashboard
// //                             </button>
// //                         </span>
// //                     </div>

// //                     {error && (
// //                         <div className="p-4 mb-6 text-red-700 border border-red-200 rounded-lg bg-red-50">
// //                             {error}
// //                         </div>
// //                     )}

// //                     {/* {view === 'setup' && preferences && (
// //                         <PathwaySetupForm
// //                             onSubmit={handleGenerate}
// //                             initialValues={{
// //                                 strategy: 'job_specific',
// //                                 resource_priority: preferences.resource_priority,
// //                                 max_timeline: preferences.max_timeline_days,
// //                                 min_timeline: preferences.min_timeline_days,
// //                             }}
// //                         />
// //                     )} */}

                    
// //                     {view === 'setup' && preferences && (
// //                         <PathwaySetupForm
// //                             onSubmit={handleGenerate}
// //                             initialValues={initialFormValues}
// //                             locationState={state} // optional, just in case
// //                         />
// //                     )}

// //                     {view === 'generating' && <PathwayGenerationLoader />}

// //                     {view === 'results' && (
// //                         <div className="space-y-6">
// //                             {pathways.length > 0 ? (
// //                                 pathways.map((pathway) => (
// //                                     <PathwayCard
// //                                         key={pathway.pathway_id}
// //                                         pathway={pathway}
// //                                         isExpanded={expandedPathwayId === pathway.pathway_id}
// //                                         onExpand={handleExpand}
// //                                         onSelect={handleSelect}
// //                                     />
// //                                 ))
// //                             ) : (
// //                                 <div className="p-6 text-center bg-white rounded-xl">
// //                                     <p className="text-gray-600">No pathways generated.</p>
// //                                 </div>
// //                             )}

// //                             {selectedPathwayId && (
// //                                 <div className="p-4 text-center text-green-700 border border-green-200 rounded-lg bg-green-50">
// //                                     ✅ Pathway {pathways.find((p) => p.pathway_id === selectedPathwayId)?.rank} selected!
// //                                     You can start learning anytime from your dashboard.
// //                                 </div>
// //                             )}

// //                             <div className="flex justify-center mt-6">
// //                                 <button
// //                                     type="button"
// //                                     onClick={() => setView('setup')}
// //                                     className="px-6 py-2 font-medium text-gray-700 hover:text-gray-900"
// //                                 >
// //                                     ← Generate New Pathways
// //                                 </button>
// //                             </div>
// //                         </div>
// //                     )}
// //                 </div>

// //                 {/* Right Sidebar */}
// //                 <aside className="hidden lg:block w-full max-w-[350px] p-2 sticky top-4 h-fit">
// //                     <FeedRightSidebar />
// //                 </aside>

// //                 <div className="flex-grow hidden lg:block"></div>
// //             </div>
// //         </MainLayout>
// //     );
// // };

// // export default MyPathway;




























































// // import React, { useState, useEffect } from 'react';
// // import { useNavigate, useLocation } from 'react-router-dom';
// // import MainLayout from '../components/layout/MainLayout';
// // import FeedRightSidebar from '../pages/student/feed/FeedRightSidebar';
// // import PathwaySetupForm from '../components/pathway/PathwaySetupForm';
// // import PathwayGenerationLoader from '../components/pathway/PathwayGenerationLoader';
// // import PathwayCard from '../components/pathway/PathwayCard';


// // const BASE_URL= import.meta.env.VITE_BASE_URL;

// // const MyPathway = () => {
// //     const [view, setView] = useState('setup'); // 'setup' | 'generating' | 'results'
// //     const [preferences, setPreferences] = useState(null);
// //     const [pathways, setPathways] = useState([]);
// //     const [expandedPathwayId, setExpandedPathwayId] = useState(null);
// //     const [selectedPathwayId, setSelectedPathwayId] = useState(null);
// //     const [error, setError] = useState(null);

// //     const navigate = useNavigate();
// //     const location = useLocation();
// //     const state = location.state || {};

// //     // Fetch user preferences on mount (from localStorage or API)
// //     useEffect(() => {
// //         const loadPreferences = () => {
// //             try {
// //                 const saved = localStorage.getItem('user_pathway_preferences');
// //                 if (saved) {
// //                     setPreferences(JSON.parse(saved));
// //                 } else {
// //                     // Default preferences
// //                     const defaults = {
// //                         include_courses: true,
// //                         include_projects: true,
// //                         include_internships: true,
// //                         include_jobs: true,
// //                     };
// //                     setPreferences(defaults);
// //                     localStorage.setItem('user_pathway_preferences', JSON.stringify(defaults));
// //                 }
// //             } catch (err) {
// //                 console.error('Failed to load preferences:', err);
// //                 setPreferences({
// //                     include_courses: true,
// //                     include_projects: true,
// //                     include_internships: true,
// //                     include_jobs: true,
// //                 });
// //             }
// //         };
// //         loadPreferences();
// //     }, []);

// //     // Compute initial form values based on route state
// //     const initialFormValues = React.useMemo(() => {
// //         const base = {
// //             resource_priority: ["internship", "project", "course"],
// //             max_timeline: 365,
// //             min_timeline: 1,
// //         };

// //         const includeDefaults = {
// //             course: true,
// //             project: true,
// //             internship: true,
// //             job: true,
// //         };

// //         if (state.jobId || state.jobTitle) {
// //             return {
// //                 ...base,
// //                 strategy: "job_specific",
// //                 target_job_id: state.jobId,
// //                 target_job_title: state.jobTitle,
// //                 target_company_name: state.companyName,
// //                 include_resources: includeDefaults,
// //             };
// //         }

// //         if (state.roleName) {
// //             return {
// //                 ...base,
// //                 strategy: "role_specific",
// //                 target_role_name: state.roleName,
// //                 include_resources: includeDefaults,
// //             };
// //         }

// //         return {
// //             ...base,
// //             strategy: "job_specific",
// //             include_resources: includeDefaults,
// //         };
// //     }, [state]);

// //     // Handle pathway generation
// //     // const handleGenerate = async (formValues) => {
// //     //     setView('generating');
// //     //     setError(null);

// //     //     // Get user ID from localStorage (or auth context)
// //     //     const user = JSON.parse(localStorage.getItem('user'));
// //     //     if (!user?.id) {
// //     //         setError('User not logged in');
// //     //         setView('setup');
// //     //         return;
// //     //     }

// //     //     // Map form values to API payload
// //     //     const payload = {
// //     //         user_id: user.id,
// //     //         target_type: formValues.strategy,
// //     //         ...(formValues.strategy === 'job_specific' && {
// //     //             target_id: formValues.target_job_id,
// //     //         }),
// //     //         ...(formValues.strategy === 'role_specific' && {
// //     //             target_role: formValues.target_role_name,
// //     //         }),
// //     //         user_preferences: {
// //     //             include_courses: formValues.include_resources?.course ?? true,
// //     //             include_projects: formValues.include_resources?.project ?? true,
// //     //             include_internships: formValues.include_resources?.internship ?? true,
// //     //             include_jobs: formValues.include_resources?.job ?? true,
// //     //         },
// //     //     };

// //     //     try {
// //     //         const res = await fetch(`${BASE_URL}/pathways/v4/generate`, {
// //     //             method: 'POST',
// //     //             headers: {
// //     //                 'Content-Type': 'application/json',
// //     //             },
// //     //             body: JSON.stringify(payload),
// //     //         });

// //     //         const data = await res.json();

// //     //         if (data.success && Array.isArray(data.data?.pathways)) {
// //     //             // Enrich pathways with consistent IDs for expansion
// //     //             const enriched = data.data.pathways.map((p, idx) => ({
// //     //                 ...p,
// //     //                 pathway_id: p.pathway_id || `generated-${Date.now()}-${idx}`,
// //     //                 rank: p.pathway_rank || idx + 1,
// //     //                 steps: p.steps || [],
// //     //             }));

// //     //             setPathways(enriched);
// //     //             setView('results');

// //     //             // Save preferences
// //     //             const prefsToSave = {
// //     //                 include_courses: payload.user_preferences.include_courses,
// //     //                 include_projects: payload.user_preferences.include_projects,
// //     //                 include_internships: payload.user_preferences.include_internships,
// //     //                 include_jobs: payload.user_preferences.include_jobs,
// //     //             };
// //     //             localStorage.setItem('user_pathway_preferences', JSON.stringify(prefsToSave));
// //     //         } else {
// //     //             const errorMsg = data.message || data.error || 'Failed to generate pathways. Please try again.';
// //     //             setError(errorMsg);
// //     //             setView('setup');
// //     //         }
// //     //     } catch (err) {
// //     //         console.error('Pathway generation error:', err);
// //     //         setError('Network error. Please check your connection and try again.');
// //     //         setView('setup');
// //     //     }
// //     // };



// //     const handleGenerate = async (payload) => {
// //         setView('generating');
// //         setError(null);

// //         const user = JSON.parse(localStorage.getItem('user'));
// //         if (!user?.id) {
// //             setError('User not logged in');
// //             setView('setup');
// //             return;
// //         }

// //         // ✅ Send EXACTLY what backend expects
// //         const apiPayload = {
// //             user_id: user.id,
// //             target_type: payload.strategy_type,
// //             ...(payload.strategy_type === 'job_specific' && { target_id: payload.target_job_id }),
// //             ...(payload.strategy_type === 'role_specific' && { target_role: payload.target_role }),
// //             user_preferences: {
// //                 include_courses: payload.include_types.includes('course'),
// //                 include_projects: payload.include_types.includes('project'),
// //                 include_internships: payload.include_types.includes('internship'),
// //                 include_jobs: payload.include_types.includes('job'),
// //             },
// //         };

// //         try {
// //             const res = await fetch(`${BASE_URL}/pathways/v4/generate`, {
// //                 method: 'POST',
// //                 headers: { 'Content-Type': 'application/json' },
// //                 body: JSON.stringify(apiPayload),
// //             });

// //             const data = await res.json();

// //             if (data.success && Array.isArray(data.data?.pathways)) {
// //                 const enriched = data.data.pathways.map((p, idx) => ({
// //                     ...p,
// //                     pathway_id: p.pathway_id || `temp-${Date.now()}-${idx}`,
// //                     rank: idx + 1,
// //                     steps: p.steps || [],
// //                 }));
// //                 setPathways(enriched);
// //                 setView('results');
// //             } else {
// //                 setError(data.message || 'Failed to generate pathways.');
// //                 setView('setup');
// //             }
// //         } catch (err) {
// //             console.error('API Error:', err);
// //             setError('Network error. Please try again.');
// //             setView('setup');
// //         }
// //     };

// //     // Expand pathway (no need to fetch details — already in response)
// //     const handleExpand = (pathwayId) => {
// //         setExpandedPathwayId(expandedPathwayId === pathwayId ? null : pathwayId);
// //     };

// //     // Select pathway
// //     const handleSelect = (pathwayId) => {
// //         setSelectedPathwayId(pathwayId);
// //         // Optional: redirect to detailed view
// //         // navigate(`/pathways/${pathwayId}`);
// //     };

// //     return (
// //         <MainLayout>
// //             <div className="flex items-start justify-center min-h-screen px-2 bg-gray-100 lg:px-8">
// //                 <div className="flex-grow hidden lg:block"></div>

// //                 <div className="max-w-3xl mx-auto mt-2 w-full">
// //                     <div className="mb-8">
// //                         <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
// //                             {view === 'results' ? 'Your Personalized Pathways' : 'Build Your Learning Pathway'}
// //                         </h1>
// //                         {view === 'results' && (
// //                             <p className="mt-2 text-gray-600">
// //                                 Top 3 pathways ranked by skill coverage and speed. Expand to see details.
// //                             </p>
// //                         )}

// //                         <div className="flex justify-end mt-4">
// //                             <button
// //                                 type="button"
// //                                 onClick={() => navigate("/student-dashboard")}
// //                                 className="px-6 py-2 font-medium text-gray-700 hover:text-gray-900"
// //                             >
// //                                 Go To Dashboard
// //                             </button>
// //                         </div>
// //                     </div>

// //                     {error && (
// //                         <div className="p-4 mb-6 text-red-700 border border-red-200 rounded-lg bg-red-50">
// //                             {error}
// //                         </div>
// //                     )}

// //                     {view === 'setup' && preferences && (
// //                         <PathwaySetupForm
// //                             onSubmit={handleGenerate}
// //                             initialValues={initialFormValues}
// //                             locationState={state}
// //                         />
// //                     )}

// //                     {view === 'generating' && <PathwayGenerationLoader />}

// //                     {view === 'results' && (
// //                         <div className="space-y-6">
// //                             {pathways.length > 0 ? (
// //                                 pathways.slice(0, 3).map((pathway) => (
// //                                     <PathwayCard
// //                                         key={pathway.pathway_id}
// //                                         pathway={pathway}
// //                                         isExpanded={expandedPathwayId === pathway.pathway_id}
// //                                         onExpand={handleExpand}
// //                                         onSelect={handleSelect}
// //                                     />
// //                                 ))
// //                             ) : (
// //                                 <div className="p-6 text-center bg-white rounded-xl">
// //                                     <p className="text-gray-600">No pathways generated.</p>
// //                                 </div>
// //                             )}

// //                             {selectedPathwayId && (
// //                                 <div className="p-4 text-center text-green-700 border border-green-200 rounded-lg bg-green-50">
// //                                     ✅ Pathway selected! You can start learning anytime from your dashboard.
// //                                 </div>
// //                             )}

// //                             <div className="flex justify-center mt-6">
// //                                 <button
// //                                     type="button"
// //                                     onClick={() => setView('setup')}
// //                                     className="px-6 py-2 font-medium text-gray-700 hover:text-gray-900"
// //                                 >
// //                                     ← Generate New Pathways
// //                                 </button>
// //                             </div>
// //                         </div>
// //                     )}
// //                 </div>

// //                 {/* Right Sidebar */}
// //                 <aside className="hidden lg:block w-full max-w-[350px] p-2 sticky top-4 h-fit">
// //                     <FeedRightSidebar />
// //                 </aside>

// //                 <div className="flex-grow hidden lg:block"></div>
// //             </div>
// //         </MainLayout>
// //     );
// // };

// // export default MyPathway;



























// // src/pages/MyPathway.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import MainLayout from '../components/layout/MainLayout';
// import FeedRightSidebar from '../pages/student/feed/FeedRightSidebar';
// import PathwaySetupForm from '../components/pathway/PathwaySetupForm';
// import PathwayGenerationLoader from '../components/pathway/PathwayGenerationLoader';
// import PathwayCard from '../components/pathway/PathwayCard';
// import {useSelector} from "react-redux";


// const BASE_URL=import.meta.env.VITE_BASE_URL;

// const MyPathway = () => {
//   const [view, setView] = useState('setup'); // 'setup' | 'generating' | 'results'
//   const [preferences, setPreferences] = useState(null);
//   const [pathways, setPathways] = useState([]);
//   const [expandedPathwayId, setExpandedPathwayId] = useState(null);
//   const [selectedPathwayId, setSelectedPathwayId] = useState(null);
//   const [error, setError] = useState(null);

//   const navigate = useNavigate();
//   const location = useLocation();
//   const state = location.state || {};


//   const { token,user } = useSelector((state) => state.auth);

//   // Load preferences on mount
//   useEffect(() => {
//     const loadPreferences = () => {
//       try {
//         const saved = localStorage.getItem('user_pathway_preferences');
//         if (saved) {
//           setPreferences(JSON.parse(saved));
//         } else {
//           const defaults = {
//             include_courses: true,
//             include_projects: true,
//             include_internships: true,
//             include_jobs: true,
//           };
//           setPreferences(defaults);
//           localStorage.setItem('user_pathway_preferences', JSON.stringify(defaults));
//         }
//       } catch (err) {
//         console.error('Failed to load preferences:', err);
//         setPreferences({
//           include_courses: true,
//           include_projects: true,
//           include_internships: true,
//           include_jobs: true,
//         });
//       }
//     };
//     loadPreferences();
//   }, []);

//   // Compute initial form values
//   const initialFormValues = React.useMemo(() => {
//     const base = {
//       resource_priority: ["internship", "project", "course"],
//       max_timeline: 365,
//       min_timeline: 1,
//     };

//     const includeDefaults = {
//       course: true,
//       project: true,
//       internship: true,
//       job: true,
//     };

//     if (state.jobId || state.jobTitle) {
//       return {
//         ...base,
//         strategy: "job_specific",
//         target_job_id: state.jobId,
//         target_job_title: state.jobTitle,
//         target_company_name: state.companyName,
//         include_resources: includeDefaults,
//       };
//     }

//     if (state.roleName) {
//       return {
//         ...base,
//         strategy: "role_specific",
//         target_role_name: state.roleName,
//         include_resources: includeDefaults,
//       };
//     }

//     return {
//       ...base,
//       strategy: "job_specific",
//       include_resources: includeDefaults,
//     };
//   }, [state]);

//   // Handle pathway generation
//   // const handleGenerate = async (formValues) => {
//   //   setView('generating');
//   //   setError(null);

//   //   const user = JSON.parse(localStorage.getItem('user'));
//   //   if (!user?.id) {
//   //     setError('User not logged in');
//   //     setView('setup');
//   //     return;
//   //   }

//   //   // Map form values to API payload
//   //   const payload = {
//   //     user_id: user.id,
//   //     target_type: formValues.strategy,
//   //     ...(formValues.strategy === 'job_specific' && {
//   //       target_id: formValues.target_job_id,
//   //     }),
//   //     ...(formValues.strategy === 'role_specific' && {
//   //       target_role: formValues.target_role_name,
//   //     }),
//   //     user_preferences: {
//   //       include_courses: formValues.include_resources?.course ?? true,
//   //       include_projects: formValues.include_resources?.project ?? true,
//   //       include_internships: formValues.include_resources?.internship ?? true,
//   //       include_jobs: formValues.include_resources?.job ?? true,
//   //     },
//   //   };

//   //   try {
//   //     const res = await fetch(`${BASE_URL}/pathways/v4/generate`, {
//   //       method: 'POST',
//   //       headers: {
//   //         'Content-Type': 'application/json',
//   //       },
//   //       body: JSON.stringify(payload),
//   //     });

//   //     const data = await res.json();

//   //     if (data.success && Array.isArray(data.data?.pathways)) {
//   //       // Enrich pathways with consistent IDs
//   //       const enriched = data.data.pathways.map((p, idx) => ({
//   //         ...p,
//   //         pathway_id: p.pathway_id || `generated-${Date.now()}-${idx}`,
//   //         rank: p.pathway_rank || idx + 1,
//   //         steps: p.steps || [],
//   //       }));

//   //       setPathways(enriched);
//   //       setView('results');

//   //       // Save preferences
//   //       const prefsToSave = {
//   //         include_courses: payload.user_preferences.include_courses,
//   //         include_projects: payload.user_preferences.include_projects,
//   //         include_internships: payload.user_preferences.include_internships,
//   //         include_jobs: payload.user_preferences.include_jobs,
//   //       };
//   //       localStorage.setItem('user_pathway_preferences', JSON.stringify(prefsToSave));
//   //     } else {
//   //       const errorMsg = data.message || data.error || 'Failed to generate pathways. Please try again.';
//   //       setError(errorMsg);
//   //       setView('setup');
//   //     }
//   //   } catch (err) {
//   //     console.error('Pathway generation error:', err);
//   //     setError('Network error. Please check your connection and try again.');
//   //     setView('setup');
//   //   }
//   // };



//   const handleGenerate = async (formValues) => {
//   setView('generating');
//   setError(null);

//   if (!user?.id) {
//     setError('User not logged in');
//     setView('setup');
//     return;
//   }

//   //  CORRECT: Use 'formValues', not 'payload'
//   const apiPayload = {
//     user_id: user.id,
//     target_type: formValues.strategy_type, // 
//     ...(formValues.strategy_type === 'job_specific' && {
//       target_id: formValues.target_job_id,
//     }),
//     ...(formValues.strategy_type === 'role_specific' && {
//       target_role: formValues.target_role, // 
//     }),
//     user_preferences: {
//       include_courses: formValues.include_types.includes('course'),
//       include_projects: formValues.include_types.includes('project'),
//       include_internships: formValues.include_types.includes('internship'),
//       include_jobs: formValues.include_types.includes('job'),
//     },
//   };

//   console.log("the api payload ", apiPayload);

//   try {
//     const res = await fetch(`${BASE_URL}/pathways/v4/generate`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(apiPayload),
//     });

//     const data = await res.json();
//     if (data.success && Array.isArray(data.data?.pathways)) {
//       const enriched = data.data.pathways.map((p, idx) => ({
//         ...p,
//         pathway_id: p.pathway_id || `temp-${Date.now()}-${idx}`,
//         rank: idx + 1,
//         steps: p.steps || [],
//       }));
//       setPathways(enriched);
//       setView('results');
//     } else {
//       setError(data.message || 'Failed to generate pathways.');
//       setView('setup');
//     }
//   } catch (err) {
//     console.error('API Error:', err);
//     setError('Network error. Please try again.');
//     setView('setup');
//   }
// };

//   const handleExpand = (pathwayId) => {
//     setExpandedPathwayId(expandedPathwayId === pathwayId ? null : pathwayId);
//   };

//   const handleSelect = (pathwayId) => {
//     setSelectedPathwayId(pathwayId);
//     // Optional: redirect to detailed view
//     // navigate(`/pathways/${pathwayId}`);
//   };

//   return (
//     <MainLayout>
//       <div className="flex items-start justify-center min-h-screen px-2 bg-gray-100 lg:px-8">
//         <div className="flex-grow hidden lg:block"></div>

//         <div className="max-w-3xl mx-auto mt-2 w-full">
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
//               {view === 'results' ? 'Your Personalized Pathways' : 'Build Your Learning Pathway'}
//             </h1>
//             {view === 'results' && (
//               <p className="mt-2 text-gray-600">
//                 Top 3 pathways ranked by skill coverage and speed. Expand to see details.
//               </p>
//             )}

//             <div className="flex justify-end mt-4">
//               <button
//                 type="button"
//                 onClick={() => navigate("/student-dashboard")}
//                 className="px-6 py-2 font-medium text-gray-700 hover:text-gray-900"
//               >
//                 Go To Dashboard
//               </button>
//             </div>
//           </div>

//           {error && (
//             <div className="p-4 mb-6 text-red-700 border border-red-200 rounded-lg bg-red-50">
//               {error}
//             </div>
//           )}

//           {view === 'setup' && preferences && (
//             <PathwaySetupForm
//               onSubmit={handleGenerate}
//               initialValues={initialFormValues}
//               locationState={state}
//             />
//           )}

//           {view === 'generating' && <PathwayGenerationLoader />}

//           {view === 'results' && (
//             <div className="space-y-6">
//               {pathways.length > 0 ? (
//                 pathways.slice(0, 3).map((pathway) => (
//                   <PathwayCard
//                     key={pathway.pathway_id}
//                     pathway={pathway}
//                     isExpanded={expandedPathwayId === pathway.pathway_id}
//                     onExpand={handleExpand}
//                     onSelect={handleSelect}
//                   />
//                 ))
//               ) : (
//                 <div className="p-6 text-center bg-white rounded-xl">
//                   <p className="text-gray-600">No pathways generated.</p>
//                 </div>
//               )}

//               {selectedPathwayId && (
//                 <div className="p-4 text-center text-green-700 border border-green-200 rounded-lg bg-green-50">
//                   ✅ Pathway selected! You can start learning anytime from your dashboard.
//                 </div>
//               )}

//               <div className="flex justify-center mt-6">
//                 <button
//                   type="button"
//                   onClick={() => setView('setup')}
//                   className="px-6 py-2 font-medium text-gray-700 hover:text-gray-900"
//                 >
//                   ← Generate New Pathways
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Right Sidebar */}
//         <aside className="hidden lg:block w-full max-w-[350px] p-2 sticky top-4 h-fit">
//           <FeedRightSidebar />
//         </aside>

//         <div className="flex-grow hidden lg:block"></div>
//       </div>
//     </MainLayout>
//   );
// };

// export default MyPathway;


// // src/pages/MyPathway.jsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import MainLayout from '../components/layout/MainLayout';
// import FeedRightSidebar from '../pages/student/feed/FeedRightSidebar';
// import PathwaySetupForm from '../components/pathway/PathwaySetupForm';
// import PathwayGenerationLoader from '../components/pathway/PathwayGenerationLoader';
// import { useSelector } from "react-redux";

// const BASE_URL = import.meta.env.VITE_BASE_URL;

// const MyPathway = () => {
//   const [view, setView] = useState('setup');
//   const [preferences, setPreferences] = useState(null);
//   const [pathways, setPathways] = useState([]);
//   const [expandedPathwayId, setExpandedPathwayId] = useState(null);
//   const [selectedPathwayId, setSelectedPathwayId] = useState(null);
//   const [error, setError] = useState(null);

//   const navigate = useNavigate();
//   const location = useLocation();
//   const state = location.state || {};
//   const { user } = useSelector((state) => state.auth);

//   // Load preferences
//   useEffect(() => {
//     try {
//       const saved = localStorage.getItem('user_pathway_preferences');
//       if (saved) {
//         setPreferences(JSON.parse(saved));
//       } else {
//         const defaults = {
//           include_courses: true,
//           include_projects: true,
//           include_internships: true,
//           include_jobs: true,
//         };
//         setPreferences(defaults);
//         localStorage.setItem('user_pathway_preferences', JSON.stringify(defaults));
//       }
//     } catch (err) {
//       setPreferences({
//         include_courses: true,
//         include_projects: true,
//         include_internships: true,
//         include_jobs: true,
//       });
//     }
//   }, []);

//   // Initial form values
//   const initialFormValues = React.useMemo(() => {
//     const base = {
//       resource_priority: ["internship", "project", "course"],
//       max_timeline: 365,
//       min_timeline: 1,
//     };

//     const includeDefaults = {
//       course: true,
//       project: true,
//       internship: true,
//       job: true,
//     };

//     if (state.jobId || state.jobTitle) {
//       return {
//         ...base,
//         strategy: "job_specific",
//         target_job_id: state.jobId,
//         target_job_title: state.jobTitle,
//         target_company_name: state.companyName,
//         include_resources: includeDefaults,
//       };
//     }

//     if (state.roleName) {
//       return {
//         ...base,
//         strategy: "role_specific",
//         target_role_name: state.roleName,
//         include_resources: includeDefaults,
//       };
//     }

//     return {
//       ...base,
//       strategy: "job_specific",
//       include_resources: includeDefaults,
//     };
//   }, [state]);

//   // Generate pathways
//   const handleGenerate = async (formValues) => {
//     setView('generating');
//     setError(null);

//     if (!user?.id) {
//       setError('User not logged in');
//       setView('setup');
//       return;
//     }

//     const apiPayload = {
//       user_id: user.id,
//       target_type: formValues.strategy_type,
//       ...(formValues.strategy_type === 'job_specific' && {
//         target_id: formValues.target_job_id,
//       }),
//       ...(formValues.strategy_type === 'role_specific' && {
//         target_role: formValues.target_role,
//       }),
//       user_preferences: {
//         include_courses: formValues.include_types.includes('course'),
//         include_projects: formValues.include_types.includes('project'),
//         include_internships: formValues.include_types.includes('internship'),
//         include_jobs: formValues.include_types.includes('job'),
//       },
//     };

//     try {
//       const res = await fetch(`${BASE_URL}/pathways/v4/generate`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(apiPayload),
//       });

//       const data = await res.json();

//       if (data.success && Array.isArray(data.data?.pathways)) {
//         const enriched = data.data.pathways.map((p, idx) => ({
//           ...p,
//           pathway_id: p.pathway_id || `temp-${Date.now()}-${idx}`,
//           rank: idx + 1,
//           steps: p.steps || [],
//         }));

//         setPathways(enriched);
//         setView('results');
//       } else {
//         setError(data.message || 'Failed to generate pathways.');
//         setView('setup');
//       }
//     } catch (err) {
//       setError('Network error. Please try again.');
//       setView('setup');
//     }
//   };

//   const handleExpand = (id) => {
//     setExpandedPathwayId(expandedPathwayId === id ? null : id);
//   };

//   return (
//     <MainLayout>
//       <div className="flex items-start justify-center min-h-screen px-2 bg-gray-100 lg:px-8">

//         <div className="max-w-4xl mx-auto mt-4 w-full">

//           {/* HEADER */}
//           <div className="mb-6">
//             <h1 className="text-3xl font-bold text-gray-900">
//               {view === 'results'
//                 ? 'Your personalised pathways'
//                 : 'Build Your Learning Pathway'}
//             </h1>

//             <div className="flex justify-end mt-3">
//               <button
//                 onClick={() => navigate("/student-dashboard")}
//                 className="text-gray-600 hover:text-black"
//               >
//                 Go To Dashboard
//               </button>
//             </div>
//           </div>

//           {/* ERROR */}
//           {error && (
//             <div className="p-4 mb-4 text-red-700 bg-red-100 rounded">
//               {error}
//             </div>
//           )}

//           {/* SETUP */}
//           {view === 'setup' && preferences && (
//             <PathwaySetupForm
//               onSubmit={handleGenerate}
//               initialValues={initialFormValues}
//               locationState={state}
//             />
//           )}

//           {/* LOADING */}
//           {view === 'generating' && <PathwayGenerationLoader />}

//           {/* RESULTS UI */}
//           {view === 'results' && (
//             <div className="bg-white p-6 rounded-2xl shadow-sm">

//               <div className="space-y-4">
//                 {pathways.slice(0, 3).map((pathway, index) => {
//                   const colors = [
//                     "#6EB5DD",
//                     "#E8AC6E",
//                     "#888CE4",
//                   ];

//                   return (
//                     <div key={pathway.pathway_id}>

//                       {/* MAIN CARD */}
//                       <div
//                        style={{ backgroundColor: colors[index] }}
//                         className="text-white rounded-xl p-4 flex justify-between items-center cursor-pointer"
//                         onClick={() => handleExpand(pathway.pathway_id)}
//                       >
//                         <div className="flex items-center gap-3">
//                           <img
//                             src="pathway.png"
//                             className="w-10 h-10 rounded-md"
//                           />

//                           <div>
//                             <p className="font-semibold">
//                               Pathway {index + 1}
//                             </p>

//                             <div className="flex gap-2 mt-1 text-xs">
//                               <span className="bg-white/20 px-2 py-0.5 rounded">
//                                 Course, Internship, Project
//                               </span>
//                               <span className="bg-white/20 px-2 py-0.5 rounded">
//                                 {pathway.duration || "3 months"}
//                               </span>
//                             </div>
//                           </div>
//                         </div>

//                         <span className="text-xs bg-white text-gray-700 px-2 py-1 rounded-full">
//                           {pathway.skills_count || 21} Skills
//                         </span>
//                       </div>

//                       {/* EXPANDED */}
//                       {expandedPathwayId === pathway.pathway_id && (
//                         <div className="mt-2 space-y-3 pl-4">
//                           {pathway.steps.map((step, i) => (
//                             <div
//                               key={i}
//                               className="bg-gray-50 p-3 rounded-lg flex items-center gap-3"
//                             >
//                               <div className="w-8 h-8 bg-gray-300 rounded"></div>

//                               <div>
//                                 <p className="text-sm font-medium">
//                                   {step.title || "Graphic Design"}
//                                 </p>
//                                 <p className="text-xs text-gray-500">
//                                   {step.type || "Course"} • {step.duration || "1 month"}
//                                 </p>
//                               </div>
//                             </div>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* CTA */}
//               <div className="flex justify-center mt-6">
//                 <button className="bg-red-500 text-white px-6 py-2 rounded-full shadow hover:bg-red-600">
//                   Get Started
//                 </button>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* RIGHT SIDEBAR */}
//         <aside className="hidden lg:block w-[320px] ml-4 sticky top-4 h-fit">
//           <FeedRightSidebar />
//         </aside>
//       </div>
//     </MainLayout>
//   );
// };

// export default MyPathway;











































import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import FeedRightSidebar from '../pages/student/feed/FeedRightSidebar';
import PathwaySetupForm from '../components/pathway/PathwaySetupForm';
import PathwayGenerationLoader from '../components/pathway/PathwayGenerationLoader';
import { useSelector } from "react-redux";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const MyPathway = () => {
  const [view, setView] = useState('setup');
  const [preferences, setPreferences] = useState(null);
  const [pathways, setPathways] = useState([]);
  const [expandedPathwayId, setExpandedPathwayId] = useState(null);
  const [selectedPathwayId, setSelectedPathwayId] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const { user } = useSelector((state) => state.auth);

  // Load preferences
  useEffect(() => {
    try {
      const saved = localStorage.getItem('user_pathway_preferences');
      if (saved) {
        setPreferences(JSON.parse(saved));
      } else {
        const defaults = {
          include_courses: true,
          include_projects: true,
          include_internships: true,
          include_jobs: true,
        };
        setPreferences(defaults);
        localStorage.setItem('user_pathway_preferences', JSON.stringify(defaults));
      }
    } catch (err) {
      setPreferences({
        include_courses: true,
        include_projects: true,
        include_internships: true,
        include_jobs: true,
      });
    }
  }, []);

  // Initial form values
  const initialFormValues = React.useMemo(() => {
    const base = {
      resource_priority: ["internship", "project", "course"],
      max_timeline: 365,
      min_timeline: 1,
    };

    const includeDefaults = {
      course: true,
      project: true,
      internship: true,
      job: true,
    };

    if (state.jobId || state.jobTitle) {
      return {
        ...base,
        strategy: "job_specific",
        target_job_id: state.jobId,
        target_job_title: state.jobTitle,
        target_company_name: state.companyName,
        include_resources: includeDefaults,
      };
    }

    if (state.roleName) {
      return {
        ...base,
        strategy: "role_specific",
        target_role_name: state.roleName,
        include_resources: includeDefaults,
      };
    }

    return {
      ...base,
      strategy: "job_specific",
      include_resources: includeDefaults,
    };
  }, [state]);

  // Generate pathways
  const handleGenerate = async (formValues) => {
    setView('generating');
    setError(null);

    if (!user?.id) {
      setError('User not logged in');
      setView('setup');
      return;
    }

    const apiPayload = {
      user_id: user.id,
      target_type: formValues.strategy_type,
      ...(formValues.strategy_type === 'job_specific' && {
        target_id: formValues.target_job_id,
      }),
      ...(formValues.strategy_type === 'role_specific' && {
        target_role: formValues.target_role,
      }),
      user_preferences: {
        include_courses: formValues.include_types.includes('course'),
        include_projects: formValues.include_types.includes('project'),
        include_internships: formValues.include_types.includes('internship'),
        include_jobs: formValues.include_types.includes('job'),
      },
    };

    try {
      const res = await fetch(`${BASE_URL}/pathways/v4/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload),
      });

      const data = await res.json();

      if (data.success && Array.isArray(data.data?.pathways)) {
        const enriched = data.data.pathways.map((p, idx) => ({
          ...p,
          pathway_id: p.pathway_id || `temp-${Date.now()}-${idx}`,
          rank: idx + 1,
          steps: p.steps || [],
        }));

        setPathways(enriched);
        setView('results');
      } else {
        setError(data.message || 'Failed to generate pathways.');
        setView('setup');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      setView('setup');
    }
  };

  const handleExpand = (id) => {
    setExpandedPathwayId(expandedPathwayId === id ? null : id);
  };

  const handleSelect = async (pathwayId) => {
    try {
      setSelectedPathwayId(pathwayId);
    } catch (err) {
      console.error('Failed to select pathway:', err);
    }
  };

  // Helper to get step title based on type
  const getStepTitle = (step) => {
    if (step.type === 'job' || step.type === 'Job') {
      return step.job_title || step.title || step.name;
    } else if (step.type === 'internship' || step.type === 'Internship') {
      return step.internship_title || step.title || step.name;
    } else if (step.type === 'course' || step.type === 'Course') {
      return step.course_name || step.title || step.name;
    } else if (step.type === 'project' || step.type === 'Project') {
      return step.project_title || step.title || step.name;
    }
    return step.title || step.name;
  };

  // Helper to get company/organization name
  const getStepCompany = (step) => {
    return step.company_name || step.organization || step.provider || step.instructor;
  };

  return (
    <MainLayout>
      <div className="flex items-start justify-center min-h-screen px-2 bg-gray-100 lg:px-8">
        <div className="max-w-4xl mx-auto mt-4 w-full">
          {/* HEADER */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              {view === 'results'
                ? 'Your personalised pathways'
                : 'Build Your Learning Pathway'}
            </h1>

            <div className="flex justify-end mt-3">
              <button
                onClick={() => navigate("/student-dashboard")}
                className="text-gray-600 hover:text-black"
              >
                Go To Dashboard
              </button>
            </div>
          </div>

          {/* ERROR */}
          {error && (
            <div className="p-4 mb-4 text-red-700 bg-red-100 rounded">
              {error}
            </div>
          )}

          {/* SETUP */}
          {view === 'setup' && preferences && (
            <PathwaySetupForm
              onSubmit={handleGenerate}
              initialValues={initialFormValues}
              locationState={state}
            />
          )}

          {/* LOADING */}
          {view === 'generating' && <PathwayGenerationLoader />}

          {/* RESULTS UI - Dynamic from Backend */}
          {view === 'results' && (
            <div className="bg-white p-6 rounded-2xl shadow-sm">
              <div className="space-y-4">
                {pathways.length > 0 ? (
                  pathways.slice(0, 3).map((pathway, index) => {
                    const colors = [
                      "#6EB5DD", // Blue
                      "#E8AC6E", // Orange
                      "#888CE4", // Purple
                    ];

                    // Get resource types from pathway data
                    const resourceTypes = [];
                    if (pathway.steps) {
                      const types = new Set(pathway.steps.map(step => step.type));
                      types.forEach(type => resourceTypes.push(type));
                    }

                    return (
                      <div key={pathway.pathway_id}>
                        {/* MAIN CARD */}
                        <div
                          style={{ backgroundColor: colors[index] || "#6EB5DD" }}
                          className="text-white rounded-xl p-4 flex justify-between items-center cursor-pointer transition-all hover:shadow-md"
                          onClick={() => handleExpand(pathway.pathway_id)}
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src="/pathway.png"
                              alt="Pathway"
                              className="w-10 h-10 rounded-md object-cover"
                            />

                            <div>
                              <p className="font-semibold">
                                Pathway {pathway.rank || index + 1}
                              </p>

                              <div className="flex gap-2 mt-1 text-xs flex-wrap">
                                {resourceTypes.length > 0 ? (
                                  <span className="bg-white/20 px-2 py-0.5 rounded">
                                    {resourceTypes.join(', ')}
                                  </span>
                                ) : (
                                  <span className="bg-white/20 px-2 py-0.5 rounded">
                                    Course, Internship, Project
                                  </span>
                                )}
                                <span className="bg-white/20 px-2 py-0.5 rounded">
                                  {pathway.duration || pathway.total_duration || "3 months"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <span className="text-xs bg-white text-gray-700 px-2 py-1 rounded-full">
                            {pathway.skills_count || pathway.total_skills || 21} Skills
                          </span>
                        </div>

                        {/* EXPANDED DETAILS */}
                        {expandedPathwayId === pathway.pathway_id && (
                          <div className="mt-2 space-y-3 pl-4">
                            {pathway.steps && pathway.steps.length > 0 ? (
                              pathway.steps.map((step, i) => {
                                const stepTitle = getStepTitle(step);
                                const stepCompany = getStepCompany(step);
                                const stepType = step.type || step.resource_type;
                                const stepDuration = step.duration || step.estimated_duration;

                                return (
                                  <div
                                    key={i}
                                    className="bg-gray-50 p-3 rounded-lg flex items-center gap-3 hover:bg-gray-100 transition-colors"
                                  >
                                    <div className="w-8 h-8 bg-gray-300 rounded flex items-center justify-center text-sm">
                                      {stepType === 'job' || stepType === 'Job' ? '💼' :
                                       stepType === 'internship' || stepType === 'Internship' ? '🎓' :
                                       stepType === 'course' || stepType === 'Course' ? '📚' :
                                       stepType === 'project' || stepType === 'Project' ? '📁' : '📌'}
                                    </div>

                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900">
                                        {stepTitle || "Learning Resource"}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {stepType || "Resource"}
                                        {stepCompany && ` • ${stepCompany}`}
                                        {stepDuration && ` • ${stepDuration}`}
                                      </p>
                                    </div>

                                    {step.url && (
                                      <a
                                        href={step.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-600 hover:underline"
                                      >
                                        View
                                      </a>
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-center text-gray-500 py-4">
                                No steps available for this pathway
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-3 mt-4 pl-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelect(pathway.pathway_id);
                                }}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition-colors"
                              >
                                Select This Pathway
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors"
                              >
                                Download
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No pathways generated. Please try again.
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => setView('setup')}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full shadow hover:bg-gray-300 mr-3"
                >
                  Generate New Pathways
                </button>
                {selectedPathwayId && (
                  <button
                    onClick={() => navigate(`/pathways/${selectedPathwayId}`)}
                    className="bg-green-500 text-white px-6 py-2 rounded-full shadow hover:bg-green-600"
                  >
                    View Selected Pathway
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        {/* <aside className="hidden lg:block w-[320px] ml-4 sticky top-4 h-fit">
          <FeedRightSidebar />
        </aside> */}
      </div>
    </MainLayout>
  );
};

export default MyPathway;