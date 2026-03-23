const db = require('./src/config/db');
const bookingService = require('./src/modules/bookings/booking.service');

async function testDelete() {
    try {
        console.log('--- Testing deleteBooking for ID 33 (User 15) ---');
        const result = await bookingService.deleteBooking(15, 33);
        console.log('Deleted successfully:', result);
        process.exit(0);
    } catch (e) {
        console.error('Delete failed:', e.message);
        process.exit(1);
    }
}
testDelete();
