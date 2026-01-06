-- 1. Modify public.users table structure
ALTER TABLE public.users DROP COLUMN IF EXISTS first_name;
ALTER TABLE public.users DROP COLUMN IF EXISTS last_name;
ALTER TABLE public.users DROP COLUMN IF EXISTS email;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- 2. Improved Trigger Function to fetch data from join_requests
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    found_full_name TEXT;
    found_email_id TEXT;
    found_dob DATE;
    found_profession TEXT;
    clean_phone TEXT;
BEGIN
    -- Normalize phone for lookup (removing country code if necessary, or keeping it depending on join_requests data)
    -- In mongo transfer, we saw "8899883973" in mobileNumber but auth might store "+918899883973"
    clean_phone := NEW.phone;
    
    -- Try to find a match in join_requests
    -- Match with full number or just last 10 digits to be safe
    SELECT full_name, email_id, date_of_birth, profession 
    INTO found_full_name, found_email_id, found_dob, found_profession
    FROM public.join_requests
    WHERE mobile_number = clean_phone 
       OR mobile_number = substring(clean_phone from '(\d{10})$')
    LIMIT 1;

    -- Insert into public.users with data from join_requests if found
    INSERT INTO public.users (
        id, 
        phone, 
        role, 
        full_name, 
        email_id, 
        date_of_birth, 
        profession
    )
    VALUES (
        NEW.id,
        NEW.phone,
        'user',
        found_full_name,
        found_email_id,
        found_dob,
        found_profession
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email_id = EXCLUDED.email_id,
        date_of_birth = EXCLUDED.date_of_birth,
        profession = EXCLUDED.profession;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Sync existing users again to apply the join_request matching to them
DO $$
DECLARE
    r RECORD;
    f_full_name TEXT;
    f_email_id TEXT;
    f_dob DATE;
    f_profession TEXT;
BEGIN
    FOR r IN SELECT id, phone FROM auth.users LOOP
        SELECT full_name, email_id, date_of_birth, profession 
        INTO f_full_name, f_email_id, f_dob, f_profession
        FROM public.join_requests
        WHERE mobile_number = r.phone 
           OR mobile_number = substring(r.phone from '(\d{10})$')
        LIMIT 1;

        UPDATE public.users SET
            full_name = f_full_name,
            email_id = f_email_id,
            date_of_birth = f_dob,
            profession = f_profession
        WHERE id = r.id;
    END LOOP;
END $$;
