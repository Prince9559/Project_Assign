//without detailed one
 import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { userDetailsApi } from "../api/userDetailsApi";

export const useProfileCompletion = (detailed = false) => {
  const { token } = useSelector((state) => state.auth);
  const [completionData, setCompletionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sections, setSections] = useState({})

  const fetchCompletion = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);
    try {
      const res = await userDetailsApi.getProfileCompletion(token, detailed);
      // API returns { success, data: { profile_completion_percentage, breakdown? } }
      const envelope = res?.data ?? res;
      const inner = envelope?.data ?? envelope;
      setCompletionData(inner || null);
      setSections(inner?.sections || {});
    } catch (err) {
      console.error("Failed to fetch profile completion:", err);
      setError(err.message || "Failed to load completion data");
    } finally {
      setLoading(false);
    }
  }, [token, detailed]);

  useEffect(() => {
    fetchCompletion();
  }, [fetchCompletion]);

  return {
    completionData,
    percentage: completionData?.profile_completion_percentage ?? 0,
    sections,
    breakdown: completionData?.breakdown ?? null,
    loading,
    error,
    refetch: fetchCompletion,
  };
};



// // src/hooks/useProfileCompletion.js
// import { useState, useCallback } from "react";
// import { useSelector } from "react-redux";
// import { userDetailsApi } from "../api/userDetailsApi";

// export const useProfileCompletion = () => {
//   const { token } = useSelector((state) => state.auth);

//   // Simple percentage
//   const [percentage, setPercentage] = useState(0);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // Detailed breakdown (lazy-loaded)
//   const [breakdown, setBreakdown] = useState(null);
//   const [detailedLoading, setDetailedLoading] = useState(false);

//   // Fetch simple percentage
//   const fetchPercentage = useCallback(async () => {
//     if (!token) return;
//     setLoading(true);
//     setError(null);
//     try {
//       const data = await userDetailsApi.getProfileCompletion(token,false);
//       setPercentage(data.data.profile_completion_percentage || 0);
//       return data.data.profile_completion_percentage;
//     } catch (err) {
//       setError("Failed to load completion status");
//     } finally {
//       setLoading(false);
//     }
//   }, [token]);

//   // Fetch detailed breakdown (for modal/expand)
//   const fetchDetailed = useCallback(async () => {
//     if (!token) return;
//     setDetailedLoading(true);
//     try {
//       const data = await userDetailsApi.getProfileCompletion(token,true);
//       setPercentage(data.data.profile_completion_percentage || 0);
//       setBreakdown(data.data.breakdown || null);
//       return data.data.breakdown;
//     } catch (err) {
//       console.error("Failed to fetch detailed completion:", err);
//       setError("Failed to load profile details");
//     } finally {
//       setDetailedLoading(false);
//     }
//   }, [token]);

//   return {
//     percentage,
//     loading,
//     error,
//     breakdown,
//     detailedLoading,
//     fetchPercentage,
//     fetchDetailed,
//   };
// };