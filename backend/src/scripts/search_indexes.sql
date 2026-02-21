-- Database indexing for Search Module performance
-- items.category_id
-- shops.lat, shops.lng
-- bookings.item_id

CREATE INDEX IF NOT EXISTS idx_items_category_id ON items(category_id);
CREATE INDEX IF NOT EXISTS idx_shops_location ON shops(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_bookings_item_id ON bookings(item_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates_status ON bookings(start_date, end_date, status);
CREATE INDEX IF NOT EXISTS idx_shop_items_price ON shop_items(price_per_day_inr);
