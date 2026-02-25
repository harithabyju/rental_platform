const db = require('../config/db');

async function checkShops() {
    try {
        const res = await db.query("SELECT * FROM shops");
        console.log('--- ALL SHOPS ---');
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

checkShops();
