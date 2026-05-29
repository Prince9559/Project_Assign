// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { useSelector } from "react-redux";
// import MainLayout from "../../components/layout/MainLayout";
// import { showSuccessAlert, showErrorAlert } from "../../utils/alertService";
// import {
//   FiArrowLeft,
//   FiBookOpen,
//   FiBriefcase,
//   FiCheckCircle,
//   FiCircle,
//   FiExternalLink,
//   FiFolder,
//   FiLoader,
// } from "react-icons/fi";

// const BASE_URL = import.meta.env.VITE_BASE_URL;

// function publicFileUrl(stored) {
//   if (!stored) return null;
//   if (String(stored).startsWith("http")) return stored;
//   const base = BASE_URL.replace(/\/?api\/?$/i, "");
//   return `${base}/api/${stored}`;
// }

// const TYPE_ICONS = {
//   course: FiBookOpen,
//   internship: FiBriefcase,
//   project: FiFolder,
//   job: FiBriefcase,
// };

// const TYPE_LABEL = {
//   course: "Course",
//   internship: "Internship",
//   project: "Project",
//   job: "Job",
// };

// function TimelineDot({ status }) {
//   if (status === "completed") {
//     return (
//       <span className="flex items-center justify-center w-9 h-9 rounded-full bg-emerald-500 text-white shadow-sm">
//         <FiCheckCircle className="w-5 h-5" />
//       </span>
//     );
//   }
//   if (status === "in_progress") {
//     return (
//       <span className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-500 text-white shadow-sm ring-4 ring-amber-100">
//         <span className="w-2.5 h-2.5 rounded-full bg-white" />
//       </span>
//     );
//   }
//   return (
//     <span className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-gray-300 bg-white text-gray-400">
//       <FiCircle className="w-5 h-5" />
//     </span>
//   );
// }

// function StatusBadge({ status }) {
//   const map = {
//     completed: "bg-emerald-100 text-emerald-800",
//     in_progress: "bg-amber-100 text-amber-800",
//     pending: "bg-gray-100 text-gray-700",
//   };
//   const label = status.replace("_", " ");
//   return (
//     <span
//       className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] || map.pending}`}
//     >
//       {label}
//     </span>
//   );
// }

// export default function ManagePathwayPage() {
//   const { pathwayId } = useParams();
//   const navigate = useNavigate();
//   const { token } = useSelector((s) => s.auth);

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [refreshError, setRefreshError] = useState(null);
//   const [data, setData] = useState(null);
//   const [expandedId, setExpandedId] = useState(null);
//   const [busyStepId, setBusyStepId] = useState(null);
//   const [proofByStep, setProofByStep] = useState({});

//   useEffect(() => {
//     setExpandedId(null);
//     setError(null);
//     setRefreshError(null);
//     setData(null);
//   }, [pathwayId]);

//   const load = useCallback(async () => {
//     if (!pathwayId || !token) return false;
//     setLoading(true);
//     setRefreshError(null);
//     let dashboardLoaded = false;
//     try {
//       const res = await fetch(`${BASE_URL}/pathways/learning/${pathwayId}/dashboard`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//       });
//       const json = await res.json().catch(() => ({}));
//       if (!res.ok || !json.success) {
//         throw new Error(json.message || "Failed to load pathway");
//       }
//       const payload = json.data && typeof json.data === "object" ? json.data : {};
//       const stepList = Array.isArray(payload.steps) ? payload.steps : [];
//       setData({
//         ...payload,
//         steps: stepList,
//         learned_skills: Array.isArray(payload.learned_skills) ? payload.learned_skills : [],
//         learned_sub_skills: Array.isArray(payload.learned_sub_skills)
//           ? payload.learned_sub_skills
//           : [],
//       });
//       dashboardLoaded = true;
//       setError(null);
//       const firstOpen = stepList.find((s) => s.status !== "completed");
//       setExpandedId((id) => id ?? firstOpen?.id ?? stepList[0]?.id ?? null);
//       return true;
//     } catch (e) {
//       const msg = e?.message || "Something went wrong";
//       if (!dashboardLoaded) setError(msg);
//       else setRefreshError(msg);
//       return false;
//     } finally {
//       setLoading(false);
//     }
//   }, [pathwayId, token]);

//   useEffect(() => {
//     load();
//   }, [load]);

