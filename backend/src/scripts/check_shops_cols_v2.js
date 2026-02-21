const { Pool } = require('pg');
require('dotenv').config();

async function checkShops() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });
    try {
        const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'shops'");
        console.log('Shops Columns:', res.rows.map(r => r.column_name).join(', '));
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
        process.exit();
    }
}

checkShops();
