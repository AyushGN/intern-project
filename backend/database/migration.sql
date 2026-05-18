-- ================================================
-- Fresh Market - Complete Database Migration
-- Run this in Supabase SQL Editor
-- ================================================

-- 1. Create enums (skip if already exist)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('FARMER', 'CONSUMER', 'SHOP');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE product_category AS ENUM ('fruits', 'vegetables', 'grains', 'herbs', 'dairy', 'spices', 'other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Users table (skip if exists)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  role user_role DEFAULT 'CONSUMER' NOT NULL,
  location TEXT,
  store_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farmer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category product_category NOT NULL,
  image_url TEXT,
  stock_quantity INTEGER DEFAULT 0 NOT NULL,
  unit VARCHAR(50) DEFAULT 'kg',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consumer_id UUID REFERENCES users(id) ON DELETE SET NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  gst_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  status order_status DEFAULT 'pending' NOT NULL,
  shipping_name VARCHAR(255) NOT NULL,
  shipping_phone VARCHAR(20) NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_state VARCHAR(100) NOT NULL,
  shipping_pincode VARCHAR(10) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'cod',
  payment_status VARCHAR(50) DEFAULT 'pending',
  payment_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price_at_purchase DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL
);

-- 6. Auto-update timestamp function
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Triggers (skip if exist)
DO $$ BEGIN
  CREATE TRIGGER set_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER set_timestamp_products BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER set_timestamp_orders BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 8. Indexes
CREATE INDEX IF NOT EXISTS idx_products_farmer_id ON products(farmer_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_orders_consumer_id ON orders(consumer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- ================================================
-- Week 3: B2B Connectivity Extensions
-- ================================================

-- 9. Add Latitude and Longitude to Users table (for location radius queries)
ALTER TABLE users ADD COLUMN IF NOT EXISTS latitude DECIMAL(9, 6);
ALTER TABLE users ADD COLUMN IF NOT EXISTS longitude DECIMAL(9, 6);

-- 10. B2B Bulk Inquiries Table (Local Shop -> Farmer Connect)
CREATE TABLE IF NOT EXISTS b2b_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  farmer_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  unit VARCHAR(50) DEFAULT 'kg',
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Trigger for B2B inquiries updated_at
DO $$ BEGIN
  CREATE TRIGGER set_timestamp_b2b_inquiries BEFORE UPDATE ON b2b_inquiries FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Indexes for B2B inquiries
CREATE INDEX IF NOT EXISTS idx_b2b_inquiries_shop_id ON b2b_inquiries(shop_id);
CREATE INDEX IF NOT EXISTS idx_b2b_inquiries_farmer_id ON b2b_inquiries(farmer_id);

-- 11. Seed sample products (find your farmer user id first, then paste below)
-- First run: SELECT id FROM users WHERE role = 'FARMER' LIMIT 1;
-- Then replace 'YOUR_FARMER_ID' below with the actual UUID

-- INSERT INTO products (farmer_id, name, description, price, category, stock_quantity, unit, image_url)
-- VALUES
-- ('YOUR_FARMER_ID', 'Fresh Organic Tomatoes', 'Sun-ripened juicy red tomatoes from our farm', 45.00, 'vegetables', 100, 'kg', NULL),
-- ('YOUR_FARMER_ID', 'Alphonso Mangoes', 'Premium Alphonso mangoes, sweet and aromatic', 250.00, 'fruits', 50, 'dozen', NULL),
-- ('YOUR_FARMER_ID', 'Basmati Rice', 'Long grain premium basmati rice', 120.00, 'grains', 200, 'kg', NULL),
-- ('YOUR_FARMER_ID', 'Fresh Tulsi Leaves', 'Organically grown tulsi/holy basil', 30.00, 'herbs', 30, 'piece', NULL),
-- ('YOUR_FARMER_ID', 'Pure A2 Cow Milk', 'Fresh A2 milk from desi cows, delivered daily', 80.00, 'dairy', 80, 'ltr', NULL),
-- ('YOUR_FARMER_ID', 'Red Chilli Powder', 'Ground from sun-dried Byadgi chillis', 95.00, 'spices', 60, 'kg', NULL);

