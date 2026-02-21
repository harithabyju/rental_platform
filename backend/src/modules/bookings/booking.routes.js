const express = require('express');
const router = express.Router();
const bookingController = require('./booking.controller');
const { protect } = require('../../middlewares/authMiddleware');
const { authorize } = require('../../middlewares/roleMiddleware');
const { checkCompliance } = require('../../middlewares/compliance.middleware');

// Customer routes
router.post('/bookings', protect, authorize('customer'), checkCompliance, bookingController.createBooking);
router.get('/bookings/my', protect, authorize('customer'), bookingController.getMyBookings);
router.post('/bookings/:id/cancel', protect, authorize('customer'), bookingController.cancelBooking);

// Shop owner routes
router.get('/bookings/shop', protect, authorize('shop_owner'), bookingController.getShopBookings);
router.post('/bookings/:id/confirm', protect, authorize('shop_owner'), bookingController.confirmBooking);

module.exports = router;
