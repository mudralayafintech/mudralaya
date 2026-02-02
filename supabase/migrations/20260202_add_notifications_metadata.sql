-- Add metadata column to notifications table to store additional JSON data
ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Update the type constraint to include 'task' type
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('info', 'success', 'warning', 'error', 'task'));

-- Create index on metadata for better query performance
CREATE INDEX IF NOT EXISTS idx_notifications_metadata ON public.notifications USING GIN (metadata);

-- Comment
COMMENT ON COLUMN public.notifications.metadata IS 'JSON metadata for storing additional notification context (e.g., task_id, task_type)';