//   const steps = data?.steps || [];
//   const stats = data?.stats;
//   const pathway = data?.pathway;

//   const remainingSteps = useMemo(
//     () => steps.filter((s) => s.status !== "completed"),
//     [steps]
//   );

//   const markInProgress = async (step) => {
//     if (!token) return;
//     setBusyStepId(step.id);
//     try {
//       const res = await fetch(
//         `${BASE_URL}/pathways/learning/${pathwayId}/steps/${step.id}/status`,
//         {
//           method: "PATCH",
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ status: "in_progress" }),
//         }
//       );
//       const json = await res.json().catch(() => ({}));
//       if (!res.ok || !json.success) throw new Error(json.message || "Update failed");
//       await load();
//     } catch (e) {
//       await showErrorAlert("Could not update", e.message || "Update failed");
//     } finally {
//       setBusyStepId(null);
//     }
//   };

//   const completeStep = async (step) => {
//     if (!token) return;
//     const needsProof = step.resource_type !== "job";
//     if (needsProof && !proofByStep[step.id]) {
//       alert("Please choose a screenshot or PDF to upload for this step.");
//       return;
//     }
//     setBusyStepId(step.id);
//     try {
//       let res;
//       if (needsProof) {
//         const fd = new FormData();
//         fd.append("pathwayProof", proofByStep[step.id]);
//         res = await fetch(
//           `${BASE_URL}/pathways/learning/${pathwayId}/steps/${step.id}/complete`,
//           {
//             method: "POST",
//             headers: { Authorization: `Bearer ${token}` },
//             body: fd,
//           }
//         );
//       } else {
//         const emptyFd = new FormData();
//         res = await fetch(
//           `${BASE_URL}/pathways/learning/${pathwayId}/steps/${step.id}/complete`,
//           {
//             method: "POST",
//             headers: { Authorization: `Bearer ${token}` },
//             body: emptyFd,
//           }
//         );
//       }
//       const json = await res.json().catch(() => ({}));
//       if (!res.ok || !json.success) throw new Error(json.message || "Could not complete step");
//       setProofByStep((prev) => {
//         const next = { ...prev };
//         delete next[step.id];
//         return next;
//       });
//       const refreshed = await load();
//       if (refreshed) {
//         await showSuccessAlert("Step completed", "Your pathway progress was updated.");
//       }
//     } catch (e) {
//       await showErrorAlert("Could not complete step", e.message || "Something went wrong");
//     } finally {
//       setBusyStepId(null);
//     }
//   };

//   const openResource = (step) => {
//     if (!step.resource_link) {
//       alert("No link available for this resource.");
//       return;
//     }
//     if (step.resource_link.startsWith("http")) {
//       window.open(step.resource_link, "_blank", "noopener,noreferrer");
//       return;
//     }
//     navigate(step.resource_link);
//   };

//   if (loading && !data) {
//     return (
//       <MainLayout heading="Manage Pathway">
//         <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-gray-600">
//           <FiLoader className="w-8 h-8 animate-spin text-indigo-600" />
//           <p>Loading pathway progress…</p>
//         </div>
//       </MainLayout>
//     );
//   }

//   if (error || !data) {
//     return (
//       <MainLayout heading="Manage Pathway">
//         <div className="max-w-lg mx-auto p-6 text-center">
//           <p className="text-red-600 mb-4">{error || "No data"}</p>
//           <button
//             type="button"
//             onClick={() => navigate(-1)}
//             className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
//           >
//             Go back
//           </button>
//         </div>
//       </MainLayout>
//     );
//   }

//   const learnedSkills = Array.isArray(data.learned_skills) ? data.learned_skills : [];
//   const learnedSubSkills = Array.isArray(data.learned_sub_skills) ? data.learned_sub_skills : [];

//   return (
//     <MainLayout heading="AI Prediction · Manage Pathway">
//       <div className="max-w-5xl mx-auto px-4 py-6 md:px-6">
//         <button
//           type="button"
//           onClick={() =>
//             pathwayId ? navigate(`/pathways/${pathwayId}`) : navigate(-1)
//           }
//           className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
//         >
//           <FiArrowLeft /> Back to pathway overview
//         </button>

