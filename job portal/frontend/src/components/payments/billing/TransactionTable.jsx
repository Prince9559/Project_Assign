// src/components/billing/TransactionTable.jsx
import React from 'react';
import { StatusBadge } from './StatusBadge';

const TransactionTable = ({ transactions, onView }) => {
  if (transactions.length === 0) {
    return (
      <div className="py-8 text-center">
        <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions</h3>
        <p className="mt-1 text-sm text-gray-500">All your payments will appear here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              Date
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Description
            </th>
            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
              Amount
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Status
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
              <span className="sr-only">Details</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((txn) => (
            <tr key={txn.id} className="hover:bg-gray-50">
              <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 whitespace-nowrap sm:pl-6">
                {new Date(txn.date).toLocaleDateString('en-IN', {
                  day: '2-digit',
                  month: 'short',
                  year: '2-digit',
                })}
              </td>
              <td className="max-w-xs px-3 py-4 text-sm text-gray-700 truncate whitespace-nowrap">
                {txn.description}
              </td>
              <td className="px-3 py-4 text-sm font-medium text-right text-gray-900 whitespace-nowrap">
                ₹{txn.total_amount.toLocaleString('en-IN')}
                <div className="text-xs text-gray-500">
                  (₹{txn.amount} + ₹{txn.tax_amount})
                </div>
              </td>
              <td className="px-3 py-4 text-sm whitespace-nowrap">
                <StatusBadge status={txn.status} />
              </td>
              <td className="relative py-4 pl-3 pr-4 text-sm font-medium text-right whitespace-nowrap sm:pr-6">
                <button
                  onClick={() => onView(txn.id)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  View<span className="sr-only">, {txn.description}</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;