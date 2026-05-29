


// // src/components/layout/MainLayout.jsx
// import Header from "../shared/Header";
// import Footer from "../shared/Footer";
// import {useSelector } from "react-redux";
// import {useState,useEffect} from "react";
// import ProfileCompletionBanner from "../banners/ProfileCompletionBanner";
// import { userDetailsApi } from "../../api/userDetailsApi";
// import { useLocation } from "react-router-dom";


// export default function MainLayout({ children, scrollable = true }) {

//   const { token, user } = useSelector((state) => state.auth);
//   const [profileCompletion, setProfileCompletion] = useState(null);
//   const [loadingCompletion, setLoadingCompletion] = useState(true);

//   const location = useLocation();
// const hideProfileBanner = location.pathname === "/account-not-verified";

//    useEffect(() => {
//       const fetchProfileCompletion = async () => {
//         if (!token) {
//           setLoadingCompletion(false);
//           return;
//         }
  
//         setLoadingCompletion(true);
//         try {
  
//           const response = await userDetailsApi.getProfileCompletion(
//             token,
//             false
//           );
  
//           // Extract correctly:
//           const pct = response?.data?.profile_completion_percentage;
  
//           if (typeof pct === "number") {
//             setProfileCompletion(Math.min(100, Math.max(0, pct)));
//           } else {
//             setProfileCompletion(0);
//           }
//         } catch (err) {
//           console.warn("Profile completion fetch failed:", err);
//           setProfileCompletion(0);
//         } finally {
//           setLoadingCompletion(false);
//         }
//       };
  
//       fetchProfileCompletion();
//     }, [token]);

//   if (scrollable) {
//     // Default: full-page scrolling (for 99% of pages)
//     return (
//       <div className="flex flex-col min-h-screen">
//         <div className="sticky top-0 z-50 bg-white">
//           <Header />
//         </div>

//         {/* {token && user?.profile_status !== 1 && (
          
//             <ProfileCompletionBanner
//               profileCompletion={profileCompletion}
//               userRole={user?.user_role?.toLowerCase()}
//             />
//         )} */}

//         {token && user?.profile_status !== 1 && !hideProfileBanner && (
//   <ProfileCompletionBanner
//     profileCompletion={profileCompletion}
//     userRole={user?.user_role?.toLowerCase()}
//   />
// )}
      
//         <main className="flex-1">
//           {children}
//         </main>
//         <Footer />
//       </div>
//     );
//   }

//   // Special mode: fixed height, no page scroll (for chat, dashboard with panes, etc.)
//   return (
//     <div className="flex flex-col h-screen">
//       <div className="sticky top-0 z-50 bg-white">
//         <Header />
//       </div>

//       {token && user?.profile_status !== 1 && (
//         <ProfileCompletionBanner
//           profileCompletion={profileCompletion}
//           userRole={user?.user_role?.toLowerCase()}
//         />
//       )}
//       <main className="flex-1 overflow-hidden">
//         {children}
//       </main>
//       <Footer />
//     </div>
//   );
// }




import Header from "../shared/Header";
import Footer from "../shared/Footer";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import ProfileCompletionBanner from "../banners/ProfileCompletionBanner";
import { userDetailsApi } from "../../api/userDetailsApi";
import { useLocation } from "react-router-dom";

export default function MainLayout({ children, scrollable = true }) {
  const { token, user } = useSelector((state) => state.auth);
  const [profileCompletion, setProfileCompletion] = useState(null);
  const [loadingCompletion, setLoadingCompletion] = useState(true);

  const location = useLocation();
  const hideProfileBanner = location.pathname === "/account-not-verified";

  useEffect(() => {
    const fetchProfileCompletion = async () => {
      if (!token) {
        setLoadingCompletion(false);
        return;
      }

      setLoadingCompletion(true);
      try {
        const response = await userDetailsApi.getProfileCompletion(
          token,
          false
        );

        // Extract correctly:
        const pct = response?.data?.profile_completion_percentage;

        if (typeof pct === "number") {
          setProfileCompletion(Math.min(100, Math.max(0, pct)));
        } else {
          setProfileCompletion(0);
        }
      } catch (err) {
        console.warn("Profile completion fetch failed:", err);
        setProfileCompletion(0);
      } finally {
        setLoadingCompletion(false);
      }
    };

    fetchProfileCompletion();
  }, [token]);

  if (scrollable) {
    // Default: full-page scrolling (for 99% of pages)
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        {/* Added border and shadow to cleanly separate the header from the gray body */}
        <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
          <Header />
        </div>

        {token && user?.profile_status !== 1 && !hideProfileBanner && (
          <ProfileCompletionBanner
            profileCompletion={profileCompletion}
            userRole={user?.user_role?.toLowerCase()}
          />
        )}

        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    );
  }

  // Special mode: fixed height, no page scroll (for chat, dashboard with panes, etc.)
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <Header />
      </div>

      {token && user?.profile_status !== 1 && !hideProfileBanner && (
        <ProfileCompletionBanner
          profileCompletion={profileCompletion}
          userRole={user?.user_role?.toLowerCase()}
        />
      )}
      
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
      <Footer />
    </div>
  );
}