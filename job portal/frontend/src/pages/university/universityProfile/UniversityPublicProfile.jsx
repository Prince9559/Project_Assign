import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import MainLayout from "../../../components/layout/MainLayout";
import { userDetailsApi } from "../../../api/userDetailsApi";
import { Loader2 } from "lucide-react";

/**
 * University entry for the feed-style public profile: shows profile completion,
 * then opens the same view as students/companies at `/public-profile/:uuid`.
 */
export default function UniversityPublicProfile() {
  const { user, token } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [completionPct, setCompletionPct] = useState(null);
  const [loadingCompletion, setLoadingCompletion] = useState(true);
  const [completionError, setCompletionError] = useState("");

  useEffect(() => {
    if (!token) {
      setLoadingCompletion(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        setLoadingCompletion(true);
        setCompletionError("");
        const res = await userDetailsApi.getProfileCompletion(token, false);
        const pct = res?.data?.profile_completion_percentage ?? res?.profile_completion_percentage;
        if (!cancelled) {
          setCompletionPct(
            typeof pct === "number" && !Number.isNaN(pct) ? Math.min(100, Math.max(0, pct)) : 0
          );
        }
      } catch {
        if (!cancelled) {
          setCompletionError("Could not load profile completion.");
          setCompletionPct(null);
        }
      } finally {
        if (!cancelled) setLoadingCompletion(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!user?.uuid) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen px-4 bg-gray-100">
          <p className="text-sm text-gray-600">
            Public profile is unavailable (missing account id).
          </p>
        </div>
      </MainLayout>
    );
  }

  const pct = completionPct ?? 0;

  return (
    <MainLayout>
      <div className="flex justify-center min-h-screen px-4 py-8 bg-gray-100">
        <div className="w-full max-w-lg p-6 space-y-6 bg-white shadow-md rounded-xl">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Public profile</h1>
            <p className="mt-1 text-sm text-gray-500">
              Preview how your profile appears to others, and see completion status.
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <p className="text-sm font-medium text-gray-700">Profile completion</p>
            {loadingCompletion ? (
              <div className="flex items-center gap-2 mt-3 text-gray-600">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                <span className="text-sm">Loading…</span>
              </div>
            ) : completionError ? (
              <p className="mt-2 text-sm text-red-600">{completionError}</p>
            ) : (
              <>
                <p className="mt-2 text-3xl font-bold text-gray-900">{pct}%</p>
                <div className="w-full h-2 mt-3 overflow-hidden bg-gray-200 rounded-full">
                  <div
                    className="h-full transition-all duration-300 bg-blue-600 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate(`/public-profile/${user.uuid}`)}
            className="w-full py-2.5 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            View public profile
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
