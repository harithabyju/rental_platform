const express = require('express');
const router = express.Router();
const penaltiesController = require('./penalties.controller');
const { protect } = require('../../middlewares/authMiddleware');
const { authorize } = require('../../middlewares/roleMiddleware');

// Booking fine calculation
router.post('/calculate/:bookingId', protect, penaltiesController.calculateFine);

// Damage reporting
router.post('/damage/report', protect, authorize('shop_owner'), penaltiesController.createDamageReport);
router.post('/damage/approve', protect, authorize('admin'), penaltiesController.approveDamageReport);

// Customer fines
router.get('/my-fines', protect, penaltiesController.getMyFines);

// Admin fines view
router.get('/admin/fines', protect, authorize('admin'), penaltiesController.getAllFines);

// Disputes
router.post('/disputes', protect, authorize('customer'), penaltiesController.raiseDispute);
router.get('/admin/disputes', protect, authorize('admin'), penaltiesController.getDisputes);
router.patch('/admin/disputes/:id', protect, authorize('admin'), penaltiesController.resolveDispute);

module.exports = router;
