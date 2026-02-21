const { Pool } = require('pg');
require('dotenv').config();

async function listTables() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });
    try {
        const res = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log('Tables:', res.rows.map(r => r.table_name));
    } catch (err) {
        console.error('Error listing tables:', err.message);
    } finally {
        await pool.end();
        process.exit();
    }
}

listTables();
