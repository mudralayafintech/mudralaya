-- check join_requests formatting
SELECT mobile_number, full_name, email_id, profession, form
FROM public.join_requests
LIMIT 5;

-- check users columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'users';
