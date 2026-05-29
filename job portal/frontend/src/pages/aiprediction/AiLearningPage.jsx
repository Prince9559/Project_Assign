// // src/pages/AiLearningPage.jsx
// import React, { useState, useEffect } from "react";
// import {
//     FaEye,
//     FaPalette,
//     FaFont,
//     FaRegImage,
//     FaProjectDiagram,
//     FaGraduationCap,
//     FaCheck,
//     FaClock,
// } from "react-icons/fa";
// import MainLayout from "../../components/layout/MainLayout";
// import { useNavigate } from "react-router-dom";

// const AiLearningPage = () => {
//     const navigate = useNavigate();
//     const [domainsData, setDomainsData] = useState([]);
//     const [activeDomainIndex, setActiveDomainIndex] = useState(0);
//     const [skillsExpanded, setSkillsExpanded] = useState(false);
//     const [loading, setLoading] = useState(true);

//     // Load AI prediction data from localStorage
//     useEffect(() => {
//         const saved = localStorage.getItem("aiPredictionResult");
//         if (!saved) {
//             navigate("/ai-company-role", { replace: true });
//             return;
//         }

//         try {
//             const data = JSON.parse(saved);

//             const domains = data.recommended?.domains || [];
//             const skillsToLearn = data.recommended?.skills_to_learn || [];
//             const mastered = data.gap_analysis?.mastered || [];

//             const processed = domains.map((domain) => {
//                 const domainSkills = [
//                     ...skillsToLearn.filter((s) => s.domain_id === domain.domain_id),
//                     ...mastered.filter((s) => s.domain_id === domain.domain_id),
//                 ].map((skill) => ({
//                     skill_id: skill.skill_id,
//                     name: skill.name,
//                     isMastered: !!mastered.find((m) => m.skill_id === skill.skill_id),
//                     priority: skill.priority,
//                     demand: skill.demand || 0,
//                 }));

//                 const learners = `${Math.floor(Math.random() * 150) + 30}k learners`;
//                 const duration =
//                     domainSkills.length > 6
//                         ? "12 weeks"
//                         : domainSkills.length > 3
//                             ? "8 weeks"
//                             : "4 weeks";

//                 return {
//                     domain_id: domain.domain_id,
//                     domain_name: domain.domain_name || `Domain ${domain.domain_id}`,
//                     skills: domainSkills,
//                     learners,
//                     duration,
//                     tag: "Lesson", // fallback
//                 };
//             });

//             setDomainsData(processed);
//             if (processed.length > 0) setActiveDomainIndex(0);
//             setLoading(false);
//         } catch (e) {
//             console.error("Failed to parse AI data", e);
//             navigate("/ai-company-role");
//         }
//     }, [navigate]);

//     const activeDomain = domainsData[activeDomainIndex] || {
//         domain_name: "Loading...",
//         skills: [],
//         learners: "— learners",
//         duration: "— weeks",
//         tag: "Lesson",
//     };

//     // Domain icon helper (no icons for mobile — not used here)
//     const getDomainIcon = (name) => {
//         const n = name.toLowerCase();
//         if (n.includes("design") || n.includes("ui") || n.includes("ux")) return <FaPalette />;
//         if (n.includes("web") || n.includes("frontend") || n.includes("javascript") || n.includes("development")) return <FaFont />;
//         if (n.includes("data") || n.includes("analytics") || n.includes("science")) return <FaRegImage />;
//         if (n.includes("devops") || n.includes("cloud")) return <FaProjectDiagram />;
//         return <FaGraduationCap />;
//     };

//     // Priority badge
//     const renderPriorityBadge = (priority) => {
//         if (!priority) return null;
//         const bgMap = {
//             high: "bg-red-100 text-red-800",
//             medium: "bg-yellow-100 text-yellow-800",
//             low: "bg-green-100 text-green-800",
//         };
//         const textMap = {
//             high: "High",
//             medium: "Medium",
//             low: "Low",
//         };
//         return (
//             <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${bgMap[priority]}`}>
//                 {textMap[priority]}
//             </span>
//         );
//     };

//     // Demand badge (text only)
//     const renderDemandBadge = (demand) => {
//         if (!demand || demand <= 0) return null;
//         return (
//             <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
//                 Demand: {demand}
//             </span>
//         );
//     };

//     // ===== SIDEBAR =====
//     const SidebarSection = () => (
//         <aside className="w-full lg:w-[425px] p-4 bg-white rounded-lg shadow-sm h-fit">
//             <h2 className="text-lg font-bold text-gray-900 mb-4">Your Learning Plan</h2>

//             {domainsData.length === 0 ? (
//                 <p className="text-gray-500 italic">No domains loaded.</p>
//             ) : (
//                 <div className="space-y-3">
//                     {domainsData.map((domain, idx) => {
//                         const toLearnCount = domain.skills.filter((s) => !s.isMastered).length;
//                         return (
//                             <div
//                                 key={domain.domain_id}
//                                 className={`p-3 rounded-lg border cursor-pointer transition ${idx === activeDomainIndex
//                                         ? "border-blue-500 bg-blue-50"
//                                         : "border-gray-200 hover:bg-gray-50"
//                                     }`}
//                                 onClick={() => {
//                                     setActiveDomainIndex(idx);
//                                     setSkillsExpanded(false); // reset expansion on switch
//                                 }}
//                             >
//                                 <div className="flex items-center gap-3">
//                                     <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
//                                         {getDomainIcon(domain.domain_name)}
//                                     </div>
//                                     <div>
//                                         <h3 className="font-medium text-gray-900">{domain.domain_name}</h3>
//                                         <p className="text-xs text-gray-500">{toLearnCount} to learn</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         );
//                     })}
//                 </div>
//             )}

//             <div className="mt-6 pt-4 border-t border-gray-200">
//                 <h3 className="font-semibold text-gray-800 mb-2">Learning Paths</h3>
//                 <div className="space-y-2">
//                     <div className="flex items-center gap-2 text-sm">
//                         <FaGraduationCap className="text-gray-500" />
//                         <span className="text-gray-700">Lessons</span>
//                     </div>
//                     <div className="flex items-center gap-2 text-sm">
//                         <FaProjectDiagram className="text-gray-500" />
//                         <span className="text-gray-700">Projects</span>
//                     </div>
//                     <div className="flex items-center gap-2 text-sm">
//                         <FaGraduationCap className="text-gray-500" /> {/* reuse icon */}
//                         <span className="text-gray-700">Competitions</span>
//                     </div>
//                 </div>
//             </div>
//         </aside>
//     );

//     // ===== MAIN CARD =====
//     const MainCardSection = () => (
//         <div className="bg-white shadow-md flex flex-col w-[759px] min-h-[903px] rounded-[10px] p-6 gap-6">
//             {/* Domain Header (Expandable) */}
//             <div
//                 className="flex flex-col cursor-pointer rounded-[10px] bg-[#6EB5DD] p-5"
//                 onClick={() => setSkillsExpanded((prev) => !prev)}
//             >
//                 {/* Header Top */}
//                 <div className="flex items-center gap-4">
//                     <div className="w-16 h-16 rounded-md bg-white bg-opacity-20 flex items-center justify-center text-white">
//                         {getDomainIcon(activeDomain.domain_name)}
//                     </div>
//                     <div className="flex flex-col text-white">
//                         <h2 className="text-lg font-semibold">{activeDomain.domain_name}</h2>
//                         <p className="text-sm opacity-90">{activeDomain.learners}</p>
//                     </div>

//                     <div className="ml-auto flex items-center gap-2 bg-white bg-opacity-80 px-3 py-1 rounded-full">
//                         <FaEye className="text-gray-700 text-sm" />
//                         <span className="text-xs text-gray-800">Skills</span>
//                     </div>
//                 </div>

//                 {/* Header Bottom: Tags */}
//                 <div className="flex items-center gap-3 mt-3">
//                     <span className="bg-white/70 px-3 py-1 text-xs rounded-full text-gray-800">
//                         {activeDomain.tag}
//                     </span>
//                     <span className="bg-white/70 px-3 py-1 text-xs rounded-full text-gray-800">
//                         {activeDomain.duration}
//                     </span>
//                 </div>

//                 {/* Expanded Skills */}
//                 {skillsExpanded && activeDomain.skills.length > 0 && (
//                     <div className="mt-4 space-y-1 max-h-48 overflow-y-auto">
//                         {activeDomain.skills.map((skill) => (
//                             <div
//                                 key={skill.skill_id || skill.name}
//                                 className={`flex items-center justify-between px-3 py-2 rounded text-sm ${skill.isMastered ? "bg-[#6EB5DD] bg-opacity-50 text-green-600 line-through" : "bg-[#6EB5DD] bg-opacity-30 text-white"
//                                     }`}
//                             >
//                                 <span>{skill.name}</span>
//                                 {skill.isMastered ? (
//                                     <FaCheck className="text-green-400" />
//                                 ) : (
//                                     <FaClock className="text-white/80" />
//                                 )}
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>

//             {/* Skills List (Persistent, detailed) */}
//             <div>
//                 <h3 className="font-semibold text-gray-900 mb-2">Skills</h3>
//                 <ul className="list-disc pl-5 text-gray-700 text-sm space-y-1">
//                     {loading ? (
//                         <li className="text-gray-500">Loading skills...</li>
//                     ) : activeDomain.skills.length === 0 ? (
//                         <li className="text-gray-500 italic">No skills recommended for this domain.</li>
//                     ) : (
//                         activeDomain.skills.map((skill) => (
//                             <li
//                                 key={skill.skill_id || skill.name}
//                                 className={skill.isMastered ? "text-green-600 line-through" : ""}
//                             >
//                                 {skill.isMastered ? (
//                                     <>
//                                         <FaCheck className="inline mr-1 text-green-500 text-xs align-middle" />
//                                         {skill.name} <span className="text-xs text-gray-500">(Mastered)</span>
//                                     </>
//                                 ) : (
//                                     <>
//                                         <FaClock className="inline mr-1 text-gray-500 text-xs align-middle" />
//                                         {skill.name}
//                                         {renderPriorityBadge(skill.priority)}
//                                         {renderDemandBadge(skill.demand)}
//                                     </>
//                                 )}
//                             </li>
//                         ))
//                     )}
//                 </ul>
//             </div>

