const pool = require('./src/config/db');

async function listShops() {
    try {
        const res = await pool.query(`
            SELECT s.id, s.name, s.status, u.fullname, u.email, u.role
            FROM shops s
            JOIN users u ON s.owner_id = u.id
        `);
        console.log('SHOPS IN DATABASE:');
        console.table(res.rows);
    } catch (err) {
        console.error('Error listing shops:', err);
    } finally {
        pool.end();
    }
}

listShops();
