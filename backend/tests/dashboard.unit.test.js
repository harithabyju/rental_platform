const adminController = require('../src/modules/admin/dashboard/adminDashboard.controller');
const service = require('../src/modules/admin/dashboard/adminDashboard.service');

jest.mock('../src/modules/admin/dashboard/adminDashboard.service', () => ({
  getFullDashboardData: jest.fn().mockResolvedValue({
    users: 10,
    bookings: 5
  })
}));

describe("Dashboard Controller Unit Test", () => {

  it("should return dashboard data", async () => {

    const req = {};

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const next = jest.fn();

    await adminController.getDashboardData(req, res, next);

    expect(service.getFullDashboardData).toHaveBeenCalled(); // ✅ FIXED
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
  success: true,
  data: {
    users: 10,
    bookings: 5
  }
});

  });

});

/*
PS D:\rental_platform\backend> npm test

> rental-platform-backend@1.0.0 test
> jest

 PASS  tests/dashboard.unit.test.js
  Dashboard Controller Unit Test
    √ should return dashboard data (4 ms)                                
                                                                         
Test Suites: 1 passed, 1 total                                           
Tests:       1 passed, 1 total                                           
Snapshots:   0 total
Time:        0.468 s, estimated 1 s
Ran all test suites.
PS D:\rental_platform\backend> */