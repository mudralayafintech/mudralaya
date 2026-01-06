-- 1. Ensure public.users has all necessary columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profession TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS plan TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS mobile_number TEXT;

-- 2. Improved Trigger Function to sync data from join_requests
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    found_full_name TEXT;
    found_email_id TEXT;
    found_dob DATE;
    found_profession TEXT;
    found_plan TEXT;
    clean_phone TEXT;
BEGIN
    -- NEW.phone usually comes as '+918899883973'
    clean_phone := NEW.phone;
    
    -- Try to find the most recent join request by phone
    SELECT full_name, email_id, date_of_birth, profession, form
    INTO found_full_name, found_email_id, found_dob, found_profession, found_plan
    FROM public.join_requests
    WHERE mobile_number = clean_phone 
       OR mobile_number = substring(clean_phone from '(\d{10})$')
       OR email_id = NEW.email
    ORDER BY created_at DESC
    LIMIT 1;

    -- If not found by phone, and email exists, try by email (unlikely for phone login but good for future)
    IF found_full_name IS NULL AND NEW.email IS NOT NULL THEN
        SELECT full_name, email_id, date_of_birth, profession, form
        INTO found_full_name, found_email_id, found_dob, found_profession, found_plan
        FROM public.join_requests
        WHERE email_id = NEW.email
        ORDER BY created_at DESC
        LIMIT 1;
    END IF;

    -- Insert or Update into public.users
    INSERT INTO public.users (
        id, 
        phone,
        mobile_number,
        full_name, 
        email_id, 
        date_of_birth, 
        profession,
        plan,
        role,
        created_at
    )
    VALUES (
        NEW.id,
        NEW.phone,
        substring(NEW.phone from '(\d{10})$'),
        found_full_name,
        COALESCE(found_email_id, NEW.email),
        found_dob,
        found_profession,
        found_plan,
        'user',
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email_id = EXCLUDED.email_id,
        date_of_birth = EXCLUDED.date_of_birth,
        profession = EXCLUDED.profession,
        plan = EXCLUDED.plan,
        mobile_number = EXCLUDED.mobile_number;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure the trigger is active on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Sync existing users to catch up
DO $$
DECLARE
    r RECORD;
    f_full_name TEXT;
    f_email_id TEXT;
    f_dob DATE;
    f_profession TEXT;
    f_plan TEXT;
BEGIN
    FOR r IN SELECT id, phone, email FROM auth.users LOOP
        -- Match logic
        SELECT full_name, email_id, date_of_birth, profession, form
        INTO f_full_name, f_email_id, f_dob, f_profession, f_plan
        FROM public.join_requests
        WHERE mobile_number = r.phone 
           OR mobile_number = substring(r.phone from '(\d{10})$')
           OR email_id = r.email
        ORDER BY created_at DESC
        LIMIT 1;

        -- Update public.users
        INSERT INTO public.users (
            id, phone, mobile_number, full_name, email_id, date_of_birth, profession, plan, role
        ) VALUES (
            r.id, r.phone, substring(r.phone from '(\d{10})$'), f_full_name, COALESCE(f_email_id, r.email), f_dob, f_profession, f_plan, 'user'
        )
        ON CONFLICT (id) DO UPDATE SET
            full_name = COALESCE(f_full_name, public.users.full_name),
            email_id = COALESCE(f_email_id, r.email, public.users.email_id),
            date_of_birth = COALESCE(f_dob, public.users.date_of_birth),
            profession = COALESCE(f_profession, public.users.profession),
            plan = COALESCE(f_plan, public.users.plan),
            mobile_number = COALESCE(substring(r.phone from '(\d{10})$'), public.users.mobile_number);
    END LOOP;
END $$;