//             {/* About Section */}
//             <div>
//                 <h3 className="font-semibold text-gray-900 mb-2">About This Roadmap</h3>
//                 <p className="text-sm text-gray-700 leading-relaxed">
//                     This roadmap is generated by our AI based on your target companies and job roles.
//                     It highlights the most in-demand skills you need to master to become job-ready.
//                 </p>
//                 <p className="text-sm text-gray-700 mt-2">
//                     ✅ Skills you’ve already added to your profile are marked as{" "}
//                     <span className="text-green-600 font-medium">Mastered</span>.
//                 </p>
//                 <p className="text-sm text-gray-700 mt-1">
//                     Focus on the remaining skills — we’ll soon link them to courses, projects, and competitions.
//                 </p>
//             </div>

//             {/* CTA Button */}
//             <div className="flex justify-center mt-2">
//                 <button
//                     className="bg-red-500 hover:bg-red-600 text-white px-8 py-2.5 rounded-full shadow-md transition"
//                     onClick={() => alert("Coming soon: Course integration!")}
//                 >
//                     Start Learning
//                 </button>
//             </div>
//         </div>
//     );

//     return (
//         <MainLayout>
//             <div className="flex flex-col lg:flex-row justify-center bg-gray-100 min-h-screen px-2 lg:px-8 py-6 gap-6">
//                 <SidebarSection />
//                 <div className="hidden lg:block flex-grow"></div>
//                 <MainCardSection />
//                 <div className="hidden lg:block flex-grow"></div>
//             </div>
//         </MainLayout>
//     );
// };

// export default AiLearningPage;










// import React, { useState, useEffect } from "react";
// import { FaEye, FaPalette, FaFont, FaRegImage, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
// import MainLayout from "../../components/layout/MainLayout";
// import CoursePart from "./CoursePart"; // assuming this is the sidebar component

// const AiLearningPage = () => {
//     const [prediction, setPrediction] = useState(null);
//     const [open, setOpen] = useState(false);

//     // Load prediction from localStorage on mount
//     useEffect(() => {
//         const stored = localStorage.getItem("aiPredictionResult");
//         if (stored) {
//             try {
//                 const parsed = JSON.parse(stored);
//                 setPrediction(parsed.data || parsed); // support both {data: ...} and raw data
//             } catch (e) {
//                 console.error("Failed to parse aiPrediction from localStorage", e);
//             }
//         }
//     }, []);

//     // Fallback content if no prediction yet
//     if (!prediction) {
//         return (
//             <MainLayout>
//                 <div className="flex justify-center items-center min-h-screen bg-gray-100">
//                     <p className="text-gray-600">Loading AI recommendations...</p>
//                 </div>
//             </MainLayout>
//         );
//     }

//     // Extract data safely
//     const { strategy, job, input, gap_analysis, recommended } = prediction;

//     // Derived UI props
//     const isJobStrategy = strategy === "job";
//     const isCompanyRoleStrategy = strategy === "company_role";
//     const isUpskillingStrategy = strategy === "upskilling";

//     const title = isJobStrategy
//         ? job?.job_role || "Target Role"
//         : isCompanyRoleStrategy
//             ? "Custom Learning Path"
//             : "Personalized Upskilling Plan";

//     const subtitle = isJobStrategy
//         ? `at ${job?.company_name || "Top Companies"}`
//         : isCompanyRoleStrategy
//             ? `${input?.job_roles?.join(", ")} roles @ ${input?.companies?.join(", ") || "Selected Companies"}`
//             : `Based on your ${input?.user_skill_count || 0} skills`;

//     const bgColor = isJobStrategy
//         ? "bg-[#6EB5DD]" // job → blue
//         : isCompanyRoleStrategy
//             ? "bg-[#E8AC6E]" // company → orange
//             : "bg-[#888CE4]"; // upskilling → purple

//     const tagColor = isJobStrategy
//         ? "bg-[#4599C8]"
//         : isCompanyRoleStrategy
//             ? "bg-[#C57829]"
//             : "bg-[#5B60CD]";

//     const mastered = gap_analysis?.mastered || [];
//     const missing = gap_analysis?.missing || [];
//     const skillsToLearn = recommended?.skills_to_learn || [];
//     const domains = recommended?.domains || [];

//     const total = gap_analysis?.total_required || (mastered.length + missing.length);
//     const matchPct = gap_analysis?.match_percentage || 0;

//     return (
//         <MainLayout>
//             <div className="flex justify-center bg-gray-100 min-h-screen px-2 lg:px-8 items-start pt-4">
//                 {/* Left Sidebar */}
//                 <aside className="hidden lg:block w-[425px] max-w-[425px] p-2 sticky top-4 h-fit ml-4">
//                     <CoursePart />
//                 </aside>

//                 <div className="hidden lg:block flex-grow"></div>

//                 {/* Main Card */}
//                 <div
//                     className="bg-white shadow-md flex flex-col"
//                     style={{
//                         width: "759px",
//                         minHeight: "903px",
//                         borderRadius: "10px",
//                         padding: "20px 24px",
//                         gap: "20px",
//                     }}
//                 >
//                     {/* Header */}
//                     <div
//                         className={`flex flex-col cursor-pointer ${bgColor} rounded-lg p-5`}
//                         onClick={() => setOpen((prev) => !prev)}
//                     >
//                         <div className="flex items-center gap-4">
//                             <div className="w-16 h-16 rounded-md bg-white/20 flex items-center justify-center">
//                                 <span className="text-white font-bold text-xl">
//                                     {title.charAt(0)}
//                                 </span>
//                             </div>
//                             <div className="flex flex-col text-white">
//                                 <h2 className="text-xl font-semibold">{title}</h2>
//                                 <p className="text-sm opacity-90">{subtitle}</p>
//                             </div>

//                             <div className="ml-auto flex items-center gap-2 bg-white/30 px-3 py-1 rounded-full">
//                                 <FaEye className="text-white text-sm" />
//                                 <span className="text-xs text-white">Skills</span>
//                             </div>
//                         </div>

//                         {/* Progress & Summary */}
//                         <div className="mt-3">
//                             <div className="flex justify-between text-white text-xs mb-1">
//                                 <span>Match: {matchPct}%</span>
//                                 <span>
//                                     {mastered.length} mastered • {missing.length} to learn
//                                 </span>
//                             </div>
//                             <div className="w-full bg-white/30 rounded-full h-2">
//                                 <div
//                                     className="h-full bg-white rounded-full"
//                                     style={{ width: `${matchPct}%` }}
//                                 ></div>
//                             </div>
//                         </div>

//                         {/* Type & Duration */}
//                         <div className="flex items-center gap-3 mt-3">
//                             <span className={`${tagColor} px-3 py-1 rounded-md text-xs`}>
//                                 {isJobStrategy
//                                     ? "Target Role"
//                                     : isCompanyRoleStrategy
//                                         ? "Multi-Company Path"
//                                         : "Upskilling Plan"}
//                             </span>
//                             <span className="bg-white/30 text-white px-3 py-1 rounded-md text-xs">
//                                 {total > 0
//                                     ? `${total} total skills`
//                                     : "Personalized"}
//                             </span>
//                         </div>

//                         {/* Collapsible Skills */}
//                         {open && (
//                             <div className="flex flex-col mt-3 rounded-md overflow-hidden transition-all duration-300 max-h-60 overflow-y-auto">
//                                 {mastered.slice(0, 5).map((s) => (
//                                     <div
//                                         key={s.skill_id}
//                                         className="flex items-center justify-between bg-white/20 px-4 py-2 text-xs"
//                                     >
//                                         <div className="flex items-center">
//                                             <FaCheckCircle className="text-green-300 mr-2" />
//                                             <span>{s.name}</span>
//                                         </div>
//                                         <span className="bg-white/20 px-2 py-0.5 rounded">{s.domain_name}</span>
//                                     </div>
//                                 ))}
//                                 {mastered.length > 5 && (
//                                     <div className="text-center text-xs py-1 bg-white/10">
//                                         +{mastered.length - 5} more mastered
//                                     </div>
//                                 )}
//                             </div>
//                         )}
//                     </div>

//                     {/* Skills Gap */}
//                     <div>
//                         <h3 className="font-semibold text-gray-900 mb-2">Skill Gap</h3>

//                         {/* Missing Skills */}
//                         {missing.length > 0 && (
//                             <div className="mb-4">
//                                 <h4 className="text-gray-700 font-medium text-sm mb-1 flex items-center">
//                                     <FaTimesCircle className="text-red-500 mr-1" /> To Learn ({missing.length})
//                                 </h4>
//                                 <div className="flex flex-wrap gap-2">
//                                     {missing.slice(0, 8).map((s) => (
//                                         <span
//                                             key={s.skill_id}
//                                             className="px-3 py-1 bg-red-50 text-red-700 text-xs rounded-full border border-red-200"
//                                         >
//                                             {s.name}
//                                         </span>
//                                     ))}
//                                     {missing.length > 8 && (
//                                         <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
//                                             +{missing.length - 8} more
//                                         </span>
//                                     )}
//                                 </div>
//                             </div>
//                         )}

//                         {/* Recommended Domains */}
//                         {domains.length > 0 && (
//                             <div className="mb-4">
//                                 <h4 className="text-gray-700 font-medium text-sm mb-1">Recommended Domains</h4>
//                                 <div className="flex flex-wrap gap-2">
//                                     {domains.map((d) => (
//                                         <span
//                                             key={d.domain_id}
//                                             className="px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
//                                         >
//                                             {d.domain_name}
//                                         </span>
//                                     ))}
//                                 </div>
//                             </div>
//                         )}
//                     </div>

