-- Create KYC Table
create table if not exists public.user_kyc (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  account_id uuid references public.users(id), -- Optional link to profile
  pan_card_url text,
  adhaar_card_url text,
  bank_proof_url text,
  selfie_url text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.user_kyc enable row level security;

-- Policies (Drop first to avoid 'already exists' error)
drop policy if exists "Users can view own KYC" on public.user_kyc;
drop policy if exists "Users can insert own KYC" on public.user_kyc;
drop policy if exists "Users can update own KYC" on public.user_kyc;

create policy "Users can view own KYC"
  on public.user_kyc for select
  using (auth.uid() = user_id);

create policy "Users can insert own KYC"
  on public.user_kyc for insert
  with check (auth.uid() = user_id);

create policy "Users can update own KYC"
  on public.user_kyc for update
  using (auth.uid() = user_id);

-- Storage Bucket Setup (Idempotent)
insert into storage.buckets (id, name, public)
values ('kyc-documents', 'kyc-documents', true)
on conflict (id) do nothing;

-- Storage Policies (Drop first)
drop policy if exists "Authenticated Users can upload KYC docs" on storage.objects;
drop policy if exists "Users can view own KYC docs" on storage.objects;

create policy "Authenticated Users can upload KYC docs"
  on storage.objects for insert
  with check (
    bucket_id = 'kyc-documents' and
    auth.role() = 'authenticated'
  );

create policy "Users can view own KYC docs"
  on storage.objects for select
  using (
    bucket_id = 'kyc-documents' and
    auth.uid() = owner
  );
