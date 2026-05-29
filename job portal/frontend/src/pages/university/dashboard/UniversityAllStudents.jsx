// import React, { useEffect, useMemo, useState } from "react";
// import MainLayout from "../../../components/layout/MainLayout";
// import { useSelector } from "react-redux";
// import { universityApi } from "../../../api/university/universityApi";

// const UniversityAllStudents = () => {
//   const { token } = useSelector((state) => state.auth);
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState("");
//   const [studentFilter, setStudentFilter] = useState("all");
//   const [approvalFilter, setApprovalFilter] = useState("all");
//   const [removeState, setRemoveState] = useState({ open: false, educationId: null, reason: "" });

//   const loadStudents = async () => {
//     try {
//       setLoading(true);
//       const response = await universityApi.getAllStudents(token);
//       setRows(response?.data || []);
//     } catch (error) {
//       console.error("Failed to load students:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (token) loadStudents();
//   }, [token]);

//   const filteredRows = useMemo(() => {
//     return rows.filter((row) => {
//       const matchesSearch = row.student_name?.toLowerCase().includes(search.toLowerCase());
//       const matchesStudentType = studentFilter === "all" || row.status === studentFilter;
//       const matchesApproval = approvalFilter === "all" || row.approval_status === approvalFilter;
//       return matchesSearch && matchesStudentType && matchesApproval;
//     });
//   }, [rows, search, studentFilter, approvalFilter]);

//   const handleRemove = async () => {
//     if (!removeState.reason.trim()) return;
//     await universityApi.removeStudent(
//       {
//         education_id: removeState.educationId,
//         removal_reason: removeState.reason.trim(),
//       },
//       token
//     );
//     setRemoveState({ open: false, educationId: null, reason: "" });
//     loadStudents();
//   };

//   return (
//     <MainLayout>
//       <div className="p-6 bg-gray-100 min-h-screen">
//         <h1 className="text-2xl font-bold mb-4">University Dashboard - All Students</h1>

//         <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
//           <input
//             className="border rounded p-2"
//             placeholder="Search by name"
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//           />
//           <select className="border rounded p-2" value={studentFilter} onChange={(e) => setStudentFilter(e.target.value)}>
//             <option value="all">All Types</option>
//             <option value="Current Student">Current Student</option>
//             <option value="Alumni">Alumni</option>
//           </select>
//           <select className="border rounded p-2" value={approvalFilter} onChange={(e) => setApprovalFilter(e.target.value)}>
//             <option value="all">All Approvals</option>
//             <option value="approved">Approved</option>
//             <option value="pending">Pending</option>
//             <option value="rejected">Rejected</option>
//           </select>
//           <button className="bg-blue-600 text-white rounded p-2" onClick={loadStudents}>Refresh</button>
//         </div>

//         <div className="bg-white rounded shadow overflow-x-auto">
//           <table className="w-full text-sm">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="p-3 text-left">Student Name</th>
//                 <th className="p-3 text-left">Course</th>
//                 <th className="p-3 text-left">Start Year</th>
//                 <th className="p-3 text-left">End Year</th>
//                 <th className="p-3 text-left">Status</th>
//                 <th className="p-3 text-left">Approval</th>
//                 <th className="p-3 text-left">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr><td className="p-4" colSpan={7}>Loading...</td></tr>
//               ) : filteredRows.length === 0 ? (
//                 <tr><td className="p-4" colSpan={7}>No students found.</td></tr>
//               ) : (
//                 filteredRows.map((row) => (
//                   <tr key={row.id} className="border-t">
//                     <td className="p-3">{row.student_name}</td>
//                     <td className="p-3">{row.course}</td>
//                     <td className="p-3">{row.start_year || "-"}</td>
//                     <td className="p-3">{row.end_year || "-"}</td>
//                     <td className="p-3">{row.status}</td>
//                     <td className="p-3 capitalize">{row.approval_status}</td>
//                     <td className="p-3">
//                       <button
//                         className="bg-red-600 text-white px-3 py-1 rounded disabled:bg-gray-400"
//                         disabled={row.approval_status === "rejected"}
//                         onClick={() => setRemoveState({ open: true, educationId: row.id, reason: "" })}
//                       >
//                         Remove
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//         {removeState.open && (
//           <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
//             <div className="bg-white rounded p-4 w-full max-w-md space-y-3">
//               <h2 className="text-lg font-semibold">Confirm removal</h2>
//               <textarea
//                 className="border rounded p-2 w-full"
//                 rows={4}
//                 placeholder="Removal reason (required)"
//                 value={removeState.reason}
//                 onChange={(e) => setRemoveState((prev) => ({ ...prev, reason: e.target.value }))}
//               />
//               <div className="flex gap-2 justify-end">
//                 <button className="px-3 py-1 border rounded" onClick={() => setRemoveState({ open: false, educationId: null, reason: "" })}>Cancel</button>
//                 <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={handleRemove}>Confirm Remove</button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </MainLayout>
//   );
// };

