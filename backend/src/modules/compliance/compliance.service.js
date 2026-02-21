const damageRepository = require('./damage.repository');
const disputeRepository = require('./dispute.repository');
const reviewRepository = require('./review.repository');
const db = require('../../config/db');

class ComplianceService {
    // Scenario 2: Damage Handling
    async reportDamage(reporterId, data) {
        return await damageRepository.createReport({ ...data, reporter_id: reporterId });
    }

    async resolveDamage(adminId, reportId, fineAmount, notes) {
        return await damageRepository.approveReport(reportId, fineAmount, notes);
    }

    // Scenario 3: Late Return Handling
    async calculateLateFine(bookingId) {
        const query = `
            SELECT b.*, lfc.late_fee_per_hour, lfc.grace_period_minutes 
            FROM bookings b
            JOIN late_fee_configs lfc ON b.item_id = lfc.item_id
            WHERE b.id = $1;
        `;
        const { rows } = await db.query(query, [bookingId]);
        const booking = rows[0];
        if (!booking) return 0;

        const actualReturn = new Date(); // Assume currently being returned
        const scheduledReturn = new Date(booking.end_date);

        const diffMs = actualReturn - scheduledReturn;
        const diffMinutes = Math.floor(diffMs / 60000);

        if (diffMinutes <= booking.grace_period_minutes) return 0;

        const lateHours = Math.ceil(diffMinutes / 60);
        return lateHours * booking.late_fee_per_hour;
    }

    // Scenario 4: Fraud Detection
    async updateFraudScore(userId, scoreChange) {
        const query = `
            UPDATE users 
            SET fraud_score = fraud_score + $1 
            WHERE id = $2 
            RETURNING fraud_score, blocked;
        `;
        const { rows } = await db.query(query, [scoreChange, userId]);
        const user = rows[0];

        // Scenario 4: Auto temporary block after threshold
        if (user.fraud_score >= 100 && !user.blocked) {
            await db.query('UPDATE users SET blocked = TRUE WHERE id = $1', [userId]);
        }
        return user;
    }

    // Scenario 8: Disputes
    async raiseDispute(userId, data) {
        return await disputeRepository.createDispute({ ...data, user_id: userId });
    }

    async resolveDispute(adminId, disputeId, notes, status) {
        return await disputeRepository.updateResolution(disputeId, notes, status);
    }

    // Scenario 9: Review Moderation
    async submitReview(userId, data) {
        return await reviewRepository.createReview({ ...data, user_id: userId });
    }

    async moderateReview(adminId, reviewId, status, flagged) {
        return await reviewRepository.updateModeration(reviewId, status, flagged);
    }
}

module.exports = new ComplianceService();
