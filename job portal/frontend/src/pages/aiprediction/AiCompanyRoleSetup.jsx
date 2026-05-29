// // src/pages/AiCompanyRoleSetup.jsx
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import AiProfileIllustration1 from "../../assets/AiProfileIllustration1.png";
// import Ailayout1 from "../../components/layout/Ailayout1";
// import { Button } from "../../components/ui";

// export default function AiCompanyRoleSetup() {
//     const [companies, setCompanies] = useState([]);
//     const [roles, setRoles] = useState([]);
//     const [selectedCompanies, setSelectedCompanies] = useState([]);
//     const [selectedRoles, setSelectedRoles] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const navigate = useNavigate();

//     useEffect(() => {
//         // Mock data — replace with API calls
//         setCompanies([
//             { id: 1, name: "Google" },
//             { id: 2, name: "Microsoft" },
//             { id: 3, name: "Amazon" },
//             { id: 4, name: "Flipkart" },
//             { id: 5, name: "TCS" },
//         ]);
//         setRoles([
//             { id: 1, title: "Software Engineer" },
//             { id: 2, title: "Data Analyst" },
//             { id: 3, title: "Product Manager" },
//             { id: 4, title: "UX Designer" },
//             { id: 5, title: "DevOps Engineer" },
//         ]);
//     }, []);

//     const handleCompanyChange = (e) => {
//         const options = Array.from(e.target.selectedOptions, (opt) => Number(opt.value));
//         setSelectedCompanies(options);
//     };

//     const handleRoleChange = (e) => {
//         const options = Array.from(e.target.selectedOptions, (opt) => Number(opt.value));
//         setSelectedRoles(options);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         if (selectedCompanies.length === 0 || selectedRoles.length === 0) {
//             alert("Please select at least one company and one job role.");
//             return;
//         }

//         setLoading(true);
//         try {
//             const res = await fetch("/api/v1/ai-prediction", {
//                 method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({
//                     strategy: "company_role",
//                     companyIds: selectedCompanies,
//                     roleIds: selectedRoles,
//                 }),
//             });
//             const data = await res.json();

//             if (data.success) {
//                 localStorage.setItem("aiPredictionResult", JSON.stringify(data.result));
//                 navigate("/ai-learning");
//             } else {
//                 alert("Prediction failed: " + data.message);
//             }
//         } catch (err) {
//             console.error(err);
//             alert("Network error. Please try again.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <Ailayout1
//             heading="AI Prediction"
//             subheading="Target your dream job with us."
//             illustration={AiProfileIllustration1}
//             centerMobileContent={true}
//         >
//             <div className="w-full px-0 sm:max-w-sm mx-auto flex flex-col items-center justify-center -mt-4 sm:-mt-2">
//                 <div className="bg-white rounded-lg shadow-md w-full p-6">
//                     <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
//                         Set Your Target
//                     </h2>

//                     <form onSubmit={handleSubmit} className="space-y-5">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Choose Company *
//                             </label>
//                             <select
//                                 multiple
//                                 value={selectedCompanies}
//                                 onChange={handleCompanyChange}
//                                 className="w-full h-32 p-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
//                                 required
//                             >
//                                 <option value="">-- Select Companies --</option>
//                                 {companies.map((c) => (
//                                     <option key={c.id} value={c.id}>
//                                         {c.name}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Choose Profile *
//                             </label>
//                             <select
//                                 multiple
//                                 value={selectedRoles}
//                                 onChange={handleRoleChange}
//                                 className="w-full h-32 p-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
//                                 required
//                             >
//                                 <option value="">-- Select Job Roles --</option>
//                                 {roles.map((r) => (
//                                     <option key={r.id} value={r.id}>
//                                         {r.title}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>

//                         <Button
//                             type="submit"
//                             disabled={loading}
//                             className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-md disabled:opacity-75"
//                         >
//                             {loading ? "Setting Target..." : "Set Target"}
//                         </Button>
//                     </form>
//                 </div>
//             </div>
//         </Ailayout1>
//     );
// }


















// // src/pages/AiCompanyRoleSetup.jsx
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useMasterData } from "../../hooks/master/useMasterData"; 
// import { Button } from "../../components/ui";
// import axios from "axios";
// import MainLayout from "../../components/layout/MainLayout";

