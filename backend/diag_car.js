const db = require('./src/config/db');
async function diag() {
    try {
        console.log('--- Shop Items for "Car" ---');
        const items = await db.query("SELECT si.id, si.item_id, si.shop_id, si.quantity_available, i.name FROM shop_items si JOIN items i ON si.item_id = i.id WHERE i.name ILIKE '%car%'");
        console.log(items.rows);

        if (items.rows.length > 0) {
            const car = items.rows[0];
            console.log('\n--- Bookings for this car ---');
            const bookings = await db.query("SELECT booking_id, start_date, end_date, status FROM bookings WHERE item_id = $1 AND shop_id = $2", [car.item_id, car.shop_id]);
            console.log(bookings.rows);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
diag();