//                     {/* Recommended Learning */}
//                     {skillsToLearn.length > 0 && (
//                         <div>
//                             <h3 className="font-semibold text-gray-900 mb-2">
//                                 Recommended Skills to Learn
//                             </h3>
//                             <ul className="space-y-2">
//                                 {skillsToLearn.slice(0, 6).map((s, i) => (
//                                     <li
//                                         key={s.skill_id || i}
//                                         className="flex items-start justify-between p-2 bg-gray-50 rounded"
//                                     >
//                                         <div>
//                                             <span className="font-medium text-sm">{s.name}</span>
//                                             <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded">
//                                                 {s.domain_name}
//                                             </span>
//                                         </div>
//                                         <span
//                                             className={`px-2 py-0.5 text-xs rounded ${s.priority === "high"
//                                                     ? "bg-red-100 text-red-700"
//                                                     : s.priority === "medium"
//                                                         ? "bg-yellow-100 text-yellow-800"
//                                                         : "bg-green-100 text-green-700"
//                                                 }`}
//                                         >
//                                             {s.priority}
//                                         </span>
//                                     </li>
//                                 ))}
//                             </ul>
//                             {skillsToLearn.length > 6 && (
//                                 <p className="text-xs text-gray-500 mt-2">
//                                     +{skillsToLearn.length - 6} more recommended skills
//                                 </p>
//                             )}
//                         </div>
//                     )}

//                     {/* About / Contextual Description */}
//                     <div>
//                         <h3 className="font-semibold text-gray-900 mb-2">
//                             {isJobStrategy
//                                 ? "About This Role"
//                                 : isCompanyRoleStrategy
//                                     ? "About This Learning Path"
//                                     : "Your Upskilling Journey"}
//                         </h3>
//                         <p className="text-sm text-gray-700 leading-relaxed">
//                             {isJobStrategy
//                                 ? `This role typically requires mastery of ${total} core skills. You've already mastered ${mastered.length}. Focus on the highlighted gaps to become job-ready.`
//                                 : isCompanyRoleStrategy
//                                     ? `This learning path is built from real job requirements across ${input?.companies?.length || 0} companies and ${input?.job_roles?.length || 0} roles. Prioritize high-priority skills to maximize job fit.`
//                                     : `Based on your current skills, we recommend expanding within your existing domains or exploring high-demand adjacent areas. Start with high-priority skills for fastest career impact.`}
//                         </p>
//                     </div>

//                     {/* Apply / Start Learning Button */}
//                     <div className="flex justify-center mt-4">
//                         <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2 rounded-full shadow-md transition flex items-center gap-2">
//                             <span>Start Learning</span>
//                             <svg
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 className="h-4 w-4"
//                                 fill="none"
//                                 viewBox="0 0 24 24"
//                                 stroke="currentColor"
//                             >
//                                 <path
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     strokeWidth={2}
//                                     d="M13 7l5 5m0 0l-5 5m5-5H6"
//                                 />
//                             </svg>
//                         </button>
//                     </div>
//                 </div>

//                 <div className="hidden lg:block flex-grow"></div>
//             </div>
//         </MainLayout>
//     );
// };

// export default AiLearningPage;



































// import React, { useState, useEffect } from "react";
// import { FaEye, FaPalette, FaFont, FaRegImage } from "react-icons/fa";
// import MainLayout from "../../components/layout/MainLayout";

// // 🔹 INLINE: CoursesCard (your sidebar — renamed to CoursesSection)
// const CoursesSection = ({ aiData }) => {
//     // Map strategy → course-like items (3 cards)
//     const getCourseData = () => {
//         if (!aiData) {
//             return [
//                 { id: 1, title: "Graphic Design", tag: "Lesson", duration: "8 weeks", bgColor: "bg-[#6EB5DD]", tagColor: "bg-[#4599C8]" },
//                 { id: 2, title: "Graphic Design", tag: "Competition", duration: "4 days", bgColor: "bg-[#E8AC6E]", tagColor: "bg-[#C57829]" },
//                 { id: 3, title: "Graphic Design", tag: "Project", duration: "2 weeks", bgColor: "bg-[#888CE4]", tagColor: "bg-[#5B60CD]" },
//             ];
//         }

//         const baseTitle = aiData.job?.job_role || "Learning Path";
//         const learners = "122,263 learners";

//         return [
//             {
//                 id: 1,
//                 title: baseTitle,
//                 learners,
//                 tag: "Lesson",
//                 duration: "8 weeks",
//                 bgColor: "bg-[#6EB5DD]",
//                 tagColor: "bg-[#4599C8]",
//             },
//             {
//                 id: 2,
//                 title: baseTitle,
//                 learners,
//                 tag: "Competition",
//                 duration: "4 days",
//                 bgColor: "bg-[#E8AC6E]",
//                 tagColor: "bg-[#C57829]",
//             },
//             {
//                 id: 3,
//                 title: baseTitle,
//                 learners,
//                 tag: "Project",
//                 duration: "2 weeks",
//                 bgColor: "bg-[#888CE4]",
//                 tagColor: "bg-[#5B60CD]",
//             },
//         ];
//     };

//     const courses = getCourseData();

//     return (
//         <div className="bg-white shadow-md flex flex-col w-[347px] h-[543px] top-[99px] ml-40 rounded-[10px] p-[20px_10px] gap-[30px] opacity-1">
//             {/* Title */}
//             <h2 className="text-2xl font-bold text-black">Courses</h2>
//             <p className="text-sm text-gray-500">
//                 Recommended paths for {aiData?.job?.job_role || "your goal"}
//             </p>

//             {/* Course List */}
//             <div className="flex flex-col gap-6 mt-4">
//                 {courses.map((course) => (
//                     <div
//                         key={course.id}
//                         className={`${course.bgColor} text-white rounded-lg p-4 flex flex-col gap-3`}
//                     >
//                         {/* Top Row */}
//                         <div className="flex items-center gap-3">
//                             <img
//                                 src="https://via.placeholder.com/50"
//                                 alt="course"
//                                 className="w-12 h-12 rounded-md object-cover"
//                             />
//                             <div>
//                                 <h3 className="text-base font-semibold">{course.title}</h3>
//                                 <p className="text-xs text-gray-100">{course.learners}</p>
//                             </div>
//                             <div className="ml-auto flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-full">
//                                 <FaEye className="text-gray-600 text-xs" />
//                                 <span className="text-[10px] text-gray-700">Skills</span>
//                             </div>
//                         </div>

//                         {/* Bottom Row */}
//                         <div className="flex items-center gap-3">
//                             <span className={`${course.tagColor} px-3 py-1 rounded-md text-xs`}>
//                                 {course.tag}
//                             </span>
//                             <span className="bg-white text-gray-800 px-3 py-1 rounded-md text-xs">
//                                 {course.duration}
//                             </span>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// // 🔹 MAIN PAGE
// const AiLearningPage = () => {
//     const [open, setOpen] = useState(false);
//     const [aiData, setAiData] = useState(null);

//     useEffect(() => {
//         const stored = localStorage.getItem("aiPredictionResult");
//         if (stored) {
//             try {
//                 const parsed = JSON.parse(stored);
//                 // Handle: res.data.data (Axios) OR res.data (direct)
//                 const data = parsed.data?.data || parsed.data || parsed;
//                 setAiData(data);
//             } catch (e) {
//                 console.error("AI Prediction parse failed", e);
//             }
//         }
//     }, []);

//     // Fallback static data if none
//     const title = aiData?.job?.job_role || "Graphic Design";
//     const companyName = aiData?.job?.company_name || "Top Companies";
//     const learners = "122,263 learners";
//     const strategy = aiData?.strategy || "job";
//     const bgColor = strategy === "job"
//         ? "bg-[#6EB5DD]"
//         : strategy === "company_role"
//             ? "bg-[#E8AC6E]"
//             : "bg-[#888CE4]";
//     const tagColor = strategy === "job"
//         ? "bg-[#4599C8]"
//         : strategy === "company_role"
//             ? "bg-[#C57829]"
//             : "bg-[#5B60CD]";

//     // Collapsible skills (mastered + high-priority missing)
//     const skillsToShow = [];
//     if (aiData) {
//         const mastered = aiData.gap_analysis?.mastered || [];
//         const missing = (aiData.recommended?.skills_to_learn || aiData.gap_analysis?.missing || []).filter(s => s.priority === "high");
//         const combined = [...mastered.slice(0, 2), ...missing.slice(0, 3)];
//         combined.forEach((s) => {
//             let icon = <FaEye className="text-xs" />;
//             const nameLower = s.name?.toLowerCase() || "";
//             if (nameLower.includes("color")) icon = <FaPalette />;
//             else if (nameLower.includes("typo") || nameLower.includes("font")) icon = <FaFont />;
//             else if (nameLower.includes("photo") || nameLower.includes("image") || nameLower.includes("figma")) icon = <FaRegImage />;
//             skillsToShow.push({ name: s.name || "Skill", icon });
//         });
//     }

//     // Skills list (static as per your design — or replace with dynamic later)
//     const staticSkills = [
//         "Fundamentals of Visual Design",
//         "Design for Print & Digital",
//         "Design for Digital",
//         "Brand Identity Design",
//         "Portfolio Development",
//         "Motion Graphics",
//         "Brand Promotion & Communication",
//     ];

//     return (
//         <MainLayout>
//             <div className="flex justify-center bg-gray-100 min-h-screen px-0 lg:px-4 py-4">
//                 {/* 🔹 LEFT: Courses Sidebar (your CoursesCard) */}
//                 <div className="w-full lg:w-auto lg:mr-6">
//                     <CoursesSection aiData={aiData} />
//                 </div>

