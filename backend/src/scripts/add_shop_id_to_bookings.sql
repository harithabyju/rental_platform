
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS shop_id INTEGER;

-- Try to populate shop_id from shop_items for existing bookings as a fallback
UPDATE bookings b
SET shop_id = (SELECT shop_id FROM shop_items si WHERE si.item_id = b.item_id LIMIT 1)
WHERE b.shop_id IS NULL;

-- In a real scenario, we might need a more robust migration if items exist in multiple shops.
-- But for now, this ensures the column exists and is partially populated.
