import api from './api';

const createCategory = async (categoryData) => {
    const response = await api.post('/admin/categories', categoryData);
    return response.data;
};

const getAllCategories = async () => {
    const response = await api.get('/categories');
    return response.data;
};

const updateCategory = async (id, categoryData) => {
    const response = await api.put(`/admin/categories/${id}`, categoryData);
    return response.data;
};

const deleteCategory = async (id) => {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
};

export default {
    createCategory,
    getAllCategories,
    updateCategory,
    deleteCategory,
};
