const fetch = require('node-fetch');

async function verifyShopUpdate() {
    const baseUrl = 'http://localhost:5000/api';

    try {
        // 1. Login as the verification user (who should have a shop from my previous test)
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
        if (!token) throw new Error('Login failed');
        console.log('✅ Login successful');

        // 2. Check current shop info
        console.log('Checking current shop info...');
        const currentRes = await fetch(`${baseUrl}/shops/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const currentShop = await currentRes.json();
        console.log('Current Email:', currentShop.email);

        // 3. Update shop email and location
        console.log('Updating Shop...');
        const updateRes = await fetch(`${baseUrl}/shops/my`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                email: 'updated_shop@test.com',
                latitude: 12.9716,
                longitude: 77.5946
            })
        });

        const updateData = await updateRes.json();
        if (updateRes.ok) {
            console.log('✅ Shop update successful:', updateData.message);
            console.log('New Email:', updateData.shop.email);
            console.log('New Latitude:', updateData.shop.latitude);
        } else {
            console.error('❌ Shop update failed:', updateData.message);
        }

    } catch (err) {
        console.error('❌ Verification failed:', err.message);
    }
}

verifyShopUpdate();
