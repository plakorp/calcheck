#!/usr/bin/env node
/**
 * AI Description Generator — CheckKal
 *
 * Generates unique Thai descriptions for food pages using Claude API.
 * Fixes Google AdSense "low-value content" rejection by adding 120-180 word
 * unique descriptions per food page based on actual nutritional data.
 *
 * Idempotent: skips foods that already have description_th. Safe to re-run.
 *
 * Run: node scripts/generate-descriptions.mjs
 *
 * Env vars (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   ANTHROPIC_API_KEY           ← https://console.anthropic.com/
 *
 * Flags:
 *   --batch=N       foods per concurrent batch (default 5, max 10)
 *   --limit=N       total foods to process (default 1000)
 *   --category=X    specific category only (e.g. --category=snack)
 *   --dry-run       generate + print but don't write to DB
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
const args = Object.fromEntries(
  process.argv.slice(2)
    .filter(a => a.startsWith('--'))
    .map(a => {
      const [k, v] = a.slice(2).split('=')
      return [k, v ?? true]
    })
)

const BATCH_SIZE = Math.min(parseInt(args.batch ?? '5'), 10)
const LIMIT      = parseInt(args.limit ?? '1000')
const CATEGORY   = args.category ?? null
const DRY_RUN    = args['dry-run'] === true

// ---------- clients ----------
const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey  = process.env.SUPABASE_SERVICE_ROLE_KEY
const anthropicKey = process.env.ANTHROPIC_API_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}
if (!anthropicKey) {
  console.error('❌ Missing ANTHROPIC_API_KEY in .env.local')
  console.error('   เพิ่มบรรทัดนี้ใน .env.local:')
  console.error('   ANTHROPIC_API_KEY=sk-ant-...')
  console.error('   ดู key ได้ที่ https://console.anthropic.com/')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ---------- category labels ----------
const CATEGORY_LABELS = {
  protein:   'โปรตีน',
  carb:      'คาร์โบไฮเดรต',
  fat:       'ไขมัน',
  vegetable: 'ผัก',
  fruit:     'ผลไม้',
  snack:     'ขนม/ของว่าง',
  drink:     'เครื่องดื่ม',
  main:      'อาหารจานหลัก',
  dairy:     'นม/ผลิตภัณฑ์นม',
  spice:     'เครื่องเทศ',
}

// ---------- build prompt ----------
function buildPrompt(food) {
  const catLabel   = CATEGORY_LABELS[food.category] ?? food.category
  const macroTotal = (food.protein * 4) + (food.fat * 9) + (food.carbs * 4)
  const pPct = macroTotal > 0 ? Math.round((food.protein * 4 / macroTotal) * 100) : 0
  const fPct = macroTotal > 0 ? Math.round((food.fat    * 9 / macroTotal) * 100) : 0
  const cPct = macroTotal > 0 ? Math.round((food.carbs  * 4 / macroTotal) * 100) : 0

  // Derive key nutritional insight for context
  const isHighProtein = food.protein >= 15
  const isLowCal      = food.calories <= 100
  const isHighFiber   = food.fiber != null && food.fiber >= 5
  const isHighSodium  = food.sodium != null && food.sodium >= 600

  return `เขียนคำอธิบายภาษาไทยสำหรับหน้าเว็บโภชนาการของ "${food.name_th}"${food.name_en ? ` (${food.name_en})` : ''}

ข้อมูลโภชนาการต่อ ${food.serving_size ?? '100g'}:
- พลังงาน: ${Math.round(food.calories)} kcal
- โปรตีน: ${food.protein}g (${pPct}%)
- คาร์โบไฮเดรต: ${food.carbs}g (${cPct}%)
- ไขมัน: ${food.fat}g (${fPct}%)${food.fiber   != null ? `\n- ใยอาหาร: ${food.fiber}g` : ''}${food.sodium  != null ? `\n- โซเดียม: ${food.sodium}mg` : ''}${food.sugar   != null ? `\n- น้ำตาล: ${food.sugar}g` : ''}
- หมวดหมู่: ${catLabel}${food.brand ? `\n- แบรนด์: ${food.brand}` : ''}

จุดเด่น: ${[
  isHighProtein ? 'โปรตีนสูง' : '',
  isLowCal      ? 'แคลอรี่ต่ำ' : '',
  isHighFiber   ? 'ไฟเบอร์สูง' : '',
  isHighSodium  ? 'โซเดียมสูง ควรระวัง' : '',
].filter(Boolean).join(', ') || 'ทั่วไป'}

เขียน 3 ย่อหน้าสั้น (รวม 120-180 คำ) เป็น prose ไม่มีหัวข้อ:
1. อาหารนี้คืออะไร จุดเด่นทางโภชนาการ
2. เหมาะกับใคร / เป้าหมายสุขภาพไหน
3. แนะนำวิธีกิน ช่วงเวลา หรือ tips เพิ่มเติม

ภาษาไทยเป็นธรรมชาติ อ่านง่าย เป็นกันเอง ไม่ทางการ`
}

// ---------- call Claude API ----------
async function generateDescription(food) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key':         anthropicKey,
      'anthropic-version': '2023-06-01',
      'content-type':      'application/json',
    },
    body: JSON.stringify({
      model:      'claude-haiku-4-5',
      max_tokens: 450,
      messages:   [{ role: 'user', content: buildPrompt(food) }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude API ${res.status}: ${err.slice(0, 200)}`)
  }

  const data = await res.json()
  return data.content[0].text.trim()
}

// ---------- main ----------
async function main() {
  console.log('\n🤖  CheckKal — AI Description Generator')
  console.log(`    Batch: ${BATCH_SIZE} | Limit: ${LIMIT} | Category: ${CATEGORY ?? 'all'} | Dry-run: ${DRY_RUN}`)
  console.log('─'.repeat(60))

  // Fetch foods without description_th
  let query = supabase
    .from('foods')
    .select('id, name_th, name_en, slug, calories, protein, fat, carbs, fiber, sodium, sugar, serving_size, category, brand')
    .is('description_th', null)
    .order('category')
    .limit(LIMIT)

  if (CATEGORY) query = query.eq('category', CATEGORY)

  const { data: foods, error } = await query
  if (error) { console.error('❌ Supabase:', error.message); process.exit(1) }
  if (!foods.length) { console.log('✅ ทุก food มี description แล้ว!'); return }

  console.log(`📦 พบ ${foods.length} foods ที่ยังไม่มี description\n`)

  let done = 0, failed = 0

  for (let i = 0; i < foods.length; i += BATCH_SIZE) {
    const batch = foods.slice(i, i + BATCH_SIZE)

    await Promise.all(batch.map(async (food) => {
      try {
        const desc = await generateDescription(food)

        if (DRY_RUN) {
          console.log(`\n── ${food.name_th} ──\n${desc}\n`)
        } else {
          const { error: upErr } = await supabase
            .from('foods')
            .update({ description_th: desc })
            .eq('id', food.id)
          if (upErr) throw upErr
        }
        done++
        process.stdout.write(`\r✅ ${done}/${foods.length} done  ❌ ${failed} failed`)
      } catch (err) {
        failed++
        console.error(`\n❌ [${food.name_th}] ${err.message}`)
      }
    }))

    // 1.5s pause between batches → ~200 req/min max, safe for Haiku rate limits
    if (i + BATCH_SIZE < foods.length) {
      await new Promise(r => setTimeout(r, 1500))
    }
  }

  console.log(`\n\n🎉 เสร็จ! สร้าง: ${done} | ล้มเหลว: ${failed}`)
  if (DRY_RUN) console.log('   (dry-run — ไม่ได้เขียนลง DB)')
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
