const shopService = require('./shop.service');

class ShopController {
    async createShop(req, res) {
        try {
            const shop = await shopService.registerShop(req.user.id, req.body);
            res.status(201).json(shop);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getMyShops(req, res) {
        try {
            const shops = await shopService.getOwnerShops(req.user.id);
            res.json(shops);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async updateShop(req, res) {
        try {
            const shop = await shopService.updateShop(req.user.id, req.params.id, req.body);
            res.json(shop);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getShopDetails(req, res) {
        try {
            const shop = await shopService.getShopById(req.params.id);
            res.json(shop);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
}

module.exports = new ShopController();
