// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaCamera, FaChevronDown, FaChevronUp, FaCheckCircle, FaRegCircle } from "react-icons/fa";
// import MainLayout from "../../components/layout/MainLayout";
// import FeedRightSidebar from "../student/feed/FeedRightSidebar";
// import dummyProfile3 from "../../assets/dummyProfile3.jpg";
// import useUploadImageApi from "../../hooks/useUploadImageApi";
// import { recruiterApi } from "../../api/recruiterApi";
// import { useSelector, useDispatch } from "react-redux";
// import axios from 'axios';
// import { getImageUrl } from "../../../utils";
// import { Loader2 } from 'lucide-react';
// import { updateUser } from "../../redux/feature/authSlice";
// import CreatableSelect from 'react-select/creatable';
// import Select from 'react-select';

// const VerificationBadge = ({ isVerified, onClick }) => {
//   if (isVerified) return null;
//   return (
//     <div
//       className="absolute cursor-pointer -top-1 -right-1 group"
//       onClick={onClick}
//       title="Account not fully verified. Complete email, phone, and GST verification."
//       aria-label="Verification required"
//     >
//       <div className="flex items-center justify-center w-6 h-6 transition-colors bg-yellow-500 rounded-full shadow-lg group-hover:bg-yellow-600">
//         <span className="text-xs font-bold text-white">!</span>
//       </div>
//       <div className="absolute right-0 z-10 w-48 px-3 py-2 mt-2 text-xs text-white whitespace-normal transition-opacity bg-gray-900 rounded opacity-0 pointer-events-none top-full group-hover:opacity-100">
//         <p>Verification incomplete</p>
//         <p className="mt-1">Email, phone, or GST not verified.</p>
//         <p className="mt-1 text-blue-300 underline">Tap to verify</p>
//       </div>
//     </div>
//   );
// };

// const CollapsibleSection = ({ title, weight, score, children, isExpanded, onToggle, showEditControls, onEditClick, onSaveClick, onCancelClick, isEditing }) => {
//   const percentage = Math.min(100, Math.round((score / weight) * 100));
//   const isComplete = percentage === 100;
//   return (
//     <div className="overflow-hidden bg-white shadow-sm rounded-xl">
//       <div
//         className="flex items-center justify-between p-4 transition-colors cursor-pointer hover:bg-gray-50"
//         onClick={onToggle}
//       >
//         <div className="flex items-center gap-3">
//           <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
//           {isComplete && <FaCheckCircle className="text-green-500" size={18} />}
//         </div>
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-2">
//             <div className={`w-24 h-2 rounded-full ${isComplete ? 'bg-green-200' : 'bg-yellow-200'}`}>
//               <div
//                 className={`h-full rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-yellow-500'}`}
//                 style={{ width: `${percentage}%` }}
//               />
//             </div>
//             <span className={`text-sm font-medium ${isComplete ? 'text-green-600' : 'text-yellow-600'}`}>
//               {percentage}%
//             </span>
//           </div>
//           <div className="flex items-center gap-2">
//             {showEditControls && (
//               isEditing ? (
//                 <>
//                   <button
//                     onClick={(e) => { e.stopPropagation(); onSaveClick(); }}
//                     className="text-sm font-medium text-green-600 hover:text-green-800"
//                   >
//                     Save
//                   </button>
//                   <button
//                     onClick={(e) => { e.stopPropagation(); onCancelClick(); }}
//                     className="text-sm font-medium text-gray-500 hover:text-gray-700"
//                   >
//                     Cancel
//                   </button>
//                 </>
//               ) : (
//                 <button
//                   onClick={(e) => { e.stopPropagation(); onEditClick(); }}
//                   className="text-sm font-medium text-blue-600 hover:text-blue-800"
//                 >
//                   Edit
//                 </button>
//               )
//             )}
//             <button className="p-1 transition-colors rounded hover:bg-gray-200">
//               {isExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
//             </button>
//           </div>
//         </div>
//       </div>
//       {isExpanded && (
//         <div className="px-4 pb-4 border-t border-gray-400">
//           {children}
//         </div>
//       )}
//     </div>
//   );
// };

// // Updated FieldRow to support custom components (like react-select) via type="custom"
// const FieldRow = ({ label, value, isVerified = false, isEditable = false, editValue, onChange, type = "text", placeholder = "", rows = 1, children }) => {
//   return (
//     <div className="py-3 border-b border-gray-400 last:border-0">
//       <div className="flex items-start justify-between">
//         <div className="flex-1">
//           <div className="flex items-center gap-2 mb-1">
//             <span className="text-sm font-medium text-gray-700">{label}</span>
//             {isVerified && <FaCheckCircle className="text-green-500" size={14} />}
//           </div>
//           {isEditable ? (
//             type === "custom" ? (
//               <div className="w-full">{children}</div>
//             ) : type === "textarea" ? (
//               <textarea
//                 value={editValue || ""}
//                 onChange={(e) => onChange(e.target.value)}
//                 className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 rows={rows}
//                 placeholder={placeholder}
//               />
//             ) : type === "select" ? (
//               <select
//                 value={editValue || ""}
//                 onChange={(e) => onChange(e.target.value)}
//                 className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//               >
//                 {children}
//               </select>
//             ) : (
//               <input
//                 type={type}
//                 value={editValue || ""}
//                 onChange={(e) => onChange(e.target.value)}
//                 className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 placeholder={placeholder}
//               />
//             )
//           ) : (
//             <p className="text-sm text-gray-600 whitespace-pre-wrap">
//               {value || <span className="text-gray-400">Not provided</span>}
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// const CompanyProfileEdit = () => {
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { token } = useSelector((state) => state.auth);
//   const [userData, setUserData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [expandedSections, setExpandedSections] = useState({
//     basic_info: false,
//     company_info: false,
//     verification: false
//   });
//   const [editingSections, setEditingSections] = useState({});

//   //  UPDATED: Added new address fields to formValues
//   const [formValues, setFormValues] = useState({
//     first_name: "",
//     last_name: "",
//     email: "",
//     phone: "",
//     dob: "",
//     gender: "",
//     company_name: "",
//     about: "",
//     hiring_preferences: "",
//     profile_pic: "",
//     logo_url: "",
//     gst_number: "",
//     company_address: "",
//     industry_id: null,
//     company_location_id: null,
//     designation_id: null,
//     // ===== NEW ADDRESS FIELDS =====
//     address_line_1: "",
//     address_line_2: "",
//     state: "",
//     country: "",
//     pincode: "",
//     // ===== END NEW FIELDS =====
//   });

//   const [uploading, setUploading] = useState({
//     profilePic: false,
//     logo: false
//   });
//   const [profileCompletion, setProfileCompletion] = useState({
//     basic_info: { weight: 25, score: 0 },
//     company_info: { weight: 45, score: 0 },
//     verification: { weight: 30, score: 0 }
//   });
//   const BASE_URL = import.meta.env.VITE_BASE_URL;
//   const [industryOptions, setIndustryOptions] = useState([]);
//   const [locationOptions, setLocationOptions] = useState([]);
//   const [jobRoleOptions, setJobRoleOptions] = useState([]);
//   const [industryLoading, setIndustryLoading] = useState(false);
//   const [locationLoading, setLocationLoading] = useState(false);
//   const [jobRoleLoading, setJobRoleLoading] = useState(false);
//   const { uploadImage } = useUploadImageApi();

//   const fetchProfileCompletion = async () => {
//     try {
//       const response = await recruiterApi.getProfileCompletion(token, { detailed: true });
//       if (response.success && response.data.breakdown) {
//         setProfileCompletion({
//           basic_info: response.data.breakdown.basic_info || { weight: 25, score: 0 },
//           company_info: response.data.breakdown.company_info || { weight: 45, score: 0 },
//           verification: response.data.breakdown.verification || { weight: 30, score: 0 }
//         });
//       }
//     } catch (error) {
//       console.error('Error fetching profile completion:', error);
//     }
//   };

