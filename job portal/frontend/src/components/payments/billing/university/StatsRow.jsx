// import React from 'react';

// const StatCard = ({ label, value, icon, color }) => (
//   <div className="p-4 text-center bg-white border border-gray-100 rounded-lg shadow-sm">
//     <div className="flex items-center justify-center mb-2">
//       <span 
//         className={`inline-flex items-center justify-center w-8 h-8 rounded-md ${color} text-white`}
//         aria-hidden="true"
//       >
//         {icon}
//       </span>
//     </div>
//     <p className="mb-1 text-sm font-medium text-gray-600">{label}</p>
//     <p className="text-xl font-bold text-gray-900">
//       {value.toLocaleString()}
//     </p>
//   </div>
// );

// const StatsRow = ({ stats }) => {
//   // Defensive defaults
//   const {
//     total_purchased = 0,
//     total_used = 0,
//     total_expired = 0
//   } = stats || {};

//   return (
//     <div className="p-4 bg-white shadow rounded-xl">
//       <h3 className="px-2 mb-3 text-sm font-semibold text-gray-700">
//         📊 Credit Summary
//       </h3>
//       <div className="grid grid-cols-3 gap-3">
//         <StatCard
//           label="Purchased"
//           value={total_purchased}
//           icon="💰"
//           color="bg-green-500"
//         />
//         <StatCard
//           label="Used"
//           value={total_used}
//           icon="🔓"
//           color="bg-blue-500"
//         />
//         <StatCard
//           label="Expired"
//           value={total_expired}
//           icon="⏰"
//           color="bg-red-500"
//         />
//       </div>
      
//       {/* Optional: Show efficiency ratio (e.g., % used of purchased) */}
//       {total_purchased > 0 && (
//         <div className="px-2 pt-4 mt-4 border-t border-gray-100">
//           <p className="text-xs text-gray-500">
//             Efficiency:{" "}
//             <span className="font-medium text-gray-800">
//               {Math.round((total_used / total_purchased) * 100)}% used
//             </span>
//             {total_expired > 0 && (
//               <span className="ml-2 text-red-600">
//                 ({total_expired} expired)
//               </span>
//             )}
//           </p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default StatsRow;
















// CreditStatsCard.jsx
import React from 'react';

const StatItem = ({ label, value, icon, colorClass }) => (
  <div className="flex items-center">
    <div className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center ${colorClass} text-white`}>
      {icon}
    </div>
    <div className="ml-3">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-lg font-semibold text-gray-900">{value.toLocaleString()}</p>
    </div>
  </div>
);

const CreditStatsCard = ({ stats }) => {
  const { total_purchased = 0, total_used = 0, total_expired = 0 } = stats || {};
  const efficiency = total_purchased > 0 ? Math.round((total_used / total_purchased) * 100) : 0;

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <h3 className="text-base font-semibold text-gray-900 mb-4">Credit Summary</h3>
      <div className="space-y-4">
        <StatItem
          label="Purchased"
          value={total_purchased}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>}
          colorClass="bg-green-500"
        />
        <StatItem
          label="Used"
          value={total_used}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>}
          colorClass="bg-blue-500"
        />
        <StatItem
          label="Expired"
          value={total_expired}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>}
          colorClass="bg-red-500"
        />
      </div>

      {total_purchased > 0 && (
        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Credit utilization</span>
            <span className="text-sm font-semibold text-gray-900">{efficiency}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
            <div
              className={`h-1.5 rounded-full ${efficiency >= 80 ? 'bg-green-500' : efficiency >= 50 ? 'bg-yellow-500' : 'bg-gray-400'
                }`}
              style={{ width: `${efficiency}%` }}
            ></div>
          </div>
          {total_expired > 0 && (
            <p className="mt-2 text-xs text-red-600 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {total_expired} credits expired
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default CreditStatsCard;