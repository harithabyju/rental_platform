const shopService = require('./shop.service');

const registerShop = async (req, res) => {
    try {
        const { shop_name, description, location } = req.body;
        const shop = await shopService.registerShop(req.user.id, {
            shop_name,
            description,
            location
        });
        res.status(201).json({ message: 'Shop registered successfully', shop });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getMyShop = async (req, res) => {
    try {
        const shop = await shopService.getMyShop(req.user.id);
        res.status(200).json(shop);
    } catch (error) {
        // Return a structured 'not found' instead of 404 error so UI can distinguish
        res.status(200).json(null);
    }
};

const getShopById = async (req, res) => {
    try {
        const shop = await shopService.getShopById(req.params.id);
        res.status(200).json(shop);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

const approveShop = async (req, res) => {
    try {
        const categoryIds = req.body.category_ids || [];
        const shop = await shopService.approveShop(req.params.id, categoryIds);
        res.status(200).json({ message: 'Shop approved', shop });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const rejectShop = async (req, res) => {
    try {
        const shop = await shopService.rejectShop(req.params.id);
        res.status(200).json({ message: 'Shop rejected', shop });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getAllShops = async (req, res) => {
    try {
        const { status } = req.query;
        const shops = await shopService.getAllShops(status);
        res.status(200).json(shops);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPermittedCategories = async (req, res) => {
    try {
        const categories = await shopService.getPermittedCategories(req.user.id);
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerShop,
    getMyShop,
    getShopById,
    approveShop,
    rejectShop,
    getAllShops,
    getPermittedCategories,
};
