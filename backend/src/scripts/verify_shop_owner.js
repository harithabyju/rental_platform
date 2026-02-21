const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10),
});

async function verifyShopOwner() {
    try {
        const email = 'thahari767@gmail.com';
        const res = await pool.query(
            'UPDATE users SET verified = TRUE, otp = NULL WHERE email = $1 RETURNING fullname, email, verified;',
            [email]
        );
        console.log('--- USER UPDATED ---');
        console.table(res.rows);
    } catch (err) {
        console.error('Error updating DB:', err.message);
    } finally {
        await pool.end();
    }
}

verifyShopOwner();
