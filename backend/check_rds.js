require('dotenv').config();
const { Pool } = require('pg');

// Use the DATABASE_URL from your .env file
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_HOST === 'localhost' ? false : { rejectUnauthorized: false }
});

async function checkTables() {
    try {
        console.log(`Connecting to database: ${process.env.DATABASE_URL.split('@')[1]}...`);
        
        const res = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        
        if (res.rows.length === 0) {
            console.log('\n❌ NO TABLES FOUND! Your RDS database is completely empty.');
            console.log('You need to migrate your local database schema to AWS.');
        } else {
            console.log('\n✅ Tables found in your RDS database:');
            res.rows.forEach(row => console.log(` - ${row.table_name}`));
        }
    } catch (err) {
        console.error('\n❌ Connection Error: Ensure your EC2 Security Group is allowed in your RDS Security Group.', err.message);
    } finally {
        await pool.end();
    }
}

checkTables();
