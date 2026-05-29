// import React, { useState } from "react";
// import { FaCheckCircle } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import AiProfileIllustration from "../../assets/AiProfileIllustration.png";
// import Ailayout from "../../components/layout/Ailayout";
// import { Button, Link } from "../../components/ui";
// import MainLayout from "../../components/layout/MainLayout";

// const roles = [
//   {
//     label: "Job Specific Skills ",
//     description: "Upskills According to the Job If You'r Interested",
//     color: "red",
//     value: "student",
//     target:"/ai-prediction/all-jobs",
//   },
//   {
//     label: "Target Specific Skills ",
//     description: "Upskills and work to Your Dream Company",
//     color: "blue",
//     value: "company",
//     target: "/ai-prediction/all-jobs-part",
//   },
//   {
//     label: "Upskill ",
//     description: "Upskills To find the Better oppertunity",
//     color: "blue",
//     value: "university",
//     target: "/ai-prediction/get-started",
//   },
// ];

// export default function AiProfile() {
//   const [selected, setSelected] = useState(0);
//   const navigate = useNavigate();

//   const handleRoleSelect = (idx) => {
//     setSelected(idx);
//     if (idx == 0) navigate("/ai-prediction/all-jobs")
//       else
//     navigate("/all-jobs-part")
    
//   };


//   return (

//     <Ailayout
//       heading="Ai Prediction"
//       subheading="Move one step closure to find your Dream job or Upskilling YourSelf "
//       illustration={AiProfileIllustration}
//       centerMobileContent={true}
//     >
//       {/* Main Content */}
//       <div className="flex flex-col items-center justify-center w-full px-0 mx-auto -mt-4 sm:max-w-sm sm:-mt-2">
//         <div className="w-full p-4 bg-white rounded-lg shadow-none sm:shadow-md sm:p-6">
//           {/* Role Options */}
//           <div className="flex flex-col w-full gap-3 mb-4">
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
//                   <FaCheckCircle className="ml-2 text-lg text-red-500" />
//                 )}
//               </div>
//             ))}
//           </div>
         
//         </div>
//       </div>
//     </Ailayout>
//   );
// }






// src/pages/AiProfile.jsx
import React, { useState } from "react";
import { FaCheckCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AiProfileIllustration from "../../assets/AiProfileIllustration.png";
import Ailayout from "../../components/layout/Ailayout";

const strategies = [
  {
    label: "Job Specific Skills",
    description: "Upskill according to the job you're interested in.",
    value: "job",
    color: "red",
    // target:"/ai-prediction/all-jobs",
    target: "/mypathway",
  },
  {
    label: "Target Specific Skills",
    description: "Upskill and target your dream company.",
    value: "company_role",
    color: "blue",
    target: "/ai-prediction/all-jobs-part",
  },
  {
    label: "Upskill",
    description: "Upskill to find better career opportunities.",
    value: "upskilling",
    color: "blue",
    target: "/ai-prediction/get-started",
  },
];

export default function AiProfile() {
  const [selected, setSelected] = useState(0);
  const navigate = useNavigate();

  const handleSelect = (idx) => {
    setSelected(idx);
    const strategy = strategies[idx].value;

    if (strategy === "job") {
      // navigate("/ai-prediction/all-jobs");
      navigate("/mypathway");
    } else if (strategy === "company_role") {
      // navigate("/ai-company-role");
      navigate("/mypathway", {state: {
        strategy:"company_role_target"
      }});
    } else if (strategy === "upskilling") {
      navigate("/ai-prediction/get-started")
      
    }
  };

  return (
    <Ailayout
      heading="AI Prediction"
      subheading="Move one step closer to finding your dream job or upskilling yourself."
      illustration={AiProfileIllustration}
      centerMobileContent={true}
    >
      <div className="flex flex-col items-center justify-center w-full px-0 mx-auto -mt-4 sm:max-w-sm sm:-mt-2">
        <div className="w-full p-4 bg-white rounded-lg shadow-none sm:shadow-md sm:p-6">
          <div className="flex flex-col w-full gap-3 mb-6">
            {strategies.map((item, idx) => (
              <div
                key={item.value}
                onClick={() => handleSelect(idx)}
                className={`w-full flex items-center justify-between rounded-lg border cursor-pointer transition-all duration-200 px-4 py-3 text-left ${
                  idx === selected
                    ? "bg-red-50 border-red-400 shadow-md"
                    : "bg-gradient-to-r from-blue-50 to-white border-blue-300 hover:shadow-md"
                }`}
              >
                <div>
                  <div
                    className={`font-semibold text-base ${
                      idx === selected ? "text-red-600" : "text-blue-900"
                    }`}
                  >
                    {item.label}
                  </div>
                  <div
                    className={`text-xs mt-1 ${
                      idx === selected ? "text-red-400" : "text-blue-600"
                    }`}
                  >
                    {item.description}
                  </div>
                </div>
                {idx === selected && (
                  <FaCheckCircle className="flex-shrink-0 ml-2 text-lg text-red-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Ailayout>
  );
}