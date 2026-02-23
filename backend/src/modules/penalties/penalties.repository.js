const db = require('../../config/db');

const getBookingForFine = async (bookingId) => {
    const result = await db.query(
        `SELECT b.*, i.price_per_day, i.name as item_name, s.owner_id as shop_owner_id, u.email as customer_email, u.fullname as customer_name
         FROM bookings b
         JOIN items i ON b.item_id = i.id
         JOIN shops s ON i.shop_id = s.id
         JOIN users u ON b.customer_id = u.id
         WHERE b.id = $1`,
        [bookingId]
    );
    return result.rows[0];
};

const createFine = async (data) => {
    const { booking_id, user_id, amount, description, fine_type, status } = data;
    const result = await db.query(
        `INSERT INTO fines (booking_id, user_id, amount, description, fine_type, status) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [booking_id, user_id, amount, description, fine_type || 'late', status || 'pending']
    );
    return result.rows[0];
};

const getFineByBookingId = async (bookingId, type) => {
    const result = await db.query(
        'SELECT * FROM fines WHERE booking_id = $1 AND fine_type = $2',
        [bookingId, type]
    );
    return result.rows[0];
};

const createDamageReport = async (data) => {
    const { booking_id, reported_by, description, images } = data;
    const result = await db.query(
        `INSERT INTO damage_reports (booking_id, reported_by, description, images, status) 
         VALUES ($1, $2, $3, $4, 'pending') RETURNING *`,
        [booking_id, reported_by, description, images]
    );
    return result.rows[0];
};

const getDamageReportById = async (id) => {
    const result = await db.query('SELECT * FROM damage_reports WHERE id = $1', [id]);
    return result.rows[0];
};

const updateDamageReportStatus = async (id, status) => {
    const result = await db.query(
        'UPDATE damage_reports SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
    );
    return result.rows[0];
};

const getCustomerFines = async (userId) => {
    const result = await db.query(
        `SELECT f.*, i.name as item_name 
         FROM fines f
         JOIN bookings b ON f.booking_id = b.id
         JOIN items i ON b.item_id = i.id
         WHERE f.user_id = $1
         ORDER BY f.created_at DESC`,
        [userId]
    );
    return result.rows;
};

const getAllFinesAdmin = async () => {
    const result = await db.query(
        `SELECT f.*, u.fullname as customer_name, i.name as item_name
         FROM fines f
         JOIN users u ON f.user_id = u.id
         JOIN bookings b ON f.booking_id = b.id
         JOIN items i ON b.item_id = i.id
         ORDER BY f.created_at DESC`
    );
    return result.rows;
};

const createDispute = async (data) => {
    const { fine_id, user_id, reason } = data;
    const result = await db.query(
        `INSERT INTO disputes (fine_id, user_id, reason, status) 
         VALUES ($1, $2, $3, 'open') RETURNING *`,
        [fine_id, user_id, reason]
    );
    return result.rows[0];
};

const updateFineStatus = async (fineId, status) => {
    const result = await db.query(
        'UPDATE fines SET status = $1 WHERE id = $2 RETURNING *',
        [status, fineId]
    );
    return result.rows[0];
};

const getAllDisputesAdmin = async () => {
    const result = await db.query(
        `SELECT d.*, f.amount as fine_amount, f.description as fine_description, u.fullname as customer_name
         FROM disputes d
         JOIN fines f ON d.fine_id = f.id
         JOIN users u ON d.user_id = u.id
         ORDER BY d.created_at DESC`
    );
    return result.rows;
};

const getDisputeById = async (id) => {
    const result = await db.query('SELECT * FROM disputes WHERE id = $1', [id]);
    return result.rows[0];
};

const updateDispute = async (id, status, response) => {
    const result = await db.query(
        'UPDATE disputes SET status = $1, admin_response = $2 WHERE id = $3 RETURNING *',
        [status, response, id]
    );
    return result.rows[0];
};

module.exports = {
    getBookingForFine,
    createFine,
    getFineByBookingId,
    createDamageReport,
    getDamageReportById,
    updateDamageReportStatus,
    getCustomerFines,
    getAllFinesAdmin,
    createDispute,
    updateFineStatus,
    getAllDisputesAdmin,
    getDisputeById,
    updateDispute
};
