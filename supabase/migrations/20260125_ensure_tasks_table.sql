-- Ensure tasks table exists
CREATE TABLE IF NOT EXISTS public.tasks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamptz DEFAULT now(),
    title text NOT NULL,
    description text,
    reward_free numeric DEFAULT 0,
    reward_member numeric DEFAULT 0,
    reward_premium numeric DEFAULT 0,
    reward_min numeric DEFAULT 0,
    reward_max numeric DEFAULT 0,
    reward_info text,
    category text,
    icon_type text DEFAULT 'group',
    video_url text,
    video_link text,
    pdf_url text,
    action_link text,
    steps text,
    target_audience text[] DEFAULT ARRAY['All'],
    is_active boolean DEFAULT true
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Policies
-- 1. View Policy: Authenticated users can view active tasks
DROP POLICY IF EXISTS "Authenticated users can view tasks" ON public.tasks;
CREATE POLICY "Authenticated users can view tasks"
ON public.tasks FOR SELECT
TO authenticated
USING (true);

-- 2. Admin Policy (Service Role handles this usually, but good for explicit admin users)
-- Assuming admin has a specific role or just allowing service role (which bypasses RLS)
-- We will leave it to service role for updates/inserts for now.

-- Insert Default Data if Empty
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.tasks LIMIT 1) THEN
        INSERT INTO public.tasks (title, description, reward_free, reward_member, category, icon_type, pdf_url, is_active)
        VALUES 
        (
            'Health Insurance Task', 
            'Complete the health insurance task. Review the document for details.', 
            500, 
            750, 
            'One-time', 
            'building', 
            '/health_insurance.pdf', 
            true
        ),
        (
            'Motor Insurance Task', 
            'Complete the motor insurance task. Review the document for details.', 
            300, 
            500, 
            'One-time', 
            'rocket', 
            '/motor_insurance.pdf', 
            true
        ),
        (
            'College Admission Task', 
            'Complete the college admission task. Review the document for details.', 
            1000, 
            1500, 
            'One-time', 
            'group', 
            '/college_admission.pdf', 
            true
        );
    END IF;
END $$;
