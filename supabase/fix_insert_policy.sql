DO $$
BEGIN
    -- Enable RLS just in case
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

    -- Drop existing insert policy if it exists to avoid conflicts
    DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.users;
    
    -- Create the policy
    CREATE POLICY "Enable insert for users based on user_id" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

    -- Ensure update policy exists for 'users'
    DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.users;
    CREATE POLICY "Enable update for users based on user_id" ON public.users
    FOR UPDATE USING (auth.uid() = id);

    -- Ensure select policy exists
    DROP POLICY IF EXISTS "Enable select for users based on user_id" ON public.users;
    CREATE POLICY "Enable select for users based on user_id" ON public.users
    FOR SELECT USING (auth.uid() = id);

END $$;
