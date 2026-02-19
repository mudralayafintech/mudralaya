-- Combined migration for task notifications and metadata
-- This migration combines:
-- 1. Adding metadata column to notifications
-- 2. Adding task_type column (if not exists)  
-- 3. Creating notification trigger for new tasks

-- 1. Add metadata column to notifications (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE public.notifications 
    ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    
    CREATE INDEX IF NOT EXISTS idx_notifications_metadata ON public.notifications USING GIN (metadata);
    
    COMMENT ON COLUMN public.notifications.metadata IS 'JSON metadata for storing additional notification context (e.g., task_id, task_type)';
  END IF;
END $$;

-- 2. Update type constraint to include 'task' type
ALTER TABLE public.notifications 
DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
ADD CONSTRAINT notifications_type_check 
CHECK (type IN ('info', 'success', 'warning', 'error', 'task'));

-- 3. Add task_type column to tasks table (if not exists)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tasks' AND column_name = 'task_type'
  ) THEN
    ALTER TABLE public.tasks 
    ADD COLUMN task_type TEXT DEFAULT 'Daily';
  END IF;
END $$;

-- 4. Create function to notify users of new tasks
CREATE OR REPLACE FUNCTION notify_users_of_new_task()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for all users with profiles
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

-- 5. Drop and recreate trigger
DROP TRIGGER IF EXISTS on_task_created ON public.tasks;

CREATE TRIGGER on_task_created
  AFTER INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION notify_users_of_new_task();

-- Comments
COMMENT ON FUNCTION notify_users_of_new_task() IS 'Automatically creates notifications for all users when a new task is added';
COMMENT ON TRIGGER on_task_created ON public.tasks IS 'Triggers notification creation when new tasks are inserted';
