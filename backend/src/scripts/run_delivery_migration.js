const fs = require('fs');
const path = require('path');
const db = require('../config/db');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const runMigration = async () => {
    try {
        const sqlPath = path.join(__dirname, 'add_delivery_columns.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log('Running delivery columns migration...');
        await db.query(sql);
        console.log('Delivery columns added successfully');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

runMigration();
