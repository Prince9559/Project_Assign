// // src/pages/AiLearningPage.jsx
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "../../components/ui";

// // Mock illustration (replace with real asset)
// import AiProfileIllustration1 from "../../assets/AiProfileIllustration1.png";

// export default function AiLearningPage() {
//     const navigate = useNavigate();
//     const [loadingState, setLoadingState] = useState("generating"); // "generating" | "loaded" | "empty"
//     const [predictionData, setPredictionData] = useState(null);

//     useEffect(() => {
//         const saved = localStorage.getItem("aiPredictionResult");
//         if (!saved) {
//             // No data → redirect to setup
//             navigate("/ai-company-role-setup", { replace: true });
//             return;
//         }

//         try {
//             const data = JSON.parse(saved);
//             setPredictionData(data);

//             // Simulate "processing" for better UX (even if instant)
//             const timer = setTimeout(() => {
//                 setLoadingState("loaded");
//             }, 1200);

//             return () => clearTimeout(timer);
//         } catch (e) {
//             console.error("Invalid prediction data", e);
//             navigate("/ai-company-role-setup", { replace: true });
//         }
//     }, [navigate]);

//     // Handle empty recommendations
//     useEffect(() => {
//         if (predictionData && loadingState === "loaded") {
//             const { recommended } = predictionData;
//             const hasContent = 
//                 (recommended?.domains?.length > 0) || 
//                 (recommended?.skills_to_learn?.length > 0);

//             if (!hasContent) {
//                 setLoadingState("empty");
//             }
//         }
//     }, [predictionData, loadingState]);

//     // --- Render States ---

//     // 🔄 Generating Animation
//     if (loadingState === "generating") {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4">
//                 <div className="text-center max-w-md">
//                     {/* Illustration */}
//                     <div className="w-32 h-32 mx-auto mb-6">
//                         <img
//                             src={AiProfileIllustration1}
//                             alt="AI"
//                             className="w-full h-full object-contain"
//                         />
//                     </div>

//                     {/* Animated progress bar */}
//                     <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
//                         <div className="h-full bg-blue-500 rounded-full animate-pulse"
//                              style={{ width: "65%", transition: "width 1.2s ease-in-out" }}></div>
//                     </div>

//                     <h2 className="text-xl font-bold text-gray-800 mb-2">
//                         Building Your Personalized Roadmap
//                     </h2>
//                     <p className="text-gray-600">
//                         Analyzing {predictionData?.input?.companies?.length || 0} companies & {predictionData?.input?.job_roles?.length || 0} roles...
//                     </p>
//                 </div>
//             </div>
//         );
//     }

//     // 🚫 Empty State
//     if (loadingState === "empty") {
//         return (
//             <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
//                 <div className="text-center max-w-md">
//                     <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
//                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.318 0-4.292-.967-5.828-2.586" />
//                         </svg>
//                     </div>
//                     <h2 className="text-xl font-bold text-gray-800 mb-2">
//                         No Skills to Recommend
//                     </h2>
//                     <p className="text-gray-600 mb-6">
//                         You already know all the key skills for your target roles! 🎉  
//                         Want to explore new domains?
//                     </p>
//                     <Button
//                         onClick={() => navigate("/ai-company-role-setup")}
//                         className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
//                     >
//                         Try New Targets
//                     </Button>
//                 </div>
//             </div>
//         );
//     }

//     // ✅ Loaded State
//     if (loadingState === "loaded" && predictionData) {
//         const { strategy, input = {}, recommended = {} } = predictionData;
//         const domains = recommended.domains || [];
//         const skills = recommended.skills_to_learn || [];

