-- Migration: create food_seeds table
-- Purpose: staging area for Thai food names before AI nutrition analysis
-- Run once on Supabase SQL editor

CREATE TABLE IF NOT EXISTS food_seeds (
  id            SERIAL PRIMARY KEY,
  name_th       TEXT NOT NULL UNIQUE,
  name_en       TEXT,
  category      TEXT CHECK (category IN ('protein','carb','fat','vegetable','fruit','snack','drink','main','dairy')),
  region        TEXT CHECK (region IN ('central','north','northeast','south','misc')),
  status        TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','done','error')),
  processed_at  TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_food_seeds_status   ON food_seeds (status);
CREATE INDEX IF NOT EXISTS idx_food_seeds_category ON food_seeds (category);
CREATE INDEX IF NOT EXISTS idx_food_seeds_region   ON food_seeds (region);

COMMENT ON TABLE food_seeds IS 'Seed list of Thai food names queued for AI nutrition analysis and bulk insert into foods table';
COMMENT ON COLUMN food_seeds.status IS 'pending=waiting, processing=AI running, done=inserted to foods, error=failed';
