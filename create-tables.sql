
-- COMPLETE DATABASE SCHEMA FOR ECOMMERCE WEBSITE (WITHOUT CART_ITEMS)
-- =====================================================

-- STEP 1: DROP EXISTING TABLES (IF ANY)
-- =====================================================
-- DROP TABLE IF EXISTS products CASCADE;
-- DROP TABLE IF EXISTS product_categories CASCADE;
-- DROP TABLE IF EXISTS buyers CASCADE;
-- DROP TABLE IF EXISTS sellers CASCADE;

-- STEP 2: CREATE BUYERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS buyers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'buyer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: CREATE SELLERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sellers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'seller',
  store_name VARCHAR(255) NOT NULL,
  gst_number VARCHAR(20),
  business_type VARCHAR(100),
  business_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 4: CREATE PRODUCT CATEGORIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  slug VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 5: CREATE PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  stock INTEGER NOT NULL CHECK (stock >= 0),
  image_url TEXT,
  seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 6: CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_buyers_email ON buyers(email);
CREATE INDEX IF NOT EXISTS idx_sellers_email ON sellers(email);

-- STEP 7: INSERT DEFAULT CATEGORIES
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
  ('Other', 'Miscellaneous products', 'other')
ON CONFLICT (slug) DO NOTHING;

-- STEP 8: ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

-- STEP 9: CREATE RLS POLICIES FOR BUYERS TABLE
-- =====================================================
DROP POLICY IF EXISTS "Buyers can manage their own profile" ON buyers;
CREATE POLICY "Buyers can manage their own profile" 
ON buyers FOR ALL 
USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Public can view buyer profiles" ON buyers;
CREATE POLICY "Public can view buyer profiles" 
ON buyers FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow buyer registration" ON buyers;
CREATE POLICY "Allow buyer registration" 
ON buyers FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow buyer authentication" ON buyers;
CREATE POLICY "Allow buyer authentication" 
ON buyers FOR SELECT 
USING (true);

-- STEP 10: CREATE RLS POLICIES FOR SELLERS TABLE
-- =====================================================
DROP POLICY IF EXISTS "Sellers can manage their own profile" ON sellers;
CREATE POLICY "Sellers can manage their own profile" 
ON sellers FOR ALL 
USING (auth.uid()::text = id::text);

DROP POLICY IF EXISTS "Public can view seller profiles" ON sellers;
CREATE POLICY "Public can view seller profiles" 
ON sellers FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow seller registration" ON sellers;
CREATE POLICY "Allow seller registration" 
ON sellers FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow seller authentication" ON sellers;
CREATE POLICY "Allow seller authentication" 
ON sellers FOR SELECT 
USING (true);

-- STEP 11: CREATE RLS POLICIES FOR PRODUCTS TABLE
-- =====================================================
DROP POLICY IF EXISTS "Sellers can manage their own products" ON products;
CREATE POLICY "Sellers can manage their own products" 
ON products FOR ALL 
USING (seller_id IN (SELECT id FROM sellers WHERE auth.uid()::text = id::text));

DROP POLICY IF EXISTS "Public can view all products" ON products;
CREATE POLICY "Public can view all products" 
ON products FOR SELECT 
USING (true);

-- STEP 12: CREATE RLS POLICIES FOR PRODUCT CATEGORIES
-- =====================================================
DROP POLICY IF EXISTS "Public can view all categories" ON product_categories;
CREATE POLICY "Public can view all categories" 
ON product_categories FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert categories" ON product_categories;
CREATE POLICY "Authenticated users can insert categories" 
ON product_categories FOR INSERT 
WITH CHECK (true);

-- STEP 13: CREATE TRIGGER FUNCTIONS
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- STEP 14: CREATE TRIGGERS
-- =====================================================
DROP TRIGGER IF EXISTS update_buyers_updated_at ON buyers;
CREATE TRIGGER update_buyers_updated_at 
  BEFORE UPDATE ON buyers 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_sellers_updated_at ON sellers;
CREATE TRIGGER update_sellers_updated_at 
  BEFORE UPDATE ON sellers 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at();

-- STEP 15: GRANT PERMISSIONS
-- =====================================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON buyers TO authenticated;
GRANT ALL ON sellers TO authenticated;
GRANT ALL ON products TO authenticated;
GRANT ALL ON product_categories TO authenticated;

-- STEP 16: VERIFICATION
-- =====================================================
SELECT '=== VERIFICATION RESULTS ===' as status;
