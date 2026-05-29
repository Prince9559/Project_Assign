
import { useState, useEffect } from 'react';
import {userDetailsApi} from '../api/userDetailsApi'; 

const useResumeData = (userId, token) => {
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId || !token) {
      setLoading(false);
      return;
    }

    const fetchResumeData = async () => {
      try {
        setLoading(true);
        const data = await userDetailsApi.getResumeData(userId, token);
        setResumeData(data);
      } catch (err) {
        console.error("Failed to load resume data:", err);
        setError(err);
        //sending blank if no data
        setResumeData({});
      } finally {
        setLoading(false);
      }
    };

    fetchResumeData();
  }, [userId, token]);

  return { resumeData, loading, error };
};

export default useResumeData;