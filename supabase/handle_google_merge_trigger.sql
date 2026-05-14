-- ============================================================
-- Safe Google OAuth Account Merge Trigger (v3)
-- ============================================================
-- Entire merge wrapped in exception handler.
-- If merge fails for ANY reason, falls through to normal creation.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    found_full_name TEXT;
    found_email_id TEXT;
    found_dob DATE;
    found_profession TEXT;
    found_plan TEXT;
    clean_phone TEXT;
    existing_user_id UUID;
    is_google_login BOOLEAN;
    google_email TEXT;
BEGIN
    clean_phone := NEW.phone;
    
    -- Detect Google OAuth login
    is_google_login := (NEW.raw_app_meta_data->>'provider' = 'google');
    google_email := NEW.email;

    -- =====================================================
    -- GOOGLE MERGE ATTEMPT (entire block is safe)
    -- =====================================================
    IF is_google_login AND google_email IS NOT NULL THEN
        BEGIN
            -- Find existing phone user with matching email
            SELECT id INTO existing_user_id
            FROM public.users
            WHERE LOWER(email_id) = LOWER(google_email)
              AND id != NEW.id
              AND phone IS NOT NULL
            LIMIT 1;

            IF existing_user_id IS NOT NULL THEN
                -- Copy old user's data to new Google user
                INSERT INTO public.users (
                    id, phone, mobile_number, full_name, email_id,
                    date_of_birth, profession, plan, role, created_at, avatar_url
                )
                SELECT
                    NEW.id, phone, mobile_number, full_name, email_id,
                    date_of_birth, profession, plan, 
                    COALESCE(role, 'user'), COALESCE(created_at, NOW()), avatar_url
                FROM public.users
                WHERE id = existing_user_id
                ON CONFLICT (id) DO UPDATE SET
                    phone = EXCLUDED.phone,
                    mobile_number = EXCLUDED.mobile_number,
                    full_name = EXCLUDED.full_name,
                    email_id = EXCLUDED.email_id,
                    date_of_birth = EXCLUDED.date_of_birth,
                    profession = EXCLUDED.profession,
                    plan = EXCLUDED.plan,
                    avatar_url = EXCLUDED.avatar_url;

                -- Migrate related records (best effort)
                BEGIN UPDATE public.join_requests SET user_id = NEW.id WHERE user_id = existing_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
                BEGIN UPDATE public.user_tasks SET user_id = NEW.id WHERE user_id = existing_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
                BEGIN UPDATE public.notifications SET user_id = NEW.id WHERE user_id = existing_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
                BEGIN UPDATE public.daily_earnings SET user_id = NEW.id WHERE user_id = existing_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
                BEGIN UPDATE public.transactions SET user_id = NEW.id WHERE user_id = existing_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
                BEGIN UPDATE public.user_kyc SET account_id = NEW.id WHERE account_id = existing_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
                BEGIN UPDATE public.account_details SET user_id = NEW.id WHERE user_id = existing_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
                BEGIN UPDATE public.certificates SET user_id = NEW.id WHERE user_id = existing_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
                BEGIN UPDATE public.user_trainings SET user_id = NEW.id WHERE user_id = existing_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
                BEGIN UPDATE public.user_company_locks SET user_id = NEW.id WHERE user_id = existing_user_id; EXCEPTION WHEN OTHERS THEN NULL; END;
                BEGIN
                    DELETE FROM public.wallets WHERE user_id = NEW.id;
                    UPDATE public.wallets SET user_id = NEW.id WHERE user_id = existing_user_id;
                EXCEPTION WHEN OTHERS THEN NULL;
                END;

                -- Remove old profile
                DELETE FROM public.users WHERE id = existing_user_id;

                RETURN NEW;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            -- Merge failed, fall through to normal creation
            RAISE WARNING 'Google merge failed: %, falling back to normal creation', SQLERRM;
        END;
    END IF;

    -- =====================================================
    -- NORMAL FLOW
    -- =====================================================
    
    -- Try join_requests enrichment
    BEGIN
        SELECT full_name, email_id, date_of_birth, profession, form
        INTO found_full_name, found_email_id, found_dob, found_profession, found_plan
        FROM public.join_requests
        WHERE mobile_number = clean_phone 
           OR mobile_number = substring(clean_phone from '(\d{10})$')
           OR email_id = NEW.email
        ORDER BY created_at DESC
        LIMIT 1;
    EXCEPTION WHEN OTHERS THEN
        NULL;
    END;

    -- For Google logins, use Google metadata
    IF is_google_login AND found_full_name IS NULL THEN
        found_full_name := NEW.raw_user_meta_data->>'full_name';
        found_email_id := google_email;
    END IF;

    INSERT INTO public.users (
        id, phone, mobile_number, full_name, email_id,
        date_of_birth, profession, plan, role, created_at
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
        full_name = COALESCE(EXCLUDED.full_name, public.users.full_name),
        email_id = COALESCE(EXCLUDED.email_id, public.users.email_id),
        date_of_birth = COALESCE(EXCLUDED.date_of_birth, public.users.date_of_birth),
        profession = COALESCE(EXCLUDED.profession, public.users.profession),
        plan = COALESCE(EXCLUDED.plan, public.users.plan),
        mobile_number = COALESCE(EXCLUDED.mobile_number, public.users.mobile_number);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
