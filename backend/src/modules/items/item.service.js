const itemRepository = require('./item.repository');
const shopRepository = require('../shops/shop.repository');

const addItem = async (userId, itemData) => {
    // Check if user owns the shop
    const shop = await shopRepository.findShopByOwnerId(userId);
    if (!shop) {
        throw new Error('You need to register a shop first');
    }
    if (shop.status !== 'approved') {
        throw new Error('Your shop is not approved yet');
    }

    return await itemRepository.createItem({ ...itemData, shop_id: shop.shop_id });
};

const updateItem = async (userId, itemId, itemData) => {
    const item = await itemRepository.findItemById(itemId);
    if (!item) {
        throw new Error('Item not found');
    }

    // Check ownership
    const shop = await shopRepository.findShopByOwnerId(userId);
    if (!shop || shop.shop_id !== item.shop_id) {
        throw new Error('Unauthorized');
    }

    return await itemRepository.updateItem(itemId, itemData);
};

const deleteItem = async (userId, itemId) => {
    const item = await itemRepository.findItemById(itemId);
    if (!item) {
        throw new Error('Item not found');
    }

    // Check ownership
    const shop = await shopRepository.findShopByOwnerId(userId);
    if (!shop || shop.shop_id !== item.shop_id) {
        throw new Error('Unauthorized');
    }

    return await itemRepository.deleteItem(itemId);
};

const getItemsByShop = async (shopId) => {
    return await itemRepository.findItemsByShopId(shopId);
};

const getItemById = async (itemId) => {
    return await itemRepository.findItemById(itemId);
};

module.exports = {
    addItem,
    updateItem,
    deleteItem,
    getItemsByShop,
    getItemById
};
