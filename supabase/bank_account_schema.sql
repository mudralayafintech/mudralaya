-- Create account_details table
create table if not exists public.account_details (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  holder_name text not null,
  bank_name text not null,
  account_number text not null,
  ifsc_code text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Enable RLS
alter table public.account_details enable row level security;

-- Policies
create policy "Users can view their own account details"
  on public.account_details for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own account details"
  on public.account_details for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own account details"
  on public.account_details for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own account details"
  on public.account_details for delete
  using ( auth.uid() = user_id );

-- Grant access to service_role (for edge functions if needed bypass)
grant all on public.account_details to service_role;
grant all on public.account_details to authenticated;
