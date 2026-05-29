// import React, { useState } from "react";
// import { FaCheckCircle } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import SignUpIllustration from "../../assets/SignUp_Illustration.png";
// import SignUpLayoutForLarge from "../../components/layout/SignUpLayoutForLarge";
// import { Button, Link } from "../../components/ui";

// const roles = [
//   {
//     label: "Sign up as a Student/Professional",
//     description: "Apply for Jobs, Learn",
//     color: "red",
//     value: "student",
//   },
//   {
//     label: "Sign up as a Company",
//     description: "Hire talent, Offer career opportunities",
//     color: "blue",
//     value: "company",
//   },
//   {
//     label: "Sign up as a University",
//     description: "Find best placements for students",
//     color: "blue",
//     value: "university",
//   },
// ];

// export default function SignUpChooseRole() {
//   const [selected, setSelected] = useState(0);
//   const navigate = useNavigate();

//   const handleRoleSelect = (idx) => {
//     setSelected(idx);
//   };

//   const handleContinue = () => {
//     // Navigate to signup page with selected role
//     navigate("/signup", {
//       state: {
//         selectedRole: roles[selected].value.toUpperCase(),
//         roleLabel: roles[selected].label,
//       },
//     });
//   };

//   return (
//     <SignUpLayoutForLarge
//       heading="Create a new account"
//       subheading="Join us and find your dream job or recruit talented candidates."
//       illustration={SignUpIllustration}
//       centerMobileContent={true}
//     >
//       {/* Main Content */}
//       <div className="w-full px-0 sm:max-w-sm mx-auto flex flex-col items-center justify-center -mt-4 sm:-mt-2">
//         <div className="bg-white rounded-lg shadow-none sm:shadow-md w-full p-4 sm:p-6">
//           {/* Role Options */}
//           <div className="w-full flex flex-col gap-3 mb-4">
//             {roles.map((role, idx) => (
//               <div
//                 key={role.label}
//                 onClick={() => handleRoleSelect(idx)}
//                 className={`w-full flex items-center justify-between rounded-lg border cursor-pointer transition-all duration-200 px-4 py-3 text-left ${idx === selected
//                   ? "bg-red-50 border-red-400"
//                   : "bg-gradient-to-r from-blue-50 to-white border-blue-300"}
//                   ${idx === selected ? "shadow-md" : "hover:shadow-md"}`}
//               >
//                 <div>
//                   <div className={`font-semibold text-base ${idx === selected ? "text-red-600" : "text-blue-900"}`}>{role.label}</div>
//                   <div className={`text-xs mt-1 ${idx === selected ? "text-red-400" : "text-blue-600"}`}>{role.description}</div>
//                 </div>
//                 {idx === selected && (
//                   <FaCheckCircle className="text-red-500 text-lg ml-2" />
//                 )}
//               </div>
//             ))}
//           </div>

//           {/* Continue Button - Using new UI component */}
//           <Button
//             onClick={handleContinue}
//             size="large"
//             className="w-full mb-2"
//           >
//             Continue
//           </Button>

//           {/* Login Link - Using new UI component */}
//           <div className="text-center mt-2 text-gray-500 text-sm">
//             Already have an account?{' '}
//             <Link
//               to="/login"
//               variant="primary"
//             >
//               Login
//             </Link>
//           </div>
//         </div>
//       </div>
//     </SignUpLayoutForLarge>
//   );
// }

// import React, { useState } from "react";
// import { FaCheckCircle } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import SignUpIllustration from "../../assets/SignUp_Illustration.png";
// import SignUpLayoutForLarge from "../../components/layout/SignUpLayoutForLarge";
// import { Button, Link } from "../../components/ui";
// import RoleOptionCard from "../../components/loginComponents/RoleOptionCard"
// const roles = [
//   {
//     label: "Sign up as a Student/Professional",
//     description: "Apply for Jobs, Learn",
//     value: "student",
//   },
//   {
//     label: "Sign up as a Company",
//     description: "Hire talent, Offer career opportunities",
//     value: "company",
//   },
//   {
//     label: "Sign up as a University",
//     description: "Find best placements for students",
//     value: "university",
//   },
// ];

// export default function SignUpChooseRole() {
//   const [selected, setSelected] = useState(0);
//   const navigate = useNavigate();

//   const handleRoleSelect = (idx) => {
//     setSelected(idx);
//   };

//   const handleContinue = () => {
//     // Navigate to signup page with selected role
//     navigate("/signup", {
//       state: {
//         selectedRole: roles[selected].value.toUpperCase(),
//         roleLabel: roles[selected].label,
//       },
//     });
//   };

//   return (
//     <SignUpLayoutForLarge
//       heading="Create a new account"
//       subheading="Join us and find your dream job or recruit talented candidates."
//       illustration={SignUpIllustration}
//       centerMobileContent={true}
//     >
//       {/* Main Content */}
//       <div className="w-full px-0 sm:max-w-sm mx-auto flex flex-col items-center justify-center -mt-4 sm:-mt-2 role-selector-wrapper">
//         <div className="bg-white rounded-2xl shadow-none sm:shadow-sm border border-transparent sm:border-gray-100 w-full p-4 sm:p-6">

