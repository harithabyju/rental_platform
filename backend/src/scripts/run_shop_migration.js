const db = require('../config/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        const sqlPath = path.join(__dirname, 'shop_management_migration.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running shop management migration...');
        await db.query(sql);
        console.log('✅ Migration completed successfully.');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    } finally {
        process.exit(0);
    }
}

runMigration();
