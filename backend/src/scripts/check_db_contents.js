const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT, 10),
});

async function checkUsers() {
    try {
        const res = await pool.query('SELECT fullname, email, role, verified FROM users LIMIT 10;');
        console.log('--- USERS ---');
        console.table(res.rows);

        const catRes = await pool.query('SELECT name FROM categories;');
        console.log('\n--- CATEGORIES ---');
        console.table(catRes.rows);

        const itemRes = await pool.query('SELECT name FROM items LIMIT 5;');
        console.log('\n--- ITEMS ---');
        console.table(itemRes.rows);

    } catch (err) {
        console.error('Error querying DB:', err.message);
    } finally {
        await pool.end();
    }
}

checkUsers();