//                 {/* 🔹 CENTER: Main Content (your GraphicDesignCard) */}
//                 <div
//                     className="bg-white shadow-md flex flex-col"
//                     style={{
//                         width: "759px",
//                         minHeight: "903px",
//                         borderRadius: "10px",
//                         padding: "20px 24px",
//                         gap: "20px",
//                     }}
//                 >
//                     {/* Header */}
//                     <div
//                         className={`flex flex-col cursor-pointer ${bgColor}`}
//                         style={{
//                             width: "681px",
//                             borderRadius: "10px",
//                             padding: "16px 20px",
//                         }}
//                         onClick={() => setOpen((prev) => !prev)}
//                     >
//                         <div className="flex items-center gap-4">
//                             <img
//                                 src="https://via.placeholder.com/60"
//                                 alt="course"
//                                 className="w-16 h-16 rounded-md object-cover"
//                             />
//                             <div className="flex flex-col text-white">
//                                 <h2 className="text-lg font-semibold">{title}</h2>
//                                 <p className="text-sm">
//                                     {learners} • {companyName}
//                                 </p>
//                             </div>

//                             <div className="ml-auto flex items-center gap-2 bg-white px-3 py-1 rounded-full">
//                                 <FaEye className="text-gray-600 text-sm" />
//                                 <span className="text-xs text-gray-700">Skills</span>
//                             </div>
//                         </div>

//                         <div className="flex items-center gap-4 mt-2">
//                             <span className={`${tagColor} px-3 py-1 text-xs rounded-full text-gray-700 bg-white/70`}>
//                                 {strategy === "job" ? "Lesson" : strategy === "company_role" ? "Competition" : "Project"}
//                             </span>
//                             <span className="bg-white/70 px-3 py-1 text-xs rounded-full text-gray-700">
//                                 {strategy === "job" ? "8 weeks" : strategy === "company_role" ? "4 days" : "2 weeks"}
//                             </span>
//                         </div>

//                         {/* Dynamic Skills Dropdown */}
//                         {aiData && skillsToShow.length > 0 && open && (
//                             <div className="flex flex-col mt-3 rounded-b-md overflow-hidden transition-all duration-300">
//                                 {skillsToShow.map((s, i) => (
//                                     <button
//                                         key={i}
//                                         className="flex items-center justify-between bg-[#6EB5DDCC] px-4 py-2"
//                                     >
//                                         <span>{s.name}</span>
//                                         {s.icon}
//                                     </button>
//                                 ))}
//                             </div>
//                         )}
//                     </div>

//                     {/* Skills List */}
//                     <div>
//                         <h3 className="font-semibold text-gray-900 mb-2">Skills</h3>
//                         <ul className="list-disc ml-6 text-gray-700 text-sm space-y-1">
//                             {staticSkills.map((skill, i) => (
//                                 <li key={i}>{skill}</li>
//                             ))}
//                         </ul>
//                     </div>

//                     {/* About */}
//                     <div>
//                         <h3 className="font-semibold text-gray-900 mb-2">About the course</h3>
//                         <p className="text-sm text-gray-700 leading-relaxed">
//                             Our {title} courses teach you how to visualise an idea from a concept to
//                             impactful communications. Learn to design brand identities, web pages,
//                             social media posts, brochures, etc. Create a portfolio based on real-world
//                             projects and get hired by top brands.
//                         </p>
//                         <p className="text-sm text-gray-700 mt-2">
//                             Get a unique classroom-like learning experience with interactive online sessions.
//                         </p>
//                         <p className="text-sm text-gray-700 mt-1">
//                             Lectures by leading faculties and dedicated mentorship by industry professionals.
//                         </p>
//                         <p className="text-sm text-gray-700 mt-1">
//                             Best-in-class placement support and job guarantee.
//                         </p>
//                         <p className="text-sm text-gray-700 mt-1">
//                             Build a network of professionals and make lifelong connections.
//                         </p>
//                     </div>

//                     {/* Apply Button */}
//                     <div className="flex justify-center mt-4">
//                         <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-2 rounded-full shadow-md transition">
//                             Apply
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </MainLayout>
//     );
// };

// export default AiLearningPage;








// import React, { useState, useEffect } from "react";
// import { FaEye, FaPalette, FaFont, FaRegImage } from "react-icons/fa";
// import MainLayout from "../../components/layout/MainLayout";

// // 🔹 Helper: Get icon for skill name
// const getSkillIcon = (name) => {
//     const lower = name.toLowerCase();
//     if (lower.includes("typo") || lower.includes("font")) return <FaFont />;
//     if (lower.includes("color") || lower.includes("palette")) return <FaPalette />;
//     if (lower.includes("photo") || lower.includes("image") || lower.includes("figma") || lower.includes("psd")) return <FaRegImage />;
//     if (lower.includes("html") || lower.includes("css") || lower.includes("js") || lower.includes("react") || lower.includes("bootstrap")) return <span className="text-xs">Aa</span>;
//     return <FaEye className="text-xs" />;
// };

// // 🔹 Sidebar: Domain Cards (replaces CoursesCard)
// const DomainSidebar = ({ domains, selectedDomain, onSelect }) => {
//     // Mock learners count — you can replace with real data later
//     const learners = "122,263 learners";

//     return (
//         <div className="bg-white shadow-md flex flex-col w-[347px] h-[543px] top-[99px] ml-40 rounded-[10px] p-[20px_10px] gap-[30px] opacity-1">
//             {/* Title */}
//             <h2 className="text-2xl font-bold text-black">Courses</h2>
//             <p className="text-sm text-gray-500">Your learning path</p>

//             {/* Domain Cards */}
//             <div className="flex flex-col gap-6 mt-4">
//                 {domains.map((domain, idx) => {
//                     // Assign color by index (cycle through your 3 colors)
//                     const colors = [
//                         { bg: "bg-[#6EB5DD]", tag: "bg-[#4599C8]" },
//                         { bg: "bg-[#E8AC6E]", tag: "bg-[#C57829]" },
//                         { bg: "bg-[#888CE4]", tag: "bg-[#5B60CD]" },
//                     ];
//                     const color = colors[idx % colors.length];

//                     return (
//                         <div
//                             key={domain.domain_id}
//                             className={`${color.bg} text-white rounded-lg p-4 flex flex-col gap-3 cursor-pointer hover:opacity-90`}
//                             onClick={() => onSelect(domain)}
//                         >
//                             {/* Top Row */}
//                             <div className="flex items-center gap-3">
//                                 <img
//                                     src="https://via.placeholder.com/50"
//                                     alt={domain.domain_name}
//                                     className="w-12 h-12 rounded-md object-cover"
//                                 />
//                                 <div>
//                                     <h3 className="text-base font-semibold">{domain.domain_name}</h3>
//                                     <p className="text-xs text-gray-100">{learners}</p>
//                                 </div>
//                                 <div className="ml-auto flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-full">
//                                     <FaEye className="text-gray-600 text-xs" />
//                                     <span className="text-[10px] text-gray-700">Skills</span>
//                                 </div>
//                             </div>

//                             {/* Bottom Row */}
//                             <div className="flex items-center gap-3">
//                                 <span className={`${color.tag} px-3 py-1 rounded-md text-xs`}>
//                                     Lesson
//                                 </span>
//                                 <span className="bg-white text-gray-800 px-3 py-1 rounded-md text-xs">
//                                     8 weeks
//                                 </span>
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>
//         </div>
//     );
// };

// // 🔹 Main Panel: Domain Details + Skills
// const DomainDetails = ({ domain, skills, masteredIds, onToggleSkills }) => {
//     const [showSkills, setShowSkills] = useState(false);

//     // Filter skills for this domain
//     const domainSkills = skills.filter(s => s.domain_id === domain.domain_id);
//     const mastered = domainSkills.filter(s => masteredIds.has(s.skill_id));
//     const missing = domainSkills.filter(s => !masteredIds.has(s.skill_id));

//     return (
//         <div
//             className="bg-white shadow-md flex flex-col"
//             style={{
//                 width: "759px",
//                 minHeight: "903px",
//                 borderRadius: "10px",
//                 padding: "20px 24px",
//                 gap: "20px",
//             }}
//         >
//             {/* Header */}
//             <div
//                 className={`flex flex-col cursor-pointer ${domain.bgColor || "bg-[#6EB5DD]"}`}
//                 style={{
//                     width: "681px",
//                     borderRadius: "10px",
//                     padding: "16px 20px",
//                 }}
//                 onClick={() => onToggleSkills()}
//             >
//                 <div className="flex items-center gap-4">
//                     <img
//                         src="https://via.placeholder.com/60"
//                         alt={domain.domain_name}
//                         className="w-16 h-16 rounded-md object-cover"
//                     />
//                     <div className="flex flex-col text-white">
//                         <h2 className="text-lg font-semibold">{domain.domain_name}</h2>
//                         <p className="text-sm">122,263 learners</p>
//                     </div>

//                     <div className="ml-auto flex items-center gap-2 bg-white px-3 py-1 rounded-full">
//                         <FaEye className="text-gray-600 text-sm" />
//                         <span className="text-xs text-gray-700">Skills</span>
//                     </div>
//                 </div>

//                 <div className="flex items-center gap-4 mt-2">
//                     <span className={`${domain.tagColor || "bg-[#4599C8]"} px-3 py-1 text-xs rounded-full text-gray-700 bg-white/70`}>
//                         Lesson
//                     </span>
//                     <span className="bg-white/70 px-3 py-1 text-xs rounded-full text-gray-700">
//                         8 weeks
//                     </span>
//                 </div>

