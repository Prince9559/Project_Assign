import axios from "axios";
 
const BASE_URL = import.meta.env.VITE_BASE_URL;
 
// Debounce utility
function debounceAsync(fn, delay) {
  let timeoutId = null;
  let lastPromise = null;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    return new Promise((resolve, reject) => {
      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      }, delay);
    });
  };
}
 
async function _searchSkills(search, domain_id = null) {
  if (!search || search.trim().length < 3) {
    return [];
  }
  try {
    const params = { search };
    if (domain_id) params.domain_id = domain_id;
    const response = await axios.get(`${BASE_URL}/master/skill/search`, { params });
    return response.data?.data || [];
  } catch (error) {
    console.error("Error searching skills:", error);
    return [];
  }
}
 
export const skillSearchApi = {
  // Debounced search (400ms)
  searchSkills: debounceAsync(_searchSkills, 400),
};