-- Function to get wallet stats for a user
CREATE OR REPLACE FUNCTION get_user_wallet_stats(user_id_param UUID)
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
    -- Approved Balance (completed rewards minus payouts)
    SELECT COALESCE(SUM(amount), 0) INTO approved_sum 
    FROM public.transactions 
    WHERE user_id = user_id_param AND status = 'completed';

    -- Pending Amount
    SELECT COALESCE(SUM(reward_earned), 0) INTO pending_sum 
    FROM public.user_tasks 
    WHERE user_id = user_id_param AND status IN ('pending', 'ongoing');

    -- Total Balance
    total_sum := approved_sum + pending_sum;

    -- Total Payout
    SELECT COALESCE(ABS(SUM(amount)), 0) INTO payout_sum 
    FROM public.transactions 
    WHERE user_id = user_id_param AND type = 'payout' AND status = 'completed';

    -- Today's Earning
    SELECT COALESCE(SUM(amount), 0) INTO today_sum 
    FROM public.transactions 
    WHERE user_id = user_id_param AND created_at >= CURRENT_DATE;

    -- Monthly Earning
    SELECT COALESCE(SUM(amount), 0) INTO monthly_sum 
    FROM public.transactions 
    WHERE user_id = user_id_param AND created_at >= date_trunc('month', CURRENT_DATE);

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
