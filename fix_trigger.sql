-- Fix notification trigger to use correct user table
DROP TRIGGER IF EXISTS on_task_created ON public.tasks;
DROP FUNCTION IF EXISTS notify_users_of_new_task();

-- Fix notification trigger: REMOVED to prevent O(N) crash.
-- We are switching to Firebase Cloud Messaging (FCM) or Broadcasts.
DROP TRIGGER IF EXISTS on_task_created ON public.tasks;
DROP FUNCTION IF EXISTS notify_users_of_new_task();
