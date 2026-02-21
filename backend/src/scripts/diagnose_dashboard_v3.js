const db = require('../config/db');
const fs = require('fs');

async function runCheck() {
    const queries = {
        'Users Table': "SELECT count(*) FROM users",
        'Payments Table': "SELECT count(*) FROM payments",
        'Bookings Table': "SELECT count(*) FROM bookings",
        'Categories Table': "SELECT count(*) FROM categories",
        'Items Table': "SELECT count(*) FROM items",
        'Shops Table': "SELECT count(*) FROM shops",
        'Payments.status Column': "SELECT status FROM payments LIMIT 1",
        'Bookings.status Column': "SELECT status FROM bookings LIMIT 1",
        'Items.category_id Column': "SELECT category_id FROM items LIMIT 1",
        'Shops.rating Column': "SELECT rating FROM shops LIMIT 1"
    };

    const results = {};

    for (const [name, query] of Object.entries(queries)) {
        try {
            await db.query(query);
            results[name] = 'OK';
        } catch (err) {
            results[name] = `FAIL: ${err.message}`;
        }
    }

    fs.writeFileSync('diag_results.json', JSON.stringify(results, null, 2));
    process.exit();
}

runCheck();
