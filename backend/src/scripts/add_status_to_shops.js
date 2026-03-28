const db = require('../config/db');

async function migrate() {
    try {
        console.log('Adding status column to shops table...');
        await db.query(`
            ALTER TABLE shops 
            ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending'
        `);
        console.log('✅ Status column added successfully');
        process.exit(0);
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    }
}

migrate();
