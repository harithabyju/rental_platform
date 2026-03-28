const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seedTestUsers() {
    const password = await bcrypt.hash('Test@1234', 10);

    const users = [
        { fullname: 'Test Customer', email: 'customer@test.com', role: 'customer' },
        { fullname: 'Test Shop Owner', email: 'shopowner@test.com', role: 'shop_owner' },
        { fullname: 'Test Admin', email: 'admin@test.com', role: 'admin' },
    ];

    for (const u of users) {
        await pool.query(
            `INSERT INTO users (fullname, email, password, role, verified, otp)
             VALUES ($1, $2, $3, $4, true, NULL)
             ON CONFLICT (email) DO UPDATE SET verified = true, otp = NULL`,
            [u.fullname, u.email, password, u.role]
        );
        console.log(`✅ Created: ${u.email} (${u.role})`);
    }

    console.log('\n📋 Login credentials:');
    console.log('  Customer:   customer@test.com  / Test@1234');
    console.log('  Shop Owner: shopowner@test.com / Test@1234');
    console.log('  Admin:      admin@test.com     / Test@1234');

    await pool.end();
    process.exit(0);
}

seedTestUsers().catch(e => { console.error(e.message); process.exit(1); });
