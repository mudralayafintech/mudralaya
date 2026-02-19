-- Insert the new tasks with links to the imported PDFs
INSERT INTO public.tasks (title, description, reward_free, reward_member, category, icon_type, video_url, pdf_url, action_link, is_active)
VALUES 
(
    'Health Insurance Task', 
    'Complete the health insurance task. Review the document for details.', 
    500, 
    750, 
    'One-time', 
    'building', 
    '', 
    '/health_insurance.pdf', 
    '', 
    true
),
(
    'Motor Insurance Task', 
    'Complete the motor insurance task. Review the document for details.', 
    300, 
    500, 
    'One-time', 
    'rocket', 
    '', 
    '/motor_insurance.pdf', 
    '', 
    true
),
(
    'College Admission Task', 
    'Complete the college admission task. Review the document for details.', 
    1000, 
    1500, 
    'One-time', 
    'group', 
    '', 
    '/college_admission.pdf', 
    '', 
    true
);
