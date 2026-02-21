const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function fixSchema() {
    try {
        console.log('Fixing categories table schema...');
        
        // Add icon_url if missing
        await pool.query('ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon_url TEXT');
        
        // Add slug if missing. Note: Using temporary null then filling if needed, 
        // but since we want it NOT NULL and UNIQUE, we'll add it then update existing records.
        await pool.query('ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE');
        
        // Add is_active if missing
        await pool.query('ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE');
        
        // Add created_at if missing
        await pool.query('ALTER TABLE categories ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');

        console.log('✅ Categories table schema fixed!');
    } catch (err) {
        console.error('❌ Failed to fix schema:', err.message);
    } finally {
        await pool.end();
    }
}

fixSchema();
