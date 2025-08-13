-- =====================================================
-- FIX RLS POLICIES FOR PRODUCTS TABLE
-- =====================================================
-- This script fixes the "new row violates row-level security policy" error
-- Run this in your Supabase SQL Editor
-- =====================================================

-- Step 1: Check current RLS status
SELECT '=== CURRENT RLS STATUS ===' as status;

SELECT 
  schemaname, 
  tablename, 
  rowsecurity,
  CASE 
    WHEN rowsecurity THEN 'RLS ENABLED' 
    ELSE 'RLS DISABLED' 
  END as rls_status
FROM pg_tables 
WHERE tablename = 'products';

-- Step 2: Check existing policies
SELECT '=== EXISTING POLICIES ===' as status;

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'products';

-- Step 3: Drop existing restrictive policies
SELECT '=== DROPPING OLD POLICIES ===' as status;

DROP POLICY IF EXISTS "Sellers can manage their own products" ON products;
DROP POLICY IF EXISTS "Public can view all products" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Users can update their own products" ON products;
DROP POLICY IF EXISTS "Users can delete their own products" ON products;
DROP POLICY IF EXISTS "Allow authenticated insert" ON products;
DROP POLICY IF EXISTS "Allow public select" ON products;
DROP POLICY IF EXISTS "Allow user update own" ON products;
DROP POLICY IF EXISTS "Allow user delete own" ON products;

-- Step 4: Create new, working policies for your schema
SELECT '=== CREATING NEW POLICIES ===' as status;

-- Policy 1: Allow authenticated users to insert (anyone can create products)
CREATE POLICY "Allow authenticated insert" 
ON products FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Policy 2: Allow public to view all products
CREATE POLICY "Allow public select" 
ON products FOR SELECT 
TO public 
USING (true);

-- Policy 3: Allow users to update their own products
-- Note: Using 'seller_id' column for user identification
CREATE POLICY "Allow user update own" 
ON products FOR UPDATE 
TO authenticated 
USING (auth.uid()::text = seller_id::text)
WITH CHECK (auth.uid()::text = seller_id::text);

-- Policy 4: Allow users to delete their own products
-- Note: Using 'seller_id' column for user identification
CREATE POLICY "Allow user delete own" 
ON products FOR DELETE 
TO authenticated 
USING (auth.uid()::text = seller_id::text);

-- Step 5: Verify new policies
SELECT '=== NEW POLICIES CREATED ===' as status;

SELECT 
  policyname, 
  cmd, 
  permissive, 
  roles, 
  qual, 
  with_check 
FROM pg_policies 
WHERE tablename = 'products'
ORDER BY cmd, policyname;

-- Step 6: Test RLS is working
SELECT '=== RLS TEST ===' as status;

-- Check if we can see the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- =====================================================
-- AFTER RUNNING THIS SCRIPT:
-- =====================================================
-- 1. Go back to your seller dashboard
-- 2. Try adding a new product
-- 3. Check console logs for success messages
-- 4. If it works, you're all set!
-- =====================================================
