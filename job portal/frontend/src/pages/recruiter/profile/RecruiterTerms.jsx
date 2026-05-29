import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import RecruiterRightSidebarWithJobPost from "./RecruiterRightSidebarWithJobPost";
import MainLayout from "../../../components/layout/MainLayout";
import termsApi from "../../../api/termsApi";

const RecruiterTerms = () => {
  const [termsData, setTermsData] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Get token and user from Redux state
  const { token, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchTermsAndConditions = async () => {
      try {
        setLoading(true);

        if (!isAuthenticated || !token) {
          throw new Error("No authentication token found. Please login again.");
        }

        const response = await termsApi.getTermsAndCondition();
        setTermsData(response.terms_and_condition);
        setEditData(response.terms_and_condition);
        setError(null);
      } catch (err) {
        console.error("Error fetching terms and conditions:", err);
        setError(
          err.message ||
            "Failed to load terms and conditions. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTermsAndConditions();
  }, [token, isAuthenticated]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(termsData);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(termsData);
    setSaveError(null);
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      if (!isAuthenticated || !token) {
        throw new Error("No authentication token found. Please login again.");
      }

      // Clean and validate the data
      const cleanData = editData.trim();
      if (!cleanData) {
        throw new Error("Terms and conditions content cannot be empty.");
      }

      // Get user ID from Redux state
      const user_id = user?.id;

      if (!user_id) {
        throw new Error("User ID not found. Please login again.");
      }

      const response = await termsApi.updateTermsAndCondition(
        {
          user_id: user_id,
          accepted: true,
        },
        token
      );

      setTermsData(cleanData);
      setIsEditing(false);
      setSaveSuccess(true);

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("Error updating terms and conditions:", err);

      let errorMessage =
        "Failed to update terms and conditions. Please try again.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setSaveError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col justify-center min-h-screen px-4 py-6 bg-gray-100 lg:flex-row lg:px-8">
        {/* Left Spacer (Desktop Only) */}
        <div className="hidden lg:block lg:flex-grow"></div>

        {/* Main Content */}
        <section className="w-full lg:w-auto lg:max-w-4xl">
          <div className="w-full p-6 mx-auto bg-white shadow-lg rounded-xl lg:mx-0 lg:mr-6">
            <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                Terms & Conditions
              </h1>
              {!loading && !error && !isEditing && (
                <button
                  onClick={handleEdit}
                  className="px-5 py-2.5 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Edit
                </button>
              )}
            </div>

            <div className="space-y-4 text-sm md:text-base leading-relaxed text-gray-700 max-h-[70vh] lg:max-h-[80vh] overflow-y-auto pr-2">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-10 h-10 border-b-2 border-blue-600 rounded-full animate-spin"></div>
                  <span className="mt-4 text-center text-gray-600">
                    Loading terms and conditions...
                  </span>
                </div>
              ) : error ? (
                <div className="py-12 text-center">
                  <div className="mb-2 text-3xl text-red-600">⚠️</div>
                  <p className="mb-4 font-medium text-red-600">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-5 py-2.5 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    Try Again
                  </button>
                </div>
              ) : isEditing ? (
                <div className="space-y-4">
                  {saveSuccess && (
                    <div className="px-4 py-3 text-green-700 bg-green-100 border border-green-400 rounded-lg">
                       Terms and conditions updated successfully!
                    </div>
                  )}
                  {saveError && (
                    <div className="px-4 py-3 text-red-700 bg-red-100 border border-red-400 rounded-lg">
                       {saveError}
                    </div>
                  )}
                  <textarea
                    value={editData}
                    onChange={(e) => setEditData(e.target.value)}
                    className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none md:h-96 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter terms and conditions content..."
                  />
                  <div className="flex flex-col justify-end gap-3 mt-4 sm:flex-row">
                    <button
                      onClick={handleCancel}
                      disabled={saving}
                      className="px-5 py-2.5 text-white transition-colors bg-gray-500 rounded-lg hover:bg-gray-600 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center justify-center px-5 py-2.5 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {saving ? (
                        <>
                          <div className="w-4 h-4 mr-2 border-b-2 border-white rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="whitespace-pre-wrap">
                  {termsData || (
                    <p className="italic text-gray-500">
                      No terms and conditions available.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Sidebar (Desktop Only) */}
        <aside className="sticky hidden w-full max-w-xs p-2 mt-6 lg:block top-6 h-fit lg:mt-0">
          <RecruiterRightSidebarWithJobPost />
        </aside>

        {/* Right Spacer (Desktop Only) */}
        <div className="hidden lg:block lg:flex-grow"></div>
      </div>
    </MainLayout>
  );
};

export default RecruiterTerms;