//                 {/* Collapsible Skills List */}
//                 {showSkills && (
//                     <div className="mt-3 rounded-b-md overflow-hidden transition-all duration-300">
//                         {mastered.map((s) => (
//                             <div
//                                 key={s.skill_id}
//                                 className="flex items-center justify-between bg-white/20 px-4 py-2 border-b border-white/30"
//                             >
//                                 <div className="flex items-center">
//                                     <span className="text-white font-medium mr-2">✓</span>
//                                     <span>{s.name}</span>
//                                 </div>
//                                 <span className="text-white/80">{getSkillIcon(s.name)}</span>
//                             </div>
//                         ))}
//                         {missing.map((s) => (
//                             <div
//                                 key={s.skill_id}
//                                 className="flex items-center justify-between bg-white/10 px-4 py-2 border-b border-white/20"
//                             >
//                                 <span>{s.name}</span>
//                                 <span className="text-gray-400">{getSkillIcon(s.name)}</span>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>

//             {/* Static Skills List (as per your design) */}
//             <div>
//                 <h3 className="font-semibold text-gray-900 mb-2">Skills</h3>
//                 <ul className="list-disc ml-6 text-gray-700 text-sm space-y-1">
//                     <li>Fundamentals of Visual Design</li>
//                     <li>Design for Print & Digital</li>
//                     <li>Design for Digital</li>
//                     <li>Brand Identity Design</li>
//                     <li>Portfolio Development</li>
//                     <li>Motion Graphics</li>
//                     <li>Brand Promotion & Communication</li>
//                 </ul>
//             </div>

//             {/* About Course */}
//             <div>
//                 <h3 className="font-semibold text-gray-900 mb-2">About the course</h3>
//                 <p className="text-sm text-gray-700 leading-relaxed">
//                     Our {domain.domain_name} courses teach you how to visualise an idea from a
//                     concept to impactful communications. Learn to design brand identities,
//                     web pages, social media posts, brochures, etc. Create a portfolio
//                     based on real-world projects as part of the course and get hired by
//                     top brands.
//                 </p>
//                 <p className="text-sm text-gray-700 mt-2">
//                     Get a unique classroom-like learning experience with interactive
//                     online sessions.
//                 </p>
//                 <p className="text-sm text-gray-700 mt-1">
//                     Lectures by leading faculties and dedicated mentorship by industry
//                     professionals from around the world.
//                 </p>
//                 <p className="text-sm text-gray-700 mt-1">
//                     Our programmes come with best-in-class placement support/Job
//                     Guarantee.
//                 </p>
//                 <p className="text-sm text-gray-700 mt-1">
//                     Build a network of design professionals and make lifelong
//                     connections.
//                 </p>
//             </div>

//             {/* Apply Button */}
//             <div className="flex justify-center mt-4">
//                 <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-2 rounded-full shadow-md transition">
//                     Apply
//                 </button>
//             </div>
//         </div>
//     );
// };

// // 🔹 MAIN PAGE
// const AiLearningPage = () => {
//     const [aiData, setAiData] = useState(null);
//     const [selectedDomain, setSelectedDomain] = useState(null);

//     useEffect(() => {
//         const stored = localStorage.getItem("aiPredictionResult");
//         if (stored) {
//             try {
//                 const parsed = JSON.parse(stored);
//                 const data = parsed.data?.data || parsed.data || parsed;
//                 setAiData(data);
//             } catch (e) {
//                 console.error("Failed to parse aiPrediction", e);
//             }
//         }
//     }, []);

//     // Extract domains and skills
//     const domains = aiData?.recommended?.domains || [];
//     const allSkills = aiData?.recommended?.skills_to_learn || [];
//     const masteredIds = new Set(aiData?.gap_analysis?.mastered?.map(s => s.skill_id) || []);

//     // Set default domain on load
//     useEffect(() => {
//         if (domains.length > 0 && !selectedDomain) {
//             setSelectedDomain(domains[0]);
//         }
//     }, [domains, selectedDomain]);

//     if (!aiData) {
//         return (
//             <MainLayout>
//                 <div className="flex justify-center items-center min-h-screen bg-gray-100">
//                     <p className="text-gray-600">Loading AI recommendations...</p>
//                 </div>
//             </MainLayout>
//         );
//     }

//     return (
//         <MainLayout>
//             <div className="flex justify-center bg-gray-100 min-h-screen px-0 lg:px-4 py-4">
//                 {/* 🔹 LEFT: Domain Sidebar */}
//                 <div className="w-full lg:w-auto lg:mr-6">
//                     <DomainSidebar
//                         domains={domains}
//                         selectedDomain={selectedDomain}
//                         onSelect={setSelectedDomain}
//                     />
//                 </div>

//                 {/* 🔹 CENTER: Domain Details */}
//                 {selectedDomain && (
//                     <DomainDetails
//                         domain={selectedDomain}
//                         skills={allSkills}
//                         masteredIds={masteredIds}
//                         onToggleSkills={() => { }}
//                     />
//                 )}
//             </div>
//         </MainLayout>
//     );
// };

// export default AiLearningPage;

















// import React, { useState, useEffect } from "react";
// import { FaEye, FaPalette, FaFont, FaRegImage } from "react-icons/fa";
// import MainLayout from "../../components/layout/MainLayout";

// // 🔹 Helper: Get icon for skill name (no emojis)
// const getSkillIcon = (name) => {
//     const lower = name.toLowerCase();
//     if (lower.includes("typo") || lower.includes("font")) return <FaFont />;
//     if (lower.includes("color") || lower.includes("palette")) return <FaPalette />;
//     if (lower.includes("photo") || lower.includes("image") || lower.includes("figma") || lower.includes("psd")) return <FaRegImage />;
//     if (lower.includes("html") || lower.includes("css") || lower.includes("js") || lower.includes("react") || lower.includes("bootstrap")) return <span className="text-xs">Aa</span>;
//     return <FaEye className="text-xs" />;
// };

// // 🔹 Sidebar: Domain Cards (scrollable, fixed height)
// const DomainSidebar = ({ domains, selectedDomain, onSelect }) => {
//     const learners = "122,263 learners";

//     return (
//         <div className="bg-white shadow-md flex flex-col w-[347px] h-[543px] top-[99px] ml-40 rounded-[10px] p-[20px_10px] gap-[30px] opacity-1">
//             {/* Title */}
//             <h2 className="text-2xl font-bold text-black">Courses</h2>
//             <p className="text-sm text-gray-500">Your learning path</p>

//             {/* Scrollable Domain List */}
//             <div className="flex flex-col gap-6 mt-4 overflow-y-auto max-h-[400px]">
//                 {domains.map((domain, idx) => {
//                     // Assign color by index (cycle through your 3 colors)
//                     const colors = [
//                         { bg: "bg-[#6EB5DD]", tag: "bg-[#4599C8]" },
//                         { bg: "bg-[#E8AC6E]", tag: "bg-[#C57829]" },
//                         { bg: "bg-[#888CE4]", tag: "bg-[#5B60CD]" },
//                     ];
//                     const color = colors[idx % colors.length];

//                     return (
//                         <div
//                             key={domain.domain_id}
//                             className={`${color.bg} text-white rounded-lg p-4 flex flex-col gap-3 cursor-pointer hover:opacity-90`}
//                             onClick={() => onSelect(domain)}
//                         >
//                             {/* Top Row */}
//                             <div className="flex items-center gap-3">
//                                 <img
//                                     src="https://via.placeholder.com/50"
//                                     alt={domain.domain_name}
//                                     className="w-12 h-12 rounded-md object-cover"
//                                 />
//                                 <div>
//                                     <h3 className="text-base font-semibold">{domain.domain_name}</h3>
//                                     <p className="text-xs text-gray-100">{learners}</p>
//                                 </div>
//                                 <div className="ml-auto flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-full">
//                                     <FaEye className="text-gray-600 text-xs" />
//                                     <span className="text-[10px] text-gray-700">Skills</span>
//                                 </div>
//                             </div>

//                             {/* Bottom Row */}
//                             <div className="flex items-center gap-3">
//                                 <span className={`${color.tag} px-3 py-1 rounded-md text-xs`}>
//                                     Lesson
//                                 </span>
//                                 <span className="bg-white text-gray-800 px-3 py-1 rounded-md text-xs">
//                                     8 weeks
//                                 </span>
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>
//         </div>
//     );
// };

// // 🔹 Main Panel: Domain Details + Skills Toggle
// const DomainDetails = ({ domain, skills, masteredIds, onToggleSkills }) => {
//     const [showSkills, setShowSkills] = useState(false);

//     // Filter skills for this domain
//     const domainSkills = skills.filter(s => s.domain_id === domain.domain_id);
//     const mastered = domainSkills.filter(s => masteredIds.has(s.skill_id));
//     const missing = domainSkills.filter(s => !masteredIds.has(s.skill_id));

//     return (
//         <div
//             className="bg-white shadow-md flex flex-col"
//             style={{
//                 width: "759px",
//                 minHeight: "903px",
//                 borderRadius: "10px",
//                 padding: "20px 24px",
//                 gap: "20px",
//             }}
//         >
//             {/* Header */}
//             <div
//                 className={`flex flex-col ${domain.bgColor || "bg-[#6EB5DD]"}`}
//                 style={{
//                     width: "681px",
//                     borderRadius: "10px",
//                     padding: "16px 20px",
//                 }}
//             >
//                 <div className="flex items-center gap-4">
//                     <img
//                         src="https://via.placeholder.com/60"
//                         alt={domain.domain_name}
//                         className="w-16 h-16 rounded-md object-cover"
//                     />
//                     <div className="flex flex-col text-white">
//                         <h2 className="text-lg font-semibold">{domain.domain_name}</h2>
//                         <p className="text-sm">122,263 learners</p>
//                     </div>

