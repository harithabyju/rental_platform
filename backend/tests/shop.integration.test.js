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

describe('Shop Integration Tests', () => {
    let userToken;
    let adminToken;
    let shopId;
    let userId;
    const testEmail = `test_owner_${Date.now()}@example.com`;

    beforeAll(async () => {
        // 1. Register a new user
        const regRes = await request(app)
            .post('/api/auth/register')
            .send({
                fullname: 'Test Shop Owner',
                email: testEmail,
                password: 'password123',
                role: 'customer'
            });
        userId = regRes.body.id;

        // 2. Verify OTP (using mocked 123456)
        await request(app)
            .post('/api/auth/verify-otp')
            .send({ email: testEmail, otp: '123456' });

        // 3. Login to get user token
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({ email: testEmail, password: 'password123' });
        userToken = loginRes.body.token;

        // 4. Login as admin
        const adminRes = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@test.com', password: 'Test@1234' });
        adminToken = adminRes.body.token;
    });

    afterAll(async () => {
        if (shopId) {
            await db.query('DELETE FROM shop_permitted_categories WHERE shop_id = $1', [shopId]);
            await db.query('DELETE FROM shop_items WHERE shop_id = $1', [shopId]);
            await db.query('DELETE FROM shops WHERE id = $1', [shopId]);
        }
        await db.query('DELETE FROM users WHERE email = $1', [testEmail]);
    });

    it('should register a shop with basic details', async () => {
        const res = await request(app)
            .post('/api/shops/register')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
                name: 'Integration Test Shop',
                description: 'A test shop',
                address: '123 Test St',
                city: 'Test City',
                state: 'Test State',
                pincode: '123456',
                phone: '1234567890'
            });

        if (res.statusCode !== 201) console.error('Reg Error:', res.body);
        expect(res.statusCode).toBe(201);
        shopId = res.body.shop.id || res.body.shop.shop_id;
    });

    it('should update shop with docs and bank info', async () => {
        const dummyBuffer = Buffer.from('dummy');
        const res = await request(app)
            .put('/api/shops/my')
            .set('Authorization', `Bearer ${userToken}`)
            .field('bank_account_name', 'Test User')
            .field('bank_account_number', '1234567890')
            .field('bank_ifsc', 'TEST0001234')
            .field('bank_name', 'Test Bank')
            .attach('govt_id', dummyBuffer, 'id.png')
            .attach('shop_license', dummyBuffer, 'license.pdf');

        expect(res.statusCode).toBe(200);
    });

    it('should submit shop for approval', async () => {
        const res = await request(app)
            .post('/api/shops/submit-approval')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.shop.status).toBe('pending');
    });

    it('should allow admin to approve', async () => {
        const catRes = await db.query('SELECT id FROM categories LIMIT 1');
        const categoryId = catRes.rows[0]?.id || 1;

        const res = await request(app)
            .patch(`/api/shops/admin/approve/${shopId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ category_ids: [categoryId] });

        expect(res.statusCode).toBe(200);
        expect(res.body.shop.status).toBe('approved');
    });

    it('should verify role transition', async () => {
        const res = await request(app)
            .get('/api/users/me')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.body.role).toBe('shop_owner');
    });
});
