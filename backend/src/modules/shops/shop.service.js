const shopRepository = require('./shop.repository');
const { sendEmail } = require('../../utils/email');

const registerShop = async (ownerId, shopData) => {
    const existing = await shopRepository.findShopByOwnerId(ownerId);
    if (existing) throw new Error('You already have a registered shop');

    // Flatten location object and map field names for the repository
    const { shop_name, name, description, location } = shopData;
    const flattenedData = {
        owner_id: ownerId,
        name: name || shop_name || 'My Shop',
        description: description || '',
        address: location?.address || '',
        city: location?.city || '',
        pincode: location?.zip || '',
        state: location?.state || '',
        latitude: location?.latitude || 0,
        longitude: location?.longitude || 0,
        phone: location?.phone || '',
        email: location?.email || ''
    };

    return await shopRepository.createShop(ownerId, flattenedData);
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

    // Notify the shop owner
    if (shop.email) {
        try {
            await sendEmail(
                shop.email,
                'Your Shop has been Approved!',
                `Congratulations! Your shop "${shop.name}" has been approved on the Rental Platform. You can now log in and start adding items for rent.`
            );
        } catch (err) {
            console.error('Failed to send approval email:', err);
            // Don't fail the whole approval process if email fails
        }
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

const updateMyShop = async (ownerId, shopData) => {
    const shop = await shopRepository.findShopByOwnerId(ownerId);
    if (!shop) throw new Error('Shop not found');
    return await shopRepository.updateShop(shop.id || shop.shop_id, shopData);
};

const getShopById = async (shopId) => {
    return shopRepository.findShopById(shopId);
};

module.exports = {
    registerShop,
    getMyShop,
    getShopById,
    updateMyShop,
    getAllShops,
    approveShop,
    rejectShop,
    getPermittedCategories,
};
