const { Pool } = require('pg');
require('dotenv').config({ path: '../../.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function diagnose() {
    try {
        console.log('Testing database connection...');
        const timeRes = await pool.query('SELECT NOW()');
        console.log('Connection successful:', timeRes.rows[0].now);

        console.log('\nChecking shops table schema...');
        const schemaRes = await pool.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'shops'
        `);
        console.table(schemaRes.rows);

        console.log('\nTesting nearby shops query with sample coords (Delhi)...');
        const lat = 28.6139;
        const lng = 77.2090;
        const radius = 10;

        try {
            const nearbyRes = await pool.query(
                `SELECT 
                    id, name, latitude, longitude,
                    (6371 * acos(LEAST(GREATEST(cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + sin(radians($1)) * sin(radians(latitude)), -1), 1))) AS distance
                 FROM shops
                 WHERE is_active = true
                 AND (6371 * acos(LEAST(GREATEST(cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + sin(radians($1)) * sin(radians(latitude)), -1), 1))) <= $3
                 ORDER BY distance ASC
                 LIMIT 6`,
                [lat, lng, radius]
            );
            console.log('Nearby shops found:', nearbyRes.rowCount);
            console.table(nearbyRes.rows);
        } catch (err) {
            console.error('Error in nearby shops query:', err.message);
            console.error(err.stack);
        }

    } catch (err) {
        console.error('Diagnostic failed:', err.message);
    } finally {
        await pool.end();
    }
}

diagnose();