//         return (
//             <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-12">
//                 {/* Header */}
//                 <div className="bg-white shadow-sm">
//                     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//                             <div>
//                                 <h1 className="text-2xl font-bold text-gray-900">Your AI Learning Roadmap</h1>
//                                 <p className="mt-1 text-sm text-gray-500">
//                                     {strategy === "company_role" && (
//                                         <span>
//                                             Based on {input.companies?.length || 0} companies & {input.job_roles?.length || 0} roles
//                                         </span>
//                                     )}
//                                     {strategy === "job" && `For ${input.job?.job_role} at ${input.job?.company_name}`}
//                                     {strategy === "upskilling" && `Personalized upskilling plan`}
//                                 </p>
//                             </div>
//                             <Button
//                                 variant="outline"
//                                 onClick={() => navigate("/ai-company-role-setup")}
//                                 className="mt-3 sm:mt-0"
//                             >
//                                 Edit Targets
//                             </Button>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//                     {/* Top Summary Cards */}
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
//                         <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
//                             <p className="text-sm text-gray-500">Domains to Explore</p>
//                             <p className="text-2xl font-bold text-blue-600">{domains.length}</p>
//                         </div>
//                         <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
//                             <p className="text-sm text-gray-500">Skills to Learn</p>
//                             <p className="text-2xl font-bold text-indigo-600">{skills.length}</p>
//                         </div>
//                         <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
//                             <p className="text-sm text-gray-500">Priority Level</p>
//                             <div className="flex items-center">
//                                 {skills.filter(s => s.priority === "high").length > 0 ? (
//                                     <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
//                                         🔥 High ({skills.filter(s => s.priority === "high").length})
//                                     </span>
//                                 ) : (
//                                     <span className="text-gray-500 text-sm">None urgent</span>
//                                 )}
//                             </div>
//                         </div>
//                     </div>

//                     {/* Domains Section */}
//                     {domains.length > 0 && (
//                         <section className="mb-12">
//                             <div className="flex items-center mb-4">
//                                 <h2 className="text-xl font-bold text-gray-900 flex items-center">
//                                     <span className="w-2 h-6 bg-blue-500 rounded mr-2"></span>
//                                     Recommended Domains
//                                 </h2>
//                             </div>
//                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                                 {domains.map((domain, idx) => (
//                                     <div
//                                         key={domain.domain_id}
//                                         className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
//                                     >
//                                         <div className="flex items-start">
//                                             <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
//                                                 <span className="text-blue-700 font-bold text-sm">
//                                                     {idx + 1}
//                                                 </span>
//                                             </div>
//                                             <div className="ml-4">
//                                                 <h3 className="font-semibold text-gray-900">{domain.domain_name}</h3>
//                                                 <p className="text-sm text-gray-500 mt-1">
//                                                     {skills.filter(s => s.domain_id === domain.domain_id).length} skills to learn
//                                                 </p>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </section>
//                     )}

//                     {/* Skills Section */}
//                     {skills.length > 0 && (
//                         <section>
//                             <div className="flex items-center mb-4">
//                                 <h2 className="text-xl font-bold text-gray-900 flex items-center">
//                                     <span className="w-2 h-6 bg-indigo-500 rounded mr-2"></span>
//                                     Skills to Master
//                                 </h2>
//                             </div>
//                             <div className="space-y-3">
//                                 {skills.map((skill, idx) => {
//                                     const priorityColor = {
//                                         high: "bg-red-100 text-red-800 border-red-200",
//                                         medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
//                                         low: "bg-gray-100 text-gray-800 border-gray-200",
//                                     }[skill.priority] || "bg-gray-100";

//                                     return (
//                                         <div
//                                             key={skill.skill_id}
//                                             className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:shadow-sm transition-shadow"
//                                         >
//                                             <div className="flex items-start">
//                                                 <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3 mt-0.5">
//                                                     <span className="text-indigo-700 font-bold text-xs">{idx + 1}</span>
//                                                 </div>
//                                                 <div>
//                                                     <h3 className="font-medium text-gray-900">{skill.name}</h3>
//                                                     <p className="text-sm text-gray-500">{skill.domain_name}</p>
//                                                 </div>
//                                             </div>
//                                             <div className="mt-2 sm:mt-0 flex items-center space-x-2">
//                                                 {strategy === "company_role" && skill.demand > 0 && (
//                                                     <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
//                                                         💼 {skill.demand} jobs
//                                                     </span>
//                                                 )}
//                                                 <span className={`text-xs px-2 py-1 rounded-full border ${priorityColor}`}>
//                                                     {skill.priority === "high" && "❗ High Priority"}
//                                                     {skill.priority === "medium" && "🔶 Medium"}
//                                                     {skill.priority === "low" && "🔷 Low"}
//                                                 </span>
//                                             </div>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         </section>
//                     )}

