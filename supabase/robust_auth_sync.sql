-- 1. Ensure all columns are present
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS date_of_birth DATE;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS profession TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS plan TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS mobile_number TEXT;

-- 2. Fixed Trigger with robust phone matching
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    found_full_name TEXT;
    found_email_id TEXT;
    found_dob DATE;
    found_profession TEXT;
    found_plan TEXT;
    search_phone TEXT;
BEGIN
    -- Extract last 10 digits from the auth phone
    search_phone := substring(NEW.phone from '(\d{10})$');
    
    -- Match if either the full phone matches OR the last 10 digits match on either side
    SELECT full_name, email_id, date_of_birth, profession, form
    INTO found_full_name, found_email_id, found_dob, found_profession, found_plan
    FROM public.join_requests
    WHERE 
        mobile_number = NEW.phone OR
        mobile_number = search_phone OR
        substring(mobile_number from '(\d{10})$') = search_phone OR
        mobile_number = REPLACE(NEW.phone, '+', '')
    ORDER BY created_at DESC
    LIMIT 1;

    -- Update or Insert
    INSERT INTO public.users (
        id, phone, mobile_number, full_name, email_id, date_of_birth, profession, plan, role
    )
    VALUES (
        NEW.id, NEW.phone, search_phone,
        found_full_name, COALESCE(found_email_id, NEW.email),
        found_dob, found_profession, found_plan, 'user'
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

-- 3. Re-apply backfill for all users
DO $$
DECLARE
    r RECORD;
    f_full_name TEXT;
    f_email_id TEXT;
    f_dob DATE;
    f_profession TEXT;
    f_plan TEXT;
    s_phone TEXT;
BEGIN
    FOR r IN SELECT id, phone, email FROM auth.users LOOP
        s_phone := substring(r.phone from '(\d{10})$');

        SELECT full_name, email_id, date_of_birth, profession, form
        INTO f_full_name, f_email_id, f_dob, f_profession, f_plan
        FROM public.join_requests
        WHERE 
            mobile_number = r.phone OR
            mobile_number = s_phone OR
            substring(mobile_number from '(\d{10})$') = s_phone OR
            mobile_number = REPLACE(r.phone, '+', '')
        ORDER BY created_at DESC
        LIMIT 1;

        UPDATE public.users SET
            full_name = f_full_name,
            email_id = COALESCE(f_email_id, r.email),
            date_of_birth = f_dob,
            profession = f_profession,
            plan = f_plan,
            mobile_number = s_phone
        WHERE id = r.id;
    END LOOP;
END $$;
