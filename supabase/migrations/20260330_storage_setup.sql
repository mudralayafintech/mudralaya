-- Create storage bucket for task submissions
INSERT INTO storage.buckets (id, name, public) 
VALUES ('task-submissions', 'task-submissions', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for task-submissions
-- 1. Allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload task evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'task-submissions');

-- 2. Allow public to read (for admin viewing)
CREATE POLICY "Allow public to read task evidence"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'task-submissions');