//                     {/* CTA */}
//                     <div className="mt-12 text-center">
//                         <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                             Ready to Start Learning?
//                         </h3>
//                         <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
//                             We’ll soon integrate courses, projects, and competitions to help you master these skills.  
//                             Your learning journey is being prepared...
//                         </p>
//                         <div className="flex flex-col sm:flex-row justify-center gap-3">
//                             <Button
//                                 onClick={() => navigate("/courses")}
//                                 className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-md"
//                             >
//                                 Browse Courses
//                             </Button>
//                             <Button
//                                 variant="outline"
//                                 onClick={() => navigate("/pathways")}
//                                 className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
//                             >
//                                 View Learning Pathways
//                             </Button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     // Fallback
//     return null;
// }















// // src/pages/AiLearningPage.jsx
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "../../components/ui";
// import AiProfileIllustration1 from "../../assets/AiProfileIllustration1.png";

// export default function AiLearningPage() {
//     const navigate = useNavigate();
//     const [loadingState, setLoadingState] = useState("generating"); // "generating" | "loaded" | "empty"
//     const [predictionData, setPredictionData] = useState(null);

//     useEffect(() => {
//         const saved = localStorage.getItem("aiPredictionResult");
//         if (!saved) {
//             navigate("/ai-company-role-setup", { replace: true });
//             return;
//         }

//         try {
//             const data = JSON.parse(saved);
//             setPredictionData(data);

//             // Simulate "processing" for better UX
//             const timer = setTimeout(() => {
//                 setLoadingState("loaded");
//             }, 1200);

//             return () => clearTimeout(timer);
//         } catch (e) {
//             console.error("Invalid prediction data", e);
//             navigate("/ai-company-role-setup", { replace: true });
//         }
//     }, [navigate]);

//     // Handle empty recommendations
//     useEffect(() => {
//         if (predictionData && loadingState === "loaded") {
//             const { recommended } = predictionData;
//             const hasContent =
//                 (recommended?.domains?.length > 0) ||
//                 (recommended?.skills_to_learn?.length > 0);

//             if (!hasContent) {
//                 setLoadingState("empty");
//             }
//         }
//     }, [predictionData, loadingState]);

//     // --- Render States ---

//     // 🔄 Generating Animation
//     if (loadingState === "generating") {
//         return (
//             <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center p-4">
//                 <div className="text-center max-w-md">
//                     {/* Illustration */}
//                     <div className="w-32 h-32 mx-auto mb-6">
//                         <img
//                             src={AiProfileIllustration1}
//                             alt="AI"
//                             className="w-full h-full object-contain"
//                         />
//                     </div>

//                     {/* Animated progress bar */}
//                     <div className="w-48 h-2 bg-gray-200 rounded-full mx-auto mb-4 overflow-hidden">
//                         <div className="h-full bg-blue-500 rounded-full animate-pulse"
//                             style={{ width: "65%", transition: "width 1.2s ease-in-out" }}></div>
//                     </div>

//                     <h2 className="text-xl font-bold text-gray-800 mb-2">
//                         Building Your Personalized Roadmap
//                     </h2>
//                     <p className="text-gray-600">
//                         Analyzing {predictionData?.input?.companies?.length || 0} companies & {predictionData?.input?.job_roles?.length || 0} roles...
//                     </p>
//                 </div>
//             </div>
//         );
//     }

//     // 🚫 Empty State
//     if (loadingState === "empty") {
//         return (
//             <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
//                 <div className="text-center max-w-md">
//                     <div className="w-24 h-24 mx-auto mb-4 text-gray-400">
//                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.318 0-4.292-.967-5.828-2.586" />
//                         </svg>
//                     </div>
//                     <h2 className="text-xl font-bold text-gray-800 mb-2">
//                         No Skills to Recommend
//                     </h2>
//                     <p className="text-gray-600 mb-6">
//                         You already know all the key skills for your target roles! 🎉
//                         Want to explore new domains?
//                     </p>
//                     <Button
//                         onClick={() => navigate("/ai-company-role-setup")}
//                         className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md"
//                     >
//                         Try New Targets
//                     </Button>
//                 </div>
//             </div>
//         );
//     }

