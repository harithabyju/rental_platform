const express = require('express');
const router = express.Router();
const deliveryController = require('./delivery.controller');
const { protect } = require('../../middlewares/authMiddleware');

// Public: get delivery options/fee estimate for a shop+location
router.get('/options', deliveryController.getDeliveryOptions);

// Customer: get delivery status for their booking
router.get('/:bookingId/status', protect, deliveryController.getDeliveryStatus);

// Shop Owner: get all deliveries for owned shops
router.get('/shop/pending', protect, deliveryController.getShopDeliveries);

// Shop Owner: update delivery status
router.patch('/:bookingId/status', protect, deliveryController.updateDeliveryStatus);

module.exports = router;
