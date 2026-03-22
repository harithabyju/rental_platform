const db = require('../../config/db');

class DamageRepository {
    async createReport(reportData) {
        const { booking_id, reporter_id, description, image_urls } = reportData;
        const query = `
            INSERT INTO damage_reports (booking_id, reporter_id, description, image_urls, status)
            VALUES ($1, $2, $3, $4, 'pending')
            RETURNING *;
        `;
        const { rows } = await db.query(query, [booking_id, reporter_id, description, image_urls]);
        return rows[0];
    }

    async approveReport(id, fineAmount, adminNotes) {
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Update the report status
            const updateReportQuery = `
                UPDATE damage_reports 
                SET fine_amount = $1, status = 'approved', admin_notes = $2 
                WHERE id = $3 
                RETURNING *;
            `;
            const { rows: reportRows } = await client.query(updateReportQuery, [fineAmount, adminNotes, id]);
            const report = reportRows[0];

            // 2. Log the fine (Scenario 2: Deduct fine from deposit)
            const logFineQuery = `
                INSERT INTO fines (booking_id, amount, reason, paid)
                VALUES ($1, $2, 'Damage fine deducted from deposit', TRUE);
            `;
            await client.query(logFineQuery, [report.booking_id, fineAmount]);

            // 3. Update booking status
            const updateBookingQuery = `
                UPDATE bookings 
                SET status = 'completed_with_damages' 
                WHERE id = $1;
            `;
            await client.query(updateBookingQuery, [report.booking_id]);

            await client.query('COMMIT');
            return report;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async getReportById(id) {
        const query = `SELECT * FROM damage_reports WHERE id = $1;`;
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }
}

module.exports = new DamageRepository();
