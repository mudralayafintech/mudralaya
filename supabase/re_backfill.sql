DO $$
DECLARE
    auth_user RECORD;
    join_req RECORD;
    clean_phone TEXT;
BEGIN
    FOR auth_user IN SELECT * FROM auth.users LOOP
        -- Skip if already in public.users
        IF EXISTS (SELECT 1 FROM public.users WHERE id = auth_user.id) THEN
            CONTINUE;
        END IF;

        -- Try to find a join request
        clean_phone := regexp_replace(auth_user.phone, '[^0-9]', '', 'g');
        IF length(clean_phone) > 10 THEN
            clean_phone := right(clean_phone, 10);
        END IF;

        SELECT * INTO join_req FROM public.join_requests 
        WHERE regexp_replace(mobile_number, '[^0-9]', '', 'g') ILIKE '%' || clean_phone || '%'
        LIMIT 1;

        IF join_req.id IS NOT NULL THEN
            INSERT INTO public.users (
                id, full_name, email_id, mobile_number, date_of_birth, profession, plan, updated_at
            ) VALUES (
                auth_user.id,
                join_req.full_name,
                join_req.email_id,
                join_req.mobile_number,
                join_req.date_of_birth,
                join_req.profession,
                join_req.plan,
                NOW()
            );
            RAISE NOTICE 'Backfilled user % from join request %', auth_user.id, join_req.id;
        ELSE
            -- Just create a basic row if no join request found
            INSERT INTO public.users (id, mobile_number, updated_at)
            VALUES (auth_user.id, auth_user.phone, NOW());
            RAISE NOTICE 'Created basic user row for %', auth_user.id;
        END IF;
    END LOOP;
END $$;
