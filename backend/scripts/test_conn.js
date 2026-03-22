const db = require('../src/config/db');

async function testConn() {
    try {
        console.log('Testing DB connection...');
        const res = await db.query('SELECT NOW()');
        console.log('Connected! Current time is:', res.rows[0].now);
        process.exit(0);
    } catch (err) {
        console.error('Connection failed:', err.message);
        process.exit(1);
    }
}

testConn();
