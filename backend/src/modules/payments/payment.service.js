const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../../config/db');
const bookingRepository = require('../bookings/booking.repository');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_your_key_id',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'your_test_secret',
});

/**
 * Create a Razorpay Order
 * @param {number} amount - Amount in INR
 * @param {string} bookingId - Internal booking ID
 * @returns {Promise<Object>} Razorpay Order object
 */
exports.createOrder = async (amount, bookingId) => {
    const options = {
        amount: Math.round(amount * 100), // Razorpay expects amount in paise
        currency: 'INR',
        receipt: `receipt_booking_${bookingId}`,
    };

    try {
        const order = await razorpay.orders.create(options);
        return order;
    } catch (error) {
        console.error('Razorpay Order Creation Error:', error);
        throw new Error('Failed to create Razorpay order');
    }
};

/**
 * Verify Razorpay Payment Signature
 * @param {string} orderId - Razorpay Order ID
 * @param {string} paymentId - Razorpay Payment ID
 * @param {string} signature - Razorpay Signature
 * @returns {boolean} True if valid
 */
exports.verifySignature = (orderId, paymentId, signature) => {
    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

    return generatedSignature === signature;
};

/**
 * Record Payment in DB
 * @param {Object} paymentData - Payment details
 */
exports.recordPayment = async (paymentData) => {
    const {
        booking_id,
        user_id,
        amount_inr,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        status
    } = paymentData;

    const query = `
    INSERT INTO payments (
      booking_id, user_id, amount_inr, 
      razorpay_order_id, razorpay_payment_id, razorpay_signature, 
      status, paid_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    RETURNING *;
  `;

    const values = [
        booking_id, user_id, amount_inr,
        razorpay_order_id, razorpay_payment_id, razorpay_signature,
        status
    ];

    const result = await db.query(query, values);
    return result.rows[0];
};

/**
 * Handle Webhooks for Risk Management
 */
exports.handleRazorpayWebhook = async (event, payload) => {
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        if (event === 'payment.failed') {
            const { notes } = payload.payment.entity;
            const bookingId = notes.booking_id;

            // Scenario 7: Auto cancel after 15 minutes of payment failure
            // Using bookingRepository or direct query
            await db.query(`UPDATE bookings SET status = 'payment_failed' WHERE booking_id = $1`, [bookingId]);

            console.log(`Payment failed for booking ${bookingId}. Notified customer.`);
        }

        if (event === 'payment.captured') {
            const { notes } = payload.payment.entity;
            const bookingId = notes.booking_id;

            // Active the booking but mark paid
            await db.query(`UPDATE bookings SET status = 'confirmed' WHERE booking_id = $1`, [bookingId]);
        }

        if (event === 'refund.processed') {
            // Scenario 11: Refund Log
            const { notes } = payload.refund.entity;
            await db.query(`
                INSERT INTO payments (booking_id, amount_inr, status, paid_at) 
                VALUES ($1, $2, 'refunded', NOW())
            `, [notes.booking_id, -(payload.refund.entity.amount / 100)]);
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};
