-- MASTER FIX SCRIPT
-- RUN THIS IN SUPABASE SQL EDITOR

-- 1. Ensure `users` table exists (Public Profile)
-- This is referenced by user_kyc.account_id
create table if not exists public.users (
  id uuid references auth.users not null primary key,
  full_name text,
  email_id text,
  mobile_number text,
  created_at timestamptz default now()
);

-- 2. Ensure `account_details` table exists
create table if not exists public.account_details (
  user_id uuid references auth.users not null primary key,
  holder_name text,
  bank_name text,
  account_number text,
  ifsc_code text,
  updated_at timestamptz default now()
);

-- 3. Ensure `user_kyc` matches USER REQUESTED SCHEMA
create table if not exists public.user_kyc (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  account_id uuid null,
  pan_card_url text null,
  adhaar_card_url text null,
  bank_proof_url text null,
  selfie_url text null,
  status text null default 'pending'::text,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  rejection_reason text null,
  constraint user_kyc_pkey primary key (id),
  constraint user_kyc_account_id_fkey foreign KEY (account_id) references users (id),
  constraint user_kyc_user_id_fkey foreign KEY (user_id) references auth.users (id),
  constraint user_kyc_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'verified'::text,
          'fail'::text,
          'approved'::text,
          'rejected'::text
        ]
      )
    )
  )
);

-- 4. ENABLE RLS & PERMISSIVE POLICIES FOR ADMIN
-- Allow Admins (authenticated) to view ALL tables involved

-- user_kyc
alter table public.user_kyc enable row level security;
drop policy if exists "Admin View KYC" on public.user_kyc;
create policy "Admin View KYC" on public.user_kyc for select using (auth.role() = 'authenticated');
drop policy if exists "Admin Update KYC" on public.user_kyc;
create policy "Admin Update KYC" on public.user_kyc for update using (auth.role() = 'authenticated');
-- Re-add insert policy for users
drop policy if exists "User Insert KYC" on public.user_kyc;
create policy "User Insert KYC" on public.user_kyc for insert with check (auth.uid() = user_id);

-- users (Public Profile)
alter table public.users enable row level security;
drop policy if exists "Admin View Users" on public.users;
create policy "Admin View Users" on public.users for select using (auth.role() = 'authenticated');

-- account_details
alter table public.account_details enable row level security;
drop policy if exists "Admin View Bank Details" on public.account_details;
create policy "Admin View Bank Details" on public.account_details for select using (auth.role() = 'authenticated');

-- 5. INSERT TEST DATA (SKIPPED AS PER REQUEST)
-- insert into public.users (id, full_name, mobile_number)
-- select id, 'Test User', '9999999999' from auth.users limit 1 on conflict (id) do nothing;

-- insert into public.account_details (user_id, bank_name, account_number, holder_name, ifsc_code)
-- select id, 'Test Bank', '1234567890', 'Test Holder', 'HDFC0001234' from auth.users limit 1 on conflict (user_id) do nothing;

-- insert into public.user_kyc (user_id, account_id, status, pan_card_url)
-- select id, id, 'pending', 'https://placehold.co/600?text=PAN' from auth.users limit 1;
