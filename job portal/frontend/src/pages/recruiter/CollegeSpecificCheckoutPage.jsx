// import React, { useState, useEffect, useMemo } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useSelector } from "react-redux";
// import axios from "axios";
// import MainLayout from "../../components/layout/MainLayout";
// import { showErrorAlert, showSuccessAlert } from "../../utils/alertService";

// const BASE_URL = import.meta.env.VITE_BASE_URL;

// export default function CollegeSpecificCheckoutPage() {
//     const navigate = useNavigate();
//     const location = useLocation();
//     const { token } = useSelector((state) => state.auth);

//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const [checkoutData, setCheckoutData] = useState(null);
//     const [selectedBundleId, setSelectedBundleId] = useState(null);
//     const [selectedBundleType, setSelectedBundleType] = useState("existing");
//     const [selectedColleges, setSelectedColleges] = useState([]);
//     const [collegeSearch, setCollegeSearch] = useState("");
//     const [searchResults, setSearchResults] = useState([]);
//     const [tiedUpColleges, setTiedUpColleges] = useState([]);
//     const [isProcessing, setIsProcessing] = useState(false);
//     const [showBuyNewPlans, setShowBuyNewPlans] = useState(true);
//     const [buyingPlanId, setBuyingPlanId] = useState(null);
//     const [isBuyingBundle, setIsBuyingBundle] = useState(false);

//     const { job_id } = location.state || {};

//     useEffect(() => {
//         if (!job_id) {
//             setError("Missing job details");
//             setLoading(false);
//             return;
//         }
//         loadPreview();
//         loadTiedUpColleges();
//     }, [job_id]);

//     const loadTiedUpColleges = async () => {
//         try {
//             const response = await axios.get(
//                 `${BASE_URL}/company-recruiter/tiedup-colleges`,
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             if (response.data.success) {
//                 setTiedUpColleges(response.data.data);
//             }
//         } catch (err) {
//             console.error("Failed to load tied-up colleges:", err);
//         }
//     };

//     // const loadPreview = async () => {
//     //     try {
//     //         const response = await axios.get(
//     //             `${BASE_URL}/subscriptions/jobs/${job_id}/college-checkout`,
//     //             { headers: { Authorization: `Bearer ${token}` } }
//     //         );
//     //         const data = response.data;
//     //         setCheckoutData(data);
//     //         setSelectedColleges(data.colleges.map((c) => c.id));
//     //         if (data.bundles && data.bundles.length > 0) {
//     //             const validBundle = data.bundles.find(
//     //                 (b) => b.remaining >= data.college_count
//     //             );
//     //             if (validBundle) {
//     //                 setSelectedBundleId(validBundle.id);
//     //                 setSelectedBundleType("existing");
//     //             }
//     //         }
//     //     } catch (err) {
//     //         setError(err.response?.data?.error || "Failed to load checkout data");
//     //     } finally {
//     //         setLoading(false);
//     //     }
//     // };

//     const loadPreview = async () => {
//         try {
//             const response = await axios.get(
//                 `${BASE_URL}/subscriptions/jobs/${job_id}/college-checkout`,
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             const data = response.data;
//             setCheckoutData(data);
            
//             // Get the actual array of colleges
//             const initialColleges = data.colleges ? data.colleges.map((c) => c.id) : [];
//             setSelectedColleges(initialColleges);
            
//             // Find a valid bundle using strict Number comparisons
//             if (data.bundles && data.bundles.length > 0) {
//                 const validBundle = data.bundles.find(
//                     (b) => Number(b.remaining) >= initialColleges.length
//                 );
                
//                 if (validBundle) {
//                     setSelectedBundleId(validBundle.id);
//                     setSelectedBundleType("existing");
//                 }
//             }
//         } catch (err) {
//             setError(err.response?.data?.error || "Failed to load checkout data");
//         } finally {
//             setLoading(false);
//         }
//     };
//     const handleCollegeSearch = async (searchTerm) => {
//         if (searchTerm.length < 3) {
//             setSearchResults([]);
//             return;
//         }
//         const term = searchTerm.trim().toLowerCase();
//         const results = tiedUpColleges.filter(college => 
//             college.name && college.name.toLowerCase().includes(term)
//         );
//         setSearchResults(results);
//     };

//     const updateJobColleges = async (collegeIds) => {
//         try {
//             await axios.put(
//                 `${BASE_URL}/subscriptions/jobs/${job_id}/colleges`,
//                 { college_ids: collegeIds },
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//         } catch (err) {
//             console.error("Failed to update colleges:", err);
//         }
//     };

//     const selectedExistingBundle = useMemo(() => {
//         if (selectedBundleType !== "existing" || !selectedBundleId || !checkoutData?.bundles?.length) {
//             return null;
//         }
//         return checkoutData.bundles.find((b) => b.id === selectedBundleId) || null;
//     }, [selectedBundleType, selectedBundleId, checkoutData?.bundles]);

//     const maxCollegesAllowed = selectedExistingBundle
//         ? Number(selectedExistingBundle.remaining)
//         : null;

//     const handleAddCollege = (college) => {
//         if (maxCollegesAllowed != null && selectedColleges.length >= maxCollegesAllowed) {
//             showErrorAlert(
//                 maxCollegesAllowed === 1
//                     ? "This bundle allows only 1 college. Remove the current college to change selection."
//                     : `You can select up to ${maxCollegesAllowed} college(s) with the selected bundle.`
//             );
//             return;
//         }
//         if (!selectedColleges.includes(college.id)) {
//             const updated = [...selectedColleges, college.id];
//             setSelectedColleges(updated);
//             updateJobColleges(updated);
//         }
//         setCollegeSearch("");
//         setSearchResults([]);
//     };

//     const handleRemoveCollege = (collegeId) => {
//         const updated = selectedColleges.filter((id) => id !== collegeId);
//         setSelectedColleges(updated);
//         updateJobColleges(updated);
//     };

//     const selectExistingBundle = (bundle) => {
//         setSelectedBundleId(bundle.id);
//         setSelectedBundleType("existing");
//         const cap = Number(bundle.remaining);
//         if (Number.isFinite(cap) && cap > 0 && selectedColleges.length > cap) {
//             const trimmed = selectedColleges.slice(0, cap);
//             setSelectedColleges(trimmed);
//             updateJobColleges(trimmed);
//             showErrorAlert(
//                 cap === 1
//                     ? "Selection limited to 1 college for this bundle. Extra colleges were removed."
//                     : `Selection limited to ${cap} colleges for this bundle. Extra colleges were removed.`
//             );
//         }
//     };

//     const handleBuyNewBundle = async (plan) => {
//         if (!token) {
//             showErrorAlert("Please log in to purchase");
//             return;
//         }
//         if (!selectedColleges.length) {
//             showErrorAlert("Add at least one college before purchasing a bundle.");
//             return;
//         }
//         const planCredits = Number(plan.yearly_credits) || 0;
//         if (planCredits < selectedColleges.length) {
//             showErrorAlert(
//                 `This bundle covers ${planCredits} college(s). Remove extra colleges or choose a larger pack.`
//             );
//             return;
//         }

//         setIsBuyingBundle(true);
//         setBuyingPlanId(plan.plan_id);

//         try {
//             const response = await axios.post(
//                 `${BASE_URL}/subscriptions/credits/order`,
//                 { plan_id: plan.plan_id },
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );

