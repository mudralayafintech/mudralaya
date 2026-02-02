-- Add missing columns to join_requests for Razorpay integration
ALTER TABLE public.join_requests ADD COLUMN IF NOT EXISTS amount NUMERIC;
ALTER TABLE public.join_requests ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;
ALTER TABLE public.join_requests ADD COLUMN IF NOT EXISTS razorpay_signature TEXT;
