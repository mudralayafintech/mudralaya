-- check if the specific user exists
SELECT * FROM public.users 
WHERE id = '56563b8c-e27f-427c-8803-2df30e84f02c';

-- check if they have a join request
SELECT * FROM public.join_requests
WHERE mobile_number LIKE '%5656%' OR email_id LIKE '%5656%';