//                     <div
//                         className="ml-auto flex items-center gap-2 bg-white px-3 py-1 rounded-full cursor-pointer"
//                         onClick={() => setShowSkills(!showSkills)}
//                     >
//                         <FaEye className="text-gray-600 text-sm" />
//                         <span className="text-xs text-gray-700">Skills</span>
//                     </div>
//                 </div>

//                 <div className="flex items-center gap-4 mt-2">
//                     <span className={`${domain.tagColor || "bg-[#4599C8]"} px-3 py-1 text-xs rounded-full text-gray-700 bg-white/70`}>
//                         Lesson
//                     </span>
//                     <span className="bg-white/70 px-3 py-1 text-xs rounded-full text-gray-700">
//                         8 weeks
//                     </span>
//                 </div>

//                 {/* Collapsible Skills List */}
//                 {showSkills && (
//                     <div className="mt-3 rounded-b-md overflow-hidden transition-all duration-300">
//                         {mastered.map((s) => (
//                             <div
//                                 key={s.skill_id}
//                                 className="flex items-center justify-between bg-white/20 px-4 py-2 border-b border-white/30"
//                             >
//                                 <div className="flex items-center">
//                                     <span className="text-white font-medium mr-2">✓</span>
//                                     <span>{s.name}</span>
//                                 </div>
//                                 <span className="text-white/80">{getSkillIcon(s.name)}</span>
//                             </div>
//                         ))}
//                         {missing.map((s) => (
//                             <div
//                                 key={s.skill_id}
//                                 className="flex items-center justify-between bg-white/10 px-4 py-2 border-b border-white/20"
//                             >
//                                 <span>{s.name}</span>
//                                 <span className="text-gray-400">{getSkillIcon(s.name)}</span>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>

//             {/* Skills List (with mastered vs. to-do) */}
//             <div>
//                 <h3 className="font-semibold text-gray-900 mb-2">Skills</h3>
//                 <ul className="list-disc ml-6 text-gray-700 text-sm space-y-1">
//                     {mastered.map((s, i) => (
//                         <li key={`mastered-${i}`} className="text-green-700 font-medium">
//                             ✓ {s.name} (Mastered)
//                         </li>
//                     ))}
//                     {missing.map((s, i) => (
//                         <li key={`missing-${i}`} className="text-red-700">
//                             ○ {s.name} (To Learn)
//                         </li>
//                     ))}
//                 </ul>
//             </div>

//             {/* About Course */}
//             <div>
//                 <h3 className="font-semibold text-gray-900 mb-2">About the course</h3>
//                 <p className="text-sm text-gray-700 leading-relaxed">
//                     Our {domain.domain_name} courses teach you how to visualise an idea from a
//                     concept to impactful communications. Learn to design brand identities,
//                     web pages, social media posts, brochures, etc. Create a portfolio
//                     based on real-world projects as part of the course and get hired by
//                     top brands.
//                 </p>
//                 <p className="text-sm text-gray-700 mt-2">
//                     Get a unique classroom-like learning experience with interactive
//                     online sessions.
//                 </p>
//                 <p className="text-sm text-gray-700 mt-1">
//                     Lectures by leading faculties and dedicated mentorship by industry
//                     professionals from around the world.
//                 </p>
//                 <p className="text-sm text-gray-700 mt-1">
//                     Our programmes come with best-in-class placement support/Job
//                     Guarantee.
//                 </p>
//                 <p className="text-sm text-gray-700 mt-1">
//                     Build a network of design professionals and make lifelong
//                     connections.
//                 </p>
//             </div>

//             {/* Apply Button */}
//             <div className="flex justify-center mt-4">
//                 <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-2 rounded-full shadow-md transition">
//                     Apply
//                 </button>
//             </div>
//         </div>
//     );
// };

// // 🔹 MAIN PAGE
// const AiLearningPage = () => {
//     const [aiData, setAiData] = useState(null);
//     const [selectedDomain, setSelectedDomain] = useState(null);

//     useEffect(() => {
//         const stored = localStorage.getItem("aiPredictionResult");
//         if (stored) {
//             try {
//                 const parsed = JSON.parse(stored);
//                 const data = parsed.data?.data || parsed.data || parsed;
//                 setAiData(data);
//             } catch (e) {
//                 console.error("Failed to parse aiPrediction", e);
//             }
//         }
//     }, []);

//     // Extract domains and skills
//     const domains = aiData?.recommended?.domains || [];
//     const allSkills = aiData?.recommended?.skills_to_learn || [];
//     const masteredIds = new Set(aiData?.gap_analysis?.mastered?.map(s => s.skill_id) || []);

//     // Set default domain on load
//     useEffect(() => {
//         if (domains.length > 0 && !selectedDomain) {
//             setSelectedDomain(domains[0]);
//         }
//     }, [domains, selectedDomain]);

//     if (!aiData) {
//         return (
//             <MainLayout>
//                 <div className="flex justify-center items-center min-h-screen bg-gray-100">
//                     <p className="text-gray-600">Loading AI recommendations...</p>
//                 </div>
//             </MainLayout>
//         );
//     }

//     return (
//         <MainLayout>
//             <div className="flex justify-center bg-gray-100 min-h-screen px-0 lg:px-4 py-4">
//                 {/* 🔹 LEFT: Domain Sidebar */}
//                 <div className="w-full lg:w-auto lg:mr-6">
//                     <DomainSidebar
//                         domains={domains}
//                         selectedDomain={selectedDomain}
//                         onSelect={setSelectedDomain}
//                     />
//                 </div>

//                 {/* 🔹 CENTER: Domain Details */}
//                 {selectedDomain && (
//                     <DomainDetails
//                         domain={selectedDomain}
//                         skills={allSkills}
//                         masteredIds={masteredIds}
//                         onToggleSkills={() => { }}
//                     />
//                 )}
//             </div>
//         </MainLayout>
//     );
// };

// export default AiLearningPage;

























// import React, { useState, useEffect } from "react";
// import { FaEye, FaPalette, FaFont, FaRegImage } from "react-icons/fa";
// import MainLayout from "../../components/layout/MainLayout";

// // 🔹 Helper: Get icon for skill name (no emojis)
// const getSkillIcon = (name) => {
//     const lower = name.toLowerCase();
//     if (lower.includes("typo") || lower.includes("font")) return <FaFont />;
//     if (lower.includes("color") || lower.includes("palette")) return <FaPalette />;
//     if (lower.includes("photo") || lower.includes("image") || lower.includes("figma") || lower.includes("psd")) return <FaRegImage />;
//     if (lower.includes("html") || lower.includes("css") || lower.includes("js") || lower.includes("react") || lower.includes("bootstrap")) return <span className="text-xs">Aa</span>;
//     return <FaEye className="text-xs" />;
// };

// // 🔹 Helper: Get first letter of domain name as fallback image
// const getDomainInitial = (domainName) => {
//     if (!domainName) return "?";
//     return domainName.charAt(0).toUpperCase();
// };

// // 🔹 Sidebar: Domain Cards (scrollable, fixed height)
// const DomainSidebar = ({ domains, selectedDomain, onSelect }) => {
//     const learners = "122,263 learners";

//     return (
//         <div className="bg-white shadow-md flex flex-col w-[347px] h-[543px] top-[99px] ml-40 rounded-[10px] p-[20px_10px] gap-[30px] opacity-1">
//             {/* Title */}
//             <h2 className="text-2xl font-bold text-black">Courses</h2>
//             <p className="text-sm text-gray-500">Your learning path</p>

//             {/* Scrollable Domain List */}
//             <div className="flex flex-col gap-6 mt-4 overflow-y-auto max-h-[400px]">
//                 {domains.map((domain, idx) => {
//                     // Assign color by index (cycle through your 3 colors)
//                     const colors = [
//                         { bg: "bg-[#6EB5DD]", tag: "bg-[#4599C8]" },
//                         { bg: "bg-[#E8AC6E]", tag: "bg-[#C57829]" },
//                         { bg: "bg-[#888CE4]", tag: "bg-[#5B60CD]" },
//                     ];
//                     const color = colors[idx % colors.length];

//                     return (
//                         <div
//                             key={domain.domain_id}
//                             className={`${color.bg} text-white rounded-lg p-4 flex flex-col gap-3 cursor-pointer hover:opacity-90`}
//                             onClick={() => onSelect(domain)}
//                         >
//                             {/* Top Row */}
//                             <div className="flex items-center gap-3">
//                                 <div className="w-12 h-12 rounded-md bg-white/20 flex items-center justify-center text-xl font-bold text-white">
//                                     {getDomainInitial(domain.domain_name)}
//                                 </div>
//                                 <div>
//                                     <h3 className="text-base font-semibold">{domain.domain_name}</h3>
//                                     <p className="text-xs text-gray-100">{learners}</p>
//                                 </div>
//                                 <div className="ml-auto flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-full">
//                                     <FaEye className="text-gray-600 text-xs" />
//                                     <span className="text-[10px] text-gray-700">Skills</span>
//                                 </div>
//                             </div>

//                             {/* Bottom Row */}
//                             <div className="flex items-center gap-3">
//                                 <span className={`${color.tag} px-3 py-1 rounded-md text-xs`}>
//                                     Lesson
//                                 </span>
//                                 <span className="bg-white text-gray-800 px-3 py-1 rounded-md text-xs">
//                                     8 weeks
//                                 </span>
//                             </div>
//                         </div>
//                     );
//                 })}
//             </div>
//         </div>
//     );
// };

// // 🔹 Main Panel: Domain Details + Skills Toggle
// const DomainDetails = ({ domain, skills, masteredIds, onToggleSkills }) => {
//     const [showSkills, setShowSkills] = useState(false);

//     // Filter skills for this domain
//     const domainSkills = skills.filter(s => s.domain_id === domain.domain_id);
//     const mastered = domainSkills.filter(s => masteredIds.has(s.skill_id));
//     const missing = domainSkills.filter(s => !masteredIds.has(s.skill_id));

