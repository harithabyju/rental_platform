const db = require('../src/config/db');

const createCategoryTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL,
            description TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await db.query(query);
        console.log('Categories table created successfully');
    } catch (error) {
        console.error('Error creating categories table:', error);
    } finally {
        process.exit();
    }
};

createCategoryTable();
