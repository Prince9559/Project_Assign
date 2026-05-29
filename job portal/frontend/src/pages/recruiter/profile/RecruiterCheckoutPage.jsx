// // src/pages/recruiter/RecruiterCheckoutPage.jsx
// import React, { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import MainLayout from "../../../components/layout/MainLayout";

// const RecruiterCheckoutPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [checkoutData, setCheckoutData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Mock user (in real app, get from auth context)
//   const mockUser = {
//     email: "recruiter@company.com",
//     phone: "9876543210",
//   };

//   // Parse URL params
//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     const plan = params.get("plan"); // 'pro'
//     const type = params.get("type"); // 'college'
//     const collegeIdsParam = params.get("college_ids");

//     try {
//       let mockResponse;

//       if (plan === "pro") {
//         const baseAmount = 2499;
//         const gst = Math.round(baseAmount * 0.18);
//         const total = baseAmount + gst;

//         mockResponse = {
//           mode: "subscription",
//           plan: "pro",
//           baseAmount,
//           gst,
//           totalAmount: total,
//           currency: "INR",
//           description: "Pro Monthly Plan",
//           benefits: [
//             "Unlimited applicants for all Active Jobs",
//             "Unlimited future job postings",
//             // "AI-powered candidate screening",
//             "Export resumes in CSV",
//             "Priority email support",
//           ],
//         };
//       } else if (type === "college" && collegeIdsParam) {
//         const collegeIds = collegeIdsParam.split(",").map((id) => parseInt(id, 10));
//         const collegeCount = collegeIds.length;

//         const collegeNames = [
//           "IIT Delhi", "NIT Trichy", "SRM Chennai", "VIT Vellore",
//           "BITS Pilani", "IIIT Hyderabad", "DTU Delhi", "JNU Delhi",
//           "Anna University", "KIIT Bhubaneswar", "Thapar University", "Manipal"
//         ].slice(0, collegeCount);

//         let basePrice, extraColleges = 0, extraPrice = 0;

//         if (collegeCount < 10) {
//           basePrice = 2000 * collegeCount;
//         } else if (collegeCount===10){
//           basePrice=7000;
//         }  else {
//           basePrice = 10000;
//           extraColleges = collegeCount - 10;
//           extraPrice = extraColleges * 1500;
//         }

//         const subtotal = basePrice + extraPrice;
//         const gst = Math.round(subtotal * 0.18);
//         const total = subtotal + gst;

//         mockResponse = {
//           mode: "one_time",
//           type: "college_posting",
//           collegeCount,
//           collegeNames,
//           basePrice,
//           extraColleges,
//           extraPrice,
//           subtotal,
//           gst,
//           totalAmount: total,
//           currency: "INR",
//           description: `College-Specific Job Posting (${collegeCount} colleges)`,
//         };
//       } else {
//         throw new Error("Invalid checkout parameters. Please go back and try again.");
//       }

//       setTimeout(() => {
//         setCheckoutData(mockResponse);
//         setLoading(false);
//       }, 600);
//     } catch (err) {
//       setError(err.message);
//       setLoading(false);
//     }
//   }, [location.search]);

//   // 🔜 TODO: Replace this with real API call later
//   const createRazorpayOrder = async () => {
//     // Example future API call:
//     // const res = await api.post('/api/recruiter/checkout/create-order', { ... });
//     // return res.data;

//     // Mock response (Razorpay expects amount in paise)
//     return {
//       order_id: "mock_order_12345",
//       amount: checkoutData.totalAmount * 100,
//       currency: "INR",
//     };
//   };

//   const handlePayment = async () => {
//     if (!checkoutData) return;

//     try {
//       const order = await createRazorpayOrder();

//       const options = {
//         key: "rzp_test_1234567890", // 🔑 REPLACE WITH YOUR RAZORPAY KEY
//         amount: order.amount,
//         currency: order.currency,
//         name: "YourPlatform",
//         description: checkoutData.description,
//         order_id: order.order_id,
//         handler: function (response) {
//           window.location.href = `/recruiter/payment-success?payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}`;
//         },
//         prefill: {
//           email: mockUser.email,
//           contact: mockUser.phone,
//         },
//         theme: {
//           color: "#2563eb",
//         },
//         modal: {
//           ondismiss: () => {
//             alert("Payment was cancelled.");
//           },
//         },
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open();
//     } catch (err) {
//       console.error("Payment error:", err);
//       alert("Failed to initiate payment. Please try again.");
//     }
//   };

//   const goBack = () => {
//     navigate(-1);
//   };

//   if (loading) {
//     return (
//       <MainLayout>
//         <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
//           <div className="w-full max-w-2xl p-6 bg-white shadow-sm rounded-xl animate-pulse">
//             <div className="w-1/3 h-6 mb-6 bg-gray-200 rounded"></div>
//             <div className="space-y-4">
//               <div className="w-full h-4 bg-gray-200 rounded"></div>
//               <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
//               <div className="h-10 mt-6 bg-gray-200 rounded-lg"></div>
//             </div>
//           </div>
//         </div>
//       </MainLayout>
//     );
//   }