//     return (
//         <div
//             className="bg-white shadow-md flex flex-col"
//             style={{
//                 width: "759px",
//                 minHeight: "903px",
//                 borderRadius: "10px",
//                 padding: "20px 24px",
//                 gap: "20px",
//             }}
//         >
//             {/* Header */}
//             <div
//                 className={`flex flex-col ${domain.bgColor || "bg-[#6EB5DD]"}`}
//                 style={{
//                     width: "681px",
//                     borderRadius: "10px",
//                     padding: "16px 20px",
//                 }}
//             >
//                 <div className="flex items-center gap-4">
//                     <div className="w-16 h-16 rounded-md bg-white/20 flex items-center justify-center text-2xl font-bold text-white">
//                         {getDomainInitial(domain.domain_name)}
//                     </div>
//                     <div className="flex flex-col text-white">
//                         <h2 className="text-lg font-semibold">{domain.domain_name}</h2>
//                         <p className="text-sm">122,263 learners</p>
//                     </div>

//                     <div
//                         className="ml-auto flex items-center gap-2 bg-white px-3 py-1 rounded-full cursor-pointer"
//                         onClick={() => setShowSkills(!showSkills)}
//                     >
//                         <FaEye className="text-gray-600 text-sm" />
//                         <span className="text-xs text-gray-700">Skills</span>
//                     </div>
//                 </div>

//                 <div className="flex items-center gap-4 mt-2">
//                     <span className={`${domain.tagColor || "bg-[#4599C8]"} px-3 py-1 text-xs rounded-full text-gray-700 bg-white/70`}>
//                         Lesson
//                     </span>
//                     <span className="bg-white/70 px-3 py-1 text-xs rounded-full text-gray-700">
//                         8 weeks
//                     </span>
//                 </div>

//                 {/* Collapsible Skills List */}
//                 {showSkills && (
//                     <div className="mt-3 rounded-b-md overflow-hidden transition-all duration-300">
//                         {mastered.map((s) => (
//                             <div
//                                 key={s.skill_id}
//                                 className="flex items-center justify-between bg-white/20 px-4 py-2 border-b border-white/30"
//                             >
//                                 <div className="flex items-center">
//                                     <span className="text-white font-medium mr-2">✓</span>
//                                     <span>{s.name}</span>
//                                 </div>
//                                 <span className="text-white/80">{getSkillIcon(s.name)}</span>
//                             </div>
//                         ))}
//                         {missing.map((s) => (
//                             <div
//                                 key={s.skill_id}
//                                 className="flex items-center justify-between bg-white/10 px-4 py-2 border-b border-white/20"
//                             >
//                                 <span>{s.name}</span>
//                                 <span className="text-gray-400">{getSkillIcon(s.name)}</span>
//                             </div>
//                         ))}
//                     </div>
//                 )}
//             </div>

//             {/* Skills List (with mastered vs. to-do) */}
//             <div>
//                 <h3 className="font-semibold text-gray-900 mb-2">Skills</h3>
//                 <ul className="list-disc ml-6 text-gray-700 text-sm space-y-1">
//                     {mastered.map((s, i) => (
//                         <li key={`mastered-${i}`} className="text-green-700 font-medium">
//                             ✓ {s.name} (Mastered)
//                         </li>
//                     ))}
//                     {missing.map((s, i) => (
//                         <li key={`missing-${i}`} className="text-red-700">
//                             ○ {s.name} (To Learn)
//                         </li>
//                     ))}
//                 </ul>
//             </div>

//             {/* About Course */}
//             <div>
//                 <h3 className="font-semibold text-gray-900 mb-2">About the course</h3>
//                 <p className="text-sm text-gray-700 leading-relaxed">
//                     Our {domain.domain_name} courses teach you how to visualise an idea from a
//                     concept to impactful communications. Learn to design brand identities,
//                     web pages, social media posts, brochures, etc. Create a portfolio
//                     based on real-world projects as part of the course and get hired by
//                     top brands.
//                 </p>
//                 <p className="text-sm text-gray-700 mt-2">
//                     Get a unique classroom-like learning experience with interactive
//                     online sessions.
//                 </p>
//                 <p className="text-sm text-gray-700 mt-1">
//                     Lectures by leading faculties and dedicated mentorship by industry
//                     professionals from around the world.
//                 </p>
//                 <p className="text-sm text-gray-700 mt-1">
//                     Our programmes come with best-in-class placement support/Job
//                     Guarantee.
//                 </p>
//                 <p className="text-sm text-gray-700 mt-1">
//                     Build a network of design professionals and make lifelong
//                     connections.
//                 </p>
//             </div>

//             {/* Apply Button */}
//             <div className="flex justify-center mt-4">
//                 <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-2 rounded-full shadow-md transition">
//                     Apply
//                 </button>
//             </div>
//         </div>
//     );
// };

// // 🔹 MAIN PAGE
// const AiLearningPage = () => {
//     const [aiData, setAiData] = useState(null);
//     const [selectedDomain, setSelectedDomain] = useState(null);

//     useEffect(() => {
//         const stored = localStorage.getItem("aiPredictionResult");
//         if (stored) {
//             try {
//                 const parsed = JSON.parse(stored);
//                 const data = parsed.data?.data || parsed.data || parsed;
//                 setAiData(data);
//             } catch (e) {
//                 console.error("Failed to parse aiPrediction", e);
//             }
//         }
//     }, []);

//     // Extract domains and skills
//     const domains = aiData?.recommended?.domains || [];
//     const allSkills = aiData?.recommended?.skills_to_learn || [];
//     const masteredIds = new Set(aiData?.gap_analysis?.mastered?.map(s => s.skill_id) || []);

//     // Set default domain on load
//     useEffect(() => {
//         if (domains.length > 0 && !selectedDomain) {
//             setSelectedDomain(domains[0]);
//         }
//     }, [domains, selectedDomain]);

//     if (!aiData) {
//         return (
//             <MainLayout>
//                 <div className="flex justify-center items-center min-h-screen bg-gray-100">
//                     <p className="text-gray-600">Loading AI recommendations...</p>
//                 </div>
//             </MainLayout>
//         );
//     }

//     return (
//         <MainLayout>
//             <div className="flex justify-center bg-gray-100 min-h-screen px-0 lg:px-4 py-4">
//                 {/* 🔹 LEFT: Domain Sidebar */}
//                 <div className="w-full lg:w-auto lg:mr-6">
//                     <DomainSidebar
//                         domains={domains}
//                         selectedDomain={selectedDomain}
//                         onSelect={setSelectedDomain}
//                     />
//                 </div>

//                 {/* 🔹 CENTER: Domain Details */}
//                 {selectedDomain && (
//                     <DomainDetails
//                         domain={selectedDomain}
//                         skills={allSkills}
//                         masteredIds={masteredIds}
//                         onToggleSkills={() => { }}
//                     />
//                 )}
//             </div>
//         </MainLayout>
//     );
// };

// export default AiLearningPage;


















// src/pages/AiLearningPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaEye, FaPalette, FaFont, FaRegImage } from "react-icons/fa";
import MainLayout from "../../components/layout/MainLayout";
import { useSelector } from "react-redux";

const BASE_URL=import.meta.env.VITE_BASE_URL;

// 🔹 Helpers (same as before)
const getSkillIcon = (name) => {
  const lower = name.toLowerCase();
  if (lower.includes("typo") || lower.includes("font")) return <FaFont />;
  if (lower.includes("color") || lower.includes("palette")) return <FaPalette />;
  if (lower.includes("photo") || lower.includes("image") || lower.includes("figma") || lower.includes("psd")) return <FaRegImage />;
  if (lower.includes("html") || lower.includes("css") || lower.includes("js") || lower.includes("react") || lower.includes("bootstrap")) return <span className="text-xs">Aa</span>;
  return <FaEye className="text-xs" />;
};

const getDomainInitial = (domainName) => domainName ? domainName.charAt(0).toUpperCase() : "?";

