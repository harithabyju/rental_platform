const express = require('express');
const router = express.Router();
const controller = require('./dashboard.controller');
const { protect } = require('../../middlewares/authMiddleware');
const { validateSearch, validateCategoryId, validateItemId } = require('./dashboard.validation');

// Initial router setup (no global protect here as it conflicts with other /api routes)

// Dashboard summary
router.get('/dashboard/summary', protect, controller.getSummary);

// Categories (Public)
router.get('/categories', controller.getCategories);

// Items - search must come BEFORE /:itemId/shops to avoid route conflict
router.get('/items/search', controller.searchItems);
router.get('/items/category/:categoryId', controller.getItemsByCategory);
router.get('/items/:itemId/shops', controller.getShopsForItem);

// Payments (Protected)
router.get('/payments/my', protect, validateSearch, controller.getMyPayments);

// Rentals (Protected)
router.get('/rentals/active', protect, controller.getActiveRentals);

// Profile Stats (Protected)
router.get('/profile/stats', protect, controller.getProfileStats);

// Shop Items (Public)
router.get('/shop-items/:itemId', validateItemId, controller.getShopItemDetails);

// Nearby Shops (Public)
router.get('/shops/nearby', controller.getNearbyShops);

module.exports = router;
