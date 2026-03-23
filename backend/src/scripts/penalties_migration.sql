-- Migration to create penalties/fines module tables

-- Fines Table
CREATE TABLE IF NOT EXISTS fines (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(booking_id),
    user_id INTEGER REFERENCES users(id),
    amount NUMERIC(15, 2) NOT NULL,
    description TEXT,
    fine_type VARCHAR(50) DEFAULT 'late', -- 'late', 'damage'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'disputed', 'resolved'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Damage Reports Table
CREATE TABLE IF NOT EXISTS damage_reports (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(booking_id),
    reported_by INTEGER REFERENCES users(id), -- shop owner
    description TEXT NOT NULL,
    images TEXT[], -- Array of image URLs
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Disputes Table
CREATE TABLE IF NOT EXISTS disputes (
    id SERIAL PRIMARY KEY,
    fine_id INTEGER REFERENCES fines(id),
    user_id INTEGER REFERENCES users(id), -- customer
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'resolved', 'rejected'
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