//     // ✅ Loaded State
//     if (loadingState === "loaded" && predictionData) {
//         const { strategy, input = {}, recommended = {} } = predictionData;
//         const domains = recommended.domains || [];
//         const skillsToLearn = recommended.skills_to_learn || [];

//         // Group skills by domain
//         const skillsByDomain = {};
//         skillsToLearn.forEach(skill => {
//             if (!skillsByDomain[skill.domain_id]) {
//                 skillsByDomain[skill.domain_id] = [];
//             }
//             skillsByDomain[skill.domain_id].push(skill);
//         });

//         // Get mastered skills (from gap_analysis)
//         const masteredSkills = (predictionData.gap_analysis?.mastered || []).reduce((acc, s) => {
//             acc[s.skill_id] = s;
//             return acc;
//         }, {});

//         return (
//             <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-12">
//                 {/* Header */}
//                 <div className="bg-white shadow-sm">
//                     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//                         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
//                             <div>
//                                 <h1 className="text-2xl font-bold text-gray-900">Your AI Learning Roadmap</h1>
//                                 <p className="mt-1 text-sm text-gray-500">
//                                     {strategy === "company_role" && (
//                                         <span>
//                                             Based on {input.companies?.length || 0} companies & {input.job_roles?.length || 0} roles
//                                         </span>
//                                     )}
//                                     {strategy === "job" && `For ${input.job?.job_role} at ${input.job?.company_name}`}
//                                     {strategy === "upskilling" && `Personalized upskilling plan`}
//                                 </p>
//                             </div>
//                             <Button
//                                 variant="outline"
//                                 onClick={() => navigate("/ai-company-role-setup")}
//                                 className="mt-3 sm:mt-0"
//                             >
//                                 Edit Targets
//                             </Button>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

//                     {/* Summary Cards */}
//                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//                         <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
//                             <p className="text-sm text-gray-500">Domains to Explore</p>
//                             <p className="text-2xl font-bold text-blue-600">{domains.length}</p>
//                         </div>
//                         <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
//                             <p className="text-sm text-gray-500">Skills to Learn</p>
//                             <p className="text-2xl font-bold text-indigo-600">{skillsToLearn.length}</p>
//                         </div>
//                         <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
//                             <p className="text-sm text-gray-500">Mastered Skills</p>
//                             <p className="text-2xl font-bold text-green-600">{Object.keys(masteredSkills).length}</p>
//                         </div>
//                     </div>

//                     {/* Domain Cards */}
//                     <div className="space-y-6">
//                         {domains.map((domain, idx) => {
//                             const domainSkills = skillsByDomain[domain.domain_id] || [];
//                             const masteredInDomain = domainSkills.filter(skill => masteredSkills[skill.skill_id]);
//                             const toLearnInDomain = domainSkills.filter(skill => !masteredSkills[skill.skill_id]);

//                             return (
//                                 <div
//                                     key={domain.domain_id}
//                                     className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
//                                 >
//                                     {/* Domain Header */}
//                                     <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
//                                         <div className="flex items-center">
//                                             <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center mr-3">
//                                                 <span className="text-blue-600 font-bold text-sm">{idx + 1}</span>
//                                             </div>
//                                             <h2 className="text-xl font-bold text-white">{domain.domain_name}</h2>
//                                         </div>
//                                     </div>

