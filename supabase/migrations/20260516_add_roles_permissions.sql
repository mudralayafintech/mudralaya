-- Migration: Add roles and permissions to admin_users table
-- Roles: super_admin, admin, seo, sales, marketing_manager

-- 1. Add new columns to admin_users table
ALTER TABLE public.admin_users
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Create a roles lookup/reference table
CREATE TABLE IF NOT EXISTS public.admin_roles (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
    color TEXT DEFAULT '#64748b',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access on admin_roles" ON public.admin_roles;
CREATE POLICY "Service role full access on admin_roles"
    ON public.admin_roles
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 3. Insert default roles with permissions
INSERT INTO public.admin_roles (id, label, description, permissions, color, sort_order) VALUES
(
  'super_admin',
  'Super Admin',
  'Full system access with all permissions including user management',
  '["dashboard", "users", "roles", "tasks", "blogs", "kyc", "contacts", "join_requests", "advisors", "companies", "settings", "reports"]'::jsonb,
  '#ef4444',
  0
),
(
  'admin',
  'Admin',
  'Administrative access to most features except role management',
  '["dashboard", "users", "tasks", "blogs", "kyc", "contacts", "join_requests", "advisors", "companies", "reports"]'::jsonb,
  '#f97316',
  1
),
(
  'seo',
  'SEO',
  'Access to blog management and SEO-related content',
  '["dashboard", "blogs"]'::jsonb,
  '#8b5cf6',
  2
),
(
  'sales',
  'Sales',
  'Access to contacts, join requests, and client management',
  '["dashboard", "contacts", "join_requests", "companies", "reports"]'::jsonb,
  '#3b82f6',
  3
),
(
  'marketing_manager',
  'Marketing Manager',
  'Access to blogs, contacts, advisors, and campaign-related features',
  '["dashboard", "blogs", "contacts", "advisors", "reports"]'::jsonb,
  '#10b981',
  4
)
ON CONFLICT (id) DO NOTHING;
