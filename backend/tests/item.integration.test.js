const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

// Mock email to capture OTP
jest.mock('../src/utils/email', () => ({
    sendEmail: jest.fn(),
    generateOTP: () => '123456'
}));

// Mock Razorpay globally for these tests
jest.mock('razorpay', () => {
    return jest.fn().mockImplementation(() => ({
        orders: {
            create: jest.fn().mockResolvedValue({ id: 'order_test_123' }),
        },
    }));
});

describe('Item Integration Tests', () => {
    let ownerToken;
    let itemId;
    let shopId;
    let categoryId;
    const testEmail = `test_item_owner_${Date.now()}@example.com`;

    beforeAll(async () => {
        // 1. Register a new user
        await request(app)
            .post('/api/auth/register')
            .send({
                fullname: 'Item Owner',
                email: testEmail,
                password: 'password123',
                role: 'customer'
            });

        // 2. Verify OTP
        await request(app)
            .post('/api/auth/verify-otp')
            .send({ email: testEmail, otp: '123456' });

        // 3. Login
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: testEmail, password: 'password123' });
        ownerToken = loginRes.body.token;

        // 4. Create a Category
        const catRes = await db.query(`INSERT INTO categories (name, slug) VALUES ('Integration Category', 'integration-category-${Date.now()}') RETURNING id`);
        categoryId = catRes.rows[0].id;

        // 5. Create a Shop (Manually approved for speed)
        const shopRes = await db.query(`
            INSERT INTO shops (owner_id, name, status, city, pincode, state, address, phone)
            VALUES ($1, 'Item Test Shop', 'approved', 'Test City', '123456', 'Test State', '123 test st', '1234567890')
            RETURNING id
        `, [loginRes.body.user.id]);
        shopId = shopRes.rows[0].id;

        // 6. Give user shop_owner role
        await db.query('UPDATE users SET role = $1 WHERE id = $2', ['shop_owner', loginRes.body.user.id]);

        // 7. Assign category to shop
        await db.query('INSERT INTO shop_permitted_categories (shop_id, category_id) VALUES ($1, $2)', [shopId, categoryId]);
    });

    afterAll(async () => {
        if (itemId) {
            await db.query('DELETE FROM shop_items WHERE item_id = $1', [itemId]);
            await db.query('DELETE FROM items WHERE id = $1', [itemId]);
        }
        if (shopId) {
            await db.query('DELETE FROM shop_permitted_categories WHERE shop_id = $1', [shopId]);
            await db.query('DELETE FROM shops WHERE id = $1', [shopId]);
        }
        if (categoryId) {
            await db.query('DELETE FROM categories WHERE id = $1', [categoryId]);
        }
        await db.query('DELETE FROM users WHERE email = $1', [testEmail]);
    });

    it('should create a new item for the shop', async () => {
        const res = await request(app)
            .post('/api/items')
            .set('Authorization', `Bearer ${ownerToken}`)
            .field('item_name', 'Integration Test Bike')
            .field('description', 'A fast bike for testing')
            .field('price_per_day', 500)
            .field('category_id', categoryId)
            .field('quantity', 5)
            .field('delivery_available', 'true');

        if (res.statusCode !== 201) console.error('Item Create Error:', JSON.stringify(res.body, null, 2));
        expect(res.statusCode).toBe(201);
        expect(res.body.item || res.body).toHaveProperty('id');
        itemId = (res.body.item && res.body.item.id) || res.body.id;
    });

    it('should show the item in global search', async () => {
        const res = await request(app)
            .get('/api/search/items')
            .query({ q: 'Integration Test Bike' });

        expect(res.statusCode).toBe(200);
        const item = res.body.items.find(i => i.id === itemId);
        expect(item).toBeDefined();
    });

    it('should fetch item details by ID', async () => {
        const res = await request(app)
            .get(`/api/items/${itemId}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('Integration Test Bike');
    });
});
