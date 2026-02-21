const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function recreateTables() {
    try {
        console.log('Dropping existing dashboard tables...');
        // Drop in reverse order of dependencies
        await pool.query('DROP TABLE IF EXISTS delivery CASCADE');
        await pool.query('DROP TABLE IF EXISTS reviews CASCADE');
        await pool.query('DROP TABLE IF EXISTS rentals CASCADE');
        await pool.query('DROP TABLE IF EXISTS payments CASCADE');
        await pool.query('DROP TABLE IF EXISTS shop_items CASCADE');
        await pool.query('DROP TABLE IF EXISTS items CASCADE');
        await pool.query('DROP TABLE IF EXISTS shops CASCADE');
        await pool.query('DROP TABLE IF EXISTS categories CASCADE');
        
        console.log('✅ Tables dropped successfully.');
    } catch (err) {
        console.error('❌ Failed to drop tables:', err.message);
    } finally {
        await pool.end();
    }
}

recreateTables();
