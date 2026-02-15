const db = require('../config/db');

const createTables = async () => {
    try {
        // Shops Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS shops (
                shop_id SERIAL PRIMARY KEY,
                owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                shop_name VARCHAR(255) NOT NULL,
                description TEXT,
                location JSONB,
                status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Shops table created or already exists.');

        // Categories Table (Simple version for now)
        await db.query(`
            CREATE TABLE IF NOT EXISTS categories (
                category_id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                description TEXT
            );
        `);
        console.log('Categories table created or already exists.');

        // Items Table
        await db.query(`
            CREATE TABLE IF NOT EXISTS items (
                item_id SERIAL PRIMARY KEY,
                shop_id INTEGER REFERENCES shops(shop_id) ON DELETE CASCADE,
                category_id INTEGER REFERENCES categories(category_id) ON DELETE SET NULL,
                item_name VARCHAR(255) NOT NULL,
                description TEXT,
                price_per_day DECIMAL(10, 2) NOT NULL,
                status VARCHAR(50) DEFAULT 'available', -- available, rented, maintenance
                image_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Items table created or already exists.');

        // Seed some categories if empty
        const catCheck = await db.query('SELECT count(*) FROM categories');
        if (catCheck.rows[0].count == 0) {
            await db.query(`
                INSERT INTO categories (name, description) VALUES 
                ('Electronics', 'Gadgets and devices'),
                ('Furniture', 'Chairs, tables, etc.'),
                ('Vehicles', 'Bikes, cars, etc.'),
                ('Tools', 'Construction and home improvement tools')
            `);
            console.log('Seeded initial categories.');
        }

    } catch (error) {
        console.error('Error creating tables:', error);
    } finally {
        process.exit();
    }
};

createTables();
