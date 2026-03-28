-- Additional indexing for performance optimization
CREATE INDEX IF NOT EXISTS idx_items_base_price ON items(base_price_inr);
CREATE INDEX IF NOT EXISTS idx_shop_items_delivery_fee ON shop_items(delivery_fee_inr);
CREATE INDEX IF NOT EXISTS idx_items_description ON items USING gin(to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON bookings(created_at);
