DO $$
DECLARE
    r RECORD;
    clean_phone TEXT;
    param_join_request_id UUID;
    found_full_name TEXT;
    found_email_id TEXT;
    found_dob DATE;
    found_profession TEXT;
BEGIN
    -- Loop through users who are either missing from public.users OR have empty profile
    FOR r IN 
        SELECT au.id, au.phone, au.raw_user_meta_data 
        FROM auth.users au
        LEFT JOIN public.users pu ON au.id = pu.id
        WHERE pu.id IS NULL OR pu.full_name IS NULL
    LOOP
        RAISE NOTICE 'Checking user for repair/enrichment: %', r.id;

        clean_phone := COALESCE(r.phone, (r.raw_user_meta_data->>'phone')::text);

        -- 1. Insert into public.users
        INSERT INTO public.users (id, phone, role)
        VALUES (r.id, clean_phone, 'user')
        ON CONFLICT (id) DO NOTHING;

        -- 2. Try to Enrich
        SELECT id, full_name, email_id, date_of_birth, profession 
        INTO param_join_request_id, found_full_name, found_email_id, found_dob, found_profession
        FROM public.join_requests
        WHERE mobile_number = clean_phone 
           OR RIGHT(mobile_number, 10) = RIGHT(clean_phone, 10)
        LIMIT 1;

        -- 3. If found, Sync
        IF param_join_request_id IS NOT NULL THEN
            UPDATE public.join_requests
            SET user_id = r.id
            WHERE id = param_join_request_id;

            UPDATE public.users 
            SET 
                full_name = found_full_name,
                email_id = found_email_id,
                date_of_birth = found_dob,
                profession = found_profession
            WHERE id = r.id;
            
            RAISE NOTICE 'Enriched user % from join_request %', r.id, param_join_request_id;
        ELSE
            RAISE NOTICE 'No join request found for user % (phone: %)', r.id, clean_phone;
        END IF;

    END LOOP;
END $$;
