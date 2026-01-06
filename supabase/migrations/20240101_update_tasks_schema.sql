-- Add new columns to tasks table for detailed content
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS action_link TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Ensure icon_type is set for existing records if null
UPDATE public.tasks SET icon_type = 'group' WHERE icon_type IS NULL;
