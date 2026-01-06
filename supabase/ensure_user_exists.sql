-- Simply ensure the user exists, even if empty.
-- The trigger handles new signups.
-- This function is for manual invocation if needed, or to be called from the client via RPC (if we decide to expose it).

CREATE OR REPLACE FUNCTION public.ensure_user_exists(p_id UUID, p_phone TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user record;
BEGIN
    INSERT INTO public.users (id, phone, role)
    VALUES (p_id, p_phone, 'user')
    ON CONFLICT (id) DO NOTHING
    RETURNING * INTO v_user;
    
    RETURN to_jsonb(v_user);
END;
$$;
