// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import axios from "axios";
// import { useSelector } from "react-redux";
// import { Link } from "react-router-dom";
// import MainLayout from "../../../components/layout/MainLayout";
// import Select from "react-select";
// import {
//   showErrorAlert,
//   showSuccessAlert,
//   showWarningAlert,
// } from "../../../utils/alertService";

// const BASE_URL = import.meta.env.VITE_BASE_URL;

// const emptyCourseRow = () => ({
//   course_id: "",
//   course_name: "",
//   is_hiring: false,
//   start_date: "",
//   intake: "",
// });

// export default function UniversityNotificationBoostPage() {
//   const { token } = useSelector((state) => state.auth);
//   const authHeaders = useMemo(
//     () => ({ headers: { Authorization: `Bearer ${token}` } }),
//     [token]
//   );

//   const [loading, setLoading] = useState(true);
//   const [credits, setCredits] = useState({
//     total_credits: 0,
//     used_credits: 0,
//     remaining_credits: 0,
//   });
//   const [courses, setCourses] = useState([]);
//   const [industries, setIndustries] = useState([]);
//   const [packs, setPacks] = useState([]);
//   const [history, setHistory] = useState([]);

//   const [courseRows, setCourseRows] = useState([emptyCourseRow()]);
//   const [selectedIndustries, setSelectedIndustries] = useState([]);
//   const [message, setMessage] = useState("");
//   const [preview, setPreview] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [buyingPack, setBuyingPack] = useState(null);
//   const [detailId, setDetailId] = useState(null);
//   const [detail, setDetail] = useState(null);

//   const loadAll = useCallback(async () => {
//     setLoading(true);
//     try {
//       const settled = await Promise.allSettled([
//         axios.get(`${BASE_URL}/university/notification-boost/credits`, authHeaders),
//         axios.get(`${BASE_URL}/university/notification-boost/options`, authHeaders),
//         axios.get(`${BASE_URL}/university/notification-boost/packs`, authHeaders),
//         axios.get(`${BASE_URL}/university/notification-boost/history`, authHeaders),
//       ]);

//       const [cRes, oRes, pRes, hRes] = settled;

//       if (cRes.status === "fulfilled" && cRes.value?.data) {
//         setCredits(cRes.value.data);
//       } else {
//         setCredits({
//           total_credits: 0,
//           used_credits: 0,
//           remaining_credits: 0,
//         });
//       }

//       if (oRes.status === "fulfilled" && oRes.value?.data) {
//         setCourses(oRes.value.data.courses || []);
//         setIndustries(oRes.value.data.industries || []);
//       } else {
//         setCourses([]);
//         setIndustries([]);
//         if (oRes.status === "rejected") {
//           console.error(oRes.reason);
//           showErrorAlert(
//             oRes.reason?.response?.data?.error ||
//               "Could not load courses and industries."
//           );
//         }
//       }

//       if (pRes.status === "fulfilled" && pRes.value?.data?.packs) {
//         setPacks(pRes.value.data.packs);
//       } else {
//         setPacks([]);
//       }

//       if (hRes.status === "fulfilled" && Array.isArray(hRes.value?.data)) {
//         setHistory(hRes.value.data);
//       } else {
//         setHistory([]);
//       }
//     } catch (e) {
//       console.error(e);
//       showErrorAlert(
//         e.response?.data?.error || "Failed to load notification boost data"
//       );
//     } finally {
//       setLoading(false);
//     }
//   }, [authHeaders]);

//   useEffect(() => {
//     loadAll();
//   }, [loadAll]);

//   const industryOptions = useMemo(
//     () =>
//       industries.map((i) => ({
//         value: Number(i.id),
//         label: i.name,
//       })),
//     [industries]
//   );

//   const getIndustryIds = useCallback(
//     () =>
//       selectedIndustries
//         .map((x) => Number(x?.value))
//         .filter((n) => Number.isFinite(n) && n > 0),
//     [selectedIndustries]
//   );

//   const courseOptions = useMemo(
//     () => courses.map((c) => ({ value: c.id, label: c.name })),
//     [courses]
//   );

