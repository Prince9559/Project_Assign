import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaCamera, FaChevronDown, FaChevronUp, FaCheckCircle, FaRegCircle } from "react-icons/fa";
import MainLayout from "../../components/layout/MainLayout";
import FeedRightSidebar from "../student/feed/FeedRightSidebar";
import dummyProfile3 from "../../assets/dummyProfile3.jpg";
import useUploadImageApi from "../../hooks/useUploadImageApi";
import { recruiterApi } from "../../api/recruiterApi";
import { useSelector, useDispatch } from "react-redux";
import axios from 'axios';
import { getImageUrl } from "../../../utils";
import { Loader2 } from 'lucide-react';
import { updateUser } from "../../redux/feature/authSlice";

import CreatableSelect from 'react-select/creatable';
import Select from 'react-select';

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

const CollapsibleSection = ({ title, weight, score, children, isExpanded, onToggle, showEditControls, onEditClick, onSaveClick, onCancelClick, isEditing }) => {
    const percentage = Math.min(100, Math.round((score / weight) * 100));
    const isComplete = percentage === 100;

    return (
        <div className="overflow-hidden bg-white shadow-sm rounded-xl">
            <div
                className="flex items-center justify-between p-4 transition-colors cursor-pointer hover:bg-gray-50"
                onClick={onToggle}
            >
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    {isComplete && <FaCheckCircle className="text-green-500" size={18} />}
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className={`w-24 h-2 rounded-full ${isComplete ? 'bg-green-200' : 'bg-yellow-200'}`}>
                            <div
                                className={`h-full rounded-full transition-all ${isComplete ? 'bg-green-500' : 'bg-yellow-500'}`}
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <span className={`text-sm font-medium ${isComplete ? 'text-green-600' : 'text-yellow-600'}`}>
                            {percentage}%
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {showEditControls && (
                            isEditing ? (
                                <>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onSaveClick(); }}
                                        className="text-sm font-medium text-green-600 hover:text-green-800"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onCancelClick(); }}
                                        className="text-sm font-medium text-gray-500 hover:text-gray-700"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEditClick(); }}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                                >
                                    Edit
                                </button>
                            )
                        )}
                        <button className="p-1 transition-colors rounded hover:bg-gray-200">
                            {isExpanded ? <FaChevronUp size={16} /> : <FaChevronDown size={16} />}
                        </button>
                    </div>
                </div>
            </div>

            {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-400">
                    {children}
                </div>
            )}
        </div>
    );
};