// // Define BASE_URL
// const BASE_URL = import.meta.env.VITE_BASE_URL;

// export default function AiCompanyRoleSetup() {
//     const navigate = useNavigate();
//     const { companies, jobRoles, isLoading: isMasterDataLoading } = useMasterData();

//     const [selectedCompanies, setSelectedCompanies] = useState([]);
//     const [selectedRoles, setSelectedRoles] = useState([]);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [showLoadingScreen, setShowLoadingScreen] = useState(false);

//     // Convert master data into options format
//     const companyOptions = companies.map((c) => ({
//         label: c.company_name,
//         value: c.id,
//     }));

//     const jobRoleOptions = jobRoles.map((r) => ({
//         label: r.title,
//         value: r.id,
//     }));

//     const handleCompanyChange = (e) => {
//         const selectedValues = Array.from(e.target.selectedOptions, (opt) => opt.value);
//         setSelectedCompanies(selectedValues);
//     };

//     const handleRoleChange = (e) => {
//         const selectedValues = Array.from(e.target.selectedOptions, (opt) => opt.value);
//         setSelectedRoles(selectedValues);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (selectedCompanies.length === 0 || selectedRoles.length === 0) {
//             alert("Please select at least one company and one job role.");
//             return;
//         }

//         setIsSubmitting(true);
//         setShowLoadingScreen(true); // Show loading screen immediately

//         try {
//             const res = await axios.post(`${BASE_URL}/api/ai-prediction`, {
//                 strategy: "company_role",
//                 companyIds: selectedCompanies, // sending actual names, not IDs — adjust if backend expects IDs
//                 roleIds: selectedRoles,         // same here
//             });

//             if (res.data.success) {
//                 localStorage.setItem("aiPredictionResult", JSON.stringify(res.data.result));
//                 navigate("/ai-learning");
//             } else {
//                 alert("Prediction failed: " + res.data.message);
//                 setShowLoadingScreen(false);
//             }
//         } catch (err) {
//             console.error("API Error:", err);
//             alert("Network error. Please try again.");
//             setShowLoadingScreen(false);
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     // If master data is still loading, show skeleton or spinner
//     if (isMasterDataLoading) {
//         return (
//             <div className="flex justify-center items-center h-screen">
//                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
//             </div>
//         );
//     }

//     // Loading Screen Component (shown after submit)
//     if (showLoadingScreen) {
//         return (
//             <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
//                 <div className="text-center max-w-md">
//                     <div className="w-24 h-24 mx-auto mb-4">
//                         {/* Placeholder for illustration */}
//                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-blue-500">
//                             <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
//                         </svg>
//                     </div>
//                     <h2 className="text-xl font-bold text-gray-800 mb-2">Generating Your Personalized Plan</h2>
//                     <p className="text-gray-600">Please wait while we analyze your target roles and companies...</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <MainLayout>
//         <div className="min-h-screen bg-white relative overflow-hidden">
//             {/* Background Illustration - Responsive */}
//             <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-br from-blue-50 to-white z-0 pointer-events-none">
//                 {/* You can replace this with an actual image later */}
//                 <div className="absolute top-10 right-10 w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 opacity-30">
//                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor" className="text-blue-600 w-full h-full">
//                         <path d="M100 0C44.8 0 0 44.8 0 100s44.8 100 100 100 100-44.8 100-100S155.2 0 100 0zm-10 150H70V90h20v60zm40 0h-20V90h20v60z" />
//                     </svg>
//                 </div>
//                 <div className="absolute bottom-0 left-10 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 lg:w-80 lg:h-80 opacity-20">
//                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" fill="currentColor" className="text-indigo-600 w-full h-full">
//                         <circle cx="100" cy="100" r="80" />
//                     </svg>
//                 </div>
//             </div>

//             {/* Main Content */}
//             <div className="relative z-10 pt-16 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
//                 {/* Header Section */}
//                 <div className="text-center mb-8">
//                     <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
//                         Set Your Target
//                     </h1>
//                     <p className="text-sm sm:text-base text-gray-600 mt-2">
//                         Target your dream job with us.
//                     </p>
//                 </div>