//         {refreshError && (
//           <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex flex-wrap items-center justify-between gap-2">
//             <span>{refreshError}</span>
//             <button
//               type="button"
//               onClick={() => load()}
//               className="shrink-0 px-3 py-1 rounded-md bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700"
//             >
//               Retry
//             </button>
//           </div>
//         )}

//         {loading && data && (
//           <div className="mb-4 flex items-center gap-2 text-sm text-indigo-600">
//             <FiLoader className="w-4 h-4 animate-spin" />
//             Updating pathway…
//           </div>
//         )}

//         <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 mb-8">
//           <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
//             <div>
//               <p className="text-sm font-medium text-indigo-600">Selected pathway</p>
//               <h1 className="text-2xl font-bold text-gray-900 mt-1">
//                 {pathway?.target_display || "Learning pathway"}
//               </h1>
//               <p className="text-sm text-gray-500 mt-1">
//                 Rank #{pathway?.pathway_rank} · {pathway?.target_type?.replace("_", " ")}
//               </p>
//             </div>
//             <div className="text-right">
//               <p className="text-sm text-gray-500">Overall progress</p>
//               <p className="text-3xl font-bold text-indigo-600">
//                 {stats?.completion_percent ?? 0}%
//               </p>
//               <p className="text-xs text-gray-500 mt-1">
//                 {stats?.completed_steps ?? 0} / {stats?.total_steps ?? 0} steps
//               </p>
//             </div>
//           </div>
//           <div className="mt-5 h-3 w-full bg-gray-100 rounded-full overflow-hidden">
//             <div
//               className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
//               style={{ width: `${stats?.completion_percent ?? 0}%` }}
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           <div className="lg:col-span-2 space-y-6">
//             <h2 className="text-lg font-semibold text-gray-900">Timeline</h2>
//             <div className="relative">
//               <div className="absolute left-[17px] top-2 bottom-2 w-0.5 bg-gray-200" aria-hidden />
//               <ul className="space-y-6">
//                 {steps.map((step, idx) => {
//                   const Icon = TYPE_ICONS[step.resource_type] || FiBookOpen;
//                   const isOpen = expandedId === step.id;
//                   const busy = busyStepId === step.id;
//                   return (
//                     <li key={step.id} className="relative flex gap-4 pl-1">
//                       <div className="relative z-10 flex-shrink-0 pt-1">
//                         <TimelineDot status={step.status} />
//                       </div>
//                       <div className="flex-1 min-w-0">
//                         <button
//                           type="button"
//                           onClick={() => setExpandedId(isOpen ? null : step.id)}
//                           className="w-full text-left rounded-xl border border-gray-200 bg-white p-4 hover:border-indigo-200 transition"
//                         >
//                           <div className="flex items-start justify-between gap-3">
//                             <div className="flex items-start gap-2 min-w-0">
//                               <Icon className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
//                               <div className="min-w-0">
//                                 <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
//                                   Step {idx + 1} · {TYPE_LABEL[step.resource_type] || step.resource_type}
//                                 </p>
//                                 <h3 className="font-semibold text-gray-900 truncate">
//                                   {step.step_title}
//                                 </h3>
//                               </div>
//                             </div>
//                             <StatusBadge status={step.status} />
//                           </div>
//                           <p className="text-sm text-gray-600 mt-2 line-clamp-2">
//                             {step.description || "Follow the resource and mark progress when done."}
//                           </p>
//                         </button>

//                         {isOpen && (
//                           <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-4">
//                             <div>
//                               <h4 className="text-sm font-semibold text-gray-800 mb-2">
//                                 Resource details
//                               </h4>
//                               <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
//                                 <div>
//                                   <dt className="text-gray-500">Title</dt>
//                                   <dd className="font-medium text-gray-900">{step.resource_title}</dd>
//                                 </div>
//                                 <div>
//                                   <dt className="text-gray-500">Platform / source</dt>
//                                   <dd className="font-medium text-gray-900">
//                                     {step.platform_source || "—"}
//                                   </dd>
//                                 </div>
//                                 {step.duration_label && (
//                                   <div>
//                                     <dt className="text-gray-500">Duration</dt>
//                                     <dd className="font-medium text-gray-900">{step.duration_label}</dd>
//                                   </div>
//                                 )}
//                               </dl>
//                               {step.description && (
//                                 <p className="text-sm text-gray-700 mt-3">{step.description}</p>
//                               )}
//                               <div className="mt-3 flex flex-wrap gap-2">
//                                 <button
//                                   type="button"
//                                   onClick={() => openResource(step)}
//                                   className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
//                                 >
//                                   <FiExternalLink className="w-4 h-4" />
//                                   Open resource
//                                 </button>
//                               </div>
//                             </div>

