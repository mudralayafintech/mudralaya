-- Add task_type column to tasks table with default value 'Daily'
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS task_type text DEFAULT 'Daily';

-- Optional: Create an index for faster filtering if you have many tasks
CREATE INDEX IF NOT EXISTS idx_tasks_task_type ON public.tasks(task_type);

-- Comment on column
COMMENT ON COLUMN public.tasks.task_type IS 'Cateogry of task: Daily or Dedicated';
