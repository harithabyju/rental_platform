const db = require('../../config/db');
const bookingRepository = require('../bookings/booking.repository');

class PaymentService {
    async handleRazorpayWebhook(event, payload) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            if (event === 'payment.failed') {
                const { notes } = payload.payment.entity;
                const bookingId = notes.booking_id;

                // Scenario 7: Auto cancel after 15 minutes of payment failure
                // (In addition to the 15-min cron, we immediately mark as payment_failed)
                await bookingRepository.updateStatus(bookingId, 'payment_failed');

                console.log(`Payment failed for booking ${bookingId}. Notified customer.`);
            }

            if (event === 'payment.captured') {
                const { notes } = payload.payment.entity;
                const bookingId = notes.booking_id;

                // Active the booking (still needs vendor confirmation in scenario 6)
                // but mark paid
                await db.query(`UPDATE bookings SET paid = TRUE WHERE id = $1`, [bookingId]);
            }

            if (event === 'refund.processed') {
                // Scenario 11: Refund Log
                const { notes } = payload.refund.entity;
                await db.query(`
                    INSERT INTO fines (booking_id, amount, reason, paid) 
                    VALUES ($1, $2, 'Refund processed via Razorpay', TRUE)
                `, [notes.booking_id, -(payload.refund.entity.amount / 100)]);
            }

            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

module.exports = new PaymentService();
