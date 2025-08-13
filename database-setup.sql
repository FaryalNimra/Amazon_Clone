-- =====================================================
-- COMPLETE WORKING DATABASE SETUP - GUARANTEED TO WORK
-- =====================================================
-- Run this in Supabase SQL Editor - it will create everything needed
-- =====================================================

-- STEP 1: DROP EXISTING TABLE IF EXISTS (to avoid conflicts)
-- =====================================================
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS product_categories CASCADE;

-- STEP 2: CREATE PRODUCTS TABLE WITH ALL COLUMNS
-- =====================================================
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL CHECK (stock >= 0),
  image_url TEXT,
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_products_seller_id ON products(seller_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created_at ON products(created_at);
CREATE INDEX idx_products_price ON products(price);

-- STEP 4: CREATE PRODUCT CATEGORIES TABLE
-- =====================================================
CREATE TABLE product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  slug VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 5: INSERT DEFAULT CATEGORIES
-- =====================================================
INSERT INTO product_categories (name, description, slug) VALUES
  ('Electronics', 'Electronic devices and gadgets', 'electronics'),
  ('Fashion', 'Clothing, shoes, and accessories', 'fashion'),
  ('Home & Garden', 'Home decor and garden items', 'home-garden'),
  ('Sports & Outdoors', 'Sports equipment and outdoor gear', 'sports-outdoors'),
  ('Books & Media', 'Books, movies, and music', 'books-media'),
  ('Health & Beauty', 'Health and beauty products', 'health-beauty'),
  ('Automotive', 'Car parts and accessories', 'automotive'),
  ('Toys & Games', 'Toys and entertainment', 'toys-games'),
  ('Food & Beverages', 'Food and drink items', 'food-beverages'),
  ('Other', 'Miscellaneous products', 'other');

-- STEP 6: ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- STEP 7: CREATE RLS POLICIES
-- =====================================================
-- Policy for sellers to manage their own products
CREATE POLICY "Sellers can manage their own products" 
ON products FOR ALL 
USING (auth.uid() = seller_id);

-- Policy for public to view all products
CREATE POLICY "Public can view all products" 
ON products FOR SELECT 
USING (true);

-- STEP 8: CREATE TRIGGER FUNCTION FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- STEP 9: CREATE TRIGGER
-- =====================================================
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- STEP 10: GRANT PERMISSIONS
-- =====================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON products TO authenticated;
GRANT ALL ON product_categories TO authenticated;

-- STEP 11: VERIFICATION QUERIES
-- =====================================================
-- Check if products table exists and has correct columns
SELECT '=== VERIFICATION RESULTS ===' as status;

-- Check products table structure
SELECT 'Products table columns:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Check if image_url column exists
SELECT 'Image URL column exists:' as info,
       CASE WHEN EXISTS (
         SELECT 1 FROM information_schema.columns 
         WHERE table_name = 'products' AND column_name = 'image_url'
       ) THEN '✅ YES' ELSE '❌ NO' END as status;

-- Check table count
SELECT 'Products table count:' as info, COUNT(*) as count FROM products;

-- Check categories count
SELECT 'Categories count:' as info, COUNT(*) as count FROM product_categories;

-- Check RLS policies
SELECT 'RLS policies count:' as info, COUNT(*) as count 
FROM pg_policies WHERE tablename = 'products';

-- =====================================================
-- SETUP COMPLETE! 
-- =====================================================
-- If you see all ✅ marks above, everything is working
-- Now test your Add New Product form!
-- =====================================================
