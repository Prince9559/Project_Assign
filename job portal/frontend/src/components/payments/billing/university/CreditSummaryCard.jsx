// export default function CreditSummaryCard({ summary, stats }) {
//   const { remaining_credits, next_expiry } = summary;
//   const total = stats.total_purchased;

//   return (
//     <div className="p-6 bg-white shadow rounded-xl">
//       <div className="flex items-start justify-between">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-800">
//             💰 {remaining_credits.toLocaleString()} credits
//           </h2>
//           <p className="text-gray-600">remaining</p>
//         </div>
//         {next_expiry && (
//           <span className="px-3 py-1 text-sm font-medium text-orange-800 bg-orange-100 rounded-full">
//             ⏳ Expires soon
//           </span>
//         )}
//       </div>

//       {/* Progress bar */}
//       <div className="mt-4">
//         <div className="w-full bg-gray-200 rounded-full h-2.5">
//           <div 
//             className="bg-blue-600 h-2.5 rounded-full" 
//             style={{ width: `${(remaining_credits / total) * 100 || 0}%` }}
//           ></div>
//         </div>
//         <p className="mt-1 text-sm text-gray-500">
//           {remaining_credits} / {total.toLocaleString()} credits
//         </p>
//       </div>

//       {/* Next expiry hint */}
//       {next_expiry && (
//         <p className="mt-3 text-sm font-medium text-orange-600">
//           Next expiry: {new Date(next_expiry).toLocaleDateString('en-IN')}
//         </p>
//       )}
//     </div>
//   );
// }














// CreditSummaryCard.jsx
export default function CreditSummaryCard({ summary, stats }) {
  const { remaining_credits, next_expiry } = summary;
  const totalPurchased = stats?.total_purchased || 0;
  const progress = totalPurchased > 0 ? (remaining_credits / totalPurchased) * 100 : 0;

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {remaining_credits.toLocaleString()} credits
          </h2>
          <p className="text-gray-600">Available balance</p>
        </div>
        {next_expiry && (
          <div className="flex items-center px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg border border-orange-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">
              Next expiry: {new Date(next_expiry).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mt-5">
        <div className="flex justify-between text-sm text-gray-600 mb-1.5">
          <span>Usage</span>
          <span>{remaining_credits} / {totalPurchased.toLocaleString()} credits</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          ></div>
        </div>
        <div className="mt-2 flex items-center text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-blue-600 mr-1.5"></div>
          <span>Remaining credits</span>
        </div>
      </div>
    </div>
  );
}