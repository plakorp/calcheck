#!/usr/bin/env node
/**
 * Open Food Facts Importer — CheckKal
 *
 * Dumps Thailand-tagged products from Open Food Facts into Supabase `foods` table.
 * Idempotent: upserts by barcode. Safe to re-run.
 *
 * Run: node scripts/import-openfoodfacts.mjs
 *
 * Env vars (read from .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY   ← needed for bulk insert (bypasses RLS)
 *
 * Flags:
 *   --dry-run        fetch + map but don't write to DB
 *   --max-pages=N    stop after N pages (default 100)
 *   --page-size=N    items per page (default 100, max 1000)
 *   --start-page=N   resume from page N (default 1)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// ---------- load .env.local ----------
function loadEnv() {
  try {
    const raw = readFileSync(resolve(ROOT, '.env.local'), 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (!m) continue
      let val = m[2].trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!process.env[m[1]]) process.env[m[1]] = val
    }
  } catch (e) {
    console.warn('⚠️  could not read .env.local:', e.message)
  }
}
loadEnv()

// ---------- args ----------
const args = process.argv.slice(2)
const DRY_RUN = args.includes('--dry-run')
const MAX_PAGES = parseInt(args.find(a => a.startsWith('--max-pages='))?.split('=')[1] || '100', 10)
const PAGE_SIZE = parseInt(args.find(a => a.startsWith('--page-size='))?.split('=')[1] || '100', 10)
const START_PAGE = parseInt(args.find(a => a.startsWith('--start-page='))?.split('=')[1] || '1', 10)

// ---------- supabase ----------
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  console.error('   Get service role key from: Supabase Dashboard → Project Settings → API → service_role')
  process.exit(1)
}

const supabase = DRY_RUN ? null : createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
})

// ---------- category mapping (priority order, first match wins) ----------
const CATEGORY_RULES = [
  { cat: 'drink',     tags: ['en:beverages', 'en:drinks', 'en:waters', 'en:sodas', 'en:teas', 'en:coffees', 'en:juices'] },
  { cat: 'dairy',     tags: ['en:dairies', 'en:milks', 'en:yogurts', 'en:cheeses', 'en:creams'] },
  { cat: 'protein',   tags: ['en:meats', 'en:poultry', 'en:seafood', 'en:fishes', 'en:eggs', 'en:sausages', 'en:hams'] },
  { cat: 'fruit',     tags: ['en:fruits'] },
  { cat: 'vegetable', tags: ['en:vegetables', 'en:legumes'] },
  { cat: 'snack',     tags: ['en:snacks', 'en:biscuits', 'en:chocolates', 'en:candies', 'en:desserts', 'en:ice-creams', 'en:confectioneries'] },
  { cat: 'carb',      tags: ['en:cereals-and-potatoes', 'en:cereals', 'en:breads', 'en:pastas', 'en:rice', 'en:noodles', 'en:flours'] },
  { cat: 'fat',       tags: ['en:fats', 'en:oils', 'en:butters', 'en:margarines'] },
  { cat: 'main',      tags: ['en:meals', 'en:prepared-meals', 'en:ready-meals', 'en:soups', 'en:salads'] },
]

function mapCategory(categoriesTags = []) {
  if (!Array.isArray(categoriesTags)) return 'main'
  const set = new Set(categoriesTags)
  for (const rule of CATEGORY_RULES) {
    for (const t of rule.tags) {
      if (set.has(t)) return rule.cat
    }
  }
  return 'main'
}

// ---------- slug generator ----------
function slugify(s) {
  if (!s) return ''
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

// ---------- nutriment extractor ----------
function num(v) {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'number' ? v : parseFloat(String(v))
  return Number.isFinite(n) ? n : null
}

function mapProduct(p) {
  const n = p.nutriments || {}
  const calories = num(n['energy-kcal_100g']) ?? (num(n['energy_100g']) ? num(n['energy_100g']) / 4.184 : null)
  if (!calories || calories <= 0) return null

  const name_th = (p.product_name_th || '').trim()
  const name_en = (p.product_name_en || p.product_name || '').trim()
  const display_name = name_th || name_en
  if (!display_name) return null

  const barcode = (p.code || '').trim()
  if (!barcode) return null

  const baseSlug = slugify(name_en || name_th) || `food-${barcode}`
  const slug = `${baseSlug}-${barcode.slice(-6)}` // ensure uniqueness via barcode suffix

  return {
    name_th: name_th || name_en,
    name_en: name_en || null,
    slug,
    emoji: null,
    calories: Math.round(calories * 100) / 100,
    protein: num(n.proteins_100g) ?? 0,
    fat: num(n.fat_100g) ?? 0,
    carbs: num(n.carbohydrates_100g) ?? 0,
    fiber: num(n.fiber_100g),
    sodium: num(n.sodium_100g) != null ? num(n.sodium_100g) * 1000 : null, // g → mg
    sugar: num(n.sugars_100g),
    serving_size: p.serving_size || '100g',
    serving_weight_g: num(p.serving_quantity) ?? 100,
    category: mapCategory(p.categories_tags),
    subcategory: null,
    brand: (p.brands || '').split(',')[0]?.trim() || null,
    barcode,
    image_url: p.image_url || p.image_front_url || null,
    source: 'openfoodfacts',
    verified: true,
    tags: Array.isArray(p.categories_tags) ? p.categories_tags.slice(0, 10) : null,
  }
}

// ---------- fetcher ----------
const FIELDS = [
  'code', 'product_name', 'product_name_en', 'product_name_th',
  'brands', 'categories_tags', 'image_url', 'image_front_url',
  'serving_size', 'serving_quantity', 'nutriments',
].join(',')

async function fetchPage(page, attempt = 1) {
  const url = `https://world.openfoodfacts.org/api/v2/search?countries_tags=thailand&page=${page}&page_size=${PAGE_SIZE}&fields=${FIELDS}`
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'CheckKal-Importer/1.0 (https://checkkal.com)' },
      signal: AbortSignal.timeout(30000), // 30s timeout
    })
    if (res.status === 503 || res.status === 429 || res.status === 502 || res.status === 504) {
      throw new Error(`HTTP ${res.status} at page ${page} (retryable)`)
    }
    if (!res.ok) throw new Error(`HTTP ${res.status} at page ${page}`)
    return res.json()
  } catch (e) {
    if (attempt < 4) {
      const backoff = Math.pow(2, attempt) * 1000 // 2s, 4s, 8s
      console.log(`   ⏳ page ${page} attempt ${attempt} failed (${e.message}), retrying in ${backoff/1000}s...`)
      await new Promise(r => setTimeout(r, backoff))
      return fetchPage(page, attempt + 1)
    }
    throw e
  }
}

// ---------- main ----------
async function main() {
  console.log('🥗 CheckKal — Open Food Facts importer')
  console.log(`   mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`)
  console.log(`   page range: ${START_PAGE} → max ${START_PAGE + MAX_PAGES - 1}`)
  console.log(`   page size: ${PAGE_SIZE}`)
  console.log('')

  let totalFetched = 0
  let totalMapped = 0
  let totalSkipped = 0
  let totalUpserted = 0
  let totalErrors = 0

  for (let page = START_PAGE; page < START_PAGE + MAX_PAGES; page++) {
    let data
    try {
      data = await fetchPage(page)
    } catch (e) {
      console.error(`❌ fetch page ${page} failed:`, e.message)
      totalErrors++
      if (totalErrors > 10) {
        console.error('   too many errors, stopping.')
        break
      }
      await new Promise(r => setTimeout(r, 5000))
      continue
    }

    const products = data.products || []
    if (products.length === 0) {
      console.log(`✅ page ${page}: empty — reached end.`)
      break
    }

    totalFetched += products.length
    const mapped = []
    for (const p of products) {
      const m = mapProduct(p)
      if (m) mapped.push(m)
      else totalSkipped++
    }
    totalMapped += mapped.length

    if (!DRY_RUN && mapped.length > 0) {
      const { error, count } = await supabase
        .from('foods')
        .upsert(mapped, { onConflict: 'barcode', ignoreDuplicates: false, count: 'exact' })

      if (error) {
        console.error(`❌ upsert page ${page}:`, error.message)
        totalErrors++
      } else {
        totalUpserted += count ?? mapped.length
      }
    }

    console.log(`page ${page}: fetched=${products.length} mapped=${mapped.length} skipped=${products.length - mapped.length} total_upserted=${totalUpserted}`)

    // rate limit — 1 req/sec to be polite
    await new Promise(r => setTimeout(r, 1000))
  }

  console.log('')
  console.log('📊 Summary')
  console.log(`   fetched : ${totalFetched}`)
  console.log(`   mapped  : ${totalMapped}`)
  console.log(`   skipped : ${totalSkipped}  (no barcode / no calories / no name)`)
  console.log(`   upserted: ${totalUpserted}  ${DRY_RUN ? '(dry run)' : ''}`)
  console.log(`   errors  : ${totalErrors}`)
}

main().catch(e => {
  console.error('💥 fatal:', e)
  process.exit(1)
})