//                             {/* <div>
//                               <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
//                                 Skills covered
//                               </p>
//                               <div className="flex flex-wrap gap-1">
//                                 {(step.skills || []).length === 0 && (
//                                   <span className="text-sm text-gray-500">—</span>
//                                 )}
//                                 {(step.skills || []).map((sk, i) => (
//                                   <span
//                                     key={i}
//                                     className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800"
//                                   >
//                                     {sk.skill_name || sk.name || JSON.stringify(sk)}
//                                   </span>
//                                 ))}
//                               </div>
//                             </div>
//                             <div>
//                               <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
//                                 Sub-skills
//                               </p>
//                               <div className="flex flex-wrap gap-1">
//                                 {(step.sub_skills || []).length === 0 && (
//                                   <span className="text-sm text-gray-500">—</span>
//                                 )}
//                                 {(step.sub_skills || []).map((sk, i) => (
//                                   <span
//                                     key={i}
//                                     className="px-2 py-0.5 rounded-full text-xs bg-violet-100 text-violet-800"
//                                   >
//                                     {sk.skill_name || sk.name || JSON.stringify(sk)}
//                                   </span>
//                                 ))}
//                               </div>
//                             </div> */}
//                             <div>
//   <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
//     Skills covered
//   </p>
//   <div className="flex flex-wrap gap-1">
//     {(!Array.isArray(step.skills) || step.skills.length === 0) ? (
//       <span className="text-sm text-gray-500">—</span>
//     ) : (
//       step.skills.map((sk, i) => (
//         <span
//           key={i}
//           className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800"
//         >
//           {sk.skill_name || sk.name || JSON.stringify(sk)}
//         </span>
//       ))
//     )}
//   </div>
// </div>

// <div>
//   <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
//     Sub-skills
//   </p>
//   <div className="flex flex-wrap gap-1">
//     {(!Array.isArray(step.sub_skills) || step.sub_skills.length === 0) ? (
//       <span className="text-sm text-gray-500">—</span>
//     ) : (
//       step.sub_skills.map((sk, i) => (
//         <span
//           key={i}
//           className="px-2 py-0.5 rounded-full text-xs bg-violet-100 text-violet-800"
//         >
//           {sk.skill_name || sk.name || JSON.stringify(sk)}
//         </span>
//       ))
//     )}
//   </div>
// </div>

//                             {step.resource_type !== "job" && (
//                               <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                   Proof (screenshot or PDF) — required
//                                 </label>
//                                 <input
//                                   type="file"
//                                   accept="image/*,.pdf,application/pdf"
//                                   disabled={step.status === "completed" || busy}
//                                   onChange={(e) => {
//                                     const f = e.target.files?.[0];
//                                     setProofByStep((prev) => {
//                                       const next = { ...prev };
//                                       if (f) next[step.id] = f;
//                                       else delete next[step.id];
//                                       return next;
//                                     });
//                                   }}
//                                   className="block w-full text-sm text-gray-600"
//                                 />
//                                 {step.completion_file && (
//                                   <a
//                                     href={publicFileUrl(step.completion_file)}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="inline-block mt-2 text-sm text-indigo-600 hover:underline"
//                                   >
//                                     View uploaded proof
//                                   </a>
//                                 )}
//                               </div>
//                             )}

//                             <div className="flex flex-wrap gap-2 pt-2">
//                               {step.status === "pending" && (
//                                 <button
//                                   type="button"
//                                   disabled={busy}
//                                   onClick={() => markInProgress(step)}
//                                   className="px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-50"
//                                 >
//                                   {busy ? "…" : "Mark as in progress"}
//                                 </button>
//                               )}
//                               {step.status !== "completed" && (
//                                 <button
//                                   type="button"
//                                   disabled={busy}
//                                   onClick={() => completeStep(step)}
//                                   className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
//                                 >
//                                   {busy ? "Saving…" : "Mark as completed"}
//                                 </button>
//                               )}
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </li>
//                   );
//                 })}
//               </ul>
//             </div>
//           </div>

