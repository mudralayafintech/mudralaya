-- Add user_id column to join_requests if it doesn't exist
ALTER TABLE public.join_requests 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_join_requests_user_id ON public.join_requests(user_id);

-- Update the trigger function to perform the 2-way sync/link
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    clean_phone TEXT;
    param_join_request_id UUID;
    found_full_name TEXT;
    found_email_id TEXT;
    found_dob DATE;
    found_profession TEXT;
BEGIN
    -- Just in case phone is missing in metadata but present in phone column
    clean_phone := COALESCE(NEW.phone, (NEW.raw_user_meta_data->>'phone')::text);

    -- 1. Insert into public.users (Minimal)
    INSERT INTO public.users (id, phone, role)
    VALUES (NEW.id, clean_phone, 'user')
    ON CONFLICT (id) DO NOTHING;

    -- 2. Find Enrichment Data from join_requests (Right 10 digits match)
    SELECT id, full_name, email_id, date_of_birth, profession 
    INTO param_join_request_id, found_full_name, found_email_id, found_dob, found_profession
    FROM public.join_requests
    WHERE mobile_number = clean_phone 
       OR RIGHT(mobile_number, 10) = RIGHT(clean_phone, 10)
    LIMIT 1;

    -- 3. If found, Enrich Users AND Link Request
    IF param_join_request_id IS NOT NULL THEN
        -- Link the join request to this user
        UPDATE public.join_requests
        SET user_id = NEW.id
        WHERE id = param_join_request_id;

        -- Enrich the user profile
        UPDATE public.users 
        SET 
            full_name = found_full_name,
            email_id = found_email_id,
            date_of_birth = found_dob,
            profession = found_profession
        WHERE id = NEW.id;
    END IF;

    RETURN NEW;
END;
$$;
