const { Pool } = require('pg');
require('dotenv').config();

async function checkSchema() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });
    try {
        const tables = ['users', 'bookings', 'categories', 'shops', 'items', 'payments', 'rentals'];
        for (const table of tables) {
            const res = await pool.query(`
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = $1
            `, [table]);
            console.log(`\n--- ${table.toUpperCase()} ---`);
            if (res.rows.length === 0) {
                console.log('TABLE MISSING OR NO COLUMNS');
            } else {
                console.log(res.rows.map(r => r.column_name).join(', '));
            }
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await pool.end();
        process.exit();
    }
}

checkSchema();
