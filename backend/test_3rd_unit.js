const db = require('./src/config/db');
const bookingQueries = require('./src/modules/bookings/booking.queries');

async function test3rdUnit() {
    try {
        const itemId = 10;
        const shopId = 4;
        const startDate = '2026-03-24';
        const endDate = '2026-03-25';
        const quantityLimit = 3;

        console.log('--- Checking current overlap count ---');
        const query = bookingQueries.checkOverlapCount();
        const result = await db.query(query, [itemId, shopId, startDate, endDate]);
        const count = parseInt(result.rows[0].count);
        console.log('Count:', count);
        console.log('Quantity Limit:', quantityLimit);
        console.log('Is Overlapping (count >= limit):', count >= quantityLimit);

        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
test3rdUnit();
