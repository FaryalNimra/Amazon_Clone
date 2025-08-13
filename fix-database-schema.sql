-- Fix Database Schema Script
-- Run this in your Supabase SQL Editor if you have schema issues

-- First, let's check what we currently have
SELECT '=== CURRENT SCHEMA STATUS ===' as status;

-- Check if products table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') 
    THEN '✅ Products table exists' 
    ELSE '❌ Products table does not exist' 
  END as table_status;

-- If table exists, check its columns
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
    RAISE NOTICE 'Products table exists, checking columns...';
    
    -- Check for required columns
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'seller_id') THEN
      RAISE NOTICE 'Adding missing seller_id column...';
      ALTER TABLE products ADD COLUMN seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'image_url') THEN
      RAISE NOTICE 'Adding missing image_url column...';
      ALTER TABLE products ADD COLUMN image_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'updated_at') THEN
      RAISE NOTICE 'Adding missing updated_at column...';
      ALTER TABLE products ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    RAISE NOTICE 'Column check completed!';
  ELSE
    RAISE NOTICE 'Products table does not exist, creating it...';
    
    -- Create the products table with all required columns
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
    
    -- Create indexes
    CREATE INDEX idx_products_seller_id ON products(seller_id);
    CREATE INDEX idx_products_category ON products(category);
    CREATE INDEX idx_products_created_at ON products(created_at);
    CREATE INDEX idx_products_price ON products(price);
    
    RAISE NOTICE 'Products table created successfully!';
  END IF;
END $$;

-- Enable RLS if not already enabled
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies if they don't exist
DO $$
BEGIN
  -- Policy for sellers to manage their own products
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'products' AND policyname = 'Sellers can manage their own products') THEN
    CREATE POLICY "Sellers can manage their own products" 
    ON products FOR ALL 
    USING (auth.uid() = seller_id);
    RAISE NOTICE 'Created RLS policy: Sellers can manage their own products';
  END IF;
  
  -- Policy for public to view all products
  IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename = 'products' AND policyname = 'Public can view all products') THEN
    CREATE POLICY "Public can view all products" 
    ON products FOR SELECT 
    USING (true);
    RAISE NOTICE 'Created RLS policy: Public can view all products';
  END IF;
END $$;

-- Create trigger function for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_trigger WHERE tgname = 'update_products_updated_at') THEN
    CREATE TRIGGER update_products_updated_at 
      BEFORE UPDATE ON products 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column();
    RAISE NOTICE 'Created updated_at trigger';
  END IF;
END $$;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON products TO authenticated;

-- Final verification
SELECT '=== FINAL VERIFICATION ===' as status;

-- Check table structure
SELECT 'Products table columns:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Check RLS policies
SELECT 'RLS policies:' as info;
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'products';

-- Check triggers
SELECT 'Triggers:' as info;
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'products';

SELECT '=== SCHEMA FIX COMPLETED ===' as status;

