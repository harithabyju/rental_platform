const { Pool } = require('pg');
const pool = new Pool({
    connectionString: 'postgres://postgres:postgres@localhost:5432/rental_platform'
});

async function run() {
    try {
        const resItems = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'items'");
        console.log('Items columns:', JSON.stringify(resItems.rows, null, 2));
        const resShopItems = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'shop_items'");
        console.log('Shop Items columns:', JSON.stringify(resShopItems.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

run();
