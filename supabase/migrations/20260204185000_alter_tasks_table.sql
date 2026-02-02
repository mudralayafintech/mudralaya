ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS reward_premium numeric,
ADD COLUMN IF NOT EXISTS video_link text,
ADD COLUMN IF NOT EXISTS steps text;