//           {/* Role Options */}
//           <div className="w-full flex flex-col gap-3 mb-6">
//             {roles.map((role, idx) => (
//               <div
//                 key={role.label}
//                 onClick={() => handleRoleSelect(idx)}
//                 className={`w-full flex items-center justify-between rounded-xl border cursor-pointer transition-all duration-200 px-5 py-4 text-left group ${
//                   idx === selected
//                     ? "bg-[#9bc87c]/10 border-[#9bc87c] ring-1 ring-[#9bc87c] shadow-sm scale-[1.01]"
//                     : "bg-white border-gray-200 hover:border-[#9bc87c]/50 hover:bg-gray-50 hover:shadow-sm"
//                 }`}
//               >
//                 <div>
//                   <div className={`font-bold text-base transition-colors ${
//                     idx === selected ? "text-[#1e1e2d]" : "text-gray-700 group-hover:text-[#1e1e2d]"
//                   }`}>
//                     {role.label}
//                   </div>
//                   <div className={`text-xs font-medium mt-1 transition-colors ${
//                     idx === selected ? "text-gray-600" : "text-gray-500"
//                   }`}>
//                     {role.description}
//                   </div>
//                 </div>
//                 {idx === selected && (
//                   <FaCheckCircle className="text-[#9bc87c] text-xl ml-3 flex-shrink-0" />
//                 )}
//               </div>
//             ))}
//           </div>

//           {/* Continue Button */}
//           <Button
//             onClick={handleContinue}
//             size="large"
//             className="w-full mb-4 font-bold text-base py-3 rounded-xl shadow-sm submit-btn-override"
//           >
//             Continue
//           </Button>

//           {/* Login Link */}
//           <div className="text-center mt-3 text-gray-500 text-sm font-medium">
//             Already have an account?{' '}
//             <Link
//               to="/login"
//               className="link-override"
//             >
//               Login
//             </Link>
//           </div>
//         </div>
//       </div>

//       {/* Force-Override CSS for Custom UI Components */}
//       <style>{`
//         /* Force Button colors to override default library variants */
//         .submit-btn-override {
//           background-color: #9bc87c !important;
//           color: white !important;
//           border: none !important;
//           transition: background-color 0.2s ease-in-out !important;
//         }

//         .submit-btn-override:hover {
//           background-color: #8ab76b !important;
//         }

//         /* Force Link colors */
//         .link-override {
//           color: #9bc87c !important;
//           font-weight: 700 !important;
//           text-decoration: none !important;
//           transition: color 0.2s ease-in-out !important;
//         }

//         .link-override:hover {
//           color: #8ab76b !important;
//           text-decoration: underline !important;
//         }
//       `}</style>
//     </SignUpLayoutForLarge>
//   );
// }

import React, { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import SignUpIllustration from "../../assets/SignUp_Illustration.png";
import SignUpLayoutForLarge from "../../components/layout/SignUpLayoutForLarge";
import { Button, Link } from "../../components/ui";
import RoleOptionCard from "../../components/loginComponents/RoleOptionCard";

const roles = [
  {
    label: "Sign up as a Student/Professional",
    description: "Apply for Jobs, Learn",
    value: "student",
    accent: "#1DB32F",
  },
  {
    label: "Sign up as a Company",
    description: "Hire talent, Offer career opportunities",
    value: "company",
    accent: "#00C950",
  },
  {
    label: "Sign up as a University",
    description: "Find best placements for students",
    value: "university",
    accent: "#9BC87C",
  },
];

export default function SignUpChooseRole() {
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();

  const handleRoleSelect = (idx) => {
    setSelected(idx);
  };

  const handleContinue = () => {
    // Navigate to signup page with selected role
    navigate("/signup", {
      state: {
        selectedRole: roles[selected].value.toUpperCase(),
        roleLabel: roles[selected].label,
      },
    });
  };

  return (
    <SignUpLayoutForLarge
      heading="Create a new account"
      subheading="Join us and find your dream job or recruit talented candidates."
      illustration={SignUpIllustration}
      centerMobileContent={true}
    >
      {/* Main Content */}
      <div className="w-full px-0 sm:max-w-sm mx-auto flex flex-col items-center justify-center -mt-4 sm:-mt-2 role-selector-wrapper">
        <div className="bg-white rounded-2xl shadow-none sm:shadow-sm border border-transparent sm:border-gray-100 w-full p-4 sm:p-6">
          {/* Role Options */}
          <div className="w-full flex flex-col gap-3 mb-6">
            {roles.map((role, idx) => (
              <RoleOptionCard
                key={role.label}
                role={role}
                selected={idx === selected}
                onSelect={() => handleRoleSelect(idx)}
              />
            ))}
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            size="large"
            className="w-full mb-4 font-bold text-base py-3 rounded-xl shadow-sm submit-btn-override"
          >
            Continue
          </Button>

          {/* Login Link */}
          <div className="text-center mt-3 text-gray-500 text-sm font-medium">
            Already have an account?{" "}
            <Link to="/login" className="link-override">
              Login
            </Link>
          </div>
        </div>
      </div>

      {/* Force-Override CSS for Custom UI Components */}
      <style>{`
        /* Force Button colors to override default library variants */
        .submit-btn-override {
          background-color: #9bc87c !important;
          color: white !important;
          border: none !important;
          transition: background-color 0.2s ease-in-out !important;
        }

        .submit-btn-override:hover {
          background-color: #8ab76b !important;
        }

        /* Force Link colors */
        .link-override {
          color: #9bc87c !important;
          font-weight: 700 !important;
          text-decoration: none !important;
          transition: color 0.2s ease-in-out !important;
        }

        .link-override:hover {
          color: #8ab76b !important;
          text-decoration: underline !important;
        }
      `}</style>
    </SignUpLayoutForLarge>
  );
}
