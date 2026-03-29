-- Update get_user_wallet_stats to include 'completed' as pending (In Process)
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

    -- If wallet doesn't exist, return 0s
    IF approved_val IS NULL THEN
        approved_val := 0;
        total_val := 0;
    END IF;

    -- Get pending task amount (submitted but not yet approved)
    BEGIN
        SELECT COALESCE(SUM(reward_earned), 0)
        INTO pending_val
        FROM public.user_tasks
        WHERE user_id = user_id_param
        AND status IN ('pending', 'submitted', 'review', 'completed', 'ongoing', 'in_progress');
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
