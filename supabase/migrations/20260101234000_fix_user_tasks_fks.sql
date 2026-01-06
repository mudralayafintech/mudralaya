-- Add foreign key for user_tasks -> users if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_tasks_user_id_fkey') THEN
    ALTER TABLE "public"."user_tasks" 
    ADD CONSTRAINT "user_tasks_user_id_fkey" 
    FOREIGN KEY ("user_id") 
    REFERENCES "public"."users" ("id") 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add foreign key for user_tasks -> tasks if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'user_tasks_task_id_fkey') THEN
    ALTER TABLE "public"."user_tasks" 
    ADD CONSTRAINT "user_tasks_task_id_fkey" 
    FOREIGN KEY ("task_id") 
    REFERENCES "public"."tasks" ("id") 
    ON DELETE CASCADE;
  END IF;
END $$;
