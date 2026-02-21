const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const { protect } = require('../../middlewares/authMiddleware');
const { authorize } = require('../../middlewares/roleMiddleware');

// Auth Routes
router.post('/auth/register', userController.register);
router.post('/auth/verify-otp', userController.verifyOtp);
router.post('/auth/login', userController.login);

// User Routes
router.get('/users/me', protect, userController.getMe);
router.put('/users/me', protect, userController.updateMe);

// Admin Routes
router.get('/admin/users', protect, authorize('admin'), userController.getAllUsers);
router.patch('/admin/block-user', protect, authorize('admin'), userController.blockUser);
router.patch('/admin/unblock-user', protect, authorize('admin'), userController.unblockUser);
router.get('/admin/shops', protect, authorize('admin'), userController.getShopsAnalytics);

module.exports = router;
