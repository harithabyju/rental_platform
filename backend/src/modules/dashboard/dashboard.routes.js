const express = require('express');
const router = express.Router();
const controller = require('./dashboard.controller');
const { protect } = require('../../middlewares/authMiddleware');
const { validateSearch, validateCategoryId, validateItemId } = require('./dashboard.validation');

// Initial router setup (no global protect here as it conflicts with other /api routes)

// Dashboard summary
router.get('/summary', protect, controller.getSummary);

// Specific details
router.get('/items/:itemId/shops', controller.getShopsForItem);
router.get('/shop-items/:itemId', validateItemId, controller.getShopItemDetails);

// Payments (Protected)
router.get('/payments/my', protect, validateSearch, controller.getMyPayments);

// Rentals (Protected)
router.get('/rentals/active', protect, controller.getActiveRentals);

// Profile Stats (Protected)
router.get('/profile/stats', protect, controller.getProfileStats);

module.exports = router;
