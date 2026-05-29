// // src/pages/profile/RecruiterPricingPage.jsx
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaCheck, FaTimes, FaUniversity, FaChartLine, FaUsers, FaLock, FaRocket } from "react-icons/fa";
// import MainLayout from "../../../components/layout/MainLayout";

// const RecruiterPricingPage = () => {
//   const navigate = useNavigate();
//   const [collegeCount, setCollegeCount] = useState(5);

//   // Pricing logic
//   const calculateCollegePricing = (count) => {
//     if (count <= 0) return { total: 0, breakdown: "" };
//     if (count <= 9) {
//       return {
//         total: count * 2000,
//         breakdown: `${count} × ₹2,000 = ₹${count * 2000}`,
//       };
//     } else if (count === 10) {
//       return {
//         total: 7000,
//         breakdown: "Flat rate for 10 colleges: ₹7,000",
//         savings: count * 2000 - 7000,
//       };
//     } else {
//       const base = 10000;
//       const extra = (count - 10) * 1500;
//       return {
//         total: base + extra,
//         breakdown: `₹10,000 + ${(count - 10)} × ₹1,500 = ₹${base + extra}`,
//       };
//     }
//   };

//   const { total: collegeTotal, breakdown: collegeBreakdown, savings: collegeSavings } = calculateCollegePricing(collegeCount);

//   const plans = [
//     {
//       name: "Free Plan",
//       price: "₹0",
//       period: "forever",
//       description: "Perfect for startups and first-time recruiters.",
//       features: [
//         { included: true, text: "Unlimited Active Job Posts" },
//         { included: false, text: "View only first 20 applicants per job" },
//         { included: true, text: "Post Future / Draft Jobs" },
//         { included: false, text: "Target Specific Colleges" },
//         { included: false, text: "Download Resumes (PDF/CSV)" },
//         { included: false, text: "AI-Powered Screening" },
//         { included: false, text: "Priority Listing" },
//         { included: false, text: "Team Collaboration" },
//         { included: true, text: "Email Support (48h)" },
//       ],
//       cta: "Post Free Job",
//       ctaAction: () => navigate("/recruiter-post-opportunity-selector"),
//       popular: false,
//     },
//     {
//       name: "Pro Plan",
//       price: "₹1,499",
//       period: "/month",
//       description: "Unlock full recruiting power.",
//       features: [
//         { included: true, text: "Unlimited Active Job Posts" },
//         { included: true, text: "Unlimited Applicant Access" },
//         { included: true, text: "Post Future / Draft Jobs" },
//         { included: false, text: "Target Specific Colleges" },
//         { included: true, text: "Download Resumes (PDF/CSV)" },
//         { included: true, text: "AI-Powered Screening" },
//         { included: true, text: "Priority Listing (Top of Feed)" },
//         { included: true, text: "Team Collaboration (up to 3 members)" },
//         { included: true, text: "Priority Chat + Email Support" },
//       ],
//       cta: "Start Free Trial",
//       ctaAction: () => alert("Free trial coming soon!"),
//       popular: true,
//     },
//     {
//       name: "College-Specific",
//       price: "Pay-per-use",
//       period: "",
//       description: "Recruit from elite institutions directly.",
//       features: [
//         { included: true, text: "Unlimited Active Job Posts" },
//         { included: true, text: "Unlimited Applicant Access" },
//         { included: true, text: "Post Future / Draft Jobs" },
//         { included: true, text: "Target Students by College" },
//         { included: true, text: "Target by Course/Specialization" },
//         { included: true, text: "Direct Alerts to University Admins" },
//         { included: true, text: "Priority Listing" },
//         { included: true, text: "Dedicated Account Manager" },
//         { included: true, text: "Full Analytics Dashboard" },
//       ],
//       cta: "Post College Job",
//       ctaAction: () => navigate("/recruiter-post-opportunity-selector"),
//       popular: false,
//     },
//   ];

