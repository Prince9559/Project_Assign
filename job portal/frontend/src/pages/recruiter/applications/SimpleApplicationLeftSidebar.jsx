// // SimpleApplicationSidebar.jsx

// import React from "react";

// const categories = [
//   { id: "All", label: "All Applications" },
//   { id: "Applied", label: "Received" },
//   { id: "ShortList", label: "Shortlisted" },
//   { id: "Hired", label: "Hired" },
//   { id: "NotInterested", label: "Not Interested" },
//   { id: "Send Assignment", label: "Assignments" },
//   { id: "Interview", label: "Interviews" },
// ];

// const SimpleApplicationSidebar = ({ selectedStatus, onStatusChange }) => {
//   return (
//     <div className="w-full max-w-xs p-4 bg-white rounded-lg shadow">
//       <h3 className="mb-3 font-medium text-gray-700">Filter by Status</h3>
//       <ul className="space-y-1">
//         {categories.map((cat) => (
//           <li key={cat.id}>
//             <button
//               onClick={() => onStatusChange(cat.id)}
//               className={`w-full text-left px-3 py-2 text-sm rounded ${
//                 selectedStatus === cat.id
//                   ? "bg-blue-50 text-blue-700 font-medium"
//                   : "text-gray-600 hover:bg-gray-100"
//               }`}
//             >
//               {cat.label}
//             </button>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default SimpleApplicationSidebar;





// SimpleApplicationSidebar.jsx

import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaFilter, FaCheck, FaUserTimes, FaBriefcase, FaEnvelope, FaCalendarAlt, FaComments, FaHeadset } from "react-icons/fa";

const SimpleApplicationSidebar = ({ selectedStatus, onStatusChange }) => {
  const navigate = useNavigate();

  const topCategories = [
    { id: "All", label: "All Applications", icon: FaFilter },
    { id: "Applied", label: "Received", icon: FaCheck },
    { id: "ShortList", label: "Shortlisted", icon: FaBriefcase },
    { id: "Hired", label: "Hired", icon: FaEnvelope },
    { id: "NotInterested", label: "Not Interested", icon: FaUserTimes },
  ];

  const bottomCategories = [
    { id: "Send Assignment", label: "Assignments", icon: FaEnvelope },
    { id: "Interview", label: "Interviews", icon: FaCalendarAlt },
  ];

  return (
    <div className="w-full max-w-xs p-4 bg-white rounded-lg shadow">
      <h3 className="mb-3 font-medium text-gray-700">Filter by Status</h3>
      <ul className="space-y-1">
        {topCategories.map((cat) => (
          <li key={cat.id}>
            <button
              onClick={() => onStatusChange(cat.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded ${
                selectedStatus === cat.id
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <cat.icon size={16} />
              {cat.label}
            </button>
          </li>
        ))}
      </ul>

      {/* Minimal section divider */}
      <div className="my-3 border-t border-gray-200"></div>

      <ul className="space-y-1">
        {bottomCategories.map((cat) => (
          <li key={cat.id}>
            <button
              onClick={() => onStatusChange(cat.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded ${
                selectedStatus === cat.id
                  ? "bg-blue-50 text-blue-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <cat.icon size={16} />
              {cat.label}
            </button>
          </li>
        ))}

        {/* Chat Messages — navigates instead of filtering */}
        <li>
          <button
            onClick={() => navigate("/chat-home")}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-600 rounded hover:bg-gray-100"
          >
            <FaComments size={16} />
            Chat Messages
          </button>
        </li>
      </ul>

      {/* Need Help? link at the bottom */}
      <div className="mt-6 pt-3 border-t border-gray-100">
        <Link
          to="/recruiter-ticket"
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded transition"
        >
          <FaHeadset size={16} />
          Need help?
        </Link>
      </div>
    </div>
  );
};

export default SimpleApplicationSidebar;