//                                     {/* Skills Section */}
//                                     <div className="p-6 space-y-4">
//                                         {/* Mastered Skills */}
//                                         {masteredInDomain.length > 0 && (
//                                             <div className="mb-4">
//                                                 <h3 className="text-sm font-semibold text-gray-500 mb-2">✅ Mastered ({masteredInDomain.length})</h3>
//                                                 <div className="space-y-2">
//                                                     {masteredInDomain.map(skill => (
//                                                         <div
//                                                             key={skill.skill_id}
//                                                             className="flex items-center p-2 bg-gray-50 rounded-md text-sm text-gray-500 line-through"
//                                                         >
//                                                             <span className="mr-2">✔️</span>
//                                                             {skill.name}
//                                                         </div>
//                                                     ))}
//                                                 </div>
//                                             </div>
//                                         )}

//                                         {/* Skills to Learn */}
//                                         {toLearnInDomain.length > 0 && (
//                                             <div>
//                                                 <h3 className="text-sm font-semibold text-gray-700 mb-2">🔥 Skills to Learn ({toLearnInDomain.length})</h3>
//                                                 <div className="space-y-2">
//                                                     {toLearnInDomain.map(skill => {
//                                                         const priorityColor = {
//                                                             high: "bg-red-100 text-red-800 border-red-200",
//                                                             medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
//                                                             low: "bg-gray-100 text-gray-800 border-gray-200",
//                                                         }[skill.priority] || "bg-gray-100";

//                                                         return (
//                                                             <div
//                                                                 key={skill.skill_id}
//                                                                 className={`flex items-center p-2 rounded-md border ${priorityColor} hover:shadow-sm transition-shadow`}
//                                                             >
//                                                                 <span className="mr-2 text-xs font-medium px-1.5 py-0.5 rounded-full bg-white text-gray-700">
//                                                                     {skill.priority === "high" ? "❗" : skill.priority === "medium" ? "🔶" : "🔷"}
//                                                                 </span>
//                                                                 <span className="flex-1">{skill.name}</span>
//                                                                 {strategy === "company_role" && skill.demand > 0 && (
//                                                                     <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
//                                                                         💼 {skill.demand}
//                                                                     </span>
//                                                                 )}
//                                                             </div>
//                                                         );
//                                                     })}
//                                                 </div>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>

//                     {/* CTA */}
//                     <div className="mt-12 text-center">
//                         <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                             Ready to Start Learning?
//                         </h3>
//                         <p className="text-gray-600 mb-4 max-w-2xl mx-auto">
//                             We’ll soon integrate courses, projects, and competitions to help you master these skills.
//                             Your learning journey is being prepared...
//                         </p>
//                         <div className="flex flex-col sm:flex-row justify-center gap-3">
//                             <Button
//                                 onClick={() => navigate("/courses")}
//                                 className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-md"
//                             >
//                                 Browse Courses
//                             </Button>
//                             <Button
//                                 variant="outline"
//                                 onClick={() => navigate("/pathways")}
//                                 className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
//                             >
//                                 View Learning Pathways
//                             </Button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         );
//     }

//     return null;
// }



// // src/components/AiLearningCard.jsx (rename if needed)
// import React, { useState, useEffect } from "react";
// import { FaEye, FaCheck, FaClock } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";

// const AiLearningCard = () => {
//     const navigate = useNavigate();
//     const [domainsWithSkills, setDomainsWithSkills] = useState([]);

//     // Load prediction data from localStorage
//     useEffect(() => {
//         const saved = localStorage.getItem("aiPredictionResult");
//         if (!saved) {
//             navigate("/ai-company-role-setup", { replace: true });
//             return;
//         }

//         try {
//             const data = JSON.parse(saved);

//             // Extract domains & skills
//             const domains = data.recommended?.domains || [];
//             const skillsToLearn = data.recommended?.skills_to_learn || [];
//             const mastered = data.gap_analysis?.mastered || [];

//             // Group skills by domain
//             const grouped = domains.map((domain, idx) => {
//                 const domainSkills = [
//                     ...skillsToLearn.filter(s => s.domain_id === domain.domain_id),
//                     ...mastered.filter(s => s.domain_id === domain.domain_id)
//                 ];

//                 // Assign color based on index (cycle through your 3 colors)
//                 const bgColor = [
//                     "bg-[#6EB5DD]",
//                     "bg-[#E8AC6E]",
//                     "bg-[#888CE4]"
//                 ][idx % 3];

