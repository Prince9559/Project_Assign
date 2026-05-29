import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { useSelector } from "react-redux";
import { recruiterApi } from "../../../api/recruiterApi";

const RecruiterAllEmployees = () => {
  const { token } = useSelector((state) => state.auth);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");
  const [removeState, setRemoveState] = useState({
    open: false,
    experienceId: null,
    reason: "",
  });

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await recruiterApi.getAllEmployees(token);
      setRows(response?.data || []);
    } catch (error) {
      console.error("Failed to load employees:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadEmployees();
  }, [token]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch = row.employee_name
        ?.toLowerCase()
        .includes(search.toLowerCase());
      const matchesEmployeeType =
        employeeFilter === "all" || row.status === employeeFilter;
      const matchesApproval =
        approvalFilter === "all" || row.approval_status === approvalFilter;
      return matchesSearch && matchesEmployeeType && matchesApproval;
    });
  }, [rows, search, employeeFilter, approvalFilter]);

  const handleRemove = async () => {
    if (!removeState.reason.trim()) return;
    await recruiterApi.removeEmployee(
      {
        experience_id: removeState.experienceId,
        removal_reason: removeState.reason.trim(),
      },
      token
    );
    setRemoveState({ open: false, experienceId: null, reason: "" });
    loadEmployees();
  };

  return (
    <MainLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Company Dashboard - All Employees</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <input
            className="border rounded p-2"
            placeholder="Search by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="border rounded p-2" value={employeeFilter} onChange={(e) => setEmployeeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="Current Employee">Current Employee</option>
            <option value="Past Employee">Past Employee</option>
          </select>
          <select className="border rounded p-2" value={approvalFilter} onChange={(e) => setApprovalFilter(e.target.value)}>
            <option value="all">All Approvals</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="bg-blue-600 text-white rounded p-2" onClick={loadEmployees}>Refresh</button>
        </div>

        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Employee Name</th>
                <th className="p-3 text-left">Role</th>
                <th className="p-3 text-left">Start Year</th>
                <th className="p-3 text-left">End Year</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Approval</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-4" colSpan={7}>Loading...</td></tr>
              ) : filteredRows.length === 0 ? (
                <tr><td className="p-4" colSpan={7}>No employees found.</td></tr>
              ) : (
                filteredRows.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="p-3">{row.employee_name}</td>
                    <td className="p-3">{row.role}</td>
                    <td className="p-3">{row.start_year || "-"}</td>
                    <td className="p-3">{row.end_year || "-"}</td>
                    <td className="p-3">{row.status}</td>
                    <td className="p-3 capitalize">{row.approval_status}</td>
                    <td className="p-3">
                      <button
                        className="bg-red-600 text-white px-3 py-1 rounded disabled:bg-gray-400"
                        disabled={row.approval_status === "rejected"}
                        onClick={() =>
                          setRemoveState({
                            open: true,
                            experienceId: row.id,
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

        {removeState.open && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded p-4 w-full max-w-md space-y-3">
              <h2 className="text-lg font-semibold">Confirm removal</h2>
              <textarea
                className="border rounded p-2 w-full"
                rows={4}
                placeholder="Removal reason (required)"
                value={removeState.reason}
                onChange={(e) => setRemoveState((prev) => ({ ...prev, reason: e.target.value }))}
              />
              <div className="flex gap-2 justify-end">
                <button className="px-3 py-1 border rounded" onClick={() => setRemoveState({ open: false, experienceId: null, reason: "" })}>Cancel</button>
                <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={handleRemove}>Confirm Remove</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RecruiterAllEmployees;
