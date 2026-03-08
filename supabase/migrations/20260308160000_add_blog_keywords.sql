-- Add SEO keyword, tags, and blog metadata columns to blogs table
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS primary_keywords TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS secondary_keywords TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS tags TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS hashtags TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.blogs ADD COLUMN IF NOT EXISTS author TEXT;
