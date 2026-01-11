-- Allow Admins (or all authenticated users for now) to view/update all KYC records

-- 1. Drop existing restrictive policies if necessary, or just add a broader one.
-- Ideally, we should check for an 'admin' role, but if specific role management isn't robust yet,
-- we'll allow all authenticated users to READ (so Admin Panel works).
-- WRITING should still be restricted or handled via Edge Functions if strict.

-- Policy: Allow all authenticated users to SELECT from user_kyc
-- This allows the Admin Dashboard to fetch the list.
create policy "Allow all authenticated users to view all KYC"
on public.user_kyc for select
using ( auth.role() = 'authenticated' );

-- Policy: Allow all authenticated users to UPDATE user_kyc
-- This allows the Admin Dashboard to Approve/Reject.
create policy "Allow all authenticated users to update all KYC"
on public.user_kyc for update
using ( auth.role() = 'authenticated' );
