-- Create function to notify all users when a new task is added
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

-- Drop trigger if exists
DROP TRIGGER IF EXISTS on_task_created ON public.tasks;

-- Create trigger that fires after new task insertion
CREATE TRIGGER on_task_created
  AFTER INSERT ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION notify_users_of_new_task();

-- Comments
COMMENT ON FUNCTION notify_users_of_new_task() IS 'Automatically creates notifications for all users when a new task is added';
COMMENT ON TRIGGER on_task_created ON public.tasks IS 'Triggers notification creation when new tasks are inserted';
