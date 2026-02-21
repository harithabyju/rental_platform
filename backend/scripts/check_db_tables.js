const db = require('../src/config/db');
const fs = require('fs');

async function checkTables() {
    try {
        const res = await db.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        fs.writeFileSync('db_tables.txt', res.rows.map(r => r.table_name).join('\n'));
        process.exit(0);
    } catch (err) {
        fs.writeFileSync('db_tables.txt', 'Error: ' + err.message);
        process.exit(1);
    }
}

checkTables();
