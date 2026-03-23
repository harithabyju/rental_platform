const db = require('../../config/db');

exports.createNotification = async (userId, title, message, type = 'info') => {
    const result = await db.query(
        `INSERT INTO notifications (user_id, title, message, type)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, title, message, type]
    );
    return result.rows[0];
};

exports.getNotificationsByUser = async (userId, limit = 10, offset = 0) => {
    const result = await db.query(
        `SELECT * FROM notifications 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
    );
    return result.rows;
};

exports.markAsRead = async (id, userId) => {
    const result = await db.query(
        `UPDATE notifications SET is_read = true 
         WHERE id = $1 AND user_id = $2 
         RETURNING *`,
        [id, userId]
    );
    return result.rows[0];
};

exports.getUnreadCount = async (userId) => {
    const result = await db.query(
        `SELECT COUNT(*) FROM notifications 
         WHERE user_id = $1 AND is_read = false`,
        [userId]
    );
    return parseInt(result.rows[0].count);
};
