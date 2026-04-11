-- CheckKal — Add fdc_id column for USDA FoodData Central integration
-- Run this once in Supabase SQL Editor before running import-usda.mjs
--
-- fdc_id is USDA's unique identifier (e.g. "171077" for chicken breast).
-- Partial unique index allows NULL for non-USDA records (OpenFoodFacts, manual entries).

ALTER TABLE foods ADD COLUMN IF NOT EXISTS fdc_id text;

-- Drop the partial index from a previous attempt (if exists) — can't be used for ON CONFLICT
DROP INDEX IF EXISTS idx_foods_fdc_id_unique;

-- Full UNIQUE constraint — required for ON CONFLICT(fdc_id) in upserts.
-- NULLs are allowed multiple times by default in Postgres, so non-USDA rows are unaffected.
ALTER TABLE foods
  DROP CONSTRAINT IF EXISTS foods_fdc_id_unique;
ALTER TABLE foods
  ADD CONSTRAINT foods_fdc_id_unique UNIQUE (fdc_id);
