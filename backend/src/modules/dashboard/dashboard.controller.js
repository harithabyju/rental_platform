const service = require('./dashboard.service');

const handleError = (res, err, context = '') => {
    console.error(`[Dashboard Controller] ${context}:`, err.message || err);
    res.status(500).json({ success: false, message: 'Internal server error' });
};

// GET /dashboard/summary
exports.getSummary = async (req, res) => {
    try {
        const summary = await service.getDashboardSummary(req.user.id);
        res.json({ success: true, data: summary });
    } catch (err) {
        handleError(res, err, 'getSummary');
    }
};

// GET /categories
exports.getCategories = async (req, res) => {
    try {
        const categories = await service.getAllCategories();
        res.json({ success: true, data: categories });
    } catch (err) {
        handleError(res, err, 'getCategories');
    }
};

// GET /items/category/:categoryId
exports.getItemsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { page = 1, pageSize = 12 } = req.query;
        const result = await service.getItemsByCategory(categoryId, page, pageSize);
        res.json({ success: true, ...result });
    } catch (err) {
        handleError(res, err, 'getItemsByCategory');
    }
};

// GET /items/:itemId/shops
exports.getShopsForItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const shops = await service.getShopsForItem(itemId);
        res.json({ success: true, data: shops });
    } catch (err) {
        handleError(res, err, 'getShopsForItem');
    }
};

// GET /items/search?q=&categoryId=&minPrice=&maxPrice=&deliveryOnly=&page=&pageSize=
exports.searchItems = async (req, res) => {
    try {
        const { q, categoryId, minPrice, maxPrice, deliveryOnly, page = 1, pageSize = 12 } = req.query;
        const filters = {
            q,
            categoryId: categoryId ? parseInt(categoryId, 10) : null,
            minPrice: minPrice !== undefined ? parseFloat(minPrice) : null,
            maxPrice: maxPrice !== undefined ? parseFloat(maxPrice) : null,
            deliveryOnly: deliveryOnly === 'true',
        };
        const result = await service.searchItems(filters, page, pageSize);
        res.json({ success: true, ...result });
    } catch (err) {
        handleError(res, err, 'searchItems');
    }
};

// GET /payments/my
exports.getMyPayments = async (req, res) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;
        const result = await service.getPaymentsByUser(req.user.id, page, pageSize);
        res.json({ success: true, ...result });
    } catch (err) {
        handleError(res, err, 'getMyPayments');
    }
};

// GET /rentals/active
exports.getActiveRentals = async (req, res) => {
    try {
        const rentals = await service.getActiveRentalsByUser(req.user.id);
        res.json({ success: true, data: rentals });
    } catch (err) {
        handleError(res, err, 'getActiveRentals');
    }
};

// GET /profile/stats
exports.getProfileStats = async (req, res) => {
    try {
        const stats = await service.getUserProfileStats(req.user.id);
        res.json({ success: true, data: stats });
    } catch (err) {
        handleError(res, err, 'getProfileStats');
    }
};


// GET /shop-items/:itemId
exports.getShopItemDetails = async (req, res) => {
    try {
        const { itemId } = req.params;
        const details = await service.getShopItemDetails(itemId);
        if (!details) {
            return res.status(404).json({ success: false, message: 'Shop item not found' });
        }
        res.json({ success: true, data: details });
    } catch (err) {
        handleError(res, err, 'getShopItemDetails');
    }
};
