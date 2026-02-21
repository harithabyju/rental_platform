const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://postgres:admin@127.0.0.1:5432/rental_platform',
});

async function test() {
    console.log('Connecting to 127.0.0.1...');
    try {
        const client = await pool.connect();
        console.log('Connected!');
        const res = await client.query('SELECT NOW()');
        console.log(res.rows[0]);
        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await pool.end();
    }
}

test();
