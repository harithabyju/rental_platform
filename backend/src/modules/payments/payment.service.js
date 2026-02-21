const Razorpay = require('razorpay');
const crypto = require('crypto');
const db = require('../../config/db');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay Order
 * @param {number} amount - Amount in INR
 * @param {string} bookingId - Internal booking ID
 * @returns {Promise<Object>} Razorpay Order object
 */
exports.createOrder = async (amount, bookingId) => {
    // If keys are placeholders, return a mock order for testing
    if (process.env.RAZORPAY_KEY_ID === 'rzp_test_your_key_id') {
        console.log('RAZORPAY MOCK MODE: Returning dummy order');
        return {
            id: `order_mock_${Date.now()}`,
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: `receipt_booking_${bookingId}`,
            status: 'created'
        };
    }

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
    // If keys are placeholders, always return true for mock signatures
    if (process.env.RAZORPAY_KEY_ID === 'rzp_test_your_key_id') {
        return true;
    }

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