// 🔹 Domain Sidebar
const DomainSidebar = ({ domains, selectedDomainId, onSelect }) => {
  const learners = "122,263 learners";
  const colors = [
    { bg: "bg-[#6EB5DD]", tag: "bg-[#4599C8]" },
    { bg: "bg-[#E8AC6E]", tag: "bg-[#C57829]" },
    { bg: "bg-[#888CE4]", tag: "bg-[#5B60CD]" },
  ];

  return (
    <div className="bg-white shadow-md flex flex-col w-[347px] h-[543px] top-[99px] ml-40 rounded-[10px] p-[20px_10px] gap-[30px] opacity-1">
      <h2 className="text-2xl font-bold text-black">Courses</h2>
      <p className="text-sm text-gray-500">Your learning path</p>
      <div className="flex flex-col gap-6 mt-4 overflow-y-auto max-h-[400px]">
        {domains.map((domain, idx) => {
          const color = colors[idx % colors.length];
          return (
            <div
              key={domain.domain_id}
              className={`${color.bg} text-white rounded-lg p-4 flex flex-col gap-3 cursor-pointer hover:opacity-90 ${selectedDomainId === domain.domain_id ? 'ring-2 ring-white' : ''}`}
              onClick={() => onSelect(domain.domain_id)}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-md bg-white/20 flex items-center justify-center text-xl font-bold text-white">
                  {getDomainInitial(domain.domain_name)}
                </div>
                <div>
                  <h3 className="text-base font-semibold">{domain.domain_name}</h3>
                  <p className="text-xs text-gray-100">{learners}</p>
                </div>
                <div className="ml-auto flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-full">
                  <FaEye className="text-gray-600 text-xs" />
                  <span className="text-[10px] text-gray-700">Skills</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`${color.tag} px-3 py-1 rounded-md text-xs`}>Lesson</span>
                <span className="bg-white text-gray-800 px-3 py-1 rounded-md text-xs">8 weeks</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 🔹 Domain Details
const DomainDetails = ({ domain, skills, masteredIds }) => {
  const [showSkills, setShowSkills] = useState(false);
  const domainSkills = skills.filter(s => s.domain_id === domain.domain_id);
  const mastered = domainSkills.filter(s => masteredIds.has(s.skill_id));
  const missing = domainSkills.filter(s => !masteredIds.has(s.skill_id));

  const colors = ["bg-[#6EB5DD]", "bg-[#E8AC6E]", "bg-[#888CE4]"];
  const color = colors[domain.domain_id % colors.length];

  return (
    <div className="bg-white shadow-md flex flex-col" style={{ width: "759px", minHeight: "903px", borderRadius: "10px", padding: "20px 24px", gap: "20px" }}>
      <div className={`${color}`} style={{ width: "681px", borderRadius: "10px", padding: "16px 20px" }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-md bg-white/20 flex items-center justify-center text-2xl font-bold text-white">
            {getDomainInitial(domain.domain_name)}
          </div>
          <div className="flex flex-col text-white">
            <h2 className="text-lg font-semibold">{domain.domain_name}</h2>
            <p className="text-sm">122,263 learners</p>
          </div>
          <div className="ml-auto flex items-center gap-2 bg-white px-3 py-1 rounded-full cursor-pointer" onClick={() => setShowSkills(!showSkills)}>
            <FaEye className="text-gray-600 text-sm" />
            <span className="text-xs text-gray-700">Skills</span>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <span className="bg-white/70 px-3 py-1 text-xs rounded-full text-gray-700">Lesson</span>
          <span className="bg-white/70 px-3 py-1 text-xs rounded-full text-gray-700">8 weeks</span>
        </div>
        {showSkills && (
          <div className="mt-3 rounded-b-md overflow-hidden">
            {mastered.map((s) => (
              <div key={s.skill_id} className="flex items-center justify-between bg-white/20 px-4 py-2 border-b border-white/30">
                <div className="flex items-center">
                  <span className="text-white font-medium mr-2">✓</span>
                  <span>{s.name}</span>
                </div>
                <span className="text-white/80">{getSkillIcon(s.name)}</span>
              </div>
            ))}
            {missing.map((s) => (
              <div key={s.skill_id} className="flex items-center justify-between bg-white/10 px-4 py-2 border-b border-white/20">
                <span>{s.name}</span>
                <span className="text-gray-400">{getSkillIcon(s.name)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-2">Skills</h3>
        <ul className="list-disc ml-6 text-gray-700 text-sm space-y-1">
          {mastered.map((s) => (
            <li key={s.skill_id} className="text-green-700 font-medium">✓ {s.name} (Mastered)</li>
          ))}
          {missing.map((s) => (
            <li key={s.skill_id} className="text-red-700">○ {s.name} (To Learn)</li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-2">About the course</h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          Our {domain.domain_name} courses teach you how to visualise an idea from a concept to impactful communications...
        </p>
        <p className="text-sm text-gray-700 mt-2">
          Get a unique classroom-like learning experience with interactive
          online sessions.
        </p>
        <p className="text-sm text-gray-700 mt-1">
          Lectures by leading faculties and dedicated mentorship by industry
          professionals from around the world.
        </p>
        <p className="text-sm text-gray-700 mt-1">
          Our programmes come with best-in-class placement support/Job
          Guarantee.
        </p>
        <p className="text-sm text-gray-700 mt-1">
          Build a network of design professionals and make lifelong
          connections.
        </p>
      </div>

      <div className="flex justify-center mt-4">
        <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-2 rounded-full shadow-md transition">Apply</button>
      </div>
    </div>
  );
};

// MAIN COMPONENT
const AiLearningPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {token}=useSelector((state)=> state.auth);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [selectedDomainId, setSelectedDomainId] = useState(null);



  useEffect(() => {
  const fetchData = async () => {
    try {
      const { strategy, jobId, companyIds, roleIds } = location.state || {};

      //  Redirect if no strategy
      if (!strategy || !["job", "company_role", "upskilling"].includes(strategy)) {
        console.warn("Invalid or missing strategy:", strategy);
        navigate("/ai-prediction", { replace: true });
        return;
      }

      // 🔹 Validate inputs early
      if (strategy === "job" && (!jobId || isNaN(Number(jobId)))) {
        throw new Error("Invalid job selection. Please go back and select a job.");
      }
      if (strategy === "company_role") {
        if (!Array.isArray(companyIds) || companyIds.length === 0) {
          throw new Error("No companies selected. Please select at least one company.");
        }
        if (!Array.isArray(roleIds) || roleIds.length === 0) {
          throw new Error("No job roles selected. Please select at least one role.");
        }
      }

      setLoading(true);
      setError(null);

      const payload = { strategy };
      if (strategy === "job") payload.jobId = Number(jobId);
      if (strategy === "company_role") {
        payload.companyIds = companyIds.map(id => Number(id));
        payload.roleIds = roleIds.map(id => Number(id));
      }

      const res = await fetch(`${BASE_URL}/recommendations/ai-prediction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Handle non-2xx
      if (!res.ok) {
        let msg = `Request failed (${res.status})`;
        try {
          const errData = await res.json();
          msg = errData.message || errData.error || msg;
        } catch (e) { /* use fallback msg */ }
        throw new Error(msg);
      }

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.message || "Unable to generate recommendations");
      }

      // Safe data extraction
      const result = data.data || {};
      setAiResult(result);

      // Auto-select first domain (if any)
      const domains = result.recommended?.domains || [];
      setSelectedDomainId(domains.length > 0 ? domains[0].domain_id : null);

    } catch (err) {
      console.error("[AI Learning] Fetch failed:", err);
      setError(err.message || "We couldn't generate recommendations right now. This can happen if no matching jobs or skills were found.");
      setAiResult({
        strategy: location.state?.strategy || "unknown",
        input: {},
        gap_analysis: { mastered_count: 0, missing_count: 0, mastered: [], missing: [] },
        recommended: { domains: [], skills_to_learn: [] }
      });
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [location.state, navigate, token]);

  // Redirect on error
  // if (error) {
  //   return (
  //     <MainLayout>
  //       <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
  //         <div className="text-red-500 text-5xl mb-4"></div>
  //         <h2 className="text-xl font-bold text-gray-800 mb-2">We are not able to generate recommendation for you. Please try agian later</h2>
  //         <p className="text-gray-600 mb-4 max-w-md">{error}</p>
  //         <button
  //           onClick={() => navigate("/ai-prediction")}
  //           className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full"
  //         >
  //           Go Back to AI Prediction
  //         </button>
  //       </div>
  //     </MainLayout>
  //   );
  // }

  //  Loading
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-red-500 border-t-transparent mb-4"></div>
            <p className="text-gray-700 font-medium">Generating your AI skill recommendation...</p>
            <p className="text-sm text-gray-500 mt-1">This may take a few seconds</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  //  Render content
  const domains = Array.isArray(aiResult?.recommended?.domains)
    ? aiResult.recommended.domains
    : [];

  const skills = Array.isArray(aiResult?.recommended?.skills_to_learn)
    ? aiResult.recommended.skills_to_learn
    : [];

  const mastered = Array.isArray(aiResult?.gap_analysis?.mastered)
    ? aiResult.gap_analysis.mastered
    : [];

  const masteredIds = new Set(mastered.map(s => s.skill_id));

  const selectedDomain = selectedDomainId
    ? domains.find(d => d.domain_id === selectedDomainId)
    : domains[0] || null;

  // return (
  //   <MainLayout>
  //     <div className="flex justify-center bg-gray-100 min-h-screen px-0 lg:px-4 py-4">
  //       {/* Sidebar */}
  //       <DomainSidebar
  //         domains={domains}
  //         selectedDomainId={selectedDomainId}
  //         onSelect={setSelectedDomainId}
  //       />
  //       {/* Main */}
  //       {selectedDomain && (
  //         <DomainDetails
  //           domain={selectedDomain}
  //           skills={skills}
  //           masteredIds={masteredIds}
  //         />
  //       )}
  //     </div>
  //   </MainLayout>
  // );




  return (
    <MainLayout>
      <div className="flex justify-center bg-gray-100 min-h-screen px-0 lg:px-4 py-4">
        {/* Sidebar */}
        <DomainSidebar
          domains={domains}
          selectedDomainId={selectedDomainId}
          onSelect={setSelectedDomainId}
        />

        {/* Main Content Area */}
        {skills.length > 0 && selectedDomain ? (
          <DomainDetails
            domain={selectedDomain}
            skills={skills}
            masteredIds={masteredIds}
          />
        ) : (
          //  Empty State (no skills, or no domain)
          <div className="bg-white shadow-md flex flex-col w-[759px] h-[903px] rounded-[10px] p-8 justify-center items-center text-center">
            <div className="text-gray-400 mb-4">
              <svg width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm.93-9.412-1 4.705c-.07.34.029.533.308.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.081-.451c.071-.293.179-.351.47-.288l3.468.738c.897.194 1.319-.105 1.319-.808 0-.533-.246-.824-.533-.824-.287 0-.533.291-.533.824 0 .291.07.533.246.708l-.416.088c-.176-.195-.352-.291-.686-.291z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No Skills Recommended Yet
            </h3>
            <p className="text-gray-600 max-w-md mb-4">
              {error
                ? error
                : skills.length === 0
                  ? "We couldn’t find any skills to recommend for your selection. Try choosing a different job, company, or role."
                  : "No domain selected."}
            </p>
            <button
              onClick={() => navigate("/ai-prediction")}
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full flex items-center gap-2"
            >
              ← Go Back & Try Again
            </button>
            {aiResult?.strategy && (
              <p className="text-xs text-gray-500 mt-4">
                Strategy: <code className="bg-gray-100 px-1 rounded">{aiResult.strategy}</code>
              </p>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AiLearningPage;