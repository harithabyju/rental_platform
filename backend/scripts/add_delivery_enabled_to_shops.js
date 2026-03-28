const db = require('../src/config/db');

async function migrate() {
    try {
        console.log('Starting migration: add delivery_enabled to shops table');
        await db.query(`
            ALTER TABLE shops 
            ADD COLUMN IF NOT EXISTS delivery_enabled BOOLEAN DEFAULT false
        `);
        console.log('Migration completed successfully');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit(0);
    }
}

migrate();
