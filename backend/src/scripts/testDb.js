const db = require('../config/db');

async function testConnection() {
    console.log('Testing connection...');
    try {
        const res = await db.query('SELECT NOW()');
        console.log('Connection successful:', res.rows[0]);

        console.log('Fetching users...');
        const users = await db.query('SELECT * FROM users');
        console.log('Users found:', users.rows);
    } catch (err) {
        console.error('Connection failed:', err);
    } finally {
        process.exit();
    }
}

testConnection();
