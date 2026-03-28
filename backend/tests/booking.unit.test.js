const bookingController = require('../src/modules/bookings/booking.controller');
const bookingService = require('../src/modules/bookings/booking.service');

jest.mock('../src/modules/bookings/booking.service');

describe("Booking Controller Unit Test", () => {

  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };

  const next = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ✅ SUCCESS
  it("should create booking", async () => {

    const req = {
      user: { id: 2 },   // ✅ FIXED
      body: { itemId: 1 }
    };

    bookingService.createBooking.mockResolvedValue({
      id: 1,
      itemId: 1,
      userId: 2
    });

    await bookingController.createBooking(req, res, next);

    expect(bookingService.createBooking).toHaveBeenCalledWith(
      2,
      { itemId: 1 }
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      id: 1,
      itemId: 1,
      userId: 2
    });

  });

  // ❌ ERROR
  it("should handle booking error", async () => {

    const req = {
      user: { id: 2 },   // ✅ FIXED
      body: { itemId: 1 }
    };

    bookingService.createBooking.mockRejectedValue(new Error("Booking failed"));

    await bookingController.createBooking(req, res, next);

    expect(bookingService.createBooking).toHaveBeenCalled();
    expect(next).toHaveBeenCalled();

  });

});
/*
Test Suites: 4 passed, 4 total                                           
Tests:       9 passed, 9 total
Snapshots:   0 total
Time:        0.896 s, estimated 1 s
Ran all test suites.*/