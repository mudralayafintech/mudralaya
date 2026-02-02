ALTER TABLE public.notifications 
ADD COLUMN IF NOT EXISTS is_global BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_notifications_is_global ON public.notifications(is_global);