//   useEffect(() => {
//     const getProfile = async () => {
//       try {
//         setLoading(true);
//         const response = await recruiterApi.getProfile(token);
//         setUserData(response);

//         //  UPDATED: Include new address fields in initialValues
//         const initialValues = {
//           first_name: response?.first_name || "",
//           last_name: response?.last_name || "",
//           email: response?.email || "",
//           phone: response?.mobile || "",
//           dob: response?.dob || "",
//           gender: response?.gender || "",
//           company_name: response?.company_name || "",
//           about: response?.about || "",
//           hiring_preferences: response?.hiring_preferences || "",
//           profile_pic: response?.profile_picUrl || "",
//           logo_url: response?.logo_url || "",
//           gst_number: response?.gst_number || "",
//           company_address: response?.company_address || "",
//           industry_id: response?.industry_id || null,
//           company_location_id: response?.company_location_id || null,
//           designation_id: response?.designation_id || null,
//           // ===== NEW ADDRESS FIELDS =====
//           address_line_1: response?.address_line_1 || "",
//           address_line_2: response?.address_line_2 || "",
//           state: response?.state || "",
//           country: response?.country || "",
//           pincode: response?.pincode || "",
//           // ===== END NEW FIELDS =====
//         };
//         setFormValues(initialValues);
//         await fetchProfileCompletion();
//       } catch (error) {
//         console.error('Error fetching profile:', error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     if (token) {
//       getProfile();
//     }
//   }, [token]);

//   // Debounce helper
//   const debounce = (func, delay) => {
//     let timeoutId;
//     return (...args) => {
//       clearTimeout(timeoutId);
//       timeoutId = setTimeout(() => func(...args), delay);
//     };
//   };

//   // Fetch Functions
//   const fetchIndustries = async (query) => {
//     try {
//       setIndustryLoading(true);
//       const res = await axios.get(`${BASE_URL}/master/industries/search?search=${query}`);
//       setIndustryOptions((res.data.data || []).map(i => ({ value: String(i.id), label: i.name })));
//     } catch (error) {
//       console.error("Industry search failed", error);
//       setIndustryOptions([]);
//     } finally {
//       setIndustryLoading(false);
//     }
//   };

//   const fetchLocations = async (query) => {
//     try {
//       setLocationLoading(true);
//       const res = await axios.get(`${BASE_URL}/master/location/search?search=${query}`);
//       setLocationOptions((res.data.data || []).map(l => ({ value: String(l.id), label: l.name })));
//     } catch (error) {
//       console.error("Location search failed", error);
//       setLocationOptions([]);
//     } finally {
//       setLocationLoading(false);
//     }
//   };

//   const fetchJobRoles = async (query) => {
//     try {
//       setJobRoleLoading(true);
//       const res = await axios.get(`${BASE_URL}/master/job-roles/search?search=${query}`);
//       setJobRoleOptions((res.data.data || []).map(j => ({ value: String(j.id), label: j.title })));
//     } catch (error) {
//       console.error("Job role search failed", error);
//       setJobRoleOptions([]);
//     } finally {
//       setJobRoleLoading(false);
//     }
//   };

//   // Debounced versions
//   const debouncedFetchIndustries = debounce(fetchIndustries, 300);
//   const debouncedFetchLocations = debounce(fetchLocations, 300);
//   const debouncedFetchJobRoles = debounce(fetchJobRoles, 300);

//   if (loading) {
//     return (
//       <MainLayout>
//         <div className="flex items-center justify-center min-h-screen">
//           <div className="flex flex-col items-center gap-4">
//             <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
//             <p className="text-gray-600">Loading company profile...</p>
//           </div>
//         </div>
//       </MainLayout>
//     );
//   }

//   const toggleSection = (section) => {
//     setExpandedSections(prev => ({
//       ...prev,
//       [section]: !prev[section]
//     }));
//   };

//   const toggleEdit = (section) => {
//     setEditingSections(prev => ({
//       ...prev,
//       [section]: !prev[section]
//     }));
//   };

//   const handleSaveSection = async (section) => {
//     try {
//       //  UPDATED: formValues already includes new address fields
//       const response = await recruiterApi.updateProfile(formValues, token);
//       if (response.success || response.message === "Company recruiter profile updated successfully") {
//         const updatedProfile = response.profile;
//         setUserData(updatedProfile);

//         //  UPDATED: Include new fields in formValues update
//         setFormValues({
//           ...formValues,
//           first_name: updatedProfile.first_name || "",
//           last_name: updatedProfile.last_name || "",
//           email: updatedProfile.email || "",
//           phone: updatedProfile.mobile || "",
//           dob: updatedProfile.dob || "",
//           gender: updatedProfile.gender || "",
//           company_name: updatedProfile.company_name || "",
//           about: updatedProfile.about || "",
//           hiring_preferences: updatedProfile.hiring_preferences || "",
//           profile_pic: updatedProfile.profile_picUrl || "",
//           logo_url: updatedProfile.logo_url || "",
//           gst_number: updatedProfile.gst_number || "",
//           company_address: updatedProfile.company_address || "",
//           industry_id: updatedProfile.industry_id || null,
//           company_location_id: updatedProfile.company_location_id || null,
//           designation_id: updatedProfile.designation_id || null,
//           // ===== NEW ADDRESS FIELDS =====
//           address_line_1: updatedProfile.address_line_1 || "",
//           address_line_2: updatedProfile.address_line_2 || "",
//           state: updatedProfile.state || "",
//           country: updatedProfile.country || "",
//           pincode: updatedProfile.pincode || "",
//           // ===== END NEW FIELDS =====
//         });

//         dispatch(updateUser({
//           user_profile_pic: updatedProfile.profile_picUrl,
//           organization_logo: updatedProfile.logo_url,
//           first_name: updatedProfile.first_name,
//           last_name: updatedProfile.last_name,
//           organization_name: updatedProfile.company_name,
//           about: updatedProfile.about,
//         }));

//         await fetchProfileCompletion();
//         alert('Profile updated successfully!');
//         toggleEdit(section);
//       } else {
//         alert(response.message || 'Failed to update profile');
//       }
//     } catch (error) {
//       console.error('Error updating profile:', error);
//       alert(error.response?.data?.message || 'An error occurred while updating the profile');
//     }
//   };

//   const handleImageUpload = async (e, type = 'profilePic') => {
//     const file = e.target.files[0];
//     if (!file) return;
//     setUploading(prev => ({ ...prev, [type]: true }));
//     const result = await uploadImage(file, type);
//     const field = type === 'profilePic' ? 'profile_pic' : 'logo_url';
//     const updatedValues = { ...formValues, [field]: result };
//     setFormValues(updatedValues);
//     const response = await recruiterApi.updateProfile(updatedValues, token);
//     if (response.success || response.message === "Company recruiter profile updated successfully") {
//       setUserData(response.profile);
//       if (type === 'profilePic') {
//         dispatch(updateUser({ user_profile_pic: response.profile.profile_picUrl }));
//       } else {
//         dispatch(updateUser({ organization_logo: response.profile.logo_url }));
//       }
//       alert(type === 'profilePic' ? 'Profile picture updated!' : 'Logo updated!');
//       await fetchProfileCompletion();
//     } else {
//       alert('Failed to update image.');
//     }
//     setUploading(prev => ({ ...prev, [type]: false }));
//   };

//   const handleChange = (field, value) => {
//     setFormValues(prev => ({ ...prev, [field]: value }));
//   };

//   const profile = userData;

//   const getSectionStatus = (sectionKey) => {
//     const section = profileCompletion[sectionKey];
//     if (!section) return { percentage: 0, isComplete: false };
//     const percentage = Math.min(100, Math.round((section.score / section.weight) * 100));
//     return { percentage, isComplete: percentage === 100 };
//   };

//   const isFieldComplete = (value, isVerification = false) => {
//     if (isVerification) return value === true;
//     return value && String(value).trim() !== "";
//   };

