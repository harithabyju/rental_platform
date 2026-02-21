const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function verifyAllUsers() {
    try {
        console.log('Verifying all users...');
        const res = await pool.query('UPDATE users SET verified = TRUE WHERE verified = FALSE RETURNING id, email');
        console.log(`✅ Verified ${res.rowCount} users:`, res.rows.map(r => r.email).join(', '));
    } catch (err) {
        console.error('Error verifying users:', err.message);
    } finally {
        await pool.end();
    }
}

verifyAllUsers();
