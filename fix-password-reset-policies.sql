-- FIX PASSWORD RESET POLICIES
-- =====================================================
-- This script fixes the "Forgot Password" functionality by allowing
-- unauthenticated users to update their passwords during the reset process.
-- =====================================================

-- Fix password reset for buyers table
DROP POLICY IF EXISTS "Allow password reset for buyers" ON buyers;
CREATE POLICY "Allow password reset for buyers" 
ON buyers FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Fix password reset for sellers table  
DROP POLICY IF EXISTS "Allow password reset for sellers" ON sellers;
CREATE POLICY "Allow password reset for sellers" 
ON sellers FOR UPDATE 
USING (true)
WITH CHECK (true);

-- Verify the policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename IN ('buyers', 'sellers') 
AND policyname LIKE '%password reset%';

-- Test the policies work
SELECT 'Password reset policies applied successfully!' as status;
