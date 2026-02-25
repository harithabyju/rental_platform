const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

async function verifyUser(email) {
    const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: parseInt(process.env.DB_PORT, 10),
    });
    await pool.query('UPDATE users SET verified = true WHERE email = $1', [email]);
    await pool.end();
}

async function testApi() {
    const baseUrl = 'http://localhost:5000';
    try {
        console.log('Testing Registration...');
        const regRes = await fetch(`${baseUrl}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullname: 'Verification User',
                email: 'verify@test.com',
                password: 'Password123',
                role: 'customer'
            })
        });

        if (regRes.ok) {
            console.log('✅ Registration successful');
            await verifyUser('verify@test.com');
            console.log('✅ User verified in DB');
        } else if (regRes.status === 400) {
            console.log('ℹ️ User already exists, proceeding to login');
            await verifyUser('verify@test.com');
        }
        else {
            const errData = await regRes.json();
            throw new Error(`Registration failed: ${JSON.stringify(errData)}`);
        }

        console.log('Testing Login...');
        const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'verify@test.com',
                password: 'Password123'
            })
        });

        if (!loginRes.ok) {
            const errData = await loginRes.json();
            throw new Error(`Login failed: ${JSON.stringify(errData)}`);
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('✅ Login successful, token received');

        const headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        console.log('Testing GET /dashboard/summary...');
        const summaryRes = await fetch(`${baseUrl}/api/dashboard/summary`, { headers });
        const summaryData = await summaryRes.json();
        console.log('✅ Summary API Response:', JSON.stringify(summaryData, null, 2));

        console.log('Testing GET /categories...');
        const catRes = await fetch(`${baseUrl}/api/categories`, { headers });
        const catData = await catRes.json();
        console.log(`✅ Categories API: Found ${catData.length} categories`);

        console.log('Testing search API...');
        const searchRes = await fetch(`${baseUrl}/api/items/search?q=Camry`, { headers });
        const searchData = await searchRes.json();
        console.log(`✅ Search API: Found ${searchData.items.length} items`);

        console.log('\n--- VERIFICATION SUCCESSFUL ---');
    } catch (err) {
        console.error('❌ Verification failed:', err.message);
        process.exit(1);
    }
}

testApi();
