const pool = require('./src/config/db');

async function cleanupShops() {
    try {
        console.log('SEARCHING FOR GHOST SHOPS...');
        const findRes = await pool.query("SELECT id, name FROM shops WHERE name = 'My Shop'");

        if (findRes.rows.length === 0) {
            console.log('No shops named "My Shop" found.');
            return;
        }

        console.log(`FOUND ${findRes.rows.length} GHOST SHOPS. DELETING...`);
        const delRes = await pool.query("DELETE FROM shops WHERE name = 'My Shop'");
        console.log(`SUCCESSFULLY DELETED ${delRes.rowCount} SHOPS.`);

    } catch (err) {
        console.error('Error during cleanup:', err);
    } finally {
        pool.end();
    }
}

cleanupShops();
