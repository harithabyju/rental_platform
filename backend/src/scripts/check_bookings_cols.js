const db = require('../config/db');

async function run() {
    const r = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name='bookings'");
    console.log('bookings columns:', r.rows.map(x => x.column_name));
    process.exit(0);
}
run().catch(e => { console.error(e.message); process.exit(1); });
