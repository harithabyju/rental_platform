const db = require('../config/db');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const email = process.argv[2];

if (!email) {
    console.log('Please provide an email address.');
    console.log('Usage: node src/scripts/verify_user_manual.js <email>');
    process.exit(1);
}

const verify = async () => {
    try {
        console.log(`Verifying user: ${email}...`);
        const result = await db.query(
            "UPDATE users SET verified = TRUE, otp = NULL WHERE email = $1 RETURNING *",
            [email]
        );

        if (result.rows.length > 0) {
            console.log(`SUCCESS: User '${email}' has been manually verified!`);
            console.log('You can now login.');
        } else {
            console.log(`User '${email}' not found.`);
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
};

verify();