//   const featureHighlights = [
//     {
//       icon: <FaUsers className="text-blue-600" />,
//       title: "Unlimited Applicant Access",
//       desc: "See every profile — not just the first 20. Filter, shortlist, and message instantly.",
//     },
//     {
//       icon: <FaUniversity className="text-green-600" />,
//       title: "Smart College Targeting",
//       desc: "Your job appears only to students at selected colleges. University admins get notified to boost visibility.",
//     },
//     {
//       icon: <FaChartLine className="text-purple-600" />,
//       title: "Recruiter Analytics",
//       desc: "Track views, applications, and conversion rates. Optimize your next post.",
//     },
//     {
//       icon: <FaLock className="text-red-600" />,
//       title: "Secure & Compliant",
//       desc: "GDPR-ready. 99.9% uptime. Your data is always protected.",
//     },
//   ];

//   const faqs = [
//     {
//       q: "Can I post for free forever?",
//       a: "Yes! The Free plan never expires. You’ll just see only the first 20 applicants per job.",
//     },
//     {
//       q: "When do I pay for College Targeting?",
//       a: "Only when you publish a college-specific job. Drafts are free.",
//     },
//     {
//       q: "Can I upgrade/downgrade anytime?",
//       a: "Yes. Pro plan is monthly/annual. College targeting is pay-per-use.",
//     },
//     {
//       q: "Do universities see my job?",
//       a: "Yes! If you select their college, their admin dashboard shows your post for campus promotion.",
//     },
//   ];

