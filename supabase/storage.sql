-- Enable the storage extension if not already enabled (usually enabled by default in Supabase)
-- create extension if not exists "storage" schema "extensions";

-- Create the folder/bucket for profile images
insert into storage.buckets (id, name, public)
values ('profile-images', 'profile-images', true)
on conflict (id) do nothing;

-- Policy: Give public access to view images (it's a public bucket, but policies are good)
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'profile-images' );

-- Policy: Allow authenticated users to upload images to their own folder (optional folder structure) 
-- or just allow them to upload any file to this bucket.
create policy "Authenticated users can upload images"
  on storage.objects for insert
  with check ( bucket_id = 'profile-images' and auth.role() = 'authenticated' );

-- Policy: Allow users to update their own images
create policy "Users can update own images"
  on storage.objects for update
  using ( bucket_id = 'profile-images' and auth.role() = 'authenticated' );
