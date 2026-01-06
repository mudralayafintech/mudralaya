-- Ensure the function exists and is robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    clean_phone TEXT;
    found_full_name TEXT;
    found_email_id TEXT;
    found_dob DATE;
    found_profession TEXT;
BEGIN
    -- Just in case phone is missing in metadata but present in phone column
    clean_phone := COALESCE(NEW.phone, (NEW.raw_user_meta_data->>'phone')::text);

    -- Minimal Insert first (Speed)
    INSERT INTO public.users (id, phone, role)
    VALUES (NEW.id, clean_phone, 'user')
    ON CONFLICT (id) DO NOTHING;

    -- Optional: Try to enrich from join_requests (Best Effort)
    BEGIN
        SELECT full_name, email_id, date_of_birth, profession 
        INTO found_full_name, found_email_id, found_dob, found_profession
        FROM public.join_requests
        WHERE mobile_number = clean_phone 
           OR RIGHT(mobile_number, 10) = RIGHT(clean_phone, 10)
        LIMIT 1;

        IF found_full_name IS NOT NULL THEN
            UPDATE public.users 
            SET 
                full_name = found_full_name,
                email_id = found_email_id,
                date_of_birth = found_dob,
                profession = found_profession
            WHERE id = NEW.id;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Verify ignoring errors here doesn't block user creation
        RAISE WARNING 'Error in handle_new_user enrichment: %', SQLERRM;
    END;

    RETURN NEW;
END;
$$;

-- Drop trigger if it exists to ensure freshness
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Re-create the trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