//   return (
//     <MainLayout>
//       <div className="flex flex-col w-full gap-6 p-4 mx-auto lg:flex-row max-w-7xl">
//         <div className="w-full space-y-6">
//           {/* Logo Header */}
//           <div className="flex flex-col items-center justify-center p-8 bg-white shadow-sm rounded-xl">
//             <div className="relative mb-4 group">
//               {formValues.logo_url ? (
//                 <img
//                   src={formValues.logo_url.startsWith('http') ? formValues.logo_url : getImageUrl(formValues.logo_url)}
//                   alt="Company logo"
//                   className="object-contain w-24 h-24 border-2 border-gray-200 rounded-lg shadow-sm"
//                 />
//               ) : (
//                 <div className="flex items-center justify-center w-24 h-24 bg-gray-100 border-2 border-gray-300 border-dashed rounded-lg">
//                   <span className="text-sm text-gray-500">No logo</span>
//                 </div>
//               )}
//               <label className="absolute p-2 text-white transition-colors bg-blue-600 rounded-full shadow-md cursor-pointer -bottom-2 -right-2 hover:bg-blue-700">
//                 <FaCamera size={14} />
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) => handleImageUpload(e, 'logo')}
//                   className="hidden"
//                   disabled={uploading.logo}
//                 />
//               </label>
//               <VerificationBadge
//                 isVerified={
//                   true &&  //  Email always verified
//                   profile?.is_phone_verified &&
//                   profile?.is_gst_verified
//                 }
//               />
//             </div>
//             <h1 className="text-2xl font-bold text-center text-gray-900">
//               {formValues.company_name || "Your Company"}
//             </h1>
//             {profileCompletion && (
//               <div className="mt-2 text-sm text-gray-500">
//                 Overall Completion: {Math.round(profileCompletion.basic_info.score + profileCompletion.company_info.score + profileCompletion.verification.score)}%
//               </div>
//             )}
//           </div>

//           {/* ===== SECTION 1: BASIC INFO (25%) ===== */}
//           <CollapsibleSection
//             title="Basic Info"
//             weight={profileCompletion.basic_info?.weight || 25}
//             score={profileCompletion.basic_info?.score || 0}
//             isExpanded={expandedSections.basic_info}
//             onToggle={() => toggleSection('basic_info')}
//             showEditControls={true}
//             isEditing={editingSections.basic_info}
//             onEditClick={() => toggleEdit('basic_info')}
//             onSaveClick={() => handleSaveSection('basic_info')}
//             onCancelClick={() => toggleEdit('basic_info')}
//           >
//             <div className="space-y-1">
//               <FieldRow label="First Name" value={formValues.first_name} isVerified={isFieldComplete(formValues.first_name)} isEditable={editingSections.basic_info} editValue={formValues.first_name} onChange={(val) => handleChange("first_name", val)} placeholder="Enter first name" />
//               <FieldRow label="Last Name" value={formValues.last_name} isVerified={isFieldComplete(formValues.last_name)} isEditable={editingSections.basic_info} editValue={formValues.last_name} onChange={(val) => handleChange("last_name", val)} placeholder="Enter last name" />
//               <FieldRow label="Email" value={formValues.email} isVerified={true} isEditable={editingSections.basic_info} editValue={formValues.email} onChange={(val) => handleChange("email", val)} type="email" placeholder="Enter email" />
//               <FieldRow label="Phone" value={formValues.phone} isVerified={isFieldComplete(formValues.phone)} isEditable={editingSections.basic_info} editValue={formValues.phone} onChange={(val) => handleChange("phone", val)} placeholder="Enter phone number" />
//               <FieldRow label="Date of Birth" value={formValues.dob} isVerified={isFieldComplete(formValues.dob)} isEditable={editingSections.basic_info} editValue={formValues.dob} onChange={(val) => handleChange("dob", val)} type="date" />
//               <FieldRow label="Gender" value={formValues.gender ? formValues.gender.charAt(0).toUpperCase() + formValues.gender.slice(1) : ""} isVerified={isFieldComplete(formValues.gender)} isEditable={editingSections.basic_info} editValue={formValues.gender} onChange={(val) => handleChange("gender", val)} type="select">
//                 <option value="">Select</option>
//                 <option value="male">Male</option>
//                 <option value="female">Female</option>
//                 <option value="other">Other</option>
//               </FieldRow>
//               {/* Designation */}
//               <FieldRow label="Designation" value={profile?.designation_name || "Not set"} isVerified={formValues.designation_id != null} isEditable={editingSections.basic_info} type="custom">
//                 <CreatableSelect value={formValues.designation_id != null ? { value: String(formValues.designation_id), label: String(jobRoleOptions.find((o) => o.value === String(formValues.designation_id))?.label || profile?.designation_name || "") } : null} onInputChange={(val) => val.length >= 3 && debouncedFetchJobRoles(val)} options={jobRoleOptions} isLoading={jobRoleLoading} filterOption={null} isClearable isSearchable className="text-sm" placeholder="Type min 3 chars to search or create" noOptionsMessage={({ inputValue }) => { if (!inputValue) return "Start typing..."; if (inputValue.length < 3) return "Type min 3 chars to search, or Enter to create new"; return `No matches found. Press Enter to create "${inputValue}"`; }} formatCreateLabel={(inputValue) => `+ Create: "${inputValue}"`} onChange={(opt) => handleChange("designation_id", opt ? parseInt(opt.value) : null)} />
//               </FieldRow>
//               <div className="py-3 border-b border-gray-100">
//                 <div className="flex items-center justify-between">
//                   <div className="flex items-center gap-2">
//                     <span className="text-sm font-medium text-gray-700">Profile Picture</span>
//                     {isFieldComplete(formValues.profile_pic) && <FaCheckCircle className="text-green-500" size={14} />}
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-4 mt-2">
//                   <div className="relative group">
//                     <img alt="Profile" src={getImageUrl(formValues.profile_pic) || getImageUrl(profile?.profile_picUrl) || dummyProfile3} className="object-cover w-16 h-16 border-2 border-white rounded-full shadow-sm" />
//                     {editingSections.basic_info && (
//                       <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full text-xs cursor-pointer hover:bg-blue-700">
//                         <FaCamera />
//                         <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'profilePic')} className="hidden" disabled={uploading.profilePic} />
//                       </label>
//                     )}
//                   </div>
//                   {!editingSections.basic_info && (
//                     <span className="text-sm text-gray-500">{formValues.profile_pic ? "Profile picture set" : "No profile picture"}</span>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </CollapsibleSection>

//           {/* ===== SECTION 2: COMPANY INFO (45%) - UPDATED WITH ADDRESS FIELDS ===== */}
//           <CollapsibleSection
//             title="Company Info"
//             weight={profileCompletion.company_info?.weight || 45}
//             score={profileCompletion.company_info?.score || 0}
//             isExpanded={expandedSections.company_info}
//             onToggle={() => toggleSection('company_info')}
//             showEditControls={true}
//             isEditing={editingSections.company_info}
//             onEditClick={() => toggleEdit('company_info')}
//             onSaveClick={() => handleSaveSection('company_info')}
//             onCancelClick={() => toggleEdit('company_info')}
//           >
//             <div className="space-y-1">
//               <FieldRow label="Company Name" value={formValues.company_name} isVerified={isFieldComplete(formValues.company_name)} isEditable={editingSections.company_info} editValue={formValues.company_name} onChange={(val) => handleChange("company_name", val)} placeholder="Enter company name" />

//               <FieldRow label="About" value={formValues.about} isVerified={isFieldComplete(formValues.about)} isEditable={editingSections.company_info} editValue={formValues.about} onChange={(val) => handleChange("about", val)} type="textarea" rows={4} placeholder="Describe your company...">
//                 <div className="flex justify-between mt-1 text-xs text-gray-500">
//                   <span>{(formValues.about || "").length}/1000 characters</span>
//                   {(formValues.about || "").length > 900 && <span className="font-medium text-orange-600">{1000 - (formValues.about || "").length} left</span>}
//                 </div>
//               </FieldRow>

