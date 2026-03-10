const fetch = require('node-fetch');

async function testVerificationFlow() {
    const baseUrl = 'http://localhost:5000/api';
    let token;

    try {
        console.log('--- 1. Login ---');
        const loginRes = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'verify@test.com',
                password: 'Password123'
            })
        });
        const loginData = await loginRes.json();
        token = loginData.token;
        if (!token) throw new Error('Login failed');
        console.log('✅ Login successful');

        console.log('\n--- 2. Get Shop Status (Expect incomplete) ---');
        const shopRes = await fetch(`${baseUrl}/shops/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        let shop = await shopRes.json();
        console.log(`Current Status: ${shop.status}`);
        if (shop.status !== 'incomplete') {
            console.log('⚠️ Warning: Status is not "incomplete". (Might be an existing shop)');
        }

        console.log('\n--- 3. Try Submitting for Approval (Expect 400 - Missing Details) ---');
        const subFailRes = await fetch(`${baseUrl}/shops/submit-approval`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const subFailData = await subFailRes.json();
        if (subFailRes.status === 400) {
            console.log('✅ Correctly blocked submission: ' + subFailData.message);
        } else {
            console.error('❌ Failed to block submission (expected 400)');
        }

        console.log('\n--- 4. Update Verification Details ---');
        // Using bank details update only for simplicity (files require multipart)
        const updateRes = await fetch(`${baseUrl}/shops/my`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                bank_account_name: 'Haritha Byju',
                bank_account_number: '1234567890',
                bank_ifsc: 'TEST0001',
                bank_name: 'Test Bank',
                govt_id_url: '/uploads/fake_id.pdf', // Mocking for test
                shop_license_url: '/uploads/fake_license.pdf' // Mocking for test
            })
        });
        if (updateRes.ok) {
            console.log('✅ Verification details updated');
        } else {
            const data = await updateRes.json();
            throw new Error('Update failed: ' + data.message);
        }

        console.log('\n--- 5. Submit for Approval (Expect 200) ---');
        const subSuccRes = await fetch(`${baseUrl}/shops/submit-approval`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const subSuccData = await subSuccRes.json();
        if (subSuccRes.ok) {
            console.log('✅ Successfully submitted for approval');
            console.log(`New Status: ${subSuccData.shop.status}`);
        } else {
            throw new Error('Submission failed: ' + subSuccData.message);
        }

    } catch (err) {
        console.error('❌ ERROR:', err.message);
    }
}

testVerificationFlow();