//           <div className="space-y-6">
//             <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
//               <h3 className="font-semibold text-gray-900 mb-3">Skills learned</h3>
//               <p className="text-xs text-gray-500 mb-2">From completed steps</p>
//               <div className="flex flex-wrap gap-1">
//                 {learnedSkills.length === 0 && (
//                   <span className="text-sm text-gray-500">Complete steps to track skills.</span>
//                 )}
//                 {learnedSkills.map((s) => (
//                   <span
//                     key={s}
//                     className="px-2 py-1 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-900"
//                   >
//                     {s}
//                   </span>
//                 ))}
//               </div>
//               {learnedSubSkills.length > 0 && (
//                 <>
//                   <p className="text-xs text-gray-500 mt-4 mb-2">Sub-skills</p>
//                   <div className="flex flex-wrap gap-1">
//                     {learnedSubSkills.map((s) => (
//                       <span
//                         key={s}
//                         className="px-2 py-1 rounded-lg text-xs bg-gray-100 text-gray-800"
//                       >
//                         {s}
//                       </span>
//                     ))}
//                   </div>
//                 </>
//               )}
//             </div>

//             <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
//               <h3 className="font-semibold text-gray-900 mb-2">Remaining</h3>
//               <p className="text-3xl font-bold text-gray-900">{remainingSteps.length}</p>
//               <p className="text-sm text-gray-500">steps left to complete</p>
//               <ul className="mt-3 space-y-2 text-sm text-gray-700">
//                 {remainingSteps.map((s) => (
//                   <li key={s.id} className="flex items-center gap-2">
//                     <FiCircle className="w-3 h-3 text-gray-400" />
//                     <span className="truncate">{s.step_title}</span>
//                   </li>
//                 ))}
//                 {remainingSteps.length === 0 && (
//                   <li className="text-emerald-700 font-medium">All steps completed.</li>
//                 )}
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>
//     </MainLayout>
//   );
// }










import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import MainLayout from "../../components/layout/MainLayout";
import { showSuccessAlert, showErrorAlert } from "../../utils/alertService";
import {
  FiArrowLeft,
  FiBookOpen,
  FiBriefcase,
  FiCheckCircle,
  FiCircle,
  FiExternalLink,
  FiFolder,
  FiLoader,
} from "react-icons/fi";
import GreenPrimaryButton from "../../components/jobs/GreenPrimaryButton";

const BASE_URL = import.meta.env.VITE_BASE_URL;

function publicFileUrl(stored) {
  if (!stored) return null;
  if (String(stored).startsWith("http")) return stored;
  const base = BASE_URL.replace(/\/?api\/?$/i, "");
  return `${base}/api/${stored}`;
}

const TYPE_ICONS = {
  course: FiBookOpen,
  internship: FiBriefcase,
  project: FiFolder,
  job: FiBriefcase,
};

const TYPE_LABEL = {
  course: "Course",
  internship: "Internship",
  project: "Project",
  job: "Job",
};

function TimelineDot({ status }) {
  if (status === "completed") {
    return (
      <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#1DB32F] text-white shadow-sm">
        <FiCheckCircle className="w-5 h-5" />
      </span>
    );
  }
  if (status === "in_progress") {
    return (
      <span className="flex items-center justify-center w-9 h-9 rounded-full bg-[#9bc87c] text-white shadow-sm ring-4 ring-[#9bc87c]/20">
        <span className="w-2.5 h-2.5 rounded-full bg-white" />
      </span>
    );
  }
  return (
    <span className="flex items-center justify-center w-9 h-9 rounded-full border-2 border-gray-300 bg-white text-gray-400">
      <FiCircle className="w-5 h-5" />
    </span>
  );
}

