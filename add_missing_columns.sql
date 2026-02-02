-- Add missing columns to tasks table
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS reward_info TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS steps TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS reward_min DECIMAL;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS reward_max DECIMAL;
