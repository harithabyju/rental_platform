const paymentService = require('./payment.service');
const db = require('../../config/db');

exports.createOrder = async (req, res, next) => {
    try {
        const { bookingId, amount } = req.body;

        if (!bookingId || !amount) {
            return res.status(400).json({ message: 'Booking ID and Amount are required' });
        }

        const order = await paymentService.createOrder(amount, bookingId);

        // Update booking with razorpay_order_id
        await db.query(
            'UPDATE bookings SET status = $1 WHERE booking_id = $2',
            ['pending', bookingId]
        );

        res.status(201).json(order);
    } catch (err) {
        next(err);
    }
};

exports.verifyPayment = async (req, res, next) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            bookingId,
            amount
        } = req.body;

        const isValid = paymentService.verifySignature(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid payment signature' });
        }

        // Update Booking Status
        await db.query(
            "UPDATE bookings SET status = 'confirmed' WHERE booking_id = $1",
            [bookingId]
        );

        // Update shop_items availability if necessary (or quantities)
        // For now assuming quantity 1 and marking confirmed is enough.

        // Record Payment
        await paymentService.recordPayment({
            booking_id: bookingId,
            user_id: req.user.id,
            amount_inr: amount,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            status: 'completed'
        });

        res.json({ message: 'Payment verified successfully', success: true });
    } catch (err) {
        next(err);
    }
};