//             if (!response.data.success) {
//                 throw new Error(response.data.message || "Order creation failed");
//             }

//             const { razorpay_order_id, total_amount, order_id } = response.data;

//             if (!window.Razorpay) {
//                 await new Promise((resolve, reject) => {
//                     const script = document.createElement("script");
//                     script.src = "https://checkout.razorpay.com/v1/checkout.js";
//                     script.onload = resolve;
//                     script.onerror = reject;
//                     document.body.appendChild(script);
//                 });
//             }

//             const options = {
//                 key: import.meta.env.VITE_RAZORPAY_API_KEY,
//                 amount: Math.round(total_amount * 100),
//                 currency: "INR",
//                 name: "JobPortal",
//                 description: `College Credits - ${plan.plan_name}`,
//                 order_id: razorpay_order_id,
//                 handler: async (paymentResponse) => {
//                     setBuyingPlanId(null);
//                     setIsBuyingBundle(false);

//                     setTimeout(async () => {
//                         await loadPreview();
//                         const newBundle = checkoutData?.bundles?.find(
//                             (b) =>
//                                 b.remaining >= selectedColleges.length &&
//                                 b.name === plan.plan_name
//                         );
//                         if (newBundle) {
//                             setSelectedBundleId(newBundle.id);
//                             setSelectedBundleType("existing");
//                         }
//                         showSuccessAlert(
//                             `Bundle purchased! Select it above to publish your job.`
//                         );
//                     }, 2000);
//                 },
//                 prefill: {
//                     email: localStorage.getItem("userEmail") || "",
//                     contact: localStorage.getItem("userPhone") || "",
//                 },
//                 theme: { color: "#3399cc" },
//                 modal: {
//                     ondismiss: () => {
//                         setIsBuyingBundle(false);
//                         setBuyingPlanId(null);
//                         showErrorAlert("Payment cancelled");
//                     },
//                 },
//             };

//             const rzp = new window.Razorpay(options);
//             rzp.open();
//         } catch (err) {
//             console.error("Bundle purchase error:", err);
//             showErrorAlert(err.response?.data?.message || "Failed to purchase bundle");
//             setIsBuyingBundle(false);
//             setBuyingPlanId(null);
//         }
//     };

//     const handlePublishJob = async () => {
//         if (!selectedBundleId) {
//             showErrorAlert("Please select a credit bundle or buy a new one");
//             return;
//         }
//         if (selectedColleges.length === 0) {
//             showErrorAlert("Please select at least one college");
//             return;
//         }

//         setIsProcessing(true);

//         try {
//             if (selectedBundleType === "existing") {
//                 const response = await axios.post(
//                     `${BASE_URL}/subscriptions/jobs/${job_id}/publish-college`,
//                     {
//                         bundle_id: selectedBundleId,
//                         college_ids: selectedColleges,
//                     },
//                     { headers: { Authorization: `Bearer ${token}` } }
//                 );

//                 const result = response.data;

//                 navigate("/recruiter/job-post-success", {
//                     state: {
//                         job_id,
//                         post_type: "college",
//                         credits_used: result.credits_used,
//                         confirmed: true,
//                     },
//                 });
//             } else {
//                 const response = await axios.post(
//                     `${BASE_URL}/subscriptions/jobs/${job_id}/college-checkout-pay`,
//                     {
//                         bundle_id: selectedBundleId,
//                         college_ids: selectedColleges,
//                     },
//                     { headers: { Authorization: `Bearer ${token}` } }
//                 );

//                 const paymentData = response.data;

//                 if (!window.Razorpay) {
//                     await new Promise((resolve, reject) => {
//                         const script = document.createElement("script");
//                         script.src = "https://checkout.razorpay.com/v1/checkout.js";
//                         script.onload = resolve;
//                         script.onerror = reject;
//                         document.body.appendChild(script);
//                     });
//                 }

