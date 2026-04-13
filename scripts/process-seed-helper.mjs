#!/usr/bin/env node
/**
 * process-seed-helper.mjs — CheckKal Phase 3 Data Growth
 *
 * Used by Claude Code scheduled task to process food_seeds → foods.
 *
 * Modes:
 *   --fetch [N]       Read N pending seeds (default 20), print JSON to stdout
 *   --insert <file>   Read JSON results file, insert into foods + mark seeds done
 *   --test-fetch [N]  Same as --fetch but only prints (no side effects, alias)
 *
 * Typical workflow (Claude Code scheduled task):
 *   1. node scripts/process-seed-helper.mjs --fetch 20   → get seed list
 *   2. Claude estimates nutrition for each item
 *   3. Claude writes results to /tmp/seed-results.json
 *   4. node scripts/process-seed-helper.mjs --insert /tmp/seed-results.json
 *
 * Env (read from .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  ← required for insert (bypasses RLS)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// ---------- load .env.local ----------
function loadEnv() {
  const envPath = resolve(ROOT, '.env.local')
  let raw
  try {
    raw = readFileSync(envPath, 'utf8')
  } catch {
    // fall back to process.env (e.g. in CI / Vercel)
    return
  }
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    const val = trimmed.slice(idx + 1).trim()
    if (!process.env[key]) process.env[key] = val
  }
}

loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// ---------- slugify ----------
function slugify(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

// ---------- MODE: fetch ----------
async function fetchSeeds(limit = 20) {
  const { data, error } = await supabase
    .from('food_seeds')
    .select('id, name_th, name_en, category, region')
    .eq('status', 'pending')
    .order('id', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('❌ fetch error:', error.message)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.log(JSON.stringify({ status: 'empty', message: 'No pending seeds', items: [] }, null, 2))
    return
  }

  const output = {
    status: 'ok',
    count: data.length,
    instructions: [
      'For each item in `items`, estimate nutrition per 100g (or per serving if serving_size is given).',
      'Fill in: calories, protein, fat, carbs, fiber, sodium, sugar (all numeric, kcal/g/mg).',
      'Also fill: emoji (1 char), name_en (if missing), slug (lowercase-hyphen from name_en), description_th (1 sentence Thai).',
      'Use serving_weight_g = 100 unless serving_size implies otherwise.',
      'Keep seed_id exactly as given. Do NOT modify any other fields.',
      'Return the completed array as JSON to: /tmp/checkkal-seed-results.json',
    ],
    items: data.map((s) => ({
      seed_id: s.id,
      name_th: s.name_th,
      name_en: s.name_en || '',
      category: s.category || 'main',
      region: s.region || null,
      subcategory: null,
      brand: null,
      serving_size: '100g',
      notes: null,
      // Fields for Claude to fill:
      emoji: '',
      slug: slugify(s.name_en || s.name_th),
      calories: null,
      protein: null,
      fat: null,
      carbs: null,
      fiber: null,
      sodium: null,
      sugar: null,
      serving_weight_g: 100,
      description_th: '',
    })),
  }

  console.log(JSON.stringify(output, null, 2))
}

// ---------- MODE: insert ----------
async function insertResults(filePath) {
  let raw
  try {
    raw = readFileSync(resolve(filePath), 'utf8')
  } catch (e) {
    console.error('❌ Cannot read file:', filePath, e.message)
    process.exit(1)
  }

  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch (e) {
    console.error('❌ Invalid JSON:', e.message)
    process.exit(1)
  }

  // Support both array and { items: [] } format
  const items = Array.isArray(parsed) ? parsed : parsed.items ?? []

  if (items.length === 0) {
    console.log('⚠️  No items to insert.')
    return
  }

  const seedIds = []
  const insertRows = []
  const errors = []

  for (const item of items) {
    if (!item.seed_id) {
      errors.push({ item, reason: 'missing seed_id' })
      continue
    }
    if (item.calories == null || item.protein == null) {
      errors.push({ item: item.name_th, reason: 'missing calories or protein' })
      continue
    }

    const slug = item.slug || slugify(item.name_en || item.name_th)

    insertRows.push({
      name_th: item.name_th,
      name_en: item.name_en || null,
      emoji: item.emoji || '🍽️',
      calories: Number(item.calories),
      protein: Number(item.protein),
      fat: Number(item.fat ?? 0),
      carbs: Number(item.carbs ?? 0),
      fiber: item.fiber != null ? Number(item.fiber) : null,
      sodium: item.sodium != null ? Number(item.sodium) : null,
      sugar: item.sugar != null ? Number(item.sugar) : null,
      serving_size: item.serving_size || '100g',
      serving_weight_g: Number(item.serving_weight_g ?? 100),
      category: item.category || 'main',
      subcategory: item.subcategory || null,
      brand: item.brand || null,
      source: 'ai-estimated',
      verified: false,
      tags: item.description_th ? [item.description_th.slice(0, 60)] : [],
      // slug stored as name_en for URL — keep it clean
      ...(slug ? { name_en: slug } : {}),
    })

    seedIds.push(item.seed_id)
  }

  // Insert into foods (upsert by name_th+category to avoid duplicates)
  let insertedCount = 0
  if (insertRows.length > 0) {
    const { data: inserted, error: insertError } = await supabase
      .from('foods')
      .upsert(insertRows, { onConflict: 'name_en', ignoreDuplicates: false })
      .select('id, name_th')

    if (insertError) {
      console.error('❌ Insert error:', insertError.message)
      // Don't exit — still try to mark seeds done for those that may have worked
    } else {
      insertedCount = inserted?.length ?? insertRows.length
      console.log(`✅ Inserted/updated ${insertedCount} foods`)
    }
  }

  // Mark seeds as done
  if (seedIds.length > 0) {
    const { error: updateError } = await supabase
      .from('food_seeds')
      .update({ status: 'done', processed_at: new Date().toISOString() })
      .in('id', seedIds)

    if (updateError) {
      console.error('❌ Seed update error:', updateError.message)
    } else {
      console.log(`✅ Marked ${seedIds.length} seeds as done`)
    }
  }

  if (errors.length > 0) {
    console.warn(`⚠️  Skipped ${errors.length} items:`)
    for (const e of errors) console.warn('  -', e.item, '→', e.reason)
  }

  console.log('\n📊 Summary:')
  console.log(`  Processed: ${items.length} seeds`)
  console.log(`  Inserted:  ${insertedCount} foods`)
  console.log(`  Skipped:   ${errors.length} items`)
}

// ---------- CLI ----------
const args = process.argv.slice(2)
const mode = args[0]

if (!mode || mode === '--help') {
  console.log(`
Usage:
  node scripts/process-seed-helper.mjs --fetch [N]
  node scripts/process-seed-helper.mjs --insert <results.json>

Examples:
  node scripts/process-seed-helper.mjs --fetch 5
  node scripts/process-seed-helper.mjs --insert /tmp/checkkal-seed-results.json
`)
  process.exit(0)
}

if (mode === '--fetch' || mode === '--test-fetch') {
  const n = parseInt(args[1], 10) || 20
  await fetchSeeds(n)
} else if (mode === '--insert') {
  if (!args[1]) {
    console.error('❌ --insert requires a file path')
    process.exit(1)
  }
  await insertResults(args[1])
} else {
  console.error('❌ Unknown mode:', mode)
  process.exit(1)
}
