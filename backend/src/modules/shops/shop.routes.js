const express = require('express');
const router = express.Router();
const shopController = require('./shop.controller');
const { protect } = require('../../middlewares/authMiddleware');
const { authorize } = require('../../middlewares/roleMiddleware');

// Shop Owner Routes
router.post('/shops/register', protect, shopController.registerShop);
router.get('/shops/my', protect, shopController.getMyShop);
router.get('/shops/my/permitted-categories', protect, shopController.getPermittedCategories);

// Public Routes
router.get('/shops/:id', shopController.getShopById);

// Admin Routes
router.get('/admin/shops', protect, authorize('admin'), shopController.getAllShops);
router.patch('/admin/shops/approve/:id', protect, authorize('admin'), shopController.approveShop);
router.patch('/admin/shops/reject/:id', protect, authorize('admin'), shopController.rejectShop);

module.exports = router;