//               {/* NEW: Address Line 1 & 2 */}
//               <FieldRow label="Address Line 1" value={formValues.address_line_1} isVerified={isFieldComplete(formValues.address_line_1)} isEditable={editingSections.company_info} editValue={formValues.address_line_1} onChange={(val) => handleChange("address_line_1", val)} placeholder="Street, Building, Area" />
//               <FieldRow label="Address Line 2 (Optional)" value={formValues.address_line_2} isVerified={isFieldComplete(formValues.address_line_2)} isEditable={editingSections.company_info} editValue={formValues.address_line_2} onChange={(val) => handleChange("address_line_2", val)} placeholder="Landmark, Locality, Sector" />
//               {/* Location */}
//               <FieldRow label="City" value={profile?.location_name || "Not set"} isVerified={formValues.company_location_id != null} isEditable={editingSections.company_info} type="custom">
//                 <Select value={formValues.company_location_id != null ? { value: String(formValues.company_location_id), label: String(locationOptions.find((o) => o.value === String(formValues.company_location_id))?.label || profile?.location_name || "") } : null} onInputChange={(val) => val.length >= 3 && debouncedFetchLocations(val)} options={locationOptions} isLoading={locationLoading} filterOption={null} isClearable isSearchable className="text-sm" placeholder="Type min 3 chars to search city" noOptionsMessage={({ inputValue }) => { if (!inputValue) return "Start typing city name..."; if (inputValue.length < 3) return "Type min 3 chars to search"; return "No cities found"; }} onChange={(opt) => handleChange("company_location_id", opt ? parseInt(opt.value) : null)} />
//               </FieldRow>
//               {/*  NEW: State, Country, Pincode in Grid */}
//               <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 py-2">
//                 <FieldRow label="State" value={formValues.state} isVerified={isFieldComplete(formValues.state)} isEditable={editingSections.company_info} editValue={formValues.state} onChange={(val) => handleChange("state", val)} placeholder="State" />
//                 <FieldRow label="Country" value={formValues.country} isVerified={isFieldComplete(formValues.country)} isEditable={editingSections.company_info} editValue={formValues.country} onChange={(val) => handleChange("country", val)} placeholder="Country" />
//                 <FieldRow label="Pincode" value={formValues.pincode} isVerified={isFieldComplete(formValues.pincode)} isEditable={editingSections.company_info} editValue={formValues.pincode} onChange={(val) => handleChange("pincode", val)} placeholder="Pincode" />
//               </div>

//               {/* <FieldRow label="Company Address" value={formValues.company_address} isVerified={isFieldComplete(formValues.company_address)} isEditable={editingSections.company_info} editValue={formValues.company_address} onChange={(val) => handleChange("company_address", val)} type="textarea" rows={2} placeholder="Enter company address" /> */}
//               <FieldRow label="GST Number" value={formValues.gst_number} isVerified={isFieldComplete(formValues.gst_number)} isEditable={editingSections.company_info} editValue={formValues.gst_number} onChange={(val) => handleChange("gst_number", val)} placeholder="Enter GST number" />

//               {/* Industry/Category */}
//               <FieldRow label="Category" value={profile?.industry_name || "Not set"} isVerified={formValues.industry_id != null} isEditable={editingSections.company_info} type="custom">
//                 <CreatableSelect value={formValues.industry_id != null ? { value: String(formValues.industry_id), label: String(industryOptions.find((o) => o.value === String(formValues.industry_id))?.label || profile?.industry_name || "") } : null} onInputChange={(val) => val.length >= 3 && debouncedFetchIndustries(val)} options={industryOptions} isLoading={industryLoading} filterOption={null} isClearable isSearchable className="text-sm" placeholder="Type min 3 chars to search or create" noOptionsMessage={({ inputValue }) => { if (!inputValue) return "Type min 3 characters to search..."; if (inputValue.length < 3) return "Type min 3 chars to search, or Enter to create new"; return `No matches found. Press Enter to create "${inputValue}"`; }} formatCreateLabel={(inputValue) => `+ Create: "${inputValue}"`} onChange={(opt) => handleChange("industry_id", opt ? parseInt(opt.value) : null)} />
//               </FieldRow>

//               {/* Logo status */}
//               <div className="py-3">
//                 <div className="flex items-center gap-2">
//                   <span className="text-sm font-medium text-gray-700">Company Logo</span>
//                   {isFieldComplete(formValues.logo_url) && <FaCheckCircle className="text-green-500" size={14} />}
//                 </div>
//                 <p className="mt-1 text-sm text-gray-500">{formValues.logo_url ? "Logo uploaded (visible at top)" : "No logo uploaded"}</p>
//               </div>
//             </div>
//           </CollapsibleSection>

//           {/* ===== SECTION 3: VERIFICATION (30%) ===== */}
//           <CollapsibleSection title="Verification" weight={profileCompletion.verification?.weight || 30} score={profileCompletion.verification?.score || 0} isExpanded={expandedSections.verification} onToggle={() => toggleSection('verification')} showEditControls={false}>
//             <div className="space-y-1">
//               <FieldRow label="Email Verification" value="Verified" isVerified={true} isEditable={false} />
//               <FieldRow label="Phone Verification" value={profile?.is_phone_verified ? "Verified" : "Not Verified"} isVerified={profile?.is_phone_verified} isEditable={false} />
//               <FieldRow label="GST Verification" value={profile?.is_gst_verified ? "Verified" : "Not Verified"} isVerified={profile?.is_gst_verified} isEditable={false} />
//               <div className="p-3 py-3 mt-2 text-sm text-gray-500 rounded bg-gray-50">
//                 <p>Verification status is managed by our admin team. Once you submit your documents, we will review and update the status within 2-3 business days.</p>
//                 <button onClick={() => navigate("/company-authentication")} className="mt-2 font-medium text-blue-600 hover:text-blue-800">Submit Documents for Verification</button>
//               </div>
//             </div>
//           </CollapsibleSection>

//           {/* ===== ACCOUNT RECOVERY METHODS ===== */}
//           <div className="p-6 bg-white shadow-sm rounded-xl">
//             <h2 className="mb-4 text-xl font-semibold text-gray-900">Account Recovery Methods</h2>
//             <div className="space-y-4">
//               <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
//                 <div className="flex items-center gap-3">
//                   <div className={`w-3 h-3 rounded-full ${true ? "bg-green-500" : "bg-gray-400"}`}></div>
//                   <div>
//                     <p className="font-medium text-gray-800">Email Recovery</p>
//                     <p className="text-sm text-gray-500">{formValues.email || "No email set"}</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
//                 <div className="flex items-center gap-3">
//                   <div className={`w-3 h-3 rounded-full ${profile?.is_phone_verified ? "bg-green-500" : "bg-gray-400"}`}></div>
//                   <div>
//                     <p className="font-medium text-gray-800">Phone Recovery</p>
//                     <p className="text-sm text-gray-500">{formValues.phone || "No phone set"}</p>
//                   </div>
//                 </div>
//                 {!profile?.is_phone_verified && <button className="text-sm font-medium text-blue-600 hover:text-blue-800">Verify</button>}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </MainLayout>
//   );
// };

// export default CompanyProfileEdit;

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaCamera,
  FaChevronDown,
  FaChevronUp,
  FaCheckCircle,
} from "react-icons/fa";
import { Shield } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import dummyProfile3 from "../../assets/dummyProfile3.jpg";
import useUploadImageApi from "../../hooks/useUploadImageApi";
import { recruiterApi } from "../../api/recruiterApi";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { getImageUrl } from "../../../utils";
import { Loader2 } from "lucide-react";
import { updateUser } from "../../redux/feature/authSlice";
import CreatableSelect from "react-select/creatable";
import Select from "react-select";

