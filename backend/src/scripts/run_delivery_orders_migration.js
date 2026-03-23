const fs = require('fs');
const path = require('path');
const db = require('../config/db');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const runMigration = async () => {
    try {
        const sqlPath = path.join(__dirname, 'delivery_orders_migration.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('Running delivery orders migration...');
        await db.query(sql);
        console.log('✅ delivery_orders table and bookings delivery columns created successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
};

runMigration();
