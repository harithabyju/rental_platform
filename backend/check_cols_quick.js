const db = require('./src/config/db');
db.query("SELECT column_name FROM information_schema.columns WHERE table_name='bookings' ORDER BY ordinal_position")
    .then(r => { console.log('Bookings columns:', r.rows.map(x => x.column_name)); process.exit(); })
    .catch(e => { console.error(e.message); process.exit(1); });
