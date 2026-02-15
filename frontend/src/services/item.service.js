import api from './api';

const addItem = async (itemData) => {
    const response = await api.post('/items', itemData);
    return response.data;
};

const updateItem = async (id, itemData) => {
    const response = await api.put(`/items/${id}`, itemData);
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

const itemService = {
    addItem,
    updateItem,
    deleteItem,
    getItemsByShop,
    getItemById
};

export default itemService;
