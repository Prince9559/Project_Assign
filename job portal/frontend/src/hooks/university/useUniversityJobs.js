
// import { useState, useEffect, useRef } from "react";
// import { getUniversityJobs } from "../../api/universityy"; // keep as-is

// export const useUniversityJobs = () => {
//   const [jobs, setJobs] = useState([]);
//   const [loading, setLoading] = useState(true); // initial load
//   const [error, setError] = useState(null);
//   const [hasMore, setHasMore] = useState(true);
//   const [page, setPage] = useState(1);

//   const observer = useRef();
//   const lastJobRef = useRef(null);

//   // 🔧 Extract fetching logic to avoid guard issues
//   const fetchJobs = async (pageNum) => {
//     try {
//       const data = await getUniversityJobs({ page: pageNum });
//       const newJobs = data.data || [];
//       return {
//         jobs: newJobs,
//         hasNext: data.pagination?.hasNext || false,
//       };
//     } catch (err) {
//       throw err;
//     }
//   };

//   // 🔁 Initial load (page 1)
//   const loadInitial = async () => {
//     setLoading(true); // ensure loading = true during fetch
//     setError(null);
//     try {
//       const { jobs: newJobs, hasNext } = await fetchJobs(1);
//       setJobs(newJobs);
//       setHasMore(hasNext);
//       setPage(2);
//     } catch (err) {
//       console.error("Failed to load jobs:", err);
//       setError(err.message || "Failed to load jobs");
//     } finally {
//       setLoading(false); // now loading becomes false
//     }
//   };

//   //  Load more (page 2+)
//   const loadNext = async () => {
//     if (loading || !hasMore) return; // safe guard here is fine (after initial)
//     setLoading(true);
//     try {
//       const { jobs: newJobs, hasNext } = await fetchJobs(page);
//       setJobs((prev) => [...prev, ...newJobs]);
//       setHasMore(hasNext);
//       setPage((p) => p + 1);
//     } catch (err) {
//       setError(err.message || "Failed to load more jobs");
//     } finally {
//       setLoading(false);
//     }
//   };

//   //  Trigger initial load
//   useEffect(() => {
//     loadInitial();
//   }, []);

//   //  Infinite scroll
//   useEffect(() => {
//     if (loading || !hasMore) return;

//     const observerInstance = new IntersectionObserver(
//       (entries) => {
//         if (entries[0].isIntersecting) {
//           loadNext();
//         }
//       },
//       { threshold: 1.0 }
//     );

//     if (lastJobRef.current) {
//       observerInstance.observe(lastJobRef.current);
//     }

//     return () => observerInstance.disconnect();
//   }, [loading, hasMore, page]); // include page to refresh observer if needed

//   const refetch = () => {
//     setJobs([]);
//     setHasMore(true);
//     setPage(1);
//     loadInitial();
//   };

//   return {
//     jobs,
//     loading: loading && jobs.length === 0, // initial skeleton
//     loadingMore: loading && jobs.length > 0, // "loading more" spinner
//     error,
//     hasMore,
//     refetch,
//     lastJobRef,
//   };
// };





import { useState, useEffect, useRef, useCallback } from "react";
import { getUniversityJobs } from "../../api/universityy";

// Accept optional `filters` object
export const useUniversityJobs = (filters = {}) => {
  const [jobs, setJobs] = useState([]);
  const [targetedSummary, setTargetedSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const lastJobRef = useRef(null);

  // 🔑 Create stable dependency key for filters (simple & safe)
  const filtersKey = JSON.stringify(filters);

  // 🔧 Fetch jobs for a given page & filters
  const fetchJobs = useCallback(
    async (pageNum) => {
        // 🔧 Inside `fetchJobs`, before calling `getUniversityJobs`:
        const serializedFilters = {
          ...filters,
          targetedOnly: filters.targetedOnly ? "1" : undefined, // ← critical fix
          minSalary: filters.minSalary ? filters.minSalary : undefined,
          // Ensure empty arrays become undefined (backend may ignore [])
          jobProfile: filters.jobProfile.length
            ? filters.jobProfile
            : undefined,
          location: filters.location.length ? filters.location : undefined,
          company: filters.company.length ? filters.company : undefined,
          opportunityType: filters.opportunityType.length
            ? filters.opportunityType
            : undefined,
          jobType: filters.jobType.length ? filters.jobType : undefined,
        };


        //  Pass filters along with page
        const data = await getUniversityJobs({ page: pageNum, ...serializedFilters });
        const newJobs = data.data || [];
        
        return {
          jobs: newJobs,
          hasNext: data.pagination?.hasNext || false,
          summary: data.summary || null,
        };
     
    },
    [filters] 
  );

  // 🔁 Load page 1 (initial or after filter change)
  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { jobs: newJobs, hasNext, summary } = await fetchJobs(1);
      setJobs(newJobs);
      setTargetedSummary(summary);
      setHasMore(hasNext);
      setPage(2);
    } catch (err) {
      console.error("Failed to load jobs:", err);
      setError(err.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [fetchJobs]); // Runs when `fetchJobs` changes → i.e., when `filters` change

  //  Load next page (2+)
  const loadNext = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    try {
      const { jobs: newJobs, hasNext } = await fetchJobs(page);
      setJobs((prev) => [...prev, ...newJobs]);
      setHasMore(hasNext);
      setPage((p) => p + 1);
    } catch (err) {
      setError(err.message || "Failed to load more jobs");
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, fetchJobs]); // include `fetchJobs` to avoid stale closure

  // 🚀 Reload on filter change (via `filtersKey`)
  useEffect(() => {
    loadInitial();
  }, [filtersKey, loadInitial]);

  // 📜 Infinite scroll observer
  useEffect(() => {
    if (loading || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadNext();
        }
      },
      { threshold: 1.0 }
    );

    if (lastJobRef.current) {
      observer.observe(lastJobRef.current);
    }

    return () => observer.disconnect();
  }, [loading, hasMore, loadNext]);

  const refetch = useCallback(() => {
    setJobs([]);
    setHasMore(true);
    setPage(1);
    loadInitial();
  }, [loadInitial]);

  return {
    jobs,
    targetedSummary,
    loading: loading && jobs.length === 0,
    loadingMore: loading && jobs.length > 0,
    error,
    hasMore,
    refetch,
    lastJobRef,
  };
};