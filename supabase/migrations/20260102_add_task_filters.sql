-- Add target_audience column to tasks table for filtering
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS target_audience TEXT[] DEFAULT ARRAY['All'];

-- Update existing tasks to have a default audience
UPDATE public.tasks SET target_audience = ARRAY['Student', 'House Wife', 'Working Professional', 'Part Time'] WHERE target_audience IS NULL OR target_audience = ARRAY['All'];