//   return (
//     <MainLayout
//       heading="Simple, Transparent Pricing"
//       subheading="Post for free, unlock power features with Pro, or target top colleges directly."
//       hideMobileIllustration={true}
//     >
//       <div className="bg-white">
//         {/* Hero */}
//         <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
//           <div className="text-center">
//             <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
//               Hire the Right Talent — Without Breaking the Bank
//             </h1>
//             <p className="max-w-2xl mx-auto mt-4 text-xl text-gray-500">
//               Post for free, unlock power features with Pro, or target top colleges directly. No hidden fees. Cancel anytime.
//             </p>
//             <div className="mt-8">
//               <button
//                 onClick={() => navigate("/recruiter-post-opportunity-selector")}
//                 className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//               >
//                 Post Your First Free Job
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Plans */}
//         <div className="px-4 pb-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
//           <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
//             {plans.map((plan, idx) => (
//               <div
//                 key={idx}
//                 className={`relative p-6 bg-white border rounded-lg shadow-sm ${
//                   plan.popular ? "ring-2 ring-blue-600 border-blue-600" : "border-gray-200"
//                 }`}
//               >
//                 {plan.popular && (
//                   <div className="absolute top-0 py-1.5 px-4 bg-blue-600 rounded-full text-xs font-semibold text-white transform -translate-y-1/2 left-1/2 -ml-10">
//                     Most Popular
//                   </div>
//                 )}
//                 <div className="mb-6">
//                   <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
//                   <div className="flex items-baseline mt-4">
//                     <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
//                     {plan.period && <span className="ml-1 text-xl font-medium text-gray-500">{plan.period}</span>}
//                   </div>
//                   <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
//                 </div>
//                 <ul className="space-y-4">
//                   {plan.features.map((feature, fIdx) => (
//                     <li key={fIdx} className="flex items-start">
//                       {feature.included ? (
//                         <FaCheck className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
//                       ) : (
//                         <FaTimes className="flex-shrink-0 h-5 w-5 text-gray-300 mt-0.5" />
//                       )}
//                       <span
//                         className={`ml-3 text-sm ${
//                           feature.included ? "text-gray-700" : "text-gray-400 line-through"
//                         }`}
//                       >
//                         {feature.text}
//                       </span>
//                     </li>
//                   ))}
//                 </ul>
//                 <div className="mt-8">
//                   <button
//                     onClick={plan.ctaAction}
//                     className={`w-full py-2 px-4 rounded-md font-medium ${
//                       plan.popular
//                         ? "bg-blue-600 text-white hover:bg-blue-700"
//                         : "bg-gray-100 text-gray-900 hover:bg-gray-200"
//                     }`}
//                   >
//                     {plan.cta}
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* College Pricing Calculator */}
//         <div className="py-16 bg-gray-50">
//           <div className="max-w-3xl px-4 mx-auto sm:px-6 lg:px-8">
//             <div className="text-center">
//               <h2 className="text-2xl font-bold text-gray-900">Recruit from Top Colleges</h2>
//               <p className="mt-2 text-gray-600">
//                 Pay only for the colleges you target. University admins get notified to promote your job.
//               </p>
//             </div>
//             <div className="p-6 mt-8 bg-white rounded-lg shadow">
//               <div className="mb-4">
//                 <label className="block mb-2 text-sm font-medium text-gray-700">
//                   How many colleges do you want to target?
//                 </label>
//                 <input
//                   type="range"
//                   min="1"
//                   max="50"
//                   value={collegeCount}
//                   onChange={(e) => setCollegeCount(Number(e.target.value))}
//                   className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
//                 />
//                 <div className="flex justify-between mt-1 text-sm text-gray-600">
//                   <span>1</span>
//                   <span>{collegeCount}</span>
//                   <span>50</span>
//                 </div>
//               </div>
//               <div className="p-4 rounded-md bg-blue-50">
//                 <p className="text-lg font-semibold text-blue-800">Estimated Cost: ₹{collegeTotal.toLocaleString()}</p>
//                 <p className="mt-1 text-sm text-blue-700">{collegeBreakdown}</p>
//                 {collegeSavings > 0 && (
//                   <p className="mt-1 text-sm font-medium text-green-600">
//                     You save ₹{collegeSavings.toLocaleString()}!
//                   </p>
//                 )}
//               </div>
//               <div className="mt-4 text-center">
//                 <button
//                   onClick={() => navigate("/recruiter-post-opportunity-selector")}
//                   className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
//                 >
//                   Post College-Specific Job
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Feature Highlights */}
//         <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
//           <h2 className="text-2xl font-bold text-center text-gray-900">Why Recruiters Love Us</h2>
//           <div className="grid grid-cols-1 gap-8 mt-12 sm:grid-cols-2 lg:grid-cols-4">
//             {featureHighlights.map((feature, idx) => (
//               <div key={idx} className="text-center">
//                 <div className="flex justify-center mb-4 text-3xl">{feature.icon}</div>
//                 <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
//                 <p className="mt-2 text-sm text-gray-600">{feature.desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Testimonials & Trust */}
//         <div className="py-16 bg-gray-50">
//           <div className="max-w-3xl px-4 mx-auto text-center sm:px-6 lg:px-8">
//             <p className="text-lg italic text-gray-700">
//               “We hired 12 interns from IIT Delhi in 2 weeks using College Targeting. Worth every rupee!”
//             </p>
//             <p className="mt-4 font-medium text-gray-900">— Priya M., Talent Lead @ FinTech Startup</p>
//             <div className="flex flex-wrap justify-center gap-8 mt-8 opacity-70">
//               <span className="text-sm">Trusted by recruiters at IIT Startup • TechCorp • EduHire</span>
//             </div>
//             <div className="flex justify-center mt-6 space-x-6">
//               <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
//                 Secure
//               </span>
//               <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
//                 GDPR-Compliant
//               </span>
//               <span className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
//                 99.9% Uptime
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* FAQ */}
//         <div className="max-w-3xl px-4 py-16 mx-auto sm:px-6 lg:px-8">
//           <h2 className="text-2xl font-bold text-center text-gray-900">Frequently Asked Questions</h2>
//           <div className="mt-8 space-y-4">
//             {faqs.map((faq, idx) => (
//               <div key={idx} className="p-4 border border-gray-200 rounded-lg">
//                 <h3 className="text-lg font-medium text-gray-900">{faq.q}</h3>
//                 <p className="mt-2 text-gray-600">{faq.a}</p>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Final CTA */}
//         <div className="py-12 bg-white border-t border-gray-200">
//           <div className="max-w-3xl px-4 mx-auto text-center sm:px-6 lg:px-8">
//             <h2 className="text-2xl font-bold text-gray-900">Ready to Hire Smarter?</h2>
//             <p className="mt-2 text-gray-600">
//               Join 5,000+ recruiters who trust us to find top talent.
//             </p>
//             <div className="flex flex-col justify-center gap-4 mt-6 sm:flex-row">
//               <button
//                 onClick={() => navigate("/recruiter-post-opportunity-selector")}
//                 className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
//               >
//                 <FaRocket className="mr-2" /> Post a Free Job
//               </button>
//               <button
//                 onClick={() => (window.location.href = "mailto:sales@yourplatform.com")}
//                 className="inline-flex items-center px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
//               >
//                 📞 Talk to Sales
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </MainLayout>
//   );
// };

