// export default function TransactionTable({ transactions }) {
//   return (
//     <div className="overflow-hidden bg-white shadow rounded-xl">
//       <div className="px-6 py-4 border-b border-gray-200">
//         <h3 className="text-lg font-semibold text-gray-800">📜 Recent Activity</h3>
//       </div>
//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Action</th>
//               <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">Credits</th>
//               <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">When</th>
//             </tr>
//           </thead>
//           <tbody className="bg-white divide-y divide-gray-200">
//             {transactions.map((tx) => (
//               <tr key={tx.log_id} className="hover:bg-gray-50">
//                 <td className="px-6 py-4 whitespace-nowrap">
//                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.color_class}`}>
//                     {tx.icon} {tx.action_label}
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 font-mono text-sm whitespace-nowrap">
//                   {tx.credits_changed > 0 ? '+' : ''}{tx.credits_changed} 
//                   <span className="ml-1 text-gray-500">
//                     ({tx.credits_before}→{tx.credits_after})
//                   </span>
//                 </td>
//                 <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
//                   {tx.created_at_relative}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//       {transactions.length === 0 && (
//         <div className="py-8 text-center text-gray-500">
//           No transactions yet.
//         </div>
//       )}
//     </div>
//   );
// }
















// TransactionTable.jsx
export default function TransactionTable({ transactions = [] }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        <p className="mt-1 text-sm text-gray-500">
          All credit-related actions (purchases, usage, expirations)
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Credits
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance Change
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <tr key={tx.log_id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${tx.color_class}`}>
                      {tx.icon} {tx.action_label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono font-medium">
                    {tx.credits_changed > 0 ? '+' : ''}{tx.credits_changed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {tx.credits_before} → {tx.credits_after}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(tx.created_at).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  No transactions recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}