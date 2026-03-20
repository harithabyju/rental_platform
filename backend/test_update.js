const db = require('./src/config/db');
db.query("UPDATE shops SET latitude='10.1004', longitude='76.3570' WHERE name ILIKE '%Eramath Rent%'")
    .then(r => console.log('Updated rows:', r.rowCount))
    .catch(console.error)
    .finally(() => process.exit());