// export default RecruiterPricingPage;












































// src/pages/RecruiterPricingPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaTimes, FaUniversity, FaChartLine, FaUsers, FaLock, FaRocket, FaFire } from "react-icons/fa";
import MainLayout from "../../../components/layout/MainLayout";

const RecruiterPricingPage = () => {
  const navigate = useNavigate();
  const [collegeCount, setCollegeCount] = useState(10); // Default to 10!

  // Pricing logic
  const calculatePricing = (count) => {
    if (count <= 0) return { total: 0, plan: "starter", savings: 0, breakdown: "" };
    if (count <= 9) {
      return {
        total: count * 2000,
        plan: "starter",
        savings: 0,
        breakdown: `${count} × ₹2,000 = ₹${(count * 2000).toLocaleString()}`,
      };
    } else if (count === 10) {
      const savings = 20000 - 7000;
      return {
        total: 7000,
        plan: "popular",
        savings,
        breakdown: "Flat rate for 10 colleges",
        perCollege: "₹700",
      };
    } else {
      const base = 10000;
      const extra = (count - 10) * 1500;
      const total = base + extra;
      const savings = count * 2000 - total;
      return {
        total,
        plan: "enterprise",
        savings: savings > 0 ? savings : 0,
        breakdown: `₹10,000 + ${(count - 10)} × ₹1,500 = ₹${total.toLocaleString()}`,
      };
    }
  };

  const { total, plan, savings, breakdown, perCollege } = calculatePricing(collegeCount);

  const plans = [
    {
      name: "Free Plan",
      price: "₹0",
      period: "forever",
      description: "Perfect for startups and first-time recruiters.",
      features: [
        { included: true, text: "5 Active Job Posts Per Month" },
        { included: false, text: "View only first 20 applicants per job" },
        { included: true, text: "Post Future / Draft Jobs" },
        { included: false, text: "Target Specific Colleges" },
        { included: false, text: "Download Resumes (PDF/CSV)" },
        // { included: false, text: "AI-Powered Screening" },
        { included: false, text: "Priority Listing" },
        { included: false, text: "Team Collaboration" },
        { included: true, text: "Email Support (48h)" },
      ],
      cta: "Post Free Job",
      ctaAction: () => navigate("/recruiter-post-opportunity-selector"),
      popular: false,
    },
    {
      name: "Pro Plan",
      price: "₹2,499",
      period: "/month",
      description: "Unlock full recruiting power.",
      features: [
        { included: true, text: "Unlimited Active Job Posts" },
        { included: true, text: "Unlimited Applicant Access" },
        { included: true, text: "Post Future / Draft Jobs" },
        { included: false, text: "Target Specific Colleges" },
        { included: true, text: "Download Resumes (PDF/CSV)" },
        // { included: true, text: "AI-Powered Screening" },
        { included: true, text: "Priority Listing (Top of Feed)" },
        { included: true, text: "Team Collaboration (up to 3 members)" },
        { included: true, text: "Priority Chat + Email Support" },
      ],
      // cta: "Start Free Trial",
      // ctaAction: () => alert("Free trial coming soon!"),
      cta: "Buy Now",
      ctaAction: () => navigate("/recruiter-checkout-page?plan=pro"),
      popular: true,
    },
  ];

  const collegePlans = [
    {
      name: "Starter",
      colleges: "1–9",
      price: "₹2,000 / college",
      total: "Up to ₹18,000",
      bestFor: "Testing 1–2 colleges",
      popular: false,
    },
    {
      name: "🔥 Best Value",
      colleges: "Up to 10",
      price: "₹7,000 flat",
      total: "Only ₹700/college!",
      bestFor: "Campus hiring drives • Maximize reach",
      popular: true,
    },
    {
      name: "Enterprise",
      colleges: "11+",
      price: "₹10,000 + ₹1,500/additional",
      total: "Custom pricing",
      bestFor: "Nationwide recruitment",
      popular: false,
    },
  ];

  const featureHighlights = [
    {
      icon: <FaUsers className="text-blue-600" />,
      title: "Unlimited Applicant Access",
      desc: "See every profile — not just the first 20. Filter, shortlist, and message instantly.",
    },
    {
      icon: <FaUniversity className="text-green-600" />,
      title: "Smart College Targeting",
      desc: "Your job appears only to students at selected colleges. University admins get notified to boost visibility.",
    },
    {
      icon: <FaChartLine className="text-purple-600" />,
      title: "Recruiter Analytics",
      desc: "Track views, applications, and manage them easily with detailed insights. Optimize your next post.",
    },
    {
      icon: <FaLock className="text-red-600" />,
      title: "Secure & Compliant",
      desc: "GDPR-ready. 99.9% uptime. Your data is always protected.",
    },
  ];

  const faqs = [
    {
      q: "Can I post for free forever?",
      a: "Yes! The Free plan never expires. You’ll just see only the first 20 applicants per job.",
    },
    {
      q: "When do I pay for College Targeting?",
      a: "Only when you publish a college-specific job. Drafts are free.",
    },
    {
      q: "Why is the 10-college plan the best deal?",
      a: "You get each college for just ₹700 — a 65% discount vs. paying per college. Most recruiters use this plan for campus drives.",
    },
    {
      q: "Do universities see my job?",
      a: "Yes! If you select their college, their admin dashboard shows your post for campus promotion.",
    },
  ];

  return (
    <MainLayout
      heading="Simple, Transparent Pricing"
      subheading="Post for free, unlock power features with Pro, or target top colleges directly."
      hideMobileIllustration={true}
    >
      <div className="bg-white">
        {/* Hero */}
        <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Hire the Right Talent — Without Breaking the Bank
            </h1>
            <p className="max-w-2xl mx-auto mt-4 text-xl text-gray-500">
              Post for free, unlock power features with Pro, or target top
              colleges directly. No hidden fees. Cancel anytime.
            </p>
            <div className="mt-8">
              <button
                onClick={() => navigate("/recruiter-post-opportunity-selector")}
                className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
              >
                Post Your First Free Job
              </button>
            </div>
          </div>
        </div>

        {/* Main Plans */}
        <div className="px-4 pb-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
          {/* <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8"> */}
          <div className="space-y-12 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-x-8">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`relative p-6 bg-white border rounded-lg shadow-sm ${
                  plan.popular
                    ? "ring-2 ring-blue-600 border-blue-600"
                    : "border-gray-200"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 py-1.5 px-4 bg-blue-600 rounded-full text-xs font-semibold text-white transform -translate-y-1/2 left-1/2 -ml-10">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline mt-4">
                    <span className="text-4xl font-extrabold text-gray-900">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="ml-1 text-xl font-medium text-gray-500">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {plan.description}
                  </p>
                </div>
                <ul className="space-y-4">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start">
                      {feature.included ? (
                        <FaCheck className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" />
                      ) : (
                        <FaTimes className="flex-shrink-0 h-5 w-5 text-gray-300 mt-0.5" />
                      )}
                      <span
                        className={`ml-3 text-sm ${
                          feature.included
                            ? "text-gray-700"
                            : "text-gray-400 line-through"
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <button
                    onClick={plan.ctaAction}
                    className={`w-full py-2 px-4 rounded-md font-medium ${
                      plan.popular
                        ? "bg-blue-600 text-white hover:bg-blue-700"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COLLEGE TARGETING SECTION — REDESIGNED */}
        <div className="py-16 bg-gray-50">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                🎯 College Targeting Plans
              </h2>
              <p className="mt-2 text-gray-600">
                Reach students at IITs, NITs, and top private universities —
                only where you want.
              </p>
            </div>

            {/* TIER CARDS */}
            <div className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-3">
              {collegePlans.map((p, i) => (
                <div
                  key={i}
                  className={`p-6 rounded-lg border ${
                    p.popular
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-bold text-gray-900">
                      {p.name}
                    </h3>
                    {p.popular && <FaFire className="text-orange-500" />}
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {p.colleges} colleges
                  </p>
                  <p className="mt-3 text-2xl font-bold text-gray-900">
                    {p.price}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">{p.total}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    Best for: {p.bestFor}
                  </p>
                  {p.popular && (
                    <div className="p-2 mt-3 text-xs font-semibold text-center text-green-800 bg-green-100 rounded">
                      Save up to ₹13,000!
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* INTERACTIVE CALCULATOR — DEFAULT TO 10 */}
            <div className="max-w-3xl p-6 mx-auto bg-white rounded-lg shadow">
              <h3 className="mb-4 text-xl font-semibold text-center text-gray-900">
                How many colleges do you want to target?
              </h3>
              <input
                type="range"
                min="1"
                max="50"
                value={collegeCount}
                onChange={(e) => setCollegeCount(Number(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>1</span>
                <span className="font-medium">{collegeCount} colleges</span>
                <span>50</span>
              </div>

              <div className="p-4 mt-6 border border-blue-200 rounded-md bg-blue-50">
                <div className="text-center">
                  <p className="text-lg font-bold text-blue-800">
                    Total Cost: ₹{total.toLocaleString()}
                  </p>
                  <p className="mt-1 text-sm text-blue-700">{breakdown}</p>
                  {perCollege && (
                    <p className="mt-1 text-sm font-medium text-green-600">
                      Just {perCollege} per college!
                    </p>
                  )}
                  {savings > 0 && (
                    <p className="mt-1 text-sm font-bold text-green-700">
                      💰 You save ₹{savings.toLocaleString()} vs. paying per
                      college!
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  // onClick={() => navigate("/recruiter-post-opportunity-selector")}
                  onClick={() =>
                    navigate("/recruiter-checkout-page?type=college&college_ids=1,2,3,4,5,6,7,8,9,10")
                  }
                  className="inline-flex items-center px-6 py-3 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {plan === "popular"
                    ? " Get the Best Deal"
                    : "Post College-Specific Job"}
                </button>
                <p className="mt-2 text-sm text-gray-600">
                  {collegeCount === 10
                    ? "🔥 87% of recruiters choose this plan for campus hiring."
                    : collegeCount < 10
                    ? "💡 Tip: Add more colleges to unlock the ₹7,000 flat deal!"
                    : "For 20+ colleges, contact sales for custom pricing."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="px-4 py-16 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900">
            Why Recruiters Love Us
          </h2>
          <div className="grid grid-cols-1 gap-8 mt-12 sm:grid-cols-2 lg:grid-cols-4">
            {featureHighlights.map((feature, idx) => (
              <div key={idx} className="text-center">
                <div className="flex justify-center mb-4 text-3xl">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="py-16 bg-gray-50">
          <div className="max-w-3xl px-4 mx-auto text-center sm:px-6 lg:px-8">
            <p className="text-lg italic text-gray-700">
              “We hired 12 interns from IIT Delhi in 2 weeks using College
              Targeting. Worth every rupee!”
            </p>
            <p className="mt-4 font-medium text-gray-900">
              — Priya M., Talent Lead @ FinTech Startup
            </p>
            <div className="flex flex-wrap justify-center gap-8 mt-8 opacity-70">
              <span className="text-sm">
                Trusted by recruiters at IIT Startup • TechCorp • EduHire
              </span>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl px-4 py-16 mx-auto sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">{faq.q}</h3>
                <p className="mt-2 text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="py-12 bg-white border-t border-gray-200">
          <div className="max-w-3xl px-4 mx-auto text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Ready to Hire Smarter?
            </h2>
            <p className="mt-2 text-gray-600">
              Join 5,000+ recruiters who trust us to find top talent.
            </p>
            <div className="flex flex-col justify-center gap-4 mt-6 sm:flex-row">
              <button
                onClick={() => navigate("/recruiter-post-opportunity-selector")}
                className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
              >
                <FaRocket className="mr-2" /> Post a Free Job
              </button>
              <button
                onClick={() =>
                  (window.location.href = "mailto:sales@yourplatform.com")
                }
                className="inline-flex items-center px-6 py-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                📞 Talk to Sales
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RecruiterPricingPage;