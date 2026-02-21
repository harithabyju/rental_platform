const db = require('../src/config/db');
const fs = require('fs');

async function verify() {
    try {
        const res = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('shops', 'damage_reports', 'dispute_reports', 'reviews', 'late_fee_configs', 'fines', 'regional_restrictions');
        `);
        const tables = res.rows.map(r => r.table_name);
        fs.writeFileSync('migration_status.txt', 'Tables found: ' + tables.join(', '));
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('migration_status.txt', 'Verification Error: ' + err.message);
        process.exit(1);
    }
}

verify();
