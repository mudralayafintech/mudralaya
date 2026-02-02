ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS reward_min numeric,
ADD COLUMN IF NOT EXISTS reward_max numeric;
