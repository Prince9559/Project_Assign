import axios from 'axios';
const BASE_URL = import.meta.env.VITE_BASE_URL;

export const languageService = {
  searchLanguages: async (search) => {
    if (!search || search.length < 3) return [];
    try {
      const response = await axios.get(`${BASE_URL}/master/language/search`, {
        params: { search },
      });
      return response.data.data || [];
    } catch (error) {
      console.error('Error searching languages:', error);
      return [];
    }
  },
};
