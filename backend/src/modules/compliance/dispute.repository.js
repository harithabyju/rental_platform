const db = require('../../config/db');

class DisputeRepository {
    async createDispute(disputeData) {
        const { booking_id, user_id, type, description, image_urls } = disputeData;
        const query = `
            INSERT INTO dispute_reports (booking_id, user_id, type, description, image_urls, status)
            VALUES ($1, $2, $3, $4, $5, 'open')
            RETURNING *;
        `;
        const { rows } = await db.query(query, [booking_id, user_id, type, description, image_urls]);
        return rows[0];
    }

    async updateResolution(id, resolutionNotes, status) {
        const query = `
            UPDATE dispute_reports 
            SET resolution_notes = $1, status = $2 
            WHERE id = $3 
            RETURNING *;
        `;
        const { rows } = await db.query(query, [resolutionNotes, status, id]);
        return rows[0];
    }

    async getDisputesByBooking(bookingId) {
        const query = `SELECT * FROM dispute_reports WHERE booking_id = $1;`;
        const { rows } = await db.query(query, [bookingId]);
        return rows;
    }

    async getAllDisputes() {
        const query = `SELECT * FROM dispute_reports ORDER BY created_at DESC;`;
        const { rows } = await db.query(query);
        return rows;
    }
}

module.exports = new DisputeRepository();
