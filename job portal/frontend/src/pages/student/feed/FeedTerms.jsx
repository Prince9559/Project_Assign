import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import FeedRightSidebar from "../feed/FeedRightSidebar";
import MainLayout from "../../../components/layout/MainLayout";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const FeedTerms = () => {
  const [termsData, setTermsData] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get token and user from Redux state
  const { token, isAuthenticated } = useSelector((state) => state.auth);

  const getTermsAndCondition = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/user-details/getterms_and_condition`, 
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error while getting terms and conditions", error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchTermsAndConditions = async () => {
      try {
        setLoading(true);

        if (!isAuthenticated || !token) {
          throw new Error("No authentication token found. Please login again.");
        }

        const response = await getTermsAndCondition();
        setTermsData(response.terms_and_condition); 
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

  return (
    <MainLayout>
      <div className="flex flex-col justify-center min-h-screen px-4 py-6 bg-gray-100 lg:flex-row lg:px-8">
        {/* Left Spacer (hidden on mobile) */}
        <div className="hidden lg:block lg:flex-grow"></div>

        {/* Main Content */}
        <section className="flex items-start justify-center w-full lg:w-auto lg:max-w-4xl">
          <div className="w-full max-w-4xl p-6 mx-auto bg-white shadow-lg rounded-xl lg:mx-0 lg:mr-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-800 md:text-3xl">
                Terms & Conditions
              </h1>
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
              ) : (
                <div className="whitespace-pre-wrap">
                  {termsData || (
                    <p className="italic text-gray-500">
                      No terms and conditions available at this time.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Sidebar (hidden on mobile & small screens) */}
        {/* <aside className="sticky hidden w-full max-w-xs p-2 mt-6 lg:block top-6 h-fit lg:mt-0">
          <FeedRightSidebar />
        </aside> */}

        {/* Right Spacer (hidden on mobile) */}
        <div className="hidden lg:block lg:flex-grow"></div>
      </div>
    </MainLayout>
  );
};

export default FeedTerms;