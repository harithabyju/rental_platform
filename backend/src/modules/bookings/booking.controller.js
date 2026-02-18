const bookingService = require('./booking.service');

exports.createBooking = async (req, res, next) => {
    try {
        const booking = await bookingService.createBooking(req.user.id, req.body);
        res.status(201).json(booking);
    } catch (err) {
        next(err);
    }
};

exports.getMyBookings = async (req, res, next) => {
    try {
        const bookings = await bookingService.getUserBookings(req.user.id);
        res.json(bookings);
    } catch (err) {
        next(err);
    }
};

exports.cancelBooking = async (req, res, next) => {
    try {
        const booking = await bookingService.cancelBooking(req.user.id, req.params.id);
        res.json(booking);
    } catch (err) {
        next(err);
    }
};

exports.extendBooking = async (req, res, next) => {
    try {
        const booking = await bookingService.extendBooking(req.user.id, req.params.id, req.body.newEndDate);
        res.json(booking);
    } catch (err) {
        next(err);
    }
};

exports.returnBooking = async (req, res, next) => {
    try {
        const booking = await bookingService.returnBooking(req.user.id, req.params.id);
        res.json(booking);
    } catch (err) {
        next(err);
    }
};
