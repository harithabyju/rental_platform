const complianceService = require('../modules/compliance/compliance.service');
const db = require('../config/db');

/**
 * Job to scan for bookings that are past their end_date 
 * and don't have a 'completed' status.
 */
const processLateBookings = async () => {
    try {
        console.log('Running late fee calculation job...');
        const query = `
            SELECT b.id 
            FROM bookings b
            WHERE b.status = 'confirmed' 
            AND b.end_date < CURRENT_TIMESTAMP
        `;
        const { rows: lateBookings } = await db.query(query);

        for (const booking of lateBookings) {
            const fine = await complianceService.calculateLateFine(booking.id);
            if (fine > 0) {
                // Log the fine
                await db.query(`
                    INSERT INTO fines (booking_id, amount, reason, paid)
                    VALUES ($1, $2, 'Late return fine', FALSE)
                    ON CONFLICT DO NOTHING;
                `, [booking.id, fine]);

                console.log(`Calculated late fine for booking ${booking.id}: $${fine}`);
            }
        }
    } catch (error) {
        console.error('Error in late bookings job:', error);
    }
};

// In a real production environment, you would use 'node-cron' or a similar library:
// cron.schedule('0 * * * *', processLateBookings); // Run every hour

module.exports = { processLateBookings };
