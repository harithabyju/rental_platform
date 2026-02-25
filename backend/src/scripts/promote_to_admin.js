const db = require('../config/db');

async function promoteToAdmin(email) {
    try {
        const result = await db.query(
            'UPDATE users SET role = $1 WHERE email = $2 RETURNING id, fullname, role',
            ['admin', email.toLowerCase()]
        );

        if (result.rows.length === 0) {
            console.log(`❌ User with email ${email} not found.`);
        } else {
            console.log(`✅ User ${result.rows[0].fullname} promoted to ADMIN.`);
        }
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        process.exit(0);
    }
}

const email = process.argv[2];
if (!email) {
    console.log('Usage: node promote_to_admin.js <email>');
    process.exit(1);
}

promoteToAdmin(email);
