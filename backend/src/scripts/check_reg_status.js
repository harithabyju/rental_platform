const db = require('../config/db');

async function checkUserStatus() {
    try {
        const result = await db.query('SELECT fullname, email, role, verified, otp, created_at, updated_at FROM users ORDER BY created_at DESC LIMIT 5');
        console.log('Recent registrations:');
        console.table(result.rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUserStatus();
