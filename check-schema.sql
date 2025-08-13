-- =====================================================
-- DATABASE SCHEMA CHECK SCRIPT
-- =====================================================
-- Run this in Supabase SQL Editor to see exactly what columns exist
-- =====================================================

-- Check if products table exists
SELECT '=== TABLE EXISTENCE CHECK ===' as status;

SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'products'
) as products_table_exists;

-- Check products table structure
SELECT '=== PRODUCTS TABLE STRUCTURE ===' as status;

SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length,
  numeric_precision,
  numeric_scale
FROM information_schema.columns 
WHERE table_name = 'products' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check for specific columns we're looking for
SELECT '=== SPECIFIC COLUMN CHECK ===' as status;

SELECT 
  'id' as column_name,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'id'
  ) as exists
UNION ALL
SELECT 
  'name' as column_name,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'name'
  ) as exists
UNION ALL
SELECT 
  'description' as column_name,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'description'
  ) as exists
UNION ALL
SELECT 
  'category' as column_name,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'category'
  ) as exists
UNION ALL
SELECT 
  'price' as column_name,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'price'
  ) as exists
UNION ALL
SELECT 
  'stock' as column_name,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'stock'
  ) as exists
UNION ALL
SELECT 
  'quantity' as column_name,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'quantity'
  ) as exists
UNION ALL
SELECT 
  'image_url' as column_name,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'image_url'
  ) as exists
UNION ALL
SELECT 
  'image' as column_name,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'image'
  ) as exists
UNION ALL
SELECT 
  'seller_id' as column_name,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'seller_id'
  ) as exists
UNION ALL
SELECT 
  'created_at' as column_name,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'created_at'
  ) as exists
UNION ALL
SELECT 
  'updated_at' as column_name,
  EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' 
    AND column_name = 'updated_at'
  ) as exists;

-- Check RLS policies
SELECT '=== RLS POLICIES ===' as status;

SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'products';

-- Check table permissions
SELECT '=== TABLE PERMISSIONS ===' as status;

SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'products';

-- =====================================================
-- RUN THIS SCRIPT TO SEE YOUR ACTUAL DATABASE SCHEMA
-- =====================================================



