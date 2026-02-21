const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function check() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
    });
    const results = {};
    try {
        const tables = ['shops', 'items', 'payments', 'rentals', 'bookings', 'users'];
        for (const table of tables) {
            const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = $1", [table]);
            results[table] = res.rows.map(r => r.column_name);
        }
        fs.writeFileSync('schema_verbose.json', JSON.stringify(results, null, 2));
        console.log('Schema written to schema_verbose.json');
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
        process.exit();
    }
}
check();
