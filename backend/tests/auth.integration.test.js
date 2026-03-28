const request = require('supertest');
const app = require('../src/app');

describe("Auth Integration Test", () => {

  it("should fail login with wrong credentials", async () => {
    const res = await request(app)
      .post('/api/auth/login') // <-- fixed path
      .send({
        email: "wrong@gmail.com",
        password: "wrong123"
      });

    expect(res.statusCode).toBe(400); // or whatever your controller returns
    expect(res.body).toHaveProperty('message');
  });

});
/*
Test Suites: 6 passed, 6 total                                           
Tests:       11 passed, 11 total                                         
Snapshots:   0 total                                                     
Time:        2.264 s                                                     
Ran all test suites.*/