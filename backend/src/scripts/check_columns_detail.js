const { Pool } = require('pg');
require('dotenv').config();

async function checkColumns() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });
    try {
        const tables = ['bookings', 'shops'];
        for (const table of tables) {
            const res = await pool.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table]);
            console.log(`${table} Columns:`, res.rows.map(r => r.column_name));
        }
    } catch (err) {
        console.error('Error checking columns:', err.message);
    } finally {
        await pool.end();
        process.exit();
    }
}

checkColumns();
