const shopRepository = require('./shop.repository');

const registerShop = async (shopData) => {
    const existingShop = await shopRepository.findShopByOwnerId(shopData.owner_id);
    if (existingShop) {
        throw new Error('User already has a shop registered');
    }
    return await shopRepository.createShop(shopData);
};

const getMyShop = async (userId) => {
    const shop = await shopRepository.findShopByOwnerId(userId);
    if (!shop) {
        throw new Error('Shop not found');
    }
    return shop;
};

const getShopById = async (shopId) => {
    const shop = await shopRepository.findShopById(shopId);
    if (!shop) {
        throw new Error('Shop not found');
    }
    return shop;
};

const approveShop = async (shopId) => {
    const shop = await shopRepository.findShopById(shopId);
    if (!shop) {
        throw new Error('Shop not found');
    }
    return await shopRepository.updateShopStatus(shopId, 'approved');
};

const rejectShop = async (shopId) => {
    const shop = await shopRepository.findShopById(shopId);
    if (!shop) {
        throw new Error('Shop not found');
    }
    return await shopRepository.updateShopStatus(shopId, 'rejected');
};

const getAllShops = async (status) => {
    return await shopRepository.getAllShops(status);
};

module.exports = {
    registerShop,
    getMyShop,
    getShopById,
    approveShop,
    rejectShop,
    getAllShops
};
