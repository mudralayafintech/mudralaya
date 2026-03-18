-- Create the blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_id UUID REFERENCES auth.users(id),
    cover_image TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    seo_title TEXT,
    seo_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

-- Policy: Public can view published blogs
CREATE POLICY "Public can view published blogs"
    ON public.blogs
    FOR SELECT
    USING (status = 'published');

-- Policy: Admins can do everything (assuming Supabase authenticated users are admins for this simple setup)
-- We use a simpler policy for auth users to manage blogs. 
-- In a stricter system, we'd check an admin role.
CREATE POLICY "Auth users can manage all blogs"
    ON public.blogs
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Insert into Storage (If not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog_images', 'blog_images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for blog_images bucket
CREATE POLICY "Public Access to Blog Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog_images');

CREATE POLICY "Auth Users can upload Blog Images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog_images');

CREATE POLICY "Auth Users can update Blog Images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'blog_images');

CREATE POLICY "Auth Users can delete Blog Images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'blog_images');
