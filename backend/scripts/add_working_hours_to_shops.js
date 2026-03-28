const db = require('../src/config/db');

async function migrate() {
    try {
        console.log('Starting migration: add working_hours and location_restrictions to shops table');
        await db.query(`
            ALTER TABLE shops 
            ADD COLUMN IF NOT EXISTS working_hours JSONB DEFAULT NULL,
            ADD COLUMN IF NOT EXISTS location_restrictions JSONB DEFAULT NULL
        `);
        console.log('Migration completed successfully');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        process.exit(0);
    }
}

migrate();
