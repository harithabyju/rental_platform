const db = require('../../config/db');

const createUser = async (user) => {
    const { fullname, email, password, role, otp } = user;
    const result = await db.query(
        'INSERT INTO users (fullname, email, password, role, otp, verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [fullname, email, password, role, otp, false]
    );
    return result.rows[0];
};

const findUserByEmail = async (email) => {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
};

const findUserById = async (id) => {
    const result = await db.query('SELECT id, fullname, email, role, verified, created_at, blocked, latitude, longitude FROM users WHERE id = $1', [id]);
    return result.rows[0];
};

const verifyUser = async (email) => {
    const result = await db.query(
        'UPDATE users SET verified = TRUE, otp = NULL WHERE email = $1 RETURNING *',
        [email]
    );
    return result.rows[0];
};

const getAllUsers = async () => {
    const result = await db.query("SELECT id, fullname, email, role, verified, created_at, blocked FROM users WHERE role = 'customer' ORDER BY created_at DESC");
    return result.rows;
}

const updateUserProfile = async (id, data) => {
    const { fullname, latitude, longitude } = data;
    const result = await db.query(
        'UPDATE users SET fullname = COALESCE($1, fullname), latitude = COALESCE($2, latitude), longitude = COALESCE($3, longitude), updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING id, fullname, email, role, verified, latitude, longitude',
        [fullname, latitude, longitude, id]
    );
    return result.rows[0];
}

const blockUser = async (id) => {
    const result = await db.query(
        'UPDATE users SET blocked = TRUE WHERE id = $1 RETURNING id, email, blocked',
        [id]
    );
    return result.rows[0];
}

const unblockUser = async (id) => {
    const result = await db.query(
        'UPDATE users SET blocked = FALSE WHERE id = $1 RETURNING id, email, blocked',
        [id]
    );
    return result.rows[0];
}

const getShopsAnalytics = async () => {
    const result = await db.query(`
        SELECT 
            s.id,
            s.name,
            s.city,
            s.state,
            s.status,
            s.approved_at,
            u.fullname as owner_name,
            u.email as owner_email,
            COUNT(DISTINCT si.item_id) as total_items,
            COUNT(DISTINCT r.id) as total_rentals,
            COALESCE(SUM(p.amount_inr), 0) as total_revenue
        FROM shops s
        JOIN users u ON s.owner_id = u.id
        LEFT JOIN shop_items si ON s.id = si.shop_id
        LEFT JOIN rentals r ON s.id = r.shop_id
        LEFT JOIN payments p ON r.booking_id = p.booking_id AND p.status = 'completed'
        WHERE s.status = 'approved'
        GROUP BY s.id, s.name, s.city, s.state, s.status, s.approved_at, u.fullname, u.email
        ORDER BY total_revenue DESC
    `);
    return result.rows;
}

const updateUserOtp = async (email, otp, hashedPassword) => {
    const result = await db.query(
        'UPDATE users SET otp = $1, password = COALESCE($2, password), updated_at = CURRENT_TIMESTAMP WHERE email = $3 RETURNING *',
        [otp, hashedPassword, email]
    );
    return result.rows[0];
}

module.exports = {
    createUser,
    findUserByEmail,
    findUserById,
    verifyUser,
    getAllUsers,
    updateUserProfile,
    blockUser,
    unblockUser,
    getShopsAnalytics,
    updateUserOtp
};
