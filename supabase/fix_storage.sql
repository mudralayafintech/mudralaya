-- Remove extension creation line as it's causing issues and is likely already there
-- create extension if not exists "storage" schema "extensions";

insert into storage.buckets (id, name, public)
values ('profile-images', 'profile-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated users can upload" on storage.objects;
drop policy if exists "Users can update own images" on storage.objects;
drop policy if exists "Users can delete own images" on storage.objects;

create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'profile-images' );

create policy "Authenticated users can upload"
  on storage.objects for insert
  with check ( bucket_id = 'profile-images' and auth.role() = 'authenticated' );

create policy "Users can update own images"
  on storage.objects for update
  using ( bucket_id = 'profile-images' and auth.uid() = owner );

create policy "Users can delete own images"
  on storage.objects for delete
  using ( bucket_id = 'profile-images' and auth.uid() = owner );
