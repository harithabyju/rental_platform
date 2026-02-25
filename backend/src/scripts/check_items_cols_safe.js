const db = require('../config/db');

async function checkItemsCols() {
    try {
        const result = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'items'");
        console.log('items columns:', result.rows.map(c => c.column_name).join(', '));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkItemsCols();
