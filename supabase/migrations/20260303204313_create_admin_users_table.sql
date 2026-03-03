-- Create the admin_users table for mapping login credentials to specific roles like 'blogger'
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'blogger',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only super authenticated service roles can access this table directly
CREATE POLICY "Service Role full access"
    ON public.admin_users
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Insert a default Blogger user
INSERT INTO public.admin_users (username, password, role)
VALUES ('blogger', 'password', 'blogger')
ON CONFLICT (username) DO NOTHING;
