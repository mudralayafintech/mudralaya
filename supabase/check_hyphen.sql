-- check exact column names
SELECT column_name, table_name
FROM information_schema.columns 
WHERE table_name IN ('users', 'join_requests') AND table_schema = 'public';
