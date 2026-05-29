// export default function ExpiryBreakdown({ expiry_breakdown }) {
//   if (expiry_breakdown.length === 0) return null;

//   return (
//     <div className="p-6 bg-white shadow rounded-xl">
//       <h3 className="mb-4 text-lg font-semibold text-gray-800">⏳ Credits Expiry Breakdown</h3>
//       <ul className="space-y-3">
//         {expiry_breakdown.map((group, i) => (
//           <li key={i} className="flex items-center justify-between">
//             <span className="font-medium">
//               {group.credits} credit{group.credits !== 1 ? 's' : ''} →
//             </span>
//             <span className={`px-3 py-1 rounded-full text-sm font-medium ${
//               group.expiry_date 
//                 ? 'bg-red-100 text-red-800' 
//                 : 'bg-green-100 text-green-800'
//             }`}>
//               {group.expiry_date_display}
//             </span>
//           </li>
//         ))}
//       </ul>
//     </div>
//   );
// }






// ExpiryBreakdown.jsx
export default function ExpiryBreakdown({ expiry_breakdown = [] }) {
  if (expiry_breakdown.length === 0) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Credits Expiry Schedule</h3>
        <p className="mt-1 text-sm text-gray-500">
          Credits grouped by expiry date. Non-expiring credits are shown last.
        </p>
      </div>
      <ul className="divide-y divide-gray-100">
        {expiry_breakdown.map((group, i) => (
          <li key={i} className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-8 h-8 rounded-md bg-blue-50 flex items-center justify-center text-blue-700 mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-4 4v6m0 0v2a2 2 0 002 2h0a2 2 0 002-2v-2m0 0h4m-4 0H8a2 2 0 01-2-2v0a2 2 0 012-2h4z" />
                </svg>
              </div>
              <span className="font-medium text-gray-900">
                {group.credits} credit{group.credits !== 1 ? 's' : ''}
              </span>
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${group.expiry_date
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
              {group.expiry_date_display}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}