-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Function to call the Edge Function
CREATE OR REPLACE FUNCTION public.trigger_task_notification()
RETURNS TRIGGER AS $$
DECLARE
  request_id integer;
BEGIN
  -- Call the Edge Function (Replace URL if project ID changes, but this is current)
  -- Note: Using the ANON key or Service Role key header might be needed if --no-verify-jwt is NOT used.
  -- Since we deployed with --no-verify-jwt, no auth header is strictly required, 
  -- but adding Content-Type is good practice.
  SELECT extensions.net_http_post(
    url := 'https://mhsizqmhqngcaztresmh.supabase.co/functions/v1/push-notification',
    body := jsonb_build_object(
        'record', row_to_json(NEW),
        'type', TG_OP,
        'table', TG_TABLE_NAME,
        'schema', TG_TABLE_SCHEMA
    ),
    headers := '{"Content-Type": "application/json"}'::jsonb
  ) INTO request_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the Trigger
DROP TRIGGER IF EXISTS on_task_created_notification ON public.tasks;

CREATE TRIGGER on_task_created_notification
AFTER INSERT ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.trigger_task_notification();
