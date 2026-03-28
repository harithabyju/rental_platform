const userController = require('../src/modules/users/user.controller');
const userService = require('../src/modules/users/user.service');

jest.mock('../src/modules/users/user.service');

describe("User Controller Unit Test", () => {

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ✅ GET USERS
  it("should return all users", async () => {

    const req = {};

    userService.getAllUsers.mockResolvedValue([
      { id: 1, name: "John" }
    ]);

    await userController.getAllUsers(req, res);

    expect(userService.getAllUsers).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith([
      { id: 1, name: "John" }
    ]);

  });

});
/*
Test Suites: 5 passed, 5 total                                           
Tests:       10 passed, 10 total
Snapshots:   0 total
Time:        0.89 s, estimated 1 s
Ran all test suites.*/