//                 const tagColor = [
//                     "bg-[#4599C8]",
//                     "bg-[#C57829]",
//                     "bg-[#5B60CD]"
//                 ][idx % 3];

//                 return {
//                     id: domain.domain_id,
//                     title: domain.domain_name,
//                     bgColor,
//                     tagColor,
//                     skills: domainSkills.map(skill => ({
//                         id: skill.skill_id,
//                         name: skill.name,
//                         isMastered: !!mastered.find(m => m.skill_id === skill.skill_id),
//                         demand: skill.demand || 0
//                     }))
//                 };
//             });

//             setDomainsWithSkills(grouped);
//         } catch (e) {
//             console.error("Failed to parse AI data", e);
//             navigate("/ai-company-role-setup");
//         }
//     }, [navigate]);

//     return (
//         <div className="bg-white shadow-md flex flex-col w-[347px] h-[543px] rounded-[10px] p-[20px_10px] gap-[30px] opacity-1">
//             {/* Title */}
//             <h2 className="text-2xl font-bold text-black">Your Roadmap</h2>
//             <p className="text-sm text-gray-500">AI-recommended domains</p>

//             {/* Domain & Skills List */}
//             <div className="flex flex-col gap-6 mt-4 overflow-y-auto">
//                 {domainsWithSkills.length === 0 ? (
//                     <div className="text-gray-500 text-center py-6">Loading domains...</div>
//                 ) : (
//                     domainsWithSkills.map((domain) => (
//                         <div key={domain.id}>
//                             {/* Domain as "Course Title" */}
//                             <div className="mb-1">
//                                 <h3 className="text-lg font-bold text-gray-800">{domain.title}</h3>
//                             </div>

//                             {/* Skills as "Course Items" */}
//                             <div className="space-y-3">
//                                 {domain.skills.map((skill) => (
//                                     <div
//                                         key={skill.id}
//                                         className={`${domain.bgColor} text-white rounded-lg p-4 flex flex-col gap-3`}
//                                     >
//                                         {/* Top Row */}
//                                         <div className="flex items-center gap-3">
//                                             <div className="w-12 h-12 rounded-md bg-white bg-opacity-20 flex items-center justify-center">
//                                                 {skill.isMastered ? (
//                                                     <FaCheck className="text-white text-lg" />
//                                                 ) : (
//                                                     <FaClock className="text-white text-lg" />
//                                                 )}
//                                             </div>
//                                             <div>
//                                                 <h4 className="text-base font-semibold">{skill.name}</h4>
//                                                 <p className="text-xs text-gray-100">
//                                                     {skill.isMastered ? "Completed" : "To learn"}
//                                                 </p>
//                                             </div>
//                                             <div className="ml-auto flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-full">
//                                                 <FaEye className="text-gray-600 text-xs" />
//                                                 <span className="text-[10px] text-gray-700">Skill</span>
//                                             </div>
//                                         </div>

//                                         {/* Bottom Row */}
//                                         <div className="flex items-center gap-3">
//                                             <span className={`${domain.tagColor} px-3 py-1 rounded-md text-xs`}>
//                                                 {skill.isMastered ? "Completed" : "To Learn"}
//                                             </span>
//                                             {skill.demand > 0 && (
//                                                 <span className="bg-white text-gray-800 px-3 py-1 rounded-md text-xs">
//                                                     💼 {skill.demand} jobs
//                                                 </span>
//                                             )}
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         </div>
//                     ))
//                 )}
//             </div>
//         </div>
//     );
// };

// export default AiLearningCard;











// src/pages/AiLearningPage.jsx
import React, { useState, useEffect } from "react";
import { FaEye, FaPalette, FaFont, FaRegImage, FaCheck, FaClock, FaGraduationCap, FaProjectDiagram, FaTrophy } from "react-icons/fa";
import MainLayout from "../../components/layout/MainLayout";
import { useNavigate } from "react-router-dom";

