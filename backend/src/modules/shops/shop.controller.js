const shopService = require('./shop.service');

const registerShop = async (req, res) => {
    try {
        const registrationData = { ...req.body };

        // Handle file uploads during registration
        if (req.files) {
            if (req.files.govt_id) {
                registrationData.govt_id_url = `/uploads/${req.files.govt_id[0].filename}`;
            }
            if (req.files.shop_license) {
                registrationData.shop_license_url = `/uploads/${req.files.shop_license[0].filename}`;
            }
        }

        const shop = await shopService.registerShop(req.user.id, registrationData);
        res.status(201).json({ message: 'Shop registered successfully', shop });
    } catch (error) {
        console.error('ERROR in registerShop:', error);
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

const updateMyShop = async (req, res) => {
    try {
        const updateData = { ...req.body };

        // Handle file uploads if present
        if (req.files) {
            if (req.files.govt_id) {
                updateData.govt_id_url = `/uploads/${req.files.govt_id[0].filename}`;
            }
            if (req.files.shop_license) {
                updateData.shop_license_url = `/uploads/${req.files.shop_license[0].filename}`;
            }
        }

        const shop = await shopService.updateMyShop(req.user.id, updateData);
        res.status(200).json({ message: 'Shop updated successfully', shop });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const submitForApproval = async (req, res) => {
    try {
        const shop = await shopService.submitForApproval(req.user.id);
        res.status(200).json({ message: 'Shop submitted for approval', shop });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    registerShop,
    getMyShop,
    getShopById,
    updateMyShop,
    approveShop,
    rejectShop,
    getAllShops,
    getPermittedCategories,
    submitForApproval,
};
