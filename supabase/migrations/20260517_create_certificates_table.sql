-- ============================================================
-- Migration: Create certificates table
-- Purpose: Store training completion certificate records with
--          payment gating (₹499 per certificate)
-- ============================================================

-- Create certificates table (if not exists)
CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    company_id UUID,
    training_module_id UUID,
    is_paid BOOLEAN DEFAULT FALSE,
    payment_id TEXT,
    paid_at TIMESTAMPTZ,
    certificate_url TEXT,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_company_id ON certificates(company_id);

-- Unique constraint: one certificate per user per company
CREATE UNIQUE INDEX IF NOT EXISTS idx_certificates_user_company 
    ON certificates(user_id, company_id);

-- Enable RLS
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own certificates
DROP POLICY IF EXISTS "Users can read own certificates" ON certificates;
CREATE POLICY "Users can read own certificates"
    ON certificates FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Service role can do anything (for edge functions)
DROP POLICY IF EXISTS "Service role full access on certificates" ON certificates;
CREATE POLICY "Service role full access on certificates"
    ON certificates FOR ALL
    USING (auth.role() = 'service_role');
