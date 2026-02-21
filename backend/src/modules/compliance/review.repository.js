const db = require('../../config/db');

class ReviewRepository {
    async createReview(reviewData) {
        const { booking_id, item_id, user_id, rating, comment } = reviewData;

        // Scenario 9: Only completed bookings can review
        const bookingCheckQuery = `SELECT status FROM bookings WHERE id = $1 AND user_id = $2;`;
        const { rows: bookingRows } = await db.query(bookingCheckQuery, [booking_id, user_id]);

        if (!bookingRows[0] || !['completed', 'completed_with_damages'].includes(bookingRows[0].status)) {
            throw new Error('Only completed bookings can be reviewed.');
        }

        const query = `
            INSERT INTO reviews (booking_id, item_id, user_id, rating, comment)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (booking_id) DO NOTHING
            RETURNING *;
        `;
        const { rows } = await db.query(query, [booking_id, item_id, user_id, rating, comment]);
        if (!rows[0]) throw new Error('A review already exists for this booking.');
        return rows[0];
    }

    async updateModeration(id, status, isFlagged = false) {
        const query = `
            UPDATE reviews 
            SET moderation_status = $1, is_flagged = $2 
            WHERE id = $3 
            RETURNING *;
        `;
        const { rows } = await db.query(query, [status, isFlagged, id]);
        return rows[0];
    }

    async getReviewsByItem(itemId) {
        const query = `
            SELECT r.*, u.fullname 
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.item_id = $1 AND r.moderation_status = 'visible'
            ORDER BY r.created_at DESC;
        `;
        const { rows } = await db.query(query, [itemId]);
        return rows;
    }
}

module.exports = new ReviewRepository();
