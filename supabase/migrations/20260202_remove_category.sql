-- Remove category column from tasks table
ALTER TABLE public.tasks DROP COLUMN IF EXISTS category;
