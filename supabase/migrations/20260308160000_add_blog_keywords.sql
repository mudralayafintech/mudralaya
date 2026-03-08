-- Add SEO keyword and tags columns to blogs table
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS primary_keywords TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS secondary_keywords TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS tags TEXT;
