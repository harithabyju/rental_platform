const db = require('../config/db');
const { hashPassword } = require('../utils/password');

const createAdmin = async () => {
    const email = process.argv[2] || 'admin@example.com';
    const password = process.argv[3] || 'admin123';
    const fullname = process.argv[4] || 'Admin User';

    try {
        console.log(`Checking if user with email ${email} exists...`);
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (user) {
            console.log('User exists. Updating role to admin...');
            await db.query('UPDATE users SET role = $1, verified = $2 WHERE email = $3', ['admin', true, email]);
            console.log(`User ${email} is now an admin.`);
        } else {
            console.log('User does not exist. Creating new admin user...');
            const hashedPassword = await hashPassword(password);
            await db.query(
                'INSERT INTO users (fullname, email, password, role, verified, otp) VALUES ($1, $2, $3, $4, $5, $6)',
                [fullname, email, hashedPassword, 'admin', true, null]
            );
            console.log(`Admin user ${email} created successfully.`);
        }
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        process.exit();
    }
};

createAdmin();
