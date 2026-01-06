-- Create a table for public profiles
create table if not exists public.users (
  id uuid not null references auth.users on delete cascade,
  first_name text,
  last_name text,
  phone text,
  role text default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  primary key (id)
);

alter table public.users enable row level security;

-- Create a function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.users (id, phone, role)
  values (
    new.id, 
    new.phone,
    'user' -- Default role
  )
  on conflict (id) do nothing; -- Prevent errors if user already exists
  return new;
end;
$$ language plpgsql security definer;

-- Create a trigger to call the function on new user creation
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Policy to allow users to read their own data
create policy "Users can view own profile" on public.users
  for select using (auth.uid() = id);

-- Policy to allow users to update their own data
create policy "Users can update own profile" on public.users
  for update using (auth.uid() = id);

-- BACKFILL EXISTING USERS
-- This ensures users who signed up BEFORE this script ran are also added
insert into public.users (id, phone, role)
select id, phone, 'user'
from auth.users
on conflict (id) do nothing;
