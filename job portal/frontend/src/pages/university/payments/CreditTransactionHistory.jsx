import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import {useSelector} from "react-redux";
import {Link} from "react-router-dom";

import MainLayout from "../../../components/layout/MainLayout";

const BASE_URL= import.meta.env.VITE_BASE_URL;

const CreditTransactionHistory = () => {
    // State
    const {token}= useSelector( (state) => (state.auth));
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1,
    });

    const [filters, setFilters] = useState({
        action_type: 'all',
        search: '',
    });

    const [exporting, setExporting] = useState(false);

    // Fetch transactions
    const fetchTransactions = async (page = 1, limit = 10, action_type = 'all', search = '') => {
        setLoading(true);
        setError(null);

        try {
            const params = { page, limit };
            if (action_type !== 'all') params.action_type = action_type;
            // Note: backend doesn't support `search` yet — we’ll filter client-side for now
            // (Or add full-text search to API later)

            const res = await axios.get(`${BASE_URL}/university/credit-transactions`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                } ,{ params });
            setTransactions(res.data.transactions);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error('Failed to load transactions', err);
            setError('Unable to load transaction history. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchTransactions(
            pagination.page,
            pagination.limit,
            filters.action_type
        );
    }, [pagination.page, pagination.limit, filters.action_type]);

    // Apply search locally (simple; for >1k rows, add backend search)
    const filteredTransactions = useMemo(() => {
        if (!filters.search.trim()) return transactions;
        const term = filters.search.toLowerCase();
        return transactions.filter(tx =>
            tx.description?.toLowerCase().includes(term) ||
            tx.reference_type?.toLowerCase().includes(term) ||
            tx.reference_id?.toString().includes(term) ||
            tx.action_label?.toLowerCase().includes(term)
        );
    }, [transactions, filters.search]);

    // Handlers
    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.pages) return;
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        // Reset to page 1 on filter change
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Page resets on search (handled via effect on filters.search)
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Export current view or all
    const handleExport = async (exportAll = false) => {
        setExporting(true);
        try {
            let exportData = [];

            if (exportAll) {
                // Fetch all (up to 1000 for safety) — adjust if needed
                const res = await axios.get(`${BASE_URL}/university/credit-transactions`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    } ,{
                    params: {
                        limit: 1000,
                        action_type: filters.action_type !== 'all' ? filters.action_type : undefined,
                    },
                });
                exportData = res.data.transactions;
            } else {
                // Export current filtered + paged view
                exportData = filteredTransactions;
            }

            if (exportData.length === 0) {
                alert('No transactions to export.');
                return;
            }

            const rows = exportData.map(t => ({
                'Date & Time': new Date(t.created_at).toLocaleString('en-IN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                }),
                'Action': t.action_label || t.action_type,
                'Credits Changed': t.credits_changed,
                'Balance After': t.credits_after,
                'Description': t.description || '—',
                'Reference': t.reference_type && t.reference_id
                    ? `${t.reference_type}:${t.reference_id}`
                    : '—',
            }));

            const ws = XLSX.utils.json_to_sheet(rows);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Credit Transactions');
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
            saveAs(blob, `credit_transactions_${exportAll ? 'full' : 'filtered'}_${new Date().toISOString().slice(0, 10)}.xlsx`);
        } catch (err) {
            console.error('Export failed', err);
            alert('Export failed. Please try again.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <MainLayout>
        <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">💳 Credit Transaction History</h1>
                            <p className="mt-1 text-gray-600">
                                Full log of all credit purchases, usage, expirations, and adjustments.
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            <button
                                onClick={() => handleExport(false)}
                                disabled={exporting || filteredTransactions.length === 0}
                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${exporting || filteredTransactions.length === 0
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Export Page
                            </button>
                            <button
                                onClick={() => handleExport(true)}
                                disabled={exporting}
                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg ${exporting
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                        : 'bg-purple-600 text-white hover:bg-purple-700'
                                    }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Export All
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow p-4 mb-6">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 min-w-0">
                            <label htmlFor="search" className="sr-only">Search</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    id="search"
                                    name="search"
                                    placeholder="Search description, reference, action..."
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    value={filters.search}
                                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="sm:w-48">
                            <select
                                name="action_type"
                                value={filters.action_type}
                                onChange={handleFilterChange}
                                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            >
                                <option value="all">All Actions</option>
                                <option value="purchased">Purchased</option>
                                <option value="used">Used (Unlocked)</option>
                                <option value="expired">Expired</option>
                                <option value="admin">Admin Adjustment</option>
                            </select>
                        </div>
                        <div className="sm:w-32">
                            <button
                                type="submit"
                                className="w-full inline-flex justify-center items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 focus:outline-none"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Search
                            </button>
                        </div>
                    </form>
                </div>

                {/* Results */}
                {error ? (
                    <div className="bg-white rounded-xl p-8 text-center">
                        <div className="text-red-500 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-700 mb-4">{error}</p>
                        <button
                            onClick={() => fetchTransactions(pagination.page, pagination.limit, filters.action_type)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                            Retry
                        </button>
                    </div>
                ) : loading ? (
                    <div className="bg-white rounded-xl shadow overflow-hidden">
                        <ul className="divide-y divide-gray-100">
                            {[...Array(pagination.limit)].map((_, i) => (
                                <li key={i} className="p-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
                                            <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                                        </div>
                                        <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : filteredTransactions.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <h3 className="mt-4 text-lg font-medium text-gray-800">No transactions found</h3>
                        <p className="mt-1 text-gray-600">
                            Try adjusting your filters or search term.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-xl shadow overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date & Time
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Action
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Description
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Credits
                                            </th>
                                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Balance
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredTransactions.map((tx) => {
                                            const isPositive = tx.credits_changed > 0;
                                            return (
                                                <tr key={tx.log_id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {format(new Date(tx.created_at), 'dd MMM yyyy, HH:mm')}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tx.action_type === 'purchased'
                                                                ? 'bg-green-100 text-green-800'
                                                                : tx.action_type === 'used'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : tx.action_type === 'expired'
                                                                        ? 'bg-red-100 text-red-800'
                                                                        : 'bg-purple-100 text-purple-800'
                                                            }`}>
                                                            {tx.action_label || tx.action_type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                                                        {tx.description || '—'}
                                                        {tx.reference_type && (
                                                            <span className="block text-xs text-gray-500 mt-1">
                                                                Ref: {tx.reference_type}:{tx.reference_id}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <span className={isPositive ? 'text-green-600' : 'text-gray-900'}>
                                                            {isPositive ? '+' : ''}
                                                            {tx.credits_changed}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-700">
                                                        {tx.credits_after}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination */}
                        <div className="mt-6 flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-b-xl">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.pages}
                                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                                        <span className="font-medium">
                                            {Math.min(pagination.page * pagination.limit, pagination.total)}
                                        </span>{' '}
                                        of <span className="font-medium">{pagination.total}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        <button
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page <= 1}
                                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="sr-only">Previous</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                            </svg>
                                        </button>

                                        {[...Array(pagination.pages)].map((_, i) => {
                                            const pageNum = i + 1;
                                            // Show first, last, and near current
                                            if (
                                                pageNum === 1 ||
                                                pageNum === pagination.pages ||
                                                (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                                            ) {
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => handlePageChange(pageNum)}
                                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${pagination.page === pageNum
                                                                ? 'z-10 bg-purple-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600'
                                                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            }
                                            if (pageNum === 2 && pagination.page > 3) {
                                                return (
                                                    <span key="ellipsis1" className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700">
                                                        ...
                                                    </span>
                                                );
                                            }
                                            if (pageNum === pagination.pages - 1 && pagination.page < pagination.pages - 2) {
                                                return (
                                                    <span key="ellipsis2" className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700">
                                                        ...
                                                    </span>
                                                );
                                            }
                                            return null;
                                        })}

                                        <button
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page >= pagination.pages}
                                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <span className="sr-only">Next</span>
                                            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Back to Dashboard */}
                <div className="mt-8 text-center">
                    <Link
                        to="/university/credits/dashboard"
                        className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        Back to Dashboard
                    </Link>
                </div>
            </div>
        </div>
        </MainLayout>
    );
};

export default CreditTransactionHistory;