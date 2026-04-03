-- Migration: Fix Task Notification Trigger
-- Fixing the column and table references in notify_users_of_new_task

CREATE OR REPLACE FUNCTION public.notify_users_of_new_task()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert notification for all users (using the 'users' table instead of 'profiles')
  -- Using 'reward_free' column instead of non-existent 'reward'
  INSERT INTO public.notifications (user_id, title, message, type, metadata)
  SELECT 
    u.id,
    'New Task Available! 🎯',
    'A new task "' || NEW.title || '" is now available with a reward of ₹' || COALESCE(NEW.reward_free, 0),
    'task',
    jsonb_build_object(
      'task_id', NEW.id, 
      'task_title', NEW.title, 
      'task_type', COALESCE(NEW.task_type, 'Daily'),
      'reward', COALESCE(NEW.reward_free, 0)
    )
  FROM public.users u
  WHERE u.id IS NOT NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach the trigger to ensure it's using the updated function
DROP TRIGGER IF EXISTS on_task_created ON public.tasks;

CREATE TRIGGER on_task_created
  AFTER INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_users_of_new_task();

COMMENT ON FUNCTION public.notify_users_of_new_task() IS 'Automatically creates notifications for all users when a new task is added';
