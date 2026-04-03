-- Add new columns to users for onboarding
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS interests TEXT[];

-- Create companies table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    overview TEXT,
    sops TEXT,
    training_preview TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Companies are viewable by everyone" ON public.companies
    FOR SELECT USING (true);
    
-- Admins only can insert/update/delete companies
CREATE POLICY "Admins can insert companies" ON public.companies
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users WHERE admin_users.id = auth.uid() OR auth.jwt() ->> 'role' = 'service_role'
        )
    );

CREATE POLICY "Admins can update companies" ON public.companies
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.admin_users WHERE admin_users.id = auth.uid() OR auth.jwt() ->> 'role' = 'service_role'
        )
    );

CREATE POLICY "Admins can delete companies" ON public.companies
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.admin_users WHERE admin_users.id = auth.uid() OR auth.jwt() ->> 'role' = 'service_role'
        )
    );

-- Create user_company_locks table
CREATE TABLE IF NOT EXISTS public.user_company_locks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    locked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    CONSTRAINT one_active_lock_per_user UNIQUE NULLS NOT DISTINCT (user_id, status)
);

-- Note: In older Postgres versions, partial unique indexes are better.
-- Let's replace the above constraint with a partial index in the migration:
ALTER TABLE public.user_company_locks DROP CONSTRAINT IF EXISTS one_active_lock_per_user;
CREATE UNIQUE INDEX IF NOT EXISTS one_active_lock_per_user_idx ON public.user_company_locks(user_id) WHERE status = 'active';

ALTER TABLE public.user_company_locks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own locks" ON public.user_company_locks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own locks" ON public.user_company_locks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own locks" ON public.user_company_locks
    FOR UPDATE USING (auth.uid() = user_id);

-- Create training_modules table
CREATE TABLE IF NOT EXISTS public.training_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Training modules viewable by everyone" ON public.training_modules FOR SELECT USING (true);

-- Admin policies for training modules
CREATE POLICY "Admins can insert training modules" ON public.training_modules
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users WHERE admin_users.id = auth.uid() OR auth.jwt() ->> 'role' = 'service_role'
        )
    );

CREATE POLICY "Admins can update training modules" ON public.training_modules
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.admin_users WHERE admin_users.id = auth.uid() OR auth.jwt() ->> 'role' = 'service_role'
        )
    );

CREATE POLICY "Admins can delete training modules" ON public.training_modules
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.admin_users WHERE admin_users.id = auth.uid() OR auth.jwt() ->> 'role' = 'service_role'
        )
    );

-- Create user_trainings tracking
CREATE TABLE IF NOT EXISTS public.user_trainings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

ALTER TABLE public.user_trainings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own training progress" ON public.user_trainings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own training progress" ON public.user_trainings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training progress" ON public.user_trainings
    FOR UPDATE USING (auth.uid() = user_id);

-- Create certificates table
CREATE TABLE IF NOT EXISTS public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_paid BOOLEAN NOT NULL DEFAULT false,
    UNIQUE(user_id, company_id)
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own certificates" ON public.certificates
    FOR SELECT USING (auth.uid() = user_id);
    
-- Update trigger for updated_at on user_trainings
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_user_trainings_modtime ON public.user_trainings;
CREATE TRIGGER update_user_trainings_modtime
BEFORE UPDATE ON public.user_trainings
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
