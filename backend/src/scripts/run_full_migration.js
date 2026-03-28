const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runFullMigration() {
    const scriptsDir = __dirname;
    const client = await pool.connect();

    try {
        console.log('Starting full database migration...');

        // 1. Init Users
        console.log('Running init_users.sql...');
        const usersSql = fs.readFileSync(path.join(scriptsDir, 'init_users.sql'), 'utf8');
        await client.query(usersSql);
        
        // Fix users table for missing columns
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8)');
        await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8)');
        console.log('✅ Users table ready.');

        // 2. Init Bookings
        console.log('Running init_bookings.sql...');
        const bookingsSql = fs.readFileSync(path.join(scriptsDir, 'init_bookings.sql'), 'utf8');
        await client.query(bookingsSql);
        await client.query('ALTER TABLE bookings ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(50) DEFAULT \'pickup\'');
        console.log('✅ Bookings table ready.');

        // 3. Dashboard Schema
        console.log('Running dashboard_schema.sql...');
        const dashboardSql = fs.readFileSync(path.join(scriptsDir, 'dashboard_schema.sql'), 'utf8');
        await client.query(dashboardSql);
        console.log('✅ Dashboard tables ready.');

        console.log('Running notifications_migration.sql...');
        const notificationsSql = fs.readFileSync(path.join(scriptsDir, 'notifications_migration.sql'), 'utf8');
        await client.query(notificationsSql);
        console.log('✅ Notifications table ready.');

        console.log('Running payment_migration.sql...');
        const paymentSql = fs.readFileSync(path.join(scriptsDir, 'payment_migration.sql'), 'utf8');
        await client.query(paymentSql);
        console.log('✅ Payments table ready.');

        console.log('Running shop_management_migration.sql...');
        const shopSql = fs.readFileSync(path.join(scriptsDir, 'shop_management_migration.sql'), 'utf8');
        await client.query(shopSql);
        console.log('✅ Shop Management table ready.');

        console.log('Running delivery_orders_migration.sql...');
        const deliverySql = fs.readFileSync(path.join(scriptsDir, 'delivery_orders_migration.sql'), 'utf8');
        await client.query(deliverySql);
        console.log('✅ Delivery Orders table ready.');

        console.log('Running penalties_migration.sql...');
        const penaltiesSql = fs.readFileSync(path.join(scriptsDir, 'penalties_migration.sql'), 'utf8');
        await client.query(penaltiesSql);
        console.log('✅ Penalties table ready.');

        console.log('🚀 Full migration completed successfully!');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

runFullMigration();