//                 {/* Form Section */}
//                 <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8">
//                     <form onSubmit={handleSubmit} className="space-y-6">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Choose Company *
//                             </label>
//                             <select
//                                 multiple
//                                 value={selectedCompanies}
//                                 onChange={handleCompanyChange}
//                                 className="w-full h-32 p-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
//                                 required
//                             >
//                                 <option value="">-- Select Companies --</option>
//                                 {companyOptions.map((opt) => (
//                                     <option key={opt.value} value={opt.value}>
//                                         {opt.label}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Choose Profile *
//                             </label>
//                             <select
//                                 multiple
//                                 value={selectedRoles}
//                                 onChange={handleRoleChange}
//                                 className="w-full h-32 p-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
//                                 required
//                             >
//                                 <option value="">-- Select Job Roles --</option>
//                                 {jobRoleOptions.map((opt) => (
//                                     <option key={opt.value} value={opt.value}>
//                                         {opt.label}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>

//                         <Button
//                             type="submit"
//                             disabled={isSubmitting}
//                             className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-md disabled:opacity-75"
//                         >
//                             {isSubmitting ? "Setting Target..." : "Set Target"}
//                         </Button>
//                     </form>
//                 </div>
//             </div>
//         </div>
//         </MainLayout>
//     );
// }

























// // src/pages/AiCompanyRoleSetup.jsx
// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useMasterData } from "../../hooks/master/useMasterData";
// import { Button } from "../../components/ui";
// import axios from "axios";
// import AiProfileIllustration1 from "../../assets/AiProfileIllustration1.png";
// import MainLayout from "../../components/layout/MainLayout"
// import {useSelector} from "react-redux";

// const BASE_URL = import.meta.env.VITE_BASE_URL;

// // Config: Toggle multiple selection
// const ALLOW_MULTIPLE_COMPANIES = true;
// const ALLOW_MULTIPLE_ROLES = true;

// export default function AiCompanyRoleSetup() {
//     const navigate = useNavigate();
//     const {token}=useSelector((state)=> state.auth);
//     const { companies, jobRoles, isLoading: isMasterDataLoading } = useMasterData();

//     const [selectedCompanyIds, setSelectedCompanyIds] = useState([]);
//     const [selectedRoleIds, setSelectedRoleIds] = useState([]);
//     const [isSubmitting, setIsSubmitting] = useState(false);
//     const [showLoadingScreen, setShowLoadingScreen] = useState(false);

//     // Convert master data into options format
//     const companyOptions = companies.map((c) => ({
//         label: c.company_name,
//         value: c.id, // sending ID as number
//     }));

//     const jobRoleOptions = jobRoles.map((r) => ({
//         label: r.title,
//         value: r.id, // sending ID as number
//     }));

//     const handleCompanySelect = (e) => {
//         const selectedId = Number(e.target.value); // ensure it's a number
//         if (selectedId === 0) return; // skip placeholder

//         if (ALLOW_MULTIPLE_COMPANIES) {
//             if (!selectedCompanyIds.includes(selectedId)) {
//                 setSelectedCompanyIds([...selectedCompanyIds, selectedId]);
//             }
//         } else {
//             setSelectedCompanyIds([selectedId]); // single select
//         }

//         // Reset dropdown after selection
//         e.target.value = 0;
//     };

//     const handleRoleSelect = (e) => {
//         const selectedId = Number(e.target.value); // ensure it's a number
//         if (selectedId === 0) return; // skip placeholder

//         if (ALLOW_MULTIPLE_ROLES) {
//             if (!selectedRoleIds.includes(selectedId)) {
//                 setSelectedRoleIds([...selectedRoleIds, selectedId]);
//             }
//         } else {
//             setSelectedRoleIds([selectedId]); // single select
//         }

//         // Reset dropdown after selection
//         e.target.value = 0;
//     };

//     const removeCompany = (idToRemove) => {
//         setSelectedCompanyIds(selectedCompanyIds.filter(id => id !== idToRemove));
//     };

