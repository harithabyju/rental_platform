const db = require('../../config/db');

class BookingRepository {
    async createWithTransaction(bookingData) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            const { item_id, user_id, start_date, end_date, total_price, security_deposit } = bookingData;

            // 1. SELECT FOR UPDATE - Lock the item row to prevent double booking race condition
            const lockItemQuery = `SELECT * FROM items WHERE id = $1 FOR UPDATE;`;
            await client.query(lockItemQuery, [item_id]);

            // 2. Check for overlapping confirmed bookings
            const overlapQuery = `
                SELECT id FROM bookings 
                WHERE item_id = $1 
                AND status IN ('confirmed', 'pending_vendor_confirmation', 'pending_payment')
                AND NOT (end_date < $2 OR start_date > $3);
            `;
            const { rows: overlaps } = await client.query(overlapQuery, [item_id, start_date, end_date]);

            if (overlaps.length > 0) {
                throw new Error('Item is already booked for these dates.');
            }

            // 3. Create the booking
            const insertQuery = `
                INSERT INTO bookings (item_id, user_id, start_date, end_date, status, created_at)
                VALUES ($1, $2, $3, $4, 'pending_vendor_confirmation', CURRENT_TIMESTAMP)
                RETURNING *;
            `;
            const { rows: bookingRows } = await client.query(insertQuery, [item_id, user_id, start_date, end_date]);
            const booking = bookingRows[0];

            // 4. Create initial payment/deposit log (simplified for now)
            // In a real app, you'd create a 'payments' table record here

            await client.query('COMMIT');
            return booking;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async findById(id) {
        const query = `SELECT * FROM bookings WHERE id = $1;`;
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    async updateStatus(id, status) {
        const query = `UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *;`;
        const { rows } = await db.query(query, [status, id]);
        return rows[0];
    }

    async findByUserId(userId) {
        const query = `SELECT * FROM bookings WHERE user_id = $1 ORDER BY created_at DESC;`;
        const { rows } = await db.query(query, [userId]);
        return rows;
    }

    async findByShopOwnerId(ownerId) {
        const query = `
            SELECT b.*, i.name as item_name 
            FROM bookings b
            JOIN items i ON b.item_id = i.id
            JOIN shops s ON i.shop_id = s.id
            WHERE s.owner_id = $1
            ORDER BY b.created_at DESC;
        `;
        const { rows } = await db.query(query, [ownerId]);
        return rows;
    }
}

module.exports = new BookingRepository();
