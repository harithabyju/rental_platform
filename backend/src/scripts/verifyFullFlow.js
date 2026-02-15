const { pool } = require('../config/db');
const { hashPassword } = require('../utils/password');

const API_URL = 'http://127.0.0.1:5000';

const run = async () => {
    const timestamp = Date.now();
    const ownerEmail = `owner${timestamp}@test.com`;
    const adminEmail = `admin${timestamp}@test.com`;
    // const customerEmail = `customer${timestamp}@test.com`; // Unused for now
    const password = 'password123';

    try {
        console.log('--- Starting E2E Verification ---');

        // 1. Setup Data - Create Admin Manually
        console.log('1. Creating Admin User...');
        const hashedPwd = await hashPassword(password);
        await pool.query(
            "INSERT INTO users (fullname, email, password, role, verified) VALUES ('Admin', $1, $2, 'admin', true)",
            [adminEmail, hashedPwd]
        );
        console.log('   Admin created.');

        // 2. Register Shop Owner
        console.log('2. Registering Shop Owner...');
        const regRes = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullname: 'Owner', email: ownerEmail, password, role: 'shop_owner' })
        });
        const regData = await regRes.json();
        if (!regRes.ok) throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
        
        // Manual Verify
        await pool.query("UPDATE users SET verified = true WHERE email = $1", [ownerEmail]);
        console.log('   Owner registered and manually verified.');

        // 3. Login Owner
        console.log('3. Logging in Owner...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: ownerEmail, password })
        });
        const loginData = await loginRes.json();
        if (!loginRes.ok) throw new Error(`Login failed: ${JSON.stringify(loginData)}`);
        const ownerToken = loginData.token;
        console.log('   Owner logged in.');

        // 4. Register Shop
        console.log('4. Registering Shop...');
        const shopRes = await fetch(`${API_URL}/shops/register`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ownerToken}`
            },
            body: JSON.stringify({
                shop_name: `Test Shop ${timestamp}`,
                description: 'Best shop ever',
                location: { city: 'Test City', zip: '12345' }
            })
        });
        const shopData = await shopRes.json();
        if (!shopRes.ok) throw new Error(`Shop registration failed: ${JSON.stringify(shopData)}`);
        const shopId = shopData.shop.shop_id;
        console.log(`   Shop registered (ID: ${shopId}). Status: ${shopData.shop.status}`);

        // 5. Login Admin
        console.log('5. Logging in Admin...');
        const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: adminEmail, password })
        });
        const adminLoginData = await adminLoginRes.json();
        const adminToken = adminLoginData.token;
        console.log('   Admin logged in.');

        // 6. Approve Shop
        console.log('6. Approving Shop...');
        const approveRes = await fetch(`${API_URL}/admin/shops/approve/${shopId}`, {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${adminToken}`
            }
        });
        const approveData = await approveRes.json();
        if (!approveRes.ok) throw new Error(`Approval failed: ${JSON.stringify(approveData)}`);
        console.log(`   Shop approved. New Status: ${approveData.shop.status}`);

        // 7. Add Item
        console.log('7. Adding Item...');
        const itemRes = await fetch(`${API_URL}/items`, {
            method: 'POST', 
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ownerToken}`
            },
            body: JSON.stringify({
                item_name: 'Drill',
                description: 'Power drill',
                price_per_day: 50,
                category_id: 1, 
                image_url: 'http://example.com/drill.jpg'
            })
        });
        const itemData = await itemRes.json();
        if (!itemRes.ok) throw new Error(`Add Item failed: ${JSON.stringify(itemData)}`);
        const itemId = itemData.item.item_id;
        console.log(`   Item added (ID: ${itemId}).`);

        // 8. Verify Customer View
        console.log('8. Verifying Customer View...');
        const publicRes = await fetch(`${API_URL}/items/shop/${shopId}`);
        const publicData = await publicRes.json();
        if (!publicRes.ok) throw new Error(`Public fetch failed: ${JSON.stringify(publicData)}`);
        
        const foundItem = publicData.find(i => i.item_id === itemId);
        if (foundItem) {
            console.log('   Item found in public shop listing.');
        } else {
            throw new Error('Item NOT found in public listing.');
        }

        console.log('--- Verification Success! ---');

    } catch (error) {
        console.error('--- Verification Failed ---');
        console.error(error);
        if (error.cause) console.error('Cause:', error.cause);
    } finally {
        await pool.end(); // await pool end
        process.exit(error ? 1 : 0); // error is not defined here in finally scope unless I use outer var.
        // Actually, just process.exit(0) if success, 1 if catch.
    }
};

run();
