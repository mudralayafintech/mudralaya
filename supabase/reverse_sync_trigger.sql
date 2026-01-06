-- Trigger on public.join_requests
-- When a row is inserted or updated, check if a matching user exists in public.users
-- If found, sync profile data to public.users and update join_requests.user_id

CREATE OR REPLACE FUNCTION public.handle_new_join_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    clean_mobile TEXT;
    found_user_id UUID;
BEGIN
    clean_mobile := NEW.mobile_number;

    -- Find matching user by Phone (Last 10 digits)
    SELECT id INTO found_user_id
    FROM public.users
    WHERE phone LIKE '%' || RIGHT(clean_mobile, 10)
    LIMIT 1;

    -- If user exists, sync data
    IF found_user_id IS NOT NULL THEN
        -- 1. Sync Profile Data to User
        UPDATE public.users
        SET 
            full_name = COALESCE(full_name, NEW.full_name), -- Only fill if empty? Or overwrite? Let's overwrite for now or fill if null. User said "fetch and insert".
            email_id = COALESCE(email_id, NEW.email_id),
            date_of_birth = COALESCE(date_of_birth, NEW.date_of_birth),
            profession = COALESCE(profession, NEW.profession)
        WHERE id = found_user_id;

        -- 2. Link the Request to User (if not already linked)
        IF NEW.user_id IS DISTINCT FROM found_user_id THEN
            UPDATE public.join_requests
            SET user_id = found_user_id
            WHERE id = NEW.id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS on_join_request_change ON public.join_requests;

CREATE TRIGGER on_join_request_change
AFTER INSERT OR UPDATE ON public.join_requests
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_join_request();