// export default UniversityAllStudents;


















import React, { useEffect, useMemo, useState, useRef } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { useSelector } from "react-redux";
import { universityApi } from "../../../api/university/universityApi";

// Custom Select Component to override the default blue browser highlight
const CustomSelect = ({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        className="border border-gray-300 rounded p-2 bg-white cursor-pointer flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-[#9bc87c]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{selected?.label}</span>
        <span className="text-gray-500 text-xs ml-2">▼</span>
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg overflow-hidden">
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`p-2 cursor-pointer transition-colors duration-150 ${
                value === opt.value
                  ? "bg-[#9bc87c] text-white" // Active green state
                  : "text-gray-700 hover:bg-[#9bc87c] hover:text-white" // Hover green state
              }`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const UniversityAllStudents = () => {
  const { token } = useSelector((state) => state.auth);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [studentFilter, setStudentFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [removeState, setRemoveState] = useState({
    open: false,
    educationId: null,
    reason: "",
  });

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await universityApi.getAllStudents(token);
      setRows(response?.data || []);
    } catch (error) {
      console.error("Failed to load students:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadStudents();
  }, [token]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch = row.student_name
        ?.toLowerCase()
        .includes(search.toLowerCase());
      const matchesStudentType =
        studentFilter === "all" || row.status === studentFilter;
      const matchesApproval =
        approvalFilter === "all" || row.approval_status === approvalFilter;
      return matchesSearch && matchesStudentType && matchesApproval;
    });
  }, [rows, search, studentFilter, approvalFilter]);

  const handleRemove = async () => {
    if (!removeState.reason.trim()) return;
    await universityApi.removeStudent(
      {
        education_id: removeState.educationId,
        removal_reason: removeState.reason.trim(),
      },
      token
    );
    setRemoveState({ open: false, educationId: null, reason: "" });
    loadStudents();
  };

  return (
    <MainLayout>
      <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
        <h1 className="text-xl md:text-2xl font-bold mb-4">
          University Dashboard - All Students
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <input
            className="border border-gray-300 rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-[#9bc87c]"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <CustomSelect
            value={studentFilter}
            onChange={setStudentFilter}
            options={[
              { label: "All Types", value: "all" },
              { label: "Current Student", value: "Current Student" },
              { label: "Alumni", value: "Alumni" },
            ]}
          />

          <CustomSelect
            value={approvalFilter}
            onChange={setApprovalFilter}
            options={[
              { label: "All Approvals", value: "all" },
              { label: "Approved", value: "approved" },
              { label: "Pending", value: "pending" },
              { label: "Rejected", value: "rejected" },
            ]}
          />

          <button
            className="bg-[#9bc87c] hover:bg-[#88b86a] text-white rounded p-2 transition w-full"
            onClick={loadStudents}
          >
            Refresh
          </button>
        </div>

        {/* Responsive Table -> Card view on Mobile */}
        <div className="bg-transparent md:bg-white md:rounded md:shadow">
          <table className="w-full text-sm">
            <thead className="hidden md:table-header-group bg-gray-50">
              <tr>
                <th className="p-3 text-left whitespace-nowrap">Student Name</th>
                <th className="p-3 text-left whitespace-nowrap">Course</th>
                <th className="p-3 text-left whitespace-nowrap">Start Year</th>
                <th className="p-3 text-left whitespace-nowrap">End Year</th>
                <th className="p-3 text-left whitespace-nowrap">Status</th>
                <th className="p-3 text-left whitespace-nowrap">Approval</th>
                <th className="p-3 text-left whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group">
              {loading ? (
                <tr className="block md:table-row">
                  <td className="p-4 text-center bg-white rounded shadow md:shadow-none" colSpan={7}>
                    Loading...
                  </td>
                </tr>
              ) : filteredRows.length === 0 ? (
                <tr className="block md:table-row">
                  <td className="p-4 text-center text-gray-500 bg-white rounded shadow md:shadow-none" colSpan={7}>
                    No students found.
                  </td>
                </tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id} className="block md:table-row bg-white mb-4 md:mb-0 border border-gray-200 md:border-t md:border-x-0 md:border-b-0 rounded shadow-sm md:shadow-none hover:bg-gray-50">
                    <td className="p-3 flex justify-between items-center md:table-cell border-b border-gray-100 md:border-none">
                      <span className="md:hidden font-semibold text-gray-600">Name:</span>
                      <span className="text-right md:text-left">{row.student_name}</span>
                    </td>
                    <td className="p-3 flex justify-between items-center md:table-cell border-b border-gray-100 md:border-none">
                      <span className="md:hidden font-semibold text-gray-600">Course:</span>
                      <span className="text-right md:text-left">{row.course}</span>
                    </td>
                    <td className="p-3 flex justify-between items-center md:table-cell border-b border-gray-100 md:border-none">
                      <span className="md:hidden font-semibold text-gray-600">Start Year:</span>
                      <span className="text-right md:text-left">{row.start_year || "-"}</span>
                    </td>
                    <td className="p-3 flex justify-between items-center md:table-cell border-b border-gray-100 md:border-none">
                      <span className="md:hidden font-semibold text-gray-600">End Year:</span>
                      <span className="text-right md:text-left">{row.end_year || "-"}</span>
                    </td>
                    <td className="p-3 flex justify-between items-center md:table-cell border-b border-gray-100 md:border-none">
                      <span className="md:hidden font-semibold text-gray-600">Status:</span>
                      <span className="text-right md:text-left">{row.status}</span>
                    </td>
                    <td className="p-3 flex justify-between items-center md:table-cell border-b border-gray-100 md:border-none capitalize">
                      <span className="md:hidden font-semibold text-gray-600">Approval:</span>
                      <span className="text-right md:text-left">{row.approval_status}</span>
                    </td>
                    <td className="p-3 flex justify-between items-center md:table-cell">
                      <span className="md:hidden font-semibold text-gray-600">Actions:</span>
                      <button
                        className="bg-red-600 hover:bg-red-700 transition text-white px-3 py-1 rounded disabled:bg-gray-400 text-xs sm:text-sm"
                        disabled={row.approval_status === "rejected"}
                        onClick={() =>
                          setRemoveState({
                            open: true,
                            educationId: row.id,
                            reason: "",
                          })
                        }
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal updated to match new styling */}
        {removeState.open && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-5 w-full max-w-md space-y-4 shadow-xl">
              <h2 className="text-lg font-semibold text-gray-800">
                Confirm removal
              </h2>
              <textarea
                className="border border-gray-300 rounded p-3 w-full focus:outline-none focus:ring-2 focus:ring-[#9bc87c]"
                rows={4}
                placeholder="Removal reason (required)"
                value={removeState.reason}
                onChange={(e) =>
                  setRemoveState((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
              />
              <div className="flex gap-3 justify-end mt-2">
                <button
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition"
                  onClick={() =>
                    setRemoveState({
                      open: false,
                      educationId: null,
                      reason: "",
                    })
                  }
                >
                  Cancel
                </button>
                <button
                  className={`px-4 py-2 text-white rounded transition ${
                    !removeState.reason.trim()
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                  onClick={handleRemove}
                  disabled={!removeState.reason.trim()}
                >
                  Confirm Remove
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default UniversityAllStudents;