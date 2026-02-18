const fs = require('fs');
const path = require('path');
const db = require('../config/db');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const runMigration = async () => {
    try {
        const sqlPath = path.join(__dirname, 'init_bookings.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('Running migration...');
        await db.query(sql);
        console.log('Migration successful');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

runMigration();
