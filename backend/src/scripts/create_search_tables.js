const db = require('../config/db');

const createSearchTables = async () => {
    const itemsTableQuery = `
        CREATE TABLE IF NOT EXISTS items (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price_per_day DECIMAL(10, 2) NOT NULL,
            latitude DECIMAL(9, 6) NOT NULL,
            longitude DECIMAL(9, 6) NOT NULL,
            category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
            owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            image_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    const bookingsTableQuery = `
        CREATE TABLE IF NOT EXISTS bookings (
            id SERIAL PRIMARY KEY,
            item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            status VARCHAR(50) DEFAULT 'confirmed',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await db.query(itemsTableQuery);
        console.log('Items table created successfully');

        await db.query(bookingsTableQuery);
        console.log('Bookings table created successfully');
    } catch (error) {
        console.error('Error creating search-related tables:', error);
    } finally {
        process.exit();
    }
};

createSearchTables();
