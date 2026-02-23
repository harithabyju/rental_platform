import api from './api';

const addItem = async (formData) => {
    // formData is a FormData object (supports image file upload)
    const response = await api.post('/items', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

const updateItem = async (id, formData) => {
    const response = await api.put(`/items/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};

const deleteItem = async (id) => {
    const response = await api.delete(`/items/${id}`);
    return response.data;
};

const getItemsByShop = async (shopId) => {
    const response = await api.get(`/items/shop/${shopId}`);
    return response.data;
};

const getItemById = async (id) => {
    const response = await api.get(`/items/${id}`);
    return response.data;
};

const getAllItems = async (params = {}) => {
    const response = await api.get('/items', { params });
    return response.data;
};

const itemService = {
    addItem,
    updateItem,
    deleteItem,
    getItemsByShop,
    getItemById,
    getAllItems,
};

export default itemService;
