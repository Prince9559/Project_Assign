// src/components/modals/ProfileVisitorsModal.jsx
import { useState, useEffect } from "react";
import { FaSearch, FaTimes } from "react-icons/fa";
import dummyProfile3 from "../../assets/dummyProfile3.jpg";
import { getImageUrl } from "../../../utils";
import { useNavigate } from "react-router-dom";

const getAvatar = (viewItem) => {
    const { viewer, viewer_profile } = viewItem;
    if (viewer_profile?.profile_pic) return getImageUrl(viewer_profile.profile_pic);
    if (viewer?.user_profile_pic) return getImageUrl(viewer.user_profile_pic);
    return dummyProfile3;
};

const getDisplayName = (user, roleProfile) => {
    if (!user) return "Anonymous";
    const name = `${user.first_name} ${user.last_name}`.trim();
    if (user.user_role === "COMPANY" && roleProfile?.company_name) {
        return `${name} (${roleProfile.company_name})`;
    }
    if (user.user_role === "UNIVERSITY" && roleProfile?.college_name) {
        return `${name} (${roleProfile.college_name})`;
    }
    return name;
};

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};



export default function ProfileVisitorsModal({ isOpen, onClose, visitors = [], totalViews = 0, uniqueViewers = 0 }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredVisitors, setFilteredVisitors] = useState(visitors);
    const navigate = useNavigate();

    useEffect(() => {
        if (!searchTerm) {
            setFilteredVisitors(visitors);
        } else {
            const term = searchTerm.toLowerCase();
            setFilteredVisitors(
                visitors.filter((v) => {
                    const name = getDisplayName(v.viewer, v.viewer_profile).toLowerCase();
                    return name.includes(term);
                })
            );
        }
    }, [searchTerm, visitors]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="w-full max-w-3xl max-h-[90vh] overflow-hidden bg-white rounded-lg shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Profile Visitors</h2>
                        <p className="text-sm text-gray-500">
                            {uniqueViewers} unique visitor{uniqueViewers !== 1 ? "s" : ""} • {totalViews} total view{totalViews !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-500 rounded-full hover:text-gray-700 hover:bg-gray-100"
                        aria-label="Close"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                {/* Search */}
                <div className="px-6 py-3 border-b">
                    <div className="relative">
                        <FaSearch className="absolute w-4 h-4 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
                        <input
                            type="text"
                            placeholder="Search visitors by name..."
                            className="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Visitors List */}
                <div className="max-h-[60vh] overflow-y-auto">
                    {filteredVisitors.length === 0 ? (
                        <div className="px-6 py-8 text-center">
                            <p className="text-gray-500">
                                {searchTerm ? "No matching visitors." : "No visitors yet."}
                            </p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {filteredVisitors.map((view, index) => {
                                const displayName = getDisplayName(view.viewer, view.viewer_profile);
                                return (
                                    <li key={index} className="px-6 py-4 transition hover:bg-gray-50">
                                        <div className="flex items-center">
                                            
                                            <div
                                                onClick={() => {
                                                    const uuid = view.viewer?.uuid;
                                                    if (uuid) navigate(`/public-profile/${uuid}`);
                                                }}
                                                className="flex items-center p-1 -mx-1 rounded-lg cursor-pointer hover:bg-blue-50"
                                            >
                                                <img
                                                    src={getAvatar(view)}
                                                    alt={displayName}
                                                    className="object-cover w-12 h-12 border rounded-full"
                                                    onError={(e) => (e.currentTarget.src = dummyProfile3)}
                                                />
                                            </div>
                                                <div className="flex-1 ml-4">
                                                    <p className="font-medium text-gray-800 hover:text-blue-600">{displayName}</p>
                                                    <p className="text-sm text-gray-500">
                                                        {view.viewer?.user_role || "User"} • {formatDate(view.viewed_at)}
                                                    </p>
                                                    {view.viewer_profile?.designation && (
                                                        <p className="text-xs text-gray-400">{view.viewer_profile.designation}</p>
                                                    )}
                                                </div>
                                            
                                        
                                            <span
                                                className="px-2 py-1 ml-2 text-xs text-blue-800 bg-blue-100 rounded-full"
                                                onClick={(e) => e.stopPropagation()} 
                                            >
                                                Viewed {view.view_count || 1} time{view.view_count !== 1 ? "s" : ""}
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                {/* Footer (optional: Export / Analyze buttons) */}
                <div className="px-6 py-3 text-sm text-right text-gray-500 bg-gray-50">
                    Data updated in real-time • Last refreshed: {new Date().toLocaleTimeString()}
                </div>
            </div>
        </div>
    );
}