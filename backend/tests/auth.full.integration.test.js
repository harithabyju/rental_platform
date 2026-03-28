const request = require('supertest');
const app = require('../src/app');

let userToken;   // JWT for normal user
let adminToken;  // JWT for admin user

describe("Full Auth & Protected Routes Integration Test", () => {

  // ❌ Test wrong login
  it("should fail login with wrong credentials", async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: "wrong@gmail.com", password: "wrong123" });

    expect(res.statusCode).toBe(400); // or your controller error code
    expect(res.body).toHaveProperty('message');
  });

  // ✅ Test successful login (normal user)
  it("should login successfully and return JWT", async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ 
        email: "customer3.example@gmail.com",   // <-- replace with real test user
        password: "customer333"     // <-- replace with real test user password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');

    userToken = res.body.token; // save JWT for protected routes
  });

  // ✅ Test successful login (admin user)
  it("should login as admin and return JWT", async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ 
        email: "admin@test.com",  // <-- replace with admin test user
        password: "Test@1234"    // <-- replace with admin password
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');

    adminToken = res.body.token;
  });

  // 🔐 Test protected route for normal user
  it("should access protected /users/me route with valid token", async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('email');
  });

  // 🔐 Test admin-only route
  it("should allow admin to access /admin/users", async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // ❌ Test normal user cannot access admin route
  it("should deny normal user from accessing /admin/users", async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(403); // Forbidden
    expect(res.body).toHaveProperty('message');
  });

});
/*
Test Suites: 7 passed, 7 total                                           
Tests:       17 passed, 17 total                                         
Snapshots:   0 total                                                     
Time:        2.603 s                                                     
Ran all test suites.*/