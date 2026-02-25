import api from './api';

const createCategory = async (categoryData) => {
    const response = await api.post('/categories/admin', categoryData);
    return response.data;
};

const getAllCategories = async () => {
    const response = await api.get('/categories');
    return response.data;
};

const updateCategory = async (id, categoryData) => {
    const response = await api.put(`/categories/admin/${id}`, categoryData);
    return response.data;
};

const deleteCategory = async (id) => {
    const response = await api.delete(`/categories/admin/${id}`);
    return response.data;
};

export default {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
};
