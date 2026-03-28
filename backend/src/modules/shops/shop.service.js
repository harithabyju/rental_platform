const shopRepository = require('./shop.repository');
const userRepository = require('../users/user.repository');
const itemRepository = require('../items/item.repository');
const { sendEmail } = require('../../utils/email');

const registerShop = async (ownerId, shopData) => {
    const existing = await shopRepository.findShopByOwnerId(ownerId);
    if (existing && existing.status !== 'incomplete') {
        throw new Error('You already have a registered shop');
    }
    // If incomplete shop exists, treat this as an update
    if (existing && existing.status === 'incomplete') {
        return await shopRepository.updateShop(existing.id || existing.shop_id, shopData);
    }

    // Flatten data (handle both nested 'location' and flat fields)
    const { shop_name, name, description, location } = shopData;
    const finalName = shop_name || name || '';

    if (!finalName || finalName.trim() === '') {
        throw new Error('Shop name is required');
    }

    const flattenedData = {
        owner_id: ownerId,
        name: finalName,
        description: description || shopData.description || '',
        address: location?.address || shopData.address || '',
        city: location?.city || shopData.city || '',
        pincode: location?.zip || shopData.pincode || '',
        state: location?.state || shopData.state || '',
        latitude: location?.latitude || shopData.latitude || 0,
        longitude: location?.longitude || shopData.longitude || 0,
        phone: location?.phone || shopData.phone || '',
        email: location?.email || shopData.email || '',
        // Verification docs
        govt_id_url: shopData.govt_id_url || null,
        shop_license_url: shopData.shop_license_url || null,
        // Bank details
        bank_account_name: shopData.bank_account_name || null,
        bank_account_number: shopData.bank_account_number || null,
        bank_ifsc: shopData.bank_ifsc || null,
        bank_name: shopData.bank_name || null,
        working_hours: (() => {
            if (typeof shopData.working_hours !== 'string') return shopData.working_hours || null;
            try { return JSON.parse(shopData.working_hours); } catch (e) { return null; }
        })(),
        location_restrictions: (() => {
            if (typeof shopData.location_restrictions !== 'string') return shopData.location_restrictions || null;
            try { return JSON.parse(shopData.location_restrictions); } catch (e) { return null; }
        })(),
    };

    // Auto-set status to 'pending' if all verification fields are present
    const hasDocs = flattenedData.govt_id_url && flattenedData.shop_license_url;
    const hasBank = flattenedData.bank_account_name && flattenedData.bank_account_number && flattenedData.bank_ifsc && flattenedData.bank_name;
    const hasAddress = flattenedData.address && flattenedData.city && flattenedData.state && flattenedData.pincode;

    if (hasDocs && hasBank && hasAddress) {
        flattenedData.status = 'pending';
    } else {
        flattenedData.status = 'incomplete';
    }

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

    // Promote the user to shop_owner role if they aren't already
    await userRepository.updateUserRole(shop.owner_id, 'shop_owner');

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
    
    // Parse JSON strings from FormData if necessary
    if (typeof shopData.working_hours === 'string') {
        try { shopData.working_hours = JSON.parse(shopData.working_hours); } catch (e) {}
    }
    if (typeof shopData.location_restrictions === 'string') {
        try { shopData.location_restrictions = JSON.parse(shopData.location_restrictions); } catch (e) {}
    }

    const updatedShop = await shopRepository.updateShop(shop.id || shop.shop_id, shopData);

    // If delivery_enabled is explicitly set to true, enable delivery (and pickup) for all items
    if (shopData.delivery_enabled === true || shopData.delivery_enabled === 'true') {
        await itemRepository.updateDeliveryForShopItems(shop.id || shop.shop_id, true);
    }

    return updatedShop;
};

const getShopById = async (shopId) => {
    return shopRepository.findShopById(shopId);
};

const submitForApproval = async (ownerId) => {
    const shop = await shopRepository.findShopByOwnerId(ownerId);
    if (!shop) throw new Error('Shop not found');

    // Validate that all required verification fields are present
    const requiredFields = [
        'govt_id_url', 'shop_license_url',
        'bank_account_name', 'bank_account_number', 'bank_ifsc', 'bank_name'
    ];

    for (const field of requiredFields) {
        if (!shop[field]) {
            throw new Error(`Please provide all verification details. Missing: ${field.replace(/_/g, ' ')}`);
        }
    }

    return await shopRepository.updateShopStatus(shop.id || shop.shop_id, 'pending');
};

const isShopOpen = async (shopId, bookingTime) => {
    const shop = await shopRepository.findShopById(shopId);
    if (!shop) throw new Error('Shop not found');

    const { working_hours } = shop;
    if (!working_hours) return true; // Default open if no working hours defined
    if (working_hours.is_24x7) return true;

    const time = new Date(bookingTime);
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const currentTimeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    return currentTimeString >= working_hours.open && currentTimeString <= working_hours.close;
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
    submitForApproval,
    isShopOpen,
};
