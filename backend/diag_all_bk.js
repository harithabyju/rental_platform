const db = require('./src/config/db');
async function diagAll() {
    try {
        console.log('--- ALL Bookings for Item 10, Shop 4 ---');
        const bookings = await db.query("SELECT booking_id, start_date, end_date, status, user_id FROM bookings WHERE item_id = 10 AND shop_id = 4");
        console.log(bookings.rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
diagAll();
