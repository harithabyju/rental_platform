const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function checkItemsCols() {
    try {
        const result = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'items'");
        console.log('items columns:', result.rows.map(c => c.column_name).join(', '));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkItemsCols();
