-- Create wallets table
CREATE TABLE IF NOT EXISTS public.wallets (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    balance numeric DEFAULT 0 CHECK (balance >= 0),
    total_earnings numeric DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create daily_earnings table
CREATE TABLE IF NOT EXISTS public.daily_earnings (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    date date DEFAULT CURRENT_DATE,
    amount numeric DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_earnings ENABLE ROW LEVEL SECURITY;

-- Policies for wallets
CREATE POLICY "Users can view their own wallet"
    ON public.wallets FOR SELECT
    USING (auth.uid() = user_id);

-- Policies for daily_earnings
CREATE POLICY "Users can view their own daily earnings"
    ON public.daily_earnings FOR SELECT
    USING (auth.uid() = user_id);

-- Create RPC function to get wallet stats
DROP FUNCTION IF EXISTS public.get_user_wallet_stats(uuid);

CREATE OR REPLACE FUNCTION public.get_user_wallet_stats(user_id_param uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    today_val numeric;
    monthly_val numeric;
    approved_val numeric;
    pending_val numeric;
    total_val numeric;
    payout_val numeric;
BEGIN
    -- Get today's earnings
    SELECT COALESCE(SUM(amount), 0)
    INTO today_val
    FROM public.daily_earnings
    WHERE user_id = user_id_param
    AND date = CURRENT_DATE;

    -- Get monthly earnings
    SELECT COALESCE(SUM(amount), 0)
    INTO monthly_val
    FROM public.daily_earnings
    WHERE user_id = user_id_param
    AND date >= date_trunc('month', CURRENT_DATE);

    -- Get approved balance (current wallet balance)
    SELECT COALESCE(balance, 0), COALESCE(total_earnings, 0)
    INTO approved_val, total_val
    FROM public.wallets
    WHERE user_id = user_id_param;

    -- If wallet doesn't exist, return 0s (or create one?)
    IF approved_val IS NULL THEN
        approved_val := 0;
        total_val := 0;
    END IF;

    -- Get pending task amount (assuming from user_tasks table if it exists, or placeholder)
    -- Adjust logic based on actual `user_tasks` or similar table structure
    -- For now using a placeholder query if table exists, else 0
    BEGIN
        SELECT COALESCE(SUM(reward_earned), 0)
        INTO pending_val
        FROM public.user_tasks
        WHERE user_id = user_id_param
        AND status IN ('pending', 'submitted', 'review');
    EXCEPTION WHEN OTHERS THEN
        pending_val := 0;
    END;

    -- Get total payout
    BEGIN
        SELECT COALESCE(SUM(amount), 0)
        INTO payout_val
        FROM public.transactions
        WHERE user_id = user_id_param
        AND type = 'payout'
        AND status = 'success';
    EXCEPTION WHEN OTHERS THEN
        payout_val := 0;
    END;

    -- Return JSON
    RETURN json_build_object(
        'today', today_val,
        'monthly', monthly_val,
        'approved', approved_val,
        'pending', pending_val,
        'total', total_val,
        'payout', payout_val
    );
END;
$$;
