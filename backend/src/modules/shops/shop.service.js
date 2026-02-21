const shopRepository = require('./shop.repository');

class ShopService {
    async registerShop(ownerId, shopData) {
        return await shopRepository.create({ ...shopData, owner_id: ownerId });
    }

    async getShopById(id) {
        const shop = await shopRepository.findById(id);
        if (!shop) throw new Error('Shop not found');
        return shop;
    }

    async getOwnerShops(ownerId) {
        return await shopRepository.findByOwnerId(ownerId);
    }

    async updateShop(ownerId, shopId, updateData) {
        const shop = await shopRepository.findById(shopId);
        if (!shop) throw new Error('Shop not found');
        if (shop.owner_id !== ownerId) throw new Error('Unauthorized');

        return await shopRepository.update(shopId, updateData);
    }

    async isShopOpen(shopId, bookingTime) {
        const shop = await shopRepository.findById(shopId);
        if (!shop) throw new Error('Shop not found');

        const { working_hours } = shop;
        if (working_hours.is_24x7) return true;

        const time = new Date(bookingTime);
        const hours = time.getHours();
        const minutes = time.getMinutes();
        const currentTimeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

        return currentTimeString >= working_hours.open && currentTimeString <= working_hours.close;
    }
}

module.exports = new ShopService();
