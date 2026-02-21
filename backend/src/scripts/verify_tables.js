const db = require('../config/db');
const fs = require('fs');
const path = require('path');

const verifyTables = async () => {
    const query = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('items', 'bookings', 'categories', 'users');
    `;

    try {
        const { rows } = await db.query(query);
        const results = rows.map(r => r.table_name);
        const output = `Tables found: ${results.join(', ')}\nTimestamp: ${new Date().toISOString()}`;
        fs.writeFileSync(path.join(__dirname, 'verification_result.txt'), output);
        console.log('Verification result written to verification_result.txt');
    } catch (error) {
        fs.writeFileSync(path.join(__dirname, 'verification_result.txt'), `Error: ${error.message}`);
    } finally {
        process.exit();
    }
};

verifyTables();
