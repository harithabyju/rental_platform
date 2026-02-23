const shopRepository = require('./shop.repository');

const registerShop = async (ownerId, shopData) => {
    const existing = await shopRepository.findShopByOwnerId(ownerId);
    if (existing) throw new Error('You already have a registered shop');
    return shopRepository.createShop(ownerId, shopData);
};

const getMyShop = async (ownerId) => {
    return shopRepository.findShopByOwnerId(ownerId);
};

const getAllShops = async (status) => {
    return shopRepository.getAllShops(status);
};

const approveShop = async (shopId, categoryIds = []) => {
    const shop = await shopRepository.updateShopStatus(shopId, 'approved');
    if (!shop) throw new Error('Shop not found');
    if (categoryIds.length > 0) {
        await shopRepository.setPermittedCategories(shopId, categoryIds);
    }
    return shop;
};

const rejectShop = async (shopId) => {
    const shop = await shopRepository.updateShopStatus(shopId, 'rejected');
    if (!shop) throw new Error('Shop not found');
    return shop;
};

const getPermittedCategories = async (ownerId) => {
    const shop = await shopRepository.findShopByOwnerId(ownerId);
    if (!shop) return [];
    return shopRepository.getPermittedCategories(shop.id || shop.shop_id);
};

module.exports = {
    registerShop,
    getMyShop,
    getAllShops,
    approveShop,
    rejectShop,
    getPermittedCategories,
};