// Updated to match FeedView UI colors
const VerificationBadge = ({ isVerified, onClick }) => {
  if (isVerified) return null;
  return (
    <div
      className="absolute cursor-pointer -top-1 -right-1 group"
      onClick={onClick}
      title="Account not fully verified. Complete email, phone, and GST verification."
      aria-label="Verification required"
    >
      <div className="flex items-center justify-center w-6 h-6 transition-colors bg-yellow-500 rounded-full shadow-lg group-hover:bg-yellow-600">
        <span className="text-xs font-bold text-white">!</span>
      </div>
      <div className="absolute right-0 z-10 w-48 px-3 py-2 mt-2 text-xs text-white whitespace-normal transition-opacity bg-gray-900 rounded opacity-0 pointer-events-none top-full group-hover:opacity-100">
        <p>Verification incomplete</p>
        <p className="mt-1">Email, phone, or GST not verified.</p>
        <p className="mt-1 text-blue-300 underline">Tap to verify</p>
      </div>
    </div>
  );
};

// Rebuilt to match FeedView CollapsibleSection exactly
const CollapsibleSection = ({
  title,
  weight,
  score,
  children,
  isExpanded,
  onToggle,
  showEditControls,
  onEditClick,
  onSaveClick,
  onCancelClick,
  isEditing,
}) => {
  const percentage = Math.min(100, Math.round((score / weight) * 100));
  const isComplete = percentage === 100;
  return (
    <div className="overflow-hidden bg-white shadow-sm rounded-xl border border-gray-100 mb-4 transition-all">
      <div
        className="flex items-center justify-between p-4 transition-colors cursor-pointer hover:bg-gray-50"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-extrabold text-[#1e1e2d]">{title}</h3>
          {isComplete && <FaCheckCircle className="text-[#1DB32F]" size={18} />}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 rounded-full bg-gray-100 overflow-hidden border border-gray-200/50">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${isComplete ? "bg-gradient-to-r from-[#1DB32F] to-[#00C950]" : "bg-gradient-to-r from-[#9bc87c] to-[#8ab76b]"}`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <span
              className={`text-sm font-extrabold ${isComplete ? "text-[#1DB32F]" : "text-[#9bc87c]"}`}
            >
              {percentage}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            {showEditControls &&
              (isEditing ? (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSaveClick();
                    }}
                    className="px-4 py-1 text-xs font-bold text-white bg-[#1DB32F] rounded-full hover:bg-[#189b27] transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onCancelClick();
                    }}
                    className="px-4 py-1 text-xs font-bold text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditClick();
                  }}
                  className="px-3 py-1 text-xs font-bold text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                >
                  Edit
                </button>
              ))}
            <button className="p-1 text-gray-400 transition-colors rounded hover:text-[#9bc87c]">
              {isExpanded ? (
                <FaChevronUp size={16} />
              ) : (
                <FaChevronDown size={16} />
              )}
            </button>
          </div>
        </div>
      </div>
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-2 bg-gray-50/30">
          {children}
        </div>
      )}
    </div>
  );
};

