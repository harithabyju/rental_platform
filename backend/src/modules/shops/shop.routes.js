const express = require('express');
const router = express.Router();
const shopController = require('./shop.controller');
const { protect } = require('../../middlewares/authMiddleware');
const { authorize } = require('../../middlewares/roleMiddleware');

const upload = require('../../middlewares/upload.middleware');

// Shop Owner Routes
router.post('/register', protect, upload.fields([
    { name: 'govt_id', maxCount: 1 },
    { name: 'shop_license', maxCount: 1 }
]), shopController.registerShop);
router.get('/my', protect, shopController.getMyShop);
router.put('/my', protect, upload.fields([
    { name: 'govt_id', maxCount: 1 },
    { name: 'shop_license', maxCount: 1 }
]), shopController.updateMyShop);
router.post('/submit-approval', protect, shopController.submitForApproval);
router.get('/my/permitted-categories', protect, shopController.getPermittedCategories);

// Admin Routes
router.get('/admin', protect, authorize('admin'), shopController.getAllShops);
router.patch('/admin/approve/:id', protect, authorize('admin'), shopController.approveShop);
router.patch('/admin/reject/:id', protect, authorize('admin'), shopController.rejectShop);

// Public Routes
router.get('/:id', shopController.getShopById);

module.exports = router;
