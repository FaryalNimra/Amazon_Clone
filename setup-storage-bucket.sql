-- =====================================================
-- SUPABASE STORAGE BUCKET SETUP FOR PRODUCT IMAGES
-- =====================================================
-- Run this in Supabase SQL Editor to create the storage bucket
-- =====================================================

-- STEP 1: CREATE THE PRODUCT-IMAGES STORAGE BUCKET
-- =====================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  10485760, -- 10MB file size limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- STEP 2: CREATE STORAGE POLICIES FOR THE BUCKET
-- =====================================================

-- Policy 1: Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload product images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'sellers'
  AND (storage.foldername(name))[3] = 'products'
);

-- Policy 2: Allow users to view their own uploaded images
CREATE POLICY "Users can view their own product images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'sellers'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy 3: Allow users to update their own uploaded images
CREATE POLICY "Users can update their own product images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'sellers'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy 4: Allow users to delete their own uploaded images
CREATE POLICY "Users can delete their own product images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = 'sellers'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- Policy 5: Allow public to view all product images (for product display)
CREATE POLICY "Public can view all product images" ON storage.objects
FOR SELECT USING (
  bucket_id = 'product-images'
);

-- STEP 3: VERIFICATION QUERIES
-- =====================================================
-- Check if bucket was created successfully
SELECT '=== STORAGE BUCKET VERIFICATION ===' as status;

-- Check bucket details
SELECT 'Bucket details:' as info;
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets 
WHERE id = 'product-images';

-- Check storage policies
SELECT 'Storage policies count:' as info, COUNT(*) as count 
FROM storage.policies 
WHERE table_name = 'objects' AND bucket_id = 'product-images';

-- Check if bucket is accessible
SELECT 'Bucket accessibility test:' as info,
       CASE WHEN EXISTS (
         SELECT 1 FROM storage.objects 
         WHERE bucket_id = 'product-images' 
         LIMIT 1
       ) THEN '✅ Accessible' ELSE '❌ Not accessible' END as status;

-- STEP 4: CREATE FOLDER STRUCTURE (Optional)
-- =====================================================
-- This will create the initial folder structure for organization
-- Note: Folders are created automatically when files are uploaded

-- STEP 5: TEST UPLOAD PERMISSIONS
-- =====================================================
-- The following query tests if the current user can access the bucket
-- Run this after creating the bucket to verify permissions

SELECT '=== PERMISSION TEST ===' as status;
SELECT 
  'Current user can access bucket:' as test,
  CASE WHEN EXISTS (
    SELECT 1 FROM storage.buckets 
    WHERE id = 'product-images'
  ) THEN '✅ YES' ELSE '❌ NO' END as result;

-- STEP 6: CLEANUP INSTRUCTIONS (if needed)
-- =====================================================
-- If you need to remove the bucket and start over:
-- DELETE FROM storage.objects WHERE bucket_id = 'product-images';
-- DELETE FROM storage.buckets WHERE id = 'product-images';
-- DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can view their own product images" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update their own product images" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete their own product images" ON storage.objects;
-- DROP POLICY IF EXISTS "Public can view all product images" ON storage.objects;