// Rebuilt to match FeedView FieldRow exactly
const FieldRow = ({
  label,
  value,
  isVerified = false,
  isEditable = false,
  editValue,
  onChange,
  type = "text",
  placeholder = "",
  rows = 1,
  children,
}) => {
  return (
    <div className="py-3 border-b border-gray-200 last:border-0">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-gray-700">{label}</span>
            {isVerified && (
              <FaCheckCircle className="text-[#1DB32F]" size={14} />
            )}
          </div>
          {isEditable ? (
            type === "custom" ? (
              <div className="w-full">{children}</div>
            ) : type === "textarea" ? (
              <textarea
                value={editValue || ""}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9bc87c]"
                rows={rows}
                placeholder={placeholder}
              />
            ) : type === "select" ? (
              <select
                value={editValue || ""}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9bc87c]"
              >
                {children}
              </select>
            ) : (
              <input
                type={type}
                value={editValue || ""}
                onChange={(e) => onChange(e.target.value)}
                className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9bc87c]"
                placeholder={placeholder}
              />
            )
          ) : (
            <p className="text-sm text-gray-600 whitespace-pre-wrap mt-1 leading-relaxed">
              {value || (
                <span className="text-gray-400 italic">Not provided</span>
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const CompanyProfileEdit = () => {
  const navigate = useNavigate();
  const loc = useLocation();
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    basic_info: false,
    company_info: false,
    verification: false,
  });
  const [editingSections, setEditingSections] = useState({});

  const [formValues, setFormValues] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    company_name: "",
    about: "",
    hiring_preferences: "",
    profile_pic: "",
    logo_url: "",
    gst_number: "",
    company_address: "",
    industry_id: null,
    company_location_id: null,
    designation_id: null,
    address_line_1: "",
    address_line_2: "",
    state: "",
    country: "",
    pincode: "",
  });

  const [uploading, setUploading] = useState({
    profilePic: false,
    logo: false,
  });
  const [profileCompletion, setProfileCompletion] = useState({
    basic_info: { weight: 25, score: 0 },
    company_info: { weight: 45, score: 0 },
    verification: { weight: 30, score: 0 },
  });
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const [industryOptions, setIndustryOptions] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [jobRoleOptions, setJobRoleOptions] = useState([]);
  const [industryLoading, setIndustryLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [jobRoleLoading, setJobRoleLoading] = useState(false);
  const { uploadImage } = useUploadImageApi();

  const fetchProfileCompletion = async () => {
    try {
      const response = await recruiterApi.getProfileCompletion(token, {
        detailed: true,
      });
      if (response.success && response.data.breakdown) {
        setProfileCompletion({
          basic_info: response.data.breakdown.basic_info || {
            weight: 25,
            score: 0,
          },
          company_info: response.data.breakdown.company_info || {
            weight: 45,
            score: 0,
          },
          verification: response.data.breakdown.verification || {
            weight: 30,
            score: 0,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching profile completion:", error);
    }
  };

  const getProfile = async ({ silent = false } = {}) => {
    try {
      if (!silent) setLoading(true);
      const response = await recruiterApi.getProfile(token);
      console.log("[CompanyProfileEdit] getProfile → raw recruiter payload:", response);
      console.log("[CompanyProfileEdit] getProfile → verification:", {
        is_email_verified: response?.is_email_verified,
        is_phone_verified: response?.is_phone_verified,
        is_gst_verified: response?.is_gst_verified,
        gst_number: response?.gst_number,
        mobile: response?.mobile,
      });
      setUserData(response);

      const initialValues = {
        first_name: response?.first_name || "",
        last_name: response?.last_name || "",
        email: response?.email || "",
        phone: response?.mobile || "",
        dob: response?.dob || "",
        gender: response?.gender || "",
        company_name: response?.company_name || "",
        about: response?.about || "",
        hiring_preferences: response?.hiring_preferences || "",
        profile_pic: response?.profile_picUrl || "",
        logo_url: response?.logo_url || "",
        gst_number: response?.gst_number || "",
        company_address: response?.company_address || "",
        industry_id: response?.industry_id || null,
        company_location_id: response?.company_location_id || null,
        designation_id: response?.designation_id || null,
        address_line_1: response?.address_line_1 || "",
        address_line_2: response?.address_line_2 || "",
        state: response?.state || "",
        country: response?.country || "",
        pincode: response?.pincode || "",
      };
      setFormValues(initialValues);

      // Keep Redux user in sync so other pages also see latest verification status
      dispatch(
        updateUser({
          is_email_verified: !!response?.is_email_verified,
          is_phone_verified: !!response?.is_phone_verified,
          is_gst_verified: !!response?.is_gst_verified,
        })
      );

      await fetchProfileCompletion();
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    const silent = !!userData;
    console.log("[CompanyProfileEdit] profile load trigger", {
      silent,
      locKey: loc.key,
      pathname: loc.pathname,
    });
    getProfile({ silent });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, loc.key]);

  // Refetch profile when user returns from /company-authentication tab
  // (covers SPA-internal navigation as well as actual tab switching)
  useEffect(() => {
    const refresh = () => {
      if (token && document.visibilityState === "visible") {
        console.log("[CompanyProfileEdit] tab visible → refetch profile");
        getProfile({ silent: true });
      }
    };
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const fetchIndustries = async (query) => {
    try {
      setIndustryLoading(true);
      const res = await axios.get(
        `${BASE_URL}/master/industries/search?search=${query}`,
      );
      setIndustryOptions(
        (res.data.data || []).map((i) => ({
          value: String(i.id),
          label: i.name,
        })),
      );
    } catch (error) {
      console.error("Industry search failed", error);
      setIndustryOptions([]);
    } finally {
      setIndustryLoading(false);
    }
  };

  const fetchLocations = async (query) => {
    try {
      setLocationLoading(true);
      const res = await axios.get(
        `${BASE_URL}/master/location/search?search=${query}`,
      );
      setLocationOptions(
        (res.data.data || []).map((l) => ({
          value: String(l.id),
          label: l.name,
        })),
      );
    } catch (error) {
      console.error("Location search failed", error);
      setLocationOptions([]);
    } finally {
      setLocationLoading(false);
    }
  };

  const fetchJobRoles = async (query) => {
    try {
      setJobRoleLoading(true);
      const res = await axios.get(
        `${BASE_URL}/master/job-roles/search?search=${query}`,
      );
      setJobRoleOptions(
        (res.data.data || []).map((j) => ({
          value: String(j.id),
          label: j.title,
        })),
      );
    } catch (error) {
      console.error("Job role search failed", error);
      setJobRoleOptions([]);
    } finally {
      setJobRoleLoading(false);
    }
  };

  const debouncedFetchIndustries = debounce(fetchIndustries, 300);
  const debouncedFetchLocations = debounce(fetchLocations, 300);
  const debouncedFetchJobRoles = debounce(fetchJobRoles, 300);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-[#9bc87c] animate-spin" />
            <p className="text-gray-600 font-medium">
              Loading company profile...
            </p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleEdit = (section) => {
    setEditingSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleSaveSection = async (section) => {
    try {
      const response = await recruiterApi.updateProfile(formValues, token);
      if (
        response.success ||
        response.message === "Company recruiter profile updated successfully"
      ) {
        const updatedProfile = response.profile;
        setUserData(updatedProfile);

        setFormValues({
          ...formValues,
          first_name: updatedProfile.first_name || "",
          last_name: updatedProfile.last_name || "",
          email: updatedProfile.email || "",
          phone: updatedProfile.mobile || "",
          dob: updatedProfile.dob || "",
          gender: updatedProfile.gender || "",
          company_name: updatedProfile.company_name || "",
          about: updatedProfile.about || "",
          hiring_preferences: updatedProfile.hiring_preferences || "",
          profile_pic: updatedProfile.profile_picUrl || "",
          logo_url: updatedProfile.logo_url || "",
          gst_number: updatedProfile.gst_number || "",
          company_address: updatedProfile.company_address || "",
          industry_id: updatedProfile.industry_id || null,
          company_location_id: updatedProfile.company_location_id || null,
          designation_id: updatedProfile.designation_id || null,
          address_line_1: updatedProfile.address_line_1 || "",
          address_line_2: updatedProfile.address_line_2 || "",
          state: updatedProfile.state || "",
          country: updatedProfile.country || "",
          pincode: updatedProfile.pincode || "",
        });

        dispatch(
          updateUser({
            user_profile_pic: updatedProfile.profile_picUrl,
            organization_logo: updatedProfile.logo_url,
            first_name: updatedProfile.first_name,
            last_name: updatedProfile.last_name,
            organization_name: updatedProfile.company_name,
            about: updatedProfile.about,
            is_email_verified: !!updatedProfile.is_email_verified,
            is_phone_verified: !!updatedProfile.is_phone_verified,
            is_gst_verified: !!updatedProfile.is_gst_verified,
          }),
        );

        await fetchProfileCompletion();
        toggleEdit(section);
      } else {
        alert(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(
        error.response?.data?.message ||
          "An error occurred while updating the profile",
      );
    }
  };

  const handleImageUpload = async (e, type = "profilePic") => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading((prev) => ({ ...prev, [type]: true }));
    const result = await uploadImage(file, type);
    const field = type === "profilePic" ? "profile_pic" : "logo_url";
    const updatedValues = { ...formValues, [field]: result };
    setFormValues(updatedValues);
    const response = await recruiterApi.updateProfile(updatedValues, token);
    if (
      response.success ||
      response.message === "Company recruiter profile updated successfully"
    ) {
      setUserData(response.profile);
      if (type === "profilePic") {
        dispatch(
          updateUser({ user_profile_pic: response.profile.profile_picUrl }),
        );
      } else {
        dispatch(updateUser({ organization_logo: response.profile.logo_url }));
      }
      await fetchProfileCompletion();
    } else {
      alert("Failed to update image.");
    }
    setUploading((prev) => ({ ...prev, [type]: false }));
  };

  // const handleChange = (field, value) => {
  //   setFormValues(prev => ({ ...prev, [field]: value }));
  // };

  // const profile = userData;

  const handleChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  /** Opens recruiter verification (phone / GST) — same destination as "Submit Documents" */
  const handleGoToVerification = (source = "unknown") => {
    console.log("[CompanyProfileEdit] Verification entry", {
      source,
      is_phone_verified: userData?.is_phone_verified,
      is_gst_verified: userData?.is_gst_verified,
      hasPhone: Boolean(formValues.phone?.trim()),
    });
    if (!formValues.phone?.trim()) {
      console.warn("[CompanyProfileEdit] Verify blocked: empty phone");
      alert(
        "Please add your phone number under Basic Info (Edit → Save), then use Verify again.",
      );
      return;
    }
    navigate("/company-authentication");
  };

  const profile = userData;

  // Verification flags: prefer fresh API response, fall back to Redux user (instant after verify)
  const emailVerified = Boolean(
    profile?.is_email_verified ?? user?.is_email_verified,
  );
  const phoneVerified = Boolean(
    profile?.is_phone_verified || user?.is_phone_verified
  );
  const gstVerified = Boolean(
    profile?.is_gst_verified || user?.is_gst_verified
  );

  const isFieldComplete = (value, isVerification = false) => {
    if (isVerification) return value === true;
    return value && String(value).trim() !== "";
  };

  const totalScore = Math.round(
    profileCompletion.basic_info.score +
      profileCompletion.company_info.score +
      profileCompletion.verification.score,
  );

  return (
    <MainLayout>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <section className="w-full px-4 py-6 mx-auto max-w-7xl">
          <div className="w-full mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 relative">
            {/* Exactly matching the FeedView Profile Header */}
            <div className="flex flex-col items-center p-6 bg-gradient-to-b from-white to-gray-50 border-b border-gray-200 rounded-t-2xl">
              <div className="relative group">
                <div className="w-20 h-20 overflow-hidden transition-shadow border-4 border-white rounded-full shadow-md sm:w-24 sm:h-24 hover:shadow-lg">
                  <img
                    src={
                      formValues.logo_url
                        ? formValues.logo_url.startsWith("http")
                          ? formValues.logo_url
                          : getImageUrl(formValues.logo_url)
                        : dummyProfile3
                    }
                    alt="Company logo"
                    className="object-cover w-full h-full"
                  />
                </div>
                <label
                  className="absolute w-7 h-7 p-1.5 text-white bg-[#9bc87c] transition-opacity rounded-full shadow-md opacity-0 cursor-pointer group-hover:opacity-100 border-2 border-white hover:bg-[#8ab76b] flex justify-center items-center"
                  style={{ bottom: "2px", right: "2px" }}
                  title="Change logo"
                >
                  <FaCamera size={14} />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, "logo")}
                    className="hidden"
                    disabled={uploading.logo}
                  />
                </label>
                {/* <VerificationBadge
                  isVerified={true && profile?.is_phone_verified && profile?.is_gst_verified}
                /> */}

                <VerificationBadge
                  isVerified={emailVerified && phoneVerified && gstVerified}
                  onClick={() => handleGoToVerification("header_badge")}
                />
              </div>

              <h1 className="mt-4 text-xl font-extrabold text-center text-[#1e1e2d] sm:text-2xl">
                {formValues.company_name || "Your Company"}
              </h1>

              {/* FeedView-style Completion Bar */}
              {profileCompletion && (
                <div className="w-full max-w-2xl pt-4 mt-6 border-t border-gray-200/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-extrabold text-[#1e1e2d]">
                      Profile Completion
                    </span>
                    <span className="text-sm font-extrabold text-[#9bc87c]">
                      {totalScore}%
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${totalScore === 100 ? "bg-gradient-to-r from-[#1DB32F] to-[#00C950]" : "bg-gradient-to-r from-[#9bc87c] to-[#8ab76b]"}`}
                      style={{ width: `${totalScore}%` }}
                    />
                  </div>
                  {totalScore < 100 ? (
                    <p className="flex items-center gap-2 mt-2 text-xs font-semibold text-gray-500">
                      <span className="inline-block w-1.5 h-1.5 bg-[#9bc87c] rounded-full"></span>
                      Complete your profile to stand out!
                    </p>
                  ) : (
                    <p className="flex items-center gap-1.5 mt-2 text-xs font-bold text-[#1DB32F]">
                      <FaCheckCircle size={12} /> Profile complete! 🎉
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {/* ===== SECTION 1: BASIC INFO ===== */}
              <CollapsibleSection
                title="Basic Info"
                weight={profileCompletion.basic_info?.weight || 25}
                score={profileCompletion.basic_info?.score || 0}
                isExpanded={expandedSections.basic_info}
                onToggle={() => toggleSection("basic_info")}
                showEditControls={true}
                isEditing={editingSections.basic_info}
                onEditClick={() => toggleEdit("basic_info")}
                onSaveClick={() => handleSaveSection("basic_info")}
                onCancelClick={() => toggleEdit("basic_info")}
              >
                <div className="space-y-1">
                  <FieldRow
                    label="First Name"
                    value={formValues.first_name}
                    isVerified={isFieldComplete(formValues.first_name)}
                    isEditable={editingSections.basic_info}
                    editValue={formValues.first_name}
                    onChange={(val) => handleChange("first_name", val)}
                    placeholder="Enter first name"
                  />
                  <FieldRow
                    label="Last Name"
                    value={formValues.last_name}
                    isVerified={isFieldComplete(formValues.last_name)}
                    isEditable={editingSections.basic_info}
                    editValue={formValues.last_name}
                    onChange={(val) => handleChange("last_name", val)}
                    placeholder="Enter last name"
                  />
                  <FieldRow
                    label="Email"
                    value={formValues.email}
                    isVerified={emailVerified}
                    isEditable={editingSections.basic_info}
                    editValue={formValues.email}
                    onChange={(val) => handleChange("email", val)}
                    type="email"
                    placeholder="Enter email"
                  />
                  <FieldRow
                    label="Phone"
                    value={formValues.phone}
                    isVerified={isFieldComplete(formValues.phone)}
                    isEditable={editingSections.basic_info}
                    editValue={formValues.phone}
                    onChange={(val) => handleChange("phone", val)}
                    placeholder="Enter phone number"
                  />
                  <FieldRow
                    label="Date of Birth"
                    value={formValues.dob}
                    isVerified={isFieldComplete(formValues.dob)}
                    isEditable={editingSections.basic_info}
                    editValue={formValues.dob}
                    onChange={(val) => handleChange("dob", val)}
                    type="date"
                  />
                  <FieldRow
                    label="Gender"
                    value={
                      formValues.gender
                        ? formValues.gender.charAt(0).toUpperCase() +
                          formValues.gender.slice(1)
                        : ""
                    }
                    isVerified={isFieldComplete(formValues.gender)}
                    isEditable={editingSections.basic_info}
                    editValue={formValues.gender}
                    onChange={(val) => handleChange("gender", val)}
                    type="select"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </FieldRow>
                  <FieldRow
                    label="Designation"
                    value={profile?.designation_name || "Not set"}
                    isVerified={formValues.designation_id != null}
                    isEditable={editingSections.basic_info}
                    type="custom"
                  >
                    <CreatableSelect
                      value={
                        formValues.designation_id != null
                          ? {
                              value: String(formValues.designation_id),
                              label: String(
                                jobRoleOptions.find(
                                  (o) =>
                                    o.value ===
                                    String(formValues.designation_id),
                                )?.label ||
                                  profile?.designation_name ||
                                  "",
                              ),
                            }
                          : null
                      }
                      onInputChange={(val) =>
                        val.length >= 3 && debouncedFetchJobRoles(val)
                      }
                      options={jobRoleOptions}
                      isLoading={jobRoleLoading}
                      filterOption={null}
                      isClearable
                      isSearchable
                      className="text-sm"
                      placeholder="Type min 3 chars to search or create"
                      noOptionsMessage={({ inputValue }) => {
                        if (!inputValue) return "Start typing...";
                        if (inputValue.length < 3)
                          return "Type min 3 chars to search, or Enter to create new";
                        return `No matches found. Press Enter to create "${inputValue}"`;
                      }}
                      formatCreateLabel={(inputValue) =>
                        `+ Create: "${inputValue}"`
                      }
                      onChange={(opt) =>
                        handleChange(
                          "designation_id",
                          opt ? parseInt(opt.value) : null,
                        )
                      }
                    />
                  </FieldRow>
                  <div className="py-3 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-700">
                          Profile Picture
                        </span>
                        {isFieldComplete(formValues.profile_pic) && (
                          <FaCheckCircle className="text-[#1DB32F]" size={14} />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="relative group">
                        <img
                          alt="Profile"
                          src={
                            getImageUrl(formValues.profile_pic) ||
                            getImageUrl(profile?.profile_picUrl) ||
                            dummyProfile3
                          }
                          className="object-cover w-16 h-16 border-2 border-white rounded-full shadow-sm"
                        />
                        {editingSections.basic_info && (
                          <label className="absolute bottom-0 right-0 bg-[#9bc87c] text-white p-1.5 rounded-full text-xs cursor-pointer hover:bg-[#8ab76b]">
                            <FaCamera />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleImageUpload(e, "profilePic")
                              }
                              className="hidden"
                              disabled={uploading.profilePic}
                            />
                          </label>
                        )}
                      </div>
                      {!editingSections.basic_info && (
                        <span className="text-sm text-gray-500">
                          {formValues.profile_pic
                            ? "Profile picture set"
                            : "No profile picture"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              {/* ===== SECTION 2: COMPANY INFO ===== */}
              <CollapsibleSection
                title="Company Info"
                weight={profileCompletion.company_info?.weight || 45}
                score={profileCompletion.company_info?.score || 0}
                isExpanded={expandedSections.company_info}
                onToggle={() => toggleSection("company_info")}
                showEditControls={true}
                isEditing={editingSections.company_info}
                onEditClick={() => toggleEdit("company_info")}
                onSaveClick={() => handleSaveSection("company_info")}
                onCancelClick={() => toggleEdit("company_info")}
              >
                <div className="space-y-1">
                  <FieldRow
                    label="Company Name"
                    value={formValues.company_name}
                    isVerified={isFieldComplete(formValues.company_name)}
                    isEditable={editingSections.company_info}
                    editValue={formValues.company_name}
                    onChange={(val) => handleChange("company_name", val)}
                    placeholder="Enter company name"
                  />
                  <FieldRow
                    label="About"
                    value={formValues.about}
                    isVerified={isFieldComplete(formValues.about)}
                    isEditable={editingSections.company_info}
                    editValue={formValues.about}
                    onChange={(val) => handleChange("about", val)}
                    type="textarea"
                    rows={4}
                    placeholder="Describe your company..."
                  >
                    <div className="flex justify-between mt-1 text-xs text-gray-500">
                      <span>
                        {(formValues.about || "").length}/1000 characters
                      </span>
                      {(formValues.about || "").length > 900 && (
                        <span className="font-medium text-orange-600">
                          {1000 - (formValues.about || "").length} left
                        </span>
                      )}
                    </div>
                  </FieldRow>
                  <FieldRow
                    label="Address Line 1"
                    value={formValues.address_line_1}
                    isVerified={isFieldComplete(formValues.address_line_1)}
                    isEditable={editingSections.company_info}
                    editValue={formValues.address_line_1}
                    onChange={(val) => handleChange("address_line_1", val)}
                    placeholder="Street, Building, Area"
                  />
                  <FieldRow
                    label="Address Line 2 (Optional)"
                    value={formValues.address_line_2}
                    isVerified={isFieldComplete(formValues.address_line_2)}
                    isEditable={editingSections.company_info}
                    editValue={formValues.address_line_2}
                    onChange={(val) => handleChange("address_line_2", val)}
                    placeholder="Landmark, Locality, Sector"
                  />
                  <FieldRow
                    label="City"
                    value={profile?.location_name || "Not set"}
                    isVerified={formValues.company_location_id != null}
                    isEditable={editingSections.company_info}
                    type="custom"
                  >
                    <Select
                      value={
                        formValues.company_location_id != null
                          ? {
                              value: String(formValues.company_location_id),
                              label: String(
                                locationOptions.find(
                                  (o) =>
                                    o.value ===
                                    String(formValues.company_location_id),
                                )?.label ||
                                  profile?.location_name ||
                                  "",
                              ),
                            }
                          : null
                      }
                      onInputChange={(val) =>
                        val.length >= 3 && debouncedFetchLocations(val)
                      }
                      options={locationOptions}
                      isLoading={locationLoading}
                      filterOption={null}
                      isClearable
                      isSearchable
                      className="text-sm"
                      placeholder="Type min 3 chars to search city"
                      noOptionsMessage={({ inputValue }) => {
                        if (!inputValue) return "Start typing city name...";
                        if (inputValue.length < 3)
                          return "Type min 3 chars to search";
                        return "No cities found";
                      }}
                      onChange={(opt) =>
                        handleChange(
                          "company_location_id",
                          opt ? parseInt(opt.value) : null,
                        )
                      }
                    />
                  </FieldRow>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 py-2">
                    <FieldRow
                      label="State"
                      value={formValues.state}
                      isVerified={isFieldComplete(formValues.state)}
                      isEditable={editingSections.company_info}
                      editValue={formValues.state}
                      onChange={(val) => handleChange("state", val)}
                      placeholder="State"
                    />
                    <FieldRow
                      label="Country"
                      value={formValues.country}
                      isVerified={isFieldComplete(formValues.country)}
                      isEditable={editingSections.company_info}
                      editValue={formValues.country}
                      onChange={(val) => handleChange("country", val)}
                      placeholder="Country"
                    />
                    <FieldRow
                      label="Pincode"
                      value={formValues.pincode}
                      isVerified={isFieldComplete(formValues.pincode)}
                      isEditable={editingSections.company_info}
                      editValue={formValues.pincode}
                      onChange={(val) => handleChange("pincode", val)}
                      placeholder="Pincode"
                    />
                  </div>
                  <FieldRow
                    label="GST Number"
                    value={formValues.gst_number}
                    isVerified={isFieldComplete(formValues.gst_number)}
                    isEditable={editingSections.company_info}
                    editValue={formValues.gst_number}
                    onChange={(val) => handleChange("gst_number", val)}
                    placeholder="Enter GST number"
                  />
                  <FieldRow
                    label="Category"
                    value={profile?.industry_name || "Not set"}
                    isVerified={formValues.industry_id != null}
                    isEditable={editingSections.company_info}
                    type="custom"
                  >
                    <CreatableSelect
                      value={
                        formValues.industry_id != null
                          ? {
                              value: String(formValues.industry_id),
                              label: String(
                                industryOptions.find(
                                  (o) =>
                                    o.value === String(formValues.industry_id),
                                )?.label ||
                                  profile?.industry_name ||
                                  "",
                              ),
                            }
                          : null
                      }
                      onInputChange={(val) =>
                        val.length >= 3 && debouncedFetchIndustries(val)
                      }
                      options={industryOptions}
                      isLoading={industryLoading}
                      filterOption={null}
                      isClearable
                      isSearchable
                      className="text-sm"
                      placeholder="Type min 3 chars to search or create"
                      noOptionsMessage={({ inputValue }) => {
                        if (!inputValue)
                          return "Type min 3 characters to search...";
                        if (inputValue.length < 3)
                          return "Type min 3 chars to search, or Enter to create new";
                        return `No matches found. Press Enter to create "${inputValue}"`;
                      }}
                      formatCreateLabel={(inputValue) =>
                        `+ Create: "${inputValue}"`
                      }
                      onChange={(opt) =>
                        handleChange(
                          "industry_id",
                          opt ? parseInt(opt.value) : null,
                        )
                      }
                    />
                  </FieldRow>
                  <div className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-700">
                        Company Logo
                      </span>
                      {isFieldComplete(formValues.logo_url) && (
                        <FaCheckCircle className="text-[#1DB32F]" size={14} />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      {formValues.logo_url
                        ? "Logo uploaded (visible at top)"
                        : "No logo uploaded"}
                    </p>
                  </div>
                </div>
              </CollapsibleSection>

              {/* ===== SECTION 3: VERIFICATION ===== */}
              <CollapsibleSection
                title="Verification"
                weight={profileCompletion.verification?.weight || 30}
                score={profileCompletion.verification?.score || 0}
                isExpanded={expandedSections.verification}
                onToggle={() => toggleSection("verification")}
                showEditControls={false}
              >
                <div className="space-y-1">
                  <FieldRow
                    label="Email Verification"
                    value={emailVerified ? "Verified" : "Not Verified"}
                    isVerified={emailVerified}
                    isEditable={false}
                  />
                  <FieldRow
                    label="Phone Verification"
                    value={phoneVerified ? "Verified" : "Not Verified"}
                    isVerified={phoneVerified}
                    isEditable={false}
                  />
                  <FieldRow
                    label="GST Verification"
                    value={gstVerified ? "Verified" : "Not Verified"}
                    isVerified={gstVerified}
                    isEditable={false}
                  />

                  {(!emailVerified || !phoneVerified || !gstVerified) && (
                    <div className="p-4 mt-4 text-sm bg-blue-50/50 border border-blue-100 rounded-xl">
                      <div className="flex gap-3">
                        <Shield className="text-[#9bc87c] shrink-0" size={20} />
                        <div>
                          <p className="font-semibold text-[#1e1e2d]">
                            Complete your verification
                          </p>
                          <p className="text-gray-500 mt-1">
                            Verification status is managed by our admin team.
                            Once you submit your documents, we will review and
                            update the status within 2-3 business days.
                          </p>
                          {/* <button onClick={() => navigate("/company-authentication")} className="mt-3 text-xs font-extrabold text-[#9bc87c] hover:text-[#8ab76b] transition">Submit Documents →</button> */}
                          <button
                            type="button"
                            onClick={() =>
                              handleGoToVerification("submit_documents")
                            }
                            className="mt-3 text-xs font-extrabold text-[#9bc87c] hover:text-[#8ab76b] transition"
                          >
                            Submit Documents →
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleSection>

              {/* ===== ACCOUNT RECOVERY METHODS ===== */}
              <div className="overflow-hidden bg-white shadow-sm rounded-xl border border-gray-100 mb-4 p-4 sm:p-6 transition-all">
                <h2 className="mb-4 text-lg font-extrabold text-[#1e1e2d]">
                  Account Recovery Methods
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${emailVerified ? "bg-[#1DB32F]" : "bg-gray-400"}`}
                      ></div>
                      <div>
                        <p className="text-sm font-bold text-gray-700">
                          Email Recovery
                        </p>
                        <p className="text-sm text-gray-500">
                          {formValues.email || "No email set"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${phoneVerified ? "bg-[#1DB32F]" : "bg-gray-400"}`}
                      ></div>
                      <div>
                        <p className="text-sm font-bold text-gray-700">
                          Phone Recovery
                        </p>
                        <p className="text-sm text-gray-500">
                          {formValues.phone || "No phone set"}
                        </p>
                      </div>
                    </div>

                    {!phoneVerified && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGoToVerification("phone_recovery_verify");
                        }}
                        className="text-sm font-extrabold text-[#9bc87c] hover:text-[#8ab76b] transition"
                      >
                        Verify
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default CompanyProfileEdit;
