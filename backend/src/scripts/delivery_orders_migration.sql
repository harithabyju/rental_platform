-- ============================================================
-- DELIVERY MODULE MIGRATION
-- Creates delivery_orders table and adds delivery_address to bookings
-- ============================================================

-- Add delivery_address to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS delivery_address TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS delivery_city VARCHAR(100);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS delivery_lat DECIMAL(10, 8);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS delivery_lng DECIMAL(11, 8);

-- Delivery Orders Table (tracks lifecycle of each delivery)
CREATE TABLE IF NOT EXISTS delivery_orders (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(booking_id) ON DELETE CASCADE UNIQUE,
    status VARCHAR(30) DEFAULT 'pending',
    -- Status lifecycle: pending → assigned → picked_up → out_for_delivery → delivered | failed
    delivery_address TEXT NOT NULL,
    delivery_city VARCHAR(100),
    delivery_lat DECIMAL(10, 8),
    delivery_lng DECIMAL(11, 8),
    estimated_fee_inr DECIMAL(10, 2) DEFAULT 0.00,
    distance_km DECIMAL(8, 2),
    estimated_delivery_at TIMESTAMP,
    delivered_at TIMESTAMP,
    agent_name VARCHAR(100),
    agent_phone VARCHAR(20),
    notes TEXT,
    status_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_delivery_orders_booking ON delivery_orders(booking_id);
CREATE INDEX IF NOT EXISTS idx_delivery_orders_status ON delivery_orders(status);

-- Ensure the delivery table from dashboard_schema.sql also exists (for shop-level delivery config)
CREATE TABLE IF NOT EXISTS delivery (
    id SERIAL PRIMARY KEY,
    shop_item_id INT REFERENCES shop_items(id) ON DELETE CASCADE,
    delivery_type VARCHAR(50) DEFAULT 'standard',
    base_fee_inr DECIMAL(10, 2) DEFAULT 0.00,
    per_km_fee_inr DECIMAL(10, 2) DEFAULT 2.00,
    max_distance_km INT DEFAULT 50,
    estimated_hours INT DEFAULT 24,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_delivery_shop_item ON delivery(shop_item_id);