//   if (error) {
//     return (
//       <MainLayout>
//         <div className="flex items-center justify-center min-h-screen px-4 bg-gray-50">
//           <div className="w-full max-w-2xl p-8 text-center bg-white shadow-sm rounded-xl">
//             <div className="mb-4 text-5xl text-red-500">⚠️</div>
//             <h2 className="mb-2 text-xl font-semibold text-gray-800">Invalid Request</h2>
//             <p className="mb-6 text-gray-600">{error}</p>
//             <button
//               onClick={goBack}
//               className="px-4 py-2 text-white transition bg-blue-600 rounded-lg hover:bg-blue-700"
//             >
//               ← Go Back
//             </button>
//           </div>
//         </div>
//       </MainLayout>
//     );
//   }

//   return (
//     <MainLayout>
//       <div className="min-h-screen px-4 py-8 bg-gray-50 sm:px-6 lg:px-8">
//         <div className="max-w-2xl mx-auto">
//           {/* Header */}
//           <div className="mb-8 text-center">
//             <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
//               Complete Your Payment
//             </h1>
//             <p className="mt-2 text-gray-600">
//               Secure checkout • Powered by Razorpay
//             </p>
//           </div>

//           {/* Checkout Card */}
//           <div className="overflow-hidden bg-white border border-gray-200 shadow-sm rounded-xl">
//             {/* Summary */}
//             <div className="p-6 border-b border-gray-100">
//               <h2 className="mb-4 text-lg font-semibold text-gray-800">Order Summary</h2>
              
//               <div className="p-4 mb-4 rounded-lg bg-blue-50">
//                 <p className="font-medium text-blue-800">{checkoutData.description}</p>
//               </div>

//               {checkoutData.mode === "subscription" && (
//                 <div className="mt-4 space-y-2 text-sm text-gray-700">
//                   <p className="font-medium">Includes:</p>
//                   <ul className="space-y-1 list-disc list-inside">
//                     {checkoutData.benefits.map((benefit, i) => (
//                       <li key={i} className="text-gray-600">{benefit}</li>
//                     ))}
//                   </ul>
//                 </div>
//               )}

//               {checkoutData.mode === "one_time" && (
//                 <div className="mt-4">
//                   <p className="mb-2 font-medium text-gray-800">
//                     Target Colleges ({checkoutData.collegeCount})
//                   </p>
//                   <ul className="grid grid-cols-1 gap-1 mb-4 text-sm text-gray-600 sm:grid-cols-2">
//                     {checkoutData.collegeNames.map((name, i) => (
//                       <li key={i} className="flex items-center">
//                         <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></span>
//                         {name}
//                       </li>
//                     ))}
//                   </ul>

//                   <div className="space-y-1 text-sm text-gray-700">
//                     {checkoutData.collegeCount <= 10 ? (
//                       <div>Base Price (≤10 colleges): ₹{checkoutData.basePrice.toLocaleString("en-IN")}</div>
//                     ) : (
//                       <>
//                         <div>Base Price (first 10): ₹10,000</div>
//                         <div>
//                           Extra ({checkoutData.extraColleges} × ₹1,500): ₹{checkoutData.extraPrice.toLocaleString("en-IN")}
//                         </div>
//                       </>
//                     )}
//                     <div className="pt-2 font-medium border-t border-gray-200">
//                       Subtotal: ₹{checkoutData.subtotal.toLocaleString("en-IN")}
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Pricing Breakdown */}
//             <div className="p-6">
//               <div className="space-y-3 text-gray-700">
//                 <div className="flex justify-between">
//                   <span>Subtotal</span>
//                   <span>₹{(checkoutData.totalAmount - checkoutData.gst).toLocaleString("en-IN")}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>GST (18%)</span>
//                   <span>₹{checkoutData.gst.toLocaleString("en-IN")}</span>
//                 </div>
//                 <div className="flex justify-between pt-3 text-lg font-bold text-gray-900 border-t border-gray-200">
//                   <span>Total Payable</span>
//                   <span>₹{checkoutData.totalAmount.toLocaleString("en-IN")}</span>
//                 </div>
//               </div>

//               {/* Pay Button */}
//               <button
//                 onClick={handlePayment}
//                 className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition duration-200 flex items-center justify-center shadow-md hover:shadow-lg"
//               >
//                 Pay Now – ₹{checkoutData.totalAmount.toLocaleString("en-IN")}
//               </button>

//               <p className="flex items-center justify-center gap-1 mt-4 text-xs text-center text-gray-500">
//                 <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                 </svg>
//                 Secure • Encrypted • No card data stored
//               </p>
//             </div>
//           </div>

//           {/* Footer Note */}
//           <div className="mt-6 text-sm text-center text-gray-500">
//             Need help? Contact us at support@yourplatform.com
//           </div>
//         </div>
//       </div>
//     </MainLayout>
//   );
// };

// export default RecruiterCheckoutPage;