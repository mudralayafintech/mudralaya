-- Quick fix: Add task_type column and notification trigger
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS task_type TEXT DEFAULT 'Daily';

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_notifications_metadata ON public.notifications USING GIN (metadata);

CREATE OR REPLACE FUNCTION notify_users_of_new_task()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, metadata)
  SELECT 
    p.id,
    'New Task Available! 🎯',
    'A new task "' || NEW.title || '" is now available with a reward of ₹' || COALESCE(NEW.reward_free, NEW.reward, 0),
    'task',
    jsonb_build_object(
      'task_id', NEW.id, 
      'task_title', NEW.title, 
      'task_type', COALESCE(NEW.task_type, NEW.type, 'Daily'),
      'reward', COALESCE(NEW.reward_free, NEW.reward, 0)
    )
  FROM public.profiles p
  WHERE p.id IS NOT NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_task_created ON public.tasks;

CREATE TRIGGER on_task_created
  AFTER INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION notify_users_of_new_task();