function StatusBadge({ status }) {
  const map = {
    completed: "bg-[#1DB32F]/10 text-[#1DB32F]",
    in_progress: "bg-[#9bc87c]/10 text-[#1e1e2d]",
    pending: "bg-gray-100 text-gray-700",
  };
  const label = status.replace("_", " ");
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[status] || map.pending}`}
    >
      {label}
    </span>
  );
}

export default function ManagePathwayPage() {
  const { pathwayId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((s) => s.auth);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshError, setRefreshError] = useState(null);
  const [data, setData] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [busyStepId, setBusyStepId] = useState(null);
  const [proofByStep, setProofByStep] = useState({});

  useEffect(() => {
    setExpandedId(null);
    setError(null);
    setRefreshError(null);
    setData(null);
  }, [pathwayId]);

  const load = useCallback(async () => {
    if (!pathwayId || !token) return false;
    setLoading(true);
    setRefreshError(null);
    let dashboardLoaded = false;
    try {
      const res = await fetch(`${BASE_URL}/pathways/learning/${pathwayId}/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Failed to load pathway");
      }
      const payload = json.data && typeof json.data === "object" ? json.data : {};
      const stepList = Array.isArray(payload.steps) ? payload.steps : [];
      setData({
        ...payload,
        steps: stepList,
        learned_skills: Array.isArray(payload.learned_skills) ? payload.learned_skills : [],
        learned_sub_skills: Array.isArray(payload.learned_sub_skills)
          ? payload.learned_sub_skills
          : [],
      });
      dashboardLoaded = true;
      setError(null);
      const firstOpen = stepList.find((s) => s.status !== "completed");
      setExpandedId((id) => id ?? firstOpen?.id ?? stepList[0]?.id ?? null);
      return true;
    } catch (e) {
      const msg = e?.message || "Something went wrong";
      if (!dashboardLoaded) setError(msg);
      else setRefreshError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [pathwayId, token]);

  useEffect(() => {
    load();
  }, [load]);

  const steps = data?.steps || [];
  const stats = data?.stats;
  const pathway = data?.pathway;

  const remainingSteps = useMemo(
    () => steps.filter((s) => s.status !== "completed"),
    [steps]
  );

  const markInProgress = async (step) => {
    if (!token) return;
    setBusyStepId(step.id);
    try {
      const res = await fetch(
        `${BASE_URL}/pathways/learning/${pathwayId}/steps/${step.id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "in_progress" }),
        }
      );
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.message || "Update failed");
      await load();
    } catch (e) {
      await showErrorAlert("Could not update", e.message || "Update failed");
    } finally {
      setBusyStepId(null);
    }
  };

  const completeStep = async (step) => {
    if (!token) return;
    const needsProof = step.resource_type !== "job";
    if (needsProof && !proofByStep[step.id]) {
      alert("Please choose a screenshot or PDF to upload for this step.");
      return;
    }
    setBusyStepId(step.id);
    try {
      let res;
      if (needsProof) {
        const fd = new FormData();
        fd.append("pathwayProof", proofByStep[step.id]);
        res = await fetch(
          `${BASE_URL}/pathways/learning/${pathwayId}/steps/${step.id}/complete`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: fd,
          }
        );
      } else {
        const emptyFd = new FormData();
        res = await fetch(
          `${BASE_URL}/pathways/learning/${pathwayId}/steps/${step.id}/complete`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            body: emptyFd,
          }
        );
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.message || "Could not complete step");
      setProofByStep((prev) => {
        const next = { ...prev };
        delete next[step.id];
        return next;
      });
      const refreshed = await load();
      if (refreshed) {
        await showSuccessAlert("Step completed", "Your pathway progress was updated.");
      }
    } catch (e) {
      await showErrorAlert("Could not complete step", e.message || "Something went wrong");
    } finally {
      setBusyStepId(null);
    }
  };

  const openResource = (step) => {
    if (!step.resource_link) {
      alert("No link available for this resource.");
      return;
    }
    if (step.resource_link.startsWith("http")) {
      window.open(step.resource_link, "_blank", "noopener,noreferrer");
      return;
    }
    navigate(step.resource_link);
  };

  if (loading && !data) {
    return (
      <MainLayout heading="Manage Pathway">
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-gray-600">
          <FiLoader className="w-8 h-8 animate-spin text-[#9bc87c]" />
          <p>Loading pathway progress…</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !data) {
    return (
      <MainLayout heading="Manage Pathway">
        <div className="max-w-lg mx-auto p-6 text-center">
          <p className="text-red-600 mb-4">{error || "No data"}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-[#1e1e2d] text-white hover:bg-[#2a2a3b]"
          >
            Go back
          </button>
        </div>
      </MainLayout>
    );
  }

  const learnedSkills = Array.isArray(data.learned_skills) ? data.learned_skills : [];
  const learnedSubSkills = Array.isArray(data.learned_sub_skills) ? data.learned_sub_skills : [];

  return (
    <MainLayout heading="AI Prediction · Manage Pathway">
      <div className="max-w-5xl mx-auto px-4 py-6 md:px-6">
        {/* <button
          type="button"
          onClick={() =>
            pathwayId ? navigate(`/pathways/${pathwayId}`) : navigate(-1)
          }
          className="flex items-center gap-2 text-gray-600 hover:text-[#1e1e2d] mb-6 transition-colors"
        >
          <FiArrowLeft /> Back to pathway overview
        </button> */}

        <GreenPrimaryButton 
          onClick={() => pathwayId ? navigate(`/pathways/${pathwayId}`) : navigate(-1)}
          className="mb-6"
        >
          Back to pathway overview
        </GreenPrimaryButton>

        {refreshError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 flex flex-wrap items-center justify-between gap-2">
            <span>{refreshError}</span>
            <button
              type="button"
              onClick={() => load()}
              className="shrink-0 px-3 py-1 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {loading && data && (
          <div className="mb-4 flex items-center gap-2 text-sm text-[#9bc87c]">
            <FiLoader className="w-4 h-4 animate-spin" />
            Updating pathway…
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#9bc87c]">Selected pathway</p>
              <h1 className="text-2xl font-bold text-[#1e1e2d] mt-1">
                {pathway?.target_display || "Learning pathway"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Rank #{pathway?.pathway_rank} · {pathway?.target_type?.replace("_", " ")}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Overall progress</p>
              <p className="text-3xl font-bold text-[#9bc87c]">
                {stats?.completion_percent ?? 0}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats?.completed_steps ?? 0} / {stats?.total_steps ?? 0} steps
              </p>
            </div>
          </div>
          <div className="mt-5 h-3 w-full bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#9bc87c] transition-all duration-500"
              style={{ width: `${stats?.completion_percent ?? 0}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-semibold text-[#1e1e2d]">Timeline</h2>
            <div className="relative">
              <div className="absolute left-[17px] top-2 bottom-2 w-0.5 bg-gray-200" aria-hidden />
              <ul className="space-y-6">
                {steps.map((step, idx) => {
                  const Icon = TYPE_ICONS[step.resource_type] || FiBookOpen;
                  const isOpen = expandedId === step.id;
                  const busy = busyStepId === step.id;
                  return (
                    <li key={step.id} className="relative flex gap-4 pl-1">
                      <div className="relative z-10 flex-shrink-0 pt-1">
                        <TimelineDot status={step.status} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <button
                          type="button"
                          onClick={() => setExpandedId(isOpen ? null : step.id)}
                          className="w-full text-left rounded-xl border border-gray-200 bg-white p-4 hover:border-[#9bc87c] transition-colors"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-2 min-w-0">
                              <Icon className="w-5 h-5 text-[#9bc87c] flex-shrink-0 mt-0.5" />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                  Step {idx + 1} · {TYPE_LABEL[step.resource_type] || step.resource_type}
                                </p>
                                <h3 className="font-semibold text-[#1e1e2d] truncate">
                                  {step.step_title}
                                </h3>
                              </div>
                            </div>
                            <StatusBadge status={step.status} />
                          </div>
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                            {step.description || "Follow the resource and mark progress when done."}
                          </p>
                        </button>

                        {isOpen && (
                          <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-4">
                            <div>
                              <h4 className="text-sm font-semibold text-[#1e1e2d] mb-2">
                                Resource details
                              </h4>
                              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                <div>
                                  <dt className="text-gray-500">Title</dt>
                                  <dd className="font-medium text-[#1e1e2d]">{step.resource_title}</dd>
                                </div>
                                <div>
                                  <dt className="text-gray-500">Platform / source</dt>
                                  <dd className="font-medium text-[#1e1e2d]">
                                    {step.platform_source || "—"}
                                  </dd>
                                </div>
                                {step.duration_label && (
                                  <div>
                                    <dt className="text-gray-500">Duration</dt>
                                    <dd className="font-medium text-[#1e1e2d]">{step.duration_label}</dd>
                                  </div>
                                )}
                              </dl>
                              {step.description && (
                                <p className="text-sm text-gray-700 mt-3">{step.description}</p>
                              )}
                              <div className="mt-3 flex flex-wrap gap-2">
                                <button
                                  type="button"
                                  onClick={() => openResource(step)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-sm font-medium text-[#1e1e2d] hover:bg-gray-50 transition-colors"
                                >
                                  <FiExternalLink className="w-4 h-4" />
                                  Open resource
                                </button>
                              </div>
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                Skills covered
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {(!Array.isArray(step.skills) || step.skills.length === 0) ? (
                                  <span className="text-sm text-gray-500">—</span>
                                ) : (
                                  step.skills.map((sk, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-800"
                                    >
                                      {sk.skill_name || sk.name || JSON.stringify(sk)}
                                    </span>
                                  ))
                                )}
                              </div>
                            </div>

                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                                Sub-skills
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {(!Array.isArray(step.sub_skills) || step.sub_skills.length === 0) ? (
                                  <span className="text-sm text-gray-500">—</span>
                                ) : (
                                  step.sub_skills.map((sk, i) => (
                                    <span
                                      key={i}
                                      className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800"
                                    >
                                      {sk.skill_name || sk.name || JSON.stringify(sk)}
                                    </span>
                                  ))
                                )}
                              </div>
                            </div>

                            {step.resource_type !== "job" && (
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Proof (screenshot or PDF) — required
                                </label>
                                <input
                                  type="file"
                                  accept="image/*,.pdf,application/pdf"
                                  disabled={step.status === "completed" || busy}
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    setProofByStep((prev) => {
                                      const next = { ...prev };
                                      if (f) next[step.id] = f;
                                      else delete next[step.id];
                                      return next;
                                    });
                                  }}
                                  className="block w-full text-sm text-gray-600"
                                />
                                {step.completion_file && (
                                  <a
                                    href={publicFileUrl(step.completion_file)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block mt-2 text-sm text-[#9bc87c] hover:text-[#8ab76b] hover:underline"
                                  >
                                    View uploaded proof
                                  </a>
                                )}
                              </div>
                            )}

                            <div className="flex flex-wrap gap-2 pt-2">
                              {step.status === "pending" && (
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => markInProgress(step)}
                                  className="px-4 py-2 rounded-lg bg-[#1e1e2d] text-white text-sm font-semibold hover:bg-[#2a2a3b] transition-colors disabled:opacity-50"
                                >
                                  {busy ? "…" : "Mark as in progress"}
                                </button>
                              )}
                              {step.status !== "completed" && (
                                <button
                                  type="button"
                                  disabled={busy}
                                  onClick={() => completeStep(step)}
                                  className="px-4 py-2 rounded-lg bg-[#9bc87c] text-white text-sm font-semibold hover:bg-[#8ab76b] transition-colors disabled:opacity-50"
                                >
                                  {busy ? "Saving…" : "Mark as completed"}
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="font-semibold text-[#1e1e2d] mb-3">Skills learned</h3>
              <p className="text-xs text-gray-500 mb-2">From completed steps</p>
              <div className="flex flex-wrap gap-1">
                {learnedSkills.length === 0 && (
                  <span className="text-sm text-gray-500">Complete steps to track skills.</span>
                )}
                {learnedSkills.map((s) => (
                  <span
                    key={s}
                    className="px-2 py-1 rounded-lg text-xs font-medium bg-[#9bc87c]/20 text-[#1e1e2d]"
                  >
                    {s}
                  </span>
                ))}
              </div>
              {learnedSubSkills.length > 0 && (
                <>
                  <p className="text-xs text-gray-500 mt-4 mb-2">Sub-skills</p>
                  <div className="flex flex-wrap gap-1">
                    {learnedSubSkills.map((s) => (
                      <span
                        key={s}
                        className="px-2 py-1 rounded-lg text-xs bg-gray-100 text-gray-800"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h3 className="font-semibold text-[#1e1e2d] mb-2">Remaining</h3>
              <p className="text-3xl font-bold text-[#1e1e2d]">{remainingSteps.length}</p>
              <p className="text-sm text-gray-500">steps left to complete</p>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                {remainingSteps.map((s) => (
                  <li key={s.id} className="flex items-center gap-2">
                    <FiCircle className="w-3 h-3 text-gray-400" />
                    <span className="truncate">{s.step_title}</span>
                  </li>
                ))}
                {remainingSteps.length === 0 && (
                  <li className="text-[#1DB32F] font-medium">All steps completed.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}