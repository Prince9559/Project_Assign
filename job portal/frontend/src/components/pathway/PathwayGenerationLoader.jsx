// import React from 'react';
// import { AiOutlineLoading3Quarters } from 'react-icons/ai';
// import { FiTarget, FiZap, FiCheckCircle } from 'react-icons/fi';

// const PathwayGenerationLoader = () => {
//   return (
//     <div className="p-6 text-center bg-white border border-gray-200 shadow-sm rounded-xl">
//       <div className="flex justify-center mb-6">
//         <div className="relative">
//           <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full">
//             <AiOutlineLoading3Quarters className="w-8 h-8 text-blue-600 animate-spin" />
//           </div>
//           <div className="absolute flex items-center justify-center w-6 h-6 bg-white border-2 border-white rounded-full -bottom-1 -right-1">
//             <FiZap className="w-4 h-4 text-yellow-500" />
//           </div>
//         </div>
//       </div>

//       <h2 className="mb-2 text-xl font-bold text-gray-800">Building Your Pathways</h2>
//       <p className="mb-6 text-gray-600">
//         Our AI is analyzing your goals and crafting 3 personalized learning roadmaps...
//       </p>

//       <div className="max-w-md mx-auto space-y-4">
//         <div className="flex items-start">
//           <div className="flex-shrink-0 mt-1">
//             <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
//               <FiTarget className="w-3 h-3 text-blue-600" />
//             </div>
//           </div>
//           <div className="ml-3 text-left">
//             <p className="text-sm font-medium text-gray-700">Analyzing job requirements</p>
//             <div className="w-full h-1 mt-1 bg-gray-200 rounded-full">
//               <div className="w-4/5 h-1 bg-blue-500 rounded-full"></div>
//             </div>
//           </div>
//         </div>

//         <div className="flex items-start">
//           <div className="flex-shrink-0 mt-1">
//             <div className="flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full">
//               <AiOutlineLoading3Quarters className="w-3 h-3 text-blue-600 animate-spin" />
//             </div>
//           </div>
//           <div className="ml-3 text-left">
//             <p className="text-sm font-medium text-gray-700">Scoring 100+ learning resources</p>
//             <div className="w-full h-1 mt-1 bg-gray-200 rounded-full">
//               <div className="w-3/5 h-1 bg-blue-500 rounded-full"></div>
//             </div>
//           </div>
//         </div>

//         <div className="flex items-start">
//           <div className="flex-shrink-0 mt-1">
//             <div className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full">
//               <FiCheckCircle className="w-3 h-3 text-gray-400" />
//             </div>
//           </div>
//           <div className="ml-3 text-left">
//             <p className="text-sm font-medium text-gray-500">Building 3 pathways (Preference-Heavy, Fastest, Balanced)</p>
//             <div className="w-full h-1 mt-1 bg-gray-200 rounded-full">
//               <div className="w-1/3 h-1 bg-gray-300 rounded-full"></div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <p className="mt-6 text-xs text-gray-500">
//         This takes 5–15 seconds. Your pathways will be saved for future access.
//       </p>
//     </div>
//   );
// };

// export default PathwayGenerationLoader;




import React from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { FiTarget, FiZap, FiCheckCircle } from 'react-icons/fi';

const PathwayGenerationLoader = () => {
  return (
    <div className="p-6 sm:p-8 text-center bg-white border border-gray-100 shadow-sm rounded-2xl">
      <div className="flex justify-center mb-6">
        <div className="relative">
          <div className="flex items-center justify-center w-16 h-16 bg-[#9bc87c]/10 rounded-full">
            <AiOutlineLoading3Quarters className="w-8 h-8 text-[#9bc87c] animate-spin" />
          </div>
          <div className="absolute flex items-center justify-center w-7 h-7 bg-white border-2 border-white rounded-full -bottom-1 -right-1">
            <div className="flex items-center justify-center w-full h-full bg-[#1e1e2d] rounded-full">
              <FiZap className="w-3 h-3 text-[#9bc87c]" />
            </div>
          </div>
        </div>
      </div>

      <h2 className="mb-2 text-2xl font-extrabold text-[#1e1e2d]">Building Your Pathways</h2>
      <p className="mb-8 text-sm sm:text-base text-gray-500">
        Our AI is analyzing your goals and crafting 3 personalized learning roadmaps...
      </p>

      <div className="max-w-md mx-auto space-y-6">
        
        {/* Step 1 */}
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <div className="flex items-center justify-center w-7 h-7 bg-[#9bc87c]/10 rounded-full">
              <FiTarget className="w-3.5 h-3.5 text-[#9bc87c]" />
            </div>
          </div>
          <div className="ml-3 text-left w-full">
            <p className="text-sm font-bold text-[#1e1e2d]">Analyzing job requirements</p>
            <div className="w-full h-1.5 mt-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="w-4/5 h-full bg-[#9bc87c] rounded-full relative">
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <div className="flex items-center justify-center w-7 h-7 bg-[#9bc87c]/10 rounded-full">
              <AiOutlineLoading3Quarters className="w-3.5 h-3.5 text-[#9bc87c] animate-spin" />
            </div>
          </div>
          <div className="ml-3 text-left w-full">
            <p className="text-sm font-bold text-[#1e1e2d]">Scoring 100+ learning resources</p>
            <div className="w-full h-1.5 mt-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="w-3/5 h-full bg-[#9bc87c] rounded-full relative">
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex items-start opacity-70">
          <div className="flex-shrink-0 mt-0.5">
            <div className="flex items-center justify-center w-7 h-7 bg-gray-50 border border-gray-200 rounded-full">
              <FiCheckCircle className="w-3.5 h-3.5 text-gray-400" />
            </div>
          </div>
          <div className="ml-3 text-left w-full">
            <p className="text-sm font-medium text-gray-500">Building 3 pathways (Preference-Heavy, Fastest, Balanced)</p>
            <div className="w-full h-1.5 mt-2 bg-gray-100 rounded-full">
              <div className="w-1/3 h-full bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-8 text-xs font-medium text-gray-400">
        This takes 5–15 seconds. Your pathways will be saved for future access.
      </p>
    </div>
  );
};

export default PathwayGenerationLoader;