-- Run each step separately to find what's failing

-- 1. Migrate join_requests
UPDATE public.join_requests SET user_id = '92c48d9d-817c-48c1-b11f-93dee2892e03' WHERE user_id = '2414788d-482b-4a70-9741-a3cf79406d76';

-- 2. Migrate account_details
UPDATE public.account_details SET user_id = '92c48d9d-817c-48c1-b11f-93dee2892e03' WHERE user_id = '2414788d-482b-4a70-9741-a3cf79406d76';

-- 3. Migrate certificates
UPDATE public.certificates SET user_id = '92c48d9d-817c-48c1-b11f-93dee2892e03' WHERE user_id = '2414788d-482b-4a70-9741-a3cf79406d76';

-- 4. Migrate notifications
UPDATE public.notifications SET user_id = '92c48d9d-817c-48c1-b11f-93dee2892e03' WHERE user_id = '2414788d-482b-4a70-9741-a3cf79406d76';

-- 5. Migrate user_company_locks
UPDATE public.user_company_locks SET user_id = '92c48d9d-817c-48c1-b11f-93dee2892e03' WHERE user_id = '2414788d-482b-4a70-9741-a3cf79406d76';

-- 6. Migrate user_kyc
UPDATE public.user_kyc SET account_id = '92c48d9d-817c-48c1-b11f-93dee2892e03' WHERE account_id = '2414788d-482b-4a70-9741-a3cf79406d76';

-- 7. Migrate user_trainings
UPDATE public.user_trainings SET user_id = '92c48d9d-817c-48c1-b11f-93dee2892e03' WHERE user_id = '2414788d-482b-4a70-9741-a3cf79406d76';
