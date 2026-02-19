const express = require('express');
const router = express.Router();
const controller = require('./dashboard.controller');
const { protect } = require('../../middlewares/authMiddleware');
const { validateSearch, validateCategoryId, validateItemId } = require('./dashboard.validation');

// All routes require authentication
router.use(protect);

// Dashboard summary
router.get('/dashboard/summary', controller.getSummary);

// Categories
router.get('/categories', controller.getCategories);

// Items - search must come BEFORE /:itemId/shops to avoid route conflict
router.get('/items/search', validateSearch, controller.searchItems);
router.get('/items/category/:categoryId', validateCategoryId, validateSearch, controller.getItemsByCategory);
router.get('/items/:itemId/shops', validateItemId, controller.getShopsForItem);

// Payments
router.get('/payments/my', validateSearch, controller.getMyPayments);

// Rentals
router.get('/rentals/active', controller.getActiveRentals);

// Profile Stats
router.get('/profile/stats', controller.getProfileStats);


module.exports = router;
