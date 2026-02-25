const fetch = require('node-fetch');

async function verifyAdminShops() {
    const baseUrl = 'http://localhost:5000/api';

    try {
        console.log('Logging in as admin...');
        const loginRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@test.com',
                password: 'Test@1234'
            })
        });

        const loginData = await loginRes.json();
        const token = loginData.token;
        if (!token) throw new Error('Login failed');
        console.log('✅ Login successful');

        const routes = [
            '/shops/admin',
            '/shops/admin?status=pending',
            '/shops/admin?status=approved'
        ];

        for (const route of routes) {
            console.log(`Checking ${route}...`);
            const res = await fetch(`${baseUrl}${route}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.status === 200) {
                console.log(`✅ ${route}: Success`);
            } else {
                console.error(`❌ ${route}: Failed (${res.status})`);
                const errData = await res.json();
                console.error('Error:', errData.message);
            }
        }

    } catch (err) {
        console.error('❌ Verification failed:', err.message);
    }
}

verifyAdminShops();
