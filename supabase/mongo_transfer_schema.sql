-- Advisor Applications
CREATE TABLE IF NOT EXISTS public.advisor_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mongo_id TEXT,
    full_name TEXT,
    mobile_number TEXT,
    email_id TEXT,
    date_of_birth DATE,
    profession TEXT,
    irda_license TEXT,
    form TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Requests
CREATE TABLE IF NOT EXISTS public.contact_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mongo_id TEXT,
    full_name TEXT,
    phone_number TEXT,
    email TEXT,
    occupation TEXT,
    qualification TEXT,
    subject TEXT,
    message TEXT,
    received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Join Requests
CREATE TABLE IF NOT EXISTS public.join_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mongo_id TEXT,
    full_name TEXT,
    mobile_number TEXT,
    email_id TEXT,
    date_of_birth DATE,
    profession TEXT,
    form TEXT,
    payment_status TEXT,
    razorpay_payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter Subscriptions
CREATE TABLE IF NOT EXISTS public.newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mongo_id TEXT,
    email TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.advisor_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow service_role bypass or add specific policies if needed for admin panel
-- For now, restricted to service_role for migration
