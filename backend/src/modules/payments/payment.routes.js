const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const { protect } = require('../../middlewares/authMiddleware');

router.post('/create-order', protect, paymentController.createOrder);
router.post('/verify', protect, paymentController.verifyPayment);
router.get('/my', protect, paymentController.getMyPayments);
router.get('/:id/invoice', protect, paymentController.downloadInvoice);

module.exports = router;
