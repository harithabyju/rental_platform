const db = require('../config/db');

async function createReviewsTable() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS reviews (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                item_id INTEGER NOT NULL REFERENCES items(id) ON DELETE CASCADE,
                booking_id INTEGER NOT NULL REFERENCES bookings(booking_id) ON DELETE CASCADE,
                rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
                comment TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, booking_id) -- One review per booking
            );
        `);
        console.log('Reviews table created or already exists.');

        // Add rating columns to items and shops if they don't exist
        // Note: items table already has avg_rating and total_reviews based on schema check earlier

    } catch (err) {
        console.error('Error creating reviews table:', err);
    } finally {
        process.exit();
    }
}

createReviewsTable();
