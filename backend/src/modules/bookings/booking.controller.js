const bookingService = require('./booking.service');

class BookingController {
    async createBooking(req, res) {
        try {
            const booking = await bookingService.createBooking(req.user.id, req.body);
            res.status(201).json(booking);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async getMyBookings(req, res) {
        try {
            const bookings = await bookingService.getMyBookings(req.user.id);
            res.json(bookings);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async getShopBookings(req, res) {
        try {
            const bookings = await bookingService.getShopBookings(req.user.id);
            res.json(bookings);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async confirmBooking(req, res) {
        try {
            const booking = await bookingService.confirmBooking(req.user.id, req.params.id);
            res.json(booking);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async cancelBooking(req, res) {
        try {
            const booking = await bookingService.cancelBooking(req.user.id, req.params.id);
            res.json(booking);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new BookingController();
