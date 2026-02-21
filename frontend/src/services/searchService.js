import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const searchService = {
    searchItems: async (params) => {
        try {
            const response = await axios.get(`${API_URL}/search/items`, { params });
            return response.data;
        } catch (error) {
            console.error('Error searching items:', error);
            throw error.response?.data || error.message;
        }
    },

    getCategories: async () => {
        try {
            const response = await axios.get(`${API_URL}/categories`);
            return response.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error.response?.data || error.message;
        }
    }
};

export default searchService;
