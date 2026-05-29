import React, { useState, useEffect } from "react";
import MainLayout from "../../../components/layout/MainLayout";
// import RecruiterRightSidebar from "./RecruiterRightSidebar";
import { recruiterApi } from "../../../api/recruiterApi";
import { useSelector } from "react-redux";
import { CiSearch } from "react-icons/ci";


const getStatusDisplay = (status) => {
  const map = {
    "Scheduled": { label: "Scheduled", color: "bg-blue-100 text-blue-700", icon: "📅" },
    // "Rescheduled": { label: "Rescheduled", color: "bg-amber-100 text-amber-700", icon: "🔁" },
    "Completed": { label: "Completed", color: "bg-green-100 text-green-700", icon: "✅" },
    "Cancelled": { label: "Cancelled", color: "bg-red-100 text-red-700", icon: "❌" },
    "No-show": { label: "No-show", color: "bg-gray-100 text-gray-700", icon: "🚫" },
    "Pending": { label: "Pending", color: "bg-orange-100 text-orange-700", icon: "⏳" }, // fallback
  };
  return map[status] || map["Scheduled"];
};

const STATUS_OPTIONS = [
  { value: "Scheduled", label: "Scheduled" },
  // { value: "Rescheduled", label: "Rescheduled" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "No-show", label: "No-show" },
];



const formatInterviewDateTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return "—";
  const dt = new Date(`${dateStr}T${timeStr}`);
  if (isNaN(dt.getTime())) return "Invalid date";

  return dt.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }) + " IST";
};