//     const removeRole = (idToRemove) => {
//         setSelectedRoleIds(selectedRoleIds.filter(id => id !== idToRemove));
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (selectedCompanyIds.length === 0 || selectedRoleIds.length === 0) {
//             alert("Please select at least one company and one job role.");
//             return;
//         }

//         setIsSubmitting(true);
//         setShowLoadingScreen(true);

//         try {
//             const res = await axios.post(`${BASE_URL}/recommendations/ai-prediction`, {
//                 strategy: "company_role",
//                 companyIds: selectedCompanyIds, // array of numbers
//                 roleIds: selectedRoleIds,         // array of numbers
//             },
//                 {
//                     headers: {
//                         "Authorization": `Bearer ${token}`,
//                         "Content-Type": "application/json",
//                     },
//                 }
//             );

//             if (res.data.success) {
//                 localStorage.setItem("aiPredictionResult", JSON.stringify(res.data.data));
//                 navigate("/ai-learning");
//             } else {
//                 alert("Prediction failed: " + res.data.message);
//                 setShowLoadingScreen(false);
//             }
//         } catch (err) {
//             console.error("API Error:", err);
//             alert("Network error. Please try again.");
//             setShowLoadingScreen(false);
//         } finally {
//             setIsSubmitting(false);
//         }
//     };

//     // Loading skeleton
//     if (isMasterDataLoading) {
//         return (
//             <div className="flex justify-center items-center h-screen">
//                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
//             </div>
//         );
//     }

//     // Loading screen after submit
//     if (showLoadingScreen) {
//         return (
//             <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
//                 <div className="text-center max-w-md">
//                     <div className="w-24 h-24 mx-auto mb-4">
//                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-blue-500">
//                             <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
//                         </svg>
//                     </div>
//                     <h2 className="text-xl font-bold text-gray-800 mb-2">Generating Your Personalized Plan</h2>
//                     <p className="text-gray-600">Please wait while we analyze your target roles and companies...</p>
//                 </div>
//             </div>
//         );
//     }

//     return (
//         <MainLayout>
//         <div className="min-h-screen bg-white relative overflow-hidden">
//             {/* Background Illustration */}
//             <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-br from-blue-50 to-white z-0 pointer-events-none">
//                 {/* Optional: Add a subtle pattern or leave empty */}
                
//             </div>

//             {/* Main Content */}
//             <div className="relative z-10 pt-16 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
//                 {/* Header Section */}
//                 <div className="text-center mb-8">
//                     <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
//                         Set Your Target
//                     </h1>
//                     <p className="text-sm sm:text-base text-gray-600 mt-2">
//                         Target your dream job with us.
//                     </p>
//                 </div>

//                 {/* Form Section */}
//                 <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8">
//                     <form onSubmit={handleSubmit} className="space-y-6">

//                         {/* Company Selection */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Choose Company *
//                             </label>

//                             {/* Selected Chips */}
//                             <div className="flex flex-wrap gap-2 mb-2">
//                                 {selectedCompanyIds.map((id) => {
//                                     const company = companyOptions.find(c => c.value === id);
//                                     return (
//                                         <span
//                                             key={id}
//                                             className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-medium"
//                                         >
//                                             {company?.label}
//                                             <button
//                                                 type="button"
//                                                 onClick={() => removeCompany(id)}
//                                                 className="ml-1 text-white hover:text-gray-200 focus:outline-none"
//                                             >
//                                                 ×
//                                             </button>
//                                         </span>
//                                     );
//                                 })}
//                             </div>

//                             {/* Dropdown */}
//                             <select
//                                 value={0} // always reset to placeholder
//                                 onChange={handleCompanySelect}
//                                 className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
//                                 required
//                             >
//                                 <option value={0}>-- Select Company --</option>
//                                 {companyOptions.map((opt) => (
//                                     <option key={opt.value} value={opt.value}>
//                                         {opt.label}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>

//                         {/* Role Selection */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Choose Profile *
//                             </label>

//                             {/* Selected Chips */}
//                             <div className="flex flex-wrap gap-2 mb-2">
//                                 {selectedRoleIds.map((id) => {
//                                     const role = jobRoleOptions.find(r => r.value === id);
//                                     return (
//                                         <span
//                                             key={id}
//                                             className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-medium"
//                                         >
//                                             {role?.label}
//                                             <button
//                                                 type="button"
//                                                 onClick={() => removeRole(id)}
//                                                 className="ml-1 text-white hover:text-gray-200 focus:outline-none"
//                                             >
//                                                 ×
//                                             </button>
//                                         </span>
//                                     );
//                                 })}
//                             </div>

//                             {/* Dropdown */}
//                             <select
//                                 value={0} // always reset to placeholder
//                                 onChange={handleRoleSelect}
//                                 className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
//                                 required
//                             >
//                                 <option value={0}>-- Select Job Role --</option>
//                                 {jobRoleOptions.map((opt) => (
//                                     <option key={opt.value} value={opt.value}>
//                                         {opt.label}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>

//                         <Button
//                             type="submit"
//                             disabled={isSubmitting}
//                             className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-md disabled:opacity-75"
//                         >
//                             {isSubmitting ? "Setting Target..." : "Set Target"}
//                         </Button>
//                     </form>
//                 </div>
//             </div>
//         </div>
//         </MainLayout>
//     );
// }



// src/pages/AiCompanyRoleSetup.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useMasterData } from "../../hooks/master/useMasterData";
import { Button } from "../../components/ui";
import AiProfileIllustration1 from "../../assets/AiProfileIllustration1.png";
import MainLayout from "../../components/layout/MainLayout";

export default function AiCompanyRoleSetup() {
    const navigate = useNavigate();
    const location = useLocation();
    const { companies, jobRoles, isLoading: isMasterDataLoading } = useMasterData();

    const [selectedCompanyIds, setSelectedCompanyIds] = useState([]);
    const [selectedRoleIds, setSelectedRoleIds] = useState([]);

    // Pre-fill if coming back (optional)
    useEffect(() => {
        const { companyIds = [], roleIds = [] } = location.state || {};
        if (companyIds.length) setSelectedCompanyIds(companyIds);
        if (roleIds.length) setSelectedRoleIds(roleIds);
    }, [location.state]);

    const companyOptions = companies.map((c) => ({
        label: c.company_name,
        value: c.id,
    }));

    const jobRoleOptions = jobRoles.map((r) => ({
        label: r.title,
        value: r.id,
    }));

    const handleCompanySelect = (e) => {
        const id = Number(e.target.value);
        if (id && !selectedCompanyIds.includes(id)) {
            setSelectedCompanyIds([...selectedCompanyIds, id]);
        }
        e.target.value = "";
    };

    const handleRoleSelect = (e) => {
        const id = Number(e.target.value);
        if (id && !selectedRoleIds.includes(id)) {
            setSelectedRoleIds([...selectedRoleIds, id]);
        }
        e.target.value = "";
    };

    const removeCompany = (id) => {
        setSelectedCompanyIds(selectedCompanyIds.filter(cid => cid !== id));
    };

    const removeRole = (id) => {
        setSelectedRoleIds(selectedRoleIds.filter(rid => rid !== id));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (selectedCompanyIds.length === 0 || selectedRoleIds.length === 0) {
            alert("Please select at least one company and one job role.");
            return;
        }

        //  Only navigate — NO API CALL HERE
        navigate("/ai-learning", {
            state: {
                strategy: "company_role",
                companyIds: selectedCompanyIds,
                roleIds: selectedRoleIds,
            },
        });
    };

    if (isMasterDataLoading) {
        return (
            <MainLayout>
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-red-500"></div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="min-h-screen bg-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[60vh] bg-gradient-to-br from-blue-50 to-white z-0"></div>

                <div className="relative z-10 pt-16 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
                            Set Your Target
                        </h1>
                        <p className="text-sm sm:text-base text-gray-600 mt-2">
                            Target your dream job with us.
                        </p>
                    </div>

                    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* Company Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Choose Company *
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {selectedCompanyIds.map((id) => {
                                        const comp = companyOptions.find(c => c.value === id);
                                        return comp ? (
                                            <span key={id} className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500 text-white text-xs">
                                                {comp.label}
                                                <button type="button" onClick={() => removeCompany(id)} className="ml-1">×</button>
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                                <select
                                    onChange={handleCompanySelect}
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
                                >
                                    <option value="">-- Select Company --</option>
                                    {companyOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Choose Profile *
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {selectedRoleIds.map((id) => {
                                        const role = jobRoleOptions.find(r => r.value === id);
                                        return role ? (
                                            <span key={id} className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500 text-white text-xs">
                                                {role.label}
                                                <button type="button" onClick={() => removeRole(id)} className="ml-1">×</button>
                                            </span>
                                        ) : null;
                                    })}
                                </div>
                                <select
                                    onChange={handleRoleSelect}
                                    className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-red-500 focus:border-red-500"
                                >
                                    <option value="">-- Select Job Role --</option>
                                    {jobRoleOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 rounded-md"
                            >
                                Set Target
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}