import axios from "axios";
const BASE_URL=import.meta.env.VITE_BASE_URL;

export const getLastApplication = async (token) => {
  try {
    const res = await axios.get(
      `${BASE_URL}/application/last`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error fetching last application:", error);
    return null;
  }
};