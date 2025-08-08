-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  image VARCHAR(500),
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  brand VARCHAR(100),
  in_stock BOOLEAN DEFAULT true,
  discount INTEGER,
  category VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create buyers table
CREATE TABLE IF NOT EXISTS buyers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sellers table
CREATE TABLE IF NOT EXISTS sellers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  store_name VARCHAR(255) NOT NULL,
  gst_number VARCHAR(20),
  business_type VARCHAR(100),
  business_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cart table
CREATE TABLE IF NOT EXISTS cart (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyers ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for products (public read access)
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

-- Create RLS policies for buyers (user-specific access)
CREATE POLICY "Users can view their own buyer profile" ON buyers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own buyer profile" ON buyers
  FOR UPDATE USING (auth.uid() = id);

-- More permissive insert policy for development
CREATE POLICY "Allow buyer profile creation" ON buyers
  FOR INSERT WITH CHECK (true);

-- Alternative: Disable RLS for buyers table during development
-- ALTER TABLE buyers DISABLE ROW LEVEL SECURITY;

-- Create RLS policies for sellers (user-specific access)
CREATE POLICY "Users can view their own seller profile" ON sellers
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own seller profile" ON sellers
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own seller profile" ON sellers
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create RLS policies for cart (user-specific access)
CREATE POLICY "Users can view their own cart" ON cart
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" ON cart
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" ON cart
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" ON cart
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for products table
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for buyers table
CREATE TRIGGER update_buyers_updated_at BEFORE UPDATE ON buyers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for sellers table
CREATE TRIGGER update_sellers_updated_at BEFORE UPDATE ON sellers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample products data
INSERT INTO products (name, description, price, original_price, image, rating, review_count, brand, in_stock, discount, category) VALUES
-- Electronics Category
('Wireless Bluetooth Headphones', 'Premium noise-canceling headphones with 30-hour battery life', 89.99, 129.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.8, 1247, 'Sony', true, 31, 'Electronics'),
('Smart Home Security Camera', '1080p HD wireless camera with night vision and motion detection', 149.99, NULL, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.7, 567, 'Ring', true, NULL, 'Electronics'),
('Portable Bluetooth Speaker', 'Waterproof speaker with 360-degree sound and 20-hour battery', 64.99, 89.99, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.5, 445, 'JBL', true, 28, 'Electronics'),
('4K Smart TV 55"', 'Ultra HD display with built-in streaming apps and voice control', 599.99, 799.99, 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.9, 892, 'Samsung', true, 25, 'Electronics'),
('Gaming Laptop', 'High-performance laptop with RTX graphics and 16GB RAM', 1299.99, NULL, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.6, 334, 'ASUS', false, NULL, 'Electronics'),
('Wireless Charging Pad', 'Fast wireless charging pad compatible with all Qi-enabled devices', 29.99, 49.99, 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.4, 678, 'Anker', true, 40, 'Electronics'),
('Smart Watch Series 7', 'Advanced fitness tracking with heart rate monitor and GPS', 399.99, 499.99, 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.8, 1123, 'Apple', true, 20, 'Electronics'),
('Mechanical Gaming Keyboard', 'RGB backlit keyboard with customizable switches and macro keys', 129.99, NULL, 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.7, 445, 'Corsair', true, NULL, 'Electronics'),
('Wireless Gaming Mouse', 'High-precision gaming mouse with 25K DPI sensor', 79.99, 99.99, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.6, 567, 'Logitech', true, 20, 'Electronics'),
('USB-C Hub', '7-in-1 USB-C hub with HDMI, SD card reader, and USB ports', 39.99, NULL, 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.3, 234, 'Anker', true, NULL, 'Electronics'),
('Bluetooth Earbuds', 'True wireless earbuds with active noise cancellation', 159.99, 199.99, 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.7, 789, 'Sony', true, 20, 'Electronics'),
('Tablet Pro 10.5"', '10.5-inch tablet with 256GB storage and Apple Pencil support', 649.99, NULL, 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.8, 456, 'Apple', true, NULL, 'Electronics'),

-- Mobile Phones Category
('iPhone 15 Pro', 'Latest iPhone with A17 Pro chip and titanium design', 999.99, 1099.99, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.9, 2156, 'Apple', true, 9, 'Mobile Phones'),
('Samsung Galaxy S24', 'Android flagship with AI features and 200MP camera', 899.99, NULL, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.8, 1892, 'Samsung', true, NULL, 'Mobile Phones'),
('Google Pixel 8', 'Pure Android experience with advanced camera system', 699.99, 799.99, 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.7, 945, 'Google', true, 12, 'Mobile Phones'),
('OnePlus 12', 'Fast performance with Hasselblad camera system', 799.99, NULL, 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.6, 678, 'OnePlus', true, NULL, 'Mobile Phones'),
('Xiaomi 14 Ultra', 'Professional photography with Leica optics', 1199.99, 1299.99, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.8, 456, 'Xiaomi', true, 8, 'Mobile Phones'),
('Motorola Edge 40', '5G smartphone with 144Hz display', 449.99, 549.99, 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.5, 234, 'Motorola', true, 18, 'Mobile Phones'),

-- Gaming Category
('PlayStation 5', 'Next-gen gaming console with 4K graphics', 499.99, NULL, 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.9, 3456, 'Sony', true, NULL, 'Gaming'),
('Xbox Series X', 'Microsoft gaming console with Game Pass', 499.99, 599.99, 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.8, 2891, 'Microsoft', true, 17, 'Gaming'),
('Nintendo Switch OLED', 'Portable gaming with vibrant OLED screen', 349.99, NULL, 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.7, 1892, 'Nintendo', true, NULL, 'Gaming'),
('Gaming Headset Pro', '7.1 surround sound with noise cancellation', 129.99, 179.99, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.6, 567, 'SteelSeries', true, 28, 'Gaming'),
('Gaming Monitor 27"', '240Hz refresh rate with 1ms response time', 399.99, NULL, 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.8, 789, 'ASUS', true, NULL, 'Gaming'),
('Gaming Chair Elite', 'Ergonomic gaming chair with lumbar support', 299.99, 399.99, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.5, 456, 'SecretLab', true, 25, 'Gaming'),

-- Accessories Category
('Wireless Charger Stand', 'Fast charging stand for phones and watches', 49.99, 69.99, 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.4, 234, 'Anker', true, 29, 'Accessories'),
('Phone Case Premium', 'Shockproof case with MagSafe compatibility', 29.99, NULL, 'https://images.unsplash.com/photo-1603314585442-ee3b3c16fbcf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.3, 567, 'Spigen', true, NULL, 'Accessories'),
('Screen Protector Glass', '9H hardness tempered glass protector', 19.99, 29.99, 'https://images.unsplash.com/photo-1603314585442-ee3b3c16fbcf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.2, 345, 'ZAGG', true, 33, 'Accessories'),
('Car Mount Holder', 'Universal phone holder for car dashboard', 24.99, NULL, 'https://images.unsplash.com/photo-1603314585442-ee3b3c16fbcf?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.1, 123, 'iOttie', true, NULL, 'Accessories'),
('Power Bank 20000mAh', 'High-capacity portable charger with fast charging', 59.99, 79.99, 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.5, 678, 'RAVPower', true, 25, 'Accessories'),
('Bluetooth Car Adapter', 'Wireless audio adapter for car stereo', 34.99, NULL, 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.3, 234, 'Anker', true, NULL, 'Accessories'),

-- Home Appliances Category
('Smart Refrigerator', 'WiFi-enabled fridge with touchscreen display', 1299.99, 1499.99, 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.7, 456, 'Samsung', true, 13, 'Home Appliances'),
('Robot Vacuum Cleaner', 'AI-powered robot vacuum with mapping', 299.99, NULL, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.6, 789, 'iRobot', true, NULL, 'Home Appliances'),
('Air Purifier Pro', 'HEPA filter with air quality monitoring', 199.99, 249.99, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.5, 345, 'Dyson', true, 20, 'Home Appliances'),
('Smart Washing Machine', 'WiFi-connected washer with app control', 699.99, NULL, 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.4, 234, 'LG', true, NULL, 'Home Appliances'),
('Coffee Maker Smart', 'Programmable coffee maker with WiFi', 149.99, 199.99, 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.3, 567, 'Breville', true, 25, 'Home Appliances'),
('Microwave Oven', 'Countertop microwave with sensor cooking', 89.99, NULL, 'https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.2, 123, 'Panasonic', true, NULL, 'Home Appliances'),

-- Fashion Category
('Men''s Slim Fit Shirt', 'Premium cotton shirt with modern slim fit design', 49.99, 69.99, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.7, 892, 'Zara', true, 29, 'Men''s Clothing'),
('Men''s Denim Jeans', 'Classic blue denim jeans with perfect fit', 89.99, NULL, 'https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.7, 945, 'Levi''s', true, NULL, 'Men''s Clothing'),
('Men''s Polo Shirt', 'Classic polo shirt for casual and formal wear', 39.99, 59.99, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.6, 678, 'Tommy Hilfiger', true, 33, 'Men''s Clothing'),
('Men''s Casual Hoodie', 'Comfortable cotton hoodie for everyday wear', 69.99, 89.99, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.5, 789, 'Nike', true, 22, 'Men''s Clothing'),
('Men''s Winter Jacket', 'Warm and stylish winter jacket', 149.99, 199.99, 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.6, 456, 'The North Face', true, 25, 'Men''s Clothing'),

('Women''s Casual Dress', 'Elegant summer dress with floral pattern', 79.99, 99.99, 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.8, 1245, 'H&M', true, 20, 'Women''s Clothing'),
('Women''s Blouse', 'Elegant silk blouse for professional wear', 64.99, 84.99, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.6, 567, 'Uniqlo', true, 24, 'Women''s Clothing'),
('Women''s Skinny Jeans', 'Trendy skinny jeans with stretch fabric', 89.99, 119.99, 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.7, 678, 'Forever 21', true, 25, 'Women''s Clothing'),
('Women''s Summer Skirt', 'Light and breezy summer skirt', 54.99, 74.99, 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.5, 345, 'Zara', true, 27, 'Women''s Clothing'),
('Women''s Cardigan', 'Soft knit cardigan for layering', 74.99, 94.99, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.6, 234, 'H&M', true, 21, 'Women''s Clothing'),

('Kids'' Fashion T-Shirt', 'Comfortable cotton t-shirt for children', 24.99, NULL, 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.6, 456, 'Gap', true, NULL, 'Kids'' Fashion'),
('Kids'' Denim Jacket', 'Stylish denim jacket for children', 59.99, NULL, 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.4, 234, 'Gap', true, NULL, 'Kids'' Fashion'),
('Kids'' Summer Dress', 'Cute and comfortable summer dress for girls', 34.99, 44.99, 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.5, 123, 'Old Navy', true, 22, 'Kids'' Fashion'),
('Kids'' Winter Coat', 'Warm and cozy winter coat for children', 79.99, 99.99, 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.7, 345, 'Gap', true, 20, 'Kids'' Fashion'),

('Running Shoes Pro', 'Professional running shoes with cushioning technology', 129.99, 159.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.9, 2156, 'Nike', true, 19, 'Shoes'),
('Casual Sneakers', 'Comfortable sneakers for everyday wear', 79.99, 99.99, 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.5, 789, 'Adidas', true, 20, 'Shoes'),
('Women''s Heels', 'Elegant high heels for special occasions', 119.99, 149.99, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.7, 456, 'Forever 21', true, 20, 'Shoes'),
('Men''s Formal Shoes', 'Classic leather formal shoes', 149.99, 189.99, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.8, 567, 'Clarks', true, 21, 'Shoes'),
('Kids'' Sports Shoes', 'Comfortable sports shoes for active children', 59.99, 79.99, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.6, 234, 'Nike', true, 25, 'Shoes'),

('Designer Handbag', 'Luxury leather handbag with gold hardware', 299.99, 399.99, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.8, 678, 'Calvin Klein', true, 25, 'Bags'),
('Crossbody Bag', 'Versatile crossbody bag with adjustable strap', 89.99, NULL, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.5, 345, 'ASOS', true, NULL, 'Bags'),
('Laptop Backpack', 'Functional laptop backpack with multiple compartments', 69.99, 89.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.7, 456, 'Herschel', true, 22, 'Bags'),
('Travel Duffel Bag', 'Spacious duffel bag for travel and gym', 79.99, 99.99, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.6, 234, 'Adidas', true, 20, 'Bags'),
('Mini Clutch Bag', 'Elegant mini clutch for evening events', 49.99, 69.99, 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', 4.5, 123, 'ASOS', true, 28, 'Bags');
