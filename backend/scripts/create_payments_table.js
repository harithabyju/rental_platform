require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const db = require('../src/config/db');

const createPaymentsTable = async () => {
    const query = `
        CREATE TABLE IF NOT EXISTS payments (
            id SERIAL PRIMARY KEY,
            booking_id INTEGER,
            user_id INTEGER,
            amount_inr DECIMAL(10, 2) NOT NULL,
            currency VARCHAR(10) DEFAULT 'INR',
            payment_method VARCHAR(50),
            razorpay_order_id VARCHAR(100),
            razorpay_payment_id VARCHAR(100),
            razorpay_signature VARCHAR(255),
            status VARCHAR(50) DEFAULT 'pending',
            invoice_number VARCHAR(100),
            paid_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        await db.query(query);
        console.log('Payments table created successfully');
    } catch (error) {
        console.error('Error creating payments table:', error);
    } finally {
        process.exit();
    }
};

createPaymentsTable();