const RecruiterUpcomingInterviews = () => {
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useSelector(state => state.auth);

  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);



  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);

        const response = await recruiterApi.getAllUpcomingInterviews(token);
        console.log(response);

        // Check if response has data property
        const interviewData = Array.isArray(response) ? response : response.data;
        console.log("Fetched interview data:", interviewData);

        const formattedInterviews = interviewData.map(interview => ({
          id: interview.id,
          name: interview.name,
          role: interview.jobProfile || "Not specified",
          mode: interview.interview_type || "Video Call",
          // date: interview.interview_date ? new Date(interview.interview_date).toLocaleString() : null,
          date: interview.interview_date || null,
          start_time: interview.start_time || "Not specified",
          status: interview.status || "Pending"
        }));
        console.log("these are formatted intevries", formattedInterviews);

        setInterviews(formattedInterviews);
      } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        setError(`Failed to fetch interviews: ${errorMessage}`);
        console.error("Error fetching interviews:", error);

        // If token is invalid, you might want to redirect to login
        if (error.response?.status === 401) {
          localStorage.removeItem('token'); // Clear invalid token
          // Add your login redirect logic here if needed
        }
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, [token]);

  // Open modal to view/update interview
  const handleViewDetails = (interview) => {
    setSelectedInterview(interview);
    setModalError(null);
    setIsModalOpen(true);
  };

  // Update interview status
  const handleStatusChange = async (newStatus) => {
    if (!selectedInterview) return;

    setModalLoading(true);
    setModalError(null);

    try {
      // Optimistic UI update
      const updatedInterview = {
        ...selectedInterview,
        status: newStatus,
      };
      setSelectedInterview(updatedInterview);

      // API call
      await recruiterApi.updateInterviewStatus(token, selectedInterview.id, newStatus);

      // Update list optimistically
      setInterviews(prev =>
        prev.map(i => i.id === selectedInterview.id ? updatedInterview : i)
      );

      // Close modal on success (optional)
      // setIsModalOpen(false);

    } catch (err) {
      // Revert on error
      setSelectedInterview(prev => ({ ...prev, status: selectedInterview.status }));
      setInterviews(prev =>
        prev.map(i => i.id === selectedInterview.id ? { ...i, status: selectedInterview.status } : i)
      );
      const msg = err.response?.data?.message || "Failed to update status";
      setModalError(msg);
    } finally {
      setModalLoading(false);
    }
  };

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const tabs = [
    { label: "All", count: interviews.length },
    {
      label: "Today",
      count: interviews.filter(
        (i) => i.date && isSameDay(new Date(i.date), new Date())
      ).length,
    },
    {
      label: "This week",
      count: interviews.filter((i) => {
        if (!i.date) return false;
        const interviewDate = new Date(i.date);
        const today = new Date();
        const weekEnd = new Date(today);
        weekEnd.setDate(today.getDate() + 7);
        return interviewDate >= today && interviewDate <= weekEnd;
      }).length,
    },
  ];

  console.log("Interviews data:", interviews);
  const filteredInterviews = interviews.filter((i) => {
    if (activeTab === "Today") {
      if (!i.date) return false;
      return new Date(i.date).toDateString() === new Date().toDateString();
    }
    if (activeTab === "This week") {
      if (!i.date) return false;
      const interviewDate = new Date(i.date);
      const today = new Date();
      const weekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7);
      return interviewDate >= today && interviewDate <= weekEnd;
    }
    if (searchTerm && !i.name.toLowerCase().includes(searchTerm.toLowerCase()))
      return false;
    return true;
  });

  if (loading) {
    return <MainLayout><div className="flex items-center justify-center h-screen">Loading...</div></MainLayout>;
  }

  if (error) {
    return <MainLayout><div className="flex items-center justify-center h-screen text-red-500">{error}</div></MainLayout>;
  }

  return (
    <MainLayout>
      <div className="flex items-start justify-center min-h-screen px-2 bg-gray-100 lg:px-8">
        <div className="flex-grow hidden lg:block"></div>

        <div className="w-full h-[635px] rounded-[10px] p-6 bg-white shadow-md mx-auto mt-10 flex flex-col gap-5">
          {/* Header */}
          <h2 className="text-3xl font-bold text-gray-900">Upcoming Interviews</h2>
          {/* <p className="text-gray-500">Lorem Ipsum</p> */}

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full py-2 pl-4 pr-10 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute right-3 top-2.5 text-gray-400"><CiSearch /></span>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 text-sm">
            {tabs.map((tab) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(tab.label)}
                className={`px-3 py-1 rounded-full border ${activeTab === tab.label
                    ? "bg-blue-100 text-blue-600 border-blue-400"
                    : "bg-gray-100 text-gray-500 border-gray-200"
                  }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Interview List */}
          <div className="flex flex-col gap-4 overflow-y-auto">
            {filteredInterviews.map((i) => (
              <div
                key={i.id}
                className="flex items-center justify-between p-4 border rounded-lg shadow-sm"
              >
                <div>
                  <h3 className="font-bold text-gray-800">{i.name}</h3>
                  <p className="text-sm text-gray-600">{i.role}</p>
                  <p className="text-xs text-gray-500">Mode: {i.mode}</p>
                  {i.date ? (
                    <p className="text-xs text-gray-500">{i.date + ", " + i.start_time}</p>
                  ) : (
                    <p className="text-xs text-gray-400">Pending</p>
                  )}
                </div>


                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1">
                    <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${getStatusDisplay(i.status).color}`}>
                      {getStatusDisplay(i.status).icon} {getStatusDisplay(i.status).label}
                    </span>
                  </div>

                  <button
                    onClick={() => handleViewDetails(i)}
                    className="px-3 py-1 text-xs font-medium text-white transition bg-blue-600 rounded hover:bg-blue-700"
                  >
                    View / Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* <aside className="hidden lg:block w-[425px] max-w-[425px] p-2 sticky top-4 h-fit ml-4">
          <RecruiterRightSidebar />
        </aside> */}
        {/* Right Spacer */}
        <div className="flex-grow hidden lg:block "></div>
      </div>


      {/* Interview Detail Modal */}
      {isModalOpen && selectedInterview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">
                Interview with {selectedInterview.name}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <p className="mt-1">{selectedInterview.role || "—"} </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Mode</label>
                <p className="mt-1">{selectedInterview.mode || "—"}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                <p className="mt-1">
                  {selectedInterview.date && selectedInterview.start_time
                    ? formatInterviewDateTime(selectedInterview.date, selectedInterview.start_time)
                    : "—"}
                </p>
              </div>

              {/* Status Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="relative mt-1">
                  <select
                    value={selectedInterview.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={modalLoading}
                    className="w-full py-2 pl-3 pr-8 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {modalLoading && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <div className="w-4 h-4 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                {modalError && (
                  <p className="mt-1 text-xs text-red-600">{modalError}</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end p-4 border-t">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
    
  );
};

export default RecruiterUpcomingInterviews;
