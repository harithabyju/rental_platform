import api from './api';

const registerShop = async (shopData) => {
    const response = await api.post('/shops/register', shopData);
    return response.data;
};

const getMyShop = async () => {
    const response = await api.get('/shops/my');
    return response.data;
};

const getShopById = async (id) => {
    const response = await api.get(`/shops/${id}`);
    return response.data;
};

const approveShopWithCategories = async (id, categoryIds = []) => {
    const response = await api.patch(`/admin/shops/approve/${id}`, { category_ids: categoryIds });
    return response.data;
};

const rejectShop = async (id) => {
    const response = await api.patch(`/admin/shops/reject/${id}`);
    return response.data;
};

const getAllShops = async (status) => {
    const response = await api.get('/admin/shops', { params: status ? { status } : {} });
    return response.data;
};

const getPermittedCategories = async () => {
    const response = await api.get('/shops/my/permitted-categories');
    return response.data;
};

const shopService = {
    registerShop,
    getMyShop,
    getShopById,
    approveShopWithCategories,
    rejectShop,
    getAllShops,
    getPermittedCategories,
};

export default shopService;
