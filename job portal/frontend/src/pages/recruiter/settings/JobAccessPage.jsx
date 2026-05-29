// src/pages/recruiter/settings/JobAccessPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import SettingsLayout from "../../../components/settings/SettingsLayout";
import {
  getTeamMembers,
  getCompanyJobs,
  assignJobAccess,
  updateJobAccess,
  removeJobAccess,
  getJobAccess,
} from "../../../api/teamApi";
import { RoleBadge } from "../../../components/ui/RoleBadge";
import { FaEye, FaEdit, FaToolbox, FaTrash, FaCheckCircle, FaSync } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const JobAccessPage = () => {
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [accessList, setAccessList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Single form state — no tab complexity
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState("");
  const [accessLevel, setAccessLevel] = useState("view");

  // Permission check
  const canManage = user?.permissions?.includes("job.assign");

  // Load data
  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [memRes, jobsRes] = await Promise.all([getTeamMembers(), getCompanyJobs()]);
      setMembers(memRes.data.members || []);
      setJobs(jobsRes.data.jobs || []);
    } catch (err) {
      toast.error("Failed to load team or jobs.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Load access for selected job
  const loadAccess = useCallback(async (jobId) => {
    if (!jobId) {
      setAccessList([]);
      return;
    }
    try {
      const res = await getJobAccess(jobId);
      setAccessList(res.data.access || []);
    } catch (err) {
      setAccessList([]); // safe fallback
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Refresh access when job changes
  useEffect(() => {
    loadAccess(selectedJobId);
  }, [selectedJobId, loadAccess]);

  // Helpers
  const getMember = (id) => members.find((m) => m.userId === id);
  const getJob = (id) => jobs.find((j) => j.job_id === id);

  const getAccessLabel = (level) => {
    const map = {
      view: { label: "View", icon: <FaEye />, color: "bg-blue-100 text-blue-800" },
      edit: { label: "Edit", icon: <FaEdit />, color: "bg-yellow-100 text-yellow-800" },
      manage: { label: "Manage", icon: <FaToolbox />, color: "bg-green-100 text-green-800" },
    };
    return map[level] || map.view;
  };

  // Submit: assign or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJobId || !selectedMemberId) {
      return toast.error("Please select a job and a team member.");
    }

    try {
      setSubmitting(true);

      const isUpdate = accessList.some((a) => a.userId === selectedMemberId);

      if (isUpdate) {
        await updateJobAccess(selectedJobId, selectedMemberId, accessLevel);
        toast.success(` Updated access for ${getMember(selectedMemberId)?.name}`);
      } else {
        await assignJobAccess(selectedJobId, selectedMemberId, accessLevel);
        toast.success(` Granted ${accessLevel} access to ${getMember(selectedMemberId)?.name}`);
      }

      await loadAccess(selectedJobId); // refresh
    } catch (err) {
      const msg = err.response?.data?.message || "Operation failed.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Revoke
  const handleRevoke = async (userId) => {
    if (!selectedJobId) return;
    if (!window.confirm("Revoke this member’s access to the job?")) return;

    try {
      await removeJobAccess(selectedJobId, userId);
      toast.success(" Access revoked.");
      await loadAccess(selectedJobId);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to revoke access.");
    }
  };

  // Permission guard
  if (!canManage) {
    return (
      <SettingsLayout>
        <div className="max-w-2xl mx-auto mt-16 text-center p-6 bg-gray-50 rounded-lg border">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800">Access Denied</h2>
          <p className="mt-2 text-gray-600">
            You don’t have permission to manage job access.
          </p>
        </div>
      </SettingsLayout>
    );
  }

  if (loading) {
    return (
      <SettingsLayout>
        <div className="text-center py-20">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-red-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Job Access</h1>
          <p className="text-gray-600">Assign or revoke job access for your team.</p>
        </div>

        {members.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-lg border text-center">
            <p className="text-gray-700 mb-4">No team members yet.</p>
            <button
              onClick={() => navigate("/recruiter/settings/team")}
              className="inline-flex items-center gap-2 px-5 py-2.5 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>👥</span> Add Team Member
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-gray-50 p-6 rounded-lg border text-center">
            <p className="text-gray-700 mb-4">No jobs posted yet.</p>
            <button
              onClick={() => navigate("/recruiter-post-opportunity-selector")}
              className="inline-flex items-center gap-2 px-6 py-2.5 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-transform hover:scale-[1.02]"
            >
              <span>➕</span> Post Job Now
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Selector + Form */}
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="font-semibold text-gray-800 mb-4">Grant Access</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Job */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job</label>
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full p-2.5 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">— Select a job —</option>
                    {jobs.map((job) => (
                      <option key={job.job_id} value={job.job_id}>
                        {job.JobRole?.title || "Untitled"} • {job.opportunity_type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Member */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team Member</label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full p-2.5 border rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  >
                    <option value="">— Select a member —</option>
                    {members
                      .filter((m) => !m.isOwner)
                      .map((m) => (
                        <option key={m.userId} value={m.userId}>
                          {m.name} • {m.roleName}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Access Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Access Level
                  </label>
                  <div className="flex gap-2">
                    {["view", "edit", "manage"].map((level) => {
                      const { label, icon } = getAccessLabel(level);
                      return (
                        <label
                          key={level}
                          className={`flex-1 flex flex-col items-center justify-center p-3 border rounded cursor-pointer ${
                            accessLevel === level
                              ? "border-red-500 bg-red-50"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            name="level"
                            value={level}
                            checked={accessLevel === level}
                            onChange={() => setAccessLevel(level)}
                            className="sr-only"
                          />
                          <span className="text-lg mb-1">{icon}</span>
                          <span className="text-sm font-medium">{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting || !selectedJobId || !selectedMemberId}
                  className="w-full bg-red-500 hover:bg-red-600 text-white py-2.5 rounded font-medium flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <FaSync className="animate-spin" />
                      Processing...
                    </>
                  ) : accessList.some((a) => a.userId === selectedMemberId) ? (
                    "Update Access"
                  ) : (
                    <>
                      <FaCheckCircle />
                      Grant Access
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Current Access List */}
            <div className="bg-white p-6 rounded-lg border">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-gray-800">
                  Current Access ({accessList.length})
                </h2>
                {selectedJobId && (
                  <span className="text-sm text-gray-500">
                    for: {getJob(selectedJobId)?.JobRole?.title || "—"}
                  </span>
                )}
              </div>

              {selectedJobId ? (
                accessList.length === 0 ? (
                  <p className="text-gray-500 italic">No access granted yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {accessList.map((a) => {
                      const member = getMember(a.userId);
                      const { label, icon, color } = getAccessLabel(a.accessLevel);
                      return (
                        <li
                          key={a.id}
                          className="flex items-center justify-between p-3 border rounded bg-gray-50"
                        >
                          <div>
                            <div className="font-medium text-gray-900">{a.name}</div>
                            <div className="text-sm text-gray-600">
                              {member?.roleName} • {a.email}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${color}`}>
                              {icon}
                              <span className="ml-1">{label}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRevoke(a.userId)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Revoke access"
                            >
                              <FaTrash size={16} />
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )
              ) : (
                <p className="text-gray-500">Select a job above to see its access list.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </SettingsLayout>
  );
};

export default JobAccessPage;