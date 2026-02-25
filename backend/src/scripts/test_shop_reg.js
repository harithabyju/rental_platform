const fetch = require('node-fetch');

async function testShopRegistration() {
    const baseUrl = 'http://localhost:5000/api';

    try {
        // 1. Login to get token (using the verification user)
        console.log('Logging in...');
        const loginRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'verify@test.com',
                password: 'Password123'
            })
        });

        const loginData = await loginRes.json();
        const token = loginData.token;
        if (!token) throw new Error('Login failed, no token');
        console.log('✅ Login successful');

        // 2. Register Shop
        console.log('Registering Shop...');
        const shopRes = await fetch(`${baseUrl}/shops/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                shop_name: 'Test Debug Shop',
                description: 'A shop for debugging purposes',
                location: {
                    address: '123 Test St',
                    city: 'Debug City',
                    state: 'Test State',
                    zip: '123456',
                    phone: '1234567890',
                    email: 'shop@test.com'
                }
            })
        });

        const shopData = await shopRes.json();
        if (shopRes.ok) {
            console.log('✅ Shop registration successful:', JSON.stringify(shopData, null, 2));
        } else {
            console.error('❌ Shop registration failed (400):', JSON.stringify(shopData, null, 2));
        }

    } catch (err) {
        console.error('❌ Test failed:', err.message);
    }
}

testShopRegistration();
