-- Add verification fields to shops table
ALTER TABLE shops ADD COLUMN IF NOT EXISTS govt_id_url TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS shop_license_url TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS bank_account_name TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS bank_account_number TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS bank_ifsc TEXT;
ALTER TABLE shops ADD COLUMN IF NOT EXISTS bank_name TEXT;

-- Update existing shops to have 'incomplete' status if they don't have basic details
-- (assuming current shops might be in 'pending' or 'approved')
-- However, for the flow to work correctly, we might want to keep approved shops approved 
-- but require details for new ones.

-- Update the status constraint if it exists, or just ensure 'incomplete' is a valid status
-- Assuming status is a VARCHAR or ENUM. 
-- In PostgreSQL, if we want to change existing status for pending shops:
UPDATE shops SET status = 'incomplete' WHERE status = 'pending';

-- Optional: ensure 'incomplete' is the default for new registrations
-- ALTER TABLE shops ALTER COLUMN status SET DEFAULT 'incomplete';
