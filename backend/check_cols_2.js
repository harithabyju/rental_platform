const db = require('./src/config/db');
async function check() {
    try {
        const res = await db.query("SELECT table_name, column_name FROM information_schema.columns WHERE table_name IN ('rentals', 'shop_items')");
        console.log('Columns:', res.rows);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
