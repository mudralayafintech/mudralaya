-- Enable RLS on user_kyc if not already enabled
ALTER TABLE "public"."user_kyc" ENABLE ROW LEVEL SECURITY;

-- 1. VIEW Policy
DROP POLICY IF EXISTS "Users can view own kyc" ON "public"."user_kyc";
CREATE POLICY "Users can view own kyc"
ON "public"."user_kyc"
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 2. INSERT Policy
DROP POLICY IF EXISTS "Users can insert own kyc" ON "public"."user_kyc";
CREATE POLICY "Users can insert own kyc"
ON "public"."user_kyc"
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- 3. UPDATE Policy
DROP POLICY IF EXISTS "Users can update own kyc" ON "public"."user_kyc";
CREATE POLICY "Users can update own kyc"
ON "public"."user_kyc"
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);
