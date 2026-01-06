-- Remove mongo_id columns from all tables
ALTER TABLE public.join_requests DROP COLUMN IF EXISTS mongo_id;
ALTER TABLE public.advisor_applications DROP COLUMN IF EXISTS mongo_id;
ALTER TABLE public.contact_requests DROP COLUMN IF EXISTS mongo_id;
ALTER TABLE public.newsletter_subscriptions DROP COLUMN IF EXISTS mongo_id;
