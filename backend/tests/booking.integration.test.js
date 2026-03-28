const request = require('supertest');
const app = require('../src/app');
const db = require('../src/config/db');

// Mock email
jest.mock('../src/utils/email', () => ({
    sendEmail: jest.fn(),
    generateOTP: () => '123456'
}));

// Mock Razorpay
jest.mock('razorpay', () => {
    return jest.fn().mockImplementation(() => ({
        orders: {
            create: jest.fn().mockResolvedValue({ id: 'order_test_123' }),
        },
    }));
});

describe("Booking & Payment Integration Test", () => {
  let customerToken;
  let ownerToken;
  let bookingId;
  let shopItemId;
  let shopId;
  let categoryId;
  const customerEmail = `test_customer_${Date.now()}@example.com`;
  const ownerEmail = `test_owner_${Date.now()}@example.com`;

  beforeAll(async () => {
    // 1. Create a Customer
    await request(app).post('/api/auth/register').send({ fullname: 'Customer', email: customerEmail, password: 'password123' });
    await request(app).post('/api/auth/verify-otp').send({ email: customerEmail, otp: '123456' });
    const custLogin = await request(app).post('/api/auth/login').send({ email: customerEmail, password: 'password123' });
    customerToken = custLogin.body.token;

    // 2. Create a Shop Owner & Shop
    const ownerReg = await request(app).post('/api/auth/register').send({ fullname: 'Owner', email: ownerEmail, password: 'password123' });
    await request(app).post('/api/auth/verify-otp').send({ email: ownerEmail, otp: '123456' });
    await db.query('UPDATE users SET role = $1 WHERE email = $2', ['shop_owner', ownerEmail]);

    // Login as owner to get ownerToken
    const ownLogin = await request(app).post('/api/auth/login').send({ email: ownerEmail, password: 'password123' });
    ownerToken = ownLogin.body.token;

    const catRes = await db.query(`INSERT INTO categories (name, slug) VALUES ('Booking Test Category', 'booking-test-cat-${Date.now()}') RETURNING id`);
    categoryId = catRes.rows[0].id;

    const shopRes = await db.query(`
        INSERT INTO shops (owner_id, name, status, city, pincode, state, address, phone)
        VALUES ($1, 'Booking Test Shop', 'approved', 'Test City', '123456', 'Test State', '123 test st', '1234567890')
        RETURNING id
    `, [ownerReg.body.user.id]);
    shopId = shopRes.rows[0].id;

    // 3. Create an Item
    const itemRes = await db.query(`
        INSERT INTO items (category_id, name, description, base_price_inr)
        VALUES ($1, 'Booking Test Item', 'Description', 500)
        RETURNING id
    `, [categoryId]);
    const globalItemId = itemRes.rows[0].id;

    const shopItemRes = await db.query(`
        INSERT INTO shop_items (shop_id, item_id, price_per_day_inr, quantity_available, is_available)
        VALUES ($1, $2, 500, 10, true)
        RETURNING id
    `, [shopId, globalItemId]);
    shopItemId = shopItemRes.rows[0].id;
  });

  afterAll(async () => {
    if (bookingId) {
        await db.query('DELETE FROM payments WHERE booking_id = $1', [bookingId]);
        await db.query('DELETE FROM bookings WHERE booking_id = $1', [bookingId]);
    }
    await db.query('DELETE FROM shop_items WHERE shop_id = $1', [shopId]);
    await db.query('DELETE FROM shops WHERE id = $1', [shopId]);
    await db.query('DELETE FROM items WHERE category_id = $1', [categoryId]);
    await db.query('DELETE FROM categories WHERE id = $1', [categoryId]);
    await db.query('DELETE FROM users WHERE email IN ($1, $2)', [customerEmail, ownerEmail]);
  });

  it("should create a new booking", async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        itemId: shopItemId,
        shopId: shopId,
        startDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        endDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
        totalAmount: 1000,
        deliveryMethod: "pickup"
      });

    if (res.statusCode !== 201) console.error('Booking Error:', res.body);
    if (res.statusCode !== 201) console.error('Booking Create Error:', JSON.stringify(res.body, null, 2));
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('booking_id');
    bookingId = res.body.booking_id;
  });

  // 1.5 Confirm booking (so it can be extended)
  it("should confirm the booking (as owner)", async () => {
    const res = await request(app)
      .patch(`/api/bookings/${bookingId}/confirm`)
      .set('Authorization', `Bearer ${ownerToken}`);

    if (res.statusCode !== 200) console.error('Confirm Error:', JSON.stringify(res.body, null, 2));
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('confirmed');
  });

  it("should fetch my bookings", async () => {
    const res = await request(app)
      .get(`/api/bookings/my`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should extend the booking", async () => {
    const res = await request(app)
      .patch(`/api/bookings/extend/${bookingId}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        newEndDate: new Date(Date.now() + 259200000).toISOString().split('T')[0]
      });

    if (res.statusCode !== 200) console.error('Extend Error:', res.body);
    expect(res.statusCode).toBe(200);
  });

  it("should create a payment order", async () => {
    const res = await request(app)
      .post('/api/payments/create-order')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        bookingId: bookingId,
        amount: 500
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });
});