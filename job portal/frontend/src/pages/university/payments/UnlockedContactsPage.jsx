import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { formatDistanceToNow, parseISO } from "date-fns";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { useSelector } from "react-redux";
import MainLayout from "../../../components/layout/MainLayout";
import { Link } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const UnlockedContactsPage = () => {
  const [contacts, setContacts] = useState([]);
  const [credits, setCredits] = useState({
    remaining_credits: 0,
    next_expiry: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // 'all', 'internship', 'job', 'project'
  const [exporting, setExporting] = useState(false);
  const { token } = useSelector((state) => state.auth);
  // Fetch unlocked contacts + credit status
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [contactsRes, creditsRes] = await Promise.all([
        axios.get(`${BASE_URL}/university/unlocked-contacts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get(`${BASE_URL}/university/credit-status`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);
      setContacts(contactsRes.data || []);
      setCredits(creditsRes.data || { remaining_credits: 0 });
    } catch (err) {
      console.error("Failed to load data:", err);
      setError("Unable to load unlocked contacts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter & search logic
  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch =
        contact.recruiter_name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        contact.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.job_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType =
        filterType === "all" ||
        contact.opportunity_type.toLowerCase() === filterType;

      return matchesSearch && matchesType;
    });
  }, [contacts, searchTerm, filterType]);

  // Export to CSV (or Excel via SheetJS)
  const handleExport = () => {
    if (filteredContacts.length === 0) return;
    setExporting(true);

    const data = filteredContacts.map((c) => ({
      "Recruiter Name": c.recruiter_name,
      Company: c.company_name || "—",
      "Job Title": c.job_title || "—",
      "Opportunity Type": c.opportunity_type || "—",
      Email: c.email,
      Phone: c.phone || "—",
      "Unlocked At": new Date(c.unlocked_at).toLocaleString("en-IN"),
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Unlocked Contacts");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(
      blob,
      `unlocked_contacts_${new Date().toISOString().slice(0, 10)}.xlsx`,
    );

    setExporting(false);
  };

  // Retry handler
  const retry = () => {
    fetchData();
  };

  // Skeleton loader for cards
  const SkeletonCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
      <div className="flex space-x-2">
        <div className="h-4 bg-gray-200 rounded w-16"></div>
        <div className="h-4 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="mt-4 h-3 bg-gray-200 rounded w-24"></div>
    </div>
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              🔓 Unlocked Recruiter Contacts
            </h1>
            <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
              View and manage contacts you've unlocked using your credits. Each
              unlock grants full access to recruiter details for outreach.
            </p>
          </motion.div>

          {/* Stats & Actions Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8"
          >
            {/* Credit Status Card */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center">
                <div className="bg-white/20 p-3 rounded-lg mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm opacity-80">Remaining Credits</p>
                  <p className="text-2xl font-bold">
                    {loading ? "—" : credits.remaining_credits}
                  </p>
                  {credits.next_expiry && (
                    <p className="text-xs mt-1 opacity-75">
                      Expires{" "}
                      {new Date(credits.next_expiry).toLocaleDateString(
                        "en-IN",
                      )}
                    </p>
                  )}
                </div>
              </div>
              {credits.remaining_credits < 5 && (
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="mt-4 text-center"
                >
                  <Link
                    to="/university/credits/pricing"
                    className="inline-block bg-white text-purple-600 font-semibold py-2 px-4 rounded-lg shadow hover:shadow-md transition"
                  >
                    💰 Buy More Credits
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Total Unlocks */}
            <div className="bg-white rounded-2xl shadow p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-lg mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Unlocks</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {loading ? "—" : contacts.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between">
              <div className="flex items-center mb-2">
                <div className="bg-green-100 p-3 rounded-lg mr-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Export</p>
                  <p className="text-sm text-gray-500">CSV / Excel</p>
                </div>
              </div>
              <button
                onClick={handleExport}
                disabled={exporting || filteredContacts.length === 0}
                className={`w-full py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2 ${
                  exporting || filteredContacts.length === 0
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {exporting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    <span>Export ({filteredContacts.length})</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Filters & Search */}
          <div className="bg-white rounded-2xl shadow p-5 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="search" className="sr-only">
                  Search recruiters
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      className="h-5 w-5 text-gray-400"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="search"
                    placeholder="Search by name, company, role..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full sm:w-auto">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 accent-green-600"
                >
                  <option value="all">All Opportunity Types</option>
                  <option value="Internship">Internship</option>
                  <option value="Job">Job</option>
                  <option value="Project">Project</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          {error ? (
            <div className="bg-white rounded-2xl shadow p-8 text-center">
              <div className="text-red-500 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-700 mb-4">{error}</p>
              <button
                onClick={retry}
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Retry
              </button>
            </div>
          ) : loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredContacts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow p-12 text-center"
            >
              <div className="text-gray-400 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No contacts unlocked yet
              </h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                Unlock recruiter contacts by viewing student profiles with
                contact access enabled.
              </p>
              <Link
                to="/university/jobs"
                className="inline-flex items-center px-5 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                Browse Jobs to Unlock
              </Link>
            </motion.div>
          ) : (
            <AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContacts.map((contact, index) => (
                  <motion.div
                    key={contact.unlock_id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="p-5">
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="bg-purple-100 text-purple-800 h-10 w-10 rounded-full flex items-center justify-center font-bold">
                            {contact.recruiter_name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="font-bold text-gray-800">
                            {contact.recruiter_name}
                          </h3>
                          {contact.company_name && (
                            <p className="text-sm text-gray-600">
                              {contact.company_name}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        {contact.job_title && (
                          <div className="flex items-center">
                            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium">
                              {contact.job_title}
                            </span>
                          </div>
                        )}
                        {contact.opportunity_type && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              contact.opportunity_type === "Internship"
                                ? "bg-green-100 text-green-800"
                                : contact.opportunity_type === "Job"
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-indigo-100 text-indigo-800"
                            }`}
                          >
                            {contact.opportunity_type.charAt(0).toUpperCase() +
                              contact.opportunity_type.slice(1)}
                          </span>
                        )}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex flex-wrap gap-2 mb-3">
                          <a
                            href={`mailto:${contact.email}`}
                            className="inline-flex items-center text-sm text-purple-600 hover:text-purple-800"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4 mr-1"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                              />
                            </svg>
                            {contact.email}
                          </a>
                          {contact.phone && (
                            <a
                              href={`tel:${contact.phone}`}
                              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 mr-1"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                />
                              </svg>
                              {contact.phone}
                            </a>
                          )}
                        </div>

                        <p className="text-xs text-gray-500 flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Unlocked{" "}
                          {contact.unlocked_at
                            ? formatDistanceToNow(
                                parseISO(contact.unlocked_at),
                                { addSuffix: true },
                              )
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default UnlockedContactsPage;
