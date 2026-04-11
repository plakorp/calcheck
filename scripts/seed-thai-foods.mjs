#!/usr/bin/env node
/**
 * seed-thai-foods.mjs
 * Bulk-inserts Thai food seeds into food_seeds table (idempotent)
 *
 * Prerequisites:
 *   1. Run create-food-seeds-table.sql on Supabase first
 *   2. Set env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 *      (or copy from calcheck/.env.local)
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   node calcheck/scripts/seed-thai-foods.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const seeds = JSON.parse(
  readFileSync(join(__dirname, 'seed-thai-foods.json'), 'utf8')
)

const BATCH_SIZE = 50

async function main() {
  console.log(`📦 Seeding ${seeds.length} Thai foods into food_seeds...`)

  let inserted = 0
  let skipped = 0
  let errors = 0

  for (let i = 0; i < seeds.length; i += BATCH_SIZE) {
    const batch = seeds.slice(i, i + BATCH_SIZE)

    const { data, error } = await supabase
      .from('food_seeds')
      .upsert(batch, {
        onConflict: 'name_th',
        ignoreDuplicates: true,
      })
      .select('id')

    if (error) {
      console.error(`❌ Batch ${i / BATCH_SIZE + 1} error:`, error.message)
      errors += batch.length
    } else {
      const insertedCount = data?.length ?? 0
      const skippedCount = batch.length - insertedCount
      inserted += insertedCount
      skipped += skippedCount
      console.log(
        `✅ Batch ${i / BATCH_SIZE + 1}/${Math.ceil(seeds.length / BATCH_SIZE)} — inserted: ${insertedCount}, skipped (dup): ${skippedCount}`
      )
    }
  }

  console.log('\n📊 Summary:')
  console.log(`  Total seeds:  ${seeds.length}`)
  console.log(`  Inserted:     ${inserted}`)
  console.log(`  Skipped dup:  ${skipped}`)
  console.log(`  Errors:       ${errors}`)

  if (errors > 0) {
    console.log('\n⚠️  Some batches failed. Check Supabase logs.')
    process.exit(1)
  } else {
    console.log('\n🎉 Done! food_seeds table is ready.')
  }
}

main()
