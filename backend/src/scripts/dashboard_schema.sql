-- ============================================================
-- RENTAL PLATFORM - DASHBOARD SCHEMA
-- Run this after init_users.sql and init_bookings.sql
-- ============================================================

-- Categories
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    slug VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- Shops (Rental Vendors)
CREATE TABLE IF NOT EXISTS shops (
    id SERIAL PRIMARY KEY,
    owner_id INT REFERENCES users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(20),
    email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_shops_owner ON shops(owner_id);
CREATE INDEX IF NOT EXISTS idx_shops_city ON shops(city);
CREATE INDEX IF NOT EXISTS idx_shops_active ON shops(is_active);

-- Items (Rental Products)
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT,
    base_price_inr DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    price_unit VARCHAR(20) DEFAULT 'day', -- day, hour, week
    is_active BOOLEAN DEFAULT TRUE,
    avg_rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_items_category ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_items_active ON items(is_active);
CREATE INDEX IF NOT EXISTS idx_items_name ON items USING gin(to_tsvector('english', name));

-- Shop Items (Many-to-Many: which items are available in which shops)
CREATE TABLE IF NOT EXISTS shop_items (
    id SERIAL PRIMARY KEY,
    shop_id INT REFERENCES shops(id) ON DELETE CASCADE,
    item_id INT REFERENCES items(id) ON DELETE CASCADE,
    price_per_day_inr DECIMAL(10, 2) NOT NULL,
    quantity_available INT DEFAULT 1,
    is_available BOOLEAN DEFAULT TRUE,
    delivery_available BOOLEAN DEFAULT FALSE,
    pickup_available BOOLEAN DEFAULT TRUE,
    delivery_fee_inr DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(shop_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_shop_items_shop ON shop_items(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_items_item ON shop_items(item_id);
CREATE INDEX IF NOT EXISTS idx_shop_items_available ON shop_items(is_available);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(booking_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    amount_inr DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_method VARCHAR(50) DEFAULT 'razorpay',
    razorpay_order_id VARCHAR(255),
    razorpay_payment_id VARCHAR(255),
    razorpay_signature VARCHAR(500),
    status VARCHAR(30) DEFAULT 'pending', -- pending, completed, failed, refunded
    invoice_number VARCHAR(100),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Rentals (Active rental tracking)
CREATE TABLE IF NOT EXISTS rentals (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(booking_id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    item_id INT REFERENCES items(id) ON DELETE SET NULL,
    shop_id INT REFERENCES shops(id) ON DELETE SET NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    actual_return_date TIMESTAMP,
    status VARCHAR(30) DEFAULT 'active', -- active, returned, overdue
    late_fine_per_day_inr DECIMAL(10, 2) DEFAULT 0.00,
    total_late_fine_inr DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rentals_user ON rentals(user_id);
CREATE INDEX IF NOT EXISTS idx_rentals_booking ON rentals(booking_id);
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);
CREATE INDEX IF NOT EXISTS idx_rentals_end_date ON rentals(end_date);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    item_id INT REFERENCES items(id) ON DELETE CASCADE,
    shop_id INT REFERENCES shops(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    booking_id INT REFERENCES bookings(booking_id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(booking_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_item ON reviews(item_id);
CREATE INDEX IF NOT EXISTS idx_reviews_shop ON reviews(shop_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

-- Delivery Options
CREATE TABLE IF NOT EXISTS delivery (
    id SERIAL PRIMARY KEY,
    shop_item_id INT REFERENCES shop_items(id) ON DELETE CASCADE,
    delivery_type VARCHAR(50) DEFAULT 'standard', -- standard, express, pickup_only
    base_fee_inr DECIMAL(10, 2) DEFAULT 0.00,
    per_km_fee_inr DECIMAL(10, 2) DEFAULT 0.00,
    max_distance_km INT DEFAULT 50,
    estimated_hours INT DEFAULT 24,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_delivery_shop_item ON delivery(shop_item_id);

-- ============================================================
-- SEED DATA - Categories
-- ============================================================
INSERT INTO categories (name, description, slug, icon_url) VALUES
    ('Vehicles', 'Cars, bikes, scooters and more', 'vehicles', 'https://cdn-icons-png.flaticon.com/512/741/741407.png'),
    ('Event Items', 'Tents, chairs, tables, decorations', 'event-items', 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png'),
    ('Costumes', 'Fancy dress, traditional wear, party costumes', 'costumes', 'https://cdn-icons-png.flaticon.com/512/3048/3048122.png'),
    ('Tools & Construction', 'Power tools, hand tools, construction equipment', 'tools-construction', 'https://cdn-icons-png.flaticon.com/512/1048/1048953.png'),
    ('Electronics', 'Cameras, laptops, projectors, gaming consoles', 'electronics', 'https://cdn-icons-png.flaticon.com/512/2344/2344137.png'),
    ('Furniture', 'Sofas, beds, tables, office furniture', 'furniture', 'https://cdn-icons-png.flaticon.com/512/2271/2271083.png'),
    ('Sports & Fitness', 'Bicycles, gym equipment, sports gear', 'sports-fitness', 'https://cdn-icons-png.flaticon.com/512/857/857455.png'),
    ('Party & Celebrations', 'Sound systems, lights, DJ equipment', 'party-celebrations', 'https://cdn-icons-png.flaticon.com/512/3132/3132693.png')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA - Shops
-- ============================================================
INSERT INTO shops (name, description, address, city, state, pincode, phone, email, latitude, longitude, is_active, rating) VALUES
    ('City Rentals', 'Premium vehicle and equipment rentals in the heart of the city', '12 MG Road, Connaught Place', 'New Delhi', 'Delhi', '110001', '+91-9876543210', 'info@cityrentals.in', 28.6315, 77.2167, true, 4.5),
    ('EventPro Rentals', 'Complete event setup solutions - tents, chairs, sound systems', '45 Anna Salai, T Nagar', 'Chennai', 'Tamil Nadu', '600017', '+91-9876543211', 'events@eventpro.in', 13.0827, 80.2707, true, 4.3),
    ('QuickRent Hub', 'Electronics, tools and more for short-term rentals', '78 Brigade Road', 'Bengaluru', 'Karnataka', '560001', '+91-9876543212', 'hello@quickrent.in', 12.9716, 77.5946, true, 4.7),
    ('Costume World', 'Largest costume and traditional wear rental store', '23 Park Street', 'Kolkata', 'West Bengal', '700016', '+91-9876543213', 'costumes@costumeworld.in', 22.5726, 88.3639, true, 4.2),
    ('Mumbai Rentals', 'All-in-one rental shop for vehicles, furniture and electronics', '56 Linking Road, Bandra', 'Mumbai', 'Maharashtra', '400050', '+91-9876543214', 'rent@mumbairentals.in', 19.0596, 72.8295, true, 4.6)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA - Items
-- ============================================================
INSERT INTO items (category_id, name, description, image_url, base_price_inr, price_unit, is_active) VALUES
    (1, 'Toyota Camry 2023', 'Comfortable sedan perfect for city and highway drives', 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800', 4150.00, 'day', true),
    (1, 'Mountain Bike', 'High-performance mountain bike for trails and city rides', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 2075.00, 'day', true),
    (2, 'Wedding Tent 20x30', 'Large waterproof tent perfect for outdoor weddings and events', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800', 8300.00, 'day', true),
    (2, 'Sound System Package', 'Professional PA system with speakers, mixer and microphones', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', 6225.00, 'day', true),
    (3, 'Royal Sherwani Set', 'Embroidered sherwani with accessories for weddings and functions', 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800', 2490.00, 'day', true),
    (4, 'Bosch Power Drill Set', 'Professional cordless drill with full accessory kit', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800', 830.00, 'day', true),
    (5, 'Canon DSLR Camera Kit', 'Canon EOS 5D Mark IV with 24-70mm lens and accessories', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800', 4980.00, 'day', true),
    (5, 'Gaming Console PS5', 'PlayStation 5 with 2 controllers and 5 games', 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800', 1660.00, 'day', true),
    (7, 'Trek Road Bicycle', 'Lightweight carbon fiber road bike for long-distance rides', 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800', 1245.00, 'day', true),
    (8, 'DJ Equipment Set', 'Complete DJ setup with turntables, mixer and LED lights', 'https://images.unsplash.com/photo-1571266028243-d220c6a6f3a4?w=800', 9960.00, 'day', true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED DATA - Shop Items (availability mapping)
-- ============================================================
INSERT INTO shop_items (shop_id, item_id, price_per_day_inr, quantity_available, is_available, delivery_available, pickup_available, delivery_fee_inr) VALUES
    (1, 1, 4150.00, 3, true, true, true, 830.00),
    (1, 2, 2075.00, 5, true, false, true, 0.00),
    (5, 1, 4565.00, 2, true, true, true, 1245.00),
    (2, 3, 8300.00, 2, true, true, true, 1660.00),
    (2, 4, 6225.00, 1, true, true, true, 830.00),
    (4, 5, 2490.00, 10, true, false, true, 0.00),
    (3, 6, 830.00, 8, true, true, true, 415.00),
    (3, 7, 4980.00, 2, true, false, true, 0.00),
    (5, 8, 1660.00, 3, true, true, true, 415.00),
    (3, 9, 1245.00, 4, true, false, true, 0.00),
    (2, 10, 9960.00, 1, true, true, true, 2075.00)
ON CONFLICT (shop_id, item_id) DO NOTHING;