const AiLearningPage = () => {
    const navigate = useNavigate();
    const [domainsData, setDomainsData] = useState([]);
    const [activeDomainIndex, setActiveDomainIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    // Load AI prediction data from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("aiPredictionResult");
        if (!saved) {
            navigate("/ai-company-role", { replace: true });
            return;
        }

        try {
            const data = JSON.parse(saved);

            const domains = data.recommended?.domains || [];
            const skillsToLearn = data.recommended?.skills_to_learn || [];
            const mastered = data.gap_analysis?.mastered || [];

            const processed = domains.map((domain, idx) => {
                const domainSkills = [
                    ...skillsToLearn.filter(s => s.domain_id === domain.domain_id),
                    ...mastered.filter(s => s.domain_id === domain.domain_id)
                ].map(skill => ({
                    skill_id: skill.skill_id,
                    name: skill.name,
                    isMastered: !!mastered.find(m => m.skill_id === skill.skill_id),
                    priority: skill.priority,
                    demand: skill.demand || 0,
                }));

                // Mock learners & duration (replace later with real data)
                const learners = `${Math.floor(Math.random() * 150) + 30}k learners`;
                const duration = domainSkills.length > 6 ? "12 weeks" : domainSkills.length > 3 ? "8 weeks" : "4 weeks";

                return {
                    domain_id: domain.domain_id,
                    domain_name: domain.domain_name || `Domain ${domain.domain_id}`,
                    skills: domainSkills,
                    learners,
                    duration,
                };
            });

            setDomainsData(processed);
            if (processed.length > 0) setActiveDomainIndex(0);
            setLoading(false);
        } catch (e) {
            console.error("Failed to parse AI data", e);
            navigate("/ai-company-role");
        }
    }, [navigate]);

    const activeDomain = domainsData[activeDomainIndex] || {
        domain_name: "Loading...",
        skills: [],
        learners: "— learners",
        duration: "— weeks",
    };

    // Domain icon helper
    const getDomainIcon = (name) => {
        const n = name.toLowerCase();
        if (n.includes("design") || n.includes("ui") || n.includes("ux")) return <FaPalette className="text-white text-xl" />;
        if (n.includes("web") || n.includes("frontend") || n.includes("javascript") || n.includes("development")) return <FaFont className="text-white text-xl" />;
        if (n.includes("data") || n.includes("analytics") || n.includes("science")) return <FaRegImage className="text-white text-xl" />;
        if (n.includes("devops") || n.includes("cloud")) return <FaProjectDiagram className="text-white text-xl" />;
        if (n.includes("mobile")) return <FaMobile className="text-white text-xl" />;
        return <FaGraduationCap className="text-white text-xl" />;
    };

    // ===== SIDEBAR SECTION =====
    const SidebarSection = () => (
        <aside className="w-full lg:w-[425px] p-4 bg-white rounded-lg shadow-sm h-fit">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Your Learning Plan</h2>

            {domainsData.length === 0 ? (
                <p className="text-gray-500 italic">No domains loaded.</p>
            ) : (
                <div className="space-y-3">
                    {domainsData.map((domain, idx) => (
                        <div
                            key={domain.domain_id}
                            className={`p-3 rounded-lg border cursor-pointer transition ${idx === activeDomainIndex
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-gray-200 hover:bg-gray-50"
                                }`}
                            onClick={() => setActiveDomainIndex(idx)}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                                    {getDomainIcon(domain.domain_name)}
                                </div>
                                <div>
                                    <h3 className="font-medium text-gray-900">{domain.domain_name}</h3>
                                    <p className="text-xs text-gray-500">
                                        {domain.skills.filter(s => !s.isMastered).length} to learn
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2">Learning Paths</h3>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                        <FaGraduationCap className="text-gray-500" />
                        <span>Lessons</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <FaProjectDiagram className="text-gray-500" />
                        <span>Projects</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        <FaTrophy className="text-gray-500" />
                        <span>Competitions</span>
                    </div>
                </div>
            </div>
        </aside>
    );

    // ===== MAIN CARD SECTION =====
    const MainCardSection = () => (
        <div
            className="bg-white shadow-md flex flex-col"
            style={{
                width: "759px",
                minHeight: "903px",
                borderRadius: "10px",
                padding: "20px 24px",
                gap: "20px",
            }}
        >
            {/* Domain Header */}
            <div
                className="flex flex-col"
                style={{
                    width: "681px",
                    borderRadius: "10px",
                    background: "#6EB5DD",
                    padding: "16px 20px",
                }}
            >
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-md bg-white bg-opacity-20 flex items-center justify-center">
                        {getDomainIcon(activeDomain.domain_name)}
                    </div>
                    <div className="flex flex-col text-white">
                        <h2 className="text-lg font-semibold">{activeDomain.domain_name}</h2>
                        <p className="text-sm">{activeDomain.learners}</p>
                    </div>

                    <div className="ml-auto flex items-center gap-2 bg-white px-3 py-1 rounded-full">
                        <FaEye className="text-gray-600 text-sm" />
                        <span className="text-xs text-gray-700">Skills</span>
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-2">
                    <span className="bg-white/70 px-3 py-1 text-xs rounded-full text-gray-700">
                        Lesson
                    </span>
                    <span className="bg-white/70 px-3 py-1 text-xs rounded-full text-gray-700">
                        {activeDomain.duration}
                    </span>
                </div>
            </div>

            {/* Skills List */}
            <div>
                <h3 className="font-semibold text-gray-900 mb-2">Skills</h3>
                <ul className="list-disc ml-6 text-gray-700 text-sm space-y-1">
                    {loading ? (
                        <li className="text-gray-500">Loading skills...</li>
                    ) : activeDomain.skills.length === 0 ? (
                        <li className="text-gray-500 italic">No skills recommended for this domain.</li>
                    ) : (
                        activeDomain.skills.map((skill, idx) => (
                            <li
                                key={skill.skill_id || idx}
                                className={skill.isMastered ? "text-green-600 line-through" : ""}
                            >
                                {skill.isMastered ? (
                                    <>
                                        <FaCheck className="inline mr-1 text-green-500 text-xs align-middle" />
                                        {skill.name} <span className="text-xs">(Mastered)</span>
                                    </>
                                ) : (
                                    <>
                                        <FaClock className="inline mr-1 text-gray-500 text-xs align-middle" />
                                        {skill.name}
                                        {skill.priority && (
                                            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800">
                                                {skill.priority === "high" ? "High" :
                                                    skill.priority === "medium" ? "Medium" : "Low"}
                                            </span>
                                        )}
                                        {skill.demand > 0 && (
                                            <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                                                💼 {skill.demand}
                                            </span>
                                        )}
                                    </>
                                )}
                            </li>
                        ))
                    )}
                </ul>
            </div>

            {/* About Section */}
            <div>
                <h3 className="font-semibold text-gray-900 mb-2">About This Roadmap</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                    This roadmap is generated by our AI based on your target companies and job roles.
                    It highlights the most in-demand skills you need to master to become job-ready.
                </p>
                <p className="text-sm text-gray-700 mt-2">
                    ✅ Skills you’ve already added to your profile are marked as <span className="text-green-600 font-medium">Mastered</span>.
                </p>
                <p className="text-sm text-gray-700 mt-1">
                    Focus on the remaining skills — we’ll soon link them to courses, projects, and competitions.
                </p>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center mt-4">
                <button
                    className="bg-red-500 hover:bg-red-600 text-white px-8 py-2.5 rounded-full shadow-md transition"
                    onClick={() => alert("Coming soon: Course integration!")}
                >
                    Start Learning
                </button>
            </div>
        </div>
    );

    // ===== RENDER =====
    return (
        <MainLayout>
            <div className="flex flex-col lg:flex-row justify-center bg-gray-100 min-h-screen px-2 lg:px-8 py-6 gap-6">
                {/* Sidebar */}
                <SidebarSection />

                {/* Spacer on large screens */}
                <div className="hidden lg:block flex-grow"></div>

                {/* Main Card */}
                <MainCardSection />

                {/* Spacer on large screens */}
                <div className="hidden lg:block flex-grow"></div>
            </div>
        </MainLayout>
    );
};

export default AiLearningPage;