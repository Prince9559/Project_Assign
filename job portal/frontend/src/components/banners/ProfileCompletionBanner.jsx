// // src/components/banners/ProfileCompletionBanner.jsx
// import { useState, useEffect } from "react";
// import { FaTimes, FaExclamationCircle } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";

// export default function ProfileCompletionBanner({ profileCompletion, userRole, onDismiss }) {
//   const [isVisible, setIsVisible] = useState(false);
//   const navigate = useNavigate();
//   const storedUser = JSON.parse(localStorage.getItem("user") || "null");
//   const universityAccountStatus =
//     storedUser?.accountStatus || storedUser?.verification_status || "not_verified";
//   const isUniversityVerified =
//     userRole === "university" && universityAccountStatus === "verified";

//   // Threshold: show banner if completion < 80% (adjust as needed)
//   const THRESHOLD = 80;
//   const DISMISS_KEY = "profile_banner_dismissed";

//   useEffect(() => {
//     const dismissed = localStorage.getItem(DISMISS_KEY);
    
//     // Show only if: logged in, not dismissed, below threshold, and not a verified university
//     if (profileCompletion !== null && profileCompletion < THRESHOLD && dismissed !== "true") {
//       setIsVisible(true);
//     }
//   }, [profileCompletion, isUniversityVerified]);

//   const handleClose = () => {
//     setIsVisible(false);
//     localStorage.setItem(DISMISS_KEY, "true"); // Remember dismissal
//     onDismiss?.(); // Optional callback
//   };

//   const handleCompleteNow = () => {
//     const setupPath =
//       userRole === "student"
//         ? "/feed-view"
//         : userRole === "company"
//         ? "/company-profile-edit"
//         : userRole === "university"
//         ? "/university-fill-account-details"
//         : "/university-profile";
    
//     navigate(setupPath);
//     handleClose(); // Optional: dismiss after click
//   };

//   if (!isVisible || profileCompletion === null || isUniversityVerified) return null;

//   return (
//     <div className="sticky left-0 right-0 z-40 text-white shadow-lg top-14 bg-gradient-to-r from-blue-600 to-indigo-700">
//       <div className="flex items-center justify-between px-4 py-3 mx-auto max-w-7xl">
//         <div className="flex items-center gap-3">
//           <FaExclamationCircle className="flex-shrink-0 text-lg text-yellow-300" />
//           <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
//             <span className="text-sm font-medium sm:text-base">
//               Complete your profile • {profileCompletion}% complete
//             </span>
//             <button
//               onClick={handleCompleteNow}
//               className="px-3 py-1 text-xs font-semibold text-indigo-700 transition bg-white rounded-full sm:text-sm hover:bg-gray-100"
//             >
//               Complete Now →
//             </button>
//           </div>
//         </div>
        
//         <button
//           onClick={handleClose}
//           className="p-1 ml-2 transition rounded-full hover:bg-white/20"
//           aria-label="Dismiss"
//         >
//           <FaTimes className="text-sm text-indigo bg-blue" />
//         </button>
//       </div>
//     </div>
//   );
// }




import { useState, useEffect } from "react";
import { FaTimes, FaExclamationCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

// Moved constants outside the component to prevent recreation on every render
const THRESHOLD = 80;
const DISMISS_KEY = "profile_banner_dismissed";

export default function ProfileCompletionBanner({ profileCompletion, userRole, onDismiss }) {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  // Safely parse localStorage
  let storedUser = null;
  try {
    storedUser = JSON.parse(localStorage.getItem("user") || "null");
  } catch (error) {
    console.error("Error parsing user from localStorage:", error);
  }

  const universityAccountStatus =
    storedUser?.accountStatus || storedUser?.verification_status || "not_verified";
  
  const isUniversityVerified =
    userRole === "university" && universityAccountStatus === "verified";

  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    
    // Show only if: logged in, not dismissed, below threshold, and not a verified university
    if (profileCompletion !== null && profileCompletion < THRESHOLD && dismissed !== "true") {
      setIsVisible(true);
    }
  }, [profileCompletion, isUniversityVerified]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(DISMISS_KEY, "true"); // Remember dismissal
    if (onDismiss) onDismiss(); 
  };

  const handleCompleteNow = () => {
    const setupPath =
      userRole === "student"
        ? "/feed-view"
        : userRole === "company"
        ? "/recruiter-profile-edit"
        : userRole === "university"
        ? "/university-fill-account-details"
        : "/university-profile";
    
    navigate(setupPath);
    handleClose(); // Optional: dismiss after click
  };

  if (!isVisible || profileCompletion === null || isUniversityVerified) return null;

return (
  <div className="sticky left-0 right-0 z-40 top-14 shadow-lg text-[#1e1e2d] border-b-2 border-[#9BC87C]/60 bg-gradient-to-r from-[#9BC87C]/80 via-[#9BC87C] to-[#9BC87C]/80">
    <div className="flex items-center justify-between px-4 py-3 mx-auto max-w-7xl">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/50 border border-white/60">
          <FaExclamationCircle className="text-lg text-[#1e1e2d]" />
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <span className="text-sm font-semibold sm:text-base tracking-wide">
            Complete your profile •{" "}
            <span className="font-extrabold text-[#1e1e2d]">
              {profileCompletion}%
            </span>{" "}
            done
          </span>

          <button
            onClick={handleCompleteNow}
            

            className="inline-flex items-center gap-2 px-5 py-2 rounded-full
bg-[#9BC87C] text-white text-xs sm:text-sm font-extrabold
shadow-sm hover:shadow-md hover:brightness-95
focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            Complete Now →
          </button>
        </div>
      </div>

      {/* RIGHT */}
      <button
        onClick={handleClose}
        className="p-2 ml-2 rounded-full bg-white/20 hover:bg-white/35 transition
        focus:outline-none focus:ring-2 focus:ring-[#1e1e2d] focus:ring-offset-2 focus:ring-offset-[#9BC87C]"
        aria-label="Dismiss"
        type="button"
      >
        <FaTimes className="text-sm text-[#1e1e2d]" />
      </button>
    </div>
  </div>
);}