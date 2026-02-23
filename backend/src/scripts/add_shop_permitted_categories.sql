-- Run this migration once to add shop_permitted_categories table
CREATE TABLE IF NOT EXISTS shop_permitted_categories (
    shop_id INTEGER NOT NULL REFERENCES shops(shop_id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (shop_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_spc_shop_id ON shop_permitted_categories(shop_id);
CREATE INDEX IF NOT EXISTS idx_spc_category_id ON shop_permitted_categories(category_id);

-- Also ensure items table has image_url column (in case it was not added before)
ALTER TABLE items ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
