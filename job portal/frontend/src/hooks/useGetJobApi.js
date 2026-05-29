import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { jobGetApi } from "../api/jobGetApi";

// export const useGetJobApi = () => {
//   const [allJobs, setAllJobs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const { token } = useSelector((state) => state.auth);

//   useEffect(() => {
//     const fetchAllJobs = async () => {
//       if (!token) return;

//       const response = await jobGetApi.getAllJobs(token);
//       setAllJobs(response.data || response);
//     };
//     fetchAllJobs();
//   }, [token]);

//   const refetch = async () => {
//     if (!token) return;

//     try {
//       setLoading(true);
//       setError(null);
//       const response = await jobGetApi.getAllJobs(token);
//       setAllJobs(response.data || response);
//     } catch (error) {
//       setError("Failed to reload jobs. Please try again later.");
//       console.log("Failed to reload jobs", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return {
//     allJobs,
//     loading,
//     error,
//     refetch,
//   };
// };

//pagination with filters
// export const useGetJobApi = (initialFilters = {}) => {
//   const [allJobs, setAllJobs] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [pagination, setPagination] = useState(null);
//   const { token } = useSelector((state) => state.auth);

//   //Enhanced fetch function that accepts filters
//   const fetchJobs = useCallback(
//     async (filters = {}) => {
//       if (!token) return;

//       try {
//         setLoading(true);
//         setError(null);

//         const response = await jobGetApi.getAllJobs(token, filters);
//         setAllJobs(response.data || []);
//         setPagination(response.pagination || null);
//       } catch (err) {
//         setError("Failed to load jobs. Please try again.");
//         console.error("Error fetching jobs:", err);
//         setAllJobs([]);
//         setPagination(null);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [token]
//   );

//   // Initial load — with optional initial filters
//   useEffect(() => {
//     fetchJobs(initialFilters);
//   }, [fetchJobs, JSON.stringify(initialFilters)]); // safe to stringify simple filters

//   //refetch function that accepts filters
//   const refetch = (newFilters = {}) => {
//     fetchJobs(newFilters);
//   };

//   return {
//     allJobs,
//     loading,
//     error,
//     pagination,
//     refetch,
//   };
// };



//lazy loading 
export const useGetJobApi = (initialFilters = {}) => {
  const [allJobs, setAllJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  const { token } = useSelector((state) => state.auth);

  //Enhanced fetch function that accepts filters and lazy loadding
  const fetchJobs = useCallback(
    async (filters = {}) => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);

        const response = await jobGetApi.getAllJobs(token, filters);

        // If offset > 0 → append, else replace
        const shouldAppend = filters.offset > 0;
        setAllJobs((prev) =>
          shouldAppend ? [...prev, ...response.data] : response.data
        );
        setPagination(response.pagination || null);
      } catch (err) {
        setError("Failed to load jobs. Please try again.");
        console.error("Error fetching jobs:", err);
        if (filters.offset === 0) {
          setAllJobs([]);
          setPagination(null);
        }
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  // Initial load — with optional initial filters
  useEffect(() => {
    fetchJobs(initialFilters);
  }, [fetchJobs, JSON.stringify(initialFilters)]); // safe to stringify simple filters

  //refetch function that accepts filters
  const refetch = (newFilters = {}) => {
    fetchJobs(newFilters);
  };

  return {
    allJobs,
    loading,
    error,
    pagination,
    refetch,
  };
};

export const useGetJobById = (job_id) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchJobById = async () => {
      if (!job_id || !token) return;

      try {
        setLoading(true);
        setError(null);
        const response = await jobGetApi.getJobById(job_id, token);
        setJob(response);
      } catch (error) {
        setError(
          `Failed to load job details: ${error.response?.data?.message || error.message
          }`
        );
      } finally {
        setLoading(false);
      }
    };
    fetchJobById();
  }, [job_id, token]);

  const refetch = async () => {
    if (!job_id || !token) return;

    try {
      setLoading(true);
      setError(null);
      const response = await jobGetApi.getJobById(job_id, token);
      setJob(response.data || response);
    } catch (error) {
      setError("Failed to reload job details. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return {
    job,
    loading,
    error,
    refetch,
  };
};
