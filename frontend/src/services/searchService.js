import api from './api';

const searchService = {
    searchItems: async (params) => {
        try {
            const response = await api.get('/search/items', { params });
            return response.data;
        } catch (error) {
            console.error('Error searching items:', error);
            throw error.response?.data || error.message;
        }
    },

    getCategories: async () => {
        try {
            const response = await api.get('/categories');
            return response.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error.response?.data || error.message;
        }
    }
};

export default searchService;
