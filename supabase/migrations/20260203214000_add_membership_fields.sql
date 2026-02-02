-- Add membership fields to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS membership_expiry timestamptz,
ADD COLUMN IF NOT EXISTS membership_type text;
