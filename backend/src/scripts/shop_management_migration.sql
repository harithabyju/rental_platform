-- Migration to add shop status and permitted categories

-- Add status and approved_at to shops if they don't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='status') THEN
        ALTER TABLE shops ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='shops' AND column_name='approved_at') THEN
        ALTER TABLE shops ADD COLUMN approved_at TIMESTAMP;
    END IF;
END $$;

-- Create table for permitted categories per shop
CREATE TABLE IF NOT EXISTS shop_permitted_categories (
    id SERIAL PRIMARY KEY,
    shop_id INT REFERENCES shops(id) ON DELETE CASCADE,
    category_id INT REFERENCES categories(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(shop_id, category_id)
);

CREATE INDEX IF NOT EXISTS idx_spc_shop ON shop_permitted_categories(shop_id);
CREATE INDEX IF NOT EXISTS idx_spc_category ON shop_permitted_categories(category_id);
