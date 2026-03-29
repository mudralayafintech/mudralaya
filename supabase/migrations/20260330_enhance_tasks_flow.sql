-- Migration: Enhance Task Flow and Wallet Integration
-- 1. Add submission_image_url to user_tasks
ALTER TABLE public.user_tasks 
ADD COLUMN IF NOT EXISTS submission_image_url TEXT;

-- 2. Create function to update wallet balance on transaction completion
CREATE OR REPLACE FUNCTION public.handle_wallet_transaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Only process completed transactions
    IF NEW.status = 'completed' THEN
        -- Increase balance for rewards and plans (if plan adds value, but mostly rewards)
        -- Decrease balance for payouts
        IF NEW.type IN ('reward', 'referral', 'cashback') THEN
            UPDATE public.wallets
            SET 
                balance = balance + NEW.amount,
                total_earnings = total_earnings + NEW.amount,
                updated_at = now()
            WHERE user_id = NEW.user_id;
        ELSIF NEW.type = 'payout' THEN
            UPDATE public.wallets
            SET 
                balance = balance - ABS(NEW.amount),
                updated_at = now()
            WHERE user_id = NEW.user_id;
        END IF;

        -- Update daily earnings if it's a reward/referral
        IF NEW.type IN ('reward', 'referral') THEN
            INSERT INTO public.daily_earnings (user_id, date, amount)
            VALUES (NEW.user_id, CURRENT_DATE, NEW.amount)
            ON CONFLICT (user_id, date) 
            DO UPDATE SET amount = public.daily_earnings.amount + EXCLUDED.amount;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger for wallet updates
DROP TRIGGER IF EXISTS on_transaction_completed ON public.transactions;
CREATE TRIGGER on_transaction_completed
    AFTER INSERT OR UPDATE OF status ON public.transactions
    FOR EACH ROW
    WHEN (NEW.status = 'completed')
    EXECUTE FUNCTION public.handle_wallet_transaction();

-- 4. Create function to ensure wallet exists for a user
CREATE OR REPLACE FUNCTION public.ensure_user_wallet_exists()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.wallets (user_id, balance, total_earnings)
    VALUES (NEW.id, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger for wallet auto-creation on user creation
DROP TRIGGER IF EXISTS on_user_created_create_wallet ON public.users;
CREATE TRIGGER on_user_created_create_wallet
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.ensure_user_wallet_exists();

-- 6. Helper: Ensure wallets exist for all current users
INSERT INTO public.wallets (user_id, balance, total_earnings)
SELECT id, 0, 0 FROM public.users
ON CONFLICT (user_id) DO NOTHING;

-- 7. One-time Reward Backfill: Credit 250 INR to existing paid members
-- Users who have paid for membership but haven't received the bonus yet
DO $$
DECLARE
    u_rec RECORD;
BEGIN
    FOR u_rec IN 
        SELECT id, membership_type 
        FROM public.users 
        WHERE membership_type IS NOT NULL 
        AND membership_type NOT IN ('free', 'none')
    LOOP
        -- Check if bonus already exists
        IF NOT EXISTS (
            SELECT 1 FROM public.transactions 
            WHERE user_id = u_rec.id 
            AND title = 'Membership Joining Bonus'
        ) THEN
            -- Insert transaction (the trigger will update the wallet balance automatically)
            INSERT INTO public.transactions (
                user_id, 
                title, 
                sub_title, 
                amount, 
                type, 
                status, 
                icon_type
            )
            VALUES (
                u_rec.id, 
                'Membership Joining Bonus', 
                'Early member bonus', 
                250, 
                'reward', 
                'completed', 
                'gift'
            );
        END IF;
    END LOOP;
END $$;
