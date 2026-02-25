const express = require('express');
const router = express.Router();
const shopController = require('./shop.controller');
const { protect } = require('../../middlewares/authMiddleware');
const { authorize } = require('../../middlewares/roleMiddleware');

// Shop Owner Routes
router.post('/register', protect, shopController.registerShop);
router.get('/my', protect, shopController.getMyShop);
router.put('/my', protect, shopController.updateMyShop);
router.get('/my/permitted-categories', protect, shopController.getPermittedCategories);

// Admin Routes
router.get('/admin', protect, authorize('admin'), shopController.getAllShops);
router.patch('/admin/approve/:id', protect, authorize('admin'), shopController.approveShop);
router.patch('/admin/reject/:id', protect, authorize('admin'), shopController.rejectShop);

// Public Routes
router.get('/:id', shopController.getShopById);

module.exports = router;
