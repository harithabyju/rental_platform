const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10),
});

async function runMigration() {
    const sqlFile = path.join(__dirname, 'dashboard_schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    const client = await pool.connect();
    try {
        console.log('Running dashboard schema migration...');
        await client.query(sql);
        console.log('✅ Dashboard schema migration completed successfully!');
        console.log('Tables created: categories, shops, items, shop_items, payments, rentals, reviews, delivery');
        console.log('Seed data inserted: categories, shops, items, shop_items');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration();
