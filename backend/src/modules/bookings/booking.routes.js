const express = require('express');
const router = express.Router();
const bookingController = require('./booking.controller');
const { protect } = require('../../middlewares/authMiddleware');
const { validateBooking } = require('./booking.validations');

router.post('/', protect, validateBooking, bookingController.createBooking);
router.get('/my', protect, bookingController.getMyBookings);
router.patch('/cancel/:id', protect, bookingController.cancelBooking);
router.patch('/extend/:id', protect, bookingController.extendBooking);
router.patch('/return/:id', protect, bookingController.returnBooking);

module.exports = router;