//   const runPreview = async () => {
//     const industry_ids = getIndustryIds();
//     if (!industry_ids.length) {
//       showErrorAlert("Select at least one industry for preview.");
//       return;
//     }
//     try {
//       const { data } = await axios.post(
//         `${BASE_URL}/university/notification-boost/preview`,
//         { industry_ids },
//         authHeaders
//       );
//       setPreview(data);
//       if ((data.pool_count ?? 0) === 0) {
//         showWarningAlert(
//           "No companies found",
//           data.message ||
//             "No companies match these industries yet. Try different industries, or ask companies to set their industry on their recruiter profile."
//         );
//       }
//     } catch (e) {
//       const d = e.response?.data;
//       showErrorAlert(d?.message || d?.error || "Preview failed");
//     }
//   };

//   const addCourseRow = () =>
//     setCourseRows((rows) => [...rows, emptyCourseRow()]);

//   const removeCourseRow = (idx) =>
//     setCourseRows((rows) => rows.filter((_, i) => i !== idx));

//   const updateCourseRow = (idx, patch) =>
//     setCourseRows((rows) =>
//       rows.map((r, i) => (i === idx ? { ...r, ...patch } : r))
//     );

//   const handleSubmit = async () => {
//     const industry_ids = getIndustryIds();
//     if (!industry_ids.length) {
//       showErrorAlert("Select industries.");
//       return;
//     }
//     const course_rows = courseRows.map((r) => ({
//       course_id: r.course_id || null,
//       course_name: r.course_name,
//       is_hiring: r.is_hiring,
//       start_date: r.start_date || null,
//       intake: r.intake === "" ? null : r.intake,
//     }));
//     if (course_rows.some((r) => !r.course_name?.trim())) {
//       showErrorAlert("Each course row needs a course name.");
//       return;
//     }

