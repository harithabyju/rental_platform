const authController = require('../src/modules/users/user.controller'); 
const authService = require('../src/modules/users/user.service'); 

jest.mock('../src/modules/users/user.service');

describe("Auth Controller Unit Test", () => {

  const req = {
    body: {
      email: "test@gmail.com",
      password: "123456"
    }
  };

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ✅ 1. SUCCESS LOGIN
  it("should login successfully", async () => {

    authService.login.mockResolvedValue({
      token: "fakeToken123",
      user: { id: 1, role: "admin" }
    });

    await authController.login(req, res, next);

    expect(authService.login).toHaveBeenCalledWith(
      "test@gmail.com",
      "123456"
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
  token: "fakeToken123",
  user: { id: 1, role: "admin" }
});
  });

  // ❌ 2. INVALID CREDENTIALS
  it("should handle invalid credentials", async () => {

    authService.login.mockRejectedValue(new Error("Invalid credentials"));

    await authController.login(req, res, next);

    expect(authService.login).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
expect(res.json).toHaveBeenCalledWith({
  message: "Invalid credentials"
});// error passed
  });

});
/*
> rental-platform-backend@1.0.0 test
> jest

(node:34436) [DEP0169] DeprecationWarning: `url.parse()` behavior is not standardized and prone to errors that have security implications. Use the WHATWG URL API instead. CVEs are not issued for `url.parse()` vulnerabilities.
(Use `node --trace-deprecation ...` to show where the warning was created)
 PASS  tests/auth.unit.test.js
 PASS  tests/dashboard.unit.test.js                                      
                                                                         
Test Suites: 2 passed, 2 total                                           
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        0.676 s, estimated 1 s
Ran all test suites.*/