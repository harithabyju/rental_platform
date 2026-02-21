const fs = require('fs');
const path = require('path');
const db = require('../config/db');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const runMigration = async () => {
    try {
        const fileName = process.argv[2] || 'init_bookings.sql';
        const sqlPath = path.isAbsolute(fileName) ? fileName : path.join(__dirname, fileName);

        if (!fs.existsSync(sqlPath)) {
            console.error(`Migration file not found: ${sqlPath}`);
            process.exit(1);
        }

        const sql = fs.readFileSync(sqlPath, 'utf8');
        console.log(`Running migration: ${path.basename(sqlPath)}...`);
        await db.query(sql);
        console.log('Migration successful');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

runMigration();
