-- Enable RLS on user_tasks if not already enabled (it likely is)
ALTER TABLE "public"."user_tasks" ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own tasks
CREATE POLICY "Enable insert for users based on user_id" 
ON "public"."user_tasks" 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Ensure users can view their own tasks (if not already existing)
-- CREATE POLICY "Enable select for users based on user_id" ON "public"."user_tasks" FOR SELECT USING (auth.uid() = user_id);