//                 const options = {
//                     key: import.meta.env.VITE_RAZORPAY_API_KEY,
//                     amount: paymentData.total_amount * 100,
//                     currency: "INR",
//                     name: "JobPortal",
//                     description: `College Credits - ${paymentData.bundle_name}`,
//                     order_id: paymentData.razorpay_order_id,
//                     handler: async () => {
//                         setTimeout(async () => {
//                             const freshData = await loadPreview();
//                             const newBundle = freshData?.bundles?.find(
//                                 (b) =>
//                                     b.name === paymentData.bundle_name &&
//                                     b.remaining >= selectedColleges.length
//                             );
//                             if (newBundle) {
//                                 const publishResponse = await axios.post(
//                                     `${BASE_URL}/subscriptions/jobs/${job_id}/publish-college`,
//                                     {
//                                         bundle_id: newBundle.id,
//                                         college_ids: selectedColleges,
//                                     },
//                                     { headers: { Authorization: `Bearer ${token}` } }
//                                 );
//                                 const result = publishResponse.data;
//                                 navigate("/recruiter/job-post-success", {
//                                     state: {
//                                         job_id,
//                                         post_type: "college",
//                                         credits_used: result.credits_used,
//                                         confirmed: true,
//                                     },
//                                 });
//                             }
//                         }, 2000);
//                     },
//                     prefill: {
//                         email: localStorage.getItem("userEmail") || "",
//                         contact: localStorage.getItem("userPhone") || "",
//                     },
//                     theme: { color: "#3399cc" },
//                     modal: {
//                         ondismiss: () => {
//                             setIsProcessing(false);
//                             showErrorAlert("Payment cancelled");
//                         },
//                     },
//                 };

//                 const rzp = new window.Razorpay(options);
//                 rzp.open();
//             }
//         } catch (err) {
//             console.error("Publish error:", err);
//             showErrorAlert(err.response?.data?.error || "Failed to publish job");
//             setIsProcessing(false);
//         }
//     };

//     if (loading) {
//         return (
//             <MainLayout>
//                 <div className="flex items-center justify-center min-h-screen">
//                     <div className="text-center">
//                         <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//                         <p className="text-gray-600">Loading checkout...</p>
//                     </div>
//                 </div>
//             </MainLayout>
//         );
//     }

//     if (error) {
//         return (
//             <MainLayout>
//                 <div className="flex items-center justify-center min-h-screen">
//                     <div className="text-center max-w-md">
//                         <div className="text-5xl mb-4">⚠️</div>
//                         <p className="text-red-600 mb-4">{error}</p>
//                         <button
//                             onClick={() => navigate(-1)}
//                             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//                         >
//                             Go Back
//                         </button>
//                     </div>
//                 </div>
//             </MainLayout>
//         );
//     }

//     const selectedBundle = checkoutData?.bundles?.find(
//         (b) => b.id === selectedBundleId
//     );
//     const selectedPlan = checkoutData?.plans?.find(
//         (p) => p.plan_id === selectedBundleId
//     );

//     return (
//         <MainLayout heading="Complete College-Specific Posting">
//             <div className="max-w-4xl mx-auto p-6 space-y-6">
//                 <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-5 rounded-xl shadow-lg">
//                     <h2 className="text-xl font-bold">Review & Publish</h2>
//                     <p className="text-blue-100 text-sm mt-1">
//                         Secure payment via Razorpay • 18% GST included
//                     </p>
//                 </div>

//                 <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
//                     <h3 className="font-semibold text-gray-800 mb-3">Job Details</h3>
//                     <div className="grid grid-cols-2 gap-3 text-sm">
//                         <div>
//                             <span className="text-gray-500">Job ID:</span>
//                             <p className="font-medium text-gray-800">{checkoutData?.job_id}</p>
//                         </div>
//                         <div>
//                             <span className="text-gray-500">Colleges Selected:</span>
//                             <p className="font-medium text-gray-800">
//                                 {selectedColleges.length}
//                             </p>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
//                     <h3 className="font-semibold text-gray-800 mb-4">Manage Colleges</h3>
//                     {maxCollegesAllowed != null && (
//                         <p className="text-sm text-gray-600 mb-3">
//                             Selected bundle allows up to{" "}
//                             <span className="font-medium text-gray-800">{maxCollegesAllowed}</span>{" "}
//                             {maxCollegesAllowed === 1 ? "college" : "colleges"}.
//                         </p>
//                     )}

//                     {tiedUpColleges.length === 0 ? (
//                         <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl mb-4">
//                             <p className="text-gray-500 mb-2 font-medium">No tied-up colleges found.</p>
//                             <p className="text-sm text-gray-400">You must have an active tie-up with a college to post jobs directly to them.</p>
//                         </div>
//                     ) : (
//                         <div className="relative mb-4">
//                             <input
//                                 type="text"
//                                 placeholder="Search tied-up colleges (min 3 characters)..."
//                                 value={collegeSearch}
//                                 onChange={(e) => {
//                                     setCollegeSearch(e.target.value);
//                                     handleCollegeSearch(e.target.value);
//                                 }}
//                                 className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
//                             />
//                             {searchResults.length > 0 && (
//                                 <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
//                                     {searchResults.map((college) => (
//                                         <button
//                                             key={college.id}
//                                             type="button"
//                                             onClick={() => handleAddCollege(college)}
//                                             className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-3 transition"
//                                         >
//                                             {college.logo_pic && (
//                                                 <img
//                                                     src={college.logo_pic}
//                                                     alt=""
//                                                     className="w-8 h-8 rounded object-cover"
//                                                 />
//                                             )}
//                                             <span className="text-gray-800">{college.name}</span>
//                                         </button>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>
//                     )}

//                     <div className="flex flex-wrap gap-2">
//                         {selectedColleges.map((id) => {
//                             const college = checkoutData?.colleges?.find((c) => c.id === id) || tiedUpColleges.find((c) => c.id === id);
//                             return (
//                                 <span
//                                     key={id}
//                                     className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
//                                 >
//                                     {college?.name || `College ${id}`}
//                                     <button
//                                         type="button"
//                                         onClick={() => handleRemoveCollege(id)}
//                                         className="text-blue-600 hover:text-blue-800 font-bold"
//                                     >
//                                         ×
//                                     </button>
//                                 </span>
//                             );
//                         })}
//                     </div>
//                 </div>

