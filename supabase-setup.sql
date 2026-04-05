-- CalCheck: Supabase Database Setup
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Foods table
CREATE TABLE IF NOT EXISTS foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_th TEXT NOT NULL,
  name_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  emoji TEXT DEFAULT '🍽️',
  calories NUMERIC NOT NULL DEFAULT 0,
  protein NUMERIC NOT NULL DEFAULT 0,
  fat NUMERIC NOT NULL DEFAULT 0,
  carbs NUMERIC NOT NULL DEFAULT 0,
  fiber NUMERIC,
  sodium NUMERIC,
  sugar NUMERIC,
  serving_size TEXT NOT NULL DEFAULT '100g',
  serving_weight_g NUMERIC,
  category TEXT NOT NULL DEFAULT 'main',
  subcategory TEXT,
  brand TEXT,
  barcode TEXT,
  image_url TEXT,
  source TEXT NOT NULL DEFAULT 'manual',
  verified BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- Indexes for fast search + SEO
CREATE INDEX idx_foods_slug ON foods(slug);
CREATE INDEX idx_foods_category ON foods(category);
CREATE INDEX idx_foods_brand ON foods(brand);
CREATE INDEX idx_foods_name_th ON foods USING gin(to_tsvector('simple', name_th));
CREATE INDEX idx_foods_tags ON foods USING gin(tags);
CREATE INDEX idx_foods_calories ON foods(calories);
CREATE INDEX idx_foods_barcode ON foods(barcode);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER foods_updated_at
  BEFORE UPDATE ON foods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;

-- Public read access (for the website)
CREATE POLICY "Public read access" ON foods
  FOR SELECT USING (true);

-- Admin write access (for Korn)
CREATE POLICY "Admin insert" ON foods
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin update" ON foods
  FOR UPDATE USING (true);

CREATE POLICY "Admin delete" ON foods
  FOR DELETE USING (true);

-- View for SEO: all food slugs for sitemap generation
CREATE OR REPLACE VIEW food_slugs AS
  SELECT slug, category, updated_at FROM foods ORDER BY updated_at DESC;
