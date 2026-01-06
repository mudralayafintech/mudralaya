-- Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    reward_member NUMERIC,
    reward_free NUMERIC,
    icon_type TEXT, -- 'group', 'campaign', 'feedback', etc.
    frequency TEXT, -- 'daily', 'weekly'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Tasks (Submissions/Completion)
CREATE TABLE IF NOT EXISTS public.user_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending', -- 'pending', 'ongoing', 'completed', 'approved', 'rejected'
    submission_data JSONB,
    reward_earned NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Plans Table
CREATE TABLE IF NOT EXISTS public.plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    features JSONB,
    is_popular BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Wallet Stats / Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    sub_title TEXT,
    amount NUMERIC NOT NULL, -- positive for credit, negative for debit
    type TEXT NOT NULL, -- 'reward', 'payout', 'referral'
    status TEXT DEFAULT 'completed',
    icon_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can view tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Users can view own tasks" ON public.user_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Everyone can view plans" ON public.plans FOR SELECT USING (true);
CREATE POLICY "Users can view own transactions" ON public.transactions FOR SELECT USING (auth.uid() = user_id);

-- Seed some initial data
INSERT INTO public.tasks (title, category, reward_member, reward_free, icon_type, frequency) VALUES
('Join Members for Mudralaya', 'Daily Task', 800, 600, 'group', 'daily'),
('Tide Account Opening', 'One-time', 250, 150, 'rocket', 'one-time'),
('Survey Form', 'Daily Task', 250, 250, 'feedback', 'daily')
ON CONFLICT DO NOTHING;

INSERT INTO public.plans (name, price, features, is_popular) VALUES
('Free', 0, '["Access to basic tasks", "Standard support"]', false),
('Individual', 25000, '["High reward tasks", "Priority support", "Earning guidance"]', true),
('Business', 50000, '["All individual features", "Bonus rewards"]', false)
ON CONFLICT DO NOTHING;
