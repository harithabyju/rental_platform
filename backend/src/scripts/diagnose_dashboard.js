const db = require('../config/db');

async function diagnose() {
    const tables = ['users', 'payments', 'bookings', 'categories', 'items', 'shops'];
    console.log('--- Checking Tables ---');
    for (const table of tables) {
        try {
            const res = await db.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = $1)`, [table]);
            console.log(`Table '${table}': ${res.rows[0].exists ? 'EXISTS' : 'MISSING'}`);
        } catch (err) {
            console.error(`Error checking table '${table}':`, err.message);
        }
    }

    console.log('\n--- Checking Specific Columns ---');
    const columnChecks = [
        { table: 'payments', column: 'status' },
        { table: 'payments', column: 'amount' },
        { table: 'payments', column: 'booking_id' },
        { table: 'bookings', column: 'status' },
        { table: 'items', column: 'category_id' },
        { table: 'items', column: 'shop_id' },
        { table: 'shops', column: 'rating' }
    ];

    for (const check of columnChecks) {
        try {
            const res = await db.query(`SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = $1 AND column_name = $2)`, [check.table, check.column]);
            console.log(`Column '${check.table}.${check.column}': ${res.rows[0].exists ? 'EXISTS' : 'MISSING'}`);
        } catch (err) {
            console.error(`Error checking column '${check.table}.${check.column}':`, err.message);
        }
    }

    process.exit();
}

diagnose();
