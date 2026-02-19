-- Migration: Add task completion flow with transactions
-- This migration adds RLS policies and ensures proper flow from task completion to wallet balance

-- Add INSERT policy for transactions (service role will bypass, but good to have)
DROP POLICY IF EXISTS "Service role can insert transactions" ON public.transactions;
CREATE POLICY "Service role can insert transactions" ON public.transactions
    FOR INSERT
    WITH CHECK (true); -- Service role bypasses RLS anyway, but this is for clarity

-- Add UPDATE policy for user_tasks (users can update their own tasks)
DROP POLICY IF EXISTS "Users can update own tasks" ON public.user_tasks;
CREATE POLICY "Users can update own tasks" ON public.user_tasks
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Add INSERT policy for user_tasks (users can insert their own tasks)
DROP POLICY IF EXISTS "Users can insert own tasks" ON public.user_tasks;
CREATE POLICY "Users can insert own tasks" ON public.user_tasks
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Ensure transactions table has proper structure
-- Add any missing columns if needed (this is idempotent)
DO $$
BEGIN
    -- Add icon_type if it doesn't exist (it should, but just in case)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'transactions' 
        AND column_name = 'icon_type'
    ) THEN
        ALTER TABLE public.transactions ADD COLUMN icon_type TEXT;
    END IF;
END $$;
