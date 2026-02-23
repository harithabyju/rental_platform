const itemRepository = require('./item.repository');
const shopRepository = require('../shops/shop.repository');

const getAllItems = async () => {
    return itemRepository.findAllItems();
};

const getItemsByShop = async (shopId) => {
    return itemRepository.findItemsByShopId(shopId);
};

const addItem = async (ownerId, itemData) => {
    // Find owner's shop
    const shop = await shopRepository.findShopByOwnerId(ownerId);
    if (!shop) throw new Error('No shop found for this owner');
    if (shop.status !== 'approved') throw new Error('Your shop is not yet approved');

    const shopId = shop.id || shop.shop_id;

    // Validate category is permitted
    if (itemData.category_id) {
        const permitted = await shopRepository.getPermittedCategories(shopId);
        if (permitted.length > 0) {
            const permittedIds = permitted.map(c => c.id);
            if (!permittedIds.includes(parseInt(itemData.category_id))) {
                throw new Error('This category is not permitted for your shop');
            }
        }
    }

    return itemRepository.createItem({ ...itemData, shop_id: shopId });
};

const updateItem = async (ownerId, itemId, itemData) => {
    const shop = await shopRepository.findShopByOwnerId(ownerId);
    if (!shop) throw new Error('No shop found for this owner');

    const existing = await itemRepository.findItemById(itemId);
    if (!existing) throw new Error('Item not found');

    const shopId = shop.id || shop.shop_id;
    if (existing.shop_id !== shopId) throw new Error('Item does not belong to your shop');

    return itemRepository.updateItem(itemId, itemData);
};

const deleteItem = async (ownerId, itemId) => {
    const shop = await shopRepository.findShopByOwnerId(ownerId);
    if (!shop) throw new Error('No shop found for this owner');

    const existing = await itemRepository.findItemById(itemId);
    if (!existing) throw new Error('Item not found');

    const shopId = shop.id || shop.shop_id;
    if (existing.shop_id !== shopId) throw new Error('Item does not belong to your shop');

    await itemRepository.deleteItem(itemId);
};

module.exports = {
    getAllItems,
    getItemsByShop,
    addItem,
    updateItem,
    deleteItem,
};
