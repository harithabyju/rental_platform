const express = require('express');
const router = express.Router();
const bookingController = require('./booking.controller');
const { protect } = require('../../middlewares/authMiddleware');
const { authorize } = require('../../middlewares/roleMiddleware');
const { validateBooking } = require('./booking.validations');
const { checkCompliance } = require('../../middlewares/compliance.middleware');

// Customer Routes
router.post('/', protect, authorize('customer'), checkCompliance, validateBooking, bookingController.createBooking);
router.get('/my', protect, authorize('customer'), bookingController.getMyBookings);
router.patch('/cancel/:id', protect, authorize('customer'), bookingController.cancelBooking);
router.patch('/extend/:id', protect, authorize('customer'), bookingController.extendBooking);
router.patch('/return/:id', protect, authorize('customer'), bookingController.returnBooking);
router.delete('/:id', protect, authorize('customer'), bookingController.deletePendingBooking);

// Shop owner Routes
router.get('/shop', protect, authorize('shop_owner'), bookingController.getShopBookings);
router.patch('/:id/confirm', protect, authorize('shop_owner'), bookingController.confirmBooking);

module.exports = router;
