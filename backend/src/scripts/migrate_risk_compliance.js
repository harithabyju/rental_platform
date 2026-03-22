const db = require('../config/db');

const migrateRiskCompliance = async () => {
    const queries = [
        // 1. Update Users with Fraud Score
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS fraud_score INTEGER DEFAULT 0;`,

        // 2. Create Shops table
        `CREATE TABLE IF NOT EXISTS shops (
            id SERIAL PRIMARY KEY,
            owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            working_hours JSONB DEFAULT '{"open": "09:00", "close": "18:00", "is_24x7": false}',
            location_restrictions TEXT[], -- list of restricted postal codes or regions
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`,

        // 3. Update Items with Risk-related fields
        `ALTER TABLE items ADD COLUMN IF NOT EXISTS shop_id INTEGER REFERENCES shops(id) ON DELETE SET NULL;`,
        `ALTER TABLE items ADD COLUMN IF NOT EXISTS security_deposit DECIMAL(10, 2) DEFAULT 0;`,
        `ALTER TABLE items ADD COLUMN IF NOT EXISTS insurance_required BOOLEAN DEFAULT FALSE;`,
        `ALTER TABLE items ADD COLUMN IF NOT EXISTS location_restrictions_override TEXT[];`,

        // 4. Create Damage Reports table
        `CREATE TABLE IF NOT EXISTS damage_reports (
            id SERIAL PRIMARY KEY,
            booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
            reporter_id INTEGER REFERENCES users(id),
            description TEXT NOT NULL,
            image_urls TEXT[], 
            fine_amount DECIMAL(10, 2) DEFAULT 0,
            status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
            admin_notes TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`,

        // 5. Create Dispute Reports table
        `CREATE TABLE IF NOT EXISTS dispute_reports (
            id SERIAL PRIMARY KEY,
            booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id),
            type VARCHAR(50) NOT NULL, -- PRE_RENTAL, POST_RENTAL, PAYMENT, OTHER
            description TEXT NOT NULL,
            image_urls TEXT[],
            resolution_notes TEXT,
            status VARCHAR(50) DEFAULT 'open', -- open, in_review, resolved, closed
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`,

        // 6. Create Reviews table (Enhanced)
        `CREATE TABLE IF NOT EXISTS reviews (
            id SERIAL PRIMARY KEY,
            booking_id INTEGER UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
            item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            rating INTEGER CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            is_flagged BOOLEAN DEFAULT FALSE,
            moderation_status VARCHAR(50) DEFAULT 'visible', -- visible, hidden, flagged
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`,

        // 7. Create Late Fee Config and Fines logs
        `CREATE TABLE IF NOT EXISTS late_fee_configs (
            id SERIAL PRIMARY KEY,
            item_id INTEGER UNIQUE REFERENCES items(id) ON DELETE CASCADE,
            grace_period_minutes INTEGER DEFAULT 30,
            late_fee_per_hour DECIMAL(10, 2) NOT NULL
        );`,

        `CREATE TABLE IF NOT EXISTS fines (
            id SERIAL PRIMARY KEY,
            booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
            amount DECIMAL(10, 2) NOT NULL,
            reason TEXT,
            paid BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );`,

        // 8. Regional Restrictions table (Admin configurable)
        `CREATE TABLE IF NOT EXISTS regional_restrictions (
            id SERIAL PRIMARY KEY,
            region_key VARCHAR(100) NOT NULL, -- e.g., 'mumbai', '400001'
            category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
            is_blocked BOOLEAN DEFAULT TRUE,
            reason TEXT,
            UNIQUE(region_key, category_id)
        );`
    ];

    try {
        console.log('Starting Risk & Compliance Migration...');
        for (const query of queries) {
            await db.query(query);
            console.log('Executed query successfully.');
        }
        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        process.exit();
    }
};

migrateRiskCompliance();
