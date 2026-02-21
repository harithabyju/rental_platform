const express = require('express');
const router = express.Router();
const shopController = require('./shop.controller');
const { protect } = require('../../middlewares/authMiddleware');
const { authorize } = require('../../middlewares/roleMiddleware');

// Public routes for shops (discovery)
router.get('/shops/:id', shopController.getShopDetails);

// Shop owner routes
router.post('/shops', protect, authorize('shop_owner'), shopController.createShop);
router.get('/shops/owner/me', protect, authorize('shop_owner'), shopController.getMyShops);
router.put('/shops/:id', protect, authorize('shop_owner'), shopController.updateShop);

module.exports = router;
