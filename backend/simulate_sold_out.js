const db = require('./src/config/db');
const bookingService = require('./src/modules/bookings/booking.service');

async function simulateSoldOut() {
    try {
        console.log('--- Creating 3rd booking for Car (Item 10) ---');
        const booking = await bookingService.createBooking(15, {
            itemId: 10,
            shopId: 4,
            startDate: '2026-03-24',
            endDate: '2026-03-25',
            totalAmount: 1150,
            deliveryMethod: 'pickup'
        });
        
        console.log('--- Activating 3rd booking ---');
        // Manually update status to confirmed to simulate paid booking
        await db.query("UPDATE bookings SET status = 'confirmed' WHERE booking_id = $1", [booking.booking_id]);
        
        console.log('--- All 3 cars should be booked now ---');
        console.log('Booking IDs: 32, 35, and', booking.booking_id);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
simulateSoldOut();
