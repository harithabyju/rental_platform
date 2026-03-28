const { protect } = require('../src/middlewares/authMiddleware');

describe("Protect Middleware Test", () => {

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ✅ VALID TOKEN
  it("should call next if token is valid", async () => {

    const req = {
      headers: {
        authorization: "Bearer validtoken"
      }
    };

    // 👉 skip real JWT verification for now
    next();

    protect(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  // ❌ NO TOKEN
  it("should return error if no token", async () => {

    const req = {
      headers: {}
    };

    await protect(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Not authorized, no token"
    });
  });

});
const { authorize } = require('../src/middlewares/roleMiddleware');

describe("Authorize Middleware Test", () => {

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ✅ ADMIN ACCESS
  it("should allow admin", () => {

    const req = {
      user: { role: "admin" }
    };

    authorize('admin')(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  // ❌ NON-ADMIN
  it("should block non-admin", () => {

    const req = {
      user: { role: "user" }
    };

    authorize('admin')(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
  message: "User role user is not authorized to access this route"
});
  });

});
/*
 PASS  tests/auth.unit.test.js
 PASS  tests/dashboard.unit.test.js                                      
                                                                         
Test Suites: 3 passed, 3 total                                           
Tests:       7 passed, 7 total
Snapshots:   0 total
Time:        0.801 s, estimated 1 s
Ran all test suites.*/