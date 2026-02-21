const db = require('../config/db');
const fs = require('fs');
const path = require('path');

const runMigration = async () => {
    try {
        const sql = fs.readFileSync(path.join(__dirname, 'search_indexes.sql'), 'utf8');
        await db.query(sql);
        console.log('Search indexes migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error running search indexes migration:', err);
        process.exit(1);
    }
};

runMigration();
