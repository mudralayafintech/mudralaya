-- Ensure get_user_wallet_stats function exists and uses the correct implementation
-- This function uses the transactions table for wallet stats

CREATE OR REPLACE FUNCTION public.get_user_wallet_stats(user_id_param UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB;
    approved_sum NUMERIC;
    pending_sum NUMERIC;
    total_sum NUMERIC;
    payout_sum NUMERIC;
    today_sum NUMERIC;
    monthly_sum NUMERIC;
BEGIN
    -- Approved Balance (completed rewards - only positive amounts from reward type)
    SELECT COALESCE(SUM(amount), 0) INTO approved_sum 
    FROM public.transactions 
    WHERE user_id = user_id_param 
      AND status = 'completed' 
      AND type = 'reward'
      AND amount > 0;

    -- Pending Amount (tasks that are ongoing or completed but not yet approved)
    SELECT COALESCE(SUM(reward_earned), 0) INTO pending_sum 
    FROM public.user_tasks 
    WHERE user_id = user_id_param AND status IN ('pending', 'ongoing', 'completed');

    -- Total Balance
    total_sum := approved_sum + pending_sum;

    -- Total Payout
    SELECT COALESCE(ABS(SUM(amount)), 0) INTO payout_sum 
    FROM public.transactions 
    WHERE user_id = user_id_param AND type = 'payout' AND status = 'completed';

    -- Today's Earning (only rewards, positive amounts)
    SELECT COALESCE(SUM(amount), 0) INTO today_sum 
    FROM public.transactions 
    WHERE user_id = user_id_param 
      AND created_at >= CURRENT_DATE
      AND type = 'reward'
      AND amount > 0;

    -- Monthly Earning (only rewards, positive amounts)
    SELECT COALESCE(SUM(amount), 0) INTO monthly_sum 
    FROM public.transactions 
    WHERE user_id = user_id_param 
      AND created_at >= date_trunc('month', CURRENT_DATE)
      AND type = 'reward'
      AND amount > 0;

    result := jsonb_build_object(
        'approved', approved_sum,
        'pending', pending_sum,
        'total', total_sum,
        'payout', payout_sum,
        'today', today_sum,
        'monthly', monthly_sum
    );

    RETURN result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_wallet_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_wallet_stats(UUID) TO anon;
