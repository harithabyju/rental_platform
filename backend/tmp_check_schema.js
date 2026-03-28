const db = require('./src/config/db');

async function check() {
    try {
        const res = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'categories'
        `);
        console.log('Categories Columns:');
        res.rows.forEach(row => console.log(` - ${row.column_name} (${row.data_type})`));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

check();
