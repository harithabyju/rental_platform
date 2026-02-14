const db = require('../config/db');

const addBlockedColumn = async () => {
    try {
        await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked BOOLEAN DEFAULT FALSE');
        console.log('Added blocked column to users table');
        process.exit(0);
    } catch (err) {
        console.error('Error adding column:', err);
        process.exit(1);
    }
};

addBlockedColumn();
