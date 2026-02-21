const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function forceFixSchema() {
    const client = await pool.connect();
    try {
        console.log('--- FORCING SCHEMA FIX ---');
        
        // Fix bookings
        try {
            console.log('Adding delivery_method to bookings...');
            await client.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(50) DEFAULT \'pickup\'');
            console.log('✅ Added delivery_method to bookings');
        } catch (e) {
            console.error('❌ Failed to add delivery_method to bookings:', e.message);
        }

        // Fix users
        try {
            console.log('Adding latitude/longitude to users...');
            await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8)');
            await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8)');
            console.log('✅ Added latitude/longitude to users');
        } catch (e) {
            console.error('❌ Failed to add lat/lng to users:', e.message);
        }

        // Verify bookings 
        const res = await client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'bookings'");
        console.log('Bookings columns now:', res.rows.map(r => r.column_name).join(', '));

    } catch (err) {
        console.error('CRITICAL ERROR:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

forceFixSchema();