//     // Run preview first to surface any zero-target / credit issues before submitting
//     try {
//       const previewResp = await axios.post(
//         `${BASE_URL}/university/notification-boost/preview`,
//         { industry_ids },
//         authHeaders
//       );
//       const pv = previewResp.data || {};
//       if (pv.success === false) {
//         showErrorAlert(pv.message || "Preview could not run.");
//         return;
//       }
//       if ((pv.pool_count || 0) <= 0 || (pv.companies_to_target || 0) <= 0) {
//         await showWarningAlert(
//           "No companies to notify",
//           pv.message ||
//             "No companies match your selected industries. Try different industries or check company profiles."
//         );
//         return;
//       }
//       if ((pv.credits_to_use || 0) > (pv.remaining_credits || 0)) {
//         showErrorAlert(
//           `Insufficient notification credits. Need ${pv.credits_to_use}, have ${pv.remaining_credits}.`
//         );
//         return;
//       }
//     } catch (e) {
//       const d = e.response?.data;
//       showErrorAlert(d?.message || d?.error || "Preview failed");
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const { data } = await axios.post(
//         `${BASE_URL}/university/notification-boost/submit`,
//         { course_rows, industry_ids, message },
//         authHeaders
//       );
//       showSuccessAlert(data.message || "Boost queued.");
//       setPreview(null);
//       loadAll();
//     } catch (e) {
//       const d = e.response?.data;
//       showErrorAlert(d?.message || d?.error || "Submit failed");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const buyPack = async (pack) => {
//     setBuyingPack(pack.credits);
//     try {
//       const { data } = await axios.post(
//         `${BASE_URL}/university/notification-boost/payment/create-order`,
//         { credits: pack.credits },
//         authHeaders
//       );
//       if (!window.Razorpay) {
//         await new Promise((resolve, reject) => {
//           const s = document.createElement("script");
//           s.src = "https://checkout.razorpay.com/v1/checkout.js";
//           s.onload = resolve;
//           s.onerror = reject;
//           document.body.appendChild(s);
//         });
//       }
//       const options = {
//         key: import.meta.env.VITE_RAZORPAY_API_KEY,
//         amount: Math.round(Number(data.total_amount) * 100),
//         currency: "INR",
//         name: "Job Portal",
//         description: `${data.credits} notification credits`,
//         order_id: data.razorpay_order_id,
//         handler: () => {
//           showSuccessAlert("Payment recorded. Credits update in a moment.");
//           setTimeout(loadAll, 2000);
//           setBuyingPack(null);
//         },
//         prefill: {},
//         theme: { color: "#2563eb" },
//         modal: {
//           ondismiss: () => setBuyingPack(null),
//         },
//       };
//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (e) {
//       showErrorAlert(e.response?.data?.error || "Payment start failed");
//       setBuyingPack(null);
//     }
//   };

//   const openDetail = async (id) => {
//     setDetailId(id);
//     try {
//       const { data } = await axios.get(
//         `${BASE_URL}/university/notification-boost/requests/${id}`,
//         authHeaders
//       );
//       setDetail(data);
//     } catch (e) {
//       showErrorAlert(e.response?.data?.error || "Could not load details");
//       setDetailId(null);
//     }
//   };

//   if (loading) {
//     return (
//       <MainLayout heading="Notification Boost">
//         <div className="flex justify-center py-20 text-gray-600">Loading…</div>
//       </MainLayout>
//     );
//   }

//   return (
//     <MainLayout heading="Notification Boost">
//       <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
//         <div className="flex flex-wrap items-center justify-between gap-4">
//           <p className="text-gray-600 text-sm">
//             Reach active companies by industry.{" "}
//             <strong>1 company = 1 credit.</strong> Default balance includes{" "}
//             <strong>1000</strong> credits when you first use this feature.
//           </p>
//           <Link
//             to="/university/notifications"
//             className="text-sm text-blue-600 hover:underline"
//           >
//             Legacy broadcast
//           </Link>
//         </div>

//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//           <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
//             <p className="text-xs text-gray-500 uppercase">Total credits</p>
//             <p className="text-2xl font-bold text-gray-900">
//               {credits.total_credits}
//             </p>
//           </div>
//           <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
//             <p className="text-xs text-gray-500 uppercase">Used</p>
//             <p className="text-2xl font-bold text-amber-700">
//               {credits.used_credits}
//             </p>
//           </div>
//           <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
//             <p className="text-xs text-gray-500 uppercase">Remaining</p>
//             <p className="text-2xl font-bold text-emerald-700">
//               {credits.remaining_credits}
//             </p>
//           </div>
//         </div>

//         <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
//           <h3 className="font-semibold text-gray-900 mb-3">Buy more credits</h3>
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
//             {packs.map((p) => (
//               <div
//                 key={p.credits}
//                 className="border border-gray-100 rounded-lg p-4 flex flex-col gap-2"
//               >
//                 <p className="font-medium text-gray-800">{p.credits} credits</p>
//                 <p className="text-sm text-gray-600">
//                   ₹{Number(p.total_amount).toLocaleString("en-IN")} incl. GST
//                 </p>
//                 <button
//                   type="button"
//                   onClick={() => buyPack(p)}
//                   disabled={buyingPack === p.credits}
//                   className="mt-auto py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
//                 >
//                   {buyingPack === p.credits ? "Opening…" : "Buy credits"}
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>

//         <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-5">
//           <h3 className="font-semibold text-gray-900">Create notification boost</h3>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Courses (add one or more rows)
//             </label>
//             <div className="space-y-3">
//               {courseRows.map((row, idx) => (
//                 <div
//                   key={idx}
//                   className="flex flex-col md:flex-row md:flex-wrap gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50"
//                 >
//                   <div className="min-w-[200px] flex-1">
//                     <Select
//                       options={courseOptions}
//                       placeholder="Course"
//                       value={
//                         courseOptions.find((o) => o.value === row.course_id) ||
//                         null
//                       }
//                       onChange={(opt) =>
//                         updateCourseRow(idx, {
//                           course_id: opt?.value || "",
//                           course_name: opt?.label || "",
//                         })
//                       }
//                     />
//                   </div>
//                   <label className="flex items-center gap-2 text-sm text-gray-700">
//                     <input
//                       type="checkbox"
//                       checked={row.is_hiring}
//                       onChange={(e) =>
//                         updateCourseRow(idx, { is_hiring: e.target.checked })
//                       }
//                     />
//                     Is hiring
//                   </label>
//                   <input
//                     type="date"
//                     className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
//                     value={row.start_date}
//                     onChange={(e) =>
//                       updateCourseRow(idx, { start_date: e.target.value })
//                     }
//                   />
//                   <input
//                     type="number"
//                     min={0}
//                     placeholder="Intake (optional)"
//                     className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-36"
//                     value={row.intake}
//                     onChange={(e) =>
//                       updateCourseRow(idx, { intake: e.target.value })
//                     }
//                   />
//                   <button
//                     type="button"
//                     onClick={() => removeCourseRow(idx)}
//                     className="text-sm text-red-600 hover:underline md:ml-auto"
//                     disabled={courseRows.length === 1}
//                   >
//                     Remove
//                   </button>
//                 </div>
//               ))}
//             </div>
//             <button
//               type="button"
//               onClick={addCourseRow}
//               className="mt-2 text-sm text-blue-600 hover:underline"
//             >
//               + Add course row
//             </button>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Industries
//             </label>
//             <Select
//               isMulti
//               options={industryOptions}
//               value={selectedIndustries}
//               onChange={setSelectedIndustries}
//               placeholder="Select industries"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Message (optional)
//             </label>
//             <textarea
//               className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-[80px]"
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               placeholder="Optional note to companies"
//             />
//           </div>

//           <div className="flex flex-wrap gap-3 items-center">
//             <button
//               type="button"
//               onClick={runPreview}
//               className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 text-sm font-medium hover:bg-gray-50"
//             >
//               Preview reach
//             </button>
//             {preview && (
//               <div className="text-sm text-gray-700 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 space-y-1">
//                 <p>
//                   <strong>{preview.companies_to_target ?? 0}</strong> companies
//                   will receive invites (capped by your remaining credits).
//                 </p>
//                 <p>
//                   Credits to use: <strong>{preview.credits_to_use ?? 0}</strong>{" "}
//                   · Remaining balance:{" "}
//                   <strong>{preview.remaining_credits ?? 0}</strong>
//                 </p>
//                 {(preview.pool_count ?? 0) === 0 && preview.message && (
//                   <p className="text-amber-800">{preview.message}</p>
//                 )}
//               </div>
//             )}
//           </div>

//           <button
//             type="button"
//             onClick={handleSubmit}
//             disabled={submitting}
//             className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
//           >
//             {submitting ? "Sending…" : "Send notification boost"}
//           </button>
//         </div>

//         <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm overflow-x-auto">
//           <h3 className="font-semibold text-gray-900 mb-3">History</h3>
//           <table className="min-w-full text-sm">
//             <thead>
//               <tr className="text-left text-gray-500 border-b">
//                 <th className="py-2 pr-4">Date</th>
//                 <th className="py-2 pr-4">Courses</th>
//                 <th className="py-2 pr-4">Industries</th>
//                 <th className="py-2 pr-4">Companies</th>
//                 <th className="py-2 pr-4">Credits</th>
//                 <th className="py-2 pr-4">Status</th>
//                 <th className="py-2">Details</th>
//               </tr>
//             </thead>
//             <tbody>
//               {history.map((h) => (
//                 <tr key={h.id} className="border-b border-gray-100">
//                   <td className="py-2 pr-4 whitespace-nowrap">
//                     {h.created_at
//                       ? new Date(h.created_at).toLocaleString()
//                       : "—"}
//                   </td>
//                   <td className="py-2 pr-4 max-w-[200px] truncate">
//                     {(h.courses || [])
//                       .map((c) => c.course_name || c.name)
//                       .filter(Boolean)
//                       .join(", ") || "—"}
//                   </td>
//                   <td className="py-2 pr-4 max-w-[200px] truncate">
//                     {(h.industries || []).map((i) => i.name).join(", ") || "—"}
//                   </td>
//                   <td className="py-2 pr-4">{h.companies_targeted}</td>
//                   <td className="py-2 pr-4">{h.credits_used}</td>
//                   <td className="py-2 pr-4 capitalize">{h.status}</td>
//                   <td className="py-2">
//                     <button
//                       type="button"
//                       className="text-blue-600 hover:underline"
//                       onClick={() => openDetail(h.id)}
//                     >
//                       View
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           {history.length === 0 && (
//             <p className="text-gray-500 text-sm py-4">No boosts yet.</p>
//           )}
//         </div>

//         {detailId && detail && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
//             <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-5 shadow-xl">
//               <div className="flex justify-between items-center mb-3">
//                 <h4 className="font-semibold text-lg">Boost #{detail.request.id}</h4>
//                 <button
//                   type="button"
//                   className="text-gray-500 hover:text-gray-800"
//                   onClick={() => {
//                     setDetailId(null);
//                     setDetail(null);
//                   }}
//                 >
//                   ✕
//                 </button>
//               </div>
//               <p className="text-sm text-gray-600 mb-2">
//                 Status:{" "}
//                 <span className="font-medium capitalize">
//                   {detail.request.status}
//                 </span>
//               </p>
//               {detail.request.progress && (
//                 <div className="text-sm text-gray-700 mb-4 space-y-1 bg-gray-50 rounded-lg p-3">
//                   <p>
//                     Total targeted:{" "}
//                     <strong>{detail.request.progress.total}</strong>
//                   </p>
//                   <p>
//                     In-app sent:{" "}
//                     <strong>
//                       {detail.request.progress.notifications_sent}
//                     </strong>
//                   </p>
//                   <p>
//                     Emails sent:{" "}
//                     <strong>{detail.request.progress.emails_sent}</strong>
//                   </p>
//                   <p>
//                     Failed: <strong>{detail.request.progress.failed}</strong>
//                   </p>
//                   {detail.request.progress.success_percent != null && (
//                     <p>
//                       Success:{" "}
//                       <strong>{detail.request.progress.success_percent}%</strong>
//                     </p>
//                   )}
//                 </div>
//               )}
//               <p className="text-xs text-gray-500">
//                 Log rows: {detail.logs?.length || 0}
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </MainLayout>
//   );
// }



import React, { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import MainLayout from "../../../components/layout/MainLayout";
import Select from "react-select";
import {
  showErrorAlert,
  showSuccessAlert,
  showWarningAlert,
} from "../../../utils/alertService";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const emptyCourseRow = () => ({
  course_id: "",
  course_name: "",
  is_hiring: false,
  start_date: "",
  intake: "",
});

export default function UniversityNotificationBoostPage() {
  const { token } = useSelector((state) => state.auth);
  const authHeaders = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState({
    total_credits: 0,
    used_credits: 0,
    remaining_credits: 0,
  });
  const [courses, setCourses] = useState([]);
  const [industries, setIndustries] = useState([]);
  const [packs, setPacks] = useState([]);
  const [history, setHistory] = useState([]);

  const [courseRows, setCourseRows] = useState([emptyCourseRow()]);
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [message, setMessage] = useState("");
  const [preview, setPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [buyingPack, setBuyingPack] = useState(null);
  const [detailId, setDetailId] = useState(null);
  const [detail, setDetail] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const settled = await Promise.allSettled([
        axios.get(`${BASE_URL}/university/notification-boost/credits`, authHeaders),
        axios.get(`${BASE_URL}/university/notification-boost/options`, authHeaders),
        axios.get(`${BASE_URL}/university/notification-boost/packs`, authHeaders),
        axios.get(`${BASE_URL}/university/notification-boost/history`, authHeaders),
      ]);

      const [cRes, oRes, pRes, hRes] = settled;

      if (cRes.status === "fulfilled" && cRes.value?.data) {
        setCredits(cRes.value.data);
      } else {
        setCredits({
          total_credits: 0,
          used_credits: 0,
          remaining_credits: 0,
        });
      }

      if (oRes.status === "fulfilled" && oRes.value?.data) {
        setCourses(oRes.value.data.courses || []);
        setIndustries(oRes.value.data.industries || []);
      } else {
        setCourses([]);
        setIndustries([]);
        if (oRes.status === "rejected") {
          console.error(oRes.reason);
          showErrorAlert(
            oRes.reason?.response?.data?.error ||
              "Could not load courses and industries."
          );
        }
      }

      if (pRes.status === "fulfilled" && pRes.value?.data?.packs) {
        setPacks(pRes.value.data.packs);
      } else {
        setPacks([]);
      }

      if (hRes.status === "fulfilled" && Array.isArray(hRes.value?.data)) {
        setHistory(hRes.value.data);
      } else {
        setHistory([]);
      }
    } catch (e) {
      console.error(e);
      showErrorAlert(
        e.response?.data?.error || "Failed to load notification boost data"
      );
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const industryOptions = useMemo(
    () =>
      industries.map((i) => ({
        value: Number(i.id),
        label: i.name,
      })),
    [industries]
  );

  const getIndustryIds = useCallback(
    () =>
      selectedIndustries
        .map((x) => Number(x?.value))
        .filter((n) => Number.isFinite(n) && n > 0),
    [selectedIndustries]
  );

  const courseOptions = useMemo(
    () => courses.map((c) => ({ value: c.id, label: c.name })),
    [courses]
  );

  const runPreview = async () => {
    const industry_ids = getIndustryIds();
    if (!industry_ids.length) {
      showErrorAlert("Select at least one industry for preview.");
      return;
    }
    try {
      const { data } = await axios.post(
        `${BASE_URL}/university/notification-boost/preview`,
        { industry_ids },
        authHeaders
      );
      setPreview(data);
      if ((data.pool_count ?? 0) === 0) {
        showWarningAlert(
          "No companies found",
          data.message ||
            "No companies match these industries yet. Try different industries, or ask companies to set their industry on their recruiter profile."
        );
      }
    } catch (e) {
      const d = e.response?.data;
      showErrorAlert(d?.message || d?.error || "Preview failed");
    }
  };

  const addCourseRow = () =>
    setCourseRows((rows) => [...rows, emptyCourseRow()]);

  const removeCourseRow = (idx) =>
    setCourseRows((rows) => rows.filter((_, i) => i !== idx));

  const updateCourseRow = (idx, patch) =>
    setCourseRows((rows) =>
      rows.map((r, i) => (i === idx ? { ...r, ...patch } : r))
    );

  const handleSubmit = async () => {
    const industry_ids = getIndustryIds();
    if (!industry_ids.length) {
      showErrorAlert("Select industries.");
      return;
    }
    const course_rows = courseRows.map((r) => ({
      course_id: r.course_id || null,
      course_name: r.course_name,
      is_hiring: r.is_hiring,
      start_date: r.start_date || null,
      intake: r.intake === "" ? null : r.intake,
    }));
    if (course_rows.some((r) => !r.course_name?.trim())) {
      showErrorAlert("Each course row needs a course name.");
      return;
    }

    // Run preview first to surface any zero-target / credit issues before submitting
    try {
      const previewResp = await axios.post(
        `${BASE_URL}/university/notification-boost/preview`,
        { industry_ids },
        authHeaders
      );
      const pv = previewResp.data || {};
      if (pv.success === false) {
        showErrorAlert(pv.message || "Preview could not run.");
        return;
      }
      if ((pv.pool_count || 0) <= 0 || (pv.companies_to_target || 0) <= 0) {
        await showWarningAlert(
          "No companies to notify",
          pv.message ||
            "No companies match your selected industries. Try different industries or check company profiles."
        );
        return;
      }
      if ((pv.credits_to_use || 0) > (pv.remaining_credits || 0)) {
        showErrorAlert(
          `Insufficient notification credits. Need ${pv.credits_to_use}, have ${pv.remaining_credits}.`
        );
        return;
      }
    } catch (e) {
      const d = e.response?.data;
      showErrorAlert(d?.message || d?.error || "Preview failed");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await axios.post(
        `${BASE_URL}/university/notification-boost/submit`,
        { course_rows, industry_ids, message },
        authHeaders
      );
      showSuccessAlert(data.message || "Boost queued.");
      setPreview(null);
      loadAll();
    } catch (e) {
      const d = e.response?.data;
      showErrorAlert(d?.message || d?.error || "Submit failed");
    } finally {
      setSubmitting(false);
    }
  };

  const buyPack = async (pack) => {
    setBuyingPack(pack.credits);
    try {
      const { data } = await axios.post(
        `${BASE_URL}/university/notification-boost/payment/create-order`,
        { credits: pack.credits },
        authHeaders
      );
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const s = document.createElement("script");
          s.src = "https://checkout.razorpay.com/v1/checkout.js";
          s.onload = resolve;
          s.onerror = reject;
          document.body.appendChild(s);
        });
      }
      const options = {
        key: import.meta.env.VITE_RAZORPAY_API_KEY,
        amount: Math.round(Number(data.total_amount) * 100),
        currency: "INR",
        name: "Job Portal",
        description: `${data.credits} notification credits`,
        order_id: data.razorpay_order_id,
        handler: () => {
          showSuccessAlert("Payment recorded. Credits update in a moment.");
          setTimeout(loadAll, 2000);
          setBuyingPack(null);
        },
        prefill: {},
        theme: { color: "#2563eb" },
        modal: {
          ondismiss: () => setBuyingPack(null),
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e) {
      showErrorAlert(e.response?.data?.error || "Payment start failed");
      setBuyingPack(null);
    }
  };

  const openDetail = async (id) => {
    setDetailId(id);
    try {
      const { data } = await axios.get(
        `${BASE_URL}/university/notification-boost/requests/${id}`,
        authHeaders
      );
      setDetail(data);
    } catch (e) {
      showErrorAlert(e.response?.data?.error || "Could not load details");
      setDetailId(null);
    }
  };

  if (loading) {
    return (
      <MainLayout heading="Notification Boost">
        <div className="flex justify-center py-20 text-gray-600">Loading…</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout heading="Notification Boost">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-gray-600 text-sm">
            Reach active companies by industry.{" "}
            <strong>1 company = 1 credit.</strong> Default balance includes{" "}
            <strong>1000</strong> credits when you first use this feature.
          </p>
          <Link
            to="/university/notifications"
            className="text-sm text-blue-600 hover:underline"
          >
            Legacy broadcast
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase">Total credits</p>
            <p className="text-2xl font-bold text-gray-900">
              {credits.total_credits}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase">Used</p>
            <p className="text-2xl font-bold text-amber-700">
              {credits.used_credits}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500 uppercase">Remaining</p>
            <p className="text-2xl font-bold text-emerald-700">
              {credits.remaining_credits}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-3">Buy more credits</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {packs.map((p) => (
              <div
                key={p.credits}
                className="border border-gray-100 rounded-lg p-4 flex flex-col gap-2"
              >
                <p className="font-medium text-gray-800">{p.credits} credits</p>
                <p className="text-sm text-gray-600">
                  ₹{Number(p.total_amount).toLocaleString("en-IN")} incl. GST
                </p>
                <button
                  type="button"
                  onClick={() => buyPack(p)}
                  disabled={buyingPack === p.credits}
                  className="mt-auto py-2 rounded-lg bg-[#9bc87c] text-white text-sm font-medium hover:bg-[#86b36a] disabled:opacity-50"
                >
                  {buyingPack === p.credits ? "Opening…" : "Buy credits"}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-5">
          <h3 className="font-semibold text-gray-900">Create notification boost</h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Courses (add one or more rows)
            </label>
            <div className="space-y-3">
              {courseRows.map((row, idx) => (
                <div
                  key={idx}
                  className="flex flex-col md:flex-row md:flex-wrap gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50"
                >
                  <div className="min-w-[200px] flex-1">
                    <Select
                      options={courseOptions}
                      placeholder="Course"
                      value={
                        courseOptions.find((o) => o.value === row.course_id) ||
                        null
                      }
                      onChange={(opt) =>
                        updateCourseRow(idx, {
                          course_id: opt?.value || "",
                          course_name: opt?.label || "",
                        })
                      }
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      checked={row.is_hiring}
                      onChange={(e) =>
                        updateCourseRow(idx, { is_hiring: e.target.checked })
                      }
                    />
                    Is hiring
                  </label>
                  <input
                    type="date"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    value={row.start_date}
                    onChange={(e) =>
                      updateCourseRow(idx, { start_date: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="Intake (optional)"
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-36"
                    value={row.intake}
                    onChange={(e) =>
                      updateCourseRow(idx, { intake: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeCourseRow(idx)}
                    className="text-sm text-red-600 hover:underline md:ml-auto"
                    disabled={courseRows.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addCourseRow}
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              + Add course row
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industries
            </label>
            <Select
              isMulti
              options={industryOptions}
              value={selectedIndustries}
              onChange={setSelectedIndustries}
              placeholder="Select industries"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message (optional)
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm min-h-[80px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Optional note to companies"
            />
          </div>

          <div className="flex flex-wrap gap-3 items-center">
            <button
              type="button"
              onClick={runPreview}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-800 text-sm font-medium hover:bg-gray-50"
            >
              Preview reach
            </button>
            {preview && (
              <div className="text-sm text-gray-700 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 space-y-1">
                <p>
                  <strong>{preview.companies_to_target ?? 0}</strong> companies
                  will receive invites (capped by your remaining credits).
                </p>
                <p>
                  Credits to use: <strong>{preview.credits_to_use ?? 0}</strong>{" "}
                  · Remaining balance:{" "}
                  <strong>{preview.remaining_credits ?? 0}</strong>
                </p>
                {(preview.pool_count ?? 0) === 0 && preview.message && (
                  <p className="text-amber-800">{preview.message}</p>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#9bc87c] text-white font-semibold hover:bg-[#86b36a] disabled:opacity-50"
          >
            {submitting ? "Sending…" : "Send notification boost"}
          </button>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm overflow-x-auto">
          <h3 className="font-semibold text-gray-900 mb-3">History</h3>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-4">Date</th>
                <th className="py-2 pr-4">Courses</th>
                <th className="py-2 pr-4">Industries</th>
                <th className="py-2 pr-4">Companies</th>
                <th className="py-2 pr-4">Credits</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2">Details</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => {
                // Safely handle potential stringified JSON from the backend
                let safeCourses = [];
                let safeIndustries = [];
                
                try {
                  safeCourses = Array.isArray(h.courses) ? h.courses : (typeof h.courses === 'string' ? JSON.parse(h.courses) : []);
                } catch (e) { console.error("Failed to parse courses", e); }

                try {
                  safeIndustries = Array.isArray(h.industries) ? h.industries : (typeof h.industries === 'string' ? JSON.parse(h.industries) : []);
                } catch (e) { console.error("Failed to parse industries", e); }

                return (
                  <tr key={h.id} className="border-b border-gray-100">
                    <td className="py-2 pr-4 whitespace-nowrap">
                      {h.created_at
                        ? new Date(h.created_at).toLocaleString()
                        : "—"}
                    </td>
                    <td className="py-2 pr-4 max-w-[200px] truncate">
                      {safeCourses
                        .map((c) => c.course_name || c.name)
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </td>
                    <td className="py-2 pr-4 max-w-[200px] truncate">
                      {safeIndustries.map((i) => i.name).join(", ") || "—"}
                    </td>
                    <td className="py-2 pr-4">{h.companies_targeted}</td>
                    <td className="py-2 pr-4">{h.credits_used}</td>
                    <td className="py-2 pr-4 capitalize">{h.status}</td>
                    <td className="py-2">
                      <button
                        type="button"
                        className="text-blue-600 hover:underline"
                        onClick={() => openDetail(h.id)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {history.length === 0 && (
            <p className="text-gray-500 text-sm py-4">No boosts yet.</p>
          )}
        </div>

        {detailId && detail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-5 shadow-xl">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-lg">Boost #{detail.request.id}</h4>
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-800"
                  onClick={() => {
                    setDetailId(null);
                    setDetail(null);
                  }}
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Status:{" "}
                <span className="font-medium capitalize">
                  {detail.request.status}
                </span>
              </p>
              {detail.request.progress && (
                <div className="text-sm text-gray-700 mb-4 space-y-1 bg-gray-50 rounded-lg p-3">
                  <p>
                    Total targeted:{" "}
                    <strong>{detail.request.progress.total}</strong>
                  </p>
                  <p>
                    In-app sent:{" "}
                    <strong>
                      {detail.request.progress.notifications_sent}
                    </strong>
                  </p>
                  <p>
                    Emails sent:{" "}
                    <strong>{detail.request.progress.emails_sent}</strong>
                  </p>
                  <p>
                    Failed: <strong>{detail.request.progress.failed}</strong>
                  </p>
                  {detail.request.progress.success_percent != null && (
                    <p>
                      Success:{" "}
                      <strong>{detail.request.progress.success_percent}%</strong>
                    </p>
                  )}
                </div>
              )}
              <p className="text-xs text-gray-500">
                Log rows: {detail.logs?.length || 0}
              </p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}