//                 <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
//                     <h3 className="font-semibold text-gray-800 mb-4">
//                         Select Credit Bundle
//                     </h3>

//                     {checkoutData?.bundles?.length > 0 && (
//                         <div className="space-y-3 mb-5">
//                             <p className="text-sm text-gray-600">Your available bundles:</p>
//                             {checkoutData.bundles.map((bundle) => {
//                                 const waste = bundle.waste_warning;
//                                 const isSelected = selectedBundleId === bundle.id;
//                                 return (
//                                     <label
//                                         key={bundle.id}
//                                         className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${isSelected
//                                                 ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
//                                                 : "border-gray-200 hover:border-blue-300"
//                                             }`}
//                                         onClick={() => selectExistingBundle(bundle)}
//                                     >
//                                         <div className="flex-1">
//                                             <div className="flex items-center gap-2">
//                                                 <p className="font-semibold text-gray-800">
//                                                     {bundle.name}
//                                                 </p>
//                                                 {bundle.remaining === selectedColleges.length && (
//                                                     <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
//                                                         Perfect match
//                                                     </span>
//                                                 )}
//                                             </div>
//                                             <p className="text-sm text-gray-600 mt-1">
//                                                 {bundle.remaining} credits • Expires: {bundle.expiry}
//                                             </p>
//                                             {/* {waste > 0 && (
//                                                 <p className="text-sm text-orange-600 mt-1 font-medium">
//                                                     ⚠️ {waste} credits will be wasted
//                                                 </p>
//                                             )} */}
//                                         </div>
//                                         <input
//                                             type="radio"
//                                             name="bundle"
//                                             value={bundle.id}
//                                             checked={isSelected}
//                                             onChange={() => selectExistingBundle(bundle)}
//                                             className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
//                                         />
//                                     </label>
//                                 );
//                             })}
//                         </div>
//                     )}
                    

//                     <div className="pt-4 border-t border-gray-200">
//                         <button
//                             type="button"
//                             onClick={() => setShowBuyNewPlans(!showBuyNewPlans)}
//                             className="flex items-center justify-between w-full text-left text-sm font-medium text-blue-600 hover:text-blue-800 mb-3"
//                         >
//                             <span>Or buy a new bundle</span>
//                             <svg
//                                 className={`w-4 h-4 transition-transform ${showBuyNewPlans ? "rotate-180" : ""
//                                     }`}
//                                 fill="none"
//                                 stroke="currentColor"
//                                 viewBox="0 0 24 24"
//                             >
//                                 <path
//                                     strokeLinecap="round"
//                                     strokeLinejoin="round"
//                                     strokeWidth={2}
//                                     d="M19 9l-7 7-7-7"
//                                 />
//                             </svg>
//                         </button>

//                         {showBuyNewPlans && (
//                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                                 {(checkoutData?.plans || []).map((plan) => {
//                                     const isProcessing =
//                                         isBuyingBundle && buyingPlanId === plan.plan_id;
//                                     const planCredits = Number(plan.yearly_credits) || 0;
//                                     const hasEnough =
//                                         planCredits >= selectedColleges.length &&
//                                         selectedColleges.length > 0;
//                                     const waste =
//                                         planCredits > selectedColleges.length
//                                             ? planCredits - selectedColleges.length
//                                             : 0;

//                                     return (
//                                         <div
//                                             key={plan.plan_id}
//                                             className={`p-4 border-2 rounded-xl transition-all ${hasEnough
//                                                     ? "border-green-200 bg-green-50 hover:border-green-400"
//                                                     : "border-gray-200 hover:border-blue-300"
//                                                 }`}
//                                         >
//                                             <div className="flex items-start justify-between">
//                                                 <div>
//                                                     <p className="font-semibold text-gray-800">
//                                                         {plan.plan_name}
//                                                     </p>
//                                                     <p className="text-xl font-bold text-blue-600 mt-1">
//                                                         ₹{parseFloat(plan.yearly_price).toLocaleString()}
//                                                     </p>
//                                                     <p className="text-sm text-gray-600">
//                                                         {planCredits}{" "}
//                                                         {planCredits === 1 ? "college" : "colleges"} • 1 year
//                                                         validity
//                                                     </p>
//                                                     {/* {hasEnough && waste > 0 && (
//                                                         <p className="text-xs text-orange-600 mt-1">
//                                                             ⚠️ {waste} credits will be wasted for this job
//                                                         </p>
//                                                     )} */}
//                                                     {!hasEnough && (
//                                                         <p className="text-xs text-red-600 mt-1">
//                                                             {selectedColleges.length === 0
//                                                                 ? "❌ Add at least one college before buying this bundle."
//                                                                 : `❌ Not enough credits for ${selectedColleges.length} colleges`}
//                                                         </p>
//                                                     )}
//                                                 </div>
//                                                 {hasEnough && (
//                                                     <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
//                                                         ✓ Fits
//                                                     </span>
//                                                 )}
//                                             </div>