const FieldRow = ({ label, value, isVerified = false, isEditable = false, editValue, onChange, type = "text", placeholder = "", rows = 1, children }) => {
    return (
        <div className="py-3 border-b border-gray-400 last:border-0">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-700">{label}</span>
                        {isVerified && <FaCheckCircle className="text-green-500" size={14} />}
                    </div>

                    {isEditable ? (
                        type === "textarea" ? (
                            <textarea
                                value={editValue || ""}
                                onChange={(e) => onChange(e.target.value)}
                                className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={rows}
                                placeholder={placeholder}
                            />
                        ) : type === "select" ? (
                            <select
                                value={editValue || ""}
                                onChange={(e) => onChange(e.target.value)}
                                className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {children}
                            </select>
                        ) : (
                            <input
                                type={type}
                                value={editValue || ""}
                                onChange={(e) => onChange(e.target.value)}
                                className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder={placeholder}
                            />
                        )
                    ) : (
                        <p className="text-sm text-gray-600 whitespace-pre-wrap">
                            {value || <span className="text-gray-400">Not provided</span>}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const CompanyProfileEdit = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { token } = useSelector((state) => state.auth);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedSections, setExpandedSections] = useState({
        basic_info: true,
        company_info: true,
        verification: true
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
    });
    const [uploading, setUploading] = useState({
        profilePic: false,
        logo: false
    });
    const [profileCompletion, setProfileCompletion] = useState({
        basic_info: { weight: 25, score: 0 },
        company_info: { weight: 45, score: 0 },
        verification: { weight: 30, score: 0 }
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
            const response = await recruiterApi.getProfileCompletion(token, { detailed: true });
            if (response.success && response.data.breakdown) {
                setProfileCompletion({
                    basic_info: response.data.breakdown.basic_info || { weight: 25, score: 0 },
                    company_info: response.data.breakdown.company_info || { weight: 45, score: 0 },
                    verification: response.data.breakdown.verification || { weight: 30, score: 0 }
                });
            }
        } catch (error) {
            console.error('Error fetching profile completion:', error);
        }
    };

    useEffect(() => {
        const getProfile = async () => {
            try {
                setLoading(true);
                const response = await recruiterApi.getProfile(token);
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
                };
                setFormValues(initialValues);

                // Fetch profile completion data
                await fetchProfileCompletion();
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };
        if (token) {
            getProfile();
        }
    }, [token]);



    // Debounce helper
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    // Fetch Functions
    const fetchIndustries = async (query) => {
        try {
            setIndustryLoading(true);
            const res = await axios.get(`${BASE_URL}/master/industries/search?search=${query}`);
            setIndustryOptions((res.data.data || []).map(i => ({ value: String(i.id), label: i.name })));
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
            const res = await axios.get(`${BASE_URL}/master/location/search?search=${query}`);
            setLocationOptions((res.data.data || []).map(l => ({ value: String(l.id), label: l.name })));
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
            const res = await axios.get(`${BASE_URL}/master/job-roles/search?search=${query}`);
            setJobRoleOptions((res.data.data || []).map(j => ({ value: String(j.id), label: j.title })));
        } catch (error) {
            console.error("Job role search failed", error);
            setJobRoleOptions([]);
        } finally {
            setJobRoleLoading(false);
        }
    };

    // Debounced versions
    const debouncedFetchIndustries = debounce(fetchIndustries, 300);
    const debouncedFetchLocations = debounce(fetchLocations, 300);
    const debouncedFetchJobRoles = debounce(fetchJobRoles, 300);



    if (loading) {
        return (
            <MainLayout>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                        <p className="text-gray-600">Loading company profile...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const toggleEdit = (section) => {
        setEditingSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleSaveSection = async (section) => {
        try {
            const response = await recruiterApi.updateProfile(formValues, token);
            if (response.success || response.message === "Company recruiter profile updated successfully") {
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
                });

                dispatch(updateUser({
                    user_profile_pic: updatedProfile.profile_picUrl,
                    organization_logo: updatedProfile.logo_url,
                    first_name: updatedProfile.first_name,
                    last_name: updatedProfile.last_name,
                    organization_name: updatedProfile.company_name,
                    about: updatedProfile.about,
                }));

                // Refresh profile completion data
                await fetchProfileCompletion();

                alert('Profile updated successfully!');
                toggleEdit(section);
            } else {
                alert(response.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert(error.response?.data?.message || 'An error occurred while updating the profile');
        }
    };

    const handleImageUpload = async (e, type = 'profilePic') => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(prev => ({ ...prev, [type]: true }));
        const result = await uploadImage(file, type);

        const field = type === 'profilePic' ? 'profile_pic' : 'logo_url';
        const updatedValues = { ...formValues, [field]: result };
        setFormValues(updatedValues);

        const response = await recruiterApi.updateProfile(updatedValues, token);
        if (response.success || response.message === "Company recruiter profile updated successfully") {
            setUserData(response.profile);
            if (type === 'profilePic') {
                dispatch(updateUser({ user_profile_pic: response.profile.profile_picUrl }));
            } else {
                dispatch(updateUser({ organization_logo: response.profile.logo_url }));
            }
            alert(type === 'profilePic' ? 'Profile picture updated!' : 'Logo updated!');

            // Refresh profile completion data
            await fetchProfileCompletion();
        } else {
            alert('Failed to update image.');
        }
        setUploading(prev => ({ ...prev, [type]: false }));
    };

    const handleChange = (field, value) => {
        setFormValues(prev => ({ ...prev, [field]: value }));
    };

    const profile = userData;

    // Calculate section completion status
    const getSectionStatus = (sectionKey) => {
        const section = profileCompletion[sectionKey];
        if (!section) return { percentage: 0, isComplete: false };
        const percentage = Math.min(100, Math.round((section.score / section.weight) * 100));
        return { percentage, isComplete: percentage === 100 };
    };

    // Helper to check if a field is complete for visual indicator
    const isFieldComplete = (value, isVerification = false) => {
        if (isVerification) return value === true;
        return value && String(value).trim() !== "";
    };

    return (
        <MainLayout>
            <div className="flex flex-col w-full gap-6 p-4 mx-auto lg:flex-row max-w-7xl">
                <div className="w-full space-y-6">
                    {/* Logo Header - Always visible at top */}
                    <div className="flex flex-col items-center justify-center p-8 bg-white shadow-sm rounded-xl">
                        <div className="relative mb-4 group">
                            {formValues.logo_url ? (
                                <img
                                    src={formValues.logo_url.startsWith('http') ? formValues.logo_url : getImageUrl(formValues.logo_url)}
                                    alt="Company logo"
                                    className="object-contain w-24 h-24 border-2 border-gray-200 rounded-lg shadow-sm"
                                />
                            ) : (
                                <div className="flex items-center justify-center w-24 h-24 bg-gray-100 border-2 border-gray-300 border-dashed rounded-lg">
                                    <span className="text-sm text-gray-500">No logo</span>
                                </div>
                            )}
                            <label className="absolute p-2 text-white transition-colors bg-blue-600 rounded-full shadow-md cursor-pointer -bottom-2 -right-2 hover:bg-blue-700">
                                <FaCamera size={14} />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleImageUpload(e, 'logo')}
                                    className="hidden"
                                    disabled={uploading.logo}
                                />
                            </label>
                            <VerificationBadge
                                isVerified={
                                    profile?.is_email_verified &&
                                    profile?.is_phone_verified &&
                                    profile?.is_gst_verified
                                }
                            />
                        </div>
                        <h1 className="text-2xl font-bold text-center text-gray-900">
                            {formValues.company_name || "Your Company"}
                        </h1>
                        {profileCompletion && (
                            <div className="mt-2 text-sm text-gray-500">
                                Overall Completion: {Math.round(profileCompletion.basic_info.score + profileCompletion.company_info.score + profileCompletion.verification.score)}%
                            </div>
                        )}
                    </div>

                    {/* ===== SECTION 1: BASIC INFO (25%) ===== */}
                    <CollapsibleSection
                        title="Basic Info"
                        weight={profileCompletion.basic_info?.weight || 25}
                        score={profileCompletion.basic_info?.score || 0}
                        isExpanded={expandedSections.basic_info}
                        onToggle={() => toggleSection('basic_info')}
                        showEditControls={true}
                        isEditing={editingSections.basic_info}
                        onEditClick={() => toggleEdit('basic_info')}
                        onSaveClick={() => handleSaveSection('basic_info')}
                        onCancelClick={() => toggleEdit('basic_info')}
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
                                isVerified={isFieldComplete(formValues.email)}
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

                            {/* Personal details - optional but kept */}
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
                                value={formValues.gender ? formValues.gender.charAt(0).toUpperCase() + formValues.gender.slice(1) : ""}
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

                            {/* Profile Picture (Personal DP) */}
                            <div className="py-3 border-b border-gray-100">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-700">Profile Picture</span>
                                        {isFieldComplete(formValues.profile_pic) && <FaCheckCircle className="text-green-500" size={14} />}
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
                                            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full text-xs cursor-pointer hover:bg-blue-700">
                                                <FaCamera />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, 'profilePic')}
                                                    className="hidden"
                                                    disabled={uploading.profilePic}
                                                />
                                            </label>
                                        )}
                                    </div>
                                    {!editingSections.basic_info && (
                                        <span className="text-sm text-gray-500">
                                            {formValues.profile_pic ? "Profile picture set" : "No profile picture"}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CollapsibleSection>

                    {/* ===== SECTION 2: COMPANY INFO (45%) ===== */}
                    <CollapsibleSection
                        title="Company Info"
                        weight={profileCompletion.company_info?.weight || 45}
                        score={profileCompletion.company_info?.score || 0}
                        isExpanded={expandedSections.company_info}
                        onToggle={() => toggleSection('company_info')}
                        showEditControls={true}
                        isEditing={editingSections.company_info}
                        onEditClick={() => toggleEdit('company_info')}
                        onSaveClick={() => handleSaveSection('company_info')}
                        onCancelClick={() => toggleEdit('company_info')}
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
                                    <span>{(formValues.about || "").length}/1000 characters</span>
                                    {(formValues.about || "").length > 900 && (
                                        <span className="font-medium text-orange-600">
                                            {1000 - (formValues.about || "").length} left
                                        </span>
                                    )}
                                </div>
                            </FieldRow>
                            <FieldRow
                                label="Company Address"
                                value={formValues.company_address}
                                isVerified={isFieldComplete(formValues.company_address)}
                                isEditable={editingSections.company_info}
                                editValue={formValues.company_address}
                                onChange={(val) => handleChange("company_address", val)}
                                type="textarea"
                                rows={2}
                                placeholder="Enter company address"
                            />
                            <FieldRow
                                label="GST Number"
                                value={formValues.gst_number}
                                isVerified={isFieldComplete(formValues.gst_number)}
                                isEditable={editingSections.company_info}
                                editValue={formValues.gst_number}
                                onChange={(val) => handleChange("gst_number", val)}
                                placeholder="Enter GST number"
                            />

                           




                            {/* Industry - View Mode */}
                            {!editingSections.company_info ? (
                                <p className="text-sm text-gray-600">
                                    {profile?.industry_name || "Not set"}
                                </p>
                            ) : (
                                
                                < CreatableSelect
                                    value={
                                formValues.industry_id
                                    ? {
                                        value: String(formValues.industry_id),
                                        label:
                                            industryOptions.find((o) => o.value === String(formValues.industry_id))?.label ||
                                            profile?.industry_name ||
                                            "",
                                    }
                                    : null
                            }
                            onInputChange={(val) => val.length >= 3 && debouncedFetchIndustries(val)}
                            options={industryOptions}
                            isLoading={industryLoading}
                            filterOption={null}
                            isClearable
                            isSearchable
                            className="text-sm"
                            placeholder="Type min 3 chars to search or create"
                            noOptionsMessage={({ inputValue }) => {
                                if (!inputValue) return "Type min 3 characters to search...";
                                if (inputValue.length < 3) return "Type min 3 chars to search, or Enter to create new";
                                return `No matches found. Press Enter to create "${inputValue}"`;
                            }}
                            formatCreateLabel={(inputValue) => `+ Create: "${inputValue}"`}
                            onChange={(opt) => handleChange("industry_id", opt ? parseInt(opt.value) : null)}
                                />
                            )}



                            {/* Location - View Mode */}
                            {!editingSections.company_info ? (
                                <p className="text-sm text-gray-600">
                                    {profile?.location_name || "Not set"}
                                </p>
                            ) : (

                                <Select
                                    value={
                                        formValues.company_location_id
                                            ? {
                                                value: String(formValues.company_location_id),
                                                label:
                                                    locationOptions.find((o) => o.value === String(formValues.company_location_id))?.label ||
                                                    profile?.location_name ||
                                                    "",
                                            }
                                            : null
                                    }
                                    onInputChange={(val) => val.length >= 3 && debouncedFetchLocations(val)}
                                    options={locationOptions}
                                    isLoading={locationLoading}
                                    filterOption={null}
                                    isClearable
                                    isSearchable
                                    className="text-sm"
                                    placeholder="Type min 3 chars to search city"
                                    noOptionsMessage={({ inputValue }) => {
                                        if (!inputValue) return "Start typing city name...";
                                        if (inputValue.length < 3) return "Type min 3 chars to search";
                                        return "No cities found";
                                    }}
                                    onChange={(opt) => handleChange("company_location_id", opt ? parseInt(opt.value) : null)}
                                />
                            )}

                            {/* Designation - View Mode */}
                            {!editingSections.company_info ? (
                                <p className="text-sm text-gray-600">
                                    {profile?.designation_name || "Not set"}
                                </p>
                            ) : (
                                < CreatableSelect
                                value={
                                formValues.designation_id
                                    ? {
                                        value: String(formValues.designation_id),
                                        label:
                                            jobRoleOptions.find((o) => o.value === String(formValues.designation_id))?.label ||
                                            profile?.designation_name ||
                                            "",
                                    }
                                    : null
                            }
                            onInputChange={(val) => val.length >= 3 && debouncedFetchJobRoles(val)}
                            options={jobRoleOptions}
                            isLoading={jobRoleLoading}
                            filterOption={null}
                            isClearable
                            isSearchable
                            className="text-sm"
                            placeholder="Type min 3 chars to search or create"
                            noOptionsMessage={({ inputValue }) => {
                                if (!inputValue) return "Start typing...";
                                if (inputValue.length < 3) return "Type min 3 chars to search, or Enter to create new";
                                return `No matches found. Press Enter to create "${inputValue}"`;
                            }}
                            formatCreateLabel={(inputValue) => `+ Create: "${inputValue}"`}
                            onChange={(opt) => handleChange("designation_id", opt ? parseInt(opt.value) : null)}
                            />
                            )}



                            {/* Hiring Preferences - hidden as requested */}
                            {/* <FieldRow
                                label="Hiring Preferences"
                                value={formValues.hiring_preferences}
                                isVerified={isFieldComplete(formValues.hiring_preferences)}
                                isEditable={editingSections.company_info}
                                editValue={formValues.hiring_preferences}
                                onChange={(val) => handleChange("hiring_preferences", val)}
                                type="textarea"
                                rows={2}
                                placeholder="Describe your hiring preferences..."
                                
                            /> */}


                            {/* Logo URL field reference (logo is at top, but show status here) */}
                            <div className="py-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-gray-700">Company Logo</span>
                                    {isFieldComplete(formValues.logo_url) && <FaCheckCircle className="text-green-500" size={14} />}
                                </div>
                                <p className="mt-1 text-sm text-gray-500">
                                    {formValues.logo_url ? "Logo uploaded (visible at top)" : "No logo uploaded"}
                                </p>
                            </div>
                        </div>
                    </CollapsibleSection>

                    {/* ===== SECTION 3: VERIFICATION (30%) ===== */}
                    <CollapsibleSection
                        title="Verification"
                        weight={profileCompletion.verification?.weight || 30}
                        score={profileCompletion.verification?.score || 0}
                        isExpanded={expandedSections.verification}
                        onToggle={() => toggleSection('verification')}
                        showEditControls={false}
                    >
                        <div className="space-y-1">
                            <FieldRow
                                label="Email Verification"
                                value={profile?.is_email_verified ? "Verified" : "Not Verified"}
                                isVerified={profile?.is_email_verified}
                                isEditable={false}
                            />
                            <FieldRow
                                label="Phone Verification"
                                value={profile?.is_phone_verified ? "Verified" : "Not Verified"}
                                isVerified={profile?.is_phone_verified}
                                isEditable={false}
                            />
                            <FieldRow
                                label="GST Verification"
                                value={profile?.is_gst_verified ? "Verified" : "Not Verified"}
                                isVerified={profile?.is_gst_verified}
                                isEditable={false}
                            />

                            <div className="p-3 py-3 mt-2 text-sm text-gray-500 rounded bg-gray-50">
                                <p>Verification status is managed by our admin team. Once you submit your documents, we will review and update the status within 2-3 business days.</p>
                                <button
                                    onClick={() => navigate("/company-authentication")}
                                    className="mt-2 font-medium text-blue-600 hover:text-blue-800"
                                >
                                    Submit Documents for Verification
                                </button>
                            </div>
                        </div>
                    </CollapsibleSection>

                    {/* ===== ACCOUNT RECOVERY METHODS (Bottom Section) ===== */}
                    <div className="p-6 bg-white shadow-sm rounded-xl">
                        <h2 className="mb-4 text-xl font-semibold text-gray-900">Account Recovery Methods</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${profile?.is_email_verified ? "bg-green-500" : "bg-gray-400"}`}></div>
                                    <div>
                                        <p className="font-medium text-gray-800">Email Recovery</p>
                                        <p className="text-sm text-gray-500">{formValues.email || "No email set"}</p>
                                    </div>
                                </div>
                                {!profile?.is_email_verified && (
                                    <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                        Verify
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${profile?.is_phone_verified ? "bg-green-500" : "bg-gray-400"}`}></div>
                                    <div>
                                        <p className="font-medium text-gray-800">Phone Recovery</p>
                                        <p className="text-sm text-gray-500">{formValues.phone || "No phone set"}</p>
                                    </div>
                                </div>
                                {!profile?.is_phone_verified && (
                                    <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                        Verify
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Optional: Right sidebar - commented out as in original */}
                {/* <div className="w-full lg:w-[30%]">
                    <FeedRightSidebar />
                </div> */}
            </div>
        </MainLayout>
    );
};

export default CompanyProfileEdit;