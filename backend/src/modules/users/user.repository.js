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
    const result = await db.query('SELECT id, fullname, email, role, verified, created_at, blocked FROM users WHERE id = $1', [id]);
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
    const result = await db.query("SELECT id, fullname, email, role, verified, created_at, blocked FROM users WHERE role IN ('customer', 'shop_owner')");
    return result.rows;
}

const updateUserProfile = async (id, data) => {
    const { fullname } = data;
    const result = await db.query(
        'UPDATE users SET fullname = $1 WHERE id = $2 RETURNING id, fullname, email, role, verified',
        [fullname, id]
    );
    return result.rows[0];
}

const blockUser = async (id) => {
    // Assuming 'blocked' column exists. If not, this query will fail until schema is updated.
    const result = await db.query(
        'UPDATE users SET blocked = TRUE WHERE id = $1 RETURNING id, email, blocked',
        [id]
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
    blockUser
};