//                                             <button
//                                                 type="button"
//                                                 onClick={() => handleBuyNewBundle(plan)}
//                                                 disabled={isProcessing || !hasEnough}
//                                                 className={`w-full mt-3 py-2 px-4 rounded-lg font-medium text-sm transition ${isProcessing || !hasEnough
//                                                         ? "bg-gray-300 cursor-not-allowed text-gray-500"
//                                                         : "bg-blue-600 hover:bg-blue-700 text-white"
//                                                     }`}
//                                             >
//                                                 {isProcessing ? (
//                                                     <span className="flex items-center justify-center gap-2">
//                                                         <svg
//                                                             className="animate-spin h-4 w-4 text-white"
//                                                             xmlns="http://www.w3.org/2000/svg"
//                                                             fill="none"
//                                                             viewBox="0 0 24 24"
//                                                         >
//                                                             <circle
//                                                                 className="opacity-25"
//                                                                 cx="12"
//                                                                 cy="12"
//                                                                 r="10"
//                                                                 stroke="currentColor"
//                                                                 strokeWidth="4"
//                                                             ></circle>
//                                                             <path
//                                                                 className="opacity-75"
//                                                                 fill="currentColor"
//                                                                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                                                             ></path>
//                                                         </svg>
//                                                         Processing...
//                                                     </span>
//                                                 ) : (
//                                                     "Buy & Use for This Job"
//                                                 )}
//                                             </button>
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-blue-200 rounded-xl p-5">
//                     <div className="flex justify-between items-center mb-4">
//                         <span className="font-semibold text-gray-700">Total Colleges:</span>
//                         <span className="text-2xl font-bold text-blue-700">
//                             {selectedColleges.length}
//                         </span>
//                     </div>

//                     {selectedBundle && (
//                         <div className="mb-4 p-3 bg-white rounded-lg border border-blue-100">
//                             <p className="text-sm text-gray-600">
//                                 Using bundle:{" "}
//                                 <span className="font-medium text-gray-800">
//                                     {selectedBundle.name}
//                                 </span>
//                             </p>
//                         </div>
//                     )}

//                     <button
//                         onClick={handlePublishJob}
//                         disabled={
//                             isProcessing || !selectedBundleId || selectedColleges.length === 0
//                         }
//                         className={`w-full py-4 px-6 rounded-xl font-semibold text-white text-lg transition-all shadow-lg hover:shadow-xl ${isProcessing ||
//                                 !selectedBundleId ||
//                                 selectedColleges.length === 0
//                                 ? "bg-gray-400 cursor-not-allowed"
//                                 : "bg-blue-600 hover:bg-blue-700 active:scale-[0.99]"
//                             }`}
//                     >
//                         {isProcessing ? (
//                             <span className="flex items-center justify-center gap-2">
//                                 <svg
//                                     className="animate-spin h-5 w-5 text-white"
//                                     xmlns="http://www.w3.org/2000/svg"
//                                     fill="none"
//                                     viewBox="0 0 24 24"
//                                 >
//                                     <circle
//                                         className="opacity-25"
//                                         cx="12"
//                                         cy="12"
//                                         r="10"
//                                         stroke="currentColor"
//                                         strokeWidth="4"
//                                     ></circle>
//                                     <path
//                                         className="opacity-75"
//                                         fill="currentColor"
//                                         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                                     ></path>
//                                 </svg>
//                                 Processing...
//                             </span>
//                         ) : selectedBundleType === "existing" ? (
//                             `✅ Publish Job (${selectedColleges.length} Colleges)`
//                         ) : (
//                             `Buy Bundle & Publish Job (₹${selectedPlan?.yearly_price || 0
//                             })`
//                         )}
//                     </button>

//                     <p className="text-xs text-gray-500 text-center mt-3 flex items-center justify-center gap-1">
//                         <svg
//                             className="w-3 h-3"
//                             fill="none"
//                             stroke="currentColor"
//                             viewBox="0 0 24 24"
//                         >
//                             <path
//                                 strokeLinecap="round"
//                                 strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
//                             />
//                         </svg>
//                         Secure payment via Razorpay • One bundle = one job • Unused credits
//                         wasted
//                     </p>
//                 </div>
//             </div>
//         </MainLayout>
//     );
// }


import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import MainLayout from "../../components/layout/MainLayout";
import { showErrorAlert, showSuccessAlert } from "../../utils/alertService";

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Helper to identify the 100 pack
// You can adjust this if your database identifies it differently (e.g., by plan_id)
const isPack100 = (item) => {
    if (!item) return false;
    return (
        Number(item.yearly_price) === 100 ||
        item.name?.includes("100") ||
        item.plan_name?.includes("100")
    );
};

export default function CollegeSpecificCheckoutPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { token } = useSelector((state) => state.auth);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [checkoutData, setCheckoutData] = useState(null);
    const [selectedBundleId, setSelectedBundleId] = useState(null);
    const [selectedBundleType, setSelectedBundleType] = useState("existing");
    const [selectedColleges, setSelectedColleges] = useState([]);
    const [collegeSearch, setCollegeSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [tiedUpColleges, setTiedUpColleges] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showBuyNewPlans, setShowBuyNewPlans] = useState(true);
    const [buyingPlanId, setBuyingPlanId] = useState(null);
    const [isBuyingBundle, setIsBuyingBundle] = useState(false);

    const { job_id } = location.state || {};

    useEffect(() => {
        if (!job_id) {
            setError("Missing job details");
            setLoading(false);
            return;
        }
        loadPreview();
        loadTiedUpColleges();
    }, [job_id]);

    const loadTiedUpColleges = async () => {
        try {
            const response = await axios.get(
                `${BASE_URL}/company-recruiter/tiedup-colleges`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                setTiedUpColleges(response.data.data);
            }
        } catch (err) {
            console.error("Failed to load tied-up colleges:", err);
        }
    };

    const loadPreview = async () => {
        try {
            const response = await axios.get(
                `${BASE_URL}/subscriptions/jobs/${job_id}/college-checkout`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const data = response.data;
            setCheckoutData(data);
            
            const initialColleges = data.colleges ? data.colleges.map((c) => c.id) : [];
            setSelectedColleges(initialColleges);
            
            if (data.bundles && data.bundles.length > 0) {
                // Find a valid bundle (bypassing limit if it's the 100 pack)
                const validBundle = data.bundles.find(
                    (b) => isPack100(b) || Number(b.remaining) >= initialColleges.length
                );
                
                if (validBundle) {
                    setSelectedBundleId(validBundle.id);
                    setSelectedBundleType("existing");
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || "Failed to load checkout data");
        } finally {
            setLoading(false);
        }
    };

    const handleCollegeSearch = async (searchTerm) => {
        if (searchTerm.length < 3) {
            setSearchResults([]);
            return;
        }
        const term = searchTerm.trim().toLowerCase();
        const results = tiedUpColleges.filter(college => 
            college.name && college.name.toLowerCase().includes(term)
        );
        setSearchResults(results);
    };

    const updateJobColleges = async (collegeIds) => {
        try {
            await axios.put(
                `${BASE_URL}/subscriptions/jobs/${job_id}/colleges`,
                { college_ids: collegeIds },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (err) {
            console.error("Failed to update colleges:", err);
        }
    };

    const selectedExistingBundle = useMemo(() => {
        if (selectedBundleType !== "existing" || !selectedBundleId || !checkoutData?.bundles?.length) {
            return null;
        }
        return checkoutData.bundles.find((b) => b.id === selectedBundleId) || null;
    }, [selectedBundleType, selectedBundleId, checkoutData?.bundles]);

    // Bypass the maximum cap if it's the 100 pack
    const maxCollegesAllowed = selectedExistingBundle
        ? (isPack100(selectedExistingBundle) ? Infinity : Number(selectedExistingBundle.remaining))
        : null;

    const handleAddCollege = (college) => {
        if (maxCollegesAllowed != null && maxCollegesAllowed !== Infinity && selectedColleges.length >= maxCollegesAllowed) {
            showErrorAlert(
                maxCollegesAllowed === 1
                    ? "This bundle allows only 1 college. Remove the current college to change selection."
                    : `You can select up to ${maxCollegesAllowed} college(s) with the selected bundle.`
            );
            return;
        }
        if (!selectedColleges.includes(college.id)) {
            const updated = [...selectedColleges, college.id];
            setSelectedColleges(updated);
            updateJobColleges(updated);
        }
        setCollegeSearch("");
        setSearchResults([]);
    };

    const handleRemoveCollege = (collegeId) => {
        const updated = selectedColleges.filter((id) => id !== collegeId);
        setSelectedColleges(updated);
        updateJobColleges(updated);
    };

    const selectExistingBundle = (bundle) => {
        setSelectedBundleId(bundle.id);
        setSelectedBundleType("existing");
        
        // Calculate the cap, treating the 100 pack as Infinity
        const cap = isPack100(bundle) ? Infinity : Number(bundle.remaining);
        
        if (Number.isFinite(cap) && cap > 0 && selectedColleges.length > cap) {
            const trimmed = selectedColleges.slice(0, cap);
            setSelectedColleges(trimmed);
            updateJobColleges(trimmed);
            showErrorAlert(
                cap === 1
                    ? "Selection limited to 1 college for this bundle. Extra colleges were removed."
                    : `Selection limited to ${cap} colleges for this bundle. Extra colleges were removed.`
            );
        }
    };

    const handleBuyNewBundle = async (plan) => {
        if (!token) {
            showErrorAlert("Please log in to purchase");
            return;
        }
        if (!selectedColleges.length) {
            showErrorAlert("Add at least one college before purchasing a bundle.");
            return;
        }
        
        // Check effective credits
        const planCredits = isPack100(plan) ? Infinity : (Number(plan.yearly_credits) || 0);
        
        if (planCredits < selectedColleges.length) {
            showErrorAlert(
                `This bundle covers ${plan.yearly_credits} college(s). Remove extra colleges or choose a larger pack.`
            );
            return;
        }

        setIsBuyingBundle(true);
        setBuyingPlanId(plan.plan_id);

        try {
            const response = await axios.post(
                `${BASE_URL}/subscriptions/credits/order`,
                { plan_id: plan.plan_id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (!response.data.success) {
                throw new Error(response.data.message || "Order creation failed");
            }

            const { razorpay_order_id, total_amount } = response.data;

            if (!window.Razorpay) {
                await new Promise((resolve, reject) => {
                    const script = document.createElement("script");
                    script.src = "https://checkout.razorpay.com/v1/checkout.js";
                    script.onload = resolve;
                    script.onerror = reject;
                    document.body.appendChild(script);
                });
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_API_KEY,
                amount: Math.round(total_amount * 100),
                currency: "INR",
                name: "JobPortal",
                description: `College Credits - ${plan.plan_name}`,
                order_id: razorpay_order_id,
                handler: async (paymentResponse) => {
                    setBuyingPlanId(null);
                    setIsBuyingBundle(false);

                    setTimeout(async () => {
                        await loadPreview();
                        const newBundle = checkoutData?.bundles?.find(
                            (b) =>
                                (isPack100(b) || b.remaining >= selectedColleges.length) &&
                                b.name === plan.plan_name
                        );
                        if (newBundle) {
                            setSelectedBundleId(newBundle.id);
                            setSelectedBundleType("existing");
                        }
                        showSuccessAlert(
                            `Bundle purchased! Select it above to publish your job.`
                        );
                    }, 2000);
                },
                prefill: {
                    email: localStorage.getItem("userEmail") || "",
                    contact: localStorage.getItem("userPhone") || "",
                },
                theme: { color: "#3399cc" },
                modal: {
                    ondismiss: () => {
                        setIsBuyingBundle(false);
                        setBuyingPlanId(null);
                        showErrorAlert("Payment cancelled");
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error("Bundle purchase error:", err);
            showErrorAlert(err.response?.data?.message || "Failed to purchase bundle");
            setIsBuyingBundle(false);
            setBuyingPlanId(null);
        }
    };

    const handlePublishJob = async () => {
        if (!selectedBundleId) {
            showErrorAlert("Please select a credit bundle or buy a new one");
            return;
        }
        if (selectedColleges.length === 0) {
            showErrorAlert("Please select at least one college");
            return;
        }

        setIsProcessing(true);

        try {
            if (selectedBundleType === "existing") {
                const response = await axios.post(
                    `${BASE_URL}/subscriptions/jobs/${job_id}/publish-college`,
                    {
                        bundle_id: selectedBundleId,
                        college_ids: selectedColleges,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const result = response.data;

                navigate("/recruiter/job-post-success", {
                    state: {
                        job_id,
                        post_type: "college",
                        credits_used: result.credits_used,
                        confirmed: true,
                    },
                });
            } else {
                const response = await axios.post(
                    `${BASE_URL}/subscriptions/jobs/${job_id}/college-checkout-pay`,
                    {
                        bundle_id: selectedBundleId,
                        college_ids: selectedColleges,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                const paymentData = response.data;

                if (!window.Razorpay) {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement("script");
                        script.src = "https://checkout.razorpay.com/v1/checkout.js";
                        script.onload = resolve;
                        script.onerror = reject;
                        document.body.appendChild(script);
                    });
                }

                const options = {
                    key: import.meta.env.VITE_RAZORPAY_API_KEY,
                    amount: paymentData.total_amount * 100,
                    currency: "INR",
                    name: "JobPortal",
                    description: `College Credits - ${paymentData.bundle_name}`,
                    order_id: paymentData.razorpay_order_id,
                    handler: async () => {
                        setTimeout(async () => {
                            const freshData = await loadPreview();
                            const newBundle = freshData?.bundles?.find(
                                (b) =>
                                    b.name === paymentData.bundle_name &&
                                    (isPack100(b) || b.remaining >= selectedColleges.length)
                            );
                            if (newBundle) {
                                const publishResponse = await axios.post(
                                    `${BASE_URL}/subscriptions/jobs/${job_id}/publish-college`,
                                    {
                                        bundle_id: newBundle.id,
                                        college_ids: selectedColleges,
                                    },
                                    { headers: { Authorization: `Bearer ${token}` } }
                                );
                                const result = publishResponse.data;
                                navigate("/recruiter/job-post-success", {
                                    state: {
                                        job_id,
                                        post_type: "college",
                                        credits_used: result.credits_used,
                                        confirmed: true,
                                    },
                                });
                            }
                        }, 2000);
                    },
                    prefill: {
                        email: localStorage.getItem("userEmail") || "",
                        contact: localStorage.getItem("userPhone") || "",
                    },
                    theme: { color: "#3399cc" },
                    modal: {
                        ondismiss: () => {
                            setIsProcessing(false);
                            showErrorAlert("Payment cancelled");
                        },
                    },
                };

                const rzp = new window.Razorpay(options);
                rzp.open();
            }
        } catch (err) {
            console.error("Publish error:", err);
            showErrorAlert(err.response?.data?.error || "Failed to publish job");
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading checkout...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    if (error) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center max-w-md">
                        <div className="text-5xl mb-4">⚠️</div>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </MainLayout>
        );
    }

    const selectedBundle = checkoutData?.bundles?.find(
        (b) => b.id === selectedBundleId
    );
    const selectedPlan = checkoutData?.plans?.find(
        (p) => p.plan_id === selectedBundleId
    );

    return (
        <MainLayout heading="Complete College-Specific Posting">
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-5 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold">Review & Publish</h2>
                    <p className="text-blue-100 text-sm mt-1">
                        Secure payment via Razorpay • 18% GST included
                    </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-3">Job Details</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <span className="text-gray-500">Job ID:</span>
                            <p className="font-medium text-gray-800">{checkoutData?.job_id}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Colleges Selected:</span>
                            <p className="font-medium text-gray-800">
                                {selectedColleges.length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-4">Manage Colleges</h3>
                    {maxCollegesAllowed != null && maxCollegesAllowed !== Infinity && (
                        <p className="text-sm text-gray-600 mb-3">
                            Selected bundle allows up to{" "}
                            <span className="font-medium text-gray-800">{maxCollegesAllowed}</span>{" "}
                            {maxCollegesAllowed === 1 ? "college" : "colleges"}.
                        </p>
                    )}
                    {maxCollegesAllowed === Infinity && (
                        <p className="text-sm text-green-600 font-medium mb-3">
                            You have selected an unlimited pack. You can add as many colleges as you want.
                        </p>
                    )}

                    {tiedUpColleges.length === 0 ? (
                        <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-xl mb-4">
                            <p className="text-gray-500 mb-2 font-medium">No tied-up colleges found.</p>
                            <p className="text-sm text-gray-400">You must have an active tie-up with a college to post jobs directly to them.</p>
                        </div>
                    ) : (
                        <div className="relative mb-4">
                            <input
                                type="text"
                                placeholder="Search tied-up colleges (min 3 characters)..."
                                value={collegeSearch}
                                onChange={(e) => {
                                    setCollegeSearch(e.target.value);
                                    handleCollegeSearch(e.target.value);
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            />
                            {searchResults.length > 0 && (
                                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                                    {searchResults.map((college) => (
                                        <button
                                            key={college.id}
                                            type="button"
                                            onClick={() => handleAddCollege(college)}
                                            className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-3 transition"
                                        >
                                            {college.logo_pic && (
                                                <img
                                                    src={college.logo_pic}
                                                    alt=""
                                                    className="w-8 h-8 rounded object-cover"
                                                />
                                            )}
                                            <span className="text-gray-800">{college.name}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                        {selectedColleges.map((id) => {
                            const college = checkoutData?.colleges?.find((c) => c.id === id) || tiedUpColleges.find((c) => c.id === id);
                            return (
                                <span
                                    key={id}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                                >
                                    {college?.name || `College ${id}`}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveCollege(id)}
                                        className="text-blue-600 hover:text-blue-800 font-bold"
                                    >
                                        ×
                                    </button>
                                </span>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-800 mb-4">
                        Select Credit Bundle
                    </h3>

                    {checkoutData?.bundles?.length > 0 && (
                        <div className="space-y-3 mb-5">
                            <p className="text-sm text-gray-600">Your available bundles:</p>
                            {checkoutData.bundles.map((bundle) => {
                                const isSelected = selectedBundleId === bundle.id;
                                const is100Pack = isPack100(bundle);
                                return (
                                    <label
                                        key={bundle.id}
                                        className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all ${isSelected
                                                ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                                                : "border-gray-200 hover:border-blue-300"
                                            }`}
                                        onClick={() => selectExistingBundle(bundle)}
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-gray-800">
                                                    {bundle.name}
                                                </p>
                                                {bundle.remaining === selectedColleges.length && !is100Pack && (
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                                        Perfect match
                                                    </span>
                                                )}
                                                {is100Pack && (
                                                    <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                                                        Unlimited Access
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {is100Pack ? "Unlimited credits" : `${bundle.remaining} credits`} • Expires: {bundle.expiry}
                                            </p>
                                        </div>
                                        <input
                                            type="radio"
                                            name="bundle"
                                            value={bundle.id}
                                            checked={isSelected}
                                            onChange={() => selectExistingBundle(bundle)}
                                            className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                        />
                                    </label>
                                );
                            })}
                        </div>
                    )}
                    
                    <div className="pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => setShowBuyNewPlans(!showBuyNewPlans)}
                            className="flex items-center justify-between w-full text-left text-sm font-medium text-blue-600 hover:text-blue-800 mb-3"
                        >
                            <span>Or buy a new bundle</span>
                            <svg
                                className={`w-4 h-4 transition-transform ${showBuyNewPlans ? "rotate-180" : ""
                                    }`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>

                        {showBuyNewPlans && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {(checkoutData?.plans || []).map((plan) => {
                                    const isProcessing = isBuyingBundle && buyingPlanId === plan.plan_id;
                                    const is100Pack = isPack100(plan);
                                    const planCredits = is100Pack ? Infinity : (Number(plan.yearly_credits) || 0);
                                    
                                    const hasEnough = planCredits >= selectedColleges.length && selectedColleges.length > 0;
                                    const displayCredits = is100Pack ? "Unlimited" : planCredits;

                                    return (
                                        <div
                                            key={plan.plan_id}
                                            className={`p-4 border-2 rounded-xl transition-all ${hasEnough
                                                    ? "border-green-200 bg-green-50 hover:border-green-400"
                                                    : "border-gray-200 hover:border-blue-300"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-semibold text-gray-800">
                                                        {plan.plan_name}
                                                    </p>
                                                    <p className="text-xl font-bold text-blue-600 mt-1">
                                                        ₹{parseFloat(plan.yearly_price).toLocaleString()}
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        {displayCredits} {displayCredits === 1 ? "college" : "colleges"} • 1 year validity
                                                    </p>
                                                    {!hasEnough && (
                                                        <p className="text-xs text-red-600 mt-1">
                                                            {selectedColleges.length === 0
                                                                ? "❌ Add at least one college before buying this bundle."
                                                                : `❌ Not enough credits for ${selectedColleges.length} colleges`}
                                                        </p>
                                                    )}
                                                </div>
                                                {hasEnough && (
                                                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                                                        ✓ Fits
                                                    </span>
                                                )}
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleBuyNewBundle(plan)}
                                                disabled={isProcessing || !hasEnough}
                                                className={`w-full mt-3 py-2 px-4 rounded-lg font-medium text-sm transition ${isProcessing || !hasEnough
                                                        ? "bg-gray-300 cursor-not-allowed text-gray-500"
                                                        : "bg-blue-600 hover:bg-blue-700 text-white"
                                                    }`}
                                            >
                                                {isProcessing ? (
                                                    <span className="flex items-center justify-center gap-2">
                                                        Processing...
                                                    </span>
                                                ) : (
                                                    "Buy & Use for This Job"
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gradient-to-r from-gray-50 to-blue-50 border border-blue-200 rounded-xl p-5">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-semibold text-gray-700">Total Colleges:</span>
                        <span className="text-2xl font-bold text-blue-700">
                            {selectedColleges.length}
                        </span>
                    </div>

                    {selectedBundle && (
                        <div className="mb-4 p-3 bg-white rounded-lg border border-blue-100">
                            <p className="text-sm text-gray-600">
                                Using bundle:{" "}
                                <span className="font-medium text-gray-800">
                                    {selectedBundle.name}
                                </span>
                            </p>
                        </div>
                    )}

                    <button
                        onClick={handlePublishJob}
                        disabled={
                            isProcessing || !selectedBundleId || selectedColleges.length === 0
                        }
                        className={`w-full py-4 px-6 rounded-xl font-semibold text-white text-lg transition-all shadow-lg hover:shadow-xl ${isProcessing ||
                                !selectedBundleId ||
                                selectedColleges.length === 0
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.99]"
                            }`}
                    >
                        {isProcessing ? (
                            <span className="flex items-center justify-center gap-2">
                                Processing...
                            </span>
                        ) : selectedBundleType === "existing" ? (
                            `✅ Publish Job (${selectedColleges.length} Colleges)`
                        ) : (
                            `Buy Bundle & Publish Job (₹${selectedPlan?.yearly_price || 0})`
                        )}
                    </button>
                </div>
            </div>
        </MainLayout>
    );
}