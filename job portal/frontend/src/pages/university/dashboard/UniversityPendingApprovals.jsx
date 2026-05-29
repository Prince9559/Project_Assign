import React, { useEffect, useState } from "react";
import MainLayout from "../../../components/layout/MainLayout";
import { useSelector } from "react-redux";
import { universityApi } from "../../../api/university/universityApi";
import { getImageUrl } from "../../../../utils";

const UniversityPendingApprovals = () => {
  const { token } = useSelector((state) => state.auth);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadRows = async () => {
    try {
      setLoading(true);
      const response = await universityApi.getPendingApprovals(token);
      setRows(response?.data || []);
    } catch (error) {
      console.error("Failed to load pending approvals:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadRows();
  }, [token]);

  const onApprove = async (educationId) => {
    await universityApi.approveStudent({ education_id: educationId }, token);
    loadRows();
  };

  const onReject = async (educationId) => {
    await universityApi.rejectStudent({ education_id: educationId }, token);
    loadRows();
  };

  return (
    <MainLayout>
      <div className="p-6 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold mb-4">University - Pending Student Approvals</h1>
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">Student Name</th>
                <th className="p-3 text-left">Course</th>
                <th className="p-3 text-left">Proof Document</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-4" colSpan={4}>Loading...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td className="p-4" colSpan={4}>No pending approvals.</td></tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-t">
                    <td className="p-3">{row.student_name}</td>
                    <td className="p-3">{row.course}</td>
                    <td className="p-3">
                      {row.proof_document ? (
                        <a className="text-blue-600 underline" href={getImageUrl(row.proof_document)} target="_blank" rel="noreferrer">
                          View Proof
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="p-3 flex gap-2">
                      <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => onApprove(row.id)}>Approve</button>
                      <button className="bg-red-600 text-white px-3 py-1 rounded" onClick={() => onReject(row.id)}>Reject</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
};

export default UniversityPendingApprovals;
