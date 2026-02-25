const db = require('../config/db');

async function inspectTable() {
    try {
        console.log('--- TABLE DEFINITION ---');
        const columns = await db.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'shops'
            ORDER BY ordinal_position
        `);
        console.log(JSON.stringify(columns.rows, null, 2));

        console.log('\n--- CONSTRAINTS ---');
        const constraints = await db.query(`
            SELECT conname, pg_get_constraintdef(c.oid)
            FROM pg_constraint c
            JOIN pg_namespace n ON n.oid = c.connamespace
            WHERE conrelid = 'shops'::regclass
        `);
        console.log(JSON.stringify(constraints.rows, null, 2));

    } catch (err) {
        console.error('Error info:', err.message);
    } finally {
        process.exit(0);
    }
}

inspectTable();
