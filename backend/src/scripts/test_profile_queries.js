// const axios = require('axios');

async function testProfileStats() {
    try {
        // Note: This requires a valid token. Since I can't easily get one from the environment headers here 
        // without more work, I'll check if the controller logic flows logically.
        // Actually, I'll just verify the query directly against the DB since I have the pool.
        const { pool } = require('./src/config/db');
        const userId = 1; // Assuming user index 1 exists

        console.log("Testing Top Categories Query...");
        const resCat = await pool.query(
            `SELECT c.id, c.name, COUNT(*) as count
             FROM bookings b
             JOIN items i ON b.item_id = i.id
             JOIN categories c ON i.category_id = c.id
             WHERE b.user_id = $1 AND b.status != 'cancelled'
             GROUP BY c.id, c.name
             ORDER BY count DESC
             LIMIT 3`,
            [userId]
        );
        console.table(resCat.rows);

        console.log("Testing Top Item Query...");
        const resItem = await pool.query(
            `SELECT i.id, i.name, i.image_url, COUNT(*) as count
             FROM bookings b
             JOIN items i ON b.item_id = i.id
             WHERE b.user_id = $1 AND b.status != 'cancelled'
             GROUP BY i.id, i.name, i.image_url
             ORDER BY count DESC
             LIMIT 1`,
            [userId]
        );
        console.table(resItem.rows);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testProfileStats();
