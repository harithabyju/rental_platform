const itemRepository = require('./item.repository');
const shopRepository = require('../shops/shop.repository');
const db = require('../../config/db');

const getAllItems = async () => {
    return itemRepository.findAllItems();
};

const getItemsByShop = async (shopId) => {
    return itemRepository.findItemsByShopId(shopId);
};

const validateCategoryPermission = async (shopId, categoryId) => {
    if (!categoryId) return;

    const permitted = await shopRepository.getPermittedCategories(shopId);
    if (permitted.length === 0) {
        throw new Error('Your shop has no permitted categories. Please contact admin.');
    }

    const permittedIds = permitted.map(c => parseInt(c.id));
    if (!permittedIds.includes(parseInt(categoryId))) {
        throw new Error('This category is not permitted for your shop. Please stick to your approved niches.');
    }
};

const addItem = async (ownerId, itemData) => {
    // Find owner's shop
    const shop = await shopRepository.findShopByOwnerId(ownerId);
    if (!shop) throw new Error('No shop found for this owner');
    if (shop.status !== 'approved') throw new Error('Your shop is not yet approved');

    const shopId = shop.id || shop.shop_id;

    // Validate category is permitted
    await validateCategoryPermission(shopId, itemData.category_id);

    return itemRepository.createItem({ 
        ...itemData, 
        shop_id: shopId, 
        delivery_available: shop.delivery_enabled 
    });
};

const updateItem = async (ownerId, itemId, itemData) => {
    const shop = await shopRepository.findShopByOwnerId(ownerId);
    if (!shop) throw new Error('No shop found for this owner');

    const existing = await itemRepository.findItemById(itemId);
    if (!existing) throw new Error('Item not found');

    const shopId = shop.id || shop.shop_id;
    if (existing.shop_id !== shopId) throw new Error('Item does not belong to your shop');

    // Validate category if it's being updated
    if (itemData.category_id) {
        await validateCategoryPermission(shopId, itemData.category_id);
    }

    return itemRepository.updateItem(itemId, itemData);
};

const deleteItem = async (ownerId, itemId) => {
    const shop = await shopRepository.findShopByOwnerId(ownerId);
    if (!shop) throw new Error('No shop found for this owner');

    const existing = await itemRepository.findItemById(itemId);
    if (!existing) throw new Error('Item not found');

    const shopId = shop.id || shop.shop_id;
    if (existing.shop_id !== shopId) throw new Error('Item does not belong to your shop');

    // Prevent deletion if there are active or confirmed bookings
    const activeCheck = await db.query(
        "SELECT COUNT(*) FROM bookings WHERE item_id = $1 AND status IN ('confirmed', 'active')",
        [existing.item_id] // item_id here is the global ID
    );

    if (parseInt(activeCheck.rows[0].count) > 0) {
        throw new Error('Cannot delete item with active or confirmed rentals. Please complete or cancel them first.');
    }

    await itemRepository.deleteItem(itemId);
};

const getAllItemsAdmin = async () => {
    return itemRepository.findAllItemsAdmin();
};

const toggleItemStatus = async (itemId, isActive, adminNote = null) => {
    const item = await itemRepository.findItemById(itemId);
    if (!item) throw new Error('Item not found');
    return itemRepository.updateItemStatus(itemId, isActive, adminNote);
};

module.exports = {
    getAllItems,
    getAllItemsAdmin,
    getItemsByShop,
    addItem,
    updateItem,
    toggleItemStatus,
    deleteItem,
};
