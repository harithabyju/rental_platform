const db = require('../config/db');

async function checkShopsCols() {
    try {
        const result = await db.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'shops'");
        console.log('shops columns:', result.rows.map(c => c.column_name).join(', '));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkShopsCols();
